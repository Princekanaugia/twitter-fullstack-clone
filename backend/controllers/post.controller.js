import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message : "User not found" })
        }

        if (!img && !text) {
            return res.status(400).json({ error: "Post must have Image or Text" })
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        })

        await newPost.save()
        res.status(200).json({newPost});

    } catch (error) {
        console.log("Error in createPost Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in likeUnlikePost Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const commentOnPost = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in commentOnPost Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post) {
            return res.status(404).json({ message: "Post not found" })
        } 

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post" })
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(postId)

        res.status(200).json({ message: "Post deleted successfully" })

    } catch (error) {
        console.log("Error in deletePost Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

