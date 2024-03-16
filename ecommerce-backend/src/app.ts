import express, { urlencoded } from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import productRoute from "./routes/product.js";
import { allowedNodeEnvironmentFlags } from "process";

const app = express();
app.use(express.json());

const port = 4000;
connectDB();
app.get("/", (req, res) => res.send("api is working"));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log("app in running on port  ", port);
});
