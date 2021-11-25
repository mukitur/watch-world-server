const express = require('express')
const app = express()

const cors = require('cors');
require('dotenv').config();

const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 8000

//middleware add
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.adlv3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//Main Function start
async function run() {
    try{
        await client.connect();
        console.log('connected to DB')

        const database = client.db("WatchWorld");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const reviewsCollection = database.collection("reviews");
        const usersCollection = database.collection("users");

        
        //Get Products
        app.get('/products', async (req, res) =>{
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });
        
       //Get single product details
        app.get('/shopping/:id', async(req, res)=>{
            const id= req.params.id;
           const query = {_id:ObjectId(id)};
           const sproduct = await productsCollection.findOne(query);
            res.json(sproduct);
        }); 
        
        //Home page product shows
        app.get('/products/home', async (req, res) =>{
            const cursor = productsCollection.find({}).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });
        //Get Orders
        app.get('/orders', async (req, res) =>{
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });
        //Get Rewiews
        app.get('/reviews', async (req, res) =>{
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        //check user is admin or not
        app.get('/users/:email', async(req, res) =>{
            const email = req.params.email;
            const query = {email: email}
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin= true;
            }
            res.json({admin: isAdmin});
        });

        //POST Products
        app.post('/products', async (req, res) =>{
            const products = req.body;
            const result = await productsCollection.insertOne(products);
           // console.log(result);
            res.send(result)
        });
        //POST Orders
        app.post('/orders', async (req, res) =>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            //console.log(result);
            res.send(result)
        });
        //POST Reviews
        app.post('/reviews', async (req, res) =>{
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result)
        });
        // DELETE Orders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });
        // DELETE Products
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

        //PUT method for google registered user
        app.put('/users', async (req, res) =>{
            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter,updateDoc, options);
            res.json(result);
        });
        //PUT method for Make Admin
        app.put('/users/admin', async (req, res) =>{
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter,updateDoc);
            res.json(result);
        });

        //POST Registered Users for email/password
        app.post('/users', async (req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.send(result)
        });

    }finally {
        //await client.close();
  }

} run().catch(console.dir);    

app.get('/', (req, res) => {
  res.send('Watch world server is running!')
})
app.get ('/hello', (req, res) =>{
    res.send('hrkoku server running');
}) 
app.listen(port, () => {
  console.log(`Listening at ${port}`)
})