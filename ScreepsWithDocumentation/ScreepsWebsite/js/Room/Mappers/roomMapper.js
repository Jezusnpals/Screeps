var roomMapper =
{
    mapRoom: function (room) {
        var numberOfAttackers = room.find(FIND_HOSTILE_CREEPS,{
            filter: function(object) {
                return object.getActiveBodyparts(ATTACK) === 0;
            }
        }).length;

        return {
            numberOfAttackers: numberOfAttackers
        }
    }
};

module.exports = roomMapper;