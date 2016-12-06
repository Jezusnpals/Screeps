var behavior = require('behavior');
var roomManager = require('roomManager');
var mapUtils = require('mapUtils');
var creepManager = require('creepManager');
var pathManager = require('pathManager');
var flagDrawer = require('flagDrawer');

module.exports.loop = function () 
{
    var start = Date.now();

    PathFinder.use(true);

    if (!Memory.initialized)
    {
        pathManager.initialize();
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
        
        flapDrawer.showFlags(room);

        var deadCreepNames = Object.keys(Memory.creeps).filter
            (n => !Object.keys(Game.creeps).includes(n));

        roomManager.cleanUp(room, deadCreepNames);

        if (!room.memory.initialized) {

            var currentRoomSpawns = allSpawns.filter(x => x.room.name == name);
            roomManager.initialize(room, currentRoomSpawns);
        }
        roomManager.run(room);
    }
    //console.log(Date.now() - start);
}