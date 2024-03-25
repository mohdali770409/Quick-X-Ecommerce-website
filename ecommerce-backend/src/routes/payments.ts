import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import { newCoupon, applyDiscount, allCoupons, deleteCoupon } from "../controllers/payments.js";

const app = express.Router();

app.get("/discount", applyDiscount);
app.post("/coupon/new",adminOnly, newCoupon);
app.get('/coupon/all',adminOnly,allCoupons)
app.delete('/coupon/:id',adminOnly,deleteCoupon)

export default app;
