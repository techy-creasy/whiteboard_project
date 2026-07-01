import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchProfile,
  fetchCanvases,
  createCanvasRequest,
  deleteCanvasRequest,
} from "../utils/api";
import { clearSession, getStoredEmail } from "../utils/auth";
import { disconnectSocket } from "../utils/socket";

const Profile = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState(getStoredEmail() || "");
  const [canvases, setCanvases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadEverything = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [profile, canvasList] = await Promise.all([
        fetchProfile(),
        fetchCanvases(),
      ]);
      setEmail(profile.email);
      setCanvases(canvasList);
    } catch (err) {
      setError("Could not load your profile. Please try logging in again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCanvas = async () => {
    setIsCreating(true);
    setError("");
    try {
      const data = await createCanvasRequest();
      navigate(`/${data.canvasId}`);
    } catch (err) {
      setError("Could not create a new canvas. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCanvas = async (canvasId) => {
    const confirmed = window.confirm(
      "Delete this canvas? This can't be undone."
    );
    if (!confirmed) return;

    setDeletingId(canvasId);
    setError("");
    try {
      await deleteCanvasRequest(canvasId);
      setCanvases((prev) => prev.filter((c) => c._id !== canvasId));
    } catch (err) {
      setError("Could not delete that canvas. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    clearSession();
    disconnectSocket();
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>My canvases</h2>
            {email && <p style={styles.subtitle}>Signed in as {email}</p>}
          </div>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Log out
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={styles.createButton}
          onClick={handleCreateCanvas}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "+ Create new canvas"}
        </button>

        {isLoading ? (
          <p>Loading your canvases...</p>
        ) : canvases.length === 0 ? (
          <p style={styles.emptyText}>
            You don't have any canvases yet. Create your first one above.
          </p>
        ) : (
          <ul style={styles.list}>
            {canvases.map((canvas) => (
              <li key={canvas._id} style={styles.listItem}>
                <button
                  style={styles.openButton}
                  onClick={() => navigate(`/${canvas._id}`)}
                >
                  Canvas {canvas._id.slice(-6)}
                  <span style={styles.dateText}>
                    {canvas.createdAt &&
                      new Date(canvas.createdAt).toLocaleString()}
                  </span>
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDeleteCanvas(canvas._id)}
                  disabled={deletingId === canvas._id}
                >
                  {deletingId === canvas._id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f5f7",
    fontFamily: "sans-serif",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "560px",
    padding: "28px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  title: { margin: 0 },
  subtitle: { margin: "4px 0 0", fontSize: "13px", color: "#666" },
  logoutButton: {
    border: "1px solid #ccc",
    background: "#fff",
    borderRadius: "4px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "13px",
  },
  createButton: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    border: "none",
    borderRadius: "4px",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },
  list: { listStyle: "none", padding: 0, margin: 0 },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  openButton: {
    flex: 1,
    textAlign: "left",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
  },
  dateText: { fontSize: "12px", color: "#888", marginTop: "2px" },
  deleteButton: {
    border: "1px solid #f87171",
    color: "#b91c1c",
    background: "#fff",
    borderRadius: "4px",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "13px",
    marginLeft: "12px",
  },
  emptyText: { color: "#666", fontSize: "14px" },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "13px",
    marginBottom: "12px",
  },
};

export default Profile;
