var pathManager = require('pathManager');
var mapUtils = require('mapUtils');

function moveToALinkedHarvestPosition(creep, mappedInfo) {
    var otherCreepPositions = Object.keys(Game.creeps).map(function (key) {
        return Game.creeps[key];
    }).filter(c => c.id != creep.id).map(c => c.pos);

    var pathToLinkedHarvestPosition = mapUtils.findPath(creep.pos, mapUtils.refreshRoomPositionArray(mappedInfo.linkedCollectionPositions), otherCreepPositions, [], 50);
    return creep.moveByPath(pathToLinkedHarvestPosition.path);
}

var creepUtils =
{
    NO_NEXT_POSITION: -6,
    NEXT_POSITION_TAKEN: -7,
    tryMoveByPath: function(creep, path)
    {
        var moveToPosition = pathManager.getNextPathPosition(creep.pos, path);
        if(!moveToPosition)
        {
            return this.NO_NEXT_POSITION;
        }
        var positionOpen = creep.room.lookAt(moveToPosition).length <= 1;
        if (!positionOpen)
        {
            return this.NEXT_POSITION_TAKEN;
        }
        return creep.moveByPath([creep.pos, moveToPosition]);
    },
    moveToALinkedHarvestPosition: function (creep, mappedInfo)
    {
        var otherCreepPositions = Object.keys(Game.creeps).map(function (key) {
            return Game.creeps[key];
        }).filter(c => c.id != creep.id).map(c => c.pos);

        var pathToLinkedHarvestPosition = mapUtils.findPath(creep.pos, mapUtils.refreshRoomPositionArray(mappedInfo.linkedCollectionPositions), otherCreepPositions, [], 50);
        return creep.moveByPath(pathToLinkedHarvestPosition.path);
    },
    moveToSourceByMappedInfo: function (creep, source, mappedInfo) {
        creep.memory.harvestPathFromId = -1;

        var harvestPositionOpen = creep.room.lookAt(mapUtils.refreshRoomPosition(mappedInfo.collectionPosition)).length <= 1;
        var movedSuccessfully = -1;

        if (harvestPositionOpen) {
            movedSuccessfully = this.tryMoveByPath(creep, pathManager.getHarvestPathToByIndex(mappedInfo.pathToId));
        }
        if (movedSuccessfully != OK) {
            movedSuccessfully = this.moveToALinkedHarvestPosition(creep, mappedInfo);
        }
        if (movedSuccessfully != OK) {
            creep.moveTo(source.pos);
        }
    },
    harvestEnergy: function (creep, mappedInfo) {
        var source = mappedInfo ? Game.getObjectById(mappedInfo.sourceId) :
            creep.room.find(FIND_SOURCES)[0];
        var harvestResult = creep.harvest(source)

        if (harvestResult == ERR_NOT_IN_RANGE) {
            if (mappedInfo)
            {
                this.moveToSourceByMappedInfo(creep, source, mappedInfo);
            }
            else {
                creep.moveTo(source);
            }
        }
    },

};

module.exports = creepUtils;