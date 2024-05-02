const express = require('express')
const fs = require('fs/promises')
const axios = require('axios')
const cors = require('cors');
const datas  =require("../data/pokemon-data.json")

const app = express()

let path = "./data/pokemon-data.json"

app.use(cors())



app.get('/', function (req, res) {
    let content = `Hello World! <br><br>
    
    Comment fonctionne l'API: <br>
        -Renvoie un pokemon aléatoire de la liste <a href="/random" style="background: gray">'/random'</a><br>
        -Renvoie un pokemon aléatoire de la liste correspondant au type <i style="background: gray">'/random/[type]' </i><br>
        -Renvoie un pokemon aléatoire correspondant au deux types <i style="background: gray"> '/random/[type]/[type]' </i><br>
        -Renvoie un pokemon aléatoire correspondant au stage d'évolution en paramètre (1 le pokemon est non évolué, 2 le pokemon n'a plus d'évolution) <i style="background: gray">'/random/stage/[1-2]' </i><br>
        -Renvoie un pokemon aléatoire dans la tier correspondant <i style="background: gray">'/random/tier/[tier]'</i> <br>
        -Renvoie la liste de tout les tiers disponible dans la base de donnée <a href="/liste/tier" style="background: gray">'/liste/tier'</a> <br>
        -Renvoie la liste de tout les types disponible dans la base de donnée <a href="/liste/type" style="background: gray">'/liste/type'</a> <br>
        -Renvoie une lignée de pokemon au hasard <a href="/random/lignee" style="background: gray">'/random/lignee'</a>
        `
    res.send(content)
})

app.get('/all', function(req, res){
    fs.readFile(path)
        .then((data) =>{
            let fileData = JSON.parse(data)

            console.log(fileData)

            res.send(fileData)
        })
        .catch((error) => {
            console.log("ERREUR: ", error)
            return res.status(500).send('Error server')
        })
})

app.get('/random', function (req, res) {
  fs.readFile(path)
    .then((data) => {
      let fileData = JSON.parse(data)

      let randomInt = Math.floor(Math.random() * fileData.length)

      let randomPokemon = fileData[randomInt]

      res.send(randomPokemon)

    })
    .catch((error) => {
        console.log("ERREUR: ", error)
        return res.status(500).send('Error server')
    });
})

app.get('/random/lignee', function(req, res) {
    fs.readFile(path)
        .then((data) => {
        let fileData = JSON.parse(data)
        let copyFileData = fileData

        fileData.forEach(element => {
            element['Next Evolution(s)'] = element['Next Evolution(s)'].replace('[', '').replace(']', '').replaceAll("'", '')
            element['Next Evolution(s)'] = element['Next Evolution(s)'].split(', ')
        });

        let randomInt = Math.floor(Math.random() * fileData.length)

        let randomPokemon = fileData[randomInt]
        let newRandomPolemon = []

        if(randomPokemon['Next Evolution(s)'][0].length != 0){
            newRandomPolemon.push(randomPokemon)
            randomPokemon['Next Evolution(s)'].forEach(element => {
                newRandomPolemon.push(copyFileData.filter(pokemon => pokemon[' Name'] == element))
            });
        } else {
            newRandomPolemon = randomPokemon
        }

        res.send(newRandomPolemon)

        })
        .catch((error) => {
            console.log("ERREUR: ", error)
            return res.status(500).send('Error server')
        });
})

app.get('/random/tier/:tier', async function (req, res) {

    const getTier = await axios.get('http://localhost:3001/liste/tier')
    if(getTier.data.includes(req.params.tier)){
        fs.readFile(path)
            .then((data) => {

                let fileData = JSON.parse(data)

                fileData = fileData.filter(pokemon => pokemon.Tier == req.params.tier);
                

                let randomInt = Math.floor(Math.random() * fileData.length)

                let randomPokemon = fileData[randomInt]

                res.send(randomPokemon)

            })
            .catch((error) => {
                console.log("ERREUR: ", error)
                return res.status(500).send('Error server')
            });
    } else {
        res.redirect("/error?e=Le%20tier%20n'existe%20pas")
    }
})

