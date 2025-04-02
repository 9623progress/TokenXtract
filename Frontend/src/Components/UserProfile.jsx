import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../style/Profile.css";
import axios from "axios";
import { toast } from "react-toastify";

const UserProfile = () => {
  const [appliedSchemes, setAppliedSchemes] = useState([]);
  const [editingScheme, setEditingScheme] = useState(null);
  const [updatedResponses, setUpdatedResponses] = useState({});
  // const { user } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.user.user);

  console.log("Redux State:", user); // Debugging Redux State

  if (!user) {
    console.warn("User data is undefined or not loaded yet.");
    return <p>Loading user data...</p>;
  }

  if (!user.name) {
    console.warn("User name is missing in the user object.");
  }

  if (!user.tokenHistory) {
    console.warn("User tokenHistory is undefined.");
  }

  const firstLetter = user.name?.charAt(0)?.toUpperCase() || "U"; // Handle undefined cases

  useEffect(() => {
    fetchAppliedSchemes();
  }, []);

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
      toast.error("Error fetching applied schemes", error);
    }
  };

  const handleReapplyClick = (scheme) => {
    setEditingScheme(scheme);
    setUpdatedResponses(
      scheme.responses.reduce((acc, response) => {
        acc[response.key._id] = response.value;
        return acc;
      }, {})
    );
  };
  
  const handleInputChange = (e, key) => {
    setUpdatedResponses({ ...updatedResponses, [key]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/v1/user/reapply/${editingScheme._id}`,
        { updatedResponses },
        { withCredentials: true }
      );

      toast.success("Application resubmitted for approval!");
      setEditingScheme(null);
      fetchAppliedSchemes(); // Refresh the list
    } catch (error) {
      toast.error("Failed to resubmit application");
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
              Adhar : <span>{user.adhar || "Not Available"}</span>
            </p>
            <p>
              Role: <span>{user.role || "Unknown"}</span>
            </p>
            <p>
              Total Tokens Received:{" "}
              <span>{user.totalTokensReceived ?? "0"}</span>
            </p>
            <h3>Transaction History</h3>
            <ul>
              {Array.isArray(user.tokenHistory) &&
              user.tokenHistory.length > 0 ? (
                user.tokenHistory.map((tx, index) => (
                  <li key={index}>
                    Scheme ID: {tx.schemeID || "Unknown"}, Amount:{" "}
                    {tx.amount || "N/A"}, Date:{" "}
                    {tx.date ? new Date(tx.date).toLocaleDateString() : "N/A"}
                  </li>
                ))
              ) : (
                <p>No transactions available</p>
              )}
            </ul>
          </div>
        </div>
      </div>



      <div>
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
                  {scheme.accepted ? "✅ Accepted" : scheme.rejected ? "❌ Rejected" : "⏳ Pending"}
                </td>
                <td>{scheme.fundDisburst ? "Yes" : "No"}</td>
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

      {editingScheme && (
        <div>
          <h3>Update Your Application for {editingScheme.schemeName}</h3>
          {editingScheme?.responses?.map((response) => (
            <div key={response.key._id}>
              <label>{response.key.label}:</label>
              <input
                type="text"
                value={updatedResponses[response.key._id] || ""}
                onChange={(e) => handleInputChange(e, response.key._id)}
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
