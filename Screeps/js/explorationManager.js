var roomMapper = require('roomMapper');

var explorationManager =
{
    initialize: function ()
    {
        Memory.explorationManager = {
            roomsToExplore: [],
            mappedRooms: {},
            reservedRooms: {}
        };
    },
    getAvailableRoomsToExplore: function ()
    {
        var reservedRoomNames = Object.keys(Memory.explorationManager.reservedRooms)
                                .map(key => Memory.explorationManager.reservedRooms[key]);
        return Memory.explorationManager.roomsToExplore.filter(rte => !reservedRoomNames.includes(rte));
    },
    checkExistAvailableRoomToExplore: function ()
    {
        return explorationManager.getAvailableRoomsToExplore().length > 0;
    },
    getNextRoomToExplore: function (creep)
    {
        var availableRoomNames = explorationManager.getAvailableRoomsToExplore();

        if (availableRoomNames.length === 0)
        {
            return null;
        }

        var closestRoomToCreep = availableRoomNames.reduce(function (r1, r2) {
            var r1Distance = Game.map.getRoomLinearDistance(creep.room.name, r1, false);
            var r2Distance = Game.map.getRoomLinearDistance(creep.room.name, r2, false);
            return r1Distance < r2Distance ? r1 : r2;
        });

        return closestRoomToCreep;
    },
    getAvailableRoomsToWatch: function() 
    {
        var reservedRoomNames = Object.keys(Memory.explorationManager.reservedRooms)
                                .map(key => Memory.explorationManager.reservedRooms[key]);
        var mappedRoomNames = Object.keys(Memory.explorationManager.mappedRooms);
        var exploredRoomsWithAttackers = mappedRoomNames
            .filter(mrn => Memory.explorationManager.mappedRooms[mrn].numberOfAttackers > 0)
            .filter(mrn => !reservedRoomNames.includes(mrn));
        return exploredRoomsWithAttackers;
    },
    checkExistAvailableRoomToWatch: function ()
    {
        return explorationManager.getAvailableRoomsToWatch().length > 0;
    },
    getNextRoomToWatch: function ()
    {
        var availableRoomsToWatch = explorationManager.getAvailableRoomsToWatch();

        var closestRoomToStart = availableRoomsToWatch.reduce(function (r1, r2) {
            var r1Distance = Game.map.getRoomLinearDistance(Memory.startRoomName, r1, false);
            var r2Distance = Game.map.getRoomLinearDistance(Memory.startRoomName, r2, false);
            return r1Distance < r2Distance ? r1 : r2;
        });

        return closestRoomToStart;
    },
    mapRoom: function (room)
    {
        Memory.explorationManager.mappedRooms[room.name] = roomMapper.mapRoom(room);
    },
    onRoomExplored: function (room) 
    {
        var exploredRoomNames = Object.keys(Memory.explorationManager.mappedRooms);

        var exits = Game.map.describeExits(room.name);
        exits = Object.keys(exits).map(key => exits[key]);
        exits = exits.filter(e => !exploredRoomNames.includes(e))
                     .filter(e => !Memory.explorationManager.roomsToExplore.includes(e)); 
        Memory.explorationManager.roomsToExplore = Memory.explorationManager.roomsToExplore
                                                   .concat(exits);
        var exploredRoomIndex = Memory.explorationManager.roomsToExplore.indexOf(room.name);
        if(exploredRoomIndex >= 0)
        {
            Memory.explorationManager.roomsToExplore.splice(exploredRoomIndex, 1);
        }

        explorationManager.mapRoom(room);
    },
    reserveRoom: function (creep, roomName)
    {
        Memory.explorationManager.reservedRooms[creep.name] = roomName;
    },
    unReserveRoom: function (creepName)
    {
        if(Memory.explorationManager.reservedRooms[creepName])
        {
            delete Memory.explorationManager.reservedRooms[creepName];
        }
    }
    
};

module.exports = explorationManager;