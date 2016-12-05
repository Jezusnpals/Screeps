var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var infoMapper = require('infoMapper');

var controlMapper =
    {
        mapControl:function(control, mappedSources)
        {
            var controlInfos = [];

            mappedSources.forEach(function (mappedSource) {
                mappedSource.collectionPositionInfos.forEach(function (collectionPositionInfo) {
                    var mappedInfo = infoMapper.calculateMappedInfo(control.pos, collectionPositionInfo.originalPos);
                    collectionPositionInfo.harvestPathFromId = mappedInfo.pathFromId;
                    var controlInfos = {
                        sourceId: mappedSource.sourceId,
                        controlId: control.id,
                        creepNames: [],
                        maxCreeps: 1 + Math.floor(mappedInfo.costTo / harvestCreepCostToDivisor),
                        pathToId: mappedInfo.pathToId,
                        linkedCollectionPositions: collectionPositionInfo.linkedCollectionPositions,
                        costTo: mappedInfo.costTo,
                        isSeperateReturnPath: mappedInfo.isSeperateReturnPath,
                        canGetTo: mappedInfo.canGetTo,
                        returnPathBlockers: mappedInfo.returnPathBlockers,
                        collectionPosition: mappedInfo.collectionPosition
                    }
                    controlInfos.push(controlInfos);
                });
            });

            var infosWithoutReturnPath = controlInfos.filter(info => !info.isSeperateReturnPath);
            infoMapper.calculateNumberOfCreepsForNoReturnPath(infosWithoutReturnPath, harvestCreepCostToDivisor);

            return controlInfos;
        }
    };

module.exports = controlMapper;

