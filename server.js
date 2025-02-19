const express = require('express');
const errorHandler = require('./middleware/errorhandler');
const connectDB = require('./config/dbConnection');
const dotenv = require("dotenv").config();

const app = express();
connectDB();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use("/api/user", require("./routes/userRoutes"))
app.use(errorHandler)

app.listen(5000, ()=>{
    console.log(`server running on port 5000`)
})