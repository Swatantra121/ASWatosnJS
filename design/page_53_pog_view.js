
var g_item_vertical_text_display = $v("P53_ITEM_CODE_VERT_ALN"); //ASA-1847 4.1
var g_item_text_center_align = $v("P53_ITEM_CODE_CTR_ALN"); //ASA-1847 4.1

function setUpMouseHander(p_element, p_mouseDragFunc, p_mouseDownFunc, p_mouseUpFunc, p_renderer, p_pog_index) {
    try {
        if (typeof p_element == "string") {
            p_element = document.getElementById(p_element);
        }
        if (!p_element || !p_element.addEventListener) {
            throw "first argument in setUpMouseHander is not a valid element";
        }
        var startX,
            startY;
        var prevX,
            prevY;

        function doMouseDown(evt) {
            if (g_dragging) {
                return;
            }
            if (window.event.which == 1) {
                g_taskItemInContext = clickInsideElement(evt, "canvasregion");
                g_taskItemInContext1 = clickInsideElement(evt, "canvasregion1");

                if (g_taskItemInContext) {
                    g_canvas = document.getElementById("maincanvas");
                } else {
                    g_canvas = document.getElementById("maincanvas1");
                }

                var r = g_canvas.getBoundingClientRect();
                var start_x = r.left;
                var start_y = r.top;
                var x = evt.clientX - r.left;
                var y = evt.clientY - r.top;
                prevX = startX = x;
                prevY = startY = y;
                g_dragging = p_mouseDownFunc(x, y, start_x, start_y, evt, g_canvas, "N", p_pog_index);
            }
        }

        function doMouseUp(p_event) {
            if (g_dragging) {
                g_taskItemInContext = clickInsideElement(p_event, "canvasregion");
                g_taskItemInContext1 = clickInsideElement(p_event, "canvasregion1");

                var NEW_POGJSON = [];
                var new_camera = {};
                var new_world;
                if (g_taskItemInContext) {
                    g_canvas = document.getElementById("maincanvas");
                    NEW_POGJSON = g_pog_json;
                    if (typeof g_scene_objects[p_pog_index] !== "undefined") {
                        new_camera = g_scene_objects[p_pog_index].scene.children[0];
                        new_world = g_scene_objects[p_pog_index].scene.children[2];
                    }
                    else {
                        new_camera = g_camera;
                        new_world = g_world;
                    }
                } else {
                    g_canvas = document.getElementById("maincanvas1");
                    NEW_POGJSON = g_pog_json_comp;
                    new_camera = g_camera_comp;
                    new_world = g_world_comp;
                }
                if (p_mouseUpFunc) {
                    var r = g_canvas.getBoundingClientRect();
                    var x = p_event.clientX - r.left;
                    var y = p_event.clientY - r.top;
                    p_mouseUpFunc(x, y, p_event, prevX, prevY, g_canvas, new_camera, NEW_POGJSON, p_pog_index);
                }
                g_dragging = false;
            }
        }

        function doMouseMove(p_event) {
            if (p_mouseDragFunc) {
                var canvas = document.getElementById("maincanvas"),
                    NEW_POGJSON = g_pog_json,
                    jselector = "#maincanvas";
                if (typeof g_scene_objects[p_pog_index] !== "undefined") {
                    new_camera = g_scene_objects[p_pog_index].scene.children[0];
                    new_world = g_scene_objects[p_pog_index].scene.children[2];
                }
                else {
                    new_camera = g_camera;
                    new_world = g_world;
                }

                var r = canvas.getBoundingClientRect();
                var obj_height = r.height;
                var x = p_event.clientX - r.left;
                var y = p_event.clientY - r.top;
                p_mouseDragFunc(x, y, p_event, prevX, prevY, canvas, NEW_POGJSON, jselector, p_pog_index);
            }
            prevX = x;
            prevY = y;
        }
        document.addEventListener("mousemove", doMouseMove);
        p_renderer.domElement.addEventListener("mousedown", doMouseDown);
        p_renderer.domElement.addEventListener("mouseup", doMouseUp);
    } catch (err) {
        error_handling(err);
    }
}

function init() {
    try {
        g_canvas_region = document.getElementById("drawing_region");
        g_selection = document.getElementById("selection");
        g_renderer = new THREE.WebGLRenderer({
            canvas: g_canvas,
            antialias: true
        });
        g_canvas_objects.push(g_canvas);
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML = "<p><b>Sorry, an error occurred:<br>" + e + "</b></p>";
        return;
    }
    createWorld();
    g_raycaster = new THREE.Raycaster();
    render();
    multiselect = "N";
    ctrl_select = "N";

    g_windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;

    setUpMouseHander("maincanvas", doMouseMove, doMouseDown, doMouseUp, g_renderer, g_pog_index);
    g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);
    g_windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;

    g_initial_windowHeight = window.innerHeight;

    g_camera.aspect = windowWidth / g_windowHeight;

    // adjust the FOV
    g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV * (g_windowHeight / g_initial_windowHeight));
    g_camera.updateProjectionMatrix();
    g_renderer.render(g_scene, g_camera);
    window.addEventListener("resize", onWindowResize, false);
    onWindowResize("F");
}

function onWindowResize(p_event) {
    try {
        g_windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;

        g_camera.aspect = windowWidth / g_windowHeight;

        // adjust the FOV
        g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV * (g_windowHeight / g_initial_windowHeight));

        g_renderer.setSize(windowWidth, g_windowHeight);
        g_camera.updateProjectionMatrix();
        g_renderer.render(g_scene, g_camera);
    } catch (err) {
        error_handling(err);
    }
}

async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_stop_loading, p_create_pdf_ind, p_recreate, p_create_json, p_pog_index) {
    try {
        $("#LIVE_IMAGE").addClass("apex_disabled");
        //Start ASA-1371_26842
        console.log('g_show_live_image', g_show_live_image);
        if ($v('P53_POGCR_DFT_NOTCH_LABEL') == "Y") {
            g_show_notch_label = 'Y';
            //show_notch_labels("Y", $v("P53_NOTCH_HEAD"), "Y", p_pog_index);
        }
        if ($v('P53_POGCR_DFT_FIXEL_LABEL') == "Y") {
            g_show_fixel_label = 'Y';
            //show_fixel_labels("Y", p_pog_index);
        }
        if ($v('P53_POGCR_SHOW_DFLT_ITEM_LOC') == "Y") {
            g_show_item_label = 'Y';
            //show_item_labels("Y", $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        }
        //End ASA-1371_26842
        await load_orientation_json();//task_26897 Regression 
        await create_module_from_json_lib(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_recreate, p_create_json, $v("P53_VDATE"), $v("P53_POG_DEFAULT_COLOR"), $v("P53_MODULE_DEFAULT_COLOR"), null, false, "N", null, $v("P53_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P53_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P53_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P53_BASKET_WALL_THICK")), parseFloat($v("P53_CHEST_WALL_THICK")), $v("P53_POGCR_PEG_ITEM_AUTO_PLACE"), $v("P53_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P53_POGCR_TEXT_DEFAULT_SIZE")), $v("P53_POG_TEXTBOX_DEFAULT_COLOR"), $v("P53_SHELF_DEFAULT_COLOR"), $v("P53_DIV_COLOR"), $v("P53_SLOT_DIVIDER"), $v("P53_SLOT_ORIENTATION"), $v("P53_DIVIDER_FIXED"), $v("P53_ITEM_DFT_COLOR"), $v("P53_POGCR_DELIST_ITEM_DFT_COLOR"), "Y", null, 1, $v("P53_MERCH_STYLE"), $v("P53_POGCR_LOAD_IMG_FROM"), $v("P53_BU_ID"), $v("P53_POGCR_DELIST_ITEM_DFT_COLOR"), $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), $v("P53_NOTCH_HEAD"), "N", $v("P53_POGCR_DFT_BASKET_FILL"), $v("P53_POGCR_DFT_BASKET_SPREAD"), g_camera, p_pog_index, null, $v("P53_POGCR_NOTCH_START_VALUE"), "N", "Y", "N");//--ASA-1310 prasanna ASA-1310_20240307 //Regression 29(Portal Issue) added p_calc_dayofsupply

        await get_all_images(p_pog_index, "N", "N", $v("P53_POGCR_IMG_MAX_WIDTH"), $v("P53_POGCR_IMG_MAX_HEIGHT"), $v("P53_IMAGE_COMPRESS_RATIO"));
        console.log('$v("P53_POGCR_DFT_ITEM_DESC")', $v("P53_POGCR_DFT_ITEM_DESC"), g_ItemImages.length, $v("P53_POGCR_DFLT_LIVE_IMAGES"), g_show_live_image);
        if ($v("P53_POGCR_DFT_ITEM_DESC") == "Y" || (g_ItemImages.length == 0 && $v("P53_POGCR_DFLT_LIVE_IMAGES") == "Y")) {
            await showHideItemDescription("Y", $v("P53_ITEM_DFT_COLOR"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
            g_show_item_desc = "Y";
            $v("P53_POGCR_DFT_ITEM_DESC") == "Y" ? g_show_live_image = "N" : g_show_live_image = 'Y';
        }
        $("#LIVE_IMAGE").removeClass("apex_disabled");
        if (g_ItemImages.length > 0 && p_create_pdf_ind == "N" && $v("P53_POGCR_DFLT_LIVE_IMAGES") == "Y" && $v("P53_POGCR_DFT_ITEM_DESC") == "N") {
            try {
                g_show_live_image = "Y";
                await recreate_image_items('Y', $v("P53_MERCH_STYLE"), $v("P53_POGCR_LOAD_IMG_FROM"), $v("P53_BU_ID"), $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), $v("P53_POGCR_DELIST_ITEM_DFT_COL"), $v("P53_NOTCH_HEAD"), p_pog_index, 'N', '', $v('P53_POGCR_ITEM_DETAIL_LIST'));
            } catch (err) {
                console.log("load images problem", err);
            }
        } else if ($v("P53_POGCR_DFT_ITEM_DESC") == "N" && $v('P53_POGCR_DFT_DAYS_OF_SUPPLY') == "Y") {
            var res = showHideDaysOfSupplyLabel("Y", 'N', p_pog_index, 'Y', 'N', $v("P53_POGCR_FONTSIZE_DAYSOFSUPP"), $v('P53_POGCR_ITEM_DETAIL_LIST'));
        }

        animate_pog(0);//Task_26813
        /*if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && p_recreate == 'Y') {//ASA-1350 issue 6//ASA-1353 issue 3 --Task_27104 20240417
           var m = 0;
           var moduleCombInfo = g_pog_json[p_pog_index].ModuleInfo;
           for (g_module of moduleCombInfo) {
               var s = 0;
               var shelfCombInfo = g_pog_json[p_pog_index].ModuleInfo[m].ShelfInfo;
               for (shelf_info of shelfCombInfo) {
                   if ((shelf_info.ObjType == "SHELF" || shelf_info.ObjType == "HANGINGBAR") && shelf_info.Combine !== "N") {
                       await generateCombinedShelfs(p_pog_index, m, s, $v("P53_POGCR_DELIST_ITEM_DFT_COL"), $v("P53_MERCH_STYLE"), $v("P53_POGCR_LOAD_IMG_FROM"), $v("P53_BU_ID"), $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), 'N', 'N','N');//g_merge_items, p_calc_days_of_supply-- mergeAdjacentItems and calculateFixelAndSupplyDays not needed to call from this page.
                   }
                   s++;
               }
               m++;
           }
       }*/

        var details = get_min_max_xy(p_pog_index);
        var details_arr = details.split("###");
        set_camera_z(g_scene_objects[p_pog_index].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), p_pog_index);
        render();

        if (p_stop_loading == "Y") {
            removeLoadingIndicator(regionloadWait);
        }

    } catch (err) {
        error_handling(err);
    }
    return "SUCCESS";
}

