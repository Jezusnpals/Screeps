var reservedCollectionPositionsRepository = require('reservedCollectionPositionsRepository');
var creepUtils = require('creepUtils');

//{frames: terrainPathCost, name: creep.name};
var reservedCollectionPositionManager =
{
    initialize: function (room) 
    {
        reservedCollectionPositionsRepository.initialize(room);
    },
    cleanUpReservedSources: function (room)
    {
        reservedCollectionPositionsRepository.getReservedCollectionPositionKeys(room)
            .forEach(function (stringCollectionPosition)
            {
                const reservedCollectionPosition = reservedCollectionPositionsRepository.getReservedCollectionPosition(room);
                if (reservedCollectionPosition)
                {
                    var creep = Game.creeps[reservedCollectionPosition.name];
                    if (creep)
                    {
                        var creepHasSourceReserved = creep.memory.framesToSource !==
                            reservedCollectionPosition.frames;
                        if (creepHasSourceReserved)
                        {
                            if (creep.memory.reservedCollectionPositionKey === stringCollectionPosition)
                            {
                                creepUtils.resetSavedPathToSource(creep);
                            }
                            reservedCollectionPositionsRepository.resetReservedCollectionPosition(room, stringCollectionPosition);
                        }
                    }
                    else
                    {
                        reservedCollectionPositionsRepository.resetReservedCollectionPosition(room, stringCollectionPosition);
                    }
                }
            });
    },
    run: function (room)
    {
        reservedCollectionPositionManager.cleanUpReservedSources(room);;
    },
    cleanUp: function (room, name)
    {

        var reservedKeysOfDead = reservedCollectionPositionsRepository.getReservedCollectionPositionKeys(room)
               .filter(key => reservedCollectionPositionsRepository.getReservedCollectionPosition(room, key)
                   && reservedCollectionPositionsRepository.getReservedCollectionPosition(room, key).name === name);
        reservedKeysOfDead.forEach(key => reservedCollectionPositionsRepository.resetReservedCollectionPosition(room, key));
    }
}
module.exports = reservedCollectionPositionManager;
