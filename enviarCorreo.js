const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

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

module.exports = { enviarRegistro };
