import React, { useEffect, useState } from "react";
// import departments from "../utils/DepartmentsData.js";
import DepartmentCard from "./DepartmentCard";
import "../style/Department.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setDepartments } from "../ReduxStore/reduxSlice/department.js";
import Loader from "./Loader.jsx";
import { toast } from "react-toastify";

const Department = () => {
  const dispatch = useDispatch();
  const [dep, setDep] = useState(null);
  const { departments } = useSelector((state) => state.departments);
  const fetch = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/admin/get-departments"
      );

      // console.log(response);
      if (response.status == 200) {
        setDep(response.data.departments);
        dispatch(setDepartments(response.data.departments));
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  useEffect(() => {
    fetch();
  }, []);

  if (dep == null) {
    return <Loader></Loader>;
  }
  return (
    <div className="department">
      <div className="dep-heading">
        <h1>Our Focused Areas of Support</h1>
      </div>
      <div className="department-box">
        {departments.map((data) => (
          <DepartmentCard
            key={data._id}
            title={data.departmentName}
            des={data.des}
            image={data.image}
            id={data._id}
          />
        ))}
      </div>
    </div>
  );
};

export default Department;
