var pathManager = require('pathManager');
var mapUtils = require('mapUtils');

const NO_NEXT_POSITION = -6;
const NEXT_POSITION_TAKEN = -7;
const ALL_PATHS_RESERVED = -8;
const NO_PATH = -20;

var structureTypes = ['constructionSite', 'structure'];
function positionIsOpen(room, pos)
{
    var positionObjects = room.lookAt(mapUtils.refreshRoomPosition(pos));
    if (positionObjects.length <= 1)
    {
        return true;
    }
    var thereAreStructures = positionObjects.filter(po => structureTypes.includes(po.type)).length > 0;
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
    recalculate_path_errors: [NEXT_POSITION_TAKEN, NO_NEXT_POSITION, NO_PATH, ALL_PATHS_RESERVED, ERR_NOT_FOUND],
    resetSavedPathToSource: function(creep, keepKnownReserve) 
    {
        var hasSourceReserved = creep.memory.reservedSourceKey && creep.room.memory.reservedSources[creep.memory.reservedSourceKey] === creep.memory.framesToSource;
        if (hasSourceReserved)
        {
            creep.room.memory.reservedSources[creep.memory.reservedSourceKey] = null;
        }
        creep.memory.pathToKey = '';
        creep.memory.framesToSource = -1;
        creep.memory.reservedSourceKey = '';
        if (keepKnownReserve)
        {
            creep.reservedSources = [];
        }
    },
    incrementFramesToSource: function (creep)
    {
        if (!creep.memory.reservedSourceKey)
        {
            return;
        }
        var hasSourceReserved = creep.room.memory.reservedSources[creep.memory.reservedSourceKey].frames === creep.memory.framesToSource;
        if (hasSourceReserved)
        {
            creep.room.memory.reservedSources[creep.memory.reservedSourceKey].frames--;
            creep.memory.framesToSource--;
        }
        else
        {
            creepUtils.resetSavedPathToSource(creep);
        }
    },
    reserve_Source: function (creep, terrainPath, stringSourcePosition)
    {
        if (!terrainPath)
        {
            creep.memory.knownReservedSources.push(stringSourcePosition);
            return false;
        }
        var terrainPathCost = pathManager.calculateTerrainPathCostToSource(terrainPath, creep.memory.creepInfo);
        if (creep.room.memory.reservedSources[stringSourcePosition] && creep.room.memory.reservedSources[stringSourcePosition].frames < terrainPathCost)
        {
            creepUtils.resetSavedPathToSource(creep, true);
            creep.memory.knownReservedSources.push(stringSourcePosition);
            return false;
        }
        else
        {
            creepUtils.resetSavedPathToSource(creep, true);
            creep.memory.framesToSource = terrainPathCost;
            creep.room.memory.reservedSources[stringSourcePosition] = {frames: terrainPathCost, name: creep.name};
            creep.memory.reservedSourceKey = stringSourcePosition;
            return true;
        }
    },
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

        var goalPositions = mappedInfo.linkedCollectionPositions.concat(mappedInfo.collectionPosition)
                                      .filter(pos => !creep.memory.knownReservedSources.includes(mapUtils.getComparableRoomPosition(pos)));
        if (goalPositions.length === 0)
        {
            return ALL_PATHS_RESERVED;
        }
        var pathToLinkedHarvestPosition = mapUtils.findPath(creep.pos,
                                          mapUtils.refreshRoomPositionArray(goalPositions), otherNonMovingCreepPositions, [], 50);
        if (!pathToLinkedHarvestPosition.incomplete && pathToLinkedHarvestPosition.path.length > 0)
        {
            var pathWithStartPosition = pathToLinkedHarvestPosition.path;
            pathWithStartPosition.unshift(creep.pos);
            creep.memory.pathToKey = pathManager.addPath(pathWithStartPosition, pathWithStartPosition[pathWithStartPosition.length - 1]);
            var terrainPath = pathManager.getTerrainPath(creep.memory.pathToKey);
            if (terrainPath)
            {
                var stringSourcePosition = mapUtils.getComparableRoomPosition(terrainPath.path[terrainPath.path.length - 1]);
                if (!creepUtils.reserve_Source(creep, terrainPath, stringSourcePosition) && goalPositions.includes(stringSourcePosition))
                {
                    return pathToLinkedHarvestPosition(creep, mappedInfo); //try again without this goal position
                }
            }
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
                var comparableLinkedPosition = mapUtils.getComparableRoomPosition(linkedPos);
                if (!creep.memory.knownReservedSources.includes(comparableLinkedPosition))
                {
                    var terrainPath = pathManager.getTerrainPath(creep.memory.pathToKey);
                    var reservedPath = terrainPath && collectionPositionWillBeOpen(creep, terrainPath.path, linkedPos) &&
                        creepUtils.reserve_Source(creep, terrainPath, comparableLinkedPosition);
                    if (reservedPath)
                    {
                        return creepUtils.tryMoveByPath(creep, terrainPath.path);
                    }
                }
            }
        });
        return creepUtils.pathToLinkedHarvestPosition(creep, mappedInfo);
    },
    moveToSourceByMappedInfo: function (creep, source, mappedInfo)
    {
        var terrainPath;
        var path = [];
        var stringSourcePosition = '';
        if (!creep.memory.pathToKey)
        {
            creep.memory.pathToKey = pathManager.getKey(creep.pos, mappedInfo.collectionPosition);
        }
        if (creep.memory.pathToKey)
        {
            terrainPath = pathManager.getTerrainPath(creep.memory.pathToKey);
            path = terrainPath ? terrainPath.path : [];
            stringSourcePosition = terrainPath ? mapUtils.getComparableRoomPosition(path[path.length - 1]) : '';

            var hasSourceReserved = creep.room.memory.reservedSources[stringSourcePosition].frames === creep.memory.framesToSource;
            if (!hasSourceReserved && !creep.memory.knownReservedSources.includes(stringSourcePosition))
            {
                creepUtils.reserve_Source(creep, terrainPath, stringSourcePosition);
            }
        }

        var canUseSavedPath = creep.memory.pathToKey &&
                              collectionPositionWillBeOpen(creep, path, mappedInfo.collectionPosition);
        var moveResults = NO_PATH;

        if (canUseSavedPath) 
        {
            moveResults = creepUtils.tryMoveByPath(creep, path);
        }
        
        if (creepUtils.recalculate_path_errors.includes(moveResults))
        {
            creepUtils.resetSavedPathToSource(creep, true);
            moveResults = creepUtils.moveToALinkedHarvestPosition(creep, mappedInfo);
        }
        if (creepUtils.recalculate_path_errors.includes(moveResults))
        {
            creepUtils.resetSavedPathToSource(creep);
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

        if (harvestResult === ERR_NOT_IN_RANGE)
        {
            creep.memory.isMoving = creep.fatigue === 0;
            creep.memory.harvestFramesLeft = 0;
            creepUtils.incrementFramesToSource(creep);
            if (creep.memory.isMoving)
            {
                if (mappedInfo)
                {
                    creepUtils.moveToSourceByMappedInfo(creep, source, mappedInfo);
                }
                else
                {
                    creep.moveTo(source);
                }
            }
        }
        else
        {
            creep.memory.isMoving = false;
            creepUtils.resetSavedPathToSource(creep);
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