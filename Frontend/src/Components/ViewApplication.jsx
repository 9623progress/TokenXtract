import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "../style/ViewApplication.css";
import { toast } from "react-toastify";

const ViewApplication = () => {
  const { departments } = useSelector((state) => state.departments);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [scheme, setScheme] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [applicants, setApplicants] = useState([]);

  const fetch = useCallback(async (department_id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-scheme/${department_id}`,
        { withCredentials: true }
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
    const newTab = window.open(data, "_blank");
    newTab.focus();
  };

  const fetchApplications = useCallback(async (scheme_id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin/get-applications/${scheme_id}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        setApplicants(response.data.applicants);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  }, []);

  const handleAccept = async (applicantId) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/v1/admin/accept-form/${applicantId}`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(response.data.message || "Form accepted");
  
        // Update state immediately
        setApplicants((prevApplicants) =>
          prevApplicants.map((applicant) =>
            applicant._id === applicantId
              ? { ...applicant, Accepted: true, Rejected: false }
              : applicant
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };
  
  const handleReject = async (applicantId) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/v1/admin/reject-form/${applicantId}`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success(response.data.message || "Form rejected");
  
        // Update state immediately
        setApplicants((prevApplicants) =>
          prevApplicants.map((applicant) =>
            applicant._id === applicantId
              ? { ...applicant, Accepted: false, Rejected: true }
              : applicant
          )
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };
  

  const renderTable = () => {
    if (applicants.length === 0) {
      return <p>No applicants found for the selected scheme.</p>;
    }

    // Sorting responses based on key._id
    const sortedApplicants = applicants.map((applicant) => {
      const sortedResponses = [...applicant.responses].sort((a, b) => {
        return a.key._id.localeCompare(b.key._id); // Ascending order
      });
      return { ...applicant, responses: sortedResponses };
    });

    // Extracting headers dynamically from the sorted responses
    const headers = sortedApplicants[0]?.responses.map(
      (response) => response.key.label
    );

    return (
      <table border="1">
        <thead>
          <tr>
            {headers && headers.map((header) => <th key={header}>{header}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedApplicants.map((applicant) => (
            <tr key={applicant._id}>
              {/* {console.log("applicants",applicant)} */}
              {applicant.responses.map((res) => (
                <td key={res.key._id}>
                  {res.key.type === "image" ? (
                    <button
                      className="view-application-button"
                      onClick={() => HandleView(res.value)}
                    >
                      View
                    </button>
                  ) : (
                    res.value
                  )}
                </td>
              ))}
              <td>
                <>
                  {/* {stage.approve ? (
                      <span>✅ Approved</span>
                    ) : (
                      <button
                        onClick={() =>
                          handleApproveStage(
                            stage._id,
                            stage.proof,
                            stage.percentage
                          )
                        }
                      >
                        Approve Stage
                      </button>
                    )} */}
                  {/* {console.log("app.accepted",applicant.Accepted)} */}
                  {applicant.Accepted ? (
                    
                    <button
                      className="accept"
                      onClick={() => handleAccept(applicant._id)}
                      style={{ backgroundColor: "green" }}
                    >
                      Accepted
                    </button>
                  ) : (
                    <button
                      className="accept"
                      onClick={() => handleAccept(applicant._id)}
                      style={{ backgroundColor: "green" }}
                    >
                      Accept
                    </button>
                  )}
                  {applicant.Rejected ? (
                    <button
                      className="reject"
                      onClick={() => handleReject(applicant._id)}
                      style={{ marginLeft: "10px", backgroundColor: "red" }}
                    >
                      Rejected
                    </button>
                  ) : (
                    <button
                      className="reject"
                      onClick={() => handleReject(applicant._id)}
                      style={{ marginLeft: "10px", backgroundColor: "red" }}
                    >
                      Reject
                    </button>
                  )}
                </>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="view-application-top-div">
      <div className="view-application-select-div">
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
      </div>

      <div className="view-application-table">{renderTable()}</div>
    </div>
  );
};

export default ViewApplication;
