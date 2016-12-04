var behavior = require('behavior');
var roomManager = require('roomManager');
var mapUtils = require('mapUtils');
var creepManager = require('creepManager');


var showFlagsForPaths = false;
var showFlagsForSourcePoints = false;

var showFlagForHarvestInfo = 'pathFrom';
//var showFlagForHarvestInfo = 'returnPathBlockers';
//var showFlagForHarvestInfo = 'pathTo';


module.exports.loop = function () {

    PathFinder.use(true);

    var start = Date.now();

    console.log('commit test');


    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        behavior.run(creep);
    }


    var allSpawns = Object.keys(Game.spawns).map(function (key) {
        return Game.spawns[key];
    });

    for (var name in Game.rooms) {


        var room = Game.rooms[name];


        if (!room.memory.initialized) {

            var currentRoomSpawns = allSpawns.filter(x => x.room.name == name);
            roomManager.initialize(room, currentRoomSpawns);
        }
        roomManager.run(room);

        /*
                    if(showFlagsForPaths)
                    {
                        room.memory.mappedSources.forEach(function(value, i)
                        {
                            value.harvestInfos.forEach(function(info, j)
                            {
                                info.pathTo.forEach(function(pointOnPath, k)
                                {
                                     var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                                     //room.createFlag(pointOnPath, 'f' + + i + j + k, colors[i % colors.length]);
                                     room.createFlag(pointOnPath, 't' + + i + j + k, colors[1]);
                                });
                                
                                info[showFlagForHarvestInfo].forEach(function(pointOnPath, k)
                                {
                                     var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                                     //room.createFlag(pointOnPath, 'f' + + i + j + k, colors[i % colors.length]);
                                     room.createFlag(pointOnPath, 'f' + + i + j + k, colors[0]);
                                });
                            })
                        });
                    }
                    else if(showFlagsForSourcePoints)
                    {
                        room.memory.mappedSources.forEach(function(value, i)
                        {
                            value.collectionPositions.forEach(function(pos, j)
                            {
                                var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE]
                                    room.createFlag(pos, 'p' + + i + j, colors[i % colors.length]);
                            });
                        });
                    }
                }
                */


    }
    console.log(Date.now() - start);
}