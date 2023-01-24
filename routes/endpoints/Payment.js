const Package = require('../../models/packages');
const Payment = require("../../models/payment");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getMilliseconds() + file.originalname);
    }
});
const fs = require('fs');

const upload = multer({ storage: storage }).single('image');
cloudinary.config({
    cloud_name: "dfv4cufzp",
    api_key: 861174487596545,
    api_secret: "6n_1lICquMhRN4YgAMzQlhuG6tY"
});

async function uploadToCloudinary(locaFilePath) {

    var mainFolderName = "massbuy"
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
    return cloudinary.uploader.upload(locaFilePath)
        .then((result) => {
            fs.unlinkSync(locaFilePath)
            return {
                message: "Success",
                url: result.url
            };
        }).catch((error) => {
            fs.unlinkSync(locaFilePath)
            return { message: "Fail", };
        });
};

let routes = (app) => {
    // upload file for payment made
    app.put('/payment/upload/:id', async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                console.log(err)
                res.json({ msg: "File Missing " })
            } else {
                if (req.file) {
                    var locaFilePath = req.file.path
                    var result = await uploadToCloudinary(locaFilePath);
                    req.body.image = [result.url][0];
                    try {
                        let payment = await Payment.updateOne({ _id: req.params.id }, { image: req.body.image }, { returnOriginal: false });
                        return res.json(payment)
                    }
                    catch (err) {
                        return res.status(500).send(err);
                    }
                }
            }
        });
    });

    // get all payments
    app.get('/payments', async (req, res) => {
        try {
            let payment = await Payment.find().sort({ createdAt: -1 })
                .populate("package_id", "package_title")
                .populate("user_id", "firstname lastname")
            res.json(payment)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get payments done for a package
    app.get('/payment/package/:id', async (req, res) => {
        try {
            let payments = await Payment.find({ package_id: req.params.id }).sort({ createdAt: -1 })
                .populate("package_id", "package_title")
                .populate("user_id", "firstname lastname")
            res.json(payments)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // get payments done by a user
    app.get('/payment/user/:id', async (req, res) => {
        try {
            let payments = await Payment.find({ user_id: req.params.id }).sort({ createdAt: -1 })
                .populate("package_id", "package_title")
                .populate("user_id", "firstname lastname")
            res.json(payments)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.put('/payment/:id', async (req, res) => {
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

    // aprrove payment done by cash
    app.put('/approve/payment/:id', async (req, res) => {
        try {
            let payment = await Payment.updateOne({ _id: req.params.id }, { status: "confirmed" }, { returnOriginal: false });
            let package = await Package.find({ _id: payment.package_id });
            let balance = Number(package.balance) - Number(package.paid);
            let oldAmount = Number(package.paid);
            let amount = Number(payment.amount)
            let updatedAmount = oldAmount + amount;
            await Package.updateOne({ _id: package.package_id }, {
                status: "order", balance: Number(balance).toLocaleString(),
                duration: duration - 1, paid: Number(updatedAmount.toLocaleString())
            }, { returnOriginal: false });
            return res.json(payment)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    // make a payment by card
    app.post('/payment/user/:id', async (req, res) => {
        try {
            let package = await Package.find({ _id: req.params.id })
            let oldAmount = Number(package.paid);
            let balance = Number(package.balance) - Number(package.paid);
            let { amount, user_id, package_id } = req.body;
            let updatedAmount = oldAmount + amount;
            let payment = new Payment({ amount: updatedAmount, user_id: user_id, package_id: package_id });
            await Package.updateOne({ _id: req.params.id }, { status: "order", duration: duration - 1, balance: Number(balance).toLocaleString(), paid: Number(updatedAmount.toLocaleString()) }, { returnOriginal: false });
            await payment.save()
            return res.json(payment)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    // make a payment by cash
    app.post('/payment/user/:id', async (req, res) => {
        try {
            let payment = new Payment(req.body);
            payment.status = "pending"
            await Package.updateOne({ _id: req.params.id }, { status: "paying" }, { returnOriginal: false });
            await payment.save()
            return res.json(payment)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    app.delete('/payment/:id', async (req, res) => {
        try {
            await Package.deleteOne()
            res.json({ msg: "Package Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;