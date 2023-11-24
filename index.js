//Librerias y conexiones
const express = require("express");
const app = express();
const port = 4040;
const querystring = require("querystring");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

  console.log("API detalleArticulo");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
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
  console.log("API consultaUsuario");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
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
  console.log("API detallePedido");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

app.get("/listaCarrito", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;

  //Conexión a la colección
  let collection = await db.collection("carrito_compra");

  //Construcción de la query
  let query = { id_usuario: idUsuario, estado: "Activo" };

  //Ejecución
  let result = await collection.findOne(query);
  console.log("API listaCarrito");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
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

  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Ejecución
  let result = await collection.find(query).toArray();
  console.log("API listaArticulos");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

app.post("/registroUsuario", async (req, res) => {
  let collection = await db.collection("usuarios");

  var contrasenaUsuario = req.query.contrasenaUsuario;
  var emailUsuario = req.query.emailUsuario;
  var nombreUsuario = req.query.nombreUsuario;
  console.log("API registroUsuario");
  console.log("Query:" + JSON.stringify(req.query));

  //Validar presencia de todas las variables de entrada

  if (
    req.query.contrasenaUsuario === undefined ||
    req.query.emailUsuario === undefined ||
    req.query.nombreUsuario === undefined
  ) {
    res.status(404).send("Faltan parametros de entrada");
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
          .status(404)
          .send("Longitud minima de la contraseña debe ser de 8 caracteres");
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
          res.status(404).send("Error en la insercion en el alta de usuario");
        else res.status(200).send(result);
      }
    } else {
      res.status(404).send("Usuario ya existe");
    }
  }
});

