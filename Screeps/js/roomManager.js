var mapUtils = require('mapUtils');
var sourceMapper = require('sourceMapper');
var spawnMapper = require('spawnMapper');
var controlMapper = require('controlMapper');
var creepManager = require('creepManager');
var infoEnum = require('infoEnum');
var behaviorEnum = require('behaviorEnum');
var explorationManager = require('explorationManager');

var roomManager =
{
    createdConstructionSites: false,
    initialize: function (room, spawns) {
        room.memory.initialized = true;
        room.memory.mappedSources = [];
        room.memory.Infos = {};
        room.memory.Infos[behaviorEnum.HARVESTER] = {};
        room.memory.Infos[behaviorEnum.UPGRADER] = {};
        room.memory.Infos[behaviorEnum.BUILDER] = {};
        room.memory.pendingExtensionInfos = [];
        room.memory.reservedSources = {};
        room.memory.extensionsCount = 0;
        room.memory.extensionKeys = [];
        
        var sources = room.find(FIND_SOURCES);
        for (var index in sources)
        {
            var mappedSource = sourceMapper.mapSource(sources[index]);
            room.memory.mappedSources.push(mappedSource);
        }

        room.memory.currentMappingIndex = [0,0];
        room.memory.finishedMapping = false;
        room.memory.addedFirstExtension = false;
        
        room.memory.currentMappingType = infoEnum.SPAWN;

        creepManager.initialize(room, room.memory.mappedSources);
    },
    completePendingExtensionInfos: function(room) 
    {
        for (let i = 0; i < room.memory.pendingExtensionInfos.length; i++)
        {
            var pendingExtensionInfo = room.memory.pendingExtensionInfos[i];
            var refreshExtensionPosition = mapUtils.refreshRoomPosition(pendingExtensionInfo.extensionPosition);
            var extensionConstructionSite = room.lookAt(refreshExtensionPosition).filter(e => e.type === 'constructionSite')[0];
            if (!extensionConstructionSite)
                continue;
            var currentExtensionId = extensionConstructionSite.constructionSite ? extensionConstructionSite.constructionSite.id : null;
            if (currentExtensionId)
            {
                pendingExtensionInfo.structureId = currentExtensionId;
                var extentionKey = pendingExtensionInfo.key;
                room.memory.Infos[behaviorEnum.BUILDER][extentionKey] = pendingExtensionInfo;
                room.memory.extensionKeys.push(extentionKey);
                room.memory.pendingExtensionInfos.splice(i, 1);
                i--;
            }
        };
    },
    addExtensionInfo: function (room)
    {
        var maxExtensions = (room.controller.level-1) * 5;
        if (room.memory.extensionsCount + 1 > maxExtensions) 
        {
            return false;
        }
            
        var extensionInfo = creepManager.calculateNextExtensionInfo(room);
        if (!extensionInfo) 
        {
            return false;
        }
           
        var constructionSiteResult = room.createConstructionSite(extensionInfo.extensionPosition, STRUCTURE_EXTENSION);

        if (constructionSiteResult === OK)
        {
            room.memory.extensionsCount++;;
            room.memory.pendingExtensionInfos.push(extensionInfo);
            return true;
        }

        return false;
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

        if (room.memory.finishedMapping && room.controller.level > 1 &&
            room.memory.pendingExtensionInfos.length === 0)
        {
            room.memory.addedFirstExtension = roomManager.addExtensionInfo(room);
        }

        roomManager.completePendingExtensionInfos(room);

        creepManager.run(room, room.memory.finishedMapping);

        
    },
    cleanUp: function(room, deadCreepNames)
    {
        deadCreepNames.forEach(function (name, i)
        {
            var reservedKeysOfDead = Object.keys(room.memory.reservedSources)
                .filter(key => room.memory.reservedSources[key] && room.memory.reservedSources[key].name === name);
            reservedKeysOfDead.forEach(key => room.memory.reservedSources[key] = null);

            var creepMemory = Memory.creeps[name];

            if (creepMemory.role === "WORKER")
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
                creepManager.removeUsageFromInfo(room, currentInfo, creepMemory.creepInfo);
            }
            else if (creepMemory.role === "EXPLORER")
            {
                explorationManager.unReserveRoom(name);
            }

            delete Memory.creeps[name];
        });
        
    }
};

module.exports = roomManager;
