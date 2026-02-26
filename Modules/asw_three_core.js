//asw_three_core.js: This will contain functions related to three js rendering.


//Getting request animation frame for different browsers.
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;


//Setting mouse events on each canvas created in the screen. Setting all
function setUpMouseHander(p_element, p_mouseDownFunc, p_mouseDragFunc, p_mouseUpFunc, p_mouseDoubleclick, p_canvas) {
    logDebug("function : setUpMouseHander", "S");
    if (!p_element || !p_mouseDownFunc || !(typeof p_mouseDownFunc == "function")) {
        throw "Illegal arguments in setUpMouseHander";
    }
    if (typeof p_element == "string") {
        p_element = document.getElementById(p_element);
    }
    if (!p_element || !p_element.addEventListener) {
        throw "first argument in setUpMouseHander is not a valid element";
    }

    var startX, startY;
    var prevX, prevY;
    //var header = document.getElementById("t_Header");//not used in the function so commented.
    //var breadcrumb = document.getElementById("t_Body_title");
    //var top_bar = document.getElementById("top_bar");

    // ASA 1850
    var lastClickTime = 0;
    var clickThreshold = $v("P25_POG_DELAY_TIME_IN_MS");
    var moveThreshold = 10;
    var isClicking = false;
    var side_nav = document.getElementById("t_Body_nav");
    var button_cont = document.getElementById("side_bar");
    var devicePixelRatio = window.devicePixelRatio;
    g_start_pixel_ratio = devicePixelRatio;
    //var header_height = header.offsetHeight * devicePixelRatio;
    // var breadcrumb_height = breadcrumb.offsetHeight * devicePixelRatio;
    //var top_bar_height = top_bar.offsetHeight * devicePixelRatio;
    var side_nav_width = side_nav.offsetWidth * devicePixelRatio;
    var btn_cont_width = button_cont.offsetWidth * devicePixelRatio;

    function doMouseDown(evt) {
        if (g_dragging) {
            //When user is dragging any object mousedown should not work. only mousemove will work.
            return;
        }

        // ASA 1850
        var currentTime = Date.now();
        var timeDiff = currentTime - lastClickTime;
        isClicking = (timeDiff < clickThreshold);
        lastClickTime = currentTime;

        if (window.event.which == 1 && g_scene_objects.length > 0) {
            set_curr_canvas(evt); //set all the default values of global variables like g_pog_index, g_show_live_image etc for specific canvas selected.
            if (g_scene_objects.length > 0) {
                var r = p_canvas.getBoundingClientRect(); //getting mesurements of the canvas element where mouse is placed.
                //console.log("r.left", r.left, r.top);
                var start_x = r.left;
                var start_y = r.top;
                var x = evt.clientX - r.left; //  - (side_nav_width + btn_cont_width);
                var y = evt.clientY - r.top; //  - (header_height + breadcrumb_height + top_bar_height);
                //console.log("evt.clientX ", evt.clientX, evt.clientY, "r left ", r.left, r.top, " xy ", x, y, side_nav_width, btn_cont_width);
                prevX = startX = x;
                prevY = startY = y;

                //caling doMouseDown function, after mouse down when this function finds a object and recognise it and it is a valid object to be dragged, the g_dragging will be true.
                // ASA 1850 Start dragging if not in click-only mode
                if (!isClicking) {
                    g_dragging = p_mouseDownFunc(x, y, r.left, r.top, evt, p_canvas, "N", g_pog_index);
                }
            }
        }
    }

    function doMouseMove(evt) {
        if (isClicking) { return; } //ASA 1850  
        if (p_mouseDragFunc) {
            set_curr_canvas(evt); //set all the default values of global variables like g_pog_index, g_show_live_image etc for specific canvas selected.
            var jselector = p_canvas.getAttribute("id");
            var l_new_canvas = p_canvas;
            var pPogIndex = l_new_canvas.getAttribute("data-indx"); //getting the pog_index from the canvas element attribute.
            var new_camera = g_camera;

            if (evt.target.nodeName == "CANVAS" && typeof g_scene_objects[pPogIndex] !== "undefined") {
                l_new_canvas = evt.target;
                pPogIndex = l_new_canvas.getAttribute("data-indx");
                if (g_scene_objects.length > 0) {
                    new_camera = g_scene_objects[pPogIndex].scene.children[0];
                }
            } else {
                l_new_canvas = evt.target;
                pPogIndex = 0;
                new_camera = g_camera;
            }

            var r = l_new_canvas.getBoundingClientRect();
            var obj_height = r.height;
            var x = evt.clientX - r.left; // - (side_nav_width + btn_cont_width);
            var y = evt.clientY - r.top; // - (header_height + breadcrumb_height + top_bar_height);

            // ASA 1850 Only drag if movement exceeds threshold
            var dx = Math.abs(x - startX);
            var dy = Math.abs(y - startY);
            if (!g_dragging || dx > moveThreshold || dy > moveThreshold || g_pog_json.length > 1) { //ASA-1914 Issue6
                const fromX = g_dragging ? prevX : x;
                const fromY = g_dragging ? prevY : y;
                p_mouseDragFunc(x, y, evt, fromX, fromY, l_new_canvas, new_camera, jselector, pPogIndex);
            }
            prevX = x;
            prevY = y;
        }
    }
    //when user tries to drop a object in specific location or click on a item and want to perform some action or multi select and drop.
    function doMouseUp(evt) {
        if (g_dragging) {
            set_curr_canvas(evt);
            if (p_mouseUpFunc && g_scene_objects.length > 0) {
                var r = p_canvas.getBoundingClientRect();
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                //double click event is used only to find the object on which user did double click and open its details in popup like product details, fixel details popup etc.
                p_mouseUpFunc(x, y, evt, prevX, prevY, p_canvas, g_camera, g_pog_index);
            }
            g_dragging = false;
        }
    }

    function doMouseDoubleclick(evt) {
        set_curr_canvas(evt);
        if (g_scene_objects.length > 0) {
            var r = p_canvas.getBoundingClientRect();
            var x = evt.clientX - r.left;
            var y = evt.clientY - r.top;
            p_mouseDoubleclick(x, y, startX, startY, evt, p_canvas, g_camera, g_pog_index);
        }
        isClicking = false; //  ASA 1850 reset after double click
    }
    //adding event listners to specific canvas. in WPD there can be multiple canvas opened in same screen.
    p_canvas.addEventListener("mousemove", doMouseMove);
    p_canvas.addEventListener("mouseup", doMouseUp);
    p_canvas.addEventListener("mousedown", doMouseDown);
    p_canvas.addEventListener("dblclick", doMouseDoubleclick);

    logDebug("function : setUpMouseHander", "E");
}

function limited_animate(p_scene, p_camera, p_pog_index) {
    try {
        if (g_counting < 5) {
            //We intend to call requestanimateframe only 5 times because requestanimationframe runs approx 170 frames per sec.
            g_counting = g_counting + 1; //increment with 1 so that function can stop calling when it reaches 5.
            if (g_renderer !== null && typeof p_pog_index !== "undefined") {
                //If we have p_pog_index then we need to render specific scene only.
                if (g_canvas_objects[p_pog_index].getContext("2d") !== null) {
                    //This inside block will use single renderer to render different canvases to avoid restriction on no of renderers in
                    //browser. we take the context of the canvas object and drawimage using the renderer.
                    var context = g_canvas_objects[p_pog_index].getContext("2d"); //Getting context of the specific canvas.
                    g_renderer.setPixelRatio(window.devicePixelRatio);
                    var canvas_width = g_canvas_objects[p_pog_index].width;
                    var canvas_height = g_canvas_objects[p_pog_index].height;

                    g_renderer.setSize(canvas_width, canvas_height);
                    g_scene_objects[p_pog_index].scene.children[0].aspect = canvas_width / canvas_height;
                    g_renderer.render(g_scene_objects[p_pog_index].scene, g_scene_objects[p_pog_index].scene.children[0]);
                    if (context !== null) {
                        context.drawImage(g_renderer.domElement, 0, 0, canvas_width, canvas_height); //this will draw the 3D objects on the canvas.
                    }
                    requestAnimationFrame(function () {
                        //This will call the same function again after first frame.
                        limited_animate(g_scene_objects[p_pog_index].scene, g_scene_objects[p_pog_index].scene.children[0], p_pog_index);
                    });
                } else if (g_renderer !== null) {
                    //if p_pog_index is not sent then only render the scene sent inside the function.
                    g_renderer.render(p_scene, p_camera);
                    requestAnimationFrame(function () {
                        limited_animate(p_scene, p_camera, p_pog_index);
                    });
                }
            } else if (g_renderer !== null) {
                //Directly render the scene which is been sent as parameter.
                g_renderer.render(p_scene, p_camera);
                requestAnimationFrame(function () {
                    limited_animate(p_scene, p_camera, p_pog_index);
                });
            }
        } else {
            g_counting = 0;
        }
    } catch (err) {
        error_handling(err);
    }
}

//this is basically used when we have images to be rendered. because when you call only render() function. image does not display at single rendering.
function animate_pog(p_pog_index) {
    try {
        if (typeof g_scene_objects !== undefined && g_scene_objects.length > 0) {
            requestAnimationFrame(function () {
                limited_animate(g_scene_objects[p_pog_index].scene, g_scene_objects[p_pog_index].scene.children[0], p_pog_index);
            });
        }
    } catch (err) {
        error_handling(err);
    }
}
//This function is used only in PDF generation example set_scene function.
function animate_pog_pdf() {
    try {
        requestAnimationFrame(function () {
            limited_animate(g_scene_pdf, g_camera_pdf);
        });
    } catch (err) {
        error_handling(err);
    }
}

//Finding out the pixel width and height of any world object.
//this function is used to find out the text real size and create text box or create item borders when drag item from product list etc.
function get_visible_size(p_objectZ, p_obj_width, p_obj_height, p_canvas, p_camera) {
    try {
        logDebug("function : get_visible_size; objectZ : " + p_objectZ + "; obj_width : " + p_obj_width + "; obj_height : " + p_obj_height, "S");
        var dist = p_camera.position.z - p_objectZ;
        var vFOV = THREE.MathUtils.degToRad(p_camera.fov); // convert vertical fov to radians
        var height = 2 * Math.tan(vFOV / 2) * dist; // visible height
        var width = height * p_camera.aspect;
        var canvaswidth = p_canvas.width / window.devicePixelRatio;
        var canvasheight = p_canvas.height / window.devicePixelRatio;
        var pixel_width = canvaswidth * (p_obj_width / width);
        var pixel_height = canvasheight * (p_obj_height / height);
        logDebug("function : get_visible_size", "E");
        return [pixel_width, pixel_height];
    } catch (err) {
        logDebug("function : get_visible_size", "E");
        error_handling(err);
    }
}

//this function is only used on 3d View to create scene and camera for that screen.
function create3dWorld() {
    try {
        g_scene = new THREE.Scene();
        g_camera = new THREE.PerspectiveCamera(25, g_canvas.width / g_canvas.height, 0.1, 1000);
        g_camera.lookAt(new THREE.Vector3(0, 0, 0));
        g_renderer.setPixelRatio(window.devicePixelRatio);
        g_scene.add(g_camera);
        g_renderer.setClearColor(0xffffff);
        g_renderer.setSize(g_canvas.width, g_canvas.height);
        // Add lights
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
        hemiLight.position.set(0, 50, 0);
        // Add hemisphere light to scene
        g_scene.add(hemiLight);
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
        dirLight.position.set(-8, 12, 15);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        // Add directional Light to scene
        g_scene.add(dirLight);
        g_camera.aspect = g_canvas.width / g_canvas.height;
        g_camera.updateProjectionMatrix();

        var geo = new THREE.PlaneGeometry(g_json[0].CameraW + 1.5, 3, 1, 1);
        var material = new THREE.MeshPhongMaterial({
            color: 0xa69fa6,
            shininess: 0,
        });
        material.flatShading = true;
        geo.normalsNeedUpdate;
        geo.computeFaceNormals();

        var plane = new THREE.Mesh(geo, material);
        plane.rotation.x -= Math.PI / 2;
        if (g_json[0].CameraMinY < 0) {
            var camera_height = g_json[0].CameraH / 2 + (0 - g_json[0].CameraMinY);
        } else {
            var camera_height = g_json[0].CameraH / 2;
        }
        plane.position.y = 0 - camera_height;
        g_scene.add(plane);
        plane.receiveShadow = true;

        //An empty object3D created to put all other items into it.
        g_world = new THREE.Object3D();
        g_scene.add(g_world);

        //Invisible object to handle dragged coordinates.
        g_targetForDragging = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 0.01), new THREE.MeshBasicMaterial());
        g_targetForDragging.material.visible = false;
        g_targetForDragging.material.transparent = true; // This was used for debugging
        g_targetForDragging.material.opacity = 0.1;
        g_targetForDragging.uuid = "drag_object";
    } catch (err) {
        error_handling(err);
    }
}

function createWorld() {
    try {
        g_scene = {};
        g_camera = {};
        g_world = {};
        g_scene = new THREE.Scene();
        g_camera = new THREE.PerspectiveCamera(25, g_canvas.width / 2 / g_canvas.height, 0.1, 1000);
        g_camera.lookAt(new THREE.Vector3(0, 0, 0));
        //ASA-1986 for safe Rerender setPixelRatio on reload POg  Start
        if (g_renderer && typeof g_renderer.setPixelRatio === 'function') {
            g_renderer.setPixelRatio(window.devicePixelRatio);
        } else if (typeof THREE !== 'undefined' && typeof g_canvas !== 'undefined' && g_canvas) {
            g_renderer = new THREE.WebGLRenderer({
                canvas: g_canvas,
                antialias: true,
                preserveDrawingBuffer: true,
            });
            if (typeof g_renderer.setPixelRatio === 'function') g_renderer.setPixelRatio(window.devicePixelRatio);
        }
        //ASA-1986 End
        g_camera.add(new THREE.PointLight(0xffffff, 0.2)); // point light at camera position
        g_scene.add(g_camera);
        if (g_renderer && typeof g_renderer.setClearColor === 'function') {   //ASA-1986 start
            g_renderer.setClearColor(0xffffff);
        }
        //ASA-1986 end
        var directionlight = new THREE.DirectionalLight(0xffffff, 1);
        directionlight.position.set(-1, 2, 4).normalize();
        g_scene.add(directionlight);
        g_camera.aspect = g_canvas.width / 2 / g_canvas.height;
        g_camera.updateProjectionMatrix();
        //resizeRendererToDisplaySize(renderer);
        //An empty object3D created to put all other items into it.
        g_world = new THREE.Object3D();
        g_scene.add(g_world);
        //Invisible object to handle dragged coordinates.
        g_targetForDragging = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 0.01), new THREE.MeshBasicMaterial());
        g_targetForDragging.material.visible = false;
        g_targetForDragging.material.transparent = true; // This was used for debugging
        g_targetForDragging.material.opacity = 0.1;
        g_targetForDragging.uuid = "drag_object";
    } catch (err) {
        error_handling(err);
    }
}


//this function is used to add border black lines for all the objects.
function add_wireframe(p_object, p_linewidth) {
    try {
        logDebug("function : add_wireframe; linewidth : " + p_linewidth, "S");
        var geo = new THREE.EdgesGeometry(p_object.geometry);
        var mat = new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: p_linewidth,
        });
        var wireframe = new THREE.LineSegments(geo, mat);
        wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
        wireframe.uuid = "wireframe";
        p_object.WireframeObj = wireframe;
        p_object.add(wireframe);
        logDebug("function : add_wireframe", "E");
        return wireframe.id;
    } catch (err) {
        error_handling(err);
    }
}

function add_wireframe_3d(p_object) {
    return add_wireframe(p_object, 2);
}

function set_camera_z(p_camera, p_x, p_y, p_width, p_height, p_offset, p_min_x, p_min_y, p_updateJSON = true, p_pog_index) {
    try {
        console.log("p_pog_index", p_pog_index);
        logDebug("function : set_camera_z; x : " + p_x + "; y : " + p_y + "; width : " + p_width + "; height : " + p_height + "; offset : " + p_offset + "; min_x : " + p_min_x + "; min_y : " + p_min_y, "S");
        /*if (p_min_y < 0) {
        var diff_height = 0;
        diff_height = 0 - parseFloat(p_min_y);
        var new_height = 0;
        new_height = p_height - diff_height;
        p_y = new_height / 2;
        p_offset = p_offset + 0.3;
        }*/
        //ASA-1986
        p_x = Number(p_x) || 0;
        p_y = Number(p_y) || 0;
        p_width = Number(p_width);
        if (!Number.isFinite(p_width) || p_width <= 0) p_width = 1;
        p_height = Number(p_height);
        if (!Number.isFinite(p_height) || p_height <= 0) p_height = 1;
        p_offset = Number(p_offset);
        if (!Number.isFinite(p_offset)) p_offset = 0;
        p_min_x = Number(p_min_x) || 0;
        p_min_y = Number(p_min_y) || 0;
        //ASA-1986
        p_camera.position.x = p_x;
        p_camera.position.y = p_y;
        p_camera.position.z = 0;
        console.log("camera.x", p_camera.position.x, p_x);
        var camera_z = 0.1;
        var calc_height = 0;
        var calc_width = 0;
        //This loop will check how far camera should be placed so that POG is completely visible.
        //this is finding the camera.position.z value based on POG height and width.
        for (i = 0; i < 1000; i++) {
            calc_height = visibleHeightAtZDepth(camera_z, p_camera);
            calc_width = visibleWidthAtZDepth(camera_z, p_camera);

            if (parseFloat(p_height) < calc_height && parseFloat(p_width) < calc_width) {
                break;
            } else {
                camera_z += 0.1;
            }
        }
        //p_offset is the standard value to give a little extra space on all sides.
        p_camera.position.z = p_offset + camera_z;
        if (p_updateJSON) {
            g_pog_json[p_pog_index].CameraX = p_x;
            g_pog_json[p_pog_index].CameraY = p_y;
            g_pog_json[p_pog_index].CameraZ = camera_z;
            g_pog_json[p_pog_index].CameraW = p_width;
            g_pog_json[p_pog_index].CameraH = p_height;
            g_pog_json[p_pog_index].CameraMinX = p_min_x;
            g_pog_json[p_pog_index].CameraMinY = p_min_y;
        }

        logDebug("function : set_camera_z", "E");
    } catch (err) {
        logDebug("function : set_camera_z", "E");
        error_handling(err);
    }
}

function set_camera_z_3d(p_camera, p_x, p_y, p_width, p_height, p_offset) {
    set_camera_z(p_camera, p_x, p_y, p_width, p_height, p_offset, 0, 0, false, g_pog_index);
}
//This function can be removed and merged with set_camera_z. both have same logic. but few change only.
function set_camera_z_offside(p_camera, p_x, p_y, p_width, p_height, p_offset, p_min_x, p_min_y) {
    try {
        /*if (p_min_y < 0) {
        var diff_height = 0;
        diff_height = 0 - parseFloat(p_min_y);
        var new_height = 0;
        new_height = p_height - diff_height;
        p_y = new_height / 2;
        p_offset = p_offset;
        }*/

        //ASA-1986

        p_x = Number(p_x) || 0;
        p_y = Number(p_y) || 0;
        p_width = Number(p_width);
        if (!Number.isFinite(p_width) || p_width <= 0) p_width = 1;
        p_height = Number(p_height);
        if (!Number.isFinite(p_height) || p_height <= 0) p_height = 1;
        p_offset = Number(p_offset);
        if (!Number.isFinite(p_offset)) p_offset = 0;
        p_min_x = Number(p_min_x) || 0;
        p_min_y = Number(p_min_y) || 0;
        //ASA-1986
        var camera_z = 0.1;
        var calc_height = 0;
        var calc_width = 0;
        for (i = 0; i < 1000; i++) {
            calc_height = visibleHeightAtZDepth(camera_z, p_camera);
            calc_width = visibleWidthAtZDepth(camera_z, p_camera);

            if (parseFloat(p_height) < calc_height && parseFloat(p_width) < calc_width) {
                break;
            } else {
                camera_z += 0.1; //ASA-1306 added beacuse in combine shelf the item should be cut so its should set to i
            }
        }

        return [p_offset + camera_z, p_y];
    } catch (err) {
        error_handling(err);
    }
}


function getCombinedBoundingBox(p_object) {
    logDebug("function : getCombinedBoundingBox", "S");
    try {
        const result = new THREE.Box3();
        p_object.traverse((child) => {
            // skip everything that doesn't have a geometry
            if (!child.geometry) {
                return;
            }

            child.geometry.computeBoundingBox();
            result.union(child.geometry.boundingBox);
        });

        logDebug("function : getCombinedBoundingBox", "E");
        return result;
    } catch (err) {
        error_handling(err);
        logDebug("function : getCombinedBoundingBox", "E");
    }
}


