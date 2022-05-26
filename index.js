const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oxkyd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('leptop_tools').collection('services');
        const userCollection = client.db('leptop_tools').collection('users');

        app.get('/service', async(req, res)=> {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        });

        app.get('/singleProduct', async(req, res) => {
            const id = req.query.id
            const query = {_id: ObjectId(id)};
            console.log(id)
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.put('/user/:email', async (req, res) => {
          const email = req.params.email;
          const user = req.body;
          const filter = {email: email};
          const options = {upsert: true};
          const updateDoc = {
            $set: user,
          }

          const result = await userCollection.updateOne(filter, updateDoc, options);
          res.send(result);
        })

    }
    finally{

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello leptop tools')
})

app.listen(port, () => {
  console.log(`Leptop app listening on port ${port}`)
})