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

app.get("/", (req, res) => res.send("Backend is runningsss!"));

app.listen(5000, () => console.log("Server on port 5000"));