function wrapText(p_context, p_text, p_x, p_y, p_maxWidth, p_lineHeight) {
    logDebug("function : wrapText; text : " + p_text + "; x : " + p_x + "; y : " + p_y + "; maxWidth : " + p_maxWidth + "; lineHeight : " + p_lineHeight, "S");
    try {
        var words = p_text.split(" "),
            line = "",
            lineCount = 0,
            p = 0,
            test,
            metrics;
        for (p = 0; p < words.length; p++) {
            test = words[p];
            metrics = p_context.measureText(test);
            while (metrics.width > p_maxWidth) {
                // Determine how much of the word will fit
                test = test.substring(0, test.length - 1);
                metrics = p_context.measureText(test);
            }
            if (words[p] != test && test !== "") {
                words.splice(p + 1, 0, words[p].substr(test.length));
                words[p] = test;
            }

            test = line + words[p] + " ";
            metrics = p_context.measureText(test);

            if (metrics.width > p_maxWidth && p > 0) {
                p_context.fillText(line, p_x, p_y);
                line = words[p] + " ";
                p_y += p_lineHeight;
                lineCount++;
            } else {
                line = test;
            }
        }

        p_context.fillText(line, p_x, p_y);
        logDebug("function : wrapText", "E");
    } catch (err) {
        logDebug("function : wrapText", "E");
        error_handling(err);
    }
}

function dcText(p_txt, p_font_size, p_fgcolor, p_bgcolor, p_width, p_height, p_wrap_text, p_reducetofit, p_fontstyle, p_fontbold, p_fontsize, p_mod_index, p_shelf_cnt, p_enlarge_no, p_pog_index, p_pogcr_enhance_textbox_fontsize, p_text_direction) {
    try {
        logDebug("function : dcText; txt : " + p_txt, "S");
        if (p_shelf_cnt !== -1) {
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_cnt];
            if ((shelfdtl.ObjType !== "TEXTBOX") || (shelfdtl.ObjType == "TEXTBOX" && p_pogcr_enhance_textbox_fontsize == "Y" && p_reducetofit == "Y")) {
                p_pogcr_enhance_textbox_fontsize = "N"; //ASA-1787, added if block
            }
            if (typeof shelfdtl.canvasW !== "undefined") {
                if (shelfdtl.canvasW !== null && p_pogcr_enhance_textbox_fontsize == "N") {
                    var canvasWidth = shelfdtl.canvasW * p_enlarge_no;
                    var canvasHeight = shelfdtl.canvasH * p_enlarge_no;
                } else {
                    if (g_initial_camera) { //ASA-2048 Issue 8
                        var [canvasWidth, canvasHeight] = get_visible_size(0.012, p_width * p_enlarge_no, p_height * p_enlarge_no, g_canvas, g_initial_camera);
                        if (shelfdtl.canvasW == null) {
                            shelfdtl.canvasW = canvasWidth / p_enlarge_no;
                            shelfdtl.canvasH = canvasHeight / p_enlarge_no;
                        }
                    }
                    else {
                        var [canvasWidth, canvasHeight] = get_visible_size(0.012, p_width * p_enlarge_no, p_height * p_enlarge_no, g_canvas, g_camera);
                        if (shelfdtl.canvasW == null) {
                            shelfdtl.canvasW = canvasWidth / p_enlarge_no;
                            shelfdtl.canvasH = canvasHeight / p_enlarge_no;
                        }
                    }
                }
            } else {
                var [canvasWidth, canvasHeight] = get_visible_size(0.012, p_width * p_enlarge_no, p_height * p_enlarge_no, g_canvas, g_camera);
                shelfdtl.canvasW = canvasWidth / p_enlarge_no;
                shelfdtl.canvasH = canvasHeight / p_enlarge_no;
            }
        } else {
            var [canvasWidth, canvasHeight] = get_visible_size(0.012, p_width * p_enlarge_no, p_height * p_enlarge_no, g_canvas, g_camera);
        }
        if (!p_font_size || p_font_size === "" && p_text_direction == "V") { // ASA-1797 Issue 1   //ASA-2029
            p_font_size = 12;
        }
        var ruler = document.createElement("DIV");
        ruler.style.fontFamily = p_fontstyle;
        ruler.style.fontWeight = p_fontbold == "bold" ? "bold" : "normal";
        ruler.style.fontSize = parseInt(p_font_size) * p_enlarge_no + "pt";
        ruler.style.position = "absolute";
        ruler.style.top = "-500px";
        ruler.style.left = "0";
        ruler.innerHTML = p_txt;
        document.body.appendChild(ruler);

        let cssSize = {
            width: ruler.offsetWidth,
            height: ruler.offsetHeight,
        },
            cssInfo = window.getComputedStyle(ruler, null),
            fontSizePx = parseFloat(cssInfo["fontSize"]);
        document.body.removeChild(ruler);

        var text_width = ruler.offsetWidth + 5;
        var text_height = parseInt(p_font_size) * p_enlarge_no; //ruler.offsetHeight;

        // create the canvas for the texture
        var txtcanvas = document.createElement("canvas"); // create the canvas for the texture
        var ctx = txtcanvas.getContext("2d");
        txtcanvas.width = canvasWidth;
        txtcanvas.height = canvasHeight;

        if (p_bgcolor != undefined || p_bgcolor !== null) {
            ctx.fillStyle = "#" + p_bgcolor.toString(16).padStart(6, "0");
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#" + p_fgcolor.toString(16).padStart(6, "0"); // fgcolor
        ctx.font = p_fontbold + " " + fontSizePx + "px " + p_fontstyle;

        // ASA-1797 Issue 1 Start
        if (shelfdtl && shelfdtl.ObjType === "TEXTBOX" && p_text_direction == "V") {
            const chars = p_txt.split("");
            let fontSize = parseInt(p_font_size) * p_enlarge_no;
            let charHeight = fontSize * 1.2;
            let totalHeight = chars.length * charHeight;
            let cols = 1;
            if (p_wrap_text === "Y" && totalHeight > canvasHeight) {
                cols = 2;
            }
            let charsPerCol = Math.ceil(chars.length / cols);
            if (p_reducetofit === "Y") {
                while ((charsPerCol * charHeight > canvasHeight) && fontSize > 6) {
                    fontSize--;
                    charHeight = fontSize * 1.2;
                    totalHeight = chars.length * charHeight;
                    charsPerCol = Math.ceil(chars.length / cols);
                }
            }
            ctx.font = p_fontbold + " " + fontSize + "px " + p_fontstyle;
            let startY = (canvasHeight - charHeight * charsPerCol) / 2 + charHeight / 2;
            let centerX = canvasWidth / 2;
            let columnOffset = fontSize;
            for (let c = 0; c < cols; c++) {
                let colX = cols === 2
                    ? centerX + (c === 0 ? -columnOffset / 2 : columnOffset / 2)
                    : centerX;

                for (let i = 0; i < charsPerCol; i++) {
                    let charIndex = i + c * charsPerCol;
                    if (charIndex >= chars.length) break;
                    let yPos = startY + i * charHeight;
                    ctx.fillText(chars[charIndex], colX, yPos);
                }
            }
        }

        // ASA-1797 Issue 1 End
        else {
            var metrics = ctx.measureText(p_txt);
            lineGap = cssSize.height - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);
            let advMetrics = {
                width: metrics.width,
                cssHeight: cssSize.height,
                cssFontSizePx: fontSizePx,
                fontAscent: metrics.fontBoundingBoxAscent,
                fontDescent: metrics.fontBoundingBoxDescent,
                actualAscent: metrics.actualBoundingBoxAscent,
                actualDescent: metrics.actualBoundingBoxDescent,
                lineHeight: cssSize.height,
                lineGap: lineGap,
                lineGapTop: lineGap / 2,
                lineGapBottom: lineGap / 2,
            };

            var metrics = ctx.measureText(p_txt).width;
            if (p_reducetofit == "Y" && metrics > canvasWidth && p_wrap_text == "N") {
                var new_txt_hgt = 50;
                for (i = 50; i >= 0; i--) {
                    var newcanvas = document.createElement("canvas");
                    var new_context = newcanvas.getContext("2d");
                    newcanvas.width = canvasWidth;
                    newcanvas.height = canvasHeight;
                    if (p_bgcolor != undefined || p_bgcolor !== null) {
                        new_context.fillStyle = "#" + p_bgcolor.toString(16).padStart(6, "0");
                        new_context.fillRect(0, 0, canvasWidth, canvasHeight);
                    }
                    new_context.textAlign = "center";
                    new_context.textBaseline = "middle";
                    new_context.fillStyle = "#" + p_fgcolor.toString(16).padStart(6, "0"); // fgcolor
                    new_context.font = p_fontbold + " " + i + "px " + p_fontstyle;
                    if (new_context.measureText(p_txt).width + 5 <= canvasWidth) {
                        new_txt_hgt = i;
                        break;
                    }
                }

                text_height = new_txt_hgt < 50 ? new_txt_hgt : text_height;
            }

            if (p_bgcolor != undefined || p_bgcolor !== null) {
                // fill background if desired (transparent if none)
                ctx.fillStyle = "#" + p_bgcolor.toString(16).padStart(6, "0");
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            }
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#" + p_fgcolor.toString(16).padStart(6, "0"); // fgcolor
            //ctx.font = p_fontbold + " " + text_height + "px " + p_fontstyle;
            ctx.font = (p_fontbold ? p_fontbold + " " : "") + " " + text_height + "px " + p_fontstyle; // ASA 2030 ISSUE 1 FIX

            var lineHeight = advMetrics.lineHeight - advMetrics.lineGap;
            if (p_wrap_text == "Y" && metrics > canvasWidth) {
                wrapText(ctx, p_txt, canvasWidth / 2, text_height, canvasWidth, lineHeight);
            } else {
                ctx.fillText(p_txt, canvasWidth / 2, canvasHeight / 2);
            }
        }

        var tex = new THREE.CanvasTexture(txtcanvas);
        tex.minFilter = THREE.LinearFilter;
        //tex.needsUpdate = true;

        geometry = new THREE.PlaneGeometry(p_width, p_height);
        var material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: tex,
            transparent: true,
            opacity: 1.0,
        });

        var mesh = new THREE.Mesh(geometry, material);
        logDebug("function : dcText", "E");
        return mesh;
    } catch (err) {
        error_handling(err);
    }
}

function add_item_borders(p_module_index, p_shelf_index, p_item_index, p_item_object, p_width, p_height, p_item_horiz_facing, p_pog_index, p_chest_ind) {
    //Bug-26122 - splitting the chest
    try {
        logDebug("function : add_item_borders; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; width : " + p_width + "; height : " + p_height + "; item_horiz_facing : " + p_item_horiz_facing, "S");
        if (p_chest_ind == "Y") {
            //Bug-26122 - splitting the chest
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ChestInfo[p_shelf_index];
        } else {
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        }

        var items = shelfdtl.ItemInfo[p_item_index];
        horiz_facing = p_item_horiz_facing !== -1 ? p_item_horiz_facing : items.BHoriz;
        vert_facing = items.BVert;
        var nesting = items.ItemNesting;
        var nesting_val = items.NVal;
        var cap_style = items.CapStyle;
        var cap_count = items.CapCount;
        var [org_width, org_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.OW, items.OH, items.OD);
        //var org_height = items.OH;
        //var org_width = items.OW;
        //var item_depth = items.OD;
        var real_height = items.RH;

        var rotation = shelfdtl.Rotation;
        var shelf_depth = shelfdtl.D;
        var shelfhorizgap = shelfdtl.HorizGap;
        var spread_product = shelfdtl.SpreadItem;
        var verti_values = [],
            horiz_values = [],
            nesting_negetive = "N",
            curr_width = 0,
            curr_vert_value = 0,
            curr_height = 0;
        var l_horz_start = 0 - parseFloat(p_width) / 2;
        var l_vert_start = 0 - parseFloat(p_height) / 2;
        var l_horz_end = 0 + parseFloat(p_width) / 2;
        var l_vert_end = 0 + parseFloat(p_height) / 2;
        var points = [];

        //var geometry = new THREE.Geometry();

        if (nesting_val !== 0 && (vert_facing > 1 || horiz_facing > 1) && shelfhorizgap == 0 && spread_product !== "F" && nesting !== "D") {
            if (nesting_val < 0) {
                nesting_val = nesting_val * -1;
                nesting_negetive = "Y";
            }
            if (nesting == "H") {
                if (nesting_negetive == "N") {
                    curr_vert_value = l_vert_start + org_height;
                    verti_values.push(curr_vert_value);
                } else {
                    curr_vert_value = l_vert_start;
                }
                for (i = 1; i < vert_facing; i++) {
                    curr_vert_value += parseFloat(nesting_val);
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }

                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
                if (horiz_facing > 1) {
                    curr_width = p_width / horiz_facing;

                    var curr_horiz_value = l_horz_start;
                    for (i = 1; i < horiz_facing; i++) {
                        curr_horiz_value += parseFloat(curr_width);
                        horiz_values.push(curr_horiz_value);
                    }
                    for (i = 0; i < horiz_values.length; i++) {
                        points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                        points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                    }
                }
            } else if (nesting == "W") {
                if (nesting_negetive == "N") {
                    curr_vert_value = l_horz_start + org_width;
                    horiz_values.push(curr_vert_value);
                } else {
                    curr_vert_value = l_horz_start;
                }
                for (i = 1; i < horiz_facing; i++) {
                    curr_vert_value += parseFloat(nesting_val);
                    if (curr_vert_value < l_horz_end) {
                        horiz_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }

                for (i = 0; i < horiz_values.length; i++) {
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                }
                if (vert_facing > 1) {
                    curr_height = p_height / vert_facing;

                    curr_vert_value = l_vert_start;
                    for (i = 1; i < vert_facing; i++) {
                        curr_vert_value += parseFloat(curr_height);
                        if (curr_vert_value < l_vert_end) {
                            verti_values.push(curr_vert_value);
                        } else {
                            break;
                        }
                    }
                    for (i = 0; i < verti_values.length; i++) {
                        points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                        points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                    }
                }
            }
        } else if (cap_style !== "0") {
            var items_cnt = 0;
            if (cap_style == "1") {
                curr_vert_value = l_vert_start;
                for (i = 1; i <= vert_facing; i++) {
                    curr_vert_value += parseFloat(org_height);
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }
                for (i = 1; i < cap_count; i++) {
                    // curr_vert_value += parseFloat(item_depth);//ASA-1170
                    curr_vert_value += parseFloat(items.CapHeight); //ASA-1170
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }
                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            } else if (cap_style == "2") {
                curr_vert_value = l_vert_start;
                for (i = 1; i <= vert_facing; i++) {
                    curr_vert_value += org_height;
                    verti_values.push(curr_vert_value);
                }
                for (i = 1; i < cap_count; i++) {
                    // curr_vert_value += parseFloat(item_depth);//ASA-1170
                    curr_vert_value += parseFloat(items.CapHeight); //ASA-1170
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }

                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            } else if (cap_style == "3") {
                curr_vert_value = l_vert_start + org_height;
                verti_values.push(curr_vert_value);
                for (i = 1; i < cap_count; i++) {
                    // curr_vert_value += parseFloat(item_depth);//ASA-1170
                    curr_vert_value += parseFloat(items.CapHeight); //ASA-1170
                    if (curr_vert_value < l_vert_end) {
                        verti_values.push(curr_vert_value);
                    } else {
                        break;
                    }
                }

                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            }
            if (horiz_facing > 1) {
                curr_width = p_width / horiz_facing;

                var curr_horiz_value = l_horz_start;
                for (i = 1; i < horiz_facing; i++) {
                    curr_horiz_value += parseFloat(curr_width);
                    if (curr_horiz_value < l_vert_end) {
                        horiz_values.push(curr_horiz_value);
                    } else {
                        break;
                    }
                }
                for (i = 0; i < horiz_values.length; i++) {
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                }
            }
        } else {
            if (vert_facing > 1) {
                curr_height = p_height / vert_facing;
                curr_vert_value = l_vert_start;
                for (i = 1; i < vert_facing; i++) {
                    curr_vert_value += parseFloat(curr_height);
                    verti_values.push(curr_vert_value);
                }
                for (i = 0; i < verti_values.length; i++) {
                    points.push(new THREE.Vector3(l_horz_start, verti_values[i], 0));
                    points.push(new THREE.Vector3(l_horz_end, verti_values[i], 0));
                }
            }
            if (horiz_facing > 1) {
                curr_width = p_width / horiz_facing;

                var curr_horiz_value = l_horz_start;
                for (i = 1; i < horiz_facing; i++) {
                    curr_horiz_value += parseFloat(curr_width);
                    horiz_values.push(curr_horiz_value);
                }
                for (i = 0; i < horiz_values.length; i++) {
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_start, 0));
                    points.push(new THREE.Vector3(horiz_values[i], l_vert_end, 0));
                }
            }
        }
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({
            color: 0x000000,
        });

        var line = new THREE.LineSegments(geometry, material);

        line.position.z = 0.0006;
        p_item_object.add(line);
        logDebug("function : add_item_borders", "E");
    } catch (err) {
        error_handling(err);
    }
}


async function update_rotate_shelfs(p_pog_index) {
    logDebug("function : update_rotate_shelfs", "S");
    try {
        var j = 0;
        for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
            if (Modules.ParentModule == null) {
                var i = 0;
                for (const Shelf of Modules.ShelfInfo) {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && (Shelf.Rotation !== 0 || Shelf.Slope !== 0)) {
                        var shelf_obj = g_world.getObjectById(Shelf.SObjID);
                        if (Shelf.Rotation !== 0) {
                            shelf_obj.quaternion.copy(g_camera.quaternion);
                            shelf_obj.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
                            shelf_obj.rotateY((Shelf.Rotation * Math.PI) / 180);
                            var slope = 0;
                            if (Shelf.Slope > 0) {
                                slope = 0 - Shelf.Slope;
                            } else if (Shelf.Slope < 0) {
                                slope = -Shelf.Slope;
                            } else {
                                slope = 0;
                            }
                            shelf_obj.rotateX((slope * Math.PI) / 180);
                            shelf_obj.updateMatrix();
                        }

                        if (g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[i].ItemInfo.length > 0) {
                            g_scene.updateMatrixWorld();
                            async function doSomething() {
                                let result = await set_all_items(j, i, Shelf.X, Shelf.Y, g_shelf_edit_flag, "N", "Y", p_pog_index, p_pog_index);
                            }
                            doSomething();
                        }
                    }
                    i++;
                }
            }
            j++;
        }
        logDebug("function : update_rotate_shelfs", "E");
    } catch (err) {
        error_handling(err);
    }
}


//Start Bug-26122 - splitting the chest
function update_item_label(p_module_index, p_shelf_index, p_item_index, p_item_obj, p_show_item_label, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, p_chest_ind = "N") {
    logDebug("function : update_item_label; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; g_show_item_label : " + p_show_item_label, "S");
    try {
        if (p_chest_ind == "Y") {
            var shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ChestInfo[p_shelf_index];
        } else {
            var shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        }
        if (p_show_item_label == "Y" && shelf_dtl.ItemInfo[p_item_index].LocID !== "" && typeof shelf_dtl.ItemInfo[p_item_index].LocID !== "undefined") {
            var back_color = p_pogcrItemLabelColor,
                text_color;
            if (hexToRgb(back_color) == null) {
                var red = parseInt("FF", 16);
                var green = parseInt("FF", 16);
                var blue = parseInt("FF", 16);
            } else {
                var red = hexToRgb(back_color).r;
                var green = hexToRgb(back_color).r;
                var blue = hexToRgb(back_color).g;
            }
            text_color = getTextColor(red, green, blue); //ASA-1095
            if (g_fixel_label == "N") {
                var return_obj = addlabelText(shelf_dtl.ItemInfo[p_item_index].LocID, g_labelFont, g_labelActualSize, text_color, "center", back_color);
            } else {
                var text = get_type(shelf_dtl.ItemInfo[p_item_index].BrandType);
                if (typeof text == "undefined" || text == "") {
                    text = shelf_dtl.ItemInfo[p_item_index].LocID;
                } else {
                    text = text + " " + shelf_dtl.ItemInfo[p_item_index].LocID;
                }
                var return_obj = addlabelText(text, g_labelFont, g_labelActualSize, text_color, "center", back_color);
            }

            p_item_obj.add(return_obj);
            return_obj.position.x = 0;

            if (p_pogcrItemNumLabelPosition == "CENTER") {
                return_obj.position.y = 0;
            } else if (p_pogcrItemNumLabelPosition == "BOTTOM") {
                return_obj.position.y = 0 - shelf_dtl.ItemInfo[p_item_index].H / 2 + 0.0015625 * g_labelFont;
            } else {
                return_obj.position.y = shelf_dtl.ItemInfo[p_item_index].H / 2 + 0.0015625 * g_labelFont;
            }

            if (shelf_dtl.Rotation !== 0 || shelf_dtl.Slope !== 0) {
                return_obj.position.z = shelf_dtl.ItemInfo[p_item_index].D / 2 + 0.005;
            } else {
                // return_obj.position.z = 0.005;
                return_obj.position.z = 0.0015;
            }
            shelf_dtl.ItemInfo[p_item_index].LObjID = return_obj.id;
        }
        logDebug("function : update_item_label", "E");
        return "success";
    } catch (err) {
        error_handling(err);
    }
}
//End Bug-26122 - splitting the chest


