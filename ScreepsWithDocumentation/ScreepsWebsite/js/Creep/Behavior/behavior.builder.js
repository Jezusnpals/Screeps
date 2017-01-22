var creepUtils = require('creepUtils');
var mapUtils = require('mapUtils');
var behaviorEnum = require('behaviorEnum');
var events = require('events');
var collectionInfoRepository = require('collectionInfoRepository');

function completedBuilding(creep, newStructure)
{
    events.onStructureComplete(creep, newStructure.id);
}

function transferEnergy(creep, creepBuildInfo)
{
    var structure = creepBuildInfo ? Game.getObjectById(creepBuildInfo.structureId) :
        null;
    if (!structure && creepBuildInfo)
    {
        var structuresInRoom = creep.room.lookAt(mapUtils.refreshRoomPosition(creepBuildInfo.extensionPosition))
                               .filter(rla => rla.type === 'structure');
        if (structuresInRoom.length === 1)
        {
            structure = structuresInRoom[0].structure;
        }
    }
    if (!structure || !creepBuildInfo)
        return;

    var buildResult = creep.build(structure);



    if (buildResult === ERR_INVALID_TARGET)
    {
        creepUtils.moveToStructureByMappedInfo(creep, structure, creepBuildInfo);
        completedBuilding(creep, structure);
        return;
    }

    var onACollectionPosition = creepBuildInfo.linkedCollectionPositions
                                   .concat([creepBuildInfo.collectionPosition])
                                   .map(pos => mapUtils.getComparableRoomPosition(pos))
                                   .includes(mapUtils.getComparableRoomPosition(creep.pos));

   
    if (buildResult === ERR_NOT_IN_RANGE || onACollectionPosition)
    {
        creep.memory.isMoving = creep.fatigue === 0;
       
        if (creep.memory.isMoving)
        {
            creepUtils.moveToStructureByMappedInfo(creep, structure, creepBuildInfo);
        }
    }
    else
    {
        creep.memory.isMoving = false;
    }
}

var builder = {

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

        var infoKey = creep.memory.infoKeys[behaviorEnum.BUILDER];
        var creepBuildInfo = infoKey ? collectionInfoRepository.getInfo(creep.room, behaviorEnum.BUILDER, infoKey ): null;
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