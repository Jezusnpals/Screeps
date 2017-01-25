var behavior = require('behavior');
var roomManager = require('roomManager');
var mapUtils = require('mapUtils');
var creepManager = require('creepManager');
var pathRepository = require('pathRepository');
var flagDrawer = require('flagDrawer');
var explorationRepository = require('explorationRepository');
var explorationUtils = require('explorationUtils');

module.exports.loop = function ()
{
    //PathFinder.use(true);

    if (!Memory.initialized)
    {
        pathRepository.initialize();
        var startRoomName = Object.keys(Game.rooms)[0];
        explorationRepository.initialize(startRoomName);
        explorationUtils.addRoomExplored(Game.rooms[startRoomName]);
        Memory.frame = 0;
        Memory.bodyCount = 0;
        Memory.totalTimeIUsed = 0;
        Memory.totalTimeTownsendUsed = 0;

        Memory.initialized = true;
    }

    //Run Creep Logic
    Object.keys(Game.creeps)
        .filter(cn => !Game.creeps[cn].spawning)
        .forEach(function (name)
        {
            var creep = Game.creeps[name];
            behavior.run(creep);
        });

    //Run room Logic
    Object.keys(Game.rooms)
        .forEach(function (name)
        {
            var room = Game.rooms[name];

            if (!room.controller || !room.controller.my) //skip unowned rooms
            {
                explorationUtils.mapRoom(room);
                return;
            }

            if (Memory.creeps)
            {
                var deadCreepNames = Object.keys(Memory.creeps)
                    .filter
                    (n => !Object.keys(Game.creeps).includes(n));

                roomManager.cleanUp(room, deadCreepNames);
            }

            
            if (!room.memory.initialized) {
                roomManager.initialize(room);
            }

            roomManager.run(room);
        });

    var percentUsed = Game.cpu.getUsed() / Game.cpu.limit * 100;
    //console.log(`cpu percentUsed ${percentUsed}`);
    
    Memory.frame++;
}