const mongodb = require('mongodb');
const uri = "mongodb+srv://admin:admin@cluster0-opnyh.mongodb.net/Pets?retryWrites=true&w=majority";
const mongoConfig = { useUnifiedTopology: true, useNewUrlParser: true };

/**
 * Consulta los datos de los animales
 * @param {String} nameFilter
 * @param {String} placeFilter
 * @param {Date} orderDate
 * @param {Int} pageNumber
 * @param {funtion} cbResult callback function(array)
 */

const getAll = (nameFilter, placeFilter, orderDate, pageNumber,  cbResult) => {
    mongodb.MongoClient.connect(uri, mongoConfig, (err, client) => {
        if (err) {
            // retornar array vacío
            cbResult([]);
            client.close();
        } else {

            const animalsCollection = client.db("Petshelper").collection("animals");

            const filter = {};
            const order = {};

            if (nameFilter) {
                filter.name = { $regex : nameFilter, $options: 'i'};
            }
            if (placeFilter) {
                filter.place = { $regex : placeFilter, $options: 'i'};
            }
            if(orderDate){
                order.date = -1
            }   

            // Como la primera vez que entro al home la pagina viene undefined, le asigno uno para que previous y next funcionen
            if(pageNumber == undefined){
                pageNumber = 1;
            }

            let page = pageNumber;

            const results = {}

            results.next = {
                page: parseInt(page) + 1
            }
            results.previous = {
                page: parseInt(page) -1
            }


            // Busco los datos y lo convierto en array
            animalsCollection.find(filter).sort(order).skip(6 * (page - 1)).limit(6).toArray((err, animalList) => {
                if (err) {
                    cbResult([]);
                } else {
                    animalList = animalList.map(animal => ({
                        objectId: animal._id.toString(),
                        name: animal.name,
                        owner: animal.owner,
                        cel: animal.cel,
                        place: animal.place,
                        info: animal.info,
                        mail: animal.mail,
                        cp: animal.cp,
                        animalPic: animal.animalPic,
                        date: animal.date
                    }));

                    cbResult(animalList, results);
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

            animalsCollection.findOne({ _id: new mongodb.ObjectID(filterId) }, (err, animal) => {
                if (err) {
                    cbResult(undefined);
                } else {
                    cbResult({
                        objectId: animal._id.toString(),
                        name: animal.name,
                        owner: animal.owner,
                        cel: animal.cel,
                        place: animal.place,
                        info: animal.info,
                        mail: animal.mail,
                        cp: animal.cp,
                        animalPic: animal.animalPic,
                        date: animal.date
                    });
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
            const fecha = new Date();

            const newAnimal = {
                name: nameAnimal.toLowerCase(),
                owner,
                cel,
                place,
                info,
                mail,
                cp,
                animalPic,
                date: fecha.getDate() + "/" + fecha.getMonth() + "/" + fecha.getFullYear()
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