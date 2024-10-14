import React, { useState, useEffect } from 'react';
import { ref, set, update, get } from 'firebase/database';
import { database } from '../../firebase';

const ProductForm = ({ productId, onClose }) => {
  const [product, setProduct] = useState({
    name: "",
    type: "snacks",
    price: "",
    quantity: "",
    description: "",
    image: ""
  });

  const isEditMode = !!productId; // Check if we're in edit mode

  // Load product data in edit mode
  useEffect(() => {
    if (isEditMode) {
      const productRef = ref(database, `products/${productId}`);
      get(productRef).then((snapshot) => {
        if (snapshot.exists()) {
          setProduct(snapshot.val()); // Populate the form with existing product data
        }
      });
    }
  }, [isEditMode, productId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const productRef = ref(database, `products/${isEditMode ? productId : Date.now()}`);
    try {
      if (isEditMode) {
        await update(productRef, product); // Update existing product
        console.log("Product updated successfully");
      } else {
        await set(productRef, product); // Add new product
        console.log("Product added successfully");
      }
      onClose(); // Close form after submission
    } catch (error) {
      console.error("Error adding/updating product:", error);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isEditMode ? "Edit Product" : "Add Product"}</h2>
      <input
        type="text"
        name="name"
        placeholder="Product Name"
        value={product.name}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="type"
        placeholder="Category (Meals, Snacks, etc.)"
        value={product.type}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={product.price}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={product.quantity}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={product.description}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="image"
        placeholder="Image URL"
        value={product.image}
        onChange={handleChange}
      />
      <button type="submit">{isEditMode ? "Update Product" : "Add Product"}</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
  );
};

export default ProductForm;
