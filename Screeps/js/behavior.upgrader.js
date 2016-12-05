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
    creep.moveTo(controller);
}

function transferEnergy(creep, creepControlInfo) {
    var controller = creep.room.controller;
    var transferResults = creep.upgradeController(controller);

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

        if (creep.memory.upgrading && creep.carry.energy == 0)
        {
            creep.memory.upgrading = false;
            }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.upgrading = true;
        }

        var creepControlInfo = creep.memory.controlInfoIndex >= 0 ? creep.room.memory.controlInfos[creep.memory.controlInfoIndex] : null;
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