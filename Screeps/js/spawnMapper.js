var mapUtils = require('mapUtils');
var pathManager = require('pathManager');

var harvestCreepCostToDivisor = 12;

function calculateMappedInfo(startPosition, collectionPosition) {
    var mappedInfo = {
        startPosition: startPosition,
        collectionPosition: collectionPosition,
        pathToId: -1,
        costTo: -1,
        isSeperateReturnPath: false,
        returnPathBlockers: [],
        canGetTo: false,
        pathFromId: -1
    };

    var pathToResults = mapUtils.findPath(startPosition, collectionPosition);

    if (!pathToResults.incomplete) {
        mappedInfo.pathToId = pathManager.addHarvestPathTo(pathToResults.path);
        mappedInfo.costTo = pathToResults.cost;
        mappedInfo.canGetTo = true;

        var pathToAvoid = pathToResults.path.slice();
        mapUtils.removeRoomPositionFromArray(pathToAvoid, startPosition);
        mapUtils.removeRoomPositionFromArray(pathToAvoid, collectionPosition);

        var pathFromResults = mapUtils.findPath(collectionPosition, startPosition, pathToAvoid);

        if (pathFromResults.incomplete) {
            mappedInfo.isSeperateReturnPath = false;

            pathFromResults = mapUtils.findPath(collectionPosition, startPosition, [], pathToAvoid);
            mappedInfo.returnPathBlockers = mapUtils.getSameRoomPositionsFromArray(pathFromResults.path, pathToAvoid);
            pathFromId = pathManager.addHarvestPathFrom(pathFromResults.path);
        }
        else {
            mappedInfo.pathFromId = pathManager.addHarvestPathFrom(pathFromResults.path);
            mappedInfo.isSeperateReturnPath = true;
        }
    }

    return mappedInfo;
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
                var mappedInfo = calculateMappedInfo(spawn.pos, collectionPositionInfo.originalPos);
                collectionPositionInfo.harvestPathFromId = mappedInfo.pathFromId;
                var harvestInfo = {
                    sourceId: mappedSource.sourceId,
                    spawnId: spawn.id,
                    creepNames: [],
                    maxHarvesters: 1 + Math.floor(mappedInfo.costTo / harvestCreepCostToDivisor),
                    pathToId: mappedInfo.pathToId,
                    linkedCollectionPositions: collectionPositionInfo.linkedCollectionPositions,
                    costTo: mappedInfo.costTo,
                    isSeperateReturnPath: mappedInfo.isSeperateReturnPath,
                    canGetTo: mappedInfo.canGetTo,
                    returnPathBlockers: mappedInfo.returnPathBlockers,
                    isSeperateReturnPath: mappedInfo.isSeperateReturnPath,
                    collectionPosition: mappedInfo.collectionPosition
                }
                harvestInfos.push(harvestInfo);
            });

        });

        var infosWithoutReturnPath = harvestInfos.filter(info => !info.isSeperateReturnPath);
        calculateNumberOfCreepsForNoReturnPath(infosWithoutReturnPath);

        return harvestInfos;
    }
}

module.exports = spawnMapper;

