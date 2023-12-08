//Librerias y conexiones
const enviarCorreo = require("./enviarCorreo.js");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const port = 4040;
const querystring = require("querystring");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var db;
const uri = process.env.URI_MONGODB;
const secretKey = process.env.JWT_KEY;

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

/*** VALIDACION TOKEN */
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]; // Obtén el token de los encabezados de la solicitud

  if (!token) {
    return res
      .status(401)
      .json({ error: "Acceso no autorizado, token no proporcionado." });
  }

  jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Acceso prohibido, token inválido." });
    }
    // Verificar si el token pertenece al usuario
    if (decoded !== req.query.idUsuario) {
      // Reemplaza req.params.idUsuario con tu método para obtener el ID del usuario actual
      return res.status(401).json({
        error: "Acceso no autorizado, el token no corresponde al usuario.",
      });
    }
    req.user = decoded; // Decodifica el token y almacena la información del usuario en la solicitud
    next(); // Continúa con la ejecución de la siguiente función/middleware
  });
}

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
  let articulosCollection = await db.collection("articulos");

  //Construcción de la query
  let query = { id_pedido: idPedido };
  console.log("API detallePedido");
  console.log("Query:" + JSON.stringify(req.query));
  //Ejecución
  let result = await collection.findOne(query);

  if (!result) {
    return res.status(404).json({ mensaje: "No se encontró ese pedido" });
  }
  const listaArticulos = await Promise.all(
    result.lista_articulos.map(async (item) => {
      const detalleArticulo = await articulosCollection.findOne({
        id_articulo: item.id_articulo,
      });
      return {
        id_articulo: detalleArticulo.id_articulo,
        nombre_articulo: detalleArticulo.nombre_articulo,
        marca_articulo: detalleArticulo.marca_articulo,
        modelo_articulo: detalleArticulo.modelo_articulo,
        precio_articulo: item.precio_articulo,
        color_articulo: detalleArticulo.color_articulo,
        almacenamiento_articulo: detalleArticulo.almacenamiento_articulo,
        foto_articulo: detalleArticulo.foto_articulo,
        articulo_promocion: detalleArticulo.articulo_promocion,
        cantidad_articulo: item.cantidad_articulo,
        precio_total_articulo:
          parseFloat(item.precio_articulo) * parseInt(item.cantidad_articulo),
      };
    })
  );

  result.lista_articulos = await Promise.all(listaArticulos);

  res.json(result);

  // Devolución de resultados
});

app.get("/listaCarrito", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var idUsuario = req.query.idUsuario;
  console.log("API listaCarrito");
  console.log("Query:" + JSON.stringify(req.query));

  //Conexión a la colección
  let carritoCollection = await db.collection("carrito_compra");
  let articulosCollection = await db.collection("articulos");

  //Construcción de la query
  let query = { id_usuario: idUsuario, estado: "Activo" };

  //Ejecución
  let carrito = await carritoCollection.findOne(query);
  if (!carrito) {
    return res
      .status(404)
      .json({ mensaje: "No se encontró un carrito activo para ese usuario." });
  }
  const listaArticulos = await Promise.all(
    carrito.lista_articulos.map(async (item) => {
      const detalleArticulo = await articulosCollection.findOne({
        id_articulo: item.id_articulo,
      });
      return {
        id_articulo: detalleArticulo.id_articulo,
        nombre_articulo: detalleArticulo.nombre_articulo,
        marca_articulo: detalleArticulo.marca_articulo,
        modelo_articulo: detalleArticulo.modelo_articulo,
        precio_articulo: item.precio_articulo,
        color_articulo: detalleArticulo.color_articulo,
        almacenamiento_articulo: detalleArticulo.almacenamiento_articulo,
        foto_articulo: detalleArticulo.foto_articulo,
        articulo_promocion: detalleArticulo.articulo_promocion,
        cantidad_articulo: item.cantidad_articulo,
        precio_total_articulo:
          parseFloat(item.precio_articulo) * parseInt(item.cantidad_articulo),
      };
    })
  );

  carrito.lista_articulos = await Promise.all(listaArticulos);
  let totalArticulos = 0;
  carrito.lista_articulos.forEach((articulo) => {
    totalArticulos += parseInt(articulo.cantidad_articulo);
  });
  carrito.numero_articulos = totalArticulos;

  res.json(carrito);

  // Devolución de resultados
});

