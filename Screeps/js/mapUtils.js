var mapUtils = {
    checkInBounds: function (x, y) {
        var roomSize = 50;
        return x >= 0 && x < roomSize && y >= 0 && y <= roomSize;
    },
    getAdjacentRoomPositions: function (roomPos) {
        var adjacentPositions = [];

        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                var samePos = i == 0 & j == 0;
                if (this.checkInBounds(roomPos.x + i, roomPos.y + j) && !samePos) {
                    adjacentPositions.push(new RoomPosition(roomPos.x + i, roomPos.y + j, roomPos.roomName));
                }
            }
        }

        return adjacentPositions;
    },
    isWalkableTerrain: function (roomPos) {
        var walkableTerrain = ['plain', 'swamp']
        var currentTerrain = Game.map.getTerrainAt(roomPos);
        return walkableTerrain.includes(currentTerrain);
    },
    getPath: function (startPos, goals, ignorePositions, avoidPositions) {
        var pathResults = PathFinder.search(startPos, goals,
        {
            maxRooms: 1,

            roomCallback: function (roomName) {
                var costs = new PathFinder.CostMatrix;
                for (var index in ignorePositions) {
                    costs.set(ignorePositions[index].x, ignorePositions[index].y, 0xff);
                }

                for (var index in avoidPositions) {
                    costs.set(avoidPositions[index].x, avoidPositions[index].y, 6);
                }

                return costs;
            }
        });

        return pathResults;
    },
    getComparableRoomPosition: function (pos) {
        return '' + pos.x + pos.y;
    },
    mapRoomPositionArray: function (posArray) {
        return posArray.map(function (pos) {
            return mapUtils.getComparableRoomPosition(pos);
        });
    },
    removeRoomPositionFromArray: function (posArray, posToRemove) {
        var mappedPosArray = this.mapRoomPositionArray(posArray);
        var mappedPosToRemove = this.getComparableRoomPosition(posToRemove);
        var index = mappedPosArray.indexOf(mappedPosToRemove);
        if (index != -1) {
            posArray.splice(index, 1);
        }
    },
    getSameRoomPositionsFromArray: function (posArray1, posArray2) {
        var mappedPosArray1 = this.mapRoomPositionArray(posArray1);
        return posArray2.filter(pos => mappedPosArray1.indexOf(mapUtils.getComparableRoomPosition(pos)) >= 0);
    },
    filterPositionsFromArray: function (originalPositions, filterPositions) {
        var mappedFilterPositions = this.mapRoomPositionArray(filterPositions);
        return originalPositions.filter(pos => mappedFilterPositions.indexOf(mapUtils.getComparableRoomPosition(pos)) < 0);
    },
    refreshRoomPosition: function (pos) {
        return new RoomPosition(pos.x, pos.y, pos.roomName);
    },
    refreshRoomPositionArray: function (positions) {
        return positions.map(function (pos) {
            return mapUtils.refreshRoomPosition(pos);
        });
    }
};

module.exports = mapUtils;