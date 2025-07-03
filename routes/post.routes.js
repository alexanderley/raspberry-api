const express = require('express');
const router = express.Router();

    // const Post = require("../models/Post.model");
    // const Posts = require("../models/Posts.model");

    // #Todo Check
    // router.post("/createPostTest", async (req, res) => {
    //     // For Posts
    //     const { userId } = req.body;

    //     // For One Post
    //     const { mediaType, mediaUrl, caption } = req.body;

    //     try {
    //         // Validate required fields
    //         if (!userId || !mediaType || !mediaUrl) {
    //             res.status(400).json({ message: "Missing required fields" });
    //             return;
    //         }

    //         // Find or create the Posts collection for the user
    //         let foundPostsCollection = await Posts.findOne({ userId });
    //         if (!foundPostsCollection) {
    //             foundPostsCollection = await Posts.create({ userId, posts: [] });
    //         }

    //         // Create the new post
    //         const newPost = await Post.create({
    //             mediaType,
    //             mediaUrl,
    //             caption,
    //             userId,  // It's good practice to store the userId with each post
    //             createdAt: new Date()
    //         });

    //         // Add the post ID to the user's Posts collection
    //         await Posts.findOneAndUpdate(
    //             { userId },
    //             { $push: { posts: newPost._id } },
    //             { new: true }
    //         );

    //         res.status(201).json({
    //             message: "Post created successfully",
    //             post: newPost
    //         });

    //     } catch (err) {
    //         console.error("Error creating post:", err);
    //         res.status(500).json({ message: "Internal Server Error" });
    //     }
    // });

router.post("/createPost", async(req,res,)=>{
    // For Posts
    const {userId} = req.body;

    // For One Post
    const {mediaType, mediaUrl, caption} = req.body;

    try {
        const foundPostsCollection = await Posts.findOne({userId})
        if(!foundPostsCollection){
            Posts.create({userId});
        }
        // Create Post and Add it to the Posts collection
        await Post.findOne({mediaType, mediaUrl, caption})

        // Add postId into the Posts array
        const postCollection = await Posts.findOne({userId});

        await Posts.findOneAndUpdate(
            {userId},
            {$push: {posts: newPost._id}},
            {new: true}
        );

        res.status(201).json({
            message: "Post created successfully",
            post: newPost,
        });

    }catch(err){
       res.status(500).json({message: "Internal Server Error"})
       return
    }
});

module.exports = router;