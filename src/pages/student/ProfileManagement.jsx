import React, { useState, useEffect } from "react";
import { database, getAuth, ref, onValue, update, logout } from "../../firebase"; // Import Firebase setup and logout function

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

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout(); // Call Firebase logout function
      alert("Logged out successfully!");
      onClose(); // Close the profile management sidebar after logging out
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="fixed top-0 right-0 w-[400px] h-full bg-white shadow-lg z-50">
      <div className="p-4 bg-custom-gray text-white flex justify-between items-center">
        <h2 className="text-lg font-bold">Profile Management</h2>
        <button onClick={onClose} className="text-4xl">&times;</button>
      </div>

      {/* Tabs for Account Settings and Order History */}
      <div className="flex justify-around bg-gray-100 py-2">
        <button
          className={`px-4 py-2 font-bold ${activeTab === "account" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"}`}
          onClick={() => setActiveTab("account")}
        >
          Account Settings
        </button>
        <button
          className={`px-4 py-2 font-bold ${activeTab === "history" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-500"}`}
          onClick={() => setActiveTab("history")}
        >
          Order History
        </button>
      </div>

      {/* Account Settings Tab */}
      {activeTab === "account" && (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4">Account Settings</h3>
          <p className="mb-2">
            <strong>Email: </strong>{user.email}
          </p>
          <input
            className="w-full p-2 mb-4 border rounded"
            type="text"
            placeholder="Name"
            value={userDetails.name || ""}
            onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
          />
          <input
            className="w-full p-2 mb-4 border rounded"
            type="text"
            placeholder="Student ID"
            value={userDetails.studentId || ""}
            onChange={(e) => setUserDetails({ ...userDetails, studentId: e.target.value })}
          />
          <input
            className="w-full p-2 mb-4 border rounded"
            type="text"
            placeholder="Program-Section-Year"
            value={userDetails.program || ""}
            onChange={(e) => setUserDetails({ ...userDetails, program: e.target.value })}
          />
          <button
            onClick={handleUpdateDetails}
            className="w-full py-2 bg-blue-500 text-white font-bold rounded"
          >
            Update Details
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full mt-4 py-2 bg-red-500 text-white font-bold rounded"
          >
            Logout
          </button>
        </div>
      )}

      {/* Order History Tab */}
      {activeTab === "history" && (
        <div className="p-4 overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Order History</h3>
          {orderHistory.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <ul className="space-y-4">
              {orderHistory.map((order) => (
                <li key={order.id} className="border p-4 rounded">
                  <p>
                    <strong>Order ID: </strong>{order.id}
                  </p>
                  <p>
                    <strong>Total Price: </strong>₱{order.orderPrice}
                  </p>
                  <p>
                    <strong>Status: </strong>{order.status}
                  </p>
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
