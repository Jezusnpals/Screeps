var mapUtils = require('mapUtils');
var pathUtils = require('pathUtils');
var collectionInfoMapper = require('collectionInfoMapper');
var infoEnum = require('infoEnum');

const extensionSearchRange = 8;

var extensionMapper = {
    mapExtension: function(collectionPositionInfo, sourceId, allCollectionPositions)
    {

        var possibleExtensionPositions = mapUtils.getAdjacentRoomPositions(collectionPositionInfo.originalPos, extensionSearchRange, 2);
        var relatedPathPositions = pathUtils.getRelatedPathPositions(collectionPositionInfo.originalPos);
        possibleExtensionPositions = possibleExtensionPositions.filter(pos => mapUtils.isWalkableTerrain(pos));
        possibleExtensionPositions = mapUtils.filterPositionsFromArray(possibleExtensionPositions, relatedPathPositions);
        possibleExtensionPositions = mapUtils.filterPositionsFromArray(possibleExtensionPositions, allCollectionPositions);
        possibleExtensionPositions.filter(pep => mapUtils.getAdjacentRoomPositions(pep)
            .every(pos => mapUtils.isWalkableTerrain(pos)));;
        var currentLowestCost = -1;
        var currentBestPosition = null;
        var refreshedOriginalPos = mapUtils.refreshRoomPosition(collectionPositionInfo.originalPos);
        possibleExtensionPositions.forEach(function (pos)
        {
            var rangedPos =
            {
                pos: pos,
                range: 3
            }
            var pathResults = mapUtils.findPath(refreshedOriginalPos, rangedPos, [], [], 200);
            if(!pathResults.incomplete && (currentLowestCost === -1 ||pathResults.cost < currentLowestCost)) 
            {
                currentLowestCost = pathResults.cost;
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
            var mappedInfo = collectionInfoMapper.calculateMappedInfo(currentBestPosition, collectionPositionInfo, 3, infoEnum.BUILD, sourceId);
            mappedInfo.extensionPosition = currentBestPosition;
            return mappedInfo;
        }
    }
};

module.exports = extensionMapper;