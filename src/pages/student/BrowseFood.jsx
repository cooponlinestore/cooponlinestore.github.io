import React, { useState, useEffect } from "react";
import { database, ref, onValue, logout } from "../../firebase";// Assuming you have a firebase.js setup for Firebase
import { useNavigate } from "react-router-dom";

const BrowseFood = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [totalAmount, setTotalAmount] = useState(0); // Total amount state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [pickupTime, setPickupTime] = useState(""); // Pick-up time selection

  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout(); // Call the logout function
    navigate("/login"); // Redirect to login page after logout
  };
  // Fetch food items from Firebase Realtime Database
  useEffect(() => {
    const productsRef = ref(database, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        const foodArray = Object.keys(productsData).map((key) => ({
          id: key,
          ...productsData[key],
        }));
        setFoodItems(foodArray);
      } else {
        setFoodItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Add item to the cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Update item quantity
  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) return removeFromCart(id); // Remove if quantity goes below 1
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Calculate total amount
  useEffect(() => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalAmount(total);
  }, [cart]);

  // Filter food items based on the category
  const filterFoodItems = () => {
    let filteredItems = foodItems;
    if (filterCategory !== "All") {
      filteredItems = foodItems.filter((item) => item.category === filterCategory);
    }
    if (searchTerm) {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredItems;
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!pickupTime || !selectedPaymentMethod) {
      alert("Please select a pickup time and payment method.");
      return;
    }

    // Process order checkout logic here (e.g., save to Firebase or show confirmation)
    console.log("Checkout successful", {
      cart,
      totalAmount,
      pickupTime,
      paymentMethod: selectedPaymentMethod,
    });

    // Reset cart after checkout
    setCart([]);
    alert("Order placed successfully!");
  };

  const categories = ["All", "Snacks", "Meals", "Beverages"];

  return (
    <div>
      <h1>Browse Food</h1>
      <button onClick={handleLogout}>Logout</button>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search food..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category Filter Buttons */}
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category}
              className={filterCategory === category ? "active" : ""}
              onClick={() => setFilterCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items List */}
      <div className="food-items">
        {filterFoodItems().map((item) => (
          <div key={item.id} className="food-item">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p>Price: ₱{item.price}</p>
            <button onClick={() => addToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div className="cart-summary">
        <h2>Cart</h2>
        {cart.length === 0 ? (
          <p>No items in cart</p>
        ) : (
          cart.map((cartItem) => (
            <div key={cartItem.id} className="cart-item">
              <p>{cartItem.name}</p>
              <p>
                Price: ₱{cartItem.price} x Quantity:{" "}
                <button onClick={() => updateCartQuantity(cartItem.id, cartItem.quantity - 1)}>
                  -
                </button>{" "}
                {cartItem.quantity}{" "}
                <button onClick={() => updateCartQuantity(cartItem.id, cartItem.quantity + 1)}>
                  +
                </button>
              </p>
              <p>Total: ₱{cartItem.price * cartItem.quantity}</p>
              <button onClick={() => removeFromCart(cartItem.id)}>Remove</button>
            </div>
          ))
        )}

        {/* Total Amount */}
        <h3>Total Amount: ₱{totalAmount}</h3>

        {/* Pickup Time Selection */}
        <label>
          Pick-up Time:
          <input
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            required
          />
        </label>

        {/* Payment Method Selection */}
        <div className="payment-methods">
          <h4>Choose Payment Method</h4>
          <button onClick={() => setSelectedPaymentMethod("Gcash")}>Gcash</button>
          <button onClick={() => setSelectedPaymentMethod("Pay at Counter")}>
            Pay at Counter
          </button>
        </div>

        <p>Selected Payment Method: {selectedPaymentMethod}</p>

        {/* Checkout Button */}
        <button onClick={handleCheckout}>Checkout</button>
      </div>
    </div>
  );
};

export default BrowseFood;
