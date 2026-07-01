import axiosClient from "./axiosClient";

// ---- Auth ----

export const registerRequest = (email, password) =>
  axiosClient.post("/auth/register", { email, password }).then((res) => res.data);

export const loginRequest = (email, password) =>
  axiosClient.post("/auth/login", { email, password }).then((res) => res.data);

export const fetchProfile = () =>
  axiosClient.get("/auth/me").then((res) => res.data);

// ---- Canvas ----

export const fetchCanvases = () =>
  axiosClient.get("/canvas/list").then((res) => res.data);

export const loadCanvasRequest = (canvasId) =>
  axiosClient.get(`/canvas/load/${canvasId}`).then((res) => res.data);

export const createCanvasRequest = () =>
  axiosClient.post("/canvas/create").then((res) => res.data);

export const deleteCanvasRequest = (canvasId) =>
  axiosClient.delete(`/canvas/${canvasId}`).then((res) => res.data);

export const shareCanvasRequest = (canvasId, email) =>
  axiosClient.put(`/canvas/share/${canvasId}`, { email }).then((res) => res.data);

// Kept as a *named* `updateCanvas` (and same signature) because
// BoardProvider already imports it this way for autosave.
export const updateCanvas = async (canvasId, elements) => {
  try {
    const response = await axiosClient.put("/canvas/update", { canvasId, elements });
    return response.data;
  } catch (error) {
    console.error("UPDATE ERROR:", error);
  }
};

// Kept for backwards compatibility with any existing imports.
export const deleteCanvas = deleteCanvasRequest;
