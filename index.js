const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const res = require("express/lib/response");

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qpuyy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// async await methode
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("fragrantica").collection("products");
    // const orderCollection = client.db("geniusCar").collection("order");

    // load all service from mongodb
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    // Post a single product with email
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    // update a product quantity
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          quantity: req.body.updateQuantity,
        },
      };
      console.log("update quantity  : ", updatedDoc);
      const result = await productCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // Delete single product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
    // load single product data from mongodb
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
  } finally {
    // client.close()
  }
}
run().catch(console.dir);

// root api
app.get("/", (req, res) => {
  res.send("hello Fragrantica ! running your server");
});
app.listen(port, () => {
  console.log("listening to Fragrantica port : ", port);
});
