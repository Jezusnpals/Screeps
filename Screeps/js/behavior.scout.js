var creepUtils = require('creepUtils');
var behaviorEnum = require('behaviorEnum');
var explorationManager = require('explorationManager');

function findRoomToScout(creep)
{
    var roomToScout = explorationManager.getNextRoomToExplore(creep);

    if (!roomToScout)
    {
        return false;
    }

    creep.memory.ScoutRoomName = roomToScout;
    explorationManager.reserveRoom(creep, roomToScout);
    return true;
}

function checkForScoutableRoom(creep)
{
    var hasScoutRoom = creep.memory.ScoutRoomName;
    if (!hasScoutRoom)
    {
        var findRoomToScoutResult = findRoomToScout(creep);
        if (!findRoomToScoutResult)
        {
            return false;
        }
    }

    var inScoutingRoom = creep.memory.ScoutRoomName === creep.room.name;
    if (inScoutingRoom)
    {
        explorationManager.onRoomExplored(creep.room.name);
        explorationManager.unReserveRoom(creep.name);
        creep.memory.ScoutRoomName = null;
        var findRoomToScoutResult = findRoomToScout(creep);
        if (!findRoomToScoutResult)
        {
            return false;
        }
    }

    return true;
}

var scout =
{
    run: function (creep)
    {
        if (!checkForScoutableRoom(creep))
        {
            return;
        }
        
        var scoutPosition = new RoomPosition(25, 25, creep.memory.ScoutRoomName);

        creep.moveTo(scoutPosition);
    }
};

module.exports = scout;