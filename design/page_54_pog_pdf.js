var l_pog_details = [];
var g_req_count;
var g_item_vertical_text_display = $v("P54_ITEM_CODE_VERT_ALN"); //ASA-1847 4.1
var g_item_text_center_align = $v("P54_ITEM_CODE_CTR_ALN"); //ASA-1847 4.1
var g_pogcr_enhance_textbox_fontsize = $v("P54_POGCR_ENHANCE_TEXTBOX_FONTSIZE"); //ASA-2029 issue 2

async function createWorld_batch() {
    try {
        if (typeof g_scene !== 'undefined')
            await clearThree(g_scene);

        g_scene = {};
        g_camera = {};
        g_world = {};
        if (typeof g_renderer !== "undefined" && g_renderer !== null && g_renderer !== "") {
            g_renderer.dispose();
            //g_renderer.forceContextLoss();
            //g_renderer.context = null;
            //g_renderer.domElement = null;
            //g_renderer = null;
        }

        g_windowHeight = window.innerHeight;
        windowWidth = window.innerWidth;
        g_initial_windowHeight = window.innerHeight;
        g_scene = new THREE.Scene();
        g_camera = new THREE.PerspectiveCamera(25, g_canvas.width / 2 / g_canvas.height, 0.1, 700); //squeeze the FPS TO save memory leak
        g_camera.lookAt(new THREE.Vector3(0, 0, 0));
        g_camera.add(new THREE.PointLight(0xffffff, 0.2)); // point light at camera position
        g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);
        g_camera.aspect = g_canvas.width / 2 / g_canvas.height;
        g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV * (g_windowHeight / g_initial_windowHeight));
        g_camera.updateProjectionMatrix();
        g_scene.add(g_camera);
        console.log('createWorld_batch ', g_canvas, g_renderer);

        /*Bug_26122 pdf error issue
        g_renderer = new THREE.WebGLRenderer({
        canvas: g_canvas,
        antialias: true,
        });*/

        g_renderer.setPixelRatio(window.devicePixelRatio);

        g_renderer.setClearColor(0xffffff);
        var directionlight = new THREE.DirectionalLight(0xffffff, 1);
        directionlight.position.set(-1, 2, 4).normalize();
        g_scene.add(directionlight);

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

        g_renderer.clear();
        g_renderer.render(g_scene, g_camera);
    } catch (err) {
        error_handling(err);
        throw err; //ASA-1307
    }
}

