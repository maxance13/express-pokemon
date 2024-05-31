const express = require("express");
const fs = require("fs/promises");
const axios = require("axios");
const cors = require("cors");
const data = require("../data/pokemon-data.json");

const app = express();
const database = require("../database");

const { getAllPokemon, getOnePokemon } = require("../controller/pokemon/get");
const { getAllTypes, getOneType } = require("../controller/types/get");
const { getAllAttaques } = require("../controller/attaque/get");
const { getAllTalents } = require("../controller/talent/get");

app.use(cors());

database();

app.get("/", function (req, res) {
  let content = `<h1>Pokemon API</h1>
  
    
    Comment fonctionne l'API: <br>
        -Renvoie un pokemon aléatoire de la liste <a href="/random" >/random</a><br>
        -Renvoie un pokemon aléatoire de la liste correspondant au type/random/[type]<br>
        -Renvoie un pokemon aléatoire correspondant au deux types /random/[type]/[type]<br>
        -Renvoie un pokemon aléatoire correspondant au stage d'évolution en paramètre /random/stage/[1-2]<br>
        -Renvoie un pokemon aléatoire dans la tier correspondant /random/tier/[tier] <br>
        -Renvoie la liste de tout les types disponible dans la base de donnée <a href="/liste/type" >/liste/type</a> <br>
        `;
  res.send(content);
});

app.get("/all", async function (req, res) {
  try {
    const allPokemon = await getAllPokemon();

    for (let i = 0; i < allPokemon.length; i++) {
      allPokemon[i] = allPokemon[i][" Name"];
    }

    res.send(allPokemon);
  } catch (error) {
    console.error("Erreur lors de la récupération des Pokemons :", error);
    res.status(500).send("Erreur de récupération des Pokemons");
  }
});

app.get("/random", async function (req, res) {
  try {
    const AllPokemon = await getAllPokemon();
    const randomNumber = Math.floor(Math.random() * AllPokemon.length);
    const randomPokemon = AllPokemon[randomNumber];
    res.send(randomPokemon);
  } catch (error) {
    console.error("Erreur lors de la récupération des pokémons : ", error);
    res.status(500).send("Erreur de récupératuoin des pokémons");
  }
});

app.get("/random/lignee", async function (req, res) {
  let ArrayPokemon = [];

  const PokemonInfo = await getAllPokemon();
  const randomNumber = Math.floor(Math.random() * PokemonInfo.length);
  const randomPokemon = PokemonInfo[randomNumber];
  ArrayPokemon.push(randomPokemon);
  if (randomPokemon["Next Evolution(s)"].length !== 0) {
    const Evolution = await getOnePokemon(
      randomPokemon["Next Evolution(s)"][0]
    );
    ArrayPokemon.push(Evolution);
    if (Evolution["Next Evolution(s)"].length !== 0) {
      const Evolution2 = await getOnePokemon(Evolution["Next Evolution(s)"][0]);
      ArrayPokemon.push(Evolution2);
    }
  }
  res.send(ArrayPokemon);
});

app.get("/random/tier/:tier", async function (req, res) {
  let arrayTier = [];
  const allPokemon = await getAllPokemon();
  allPokemon.forEach((element) => {
    if (element.Tier === req.params.tier) {
      arrayTier.push(element);
    }
  });

  if (arrayTier.length != 0) {
    const randomNumber = Math.floor(Math.random() * arrayTier.length);

    const randomTierPokemon = arrayTier[randomNumber];

    res.send(randomTierPokemon);
  } else {
    res.redirect("/error?e=Le%20tier%20n'existe%20pas");
  }
});

app.get("/random/stage/:evo", async function (req, res) {
  let arrayPokemonSans = [];
  let arrayPokemonAvec = [];
  const allPokemon = await getAllPokemon();
  allPokemon.forEach((element) => {
    if (element["Next Evolution(s)"].length === 0) {
      arrayPokemonSans.push(element);
    } else {
      arrayPokemonAvec.push(element);
    }
  });

  if (req.params.evo == "1") {
    const randomNumber = Math.floor(Math.random() * arrayPokemonAvec.length);
    res.send(arrayPokemonAvec[randomNumber]);
  } else if (req.params.evo == "2") {
    const randomNumber = Math.floor(Math.random() * arrayPokemonSans.length);
    res.send(arrayPokemonSans[randomNumber]);
  } else {
    res.redirect("/error?e=Stage%20inconnue");
  }
});

app.get("/random/:types", async function (req, res) {
  const pokemonType = await getOneType(req.params.types);

  let allPokemon = await getAllPokemon();
  console.log({ allPokemon });
  allPokemon = allPokemon.filter((pokemon) =>
    pokemon.Types.includes(pokemonType._id)
  );

  if (allPokemon.length !== 0) {
    const randomNumber = Math.floor(Math.random() * allPokemon.length);
    const RealAttaque = await getAllAttaques(allPokemon[randomNumber]["Moves"]);

    allPokemon[randomNumber]["Types"] = RealTypes;
    allPokemon[randomNumber]["Moves"] = RealAttaque;
    res.send(allPokemon[randomNumber]);
  } else {
    res.redirect("/error?e=Type%20inconnue");
  }
});

app.get("/random/:type/:types", async function (req, res) {
  const pokemonType1 = await getOneType(req.params.type);
  const pokemonType2 = await getOneType(req.params.types);

  let allPokemon = await getAllPokemon();

  allPokemon = allPokemon.filter((type) =>
    type.Types.includes(pokemonType1._id)
  );
  allPokemon = allPokemon.filter((types) =>
    types.Types.includes(pokemonType2._id)
  );

  if (allPokemon.length !== 0) {
    const randomNumber = Math.floor(Math.random() * allPokemon.length);
    res.send(allPokemon[randomNumber]);
  } else {
    res.redirect("/error?e=Type%20inconnue");
  }
});

app.get("/liste/tier", async function (req, res) {
  let allTier = [];
  const allPokemon = await getAllPokemon();
  allPokemon.forEach((element) => {
    if (!allTier.includes(element.Tier) && element.Tier != null) {
      allTier.push(element.Tier);
    }
  });
  res.send(allTier);
});

app.get("/liste/type", async function (req, res) {
  const allTypes = await getAllTypes();
  let arrayTypes = [];
  allTypes.forEach((elt) => {
    arrayTypes.push(elt.name);
  });
  res.send(arrayTypes);
});

app.get("/error", function (req, res) {
  res.send(req.query.e);
});

app.listen(3001, () => {
  console.log("Serveur lancé sur l'adresse http://localhost:3001/");
});
