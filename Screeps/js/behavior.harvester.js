var mapUtils = require('mapUtils');
var pathManager = require('pathManager');
var roomManager = require('roomManager');

const INCOMPLETE_PATH = -20;

function moveToALinkedHarvestPosition(creep, harvestInfo)
{
    var otherCreepPositions = Object.keys(Game.creeps).map(function (key) {
        return Game.creeps[key];
    }).filter(c => c.id != creep.id).map(c => c.pos);

    var pathToLinkedHarvestPosition = mapUtils.findPath(creep.pos, mapUtils.refreshRoomPositionArray(harvestInfo.linkedCollectionPositions), otherCreepPositions, [], 50);
    return creep.moveByPath(pathToLinkedHarvestPosition.path);
}

function moveToSourceByHarvestInfo(creep, source, harvestInfo)
{
    creep.memory.harvestPathFromId = -1;
    
    var harvestPositionOpen = creep.room.lookAt(mapUtils.refreshRoomPosition(harvestInfo.collectionPosition)).length <= 1;
    var movedSuccessfully = -1;

    if (harvestPositionOpen)
    {
        movedSuccessfully = creep.moveByPath(pathManager.getHarvestPathToByIndex(harvestInfo.pathToId));
    }
    if (movedSuccessfully != OK)
    {
        movedSuccessfully = moveToALinkedHarvestPosition(creep, harvestInfo);
    }
    if (movedSuccessfully != OK)
    {
        creep.moveTo(source.pos);
    }
}

function harvestEnergy(creep)
{
    var creepHarvestInfo = creep.memory.harvestInfo;
    var source = creepHarvestInfo ? Game.getObjectById(creep.memory.harvestInfo.sourceId) : 
        creep.room.find(FIND_SOURCES);
    var harvestResult = creep.harvest(source)

    if (harvestResult == ERR_NOT_IN_RANGE)
    {
        if (creepHarvestInfo)
        {
            moveToSourceByHarvestInfo(creep, source, creepHarvestInfo);
        }
        else
        {
            creep.moveTo(source);
        }
    }
}

function moveToStructureByHarvestInfo(creep, structure, harvestInfo)
{
    var harvestIdNotSet = !creep.memory.harvestPathFromId || creep.memory.harvestPathFromId == -1
    if (harvestIdNotSet)
    {
        creep.memory.harvestPathFromId = roomManager.getCollectionPositionInfo(creep.room, creep.pos, creep.memory.harvestInfo.sourceId).harvestPathFromId;
    }
    var creepFollowHarvestPathFromResult = creep.moveByPath(pathManager.getHarvestPathFromByIndex(creep.memory.harvestPathFromId));
    if (creepFollowHarvestPathFromResult != OK)
    {
        creep.moveTo(structure);
    }
}

function transferEnergy(creep)
{
    var creepHarvestInfo = creep.memory.harvestInfo;
    var structure = creep.memory.harvestInfo ? Game.getObjectById(creep.memory.harvestInfo.spawnId) : 
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
            harvestEnergy(creep);
        }
        else 
        {
            transferEnergy(creep);
        }
    }
};

module.exports = harvester;