function show_item_labels(p_show_label_ind, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index) {
    try {
        logDebug("function : show_item_labels; show_label_ind : " + p_show_label_ind + "; pogcrItemBackLabelColor : " + p_pogcrItemBackLabelColor + "; pogcrItemLabelPosition : " + p_pogcrItemLabelPosition, "S");
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var details = {};
        var is_driver = "N";
        var finalAction;
        if (typeof g_undoRedoAction == "undefined") {
            g_undoRedoAction = "REDO";
        }
        if (g_undoRedoAction == "REDO") {
            finalAction = "U";
        } else {
            finalAction = "R";
        }
        var i = 0;

        if (p_show_label_ind == "Y") {
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            if (shelfs.ItemInfo.length > 0) {
                                var item_Details = shelfs.ItemInfo;
                                var k = 0;
                                for (const items of item_Details) {
                                    if (items.Item !== "DIVIDER" && items.LocID !== "" && typeof items.LocID !== "undefined") {
                                        var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                        if (typeof item_obj !== "undefined") {
                                            if (typeof items.LObjID !== "undefined" && items.LObjID !== -1) {
                                                var label_obj = item_obj.getObjectById(items.LObjID);
                                                item_obj.remove(label_obj);
                                            }
                                            var back_color = p_pogcrItemBackLabelColor,
                                                text_color;
                                            if (hexToRgb(back_color) == null) {
                                                var red = parseInt("FF", 16);
                                                var green = parseInt("FF", 16);
                                                var blue = parseInt("FF", 16);
                                            } else {
                                                var red = hexToRgb(back_color).r;
                                                var green = hexToRgb(back_color).r;
                                                var blue = hexToRgb(back_color).g;
                                            }
                                            var text_color = getTextColor(red, green, blue); //ASA-1095
                                            if (g_fixel_label == "Y") {
                                                var text = get_type(items.BrandType);
                                                if (typeof text == "undefined" || text == "") {
                                                    text = items.LocID;
                                                } else {
                                                    text = text + "" + items.LocID;
                                                }
                                                var return_obj = addlabelText(text, g_labelFont, g_labelActualSize, text_color, "center", back_color);
                                            } else {
                                                var return_obj = addlabelText(items.LocID, g_labelFont, g_labelActualSize, text_color, "center", back_color);
                                            }
                                            item_obj.add(return_obj);
                                            return_obj.position.x = 0;
                                            if (p_pogcrItemLabelPosition == "CENTER") {
                                                return_obj.position.y = 0;
                                            } else if (p_pogcrItemLabelPosition == "BOTTOM") {
                                                return_obj.position.y = 0 - items.H / 2 + 0.0015625 * g_labelFont;
                                            } else {
                                                return_obj.position.y = items.H / 2 + 0.0015625 * g_labelFont;
                                            }

                                            if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                                return_obj.position.z = items.D / 2 + 0.0005;
                                            } else {
                                                return_obj.position.z = 0.0015;
                                            }
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].LObjID = return_obj.id;
                                        }
                                    } else if (items.Item !== "DIVIDER") {
                                        if (typeof items.LObjID !== "undefined" && items.LObjID !== -1) {
                                            var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                            if (typeof item_obj !== "undefined") {
                                                var label_obj = item_obj.getObjectById(items.LObjID);
                                                item_obj.remove(label_obj);
                                            }
                                        }
                                    }
                                    k = k + 1;
                                }
                            }
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
        } else {
            var i = 0;
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            if (shelfs.ItemInfo.length > 0) {
                                var item_Details = shelfs.ItemInfo;
                                var k = 0;
                                for (const items of item_Details) {
                                    if (items.Item !== "DIVIDER" && items.LocID !== "" && typeof items.LocID !== "undefined") {
                                        var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                        if (typeof item_obj !== "undefined") {
                                            if (typeof items.LObjID !== "undefined" && items.LObjID !== -1) {
                                                var label_obj = item_obj.getObjectById(items.LObjID);
                                                item_obj.remove(label_obj);
                                            }
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].LObjID = -1;
                                        }
                                    }
                                    k = k + 1;
                                }
                            }
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
        }
        var oldLabelStatus;
        if (p_show_label_ind == "Y") {
            oldLabelStatus = "N";
        } else {
            oldLabelStatus = "Y";
        }
        details["show_item_labels"] = oldLabelStatus;
        g_undo_details = [];
        g_undo_details.push(details);
        if (finalAction == "U") {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_undo_all_obj_arr = [];

            g_undo_all_obj_arr.push(g_undo_details);
            g_undo_all_obj_arr.push(g_cut_copy_arr);
            g_undo_all_obj_arr.previousAction = "ITEM_LABEL";
            if (g_cut_support_obj_arr.length > 0) {
                //yrc
                g_undo_all_obj_arr.hasSupportArr = "Y";
            } else {
                g_undo_all_obj_arr.hasSupportArr = "N";
            }
            g_undo_all_obj_arr.g_MultiObjects = "N";
            g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
            g_undo_final_obj_arr.push(g_undo_all_obj_arr);
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            g_undo_details = [];
        } else {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_redo_all_obj_arr = [];
            g_redo_all_obj_arr.push(g_undo_details);
            g_redo_all_obj_arr.push(g_cut_copy_arr);
            g_redo_all_obj_arr.previousAction = "ITEM_LABEL";
            if (g_cut_support_obj_arr.length > 0) {
                //yrc
                g_redo_all_obj_arr.hasSupportArr = "Y";
            } else {
                g_redo_all_obj_arr.hasSupportArr = "N";
            }
            g_redo_all_obj_arr.g_MultiObjects = "N";
            g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
            g_redo_final_obj_arr.push(g_redo_all_obj_arr);
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            g_undo_details = [];
        }
        animate_pog(p_pog_index);
        render(p_pog_index);
        logDebug("function : show_item_labels", "E");
    } catch (err) {
        error_handling(err);
    }
}

//Start ASA-1290 should show bottom of shelf
function update_single_fixel_label(p_shelfs, p_pog_index, p_module_index, p_shelf_index) {
    var l_obj_id = -1;
    var shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index]; //ASA-1573 Issue 3
    var modules = g_pog_json[p_pog_index].ModuleInfo[p_module_index];
    if (p_shelfs.ObjType == "DIVIDER") {
        var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
        $.each(new_shelf_detail, function (k, shelfs_detail) {
            if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                $.each(shelfs_detail.ItemInfo, function (l, items) {
                    if (items.Item == "DIVIDER") {
                        if (p_shelfs.ShelfDivObjID == items.ObjID) {
                            div_mod_index = i;
                            div_shelf_index = k;
                            div_item_index = l;
                            l_obj_id = items.LObjID;
                        }
                    }
                });
            }
        });
        var shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(p_shelfs.ShelfDivObjID);
    } else {
        l_obj_id = p_shelfs.LObjID;
        var shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(p_shelfs.SObjID);
    }
    if (typeof shelf_obj !== "undefined") {
        if (typeof l_obj_id !== "undefined" && l_obj_id !== -1) {
            var label_obj = shelf_obj.getObjectById(l_obj_id);
            shelf_obj.remove(label_obj);
        }
        var hex_color = p_shelfs.Color;
        if (hexToRgb(hex_color) == null) {
            var red = parseInt("FF", 16);
            var green = parseInt("FF", 16);
            var blue = parseInt("FF", 16);
        } else {
            var red = hexToRgb(hex_color).r;
            var green = hexToRgb(hex_color).r;
            var blue = hexToRgb(hex_color).g;
        }

        var text_color = getTextColor(red, green, blue);
        if (g_fixel_label == "Y") {
            /*Start ASA-1371_26842
            var cap_count = 100;
            var notch_no = 0;
            for (k = 0; k < cap_count; k++) {
                if (p_shelfs.Y + (p_shelfs.H / 2) < g_pog_json[p_pog_index].BaseH + (modules.NotchStart / 2) && modules.NotchStart > 0) {
                    notch_no = 0;
                    break;
                } else if (p_shelfs.Y + (p_shelfs.H / 2) <= g_pog_json[p_pog_index].BaseH + (modules.NotchStart / 2) && modules.NotchStart > 0) {
                    notch_no = 0;
                    break;
                } else if (p_shelfs.Y + (p_shelfs.H / 2) <= g_pog_json[p_pog_index].BaseH && modules.NotchStart == 0) {
                    notch_no = 0;
                    break;
                } else if (p_shelfs.Y + (p_shelfs.H / 2) < ((g_pog_json[p_pog_index].BaseH + modules.NotchStart)) + modules.NotchSpacing * k) {
                    notch_no = k;
                    break;
                }
            }*/
            var notch_no = get_notch_no(modules, p_pog_index, p_shelfs.Y + p_shelfs.H / 2); //ASA-1371_26842
            //End ASA-1371_26842

            var shelf = p_shelfs.Shelf + " " + p_shelfs.Desc + " " + parseFloat(p_shelfs.Y * 100 - (p_shelfs.H / 2) * 100).toFixed(2) + get_message("POGCR_FIXEL_CM") + " " + notch_no;
            var return_obj = addlabelText(shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
        } else {
            var return_obj = addlabelText(p_shelfs.Shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
        }
        shelf_obj.add(return_obj);

        return_obj.position.y = -0.005;
        if (p_shelfs.Rotation !== 0 || p_shelfs.Slope !== 0) {
            return_obj.position.z = p_shelfs.D / 2 + 0.005;
        } else {
            return_obj.position.z = 0.005;
        }
        if (p_shelfs.ObjType == "DIVIDER" && div_mod_index !== -1) {
            return_obj.position.x = 0;
            g_pog_json[p_pog_index].ModuleInfo[div_mod_index].ShelfInfo[div_shelf_index].ItemInfo[div_item_index].LObjID = return_obj.id;
            shelf_dtl.LObjID = return_obj.id;
        } else {
            if (g_fixel_label !== "Y") {
                return_obj.position.x = 0 - (p_shelfs.W / 2.4 + 0.01);
            } else {
                return_obj.position.x = 0 - (p_shelfs.W / 2.4 - 0.02);
            }
            shelf_dtl.LObjID = return_obj.id;
        }
    }
}
//End ASA-1290 should show bottom of shelf


function show_fixel_labels(p_show_label_ind, p_pog_index) {
    try {
        logDebug("function : show_fixel_labels; show_label_ind : " + p_show_label_ind, "S");
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var div_mod_index = -1,
            div_shelf_index = -1,
            div_item_index = -1,
            no_show_div_id = "N"; //ASA-1406 //Task_27734
        var details = {};
        var is_driver = "N";
        var finalAction;
        if (typeof g_undoRedoAction == "undefined") {
            g_undoRedoAction = "REDO";
        }
        if (g_undoRedoAction == "REDO") {
            finalAction = "U";
        } else {
            finalAction = "R";
        }
        var i = 0;
        if (p_show_label_ind == "Y") {
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        no_show_div_id = "N"; // Task_27734
                        console.log("ObjType TextBox", shelfs.ObjType);
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "TEXTBOX") {
                            var l_obj_id = -1;
                            if (shelfs.ObjType == "DIVIDER") {
                                var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                $.each(new_shelf_detail, function (k, shelfs_detail) {
                                    if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                        $.each(shelfs_detail.ItemInfo, function (l, items) {
                                            if (items.Item == "DIVIDER") {
                                                if (shelfs.ShelfDivObjID == items.ObjID) {
                                                    div_mod_index = i;
                                                    div_shelf_index = k;
                                                    div_item_index = l;
                                                    l_obj_id = items.LObjID;
                                                    if (shelfs.DivHeight > 0 && (shelfs.DivPbtwFace == "Y" || shelfs.DivPst == "Y" || shelfs.DivPed == "Y")) {
                                                        //Start Task_27734
                                                        if (typeof shelfs.NoDivIDShow !== "undefined") {
                                                            no_show_div_id = shelfs.NoDivIDShow; //ASA-1406
                                                        } else if (typeof shelfs_detail.NoDivIDShow !== "undefined") {
                                                            no_show_div_id = shelfs_detail.NoDivIDShow; //ASA-1406
                                                        } else {
                                                            no_show_div_id = "N";
                                                        }
                                                    } else {
                                                        no_show_div_id = "N";
                                                    } //End Task_27734
                                                }
                                            }
                                        });
                                    }
                                });
                                var shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.ShelfDivObjID); //ASA-1406 //Task_27734
                                //var shelf_obj = no_show_div_id == 'N' ? g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.ShelfDivObjID) : undefined;//ASA-1406 //Task_27734
                            } else {
                                l_obj_id = shelfs.LObjID;
                                var shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
                            }
                            if (typeof shelf_obj !== "undefined") {
                                if (typeof l_obj_id !== "undefined" && l_obj_id !== -1) {
                                    var label_obj = shelf_obj.getObjectById(l_obj_id);
                                    shelf_obj.remove(label_obj);
                                }
                                var hex_color = shelfs.Color;
                                if (hexToRgb(hex_color) == null) {
                                    var red = parseInt("FF", 16);
                                    var green = parseInt("FF", 16);
                                    var blue = parseInt("FF", 16);
                                } else {
                                    var red = hexToRgb(hex_color).r;
                                    var green = hexToRgb(hex_color).r;
                                    var blue = hexToRgb(hex_color).g;
                                }

                                var text_color = getTextColor(red, green, blue); //ASA-1095
                                if (g_fixel_label == "Y") {
                                    //ASA-1113
                                    //Start ASA-1371_26842
                                    /*var cap_count = 100;
                                    var notch_no = 0;
 
                                    for (k = 0; k < cap_count; k++) {
                                        if (shelfs.Y + (shelfs.H / 2) < g_pog_json[p_pog_index].BaseH + (modules.NotchStart / 2) && modules.NotchStart > 0) {
                                            notch_no = 0;
                                            break;
                                        } else if (shelfs.Y + (shelfs.H / 2) <= g_pog_json[p_pog_index].BaseH + (modules.NotchStart / 2) && modules.NotchStart > 0) {
                                            notch_no = 0;
                                            break;
                                        } else if (shelfs.Y + (shelfs.H / 2) <= g_addlabelText$''pog_json[p_pog_index].BaseH && modules.NotchStart == 0) {
                                            notch_no = 0;
                                            break;
                                        } else if (shelfs.Y + (shelfs.H / 2) < ((g_pog_json[p_pog_index].BaseH + modules.NotchStart)) + modules.NotchSpacing * k) {
                                            notch_no = k;
                                            break;
                                        }
                                    }*/
                                    if (no_show_div_id == "N") {
                                        //Task_27734
                                        var notch_no = get_notch_no(modules, p_pog_index, shelfs.Y + shelfs.H / 2); //ASA-1371_26842
                                        //End ASA-1371_26842
                                        //ASA-1290 should show bottom of shelf
                                        var shelf = shelfs.Shelf + " " + shelfs.Desc + " " + parseFloat(shelfs.Y * 100 - (shelfs.H / 2) * 100).toFixed(2) + get_message("POGCR_FIXEL_CM") + " " + notch_no;
                                        var return_obj = addlabelText(shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
                                    }
                                } else {
                                    if (no_show_div_id == "N") {
                                        //Task_27734
                                        var return_obj = addlabelText(shelfs.Shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
                                    }
                                }
                                if (no_show_div_id == "N") {
                                    //Task_27734
                                    shelf_obj.add(return_obj);

                                    //return_obj.position.y = -0.005; commented for ASA-1701
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        return_obj.position.z = shelfs.D / 2 + 0.005;
                                    } else {
                                        return_obj.position.z = 0.005; //0.0005  ASA-1095
                                    }
                                    if (shelfs.ObjType == "DIVIDER" && div_mod_index !== -1) {
                                        return_obj.position.x = 0;
                                        g_pog_json[p_pog_index].ModuleInfo[div_mod_index].ShelfInfo[div_shelf_index].ItemInfo[div_item_index].LObjID = return_obj.id;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].LObjID = return_obj.id;
                                    } else {
                                        if (g_fixel_label !== "Y") {
                                            var x = ((return_obj.material.map.image.width / return_obj.material.map.image.height) * g_labelActualSize) / 2; //ASA-1677 #5 Added to calculate value for X
                                            return_obj.position.x = 0 - shelfs.W / 2 + x + 0.01;
                                            return_obj.position.y = 0; // ASA-1701 Added
                                            //return_obj.position.x = 0 - (shelfs.W / 2.4 + 0.01);
                                        } else {
                                            var x = ((return_obj.material.map.image.width / return_obj.material.map.image.height) * g_labelActualSize) / 2; //ASA-1677 #5 Added to calculate value for X
                                            return_obj.position.x = 0 - shelfs.W / 2 + x + 0.01;
                                            return_obj.position.y = -0.005; // ASA-1701 Added
                                            //return_obj.position.x = 0 - (shelfs.W / 2.4 - 0.02); //ASA-1113
                                        }
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].LObjID = return_obj.id;
                                    }
                                }
                            }
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
        } else {
            var i = 0;
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH") {
                            var l_obj_id = -1;
                            if (shelfs.ObjType == "DIVIDER") {
                                var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                $.each(new_shelf_detail, function (k, shelfs_detail) {
                                    if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                        $.each(shelfs_detail.ItemInfo, function (l, items) {
                                            if (items.Item == "DIVIDER") {
                                                if (shelfs.ShelfDivObjID == items.ObjID) {
                                                    div_mod_index = i;
                                                    div_shelf_index = k;
                                                    div_item_index = l;
                                                    l_obj_id = items.LObjID;
                                                }
                                            }
                                        });
                                    }
                                });

                                var shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.ShelfDivObjID);
                            } else {
                                l_obj_id = shelfs.LObjID;
                                var shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
                            }
                            if (typeof l_obj_id !== "undefined" && l_obj_id !== -1) {
                                var label_obj = shelf_obj.getObjectById(l_obj_id);
                                shelf_obj.remove(label_obj);
                            }
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].LObjID = -1;
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
            if (g_fixel_label == "Y") {
                show_notch_labels("N", "", "Y", p_pog_index);
            }
        }

        var oldLabelStatus;
        if (p_show_label_ind == "Y") {
            oldLabelStatus = "N";
        } else {
            oldLabelStatus = "Y";
        }
        details["show_fixel_labels"] = oldLabelStatus;
        g_undo_details = [];
        g_undo_details.push(details);
        if (finalAction == "U") {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_undo_all_obj_arr = [];

            g_undo_all_obj_arr.push(g_undo_details);
            g_undo_all_obj_arr.push(g_cut_copy_arr);
            g_undo_all_obj_arr.previousAction = "FIXEL_LABEL";
            if (g_cut_support_obj_arr.length > 0) {
                //yrc
                g_undo_all_obj_arr.hasSupportArr = "Y";
            } else {
                g_undo_all_obj_arr.hasSupportArr = "N";
            }
            g_undo_all_obj_arr.g_MultiObjects = "N";
            g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
            g_undo_final_obj_arr.push(g_undo_all_obj_arr);
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            g_undo_details = [];
        } else {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_redo_all_obj_arr = [];
            g_redo_all_obj_arr.push(g_undo_details);
            g_redo_all_obj_arr.push(g_cut_copy_arr);
            g_redo_all_obj_arr.previousAction = "FIXEL_LABEL";
            if (g_cut_support_obj_arr.length > 0) {
                //yrc
                g_redo_all_obj_arr.hasSupportArr = "Y";
            } else {
                g_redo_all_obj_arr.hasSupportArr = "N";
            }
            g_redo_all_obj_arr.g_MultiObjects = "N";
            g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
            g_redo_final_obj_arr.push(g_redo_all_obj_arr);
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            g_undo_details = [];
        }
        animate_pog(p_pog_index);
        render(p_pog_index);
        logDebug("function : show_fixel_labels", "E");
    } catch (err) {
        error_handling(err);
    }
}

