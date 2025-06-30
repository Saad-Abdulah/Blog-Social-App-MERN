const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title : {
        type: String,
        required: true,
    },
    desc :  {
        type: String,
        required: true,
    },
    img :  {
        type: String,
        required: true,
    },
    user : {
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: true,
    },
    date: {
        type: Date, 
        default: Date.now, 
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: "User"
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    sharesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    }
})

module.exports =  mongoose.model("Blog", blogSchema);