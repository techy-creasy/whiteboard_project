import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../utils/api";
import { saveSession } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await loginRequest(email, password);
      saveSession({ token: data.token, email: data.email });
      navigate("/profile");
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Log in</h2>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          autoComplete="email"
        />

        <label style={styles.label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          autoComplete="current-password"
        />

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f5f7",
    fontFamily: "sans-serif",
  },
  card: {
    background: "#fff",
    padding: "32px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    width: "320px",
    display: "flex",
    flexDirection: "column",
  },
  title: { margin: "0 0 16px", textAlign: "center" },
  label: { fontSize: "13px", marginBottom: "4px", color: "#444" },
  input: {
    marginBottom: "16px",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    borderRadius: "4px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "13px",
    marginBottom: "12px",
  },
  footerText: { marginTop: "16px", fontSize: "13px", textAlign: "center" },
};

export default Login;
