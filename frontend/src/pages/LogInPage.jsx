import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [mode, setMode] = useState("guest"); // "guest" or "admin"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "guest") {
      setWelcomeMsg("Welcome guest!");
    } else {
      setWelcomeMsg(`Welcome ${username || "admin"}!`);
    }
    setTimeout(() => {
      setLoading(false);
      navigate("/groups");
    }, 5000);
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 32, background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001" }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <button
          style={{
            background: mode === "guest" ? "#7c3aed" : "#e0e7ff",
            color: mode === "guest" ? "#fff" : "#222",
            border: "none",
            borderRadius: 6,
            padding: "8px 18px",
            marginRight: 8,
            cursor: "pointer"
          }}
          onClick={() => setMode("guest")}
        >
          Continue as Guest
        </button>
        <button
          style={{
            background: mode === "admin" ? "#7c3aed" : "#e0e7ff",
            color: mode === "admin" ? "#fff" : "#222",
            border: "none",
            borderRadius: 6,
            padding: "8px 18px",
            cursor: "pointer"
          }}
          onClick={() => setMode("admin")}
        >
          Admin Login
        </button>
      </div>
      <form onSubmit={handleLogin}>
        {mode === "admin" && (
          <>
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #bbb" }}
              />
            </div>
          </>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#38bdf8",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 0",
            fontSize: "1.1rem",
            cursor: "pointer"
          }}
          disabled={loading}
        >
          {mode === "guest" ? "Continue as Guest" : "Login as Admin"}
        </button>
      </form>
      {loading && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <div className="spinner" style={{
            margin: "0 auto 12px auto",
            border: "4px solid #e0e7ff",
            borderTop: "4px solid #7c3aed",
            borderRadius: "50%",
            width: 40,
            height: 40,
            animation: "spin 1s linear infinite"
          }} />
          <div style={{ fontWeight: 500, fontSize: "1.1rem" }}>{welcomeMsg}</div>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg);} 100% {transform: rotate(360deg);} }`}
          </style>
        </div>
      )}
    </div>
  );
};

export default LoginPage;