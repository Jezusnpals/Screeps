var explorationManager = require('explorationManager');

var watch =
{
    run: function (creep)
    {
        if (!creep.memory.RoomToWatch)
        {
            var roomToWatch = explorationManager.getNextRoomToWatch()
            creep.memory.RoomToWatch = roomToWatch;
            explorationManager.reserveRoom(roomToWatch);
        }

        if (creep.memory.RoomToWatch === creep.room.name)
        {
            explorationManager.mapRoom(creep.room);
        }
        else
        {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.RoomToWatch));
        }
    }
};

module.exports = watch;