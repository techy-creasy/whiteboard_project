const Canvas = require("../models/Canvas");

const SAVE_DEBOUNCE_MS = 1000;

// canvasId (string) -> { elements, saveTimeout, memberCount }
//
// While at least one user has a canvas open, this is the "live" copy of
// its elements — faster than hitting MongoDB on every single stroke, and
// it's what gets debounced-saved to the DB and handed to new joiners.
const rooms = new Map();

function getRoom(canvasId) {
  return rooms.get(canvasId);
}

function ensureRoom(canvasId, initialElements) {
  if (!rooms.has(canvasId)) {
    rooms.set(canvasId, {
      elements: initialElements,
      saveTimeout: null,
      memberCount: 0,
    });
  }
  return rooms.get(canvasId);
}

// Resets a 1s timer every time it's called while drawing keeps happening,
// so MongoDB only gets written to once drawing actually pauses — not on
// every single mouse-move.
function scheduleSave(canvasId) {
  const room = rooms.get(canvasId);
  if (!room) return;

  if (room.saveTimeout) {
    clearTimeout(room.saveTimeout);
  }

  room.saveTimeout = setTimeout(async () => {
    try {
      await Canvas.findByIdAndUpdate(canvasId, { elements: room.elements });
    } catch (error) {
      console.error(`Autosave failed for canvas ${canvasId}:`, error.message);
    }
  }, SAVE_DEBOUNCE_MS);
}

function memberJoined(canvasId) {
  const room = rooms.get(canvasId);
  if (room) room.memberCount += 1;
}

// Called when a socket disconnects/leaves. Once nobody is left viewing a
// canvas, flush one final save immediately and drop the cache entry —
// otherwise `rooms` would grow forever as people open/close canvases.
function memberLeft(canvasId) {
  const room = rooms.get(canvasId);
  if (!room) return;

  room.memberCount -= 1;
  if (room.memberCount <= 0) {
    if (room.saveTimeout) clearTimeout(room.saveTimeout);
    Canvas.findByIdAndUpdate(canvasId, { elements: room.elements }).catch((error) =>
      console.error(`Final save failed for canvas ${canvasId}:`, error.message)
    );
    rooms.delete(canvasId);
  }
}

module.exports = { getRoom, ensureRoom, scheduleSave, memberJoined, memberLeft };