async function init() {
    try {
        /* Start */
        g_select_zoom_arr = [];
        g_pogjson_backup = [];
        g_multi_shelf_arr = [];
        g_temp_cut_arr = [];
        g_errored_items = [];
        g_mod_block_list = [];
        g_temp_image_arr = [];
        g_lines = []; // for function fitText
        g_ItemImages = undefined; //set to undefined so that its references will be removed.
        g_ItemImages = [];
        g_deletedItems = [];
        g_cutaway_cam_detail = [];
        g_carpark_items = [];
        g_cut_loc_arr = [];
        g_undo_obj_arr = [];
        g_undo_supp_obj_arr = [];
        g_redo_supp_obj_arr = [];
        g_undo_details = [];
        g_delete_details = [];
        g_undo_all_obj_arr = [];
        g_cut_support_obj_arr = [];
        g_multi_drag_shelf_arr = [];
        g_multi_drag_item_arr = [];
        g_cut_copy_arr = [];
        g_redo_all_obj_arr = [];
        g_redo_final_obj_arr = [];
        g_scene_objects_backup = [];
        g_drag_items_arr = [];
        g_allUndoObjectsInfo = [];
        g_dup_mod_list = [];
        g_pog_json_data = [];
        g_undo_final_obj_arr = [];
        g_module_obj_array = [];
        g_pogBackup = undefined; //ASA-1307
        g_pogBackup = [];
        g_intersected = [];
        g_delete_item_json = [];
        g_combinedShelfs = []; //ASA-1129
        g_combineItemModf = []; //ASA-1129
        g_seqArr = [];
        g_seqArrDtl = {};
        g_renum_json = [];
        g_multi_pog_json = undefined;
        g_multi_pog_json = [];
        g_scene_objects = [];
        g_canvas_objects = [];
        g_json = undefined; //dispose its references//ASA-1307
        g_json = [];
        g_pog_json = undefined; //dispose its references//ASA-1307
        g_pog_json = [];
        g_pog_list = [];
        g_status_bar = [];
        g_shelf_details = [];
        g_color_arr = [];
        g_highlightArr = [];
        /* End */
        g_all_pog_flag = "Y";

        g_canvas_region = document.getElementById("drawing_region");
        selection = document.getElementById("selection");

        /*Bug_26122 pdf error issue
        g_renderer = new THREE.WebGLRenderer({
        canvas: g_canvas,
        antialias: true
        });*/
        g_canvas_objects.push(g_canvas);

        createWorld_batch();
        //g_raycaster = new THREE.Raycaster();// //ASA-1307 this is not needed as there is no mouse events.
        render();
        multiselect = "N";
        ctrl_select = "N";

        //g_windowHeight = window.innerHeight;
        //windowWidth = window.innerWidth;

        //g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);

        //g_initial_windowHeight = window.innerHeight;
        //g_camera.aspect = windowWidth / g_windowHeight;

        // adjust the FOV
        //g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV * (g_windowHeight / g_initial_windowHeight));
        //g_camera.updateProjectionMatrix();
        //g_renderer.render(g_scene, g_camera);
        window.addEventListener("resize", onWindowResize, false);
        onWindowResize("F");
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML = "<p><b>Sorry, an error occurred:<br>" + e + "</b></p>";
        return;
    }

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

async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_recreate, p_create_json, p_pog_index, p_pog_details) {
    try {
        console.log(p_pog_json_arr);
        console.log(p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_recreate, p_create_json, p_pog_index, p_pog_details);
        g_pog_json = p_pog_json_arr;
        await get_all_images(p_pog_index);
        g_show_live_image = 'Y';
        g_pog_json = [];
        g_json = p_pog_json_arr; //20240415 Rregression issue 12 20240430
        await create_module_from_json_lib(
            p_pog_json_arr,
            p_new_pog_ind,
            p_pog_type,
            p_product_open,
            p_pog_opened,
            p_recreate,
            p_create_json,
            $v("P54_VDATE"),
            $v("P54_POG_DEFAULT_COLOR"),
            $v("P54_MODULE_DEFAULT_COLOR"),
            null,
            false,
            "N",
            null,
            $v("P54_POGCR_DFT_SPREAD_PRODUCT"),
            parseFloat($v("P54_PEGBOARD_DFT_HORZ_SPC")),
            parseFloat($v("P54_PEGBOARD_DFT_VERT_SPC")),
            parseFloat($v("P54_BASKET_WALL_THICK")),
            parseFloat($v("P54_CHEST_WALL_THICK")),
            $v("P54_POGCR_PEG_ITEM_AUTO_PLACE"),
            $v("P54_POGCR_DEFAULT_WRAP_TEXT"),
            parseInt($v("P54_POGCR_TEXT_DEFAULT_SIZE")),
            $v("P54_POG_TEXTBOX_DEFAULT_COLOR"),
            $v("P54_SHELF_DEFAULT_COLOR"),
            $v("P54_DIV_COLOR"),
            $v("P54_SLOT_DIVIDER"),
            $v("P54_SLOT_ORIENTATION"),
            $v("P54_DIVIDER_FIXED"),
            $v("P54_ITEM_DFT_COLOR"),
            $v("P54_POGCR_DELIST_ITEM_DFT_COLOR"),
            "Y",
            null,
            // 1,
            3, //ASA-2029 issue 2
            $v("P54_MERCH_STYLE"),
            $v("P54_POGCR_LOAD_IMG_FROM"),
            $v("P54_BU_ID"),
            $v("P54_POGCR_DELIST_ITEM_DFT_COLOR"),
            $v("P54_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P54_POGCR_DISPLAY_ITEM_INFO"),
            $v("P54_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P54_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P54_NOTCH_HEAD"),
            "N",
            $v("P54_POGCR_DFT_BASKET_FILL"),
            $v("P54_POGCR_DFT_BASKET_SPREAD"),
            g_scene_objects[p_pog_index].scene.children[0],
            p_pog_index,
            p_pog_index,
            $v('P54_POGCR_NOTCH_START_VALUE'), //--ASA-1310 prasanna ASA-1310_20240307
            $v('P54_POGCR_MANUAL_CRUSH_ITEM'),
            'Y');

        animate_pog(p_pog_index);
        /*if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && p_recreate == 'Y') { //ASA-1350 issue 6//ASA-1353 issue 3 --Task_27104 20240417
        var m = 0;
        var moduleCombInfo = g_pog_json[p_pog_index].ModuleInfo;
        for (g_module of moduleCombInfo) {
        var s = 0;
        var shelfCombInfo = g_pog_json[p_pog_index].ModuleInfo[m].ShelfInfo;
        for (shelf_info of shelfCombInfo) {
        if ((shelf_info.ObjType == "SHELF" || shelf_info.ObjType == "HANGINGBAR") && shelf_info.Combine !== "N") { //ASA-1350 issue 6 case 2 added parameters
        await generateCombinedShelfs(p_pog_index, m, s, $v("P54_POGCR_DELIST_ITEM_DFT_COL"), $v("P54_MERCH_STYLE"), $v("P54_POGCR_LOAD_IMG_FROM"), $v("P54_BU_ID"), $v("P54_POGCR_ITEM_NUM_LBL_COLOR"), $v("P54_POGCR_ITEM_NUM_LABEL_POS"), $v("P54_POGCR_DISPLAY_ITEM_INFO"), 'N', 'N', 'N'); //g_merge_items, p_calc_days_of_supply,p_combinedetails-- mergeAdjacentItems and calculateFixelAndSupplyDays not needed to call from this page. //asa-1353
        }
        s++;
        }
        m++;
        }
        }*/
        g_module_obj_array = []; // //ASA-1307 This variable not needed which is used only for wpd. so empty it.
        g_show_live_image = 'N';
        g_show_item_desc = 'N';
        g_show_fixel_label = 'N';
        g_show_item_label = 'N';
        g_show_notch_label = 'N';


        //ASA-1652 #10 Start
        var modIdx = 0;
        for (const modInfo of g_pog_json[p_pog_index].ModuleInfo) {
            if (typeof modInfo.ParentModule == "undefined" || modInfo.ParentModule == null) {
                var shelfIdx = 0;
                for (const shelf of modInfo.ShelfInfo) {
                    if (shelf.ObjType == "TEXTBOX") {
                        var selObj = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].SObjID);
                        selObj['ShelfInfo'] = g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx];
                        textboxPriorityPlacing(selObj, p_pog_index, g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].Z);
                    }
                    shelfIdx++;
                }
            }
            modIdx++;
        }
        //ASA-1652 #10 End

        var details_arr = p_pog_details.TemplateDetails.split("-");   //ASA-2022 ISSUE 1

        //ASA-1870 passed new parameters values from p_enhance_pdf_image to last
        console.log("FontSize" ,$v("P54_POGCR_DEFAULT_WRAP_TEXT"),
            $v("P54_POGCR_TEXT_DEFAULT_SIZE"))
        var return_val = await create_pdf(
            p_pog_details,
            "Y",
            "N",
            g_scene_objects[p_pog_index].scene.children[0],
            "E",
            $v("P54_POGCR_ITEM_NUM_LABEL_COLOR"),
            $v("P54_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P54_POGCR_DISPLAY_ITEM_INFO"),
            $v("P54_NOTCH_HEAD"),
            'N',
            p_pog_index,
            "Y",
            g_all_pog_flag,
            $v("P54_MERCH_STYLE"),
            $v("P54_POGCR_LOAD_IMG_FROM"),
            $v("P54_BU_ID"),
            $v("P54_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P54_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P54_POGCR_DISPLAY_ITEM_INFO"),
            $v("P54_POGCR_DELIST_ITEM_DFT_COL"),
            "N",
            "",
            [],
            details_arr[7],//ASA-2022 ISSUE 1 'N', 
            $v('P54_POGCR_ENHANCE_PDF_IMG'), 
            $v('P54_POGCR_PDF_IMG_ENHANCE_RATIO'),
            $v('P54_POGCR_PDF_CANVAS_SIZE'),
            $v("P54_VDATE"),
            $v("P54_POG_POG_DEFAULT_COLOR"),
            $v("P54_POG_MODULE_DEFAULT_COLOR"),
            $v("P54_POGCR_DFT_SPREAD_PRODUCT"),
            $v("P54_PEGBOARD_DFT_HORZ_SPC"), //0 
            $v("P54_PEGBOARD_DFT_VERT_SPC"), //0 
            $v("P54_BASKET_WALL_THICK"), //0
            $v("P54_CHEST_WALL_THICK"), //0
            'Y',
            $v("P54_POGCR_DEFAULT_WRAP_TEXT"),//N
            $v("P54_POGCR_TEXT_DEFAULT_SIZE"),
            $v("P54_POG_TEXTBOX_DEFAULT_COLOR"),
            $v("P54_SHELF_DEFAULT_COLOR"), //'#3D393D'
            $v("P54_DIV_COLOR"), // ""
            $v("P54_SLOT_DIVIDER"), //'N'
            $v("P54_SLOT_ORIENTATION"), //''
            $v("P54_DIVIDER_FIXED"), //'N'
            $v("P54_ITEM_DFT_COLOR"), //'#FFFFFF',
            $v("P54_POGCR_DFT_BASKET_FILL"),
            $v("P54_POGCR_DFT_BASKET_SPREAD"),
            $v('P54_POGCR_BAY_LIVE_IMAGE'),
            $v('P54_POGCR_BAY_WITHOUT_LIVE_IMAGE'),
            "Y",
        ); //ASA-1311
        removeLoadingIndicator(regionloadWait);
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
        throw err;
    }
    return "SUCCESS";
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
            obj_z = g_pog_json[p_pog_index].BackDepth / 2 + 0.005 + g_pog_json[p_pog_index].BaseDepth;
        } else if (obj_hit == "N") {
            obj_z = g_pog_json[p_pog_index].BackDepth / 2 + 0.005;
        }
        return parseFloat(obj_z.toFixed(3));
    } catch (err) {
        error_handling(err);
    }
}

