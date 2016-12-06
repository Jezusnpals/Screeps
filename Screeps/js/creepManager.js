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

function addPercentFilled(info)
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
    run: function (room) {
        if (Object.keys(Game.creeps).length < 200 && Game.spawns['Spawn1'].energy >= 200)
        {
            if (Object.keys(Game.creeps).length % 2 == 0)
            {
                if (room.memory.harvestInfos)
                {
                    var bestHarvestInfo = this.calculateBestSource(room.memory.harvestInfos, room);
                    if (bestHarvestInfo != null)
                    {
                        var bestHarvestInfoIndex = room.memory.harvestInfos.indexOf(bestHarvestInfo);
                        var creepName = 'H' + new Date().getTime();
                        var creepResult = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], creepName, {
                            behavior: behaviorEnum.HARVESTER, harvestInfoIndex: bestHarvestInfoIndex,
                            pathFromId: -1
                        });
                        if (creepResult == creepName)
                        {
                            room.memory.harvestInfos[bestHarvestInfoIndex].creepNames.push(creepName);
                            addPercentFilled(room.memory.harvestInfos[bestControlInfoIndex]);
                        }
                    }
                }
            }
            else
            {
                if (room.memory.controlInfos)
                {
                    var bestControlInfo = this.calculateBestSource(room.memory.controlInfos, room);
                    if (bestControlInfo != null)
                    {
                        var bestControlInfoIndex = room.memory.controlInfos.indexOf(bestControlInfo);
                        var creepName = 'U' + new Date().getTime();
                        var creepResult = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], creepName, {
                            behavior: behaviorEnum.UPGRADER, controlInfoIndex: bestControlInfoIndex,
                            pathFromId: -1
                        });
                        if (creepResult == creepName)
                        {
                            room.memory.controlInfos[bestControlInfoIndex].creepNames.push(creepName);
                            addPercentFilled(room.memory.controlInfos[bestControlInfoIndex]);
                        }
                    }
                }
            }
        }
  
    }
}
module.exports = creepManager;
