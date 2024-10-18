import React, { useEffect, useState } from "react";// For database operations
import { database,ref, onValue, update  } from "../../firebase"; // Your Firebase setup
import { useParams, useNavigate } from "react-router-dom";

const OrderTicket = () => {
  const { orderId } = useParams(); // Get the order ID from the URL params
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(""); // For countdown timer
  const navigate = useNavigate();

  // Fetch the order details from Firebase
  useEffect(() => {
    const orderRef = ref(database, `orders/${orderId}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        setOrder(snapshot.val());
      } else {
        setOrder(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [orderId]);

  // Calculate the time left for pickup (15 minutes timer in minutes and seconds)
  useEffect(() => {
    if (order && order.orderTime) {
      const interval = setInterval(() => {
        const orderTimestamp = new Date(order.orderTime).getTime();
        const now = new Date().getTime();
        const timeDifference = now - orderTimestamp;
        const timeLeftMillis = 15 * 60 * 1000 - timeDifference; // 15 minutes in milliseconds

        if (timeLeftMillis > 0) {
          const minutes = Math.floor(timeLeftMillis / (1000 * 60));
          const seconds = Math.floor((timeLeftMillis % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds}`);
        } else {
          setTimeLeft("Expired");
        }
      }, 1000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [order]);

  // Mark the order as completed
  const handleCompleteOrder = async () => {
    if (window.confirm("Are you sure you want to mark the order as complete?")) {
      try {
        const orderRef = ref(database, `orders/${orderId}`);
        await update(orderRef, { status: "completed" });
        alert("Order completed!");
        navigate("/student/browse"); // Redirect to browse page after completion
      } catch (error) {
        console.error("Error completing order:", error);
      }
    }
  };

  if (!order) {
    return <div>Loading order details...</div>;
  }

  return (
    <div>
      <h1>Order Ticket</h1>
      <p>Order ID: {orderId}</p>
      <p>Time Left for Pickup: {timeLeft}</p>
      <ul>
        {order.products && order.products.map((product, index) => (
          <li key={index}>{product.name} (x{product.quantity})</li>
        ))}
      </ul>
      <h3>Total Price: ₱{order.orderPrice}</h3>
      <button onClick={handleCompleteOrder}>Complete Order</button>
    </div>
  );
};

export default OrderTicket;