//added for testing if image can be shown without timeout. should put in common file.
async function get_full_canvas(p_pog_index, p_scale) {
    var header = document.getElementById("t_Header");
    var top_bar = document.getElementById("top_bar");
    var side_nav = document.getElementById("t_Body_nav");
    var button_cont = document.getElementById("side_bar");
    var devicePixelRatio = window.devicePixelRatio;
    var header_height = header !== null ? header.offsetHeight * devicePixelRatio : 0;
    var top_bar_height = top_bar !== null ? top_bar.offsetHeight * devicePixelRatio : 0;
    var side_nav_width = side_nav !== null ? side_nav.offsetWidth * devicePixelRatio : 0;
    var btn_cont_width = button_cont !== null ? button_cont.offsetWidth * devicePixelRatio : 0;

    var main_canvas = document.createElement("canvas");

    g_windowHeight = window.innerHeight - (header_height + top_bar_height);
    windowWidth = window.innerWidth - (side_nav_width + btn_cont_width);
    main_canvas.width = windowWidth * p_scale;
    main_canvas.height = g_windowHeight * p_scale;

    g_camera = g_scene_objects[p_pog_index].scene.children[0];
    g_scene_objects[p_pog_index].scene.children[0].aspect = main_canvas.width / main_canvas.height;
    g_scene_objects[p_pog_index].scene.children[0].updateProjectionMatrix();
    var details = get_min_max_xy(p_pog_index);
    var details_arr = details.split("###");
    set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);

    var context = main_canvas.getContext("2d");
    context.imageSmoothingEnabled = true; // Enable anti-aliasing
    g_renderer.setPixelRatio(window.devicePixelRatio);
    var canvas_width = main_canvas.width;
    var canvas_height = main_canvas.height;

    g_renderer.setSize(canvas_width, canvas_height);
    g_renderer.render(g_scene_objects[p_pog_index].scene, g_scene_objects[p_pog_index].scene.children[0]);
    context.drawImage(g_renderer.domElement, 0, 0, canvas_width, canvas_height);
    g_scene_objects[p_pog_index].scene.children[0].aspect = g_canvas_objects[p_pog_index].width / g_canvas_objects[p_pog_index].height;
    g_scene_objects[p_pog_index].scene.children[0].updateProjectionMatrix();
    return main_canvas;
}

// async function set_scene(p_pog_details, p_save_pdf, p_notch_label, p_fixel_label, p_item_label, p_pdf_lang, p_save_pog, p_mime_type, p_new_item_label, p_show_item_desc, p_draftPogInd, p_item_desc, p_old_live_image, p_loaded_live_img, p_pog_index, p_generateLiveImg, p_workflowSave, p_draftSeqID, p_combineImgInd, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel) {
//     try {
//         logDebug("function : set_scene; p_pog_details : " + p_pog_details + "; save_pdf : " + p_save_pdf + "; notch_label : " + p_notch_label + "; fixel_label : " + p_fixel_label + "; item_label : " + p_item_label + "; pdf_lang : " + p_pdf_lang + "; save_pog : " + p_save_pog + "; mime_type : " + p_mime_type + "; new_item_label : " + p_new_item_label, "S");
//         //var canvas_new = g_canvas;
//         var img_arr = [];
//         var combine_img = [];
//         render(0);
//         var enhance = 0.5;
//         if ($v('P54_POGCR_ENHANCE_PDF_IMG') == 'Y') {
//             enhance = parseFloat($v('P54_POGCR_PDF_IMG_ENHANCE_RATIO'));
//         }
//         console.log(" before base64 ");
//         if (typeof p_combineImgInd !== 'undefined') {
//             var comb_details = p_combineImgInd.split("###");
//         } else {
//             var comb_details = [];
//         }

//         //ASA-1235 START
//         //Start Task_26793 QA error
//         await get_chest_split_details(g_pogcr_pdf_chest_split, p_pog_index); // Sprint 20240122 - Regression Issue 10
//         var updateOrgPOGJSON = JSON.parse(JSON.stringify(g_pog_json));

//         var new_pogjson = JSON.parse(JSON.stringify(g_pog_json));

//         if (g_textbox_merge_pdf == "Y") {
//             var new_pogjson = await merge_textboxes_pdf(new_pogjson);
//         }

//         var mod_count = 0;
//         var mIndex = 0;
//         for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
//             if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
//                 mod_count++;
//             }
//             mIndex++;
//         }
//         //End Task_26793 QA error

//         //ASA-1235 END
//         var i = 0;
//         for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
//             if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
//                 /*if (typeof g_renderer_pdf !== "undefined" && g_renderer_pdf !== null && g_renderer_pdf !== "") {Bug_26122 pdf error issue
//                 g_renderer_pdf.forceContextLoss();
//                 g_renderer_pdf.context = null;
//                 g_renderer_pdf.domElement = null;
//                 g_renderer_pdf = null;
//                 }*/
//                 var can_dim_arr = ($v('P54_POGCR_PDF_CANVAS_SIZE')).split(':'); //start ASA-1310 prasanna ASA-1310_25890
//                 await init_pdf(parseInt(can_dim_arr[0]), parseInt(can_dim_arr[1]), 3 + (enhance == 0.5 ? 0 : 3 * enhance), "N", "Y"); //added clearthree function in init_pdf so aded await
//                 //end ASA-1310 prasanna ASA-1310_25890
//                 try {
//                     nodataModule = false;
//                     var k = 0;
//                     noDataModuleWIdth = 0;
//                     var prevModule = "-1";
//                     if (!modules.Module.includes(g_nodataModuleName)) {
//                         var moduleX = new_pogjson[p_pog_index].ModuleInfo[i].W;
//                         for (var mod of new_pogjson[p_pog_index].ModuleInfo) {
//                             prevModule = modules.Module;
//                             if (k > i) {
//                                 if (nvl(mod.ParentModule) == 0 && mod.Module.includes(g_nodataModuleName)) {
//                                     var module = g_scene_objects[p_pog_index].scene.children[2].getObjectById(mod.MObjID);
//                                     var moduleY = mod.H / 2 + g_pog_json[p_pog_index].BaseH;
//                                     noDataModuleWIdth = noDataModuleWIdth + mod.W + 0.01;
//                                     moduleX = moduleX + mod.W / 2 + 0.01;
//                                     var new_module = module.clone(true);
//                                     new_module.material = module.material.clone(true);
//                                     g_scene_pdf.add(new_module);
//                                     new_module.position.set(moduleX, moduleY, 0);
//                                     moduleX = moduleX + mod.W / 2;
//                                     g_scene_pdf.updateMatrixWorld();
//                                 }
//                             }
//                             k++;
//                         }
//                     }
//                     console.log('create scene started.', new_pogjson[p_pog_index].POGCode)
//                     try {
//                         var return_val = await create_scene(i, p_new_item_label, p_show_item_desc, mod_count, p_loaded_live_img, $v("P54_POGCR_ITEM_NUM_LBL_COLOR"), $v("P54_POGCR_ITEM_NUM_LABEL_POS"), noDataModuleWIdth, p_pog_index);
//                         if (return_val.indexOf("ERROR:") == 0) {
//                             throw return_val;
//                         }
//                     } catch (err) {
//                         console.log(err, 'Error');
//                         throw err;
//                     }

//                 } catch (err) {
//                     console.log(err, 'Error');
//                     error_handling(err);
//                     throw err;
//                 }
//                 var details = get_min_max_xy_module(g_pog_json[p_pog_index].ModuleInfo[i], i, modules.W + noDataModuleWIdth, modules.H, modules.X + noDataModuleWIdth, g_pog_json[p_pog_index].W, mod_count);
//                 var details_arr = details.split("###");
//                 var [cameraz, new_y] = set_camera_z_offside(g_camera_pdf, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, 0, parseFloat(details_arr[5]), true, p_pog_index);
//                 g_camera_pdf.position.x = parseFloat(details_arr[2]);
//                 g_camera_pdf.position.y = parseFloat(details_arr[3]);
//                 g_camera_pdf.position.z = cameraz;
//                 if (g_renderer_pdf !== null) {
//                     animate_pog_pdf();
//                     g_renderer_pdf.render(g_scene_pdf, g_camera_pdf);
//                 }

