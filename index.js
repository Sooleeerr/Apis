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

/****** INICIO DEFINICION APIS *******/

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

app.get("/consultaUsuario", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;

  //Conexión a la colección
  let collection = await db.collection("usuarios");

  //Construcción de la query
  let query = { id_usuario: idUsuario };

  //Ejecución
  let result = await collection.findOne(query);

  //TODO: Salida: nombre_usuario, correo_usuario, contraseña_usuario.

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

app.get("/detallePedido", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idPedido = req.query.idPedido;

  //Conexión a la colección
  let collection = await db.collection("pedidos");

  //Construcción de la query
  let query = { id_pedido: idPedido };

  //Ejecución
  let result = await collection.findOne(query);

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

app.get("/listaCarrito", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;

  //Conexión a la colección
  let collection = await db.collection("carrito_compra");

  //Construcción de la query
  let query = { id_usuario: idUsuario };

  //Ejecución
  let result = await collection.findOne(query);

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

/*Descripción: Este API devolverá la lista de artículos de la tienda que cumplan los criterios que se faciliten en la entrada.
- Entrada: Categoria, , modelo, , , precio mínimo, precio máximo. Estos datos de entrada serán opcionales y excepto precio mínimo y precio máximo, el resto permitirá introducir varios valores para cada campo.
- Salida: id_articulo, foto_articulo, nombre_articulo y precio_articulo.*/
app.get("/listaArticulos", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  let query = new Object();

  var marcaArticulo = req.query.marcaArticulo;
  var modeloArticulo = req.query.modeloArticuloArticulo;
  var almacenamientoArticulo = req.query.almacenamientoArticulo;
  var colorArticulo = req.query.colorArticulo;
  var precioMinimo = parseFloat(req.query.precioMinimo);

  if (req.query.marcaArticulo !== undefined) {
    query.marca_articulo = marcaArticulo;
  }

  if (req.query.modeloArticuloArticul !== undefined) {
    query.modelo_articulo = modeloArticulo;
  }

  if (req.query.almacenamientoArticulo !== undefined) {
    //http://localhost:4040/listaArticulos?almacenamientoArticulo=128gb,256gb
    almacenamientoArticulo = almacenamientoArticulo.split(",");
    query.almacenamiento_articulo = { $in: almacenamientoArticulo };
  }

  if (req.query.colorArticulo !== undefined) {
    query.color_articulo = colorArticulo;
  }

  if (req.query.precioMinimo !== undefined) {
    query.precio_articulo = { $gte: precioMinimo };
  }

  //TODO quitar el log
  console.log(query);
  //Conexión a la colección
  let collection = await db.collection("articulos");

  //TODO precioMaximo

  //Ejecución
  let result = await collection.find(query).toArray();

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

/****** FIN DEFINICION DE APIS ****/

//Levantar el servidor
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
