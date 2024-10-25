import React, { useState, useEffect } from "react";
import { ref, onValue, push } from "../../firebase"; // Import Firebase operations
import { database, getAuth, logout } from "../../firebase";
import { useNavigate } from "react-router-dom";
import ProfileManagement from "./ProfileManagement";
import OrderTicket from "./OrderTicket";
import { Icon } from "@iconify/react";


const BrowseFood = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [gcashModalVisible, setGcashModalVisible] = useState(false);
  const user = getAuth().currentUser;
  const [isOrderTicketOpen, setIsOrderTicketOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const gcashNumber = "09639865065"; // Seller's GCash number
  const gcashQrCode = "/gcashqr.png"; // Path to the GCash QR Code image

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleProfileSidebar = () => {
    setIsProfileOpen((prevState) => !prevState);
  };

  const toggleOrderTicket = () => {
    setIsOrderTicketOpen((prevState) => !prevState);
  };

  const generateTicketNumber = () => {
    return Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
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
    if (quantity <= 0) return removeFromCart(id);
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
    if (filterType !== "All") {
      filteredItems = foodItems.filter((item) => item.type === filterType);
    }
    if (searchTerm) {
      filteredItems = filteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredItems;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const ticketNumber = generateTicketNumber();

    const order = {
      customerId: user.uid,
      products: cart.map(({ name, price, quantity }) => ({ name, price, quantity })),
      orderPrice: totalAmount,
      orderTime: new Date().toISOString(),
      paymentMethod: selectedPaymentMethod,
      status: "pending",
      ticketNumber: ticketNumber,
      timerExpiration: Date.now() + 15 * 60 * 1000, // 15 minutes from now
    };

    try {
      const ordersRef = ref(database, "orders");
      const newOrderRef = await push(ordersRef, order);
      const newOrderId = newOrderRef.key;
      setCurrentOrderId(newOrderId); // Save the order ID to show the ticket
      setIsOrderTicketOpen(true); // Open the order ticket modal

      // Show GCash modal if GCash payment is selected
      if (selectedPaymentMethod === "Gcash") {
        setGcashModalVisible(true);
      } else {
        alert("Order placed successfully!");
      }

      setCart([]); // Clear cart after successful order
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const categories = ["All", "Snacks", "Meals", "Beverages"];

  // Handle copying the GCash number
  const handleCopyGcashNumber = () => {
    navigator.clipboard.writeText(gcashNumber);
    alert("GCash number copied to clipboard!");
  };

  // Handle downloading the QR code
  const handleDownloadQrCode = () => {
    const link = document.createElement("a");
    link.href = gcashQrCode;
    link.download = "gcash-qr-code.png";
    link.click();

    // Show order ticket modal after download
    setIsOrderTicketOpen(true);
    setGcashModalVisible(false); // Close the GCash modal after download
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="flex justify-between items-center bg-custom-gray px-8 py-4 min-w-full">
        {/* Logo Section */}
        <div className="flex items-center">
          <img src="/coop.png" alt="Coop Online Logo" className="w-40 lg:w-52 h-14 lg:h-20 object-contain" />
        </div>

        {/* Icons Section */}
        <div className="flex items-center space-x-4 gap-2">
          <button onClick={toggleOrderTicket}>
            <Icon icon="lets-icons:order" className="text-white h-8 w-8 lg:h-12 lg:w-12" />
          </button>
          <button onClick={toggleProfileSidebar}>
            <Icon icon="ic:baseline-account-circle" className="text-white h-8 w-8 lg:h-12 lg:w-12" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-200 font-montserrat min-w-full">
        {/* Left Section: Product Menu and Product List */}
        <div className="w-full lg:w-5/5 bg-gray-200 p-4 rounded-lg shadow">
          {/* Product Menu */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category}
                className="p-4 w-full h-36 border-2 rounded-md shadow-md border-gray-100 text-center flex flex-col justify-center items-center bg-white cursor-pointer"
                onClick={() => setFilterType(category)}
              >
                <Icon
                  icon={
                    category === "Beverages"
                      ? "icon-park-outline:bottle-two"
                      : category === "Snacks"
                      ? "lucide:popcorn"
                      : "fluent:cookies-16-regular"
                  }
                  className={`h-16 w-16 mx-auto ${
                    category === "Beverages"
                      ? "text-Drinks"
                      : category === "Snacks"
                      ? "text-Snacks"
                      : "text-Biscuits"
                  } mb-1`}
                />
                <span
                  className={`${
                    category === "Beverages"
                      ? "text-Drinks"
                      : category === "Snacks"
                      ? "text-Snacks"
                      : "text-Biscuits"
                  } font-semibold font-montserrat`}
                >
                  {category}
                </span>
              </div>
            ))}
          </div>

          {/* Product List */}
          <h2 className="text-lg font-bold mb-4 mt-6">Products</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 bg-gray-200">
            {filterFoodItems().map((item) => (
              <button
                onClick={() => addToCart(item)}
                key={item.id}
                className="flex flex-col items-center p-4 bg-Cardbg rounded-sm lg:flex-row lg:justify-between"
              >
                <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                <div className="flex flex-col items-center lg:flex-1 lg:items-start lg:px-4">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-black text-center lg:text-left">{item.description}</p>
                </div>
                <span className="font-bold text-AllMenu lg:ml-auto">₱{item.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Section: Billing Section */}
        <div className="w-full lg:w-2/5 bg-white p-4 rounded-lg shadow-md">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-extrabold">Billing Section</h2>
            <div className="border-2 border-custom-gray font-bold flex items-center px-4 py-2 rounded-sm">
              <Icon icon="stash:people-group" className="h-6 w-6 mr-2 text-custom-gray" />
              <span className="text-custom-gray">Customer</span>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_0.5fr] gap-2 text-center font-semibold text-sm mb-2">
            <span>Item</span>
            <span className="ml-7">Qty</span>
            <span>Price</span>
            <span>Delete</span>
          </div>

          {/* Product List in Cart */}
          <div className="flex flex-col gap-4 overflow-y-auto h-auto">
            {cart.length === 0 ? (
              <p>No items in cart</p>
            ) : (
              cart.map((cartItem) => (
                <div
                  key={cartItem.id}
                  className="flex items-center justify-between py-2 border-t"
                >
                  <div className="flex items-center min-w-40">
                    <img
                      src={cartItem.image}
                      alt={cartItem.name}
                      className="w-12 h-12 object-contain mr-2"
                    />
                    <div>
                      <h3 className="font-semibold">{cartItem.name}</h3>
                      <p className="text-sm text-gray-500">{cartItem.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => updateCartQuantity(cartItem.id, cartItem.quantity - 1)}
                      className="text-center w-8 h-8 px-2 py-1 border border-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={cartItem.quantity}
                      className="w-8 h-8 text-center border-t border-b border-gray-300"
                      readOnly
                    />
                    <button
                      onClick={() => updateCartQuantity(cartItem.id, cartItem.quantity + 1)}
                      className="text-center w-8 h-8 px-2 py-1 border border-gray-300"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-orange-500 font-bold text-center">
                    ₱{cartItem.price}
                  </span>

                  <button
                    onClick={() => removeFromCart(cartItem.id)}
                    className="text-red-500 text-center"
                  >
                    <Icon icon="mdi:trash-can-outline" className="h-6 w-6" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Total Amount */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-lg font-bold">₱{totalAmount}</span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSelectedPaymentMethod("Gcash")}
              className="flex items-center justify-evenly bg-gray-200 text-blue py-2 px-4 font-extrabold rounded-md h-16 w-full"
            >
              <img src="/gcash.png" alt="GCash" className="w-8 h-8" />
              Gcash
            </button>
            <button
              onClick={() => setSelectedPaymentMethod("Pay at Counter")}
              className="bg-white text-[#FF9900] py-2 px-4 rounded-md h-16 w-full border font-extrabold border-AllMenu"
            >
              Pay at Counter
            </button>
          </div>

          <p className="mt-4">Selected Payment Method: {selectedPaymentMethod}</p>

          <button
            onClick={handleCheckout}
            className="bg-custom-dark text-white py-2 px-4 rounded-md mt-4 w-full font-bold"
          >
            Checkout
          </button>
        </div>
      </main>

      {/* Sidebar for ProfileManagement */}
      {isProfileOpen && <ProfileManagement onClose={toggleProfileSidebar} />}

      {/* GCash Payment Modal */}
      {gcashModalVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold text-custom-gray mb-4 text-center">
              GCash Payment
            </h2>
            <p className="text-lg font-semibold mb-2 text-center">GCash Number:</p>
            <div className="flex items-center justify-center mb-4">
              <span className="text-lg font-bold mr-2">{gcashNumber}</span>
              <button
                onClick={handleCopyGcashNumber}
                className="text-blue-600 underline"
              >
                Copy
              </button>
            </div>
            <p className="text-lg font-semibold mb-2 text-center">Scan QR Code:</p>
            <div className="flex justify-center mb-4">
              <img
                src={gcashQrCode}
                alt="GCash QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleDownloadQrCode}
                className="bg-blue-600 text-black py-2 px-4 rounded-md border-4 border-black"
              >
                Download QR Code
              </button>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setGcashModalVisible(false)}
                className="bg-red-500 text-white py-2 px-6 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Ticket at the bottom */}
      {isOrderTicketOpen && currentOrderId && (
        <OrderTicket
          orderId={currentOrderId}
          onClose={toggleOrderTicket}
        />
      )}
    </div>
  );
};

export default BrowseFood;
