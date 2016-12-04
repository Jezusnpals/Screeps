var harvester = require('behavior.harvester');
var upgrader = require('behavior.upgrader');
var builder = require('behavior.builder');

var behavior =
{
    HARVESTER: 'harvester',
    UPGRADER: 'upgrader',
    BUILDER: 'builder',
    Dictonary: {},
    run: function (creep) {
        this.Dictonary[creep.memory.behavior].run(creep);
    }

};

//Create dictonary
behavior.Dictonary[behavior.HARVESTER] = harvester;
behavior.Dictonary[behavior.UPGRADER] = upgrader;
behavior.Dictonary[behavior.BUILDER] = builder;

module.exports = behavior;