
// This file is used for common functions is used in page 25 and page 193


var g_page_no = (function () {
    var htmlClass = document.documentElement.className || "";
    var match = htmlClass.match(/page-(\d+)/);
    var page = match ? match[1] : "0";
    return "P" + page + "_";  
})();

console.log(g_page_no);

//this function is used under setUpMouseHander in asw_common_main.js. as this function is used only in page 25.
//this function will be called on mouse down. it will find out on which canvas user clicked and assing g_pog_index and all other indicators for the clicked POG canvas.
function set_curr_canvas(p_event) {
    var new_camera = {};
    var new_world;
    if (p_event.target.nodeName == "CANVAS") {
        if (p_event.type !== "mousemove") {
            g_canvas = p_event.target;
            if (p_event.type == "mousedown") {
                g_all_pog_flag = "N";
            }
            g_pog_index = parseInt(g_canvas.getAttribute("data-indx"));
            if (g_pog_index == null) {
                g_pog_index = 0;
            }
        } else {
            var canvas_drag = p_event.target;
        }

        if (g_scene_objects.length > 0) {
            if (typeof g_scene_objects[g_pog_index] !== "undefined") {
                g_scene = g_scene_objects[g_pog_index].scene;
                g_camera = g_scene.children[0];
                g_world = g_scene.children[2];
                g_renderer = g_scene_objects[g_pog_index].renderer;
                if (typeof g_pog_json[g_pog_index] !== "undefined" && g_all_pog_flag == "N") {
                    // $s("P193_OPEN_POG_CODE", g_pog_json[g_pog_index].POGCode);
                    //$s("P193_OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
                    $s(g_page_no + "OPEN_POG_CODE", g_pog_json[g_pog_index].POGCode);
                    $s(g_page_no + "OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
                }

                if (typeof g_scene_objects[g_pog_index].Indicators !== "undefined") {
                    g_show_fixel_label = g_scene_objects[g_pog_index].Indicators.FixelLabel;
                    g_show_item_label = g_scene_objects[g_pog_index].Indicators.ItemLabel;
                    g_show_notch_label = g_scene_objects[g_pog_index].Indicators.NotchLabel;
                    g_show_max_merch = g_scene_objects[g_pog_index].Indicators.MaxMerch;
                    g_show_item_color = g_scene_objects[g_pog_index].Indicators.ItemColor;
                    g_show_item_desc = g_scene_objects[g_pog_index].Indicators.ItemDesc;
                    g_show_live_image = g_scene_objects[g_pog_index].Indicators.LiveImage;
                    g_show_days_of_supply = g_scene_objects[g_pog_index].Indicators.DaysOfSupply;
                    g_overhung_shelf_active = g_scene_objects[g_pog_index].Indicators.OverhungShelf; //ASA-1138
                    g_itemSubLabelInd = g_scene_objects[g_pog_index].Indicators.ItemSubLabelInd; //ASA-1182
                    g_itemSubLabel = g_scene_objects[g_pog_index].Indicators.ItemSubLabel; //ASA-1182
                }

                if (p_event.type == "mousedown" || p_event.type == "contextmenu" || p_event.type == "dblclick") {
                    var canvas_id = g_canvas.getAttribute("id");
                    $("[data-pog]").removeClass("multiPogList_active");
                    $(".canvas_highlight").removeClass("canvas_highlight");
                    $("#" + canvas_id + "-btns").addClass("canvas_highlight");
                    $("[data-indx=" + g_pog_index + "]").addClass("multiPogList_active");
                    g_all_pog_flag = "N";
                }
            }
        }
    }
}

//this function is used when minimize and maximize or close button when open more than one POG in same page. 
//This will set the opened POG details into global variables.
function set_select_canvas(p_pog_index) {
    if (g_scene_objects.length > 0) {
        if (typeof g_scene_objects[p_pog_index] !== "undefined") {
            g_scene = g_scene_objects[p_pog_index].scene;
            g_camera = g_scene.children[0];
            g_world = g_scene.children[2];
            g_renderer = g_scene_objects[p_pog_index].renderer;
            // $s("P193_OPEN_POG_CODE", g_pog_json[p_pog_index].POGCode);
            // $s("P193_OPEN_POG_VERSION", g_pog_json[p_pog_index].Version);
            $s(g_page_no + "OPEN_POG_CODE", g_pog_json[g_pog_index].POGCode);
            $s(g_page_no + "OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
            if (typeof g_scene_objects[p_pog_index].Indicators !== "undefined") {
                g_show_fixel_label = g_scene_objects[p_pog_index].Indicators.FixelLabel;
                g_show_item_label = g_scene_objects[p_pog_index].Indicators.ItemLabel;
                g_show_notch_label = g_scene_objects[p_pog_index].Indicators.NotchLabel;
                g_show_max_merch = g_scene_objects[p_pog_index].Indicators.MaxMerch;
                g_show_item_color = g_scene_objects[p_pog_index].Indicators.ItemColor;
                g_show_item_desc = g_scene_objects[p_pog_index].Indicators.ItemDesc;
                g_show_live_image = g_scene_objects[p_pog_index].Indicators.LiveImage;
                g_show_days_of_supply = g_scene_objects[p_pog_index].Indicators.DaysOfSupply;
                g_overhung_shelf_active = g_scene_objects[p_pog_index].Indicators.OverhungShelf; //ASA-1138
                g_itemSubLabelInd = g_scene_objects[g_pog_index].Indicators.ItemSubLabelInd; //ASA-1182
                g_itemSubLabel = g_scene_objects[g_pog_index].Indicators.ItemSubLabel; //ASA-1182
            }

            if (typeof g_canvas_objects[p_pog_index] !== "undefined") {
                var canvas_id = g_canvas_objects[p_pog_index].getAttribute("id");
                $("[data-pog]").removeClass("multiPogList_active");
                $(".canvas_highlight").removeClass("canvas_highlight");
                $("#" + canvas_id + "-btns").addClass("canvas_highlight");
                $("[data-indx=" + p_pog_index + "]").addClass("multiPogList_active");
                g_all_pog_flag = "N";
            }
        }
    }
}

async function appendMultiCanvasRowCol(p_pog_count, p_type =  $v(g_page_no + "POGCR_TILE_VIEW"), p_appendFlag = "N", p_compareWith) {
    debugger;
    console.log("dynamic rows cols");
    if (p_type == "H") {
        $(".viewH").addClass("view_active");
        $(".viewV").removeClass("view_active");
    } else {
        $(".viewV").addClass("view_active");
        $(".viewH").removeClass("view_active");
    }
    g_windowHeight = window.innerHeight - 167;
    // g_windowWidth = window.innerWidth - (side_nav_width + btn_cont_width);

    //.css('width',windowWidth)
    $("#canvas-holder .container").css("height", g_windowHeight + "px")
    var containerH = $("#canvas-holder .container").height();;
    var containerW = $("#canvas-holder .container").width();
     console.log('appendMultiCanvasRowCol: p_pog_count=', p_pog_count, 'p_type=', p_type, 'containerH=', containerH, 'containerW=', containerW);
    var rowCount = 1,
        colCount = 1,
        calcFlag = "Y",
        pogCount = 0;
    var currColCount,
        pendingPogCount = p_pog_count,
        compareApended = 0;

    var divs = [];
    $("[data-col]").each(function () {
        var element = $(this)[0];
        divs.push(element);
    });
    if (p_pog_count <= 3) {
        calcFlag = "N";
        currColCount = p_pog_count;

        colCount = p_pog_count;
    } else if (p_pog_count == 4) {
        calcFlag = "N";
        currColCount = 2;

        colCount = 2;
        rowCount = 2;
    } else if (p_pog_count == 5 || p_pog_count == 6 || p_pog_count == 9) {
        colCount = 3;
        rowCount = Math.ceil(p_pog_count / colCount);
    } else if (p_pog_count == 7 || p_pog_count == 8 || p_pog_count == 10 || p_pog_count == 11 || p_pog_count == 12 || p_pog_count == 16) {
        colCount = 4;
        rowCount = Math.ceil(p_pog_count / colCount);
    } else if (p_pog_count == 13 || p_pog_count == 14 || p_pog_count == 15 || p_pog_count == 17 || p_pog_count == 18 || p_pog_count == 19 || p_pog_count == 20) {
        colCount = 5;
        rowCount = Math.ceil(p_pog_count / colCount);
    } else {
        colCount = 5;
        rowCount = 5;
    }

    $("#canvas-holder .container").html("");
    // g_canvas_objects = [];
    // g_scene_objects = [];
    if (p_type == "H") {
        $("#canvas-holder .container").addClass("h-view").removeClass("v-view");
    } else {
        $("#canvas-holder .container").addClass("v-view").removeClass("h-view");
    }
    for (var i = 1; i <= rowCount; i++) {
        $("#canvas-holder .container").append('<div class="row" data-row="' + i + '"></div>');

        if (calcFlag == "Y") {
            var res = pendingPogCount % (rowCount - i + 1);
            if (res > 0) {
                currColCount = colCount;
            } else {
                currColCount = pendingPogCount / (rowCount - i + 1);
                calcFlag = "N";
            }
            pendingPogCount = pendingPogCount - currColCount; //colCount;
        }
        for (var j = 1; j <= currColCount; j++) {
            var pogNo = pogCount == 0 ? "" : pogCount + 1;
            var canvasName = "maincanvas" + pogNo;

            if (p_appendFlag == "Y") {
                if (p_compareWith == pogCount - 1) {
                    $("[data-row=" + i + "]").append('<div class="canvas-content" id="' + canvasName + '-container" data-col="' + j + '" style="height:' + parseFloat((containerH / rowCount).toFixed(2)) + "px;width:" + parseFloat((containerW / currColCount).toFixed(2)) + 'px"><div class="canvas-buttons" id="' + canvasName + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + pogCount + ')"></span><span class="fa fa-window-maximize canvas-max" onClick="maximizePog(' + pogCount + ')"></span><span class="fa fa-minus canvas-min" onClick="minimizePog(' + pogCount + ')"></span></div><canvas class="canvasregion" data-canvas=true id="' + canvasName + '" ></canvas></div>');
                    compareApended = 1;
                    //ASA-1986  START
                    try {
                        var el = document.getElementById(canvasName);
                        if (el) {
                            el.setAttribute('data-indx', pogCount);
                            if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
                        }
                    } catch (e) {}
                     //ASA-1986  end
                } else {
                    var currElmPos = pogCount - compareApended;
                    var currElm = divs[currElmPos];

                    $(currElm).attr("id", canvasName + "-container");
                    $("[data-row=" + i + "]").append(currElm);

                    var currElmId = $(currElm).attr("id");

                    $("[data-row=" + i + "] #" + currElmId)
                        .css("height", parseFloat((containerH / rowCount).toFixed(2)))
                        .css("width", parseFloat((containerW / currColCount).toFixed(2)))
                        .attr("data-col", j);

                    $("[data-row=" + i + "] #" + currElmId + " .canvas-buttons").attr("id", canvasName + "-btns");
                    $("[data-row=" + i + "] #" + currElmId + " .canvasregion").attr("id", canvasName);
                      //ASA-1986  START
                    try {
                        var el = document.getElementById(canvasName);
                        if (el) {
                            el.setAttribute('data-indx', pogCount);
                            if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
                        }
                    } catch (e) {}
                       //ASA-1986  end
                }
            } else {
                var buttonHtml = "";
                if (p_pog_count > 1) {
                    buttonHtml = '<div class="canvas-buttons" id="maincanvas' + pogNo + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + pogCount + ')"></span><span class="fa fa-window-maximize canvas-max" onClick="maximizePog(' + pogCount + ')"></span><span class="fa fa-minus canvas-min" onClick="minimizePog(' + pogCount + ')"></span></div>';
                }
                $("[data-row=" + i + "]").append('<div class="canvas-content" id="maincanvas' + pogNo + '-container" data-col="' + j + '" style="height:' + parseFloat((containerH / rowCount).toFixed(2)) + "px;width:" + parseFloat((containerW / currColCount).toFixed(2)) + 'px">' + buttonHtml + '<canvas class="canvasregion" data-canvas=true id="maincanvas' + pogNo + '" ></canvas></div>');
                         //ASA-1986  START
                 try {
                    var el = document.getElementById(canvasName);
                    if (el) {
                        el.setAttribute('data-indx', pogCount);
                        if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
                    }
                } catch (e) {}
                  //ASA-1986  end
            }
            pogCount++;
        }
    }
    if (p_appendFlag == "Y") {
        var incr = 0;
        for (var i = 1; i <= g_pog_json.length; i++) {
            if (i !== 2) {
                const pRenderer = g_renderer; //g_scene_objects[i - 1 - incr].renderer;
                const pScene = g_scene_objects[i - 1 - incr].scene;
                const pCamera = g_scene_objects[i - 1 - incr].scene.children.find((obj) => {
                    return obj.type === "PerspectiveCamera";
                });
                var canvasName = "maincanvas" + (i == 1 ? "" : i);
                var canvasContainerH = $("#" + canvasName)
                    .parent()
                    .height();
                var canvasContainerW = $("#" + canvasName)
                    .parent()
                    .width();
                var canvasBtns = $("#" + canvasName + "-btns")[0];
                var canvasBtns_height = canvasBtns.offsetHeight;
                var canvasWidthOrg = canvasContainerW;
                var canvasHeightOrg = canvasContainerH - canvasBtns_height;

                var pTanFOV = Math.tan(((Math.PI / 180) * pCamera.fov) / 2);
                pCamera.aspect = canvasWidthOrg / canvasHeightOrg;
                pCamera.fov = (360 / Math.PI) * Math.atan(pTanFOV);
                pCamera.updateProjectionMatrix();
                pRenderer.setSize(canvasWidthOrg, canvasHeightOrg);
                //pRenderer.render(pScene, pCamera);
                render(i);
            } else if (i == 2) {
                incr = 1;
            }
        }
    }
    makeResizableRow(); // Task 22510
}

async function switchCanvasView(p_view, p_product_list_check = "N") {
    var containerH,
        containerW,
        renderFlag = "Y",
        rowCount,
        old_pogIndex = g_pog_index,
        colCount;
    rowCount = $("[data-row]").length;
    colCount = $("[data-col]").length;
    if ($(".a-Splitter-thumb").attr("title") == "Collapse") {
        p_product_list_check = "Y";
    }
    // [Task_22091], Start
    var drawRegW = $("#drawing_region").width();
    var sidebarW = $("#side_bar").width();
    containerW = drawRegW - sidebarW;
    containerH = $("#canvas-holder .container").height();
    $s(g_page_no + "POGCR_TILE_VIEW", p_view);
    // [Task_22091], End
    if (p_view == "H" && (($("#canvas-holder .container").hasClass("v-view") && p_product_list_check == "N") || p_product_list_check == "Y")) {
        $("#canvas-holder .container").css("display", "flex").addClass("h-view").removeClass("v-view");
        $(".viewH").addClass("view_active");
        $(".viewV").removeClass("view_active");

        for (var i = 1; i <= rowCount; i++) {
            var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
            $("[data-row=" + i + "] .canvas-content")
                .css("height", parseFloat((containerH / currColCOunt).toFixed(2)))
                .css("width", parseFloat((containerW / rowCount).toFixed(2)));
        }
    } else if (p_view == "V" && (($("#canvas-holder .container").hasClass("h-view") && p_product_list_check == "N") || p_product_list_check == "Y")) {
        $("#canvas-holder .container").css("display", "grid").addClass("v-view").removeClass("h-view");
        $(".viewV").addClass("view_active");
        $(".viewH").removeClass("view_active");

        for (var i = 1; i <= rowCount; i++) {
            var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
            $("[data-row=" + i + "] .canvas-content")
                .css("height", parseFloat((containerH / rowCount).toFixed(2)))
                .css("width", parseFloat((containerW / currColCOunt).toFixed(2)));
        }
    } else {
        renderFlag = "N";
    }
    if (renderFlag == "Y") {
        if (g_pog_json.length > 0) {
            //20240708 Regression issue 5
            g_canvas_objects = [];
            for (var i = 1; i <= g_pog_json.length; i++) {
                const pRenderer = g_renderer; //g_scene_objects[i - 1].renderer;
                const pScene = g_scene_objects[i - 1].scene;
                const pCamera = g_scene_objects[i - 1].scene.children.find((obj) => {
                    return obj.type === "PerspectiveCamera";
                });
                var canvasName = "maincanvas" + (i == 1 ? "" : i);
                g_canvas = document.getElementById(canvasName);
                var canvasContainerH = $("#" + canvasName)
                    .parent()
                    .height();
                var canvasContainerW = $("#" + canvasName)
                    .parent()
                    .width();
                var canvasBtns = $("#" + canvasName + "-btns")[0];
                var canvasBtns_height = g_scene_objects.length > 1 ? canvasBtns.offsetHeight : 0;
                var canvasWidthOrg = canvasContainerW;
                var canvasHeightOrg = canvasContainerH - canvasBtns_height;

                $("#" + canvasName)
                    .css("height", canvasHeightOrg + "px !important")
                    .css("width", canvasWidthOrg + "px !important");
                $("#" + canvasName).height(canvasHeightOrg); //ASA-1107
                $("#" + canvasName).width(canvasWidthOrg); //ASA-1107

                g_canvas.width = canvasWidthOrg;
                g_canvas.height = canvasHeightOrg;
                g_canvas_objects.push($("#" + canvasName)[0]);

                var pTanFOV = Math.tan(((Math.PI / 180) * pCamera.fov) / 2);
                pCamera.aspect = canvasWidthOrg / canvasHeightOrg;
                pCamera.fov = (360 / Math.PI) * Math.atan(pTanFOV);
                pCamera.updateProjectionMatrix();
                pRenderer.setSize(canvasWidthOrg, canvasHeightOrg);
                var details = get_min_max_xy(i - 1);
                var details_arr = details.split("###");
                set_camera_z(pCamera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, i - 1);
                //pRenderer.render(pScene, pCamera);
                g_pog_index = i - 1;
                g_scene = pScene;
                g_camera = pCamera;
                render(i - 1);
            }
        } //20240708 Regression issue 5
    }
    g_pog_index = old_pogIndex;
}

function generateCanvasListHolder(p_pog_json) {
	$("#canvas-list-holder").html("");
	if (p_pog_json.length > 0) {
		$("#canvas-list-holder").css({
			display: "flex",
			width: "auto",
		});
		$("#canvas-list-holder").append('<div class="canvas-holder-div"><span class="canvas-holder-code expand-tab" onclick="expandAllPog()">' + g_expand_all_pog + "</span></div>");

		for (i = 0; i < p_pog_json.length; i++) {
			console.log("generage", i);
			$("#canvas-list-holder").append('<div class="canvas-holder-div"><span class="canvas-holder-code">' + p_pog_json[i].POGCode + '</span><span class="fa fa-window-arrow-up canvas-expand" onClick=expandPog(' + i + ')></span><span class="fa fa-window-maximize canvas-max" onclick="maximizePog(' + i + ', 0)"></span><span class="fa fa-close canvas-close" onclick="closePog(' + i + ', 0)"></span></div>');
		}
		if ($("#canvas-list-holder").width() >= window.innerWidth) {
			$("#canvas-list-holder").css("width", "100%");
		}
	} else {
		$("#canvas-list-holder").css({
			display: "none",
			width: "auto",
		});
	}
}

//This function is assigned to event mousewheel.  this is majorly used to zoom in and out when ctrl key is pressed and do mouse scroll.
function onDocumentMouseWheel(p_event) {
    logDebug("function : onDocumentMouseWheel", "S");
    var jselector = g_canvas.getAttribute("id");
    console.log("jselector", jselector, p_event.target.nodeName, p_event.ctrlKey);
    if (p_event.target.nodeName == "CANVAS") {
        if (p_event.ctrlKey) {
            g_duplicating = "N";
            p_event.preventDefault();
            p_event.stopPropagation();
            g_manual_zoom_ind = "Y";
            var r = g_canvas.getBoundingClientRect();
            var x = p_event.clientX - r.left;
            var y = p_event.clientY - r.top;
            // var factor = parseFloat($v("P193_POGCR_CAMERA_ZOOM_FACTOR"));
            var factor = parseFloat($v(g_page_no + "POGCR_CAMERA_ZOOM_FACTOR"));
            var width = g_canvas.width / window.devicePixelRatio;
            var height = g_canvas.height / window.devicePixelRatio;
            var mX = (2 * x) / width - 1;
            var mY = 1 - (2 * y) / height;
            var vector = new THREE.Vector3(mX, mY, p_event.deltaY / 500);
            vector.unproject(g_camera);
            vector.sub(g_camera.position);
            if (p_event.deltaY < 0) {
                $(jselector).css("cursor", "zoom-in");
                g_camera.position.addVectors(g_camera.position, vector.setLength(factor));
            } else {
                $(jselector).css("cursor", "zoom-out");
                g_camera.position.subVectors(g_camera.position, vector.setLength(factor));
            }
            render(g_pog_index);
        } else {
            if (g_manual_zoom_ind == "Y") {
                // var scroll_interval = parseFloat($v("P193_POGCR_WHEEL_UP_DOWN_INTER"));
                var scroll_interval = parseFloat($v(g_page_no + "POGCR_WHEEL_UP_DOWN_INTER"));

                if (p_event.deltaY < 0) {
                    //up
                    g_camera.position.set(g_camera.position.x, g_camera.position.y + scroll_interval, g_camera.position.z);
                } else if (p_event.deltaY > 0) {
                    //down
                    g_camera.position.set(g_camera.position.x, g_camera.position.y - scroll_interval, g_camera.position.z);
                }
                render(g_pog_index);
            }
        }
    }
    logDebug("function : onDocumentMouseWheel", "E");
}

function set_indicator_objects(p_pog_index) {
    var ind_objects = {};
    ind_objects["FixelLabel"] = g_show_fixel_label;
    ind_objects["ItemLabel"] = g_show_item_label;
    ind_objects["NotchLabel"] = g_show_notch_label;
    ind_objects["MaxMerch"] = g_show_max_merch;
    ind_objects["ItemColor"] = g_show_item_color;
    ind_objects["ItemDesc"] = g_show_item_desc;
    ind_objects["LiveImage"] = g_show_live_image;
    ind_objects["DaysOfSupply"] = g_show_days_of_supply;
    ind_objects["OverhungShelf"] = g_overhung_shelf_active; //ASA-1138
    ind_objects["ItemSubLabelInd"] = g_itemSubLabelInd; //ASA-1182
    ind_objects["ItemSubLabel"] = g_itemSubLabel; //ASA-1182
    g_scene_objects[p_pog_index].Indicators = ind_objects;
}

//This function will fire on event onwindowresize. this will check if the devicepixelratio is changed from previous. will try to recreated the 
//POG according to new screen ratio.
async function onWindowResize(p_event) {
    logDebug("function : onWindowResize", "S");
    try {
        var header = document.getElementById("t_Header");
        var breadcrumb = document.getElementById("t_Body_title");
        var top_bar = document.getElementById("top_bar");
        var side_nav = document.getElementById("t_Body_nav");
        var button_cont = document.getElementById("side_bar");
        var devicePixelRatio = window.devicePixelRatio;

        var header_height = header.offsetHeight * devicePixelRatio;
        var breadcrumb_height = breadcrumb.offsetHeight * devicePixelRatio;
        var top_bar_height = top_bar.offsetHeight * devicePixelRatio;
        var side_nav_width = side_nav.offsetWidth * devicePixelRatio;
        var btn_cont_width = button_cont.offsetWidth * devicePixelRatio;
        var padding = parseFloat($(".t-Body-contentInner").css("padding-left").replace("px", ""));
        if (devicePixelRatio > 2.5) {
            g_windowHeight = window.innerHeight - (header_height + breadcrumb_height + top_bar_height / 2);
            windowWidth = window.innerWidth - (side_nav_width + btn_cont_width + padding);
        } else {
            g_windowHeight = window.innerHeight - (header_height + breadcrumb_height + top_bar_height + top_bar_height + 10);
            windowWidth = window.innerWidth - (side_nav_width + btn_cont_width + padding + 10);
        }
        g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);
        var devicePixelRatio = window.devicePixelRatio;
        console.log(" resizing ", g_start_pixel_ratio, devicePixelRatio);

        //g_start_pixel_ratio will hold the devicepixelration when the POG was opened and also set this after ratio change.
        if (g_start_pixel_ratio !== devicePixelRatio) {
            var TEMP_POG = JSON.parse(JSON.stringify(g_pog_json));
            g_pog_json = [];
            //reset all the canvas with new ratio.
            // appendMultiCanvasRowCol(TEMP_POG.length, $v("P193_POGCR_TILE_VIEW"));
            appendMultiCanvasRowCol(TEMP_POG.length, $v(g_page_no + "POGCR_TILE_VIEW"));

            g_pog_index = 0;
            g_multi_pog_json = [];
            g_scene_objects = [];
            g_canvas_objects = [];
            addLoadingIndicator();
            //loop through all the POG and recreate them in resized canvas.
            for (var p = 0; p <= TEMP_POG.length - 1; p++) {
                g_pog_index = p;
                init(p);
                objects = {};
                objects["scene"] = g_scene;
                objects["renderer"] = g_renderer;
                g_scene_objects.push(objects);
                //var return_val = await create_module_from_json(TEMP_POG, sessionStorage.getItem("new_pog_ind"), "F", $v("P193_PRODUCT_BTN_CLICK"), sessionStorage.getItem("pog_opened"), "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
                var return_val = await create_module_from_json(TEMP_POG, sessionStorage.getItem("new_pog_ind"), "F", $v(g_page_no + "PRODUCT_BTN_CLICK"), sessionStorage.getItem("pog_opened"), "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
                g_pog_index = p;
                render(p);
                animate_pog(p);
            }
            removeLoadingIndicator(regionloadWait);
            g_pog_json = g_multi_pog_json;
        }
        g_renderer.render(g_scene, g_camera);
        logDebug("function : onWindowResize", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is used in the mousedown function. this is crucial function to find out the object that is hit on the mouse pointer
//and setting all basic global variables of which is that object. module or shelf or item etc looping through g_pog_json.
function get_object_identity(p_pog_index, p_multiSelect, p_multiCopydone, p_a, p_y) {
    logDebug("function : get_object_identity", "S");
    try {
        //checking which object has been clicked for drag or delete.
        var i = 0;
        for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
            if (g_carpark_edit_flag == "Y") {
                break; //return false;
            }
            if (modules.ParentModule == null && typeof modules.Carpark !== "undefined" && modules.Carpark.length > 0) {
                if (modules.Carpark[0].ItemInfo.length > 0) {
                    var j = 0;
                    for (const carparks of modules.Carpark) {
                        if (carparks.SObjID == g_objectHit_id) {
                            g_module_index = i;
                            g_shelf_index = j;
                            g_carpark_edit_flag = "Y";
                            break; //return false;
                        } else {
                            g_carpark_edit_flag = "N";
                        }
                        j++;
                    }
                }
            }
            i++;
        }
        if (g_carpark_edit_flag == "N") {
            var i = 0;
            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
                    //ASA-1085
                    if (modules.MObjID == g_objectHit_id && modules.ParentModule == null) {
                        g_module_index = i;
                        g_module_cnt = i;
                        g_module_width = modules.W;
                        g_module_X = modules.X;
                        g_module_edit_flag = "Y";
                        comp_obj_id = modules.CompMObjID;
                        g_wireframe_id = modules.WFrameID;
                        // apex.item("P193_MODULE_DISP").setValue(modules.Module);
                        apex.item(g_page_no + "MODULE_DISP").setValue(modules.Module);                        
                        break; //return false;
                    } else {
                        g_module_edit_flag = "N";
                    }
                } else {
                    if (modules.CompMObjID == g_objectHit_id && modules.ParentModule == null) {
                        g_module_index = i;
                        g_module_cnt = i;
                        g_module_width = modules.W;
                        g_module_X = modules.X;
                        g_module_edit_flag = "Y";
                        comp_obj_id = modules.MObjID;
                        g_wireframe_id = modules.WFrameID;
                        // apex.item("P193_MODULE_DISP").setValue(modules.Module);
                        apex.item(g_page_no + "MODULE_DISP").setValue(modules.Module);        
                        break; //return false;
                    } else {
                        g_module_edit_flag = "N";
                    }
                }
                i++;
            }
        }

        if (g_module_edit_flag == "N" && g_carpark_edit_flag == "N") {
            var j = 0;
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (g_shelf_edit_flag == "Y") {
                    break; //return false;
                }
                if (Modules.ParentModule == null) {
                    $.each(Modules.ShelfInfo, function (i, Shelf) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                            if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
                                //ASA-1085
                                if (Shelf.SObjID == g_objectHit_id) {
                                    g_module_index = j;
                                    g_shelf_index = i;
                                    g_shelf_max_merch = Shelf.MaxMerch;
                                    g_shelf_basket_spread = Shelf.BsktSpreadProduct;
                                    g_shelf_edit_flag = "Y";
                                    g_wireframe_id = Shelf.WFrameID;
                                    g_shelf_object_type = Shelf.ObjType;
                                    comp_obj_id = Shelf.CompShelfObjID;
                                    g_rotation = Shelf.Rotation;
                                    if (Shelf.Slope > 0) {
                                        g_slope = 0 - Shelf.Slope;
                                    } else if (Shelf.Slope < 0) {
                                        g_slope = -Shelf.Slope;
                                    } else {
                                        g_slope = 0;
                                    }
                                    return false;
                                } else {
                                    g_shelf_edit_flag = "N";
                                }
                            } else {
                                if (Shelf.CompShelfObjID == g_objectHit_id) {
                                    g_module_index = j;
                                    g_shelf_index = i;
                                    g_shelf_max_merch = Shelf.MaxMerch;
                                    g_shelf_edit_flag = "Y";
                                    g_wireframe_id = Shelf.WFrameID;
                                    g_shelf_object_type = Shelf.ObjType;
                                    g_shelf_basket_spread = Shelf.BsktSpreadProduct;
                                    g_rotation = Shelf.Rotation;
                                    comp_obj_id = Shelf.SObjID;
                                    if (Shelf.Slope > 0) {
                                        g_slope = 0 - Shelf.Slope;
                                    } else if (Shelf.Slope < 0) {
                                        g_slope = -Shelf.Slope;
                                    } else {
                                        g_slope = 0;
                                    }
                                    return false;
                                } else {
                                    g_shelf_edit_flag = "N";
                                }
                            }
                        }
                    });
                }
                j++;
            }
        }
        if (g_shelf_edit_flag == "N" && g_module_edit_flag == "N" && g_carpark_edit_flag == "N") {
            var k = 0;
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (g_item_edit_flag == "Y") {
                    break; //return false;
                }
                if (Modules.ParentModule == null) {
                    if (typeof Modules.Carpark !== "undefined" && typeof Modules.Carpark[0] !== "undefined" && Modules.Carpark.length > 0) {
                        if (Modules.Carpark[0].ItemInfo.length > 0) {
                            var j = 0;
                            for (const items of Modules.Carpark[0].ItemInfo) {
                                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
                                    //ASA-1085
                                    if (items.ObjID == g_objectHit_id) {
                                        g_module_index = k;
                                        g_shelf_index = 0;
                                        g_item_index = j;
                                        g_item_edit_flag = "Y";
                                        g_shelf_object_type = Modules.Carpark[0].ObjType;
                                        g_wireframe_id = items.WFrameID;
                                        comp_obj_id = items.CompItemObjID;
                                        g_carpark_item_flag = "Y";
                                        break; //return false;
                                    } else {
                                        g_item_edit_flag = "N";
                                    }
                                } else {
                                    if (items.ObjID == g_objectHit_id) {
                                        g_module_index = k;
                                        g_shelf_index = 0;
                                        g_item_index = j;
                                        g_item_edit_flag = "Y";
                                        g_shelf_object_type = Modules.Carpark[0].ObjType;
                                        g_wireframe_id = items.WFrameID;
                                        comp_obj_id = items.ObjID;
                                        g_carpark_item_flag = "Y";
                                        break; //return false;
                                    } else {
                                        g_item_edit_flag = "N";
                                    }
                                }
                                j++;
                            }
                        }
                    }
                    var i = 0;
                    for (const Shelf of Modules.ShelfInfo) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            if (g_item_edit_flag == "Y") {
                                break; //return false;
                            }
                            var j = 0;
                            for (const items of Shelf.ItemInfo) {
                                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET" || g_compare_view == "PREV_VERSION") {
                                    //ASA-1085
                                    if (items.ObjID == g_objectHit_id) {
                                        g_module_index = k;
                                        g_shelf_index = i;
                                        g_item_index = j;
                                        g_item_edit_flag = "Y";
                                        g_shelf_object_type = Shelf.ObjType;
                                        g_wireframe_id = items.WFrameID;
                                        comp_obj_id = items.CompItemObjID;
                                        break; //return false;
                                    } else {
                                        g_item_edit_flag = "N";
                                    }
                                } else {
                                    if (items.CompItemObjID == g_objectHit_id) {
                                        g_module_index = k;
                                        g_shelf_index = i;
                                        g_item_index = j;
                                        g_item_edit_flag = "Y";
                                        comp_obj_id = items.ObjID;
                                        g_shelf_object_type = Shelf.ObjType;
                                        g_wireframe_id = items.WFrameID;
                                        break; //return false;
                                    } else {
                                        g_item_edit_flag = "N";
                                    }
                                }
                                j++;
                            }
                        }
                        i++;
                    }
                }
                k++;
            }
        }
        //Note: we always populate g_delete_details with even single click to maintain the common behaviour.
        if (p_multiSelect == "N" && p_multiCopydone == "N") {
            // Task 21828
            g_delete_details = [];
            var Module = g_pog_json[p_pog_index].ModuleInfo[g_module_index];
            if (g_shelf_index !== -1 && g_item_index == -1 && g_carpark_item_flag == "N") {
                var Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                var details = {};
                details["ObjID"] = Shelf.SObjID;
                details["MIndex"] = g_module_index;
                details["SIndex"] = g_shelf_index;
                details["ObjWidth"] = Shelf.W;
                details["ObjHeight"] = Shelf.H;
                details["XAxis"] = Shelf.X;
                details["YAxis"] = Shelf.Y;
                details["ZAxis"] = Shelf.Z;
                details["IIndex"] = -1;
                details["ObjType"] = Shelf.ObjType;
                details["IsDivider"] = "N";
                details["Object"] = "SHELF";
                details["MObjID"] = Module.MObjID;
                details["SObjID"] = Shelf.SObjID;
                details["ItemID"] = Shelf.Shelf; //ASA-1471 issue 1
                details["Item"] = "";
                details["Exists"] = "N";
                details["Rotation"] = Shelf.Rotation;
                details["Slope"] = Shelf.Slope;
                details["Distance"] = 0;
                details["TopObjID"] = "";
                details["BottomObjID"] = "";
                details["StartCanvas"] = g_start_canvas;
                details["g_present_canvas"] = g_present_canvas;
                details["p_pog_index"] = p_pog_index;
                //ASA-1471 issue 1 S
                details["W"] = Shelf.W;
                details["H"] = Shelf.H;
                details["D"] = Shelf.D;
                details["AllowAutoCrush"] = Shelf.AllowAutoCrush;
                details["Rotation"] = Shelf.Rotation;
                details["Slope"] = Shelf.Slope;
                details["Color"] = Shelf.Color;
                details["Combine"] = Shelf.Combine;
                details["LOverhang"] = Shelf.LOverhang;
                details["ROverhang"] = Shelf.ROverhang;
                details["DivHeight"] = typeof Shelf.DivHeight == "undefined" ? 0 : Shelf.DivHeight;
                details["DivWidth"] = typeof Shelf.DivWidth == "undefined" ? 0 : Shelf.DivWidth;
                details["DivPst"] = typeof Shelf.DivPst == "undefined" ? "N" : Shelf.DivPst;
                details["DivPed"] = typeof Shelf.DivPed == "undefined" ? "N" : Shelf.DivPed;
                details["DivPbtwFace"] = typeof Shelf.DivPbtwFace == "undefined" ? "N" : Shelf.DivPbtwFace;
                details["NoDivIDShow"] = Shelf.NoDivIDShow;
                details["DivFillCol"] = typeof Shelf.DivFillCol == "undefined" ? "#3D393D" : Shelf.DivFillCol;
                details["SpreadItem"] = Shelf.SpreadItem;
                details["MaxMerch"] = Shelf.MaxMerch;
                //ASA-1471 issue 1 E
                //ASA-1669 Start
                details["FBold"] = Shelf.FBold;
                details["FSize"] = Shelf.FSize;
                details["FStyle"] = Shelf.FStyle;
                details["InputText"] = Shelf.InputText;
                details["TextImg"] = Shelf.TextImg;
                details["TextImgMime"] = Shelf.TextImgMime;
                details["TextImgName"] = Shelf.TextImgName;
                details["ReduceToFit"] = Shelf.ReduceToFit;
                details["TextDirection"] = Shelf.TextDirection;
                details["WrapText"] = Shelf.WrapText;
                //ASA-1669 End
                g_delete_details.multi_delete_shelf_ind = "";
                g_delete_details.push(details);
            } else if (g_shelf_index !== -1 && g_item_index !== -1 && g_carpark_item_flag == "N") {
                var Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                var Item = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
                var details = {};
                var is_divider = "N";
                var object = "ITEM";
                if (Item.Item == "DIVIDER") {
                    is_divider = "Y";
                    object = "SHELF";
                }
                details["ObjID"] = Item.ObjID;
                details["MIndex"] = g_module_index;
                details["SIndex"] = g_shelf_index;
                details["ObjWidth"] = Item.W;
                details["ObjHeight"] = Item.H;
                details["XAxis"] = Item.X;
                details["YAxis"] = Item.Y;
                details["ZAxis"] = Item.Z;
                details["IIndex"] = g_item_index;
                details["ObjType"] = Shelf.ObjType;
                details["IsDivider"] = is_divider;
                details["Object"] = object;
                details["MObjID"] = Module.MObjID;
                details["SObjID"] = Shelf.SObjID;
                details["ItemID"] = Item.ItemID;
                details["Item"] = Item.Item;
                details["W"] = Item.W;
                details["H"] = Item.H;
                details["X"] = Item.X;
                details["Y"] = Item.Y;
                details["Exists"] = "N";
                details["Rotation"] = 0;
                details["Slope"] = 0;
                details["Distance"] = Item.Distance;
                details["TopObjID"] = Item.TopObjID;
                details["BottomObjID"] = Item.BottomObjID;
                details["StartCanvas"] = g_start_canvas;
                details["g_present_canvas"] = g_present_canvas;
                details["p_pog_index"] = p_pog_index;
                details["Color"] = Item.Color; //20240806
                //ASA-1471 issue 13 S
                if (Item.Item == "DIVIDER") {
                    details["DivHeight"] = typeof Item.DivHeight == "undefined" ? 0 : Item.DivHeight;
                    details["DivWidth"] = typeof Item.DivWidth == "undefined" ? 0 : Item.DivWidth;
                    details["DivPst"] = typeof Item.DivPst == "undefined" ? "N" : Item.DivPst;
                    details["DivPed"] = typeof Item.DivPed == "undefined" ? "N" : Item.DivPed;
                    details["DivPbtwFace"] = typeof Item.DivPbtwFace == "undefined" ? "N" : Item.DivPbtwFace;
                    details["NoDivIDShow"] = Item.NoDivIDShow;
                    details["DivFillCol"] = typeof Item.DivFillCol == "undefined" ? "#3D393D" : Item.DivFillCol;
                    details["LOverhang"] = 0;
                    details["ROverhang"] = 0;
                    details["MaxMerch"] = 0;
                }
                details["D"] = Item.D;
                //ASA-1471 issue 13 E
                g_delete_details.multi_delete_shelf_ind = "";
                g_delete_details.push(details);
            } else if (g_shelf_index !== -1 && g_item_index !== -1 && g_carpark_item_flag == "Y") {
                var Carpark = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark;
                var Item = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index];
                var details = {};
                details["ObjID"] = Item.ObjID;
                details["MIndex"] = g_module_index;
                details["SIndex"] = 0;
                details["ObjWidth"] = Item.W;
                details["ObjHeight"] = Item.H;
                details["XAxis"] = Item.X;
                details["YAxis"] = Item.Y;
                details["ZAxis"] = Item.Z;
                details["IIndex"] = g_item_index;
                details["ObjType"] = Carpark.ObjType;
                details["IsDivider"] = "N";
                details["Object"] = "CARPARK_ITEM";
                details["MObjID"] = Module.MObjID;
                details["SObjID"] = Carpark.SObjID;
                details["ItemID"] = Item.ItemID;
                details["Item"] = Item.Item;
                details["W"] = Item.W;
                details["H"] = Item.H;
                details["X"] = Item.X;
                details["Y"] = Item.Y;
                details["Exists"] = "N";
                details["Rotation"] = 0;
                details["Slope"] = 0;
                details["Distance"] = Item.Distance;
                details["TopObjID"] = Item.TopObjID;
                details["BottomObjID"] = Item.BottomObjID;
                details["IsCarpark"] = "Y";
                details["StartCanvas"] = g_start_canvas;
                details["g_present_canvas"] = g_present_canvas;
                details["p_pog_index"] = p_pog_index;
                details["Color"] = Item.Color; //20240806
                g_delete_details.multi_delete_shelf_ind = "";
                g_delete_details.multi_carpark_ind = "Y";
                g_delete_details.push(details);
            }
            g_delete_details.StartCanvas = g_start_canvas;
            g_delete_details.g_present_canvas = g_present_canvas;
            update_item_xy_distance("N", p_pog_index, p_a, p_y);
        }

        logDebug("function : get_object_identity", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is called from open_existing, open_draft to get existing pog, draft pog, or template. it will get the json and create
//the skeleton.
async function getJson(p_new_pog_ind, p_pog_code, p_pog_version, p_recreate, p_create_json, p_camera, p_scene, p_canvasNo, p_imageLoadInd = "N", p_resetparam = "Y", p_pog_desc) {
    //ASA-1765 Added p_pog_desc #issue 5
    logDebug("function : getJson; new_pog_ind : " + p_new_pog_ind + "; pog_version : " + p_pog_version + "; recreate : " + p_recreate + "; create_json : " + p_create_json, "S");
    try {
        return new Promise(function (resolve, reject) {
            var process_name;
            var pog_opened = "N";
            var automate_ind = "N";
            var items_arr = [];

            if (p_new_pog_ind == "Y") {
                //getting draft POG sm_pog_design
                process_name = "GET_POG_JSON";
                pog_opened = "N";
                //$s("P193_OPEN_POG_CODE", "");
				$s(g_page_no + "OPEN_POG_CODE", "");
            } else if (p_new_pog_ind == "T") {
                //getting template from sm_pog_design
                process_name = "OPEN_TEMPLATE";
                pog_opened = "N";
                //$s("P193_OPEN_POG_CODE", "");
				$s(g_page_no + "OPEN_POG_CODE", "");
            } else {
                //getting existing pog(here it can be a pog already opened and saved in WPD so a copy of json will be saved in sm_pog_design else
                //if opening first time any pog when it will come from sm_pog, sm_pog_module,sm_pog_fixel, sm_pog_item_position)
                process_name = "GET_EXISTING_POG";
                pog_opened = "E";
                //recreate = 'N';
            }
            var seq_id = -1;
            if (p_new_pog_ind == "Y") {
                seq_id = p_pog_version;
            } else {
                seq_id = p_pog_code;
            }
            var p = apex.server.process(
                process_name,
                {
                    x01: seq_id,
                    x02: p_pog_version,
                },
                {
                    dataType: "html",
                }
            );
            // When the process is done, set the value to the page item
            p.done(function (data) {
                var processed = "Y";
                var return_data = $.trim(data);
                try {
                    g_json = JSON.parse($.trim(data));
                } catch {
                    processed = "N";
                }
                if (processed == "N") {
                    raise_error(return_data);
                    //ASA-1500
                    /*try {
                    raise_error(return_data);
                    } catch {
                    removeLoadingIndicator(regionloadWait);
                    }*/
                } else if (return_data !== "") {
                    g_json = JSON.parse($.trim(data));
                    if (p_create_json == "Y") {
                        // g_pog_json_data.push(g_json[0]);
                        g_pog_json_data.push(JSON.parse(JSON.stringify(g_json[0]))); //Regression Issue 12 05082024
                        // ASA-1924 Issue-1 Start
                        // if (typeof p_pog_desc !== "Undefined") { 
                        // 	//ASA-1765 Added if/else to set Desc7  #issue 5
                        // 	g_pog_json_data[0].Desc7 = p_pog_desc;
                        // }       
                        // ASA-1924 Issue-1 End                 
                    } else {
                        g_pog_json_data = g_pog_json;
                    }
                    if (typeof g_pog_json_data !== "undefined") {
                        //recreate the orientation view if any present
                        async function recreate_view() {
                            if (p_new_pog_ind == "Y") {
                                automate_ind = await get_draft_ind(seq_id); //ASA-1710 $v("P193_DRAFT_LIST")
                                let draftVersion = await loadDraftVersion(seq_id); //ASA-1912
                                g_pog_json_data[g_pog_index].draftVersion = draftVersion; //ASA-1912
                                if (p_new_pog_ind == "Y" && automate_ind == "Y") {
                                    pog_opened = "E";
                                    p_new_pog_ind = "N";
                                }
                            }
                            sessionStorage.setItem("new_pog_ind", p_new_pog_ind);
                            sessionStorage.setItem("pog_opened", pog_opened);
                            sessionStorage.setItem("POGExists", "Y");
                            //this function is used to set labels indicators by default BU Param.
                            // 1655 Added new param p_resetparam= 'Y' to not reset flags when called from PLANO GRAPH
                            if (p_resetparam == "Y") {
                                await setDefaultState(p_new_pog_ind);
                            }

                            //this function will create the skeleton.
                            var return_val = await create_module_from_json(g_pog_json_data, p_new_pog_ind, "F", "N", pog_opened, "N" /* Stop Loading"Y"*/, "N", p_recreate, p_create_json, p_pog_version, "Y", p_camera, p_scene, g_pog_index, p_canvasNo, p_imageLoadInd);

                            if (p_new_pog_ind == "N" && automate_ind == "Y") {
                                sessionStorage.setItem("new_pog_ind", "Y");
                            }

                            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                                backupPog("F", -1, -1, g_pog_index);
                            }
                            if (g_compare_pog_flag == "Y" && g_compare_view !== "POG") {
                                var returnval = await recreate_compare_views(g_compare_view, "N");
                            }
                            logDebug("function : getJson", "E");
                            resolve("SUCCESS");
                        }
                        recreate_view();
                    }
                    clearUndoRedoInfo();
                    g_dblclick_opened = "N";
                }
            });
            console.log("blockList", g_mod_block_list);
        });
    } catch (err) {
        error_handling(err);
    }
  //Loading block after POG load
    try {
        if (Array.isArray(g_mod_block_list) && g_mod_block_list.length > 0) {
            for (const blkDet of g_mod_block_list) {
                try {
                    // Draw only if BlockDim not present yet
                    if (typeof blkDet.BlockDim === 'undefined' || Object.keys(blkDet.BlockDim).length === 0) {
                        g_autofillModInfo = blkDet.BlkModInfo || [];
                        g_autofillShelfInfo = blkDet.BlkShelfInfo || [];
                        var retdtl = await colorAutofillBlock(blkDet["DragMouseStart"], blkDet["DragMouseEnd"], blkDet["mod_index"], blkDet["BlkColor"], blkDet["BlkName"], "U", blkDet, p_pog_index, "N");
                        blkDet["BlockDim"] = retdtl;
                    }
                } catch (innerErr) {
                    error_handling(innerErr);
                }
            }
        }
    } catch (err2) {
        error_handling(err2);
    }
   
}

