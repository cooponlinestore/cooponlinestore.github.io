import React, { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../../firebase'; // Import Firebase Realtime Database config
import ProductForm from './ProductForm'; // Import ProductForm for adding/editing products
import { useNavigate } from 'react-router-dom';


const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // Filter by stock status (all, in-stock, out-of-stock)
  const [showForm, setShowForm] = useState(false); // Show/hide the form modal
  const [editingProductId, setEditingProductId] = useState(null); // Track the product being edited
    
  const navigate = useNavigate();
  const goToAdminDashBoard = () => {
    navigate("/admin/dashboard"); // This will navigate to the ProductManagement page
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
    <div className="product-management">
      <h1>Manage Products</h1>
      <button onClick={goToAdminDashBoard}>Dashboard</button>
      {/* Search and Filter */}
      <div className="product-filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Products</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Add Product Button */}
      <button onClick={() => { setShowForm(true); setEditingProductId(null); }}>Add Product</button>

      {/* Products Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.type}</td>
              <td>{product.price}</td>
              <td>{product.quantity}</td>
              <td>
                <button onClick={() => handleDelete(product.id)}>Delete</button>
                <button onClick={() => handleEdit(product.id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ProductForm Modal */}
      {showForm && (
        <div className="modal">
          <ProductForm
            productId={editingProductId}
            onClose={() => setShowForm(false)} // Close the form
          />
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
