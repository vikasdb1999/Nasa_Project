const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");
const DEFAULT_FLIGHT_NUMBER = 100;


const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
// launches.set(launches.flightNumber,launch)

async function populateLaunches()
{
  console.log("Downloading data....");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      
      pagination: false,

      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if(response.status !== 200)
  {
    console.log("There was an error downloading data")
    throw new Error("There was an error downloading data")
  }

  const launchDocs = response.data.docs;
  
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];

    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
   await saveLaunch(launch)
  }

}

async function loadLaunchData() {
  const firstLaunch =  await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat"
  })
  
  if(firstLaunch)
  {
    console.log("Launches data already exist")
    return
  }
  else
  {
    await populateLaunches()
  }
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("Planet not found !");
  }
  const newFlightNumber = (await getLatestLaunchNumber()) + 1;
  console.log("here", newFlightNumber);
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customers: ["ISRO", "NASA"],
    upcoming: true,
    success: true,
  });
  await saveLaunch(newLaunch);
}
async function findLaunch(filter)
{
  return await launchesDatabase.findOne(filter)
}

async function existLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function getLatestLaunchNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}



async function getAllLaunches(skip,limit) {
  return await launchesDatabase.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  ).skip(skip)
  .sort({flightNumber: 1})
  .limit(limit);
}

module.exports = {
  loadLaunchData,
  scheduleNewLaunch,
  existLaunchWithId,
  abortLaunchById,
  getAllLaunches,
};
