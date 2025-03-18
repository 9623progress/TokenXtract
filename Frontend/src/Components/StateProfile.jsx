import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import flag from "../assets/india-flag.png";

const StateProfile = () => {
  const [isOpen, setOpen] = useState(true);
  return (
    <div className="cg-box">
      <div className={`cg-navigation-panel ${isOpen ? "cg-nav-open" : ""}`}>
        <div>
          <div className="cg-heading">
            <img src={flag} alt="" />
            <h1>सत्यमेव जयते </h1>
            <p>STATE GOVERNMENT</p>
          </div>
          <div className="cg-functions">
            <Link to={"/state/create-scheme"} className="cg-fun-card">
              <p>Create Schemes</p>
            </Link>
            <Link to={"/state/view-application"} className="cg-fun-card">
              <p>View Application</p>
            </Link>
            <Link to={"/state/view-all-scheme"} className="cg-fun-card">
              <p>View All Scheme</p>
            </Link>
            <Link className="cg-fun-card" to={"/state/view-accepted"}>
              <p>View Accepted </p>
            </Link>
            {/* <Link className="cg-fun-card" to={"/state/view-rejected"}>
              <p>View Rejected </p>
            </Link> */}
            <Link className="cg-fun-card" to={"/state/create-contract"}>
              <p>Create Contract </p>
            </Link>
            <Link className="cg-fun-card" to={"/state/view-contracts"}>
              <p> Approve Contracts </p>
            </Link>
            {/* <Link className="cg-fun-card" to={"/cg/view-tenders"}>
              <p>view Tenders </p>
            </Link> */}
            <Link className="cg-fun-card" to={"/state/my-token"}>
              Token Balance
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

export default StateProfile;

//  functionality state should have
//  create scheme
//  create Contract
//  pendding scheme
//  pending approval
//  approved Scheme -view applicants - accept the application
//  approved Contract option open contractor details and stages -have option mark stage completed
//  fund disburst option for schemes