function show_notch_labels(p_show_label_ind, p_notchHead, p_updateUndo = "Y", p_pog_index) {
    try {
        logDebug("function : show_notch_labels; show_label_ind : " + p_show_label_ind, "S");
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var notch_label = g_notch_label_position.toUpperCase();
        var div_mod_index = -1,
            div_shelf_index = -1,
            div_item_index = -1;
        var details = {};
        var is_driver = "N";
        var finalAction;
        var posX, posY;
        if (typeof g_undoRedoAction == "undefined") {
            g_undoRedoAction = "REDO";
        }
        if (g_undoRedoAction == "REDO") {
            finalAction = "U";
        } else {
            finalAction = "R";
        }
        var i = 0;
        if (p_show_label_ind == "Y") {
            for (const modules of module_details) {
                if ((typeof modules.ParentModule == "undefined" || modules.ParentModule == null) && modules.NotchW > 0) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            var shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
                            if (typeof shelfs.NotchLabelObjID !== "undefined" && shelfs.NotchLabelObjID !== -1) {
                                var label_obj = shelf_obj.getObjectById(shelfs.NotchLabelObjID);
                                shelf_obj.remove(label_obj);
                            }
                            /*Start ASA-1371_26842
                            var cap_count = 100;
                            var notch_no = -1; //change in 1254 to start value from 0
                            for (k = 0; k < cap_count; k++) { //ASA-1290
                                if (shelfs.Y + (shelfs.H / 2) < g_pog_json[p_pog_index].BaseH + (modules.NotchStart / 2) && modules.NotchStart > 0) {
                                    notch_no = 0;
                                    break;
                                } else if (shelfs.Y + (shelfs.H / 2) <= g_pog_json[p_pog_index].BaseH + (modules.NotchStart / 2) && modules.NotchStart > 0) {
                                    notch_no = 0;
                                    break;
                                } else if (shelfs.Y + (shelfs.H / 2) <= g_pog_json[p_pog_index].BaseH && modules.NotchStart == 0) {
                                    notch_no = 0;
                                    break;
                                } else if (shelfs.Y + (shelfs.H / 2) < ((g_pog_json[p_pog_index].BaseH + modules.NotchStart)) + modules.NotchSpacing * k) {
                                    notch_no = k;
                                    break;
                                }
                            }*/
                            var notch_no = get_notch_no(modules, p_pog_index, shelfs.Y + shelfs.H / 2); //ASA-1371_26842
                            //End ASA-1371_26842
                            shelfs.NotchNo = notch_no;

                            var hex_color = shelfs.Color;
                            if (hexToRgb(hex_color) == null) {
                                var red = parseInt("FF", 16);
                                var green = parseInt("FF", 16);
                                var blue = parseInt("FF", 16);
                            } else {
                                var red = hexToRgb(hex_color).r;
                                var green = hexToRgb(hex_color).r;
                                var blue = hexToRgb(hex_color).g;
                            }

                            var text_color;

                            // ASA-1095
                            if (notch_label == "CENTER") {
                                text_color = getTextColor(red, green, blue); //ASA-1095
                            } else {
                                text_color = "#000000";
                            }
                            var return_obj = addlabelText(p_notchHead + " " + notch_no, g_labelFont, g_labelActualSize, text_color, "center", "");
                            shelf_obj.add(return_obj);

                            if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                return_obj.position.z = shelfs.D / 2 + 0.005;
                            } else {
                                return_obj.position.z = 0.005; // 0.0005 --ASA-1095
                            }

                            [posX, posY] = getLabelPosition(shelfs, "S", notch_label); // ASA-1095
                            return_obj.position.x = posX;
                            return_obj.position.y = posY;
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].NotchLabelObjID = return_obj.id;
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
        } else {
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            var shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);

                            if (typeof shelfs.NotchLabelObjID !== "undefined" && shelfs.NotchLabelObjID !== -1) {
                                var label_obj = shelf_obj.getObjectById(shelfs.NotchLabelObjID);
                                shelf_obj.remove(label_obj);
                            }
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].NotchLabelObjID = -1;
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
        }
        var oldLabelStatus;
        if (p_show_label_ind == "Y") {
            oldLabelStatus = "N";
        } else {
            oldLabelStatus = "Y";
        }
        details["show_notch_labels"] = oldLabelStatus;
        g_undo_details = [];
        p_updateUndo == "Y" ? g_undo_details.push(details) : "";
        if (p_updateUndo == "Y") {
            if (finalAction == "U") {
                g_delete_details.multi_delete_shelf_ind = "N";
                g_undo_all_obj_arr = [];

                p_updateUndo == "Y" ? g_undo_all_obj_arr.push(g_undo_details) : "";
                p_updateUndo == "Y" ? g_undo_all_obj_arr.push(g_cut_copy_arr) : "";
                g_undo_all_obj_arr.previousAction = "NOTCH_LABEL";
                if (g_cut_support_obj_arr.length > 0) {
                    g_undo_all_obj_arr.hasSupportArr = "Y";
                } else {
                    g_undo_all_obj_arr.hasSupportArr = "N";
                }
                g_undo_all_obj_arr.g_MultiObjects = "N";
                g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
                g_undo_final_obj_arr.push(g_undo_all_obj_arr);
                g_delete_details = [];
                g_multi_drag_shelf_arr = [];
                g_multi_drag_item_arr = [];
                g_cut_copy_arr = [];
                g_undo_details = [];
            } else {
                g_delete_details.multi_delete_shelf_ind = "N";
                g_redo_all_obj_arr = [];
                g_redo_all_obj_arr.push(g_undo_details);
                g_redo_all_obj_arr.push(g_cut_copy_arr);
                g_redo_all_obj_arr.previousAction = "NOTCH_LABEL";
                if (g_cut_support_obj_arr.length > 0) {
                    //yrc
                    g_redo_all_obj_arr.hasSupportArr = "Y";
                } else {
                    g_redo_all_obj_arr.hasSupportArr = "N";
                }
                g_redo_all_obj_arr.g_MultiObjects = "N";
                g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
                g_redo_final_obj_arr.push(g_redo_all_obj_arr);
                g_delete_details = [];
                g_multi_drag_shelf_arr = [];
                g_multi_drag_item_arr = [];
                g_cut_copy_arr = [];
                g_undo_details = [];
            }
        }
        render(p_pog_index);
        logDebug("function : show_notch_labels", "E");
    } catch (err) {
        error_handling(err);
    }
}

function addlabelText(p_text, p_textHeight, p_actualFontSize, p_font_color, p_txt_align, p_back_color) {
    try {
        logDebug("function : addlabelText; text : " + p_text + "; textHeight : " + p_textHeight + "; actualFontSize : " + p_actualFontSize + "; font_color : " + p_font_color + "; txt_align : " + p_txt_align + "; back_color : " + p_back_color, "S");
        // 2d duty
        var text_canvas = document.createElement("canvas");
        var context = text_canvas.getContext("2d");
        context.fillStyle = "#000000";
        var metrics = context.measureText(p_text);
        var textWidth = metrics.width;
        var [width, height] = get_visible_text_dim(p_text, p_textHeight);

        text_canvas.width = width;
        text_canvas.height = height;

        context.font = "normal " + p_textHeight + "px Arial";
        context.textAlign = p_txt_align;
        context.textBaseline = "middle";
        if (p_back_color !== "") {
            context.fillStyle = p_back_color;
            context.fillRect(0, 0, text_canvas.width, text_canvas.height);
        }
        context.fillStyle = p_font_color;
        context.fillText(p_text, width / 2, height / 2);

        let tex = new THREE.CanvasTexture(text_canvas);
        tex.minFilter = THREE.LinearFilter;
        var material = new THREE.SpriteMaterial({
            map: tex,
        });
        material.map.minFilter = THREE.LinearFilter;
        var sprite = new THREE.Sprite(material);
        sprite.scale.set((width / height) * p_actualFontSize, p_actualFontSize, 1);
        logDebug("function : addlabelText", "E");
        sprite.uuid = p_text;
        return sprite;
    } catch (err) {
        error_handling(err);
    }
}

async function clearThree(obj) {
    while (obj.children.length > 0) {
        clearThree(obj.children[0]);
        obj.remove(obj.children[0]);
    }
    if (obj.geometry) obj.geometry.dispose();

    if (obj.material) {
        //in case of map, bumpMap, normalMap, envMap ...
        Object.keys(obj.material).forEach((prop) => {
            if (!obj.material[prop]) return;
            if (obj.material[prop] !== null && typeof obj.material[prop].dispose === "function") obj.material[prop].dispose();
        });
        obj.material.dispose();
    }
    if (obj.texture) obj.texture.dispose();
    if (obj.map) obj.map.dispose();
}

function show_labels(p_show_label_ind, p_notch_label, p_notchHead, p_pog_index) {
    try {
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var div_mod_index = -1,
            div_shelf_index = -1,
            div_item_index = -1;
        var details = {};
        var is_driver = "N";
        var i = 0;
        try {
            if (p_show_label_ind == "Y" || p_notch_label == "Y") {
                for (const modules of module_details) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var l_shelf_details = modules.ShelfInfo;
                        var j = 0;
                        for (const shelfs of l_shelf_details) {
                            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "TEXTBOX" && ((p_notch_label == "Y" && shelfs.ObjType !== "DIVIDER") || p_show_label_ind == "Y")) {
                                if (shelfs.ObjType == "DIVIDER") {
                                    var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                    $.each(new_shelf_detail, function (k, shelfs_detail) {
                                        if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                            $.each(shelfs_detail.ItemInfo, function (l, items) {
                                                if (items.Item == "DIVIDER") {
                                                    if (shelfs.ShelfDivObjID == items.ObjID) {
                                                        div_mod_index = i;
                                                        div_shelf_index = k;
                                                        div_item_index = l;
                                                    }
                                                }
                                            });
                                        }
                                    });
                                    var shelf_obj = g_world.getObjectById(shelfs.ShelfDivObjID);
                                } else {
                                    var shelf_obj = g_world.getObjectById(shelfs.SObjID);
                                }
                                var notch_no = 0;
                                if (typeof shelf_obj !== "undefined") {
                                    if (typeof shelfs.LObjID !== "undefined" && shelfs.LObjID !== -1 && p_show_label_ind == "Y") {
                                        var label_obj = shelf_obj.getObjectById(shelfs.LObjID);
                                        shelf_obj.remove(label_obj);
                                    } else if (p_notch_label == "Y" && typeof shelfs.NotchLabelObjID !== "undefined" && shelfs.NotchLabelObjID !== -1) {
                                        var label_obj = shelf_obj.getObjectById(shelfs.NotchLabelObjID);
                                        shelf_obj.remove(label_obj);
                                        var cap_count = 100;

                                        for (k = 0; k < cap_count; k++) {
                                            if (shelfs.Y + shelfs.H / 2 <= g_pog_json[p_pog_index].BaseH + modules.NotchStart) {
                                                notch_no = 0;
                                                break;
                                            } else if (shelfs.Y + shelfs.H / 2 <= g_pog_json[p_pog_index].BaseH + modules.NotchStart + modules.NotchSpacing * k) {
                                                //ASA-1254- modules.NotchSpacing / 2
                                                notch_no = k;
                                                break;
                                            }
                                        }
                                    }
                                    var hex_color = shelfs.Color;
                                    if (hexToRgb(hex_color) == null) {
                                        var red = parseInt("FF", 16);
                                        var green = parseInt("FF", 16);
                                        var blue = parseInt("FF", 16);
                                    } else {
                                        var red = hexToRgb(hex_color).r;
                                        var green = hexToRgb(hex_color).r;
                                        var blue = hexToRgb(hex_color).g;
                                    }

                                    var text_color = getTextColor(red, green, blue); //ASA-1095
                                    if (p_notch_label == "Y" && shelfs.ObjType !== "DIVIDER") {
                                        var return_obj = addlabelText(p_notchHead + " " + notch_no, g_labelFont, g_labelActualSize, text_color, "center", "");
                                    } else {
                                        var return_obj = addlabelText(shelfs.Shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
                                    }
                                    if (typeof return_obj !== "undefined") {
                                        shelf_obj.add(return_obj);

                                        return_obj.position.y = -0.005;
                                        if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                            return_obj.position.z = shelfs.D / 2 + 0.005;
                                        } else {
                                            return_obj.position.z = 0.005;
                                        }
                                        if (shelfs.ObjType == "DIVIDER") {
                                            return_obj.position.x = 0;
                                            g_pog_json[p_pog_index].ModuleInfo[div_mod_index].ShelfInfo[div_shelf_index].ItemInfo[div_item_index].LObjID = return_obj.id;
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].LObjID = return_obj.id;
                                        } else {
                                            if (p_notch_label == "Y") {
                                                return_obj.position.x = 0 - (shelfs.W / 4 + 0.01);
                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].NotchLabelObjID = return_obj.id;
                                            } else {
                                                return_obj.position.x = 0 - (shelfs.W / 2.4 + 0.01);
                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].LObjID = return_obj.id;
                                            }
                                        }
                                    }
                                }
                            }
                            j = j + 1;
                        }
                    }
                    i = i + 1;
                }
            } else {
                for (const modules of module_details) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var l_shelf_details = modules.ShelfInfo;
                        var j = 0;
                        for (const shelfs of l_shelf_details) {
                            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && ((p_notch_label == "Y" && shelfs.ObjType !== "DIVIDER") || p_show_label_ind == "Y")) {
                                if (shelfs.ObjType == "DIVIDER") {
                                    var shelf_obj = g_world.getObjectById(shelfs.ShelfDivObjID);
                                } else {
                                    var shelf_obj = g_world.getObjectById(shelfs.SObjID);
                                }
                                if (typeof shelfs.LObjID !== "undefined" && shelfs.LObjID !== -1 && p_show_label_ind == "Y") {
                                    var label_obj = shelf_obj.getObjectById(shelfs.LObjID);
                                    shelf_obj.remove(label_obj);
                                } else if (p_notch_label == "Y" && typeof shelfs.NotchLabelObjID !== "undefined" && shelfs.NotchLabelObjID !== -1) {
                                    var label_obj = shelf_obj.getObjectById(shelfs.NotchLabelObjID);
                                    shelf_obj.remove(label_obj);
                                }
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].LObjID = -1;
                            }
                            j = j + 1;
                        }
                    }
                    i = i + 1;
                }
            }
        } catch (err) {
            error_handling(err);
        }
    } catch (err) {
        error_handling(err);
    }
}


function addItemDescription(p_text, p_textHeight, p_actualFontSize, p_font_color, p_txt_align, p_back_color, p_obj_width, p_obj_height, p_wrap_text, p_VertText, p_item, p_item_vertical_text_display, p_item_text_center_align, p_items_BHoriz) {
    try {
        logDebug(
            "function : addItemDescription; text : " + p_text + "; textHeight : " + p_textHeight +
            "; actualFontSize : " + p_actualFontSize + "; font_color : " + p_font_color +
            "; txt_align : " + p_txt_align + "; back_color : " + p_back_color +
            "; obj_width : " + p_obj_width + "; obj_height : " + p_obj_height +
            "; wrap_text : " + p_wrap_text + "; item_vertical_text_display : " + p_item_vertical_text_display +
            "; item_text_center_align : " + p_item_text_center_align, "S"
        );
        p_text = p_text.replace(/\ - $/, "");
        // Common CSS metrics
        var ruler = document.createElement("DIV");
        ruler.style.fontFamily = "Arial";
        ruler.style.fontWeight = "normal";
        ruler.style.fontSize = p_textHeight + "pt";
        ruler.style.position = "absolute";
        ruler.style.top = "-500px";
        ruler.style.left = "0";
        ruler.innerHTML = p_text;
        document.body.appendChild(ruler);
        let cssSize = { width: ruler.offsetWidth, height: ruler.offsetHeight };
        let cssInfo = window.getComputedStyle(ruler, null);
        let fontSizePx = parseFloat(cssInfo["fontSize"]);
        document.body.removeChild(ruler);

        var metricsCanvas = document.createElement("canvas");
        var metricsContext = metricsCanvas.getContext("2d");
        var metrics = metricsContext.measureText(p_text);
        let lineGap = cssSize.height - (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent || 0);
        let advMetrics = {
            width: metrics.width,
            cssHeight: cssSize.height,
            cssFontSizePx: fontSizePx,
            fontAscent: metrics.fontBoundingBoxAscent || 0,
            fontDescent: metrics.fontBoundingBoxDescent || 0,
            actualAscent: metrics.actualBoundingBoxAscent || 0,
            actualDescent: metrics.actualBoundingBoxDescent || 0,
            lineHeight: cssSize.height,
            lineGap: lineGap
        };

        //ASA-1847 4.1 Start Applied for Item text should be vertical Align
        if (p_item_vertical_text_display === "Y") {
            var org_width = p_obj_width;
            var org_height = p_obj_height;
            var [canvasWidth, canvasHeight] = get_visible_size(0.012, org_width * 10, org_height * 10, g_canvas, g_camera);
            var text_canvas = document.createElement('canvas');
            var context = text_canvas.getContext('2d');
            text_canvas.width = canvasWidth;
            text_canvas.height = canvasHeight;

            context.textAlign = "left";
            context.textBaseline = "top";
            if (p_back_color) {
                context.fillStyle = p_back_color;
                context.fillRect(0, 0, canvasWidth, canvasHeight);
            }
            context.fillStyle = p_font_color || "#000";
            // ASA-1847.4 Issue 1 Logic change  
            let fontPx = p_textHeight;
            const maxColumns = 2;
            const minFont = 12;
            const chars = p_text.split("");

            //Fit in one column first
            let fitsInOneColumn = false;
            while (fontPx > minFont) {
                context.font = `${fontPx}px Arial`;
                const charsPerCol = Math.floor(canvasHeight / (fontPx * 1.2));
                if (chars.length <= charsPerCol) {
                    fitsInOneColumn = true;
                    break;
                }
                fontPx--;
            }

            let columnsNeeded = 1;
            if (!fitsInOneColumn) {
                // Use two columns if needed 
                columnsNeeded = 2;
                while (fontPx > minFont) {
                    context.font = `${fontPx}px Arial`;
                    const charsPerCol = Math.floor(canvasHeight / (fontPx * 1.2));
                    const totalFit = charsPerCol * columnsNeeded;
                    if (chars.length <= totalFit) break;
                    fontPx--;
                }
            }
            p_textHeight = fontPx;
            let lineHeight = fontPx * 1;
            context.font = `${p_textHeight}px Arial`;

            const charsPerCol = Math.floor(canvasHeight / lineHeight);
            const charWidth = Math.max(...chars.map(c => context.measureText(c).width));
            const totalColumnsWidth = columnsNeeded * charWidth + (columnsNeeded - 1) * (fontPx * 0.4);
            let startX = (p_item_text_center_align === "Y") ? (canvasWidth - totalColumnsWidth) / 2 : 0;
            const totalTextHeight = Math.min(charsPerCol, chars.length) * lineHeight;
            const startY = (p_item_text_center_align === "Y") ? (canvasHeight - totalTextHeight) / 2 : 0;

            if (p_items_BHoriz % 2 === 0 && fitsInOneColumn) { startX += charWidth; } //ASA-1971.1

            let currentCol = 0;
            let currentRow = 0;
            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                const charW = context.measureText(char).width;
                const colX = startX + currentCol * (charWidth + fontPx * 0.4) + (charWidth - charW) / 2;
                const y = startY + currentRow * lineHeight;
                context.fillText(char, colX, y);
                currentRow++;
                if (currentRow >= charsPerCol) {
                    currentRow = 0;
                    currentCol++;
                    if (currentCol >= columnsNeeded) break;
                }
            }
            var tex = new THREE.CanvasTexture(text_canvas);
            tex.minFilter = THREE.LinearFilter;
            tex.matrixAutoUpdate = true;
            tex.needsUpdate = true;
            tex.isCanvasTexture = true;
            var geometry = new THREE.PlaneGeometry(org_width, org_height);
            var material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: tex,
                transparent: true,
                opacity: 1.0,
            });
            var sprite = new THREE.Mesh(geometry, material);
            sprite.uuid = "ITEM_DESC";
            return sprite;
        }
        // VERTICAL TEXT LOGIC END
        else {
            // Existing horizontal text logic
            var height_check = p_VertText;
            var diff = ((p_obj_width - p_obj_height) / ((p_obj_width + p_obj_height) / 2)) * 100;
            if (diff < 0) diff = -diff;

            if (height_check > 0) {
                if (diff > height_check && p_obj_height > p_obj_width) {
                    var org_width = p_obj_height;
                    var org_height = p_obj_width;
                    var new_width = p_obj_height * 10;
                    var new_height = p_obj_width * 10;
                } else {
                    var org_width = p_obj_width;
                    var org_height = p_obj_height;
                    var new_width = p_obj_width * 10;
                    var new_height = p_obj_height * 10;
                }
            } else {
                var org_width = p_obj_width < p_obj_height ? p_obj_height : p_obj_width;
                var org_height = p_obj_width < p_obj_height ? p_obj_width : p_obj_height;
                var new_width = org_width * 10;
                var new_height = org_height * 10;
            }

            var text_width = cssSize.width + 5;
            var text_height = parseInt(p_textHeight);
            var [canvasWidth, canvasHeight] = get_visible_size(0.012, new_width, new_height, g_canvas, g_camera);
            var [width, height] = get_visible_text_dim(p_text, p_textHeight);
            var text_canvas = document.createElement("canvas");
            var context = text_canvas.getContext("2d");
            text_canvas.width = canvasWidth;
            text_canvas.height = canvasHeight;
            context.textAlign = p_txt_align;
            context.textBaseline = "top";
            if (p_back_color !== "") {
                context.fillStyle = p_back_color;
                context.fillRect(0, 0, text_canvas.width, text_canvas.height);
            }

            context.fillStyle = p_font_color;
            var lineHeight = advMetrics.lineHeight - advMetrics.lineGap;
            fitText(context, p_text, canvasWidth / 2, 0, canvasWidth, canvasHeight, p_textHeight, lineHeight);

            let tex = new THREE.CanvasTexture(text_canvas);
            tex.minFilter = THREE.LinearFilter;
            tex.matrixAutoUpdate = true;
            tex.needsUpdate = true;
            tex.isCanvasTexture = true;

            var geometry = new THREE.PlaneGeometry(org_width, org_height);
            var material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                map: tex,
                transparent: true,
                opacity: 1.0,
            });

            material.map.minFilter = THREE.LinearFilter;
            var sprite = new THREE.Mesh(geometry, material);
            if (diff > height_check && p_obj_height > p_obj_width) {
                sprite.rotateOnAxis(new THREE.Vector3(0, 0, 1), (90 * Math.PI) / 180);
            }
            sprite.uuid = "ITEM_DESC";
            logDebug("function : addItemDescription", "E");
            return sprite;
        }
    } catch (err) {
        error_handling(err);
    }
}

