import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// import {  } from "firebase/auth/cordova";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";
import { useLoginMutation } from "../redux/api/userAPI";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { MessageResponse } from "../types/api-types";

const Login = () => {
  const [gender, setGender] = useState("");
  const [date, setDate] = useState("");

  const [login] = useLoginMutation();

  const loginHandler = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      console.log("user details=>", {
        name: user.displayName!,
        email: user.email!,
        photo: user.photoURL!,
        gender,
        role: "user",
        dob: date,
        _id: user.uid,
      });
      const res = await login({
        name: user.displayName!,
        email: user.email!,
        photo: user.photoURL!,
        gender,
        role: "user",
        dob: date,
        _id: user.uid,
      });
      if ("data" in res) {
        console.log(res.data.message);
        toast.success(res.data.message);
      } else {
        const error = res.error as FetchBaseQueryError;
        const message = (error.data as MessageResponse).message;
        console.log(message);
      }

      console.log(user);
    } catch (error) {
      toast.error("Sign-In failed");
    }
  };

  return (
    <div className="login">
      <main>
        <h1 className="heading">Login</h1>
        <div>
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Choose Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <p>Already Signed In Once </p>
          <button onClick={loginHandler}>
            <FcGoogle /> <span>Signed in with Google</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
