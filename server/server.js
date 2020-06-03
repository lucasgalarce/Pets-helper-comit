const port = 9000;

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expHbs = require('express-handlebars');

const app = express();

// Middleware archivos estaticos
app.use(express.static(path.join(__dirname, "public")));

// ----------------------------------------------------------
// Configuración de Handlebars

app.set("view engine", "handlebars");

app.engine("handlebars", expHbs({
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views/layouts")
}));

app.set("views", path.join(__dirname, "views"));
// ----------------------------------------------------------

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
});




app.listen(port, (req,res) => {
    console.log(`Escuchando el puerto ${port}`)
});