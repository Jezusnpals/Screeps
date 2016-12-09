var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');
var infoEnum = require('infoEnum');
var mapUtils = require('mapUtils');
var pathManager = require('pathManager');

var controlMapper =
    {
        controlCreepCostDivisor: 5,
        mapAllPathsToCollectionPosition: function(control, collectionPosition)
        {
            infoMapper.mapAllPathsTo(control.pos, collectionPosition, 3, infoEnum.CONTROL);
        },
        mapSingleCollectionPosition: function (control, collectionPositionInfo, sourceId)
        {
            return infoMapper.calculateMappedInfo(control.pos, collectionPositionInfo, 3, infoEnum.CONTROL,
                    controlMapper.controlCreepCostDivisor, sourceId);
        }
    };

module.exports = controlMapper;