function fitText(p_context, p_text, p_x, p_y, p_width, p_height, p_fontSize, p_lineHeight) {
    try {
        logDebug("function : fitText; text : " + p_text + "; x : " + p_x + "; y : " + p_y + "; width : " + p_width + "; height : " + p_height + "; fontSize : " + p_fontSize + "; lineHeight : " + p_lineHeight, "S");
        if (typeof p_x !== "undefined" && typeof p_y !== "undefined" && typeof p_width !== "undefined" && typeof p_height !== "undefined" && !isNaN(p_width) && !isNaN(p_height)) {
            p_context.font = "normal " + p_fontSize + "px Arial";
            var metrics = p_context.measureText(p_text);

            if (metrics.width <= p_width && g_lines.length == 0) {
                var gap = p_width - metrics.width;
                var new_x = p_x - gap / 2 + 2;
                p_context.fillText(p_text, new_x, p_height / 2 - p_fontSize / 4); //y + fontSize / 4);
                return;
            }

            // Wrap text
            var words = p_text.split(" "),
                line = "";
            g_lines = [];

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                metrics = p_context.measureText(testLine);
                if (metrics.width > p_width && n > 0) {
                    g_lines.push(line);
                    line = words[n] + " "; // next line
                } else {
                    line = testLine;
                }
            }
            metrics = p_context.measureText(line);
            if (metrics.width <= p_width) {
                g_lines.push(line);
            } else {
                return fitText(p_context, p_text, p_x, p_y, p_width, p_height, p_fontSize - 1, p_lineHeight);
            }

            if (g_lines.length > 3) {
                return fitText(p_context, p_text, p_x, p_y, p_width, p_height, p_fontSize - 1, p_lineHeight);
            }

            var line_y = p_y + p_fontSize / 4;
            for (var i = 0; i < g_lines.length; i++) {
                var metrics = p_context.measureText(g_lines[i]);
                var gap = p_width - metrics.width;
                var new_x = p_x - gap / 2 + 2;
                p_context.fillText(g_lines[i], new_x, line_y);
                line_y += p_fontSize * 1.1;
            }
        }

        logDebug("function : fitText", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function showHideItemDescription(p_show_item_desc, p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_index) {
    try {
        logDebug("function : showHideItemDescription; g_show_item_desc : " + p_show_item_desc, "S");

        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var camera_z_pos = g_camera.position.z;
        var back_color = p_pogcrItemBackLabelColor;
        var desc_list_arr = p_pogcrDescListArr.split(",");
        var colorValue = parseInt(back_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        if (p_show_item_desc == "N") {
            var i = 0;
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            if (shelfs.ItemInfo.length > 0) {
                                var item_Details = shelfs.ItemInfo;
                                var k = 0;
                                for (const items of item_Details) {
                                    if (items.Item !== "DIVIDER" && items.Desc !== "" && typeof items.Desc !== "undefined") {
                                        var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                        if (typeof items.DescID !== "undefined" && items.DescID !== -1 && typeof item_obj !== "undefined") {
                                            var label_obj = item_obj.getObjectById(items.DescID);
                                            item_obj.remove(label_obj);
                                        }
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DescID = -1;
                                    }
                                    k = k + 1;
                                }
                            }
                        }
                        j = j + 1;
                    }
                    var k = 0;
                    if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
                        for (const items of carparkInfo[0].ItemInfo) {
                            if (items.Item !== "DIVIDER" && items.Desc !== "" && typeof items.Desc !== "undefined") {
                                var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                if (typeof items.DescID !== "undefined" && items.DescID !== -1) {
                                    var label_obj = item_obj.getObjectById(items.DescID);
                                    item_obj.remove(label_obj);
                                }
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[k].DescID = -1;
                            }
                            k = k + 1;
                        }
                    }
                }
                i = i + 1;
            }
        } else {
            g_camera.position.z = 7;
            var i = 0;
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            if (shelfs.ItemInfo.length > 0) {
                                var item_Details = shelfs.ItemInfo;
                                var k = 0;
                                for (const items of item_Details) {
                                    if (items.Item !== "DIVIDER" && items.Desc !== "" && typeof items.Desc !== "undefined") {
                                        var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                        var hex_color = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Color;
                                        if (hexToRgb(hex_color) == null) {
                                            var red = parseInt("FF", 16);
                                            var green = parseInt("FF", 16);
                                            var blue = parseInt("FF", 16);
                                        } else {
                                            var red = hexToRgb(hex_color).r;
                                            var green = hexToRgb(hex_color).r;
                                            var blue = hexToRgb(hex_color).g;
                                        }

                                        var text_color;
                                        text_color = "#000000";

                                        var textToDisplay = "";
                                        if (g_temp_desc == "N") {
                                            for (q = 0; q < desc_list_arr.length; q++) {
                                                if (desc_list_arr[q] == "ITEM") {
                                                    textToDisplay = textToDisplay + items.ItemID + " - ";
                                                } else if (desc_list_arr[q] == "DESCRIPTION") {
                                                    textToDisplay = textToDisplay + items.Desc + " - ";
                                                }
                                            }
                                        } else {
                                            var desc_list = g_temp_desc.split("");
                                            var l = 0;
                                            var SalesInfo = get_sales_info(p_pog_index, items.ItemID);
                                            for (const lst of desc_list) {
                                                if (lst == "I") {
                                                    textToDisplay = textToDisplay + items.ItemID + " - ";
                                                }
                                                if (lst == "D") {
                                                    textToDisplay = textToDisplay + items.Desc + " " + items.DescSecond + " - ";
                                                }
                                                if (lst == "V") {
                                                    textToDisplay = textToDisplay + " SV: " + SalesInfo.SalesPerWeek + " ";
                                                }
                                                if (lst == "U") {
                                                    textToDisplay = textToDisplay + "SU " + SalesInfo.SalesUnitPerWeek + " ";
                                                }
                                                if (lst == "R") {
                                                    //ASA-1289
                                                    textToDisplay = textToDisplay + " VRM$: " + SalesInfo.VRM + " ";
                                                }

                                                if (lst == "C") {
                                                    var det_arr = items.SizeDesc.split("*");
                                                    details = (items.BHoriz * items.BVert * items.BaseD) / parseInt(det_arr[1]); //ASA-1247

                                                    if (isNaN(details) || !isFinite(details)) {
                                                        temp_text = "C: " + 0;
                                                    } else {
                                                        temp_text = "C: " + details.toFixed(1);
                                                    }
                                                    textToDisplay = textToDisplay + temp_text + " ";
                                                }
                                                if (lst == "O") {
                                                    details = (items.BHoriz * items.BVert * items.BaseD) / (SalesInfo.SalesUnitPerWeek / 7);
                                                    if (isNaN(details) || !isFinite(details)) {
                                                        temp_text = "D: " + 0;
                                                    } else {
                                                        temp_text = "D: " + details.toFixed(1);
                                                    }
                                                    textToDisplay = textToDisplay + temp_text + " ";
                                                }
                                                if (lst == "P") {
                                                    textToDisplay = textToDisplay + "VRM%: " + SalesInfo.VRMPer + " ";
                                                }
                                                if (lst == "F") {
                                                    textToDisplay = textToDisplay + " " + items.BHoriz + " - ";
                                                }
                                                if (lst == "E") {
                                                    textToDisplay = textToDisplay + items.Brand + " " + items.Desc + " " + items.SizeDesc + " - ";
                                                }
                                                if (l > 0) {
                                                    textToDisplay = textToDisplay + "\n";
                                                }
                                                l++;
                                            }
                                        }

                                        if (typeof items.DescID !== "undefined" && items.DescID !== -1) {
                                            var label_obj = item_obj.getObjectById(items.DescID);
                                            item_obj.remove(label_obj);
                                        }
                                        if (typeof item_obj !== "undefined") {
                                            var return_obj = addItemDescription(textToDisplay, 70, g_labelActualSize, text_color, "center", "", items.W, items.H, "Y", g_vert_text_dis, items.ItemID, g_item_vertical_text_display, g_item_text_center_align, items.BHoriz); //ASA-1847 4.1
                                            item_obj.add(return_obj);
                                            return_obj.position.x = 0;
                                            return_obj.position.y = 0;

                                            if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                                //ASA-1292 added beaccuse if the shelf has slope item look like 3d view in shelf so description z has been not more
                                                return_obj.position.z = items.D / 2 + 0.0005;
                                            } else {
                                                return_obj.position.z = 0.0006;
                                            }

                                            item_obj.WireframeObj.material.color.setHex(0x000000);
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DescID = return_obj.id;
                                        }
                                    }
                                    k = k + 1;
                                }
                            }
                        }
                        j = j + 1;
                    }
                    var k = 0;
                    if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
                        for (const items of carparkInfo[0].ItemInfo) {
                            if (items.Item !== "DIVIDER" && items.Desc !== "" && typeof items.Desc !== "undefined") {
                                var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                var hex_color = g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].Color;
                                if (hexToRgb(hex_color) == null) {
                                    var red = parseInt("FF", 16);
                                    var green = parseInt("FF", 16);
                                    var blue = parseInt("FF", 16);
                                } else {
                                    var red = hexToRgb(hex_color).r;
                                    var green = hexToRgb(hex_color).r;
                                    var blue = hexToRgb(hex_color).g;
                                }

                                var text_color;
                                text_color = "#000000";

                                var textToDisplay = "";

                                textToDisplay = items.ItemID + "- " + items.Desc;
                                var return_obj = addItemDescription(textToDisplay, 70, g_labelActualSize, text_color, "center", "", items.W, items.H, "Y", g_vert_text_dis, items.ItemID, g_item_vertical_text_display, g_item_text_center_align, items.BHoriz); //ASA-1847 4.1
                                item_obj.add(return_obj);
                                return_obj.position.x = 0;

                                return_obj.position.y = 0;
                                return_obj.position.z = 0.001;
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[k].DescID = return_obj.id;
                            }
                            k = k + 1;
                        }
                    }
                }
                i = i + 1;
            }
            g_camera.position.z = camera_z_pos;
        }
        render(p_pog_index);
        logDebug("function : showHideItemDescription", "E");
    } catch (err) {
        error_handling(err);
    }
}

function show_single_item_desc(p_module_index, p_shelf_index, p_item_index, p_items, p_item_obj, p_camera, p_backColor, p_pogcrDisplayItemInfo, p_pog_index) {

    if (p_items.Item !== "DIVIDER" && p_items.Desc !== "" && typeof p_items.Desc !== "undefined" && g_show_desc_no_image == "Y") {
        var camera_z_pos = p_camera.position.z;
        p_camera.position.z = 7;
        var hex_color = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Color;
        if (hexToRgb(hex_color) == null) {
            var red = parseInt("FF", 16);
            var green = parseInt("FF", 16);
            var blue = parseInt("FF", 16);
        } else {
            var red = hexToRgb(hex_color).r;
            var green = hexToRgb(hex_color).r;
            var blue = hexToRgb(hex_color).g;
        }

        var text_color;
        text_color = "#000000";

        var back_color = p_backColor;
        var colorValue = parseInt(back_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        var desc_list_arr = p_pogcrDisplayItemInfo.split(",");
        var textToDisplay = "";
        if (g_temp_desc == "N") {
            for (q = 0; q < desc_list_arr.length; q++) {
                if (desc_list_arr[q] == "ITEM") {
                    textToDisplay = textToDisplay + p_items.ItemID + " - ";
                } else if (desc_list_arr[q] == "DESCRIPTION") {
                    textToDisplay = textToDisplay + p_items.Desc + " - ";
                }
            }
        } else {
            var desc_list = g_temp_desc.split("");
            var l = 0;
            var SalesInfo = get_sales_info(p_pog_index, p_items.ItemID);
            for (const lst of desc_list) {
                if (lst == "I") {
                    textToDisplay = textToDisplay + p_items.ItemID + " - ";
                }
                if (lst == "D") {
                    textToDisplay = textToDisplay + p_items.Desc + " " + p_items.DescSecond + " - ";
                }
                if (lst == "V") {
                    textToDisplay = textToDisplay + " SV: " + SalesInfo.SalesPerWeek + " ";
                }
                if (lst == "U") {
                    textToDisplay = textToDisplay + "SU " + SalesInfo.SalesUnitPerWeek + " ";
                }
                if (lst == "R") {
                    textToDisplay = textToDisplay + " VRM$: " + SalesInfo.VRM + " ";
                }

                if (lst == "C") {
                    var det_arr = p_items.SizeDesc.split("*");
                    details = (p_items.BHoriz * p_items.BVert * p_items.BaseD) / parseInt(det_arr[1]); //ASA-1247

                    if (isNaN(details) || !isFinite(details)) {
                        temp_text = "C: " + 0;
                    } else {
                        temp_text = "C: " + details.toFixed(1);
                    }
                    textToDisplay = textToDisplay + temp_text + " ";
                }
                if (lst == "O") {
                    details = (p_items.BHoriz * p_items.BVert * p_items.BaseD) / (SalesInfo.SalesUnitPerWeek / 7);
                    if (isNaN(details) || !isFinite(details)) {
                        temp_text = "D: " + 0;
                    } else {
                        temp_text = "D: " + details.toFixed(1);
                    }
                    textToDisplay = textToDisplay + temp_text + " ";
                }
                if (lst == "P") {
                    textToDisplay = textToDisplay + "VRM%: " + SalesInfo.VRMPer + " ";
                }
                if (lst == "F") {
                    textToDisplay = textToDisplay + " " + p_items.BHoriz + " - ";
                }
                if (lst == "E") {
                    textToDisplay = textToDisplay + p_items.Brand + " " + p_items.Desc + " " + p_items.SizeDesc + " - ";
                }
                if (l > 0) {
                    textToDisplay = textToDisplay + "\n";
                }
                l++;
            }
        }
        if (typeof p_items.DescID !== "undefined" && p_items.DescID !== -1) {
            var label_obj = p_item_obj.getObjectById(p_items.DescID);
            p_item_obj.remove(label_obj);
        }
        var return_obj = addItemDescription(textToDisplay, 70, g_labelActualSize, text_color, "center", "", p_items.W, p_items.H, "Y", g_vert_text_dis, p_items.ItemID, g_item_vertical_text_display, g_item_text_center_align, p_items.BHoriz); //ASA-1847 4.1
        p_item_obj.add(return_obj);
        return_obj.position.x = 0;
        return_obj.position.y = 0;
        // return_obj.position.z = 0.001; //ASA-1729 Issue 7
        return_obj.position.z = 0.0006; //ASA-1839 0.0008; //ASA-1729 Issue 7
        p_item_obj.WireframeObj.material.color.setHex(0x000000);
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].DescID = return_obj.id;
        p_camera.position.z = camera_z_pos;
    }
}

