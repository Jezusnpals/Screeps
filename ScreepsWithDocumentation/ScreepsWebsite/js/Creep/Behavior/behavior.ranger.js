var mapUtils = require('mapUtils');
var creepUtils = require('creepUtils');

var ranger =
{
    run: function (creep)
    {
        var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);

        if (creep.room.name === creep.memory.roomToAttack.name && hostileCreeps.length > 0)
        {
            var closestCreep = hostileCreeps.reduce(function(c1, c2) {
                var c1Distance = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, c1.pos);
                var c2Distance = mapUtils.calculateDistanceBetweenTwoPointsSq(creep.pos, c2.pos);
                return c1Distance < c2Distance ? c1 : c2;
            });
            
            var rangedAttackResult = creep.rangedAttack(closestCreep);

            if (rangedAttackResult === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(closestCreep);
            }
            else
            {
                var distanceToCreep = Math.sqrt(mapUtils
                    .calculateDistanceBetweenTwoPointsSq(creep.pos, closestCreep.pos));
                if (distanceToCreep <= 2)
                {
                    var pathResults = mapUtils.findPath(creep.pos, { pos: closestCreep, range: 3 }, [], [], 500, true);
                    if (!pathResults.incomplete)
                        creepUtils.tryMoveByPath(pathResults.path);
                }
            }
        }
        else if (creep.memory.roomToAttack && creep.room.name !== creep.memory.roomToAttack.name)
        {
            creepUtils.followRoomPath(creep, creep.memory.roomToAttack.name);
        }
    }
};

module.exports = ranger;