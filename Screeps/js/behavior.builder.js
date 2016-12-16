var creepUtils = require('creepUtils');
var mapUtils = require('mapUtils');
var behaviorEnum = require('behaviorEnum');

function transferEnergy(creep, creepBuildInfo)
{
    var structure = creepBuildInfo ? Game.getObjectById(creepBuildInfo.structureId) :
        null;
    if (!structure || !creepBuildInfo)
        return;

    var buildResult = creep.build(structure);

    if (buildResult === ERR_NOT_IN_RANGE || creep.energy <= creep.memory.creepInfo.buildRate)
    {
        creep.memory.isMoving = creep.fatigue === 0;
        if (creep.memory.isMoving)
        {
            creepUtils.moveToStructureByMappedInfo(creep, structure, creepBuildInfo);
        }
    }
    else {
        var onACollectionPosition = creepBuildInfo.linkedCollectionPositions
                                   .concat([creepBuildInfo.collectionPosition])
                                   .map(pos => mapUtils.getComparableRoomPosition(pos))
                                   .includes(mapUtils.getComparableRoomPosition(creep.pos));
        if (onACollectionPosition)
        {
            creepUtils.moveToStructureByMappedInfo(creep, structure, creepBuildInfo);
        }
    }
}

var builder = {

    /** @param {Creep} creep **/
    run: function (creep)
    {

        if (creep.memory.building && creep.carry.energy === 0)
        {
            creep.memory.building = false;
        }
        if (!creep.memory.building && creep.carry.energy === creep.carryCapacity)
        {
            creep.memory.building = true;
        }

        var creepBuildInfo = creep.memory.buildInfoIndex >= 0 ? creep.room.memory.Infos[behaviorEnum.BUILDER][creep.memory.buildInfoIndex] : null;
        if (creep.memory.building)
        {
            transferEnergy(creep, creepBuildInfo);
        }
        else
        {
            creepUtils.harvestEnergy(creep, creepBuildInfo);
        }
    }
};

module.exports = builder;