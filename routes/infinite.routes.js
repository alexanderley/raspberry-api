const express = require('express');
const router = express.Router();
const Card = require('../models/Card.model');


// router.get("/getCards", async (req, res) => {
//   const page = parseInt(req.query.page as string) || 1;
//   const limit = parseInt(req.query.limit as string) || 20;
//   const skip = (page - 1) * limit;

//   try {
//     const cards = await Card.find().skip(skip).limit(limit);
//     const total = await Card.countDocuments();

//     res.json({
//       data: cards,
//       hasMore: skip + cards.length < total,
//       total,
//     });
//   } catch (err) {
//     console.error("Error fetching cards", err);
//     res.status(500).json({ error: "Failed to fetch cards" });
//   }
// });

router.get('/getCards', async(req, res) => {
    // const page = parseInt(req.query.page as string) || 1;
    // const limit = parseInt(req.query.limit as string) || 20;
    // const skip = (page - 1) * limit;
    try{
        const response = await Card.find();
        const resData = res.json(response);
        console.log('Fetched cards: ', response)
        console.log('resData: ', resData);

    }catch(err){
        console.error('Something went wrong when fetching cards from database', err)
    }
})

module.exports = router;