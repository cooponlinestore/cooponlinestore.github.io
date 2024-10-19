import React, { useState, useEffect } from "react";
import { database, logout } from "../../firebase"; // Import Realtime Database instance and logout function
import { ref, onValue } from "firebase/database"; // Import Realtime Database functions
import { useNavigate } from "react-router-dom";
import ProfileManagement from "../student/ProfileManagement";

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
    <div className="admin-dashboard">
      <button onClick={handleLogout}>Logout</button>
      <button onClick={goToOrderManagement}>Orders</button>
      <button onClick={goToProductManagement}>Manage Products</button>
      <button onClick={goToUserManagement}>Users</button>

      {/* Sidebar for ProfileManagement */}
<button onClick={toggleProfileSidebar}>Profile</button> {/* Add Profile Button */}
{isProfileOpen && <ProfileManagement onClose={toggleProfileSidebar} />}
      
      <h1>Admin Dashboard</h1>
      <div className="stats">
      <button onClick={goToOrderManagement}>
        <div className="stat">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        </button>
        <button onClick={goToOrderManagement}>
        <div className="stat">
          <h3>Pending Orders</h3>
          <p>{pendingOrders}</p>
        </div>
        </button>
        <button onClick={goToProductManagement}>
        <div className="stat">
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
        </button>
        <button onClick={goToProductManagement}>
        <div className="stat">
          <h3>Out-of-Stock Products</h3>
          <p>{outOfStockProducts}</p>
        </div>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
