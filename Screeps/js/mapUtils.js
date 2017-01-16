var mapUtils = {
    checkInBounds: function (x, y) {
        var roomSize = 50;
        return x >= 0 && x < roomSize && y >= 0 && y < roomSize;
    },
    getAdjacentRoomPositions: function (roomPos, maxDistance, minDistance)
    {
        if (!minDistance) {
            minDistance = 1;
        }
        if (!maxDistance)
        {
            maxDistance = 1;
        }
        var adjacentPositions = [];

        for (let i = -maxDistance; i <= maxDistance; i++)
        {
            for (let j = -maxDistance; j <= maxDistance; j++)
            {
                var closerThanMinDistance = Math.abs(i) < minDistance && Math.abs(j) < minDistance;
                if (this.checkInBounds(roomPos.x + i, roomPos.y + j) && !closerThanMinDistance) {
                    adjacentPositions.push(new RoomPosition(roomPos.x + i, roomPos.y + j, roomPos.roomName));
                }
            }
        }

        return adjacentPositions;
    },
    isWalkableTerrain: function (roomPos)
    {
        if (!mapUtils.checkInBounds(roomPos))
        {
            return false;
        }
        var walkableTerrain = ['plain', 'swamp']
        var currentTerrain = Game.map.getTerrainAt(roomPos);
        return walkableTerrain.includes(currentTerrain);
    },
    findPath: function (startPos, goals, ignorePositions, avoidPositions, maxOperations)
    {
        if (!maxOperations)
        {
            maxOperations = 1000;
        }
        var pathResults = PathFinder.search(startPos, goals,
        {
            maxRooms: 1,
            maxOps: maxOperations,

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
    getComparableRoomPosition: function (pos)
    {
        return pos.x + ' ' + pos.y + pos.roomName;
    },
    getComparableRoomPositionArray: function (posArray) {
        return posArray.map(function (pos) {
            return mapUtils.getComparableRoomPosition(pos);
        });
    },
    removeRoomPositionFromArray: function (posArray, posToRemove) {
        var mappedPosArray = this.getComparableRoomPositionArray(posArray);
        var mappedPosToRemove = this.getComparableRoomPosition(posToRemove);
        var index = mappedPosArray.indexOf(mappedPosToRemove);
        if (index != -1) {
            posArray.splice(index, 1);
        }
    },
    getSameRoomPositionsFromArray: function (posArray1, posArray2) {
        var mappedPosArray1 = this.getComparableRoomPositionArray(posArray1);
        return posArray2.filter(pos => mappedPosArray1.indexOf(mapUtils.getComparableRoomPosition(pos)) >= 0);
    },
    filterPositionsFromArray: function (originalPositions, filterPositions) {
        var mappedFilterPositions = this.getComparableRoomPositionArray(filterPositions);
        return originalPositions.filter(pos => mappedFilterPositions.indexOf(mapUtils.getComparableRoomPosition(pos)) < 0);
    },
    refreshRoomPosition: function (pos)
    {
        if (!pos.roomName)
        {
            var possibleRoomName = Object.keys(pos).filter(key => key.includes('room'));
            if (possibleRoomName.length === 1)
            {
                return new RoomPosition(pos.x, pos.y, pos[possibleRoomName[0]]);
            }
            else
            {
                return new RoomPosition(pos.x, pos.y, '');
            }
        }
        return new RoomPosition(pos.x, pos.y, pos.roomName);
    },
    refreshRoomPositionArray: function (positions)
    {
        return positions.map(function (pos) {
            return mapUtils.refreshRoomPosition(pos);
        });
    },
    calculateDistanceBetweenTwoPoints: function(pos1, pos2)
    {
        return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
    }
};

module.exports = mapUtils;