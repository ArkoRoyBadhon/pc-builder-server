require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.et115mk.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.et115mk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});



const run = async () => {
  try {
    const db = client.db("pc-builder");
    const productCollection = db.collection("products");

    function capitalizeWord(word) {
      return word.toUpperCase();
    }

    app.get("/randomproducts", async (req, res) => {
      const cursor = productCollection.find({});
      const product = await cursor.toArray();

      // res.send({ status: true, data: product });
      const numberOfElementsToSelect = 6;
      const result = [];
      const arrLength = product.length;

      while (result.length < numberOfElementsToSelect) {
        const randomIndex = Math.floor(Math.random() * arrLength);
        if (!result.includes(product[randomIndex])) {
          result.push(product[randomIndex]);
        }
      }

      res.send(result);
    });

    app.get("/allproducts", async (req, res) => {
      const { category } = req.query;
    
      if (category && category.length > 0) {
        const modified = category.split("-").map(capitalizeWord).join(" ");
        try {
          const cursor = await productCollection.find({ category: modified });
          const product = await cursor.toArray();
    
          res.send(product);
        } catch (error) {
          res.status(500).json({ error: "Error fetching products." });
        }
      } else {
        try {
          const cursor = await productCollection.find({});
          const product = await cursor.toArray();
    
          res.send(product);
        } catch (error) {
          console.error("Error fetching products:", error);
          res.status(500).json({ error: "Error fetching products." });
        }
      }
    });

    
    

    app.post("/product", async (req, res) => {
      const product = req.body;

      const result = await productCollection.insertOne(product);

      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;

      const result = await productCollection.findOne({ _id: ObjectId(id) });
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
