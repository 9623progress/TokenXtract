import React from "react";
import Front from "./Front";
import Department from "./Department";

const Home = () => {
  return (
    <div>
      <div style={{ margin: "100px" }}>
        <Front />
      </div>
      <Department />
    </div>
  );
};

export default Home;
