const Category = require('../../models/category');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const upload = multer({ dest: 'uploads/' })
const { tokenCallback } = require('../../functions/token');

const { verifyToken } = tokenCallback()


const { uploadFile, getFileStream } = require('../../functions/S3')

async   function ImageUpload(file) {
        const result = await uploadFile(file)
        return result.Location
      }


let routes = (app) => {

    app.post('/category',upload.single('image'), async (req, res) => {

        const file = req.file
        const responses = verifyToken({ authToken: req.header('authorization') })
        
        const imageLink = await ImageUpload(file)
   if(imageLink){ 
        try {
            let category = new Category({...req.body, image:imageLink, createdBy:responses.data.id});
            await category.save()
            res.json(category)
        }
        catch (err) {
            res.status(500).send(err)
        }}
    });

    app.get('/category', async (req, res) => {
        const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit) || 15;
		const search = req.query.search || "";
       
        try {
            let category = await Category.find().sort({ createdAt: -1 }).limit(limit).skip(page).populate("createdBy", "firstname lastname role")
            res.json(category)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/category/:id', async (req, res) => {
        try {
            await Category.deleteOne({ _id: req.params.id })
            res.json({ msg: "Category Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;