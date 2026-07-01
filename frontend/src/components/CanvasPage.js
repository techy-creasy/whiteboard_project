import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { loadCanvasRequest } from "../utils/api";
import { rebuildElements } from "../utils/element";
import { getSocket } from "../utils/socket";

import Board from "./Board";
import Toolbar from "./Toolbar";
import Toolbox from "./Toolbox";
import Comments from "./Comments";

import BoardProvider from "../store/BoardProvider";
import ToolboxProvider from "../store/ToolboxProvider";

const CanvasPage = () => {
  const { canvasId } = useParams();

  const [canvas, setCanvas] = useState(null);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [isCommentMode, setIsCommentMode] = useState(false);

  // Whichever of REST-load / socket-join responds first "wins" the
  // initial paint — see write-up for why we don't try to reconcile a
  // second, later-arriving snapshot into an already-mounted board.
  const initialDataAppliedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    initialDataAppliedRef.current = false;

    const applyInitialElements = (rawElements) => {
      if (initialDataAppliedRef.current) return;
      initialDataAppliedRef.current = true;
      if (isMounted) {
        setCanvas({ _id: canvasId, elements: rebuildElements(rawElements) });
      }
    };

    // REST path — reliable, gives clear 403/404 errors for direct loads/refreshes.
    loadCanvasRequest(canvasId)
      .then((data) => {
        localStorage.setItem("canvas_id", data._id);
        applyInitialElements(data.elements || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          err.response?.status === 403
            ? "You don't have access to this canvas."
            : "This canvas could not be found."
        );
      });

    // Socket path — joins the live collaboration room, and also hands us
    // comments (which have no REST endpoint at all).
    const socket = getSocket();
    if (!socket) return () => { isMounted = false; };

    socket.emit("joinCanvas", { canvasId });

    const handleCanvasData = (data) => {
      localStorage.setItem("canvas_id", data.canvasId);
      applyInitialElements(data.elements || []);
      if (isMounted) setComments(data.comments || []);
    };

    const handleCanvasError = (err) => {
      if (isMounted) setError(err.message);
    };

    const handleReceiveComment = (comment) => {
      if (isMounted) setComments((prev) => [...prev, comment]);
    };

    socket.on("canvasData", handleCanvasData);
    socket.on("canvasError", handleCanvasError);
    socket.on("receiveComment", handleReceiveComment);

    return () => {
      isMounted = false;
      socket.off("canvasData", handleCanvasData);
      socket.off("canvasError", handleCanvasError);
      socket.off("receiveComment", handleReceiveComment);
    };
  }, [canvasId]);

  const handleAddComment = useCallback(
    ({ x, y, text }) => {
      const socket = getSocket();
      if (!socket) return;
      socket.emit("newComment", { canvasId, x, y, text });
      setIsCommentMode(false);
    },
    [canvasId]
  );

  if (error) {
    return (
      <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
        <p>{error}</p>
        <Link to="/profile">← Back to my canvases</Link>
      </div>
    );
  }

  if (!canvas) {
    return <p style={{ padding: "40px", fontFamily: "sans-serif" }}>Loading canvas...</p>;
  }

  return (
    <BoardProvider initialElements={canvas.elements}>
      <ToolboxProvider>
        <Toolbar
          canvasId={canvasId}
          isCommentMode={isCommentMode}
          onToggleCommentMode={() => setIsCommentMode((mode) => !mode)}
        />
        <Board />
        <Toolbox />
      </ToolboxProvider>
      <Comments
        comments={comments}
        isCommentMode={isCommentMode}
        onAddComment={handleAddComment}
      />
    </BoardProvider>
  );
};

export default CanvasPage;
