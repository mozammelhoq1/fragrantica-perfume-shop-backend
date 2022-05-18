const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middle ware
app.use(cors());
app.use(express.json());
// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "unauthorized access" });
//   }
//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).send({ message: "Forbidden access" });
//     }
//     console.log("decoded", decoded);
//     req.decoded = decoded;
//     next();
//   });
// }

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
    const reviewsCollection = client.db("fragrantica").collection("reviews");
    // const orderCollection = client.db("geniusCar").collection("order");

    // authentication
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "3d",
      });
      res.send({ accessToken });
    });

    // load all service from mongodb
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    // verifyJWT
    app.get("/myitem", async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });
    // Post a single product with email
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    // my items
    // app.get("/products", async (req, res) => {
    //   const email = req.params;
    //   console.log(email);
    //   const query = {};
    //   const cursor = productCollection.find(query);
    //   const result = await cursor.toArray();
    //   console.log(query);
    //   res.send(result);
    // });
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
    // load all reviews from mongodb
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    // Post a reviews product with email
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
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