function doMouseMove(p_x, p_y, p_event, p_prevX, p_prevY, p_canvas, p_pog_json_opp, p_jselector, p_pog_index) {
    /* This is mouse move listner function
    This function handles
    1. dragging of any object set object current position
    2. resetting size of multiselect box
    3. grab and move scene which manually zoom is done
    4. setting items position for multiselect object dragging
    5. when not dragging show item info in bottom of screen.
     */
    try {
        //get the intersect object and from that get the current x y position
        var width = p_canvas.width / window.devicePixelRatio;
        var height = p_canvas.height / window.devicePixelRatio;
        var a = (2 * p_x) / width - 1;
        var b = 1 - (2 * p_y) / height;
        var yaxis = p_y;
        var scroll_top = $(document).scrollTop();
        var scroll_left = $(".t-Region-body").scrollLeft();

        g_camera.updateProjectionMatrix();
        g_raycaster.setFromCamera(new THREE.Vector2(a, b), g_camera);
        if (typeof g_scene_objects[p_pog_index] !== 'undefined') {
            g_intersects = g_raycaster.intersectObjects(g_scene_objects[p_pog_index].scene.children[2].children); // no need for recusion since all objects are top-level
        }
        else {
            g_intersects = g_raycaster.intersectObjects(g_world.children);
        } // no need for recusion since all objects are top-level

        /* if dragging is in progress set new positions
        if ctrl key is pressed while mouse move it means user wants to
        create a duplicate of a fixel so do not set new position.
         */

        //if intersected object is item then get details and show in bottom of screen.
        var $doc = $(document),
            $win = $(window),
            $this = $("#object_info"),
            offset = $this.offset(),
            dTop = offset.top - $doc.scrollTop(),
            dBottom = $win.height() - dTop - $this.height(),
            dLeft = offset.left - $doc.scrollLeft(),
            dRight = $win.width() - dLeft - $this.width();
        g_mouse.x = p_event.clientX + scroll_left - 20;
        g_mouse.y = p_event.clientY + scroll_top;

        var x1 = g_startMouse.x;
        var x2 = g_mouse.x;
        var y1 = g_startMouse.y;
        var y2 = g_mouse.y;

        if (x1 > x2) {
            var tmp1 = x1;
            x1 = x2;
            x2 = tmp1;
        }

        if (y1 > y2) {
            var tmp2 = y1;
            y1 = y2;
            y2 = tmp2;
        }
        if (g_dragging) {
            g_raycaster.setFromCamera(new THREE.Vector2(a, b), g_camera);
            g_intersects = g_raycaster.intersectObject(g_targetForDragging);

            var z = g_drag_z;
            var locationX = g_intersects[0].point.x;
            var locationY = g_intersects[0].point.y;
            var locationZ = g_intersects[0].point.z;

            var coords = new THREE.Vector3(locationX, locationY, locationZ);
            g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);

            a = Math.min(19, Math.max(-19, coords.x));
            p_y = Math.min(19, Math.max(-19, coords.y));
            //multi select box height width and location setting.
            if (g_selecting) {
                g_multiselect = "Y";
                g_DragMouseEnd.x = a;
                g_DragMouseEnd.y = p_y;

                g_selection.style.left = x1 + "px";
                g_selection.style.top = y1 + "px";
                g_selection.style.width = x2 - x1 - 5 + "px";
                g_selection.style.height = y2 - y1 - 5 + "px";
                console.log('g_selection.style.left', g_selection.style.left, g_selection.style.top, g_selection.style.width);
            }
            g_DragMouseEnd.x = a;
            g_DragMouseEnd.y = p_y;
        } else {
            if (g_selecting) {
                g_selecting = false;
                g_selection.style.visibility = "hidden";
            }
        }

        var contextElement = document.getElementById("object_info");
        $("#object_info")
            .contents()
            .filter(function () {
                return this.nodeType == 3;
            })
            .remove();
        var append_detail = "";
        var valid_width = 0;
        var lines_arry = [];
        var divider = " | ";
        if (g_intersects.length > 0 && typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
            var desc_list_arr = $v("P53_POGCR_ITEM_DESC_LIST").split(":");
            for (i = 0; i < desc_list_arr.length; i++) {
                var line_width = 0;
                var divider = i > 0 ? " | " : "";
                if (desc_list_arr[i] == "ITEM") {
                    append_detail = append_detail + divider + get_message("ITEM_ID") + ': <span style="color:yellow">' + g_intersects[0].object.ItemID + "</span>";
                    line_width = (" | " + get_message("ITEM_ID") + ": " + g_intersects[0].object.ItemID).visualLength("ruler");
                }
                if (desc_list_arr[i] == "UPC") {
                    append_detail = append_detail + divider + get_message("POGCR_REP_TEMP_HEAD_BARCODE") + ': <span style="color:yellow">' + g_intersects[0].object.Barcode + "</span>";
                    line_width = (" | " + get_message("POGCR_REP_TEMP_HEAD_BARCODE") + ": " + g_intersects[0].object.Barcode).visualLength("ruler");
                }
                if (desc_list_arr[i] == "DESC") {
                    append_detail = append_detail + divider + get_message("DESCRIPTION") + ': <span style="color:yellow">' + g_intersects[0].object.Description + "</span>";
                    line_width = (" | " + get_message("DESCRIPTION") + ": " + g_intersects[0].object.Description).visualLength("ruler");
                }
                if (desc_list_arr[i] == "BRAND") {
                    append_detail = append_detail + divider + get_message("POGCR_BRAND") + ': <span style="color:yellow">' + g_intersects[0].object.Brand + "</span>";
                    line_width = (" | " + get_message("POGCR_BRAND") + ": " + g_intersects[0].object.Brand).visualLength("ruler");
                }
                if (desc_list_arr[i] == "GROUP") {
                    append_detail = append_detail + divider + get_message("POGCR_GROUP_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Group + "</span>";
                    line_width = (" | " + get_message("POGCR_GROUP_LBL") + ": " + g_intersects[0].object.Group).visualLength("ruler");
                }
                if (desc_list_arr[i] == "DEPT") {
                    append_detail = append_detail + divider + get_message("POGCR_TEMP_HEAD_DEPARTMENT") + ': <span style="color:yellow">' + g_intersects[0].object.Dept + "</span>";
                    line_width = (" | " + get_message("POGCR_TEMP_HEAD_DEPARTMENT") + ": " + g_intersects[0].object.Dept).visualLength("ruler");
                }
                if (desc_list_arr[i] == "CLASS") {
                    append_detail = append_detail + divider + get_message("POGCR_CLASS_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Class + "</span>";
                    line_width = (" | " + get_message("POGCR_CLASS_LBL") + ": " + g_intersects[0].object.Class).visualLength("ruler");
                }
                if (desc_list_arr[i] == "SUBCLASS") {
                    append_detail = append_detail + divider + get_message("POGCR_SUBCLASS_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.SubClass + "</span>";
                    line_width = (" | " + get_message("POGCR_SUBCLASS_LBL") + ": " + g_intersects[0].object.SubClass).visualLength("ruler");
                }
                if (desc_list_arr[i] == "ITEM_SIZE") {
                    append_detail = append_detail + divider + get_message("POGCR_ITEMSIZE_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.SizeDesc + "</span>";
                    line_width = (" | " + get_message("POGCR_ITEMSIZE_LBL") + ": " + g_intersects[0].object.SizeDesc).visualLength("ruler");
                }
                if (desc_list_arr[i] == "SUPPLIER") {
                    append_detail = append_detail + divider + get_message("POGCR_REP_HEAD_SUPPLIERS") + ': <span style="color:yellow">' + g_intersects[0].object.Supplier + "</span>";
                    line_width = (" | " + get_message("POGCR_REP_HEAD_SUPPLIERS") + ": " + g_intersects[0].object.Supplier).visualLength("ruler");
                }
                if (desc_list_arr[i] == "WIDTH") {
                    append_detail = append_detail + divider + get_message("POGCR_WIDTH_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OW * 100).toFixed(2) + "</span>";
                    line_width = (" | " + get_message("POGCR_WIDTH_LBL") + ": " + (g_intersects[0].object.OW * 100).toFixed(2)).visualLength("ruler");
                }
                if (desc_list_arr[i] == "HEIGHT") {
                    append_detail = append_detail + divider + get_message("POGCR_HEIGHT_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OH * 100).toFixed(2) + "</span>";
                    line_width = (" | " + get_message("POGCR_HEIGHT_LBL") + ": " + (g_intersects[0].object.OH * 100).toFixed(2)).visualLength("ruler");
                }
                if (desc_list_arr[i] == "DEPTH") {
                    append_detail = append_detail + divider + get_message("POGCR_DEPTH_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OD * 100).toFixed(2) + "</span>";
                    line_width = (" | " + get_message("POGCR_DEPTH_LBL") + ": " + (g_intersects[0].object.OD * 100).toFixed(2)).visualLength("ruler");
                }
                if (desc_list_arr[i] == "STORE") {
                    append_detail = append_detail + divider + get_message("POGCR_STORE_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.StoreCnt + "</span>";
                    line_width = (" | " + get_message("POGCR_STORE_LBL") + ": " + g_intersects[0].object.StoreCnt).visualLength("ruler");
                }
                if (desc_list_arr[i] == "ITEM_DIM") {
                    append_detail = append_detail + divider + get_message("POGCR_ITEM_DIM_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.ItemDim + "</span>";
                    line_width = (" | " + get_message("POGCR_ITEM_DIM_LBL") + ": " + g_intersects[0].object.ItemDim).visualLength("ruler");
                }
                if (desc_list_arr[i] == "POSITION") {
                    append_detail = append_detail + divider + get_message("POGCR_POSITION_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.LocID + "</span>";
                    line_width = (" | " + get_message("POGCR_POSITION_LBL") + ": " + g_intersects[0].object.LocID).visualLength("ruler");
                }
                if (desc_list_arr[i] == "SHELF") {
                    append_detail = append_detail + divider + get_message("POGCR_SHELF_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Shelf + "</span>";
                    line_width = (" | " + get_message("POGCR_SHELF_LBL") + ": " + g_intersects[0].object.Shelf).visualLength("ruler");
                }
                if (desc_list_arr[i] == "ORIENTATION") {
                    append_detail = append_detail + divider + get_message("POGCR_ORIENTATION_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.OrientationDesc + "</span>";
                    line_width = (" | " + get_message("POGCR_ORIENTATION_LBL") + ": " + g_intersects[0].object.OrientationDesc).visualLength("ruler");
                }
                if (desc_list_arr[i] == "DEPTH_FACING") {
                    append_detail = append_detail + divider + get_message("POGCR_DEPTH_FACING_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.DFacing + "</span>";
                    line_width = (" | " + get_message("POGCR_DEPTH_FACING_LBL") + ": " + g_intersects[0].object.DFacing).visualLength("ruler");
                }
                if (desc_list_arr[i] == "HORIZ_FACING") {
                    append_detail = append_detail + divider + get_message("TEMP_HEAD_HORIZ_FACING") + ': <span style="color:yellow">' + g_intersects[0].object.HorizFacing + "</span>";
                    line_width = (" | " + get_message("TEMP_HEAD_HORIZ_FACING") + ": " + g_intersects[0].object.HorizFacing).visualLength("ruler");
                }
                if (desc_list_arr[i] == "VERT_FACING") {
                    append_detail = append_detail + divider + get_message("TEMP_HEAD_VERT_FACING") + ': <span style="color:yellow">' + g_intersects[0].object.VertFacing + "</span>";
                    line_width = (" | " + get_message("TEMP_HEAD_VERT_FACING") + ": " + g_intersects[0].object.VertFacing).visualLength("ruler");
                }
                if (desc_list_arr[i] == "SELLING_PRICE") {
                    append_detail = append_detail + divider + get_message("SELLING_PRICE_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.SellingPrice).toFixed(2) + "</span>";
                    line_width = (" | " + get_message("SELLING_PRICE_LBL") + ": " + g_intersects[0].object.SellingPrice).visualLength("ruler");
                }
                if (desc_list_arr[i] == "SALES_UNIT") {
                    append_detail = append_detail + divider + get_message("SALES_UNIT_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.SalesUnit).toFixed(2) + "</span>";
                    line_width = (" | " + get_message("SALES_UNIT_LBL") + ": " + g_intersects[0].object.SalesUnit).visualLength("ruler");
                }
                if (desc_list_arr[i] == "NET_SALES") {
                    append_detail = append_detail + divider + get_message("NET_SALES_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.NetSales).toFixed(2) + "</span>";
                    line_width = (" | " + get_message("NET_SALES_LBL") + ": " + g_intersects[0].object.NetSales).visualLength("ruler");
                }
                if (desc_list_arr[i] == "PROFIT") {
                    append_detail = append_detail + divider + get_message("PROFIT_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.Profit).toFixed(2) + "</span>";
                    line_width = (" | " + get_message("PROFIT_LBL") + ": " + g_intersects[0].object.Profit).visualLength("ruler");
                }
                if (desc_list_arr[i] == "TOTAL_MARGIN") {
                    append_detail = append_detail + divider + get_message("POGCR_TOTAL_MARGIN") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.TotalMargin).toFixed(2) + "</span>";
                    line_width = (" | " + get_message("POGCR_TOTAL_MARGIN") + ": " + g_intersects[0].object.TotalMargin).visualLength("ruler");
                }

                valid_width = valid_width + line_width;
                if (valid_width > 1300) {
                    append_detail = append_detail + "<br>";
                    lines_arry.push(valid_width);
                    valid_width = 0;
                }
            }
        } else if (g_intersects.length > 0 && typeof g_intersects[0].object.FixelID !== "undefined" && g_intersects[0].object.FixelID !== "") {
            var pog_version = typeof p_pog_json_opp[p_pog_index].Version !== "undefined" && p_pog_json_opp[p_pog_index].Version !== null ? p_pog_json_opp[p_pog_index].Version : "";
            var draft_version = "";
            var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";

            append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pog_json_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version + divider + get_message("POGCR_POG_MOD") + ': <span style="color:yellow">' + g_intersects[0].object.Module + " </span> " + divider + get_message("POGCR_FIXEL_ID") + ': <span style="color:yellow">' + g_intersects[0].object.FixelID + "</span>";
            contextElement.classList.add("active");
        } else if (g_intersects.length > 0 && typeof g_intersects[0].object.Module !== "undefined" && g_intersects[0].object.Module !== "") {
            var pog_version = typeof p_pog_json_opp[p_pog_index].Version !== "undefined" && p_pog_json_opp[p_pog_index].Version !== null ? p_pog_json_opp[p_pog_index].Version : "";
            var draft_version = "";
            var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";

            append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pog_json_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version + divider + get_message("POGCR_POG_MOD") + ': <span style="color:yellow">' + g_intersects[0].object.Module + "</span>";
            contextElement.classList.add("active");
        } else if (typeof p_pog_json_opp !== "undefined" && p_pog_json_opp.length > 0) {
            var pog_version = typeof p_pog_json_opp[p_pog_index].Version !== "undefined" && p_pog_json_opp[p_pog_index].Version !== null ? p_pog_json_opp[p_pog_index].Version : "";
            var draft_version = "";
            var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";

            append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pog_json_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version;
            contextElement.classList.add("active");
        } else {
            contextElement.classList.remove("active");
        }

        if (g_intersects.length > 0) {
            if (typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
                var height = append_detail.visualHeight("ruler") + 12;
                var buffer_width = desc_list_arr.length > 7 ? 150 : 50;
                if (lines_arry.length > 0) {
                    var width = Math.max.apply(Math, lines_arry) + buffer_width;
                } else {
                    var width = append_detail.visualLength("ruler") + buffer_width;
                }
            } else {
                var height = append_detail.visualHeight("ruler") + 7;
                var width = append_detail.visualLength("ruler") + 50;
            }
        } else {
            var height = append_detail.visualHeight("ruler") + 7;
            var width = append_detail.visualLength("ruler") + 50;
        }

        $("#object_info").html(append_detail);
        contextElement.style.top = window.innerHeight - $this.height() - 15 + "px";
        contextElement.style.width = width + "px";
        contextElement.style.height = height + "px";
        contextElement.style.fontSize = "large";
        contextElement.style.fontFamily = "Tahoma";
        contextElement.style.left = 0 + "px";
    } catch (err) {
        error_handling(err);
    }
}

function get_textbox_z(p_module_index, p_shelf_index, p_x, p_y, p_width, p_height, p_pog_index) {
    try {
        var shelf_start = p_x - p_width / 2;
        var shelf_end = p_x + p_width / 2;
        var shelf_top = p_y + p_height / 2;
        var shelf_bottom = p_y - p_height / 2;
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var obj_hit = "N",
            obj_z = 0;
        var i = 0;

        for (const modules of module_details) {
            if (obj_hit == "Y") {
                break;
            }
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var l_shelf_details = modules.ShelfInfo;
                var j = 0;
                for (const shelfs of l_shelf_details) {
                    if (obj_hit == "Y") {
                        break;
                    }
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                        if (shelfs.ItemInfo.length > 0) {
                            var item_Details = shelfs.ItemInfo;
                            var k = 0;
                            for (const items of item_Details) {
                                var div_left = items.X - items.W / 2;
                                var div_right = items.X + items.W / 2;
                                var div_top = items.Y + items.H / 2;
                                var div_bottom = items.Y - items.H / 2;
                                if ((shelf_start >= div_left && shelf_start < div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top))) || (shelf_end > div_left && shelf_end <= div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top))) || (shelf_start < div_left && shelf_end > div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top)))) {
                                    obj_hit = "Y";
                                    obj_z = g_pog_json[p_pog_index].BackDepth / 2 + shelfs.D + 0.005;
                                    break;
                                } else if ((shelf_start >= div_left && shelf_start && shelf_top > div_top && shelf_bottom < div_bottom) || (shelf_end > div_left && shelf_end <= div_right && shelf_top > div_top && shelf_bottom < div_bottom)) {
                                    obj_hit = "Y";
                                    obj_z = g_pog_json[p_pog_index].BackDepth / 2 + shelfs.D + 0.005;
                                    break;
                                }

                                k = k + 1;
                            }
                        } else {
                            var div_left = shelfs.X - shelfs.W / 2;
                            var div_right = shelfs.X + shelfs.W / 2;
                            var div_top = shelfs.Y + shelfs.H / 2;
                            var div_bottom = shelfs.Y - shelfs.H / 2;
                            if ((shelf_start >= div_left && shelf_start < div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top))) || (shelf_end > div_left && shelf_end <= div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top))) || (shelf_start < div_left && shelf_end > div_right && ((shelf_top > div_bottom && shelf_top <= div_top) || (shelf_bottom >= div_bottom && shelf_bottom < div_top)))) {
                                obj_hit = "Y";
                                obj_z = g_pog_json[p_pog_index].BackDepth / 2 + shelfs.D + 0.005;
                                break;
                            } else if ((shelf_start >= div_left && shelf_start && shelf_top > div_top && shelf_bottom < div_bottom) || (shelf_end > div_left && shelf_end <= div_right && shelf_top > div_top && shelf_bottom < div_bottom)) {
                                obj_hit = "Y";
                                obj_z = g_pog_json[p_pog_index].BackDepth / 2 + shelfs.D + 0.005;
                                break;
                            }
                        }
                    }
                    j = j + 1;
                }
            }
            i = i + 1;
        }

        if (obj_hit == "N" && g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 <= 0) {
            obj_z = g_pog_json[p_pog_index].BackDepth / 2 + 0.005 + g_pog_json[p_pog_index].BaseD;
        } else if (obj_hit == "N") {
            obj_z = g_pog_json[p_pog_index].BackDepth / 2 + 0.005;
        }
        return parseFloat(obj_z.toFixed(3));
    } catch (err) {
        error_handling(err);
    }
}

async function set_scene(p_pog_details, p_save_pdf, p_notch_label, p_fixel_label, p_item_label, p_pdf_lang, p_save_pog, p_mime_type, p_new_item_label, p_show_item_desc, p_draftPogInd, p_item_desc, p_old_live_iamge, p_loaded_live_img, p_pog_index, p_genLiveImg, p_workflowSave = "N", p_draftSeqID = "", p_combineImgInd, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel) {
    logDebug('function : set_scene; template_id : ' + p_pog_details + '; save_pdf : ' + p_save_pdf + '; notch_label : ' + p_notch_label + '; fixel_label : ' + p_fixel_label + '; item_label : ' + p_item_label + '; pdf_lang : ' + p_pdf_lang + '; save_pog : ' + p_save_pog + '; mime_type : ' + p_mime_type + '; new_item_label : ' + p_new_item_label, 'S');
    var canvas_new = get_curr_canvas();
    var new_world = get_canvas_world('LABEL');
    var img_arr = [];
    render();
    var base64;
    var comp_data = '';
    console.log(' before base64 ', getDateTime());
    console.log(" before base64 ", getDateTime());
    var details = p_combineImgInd.split('###');
    var combine_img = [];
    if (details[0] == 'Y') {
        if (details[1] == 'Y') {
            combine_img = await create_combine_pog($v('P53_POGCR_BAY_LIVE_IMAGE'), 'Y', 'N', $v("P53_VDATE"), $v("P53_MODULE_DEFAULT_COLOR"), $v("P53_MODULE_DEFAULT_COLOR"), $v("P53_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P53_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P53_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P53_BASKET_WALL_THICK")), parseFloat($v("P53_CHEST_WALL_THICK")), 'N', 'N', parseInt($v("P53_POGCR_TEXT_DEFAULT_SIZE")), $v("P53_POG_TEXTBOX_DEFAULT_COLOR"), '#3D393D', '', 'N', '', 'N', '#FFFFFF', $v("P53_POGCR_DELIST_ITEM_DFT_COL"), $v("P53_MERCH_STYLE"), $v("P53_POGCR_LOAD_IMG_FROM"), $v("P53_BU_ID"), $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), $v("P53_NOTCH_HEAD"), $v("P53_POGCR_DFT_BASKET_FILL"), $v("P53_POGCR_DFT_BASKET_SPREAD"), 0, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel);
            for (const obj of combine_img) {
                img_arr.push(obj);
            }

        }
        if (typeof details[2] !== 'undefined' && details[2] !== '') {
            combine_img = await create_combine_pog($v('P53_POGCR_BAY_WITHOUT_LIVE_IMAGE'), 'N', details[2], $v("P53_VDATE"), $v("P53_POG_DEFAULT_COLOR"), $v("P53_MODULE_DEFAULT_COLOR"), $v("P53_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P53_PEGBOARD_DFT_HORZ_SPC")), parseFloat($v("P53_PEGBOARD_DFT_VERT_SPC")), parseFloat($v("P53_BASKET_WALL_THICK")), parseFloat($v("P53_CHEST_WALL_THICK")), 'N', 'N', parseInt($v("P53_POGCR_TEXT_DEFAULT_SIZE")), $v("P53_POG_TEXTBOX_DEFAULT_COLOR"), '#3D393D', '', 'N', '', 'N', '#FFFFFF', $v("P53_POGCR_DELIST_ITEM_DFT_COL"), $v("P53_MERCH_STYLE"), $v("P53_POGCR_LOAD_IMG_FROM"), $v("P53_BU_ID"), $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), $v("P53_NOTCH_HEAD"), $v("P53_POGCR_DFT_BASKET_FILL"), $v("P53_POGCR_DFT_BASKET_SPREAD"), 0, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel);
            for (const obj of combine_img) {
                img_arr.push(obj);
            }
        }

    } else {
        var main_canvas;
        if (g_pog_json.length > 1) {
            main_canvas = await get_full_canvas(p_pog_index);
            reset_zoom();
        } else {
            main_canvas = g_canvas_objects[p_pog_index];
        }
        var dataURL = main_canvas.toDataURL("image/jpeg", 0.5);
        console.log(" after  base64 ", getDateTime());
        var img_details = {};
        img_details["Module"] = "POG";
        img_details["ImgData"] = dataURL.match(/,(.*)$/)[1];
        img_arr.push(img_details);
    }

    var new_pogjson = JSON.parse(JSON.stringify(g_pog_json));

    if (p_mime_type == 'xlsx') {
        var res = await save_pog_to_json(g_pog_json);
    }

    if (g_textbox_merge_pdf == 'Y') {
        var new_pogjson = await merge_textboxes_pdf(new_pogjson, p_pog_index);
    }

    var i = 0;
    var mod_count = 0;
    for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
        if (typeof modules.ParentModule == 'undefined' || modules.ParentModule == null) {
            mod_count++;
        }
    }

    //ASA-1235 START
    var updateOrgPOGJSON = JSON.parse(JSON.stringify(g_pog_json));
    var pogChests = [];
    var mIndex = 0;
    if (g_pogcr_pdf_chest_split == "Y") {
        for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var sIndex = 0;
                var moduleStart = parseFloat((modules.X - modules.W / 2).toFixed(4));
                var moduleEnd = parseFloat((modules.X + modules.W / 2).toFixed(4));
                for (const shelf of modules.ShelfInfo) {
                    if (shelf.ObjType == "CHEST") {
                        var shelfStart = parseFloat((shelf.X - shelf.W / 2).toFixed(4));
                        var shelfEnd = parseFloat((shelf.X + shelf.W / 2).toFixed(4));
                        if ((moduleStart > shelfStart && moduleEnd < shelfEnd) || (moduleStart < shelfStart && moduleEnd < shelfEnd && moduleEnd > shelfStart) || (moduleStart > shelfStart && moduleEnd > shelfEnd && moduleStart < shelfEnd)) {
                            shelf.MIndex = mIndex;
                            shelf.SIndex = sIndex;
                            pogChests.push(shelf);
                            new_pogjson[p_pog_index].ModuleInfo[mIndex].ShelfInfo.splice(sIndex, 1);
                            g_pog_json[p_pog_index].ModuleInfo[mIndex].ShelfInfo.splice(sIndex, 1);
                        }
                    }
                    sIndex++;
                }
            }
            mIndex++;
        }

        for (chest of pogChests) {
            // update new_pogjson modules with individual chest and updated item info
            var chestStart = parseFloat((chest.X - chest.W / 2).toFixed(4));
            var chestEnd = parseFloat((chest.X + chest.W / 2).toFixed(4));
            var chestItems = chest.ItemInfo;
            var mi = 0;
            for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var chest_found = "N";//ASA-1306
                    var mStart = parseFloat((modules.X - modules.W / 2).toFixed(4));
                    var mEnd = parseFloat((modules.X + modules.W / 2).toFixed(4));
                    var newChest = JSON.parse(JSON.stringify(chest));

                    if (mStart > chestStart && mEnd < chestEnd) {
                        chest_found = "Y";//ASA-1306
                        newChest.W = modules.W;
                        newChest.X = modules.X;
                    } else if (mStart < chestStart && mEnd < chestEnd && mEnd > chestStart) {
                        chest_found = "Y";//ASA-1306
                        newChest.W = parseFloat((mEnd - chestStart).toFixed(4));
                        newChest.X = parseFloat((chestStart + newChest.W / 2).toFixed(4));
                    } else if (mStart > chestStart && mEnd > chestEnd && mStart < chestEnd) {
                        chest_found = "Y";//ASA-1306
                        newChest.W = parseFloat((chestEnd - mStart).toFixed(4));
                        newChest.X = parseFloat((mStart + newChest.W / 2).toFixed(4));
                    }
                    var newChestItems = [];
                    var newChestStart = parseFloat((newChest.X - newChest.W / 2).toFixed(4));
                    var newChestEnd = parseFloat((newChest.X + newChest.W / 2).toFixed(4));
                    for (items of chestItems) {
                        if (items.X >= newChestStart && items.X <= newChestEnd) {
                            newChestItems.push(items);
                        }
                    }
                    newChestItems.sort(function (a, b) {
                        var aNum = parseInt(a.LocID);
                        var bNum = parseInt(b.LocID);
                        return aNum - bNum;
                    });
                    newChest.ItemInfo = newChestItems;
                    if (chest_found == "Y") {//ASA-1306
                        new_pogjson[p_pog_index].ModuleInfo[mi].ShelfInfo.push(newChest);
                        g_pog_json[p_pog_index].ModuleInfo[mi].ShelfInfo.push(newChest);
                    }
                }
                mi++;
            }
        }
    }
    //ASA-1235 END
    var i = 0;
    for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
        if (typeof modules.ParentModule == 'undefined' || modules.ParentModule == null) {
            if (typeof g_renderer_pdf !== 'undefined' && g_renderer_pdf !== null && g_renderer_pdf !== '') {
                g_renderer_pdf.forceContextLoss();
                g_renderer_pdf.context = null;
                g_renderer_pdf.domElement = null;
                g_renderer_pdf = null;
            }
            init_pdf(300, 400, 3, 'N', 'Y');
            try {
                var return_val = await create_scene(i, p_new_item_label, p_show_item_desc, mod_count, p_loaded_live_img, $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), '', p_pog_index);
            } catch (err) {
                error_handling(err);
            }
            var details = get_min_max_xy_module(modules, i, modules.W, modules.H, modules.X, new_pogjson[p_pog_index].W, mod_count, p_pog_index);
            var details_arr = details.split('###');

            var [cameraz, new_y] = set_camera_z_offside(g_camera_pdf, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, 0, parseFloat(details_arr[5]), p_pog_index);
            g_camera_pdf.position.x = parseFloat(details_arr[2]);
            g_camera_pdf.position.y = new_y - 0.09; //parseFloat(details_arr[3]);
            g_camera_pdf.position.z = cameraz;
            if (g_renderer_pdf !== null) {
                animate_pog_pdf();
                g_renderer_pdf.render(g_scene_pdf, g_camera_pdf);
            }

            var dataURL = await g_new_canvas.toDataURL('image/jpeg', 0.5);
            var img_details = {};
            img_details['Module'] = modules.Module;
            img_details['ImgData'] = dataURL.match(/,(.*)$/)[1];
            img_arr.push(img_details);
        }
        i = i + 1;
    }
    for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
        if (typeof modules.ParentModule == 'undefined' || modules.ParentModule == null) {
            for (const shelfs of modules.ShelfInfo) {
                if (shelfs.ObjType == 'TEXTBOX') {
                    var shelf = g_scene_objects[g_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
                    if (typeof shelf !== 'undefined') {
                        shelf.material.transparent = true;

                    }
                }
            }
        }
    }
    render();
    console.log('mod_arr', img_arr);
    await send_to_db(new_pogjson[p_pog_index].POGCode, img_arr);
    console.log('finished sending');
    logDebug('function : Download PDF', 'S');

    var p = apex.server.process(
        "DOWNLOAD_PDF", {
        x01: p_pog_details.SeqNo,
        x02: p_pog_details.POGCode,
        x03: p_pog_details.POGVersion,
        x04: p_pog_details.Selection_Type,
        x05: p_pog_details.Print_Type,
        x06: p_pog_details.TemplateId,
        x07: p_pog_details.SequenceId,
        x08: p_save_pdf,
        x09: p_pog_details.POGModule,
        p_clob_01: JSON.stringify(new_pogjson),
    }, {
        dataType: "html",
    });

    p.done(function (data) {
        g_pog_json = updateOrgPOGJSON; //ASA-1235
        p_fixel_label == 'Y' ? g_show_fixel_label = 'Y' : g_show_fixel_label = 'N';
        p_item_label == 'Y' ? g_show_item_label = 'Y' : g_show_item_label = 'N';
        p_notch_label == 'Y' ? g_show_notch_label = 'Y' : g_show_notch_label = 'N';
        p_item_desc == 'Y' ? g_show_item_desc = 'Y' : g_show_item_desc = 'N';

        var l_url = 'f?p=' + $v('pFlowId') + ':' + $v('pFlowStepId') + ':' + $v('pInstance') + ':APPLICATION_PROCESS=OPEN_PDF:NO::AI_RANDOM_STRING:' + new Date().getTime();
        removeLoadingIndicator(regionloadWait);
        window.open(l_url, 'new data');

        async function dosomething() {
            console.log('item_desc', p_item_desc, p_show_item_desc, p_old_live_iamge, p_loaded_live_img);
            if (p_item_desc == 'N' && p_show_item_desc == 'Y') {
                var res = showHideItemDescription('N', $v("P53_ITEM_DFT_COLOR"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
            } else if (p_item_desc == 'Y' && p_show_item_desc == 'N') {
                var res = showHideItemDescription('Y', $v("P53_ITEM_DFT_COLOR"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
            }
            if (p_old_live_iamge == 'N' && p_loaded_live_img == 'Y') {
                var return_val = await recreate_image_items('N', $v("P53_MERCH_STYLE"), $v("P53_POGCR_LOAD_IMG_FROM"), $v("P53_BU_ID"), $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), $v("P53_POGCR_DELIST_ITEM_DFT_COL"), $v("P53_NOTCH_HEAD"), p_pog_index, 'N', '', $v('P53_POGCR_ITEM_DETAIL_LIST'));
            } else if (p_old_live_iamge == 'Y' && p_loaded_live_img == 'N' && p_item_desc == 'N') {
                var return_val = await recreate_image_items('Y', $v("P53_MERCH_STYLE"), $v("P53_POGCR_LOAD_IMG_FROM"), $v("P53_BU_ID"), $v("P53_POGCR_ITEM_NUM_LBL_COLOR"), $v("P53_POGCR_ITEM_NUM_LABEL_POS"), $v("P53_POGCR_DISPLAY_ITEM_INFO"), $v("P53_POGCR_DELIST_ITEM_DFT_COL"), $v("P53_NOTCH_HEAD"), p_pog_index, 'N', '', $v('P53_POGCR_ITEM_DETAIL_LIST'));
            }

            show_notch_labels(g_show_notch_label, $v("P435_NOTCH_HEAD"), 'Y', p_pog_index);
            show_fixel_labels(g_show_fixel_label, p_pog_index);
            show_item_labels(g_show_item_label, $v("P435_POGCR_ITEM_NUM_LBL_COLOR"), $v("P435_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        }
        dosomething();

        if (typeof g_renderer_pdf !== 'undefined' && g_renderer_pdf !== null && g_renderer_pdf !== '') {
            g_renderer_pdf.forceContextLoss();
            g_renderer_pdf.context = null;
            g_renderer_pdf.domElement = null;
            g_renderer_pdf = null;
        }
    });
    logDebug('function : set_scene', 'E');
}

async function doMouseUp(p_x, p_y, p_event, p_prevX, p_prevY, p_canvas, p_camera, p_pog_json, p_pog_index) {
    logDebug("function : doMouseUp; x : " + p_x + "; y : " + p_y + "; prevX : " + p_prevX + "; prevY : " + p_prevY, "S");
    /*This is a mouse up function
    this will handle
    1. object dragging
    2. fixel duplicate
    3. g_multiselect dragging
    4. remove g_multiselect box after complition of g_multiselect and highlight all objects
     */
    try {
        var width = p_canvas.width / window.devicePixelRatio;
        var height = p_canvas.height / window.devicePixelRatio;
        var a = (2 * p_x) / width - 1;
        var b = 1 - (2 * p_y) / height;
        g_raycaster.setFromCamera(new THREE.Vector2(a, b), p_camera);
        g_intersects = g_raycaster.intersectObject(g_targetForDragging);
        if (g_intersects.length == 0) {
            return;
        }
        var locationX = g_intersects[0].point.x;
        var locationY = g_intersects[0].point.y;
        var locationZ = g_intersects[0].point.z;
        var coords = new THREE.Vector3(locationX, locationY, locationZ);
        g_scene_objects[p_pog_index].scene.children[0].worldToLocal(coords);
        var l_final_x = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
        var l_final_y = Math.min(19, Math.max(-19, coords.y));
        var z = g_drag_z;

        if (g_shelf_edit_flag == "Y") {
            if (g_shelf_object_type == "PEGBOARD") {
                g_dragItem.position.z = 0.00015;
            } else if (g_shelf_object_type == "ROD") {
                g_dragItem.position.z = 0.005;
            } else if (g_shelf_object_type !== "TEXTBOX") {
                g_dragItem.position.z = 0.0005;
            }
        }

        if (g_delete_details.length > 0) {
            g_multiItemCopy = "Y";
        } else {
            g_multiItemCopy = "N";
        }
        //finish multi g_selection border and highlight all selected objects
        if (g_selecting && typeof p_pog_json !== "undefined" && p_pog_json.length > 0) {
            let result = await get_multiselect_obj(p_pog_json, p_pog_index);
            if (g_area_zoom_ind == "Y") {
                new_camera = get_canvas_camera("MOUSEUP");
                new_pogjson = get_canvas_json("MOUSEUP");
                select_zoom(g_scene_objects[g_pog_index].scene.children[0], p_pog_index);
                g_area_zoom_ind = "N";

            } else {
                g_selecting = false;
            }
            g_selection.style.visibility = "hidden";

        }
        logDebug("function : doMouseUp", "E");
    } catch (err) {
        error_handling(err);
    }
}

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
        var devicePixelRatio = window.devicePixelRatio;
        var scroll_top = $(document).scrollTop();
        var scroll_left = $(".t-Region-body").scrollLeft();

        g_multiselect = 'Y';
        g_global_counter = g_global_counter + 1;
        g_start_coorX = p_startX;
        g_start_coorY = p_startY;
        g_taskItemInContext = clickInsideElement(p_event, "canvasregion");
        g_taskItemInContext1 = clickInsideElement(p_event, "canvasregion1");
        g_selection.style.visibility = "hidden";

        var new_pogjson = [];
        var new_camera = {};
        var new_world;
        if (g_taskItemInContext) {
            p_canvas = document.getElementById("maincanvas");
            if (typeof g_scene_objects[g_pog_index] !== 'undefined' && g_scene_objects.length > 0) {
                new_camera = g_scene_objects[g_pog_index].scene.children[0];
                new_world = g_scene_objects[g_pog_index].scene.children[2];
            }
        }
        var new_pogjson = get_canvas_json("LABEL");

        //getting canvas width and height.
        var width = p_canvas.width / window.devicePixelRatio;
        var height = p_canvas.height / window.devicePixelRatio;
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
        render();
        new_camera.updateProjectionMatrix();
        g_raycaster.setFromCamera(new THREE.Vector2(a, b), new_camera);
        g_intersects = g_raycaster.intersectObjects(new_world.children); // no need for recusion since all objects are top-level

        //if there is no objects behing cursor its the empty place outside POG. for that we use an invisible object to find the location.
        if (g_intersects.length == 0) {
            //if any other item is blinking stop blink
            //add invisible object into g_world to find location. after getting location remove it.

            new_world.add(g_targetForDragging);
            g_targetForDragging.position.set(0, 0, 0);
            render();

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
                g_DragMouseStart.x = a;
                g_DragMouseStart.y = p_y;
                g_DragMouseEnd.x = a;
                g_DragMouseEnd.y = p_y;
                g_startMouse.x = p_event.clientX + scroll_left - 20;
                g_startMouse.y = p_event.clientY + scroll_top;
                g_prevMouse.x = a;
                g_prevMouse.y = p_y;
                g_nextMouse = g_prevMouse.clone();
                new_world.remove(g_targetForDragging);
                g_intersected = [];
                g_select_zoom_arr = [];
                if (!p_event.shiftKey) {
                    var x2 = g_startMouse.x;
                    var y2 = g_startMouse.y;
                    g_selecting = true;
                    g_selection.style.left = g_startMouse.x + "px";
                    g_selection.style.top = g_startMouse.y + "px";
                    g_selection.style.width = x2 - g_startMouse.x + "px";
                    g_selection.style.height = y2 - g_startMouse.y + "px";
                    g_selection.style.visibility = "visible";
                    return true;
                } else {
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
                is still inside the g_world then take details from intersect[1]*/
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
                console.log("g_objectHit_id", g_objectHit_id, g_objectHit_uuid, a, p_y, z);

                //find the cursor hit object is what and its details
                get_object_identity(new_pogjson, p_pog_index);
                //if there is a shelf then update the distance of each item inside the shelf.
                if (g_module_index !== -1 && g_shelf_index !== -1) {
                    update_item_distance(g_module_index, g_shelf_index, p_pog_index);
                }

                g_drag_x = g_module_X; //g_objectHit.position.x;

                render();
                //if its carpark shelf its not allowed to move anywhere.
                if (g_module_edit_flag == "Y" || g_module_obj_array.indexOf(g_objectHit) !== -1 || g_objectHit_uuid.match(/BASE.*/) || g_objectHit_uuid.match(/NOTCH.*/)) {
                    g_startMouse.x = p_event.clientX + scroll_left - 20;
                    g_startMouse.y = p_event.clientY + scroll_top;
                    g_prevMouse.x = a;
                    g_prevMouse.y = p_y;
                    g_nextMouse = g_prevMouse.clone();
                    g_DragMouseStart.x = a;
                    g_DragMouseStart.y = p_y;
                    g_DragMouseEnd.x = a;
                    g_DragMouseEnd.y = p_y;

                    var x2 = g_startMouse.x + 1;
                    var y2 = g_startMouse.y + 1;
                    if (g_context_opened == "N" && !p_event.shiftKey) {
                        g_selecting = true;
                        g_selection.style.left = g_startMouse.x + "px";
                        g_selection.style.top = g_startMouse.y + "px";
                        g_selection.style.width = x2 - g_startMouse.x + "px";
                        g_selection.style.height = y2 - g_startMouse.y + "px";
                        g_selection.style.visibility = "visible";
                    }
                    return true;
                } else {
                    //if object hit is a fixel or item allow drag.
                    g_dragItem = g_objectHit;
                    console.log("evt.ctrlKey", p_event.ctrlKey, g_module_edit_flag, g_item_edit_flag, g_ctrl_select, g_mselect_drag, g_multiItemCopy);
                    return false;
                }
            } else {
                //if no objects found remove blinking.
                if (g_intersected) {
                    for (var i = 0; i < g_intersected.length; i++) {
                        g_select_color = g_intersected[i].BorderColour;
                        g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                        if (g_intersected[i].ImageExists == "Y" && (g_show_live_image == "Y" || g_show_live_image_comp == "Y")) {
                            g_intersected[i].WireframeObj.material.transparent = true;
                            g_intersected[i].WireframeObj.material.opacity = 0.0025;
                        }
                    }
                    clearInterval(g_myVar);
                    g_select_color = 0x000000;
                    render();
                    g_intersected = [];
                    g_select_zoom_arr = [];
                }
            }
        }
        logDebug("function : doMouseDown", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function get_multiselect_obj(p_pog_json, p_pog_index) {
    logDebug("function : get_multiselect_obj", "S");
    try {
        console.log('g multiselect obj', p_pog_json);
        g_delete_details = [];
        g_multi_drag_shelf_arr = [];
        g_multi_drag_item_arr = [];

        if (typeof p_pog_json !== "undefined" && p_pog_json.length > 0) {
            var module_details = p_pog_json[p_pog_index].ModuleInfo;
            var j = 0;
            for (const Modules of module_details) {
                if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                    var k = 0;
                    for (const Shelf of Modules.ShelfInfo) {
                        if (typeof Shelf !== "undefined") {
                            if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "DIVIDER") {
                                if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                                    var shelf_left = Shelf.X - Shelf.ShelfRotateWidth / 2;
                                    var shelf_right = Shelf.X + Shelf.ShelfRotateWidth / 2;
                                    var shelf_bottom = Shelf.Y - Shelf.ShelfRotateHeight / 2;
                                    var shelf_top = Shelf.Y + Shelf.ShelfRotateHeight / 2;
                                } else {
                                    var shelf_left = Shelf.X - Shelf.W / 2;
                                    var shelf_right = Shelf.X + Shelf.W / 2;
                                    var shelf_bottom = Shelf.Y - Shelf.H / 2;
                                    var shelf_top = Shelf.Y + Shelf.H / 2;
                                }
                                if (g_DragMouseStart.x < g_DragMouseEnd.x && g_DragMouseStart.y > g_DragMouseEnd.y) {
                                    if (shelf_left > g_DragMouseStart.x && shelf_right > g_DragMouseStart.x && shelf_bottom < g_DragMouseStart.y && shelf_top < g_DragMouseStart.y && shelf_left < g_DragMouseEnd.x && shelf_right < g_DragMouseEnd.x && shelf_bottom > g_DragMouseEnd.y && shelf_top > g_DragMouseEnd.y) {
                                        var details = {};
                                        details["ObjID"] = Shelf.SObjID;
                                        details["MIndex"] = j;
                                        details["SIndex"] = k;
                                        details["ObjWidth"] = Shelf.W;
                                        details["ObjHeight"] = Shelf.H;
                                        details["XAxis"] = Shelf.X;
                                        details["YAxis"] = Shelf.Y;
                                        details["ZAxis"] = Shelf.Z;
                                        details["IIndex"] = -1;
                                        details["ObjType"] = Shelf.ObjType;
                                        details["IsDivider"] = "N";
                                        details["Object"] = "SHELF";
                                        details["MObjID"] = Modules.MObjID;
                                        details["SObjID"] = -1;
                                        details["ItemID"] = "";
                                        details["Item"] = "";
                                        details["Exists"] = "N";
                                        details["Rotation"] = Shelf.Rotation;
                                        details["Slope"] = Shelf.Slope;
                                        details["Distance"] = 0;
                                        details["TopObjID"] = "";
                                        details["BottomObjID"] = "";
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                } else if (g_DragMouseStart.x > g_DragMouseEnd.x && g_DragMouseStart.y > g_DragMouseEnd.y) {
                                    if (shelf_left > g_DragMouseEnd.x && shelf_right > g_DragMouseEnd.x && shelf_bottom > g_DragMouseEnd.y && shelf_top > g_DragMouseEnd.y && shelf_left < g_DragMouseStart.x && shelf_right < g_DragMouseStart.x && shelf_bottom < g_DragMouseStart.y && shelf_top < g_DragMouseStart.y) {
                                        var details = {};
                                        details["ObjID"] = Shelf.SObjID;
                                        details["MIndex"] = j;
                                        details["SIndex"] = k;
                                        details["ObjWidth"] = Shelf.W;
                                        details["ObjHeight"] = Shelf.H;
                                        details["XAxis"] = Shelf.X;
                                        details["YAxis"] = Shelf.Y;
                                        details["ZAxis"] = Shelf.Z;
                                        details["IIndex"] = -1;
                                        details["ObjType"] = Shelf.ObjType;
                                        details["IsDivider"] = "N";
                                        details["Object"] = "SHELF";
                                        details["MObjID"] = Modules.MObjID;
                                        details["SObjID"] = -1;
                                        details["ItemID"] = "";
                                        details["Item"] = "";
                                        details["Exists"] = "N";
                                        details["Rotation"] = Shelf.Rotation;
                                        details["Slope"] = Shelf.Slope;
                                        details["Distance"] = 0;
                                        details["TopObjID"] = "";
                                        details["BottomObjID"] = "";
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                } else if (g_DragMouseStart.x < g_DragMouseEnd.x && g_DragMouseStart.y < g_DragMouseEnd.y) {
                                    if (shelf_left > g_DragMouseStart.x && shelf_right > g_DragMouseStart.x && shelf_bottom > g_DragMouseStart.y && shelf_top > g_DragMouseStart.y && shelf_left < g_DragMouseEnd.x && shelf_right < g_DragMouseEnd.x && shelf_bottom < g_DragMouseEnd.y && shelf_top < g_DragMouseEnd.y) {
                                        var details = {};
                                        details["ObjID"] = Shelf.SObjID;
                                        details["MIndex"] = j;
                                        details["SIndex"] = k;
                                        details["ObjWidth"] = Shelf.W;
                                        details["ObjHeight"] = Shelf.H;
                                        details["XAxis"] = Shelf.X;
                                        details["YAxis"] = Shelf.Y;
                                        details["ZAxis"] = Shelf.Z;
                                        details["IIndex"] = -1;
                                        details["ObjType"] = Shelf.ObjType;
                                        details["IsDivider"] = "N";
                                        details["Object"] = "SHELF";
                                        details["MObjID"] = Modules.MObjID;
                                        details["SObjID"] = -1;
                                        details["ItemID"] = "";
                                        details["Item"] = "";
                                        details["Exists"] = "N";
                                        details["Rotation"] = Shelf.Rotation;
                                        details["Slope"] = Shelf.Slope;
                                        details["Distance"] = 0;
                                        details["TopObjID"] = "";
                                        details["BottomObjID"] = "";
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                } else if (g_DragMouseStart.x > g_DragMouseEnd.x && g_DragMouseStart.y < g_DragMouseEnd.y) {
                                    if (shelf_left < g_DragMouseStart.x && shelf_right < g_DragMouseStart.x && shelf_bottom > g_DragMouseStart.y && shelf_top > g_DragMouseStart.y && shelf_left > g_DragMouseEnd.x && shelf_right > g_DragMouseEnd.x && shelf_bottom < g_DragMouseEnd.y && shelf_top < g_DragMouseEnd.y) {
                                        var details = {};
                                        details["ObjID"] = Shelf.SObjID;
                                        details["MIndex"] = j;
                                        details["SIndex"] = k;
                                        details["ObjWidth"] = Shelf.W;
                                        details["ObjHeight"] = Shelf.H;
                                        details["XAxis"] = Shelf.X;
                                        details["YAxis"] = Shelf.Y;
                                        details["ZAxis"] = Shelf.Z;
                                        details["IIndex"] = -1;
                                        details["ObjType"] = Shelf.ObjType;
                                        details["IsDivider"] = "N";
                                        details["Object"] = "SHELF";
                                        details["MObjID"] = Modules.MObjID;
                                        details["SObjID"] = -1;
                                        details["ItemID"] = "";
                                        details["Item"] = "";
                                        details["Exists"] = "N";
                                        details["Rotation"] = Shelf.Rotation;
                                        details["Slope"] = Shelf.Slope;
                                        details["Distance"] = 0;
                                        details["TopObjID"] = "";
                                        details["BottomObjID"] = "";
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                }
                                var l = 0;
                                for (const items of Shelf.ItemInfo) {
                                    var item_left = items.X - items.W / 2;
                                    var item_right = items.X + items.W / 2;
                                    var item_bottom = items.Y - items.H / 2;
                                    var item_top = items.Y + items.H / 2;
                                    if (g_DragMouseStart.x < g_DragMouseEnd.x && g_DragMouseStart.y > g_DragMouseEnd.y) {
                                        if (item_left > g_DragMouseStart.x && item_right > g_DragMouseStart.x && item_bottom < g_DragMouseStart.y && item_top < g_DragMouseStart.y && item_left < g_DragMouseEnd.x && item_right < g_DragMouseEnd.x && item_bottom > g_DragMouseEnd.y && item_top > g_DragMouseEnd.y) {
                                            var details = {};
                                            var is_divider = "N";
                                            var object = "ITEM";
                                            if (items.Item == "DIVIDER") {
                                                is_divider = "Y";
                                                object = "SHELF";
                                            }
                                            details["ObjID"] = items.ObjID;
                                            details["MIndex"] = j;
                                            details["SIndex"] = k;
                                            details["ObjWidth"] = items.W;
                                            details["ObjHeight"] = items.H;
                                            details["XAxis"] = items.X;
                                            details["YAxis"] = items.Y;
                                            details["ZAxis"] = items.Z;
                                            details["IIndex"] = l;
                                            details["ObjType"] = Shelf.ObjType;
                                            details["IsDivider"] = is_divider;
                                            details["Object"] = object;
                                            details["MObjID"] = Modules.MObjID;
                                            details["SObjID"] = Shelf.SObjID;
                                            details["ItemID"] = items.ItemID;
                                            details["Item"] = items.Item;
                                            details["W"] = items.W;
                                            details["H"] = items.H;
                                            details["X"] = items.X;
                                            details["Y"] = items.Y;
                                            details["Exists"] = "N";
                                            details["Rotation"] = 0;
                                            details["Slope"] = 0;
                                            details["Distance"] = items.Distance;
                                            details["TopObjID"] = items.TopObjID;
                                            details["BottomObjID"] = items.BottomObjID;
                                            g_delete_details.multi_delete_shelf_ind = "";
                                            g_delete_details.push(details);
                                            if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                var shelfInfo = p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
                                            }
                                        }
                                    } else if (g_DragMouseStart.x > g_DragMouseEnd.x && g_DragMouseStart.y > g_DragMouseEnd.y) {
                                        if (item_left > g_DragMouseEnd.x && item_right > g_DragMouseEnd.x && item_bottom > g_DragMouseEnd.y && item_top > g_DragMouseEnd.y && item_left < g_DragMouseStart.x && item_right < g_DragMouseStart.x && item_bottom < g_DragMouseStart.y && item_top < g_DragMouseStart.y) {
                                            var details = {};
                                            var is_divider = "N";
                                            var object = "ITEM";
                                            if (items.Item == "DIVIDER") {
                                                is_divider = "Y";
                                                object = "SHELF";
                                            }
                                            details["ObjID"] = items.ObjID;
                                            details["MIndex"] = j;
                                            details["SIndex"] = k;
                                            details["ObjWidth"] = items.W;
                                            details["ObjHeight"] = items.H;
                                            details["XAxis"] = items.X;
                                            details["YAxis"] = items.Y;
                                            details["ZAxis"] = items.Z;
                                            details["IIndex"] = l;
                                            details["ObjType"] = Shelf.ObjType;
                                            details["IsDivider"] = is_divider;
                                            details["Object"] = object;
                                            details["MObjID"] = Modules.MObjID;
                                            details["SObjID"] = Shelf.SObjID;
                                            details["ItemID"] = items.ItemID;
                                            details["Item"] = items.Item;
                                            details["W"] = items.W;
                                            details["H"] = items.H;
                                            details["X"] = items.X;
                                            details["Y"] = items.Y;
                                            details["Exists"] = "N";
                                            details["Rotation"] = 0;
                                            details["Slope"] = 0;
                                            details["Distance"] = items.Distance;
                                            details["TopObjID"] = items.TopObjID;
                                            details["BottomObjID"] = items.BottomObjID;
                                            g_delete_details.multi_delete_shelf_ind = "";
                                            g_delete_details.push(details);
                                            if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                var shelfInfo = p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
                                            }
                                        }
                                    } else if (g_DragMouseStart.x < g_DragMouseEnd.x && g_DragMouseStart.y < g_DragMouseEnd.y) {
                                        if (item_left > g_DragMouseStart.x && item_right > g_DragMouseStart.x && item_bottom > g_DragMouseStart.y && item_top > g_DragMouseStart.y && item_left < g_DragMouseEnd.x && item_right < g_DragMouseEnd.x && item_bottom < g_DragMouseEnd.y && item_top < g_DragMouseEnd.y) {
                                            var details = {};
                                            var is_divider = "N";
                                            var object = "ITEM";
                                            if (items.Item == "DIVIDER") {
                                                is_divider = "Y";
                                                object = "SHELF";
                                            }
                                            details["ObjID"] = items.ObjID;
                                            details["MIndex"] = j;
                                            details["SIndex"] = k;
                                            details["ObjWidth"] = items.W;
                                            details["ObjHeight"] = items.H;
                                            details["XAxis"] = items.X;
                                            details["YAxis"] = items.Y;
                                            details["ZAxis"] = items.Z;
                                            details["IIndex"] = l;
                                            details["ObjType"] = Shelf.ObjType;
                                            details["IsDivider"] = is_divider;
                                            details["Object"] = object;
                                            details["MObjID"] = Modules.MObjID;
                                            details["SObjID"] = Shelf.SObjID;
                                            details["ItemID"] = items.ItemID;
                                            details["Item"] = items.Item;
                                            details["W"] = items.W;
                                            details["H"] = items.H;
                                            details["X"] = items.X;
                                            details["Y"] = items.Y;
                                            details["Exists"] = "N";
                                            details["Rotation"] = 0;
                                            details["Slope"] = 0;
                                            details["Distance"] = items.Distance;
                                            details["TopObjID"] = items.TopObjID;
                                            details["BottomObjID"] = items.BottomObjID;
                                            g_delete_details.multi_delete_shelf_ind = "";
                                            g_delete_details.push(details);
                                            if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                var shelfInfo = p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
                                            }
                                        }
                                    } else if (g_DragMouseStart.x > g_DragMouseEnd.x && g_DragMouseStart.y < g_DragMouseEnd.y) {
                                        if (item_left < g_DragMouseStart.x && item_right < g_DragMouseStart.x && item_bottom > g_DragMouseStart.y && item_top > g_DragMouseStart.y && item_left > g_DragMouseEnd.x && item_right > g_DragMouseEnd.x && item_bottom < g_DragMouseEnd.y && item_top < g_DragMouseEnd.y) {
                                            var details = {};
                                            var is_divider = "N";
                                            var object = "ITEM";
                                            if (items.Item == "DIVIDER") {
                                                is_divider = "Y";
                                                object = "SHELF";
                                            }
                                            details["ObjID"] = items.ObjID;
                                            details["MIndex"] = j;
                                            details["SIndex"] = k;
                                            details["ObjWidth"] = items.W;
                                            details["ObjHeight"] = items.H;
                                            details["XAxis"] = items.X;
                                            details["YAxis"] = items.Y;
                                            details["ZAxis"] = items.Z;
                                            details["IIndex"] = l;
                                            details["ObjType"] = Shelf.ObjType;
                                            details["IsDivider"] = is_divider;
                                            details["Object"] = object;
                                            details["MObjID"] = Modules.MObjID;
                                            details["SObjID"] = Shelf.SObjID;
                                            details["ItemID"] = items.ItemID;
                                            details["Item"] = items.Item;
                                            details["W"] = items.W;
                                            details["H"] = items.H;
                                            details["X"] = items.X;
                                            details["Y"] = items.Y;
                                            details["Exists"] = "N";
                                            details["Rotation"] = 0;
                                            details["Slope"] = 0;
                                            details["Distance"] = items.Distance;
                                            details["TopObjID"] = items.TopObjID;
                                            details["BottomObjID"] = items.BottomObjID;
                                            g_delete_details.multi_delete_shelf_ind = "";
                                            g_delete_details.push(details);
                                            if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                var shelfInfo = p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
                                            }
                                        }
                                    }
                                    l++;
                                }
                            }
                        }
                        k++;
                    }
                }
                j++;
            }
        }
        logDebug("function : get_multiselect_obj", "E");
    } catch (err) {
        error_handling(err);
    }
}

function select_zoom(p_camera, p_pog_index) {
    logDebug("function : select_zoom", "S");
    var width = (height = x = y = 0);
    try {
        g_cutaway_cam_detail = [];
        console.log('g_DragMouseStart', g_DragMouseStart, g_DragMouseEnd, g_multiselect);
        if (g_DragMouseStart.x !== 0 && g_DragMouseEnd.x !== 0 && g_multiselect == "Y") {
            if (g_DragMouseStart.x > g_DragMouseEnd.x) {
                width = g_DragMouseStart.x - g_DragMouseEnd.x;
                x = g_DragMouseEnd.x + width / 2;
            } else {
                width = g_DragMouseEnd.x - g_DragMouseStart.x;
                x = g_DragMouseStart.x + width / 2;
            }
            if (g_DragMouseStart.y > g_DragMouseEnd.y) {
                height = g_DragMouseStart.y - g_DragMouseEnd.y;
                y = g_DragMouseEnd.y + height / 2;
            } else {
                height = g_DragMouseEnd.y - g_DragMouseStart.y;
                y = g_DragMouseStart.y + height / 2;
            }

            set_camera_z(g_scene_objects[g_pog_index].scene.children[0], x, y, width, height, 0, x, y, true, p_pog_index);
            g_manual_zoom_ind = "Y";
            var details = {};
            details["x"] = x;
            details["y"] = y;
            details["width"] = width;
            details["height"] = height;
            details["offset"] = 0;
            g_cutaway_cam_detail.push(details);

            if (g_intersected) {
                for (var i = 0; i < g_intersected.length; i++) {
                    g_select_color = g_intersected[i].BorderColour;
                    g_intersected[i].WireframeObj.material.color.setHex(g_select_color);
                    if (g_intersected[i].ImageExists == "Y" && (g_show_live_image == "Y" || g_show_live_image_comp == "Y")) {
                        g_intersected[i].WireframeObj.material.transparent = true;
                        g_intersected[i].WireframeObj.material.opacity = 0.0025;
                    }
                }
                clearInterval(g_myVar);
                g_select_color = 0x000000;
                render();
            }
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_multiselect = "N";
            g_intersected = [];
        } else {
            if (g_select_zoom_arr.length > 0) {
                var minx = (maxx = miny = maxy = -1);
                for (var i = 0; i < g_select_zoom_arr.length; i++) {
                    var obj_found = "N";
                    var valid = "N";
                    var module_hit = "N";
                    $.each(g_pog_json[p_pog_index].ModuleInfo, function (j, Modules) {
                        if (obj_found == "Y") {
                            return false;
                        }
                        if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                            if (Modules.MObjID == g_select_zoom_arr[i].id) {
                                if (minx == -1) {
                                    minx = Modules.X - Modules.W / 2;
                                } else {
                                    minx = Math.min(minx, Modules.X - Modules.W / 2);
                                }
                                if (miny == -1) {
                                    miny = Modules.Y - Modules.H / 2 + g_pog_json[p_pog_index].BaseH;
                                } else {
                                    miny = Math.min(miny, Modules.Y - Modules.H / 2 + g_pog_json[p_pog_index].BaseH);
                                }
                                maxx = Math.max(maxx, Modules.X + Modules.W / 2);
                                maxy = Math.max(maxy, Modules.Y + Modules.H / 2 + g_pog_json[p_pog_index].BaseH);
                                obj_found = "Y";
                                valid = "Y";
                                module_hit = "Y";
                                return false;
                            }
                            $.each(Modules.ShelfInfo, function (k, Shelf) {
                                if (obj_found == "Y") {
                                    return false;
                                }
                                if (typeof Shelf !== "undefined") {
                                    if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "DIVIDER") {
                                        if (g_shelf.SObjID == g_select_zoom_arr[i].id) {
                                            if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                                                shelf_width = typeof Shelf.ShelfRotateWidth == "undefined" ? Shelf.W : Shelf.ShelfRotateWidth;
                                                shelf_height = typeof Shelf.ShelfRotateHeight == "undefined" ? Shelf.W : Shelf.ShelfRotateHeight;
                                            } else {
                                                shelf_width = Shelf.W;
                                                shelf_height = Shelf.H;
                                            }
                                            if (minx == -1) {
                                                minx = Shelf.X - shelf_width / 2;
                                            } else {
                                                minx = Math.min(minx, Shelf.X - shelf_width / 2);
                                            }
                                            if (miny == -1) {
                                                miny = Shelf.Y - shelf_height / 2;
                                            } else {
                                                miny = Math.min(miny, Shelf.Y - shelf_height / 2);
                                            }
                                            maxx = Math.max(maxx, Shelf.X + shelf_width / 2);
                                            maxy = Math.max(maxy, Shelf.Y + shelf_height / 2);
                                            obj_found = "Y";
                                            valid = "Y";
                                            return false;
                                        }
                                        if (Shelf.ItemInfo.length > 0) {
                                            $.each(Shelf.ItemInfo, function (l, items) {
                                                if (items.ObjID == g_select_zoom_arr[i].id) {
                                                    if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                                                        item_width = typeof items.RotationWidth == "undefined" || items.RotationWidth == null || items.RotationWidth == 0 ? items.W : items.RotationWidth;
                                                        item_height = typeof items.RotationHeight == "undefined" || items.RotationHeight == null || items.RotationHeight == 0 ? items.H : items.RotationHeight;
                                                    } else {
                                                        item_width = items.W;
                                                        item_height = items.H;
                                                    }
                                                    if (minx == -1) {
                                                        minx = items.X - item_width / 2;
                                                    } else {
                                                        minx = Math.min(minx, items.X - item_width / 2);
                                                    }
                                                    if (miny == -1) {
                                                        miny = items.Y - item_height / 2;
                                                    } else {
                                                        miny = Math.min(miny, items.Y - item_height / 2);
                                                    }
                                                    maxx = Math.max(maxx, items.X + item_width / 2);
                                                    maxy = Math.max(maxy, items.Y + item_height / 2);
                                                    obj_found = "Y";
                                                    valid = "Y";
                                                    return false;
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
                if (valid == "Y") {
                    if (g_intersected) {
                        for (var i = 0; i < g_intersected.length; i++) {
                            g_select_color = g_intersected[i].BorderColour;
                            g_intersected[i].WireframeObj.material.color.setHex(g_select_color);
                            if (g_intersected[i].ImageExists == "Y" && (g_show_live_image == "Y" || g_show_live_image_comp == "Y")) {
                                g_intersected[i].WireframeObj.material.transparent = true;
                                g_intersected[i].WireframeObj.material.opacity = 0.0025;
                            }
                        }
                        clearInterval(g_myVar);
                        g_select_color = 0x000000;
                        render();
                    }
                    var width = maxx - minx;
                    var height = maxy - miny;
                    var x = minx + width / 2;
                    var y = miny + height / 2;
                    set_camera_z(g_scene_objects[g_pog_index].scene.children[0], x, y, width, height, 0.5, x, y, true, p_pog_index);
                    var details = {};
                    details["x"] = x;
                    details["y"] = y;
                    details["width"] = width;
                    details["height"] = height;
                    details["offset"] = 0.5;
                    g_cutaway_cam_detail.push(details);
                    g_manual_zoom_ind = "Y";
                    g_select_zoom_arr = [];
                    render();
                }
            } else {
                if (g_module_edit_flag == "Y") {
                    width = g_pog_json[p_pog_index].ModuleInfo[g_module_index].W;
                    height = g_pog_json[p_pog_index].ModuleInfo[g_module_index].H;
                    x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X;
                    y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Y;
                    var offset = g_offset_z;
                } else if (g_shelf_edit_flag == "Y") {
                    width = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W;
                    height = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H;
                    x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X;
                    y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y;
                    var offset = 0;
                } else if (g_item_edit_flag == "Y") {
                    width = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].W;
                    height = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].H;
                    x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X;
                    y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y;
                    var offset = 0;
                }
                if (width > 0) {
                    set_camera_z(g_scene_objects[g_pog_index].scene.children[0], x, y, width, height, offset, x, y, true, p_pog_index);
                    var details = {};
                    details["x"] = x;
                    details["y"] = y;
                    details["width"] = width;
                    details["height"] = height;
                    details["offset"] = offset;
                    g_cutaway_cam_detail.push(details);
                    g_manual_zoom_ind = "Y";
                    render();
                }
            }
        }
    } catch (err) {
        error_handling(err);
    }
    logDebug("function : select_zoom", "E");
}
function get_object_identity(p_pog_json, p_pog_index) {
    logDebug("function : get_object_identity", "S");
    try {
        var i = 0;
        for (const modules of p_pog_json[p_pog_index].ModuleInfo) {
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
        console.log("module index on click", g_module_index, g_shelf_index, g_module_edit_flag, g_shelf_edit_flag, g_item_edit_flag, g_carpark_edit_flag);
        if (g_carpark_edit_flag == "N") {
            var i = 0;
            for (const modules of p_pog_json[p_pog_index].ModuleInfo) {
                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
                    if (modules.MObjID == g_objectHit_id && modules.ParentModule == null) {
                        g_module_index = i;
                        g_module_cnt = i;
                        g_module_width = modules.W;
                        g_module_X = modules.X;
                        g_module_edit_flag = "Y";
                        comp_obj_id = modules.CompMObjID;
                        g_wireframe_id = modules.WFrameID;
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
            for (const Modules of p_pog_json[p_pog_index].ModuleInfo) {
                if (g_shelf_edit_flag == "Y") {
                    break; //return false;
                }
                if (Modules.ParentModule == null) {
                    $.each(Modules.ShelfInfo, function (i, Shelf) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                            if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
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
            for (const Modules of p_pog_json[p_pog_index].ModuleInfo) {
                if (g_item_edit_flag == "Y") {
                    break; //return false;
                }
                if (Modules.ParentModule == null) {
                    if (typeof Modules.Carpark !== "undefined" && typeof Modules.Carpark[0] !== "undefined" && Modules.Carpark.length > 0) {
                        if (Modules.Carpark[0].ItemInfo.length > 0) {
                            var j = 0;
                            for (const items of Modules.Carpark[0].ItemInfo) {
                                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
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
                                if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
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
        logDebug("function : get_object_identity", "E");
    } catch (err) {
        error_handling(err);
    }
}

function area_zoom() {
    logDebug("function : area_zoom", "S");
    if (g_area_zoom_ind == "N") {
        $(".top_icon").removeClass("active");
        $(".left_icon").removeClass("active");
        $(".area_zoom").addClass("active");
        g_area_zoom_ind = "Y";
        g_select_zoom_arr = [];
    } else {
        $(".area_zoom").removeClass("active");
        g_area_zoom_ind = "N";
    }
    logDebug("function : area_zoom", "E");
}

$(document).keydown(function (e) {
    var new_world = get_canvas_world("LABEL");
    var new_POGJSON = get_canvas_json("LABEL");
    var new_camera = get_canvas_camera("LABEL");
    var map = {};
    var lastKeyPress = e.keyCode;

    if (e.keyCode == 38 && e.ctrlKey == true && typeof new_POGJSON !== "undefined" && new_POGJSON.length > 0) {
        //zoom in
        $("#maincanvas").css("cursor", "zoom-in");
        new_camera.position.set(new_camera.position.x, new_camera.position.y, new_camera.position.z - parseFloat($v("P53_POGCR_CAMERA_ZOOM_FACTOR")));
        g_manual_zoom_ind = "Y";
        render();
    } else if (e.keyCode == 40 && e.ctrlKey == true && typeof new_POGJSON !== "undefined" && new_POGJSON.length > 0) {
        //zoom out
        $("#maincanvas").css("cursor", "zoom-out");
        new_camera.position.set(new_camera.position.x, new_camera.position.y, new_camera.position.z + parseFloat($v("P53_POGCR_CAMERA_ZOOM_FACTOR")));
        g_manual_zoom_ind = "Y";
        render();
    }
    g_renderer.domElement.addEventListener("mousewheel", onDocumentMouseWheel, false);

});

function onDocumentMouseWheel(p_event) {
    logDebug("function : onDocumentMouseWheel", "S");
    g_taskItemInContext = clickInsideElement(p_event, "canvasregion");
    g_taskItemInContext1 = clickInsideElement(p_event, "canvasregion1");
    var l_new_canvas,
        new_camera,
        jselector;
    if (g_taskItemInContext) {
        l_new_canvas = document.getElementById("maincanvas");
        new_camera = g_camera;
        jselector = "#maincanvas";
    } else {
        l_new_canvas = document.getElementById("maincanvas1");
        new_camera = g_camera_comp;
        jselector = "#maincanvas1";
    }
    if (p_event.ctrlKey) {
        g_duplicating = "N";
        p_event.preventDefault();
        p_event.stopPropagation();
        g_manual_zoom_ind = "Y";
        var r = l_new_canvas.getBoundingClientRect();
        var x = p_event.clientX - r.left;
        var y = p_event.clientY - r.top;
        var factor = parseFloat($v("P53_POGCR_CAMERA_ZOOM_FACTOR"));
        var width = l_new_canvas.width / window.devicePixelRatio;
        var height = l_new_canvas.height / window.devicePixelRatio;
        var mX = (2 * x) / width - 1;
        var mY = 1 - (2 * y) / height;
        var vector = new THREE.Vector3(mX, mY, p_event.deltaY / 500);
        vector.unproject(new_camera);
        vector.sub(new_camera.position);
        if (p_event.deltaY < 0) {
            $(jselector).css("cursor", "zoom-in");
            new_camera.position.addVectors(new_camera.position, vector.setLength(factor));
        } else {
            $(jselector).css("cursor", "zoom-out");
            new_camera.position.subVectors(new_camera.position, vector.setLength(factor));
        }
        render();
    } else {
        if (g_manual_zoom_ind == "Y") {
            var scroll_interval = parseFloat($v("P53_POGCR_WHEEL_UP_DOWN_INTER"));

            if (p_event.deltaY < 0) {
                //up
                new_camera.position.set(new_camera.position.x, new_camera.position.y + scroll_interval, new_camera.position.z);
            } else if (p_event.deltaY > 0) {
                //down
                new_camera.position.set(new_camera.position.x, new_camera.position.y - scroll_interval, new_camera.position.z);
            }
            render();
        }
    }
    logDebug("function : onDocumentMouseWheel", "E");
}

function reset_zoom(p_pog_index) {
    logDebug("function : reset_zoom", "S");
    try {
        if ((typeof g_pog_json !== "undefined" && g_pog_json.length > 0) || (typeof g_pog_json_comp !== "undefined" && g_pog_json_comp.length > 0)) {
            $(".top_icon").removeClass("active");
            $(".left_icon").removeClass("active");
            $("#maincanvas").css("cursor", "auto");
            $("#maincanvas1").css("cursor", "auto");
            g_manual_zoom_ind = "N";
            g_area_zoom_ind = "N";
            g_select_zoom_arr = [];
            if (g_curr_canvas == 1) {
                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                set_camera_z(g_scene_objects[p_pog_index].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
            }

            if (typeof g_pog_json_comp !== "undefined" && g_pog_json_comp.length > 0 && g_curr_canvas == 2 && g_compare_view !== "CUTAWAY") {
                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                set_camera_z(g_camera_comp, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
            } else if (g_curr_canvas == 2 && g_compare_view !== "CUTAWAY") {
                set_camera_z(g_camera_comp, g_pog_json[p_pog_index].CompCamX, g_pog_json[p_pog_index].CompCamY, g_pog_json[p_pog_index].CompCamWidth, g_pog_json[p_pog_index].CompCamHeight, g_offset_z, g_pog_json[p_pog_index].CompCamWidth, g_pog_json[p_pog_index].CompCamHeight, true, p_pog_index);
            }

            render();
            g_intersected = [];
        }
        logDebug("function : reset_zoom", "E");
    } catch (err) {
        error_handling(err);
    }
}
//////////////////////////////////////////////////////////////////////////////////////
async function comparePOGPortal(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version) { //ASA-1537
    try {
        logDebug("function : comparePOG", "S");
        await get_compare_pog(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version);
        logDebug("function : comparePOG", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function get_compare_pog(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version) {
    logDebug("function : get_compare_pog; compare_ind : " + p_compare_ind + "; pog_code : " + p_pog_code + "; pog_version : " + p_pog_version + "; draft_id : " + p_draft_id + "; prev_version : " + p_prev_version, "S");
    try {
        if (p_prev_version == "Y") {
            $(".item_color_legends").css("display", "none");
        }
        addLoadingIndicator();
        var new_pog_ind,
            pog_opened,
            old_pog_index = g_pog_index;
        if (p_compare_ind == "1") {
            new_pog_ind = "N";
            pog_opened = "E";
        } else {
            new_pog_ind = "Y";
            pog_opened = "N";
        }

        var p = apex.server.process(
            "GET_COMPARE_JSON", {
            x01: p_compare_ind,
            x02: p_pog_code,
            x03: p_pog_version,
            x04: p_draft_id,
        }, {
            dataType: "html",
        });
        // When the process is done, set the value to the page item
        p.done(function (data) {
            var return_data = $.trim(data);
            if (return_data.match(/ERROR.*/)) {
                raise_error(return_data);
                removeLoadingIndicator(regionloadWait);
            } else if (return_data !== "") {
                g_json = JSON.parse($.trim(data));
                var TEMP_POG = JSON.parse(JSON.stringify(g_pog_json));
                g_pog_json_data = g_json;
                var module_details = g_pog_json_data[0].ModuleInfo;
                i = 0;
                for (const modules of module_details) {
                    if (modules.ShelfInfo == null || typeof modules.ShelfInfo == "undefined") {
                        modules.ShelfInfo = [];
                    }

                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        if (modules.SubDept !== null && typeof modules.SubDept !== "undefined") {
                            subdept = modules.SubDept;
                        }

                        j = 0;

                        for (const shelfs of modules.ShelfInfo) {
                            if (typeof shelfs.ItemInfo == "undefined" || shelfs.ItemInfo == null) {
                                shelfs.ItemInfo = [];
                            }
                            j = j + 1;
                        }
                    }

                    i = i + 1;
                }
                $(".live_image").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
                $(".open_pdf").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
                $(".open_pdf_online").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");

                async function doSomething() {
                    g_pog_json_data[0].PreVersion = "";
                    var new_pog_json = g_pog_json_data[0];
                    g_comp_base_code = new_pog_json.POGCode;
                    new_pog_json.PreVersion = "Y";
                    new_pog_json.POGCode = new_pog_json.POGCode + "-" + "PREV_VERSION";
                    g_ComBaseIndex = old_pog_index;
                    g_colorBackup = "N";
                    g_comp_view_code = new_pog_json.POGCode;

                    if (g_compare_pog_flag == "Y" && g_compare_view == "PREV_VERSION") {
                        g_pog_json[g_ComViewIndex] = new_pog_json;
                        g_ComViewIndex = g_ComViewIndex;
                        init(g_ComViewIndex);
                        var objects = {};
                        objects["scene"] = g_scene;
                        objects["renderer"] = g_renderer;
                        g_scene_objects[g_ComViewIndex] = objects;
                    } else {
                        g_pog_json.push(new_pog_json);
                        g_ComViewIndex = g_pog_json.length - 1;
                        appendMultiCanvasRowCol(g_pog_json.length, $v("P25_POGCR_TILE_VIEW"));
                        init(g_ComViewIndex);
                        var objects = {};
                        objects["scene"] = g_scene;
                        objects["renderer"] = g_renderer;
                        g_scene_objects.push(objects);
                    }

                    var POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
                    g_json = [g_pog_json[g_ComViewIndex]]; //ASA-1418

                    g_compare_view = p_prev_version == "Y" ? "PREV_VERSION" : "POG";
                    g_compare_pog_flag = "Y";
                    set_indicator_objects(g_ComViewIndex);
                    modifyWindowAfterMinMax(g_scene_objects);
                    g_pog_index = g_ComViewIndex;
                    g_multi_pog_json = [];
                    g_world = g_scene_objects[g_ComViewIndex].scene.children[2];
                    g_camera = g_scene_objects[g_ComViewIndex].scene.children[0];

                    var return_val = await create_module_from_json(POG_JSON, new_pog_ind, "F", $v("P25_PRODUCT_BTN_CLICK"), pog_opened, "N", "N", "Y", "Y", "", "Y", g_scene_objects[g_ComViewIndex].scene.children[0], g_scene_objects[g_ComViewIndex].scene, g_pog_index, g_ComViewIndex);
                    removeLoadingIndicator(regionloadWait);
                    render(g_ComViewIndex);

                    if (p_prev_version == "Y") {
                        if (g_show_item_color == "Y") {
                            var res = await showItemColor("OFF", g_ComViewIndex);
                        }
                        var res1 = await two_pog_diff_checker(g_ComBaseIndex, g_ComViewIndex);
                        var res = await calculateFixelAndSupplyDays("N", g_ComViewIndex);
                    }

                    render(g_pog_index);
                    g_pog_index = old_pog_index;
                    add_pog_code_header();
                }
                doSomething();

                $s("P25_OPEN_DRAFT", "Y");
                g_auto_position_ind = "N";
                g_dblclick_opened = "N";
            }
        });
    } catch (err) {
        error_handling(err);
        removeLoadingIndicator(regionloadWait);
    }
}