import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { clearAuthSession, getAuthToken } from "../../services/authSession";

const AdminUsersList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ users: [], drivers: [] });
  const [activeTab, setActiveTab] = useState("user"); // 'user' ya 'driver'
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/accounts", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setData({
          users: result.users || [],
          drivers: result.drivers || [],
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchAccounts, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const currentList = activeTab === "user" ? data.users : data.drivers;

  return (
    <AdminLayout>
      <div style={{ padding: "20px", maxWidth: "850px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => setActiveTab("user")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #059669",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: activeTab === "user" ? "#059669" : "#ffffff",
              color: activeTab === "user" ? "#ffffff" : "#059669",
            }}
          >
            Registered Users ({data.users.length})
          </button>

          <button
            onClick={() => setActiveTab("driver")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #059669",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: activeTab === "driver" ? "#059669" : "#ffffff",
              color: activeTab === "driver" ? "#ffffff" : "#059669",
            }}
          >
            Registered Drivers ({data.drivers.length})
          </button>
        </div>

        {loading ? (
          <p>Loading records...</p>
        ) : currentList.length === 0 ? (
          <p>No registered {activeTab}s found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {currentList.map((item) => {
              const initial = item.name ? item.name.charAt(0).toUpperCase() : "U";

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: activeTab === "user" ? "#059669" : "#1e40af",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      {initial}
                    </div>

                    <div>
                      <div style={{ fontWeight: "600", fontSize: "15px", color: "#111827" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6b7280" }}>
                        {item.email} {item.phone ? `• ${item.phone}` : ""}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: "#e5e7eb",
                      color: "#374151",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.role}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "12px 16px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
          }}
          className="admin-settings-mobile-logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersList;