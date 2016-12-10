var mapUtils = require('mapUtils');
var pathManager = require('pathManager');

var infoMapper = {
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
            linkedCollectionPositions: collectionPositionInfo.linkedCollectionPositions
        };

        var pathToResults = mapUtils.findPath(startPosition, collectionPosition);

        if (!pathToResults.incomplete)
        {
            var pathToWithStartPosition = pathToResults.path;
            pathToWithStartPosition.unshift(startPosition);
            mappedInfo.pathToKey = pathManager.addPath(pathToWithStartPosition, collectionPosition);
            mappedInfo.costTo = pathToResults.cost;
            mappedInfo.canGetTo = true;

            var pathFromGoal = { pos: startPosition, range: returnRange };

            var pathFromResults = mapUtils.findPath(collectionPosition, pathFromGoal);

            var pathFromWithStartPosition = pathFromResults.path;
            pathFromWithStartPosition.unshift(collectionPosition);
            pathManager.addPath(pathFromWithStartPosition, startPosition);
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
                pathManager.addPath(pathWithStartPosition, goalPosition);
            }
        });
    }
    };

module.exports = infoMapper;

