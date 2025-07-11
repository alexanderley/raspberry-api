const express = require('express');
const router = express.router;

const User = require("../models/User.model");

// This feches all user
// #Todo needs to be edited later
router.get("/getUserProfiles", async (req, res) => {
    try {
        const userCollection = await User.find(); 
        res.status(200).json(userCollection);
    } catch (err) {
        console.error("Could not fetch user profiles", err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// #Todo
// Edite the Schema so users can follow each other.
router.post("/followUser", async(req, res)=>{
    try{
        
    }catch(err){
        console.err('Somethign went wrong when following user');
        res.status(500).json({message: "Internal Server error"})
    }
})


module.exports = router