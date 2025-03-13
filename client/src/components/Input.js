import React from "react";

function Input({ label, val, onChange, placeholder="", type="text" }) {
  const inputId = `input-${label}`;

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        id={inputId}
        className="px-2 py-1 border border-gray-300 rounded-md w-full focus:outline-none mb-4 text-lg"
        value={val}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default Input;