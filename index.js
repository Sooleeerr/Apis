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

/****** INICIO DEFINICION APIS ******/

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

app.get("/listaArticulos", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  let query = new Object();

  var marcaArticulo = req.query.marcaArticulo;
  var modeloArticulo = req.query.modeloArticulo;
  var almacenamientoArticulo = req.query.almacenamientoArticulo;
  var colorArticulo = req.query.colorArticulo;
  var precioMinimo = parseFloat(req.query.precioMinimo);
  var precioMaximo = parseFloat(req.query.precioMaximo);

  if (req.query.marcaArticulo !== undefined) {
    query.marca_articulo = marcaArticulo;
  }

  if (req.query.modeloArticulo !== undefined) {
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
  let rangoPrecios = new Object();
  if (req.query.precioMinimo !== undefined) {
    rangoPrecios = { $gte: precioMinimo };
    query.precio_articulo = rangoPrecios;
  }

  if (req.query.precioMaximo !== undefined) {
    if (rangoPrecios !== undefined) {
      query.precio_articulo = { $gte: precioMinimo, $lte: precioMaximo };
    } else {
      query.precio_articulo = { $lte: precioMaximo };
    }
  }
  //TODO quitar el log
  console.log(query);
  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Ejecución
  let result = await collection.find(query).toArray();

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

app.post("/registroUsuario", async (req, res) => {
  let collection = await db.collection("usuarios");

  var contrasenaUsuario = req.query.contrasenaUsuario;
  var emailUsuario = req.query.emailUsuario;
  var nombreUsuario = req.query.nombreUsuario;

  //Validar presencia de todas las variables de entrada

  if (
    req.query.contrasenaUsuario === undefined ||
    req.query.emailUsuario === undefined ||
    req.query.nombreUsuario === undefined
  ) {
    res.send("Faltan parametros de entrada").status(404);
  } else {
    //Validar no existencia de otro idUsuario igual
    var idUsuario = emailUsuario;
    let collectionUsuario = await db.collection("usuarios");
    let query = { id_usuario: idUsuario };
    let result2 = await collectionUsuario.findOne(query);
    if (!result2) {
      //Validar caracteristicas contraseña
      if (contrasenaUsuario.length < 8) {
        res
          .send("Longitud minima de la contraseña debe ser de 8 caracteres")
          .status(404);
      } else {
        var usuario = {
          contraseña_usuario: contrasenaUsuario,
          email_usuario: emailUsuario,
          id_usuario: emailUsuario,
          nombre_usuario: nombreUsuario,
        };

        let result = await collection.insertOne(usuario);
        console.log(
          `A document was inserted with the _id: ${result.insertedId}`
        );
        if (!result)
          res.send("Error en la insercion en el alta de usuario").status(404);
        else res.send(result).status(200);
      }
    } else {
      res.send("Usuario ya existe").status(404);
    }
  }
});

app.get("/articulosRelacionados", async (req, res) => {
  //TODO: Recuperar detalle articulos
  // Recogida variables introducidas en la llamada al API
  var idArticulo = req.query.idArticulo;

  //Conexión a la colección
  let collection = await db.collection("articulos_relacionados");

  //Construcción de la query
  let query = { id_articulo1: idArticulo };

  //Ejecución
  let result = await collection.find(query).toArray();

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

app.get("/articulosVisitados", async (req, res) => {
  //TODO: Recuperar detalle articulos
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;

  //Conexión a la colección
  let collection = await db.collection("articulos_visitados");

  //Construcción de la query
  let query = { id_usuario: idUsuario };

  //Ejecución
  let result = await collection.find(query).toArray();

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

app.get("/listaPedidos", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;

  //Conexión a la colección
  let collection = await db.collection("pedidos");

  //Construcción de la query
  let query = { id_usuario: idUsuario };

  //Ejecución
  let result = await collection.findOne(query);

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

app.post("/visitaArticulo", async (req, res) => {
  let collection = await db.collection("articulos_visitados");

  var idUsuario = req.query.idUsuario;
  var idArticulo = req.query.idArticulo;

  var visita = {
    id_usuario: idUsuario,
    id_articulo: idArticulo,
  };

  let result = await collection.insertOne(visita);
  if (!result)
    res.send("Error en la insercion de la visita").status(404);
  else res.send(result).status(200);
});

app.get("/articulosPromocion", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  

  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Construcción de la query
  let query = { articulo_promocion: "yes" };

  //Ejecución
  let result = await collection.find(query).toArray();

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

app.get("/inicioSesion", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;
  var contrasenaUsuario = req.query.contrasenaUsuario;

  //Conexión a la colección
  let collection = await db.collection("usuarios");

  //Construcción de la query
  let query = { id_usuario: idUsuario, contraseña_usuario : contrasenaUsuario };

  //Ejecución
  let result = await collection.findOne(query);

  // Devolución de resultados
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});


/****** FIN DEFINICION DE APIS ******/

//Levantar el servidor
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
