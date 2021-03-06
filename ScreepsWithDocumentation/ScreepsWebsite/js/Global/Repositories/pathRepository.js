var mapUtils = require('mapUtils');

var pathRepository =
{
    initialize:function()
    {
        Memory.pathRepository = {
            terrainPathDictonary: {},
            roomPathDictonary: {}
        };                        
    },
    addRoomPath: function (path, key)
    {
        Memory.pathRepository.roomPathDictonary[key] = path;
    },
    getRoomPath: function (key)
    {
        return Memory.pathRepository.roomPathDictonary[key];
    },
    addPathTerrainPath: function (path, pathKey)
    {
        Memory.pathRepository.terrainPathDictonary[pathKey] = path;
    },
    getPath: function (key)
    {
        return Memory.pathRepository.terrainPathDictonary[key] ? mapUtils.refreshRoomPositionArray(Memory.pathRepository.terrainPathDictonary[key].path) : [];
    },
    getTerrainPath: function(key) 
    {
        if (Memory.pathRepository.terrainPathDictonary[key]) 
        {
            Memory.pathRepository.terrainPathDictonary[key].path = mapUtils.refreshRoomPositionArray(Memory.pathRepository.terrainPathDictonary[key].path);
            return Memory.pathRepository.terrainPathDictonary[key];
        }
        else
        {
            return null;
        }
    },
    getTerrainPathKeys: function ()
    {
        return Object.keys(Memory.pathRepository.terrainPathDictonary);
    }
};

module.exports = pathRepository;