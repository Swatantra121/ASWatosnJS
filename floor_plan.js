var g_RouteTravelPath, g_arrow, g_pathLength, g_animate, g_pathColor, g_fillColor; // Animation progress (0 to 1)
var g_progress = 0;
var g_current_floor = 0;
// var g_backtracks = []; //ASA-1932


function drawPath(path, options, FromLocID, ToLocID, floor) {
    removePath(options.className);
    var map;
    if (floor != '' && typeof floor != 'undefined' && floor != null) {
        map = $('#IFP_Floor[value="' + floor + '"]').siblings(options.mapSelector);
    } else {
        map = document.querySelector(options.mapSelector);
    }
    if (map === null)
        return;

    var svgPath = createElement('path');
    var PathToLoc = getD(path, options.smoothing, FromLocID, ToLocID, floor);
    svgPath.setAttribute("id", "RouteTravelPath");
    svgPath.setAttribute("class", options.className);
    svgPath.setAttribute("fill", "none");
    svgPath.setAttribute("stroke", options.lineColor);
    svgPath.setAttribute("stroke-width", options.lineWidth);
    svgPath.setAttribute("d", PathToLoc);

    map.after(svgPath);

    var circle = document.createElement("circle");
    circle.setAttribute("id", "Circle");
    circle.setAttribute("class", options.className);
    circle.setAttribute("cx", "10");
    circle.setAttribute("cy", "10");
    circle.setAttribute("r", "50");
    circle.setAttribute("fill", "red");
    circle.setAttribute("stroke", "red");
    circle.setAttribute("d", PathToLoc);
    // circle.setAttribute("transform", "translate(746.203857421875, 1812.989990234375) rotate(180, 10, 10)");

    map.after(circle);

    var polygon = createElement('polygon');
    polygon.setAttribute("class", "arrow");
    polygon.setAttribute("points", "0,0 15,10 0,20");
    polygon.setAttribute("transform", "translate(0, 0)");
    polygon.setAttribute("stroke", options.lineColor);
    polygon.setAttribute("fill", options.lineColor);

    map.after(polygon);

    g_RouteTravelPath = document.getElementById('RouteTravelPath');
    g_arrow = document.querySelector('.arrow');
    g_pathLength = g_RouteTravelPath.getTotalLength();
    g_progress = 0; // Animation progress (0 to 1)
    animate();
}
/**
 * Remove elements with given class name from DOM
 * @param {string} className - path class
 */
