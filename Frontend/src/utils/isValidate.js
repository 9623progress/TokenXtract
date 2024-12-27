import axios from "axios";

async function validateAuth() {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/v1/user/isAuthenticated",
      {
        withCredentials: true,
      }
    );
    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error validating auth:", error);
    return false;
  }
}

export default validateAuth;
