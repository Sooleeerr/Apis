const sgMail = require("@sendgrid/mail");
const json2html = require("node-json2html");
require("dotenv").config();

let template_table_header = {
  "<>": "tr",
  html: [
    { "<>": "th", html: "Artículo" },
    { "<>": "th", html: "Cantidad" },
    { "<>": "th", html: "Precio por Unidad" },
  ],
};

let template_table_body = {
  "<>": "tr",
  html: [
    { "<>": "td", html: "${id_articulo}" },
    { "<>": "td", html: "${cantidad_articulo}" },
    { "<>": "td", html: "${precio_articulo}" },
  ],
};
sgMail.setApiKey(process.env.SG_APIKEY);

function enviarCorreo(to, subject, html) {
  msgCorreo = {
    to: `${to}`,
    from: "mundomoviltfg@gmail.com",
    subject: `${subject}`,
    html: `${html}`,
  };
  sgMail
    .send(msgCorreo)
    .then(() => {
      console.log(`Correo enviado a ${to}`);
    })
    .catch((error) => {
      console.error(error);
    });
}

function enviarRegistro(nombre, email) {
  let html = `<h1> Bienvenido a Mundo Móvil</h1> <p>Hola <strong>${nombre}</strong>. Gracias por registrarte en Mundo Móvil`;

  enviarCorreo(email, `${nombre}, bienvenido a Mundo Móvil`, html);
}

function enviarPedido(numPedido, email, jsonPedido) {
  let data = jsonPedido.lista_articulos;

  let table_header = json2html.transform(data[0], template_table_header);
  let table_body = json2html.transform(data, template_table_body);

  let header =
    "<!DOCTYPE html>" +
    '<html lang="en">\n' +
    "<head><title>Pedido</title></head>";
  let body =
    "<p>Gracias por confiar en Mundo Móvil</p> <p> Nos ponemos a trabajar para que disfrutes de tu pedido lo antes posible</p>" +
    `<h1>Pedido nº ${numPedido}</h1><br><table id="my_table">\n<thead>` +
    table_header +
    "\n</thead>\n<tbody>\n" +
    table_body +
    "\n</tbody>\n</table>";
  body =
    body + `<p> Importe total del pedido ${jsonPedido.precio_pedido} €</p>`;
  body = body + `<p> Fecha de pedido ${jsonPedido.fecha_pedido}</p>`;
  body = "<body>" + body + "</body>";

  let html = header + body + "</html>";
  enviarCorreo(email, `Te confirmamos tu pedido ${numPedido}`, html);
}

module.exports = { enviarRegistro, enviarPedido };
