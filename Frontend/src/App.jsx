import { useEffect, useState } from "react";
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

// ✅ Import Blockchain Functions
import { connectWallet, mintTokens, fetchTotalSupply } from "./Blockchain";

const App = () => {
  const dispatch = useDispatch();
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [mintAmount, setMintAmount] = useState("");
  const [totalSupply, setTotalSupply] = useState("");

  // ✅ Handle Wallet Connection
  const handleConnectWallet = async () => {
    const wallet = await connectWallet();
    if (wallet) {
      setAccount(await wallet.signer.getAddress());
      setContract(wallet.contract);
    }
  };

  // ✅ Handle Minting Tokens (Government Enter Rs → Convert to Tokens)
  const handleMintTokens = async () => {
    await mintTokens(contract, mintAmount);
  };

  // ✅ Handle Fetching Total Supply
  const handleFetchTotalSupply = async () => {
    const supply = await fetchTotalSupply(contract);
    setTotalSupply(supply);
  };

  // ✅ Add Blockchain Features to `CreateToken` Page
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/login", element: <Login /> },
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
              <CreateToken
                account={account}
                handleConnectWallet={handleConnectWallet}
                handleMintTokens={handleMintTokens}
                handleFetchTotalSupply={handleFetchTotalSupply}
                totalSupply={totalSupply}
                setMintAmount={setMintAmount}
              />
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
        {
          path: "/update-scheme",
          element: (
            <PrivateRoute role={"cg"}>
              <UpdateScheme />
            </PrivateRoute>
          ),
        },

        // Other routes
        { path: "/scheme", element: <Schemes /> },
        { path: "/scheme-form", element: <SchemeForm /> },
        { path: "/view-contracts", element: <ViewContracts /> },
      ],
    },
  ]);

  // ✅ Check authentication status every 5 minutes
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
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default App;
