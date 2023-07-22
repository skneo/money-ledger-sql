const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')
const JWT_SECRET = process.env.JWT_SECRET
//working
router.post('/send-otp', async (req, res) => {
    let user = await User.findOne({ where: { email: req.body.email } })
    if (req.body.resetPassword) {
        if (!user) {
            return res.status(400).json({ error: "Email not registered" })
        }
    } else {
        if (user) {
            return res.status(400).json({ error: "Sorry user exists with this email" })
        }
    }
    const axios = require('axios');
    let otp = Math.floor(100000 + Math.random() * 900000);
    otp = otp.toString();
    const options = {
        method: 'POST',
        url: 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.SENDGRID_API,
            'X-RapidAPI-Host': 'rapidprod-sendgrid-v1.p.rapidapi.com'
        },
        data: {
            personalizations: [
                {
                    to: [
                        {
                            email: req.body.email
                        }
                    ],
                    subject: 'Money-Ledger OTP'
                }
            ],
            from: {
                email: 'noreply@matrixe.in'
            },
            content: [
                {
                    type: 'text/plain',
                    value: 'OTP for Money-Ledger is ' + otp
                }
            ]
        }
    };
    try {
        const response = await axios.request(options);
        // console.log(response.data);
        const otpToken = jwt.sign({ email: req.body.email, otp }, JWT_SECRET);
        res.json({ 'message': 'OTP sent to ' + req.body.email, otpToken })
    } catch (error) {
        // console.error(error);
        res.status(500).send({ error: "Failed to send OTP! Internal server error" })
    }
});
//working
router.post('/register', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password should have more than 8 characters').isLength({ min: 8 })
], async (req, res) => {
    const errors = validationResult(req);
    //return error if validation fails
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Registration failed! Invalid inputs' });
    }
    try {
        const otpToken = req.body.otpToken;
        const tokenData = jwt.verify(otpToken, JWT_SECRET)
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)
        if (!(tokenData.email === req.body.email && tokenData.otp === req.body.otp)) {
            return res.status(400).json({ error: "Registration failed! Wrong OTP" })
        }
        let user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({ authToken, registration: 'success', userName: req.body.name })
    } catch (error) {
        // console.error(error.message);
        res.status(500).send({ error: "Internal server error" })
    }
})
//working
//authenticate a user using POST "/api/auth/login", no login required
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        let user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(400).json({ error: "Wrong credentials" })
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            return res.status(400).json({ error: "Wrong credentials" })
        }
        user.last_login = new Date();
        await user.save()
        const data = {
            user: {
                id: user.id
            }
        }
        //set expiry to 15 minutes
        const expiryTime = Math.floor(Date.now() / 1000) + (60 * 15);
        const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: expiryTime });
        res.json({ authToken, 'userName': user.name, 'loggedIn': 'yes' })
    } catch (error) {
        // console.error(error.message);
        res.status(500).send({ message: "Internal server error" })
    }
})
router.put('/reset-password', async (req, res) => {
    try {
        const otpToken = req.body.otpToken;
        const tokenData = jwt.verify(otpToken, JWT_SECRET)
        if (!(tokenData.email === req.body.email && tokenData.otp === req.body.otp)) {
            return res.status(400).json({ error: "Wrong OTP!" })
        }
        const user = await User.findOne({ where: { email: req.body.email } })
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)
        user.password = secPass
        await user.save()
        res.json({ "message": "Password changed successfully", passwordChanged: true })
    } catch (error) {
        // console.error(error.message);
        res.status(500).send({ error: "Internal server error" })
    }
})
//get loggedin user details using POST 'api/auth/getuser'
// router.post('/fetchuser', fetchuser, async (req, res) => {
//     try {
//         let userId = req.user.id;
//         const user = await User.findById(userId).select("-password")
//         res.send({ user })
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send({ message: "Some error occurred" })
//     }
// })

//change password
router.put('/change-password', fetchuser, async (req, res) => {
    try {
        let userId = req.user.id;
        const user = await User.findByPk(userId)
        const passwordCompare = await bcrypt.compare(req.body.oldPassword, user.password)
        if (!passwordCompare) {
            return res.status(400).json({ message: "Error! Old password not matched" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)
        user.password = secPass
        await user.save()
        res.json({ "message": "Password changed successfully", passwordChanged: true })
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: "Some error occurred" })
    }
})

module.exports = router