//this function is used to open draft POG.
async function get_json_data(p_pog_code, p_imageLoadInd = "N", p_pog_desc) {
	//ASA-1765 added parameter p_pog_desc  #issue 5
	logDebug("function : get_json_data; pog_code : " + p_pog_code, "S");
	g_ComBaseIndex = -1;
	g_ComViewIndex = -1;
	g_compare_pog_flag = "N";
	g_compare_view = "NONE";
	g_colorBackup = "N";
	l_new_pog_ind = "N";
	var items_arr = [];
	g_pog_json_data = [];

	try {
		//if validate = 'Y' then we create only the json and then try to call item height, width, depth validation also validate shelf.
		//if found errors we suggest methods to correct them.
		if ($v(g_page_no + "POGCR_VALIDATE_POG") == "Y" && p_pog_code.length == 1) {
			init(0);
			objects = {};
			objects["scene"] = g_scene;
			objects["renderer"] = g_renderer;
			g_scene_objects.push(objects);
			set_indicator_objects(g_scene_objects.length - 1);
			g_pog_index = 0;
			// addLoadingIndicator(); //ASA-1500
			var returnval = await getJson("Y", "", p_pog_code[0], "N", "Y", g_camera, g_scene, 0, p_imageLoadInd, p_pog_desc); //ASA-1765 Added p_pog_desc  #issue 5
			var failed = "N";
			//this logic is wrong we need to call this save_validate_items_coll. but current failed variable is hardcoded to N.
			if (failed == "Y") {
				var returnval = await save_validate_items_coll(g_errored_items);
				removeLoadingIndicator(regionloadWait);
				apex.region("ig_errored_item").refresh();
				// apex.event.trigger("#P193_ERROR_METHOD", "apexrefresh");
				apex.event.trigger("#" + g_page_no + "ERROR_METHOD", "apexrefresh");
				g_dblclick_opened = "Y";
				openInlineDialog("errored_items", 60, 65);
			} else {
				g_dblclick_opened = "N";
				var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N",
					sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_camera, g_scene, g_pog_index, g_pog_index);
				animate_all_pog();
				generateMultiPogDropdown();
				if ($(".t-Body-actionsToggle").hasClass("is-active")) {
					apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
					apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
					apex.region("draggable_table").refresh();
				}
			}
		} else {
			g_scene_objects = [];
			g_canvas_objects = [];
			//this will create canvas can be multiple or single.
			appendMultiCanvasRowCol(p_pog_code.length, $v(g_page_no + "POGCR_TILE_VIEW"));
			//this will set the view. can be horizontal or vertical.
			switchCanvasView($v(g_page_no + "POGCR_TILE_VIEW")); // Task-22510

			// addLoadingIndicator();//ASA-1500
			g_multi_pog_json = [];
			//this function is used to set labels indicators by default BU Param.
			await setDefaultState("Y");
			for (var i = 0; i <= p_pog_code.length - 1; i++) {
				init(i);
				objects = {};
				objects["scene"] = g_scene;
				objects["renderer"] = g_renderer;
				g_scene_objects.push(objects);
				g_seqArrDtl = {};
				g_seqArrDtl["seqId"] = p_pog_code[i];
				g_seqArrDtl["index"] = i;
				g_seqArrDtl["pogCode"] = "";
				g_seqArrDtl["pogVersion"] = "";
				g_seqArrDtl["pogType"] = "D";
				g_seqArr.push(g_seqArrDtl);
				g_pog_index = i;
				set_indicator_objects(g_scene_objects.length - 1);
				var returnval = await getJson("Y", "", p_pog_code[i], "Y", "Y", g_camera, g_scene, i, p_imageLoadInd, "Y", p_pog_desc); //ASA-1765 Added p_pog_desc  #issue 5
				render(i);
				var canvas_id = g_canvas_objects[i].getAttribute("id");
				$("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + g_pog_json[i].POGCode /*POGJSON[0].POGCode*/ + "</span>"); //HOTFIX
				//ASA-1500
				// if (i == p_pog_code.length - 1) {
				//     removeLoadingIndicator(regionloadWait);
				// }
			}

			g_pog_json = g_multi_pog_json;
			generateMultiPogDropdown();
			var retval = await animate_all_pog();
			if ($(".t-Body-actionsToggle").hasClass("is-active")) {
				apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
				apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
				apex.region("draggable_table").refresh();
			}

			if (p_imageLoadInd == "Y") {
				// addLoadingIndicator();
				var retval = await get_all_images(0, g_get_orient_images, "Y", $v(g_page_no + "POGCR_IMG_MAX_WIDTH"), $v(g_page_no + "POGCR_IMG_MAX_HEIGHT"), $v(g_page_no + "IMAGE_COMPRESS_RATIO"));
			}
			if (g_ItemImages.length > 0 && g_show_live_image == "Y" && p_imageLoadInd == "Y") {
				var pogIndx = 0;
				$(".live_image").addClass("live_image_active");
				for (const pogs of g_pog_json) {
					try {
						g_renderer = g_scene_objects[pogIndx].renderer;
						g_scene = g_scene_objects[pogIndx].scene;
						g_camera = g_scene_objects[pogIndx].scene.children[0];
						g_world = g_scene_objects[pogIndx].scene.children[2];
						// var return_val = await recreate_image_items("Y", $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P193_POGCR_ITEM_DETAIL_LIST')
						var return_val = await recreate_image_items("Y", $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), $v(g_page_no + "NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v(g_page_no + "POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
					} catch (err) {
						error_handling(err);
						// removeLoadingIndicator(regionloadWait); //ASA-1500
					}
					//ASA-1500
					// if (pogIndx == g_pog_json.length - 1) {
					//     removeLoadingIndicator(regionloadWait);
					// }
					pogIndx++;
				}
				g_imagesShown = "Y";
				animate_all_pog();
			}
			//ASA-1500
			// else if (p_imageLoadInd == "Y") {
			//     removeLoadingIndicator(regionloadWait);
			// }

			var j = 0;
			for (const r of g_pog_json) {
				if (j > 0) {
					await enableDisableFlags(j);
				}
				j++;
			}
			// await save_update_json_items(g_multi_pog_json);

			g_pog_index = 0;
			if (g_scene_objects.length > 0) {
				if (typeof g_scene_objects[g_pog_index] !== "undefined") {
					if (typeof g_scene_objects[g_pog_index].Indicators !== "undefined") {
						g_show_fixel_label = g_scene_objects[g_pog_index].Indicators.FixelLabel;
						g_show_item_label = g_scene_objects[g_pog_index].Indicators.ItemLabel;
						g_show_notch_label = g_scene_objects[g_pog_index].Indicators.NotchLabel;
						g_show_max_merch = g_scene_objects[g_pog_index].Indicators.MaxMerch;
						g_show_item_color = g_scene_objects[g_pog_index].Indicators.ItemColor;
						g_show_item_desc = g_scene_objects[g_pog_index].Indicators.ItemDesc;
						g_show_live_image = g_scene_objects[g_pog_index].Indicators.LiveImage;
						g_show_days_of_supply = g_scene_objects[g_pog_index].Indicators.DaysOfSupply;
						g_overhung_shelf_active = g_scene_objects[g_pog_index].Indicators.OverhungShelf; //ASA-1138
						g_itemSubLabelInd = g_scene_objects[g_pog_index].Indicators.ItemSubLabelInd; //ASA-1182
						g_itemSubLabel = g_scene_objects[g_pog_index].Indicators.ItemSubLabel; //ASA-1182
					}
					var canvas_id = g_canvas_objects[g_pog_index].getAttribute("id");

					$("[data-pog]").removeClass("multiPogList_active");
					$(".canvas_highlight").removeClass("canvas_highlight");
					$("#" + canvas_id + "-btns").addClass("canvas_highlight");
					$("[data-indx=" + g_pog_index + "]").addClass("multiPogList_active");
					g_all_pog_flag = "N";
				}
			}
		}
		var pindex = 0;
		for (const pog of g_pog_json) {
			items_arr = [];
			if (typeof g_pog_json[pindex].DeleteItems !== "undefined") {
				//ASA- S-1108
				if (g_pog_json[pindex].DeleteItems.length > 0) {
					var i = 0;
					for (var items of g_pog_json[pindex].DeleteItems) {
						items_arr.push(items.Item);
						i++;
					}
				}
			}
			if (typeof items_arr !== "undefined") {
				g_open_productlist = "D";
				// await deleted_items_log(items_arr, "D", pindex);
			} //ASA- E-1108
			pindex++;
		}

		logDebug("function : get_json_data", "E");
	} catch (err) {
		error_handling(err);
	}
}

// This function will call create_module_from_json_lib from asw_common_main.js. This function will take the complete json of the POG and build json for g_pog_json
//and create the skeleton on the screen.
async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_stop_loading, p_create_pdf_ind, p_recreate, p_create_json, p_pog_version, p_save_pdf, p_camera, p_scene, p_pog_index, p_orgPogIndex, p_ImageLoadInd = "N", p_UpdateIndex = "N", p_old_POGJSON = []) {
    debugger;
    try {
        typeof p_save_pdf == "undefined" ? "Y" : p_save_pdf;
         load_orientation_json();
        $("#LIVE_IMAGE").addClass("apex_disabled");
        //Start ASA-1371_26842
        if ($v(g_page_no + 'POGCR_DFT_NOTCH_LABEL') == "Y") {
            g_show_notch_label = 'Y';
            //show_notch_labels("Y", $v("P36_NOTCH_HEAD"), "Y", p_pog_index);
        }
        if ($v(g_page_no + 'POGCR_DFT_FIXEL_LABEL') == "Y") {
            g_show_fixel_label = 'Y';
            //show_fixel_labels("Y", p_pog_index);
        }
        if ($v(g_page_no + 'POGCR_SHOW_DFLT_ITEM_LOC') == "Y") {
            g_show_item_label = 'Y';
            //show_item_labels("Y", $v("P36_POGCR_ITEM_NUM_LBL_COLOR"), $v("P36_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        }
        console.log( "create_module_from_json:start", { p_pog_index:p_pog_index, g_canvas_objects_len: g_canvas_objects?g_canvas_objects.length:0, g_scene_objects_len: g_scene_objects?g_scene_objects.length:0, has_p_camera: typeof p_camera !== 'undefined', has_p_scene: typeof p_scene !== 'undefined' });
        
        await create_module_from_json_lib(
            p_pog_json_arr,
            p_new_pog_ind,
            p_pog_type,
            p_product_open,
            p_pog_opened,
            p_recreate,
            p_create_json,
            $v(g_page_no + "VDATE"),
            $v(g_page_no + "POG_POG_DEFAULT_COLOR"),
            $v(g_page_no + "POG_MODULE_DEFAULT_COLOR"),
            p_pog_version,
            true,
            "N",
            null,
            $v(g_page_no + "POGCR_DFT_SPREAD_PRODUCT"),
            parseFloat($v(g_page_no + "PEGB_DFT_HORIZ_SPACING")),
            parseFloat($v(g_page_no + "PEGBOARD_DFT_VERT_SPACING")),
            parseFloat($v(g_page_no + "BASKET_DFT_WALL_THICKNESS")),
            parseFloat($v(g_page_no + "CHEST_DFT_WALL_THICKNESS")),
            $v(g_page_no + "POGCR_PEGB_MAX_ARRANGE"),
            $v(g_page_no + "POGCR_DEFAULT_WRAP_TEXT"),
            parseInt($v(g_page_no + "POGCR_TEXT_DEFAULT_SIZE")),
            $v(g_page_no + "POG_TEXTBOX_DEFAULT_COLOR"),
            $v(g_page_no + "POG_SHELF_DEFAULT_COLOR"),
            $v(g_page_no + "DIV_COLOR"),
            $v(g_page_no + "SLOT_DIVIDER"),
            $v(g_page_no + "SLOT_ORIENTATION"),
            $v(g_page_no + "DIVIDER_FIXED"),
            $v(g_page_no + "POG_ITEM_DEFAULT_COLOR"),
            $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"),
            g_peg_holes_active,
            $v(g_page_no + "POG_CP_SHELF_DFLT_COLOR"),
            3,
            $v(g_page_no + "MERCH_STYLE"),
            $v(g_page_no + "POGCR_LOAD_IMG_FROM"),
            $v(g_page_no + "BU_ID"),
            $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"),
            $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"),
            $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"),
            $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"),
            $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"),
            $v(g_page_no + "NOTCH_HEAD"),
            "N",
            $v(g_page_no + "POGCR_DFT_BASKET_FILL"),
            $v(g_page_no + "POGCR_DFT_BASKET_SPREAD"),
            p_camera,
            p_pog_index,
            p_orgPogIndex,
            $v(g_page_no + 'POGCR_NOTCH_START_VALUE'),
            $v(g_page_no + 'POGCR_MANUAL_CRUSH_ITEM'),
            'Y', //ASA-1310 KUSH FIX
            ""); //Regression 29(Portal Issue) added p_calc_dayofsupply
            console.log("create_module_from_json:done", { p_pog_index:p_pog_index, g_pog_json_len: g_pog_json?g_pog_json.length:0 });
       
            g_pog_json[p_pog_index].MassUpdate = "N"; //ASA-1809, Set this to N, as for saving POG draft or existing the coordinates in JSON has been update with respect to WPD

        //This after refresh event is needed because Division/Dept/Subdept are cascading LOV and setting value is always removed by refresh
        //due to setting value to master page item.
        $("#" + g_page_no + "POG_SUBDEPT").on("apexafterrefresh", function () {
            if (typeof g_pog_json[p_pog_index] != "undefined")
                apex.item(this).setValue(g_pog_json[p_pog_index].SubDept);
        });
        $("#" + g_page_no + "POG_DEPT").on("apexafterrefresh", function () {
            if (typeof g_pog_json[p_pog_index] != "undefined")
                apex.item(this).setValue(g_pog_json[p_pog_index].Dept);
        });

        apex.item(g_page_no + "POG_DIVISION").setValue(g_pog_json[p_pog_index].Division);

        if (p_recreate == "Y") {
            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                backupPog("F", -1, -1, p_pog_index);
            }

            if (p_stop_loading == "N" && p_create_pdf_ind == "Y") {
                var draft_ind = p_pog_opened == "E" ? "E" : "D";

                var p_pog_details = {
                    'SeqNo': '',
                    'POGCode': g_pog_json[p_pog_index].POGCode,
                    'POGVersion': g_pog_json[p_pog_index].Version,
                    'POGModule': '',
                    'Selection_Type': draft_ind,
                    'Print_Type': 'P',
                    'SequenceId': '',
                    'TemplateId': $v(g_page_no + "PDF_TEMPLATE").split('-')[0],
                    'TemplateDetails': $v(g_page_no + "PDF_TEMPLATE")
                };

                var return_val = create_pdf(p_pog_details, p_save_pdf, "N", p_camera, draft_ind, $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "NOTCH_HEAD"), "Y", p_pog_index, "Y", g_all_pog_flag, $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), "", "", g_hide_show_dos_label, "",
                    $v(g_page_no + "POGCR_ENHANCE_PDF_IMG"), $v(g_page_no + "POGCR_PDF_IMG_ENHANCE_RATIO"), $v(g_page_no + "POGCR_PDF_CANVAS_SIZE"), $v(g_page_no + "VDATE"), $v(g_page_no + "POG_POG_DEFAULT_COLOR"), $v(g_page_no + "POG_MODULE_DEFAULT_COLOR"), $v(g_page_no + "POGCR_DFT_SPREAD_PRODUCT"), $v(g_page_no + "PEGB_DFT_HORIZ_SPACING"), $v(g_page_no + "PEGBOARD_DFT_VERT_SPACING"), $v(g_page_no + "BASKET_DFT_WALL_THICKNESS"), $v(g_page_no + "CHEST_DFT_WALL_THICKNESS"), $v(g_page_no + "POGCR_PEGB_MAX_ARRANGE"), $v(g_page_no + "POGCR_DEFAULT_WRAP_TEXT"), $v(g_page_no + "POGCR_TEXT_DEFAULT_SIZE"), $v(g_page_no + "POG_TEXTBOX_DEFAULT_COLOR"), $v(g_page_no + "POG_SHELF_DEFAULT_COLOR"), $v(g_page_no + "DIV_COLOR"), $v(g_page_no + "SLOT_DIVIDER"), $v(g_page_no + "SLOT_ORIENTATION"), $v(g_page_no + "DIVIDER_FIXED"), $v(g_page_no + "POG_ITEM_DEFAULT_COLOR"), $v(g_page_no + "POGCR_DFT_BASKET_FILL"), $v(g_page_no + "POGCR_DFT_BASKET_SPREAD"), $v(g_page_no + "POGCR_BAY_LIVE_IMAGE"), $v(g_page_no + "POGCR_BAY_WITHOUT_LIVE_IMAGE"), "N"); //ASA-1427 $v('P193_POGCR_ITEM_DETAIL_LIST')
            }

            $(".live_image").css("color", "white").css("cursor", "pointer");
            $(".open_pdf").css("color", "black").css("cursor", "pointer");
            $(".open_pdf_online").css("color", "black").css("cursor", "pointer");            
        }

        if (g_ItemImages.length > 0 && g_show_live_image == "Y" && p_recreate == 'Y') {
            try {
                $(".live_image").addClass("live_image_active");
                if (p_create_pdf_ind == "N" && p_product_open == "N" && $v(g_page_no + "POGCR_DFT_ITEM_DESC") == "N" && p_ImageLoadInd == "N") {
                    var return_val = await recreate_image_items("Y", $v(g_page_no + "MERCH_STYLE"), $v(g_page_no + "POGCR_LOAD_IMG_FROM"), $v(g_page_no + "BU_ID"), $v(g_page_no + "POGCR_ITEM_NUM_LBL_COLOR"), $v(g_page_no + "POGCR_ITEM_NUM_LABEL_POS"), $v(g_page_no + "POGCR_DISPLAY_ITEM_INFO"), $v(g_page_no + "POGCR_DELIST_ITEM_DFT_COL"), $v(g_page_no + "NOTCH_HEAD"), p_pog_index, g_show_days_of_supply, $v(g_page_no + "POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
                    g_imagesShown = "Y";
                }
            } catch (err) {
                error_handling(err);
            }
        }

        if (g_isPogItemsSet == "N") {
            set_pog_page_items(p_pog_index);
        }

        if (g_show_item_color == "Y") {
            $(".item_color_legends").css("display", "block");
        } else {
            $(".item_color_legends").css("display", "none");
        }

        var modIdx = 0;
        for (const modInfo of g_pog_json[p_pog_index].ModuleInfo) {
            if (typeof modInfo.ParentModule == "undefined" || modInfo.ParentModule == null) {
                var shelfIdx = 0;
                for (const shelf of modInfo.ShelfInfo) {
                    if (shelf.ObjType == "TEXTBOX") {
                        var selObj = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].SObjID);
                        if (typeof selObj !== "undefined") {
                            selObj['ShelfInfo'] = g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx];
                            textboxPriorityPlacing(selObj, p_pog_index, g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].Z);
                        }
                    }
                    shelfIdx++;
                }
            }
            modIdx++;
        }
    } catch (err) {
        error_handling(err);
    }
    return "SUCCESS";
}

