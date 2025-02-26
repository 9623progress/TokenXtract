import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ViewPendingContract = () => {
  const [contracts, setContracts] = useState([]);
  const [reciever, setReciever] = useState("");
  const sender = useSelector((state) => state.user?.user?.walletAddress);

  const getPendingContract = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/admin/getPendingContract"
      );
      console.log(res);
      if (res.status == 200) {
        setContracts(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const ApproveContract = async (creator, contract_id) => {
    try {
      getWalleteId(creator);
    } catch (error) {}
  };

  const getWalleteId = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/v1/user/getWalleteId/${id}`
      );
      console.log(res);
      if (res.status == 200) {
        setReciever(res.data.walletAddress);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPendingContract();
  }, []);
  return (
    <div>
      <div className="view-contracts-container">
        {contracts.length > 0 ? (
          <table className="contracts-table">
            <thead>
              <tr>
                <th>Contract Name</th>
                <th>Budget</th>
                <th>State</th>
                <th>District</th>
                <th>City</th>
                <th>Local Address</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Legal Rules</th>
                <th>Stages</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract._id}>
                  <td>{contract.contractName}</td>
                  <td>{contract.budget}</td>
                  <td>{contract.state}</td>
                  <td>{contract.district}</td>
                  <td>{contract.city}</td>
                  <td>{contract.localAddress}</td>
                  <td>{contract.startDate}</td>
                  <td>{contract.endDate}</td>
                  <td>{contract.legalRules}</td>
                  <td>
                    <ul>
                      {contract.stages.map((stage, index) => (
                        <li key={index}>
                          {stage.stageName} - {stage.percentage}%
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <button
                      className="apply-button"
                      onClick={() => {
                        ApproveContract(contract.creator, contract._id);
                      }}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Pending contracts found for the state</p>
        )}
      </div>
    </div>
  );
};

export default ViewPendingContract;
