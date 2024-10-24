import React, { useState, useEffect } from "react";
import { ref, onValue, database } from "../../firebase"; // Firebase setup

const OrderTicket = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(""); // Countdown timer state

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
    if (order && order.orderTime && order.status !== 'completed') {
      const interval = setInterval(() => {
        const orderTimestamp = new Date(order.orderTime).getTime();
        const now = new Date().getTime();
        const timeDifference = now - orderTimestamp;
        const timeLeftMillis = 15 * 60 * 1000 - timeDifference; // 15 minutes in milliseconds

        if (timeLeftMillis > 0) {
          const minutes = Math.floor(timeLeftMillis / (1000 * 60));
          const seconds = Math.floor((timeLeftMillis % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`);
        } else {
          setTimeLeft("Expired");
        }
      }, 1000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
    if (order && order.status === 'completed') {
      setTimeLeft("Order Completed");
    }
  }, [order]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-AllMenu text-white text-center p-6 rounded-md shadow-lg w-10/12 max-w-md mx-auto">
        <h2 className="text-lg lg:text-xl font-bold font-montserrat">Order Ticket</h2>
        {order ? (
          <>
            <p className="text-2xl mt-4 font-bold font-montserrat">Ticket #{order.ticketNumber}</p> {/* Show the ticket number */}
            <p className="text-5xl font-bold font-montserrat my-4">{timeLeft}</p> {/* Countdown Timer */}
            <div className="flex flex-col gap-2">
              {order.products.map((product, index) => (
                <p key={index} className="text-base lg:text-xl mb-2 lg:mb-4 font-bold font-montserrat">
                  {product.name} (x{product.quantity})
                </p>
              ))}
            </div>
            <p className="text-xl lg:text-2xl font-montserrat font-bold mb-4">Total: ₱{order.orderPrice}</p> {/* Total Price */}
            <button
              onClick={onClose}
              className="bg-white text-black font-bold font-montserrat py-2 px-4 lg:py-2 lg:px-6 rounded-md hover:text-white hover:bg-green-500 transition-colors"
            >
              Close
            </button>
          </>
        ) : (
          <button onClick={onClose} className="text-lg lg:text-2xl mt-4 font-bold font-montserrat">Order not found</button>
        )}
      </div>
    </div>
  );
};

export default OrderTicket;
