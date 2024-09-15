import express from "express";
import dotenv from 'dotenv';
import connectionDB from "./db/connectionDB.js";
import userRouter from "./src/modules/user/user.routes.js";
import companyRouter from "./src/modules/company/company.routes.js"
import jobRouter from "./src/modules/job/job.routes.js"
import { AppError } from './src/utils/classError.js';
import { GlobalErrorHandling } from './src/utils/globalErrorHandling.js';
dotenv.config();
const app = express();
const port = process.env.PORT||3000;

// Middleware to parse JSON requests
app.use(express.json());

// Connect to the database
connectionDB();

// Routes for user-related actions
app.use("/users", userRouter);
app.use("/company",companyRouter)
app.use("/job",jobRouter)

// Handle invalid routes
app.use("*", (req, res, next) => {
  return next(new AppError(`Invalid URL ${req.originalUrl}`, 404));
});

// Global error handling middleware
app.use(GlobalErrorHandling);

// Start the server
app.listen(port, () => console.log(`App is running on port ${port}`));
