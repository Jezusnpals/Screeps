var pathManager = require('pathManager');
var creepUtils = require('creepUtils');

function transferEnergy(creep, creepHarvestInfo)
{
    var structure = creepHarvestInfo ? Game.getObjectById(creepHarvestInfo.spawnId) :
        creep.room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_SPAWN)[0];
    var transferResults = creep.transfer(structure, RESOURCE_ENERGY);

    if (transferResults == ERR_NOT_IN_RANGE)
    {
        if (creepHarvestInfo)
        {
            creepUtils.moveToStructureByMappedInfo(creep, structure, creepHarvestInfo)
        } else
        {
            creep.moveTo(structure);
        }
    }
    else
    {
        creepUtils.harvestEnergy(creep, creepHarvestInfo); //we should be able to start moving to source and transfer on the same frame
    }
}

var harvester =
{
    run: function (creep)
    {
        var creepNeedsEnergy = creep.carry.energy < creep.carryCapacity;
        var creepHarvestInfo = creep.memory.harvestInfoIndex >= 0 ? creep.room.memory.harvestInfos[creep.memory.harvestInfoIndex] : null;
        if (creepNeedsEnergy)
        {
            creepUtils.harvestEnergy(creep, creepHarvestInfo);
        }
        else 
        {
            creep.memory.isMoving = true;
            transferEnergy(creep, creepHarvestInfo);
        }
    }
};

module.exports = harvester;