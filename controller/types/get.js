const initDatabase = require("../../database");

async function getAllTypes() {
  const db = await initDatabase();

  try {
    const types = await db.collection("Types").find({}).toArray();

    return types;
  } catch (error) {
    console.error("Erreur : " + error);
  }
}

async function getOneType(Type) {
  const db = await initDatabase();

  try {
    const type = await db.collection("Types").findOne({ name: Type });

    return type;
  } catch (error) {
    console.error("Erreur : " + error);
  }
}

module.exports = { getAllTypes, getOneType };
