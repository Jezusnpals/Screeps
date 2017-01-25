var explorationRepository = require('explorationRepository');
var explorationUtils = require('explorationUtils');
var creepUtils = require('creepUtils');
var behaviorEnum = require('behaviorEnum');

function switchToScout(creep)
{
    creep.memory.behavior = behaviorEnum.EXPLORER;
    creep.memory.roomToWatch = null;
    creep.memory.roomPath = null;
    creep.memory.pathToExit = null;
}

var watch =
{
    run: function (creep)
    {
        if (!creep.memory.roomToWatch)
        {
            if (!explorationUtils.checkExistAvailableRoomToWatch())
            {
                switchToScout(creep);
                return;
            }
            var roomToWatch = explorationUtils.getNextRoomToWatch();
            creep.memory.roomToWatch = roomToWatch;
            explorationRepository.reserveRoom(creep, roomToWatch);
        }

        if (creep.memory.roomToWatch !== creep.room.name)
        {
            creepUtils.followRoomPath(creep, creep.memory.roomToWatch);
        }
    }
};

module.exports = watch;