//                 var dataURL = g_new_canvas.toDataURL("image/jpeg", enhance); //ASA-1366
//                 var img_details = {};
//                 img_details["Module"] = modules.Module;
//                 img_details["ImgData"] = dataURL.match(/,(.*)$/)[1];
//                 img_details["Bay"] = (modules.W * 100).toFixed(2);
//                 img_details["TotalBay"] = (modules.H * 100).toFixed(2) + '*' + (modules.W * 100).toFixed(2);
//                 img_arr.push(img_details);
//             }
//             i = i + 1;
//         }
//         if (img_arr.length > 0) { //to send module image first and then combine so the array length is less.
//             await send_to_db(g_pog_json[p_pog_index].POGCode, img_arr); //ASA -1374 passing hardcode index to pog and mulitple pog not getting the image of module g_pog_json[0] -->g_pog_json[p_pog_index]
//             img_arr = [];
//         }
//         g_pog_json = updateOrgPOGJSON; //ASA-1235

//         //START ADDED REGARDING ASA-1730 ISSUE 1


//         if (comb_details[3] == "Y") {
//             //ASA-1730 Start
//             var totMod = 0;
//             for (const module of g_pog_json[p_pog_index].ModuleInfo) {
//                 if (typeof module.ParentModule == "undefined" || module.ParentModule == null) {
//                     totMod++;
//                 }
//             }
//             //ASA-1730 End
//             var bayCount = 0;
//             if (totMod <= 5) {
//                 bayCount = totMod;
//             } else {
//                 bayCount = parseInt(totMod / 2);
//             }
// 			 try {
// 			//combine_img = await create_combine_pog(bayCount, g_show_live_image, "N", $v("P25_VDATE"), $v("P25_POG_POG_DEFAULT_COLOR"), $v("P25_POG_MODULE_DEFAULT_COLOR"), $v("P25_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P25_PEGB_DFT_HORIZ_SPACING")), parseFloat($v("P25_PEGBOARD_DFT_VERT_SPACING")), parseFloat($v("P25_BASKET_DFT_WALL_THICKNESS")), parseFloat($v("P25_CHEST_DFT_WALL_THICKNESS")), $v("P25_POGCR_PEGB_MAX_ARRANGE"), $v("P25_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P25_POGCR_TEXT_DEFAULT_SIZE")), $v("P25_POG_TEXTBOX_DEFAULT_COLOR"), $v("P25_POG_SHELF_DEFAULT_COLOR"), $v("P25_DIV_COLOR"), $v("P25_SLOT_DIVIDER"), $v("P25_SLOT_ORIENTATION"), $v("P25_DIVIDER_FIXED"), $v("P25_POG_ITEM_DEFAULT_COLOR"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DFT_BASKET_FILL"), $v("P25_POGCR_DFT_BASKET_SPREAD"), p_pog_index, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), combine_details[3]); //ASA-1331 kush fix
//             combine_img = await create_combine_pog(bayCount, "Y", "N", $v("P54_VDATE"), $v("P54_POG_POG_DEFAULT_COLOR"), $v("P54_POG_MODULE_DEFAULT_COLOR"), $v("P54_POGCR_DFT_SPREAD_PRODUCT"), 0, 0, 0, 0, 'Y', 'N', parseInt($v("P54_POGCR_TEXT_DEFAULT_SIZE")), $v("P54_POG_TEXTBOX_DEFAULT_COLOR"), '#3D393D', '', 'N', '', 'N', '#FFFFFF',  $v("P54_POGCR_DELIST_ITEM_DFT_COL"), '', $v("P54_POGCR_LOAD_IMG_FROM"), $v("P54_BU_ID"), '#d6d0d0', $v("P54_POGCR_DISPLAY_ITEM_INFO"), $v("P54_POGCR_ITEM_NUM_LABEL_POS"), $v("P54_NOTCH_HEAD"), $v("P54_POGCR_DFT_BASKET_FILL"), $v("P54_POGCR_DFT_BASKET_SPREAD"), 0, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, $v("P54_POGCR_ITEM_NUM_LBL_COLOR"), $v("P54_POGCR_ITEM_NUM_LABEL_POS"), $v("P54_POGCR_ITEM_NUM_LBL_COLOR"), $v("P54_POGCR_DISPLAY_ITEM_INFO"), comb_details[3]); //ASA-1331 kush fix
//             for (const obj of combine_img) {
//                 img_arr.push(obj);
//             }
// 			} catch (err) {
//                     throw err;
//                 }
//             // animate_pog_pdf();
//             // render(p_pog_index);
//         } //ASA-1640
//         //below logic is specifically for PNSHK. where we combine multiple modules based on the setup in sm_pog_pdf_template and take screen shots
//         //and place in the PDF before report of item details.
//         //END REGARDING ASA-1730 ISSUE 1
//         else if (comb_details[0] == 'Y') {
//             if (comb_details[1] == 'Y') {
//                 try {
//                     combine_img = await create_combine_pog($v('P54_POGCR_BAY_LIVE_IMAGE'), 'Y', 'N', $v("P54_VDATE"), $v("P54_POG_POG_DEFAULT_COLOR"), $v("P54_POG_MODULE_DEFAULT_COLOR"), $v("P54_POGCR_DFT_SPREAD_PRODUCT"), 0, 0, 0, 0, 'Y', 'N', parseInt($v("P54_POGCR_TEXT_DEFAULT_SIZE")), $v("P54_POG_TEXTBOX_DEFAULT_COLOR"), '#3D393D', '', 'N', '', 'N', '#FFFFFF', $v("P54_POGCR_DELIST_ITEM_DFT_COL"), '', $v("P54_POGCR_LOAD_IMG_FROM"), $v("P54_BU_ID"), '#d6d0d0', $v("P54_POGCR_DISPLAY_ITEM_INFO"), $v("P54_POGCR_ITEM_NUM_LABEL_POS"), $v("P54_NOTCH_HEAD"), $v("P54_POGCR_DFT_BASKET_FILL"), $v("P54_POGCR_DFT_BASKET_SPREAD"), 0, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, $v("P54_POGCR_ITEM_NUM_LBL_COLOR"), $v("P54_POGCR_ITEM_NUM_LABEL_POS"), $v("P54_POGCR_ITEM_NUM_LBL_COLOR"), $v("P54_POGCR_DISPLAY_ITEM_INFO"));
//                     for (const obj of combine_img) {
//                         img_arr.push(obj);
//                     }
//                 } catch (err) {
//                     throw err;
//                 }

//             }
//             if (comb_details[2] !== 'N') {
//                 try {
//                     combine_img = await create_combine_pog($v('P54_POGCR_BAY_WITHOUT_LIVE_IMAGE'), 'N', comb_details[2], $v("P54_VDATE"), $v("P54_POG_POG_DEFAULT_COLOR"), $v("P54_POG_MODULE_DEFAULT_COLOR"), $v("P54_POGCR_DFT_SPREAD_PRODUCT"), 0, 0, 0, 0, 'Y', 'N', parseInt($v("P54_POGCR_TEXT_DEFAULT_SIZE")), $v("P54_POG_TEXTBOX_DEFAULT_COLOR"), '#3D393D', '', 'N', '', 'N', '#FFFFFF', $v("P54_POGCR_DELIST_ITEM_DFT_COL"), '', $v("P54_POGCR_LOAD_IMG_FROM"), $v("P54_BU_ID"), '#d6d0d0', $v("P54_POGCR_DISPLAY_ITEM_INFO"), $v("P54_POGCR_ITEM_NUM_LABEL_POS"), $v("P54_NOTCH_HEAD"), $v("P54_POGCR_DFT_BASKET_FILL"), $v("P54_POGCR_DFT_BASKET_SPREAD"), 0, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, $v("P54_POGCR_ITEM_NUM_LBL_COLOR"), $v("P54_POGCR_ITEM_NUM_LABEL_POS"), $v("P54_POGCR_ITEM_NUM_LBL_COLOR"), $v("P54_POGCR_DISPLAY_ITEM_INFO"));
//                     for (const obj of combine_img) {
//                         img_arr.push(obj);
//                     }
//                 } catch (err) {
//                     throw err;
//                 }
//             }

