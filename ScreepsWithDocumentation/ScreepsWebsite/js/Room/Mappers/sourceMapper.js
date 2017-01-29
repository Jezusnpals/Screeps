var mapUtils = require('mapUtils');

var linkingMaxCost = 10; //Need to link across sources, possibly later step

function calculateLinkedCollectionPositions(mappedSource, collectionPositions)
{
    mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo)
    {
        var comparableOriginalPos = mapUtils.getComparableRoomPosition(collectionPositionInfo.originalPos);
        collectionPositionInfo.linkedCollectionPositions = collectionPositions
            .filter(lp => mapUtils.getComparableRoomPosition(lp) !== comparableOriginalPos)
            .filter(function(lp) {
                var linkPathResults = mapUtils.findPath(collectionPositionInfo.originalPos, lp);
                return !linkPathResults.incomplete && linkPathResults.cost < linkingMaxCost;
            });
    });
}

var sourceMapper =
    {
        mapSource: function (originalSource)
        {
        var mappedSource = {}
        mappedSource.sourceId = originalSource.id;
        var possiblePositions = mapUtils.getAdjacentRoomPositions(originalSource.pos);
        var collectionPositions = possiblePositions.filter(pp => mapUtils.isWalkableTerrain(pp));
        mappedSource.collectionPositionInfos = collectionPositions
                    .map(function (cp) { return { originalPos: cp, sourceId: originalSource.id } });
        calculateLinkedCollectionPositions(mappedSource, collectionPositions);
        return mappedSource;
        },
        
};

module.exports = sourceMapper;