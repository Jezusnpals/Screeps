var mapUtils = require('mapUtils');
var sourceMapper = require('sourceMapper');
var spawnMapper = require('spawnMapper');
var controlMapper = require('controlMapper');
var creepManager = require('creepManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');

var roomManager =
{
    createdConstructionSites: false,
    initialize: function (room, spawns) {
        room.memory.initialized = true;
        room.memory.mappedSources = [];
        room.memory.harvestInfos = [];
        room.memory.controlInfos = [];

        var sources = room.find(FIND_SOURCES);
        for (var index in sources)
        {
            var mappedSource = sourceMapper.mapSource(sources[index]);
            room.memory.mappedSources.push(mappedSource);
        }

        room.memory.currentPositionIndex = [0,0];
        room.memory.finishedMapping = false;
        room.memory.mappedMaxCreepsForNoReturnPath = false;
        room.memory.currentMappingType = infoEnum.SPAWN;

        creepManager.initialize(room, room.memory.mappedSources);
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
                }

                if (room.memory.currentPositionIndex[0] >= room.memory.mappedSources.length)
                {
                    room.memory.finishedMapping = true;
                }
                room.memory.currentMappingType = infoEnum.SPAWN;
            }
        }
        else if(!room.memory.mappedMaxCreepsForNoReturnPath)
        {
            var harvestInfosWithNoReturnPath = room.memory.harvestInfos.filter(info => !info.isSeperateReturnPath);
            var controlInfosWithNoReturnPath = room.memory.controlInfos.filter(info => !info.isSeperateReturnPath);

            infoMapper.mapNumberOfCreepsForNoReturnPath(harvestInfosWithNoReturnPath, spawnMapper.harvestCreepCostDivisor);
            infoMapper.mapNumberOfCreepsForNoReturnPath(controlInfosWithNoReturnPath, controlMapper.controlCreepCostDivisor);
        }
    },
    run: function (room) {

        if (!room.controller.my) {
            return;
        }

        creepManager.run(room);

        if (this.createdConstructionSites) {
            room.createConstructionSite(25, 25, STRUCTURE_EXTENSION)
            this.createdConstructionSites = true;
        }
        else {
            room.createConstructionSite(40, 44, STRUCTURE_EXTENSION);
        }
    },
    cleanUp: function(room, deadCreepNames)
    {
        deadCreepNames.forEach(function(name, i)
        {
            if (Memory.creeps[name].harvestInfoIndex)
            {
                var nameIndex = room.memory.harvestInfos[Memory.creeps[name].harvestInfoIndex].creepNames.indexOf(name);
                room.memory.harvestInfos[Memory.creeps[name].harvestInfoIndex].creepNames.splice(nameIndex, 1);
                creepManager.removeUsageFromInfo(room, room.memory.harvestInfos[Memory.creeps[name].harvestInfoIndex]);
                delete Memory.creeps[name];
            }
            else if (Memory.creeps[name].controlInfoIndex)
            {
                var nameIndex = room.memory.controlInfos[Memory.creeps[name].controlInfoIndex].creepNames.indexOf(name);
                room.memory.controlInfos[Memory.creeps[name].controlInfoIndex].creepNames.splice(nameIndex, 1);
                creepManager.removeUsageFromInfo(room, room.memory.controlInfos[Memory.creeps[name].controlInfoIndex]);
                delete Memory.creeps[name];
            }
            
        });
        
    }
};

module.exports = roomManager;
