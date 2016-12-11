var mapUtils = require('mapUtils');

var pathManager =
{
    initialize:function()
    {
        Memory.pathManager = {
            terrainPathDictonary: {},  
        };                        
    },
    getKey: function(startPosition, goalPosition)
    {
        return mapUtils.getComparableRoomPosition(startPosition) + ' ' + mapUtils.getComparableRoomPosition(goalPosition);
    },
    calculatePathTerrain: function(path) 
    {
        var numberOfPlains = 0;
        var numberOfSwamps = 0;
        path.forEach(function(pos) 
        {
            var terrain = Game.map.getTerrainAt(pos);
            if (terrain === 'plain') 
            {
                numberOfPlains++;
            } else if (terrain = 'swamp') 
            {
                numberOfSwamps++;
            }
        });

        return {
            path: path,
            swampsCount: numberOfSwamps,
            plainsCount: numberOfPlains
        }
    },
    addPath: function (path, goalPosition)
    {
        var pathToKey = pathManager.getKey(path[0], goalPosition);
        Memory.pathManager.terrainPathDictonary[pathToKey] = pathManager.calculatePathTerrain(path);
        return pathToKey;
    },
    getPath: function (key)
    {
        return Memory.pathManager.terrainPathDictonary[key] ? mapUtils.refreshRoomPositionArray(Memory.pathManager.terrainPathDictonary[key].path) : [];
    },
    getTerrainPath: function(key) 
    {
        if (Memory.pathManager.terrainPathDictonary[key]) 
        {
            Memory.pathManager.terrainPathDictonary[key].path = mapUtils.refreshRoomPositionArray(Memory.pathManager.terrainPathDictonary[key].path);
            return Memory.pathManager.terrainPathDictonary[key];
        }
        else
        {
            return null;
        }
    },
    getNextPathPosition: function (pos, path)
    {
        var comparablePos = mapUtils.getComparableRoomPosition(pos);
        var nextPos = path[0];
        for (var i = 0; i < path.length; i++)
        {
            if (mapUtils.getComparableRoomPosition(path[i]) === comparablePos) {
                if (i + 1 < path.length)
                {
                    nextPos = path[i + 1];
                }
                break;
            }
        };

        return nextPos;
    },
    calculateNumberOfRemaingPathPositions: function (pos, path)
    {
        var comparablePos = mapUtils.getComparableRoomPosition(pos);
        for (var i = 0; i < path.length; i++)
        {
            if (mapUtils.getComparableRoomPosition(path[i]) === comparablePos)
            {
                return path.length - i;
            }
        }
        return 0;
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
    }
};

module.exports = pathManager;