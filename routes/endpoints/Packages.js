const Package = require('../../models/packages');
const { auth } = require("../middlewares/loggedIn");
const User = require("../../models/user");

let routes = (app) => {
    app.post('/package', async (req, res) => {
        try {
            let { product_id } = req.body;
            if (product_id.length < 2) {
                return res.status(400).send("Add Two or More Products")
            }
            let package = new Package(req.body);
            await package.save()
            res.json(package)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.post('/package/user', async (req, res) => {
        try {
            const { total } = req.body;
            // const user = await User.findOne({ _id: user_id });
            // if (!user) return res.status(400).json({ msg: "you must to login" })
            let package = new Package(req.body);
            package.status = "pending";
            package.balance = Number(total).toLocaleString();
            await package.save()
            res.json(package)
        }
        catch (err) {
            res.status(500).send(err.message)
        }
    });

    // get all packages
    app.get('/packages', async (req, res) => {
        try {
            let packages = await Package.find().sort({ createdAt: -1 })
                .populate("product_id.item")
                .populate("category")
                .populate("user_id", "firstname lastname role")
            res.json(packages)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    app.get('/package/:id', async (req, res) => {
        try {
            let packages = await Package.find({ _id: req.params.id })
                .populate("product_id", "itemName price")
                .populate("user_id", "firstname lastname role")
            res.json(packages)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/package/user/:id', async (req, res) => {
        try {
            let arr = [];
            let duration;
            let packages = await Package.find({ user_id: req.params.id })
                .populate("product_id.item", "itemName price")
            packages.map((e, i) => {
                duration = e.duration
                e.product_id.map((a, b) => {
                    arr.push(+a.item.price.split(",").join(""))
                    return arr.reduce((a, b) => a + b, 0)
                })
            })
            let total = arr.reduce((a, b) => a + b, 0);
            let balance = packages.balance.split(",").join("")
            let daily = balance / (duration * 31);
            let weekly = balance / (duration * 4);
            let monthly = balance / (duration);
            let numPayment;
            if (packages.numberOfExpectedPayments === 0 && packages.payment_frequency.toLowerCase() === "daily") {
                numPayment = duration * 31
            } else if (packages.numberOfExpectedPayments === 0 && packages.payment_frequency.toLowerCase() === "weekly") {
                numPayment = duration * 4
            } else if (packages.numberOfExpectedPayments === 0 && packages.payment_frequency.toLowerCase() === "monthly") {
                numPayment = duration
            } else {
                numPayment = packages.numberOfExpectedPayments
            }
            await Package.updateOne({ user_id: req.params.id }, {
                total: total.toLocaleString(),
                daily: Math.ceil(daily).toLocaleString(),
                weekly: Math.ceil(weekly).toLocaleString(),
                monthly: Math.ceil(monthly).toLocaleString(),
                numberOfExpectedPayments: numPayment
            },
                { returnOriginal: false })
            let packagess = await Package.find({ user_id: req.params.id, status: "pending" })
                .populate("product_id.item", "itemName price")
            res.json(packagess)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.put('/package/user/:id', async (req, res) => {
        try {
            let update = req.body;
            let package = await Package.updateOne({ _id: req.params.id }, update, { returnOriginal: false });
            return res.json(package)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    app.put('/cart/user/:id', async (req, res) => {
        try {
            // let { status } = req.body;
            let package = await Package.updateOne({ _id: req.params.id }, { status: "cart" }, { returnOriginal: false });
            return res.json(package)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    app.get('/cart/user/:id', async (req, res) => {
        try {
            let arr = [];
            let duration;
            let packages = await Package.find({ user_id: req.params.id })
                .populate("product_id.item", "itemName price")
            packages.map((e, i) => {
                duration = e.duration
                e.product_id.map((a, b) => {
                    arr.push(+a.item.price.split(",").join(""))
                    return arr.reduce((a, b) => a + b, 0)
                })
            })
            let total = arr.reduce((a, b) => a + b, 0);
            let daily = total / (duration * 31)
            let weekly = total / (duration * 4)
            let monthly = total / (duration)
            await Package.updateOne({ user_id: req.params.id }, {
                total: total.toLocaleString(),
                daily: Math.ceil(daily).toLocaleString(),
                weekly: Math.ceil(weekly).toLocaleString(),
                monthly: Math.ceil(monthly).toLocaleString(),
            },
                { returnOriginal: false })
            let packagess = await Package.find({ user_id: req.params.id, status: "cart" })
                .populate("product_id.item", "itemName price")
            res.json(packagess)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/package/:id', async (req, res) => {
        try {
            await Package.deleteOne({ _id: req.params.id })
            res.json({ msg: "Package Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;