import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({username}).select("-password")
        if (!user) {
            return res.status(404).json({message: "User Not Found"})
        }
        
        res.status(200).json(user)
    } catch (error) {
        console.log("Error in getUserProfile Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select('following');

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                },
            },
            {
                $sample: {
                    size: 10
                }
            },
        ]);

        const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
        
    } catch (error) {
        console.log("Error in getSuggestedUser Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id)

        if (!userToModify || !currentUser) {
            return res.status(400).json({error: "User Not Found"})
        }
        
        if (id === req.user._id.toString()) {
            return res.status(400).json({error: " you can't follow/unfollow yourself"})
        }

        const isFollowing = currentUser.following.includes(id)

        if (isFollowing) {
            //Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })

            // TODO: return the id of the user as a response
            res.status(200).json({ message: "User Unfollowed Successfully" })

        } else {
            //Follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            
            // send notification to the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            });

            await newNotification.save();

            // TODO: return the id of the user as a response
            res.status(200).json({ message: "User followed Successfully" })
        }

    } catch (error) {
        console.log("Error in followUnfollowUser Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export const updateUser  = async (req, res) => {
    const {fullName, email, username, currentPassword, newPassword, bio, link} = req.body;
    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;
    
    try {
        let user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (( !newPassword && currentPassword ) || ( !currentPassword && newPassword )) {
            return res.status(400).json({ error: 'Please provide both current passwor and new password' });
        }

        if ( currentPassword && newPassword ) {
            const isMatch = await bcrypt.compare( currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current Password is incorrect" })
            } 
            if ( newPassword.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' })
            }

            const salt = await bcrypt.genSaltSync(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if ( profileImg ) { 
            // deleting already saved profile img
            if (user.profileImg) {
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                // let above URL be the link to the saved profile which we have to delete then extract the 'png name(image id)' from the URL
                // extract is done by following: user.profile.split('/').pop().split(.)[0]
                await cloudinary.uploader.destroyer(user.profileImg.split('/').pop().split('.')[0]);
            }

            // uploading new profile image
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }

        if ( coverImg ) {
            // deleting already saved cover img
            if (user.coverImg) {
                // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
                // let above URL be the link to the saved cover which we have to delete then extract the 'png name(image id)' from the URL
                // extract is done by following: user.cover.split('/').pop().split(.)[0]
                await cloudinary.uploader.destroyer(user.coverImg.split('/').pop().split('.')[0]);
            }

            // uploading new cover image
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        //password shoulb be null in response
        user.password = null;

        return res.status(200).json({user})


    } catch (error) {
        console.log("Error in updateUser Controller: ", error.message)
        res.status(500).json({error: 'Internal Server Error'})
    }
}