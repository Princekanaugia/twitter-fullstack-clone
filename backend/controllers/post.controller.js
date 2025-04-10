import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js"

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        })

        if (posts.length === 0 ) {
            return res.status(200).json({ message: "No Post Found" })
        } 

        res.status(200).json(posts)

    } catch (error) {
        console.log("Error in getAllPosts Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const getFollowingPosts = async (req, res) => {
    const userId = req.user._id

    try {
        const user = await User.findById(userId)    
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const following = user.following
        const followingPosts = await Post.find({ user: { $in: following }})
        .sort({ createdAt: -1 })
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        })

        res.status(200).json(followingPosts)

    } catch (error) {
        console.log("Error in getFollowingPosts Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const getUserPosts = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username })    
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const userPosts = await Post.find({ user: user._id })
        .sort({ createdAt: -1 })
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        })

        res.status(200).json(userPosts)

    } catch (error) {
        console.log("Error in getUserPosts Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const getLikedPosts = async (req, res) => {
    const userId = req.params.id

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts }})
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            }) 
            .populate({
                path: "comments.user",
                select: "-password",
            })

        res.status(200).json(likedPosts)

    } catch (error) {
        console.log("Error in getLikedPosts Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

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
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        const userLikedPost = post.likes.includes(userId)  // checking if the user already like the post or not

        if (userLikedPost) {
            // unlike the post if already liked
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId }})
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId }})
            return res.status(200).json({ message: "Post Unliked Successfully" })
        } else {
            // like the post if already unliked
            post.likes.push( userId )
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId }})
            await post.save();

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })

            await notification.save();

            return res.status(200).json({ message: "Post liked Successfully" })
        }

    } catch (error) {
        console.log("Error in likeUnlikePost Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ error: "Text feild is required" })
        }

        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({ error: "Post not found" })
        }

        const comment = { user: userId, text}

        post.comments.push(comment);

        await post.save();

        res.status(200).json(post)

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

