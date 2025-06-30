const User = require("../model/User");
const bcrypt = require("bcryptjs");

const getAllUser = async(req,res,next) =>{
    let users;

    try{
        users = await User.find();
    }
    catch(err){
        console.log(err);
    }
    if(!users){
        return res.status(404).json({ message : "users are not found"})
    }

    return res.status(200).json({users});
}

const signUp = async(req,res,next) =>{
   const { name , email , password , profileImage } = req.body;

   let existingUser;

   try{
    existingUser = await User.findOne({email})
   }catch(err){
    console.log(err);
   }

   if(existingUser){
       return res.status(400).json({message : "User is already exists!"})
   }
   const hashedPassword = bcrypt.hashSync(password);
   const user = new User({
       name,email,
       password: hashedPassword,
       profileImage: profileImage || undefined,
       blogs: []
   });

   try{
       await user.save();
       return res.status(201).json({ 
           user: {
               _id: user._id,
               name: user.name,
               email: user.email,
               profileImage: user.profileImage
           }
       });
   }
   catch(e){console.log(e);}
}

const logIn = async(req,res,next) => {
    const {email , password} = req.body;
    
    let existingUser;

    try{
     existingUser = await User.findOne({email})
    }catch(err){
     console.log(err);
     return res.status(500).json({message: "Server error"});
    }
    if(!existingUser){
        return res.status(404).json({message : "User is not found"})
    }

    const isPasswordCorrect = bcrypt.compareSync(password,existingUser.password);

    if(!isPasswordCorrect){
        return res.status(400).json({message: "Incorrect Password!"});
    }

    return res.status(200).json({
        user: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            profileImage: existingUser.profileImage
        }
    });
}

module.exports = { getAllUser, signUp , logIn};