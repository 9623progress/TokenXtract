import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ role, children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  if (!user) {
    // Redirect to login if the user is not logged in
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    // Redirect to home or another page if the user does not have the correct role
    return <Navigate to="/" />;
  }

  return children || <Outlet />; // Allow access to the children route if role is correct
};

export default PrivateRoute;
