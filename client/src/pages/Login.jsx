import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const API_URL = "http://localhost:5000";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(username, password);

    setIsLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("Registration successful! You can now login.");
        setTimeout(() => {
          setIsRegister(false);
          resetForm();
        }, 1500);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-main rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-dark rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Login/Register Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/logo.jpg"
              alt="Phon-Pup"
              className="h-28 w-auto mx-auto rounded-lg mb-4"
            />
            <h1 className="text-2xl font-bold text-white mb-2">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-gray-500">
              {isRegister
                ? "Register to start sharing"
                : "Sign in with your credentials"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-dark rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setIsRegister(false);
                resetForm();
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isRegister
                  ? "bg-orange-main text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                resetForm();
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isRegister
                  ? "bg-orange-main text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-sm flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={isRegister ? handleRegister : handleLogin}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark border border-border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-main focus:ring-1 focus:ring-orange-main transition-all"
                  placeholder="Enter your username"
                  required
                  minLength={3}
                  maxLength={64}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark border border-border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-main focus:ring-1 focus:ring-orange-main transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={4}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Register */}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-dark border border-border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-main focus:ring-1 focus:ring-orange-main transition-all"
                    placeholder="Confirm your password"
                    required
                    minLength={4}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 btn-primary text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isRegister ? "Creating Account..." : "Signing In..."}
                </span>
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Secured by{" "}
              <span className="text-orange-main font-medium">FreeRADIUS</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
