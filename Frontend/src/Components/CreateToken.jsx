import React, { useState } from "react";
import "../style/createToken.css";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
const CreateToken = () => {
  const [token, setToken] = useState(0);
  const id = useSelector((state) => state.user.user.id);
  const Actualtoken = useSelector((state) => state.user.user.Token);
  const handleTokenChange = (e) => {
    setToken(e.target.value);
  };

  const HandleCreateToken = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/admin/create-token",
        {
          TokenAmount: token,
          userId: id,
        },
        {
          withCredentials: true,
        }
      );

      console.log(response);

      if (response.status == 200) {
        setToken(0);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="create-token-top-div">
      <div className="create-token-box">
        <div className="create-token-input">
          <label htmlFor="create-token">Enter Token Amount : </label>
          <input
            id="create-token"
            type="number"
            placeholder="Token"
            value={token}
            onChange={handleTokenChange}
          />
        </div>
        <button className="create-token-button" onClick={HandleCreateToken}>
          Create Tokens
        </button>
      </div>
    </div>
  );
};

export default CreateToken;
