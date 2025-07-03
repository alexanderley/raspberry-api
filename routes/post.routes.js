const express = require('express');
const router = express.Router();

    const Post = require("../models/Post.model");
    const PostCollection = require("../models/PostCollection.model");

    router.get('/getUserPosts', async(req, res) => {
        const {userId} = req.body;
     
        try{  
            const postCollection = await PostCollection.findOne({userId}).populate('posts').exec();
            //    console.log('userId: ', userId)
            if(!postCollection){
                return res.status(404).json({message: 'No posts found for the user'});
            }

            console.log('postCollection', postCollection.posts);
            res.status(200).json(postCollection.posts)
        }catch(err){
            console.error('Could not fetch user posts');
            res.status(500).json({message: 'Internal Server Error'})
        }
    });


    router.post("/createPost", async (req, res) => {
        // For Posts
        const { userId } = req.body;

        // For One Post
        const { mediaType, mediaUrl, caption } = req.body;

        console.log("inputs: ", mediaType, mediaUrl, caption );
        try {
            // Validate required fields
            if (!userId || !mediaType || !mediaUrl) {
                res.status(400).json({ message: "Missing required fields" });
                return;
            }

            // Find or create the Posts collection for the user
            let foundPostsCollection = await PostCollection.findOne({ userId });
            if (!foundPostsCollection) {
                foundPostsCollection = await PostCollection.create({ userId, posts: [] });
            }

            // Create the new post
            const newPost = await Post.create({
                userId,
                mediaType,
                mediaUrl,
                caption,
                createdAt: new Date(),
            });

            // Add the post ID to the user's Posts collection
            await PostCollection.findOneAndUpdate(
                { userId },
                { $push: { posts: newPost._id } },
                { new: true }
            );

            res.status(201).json({
                message: "Post created successfully",
                post: newPost
            });

        } catch (err) {
            console.error("Error creating post:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });


module.exports = router;