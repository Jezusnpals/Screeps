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
    getAvailableRooms: function ()
    {
        var reservedRoomNames = Object.keys(Memory.explorationManager.reservedRooms)
                                .map(key => Memory.explorationManager.reservedRooms[key]);
        return Memory.explorationManager.roomsToExplore.filter(rte => !reservedRoomNames.includes(rte));
    },
    checkExistAvailableRoomToExplore: function ()
    {
        return explorationManager.getAvailableRooms().length > 0;
    },
    getNextRoomToExplore: function (creep)
    {
        var availableRoomNames = explorationManager.getAvailableRooms();

        if (availableRoomNames.length === 0)
        {
            return null;
        }
        
        var lowestDistance = Game.map.getRoomLinearDistance(creep.room.name, availableRoomNames[0], false);
        var currentBestRoom = availableRoomNames[0];
        for(let i = 1; i < availableRoomNames.length; i++)
        {
            var currentDistance = Game.map.getRoomLinearDistance(creep.room.name, availableRoomNames[i], false);

            if(currentDistance < lowestDistance)
            {
                lowestDistance = currentDistance;
                currentBestRoom = availableRoomNames[i];
            }
        }

        return currentBestRoom;
    },
    mapRoom: function(room) {
        Memory.explorationManager.mappedRooms[room.name] = roomMapper.mapRoom(room);
    },
    onRoomExplored: function (room)
    {
        var exploredRoomNames = Object.keys(Memory.explorationManager.mappedRooms);

        var exits = Game.map.describeExits(room.name);
        exits = Object.keys(exits).map(key => exits[key]); //convert to array
        exits = exits.filter(e => !exploredRoomNames.includes(e))
                     .filter(e => !Memory.explorationManager.roomsToExplore.includes(e)); //filter out known rooms
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