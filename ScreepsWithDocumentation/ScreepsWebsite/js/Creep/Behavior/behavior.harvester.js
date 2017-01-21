var creepUtils = require('creepUtils');
var behaviorEnum = require('behaviorEnum');
var mapUtils = require('mapUtils');
var collectionInfoRepository = require('collectionInfoRepository');


function getNewHarvestStructure(creep)
{
    if (creep.memory.lastAssignedHarvestStructureid)
    {
        var possibleStructure = Game.getObjectById(creep.memory.lastAssignedHarvestStructureid);
        var structureNeedsEnergy = possibleStructure.energy < possibleStructure.energyCapacity;
        if (structureNeedsEnergy)
        {
            return possibleStructure;
        }
    }

    var extenions = creep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_EXTENSION }
    });

    var extenionsThatNeedEnergy = extenions
    .filter(e => e.energy < e.energyCapacity);

    if (extenionsThatNeedEnergy.length > 0)
    {
        var clostestExtensionThatNeedsEnergy = extenionsThatNeedEnergy.reduce(function (e1, e2) {
            var distanceToE1 = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, e1.pos);
            var distanceToE2 = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, e2.pos);
            return distanceToE1 < distanceToE2 ? e1 : e2;
        });
        return clostestExtensionThatNeedsEnergy;
    }
    else
    {
        var spawnsThatNeedEnergy = creep.room.find(FIND_MY_SPAWNS)
                         .filter(s => s.energy < s.energyCapacity);
        if (spawnsThatNeedEnergy.length > 0)
        {
            var closestOpenSpawn = spawnsThatNeedEnergy.reduce(function (s1, s2) {
                var distanceToS1 = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, s1.pos);
                var distanceToS2 = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, s2.pos);
                return distanceToS1 < distanceToS2 ? s1 : s2;
            });
            return closestOpenSpawn;
        }
    }

    return null;
}

function transferEnergy(creep, creepHarvestInfo)
{
    var structure = creepHarvestInfo ? Game.getObjectById(creepHarvestInfo.structureId) :
        creep.room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_SPAWN)[0];

    var structureNeedsEnergy = structure.energy < structure.energyCapacity;

    if (!structureNeedsEnergy)
    {
        structure = getNewHarvestStructure(creep);
        if (structure)
        {
            creep.memory.lastAssignedHarvestStructureid = structure.id;
        }
        else
        {
            creep.memory.harvesting = false;
            return;
        }
    }

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
    else if (creep.carry.energy === 0)
    {
        creep.memory.lastAssignedHarvestStructureid = null;
        creep.memory.harvesting = true;
        creepUtils.harvestEnergy(creep, creepHarvestInfo); //we should be able to start moving to source and transfer on the same frame
    }
}

var harvester =
{
    run: function (creep)
    {
        if (creep.memory.harvesting && creep.carry.energy === creep.carryCapacity)
        {
            creep.memory.harvesting = false;
        }
        if (!creep.memory.harvesting && creep.carry.energy === 0)
        {
            creep.memory.lastAssignedHarvestStructureid = null;
            creep.memory.harvesting = true;
        }
        

        var infoKey = creep.memory.infoKeys[behaviorEnum.HARVESTER];
        var creepHarvestInfo = infoKey ? collectionInfoRepository.getInfo(creep.room, behaviorEnum.HARVESTER, infoKey ): null;
        if (creep.memory.harvesting)
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