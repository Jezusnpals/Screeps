var mapUtils = require('mapUtils');

var pathManager =
{
    initialize:function()
    {
        Memory.pathManager = {
            pathDictionary: {},  
        };                        
    },
    getKey: function(startPosition, goalPosition)
    {
        return mapUtils.getComparableRoomPosition(startPosition) + ' ' + mapUtils.getComparableRoomPosition(goalPosition);
    },
    addPath: function (path, goalPosition)
    {
        var pathToKey = pathManager.getKey(path[0], goalPosition);
        Memory.pathManager.pathDictionary[pathToKey] = path;
        return pathToKey;
    },
    getPath: function (key)
    {
        return Memory.pathManager.pathDictionary[key] ? Memory.pathManager.pathDictionary[key] : [];
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
    }
};

module.exports = pathManager;