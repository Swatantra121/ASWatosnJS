var routes;
let graph;

var drawOptions = {
    mapSelector: "#map",
    className: "route-path",
    smoothing: 5,
    lineColor: "rgb(242,0,0)",
    lineWidth: "2",
    speed: 3
};


function drawPath(path, options) {
    if (options === void 0) {
        options = drawOptions;
    }
    removePath(options.className);
    var map = document.querySelector(options.mapSelector);
    if (map === null)
        return;
    var svgPath = createPath();
    svgPath.setAttribute("class", options.className);
    svgPath.setAttribute("fill", "none");
    svgPath.setAttribute("stroke", options.lineColor);
    svgPath.setAttribute("stroke-width", options.lineWidth);
    svgPath.setAttribute("d", getD(path, options.smoothing));
    map.after(svgPath);
    var distance = getPathDistance(path);
    var offset = distance / 100 / options.speed;
    setStyle(svgPath, offset);
}
/**
 * Remove elements with given class name from DOM
 * @param {string} className - path class
 */
function removePath(className) {
    document.querySelectorAll(".".concat(className)).forEach(function (path) {
        return path.remove();
    });
}
/**
 * Calculates relative distance for given path
 * @param {RoutePoint[]} path - path to get distance
 * @returns {number} - distance between last and first points of path
 */
function getPathDistance(path) {
    var first = path[0];
    var last = path[path.length - 1];
    return last.distance - first.distance;
}
function getD(path, smoothing) {
    var d = "M ".concat(path[0].x, ",").concat(path[0].y);
    path.forEach(function (point, index) {
        if (index > 0 && index < path.length - 1) {
            var prevPoint = getLinePoint(path[index], path[index - 1], smoothing);
            var nextPoint = getLinePoint(path[index], path[index + 1], smoothing);
            d += " L".concat(prevPoint.x, ",").concat(prevPoint.y);
            d += " Q".concat(point.x, ",").concat(point.y);
            d += " ".concat(nextPoint.x, ",").concat(nextPoint.y);
        } else {
            d += " L".concat(point.x, ",").concat(point.y);
        }
    });
    return d;
}
function getLinePoint(pointA, pointB, smoothing) {
    var xLen = pointB.x - pointA.x;
    var yLen = pointB.y - pointA.y;
    var len = Math.abs(pointA.distance - pointB.distance);
    var size = Math.min(smoothing, len / 2);
    var r = size / len;
    return {
        x: pointA.x + xLen * r,
        y: pointA.y + yLen * r
    };
}
function setStyle(svgPath, offset) {
    var length = svgPath.getTotalLength();
    var transition = "stroke-dashoffset ".concat(offset, "s ease-in-out 0.4s");
    svgPath.style.strokeDasharray = "".concat(length, " ").concat(length);
    svgPath.style.strokeDashoffset = length.toString();
    svgPath.getBoundingClientRect();
    svgPath.style.transition = transition;
    svgPath.style.strokeDashoffset = "0";
}
function createPath() {
    return document.createElementNS("http://www.w3.org/2000/svg", "path");
}
function isLine(route) {
    return route.tagName === "line";
}
/**
 * Build graph with given routes element
 * Get svg points and use coordinates to create graph points
 * @param {Element} routes - can contain line, polygon and polyline elements
 * @returns {RoutePoint[]} - graph points
 */
function getGraph(routes, points, options) {
    if (points === void 0) {
        points = [];
    }
    if (options === void 0) {
        options = drawOptions;//graphOptions; sandeep
    }
    var children = Array.from(routes.children);
    children.forEach(function (route) {
        if (isLine(route)) {
            handleLine(route, points, options);
        } else {
            console.error("Invalid element in routes: ".concat(route.tagName));
        }
    });
    return points;
}
/**
 * Find closest path between from/to locations in given graph points
 * It looks from/to points by provided Id
 * Return empty array in case there is no from/to points or path
 * @param {RoutePoint[]} points - graph points
 * @param {string} from - location from id
 * @param {string} to - location to id
 * @returns {RoutePoint[]} - path points
 */
