const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@book-haven.xdmsye5.mongodb.net/?appName=Book-Haven`;

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

    //  NEW: Orders Collection
    const ordersCollection = db.collection("orders");


    //  ADD BOOK
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

    //  GET SINGLE BOOK
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

    //  MY BOOKS
    app.get("/my-books", async (req, res) => {
      const { email } = req.query;
      const query = { userEmail: email };
      const result = await booksCollection.find(query).toArray();
      res.send(result);
    });

    //  DELETE BOOK
    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;

      const result = await booksCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    //  UPDATE BOOK
    app.put("/update/:id", async (req, res) => {
      const data = req.body;
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const updateService = {
        $set: data,
      };

      try {
        const result = await booksCollection.updateOne(
          query,
          updateService
        );

        res.send(result);
      } catch (error) {
        res.status(400).send({ message: "Update failed" });
      }
    });


    //  CREATE ORDER
    app.post("/orders", async (req, res) => {
      const order = req.body;
console.log(order);

      //  important fields
      order.createdAt = new Date();
      order.status = "pending";

      try {
        const result = await ordersCollection.insertOne(order);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to create order" });
      }
    });

    //  GET ORDERS (optional filter by email)
    app.get("/orders", async (req, res) => {
      const { email } = req.query;

      const query = email ? { email: email } : {};

      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });

    //  DELETE ORDER (Cancel order)
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;

      const result = await ordersCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    //  UPDATE ORDER STATUS
    app.patch("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;

      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: status } }
      );

      res.send(result);
    });

    console.log("MongoDB connected successfully");
  } finally {
    // keep empty
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