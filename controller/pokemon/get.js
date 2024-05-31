const initDatabase = require("../../database");

async function getAllPokemon() {
  const db = await initDatabase();

  try {
    const pokemons = await db.collection("Pokemon").find({}).toArray();

    return pokemons;
  } catch (error) {
    console.error("Erreur : " + error);
  }
}

async function getOnePokemon(idPokemon) {
  const db = await initDatabase();

  try {
    const pokemon = await db.collection("Pokemon").findOne({ _id: idPokemon });

    return pokemon;
  } catch (error) {
    console.error("Erreur : " + error);
  }
}
module.exports = { getAllPokemon, getOnePokemon };
