var pathManager = require('pathManager');

var showFlagsForPaths = true;
var showFlagsForSourcePoints = false;

var showFlagForHarvestInfo = 'returnPathBlockers';

var flapDrawer = {
    showFlags: function(room)
    {
        if (showFlagsForPaths) {
            room.memory.mappedSources.forEach(function (value, i) {
                value.harvestInfos.forEach(function (info, j) {
                    pathManager.getPathTo(info.pathToId).forEach(function (pointOnPath, k) {
                        var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                        //room.createFlag(pointOnPath, 'f' + + i + j + k, colors[i % colors.length]);
                        room.createFlag(pointOnPath, 't' + +i + j + k, colors[1]);
                    });

                    info[showFlagForHarvestInfo].forEach(function (pointOnPath, k) {
                        var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                        //room.createFlag(pointOnPath, 'f' + + i + j + k, colors[i % colors.length]);
                        room.createFlag(pointOnPath, 'f' + +i + j + k, colors[0]);
                    });
                })
            });
        }
        else if (showFlagsForSourcePoints) {
            room.memory.mappedSources.forEach(function (value, i) {
                value.collectionPositions.forEach(function (pos, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE]
                    room.createFlag(pos, 'p' + +i + j, colors[i % colors.length]);
                });
            });
        }
    }
}

module.exports = flapDrawer;