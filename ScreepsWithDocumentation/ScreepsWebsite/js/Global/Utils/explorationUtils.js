var explorationRepository = require('explorationRepository');
var roomMapper = require('roomMapper');

var explorationUtils =
{
    getAvailableRoomsToExplore: function ()
    {
        var reservedRoomNames = explorationRepository.getReservedRoomNames();
        return explorationRepository.getRoomsToExplore().filter(rte => !reservedRoomNames.includes(rte));
    },
    checkExistAvailableRoomToExplore: function ()
    {
        return explorationUtils.getAvailableRoomsToExplore().length > 0;
    },
    getNextRoomToExplore: function (creep)
    {
        var availableRoomNames = explorationUtils.getAvailableRoomsToExplore();

        if (availableRoomNames.length === 0) {
            return null;
        }

        var closestRoomToCreep = availableRoomNames.reduce(function (r1, r2) {
            var r1Distance = Game.map.getRoomLinearDistance(creep.room.name, r1, false);
            var r2Distance = Game.map.getRoomLinearDistance(creep.room.name, r2, false);
            return r1Distance < r2Distance ? r1 : r2;
        });

        return closestRoomToCreep;
    },
    getAvailableRoomsToWatch: function ()
    {
        var reservedRoomNames = explorationRepository.getReservedRoomNames();
        var exploredRoomNames = explorationRepository.getMappedRoomNames();
        var exploredRoomsWithAttackers = exploredRoomNames
            .filter(mrn => explorationRepository.getMappedRoom(mrn).numberOfAttackers > 0)
            .filter(mrn => !reservedRoomNames.includes(mrn));
        return exploredRoomsWithAttackers;
    },
    checkExistAvailableRoomToWatch: function ()
    {
        return explorationUtils.getAvailableRoomsToWatch().length > 0;
    },
    getNextRoomToWatch: function ()
    {
        if (!explorationUtils.checkExistAvailableRoomToWatch())
        {
            return 'NONE';
        }
        var availableRoomsToWatch = explorationUtils.getAvailableRoomsToWatch();

        var closestRoomToStart = availableRoomsToWatch.reduce(function (r1, r2) {
            var r1Distance = Game.map.getRoomLinearDistance(explorationRepository.getStartRoomName(), r1, false);
            var r2Distance = Game.map.getRoomLinearDistance(explorationRepository.getStartRoomName(), r2, false);
            return r1Distance < r2Distance ? r1 : r2;
        });

        return closestRoomToStart;
    },
    mapRoom: function (room)
    {
        explorationRepository.setMappedRoom(room.name, roomMapper.mapRoom(room));
    },
    addRoomExplored: function (room)
    {
        var exploredRoomNames = explorationRepository.getMappedRoomNames();

        var exits = Game.map.describeExits(room.name);
        exits = Object.keys(exits).map(key => exits[key]);
        exits = exits.filter(e => !exploredRoomNames.includes(e))
                     .filter(e => !explorationRepository.getRoomsToExplore().includes(e));

        explorationRepository.addRoomsToExplore(exits);
        explorationRepository.removeRoomToExplore(room.name);
        explorationUtils.mapRoom(room);
    }
    
};

module.exports = explorationUtils;