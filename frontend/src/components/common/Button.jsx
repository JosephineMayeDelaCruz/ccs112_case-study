import React from "react";

export default function Button({ variant = "tan", className = "", children, ...rest }) {
  const base = variant === "outline" ? "btn-outline-tan" : "btn-tan";
  return (
    <button className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
}
