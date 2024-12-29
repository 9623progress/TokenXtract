import connect from "./utils/db.js";
import express from "express";
import dotenv from "dotenv";
import userRoute from "../src/routes/user.routes.js";
import cors from "cors";
import cookieParse from "cookie-parser";
import adminRoute from "./routes/admin.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  })
);
app.use(cookieParse());
app.use(express.json());
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.listen(port, () => {
  connect();
  console.log(`listening on port ${port}`);
});
