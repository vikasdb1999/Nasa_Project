const {parse} = require("csv-parse")
const fs = require("fs")
const path = require("path")
const planets = require("./planets.mongo")

const habitablePlanets = []

function isHabitablePlanet(planet)
{

    return planet['koi_disposition'] === 'CONFIRMED' && planet['koi_insol'] > 0.36 
    && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6
}

function loadAllPlanets()
{
    return new Promise((resolve,reject)=>{
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')).pipe(parse({
            comment: "#",
            columns: true
          })).on("data",async (data)=>{
              if(isHabitablePlanet(data))
              {

                 savePlanet(data)
              }
          }).on("error",(err)=>{
              console.log("Error ",err);
              reject()
          }).on("end",async ()=>{
              const countPlanets = (await getAllPlanets()).length;
              console.log("Total Habitable planets is ",countPlanets)
              console.log("end")
              resolve()
          })

    })
}

async function getAllPlanets()
{
    return await planets.find({},{
        "_id": 0,
        "__v": 0
    })
}

async function savePlanet(planet)
{
    try{
    await planets.updateOne({
        keplerName: planet.kepler_name
      },
      {
        keplerName: planet.kepler_name
      },
      {
        upsert: true
      });
    }catch(err){
        console.error("Could not save planets",err)
    }
}

module.exports = {
    loadAllPlanets,
    getAllPlanets
}