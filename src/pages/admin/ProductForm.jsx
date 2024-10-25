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
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4 p-4 bg-white shadow-md rounded-md w-full lg:w-2/3 mx-auto mt-8"
      style={{ marginTop: '2rem' }} // Add margin at the top
    >
      <div>
        <label className="block font-bold mb-2">Product Name</label>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md min-h-[50px]" // Set min height for better spacing
        />
      </div>

      <div>
        <label className="block font-bold mb-2">Category</label>
        <input
          type="text"
          name="type"
          placeholder="Category (Meals, Snacks, etc.)"
          value={product.type}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md min-h-[50px]" // Set min height for better spacing
        />
      </div>

      <div>
        <label className="block font-bold mb-2">Price</label>
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md min-h-[50px]" // Set min height for better spacing
        />
      </div>

      <div>
        <label className="block font-bold mb-2">Quantity</label>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={product.quantity}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md min-h-[50px]" // Set min height for better spacing
        />
      </div>

      <div className="col-span-2">
        <label className="block font-bold mb-2">Image URL</label>
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={product.image}
          onChange={handleChange}
          className="w-full p-2 border rounded-md min-h-[50px]" // Set min height for better spacing
        />
      </div>

      <div className="col-span-2">
        <label className="block font-bold mb-2">Description</label>
        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md min-h-[100px]" // Set min height for better spacing on textarea
        />
      </div>

      <div className="col-span-2 flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="border-2 border-red-600 text-red-600 py-2 px-4 rounded-md hover:bg-red-600 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="border-2 border-green-600 text-green-600 py-2 px-4 rounded-md hover:bg-green-600 hover:text-white"
        >
          {isEditMode ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
