import React from "react";
import { useSelector } from "react-redux";
import "../style/Profile.css";

const UserProfile = () => {
  const user = useSelector((state) => state.user.user);
  const firstLetter = user.name.charAt(0).toUpperCase();

  return (
    <div className="profile-container">
      <div className="profile-box">
        <div className="profile-initial">{firstLetter}</div>
        <h1 className="profile-name">{user.name}</h1>
        <div className="profile-line" />
        <div className="profile-details">
          <p>
            Adhar : <span>{user.adhar}</span>
          </p>
          <p>
            Role: <span>{user.role}</span>
          </p>
          <p>
            Tokens : <span>{user.Token}</span>
          </p>
        </div>
        <style></style>
      </div>
    </div>
  );
};

export default UserProfile;
