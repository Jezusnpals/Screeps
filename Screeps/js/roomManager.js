var mapUtils = require('mapUtils');
var sourceMapper = require('sourceMapper');
var spawnMapper = require('spawnMapper');
var controlMapper = require('controlMapper');
var creepManager = require('creepManager');
var extensionMapper = require('extensionMapper');
var infoEnum = require('infoEnum');

var roomManager =
{
    createdConstructionSites: false,
    initialize: function (room, spawns) {
        room.memory.initialized = true;
        room.memory.mappedSources = [];
        room.memory.harvestInfos = [];
        room.memory.controlInfos = [];
        room.memory.buildingInfos = [];
        room.memory.reservedSources = {};
        room.memory.extensionsNumber = 0;

        var sources = room.find(FIND_SOURCES);
        for (var index in sources)
        {
            var mappedSource = sourceMapper.mapSource(sources[index]);
            room.memory.mappedSources.push(mappedSource);
        }

        room.memory.currentPositionIndex = [0,0];
        room.memory.finishedMapping = false;
        room.memory.addedFirstExtension = false;
        
        room.memory.currentMappingType = infoEnum.SPAWN;

        creepManager.initialize(room, room.memory.mappedSources);
    },
    addExtensionInfo: function (room)
    {
        var maxExtensions = room.controller.level * 5;
        if (extensionsNumber + 1 > maxExtensions)
            return false;
        var extensionInfo = creepManager.calculateNextExtensionInfo(room);
        var constructionSiteResult = room.createConstructionSite(extensionInfo.extensionPosition, STRUCTURE_EXTENSION);
        if (constructionSiteResult === OK)
        {
            var extensions = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_EXTENSION }
            });
            var currentExtension = extensions.filter(e => mapUtils.getComparableRoomPosition(e.pos) ==
                mapUtils.getComparableRoomPosition(extensionInfo.extensionPosition));
            currentExtension = currentExtension.length === 1 ? currentExtension[0] : null;
            if (currentExtension)
            {
                extensionInfo.strucutreId = currentExtension.id;
                buildingInfos.push(extensionInfo);
                return true;
            }
        }
        return false;
    },
    mapInfos: function(room, spawns)
    {
        if (!room.memory.finishedMapping)
        {
            if (room.memory.currentMappingType == infoEnum.SPAWN)
            {
                spawns.forEach(function (spawn)
                {
                    var mappedSource = room.memory.mappedSources[room.memory.currentPositionIndex[0]];
                    var collectionPositionInfo = mappedSource.collectionPositionInfos[room.memory.currentPositionIndex[1]];
                    var harvestInfo = spawnMapper.mapSingleCollectionPosition(spawn, collectionPositionInfo, mappedSource.sourceId);
                    room.memory.harvestInfos.push(harvestInfo);
                });
                room.memory.currentMappingType = infoEnum.CONTROL;
            }
            else if (room.memory.currentMappingType == infoEnum.CONTROL)
            {
                var mappedSource = room.memory.mappedSources[room.memory.currentPositionIndex[0]];
                var collectionPositionInfo = mappedSource.collectionPositionInfos[room.memory.currentPositionIndex[1]];
                var controlInfo = controlMapper.mapSingleCollectionPosition(room.controller, collectionPositionInfo, mappedSource.sourceId);
                room.memory.controlInfos.push(controlInfo);

                room.memory.currentPositionIndex[1]++;
                if (room.memory.currentPositionIndex[1] >= mappedSource.collectionPositionInfos.length)
                {
                    room.memory.currentPositionIndex[0]++;
                    room.memory.currentPositionIndex[1] = 0;
                }

                if (room.memory.currentPositionIndex[0] >= room.memory.mappedSources.length)
                {
                    room.memory.finishedMapping = true;
                    creepManager.resetCreepInfos(room);
                }
                room.memory.currentMappingType = infoEnum.SPAWN;
            }
        }
    },
    run: function (room) {

        if (!room.controller.my) {
            return;
        }

        if (!room.memory.addedFirstExtension && room.memory.finishedMapping && room.controller.level > 0)
        {
            room.memory.addedFirstExtension = addExtensionInfo(room);
        }

        creepManager.run(room, room.memory.finishedMapping);

        
    },
    cleanUp: function(room, deadCreepNames)
    {
        deadCreepNames.forEach(function(name, i) {
            var reservedKeysOfDead = Object.keys(room.memory.reservedSources)
                .filter(key => room.memory.reservedSources[key] && room.memory.reservedSources[key].name === name);
            reservedKeysOfDead.forEach(key => room.memory.reservedSources[key] = null);
            if (Memory.creeps[name].harvestInfoIndex)
            {
                var nameIndex = room.memory.harvestInfos[Memory.creeps[name].harvestInfoIndex].creepNames.indexOf(name);
                room.memory.harvestInfos[Memory.creeps[name].harvestInfoIndex].creepNames.splice(nameIndex, 1);
                creepManager.removeUsageFromInfo(room, room.memory.harvestInfos[Memory.creeps[name].harvestInfoIndex],
                    Memory.creeps[name].creepInfo);
            }
            else if (Memory.creeps[name].controlInfoIndex)
            {
                var nameIndex = room.memory.controlInfos[Memory.creeps[name].controlInfoIndex].creepNames.indexOf(name);
                room.memory.controlInfos[Memory.creeps[name].controlInfoIndex].creepNames.splice(nameIndex, 1);
                creepManager.removeUsageFromInfo(room, room.memory.controlInfos[Memory.creeps[name].controlInfoIndex],
                    Memory.creeps[name].creepInfo);
            }
            delete Memory.creeps[name];
            
        });
        
    }
};

module.exports = roomManager;
