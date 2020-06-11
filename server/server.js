const port = 9000;

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expHbs = require('express-handlebars');
const expSession = require('express-session')

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
  defaultLayout: "public",
  layoutsDir: path.join(__dirname, "views/layouts")
}));

app.set("views", path.join(__dirname, "views"));
// ----------------------------------------------------------

// Configuración del objeto de sesión
app.use(expSession({
  secret: "Este texto puede contener cualquier cosa",
  resave: false,
  saveUninitialized: false
}));

// Rutas
// Pagina de login
app.get("/", (req, res) => {
  res.render("index");
  console.log(req.session)
});

// Pagina de registro
app.get("/signup", (req, res) => {
  res.render("signup")
})

// Pagina principal
app.get("/home", (req, res) => {
  animals.getAll(list => {
    res.render("home", {
      layout: "logged",
      animals: list,
      username: req.session.loggedUser
    })
  })
});

// Perfil de animal
app.get("/animal/:id", (req, res) => {

  if (req.session.loggedUser) {

    animals.getById(req.params.id, animalItem => {
      res.render("profile", {
        layout: "logged",
        animal: animalItem,
        username: req.session.loggedUser
      });
    });

  } else {
    res.render("index", {
      message: {
        class: "failure",
        text: "Necesitas iniciar sesion primero"
      }
    });
  }
});

app.post("/login", (req, res) => {

  auth.login(req.body.username, req.body.password, result => {

    if (result.user) {

      // Guardar usuario logueado en sesion
      req.session.loggedUser = result.user;

      animals.getAll(list => {
        res.render("home", {
          layout: "logged",
          animals: list,
          username: req.session.loggedUser
        });
      })
    } else {
      res.render("index", {
        message: {
          class: "failure",
          text: "Usuario o contraseña invalidos"
        }
      });
    }
  })
});

app.get('/logout', (req, res) => {
  req.session.destroy();

  res.render("index", {
    message: {
      class: "success",
      text: "Cerro sesión correctamente, gracias"
    }
  });

})

app.post("/register", (req, res) => {

  // 1. Validar datos de registro
  auth.getUser(req.body.username, result => {

    // Si no se pudo consultar a la DB renderizo signup con mensaje de error
    if (!result.success) {
      res.render("signup", {
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
          message: {
            class: "success",
            text: "Usuario registrado exitosamente, ingrese por favor."
          }
        });

      } else {

        // Si no se pudo registrar renderizo signup con mensaje de error
        res.render("signup", {
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