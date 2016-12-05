var mapUtils = require('mapUtils');

var pathManager =
{
    initialize:function()
    {
        Memory.pathManager = {
            pathToList: [],
            pathFromList: []
        };
    },
    addPathTo:function(path)
    {
        Memory.pathManager.pathToList.push(path);
        return Memory.pathManager.pathToList.length - 1;
    },
    addPathFrom:function(path)
    {
        Memory.pathManager.pathFromList.push(path);
        return Memory.pathManager.pathFromList.length - 1;
    },
    getPathTo:function(index)
    {
        if (index < 0 || index >= Memory.pathManager.pathToList.length)
        {
            return [];
        }
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.pathToList[index]);
    },
    getPathFrom:function(index)
    {
        if (index < 0 || index >= Memory.pathManager.pathFromList.length)
        {
            return [];
        }
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.pathFromList[index]);
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