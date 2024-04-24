const db = require("../routes/db-config");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
    const { email, password: Npassword } = req.body
    if (!email || !Npassword) return res.json({ status: "error", error: "Please enter your email and password!"});
    else {
        db.query('SELECT email FROM login WHERE email = ?', [email], async (err, result) => {
            if (err) throw err;
            if (result[0]) return res.json({ status: "error", error: "Email has already been registered"})
            else {
                const password = await bcrypt.hash(Npassword, 8);
                db.query('INSERT INTO login SET ?', { email: email, password: password }, (error, results) => {
                    if (error) throw error;
                    return res.json({ status: "success", success: "User has been registered" })
                })
            }
        })
    }
}
module.exports = register;