import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { database, logout } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ProfileManagement from '../student/ProfileManagement';
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all"); // Filter by order status (all, pending, completed)
  const [searchTerm, setSearchTerm] = useState(""); // For searching by Order ID
  const navigate = useNavigate();

  // Navigate back to Admin Dashboard
  const goToAdminDashBoard = () => {
    navigate("/admin/dashboard");
  };

  const goToProductManagement = () => {
    navigate("/admin/products"); // Navigate to the Product Management page
  };

  const goToOrderManagement = () => {
    navigate("/admin/orders"); // Navigate to the Order Management page
  };

  const goToUserManagement = () => {
    navigate("/admin/users");
  };

  const handleLogout = async () => {
    await logout(); // Call the logout function
    navigate("/login"); // Redirect to login page after logout
  };

    // Toggle Profile Sidebar
    const [isProfileOpen, setIsProfileOpen] = useState(false); 
    const toggleProfileSidebar = () => {
      setIsProfileOpen((prevState) => !prevState); // Toggle sidebar state
    };
  // Fetch all orders in real-time from Firebase Realtime Database
  useEffect(() => {
    const ordersRef = ref(database, 'orders/');
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
    if (window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
      try {
        const orderRef = ref(database, `orders/${orderId}`);
        await update(orderRef, { status: newStatus });
        console.log(`Order ${orderId} status updated to ${newStatus}`);
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const orderRef = ref(database, `orders/${orderId}`);
        await remove(orderRef); // Remove order from database
        console.log(`Order ${orderId} cancelled`);
      } catch (error) {
        console.error("Error cancelling order:", error);
      }
    }
  };

  // Filter orders based on the selected filter and search term
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch = searchTerm === "" || order.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-custom-gray w-64 flex flex-col justify-between p-4">
      <nav className="space-y-8">
            <button onClick={goToAdminDashBoard} className="flex items-center space-x-2 text-white hover:bg-white hover:text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
              <Icon icon="carbon:dashboard" className="w-6 h-6" />
              <span>Dashboard</span>
            </button>
            <button onClick={goToOrderManagement} className="flex items-center space-x-2 bg-gray-50 text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
              <Icon icon="ic:baseline-notifications" className="w-6 h-6" />
              <span>Orders</span>
            </button>
            <button onClick={goToProductManagement} className="flex items-center space-x-2 text-white hover:bg-white hover:text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
              <Icon icon="carbon:product" className="w-6 h-6" />
              <span>Product Management</span>
            </button>
            <button onClick={goToUserManagement} className="flex items-center space-x-2 text-white hover:bg-white hover:text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
              <Icon icon="mdi:account" className="w-6 h-6" />
              <span>User Management</span>
            </button>
            <button onClick={handleLogout} className="text-red-600 bg-white py-2 px-4 rounded-md shadow-md font-semibold hover:bg-red-600 hover:text-white w-full">
              Logout
            </button>
          </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mt-2 ml-4 mr-4 h-full">
        {/* Header */}
        <header className="flex justify-end items-center bg-custom-gray p-4 rounded-md">
          <div className="flex items-center justify-center space-x-4">
            <Icon icon="ic:baseline-notifications" className="text-white w-8 h-8" />
            <button onClick={toggleProfileSidebar}>
              <Icon icon="ic:baseline-account-circle" className="text-white w-8 h-8" />
            </button>
          </div>
        </header>

        {/* Orders Table */}
        <section className="mt-8 bg-white p-8 shadow-md rounded-md h-full">
          <h2 className="text-2xl font-bold text-custom-gray mb-6">Manage Orders</h2>

          {/* Filter Orders by Status and Search by Order ID */}
          <div className="flex justify-between mb-4">
            <select className="p-2 border rounded-md" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="text"
              placeholder="Search by Order ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border rounded-md"
            />
          </div>

          {/* Orders Table */}
          <table className="w-full bg-gray-300 shadow rounded-md">
            <thead>
              <tr className="bg-gray-300 text-center text-gray-600 font-semibold">
                <th className="p-6 font-bold font-montserrat">Order ID</th>
                <th className="p-6 font-bold font-montserrat">Products</th>
                <th className="p-6 font-bold font-montserrat">Total Price</th>
                <th className="p-6 font-bold font-montserrat">Payment Method</th>
                <th className="p-6 font-bold font-montserrat">Status</th>
                <th className="p-6 font-bold font-montserrat">Pickup Time</th>
                <th className="p-6 font-bold font-montserrat">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="bg-custom-gray border-b border-white text-white">
                  <td className="p-4 text-center">{order.id}</td>
                  <td className="p-4 text-center">
                    <ul>
                      {order.products && order.products.map((product, index) => (
                        <li key={index}>{product.name} (x{product.quantity})</li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 text-center">₱{order.orderPrice || "N/A"}</td>
                  <td className="p-4 text-center">{order.paymentMethod || "N/A"}</td>
                  <td className="p-4 text-center">{order.status}</td>
                  <td className="p-4 text-center">{calculateTimeRemaining(order.orderTime)}</td>
                  <td className="p-4 text-center">
                    {order.status !== "completed" && (
                      <>
                        {order.status === "pending" && (
                          <button
                            className="bg-green-600 text-white py-1 px-3 rounded-full mb-2"
                            onClick={() => handleStatusUpdate(order.id, "completed")}
                          >
                            Mark as Completed
                          </button>
                        )}
                        <button
                          className="bg-red-600 text-white py-1 px-3 rounded-full"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      {isProfileOpen && <ProfileManagement onClose={toggleProfileSidebar} />}

    </div>
  );
};

export default OrderManagement;
