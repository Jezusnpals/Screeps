var creepUtils = require('creepUtils');
var behaviorEnum = require('behaviorEnum');
var mapUtils = require('mapUtils');

function transferEnergy(creep, creepHarvestInfo)
{
    var structure = creepHarvestInfo ? Game.getObjectById(creepHarvestInfo.structureId) :
        creep.room.find(FIND_STRUCTURES).filter(s => s.structureType == STRUCTURE_SPAWN)[0];

    var structureNeedsEnergy = structure.energy < structure.energyCapacity;

    if (!structureNeedsEnergy)
    {
        var openExtensions = creep.room.memory.extensionHarvestKeys
        .filter(ek => creep.room.memory.Infos[behaviorEnum.HARVESTER][ek] &&
            creep.room.memory.Infos[behaviorEnum.HARVESTER][ek].creepNames.length === 0)
        .map(ek => Game.getObjectById(creep.room.memory.Infos[behaviorEnum.HARVESTER][ek].structureId))
        .filter(e => e.energy < e.energyCapacity);

        if (openExtensions.length > 0)
        {
            var closestOpenExtension = openExtensions.reduce(function(e1, e2) {
                var distanceToE1 = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, e1.pos);
                var distanceToE2 = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, e2.pos);
                return distanceToE1 < distanceToE2 ? e1 : e2;
            });
            structure = closestOpenExtension;
        }
        else
        {
            var openSpawns = creep.room.find(FIND_MY_SPAWNS)
                             .filter(s => s.energy < s.energyCapacity);
            if (openSpawns.length > 0)
            {
                var closestOpenSpawn = openSpawns.reduce(function (s1, s2) {
                    var distanceToS1 = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, s1.pos);
                    var distanceToS2 = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, s2.pos);
                    return distanceToS1 < distanceToS2 ? s1 : s2;
                });
                structure = closestOpenSpawn;
            }
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
        var infoKey = creep.memory.infoKeys[behaviorEnum.HARVESTER];
        var creepHarvestInfo = infoKey ? creep.room.memory.Infos[behaviorEnum.HARVESTER][infoKey] : null;
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