function removePath(className) {
    document.querySelectorAll("." + className).forEach(e => e.remove());
    document.querySelectorAll(".arrow").forEach(e => e.remove());
    cancelAnimationFrame(g_animate);

    g_RouteTravelPath = '';
    g_animate = '';
    g_arrow = '';
    g_pathLength = 0;
    g_progress = 0; // Animation progress (0 to 1)
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

function findclosingend(path, Path_index, LocID, floor) {
    // Function is used to get other point of line and push in path if its missing
    var endPoint = {};

    var routes
    if (floor != '' && typeof floor != 'undefined' && floor != null) {
        routes = Array.from($('#IFP_Floor[value="' + floor + '"]').siblings('#routes').children());
    } else {
        routes = Array.from(document.getElementById("routes").children);
    }

    // var routes = Array.from($('#IFP_Floor[value="' + floor + '"]').siblings('#routes').children()); //Array.from(document.getElementById("routes").children);
    var distance = 0;
    var path_point = path[Path_index];

    routes.forEach(function (route) {
        var route_lineid = route.getAttribute('lineid');
        if (route_lineid != null && route_lineid.indexOf(LocID) >= 0) {

            if (path_point.x == route.x1.baseVal.value && path_point.y == route.y1.baseVal.value) {

                distance = getDistance({
                    x: path_point.x,
                    y: path_point.y
                }, {
                    x: route.x2.baseVal.value,
                    y: route.y2.baseVal.value
                });

                endPoint = {
                    x: route.x2.baseVal.value,
                    y: route.y2.baseVal.value,
                    id: route_lineid,
                    distance: 0
                };
            } else if (path_point.x == route.x2.baseVal.value && path_point.y == route.y2.baseVal.value) {

                distance = getDistance({
                    x: path_point.x,
                    y: path_point.y
                }, {
                    x: route.x1.baseVal.value,
                    y: route.y1.baseVal.value
                });
                endPoint = {
                    x: route.x1.baseVal.value,
                    y: route.y1.baseVal.value,
                    id: route_lineid,
                    distance: path_point.distance + distance
                };
            }

            var pushPath = true;
            path.forEach(function (point, index) {
                if (point.x == endPoint.x && point.y == endPoint.y) {
                    pushPath = false;
                }
            });
            if (pushPath) {
                if (Path_index == 0) {
                    path.unshift(endPoint);
                    // Recalculate the distance as new element is inserted at start
                    path.forEach(function (point, index) {
                        if (index == 0) {
                            path[index].distance = 0;
                        } else {
                            path[index].distance = path[index].distance + distance;
                        }
                    });
                } else {
                    path.push(endPoint);
                }
            }
            return;
        }
    });
}
function getD(path, smoothing, FromLocID, ToLocID, floor) {
    findclosingend(path, 0, FromLocID, floor);
    findclosingend(path, path.length - 1, ToLocID, floor);
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

function createElement(PName) {
    return document.createElementNS("http://www.w3.org/2000/svg", PName);
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
function getGraphfloor(points, options, floor) {
    // var routes = Array.from(document.querySelectorAll("#routes").children);
    var routes;
    if (floor != '' && typeof floor != 'undefined' && floor != null) {
        routes = Array.from($('#IFP_Floor[value="' + floor + '"]').siblings('#routes').children());
    } else {
        routes = Array.from(document.querySelectorAll("#routes")).flatMap(el => Array.from(el.children));
    }

    routes.forEach(function (route) {
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
    var pointsFrom = filterPointsByLocationId(points, from);
    var pointsTo = filterPointsByLocationId(points, to);

    if (!pointsFrom.length || !pointsTo.length) {
        return [];
    }
    clearPath(points);
    // unknown logic
    pointsFrom.forEach(function (pointFrom) {
        return (pointFrom.distance = 0);
    });
    setPathPoints(points);
    return getPathPoints(pointsTo);
}

function handleLine(route, points, options) {
    var id = route.getAttribute('lineid');
    var pointA = addPoint(route.x1.baseVal.value, route.y1.baseVal.value, id, points);
    var pointB = addPoint(route.x2.baseVal.value, route.y2.baseVal.value, id, points);
    var distance = getDistance(pointA, pointB);
    linkPoint(pointA, pointB, distance);
    linkPoint(pointB, pointA, distance);
}
function addPoint(x, y, id, points) {
    var foundPoint = findPoint(points, x, y, id);

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
function findPoint(points, x, y, id) {
    return points.find(function (point) {
        if (point.x === x && point.y === y) {
            if (id != null && point.id == null) {
                point.id = id;
            }
            return point;
        }
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

function filterPointsByLocationId(points, id) {
    // Find the point close to Location box
    var pointsById = points.filter(function (point) {
        if (point.id === id) {
            return point.id
        }
    });

    // Find the point by id if no point matched with Location box
    if (!pointsById.length) {
        pointsById = points.filter(function (point) {
            if (point.id === id) {
                return point.id
            }
        });
    }

    if (pointsById.length) {
        return pointsById;
    } else {
        alert(get_message("FLOORPLAN_PATH_NOTFOUND", id));
        return [];
    }
}

function FindPointsByLocationId(points, id, floor) {
    var prefix = 'point-';
    var LocArr = [];
    var pathPriority = $v('P176_SHOW_MY_PATH_PRIORITY'); // Get priority value
    var tempStorage = { L: [], E: [], S: [] };

    // Extract priority order dynamically
    var priorityOrder = pathPriority.split(">").map(group => group.split("="));

    points.forEach(function (point) {
        if (point.id != null && (point.id.indexOf(prefix + id) >= 0 || (id === 'EX' && point.id.includes(prefix + 'ENEX')))) {
            if (floor !== null && id === "EX") {
                let floorData = point.id.split("_").pop();
                let floors = floorData.split(",").map(Number);
                if (!floors.includes(Number(floor))) {
                    return;
                }
            }

            // Categorize points into L, E, and S
            if (point.id.includes('_L_')) tempStorage.L.push(point.id);
            if (point.id.includes('_E_')) tempStorage.E.push(point.id);
            if (point.id.includes('_S_')) tempStorage.S.push(point.id);
        }
    });

    // **Find the first available group and return immediately**
    for (let group of priorityOrder) {
        let collectedPoints = [];
        for (let priority of group) {
            if (tempStorage.hasOwnProperty(priority) && tempStorage[priority].length > 0) {
                collectedPoints = tempStorage[priority];
                break; // Stop checking once we find the first available priority
            }
        }
        if (collectedPoints.length > 0) {
            LocArr = collectedPoints;
            break; // Stop iterating once we find a valid group
        }
    }

    // If no priority match found, add any available location
    if (LocArr.length === 0) {
        points.forEach(function (point) {
            if (point.id != null && point.id.indexOf(prefix + id) >= 0) {
                LocArr.push(point.id);
            }
        });
    }

    return LocArr;
}

function clearPath(points) {
    for (const point of points) {
        point.previous = undefined;
        point.distance = Number.POSITIVE_INFINITY;
    }
}

function setPathPoints(points) {
    var pointsQ = points;
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
        for (const link of point.links) {
            const alt = point.distance + link.distance;
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

    for (const pointTo of pointsTo) {
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

function extractSegmentsByIdentifier(inputString, identifier) {
    // Split the string into individual segments
    let segments = inputString.split(":").filter(Boolean);

    // Find the prefix associated with the given identifier
    let associatedPrefix = null;
    segments.forEach(segment => {
        let [prefix, suffix] = segment.split("#");
        if (suffix === identifier) {
            associatedPrefix = prefix; // Capture the prefix matching the identifier
        }
    });

    // If no associated prefix is found, return an empty string
    if (!associatedPrefix) {
        return inputString;  //ASA-1972 tast-3
    }

    // Filter and keep only the segments where the prefix matches the associated prefix
    let updatedSegments = segments.filter(segment => {
        let [prefix, suffix] = segment.split("#");
        return prefix === associatedPrefix; // Keep matching prefixes
    });

    // Join the remaining segments back together with ':'
    return updatedSegments.join(":");
}

function removeSegmentsByIdentifier(inputString, identifier) {
    // Split the string into individual segments
    let segments = inputString.split(":").filter(Boolean);

    // Find the prefix associated with the given identifier
    let associatedPrefix = null;
    segments.forEach(segment => {
        let [prefix, suffix] = segment.split("#");
        if (suffix === identifier) {
            associatedPrefix = prefix; // Capture the prefix matching the identifier
        }
    });

    // If no associated prefix is found, return the original string
    if (!associatedPrefix) {
        return inputString;
    }

    // Filter out all segments where the prefix matches the associated prefix
    let updatedSegments = segments.filter(segment => {
        let [prefix, suffix] = segment.split("#"); //ASA-1615 #16
        return prefix !== associatedPrefix && suffix != identifier; // Exclude matching prefixes    //ASA-1615 #16
    });

    // Join the remaining segments back together with ':'
    return updatedSegments.join(":");
}

function getIdCounts(input) {
    if (!input)
        return 0;

    const patterns = input.split(":").filter(item => item.trim() !== "");
    let uniquePatterns = new Set();

    for (let i = 0; i < patterns.length; i++) {
        const [prefix, suffix] = patterns[i].split("#");

        // Check if a similar prefix exists in uniquePatterns
        const prefixExists = Array.from(uniquePatterns).some(pattern => pattern.startsWith(prefix + "#"));
        // Check if a similar suffix exists in uniquePatterns
        const suffixExists = Array.from(uniquePatterns).some(pattern => pattern.endsWith("#" + suffix));

        // Add to uniquePatterns only if no match is found
        if (!prefixExists && !suffixExists) {
            uniquePatterns.add(patterns[i]);
        }
    }

    return uniquePatterns.size;
}

function findClosestEntryExit(location, entryExitPoints) {
    let locElement = document.querySelector(`g[Location_ID_Fixture='${location}']`);
    if (!locElement)
        return null;

    let locPos = locElement.getBoundingClientRect();
    var closest = null;
    var point_path = null;
    let minDistance = Infinity;

    entryExitPoints.forEach(point => {
        let pointPos = point.getBoundingClientRect();
        let distance = Math.hypot(pointPos.x - locPos.x, pointPos.y - locPos.y);

        if (distance < minDistance) {
            minDistance = distance;
            if (point.getAttribute("id") == 'Entry_Exit') {
                closest = 'ENEX';
                point_path = point;
            } else if (point.getAttribute("id") == 'Entry_') {
                closest = 'EN';
                point_path = point;
            }
            // closest = point;
        }
    });

    return [closest, point_path];
}

function drawSingleFloorPath(fromLocation, toLocation, options, floor, ToLocID, toFloor) {
    var points = [];

    var graph = getGraphfloor(points, options, floor);
    var last_loc_arr = [];

    var FromLocArr = FindPointsByLocationId(points, fromLocation.toUpperCase(), ["EX", "ENEX"].includes(fromLocation.toUpperCase()) ? parseInt(floor) + 1 : null);
    if (FromLocArr.length == 0) {
        alert(get_message("FLOORPLAN_PATH_NOTFOUND", fromLocation.toUpperCase()));
        removeLoadingIndicator(regionloadWait);
        return;
    }

    // var ToLocArr = FindPointsByLocationId(points, toLocation.toUpperCase());
    // var ToLocArr = FindPointsByLocationId(points, toLocation.toUpperCase(), ["EX", "ENEX"].includes(toLocation.toUpperCase()) ? (parseInt(floor) + 1) : null);

    var ToLocArr = FindPointsByLocationId(
        points,
        toLocation.toUpperCase(),
        ["EX", "ENEX"].includes(toLocation.toUpperCase())
            ? (parseInt(floor) > parseInt(toFloor) ? parseInt(floor) - 1 : parseInt(floor) + 1)
            : null
    );


    if (ToLocArr.length == 0) {
        alert(get_message("FLOORPLAN_PATH_NOTFOUND", toLocation.toUpperCase()));
        removeLoadingIndicator(regionloadWait);
        return;
    }

    var LocMatrix = [];
    FromLocArr.forEach(function (FromLocID) {
        ToLocArr.forEach(function (ToLocID) {
            LocMatrix.push({
                FromLocID: FromLocID,
                ToLocID: ToLocID,
                distance: 0,
                path: ""
            });
        });
    });

    var PrevDistance = Number.POSITIVE_INFINITY;
    var BestPathIndex;

    LocMatrix.forEach(function (LocMat, index) {
        points = [];
        var graph = getGraphfloor(points, options, floor);
        var path = getPath(graph, LocMat.FromLocID, LocMat.ToLocID);
        LocMat.path = path;
        if (path.length == 0) {
            LocMat.distance = Number.POSITIVE_INFINITY;
        } else {
            LocMat.distance = getPathDistance(path);
            if (PrevDistance > LocMat.distance) {
                BestPathIndex = index;
                PrevDistance = LocMat.distance;
            }
        }
    });

    let shortestPath = LocMatrix.reduce((a, b) => (a.distance < b.distance ? a : b));
    if (shortestPath.path.length) {
        last_loc_arr = {
            ToLocID: shortestPath.ToLocID,
            distance: shortestPath.distance,
            path: shortestPath.path,
            FromLocID: shortestPath.FromLocID,
            x01: LocMatrix[BestPathIndex].path,
            x02: options,
            x03: LocMatrix[BestPathIndex].FromLocID,
            x04: LocMatrix[BestPathIndex].ToLocID,
            other_floor_LocID: ToLocID,
            other_toFloor: toFloor
        };
    }
    return last_loc_arr;
}



function draw_button(p_point, nextFloor, options, showPath, routeChain, to_loc, to_floor, routeFrom) {

    let path;

    if (nextFloor != '' && typeof nextFloor !== 'undefined') {
        path = $('#IFP_Floor[value="' + nextFloor + '"]')
            .siblings('#Paths')
            .find('path[Line_ID_Fixture="' + p_point + '"]')
            .attr('d');
    } else {
        path = document.querySelector('path[Line_ID_Fixture="' + p_point + '"]').getAttribute('d');
    }

    let pathElement;
    if (nextFloor != '' && typeof nextFloor != 'undefined') {
        pathElement = $('#IFP_Floor[Value="' + nextFloor + '"]').siblings('#Paths').find('path[d="' + path + '"]')[0];
    } else {
        pathElement = document.querySelector('path[d^="' + path + '"]');
    }


    if (pathElement) {
        let bbox = pathElement.getBoundingClientRect();
        let buttonContainer = document.createElement("div");
        buttonContainer.style.position = "absolute";
        buttonContainer.style.left = `${bbox.left + window.scrollX + bbox.width / 2}px`;
        buttonContainer.style.top = `${bbox.top + window.scrollY - 30}px`; // Adjust above path
        buttonContainer.style.transform = "translate(-50%, -100%)"; // Center & move up
        buttonContainer.style.zIndex = "1000"; // Ensure it is above other elements

        let tooltip = document.createElement("div");
        tooltip.innerHTML = g_current_floor > to_floor
            ? get_message("GO_DN_FLOOR", parseInt(g_current_floor) - parseInt(to_floor))
            : get_message("GO_UP_FLOOR", parseInt(g_current_floor) - parseInt(to_floor));
        tooltip.style.backgroundColor = "red";
        tooltip.style.color = "white";
        tooltip.style.padding = "5px 10px";
        tooltip.style.borderRadius = "5px";
        tooltip.style.fontSize = "12px";
        tooltip.style.cursor = "pointer";
        tooltip.style.textAlign = "center";
        tooltip.style.marginBottom = "5px";
        tooltip.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.3)";

        let button = document.createElement("button");
        button.innerText = g_current_floor > to_floor
            ? get_message("GO_TO_FLOOR", (parseInt(nextFloor) - 1))
            : get_message("GO_TO_FLOOR", (parseInt(nextFloor) + 1));

        button.style.backgroundColor = "red";
        button.style.color = "white";
        button.style.border = "none";
        button.style.padding = "5px 10px";
        button.style.borderRadius = "5px";
        button.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.3)";
        button.style.cursor = "pointer";

        buttonContainer.appendChild(tooltip);
        buttonContainer.appendChild(button);
        document.body.appendChild(buttonContainer);

        // Click event for button
        [tooltip, button].forEach(el => el.addEventListener("click", function () {
            document.querySelectorAll("div, button").forEach(el => {
                if (el.innerText.includes("Go")) {
                    el.remove();
                }
            });

            if (g_current_floor > to_floor) {
                g_current_floor = parseInt(g_current_floor) - 1;
            } else {
                g_current_floor = parseInt(g_current_floor) + 1;
            }


            var last_location_arr = [];
            var frompoint = p_point;
            var topoint = 'ENEX';
            if (p_point.includes('EX') && !(p_point.includes('ENEX'))) {
                frompoint = p_point.replace('EX', 'EN');
                topoint = 'EX';
            } else if (p_point.includes('EN') && !(p_point.includes('ENEX'))) {
                frompoint = p_point.replace('EN', 'EX');
                topoint = 'EN';
            }
            if (p_point.split('_').pop().split(',').map(Number).indexOf(parseInt(nextFloor) + 2) == -1) {
                topoint = 'ENEX';
            }

            if (to_floor != String(g_current_floor)) {
                var loc_arr = drawSingleFloorPath(frompoint, topoint, options, String(g_current_floor), routeChain, String(g_current_floor));
                last_location_arr.push(loc_arr);
            } else {
                var loc_arr = drawSingleFloorPath(frompoint, to_loc, options, String(g_current_floor), routeChain, String(to_floor));

                last_location_arr.push(loc_arr);
            }
            let finalShortestPath = last_location_arr.reduce((a, b) => (a.distance < b.distance ? a : b));

            if (finalShortestPath) {
                drawPath(finalShortestPath.x01, finalShortestPath.x02, finalShortestPath.x03, finalShortestPath.x04, String(g_current_floor));
            }

            if (to_floor != String(g_current_floor)) {
                $("#id_previous_location").css("display", "none");
                $("#id_next_location").css("display", "none");
                draw_button(finalShortestPath.x04.split("-")[1], g_current_floor, options, showPath, routeChain, to_loc, to_floor, routeFrom);
            } else {
                hide_show_button(finalShortestPath, routeFrom, routeChain, to_loc);
            }

        }));
    }
}


function getFloor(locationId) {
    // let locElement = document.querySelector(`g[Location_ID_Fixture='${locationId}']`);
    let locElement = document.querySelector(`#routes line[lineid='point-${locationId}']`);
    if (!locElement) {
        console.warn(`Location ${locationId} not found`);
        return null;
    }

    // Traverse up manually to find the nearest ancestor with id "IFP_Floor"
    let parent = locElement.parentElement.parentElement;


    var floor = parent.getElementById('IFP_Floor');
    return $(floor).attr('value')
}

function getGraph(points, options) {
    // var routes = Array.from($('#IFP_Floor').siblings('#routes').children());

    var routes = Array.from(document.querySelectorAll('#IFP_Floor ~ g#routes'))
        .flatMap(route => Array.from(route.children));

    routes.forEach(function (route) {
        if (isLine(route)) {
            handleLine(route, points, options);
        } else {
            console.error("Invalid element in routes: ".concat(route.tagName));
        }
    });
    return points;
}



function hide_show_button(finalShortestPath, routeFrom, routeChain, to_loc) {
    let index = 0;
    let toLocID = finalShortestPath.ToLocID.split("-")[1];
    let l_ind = checkSameProduct($v('P176_POG_LOCATION_IDS'));

    if (l_ind == 'Y') { //ASA-1972  Case 2
       $("#id_next_location").css("display", "none");
       $("#id_previous_location").css("display", "none");
        get_svg_footer(to_loc); //ASA-1972  Case 3
    } else {
        $s('P176_FROM_LOCATION_ID', toLocID);
    
        // Check if the routeFrom exists in P176_LOCATION_IDS, if not, add it
        if (!$v('P176_LOCATION_IDS').includes(routeFrom)) {
            let newLocationIDs = extractSegmentsByIdentifier($v('P176_POG_LOCATION_IDS'), routeFrom) + ':' + $v('P176_LOCATION_IDS');
            $s('P176_LOCATION_IDS', newLocationIDs);
        }
    
        // Ensure toLocID is valid and doesn't contain multiple values
        if (toLocID && !toLocID.includes(',')) {
            let previousLocationIDs = $v('P176_PREVIOUS_LOCATION_IDS');
    
            if (previousLocationIDs.includes(toLocID)) {
                let inputString = previousLocationIDs;
                index = inputString.indexOf(toLocID) + toLocID.length;
                let updatedPreviousLocIDs = inputString.slice(index);
    
                $s('P176_PREVIOUS_LOCATION_IDS', updatedPreviousLocIDs);
    
                // If there are no previous location IDs left, reset location IDs
                if (updatedPreviousLocIDs === '') {
                    $s('P176_LOCATION_IDS', $v('P176_POG_LOCATION_IDS'));
                    $("#id_next_location").css("display", "block");
                }
            } else {
                $s('P176_PREVIOUS_LOCATION_IDS', ':#' + routeFrom + previousLocationIDs);
            }
        }
        if (index === 0 && !toLocID.toUpperCase().includes(',')) {
            if (to_loc != '' || typeof to_loc !== 'undefined')
                get_svg_footer(to_loc);
            else {
                get_svg_footer(toLocID.toUpperCase());
            }
        } else {
            get_svg_footer(to_loc); //ASA-1972  Case 3
        }
    
        let result = getIdCounts($v('P176_LOCATION_IDS')); // ASA-1615 #16
    
        if (result > 1) { // && g_backtracks.length > 1
            if (index === 0 && !toLocID.toUpperCase().includes(',')) {
                $s('P176_LOCATION_IDS', removeSegmentsByIdentifier(routeChain, toLocID.toUpperCase()));
                if (to_loc != '' || typeof to_loc !== 'undefined')
                    get_svg_footer(to_loc);
                else {
                    get_svg_footer(toLocID.toUpperCase());
                }
            } else {
                get_svg_footer(to_loc); //ASA-1972  Case 3
            }
    
            $s('P176_PREVIOUS_LOCATION_ID', routeFrom, ':#' + $v('P176_PREVIOUS_LOCATION_ID'));
    
            $("#id_next_location").css("display", $v('P176_LOCATION_IDS') === '' ? "none" : "block");
        // } else if (result == 1 || g_backtracks.length == 1) { //ASA-1932
        //    get_svg_footer(to_loc);
        } else {
            $("#id_next_location").css("display", "none");
        }
    
        let previousLocationsCount = ($v('P176_PREVIOUS_LOCATION_IDS').split('#').length - 1);
    
        if (previousLocationsCount > 0) {
            $s('P176_PREVIOUS_LOCATION_ID', routeFrom);
            $("#id_previous_location").css("display", "block");
        }
    
        let nextLocCount = getIdCounts($v('P176_LOCATION_IDS'));  // ASA-1615 #16
        let previousLocCount = getIdCounts($v('P176_POG_LOCATION_IDS')); // ASA-1615 #16
    
        if (previousLocCount === (nextLocCount + 1) || $v('P176_PREVIOUS_LOCATION_IDS') === '') {
            $("#id_previous_location").css("display", "none");
        }
        if ($v('P176_PREVIOUS_LOCATION_IDS') !== '') {
            $("#id_previous_location").css("display", "block");
        } else {
            $("#id_previous_location").css("display", "none");
        }
    
        if (nextLocCount > 0) {
            $("#id_next_location").css("display", "block");
        }
    }
}

function findPathAndDraw(routeFrom, routeChain, othRoute, drawRoute, showPath = 'N') {
    var options = {
        mapSelector: "#Global_Layer",
        className: "routepath",
        smoothing: 1,
        lineColor: "darkblue",
        lineWidth: 5,
        speed: 5
    };

    document.querySelectorAll("div, button").forEach(el => {
        if (el.innerText.includes("Go")) {
            el.remove();
        }
    });
    removePath(options.className);

    var last_location_arr = [];

    var children = Array.from(document.querySelectorAll('g#LocIDDisplay_Inside_Block path'));

    // Reset and assign colors for the current segment
    children.forEach(function (path) {
        if (path.getAttribute('location_id') == routeFrom) {
            path.setAttribute("fill", "red");
            path.setAttribute("stroke", "red");
        } else if (routeChain.includes(path.getAttribute('location_id'))) {
            path.setAttribute("fill", "green");
            path.setAttribute("stroke", "green");
        } else if (othRoute.includes(path.getAttribute('location_id'))) {
            path.setAttribute("fill", "yellow");
            path.setAttribute("stroke", "yellow");
        } else {
            path.setAttribute("fill", g_fillColor);
            path.setAttribute("stroke", g_pathColor);
        }
    });
    var fromLocation = routeFrom;
    let fromFloor = getFloor(fromLocation);
    var other_floor_loc = [];
    if (drawRoute) {
        var routeSegments = routeChain.split(":").filter(Boolean); // Splitting by ":" and removing empty elements
        // Process each segment in the route chain
        routeSegments.forEach((segment, index) => {
            var [fromFull, toFull] = segment.split("#");

            var toLocation = toFull;

            var points = [];
            var graph = getGraph(points, options);

            let toFloor = getFloor(toLocation);

            if (fromFloor == toFloor) {
                var loc_arr = drawSingleFloorPath(fromLocation.toUpperCase(), toLocation.toUpperCase(), options, fromFloor, '', '');
                last_location_arr.push(loc_arr);
            } else {
                if (toFloor != '' && toFloor != null) {
                    other_floor_loc.push({
                        ToLocID: toLocation,
                        toFloor: toFloor
                    });
                }
            }
        });
        other_floor_loc.sort((a, b) => a.toFloor - b.toFloor);

        if (last_location_arr.length == 0 && other_floor_loc.length > 0) {
            var loc_arr_oth = drawSingleFloorPath(fromLocation.toUpperCase(), 'EX', options, fromFloor, other_floor_loc[0].ToLocID, other_floor_loc[0].toFloor);
            last_location_arr.push(loc_arr_oth);

            var floor_loc = [];
            other_floor_loc.forEach((loc) => {
                if (other_floor_loc[0].toFloor == loc.toFloor) {
                    var toLoc = loc.ToLocID;
                    var points = [];
                    var graph = getGraph(points, options);
                    var loc_arr = drawSingleFloorPath(last_location_arr[0].ToLocID.split('-')[1], toLoc.toUpperCase(), options, last_location_arr[0].other_toFloor, '', '');
                    floor_loc.push(loc_arr);

                }

            });
            let finaltoShortestPath = floor_loc.reduce((a, b) => (a.distance < b.distance ? a : b));

            if (last_location_arr.length > 0) {
                last_location_arr[0].other_floor_LocID = finaltoShortestPath.ToLocID.split('-')[1];

            }

        }
        // Log the FromLocID of the shortest path
        if (showPath == 'Y' || showPath == 'YY') { //ASA-1918 Issue 1

            let finalShortestPath = last_location_arr.reduce((a, b) => (a.distance < b.distance ? a : b));

            var floor = getFloor(finalShortestPath.FromLocID.split("-")[1]);
            var to_floor;
            if (finalShortestPath.other_floor_LocID !== '') {
                to_floor = getFloor(finalShortestPath.other_floor_LocID);
            } else {
                to_floor = floor;
            }


            // Log the FromLocID of the shortest path
            if (finalShortestPath) {
                drawPath(finalShortestPath.x01, finalShortestPath.x02, finalShortestPath.x03, finalShortestPath.x04, floor);
                if (to_floor != floor) {
                    g_current_floor = floor;
                    draw_button(finalShortestPath.x04.split("-")[1], floor, options, showPath, routeChain, finalShortestPath.other_floor_LocID, finalShortestPath.other_toFloor, finalShortestPath.FromLocID.split("-")[1]);

                    $("#id_previous_location").css("display", "none");
                    $("#id_next_location").css("display", "none");
                } else if ( showPath != 'YY') { //ASA-1918 Issue 1

                    hide_show_button(finalShortestPath, routeFrom, routeChain,
                        finalShortestPath.other_floor_LocID ? finalShortestPath.other_floor_LocID : finalShortestPath.ToLocID.split("-")[1]
                    );
                }


            }
        }
    }

}

function Hide_paths() {
    //ASA-1620 #Start

    var svgPathsElements = document.querySelectorAll('#Paths');

    svgPathsElements.forEach(function (svgPathsElement) {
        if (svgPathsElement) {
            // Set default line color
            var locations = document.querySelector("#LocIDDisplay_Inside_Block");

            if (locations) {
                var children = Array.from(locations.getElementsByTagName('path'));
                if (children.length > 0) {
                    g_pathColor = children[0].getAttribute('stroke');
                    g_fillColor = children[0].getAttribute('fill');
                }
            }

            var paths_children = Array.from(svgPathsElement.getElementsByTagName('path'));

            paths_children.forEach(function (paths_child) {
                paths_child.setAttribute('stroke-opacity', '0');
            });
        }
    });

    var routesElements = document.querySelectorAll('#routes');
    routesElements.forEach(function (routeElement) {
        routeElement.setAttribute('stroke-opacity', '0');
    });
    //ASA-1620 #End

}

function show_paths() {
    var paths_children = Array.from(document.getElementById("Paths").getElementsByTagName('path'));

    paths_children.forEach(function (paths_child) {
        paths_child.setAttribute('stroke-opacity', '1');

    });

    document.getElementById("routes").setAttribute('stroke-opacity', '1');
}

function animate() {
    // Update the progress
    g_progress += 0.002; // Adjust speed by changing the increment
    if (g_progress > 1)
        g_progress = 0; // Loop the animation

    // Calculate the point on the path
    const point = g_RouteTravelPath.getPointAtLength(g_progress * g_pathLength);

    var curr_tranform = g_arrow.getAttribute('transform');

    if (curr_tranform != "") {
        var curr_x = parseFloat(curr_tranform.slice(curr_tranform.indexOf('translate(') + 10, curr_tranform.indexOf(',')));
        var curr_y = parseFloat(curr_tranform.slice(curr_tranform.indexOf(',') + 1, curr_tranform.indexOf(')')));
    } else {
        var curr_x = point.x - 10;
        var curr_y = point.y - 10;
    }

    var angle;
    if (curr_x > point.x - 10)
        angle = 180;
    else if (curr_x < point.x - 10)
        angle = 0;
    else if (curr_y < point.y - 10)
        angle = 90;
    else
        angle = -90;

    // Set the position of the arrow
    g_arrow.setAttribute('transform', `translate(${point.x - 10}, ${point.y - 10}) rotate(${angle}, 10, 10)`);

    // Request next frame
    g_animate = requestAnimationFrame(animate);
}

function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

function smw_kiosk_cnfg(p_smw_kiosk_cnfg_loc, p_location_ids, p_pog_location_ids) {

    let l_location_id = []; // Initialize an empty array
    var locations = document.getElementById("LocIDDisplay_Inside_Block");
    var children = Array.from(locations.getElementsByTagName('path'));
    children.forEach(function (path) {
        const locationId = path.getAttribute('location_id');
        if (locationId && locationId.includes(p_smw_kiosk_cnfg_loc)) {
            l_location_id.push(locationId); // Push location_id to the array
        }
    });

    // Sort the array in ascending order
    l_location_id.sort();
    // g_backtracks = []; //ASA-1932

    if (l_location_id.length != 0) {
        if (l_location_id[0] !== '' || typeof l_location_id[0] !== 'undefined') {
            findPathAndDraw(l_location_id[0], p_location_ids, p_pog_location_ids, true, 'Y');
            // g_backtracks.push(l_location_id[0]+'/'+p_location_ids); //ASA-1932
            $s('P176_PREVIOUS_LOCATION_IDS', ':#' + l_location_id[0]);
            // $("#id_previous_location").css("display", "none"); //ASA-1932
        }
    } else {

        if ($v('P171_DUMMY_LOCATION_IDS') == '') {
            if (isMobileDevice()) {
                openInlineDialog('reg_set_location', 90, 90);
            } else {
                openInlineDialog('reg_set_location', 30, 30);
            }
        }
    }
    removeLoadingIndicator(regionloadWait);
}

//ASA-1972  Case 2 To check if only One OR TWO product are searched
function checkSameProduct(str) {
   if (!str || typeof str !== "string") return "N";
   const parts = str.split(":").filter(Boolean);
   if (parts.length === 0) return "N";
   const prefixes = parts.map(p => p.split("#")[0]);
   const suffixes = parts.map(p => p.split("#")[1]);
   const uniquePrefixes = new Set(prefixes);
   const uniqueSuffixes = new Set(suffixes);
   return (uniquePrefixes.size === 1 || uniqueSuffixes.size === 1) ? "Y" : "N";
 }