import React, { useState } from "react";
import "../style/centralGovernment.css";
import flag from "../assets/india-flag.png";
import { Link, Outlet } from "react-router-dom";

const CentralGovernment = () => {
  const [isOpen, setOpen] = useState(false);
  return (
    <div className="cg-box">
      <div className={`cg-navigation-panel ${isOpen ? "cg-nav-open" : ""}`}>
        <div>
          <div className="cg-heading">
            <img src={flag} alt="" />
            <h1>सत्यमेव जयते </h1>
          </div>
          <div className="cg-functions">
            <Link to={"/cg/create-scheme"} className="cg-fun-card">
              <p>Create Schemes</p>
            </Link>
            <Link to={"/cg/view-application"} className="cg-fun-card">
              <p>view Application</p>
            </Link>
            <Link to={"/cg/create-token"} className="cg-fun-card">
              <p>Create Token</p>
            </Link>
            <Link to={"/cg/view-bank-request"} className="cg-fun-card">
              <p>View Bank Requests</p>
            </Link>
            <Link to={"/cg/view-all-scheme"} className="cg-fun-card">
              <p>View All Scheme</p>
            </Link>
            <Link className="cg-fun-card" to={"/cg/create-department"}>
              <p>Add department</p>
            </Link>
            <Link className="cg-fun-card" to={"/cg/view-accepted"}>
              <p>View Accepted </p>
            </Link>
            <Link className="cg-fun-card" to={"/cg/view-rejected"}>
              <p>View Rejected </p>
            </Link>
            <Link className="cg-fun-card" to={"/cg/create-contract"}>
              <p>Create Contract </p>
            </Link>
            <Link className="cg-fun-card" to={"/cg/view-contracts"}>
              <p> view Contracts </p>
            </Link>
            <Link className="cg-fun-card" to={"/cg/view-tenders"}>
              <p>view Tenders </p>
            </Link>
            <Link to={"/cg/getPendingContracts"} className="cg-fun-card">
              Pending Contracts
            </Link>
          </div>
        </div>
        <div
          className="cg-panel-button"
          onClick={() => {
            setOpen(!isOpen);
          }}
        >
          <button>☰</button>
        </div>
      </div>
      <div className="cg-action-panel">
        <Outlet />
      </div>
    </div>
  );
};

export default CentralGovernment;