async function showHideDaysOfSupplyLabel(p_show_label_ind, p_updatePogItemColl = "N", p_pog_index, p_updateItemScene = "Y", p_UpdateItemInfo = "N", p_DaysofsuppFontSize, p_ItemDtlList) {
    try {
        logDebug("function : showHideDaysOfSupplyLabel; show_label_ind : " + p_show_label_ind, "S");
        if (g_pog_json.length > 0) {
            var module_details = g_pog_json[p_pog_index].ModuleInfo;
            var old_camera_z = g_scene_objects[p_pog_index].scene.children[0].position.z;
            if (p_show_label_ind == "N") {
                var i = 0;
                for (const modules of module_details) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var l_shelf_details = modules.ShelfInfo;
                        var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
                        var j = 0;
                        for (const shelfs of l_shelf_details) {
                            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                                if (shelfs.ItemInfo.length > 0) {
                                    var item_Details = shelfs.ItemInfo;
                                    var k = 0;
                                    for (const items_info of item_Details) {
                                        if (items_info.Item !== "DIVIDER" && items_info.DaysOfSupply !== "" && typeof items_info.DaysOfSupply !== "undefined") {
                                            console.log("beforeupdatedos func", g_show_days_of_supply);
                                            var item1 = await updateDaysOfSupply(items_info, k, j, i, "N", p_updatePogItemColl, p_pog_index, p_UpdateItemInfo);
                                            var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items_info.ObjID);
                                            if (typeof items_info.daysOfSupplyID !== "undefined" && items_info.daysOfSupplyID !== -1) {
                                                var label_obj = item_obj.getObjectById(items_info.daysOfSupplyID);
                                                item_obj.remove(label_obj);
                                            }
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].daysOfSupplyID = -1;
                                        }
                                        k = k + 1;
                                    }
                                }
                            }
                            j = j + 1;
                        }
                        var k = 0;
                        if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
                            for (const items_info of carparkInfo[0].ItemInfo) {
                                if (items_info.Item !== "DIVIDER" && items_info.DaysOfSupply !== "" && typeof items_info.DaysOfSupply !== "undefined") {
                                    var item1 = await updateDaysOfSupply(items_info, k, j, i, "Y", p_updatePogItemColl, p_pog_index);
                                    var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items_info.ObjID);
                                    if (typeof items_info.daysOfSupplyID !== "undefined" && items_info.daysOfSupplyID !== -1) {
                                        var label_obj = item_obj.getObjectById(items_info.daysOfSupplyID);
                                        item_obj.remove(label_obj);
                                    }
                                    g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[k].daysOfSupplyID = -1;
                                }
                                k = k + 1;
                            }
                        }
                    }
                    i = i + 1;
                }
            } else {
                var item_lbl_dtl = p_ItemDtlList.split(","); //ASA-1608 Issue 1
                var i = 0;
                g_scene_objects[p_pog_index].scene.children[0].position.z = 6;
                for (const modules of module_details) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var l_shelf_details = modules.ShelfInfo;
                        var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
                        var j = 0;
                        for (const shelfs of l_shelf_details) {
                            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                                if (shelfs.ItemInfo.length > 0) {
                                    var item_Details = shelfs.ItemInfo;
                                    var k = 0;
                                    for (const items_info of item_Details) {
                                        var item1 = await updateDaysOfSupply(items_info, k, j, i, "N", p_updatePogItemColl, p_pog_index, p_UpdateItemInfo);
                                        if (typeof item1 !== "undefined" && p_updateItemScene == "Y") {
                                            if (item1.Item !== "DIVIDER" && item1.DaysOfSupply !== "" && typeof item1.DaysOfSupply !== "undefined") {
                                                var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item1.ObjID);
                                                if (typeof item_obj !== "undefined") {
                                                    var text_color = "#000000";
                                                    var textToDisplay = "";
                                                    if (nvl(item_obj) !== 0) {
                                                        var l = 0;
                                                        for (const obj of item_lbl_dtl) {
                                                            var temp_text = "";
                                                            var l_dos = obj.split(":"); //ASA-1427 -S
                                                            var SalesInfo = get_sales_info(p_pog_index, items_info.ItemID);
                                                            if (l_dos[0] == "COS") {
                                                                var det_arr = items_info.SizeDesc.split("*");
                                                                var cap_capacity = items_info.CapFacing * items_info.CapDepth * items_info.CapHorz * parseInt(items_info.CapMerch == 1 ? items_info.UnitperTray : 1); //ASA-1605
                                                                //var cap_capacity = items_info.CapFacing * items_info.CapDepth * items_info.CapHorz; //ASA-1341 Issue-2 added Cap_capacity in COS Calculation. //ASA-1605
                                                                details = (items_info.BHoriz * items_info.BVert * items_info.BaseD * parseInt(items_info.MerchStyle == 1 ? items_info.UnitperTray : items_info.MerchStyle == 2 ? items_info.UnitperCase : 1) + cap_capacity) / parseInt(det_arr[1]); //ASA-1605 //ASA-1871 adding condition for case
                                                                //details = ((items_info.BHoriz * items_info.BVert * items_info.BaseD) + cap_capacity) / parseInt(det_arr[1]); //ASA-1247 //ASA-1605

                                                                if (isNaN(details) || !isFinite(details)) {
                                                                    temp_text = l_dos[1] + ": " + 0;
                                                                } else {
                                                                    temp_text = l_dos[1] + ": " + details.toFixed(1);
                                                                }
                                                            }
                                                            if (l_dos[0] == "DOS") {
                                                                //temp_text = (items_info.BHoriz * items_info.BVert * items_info.BaseD * parseInt(items_info.MerchStyle == 1 ? items_info.UnitperTray : 1)) / (SalesInfo.SalesUnitPerWeek / 7);//ASA-1605
                                                                temp_text = parseFloat(item_obj.DaysOfSupply).toFixed(1);
                                                            } else if (l_dos[0] == "SALES") {
                                                                temp_text = l_dos[1] + ": " + SalesInfo.SalesPerWeek;
                                                            } else if (l_dos[0] == "UNIT") {
                                                                temp_text = l_dos[1] + ": " + SalesInfo.SalesUnitPerWeek;
                                                            } else if (l_dos[0] == "VRMS") {
                                                                temp_text = l_dos[1] + ": " + SalesInfo.VRMPer;
                                                            } else if (l_dos[0] == "DOS_CAL") {
                                                                details = (items_info.BHoriz * items_info.BVert * items_info.BaseD * parseInt(items_info.MerchStyle == 1 ? items_info.UnitperTray : items_info.MerchStyle == 2 ? items_info.UnitperCase : 1)) / (SalesInfo.SalesUnitPerWeek / 7); //ASA-1605 //ASA-1871 adding condition for case
                                                                // details = (items_info.BHoriz * items_info.BVert * items_info.BaseD) / (SalesInfo.SalesUnitPerWeek / 7); //ASA-1605
                                                                if (isNaN(details) || !isFinite(details)) {
                                                                    temp_text = l_dos[1] + ": " + 0;
                                                                } else {
                                                                    temp_text = l_dos[1] + ": " + details.toFixed(1);
                                                                }
                                                            } else if (l_dos[0] == "AVG_SALES_WK") {
                                                                //ASA-1360 task 1 Start
                                                                temp_text = l_dos[1] + ": " + SalesInfo.AvgSalesPerWeek;
                                                            } else if (l_dos[0] == "AVG_QTY_WK") {
                                                                temp_text = l_dos[1] + ": " + SalesInfo.AvgQtyPerWeek;
                                                            } else if (l_dos[0] == "SALES_PER") {
                                                                temp_text = l_dos[1] + "%: " + SalesInfo.SalesPartPer;
                                                            } else if (l_dos[0] == "QTY_PER") {
                                                                temp_text = l_dos[1] + "%: " + SalesInfo.QtyPartPer;
                                                            } else if (l_dos[0] == "NO_OF_LIST") {
                                                                temp_text = l_dos[1] + ": " + SalesInfo.NoOfListing;
                                                            } else if (l_dos[0] == "GP") {
                                                                temp_text = l_dos[1] + ": " + SalesInfo.GP;
                                                            } else if (l_dos[0] == "ASP") {
                                                                temp_text = l_dos[1] + ": " + SalesInfo.ASP;
                                                            } //ASA-1360 task 1 End , //ASA-1427 -E
                                                            //ASA-1427 S
                                                            else if (l_dos[0] == "EDLP") {
                                                                var l_edlp = typeof items_info.EDLP !== "undefined" && items_info.EDLP !== null ? items_info.EDLP : 0;
                                                                temp_text = l_dos[1] + ": " + l_edlp;
                                                            }
                                                            //ASA-1427 E
                                                            if (l == 0) {
                                                                textToDisplay = temp_text;
                                                            } else {
                                                                textToDisplay = textToDisplay + "\n" + temp_text;
                                                            }

                                                            l++;
                                                        }
                                                    }
                                                    textToDisplay.substring(1);
                                                    if (nvl(item1.daysOfSupplyID) !== 0 && item1.daysOfSupplyID !== -1) {
                                                        var label_obj = item_obj.getObjectById(item1.daysOfSupplyID);
                                                        item_obj.remove(label_obj);
                                                    }
                                                    //ASA-1427 Issue 1
                                                    // if (item_lbl_dtl.length > 1) {
                                                    var return_obj = addDaysOfSupply(textToDisplay, 20, g_labelActualSize, text_color, "center", "#ffffff", p_DaysofsuppFontSize, item1.W, item1.H);
                                                    // } else {
                                                    // var return_obj = addDaysOfSupplySingle(textToDisplay, 12, g_labelActualSize, text_color, "center", "#ffffff", p_DaysofsuppFontSize);
                                                    // }
                                                    item_obj.add(return_obj);
                                                    return_obj.uuid = "days_of_supply";
                                                    //ASA-1427 Issue 1
                                                    //  if (item_lbl_dtl.length > 1) {
                                                    new_x = item1.W / 2;
                                                    new_y = item1.H / 2;
                                                    return_obj.position.x = 0;
                                                    return_obj.position.y = 0;
                                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                                        //ASA-1289
                                                        return_obj.position.z = item1.D / 2 + 0.005;
                                                    } else {
                                                        // return_obj.position.z = 0.005; //ASA-1608 Issue 1
                                                        return_obj.position.z = 0.0006; //ASA-1839 0.0008; //ASA-1608 Issue 1
                                                    }
                                                    //ASA-1427 Issue 1 S
                                                    /*   } 
                                                    else {
                                                        return_obj.position.x = 0.0015625 * 12 - item1.W / 2;
                                                        return_obj.position.y = item1.H / 2 - 0.0015625 * 12;
                                                        if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) { //ASA-1289
                                                            return_obj.position.z = item1.D / 2 + 0.005;
                                                        } else {
                                                            return_obj.position.z = 0.005;
                                                        }
                                                    }*/ //ASA-1427 Issue 1 E

                                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].daysOfSupplyID = return_obj.id;
                                                }
                                            }
                                        }
                                        k = k + 1;
                                    }
                                }
                            }
                            j = j + 1;
                        }
                        var k = 0;
                        if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
                            for (const items_info of carparkInfo[0].ItemInfo) {
                                if (items_info.Item !== "DIVIDER" && items_info.DaysOfSupply !== "" && typeof items_info.DaysOfSupply !== "undefined") {
                                    var item_carpark = await updateDaysOfSupply(items_info, k, 0, i, "Y", p_updatePogItemColl, p_pog_index, p_UpdateItemInfo);
                                    if (p_updateItemScene == "Y") {
                                        var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items_info.ObjID);
                                        var text_color = "#000000";
                                        var textToDisplay = "";
                                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items_info.ObjID);
                                        if (nvl(selectedObject) !== 0) {
                                            textToDisplay = selectedObject.DaysOfSupply;
                                        }
                                        if (typeof items_info.daysOfSupplyID !== "undefined" && items_info.daysOfSupplyID !== -1) {
                                            var label_obj = item_obj.getObjectById(items_info.daysOfSupplyID);
                                            item_obj.remove(label_obj);
                                        }
                                        var return_obj = addDaysOfSupply(textToDisplay, 20, g_labelActualSize, text_color, "center", "#ffffff", p_DaysofsuppFontSize, items_info.W, items_info.H);
                                        item_obj.add(return_obj);
                                        return_obj.uuid = "days_of_supply";
                                        g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[k].daysOfSupplyID = return_obj.id;
                                    }
                                }
                                k = k + 1;
                            }
                        }
                    }
                    i = i + 1;
                }
                g_scene_objects[p_pog_index].scene.children[0].position.z = old_camera_z;
            }
        }
        render(p_pog_index);
        logDebug("function : showHideDaysOfSupplyLabel", "E");
    } catch (err) {
        error_handling(err);
    }
}


function addDaysOfSupplySingle(p_text, p_textHeight, p_actualFontSize, p_font_color, p_txt_align, p_back_color, p_DaysofsuppFontSize) {
    try {
        logDebug("function : addlabelText; text : " + p_text + "; textHeight : " + p_textHeight + "; actualFontSize : " + p_actualFontSize + "; font_color : " + p_font_color + "; txt_align : " + p_txt_align + "; back_color : " + p_back_color, "S");
        // 2d duty
        var text_canvas = document.createElement("canvas");
        var context = text_canvas.getContext("2d");
        context.fillStyle = "#000000";
        var metrics = context.measureText(p_text);
        var textWidth = metrics.width;
        if (p_DaysofsuppFontSize.split(",")[0] == "N") {
            var p_actualFontSize = p_DaysofsuppFontSize.split(",")[1];
        } else {
            p_actualFontSize = p_DaysofsuppFontSize.split(",")[1];
        }
        var [width, height] = get_visible_text_dim(p_text, p_textHeight);

        text_canvas.width = width;
        text_canvas.height = height;

        context.font = "normal " + p_textHeight + "px Arial";
        context.textAlign = p_txt_align;
        context.textBaseline = "middle";
        if (p_back_color !== "") {
            context.fillStyle = p_back_color; //"#000000";
            context.fillRect(0, 0, text_canvas.width, text_canvas.height);
        }
        context.fillStyle = p_font_color;
        context.fillText(p_text, width / 2, height / 2);

        //var texture = new THREE.Texture(text_canvas);
        let tex = new THREE.CanvasTexture(text_canvas);
        tex.minFilter = THREE.LinearFilter;
        var material = new THREE.SpriteMaterial({
            map: tex,
        });
        material.map.minFilter = THREE.LinearFilter;
        var sprite = new THREE.Sprite(material);
        sprite.scale.set((width / height) * p_actualFontSize, p_actualFontSize, 1);
        sprite.uuid = "days_of_supply";
        logDebug("function : addlabelText", "E");
        return sprite;
    } catch (err) {
        error_handling(err);
    }
}

function addDaysOfSupply(p_text, p_textHeight, p_actualFontSize, p_font_color, p_txt_align, p_back_color, p_DaysofsuppFontSize, p_width, p_height) {
    try {
        logDebug("function : addlabelText; text : " + p_text + "; textHeight : " + p_textHeight + "; actualFontSize : " + p_actualFontSize + "; font_color : " + p_font_color + "; txt_align : " + p_txt_align + "; back_color : " + p_back_color, "S");
        // 2d duty
        var lines = p_text.split("\n");
        var new_width = p_width * 10;
        var new_height = p_height * 10;
        // 2d duty
        p_textHeight = 70;
        var text_canvas = document.createElement("canvas");
        var context = text_canvas.getContext("2d");
        //var textHeight = 12;
        context.fillStyle = "#000000";
        var metrics = context.measureText(p_text);
        var textWidth = metrics.width;
        if (p_DaysofsuppFontSize.split(",")[0] == "N") {
            var p_actualFontSize = p_DaysofsuppFontSize.split(",")[1];
        } else {
            p_actualFontSize = p_DaysofsuppFontSize.split(",")[1];
        }

        //ASA-1427 Issue 1
        /*var len_text = p_text;
        if (lines.length > 1) {
            var len = 0;
            for (obj of lines) {
                if (obj.length > len) {
                    len_text = obj;
                    len = obj.length;
                }
            }
        }*/
        // if (lines.length > 1) {
        p_actualFontSize = (p_actualFontSize / 1.5) * lines.length;
        // }

        var [canvasWidth, canvasHeight] = get_visible_size(0.012, new_width, new_height, g_canvas, g_camera);
        //var [width, height] = get_visible_text_dim(p_text, p_textHeight);

        text_canvas.width = canvasWidth;
        text_canvas.height = canvasHeight;

        context.font = "bold " + p_textHeight + "px Arial";
        context.textAlign = p_txt_align;
        context.textBaseline = "middle";
        if (p_back_color !== "") {
            context.fillStyle = p_back_color; //"#000000";
            context.fillRect(0, 0, text_canvas.width, text_canvas.height);
        }
        context.fillStyle = p_font_color;
        //ASA-1427 Issue 1
        //  if (lines.length > 1) {
        var x = 0,
            y = 0;
        var line_y = y + p_textHeight / 2;
        for (var i = 0; i < lines.length; i++) {
            var metrics = context.measureText(lines[i]);
            var gap = p_width - metrics.width;
            var new_x = x - gap / 2 + 2;
            context.fillText(lines[i], new_x, line_y);
            line_y += p_textHeight * 1.11;
        }
        //    } else {
        //         context.fillText(p_text, p_width / 2, p_height / 2);
        //      }

        let tex = new THREE.CanvasTexture(text_canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.matrixAutoUpdate = true;
        tex.needsUpdate = true;
        tex.isCanvasTexture = true;
        var geometry = new THREE.PlaneGeometry(p_width, p_height);
        var material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: tex,
            transparent: true,
            opacity: 0.6,
        });

        material.map.minFilter = THREE.LinearFilter;
        var sprite = new THREE.Mesh(geometry, material);
        sprite.uuid = "days_of_supply";
        logDebug("function : addlabelText", "E");
        return sprite;
    } catch (err) {
        error_handling(err);
    }
}

async function showFixelAvailableSpace(p_resetYN, p_calcShelfSpace, p_pog_index) {
    try {
        logDebug("function : showFixelAvailableSpace; resetYN : " + p_resetYN + "; calcShelfSpace : " + p_calcShelfSpace, "S");
        p_calcShelfSpace = typeof p_calcShelfSpace == "undefined" ? "N" : p_calcShelfSpace;
        g_labelFont = 12; //ASA-1668
        var [currCombinationIndx, currShelfCombIndx] = [-1, -1]; //ASA-1668
        var originalCanvas = g_pog_index;
        if (p_calcShelfSpace == "N") {
            p_resetYN = typeof p_resetYN == "undefined" ? "Y" : p_resetYN;
            if (p_resetYN == "Y") {
                if (g_show_fixel_space == "N") {
                    g_show_fixel_space = "Y";
                    $(".fixel_space").addClass("item_label_active");
                } else {
                    g_show_fixel_space = "N";
                    $(".fixel_space").removeClass("item_label_active");
                }
            }
            var tempJson = [];
            if (typeof p_pog_index !== "undefined") {
                tempJson.push(g_pog_json[p_pog_index]);
            } else {
                tempJson = g_pog_json;
            }
            if (g_show_fixel_space == "Y") {
                if (g_all_pog_flag == "N") {
                    var i = p_pog_index;
                } else {
                    var i = 0;
                }
                for (const pogInfo of g_pog_json) {
                    if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1 || (i == g_ComViewIndex && g_compare_view == "PREV_VERSION")) {
                        g_scene = g_scene_objects[i].scene;
                        g_camera = g_scene_objects[i].scene.children[0];
                        var m = 0;
                        for (const modules_info of g_pog_json[i].ModuleInfo) {
                            //ASA-2023 task-2
                            if (!modules_info || !Array.isArray(modules_info.ShelfInfo)) {
                                continue;
                            }
                            //ASA-2023 task-2
                            var j = 0;
                            for (const shelfs of modules_info.ShelfInfo) {
                                var shelf_obj = g_scene_objects[i].scene.children[2].getObjectById(shelfs.SObjID); //ASA-1668
                                if (typeof shelf_obj !== "undefined" && (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR")) {
                                    [currCombinationIndx, currShelfCombIndx] = getCombinationShelf(i, shelfs.Shelf);
                                }
                                if (currCombinationIndx !== -1 && currShelfCombIndx !== -1) {
                                    calcCombineShelfAvlSpace(i, currCombinationIndx); //ASA-1668
                                } else {
                                    // var shelf_obj = g_scene_objects[i].scene.children[2].getObjectById(shelfs.SObjID);//ASA-1668
                                    if (typeof shelf_obj !== "undefined" && (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR" || shelfs.ObjType == "ROD")) {
                                        var itemsSpace = 0;
                                        if (typeof shelfs.ROverhang == "undefined" || shelfs.ROverhang == "") {
                                            //ASA-1237
                                            shelfs.ROverhang = 0;
                                        }
                                        if (typeof shelfs.LOverhang == "undefined" || shelfs.LOverhang == "") {
                                            //ASA-1237
                                            shelfs.LOverhang = 0;
                                        }
                                        if (g_lr_overhung == "Y") {
                                            var shelfWidth = shelfs.W + shelfs.ROverhang + shelfs.LOverhang; //ASA-1237
                                        } else {
                                            var shelfWidth = shelfs.W;
                                        }
                                        var shelfDepth = shelfs.D;
                                        var availableSpace = 0;
                                        var k = 0;
                                        //ASA-2023 task-2
                                        var shelfItems = Array.isArray(shelfs.ItemInfo) ? shelfs.ItemInfo : [];
                                        // for (const items of shelfs.ItemInfo) {
                                        for (const items of shelfItems) {
                                            //ASA-2023 task-2
                                            if (typeof items.BottomObjID == "undefined" || items.BottomObjID == "") {
                                                if (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR") {
                                                    itemsSpace += items.W;

                                                } else {
                                                    itemsSpace += items.D;
                                                }
                                                k++;
                                            }
                                        }
                                        if (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR") {
                                            // 1902 Available space should be calculated
                                            if (shelfs.SpreadItem !== "E") {
                                                var horizGap = shelfs.HorizGap ? shelfs.HorizGap : 0;
                                                var horizGapSpace = (k > 1) ? horizGap * (k - 1) : 0;
                                                itemsSpace += horizGapSpace;
                                            }
                                            availableSpace = wpdSetFixed((shelfWidth - itemsSpace) * 100); //.toFixed(3));
                                        } else {
                                            availableSpace = wpdSetFixed((shelfDepth - itemsSpace) * 100); //.toFixed(3));
                                        }
                                        //ASA-1970 Start
                                        //ASA-1946
                                        // if (shelfs.SpreadItem == "F" && shelfs.ItemInfo?.length == 1 && (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR")) {
                                        //    	var itemWidth = shelfs.ItemInfo[0]?.CrushHoriz > 0 ? shelfs.ItemInfo[0]?.W : shelfs.ItemInfo[0]?.RW;  //ASA-1946 Issue1
                                        // 	availableSpace = wpdSetFixed((shelfWidth - itemWidth) * 100);
                                        // }
                                        if (shelfs.SpreadItem == "F" && (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR")) {
                                            var itemWidth = 0;
                                            for (const item of shelfs.ItemInfo) {
                                                // itemWidth += item?.RW;
                                                itemWidth += item?.CrushHoriz > 0 ? item?.W : item?.RW;
                                            }
                                            availableSpace = wpdSetFixed((shelfWidth - itemWidth) * 100);
                                        }
                                        //ASA-1970 End
                                        if (typeof shelfs.availableSpaceObjID !== "undefined" && shelfs.availableSpaceObjID !== -1) {
                                            //ASA-1073 obj is undefined in case of undo need to update
                                            var obj = shelf_obj.getObjectById(shelfs.availableSpaceObjID);
                                            shelf_obj.remove(obj);
                                        }
                                        var hex_color = shelfs.Color;
                                        if (hexToRgb(hex_color) == null) {
                                            var red = parseInt("FF", 16);
                                            var green = parseInt("FF", 16);
                                            var blue = parseInt("FF", 16);
                                        } else {
                                            var red = hexToRgb(hex_color).r;
                                            var green = hexToRgb(hex_color).r;
                                            var blue = hexToRgb(hex_color).g;
                                        }

                                        var text_color = getTextColor(red, green, blue); //ASA-1095

                                        // g_labelFont = 12;
                                        if (availableSpace < 0) {
                                            availableSpace = 0;
                                        }
                                        var return_obj = addlabelText("Space " + availableSpace, g_labelFont, g_labelActualSize, text_color, "center", "");
                                        shelf_obj.add(return_obj);
                                        var shelfObj = g_scene_objects[i].scene.children[2].getObjectById(shelfs.SObjID);
                                        shelfObj.AvlSpace = availableSpace; //ASA-1237
                                        if (shelfs.ObjType == "ROD") {
                                            return_obj.position.y = -0.009;
                                        } else {
                                            return_obj.position.y = -0.005;
                                        }
                                        return_obj.uuid = "fixel_space";
                                        if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                            return_obj.position.z = shelfs.D / 2 + 0.005;
                                        } else {
                                            return_obj.position.z = 0.005;
                                        }
                                        if (shelfs.ObjType !== "DIVIDER") {
                                            if (shelfs.ObjType == "ROD") {
                                                return_obj.position.x = 0 + (shelfs.W / 2.4 + 0.08);
                                            } else {
                                                return_obj.position.x = 0 + (shelfs.W / 2.4 - 0.08);
                                            }
                                            modules_info.ShelfInfo[j].availableSpaceObjID = return_obj.id;
                                        }
                                    }
                                }
                                j++;
                            }
                            m++;
                        }
                        render(i);
                        set_indicator_objects(i);
                    }
                    if (g_all_pog_flag == "Y") {
                        i++;
                    } else {
                        break;
                    }
                }
                g_scene = g_scene_objects[originalCanvas].scene;
                g_camera = g_scene_objects[originalCanvas].scene.children[0];
            }
            else {
                if (g_all_pog_flag == "N") {
                    var i = p_pog_index;
                } else {
                    var i = 0;
                }
                for (const pogInfo of g_pog_json) {
                    if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1 || (i == g_ComViewIndex && g_compare_view == "PREV_VERSION")) {
                        g_renderer = g_scene_objects[i].renderer;
                        g_scene = g_scene_objects[i].scene;
                        g_camera = g_scene_objects[i].scene.children[0];
                        for (const modules_info of g_pog_json[i].ModuleInfo) {
                            var k = 0;
                            for (const shelfs of modules_info.ShelfInfo) {
                                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                                    var shelf_obj = g_scene_objects[i].scene.children[2].getObjectById(shelfs.SObjID);
                                    if (typeof shelfs.availableSpaceObjID !== "undefined" && shelfs.availableSpaceObjID !== -1) {
                                        var availableSpaceObjID = shelf_obj.getObjectById(shelfs.availableSpaceObjID);
                                        shelf_obj.remove(availableSpaceObjID);
                                    }
                                    modules_info.ShelfInfo[k].availableSpaceObjID = -1;
                                }
                                k++;
                            }
                        }
                        render(i);
                    }
                    if (g_all_pog_flag == "N") {
                        break;
                    } else {
                        i++;
                    }
                }
                g_renderer = g_scene_objects[originalCanvas].renderer;
                g_scene = g_scene_objects[originalCanvas].scene;
                g_camera = g_scene_objects[originalCanvas].scene.children[0];
            }
        }
        else {
            if (g_all_pog_flag == "N") {
                var i = p_pog_index;
            } else {
                var i = 0;
            }
            for (const pogInfo of g_pog_json) {
                if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                    g_renderer = g_scene_objects[i].renderer;
                    g_scene = g_scene_objects[i].scene;
                    g_camera = g_scene_objects[i].scene.children[0];
                    for (const modules_info of g_pog_json[i].ModuleInfo) {
                        var k = 0;
                        for (const shelfs of modules_info.ShelfInfo) {
                            var shelf_obj = g_scene_objects[i].scene.children[2].getObjectById(shelfs.SObjID);
                            if (typeof shelf_obj !== "undefined" && shelfs.ObjType == "SHELF") {
                                var itemsSpace = 0;
                                if (typeof shelfs.ROverhang == "undefined" || shelfs.ROverhang == "") {
                                    //ASA-1237
                                    shelfs.ROverhang = 0;
                                }
                                if (typeof shelfs.LOverhang == "undefined" || shelfs.LOverhang == "") {
                                    //ASA-1237
                                    shelfs.LOverhang = 0;
                                }
                                if (g_lr_overhung == "Y") {
                                    var shelfWidth = shelfs.W + shelfs.ROverhang + shelfs.LOverhang; //ASA-1237
                                } else {
                                    var shelfWidth = shelfs.W;
                                }
                                var availableSpace = 0;
                                var j = 0;
                                for (const items of modules_info.ShelfInfo[k].ItemInfo) {
                                    if (typeof items.BottomObjID == "undefined" || items.BottomObjID == "") {
                                        if (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR") {
                                            itemsSpace += items.W;
                                        } else {
                                            itemsSpace += items.D;
                                        }
                                        j++;
                                    }
                                }
                                if (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR") {
                                    // 1902 Available space should be calculated
                                    if (shelfs.SpreadItem !== "E") {
                                        var horizGap = shelfs.HorizGap ? shelfs.HorizGap : 0;
                                        var horizGapSpace = (j > 1) ? horizGap * (j - 1) : 0;
                                        itemsSpace += horizGapSpace;
                                    }
                                    availableSpace = wpdSetFixed((shelfWidth - itemsSpace) * 100); //.toFixed(3));
                                } else {
                                    availableSpace = wpdSetFixed((shelfDepth - itemsSpace) * 100); //.toFixed(3));
                                }
                                //ASA-1970 Start
                                //ASA-1946
                                // if (shelfs.SpreadItem == "F" && shelfs.ItemInfo?.length == 1 && (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR")) {
                                //    	var itemWidth = shelfs.ItemInfo[0]?.CrushHoriz > 0 ? shelfs.ItemInfo[0]?.W : shelfs.ItemInfo[0]?.RW;  //ASA-1946 Issue1
                                // 	availableSpace = wpdSetFixed((shelfWidth - itemWidth) * 100);
                                // }
                                if (shelfs.SpreadItem == "F" && (shelfs.ObjType == "SHELF" || shelfs.ObjType == "HANGINGBAR")) {
                                    var itemWidth = 0;
                                    for (const item of shelfs.ItemInfo) {
                                        // itemWidth += item?.RW;
                                        itemWidth += item?.CrushHoriz > 0 ? item?.W : item?.RW;
                                    }
                                    availableSpace = wpdSetFixed((shelfWidth - itemWidth) * 100);
                                }
                                //ASA-1970 End
                                var shelfObj = g_scene_objects[i].scene.children[2].getObjectById(shelfs.SObjID);
                                if (availableSpace < 0) {
                                    //ASA-1237
                                    availableSpace = 0;
                                }
                                shelfObj.AvlSpace = availableSpace;
                            }
                            k++;
                        }
                    }
                    render(i);
                }
                if (g_all_pog_flag == "N") {
                    break;
                } else {
                    i++;
                }
            }

            g_renderer = g_scene_objects[originalCanvas].renderer;
            g_scene = g_scene_objects[originalCanvas].scene;
            g_camera = g_scene_objects[originalCanvas].scene.children[0];
        }
        logDebug("function : showFixelAvailableSpace", "E");
    } catch (err) {
        error_handling(err);
    }
}

