var explorationRepository = require('explorationRepository');
var explorationUtils = require('explorationUtils');
var behaviorEnum = require('behaviorEnum');
var creepUtils = require('creepUtils');

function findRoomToScout(creep)
{
    var roomToScout = explorationUtils.getNextRoomToExplore(creep);

    if (!roomToScout)
    {
        return false;
    }

    creep.memory.scoutRoomName = roomToScout;
    creep.memory.roomPathKey = null;
    explorationRepository.reserveRoom(creep, roomToScout);
    return true;
}

function checkForScoutableRoom(creep)
{
    var hasScoutRoom = creep.memory.scoutRoomName;
    if (!hasScoutRoom)
    {
        var findRoomToScoutResult = findRoomToScout(creep);
        if (!findRoomToScoutResult)
        {
            return false;
        }
    }

    var inScoutingRoom = creep.memory.scoutRoomName === creep.room.name;
    if (inScoutingRoom)
    {
        explorationUtils.addRoomExplored(creep.room);
        explorationRepository.unReserveRoom(creep.name);
        creep.memory.scoutRoomName = null;
        creep.memory.roomPathKey = null;
        creep.pathToExitKey = null;
        var findRoomToScoutResult = findRoomToScout(creep);
        if (!findRoomToScoutResult)
        {
            return false;
        }
    }

    return true;
}

function switchToWatch(creep)
{
    creep.memory.behavior = behaviorEnum.WATCH;
    creep.memory.scoutRoomName = null;
    creep.memory.roomPathKey = null;
    creep.memory.pathToExitKey = null;
}

var explorer =
{
    run: function (creep)
    {
        if (!checkForScoutableRoom(creep))
        {
            if (creep.name === 'cS1485193491466') {
                console.log('no scout  ' + creep.memory.scoutRoomName);
            }
            switchToWatch(creep);
            return;
        }
        if (creep.name === 'cS1485193491466')
        {
            console.log('scouting room: ' + creep.memory.scoutRoomName);
        }
        creepUtils.followRoomPath(creep, creep.memory.scoutRoomName);
    }
};

module.exports = explorer;