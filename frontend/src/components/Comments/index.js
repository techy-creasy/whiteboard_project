import { useState } from "react";

// Renders on top of the canvas (as a sibling, not inside BoardProvider —
// comments don't need board state at all). Two independent things:
// 1. Existing comment pins — always visible, click to read.
// 2. A full-viewport "click to place a comment" capture layer, but only
//    while comment mode is on, so normal drawing is completely
//    unaffected when it's off.
const Comments = ({ comments, isCommentMode, onAddComment }) => {
  const [pendingPos, setPendingPos] = useState(null);
  const [draft, setDraft] = useState("");
  const [activePinId, setActivePinId] = useState(null);

  const handleOverlayClick = (event) => {
    setPendingPos({ x: event.clientX, y: event.clientY });
    setDraft("");
  };

  const handleSubmit = () => {
    if (!draft.trim() || !pendingPos) return;
    onAddComment({ x: pendingPos.x, y: pendingPos.y, text: draft.trim() });
    setPendingPos(null);
    setDraft("");
  };

  return (
    <>
      {comments.map((comment) => (
        <div
          key={comment._id}
          style={{ position: "fixed", left: comment.x, top: comment.y, zIndex: 25 }}
        >
          <button
            onClick={() =>
              setActivePinId(activePinId === comment._id ? null : comment._id)
            }
            title={comment.authorEmail}
            style={styles.pin}
          >
            💬
          </button>
          {activePinId === comment._id && (
            <div style={styles.popover}>
              <strong style={styles.popoverAuthor}>{comment.authorEmail}</strong>
              <span style={styles.popoverText}>{comment.text}</span>
            </div>
          )}
        </div>
      ))}

      {isCommentMode && (
        <div onClick={handleOverlayClick} style={styles.captureLayer} />
      )}

      {pendingPos && (
        <div
          style={{ ...styles.draftBox, left: pendingPos.x, top: pendingPos.y }}
        >
          <textarea
            autoFocus
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment..."
            style={styles.textarea}
          />
          <div style={styles.draftActions}>
            <button onClick={() => setPendingPos(null)} style={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleSubmit} style={styles.postButton}>
              Post
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  pin: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "none",
    background: "#fbbf24",
    cursor: "pointer",
    fontSize: 14,
    transform: "translate(-50%, -100%)",
  },
  popover: {
    position: "fixed",
    background: "#111827",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: 6,
    width: 200,
    fontSize: 12,
    transform: "translate(-50%, calc(-100% - 34px))",
  },
  popoverAuthor: { display: "block", marginBottom: 4 },
  popoverText: { display: "block", lineHeight: 1.4 },
  captureLayer: {
    position: "fixed",
    inset: 0,
    zIndex: 20,
    cursor: "crosshair",
  },
  draftBox: {
    position: "fixed",
    zIndex: 30,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
  },
  textarea: {
    width: 180,
    fontSize: 13,
    fontFamily: "sans-serif",
    resize: "none",
  },
  draftActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 4,
  },
  cancelButton: {
    border: "1px solid #ccc",
    background: "#fff",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
  },
  postButton: {
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    borderRadius: 4,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
  },
};

export default Comments;
