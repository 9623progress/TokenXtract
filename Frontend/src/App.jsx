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
import UpdateScheme from "./Components/UpdateScheme";
import ViewContracts from "./Components/ViewContracts";
import StateProfile from "./Components/StateProfile";
import ViewAllSCheme from "./Components/ViewAllSCheme";
import CreateDepartment from "./Components/CreateDepartment";
import Accepted from "./Components/Accepted";
import Rejected from "./Components/Rejected";
import ViewTenders from "./Components/ViewTenders";
import CreateContract from "./Components/CreateContract";
import Token from "./Components/Token";
import ViewPendingContract from "./Components/ViewPendingContract";
import ContractorProfile from "./Components/ContractorProfile";
import GetMyApprovedContract from "./Components/getMyApproveContract";
import BankProfile from "./Components/BankProfile";
import CentralFront from "./Components/CentralFront";

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
        { path: "/user-profile", element: <UserProfile /> },
        {
          path: "/cg",
          element: (
            <PrivateRoute role="cg">
              <CentralGovernment />
            </PrivateRoute>
          ),
          children: [
            { path: "/cg/", element: <CentralFront /> },
            { path: "/cg/create-scheme", element: <CreateScheme /> },
            { path: "/cg/view-application", element: <ViewApplication /> },
            { path: "/cg/create-token", element: <CreateToken /> },
            { path: "/cg/view-bank-request", element: <ViewBankRequests /> },
            { path: "/cg/view-all-scheme", element: <ViewAllSCheme /> },
            { path: "/cg/create-department", element: <CreateDepartment /> },
            { path: "/cg/view-accepted", element: <Accepted /> },
            { path: "/cg/view-rejected", element: <Rejected /> },
            { path: "/cg/create-contract", element: <CreateContract /> },
            { path: "/cg/view-contracts", element: <ViewContracts /> },
            { path: "/cg/view-tenders", element: <ViewTenders /> },
            { path: "/cg/my-token", element: <Token /> },
            {
              path: "/cg/getPendingContracts",
              element: <ViewPendingContract />,
            },
          ],
        },
        // {
        //   path: "/cg/create-scheme",
        //   element: (
        //     <PrivateRoute role="cg">
        //       <CreateScheme />
        //     </PrivateRoute>
        //   ),
        // },
        // {
        //   path: "/cg/view-application",
        //   element: (
        //     <PrivateRoute role="cg">
        //       <ViewApplication />
        //     </PrivateRoute>
        //   ),
        // },
        // {
        //   path: "/cg/create-token",
        //   element: (
        //     <PrivateRoute role="cg">
        //       <CreateToken />
        //     </PrivateRoute>
        //   ),
        // },
        // {
        //   path: "/cg/view-bank-request",
        //   element: (
        //     <PrivateRoute role="cg">
        //       <ViewBankRequests />
        //     </PrivateRoute>
        //   ),
        // },
        {
          path: "/update-scheme",
          element: (
            <PrivateRoute role={"cg"}>
              <UpdateScheme />
            </PrivateRoute>
          ),
        },
        {
          path: "/state",
          element: (
            <PrivateRoute role="state">
              <StateProfile />
            </PrivateRoute>
          ),
          children: [
            { path: "/state/create-scheme", element: <CreateScheme /> },
            { path: "/state/view-application", element: <ViewApplication /> },
            { path: "/state/view-all-scheme", element: <ViewAllSCheme /> },
            { path: "/state/view-accepted", element: <Accepted /> },
            { path: "/state/view-rejected", element: <Rejected /> },
            { path: "/state/create-contract", element: <CreateContract /> },
            {
              path: "/state/view-contracts",
              element: <GetMyApprovedContract />,
            },
            { path: "/state/my-token", element: <Token /> },
          ],
        },
        { path: "/scheme", element: <Schemes /> },
        {
          path: "/scheme-form",
          element: <SchemeForm />,
        },
        {
          path: "/view-contracts",
          element: <ViewContracts />,
        },
        {
          path: "/contractor",
          element: <ContractorProfile />,
        },
        {
          path: "/bank",
          element: <BankProfile />,
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
