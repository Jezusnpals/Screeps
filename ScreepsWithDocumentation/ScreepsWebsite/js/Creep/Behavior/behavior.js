var harvester = require('behavior.harvester');
var upgrader = require('behavior.upgrader');
var builder = require('behavior.builder');
var explorer = require('behavior.explorer');
var watch = require('behavior.watch');
var ranger = require('behavior.ranger');
var behaviorEnum = require('behaviorEnum');

var behavior =
{
    Dictonary: {},
    run: function (creep)
    {
        if (!creep.spawning)
        {
            this.Dictonary[creep.memory.behavior].run(creep);
        }
    }

};

//Create dictonary
behavior.Dictonary[behaviorEnum.HARVESTER] = harvester;
behavior.Dictonary[behaviorEnum.UPGRADER] = upgrader;
behavior.Dictonary[behaviorEnum.BUILDER] = builder;
behavior.Dictonary[behaviorEnum.EXPLORER] = explorer;
behavior.Dictonary[behaviorEnum.WATCH] = watch;
behavior.Dictonary[behaviorEnum.RANGER] = ranger;

module.exports = behavior;