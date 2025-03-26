const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/dbConnection");
const passport = require("./config/passport");
const dotenv = require("dotenv").config();
const cors = require('cors');

const app = express();
connectDB();

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(passport.initialize()); 


app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
