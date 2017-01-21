var pathRepository = require('pathRepository');
var mapUtils = require('mapUtils');
var infoEnum = require('infoEnum');
var behaviorEnum = require('behaviorEnum');
var collectionInfoRepository = require('collectionInfoRepository');

var showFlagsForToPaths = false;
var showFlagsForSourcePoints = false;
var showFlagsForFromPaths = false;
var showAllPointsForAllPaths = false;

var flagDrawer = {
    showFlags: function(room)
    {
        if (showAllPointsForAllPaths) {
            var keys = Object.keys(Memory.pathRepository.terrainPathDictonary);
            keys.forEach(function(key, i) {
                var path = mapUtils.refreshRoomPositionArray(Memory.pathRepository.terrainPathDictonary[key].path);
                path.forEach(function (pos, j)
                {
                    var colors = [
                        COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_ORANGE, COLOR_WHITE, COLOR_GREEN, COLOR_PURPLE
                    ];
                    room.createFlag(pos, 'a' + i + j, colors[i % colors.length]);
                });
            });
        }

        if (showFlagsForToPaths)
        {

            collectionInfoRepository.getInfoKeys(room, behaviorEnum.HARVESTER).forEach(function (key, i)
            {
                var info = collectionInfoRepository.getInfo(room, behaviorEnum.HARVESTER, key);
                pathRepository.getPath(info.pathToKey).forEach(function (pointOnPath, j)
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
            collectionInfoRepository.getInfoKeys(room, behaviorEnum.UPGRADER).forEach(function (key, i)
            {
                var info = collectionInfoRepository.getInfo(room, behaviorEnum.UPGRADER, key);
                pathRepository.getPath(info.pathToKey).forEach(function (pointOnPath, j) {
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

            var spawnIndexs = Object.keys(Memory.pathRepository.pathFromSourceDictionary)
                .map(k => k.includes(infoEnum.HARVEST) ? Memory.pathRepository.pathFromSourceDictionary[k] : -1)
                .filter(index => index != -1);
            Memory.pathRepository.pathFromList.forEach(function (path, i) {
                mapUtils.refreshRoomPositionArray(path).forEach(function (pointOnPath, j) {
                    var color = spawnIndexs.includes(i) ? COLOR_ORANGE : COLOR_GREY;
                    room.createFlag(pointOnPath, 'f' + i + j, color);
                });
            });
        }
    }
}

module.exports = flagDrawer;