const mongodb = require('mongodb');
const uri = "mongodb+srv://admin:admin@cluster0-opnyh.mongodb.net/Pets?retryWrites=true&w=majority";
const mongoConfig = { useUnifiedTopology: true, useNewUrlParser: true };

/**
 * Consulta los datos de los animales
 * @param {funtion} cbResult callback function(array)
 */

const getAll = cbResult => {
    mongodb.MongoClient.connect(uri, mongoConfig, (err, client) => {
        if (err) {
            // retornar array vacío
            cbResult([]);
            client.close();
        } else {

            const animalsCollection = client.db("Petshelper").collection("animals");

            // Busco los datos y lo convierto en array
            animalsCollection.find().toArray((err, animalList) => {
                if (err) {
                    cbResult([]);
                } else {
                    cbResult(animalList);
                }
                client.close();
            })
        }
    });
}

const getById = (filterId, cbResult) => {
    mongodb.MongoClient.connect(uri, mongoConfig, (err, client) => {
        if (err) {
            cbResult({});
            client.close();
        } else {

            const animalsCollection = client.db("Petshelper").collection("animals");

            animalsCollection.findOne({ id: filterId }, (err, animal) => {
                if (err) {
                    cbResult(undefined);
                } else {
                    cbResult(animal);
                }
                client.close();
            });
        }

    });
}

module.exports = {
    getAll,
    getById
}