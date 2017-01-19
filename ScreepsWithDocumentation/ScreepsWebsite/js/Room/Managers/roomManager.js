var creepManager = require('creepManager');
var roleEnum = require('roleEnum');
var explorationRepository = require('explorationRepository');
var collectionInfoManager = require('collectionInfoManager');

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
            var reservedKeysOfDead = Object.keys(room.memory.reservedSources)
                .filter(key => room.memory.reservedSources[key] && room.memory.reservedSources[key].name === name);
            reservedKeysOfDead.forEach(key => room.memory.reservedSources[key] = null);

            var creepMemory = Memory.creeps[name];

            if (creepMemory.role === roleEnum.WORKER)
            {
                var infos = room.memory.Infos[creepMemory.behavior];
                var infoIndex = creepMemory.infoKeys[creepMemory.behavior];
                var currentInfo = infos[infoIndex];

                if (!currentInfo)
                {
                    delete Memory.creeps[name];
                    return;
                }

                var infoCreepNameIndex = currentInfo.creepNames.indexOf(name);
                currentInfo.creepNames.splice(infoCreepNameIndex, 1);
                collectionInfoManager.removeUsageFromInfo(room, currentInfo, creepMemory.creepInfo);
            }
            else if (creepMemory.role === roleEnum.SCOUT)
            {
                explorationRepository.unReserveRoom(name);
            }

            delete Memory.creeps[name];
        });
        
    }
};

module.exports = roomManager;
