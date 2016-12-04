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
        return mapUtils.refreshRoomPositionArray(Memory.pathManager.harvestPathTo[index]);
    },
    getHarvestPathFromByStartPosition:function(startPosition)
    {
        var matchingPathsFrom = Memory.pathManager.harvestPathFrom.filter(path => path.length > 0 &&
            mapUtils.getComparableRoomPosition(path[0]) == startPosition);
        if (matchingPathsFrom.length == 1)
        {
            return mapUtils.refreshRoomPositionArray(matchingPathsFrom[0]);
        }
        else
        {
            return null;
        }
    }
};

module.exports = pathManager;