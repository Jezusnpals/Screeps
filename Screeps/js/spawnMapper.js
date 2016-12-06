var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');


var spawnMapper = {
    harvestCreepCostDivisor: 12,
    mapSingleCollectionPosition:function(spawn, collectionPositionInfo, sourceId)
    {
        var mappedInfo = infoMapper.calculateMappedInfo(spawn.pos, collectionPositionInfo, infoEnum.SPAWN,
                spawnMapper.harvestCreepCostDivisor, sourceId);
        mappedInfo.spawnId = spawn.id;
        return mappedInfo;
    },
    mapSingleSource: function(spawn, mappedSource)
    {
        var harvestInfos = [];

        mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo)
        {
            var mappedInfo = infoMapper.calculateMappedInfo(spawn.pos, collectionPositionInfo, infoEnum.SPAWN,
                spawnMapper.harvestCreepCostDivisor, mappedSource.sourceId);
            mappedInfo.spawnId = spawn.id;
            harvestInfos.push(mappedInfo);
        });

        return harvestInfos;
    },
    mapSpawn: function (spawn, mappedSources)
    {
        var harvestInfos = [];

        mappedSources.forEach(function (mappedSource)
        {
            mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo)
            {
                var mappedInfo = infoMapper.calculateMappedInfo(spawn.pos, collectionPositionInfo, infoEnum.SPAWN,
                    spawnMapper.harvestCreepCostDivisor, mappedSource.sourceId);
                mappedInfo.spawnId = spawn.id;
                harvestInfos.push(mappedInfo);
            });
        });

        var infosWithoutReturnPath = harvestInfos.filter(info => !info.isSeperateReturnPath);
        infoMapper.mapNumberOfCreepsForNoReturnPath(infosWithoutReturnPath, this.harvestCreepCostDivisor);

        return harvestInfos;
    }
}

module.exports = spawnMapper;

