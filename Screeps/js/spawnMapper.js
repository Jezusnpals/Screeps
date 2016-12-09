var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');


var spawnMapper = {
    harvestCreepCostDivisor: 12,
    mapAllPathsToCollectionPosition: function (spawn, collectionPosition)
    {
        infoMapper.mapAllPathsTo(spawn.pos, collectionPosition, 1, infoEnum.SPAWN);
    },
    mapSingleCollectionPosition:function(spawn, collectionPositionInfo, sourceId)
    {
        this.mapAllPathsToCollectionPosition(spawn, collectionPositionInfo.originalPos);
        var mappedInfo = infoMapper.calculateMappedInfo(spawn.pos, collectionPositionInfo, 1, infoEnum.SPAWN,
                spawnMapper.harvestCreepCostDivisor, sourceId);
        mappedInfo.spawnId = spawn.id;
        return mappedInfo;
    }
}

module.exports = spawnMapper;

