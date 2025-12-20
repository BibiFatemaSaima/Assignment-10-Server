const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://bibifatemasaima_db_user:3zrNelqKAJGhvCkD@book-haven.xdmsye5.mongodb.net/?appName=Book-Haven";

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
    await client.connect();

    const db = client.db("bookService");
    const books = db.collection("books");
    app.post("/books", async (req, res) => {
      const data = req.body;
      const result = await books.insertOne(data);
      res.send(result);
    });

    app.get("/books", async (req, res) => {
      const result = await books.find().toArray();
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await books.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });
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
  res.send("book haven running");
});

app.listen(port, () => {
  console.log(`book server is running on port:${port}`);
});
