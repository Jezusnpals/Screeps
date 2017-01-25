var roomMapper =
{
    mapRoom: function (room) {
        var numberOfHostileCreeps = room.find(FIND_HOSTILE_CREEPS).length;
        var hasController = room.controller ? true : false;
        var isInSafeMode = hasController ? room.controller.safeMode > 0 : false;

        return {
            name: room.name,
            numberOfHostileCreeps: numberOfHostileCreeps,
            hasController: hasController,
            isInSafeMode: isInSafeMode
        }
    }
};

module.exports = roomMapper;