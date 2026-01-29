# Phon-pup Project

This is a complete full-stack web application containerized with Docker. It is designed to work seamlessly across different operating systems (Linux, Windows, macOS).

## 🏗 Tech Stack

- **Client**: React (Vite), React Router Dom
- **Server**: Node.js, Express
- **Database**: MySQL 8.0
- **DevOps**: Docker, Docker Compose

## 🚀 Getting Started

### Prerequisites

Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Run the Application

To start the entire application stack:

```bash
docker compose up -d
```

This will spin up three services:

- **Client**: [http://localhost:3000](http://localhost:3000)
- **Server**: [http://localhost:5000](http://localhost:5000)
- **Database**: Port `3306`

To stop the application:docker compose exec client npm install package_name

```bash
docker compose down
```

---

## 📦 Managing Dependencies (Important!)

This project is configured to keep running smoothly on Windows and Linux by isolating the node dependencies inside the container.

### How to Install New Packages

**Do not** just run `npm install` on your host machine to add packages to the running application. Instead, execute the command inside the docker container.

#### For the Client (React)

```bash
# Example: Installing distinct-colors
docker compose exec client npm install distinct-colors
```

#### For the Server (Node)

```bash
# Example: Installing uuid
docker compose exec server npm install uuid
```

### Why do it this way?

Running `npm install` locally on Windows can create files that are incompatible with the Linux environment inside Docker. Using `docker compose exec` ensures that all packages are installed correctly for the container OS.

---

## 📂 Project Structure

```
Phon-pup/
├── client/             # React Frontend
│   ├── src/
│   ├── Dockerfile
│   └── vite.config.js
├── server/             # Express Backend
│   ├── index.js
│   └── Dockerfile
├── docker-compose.yml  # Docker orchestration
└── README.md
```

## 🛠 Troubleshooting

**"Dependencies not found" or "Vite Error"**
If you messed up the `node_modules` by installing locally or shifting files around, you can rebuild the containers from scratch:

```bash
docker compose up -d --build --force-recreate
```
