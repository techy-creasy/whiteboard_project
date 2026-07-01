import React, { useContext, useState } from "react";
import classes from "./index.module.css";

import cx from "classnames";
import {
  FaSlash,
  FaRegCircle,
  FaArrowRight,
  FaPaintBrush,
  FaEraser,
  FaUndoAlt,
  FaRedoAlt,
  FaFont,
  FaDownload,
  FaCommentDots,
  FaShareAlt,
} from "react-icons/fa";
import { LuRectangleHorizontal } from "react-icons/lu";
import { TOOL_ITEMS } from "../../constants";
import boardContext from "../../store/board-context";
import { useNavigate } from "react-router-dom";
import { createCanvasRequest, shareCanvasRequest } from "../../utils/api";

const Toolbar = ({ canvasId, isCommentMode, onToggleCommentMode }) => {
  const { activeToolItem, changeToolHandler, undo, redo } =
    useContext(boardContext);
  const navigate = useNavigate();

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareStatus, setShareStatus] = useState(null); // { type: "success" | "error", text }
  const [isSharing, setIsSharing] = useState(false);

  const handleDownloadClick = () => {
    const canvas = document.getElementById("canvas");
    const data = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = data;
    anchor.download = "board.png";
    anchor.click();
  };

 const handleCreateCanvas = async () => {
  try {
    const data = await createCanvasRequest();
    navigate(`/${data.canvasId}`);
  } catch (error) {
    console.error("Error creating canvas:", error);
  }
};

  const handleShareSubmit = async (event) => {
    event.preventDefault();
    if (!shareEmail.trim() || !canvasId) return;

    setIsSharing(true);
    setShareStatus(null);
    try {
      const data = await shareCanvasRequest(canvasId, shareEmail.trim());
      setShareStatus({ type: "success", text: data.message });
      setShareEmail("");
    } catch (error) {
      setShareStatus({
        type: "error",
        text: error.response?.data?.error || "Could not share this canvas.",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={classes.container}>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.BRUSH,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.BRUSH)}
      >
        <FaPaintBrush />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.LINE,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.LINE)}
      >
        <FaSlash />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.RECTANGLE,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.RECTANGLE)}
      >
        <LuRectangleHorizontal />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.CIRCLE,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.CIRCLE)}
      >
        <FaRegCircle />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.ARROW,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.ARROW)}
      >
        <FaArrowRight />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.ERASER,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.ERASER)}
      >
        <FaEraser />
      </div>
      <div
        className={cx(classes.toolItem, {
          [classes.active]: activeToolItem === TOOL_ITEMS.TEXT,
        })}
        onClick={() => changeToolHandler(TOOL_ITEMS.TEXT)}
      >
        <FaFont />
      </div>
      <div className={classes.toolItem} onClick={undo}>
        <FaUndoAlt />
      </div>
      <div className={classes.toolItem} onClick={redo}>
        <FaRedoAlt />
      </div>
      <div className={classes.toolItem} onClick={handleDownloadClick}>
        <FaDownload />
      </div>
      <div
        className={cx(classes.toolItem, { [classes.active]: isCommentMode })}
        onClick={onToggleCommentMode}
        title="Add a comment"
      >
        <FaCommentDots />
      </div>
      <div
        className={classes.toolItem}
        onClick={() => setIsShareOpen((open) => !open)}
        title="Share this canvas"
      >
        <FaShareAlt />
      </div>
      <button className={classes.createButton} onClick={handleCreateCanvas}>
        + Create New Canvas
      </button>
      <button className={classes.createButton} onClick={() => navigate("/profile")}>
        My Canvases
      </button>

      {isShareOpen && (
        <form
          onSubmit={handleShareSubmit}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: 10,
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            width: 240,
            fontFamily: "sans-serif",
          }}
        >
          <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
            Share with (email)
          </label>
          <input
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="someone@example.com"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 6,
              fontSize: 13,
              border: "1px solid #ccc",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <button
            type="submit"
            disabled={isSharing}
            style={{
              width: "100%",
              padding: 6,
              border: "none",
              borderRadius: 4,
              background: "#4f46e5",
              color: "#fff",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {isSharing ? "Sharing..." : "Share"}
          </button>
          {shareStatus && (
            <p
              style={{
                fontSize: 12,
                marginTop: 6,
                marginBottom: 0,
                color: shareStatus.type === "success" ? "#15803d" : "#b91c1c",
              }}
            >
              {shareStatus.text}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default Toolbar;
