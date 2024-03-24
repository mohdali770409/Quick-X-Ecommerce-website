import express from "express";
const app = express.Router();

import { adminOnly } from "../middlewares/auth.js";
import { myOrders, newOrder,allOrders } from "../controllers/order.js";

app.post("/new", newOrder);
app.get("/my", myOrders);
app.get("/all", allOrders);
export default app;
