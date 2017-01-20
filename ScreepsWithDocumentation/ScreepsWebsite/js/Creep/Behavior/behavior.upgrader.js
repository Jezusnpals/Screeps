var creepUtils = require('creepUtils');
var behaviorEnum = require('behaviorEnum');
var collectionInfoRepository = require('collectionInfoRepository');

function transferEnergy(creep, creepControlInfo) {
    var controller = creep.room.controller;
    var transferResults = creep.upgradeController(controller);

    if (transferResults === ERR_NOT_IN_RANGE || creep.energy === 1)
    {
        creep.memory.isMoving = creep.fatigue === 0;
        if (creep.memory.isMoving)
        {
            if (creepControlInfo)
            {
                creepUtils.moveToStructureByMappedInfo(creep, controller, creepControlInfo)
            }
            else
            {
                creep.moveTo(controller);
            }
        }
    }
    else
    {
        creep.memory.isMoving = false;
    }
}

var upgrader =
    {
    run: function (creep)
    {

        if (creep.memory.upgrading && creep.carry.energy == 0)
        {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.upgrading = true;
        }

        var infoKey = creep.memory.infoKeys[behaviorEnum.UPGRADER];
        var creepControlInfo = infoKey ? collectionInfoRepository.getInfo(creep.room, behaviorEnum.UPGRADER, infoKey ): null;
        if (creep.memory.upgrading)
        {
            transferEnergy(creep, creepControlInfo);
        }
        else
        {
            creepUtils.harvestEnergy(creep, creepControlInfo);
        }
        
    }
};

module.exports = upgrader;