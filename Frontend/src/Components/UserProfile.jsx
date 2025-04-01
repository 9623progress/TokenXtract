import React from "react";
import { useSelector } from "react-redux";
import "../style/Profile.css";

const UserProfile = () => {
  const user = useSelector((state) => state.user.user);

  console.log("Redux State:", user); // Debugging Redux State

  if (!user) {
    console.warn("User data is undefined or not loaded yet.");
    return <p>Loading user data...</p>;
  }

  if (!user.name) {
    console.warn("User name is missing in the user object.");
  }

  if (!user.tokenHistory) {
    console.warn("User tokenHistory is undefined.");
  }

  const firstLetter = user.name?.charAt(0)?.toUpperCase() || "U"; // Handle undefined cases

  return (
    <div className="profile-container">
      <div className="profile-box">
        <div className="profile-initial">{firstLetter}</div>
        <h1 className="profile-name">{user.name}</h1>
        <div className="profile-line" />
        <div className="profile-details">
          <p>
            Adhar : <span>{user.adhar || "Not Available"}</span>
          </p>
          <p>
            Role: <span>{user.role || "Unknown"}</span>
          </p>
          <p>
            Total Tokens Received:{" "}
            <span>{user.totalTokensReceived ?? "0"}</span>
          </p>
          <h3>Transaction History</h3>
          <ul>
            {Array.isArray(user.tokenHistory) && user.tokenHistory.length > 0 ? (
              user.tokenHistory.map((tx, index) => (
                <li key={index}>
                  Scheme ID: {tx.schemeID || "Unknown"}, Amount:{" "}
                  {tx.amount || "N/A"}, Date:{" "}
                  {tx.date ? new Date(tx.date).toLocaleDateString() : "N/A"}
                </li>
              ))
            ) : (
              <p>No transactions available</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
