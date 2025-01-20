import React from "react";
import "../style/Card.css";
import { useNavigate } from "react-router-dom";

const DepartmentCard = ({ title, des, image, id }) => {
  const navigate = useNavigate(); // Initializing the useHistory hook

  const handleImageClick = () => {
    // Passing the data as state to the /scheme route
    if (title == "Contract") {
      navigate("/view-contracts");
      return;
    }
    navigate("/scheme", {
      state: { id }, // Pass the state to the SchemePage
    });
  };

  return (
    <div className="card-box">
      <div className="card-left" onClick={handleImageClick}>
        <img className="card-img" src={image} alt=" nothing" />
      </div>
      <div className="card-right">
        <div className="card-title">{title}</div>
        <div className="card-para">{des}</div>
      </div>
    </div>
  );
};

export default DepartmentCard;
