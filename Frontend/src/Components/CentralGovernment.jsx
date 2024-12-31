import React, { useState } from "react";
import "../style/centralGovernment.css";
import flag from "../assets/india-flag.png";
import { Link } from "react-router-dom";
import CreateScheme from "./CreateScheme";
import ViewApplication from "./ViewApplication";
import CreateToken from "./CreateToken";
import ViewBankRequest from "./ViewBankRequests";
import ViewAllSCheme from "./ViewAllSCheme";
import CreateDepartment from "./createDepartment";

const CentralGovernment = () => {
  //create scheme
  //view application-approve ,reject
  // two types of application-by scheme and contractors application
  //create Token
  //veiw Bank request -convert Token to money

  const [isOpen, setOpen] = useState(false);
  const [active, setActive] = useState(<CreateScheme />);

  const HandleClick = (type) => {
    if (type == "view Application") {
      setActive(<ViewApplication />);
    } else if (type == "Create Token") {
      setActive(<CreateToken />);
    } else if (type == "view Bank Request") {
      setActive(<ViewBankRequest />);
    } else if (type == "View All Scheme") {
      setActive(<ViewAllSCheme />);
    } else if ("create department") {
      setActive(<CreateDepartment />);
    } else {
      setActive(<CreateScheme />);
    }
  };

  return (
    <div className="cg-box">
      <div className={`cg-navigation-panel ${isOpen ? "cg-nav-open" : ""}`}>
        <div>
          <div className="cg-heading">
            <img src={flag} alt="" />
            <h1>सत्यमेव जयते </h1>
          </div>
          <div className="cg-functions">
            <a
              onClick={() => {
                HandleClick("");
              }}
              className="cg-fun-card"
            >
              <p>Create Schemes</p>
            </a>
            <a
              onClick={() => {
                HandleClick("view Application");
              }}
              className="cg-fun-card"
            >
              <p>view Application</p>
            </a>
            <a
              onClick={() => {
                HandleClick("Create Token");
              }}
              className="cg-fun-card"
            >
              <p>Create Token</p>
            </a>
            <a
              onClick={() => {
                HandleClick("view Bank Request");
              }}
              className="cg-fun-card"
            >
              <p>View Bank Requests</p>
            </a>
            <a
              onClick={() => {
                HandleClick("View All Scheme");
              }}
              className="cg-fun-card"
            >
              <p>View All Scheme</p>
            </a>

            <a
              className="cg-fun-card"
              onClick={() => {
                HandleClick("create department");
              }}
            >
              <p>Add department</p>
            </a>
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
      <div className="cg-action-panel">{active}</div>
    </div>
  );
};

export default CentralGovernment;
