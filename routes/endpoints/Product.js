const Product = require('../../models/product');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const upload = multer({ dest: 'uploads/' })


const { uploadFile, getFileStream } = require('../../functions/S3')

async   function ImageUpload(file) {
        const result = await uploadFile(file)
        return result.Location
      }


let routes = (app) => {

    //   get image by server
    //   app.get('/images/:key', (req, res) => {
    //     console.log(req.params)
    //     const key = req.params.key
    //     const readStream = getFileStream(key)
      
    //     readStream.pipe(res)
    //   })

    app.post('/product', upload.single('image'), async (req, res) => {
    
        const file = req.file
    
       const imageLink = await ImageUpload(file)
       if(imageLink){
        try {
            let product = new Product({...req.body, image:imageLink});
            await product.save()
            res.json(product)
        }
        catch (err) {
            console.log(err)
            res.status(500).send(err)
        }}else {
            res.status(305).send("image filed to upload")
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