import React, { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database, logout } from '../../firebase'; // Import Firebase Realtime Database config
import ProductForm from './ProductForm'; // Import ProductForm for adding/editing products
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import ProfileManagement from '../student/ProfileManagement';
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // Filter by stock status (all, in-stock, out-of-stock)
  const [showForm, setShowForm] = useState(false); // Show/hide the form modal
  const [editingProductId, setEditingProductId] = useState(null); // Track the product being edited
    
  const navigate = useNavigate();
  const goToAdminDashBoard = () => {
    navigate("/admin/dashboard"); // Navigate to the Admin Dashboard
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


  // Fetch all products from Realtime Database
  useEffect(() => {
    const productsRef = ref(database, 'products/');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const productsData = snapshot.val();
      const productList = productsData ? Object.keys(productsData).map(key => ({
        id: key, // Use the key as the product ID
        ...productsData[key]
      })) : [];
      setProducts(productList); // Update the state with the product list
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  // Handle product deletion
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const productRef = ref(database, `products/${productId}`);
        await remove(productRef); // Remove the product from the database
        console.log("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  // Handle product editing
  const handleEdit = (productId) => {
    setEditingProductId(productId); // Set the product ID for editing
    setShowForm(true); // Show the form
  };

  // Filter products based on search and stock status
  const filteredProducts = products.filter(product => {
    const productName = product.name ? product.name.toLowerCase() : ""; // Safely access name
    const matchesSearch = productName.includes(searchTerm.toLowerCase());
    const productQuantity = product.quantity ? product.quantity : 0;    // Safely access quantity
    const matchesFilter = filter === "all" || 
                          (filter === "in-stock" && productQuantity > 0) || 
                          (filter === "out-of-stock" && productQuantity === 0);
    return matchesSearch && matchesFilter;
  });

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
            <button onClick={goToAdminDashBoard} className="flex items-center space-x-2 text-white hover:bg-white hover:text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
              <Icon icon="carbon:dashboard" className="w-6 h-6" />
              <span>Dashboard</span>
            </button>
            <button onClick={goToOrderManagement} className="flex items-center space-x-2 text-white hover:bg-white hover:text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
              <Icon icon="ic:baseline-notifications" className="w-6 h-6" />
              <span>Orders</span>
            </button>
            <button onClick={goToProductManagement} className="flex items-center space-x-2 bg-gray-50 text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
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

        {/* Products Table */}
        <section className="mt-8 bg-white p-8 shadow-md rounded-md h-full">
          <div className='flex justify-between items-center'>
            <h2 className="text-2xl font-bold text-custom-gray mb-6">Manage Products</h2>
            <button
              onClick={() => { setShowForm(true); setEditingProductId(null); }}
              className='border-4 border-custom-gray text-custom-gray w-1/6 font-bold rounded-md font-montserrat hover:bg-custom-gray hover:text-white'
            >
              Add Products
            </button>
          </div>
          <table className="w-full bg-gray-300 shadow rounded-md flex flex-col">
            <thead>
              <tr className="bg-gray-300 text-center text-gray-600 font-semibold flex justify-evenly items-center">
                <th className="p-6 font-bold font-montserrat w-1/5">Name</th>
                <th className="p-6 font-bold font-montserrat w-1/5">Category</th>
                <th className="p-6 font-bold font-montserrat w-1/5">Price</th>
                <th className="p-6 font-bold font-montserrat w-1/5">Quantity</th>
                <th className="p-6 font-bold font-montserrat w-1/5"></th>
                <th className="p-6 font-bold font-montserrat w-1/5"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="bg-custom-gray border-b border-white flex flex-row w-full">
                  <td className="flex items-start justify-center p-4 text-white font-bold w-full h-full">
                    <span className="bg-custom-gray font-bold text-white py-1 px-2 rounded-md">{product.name}</span>
                  </td>
                  <td className="flex items-start justify-center p-4 text-white font-bold w-full">
                    <span className="bg-custom-gray font-bold text-white py-1 px-2 rounded-md">{product.type}</span>
                  </td>
                  <td className="flex items-start justify-center p-4 text-white font-bold w-full">
                    <span className="bg-custom-gray font-bold text-white py-1 px-2 rounded-md">{product.price}</span>
                  </td>
                  <td className="flex items-start justify-center p-4 text-white font-bold w-full">
                    <span className="bg-custom-gray font-bold text-white py-1 px-2 rounded-md">{product.quantity}</span>
                  </td>
                  <td className="flex flex-row items-start justify-center p-4 text-white font-bold w-full">
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="bg-white text-custom-gray border-2 border-custom-gray py-1 px-3 rounded-full hover:bg-custom-dark hover:text-white"
                    >
                      Edit
                    </button>
                  </td>
                  <td className="flex flex-row items-start justify-center p-4 text-white font-bold w-full">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-white text-red-600 border-2 border-red-600 py-1 px-3 rounded-full hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ProductForm Modal */}
        {showForm && (
          <div className="modal">
            <ProductForm
              productId={editingProductId}
              onClose={() => setShowForm(false)} // Close the form
            />
          </div>
        )}
      </main>

      {/* Sidebar for ProfileManagement */}
      {isProfileOpen && <ProfileManagement onClose={toggleProfileSidebar} />}
    </div>
  );
};

export default ProductManagement;
