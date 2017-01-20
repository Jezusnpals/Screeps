var behaviorEnum = require('behaviorEnum');

function initializeMemory(room)
{
    room.memory.collectionInfoRepository = {};
}
function getMemory(room)
{
    return room.memory.collectionInfoRepository;
}
var collectionInfoRepository =
{
    initialize: function (room)
    {
        initializeMemory(room);
        getMemory(room).Infos = {};
        getMemory(room).Infos[behaviorEnum.HARVESTER] = {};
        getMemory(room).Infos[behaviorEnum.UPGRADER] = {};
        getMemory(room).Infos[behaviorEnum.BUILDER] = {};
    },
    setInfo: function (room, behavior, info)
    {
        getMemory(room).Infos[behavior][info.key] = info;
    },
    getInfo: function (room, behavior, key)
    {
        return getMemory(room).Infos[behavior][key];
    },
    getInfos : function(room, behavior) 
    {
        return getMemory(room).Infos[behavior];
    },
    removeInfo: function (room, behavior, key)
    {
        delete getMemory(room).Infos[behavior][key];
    },
    getInfoKeys: function (room, behavior)
    {
        return Object.keys(getMemory(room).Infos[behavior]);
    }
}

module.exports = collectionInfoRepository;