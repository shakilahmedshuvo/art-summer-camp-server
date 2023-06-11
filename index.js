const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
// json files for toys
const instructorJSON = require('./instructor.json');
const reviewsJSON = require('./review.json');
const classesJSON = require('./PopularClasses.json');

// use middle ware
app.use(cors());
app.use(express.json())

// verifyJWT function
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({
            error: true,
            message: 'Unauthorized Access'
        });
    }
    // bearer token 
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                error: true, message: 'Unauthorized Access'
            });
        }
        req.decoded = decoded;
        next();
    })
};

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frhesy5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // make the db collection
        const usersCollection = client.db("artSummerCampDb").collection("users");
        const classCollection = client.db("artSummerCampDb").collection("classes");

        // jwt
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        });

        // verify admin api
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ error: true, message: 'Forbidden Access' });
            }
            next();
        };

        // user post api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        //  user get api
        app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // make admin api
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // is admin check api
        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            // check the admin email
            if (req.decoded.email !== email) {
                res.send({ admin: false })
            }

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' };
            res.send(result);
        });

        // Select The Class post api
        app.post('/selectClass', async (req, res) => {
            const classes = req.body;
            const result = await classCollection.insertOne(classes);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

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

// classesJSON file section
app.get('/classes', (req, res) => {
    res.send(classesJSON)
});

app.listen(port, () => {
    console.log(`Art Summer Camp is running on port: ${port}`);
})