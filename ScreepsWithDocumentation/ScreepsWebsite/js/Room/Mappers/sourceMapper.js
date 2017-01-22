var mapUtils = require('mapUtils');

var linkingMaxCost = 10; //Need to link across sources, possibly later step

var sourceMapper =
    {
        mapSource: function (originalSource)
        {
        var mappedSource = {}
        mappedSource.sourceId = originalSource.id;
        var possiblePositions = mapUtils.getAdjacentRoomPositions(originalSource.pos);
        var collectionPositions = possiblePositions.filter(pp => mapUtils.isWalkableTerrain(pp));
        mappedSource.collectionPositionInfos = collectionPositions
                    .map(function (cp) { return { originalPos: cp, sourceId: originalSource.id}});
        return mappedSource;
        },
        calculateLinkedCollectionPositions: function(mappedSources) 
        {
            var allCollectionPositions = mappedSources.map(ms => ms.collectionPositionInfos
                                         .map(cpi => cpi.originalPos))
                                         .reduce((positions1, positions2) => positions1.concat(positions2));
            mappedSources.forEach(ms => ms.collectionPositionInfos.forEach(function (collectionPositionInfo)
            {
                var comparableOriginalPos = mapUtils.getComparableRoomPosition(collectionPositionInfo.originalPos);
                collectionPositionInfo.linkedCollectionPositions = allCollectionPositions
                    .filter(lp => mapUtils.getComparableRoomPosition(lp) !== comparableOriginalPos)
                    .filter(function(lp) {
                        var linkPathResults = mapUtils.findPath(collectionPositionInfo.originalPos, lp);
                        return !linkPathResults.incomplete && linkPathResults.cost < linkingMaxCost;
                    });
            }));
        }
};

module.exports = sourceMapper;