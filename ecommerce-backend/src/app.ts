import express, { urlencoded } from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import productRoute from "./routes/product.js";
import { allowedNodeEnvironmentFlags } from "process";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payments.js";
import dashboardRoute from "./routes/stats.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

connectDB(mongoUri);
app.get("/", (req, res) => res.send("api is working"));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads", express.static("uploads"));

app.use(errorMiddleware);

app.listen(port, () => {
  console.log("app in running on port  ", port);
});
