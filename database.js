const { MongoClient } = require("mongodb");

let databaseUrl =
  "mongodb+srv://maxanceleroy:vxEGtcbAi3Tn5Ug8@pokemon.dwavndv.mongodb.net/Pokemon";

let cachedDb = null;
let promise = null;

const initDatabase = async () => {
  if (cachedDb) {
    console.log("Using existing connexion !👌");
    return cachedDb;
  }

  if (!promise) {
    promise = new MongoClient(databaseUrl, {
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
  }

  console.log("Creating db connexion 🛜");

  const client = await promise;
  const db = await client.db();

  cachedDb = db;
  return cachedDb;
};

module.exports = initDatabase;