app.get("/contarListaArticulos", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  let query = new Object();

  var marcaArticulo = req.query.marcaArticulo;
  var modeloArticulo = req.query.modeloArticulo;
  var almacenamientoArticulo = req.query.almacenamientoArticulo;
  var colorArticulo = req.query.colorArticulo;
  var precioMinimo = parseFloat(req.query.precioMinimo);
  var precioMaximo = parseFloat(req.query.precioMaximo);
  var articuloPromocion = req.query.articuloPromocion;

  if (req.query.articuloPromocion !== undefined) {
    query.articuloPromocion = articuloPromocion;
  }

  if (req.query.marcaArticulo !== undefined) {
    if (Array.isArray(marcaArticulo))
      query.marca_articulo = { $in: marcaArticulo };
    else query.marca_articulo = marcaArticulo;
  }

  if (req.query.modeloArticulo !== undefined) {
    if (Array.isArray(modeloArticulo))
      query.modelo_articulo = { $in: modeloArticulo };
    else query.modelo_articulo = modeloArticulo;
  }

  if (req.query.almacenamientoArticulo !== undefined) {
    if (Array.isArray(almacenamientoArticulo))
      query.almacenamiento_articulo = { $in: almacenamientoArticulo };
    else query.almacenamiento_articulo = almacenamientoArticulo;
  }

  if (req.query.colorArticulo !== undefined) {
    if (Array.isArray(colorArticulo))
      query.color_articulo = { $in: colorArticulo };
    else query.color_articulo = colorArticulo;
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
  let result = await collection.countDocuments(query);
  console.log("API contarListaArticulos");
  console.log("Query: " + JSON.stringify(req.query));
  console.log("Result: " + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("0");
  else res.status(200).send(JSON.stringify(result));
});

app.get("/listaArticulos", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  let query = new Object();
  let sortQuery = new Object();
  var marcaArticulo = req.query.marcaArticulo;
  var modeloArticulo = req.query.modeloArticulo;
  var almacenamientoArticulo = req.query.almacenamientoArticulo;
  var colorArticulo = req.query.colorArticulo;
  var precioMinimo = parseFloat(req.query.precioMinimo);
  var precioMaximo = parseFloat(req.query.precioMaximo);
  var sortPrecio = req.query.sortPrecio;

  if (req.query.sortPrecio !== undefined) {
    if (req.query.sortPrecio != "0") sortQuery.precio_articulo = sortPrecio;
  }

  if (req.query.marcaArticulo !== undefined) {
    //query.marca_articulo = marcaArticulo;
    if (Array.isArray(marcaArticulo))
      query.marca_articulo = { $in: marcaArticulo };
    else query.marca_articulo = marcaArticulo;
  }

  if (req.query.modeloArticulo !== undefined) {
    //query.modelo_articulo = modeloArticulo;
    if (Array.isArray(modeloArticulo))
      query.modelo_articulo = { $in: modeloArticulo };
    else query.modelo_articulo = modeloArticulo;
  }

  if (req.query.almacenamientoArticulo !== undefined) {
    //almacenamientoArticulo = almacenamientoArticulo.split(",");
    if (Array.isArray(almacenamientoArticulo))
      query.almacenamiento_articulo = { $in: almacenamientoArticulo };
    else query.almacenamiento_articulo = almacenamientoArticulo;
  }

  if (req.query.colorArticulo !== undefined) {
    //query.color_articulo = colorArticulo;
    if (Array.isArray(colorArticulo))
      query.color_articulo = { $in: colorArticulo };
    else query.color_articulo = colorArticulo;
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
  let projection = {
    nombre_articulo: 1,
    id_articulo: 1,
    articulo_promocion: 1,
    precio_articulo_anterior: 1,
    precio_articulo: 1,
    foto_articulo: 1,
    stock: 1,
  };

  //Ejecución
  let result = await collection
    .find(query)
    .sort(sortQuery)
    .project(projection)
    .toArray();
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
          admin: false,
        };

        let result = await collection.insertOne(usuario);
        console.log(
          `A document was inserted with the _id: ${result.insertedId}`
        );
        enviarCorreo.enviarRegistro(nombreUsuario, emailUsuario);
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
  // Recogida variables introducidas en la llamada al API
  let fieldName = req.query.atributo;

  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Ejecución
  let result = await collection
    .aggregate([
      { $group: { _id: `$${fieldName}` } },
      { $project: { _id: 0, valorUnico: "$_id" } },
      { $sort: { valorUnico: 1 } },
    ])
    .toArray();

  const valores = result.map((objeto) => objeto.valorUnico);

  console.log("API filtradoOpciones");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result) res.status(404).send("Not found");
  else res.status(200).send(valores);
});

