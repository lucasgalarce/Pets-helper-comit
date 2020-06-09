const mongodb = require("mongodb");
const mongoURL = "mongodb://localhost:27017";
const mongoConfig = { useUnifiedTopology: true };

/**
 * Consulta los datos de los animales
 * @param {funtion} cbResult callback function(array)
 */

const getAll = cbResult => {
    mongodb.MongoClient.connect(mongoURL, mongoConfig,  (err, client) => {
        if (err) {
            // retornar array vacío
            cbResult([]);
            client.close();
        } else {
            const petsDb = client.db("Pets");
            const animalsCollection = petsDb.collection("animals");
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
    mongodb.MongoClient.connect(mongoURL, mongoConfig, (err, client) => {
        if (err) {
            cbResult({});
            client.close();
        } else {
            const petsDb = client.db("Pets");
            const animalsCollection = petsDb.collection("animals");

            animalsCollection.findOne({ id: filterId }, (err, animal) => {
                if(err){
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