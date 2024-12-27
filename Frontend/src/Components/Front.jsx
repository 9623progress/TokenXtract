import React, { useEffect, useState } from "react";
import "../style/Front.css";
import central from "../assets/Central.png";
import state from "../assets/State.png";
import Dis from "../assets/District.png";
import Bank from "../assets/Bank.png";
import people from "../assets/people.png";
import Ashok from "../assets/Ashok.png";
const Front = () => {
  const words = [
    "Transparency",
    "Accountability",
    "Fairness",
    "Efficiency",
    "Security",
    "Accessibility",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [words.length]);
  return (
    <div className="front-top">
      <div className="front-heading">
        <h1>
          Empowering Citizens with{" "}
          <span className="changingWord">{words[index]}</span>
        </h1>
        <p>
          "Imagine a world where every citizen can follow public funds down to
          the last penny. Our platform brings that vision to life, offering an
          open, transparent ledger that safeguards against corruption and
          promotes responsible spending at every level of government."
        </p>
      </div>
      <div className="front-circle-container">
        <div className="front-icon">
          Central Government <img src={central} alt="" />
        </div>
        <div className="front-icon">
          State Government <img src={state} alt="" />
        </div>
        <div className="front-icon">
          District Government <img src={Dis} alt="" />
        </div>
        <div className="front-icon">
          Scheme Holder <img src={people} alt="" />
        </div>
        <div className="front-icon">
          Bank
          <img src={Bank} alt="" />
        </div>

        <div className="front-center-icon">
          <img className="front-center" src={Ashok} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Front;