app.get("/articulosRelacionados", async (req, res) => {
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
      { $limit: 3 },
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
  let result = await collection.find(query).toArray();
  console.log("API listaPedidos");
  console.log("Query:" + JSON.stringify(req.query));
  console.log("Result" + JSON.stringify(result));
  // Devolución de resultados
  if (!result || result.length == 0) res.status(404).send("Not found");
  else res.status(200).send(result);
});

app.post("/visitaArticulo", async (req, res) => {
  console.log("API visitaArticulo");
  console.log("Query:" + JSON.stringify(req.query));

  let collection = await db.collection("articulos_visitados");

  var idUsuario = req.query.idUsuario;
  var idArticulo = req.query.idArticulo;

  const existingVisit = await collection.findOne({
    id_usuario: idUsuario,
    id_articulo: idArticulo,
  });
  if (existingVisit) {
    await collection.updateOne(
      { id_usuario: idUsuario, id_articulo: idArticulo },
      { $set: { timestamp_visita: new Date() } }
    );
    res.json({ mensaje: "Registro de visita actualizado." });
  } else {
    var visita = {
      id_usuario: idUsuario,
      id_articulo: idArticulo,
      timestamp_visita: new Date(),
    };

    let result = await collection.insertOne(visita);
    res.json({ mensaje: "Nuevo registro de visita creado." });
  }
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
  } else {
    const token = jwt.sign(idUsuario, secretKey);
    result.token = token;
    res.status(200).send(result);
  }
});

