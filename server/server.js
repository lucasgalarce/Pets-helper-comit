const port = 9000;

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expHbs = require('express-handlebars');

const app = express();

const auth = require('./auth.js')
const animals = require('./animals.js')

// Middleware archivos estaticos
app.use(express.static(path.join(__dirname, "public")));

// Body Parser para Content-Type "application/x-www-form-urlencoded"
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------------------------------------
// Configuración de Handlebars

app.set("view engine", "handlebars");

app.engine("handlebars", expHbs({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts")
}));

app.set("views", path.join(__dirname, "views"));
// ----------------------------------------------------------

// Rutas
// Pagina de login
app.get("/", (req, res) => {
  res.render("index", { layout: "landing" });
});

// Pagina de registro
app.get("/signup", (req, res) => {
  res.render("signup", { layout: "landing" })
})

// Pagina principal
app.get("/home", (req, res) => {
  animals.getAll(list => {
    res.render("home", { animals: list })
  })
});

// Perfil de animal
app.get("/animal/:id", (req, res) => {
  animals.getById(req.params.id, animalItem => {
    res.render("profile", { animal: animalItem });
  })
})

app.post("/login", (req, res) => {

  auth.login(req.body.username, req.body.password, result => {

    if (result.valid) {
      animals.getAll(list => {
        res.render("home", { animals: list });
      })
    } else {
      res.render("index", { layout: "landing", message: result.msg });
    }
  })
});

app.post("/register", (req, res) => {

  // 1. Validar datos de registro
  auth.getUser(req.body.username, result => {

    // Si no se pudo consultar a la DB renderizo signup con mensaje de error
    if (!result.success) {
      res.render("signup", {
        layout: "landing",
        message: {
          class: "failure",
          text: "Disculpe, intente nuevamente."
        }
      });
      return;
    }

    // Si el usuario ya existe renderizo signup con mensaje de error
    if (result.username) {
      res.render("signup", {
        layout: "landing",
        message: {
          class: "failure",
          text: "Disculpe, usuario en uso."
        }
      });
      return;
    }

    // Si el password está mal ingresado renderizo signup con mensaje de error
    if (!req.body.password || req.body.password !== req.body.confirmPassword) {
      res.render("signup", {
        layout: "landing",
        message: {
          class: "failure",
          text: "Las contraseñas deben coincidir"
        }
      });
      return;
    }

    // Procesamos alta de usuarix
    auth.registerUser(req.body.username, req.body.password, result => {

      if (result) {

        // Si se pudo registrar renderizo index con mensaje de éxito
        res.render("index", {
          layout: "landing", message: {
            class: "success",
            text: "Usuario registrado exitosamente, ingrese por favor."
          }
        });

      } else {

        // Si no se pudo registrar renderizo signup con mensaje de error
        res.render("signup", {
          layout: "landing",
          message: {
            class: "failure",
            text: "Disculpe, no se pudo registrar, intente nuevamente."
          }
        });

      }
    });

  });
});


app.listen(port, (req, res) => {
  console.log(`Escuchando el puerto  http://localhost:${port}`)
});