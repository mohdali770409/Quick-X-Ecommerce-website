import express from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
const app = express();
app.use(express.json());
const port = 4000;
connectDB();
app.get("/", (req, res) => res.send("api is working"));
app.use("/api/v1/user", userRoute);
app.listen(port, () => {
    console.log("app in running on port  ", port);
});
