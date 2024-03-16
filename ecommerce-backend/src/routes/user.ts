import express from "express";
const app = express.Router();
import {
  newUser,
  getAllUsers,
  getUser,
  deleteUser,
} from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

app.post("/new", newUser);

app.get("/all", adminOnly, getAllUsers);

// app.get('/:id',getUser)
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);

export default app;
