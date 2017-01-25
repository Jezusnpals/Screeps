var pathRepository = require('pathRepository');
var mapUtils = require('mapUtils');
var pathUtils = require('pathUtils');
var reservedCollectionPositionsRepository = require('reservedCollectionPositionsRepository');

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

function collectionPositionWillBeOpen(creep, goalPos)
{
    if (creep.memory.framesToSource === -1)
    {
        return false;
    }
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

    return creep.memory.framesToSource > Game.creeps[myNonMovingCreeps[0].creep.name].memory.harvestFramesLeft;
}

function logRoomPathWarning(warningText, creep, targetRoom)
{
    let exits = Game.map.describeExits(creep.room.name);
    exits = Object.keys(exits).map(key => exits[key]);
    console.log(warningText +
    `behavior ${creep.memory.behavior}  roomPath ${creep.memory.roomPath} path ${creep.memory.pathToExit} room ${creep.room.name} targetRoom ${targetRoom} exits ${exits}`);
}

function findPathAvoidingBlockedPositions(creep, goalPositions, comparableGoalPositions, maxOperations)
{
    var allMyCreepsInTheRoom = creep.room.find(FIND_MY_CREEPS);
    var nonGoalNonMovingCreepPositions = allMyCreepsInTheRoom.filter(c => c.id !== creep.id && (!c.memory.isMoving && c.fatigue == 0) &&
                                                        !comparableGoalPositions.includes(mapUtils.getComparableRoomPosition(c.pos)))
                                       .map(c => c.pos);
    var structurePositions = creep.room.find(FIND_STRUCTURES).map(s => s.pos);
    var constructionSitePositions = creep.room.find(FIND_CONSTRUCTION_SITES).map(s => s.pos);
    var ignorePositions = structurePositions.concat(nonGoalNonMovingCreepPositions).concat(constructionSitePositions);
    
    return mapUtils.findPath(creep.pos, goalPositions, ignorePositions, [], maxOperations);
}

