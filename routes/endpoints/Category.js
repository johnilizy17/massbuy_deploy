const Category = require('../../models/category');
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

    app.post('/category',upload.single('image'), async (req, res) => {

        const file = req.file
    
        const imageLink = await ImageUpload(file)
   if(imageLink){ 
        try {
            let category = new Category({...req.body, image:imageLink});
            await category.save()
            res.json(category)
        }
        catch (err) {
            res.status(500).send(err)
        }}
    });

    app.get('/category', async (req, res) => {
        try {
            let category = await Category.find()
                .populate("createdBy", "firstname lastname role")
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