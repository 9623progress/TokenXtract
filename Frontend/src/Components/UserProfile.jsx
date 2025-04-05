import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../style/Profile.css";
import axios from "axios";
import { toast } from "react-toastify";

const UserProfile = () => {
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const [editingScheme, setEditingScheme] = useState(null);
  const [updatedResponses, setUpdatedResponses] = useState({});
  const [totalTokensReceived, setTotalTokensReceived] = useState(0);
  // const [currentTokenBalance, setCurrentTokenBalance] = useState(0);

  const user = useSelector((state) => state.user.user);

  if (!user) {
    return <p>Loading user data...</p>;
  }

  const firstLetter = user.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    fetchAppliedSchemes();
    calculateTokenStats();
    fetchTokenStats();
  }, [user]);

  const fetchTokenStats = async () => {
    try {
      console.log("Fetching token stats..."); // Debug log
      const response = await axios.get(
        "http://localhost:5000/api/v1/user/getTokenStats",
        { withCredentials: true }
      );
  
      console.log("Response received:", response.data); // Debug log
  
      if (response.data.success) {
        setTotalTokensReceived(response.data.totalTokensReceived);
      } else {
        console.error("Failed to fetch token stats:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching token stats:", error.response?.data || error);
      // toast.error("Error fetching token stats");
    }
  };
  
  // Fetch on mount

  
  const fetchAppliedSchemes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/user/getMyAppliedSchemes",
        { withCredentials: true }
      );
      if (response.status === 200) {
        setAppliedSchemes(response.data.appliedSchemes);
      }
    } catch (error) {
      console.error("Error fetching applied schemes:", error);
      toast.error("Error fetching applied schemes");
    }
  };

  const calculateTokenStats = () => {
    if (!user.tokenHistory || user.tokenHistory.length === 0) {
      setTotalTokensReceived(0);
      // setCurrentTokenBalance(0);
      return;
    }

    let totalReceived = 0;
    // let currentBalance = 0;

    user.tokenHistory.forEach((txn) => {
      const amount = Number(txn.amount || 0);

      if (amount > 0) {
        totalReceived += amount;
      }

      // currentBalance += amount;
    });

    setTotalTokensReceived(totalReceived);
    // setCurrentTokenBalance(currentBalance);
  };

  const handleReapplyClick = (scheme) => {
    if (!scheme.responses || scheme.responses.length === 0) {
      console.warn("No responses found for this scheme.");
      return;
    }

    setEditingScheme(scheme);
    setUpdatedResponses(
      scheme.responses.reduce((acc, response) => {
        acc[response.key] = response.value || "";
        return acc;
      }, {})
    );
  };

  const handleInputChange = (e, key) => {
    setUpdatedResponses({ ...updatedResponses, [key]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!editingScheme || !editingScheme._id) {
      console.error("Error: Application ID (_id) is missing!");
      return;
    }

    const applicationId = editingScheme._id;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/user/reapply/${applicationId}`,
        { updatedResponses },
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Reapplied successfully!");
      }
    } catch (error) {
      console.error("Failed to resubmit application:", error);
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-box">
          <div className="profile-initial">{firstLetter}</div>
          <h1 className="profile-name">{user.name}</h1>
          <div className="profile-line" />
          <div className="profile-details">
            <p>
              Aadhar: <span>{user.adhar || "Not Available"}</span>
            </p>
            <p>
              Role: <span>{user.role || "Unknown"}</span>
            </p>
            <p>
              {/* Total Tokens Received: <span>{totalTokensReceived ?? "00"}</span> */}
            </p>
            {/* <p>
              Available Wallet Balance: <span>{currentTokenBalance}</span>
            </p> */}
          </div>
        </div>
      </div>

      <div>
        <div className="applied-schemes-container">
          <h2>{user?.name}'s Applied Schemes</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Status</th>
                <th>Fund Disbursed</th>
                <th>Tokens Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appliedSchemes.length > 0 ? (
                appliedSchemes.map((scheme) => (
                  <tr key={scheme._id}>
                    <td>{scheme.schemeName}</td>
                    <td>
                      {scheme.accepted
                        ? "✅ Accepted"
                        : scheme.rejected
                        ? "❌ Rejected"
                        : "⏳ Pending"}
                    </td>
                    <td>{scheme.fundDisbursed ? "Yes" : "No"}</td>
                    <td>{scheme.tokensReceived}</td>
                    <td>
                      {scheme.rejected && (
                        <button onClick={() => handleReapplyClick(scheme)}>
                          Reapply
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No schemes applied yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editingScheme && (
          <div className="resubmission-form">
            <h3>Update Your Application for {editingScheme.schemeName}</h3>
            {editingScheme?.responses?.map((response) => (
              <div key={response.key}>
                <label>{response.label || "Unknown Field"}:</label>
                <input
                  type="text"
                  value={updatedResponses[response.key] || ""}
                  onChange={(e) => handleInputChange(e, response.key)}
                />
              </div>
            ))}
            <button onClick={handleSubmit}>Submit Reapplication</button>
            <button onClick={() => setEditingScheme(null)}>Cancel</button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserProfile;