function getPath(points, from, to) {
    var pointPrefix = "point";
    var pointsFrom = filterPointsByLocationId(points, from, pointPrefix);
    var pointsTo = filterPointsByLocationId(points, to, pointPrefix);
    if (!pointsFrom.length || !pointsTo.length)
        return [];
    clearPath(points);
    pointsFrom.forEach(function (pointFrom) {
        return (pointFrom.distance = 0);
    });
    setPathPoints(points);
    return getPathPoints(pointsTo);
}
function handleLine(route, points, options) {
    var id = route.id;
    var pointA = addPoint(route.x1.baseVal.value, route.y1.baseVal.value, id, points);
    var pointB = addPoint(route.x2.baseVal.value, route.y2.baseVal.value, id, points);
    var distance = getDistance(pointA, pointB);
    linkPoint(pointA, pointB, distance);
    linkPoint(pointB, pointA, distance);
}
function addPoint(x, y, id, points) {
    var foundPoint = findPoint(points, x, y);
    if (foundPoint)
        return foundPoint;
    var point = {
        x: x,
        y: y,
        id: id,
        distance: Number.POSITIVE_INFINITY,
        previous: undefined,
        links: []
    };
    points.push(point);
    return point;
}
function getDistance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
function findPoint(points, x, y) {
    return points.find(function (point) {
        return point.x === x && point.y === y;
    });
}
function linkPoint(pointA, pointB, distance) {
    var linkPoints = pointA.links.map(function (link) {
        return link.to;
    });
    if (!findPoint(linkPoints, pointB.x, pointB.y)) {
        pointA.links.push({
            to: pointB,
            distance: distance
        });
    }
}
function filterPointsByLocationId(points, id, prefix) {
    console.log(points, 'points');
	console.log(id, 'id');
	console.log(prefix, 'prefix');
    var pointsById = points.filter(function (point) {
		return point.id === "".concat(prefix, "-").concat(id);
    });
	console.log(pointsById, 'pointsById');
    
	if (pointsById.length) {
        return pointsById;
    } else {
        console.error("There is no route to location: ".concat(id));
        return [];
    }
	
}
function clearPath(points) {
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var point = points_1[_i];
        point.previous = undefined;
        point.distance = Number.POSITIVE_INFINITY;
    }
}
function setPathPoints(points) {
    var pointsQ = points;//__spreadArray([], points, true); sandeep
    while (pointsQ.length > 0) {
        var qIndex = 0;
        var minDistance = Number.POSITIVE_INFINITY;
        for (var index = 0; index < pointsQ.length; index++) {
            if (pointsQ[index].distance < minDistance) {
                qIndex = index;
                minDistance = pointsQ[index].distance;
            }
        }
        var point = pointsQ[qIndex];
        pointsQ.splice(qIndex, 1);
        for (var _i = 0, _a = point.links; _i < _a.length; _i++) {
            var link = _a[_i];
            var alt = point.distance + link.distance;
            if (alt < link.to.distance) {
                link.to.distance = alt;
                link.to.previous = point;
            }
        }
    }
}
function getPathPoints(pointsTo) {
    var path = [];
    var target = null;
    var min = Number.POSITIVE_INFINITY;
    for (var _i = 0, pointsTo_1 = pointsTo; _i < pointsTo_1.length; _i++) {
        var pointTo = pointsTo_1[_i];
        if (pointTo.distance < min) {
            target = pointTo;
            min = target.distance;
        }
    }
    if (!target)
        return [];
    path.push(target);
    while (target.previous !== undefined) {
        target = target.previous;
        path.unshift(target);
    }
    return path;
}

function findPathAndDraw(routeFrom, routeTo) {
    console.log(routeTo, 'routeTo');
	routes = document.getElementById("routes");
	//routes = document.getElementById(routeFrom);
	console.log(routes,'routes');
	graph = getGraph(routes);
    const path = getPath(graph, routeFrom, routeTo);
    console.log(path, 'path');
    drawPath(path);
}