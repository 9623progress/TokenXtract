import React from "react";
import "../style/Navbar.css";
import { Link } from "react-router-dom";
import { logout } from "../ReduxStore/reduxSlice/userSlice";
import logo from "../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/logout",
        {},
        {
          withCredentials: true,
        }
      );
      console.log(response);
      if (response.status === 200) {
        dispatch(logout());
      }

      navigate("./");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="navbar-top">
      <div className="navbar-logo">
        <img src={logo} alt="TokenX Track" />
      </div>
      <div className="navbar-left-div">
        <Link to="/" className="navbar-elements">
          Home
        </Link>
        <Link to="/about-us" className="navbar-elements">
          About us
        </Link>
      </div>
      {user ? (
        <div className="right-buttons">
          <div>
            <a className="navbar-right-div" onClick={logoutHandler}>
              Logout
            </a>
          </div>
          {user.role === "cg" && (
            <div>
              <Link className="navbar-right-div" to={"/cg"}>
                Profile
              </Link>
            </div>
          )}
          {user.role == "user" && (
            <div>
              <Link className="navbar-right-div" to={"/user-profile"}>
                Profile
              </Link>
            </div>
          )}
          {user.role == "state" && (
            <div>
              <Link className="navbar-right-div" to={"/state"}>
                Profile
              </Link>
            </div>
          )}
          {user.role == "bank" && (
            <div>
              <Link className="navbar-right-div" to={"/bank"}>
                Profile
              </Link>
            </div>
          )}

          {user.role == "contractor" && (
            <div>
              <Link className="navbar-right-div" to={"/contractor"}>
                Profile
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Link className="navbar-right-div" to="/login">
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
