import React from "react";

export default function SearchBar({ value, onChange, placeholder = "Search...", className = "", style }) {
  return (
    <input
      className={`search-input ${className}`}
      style={style}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
