// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors'; 
// import connection from './Connection.js';
// import router from './router.js';

// dotenv.config();

// const app = express();


// app.use(express.json({limit:'50mb'}));
// app.use(cors());
// app.use("/api", router);

// connection().then(() => {
//     app.listen(process.env.PORT, () => {
//         console.log(`Server created on http://localhost:${process.env.PORT}`);
//     });
// }).catch((error) => {
//     console.log("Cannot connect to the database", error);
// });
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connection from "./Connection.js";
import router from "./router.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use("/api", router);

// 🛠️ Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error("JSON Parsing Error:", err.message);
    return res.status(400).json({
      msg: "Invalid JSON body provided. Please check your request body or set it to 'none' if empty."
    });
  }
  next();
});

connection().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server created on http://localhost:${process.env.PORT}`);
  });
}).catch(err => {
  console.error("DB connection failed", err);
});

