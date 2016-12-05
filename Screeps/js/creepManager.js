var behaviorEnum = require('behaviorEnum');

function calculateHarvestCost(info) {
    return info.costTo + (info.costTo / (info.maxCreeps - info.creepNames.length));
}

var creepManager =
{
    calculateBestSource: function (infos) {
        var openInfos = infos.filter(info => info.creepNames.length < info.maxCreeps); //maxCreeps
        if (openInfos.length == 0) {
            return null;
        }

        var lowestCost = calculateHarvestCost(openInfos[0]);
        var lowestCostIndex = 0;

        for (var i = 1; i < openInfos.length; i++) {
            var currentCost = calculateHarvestCost(openInfos[i]);
            if (currentCost < lowestCost) {
                lowestCost = currentCost;
                lowestCostIndex = i;
            }
        }

        return openInfos[lowestCostIndex];
    },
    run: function (room) {
        if (Object.keys(Game.creeps).length < 200 && Game.spawns['Spawn1'].energy >= 200)
        {
            if (Object.keys(Game.creeps).length % 2 == 0)
            {
                if (room.memory.harvestInfos)
                {
                    var bestHarvestInfo = this.calculateBestSource(room.memory.harvestInfos);
                    if (bestHarvestInfo != null)
                    {
                        var bestHarvestInfoIndex = room.memory.harvestInfos.indexOf(bestHarvestInfo);
                        var creepName = 'H' + new Date().getTime();
                        var creepResult = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], creepName, { behavior: behaviorEnum.HARVESTER, harvestInfoIndex: bestHarvestInfoIndex });
                        if (creepResult == creepName)
                        {
                            room.memory.harvestInfos[bestHarvestInfoIndex].creepNames.push(creepName);
                        }
                    }
                }
            }
            else
            {
                if (room.memory.controlInfos)
                {
                    var bestControlInfo = this.calculateBestSource(room.memory.controlInfos);
                    if (bestControlInfo != null)
                    {
                        var bestControlInfoIndex = room.memory.controlInfos.indexOf(bestControlInfo);
                        var creepName = 'U' + new Date().getTime();
                        var creepResult = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], creepName, { behavior: behaviorEnum.UPGRADER, controlInfoIndex: bestControlInfoIndex });
                        if (creepResult == creepName)
                        {
                            room.memory.controlInfos[bestControlInfoIndex].creepNames.push(creepName);
                        }
                    }
                }
            }
        }
  
    }
}
module.exports = creepManager;
