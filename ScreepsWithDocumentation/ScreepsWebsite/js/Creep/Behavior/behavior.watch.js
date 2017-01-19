var explorationRepository = require('explorationRepository');
var explorationUtils = require('explorationUtils');

var watch =
{
    run: function (creep)
    {
        if (!creep.memory.RoomToWatch)
        {
            if (!explorationUtils.checkExistAvailableRoomToWatch())
            {
                console.log('WARNING: watcher without room to watch');
                return;
            }
            var roomToWatch = explorationUtils.getNextRoomToWatch();
            creep.memory.RoomToWatch = roomToWatch;
            explorationRepository.reserveRoom(creep, roomToWatch);
        }

        if (creep.memory.RoomToWatch === creep.room.name)
        {
            explorationUtils.mapRoom(creep.room);
        }
        else
        {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.RoomToWatch));
        }
    }
};

module.exports = watch;