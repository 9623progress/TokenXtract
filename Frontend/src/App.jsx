import React, { useEffect, useState } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Components/Layout";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import CentralGovernment from "./Components/CentralGovernment";
import Home from "./Components/Home";
import CreateScheme from "./Components/CreateScheme";
import ViewApplication from "./Components/ViewApplication";
import CreateToken from "./Components/CreateToken";
import ViewBankRequests from "./Components/ViewBankRequests";
import AboutUs from "./Components/AboutUs";
import ContactUs from "./Components/ContactUs";
import OurServices from "./Components/OurServices";
import Schemes from "./Components/Schemes";
import UserProfile from "./Components/UserProfile";
import PrivateRoute from "./Components/PrivateRoute";
import validateAuth from "./utils/isValidate";
import { useDispatch } from "react-redux";
import { logout } from "./ReduxStore/reduxSlice/userSlice";
import SchemeForm from "./Components/SchemeForm";

const App = () => {
  const dispatch = useDispatch();
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <Home /> },
        {
          path: "/login",
          element: <Login />,
        },
        { path: "/about-us", element: <AboutUs /> },
        { path: "/contact-us", element: <ContactUs /> },
        { path: "/our-services", element: <OurServices /> },
        { path: "/signin", element: <Signup /> },

        // User Profile Route
        { path: "/user-profile", element: <UserProfile /> },

        // Central Government Route protected by role
        {
          path: "/cg",
          element: (
            <PrivateRoute role="cg">
              <CentralGovernment />
            </PrivateRoute>
          ),
        },

        // Central Government child routes
        {
          path: "/cg/create-scheme",
          element: (
            <PrivateRoute role="cg">
              <CreateScheme />
            </PrivateRoute>
          ),
        },
        {
          path: "/cg/view-application",
          element: (
            <PrivateRoute role="cg">
              <ViewApplication />
            </PrivateRoute>
          ),
        },
        {
          path: "/cg/create-token",
          element: (
            <PrivateRoute role="cg">
              <CreateToken />
            </PrivateRoute>
          ),
        },
        {
          path: "/cg/view-bank-request",
          element: (
            <PrivateRoute role="cg">
              <ViewBankRequests />
            </PrivateRoute>
          ),
        },

        // Other routes
        { path: "/scheme", element: <Schemes /> },
        {
          path: "/scheme-form",
          element: <SchemeForm />,
        },
      ],
    },
  ]);

  //for check when when website load
  // useEffect(async () => {
  //   const isAuthenticated = await validateAuth();
  //   if (!isAuthenticated) {
  //     dispatch(logout());
  //     localStorage.removeItem("user");
  //   }
  // }, []);

  //checking by after every 5 min is token expire
  useEffect(() => {
    const interval = setInterval(async () => {
      const isAuthenticated = await validateAuth();
      if (!isAuthenticated) {
        dispatch(logout());
        localStorage.removeItem("user");
      }
    }, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right" // Toast position
        autoClose={5000} // Duration in milliseconds before the toast disappears
        hideProgressBar={false} // Show/hide progress bar
        newestOnTop={false} // Whether to show new toast above the older ones
        closeOnClick // Allow closing by clicking on the toast
        rtl={false} // Right-to-left languages
        pauseOnFocusLoss // Pause the toast when the window loses focus
        draggable // Allow dragging the toast
        pauseOnHover // Pause the toast when hovered over
      />
    </div>
  );
};

export default App;
