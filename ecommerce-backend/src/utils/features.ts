import mongoose from "mongoose";
export const connectDB = () => {
  mongoose
    .connect("mongodb://localhost:27017", {
      dbName: "Ecommerce_2024",
    })
    .then(() => console.log("db connected successfully"))
    .catch((e) => {
      console.log("error in connecting db");
      console.log(e);
      process.exit(1);
    });
};
