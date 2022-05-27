const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { query } = require('express');
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
        const bookCollection = client.db('leptop_tools').collection('books');

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
  
         app.post('/book', async(req, res)=> {
           const book = req.body;
           const result=  await bookCollection.insertOne(book) 
           res.send(result);
           
         })

        app.get('/user', async(req, res) => {
          const users = await userCollection.find().toArray();
          res.send(users);
        })

        app.put('/user/admin/:email', async (req, res) => {
          const email = req.params.email;
          const filter = {email: email};
          const updateDoc = {
            $set: {role: 'admin'},
          };

          const result = await userCollection.updateOne(filter, updateDoc);
          res.send(result);
      
        })

      

        app.get('/book/:email', async(req,res)=> {
          const email = req.params.email;
          const query = {email: email};
          const result = await bookCollection.find(query).toArray();
          res.send(result);
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
          const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1hr'})
          res.send({result, token});
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