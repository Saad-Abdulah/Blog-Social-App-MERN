const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const blogRouter = require("./routes/blog-routes");
const userRouter = require("./routes/user-routes");
const app = express();

// Ensure assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    abortOnLimit: true,
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: err.message
    });
});

// Database connection and server start
mongoose
    .connect("mongodb://localhost:27017/BlogApp")
    .then(() => {
        app.listen(5001, () => {
            console.log("Server running on port 5001");
        });
    })
    .catch((err) => console.log(err));