// Block Js
async function update_module_block_list(p_action_ind, p_old_blk_name, p_escape_ind = "N") {
    var block_detail = {};
    var filters_arr = [];
    var attr_arr = [];
    var filter_val = [];
    var blk_name_arr = [];
    var upd_block_dtl = {};
    var blockName = $v(g_page_no + "BLK_NAME") + "_AFP";
    if (p_escape_ind == "Y") {
        var block_details_arr = [];
        for (const obj of g_mod_block_list) {
            var details = {};
            details["BlkColor"] = obj.BlkColor;
            details["BlkName"] = obj.BlkName;
            details["BlkRule"] = obj.BlkRule;
            details["BlkFilters"] = obj.BlockFilters.join(" AND ");
            details["OldBlkName"] = obj.BlkName;
            obj["BlkFilters"] = details["BlkFilters"];
            block_details_arr.push(details);
        }
        closeInlineDialog("block_details");
        var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
    } else {
        if (p_old_blk_name == blockName && p_action_ind == "U") {
            blk_name_arr = [];
        } else {
            blk_name_arr = [blockName];
        }

        block_detail["BlkName"] = blockName;
        block_detail["BlkColor"] = $v(g_page_no + "BLK_COLOR");
        block_detail["BlkRule"] = $v(g_page_no + "BLK_RULE");
        var shelf_arr = [];
        var mod_index = [];
        var final_shelf_arr = [];

        if (p_action_ind !== "U") {
            var mod_ind = -1;
            for (const objects of g_delete_details) {
                if (objects.ObjType !== "TEXTBOX") {
                    shelf_arr.push(objects);
                    if (mod_ind !== objects.MIndex) {
                        mod_index.push(objects.MIndex);
                    }
                    objects.BlkName = block_detail["BlkName"];
                    mod_ind = objects.MIndex;
                }
            }
            mod_index.sort();
            if (g_mod_block_list.length > 0) {
                for (const shelfs of shelf_arr) {
                    var valid = true;
                    for (const obj of g_mod_block_list) {
                        if (!valid) break;
                        for (const dtl of obj.g_delete_details) {
                            if (shelfs.MIndex == dtl.MIndex && shelfs.SIndex == dtl.SIndex) {
                                valid = false;
                                break;
                            }
                        }
                    }
                    if (valid) final_shelf_arr.push(shelfs);
                }
            } else {
                final_shelf_arr = shelf_arr;
            }
        } else {
            for (const obj of g_mod_block_list) {
                if (obj.BlkName == p_old_blk_name) {
                    final_shelf_arr = obj.g_delete_details;
                    mod_index = obj.mod_index;
                    block_detail["DragMouseStart"] = obj.DragMouseStart;
                    block_detail["DragMouseEnd"] = obj.DragMouseEnd;
                    break;
                }
            }
            for (const obj of final_shelf_arr) {
                obj.BlkName = block_detail["BlkName"];
            }
            g_DragMouseStart = block_detail["DragMouseStart"];
            g_DragMouseEnd = block_detail["DragMouseEnd"];
        }
        block_detail["g_delete_details"] = final_shelf_arr;

        var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;

        model.forEach(function (record) {
            var filters = typeof model.getValue(record, "FILTER") == "object" ? model.getValue(record, "FILTER").v : model.getValue(record, "FILTER");
            var value = model.getValue(record, "VALUE");
            filter_val.push(filters + "#" + value);
            if (filters !== "") {
                var filter_list = filters.split("-");
                attr_arr.push(filter_list[0]);
                filters_arr.push(filter_list[0] + " = " + (filter_list[1] == "C" ? '"' : "") + value + (filter_list[1] == "C" ? '"' : ""));
            }
        });

        for (const obj of g_mod_block_list) {
            blk_name_arr.push(obj.BlkName);
        }

        var blk_dup = findDuplicates(blk_name_arr);
        var dup_arr = findDuplicates(attr_arr);

        if (blk_dup.length > 0) {
            alert(get_message("POGCR_BLK_DUP"));
        } else if (dup_arr.length > 0) {
            alert(get_message("POGCR_DUP_REC_FOUND"));
        } else if (attr_arr.includes("SUBCLASS") && (!attr_arr.includes("CLASS") || !attr_arr.includes("DEPT"))) {
            alert(get_message("POGCR_DEPT_CLASS_MANDATE"));
        } else if (attr_arr.includes("CLASS") && !attr_arr.includes("DEPT")) {
            alert(get_message("POGCR_DEPT_MANDATE"));
        } else {
            block_detail["BlockFilters"] = filters_arr;
            block_detail["FilterVal"] = filter_val;
            block_detail["mod_index"] = mod_index;
            if (p_action_ind == "U") {
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName == p_old_blk_name) {
                        for (const child of obj.BlockDim.ColorObj.children) {
                            if (child.uuid == p_old_blk_name) {
                                obj.BlockDim.ColorObj.remove(child);
                                break;
                            }
                        }
                    }
                }
                var i = 0;
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName == p_old_blk_name) {
                        upd_block_dtl = JSON.parse(JSON.stringify(obj));
                        g_mod_block_list.splice(i, 1);
                    }
                    i++;
                }
            }

            apex.region("block_filters").widget().interactiveGrid("getActions").set("edit", false);
            apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model.clearChanges();
            apex.region("block_filters").refresh();

            clear_blinking();
            var ret_dtl = await colorAutofillBlock(g_DragMouseStart, g_DragMouseEnd, mod_index, $v(g_page_no + "BLK_COLOR"), blockName, p_action_ind, upd_block_dtl, g_pog_index, "N");
            block_detail["BlockDim"] = ret_dtl;
            g_mod_block_list.push(block_detail);

            closeInlineDialog("block_details");

            if (p_action_ind == "U") {
                var block_details_arr = [];
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName !== blockName && obj.BlkName !== p_old_blk_name) {
                        var details = {};
                        details["BlkColor"] = obj.BlkColor;
                        details["BlkName"] = obj.BlkName;
                        details["BlkRule"] = obj.BlkRule;
                        details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                        details["OldBlkName"] = obj.BlkName;
                        obj["BlkFilters"] = details["BlkFilters"];
                        block_details_arr.push(details);
                    } else if (obj.BlkName == p_old_blk_name || obj.BlkName == blockName) {
                        var details = {};
                        details["BlkColor"] = $v(g_page_no + "BLK_COLOR");
                        details["BlkName"] = blockName;
                        details["BlkRule"] = $v(g_page_no + "BLK_RULE");
                        details["BlkFilters"] = filters_arr.join(" AND ");
                        details["OldBlkName"] = p_old_blk_name;
                        obj["BlkFilters"] = details["BlkFilters"];
                        block_details_arr.push(details);
                    }
                }
                var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
            } else if (p_action_ind == "Y" || p_action_ind == "A") {
                var block_details_arr = [];
                for (const obj of g_mod_block_list) {
                    var details = {};
                    details["BlkColor"] = obj.BlkColor;
                    details["BlkName"] = obj.BlkName;
                    details["BlkRule"] = obj.BlkRule;
                    details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                    obj["BlkFilters"] = details["BlkFilters"];
                    block_details_arr.push(details);
                }
                var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
            }
        }
    }
}

