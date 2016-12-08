var mapUtils = require('mapUtils');

function getKey(startPosition, endPosition)
{
    return mapUtils.getComparableRoomPosition(startPosition) + ' ' + mapUtils.getComparableRoomPosition(endPosition);
}

var pathManager =
{
    initialize:function()
    {
        Memory.pathManager = {
            pathToList: [],
            pathFromList: [],
            pathFromDictionary: {}, 
            pathToDictonary: {}    
        };                        
    },
    addPathTo: function (path)
    {
        Memory.pathManager.pathToList.push(path);
        var pathIndex = Memory.pathManager.pathToList.length - 1;
        var pathToKey = getKey(path[0], path[path.length-1]);
        Memory.pathManager.pathToDictonary[pathToKey] = pathIndex;
        return pathIndex;
    },
    addPathFrom: function (path)
    {
        Memory.pathManager.pathFromList.push(path);
        var pathIndex = Memory.pathManager.pathFromList.length - 1;
        var pathFromKey = getKey(path[0], path[path.length - 1]);
        Memory.pathManager.pathFromDictionary[pathFromKey] = pathIndex;
        return pathIndex;
    },
    getPathTo:function(index)
    {
        if (index < 0 || index >= Memory.pathManager.pathToList.length)
        {
            return [];
        }
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.pathToList[index]);
    },
    getPathToIndex:function(startPosition, goalPosition)
    {
        var pathToKey = getKey(startPosition, goalPosition);
        var pathToIndex = Memory.pathManager.pathToDictonary[pathToKey];
        return pathToIndex;
    },
    getPathFrom:function(index)
    {
        if (index < 0 || index >= Memory.pathManager.pathFromList.length)
        {
            return [];
        }
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.pathFromList[index]);
    },
    getPathFromIndex: function (startPosition, goalPosition)
    {
        var pathFromKey = getKey(startPosition, goalPosition);
        var pathFromIndex = Memory.pathManager.pathFromDictionary[pathFromKey];
        return pathFromIndex;
    },
    getNextPathPosition: function (pos, path)
    {
        var comparablePos = mapUtils.getComparableRoomPosition(pos);
        var nextPos = path[0];
        for (var i = 0; i < path.length; i++)
        {
            if (mapUtils.getComparableRoomPosition(path[i]) == comparablePos) {
                if (i + 1 < path.length)
                {
                    nextPos = path[i + 1];
                }
                break;
            }
        };

        return nextPos;
    }
};

module.exports = pathManager;