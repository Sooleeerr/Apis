//Librerias y conexiones
const express = require("express");
const app = express();
const port = 4040;
const querystring = require("querystring");

const { MongoClient, ServerApiVersion } = require("mongodb");
var db;
const uri =
  "mongodb+srv://asolermaria:cloa1997@cluster0.bmbqxd3.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//Inicialización del cliente de la BD
async function run() {
  try {
    await client.connect();

    db = client.db("TFG");
    await db.command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

/*******DEFINICION APIS *********/
//Definición API detalleAritculo
app.get("/detalleArticulo", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idArticulo = req.query.idArticulo;

  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Construcción de la query
  let query = { id_articulo: idArticulo };

  //Ejecución
  let result = await collection.findOne(query);

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

/******* FIN DEFINICION DE APIS */
//Levantar el servidor
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
