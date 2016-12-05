var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');

var harvestCreepCostToDivisor = 12;

var spawnMapper = {
    mapSpawn: function (spawn, mappedSources) {
        var harvestInfos = [];

        mappedSources.forEach(function (mappedSource) {
            mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo) {
                var mappedInfo = infoMapper.calculateMappedInfo(spawn.pos, collectionPositionInfo.originalPos);
                collectionPositionInfo.harvestPathFromId = mappedInfo.pathFromId;
                var harvestInfo = {
                    sourceId: mappedSource.sourceId,
                    spawnId: spawn.id,
                    creepNames: [],
                    maxCreeps: 1 + Math.floor(mappedInfo.costTo / harvestCreepCostToDivisor),
                    pathToId: mappedInfo.pathToId,
                    linkedCollectionPositions: collectionPositionInfo.linkedCollectionPositions,
                    costTo: mappedInfo.costTo,
                    isSeperateReturnPath: mappedInfo.isSeperateReturnPath,
                    canGetTo: mappedInfo.canGetTo,
                    returnPathBlockers: mappedInfo.returnPathBlockers,
                    collectionPosition: mappedInfo.collectionPosition
                }
                harvestInfos.push(harvestInfo);
            });
        });

        var infosWithoutReturnPath = harvestInfos.filter(info => !info.isSeperateReturnPath);
        infoMapper.calculateNumberOfCreepsForNoReturnPath(infosWithoutReturnPath, harvestCreepCostToDivisor);

        return harvestInfos;
    }
}

module.exports = spawnMapper;