//         } else {
//             var main_canvas;
//             main_canvas = await get_full_canvas(p_pog_index, 3);
//             var dataURL = main_canvas.toDataURL("image/png", 0.5);
//             var img_details = {};
//             img_details["Module"] = "POG";
//             img_details["ImgData"] = dataURL.match(/,(.*)$/)[1];
//             img_arr.push(img_details);
//         }
//         console.log("mod_arr", img_arr);
//         await send_to_db(new_pogjson[p_pog_index].POGCode, img_arr);

//         console.log("finished sending");
//         logDebug("function : Download PDF", "S");
//         set_pegid(new_pogjson, p_pog_index);
//         await create_item_compare(p_pog_details.POGCode, p_pog_details.POGVersion); //ASA-1531 issue 21


//         var p = apex.server.process(
//                 "DOWNLOAD_PDF", {
//                 x01: p_pog_details.SeqNo,
//                 x02: p_pog_details.POGCode,
//                 x03: p_pog_details.POGVersion,
//                 x04: p_pog_details.Selection_Type,
//                 x05: p_pog_details.Print_Type,
//                 x06: p_pog_details.TemplateId,
//                 x07: p_pog_details.SequenceId,
//                 x08: 'Y', //save_pog_pdf
//                 x09: '', // pog_module
//                 p_clob_01: JSON.stringify(new_pogjson),
//             }, {
//                 dataType: "html",
//             });
//         p.done(function (data) {
//             console.log(' download_pdf end', getDateTime());
//             g_req_count++;
//             removeLoadingIndicator(regionloadWait);
//             return "success";
//         });
//         // await download_pdf(pog_code_details_arr, p_template_id, p_save_pdf, p_save_pog, p_draftPogInd, new_pogjson);//Bug_26122 pdf error issue
//         console.log('after download pdf');
//         // return 'Success';


//         logDebug("function : set_scene", "E");
//     } catch (err) {
//         error_handling(err);
//         throw err;
//     }
// }

// async function set_scene(p_pog_details, p_save_pdf, p_notch_label, p_fixel_label, p_item_label, p_pdf_lang, p_save_pog,
//     p_mime_type, p_new_item_label, p_show_item_desc, p_draftPogInd, p_item_desc, p_old_live_iamge,
//     p_loaded_live_img, p_pog_index, p_generateLiveImg, p_workflowSave = "N", p_draftSeqID = "", p_combineImgInd, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel,
//     p_enhance_pdf_image, p_enhance_pdf_ratio, p_canvas_size, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_Buid, p_MerchStyle, p_NotchHead, p_LoadImgFrom, p_pogcrDescListArr, p_DelistDftColor,
//     p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, p_pegb_dft_horiz_spacing, p_pegboard_dft_vert_spacing, p_basket_dft_wall_thickness,
//     p_chest_wall_thickness, p_pegb_max_arrange, p_default_wrap_text, p_cr_default_text_size, p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_default_basket_fill, p_default_basket_spread, p_bay_live_image, p_bay_without_live_image, p_pog_pdf_request) //ASA-1870 added new parameters 
//  {
//     console.log(p_pog_details);
//     logDebug("function : set_scene; p_pog_details : " + p_pog_details + "; save_pdf : " + p_save_pdf + "; notch_label : " + p_notch_label + "; fixel_label : " + p_fixel_label + "; item_label : " + p_item_label + "; pdf_lang : " + p_pdf_lang + "; save_pog : " + p_save_pog + "; mime_type : " + p_mime_type + "; new_item_label : " + p_new_item_label, "S");
//     var img_arr = [];
//     render(p_pog_index);
//     var base64;
//     var comp_data = "";
//     var noDataModuleWIdth = 0;
//     var nodataModule = false;
//     var enhance = 0.5;
//     if (p_enhance_pdf_image == "Y") {
//         enhance = parseFloat(p_enhance_pdf_ratio);
//     }
//     if (typeof p_combineImgInd !== "undefined") {
//         var combine_details = p_combineImgInd.split("###");
//     } else {
//         var combine_details = [];
//     }
//     reset_zoom();
//     var new_pogjson = [];
//     if (p_pog_pdf_request == "N") {
//         set_pegid(p_pog_index);
//     }
//     // ASA-1235
//     // Replaced new_pogjson and new_pogjson[0] to new_pogjson[p_pog_index]

//     if (p_mime_type == "xlsx") {
//         var res = await save_pog_to_json([g_pog_json[p_pog_index]]);
//     }

//     //ASA-1235 START
//     var updateOrgPOGJSON = JSON.parse(JSON.stringify(g_pog_json));
//     //Start Sprint 20240122 - Regression Issue 10
//     // according to requirement if there is a chest spanning to more than one module then we need to split them into
//     //pieces which will fit into each module for purpose of PDF.
//     await get_chest_split_details(g_pogcr_pdf_chest_split, p_pog_index); // Sprint 20240122 - Regression Issue 10

//     new_pogjson = JSON.parse(JSON.stringify(g_pog_json));

//     //if text boxes are out of the module then we need to change that to the module where max width is occupied.
//     if (g_textbox_merge_pdf == "Y") {
//         var new_pogjson = await merge_textboxes_pdf(new_pogjson, p_pog_index); //0
//     }
//     var i = 0;
//     var mod_count = 0;
//     for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
//         if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
//             mod_count++;
//         }
//     }

//     //ASA-1702 Issue 1, shifted to dynamic action of SAVE_POG/SAVE_PDF button
//     //Regression 9 20241025
//     // apex.server.process(
//     //     "TRUNC_MOD_IMG_COLL", {
//     //     x01: "",
//     // }, {
//     //     dataType: "text",
//     //     success: function (pData) {
//     //         console.log('Module Image collection truncated');
//     //     }
//     // });
//     var i = 0;
//     //this loop will create module wise image with shelf and items.
//     for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
//         if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
//             /*if (typeof g_renderer_pdf !== "undefined" && g_renderer_pdf !== null && g_renderer_pdf !== "") { //ASA-1366
//             g_renderer_pdf.forceContextLoss();
//             g_renderer_pdf.context = null;
//             g_renderer_pdf.domElement = null;
//             g_renderer_pdf = null;
//             }*/
//             var can_dim_arr = p_canvas_size.split(":"); //start ASA-1310 prasanna ASA-1310_25890
//             await init_pdf(parseInt(can_dim_arr[0]), parseInt(can_dim_arr[1]), 3 + (enhance == 0.5 ? 0 : 3 * enhance), "N", "Y"); //added clearthree function in init_pdf so aded await
//             //end ASA-1310 prasanna ASA-1310_25890
//             try {
//                 nodataModule = false;
//                 var k = 0;
//                 noDataModuleWIdth = 0;
//                 var prevModule = "-1";
//                 if (!modules.Module.includes(g_nodataModuleName)) {
//                     var moduleX = new_pogjson[p_pog_index].ModuleInfo[i].W;
//                     for (var mod of new_pogjson[p_pog_index].ModuleInfo) {
//                         prevModule = modules.Module;
//                         if (k > i) {
//                             if (nvl(mod.ParentModule) == 0 && mod.Module.includes(g_nodataModuleName)) {
//                                 var module = g_world.getObjectById(mod.MObjID);
//                                 var moduleY = mod.H / 2 + g_pog_json[p_pog_index].BaseH;
//                                 noDataModuleWIdth = noDataModuleWIdth + mod.W + 0.01;
//                                 moduleX = moduleX + mod.W / 2 + 0.01;
//                                 var new_module = module.clone(true);
//                                 new_module.material = module.material.clone(true);
//                                 g_scene_pdf.add(new_module);
//                                 new_module.position.set(moduleX, moduleY, 0);
//                                 moduleX = moduleX + mod.W / 2;
//                                 g_scene_pdf.updateMatrixWorld();
//                             }
//                         }
//                         k++;
//                     }
//                 }
//                 //this function will create the object for one module at a time in g_new_canvas, which is hidden and will not show to the
//                 //user. we take screen shot of this canvas in a loop and add in array.
//                 var return_val = await create_scene(i, p_new_item_label, p_show_item_desc, mod_count, p_loaded_live_img, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, noDataModuleWIdth, p_pog_index); //ASA-1870
//             } catch (err) {
//                 error_handling(err);
//             }
//             var details = get_min_max_xy_module(modules, i, modules.W + noDataModuleWIdth, modules.H, modules.X + noDataModuleWIdth, new_pogjson[p_pog_index].W, mod_count);
//             var details_arr = details.split("###");
//             var [cameraz, new_y] = set_camera_z_offside(g_camera_pdf, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, 0, parseFloat(details_arr[5]), true, p_pog_index);
//             g_camera_pdf.position.x = parseFloat(details_arr[2]);
//             g_camera_pdf.position.y = parseFloat(details_arr[3]);
//             g_camera_pdf.position.z = cameraz; //ASA-1370  isssue 2 + g_offset_z
//             if (g_renderer_pdf !== null) {
//                 animate_pog_pdf();
//                 g_renderer_pdf.render(g_scene_pdf, g_camera_pdf);
//             }

