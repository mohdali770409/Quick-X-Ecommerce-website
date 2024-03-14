import express from "express";
const app = express.Router();
import { newUser } from "../controllers/app.js";

app.post("/new", newUser);

export default app;
