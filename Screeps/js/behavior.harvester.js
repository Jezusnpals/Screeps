var pathManager = require('pathManager');
var roomManager = require('roomManager');
var creepUtils = require('creepUtils');


function moveToStructureByHarvestInfo(creep, structure, harvestInfo)
{
    var harvestIdNotSet = !creep.memory.harvestPathFromId || creep.memory.harvestPathFromId == -1
    if (harvestIdNotSet)
    {
        creep.memory.harvestPathFromId = roomManager.getCollectionPositionInfo(creep.room, creep.pos, harvestInfo.sourceId).harvestPathFromId;
    }
    var creepFollowHarvestPathFromResult = creepUtils.tryMoveByPath(creep, pathManager.getHarvestPathFromByIndex(creep.memory.harvestPathFromId));
    if (creepFollowHarvestPathFromResult != OK)
    {
        creep.moveTo(structure);
    }
}

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
            moveToStructureByHarvestInfo(creep, structure, creepHarvestInfo)
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
            var creepHarvestInfo = creep.memory.harvestInfoIndex >= 0 ? creep.room.memory.harvestInfos[creep.memory.harvestInfoIndex]: null;
            creepUtils.harvestEnergy(creep, creepHarvestInfo);
        }
        else 
        {
            transferEnergy(creep);
        }
    }
};

module.exports = harvester;