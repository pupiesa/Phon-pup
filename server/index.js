const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const dgram = require("dgram");
const radius = require("radius");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
const thumbnailsDir = path.join(uploadsDir, "thumbnails");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

// Configuration
const RADIUS_HOST = process.env.RADIUS_HOST || "radius";
const RADIUS_PORT = parseInt(process.env.RADIUS_PORT) || 1812;
const RADIUS_SECRET = process.env.RADIUS_SECRET || "testing123";

// MySQL connection pool for RADIUS database
const radiusDb = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: "radius_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only videos and images are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Simple in-memory session store (use Redis in production)
const sessions = new Map();

// Generate a simple token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Helper to determine media type from MIME
function getMediaType(mimeType) {
  if (mimeType === "image/gif") return "GIF";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("image/")) return "IMAGE";
  return "IMAGE";
}

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.user = sessions.get(token);
  next();
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

app.get("/", (req, res) => res.send("welcome to Phon-pup server 🔥"));

// ============== AUTH ENDPOINTS ==============

// Register new user (adds to RADIUS database)
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username.length < 3 || username.length > 64) {
    return res.status(400).json({ error: "Username must be 3-64 characters" });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  try {
    // Check if user already exists
    const [existing] = await radiusDb.query(
      "SELECT id FROM radcheck WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Insert user into radcheck table with Cleartext-Password
    // FreeRADIUS uses this for authentication
    await radiusDb.query(
      "INSERT INTO radcheck (username, attribute, op, value) VALUES (?, 'Cleartext-Password', ':=', ?)",
      [username, password]
    );

    res.status(201).json({
      success: true,
      message: "Registration successful! You can now login.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

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
        username: result.username,
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

// ============== MEDIA ENDPOINTS ==============

// Get all media (paginated, with search)
app.get("/api/media", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type; // Optional filter by type
    const search = req.query.search?.trim(); // Search query

    // Build where clause
    const where = {};
    
    if (type) {
      where.mediaType = type.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { uploadedBy: { contains: search } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    res.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// Get single media by ID
app.get("/api/media/:id", async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json(media);
  } catch (err) {
    console.error("Error fetching media:", err);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// Increment view count
app.post("/api/media/:id/view", async (req, res) => {
  try {
    const media = await prisma.media.update({
      where: { id: parseInt(req.params.id) },
      data: { views: { increment: 1 } },
    });

    res.json({ views: media.views });
  } catch (err) {
    console.error("Error updating views:", err);
    res.status(500).json({ error: "Failed to update views" });
  }
});

// Upload media (protected)
app.post("/api/media", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Title is required" });
    }

    const mediaType = getMediaType(req.file.mimetype);

    const media = await prisma.media.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mediaType,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: req.user.username,
      },
    });

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      media,
    });
  } catch (err) {
    console.error("Error uploading media:", err);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to upload media" });
  }
});

// Delete media (owner only)
app.delete("/api/media/:id", authMiddleware, async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    if (media.uploadedBy !== req.user.username) {
      return res.status(403).json({ error: "You can only delete your own media" });
    }

    // Delete file from disk
    const filePath = path.join(uploadsDir, media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if exists
    if (media.thumbnail) {
      const thumbPath = path.join(uploadsDir, media.thumbnail);
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: media.id },
    });

    res.json({ success: true, message: "Media deleted successfully" });
  } catch (err) {
    console.error("Error deleting media:", err);
    res.status(500).json({ error: "Failed to delete media" });
  }
});

// ============== START SERVER ==============

app.listen(5000, () => console.log("🚀 Phon-pup server running on port 5000"));