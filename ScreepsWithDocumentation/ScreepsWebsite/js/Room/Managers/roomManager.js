var creepManager = require('creepManager');
var roleEnum = require('roleEnum');
var explorationRepository = require('explorationRepository');
var collectionInfoManager = require('collectionInfoManager');
var collectionInfoRepository = require('collectionInfoRepository');

var roomManager =
{
    createdConstructionSites: false,
    initialize: function (room)
    {
        collectionInfoManager.initialize(room);
        creepManager.initialize(room);

        room.memory.initialized = true;
    },
    run: function (room)
    {

        if (!room.controller.my)
        {
            return;
        }

        if (Game.cpu.bucket >= Game.cpu.limit * 5)
        {
            collectionInfoManager.startMappingInfos(room);
        }

        collectionInfoManager.run(room);
        creepManager.run(room);
    },
    cleanUp: function(room, deadCreepNames)
    {
        deadCreepNames.forEach(function (name, i)
        {
            collectionInfoManager.cleanUp(room, name);
            creepManager.cleanUp(room, name);

            var creepMemory = Memory.creeps[name];
            if (creepMemory.role === roleEnum.SCOUT)
            {
                explorationRepository.unReserveRoom(name);
            }

            delete Memory.creeps[name];
        });
        
    }
};

module.exports = roomManager;
