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
app.get("/", (req, res) => {
    res.render("index");
});

app.post("/login", (req, res) => {

  auth.login(req.body.username, req.body.password, result => {

    if(result.valid){
      animals.getAll(list => {
        res.render("home", { animals: list});
      })
    } else {
      //algo
    }
  })

});

app.post("/register", (req, res) => {
  //1.validar datos de registro

})

app.get("/animal/:id", (req, res) => {
  animals.getById(req.params.id, animalItem => {
    res.render("profile", { animal: animalItem});
  })
})



app.listen(port, (req,res) => {
    console.log(`Escuchando el puerto ${port}`)
});