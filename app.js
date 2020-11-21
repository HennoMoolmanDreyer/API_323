const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv/config')

//middlewares
app.use(bodyParser.json());

const postsRoute = require('./routes/posts');

app.use('/posts', postsRoute);
//authentification here




//routes
//post for login
app.get('/', (req,res) => {
    res.send('were home');
});



//connect to db
mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true },
    ()=> console.log('connected to db')
);

//start listen
app.listen(3000);