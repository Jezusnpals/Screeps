var behavior = require('behavior');
var roomManager = require('roomManager');
var mapUtils = require('mapUtils');
var creepManager = require('creepManager');
var pathManager = require('pathManager');
var flagDrawer = require('flagDrawer');
var explorationManager = require('explorationManager');

module.exports.loop = function () 
{
    var start = Date.now();
    var framesBeforeMapInfo = 5;

    PathFinder.use(true);

    if (!Memory.initialized)
    {
        pathManager.initialize();
        explorationManager.initialize();
        var startRoomName = Object.keys(Game.rooms)[0];
        explorationManager.onRoomExplored(startRoomName);
        Memory.frame = 0;
        Memory.initialized = true;
    }

    Object.keys(Game.creeps).filter(cn => !Game.creeps[cn].spawning).forEach(function (name) {
        var creep = Game.creeps[name];
        behavior.run(creep);
    });

    var allSpawns = Object.keys(Game.spawns).map(function (key) {
        return Game.spawns[key];
    });

    for (var name in Game.rooms)
    {
        var room = Game.rooms[name];

        if (!room.controller.my) //skip unowned rooms
        {
            return;
        }

        var deadCreepNames = Object.keys(Memory.creeps).filter
            (n => !Object.keys(Game.creeps).includes(n));

        roomManager.cleanUp(room, deadCreepNames);

        var currentRoomSpawns = allSpawns.filter(x => x.room.name == name);
        if (!room.memory.initialized)
        {
            roomManager.initialize(room, currentRoomSpawns);
        }
        //flagDrawer.showFlags(room);
        if (framesBeforeMapInfo < Memory.frame) //Delay mapping to bank some extra cpu time just incase
        {
            roomManager.mapInfos(room, currentRoomSpawns);
        }

        roomManager.run(room);
    }
    //console.log(Date.now() - start);
    Memory.frame++;
}