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


function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'UnAuthorized access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
    if(err){
      return res.status(403).send({message: 'Forbidden access'})
    }
    req.decoded = decoded;
    next();
  })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oxkyd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('leptop_tools').collection('services');
        const userCollection = client.db('leptop_tools').collection('users');
        const bookCollection = client.db('leptop_tools').collection('books');
        const reviewCollection = client.db('leptop_tools').collection('reviews');
         
        // get service
        app.get('/service', async(req, res)=> {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        });
         // all booking
        app.get('/allbooking', async(req, res)=> {
          const query = {};
          const cursor = bookCollection.find(query);
          const booking = await cursor.toArray();
          res.send(booking)
      });
 
          // single product
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
           
         });

        //  post review
        app.post('/review',  async(req, res)=> {
          const review = req.body;
          const result=  await reviewCollection.insertOne(review) 
          res.send(result);
          
        });
        // img
        app.post('/upload', verifyJWT,  async(req, res)=> {
          const service = req.body;
          const result=  await serviceCollection.insertOne(service) 
          res.send(result);
          
        })

          // add email
        app.get('/review/:email', async(req,res)=> {
          const email = req.params.email;
          const query = {email: email};
          const result = await reviewCollection.find(query).toArray();
          res.send(result);
        });

        // get review
        app.get('/reviews', async(req, res) => {
          const users = await reviewCollection.find().toArray();
          res.send(users);
        })

      //  admin
      app.put('/user/admin/:email', verifyJWT, async (req, res) => {
        const email = req.params.email;
        const requester = req.decoded?.email;
        const requesterAccount = await userCollection.findOne({email: requester});
        if(requesterAccount.role === 'admin'){
          const filter = { email: email };
          const updateDoc = {
            $set: {role: 'admin'},
           
          };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.send(result);
        }
        else{
          res.status(403).send({message: 'forbidden'});
        }
     
      });

      // admin
      app.get('/admin/:email', async(req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({email: email});
        const isAdmin = user.role === 'admin';
        res.send({admin: isAdmin});
      })

      // get user
      app.get('/profile/:email', async(req, res)=>{
        const email = req.params.email;
        const query = { email: email};
        const result = await userCollection.findOne(query);
        res.send(result);
      });

      // update user profile
      app.put('/updateprofile/:email', async (req, res) => {
        const email = req.params.email;
        const newProfile = req.body;
        const filter = { email: email };
        const updateProfile = {
            $set: newProfile,
        }
        const result = await userCollection.updateOne(filter, updateProfile);
        res.send(result);

    })


        // get user 
        app.get('/user', async(req, res) => {
          const users = await userCollection.find().toArray();
          res.send(users);
        })


        // user email
        app.put('/user/admin/:email', verifyJWT,  async (req, res) => {
          const email = req.params.email;
          const filter = {email: email};
          const updateDoc = {
            $set: {role: 'admin'},
          };

          const result = await userCollection.updateOne(filter, updateDoc);
          res.send(result);
      
        })

        // admin
        app.delete('/userDelete/:email', verifyJWT, async(req, res)=>{
          const email = req.params.email;
          const query = {email: email};
          const result = await userCollection.deleteOne(query);
          res.send(result);
        })

        // delete product
        app.delete('/productDelete/:id', verifyJWT, async(req, res)=>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await userCollection.deleteOne(query);
          res.send(result);
        });
        // manage delete
        app.delete('/manageDelete/:id', verifyJWT, async(req, res)=>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await bookCollection.deleteOne(query);
          res.send(result);
        });

        // book email
        app.get('/book/:email', async(req,res)=> {
          const email = req.params.email;
          const query = {email: email};
          const result = await bookCollection.find(query).toArray();
          res.send(result);
        });


        
        // delete booking
        app.delete('/deleteBooking/:id', async(req, res)=>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await bookCollection.deleteOne(query);
          res.send(result);
        })


        app.put('/user/:email', async (req, res) => {
          const email = req.params.email;
          const user = req.body;
          const filter = {email: email};
          const options = {upsert: true};
          const updateDoc = {
            $set: user,
          }

          const result = await userCollection.updateOne(filter, updateDoc, options);
          const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
          res.send({result, accessToken: token});
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