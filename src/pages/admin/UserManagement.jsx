import React, { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database"; // Import from Firebase SDK
import { database } from "../../firebase"; // Import the Realtime Database instance

const UserManagement = () => {
  const [users, setUsers] = useState([]);

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

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Program</th>
            <th>Section</th>
            <th>Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.program}</td>
              <td>{user.section}</td>
              <td>{user.year}</td>
              <td>
                <button onClick={() => handleDeleteUser(user.userId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
