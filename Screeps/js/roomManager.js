var mapUtils = require('mapUtils');
var sourceMapper = require('sourceMapper');
var spawnMapper = require('spawnMapper');
var controlMapper = require('controlMapper');
var creepManager = require('creepManager');

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

        spawns.forEach(function (spawn)
        {
            room.memory.harvestInfos = room.memory.harvestInfos.concat(spawnMapper.mapSpawn(spawn, room.memory.mappedSources));
        });

        room.memory.controlInfos = controlMapper.mapControl(room.controller, room.memory.mappedSources);
    },
    getCollectionPositionInfo:function(room, pos, sourceId)
    {
        var positionInfo = {
            originalPos: null,
            linkedCollectionPositions: null,
            harvestPathFromId: -1
        };

        var matchingSources = room.memory.mappedSources.filter(ms => ms.sourceId == sourceId);
        if (matchingSources.length == 1) {
            var matchingPositions = matchingSources[0].collectionPositionInfos.filter(cpi =>
                mapUtils.getComparableRoomPosition(cpi.originalPos) == mapUtils.getComparableRoomPosition(pos));
            if (matchingPositions.length == 1) {
                positionInfo = matchingPositions[0];
            }
        }

        return positionInfo;
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
                delete Memory.creeps[name];
            }
            else if (Memory.creeps[name].controlInfoIndex)
            {
                var nameIndex = room.memory.controlInfos[Memory.creeps[name].controlInfoIndex].creepNames.indexOf(name);
                room.memory.controlInfos[Memory.creeps[name].controlInfoIndex].creepNames.splice(nameIndex, 1);
                delete Memory.creeps[name];
            }
            
        });
        
    }
};

module.exports = roomManager;
