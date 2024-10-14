import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import "../../css/OrderManagement.css"
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all"); // Filter by order status (all, pending, completed)
  const navigate = useNavigate();

  // Navigate back to Admin Dashboard
  const goToAdminDashBoard = () => {
    navigate("/admin/dashboard");
  };

  // Fetch all orders in real-time from Firebase Realtime Database
  useEffect(() => {
    const ordersRef = ref(database, 'order/');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const ordersData = snapshot.val();
      const orderList = ordersData ? Object.keys(ordersData).map(key => ({
        id: key, // Order ID
        ...ordersData[key]
      })) : [];
      setOrders(orderList);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const orderRef = ref(database, `order/${orderId}`);
      await update(orderRef, { status: newStatus });
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const orderRef = ref(database, `order/${orderId}`);
        await remove(orderRef); // Remove order from database
        console.log(`Order ${orderId} cancelled`);
      } catch (error) {
        console.error("Error cancelling order:", error);
      }
    }
  };

  // Filter orders based on the selected filter
  const filteredOrders = orders.filter(order => {
    return filter === "all" || order.status === filter;
  });

  // Calculate the time remaining for pickup (15 minutes timer)
  const calculateTimeRemaining = (orderTime) => {
    if (!orderTime) return "No time provided";

    const orderTimestamp = new Date(orderTime).getTime();
    const now = new Date().getTime();
    const timeDifference = now - orderTimestamp;
    const minutesLeft = 15 - Math.floor(timeDifference / 60000); // Convert milliseconds to minutes

    return minutesLeft > 0 ? `${minutesLeft} min left` : "Expired";
  };

  return (
    <div className="order-management">
      <h1>Manage Orders</h1>
      <button onClick={goToAdminDashBoard}>Dashboard</button>
      
      {/* Filter Orders by Status */}
      <div className="order-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready for Pickup</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Orders List */}
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Time Left for Pickup</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.paymentMethod || "N/A"}</td>
              <td>{order.status}</td>
              <td>{calculateTimeRemaining(order.orderTime)}</td> {/* Display countdown timer */}
              <td>
                {/* Status Update Buttons */}
                {order.status !== "completed" && (
                  <>
                    <button onClick={() => handleStatusUpdate(order.id, "preparing")}>Preparing</button>
                    <button onClick={() => handleStatusUpdate(order.id, "ready")}>Ready for Pickup</button>
                    <button onClick={() => handleStatusUpdate(order.id, "completed")}>Complete</button>
                  </>
                )}
                {/* Cancel Order Button */}
                <button onClick={() => handleCancelOrder(order.id)}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderManagement;
