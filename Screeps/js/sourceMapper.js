var mapUtils = require('mapUtils');

var linkingMaxCost = 6;

var sourceMapper = {
    mapSource: function (originalSource) {
        var mappedSource = {}
        mappedSource.sourceId = originalSource.id;
        var collectionPositions = [];
        var possiblePositions = mapUtils.getAdjacentRoomPositions(originalSource.pos);
        for (var index in possiblePositions) {
            if (mapUtils.isWalkableTerrain(possiblePositions[index])) {
                collectionPositions.push(possiblePositions[index])
            }
        }
        mappedSource.collectionPositionInfos = [];


        collectionPositions.forEach(function (originalPos) {
            var linkedCollectionPositions = [];
            collectionPositions.forEach(function (linkPos) {
                var linkPathResults = mapUtils.getPath(originalPos, linkPos);
                if (!linkPathResults.incomplete && linkPathResults.cost <= linkingMaxCost) {
                    linkedCollectionPositions.push(linkPos);
                }
            });

            mappedSource.collectionPositionInfos.push({
                originalPos: originalPos,
                linkedCollectionPositions: linkedCollectionPositions
            });
        });

        return mappedSource;
    }
};

module.exports = sourceMapper;