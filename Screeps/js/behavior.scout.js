var creepUtils = require('creepUtils');
var behaviorEnum = require('behaviorEnum');
var explorationManager = require('explorationManager');

function findRoomToScout(creep)
{
    var roomToScout = explorationManager.findRoomToScout(creep);

    if (!roomToScout)
    {
        return false;
    }

    creep.memory.ScoutRoomName = roomToScout;
    explorationManager.reserveRoom(creep, roomToScout);
    return true;
}

function checkValidScoutRoom(creep)
{
    var hasScoutRoom = creep.memory.ScoutRoomName;
    if (!hasScoutRoom) {
        var findRoomToScoutResult = findRoomToScout(creep);
        if (!findRoomToScoutResult) {
            return;
        }
    }

    var inScoutingRoom = roomToScout === creep.room.name;
    if (inScoutingRoom)
    {
        explorationManager.onRoomExplored(creep.room.name);
        explorationManager.unReserveRoom(creep.name);
        var findRoomToScoutResult = findRoomToScout(creep);
        if (!findRoomToScoutResult)
        {
            return;
        }
    }
}

var scout =
{
    run: function (creep)
    {
        checkValidScoutRoom(creep);
        
        var scoutPosition = new RoomPosition(25, 25, creep.memory.ScoutRoomName);

        creep.moveTo(scoutPosition);
    }
};

module.exports = scout;