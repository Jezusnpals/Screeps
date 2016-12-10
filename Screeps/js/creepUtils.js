var pathManager = require('pathManager');
var mapUtils = require('mapUtils');
var roomManager = require('roomManager');

var NO_NEXT_POSITION = -6;
var NEXT_POSITION_TAKEN = -7;
var NO_PATH = -20;

function positionIsOpen(room, pos)
{
    var positionObjects = room.lookAt(mapUtils.refreshRoomPosition(pos));
    if (positionObjects.length <= 1)
    {
        return true;
    }
    var thereAreStructures = positionObjects.filter(po => po.type == 'structure').length > 0;
    if (thereAreStructures)
    {
        return false;
    }
    var thereAreNonMovingCreeps = positionObjects.filter(po => po.type == 'creep')
                                                 .filter(c => c.creep.my && !Game.creeps[c.creep.name].memory.isMoving).length > 0;
    if (thereAreNonMovingCreeps)
    {
        return false;
    }
    return true;
}

function collectionPositionWillBeOpen(creep, path, goalPos)
{
    var positionObjects = creep.room.lookAt(mapUtils.refreshRoomPosition(goalPos));
    if (positionObjects.length <= 1)
    {
        return true;
    }

    var myNonMovingCreeps = positionObjects.filter(po => po.type == 'creep')
        .filter(c => c.creep.my && !Game.creeps[c.creep.name].memory.isMoving);
    if (myNonMovingCreeps.length !== 1)
    {
        return true;
    }
    var framesLeftToMove = pathManager.calculateNumberOfRemaingPathPositions(creep.pos, path);
    return framesLeftToMove > Game.creeps[myNonMovingCreeps[0].creep.name].memory.harvestFramesLeft;
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
        var positionOpen = positionIsOpen(creep.room, moveToPosition);
        if (!positionOpen)
        {
            return NEXT_POSITION_TAKEN;
        }
        return creep.moveByPath([creep.pos, moveToPosition]);
    },
    pathToLinkedHarvestPosition: function(creep, mappedInfo)
    {
        var otherNonMovingCreepPositions = Object.keys(Game.creeps).map(function (key) {
            return Game.creeps[key];
        }).filter(c => c.id != creep.id && !c.memory.isMoving).map(c => c.pos);

        var goalPositions = mappedInfo.linkedCollectionPositions.concat(mappedInfo.collectionPosition);
        var pathToLinkedHarvestPosition = mapUtils.findPath(creep.pos,
                                          mapUtils.refreshRoomPositionArray(goalPositions), otherNonMovingCreepPositions, [], 50);
        if (!pathToLinkedHarvestPosition.incomplete && pathToLinkedHarvestPosition.path.length > 0)
        {
            var pathWithStartPosition = pathToLinkedHarvestPosition.path;
            pathWithStartPosition.unshift(creep.pos);
            creep.memory.pathToKey = pathManager.addPath(pathWithStartPosition, pathWithStartPosition[pathWithStartPosition.length - 1]);
        }

        return creepUtils.tryMoveByPath(creep, pathToLinkedHarvestPosition.path);
    },
    moveToALinkedHarvestPosition: function (creep, mappedInfo)
    {
        mappedInfo.linkedCollectionPositions.forEach(function(linkedPos)
        {
            creep.memory.pathToKey = pathManager.getKey(creep.pos, linkedPos);
            if (creep.memory.pathToKey)
            {
                var path = pathManager.getPath(creep.memory.pathToKey);
                if (collectionPositionWillBeOpen(creep, path, linkedPos))
                {
                    return creepUtils.tryMoveByPath(creep, path);
                }
            }
        });
        return creepUtils.pathToLinkedHarvestPosition(creep, mappedInfo);
    },
    moveToSourceByMappedInfo: function (creep, source, mappedInfo)
    {
        if (!creep.memory.pathToKey)
        {
            creep.memory.pathToKey = pathManager.getKey(creep.pos, mappedInfo.collectionPosition);
        }
        var path = creep.memory.pathToKey ? pathManager.getPath(creep.memory.pathToKey) : [];
        var canUseSavedPath = pathToIdSet && collectionPositionWillBeOpen(creep, path, mappedInfo.collectionPosition);
        var moveResults = NO_PATH;

        if (canUseSavedPath)
        {
            moveResults = creepUtils.tryMoveByPath(creep, path);
        }
        
        if (creepUtils.recalculate_path_errors.includes(moveResults))
        {
            creep.memory.pathToKey = '';
            moveResults = creepUtils.moveToALinkedHarvestPosition(creep, mappedInfo);
        }
        if (creepUtils.recalculate_path_errors.includes(moveResults))
        {
            creep.memory.pathToKey = '';
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
        creep.memory.pathFromKey = '';

        if (harvestResult == ERR_NOT_IN_RANGE)
        {
            creep.memory.isMoving = true;
            creep.memory.harvestFramesLeft = 0;
            if (mappedInfo)
            {
                creepUtils.moveToSourceByMappedInfo(creep, source, mappedInfo);
            }
            else
            {
                creep.moveTo(source);
            }
        }
        else
        {
            creep.memory.isMoving = false;
            if (creep.memory.harvestFramesLeft === 0)
            {
                creep.memory.harvestFramesLeft = creep.memory.creepInfo.harvestFrames - 1; //counts the current frame as a harvest frame
            }
            else
            {
                creep.memory.harvestFramesLeft--;
            }
        }
    },
    moveToStructureByMappedInfo: function (creep, structure, mappedInfo)
    {
        creep.memory.pathToKey = '';
        if (!creep.memory.pathFromKey)
        {
            creep.memory.pathFromKey = pathManager.getKey(creep.pos, structure.pos);
        }
        var creepFollowPathFromResult = NO_PATH;
        if (creep.memory.pathFromKey)
        {
            creepFollowPathFromResult = creepUtils.tryMoveByPath(creep, pathManager.getPath(creep.memory.pathFromKey));
        }
        
        if (creepUtils.recalculate_path_errors.includes(creepFollowPathFromResult))
        {
            creep.memory.pathFromKey = '';
            creep.moveTo(structure);
        }
    }

};

module.exports = creepUtils;