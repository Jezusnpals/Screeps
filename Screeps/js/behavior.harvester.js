var creepUtils = require('creepUtils');
var behaviorEnum = require('behaviorEnum');

function transferEnergy(creep, creepHarvestInfo)
{
    var structure = creepHarvestInfo ? Game.getObjectById(creepHarvestInfo.structureId) :
        creep.room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_SPAWN)[0];
    var transferResults = creep.transfer(structure, RESOURCE_ENERGY);

    if (transferResults == ERR_NOT_IN_RANGE)
    {
        creep.memory.isMoving = creep.fatigue === 0;
        if (creep.memory.isMoving)
        {
            if (creepHarvestInfo)
            {
                creepUtils.moveToStructureByMappedInfo(creep, structure, creepHarvestInfo);
            }
            else
            {
                creep.moveTo(structure);
            }
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
        var creepHarvestInfo = creep.memory.infoKeys[behaviorEnum.HARVESTER] >= 0 ? creep.room.memory.Infos[behaviorEnum.HARVESTER][creep.memory.infoKeys[behaviorEnum.HARVESTER]] : null;
        if (creepNeedsEnergy)
        {
            creepUtils.harvestEnergy(creep, creepHarvestInfo);
        }
        else 
        {
            transferEnergy(creep, creepHarvestInfo);
        }
    }
};

module.exports = harvester;