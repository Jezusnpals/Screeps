var harvester = require('behavior.harvester');
var upgrader = require('behavior.upgrader');
var builder = require('behavior.builder');
var behaviorEnum = require('behaviorEnum');

var behavior =
{
    Dictonary: {},
    run: function (creep) {
        this.Dictonary[creep.memory.behavior].run(creep);
    }

};

//Create dictonary
behavior.Dictonary[behaviorEnum.HARVESTER] = harvester;
behavior.Dictonary[behaviorEnum.UPGRADER] = upgrader;
behavior.Dictonary[behaviorEnum.BUILDER] = builder;

module.exports = behavior;