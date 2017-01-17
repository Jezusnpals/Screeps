
var explorationManager =
{
    initialize: function ()
    {
        Memory.explorationManager = {
            roomsToExplore: [],
            reservedRooms: {}
        };
    },
    getNextRoomToExplore(creep)
    {
        var reservedRoomNames = Object.keys(Memory.explorationManager.reservedRooms)
                                .map(key => Memory.explorationManager.reservedRooms[key]);
        var avalibleRoomNames = roomsToExplore.filter(rte => !reservedRoomNames.includes(rte));

        if (avalibleRoomNames.length === 0)
        {
            return null;
        }
        
        var lowestDistance = Game.map.getRoomLinearDistance(creep.room.name, avalibleRoomNames[0], false);
        var currentBestRoom = avalibleRoomNames[0];
        for(let i = 1; i < avalibleRoomNames.length; i++)
        {
            var currentDistance = Game.map.getRoomLinearDistance(creep.room.name, avalibleRoomNames[i], false);

            if(currentDistance < lowestDistance)
            {
                lowestDistance = currentDistance;
                currentBestRoom = avalibleRoomNames;
            }
        }

        return currentBestRoom;
    },
    onRoomExplored(roomName)
    {
        var exits = Game.map.describeExits(roomName);
        exits = Object.keys(exits).map(key => exits[key]); //convert to array
        exits = exits.filter(e => !Object.keys(Game.rooms).includes(e)); //filter out known rooms
        Memory.explorationManager.roomsToExplore = Memory.explorationManager.roomsToExplore
                                                   .concat(exits);
        var exploredRoomIndex = Memory.explorationManager.roomsToExplore.indexOf(roomName);
        if(exploredRoomIndex >= 0)
        {
            Memory.explorationManager.roomsToExplore.splice(exploredRoomIndex, 1);
        }
    },
    reserveRoom(creep, roomName)
    {
        Memory.explorationManager.reservedRooms[creep.name] = roomName;
    },
    unReserveRoom(creepName)
    {
        if(Memory.explorationManager.reservedRooms[creepName])
        {
            delete Memory.explorationManager.reservedRooms[creepName];
        }
    }
    
};

module.exports = explorationManager;