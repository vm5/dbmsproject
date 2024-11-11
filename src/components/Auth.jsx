import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6"; // Import eye icons
import Particle from "./Particle";

function Auth(props) {
  const nav = useNavigate();
  const inputEl = useRef(null);
  const passEl = useRef(null);
  const [isNameValid, setIsNameValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  // Validation for userId
  useEffect(() => {
    const isValidName =
      userId === "" ||
      ["A", "O", "E", "T"].includes(userId.toUpperCase().charAt(0));
    setIsNameValid(isValidName);
  }, [userId]);

  // Password validation
  useEffect(() => {
    const isValidPassword = password.length >= 6;
    setIsPasswordValid(isValidPassword);
  }, [password]);

  // Authorization API request
  const authorize = async () => {
    try {
      const res = await axios.post("http://localhost:5000/auth", {
        username: userId,
        password: password,
      });
      if (res.data.access === "granted") {
        window.localStorage.setItem(
          "whom",
          JSON.stringify({
            userType: res.data.user,
            username: userId,
          })
        );
        switch (res.data.user) {
          case "employee":
            nav("/employee", { replace: true });
            break;
          case "admin":
            nav("/admin", { replace: true });
            break;
          case "tenant":
            nav("/tenant", { replace: true });
            break;
          case "owner":
            nav("/owner", { replace: true });
            break;
          default:
            break;
        }
      } else {
        setIsNameValid(false);
        setIsPasswordValid(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle form submission
  const submitHandler = (e) => {
    e.preventDefault();
    setUserId(inputEl.current.value);
    setPassword(passEl.current.value);
    authorize();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-6 py-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold text-gray-700 text-center mb-6">
          <img
            src="https://www.propfloor.com/images/BuilderProfile/SNN-Builders//SNN-Builders.jpg"
            alt="SNN Builders Logo"
            className="w-16 h-16 inline-block mr-3"
          />
          SNN Raj Serenity
        </h1>

        <form onSubmit={submitHandler}>
          {/* User Id Input */}
          <div className="relative mb-4">
            <label htmlFor="user-id" className="block text-sm text-gray-600">
              User Id
            </label>
            <input
              ref={inputEl}
              type="text"
              autoFocus
              name="user-id"
              required
              value={userId}
              onChange={() => setUserId(inputEl.current.value)}
              id="user-id"
              placeholder="Enter your User Id"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isNameValid ? "border-gray-300" : "border-red-500"
              }`}
            />
            {!isNameValid && (
              <span className="absolute text-xs text-red-500 top-8 right-2">
                Invalid username
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="relative mb-6">
            <label htmlFor="password" className="block text-sm text-gray-600">
              Password
            </label>
            <input
              ref={passEl}
              type={showPassword ? "text" : "password"} // Toggle password visibility
              required
              name="password"
              id="password"
              value={password}
              autoComplete="on"
              onChange={() => setPassword(passEl.current.value)}
              placeholder="Enter your password"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isPasswordValid ? "border-gray-300" : "border-red-500"
              }`}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)} // Toggle icon on click
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {!isPasswordValid && (
              <span className="absolute text-xs text-red-500 top-8 right-2">
                Invalid password
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          >
            Sign in
          </button>
        </form>
      </div>
      <Particle />
    </div>
  );
}

export default Auth;
