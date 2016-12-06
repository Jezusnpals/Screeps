var mapUtils = require('mapUtils');
var pathManager = require('pathManager');

var infoMapper = {
    calculateMappedInfo: function (startPosition, collectionPositionInfo, infoType, baseCreepCostDivisor, sourceId)
    {
        var collectionPosition = collectionPositionInfo.originalPos;
        var mappedInfo = {
            creepNames: [],
            collectionPosition: collectionPosition,
            pathToId: -1,
            costTo: -1,
            isSeperateReturnPath: false,
            returnPathBlockers: [],
            canGetTo: false,
            pathFromId: -1,
            type: infoType,
            sourceId: sourceId,
            linkedCollectionPositions: collectionPositionInfo.linkedCollectionPositions
        };

        var pathToResults = mapUtils.findPath(startPosition, collectionPosition);

        if (!pathToResults.incomplete)
        {
            var pathToWithStartPosition = pathToResults.path;
            pathToWithStartPosition.unshift(startPosition);
            mappedInfo.pathToId = pathManager.addPathTo(pathToWithStartPosition);
            mappedInfo.costTo = pathToResults.cost;
            mappedInfo.canGetTo = true;

            var pathToAvoid = pathToResults.path.slice();
            mapUtils.removeRoomPositionFromArray(pathToAvoid, startPosition);
            mapUtils.removeRoomPositionFromArray(pathToAvoid, collectionPosition);

            var pathFromResults = mapUtils.findPath(collectionPosition, startPosition, pathToAvoid);

            if (pathFromResults.incomplete)
            {
                mappedInfo.isSeperateReturnPath = false;

                pathFromResults = mapUtils.findPath(collectionPosition, startPosition, [], pathToAvoid);
                mappedInfo.returnPathBlockers = mapUtils.getSameRoomPositionsFromArray(pathFromResults.path, pathToAvoid);
            }
            else
            {
                mappedInfo.isSeperateReturnPath = true;
            }
            var pathFromWithStartPosition = pathFromResults.path;
            pathFromWithStartPosition.unshift(collectionPosition);
            pathManager.addPathFrom(infoType, collectionPosition, pathFromWithStartPosition)
        }

        mappedInfo.maxCreeps = 1 + Math.floor(mappedInfo.costTo / baseCreepCostDivisor);

        return mappedInfo;
    },
    mapNumberOfCreepsForNoReturnPath: function (infosWithoutReturnPath, baseCreepCostDivisor) {
        while (infosWithoutReturnPath.length > 0) {
            var collidingInfos = [];
            collidingInfos.push({
                info: infosWithoutReturnPath[0],
                index: 0
            });
            var collidingBlockingPoints = 0;
            for (var i = 1; i < infosWithoutReturnPath.length; i++) {
                var sameBlockingPoints = mapUtils.getSameRoomPositionsFromArray(infosWithoutReturnPath[0].returnPathBlockers, infosWithoutReturnPath[i].returnPathBlockers)
                if (sameBlockingPoints.length > 0) {
                    collidingBlockingPoints += sameBlockingPoints.length;
                    collidingInfos.push({
                        info: infosWithoutReturnPath[i],
                        index: i
                    });
                }
            }

            collidingInfos.forEach(function (infoIndexPair) {
                var creepCostFromDivisor = baseCreepCostDivisor + (collidingInfos.length * collidingBlockingPoints);
                infoIndexPair.info.maxCreeps = 1 + Math.floor(infoIndexPair.info.costTo / creepCostFromDivisor);
                infosWithoutReturnPath.splice(infoIndexPair.index, 1);
            })
        }
    }
    };

module.exports = infoMapper;

