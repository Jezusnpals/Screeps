var roomMapper =
{
    mapRoom: function (room) {
        var numberOfHostileCreeps = room.find(FIND_HOSTILE_CREEPS).length;

        return {
            name: room.name,
            numberOfHostileCreeps: numberOfHostileCreeps
        }
    }
};

module.exports = roomMapper;