//             base64 = "";
//             //g_nodataModuleName will have few module names. that do not be printed in PDF. so we avoid that.
//             if (!modules.Module.includes(g_nodataModuleName)) {
//                 var dataURL = await g_new_canvas.toDataURL("image/jpeg", enhance);
//                 var img_details = {};
//                 img_details["Module"] = modules.Module;
//                 img_details["MIndex"] = i;
//                 img_details["Bay"] = (modules.W * 100).toFixed(2);
//                 img_details["TotalBay"] = (modules.H * 100).toFixed(2) + "*" + (modules.W * 100).toFixed(2);
//                 img_details["ImgData"] = dataURL.match(/,(.*)$/)[1];
//                 img_arr.push(img_details);
//             }
//         }
//         i++;
//     }

//     //ASA-1627 Start
//     /*
//         Added a for loop because we need to remove the whitespace from each screenshot of an module.
//         Except removing of whitespace all code is existing which is written under if block(if(imgCount == img_arr.length))
//      */
//     var imgCount = 0;
//     for (const mod_img of img_arr) {
//         const webglImage = "data:image/jpeg;base64," + mod_img.ImgData;
//         const img = new Image();
//         img.src = webglImage;
//         // img.onload = async function () { //ASA-1710
//         await new Promise(
//             (resolve) =>
//             (img.onload = async function () {
//                 const canvas2D = document.createElement("canvas");
//                 canvas2D.width = img.width;
//                 canvas2D.height = img.height;
//                 const ctx2D = canvas2D.getContext("2d");
//                 ctx2D.drawImage(img, 0, 0);
//                 //ASA-1787, added combine_details[4] == "Y", crop_img_ind
//                 if (combine_details[4] == "Y") {
//                     var [croppedCanvas, scaleToFit] = cropCanvasToContent(canvas2D); //ASA-1820
//                     new_pogjson[p_pog_index].ModuleInfo[mod_img.MIndex].ScaleToFit = scaleToFit; //ASA-1820
//                     if (imgCount == 0) {
//                         if (scaleToFit == "Y") {
//                             new_pogjson[p_pog_index].PageBreakInit = "Y"; //ASA-1820
//                         } else {
//                             new_pogjson[p_pog_index].PageBreakInit = "N"; //ASA-1820
//                         }
//                     }
//                     var croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
//                 } else {
//                     var [cropCanvas, scaleToFit] = cropCanvasToContent(canvas2D); //ASA-1831
//                     new_pogjson[p_pog_index].ModuleInfo[mod_img.MIndex].ScaleToFit = scaleToFit; //ASA-1831
//                     var croppedCanvas = cropCanvasToContent_old(canvas2D);
//                     var croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
//                 }
//                 img_arr[imgCount].ImgData = croppedDataURL.match(/,(.*)$/)[1];
//                 imgCount++;
//                 if (imgCount == img_arr.length) {
//                     if (img_arr.length > 0) {
//                         //to send module image first and then combine so the array length is less. //ASA-1366
//                         await send_to_db(g_pog_json[p_pog_index].POGCode, img_arr); //ASA -1374 passing hardcode index to pog and mulitple pog not getting the image of module g_pog_json[0] -->g_pog_json[p_pog_index]
//                         img_arr = [];
//                     }

//                     for (const modules of new_pogjson[p_pog_index].ModuleInfo) {
//                         if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
//                             for (const shelfs of modules.ShelfInfo) {
//                                 if (shelfs.ObjType == "TEXTBOX") {
//                                     var shelf = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
//                                     if (typeof shelf !== "undefined") {
//                                         shelf.material.transparent = true;
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                     g_pog_json = updateOrgPOGJSON; //ASA-1235 ASA-1300 this was inside the dowload pdf before recreate, but which was taken before recreate inside combine. so added before.
//                     var combine_img = [];
//                     if (combine_details[3] == "Y") {
//                         //ASA-1730 Start
//                         // var totMod = g_pog_json[p_pog_index].ModuleInfo.length;
//                         var totMod = 0;
//                         for (const module of g_pog_json[p_pog_index].ModuleInfo) {
//                             if (typeof module.ParentModule == "undefined" || module.ParentModule == null) {
//                                 totMod++;
//                             }
//                         }
//                         //ASA-1730 End
//                         var bayCount = 0;
//                         if (totMod <= 5) {
//                             bayCount = totMod;
//                         } else {
//                             bayCount = parseInt(totMod / 2);
//                         }
//                         combine_img = await create_combine_pog(bayCount, g_show_live_image, "N", p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, parseFloat(p_pegb_dft_horiz_spacing), parseFloat(p_pegboard_dft_vert_spacing), parseFloat(p_basket_dft_wall_thickness), parseFloat(p_chest_wall_thickness), p_pegb_max_arrange, p_default_wrap_text, parseInt(p_cr_default_text_size), p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_DelistDftColor, p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pogcrItemLabelPosition, p_NotchHead, p_default_basket_fill, p_default_basket_spread, p_pog_index, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrItemBackLabelColor, p_pogcrDescListArr, combine_details[3]); //ASA-1331 kush fix
//                         for (const obj of combine_img) {
//                             img_arr.push(obj);
//                         }
//                         // animate_pog_pdf();
//                         // render(p_pog_index);
//                     } //ASA-1640
//                     //below logic is specifically for PNSHK. where we combine multiple modules based on the setup in sm_pog_pdf_template and take screen shots
//                     //and place in the PDF before report of item details.
//                     else if (combine_details[0] == "Y") {
//                         if (combine_details[1] == "Y") {
//                             combine_img = await create_combine_pog(p_bay_live_image, "Y", "N", p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, parseFloat(p_pegb_dft_horiz_spacing), parseFloat(p_pegboard_dft_vert_spacing), parseFloat(p_basket_dft_wall_thickness), parseFloat(p_chest_wall_thickness), p_pegb_max_arrange, p_default_wrap_text, parseInt(p_cr_default_text_size), p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_DelistDftColor, p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pogcrItemLabelPosition, p_NotchHead, p_default_basket_fill, p_default_basket_spread, p_pog_index, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrItemBackLabelColor, p_pogcrDescListArr); //ASA-1331 kush fix
//                             for (const obj of combine_img) {
//                                 img_arr.push(obj);
//                             }
//                         }
//                         if (combine_details[2] !== "N") {
//                             //ASA-1366
//                             combine_img = await create_combine_pog(p_bay_without_live_image, "N", combine_details[2], p_vdate, p_pog_default_color, p_pog_module_default_color, p_pogcr_dft_spread_product, parseFloat(p_pegb_dft_horiz_spacing), parseFloat(p_pegboard_dft_vert_spacing), parseFloat(p_basket_dft_wall_thickness), parseFloat(p_chest_wall_thickness), p_pegb_max_arrange, p_default_wrap_text, parseInt(p_cr_default_text_size), p_textbox_default_color, p_shelf_default_color, p_div_color, p_slot_divider, p_slot_orientation, p_fixed_divider, p_pog_item_default_color, p_DelistDftColor, p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pogcrItemLabelPosition, p_NotchHead, p_default_basket_fill, p_default_basket_spread, p_pog_index, p_pdfnotchlabel, p_pdfFixelLabel, p_pdfItemLabel, enhance, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrItemBackLabelColor, p_pogcrDescListArr); //ASA-1331 kush fix
//                             for (const obj of combine_img) {
//                                 img_arr.push(obj);
//                             }
//                             p_loaded_live_img = "N";
//                             p_item_desc = "N";
//                         }
//                         // animate_pog_pdf();
//                         // render(p_pog_index);
//                     } else {
//                         var main_canvas;
//                         main_canvas = await get_full_canvas(p_pog_index, 3);
//                         var dataURL = main_canvas.toDataURL("image/jpeg", 0.9);
//                         var img_details = {};
//                         img_details["Module"] = "POG";
//                         img_details["ImgData"] = dataURL.match(/,(.*)$/)[1];
//                         img_arr.push(img_details);
//                     }
//                     //ASA-1640 #8 Start
//                     imgCount = 0;
//                     for (const mod_img of img_arr) {
//                         const webglImage = "data:image/jpeg;base64," + mod_img.ImgData;
//                         const img = new Image();
//                         img.src = webglImage;
//                         img.onload = async function () {
//                             const canvas2D = document.createElement("canvas");
//                             canvas2D.width = img.width;
//                             canvas2D.height = img.height;
//                             const ctx2D = canvas2D.getContext("2d");
//                             ctx2D.drawImage(img, 0, 0);

