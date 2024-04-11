require("dotenv").config();
const http = require("http");

const { mongoConnect } = require("./services/mongo");


const PORT = process.env.PORT || 8000;

const app = require("./app");

const server = http.createServer(app);
const { loadAllPlanets } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

async function startServer() {
  await mongoConnect();
  await loadAllPlanets();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log("Listening on Port 8000");
  });
}

startServer();
