const express = require("express");
const app = express();
const port = 4041;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://asolermaria:cloa1997@cluster0.bmbqxd3.mongodb.net/?retryWrites=true&w=majority";

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.get("/detalleArticulo/:id_articulo", (req, res) => {
  // Select a la bd, a la tabla de articulos where id_articulo

  //enviarla de vuelta con el contenido de la salida en formato json
  res.send("Hello World tonto! {_id}");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