app.get("/filtradoOpciones", async (req, res) => {
  //TODO: Recuperar detalle articulos
  // Recogida variables introducidas en la llamada al API
  let fieldName = req.query.atributo;

  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Ejecución
  let result = await collection
    .aggregate([
      { $group: { _id: `$${fieldName}` } },
      { $project: { _id: 0, valorUnico: "$_id" } },
    ])
    .toArray();

  console.log("API filtradoOpciones");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

app.get("/articulosRelacionados", async (req, res) => {
  //TODO: Recuperar detalle articulos
  // Recogida variables introducidas en la llamada al API
  var idArticulo = req.query.idArticulo;

  //Conexión a la colección
  let collection = await db.collection("articulos_relacionados");

  //Ejecución
  const result = await collection
    .aggregate([
      { $match: { id_articulo1: idArticulo } },
      {
        $lookup: {
          from: "articulos",
          localField: "id_articulo2",
          foreignField: "id_articulo",
          as: "detalle_articulo",
        },
      },
      { $limit: 5 },
    ])
    .toArray();
  console.log("API articulosRelacionados");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
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
  const result = await collection
    .aggregate([
      { $match: { id_usuario: idUsuario } },
      {
        $lookup: {
          from: "articulos",
          localField: "id_articulo",
          foreignField: "id_articulo",
          as: "detalle_articulo",
        },
      },
      { $sort: { timestamp_visita: -1 } },
      { $limit: 5 },
    ])
    .toArray();

  console.log("API articulosVisitados");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
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
  console.log("API listaPedidos");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
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
  console.log("API visitaArticulo");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  if (!result) res.status(404).send("Error en la insercion de la visita");
  else res.status(200).send(result);
});

app.get("/articulosPromocion", async (req, res) => {
  // Recogida variables introducidas en la llamada al API

  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Construcción de la query
  let query = { articulo_promocion: "yes" };

  //Ejecución
  let result = await collection.find(query).toArray();
  console.log("API articulosPromocion");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

app.get("/inicioSesion", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;
  var contrasenaUsuario = req.query.contrasenaUsuario;

  //Conexión a la colección
  let collection = await db.collection("usuarios");

  //Construcción de la query
  let query = { id_usuario: idUsuario, contraseña_usuario: contrasenaUsuario };

  //Ejecución
  let result = await collection.findOne(query);
  console.log("API iniciSesion");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) {
    res.status(404).send("Usuario y/ contraseña no válido");
  } else res.status(200).send(result);
});

app.put("/modificacionDatosUsuario", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;
  var contrasenaUsuario = req.query.contrasenaUsuario;
  var nombreUsuario = req.query.nombreUsuario;

  //Conexión a la colección
  let collection = await db.collection("usuarios");

  //Construcción de la query
  let query = { id_usuario: idUsuario };
  let document = {
    $set: {
      contraseña_usuario: contrasenaUsuario,
      nombre_usuario: nombreUsuario,
    },
  };

  //Ejecución
  let result = await collection.updateOne(query, document);
  console.log("API modificacionDatosUsuario");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(result);
});

app.put("/anadirArticuloCarrito", async (req, res) => {
  let collection = await db.collection("carrito_compra");

  var idUsuario = req.query.idUsuario;
  var idArticulo = req.query.idArticulo;
  var cantidadArticulo = req.query.cantidadArticulo;
  var nombreArticulo = req.query.nombreArticulo;
  var precioArticulo = req.query.precioArticulo;

  let query = { id_usuario: idUsuario, estado: "Activo" };
  //comprobar si existe carrito creado o no. Si no existe, crearlo
  let resultCarritoExistente = await collection.findOne(query);
  if (!resultCarritoExistente) {
    let documentoNuevoCarrito = {
      id_usuario: idUsuario,
      lista_articulos: [],
      precio_total: 0,
      estado: "Activo",
    };
    let resultNuevoCarrito = await collection.insertOne(documentoNuevoCarrito);
  }

  let document = {
    $push: {
      lista_articulos: {
        id_articulo: idArticulo,
        cantidad_articulo: cantidadArticulo,
        nombre_articulo: nombreArticulo,
        precio_articulo: precioArticulo,
      },
    },
  };

  let result = await collection.updateOne(query, document);

  let resultTotalCarrito = await collection.findOne(query);

  let precioTotal = parseFloat(resultTotalCarrito.precio_total);

  precioTotal =
    precioTotal + parseFloat(cantidadArticulo) * parseFloat(precioArticulo);
  console.log(precioTotal);

  let documentNuevoTotal = { $set: { precio_total: precioTotal } };
  let resultNuevoTotal = await collection.updateOne(query, documentNuevoTotal);
  console.log("API anadirArticuloCarrito");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  if (!result) res.status(404).send("Error en la insercion del articulo");
  else res.status(200).send(result);
});

app.post("/realizarPedido", async (req, res) => {
  //Recuperar parametros de entrada
  var id_usuario = req.query.idUsuario;
  //Ver lo que hay en el carrito
  let carritoCollection = await db.collection("carrito_compra");
  let pedidoCollection = await db.collection("pedidos");
  // Obtener el último número de pedido existente
  const ultimoPedido = await pedidoCollection
    .find()
    .sort({ _id: -1 })
    .limit(1)
    .toArray();
  const ultimoNumeroPedido =
    ultimoPedido.length > 0
      ? parseInt(ultimoPedido[0].id_pedido.split("-")[1])
      : 0;
  const nuevoNumeroPedido = ultimoNumeroPedido + 1;
  const idPedido = `MM-${nuevoNumeroPedido}`;
  const carrito = await carritoCollection.findOne({
    id_usuario: id_usuario,
    estado: "Activo",
  });

  if (carrito) {
    const { lista_articulos, precio_total } = carrito;

    // Crear un nuevo documento de pedido
    const fechaPedido = new Date();
    const nuevoPedido = {
      id_pedido: idPedido,
      id_usuario,
      lista_articulos,
      precio_pedido: precio_total,
      fecha_pedido: fechaPedido,
    };

    // Insertar el nuevo pedido en la colección de pedidos
    await pedidoCollection.insertOne(nuevoPedido);

    // Actualizar el estado del carrito a "Inactivo"
    await carritoCollection.updateOne(
      { id_usuario: id_usuario, estado: "Activo" },
      { $set: { estado: "Inactivo" } }
    );

    res.json({ mensaje: "Pedido creado exitosamente.", id_pedido: idPedido });
  } else {
    res.status(404).json({
      error: "No se encontró el carrito para el usuario proporcionado.",
    });
  }
  // Vaciar carrito
  console.log("API realizarPedido");
  console.log("Query:" + JSON.stringify(req.query));
  //console.log("Result" + JSON.stringify(result));
  //if (!result) res.status(404).send("Error en la insercion del articulo");
  //else res.status(200).send(result);
});
/****** FIN DEFINICION DE APIS ******/

//Levantar el servidor
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
