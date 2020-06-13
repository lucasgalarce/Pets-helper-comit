const mongodb = require('mongodb');
const uri = "mongodb+srv://admin:admin@cluster0-opnyh.mongodb.net/Pets?retryWrites=true&w=majority";
const mongoConfig = { useUnifiedTopology: true, useNewUrlParser: true };

/**
 * Consulta los datos de los animales
 * @param {funtion} cbResult callback function(array)
 */

const getAll = (nameFilter, cbResult) => {
    mongodb.MongoClient.connect(uri, mongoConfig, (err, client) => {
        if (err) {
            // retornar array vacío
            cbResult([]);
            client.close();
        } else {

            const animalsCollection = client.db("Petshelper").collection("animals");

            const filter = {};
            
            if (nameFilter) {
                filter.name = { $regex: `.*${nameFilter.toLowerCase()}.*` };
              }

            // Busco los datos y lo convierto en array
            animalsCollection.find(filter).toArray((err, animalList) => {
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

const registerAnimal = (nameAnimal, owner, cel, place, info, mail, cp, animalPic, callbackResult) => {
    mongodb.MongoClient.connect(uri, mongoConfig, (err, client) => {

        if (err) {

            callbackResult(false);

        } else {
            const usersCollection = client.db("Petshelper").collection("animals");

            const newAnimal = {
                name: nameAnimal.toLowerCase(),
                owner,
                cel,
                place,
                info,
                mail,
                cp,
                animalPic
            };

            // Insertamos el user en la DB
            usersCollection.insertOne(newAnimal, (err, result) => {

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
    getAll,
    getById,
    registerAnimal
}