import React, { useState, useMemo } from "react";
import api from "../utils/api";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

export default function Signup({ switchMode, customSignup }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();

  const passwordErrors = useMemo(() => {
    const errors = [];
    if (form.password.length < 8) errors.push("At least 8 characters");
    if (!/[a-z]/.test(form.password)) errors.push("One lowercase letter");
    if (!/[A-Z]/.test(form.password)) errors.push("One uppercase letter");
    if (!/\d/.test(form.password)) errors.push("One number");
    return errors;
  }, [form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.username.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (passwordErrors.length > 0) {
      setError("Please fix password requirements below");
      return;
    }

    setLocalLoading(true);
    try {
      const signupFunction = customSignup || signup;
      const signupResult = await signupFunction({
        username: form.username.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
      });

      if (signupResult.success) {
        setMessage("Account created! Sending verification code...");

        try {
          const verifyRes = await api.patch(
            "/api/auth/send-verification-code",
            {
              email: form.email.toLowerCase().trim(),
            }
          );

          if (verifyRes.data?.success) {
            setMessage(
              "Account created! Verification code has been sent to your email."
            );
            setTimeout(() => {
              switchMode("verify", { email: form.email });
            }, 1500);
          } else {
            setError(
              "Account created but failed to send verification code. Please try resending from the verification page."
            );
            setTimeout(() => {
              switchMode("verify", { email: form.email });
            }, 2000);
          }
        } catch {
          setError(
            "Account created but failed to send verification code. Please use the resend button on the verification page."
          );
          setTimeout(() => {
            switchMode("verify", { email: form.email });
          }, 2000);
        }
      } else {
        setError(signupResult.message || "Unexpected error during signup");
      }
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const isFormValid =
    form.name &&
    form.email.includes("@") &&
    form.password &&
    passwordErrors.length === 0;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-2 text-center">Sign Up</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Choose a username"
          required
          disabled={localLoading}
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          disabled={localLoading}
        />

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              disabled={localLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={localLoading}
            >
              {showPassword ? (
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
        </div>

        {form.password && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Password Requirements:
            </p>
            <ul className="text-sm space-y-1">
              {[
                {
                  condition: form.password.length >= 8,
                  text: "At least 8 characters",
                },
                {
                  condition: /[a-z]/.test(form.password),
                  text: "One lowercase letter",
                },
                {
                  condition: /[A-Z]/.test(form.password),
                  text: "One uppercase letter",
                },
                { condition: /\d/.test(form.password), text: "One number" },
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
          disabled={localLoading || !isFormValid}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {localLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Account...
            </div>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <button
            onClick={() => switchMode("signin")}
            className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition-colors"
            disabled={localLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
