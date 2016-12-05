var mapUtils = require('mapUtils');
var pathManager = require('pathManager');

var infoMapper = {
    calculateMappedInfo: function (startPosition, collectionPosition) {
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
                mappedInfo.pathFromId = pathManager.addHarvestPathFrom(pathFromResults.path);
            }
            else {
                mappedInfo.pathFromId = pathManager.addHarvestPathFrom(pathFromResults.path);
                mappedInfo.isSeperateReturnPath = true;
            }
        }

        return mappedInfo;
    },
    calculateNumberOfCreepsForNoReturnPath: function (infosWithoutReturnPath, baseCreepCostDivisor) {
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
                var creepCostFromDivisor = baseCreepCostDivisor + (collidingInfos.length * collidingBlockingPoints);
                infoIndexPair.info.maxCreeps = 1 + Math.floor(infoIndexPair.info.costTo / creepCostFromDivisor);
                infosWithoutReturnPath.splice(infoIndexPair.index, 1);
            })
        }
    }
    };

module.exports = infoMapper;

