const express = require('express');
const router = express.Router();
const Card = require('../models/Card.model');


// router.get('/getCards', async(req, res) => {
//     try{
//         const response = await Card.find().sort({createdAt: -1}).limit(10);
//         const resData = res.json(response);
//         console.log('Fetched cards: ', response)
//         console.log('resData: ', resData);

//     }catch(err){
//         console.error('Something went wrong when fetching cards from database', err)
//     }
// })


router.get('/getCards', async (req, res) => {
    console.log('req: ', req.query)
    const page = parseInt(req.query.page) || 1;     // Default page = 1
    const limit = parseInt(req.query.limit) || 10;  // Default limit = 10
    // const skip = (page - 1) * limit;
    const skip = parseInt(req.query.skip) || 0
    
    // console.log('skip: ', skip);
    // console.log('page: ', page);
    // console.log('limit: ', limit);

    try {
        const response = await Card.find()
            .sort({ publishDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json(response);
        // console.log(`Fetched cards for page ${page}:`, response);
    } catch (err) {
        console.error('Something went wrong when fetching cards from database', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;