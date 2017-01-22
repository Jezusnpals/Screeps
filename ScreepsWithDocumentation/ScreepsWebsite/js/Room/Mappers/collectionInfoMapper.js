var mapUtils = require('mapUtils');
var pathUtils = require('pathUtils');

var collectionInfoMapper = {
    calculateMappedInfo: function (startPosition, collectionPositionInfo, returnRange, infoType, sourceId)
    {
        var collectionPosition = mapUtils.refreshRoomPosition(collectionPositionInfo.originalPos);
        var mappedInfo = {
            creepNames: [],
            collectionPosition: collectionPosition,
            pathToKey: '',
            costTo: -1,
            canGetTo: false,
            pathFromKey: '',
            type: infoType,
            sourceId: sourceId,
            linkedCollectionPositions: collectionPositionInfo.linkedCollectionPositions,
            key: mapUtils.getComparableRoomPosition(startPosition) + mapUtils.getComparableRoomPosition(collectionPosition)
        };

        var pathToResults = mapUtils.findPath(startPosition, collectionPosition);

        if (!pathToResults.incomplete)
        {
            var pathToWithStartPosition = pathToResults.path;
            pathToWithStartPosition.unshift(startPosition);
            mappedInfo.pathToKey = pathUtils.addPath(pathToWithStartPosition, collectionPosition);
            mappedInfo.costTo = pathToResults.cost;
            mappedInfo.canGetTo = true;

            var pathFromGoal = pathToWithStartPosition.slice().reverse();
            pathFromGoal.splice(pathToWithStartPosition.length - returnRange - 1, returnRange); //remove the elements closer than the range
            mappedInfo.pathFromKey = pathUtils.addPath(pathFromGoal, startPosition);
        }

        return mappedInfo;
    },
    mapAllPathsTo:function(originalPosition, goalPosition, range, infoType)
    {
        goalPosition = mapUtils.refreshRoomPosition(goalPosition);
        var possibleUpgradePositions = mapUtils.getAdjacentRoomPositions(originalPosition, range)
                                               .filter(pos => mapUtils.isWalkableTerrain(pos));
        possibleUpgradePositions.forEach(function (pos)
        {
            var pathToResults = mapUtils.findPath(pos, goalPosition);
            var pathWithStartPosition = pathToResults.path;
            pathWithStartPosition.unshift(pos);
            if (!pathToResults.incomplete)
            {
                pathUtils.addPath(pathWithStartPosition, goalPosition);
            }
        });
    }
    };

module.exports = collectionInfoMapper;

