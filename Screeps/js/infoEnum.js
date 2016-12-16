var behaviorEnum = require('behaviorEnum');
var infoEnum =
{
    SPAWN: 'spawn',
    CONTROL: 'control',
    EXTENSION: 'extension',
    BehaviorDictonary: {}
};

infoEnum.IndexNameDictonary[infoEnum.SPAWN] = behaviorEnum.HARVESTER;
infoEnum.IndexNameDictonary[infoEnum.CONTROL] = behaviorEnum.UPGRADER;
infoEnum.IndexNameDictonary[infoEnum.EXTENSION] = behaviorEnum.BUILDER;


module.exports = infoEnum;