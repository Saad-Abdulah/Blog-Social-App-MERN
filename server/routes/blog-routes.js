const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getAllBlogs, addBlog, updateBlog, getById, deleteBlog, getByUserId, likeBlog, addComment, getComments, incrementShareCount } = require("../controller/blog-controller");

const blogRouter = express.Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to the client's public folder
    const uploadPath = path.join(__dirname, '../../client/public');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Keep original filename
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// File upload route
blogRouter.post("/upload", upload.single('file'), async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    res.status(200).json({ 
      message: 'File uploaded successfully',
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Blog routes
blogRouter.get("/", getAllBlogs);
blogRouter.post("/add", addBlog);
blogRouter.put("/update/:id", updateBlog);
blogRouter.get("/:id", getById);
blogRouter.delete("/:id", deleteBlog);
blogRouter.get("/user/:id", getByUserId);

// Social routes
blogRouter.post("/:id/like", likeBlog);
blogRouter.post("/:id/comment", addComment);
blogRouter.get("/:id/comments", getComments);
blogRouter.post("/:id/share", incrementShareCount);

// Error handling middleware
blogRouter.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        message: error.message || 'Something went wrong'
    });
});

module.exports = blogRouter;