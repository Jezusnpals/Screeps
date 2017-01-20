var behaviorEnum = require('behaviorEnum');
var roleEnum = require('roleEnum');
var collectionInfoManager = require('collectionInfoManager');
var infoEnum = require('infoEnum');
var explorationUtils = require('explorationUtils');
var reservedCollectionPositionManager = require('reservedCollectionPositionManager');
var collectionInfoRepository = require('collectionInfoRepository');

var creepManager =
{
    initialize: function (room)
    {
        reservedCollectionPositionManager.initialize(room);
    },
    calculateCreepInfo: function (creepBodies)
    {
        var resourcesPerCarry = 50;
        var harvestRatePerWork = 2;
        var structureRatePerWork = 5;
        var upgradeRatePerWork = 1;
        var numberOfMoveParts = creepBodies.filter(cb => cb === MOVE).length;
        var numberOfCarryParts = creepBodies.filter(cb => cb === CARRY).length;
        var numberOfWeightBodyParts = creepBodies.length - numberOfCarryParts - numberOfMoveParts;
        var plain = 1;
        var swamp = 5;

        var moveToSourceOnPlainRate = Math.ceil(plain * numberOfWeightBodyParts / numberOfMoveParts);
        var moveFromSourceOnPlainRate = Math.ceil(plain * (numberOfWeightBodyParts + numberOfCarryParts) / numberOfMoveParts);

        var moveToSourceOnSwampRate = Math.ceil(swamp * numberOfWeightBodyParts / numberOfMoveParts);
        var moveFromSourceOnSwampRate = Math.ceil(swamp * (numberOfWeightBodyParts + numberOfCarryParts) / numberOfMoveParts);

        var numberOfWorkParts = creepBodies.filter(cb => cb === WORK).length;
        var buildRate = (structureRatePerWork * numberOfWorkParts);
        var maxCarryAmount = (resourcesPerCarry * numberOfCarryParts);
        var harvestFrames = Math.ceil(maxCarryAmount / (harvestRatePerWork * numberOfWorkParts));
        var buildFrames = Math.ceil(maxCarryAmount / buildRate);
        var upgradeFrames = Math.ceil(maxCarryAmount / (upgradeRatePerWork * numberOfWorkParts));

        return  {
            harvestFrames: harvestFrames,
            buildFrames: buildFrames,
            upgradeFrames: upgradeFrames,
            buildRate: buildRate,
            moveToSourceOnPlainRate: moveToSourceOnPlainRate,
            moveFromSourceOnPlainRate: moveFromSourceOnPlainRate,
            moveToSourceOnSwampRate: moveToSourceOnSwampRate,
            moveFromSourceOnSwampRate: moveFromSourceOnSwampRate,
            maxCarryAmount: maxCarryAmount
        }
    },
    tryCreateWorker(room, behaviorType) 
    {
        var infos = collectionInfoRepository.getInfos(room, behaviorType);
        var creepBodies = [WORK, CARRY, MOVE];
        var startMemory = {
            behavior: behaviorType,
            pathFromKey: '',
            pathToKey: '',
            isMoving: true,
            framesToSource: -1,
            knownReservedSources: [],
            infoKeys: {},
            role: roleEnum.WORKER
        };
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);

        var bestInfo = collectionInfoManager.calculateBestSource(infos, room, startMemory.creepInfo);
        if (bestInfo != null)
        {
            var creepName = 'cW' + new Date().getTime();
            
            startMemory.infoKeys[behaviorType] = bestInfo.key;
            var creepResult = Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
            if (creepResult == creepName) 
            {
                bestInfo.creepNames.push(creepName);
                collectionInfoManager.addPercentFilled(bestInfo, room, startMemory.creepInfo);
                return true;
            }
        }
        return false;
    },
    createWorkerWithoutInfo: function (room, behaviorType)
    {
        var startMemory = {
            behavior: behaviorType,
            pathFromKey: '',
            pathToKey: '',
            isMoving: true,
            framesToSource: -1,
            knownReservedSources: [],
            infoKeys: {},
            role: roleEnum.WORKER
        };
        var creepName = 'cW' + new Date().getTime();
        var creepBodies = [WORK, CARRY, MOVE];
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);
        Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
    },
    createScout: function (room, behaviorType)
    {
        var startMemory = {
            behavior: behaviorType,
            pathToKey: '',
            isMoving: true,
            role: roleEnum.SCOUT
        };
        var creepName = 'cS' + new Date().getTime();
        var creepBodies = [TOUGH, MOVE, MOVE];
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);
        Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
    },
    createCreeps: function(room) 
    {
        var createdCreep = false;
        
        if (room.energyAvailable >= 200)
        {
            var creeps = Object.keys(Game.creeps).map(key => Game.creeps[key]);
            var numHarvestors = creeps.filter(c => c.memory.behavior === behaviorEnum.HARVESTER).length;
            var numUpgraders = creeps.filter(c => c.memory.behavior === behaviorEnum.UPGRADER).length;
            var atLeastOneUpgraderAndHarvester = numHarvestors > 0 && numUpgraders > 0;
            if (room.memory.finishedMapping && room.memory.extensionBuildKeys.length > 0 && atLeastOneUpgraderAndHarvester)
            {
                createdCreep = this.tryCreateWorker(room, behaviorEnum.BUILDER);

                if (createdCreep)
                {
                    return;
                }
            }
            if (numHarvestors <= numUpgraders)
            {
                if (room.memory.finishedMapping)
                {
                    createdCreep = this.tryCreateWorker(room, behaviorEnum.HARVESTER);
                }
                else
                {
                    this.createWorkerWithoutInfo(room, behaviorEnum.HARVESTER);
                    createdCreep = true;
                }
            }
            else
            {
                if (room.memory.finishedMapping)
                {
                    createdCreep = this.tryCreateWorker(room, behaviorEnum.UPGRADER);
                }
                else
                {
                    this.createWorkerWithoutInfo(room, behaviorEnum.UPGRADER);
                    createdCreep = true;
                }
            }
            if (!createdCreep)
            {
                if (explorationUtils.checkExistAvailableRoomToExplore())
                {
                    this.createScout(room, behaviorEnum.EXPLORER);
                }
                else if (explorationUtils.checkExistAvailableRoomToWatch())
                {
                    this.createScout(room, behaviorEnum.WATCH);
                }
            }
        }
    },
    run: function (room)
    {
        reservedCollectionPositionManager.run(room);
        creepManager.createCreeps(room);;
    },
    cleanUp: function (room, name)
    {
        reservedCollectionPositionManager.cleanUp(room, name);
    }
}
module.exports = creepManager;