//ASA-1986 Common function to open dialogue on edit icon from GRID.
function open_blk_details(p_blk_name, p_edit_ind) {
    console.log(p_blk_name);
    $s(g_page_no + "EDIT_BLK", p_blk_name);
    g_autofill_edit = p_edit_ind == "Y" ? "Y" : "N";
    var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;
    //model.clearChanges(); //ASA-1727 ISSUE-1
    //apex.region("block_filters").refresh(); //ASA-1727 ISSUE-1

    for (const obj of g_mod_block_list) {
        if (obj.BlkName == p_blk_name) {
            $s(g_page_no + "BLK_NAME", obj.BlkName.slice(0, -4));
            $s(g_page_no + "BLK_COLOR", obj.BlkColor);
            $s(g_page_no + "BLK_RULE", obj.BlkRule);
            var row$,
            region = apex.region("block_filters"),
            view = region.call("getCurrentView");
            if (p_edit_ind == "N") { //Regression Issue 5 autofill EDIT
                if (obj.FilterVal.length > 0) {
                    //ASA-1727 ISSUE-1 change 1 to 0  and remove if (i > 0) {
                    var i = 0;
                    for (const fil of obj.FilterVal) {
                        // if (i > 0) {
                        if (view.internalIdentifier === "grid") {
                            row$ = region.widget().find(".a-GV-row").last();
                            view.view$.grid("setSelection", row$);
                            region.call("getActions").invoke("selection-add-row");
                        }
                        //  }
                        i++;
                    }
                }
                var i = 0;

                model.forEach(function (igrow) {
                    console.log(obj.FilterVal[i], igrow);
                    if (typeof obj.FilterVal[i] !== "undefined") {
                        var details = obj.FilterVal[i].split("#");
                        model.setValue(igrow, "FILTER", `${details[0]}`);
                        model.setValue(igrow, "VALUE", `${details[1]}`);
                    }
                    i++;
                });
            } else {
                model.clearChanges(); //ASA-1727 ISSUE-1
                apex.region("block_filters").refresh(); //ASA-1727 ISSUE-1
            }

            $("#ADD_BLK").css("display", "none");
            $("#SAVE_BLK").css("display", "none");
            $("#UPDATE_BLK").css("display", "inline");
            g_auto_fill_reg_open = "N";
            openInlineDialog("block_details", 40, 65);            
            break;
        }
    } 
}

