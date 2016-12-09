var pathManager = require('pathManager');
var creepUtils = require('creepUtils');

function transferEnergy(creep)
{
    var creepHarvestInfo = creep.memory.harvestInfoIndex >= 0 ? creep.room.memory.harvestInfos[creep.memory.harvestInfoIndex] : null;
    var structure = creepHarvestInfo ? Game.getObjectById(creepHarvestInfo.spawnId) :
        creep.room.find(STRUCTURE_SPAWN)[0];
    var transferResults = creep.transfer(structure, RESOURCE_ENERGY);

    if(transferResults = ERR_NOT_IN_RANGE)
    {
        if(creepHarvestInfo)
        {
            creepUtils.moveToStructureByMappedInfo(creep, structure, creepHarvestInfo)
        }
        else
        {
            creep.moveTo(structure);
        }
    }
}

var harvester =
{
    run: function (creep)
    {
        var creepNeedsEnergy = creep.carry.energy < creep.carryCapacity;
        if (creepNeedsEnergy)
        {
            
            var creepHarvestInfo = creep.memory.harvestInfoIndex >= 0 ? creep.room.memory.harvestInfos[creep.memory.harvestInfoIndex] : null;
            creepUtils.harvestEnergy(creep, creepHarvestInfo);
        }
        else 
        {
            transferEnergy(creep);
        }
    }
};

module.exports = harvester;