var creepUtils =
{
    recalculate_path_errors: [NEXT_POSITION_TAKEN, NO_NEXT_POSITION, NO_PATH, ALL_PATHS_RESERVED, ERR_NOT_FOUND],
    resetReservedSource: function(creep) 
    {
        var hasSourceReserved = creep.memory.reservedCollectionPositionKey &&
            reservedCollectionPositionsRepository.getReservedCollectionPosition(creep.room, creep.memory.reservedCollectionPositionKey) === creep.memory.framesToSource;
        if (hasSourceReserved)
        {
            reservedCollectionPositionsRepository.resetReservedCollectionPosition(creep.room, creep.memory.reservedCollectionPositionKey);
        }
    },
    resetSavedPathToSource: function (creep, keepKnownReserve)
    {
        creepUtils.resetReservedSource(creep);
        creep.memory.pathToKey = '';
        creep.memory.framesToSource = -1;
        creep.memory.reservedCollectionPositionKey = '';
        if (keepKnownReserve)
        {
            creep.memory.knownReservedSources = [];
        }
    },
    incrementFramesToSource: function (creep)
    {
        if (!creep.memory.reservedCollectionPositionKey)
        {
            return;
        }
        if (!reservedCollectionPositionsRepository.getReservedCollectionPosition(creep.room, creep.memory.reservedCollectionPositionKey))
        {
            creepUtils.resetSavedPathToSource(creep);
            return;
        }
        var hasSourceReserved = reservedCollectionPositionsRepository.getReservedCollectionPosition(creep.room, creep.memory.reservedCollectionPositionKey).frames === creep.memory.framesToSource;
        if (hasSourceReserved)
        {
            reservedCollectionPositionsRepository.getReservedCollectionPosition(creep.room, creep.memory.reservedCollectionPositionKey).frames--;
            creep.memory.framesToSource--;
        }
        else
        {
            creepUtils.resetSavedPathToSource(creep);
        }
    },
    reserve_Source: function (creep, terrainPath, stringCollectionPosition)
    {
        if (!terrainPath)
        {
            creep.memory.knownReservedSources.push(stringCollectionPosition);
            return false;
        }
        var terrainPathCost = pathUtils.calculateTerrainPathCostToSource(terrainPath, creep.memory.creepInfo);
        var reservedCollectionPosition = reservedCollectionPositionsRepository
            .getReservedCollectionPosition(creep.room, stringCollectionPosition);
        if (reservedCollectionPosition && reservedCollectionPosition.frames < terrainPathCost)
        {
            creepUtils.resetSavedPathToSource(creep, true);
            creep.memory.knownReservedSources.push(stringCollectionPosition);
            return false;
        }
        else
        {
            creepUtils.resetReservedSource(creep);
            creep.memory.framesToSource = terrainPathCost;
            reservedCollectionPositionsRepository.setReservedCollectionPosition(creep.room, stringCollectionPosition, {frames: terrainPathCost, name: creep.name});
            creep.memory.reservedCollectionPositionKey = stringCollectionPosition;
            return true;
        }
    },
    tryMoveByPath: function(creep, path)
    {
        var moveToPosition = pathUtils.getNextPathPosition(creep.pos, path);
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
    pathToLinkedHarvestPosition: function (creep, mappedInfo, alreadyTriedGoals)
    {
        var goalPositions = mappedInfo.linkedCollectionPositions.concat(mappedInfo.collectionPosition);
        goalPositions = goalPositions.filter(pos => !creep.memory.knownReservedSources.includes(mapUtils.getComparableRoomPosition(pos)));
        if (alreadyTriedGoals)
        {
            goalPositions = goalPositions.filter(pos => !alreadyTriedGoals.includes(mapUtils.getComparableRoomPosition(pos)));
        }
        var comparableGoalPositions = goalPositions.map(gp => mapUtils.getComparableRoomPosition(gp));;
        
        if (goalPositions.length === 0)
        {
            return ALL_PATHS_RESERVED;
        }
        var refreshedGoalPositions = mapUtils.refreshRoomPositionArray(goalPositions);
        var pathToLinkedHarvestPosition = findPathAvoidingBlockedPositions(creep, refreshedGoalPositions, comparableGoalPositions, 50);
        if (!pathToLinkedHarvestPosition.incomplete && pathToLinkedHarvestPosition.path.length > 0)
        {
            var pathWithStartPosition = pathToLinkedHarvestPosition.path;
            pathWithStartPosition.unshift(creep.pos);
            creep.memory.pathToKey = pathUtils.addPathTerrainPath(pathWithStartPosition, pathWithStartPosition[pathWithStartPosition.length - 1]);
            var terrainPath = pathRepository.getTerrainPath(creep.memory.pathToKey);
            if (terrainPath)
            {
                var collectionPosition = terrainPath.path[terrainPath.path.length - 1];
                var stringCollectionPosition = mapUtils.getComparableRoomPosition(collectionPosition);
                if ( (!creepUtils.reserve_Source(creep, terrainPath, stringCollectionPosition) ||
                     !collectionPositionWillBeOpen(creep, collectionPosition) ) &&
                     comparableGoalPositions.includes(stringCollectionPosition))
                {
                    alreadyTriedGoals = alreadyTriedGoals ? alreadyTriedGoals : [];
                    alreadyTriedGoals.push(stringCollectionPosition);
                    return creepUtils.pathToLinkedHarvestPosition(creep, mappedInfo, alreadyTriedGoals); //try again without this goal position
                }
            }
        }

        return creepUtils.tryMoveByPath(creep, pathToLinkedHarvestPosition.path);
    },
    moveToALinkedHarvestPosition: function (creep, mappedInfo)
    {
        mappedInfo.linkedCollectionPositions.forEach(function(linkedPos)
        {
            creep.memory.pathToKey = pathUtils.getKey(creep.pos, linkedPos);
            if (creep.memory.pathToKey)
            {
                var comparableLinkedPosition = mapUtils.getComparableRoomPosition(linkedPos);
                if (!creep.memory.knownReservedSources.includes(comparableLinkedPosition))
                {
                    var terrainPath = pathRepository.getTerrainPath(creep.memory.pathToKey);
                    var reservedPath = terrainPath && creepUtils.reserve_Source(creep, terrainPath, comparableLinkedPosition) &&
                                       collectionPositionWillBeOpen(creep, linkedPos);
                    if (reservedPath)
                    {
                        return creepUtils.tryMoveByPath(creep, terrainPath.path);
                    }
                }
            }
        });
        return creepUtils.pathToLinkedHarvestPosition(creep, mappedInfo);
    },
    moveToPositionBySavedPath: function (creep, position) {
        var terrainPath;
        var path = [];
        var stringCollectionPosition = '';
        if (!creep.memory.pathToKey)
        {
            creep.memory.pathToKey = pathUtils.getKey(creep.pos, position);
        }
        if (creep.memory.pathToKey)
        {
            terrainPath = pathRepository.getTerrainPath(creep.memory.pathToKey);
            if (terrainPath)
            {
                path =  terrainPath.path;
                stringCollectionPosition = mapUtils.getComparableRoomPosition(path[path.length - 1]);

                var reservedCollectionPosition = reservedCollectionPositionsRepository
                                                 .getReservedCollectionPosition(creep.room, stringCollectionPosition);
                var hasSourceReserved = reservedCollectionPosition &&
                                        reservedCollectionPosition.frames === creep.memory.framesToSource;
                if (!hasSourceReserved && !creep.memory.knownReservedSources.includes(stringCollectionPosition))
                {
                    creepUtils.reserve_Source(creep, terrainPath, stringCollectionPosition);
                }
            }
            else
            {
                creepUtils.resetSavedPathToSource(creep);
            }
            
        }
        var validPath = path && path.length > 0;
        var goalPosition = validPath ? path[path.length - 1] : null;
        var canUseSavedPath = validPath && creep.memory.pathToKey &&
                              collectionPositionWillBeOpen(creep, goalPosition);
        var moveResults = NO_PATH;

        if (canUseSavedPath) 
        {
            moveResults = creepUtils.tryMoveByPath(creep, path);
        }

        return moveResults;
    },
    moveToSourceByMappedInfo: function (creep, source, mappedInfo)
    {
        var moveResults = creepUtils.moveToPositionBySavedPath(creep, mappedInfo.collectionPosition);
        
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
    harvestEnergy: function (creep, mappedInfo) {
        var adjacentSources = mapUtils.getAdjacentRoomPositions(creep.pos)
            .map(pos => creep.room.lookAt(pos))
            .filter(objectArray => objectArray[0].type === 'source')
            .map(objectArray => objectArray[0].source);
        var source;
        if (adjacentSources.length >= 1)
        {
            source = adjacentSources[0];
        }
        else
        {
            source = mappedInfo ? Game.getObjectById(mappedInfo.sourceId) :
            creep.room.find(FIND_SOURCES).reduce(function (s1, s2) {
                var s1Distance = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, s1.pos);
                var s2Distance = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, s2.pos);
                return s1Distance < s2Distance ? s1 : s2;
            });
        }
        var harvestResult = creep.harvest(source);
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
            creep.memory.pathFromKey = pathUtils.getKey(creep.pos, structure.pos);
        }
        var creepFollowPathFromResult = NO_PATH;
        if (creep.memory.pathFromKey)
        {
            creepFollowPathFromResult = creepUtils.tryMoveByPath(creep, pathRepository.getPath(creep.memory.pathFromKey));
        }
        
        if (creepUtils.recalculate_path_errors.includes(creepFollowPathFromResult))
        {
            creep.memory.pathFromKey = '';
            creep.moveTo(structure);
        }
    },
    followRoomPath: function (creep, targetRoom)
    {
        if (!targetRoom)
        {
            logRoomPathWarning('WARNING: No Target Room ', creep, targetRoom);
            return;
        }
        if (creep.room.name === targetRoom)
        {
            logRoomPathWarning('WARNING: Following room path while in target room. ', creep, targetRoom);
            return;
        }
        if (!creep.memory.roomPath)
        {
            creep.memory.roomPath = mapUtils.findRoomPositionTowardsTargetRoom(creep.room.name, targetRoom);
        }
        var movedSuccessfully = false;
        if (creep.memory.pathToExit)
        {
            if (creep.memory.pathToExit[0].roomName !== creep.room.name)
            {
                creep.memory.pathToExit = null;
            }
            else
            {
                let moveResult = creepUtils.tryMoveByPath(creep, mapUtils.refreshRoomPositionArray(creep.memory.pathToExit));
                if (creepUtils.recalculate_path_errors.includes(moveResult))
                {
                    creep.memory.pathToExit = null;
                }
                else
                {
                    movedSuccessfully = true;
                }
            }
        }

        if (!movedSuccessfully)
        {
            if (creep.memory.roomPath.includes(creep.room.name))
            {
                var indexOfCurrentRoom = creep.memory.roomPath.indexOf(creep.room.name);
                if (indexOfCurrentRoom + 1 < creep.memory.roomPath.length)
                {
                    var exitDirection = creep.room.findExitTo(creep.memory.roomPath[indexOfCurrentRoom + 1]);
                    var exitPositions = creep.room.find(exitDirection);
                    if (mapUtils.getComparableRoomPositionArray(exitPositions)
                        .includes(mapUtils.getComparableRoomPosition(creep.pos)))
                    {
                        creep.moveTo(new RoomPosition(25, 25, creep.memory.roomPath[indexOfCurrentRoom + 1]));
                        creep.memory.pathToExit = null;
                        return;
                    }
                    var pathResults = findPathAvoidingBlockedPositions(creep, exitPositions, exitPositions.map(ep => mapUtils.getComparableRoomPosition(ep)), 2000);;
                    if (pathResults.incomplete || pathResults.path.length < 1) 
                    {
                        logRoomPathWarning('WARNING: Can\'t Find Path To Exit ', creep, targetRoom);
                    }
                    else
                    {
                        pathResults.path.unshift(creep.pos);
                        creep.memory.pathToExit = pathResults.path;
                        let moveResult = creepUtils.tryMoveByPath(creep, creep.memory.pathToExit);
                        if (creepUtils.recalculate_path_errors.includes(moveResult))
                        {
                            logRoomPathWarning('WARNING: Can\'t move by path just calculated ', creep, targetRoom);
                            creep.moveTo(pathResults.path[pathResults.path.length - 1]);;
                            creep.memory.pathToExit = null;
                        }
                    }
                }
                else
                {
                    logRoomPathWarning('WARNING : Next Room Out Of Bounds ', creep, targetRoom);
                    creep.memory.roomPath = null;
                }
            }
            else
            {
                logRoomPathWarning('WARNING: Invalid Room Path ', creep, targetRoom);
                creep.memory.roomPath = null;
            }
        }
    }
};

module.exports = creepUtils;