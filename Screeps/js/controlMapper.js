var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');

var controlMapper =
    {
        controlCreepCostDivisor: 5,
        mapSingleCollectionPosition: function (control, collectionPositionInfo, sourceId)
        {
            return infoMapper.calculateMappedInfo(control.pos, collectionPositionInfo, 2, infoEnum.CONTROL,
                    controlMapper.controlCreepCostDivisor, sourceId);
        },
        mapSingleSource:function(control, mappedSource)
        {
            var controlInfos = [];

            mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo)
            {
                var mappedInfo = infoMapper.calculateMappedInfo(control.pos, collectionPositionInfo, infoEnum.CONTROL,
                    controlMapper.controlCreepCostDivisor, mappedSource.sourceId);
                controlInfos.push(mappedInfo);
            });

            return controlInfos;
        },
        mapControl:function(control, mappedSources)
        {
            var controlInfos = [];
            mappedSources.forEach(function (mappedSource)
            {
                mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo)
                {
                    var mappedInfo = infoMapper.calculateMappedInfo(control.pos, collectionPositionInfo, infoEnum.CONTROL,
                        controlMapper.controlCreepCostDivisor, mappedSource.sourceId);
                    controlInfos.push(mappedInfo);
                });
            });

            var infosWithoutReturnPath = controlInfos.filter(info => !info.isSeperateReturnPath);
            infoMapper.mapNumberOfCreepsForNoReturnPath(infosWithoutReturnPath, this.controlCreepCostDivisor);

            return controlInfos;
        }
    };

module.exports = controlMapper;

