var mapUtils = require('mapUtils');
var sourceMapper = require('sourceMapper');
var spawnMapper = require('spawnMapper');
var creepManager = require('creepManager');

var roomManager =
{
    createdConstructionSites: false,
    initialize: function (room, spawns) {
        room.memory.initialized = true;
        room.memory.mappedSources = [];
        room.memory.harvestInfos = [];

        var sources = room.find(FIND_SOURCES);
        for (var index in sources) {
            var mappedSource = sourceMapper.mapSource(sources[index], spawns);
            room.memory.mappedSources.push(mappedSource);
        }

        spawns.forEach(function (spawn) {
            room.memory.harvestInfos = room.memory.harvestInfos.concat(spawnMapper.mapSpawn(spawn, room.memory.mappedSources));
        });

    },
    getCollectionPositionInfo:function(room, pos, sourceId)
    {
        var matchingPositions = room.memory.mappedSources.filter(ms => ms.sourceId).collectionPositionInfos.filter(cpi => 
            mapUtils.getComparableRoomPosition(cpi.originalPos) == mapUtils.getComparableRoomPosition(pos));
        if(matchingPositions.length == 1)
        {
            return matchingPositions[0];
        }
        else
        {
            return {
                originalPos: null,
                linkedCollectionPositions: null,
                harvestFromId: -1
            }
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
    }
};

module.exports = roomManager;
