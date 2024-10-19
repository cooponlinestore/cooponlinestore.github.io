import React, { useState, useEffect } from "react";
import { database, logout } from "../../firebase"; // Import Realtime Database instance and logout function
import { ref, onValue } from "firebase/database"; // Import Realtime Database functions
import { useNavigate } from "react-router-dom";
import { Icon } from '@iconify/react';
import ProfileManagement from "../student/ProfileManagement"; // Profile Management Component

const AdminDashboard = () => {
  const navigate = useNavigate();

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

  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [outOfStockProducts, setOutOfStockProducts] = useState(0);

  // Fetch total orders and pending orders from Realtime Database
  useEffect(() => {
    const ordersRef = ref(database, "orders"); // Reference to the 'orders' node in Realtime Database

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersArray = Object.values(ordersData);

        setTotalOrders(ordersArray.length); // Set total number of orders

        // Filter pending orders
        const pending = ordersArray.filter(order => order.status === "pending").length;
        setPendingOrders(pending); // Set number of pending orders
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Fetch total products and out-of-stock products from Realtime Database
  useEffect(() => {
    const productsRef = ref(database, "products"); // Reference to the 'products' node in Realtime Database

    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const productsArray = Object.values(productsData);

        setTotalProducts(productsArray.length); // Set total number of products

        // Filter out-of-stock products (quantity === 0)
        const outOfStock = productsArray.filter(product => product.quantity === 0).length;
        setOutOfStockProducts(outOfStock); // Set number of out-of-stock products
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-custom-gray w-64 flex flex-col justify-between p-4">
        <div>
          {/* Logo */}
          <div className="mb-8">
            <img src="/coop.png" alt="Coop Online Logo" className="w-full h-20 object-contain mx-auto mb-24" />
          </div>

          {/* Menu Items */}
          <nav className="space-y-8">
            <button className="flex items-center space-x-2 bg-gray-50 text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
              <Icon icon="carbon:dashboard" className="w-6 h-6" />
              <span>Dashboard</span>
            </button>
            <button onClick={goToOrderManagement} className="flex items-center space-x-2 text-white hover:bg-white hover:text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-8">
        {/* Header */}
        <header className="flex justify-between items-center bg-custom-gray p-4 rounded-md">
          <h1 className="text-white text-xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Icon icon="ic:baseline-notifications" className="text-white w-8 h-8" />
            <button onClick={toggleProfileSidebar}>
              <Icon icon="ic:baseline-account-circle" className="text-white w-8 h-8" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="mt-8 grid grid-cols-2 gap-4">
          <button onClick={goToOrderManagement}>
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="font-bold text-gray-600 mb-2">TOTAL ORDERS</h2>
            <div className="h-20 bg-gray-50 rounded-md flex items-center justify-center text-2xl font-bold">
              {totalOrders}
            </div>
          </div>
          </button>
          <button onClick={goToOrderManagement}>
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="font-bold text-gray-600 mb-2">PENDING ORDERS</h2>
            <div className="h-20 bg-gray-50 rounded-md flex items-center justify-center text-2xl font-bold">
              {pendingOrders}
            </div>
          </div>
          </button>
          <button onClick={goToProductManagement}>
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="font-bold text-gray-600 mb-2">TOTAL PRODUCTS</h2>
            <div className="h-20 bg-gray-50 rounded-md flex items-center justify-center text-2xl font-bold">
              {totalProducts}
            </div>
          </div>
          </button>
          <button onClick={goToProductManagement}>
          <div className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="font-bold text-gray-600 mb-2">OUT-OF-STOCK PRODUCTS</h2>
            <div className="h-20 bg-gray-50 rounded-md flex items-center justify-center text-2xl font-bold">
              {outOfStockProducts}
            </div>
          </div>
          </button>
        </section>
      </main>

      {/* Sidebar for ProfileManagement */}
      {isProfileOpen && <ProfileManagement onClose={toggleProfileSidebar} />}
    </div>
  );
};

export default AdminDashboard;
