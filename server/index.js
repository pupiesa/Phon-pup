const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dgram = require("dgram");
const radius = require("radius");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const RADIUS_HOST = process.env.RADIUS_HOST || "radius";
const RADIUS_PORT = parseInt(process.env.RADIUS_PORT) || 1812;
const RADIUS_SECRET = process.env.RADIUS_SECRET || "testing123";

// Connection config - Use environment variables for Docker later
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "my_db",
});

// Simple in-memory session store (use Redis in production)
const sessions = new Map();

// Generate a simple token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// RADIUS Authentication function
function authenticateWithRadius(username, password) {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket("udp4");
    
    const packet = radius.encode({
      code: "Access-Request",
      secret: RADIUS_SECRET,
      identifier: Math.floor(Math.random() * 256),
      attributes: [
        ["User-Name", username],
        ["User-Password", password],
        ["NAS-IP-Address", "127.0.0.1"],
        ["NAS-Port", 0],
      ],
    });

    const timeout = setTimeout(() => {
      client.close();
      reject(new Error("RADIUS server timeout"));
    }, 5000);

    client.on("message", (msg) => {
      clearTimeout(timeout);
      try {
        const response = radius.decode({ packet: msg, secret: RADIUS_SECRET });
        client.close();
        
        if (response.code === "Access-Accept") {
          resolve({ success: true, username });
        } else if (response.code === "Access-Reject") {
          resolve({ success: false, message: "Invalid credentials" });
        } else {
          resolve({ success: false, message: "Unknown response from RADIUS" });
        }
      } catch (err) {
        client.close();
        reject(err);
      }
    });

    client.on("error", (err) => {
      clearTimeout(timeout);
      client.close();
      reject(err);
    });

    client.send(packet, 0, packet.length, RADIUS_PORT, RADIUS_HOST, (err) => {
      if (err) {
        clearTimeout(timeout);
        client.close();
        reject(err);
      }
    });
  });
}

app.get("/", (req, res) => res.send("welcome to Phon-pup server"));

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const result = await authenticateWithRadius(username, password);
    
    if (result.success) {
      const token = generateToken();
      sessions.set(token, { username: result.username, createdAt: Date.now() });
      
      res.json({ 
        success: true, 
        message: "Authentication successful",
        token,
        username: result.username
      });
    } else {
      res.status(401).json({ success: false, error: result.message || "Authentication failed" });
    }
  } catch (err) {
    console.error("RADIUS auth error:", err);
    res.status(500).json({ success: false, error: "Authentication service unavailable" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (token && sessions.has(token)) {
    sessions.delete(token);
  }
  
  res.json({ success: true, message: "Logged out successfully" });
});

// Check session endpoint
app.get("/api/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const session = sessions.get(token);
  res.json({ username: session.username });
});

// Protected route example
app.get("/api/protected", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  res.json({ message: "This is protected data!", user: sessions.get(token).username });
});

app.listen(5000, () => console.log("Server on port 5000"));