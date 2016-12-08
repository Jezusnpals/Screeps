var mapUtils = require('mapUtils');

function getKey(infoType, startPosition)
{
    return infoType + mapUtils.getComparableRoomPosition(startPosition);
}

var pathManager =
{
    initialize:function()
    {
        Memory.pathManager = {
            pathToList: [],
            pathFromList: [],
            pathFromDictionary: {}, //Dictonary of Info Type + ComparableRoomPosition to Path From Index
            pathToDictonary: {}     //Example: pathFromDictionary['Harvester3230Sim'] = 16
        };                        
    },
    addPathTo: function (infoType, startPosition, path)
    {
        Memory.pathManager.pathToList.push(path);
        var pathIndex = Memory.pathManager.pathToList.length - 1;
        var pathToKey = getKey(infoType, startPosition);
        Memory.pathManager.pathToDictonary[pathToKey] = pathIndex;
        return pathIndex;
    },
    addPathFrom:function(infoType,startPosition, path)
    {
        Memory.pathManager.pathFromList.push(path);
        var pathIndex = Memory.pathManager.pathFromList.length - 1;
        var pathFromKey = getKey(infoType, startPosition);
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
    getPathToIndex:function(infoType, startPosition)
    {
        var pathToKey = getKey(infoType, startPosition);
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
    getPathFromIndex: function (infoType, startPosition)
    {
        var pathFromKey = getKey(infoType, startPosition);
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