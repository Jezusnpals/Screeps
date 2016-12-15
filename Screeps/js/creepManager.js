var behaviorEnum = require('behaviorEnum');
var mapUtils = require('mapUtils');
var infoEnum = require('infoEnum');
var creepUtils = require('creepUtils');
var extensionMapper = require('extensionMapper');

function calculateCost(info, room)
{
    var percentFilled = room.memory.collectionUsageDictonary[mapUtils.
                        getComparableRoomPosition(info.collectionPosition)];
    return info.costTo + (info.costTo * percentFilled);
}

function calculatePercentUsage(info, creepInfo)
{
    var moveToSourceFrames = info.costTo * creepInfo.moveToSourceOnPlainRate;
    var moveFromSourceFrames = info.costTo * creepInfo.moveFromSourceOnPlainRate;
    var transferFrames = info.type === infoEnum.CONTROL ? creepInfo.upgradeFrames : 1; //1 frame for spwan transfer
    var nonHarvestFrames = transferFrames + moveToSourceFrames + moveFromSourceFrames;
    return creepInfo.harvestFrames / nonHarvestFrames;
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
        var plain = 1;
        var swamp = 5;

        var moveToSourceOnPlainRate = Math.ceil(plain * numberOfWeightBodyParts / numberOfMoveParts);
        var moveFromSourceOnPlainRate = Math.ceil(plain * (numberOfWeightBodyParts + numberOfCarryParts) / numberOfMoveParts);

        var moveToSourceOnSwampRate = Math.ceil(swamp * numberOfWeightBodyParts / numberOfMoveParts);
        var moveFromSourceOnSwampRate = Math.ceil(swamp * (numberOfWeightBodyParts + numberOfCarryParts) / numberOfMoveParts);

        var numberOfWorkParts = creepBodies.filter(cb => cb === WORK).length;
        var buildRate = (structureRatePerWork * numberOfWorkParts);
        var maxCarryAmount = (resourcesPerCarry * numberOfCarryParts);
        var harvestFrames = Math.ceil(maxCarryAmount / (harvestRatePerWork * numberOfWorkParts));
        var buildFrames = Math.ceil(maxCarryAmount / buildRate);
        var upgradeFrames = Math.ceil(maxCarryAmount / (upgradeRatePerWork * numberOfWorkParts));

        return  {
            harvestFrames: harvestFrames,
            buildFrames: buildFrames,
            upgradeFrames: upgradeFrames,
            buildRate: buildRate,
            moveToSourceOnPlainRate: moveToSourceOnPlainRate,
            moveFromSourceOnPlainRate: moveFromSourceOnPlainRate,
            moveToSourceOnSwampRate: moveToSourceOnSwampRate,
            moveFromSourceOnSwampRate: moveFromSourceOnSwampRate,
            maxCarryAmount: maxCarryAmount
        }
    },
    calculateNextExtensionInfo: function (room)
    {
        var possibleCollectionPositionInfos = room.memory.mappedSources.map(s => s.collectionPositionInfos).reduce((c1, c2) => c1.concat(c2));
        var currentExtensionComparablePositions = room.memory.buildingInfos.map(ei => mapUtils.getComparableRoomPosition(ei.collectionPosition));
        possibleCollectionPositionInfos = possibleCollectionPositionInfos.filter(pes => !currentExtensionComparablePositions
                                                                         .includes(mapUtils.getComparableRoomPosition(pes.originalPos)));
        var collectionPositionCosts = possibleCollectionPositionInfos.map(function (collectionPositionInfo) {
            var comparableCollectionPosition = mapUtils.getComparableRoomPosition(collectionPositionInfo.originalPos);
            var relatedHarvestInfo = room.memory.harvestInfos
                .filter(hi => mapUtils
                    .getComparableRoomPosition(hi.collectionPosition) ===
                    comparableCollectionPosition);
            var harvestCost = relatedHarvestInfo.length === 1 ? relatedHarvestInfo[0].costTo : 0;
            var relatedControlInfo = room.memory.controlInfos
                .filter(ci => mapUtils
                    .getComparableRoomPosition(ci.collectionPosition) ===
                    comparableCollectionPosition);
            var controlCost = relatedControlInfo.length === 1 ? relatedControlInfo[0].costTo : 0;
            return harvestCost + controlCost;
        });

        var bestExtensionPositionInfo = null;
        var highestCost = -1;

        for (let i = 0; i < possibleCollectionPositionInfos.length && i < collectionPositionCosts.length; i++) {
            if (collectionPositionCosts[i] > highestCost) {
                bestExtensionPositionInfo = possibleCollectionPositionInfos[i];
                highestCost = collectionPositionCosts[i];
            }
        }

        if (!bestExtensionPositionInfo) {
            return null;
        }

        return extensionMapper.mapExtension(bestExtensionPositionInfo, bestExtensionPositionInfo.sourceId);
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
        if (bestInfo != null)
        {
            var bestInfoIndex = infos.indexOf(bestInfo);
            var creepName = 'c' + new Date().getTime();
            startMemory[infoIndexName] = bestInfoIndex;
            var creepResult = Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
            if (creepResult == creepName) 
            {
                infos[bestInfoIndex].creepNames.push(creepName);
                addPercentFilled(infos[bestInfoIndex], room, startMemory.creepInfo);
                return true;
            }
        }
        return false;
    },
    createCreepWithoutInfo: function(room, startMemory)
    {
        var creepName = 'c' + new Date().getTime();
        var creepBodies = [WORK, CARRY, MOVE];
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);
        Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
    },
    removeUsageFromInfo: function (room, info, creepInfo) {
        var percentAddingUnit = calculatePercentUsage(info, creepInfo);
        room.memory.collectionUsageDictonary[mapUtils
            .getComparableRoomPosition(info.collectionPosition)] -= percentAddingUnit;;
    },
    resetReservedSources: function (room)
    {
        Object.keys(room.memory.reservedSources).forEach(function(stringCollectionPosition)
        {
            if (room.memory.reservedSources[stringCollectionPosition])
            {
                var creep = Game.creeps[room.memory.reservedSources[stringCollectionPosition].name];
                if (creep)
                {
                    if (creep.memory.framesToSource !==
                        room.memory.reservedSources[stringCollectionPosition].frames)
                    {
                        if (creep.memory.reservedSourceKey === stringCollectionPosition)
                        {
                            creepUtils.resetSavedPathToSource(creep);
                        }

                        room.memory.reservedSources[stringCollectionPosition] = null;
                    }
                } else
                {
                    room
                        .memory.reservedSources[stringCollectionPosition] = null;
                }
            }
        });
    },
    run: function (room, finsihedMapping)
    {
        creepManager.resetReservedSources(room);
        if (Object.keys(Game.creeps).length < 500 && Game.spawns['Spawn1'].energy >= 200)
        {
            if (finsihedMapping && room.memory.extensionIndexes.length > 0)
            {
                var extensionInfos = room.memory.extensionIndexes.map(index => room.memory.buildingInfos[index]);
                var createdCreep = this.createCreep(room, extensionInfos, {
                    behavior: behaviorEnum.BUILDER,
                    pathFromKey: '',
                    pathToKey: '',
                    isMoving: true,
                    framesToSource: -1,
                    knownReservedSources: []
                }, 'buildInfoIndex');

                if (createdCreep)
                {
                    return;
                }
            }
            if (Object.keys(Game.creeps).length % 2 == 0)
            {
                if (finsihedMapping)
                {
                    this.createCreep(room, room.memory.harvestInfos, {
                        behavior: behaviorEnum.HARVESTER,
                        pathFromKey: '',
                        pathToKey: '',
                        isMoving: true,
                        framesToSource: -1,
                        knownReservedSources: []
                    }, 'harvestInfoIndex');
                }
                else
                {
                    this.createCreepWithoutInfo(room, {
                        behavior: behaviorEnum.HARVESTER,
                        pathFromKey: '',
                        pathToKey: '',
                        isMoving: true,
                        framesToSource: -1,
                        knownReservedSources: []
                    });
                }
                
            }
            else
            {
                if (finsihedMapping)
                {
                    this.createCreep(room, room.memory.controlInfos, {
                        behavior: behaviorEnum.UPGRADER,
                        pathFromKey: '',
                        pathToKey: '',
                        isMoving: true,
                        framesToSource: -1,
                        knownReservedSources: []
                    }, 'controlInfoIndex');
                }
                else
                {
                    this.createCreepWithoutInfo(room, {
                        behavior: behaviorEnum.UPGRADER,
                        pathFromKey: '',
                        pathToKey: '',
                        isMoving: true,
                        framesToSource: -1,
                        knownReservedSources: []
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
