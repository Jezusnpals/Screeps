var creepUtils = require('creepUtils');
var roomManager = require('roomManager');
var creepUtils = require('creepUtils');

function moveToStructureByControlInfo(creep, controller, creepControlInfo) {
    /*
    var harvestIdNotSet = !creep.memory.harvestPathFromId || creep.memory.harvestPathFromId == -1
    if (harvestIdNotSet) {
        creep.memory.harvestPathFromId = roomManager.getCollectionPositionInfo(creep.room, creep.pos, creepControlInfo.sourceId).harvestPathFromId;
    }
    var creepFollowHarvestPathFromResult = creepUtils.tryMoveByPath(creep, pathManager.getHarvestPathFromByIndex(creep.memory.harvestPathFromId));
    if (creepFollowHarvestPathFromResult != OK) {
        creep.moveTo(structure);
    }
    */
    creep.moveTo(structure);
}

function transferEnergy(creep, creepControlInfo) {
    var controller = creep.room.controller;
    var transferResults = creep.upgradeController(target)(controller);

    if (transferResults = ERR_NOT_IN_RANGE)
    {
        if (creepControlInfo)
        {
            moveToStructureByControlInfo(creep, controller, creepControlInfo)
        }
        else
        {
            creep.moveTo(controller);
        }
    }
}

var upgrader =
    {
    run: function (creep)
    {
        var creepNeedsEnergy = creep.carry.energy < creep.carryCapacity;
        var creepControlInfo = creep.memory.controlInfoIndex >= 0 ? creep.room.memory.controlInfos[creep.memory.controlInfoIndex] : null;
        if (creepNeedsEnergy)
        {
            creepUtils.harvestEnergy(creep, creepControlInfo);
        }
        else
        {
            transferEnergy(creep, creepControlInfo);
        }
        
        /*
        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('upgrading');
        }

        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        */
    }
};

module.exports = upgrader;