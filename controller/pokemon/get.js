const initDatabase = require("../../database");

async function getAllPokemon() {
  const db = await initDatabase();

  try {
    const pokemons = await db.collection("Pokemon").find({}).toArray();

    // console.log({pokemons});

    pokemons.forEach((element) => {
      console.log(element[" Name"]);
    });

    return pokemons;
  } catch (error) {
    console.error("Erreur : " + error);
  }
}

module.exports = { getAllPokemon };
