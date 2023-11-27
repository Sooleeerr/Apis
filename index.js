//Librerias y conexiones
const enviarCorreo = require("./enviarCorreo.js");
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

  console.log("API realizarPedido");
  console.log("Query:" + JSON.stringify(req.query));
});
/****** FIN DEFINICION DE APIS ******/

//Levantar el servidor
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
