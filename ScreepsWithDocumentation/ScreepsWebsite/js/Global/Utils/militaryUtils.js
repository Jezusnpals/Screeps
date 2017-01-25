var explorationRepository = require('explorationRepository');

var militaryUtils =
{
    getStrongestRoom: function ()
    {
        var mappedRooms = explorationRepository.getMappedRooms();
        var roomsToAttack = mappedRooms.filter(mr => mr.numberOfHostileCreeps > 0 && !mr.isInSafeMode);
        if (roomsToAttack.length > 0)
        {
            var strongestRoom = roomsToAttack
                .reduce((r1, r2) => r1.numberOfHostileCreeps > r2.numberOfHostileCreeps ? r1 : r2);
            return strongestRoom;
        }
        return null;
    }
};

module.exports = militaryUtils;