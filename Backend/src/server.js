import connect from "./utils/db.js";
import express from "express";
import dotenv from "dotenv";
import userRoute from "../src/routes/user.route.js";
import cors from "cors";
import cookieParse from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Allow credentials (cookies)
  })
);
app.use(cookieParse());
app.use(express.json());
app.use("/api/v1/user", userRoute);
app.listen(port, () => {
  connect();
  console.log(`listening on port ${port}`);
});
