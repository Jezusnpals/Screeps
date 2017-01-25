var mapUtils = require('mapUtils');
var pathRepository = require('pathRepository');

var pathUtils =
{
    getKey: function (startPosition, goalPosition)
    {
        return mapUtils.getComparableRoomPosition(startPosition) + ' ' + mapUtils.getComparableRoomPosition(goalPosition);
    },
    calculatePathTerrain: function (path)
    {
        var numberOfPlains = 0;
        var numberOfSwamps = 0;
        for (var index = 1; index < path.length - 1; index++) //don't include the start or end position
        {
            var terrain = Game.map.getTerrainAt(path[index]);
            if (terrain === 'plain') {
                numberOfPlains++;
            }
            else if (terrain === 'swamp') {
                numberOfSwamps++;
            }
        }

        return {
            path: path,
            swampsCount: numberOfSwamps,
            plainsCount: numberOfPlains
        }
    },
    addPathTerrainPath: function (path, goalPosition)
    {
        var pathKey = pathUtils.getKey(path[0], goalPosition);
        pathRepository.addPathTerrainPath(pathUtils.calculatePathTerrain(path), pathKey);
        return pathKey;
    },
    getNextPathPosition: function (pos, path)
    {
        var comparablePos = mapUtils.getComparableRoomPosition(pos);
        var nextPos = null;
        for (var i = 0; i < path.length; i++)
        {
            if (mapUtils.getComparableRoomPosition(path[i]) === comparablePos)
            {
                if (i + 1 < path.length)
                {
                    nextPos = path[i + 1];
                }
                break;
            }
        };

        return nextPos;
    },
    calculateTerrainPathCostToSource: function (terrainPath, creepInfo)
    {
        return (terrainPath.swampsCount * creepInfo.moveToSourceOnSwampRate) +
            (terrainPath.plainsCount * creepInfo.moveToSourceOnPlainRate);
    },
    calculateTerrainPathCostFromSource: function (terrainPath, creepInfo)
    {
        return (terrainPath.swampsCount * creepInfo.moveFromSourceOnSwampRate) +
            (terrainPath.plainsCount * creepInfo.moveFromSourceOnPlainRate);
    },
    getRelatedPathPositions(originPosition)
    {
        var comparablePoint = mapUtils.getComparableRoomPosition(originPosition);
        var relatedPathKeys = pathRepository.getTerrainPathKeys()
                                    .filter(key => key.includes(comparablePoint));
        var relatedPaths = relatedPathKeys.map(key => pathRepository.getPath(key));
        var relatedPositions = relatedPaths.reduce((p1, p2) => p1.concat(p2));
        return relatedPositions;
    }
};

module.exports = pathUtils;