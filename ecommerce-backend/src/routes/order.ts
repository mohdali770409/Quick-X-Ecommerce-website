import express from "express";
const app = express.Router();

import { adminOnly } from "../middlewares/auth.js";
import { newOrder } from "../controllers/order.js";

app.post("/new", newOrder);

export default app;
