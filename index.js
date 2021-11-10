const express = require('express')
const app = express()

const cors = require('cors');
require('dotenv').config();

const { MongoClient } = require('mongodb');

const port = process.env.PORT || 8000

//middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.adlv3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

//Main Function start

async function run() {
    try{
        await client.connect();
        console.log('connected to DB')

        const database = client.db("WatchWorld");
        const productsCollection = database.collection("products");

        //Get Products
        app.get('/products', async (req, res) =>{
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });
        //POST Products
        app.post('/products', async (req, res) =>{
            const products = req.body;
            const result = await productsCollection.insertOne(products);
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

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})