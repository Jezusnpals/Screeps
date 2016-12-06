var pathManager = require('pathManager');
var mapUtils = require('mapUtils');

var showFlagsForToPaths = false;
var showFlagsForSourcePoints = false;
var showFlagsForFromPaths = false;

var flagDrawer = {
    showFlags: function(room)
    {
        if (showFlagsForToPaths) {
            room.memory.harvestInfos.forEach(function (info, i) {
                pathManager.getPathTo(info.pathToId).forEach(function (pointOnPath, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    room.createFlag(pointOnPath, 't' +i + j, colors[1]);
                });

                info.returnPathBlockers.forEach(function (pointOnPath, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    room.createFlag(pointOnPath, 'f' +i + j, colors[0]);
                });

                
            });
        }
        if (showFlagsForSourcePoints)
        {
            room.memory.mappedSources.forEach(function (value, i) {
                value.collectionPositions.forEach(function (pos, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE]
                    room.createFlag(pos, 'p' +i + j, colors[2]);
                });
            });
        }
        if (showFlagsForFromPaths)
        {
            Memory.pathManager.pathFromList.forEach(function (path, i) {
                mapUtils.refreshRoomPositionArray(path).forEach(function (pointOnPath, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    room.createFlag(pointOnPath, 'f' + i + j, COLOR_ORANGE);
                });
            });
        }
    }
}

module.exports = flagDrawer;