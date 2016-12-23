var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var collectionInfoMapper = require('infoMapper');
var infoEnum = require('infoEnum');
var mapUtils = require('mapUtils');
var pathManager = require('pathManager');

var controlMapper =
    {
        mapAllPathsToCollectionPosition: function(control, collectionPosition)
        {
            collectionInfoMapper.mapAllPathsTo(control.pos, collectionPosition, 3, infoEnum.CONTROL);
        },
        mapSingleCollectionPosition: function (control, collectionPositionInfo, sourceId)
        {
            return collectionInfoMapper.calculateMappedInfo(control.pos, collectionPositionInfo, 3, infoEnum.CONTROL, sourceId);
        }
    };

module.exports = controlMapper;

