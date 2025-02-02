import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "../style/viewTenders.css";
import { toast } from "react-toastify";

const ViewTenders = () => {
  const { departments } = useSelector((state) => state.departments);
  const [selectedDepartmentId, setSelectedDepartemntId] = useState("");
  const [selctedContractId, setSelectedContractId] = useState("");
  const [applications, setApplications] = useState([]);
  const [contracts, setContracts] = useState([]);

  const HandleDepartmentChange = (e) => {
    setSelectedDepartemntId(e.target.value);
    fetchContracts(e.target.value);
  };

  const HandleContractChange = async (e) => {
    setSelectedContractId(e.target.value);
    fetchTenders(e.target.value);
  };
  const fetchContracts = async (deprtmentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-contract-by-department/${deprtmentId}`
      );

      if (response.status == 200) {
        setContracts(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTenders = async (contractId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-contracts/${contractId}`,
        { withCredentials: true }
      );

      // console.log(response.data);
      if (response.status == 200) {
        setApplications(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleAssign = async (contractorId) => {
    // console.log(contractorId);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/admin/assignContract/${selctedContractId}`,
        { contractorId },
        { withCredentials: true }
      );

      if (response.status == 200) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="">
      <div className="tender-application-container">
        <div>
          <select name="" id="" onChange={HandleDepartmentChange}>
            <option value="">Select Department</option>
            {departments &&
              departments.map((department) => (
                <option value={department._id} key={department._id}>
                  {department.departmentName}
                </option>
              ))}
          </select>

          <select name="" id="" onChange={HandleContractChange}>
            <option value=""> Selected Contract</option>
            {contracts &&
              contracts.map((contract) => (
                <option value={contract._id} key={contract._id}>
                  {contract.contractName}
                </option>
              ))}
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Adhar Number</th>
              <th>Mobile Number</th>
              <th>Tender Pdf</th>
              <th>Applied Budget</th>
              <th>Assign Contract</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 &&
              applications.map((applicant) => (
                <tr key={applicant._id}>
                  <td>{applicant.userId.name}</td>
                  <td>{applicant.userId.adhar}</td>
                  <td>{applicant.userId.mobile}</td>
                  <td>
                    <a
                      href={applicant.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button>PDF</button>
                    </a>
                  </td>
                  <td>{applicant.Budget}</td>
                  <td>
                    <button
                      onClick={() => {
                        HandleAssign(applicant.userId._id);
                      }}
                    >
                      Assign Contract
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewTenders;
