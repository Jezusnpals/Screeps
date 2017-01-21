var behaviorEnum = require('behaviorEnum');
var infoEnum =
{
    HARVEST: 'harvest',
    UPGRADE: 'upgrade',
    BUILD: 'build',
    IndexNameDictonary: {}
};

infoEnum.IndexNameDictonary[infoEnum.HARVEST] = behaviorEnum.HARVESTER;
infoEnum.IndexNameDictonary[infoEnum.UPGRADE] = behaviorEnum.UPGRADER;
infoEnum.IndexNameDictonary[infoEnum.BUILD] = behaviorEnum.BUILDER;


module.exports = infoEnum;