//START ASA-1095
function getLabelPosition(p_Object, p_ObjectType, p_Position) {
    //pObjectType can be Module, Shelf or Item
    //pPosition can be Center, Left, Right, Top, Bottom
    p_Position = p_Position.toUpperCase();
    try {
        var posX, posY;
        if (p_ObjectType == "M") {
            posX = -1;
            posY = -1;
        } else if (p_ObjectType == "S") {
            if (p_Position == "CENTER") {
                posX = 0 - (p_Object.W / 4 + 0.01);
                if (p_Object.ObjType == "ROD") {
                    posY = 0.05;
                } else {
                    posY = -0.005;
                }
            } else if (p_Position == "TOP") {
                if (p_Object.ObjType == "HANGINGBAR") {
                    posX = 0 - (p_Object.W / 2.4 + 0.01);
                    posY = 0 - (p_Object.H / 2 + 0.012);
                } else if (p_Object.ObjType == "ROD") {
                    posX = 0 - (p_Object.W / 4 + 0.01);
                    posY = 0.05;
                } else {
                    posX = 0 - (p_Object.W / 2.4 + 0.01);
                    posY = 0 + (p_Object.H / 2 + 0.012);
                }
            } else if (p_Position == "LEFT") {
                if (p_Object.ObjType == "HANGINGBAR") {
                    posX = 0 - (p_Object.W / 2 + 0.08); //ASA-1296  ASA-1316 Task 1
                    posY = -0.005;
                } else if (p_Object.ObjType == "ROD") {
                    posX = 0 - (p_Object.W / 4 + 0.08); //ASA-1296 ASA-1316 Task 1
                    posY = 0.005;
                } else {
                    posX = 0 - (p_Object.W / 2 + 0.08); //ASA-1296 ASA-1316 Task 1
                    posY = -0.005;
                }
            } else if (p_Position == "RIGHT") {
                if (p_Object.ObjType == "HANGINGBAR") {
                    posX = 0 - (p_Object.W / 2 + 0.1);
                    posY = -0.005;
                } else if (p_Object.ObjType == "ROD") {
                    posX = 0 - (p_Object.W / 4 + 0.01);
                    posY = 0.05;
                } else {
                    posX = 0 + (p_Object.W / 2 + 0.1);
                    posY = -0.005;
                }
            } else if (p_Position == "BOTTOM") {
                if (p_Object.ObjType == "HANGINGBAR") {
                    posX = 0 - (p_Object.W / 2.4 + 0.01);
                    posY = 0 + (p_Object.H / 2 + 0.012);
                } else if (p_Object.ObjType == "ROD") {
                    posX = 0 - (p_Object.W / 4 + 0.01);
                    posY = 0.05;
                } else {
                    posX = 0 - (p_Object.W / 2.4 + 0.01);
                    posY = 0 - (p_Object.H / 2 + 0.012);
                }
            }
        } else if (p_ObjectType == "I") {
            posX = -1;
            posY = -1;
        }
        return [posX, posY];
    } catch (err) {
        error_handling(err);
    }
}

//END ASA-1095
function highlightProduct(p_object, p_linewidth, p_width, p_height, p_depth, p_z) {
    try {
        console.log("highlighting product", p_object);
        logDebug("function : add_wireframe; linewidth : " + p_linewidth, "S");
        var geometry = new THREE.BoxGeometry(p_width + 0.03, p_height + 0.05, 0);
        var geo = new THREE.EdgesGeometry(geometry);
        var mat = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3,
        });
        var wireframe = new THREE.LineSegments(geo, mat);
        p_object.geometry.computeBoundingBox(); //ASA-2017 Issue 11,15,16
        wireframe.position.copy(p_object.geometry.boundingBox.getCenter(new THREE.Vector3()));
        wireframe.position.z += 0.01;
        wireframe.BorderColour = 0xff0000;
        wireframe.uuid = "highlight_frame";
        p_object.WireframeObj = wireframe;
        p_object.add(wireframe);
        p_object.WireframeObj = wireframe;
        logDebug("function : add_wireframe", "E");
        return wireframe.id;
    } catch (err) {
        error_handling(err);
    }
}

function render_blink_effect() {
    clearInterval(g_myVar);
    g_myVar = setInterval(function () {
        blink_effect_3d();
    }, 500);
}
var blink_color = 0xff0000,
    g_intersected = [];

function blink_effect_3d() {
    if (blink_color == 0xff0000) {
        blink_color = 0x00ffff;
    } else {
        blink_color = 0xff0000;
    }

    if (g_show_live_image == "Y") {
        for (var i = 0; i < g_intersected.length; i++) {
            if (typeof g_intersected[i] !== "undefined") {
                if (blink_color == 0x00ffff) {
                    g_intersected[i].WireframeObj.material.color.setHex(0xff0000);
                } else {
                    g_intersected[i].WireframeObj.material.color.setHex(0x00ffff);
                }
            }
        }
    } else {
        for (var i = 0; i < g_intersected.length; i++) {
            if (typeof g_intersected[i] !== "undefined") {

                if (blink_color == 0x00ffff) {
                    g_intersected[i].material.color.setHex(0xff0000);
                } else {
                    g_intersected[i].material.color.setHex(0x00ffff);
                }

                // Loop through children but EXCLUDE the highlight_frame
                if (g_intersected[i].children && g_intersected[i].children.length > 0) { // ASA2017
                    for (var j = 0; j < g_intersected[i].children.length; j++) {
                        var child = g_intersected[i].children[j];
                        if (child.material &&
                            child.uuid !== "highlight_frame" &&
                            child.uuid !== "wireframe" && child.type !== "Sprite" && child.type !== "LineSegments") {

                            if (blink_color == 0x00ffff) {
                                child.material.color.setHex(0xff0000);
                            } else {
                                child.material.color.setHex(0x00ffff);
                            }
                        }
                    }
                }
            }
        }
    }

    l_highlightStatus = $v("P25_POGCR_HIGHLIGHT_SEARCHED_ITEM"); //Regression Issue 1-20260119 

    if (l_highlightStatus == "Y" && g_pog_json.length > 1) {
        render_all_pog();
    } else {
        render(0);
    }
}

//Render is called on every object creation.
function render(p_pog_index) {
    logDebug("function : render", "S");
    try {
        if (typeof p_pog_index !== "undefined" && typeof g_scene_objects[p_pog_index] !== "undefined" && typeof g_canvas_objects[p_pog_index] !== "undefined") {
            if (g_scene_objects.length > 0) {
                var context = g_canvas_objects[p_pog_index].getContext("2d");
                if (context == null) {
                    if (g_renderer != undefined) g_renderer.render(g_scene, g_camera);
                } else {
                    g_renderer.setPixelRatio(window.devicePixelRatio);
                    var canvas_width = g_canvas_objects[p_pog_index].width;
                    var canvas_height = g_canvas_objects[p_pog_index].height;

                    g_renderer.setSize(canvas_width, canvas_height);
                    //ASA-1986 start
                    var renderCamera = g_scene_objects[p_pog_index].scene.children[0];
                    renderCamera.aspect = canvas_width / canvas_height;
                    renderCamera.updateProjectionMatrix();
                    g_renderer.render(g_scene_objects[p_pog_index].scene, renderCamera);
                    //ASA-1986 end
                    context.drawImage(g_renderer.domElement, 0, 0, canvas_width, canvas_height);
                }
            }
        } else {
            if (g_renderer != undefined) g_renderer.render(g_scene, g_camera);
        }

        logDebug("function : render", "E");
    } catch (err) {
        error_handling(err);
    }
}

var new_count = 0;
function animate_all(p_timestamp) {
    logDebug("function : limited_animate", "S");
    setTimeout(function () {
        if (new_count < 5) {
            new_count = new_count + 1;
            async function animate_pogs() {
                await render_all_pog();
            }
            animate_pogs();
            requestAnimationFrame(animate_all);
        } else {
            new_count = 0;
        }
        logDebug("function : limited_animate", "E");
    }, 1000 / 20);
}

function animate_all_pog() {
    requestAnimationFrame(animate_all);
}

async function render_all_pog() {
    var i = 0;
    for (const obj of g_scene_objects) {
        var context = g_canvas_objects[i].getContext("2d");
        g_renderer.setPixelRatio(window.devicePixelRatio);
        var canvas_width = g_canvas_objects[i].width;
        var canvas_height = g_canvas_objects[i].height;

        g_renderer.setSize(canvas_width, canvas_height);
        g_scene_objects[i].scene.children[0].aspect = canvas_width / canvas_height;
        g_renderer.render(g_scene_objects[i].scene, g_scene_objects[i].scene.children[0]);
        if (context !== null) {
            context.drawImage(g_renderer.domElement, 0, 0, canvas_width, canvas_height);
        }

        i++;
    }
}

