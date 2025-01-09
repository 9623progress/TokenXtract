import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "../style/ViewApplication.css";

const ViewApplication = () => {
  const { departments } = useSelector((state) => state.departments);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [scheme, setScheme] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [applicants, setApplicants] = useState([]);

  const fetch = useCallback(async (department_id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-scheme/${department_id}`
      );

      if (response.status === 200) {
        setScheme(response.data.schemes);
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
    }
  }, []);

  const HandleDepartmentChange = async (e) => {
    const department_id = e.target.value;
    if (department_id) {
      setSelectedDepartment(department_id);
      fetch(department_id);
    }
  };

  const HandleSchemeChange = (e) => {
    const scheme_id = e.target.value;
    setSelectedScheme(scheme_id);
    fetchApplications(scheme_id);
  };

  const HandleView = (data) => {
    const newTab = window.open(data, "_blank"); // '_blank' opens in a new tab
    newTab.focus(); // Focus on the new tab
  };

  const fetchApplications = useCallback(async (scheme_id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-applications/${scheme_id}`
      );
      if (response.status === 200) {
        setApplicants(response.data.applicants);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  }, []);

  const handleAccept = async (applicantId) => {};

  const handleReject = async (applicantId) => {};

  const renderTable = () => {
    if (applicants.length === 0) {
      return <p>No applicants found for the selected scheme.</p>;
    }

    // Extract headers dynamically from the first applicant object
    // console.log(applicants);
    const headers = applicants[0].responses.map(
      (response) => response.key.label
    );
    console.log(headers);
    return (
      <table border="1">
        <thead>
          <tr>
            {headers && headers.map((header) => <th key={header}>{header}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant._id}>
              {console.log(applicant)}
              {applicant &&
                applicant.responses.map((res) => (
                  <td key={res.key}>
                    {res.key.type == "image" ? (
                      <button
                        onClick={() => {
                          HandleView(res.value);
                        }}
                      >
                        {" "}
                        view{" "}
                      </button>
                    ) : (
                      res.value
                    )}
                  </td>
                ))}
              <td>
                <button onClick={() => handleAccept(applicant._id)}>
                  Accept
                </button>
                <button
                  onClick={() => handleReject(applicant._id)}
                  style={{ marginLeft: "10px" }}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="view-application-top-div">
      <select value={selectedDepartment} onChange={HandleDepartmentChange}>
        <option value="">Select Department</option>
        {departments &&
          departments.map((dep) => (
            <option key={dep._id} value={dep._id}>
              {dep.departmentName}
            </option>
          ))}
      </select>

      <select value={selectedScheme} onChange={HandleSchemeChange}>
        <option value="">Select Scheme</option>
        {scheme &&
          scheme.map((sc) => (
            <option key={sc._id} value={sc._id}>
              {sc.schemeName}
            </option>
          ))}
      </select>

      {renderTable()}
    </div>
  );
};

export default ViewApplication;
