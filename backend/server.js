const express = require("express");
const cors = require("cors"); 
const dotenv = require("dotenv").config();
const connectDb = require("./config/connectionDb");

const app = express();
const PORT = process.env.PORT || 5000;

//Active CORS avant toute route
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());
connectDb();

app.use("/recipe", require("./routes/recipe"));
app.use("/", require("./routes/user"));


app.listen(PORT, (err) => {
  if (err) console.error("Erreur serveur :", err);
  else console.log(`App is listening on port ${PORT}`);
});
