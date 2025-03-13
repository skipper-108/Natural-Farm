import React from "react";

function Button({ label, onClick, variant }) {
  const BTN_STYLES = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-300 text-gray-700 hover:bg-gray-400",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    tertiary: "bg-transparent text-blue-500 hover:bg-blue-50",
    link: "text-blue-500 hover:underline",
    disabled: "bg-gray-300 text-gray-700 cursor-not-allowed hover:bg-gray-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-2 rounded-full ${BTN_STYLES[variant]}`}
    >
      {label}
    </button>
  );
}

export default Button;