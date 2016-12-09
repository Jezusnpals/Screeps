var pathManager = require('pathManager');
var mapUtils = require('mapUtils');
var roomManager = require('roomManager');

var NO_NEXT_POSITION = -6;
var NEXT_POSITION_TAKEN = -7;
var NO_PATH = -20;

function positionIsOpen(room, pos)
{
    return room.lookAt(mapUtils.refreshRoomPosition(pos)).length <= 1;
}

var creepUtils =
{
    
    recalculate_path_errors: [NEXT_POSITION_TAKEN, NO_NEXT_POSITION, NO_PATH, ERR_NOT_FOUND],
    tryMoveByPath: function(creep, path)
    {
        var moveToPosition = pathManager.getNextPathPosition(creep.pos, path);
        if(!moveToPosition)
        {
            return NO_NEXT_POSITION;
        }
        var positionOpen = creep.room.lookAt(moveToPosition).length <= 1;
        if (!positionOpen)
        {
            
            return NEXT_POSITION_TAKEN;
        }
        return creep.moveByPath([creep.pos, moveToPosition]);
    },
    pathToLinkedHarvestPosition: function(creep, mappedInfo)
    {
        var otherCreepPositions = Object.keys(Game.creeps).map(function (key) {
            return Game.creeps[key];
        }).filter(c => c.id != creep.id).map(c => c.pos);

        var pathToLinkedHarvestPosition = mapUtils.findPath(creep.pos,
                                          mapUtils.refreshRoomPositionArray(mappedInfo.linkedCollectionPositions), otherCreepPositions, [], 50);
        if (!pathToLinkedHarvestPosition.incomplete)
        {
            var pathWithStartPosition = pathToLinkedHarvestPosition.path;
            pathWithStartPosition.unshift(creep.pos);
            creep.memory.pathToId = pathManager.addPathTo(pathWithStartPosition, pathWithStartPosition[pathWithStartPosition.length - 1]);
        }

        return this.tryMoveByPath(creep, pathToLinkedHarvestPosition.path);
    },
    moveToALinkedHarvestPosition: function (creep, mappedInfo)
    {
        mappedInfo.linkedCollectionPositions.forEach(function(linkedPos)
        {
            if(positionIsOpen(creep.room, linkedPos))
            {
                creep.memory.pathToId = pathManager.getPathToIndex(creep.pos, mappedInfo.collectionPosition);
                var pathToIdSet = creep.memory.pathToId >= 0;
                if (pathToIdSet)
                {
                    return this.tryMoveByPath(creep, pathManager.getPathTo(creep.memory.pathToId));
                }
            }
        });
        return this.pathToLinkedHarvestPosition(creep, mappedInfo);
    },
    moveToSourceByMappedInfo: function (creep, source, mappedInfo) {

        var harvestPositionOpen = positionIsOpen(creep.room, mappedInfo.collectionPosition);
        var moveResults = NO_PATH;

        if (harvestPositionOpen)
        {
            var pathToIdSet = creep.memory.pathToId >= 0;
            if (!pathToIdSet)
            {
                creep.memory.pathToId = pathManager.getPathToIndex(creep.pos, mappedInfo.collectionPosition);
                pathToIdSet = creep.memory.pathToId >= 0; 
            }
            if (pathToIdSet)
            {
                moveResults = this.tryMoveByPath(creep, pathManager.getPathTo(creep.memory.pathToId));
            }
        }
        
        if (this.recalculate_path_errors.includes(moveResults))
        {
            moveResults = this.moveToALinkedHarvestPosition(creep, mappedInfo);
        }
        if (this.recalculate_path_errors.includes(moveResults))
        {
            creep.moveTo(source.pos);
        }
    },
    harvestEnergy: function (creep, mappedInfo)
    {
        var source = mappedInfo ? Game.getObjectById(mappedInfo.sourceId) :
            creep.room.find(FIND_SOURCES).reduce(function (s1, s2) {
                var s1Distance = mapUtils.calculateDistanceBetweenTwoPoints(creep.pos, s1.pos);
                var s2Distance = mapUtils.calculateDistanceBetweenTwoPoints(creep.pos, s2.pos);
                return s1Distance < s2Distance ? s1 : s2;
            });
        var harvestResult = creep.harvest(source)
        creep.memory.pathFromId = -1;

        if (harvestResult == ERR_NOT_IN_RANGE) {
            if (mappedInfo)
            {
                this.moveToSourceByMappedInfo(creep, source, mappedInfo);
            }
            else
            {
                creep.moveTo(source);
            }
        }
    },
    moveToStructureByMappedInfo: function (creep, structure, mappedInfo)
    {
        creep.memory.pathToId = -1;
        var pathFromIdSet = creep.memory.pathFromId >= 0;
        if (!pathFromIdSet)
        {
            creep.memory.pathFromId = pathManager.getPathFromIndex(creep.pos, structure.pos);
        }
        pathFromIdSet = creep.memory.pathFromId >= 0;
        var creepFollowPathFromResult = NO_PATH;
        if (pathFromIdSet)
        {
            creepFollowPathFromResult = this.tryMoveByPath(creep, pathManager.getPathFrom(creep.memory.pathFromId));
        }
        
        if (this.recalculate_path_errors.includes(creepFollowPathFromResult))
        {
            creep.memory.pathFromId = -1;
            creep.moveTo(structure);
        }
    }

};

module.exports = creepUtils;