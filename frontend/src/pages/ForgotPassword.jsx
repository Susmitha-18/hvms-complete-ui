import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InputField from '../components/InputField'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // TODO: Replace this with backend endpoint (e.g., /api/send-reset-link)
      await new Promise((r) => setTimeout(r, 1500))
      setMessage('✅ A verification email has been sent to your inbox.')
    } catch {
      setMessage('❌ Failed to send verification email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-yellow-300 text-gray-900 rounded-full flex items-center justify-center text-2xl font-bold mb-2">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Enter your registered email, and we’ll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 rounded-md transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-sm text-gray-700 bg-gray-100 p-2 rounded-md">
            {message}
          </div>
        )}

        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-sm text-gray-600 hover:text-yellow-600 w-full text-center"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  )
}
