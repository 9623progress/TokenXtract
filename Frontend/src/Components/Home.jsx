import React from "react";
import Front from "./Front";
import Department from "./Department";
import { useSelector } from "react-redux";
import States from "./States";

const Home = () => {
  const role = useSelector((state) => state.user?.user?.role);

  return (
    <div>
      <div style={{ margin: "100px" }}>
        <Front />
      </div>
      {role == "user" && <Department />}
      {role == "contractor" && <States />}
      {role != "user" && role != "contractor" && (
        <div>
          <Department />
          <States />
        </div>
      )}
    </div>
  );
};

export default Home;
