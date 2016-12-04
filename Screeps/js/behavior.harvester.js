var mapUtils = require('mapUtils');

var harvester = {

    /** @param {Creep} 
        var harvestInfo = {
        spawnPosition: spawnPosition,
        collectionPosition: collectionPosition,
        creepIds: [],
        pathTo: [],
        costTo: -1,
        returnPath: [],
        isSeperateReturnPath: false,
        returnPathBlockers: [],
        canGetTo: false,
        maxHarvesters: 0
    };
    
    creep **/
    run: function (creep) {
        if (creep.memory.harvestInfo) {
            if (creep.carry.energy < creep.carryCapacity) {
                var source = Game.getObjectById(creep.memory.harvestInfo.sourceId);
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    //console.log(creep.moveByPath(creep.memory.harvestInfo.pathTo));
                    //var pathToCollectionResults = PathFinder.search(creep.pos, creep.memory.harvestInfo.collectionPosition,{
                    //    maxRooms: 1
                    //});
                    var otherCreepPositions = Object.keys(Game.creeps).map(function (key) {
                        return Game.creeps[key];
                    }).filter(c => c.id != creep.id).map(c => c.pos);

                    var pathToCollectionResults = mapUtils.findPath(creep.pos, mapUtils.refreshRoomPositionArray(creep.memory.harvestInfo.linkedCollectionPositions), otherCreepPositions);

                    if (!pathToCollectionResults.incomplete) {

                        creep.moveByPath(pathToCollectionResults.path);
                    }
                    else {
                        creep.moveTo(creep.memory.harvestInfo.collectionPosition.x, creep.memory.harvestInfo.collectionPosition.y);
                    }


                }
            }
            else {
                var spawn = Game.getObjectById(creep.memory.harvestInfo.spawnId);
                if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn);
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