const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongoDB code

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttjbmkn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const addJobCollection = client.db("dreamJobs").collection("addJobs");
    const bidProjectCollection = client.db("dreamJobs").collection("bidProjects");

    
    // bidProject related Api

    app.get("/bidprojects", async (req, res) => {

      let query = {}
      if(req.query?.email){
        query = {userEmail: req.query.email}
      }
      console.log(query);
      const result = await bidProjectCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/bidprojects', async(req, res) => {
      const bidProject = req.body
      const result = await bidProjectCollection.insertOne(bidProject)
      res.send(result)
    })
    

    // add jobs related api
    app.get("/addjobs", async (req, res) => {
      const result = await addJobCollection.find().toArray();
      res.send(result);
    });

    app.get("/addjobs/:category", async (req, res) => {
      const category = req.params.category;
      let regex = new RegExp(["^", category, "$"].join(""), "i");
      const filter = { category: regex };
      const result = await addJobCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/:category/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await addJobCollection.find(filter).toArray()
      res.send(result)
    });

    app.get("/:email", async(req, res) => {
      const email = req.params.email
      console.log(email);
      const filter = {email: email}
      const result = await addJobCollection.find(filter).toArray()
      res.send(result)
    })

   
    

   

    app.post("/addjobs", async (req, res) => {
      const job = req.body;
      const result = await addJobCollection.insertOne(job);
      res.send(result);
    });

    app.put('/addjobs/:id', async(req, res) => {
      const updateJob = req.body
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const option = {upsert: true}
      const job = {
        $set: {
          email: updateJob.email, 
          jobTitle: updateJob.jobTitle,
          deadline: updateJob.deadline, 
          description: updateJob.description, 
          minimumPrice: updateJob.minimumPrice, 
          maximumPrice: updateJob.maximumPrice
        }
      }
      const result = await addJobCollection.updateOne(filter, job, option)
      res.send(result)
    })

    app.delete('/addjobs/:id', async(req, res) => {
      const id = req.params.id
      const filter= {_id: new ObjectId(id)}
      const result = await addJobCollection.deleteOne(filter)
      res.send(result)
    })

   

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Dream job server is running");
});

app.listen(port, () => {
  console.log(`server is running at port : ${port}`);
});
