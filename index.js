const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require ('dotenv').config();
const { Usermodel } = require("./models/Usermodel");
const { Feedmodel } = require("./models/Feedmodel")

const app = new express;

app.use(bodyparser.json());
app.use(cors());

const { MONGODB_URI } = process.env;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


//Api to Signin
app.post("/signin", async (req, res) => {

    try {
        let email = req.body.email;
        let password = req.body.password;

        const result = await Usermodel.findOne({ email: email })

        if (!result) throw ('username not found')


        const passwordValidator = bcrypt.compareSync(password, result.password)

        if (!passwordValidator) throw ({ "status": "failed", "data": "invalid password" })

        // Token Authentication
        const token = jwt.sign({ "email": email, "id": result._id }, "signin-token", { expiresIn: "1d" })
        if (!token) throw ("Token not generated")
        console.log(result)
        console.log(token)
        res.send({ "status": "success", "data": result, "token": token })

    }

    catch (error) {
        console.log(error);
        res.send(error);
    }
});



//Api to add a user
app.post("/adduser", (req, res) => {

    jwt.verify(req.body.token, "signin-token", (err, decoded) => {
        if (decoded && decoded.email) {

            var data = {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10)
            }

            var user = new Usermodel(data);
            user.save().then(() => {
                res.json({ "Status": "User added successfully", "Data": data })
               
            })
                .catch((err) => {
                    res.json({ "Status": "Error", "Error": err })
                   
                })
        }
        else {
            res.json("Authentication error")
            console.log("Authentication error")
        }

    })
});


//Api to add a post
app.post("/addpost", (req, res) => {

    jwt.verify(req.body.token, "signin-token", (err, decoded) => {
        if (decoded && decoded.email) {

            var data = req.body;
            // console.log(data)
            const newPost = new Feedmodel(data)
            newPost.save(
            ).then(() => {
                res.json({ "Status": "Post added successfully", "Data": data })
                // console.log(data);

            })
                .catch((err) => {
                    res.json({ "Status": "Error", "Error": err })
                    // console.log(err);
                })
        }
    })
});

//api to view Homepage feeds
app.post("/viewpost", async(req, res) => {

    jwt.verify(req.body.token, "signin-token",async (err, decoded) => {
        if (decoded && decoded.email) {

            try {
                var result = await Feedmodel.find({ "userId": req.body.userId }).sort({updatedAt:"desc"});
                res.json(result);
                console.log(req.body.userId)
                console.log(result)
            } catch (error) {
                console.log(error)
                res.status(500).send(error);
            }
        }
    })
});


app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log("Some error occured");
    } else {
        console.log("The server is running");
    }
});

