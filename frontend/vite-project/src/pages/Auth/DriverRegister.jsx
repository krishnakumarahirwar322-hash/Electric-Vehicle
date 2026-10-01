import { useState } from "react";
import { Link } from "react-router-dom";
import { CarFront, Zap } from "lucide-react";
import { applyForDriver } from "../../services/driverService";
import "./Signup.css";
import "./DriverRegister.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  license_no: "",
  model: "",
  vehicle_number: "",
  vehicle_type: "Electric Car",
  price_per_km: "12",
};

const DriverRegister = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await applyForDriver({ ...formData, price_per_km: Number(formData.price_per_km) });
      setSubmitted(true);
      setFormData(initialForm);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Driver application could not be submitted. Check the backend connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page driver-application-page">
      <section className="signup-container driver-application-container">
        <div className="signup-logo">
          <div className="signup-logo-icon"><Zap size={23} fill="currentColor" /></div>
          <h1>VoltRide</h1>
        </div>

        <header className="signup-heading">
          <h2>Apply to drive</h2>
          <p>Send your driver and vehicle details for admin review.</p>
        </header>

        {submitted ? (
          <div className="driver-application-success" role="status">
            <CarFront size={28} />
            <h3>Application sent</h3>
            <p>Your application is pending admin approval. You can sign in after it is approved.</p>
            <Link to="/login">Back to login</Link>
          </div>
        ) : (
          <form className="driver-application-form" onSubmit={handleSubmit}>
            <div className="signup-field">
              <label htmlFor="driver-name">Full name</label>
              <input id="driver-name" name="name" value={formData.name} onChange={handleChange} autoComplete="name" maxLength={100} required />
            </div>
            <div className="signup-field">
              <label htmlFor="driver-email">Email</label>
              <input id="driver-email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" maxLength={100} required />
            </div>
            <div className="signup-field">
              <label htmlFor="driver-phone">Phone number</label>
              <input id="driver-phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} autoComplete="tel" maxLength={20} required />
            </div>
            <div className="signup-field">
              <label htmlFor="driver-password">Password</label>
              <input id="driver-password" name="password" type="password" value={formData.password} onChange={handleChange} autoComplete="new-password" minLength={8} maxLength={72} required />
            </div>
            <div className="signup-field">
              <label htmlFor="driver-license">Driving licence number</label>
              <input id="driver-license" name="license_no" value={formData.license_no} onChange={handleChange} maxLength={50} required />
            </div>
            <div className="signup-field">
              <label htmlFor="driver-vehicle-model">Vehicle model</label>
              <input id="driver-vehicle-model" name="model" value={formData.model} onChange={handleChange} maxLength={100} required />
            </div>
            <div className="signup-field">
              <label htmlFor="driver-vehicle-number">Vehicle registration</label>
              <input id="driver-vehicle-number" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} maxLength={50} required />
            </div>
            <div className="signup-field">
              <label htmlFor="driver-vehicle-type">Vehicle type</label>
              <select id="driver-vehicle-type" name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} required>
                <option>Electric Car</option>
                <option>Electric Scooter</option>
                <option>Electric Bike</option>
                <option>Electric Auto</option>
              </select>
            </div>
            <div className="signup-field driver-application-wide">
              <label htmlFor="driver-price">Fare per kilometre (Rs.)</label>
              <input id="driver-price" name="price_per_km" type="number" min="1" max="10000" step="0.01" value={formData.price_per_km} onChange={handleChange} required />
            </div>
            {error && <p className="driver-application-error driver-application-wide" role="alert">{error}</p>}
            <button className="signup-submit-button driver-application-wide" type="submit" disabled={loading}>
              {loading ? "Sending application..." : "Submit for approval"}
            </button>
          </form>
        )}

        <div className="signup-bottom-text">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      </section>
    </main>
  );
};

export default DriverRegister;