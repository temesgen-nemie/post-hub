import React, { useState } from "react";
import Signin from "../pages/Signin";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Verify from "../pages/Verify";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ initialMode = "signin", email, onClose }) => {
  const [mode, setMode] = useState(initialMode);
  const [currentEmail, setCurrentEmail] = useState(email || "");
  const navigate = useNavigate();

  const handleOverlayClick = (e) => {
    if (e.target.id === "modal-overlay") {
      handleClose();
    }
  };

  const switchMode = (newMode, data = {}) => {
    setMode(newMode);
    if (data.email) {
      setCurrentEmail(data.email);
    }
  };

  const handleClose = () => {
    onClose?.() || navigate("/");
  };

  const handleAuthSuccess = () => {
    handleClose();
  };

  const renderContent = () => {
    const commonProps = {
      switchMode,
      onClose: handleAuthSuccess,
    };

    const components = {
      signin: Signin,
      signup: Signup,
      forgot: ForgotPassword,
      reset: () => <ResetPassword {...commonProps} email={currentEmail} />,
      verify: () => <Verify {...commonProps} email={currentEmail} />,
    };

    const Component = components[mode] || components.signin;
    return <Component {...commonProps} />;
  };

  const isAuthMode = mode === "signin" || mode === "signup";

  return (
    <div
      id="modal-overlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-lg relative overflow-auto max-h-[90vh] p-6">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {isAuthMode && (
          <div className="flex justify-center gap-4 mb-6">
            {["signin", "signup"].map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  mode === tab
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default AuthModal;
