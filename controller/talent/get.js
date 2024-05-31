const initDatabase = require("../../database");

async function getAllTalents() {
  const db = await initDatabase();

  try {
    const talents = await db.collection("Talent").find({}).toArray();

    return talents;
  } catch (error) {
    console.error("Erreur : " + error);
  }
}

module.exports = { getAllTalents };