function clear_blinking() {
    if (g_intersected) {
        for (var i = 0; i < g_intersected.length; i++) {
            g_select_color = g_intersected[i].BorderColour;
            g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
            if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                g_intersected[i].WireframeObj.material.transparent = true;
                g_intersected[i].WireframeObj.material.opacity = 0.0025;
            }
        }
        clearInterval(g_myVar);
        g_select_color = 0x000000;
        render(g_pog_index);
        g_intersected = [];
        g_select_zoom_arr = [];
    }
} 


// WPD 3 
function add_pog_code_header() {
	$("#canvas-holder #block_title").remove();
	for (var i = 0; i < g_scene_objects.length; i++) {
		var canvas_id = g_canvas_objects[i].getAttribute("id");
		$("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + g_pog_json[i].POGCode + "</span>");
	}
}
// WPD 3 
function closePog(p_pog_index, p_type) {
	if (p_type == 0) {
		g_scene_objects_backup.splice(p_pog_index, 1);
		g_pogjson_backup.splice(p_pog_index, 1);
   		g_pogjson_data_backup.splice(p_pog_index, 1);
		generateCanvasListHolder(g_pogjson_backup);
	} else {
		confirm(get_message("POGCR_CLOSE_POG_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
			g_scene_objects.splice(p_pog_index, 1);
			g_pog_json.splice(p_pog_index, 1);
            g_pog_json_data.splice(p_pog_index, 1);
			appendMultiCanvasRowCol(g_scene_objects.length, $v(g_page_no + "POGCR_TILE_VIEW"));
			modifyWindowAfterMinMax(g_scene_objects);
			if (p_pog_index == g_ComViewIndex && g_compare_pog_flag == "Y") {
				g_compare_view = "NONE";
				g_compare_pog_flag = "N";
				g_edit_pallet_mod_ind = -1;
				g_edit_pallet_shelf_ind = -1;
				g_ComViewIndex = -1;
				g_ComBaseIndex = -1;
				g_comp_view_code = "";
				g_comp_base_code = "";
			} else {
				reset_compare_index(p_pog_index);
			}
			add_pog_code_header();
			generateMultiPogDropdown();
			if (g_pog_json.length > 0) {
				g_pog_index = 0;
				set_select_canvas(g_pog_index); //Regression Issue 9 20240802				
			}
		});

		//Task_29818 - End
	}
}




function delete_blk_details(p_old_blk_name) {
    confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), get_global_ind_values("AI_CONFIRM_OK_TEXT"), get_global_ind_values("AI_CONFIRM_CANCEL_TEXT"), function () {
        async function doSomething() {
            var i = 0;
            for (const obj of g_mod_block_list) {
                if (obj.BlkName == p_old_blk_name) {
                    for (const child of obj.BlockDim.ColorObj.children) {
                        if (child.uuid == p_old_blk_name) {
                            obj.BlockDim.ColorObj.remove(child);
                            break;
                        }
                    }
                    g_mod_block_list.splice(i, 1);
                    break;
                }
                i++;
            }
            render(g_pog_index);
            var retval = await save_blk_dtl_coll("D", p_old_blk_name, []);
            closeInlineDialog("block_details");
            g_autofill_edit = "N";
            apex.event.trigger(g_page_no + "POG_RULE", "apexrefresh");
            if (g_page_no == 'P25_'){
               apex.theme.openRegion("auto_fill_reg");
               g_auto_fill_reg_open = "Y";
            } else {
               apex.region("mod_block_details").refresh();
            }
            return "SUCCESS";
        }
        doSomething();
    });
    //Task_29818 - End
}

