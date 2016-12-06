var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');

var controlCostDivisor = 5;

var controlMapper =
    {
        mapControl:function(control, mappedSources)
        {
            var controlInfos = [];
            mappedSources.forEach(function (mappedSource)
            {
                mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo)
                {
                    var mappedInfo = infoMapper.calculateMappedInfo(control.pos, collectionPositionInfo, infoEnum.CONTROL,
                        controlCostDivisor, mappedSource.sourceId);
                    controlInfos.push(mappedInfo);
                });
            });

            var infosWithoutReturnPath = controlInfos.filter(info => !info.isSeperateReturnPath);
            infoMapper.calculateNumberOfCreepsForNoReturnPath(infosWithoutReturnPath, controlCostDivisor);

            return controlInfos;
        }
    };

module.exports = controlMapper;

