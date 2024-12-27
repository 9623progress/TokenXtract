import React from "react";
import { useLocation } from "react-router-dom";

const Schemes = () => {
  const location = useLocation();

  const { title } = location.state || {};
  return <div style={{ margin: "100px" }}>comming soon {title}</div>;
};

export default Schemes;
