import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/scheme.css";

const Schemes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};
  const [data, setData] = useState("");
  const fetch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/admin//get-scheme/${id}`
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

  const HandleOnClick = (id) => {
    navigate("/scheme-form", { state: { id } });
  };

  const formatSpecialRequirements = (text) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        <span style={{ color: "red" }}> * </span>
        {line}
        <br />
      </React.Fragment>
    ));
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
          {data &&
            data.map((scheme) => (
              <tr key={scheme._id}>
                <td>{scheme.schemeName}</td>
                {/* <td>₹{scheme.budget.toLocaleString()}</td> */}
                <td>₹{scheme.amountPerUser}</td>
                <td>{scheme.minAge} years</td>
                <td>{scheme.maxAge} years</td>
                <td className="nowrap">
                  {formatSpecialRequirements(scheme.specialRequirement)}
                </td>
                <td>
                  <button
                    className="apply-btn"
                    onClick={() => {
                      HandleOnClick(scheme._id);
                    }}
                  >
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          {/* */}
        </tbody>
      </table>
    </div>
  );
};

export default Schemes;
