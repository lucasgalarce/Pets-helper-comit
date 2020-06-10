const mongodb = require('mongodb');
const uri = "mongodb+srv://admin:admin@cluster0-opnyh.mongodb.net/Pets?retryWrites=true&w=majority";
const mongoConfig = { useUnifiedTopology: true, useNewUrlParser: true };

/**
 * 
 * @param {string} username Username
 * @param {string} password Password
 * @param {function} callbackResult Callback: function(result: { valid: boolean, msg: string })
 */

const login = (username, password, callbackResult) => {

  mongodb.MongoClient.connect(uri, mongoConfig,  (err, client) => {

    if (err) {
      //No me pude conectar al server, retorno false
      callbackResult({
        valid: false,
        message: "Sorry, site is under maintance now, retry later"
      });
    }
    else {
      const usersCollection = client.db("Petshelper").collection("users");

      usersCollection.findOne({ username: username, password: password }, (err, foundUser) => {

        if (err) {
          callbackResult({
            valid: false,
            message: "Error"
          });
        } else {
          // Si pude consultar los datos, valido si encontré esa combinación usr/pwd o no.
          if (!foundUser) {
            callbackResult({
              valid: false,
              msg: "Invalid user/password."
            });
          } else {
            // Si valida ok, no mando mensaje porque no se va a usar.
            callbackResult({
              valid: true
            });
          }
        };
        client.close();
      });
    }
  });
}


/**
 * Función que consulta usuarix en la DB y retorna los datos
 * 
 * @param {string} username Nombre de usuarix
 * @param {function} callbackResult Callback: function(result: {
 *  success: boolean,
 *  username: {
 *    username: string,
 *    password: string
 *  }
 * })
 */
const getUser = (username, callbackResult) => {

  mongodb.MongoClient.connect(uri, mongoConfig,  (err, client) => {

    if (err) {

      callbackResult({
        success: false
      });

    } else {
      const usersCollection = client.db("Petshelper").collection("users");
      
      usersCollection.findOne({ username: username }, (err, result) => {

        if (err) {
          callbackResult({
            success: false
          });
        } else {
          callbackResult({
            success: true,
            username: result
          });
        }

        client.close();

      });

    }

  });

}

/**
 * Función que registra nuevx usuarix (asume username y password validados)
 * 
 * @param {string} username Username
 * @param {string} password Password
 * @param {function} callbackResult Callback: function(result: boolean)
 */
const registerUser = (username, password, callbackResult) => {
  mongodb.MongoClient.connect(uri, mongoConfig,  (err, client) => {

    if (err) {

      // Si hay error de conexión, retornamos el false
      // (no cerramos conexión porque no se logró abrir)
      callbackResult(false);

    } else {
      const usersCollection = client.db("Petshelper").collection("users");


      const newUser = {
        username: username,
        password: password
      };

      // Insertamos el user en la DB
      usersCollection.insertOne(newUser, (err, result) => {

        if (err) {
          callbackResult(false);
        } else {
          callbackResult(true);
        }

        client.close();
      });

    }

  });
}

module.exports = {
  login,
  getUser,
  registerUser
}