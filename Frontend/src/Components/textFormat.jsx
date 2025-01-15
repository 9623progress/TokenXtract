import React from "react";

export const formatSpecialRequirements = (text) => {
  return text.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      <span style={{ color: "red" }}> * </span>
      {line}
      <br />
    </React.Fragment>
  ));
};
