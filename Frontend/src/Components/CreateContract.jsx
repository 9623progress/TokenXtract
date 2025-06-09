import React, { useState, useEffect } from "react";
import { states } from "../utils/State-District-data";
import "../style/createContract.css";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CreateContract = () => {
  const [contractName, setContractName] = useState("");
  const [budget, setBudget] = useState(0);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState([]);
  const [city, setCity] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [legalRules, setLegalRules] = useState("");
  const [stages, setStages] = useState([{ stageName: "", percentage: 0 }]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [secreteKey, setSecreteKey] = useState("");

  const { departments } = useSelector((state) => state.departments);
  const id = useSelector((state) => state.user?.user?.id);

  // Function to generate a random secret key
  const generateSecretKey = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
    let key = "";
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  // Generate secret key when component mounts
  useEffect(() => {
    const key = generateSecretKey();
    setSecreteKey(key);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contract-name") setContractName(value);
    else if (name === "contract-budget") setBudget(value);
    else if (name === "contract-city") setCity(value);
    else if (name === "contract-localAddress") setLocalAddress(value);
    else if (name === "contract-startDate") setStartDate(value);
    else if (name === "contract-endDate") setEndDate(value);
    else if (name === "contract-legalRules") setLegalRules(value);
  };

  const removeStage = (index) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const addStage = () => {
    setStages([...stages, { stageName: "", percentage: 0 }]);
  };

  const handleStateChange = (e) => {
    const stateName = e.target.value;
    setState(stateName);
    const selectedState = states.find((s) => s.state === stateName);
    setDistrict(selectedState?.districts || []);
    setSelectedDistrict("");
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  const HandleStageChange = (index, field, value) => {
    const updatedStages = stages.map((stage, i) =>
      i === index ? { ...stage, [field]: value } : stage
    );
    setStages(updatedStages);
  };

  const HandleSubmit = async () => {
    const totalPercentage = stages.reduce(
      (total, stage) => total + Number(stage.percentage),
      0
    );

    if (totalPercentage !== 100) {
      toast.error("Total stage percentages must sum to exactly 100%");
      return;
    }
    const contractData = {
      contractName,
      budget,
      state,
      district: selectedDistrict,
      city,
      localAddress,
      startDate,
      endDate,
      legalRules,
      stages,
      secreteKey,
    };

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/admin/create-contract/${id}`,
        contractData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast.success(response.data.message || "Contract created successfully");

        setContractName("");
        setBudget(0);
        setState("");
        setDistrict([]);
        setCity("");
        setLocalAddress("");
        setStartDate("");
        setEndDate("");
        setLegalRules("");
        setStages([{ stageName: "", percentage: 0 }]);
        setSelectedDistrict("");
        setSecreteKey(generateSecretKey()); // Regenerate for next form
      } else {
        console.error("Failed to create contract");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="create-contract-top-div">
      <div className="create-tagline">
        <h2>Craft Your Contract with Confidence</h2>
      </div>
      <div className="create-contract-inner-div">
        <div className="create-contract-input-div">
          <label htmlFor="contract-name">Contract Name</label>
          <input
            type="text"
            id="contract-name"
            name="contract-name"
            value={contractName}
            onChange={handleInputChange}
          />
        </div>

        <div className="create-contract-input-div">
          <label htmlFor="contract-budget">Budget</label>
          <input
            type="number"
            id="contract-budget"
            name="contract-budget"
            value={budget}
            onChange={handleInputChange}
          />
        </div>

        <div className="create-contract-input-div">
          <select name="state" onChange={handleStateChange}>
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.state} value={s.state}>
                {s.state}
              </option>
            ))}
          </select>
        </div>

        <div className="create-contract-input-div">
          <select name="district" onChange={handleDistrictChange}>
            <option value="">Select District</option>
            {district.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="create-contract-input-div">
          <label htmlFor="contract-city">City</label>
          <input
            type="text"
            id="contract-city"
            name="contract-city"
            value={city}
            onChange={handleInputChange}
          />
        </div>

        <div className="create-contract-input-div">
          <label htmlFor="contract-localAddress">Local Address</label>
          <input
            type="text"
            id="contract-localAddress"
            name="contract-localAddress"
            value={localAddress}
            onChange={handleInputChange}
          />
        </div>

        <div className="create-contract-input-div">
          <label htmlFor="contract-startDate">Start Date</label>
          <input
            type="date"
            id="contract-startDate"
            name="contract-startDate"
            value={startDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="create-contract-input-div">
          <label htmlFor="contract-endDate">End Date</label>
          <input
            type="date"
            id="contract-endDate"
            name="contract-endDate"
            value={endDate}
            onChange={handleInputChange}
          />
        </div>

        <div className="create-contract-input-div">
          <label htmlFor="contract-secreteKey">
            Secret Key (auto-generated)
          </label>
          <input
            type="text"
            id="contract-secreteKey"
            name="contract-secreteKey"
            value={secreteKey}
            readOnly
          />
        </div>

        <div className="create-contract-input-div">
          <label htmlFor="contract-legalRules">Legal Rules</label>
          <textarea
            id="contract-legalRules"
            name="contract-legalRules"
            value={legalRules}
            onChange={handleInputChange}
            rows="5"
            cols="35"
          />
        </div>

        <div>
          <label>Stages:</label>
          <div className="stages-headding">
            <p>Stage Name & Percentage of amount</p>
          </div>
          {stages.map((s, index) => (
            <div key={index}>
              <input
                type="text"
                value={s.stageName}
                onChange={(e) =>
                  HandleStageChange(index, "stageName", e.target.value)
                }
                placeholder="Stage Name"
              />
              <input
                type="number"
                value={s.percentage}
                onChange={(e) =>
                  HandleStageChange(index, "percentage", e.target.value)
                }
                placeholder="Percentage"
              />
              <button
                className="create-contract-remove-stage-button"
                onClick={() => {
                  removeStage(index);
                }}
              >
                Remove Stage
              </button>
            </div>
          ))}
          <button
            className="create-contract-add-stage-button"
            onClick={addStage}
          >
            Add Stage
          </button>
        </div>

        <div className="submit-button">
          <button className="create-contract-button" onClick={HandleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContract;
