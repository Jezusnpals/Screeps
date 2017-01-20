
var explorationRepository =
{
    initialize: function (startRoomName)
    {
        Memory.explorationRepository = {
            roomsToExplore: [],
            mappedRoomDictonary: {},
            reservedRoomDictonary: {},
            startRoomName: startRoomName
        };
    },
    getRoomsToExplore: function ()
    {
        return Memory.explorationRepository.roomsToExplore;
    },
    getMappedRoom: function (key)
    {
        return Memory.explorationRepository.mappedRoomDictonary[key];
    },
    getReservedRoomNames: function() 
    {
        return Object.keys(Memory.explorationRepository.reservedRoomDictonary)
            .map(key => Memory.explorationRepository.reservedRoomDictonary[key]);
    },
    getMappedRoomNames: function() 
    {
        return Object.keys(Memory.explorationRepository.mappedRoomDictonary);
    },
    getStartRoomName: function() 
    {
        return Memory.explorationRepository.startRoomName;
    },
    setMappedRoom: function (roomName, mappedRoom)
    {
        Memory.explorationRepository.mappedRoomDictonary[roomName] = mappedRoom;
    },
    addRoomsToExplore: function (roomNames) 
    {
        Memory.explorationRepository.roomsToExplore = Memory.explorationRepository.roomsToExplore
                                                  .concat(roomNames);
    },
    removeRoomToExplore: function(roomName) 
    {
        var exploredRoomIndex = Memory.explorationRepository.roomsToExplore.indexOf(roomName);
        if (exploredRoomIndex >= 0)
        {
            Memory.explorationRepository.roomsToExplore.splice(exploredRoomIndex, 1);
        }
    },
    reserveRoom: function (creep, roomName)
    {
        Memory.explorationRepository.reservedRoomDictonary[creep.name] = roomName;
    },
    unReserveRoom: function (creepName)
    {
        if(Memory.explorationRepository.reservedRoomDictonary[creepName])
        {
            delete Memory.explorationRepository.reservedRoomDictonary[creepName];
        }
    }
    
};

module.exports = explorationRepository;