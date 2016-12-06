var pathManager = require('pathManager');

var showFlagsForPaths = true;
var showFlagsForSourcePoints = false;

var showFlagForHarvestInfo = 'returnPathBlockers';

var flagDrawer = {
    showFlags: function(room)
    {
        if (showFlagsForPaths) {
            room.memory.harvestInfos.forEach(function (info, i) {
                pathManager.getPathTo(info.pathToId).forEach(function (pointOnPath, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    //room.createFlag(pointOnPath, 'f' + + i + j + k, colors[i % colors.length]);
                    room.createFlag(pointOnPath, 't' + +i + j, colors[1]);
                });

                info[showFlagForHarvestInfo].forEach(function (pointOnPath, k) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    //room.createFlag(pointOnPath, 'f' + + i + j + k, colors[i % colors.length]);
                    room.createFlag(pointOnPath, 'f' + +i + j, colors[0]);
                });
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

module.exports = flagDrawer;