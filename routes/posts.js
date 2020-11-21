const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', (req,res) => {
    res.send('were post');
});


router.post('/', (req,res) =>{
    const post = new Post({
        title: req.body.title,
        fname: req.body.fname,
        lname: req.body.lname
    });

    post.save()
        .then(data => {
            res.json(data); //res.status(200).json(data);
        })
        .catch(err => {
            res.json({ message: err })
        });
});


module.exports = router;
