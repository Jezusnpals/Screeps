var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');

var harvestCreepCostToDivisor = 12;

var spawnMapper = {
    mapSpawn: function (spawn, mappedSources) {
        var harvestInfos = [];

        mappedSources.forEach(function (mappedSource) {
            mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo) {
                var mappedInfo = infoMapper.calculateMappedInfo(spawn.pos, collectionPositionInfo.originalPos, infoEnum.SPAWN,
                    harvestCreepCostToDivisor, mappedSource.sourceId);
                mappedInfo.spawnId = spawn.id;
                harvestInfos.push(mappedInfo);
            });
        });

        var infosWithoutReturnPath = harvestInfos.filter(info => !info.isSeperateReturnPath);
        infoMapper.calculateNumberOfCreepsForNoReturnPath(infosWithoutReturnPath, harvestCreepCostToDivisor);

        return harvestInfos;
    }
}

module.exports = spawnMapper;

