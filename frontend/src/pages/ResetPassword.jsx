import React, { useState, useMemo } from "react";
import api from "../utils/api";
import Input from "../components/Input";
import Button from "../components/Button";

export default function ResetPassword({ email, switchMode }) {
  const [form, setForm] = useState({
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const passwordErrors = useMemo(() => {
    const errors = [];
    if (form.newPassword.length < 8) errors.push("At least 8 characters");
    if (!/[a-z]/.test(form.newPassword)) errors.push("One lowercase letter");
    if (!/[A-Z]/.test(form.newPassword)) errors.push("One uppercase letter");
    if (!/\d/.test(form.newPassword)) errors.push("One number");
    return errors;
  }, [form.newPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);

    if (passwordErrors.length > 0) {
      setError("Please fix password requirements");
      setLoading(false);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!form.code || form.code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      const res = await api.patch("/api/auth/verify-forgot-password-code", {
        email,
        providedCode: form.code,
        newPassword: form.newPassword,
      });

      setMsg(res.data?.message || "Password reset successfully!");

      if (res.data?.success) {
        setTimeout(() => {
          switchMode("signin");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.code &&
    form.newPassword &&
    form.confirmPassword &&
    passwordErrors.length === 0;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-2 text-center">
        Reset Password
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Enter the code sent to <strong>{email}</strong> and your new password
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

      <form onSubmit={handleReset} className="space-y-4">
        <Input
          label="Verification Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="123456"
          required
          disabled={loading}
          maxLength="6"
        />

        <Input
          label="New Password"
          name="newPassword"
          type="password"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={loading}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={loading}
        />

        {form.newPassword && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Password Requirements:
            </p>
            <ul className="text-sm space-y-1">
              {[
                {
                  condition: form.newPassword.length >= 8,
                  text: "At least 8 characters",
                },
                {
                  condition: /[a-z]/.test(form.newPassword),
                  text: "One lowercase letter",
                },
                {
                  condition: /[A-Z]/.test(form.newPassword),
                  text: "One uppercase letter",
                },
                { condition: /\d/.test(form.newPassword), text: "One number" },
              ].map((req, index) => (
                <li
                  key={index}
                  className={req.condition ? "text-green-600" : "text-red-600"}
                >
                  {req.condition ? "✅" : "❌"} {req.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Resetting Password...
            </div>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <button
            onClick={() => switchMode("forgot")}
            className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition-colors"
            disabled={loading}
          >
            Resend Code
          </button>
          <button
            onClick={() => switchMode("signin")}
            className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition-colors"
            disabled={loading}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
