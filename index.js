const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// use middle ware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Art Summer Camp is running')
});

app.listen(port, () => {
    console.log(`Art Summer Camp is running on port: ${port}`);
})