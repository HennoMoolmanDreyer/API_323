const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

var correct=0;
console.log('now..')
while(!correct){
    router.get('/',upload.single('fileU'), (req,res) => {
        console.log(req.file);
        res.send('confirm data');
    });
    correct=1; 
}





router.post('/', async (req,res) =>{
    const post = new Post({
        title: req.body.title,
        fname: req.body.fname,
        lname: req.body.lname
    });
    try{
        const savedPost = await post.save();
        res.json(savedPost);
    } catch (err) {
        res.json({ message: err});
    }
    
});


module.exports = router;