async function show_view_analysis(p_pog_code, p_pog_version) {
    logDebug("function : show_view_analysis; p_pog_code : " + p_pog_code + "; pog_version : " + p_pog_version, "S");
    try {
         var selectedPogIndex = typeof g_pog_index === "number" && g_pog_index > -1 ? g_pog_index : 0;
        var l_POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
        var selectedPog = l_POG_JSON[selectedPogIndex];
        if (typeof selectedPog === "undefined") {
            return;
        }
        g_scene_objects = [];
        g_canvas_objects = [];
        let l_new_pog = g_pog_json[0];
        g_pog_json.push(l_new_pog);
        // await appendMultiCanvasRowCol(g_pog_json.length, "H");
        await appendCanvasForGraph();
        init(0);
        var l_objects = {};
        l_objects["scene"] = g_scene;
        l_objects["renderer"] = g_renderer;
        g_scene_objects.push(l_objects);
        // var l_POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
        g_world = g_scene_objects[0].scene.children[2];
        g_camera = g_scene_objects[0].scene.children[0];
        // await create_module_from_json(l_POG_JSON, "N", "F", "N", "E", "N", "N", "Y", "Y", g_pog_json[0].Version, "Y", g_scene_objects[0].scene.children[0], g_scene_objects[0].scene, 0, 0);
        await create_module_from_json([selectedPog], "N", "F", "N", "E", "N", "N", "Y", "Y", selectedPog.Version, "Y", g_scene_objects[0].scene.children[0], g_scene_objects[0].scene, 0, 0);
        render(0);
        g_ComViewIndex = -1;
        var panel = document.getElementById("maincanvas2-container");
        panel.insertAdjacentHTML("beforeend",
            `<div style="padding:10px; height:100%; box-sizing:border-box; display:flex; flex-direction:column;">
                <div style="flex:1 1 auto; min-height:0;">
                    <canvas id="analysisChart_1" style="width:100%;height:100%;display:block;"></canvas>
                </div>
            </div>`);
        
        var child = panel.querySelector(".canvasregion");
        child.remove();
          var child = panel.querySelector(".canvasregion");
         if (child) {
            child.remove();
         }

        const canvasEl = document.getElementById("analysisChart_1");
        const ctx = canvasEl.getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Module 1", "Module 2", "Module 3", "Module 4"],
                datasets: [{
                    label: "Sales Performance",
                    data: [120, 190, 300, 150],
                    backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e"]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                title: {
                    display: true,
                    text: 'Chart.js Line Chart - Cubic interpolation mode'
                },
                },
                interaction: {
                intersect: false,
                },
                scales: {
                x: {
                    display: true,
                    title: {
                    display: true
                    }
                },
                y: {
                    display: true,
                    title: {
                    display: true,
                    text: 'Value'
                    },
                    suggestedMin: -10,
                    suggestedMax: 200
                }
                }
            },
        });
    } catch (err) {
        error_handling(err);
    } finally {
        logDebug("function : show_view_analysis", "E");
    }
}

async function appendCanvasForGraph() {
    g_windowHeight = window.innerHeight - 167;
    $("#canvas-holder .container").css("height", g_windowHeight + "px")
    var containerH = $("#canvas-holder .container").height();;
    var containerW = $("#canvas-holder .container").width();
    $("#canvas-holder .container").html("");
    $("#canvas-holder .container").addClass("h-view").removeClass("v-view");
    $("#canvas-holder .container").append('<div class="row" data-row="1"></div>');
    for (var j = 0; j <= 1; j++) {
        var pogNo = j == 0 ? "" : j + 1;
        var canvasName = "maincanvas" + pogNo;
        var buttonHtml = '<div class="canvas-buttons" id="maincanvas' + pogNo + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + j + ')"></span><span class="fa fa-window-maximize canvas-max" onClick="maximizePog(' + j + ')"></span><span class="fa fa-minus canvas-min" onClick="minimizePog(' + j + ')"></span></div>';
        $(`[data-row="1"]`).append('<div class="canvas-content" id="maincanvas' + pogNo + '-container" data-col="' + j + 1 + '" style="height:' + parseFloat((containerH).toFixed(2)) + "px;width:" + parseFloat((containerW / 2).toFixed(2)) + 'px">' + buttonHtml + '<canvas class="canvasregion" data-canvas=true id="maincanvas' + pogNo + '" ></canvas></div>');
        if (j == 0) {
            try {
                var el = document.getElementById(canvasName);
                if (el) {
                    el.setAttribute('data-indx', 0);
                    if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
                }
            } catch (e) {
                error_handling(err);
            }
        }
    }
    makeResizableRow();
}

// async function appendCanvasForGraph() {
//     $(".viewH").addClass("view_active");
//     $(".viewV").removeClass("view_active");
//     g_windowHeight = window.innerHeight - 167;
//     $("#canvas-holder .container").css("height", g_windowHeight + "px")
//     var containerH = $("#canvas-holder .container").height();;
//     var containerW = $("#canvas-holder .container").width();
//     var rowCount = 1,
//         pogCount = 0;
//     var currColCount,
//         pendingPogCount = 2;
//     var divs = [];
//     $("[data-col]").each(function () {
//         var element = $(this)[0];
//         divs.push(element);
//     });
//     calcFlag = "N";
//     currColCount = 2;
//     colCount = 2;
//     $("#canvas-holder .container").html("");
//     $("#canvas-holder .container").addClass("h-view").removeClass("v-view");
//     for (var i = 1; i <= rowCount; i++) {
//         $("#canvas-holder .container").append('<div class="row" data-row="' + i + '"></div>');
//         if (calcFlag == "Y") {
//             var res = pendingPogCount % (rowCount - i + 1);
//             if (res > 0) {
//                 currColCount = colCount;
//             } else {
//                 currColCount = pendingPogCount / (rowCount - i + 1);
//                 calcFlag = "N";
//             }
//             pendingPogCount = pendingPogCount - currColCount;
//         }
//         for (var j = 1; j <= currColCount; j++) {
//             var pogNo = pogCount == 0 ? "" : pogCount + 1;
//             var canvasName = "maincanvas" + pogNo;
//             var buttonHtml = "";
//             buttonHtml = '<div class="canvas-buttons" id="maincanvas' + pogNo + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + pogCount + ')"></span><span class="fa fa-window-maximize canvas-max" onClick="maximizePog(' + pogCount + ')"></span><span class="fa fa-minus canvas-min" onClick="minimizePog(' + pogCount + ')"></span></div>';
//             $("[data-row=" + i + "]").append('<div class="canvas-content" id="maincanvas' + pogNo + '-container" data-col="' + j + '" style="height:' + parseFloat((containerH / rowCount).toFixed(2)) + "px;width:" + parseFloat((containerW / currColCount).toFixed(2)) + 'px">' + buttonHtml + '<canvas class="canvasregion" data-canvas=true id="maincanvas' + pogNo + '" ></canvas></div>');
//             try {
//                 var el = document.getElementById(canvasName);
//                 if (el) {
//                     el.setAttribute('data-indx', pogCount);
//                     if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
//                 }
//             } catch (e) {
//                 error_handling(e);
//             }
//             pogCount++;
//         }
//     }
//     makeResizableRow();
// }


