const express = require("express");
const app = express();
require("dotenv").config();
const serverless = require("serverless-http");
const usersRouter = require("./routes/aws.router");

app.use(express.json({ limit: "150mb" })); // Adjust the limit value as per your requirements
app.use(express.urlencoded({ limit: "150mb", extended: true })); // Adjust the limit value as per your requirements

app.use("/api/v1/route", usersRouter);

 const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
   console.log("Server running...........");
   console.log("port", PORT);
 });
 

//module.exports.handler = serverless(app);
