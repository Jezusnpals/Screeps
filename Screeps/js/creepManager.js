var behaviorEnum = require('behaviorEnum');

function calculateHarvestCost(info) {
    return info.costTo + (info.costTo / (info.maxCreeps - info.creepNames.length));
}

var creepManager =
{
    calculateHarvestSource: function (harvestInfos) {
        var openHarvestInfos = harvestInfos.filter(info => info.creepNames.length < info.maxCreeps); //maxCreeps
        if (openHarvestInfos.length == 0) {
            return null;
        }

        var lowestCost = calculateHarvestCost(openHarvestInfos[0]);
        var lowestCostIndex = 0;

        for (var i = 1; i < openHarvestInfos.length; i++) {
            var currentCost = calculateHarvestCost(openHarvestInfos[i]);
            if (currentCost < lowestCost) {
                lowestCost = currentCost;
                lowestCostIndex = i;
            }
        }

        return openHarvestInfos[lowestCostIndex];
    },
    run: function (room) {
        if (Object.keys(Game.creeps).length < 200 && Game.spawns['Spawn1'].energy >= 200)
        {
            if (room.memory.harvestInfos)
            {
                var bestHarvestInfo = this.calculateHarvestSource(room.memory.harvestInfos);
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
    }
}
module.exports = creepManager;
