var behaviorEnum = require('behaviorEnum');
var roleEnum = require('roleEnum');
var collectionInfoManager = require('collectionInfoManager');
var explorationUtils = require('explorationUtils');
var reservedCollectionPositionManager = require('reservedCollectionPositionManager');
var collectionInfoRepository = require('collectionInfoRepository');
var militaryUtils = require('militaryUtils');

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
    calculatePossibleBodies(energyAvalible) 
    {
        var workerBodyTypes = [WORK, CARRY, MOVE];
        var possibleBodies = [];

        var moveToMiddle = function (v) 
        {
            v[0]--;
            v[1]++;
        }

        var moveToEnd = function (v) 
        {
            v[0]--;
            v[2]++;
        }

        var maxParts = Math.floor(energyAvalible / 50);

        var start = [maxParts, 0, 0];

        var possibleNumbersOfEachBodyType = [[maxParts, 0, 0]];
        var n1 = start;
        var n2;
        while (n1[0] > 0)
        {
            n2 = n1.slice(0);
            while (n2[0] > 0)
            {
                moveToEnd(n2);
                possibleNumbersOfEachBodyType.push(n2.slice(0));
            }
            moveToMiddle(n1);
            possibleNumbersOfEachBodyType.push(n1.slice(0));
        }

        possibleNumbersOfEachBodyType.forEach(function (numbersOfEachBodyType)
        {
            if (numbersOfEachBodyType[0] % 2 === 0)
            {
                numbersOfEachBodyType[0] /= 2; //Divide workers by 2 because they cost twice as much.
                var currentBodies = [];
                for (let i = 0; i < numbersOfEachBodyType.length; i++)
                {
                    for (let j = 0; j < numbersOfEachBodyType[i]; j++)
                    {
                        currentBodies.push(workerBodyTypes[i]);
                    }
                }
                possibleBodies.push(currentBodies);
            }
            
        });
        return possibleBodies;
    },
    calculateBestCreepCollectionInfoAndParts(room, behavior, infos)
    {
        var startBody = [WORK, CARRY, MOVE];

        var getCollectionInfoAndParts = function (bodyParts)
        {
            var creepInfo = creepManager.calculateCreepInfo(bodyParts);
            var bestCollectionInfo = collectionInfoManager.calculateBestCollectionInfo(infos, room, creepInfo);
            if (!bestCollectionInfo) {
                return {
                    bodyParts: bodyParts,
                    creepInfo: creepInfo,
                    collectionInfo: bestCollectionInfo,
                    totalTime: Number.MAX_VALUE
                }
            }
            var totalTime = collectionInfoManager.calculateTotalFrames( bestCollectionInfo, creepInfo);
            return {
                bodyParts: bodyParts,
                creepInfo: creepInfo,
                collectionInfo: bestCollectionInfo,
                totalTime: totalTime
            }
        }

        if (room.energyAvailable > 200)
        {
            var possibleExtraBodyParts = creepManager.calculatePossibleBodies(room.energyAvailable - 200);
            //collectionInfoManager.calculateBestCollectionInfo(infos, room, startMemory.creepInfo
            var possibleCollectionInfoAndParts = possibleExtraBodyParts.map(function (bodyParts)
            {
                bodyParts = bodyParts.concat(startBody);
                return getCollectionInfoAndParts(bodyParts);
            });
            var fastestCollectionInfoAndParts = possibleCollectionInfoAndParts
                .reduce((c1, c2) => c1.totalTime < c2.totalTime ? c1 : c2);
            return fastestCollectionInfoAndParts;
        }
        else
        {
            return getCollectionInfoAndParts(startBody);
        }

    },
    tryCreateWorker(room, behaviorType) 
    {
        var infos = collectionInfoRepository.getInfos(room, behaviorType);
        var creepCollectionInfoAndParts = creepManager.calculateBestCreepCollectionInfoAndParts(room, behaviorType, infos);
        var startMemory = {
            behavior: behaviorType,
            pathFromKey: '',
            pathToKey: '',
            isMoving: true,
            framesToSource: -1,
            knownReservedSources: [],
            infoKeys: {},
            role: roleEnum.WORKER,
            creepInfo: creepCollectionInfoAndParts.creepInfo
        };

        var bestInfo = creepCollectionInfoAndParts.collectionInfo;
        
        if (bestInfo)
        {
            var creepName = 'cW' + new Date().getTime();
            startMemory.infoKeys[behaviorType] = bestInfo.key;
            var creepResult = Game.spawns['Spawn1'].createCreep(creepCollectionInfoAndParts.bodyParts, creepName, startMemory);
            if (creepResult === creepName) 
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
        var creepBodies = [CARRY, MOVE, WORK, CARRY, MOVE];
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);
        Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
    },
    createScout: function (room, behaviorType)
    {
        var startMemory = {
            behavior: behaviorType,
            isMoving: true,
            role: roleEnum.SCOUT
        };
        var creepName = 'cS' + new Date().getTime();
        var creepBodies = [TOUGH, MOVE, MOVE];
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);
        Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
    },
    tryCreateRanger: function(room, behaviorType) 
    {
        var roomToAttack = militaryUtils.getStrongestRoom();
        if (!roomToAttack)
        {
            console.log('no room to attack');
            return false;
        }
        var startMemory = {
            behavior: behaviorType,
            isMoving: true,
            role: roleEnum.FIGHTER,
            roomToAttack: roomToAttack
        };
        var creepName = 'cR' + new Date().getTime();
        const energyForRangedMove = 150 + 50;
        const energyForToughMove = 50 + 10;
        var numberOfRangedMoveParts = Math.floor(room.energyAvailable / energyForRangedMove);
        var numberOfToughMoveParts = Math.floor((room.energyAvailable - (numberOfRangedMoveParts * energyForRangedMove)) / energyForToughMove);
        var creepBodies = [];
        for (let i = 0; i < numberOfToughMoveParts; i++)
        {
            creepBodies.push(TOUGH);
            creepBodies.push(MOVE);
        }
        for (let i = 0; i < numberOfRangedMoveParts; i++)
        {
            creepBodies.push(RANGED_ATTACK);
            creepBodies.push(MOVE);
        }
            
        startMemory.creepInfo = creepManager.calculateCreepInfo(creepBodies);

        var creepResult = Game.spawns['Spawn1'].createCreep(creepBodies, creepName, startMemory);
        console.log('created ranger: body: '+ JSON.stringify(creepBodies) + creepResult);
        return true;
    },
    createCreeps: function(room) 
    {
        var createdCreep = false;
        const maxHarvestors = 4;
        const maxUpgraders = 4;
        
        if (room.energyAvailable >= room.energyCapacityAvailable)
        {
            var creeps = Object.keys(Game.creeps).map(key => Game.creeps[key]);
            var numHarvestors = creeps.filter(c => c.memory.behavior === behaviorEnum.HARVESTER).length;
            var numUpgraders = creeps.filter(c => c.memory.behavior === behaviorEnum.UPGRADER).length;
            var atLeastOneUpgraderAndHarvester = numHarvestors > 0 && numUpgraders > 0;
            if (room.memory.finishedMapping && room.memory.extensionBuildKeys.length > 0 && atLeastOneUpgraderAndHarvester)
            {
                createdCreep = creepManager.tryCreateWorker(room, behaviorEnum.BUILDER);

                if (createdCreep)
                {
                    return;
                }
            }
            if (numHarvestors <= numUpgraders && numHarvestors < maxHarvestors)
            {
                if (room.memory.finishedMapping)
                {
                    createdCreep = creepManager.tryCreateWorker(room, behaviorEnum.HARVESTER);
                }
                else 
                {
                    creepManager.createWorkerWithoutInfo(room, behaviorEnum.HARVESTER);
                    createdCreep = true;
                }
            }
            else if(numUpgraders < maxUpgraders)
            {
                if (room.memory.finishedMapping)
                {
                    createdCreep = creepManager.tryCreateWorker(room, behaviorEnum.UPGRADER);
                }
                else
                {
                    creepManager.createWorkerWithoutInfo(room, behaviorEnum.UPGRADER);
                    createdCreep = true;
                }
            }

            if (!createdCreep)
            {
                //createdCreep = creepManager.tryCreateRanger(room, behaviorEnum.RANGER);
            }

            if (!createdCreep)
            {
                if (explorationUtils.checkExistAvailableRoomToExplore())
                {
                    creepManager.createScout(room, behaviorEnum.EXPLORER);
                }
                else if (explorationUtils.checkExistAvailableRoomToWatch())
                {
                    creepManager.createScout(room, behaviorEnum.WATCH);
                }
            }
        }
    },
    run: function (room)
    {
        reservedCollectionPositionManager.run(room);
        creepManager.createCreeps(room);
    },
    cleanUp: function (room, name)
    {
        reservedCollectionPositionManager.cleanUp(room, name);
    }
}
module.exports = creepManager;
