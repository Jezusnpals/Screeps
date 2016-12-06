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
        }
    };

module.exports = controlMapper;