app.get('/random/stage/:evo', function (req, res) {
    fs.readFile(path)
    .then((data) => {
      let fileData = JSON.parse(data)

      if (req.params.evo == 1){
        fileData = fileData.filter(pokemon => pokemon['Next Evolution(s)'] != "[]")
      } else if(req.params.evo == 2) {
        fileData = fileData.filter(pokemon => pokemon['Next Evolution(s)'] == "[]")
      } else {
        res.redirect('/error?e=mauvais stage')
      }

      let randomInt = Math.floor(Math.random() * fileData.length)

      let randomPokemon = fileData[randomInt]

      res.send(randomPokemon)

    })
    .catch((error) => {
        console.log("ERREUR: ", error)
        return res.status(500).send('Error server')
    });
})

app.get('/random/:types', async function(req, res) {

    const getType = await axios.get('http://localhost:3001/liste/type')

    if(getType.data.includes(req.params.types)){

        fs.readFile(path)
            .then((data) => {
                let fileData = JSON.parse(data)

                fileData.forEach(element => {
                    element.Types = element.Types.replace('[', '').replace(']', '').replaceAll("'", '')
                    element.Types = element.Types.split(', ')
                });
                
                fileData = fileData.filter(pokemon => pokemon.Types.includes(req.params.types))

                if(fileData.length == 0){
                    res.redirect('/error?e=Pas%20de%20pokemon')
                }

                let randomInt = Math.floor(Math.random() * fileData.length)

                let randomPokemon = fileData[randomInt]

                res.send(randomPokemon)

            })
            .catch((error) => {
                console.log("ERREUR: ", error)
                return res.status(500).send('Error server')
            });
    } else {
        res.redirect("/error?e=Le%20type%20n'existe%20pas")
    }
})

app.get('/random/:type/:types', async function(req, res){
    const getTypes = await axios.get('http://localhost:3001/liste/type')
    if(getTypes.data.includes(req.params.type) && getTypes.data.includes(req.params.types)){
        fs.readFile(path)
            .then((data) => {
                let fileData = JSON.parse(data)

                fileData.forEach(element => {
                    element.Types = element.Types.replace('[', '').replace(']', '').replaceAll("'", '')
                    element.Types = element.Types.split(', ')
                });
                
                fileData = fileData.filter(pokemon => pokemon.Types.includes(req.params.types) && pokemon.Types.includes(req.params.type))
                console.log(fileData)

                if(fileData.length == 0){
                    res.redirect('/error?e=Pas%20de%20pokemon')
                }

                let randomInt = Math.floor(Math.random() * fileData.length)

                let randomPokemon = fileData[randomInt]

                res.send(randomPokemon)

            })
            .catch((error) => {
                console.log("ERREUR: ", error)
                return res.status(500).send('Error server')
            });
    } else {
        res.redirect("/error?e=Un%20type%20n'existe%20pas")
    }
})

app.get('/liste/tier', function(req, res) {
    fs.readFile(path)
    .then((data) => {
        let allTier = []
        let fileData = JSON.parse(data)

        fileData.forEach(element => {
            if (!allTier.includes(element.Tier)){
                allTier.push(element.Tier);
            }
        });

        res.send(allTier)

    })
    .catch((error) => {
        console.log("ERREUR: ", error)
        return res.status(500).send('Error server')
    });
})

app.get('/liste/type', function(req, res) {
    fs.readFile(path)
    .then((data) => {
        let allTypes = []
        let fileData = JSON.parse(data)

        fileData.forEach(element => {
            element.Types = element.Types.replace('[', '').replace(']', '').replaceAll("'", '')
            element.Types = element.Types.split(', ')
            element.Types.forEach(elements => {
                if(!allTypes.includes(elements)){
                    allTypes.push(elements);
                }
            });
        });

        res.send(allTypes)

    })
    .catch((error) => {
        console.log("ERREUR: ", error)
        return res.status(500).send('Error server')
    });
})

app.get('/error', function(req, res){
    res.send(req.query.e)
})

app.listen(3001, () => {
  console.log("Serveur lancÃ© sur l'adresse http://localhost:3001/");
})