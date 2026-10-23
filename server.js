
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  "https://ogzkrakaypfhowkgvvzp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_uzizmRLBZehb_4MkQcgqEg_DPQ0pyKl";

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    app: "FFineXX",
    message: "FFineXX server is running"
  });
});

// Verify the caller's Supabase access token.
async function getSignedInUser(req) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${match[1]}`
    }
  });

  if (!response.ok) return null;

  const user = await response.json();

  if (!user || typeof user.id !== "string" || !user.id) {
    return null;
  }

  return user;
}

// Create a LiveKit token for an authenticated viewer or approved host.
app.post("/api/live/token", async (req, res) => {
  try {
    const {
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      LIVEKIT_HOST_USER_IDS
    } = process.env;

    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return res.status(503).json({
        success: false,
        error: "LiveKit is not configured on the server."
      });
    }

    const user = await getSignedInUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Please sign in to FFineXX first."
      });
    }

    const body = req.body || {};
    const { roomName, participantName, role } = body;

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

    // Only IDs explicitly configured by the site owner may host.
    const approvedHostIds = (LIVEKIT_HOST_USER_IDS || "")
      .split(",")
      .map(id => id.trim())
      .filter(Boolean);

    if (role === "host" && !approvedHostIds.includes(user.id)) {
      return res.status(403).json({
        success: false,
        error: "Your account is not approved to start a LIVE broadcast."
      });
    }

    const identity = `${role}_${crypto.randomUUID()}`;

    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity,
        name: participantName.trim(),
        ttl: "1h"
      }
    );

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
      token: await token.toJwt(),
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
