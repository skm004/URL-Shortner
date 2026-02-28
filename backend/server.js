const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const shortid = require("shortid");
const Url = require("./models/Url");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");


require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

  app.get("/", (req, res) => {
  res.send("Backend is running");
});

//Shorten URL
app.post("/shorten",auth, async (req, res) => {
    try {
        const {originalUrl, customCode} = req.body;

        if(!originalUrl) {
            return res.status(400).json("URL is required");
        }

        let shortCode;

        if(customCode){
            const existing = await Url.findOne({ shortCode: customCode});

            if(existing){
                return res.status(400).json("Cose already taken");
            }

            shortCode = customCode;
        }
        else{
            shortCode = shortid.generate();
        }

        const newUrl = new Url({
            originalUrl,
            shortCode,
            userId: req.userId,
        });

        await newUrl.save();

        res.json({ 
            shortUrl: `http://localhost:5000/${shortCode}`
        });
    } catch(err){
        console.log(err);
        res.status(500).json("Server Error");
    }
});

//Signup API
app.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json("Email and password are required");
        }

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(404).json("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.json({ message: "User created successfully" });

    } catch(err){
        console.log(err);
        res.status(500).json("Server Error");
    }
});

//Login API
app.post("/login",async (req, res) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(404).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if(!user){
            return res.status(404).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(404).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch(err){
        console.log(err);
        res.status(500).json("Server Error");
    }
});

//User URLs
app.get("/my-urls", auth, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json(urls);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//Clicks Stats
app.get("/stats/:code", async (req,res) => {
    try {
        const url = await Url.findOne({ shortCode: req.params.code});

        if(!url){
            return res.status(404).json({error: "URL not found"});
        }
        res.json({
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            clicks: url.clicks,
            createdAt: url.createdAt
        });
    } catch(err){
        console.log(err);
        res.status(500).json("Server Error");
    }
});

//Redirect API
app.get("/:code", async (req, res) => {
    try{
        const url = await Url.findOne({ shortCode: req.params.code });

        if(url){
            url.clicks++;
            await url.save();
            return res.redirect(url.originalUrl);
        } else{
            return res.status(404).json("URL not found");
        }
    } catch(err){
        console.log(err);
        res.status(500).send("Server Error");
    }
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});