var pathManager = require('pathManager');
var mapUtils = require('mapUtils');
var infoEnum = require('infoEnum');
var behaviorEnum = require('behaviorEnum');

var showFlagsForToPaths = false;
var showFlagsForSourcePoints = false;
var showFlagsForFromPaths = false;
var showAllPointsForAllPaths = false;

var flagDrawer = {
    showFlags: function(room)
    {
        if (showAllPointsForAllPaths) {
            var keys = Object.keys(Memory.pathManager.terrainPathDictonary);
            keys.forEach(function(key, i) {
                var path = mapUtils.refreshRoomPositionArray(Memory.pathManager.terrainPathDictonary[key].path);
                path.forEach(function (pos, j)
                {
                    var colors = [
                        COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE
                    ];
                    room.createFlag(pos, 'a' + i + j, colors[i % colors.length]);
                });
            });
        }

        if (showFlagsForToPaths) {
            room.memory.Infos[behaviorEnum.HARVESTER].forEach(function (info, i)
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
            room.memory.Infos[behaviorEnum.UPGRADER].forEach(function (info, i) {
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