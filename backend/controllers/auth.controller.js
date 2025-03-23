import generateTokenAndSetCookie from "../lib/utils/generateToken.js";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    try {
        const {fullName, username, email, password} = req.body;
        const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({error: "Invaild Email format"})
        }

        const existingUser = await User.findOne({ username }); // more like {username: username} but since it is single variable so it is {username} only
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" })
        }

        const existingEmail = await User.findOne({ email }); 
        if (existingEmail) {
            return res.status(400).json({ error: "Email is already taken" })
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" })
        }
        
        //hashing password with salt

        const salt = await bcrypt.genSalt(10) // 10 is the optimal salt length
        const hashedPassword = await bcrypt.hash(password, salt); 

        const newUser = new User({
            fullName: fullName,
            username: username,
            email: email,
            password: hashedPassword
        })

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            });
        } else {
            res.status(400).json({error: "Invalid User Data"})
        }

    } catch (error) {
        console.log("Error in signup controller", error.message)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const login = (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in signup controller", error.message)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const logout = (req, res) => {
    res.json({
        data: "you hit the logout endpoints"
    })
}