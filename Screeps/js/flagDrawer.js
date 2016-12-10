var pathManager = require('pathManager');
var mapUtils = require('mapUtils');
var infoEnum = require('infoEnum');

var showFlagsForToPaths = false;
var showFlagsForSourcePoints = false;
var showFlagsForFromPaths = false;

var flagDrawer = {
    showFlags: function(room)
    {
        if (showFlagsForToPaths) {
            room.memory.harvestInfos.forEach(function (info, i)
            {
                pathManager.getPath(info.pathToKey).forEach(function (pointOnPath, j)
                {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    room.createFlag(pointOnPath, 't' +i + j, colors[1]);
                });


                mapUtils.refreshRoomPositionArray(info.returnPathBlockers).forEach(function (pointOnPath, j)
                {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    room.createFlag(pointOnPath, 'f' +i + j, colors[0]);
                });
            });
            room.memory.controlInfos.forEach(function (info, i) {
                pathManager.getPath(info.pathToKey).forEach(function (pointOnPath, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    room.createFlag(pointOnPath, 'ct' + i + j, colors[4]);
                });


                mapUtils.refreshRoomPositionArray(info.returnPathBlockers).forEach(function (pointOnPath, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE];
                    room.createFlag(pointOnPath, 'cf' + i + j, colors[5]);
                });
            });
        }
        if (showFlagsForSourcePoints)
        {
            room.memory.mappedSources.forEach(function (value, i) {
                mapUtils.refreshRoomPositionArray(value.collectionPositions).forEach(function (pos, j) {
                    var colors = [COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE]
                    room.createFlag(pos, 'p' +i + j, colors[2]);
                });
            });
        }
        if (showFlagsForFromPaths)
        {

            var spawnIndexs = Object.keys(Memory.pathManager.pathFromSourceDictionary)
                .map(k => k.includes(infoEnum.SPAWN) ? Memory.pathManager.pathFromSourceDictionary[k] : -1)
                .filter(index => index != -1);
            Memory.pathManager.pathFromList.forEach(function (path, i) {
                mapUtils.refreshRoomPositionArray(path).forEach(function (pointOnPath, j) {
                    var color = spawnIndexs.includes(i) ? COLOR_ORANGE : COLOR_GREY;
                    room.createFlag(pointOnPath, 'f' + i + j, color);
                });
            });
        }
    }
}

module.exports = flagDrawer;