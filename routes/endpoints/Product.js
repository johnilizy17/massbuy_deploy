const Product = require('../../models/product');
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

// const { auth, isLoggedIn } = require('../middlewares/loggedIn');

// cloudinary configuration
cloudinary.config({
    cloud_name: "dfv4cufzp",
    api_key: 861174487596545,
    api_secret: "6n_1lICquMhRN4YgAMzQlhuG6tY"
});

async function uploadToCloudinary(locaFilePath) {
    // locaFilePath :
    // path of image which was just uploaded to "uploads" folder

    var mainFolderName = "massbuy"
    // filePathOnCloudinary :
    // path of image we want when it is uploded to cloudinary
    var filePathOnCloudinary = mainFolderName + "/" + locaFilePath;
    return cloudinary.uploader.upload(locaFilePath)
        .then((result) => {
            // Image has been successfully uploaded on cloudinary
            // So we dont need local image file anymore
            // Remove file from local uploads folder 
            fs.unlinkSync(locaFilePath)
            return {
                message: "Success",
                url: result.url
            };
        }).catch((error) => {
            // Remove file from local uploads folder 
            fs.unlinkSync(locaFilePath)
            return { message: "Fail", };
        });
};

let routes = (app) => {
    // app.post('/product', async (req, res) => {
    //     upload(req, res, async (err) => {

    //         if (err) {
    //             console.log(err)
    //             return res.json({ msg: "File Missing " })
    //         } else if (req.file === undefined) {
    //             return res.status(500).json({ msg: "File Missing " })
    //         } else {
    //             if (req.file) {
    //                 var locaFilePath = req.file.path
    //                 var result = await uploadToCloudinary(locaFilePath);
    //                 req.body.image = [result.url][0];
    //                 try {
    //                     const { itemName, price, image, details, spec, feature,
    //                         user_id, category_id } = req.body;
    //                     if (!user_id)
    //                         return res.status(500).json({ msg: "Please Login In" })
    //                     if (!itemName || !price)
    //                         return res.status(500).json({ msg: "Please fill in Product Name and Price at least!" })
    //                     if (!image)
    //                         return res.status(500).json({ msg: "Please Upload Product Image" })
    //                     const newProduct = {
    //                         itemName, price: Number(price).toLocaleString(), image, details, spec, feature,
    //                         user_id, category_id
    //                     };
    //                     let newProduct_ = new Product(newProduct);
    //                     await newProduct_.save()
    //                     return res.status(200).json({ msg: "Product Successfully Created" })
    //                     // return res.status(200).json(newProduct_)

    //                 }
    //                 catch (err) {
    //                     console.log('there')
    //                     return res.status(500).send(err);
    //                 }
    //             }
    //         }
    //     });
    // });

    app.post('/product', async (req, res) => {
        try {
            let product = new Product(req.body);
            await product.save()
            res.json(product)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // get product according to categories
    app.get('/products-by-category', async (req, res) => {
        try {
            let products = await Product.find({ status: "active", category_id: req.query.category }).sort({ createdAt: -1 })
                .populate("user_id", "firstname lastname role")
                .populate("category_id", "title")
            res.json(products)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // get all products
    app.get('/products', async (req, res) => {
        try {
            let products = await Product.find({ status: "active" }).sort({ createdAt: -1 })
                .populate("user_id", "firstname lastname role")
                .populate("category_id", "title")
            res.json(products)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });

    // search for all product
    app.get('/products/search', async (req, res) => {

        const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 5;
		const search = req.query.search || "";
		let sort = req.query.sort || "rating";
		let genre = req.query.genre || "All";
        
        try {
            let products = await Product.find(({ itemName: { $regex: search, $options: "i" } }))
 
            res.json(products)
        }
        catch (err) {
            res.status(400).send(err)
        }
    });
    // get latest 8 products
    app.get('/product-8', async (req, res) => {
        try {
            let products = await Product.find().sort({ createdAt: -1 }).limit(8)
                .populate("user_id", "firstname lastname role")
                .populate("category_id", "title")
            res.json(products)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/product/:id', async (req, res) => {
        try {
            let products = await Product.findOne({ _id: req.params.id })
                .populate("user_id", "firstname lastname")
            res.json(products)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.put('/product/:id', async (req, res) => {
        try {
            let update = req.body;
            let product = await Product.updateOne({ _id: req.params.id }, update, { returnOriginal: false })
                .populate("user_id", "firstname lastname")
            return res.json(product)
        }
        catch (err) {
            res.status(500).send(err)
            throw err
        }
    });

    app.delete('/product/:id', async (req, res) => {
        try {
            await Product.deleteOne()
            res.json({ msg: "Product Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;