var mapUtils = require('mapUtils');

var linkingMaxCost = 4;

var sourceMapper = {
    mapSource: function (originalSource) {
        var mappedSource = {}
        mappedSource.sourceId = originalSource.id;
        var collectionPositions = [];
        var possiblePositions = mapUtils.getAdjacentRoomPositions(originalSource.pos);
        for (var index in possiblePositions) {
            if (mapUtils.isWalkableTerrain(possiblePositions[index])) {
                collectionPositions.push(possiblePositions[index]);
            }
        }
        mappedSource.collectionPositionInfos = [];

        collectionPositions.forEach(function (originalPos)
        {
            var linkedCollectionPositions = [];
            collectionPositions.forEach(function (linkPos)
            {
                if (mapUtils.getComparableRoomPosition(originalPos) != mapUtils.getComparableRoomPosition(linkPos))
                {
                    var linkPathResults = mapUtils.findPath(originalPos, linkPos);
                    if (!linkPathResults.incomplete && linkPathResults.cost <= linkingMaxCost)
                    {
                        linkedCollectionPositions.push(linkPos);
                    }
                }
            });

            mappedSource.collectionPositionInfos.push({
                originalPos: originalPos,
                linkedCollectionPositions: linkedCollectionPositions,
                sourceId: originalSource.id
            });
        });

        return mappedSource;
    }
};

module.exports = sourceMapper;