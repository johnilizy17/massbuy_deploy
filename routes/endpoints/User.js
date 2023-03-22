require('dotenv').config();
const User = require("../../models/user");
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getMilliseconds() + file.originalname);
    }
});
const { tokenCallback } = require('../../functions/token');
const upload = multer({ storage: storage }).single('image');


const { verifyToken } = tokenCallback()

let routes = (app) => {
    app.post("/register", async (req, res) => {
        try {
            const { firstname, lastname, email, password, phone, role } = req.body;
            if (!firstname || !lastname || !email || !password)
                return res.status(400).json({ msg: "Please fill in all fields, one or more fileds are empty!" })

            if (!validateEmail(email))
                return res.status(400).json({ msg: "Please enter a valid email address!" })

            const user = await User.findOne({ email })
            if (user) return res.status(400).json({ msg: "This email already exists, please use another email address!" })

            if (password.length < 8)
                return res.status(400).json({ msg: "Password must be atleaast 8 characters long!" })

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                firstname, lastname, email, password: passwordHash, phone, role
            }
            let user_ = new User(newUser);
            user_.referalLink = "/register/referral/" + user_._id
            // const activation_token = createActivationToken(newUser)

            // const url = `${CLIENT_URL}/user/activate/${activation_token}`

            // sendMail(email, url, "Verify your email address")
            await user_.save();
            res.status(200).json({ msg: "Registration Successful, Please proceed to login" })

        }
        catch (err) {
            console.log('error o')
            return res.status(500).json({ msg: err.message });
        }

    });

    app.post("/register/referral/:id", async (req, res) => {
        try {
            const { firstname, lastname, email, password, phone, role } = req.body;
            if (!firstname || !lastname || !email || !password)
                return res.status(400).json({ msg: "Please fill in all fields, one or more fileds are empty!" })

            if (!validateEmail(email))
                return res.status(400).json({ msg: "Please enter a valid email address!" })

            const user = await User.findOne({ email })
            if (user) return res.status(400).json({ msg: "This email already exists, please use another email address!" })

            if (password.length < 8)
                return res.status(400).json({ msg: "Password must be atleaast 8 characters long!" })


            const referral = await User.findOne({ _id: req.params.id })

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                firstname, lastname, email, password: passwordHash, phone, role
            }
            let user_ = new User(newUser)
            user_.referalLink = "/register/referral/" + user_._id
            referral.referrals.push(user_._id)
            await referral.save()
            await user_.save();
            res.status(200).json({ msg: "Registration Successful, Please proceed to login" })

        }
        catch (err) {
            console.log('error o')
            return res.status(500).json({ msg: err.message });
        }

    });

    app.post("/register/admin", async (req, res) => {
        try {
            const { firstname, lastname, email, password, phone, role } = req.body;
            if (!firstname || !lastname || !email || !password)
                return res.status(400).json({ msg: "Please fill in all fields, one or more fileds are empty!" })

            if (!validateEmail(email))
                return res.status(400).json({ msg: "Please enter a valid email address!" })

            const user = await User.findOne({ email })
            if (user) return res.status(400).json({ msg: "This email already exists, please use another email address!" })

            if (password.length < 8)
                return res.status(400).json({ msg: "Password must be atleaast 8 characters long!" })

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                firstname, lastname, email, password: passwordHash, phone, role: "admin"
            }

            let user_ = new User(newUser);

            // const activation_token = createActivationToken(newUser)

            // const url = `${CLIENT_URL}/user/activate/${activation_token}`

            // sendMail(email, url, "Verify your email address")
            await user_.save();
            // res.json({ msg: "Registration Successful, Please check you email for verification mail to activate your account!" })
            res.status(200).json({ msg: "Registration Successful, Please proceed to login!" })

        }
        catch (err) {
            console.log('error o')
            return res.status(500).json({ msg: err.message });
        }

    });

    app.get("/users", async (req, res) => {
        try {
            let users = await User.find({ role: "user" }).sort({ firstname: 1 })
            res.json(users)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });


    app.get("/users/referral", async (req, res) => {


        const responses = verifyToken({ authToken: req.header('authorization') })

        try {
            let users = await User.find({ referalLink: responses.data.id })
            res.json(users)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get("/admins", async (req, res) => {
        try {
            let users = await User.find({ role: "admin" }).sort({ firstname: 1 })
            res.json(users)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // to edit
    app.put('/user/:id', async (req, res) => {
        try {
            let update = req.body;
            let user = await User.updateOne({ _id: req.params.id }, update, { returnOriginal: false });
            return res.json(user)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    app.get("/user/:id", async (req, res) => {
        const responses = verifyToken({ authToken: req.header('authorization') })

        try {
            let user = await User.findOne({ _id: responses.data.id })
                .populate("referrals", "firstname lastname email")
            res.json(user)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // update dp
    app.put('/profilepic/:id', async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err);
            } else {
                if (req.file) {
                    req.body.image = '/' + req.file.path;
                    try {
                        let update = req.body;
                        let user = await User.findOneAndUpdate({ _id: req.params.id }, update, { returnOriginal: false });
                        return res.json(user)
                    }
                    catch (err) {
                        res.status(500).send(err);
                    }
                }
            }
        });
    });

    app.delete('/user/:id', async (req, res) => {
        try {
            await User.deleteOne({ _id: req.params.id })
            res.json({ msg: "User Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.post("/login", async (req, res) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user) return res.status(400).json({ msg: "This email does not exist." })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })
            await User.updateOne({ email }, { status: "active" }, { returnOriginal: false })
            const token = createAccessToken({ id: user._id })

            const refresh_token = createRefreshToken({ id: user._id })
            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })

            res.json({
                msg: "Login successful!",
                userID: user._id,
                access_token: token
            })
        }
        catch (err) {
            res.status(500).send(err);
        }
    });

    app.post("/logout/:id", async (req, res) => {
        try {
            // const { email, password, status } = req.body;
            await User.updateOne({ _id: req.params.id }, { status: "inactive" }, { returnOriginal: false })
            res.clearCookie('refreshtoken', { path: '/user/refresh_token' })
            return res.json({ msg: "Logged out." })
        }
        catch (err) {
            res.status(500).send(err);
        }
    });
};

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

function createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
};

function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
};

module.exports = routes;