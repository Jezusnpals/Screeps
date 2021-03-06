﻿var behaviorEnum = require('behaviorEnum');
var mapUtils = require('mapUtils');
var extensionMapper = require('extensionMapper');
var collectionInfoRepository = require('collectionInfoRepository');

var extensionInfoManager =
{
    initialize: function (room)
    {
        room.memory.pendingExtensionInfos = [];
        room.memory.extensionsCount = 0;
        room.memory.extensionBuildKeys = [];
        room.memory.addedFirstExtension = false;
    },
    calculateNextExtensionInfo: function (room)
    {
        var possibleCollectionPositionInfos = room.memory.mappedSources.map(s => s.collectionPositionInfos).reduce((c1, c2) => c1.concat(c2));
        var collectionPositions = possibleCollectionPositionInfos.map(cpi => cpi.originalPos);
        var extentionInfos = room.memory.extensionBuildKeys.map(key => collectionInfoRepository.getInfo(room, behaviorEnum.BUILDER, key));
        var currentExtensionComparablePositions = extentionInfos.map(ei => mapUtils.getComparableRoomPosition(ei.collectionPosition));
        possibleCollectionPositionInfos = possibleCollectionPositionInfos.filter(pes => !currentExtensionComparablePositions
                                                                         .includes(mapUtils.getComparableRoomPosition(pes.originalPos)));

        var harvestInfoArray = collectionInfoRepository.getInfoKeys(room, behaviorEnum.HARVESTER)
                .map(key => collectionInfoRepository.getInfo(room, behaviorEnum.HARVESTER, key));
        var controlInfoArray = collectionInfoRepository.getInfoKeys(room, behaviorEnum.UPGRADER)
               .map(key => collectionInfoRepository.getInfo(room, behaviorEnum.UPGRADER, key));
        var collectionPositionCosts = possibleCollectionPositionInfos.map(function (collectionPositionInfo) {
            var comparableCollectionPosition = mapUtils.getComparableRoomPosition(collectionPositionInfo.originalPos);
            var relatedHarvestInfo = harvestInfoArray
                .filter(hi => mapUtils
                    .getComparableRoomPosition(hi.collectionPosition) ===
                    comparableCollectionPosition);
            var harvestCost = relatedHarvestInfo.length === 1 ? relatedHarvestInfo[0].costTo : 0;
           
            var relatedControlInfo = controlInfoArray
                .filter(ci => mapUtils
                    .getComparableRoomPosition(ci.collectionPosition) ===
                    comparableCollectionPosition);
            var controlCost = relatedControlInfo.length === 1 ? relatedControlInfo[0].costTo : 0;
            return harvestCost + controlCost;
        });

        var bestExtensionPositionInfo = null;
        var highestCost = -1;

        for (let i = 0; i < possibleCollectionPositionInfos.length && i < collectionPositionCosts.length; i++) {
            if (collectionPositionCosts[i] > highestCost) {
                bestExtensionPositionInfo = possibleCollectionPositionInfos[i];
                highestCost = collectionPositionCosts[i];
            }
        }

        if (!bestExtensionPositionInfo) {
            return null;
        }

        return extensionMapper.mapExtension(bestExtensionPositionInfo, bestExtensionPositionInfo.sourceId, collectionPositions);
    },
    completePendingExtensionInfos: function (room)
    {
        for (let i = 0; i < room.memory.pendingExtensionInfos.length; i++)
        {
            var pendingExtensionInfo = room.memory.pendingExtensionInfos[i];
            var refreshExtensionPosition = mapUtils.refreshRoomPosition(pendingExtensionInfo.extensionPosition);
            var extensionConstructionSite = room.lookAt(refreshExtensionPosition).filter(e => e.type === 'constructionSite')[0];
            if (!extensionConstructionSite)
                continue;
            var currentExtensionId = extensionConstructionSite.constructionSite ? extensionConstructionSite.constructionSite.id : null;
            if (currentExtensionId) {
                pendingExtensionInfo.structureId = currentExtensionId;
                collectionInfoRepository.setInfo(room, behaviorEnum.BUILDER, pendingExtensionInfo);
                room.memory.extensionBuildKeys.push(pendingExtensionInfo.key);
                room.memory.pendingExtensionInfos.splice(i, 1);
                i--;
            }
        };
    },
    addExtensionInfo: function (room)
    {
        var maxExtensions = (room.controller.level - 1) * 5;
        if (room.memory.extensionsCount + 1 > maxExtensions) {
            return false;
        }

        var extensionInfo = extensionInfoManager.calculateNextExtensionInfo(room);
        if (!extensionInfo) {
            return false;
        }

        var constructionSiteResult = room.createConstructionSite(extensionInfo.extensionPosition, STRUCTURE_EXTENSION);
        
        if (constructionSiteResult === OK)
        {
            room.memory.extensionsCount++;;
            room.memory.pendingExtensionInfos.push(extensionInfo);
            return true;
        }

        return false;
    },
    run: function (room)
    {
        if (room.memory.finishedMapping && room.controller.level > 1 &&
           room.memory.pendingExtensionInfos.length === 0)
        {
            room.memory.addedFirstExtension = extensionInfoManager.addExtensionInfo(room);
        }
        extensionInfoManager.completePendingExtensionInfos(room);
    }
}

module.exports = extensionInfoManager;
