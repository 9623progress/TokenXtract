import React from "react";
import "../style/centralFront.css";
import { Link } from "react-router-dom";

const CentralFront = () => {
  return (
    <div className=" central-Front-container">
      <div className="central-front-div2">
        <h1>Central Government Dashboard</h1>
        <div className="cg-Front-option-buttons">
          <Link to={"/cg/create-scheme"} className="cg-main-buttons">
            <p className="cg-main-buttons-heading"> Create Scheme</p>
            <p> Define & manage schemes</p>
          </Link>
          <Link to={"/cg/create-contract"} className="cg-main-buttons">
            <p className="cg-main-buttons-heading">Create Contract</p>
            <p>Set up project agreements</p>
          </Link>
          <Link to={"/cg/my-token"} className="cg-main-buttons">
            <p className="cg-main-buttons-heading">Create Token</p>
            <p> Generate and allocate tokens.</p>
          </Link>
          <Link to={"/cg/view-bank-request"} className="cg-main-buttons">
            <p className="cg-main-buttons-heading">Bank Requests</p>
            <p>Request of token-to-money conversion.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CentralFront;