//                             //ASA-1787, added combine_details[4] == "Y", crop_img_ind
//                             if (combine_details[3] == "Y") {
//                                 if (combine_details[4] == "Y") {
//                                     var [croppedCanvas, scaleToFit] = cropCanvasToContent(canvas2D); //ASA-1820
//                                     var croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
//                                 } else {
//                                     var croppedCanvas = cropCanvasToContent_old(canvas2D);
//                                     var croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
//                                 }
//                             } else {
//                                 var croppedCanvas = cropCanvasToContent_old(canvas2D); //ASA-1831 To run cropCanvasToContent_old when combine_details[3] = N
//                                 croppedDataURL = canvas2D.toDataURL("image/jpeg", enhance);
//                             } //ASA-1640 #8
//                             img_arr[imgCount].ImgData = croppedDataURL.match(/,(.*)$/)[1];
//                             imgCount++;
//                             if (imgCount == img_arr.length) {
//                                 if (combine_details[3] == "Y" || combine_details[0] == "Y") {
//                                     animate_pog_pdf();
//                                     render(p_pog_index);
//                                 }
//                                 var return_val = await send_to_db(new_pogjson[p_pog_index].POGCode, img_arr);
//                                 if (p_pog_pdf_request == "N") {
//                                     await uploadImage(0);	
//                                 }
//                                 else{
//                                     set_pegid(new_pogjson, p_pog_index);
//                                 }
//                                 await create_item_compare(p_pog_details.POGCode, p_pog_details.POGVersion); //ASA-1870

//                                 var p_pog_version = "";
//                                 p_pog_version = new_pogjson[p_pog_index].Version;
//                                 if (p_pog_pdf_request == "Y") {
//                                     //calling PDF creation function
//                                     var p = apex.server.process(
//                                         "DOWNLOAD_PDF", {
//                                         x01: p_pog_details.SeqNo,
//                                         x02: p_pog_details.POGCode,
//                                         x03: p_pog_details.POGVersion,
//                                         x04: p_pog_details.Selection_Type,
//                                         x05: p_pog_details.Print_Type,
//                                         x06: p_pog_details.TemplateId,
//                                         x07: p_pog_details.SequenceId,
//                                         x08: 'Y', //save_pog_pdf
//                                         x09: '', // pog_module
//                                         p_clob_01: JSON.stringify(new_pogjson),
//                                     }, {
//                                         dataType: "html",
//                                     });
//                                     p.done(function (data) {
//                                         console.log(' download_pdf end', getDateTime());
//                                         g_req_count++;
//                                         removeLoadingIndicator(regionloadWait);
//                                         return "success";
//                                     });
//                                     console.log('after download pdf');
//                                 }
//                                 else{
//                                     //calling PDF creation function
// 									var p = apex.server.process(
// 										"DOWNLOAD_PDF",
// 										{
// 											x01: p_pog_details.SeqNo,
// 											x02: new_pogjson[p_pog_index].POGCode,
// 											x03: p_pog_version,
// 											x04: p_pog_details.Selection_Type,
// 											x05: "P",
// 											x06: p_pog_details.TemplateId,
// 											x07: p_workflowSave == "Y" ? p_draftSeqID : "",
// 											x08: p_save_pdf,
// 											x09: p_draftPogInd, // ASA-1444
// 											x10: $v("P25_EXISTING_DRAFT_VER"), //ASA-1444
// 											x11: $v("P25_DEFAULT_LIVE_VERSION"), //ASA-1677 #4
// 											x12: $v("P25_PREV_PDF_POG_VERSION"), //ASA-1677 #4
// 											p_clob_01: JSON.stringify(new_pogjson[p_pog_index]),
// 										},
// 										{
// 											dataType: "html",
// 										}
// 									);
// 									p.done(function (data) {
// 										//we on few labels in the WPD pog for the setup done in sm_pog_pdf_template to get the image of Module wise image.
// 										//we need to reset all the labels bask to the original that was before creating PDF.
// 										p_fixel_label == "Y" ? (g_show_fixel_label = "Y") : (g_show_fixel_label = "N");
// 										p_item_label == "Y" ? (g_show_item_label = "Y") : (g_show_item_label = "N");
// 										p_notch_label == "Y" ? (g_show_notch_label = "Y") : (g_show_notch_label = "N");
// 										p_item_desc == "Y" ? (g_show_item_desc = "Y") : (g_show_item_desc = "N");
// 										if (p_pog_version === undefined || p_pog_version === null) {
// 											//ASA-1813
// 											p_pog_version = "";
// 										}

// 										var l_url = "f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=OPEN_PDF:NO::AI_RANDOM_STRING,P25_OPEN_POG_CODE,P25_OPEN_POG_VERSION:" + new Date().getTime() + "," + new_pogjson[p_pog_index].POGCode + "," + p_pog_version; //ASA-1553
// 										try {
// 											if (typeof regionloadWait !== "undefined" && typeof regionloadWait.remove == "function") {
// 												removeLoadingIndicator(regionloadWait);
// 											}
// 										} catch {
// 											console.log("no loading");
// 										}

// 										logDebug("function : Download PDF", "E");
// 										if (g_all_pog_flag == "N") {
// 											window.open(l_url, "new data");
// 										}

