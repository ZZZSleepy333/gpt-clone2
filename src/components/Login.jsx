import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/admin");
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center text-black-800">
          Đăng nhập
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-black text-sm font-bold mb-2">
            Tên đăng nhập:
          </label>
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-black text-sm font-bold mb-2">
            Mật khẩu:
          </label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-black font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
};

export default Login;
