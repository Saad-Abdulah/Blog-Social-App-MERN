const mongoose = require("mongoose");
const { findByIdAndRemove } = require("../model/Blog");
const Blog = require("../model/Blog");
const User = require("../model/User");
const Comment = require("../model/Comment");
const path = require('path');

const getAllBlogs = async (req, res, next) => {
    let blogs;
    try {
        blogs = await Blog.find()
            .populate("user")
            .sort({ date: -1 })
            .lean()
            .exec();

        // Add social counts if not present
        blogs = blogs.map(blog => ({
            ...blog,
            likesCount: blog.likesCount || 0,
            commentsCount: blog.commentsCount || 0,
            sharesCount: blog.sharesCount || 0,
            likes: blog.likes || []
        }));

        res.status(200).json({ blogs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
}
};

// const addBlog = async(req,res,next) =>{

//     const { title , desc , img , user } = req.body;

//     let existingUser;
//     try {
//         existingUser = await User.findById(user);
//     } catch (e) {
//         return console.log(e);
//     }

//     if(!existingUser){
//         return res.status(400).json({message: " Unautorized"});
//     }
//     const blog = new Blog({
//         title ,desc , img , user
//     });

//     try {
//       const session = await mongoose.startSession();
//       session.startTransaction();
//       await  blog.save({session});
//       existingUser.blogs.push(blog);
//       await existingUser.save({session});
//       await session.commitTransaction();
//     } catch (e) {
//        return res.status(500).json({message:e})
//     }

//     return res.status(200).json({blog});
// }


const addBlog = async (req, res, next) => {
    try {
        const { title, desc, img, user } = req.body;
        
        // Find the user first
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(400).json({ message: "Unauthorized - User not found" });
    }

        let blog = new Blog({
            title,
            desc,
            img: img || "placeholder.jpg", // Default to placeholder if no image provided
            user,
            date: new Date()
        });

        // Save the blog first
        await blog.save();
        
        // Update user's blogs array
        existingUser.blogs.push(blog._id);
        await existingUser.save();

        // Populate user details before sending response
        blog = await blog.populate("user");

        return res.status(200).json({ blog });
      } catch (err) {
        console.log(err);
        // If there was an error and the blog was created, try to remove it
        if (err.blog && err.blog._id) {
            await Blog.findByIdAndDelete(err.blog._id);
      }
        return res.status(500).json({ 
            message: "Failed to create blog",
            error: err.message 
        });
}
};

const updateBlog = async(req,res,next) => {
    const blogId = req.params.id;
    const { title , desc  } = req.body;
   
    let blog;

    try {
         blog = await Blog.findByIdAndUpdate(blogId , {
            title,
            desc
        });
    } catch (e) {
        return console.log(e);
    }

    if(!blog){
        return res.status(500).json({message : "Unable to update"})
    }
    
    return res.status(200).json({blog});
}

const getById = async (req, res, next) => {
    const id = req.params.id;
    let blog;
    try {
        blog = await Blog.findById(id)
            .populate("user")
            .lean()
            .exec();

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
    }
    
        // Add social counts if not present
        blog = {
            ...blog,
            likesCount: blog.likesCount || 0,
            commentsCount: blog.commentsCount || 0,
            sharesCount: blog.sharesCount || 0,
            likes: blog.likes || []
        };

        res.status(200).json({ blog });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteBlog = async (req, res, next) => {

    const id = req.params.id;
    
    try {
        const blog = await Blog.findByIdAndDelete(id).populate('user');

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Remove the blog from the user's blogs array
        const user = blog.user;
        user.blogs.pull(blog);
        await user.save();

        return res.status(200).json({ message: "Successfully deleted" });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Unable to delete" });

    }
}


const getByUserId = async (req, res, next) => {
    const userId = req.params.id;
    let userBlogs;
    try {
        userBlogs = await User.findById(userId)
            .select('name profileImage _id blogs')
            .populate({
                path: "blogs",
                select: 'title desc img date'
            });
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Failed to fetch user blogs"});
    }
    if (!userBlogs) {
      return res.status(404).json({ message: "No Blog Found" });
    }
    return res.status(200).json({ user: userBlogs });
  };

const likeBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.body.userId;

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const likeIndex = blog.likes.indexOf(userId);
        if (likeIndex === -1) {
            // Add like
            blog.likes.push(userId);
            blog.likesCount = blog.likesCount + 1;
        } else {
            // Remove like
            blog.likes.splice(likeIndex, 1);
            blog.likesCount = blog.likesCount - 1;
        }

        await blog.save();
        res.status(200).json({ message: "Like updated successfully", blog });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const addComment = async (req, res) => {
    try {
        const { content, userId } = req.body;
        const blogId = req.params.id;

        const comment = new Comment({
            content,
            user: userId,
            blog: blogId,
        });

        await comment.save();

        // Update comment count
        const blog = await Blog.findById(blogId);
        blog.commentsCount = (blog.commentsCount || 0) + 1;
        await blog.save();

        // Populate user details
        await comment.populate('user', 'name profileImage');

        res.status(201).json({ comment });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getComments = async (req, res) => {
    try {
        const blogId = req.params.id;
        const comments = await Comment.find({ blog: blogId })
            .populate({
                path: 'user',
                select: 'name profileImage _id'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ comments });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const incrementShareCount = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);
        
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        blog.sharesCount = (blog.sharesCount || 0) + 1;
        await blog.save();

        res.status(200).json({ message: "Share count updated", sharesCount: blog.sharesCount });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getAllBlogs,
    addBlog,
    updateBlog,
    getById,
    deleteBlog,
    getByUserId,
    likeBlog,
    addComment,
    getComments,
    incrementShareCount
};