const { MongoClient, ObjectId } = require("mongodb");

const DB_USER = "maindres";
const DB_PASSWORD = "vpW2SuTJrZy6gBkn";
const DB_HOST = "maindres.h0cr3.mongodb.net";
const DB_NAME = "maindres";

const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
console.log(MONGO_URI);

const client = new MongoClient(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const mongo = {
  connect() {
    if (!mongo.connection) {
      mongo.connection = new Promise((resolve, reject) => {
        client.connect((err) => {
          if (err) {
            reject(err);
          }

          resolve(client.db(DB_NAME));
        });
      });
    }

    return mongo.connection;
  },

  async getAll(collection, query) {
    return mongo.connect().then((db) => {
      return db.collection(collection).find(query).toArray();
    });
  },

  async getByOriginalId(id) {
    const db = await mongo.connect();

    const get_query = await db.collection("products").findOne({
      originalId: id,
    });

    return get_query;
  },

  async get(collection, id) {
    const db = await mongo.connect();

    const get_query = await db.collection(collection).findOne({
      _id: ObjectId(id),
    });

    return get_query;
  },

  async create(collection, data) {
    const db = await mongo.connect();

    const insert_query = await db.collection(collection).insertOne(data);

    return insert_query.ops[0]._id;
  },

  async update(collection, id, data) {
    const db = await mongo.connect();

    const result = db.collection(collection).updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: data,
      },
      {
        upsert: true,
      }
    );

    return result.result;
  },

  async remove(collection, query) {
    const db = await mongo.connect();

    const result = db.collection(collection).remove(query);

    return result;
  },

  async deleteCollection(collection) {
    const db = await mongo.connect();
    return await db.dropCollection(collection);
  },
};

module.exports = mongo;
