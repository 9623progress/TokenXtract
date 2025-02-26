import React from "react";
import "../style/Card.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const DepartmentCard = ({ title, des, image, id }) => {
  const navigate = useNavigate(); // Initializing the useHistory hook
  const user = useSelector((state) => state.user?.user);

  const handleImageClick = () => {
    // Passing the data as state to the /scheme route
    if (!user && user?.role != "user") {
      toast.error("Please Login First as a Scheme Holder");
      return;
    }
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
