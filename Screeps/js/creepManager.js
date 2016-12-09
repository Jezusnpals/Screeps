var behaviorEnum = require('behaviorEnum');
var mapUtils = require('mapUtils');
var infoEnum = require('infoEnum');

function calculateCost(info, room)
{
    var percentFilled = room.memory.collectionUsageDictonary[mapUtils.
                        getComparableRoomPosition(info.collectionPosition)];
    return info.costTo + (info.costTo * percentFilled);
}

function calculatePercentUsage(info, creepInfo)
{
    var moveToSourceFrames = info.costTo * creepInfo.moveToSourceRate;
    var moveFromSourceFrames = info.costTo * creepInfo.moveFromSourceRate;
    var transferFrames = info.type === infoEnum.CONTROL ? creepInfo.upgradeFrames : 1; //1 frame for spwan transfer
    var totalFrames = transferFrames + moveToSourceFrames + moveFromSourceFrames + creepInfo.harvestFrames;
    return creepInfo.harvestFrames / totalFrames;
}

function checkOpenInfo(info, room, creepInfo)
{
    var percentFilled = room.memory.collectionUsageDictonary[mapUtils.
                        getComparableRoomPosition(info.collectionPosition)];
    var percentAddingUnit = calculatePercentUsage(info, creepInfo);
    return percentFilled + percentAddingUnit <= 1;
}


function addPercentFilled(info, room, creepInfo)
{
    var percentAddingUnit = calculatePercentUsage(info, creepInfo);
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
    calculateCreepInfo: function (creepBodies)
    {
        var resourcesPerCarry = 50;
        var harvestRatePerWork = 2;
        var structureRatePerWork = 5;
        var upgradeRatePerWork = 1;
        var numberOfMoveParts = creepBodies.filter(cb => cb === MOVE).length;
        var numberOfCarryParts = creepBodies.filter(cb => cb === CARRY).length;
        var numberOfWeightBodyParts = creepBodies.length - numberOfCarryParts - numberOfMoveParts;
        var terrain = 1;

        var moveToSourceRate = Math.ceil(terrain * numberOfWeightBodyParts / numberOfMoveParts);
        var moveFromSourceRate = Math.ceil(terrain * (numberOfWeightBodyParts + numberOfCarryParts) / numberOfMoveParts);

        var numberOfWorkParts = creepBodies.filter(cb => cb === WORK).length;
        var maxCarryAmount = (resourcesPerCarry * numberOfCarryParts);
        var harvestFrames = Math.ceil(maxCarryAmount / (harvestRatePerWork * numberOfWorkParts));
        var buildFrames = Math.ceil(maxCarryAmount / (structureRatePerWork * numberOfWorkParts));
        var upgradeFrames = Math.ceil(maxCarryAmount / (upgradeRatePerWork * numberOfWorkParts));

        return  {
            harvestFrames: harvestFrames,
            buildFrames: buildFrames,
            upgradeFrames: upgradeFrames,
            moveToSourceRate: moveToSourceRate,
            moveFromSourceRate: moveFromSourceRate
        }
    },
    calculateBestSource: function (infos, room, creepInfo)
    {
        var openInfos = infos.filter(info => checkOpenInfo(info, room, creepInfo)); //maxCreeps
        if (openInfos.length == 0)
        {
            return null;
        }

        var lowestCost = calculateCost(openInfos[0], room);
        var lowestCostIndex = 0;

        for (var i = 1; i < openInfos.length; i++) {
            var currentCost = calculateCost(openInfos[i], room);
            if (currentCost < lowestCost) {
                lowestCost = currentCost;
                lowestCostIndex = i;
            }
        }

        return openInfos[lowestCostIndex];
    },
    createCreep(room, infos, startMemory, infoIndexName) 
    {
        var creepBodies = [WORK, CARRY, MOVE];
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);
        var bestInfo = this.calculateBestSource(infos, room, startMemory.creepInfo);
        if (bestInfo != null) {
            var bestInfoIndex = infos.indexOf(bestInfo);
            var creepName = 'c' + new Date().getTime();
            startMemory[infoIndexName] = bestInfoIndex;
            var creepResult = Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
            if (creepResult == creepName) 
            {
                infos[bestInfoIndex].creepNames.push(creepName);
                addPercentFilled(infos[bestInfoIndex], room, startMemory.creepInfo);
            }
        }
    },
    createCreepWithoutInfo: function(room, startMemory)
    {
        var creepName = 'c' + new Date().getTime();
        var creepBodies = [WORK, CARRY, MOVE];
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);
        Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
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
                        pathFromId: -1,
                        pathToId: -1
                    }, 'harvestInfoIndex');
                }
                else
                {
                    this.createCreepWithoutInfo(room, {
                        behavior: behaviorEnum.HARVESTER,
                        pathFromId: -1,
                        pathToId: -1
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

            var bestInfo = creepManager.calculateBestSource(infos, room, creep.memory.creepInfo);
            if (bestInfo != null)
            {
                var bestInfoIndex = infos.indexOf(bestInfo);
                creep.memory[indexName] = bestInfoIndex;
                infos[bestInfoIndex].creepNames.push(creep.name);
                addPercentFilled(infos[bestInfoIndex], room, creep.memory.creepInfo);
            }
        });
    }
}
module.exports = creepManager;
