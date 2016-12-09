var creepUtils = require('creepUtils');
var roomManager = require('roomManager');
var creepUtils = require('creepUtils');

function transferEnergy(creep, creepControlInfo) {
    var controller = creep.room.controller;
    var transferResults = creep.upgradeController(controller);

    if (transferResults == ERR_NOT_IN_RANGE)
    {
        creep.memory.isMoving = true;
        if (creepControlInfo)
        {
            creepUtils.moveToStructureByMappedInfo(creep, controller, creepControlInfo)
        }
        else
        {
            creep.moveTo(controller);
        }
    } else
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