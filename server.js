
const express = require("express");
const path = require("path");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    app: "FFineXX",
    message: "FFineXX server is running"
  });
});

// Create a temporary LiveKit token for a host or viewer.
app.post("/api/live/token", (req, res) => {
  try {
    const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;

    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return res.status(503).json({
        success: false,
        error: "LiveKit is not configured on the server."
      });
    }

    const { roomName, participantName, role } = req.body || {};

    if (
      typeof roomName !== "string" ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(roomName) ||
      typeof participantName !== "string" ||
      participantName.trim().length < 1 ||
      participantName.trim().length > 50 ||
      !["host", "viewer"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        error: "Provide a valid room name, participant name, and role."
      });
    }

    const identity = `${role}_${require("crypto").randomUUID()}`;
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name: participantName.trim(),
      ttl: "1h"
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: role === "host",
      canSubscribe: true,
      canPublishData: role === "host"
    });

    return res.json({
      success: true,
      url: LIVEKIT_URL,
      token: token.toJwt(),
      identity,
      role
    });
  } catch (error) {
    console.error("LiveKit token error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Could not create a LiveKit token."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FFineXX is running on port ${PORT}`);
});
