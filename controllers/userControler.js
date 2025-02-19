const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc Register user
//@route POST/api/user
//@access public
const registerUser = asyncHandler(async (req,res)=>{
    const {username, email, password} = req.body;
    if(!username || !password || !email){
        res.status(400);
        throw new Error("All fields are maindatory");
    }

    const userAvailable =  await User.findOne({email})
    if(userAvailable){
        res.status(400);
        throw new Error("User already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username, email, password:hashedPassword
    });

    if (user) {
        res.status(201).json({_id: user.id, name: user.username, email: user.email})
    }else{
        res.status(400);
        throw new Error("User data not valid");
    }
})

//@desc Login user
//@route POST/api/user
//@access public
const loginUser = asyncHandler(async (req,res)=>{
    const {email, password} = req.body;
    if( !email || !password){
        res.status(400);
        throw new Error("All fields are maindatory");
    }

    const user = await User.findOne({email});
    if(email && (await bcrypt.compare(password, user.password))){
        const accessToken = jwt.sign({
            user:{
                username: user.username,
                email: user.email,
                id: user.id
            }   
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
        );
        res.status(200).json(accessToken);
    }else{
        res.status(401)
        throw new Error("Email or Password is not valid")
    }
});

//@desc Current user
//@route GET/api/contacts
//@access private
const currentUser = asyncHandler(async (req,res)=>{
    res.json(req.user);
})

module.exports = {registerUser, loginUser, currentUser};