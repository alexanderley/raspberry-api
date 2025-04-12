const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const nodemailer = require("nodemailer");
const frontend_URL = require("../frontendKey");

const { isAuthenticated } = require('./../middleware/jwt.middleware.js');

const router = express.Router();
const saltRounds = 10;


// POST /auth/signup  - Creates a new user in the database
router.post('/signup', async(req, res, next) => {
  const { email, password, name } = req.body;

  // Check if email or password or name are provided as empty string 
  if (email === '' || password === '' || name === '') {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' });
    return;
  }
  
  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }

  try {
    const foundUser = await User.findOne({ email });
  
    if (foundUser) {
      res.status(400).json({ message: "User already exists." });
      return;
    }
  
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log("Salt: ", salt);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const verificationToken = jwt.sign({ email }, process.env.TOKEN_SECRET, {
      expiresIn: "1d",
    });

    const createdUser = await User.create({ email, password: hashedPassword, name, verificationToken });

    // ### Nodemailer implementation
    // password from the email server
    // const EMAIL_PASSWORD = process.env.EMAIL_SECRET;

    // const transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: "alexander.ley.inbox@gmail.com",
    //     pass: EMAIL_PASSWORD,
    //   },
    // });

    // // url that is goin to be send to the user in order to verify their email
    // const verificationLink = `${frontend_URL}/verify/?token=${verificationToken}`;
    // const msg = {
    //   from: '"The Express app 👻" <foo@example.com>',
    //   to: `${email}`,
    //   subject: "Account Verification",
    //   text: `Click the following link to verify your account: ${verificationLink}`,
    // };

    // await transporter.sendMail(msg);
  
    // const { email: createdEmail, name: createdName, _id: createdId } = createdUser;
    // const user = { email: createdEmail, name: createdName, _id: createdId,  };
  
    res.status(201).json({ createdUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// POST  /auth/login - Verifies email and password and returns a JWT
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string 
  if (email === '' || password === '') {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }
    try{
      const foundUser = await User.findOne({ email })
      if(!foundUser){
        res.status(401).json({ message: "User not found." })
        return;  
      }
      // passwort check
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
      if(passwordCorrect){
         // Deconstruct the user object to omit the password
         const { _id, email, name } = foundUser;
        
         // Create an object that will be set as the token payload
         const payload = { _id, email, name };
 
         // Create and sign the token
         const authToken = jwt.sign( 
           payload,
           process.env.TOKEN_SECRET,
           { algorithm: 'HS256', expiresIn: "6h" }
         );
 
         // Send the token as the response
         res.status(200).json({ authToken: authToken });
         return
      }
      else {
        res.status(401).json({ message: "Unable to authenticate the user" });
        return
      }      
    }catch(err){
      res.status(500).json({message: "Internal Server Error"})
      return
    }
});


// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req, res, next) => {

  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  console.log(`req.payload`, req.payload);

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload);
});

router.put("/mail/:token", async (req, res, next) => {
  const { token } = req.params;
  const verificationToken = token;

  try {
    const foundUser = await User.findOne({ verificationToken });
    if (foundUser) {
      foundUser.confirmed = true;
      await foundUser.save();
      res.status(200).json({ message: "User was found and updated" });
    }
    if (!foundUser) {
      res.status(200).json({ message: "User was NOT found" });
    }
  } catch (err) {
    res.status(500).json({ message: "User could not be found" });
  }
});


module.exports = router;