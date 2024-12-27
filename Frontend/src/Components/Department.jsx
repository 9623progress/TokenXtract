import React from "react";
import departments from "../utils/DepartmentsData.js";
import DepartmentCard from "./DepartmentCard";
import "../style/Department.css";

const Department = () => {
  return (
    <div className="department">
      <div className="dep-heading">
        <h1>Our Focused Areas of Support</h1>
      </div>
      <div className="department-box">
        {departments.map((data) => (
          <DepartmentCard
            key={data.id}
            title={data.name}
            des={data.tagline}
            image={data.image}
          />
        ))}
      </div>
    </div>
  );
};

export default Department;
