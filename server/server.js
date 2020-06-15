const port = 9000;

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expHbs = require('express-handlebars');
const expSession = require('express-session')
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();

const auth = require('./auth.js')
const animals = require('./animals.js')

// Middleware archivos estaticos
app.use(express.static(path.join(__dirname, "public")));

// Configuracion de multer
const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/img"),
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname).toLocaleLowerCase());
  }
});

app.use(multer({
  storage,
  dest: path.join(__dirname, "public/img"),
  limits: 20000000,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg/;
    const mimetype = filetypes.test(file.mimetype);
    const extName = filetypes.test(path.extname(file.originalname));

    if (mimetype && extName) {
      return cb(null, true);
    } else {
      cb("Error, el archivo debe ser jpg/jpge y pesar menos de 2mb.")
    }
  }
}).single('image'));


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

  if (req.session.loggedUser) {
    res.redirect("/home")
  } else {
    res.redirect("/login");
  }

});

app.get("/login", (req, res) => {
  res.render("index", {
    message: req.session.message
  });
})

// Pagina de registro
app.get("/signup", (req, res) => {
  res.render("signup", {
    message: req.session.message
  })
})

// Pagina principal
app.get("/home", (req, res) => {

  if (req.session.loggedUser) {

    animals.getAll(req.query.nameFilter, req.query.placeFilter, req.query.orderDate, req.query.page, (list, results) => {
      res.render("home", {
        layout: "logged",
        animals: list,
        username: req.session.loggedUser,
        results
      })

    })
  } else {
    res.render("index", {
      message: {
        class: "failure",
        text: "Usuario o contraseña invalidos"
      }
    });
  }

});

// Pagina de perfil usuario

app.get("/userProfile", (req, res) => {

  if (req.session.loggedUser) {

    res.render("userProfile", {
      message: req.session.message,
      layout: "logged",
      username: req.session.loggedUser
    });

  } else {
    res.redirect("/login");
  }

});

app.post("/changepass", (req, res) => {

  if (req.session.loggedUser) {
    // Si el password está mal ingresado renderizo signup con mensaje de error
    if (!req.body.password || req.body.password !== req.body.confirmPassword) {

      req.session.message = {
        class: "failure",
        text: "Las contraseñas deben coincidir"
      }
      res.redirect("/userProfile");

      return;
    }

    auth.changePassword(req.session.loggedUser, req.body.password, result => {
      if (result) {

        req.session.message = {
          class: "success",
          text: "Contraseña cambiada correctamente."
        }
        res.redirect("/login");

      } else {

        req.session.message = {
          class: "failure",
          text: "No pudimos cambiar la contraseña."
        }

        res.redirect("/userProfile");
      }

    });

  } else {
    res.redirect("login");
  }

});

// Agregar animal

app.get("/addAnimal", (req, res) => {

  if (req.session.loggedUser) {

    res.render("addAnimal", {
      layout: "logged",
      username: req.session.loggedUser
    });
  } else {
    res.redirect("/login");
  }

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

      res.redirect("/home");

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

app.post("/registerAnimal", (req, res) => {

  animals.registerAnimal(req.body.nameAnimal, req.body.owner, req.body.cel, req.body.place,
    req.body.info, req.body.mail, req.body.cp, req.file.filename, result => {

      // if (result){
      //   res.render("addAnimal", { 
      //     layout: "logged",
      // });
      // }
      if (result) {
        res.redirect("/home")
      }
    });
});


app.listen(port, (req, res) => {
  console.log(`Escuchando el puerto  http://localhost:${port}`)
});