app.put("/modificacionDatosUsuario", verifyToken, async (req, res) => {
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

//TODO - ESTE API es a eliminar
app.post("/nuevoArticulo", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var nombreArticulo = req.query.nombreArticulo;
  var marcaArticulo = req.query.marcaArticulo;
  var modeloArticulo = req.query.modeloArticulo;
  var precioArticulo = parseInt(req.query.precioArticulo);
  var colorArticulo = req.query.colorArticulo;
  var almacenamientoArticulo = req.query.almacenamientoArticulo;
  var fotoArticulo = req.query.fotoArticulo;
  var idArticulo = req.query.idArticulo;
  var articuloPromocion = req.query.articuloPromocion;
  var descripcionArticulo = req.query.descripcionArticulo;
  var precioArticuloAnterior = parseInt(req.query.precioArticuloAnterior);
  var stockArticulo = parseInt(req.query.stockArticulo);

  /*// Patrón de expresión regular para encontrar todas las secuencias de escape
  const escapePattern = /\\%/g;

  // Reemplazar todas las secuencias de escape con un solo '%'
  const cleanedEncodedHTML = descripcionArticulo.replace(escapePattern, "%");
  descripcionArticulo = decodeURIComponent(descripcionArticulo);*/

  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Construcción de la query

  let query = { id_articulo: idArticulo };
  let result2 = await collection.findOne(query);
  if (result2) {
    //El artículo existe, actualizamos el artículo
    let document = {
      $set: {
        nombre_articulo: nombreArticulo,
        marca_articulo: marcaArticulo,
        modelo_articulo: modeloArticulo,
        precio_articulo: precioArticulo,
        color_articulo: colorArticulo,
        almacenamiento_articulo: almacenamientoArticulo,
        foto_articulo: fotoArticulo,
        id_articulo: idArticulo,
        articulo_promocion: articuloPromocion,
        descripcion_articulo: descripcionArticulo,
        precio_articulo_anterior: precioArticuloAnterior,
        stock: stockArticulo,
      },
    };
    let result = await collection.updateOne(query, document);
    if (!result) res.status(404).send("Error al actualizar");
    else res.status(200).send(result);
  } else {
    //El artículo no existe, insertamos uno nuevo
    let document = {
      nombre_articulo: nombreArticulo,
      marca_articulo: marcaArticulo,
      modelo_articulo: modeloArticulo,
      precio_articulo: precioArticulo,
      color_articulo: colorArticulo,
      almacenamiento_articulo: almacenamientoArticulo,
      foto_articulo: fotoArticulo,
      id_articulo: idArticulo,
      articulo_promocion: articuloPromocion,
      descripcion_articulo: descripcionArticulo,
      precio_articulo_anterior: precioArticuloAnterior,
      stock: stockArticulo,
    };
    let result = await collection.insertOne(document);
    if (!result) res.status(404).send("Error al insertar");
    else res.status(200).send(result);
  }
});

app.post("/adminArticulo", async (req, res) => {
  // Recogida variables introducidas en la llamada al API
  var nombreArticulo = req.body.nombre_articulo;
  var marcaArticulo = req.body.marca_articulo;
  var modeloArticulo = req.body.modelo_articulo;
  var precioArticulo = parseInt(req.body.precio_articulo);
  var colorArticulo = req.body.color_articulo;
  var almacenamientoArticulo = req.body.almacenamiento_articulo;
  var fotoArticulo = req.body.foto_articulo;
  var idArticulo = req.body.id_articulo;
  var articuloPromocion = req.body.articulo_promocion;
  var descripcionArticulo = req.body.descripcion_articulo;
  var precioArticuloAnterior = parseInt(req.body.precio_articulo_anterior);
  var stockArticulo = parseInt(req.body.stock);

  //Conexión a la colección
  let collection = await db.collection("articulos");

  //Construcción de la query

  let query = { id_articulo: idArticulo };
  let result2 = await collection.findOne(query);
  if (result2) {
    //El artículo existe, actualizamos el artículo
    let document = {
      $set: {
        nombre_articulo: nombreArticulo,
        marca_articulo: marcaArticulo,
        modelo_articulo: modeloArticulo,
        precio_articulo: precioArticulo,
        color_articulo: colorArticulo,
        almacenamiento_articulo: almacenamientoArticulo,
        foto_articulo: fotoArticulo,
        id_articulo: idArticulo,
        articulo_promocion: articuloPromocion,
        descripcion_articulo: descripcionArticulo,
        precio_articulo_anterior: precioArticuloAnterior,
        stock: stockArticulo,
      },
    };
    let result = await collection.updateOne(query, document);
    if (!result) res.status(404).send("Error al actualizar");
    else res.status(200).send(result);
  } else {
    //El artículo no existe, insertamos uno nuevo
    let document = {
      nombre_articulo: nombreArticulo,
      marca_articulo: marcaArticulo,
      modelo_articulo: modeloArticulo,
      precio_articulo: precioArticulo,
      color_articulo: colorArticulo,
      almacenamiento_articulo: almacenamientoArticulo,
      foto_articulo: fotoArticulo,
      id_articulo: idArticulo,
      articulo_promocion: articuloPromocion,
      descripcion_articulo: descripcionArticulo,
      precio_articulo_anterior: precioArticuloAnterior,
      stock: stockArticulo,
    };
    let result = await collection.insertOne(document);
    if (!result) res.status(404).send("Error al insertar");
    else res.status(200).send(result);
  }
});

app.put("/anadirArticuloCarrito", async (req, res) => {
  let collection = await db.collection("carrito_compra");

  var idUsuario = req.query.idUsuario;
  var idArticulo = req.query.idArticulo;
  var cantidadArticulo = req.query.cantidadArticulo; //+1 o el -1
  var precioArticulo = req.query.precioArticulo;
  try {
    let query = { id_usuario: idUsuario, estado: "Activo" };
    //comprobar si existe carrito creado o no. Si no existe, crearlo
    let resultCarritoExistente = await collection.findOne(query);
    if (!resultCarritoExistente) {
      if (cantidadArticulo == "1") {
        let documentoNuevoCarrito = {
          id_usuario: idUsuario,
          lista_articulos: [
            {
              id_articulo: idArticulo,
              cantidad_articulo: 1,
              precio_articulo: precioArticulo,
            },
          ],
          precio_total: parseFloat(precioArticulo),
          estado: "Activo",
        };
        let resultNuevoCarrito = await collection.insertOne(
          documentoNuevoCarrito
        );
      }
    } else {
      const indiceArticulo = resultCarritoExistente.lista_articulos.findIndex(
        (item) => item.id_articulo === idArticulo
      );

      if (indiceArticulo !== -1) {
        // Si el artículo ya está en el carrito, se actualiza la cantidad
        if (cantidadArticulo == "-1") {
          // Si la operación es 'quitar', se disminuye la cantidad y el precio total
          if (
            resultCarritoExistente.lista_articulos[indiceArticulo]
              .cantidad_articulo > 1
          ) {
            resultCarritoExistente.lista_articulos[indiceArticulo]
              .cantidad_articulo--;
            resultCarritoExistente.precio_total -= parseFloat(precioArticulo);
          } else {
            // Si la cantidad es 1, se elimina el artículo del carrito
            resultCarritoExistente.lista_articulos.splice(indiceArticulo, 1);
            resultCarritoExistente.precio_total -= parseFloat(precioArticulo);
          }
        } else {
          // Si no se especifica una operación o es 'agregar', se aumenta la cantidad y el precio total
          resultCarritoExistente.lista_articulos[indiceArticulo]
            .cantidad_articulo++;
          resultCarritoExistente.precio_total += parseFloat(precioArticulo);
        }
      } else {
        // Si el artículo no está en el carrito, se añade
        resultCarritoExistente.lista_articulos.push({
          id_articulo: idArticulo,
          cantidad_articulo: 1,
          precio_articulo: precioArticulo,
        });
        resultCarritoExistente.precio_total += parseFloat(precioArticulo);
      }

      // Se actualiza el carrito en la base de datos
      await collection.updateOne(
        { id_usuario: idUsuario, estado: "Activo" },
        { $set: resultCarritoExistente }
      );
    }

    res.status(200).send("Carrito actualizado correctamente");
  } catch (error) {
    res.status(404).send("Error en la insercion del articulo");
  }
  console.log("API anadirArticuloCarrito");
});

app.post("/realizarPedido", verifyToken, async (req, res) => {
  //Recuperar parametros de entrada
  var id_usuario = req.query.idUsuario;
  //Ver lo que hay en el carrito
  let carritoCollection = await db.collection("carrito_compra");
  let pedidoCollection = await db.collection("pedidos");
  let articulosCollection = await db.collection("articulos");
  let hayStock = true;

  const carrito = await carritoCollection.findOne({
    id_usuario: id_usuario,
    estado: "Activo",
  });

  if (carrito) {
    for (const item of carrito.lista_articulos) {
      const articuloId = item.id_articulo;
      const cantidadComprada = item.cantidad_articulo;

      const articulo = await articulosCollection.findOne({
        id_articulo: articuloId,
      });
      if (articulo) {
        const updatedStock = articulo.stock - cantidadComprada;
        if (updatedStock <= 0) {
          hayStock = false;
        }
      }
    }
    if (hayStock) {
      for (const item of carrito.lista_articulos) {
        const articuloId = item.id_articulo;
        const cantidadComprada = item.cantidad_articulo;

        const articulo = await articulosCollection.findOne({
          id_articulo: articuloId,
        });
        if (articulo) {
          const updatedStock = articulo.stock - cantidadComprada;
          if (updatedStock <= 0) {
            hayStock = false;
          } else {
            await articulosCollection.updateOne(
              { id_articulo: articuloId },
              { $set: { stock: updatedStock } }
            );
          }
        }
      }

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
      enviarCorreo.enviarPedido(idPedido, id_usuario, nuevoPedido);
      res.json({ mensaje: "Pedido creado exitosamente.", id_pedido: idPedido });
    } else {
      //No hay stock
      res.status(404).json({
        error: "Falta stock de algún producto.",
      });
    }
  } else {
    res.status(404).json({
      error: "No se encontró el carrito para el usuario proporcionado.",
    });
  }

  console.log("API realizarPedido");
  console.log("Query:" + JSON.stringify(req.query));
});
/****** FIN DEFINICION DE APIS ******/

//Levantar el servidor
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
