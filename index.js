const express = require("express");
const db = require("./routes/db-config");
require('dotenv').config();
const app = express();
const cookieParser = require("cookie-parser"); // Corrected the require statement
const cors = require("cors");
const axios = require("axios");

const PORT = process.env.PORT; // Added a default port value
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

app.use(express.static('public'));
app.use(cors());
app.use(cookieParser()); // Corrected the middleware name

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.connect((err) => {
    if (err) {
        console.error("Failed to connect to the database:", err);
    } else {
        console.log("Connected to the database");
    }
});

app.use("/", require("./routes/pages"));
app.use("/api", require("./controller/auth"));


// Route to generate token
app.get("/token", async (req, res) => {
    try {
        const token = await generateToken();
        res.status(200).json({ token });
    } catch (error) {
        console.error("Failed to generate token:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
});

// Function to generate tokens
const generateToken = async () => {
    try {
        const secret = process.env.SAFARICOM_CONSUMER_SECRET;
        const consumer = process.env.SAFARICOM_CONSUMER_KEY;
        const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers: {
                    authorization: `Basic ${auth}`,
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error("Failed to generate token:", error);
        throw new Error("Failed to generate token");
    }
};

// Route to process STK push
app.post("/stk", async (req, res) => {
    try {
        const token = await generateToken();
        const phone = req.body.phone.substring(1);
        const amount = req.body.amount;

        const date = new Date();
        const timestamp = 
            date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const shortcode = process.env.BUSINESS_SHORT_CODE;
        const passkey = process.env.PASS_KEY;
        const Password = new Buffer.from(shortcode + passkey + timestamp).toString("base64");

        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortcode,
                Password: Password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: `254${phone}`,
                PartyB: shortcode,
                PhoneNumber:`254${phone}`,
                CallBackURL: "https://c6fb-105-160-120-186.ngrok-free.app/callback",
                AccountReference: `254${phone}`,
                TransactionDesc: "Test",
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("STK push response:", response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Failed to process STK push:", error.message);
        res.status(400).json({ error: error.message });
    }
});

// // Route to handle callback from Safaricom API
// app.post("/callback", (req, res) => {
//     try {
//         // Log the callback data received from Safaricom
//         console.log("Callback received:", req.body);

//         // Extract payment details from the callback data
//         const phoneNumber = req.body.PhoneNumber; // Extract phone number
//         const transactionID = req.body.TransID; // Extract transaction ID
//         const transactionDate = req.body.TransTime; // Extract transaction date/time

//         //Optionally, store the payment details in your database
//         db.query("INSERT INTO payments (phone_number, transaction_id, transaction_date) VALUES (?, ?, ?)", [phoneNumber, transactionID, transactionDate], (err, result) => {
//             if (err) {
//                 console.error("Failed to store payment details:", err);
//             } else {
//                 console.log("Payment details stored successfully:", result);
//             }
//         });

//         // Respond with a success message
//         res.status(200).json({ success: true });
//     } catch (error) {
//         console.error("Error processing callback:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });
