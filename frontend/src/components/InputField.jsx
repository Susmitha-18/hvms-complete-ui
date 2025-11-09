import React from 'react'

export default function InputField({ label, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
      />
    </div>
  )
}
