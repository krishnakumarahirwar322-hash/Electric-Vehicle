const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware import add kar diya h
const roleMiddleware = require("../middleware/roleMiddleware");
const Stripe = require("stripe");

const getStripeClient = () => {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

router.post("/stripe-checkout", authMiddleware, roleMiddleware("user"), (req, res) => {
    const stripe = getStripeClient();
    if (!stripe) {
        return res.status(503).json({ success: false, message: "Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env and restart the server." });
    }

    const rideId = Number(req.body.ride_id);
    if (!Number.isInteger(rideId) || rideId < 1) {
        return res.status(400).json({ success: false, message: "A valid ride_id is required" });
    }

    const sql = `
        SELECT r.id, r.user_id, r.fare, r.status,
            EXISTS (SELECT 1 FROM payments p WHERE p.ride_id = r.id AND p.payment_status = 'paid') AS already_paid
        FROM rides r
        WHERE r.id = ? AND r.user_id = ?
        LIMIT 1
    `;
    db.query(sql, [rideId, req.user.id], async (err, rides) => {
        if (err) {
            console.error("Stripe checkout ride lookup failed:", err.message);
            return res.status(500).json({ success: false, message: "Could not load ride for payment" });
        }
        if (!rides.length) return res.status(404).json({ success: false, message: "Ride not found" });
        const ride = rides[0];
        if (ride.status !== "completed") {
            return res.status(400).json({ success: false, message: "Payment is available after the ride is completed" });
        }
        if (ride.already_paid) return res.status(409).json({ success: false, message: "This ride is already paid" });

        const amount = Math.round(Number(ride.fare) * 100);
        if (!Number.isFinite(amount) || amount < 50) {
            return res.status(400).json({ success: false, message: "Ride fare is too low for Stripe Checkout" });
        }
        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
        try {
            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: [{
                    quantity: 1,
                    price_data: {
                        currency: "inr",
                        unit_amount: amount,
                        product_data: { name: `VoltRide trip #${ride.id}` }
                    }
                }],
                metadata: { ride_id: String(ride.id), user_id: String(req.user.id) },
                success_url: `${frontendUrl}/user/history?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${frontendUrl}/user/history?payment=cancelled`
            });
            return res.json({ success: true, checkoutUrl: session.url });
        } catch (stripeError) {
            console.error("Stripe checkout creation failed:", stripeError.message);
            return res.status(502).json({ success: false, message: "Stripe could not create checkout. Verify STRIPE_SECRET_KEY and account currency support." });
        }
    });
});

router.post("/stripe-confirm", authMiddleware, roleMiddleware("user"), (req, res) => {
    const stripe = getStripeClient();
    if (!stripe) {
        return res.status(503).json({ success: false, message: "Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env and restart the server." });
    }

    const sessionId = String(req.body.session_id || "").trim();
    if (!sessionId) return res.status(400).json({ success: false, message: "Stripe session_id is required" });

    stripe.checkout.sessions.retrieve(sessionId).then((session) => {
        if (session.payment_status !== "paid" || session.mode !== "payment" || session.metadata?.user_id !== String(req.user.id)) {
            return res.status(400).json({ success: false, message: "Stripe payment could not be verified for this account" });
        }

        const rideId = Number(session.metadata.ride_id);
        db.query("SELECT id, fare, status FROM rides WHERE id = ? AND user_id = ? LIMIT 1", [rideId, req.user.id], (rideError, rides) => {
            if (rideError) return res.status(500).json({ success: false, message: "Could not verify the ride" });
            if (!rides.length || rides[0].status !== "completed") {
                return res.status(400).json({ success: false, message: "Completed ride not found for this payment" });
            }
            const expectedAmount = Math.round(Number(rides[0].fare) * 100);
            if (session.amount_total !== expectedAmount) {
                return res.status(400).json({ success: false, message: "Payment amount does not match the ride fare" });
            }

            db.query("SELECT id FROM payments WHERE ride_id = ? AND payment_status = 'paid' LIMIT 1", [rideId], (paymentError, payments) => {
                if (paymentError) return res.status(500).json({ success: false, message: "Could not check payment status" });
                if (payments.length) return res.json({ success: true, message: "Payment already confirmed" });

                const fare = Number(rides[0].fare);
                const platformShare = Number((fare * 0.8).toFixed(2));
                const driverSettlement = Number((fare - platformShare).toFixed(2));
                db.query(
                    "INSERT INTO payments (ride_id, amount, payment_method, payment_status, platform_share, driver_settlement) VALUES (?, ?, 'stripe', 'paid', ?, ?)",
                    [rideId, fare, platformShare, driverSettlement],
                    (insertError, result) => {
                        if (insertError) {
                            console.error("Stripe payment record failed:", insertError.message);
                            return res.status(500).json({ success: false, message: "Payment succeeded but could not be recorded. Contact support." });
                        }
                        return res.json({ success: true, message: "Payment confirmed", paymentId: result.insertId });
                    }
                );
            });
        });
    }).catch((stripeError) => {
        console.error("Stripe payment confirmation failed:", stripeError.message);
        return res.status(400).json({ success: false, message: "Stripe session is invalid or could not be verified" });
    });
});

// ================= CREATE PAYMENT =================
router.post(
    "/",
    authMiddleware,
    (req, res) => {
        const {
            ride_id,
            amount,
            payment_method
        } = req.body;

        if (!ride_id || !amount || !payment_method) {
            return res.status(400).json({
                success: false,
                message: "ride_id, amount and payment_method are required"
            });
        }

        const checkRideSql = `
            SELECT id, user_id, fare, status
            FROM rides
            WHERE id = ?
        `;

        db.query(
            checkRideSql,
            [ride_id],
            (err, rides) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (rides.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Ride not found"
                    });
                }

                const ride = rides[0];
                console.log("Ride User ID:", ride.user_id);
                console.log("Logged In User ID:", req.user.id);
                

                if (ride.status !== "completed") {
                    return res.status(400).json({
                        success: false,
                        message: "Payment can only be made after ride completion"
                    });
                }

                if (ride.user_id !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: "You cannot pay for this ride"
                    });
                }

                const sql = `
                    INSERT INTO payments
                    (
                        ride_id,
                        amount,
                        payment_method,
                        payment_status
                    )
                    VALUES (?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        ride_id,
                        amount,
                        payment_method,
                        "paid"
                    ],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({
                                success: false,
                                message: "Payment failed",
                                error: err.message
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Payment successful",
                            paymentId: result.insertId
                        });
                    }
                );
            }
        );
    }
);

// ================= GET PAYMENT BY RIDE =================
router.get("/ride/:rideId", (req, res) => {
    const rideId = req.params.rideId;

    const sql = `
        SELECT *
        FROM payments
        WHERE ride_id = ?
    `;

    db.query(
        sql,
        [rideId],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch payment"
                });
            }

            res.json({
                success: true,
                payments: results
            });
        }
    );
});

module.exports = router;