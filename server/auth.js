const mongodb = require("mongodb");
const mongoURL = "mongodb://localhost:27017";

/**
 * 
 * @param {string} username Username
 * @param {string} password Password
 * @param {function} callbackResult Callback: function(result: { valid: boolean, msg: string })
 */

const login = (username, password, callbackResult) => {

	// Nos conectamos al servidor de MongoDB
	mongodb.MongoClient.connect(mongoURL, (err, client) => {

		if (err) {
			//No me pude conectar al server, retorno false
			callbackResult({
				valid: false,
				message: "Sorry, site is under maintance now, retry later"
			});
		}
		else {
			const serveriiDB = client.db("Pets");
			const usersCollection = serveriiDB.collection("users");

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
				}
			});
		}
		client.close();
	});
};




module.exports = {
	login
}