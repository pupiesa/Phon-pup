const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connection config - Use environment variables for Docker later
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "my_db",
});

app.get("/", (req, res) => res.send("welcome to Phon-pup server"));

const prisma = require('./prismaClient');
// Example usage
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(5000, () => console.log("Server on port 5000"));

