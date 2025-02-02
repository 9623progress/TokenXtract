import React from "react";
import { ColorRing } from "react-loader-spinner";

const Loader = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ColorRing
        visible={true}
        height="40"
        width="40"
        ariaLabel="color-ring-loading"
        wrapperStyle={{}}
        wrapperClass="color-ring-wrapper"
        colors={["#1E3A8A", "#3B82F6", "#93C5FD", "#60A5FA", "#2563EB"]}
      />
    </div>
  );
};

export default Loader;
