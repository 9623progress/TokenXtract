import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/scheme.css";
import { formatSpecialRequirements } from "./textFormat";
import Loader from "./Loader.jsx";
const Schemes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [data, setData] = useState("");
  const fetch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin//get-scheme/${id}`,
        { withCredentials: true }
      );
      console.log(response);
      if (response.status == 200) {
        setData(response.data.schemes);
        console.log(data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetch();
  }, []);

  const HandleOnClick = (id, schemeName) => {
    navigate("/scheme-form", { state: { id, schemeName } });
  };

  return (
    <div style={{ margin: "100px" }}>
      <table>
        <thead>
          <tr>
            <th>Scheme Name</th>
            {/* <th>Budget</th> */}
            <th>Amount Per User</th>
            <th>Min Age</th>
            <th>Max Age</th>
            <th>Special Requirements</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data ? (
            data.map((scheme) => (
              <tr key={scheme._id}>
                <td>{scheme.schemeName}</td>
                {/* <td>₹{scheme.budget.toLocaleString()}</td> */}
                <td>₹{scheme.amountPerUser.toLocaleString()}</td>
                <td>{scheme.minAge} years</td>
                <td>{scheme.maxAge} years</td>
                <td className="nowrap">
                  {formatSpecialRequirements(scheme.specialRequirement)}
                </td>
                <td>
                  <button
                    className="apply-btn"
                    onClick={() => {
                      HandleOnClick(scheme._id, scheme.schemeName);
                    }}
                  >
                    Apply
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <Loader />
          )}
          {/* */}
        </tbody>
      </table>
    </div>
  );
};

export default Schemes;
