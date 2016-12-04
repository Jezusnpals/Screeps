var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var roomManager = require('roomManager');

var harvester = {
    run: function (creep) {
        if (creep.memory.harvestInfo) {
            if (creep.carry.energy < creep.carryCapacity) {
                creep.memory.harvestPathFromId = -1;
                var source = Game.getObjectById(creep.memory.harvestInfo.sourceId);
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {

                    var otherCreepPositions = Object.keys(Game.creeps).map(function (key) {
                        return Game.creeps[key];
                    }).filter(c => c.id != creep.id).map(c => c.pos);

                    var pathToCollectionResults = mapUtils.findPath(creep.pos, mapUtils.refreshRoomPositionArray(creep.memory.harvestInfo.linkedCollectionPositions), otherCreepPositions);

                    if (!pathToCollectionResults.incomplete) {

                        creep.moveByPath(pathToCollectionResults.path);
                    }
                    else {
                        creep.moveByPath(pathManager.getHarvestPathToByIndex(creep.memory.harvestInfo.pathToId));
                    }


                }
            }
            else {
                var spawn = Game.getObjectById(creep.memory.harvestInfo.spawnId);
                if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    if (!creep.memory.harvestPathFromId || creep.memory.harvestPathFromId == -1)
                    {
                        creep.memory.harvestPathFromId = roomManager.getCollectionPositionInfo(creep.room, creep.pos, creep.memory.harvestInfo.sourceId).harvestPathFromId;
                    }
                    if (creep.memory.harvestPathFromId == -1)
                    {
                        creep.moveTo(spawn);
                    }
                    else
                    {
                        creep.moveByPath(pathManager.getHarvestPathFromByIndex(creep.memory.harvestPathFromId));
                    }
                }
            }
        }
        else {
            if (creep.carry.energy < creep.carryCapacity) {

                var sources = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[3]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[3]);
                }
            }
            else {

                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                creep.say(targets.length)
                if (targets.length > 0) {
                    if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
        }
    }
};

module.exports = harvester;