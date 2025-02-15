import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import cors from "cors";
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import businessRouter from "./routes/businessRoutes.js";


const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();
// CORS middleware should be one of the first middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("🟢 Database connected successfully!");
  } catch (error) {
    console.error("🔴 Database connection failed:", error);
    process.exit(1); // Exit process if DB connection fails
  }
}
// Other middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// // Routes
app.use("/business",businessRouter)
// app.use("/quiz", quizRouter);
// app.use("/result", resultRouter);
// app.use("/analytics", analyticsRouter);
// app.use("/pdf", pdfrouter);
// // Basic route
app.get("/", (req, res) => {
  res.json("Hello from the server!");
});

// Cron job
cron.schedule("* * * * *", () => {
  console.log("cron job is running ");
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
  });
});
