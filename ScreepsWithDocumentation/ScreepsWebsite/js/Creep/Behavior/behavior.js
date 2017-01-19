var harvester = require('behavior.harvester');
var upgrader = require('behavior.upgrader');
var builder = require('behavior.builder');
var explorer = require('behavior.explorer');
var watch = require('behavior.watch');
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
behavior.Dictonary[behaviorEnum.EXPLORER] = explorer;
behavior.Dictonary[behaviorEnum.WATCH] = watch;

module.exports = behavior;