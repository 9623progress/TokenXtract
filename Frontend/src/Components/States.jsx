import React from "react";
import { states } from "../utils/State-District-data.js";
import "../style/states.css";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const States = () => {
  const user = useSelector((state) => state.user?.user);
  const navigate = useNavigate();
  const HandleStateClick = (state) => {
    if (!user && user?.role != "contractor") {
      toast.error("Please Login as a Contractor first");
      return;
    }

    navigate("/view-contracts", {
      state: state,
    });
  };
  return (
    <div className="state-container">
      <h1>Contracts</h1>
      <div className="states-top-div">
        {states.map((s) => (
          <div
            className="state-box"
            key={s.state_id}
            onClick={() => {
              HandleStateClick(s.state);
            }}
          >
            <p>{s.state}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default States;
