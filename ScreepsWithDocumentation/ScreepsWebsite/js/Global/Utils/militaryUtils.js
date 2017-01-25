var explorationRepository = require('explorationRepository');

var militaryUtils =
{
    getStrongestRoom: function ()
    {
        var mappedRooms = explorationRepository.getMappedRooms();
        var roomsWithHostileCreeps = mappedRooms.filter(mr => mr.numberOfHostileCreeps > 0);
        if (roomsWithHostileCreeps.length > 0)
        {
            var strongestRoom = roomsWithHostileCreeps
                .reduce((r1, r2) => r1.numberOfHostileCreeps > r2.numberOfHostileCreeps ? r1 : r2);
            return strongestRoom;
        }
        return null;
    }
};

module.exports = militaryUtils;