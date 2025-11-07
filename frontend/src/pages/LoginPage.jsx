import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWorker, healthCheck } from "../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [serverOk, setServerOk] = useState(true)
  const navigate = useNavigate();

  // Clear stale session on load and run health check
  useEffect(() => {
    try { localStorage.removeItem('user') } catch (e) {}
    let mounted = true
    ;(async () => {
      try {
        const { status, data } = await healthCheck()
        if (!mounted) return
        if (status === 200 && data && data.ok) setServerOk(true)
        else setServerOk(false)
      } catch (err) {
        if (!mounted) return
        setServerOk(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleRetryHealth = async () => {
    setError('')
    try {
      const { status, data } = await healthCheck()
      if (status === 200 && data && data.ok) {
        setServerOk(true)
        setError('')
      } else {
        setServerOk(false)
        setError((data && data.message) || 'Server still unavailable')
      }
    } catch (err) {
      setServerOk(false)
      setError('Server still unavailable')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let { status, data } = await loginWorker(username, password)

      // If network error (status 0), show clear message and keep button disabled
      if (status === 0) {
        setError('Server unreachable. Please check the backend and try again.')
        setServerOk(false)
        return
      }

      if (status === 200 && data && data.success) {
        // Save session in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({ username, role: data.user?.role || data.user?.role || 'worker' })
        )

        // Redirect by role
        if (data.user?.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user?.role === "driver") {
          navigate("/driver-dashboard");
        } else {
          // default for other users (workers) -> main dashboard
          navigate("/dashboard");
        }
      } else {
        // Distinguish network vs auth vs server errors for clearer UX
        if (status >= 500) setError('Server error. Please try again later.')
        else setError((data && data.message) || 'Invalid username or password')
      }
    } catch (err) {
      console.error("Login Error:", err)
      setError("Unexpected error. Please try again later.")
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          HVMS Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={!serverOk}
            className={`w-full ${serverOk ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-300 cursor-not-allowed'} text-gray-900 font-semibold py-2 rounded-md transition`}
          >
            {serverOk ? 'Login' : 'Server Unavailable'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-yellow-600 hover:underline"
          >
            Forgot Password?
          </button>
          <div className="mt-2">
            <button
              onClick={handleRetryHealth}
              className="text-sm text-gray-600 hover:underline"
            >
              Retry server check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
