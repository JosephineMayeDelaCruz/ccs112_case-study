import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { roles } from "../../data/users.js";
import { homeFor } from "../../utils/permissions.js";

// Demo accounts seeded by DatabaseSeeder.php — password for all is "password"
const DEMO_EMAILS = {
  staff: "staff@walangbrownout.test",
  admin: "admin@walangbrownout.test",
  manager: "manager@walangbrownout.test",
  products: "clerk@walangbrownout.test",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selected) {
      setEmail(DEMO_EMAILS[selected] || "");
      setError("");
    }
  }, [selected]);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!selected || !email.trim() || !password) { setError("Select a role and enter your email and password."); return; }
    setSubmitting(true);
    setError("");
    try {
      const loggedInUser = await login(selected, email, password);
      navigate(homeFor(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally { setSubmitting(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">WalangBrownout</div>
        <div className="login-sub">Inventory Management System — sign in to continue</div>
        <div className="role-grid">
          {roles.map((r) => (
            <button
              type="button"
              aria-pressed={selected === r.id}
              key={r.id}
              className={"role-tile " + (selected === r.id ? "selected" : "")}
              onClick={() => setSelected(r.id)}
            >
              <i className={"bi " + r.icon}></i>
              <div className="role-label">{r.label}</div>
              <div className="role-desc">{r.desc}</div>
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <label className="field-label-sm">Email</label>
          <input
            className="search-input w-100 mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@walangbrownout.test"
          />
          <label className="field-label-sm">Password</label>
          <input
            type="password"
            className="search-input w-100 mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn-tan w-100 py-2 fw-bold mt-2" disabled={submitting}>
            {submitting ? "Signing in..." : "Log In"}
          </button>
        </form>
        <div className="login-hint">
          Demo accounts seeded by the backend — password is "password" for every role.
        </div>
      </div>
    </div>
  );
}
