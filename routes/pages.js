const express = require('express');
const loggedIn = require('../controller/loggedIn');
const logout = require('../controller/logout');
const router = express.Router();

router.get("/", loggedIn, (req, res) => {
    if (req.user) {
        res.render("index", { status:"loggedIn", user:req.user});
    } else {
        res.render("index", { status: "no", user: "nothing"});
    } 
})
router.get("/register", (req, res) => {
    res.sendFile("register.html", { root: "./public" });
})

router.get("/login", (req, res) => {
    res.sendFile("login.html", { root: "./public/" });
})

router.get("/checkout", (req, res) => {
    res.sendFile("checkout.html", { root: "./public/" });
})

router.get("/payment", (req, res) => {
    res.sendFile("payment.html", { root: "./public/" });
})

router.get("/adminlogin", (req, res) => {
    res.sendFile("adminlogin.html", { root: "./public/" });
})

router.get("/adminemployees", (req, res) => {
    res.sendFile("adminemployees.html", { root: "./public/" });
})

router.get("/admincustomer", (req, res) => {
    res.sendFile("admincustomer.html", { root: "./public/" });
})

router.get("/adminservices", (req, res) => {
    res.sendFile("adminservices.html", { root: "./public/" });
})

router.get("/adminpayments", (req, res) => {
    res.sendFile("adminpayments.html", { root: "./public/" });
})

router.get("/adminpage", (req, res) => {
    res.sendFile("adminpage.html", { root: "./public/" });
})
router.get("/logout", logout)

module.exports = router;