const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    title: String,
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    }
});

// mongoose.Schema({
//     username: String,
//     password: String,
// })

module.exports = mongoose.model('Posts',PostSchema);