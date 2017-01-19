var behaviorEnum = require('behaviorEnum');
var infoEnum = require('infoEnum');
var roleEnum = require('roleEnum');
var mapUtils = require('mapUtils');
var pathRepository = require('pathRepository');
var extensionInfoManager = require('extensionInfoManager');
var sourceMapper = require('sourceMapper');
var spawnMapper = require('spawnMapper');
var controlMapper = require('controlMapper');
var pathUtils = require('pathUtils');

function calculateCost(info, room)
{
    var percentFilled = room.memory.collectionUsageDictonary[mapUtils.
                        getComparableRoomPosition(info.collectionPosition)];
    return info.costTo + (info.costTo * percentFilled);
}

function calculatePercentUsage(info, creepInfo)
{
    var toTerrainPath = pathRepository.getTerrainPath(info.pathToKey);
    var fromTerrainPath = info.pathFromKey ? pathRepository.getTerrainPath(info.pathFromKey) : null;

    var moveToSourceFrames = toTerrainPath ? pathUtils.calculateTerrainPathCostToSource(toTerrainPath, creepInfo): 0;
    var moveFromSourceFrames = fromTerrainPath ? pathUtils.calculateTerrainPathCostFromSource(fromTerrainPath, creepInfo) : 0;
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

var collectionInfoManager =
{
    initialize: function (room)
    {
        room.memory.mappedSources = [];
        room.memory.collectionUsageDictonary = {};
        room.memory.Infos = {};
        room.memory.Infos[behaviorEnum.HARVESTER] = {};
        room.memory.Infos[behaviorEnum.UPGRADER] = {};
        room.memory.Infos[behaviorEnum.BUILDER] = {};

        var sources = room.find(FIND_SOURCES);
        for (var index in sources) {
            var mappedSource = sourceMapper.mapSource(sources[index]);
            room.memory.mappedSources.push(mappedSource);
        }

        room.memory.mappedSources.forEach(function (mappedSource)
        {
            mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo) {
                room.memory.collectionUsageDictonary[mapUtils.
                    getComparableRoomPosition(collectionPositionInfo.originalPos)] = 0;
            });
        });

        room.memory.startedMapping = false;
        room.memory.finishedMapping = false;

        extensionInfoManager.initialize(room);
    },
    startMappingInfos: function(room) 
    {
        if (!room.memory.startedMapping)
        {
            room.memory.startedMapping = true;
            room.memory.currentMappingIndex = [0, 0];
            room.memory.currentMappingType = infoEnum.SPAWN;
        }
    },
    resetCreepInfos: function(room)
    {
        Object.keys(room.memory.Infos[behaviorEnum.HARVESTER]).forEach(function (key)
        {
            room.memory.Infos[behaviorEnum.HARVESTER][key].creepNames = [];
        });
        Object.keys(room.memory.Infos[behaviorEnum.UPGRADER]).forEach(function (key)
        {
            room.memory.Infos[behaviorEnum.UPGRADER][key].creepNames = [];
        });
        Object.keys(room.memory.collectionUsageDictonary).forEach(function (key)
        {
            room.memory.collectionUsageDictonary[key] = 0;
        });

        var workersInThisRoom = Object.keys(Game.creeps)
                                .map(k => Game.creeps[k])
                                .filter(c => c.room.name === room.name
                                && c.memory.role === roleEnum.WORKER);
        workersInThisRoom.forEach(function (creep)
        {
            var infos = room.memory.Infos[creep.memory.behavior];
            var bestInfo = collectionInfoManager.calculateBestSource(infos, room, creep.memory.creepInfo);
            if (bestInfo != null)
            {
                creep.memory.infoKeys[creep.memory.behavior] = bestInfo.key;
                bestInfo.creepNames.push(creep.name);
                collectionInfoManager.addPercentFilled(bestInfo, room, creep.memory.creepInfo);
            }
        });
    },
    mapInfos: function(room, spawns)
    {
        if (!room.memory.finishedMapping)
        {
            if (room.memory.currentMappingType === infoEnum.SPAWN)
            {
                spawns.forEach(function (spawn)
                {
                    var mappedSource = room.memory.mappedSources[room.memory.currentMappingIndex[0]];
                    var collectionPositionInfo = mappedSource.collectionPositionInfos[room.memory.currentMappingIndex[1]];
                    var harvestInfo = spawnMapper.mapSingleCollectionPosition(spawn, collectionPositionInfo, mappedSource.sourceId);
                    room.memory.Infos[behaviorEnum.HARVESTER][harvestInfo.key] = harvestInfo;
                });
                room.memory.currentMappingType = infoEnum.CONTROL;
            }
            else if (room.memory.currentMappingType === infoEnum.CONTROL)
            {
                var mappedSource = room.memory.mappedSources[room.memory.currentMappingIndex[0]];
                var collectionPositionInfo = mappedSource.collectionPositionInfos[room.memory.currentMappingIndex[1]];
                var controlInfo = controlMapper.mapSingleCollectionPosition(room.controller, collectionPositionInfo, mappedSource.sourceId);
                room.memory.Infos[behaviorEnum.UPGRADER][controlInfo.key] = controlInfo;

                room.memory.currentMappingIndex[1]++;
                if (room.memory.currentMappingIndex[1] >= mappedSource.collectionPositionInfos.length)
                {
                    room.memory.currentMappingIndex[0]++;
                    room.memory.currentMappingIndex[1] = 0;
                }

                if (room.memory.currentMappingIndex[0] >= room.memory.mappedSources.length)
                {
                    room.memory.finishedMapping = true;
                    collectionInfoManager.resetCreepInfos(room);
                }
                room.memory.currentMappingType = infoEnum.SPAWN;
            }
        }
    },
    run: function(room)
    {
        if (room.memory.startedMapping && !room.memory.finishedMapping)
        {
            var allSpawns = Object.keys(Game.spawns)
            .map(function (key) {
                return Game.spawns[key];
            });
            var currentRoomSpawns = allSpawns.filter(x => x.room.name === room.name);
            collectionInfoManager.mapInfos(room, currentRoomSpawns);
        }
        extensionInfoManager.run(room);
    },
    addPercentFilled: function(info, room, creepInfo)
    {
        var percentAddingUnit = calculatePercentUsage(info, creepInfo);
        room.memory.collectionUsageDictonary[mapUtils.
                            getComparableRoomPosition(info.collectionPosition)] += percentAddingUnit;
    },
    calculateBestSource: function (infos, room, creepInfo)
    {
        infos = Object.keys(infos).map(key => infos[key]);
        var openInfos = infos.filter(info => checkOpenInfo(info, room, creepInfo)); //maxCreeps
        if (openInfos.length === 0) {
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
    removeUsageFromInfo: function (room, info, creepInfo)
    {
        var percentAddingUnit = calculatePercentUsage(info, creepInfo);
        room.memory.collectionUsageDictonary[mapUtils
            .getComparableRoomPosition(info.collectionPosition)] -= percentAddingUnit;
    }

}

module.exports = collectionInfoManager;
