var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');


var spawnMapper = {
    harvestCreepCostDivisor: 12,
    mapSingleCollectionPosition:function(spawn, collectionPositionInfo, sourceId)
    {
        var mappedInfo = infoMapper.calculateMappedInfo(spawn.pos, collectionPositionInfo, 0, infoEnum.SPAWN,
                spawnMapper.harvestCreepCostDivisor, sourceId);
        mappedInfo.spawnId = spawn.id;
        return mappedInfo;
    }
}

module.exports = spawnMapper;

