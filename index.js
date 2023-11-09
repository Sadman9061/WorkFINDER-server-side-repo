const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config(); // import env file if use environment variables after install || npm install dotenv --save|| ane Create a .env file in the root of your project:
const port = process.env.PORT || 5000;
const app = express();
// used Middleware
app.use(cors(
  {
   origin:['http://localhost:5173'],
   credentials: true
}
));
app.use(express.json());
// fffffffff
// Connect With MongoDb Database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.urcdkb0.mongodb.net/?retryWrites=true&w=majority`;

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
    const allJobsCollection = client.db('assignment-11').collection('allJobs');
    const appliedJobsCollection = client.db('assignment-11').collection('appliedJobs');
    app.get('/allJobs', async (req, res) => {
      const cursor = allJobsCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    app.get('/myJobs', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email }
      }
      const result = await allJobsCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/appliedJobs', async (req, res) => {
      let query = {};
      // console.log(req.query?.email);
      if (req.query?.email) {
        console.log(req.query?.email);
        query = { email: req.query?.email }
      }
      const result = await appliedJobsCollection.find(query).toArray();
      res.send(result);
    })


    app.put('/myJobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateJob = req.body;
      const updatedJob = {
        $set: {
          jobBanner: updateJob.jobBanner,
          category: updateJob.category,
          description: updateJob.description,
          salaryRange: updateJob.salaryRange,

          applicationDeadline: updateJob.applicationDeadline,
          jobBanner: updateJob.jobBanner


        }
      }
      const result = await allJobsCollection.updateOne(query, updatedJob, options);
      res.send(result);
    })
    app.get('/myJobs/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await allJobsCollection.findOne(query);
      res.send(result);
    })


    app.post('/allJobs', async (req, res) => {
      const job = req.body;
      const result = await allJobsCollection.insertOne(job);
      res.send(result);
    })
    app.delete("/myJobs/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await allJobsCollection.deleteOne(query);
      console.log();
      res.send(result);
    });


    app.post('/appliedJobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allJobsCollection.findOne(query);
      if (result) {
        // Increment applicantsCount by 1
        const updatedApplicantsCount = result.applicantsCount + 1;
        const updateJob = { $set: { applicantsCount: updatedApplicantsCount } };
        const updateResult = await allJobsCollection.updateOne(query, updateJob);

        console.log(updateResult);
        if (updateResult.modifiedCount === 1) {
          // Application data
          const applicationData = {
            jobId: result._id,
            resumeLink: req.body.resumeLink,
            name: req.body.name,
            email: req.body.email,
            applicantsCount: req.body.applicantsCount + 1,
            applicationDeadline: req.body.applicationDeadline,
            category: req.body.category,
            description: req.body.description,
            employer: req.body.employer,
            jobBanner: req.body.jobBanner,
            jobTitle: req.body.jobTitle,
            postingDate: req.body.postingDate,
            salaryRange: req.body.salaryRange,



          };

          // Save application data in the appliedJobs collection
          const insertResult = await appliedJobsCollection.insertOne(applicationData);

          if (insertResult.insertedId) {
            res.status(200).json({ message: 'Application successful' });
          }
        }
      }
    });


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);

// Root Api to check activity
app.get("/", (req, res) => {
  res.send("Assignment-11 is running!!!");
});
app.listen(port, () => {
  console.log(` listening on port ${port}`);
});