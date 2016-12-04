var pathManager = require('pathManager');

var creepUtils =
{
    NO_NEXT_POSITION: -6,
    NEXT_POSITION_TAKEN: -7,
    tryMoveByPath: function(creep, path)
    {
        var moveToPosition = pathManager.getNextPathPosition(creep.pos, path);
        if(!moveToPosition)
        {
            return this.NO_NEXT_POSITION;
        }
        var positionOpen = creep.room.lookAt(moveToPosition).length <= 1;
        if (!positionOpen)
        {
            return this.NEXT_POSITION_TAKEN;
        }
        return creep.moveByPath([creep.pos, moveToPosition]);
    }
};

module.exports = creepUtils;