var behavior = require('behavior');

function calculateHarvestCost(info) {
    return info.costTo + (info.costTo / (info.maxHarvesters - info.creepIds.length));
}

var creepManager =
{
    calculateHarvestSource: function (harvestInfos) {
        var openHarvestInfos = harvestInfos.filter(info => info.creepIds.length < info.maxHarvesters); //maxHarvesters
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
        if (Object.keys(Game.creeps).length < 200 && Game.spawns['Spawn1'].energy >= 200) {
            if (room.memory.harvestInfos) {
                var bestHarvestInfo = this.calculateHarvestSource(room.memory.harvestInfos);

                if (bestHarvestInfo != null) {
                    var creepName = 'H' + new Date().getTime();
                    var creepResult = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], creepName, { behavior: behavior.HARVESTER, harvestInfo: bestHarvestInfo });
                    if (creepResult == creepName) {
                        bestHarvestInfo.creepIds.push(Game.creeps[creepName].id);
                    }
                }
            }
        }
    }
}
module.exports = creepManager;
