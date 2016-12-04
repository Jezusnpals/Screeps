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
        var positionInfo = {
            originalPos: null,
            linkedCollectionPositions: null,
            harvestPathFromId: -1
        };

        var matchingSources = room.memory.mappedSources.filter(ms => ms.sourceId);
        if (matchingSources.length > 0) {
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
    }
};

module.exports = roomManager;
