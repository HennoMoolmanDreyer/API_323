const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', (req,res) => {
    res.send('were post');
});


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
