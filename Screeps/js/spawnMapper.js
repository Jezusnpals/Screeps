var mapUtils = require('mapUtils');
var pathManager = require('pathManager');

var harvestCreepCostToDivisor = 12;

function getHarvestInfo(spawnPosition, collectionPosition, linkedCollectionPositions) {
    var pathFromId = -1;
    var harvestInfo = {
        spawnPosition: spawnPosition,
        collectionPosition: collectionPosition,
        creepNames: [],
        pathToId: -1,
        costTo: -1,
        returnPath: [],
        isSeperateReturnPath: false,
        returnPathBlockers: [],
        canGetTo: false,
        maxHarvesters: 0,
        linkedCollectionPositions: linkedCollectionPositions
    };

    var pathToResults = mapUtils.findPath(spawnPosition, collectionPosition);

    if (!pathToResults.incomplete) {
        harvestInfo.pathToId = pathManager.addHarvestPathTo(pathToResults.path);
        harvestInfo.costTo = pathToResults.cost;
        harvestInfo.canGetTo = true;

        var pathToAvoid = pathToResults.path.slice();
        mapUtils.removeRoomPositionFromArray(pathToAvoid, spawnPosition);
        mapUtils.removeRoomPositionFromArray(pathToAvoid, collectionPosition);

        var pathFromResults = mapUtils.findPath(collectionPosition, spawnPosition, pathToAvoid);

        if (pathFromResults.incomplete) {
            harvestInfo.isSeperateReturnPath = false;

            pathFromResults = mapUtils.findPath(collectionPosition, spawnPosition, [], pathToAvoid);
            harvestInfo.returnPathBlockers = mapUtils.getSameRoomPositionsFromArray(pathFromResults.path, pathToAvoid);
            pathFromId = pathManager.addHarvestPathFrom(pathFromResults.path);
        }
        else {
            pathFromId = pathManager.addHarvestPathFrom(pathFromResults.path);
            harvestInfo.isSeperateReturnPath = true;
            harvestInfo.maxHarvesters = 1 + Math.floor(harvestInfo.costTo / harvestCreepCostToDivisor);
        }
    }

    return {
        harvestInfo: harvestInfo,
        pathFromId: pathFromId
    };
}


function calculateNumberOfCreepsForNoReturnPath(infosWithoutReturnPath) {
    while (infosWithoutReturnPath.length > 0) {
        var collidingInfos = [];
        collidingInfos.push({
            info: infosWithoutReturnPath[0],
            index: 0
        });
        var collidingBlockingPoints = 0;
        for (var i = 1; i < infosWithoutReturnPath.length; i++) {
            var sameBlockingPoints = getSameRoomPositionsFromArray(infosWithoutReturnPath[0].returnPathBlockers, infosWithoutReturnPath[i].returnPathBlockers)
            if (sameBlockingPoints.length > 0) {
                collidingBlockingPoints += sameBlockingPoints.length;
                collidingInfos.push({
                    info: infosWithoutReturnPath[i],
                    index: i
                });
            }
        }

        collidingInfos.forEach(function (infoIndexPair) {
            var harvestCreepCostFromDivisor = harvestCreepCostToDivisor + (collidingInfos.length * collidingBlockingPoints);
            infoIndexPair.info.maxHarvesters = 1 + Math.floor(infoIndexPair.info.costTo / harvestCreepCostFromDivisor);
            infosWithoutReturnPath.splice(infoIndexPair.index, 1);
        })
    }
}


var spawnMapper = {
    mapSpawn: function (spawn, mappedSources) {

        var harvestInfos = [];

        mappedSources.forEach(function (mappedSource) {
            mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo) {
                var harvestInfoResults = getHarvestInfo(spawn.pos, collectionPositionInfo.originalPos, collectionPositionInfo.linkedCollectionPositions);
                collectionPositionInfo.harvestPathFromId = harvestInfoResults.pathFromId;
                harvestInfoResults.harvestInfo.sourceId = mappedSource.sourceId; 
                harvestInfoResults.harvestInfo.spawnId = spawn.id;
                harvestInfos.push(harvestInfoResults.harvestInfo);
            });

        });

        var infosWithoutReturnPath = harvestInfos.filter(info => !info.isSeperateReturnPath);
        calculateNumberOfCreepsForNoReturnPath(infosWithoutReturnPath);

        return harvestInfos;
    }
}

module.exports = spawnMapper;