function doMouseDown(p_x, p_y, p_startX, p_startY, p_event, p_canvas, p_context_call, p_pog_index) {
    logDebug("function : doMouseDown; x : " + p_x + "; y : " + p_y + "; startX : " + p_startX + "; startY : " + p_startY + "; context_call : " + p_context_call, "S");
    /*This is a mouse down listner function
    this function handles
    1. find the object that has been clicked and find out which is this object
    it can be module, shelf, item or empty place outside POG. Get the indexes
    of the object clicked and setting all global variable for future use.
    2. setting blinking of the clicked object.
    3. if user trying to do multi select prepare the multi select element
    4. if user is trying to drag objects after multi select setting distance from cursor.

     */
    try {
        if (g_scene_objects.length > 0) {
            // ASA-1085, x12
            var header = document.getElementById("t_Header");
            var breadcrumb = document.getElementById("t_Body_title");
            var top_bar = document.getElementById("top_bar");
            var side_nav = document.getElementById("t_Body_nav");
            var button_cont = document.getElementById("wpdSplitter_splitter_first");
            var wtbar = document.querySelector(".wtbar");
            var devicePixelRatio = window.devicePixelRatio;
            g_start_pixel_ratio = devicePixelRatio;


            var scroll_top = $(document).scrollTop();
            var scroll_left = $(".t-Region-body").scrollLeft();

            var header_height = header.offsetHeight; // * devicePixelRatio;
            var breadcrumb_height = breadcrumb.offsetHeight; // * devicePixelRatio;
            var top_bar_height = top_bar.offsetHeight; //* devicePixelRatio;
            var wtbar_height = wtbar.offsetHeight // * devicePixelRatio;
            var side_nav_width = side_nav.offsetWidth; //* devicePixelRatio;
            var btn_cont_width = button_cont.offsetWidth; //* devicePixelRatio;
            var padding = parseFloat($(".t-Body-contentInner").css("padding-left").replace("px", "")) * devicePixelRatio;

            g_global_counter = g_global_counter + 1;
            g_start_coorX = p_startX;
            g_start_coorY = p_startY;
            g_taskItemInContext = true;
            g_taskItemInContext1 = true;

            //if the g_multiselect box is on hide it
            if (p_context_call == "N") {
                g_selection.style.visibility = "hidden";
            }

            var new_camera = {};
            var new_world = {};
            if (typeof g_scene_objects[g_pog_index] !== "undefined" && g_scene_objects.length > 0) {
                new_camera = g_scene_objects[g_pog_index].scene.children[0];
                new_world = g_scene_objects[g_pog_index].scene.children[2];
            }
            var newArray = [];
            for (var i = 0, len = g_undo_final_obj_arr.length; i < len; i++) {
                if (g_undo_final_obj_arr[i][0].length > 0) {
                    if (typeof g_undo_final_obj_arr[i][0][0] !== "undefined") {
                        if (typeof g_undo_final_obj_arr[i][0][0].CurrCanvas == "undefined") {
                            newArray.push(g_undo_final_obj_arr[i]);
                        }
                    }
                }
            }
            g_undo_final_obj_arr = newArray;
            var newArray = [];
            for (var i = 0, len = g_redo_final_obj_arr.length; i < len; i++) {
                if (typeof g_redo_final_obj_arr[i][0][0] !== "undefined") {
                    if (typeof g_redo_final_obj_arr[i][0][0].CurrCanvas == "undefined") {
                        newArray.push(g_redo_final_obj_arr[i]);
                    }
                }
            }
            g_redo_final_obj_arr = newArray;
            g_curr_canvas = g_pog_index;
            g_start_canvas = g_pog_index;
            reset_indicators();
            if (g_show_item_color == "Y") {
                g_pog_json[p_pog_index].GroupingType = g_scene_objects[g_pog_index].Indicators.canvas_color_flag;
                $s("P193_SELECT_COLOR_TYPE", g_scene_objects[g_pog_index].Indicators.canvas_color_flag);
            }

            var width = p_canvas.width;
            var height = p_canvas.height;
            var a = (2 * p_x) / width - 1;
            var b = 1 - (2 * p_y) / height;
            g_carpark_item_flag = "N";
            g_carpark_edit_flag = "N";
            g_module_edit_flag = "N";
            g_shelf_edit_flag = "N";
            g_item_edit_flag = "N";
            g_module_index = -1;
            g_shelf_index = -1;
            g_module_cnt = -1;
            g_item_index = -1;
            g_module_width = -1;
            comp_obj_id = -1;
            g_module_X = "";
            g_shelf_max_merch = "";
            g_shelf_basket_spread = "";
            render(g_pog_index);
            //g_raycaster is used to find the objects that hit on the mouse click position. we need to set camera in that position
            //and send all the childrens in the world. which will give you back list of object hit on that position in an array.
            //index 0 object will be the nearest to the mouse and others are behind them.
            new_camera.updateProjectionMatrix();
            g_raycaster.setFromCamera(new THREE.Vector2(a, b), new_camera);
            g_intersects = g_raycaster.intersectObjects(new_world.children); // no need for recusion since all objects are top-level

            $s("P193_SELECTED_CANVAS", `${g_curr_canvas}`);

            //if there is no objects behing cursor its the empty place outside POG. for that we use an invisible object to find the location.
            if (g_intersects.length == 0) {
                g_mselect_drag = "N"; //ASA-1692
                g_multiselect = "N"; //ASA-1681
                g_ctrl_select = "N"; //ASA-1681
                g_delete_details = []; //ASA-1681
                //if any other item is blinking stop blink
                if (g_intersected && g_intersected.length > 0) {
                    for (var i = 0; i < g_intersected.length; i++) {
                        if (typeof g_intersected[i] !== "undefined") {
                            if (typeof g_intersected[i].BorderColour !== "undefined") {
                                g_select_color = g_intersected[i].BorderColour;
                            }
                            g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                            if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                                g_intersected[i].WireframeObj.material.transparent = true;
                                g_intersected[i].WireframeObj.material.opacity = 0.0025;
                            }
                        }
                    }
                    clearInterval(g_myVar);
                    g_select_color = 0x000000;
                    render(g_pog_index);
                }
                //add invisible object into g_scene_objects[p_pog_index].scene.children[2]. to find location. after getting location remove it.
                new_world.add(g_targetForDragging);
                g_targetForDragging.position.set(0, 0, 0);
                render(g_pog_index);

                g_intersects = g_raycaster.intersectObjects(new_world.children);
                //now get the x y position.
                if (g_intersects.length > 0) {
                    var locationX = g_intersects[0].point.x;
                    var locationY = g_intersects[0].point.y;
                    g_drag_z = g_intersects[0].point.z;
                    g_drag_z = g_drag_z + 0.001;

                    var coords = new THREE.Vector3(locationX, locationY, locationZ);
                    new_world.worldToLocal(coords);
                    var a = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
                    var p_y = Math.min(19, Math.max(-19, coords.y));
                    if (p_context_call == "N") {
                        g_DragMouseStart.x = a;
                        g_DragMouseStart.y = p_y;
                        g_DragMouseEnd.x = a;
                        g_DragMouseEnd.y = p_y;
                    }
                    //this vector is used to create a multi select drag box. which will be used when mouse up to find out how many
                    //objects did user select and place all of them in g_delete_details array.
                    g_startMouse.x = p_event.clientX + scroll_left - (btn_cont_width + padding);
                    g_startMouse.y = p_event.clientY + scroll_top - (breadcrumb_height + padding + header_height + top_bar_height + wtbar_height);

                    g_prevMouse.x = a;
                    g_prevMouse.y = p_y;
                    g_nextMouse = g_prevMouse.clone();
                    new_world.remove(g_targetForDragging);
                    g_intersected = [];
                    g_select_zoom_arr = [];
                    //if ctrl is holded that means duplicate of fixel is in progress.
                    if (g_context_opened == "N" && !p_event.shiftKey) {
                        var x2 = g_startMouse.x;
                        var y2 = g_startMouse.y;
                        g_selecting = true;
                        g_selection.style.left = g_startMouse.x + "px";
                        g_selection.style.top = g_startMouse.y + "px";
                        g_selection.style.width = x2 - g_startMouse.x + "px";
                        g_selection.style.height = y2 - g_startMouse.y + "px";
                        g_selection.style.visibility = "visible";
                        return true;
                    } else if (p_event.shiftKey && g_manual_zoom_ind == "Y") {
                        return true;
                    } else {
                        if (g_context_opened == "Y" && !p_event.shiftKey) {
                            //Task_71070
                            g_mselect_drag = "N";
                            g_context_opened = "N";
                        }
                        return false;
                    }
                } else {
                    g_intersected = [];
                    g_select_zoom_arr = [];
                    return false;
                }
            } else {
                //if cursor is inside the POG.
                if (g_intersects.length > 0) {
                    /*if the object behind cursor is not recognised or by mistake the invisible item to find location
                    is still inside the g_scene_objects[p_pog_index].scene.children[2]. then take details from intersect[1]*/
                    if (g_intersects[0].object.uuid == "drag_object") {
                        var item = g_intersects[1];
                        g_objectHit = item.object;
                        var locationX = g_intersects[1].point.x;
                        g_mousedown_locx = g_intersects[1].point.x;
                        var locationY = g_intersects[1].point.y;
                        var locationZ = g_intersects[1].point.z;
                        g_drag_z = g_intersects[1].point.z;
                    } else {
                        var item = g_intersects[0];
                        g_objectHit = item.object;
                        var locationX = g_intersects[0].point.x;
                        g_mousedown_locx = g_intersects[0].point.x;
                        var locationY = g_intersects[0].point.y;
                        var locationZ = g_intersects[0].point.z;
                        g_drag_z = g_objectHit.position.z;
                    }

                    var coords = new THREE.Vector3(locationX, locationY, locationZ);
                    new_world.worldToLocal(coords);
                    var a = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
                    var z = g_drag_z;
                    g_drag_z = g_drag_z + 0.001;
                    g_itemDragZ = g_objectHit.position.z;
                    g_itemDragX = g_objectHit.position.x;
                    var p_y = Math.min(19, Math.max(-19, coords.y));

                    g_objectHit_uuid = g_objectHit.uuid; //to check whether the dragged item is shelf or item to restrict its movement.
                    g_objectHit_id = g_objectHit.id;

                    /*if g_multiselect is done already and then user clicks of any object
                    inside g_multiselect, calculate distance from cursor.
                    for setting all objects position while dragging.
                     */
                    i = 0;
                    var valid = "N";
                    if (g_multiselect == "Y" || g_ctrl_select == "Y") {
                        for (const objects of g_delete_details) {
                            if (objects.ObjID == g_objectHit_id) {
                                valid = "Y";
                            }
                        }
                        if (valid == "Y") {
                            update_item_xy_distance("Y", p_pog_index, a, p_y);
                            g_mselect_drag = "Y";
                        }
                    } else {
                        g_mselect_drag = "N";
                    }
                    //find the cursor hit object is what and its details
                    get_object_identity(g_pog_index, g_multiselect, g_multi_copy_done, a, p_y);

                    //turn of multi g_selection indicator
                    if (p_context_call == "N" && g_ctrl_select == "N") {
                        g_multiselect = "N";
                    }

                    //if there is a shelf then update the distance of each item inside the shelf.
                    if (g_module_index !== -1 && g_shelf_index !== -1) {
                        update_item_distance(g_module_index, g_shelf_index, g_pog_index);
                    }
                   
                    //set blinking of selected object
                    if (g_intersects.length > 0 && p_context_call == "N" && g_mselect_drag !== "Y") {
                        //ASA-1107
                        if (p_event.altKey == false) {
                            if (g_intersected) {
                                if (g_intersected[0] != g_intersects[0].object) {
                                    for (var i = 0; i < g_intersected.length; i++) {
                                        if (typeof g_intersected[i] !== "undefined") {
                                            if (typeof g_intersected[i].BorderColour !== "undefined") {
                                                g_select_color = g_intersected[i].BorderColour;
                                            }
                                            g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                                            if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                                                g_intersected[i].WireframeObj.material.transparent = true;
                                                g_intersected[i].WireframeObj.material.opacity = 0.0025;
                                            }
                                        }
                                    }
                                }
                            }
                            g_intersected = [];
                            g_select_zoom_arr = [];
                            g_intersected.push(g_objectHit);
                        } else if (p_event.altKey == true) {
                            g_select_zoom_arr.push(g_objectHit);
                            g_intersected.push(g_objectHit);
                            if (g_item_edit_flag == "Y" || g_shelf_edit_flag == "Y") {
                                //ASA-1272
                                var items = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
                                var shelfs = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                                add_ctrl_select_items(g_shelf_edit_flag == "Y" ? "S" : "I", g_shelf_edit_flag == "Y" ? {} : items, shelfs, g_module_index, g_shelf_index, g_item_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID, g_objectHit_id, p_pog_index);
                                g_ctrl_select = "Y";
                                g_multiselect = "Y";
                                g_multiItemCopy = "Y";
                            }
                        }
                        render_animate_selected();
                    } else {
                        if (g_intersected) {
                            for (var i = 0; i < g_intersected.length; i++) {
                                if (typeof g_intersected[i] !== "undefined") {
                                    g_select_color = g_intersected[i].BorderColour;
                                    g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                                    if (g_intersected[i].ImageExists == "Y" && (g_show_live_image == "Y" || g_show_live_image_comp == "Y")) {
                                        g_intersected[i].WireframeObj.material.transparent = true;
                                        g_intersected[i].WireframeObj.material.opacity = 0.0025;
                                    }
                                }
                            }
                            clearInterval(g_myVar);
                            g_select_color = 0x000000;
                            render(g_pog_index);
                        }
                    }
                    //this block is restricted to compare view screens. set blinkin of similar item its PREVIOUS_VERSION or EDIT_PALLET
                    if (g_pog_index == g_ComViewIndex) {
                        if (g_compare_view !== "POG" && typeof comp_obj_id !== "undefined" && g_compare_view !== "PREV_VERSION" && g_compare_view !== "EDIT_PALLET") {
                            var selectedObject = g_scene_objects[g_ComBaseIndex].scene.children[2].getObjectById(comp_obj_id);
                            if (typeof selectedObject !== "undefined") {
                                g_intersected.push(selectedObject);
                            }
                            clearInterval(g_myVar);
                            g_select_color = 0x000000;
                            render_animate_selected();
                            // } else if (g_compare_view == "POG" || g_compare_view == "PREV_VERSION" || g_compare_view == "EDIT_PALLET") {    //ASA-1548 Issue 1
                        } else if (g_compare_view == "POG" || (g_compare_view == "PREV_VERSION" && p_event.altKey == false) || g_compare_view == "EDIT_PALLET") {
                            //ASA-1548 Issue 1
                            //ASA-1085
                            var item_list = get_similar_items(g_objectHit_uuid, "I", g_ComBaseIndex);
                            g_intersected = []; //ASA-1548 Issue 1
                            if (item_list.length > 0) {
                                for (var i = 0; i < item_list.length; i++) {
                                    g_intersected.push(item_list[i]);
                                }
                                clearInterval(g_myVar);
                                g_select_color = 0x000000;
                                render_animate_selected();
                            }
                        }
                        // } else if ((g_module_edit_flag == "Y" || g_shelf_edit_flag == "Y" || g_item_edit_flag == "Y") && g_ComViewIndex > -1) { //ASA-1548 Issue 1
                    } else if ((g_module_edit_flag == "Y" || g_shelf_edit_flag == "Y" || g_item_edit_flag == "Y") && g_ComViewIndex > -1 && p_event.altKey == false) {
                        //ASA-1548 Issue 1
                        if (g_compare_view !== "POG" && typeof comp_obj_id !== "undefined" && g_compare_pog_flag == "Y") {
                            if (g_scene_objects[g_ComViewIndex].scene.children[2].children.length > 0) {
                                var selectedObject = g_scene_objects[g_ComViewIndex].scene.children[2].getObjectById(comp_obj_id);
                                g_intersected = []; //ASA-1548 Issue 1
                                if (typeof selectedObject !== "undefined") {
                                    g_intersected.push(selectedObject);
                                }
                                clearInterval(g_myVar);
                                g_select_color = 0x000000;
                                render_animate_selected();
                            }
                        } else {
                            if (g_item_edit_flag == "Y") {
                                var item_list = get_similar_items(g_objectHit_uuid, "I", g_ComViewIndex);
                                g_intersected = []; //ASA-1548 Issue 1
                                if (item_list.length > 0) {
                                    for (var i = 0; i < item_list.length; i++) {
                                        g_intersected.push(item_list[i]);
                                    }
                                    clearInterval(g_myVar);
                                    g_select_color = 0x000000;
                                    render_animate_selected();
                                }
                            }
                        }
                    }

                    g_drag_x = g_module_X; //g_objectHit.position.x;
                    //ASA-1422
                    if (g_shift_mutli_item_select == "Y" && g_item_index !== -1) {
                        var clickedItem;
                        if (g_carpark_item_flag == "Y") {
                            clickedItem = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index];
                        } else {
                            clickedItem = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
                        }
                        clickedItem.isCarpark = g_carpark_item_flag;
                        if ($.isEmptyObject(g_shift_multi_item_first)) {
                            g_shift_multi_item_first = clickedItem;
                        } else {
                            g_shift_multi_item_last = clickedItem;
                        }
                    }
                    if (g_shelf_index !== -1 && g_module_index !== -1) {
                        var retval = update_item_distance(g_module_index, g_shelf_index, g_pog_index);
                    }
                    render(g_pog_index);
                    if (nvl(g_pog_json) !== 0 && g_compare_view !== "PREV_VERSION" && (g_item_edit_flag == "Y" || g_shelf_edit_flag == "Y")) {
                        backupPog("S", g_shelf_index, g_module_index, g_pog_index);
                    }
                    //if its carpark shelf its not allowed to move anywhere.
                    //ASA-1085
                    if (g_carpark_edit_flag == "Y" || (g_shelf_edit_flag == "Y" && g_pog_index == g_ComViewIndex && g_compare_view == "EDIT_PALLET")) {
                        return false;
                        //its hit object is module or base or notch dont allow to drag.
                    } else if (g_pog_index == g_ComViewIndex && g_compare_view !== "EDIT_PALLET" && g_compare_view !== "PREV_VERSION") {
                        //ASA-1170
                        return false;
                        //its hit object is module or base or notch dont allow to drag.
                    } else if (g_module_edit_flag == "Y" || g_module_obj_array.indexOf(g_objectHit) !== -1 || g_objectHit_uuid.match(/BASE.*/) || g_objectHit_uuid.match(/NOTCH.*/)) {
                        //if ctrl key is pressed and object hit is module then module to be duplicated.
                        if (g_auto_fill_active == "N") {
                            //ASA-1085 added autofill condition
                            if (p_event.ctrlKey && g_module_edit_flag == "Y") {
                                context_copy("S", p_pog_index);
                                g_duplicating = "Y";
                            } else if (p_event.ctrlKey && g_item_edit_flag == "Y") {
                                context_copy("S", p_pog_index);
                                g_duplicating = "Y";
                                g_dupShelfDepth = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].D;
                            }
                        }
                        else if (g_auto_fill_active == "Y" && g_mod_block_list.length > 0) {
                            //ASA- 1965-Task-3
                            var hitMatchesUuid = function (uid) {
                                try {
                                    if (typeof g_raycaster === 'undefined') return false;
                                    // find the mesh for this block (if available)
                                    for (const cObj of g_mod_block_list) {
                                        if (cObj.BlkName === uid) {
                                            var coloredModule = cObj.BlockDim && cObj.BlockDim.ColorObj ? cObj.BlockDim.ColorObj : null;
                                            if (!coloredModule) return false;
                                            var mesh = coloredModule.getObjectByProperty("uuid", uid);
                                            if (!mesh) return false;
                                            var hits = g_raycaster.intersectObject(mesh, true);
                                            return hits && hits.length > 0;
                                        }
                                    }
                                } catch (e) {
                                    return false;
                                }
                                return false;
                            };

                            for (colorObj of g_mod_block_list) {
                                if (colorObj.mod_index[0] == g_module_index) {
                                    // Consider the raycast intersections and ancestor chain so we detect a block
                                    // even if the immediate hit was the module/group.
                                    if (hitMatchesUuid(colorObj.BlkName)) {
                                        var objUuid = colorObj.BlkName;
                                        var coloredModule = colorObj.BlockDim.ColorObj;
                                        g_dragItem = coloredModule.getObjectByProperty("uuid", objUuid);
                                        return true;
                                    }
                                }
                            }  //1965- END
                        }    //ASA-1697 commented else-if block

                        /*setting the g_multiselect element if user wants to do g_multiselect.
                        g_multiselect is only allow when mousedown happened on module or outside POG.
                         */
                        if (g_context_opened == "N") {
                            g_startMouse.x = p_event.clientX + scroll_left - (btn_cont_width + padding);
                            g_startMouse.y = p_event.clientY - (breadcrumb_height + padding + header_height + top_bar_height + wtbar_height);

                            g_prevMouse.x = a;
                            g_prevMouse.y = p_y;
                            g_nextMouse = g_prevMouse.clone();
                            g_DragMouseStart.x = a;
                            g_DragMouseStart.y = p_y;
                            g_DragMouseEnd.x = a;
                            g_DragMouseEnd.y = p_y;

                            var x2 = g_startMouse.x + 1;
                            var y2 = g_startMouse.y + 1;
                            if (!p_event.shiftKey) {
                                g_selecting = true;
                                g_selection.style.left = g_startMouse.x + "px";
                                g_selection.style.top = g_startMouse.y + "px";
                                g_selection.style.width = x2 - g_startMouse.x + "px";
                                g_selection.style.height = y2 - g_startMouse.y + "px";
                                g_selection.style.visibility = "visible";
                            }
                            if (g_intersected) {
                                for (var i = 0; i < g_intersected.length; i++) {
                                    if (typeof g_intersected[i] !== "undefined") {
                                        g_select_color = g_intersected[i].BorderColour;
                                        g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                                        if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                                            g_intersected[i].WireframeObj.material.transparent = true;
                                            g_intersected[i].WireframeObj.material.opacity = 0.0025;
                                        }
                                    }
                                }
                                clearInterval(g_myVar);
                                g_select_color = 0x000000;
                                render(g_pog_index);
                                g_intersected = [];
                                g_select_zoom_arr = [];
                            }
                            g_select_zoom_arr.push(g_objectHit);
                            g_intersected.push(g_objectHit);
                            if (g_pog_index == g_ComViewIndex && g_module_edit_flag == "Y" && typeof comp_obj_id !== "undefined") {
                                var selectedObject = g_scene_objects[g_ComViewIndex].scene.children[2].getObjectById(comp_obj_id);
                                if (typeof selectedObject !== "undefined") {
                                    g_intersected.push(selectedObject);
                                }
                            } else if (g_module_edit_flag == "Y" && g_compare_pog_flag == "Y" && typeof comp_obj_id !== "undefined") {
                                if (g_scene_objects[g_ComViewIndex].scene.children[2].children.length > 0) {
                                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(comp_obj_id);
                                    if (typeof selectedObject !== "undefined") {
                                        g_intersected.push(selectedObject);
                                    }
                                }
                            } else if (g_objectHit_uuid.match(/BASE.*/) && g_compare_pog_flag == "Y" && typeof g_pog_json[p_pog_index].CompBaseObjID !== "undefined") {
                                var selectedObject = g_scene_objects[g_ComViewIndex].scene.children[2].getObjectById(g_pog_json[p_pog_index].CompBaseObjID);
                                if (typeof selectedObject !== "undefined") {
                                    g_intersected.push(selectedObject);
                                }
                            }
                            render_animate_selected();
                            return true;
                        } else {
                            return false;
                        }
                    } else if (g_auto_fill_active == "N") {
                        //This is the logic to create a multi select box to do multi select of objects inside the chest. as chest is very big
                        //user expect to click on any place in chest and drag so items can be multi select.
                        //Note: Chest drag will happen when user hold Character C and then click on chest and move.
                        g_dragItem = g_objectHit;
                        if (g_chest_move == "N" && g_shelf_object_type == "CHEST" && g_shelf_edit_flag == "Y" && g_chest_as_pegboard == "Y") {
                            //ASA-1300
                            g_startMouse.x = p_event.clientX + scroll_left - (btn_cont_width + padding);
                            g_startMouse.y = p_event.clientY - (breadcrumb_height + padding + header_height + top_bar_height + wtbar_height);
                            g_prevMouse.x = a;
                            g_prevMouse.y = p_y;
                            g_nextMouse = g_prevMouse.clone();
                            g_DragMouseStart.x = a;
                            g_DragMouseStart.y = p_y;
                            g_DragMouseEnd.x = a;
                            g_DragMouseEnd.y = p_y;
                            var x2 = g_startMouse.x + 1;
                            var y2 = g_startMouse.y + 1;
                            if (!p_event.shiftKey) {
                                g_selecting = true;
                                g_selection.style.left = g_startMouse.x + "px";
                                g_selection.style.top = g_startMouse.y + "px";
                                g_selection.style.width = x2 - g_startMouse.x + "px";
                                g_selection.style.height = y2 - g_startMouse.y + "px";
                                g_selection.style.visibility = "visible";
                            }
                        } else {
                            if (g_shelf_edit_flag == "Y" && g_shelf_object_type !== "DIVIDER" && g_shelf_object_type !== "TEXTBOX") {
                                g_dragItem.ShelfInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                                g_dragItem.StartCanvas = g_start_canvas;
                                g_dragItem.MIndex = g_module_index;
                                g_dragItem.SIndex = g_shelf_index;
                                var j = 0;
                                for (const items of g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo) {
                                    var selectedObject = new_world.getObjectById(items.ObjID);
                                    if (typeof selectedObject !== "undefined") {
                                        if (g_shelf_object_type !== "PEGBOARD") {
                                            selectedObject.Distance = items.Distance;
                                        } else {
                                            selectedObject.PegBoardX = items.PegBoardX;
                                            selectedObject.PegBoardY = items.PegBoardY;
                                        }
                                        selectedObject.ItemInfo = items;
                                        selectedObject.IIndex = j;
                                        selectedObject.StartCanvas = g_start_canvas;
                                        selectedObject.MIndex = g_module_index;
                                        selectedObject.SIndex = g_shelf_index;
                                        g_drag_items_arr.push(selectedObject);
                                    }
                                    j++;
                                }
                            } else if (g_item_edit_flag == "Y") {
                                g_dragItem.ItemInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
                                g_dragItem.MIndex = g_module_index;
                                g_dragItem.SIndex = g_shelf_index;
                                g_dragItem.IIndex = g_item_index;
                                g_dragItem.StartCanvas = g_start_canvas;
                            } else if (g_shelf_edit_flag == "Y") {
                                g_dragItem.ShelfInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                                g_dragItem.StartCanvas = g_start_canvas;
                                g_dragItem.MIndex = g_module_index;
                                g_dragItem.SIndex = g_shelf_index;
                            }
                            if (p_event.ctrlKey && g_shelf_edit_flag == "Y") {
                                context_copy("S", p_pog_index);
                                g_duplicating = "Y";
                                render_animate_selected(); //ASA-1107
                            } else if (p_event.ctrlKey && g_item_edit_flag == "Y") {
                                context_copy("S", p_pog_index);
                                g_duplicating = "Y";
                                g_dupShelfDepth = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].D;
                                render_animate_selected(); //ASA-1107
                            }
                        }
                        if (p_context_call == "N") {
                            return true;
                        }
                    }
                } else {
                    //if no objects found remove blinking.
                    if (g_intersected) {
                        for (var i = 0; i < g_intersected.length; i++) {
                            if (typeof g_intersected[i] !== "undefined") {
                                g_select_color = g_intersected[i].BorderColour;
                                g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                                if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                                    g_intersected[i].WireframeObj.material.transparent = true;
                                    g_intersected[i].WireframeObj.material.opacity = 0.0025;
                                }
                            }
                        }
                        clearInterval(g_myVar);
                        g_select_color = 0x000000;
                        render(g_pog_index);
                        g_intersected = [];
                        g_select_zoom_arr = [];
                    }
                }
            }
            logDebug("function : doMouseDown", "E");
        }
    } catch (err) {
        error_handling(err);
    }
}