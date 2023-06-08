const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
// json files for toys
const instructorJSON = require('./instructor.json');
const reviewsJSON = require('./review.json');

// use middle ware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Art Summer Camp is running')
});

// instructorJSON json file section
app.get('/instructors', (req, res) => {
    res.send(instructorJSON)
});

// reviewsJSON file section
app.get('/reviews', (req, res) => {
    res.send(reviewsJSON)
});

app.listen(port, () => {
    console.log(`Art Summer Camp is running on port: ${port}`);
})