function initializeMemory(room)
{
    room.memory.reservedCollectionPositionRepository = {};
}
function getMemory(room)
{
    return room.memory.reservedCollectionPositionRepository;
}

var reservedCollectionPositionsRepository =
{
    initialize: function (room)
    {
        initializeMemory(room);
        getMemory(room).reservedCollectionPositions = {};
    },
    getReservedCollectionPosition: function (room, key)
    {
        return getMemory(room).reservedCollectionPositions[key];
    },
    setReservedCollectionPosition: function (room, key, value)
    {
        getMemory(room).reservedCollectionPositions[key] = value;
    },
    resetReservedCollectionPosition: function (room, key)
    {
        getMemory(room).reservedCollectionPositions[key] = null;
    },
    getReservedCollectionPositionKeys: function (room)
    {
        return Object.keys(getMemory(room).reservedCollectionPositions);
    }
}
module.exports = reservedCollectionPositionsRepository;