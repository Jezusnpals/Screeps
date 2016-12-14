var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');

const extensionSearchRange = 5;

var extensionMapper = {
    mapExtension: function (collectionPositionInfo, sourceId)
    {
        var possibleExtensionPositions = mapUtils.getAdjacentRoomPositions(collectionPositionInfo.originalPos, extensionSearchRange);
        var relatedPathPositions = pathManager.getRelatedPathPositions(collectionPositionInfo.originalPos);
        possibleExtensionPositions.filter(pos => mapUtils.isWalkableTerrain(pos));
        possibleExtensionPositions = mapUtils.filterPositionsFromArray(possibleExtensionPositions, relatedPathPositions);
        var currentLowestCost = -1;
        var currentBestPosition = null;
        possibleExtensionPositions.forEach(function (pos)
        {
            var pathResults = mapUtils.findPath(collectionPositionInfo.originalPos, pos, [], [], 200);
            if(!pathResults.incomplete && (currentLowestCost === -1 ||pathResults.cost < currentLowestCost)) 
            {
                currentLowestCost = cost;
                currentBestPosition = pos;
            }
        });
        if (currentBestPosition == null)
        {
            //increase range, try again
            return null;
        }
        else
        {
            return infoMapper.calculateMappedInfo(currentBestPosition, collectionPositionInfo, 3, infoEnum.EXTENSION, sourceId);
        }
    }
};

module.exports = sourceMapper;