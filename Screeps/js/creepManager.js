var behaviorEnum = require('behaviorEnum');
var mapUtils = require('mapUtils');

function calculateHarvestCost(info, room)
{
    var percentFilled = room.memory.collectionUsageDictonary[mapUtils.
                        getComparableRoomPosition(info.collectionPosition)];
    return info.costTo + (info.costTo * percentFilled);
}

function checkOpenInfo(info, room)
{
    if(info.creepNames.length >= info.maxCreeps)
    {
        return false;
    }
    var percentFilled = room.memory.collectionUsageDictonary[mapUtils.
                        getComparableRoomPosition(info.collectionPosition)];
    var percentAddingUnit = 1 / info.maxCreeps;
    return percentFilled + percentAddingUnit <= 1;
}

function addPercentFilled(info, room)
{
    var percentAddingUnit = 1 / info.maxCreeps;
    room.memory.collectionUsageDictonary[mapUtils.
                        getComparableRoomPosition(info.collectionPosition)] += percentAddingUnit;
}

var creepManager =
{
    initialize:function(room, mappedSources)
    {
        room.memory.collectionUsageDictonary = {};
        mappedSources.forEach(function (mappedSource)
        {
            mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo)
            {
                room.memory.collectionUsageDictonary[mapUtils.
                    getComparableRoomPosition(collectionPositionInfo.originalPos)] = 0;
            });
        });
    },
    calculateBestSource: function (infos, room)
    {
        var openInfos = infos.filter(info => checkOpenInfo(info, room)); //maxCreeps
        if (openInfos.length == 0) {
            return null;
        }

        var lowestCost = calculateHarvestCost(openInfos[0], room);
        var lowestCostIndex = 0;

        for (var i = 1; i < openInfos.length; i++) {
            var currentCost = calculateHarvestCost(openInfos[i], room);
            if (currentCost < lowestCost) {
                lowestCost = currentCost;
                lowestCostIndex = i;
            }
        }

        return openInfos[lowestCostIndex];
    },
    createCreep(room, infos, startMemory, infoIndexName) 
    {
        var bestInfo = this.calculateBestSource(infos, room);
        if (bestInfo != null) {
            var bestInfoIndex = infos.indexOf(bestInfo);
            var creepName = 'c' + new Date().getTime();
            startMemory[infoIndexName] = bestInfoIndex;
            var creepResult = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], creepName, startMemory);
            if (creepResult == creepName) 
            {
                infos[bestInfoIndex].creepNames.push(creepName);
                addPercentFilled(infos[bestInfoIndex], room);
            }
        }
    },
    createCreepWithoutInfo: function(room, startMemory)
    {
        var creepName = 'c' + new Date().getTime();
        Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], creepName, startMemory);
    },
    removeUsageFromInfo: function (room, info)
    {
        var percentAddingUnit = 1 / info.maxCreeps;
        room.memory.collectionUsageDictonary[mapUtils.
            getComparableRoomPosition(info.collectionPosition)] -= percentAddingUnit
    },
    run: function (room, finsihedMapping)
    {
        if (Object.keys(Game.creeps).length < 200 && Game.spawns['Spawn1'].energy >= 200)
        {
            if (Object.keys(Game.creeps).length % 2 == 0)
            {
                if (finsihedMapping)
                {
                    this.createCreep(room, room.memory.harvestInfos, {
                        behavior: behaviorEnum.HARVESTER,
                        pathFromId: -1
                    }, 'harvestInfoIndex');
                }
                else
                {
                    this.createCreepWithoutInfo(room, {
                        behavior: behaviorEnum.HARVESTER,
                        pathFromId: -1
                    });
                }
                
            }
            else
            {
                if (finsihedMapping)
                {
                    this.createCreep(room, room.memory.controlInfos, {
                        behavior: behaviorEnum.UPGRADER,
                        pathFromId: -1,
                        pathToId: -1
                    }, 'controlInfoIndex');
                }
                else
                {
                    this.createCreepWithoutInfo(room, {
                        behavior: behaviorEnum.UPGRADER,
                        pathFromId: -1,
                        pathToId: -1
                                });
                }
            }
        }
    },
    resetCreepInfos: function(room)
    {
        room.memory.harvestInfos.forEach(function (info)
        {
            info.creepNames = [];
        });
        room.memory.controlInfos.forEach(function (info)
        {
            info.creepNames = [];
        });
        Object.keys(room.memory.collectionUsageDictonary).forEach(function (key)
        {
            room.memory.collectionUsageDictonary[key] = 0;
        });

        var creepsInThisRoom = Object.keys(Game.creeps)
                                .map(k => Game.creeps[k])
                                .filter(c => c.room.name == room.name);
        creepsInThisRoom.forEach(function(creep)
        {
            var infos = [];
            var indexName = '';
            if(creep.memory.behavior == behaviorEnum.HARVESTER)
            {
                infos = room.memory.harvestInfos;
                indexName = 'harvestInfoIndex';
            }
            else if (creep.memory.behavior == behaviorEnum.UPGRADER)
            {
                infos = room.memory.controlInfos;
                indexName = 'controlInfoIndex';
            }

            var bestInfo = creepManager.calculateBestSource(infos, room);
            if (bestInfo != null)
            {
                var bestInfoIndex = infos.indexOf(bestInfo);
                creep.memory[indexName] = bestInfoIndex;
                infos[bestInfoIndex].creepNames.push(creep.name);
                addPercentFilled(infos[bestInfoIndex], room);
            }
        });
    }
}
module.exports = creepManager;
