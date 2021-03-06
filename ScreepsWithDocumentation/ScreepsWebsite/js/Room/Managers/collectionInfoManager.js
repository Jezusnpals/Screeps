﻿var behaviorEnum = require('behaviorEnum');
var infoEnum = require('infoEnum');
var roleEnum = require('roleEnum');
var mapUtils = require('mapUtils');
var pathRepository = require('pathRepository');
var extensionInfoManager = require('extensionInfoManager');
var sourceMapper = require('sourceMapper');
var spawnMapper = require('spawnMapper');
var controlMapper = require('controlMapper');
var pathUtils = require('pathUtils');
var collectionInfoRepository = require('collectionInfoRepository');


var collectionInfoManager =
{
    initialize: function (room)
    {
        collectionInfoRepository.initialize(room);
        room.memory.mappedSources = [];
        room.memory.collectionUsageDictonary = {};
        room.memory.sourceUsageDictonary = {};
        
        var sources = room.find(FIND_SOURCES);
        room.memory.mappedSources = sources.map(s => sourceMapper.mapSource(s));

        room.memory.mappedSources.forEach(function (mappedSource)
        {
            room.memory.sourceUsageDictonary[mappedSource.sourceId] = 0;
            mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo) {
                room.memory.collectionUsageDictonary[mapUtils.
                    getComparableRoomPosition(collectionPositionInfo.originalPos)] = 0;
            });
        });

        room.memory.startedMapping = false;
        room.memory.finishedMapping = false;

        extensionInfoManager.initialize(room);
    },
    getMaxEnergyForInfo(info) 
    {
        return Game.getObjectById(info.structureId).energyCapacity;
    },
    calculateTotalFrames(info, creepInfo)
    {
        var pathTo = pathRepository.getTerrainPath(info.pathToKey);
        var costTo = pathUtils.calculateTerrainPathCostToSource(pathTo, creepInfo);
        var pathFrom = pathRepository.getTerrainPath(info.pathFromKey);
        var costFrom = pathUtils.calculateTerrainPathCostFromSource(pathFrom, creepInfo);

        switch (info.type)
        {
            case infoEnum.HARVEST:
                return creepInfo.harvestFrames + costTo + costFrom;
            case infoEnum.UPGRADE:
                return creepInfo.harvestFrames + costTo + costFrom + creepInfo.upgradeFrames;
            case infoEnum.BUILD:
                return creepInfo.harvestFrames + costTo + costFrom + creepInfo.buildFrames;
            default:
                return costTo + costFrom + creepInfo.harvestFrames + creepInfo.upgradeFrames + creepInfo.buildFrames;
        }
        
    },
    calculatePercentHarvestTime(info, creepInfo)
    {
        var totalFrames = collectionInfoManager.calculateTotalFrames(info, creepInfo);
        return creepInfo.harvestFrames / totalFrames;
    },
    calculateSourcePercentUsage(info, creepInfo, percentHarvestTime) {
        const sourceRegenerationTime = 300;
        var totalEnergy = Game.getObjectById(info.sourceId).energyCapacity;
        var energyCollectedBeforeRegeneration = sourceRegenerationTime * percentHarvestTime * creepInfo.harvestRate;
        return energyCollectedBeforeRegeneration / totalEnergy;
    },
    checkOpenInfo(info, room, creepInfo)
    {
        var collectionPercentFilled = room.memory.collectionUsageDictonary[mapUtils.
                            getComparableRoomPosition(info.collectionPosition)];
        var collectionPercentAddingUnit = collectionInfoManager.calculatePercentHarvestTime(info, creepInfo);
        var sourcePercentFilled = room.memory.sourceUsageDictonary[info.sourceId];
        var sourcePercentAddingUnit = collectionInfoManager.calculateSourcePercentUsage(info, creepInfo, collectionPercentAddingUnit);
        return collectionPercentFilled + collectionPercentAddingUnit <= 1 && sourcePercentFilled + sourcePercentAddingUnit <= 1;
    },
    calculateCostPerEnergy(info, creepInfo, room)
    {
        var totalFrames = collectionInfoManager.calculateTotalFrames(info, creepInfo);
        return totalFrames / creepInfo.maxCarryAmount;
    },
    startMappingInfos: function(room) 
    {
        if (!room.memory.startedMapping)
        {
            room.memory.startedMapping = true;
            room.memory.currentMappingIndex = [0, 0];
            room.memory.currentMappingType = infoEnum.HARVEST;
        }
    },
    resetCollectionInfos: function(room)
    {
        
        collectionInfoRepository.getInfoKeys(room, behaviorEnum.HARVESTER).forEach(function (key)
        {
            collectionInfoRepository.getInfo(room, behaviorEnum.HARVESTER, key).creepNames = [];
        });
        collectionInfoRepository.getInfoKeys(room, behaviorEnum.UPGRADER).forEach(function (key)
        {
            collectionInfoRepository.getInfo(room, behaviorEnum.UPGRADER, key).creepNames = [];
        });
        collectionInfoRepository.getInfoKeys(room, behaviorEnum.BUILDER).forEach(function (key)
        {
            collectionInfoRepository.getInfo(room, behaviorEnum.BUILDER, key).creepNames = [];
        });
        Object.keys(room.memory.collectionUsageDictonary).forEach(function (key)
        {
            room.memory.collectionUsageDictonary[key] = 0;
        });
        Object.keys(room.memory.sourceUsageDictonary).forEach((function(key) {
            room.memory.sourceUsageDictonary[key] = 0;
        }));

        var workersInThisRoom = Object.keys(Game.creeps)
                                .map(k => Game.creeps[k])
                                .filter(c => c.room.name === room.name
                                && c.memory.role === roleEnum.WORKER);
        workersInThisRoom.forEach(function (creep)
        {
            var infos = collectionInfoRepository.getInfos(room, creep.memory.behavior);
            var bestInfo = collectionInfoManager.calculateBestCollectionInfo(infos, room, creep.memory.creepInfo);
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
            if (room.memory.currentMappingType === infoEnum.HARVEST)
            {
                spawns.forEach(function (spawn)
                {
                    var mappedSource = room.memory.mappedSources[room.memory.currentMappingIndex[0]];
                    var collectionPositionInfo = mappedSource.collectionPositionInfos[room.memory.currentMappingIndex[1]];
                    var harvestInfo = spawnMapper.mapSingleCollectionPosition(spawn, collectionPositionInfo, mappedSource.sourceId);
                    collectionInfoRepository.setInfo(room, behaviorEnum.HARVESTER, harvestInfo);
                });
                room.memory.currentMappingType = infoEnum.UPGRADE;
            }
            else if (room.memory.currentMappingType === infoEnum.UPGRADE)
            {
                var mappedSource = room.memory.mappedSources[room.memory.currentMappingIndex[0]];
                var collectionPositionInfo = mappedSource.collectionPositionInfos[room.memory.currentMappingIndex[1]];
                var controlInfo = controlMapper.mapSingleCollectionPosition(room.controller, collectionPositionInfo, mappedSource.sourceId);
                collectionInfoRepository.setInfo(room, behaviorEnum.UPGRADER, controlInfo);

                room.memory.currentMappingIndex[1]++;
                if (room.memory.currentMappingIndex[1] >= mappedSource.collectionPositionInfos.length)
                {
                    room.memory.currentMappingIndex[0]++;
                    room.memory.currentMappingIndex[1] = 0;
                }

                if (room.memory.currentMappingIndex[0] >= room.memory.mappedSources.length)
                {
                    room.memory.finishedMapping = true;
                    collectionInfoManager.resetCollectionInfos(room);
                }
                room.memory.currentMappingType = infoEnum.HARVEST;
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
        var percentAddingUnit = collectionInfoManager.calculatePercentHarvestTime(info, creepInfo);
        room.memory.collectionUsageDictonary[mapUtils.
                            getComparableRoomPosition(info.collectionPosition)] += percentAddingUnit;
        var sourcePercentAddingUnit = collectionInfoManager.calculateSourcePercentUsage(info, creepInfo, percentAddingUnit);
        room.memory.sourceUsageDictonary[info.sourceId] += sourcePercentAddingUnit;
    },
    calculateBestCollectionInfo: function (infos, room, creepInfo)
    {
        infos = Object.keys(infos).map(key => infos[key]);
        var openInfos = infos.filter(info => collectionInfoManager.checkOpenInfo(info, room, creepInfo)); //maxCreeps
        if (openInfos.length === 0)
        {
            return null;
        }

        var lowestCost = collectionInfoManager.calculateCostPerEnergy(openInfos[0],creepInfo, room);
        var lowestCostIndex = 0;

        for (var i = 1; i < openInfos.length; i++) {
            var currentCost = collectionInfoManager.calculateCostPerEnergy(openInfos[i],creepInfo, room);
            if (currentCost < lowestCost) {
                lowestCost = currentCost;
                lowestCostIndex = i;
            }
        }

        return openInfos[lowestCostIndex];
    },
    removeUsageFromInfo: function (room, info, creepInfo)
    {
        var percentAddingUnit = collectionInfoManager.calculatePercentHarvestTime(info, creepInfo);
        room.memory.collectionUsageDictonary[mapUtils
            .getComparableRoomPosition(info.collectionPosition)] -= percentAddingUnit;
        var sourcePercentAddingUnit = collectionInfoManager.calculateSourcePercentUsage(info, creepInfo, percentAddingUnit);
        room.memory.sourceUsageDictonary[info.sourceId] -= sourcePercentAddingUnit;
    },
    onStructureComplete: function (creep, newStructureId)
    {
        var behavior = creep.memory.behavior;
        if (behavior !== behaviorEnum.BUILDER) {
            console.log(`Error: OnStructureComplete but not builder, creep: ${creep.name}`);
            return;
        }

        var info = collectionInfoRepository.getInfo(creep.room, behavior, creep.memory.infoKeys[behavior]);
        info.type = infoEnum.HARVEST;
        info.structureId = newStructureId;
        
        collectionInfoRepository.setInfo(creep.room, behaviorEnum.HARVESTER, info);

        var extensionKeyIndex = creep.room.memory.extensionBuildKeys.indexOf(creep.memory.infoKeys[behavior]);
        var isAnExtensionKey = extensionKeyIndex >= 0;
        if (isAnExtensionKey)
        {
            creep.room.memory.extensionBuildKeys.splice(extensionKeyIndex, 1);
        }

        collectionInfoRepository.removeInfo(creep.room, behavior, info.key);
        delete creep.memory.infoKeys[behavior];

        
        creep.memory.infoKeys[behaviorEnum.HARVESTER] = info.key;
        creep.memory.behavior = behaviorEnum.HARVESTER;
    },
    cleanUp: function (room, name)
    {
        var creepMemory = Memory.creeps[name];

        if (creepMemory.role === roleEnum.WORKER)
        {
            var infoKey = creepMemory.infoKeys[creepMemory.behavior];
            var currentInfo = collectionInfoRepository.getInfo(room, creepMemory.behavior, infoKey);

            if (!currentInfo)
            {
                return;
            }

            var infoCreepNameIndex = currentInfo.creepNames.indexOf(name);
            currentInfo.creepNames.splice(infoCreepNameIndex, 1);
            collectionInfoManager.removeUsageFromInfo(room, currentInfo, creepMemory.creepInfo);
        }
    }
}

module.exports = collectionInfoManager;