async function add_carpark_item(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_recreate, p_fresh_item, p_with_image, p_angle, p_pog_index) {
    logDebug("function : add_carpark_item; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; recreate : " + p_recreate + "; with_image : " + p_with_image + "; angle : " + p_angle, "S");
    try {
        console.log("add carpark ", p_with_image);
        var itemdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[p_shelf_index].ItemInfo[p_item_index];
        var nesting_val = itemdtl.NVal;
        var item_orientation = itemdtl.Orientation;
        var vert_facing = itemdtl.BVert;
        var horiz_facing = itemdtl.BHoriz;
        var details = g_orientation_json[item_orientation];
        var details_arr = details.split("###");
        return new Promise(function (resolve, reject) {
            var img_exists = "N";
            var img_index = -1;
            var item_code = itemdtl.Item;
            var j = 0;
            for (const images_arr of g_ItemImages) {
                if (item_code == images_arr.Item && details_arr[0] == images_arr.Orientation && images_arr.ItemImage !== null) {
                    img_exists = "Y";
                    img_index = j;
                    break; //return false;
                }
                j++;
            }
            if (img_exists == "Y" && p_with_image == "Y") {
                // Create an image
                var image = new Image(); // or document.createElement('img' );
                // Create texture
                var tex = new THREE.Texture(image);
                // On image load, update texture
                image.onload = () => {
                    tex.needsUpdate = true;
                };
                // Set image source
                image.src = "data:image/jpeg;base64," + g_ItemImages[img_index].ItemImage;
                var geometry = new THREE.BoxGeometry(p_width, p_height, 0.001);
                var material = new THREE.MeshStandardMaterial({
                    map: tex,
                });
                if (nesting_val == 0) {
                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;
                    if (p_angle == 90 || p_angle == 270) {
                        tex.repeat.set(vert_facing, horiz_facing);
                    } else {
                        tex.repeat.set(horiz_facing, vert_facing);
                    }
                    if (p_angle == 90) {
                        p_angle = 270;
                    } else if (p_angle == 270) {
                        p_angle = 90;
                    }
                    tex.rotation = (p_angle * Math.PI) / 180;
                }
                items = new THREE.Mesh(geometry, material);
                items.position.x = p_x;
                items.position.z = 0.001;
                items.position.y = p_y;
            } else {
                var colorValue = parseInt(p_color.replace("#", "0x"), 16);
                var hex_decimal = new THREE.Color(colorValue);
                items = new THREE.Mesh(
                    new THREE.BoxGeometry(p_width, p_height, 0.001),
                    new THREE.MeshStandardMaterial({
                        color: hex_decimal,
                    })
                );
                items.position.z = 0.001;

                items.position.x = p_x;
                items.position.y = p_y;
            }
            g_world.add(items);
            var item_info = itemdtl;
            items.uuid = p_uuid;
            items.ItemID = item_info.Item;
            items.Description = item_info.Desc;
            items.HorizFacing = item_info.BHoriz;
            items.VertFacing = item_info.BVert;
            items.DFacing = item_info.BaseD;
            items.DimUpdate = item_info.DimUpdate;
            items.SellingPrice = item_info.SellingPrice;
            items.SalesUnit = item_info.SalesUnit;
            items.NetSales = item_info.NetSales;
            items.CogsAdj = item_info.CogsAdj;
            items.RegMovement = item_info.RegMovement;
            items.AvgSales = item_info.AvgSales;
            items.ItemStatus = item_info.ItemStatus;
            items.CDTLvl1 = item_info.CDTLvl1; //ASA-1130
            items.CDTLvl2 = item_info.CDTLvl2; //ASA-1130
            items.CDTLvl3 = item_info.CDTLvl3; //ASA-1130
            items.ActualDPP = item_info.ActualDPP; //ASA-1182 ASA-1277-(3)
            items.DPPLoc = item_info.DPPLoc; //ASA-1308 Task-3
            items.StoreSOH = item_info.StoreSOH; //ASA-1182 ASA-1277-(3)
            items.StoreNo = item_info.StoreNo; //ASA-1277-(3)
            items.WeeksOfInventory = item_info.WeeksOfInventory; //ASA-1277-(3)
            //ASA-2013 Start
            items.ShelfPrice = item_info.ShelfPrice;
            items.PromoPrice = item_info.PromoPrice;
            items.DiscountRate = item_info.DiscountRate;
            items.PriceChangeDate = item_info.PriceChangeDate;
            items.WeeksOfInventory = item_info.WeeksOfInventory;
            items.Qty = item_info.Qty;
            items.WhStock = item_info.WhStock;
            items.StoreStock = item_info.StoreStock;
            items.StockIntransit = item_info.StockIntransit;
            //ASA-2013 End
            items.GrossProfit = item_info.GrossProfit;
            items.WeeksCount = item_info.WeeksCount;
            items.MovingItem = item_info.MovingItem;
            items.Profit = item_info.Profit;
            items.TotalMargin = item_info.TotalMargin;
            items.W = item_info.W;
            items.H = item_info.H;
            items.D = item_info.D;
            items.Color = item_info.Color;
            items.Barcode = item_info.Barcode;
            items.Desc = item_info.Desc;
            items.Brand = item_info.Brand;
            items.Group = item_info.Group;
            items.Dept = item_info.Dept;
            items.Class = item_info.Class;
            items.SubClass = item_info.SubClass;
            items.StdUOM = item_info.StdUOM;
            items.SizeDesc = item_info.SizeDesc;
            items.Supplier = item_info.Supplier;
            items.LocID = item_info.LocID;
            // items.Supplier = item_info.Supplier;
            items.SupplierName = item_info.SupplierName; //already supplier was added
            items.ItemDim = g_msg_h + ": " + (item_info.OH * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushVert + ")" + " " + g_msg_w + ": " + (item_info.OW * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushHoriz + ")" + " " + g_msg_d + ": " + (item_info.OD * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushD + ")"; //ASA-1407 issue 9
            items.OrientationDesc = item_info.OrientationDesc;
            items.StoreCnt = item_info.StoreCnt;
            items.RotationDegree = 0;
            items.OW = item_info.OW * 100;
            items.OH = item_info.OH * 100;
            items.OD = item_info.OD * 100;
            items.CrushW = item_info.CrushHoriz; //ASA-1758
            items.CrushH = item_info.CrushVert; //ASA-1758
            items.CrushD = item_info.CrushD; //ASA-1758
            items.Shelf = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[p_shelf_index].Shelf;
            items.Rotation = 0;
            items.ItemSlope = 0;
            items.Rotation = "N";
            items.ImageExists = "N";
            items.DescSecond = item_info.DescSecond;
            items.DfacingUpd = item_info.DfacingUpd;
            items.ItmDescChi = item_info.ItmDescChi; //ASA-1407 Task 1;,//ASA-1407 issue 5
            items.ItmDescEng = item_info.ItmDescEng; //ASA-1273 Prasanna
            //items.ItmDescEng = items.Brand + items.Desc + items.SizeDesc;
            items.TotalUnitsCalc = item_info.BHoriz * item_info.BVert * item_info.BaseD;
            items.PkSiz = item_info.PkSiz;
            var cap_capacity = item_info.CapFacing * item_info.CapDepth * item_info.CapHorz; //ASA-1273 Prasanna
            items.Cpct = item_info.BHoriz * item_info.BVert * item_info.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0);
            items.Brand_Category = item_info.Brand_Category; //ASA-1158-S
            items.ClassName = item_info.ClassName;
            items.Uda_item_status = item_info.Uda_item_status;
            items.Gobecobrand = item_info.Gobecobrand;
            items.Internet = item_info.Internet; //ASA-1158-E,//ASA-1407 issue 9 internet
            items.Categ = item_info.Categ;
            var det_arr = item_info.SizeDesc.split("*");
            items.ItemSize = item_info.ItemSize;
            items.SplrLbl = item_info.SplrLbl;
            items.COO = item_info.COO;
            items.EDLP = item_info.EDLP;
            items.LoGrp = item_info.LoGrp;
            items.SqzPer = (typeof item_info.CrushHoriz !== "undefined" ? item_info.CrushHoriz : 0) + ":" + (typeof item_info.CrushVert !== "undefined" ? item_info.CrushVert : 0) + ":" + (typeof item_info.CrushD !== "undefined" ? item_info.CrushD : 0); //added Anamika below tags are added to match with func add_items_prom
            items.InternationalRng = item_info.InternationalRng;
            items.NewItem = item_info.NewItem; //ASA-1182
            items.DaysOfSupply = item_info.DaysOfSupply;
            items.BrandType = item_info.BrandType; //added below tags to match with func add_items_prom ASA-1292
            items.LiveNewItem = item_info.LiveNewItem;
            items.GoGreen = item_info.GoGreen;
            items.UnitperCase = item_info.UnitperCase;
            items.Orientation = item_info.Orientation;
            items.UnitperTray = item_info.UnitperTray;
            if (typeof item_info.Dept !== "undefined" && item_info.Dept !== "" && item_info.Dept !== null) {
                //ASA-1407 issue 9 S
                var itemdept = item_info.Dept.split("-");
            } else {
                var itemdept = "";
            }
            if (typeof item_info.Class !== "undefined" && item_info.Class !== "" && item_info.Class !== null) {
                var itemclass = item_info.Class.split("-");
            } else {
                var itemclass = "";
            }
            if (typeof item_info.SubClass !== "undefined" && item_info.SubClass !== "" && item_info.SubClass !== null) {
                var itemsubclass = item_info.SubClass.split("-");
            } else {
                var itemsubclass = "";
            }
            items.ClassName = itemdept[0] + "/" + itemclass[0] + "/" + itemsubclass[0];
            items.UDA751 = item_info.UDA751;
            items.UDA755 = item_info.UDA755;
            items.Status = item_info.Status;
            items.StoreCnt = item_info.StoreCnt; //ASA-1407 issue 9 -E
            var l_wireframe_id = add_wireframe(items, 2);
            items.WFrameID = l_wireframe_id;
            //ASA-1640 Start
            items.ItemCondition = item_info.ItemCondition;
            items.AUR = item_info.AUR;
            items.ItemRanking = item_info.ItemRanking;
            items.WeeklySales = item_info.WeeklySales;
            items.WeeklyNetMargin = item_info.WeeklyNetMargin;
            items.WeeklyQty = item_info.WeeklyQty;
            items.NetMarginPercent = item_info.NetMarginPercent;
            items.CumulativeNM = item_info.CumulativeNM;
            items.TOP80B2 = item_info.TOP80B2;
            items.ItemBrandC = item_info.ItemBrandC;
            items.ItemPOGDept = item_info.ItemPOGDept;
            items.ItemRemark = item_info.ItemRemark;
            items.RTVStatus = item_info.RTVStatus;
            items.Pusher = item_info.Pusher;
            items.Divider = item_info.Divider;
            items.BackSupport = item_info.BackSupport;
            //ASA-1640 End
            items.CWPerc = item_info.CWPerc; //ASA-1640 #5
            items.CHPerc = item_info.CHPerc; //ASA-1640 #5
            items.CDPerc = item_info.CDPerc; //ASA-1640 #5

            items.OOSPerc = item_info.OOSPerc; //ASA-1688 Added for OOS%
            items.InitialItemDesc = item_info.InitialItemDesc; //ASA-1734 Issue 1
            items.InitialBrand = item_info.InitialBrand; //ASA-1787 Request #6
            items.InitialBarcode = item_info.InitialBarcode; //ASA-1787 Request #6

            resolve(items.id);
            var selectedObject = g_world.getObjectById(items.id);
            if (items.DimUpdate == "E") {
                selectedObject.BorderColour = g_dim_error_color;
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else if (items.Status == "N") {
                selectedObject.BorderColour = g_status_error_color;
                selectedObject.Status = "N";
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else if (nvl(items.MovingItem) == "No" && g_pogcr_auto_hlite_non_mv_item == "Y") {
                selectedObject.BorderColour = g_nonMovingItemColor;
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else {
                if (items.OOSPerc > 80 && g_pogcr_enbl_oos_border == "Y") {
                    //ASA-1688
                    selectedObject.BorderColour = g_pogcr_oos_border_color; //ASA-1688 Added to give blue border to item
                    selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                } else {
                    selectedObject.BorderColour = 0x000000;
                }
            }
            logDebug("function : add_carpark_item", "E");
        });
    } catch (err) {
        error_handling(err);
    }
}

function blink_effect() {
    for (var i = 0; i < g_intersected.length; i++) {
        //ASA 1427 S
        if (g_intersected[i].blink_color == 0x000000 || g_intersected[i].blink_color == g_dim_error_color || g_intersected[i].blink_color == g_status_error_color || (g_intersected[i].blink_color == g_pogcr_oos_border_color && g_pogcr_enbl_oos_border == "Y")) {
            if (typeof g_intersected[i].ItemID != "undefined") {
                g_intersected[i].blink_color = g_select_item_color_change;
            } else {
                g_intersected[i].blink_color = 0xffffff;
            }
        } else {
            for (var i = 0; i < g_intersected.length; i++) {
                if (nvl(g_intersected[i].OOSPerc) > 80 && g_pogcr_enbl_oos_border == "Y" && (g_intersected[i].blink_color != g_dim_error_color || g_intersected[i].blink_color != g_status_error_color)) {
                    //ASA-1688 Added if to give blue border to item
                    g_intersected[i].blink_color = g_pogcr_oos_border_color;
                } else {
                    g_intersected[i].blink_color = 0x000000;
                }
            }
        }
    } //ASA 1427 E
    for (var i = 0; i < g_intersected.length; i++) {
        if (typeof g_intersected[i] !== "undefined") {
            if (g_intersected[i].ImageExists == "Y" && (g_show_live_image == "Y" || g_show_live_image_comp == "Y")) {
                g_intersected[i].WireframeObj.material.transparent = false;
                g_intersected[i].WireframeObj.material.opacity = 1;
            }
            if ((g_intersected[i].DimUpdate == "E" || g_intersected[i].Status == "N") && g_intersected[i].blink_color == 0x000000) {
                g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
            } else {
                g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].blink_color); //ASA 1427 E
            }
        }
    }

    // render(g_pog_index);     //ASA-1548 Issue 1
    render_all_pog(); //ASA-1548 Issue 1
}

function set_multi_blink(p_pog_json, p_pog_index) {
    logDebug("function : set_multi_blink", "S");
    if (typeof p_pog_json !== "undefined" && p_pog_json.length > 0 && g_delete_details.length > 0) {
        if (g_intersected) {
            for (var i = 0; i < g_intersected.length; i++) {
                g_select_color = g_intersected[i].BorderColour;
                g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                if (g_intersected[i].ImageExists == "Y" && (g_show_live_image == "Y" || g_show_live_image_comp == "Y")) {
                    g_intersected[i].WireframeObj.material.transparent = true;
                    g_intersected[i].WireframeObj.material.opacity = 0.0025;
                }
            }
        }
        g_intersected = [];
        if (typeof g_delete_details !== "undefined") {
            $.each(g_delete_details, function (j, details) {
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(details.ObjID);
                g_intersected.push(selectedObject);
            });
            render_animate_selected();
        }
    }
    logDebug("function : set_multi_blink", "E");
}

function render_animate_selected() {
    //ASA-1640 Start
    if (g_product_list_blink == "Y") {
        var productList = [];
        for (const item of g_intersected) {
            if (nvl(item.ItemID) != 0) {
                productList.push(item.ItemID);
            }
        }
        productList = [...new Set(productList)];
        $("#draggable_table .product_list_blink").removeClass("product_list_blink");

        //ASA-1766 Issue 1
        let productColIndex = -1;
        $("#draggable_table thead th").each(function (index) {
            if ($(this).text().trim().toLowerCase() === "product") {
                productColIndex = index;
                return false; // Break loop
            }
        });

        if (productColIndex !== -1) {
            for (const product of productList) {
                $('#draggable_table [data-id="' + product + '"] td')
                    .eq(productColIndex)
                    .addClass("product_list_blink");
            }
        }
        //ASA-1766 Issue 1 ends
    }
    //ASA-1640 End
    clearInterval(g_myVar);
    g_myVar = setInterval(function () {
        blink_effect();
    }, 500);
}

function showItemSubLabel(p_subLabel, p_itemLabelInd, p_pogcrItemBackLabelColor, p_itemLabelPos, p_pog_index) {
    try {
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var details = {};
        var finalAction;
        if (typeof g_undoRedoAction == "undefined") {
            g_undoRedoAction = "REDO";
        }
        if (g_undoRedoAction == "REDO") {
            finalAction = "U";
        } else {
            finalAction = "R";
        }
        var i = 0;
        if (p_itemLabelInd == "Y") {
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            if (shelfs.ItemInfo.length > 0) {
                                var item_Details = shelfs.ItemInfo;
                                var k = 0;
                                for (const items of item_Details) {
                                    if (items.Item !== "DIVIDER") {
                                        //&& items.LocID !== "" && typeof items.LocID !== "undefined"
                                        var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                        if (typeof item_obj !== "undefined") {
                                            if (typeof items.SubLblObjID !== "undefined" && items.SubLblObjID !== -1) {
                                                var label_obj = item_obj.getObjectById(items.SubLblObjID);
                                                item_obj.remove(label_obj);
                                            }
                                            var back_color = p_pogcrItemBackLabelColor,
                                                text_color,
                                                red,
                                                green,
                                                blue;
                                            if (hexToRgb(back_color) == null) {
                                                red = parseInt("FF", 16);
                                                green = parseInt("FF", 16);
                                                blue = parseInt("FF", 16);
                                            } else {
                                                red = hexToRgb(back_color).r;
                                                green = hexToRgb(back_color).r;
                                                blue = hexToRgb(back_color).g;
                                            }
                                            text_color = getTextColor(red, green, blue);
                                            var text_display = "";
                                            var SalesInfo = get_sales_info(p_pog_index, items.ItemID);
                                            if (p_subLabel == "LPR") {
                                                text_display = nvl(items.ItemID) !== 0 ? items.ItemID : "";
                                            } else if (p_subLabel == "LQT") {
                                                text_display = nvl(items.SalesUnit) !== 0 ? items.SalesUnit : "";
                                            } else if (p_subLabel == "LSL") {
                                                var avgsales = parseFloat(items.AvgSales).toFixed(2);
                                                text_display = nvl(items.AvgSales) !== 0 ? avgsales : "";
                                            } else if (p_subLabel == "LST") {
                                                text_display = nvl(items.StoreSOH) !== 0 ? items.StoreSOH : "";
                                            } else if (p_subLabel == "LDP") {
                                                text_display = nvl(items.ActualDPP) !== 0 ? items.ActualDPP : "";
                                            } else if (p_subLabel == "LSC") {
                                                text_display = nvl(items.StoreCnt) !== 0 ? items.StoreCnt : "";
                                            } else if (p_subLabel == "LNP") {
                                                if (nvl(items.NewItem) !== 0 && items.NewItem !== "N" && items.LiveNewItem !== "Y") {
                                                    text_display = items.NewItem;
                                                } else if (items.LiveNewItem !== "N" && g_pogcr_live_new_item == "Y") {
                                                    text_display = nvl(items.LiveNewItem) !== 0 && items.LiveNewItem == "Y" ? "New" : ""; //ASA-1250
                                                }
                                            } else if (p_subLabel == "COS") {
                                                //ASA-1407 -S
                                                var det_arr = items.SizeDesc.split("*");
                                                var cap_capacity = items.CapFacing * items.CapDepth * items.CapHorz * parseInt(items.CapMerch == 1 ? items.UnitperTray : 1); //ASA-1605
                                                //var cap_capacity = items.CapFacing * items.CapDepth * items.CapHorz; //ASA-1341 Issue-2 added Cap_capacity in COS Calculation. //ASA-1605
                                                details = (items.BHoriz * items.BVert * items.BaseD * parseInt(items.MerchStyle == 1 ? items.UnitperTray : items.MerchStyle == 2 ? items.UnitperCase : 1) + cap_capacity) / parseInt(det_arr[1]); //ASA-1605 //ASA-1871 adding condition for case
                                                //details = ((items.BHoriz * items.BVert * items.BaseD) + cap_capacity) / parseInt(det_arr[1]); //ASA-1247 //ASA-1605

                                                if (isNaN(details) || !isFinite(details)) {
                                                    text_display = "";
                                                } else {
                                                    text_display = details.toFixed(1);
                                                }
                                            } else if (p_subLabel == "DOS") {
                                                details = (items.BHoriz * items.BVert * items.BaseD * parseInt(items.MerchStyle == 1 ? items.UnitperTray : items.MerchStyle == 2 ? items.UnitperCase : 1)) / (SalesInfo.SalesUnitPerWeek / 7); //ASA-1605 //ASA-1871 adding condition for case
                                                //details = (items.BHoriz * items.BVert * items.BaseD) / (SalesInfo.SalesUnitPerWeek / 7); //ASA-1605
                                                if (isNaN(details) || !isFinite(details)) {
                                                    text_display = "";
                                                } else {
                                                    text_display = details.toFixed(1);
                                                }
                                            } else if (p_subLabel == "SU") {
                                                text_display = nvl(SalesInfo.SalesUnitPerWeek) !== 0 ? SalesInfo.SalesUnitPerWeek : "";
                                            } else if (p_subLabel == "SV") {
                                                text_display = nvl(SalesInfo.SalesPerWeek) !== 0 ? SalesInfo.SalesPerWeek : "";
                                            } else if (p_subLabel == "VRMPer") {
                                                text_display = nvl(SalesInfo.VRMPer) !== 0 ? SalesInfo.VRMPer : ""; //ASA-1407 Task 1
                                            } else if (p_subLabel == "EDLP") {
                                                //ASA-1407 -E
                                                text_display = nvl(items.EDLP) !== 0 ? items.EDLP : "";
                                            }
                                            console.log("text", nvl(items.LiveNewItem), items.LiveNewItem);
                                            if (text_display !== "") {
                                                var return_obj = addlabelText(text_display, g_labelFont, g_labelActualSize, text_color, "center", back_color);
                                                item_obj.add(return_obj);
                                                return_obj.position.x = 0;
                                                if ((p_itemLabelPos == "CENTER" || p_itemLabelPos == "BOTTOM") && p_itemLabelInd == "Y") {
                                                    return_obj.position.y = items.H / 2 + 0.0015625 * g_labelFont;
                                                } else {
                                                    return_obj.position.y = 0 - items.H / 2 + 0.0015625 * g_labelFont;
                                                }

                                                if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                                    // return_obj.position.z = items.D / 2 + 0.0005;    //ASA-1496 #3
                                                    return_obj.position.z = items.D / 2 + 0.0055; //ASA-1496 #3
                                                } else {
                                                    // return_obj.position.z = 0.0005;                     //ASA-1496 #3
                                                    return_obj.position.z = 0.0015; //ASA-1496 #3
                                                }
                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].SubLblObjID = return_obj.id;
                                            }
                                        }
                                    } else if (items.Item !== "DIVIDER") {
                                        if (typeof items.SubLblObjID !== "undefined" && items.SubLblObjID !== -1) {
                                            var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                            if (typeof item_obj !== "undefined") {
                                                var label_obj = item_obj.getObjectById(items.SubLblObjID);
                                                item_obj.remove(label_obj);
                                            }
                                        }
                                    }
                                    k = k + 1;
                                }
                            }
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
        } else {
            var i = 0;
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            if (shelfs.ItemInfo.length > 0) {
                                var item_Details = shelfs.ItemInfo;
                                var k = 0;
                                for (const items of item_Details) {
                                    if (items.Item !== "DIVIDER" && items.LocID !== "" && typeof items.LocID !== "undefined") {
                                        var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                        if (typeof item_obj !== "undefined") {
                                            if (typeof items.SubLblObjID !== "undefined" && items.SubLblObjID !== -1) {
                                                var label_obj = item_obj.getObjectById(items.SubLblObjID);
                                                item_obj.remove(label_obj);
                                            }
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].SubLblObjID = -1;
                                        }
                                    }
                                    k = k + 1;
                                }
                            }
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
        }

        const oldLabelStatus = g_itemSubLabelInd;
        const oldLabelType = g_itemSubLabel;
        details["item_sale_label_ind"] = oldLabelStatus;
        details["item_sale_label_type"] = oldLabelType;

        g_undo_details = [];
        g_undo_details.push(details);
        if (finalAction == "U") {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_undo_all_obj_arr = [];

            g_undo_all_obj_arr.push(g_undo_details);
            g_undo_all_obj_arr.push(g_cut_copy_arr);
            g_undo_all_obj_arr.previousAction = "ITEM_SALE_LABEL";
            if (g_cut_support_obj_arr.length > 0) {
                g_undo_all_obj_arr.hasSupportArr = "Y";
            } else {
                g_undo_all_obj_arr.hasSupportArr = "N";
            }
            g_undo_all_obj_arr.g_MultiObjects = "N";
            g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
            g_undo_final_obj_arr.push(g_undo_all_obj_arr);
            if (g_delete_details["is_dragging"] != "Y") {
                //ASA-1577
                g_delete_details = [];
            }
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            g_undo_details = [];
        } else {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_redo_all_obj_arr = [];
            g_redo_all_obj_arr.push(g_undo_details);
            g_redo_all_obj_arr.push(g_cut_copy_arr);
            g_redo_all_obj_arr.previousAction = "ITEM_SALE_LABEL";
            if (g_cut_support_obj_arr.length > 0) {
                g_redo_all_obj_arr.hasSupportArr = "Y";
            } else {
                g_redo_all_obj_arr.hasSupportArr = "N";
            }
            g_redo_all_obj_arr.g_MultiObjects = "N";
            g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
            g_redo_final_obj_arr.push(g_redo_all_obj_arr);
            if (g_delete_details["is_dragging"] != "Y") {
                //ASA-1577
                g_delete_details = [];
            }
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            g_undo_details = [];
        }
        g_itemSubLabelInd = p_itemLabelInd;
        g_itemSubLabel = p_subLabel;
        animate_pog(p_pog_index);
        render(p_pog_index);
    } catch (err) {
        error_handling(err);
    }
}
//this function is called for add merch. which will add red color box for each shelf showing its max merch. //ASA-1519 issue 21
function add_merch_border(p_object, p_width, p_height, p_shelf_height, p_obj_type, p_rotation, p_slope, p_maxmerch) {
    try {
        logDebug("function : add_merch_border; width : " + p_width + "; height : " + p_height + "; shelf_height : " + p_shelf_height + "; obj_type : " + p_obj_type + "; rotation : " + p_rotation + "; slope : " + p_slope, "S");
        var geometry = new THREE.BoxGeometry(p_width, p_height - 0.01, 0);
        var geo = new THREE.EdgesGeometry(geometry);
        var mat = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 2,
        });
        var wireframe = new THREE.LineSegments(geo, mat);
        wireframe.renderOrder = 1;

        p_object.add(wireframe);
        wireframe.uuid = "merch_border";
        p_object.merchid = wireframe.id;
        wireframe.position.x = 0;
        if (p_rotation !== 0 || p_slope !== 0) {
            wireframe.rotateY((p_rotation * Math.PI) / 180);
            wireframe.rotateX((p_slope * Math.PI) / 180);
        }
        if (p_obj_type == "HANGINGBAR") {
            wireframe.position.y = -(p_height / 2 + p_shelf_height / 2);
            if (p_maxmerch.Topmerch == "Y" && p_maxmerch.MaxMerch == 0) {
                p_maxmerch.Merch = 0;
            } else if (p_maxmerch.Topmerch !== "Y" && p_maxmerch.MaxMerch != 0) {
                p_maxmerch.Merch = p_maxmerch.MaxMerch;
            } else {
                p_maxmerch.Merch = wpdSetFixed(-(p_height / 2 + p_shelf_height / 2)); //ASA-1531 issue 21
            }
        } else {
            wireframe.position.y = p_height / 2 + p_shelf_height / 2 + 0.0005;
            if ((p_maxmerch.Topmerch == "Y") & (p_maxmerch.MaxMerch == 0)) {
                p_maxmerch.Merch = 0;
            } else if (p_maxmerch.Topmerch !== "Y" && p_maxmerch.MaxMerch != 0) {
                p_maxmerch.Merch = p_maxmerch.MaxMerch;
            } else {
                p_maxmerch.Merch = wpdSetFixed(p_height / 2 + p_shelf_height / 2 + 0.0005);
            } //ASA-1531 issue 21
        }
        logDebug("function : add_merch_border", "E");
    } catch (err) {
        error_handling(err);
    }
}
