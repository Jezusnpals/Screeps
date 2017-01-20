var collectionInfoManager = require('collectionInfoManager');

var events =
{
    onStructureComplete: function (creep, newStructureId)
    {
        collectionInfoManager.onStructureComplete(creep, newStructureId);
    }
};

module.exports = events;