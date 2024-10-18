import React, { useState, useEffect } from "react";
import { database, getAuth, ref, onValue, update } from "../../firebase"; // Import Firebase setup

const ProfileManagement = ({ onClose }) => {
  const [userDetails, setUserDetails] = useState({});
  const [activeTab, setActiveTab] = useState("account"); // To toggle between tabs
  const [orderHistory, setOrderHistory] = useState([]);
  const user = getAuth().currentUser; // Get current user

  // Fetch user details from Firebase
  useEffect(() => {
    const userRef = ref(database, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserDetails(snapshot.val());
      }
    });
  }, [user.uid]);

  // Fetch order history from Firebase
  useEffect(() => {
    const ordersRef = ref(database, "orders");
    onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const orders = snapshot.val();
        const userOrders = Object.keys(orders)
          .filter((key) => orders[key].customerId === user.uid)
          .map((key) => ({ id: key, ...orders[key] }));
        setOrderHistory(userOrders);
      }
    });
  }, [user.uid]);

  // Handle account details update (except email)
  const handleUpdateDetails = () => {
    const userRef = ref(database, `users/${user.uid}`);
    update(userRef, userDetails).then(() => {
      alert("Account details updated successfully!");
    });
  };

  return (
    <div className="profile-management">
      <h2>Profile Management</h2>

      {/* Tabs for Account Settings and Order History */}
      <div className="tabs">
        <button onClick={() => setActiveTab("account")}>Account Settings</button>
        <button onClick={() => setActiveTab("history")}>Order History</button>
      </div>

      {/* Account Settings Tab */}
      {activeTab === "account" && (
        <div className="account-settings">
          <h3>Account Settings</h3>
          <p>Email: {user.email}</p> {/* Email cannot be changed */}
          <input
            type="text"
            placeholder="Name"
            value={userDetails.name || ""}
            onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Student ID"
            value={userDetails.studentId || ""}
            onChange={(e) => setUserDetails({ ...userDetails, studentId: e.target.value })}
          />
          <input
            type="text"
            placeholder="Program"
            value={userDetails.program || ""}
            onChange={(e) => setUserDetails({ ...userDetails, program: e.target.value })}
          />
          <button onClick={handleUpdateDetails}>Update Details</button>
        </div>
      )}

      {/* Order History Tab */}
      {activeTab === "history" && (
        <div className="order-history">
          <h3>Order History</h3>
          {orderHistory.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <ul>
              {orderHistory.map((order) => (
                <li key={order.id}>
                  <p>Order ID: {order.id}</p>
                  <p>Total Price: ₱{order.orderPrice}</p>
                  <p>Status: {order.status}</p>
                  <ul>
                    {order.products.map((product, index) => (
                      <li key={index}>
                        {product.name} (x{product.quantity})
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;
