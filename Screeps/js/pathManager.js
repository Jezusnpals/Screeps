var mapUtils = require('mapUtils');

var pathManager =
{
    initialize:function()
    {
        Memory.pathManager = {
            harvestPathTo: [],
            harvestPathFrom: []
        };
    },
    addHarvestPathTo:function(path)
    {
        Memory.pathManager.harvestPathTo.push(path);
        return Memory.pathManager.harvestPathTo.length - 1;
    },
    addHarvestPathFrom:function(path)
    {
        Memory.pathManager.harvestPathFrom.push(path);
        return Memory.pathManager.harvestPathFrom.length - 1;
    },
    getHarvestPathToByIndex:function(index)
    {
        if (index < 0 || index >= Memory.pathManager.harvestPathTo.length)
        {
            return [];
        }
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.harvestPathTo[index]);
    },
    getHarvestPathFromByIndex:function(index)
    {
        if (index < 0 || index >= Memory.pathManager.harvestPathFrom.length)
        {
            return [];
        }
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.harvestPathFrom[index]);
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