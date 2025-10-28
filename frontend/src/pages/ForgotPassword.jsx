import React, { useState } from "react";
import api from "../utils/api";
import Input from "../components/Input";
import Button from "../components/Button";

export default function ForgotPassword({ switchMode }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await api.patch("/api/auth/send-forgot-password-code", {
        email,
      });
      setMsg(res.data?.message || "Verification code sent to your email");

      setTimeout(() => {
        switchMode("reset", { email });
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to send code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-2 text-center">
        Forgot Password
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Enter your email to receive a reset code
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {msg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {msg}
        </div>
      )}

      <form onSubmit={handleSendCode} className="space-y-4">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
        />

        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending Code...
            </div>
          ) : (
            "Send Reset Code"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Remember your password?{" "}
          <button
            onClick={() => switchMode("signin")}
            className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition-colors"
            disabled={loading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
