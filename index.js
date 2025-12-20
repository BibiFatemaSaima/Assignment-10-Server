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

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("bookService");
    const booksCollection = db.collection("books");

    // ADD BOOK
    app.post("/books", async (req, res) => {
      const book = req.body;
      const result = await booksCollection.insertOne(book);
      res.send(result);
    });

    //  GET ALL BOOKS
    app.get("/books", async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
    });

    // GET SINGLE BOOK (IMPORTANT)
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const result = await booksCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!result) {
          return res.status(404).send({ message: "Book not found" });
        }

        res.send(result);
      } catch (error) {
        res.status(400).send({ message: "Invalid book id" });
      }
    });

    //  DELETE BOOK
    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;

      const result = await booksCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    console.log("MongoDB connected successfully");
  } finally {
  }
}

run().catch(console.dir);

// test route
app.get("/", (req, res) => {
  res.send("Book Haven Server Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
