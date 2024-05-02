const express = require("express");
const fs = require("fs/promises");
const axios = require("axios");
const cors = require("cors");

const app = express();
let path = "./data/pokemon-data.json";

app.use(cors());

app.get("/", function (req, res) {
  res.send(
    "<p>Vous avez demande la page d'accueil du serveur <br>/random pour un pokemon aleatoire<br>/randome/type du pokemon pour un pokemon aleatoire d'un type<br>/liste/:type pour une liste de pokemon d'un type<br>/liste/tier pour une liste de pokemon d'un tier<br>/randome/tier/tier du pokemon pour un pokemon aleatoire d'un tier<br>/random/stage/1 ou 2 pour un pokemon aleatoire d'un stage</p>"
  );
});
app.get("/random", function (req, res) {
  fs.readFile(path)
    .then((data) => {
      let fileData = JSON.parse(data);

      let randomInt = Math.floor(Math.random() * fileData.length);

      let randomPokemon = fileData[randomInt];

      res.send(randomPokemon);
    })
    .catch((error) => {
      res.status(404).send("pas de pokemon");
    });
});

app.get("/random/:types", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:3001/liste/types");
    const pokemons = response.data;
    const pokemonsOfTypes = pokemons.filter((pokemon) =>
      pokemon.Types.includes(req.params.types)
    );
    if (pokemonsOfTypes.length === 0) {
      return res
        .status(404)
        .send(`pas de types correspondant à '${req.params.type}'`);
    }

    const randomInt = Math.floor(Math.random() * pokemonsOfTypes.length);
    const randomPokemon = pokemonsOfTypes[randomInt];

    res.send(randomPokemon);
  } catch (error) {}
});

app.get("/random/:type1/:type2", function (req, res) {
  fs.readFile(path)
    .then((data) => {
      let pokemons = JSON.parse(data);
      let pokemonsOfType = pokemons.filter(
        (pokemon) =>
          pokemon.Types.includes(req.params.type1) &&
          pokemon.Types.includes(req.params.type2)
      );

      if (pokemonsOfType.length === 0) {
        return res
          .status(404)
          .send(
            `No pokemons with types '${req.params.type1}' and '${req.params.type2}' found`
          );
      }

      let randomInt = Math.floor(Math.random() * pokemonsOfType.length);
      let randomPokemon = pokemonsOfType[randomInt];

      res.send(randomPokemon);
    })
    .catch((error) => {});
});

app.get("/random/stage/:evo", function (req, res) {
  fs.readFile(path)
    .then((data) => {
      let fileData = JSON.parse(data);

      if (req.params.evo == 1) {
        fileData = fileData.filter(
          (pokemon) => pokemon["Next Evolution(s)"] != "[]"
        );
      } else if (req.params.evo == 2) {
        fileData = fileData.filter(
          (pokemon) => pokemon["Next Evolution(s)"] == "[]"
        );
      } else {
        res.redirect("/error?e=mauvais stage");
      }

      let randomInt = Math.floor(Math.random() * fileData.length);

      let randomPokemon = fileData[randomInt];

      res.send(randomPokemon);
    })
    .catch((error) => {});
});
app.get("/liste/tier", function (req, res) {
  fs.readFile(path)
    .then((data) => {
      const pokemons = JSON.parse(data);
      const tiers = pokemons ? pokemons.map((pokemon) => pokemon.Tier) : [];
      const uniqueTiers = [...new Set(tiers)];
      res.send(uniqueTiers);
    })
    .catch((error) => {});
});
app.get("/liste/types", function (req, res) {
  fs.readFile(path)
    .then((data) => {
      const pokemons = JSON.parse(data);
      let types = [];
      pokemons.forEach((pokemon) => {
        types.push(pokemon.Types);
      });
      let uniqueTypes = [];
      types.forEach((type) => {
        let trimmedType = type.replace(/'|\s|\[\]/g, "").replace("[", "");
        let slicedType = trimmedType.slice(0, trimmedType.indexOf(","));
        if (!uniqueTypes.includes(slicedType)) {
          uniqueTypes.push(slicedType);
        }
      });
      res.send(uniqueTypes);
    })
    .catch((error) => {});
});

app.get("/random/tier/:tier", function (req, res) {
  const { tier } = req.params;
  fs.readFile(path)
    .then((data) => {
      let pokemons = JSON.parse(data);
      pokemons = pokemons.filter((pokemon) => pokemon.Tier === tier);
      const randomInt = Math.floor(Math.random() * pokemons.length);
      const randomPokemon = pokemons[randomInt];
      res.send(randomPokemon);
    })
    .catch((error) => {});
});
app.listen(3001, () => {
  console.log("Serveur lancé sur l'adresse http://localhost:3001/");
});
