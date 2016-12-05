var mapUtils = require('mapUtils');

function getPathFromKey(infoType, startPosition)
{
    return infoType + mapUtils.getComparableRoomPosition(path);
}

var pathManager =
{
    initialize:function()
    {
        Memory.pathManager = {
            pathToList: [],
            pathFromList: [],
            pathFromDictionary: {} //Dictonary of Info Type + ComparableRoomPosition to Path From Index
        };                         //Example: pathFromDictionary['Harvester3230Sim'] = 16
    },
    addPathTo:function(path)
    {
        Memory.pathManager.pathToList.push(path);
        return Memory.pathManager.pathToList.length - 1;
    },
    addPathFrom:function(infoType,startPosition, path)
    {
        Memory.pathManager.pathFromList.push(path);
        var pathIndex = Memory.pathManager.pathFromList.length - 1;
        var pathFromKey = getPathFromKey(infoType, startPosition);
        Memory.pathManager.pathFromDictionary[pathFromKey] = pathIndex;
    },
    getPathTo:function(index)
    {
        if (index < 0 || index >= Memory.pathManager.pathToList.length)
        {
            return [];
        }
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.pathToList[index]);
    },
    getPathFrom:function(infoType,startPosition)
    {
        var pathFromKey = getPathFromKey(infoType, startPosition);
        var pathFromIndex = Memory.pathManager.pathFromDictionary[pathFromKey];
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.pathFromList[pathFromIndex]);
    },
    getNextPathPosition:function(pos, path)
    {
        var comparablePos = mapUtils.getComparableRoomPosition(pos);
        path.forEach(function (p, i)
        {
            if(mapUtils.getComparableRoomPosition(p) == comparablePos)
            {
                return (i + 1) < path.length ? path[i + 1] : null;
            }
        });
    }
};

module.exports = pathManager;