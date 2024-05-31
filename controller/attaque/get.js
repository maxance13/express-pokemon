const initDatabase = require("../../database");

async function getAllAttaques() {
  const db = await initDatabase();

  try {
    const attaques = await db.collection("Attaque").find({}).toArray();
    return attaques;
  } catch (error) {
    console.error("Erreur : " + error);
  }
}

module.exports = { getAllAttaques };
