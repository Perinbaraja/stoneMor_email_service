const express = require("express");

const cors = require("cors");
require("dotenv").config();

const create = async () => {
  const app = express();

  //Allowing cors
  app.use(
    cors({
      origin: true,
      credentials: true,
      exposedHeaders: ["set-cookie"],
    })
  );
  //Body parser
  app.use(express.json({ limit: "50mb" }));
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 500000,
    })
  );

  //Middleware configuration

  app.get("/", (req, res) => res.send("Hello"));

  +app.use("/api/mail", require("./routes/mailRoute"));

  return app;
};

module.exports = {
  create,
};
