import React, { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database"; // Import from Firebase SDK
import { database, logout } from "../../firebase"; // Import the Realtime Database instance
import { Icon } from '@iconify/react';
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null); // For mobile view

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

  const handleLogout = async () => {
    await logout(); // Call the logout function
    navigate("/login"); // Redirect to login page after logout
  };

  // Toggle Profile Sidebar
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const toggleProfileSidebar = () => {
    setIsProfileOpen((prevState) => !prevState); // Toggle sidebar state
  };

  // Fetch users from Firebase Realtime Database
  useEffect(() => {
    const usersRef = ref(database, "users"); // Reference to 'users' node in Realtime Database

    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map((key) => ({
          userId: key,
          ...usersData[key],
        }));
        setUsers(usersArray); // Set users state as an array of user objects
      } else {
        setUsers([]); // If no users found, set empty array
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  // Delete user from Firebase Realtime Database
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        const userRef = ref(database, `users/${userId}`); // Reference to specific user in the database
        await remove(userRef); // Remove the user from the database
        alert("User successfully deleted");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  // Toggle user details in mobile view
  const toggleUserDetails = (userId) => {
    setSelectedUserId(selectedUserId === userId ? null : userId); // Toggle between showing/hiding
  };

  // Function to format the email with a <br /> before '@'
  const formatEmailForMobile = (email) => {
    const parts = email.split("@");
    return (
      <>
        {parts[0]}<br />@{parts[1]}
      </>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="bg-custom-gray w-full lg:w-64 flex flex-col justify-between p-4">
        <div>
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
            <button onClick={goToProductManagement} className="flex items-center space-x-2 text-white hover:bg-white hover:text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
              <Icon icon="carbon:product" className="w-6 h-6" />
              <span>Product Management</span>
            </button>
            <button className="flex items-center space-x-2 bg-white text-custom-gray py-2 px-3 rounded-md w-full font-bold font-montserrat">
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

        {/* User Management Table */}
        <section className="mt-8 bg-white p-8 shadow-md rounded-md h-full">
          <h2 className="text-2xl font-bold text-custom-gray mb-6">User Management</h2>
          <table className="w-full bg-gray-300 shadow rounded-md table-fixed">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-gray-300 text-center text-gray-600 font-semibold">
                <th className="p-6 font-bold font-montserrat w-1/6">Name</th>
                <th className="p-6 font-bold font-montserrat w-1/4">Email</th>
                <th className="p-6 font-bold font-montserrat w-1/7">Program</th>
                <th className="p-6 font-bold font-montserrat w-1/9">Section</th>
                <th className="p-6 font-bold font-montserrat w-1/9">Year</th>
                <th className="p-6 font-bold font-montserrat w-1/8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-600">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <React.Fragment key={user.userId}>
                    {/* Desktop view */}
                    <tr className="hidden lg:table-row bg-custom-gray border-b border-white text-center">
                      <td className="p-4 text-white">{user.name}</td>
                      <td className="p-4 text-white">{user.email}</td> {/* Normal display for desktop */}
                      <td className="p-4 text-white">{user.program}</td>
                      <td className="p-4 text-white">{user.section}</td>
                      <td className="p-4 text-white">{user.year}</td>
                      <td className="p-4 text-white">
                        <button
                          onClick={() => handleDeleteUser(user.userId)}
                          className="bg-white text-red-600 border-2 border-red-600 py-1 px-3 rounded-full hover:bg-red-600 hover:text-white"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* Mobile view - Name and dropdown */}
                    <tr className="lg:hidden flex flex-col mb-4 bg-custom-gray p-4 rounded-lg">
                      <div onClick={() => toggleUserDetails(user.userId)} className="flex justify-between items-center">
                        <span className="text-white font-bold">{user.name}</span>
                        <Icon
                          icon={selectedUserId === user.userId ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                          className="text-white w-6 h-6 cursor-pointer"
                        />
                      </div>

                      {/* Toggle details */}
                      {selectedUserId === user.userId && (
                        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                          <p>Email: {formatEmailForMobile(user.email)}</p> {/* Email format with <br /> */}
                          <p>Program: {user.program}</p>
                          <p>Section: {user.section}</p>
                          <p>Year: {user.year}</p>
                          <div className="mt-2">
                            <button
                              onClick={() => handleDeleteUser(user.userId)}
                              className="bg-red-600 text-white py-1 px-3 rounded-full hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default UserManagement;
