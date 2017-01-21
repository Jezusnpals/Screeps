var collectionInfoMapper = require('collectionInfoMapper');
var infoEnum = require('infoEnum');


var spawnMapper = {
    mapAllPathsToCollectionPosition: function (spawn, collectionPosition)
    {
        collectionInfoMapper.mapAllPathsTo(spawn.pos, collectionPosition, 1, infoEnum.HARVEST);
    },
    mapSingleCollectionPosition:function(spawn, collectionPositionInfo, sourceId)
    {
        this.mapAllPathsToCollectionPosition(spawn, collectionPositionInfo.originalPos);
        var mappedInfo = collectionInfoMapper.calculateMappedInfo(spawn.pos, collectionPositionInfo, 1, infoEnum.HARVEST, sourceId);
        mappedInfo.structureId = spawn.id;
        return mappedInfo;
    }
}

module.exports = spawnMapper;

