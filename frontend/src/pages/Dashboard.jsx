import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Button from "../components/Button";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/signout");
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="mb-6 text-gray-700">You are logged in successfully!</p>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}
