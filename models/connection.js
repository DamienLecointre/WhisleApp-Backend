const mongoose = require("mongoose");
const connectionString = process.env.CONNECTION_STRING;
// console.log de la connection String, bug de lecture chez FTA
// console.log("Trying to connect to:", connectionString);

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))

  .catch((error) => console.error(error));
