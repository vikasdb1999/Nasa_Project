const {getAllLaunches,existLaunchWithId,abortLaunchById, scheduleNewLaunch} = require("../../models/launches.model")
const {getPagination} = require("../../services/query")


async function httpGetAllLaunches(req,res){
    const {skip,limit} = getPagination(req.query);
    const launches = await getAllLaunches(skip,limit)
    res.status(200).json(launches)
}

async function httpAddNewLaunch(req,res)
{
   const launch = req.body;

   if(!launch.mission || !launch.rocket || !launch.target || !launch.launchDate)
   {
    return res.status(400).json({
        error: "Missing required launch property"
    })
   }
   launch.launchDate = new Date(launch.launchDate)
   if(isNaN(launch.launchDate))
   {
    return res.status(400).json({
        error: "Not Valid Date"
    })
   }

   await scheduleNewLaunch(launch)
   console.log(launch)
   res.status(201).json(launch);
}

async function httpAbortLaunch(req,res)
{
   const launchId = Number(req.params.id)
   const existLaunch = await existLaunchWithId(launchId)
   if(!existLaunch)
   {
    return res.status(400).json({
        error: "Launch Not Found."
    })
   }
   const aborted = await abortLaunchById(launchId)
   if(!aborted)
   {
    res.status(400).json({
    error: "Launch not aborted."
    })
   }
    res.status(200).json({
        ok: true
    })
}


module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch
}