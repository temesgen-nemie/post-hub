import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

export default function Verify({ email, switchMode, onClose }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const { checkAuth } = useAuth();

  // Handle resend timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendCode = useCallback(async () => {
    setResendLoading(true);
    setMsg(null);
    setError(null);

    try {
      const res = await api.patch("/api/auth/send-verification-code", {
        email,
      });
      setMsg(res.data?.message || "Verification code sent to your email!");
      setCanResend(false);
      setResendTimer(60);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to send code"
      );
      setCanResend(true);
    } finally {
      setResendLoading(false);
    }
  }, [email]);

  const handleResendCode = useCallback(async () => {
    if (!canResend) return;
    await sendCode();
  }, [canResend, sendCode]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      const res = await api.patch("/api/auth/verify-verification-code", {
        email,
        providedCode: code,
      });

      if (res.data?.success) {
        setMsg("Account verified successfully!");

        setTimeout(async () => {
          await checkAuth();
          onClose?.();
        }, 1500);
      } else {
        setError(
          res.data?.message ||
            "Verification failed. Please check the code and try again."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-2 text-center">
        Verify Your Account
      </h2>
      <p className="text-gray-600 text-center mb-2">
        Enter the 6-digit verification code sent to
      </p>
      <p className="text-blue-600 font-medium text-center mb-6">{email}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          {error}
        </div>
      )}

      {msg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
          {msg}
        </div>
      )}

      <div className="space-y-4">
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="Verification Code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            required
            disabled={loading}
            maxLength="6"
          />

          <Button
            type="submit"
            disabled={!code || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              "Verify Account"
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
          <Button
            onClick={handleResendCode}
            disabled={resendLoading || !canResend}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </div>
            ) : !canResend ? (
              `Resend available in ${resendTimer}s`
            ) : (
              "Resend Verification Code"
            )}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Already verified?{" "}
            <button
              onClick={() => switchMode("signin")}
              className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition-colors"
              disabled={loading || resendLoading}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
