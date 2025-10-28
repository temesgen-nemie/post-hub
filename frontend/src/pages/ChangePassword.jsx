import React, { useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import api from "../utils/api";

export default function ChangePassword() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const passwordRequirements = useMemo(
    () => [
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
    ],
    [form.newPassword]
  );

  const isPasswordValid = useMemo(
    () => passwordRequirements.every((req) => req.condition),
    [passwordRequirements]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (message) setMessage("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!form.oldPassword)
      return setError("Please enter your current password");
    if (!form.newPassword) return setError("Please enter a new password");
    if (!isPasswordValid)
      return setError("Please meet all password requirements");
    if (form.newPassword !== form.confirmPassword)
      return setError("New passwords do not match");
    if (form.oldPassword === form.newPassword)
      return setError("New password must be different from current password");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.patch("/api/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      if (response.data.success) {
        setMessage(response.data.message || "Password changed successfully!");
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowPassword({ old: false, new: false, confirm: false });
      } else {
        setError(response.data.message || "Failed to change password.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPasswordInput = (label, name, value, field) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={showPassword[field] ? "text" : "password"}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder="••••••••"
        required
        disabled={loading}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
      />
      <button
        type="button"
        onClick={() => togglePasswordVisibility(field)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        disabled={loading}
      >
        {showPassword[field] ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.018 9.018L17.41 17.41M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-white">Change Password</h1>
            <p className="text-blue-100 mt-2">Update your account password</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {renderPasswordInput(
                "Current Password",
                "oldPassword",
                form.oldPassword,
                "old"
              )}
              {renderPasswordInput(
                "New Password",
                "newPassword",
                form.newPassword,
                "new"
              )}
              {renderPasswordInput(
                "Confirm New Password",
                "confirmPassword",
                form.confirmPassword,
                "confirm"
              )}

              {form.newPassword && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Password Requirements:
                  </p>
                  <ul className="text-sm space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <li
                        key={index}
                        className={`flex items-center ${
                          req.condition ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {req.condition ? "✔️" : "❌"} {req.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  loading ||
                  !form.oldPassword ||
                  !form.newPassword ||
                  !form.confirmPassword ||
                  !isPasswordValid
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