// 										async function do_something() {
// 											if (p_old_live_iamge == "N" && p_loaded_live_img == "Y" && p_generateLiveImg != "N") {
// 												var return_val = await recreate_image_items("N", p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrDescListArr, p_DelistDftColor, p_NotchHead, p_pog_index, g_show_days_of_supply, "", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST') //ASA-1608 added g_show_days_of_supply, before "N"
// 											} else if (p_old_live_iamge == "Y" && p_loaded_live_img == "N" && p_generateLiveImg != "N") {
// 												var return_val = await recreate_image_items("Y", p_MerchStyle, p_LoadImgFrom, p_Buid, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pogcrDescListArr, p_DelistDftColor, p_NotchHead, p_pog_index, g_show_days_of_supply, "", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST') //ASA-1608 added g_show_days_of_supply, before "N"
// 											}
// 											if (p_show_item_desc == "Y" && p_item_desc == "N") {
// 												var res = await showHideItemDescription("N", p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_index);
// 											} else if (p_show_item_desc == "N" && p_item_desc == "Y") {
// 												var res = await showHideItemDescription("Y", p_pogcrItemBackLabelColor, p_pogcrDescListArr, p_pog_index);
// 											}
// 											if (g_show_notch_label == "Y") {
// 												await show_notch_labels("Y", p_NotchHead, "Y", p_pog_index);
// 											} else {
// 												await show_notch_labels("N", p_NotchHead, "Y", p_pog_index);
// 											}
// 											if (g_show_fixel_label == "Y") {
// 												await show_fixel_labels("Y", p_pog_index);
// 											} else {
// 												await show_fixel_labels("N", p_pog_index);
// 											}
// 											if (g_show_item_label == "Y") {
// 												await show_item_labels("Y", p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index);
// 											} else {
// 												await show_item_labels("N", p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index);
// 											}
// 											await showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, p_pogcrItemBackLabelColor, p_pogcrItemLabelPosition, p_pog_index); //ASA-1182
// 										}
// 										do_something();
// 									});
//                                 }
//                             }
//                         };
//                     }
//                 }
//                 resolve(); //ASA-1710
//             })
//         );
//     }
//     //ASA-1627 End

//     logDebug("function : set_scene", "E");
// }

function get_json_data(p_SeqNo, p_POGCode, p_POGVersion, p_SequenceId) {
        try {
            return new Promise(function (resolve, reject) {
                var p = apex.server.process(
                    "GET_POG_JSON", {
                    x01: p_SeqNo,
                    x02: p_POGCode,
                    x03: p_POGVersion,
                    x04: p_SequenceId
                }, {
                    dataType: "html",
                });
                // When the process is done, set the value to the page item
                p.done(function (data) {
                    if ($.trim(data).indexOf("ERROR") == -1) {
                        resolve(JSON.parse($.trim(data)));
                    } else {
                        resolve($.trim(data));
                    }
                });
            });
        } catch (err) {
            error_handling(err);
        }
    }

    async function generate_pdf(p_pog_index) {
        try {
            g_show_error = false;
            g_req_count = 0;
            //Start Bug_26122 pdf error issue
            g_renderer = new THREE.WebGLRenderer({
                canvas: g_canvas,
                antialias: true,
            });

            g_renderer.setPixelRatio(window.devicePixelRatio);

            g_renderer.setClearColor(0xffffff);
            //End Bug_26122 pdf error issue

            for (const pog_details of l_pog_details) {
                try {
                    p_pog_index = 0;
                    await init(0);
                    objects = {};
                    objects["scene"] = g_scene;
                    objects["renderer"] = g_renderer;
                    g_scene_objects.push(objects);
                    //g_world = g_scene_objects[0].scene.children[2];
                    console.log('PDF Creation :', g_scene_objects, g_world, g_canvas_objects, pog_details.POGCode, pog_details.POGVersion);

                    var returnval = await get_json_data(pog_details.SeqNo, pog_details.POGCode, pog_details.POGVersion, pog_details.SequenceId);

                    if (returnval.indexOf("ERROR") == -1) {
                        var return_val = await create_module_from_json(returnval, "N", "F", "N", "E", "Y", "Y", p_pog_index, pog_details);
                        if (return_val.indexOf("ERROR:") == 0) {
                            raise_error(return_val);
                        }
                    } else {
                        raise_error(returnval);
                    }
                } catch (err) {
                    apex.server.process(
                        "UPDATE_DETAIL_ERROR", {
                        x01: pog_details.SeqNo,
                        x02: pog_details.POGCode,
                        x03: pog_details.POGVersion,
                        x04: err
                    }, {
                        dataType: "text",
                        success: function (pData) {
                            g_req_count++;
                            if ($.trim(pData) != "") {
                                raise_error(pData);
                            }
                        }
                    });
                }

            }

            var p_Req_Complete = setInterval(function () {
                if (g_req_count == l_pog_details.length) {
                    apex.item('P54_REFRESH_TIMER').setValue(0);
                    $('[data-action= "refresh_timer"]').hide();
                    $('[data-action= "btn_download_pog_pdf"]').show();
                    $('[data-action= "btn_download_pog_zip"]').show();
                    $('[data-action= "btn_download_pog_concat"]').show();
                    $('[data-action= "btn_select_pog"]').show();
                    if (apex.item('P54_RUN_MODE').getValue() == 'B') {
                        $('[data-action= "batch_print_pog"]').show();
                    }
                    apex.message.showPageSuccess(get_message('ALL_REQ_SUBMIT'));
                    apex.region("pdf_batch_details").refresh();
                    clearInterval(p_Req_Complete);
                }
            }, 200);

        } catch (err) {
            error_handling(err);
            apex.item('P54_REFRESH_TIMER').setValue(0);
            if (typeof p_Req_Complete != 'undefined') {
                clearInterval(p_Req_Complete);
            }
            throw err;
        }
    }

    async function set_pegid(p_pogjson, p_pog_index) {
        var i = 0;
        var item_dtl;
        var min_top;
        var min_top_arr = [];
        var least_top;
        var minrange;
        var maxrange;

        for (var module of p_pogjson[p_pog_index].ModuleInfo) {

            var j = 0;
            for (var shelf of module.ShelfInfo) {
                if (shelf.ObjType == "PEGBOARD") {
                    item_dtl = shelf.ItemInfo;

                    for (z = 1; z <= 10; z++) {
                        var l = 0;
                        min_top_arr = [];
                        var index_arr = [];
                        var shelf_top = shelf.Y + shelf.H / 2;
                        for (var item_info of item_dtl) {
                            if (typeof item_info.NewPegId == "undefined" || item_info.NewPegId == '') {
                                min_top = parseFloat(item_info.Y + item_info.H / 2).toFixed(4);
                                min_top_arr.push(parseFloat(shelf_top - min_top).toFixed(4));
                                index_arr.push(l);

                            }
                            l++;
                        }
                        var min_distance = Math.min.apply(Math, min_top_arr);
                        var index = min_top_arr.findIndex(function (number) {
                            return number == min_distance;
                        });
                        if (index !== -1) {
                            var least_item = p_pogjson[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[index_arr[index]];
                            var least_top = least_item.Y + (least_item.H / 2);
                            var minrange = least_top - g_minvalue;
                            var maxrange = least_top + g_minvalue;
                            //  }
                            var l = 0;
                            for (var item_info of item_dtl) {
                                if (typeof item_info.NewPegId == "undefined" || item_info.NewPegId == "") {
                                    var item_top = item_info.Y + (item_info.H / 2);
                                    if (item_top <= maxrange && item_top >= minrange) {
                                        item_info.NewPegId = z;
                                    }
                                }
                                l++;
                            }
                        }
                    }
                }
                j++;
            }
            i++;
        }

    }
// async function create_item_compare(p_pog_Code, p_pog_version) { //ASA-1531 issue 21
//     var p = apex.server.process(
//             "CREATE_COMPARE_ITEM_COLL", {
//             x01: p_pog_Code,
//             x02: p_pog_version,
//         }, {
//             dataType: "html",
//         });
// }
