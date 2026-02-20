g_show_error = true;
g_pog_json = [];
g_mod_block_list = [];
g_pog_edited_ind = 'Y';
g_auto_fill_active = 'N';
g_autofillModInfo = [];
g_autofillShelfInfo = [];
g_autofill_detail = {};
g_allUndoObjectsInfo = [];
g_deletedItems = [];
g_delete_details = [];
g_ComViewIndex = -1;
g_show_changes_block_snapshot = [];  //ASA-1986 
g_show_live_image = "N";
 //ASA-1986 start
function wpdBuildShowChangesBlockSnapshot(p_block_list) {
    var snapshot = [];
    if (!Array.isArray(p_block_list)) {
        return snapshot;
    }
    for (const blk of p_block_list) {
        if (typeof blk === "undefined" || blk == null) {
            continue;
        }
        var dragStartX = blk.DragMouseStart && typeof blk.DragMouseStart.x !== "undefined" ? Number(blk.DragMouseStart.x) : 0;
        var dragStartY = blk.DragMouseStart && typeof blk.DragMouseStart.y !== "undefined" ? Number(blk.DragMouseStart.y) : 0;
        var dragEndX = blk.DragMouseEnd && typeof blk.DragMouseEnd.x !== "undefined" ? Number(blk.DragMouseEnd.x) : 0;
        var dragEndY = blk.DragMouseEnd && typeof blk.DragMouseEnd.y !== "undefined" ? Number(blk.DragMouseEnd.y) : 0;
        var blkSnapshot = {};
        blkSnapshot["BlkName"] = blk.BlkName;
        blkSnapshot["BlkColor"] = blk.BlkColor;
        blkSnapshot["BlkRule"] = blk.BlkRule;
        blkSnapshot["DragMouseStart"] = { x: dragStartX, y: dragStartY };
        blkSnapshot["DragMouseEnd"] = { x: dragEndX, y: dragEndY };
        blkSnapshot["BlkModInfo"] = Array.isArray(blk.BlkModInfo) ? JSON.parse(JSON.stringify(blk.BlkModInfo)) : [];
        blkSnapshot["BlkShelfInfo"] = Array.isArray(blk.BlkShelfInfo) ? JSON.parse(JSON.stringify(blk.BlkShelfInfo)) : [];
        blkSnapshot["mod_index"] = Array.isArray(blk.mod_index) ? JSON.parse(JSON.stringify(blk.mod_index)) : [];
        snapshot.push(blkSnapshot);
    }
    return snapshot;
}
 //ASA-1986  end
function wpdCaptureShowChangesBlockSnapshot(p_block_list, p_force = "N") {
    if (p_force == "Y" || !Array.isArray(g_show_changes_block_snapshot) || g_show_changes_block_snapshot.length === 0) {
        g_show_changes_block_snapshot = wpdBuildShowChangesBlockSnapshot(p_block_list);
    }
}
//This function is called from page 25 execute on page load.
function initiate_values_onload() {
    sessionStorage.setItem("g_dbuDebugEnabled", $v("P193_POGC_JS_DEBUG_ENABLE"));
    logDebug("onload code ; ", "S");

    if (!document.getElementById("ig_mod_details")) {
        var igDiv = document.createElement("div");
        igDiv.id = "ig_mod_details";
        igDiv.style.paddingLeft = "0px";
        igDiv.style.display = "none"; // keep hidden by default
        document.body.appendChild(igDiv);
    }

    // If a POG JSON was passed via sessionStorage (from other pages), load it here so the
    // page will render even when opened directly after another page.
    try {
        var POG_DATA = LZString.decompress(sessionStorage.getItem("POGJSON"));
        if (POG_DATA !== null && POG_DATA !== "") {
            try {
                g_pog_json = JSON.parse(POG_DATA);
            } catch (err) {
                console.log("Failed to parse POGJSON for page 193:", err);
            }
            // sessionStorage.removeItem("POGJSON");
        }
    } catch (err) {
        console.log("Error while loading POGJSON from sessionStorage:", err);
    }
    //g_trs is a global variable which will hold all the row element of product list. this is used to do multi select using shift key when select item to drag into POG.
    if (document.getElementById("draggable_table") !== null) {
        g_trs = document.getElementById("draggable_table").getElementsByTagName("tr");
    }
    //this is binding the drag events which will link with product list to canvas. this will allow track items dragging from product list to any canvas.
    $("#canvas-holder")
        .bind("dragenter dragover", false)
        .bind("drop", function (event) {
            console.log("drop bind");
        });
    var l_delete_ind = $v("P193_DELETE_IND");//pushed this variable inside as its used only in this function.
    back_clicked = "N";
    const input = document.getElementById("P193_UPLOAD_HIDDEN");



    var facingskey = null;
    var noOfFacings = 0;
    var num_key_no = 0;
    var numpad_key = false;
    //below events keydown and keyup are using to identify any keyboard events and no of short cut keys logic handling.
    $(document).keydown(function (e) {
        if (g_delete_details.length > 0) {
            new_details = JSON.parse(JSON.stringify(g_delete_details));

            for (const objects of new_details) {
                objects.ShelfInfo = "";
            }
        } else {
            new_details = [];
        }
        //Alt + F = open find popup which will search any item or fixel and add blink to that particular object.
        if (e.altKey && e.keyCode == 70) {
            e.preventDefault();
            openInlineDialog("find", 35, 45);
        }
        //Ctrl + i - open update item info popup
        if (e.keyCode == 73 && e.ctrlKey == true && typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            open_update_item_info();
        }

        var map = {};
        var down_map = {};
        var lastKeyPress = e.keyCode;
        onkeydown = onkeyup = function (e) {
            map[e.keyCode] = e.type == "keyup";
            if (e.type == "keydown") {
                console.log('keydown ', e.keyCode, e);
            }
            if (e.type == "keyup" && e.keyCode == 67) {
                console.log('key up 67 up');
            }
            //holding Key C and then try to move the chest. then only the chest should move. else we should create a multi select area.
            if (e.type == "keydown" && e.keyCode == 67) { //ASA-1300
                g_chest_move = "Y";
            } else {
                g_chest_move = "N";
            }
            //ASA-1422
            //if shift is pressed and click on any item. we consider it as multi select of items. else old selection will be removed and new selection will be added.
            if (e.type == "keydown" && e.shiftKey) {
                g_shift_mutli_item_select = 'Y';
            } else {
                g_shift_mutli_item_select = 'N';
                g_shift_multi_item_first = {};
                g_shift_multi_item_last = {};
            }
            //below logic is used to identify which no user has clicked. this includes both numbers on top of characters in keyboard or number pad in the keyboard.
            //we use this in Shift + V,H + 1-9 -- Which will increase or decrease facings using key board.
            if (e.type == "keydown" && e.code !== "ShiftLeft" && (e.code == "Numpad1" || e.code == "Numpad2" || e.code == "Numpad3" || e.code == "Numpad4" || e.code == "Numpad5" || e.code == "Numpad6" || e.code == "Numpad7" || e.code == "Numpad8" || e.code == "Numpad9")) {
                console.log("e.code", e.code);
                numpad_key = true;
                switch (e.code) {
                    case "Numpad1":
                        num_key_no = 1;
                        break;
                    case "Numpad2":
                        num_key_no = 2;
                        break;
                    case "Numpad3":
                        num_key_no = 3;
                        break;
                    case "Numpad4":
                        num_key_no = 4;
                        break;
                    case "Numpad5":
                        num_key_no = 5;
                        break;
                    case "Numpad6":
                        num_key_no = 6;
                        break;
                    case "Numpad7":
                        num_key_no = 7;
                        break;
                    case "Numpad8":
                        num_key_no = 8;
                        break;
                    case "Numpad9":
                        num_key_no = 9;
                        break;
                }
            }

            if (e.type == "keyup" && g_pog_index !== g_ComViewIndex) {
                //if user is clicking numbers on top of characters or from number pad. we call facings change function.
                //Shift + H - facingskey = "horizfacing"
                //Shift + V - facingskey = "vertfacing"
                //Shift + D - facingskey = "depthfacing";
                if (map[16] == true && map[72] == true && (map[49] == true || map[50] == true || map[51] == true || map[52] == true || map[53] == true || map[54] == true || map[55] == true || map[56] == true || map[57] == true || numpad_key)) {
                    //ASA -1105
                    facingskey = "horizfacing";
                    console.log("map", map, e.type, e.keyCode, lastKeyPress, String.fromCharCode(lastKeyPress));
                    if (lastKeyPress >= 49 && lastKeyPress <= 57) {
                        incrementFacingsFromKey(facingskey, String.fromCharCode(lastKeyPress));
                    } else {
                        incrementFacingsFromKey(facingskey, num_key_no); //ASA -1105
                    }
                    map = {};
                    facingskey = null;
                    lastKeyPress = null;
                    num_key_no = 0;
                    numpad_key = false;
                } else if (map[16] == true && map[86] == true && (map[49] == true || map[50] == true || map[51] == true || map[52] == true || map[53] == true || map[54] == true || map[55] == true || map[56] == true || map[57] == true || numpad_key)) {
                    //ASA -1105
                    facingskey = "vertfacing";
                    console.log("map", map, e.type, e.keyCode, lastKeyPress, String.fromCharCode(lastKeyPress));
                    if (lastKeyPress >= 49 && lastKeyPress <= 57) {
                        incrementFacingsFromKey(facingskey, String.fromCharCode(lastKeyPress));
                    } else {
                        incrementFacingsFromKey(facingskey, num_key_no); //ASA -1105
                    }
                    map = {};
                    facingskey = null;
                    num_key_no = 0;
                    numpad_key = false;
                } else if (map[16] == true && map[68] == true && (map[49] == true || map[50] == true || map[51] == true || map[52] == true || map[53] == true || map[54] == true || map[55] == true || map[56] == true || map[57] == true || numpad_key)) {
                    //ASA -1105
                    facingskey = "depthfacing";
                    if (lastKeyPress >= 49 && lastKeyPress <= 57) {
                        incrementFacingsFromKey(facingskey, String.fromCharCode(lastKeyPress));
                    } else {
                        incrementFacingsFromKey(facingskey, num_key_no); //ASA -1105
                    }
                    map = {};
                    facingskey = null;
                    num_key_no = 0;
                    numpad_key = false;
                } else {
                    facingskey = null;
                }
            }
        };
        //Ctrl + Arrow up / down / left / right considered as moving shelf using keyboard. 
        if (e.shiftKey && (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37 || e.keyCode == 39) && g_pog_index !== g_ComViewIndex) {
            if (e.keyCode == 38) {
                drag_fixel(g_module_index, g_shelf_index, g_item_index, "U", g_pog_index);
            } else if (e.keyCode == 40) {
                drag_fixel(g_module_index, g_shelf_index, g_item_index, "D", g_pog_index);
            } else if (e.keyCode == 37) {
                drag_fixel(g_module_index, g_shelf_index, g_item_index, "L", g_pog_index);
            } else if (e.keyCode == 39) {
                drag_fixel(g_module_index, g_shelf_index, g_item_index, "R", g_pog_index);
            }
            //to stop going into other if clause when facings function is called.
        } else if (facingskey !== null && (facingskey == "horizfacing" || facingskey == "vertfacing")) {
            console.log("incrment facings ", facingskey, noOfFacings);
            //if facings is not updated then check other short cuts.
        } else if (facingskey == null) {
            if ((g_pog_index == g_ComViewIndex && ((g_compare_view == "EDIT_PALLET" && e.keyCode !== 46) || (g_compare_view == "PREV_VERSION" && e.keyCode == 67 && e.ctrlKey == true && g_edit_ind == "Y"))) || g_pog_index !== g_ComViewIndex) {
                if ((g_multiselect == "N" || (e.keyCode == 38 && e.ctrlKey == true) || (e.keyCode == 40 && e.ctrlKey == true)) && (g_taskItemInContext1 || g_taskItemInContext || (e.keyCode == 38 && e.ctrlKey == true) || (e.keyCode == 40 && e.ctrlKey == true)) && g_dblclick_opened == "N" && ((e.keyCode == 67 && e.ctrlKey == true) || e.keyCode == 46 || (e.keyCode == 86 && e.ctrlKey == true) || (e.keyCode == 88 && e.ctrlKey == true) || (e.keyCode == 69 && e.ctrlKey == true) || (e.keyCode == 81 && e.ctrlKey == true) || (e.keyCode == 76 && e.ctrlKey == true) || (e.keyCode == 90 && e.ctrlKey == true) || (e.keyCode == 38 && e.ctrlKey == true) || (e.keyCode == 40 && e.ctrlKey == true))) {
                    if ((e.keyCode == 69 && e.ctrlKey == true) /*ctrl + E*/ || (e.keyCode == 76 && e.ctrlKey == true) /*ctrl + L*/) {
                        e.preventDefault();
                    }
                    if (e.keyCode == 69 && e.ctrlKey == true && typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_edit_ind == "Y" && (g_item_edit_flag == "Y" || g_module_edit_flag == "Y" || g_carpark_edit_flag == "Y")) {
                        //ctrl + E item edit
                        context_edit();
                    }
                    if (e.keyCode == 81 && e.ctrlKey == true && typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_edit_ind == "Y" && g_shelf_edit_flag == "Y") {
                        //ctrl + Q shelf edit
                        context_edit();
                    }
                    if (e.keyCode == 38 && e.ctrlKey == true && typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                        // Ctrl + Arrow Up = zoom in
                        $("#maincanvas").css("cursor", "zoom-in");
                        g_camera.position.set(g_camera.position.x, g_camera.position.y, g_camera.position.z - parseFloat($v("P193_POGCR_CAMERA_ZOOM_FACTOR")));
                        g_manual_zoom_ind = "Y";
                        render(g_pog_index);
                    } else if (e.keyCode == 40 && e.ctrlKey == true && typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                        //Ctrl + Arrow down = zoom out
                        $("#maincanvas").css("cursor", "zoom-out");
                        g_camera.position.set(g_camera.position.x, g_camera.position.y, g_camera.position.z + parseFloat($v("P193_POGCR_CAMERA_ZOOM_FACTOR")));
                        g_manual_zoom_ind = "Y";
                        render(g_pog_index);
                    }
                    if (g_module_edit_flag == "Y" || g_shelf_edit_flag == "Y" || g_item_edit_flag == "Y") {
                        if (e.keyCode == 46 && l_delete_ind == "Y") {
                            //Delete button
                            g_keyCode = 46;
                            context_delete("DELETE", g_module_index, g_shelf_index, g_item_index, g_item_edit_flag, g_module_edit_flag, g_shelf_edit_flag, g_objectHit_id, "", g_delete_details, g_camera, g_pog_index, "N");
                            g_item_edit_flag = "N";
                            g_module_edit_flag = "N";
                            g_shelf_edit_flag = "N";
                            g_delete_details = [];
                            g_multi_drag_shelf_arr = [];
                            g_multi_drag_item_arr = [];
                            // context_delete('DELETE');
                        } else if (e.keyCode == 67 && e.ctrlKey == true && g_edit_ind == "Y") {
                            //ctrl + C
                            g_keyCode = 67;
                            //console.log('this is coppieng');
                            context_copy("S", g_pog_index);
                        } else if (e.keyCode == 86 && e.ctrlKey == true && (g_cut_action_done == "Y" || g_copy_action_done == "Y" || g_multi_copy_done == "Y") && g_edit_ind == "Y") {
                            //ctrl + V
                            //console.log('paste action done');
                            g_keyCode = 86;
                            var action;
                            if (g_cut_action_done == "Y") {
                                action = "CUT";
                            } else if (g_copy_action_done == "Y") {
                                action = "COPY";
                            }
                            if (g_cut_action_done == "Y" || g_copy_action_done == "Y" || g_multi_copy_done == "Y") {
                                context_paste(action, g_camera, "N", "Y", g_pog_index);
                            }
                        } else if (e.keyCode == 88 && e.ctrlKey == true && g_edit_ind == "Y") {
                            //ctrl + X
                            g_keyCode = 88;
                            context_cut(g_pog_index);
                        } else if (e.keyCode == 76 && e.ctrlKey == true && (g_shelf_edit_flag == "Y" || (g_item_edit_flag == "Y" && g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item == "DIVIDER")) && g_edit_ind == "Y") {
                            //ctrl + L
                            g_keyCode = 76;
                            context_duplicate();
                        } else if (e.keyCode == 90 && e.ctrlKey == true && (g_cut_action_done == "Y" || g_delete_action_done == "Y" || g_multi_delete_done == "Y") && g_edit_ind == "Y") {
                            //Ctrl + Z
                            if (g_undo_final_obj_arr.length - 1 >= 0) {
                                g_keyCode = 90;
                                undo_actions_not_delete("UNDO", g_camera, g_pog_index); //new undo code
                            }
                        } else if (e.keyCode == 90 && e.ctrlKey == true && g_cut_action_done == "N" && g_delete_action_done == "N" && g_multi_delete_done == "N") {
                            if (g_undo_final_obj_arr.length - 1 >= 0) {
                                g_keyCode = 90;
                                undo_actions_not_delete("UNDO", g_camera, g_pog_index); //new undo code
                            }
                        }
                    } else if (e.keyCode == 90 && e.ctrlKey == true && (g_cut_action_done == "Y" || g_delete_action_done == "Y" || g_multi_delete_done == "Y")) {
                        if (g_undo_final_obj_arr.length - 1 >= 0) {
                            g_keyCode = 90;
                            undo_actions_not_delete("UNDO", g_camera, g_pog_index);
                        }
                    } else if (e.keyCode == 90 && e.ctrlKey == true && g_cut_action_done == "N" && g_delete_action_done == "N" && g_multi_delete_done == "N") {
                        if (g_undo_final_obj_arr.length - 1 >= 0) {
                            g_keyCode = 90;
                            undo_actions_not_delete("UNDO", g_camera, g_pog_index);
                        }
                    }
                } else if (g_multiselect == "Y" && JsonContains(new_details, "Object", "SHELF") && JsonContains(new_details, "ObjType", "SHELF") && JsonContains(new_details, "Object", "ITEM") && e.keyCode == 81 && e.ctrlKey == true && typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_edit_ind == "Y") {
                    //Ctrl + Q - shelf multi edit.
                    e.preventDefault();
                    context_multi_edit("F");
                    g_mselect_drag = "Y";
                } else if (g_multiselect == "Y" && JsonContains(new_details, "Object", "ITEM") && e.keyCode == 69 && e.ctrlKey == true && typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_edit_ind == "Y") {
                    //ctrl + E - item multi edit.
                    e.preventDefault();
                    context_multi_edit("P");
                    g_mselect_drag = "Y";
                } else if (g_multiselect == "Y" && e.keyCode == 46 && l_delete_ind == "Y") {
                    //Delete button yograj
                    //Delete button with multi select objects.
                    context_delete("DELETE", g_module_index, g_shelf_index, g_item_index, g_item_edit_flag, g_module_edit_flag, g_shelf_edit_flag, g_objectHit_id, "", g_delete_details, g_camera, g_pog_index, g_productselect);

                    g_item_edit_flag = "N";
                    g_module_edit_flag = "N";
                    g_shelf_edit_flag = "N";
                    g_keyCode = 46;
                } else if (g_multiselect == "Y" && e.keyCode == 67 && e.ctrlKey == true) {
                    //Multi select Copy - ctrl + C after multi select objects.
                    context_copy("M", g_pog_index);
                    g_keyCode = 67;
                } else if (e.keyCode == 89) {
                    //ctrl + y -- redo
                    if (g_redo_final_obj_arr.length - 1 >= 0) {
                        g_keyCode = 89;
                        undo_actions_not_delete("REDO", g_camera, g_pog_index);
                    }
                } else if (e.keyCode == 90 && e.ctrlKey == true && (g_cut_action_done == "Y" || g_delete_action_done == "Y" || g_multi_delete_done == "Y")) {
                    if (g_undo_final_obj_arr.length - 1 >= 0) {//undo 
                        g_keyCode = 90;
                        undo_actions_not_delete("UNDO", g_camera, g_pog_index);
                    }
                } else if (e.keyCode == 90 && e.ctrlKey == true && g_cut_action_done == "N" && g_delete_action_done == "N" && g_multi_delete_done == "N") {
                    if (g_undo_final_obj_arr.length - 1 >= 0) {//undo
                        g_keyCode = 90;
                        undo_actions_not_delete("UNDO", g_camera, g_pog_index);
                    }
                }
            }
        }
    });
    //This is an event which will fire just before page is going to reload for any reason. So that we can store all the necessary values from variables into 
    //session state and then after reload we can set them back. so all the  settings user did will still remain.
    window.onbeforeunload = function (event) {
        if (g_pog_json.length > 0 && typeof g_pog_json !== "undefined" && back_clicked == "N") {
            sessionStorage.setItem("POGJSON", LZString.compress(JSON.stringify(g_pog_json)));
            sessionStorage.setItem("g_color_arr", LZString.compress(JSON.stringify(g_color_arr)));
            sessionStorage.setItem("g_highlightArr", LZString.compress(JSON.stringify(g_highlightArr)));
            try {
                sessionStorage.setItem("g_ItemImages", JSON.stringify(g_ItemImages));
                sessionStorage.setItem("IndexedDB_ind", "N");
            } catch {
                add_img_indexeddb(g_ItemImages);
                sessionStorage.setItem("IndexedDB_ind", "Y");
            }
            if (typeof g_scene_objects_backup !== "undefined" && g_scene_objects_backup.length > 0) {
                sessionStorage.setItem("scene_objects_backup", LZString.compress(JSON.stringify(g_scene_objects_backup)));
                sessionStorage.setItem("pogjson_backup", LZString.compress(JSON.stringify(g_pogjson_backup)));
            }
            sessionStorage.setItem("g_show_live_image", g_show_live_image);
            sessionStorage.setItem("g_show_live_image_comp", g_show_live_image_comp);
            sessionStorage.setItem("g_show_notch_label", g_show_notch_label);
            sessionStorage.setItem("g_show_fixel_label", g_show_fixel_label);
            sessionStorage.setItem("g_show_notch_label_comp", g_show_notch_label_comp);
            sessionStorage.setItem("g_show_fixel_label_comp", 'N');
            sessionStorage.setItem("g_show_item_label", g_show_item_label);
            sessionStorage.setItem("g_itemSubLabelInd", g_itemSubLabelInd); //ASA-1182
            sessionStorage.setItem("g_itemSubLabel", g_itemSubLabel); //ASA-1182
            sessionStorage.setItem("g_show_item_desc", g_show_item_desc);
            sessionStorage.setItem("g_show_max_merch", g_show_max_merch);
            sessionStorage.setItem("g_show_item_color", g_show_item_color);
            sessionStorage.setItem("g_show_fixel_space", g_show_fixel_space);
            sessionStorage.setItem("g_max_facing_enabled", g_max_facing_enabled);
            sessionStorage.setItem("g_show_days_of_supply", g_show_days_of_supply);
            sessionStorage.setItem("g_show_days_of_supply_comp", 'N');
            sessionStorage.setItem("g_ComViewIndex", g_ComViewIndex);
            sessionStorage.setItem("g_ComBaseIndex", g_ComBaseIndex);
            sessionStorage.setItem("g_compare_view", g_compare_view);
            sessionStorage.setItem("g_compare_pog_flag", g_compare_pog_flag);
            sessionStorage.setItem("g_edit_pallet_mod_ind", g_edit_pallet_mod_ind);
            sessionStorage.setItem("g_edit_pallet_shelf_ind", g_edit_pallet_shelf_ind);
            sessionStorage.setItem("g_overhung_shelf_active", g_overhung_shelf_active); //ASA-1138
            //ASA-1129, Start
            sessionStorage.setItem("g_combinedShelfs", JSON.stringify(g_combinedShelfs));
            sessionSetCombineDetails();
            //ASA-1129, Start
            sessionStorage.setItem("P193_EXISTING_DRAFT_VER", $v("P193_EXISTING_DRAFT_VER"));
            sessionStorage.setItem("P193_DRAFT_LIST", $v("P193_DRAFT_LIST"));
            sessionStorage.setItem("P193_POG_DESCRIPTION", $v("P193_POG_DESCRIPTION"));
            sessionStorage.setItem("P193_SELECT_COLOR_TYPE", $v("P193_SELECT_COLOR_TYPE"));
            sessionStorage.setItem("gPogIndex", g_pog_index);
        } else {
            sessionStorage.removeItem("POGJSON");
            sessionStorage.removeItem("g_ItemImages");
            sessionStorage.removeItem("g_show_live_image");
            sessionStorage.removeItem("g_show_notch_label");
            sessionStorage.removeItem("g_show_fixel_label");
            sessionStorage.removeItem("g_show_item_label");
            sessionStorage.removeItem("g_itemSubLabelInd"); //ASA-1182
            sessionStorage.removeItem("g_itemSubLabel"); //ASA-1182
            sessionStorage.removeItem("g_show_item_desc");
            sessionStorage.removeItem("g_show_fixel_space");
            sessionStorage.removeItem("g_show_max_merch");
            sessionStorage.removeItem("g_ItemImages");
            sessionStorage.removeItem("g_show_item_color");
            sessionStorage.removeItem("g_max_facing_enabled");
            sessionStorage.removeItem("gPogIndex");
            sessionStorage.removeItem("scene_objects_backup");
            sessionStorage.removeItem("pogjson_backup");
            sessionStorage.removeItem("g_overhung_shelf_active");
        }
    };
    //This even is needed when user clicks escape button. we need to reset all variables to normal so that the action user was doing should be stopped and reset.
    $(document).keyup(function (e) {
        if (e.key === "Escape") {
            // escape key maps to keycode `27`
            //g_dblclick_opened indicates if user have opened edit popup.
            g_dblclick_opened = "N";
            //if auto fill popup was open close it and reset the collection.
            if (g_auto_fill_active == "Y" && g_auto_fill_reg_open == "N") {
                if (g_autofill_edit == "N") {
                    update_module_block_list("U", $v("P193_EDIT_BLK"), "Y");
                }
                apex.theme.openRegion("auto_fill_reg");
                g_auto_fill_reg_open = "Y";
            } else if (g_auto_fill_active == "Y" && g_auto_fill_reg_open == "Y") {
                clear_auto_fill_coll();
            }
            $s("P193_MODULE_EDIT_IND", "N");
            $s("P193_SHELF_EDIT_IND", "N");
            $s("P193_POG_EDIT_IND", "N");
            $s("P193_ITEM_EDIT_IND", "N");
            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_module_index !== "" && g_module_index !== -1 && g_shelf_index !== "" && g_shelf_index !== -1) {
                if (g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].TextImg == "") {
                    g_temp_image_arr = [];
                    $s("P193_IMG_FILENAME", "");
                    $("#IMAGE_AREA canvas").remove();
                    $("#VIEW_IMAGE canvas").remove();
                }
            } else {
                g_temp_image_arr = [];
                $s("P193_IMG_FILENAME", "");
                $("#IMAGE_AREA canvas").remove();
                $("#VIEW_IMAGE canvas").remove();
            }
            g_world.remove(g_targetForDragging);
            render(g_pog_index);
        } else if (e.key == "Control") {
            $("#maincanvas").css("cursor", "auto");
            $("#maincanvas1").css("cursor", "auto");
        }
    });
    $(".custom_disable").prop("disabled", function (i, oldVal) {
        return !oldVal;
    });
    if ("&AI_EDIT_IND." == "N" && "&AI_DELETE_IND." == "N") {
        $(".save_draft, .save_pog, .save_template").hide();
    }
    $("#P193_DRAFT_LIST").removeClass("apex_disabled");


    //This is the X button on right side corner of the popup. when user click that to close also we need to reset all variables and revert the action user performed.
    $("button.ui-dialog-titlebar-close").on("click", function (event) {
        g_dblclick_opened = "N";
        $s("P193_UPLOAD_HIDDEN", "");
        $s("P193_SHELF_EDIT_IND", "N");
        console.log('$s("P193_SHELF_EDIT_IND"', $v("P193_SHELF_EDIT_IND"));
        g_multiselect = "N"; //ASA-1244
        g_mselect_drag = "N"; //ASA-1244
        g_ctrl_select = "N";
        g_productselect = "N";
        if (g_module_index !== "" && g_module_index !== -1 && g_shelf_index !== "" && g_shelf_index !== -1) {
            if (typeof g_pog_json !== "undefined") {
                if (g_pog_json[g_pog_index].length > 0) {
                    if (new_pogjson[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].TextImg == "") {
                        g_temp_image_arr = [];
                        $s("P193_IMG_FILENAME", "");
                        $("#IMAGE_AREA canvas").remove();
                        $("#VIEW_IMAGE canvas").remove();
                    }
                }
            }
        } else {
            g_temp_image_arr = [];
            $s("P193_IMG_FILENAME", "");
            $("#IMAGE_AREA canvas").remove();
            $("#VIEW_IMAGE canvas").remove();
        }
    });
    //below code is to remove the green success message in 3 secs.
    var opt = {
        autoDismiss: true,
        duration: 3000, // Optional. Default value is 3000
    };
    // this only applys configuration when base page has a process success message ready to display
    apex.theme42.configureSuccessMessages(opt);
    if (apex.theme42.configureSuccessMessages.options === undefined) {
        apex.theme42.configureSuccessMessages.options = opt;
    }

    //Marko code
    apex.message.setThemeHooks({
        beforeShow: function (pMsgType, pElement$) {
            if (pMsgType == "success") {
                setTimeout(function () {
                    $(".t-Alert").fadeOut("slow");
                }, 3000);
            }
        },
    });

    //Additional
    $(".t-Button--closeAlert").click(function () {
        $(".t-Alert").fadeOut("slow");
        //console.log('clicked');
    });
    $s("P193_DRAFT_LIST", sessionStorage.getItem("P193_DRAFT_LIST"));
    g_color_arr = sessionStorage.getItem("g_color_arr") !== null ? JSON.parse(LZString.decompress(sessionStorage.getItem("g_color_arr"))) : [];
    g_highlightArr = sessionStorage.getItem("g_highlightArr") !== null ? JSON.parse(LZString.decompress(sessionStorage.getItem("g_highlightArr"))) : [];
    $s("P193_POG_DESCRIPTION", sessionStorage.getItem("P193_POG_DESCRIPTION"));
    $s("P193_EXISTING_DRAFT_VER", sessionStorage.getItem("P193_EXISTING_DRAFT_VER"));
    $(".input-group").on("click", ".button-plus", function (e) {
        incrementValue(e);
    });
    $(".input-group").on("click", ".button-minus", function (e) {
        decrementValue(e);
    });
    $(".input-group1").on("click", ".button-plus", function (e) {
        incrementValue(e);
    });
    $(".input-group1").on("click", ".button-minus", function (e) {
        decrementValue(e);
    });
    $(".input-group2").on("click", ".button-plus", function (e) {
        incrementValue(e);
    });
    $(".input-group2").on("click", ".button-minus", function (e) {
        decrementValue(e);
    });

    //ASA-1640 Start
    // $(".input-group").on("keydown", ".quantity-field", function (e) {
    //     if (e.keyCode == 9) {
    //         incrementValue(e);
    //     }
    // });

    $("#item_facings div").on("keydown", ".quantity-field", function (e) {
        if (e.keyCode == 9) {
            var fieldName = $(e.target).attr('name');
            var currentVal = $(e.target).val();
            if (currentVal > 0) {
                incrementValue(e, fieldName, currentVal);
            }
        }
    });
    //ASA-1640 End

    //setting few global variables from page items.
    g_chest_as_pegboard = $v("P193_POGCR_CHEST_AS_PEGBOARD");
    g_nodataModuleName = $v("P193_POGCR_NO_DATA_MODULE_NAME");
    g_lr_overhung = $v("P193_POGCR_L_R_OVERHUNG");
    g_pogcr_pdf_chest_split = $v("P193_POGCR_PDF_CHEST_SPLIT");
    g_start_canvas = 0;
    g_show_fixel_space = $v("P193_POGCR_DFLT_FIXEL_AVLSPACE_LBL");
    g_show_days_of_supply = $v("P193_POGCR_DFT_DAYS_OF_SUPPLY");
    g_get_orient_images = $v("P193_POGCR_OTHER_ORIENTATION_IMG");
    g_drag_shelf_notch = $v("P193_POGCR_DRAG_SHELF_TO_NOTCH");
    g_hangbar_dft_maxmerch = parseFloat($v("P193_POGCR_HGNGBAR_DFLT_MAXMCH")) / 100;
    g_pegboard_dft_item_depth = parseFloat($v("P193_POGCR_DFT_PEGB_ITEM_DEPTH")) / 100; //ASA-1109
    g_pegbrd_auto_placing = $v("P193_POGCR_PEGBOARD_AUTO_PLACING");
    g_pog_index = 0;
    g_notch_label_position = $v("P193_POGCR_NOTCH_LABEL_POSITION").toUpperCase();
    g_overhung_validation = $v("P193_POGCR_OVERHUNG_VALIDTION");
    g_edit_ind = $v("P193_EDIT_IND");
    g_default_checkbox = $v("P193_POGCR_DIVIDER_PLACING_DFLT_CB");
    g_chest_move = "N", //ASA-1300
        g_auto_x_space = parseFloat($v("P193_POGCR_CHEST_ITEM_H_SPC")) / 100,
        g_auto_y_space = parseFloat($v("P193_POGCR_CHEST_ITEM_V_SPC")) / 100;
    g_multi_select_offset_perc = parseFloat($v('P193_POGCR_MULTI_SLCT_OFFSET_PERC')); //ASA-1422
    g_select_item_color_change = $v("P193_POGCR_BLINK_COLOR_CHANGE");
    g_textbox_threshold_value = parseFloat($v("P193_POGCR_THRESHOLD_TEXTBOX_VALUE")) / 100;//ASA-1487
    g_type_pog = sessionStorage.getItem("g_type_pog") !== null ? sessionStorage.getItem("g_type_pog") : "";//ASA-1507
    g_open_from = "";
    g_sublabel_type = $v("P193_POGCR_ITEM_ADDITIONAL_INFO");


    // if (sessionStorage.getItem("POGJSON") !== null) {
    //     (async function () {
    //         try {
    //             var TEMP_POG = JSON.parse(LZString.decompress(sessionStorage.getItem("POGJSON")));
    //             g_pog_json = TEMP_POG;
    //             if (TEMP_POG && TEMP_POG.length > 0) {
    //                 addLoadingIndicator();
    //                 appendMultiCanvasRowCol(TEMP_POG.length, $v("P193_POGCR_TILE_VIEW"));
    //                 g_pog_index = 0;
    //                 g_multi_pog_json = [];
    //                 g_scene_objects = [];
    //                 g_canvas_objects = [];
    //                 for (var p = 0; p < TEMP_POG.length; p++) {
    //                     g_pog_index = p;
    //                     init(p);
    //                     objects = {};
    //                     objects["scene"] = g_scene;
    //                     objects["renderer"] = g_renderer;
    //                     g_scene_objects.push(objects);
    //                     await create_module_from_json(TEMP_POG, sessionStorage.getItem("new_pog_ind"), "F", $v("P193_PRODUCT_BTN_CLICK"), sessionStorage.getItem("pog_opened"), "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
    //                     g_pog_index = p;
    //                     render(p);
    //                     animate_pog(p);
    //                 }
    //                 removeLoadingIndicator(regionloadWait);
    //                 g_pog_json = g_multi_pog_json;
    //                 if (sessionStorage.getItem("gPogIndex") !== null) {
    //                     var savedIndex = parseInt(sessionStorage.getItem("gPogIndex"));
    //                     g_pog_index = savedIndex;
    //                     set_select_canvas(savedIndex);
    //                 }
    //             }
    //         } catch (err) {
    //             error_handling(err);
    //         }
    //     })();
    // }

    if (sessionStorage.getItem("POGJSON") !== null) {
        if (window._pog_restore_in_progress) {
            console.warn("POG restore already in progress, skipping duplicate call");
        } else {
            window._pog_restore_in_progress = true;
            (async function () {
                try {
                    var TEMP_POG = JSON.parse(LZString.decompress(sessionStorage.getItem("POGJSON")));
                    // expose POG JSON globally early so deep functions can access it during init
                    g_pog_json = TEMP_POG;
                    if (TEMP_POG && TEMP_POG.length > 0) {
                        addLoadingIndicator();
                        appendMultiCanvasRowCol(TEMP_POG.length, $v("P193_POGCR_TILE_VIEW"));
                        g_pog_index = 0;
                        g_multi_pog_json = [];
                        g_scene_objects = [];
                        g_canvas_objects = [];
                        for (var p = 0; p < TEMP_POG.length; p++) {
                            g_pog_index = p;
                            try {
                                console.log('restore: TEMP_POG summary', p, {
                                    keys: Object.keys(TEMP_POG[p] || {}).slice(0, 20),
                                    hasModuleInfo: typeof TEMP_POG[p] !== 'undefined' && typeof TEMP_POG[p].ModuleInfo !== 'undefined',
                                    moduleInfoLen: TEMP_POG[p] && TEMP_POG[p].ModuleInfo ? TEMP_POG[p].ModuleInfo.length : 0
                                });
                            } catch (logErr) {
                                console.warn('restore: failed to log TEMP_POG for index', p, logErr);
                            }
                            init(p);
                            console.log("restore: after init", p, {
                                canvasId: g_canvas ? g_canvas.id : null,
                                canvasClientW: g_canvas ? g_canvas.clientWidth : null,
                                canvasClientH: g_canvas ? g_canvas.clientHeight : null,
                                hasRenderer: !!g_renderer,
                                rendererDom: g_renderer && g_renderer.domElement ? g_renderer.domElement.id || 'canvas' : null,
                                g_canvas_objects_len: g_canvas_objects.length,
                                g_scene_objects_len: g_scene_objects.length,
                                sceneChildren: g_scene ? g_scene.children.length : null,
                                worldChildren: g_world ? g_world.children.length : null
                            });
                            objects = {};
                            objects["scene"] = g_scene;
                            objects["renderer"] = g_renderer;
                            g_scene_objects.push(objects);
                            //  try {
                            //     set_select_canvas(p);
                            // } catch (selErr) {
                            //     console.warn('set_select_canvas failed during restore for index', p, selErr);
                            // }
                            await create_module_from_json(TEMP_POG, sessionStorage.getItem("new_pog_ind"), "F", $v("P193_PRODUCT_BTN_CLICK"), sessionStorage.getItem("pog_opened"), "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
                            console.log("restore: after create_module_from_json", p, {
                                g_multi_pog_json_len: Array.isArray(g_multi_pog_json) ? g_multi_pog_json.length : -1,
                                thisPogModuleInfoLen: g_multi_pog_json[p] && g_multi_pog_json[p].ModuleInfo ? g_multi_pog_json[p].ModuleInfo.length : null,
                                g_scene_children: g_scene ? g_scene.children.length : null,
                                g_world_children: g_world ? g_world.children.length : null
                            });
                            g_pog_index = p;
                            render(p);
                            animate_pog(p);
                        }
                        removeLoadingIndicator(regionloadWait);
                        // only overwrite global pog json if we actually built a multi-pog json
                        if (Array.isArray(g_multi_pog_json) && g_multi_pog_json.length > 0) {
                            g_pog_json = g_multi_pog_json;
                        } else {
                            console.warn('g_multi_pog_json is empty after restore; falling back to TEMP_POG');
                            g_pog_json = TEMP_POG;
                        }
                        if (sessionStorage.getItem("gPogIndex") !== null) {
                            var savedIndex = parseInt(sessionStorage.getItem("gPogIndex"));
                            g_pog_index = savedIndex;
                            set_select_canvas(savedIndex);
                            // ensure selected canvas is rendered after selection
                            render(savedIndex);
                            animate_pog(savedIndex);
                        }
                    }
                } catch (err) {
                    error_handling(err);
                } finally {
                    window._pog_restore_in_progress = false;
                }
            })();
        }
    }

    g_pogcr_live_new_item = $v('P193_POGCR_LIVE_NEW_ITEM');//ASA-1533 issue 1
    g_pogcr_dflt_fixel_num = $v('P193_POGCR_DFLT_FIXEL_NUM');
    g_default_max_merch = $v("P193_POGCR_DFT_MAX_MERCH");
    var renumb_field = g_pogcr_dflt_fixel_num.split(';');
    $s('P193_TEXTBOX_START_WITH', renumb_field[0]);
    $s('P193_DIVIDER_START_WITH', renumb_field[1]);
    document.documentElement.style.setProperty('--product_list_blink_color', g_select_item_color_change.replace('0x', '#'));     //ASA-1640
    g_product_list_blink = $v('P193_PRODUCT_LIST_BLINK');    //ASA-1640
    g_multi_cnvs_drag_conf = $v('P193_MULTI_CNVS_DRAG_CNFRM');    //ASA-1640
    g_item_stack_valid = $v("P193_POGCR_ITEM_STACK_VALID_YN");   //ASA-1652
    g_wf_pog_approval_enabled = $v('P193_WF_POG_APPROVAL_ENABLED');     //Regression 5 20250217
    g_pogcr_pog_approval_for_new_pog = $v('P193_POGCR_POG_APPROVAL_FOR_NEW_POG');  //Regression 5 20250217
    g_pogcr_enbl_oos_border = $v("P193_POGCR_ENBL_OOS_BORDER"); //ASA-1688
    g_pogcr_oos_border_color = $v("P193_POGCR_OOS_BORDER_COLOR"); //ASA-1688
    g_pogcr_enhance_textbox_fontsize = $v("P193_POGCR_ENHANCE_TEXTBOX_FONTSIZE"); // ASA-1787
    g_item_vertical_text_display = $v("P193_ITEM_CODE_VERT_ALN"); //ASA-1847 4.1
    g_item_text_center_align = $v("P193_ITEM_CODE_CTR_ALN"); //ASA-1847 4.1


    //this is a common function called from all the page where three asw_common_main is used. this will set global variables and can be used across all pages.
    //setParams($v("P193_POGCR_LABEL_TEXT_SIZE"), $v("P193_POGCR_STATUS_ERR_COLOR"), $v("P193_CAMERA_Z"), $v("P193_POGCR_TEXBOX_MERGE_PDF"), $v("P193_POGCR_HNGBAR_DFCNG_MAXMCH"), $v("P193_POGCR_AUTO_APLY_DEPTH_FAC"), $v("P193_POGCR_AUTO_APLY_VERT_FAC"), null, $v("P193_POGCR_ITEM_DIM_ERR_COLOR"), $v("P193_AUTO_HLITE_NON_MV_ITEM"), $v("P193_POGCR_NOIMAGE_SHOW_DESC"), $v('P193_POGCR_NOTCH_LABEL_POSITION'), $v("P193_POGCR_FIXEL_ITEM_LABEL"), $v("P193_POGCR_ITEM_DESC_VERTI"), parseFloat($v("P193_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload

    //below are the list of short cut keys assigned to many of the buttons created in WPD screens.
    apex.actions.add({
        name: "open-DPOG",
        label: "Open Draft POG",
        action: function (event, focusElement, data) {
            g_open_from = 'O';
            open_draft();
        },
        shortcut: "Alt+O,D",
    });

    apex.actions.add({
        name: "open-EPOG",
        label: "Open Existing POG",
        action: function (event, focusElement, data) {
            g_open_from = 'O';
            open_pog();
        },
        shortcut: "Alt+O,E",
    });

    apex.actions.add({
        name: "show-changes",
        label: "Show Changes",
        action: function (event, focusElement, data) {
            if (g_compare_pog_flag == "Y" && g_compare_view == "POG" && g_ComViewIndex > -1) {
                raise_error("POG already open.");
                return;
            }
            // g_open_from = 'O';
            g_show_live_image = 'N';
            g_show_live_image_1 = 'N';
            g_compare_pog_flag = 'Y';
            g_curr_canvas = 2;
            //  ASA-1986 start
            let l_currentPog = typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && typeof g_pog_json[g_pog_index] !== "undefined" ? g_pog_json[g_pog_index] : null;
            let l_pogCode = l_currentPog && l_currentPog.POGCode ? l_currentPog.POGCode : $v("P193_OPEN_POG_CODE");
            let l_pogVersion = l_currentPog && l_currentPog.Version ? l_currentPog.Version : $v("P193_OPEN_POG_VERSION");
            let l_compareInd = 1;
            let l_draftId = l_pogCode;
            if (($v("P193_OPEN_DRAFT") == "Y" || (l_currentPog && l_currentPog.Opened == "N")) && $v("P193_DRAFT_LIST") !== "") {
                l_compareInd = 2;
                l_draftId = $v("P193_DRAFT_LIST");
            }
            if (l_pogCode === "" || l_pogVersion === "") {
                raise_error("Please open a POG before Show Changes.");
                return;
            }
            comparePOG(l_compareInd, l_pogCode, l_pogVersion, l_draftId, "N", "Y", g_show_changes_block_snapshot); //ASA-1986 END
        },
        // shortcut: "Alt+O,E",
    });

    apex.actions.add({
        name: "view-analysis",
        label: "View Analysis",
        action: function () {
            open_view_analysis();
        },
    });

    apex.actions.add({
        name: "pog-save",
        label: "Save",
        action: function (event, focusElement, data) {
            g_open_from = 'O';
            save_af_version();
        },
    });

    //Below function will underline the character from the above shortcut in the button text on screen.
    // underlineMenuKey();

    //setting canvas height when page load.
    var header = document.getElementById("t_Header");
    var breadcrumb = document.getElementById("t_Body_title");
    var top_bar = document.getElementById("top_bar");
    var side_nav = document.getElementById("t_Body_nav");
    var button_cont = document.getElementById("side_bar");
    var devicePixelRatio = window.devicePixelRatio;
    g_start_pixel_ratio = devicePixelRatio;

    //logDebug("onload code ; ", "E");
}

// Moved to asw_common_functions.js
//this function is used under setUpMouseHander in asw_common_main.js. as this function is used only in page 25.
//this function will be called on mouse down. it will find out on which canvas user clicked and assing g_pog_index and all other indicators for the clicked POG canvas.
// function set_curr_canvas(p_event) {
//     var new_camera = {};
//     var new_world;
//     if (p_event.target.nodeName == "CANVAS") {
//         if (p_event.type !== "mousemove") {
//             g_canvas = p_event.target;
//             if (p_event.type == "mousedown") {
//                 g_all_pog_flag = "N";
//             }
//             g_pog_index = parseInt(g_canvas.getAttribute("data-indx"));
//             if (g_pog_index == null) {
//                 g_pog_index = 0;
//             }
//         } else {
//             var canvas_drag = p_event.target;
//         }

//         if (g_scene_objects.length > 0) {
//             if (typeof g_scene_objects[g_pog_index] !== "undefined") {
//                 g_scene = g_scene_objects[g_pog_index].scene;
//                 g_camera = g_scene.children[0];
//                 g_world = g_scene.children[2];
//                 g_renderer = g_scene_objects[g_pog_index].renderer;
//                 if (typeof g_pog_json[g_pog_index] !== "undefined" && g_all_pog_flag == "N") {
//                     $s("P193_OPEN_POG_CODE", g_pog_json[g_pog_index].POGCode);
//                     $s("P193_OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
//                 }

//                 if (typeof g_scene_objects[g_pog_index].Indicators !== "undefined") {
//                     g_show_fixel_label = g_scene_objects[g_pog_index].Indicators.FixelLabel;
//                     g_show_item_label = g_scene_objects[g_pog_index].Indicators.ItemLabel;
//                     g_show_notch_label = g_scene_objects[g_pog_index].Indicators.NotchLabel;
//                     g_show_max_merch = g_scene_objects[g_pog_index].Indicators.MaxMerch;
//                     g_show_item_color = g_scene_objects[g_pog_index].Indicators.ItemColor;
//                     g_show_item_desc = g_scene_objects[g_pog_index].Indicators.ItemDesc;
//                     g_show_live_image = g_scene_objects[g_pog_index].Indicators.LiveImage;
//                     g_show_days_of_supply = g_scene_objects[g_pog_index].Indicators.DaysOfSupply;
//                     g_overhung_shelf_active = g_scene_objects[g_pog_index].Indicators.OverhungShelf; //ASA-1138
//                     g_itemSubLabelInd = g_scene_objects[g_pog_index].Indicators.ItemSubLabelInd; //ASA-1182
//                     g_itemSubLabel = g_scene_objects[g_pog_index].Indicators.ItemSubLabel; //ASA-1182
//                 }

//                 if (p_event.type == "mousedown" || p_event.type == "contextmenu" || p_event.type == "dblclick") {
//                     var canvas_id = g_canvas.getAttribute("id");
//                     $("[data-pog]").removeClass("multiPogList_active");
//                     $(".canvas_highlight").removeClass("canvas_highlight");
//                     $("#" + canvas_id + "-btns").addClass("canvas_highlight");
//                     $("[data-indx=" + g_pog_index + "]").addClass("multiPogList_active");
//                     g_all_pog_flag = "N";
//                 }
//             }
//         }
//     }
// }

// Moved to asw_common_functions.js
//this function is used when minimize and maximize or close button when open more than one POG in same page. 
//This will set the opened POG details into global variables.
// function set_select_canvas(p_pog_index) {
//     if (g_scene_objects.length > 0) {
//         if (typeof g_scene_objects[p_pog_index] !== "undefined") {
//             g_scene = g_scene_objects[p_pog_index].scene;
//             g_camera = g_scene.children[0];
//             g_world = g_scene.children[2];
//             g_renderer = g_scene_objects[p_pog_index].renderer;
//             $s("P193_OPEN_POG_CODE", g_pog_json[p_pog_index].POGCode);
//             $s("P193_OPEN_POG_VERSION", g_pog_json[p_pog_index].Version);
//             if (typeof g_scene_objects[p_pog_index].Indicators !== "undefined") {
//                 g_show_fixel_label = g_scene_objects[p_pog_index].Indicators.FixelLabel;
//                 g_show_item_label = g_scene_objects[p_pog_index].Indicators.ItemLabel;
//                 g_show_notch_label = g_scene_objects[p_pog_index].Indicators.NotchLabel;
//                 g_show_max_merch = g_scene_objects[p_pog_index].Indicators.MaxMerch;
//                 g_show_item_color = g_scene_objects[p_pog_index].Indicators.ItemColor;
//                 g_show_item_desc = g_scene_objects[p_pog_index].Indicators.ItemDesc;
//                 g_show_live_image = g_scene_objects[p_pog_index].Indicators.LiveImage;
//                 g_show_days_of_supply = g_scene_objects[p_pog_index].Indicators.DaysOfSupply;
//                 g_overhung_shelf_active = g_scene_objects[p_pog_index].Indicators.OverhungShelf; //ASA-1138
//                 g_itemSubLabelInd = g_scene_objects[g_pog_index].Indicators.ItemSubLabelInd; //ASA-1182
//                 g_itemSubLabel = g_scene_objects[g_pog_index].Indicators.ItemSubLabel; //ASA-1182
//             }

//             if (typeof g_canvas_objects[p_pog_index] !== "undefined") {
//                 var canvas_id = g_canvas_objects[p_pog_index].getAttribute("id");
//                 $("[data-pog]").removeClass("multiPogList_active");
//                 $(".canvas_highlight").removeClass("canvas_highlight");
//                 $("#" + canvas_id + "-btns").addClass("canvas_highlight");
//                 $("[data-indx=" + p_pog_index + "]").addClass("multiPogList_active");
//                 g_all_pog_flag = "N";
//             }
//         }
//     }
// }

// Moved to asw_common_functions.js
// this function needs to be common
async function appendMultiCanvasRowCol(p_pog_count, p_type = $v("P193_POGCR_TILE_VIEW"), p_appendFlag = "N", p_compareWith) {
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
                    } catch (e) { }
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
                    } catch (e) { }
                    //ASA-1986  end
                }
            } else {
                var buttonHtml = "";
                if (p_pog_count > 1) {
                    buttonHtml = '<div class="canvas-buttons" id="maincanvas' + pogNo + '-btns" ><span class="fa fa-close canvas-close" onClick="closePog(' + pogCount + ')"></span></div>';
                }
                $("[data-row=" + i + "]").append('<div class="canvas-content" id="maincanvas' + pogNo + '-container" data-col="' + j + '" style="height:' + parseFloat((containerH / rowCount).toFixed(2)) + "px;width:" + parseFloat((containerW / currColCount).toFixed(2)) + 'px">' + buttonHtml + '<canvas class="canvasregion" data-canvas=true id="maincanvas' + pogNo + '" ></canvas></div>');
                //ASA-1986  START
                try {
                    var el = document.getElementById(canvasName);
                    if (el) {
                        el.setAttribute('data-indx', pogCount);
                        if (g_canvas_objects.indexOf(el) === -1) g_canvas_objects.push(el);
                    }
                } catch (e) { }
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

//This is called at the beginning of the creation of POG. it will create canvas, scene, camera and assign into its related arrays.
function init(p_canvasNo) {
    logDebug("function : init", "S");
    try {
        var canvasName = "maincanvas";
        p_canvasNo = parseInt(p_canvasNo);
        //based on the canvas no the element is been fetched.
        if (p_canvasNo > 0) {
            canvasName = "maincanvas" + (p_canvasNo + 1);
        }
        g_canvas = document.getElementById(canvasName);
        g_canvas.setAttribute("data-indx", p_canvasNo);

        //assign draggable event to the canvas. this will help for product list drag items to POG.
        $("#" + canvasName).droppable({
            tolerance: "pointer",//ASA-1766
            drop: function (event, ui) {
                create_action(ui.helper.children(), event);
                $("#draggable_table .a-GV-w-scroll tr.selected").removeClass("selected");
            },
        });
        g_canvas_region = document.getElementById("drawing_region");
        g_selection = document.getElementById("selection");
        // g_renderer = new THREE.WebGLRenderer({
        //     canvas: g_canvas,
        //     antialias: true
        // });

        //  g_renderer = new THREE.WebGLRenderer({
        //         antialias: true,
        //         preserveDrawingBuffer: true
        //     });
        //     try{
        //         // give the renderer canvas a deterministic id for debugging
        //         g_renderer.domElement.id = 'threeRenderer' + p_canvasNo;
        //         console.log('init: canvasName=', canvasName, 'g_canvas id=', g_canvas && g_canvas.id, 'renderer.domElement id=', g_renderer && g_renderer.domElement && g_renderer.domElement.id);
        //     }catch(e){}
        // try{
        //         console.log('init: canvasName=', canvasName, 'g_canvas id=', g_canvas && g_canvas.id, 'renderer.domElement id=', g_renderer && g_renderer.domElement && g_renderer.domElement.id);
        //     }catch(e){}

        //add canvas details into the canvas array
        //ASA-1986 canvas issue
        //  try{
        //     if (g_canvas_objects.indexOf(g_canvas) === -1) g_canvas_objects.push(g_canvas);
        // }catch(e){}



        // g_canvas_objects.push(g_canvas);
        //   if (g_canvas_objects.indexOf(g_canvas) === -1) {
        g_canvas_objects.push(g_canvas);
        // }

        //ASA-1986 end
        g_canvas.addEventListener("mousewheel", onDocumentMouseWheel, false);
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML = "<p><b>Sorry, an error occurred:<br>" + e + "</b></p>";
        return;
    }

    //This function will create scene and camera and push inside g_scene_objects array.
    createWorld();
    console.log("scene", g_scene.uuid, g_scene);

    //This is a feature from three js, through which we can identify which object is been clicked in mouse events.
    g_raycaster = new THREE.Raycaster();
    // render(0);
    g_multiselect = "N";
    g_ctrl_select = "N";
    var header = document.getElementById("t_Header");
    var breadcrumb = document.getElementById("t_Body_title");
    var top_bar = document.getElementById("top_bar");
    var side_nav = document.getElementById("t_Body_nav");
    var button_cont = document.getElementById("wpdSplitter_splitter_first");
    var wtbar = document.querySelector(".wtbar");
    var devicePixelRatio = window.devicePixelRatio;
    g_start_pixel_ratio = devicePixelRatio;
    var header_height = header.offsetHeight * devicePixelRatio;
    var breadcrumb_height = breadcrumb.offsetHeight * devicePixelRatio;
    var top_bar_height = top_bar.offsetHeight * devicePixelRatio;
    var wtbar_height = wtbar.offsetHeight * devicePixelRatio;

    var side_nav_width = side_nav.offsetWidth * devicePixelRatio;
    var btn_cont_width = button_cont.offsetWidth * devicePixelRatio;

    g_selection.style.visibility = "hidden";

    //set up mouse events and assign functions to be called on event firing.
    //  if (p_event_ind == "Y") {
    setUpMouseHander("maincanvas", doMouseDown, doMouseMove, doMouseUp, doMouseDoubleclick, g_canvas);
    //This function will create different div to keep different canvas in each boxes.
    // }
    // if (p_canvasNo > 0) {
    //     makeResizableDiv(canvasName); //ASA-1107
    // }

    g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);
    g_windowHeight = window.innerHeight - (header_height + top_bar_height + wtbar_height);
    windowWidth = window.innerWidth - (side_nav_width + btn_cont_width);

    g_initial_windowHeight = window.innerHeight - (header_height + top_bar_height + wtbar_height);


    var l_darwregionW = document.getElementById("drawing_region");
    var l_offsetwidth = l_darwregionW.offsetWidth * devicePixelRatio;
    // if (!parent) return {w:0,h:0};
    // requestAnimationFrame(() => {
    // const rect = parent.getBoundingClientRect();
    // const w = rect.width || parent.offsetWidth;
    // const h = rect.height || parent.offsetHeight;
    // // use w,h (or call your render/setup)
    // });

    var canvasContainerH = $("#" + canvasName).parent()[0].offsetHeight;
    var canvasContainerW = $("#" + canvasName).parent()[0].offsetWidth;
    console.log("canvasContainerH", canvasContainerH, "canvasContainerW", canvasContainerW);
    // var canvasParent = $("#" + canvasName).parent()[0];
    // var canvasContainerH = canvasParent ? canvasParent.offsetHeight : 0;
    // var canvasContainerW = canvasParent ? canvasParent.offsetWidth : 0;
    // console.log("canvasContainerH", canvasContainerH, "canvasContainerW", canvasContainerW, 'parentPresent=', !!canvasParent);

    var canvasBtns = $("#" + canvasName + "-btns")[0];
    var canvasBtns_height = typeof canvasBtns !== "undefined" ? canvasBtns.offsetHeight : 0;
    // var canvasWidthOrg = canvasContainerW;
    var canvasWidthOrg = typeof canvasContainerW == 0 ? canvasContainerW : l_offsetwidth;
    var canvasHeightOrg = canvasContainerH - canvasBtns_height;
    $("#" + canvasName)
        .css("height", canvasHeightOrg + "px !important")
        .css("width", canvasWidthOrg + "px !important");
    //  $("#" + canvasName).css({
    //     height: canvasHeightOrg + "px",
    //     width: canvasWidthOrg + "px",
    // });
    g_canvas.width = canvasWidthOrg;
    g_canvas.height = canvasHeightOrg;
    g_camera.aspect = canvasWidthOrg / canvasHeightOrg;
    try { console.log('init: canvas set size ->', canvasWidthOrg, canvasHeightOrg, 'camera.aspect=', g_camera.aspect); } catch (e) { }


    // adjust the FOV
    g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV);
    g_camera.updateProjectionMatrix();
    // render(0);
    g_renderer.setSize(canvasWidthOrg, canvasHeightOrg);
    g_cut_support_obj_arr = [];
    loc_details = {};
    g_cut_action_done = "N";
    g_copy_action_done = "N";
    g_delete_action_done = "N";
    g_multi_delete_done = "N";
    g_dup_action_done = "N";
    g_multi_copy_done = "N";
    g_curr_canvas = 1;

    $(".peg_holes").addClass("peg_hole_acive");
    window.addEventListener("resize", onWindowResize, false);

    //if the logged in role does not have below privileges. then don't assign contextmenu event.
    if ($v("P193_DELETE_IND") == "Y" || $v("P193_EDIT_IND") == "Y") {
        window.addEventListener("contextmenu", onContextMenu, false);
    }
    //separate event for context menu click and custom colors drop down (example product details popup color selection.)
    window.addEventListener("click", function (event) {
        if ($(event.target).attr("class") !== "button-plus" && $(event.target).attr("class") !== "button-minus" && $(event.target).attr("class") !== "quantity-field") {
            document.getElementById("context-menu").classList.remove("active");
            g_context_opened = "N";
        }
        logo_clicked = "N";
        if (typeof $(event.target).attr("id") !== "undefined") {
            if (!$(event.target).attr("id").startsWith("CUSTOM_COLOR")) {
                $("#co-color-list").slideUp("fast", function () {
                    $("#co-color-list").css("display", "none");
                    openChooseColor = false;
                });
            }
        } else if ($(event.target).attr("class") == "t-Icon fa fa-eyedropper") {
            console.log(" else if ", $(event.target).attr("class"));
        } else {
            $("#co-color-list").slideUp("fast", function () {
                $("#co-color-list").css("display", "none");
                openChooseColor = false;
            });
        }
    });
    onWindowResize("F");
    logDebug("function : init", "E");
}

// Moved to asw_common_functions.js
//This function is assigned to event mousewheel.  this is majorly used to zoom in and out when ctrl key is pressed and do mouse scroll.
// function onDocumentMouseWheel(p_event) {
//     logDebug("function : onDocumentMouseWheel", "S");
//     var jselector = g_canvas.getAttribute("id");
//     console.log("jselector", jselector, p_event.target.nodeName, p_event.ctrlKey);
//     if (p_event.target.nodeName == "CANVAS") {
//         if (p_event.ctrlKey) {
//             g_duplicating = "N";
//             p_event.preventDefault();
//             p_event.stopPropagation();
//             g_manual_zoom_ind = "Y";
//             var r = g_canvas.getBoundingClientRect();
//             var x = p_event.clientX - r.left;
//             var y = p_event.clientY - r.top;
//             var factor = parseFloat($v("P193_POGCR_CAMERA_ZOOM_FACTOR"));
//             var width = g_canvas.width / window.devicePixelRatio;
//             var height = g_canvas.height / window.devicePixelRatio;
//             var mX = (2 * x) / width - 1;
//             var mY = 1 - (2 * y) / height;
//             var vector = new THREE.Vector3(mX, mY, p_event.deltaY / 500);
//             vector.unproject(g_camera);
//             vector.sub(g_camera.position);
//             if (p_event.deltaY < 0) {
//                 $(jselector).css("cursor", "zoom-in");
//                 g_camera.position.addVectors(g_camera.position, vector.setLength(factor));
//             } else {
//                 $(jselector).css("cursor", "zoom-out");
//                 g_camera.position.subVectors(g_camera.position, vector.setLength(factor));
//             }
//             render(g_pog_index);
//         } else {
//             if (g_manual_zoom_ind == "Y") {
//                 var scroll_interval = parseFloat($v("P193_POGCR_WHEEL_UP_DOWN_INTER"));

//                 if (p_event.deltaY < 0) {
//                     //up
//                     g_camera.position.set(g_camera.position.x, g_camera.position.y + scroll_interval, g_camera.position.z);
//                 } else if (p_event.deltaY > 0) {
//                     //down
//                     g_camera.position.set(g_camera.position.x, g_camera.position.y - scroll_interval, g_camera.position.z);
//                 }
//                 render(g_pog_index);
//             }
//         }
//     }
//     logDebug("function : onDocumentMouseWheel", "E");
// }

// Moved to asw_common_functions.js
//add from wpd-3 needs to common
// function set_indicator_objects(p_pog_index) {
//     var ind_objects = {};
//     ind_objects["FixelLabel"] = g_show_fixel_label;
//     ind_objects["ItemLabel"] = g_show_item_label;
//     ind_objects["NotchLabel"] = g_show_notch_label;
//     ind_objects["MaxMerch"] = g_show_max_merch;
//     ind_objects["ItemColor"] = g_show_item_color;
//     ind_objects["ItemDesc"] = g_show_item_desc;
//     ind_objects["LiveImage"] = g_show_live_image;
//     ind_objects["DaysOfSupply"] = g_show_days_of_supply;
//     ind_objects["OverhungShelf"] = g_overhung_shelf_active; //ASA-1138
//     ind_objects["ItemSubLabelInd"] = g_itemSubLabelInd; //ASA-1182
//     ind_objects["ItemSubLabel"] = g_itemSubLabel; //ASA-1182
//     g_scene_objects[p_pog_index].Indicators = ind_objects;
// }

// from wpd-3 needs to common Moved from WPD 3 -> Addinial code for block need to handle as per pag3 193
// async function getJson(p_new_pog_ind, p_pog_code, p_pog_version, p_recreate, p_create_json, p_camera, p_scene, p_canvasNo, p_imageLoadInd = "N", p_resetparam = "Y", p_pog_desc) {
//     //ASA-1765 Added p_pog_desc #issue 5
//     logDebug("function : getJson; new_pog_ind : " + p_new_pog_ind + "; pog_version : " + p_pog_version + "; recreate : " + p_recreate + "; create_json : " + p_create_json, "S");
//     try {
//         return new Promise(function (resolve, reject) {
//             var process_name;
//             var pog_opened = "N";
//             var automate_ind = "N";
//             var items_arr = [];

//             if (p_new_pog_ind == "Y") {
//                 //getting draft POG sm_pog_design
//                 process_name = "GET_POG_JSON";
//                 pog_opened = "N";
//                 $s("P193_OPEN_POG_CODE", "");
//             } else if (p_new_pog_ind == "T") {
//                 //getting template from sm_pog_design
//                 process_name = "OPEN_TEMPLATE";
//                 pog_opened = "N";
//                 $s("P193_OPEN_POG_CODE", "");
//             } else {
//                 //getting existing pog(here it can be a pog already opened and saved in WPD so a copy of json will be saved in sm_pog_design else
//                 //if opening first time any pog when it will come from sm_pog, sm_pog_module,sm_pog_fixel, sm_pog_item_position)
//                 process_name = "GET_EXISTING_POG";
//                 pog_opened = "E";
//                 //recreate = 'N';
//             }
//             var seq_id = -1;
//             if (p_new_pog_ind == "Y") {
//                 seq_id = p_pog_version;
//             } else {
//                 seq_id = p_pog_code;
//             }
//             var p = apex.server.process(
//                 process_name,
//                 {
//                     x01: seq_id,
//                     x02: p_pog_version,
//                 },
//                 {
//                     dataType: "html",
//                 }
//             );
//             // When the process is done, set the value to the page item
//             p.done(function (data) {
//                 var processed = "Y";
//                 var return_data = $.trim(data);
//                 try {
//                     g_json = JSON.parse($.trim(data));
//                 } catch {
//                     processed = "N";
//                 }
//                 if (processed == "N") {
//                     raise_error(return_data);
//                     //ASA-1500
//                     /*try {
//                     raise_error(return_data);
//                     } catch {
//                     removeLoadingIndicator(regionloadWait);
//                     }*/
//                 } else if (return_data !== "") {
//                     g_json = JSON.parse($.trim(data));
//                     if (p_create_json == "Y") {
//                         // g_pog_json_data.push(g_json[0]);
//                         g_pog_json_data.push(JSON.parse(JSON.stringify(g_json[0]))); //Regression Issue 12 05082024
//                         // ASA-1924 Issue-1 Start
//                         // if (typeof p_pog_desc !== "Undefined") { 
//                         // 	//ASA-1765 Added if/else to set Desc7  #issue 5
//                         // 	g_pog_json_data[0].Desc7 = p_pog_desc;
//                         // }       
//                         // ASA-1924 Issue-1 End                 
//                     } else {
//                         g_pog_json_data = g_pog_json;
//                     }
//                     if (typeof g_pog_json_data !== "undefined") {
//                         //recreate the orientation view if any present
//                         async function recreate_view() {
//                             if (p_new_pog_ind == "Y") {
//                                 automate_ind = await get_draft_ind(seq_id); //ASA-1710 $v("P193_DRAFT_LIST")
//                                 let draftVersion = await loadDraftVersion(seq_id); //ASA-1912
//                                 g_pog_json_data[g_pog_index].draftVersion = draftVersion; //ASA-1912
//                                 if (p_new_pog_ind == "Y" && automate_ind == "Y") {
//                                     pog_opened = "E";
//                                     p_new_pog_ind = "N";
//                                 }
//                             }
//                             sessionStorage.setItem("new_pog_ind", p_new_pog_ind);
//                             sessionStorage.setItem("pog_opened", pog_opened);
//                             sessionStorage.setItem("POGExists", "Y");
//                             //this function is used to set labels indicators by default BU Param.
//                             // 1655 Added new param p_resetparam= 'Y' to not reset flags when called from PLANO GRAPH
//                             if (p_resetparam == "Y") {
//                                 await setDefaultState(p_new_pog_ind);
//                             }

//                             //this function will create the skeleton.
//                             var return_val = await create_module_from_json(g_pog_json_data, p_new_pog_ind, "F", "N", pog_opened, "N" /* Stop Loading"Y"*/, "N", p_recreate, p_create_json, p_pog_version, "Y", p_camera, p_scene, g_pog_index, p_canvasNo, p_imageLoadInd);

//                             if (p_new_pog_ind == "N" && automate_ind == "Y") {
//                                 sessionStorage.setItem("new_pog_ind", "Y");
//                             }

//                             if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
//                                 backupPog("F", -1, -1, g_pog_index);
//                             }
//                             if (g_compare_pog_flag == "Y" && g_compare_view !== "POG") {
//                                 var returnval = await recreate_compare_views(g_compare_view, "N");
//                             }
//                             logDebug("function : getJson", "E");
//                             resolve("SUCCESS");
//                         }
//                         recreate_view();
//                     }
//                     clearUndoRedoInfo();
//                     g_dblclick_opened = "N";
//                 }
//             });
//             console.log("blockList", g_mod_block_list);
//         });
//     } catch (err) {
//         error_handling(err);
//     }
//   //Loading block after POG load
//     try {
//         if (Array.isArray(g_mod_block_list) && g_mod_block_list.length > 0) {
//             for (const blkDet of g_mod_block_list) {
//                 try {
//                     // Draw only if BlockDim not present yet
//                     if (typeof blkDet.BlockDim === 'undefined' || Object.keys(blkDet.BlockDim).length === 0) {
//                         g_autofillModInfo = blkDet.BlkModInfo || [];
//                         g_autofillShelfInfo = blkDet.BlkShelfInfo || [];
//                         var retdtl = await colorAutofillBlock(blkDet["DragMouseStart"], blkDet["DragMouseEnd"], blkDet["mod_index"], blkDet["BlkColor"], blkDet["BlkName"], "U", blkDet, p_pog_index, "N");
//                         blkDet["BlockDim"] = retdtl;
//                     }
//                 } catch (innerErr) {
//                     error_handling(innerErr);
//                 }
//             }
//         }
//     } catch (err2) {
//         error_handling(err2);
//     }

// }

// from wpd_4 needs to common
function clearUndoRedoInfo() {
    try {
        logDebug("function : clearUndoRedoInfo", "S");
        g_undo_final_obj_arr = [];
        g_redo_final_obj_arr = [];
        g_undo_all_obj_arr = [];
        g_redo_all_obj_arr = [];
        g_undo_details = [];
        g_delete_details = [];
        g_multi_drag_shelf_arr = [];
        g_multi_drag_item_arr = [];
        g_cut_support_obj_arr = [];
        g_cut_loc_arr = [];
        g_cut_copy_arr = [];
        g_undoRedoAction = "REDO";
        logDebug("function : clearUndoRedoInfo", "E");
    } catch (err) {
        error_handling(err);
    }
}

// Moved to asw_common_functions.js
//This function will fire on event onwindowresize. this will check if the devicepixelratio is changed from previous. will try to recreated the 
//POG according to new screen ratio.
async function onWindowResize(p_event) {
    logDebug("function : onWindowResize", "S");
    try {
        var header = document.getElementById("t_Header");
        var breadcrumb = document.getElementById("t_Body_title");
        var top_bar = document.getElementById("top_bar");
        var side_nav = document.getElementById("t_Body_nav");
        var button_cont = document.getElementById("wpdSplitter_splitter_first");
        var wtbar = document.querySelector(".wtbar");
        var devicePixelRatio = window.devicePixelRatio;

        var header_height = header.offsetHeight * devicePixelRatio;
        var breadcrumb_height = breadcrumb.offsetHeight * devicePixelRatio;
        var top_bar_height = top_bar.offsetHeight * devicePixelRatio;
        var side_nav_width = side_nav.offsetWidth * devicePixelRatio;
        var btn_cont_width = button_cont.offsetWidth * devicePixelRatio;
        var wtbar_height = wtbar.offsetHeight * devicePixelRatio;
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
            appendMultiCanvasRowCol(TEMP_POG.length, $v("P193_POGCR_TILE_VIEW"));

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
                var return_val = await create_module_from_json(TEMP_POG, sessionStorage.getItem("new_pog_ind"), "F", $v("P193_PRODUCT_BTN_CLICK"), sessionStorage.getItem("pog_opened"), "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
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

async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_stop_loading, p_create_pdf_ind, p_recreate, p_create_json, p_pog_version, p_save_pdf, p_camera, p_scene, p_pog_index, p_orgPogIndex, p_ImageLoadInd = "N", p_UpdateIndex = "N", p_old_POGJSON = []) {
    try {
        typeof p_save_pdf == "undefined" ? "Y" : p_save_pdf;
        load_orientation_json();
        $("#LIVE_IMAGE").addClass("apex_disabled");
        //Start ASA-1371_26842
        if ($v('P193_POGCR_DFT_NOTCH_LABEL') == "Y") {
            g_show_notch_label = 'Y';
            //show_notch_labels("Y", $v("P36_NOTCH_HEAD"), "Y", p_pog_index);
        }
        if ($v('P193_POGCR_DFT_FIXEL_LABEL') == "Y") {
            g_show_fixel_label = 'Y';
            //show_fixel_labels("Y", p_pog_index);
        }
        if ($v('P193_POGCR_SHOW_DFLT_ITEM_LOC') == "Y") {
            g_show_item_label = 'Y';
            //show_item_labels("Y", $v("P36_POGCR_ITEM_NUM_LBL_COLOR"), $v("P36_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        }
        console.log("create_module_from_json:start", { p_pog_index: p_pog_index, g_canvas_objects_len: g_canvas_objects ? g_canvas_objects.length : 0, g_scene_objects_len: g_scene_objects ? g_scene_objects.length : 0, has_p_camera: typeof p_camera !== 'undefined', has_p_scene: typeof p_scene !== 'undefined' });
        console.log("value", p_pog_json_arr,
            p_new_pog_ind,
            p_pog_type,
            p_product_open,
            p_pog_opened,
            p_recreate,
            p_create_json,
            $v("P193_VDATE"),
            $v("P193_POG_POG_DEFAULT_COLOR"),
            $v("P193_POG_MODULE_DEFAULT_COLOR"),
            p_pog_version,
            true,
            "N",
            null,
            $v("P193_POGCR_DFT_SPREAD_PRODUCT"),
            parseFloat($v("P193_PEGB_DFT_HORIZ_SPACING")),
            parseFloat($v("P193_PEGBOARD_DFT_VERT_SPACING")),
            parseFloat($v("P193_BASKET_DFT_WALL_THICKNESS")),
            parseFloat($v("P193_CHEST_DFT_WALL_THICKNESS")),
            $v("P193_POGCR_PEGB_MAX_ARRANGE"),
            $v("P193_POGCR_DEFAULT_WRAP_TEXT"),
            parseInt($v("P193_POGCR_TEXT_DEFAULT_SIZE")),
            $v("P193_POG_TEXTBOX_DEFAULT_COLOR"),
            $v("P193_POG_SHELF_DEFAULT_COLOR"),
            $v("P193_DIV_COLOR"),
            $v("P193_SLOT_DIVIDER"),
            $v("P193_SLOT_ORIENTATION"),
            $v("P193_DIVIDER_FIXED"),
            $v("P193_POG_ITEM_DEFAULT_COLOR"),
            $v("P193_POGCR_DELIST_ITEM_DFT_COL"),
            g_peg_holes_active,
            $v("P193_POG_CP_SHELF_DFLT_COLOR"),
            3,
            $v("P193_MERCH_STYLE"),
            $v("P193_POGCR_LOAD_IMG_FROM"),
            $v("P193_BU_ID"),
            $v("P193_POGCR_DELIST_ITEM_DFT_COL"),
            $v("P193_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P193_POGCR_DISPLAY_ITEM_INFO"),
            $v("P193_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P193_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P193_NOTCH_HEAD"),
            "N",
            $v("P193_POGCR_DFT_BASKET_FILL"),
            $v("P193_POGCR_DFT_BASKET_SPREAD"),
            p_camera,
            p_pog_index,
            p_orgPogIndex,
            $v('P193_POGCR_NOTCH_START_VALUE'),
            $v('P193_POGCR_MANUAL_CRUSH_ITEM'),
            'Y', //ASA-1310 KUSH FIX
            "");

        console.log('create_module_from_json:start', p_pog_index, {
            has_p_camera: !!p_camera,
            p_camera_id: p_camera && p_camera.uuid,
            has_p_scene: !!p_scene,
            p_scene_children: p_scene ? p_scene.children.length : null,
            global_scene_children: g_scene ? g_scene.children.length : null,
            global_world_children: g_world ? g_world.children.length : null,
            g_canvas_objects_len: g_canvas_objects ? g_canvas_objects.length : null,
            g_scene_objects_len: g_scene_objects ? g_scene_objects.length : null
        });
        await create_module_from_json_lib(
            p_pog_json_arr,
            p_new_pog_ind,
            p_pog_type,
            p_product_open,
            p_pog_opened,
            p_recreate,
            p_create_json,
            $v("P193_VDATE"),
            $v("P193_POG_POG_DEFAULT_COLOR"),
            $v("P193_POG_MODULE_DEFAULT_COLOR"),
            p_pog_version,
            true,
            "N",
            null,
            $v("P193_POGCR_DFT_SPREAD_PRODUCT"),
            parseFloat($v("P193_PEGB_DFT_HORIZ_SPACING")),
            parseFloat($v("P193_PEGBOARD_DFT_VERT_SPACING")),
            parseFloat($v("P193_BASKET_DFT_WALL_THICKNESS")),
            parseFloat($v("P193_CHEST_DFT_WALL_THICKNESS")),
            $v("P193_POGCR_PEGB_MAX_ARRANGE"),
            $v("P193_POGCR_DEFAULT_WRAP_TEXT"),
            parseInt($v("P193_POGCR_TEXT_DEFAULT_SIZE")),
            $v("P193_POG_TEXTBOX_DEFAULT_COLOR"),
            $v("P193_POG_SHELF_DEFAULT_COLOR"),
            $v("P193_DIV_COLOR"),
            $v("P193_SLOT_DIVIDER"),
            $v("P193_SLOT_ORIENTATION"),
            $v("P193_DIVIDER_FIXED"),
            $v("P193_POG_ITEM_DEFAULT_COLOR"),
            $v("P193_POGCR_DELIST_ITEM_DFT_COL"),
            g_peg_holes_active,
            $v("P193_POG_CP_SHELF_DFLT_COLOR"),
            3,
            $v("P193_MERCH_STYLE"),
            $v("P193_POGCR_LOAD_IMG_FROM"),
            $v("P193_BU_ID"),
            $v("P193_POGCR_DELIST_ITEM_DFT_COL"),
            $v("P193_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P193_POGCR_DISPLAY_ITEM_INFO"),
            $v("P193_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P193_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P193_NOTCH_HEAD"),
            "N",
            $v("P193_POGCR_DFT_BASKET_FILL"),
            $v("P193_POGCR_DFT_BASKET_SPREAD"),
            p_camera,
            p_pog_index,
            p_orgPogIndex,
            $v('P193_POGCR_NOTCH_START_VALUE'),
            $v('P193_POGCR_MANUAL_CRUSH_ITEM'),
            'Y', //ASA-1310 KUSH FIX
            ""); //Regression 29(Portal Issue) added p_calc_dayofsupply
        console.log("create_module_from_json:done", { p_pog_index: p_pog_index, g_pog_json_len: g_pog_json ? g_pog_json.length : 0 });
        // try {
        //     console.log('g_world children', g_world ? g_world.children.length : 0);
        // } catch (e) {
        //     console.warn('g_world not available', e);
        // }
        // try {
        //     // Force renderer size to current canvas and render once more to ensure draw
        //     if (typeof g_canvas !== 'undefined' && g_canvas !== null && typeof g_renderer !== 'undefined' && g_renderer !== null) {
        //         try {
        //             g_renderer.setSize(g_canvas.width, g_canvas.height);
        //         } catch (e) {
        //             console.warn('setSize failed', e);
        //         }
        //         try {
        //             g_renderer.render(g_scene, g_camera);
        //         } catch (e) {
        //             console.warn('forced render failed', e);
        //         }
        //     }
        //     console.log('post-render debug', {
        //         g_scene_children: g_scene ? g_scene.children.length : 0,
        //         g_world_children: g_world ? g_world.children.length : 0,
        //         camera_pos: g_camera ? { x: g_camera.position.x, y: g_camera.position.y, z: g_camera.position.z } : null,
        //         canvas_attrs: g_canvas ? { width: g_canvas.width, height: g_canvas.height, clientWidth: g_canvas.clientWidth, clientHeight: g_canvas.clientHeight } : null
        //     });
        // } catch (e) {
        //     console.warn('post-render debug failed', e);
        // }
        g_pog_json[p_pog_index].MassUpdate = "N"; //ASA-1809, Set this to N, as for saving POG draft or existing the coordinates in JSON has been update with respect to WPD

        //This after refresh event is needed because Division/Dept/Subdept are cascading LOV and setting value is always removed by refresh
        //due to setting value to master page item.
        $("#P193_POG_SUBDEPT").on("apexafterrefresh", function () {
            if (typeof g_pog_json[p_pog_index] != "undefined")
                apex.item(this).setValue(g_pog_json[p_pog_index].SubDept);
        });
        $("#P193_POG_DEPT").on("apexafterrefresh", function () {
            if (typeof g_pog_json[p_pog_index] != "undefined")
                apex.item(this).setValue(g_pog_json[p_pog_index].Dept);
        });

        apex.item("P193_POG_DIVISION").setValue(g_pog_json[p_pog_index].Division);
        // ASA-1500
        // if (typeof regionloadWait !== "undefined" && regionloadWait !== null) {
        //     if (p_stop_loading == "Y") {
        //         removeLoadingIndicator(regionloadWait);
        //     }
        // }
        //based on the POG getting created. set all label, live image button on or off and setup global varaibles for labels.
        // if (p_create_pdf_ind == "N" && p_recreate == "Y" && p_orgPogIndex == p_pog_index) {
        //     var res = await enableDisableFlags(p_pog_index);
        // }
        if (p_recreate == "Y") {
            //this is the function will store the g_pog_json into a backup array for recreating the POG in any error.
            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                backupPog("F", -1, -1, p_pog_index);
            }
            //loading all the items for all items in g_ItemImages array to load images to item.
            // if ($v("P193_POGCR_LOAD_IMG_FROM") == "DB" && p_product_open == "N" && p_create_pdf_ind == "N" && p_ImageLoadInd == "N") {
            //     var retval = await get_all_images(p_pog_index, g_get_orient_images, "N", $v("P193_POGCR_IMG_MAX_WIDTH"), $v("P193_POGCR_IMG_MAX_HEIGHT"), $v("P193_IMAGE_COMPRESS_RATIO"));
            // }
            //This below part is used when user click Generate PDF. this will take the json from DB and create the POG skeleton and soon create PDF from it.
            //This is because Generate PDF only uses data from table because it save the created PDF into sm_pog table.
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
                    'TemplateId': $v("P193_PDF_TEMPLATE").split('-')[0],
                    'TemplateDetails': $v("P193_PDF_TEMPLATE")
                };

                //ASA-1870 passed values from $v("P193_POGCR_ENHANCE_PDF_IMG") to $v("P193_POGCR_BAY_WITHOUT_LIVE_IMAGE") to set_scene
                var return_val = create_pdf(p_pog_details, p_save_pdf, "N", p_camera, draft_ind, $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_NOTCH_HEAD"), "Y", p_pog_index, "Y", g_all_pog_flag, $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), "", "", g_hide_show_dos_label, "",
                    $v("P193_POGCR_ENHANCE_PDF_IMG"), $v("P193_POGCR_PDF_IMG_ENHANCE_RATIO"), $v("P193_POGCR_PDF_CANVAS_SIZE"), $v("P193_VDATE"), $v("P193_POG_POG_DEFAULT_COLOR"), $v("P193_POG_MODULE_DEFAULT_COLOR"), $v("P193_POGCR_DFT_SPREAD_PRODUCT"), $v("P193_PEGB_DFT_HORIZ_SPACING"), $v("P193_PEGBOARD_DFT_VERT_SPACING"), $v("P193_BASKET_DFT_WALL_THICKNESS"), $v("P193_CHEST_DFT_WALL_THICKNESS"), $v("P193_POGCR_PEGB_MAX_ARRANGE"), $v("P193_POGCR_DEFAULT_WRAP_TEXT"), $v("P193_POGCR_TEXT_DEFAULT_SIZE"), $v("P193_POG_TEXTBOX_DEFAULT_COLOR"), $v("P193_POG_SHELF_DEFAULT_COLOR"), $v("P193_DIV_COLOR"), $v("P193_SLOT_DIVIDER"), $v("P193_SLOT_ORIENTATION"), $v("P193_DIVIDER_FIXED"), $v("P193_POG_ITEM_DEFAULT_COLOR"), $v("P193_POGCR_DFT_BASKET_FILL"), $v("P193_POGCR_DFT_BASKET_SPREAD"), $v("P193_POGCR_BAY_LIVE_IMAGE"), $v("P193_POGCR_BAY_WITHOUT_LIVE_IMAGE"), "N"); //ASA-1427 $v('P193_POGCR_ITEM_DETAIL_LIST')
            }

            $(".live_image").css("color", "white").css("cursor", "pointer");
            // $(".open_pdf").css("color", "black").attr("onclick", "open_pdf()").css("cursor", "pointer"); //Task_29818
            $(".open_pdf").css("color", "black").css("cursor", "pointer");                                  //Task_29818
            // $(".open_pdf_online").css("color", "black").attr("onclick", "open_pdf_online()").css("cursor", "pointer");  //Task_29818
            $(".open_pdf_online").css("color", "black").css("cursor", "pointer");                                       //Task_29818            
        }
        if (g_ItemImages.length > 0 && g_show_live_image == "Y" && p_recreate == 'Y') {
            try {
                $(".live_image").addClass("live_image_active");
                if (p_create_pdf_ind == "N" && p_product_open == "N" && $v("P193_POGCR_DFT_ITEM_DESC") == "N" && p_ImageLoadInd == "N") {
                    var return_val = await recreate_image_items("Y", $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_NOTCH_HEAD"), p_pog_index, g_show_days_of_supply, $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
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

        //ASA-1652 #3 Start
        var modIdx = 0;
        for (const modInfo of g_pog_json[p_pog_index].ModuleInfo) {
            if (typeof modInfo.ParentModule == "undefined" || modInfo.ParentModule == null) {
                var shelfIdx = 0;
                for (const shelf of modInfo.ShelfInfo) {
                    if (shelf.ObjType == "TEXTBOX") {
                        var selObj = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[modIdx].ShelfInfo[shelfIdx].SObjID);
                        //Regression Issue 7 20250117, added if condition
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
        //ASA-1652 #3 End
        //ASA-1353 issue 3 --Task_27104 20240417
        /*
        //ASA-1157
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && p_recreate == 'Y') {
        var m = 0;
        var moduleCombInfo = g_pog_json[p_pog_index].ModuleInfo;
        for (g_module of moduleCombInfo) {
        var s = 0;
        var shelfCombInfo = g_pog_json[p_pog_index].ModuleInfo[m].ShelfInfo;
        for (shelf_info of shelfCombInfo) {//ASA-1350 issue 6 variable name change
        if ((shelf_info.ObjType == "SHELF" || shelf_info.ObjType == "HANGINGBAR") && shelf_info.Combine !== "N") {
        await generateCombinedShelfs(p_pog_index, m, s, $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), 'Y', "", "Y");//ASA-1350 issue 6 added parameters
        }
        s++;
        }
        m++;
        }
        }*/
    } catch (err) {
        error_handling(err);
    }
    return "SUCCESS";
}

// from wpd-4 
function set_pog_page_items(p_pog_index) {
    try {
        logDebug("function : set_pog_page_items", "S");
        apex.item("P193_POG_WIDTH").setValue((g_pog_json[p_pog_index].W * 100).toFixed(2));
        apex.item("P193_POG_DEPTH").setValue((g_pog_json[p_pog_index].D * 100).toFixed(2));
        apex.item("P193_BACK_DEPTH").setValue((g_pog_json[p_pog_index].BackDepth * 100).toFixed(2));
        if ((g_pog_json[p_pog_index].SegmentW * 100).toFixed(2) !== "NaN") {
            apex.item("P193_POG_SEGMENT_WIDTH").setValue((g_pog_json[p_pog_index].SegmentW * 100).toFixed(2));
        }
        apex.item("P193_TRAFFIC_FLOW").setValue(g_pog_json[p_pog_index].TrafficFlow);
        apex.item("P193_POG_BASE_HEIGHT").setValue((g_pog_json[p_pog_index].BaseH * 100).toFixed(2));
        apex.item("P193_POG_BASE_WIDTH").setValue((g_pog_json[p_pog_index].BaseW * 100).toFixed(2));
        apex.item("P193_POG_BASE_DEPTH").setValue((g_pog_json[p_pog_index].BaseD * 100).toFixed(2));
        apex.item("P193_POG_NOTCH_WIDTH").setValue((g_pog_json[p_pog_index].NotchW * 100).toFixed(2));
        apex.item("P193_POG_NOTCH_START").setValue((g_pog_json[p_pog_index].NotchStart * 100).toFixed(2));
        apex.item("P193_POG_NOTCH_SPACING").setValue((g_pog_json[p_pog_index].NotchSpacing * 100).toFixed(2));
        apex.item("P193_POG_COLOR").setValue(g_pog_json[p_pog_index].Color);
        apex.item("P193_HORZ_START").setValue((g_pog_json[p_pog_index].HorzStart * 100).toFixed(2));
        apex.item("P193_HORZ_SPACING").setValue((g_pog_json[p_pog_index].HorzSpacing * 100).toFixed(2));
        apex.item("P193_POG_VERT_START").setValue((g_pog_json[p_pog_index].VertStart * 100).toFixed(2));
        apex.item("P193_POG_VERT_SPACING").setValue((g_pog_json[p_pog_index].VertSpacing * 100).toFixed(2));
        apex.item("P193_ALLOW_OVERLAP").setValue(g_pog_json[p_pog_index].AllowOverlap);
        apex.item("P193_SPECIAL_TYPE").setValue(g_pog_json[p_pog_index].SpecialType);
        apex.item("P193_SPECIAL_TYPE_DESC").setValue(g_pog_json[p_pog_index].SpecialTypeDesc);
        apex.item("P193_DISPLAY_METERAGE").setValue(g_pog_json[p_pog_index].DisplayMeterage);
        apex.item("P193_RPT_METERAGE").setValue(g_pog_json[p_pog_index].RPTMeterage);
        apex.item("P193_EFF_START_DATE").setValue(g_pog_json[p_pog_index].EffStartDate);
        apex.item("P193_BRAND_GROUP_ID").setValue(g_pog_json[p_pog_index].BrandGroupID);
        apex.item("P193_REMARKS").setValue(g_pog_json[p_pog_index].Remarks);
        apex.item("P193_STORE_SEGMENT").setValue(g_pog_json[p_pog_index].StoreSegment);
        apex.item("P193_DESC_7").setValue(g_pog_json[p_pog_index].Desc7);
        apex.item("P193_AREA").setValue(g_pog_json[p_pog_index].Area);
        apex.item("P193_PLN_DEPT").setValue(g_pog_json[p_pog_index].PLNDept);
        g_isPogItemsSet = "Y";
        logDebug("function : set_pog_page_items", "E");
    } catch (err) {
        error_handling(err);
    }
}


async function create_shelf_edit_pog(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_new_pog_ind, p_pog_type, p_carpark_ind, p_recreate, p_create_json, p_pog_index) {
    logDebug("function : create_shelf_edit_pog; mod_index : " + p_mod_index + "; p_module_width : " + p_module_width + "; draft_ind : " + p_draft_ind + "; new_pog_ind : " + p_new_pog_ind + "; pog_type : " + p_pog_type + "; carpark_ind : " + p_carpark_ind + "; recreate : " + p_recreate, "S");
    try {
        var newObjectID = create_shelf_edit_pog_lib(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_new_pog_ind, p_pog_type, p_carpark_ind, p_recreate, p_create_json, $v("P193_POGCR_DFT_SPREAD_PRODUCT"), $v("P193_POG_SHELF_DEFAULT_COLOR"), $v("P193_DIV_COLOR"), $v("P193_SLOT_DIVIDER"), $v("P193_SLOT_ORIENTATION"), $v("P193_DIVIDER_FIXED"), $v("P193_POG_ITEM_DEFAULT_COLOR"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_POG_CP_SHELF_DFLT_COLOR"), 3, $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_NOTCH_HEAD"), "Y", g_camera, p_pog_index, p_pog_index, $v('P193_POGCR_MANUAL_CRUSH_ITEM')); //ASA-1300

        return newObjectID;
    } catch (err) {
        error_handling(err);
    }
}

//This function is called when edit POG or try to create new POG from screen based on the segment width. the modules will be created.
async function add_pog(p_uuid, p_width, p_height, p_depth, p_color, p_color_hex, p_x, p_y, p_edit_ind, p_camera, p_pog_index) {
    logDebug("function : add_pog; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; color_hex : " + p_color_hex + "; x : " + p_x + "; y : " + p_y + "; p_edit_ind : " + p_edit_ind, "S");
    try {
        var POGJSON_arr = [];
        // var fixDimn = sessionStorage.getItem("fixtureDimension") !== null ? JSON.parse(sessionStorage.getItem("fixtureDimension")) : [];//ASA-1694   //ASA-1694 #16
        var fixDimn = JSON.parse(sessionStorage.getItem("fixtureDimension")).length != 0 ? JSON.parse(sessionStorage.getItem("fixtureDimension")) : [{ 'InnerDepth': (p_depth * 1000), 'InnerHeight': (p_height * 1000), 'InnerWidth': (p_width * 1000) }];//ASA-1694 #16
        var i = 0;
        if (p_edit_ind == "Y") {
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                var selectedObject = g_world.getObjectById(Modules.MObjID);
                g_world.remove(selectedObject);
                i++;
            }
            POGJSON_arr = JSON.parse(g_temp_POG_arr);
            g_pog_json[p_pog_index].ModuleInfo.splice(0);
            base_height = POGJSON_arr[p_pog_index].BaseH;
            POGJSON_arr[p_pog_index].ModuleInfo.sort((a, b) => (a.Module > b.Module && (a.ParentModule == null || b.ParentModule == null) ? 1 : -1));
        }

        var module_width_arr = [];
        var curr_width = g_pog_json[p_pog_index].SegmentW;
        var width_sum = g_pog_json[p_pog_index].SegmentW;

        if ($v("P193_POG_MODULE_NAME_TYPE") == "A") {
            var curr_module_uuid = "A";
        } else {
            var curr_module_uuid = 1;
        }
        if (g_is_pog_template_open == "Y") { //ASA-1694
            var next_ind = -1;
            for (i = 0; i < fixDimn.length; i++) {
                var ModuleInfo = {};
                var ShelfInfo = {};
                ModuleInfo["SeqNo"] = i + 1;
                ModuleInfo["Module"] = curr_module_uuid;
                ModuleInfo["ParentModule"] = null;
                ModuleInfo["ParentModuleIndex"] = "";
                ModuleInfo["POGModuleName"] = "";
                ModuleInfo["SubDept"] = g_pog_json[p_pog_index].SubDept;
                ModuleInfo["Remarks"] = "";
                ModuleInfo["H"] = wpdSetFixed(parseFloat(fixDimn[i].InnerHeight / 1000) - g_pog_json[p_pog_index].BaseH);   //ASA-1694 #8 Divide by 1000
                ModuleInfo["W"] = wpdSetFixed(fixDimn[i].InnerWidth / 1000);    //ASA-1694 #8 Divide by 1000
                ModuleInfo["D"] = wpdSetFixed(fixDimn[i].InnerDepth / 1000);    //ASA-1694 #8 Divide by 1000
                ModuleInfo["Color"] = p_color;
                ModuleInfo["Rotation"] = "";
                ModuleInfo["NotchW"] = g_pog_json[p_pog_index].NotchW;
                ModuleInfo["NotchStart"] = g_pog_json[p_pog_index].NotchStart;
                ModuleInfo["NotchSpacing"] = g_pog_json[p_pog_index].NotchSpacing;
                ModuleInfo["HorzStart"] = g_pog_json[p_pog_index].HorzStart;
                ModuleInfo["HorzSpacing"] = g_pog_json[p_pog_index].HorzSpacing;
                ModuleInfo["VertStart"] = g_pog_json[p_pog_index].VertStart;
                ModuleInfo["VertSpacing"] = g_pog_json[p_pog_index].VertSpacing;
                ModuleInfo["AllowOverlap"] = g_pog_json[p_pog_index].AllowOverlap;
                ModuleInfo["LNotch"] = "";
                ModuleInfo["Backboard"] = "";
                ModuleInfo["RNotch"] = "";
                ModuleInfo["CompMObjID"] = typeof g_pog_json[p_pog_index].ModuleInfo[i] !== "undefined" ? g_pog_json[p_pog_index].ModuleInfo[i].CompMObjID : "";
                ModuleInfo["LastCount"] = 0;
                ModuleInfo["EditFlag"] = "Y";
                ModuleInfo["Carpark"] = [];
                ModuleInfo["ShelfInfo"] = [];
                ModuleInfo["ChestInfo"] = []; //ASA-1506 Issue 2
                g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);

                if (g_pog_json[p_pog_index].NotchW > 0) {
                    ShelfInfo = {};
                    ShelfInfo["Shelf"] = get_message("LEFT_NOTCH", curr_module_uuid);
                    ShelfInfo["ObjType"] = "NOTCH";
                    ShelfInfo["Desc"] = "";
                    ShelfInfo["MaxMerch"] = 0;
                    ShelfInfo["GrillH"] = 0;
                    ShelfInfo["LOverhang"] = 0;
                    ShelfInfo["ROverhang"] = 0;
                    ShelfInfo["SpacerThick"] = 0;
                    ShelfInfo["HorizGap"] = 0;
                    ShelfInfo["SpreadItem"] = "L";
                    ShelfInfo["Combine"] = "N";
                    ShelfInfo["AllowAutoCrush"] = "N";
                    ShelfInfo["H"] = ModuleInfo["H"];
                    ShelfInfo["W"] = g_pog_json[p_pog_index].NotchW;
                    ShelfInfo["D"] = ModuleInfo["D"];
                    ShelfInfo["Rotation"] = 0;
                    ShelfInfo["Slope"] = 0;
                    ShelfInfo["Color"] = p_color;
                    ShelfInfo["LiveImage"] = "";
                    ShelfInfo["HorizSlotStart"] = 0;
                    ShelfInfo["HorizSlotSpacing"] = 0;
                    ShelfInfo["HorizStart"] = 0;
                    ShelfInfo["HorizSpacing"] = 0;
                    ShelfInfo["UOverHang"] = 0;
                    ShelfInfo["LoOverHang"] = 0;
                    ShelfInfo["VertiStart"] = 0;
                    ShelfInfo["VertiSpacing"] = 0;
                    ShelfInfo["X"] = p_x - ModuleInfo["W"] / 2;
                    ShelfInfo["Y"] = p_y;
                    ShelfInfo["Z"] = 0;
                    ShelfInfo["InputText"] = "";
                    ShelfInfo["WrapText"] = "";
                    ShelfInfo["ReduceToFit"] = "";
                    ShelfInfo["TextDirection"] = "";
                    ShelfInfo["BsktFill"] = "";
                    ShelfInfo["BsktSpreadProduct"] = "";
                    ShelfInfo["SnapTo"] = "";
                    ShelfInfo["BsktWallH"] = 0;
                    ShelfInfo["BsktBaseH"] = 0;
                    ShelfInfo["BsktWallThickness"] = 0;
                    ShelfInfo["DSlotStart"] = 0;
                    ShelfInfo["DSlotSpacing"] = 0;
                    ShelfInfo["DGap"] = 0;
                    ShelfInfo["FrontOverHang"] = 0;
                    ShelfInfo["BackOverHang"] = 0;
                    ShelfInfo["SlotDivider"] = "";
                    ShelfInfo["AllowOverLap"] = "N";
                    ShelfInfo["AutoPlacing"] = "N";
                    ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
                    ShelfInfo["SlotOrientation"] = "";
                    ShelfInfo["DividerFixed"] = "N";
                    ShelfInfo["LObjID"] = -1;
                    ShelfInfo["NotchLabelObjID"] = -1;
                    ShelfInfo["FStyle"] = "";
                    ShelfInfo["FSize"] = "";
                    ShelfInfo["FBold"] = "";
                    ShelfInfo["TextImg"] = "";
                    ShelfInfo["TextImgName"] = "";
                    ShelfInfo["TextImgMime"] = "";
                    ShelfInfo["ItemInfo"] = [];
                    ShelfInfo["Overhung"] = "N"; //ASA-1138
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.push(ShelfInfo);
                    ShelfInfo = {};
                    ShelfInfo["Shelf"] = get_message("RIGHT_NOTCH", curr_module_uuid);
                    ShelfInfo["ObjType"] = "NOTCH";
                    ShelfInfo["Desc"] = "";
                    ShelfInfo["MaxMerch"] = 0;
                    ShelfInfo["GrillH"] = 0;
                    ShelfInfo["LOverhang"] = 0;
                    ShelfInfo["ROverhang"] = 0;
                    ShelfInfo["SpacerThick"] = 0;
                    ShelfInfo["HorizGap"] = 0;
                    ShelfInfo["SpreadItem"] = "L";
                    ShelfInfo["Combine"] = "N";
                    ShelfInfo["AllowAutoCrush"] = "N";
                    ShelfInfo["H"] = ModuleInfo["H"];
                    ShelfInfo["W"] = g_pog_json[p_pog_index].NotchW;
                    ShelfInfo["D"] = ModuleInfo["D"];
                    ShelfInfo["Rotation"] = 0;
                    ShelfInfo["Slope"] = 0;
                    ShelfInfo["Color"] = p_color;
                    ShelfInfo["LiveImage"] = "";
                    ShelfInfo["HorizSlotStart"] = 0;
                    ShelfInfo["HorizSlotSpacing"] = 0;
                    ShelfInfo["HorizStart"] = 0;
                    ShelfInfo["HorizSpacing"] = 0;
                    ShelfInfo["UOverHang"] = 0;
                    ShelfInfo["LoOverHang"] = 0;
                    ShelfInfo["VertiStart"] = 0;
                    ShelfInfo["VertiSpacing"] = 0;
                    ShelfInfo["X"] = p_x + ModuleInfo["W"] / 2 - g_pog_json[p_pog_index].NotchW;
                    ShelfInfo["Y"] = p_y;
                    ShelfInfo["Z"] = 0;
                    ShelfInfo["InputText"] = "";
                    ShelfInfo["WrapText"] = "";
                    ShelfInfo["ReduceToFit"] = "";
                    ShelfInfo["TextDirection"] = "";
                    ShelfInfo["BsktFill"] = "";
                    ShelfInfo["BsktSpreadProduct"] = "";
                    ShelfInfo["SnapTo"] = "";
                    ShelfInfo["BsktWallH"] = 0;
                    ShelfInfo["BsktBaseH"] = 0;
                    ShelfInfo["BsktWallThickness"] = 0;
                    ShelfInfo["DSlotStart"] = 0;
                    ShelfInfo["DSlotSpacing"] = 0;
                    ShelfInfo["DGap"] = 0;
                    ShelfInfo["FrontOverHang"] = 0;
                    ShelfInfo["BackOverHang"] = 0;
                    ShelfInfo["SlotDivider"] = "";
                    ShelfInfo["AllowOverLap"] = "N";
                    ShelfInfo["AutoPlacing"] = "N";
                    ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
                    ShelfInfo["SlotOrientation"] = "";
                    ShelfInfo["DividerFixed"] = "N";
                    ShelfInfo["LObjID"] = -1;
                    ShelfInfo["NotchLabelObjID"] = -1;
                    ShelfInfo["FStyle"] = "";
                    ShelfInfo["FSize"] = "";
                    ShelfInfo["FBold"] = "";
                    ShelfInfo["TextImg"] = "";
                    ShelfInfo["TextImgName"] = "";
                    ShelfInfo["TextImgMime"] = "";
                    ShelfInfo["ItemInfo"] = [];
                    ShelfInfo["Overhung"] = "N"; //ASA-1138
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.push(ShelfInfo);
                }

                var return_val = await add_module(curr_module_uuid, ModuleInfo["W"], ModuleInfo["H"], ModuleInfo["D"], p_color_hex, p_x, p_y, "N", "Y", ModuleInfo["VertStart"], ModuleInfo["VertSpacing"], ModuleInfo["HorzStart"], ModuleInfo["HorzSpacing"], "Y", p_camera, g_pog_json[p_pog_index].ModuleInfo.length - 1, p_pog_index);

                if (g_pog_json[p_pog_index].NotchW > 0) {
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 2].X = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].X - ModuleInfo["W"] / 2;
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 2].Y = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].Y;
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 1].X = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].X + ModuleInfo["W"] / 2 - g_pog_json[p_pog_index].NotchW;
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 1].Y = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].Y;
                }

                if (p_edit_ind == "Y" && typeof POGJSON_arr[p_pog_index].ModuleInfo[i] !== "undefined" && typeof POGJSON_arr[p_pog_index].ModuleInfo[i].ShelfInfo !== "undefined") {
                    var module_details = POGJSON_arr[p_pog_index].ModuleInfo;
                    var j = 0;
                    for (const modules of module_details) {
                        if (typeof modules.ParentModule == "undefined" || (modules.ParentModule == null && j > next_ind)) {
                            next_ind = j;
                            g_pog_json[p_pog_index].ModuleInfo[i].SubDept = modules.SubDept;
                            g_pog_json[p_pog_index].ModuleInfo[i].Remarks = modules.Remarks;
                            var return_val = await create_shelf_edit_pog(i, POGJSON_arr[p_pog_index].ModuleInfo[j].ShelfInfo, modules.W, "Y", "Y", "D", "N", "Y", "Y", p_pog_index, p_pog_index);
                            break;
                        }
                        j = j + 1;
                    }
                }
                if ($v("P193_POG_MODULE_NAME_TYPE") == "A") {
                    curr_module_uuid = nextLetter(curr_module_uuid);
                } else {
                    var curr_module_uuid = g_pog_json[p_pog_index].ModuleInfo.length + 1;
                }
            }
        } else {
            //When segment width is same as pog width then one module will be created. 
            if (g_pog_json[p_pog_index].SegmentW == p_width) {
                var ModuleInfo = {};
                var ShelfInfo = {};
                ModuleInfo["SeqNo"] = 1;
                ModuleInfo["Module"] = curr_module_uuid;
                ModuleInfo["ParentModule"] = null;
                ModuleInfo["ParentModuleIndex"] = "";
                ModuleInfo["POGModuleName"] = "";
                ModuleInfo["SubDept"] = g_pog_json[p_pog_index].SubDept;
                ModuleInfo["Remarks"] = "";
                ModuleInfo["H"] = parseFloat(p_height) - g_pog_json[p_pog_index].BaseH;
                ModuleInfo["W"] = p_width;
                ModuleInfo["D"] = p_depth;
                ModuleInfo["Color"] = p_color;
                ModuleInfo["Rotation"] = "";
                ModuleInfo["NotchW"] = g_pog_json[p_pog_index].NotchW;
                ModuleInfo["NotchStart"] = g_pog_json[p_pog_index].NotchStart;
                ModuleInfo["NotchSpacing"] = g_pog_json[p_pog_index].NotchSpacing;
                ModuleInfo["HorzStart"] = g_pog_json[p_pog_index].HorzStart;
                ModuleInfo["HorzSpacing"] = g_pog_json[p_pog_index].HorzSpacing;
                ModuleInfo["VertStart"] = g_pog_json[p_pog_index].VertStart;
                ModuleInfo["VertSpacing"] = g_pog_json[p_pog_index].VertSpacing;
                ModuleInfo["AllowOverlap"] = g_pog_json[p_pog_index].AllowOverlap;
                ModuleInfo["LNotch"] = "";
                ModuleInfo["Backboard"] = "";
                ModuleInfo["RNotch"] = "";
                ModuleInfo["LastCount"] = 0;
                ModuleInfo["CompMObjID"] = typeof g_pog_json[p_pog_index].ModuleInfo[0] !== "undefined" ? g_pog_json[p_pog_index].ModuleInfo[0].CompMObjID : "";
                ModuleInfo["Carpark"] = [];
                ModuleInfo["EditFlag"] = "Y";
                ModuleInfo["ShelfInfo"] = [];
                ModuleInfo["ChestInfo"] = []; //ASA-1506 Issue 2
                g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);

                if (g_pog_json[p_pog_index].NotchW > 0) {
                    ShelfInfo = {};
                    ShelfInfo["Shelf"] = get_message("LEFT_NOTCH", curr_module_uuid);
                    ShelfInfo["ObjType"] = "NOTCH";
                    ShelfInfo["Desc"] = "";
                    ShelfInfo["MaxMerch"] = 0;
                    ShelfInfo["GrillH"] = 0;
                    ShelfInfo["LOverhang"] = 0;
                    ShelfInfo["ROverhang"] = 0;
                    ShelfInfo["SpacerThick"] = 0;
                    ShelfInfo["HorizGap"] = 0;
                    ShelfInfo["SpreadItem"] = "L";
                    ShelfInfo["Combine"] = "N";
                    ShelfInfo["AllowAutoCrush"] = "N";
                    ShelfInfo["H"] = ModuleInfo["H"];
                    ShelfInfo["W"] = g_pog_json[p_pog_index].NotchW;
                    ShelfInfo["D"] = p_depth;
                    ShelfInfo["Rotation"] = 0;
                    ShelfInfo["Slope"] = 0;
                    ShelfInfo["Color"] = p_color;
                    ShelfInfo["LiveImage"] = "";
                    ShelfInfo["HorizSlotStart"] = 0;
                    ShelfInfo["HorizSlotSpacing"] = 0;
                    ShelfInfo["HorizStart"] = 0;
                    ShelfInfo["HorizSpacing"] = 0;
                    ShelfInfo["UOverHang"] = 0;
                    ShelfInfo["LoOverHang"] = 0;
                    ShelfInfo["VertiStart"] = 0;
                    ShelfInfo["VertiSpacing"] = 0;
                    ShelfInfo["X"] = p_x - ModuleInfo["W"] / 2;
                    ShelfInfo["Y"] = p_y;
                    ShelfInfo["Z"] = 0;
                    ShelfInfo["InputText"] = "";
                    ShelfInfo["WrapText"] = "";
                    ShelfInfo["ReduceToFit"] = "";
                    ShelfInfo["TextDirection"] = "";
                    ShelfInfo["BsktFill"] = "";
                    ShelfInfo["BsktSpreadProduct"] = "";
                    ShelfInfo["SnapTo"] = "";
                    ShelfInfo["BsktWallH"] = 0;
                    ShelfInfo["BsktBaseH"] = 0;
                    ShelfInfo["BsktWallThickness"] = 0;
                    ShelfInfo["DSlotStart"] = 0;
                    ShelfInfo["DSlotSpacing"] = 0;
                    ShelfInfo["DGap"] = 0;
                    ShelfInfo["FrontOverHang"] = 0;
                    ShelfInfo["BackOverHang"] = 0;
                    ShelfInfo["SlotDivider"] = "";
                    ShelfInfo["AllowOverLap"] = "N";
                    ShelfInfo["AutoPlacing"] = "N";
                    ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
                    ShelfInfo["SlotOrientation"] = "";
                    ShelfInfo["DividerFixed"] = "N";
                    ShelfInfo["LObjID"] = -1;
                    ShelfInfo["NotchLabelObjID"] = -1;
                    ShelfInfo["ItemInfo"] = [];
                    ShelfInfo["FStyle"] = "";
                    ShelfInfo["FSize"] = "";
                    ShelfInfo["FBold"] = "";
                    ShelfInfo["TextImg"] = "";
                    ShelfInfo["TextImgName"] = "";
                    ShelfInfo["TextImgMime"] = "";
                    ShelfInfo["Overhung"] = "N"; //ASA-1138
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.push(ShelfInfo);
                    ShelfInfo = {};
                    ShelfInfo["Shelf"] = get_message("RIGHT_NOTCH", curr_module_uuid);
                    ShelfInfo["ObjType"] = "NOTCH";
                    ShelfInfo["Desc"] = "";
                    ShelfInfo["MaxMerch"] = 0;
                    ShelfInfo["GrillH"] = 0;
                    ShelfInfo["LOverhang"] = 0;
                    ShelfInfo["ROverhang"] = 0;
                    ShelfInfo["SpacerThick"] = 0;
                    ShelfInfo["HorizGap"] = 0;
                    ShelfInfo["SpreadItem"] = "L";
                    ShelfInfo["Combine"] = "N";
                    ShelfInfo["AllowAutoCrush"] = "N";
                    ShelfInfo["H"] = ModuleInfo["H"];
                    ShelfInfo["W"] = g_pog_json[p_pog_index].NotchW;
                    ShelfInfo["D"] = p_depth;
                    ShelfInfo["Rotation"] = 0;
                    ShelfInfo["Slope"] = 0;
                    ShelfInfo["Color"] = p_color;
                    ShelfInfo["LiveImage"] = "";
                    ShelfInfo["HorizSlotStart"] = 0;
                    ShelfInfo["HorizSlotSpacing"] = 0;
                    ShelfInfo["HorizStart"] = 0;
                    ShelfInfo["HorizSpacing"] = 0;
                    ShelfInfo["UOverHang"] = 0;
                    ShelfInfo["LoOverHang"] = 0;
                    ShelfInfo["VertiStart"] = 0;
                    ShelfInfo["VertiSpacing"] = 0;
                    ShelfInfo["X"] = p_x + ModuleInfo["W"] / 2 - g_pog_json[p_pog_index].NotchW;
                    ShelfInfo["Y"] = p_y;
                    ShelfInfo["Z"] = 0;
                    ShelfInfo["InputText"] = "";
                    ShelfInfo["WrapText"] = "";
                    ShelfInfo["ReduceToFit"] = "";
                    ShelfInfo["TextDirection"] = "";
                    ShelfInfo["BsktFill"] = "";
                    ShelfInfo["BsktSpreadProduct"] = "";
                    ShelfInfo["SnapTo"] = "";
                    ShelfInfo["BsktWallH"] = 0;
                    ShelfInfo["BsktBaseH"] = 0;
                    ShelfInfo["BsktWallThickness"] = 0;
                    ShelfInfo["DSlotStart"] = 0;
                    ShelfInfo["DSlotSpacing"] = 0;
                    ShelfInfo["DGap"] = 0;
                    ShelfInfo["FrontOverHang"] = 0;
                    ShelfInfo["BackOverHang"] = 0;
                    ShelfInfo["SlotDivider"] = "";
                    ShelfInfo["AllowOverLap"] = "N";
                    ShelfInfo["AutoPlacing"] = "N";
                    ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
                    ShelfInfo["SlotOrientation"] = "";
                    ShelfInfo["DividerFixed"] = "N";
                    ShelfInfo["LObjID"] = -1;
                    ShelfInfo["NotchLabelObjID"] = -1;
                    ShelfInfo["ItemInfo"] = [];
                    ShelfInfo["FStyle"] = "";
                    ShelfInfo["FSize"] = "";
                    ShelfInfo["FBold"] = "";
                    ShelfInfo["TextImg"] = "";
                    ShelfInfo["TextImgName"] = "";
                    ShelfInfo["TextImgMime"] = "";
                    ShelfInfo["Overhung"] = "N"; //ASA-1138
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.push(ShelfInfo);
                }

                var return_val = await add_module($v("P193_POG_MODULE"), p_width, ModuleInfo["H"], p_depth, p_color_hex, p_x, p_y, "N", "Y", ModuleInfo["VertStart"], ModuleInfo["VertSpacing"], ModuleInfo["HorzStart"], ModuleInfo["HorzSpacing"], "Y", p_camera, g_pog_json[p_pog_index].ModuleInfo.length - 1, p_pog_index);

                if (g_pog_json[p_pog_index].NotchW > 0) {
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 2].X = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].X - ModuleInfo["W"] / 2;
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 2].Y = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].Y;
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 1].X = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].X + g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].W / 2 - g_pog_json[p_pog_index].NotchW;
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 1].Y = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].Y;
                }

                if (p_edit_ind == "Y" && typeof POGJSON_arr[p_pog_index].ModuleInfo !== "undefined" && typeof POGJSON_arr[g_pog_json[p_pog_index].ModuleInfo.length - 1].ModuleInfo[0].ShelfInfo !== "undefined") {
                    var module_details = POGJSON_arr[p_pog_index].ModuleInfo;
                    var i = 0;
                    for (const modules of module_details) {
                        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                            g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].SubDept = modules.SubDept;
                            g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].Remarks = modules.Remarks;
                            if (typeof modules.Carpark !== "undefined") {
                                if (modules.Carpark.length > 0) {
                                    var return_val = await create_shelf_edit_pog(0, POGJSON_arr[p_pog_index].ModuleInfo[i].Carpark, p_width, "Y", "Y", "D", "Y", "Y", "Y", p_pog_index, p_pog_index);
                                }
                            }
                            var return_val = await create_shelf_edit_pog(0, POGJSON_arr[p_pog_index].ModuleInfo[i].ShelfInfo, p_width, "Y", "Y", "D", "N", "Y", "Y", p_pog_index, p_pog_index);
                            break;
                        }
                        i = i + 1;
                    }
                }
            } else {
                //When segment width is small and pog width is more. we divide the pog width into each module width and create multiple modules.
                //Note:if POG was already created. we use the shelf and items starting from first module and create. if there was excess module before edit
                //those will be omitted.
                module_width_arr.push(curr_width);
                for (var i = 0; i < 1000; i++) {
                    width_sum += curr_width;
                    if (wpdSetFixed(width_sum) <= wpdSetFixed(p_width)) //ASA-1381 to_fixed was added on one place so, it was getting difference in decimals and last module not created.
                        module_width_arr.push(parseFloat(curr_width));
                    else
                        break;
                }

                var next_ind = -1;
                for (i = 0; i < module_width_arr.length; i++) {
                    var ModuleInfo = {};
                    var ShelfInfo = {};
                    ModuleInfo["SeqNo"] = i + 1;
                    ModuleInfo["Module"] = curr_module_uuid;
                    ModuleInfo["ParentModule"] = null;
                    ModuleInfo["ParentModuleIndex"] = "";
                    ModuleInfo["POGModuleName"] = "";
                    ModuleInfo["SubDept"] = g_pog_json[p_pog_index].SubDept;
                    ModuleInfo["Remarks"] = "";
                    ModuleInfo["H"] = parseFloat(p_height) - g_pog_json[p_pog_index].BaseH;
                    ModuleInfo["W"] = module_width_arr[i];
                    ModuleInfo["D"] = p_depth;
                    ModuleInfo["Color"] = p_color;
                    ModuleInfo["Rotation"] = "";
                    ModuleInfo["NotchW"] = g_pog_json[p_pog_index].NotchW;
                    ModuleInfo["NotchStart"] = g_pog_json[p_pog_index].NotchStart;
                    ModuleInfo["NotchSpacing"] = g_pog_json[p_pog_index].NotchSpacing;
                    ModuleInfo["HorzStart"] = g_pog_json[p_pog_index].HorzStart;
                    ModuleInfo["HorzSpacing"] = g_pog_json[p_pog_index].HorzSpacing;
                    ModuleInfo["VertStart"] = g_pog_json[p_pog_index].VertStart;
                    ModuleInfo["VertSpacing"] = g_pog_json[p_pog_index].VertSpacing;
                    ModuleInfo["AllowOverlap"] = g_pog_json[p_pog_index].AllowOverlap;
                    ModuleInfo["LNotch"] = "";
                    ModuleInfo["Backboard"] = "";
                    ModuleInfo["RNotch"] = "";
                    ModuleInfo["CompMObjID"] = typeof g_pog_json[p_pog_index].ModuleInfo[i] !== "undefined" ? g_pog_json[p_pog_index].ModuleInfo[i].CompMObjID : "";
                    ModuleInfo["LastCount"] = 0;
                    ModuleInfo["EditFlag"] = "Y";
                    ModuleInfo["Carpark"] = [];
                    ModuleInfo["ShelfInfo"] = [];
                    ModuleInfo["ChestInfo"] = []; //ASA-1506 Issue 2
                    g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);

                    if (g_pog_json[p_pog_index].NotchW > 0) {
                        ShelfInfo = {};
                        ShelfInfo["Shelf"] = get_message("LEFT_NOTCH", curr_module_uuid);
                        ShelfInfo["ObjType"] = "NOTCH";
                        ShelfInfo["Desc"] = "";
                        ShelfInfo["MaxMerch"] = 0;
                        ShelfInfo["GrillH"] = 0;
                        ShelfInfo["LOverhang"] = 0;
                        ShelfInfo["ROverhang"] = 0;
                        ShelfInfo["SpacerThick"] = 0;
                        ShelfInfo["HorizGap"] = 0;
                        ShelfInfo["SpreadItem"] = "L";
                        ShelfInfo["Combine"] = "N";
                        ShelfInfo["AllowAutoCrush"] = "N";
                        ShelfInfo["H"] = ModuleInfo["H"];
                        ShelfInfo["W"] = g_pog_json[p_pog_index].NotchW;
                        ShelfInfo["D"] = p_depth;
                        ShelfInfo["Rotation"] = 0;
                        ShelfInfo["Slope"] = 0;
                        ShelfInfo["Color"] = p_color;
                        ShelfInfo["LiveImage"] = "";
                        ShelfInfo["HorizSlotStart"] = 0;
                        ShelfInfo["HorizSlotSpacing"] = 0;
                        ShelfInfo["HorizStart"] = 0;
                        ShelfInfo["HorizSpacing"] = 0;
                        ShelfInfo["UOverHang"] = 0;
                        ShelfInfo["LoOverHang"] = 0;
                        ShelfInfo["VertiStart"] = 0;
                        ShelfInfo["VertiSpacing"] = 0;
                        ShelfInfo["X"] = p_x - ModuleInfo["W"] / 2;
                        ShelfInfo["Y"] = p_y;
                        ShelfInfo["Z"] = 0;
                        ShelfInfo["InputText"] = "";
                        ShelfInfo["WrapText"] = "";
                        ShelfInfo["ReduceToFit"] = "";
                        ShelfInfo["TextDirection"] = "";
                        ShelfInfo["BsktFill"] = "";
                        ShelfInfo["BsktSpreadProduct"] = "";
                        ShelfInfo["SnapTo"] = "";
                        ShelfInfo["BsktWallH"] = 0;
                        ShelfInfo["BsktBaseH"] = 0;
                        ShelfInfo["BsktWallThickness"] = 0;
                        ShelfInfo["DSlotStart"] = 0;
                        ShelfInfo["DSlotSpacing"] = 0;
                        ShelfInfo["DGap"] = 0;
                        ShelfInfo["FrontOverHang"] = 0;
                        ShelfInfo["BackOverHang"] = 0;
                        ShelfInfo["SlotDivider"] = "";
                        ShelfInfo["AllowOverLap"] = "N";
                        ShelfInfo["AutoPlacing"] = "N";
                        ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
                        ShelfInfo["SlotOrientation"] = "";
                        ShelfInfo["DividerFixed"] = "N";
                        ShelfInfo["LObjID"] = -1;
                        ShelfInfo["NotchLabelObjID"] = -1;
                        ShelfInfo["FStyle"] = "";
                        ShelfInfo["FSize"] = "";
                        ShelfInfo["FBold"] = "";
                        ShelfInfo["TextImg"] = "";
                        ShelfInfo["TextImgName"] = "";
                        ShelfInfo["TextImgMime"] = "";
                        ShelfInfo["ItemInfo"] = [];
                        ShelfInfo["Overhung"] = "N"; //ASA-1138
                        g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.push(ShelfInfo);
                        ShelfInfo = {};
                        ShelfInfo["Shelf"] = get_message("RIGHT_NOTCH", curr_module_uuid);
                        ShelfInfo["ObjType"] = "NOTCH";
                        ShelfInfo["Desc"] = "";
                        ShelfInfo["MaxMerch"] = 0;
                        ShelfInfo["GrillH"] = 0;
                        ShelfInfo["LOverhang"] = 0;
                        ShelfInfo["ROverhang"] = 0;
                        ShelfInfo["SpacerThick"] = 0;
                        ShelfInfo["HorizGap"] = 0;
                        ShelfInfo["SpreadItem"] = "L";
                        ShelfInfo["Combine"] = "N";
                        ShelfInfo["AllowAutoCrush"] = "N";
                        ShelfInfo["H"] = ModuleInfo["H"];
                        ShelfInfo["W"] = g_pog_json[p_pog_index].NotchW;
                        ShelfInfo["D"] = p_depth;
                        ShelfInfo["Rotation"] = 0;
                        ShelfInfo["Slope"] = 0;
                        ShelfInfo["Color"] = p_color;
                        ShelfInfo["LiveImage"] = "";
                        ShelfInfo["HorizSlotStart"] = 0;
                        ShelfInfo["HorizSlotSpacing"] = 0;
                        ShelfInfo["HorizStart"] = 0;
                        ShelfInfo["HorizSpacing"] = 0;
                        ShelfInfo["UOverHang"] = 0;
                        ShelfInfo["LoOverHang"] = 0;
                        ShelfInfo["VertiStart"] = 0;
                        ShelfInfo["VertiSpacing"] = 0;
                        ShelfInfo["X"] = p_x + ModuleInfo["W"] / 2 - g_pog_json[p_pog_index].NotchW;
                        ShelfInfo["Y"] = p_y;
                        ShelfInfo["Z"] = 0;
                        ShelfInfo["InputText"] = "";
                        ShelfInfo["WrapText"] = "";
                        ShelfInfo["ReduceToFit"] = "";
                        ShelfInfo["TextDirection"] = "";
                        ShelfInfo["BsktFill"] = "";
                        ShelfInfo["BsktSpreadProduct"] = "";
                        ShelfInfo["SnapTo"] = "";
                        ShelfInfo["BsktWallH"] = 0;
                        ShelfInfo["BsktBaseH"] = 0;
                        ShelfInfo["BsktWallThickness"] = 0;
                        ShelfInfo["DSlotStart"] = 0;
                        ShelfInfo["DSlotSpacing"] = 0;
                        ShelfInfo["DGap"] = 0;
                        ShelfInfo["FrontOverHang"] = 0;
                        ShelfInfo["BackOverHang"] = 0;
                        ShelfInfo["SlotDivider"] = "";
                        ShelfInfo["AllowOverLap"] = "N";
                        ShelfInfo["AutoPlacing"] = "N";
                        ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
                        ShelfInfo["SlotOrientation"] = "";
                        ShelfInfo["DividerFixed"] = "N";
                        ShelfInfo["LObjID"] = -1;
                        ShelfInfo["NotchLabelObjID"] = -1;
                        ShelfInfo["FStyle"] = "";
                        ShelfInfo["FSize"] = "";
                        ShelfInfo["FBold"] = "";
                        ShelfInfo["TextImg"] = "";
                        ShelfInfo["TextImgName"] = "";
                        ShelfInfo["TextImgMime"] = "";
                        ShelfInfo["ItemInfo"] = [];
                        ShelfInfo["Overhung"] = "N"; //ASA-1138
                        g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.push(ShelfInfo);
                    }

                    var return_val = await add_module(curr_module_uuid, module_width_arr[i], ModuleInfo["H"], p_depth, p_color_hex, p_x, p_y, "N", "Y", ModuleInfo["VertStart"], ModuleInfo["VertSpacing"], ModuleInfo["HorzStart"], ModuleInfo["HorzSpacing"], "Y", p_camera, g_pog_json[p_pog_index].ModuleInfo.length - 1, p_pog_index);

                    if (g_pog_json[p_pog_index].NotchW > 0) {
                        g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 2].X = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].X - module_width_arr[i] / 2;
                        g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 2].Y = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].Y;
                        g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 1].X = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].X + module_width_arr[i] / 2 - g_pog_json[p_pog_index].NotchW;
                        g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.length - 1].Y = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].Y;
                    }

                    if (p_edit_ind == "Y" && typeof POGJSON_arr[p_pog_index].ModuleInfo[i] !== "undefined" && typeof POGJSON_arr[p_pog_index].ModuleInfo[i].ShelfInfo !== "undefined") {
                        var module_details = POGJSON_arr[p_pog_index].ModuleInfo;
                        var j = 0;
                        for (const modules of module_details) {
                            if (typeof modules.ParentModule == "undefined" || (modules.ParentModule == null && j > next_ind)) {
                                next_ind = j;
                                g_pog_json[p_pog_index].ModuleInfo[i].SubDept = modules.SubDept;
                                g_pog_json[p_pog_index].ModuleInfo[i].Remarks = modules.Remarks;
                                if (typeof modules.Carpark !== "undefined") {
                                    if (modules.Carpark.length > 0) {
                                        var return_val = await create_shelf_edit_pog(i, POGJSON_arr[p_pog_index].ModuleInfo[i].Carpark, p_width, "Y", "Y", "D", "Y", "Y", "Y", p_pog_index, p_pog_index);
                                    }
                                }
                                var return_val = await create_shelf_edit_pog(i, POGJSON_arr[p_pog_index].ModuleInfo[j].ShelfInfo, module_width_arr[i], "Y", "Y", "D", "N", "Y", "Y", p_pog_index, p_pog_index);
                                break;
                            }
                            j = j + 1;
                        }
                    }
                    if ($v("P193_POG_MODULE_NAME_TYPE") == "A") {
                        curr_module_uuid = nextLetter(curr_module_uuid);
                    } else {
                        var curr_module_uuid = g_pog_json[p_pog_index].ModuleInfo.length + 1;
                    }
                }
            }
        }
        if (p_edit_ind == "Y") {
            var i = 0;
            for (const Modules of POGJSON_arr[p_pog_index].ModuleInfo) {
                if (Modules.ParentModule !== null && Modules.ParentModule !== "undefined") {
                    var ModuleInfo = {};
                    ModuleInfo["SeqNo"] = 0;
                    ModuleInfo["Module"] = Modules.Module;
                    ModuleInfo["ParentModule"] = Modules.ParentModule;
                    ModuleInfo["ParentModuleIndex"] = Modules.ParentModuleIndex;
                    ModuleInfo["POGModuleName"] = Modules.ModuleName;
                    ModuleInfo["SubDept"] = Modules.SubDept;
                    ModuleInfo["Remarks"] = Modules.Remarks;
                    ModuleInfo["H"] = Modules.H;
                    ModuleInfo["W"] = Modules.W;
                    ModuleInfo["D"] = Modules.D;
                    ModuleInfo["Color"] = Modules.Color;
                    ModuleInfo["Rotation"] = Modules.Rotation;
                    ModuleInfo["NotchW"] = Modules.NotchW;
                    ModuleInfo["NotchStart"] = Modules.NotchStart;
                    ModuleInfo["NotchSpacing"] = Modules.NotchSpacing;
                    ModuleInfo["HorzStart"] = Modules.HorzStart;
                    ModuleInfo["HorzSpacing"] = Modules.HorzSpacing;
                    ModuleInfo["VertStart"] = Modules.VertStart;
                    ModuleInfo["VertSpacing"] = Modules.VertSpacing;
                    ModuleInfo["AllowOverlap"] = Modules.AllowOverlap;
                    ModuleInfo["LNotch"] = Modules.LNotch;
                    ModuleInfo["Backboard"] = Modules.Backboard;
                    ModuleInfo["RNotch"] = Modules.RNotch;
                    ModuleInfo["LastCount"] = 0;
                    ModuleInfo["ShelfInfo"] = Modules.ShelfInfo;
                    g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);
                }
                i++;
            }
        }
        module_arr = g_pog_json[p_pog_index].ModuleInfo;
        module_info_arr = g_pog_json[p_pog_index].ModuleInfo;
        var i = 0;
        for (const Modules of module_arr) {
            if (Modules.ParentModule !== null && Modules.ParentModule !== "undefined") {
                var j = 0;
                for (const Module_info of module_info_arr) {
                    if (Modules.ParentModule == Module_info.Module) {
                        g_pog_json[p_pog_index].ModuleInfo[i].ParentModuleIndex = j;
                    }
                    j++;
                }
                i++;
            }
        }
        add_pog_code_header();
        var details = get_min_max_xy(p_pog_index);
        var details_arr = details.split("###");
        set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
        render(p_pog_index);
        logDebug("function : add_pog", "E");
    } catch (err) {
        error_handling(err);
    }
}

function add_pog_base(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_index) {
    logDebug("function : add_pog_base; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; p_edit_ind : " + p_edit_ind, "S");
    try {
        if (p_edit_ind == "Y") {
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].BaseObjID);
            g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
        }

        g_pog_base = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, 0.001),
            new THREE.MeshStandardMaterial({
                color: p_color,
            }));
        var l_wireframe_id = add_wireframe(g_pog_base, 2);
        g_pog_base.position.x = p_x;
        g_pog_base.position.y = p_y;
        g_pog_base.position.z = 0;
        g_pog_base.uuid = p_uuid;
        g_scene_objects[p_pog_index].scene.children[2].add(g_pog_base);
        g_pog_json[p_pog_index].BaseObjID = g_pog_base.id;
        g_pog_json[p_pog_index].BaseX = p_x;
        g_pog_json[p_pog_index].BaseY = p_y;
        g_pog_json[p_pog_index].BaseZ = 0;
        g_pog_json[p_pog_index].WFrameID = l_wireframe_id;
        logDebug("function : add_pog_base", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function add_module(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_flag, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_recreate, p_camera, p_module_ind) {
    try {
        logDebug("function : add_module; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; p_edit_ind : " + p_edit_ind + "; pog_flag : " + p_pog_flag + "; vert_start : " + p_vert_start + "; vert_spacing : " + p_vert_spacing + "; horz_start : " + p_horz_start + "; horz_spacing : " + p_horz_spacing + "; recreate : " + p_recreate + "; module_ind : " + p_module_ind, "S");
        var result;
        result = await add_module_lib(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_flag, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_recreate, p_camera, p_module_ind, $v("P193_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P193_PEGB_DFT_HORIZ_SPACING")), parseFloat($v("P193_PEGBOARD_DFT_VERT_SPACING")), parseFloat($v("P193_BASKET_DFT_WALL_THICKNESS")), parseFloat($v("P193_CHEST_DFT_WALL_THICKNESS")), $v("P193_POGCR_PEGB_MAX_ARRANGE"), $v("P193_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P193_POGCR_TEXT_DEFAULT_SIZE")), $v("P193_POG_TEXTBOX_DEFAULT_COLOR"), $v("P193_POG_SHELF_DEFAULT_COLOR"), $v("P193_DIV_COLOR"), $v("P193_SLOT_DIVIDER"), $v("P193_SLOT_ORIENTATION"), $("P193_DIVIDER_FIXED"), $v("P193_POG_ITEM_DEFAULT_COLOR"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), g_peg_holes_active, $v("P193_POG_CP_SHELF_DFLT_COLOR"), 3, $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_NOTCH_HEAD"), "Y", g_pog_index, $v("P193_POGCR_DFT_BASKET_FILL"), $v("P193_POGCR_DFT_BASKET_SPREAD"), $v('P193_POGCR_MANUAL_CRUSH_ITEM'));
        $s("P193_MODULE_EDIT_IND", "N");
        return result;
    } catch (err) {
        error_handling(err);
    }
}


function clear_search_fields() {
    logDebug("function : clear_search_fields", "S");
    $s("P193_ITEM", "");
    $s("P193_SUPP_NAME", "");
    $s("P193_SUPPLIER_CODE", "");
    $s("P193_MAIN_BRAND", "");
    $s("P193_ITEM_DESCRIPTION", "");
    $s("P193_DESCRIPTION_SEC", "");
    $s("P193_GROUP", "");
    $s("P193_DEPARTMENT", "");
    $s("P193_ITEM_BRAND", "");
    $s("P193_ITEM_WITHOUT_DIM", "N");
    $s("P193_USED_ITEM", "A");
    $s("P193_CLASS", "");        //ASA-1558 Task 1
    $s("P193_SUB_CLASS", "");    //ASA-1558 Task 1
    logDebug("function : clear_search_fields", "E");
}


function get_select_dim(p_items) {
    logDebug("function : get_select_dim", "S");
    var select_width = (select_height = select_depth = 0);
    if (p_items.MerchStyle == "0") {
        select_width = p_items.OrgUW > 0 ? p_items.OrgUW : p_items.W;
        select_height = p_items.OrgUH > 0 ? p_items.OrgUH : p_items.H;
        select_depth = p_items.OrgUD > 0 ? p_items.OrgUD : p_items.D;
    } else if (p_items.MerchStyle == "1") {
        select_width = p_items.OrgTW > 0 ? p_items.OrgTW : p_items.W;
        select_height = p_items.OrgTH > 0 ? p_items.OrgTH : p_items.W;
        select_depth = p_items.OrgTD > 0 ? p_items.OrgTD : p_items.W;
    } else if (p_items.MerchStyle == "2") {
        select_width = p_items.OrgCW > 0 ? p_items.OrgCW : p_items.W;
        select_height = p_items.OrgCH > 0 ? p_items.OrgCH : p_items.W;
        select_depth = p_items.OrgCD > 0 ? p_items.OrgCD : p_items.W;
    } else if (p_items.MerchStyle == "3") {
        select_width = p_items.OrgDW > 0 ? p_items.OrgDW : p_items.W;
        select_height = p_items.OrgDH > 0 ? p_items.OrgDH : p_items.W;
        select_depth = p_items.OrgDD > 0 ? p_items.OrgDD : p_items.W;
    }
    logDebug("function : get_select_dim", "E");
    return [select_width, select_height, select_depth];
}

function check_dim_difference(p_module_index, p_shelf_index, p_item_index, p_pog_index) {
    logDebug("function : check_dim_difference; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index, "S");
    var itemdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
    var failed = "N";

    if (itemdtl.MerchStyle == "0" && (wpdSetFixed(itemdtl.UW || 0) !== wpdSetFixed(itemdtl.OrgUW || 0) || wpdSetFixed(itemdtl.UH || 0) !== wpdSetFixed(itemdtl.OrgUH || 0) ||
        wpdSetFixed(itemdtl.UD || 0) !== wpdSetFixed(itemdtl.OrgUD || 0))) {
        failed = "Y";
    } else if (itemdtl.MerchStyle == "1" && (
        wpdSetFixed(itemdtl.TW || 0) !== wpdSetFixed(itemdtl.OrgTW || 0) ||
        wpdSetFixed(itemdtl.TH || 0) !== wpdSetFixed(itemdtl.OrgTH || 0) ||
        wpdSetFixed(itemdtl.TD || 0) !== wpdSetFixed(itemdtl.OrgTD || 0))) {
        failed = "Y";
    } else if (itemdtl.MerchStyle == "2" && (
        wpdSetFixed(itemdtl.CW || 0) !== wpdSetFixed(itemdtl.OrgCW || 0) ||
        wpdSetFixed(itemdtl.CH || 0) !== wpdSetFixed(itemdtl.OrgCH || 0) ||
        wpdSetFixed(itemdtl.CD || 0) !== wpdSetFixed(itemdtl.OrgCD || 0))) {
        failed = "Y";
    } else if (itemdtl.MerchStyle == "3" && (
        wpdSetFixed(itemdtl.DW || 0) !== wpdSetFixed(itemdtl.OrgDW || 0) ||
        wpdSetFixed(itemdtl.DH || 0) !== wpdSetFixed(itemdtl.OrgDH || 0) ||
        wpdSetFixed(itemdtl.DD || 0) !== wpdSetFixed(itemdtl.OrgDD || 0))) {
        failed = "Y";
    }

    if (
        wpdSetFixed(itemdtl.NW || 0) !== wpdSetFixed(itemdtl.OrgNW || 0) ||
        wpdSetFixed(itemdtl.NH || 0) !== wpdSetFixed(itemdtl.OrgNH || 0) ||
        wpdSetFixed(itemdtl.ND || 0) !== wpdSetFixed(itemdtl.OrgND || 0)) {
        failed = "Y";
    }

    if (
        wpdSetFixed(itemdtl.CWPerc || 0) !== wpdSetFixed(itemdtl.OrgCWPerc || 0) ||
        wpdSetFixed(itemdtl.CHPerc || 0) !== wpdSetFixed(itemdtl.OrgCHPerc || 0) ||
        wpdSetFixed(itemdtl.CDPerc || 0) !== wpdSetFixed(itemdtl.OrgCDPerc || 0)) {
        failed = "Y";
    }

    if (
        wpdSetFixed(itemdtl.CnW || 0) !== wpdSetFixed(itemdtl.OrgCnW || 0) ||
        wpdSetFixed(itemdtl.CnH || 0) !== wpdSetFixed(itemdtl.OrgCnH || 0) ||
        wpdSetFixed(itemdtl.CnD || 0) !== wpdSetFixed(itemdtl.OrgCnD || 0)) {
        failed = "Y";
    }

    logDebug("function : check_dim_difference", "E");

    if (failed == "Y") {
        return true;
    } else {
        return false;
    }
}

//when edit a item and there is a dimension mismatch, this function will reset new dimension and continue editing of the product.
async function org_dim_update_shelf(p_module_index, p_shelf_index, p_item_index, p_items, p_item_code, p_exclude_item, p_pog_index) {
    var nesting_val = 0;
    var success_ind = "N";
    var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
    if (p_items.ItemNesting !== "") {
        if (p_items.ItemNesting == "W") {
            nesting_val = p_items.OrgNW;
        } else if (p_items.ItemNesting == "H") {
            nesting_val = p_items.OrgNH;
        } else if (p_items.ItemNesting == "D") {
            nesting_val = p_items.OrgND;
        }
    }
    var [select_width, select_height, select_depth] = get_select_dim(p_items);
    p_items.WChanged = "N";
    p_items.HChanged = "N";
    p_items.DChanged = "N";
    //this below function will reset item to new dimension and validate, crush and capping based on the new dimension and will validate
    //if passed then it will return values for proceeding.
    if (select_width > 0) {
        var [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(p_module_index, p_shelf_index, p_item_index, select_width, select_height, select_depth, p_items.ItemNesting, nesting_val, p_items.BHoriz, p_items.BVert, p_items.BaseD, p_items.Orientation, p_items.OrgCWPerc, p_items.OrgCHPerc, p_items.OrgCDPerc, "N", "Y", "N", p_pog_index);
    } else {
        var item_width = p_items.W,
            item_height = p_items.H,
            item_depth = p_items.D,
            real_width = p_items.RW,
            real_height = p_items.RH,
            real_depth = p_items.RD;
        var select_width = p_items.OW,
            select_height = p_items.OH,
            select_depth = p_items.OD;
    }
    if (item_width !== "ERROR") {
        success_ind = "Y";
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].DimUpdate = "Y";
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OW = select_width;
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OH = select_height;
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OD = select_depth;

        update_item_org_dim(p_module_index, p_shelf_index, p_item_index, item_width, item_height, item_depth, real_width, real_height, real_depth, p_pog_index);

        var [itemx, itemy] = get_item_xy(shelfs, p_items, item_width, item_height, p_pog_index);
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "BASKET" && g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Item == "DIVIDER") {
            console.log("Divider");
        } else {
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y = itemy;
        }
    }
    if (success_ind != "Y") {
        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(p_items.ObjID);
        selectedObject.WireframeObj.material.color.setHex(g_dim_error_color);
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].DimUpdate = "E";
        selectedObject.DimUpdate = "E";
        selectedObject.BorderColour = g_dim_error_color;
    }
    logDebug("function : after  color  " + p_item_code, "E");
    return success_ind;
}

//this function will check all the item present in whole POG for the item which has dim mismatch and it will correct the dimension recreate all 
//same items in whole POG. 
async function org_dim_update_items(p_module_index, p_shelf_index, p_item_index, p_item_code, p_exclude_item, p_pog_index) {
    logDebug("function : org_dim_update_items; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; item_code : " + p_item_code + "; exclude_item : " + p_exclude_item, "S");
    try {
        var i = 0;
        var valid_pass = "Y";
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        for (const modules of module_details) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var l_shelf_details = modules.ShelfInfo;
                var j = 0;
                for (const shelfs of l_shelf_details) {
                    var shelf_updated = "N";
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                        if (shelfs.ItemInfo.length > 0) {
                            var item_Details = shelfs.ItemInfo;
                            var k = 0;
                            var proceed = "Y";
                            var recreate = "N";
                            for (const items of item_Details) {
                                if (i == p_module_index && j == p_shelf_index && p_exclude_item == "Y") {
                                    proceed = "N";
                                }
                                if (items.Item !== "DIVIDER" && items.Item == p_item_code) {
                                    shelf_updated = "Y";
                                    var nesting_val = 0;
                                    if (items.ItemNesting !== "") {
                                        if (items.ItemNesting == "W") {
                                            nesting_val = items.OrgNW;
                                        } else if (items.ItemNesting == "H") {
                                            nesting_val = items.OrgNH;
                                        } else if (items.ItemNesting == "D") {
                                            nesting_val = items.OrgND;
                                        }
                                    }
                                    var [select_width, select_height, select_depth] = get_select_dim(items);
                                    items.WChanged = "N";
                                    items.HChanged = "N";
                                    items.DChanged = "N";
                                    if (select_width > 0) {
                                        var [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(i, j, k, select_width, select_height, select_depth, items.ItemNesting, nesting_val, items.BHoriz, items.BVert, items.BaseD, items.Orientation, items.OrgCWPerc, items.OrgCHPerc, items.OrgCDPerc, "N", "Y", "N", p_pog_index);
                                    } else {
                                        var item_width = items.W,
                                            item_height = items.H,
                                            item_depth = items.D,
                                            real_width = items.RW,
                                            real_height = items.RH,
                                            real_depth = items.RD;
                                        var select_width = items.OW,
                                            select_height = items.OH,
                                            select_depth = items.OD;
                                    }
                                    if (item_width !== "ERROR") {
                                        recreate = "Y";
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DimUpdate = "Y";
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OW = select_width;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OH = select_height;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OD = select_depth;
                                        update_item_org_dim(i, j, k, item_width, item_height, item_depth, real_width, real_height, real_depth, p_pog_index);

                                        var [itemx, itemy] = get_item_xy(shelfs, items, item_width, item_height, p_pog_index);

                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Y = itemy;
                                    } else {
                                        var selectedObject = g_world.getObjectById(items.ObjID);
                                        selectedObject.WireframeObj.material.color.setHex(g_dim_error_color);
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DimUpdate = "E";
                                        selectedObject.DimUpdate = "E";
                                        selectedObject.BorderColour = g_dim_error_color;
                                        valid_pass = "N";
                                    }
                                }
                                k = k + 1;
                            }
                            if (proceed == "Y" && recreate == "Y") {
                                if (reorder_items(i, j, p_pog_index)) {
                                    var return_val = await recreate_all_items(i, j, shelfs.ObjType, "Y", -1, -1, shelfs.ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), 'Y'); //ASA-1350 issue 6 added parameters
                                }
                            }
                        }
                    }
                    j = j + 1;
                }
            }
            i = i + 1;
        }
        render(p_pog_index);
        logDebug("function : org_dim_update_items", "E");
        return valid_pass;
    } catch (err) {
        error_handling(err);
    }
}

function update_item_org_dim(p_module_index, p_shelf_index, p_item_index, p_item_width, p_item_height, p_item_depth, p_real_width, p_real_height, p_real_depth, p_pog_index) {
    logDebug("function : update_item_org_dim; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; item_width : " + p_item_width + "; item_height : " + p_item_height + "; item_depth : " + p_item_depth + "; real_width : " + p_real_width + "; real_height : " + p_real_height + "; real_depth : " + p_real_depth, "S");
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].UW = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgUW;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].UH = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgUH;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].UD = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgUD;

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CW = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCW;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CH = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCH;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CD = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCD;

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].TW = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgTW;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].TH = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgTH;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].TD = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgTD;

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].DW = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgDW;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].DH = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgDH;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].DD = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgDD;

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CWPerc = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCWPerc;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CHPerc = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCHPerc;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CDPerc = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCDPerc;

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].NW = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgNW;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].NH = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgNH;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].ND = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgND;

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CnW = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCnW;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CnH = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCnH;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CnD = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCnD;

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OldNW = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgNW;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OldNH = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgNH;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OldND = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgND;

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OldCnW = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCnW;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OldCnH = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCnH;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OldCnD = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OrgCnD;
    if (p_item_width > 0 && p_item_height > 0) {
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W = p_item_width;
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H = p_item_height;
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D = p_item_depth;
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RW = p_real_width;
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RH = p_real_height;
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RD = p_real_depth;
    }
    logDebug("function : update_item_org_dim", "E");
}

function update_carpark_item_values(p_module_index, p_item_index, p_pog_index) {
    logDebug("function : update_carpark_item_values; p_module_index : " + p_module_index + "; i_item_index : " + p_item_index, "S");
    var l_items_details = sessionStorage.getItem("items_details") !== null ? JSON.parse(sessionStorage.getItem("items_details")) : {};
    var ItemInfo = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[0].ItemInfo[p_item_index];
    ItemInfo.W = l_items_details.OrgUW;
    ItemInfo.RW = l_items_details.RW;
    ItemInfo.OW = l_items_details.RW;
    ItemInfo.UW = l_items_details.UW;
    ItemInfo.H = l_items_details.OrgUH;
    ItemInfo.RH = l_items_details.RH;
    ItemInfo.OH = l_items_details.OH;
    ItemInfo.UH = l_items_details.UH;
    ItemInfo.D = l_items_details.OrgUD;
    ItemInfo.RD = l_items_details.RD;
    ItemInfo.OD = l_items_details.OD;
    ItemInfo.UD = l_items_details.UD;
    ItemInfo.Color = l_items_details.Color;
    ItemInfo.PegID = l_items_details.PegID;
    ItemInfo.LocID = l_items_details.LocID;
    ItemInfo.PegSpread = l_items_details.PegSpread;
    ItemInfo.PegPerFacing = l_items_details.PegPerFacing;
    ItemInfo.BsktFactor = l_items_details.BsktFactor;
    ItemInfo.OverHang = l_items_details.OverHang;
    ItemInfo.HorizGap = l_items_details.HorizGap;
    ItemInfo.VertGap = l_items_details.VertGap;
    ItemInfo.Price = l_items_details.Price;
    ItemInfo.Cost = l_items_details.Cost;
    ItemInfo.RegMovement = l_items_details.RegMovement;
    ItemInfo.AvgSales = l_items_details.AvgSales;
    ItemInfo.ItemStatus = l_items_details.ItemStatus;
    ItemInfo.CDTLvl1 = l_items_details.CDTLvl1; //ASA-1130
    ItemInfo.CDTLvl2 = l_items_details.CDTLvl2; //ASA-1130
    ItemInfo.CDTLvl3 = l_items_details.CDTLvl3; //ASA-1130
    ItemInfo.StoreCnt = l_items_details.StoreCnt; //ASA-1130
    ItemInfo.WeeksOfInventory = l_items_details.WeeksOfInventory; //ASA-1130
    ItemInfo.MoveBasis = l_items_details.MoveBasis;
    ItemInfo.Orientation = l_items_details.Orientation;
    ItemInfo.OrientationDesc = l_items_details.OrientationDesc;
    //ASA-1640 Start
    ItemInfo.ItemCondition = l_items_details.ItemCondition;
    ItemInfo.AUR = l_items_details.AUR;
    ItemInfo.ItemRanking = l_items_details.ItemRanking;
    ItemInfo.WeeklySales = l_items_details.WeeklySales;
    ItemInfo.WeeklyNetMargin = l_items_details.WeeklyNetMargin;
    ItemInfo.WeeklyQty = l_items_details.WeeklyQty;
    ItemInfo.NetMarginPercent = l_items_details.NetMarginPercent;
    ItemInfo.CumulativeNM = l_items_details.CumulativeNM;
    ItemInfo.TOP80B2 = l_items_details.TOP80B2;
    ItemInfo.ItemBrandC = l_items_details.ItemBrandC;
    ItemInfo.ItemPOGDept = l_items_details.ItemPOGDept;
    ItemInfo.ItemRemark = l_items_details.ItemRemark;
    ItemInfo.RTVStatus = l_items_details.RTVStatus;
    ItemInfo.Pusher = l_items_details.Pusher;
    ItemInfo.Divider = l_items_details.Divider;
    ItemInfo.BackSupport = l_items_details.BackSupport;
    //ASA-1640 End
    ItemInfo.OOSPerc = l_items_details.OOSPerc; //ASA-1688 Added for oos%
    ItemsInfo.InitialItemDesc = l_items_details.InitialItemDesc; //ASA-1734 Issue 1
    ItemsInfo.InitialBrand = l_items_details.InitialBrand; //ASA-1787 Request #6
    ItemsInfo.InitialBarcode = l_items_details.InitialBarcode; //ASA-1787 Request #6

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[0].ItemInfo[p_item_index] = ItemInfo;
    logDebug("function : update_carpark_item_values", "E");
    return "SUCCESS";
}

//When edit carpark items this function is called.
async function edit_carpark_items(p_item_index, p_pog_index) {
    logDebug("function : edit_carpark_items; i_item_index : " + p_item_index, "S");
    var items = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[p_item_index];
    var total_width = parseFloat($v("P193_ITEM_WIDTH")) / 100;
    var shelfs = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0];
    var j = 0;
    for (const item_info of shelfs.ItemInfo) {
        if (j !== p_item_index) {
            var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].Orientation, item_info.W, item_info.H, item_info.D);
            total_width += item_width;
        }
        j++;
    }

    if (total_width > shelfs.W) {
        alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfs.Shelf));
        logDebug("function : edit_carpark_items");
        return false;
    } else {
        var returnval = update_carpark_item_values(g_module_index, p_item_index, p_pog_index);
        var j = 0;
        for (const item_info of g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo) {
            var orientation = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].Orientation;
            if (p_item_index == j) {
                var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(orientation, item_info.W, item_info.H, item_info.D);
            } else {
                item_width = item_info.W;
                item_height = item_info.H;
                item_depth = item_info.D;
            }
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].W = item_width;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].H = item_height;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].D = item_depth;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].RW = item_width;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].RH = item_height;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].RD = item_depth;
            if (j == 0) {
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].X = shelfs.X - shelfs.W / 2 + item_width / 2;
            } else {
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].X = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j - 1].X + g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j - 1].W / 2 + item_width / 2;
            }
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].Y = shelfs.Y + shelfs.H / 2 + item_height / 2;
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item_info.ObjID);
            g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);

            var details = g_orientation_json[item_info.Orientation];
            var details_arr = details.split("###");

            var objID = await add_carpark_item(item_info.ItemID, item_info.W, item_info.H, item_info.D, item_info.Color, item_info.X, item_info.Y, item_info.Z, g_module_index, 0, j, "Y", "N", g_show_live_image, parseInt(details_arr[1]), p_pog_index);
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[j].ObjID = objID;
            j = j + 1;
        }
        render(p_pog_index);
        animate_all_pog(); //ASA-1418_27916
        g_dblclick_opened = "N";
        $s("P193_ITEM_EDIT_IND", "N");
        logDebug("function : edit_carpark_items", "E");
        return true;
    }
}

//setting master data in each iteminfo which match the item had dimension mismatch.
function set_dim_change_values(p_dim_details, p_item_code, p_pog_index) {
    try {
        logDebug("function : set_dim_change_values dim_details: " + p_dim_details + "item_code: " + p_item_code, "S");
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var i = 0;
        if (g_carpark_item_flag == "N") {
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
                                    if (items.Item !== "DIVIDER" && items.Item == p_item_code) {
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgUW = p_dim_details["U"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgUH = p_dim_details["U"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgUD = p_dim_details["U"][2];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgTW = p_dim_details["T"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgTH = p_dim_details["T"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgTD = p_dim_details["T"][2];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgDW = p_dim_details["D"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgDH = p_dim_details["D"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgDD = p_dim_details["D"][2];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCW = p_dim_details["C"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCH = p_dim_details["C"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCD = p_dim_details["C"][2];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCWPerc = p_dim_details["R"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCHPerc = p_dim_details["R"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCDPerc = p_dim_details["R"][2];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCnW = p_dim_details["O"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCnH = p_dim_details["O"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgCnD = p_dim_details["O"][2];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgNW = p_dim_details["N"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgNH = p_dim_details["N"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].OrgND = p_dim_details["N"][2];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].CnW = p_dim_details["O"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].CnH = p_dim_details["O"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].CnD = p_dim_details["O"][2];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].NW = p_dim_details["N"][0];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].NH = p_dim_details["N"][1];
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].ND = p_dim_details["N"][2];
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
                    if (typeof modules.Carpark[0] !== "undefined") {
                        var item_details = modules.Carpark[0].ItemInfo;
                        var j = 0;
                        for (const items of item_details) {
                            if (items.Item == p_item_code) {
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgUW = p_dim_details["U"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgUH = p_dim_details["U"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgUD = p_dim_details["U"][2];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgTW = p_dim_details["T"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgTH = p_dim_details["T"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgTD = p_dim_details["T"][2];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgDW = p_dim_details["D"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgDH = p_dim_details["D"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgDD = p_dim_details["D"][2];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCW = p_dim_details["C"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCH = p_dim_details["C"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCD = p_dim_details["C"][2];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCWPerc = p_dim_details["R"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCHPerc = p_dim_details["R"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCDPerc = p_dim_details["R"][2];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCnW = p_dim_details["O"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCnH = p_dim_details["O"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgCnD = p_dim_details["O"][2];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgNW = p_dim_details["N"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgNH = p_dim_details["N"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].OrgND = p_dim_details["N"][2];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].CnW = p_dim_details["O"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].CnH = p_dim_details["O"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].CnD = p_dim_details["O"][2];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].NW = p_dim_details["N"][0];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].NH = p_dim_details["N"][1];
                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[j].ND = p_dim_details["N"][2];
                            }

                            j = j + 1;
                        }
                    }
                }
                i = i + 1;
            }
        }
        logDebug("function : set_dim_change_values", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is used to get the item image when edit item and change orientation.
async function get_edit_item_img(p_ModuleIndex, p_ShelfIndex, p_ItemIndex, p_items, p_Orientation, p_Merchstyle, p_pog_index) {
    facing_edit = "N";
    var img_index = -1;
    var img_exists = "N";
    var item_exists = "N";
    var item_code = p_items.Item;
    var details = g_orientation_json[p_Orientation];
    var details_arr = details.split("###");
    var j = 0;
    for (const images_arr of g_ItemImages) {
        if (item_code == images_arr.Item && details_arr[0] == images_arr.Orientation && p_Merchstyle == images_arr.MerchStyle) {
            img_index = j;
            break; //return false;
        }
        j++;
    }
    var module_details = g_pog_json[p_pog_index].ModuleInfo;
    var i = 0;
    for (modules of module_details) {
        if (item_exists == "Y") {
            break; //return false;
        }
        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
            if (modules.ShelfInfo.length > 0) {
                var j = 0;
                for (const shelfs of modules.ShelfInfo) {
                    if (item_exists == "Y") {
                        break; //return false;
                    }
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                        var k = 0;
                        for (const items_info of shelfs.ItemInfo) {
                            if (items_info.Orientation == details_arr[0] && items_info.Item == item_code && p_items.ObjID !== items_info.ObjID) {
                                item_exists = "Y";
                                break; //return false;
                            }
                            k++;
                        }
                    }
                    j++;
                }
            }
        }
        i++;
    }

    if (img_exists == "N") {
        ItemImageInfo = {};

        if (img_index !== -1 && item_exists == "N") {
            var return_val = await call_ajax(p_ModuleIndex, p_ShelfIndex, p_ItemIndex, details_arr[0], img_index, item_code, p_Merchstyle, parseFloat($v("P193_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P193_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P193_IMAGE_COMPRESS_RATIO")));
        } else {
            ItemImageInfo["Item"] = p_items.Item;
            ItemImageInfo["MIndex"] = p_ModuleIndex;
            ItemImageInfo["SIndex"] = p_ShelfIndex;
            ItemImageInfo["IIndex"] = p_ItemIndex;
            ItemImageInfo["Orientation"] = details_arr[0];
            ItemImageInfo["MerchStyle"] = p_Merchstyle;
            ItemImageInfo["ItemImage"] = null;
            g_ItemImages.push(ItemImageInfo);
            var return_val = await call_ajax(p_ModuleIndex, p_ShelfIndex, p_ItemIndex, details_arr[0], g_ItemImages.length - 1, item_code, p_Merchstyle, parseFloat($v("P193_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P193_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P193_IMAGE_COMPRESS_RATIO")));
        }
    }
}


function get_spread_gap(p_spread_product, p_module_index, p_shelf_index) {
    logDebug("function : get_spread_gap; spread_product : " + p_spread_product + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
    var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
    var horiz_gap = shelfdtl.HorizGap;
    var p_spread_product = shelfdtl.SpreadItem;
    var total_item_width = 0,
        spread_gap = 0,
        item_cnt = 0,
        items_arr = [];
    var i = 0;
    if (horiz_gap > 0) {
        spread_gap = horiz_gap;
    } else {
        if (p_spread_product == "E") {
            for (const items of shelfdtl.ItemInfo) {
                total_item_width += items.W;
                item_cnt = item_cnt + 1;
                shelfdtl.ItemInfo[i].W = shelfdtl.ItemInfo[i].OW * items.BHoriz;
                i++;
            }

            spread_gap = (shelfdtl.W + shelfdtl.LOverhang + shelfdtl.ROverhang - total_item_width) / (item_cnt - 1);
        } else if (p_spread_product == "F") {
            var items_arr = shelfdtl.ItemInfo;
            var i = 0;
            for (const items of items_arr) {
                total_item_width += items.OW * items.BHoriz;
                item_cnt = item_cnt + items.BHoriz;
                i++;
            }

            spread_gap = (shelfdtl.W + shelfdtl.LOverhang + shelfdtl.ROverhang - total_item_width) / (item_cnt - 1);
            var i = 0;
            for (const items of items_arr) {
                if (items.BHoriz > 1) {
                    shelfdtl.ItemInfo[i].W = shelfdtl.ItemInfo[i].OW * items.BHoriz + spread_gap * (items.BHoriz - 1);
                }
                i++;
            }
        }
    }
    logDebug("function : get_spread_gap", "E");
    return spread_gap;
}

//This function is not used anywhere currently. we can remove after confirmation.
async function recreate_multi_items(p_module_index, p_shelf_index, p_shelf_obj_type, p_edit_ind, p_locationX, p_edit_item_index, p_item_length, p_fresh_item, p_shelf_edit, p_items, p_pog_index) {
    logDebug("function : recreate_multi_items; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; shelf_obj_type : " + p_shelf_obj_type + "; p_edit_ind : " + p_edit_ind + "; locationX : " + p_locationX + "; edit_item_index : " + p_edit_item_index + "; item_length : " + p_item_length + "; shelf_edit : " + p_shelf_edit, "S");
    try {
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var spread_gap = shelfdtl.HorizGap;
        var horiz_gap = spread_gap;
        var spread_product = shelfdtl.SpreadItem;
        var combine_ind = shelfdtl.Combine;
        var rotation = shelfdtl.Rotation;
        var shelf_start_X = shelfdtl.X - shelfdtl.W / 2;
        var shelf_start_Y = shelfdtl.Y - shelfdtl.H / 2;
        var total_item_width = 0,
            items_arr = [];
        var finalX = 0;

        if (typeof p_items !== "undefined") {
            var items_arr = p_items;
        } else {
            var items_arr = shelfdtl.ItemInfo;
        }

        var item_cnt = items_arr.length;
        var i = 0;

        for (const items of items_arr) {
            var selectedObject = g_world.getObjectById(items.ObjID);
            g_world.remove(selectedObject);
            total_item_width += items.W;
            i++;
        }
        if (p_shelf_obj_type == "SHELF") {
            shelfdtl.AvlSpace = wpdSetFixed(shelfdtl.W + shelfdtl.LOverhang + shelfdtl.ROverhang);
        }
        render(p_pog_index);

        if (spread_product == "R") {
            var items_arr = shelfdtl.ItemInfo;
            for (var i = items_arr.length - 1; i >= 0; i--) {
                item_cnt = item_cnt - 1;
                finalX = get_item_xaxis(items_arr[i].W, items_arr[i].H, items_arr[i].D, p_shelf_obj_type, p_locationX, horiz_gap, spread_product, spread_gap, p_module_index, p_shelf_index, item_cnt, p_edit_ind, shelfdtl.ItemInfo.length, p_shelf_edit, p_pog_index);
                if (items_arr[i].Item == "DIVIDER") {
                    var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
                    var div_index = -1;
                    var ShelfInfo = {};
                    var j = 0;
                    for (const shelfs of shelf_arr) {
                        if (shelfs.Shelf == items_arr[i].ItemID && shelfs.ObjType == "DIVIDER") {
                            div_index = j;
                        }
                        j++;
                    }
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].X = finalX;
                }

                shelfdtl.ItemInfo[item_cnt].Distance = finalX - items_arr[i].W / 2 - shelf_start_X;
                if (shelfdtl.ObjType == "PEGBOARD") {
                    shelfdtl.ItemInfo[item_cnt].PegBoardX = finalX - items_arr[i].W / 2 - shelf_start_X;
                    shelfdtl.ItemInfo[item_cnt].PegBoardY = shelfdtl.ItemInfo[item_cnt].Y - items_arr[i].H / 2 - shelf_start_Y;
                    shelfdtl.ItemInfo[item_cnt].FromProductList = "N";
                }
                shelfdtl.ItemInfo[item_cnt].OldObjID = items_arr[i].ObjID;
                var old_obj_id = items_arr[i].ObjID;

                if (g_show_live_image == "Y" && items_arr[i].Item !== "DIVIDER") {
                    var details = g_orientation_json[shelfdtl.ItemInfo[item_cnt].Orientation];
                    var details_arr = details.split("###");
                    var objID = await add_items_with_image(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, items_arr[i].BHoriz, items_arr[i].BVert, items_arr[i].Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", p_fresh_item, $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
                } else {
                    if (items_arr[i].Item == "DIVIDER") {
                        var objID = add_items(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, items_arr[i].Rotation, p_pog_index);
                    } else {
                        var objID = await add_items_prom(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, "N", p_fresh_item, $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
                    }
                }
                if (items_arr[i].DimUpdate == "E") {
                    var selectedObject = g_world.getObjectById(objID);
                    selectedObject.WireframeObj.material.color.setHex(0xff0000);
                }
                var l_final_z = 0;
                if (shelfdtl.ObjType == "PEGBOARD") {
                    l_final_z = shelfdtl.Z + shelfdtl.D / 2 + items_arr[i].D / 2;
                } else {
                    l_final_z = 0.001 + shelfdtl.D / 1000;
                }
                shelfdtl.ItemInfo[i].X = finalX;
                shelfdtl.ItemInfo[i].Z = l_final_z;
                shelfdtl.ItemInfo[i].ObjID = objID;
                shelfdtl.ItemInfo[i].CType = shelfdtl.ObjType;

                if ((typeof items_arr[i].TopObjID !== "undefined" && items_arr[i].TopObjID !== "") || (typeof items_arr[i].BottomObjID !== "undefined" && items_arr[i].BottomObjID !== "")) {
                    var tier_ind;
                    if (items_arr[i].TopObjID !== "" && typeof items_arr[i].TopObjID !== "undefined") {
                        tier_ind = "BOTTOM";
                    } else {
                        tier_ind = "TOP";
                    }
                    var returnval = reset_top_bottom_obj_id(tier_ind, old_obj_id, objID, finalX, "N", p_pog_index);
                }

                if (items_arr[i].Item == "DIVIDER") {
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].ShelfDivObjID = objID;
                }
            }
        } else {
            var i = 0;
            var items_arr = shelfdtl.ItemInfo;
            for (const items of items_arr) {
                finalX = get_item_xaxis(items.W, items.H, items.D, p_shelf_obj_type, p_locationX, horiz_gap, spread_product, spread_gap, p_module_index, p_shelf_index, i, p_edit_ind, shelfdtl.ItemInfo.length, p_shelf_edit, p_pog_index);
                if (items.Item == "DIVIDER") {
                    var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
                    var div_index = -1;
                    var ShelfInfo = {};
                    var j = 0;
                    for (const shelfs of shelf_arr) {
                        //$.each(shelf_arr, function (j, shelfs) {
                        if (shelfs.Shelf == items.ItemID && shelfs.ObjType == "DIVIDER") {
                            div_index = j;
                        }
                        // });
                        j++;
                    }
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].X = finalX;
                }
                shelfdtl.ItemInfo[i].Distance = finalX - items.W / 2 - shelf_start_X;
                if (shelfdtl.ObjType == "PEGBOARD") {
                    shelfdtl.ItemInfo[i].PegBoardX = finalX - items.W / 2 - shelf_start_X;
                    shelfdtl.ItemInfo[i].PegBoardY = shelfdtl.ItemInfo[i].Y - items.H / 2 - shelf_start_Y;
                    shelfdtl.ItemInfo[i].FromProductList = "N";
                }
                shelfdtl.ItemInfo[i].OldObjID = items.ObjID;
                var old_obj_id = items.ObjID;
                if (g_show_live_image == "Y" && items.Item !== "DIVIDER") {
                    var details = g_orientation_json[shelfdtl.ItemInfo[i].Orientation];
                    var details_arr = details.split("###");
                    var objID = await add_items_with_image(items.ItemID, items.W, items.H, items.D, items.Color, finalX, shelfdtl.ItemInfo[i].Y, "", p_module_index, p_shelf_index, i, items.BHoriz, items.BVert, items.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", p_fresh_item, $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
                } else {
                    if (items.Item == "DIVIDER") {
                        var objID = add_items(items.ItemID, items.W, items.H, items.D, items.Color, finalX, items.Y, "", p_module_index, p_shelf_index, i, items.Rotation, p_pog_index);
                    } else {
                        var objID = await add_items_prom(items.ItemID, items.W, items.H, items.D, items.Color, finalX, shelfdtl.ItemInfo[i].Y, "", p_module_index, p_shelf_index, i, "N", p_fresh_item, $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
                    }
                }
                if (items.DimUpdate == "E") {
                    var selectedObject = g_world.getObjectById(objID);
                    selectedObject.WireframeObj.material.color.setHex(0xff0000);
                }
                if (shelfdtl.ObjType == "PEGBOARD") {
                    l_final_z = shelfdtl.Z + shelfdtl.D / 2 + items.D / 2;
                } else {
                    l_final_z = 0.001 + shelfdtl.D / 1000;
                }

                shelfdtl.ItemInfo[i].X = finalX;
                shelfdtl.ItemInfo[i].Z = l_final_z;
                shelfdtl.ItemInfo[i].ObjID = objID;
                shelfdtl.ItemInfo[i].CType = shelfdtl.ObjType;
                if ((typeof items.TopObjID !== "undefined" && items.TopObjID !== "") || (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "")) {
                    var tier_ind;
                    if (items.TopObjID !== "" && typeof items.TopObjID !== "undefined") {
                        tier_ind = "BOTTOM";
                    } else {
                        tier_ind = "TOP";
                    }
                    var returnval = reset_top_bottom_obj_id(tier_ind, old_obj_id, objID, finalX, "N", p_pog_index);
                }

                if (items.Item == "DIVIDER") {
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].ShelfDivObjID = objID;
                }
                i = i + 1;
            }
        }
        async function doSomething() {
            var res = await update_undo_redo_objID(g_pog_json); //yograj
            //}
        }
        doSomething();

        var items_arr = shelfdtl.ItemInfo;
        i = 0;
        for (const items of items_arr) {
            if ((typeof items.TopObjID !== "undefined" && items.TopObjID !== "") || (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "")) {
                var tier_ind;
                if (items.TopObjID !== "" && typeof items.TopObjID !== "undefined") {
                    tier_ind = "BOTTOM";
                } else {
                    tier_ind = "TOP";
                }
                var returnval = reset_top_bottom_obj_id(tier_ind, items.OldObjID, items.ObjID, items.X, "Y", p_pog_index);
            }
            i = i + 1;
        }
        if (shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "PALLET") {
            var returnval = reset_top_bottom_objects(p_module_index, p_shelf_index, "N", p_pog_index);
        }

        //  }
        render(p_pog_index);
        g_item_edit_flag = "";
        g_item_index = "";
        logDebug("function : recreate_multi_items", "E");
        return finalX;
    } catch (err) {
        error_handling(err);
    }
}

//getting the space between the shelfs. to validate the items height or to increase vertical facings.
function get_max_merch(p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_locationX, p_pog_index) {
    logDebug("function : get_max_merch; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; p_edit_ind : " + p_edit_ind + "; locationX : " + p_locationX, "S");
    try {
        var l_max_merch = 0;
        var basket_height = 0;
        var l_first_max = 0;
        var l_min_merch = 0;
        var itemstart = -1;
        var itemend = -1;
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var l_object_type = shelfdtl.ObjType;
        var rotation = shelfdtl.Rotation;
        var slope = shelfdtl.Slope;
        if (p_item_index !== -1) {
            var depth_gap = wpdSetFixed(shelfdtl.D - shelfdtl.ItemInfo[p_item_index].RD / shelfdtl.ItemInfo[p_item_index].BaseD);
        } else {
            var depth_gap = wpdSetFixed(shelfdtl.D + 2);
        }

        if (rotation !== 0 || slope !== 0) {
            var shelf_start = wpdSetFixed(shelfdtl.X - shelfdtl.ShelfRotateWidth / 2);//.toFixed(3));
            var shelf_end = wpdSetFixed(shelfdtl.X + shelfdtl.ShelfRotateWidth / 2);//.toFixed(3));
        } else {
            var shelf_start = wpdSetFixed(shelfdtl.X - shelfdtl.W / 2);//.toFixed(3));
            var shelf_end = wpdSetFixed(shelfdtl.X + shelfdtl.W / 2);//.toFixed(3));
        }

        if (shelfdtl.MaxMerch !== 0 && l_object_type !== "HANGINGBAR") {
            l_first_max = shelfdtl.MaxMerch;
        }
        var shelf_y = wpdSetFixed(shelfdtl.Y + shelfdtl.H / 2);

        var min_distance_arr = [];
        var l_max_merch = 0;
        if (l_object_type == "CHEST" || l_object_type == "BASKET") {
            basket_height = shelfdtl.BsktWallH;
        }
        if (p_item_index !== -1 && p_locationX !== -1) {
            var item_start = wpdSetFixed(p_locationX - shelfdtl.ItemInfo[p_item_index].W / 2);
            var item_end = wpdSetFixed(p_locationX + shelfdtl.ItemInfo[p_item_index].W / 2);
        }

        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length > 1) {
            if (l_object_type == "PEGBOARD") {
                min_distance_arr.push(shelfdtl.H + shelfdtl.LOverhang);
            } else if (l_object_type == "HANGINGBAR") {
                shelf_y = shelfdtl.Y;
                var i = 0;
                for (const Shelf of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                    if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                        var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.ShelfRotateWidth / 2);//.toFixed(3));
                        var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.ShelfRotateWidth / 2);//.toFixed(3));
                    } else {
                        var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.W / 2);//.toFixed(3));
                        var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.W / 2);//.toFixed(3));
                    }
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                        if (((((item_start >= div_shelf_start && item_start < div_shelf_end) || (item_end <= div_shelf_end && item_end > div_shelf_start)) && p_locationX !== -1) || p_locationX == -1) && p_shelf_index !== i && Shelf.Y + Shelf.H / 2 < shelf_y && ((div_shelf_end > shelf_start && div_shelf_start <= shelf_start) || (div_shelf_start < shelf_end && div_shelf_start >= shelf_start))) {
                            if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                                min_distance_arr.push(wpdSetFixed(shelf_y - (Shelf.Y + Shelf.ShelfRotateHeight)));//.toFixed(4)));
                            } else {
                                min_distance_arr.push(wpdSetFixed(shelf_y - (Shelf.Y + Shelf.H / 2)));//.toFixed(4)));
                            }
                        }
                    }
                    i++;
                }
            } else {
                var i = 0;
                for (const Shelf of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                        if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                            var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.ShelfRotateWidth / 2);//.toFixed(3));
                            var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.ShelfRotateWidth / 2);//.toFixed(3));
                        } else {
                            var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.W / 2);//.toFixed(3));
                            var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.W / 2);//.toFixed(3));
                        }
                        if (((((item_start >= div_shelf_start && item_start < div_shelf_end) || (item_end <= div_shelf_end && item_end > div_shelf_start)) && p_locationX !== -1) || p_locationX == -1) && p_shelf_index !== i && Shelf.Y - Shelf.H / 2 >= shelf_y && ((div_shelf_end > shelf_start && div_shelf_start <= shelf_start) || (div_shelf_start < shelf_end && div_shelf_start >= shelf_start)) && Shelf.D > depth_gap) {
                            if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                                min_distance_arr.push(wpdSetFixed(Shelf.Y - Shelf.ShelfRotateHeight / 2 - shelf_y));//.toFixed(4)));
                            } else {
                                min_distance_arr.push(wpdSetFixed(Shelf.Y - Shelf.H / 2 - shelf_y));//.toFixed(4)));
                            }
                        }
                    }
                    i++;
                }
            }
            if (min_distance_arr.length == 0) {
                l_max_merch = g_pog_json[p_pog_index].ModuleInfo[p_module_index].H + g_pog_json[p_pog_index].BaseH - shelf_y + 5;
            } else {
                l_max_merch = Math.min.apply(Math, min_distance_arr);
            }
        } else {
            l_max_merch = g_pog_json[p_pog_index].ModuleInfo[p_module_index].H - shelf_y + 5;
        }

        if (l_object_type == "CHEST" || l_object_type == "BASKET") {
            var basket_items = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
            var shelfY = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2;
            var diffY = 0;
            var dividerFound = "N";
            for (var items of basket_items) {
                if (items.Item == "DIVIDER") {
                    diffY = items.Y - items.H / 2 - shelfY;
                    dividerFound = "Y";
                }
            }
            if ((l_max_merch < basket_height && basket_height > 0) || basket_height == 0) {
                l_min_merch = l_max_merch;
            } else {
                l_min_merch = basket_height;
            }
            if (dividerFound == "Y" && diffY > 0) {
                l_min_merch = diffY;
            }
        } else {
            if ((l_max_merch < l_first_max && l_first_max > 0) || l_first_max == 0) {
                l_min_merch = l_max_merch;
            } else {
                l_min_merch = l_first_max;
            }
        }
        logDebug("function : get_max_merch; p_module_index", "E");
        return wpdSetFixed(l_min_merch);//parseFloat(toFixed(l_min_merch, 3));
    } catch (err) {
        error_handling(err);
    }
}

//this function is called when the shelf is dragged and dropped in some place. this will check if any shelf is hit or not.
// p_auto_position_enbl added in ASA-1628 Issue 1
function validate_shelf_min_distance(p_curr_module, p_shelf_index, p_shelf_y, p_items_arr, p_allow_crush, p_module_index, p_shelf_x, p_alert_ind, p_shelfs, p_pog_index, p_auto_position_enbl = "N") {
    logDebug("function : validate_shelf_min_distance; curr_module : " + p_curr_module + "; p_shelf_index : " + p_shelf_index + "; shelf_y : " + p_shelf_y + "; allow_crush : " + p_allow_crush + "; p_module_index : " + p_module_index + "; shelf_x : " + p_shelf_x + "; alert_ind : " + p_alert_ind, "S");
    try {
        var l_object_type = p_shelfs.ObjType;
        var rotation = p_shelfs.Rotation;
        var slope = p_shelfs.Slope;
        var curr_shelf_height = p_shelfs.H;
        var curr_shelf_width = p_shelfs.W;//ASA-1628  Issue  5
        var shelf_obj_id = p_shelfs.SObjID;

        if (rotation !== 0 || slope !== 0) {
            var shelf_start = wpdSetFixed(p_shelf_x - p_shelfs.ShelfRotateWidth / 2);
            var shelf_end = wpdSetFixed(p_shelf_x + p_shelfs.ShelfRotateWidth / 2);
            var shelf_top = wpdSetFixed(p_shelf_y + p_shelfs.ShelfRotateHeight / 2);
            var shelf_bottom = wpdSetFixed(p_shelf_y - p_shelfs.ShelfRotateHeight / 2);
            curr_shelf_width = p_shelfs.ShelfRotateWidth;
            curr_shelf_height = p_shelfs.ShelfRotateHeight;
        } else {
            var shelf_start = wpdSetFixed(p_shelf_x - p_shelfs.W / 2);
            var shelf_end = wpdSetFixed(p_shelf_x + p_shelfs.W / 2);
            var shelf_top = wpdSetFixed(p_shelf_y + p_shelfs.H / 2);
            var shelf_bottom = wpdSetFixed(p_shelf_y - p_shelfs.H / 2);
        }
        var l_max_merch = 0;
        var low_merch = 0;
        var validate_passed = "Y";
        var min_distance_arr = [];
        var low_distance_arr = [];
        var item_height_arr = [];
        var item_index_arr = [];
        var shelf_index_arr = [];
        var shelf_index_arr_dwn = [];
        var crush_index_arr = [];
        var item_crush_ind = "N";
        var shelf_hit = "N";
        var j = 0;
        var currCombination = [];
        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, p_shelfs.Shelf);
        if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
            currCombination = g_combinedShelfs[currCombinationIndex];
        }
        var pegboard_inside = "N";
        //this is a logic where we will allow a shelf to be dragged inside a pegboard and drop it there.
        //we expect it will be placed inside pegboard.
        if ($v("P193_POGCR_DRAG_SHELF_IN_PEGBOARD") == "Y" && p_shelfs.ObjType == "SHELF") {
            var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo;
            var i = 0;
            var valid = "Y";
            for (const shelf of shelfInfo) {
                // if (shelf.ObjType == "PEGBOARD" && shelf.ObjType == "SHELF") { //ASA-1262 Prasanna   //ASA-1544
                if (shelf.ObjType == "PEGBOARD" && l_object_type == "SHELF") { //ASA-1262 Prasanna      //ASA-1544

                    var peg_top = wpdSetFixed(shelf.Y + shelf.H / 2);
                    var peg_bottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                    var peg_start = wpdSetFixed(shelf.X - shelf.W / 2);
                    var peg_end = wpdSetFixed(shelf.X + shelf.W / 2);
                    if (peg_top >= shelf_top && shelf_bottom >= peg_bottom && shelf_start >= peg_start && peg_end >= shelf_end) {
                        pegboard_inside = "Y";
                        // valid = validate_shelf_inside_pegboard(p_curr_module, p_shelf_index, p_pog_index, shelf_x, shelf_y, shelf);      //ASA-1544
                        valid = validate_shelf_inside_pegboard(p_module_index, p_shelf_index, p_pog_index, p_shelf_x, p_shelf_y, shelf);    //ASA-1544
                        if (valid == "Y") {
                            break;
                        }
                    } else {
                        validate_passed = "N";
                    }
                    // } else if (shelf.ObjType == 'PEGBOARD' && shelf.ObjType == 'PEGBOARD') { //ASA-1262 Prasanna //ASA-1544
                } else if (shelf.ObjType == 'PEGBOARD' && l_object_type == 'PEGBOARD') { //ASA-1262 Prasanna    //ASA-1544
                    var peg_top = wpdSetFixed(shelf.Y + shelf.H / 2);
                    var peg_bottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                    var peg_start = wpdSetFixed(shelf.X - shelf.W / 2);
                    var peg_end = wpdSetFixed(shelf.X + shelf.W / 2);
                    if (peg_top >= shelf_top && shelf_bottom >= peg_bottom && shelf_start >= peg_start && peg_end >= shelf_end) {
                        pegboard_inside = "Y";
                        validate_passed = "N";
                        valid = 'N';
                        break;
                    } else {
                        valid = 'Y';
                    }
                } //end ASA-1262
                i++;
            }
            if (valid == "Y") {
                validate_passed = "Y";
            } else {
                validate_passed = "N";
                alert(get_message("ITEM_POSITION_OVERLAP", p_shelfs.Shelf));
            }
        } else if ($v("P193_POGCR_DRAG_SHELF_IN_PEGBOARD") == "Y" && p_shelfs.ObjType == 'PEGBOARD') { //ASA-1262 Prasanna
            validate_passed = 'Y';
            pegboard_inside = "Y";
        } else {
            validate_passed = "N";
        }

        if (pegboard_inside == "N") {
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (shelf_hit == "Y") {
                    break;
                }
                if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                    var k = 0;
                    for (const Shelf of Modules.ShelfInfo) {
                        if (shelf_hit == "Y") {
                            break;
                        }
                        if (typeof Shelf !== "undefined") {
                            if (Shelf.ObjType !== "TEXTBOX" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && shelf_obj_id !== Shelf.SObjID && Shelf.ObjType !== "CHEST" && ((p_curr_module == p_module_index && k !== p_shelf_index) || p_curr_module !== p_module_index)) { //Task_27734 existing issue. its validating with items in same shelf
                                var break_comb = 'N';
                                //first check if the shelf dragged is a combined shelf.
                                if (currCombination.length > 1) {
                                    for (var i = 0; i < currCombination.length - 1; i++) {
                                        if (Shelf.Shelf == currCombination[i].Shelf) {
                                            break_comb = 'Y';
                                            break;
                                        }
                                    }
                                }
                                if (break_comb == 'N') {
                                    //this will check if current shelf is hangingbar and any other shelf is hangingbar.
                                    // because items will be hanging and we should get lowest item hit the hanging bar below or not.
                                    if (l_object_type == "HANGINGBAR" && Shelf.ObjType == "HANGINGBAR") {
                                        if (Shelf.ItemInfo.length > 0) {
                                            var l = 0;
                                            for (const item_info of Shelf.ItemInfo) {
                                                if (shelf_hit == "Y") {
                                                    break;
                                                }
                                                var item_start = wpdSetFixed(item_info.X - item_info.W / 2);
                                                var item_end = wpdSetFixed(item_info.X + item_info.W / 2);
                                                var item_top = wpdSetFixed(item_info.Y + item_info.H / 2);
                                                var item_bottom = wpdSetFixed(item_info.Y - item_info.H / 2)
                                                var m = 0;
                                                for (const curr_item_info of p_shelfs.ItemInfo) {
                                                    var item_x, item_y;
                                                    if (p_shelfs.ObjType == "BASKET" && p_shelfs.BsktSpreadProduct == "BT") {
                                                        item_x = p_shelf_x - p_shelfs.W / 2 + curr_item_info.W / 2;
                                                        item_y = curr_item_info.Y;
                                                    } else if (p_shelfs.ObjType == "HANGINGBAR") {
                                                        item_x = p_shelf_x - p_shelfs.W / 2 + curr_item_info.Distance + curr_item_info.W / 2;
                                                        item_y = p_shelf_y - curr_item_info.H / 2;
                                                    } else if (p_shelfs.ObjType == "PEGBOARD" || (p_shelfs.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                                        item_x = p_shelf_x - p_shelfs.W / 2 + curr_item_info.PegBoardX + curr_item_info.W / 2;
                                                        item_y = curr_item_info.Y;
                                                    } else {
                                                        item_x = p_shelf_x - p_shelfs.W / 2 + curr_item_info.Distance + curr_item_info.W / 2;
                                                        item_y = p_shelf_y + p_shelfs.H / 2 + curr_item_info.H / 2;
                                                    }
                                                    var div_start = wpdSetFixed(item_x - curr_item_info.W / 2);
                                                    var div_end = wpdSetFixed(item_x + curr_item_info.W / 2);
                                                    var div_top = wpdSetFixed(item_y + curr_item_info.H / 2);
                                                    var div_bottom = wpdSetFixed(item_y - curr_item_info.H / 2);
                                                    if (
                                                        (((div_start < item_end && div_start >= item_start) || (div_end > item_start && div_end <= item_end)) && ((div_bottom < item_top && div_bottom >= item_bottom) || (div_top <= item_top && div_top > item_bottom))) ||
                                                        (((item_start < div_start && item_end > div_start) || (item_start < div_end && item_end >= div_end)) && item_top <= div_top && item_bottom >= div_bottom) ||
                                                        (((div_start <= item_start && div_end >= item_end) || (div_start >= item_start && div_end <= item_end)) && ((div_top >= item_top && item_bottom >= div_bottom) || (div_top >= item_top && div_bottom <= item_bottom) || (div_top > item_top && div_bottom <= item_top))) ||
                                                        (item_start < div_start && item_end >= div_end && item_top <= div_top && item_top > div_bottom && item_bottom <= div_bottom) ||
                                                        (item_start > div_start && item_end <= div_end && item_top >= div_top && item_bottom < div_top && item_bottom <= div_bottom) ||
                                                        (item_start < div_start && item_end >= div_end && item_top <= div_top && item_bottom >= div_bottom) ||
                                                        (item_start < div_start && item_end >= div_end && item_top < div_top && item_top > div_bottom) ||
                                                        (item_start >= div_start && item_start < div_end && item_bottom >= div_bottom && item_bottom < div_top)) {
                                                        shelf_hit = "Y";
                                                        break;
                                                    }
                                                    m++;
                                                }
                                                l++;
                                            }
                                        }
                                    } else {
                                        //checking any of the shelfs item is hitting the shelf edges.
                                        if (Shelf.ItemInfo.length > 0 && Shelf.ObjType !== "DIVIDER") {
                                            var l = 0;
                                            for (const item_info of Shelf.ItemInfo) {
                                                if (shelf_hit == "Y") {
                                                    break;
                                                }
                                                var item_start = wpdSetFixed(item_info.X - item_info.W / 2);//.toFixed(4));
                                                var item_end = wpdSetFixed(item_info.X + item_info.W / 2);//.toFixed(4));
                                                var item_top = wpdSetFixed(item_info.Y + item_info.H / 2);//.toFixed(4));
                                                var item_bottom = wpdSetFixed(item_info.Y - item_info.H / 2);//.toFixed(4));
                                                if (p_shelf_y < item_info.Y + item_info.H / 2 && p_shelf_y > item_info.Y - item_info.H / 2 && ((shelf_start > item_start && shelf_start < item_end) || (shelf_end > item_start && shelf_end < item_end) || (item_start > shelf_start && item_end < shelf_end))) {
                                                    shelf_hit = "Y";
                                                    break;
                                                } else {
                                                    var m = 0;
                                                    for (const curr_item_info of p_shelfs.ItemInfo) {
                                                        var item_x, item_y;
                                                        if (p_shelfs.ObjType == "BASKET" && p_shelfs.BsktSpreadProduct == "BT") {
                                                            item_x = p_shelf_x - p_shelfs.W / 2 + curr_item_info.W / 2;
                                                            item_y = curr_item_info.Y;
                                                        } else if (p_shelfs.ObjType == "HANGINGBAR") {
                                                            item_x = p_shelf_x - p_shelfs.W / 2 + curr_item_info.Distance + curr_item_info.W / 2;
                                                            item_y = p_shelf_y - curr_item_info.H / 2;
                                                        } else if (p_shelfs.ObjType == "PEGBOARD" || (p_shelfs.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                                            item_x = p_shelf_x - p_shelfs.W / 2 + curr_item_info.PegBoardX + curr_item_info.W / 2;
                                                            item_y = curr_item_info.Y;
                                                        } else {
                                                            item_x = p_shelf_x - p_shelfs.W / 2 + curr_item_info.Distance + curr_item_info.W / 2;
                                                            item_y = p_shelf_y + p_shelfs.H / 2 + curr_item_info.H / 2;
                                                        }
                                                        var div_start = wpdSetFixed(item_x - curr_item_info.W / 2);
                                                        var div_end = wpdSetFixed(item_x + curr_item_info.W / 2);
                                                        var div_top = wpdSetFixed(item_y + curr_item_info.H / 2);
                                                        var div_bottom = wpdSetFixed(item_y - curr_item_info.H / 2);
                                                        if (
                                                            (((div_start < item_end && div_start >= item_start) || (div_end > item_start && div_end <= item_end)) && ((div_bottom < item_top && div_bottom >= item_bottom) || (div_top <= item_top && div_top > item_bottom))) ||
                                                            (((item_start < div_start && item_end > div_start) || (item_start < div_end && item_end >= div_end)) && item_top <= div_top && item_bottom >= div_bottom) ||
                                                            (((div_start <= item_start && div_end >= item_end) || (div_start >= item_start && div_end <= item_end)) && ((div_top >= item_top && item_bottom >= div_bottom) || (div_top >= item_top && div_bottom <= item_bottom) || (div_top > item_top && div_bottom <= item_top))) ||
                                                            (item_start < div_start && item_end >= div_end && item_top <= div_top && item_top > div_bottom && item_bottom <= div_bottom) ||
                                                            (item_start > div_start && item_end <= div_end && item_top >= div_top && item_bottom < div_top && item_bottom <= div_bottom) ||
                                                            (item_start < div_start && item_end >= div_end && item_top <= div_top && item_bottom >= div_bottom) ||
                                                            (item_start < div_start && item_end >= div_end && item_top < div_top && item_top > div_bottom) ||
                                                            (item_start >= div_start && item_start < div_end && item_bottom >= div_bottom && item_bottom < div_top)) {
                                                            shelf_hit = "Y";
                                                            break;
                                                        }
                                                        m++;
                                                    }
                                                }
                                                l++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        k++;
                    }
                }
                j++;
            }
            //if there is a hit and overhung is Y. then we need to pass the validation.
            if (shelf_hit == "Y") {
                //ASA-1129
                if (p_auto_position_enbl == "N" && g_overhung_shelf_active == "Y" && (l_object_type == "SHELF" || l_object_type == "HANGINGBAR") && g_overhung_validation !== "Y") {
                    p_shelfs.Overhung = "Y";
                    validate_passed = "Y";
                } else {
                    if (p_alert_ind == "Y") {
                        alert(get_message("LOST_FROM_SHELF_ERR_VERT", p_shelfs.Shelf));
                    }
                    validate_passed = "N";
                }
                return validate_passed;
            } else {
                var i = 0;
                //getting all nearest shelf in the place of drop.
                for (const Shelf of g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo) {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX" && Shelf.ObjType !== "CHEST" && ((p_curr_module == p_module_index && i !== p_shelf_index) || p_curr_module !== p_module_index)) {
                        if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                            var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.ShelfRotateWidth / 2);
                            var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.ShelfRotateWidth / 2);
                            var shelf_height = wpdSetFixed(Shelf.ShelfRotateHeight);
                            var shelf_width = wpdSetFixed(Shelf.ShelfRotateWidth);
                        } else {
                            var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.W / 2);
                            var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.W / 2);
                            var shelf_height = wpdSetFixed(Shelf.H);
                            var shelf_width = wpdSetFixed(Shelf.W);
                        }
                        //ASA-1628 Issue 5, new validation isShelfOverlapShelf
                        if ((l_object_type == "SHELF" || l_object_type == "HANGINGBAR") && p_shelfs.D == Shelf.D && isShelfOverlapShelf(p_shelf_x, p_shelf_y, curr_shelf_width, curr_shelf_height, Shelf.X, Shelf.Y, shelf_width, shelf_height)) {
                            if (p_alert_ind == "Y") {
                                alert(get_message("LOST_FROM_SHELF_ERR_VERT", p_shelfs.Shelf));
                            }
                            return "N";
                        } else {
                            if (Shelf.Y >= p_shelf_y && l_object_type !== "HANGINGBAR" && ((div_shelf_end > shelf_start && div_shelf_start <= shelf_start) || (div_shelf_start < shelf_end && div_shelf_start >= shelf_start))) {
                                min_distance_arr.push(wpdSetFixed(Shelf.Y - shelf_height / 2 - (p_shelf_y + curr_shelf_height / 2)));
                                shelf_index_arr.push(i);
                            } else if (Shelf.Y <= p_shelf_y && l_object_type == "HANGINGBAR" && ((div_shelf_end > shelf_start && div_shelf_start <= shelf_start) || (div_shelf_start < shelf_end && div_shelf_start >= shelf_start))) {
                                min_distance_arr.push(wpdSetFixed(p_shelf_y - curr_shelf_height / 2 - (Shelf.Y + shelf_height / 2)));
                                shelf_index_arr.push(i);
                            }
                            if (Shelf.Y <= p_shelf_y && l_object_type !== "HANGINGBAR" && ((div_shelf_end > shelf_start && div_shelf_start <= shelf_start) || (div_shelf_start < shelf_end && div_shelf_start >= shelf_start))) {
                                low_distance_arr.push(wpdSetFixed(p_shelf_y - curr_shelf_height / 2 - (Shelf.Y + shelf_height / 2)));
                                shelf_index_arr_dwn.push(i);
                            } else if (Shelf.Y >= p_shelf_y && l_object_type == "HANGINGBAR" && ((div_shelf_end > shelf_start && div_shelf_start <= shelf_start) || (div_shelf_start < shelf_end && div_shelf_start >= shelf_start))) {
                                low_distance_arr.push(wpdSetFixed(Shelf.Y - shelf_height / 2 - (p_shelf_y + curr_shelf_height / 2)));
                                shelf_index_arr_dwn.push(i);
                            }
                        }
                    }
                    i++;
                }
                //getting the space between the current shelf and nearest shelf.
                if (low_distance_arr.length > 0) {
                    low_merch = Math.min.apply(Math, low_distance_arr);
                }

                if (low_merch !== 0) {
                    var index = low_distance_arr.findIndex(function (number) {
                        return number == low_merch;
                    });
                    //this is check the shelfs which are below the current shelf. if any of the item height is exceeding the space between
                    if (l_object_type !== "HANGINGBAR" && g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index]].ObjType !== "PEGBOARD" && l_object_type !== "PEGBOARD" && g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index]].ObjType !== "HANGINGBAR" && g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index]].ObjType !== "ROD" && l_object_type !== "CHEST") { //ASA-1272
                        item_details = g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index]].ItemInfo;
                        var i = 0;
                        for (const items of item_details) {
                            if (g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index]].Rotation !== 0 || g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index]].Slope !== 0) {
                                var itemx = items.ItemRotateWorldX;
                            } else {
                                var itemx = items.X;
                            }
                            var new_height = 0;
                            if (typeof items.TopObjID !== "undefined" && items.TopObjID !== "") {
                                var item_top = items.H;
                                $.each(item_details, function (j, items_info) {
                                    if (wpdSetFixed(items.X) == wpdSetFixed(items_info.X) && j !== i) {
                                        item_top += items_info.H;
                                    }
                                });
                                new_height = item_top;
                            } else {
                                new_height = items.H;
                            }
                            if (new_height > low_merch && ((shelf_end > wpdSetFixed(itemx - items.W / 2) && shelf_start <= wpdSetFixed(itemx - items.W / 2)) || (shelf_start < wpdSetFixed(itemx + items.W / 2) && shelf_start >= wpdSetFixed(itemx - items.W / 2)))) {
                                item_height_arr.push(wpdSetFixed(new_height));
                                item_index_arr.push(i);
                                if (items.CrushVert > 0 || items.CHPerc > 0) {
                                    item_crush_ind = "Y";
                                }
                            }
                            i++;
                        }
                    } else {
                        if (g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index]].ObjType == "HANGINGBAR") {
                            item_details = g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index]].ItemInfo;
                            var failed = "N";
                            var i = 0;
                            for (const items of item_details) {
                                if (shelf_bottom > wpdSetFixed(items.Y - items.H / 2)) {
                                    var div_start = wpdSetFixed(items.X - items.W / 2);//.toFixed(3));
                                    var div_end = wpdSetFixed(items.X + items.W / 2);//.toFixed(3));
                                    var div_top = wpdSetFixed(items.Y + items.H / 2);//.toFixed(3));
                                    var div_bottom = wpdSetFixed(items.Y - items.H / 2);//.toFixed(3));
                                    var j = 0;
                                    for (const curr_items of p_items_arr) {
                                        var item_top = wpdSetFixed(curr_items.Y + curr_items.H / 2);//.toFixed(3));
                                        var item_bottom = wpdSetFixed(curr_items.Y - curr_items.H / 2);//.toFixed(3));
                                        var item_start = wpdSetFixed(curr_items.X - curr_items.W / 2);//.toFixed(3));
                                        var item_end = wpdSetFixed(curr_items.X + curr_items.W / 2);//.toFixed(3));
                                        if (((div_start > item_start && div_start < item_end && div_end > item_end) || (div_end > item_start && div_end < item_end && div_start < item_start) || (div_start > item_start && div_start < item_end && div_end > item_start && div_end < item_end) || (div_start < item_start && div_end > item_end)) && div_bottom < item_top) {
                                            failed = "Y";
                                        }
                                        j++;
                                    }
                                }
                                i++;
                            }
                            index = failed == "Y" ? 0 : -1;
                        } else {
                            index = -1;
                        }
                    }
                } else {
                    var index = -1;
                }
                if (l_object_type !== "HANGINGBAR" && l_object_type !== "PEGBOARD" && l_object_type !== "CHEST") {
                    var index = item_height_arr.findIndex(function (number) {
                        return number > low_merch;
                    });
                }
                //this check is the shelf above the current shelf. if any of the shelf got hit by the items in the current shelf.
                if (index == -1) {
                    item_height_arr = [];
                    if (min_distance_arr.length == 0) {
                        l_max_merch = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].H + g_pog_json[p_pog_index].BaseH - p_shelf_y + 5);
                    } else {
                        l_max_merch = Math.min.apply(Math, min_distance_arr);
                        var index = min_distance_arr.findIndex(function (number) {
                            return number == l_max_merch;
                        });
                        if (l_object_type !== "HANGINGBAR" && g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].ObjType !== "PEGBOARD" && l_object_type !== "PEGBOARD" && g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].ObjType !== "CHEST" && l_object_type !== "CHEST") {
                            var shelf_start_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].X - g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].W / 2);
                            var shelf_end_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].X + g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].W / 2);
                            var i = 0;
                            for (const items of p_items_arr) {
                                if (p_shelfs.Rotation !== 0 || p_shelfs.Slope !== 0) {
                                    var itemx = items.ItemRotateWorldX;
                                } else {
                                    var itemx = items.X;
                                }
                                var new_height = 0;
                                if (typeof items.TopObjID !== "undefined" && items.TopObjID !== "") {
                                    var item_top = items.H;
                                    var j = 0;
                                    for (const items_info of p_items_arr) {
                                        if (wpdSetFixed(items.X) == wpdSetFixed(items_info.X) && j !== i) {
                                            item_top += items_info.H;
                                        }
                                        j++;
                                    }

                                    new_height = item_top;
                                } else {
                                    new_height = items.H;
                                }

                                if (new_height > l_max_merch && ((shelf_end_div > itemx - items.W / 2 && shelf_start_div <= itemx - items.W / 2) || (shelf_start_div < itemx + items.W / 2 && shelf_start_div >= itemx - items.W / 2))) {
                                    item_height_arr.push(wpdSetFixed(new_height));
                                    item_index_arr.push(i);
                                    if (items.CrushVert > 0 || items.CHPerc > 0) {
                                        item_crush_ind = "Y";
                                    }
                                }
                                i++;
                            }
                            var index = item_height_arr.findIndex(function (number) {
                                return number > l_max_merch;
                            });
                        } else {
                            if (g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].ObjType !== "HANGINGBAR" && l_object_type !== "PEGBOARD" && l_object_type !== "CHEST") {
                                var shelf_half = wpdSetFixed(p_shelfs.H / 2);
                                var itemheight = 0;
                                var i = 0;
                                for (const items of p_items_arr) {
                                    if (wpdSetFixed(items.H - shelf_half) > itemheight) {
                                        itemheight = wpdSetFixed(items.H - shelf_half);
                                    }
                                    i++;
                                }
                                l_max_merch = l_max_merch - itemheight;
                                var item_details = g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].ItemInfo;
                                var shelf_start_div = wpdSetFixed(p_shelfs.X - p_shelfs.W / 2);
                                var shelf_end_div = wpdSetFixed(p_shelfs.X + p_shelfs.W / 2);
                                var i = 0;
                                for (const items of item_details) {
                                    if (g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Rotation !== 0 || g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Slope !== 0) {
                                        var itemx = items.ItemRotateWorldX;
                                    } else {
                                        var itemx = items.X;
                                    }
                                    var new_height = 0;
                                    if (typeof items.TopObjID !== "undefined" && items.TopObjID !== "") {
                                        var item_top = items.H;
                                        $.each(item_details, function (j, items_info) {
                                            if (wpdSetFixed(items.X) == wpdSetFixed(items_info.X) && j !== i) {
                                                item_top += items_info.H;
                                            }
                                        });
                                        new_height = item_top;
                                    } else {
                                        new_height = items.H;
                                    }

                                    if (new_height > l_max_merch && ((shelf_end_div > wpdSetFixed(itemx - items.W / 2) && shelf_start_div <= wpdSetFixed(itemx - items.W / 2)) || (shelf_start_div < wpdSetFixed(itemx + items.W / 2) && shelf_start_div >= wpdSetFixed(itemx - items.W / 2)))) {
                                        item_height_arr.push(wpdSetFixed(new_height));
                                        item_index_arr.push(i);
                                        if (items.CrushVert > 0 || items.CHPerc > 0) {
                                            item_crush_ind = "Y";
                                        }
                                    }
                                    i++;
                                }
                                var index = item_height_arr.findIndex(function (number) {
                                    return number > l_max_merch;
                                });
                            } else if (l_object_type !== "PEGBOARD" && l_object_type !== "CHEST") {
                                var item_details = g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].ItemInfo;
                                var failed = "N";
                                var i = 0;
                                for (const items of p_items_arr) {
                                    if (g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Y - g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].H / 2 > items.Y - items.H / 2) {
                                        var div_start = wpdSetFixed(items.X - items.W / 2);//.toFixed(3));
                                        var div_end = wpdSetFixed(items.X + items.W / 2);//.toFixed(3));
                                        var div_top = wpdSetFixed(items.Y + items.H / 2);//.toFixed(3));
                                        var div_bottom = wpdSetFixed(items.Y - items.H / 2);//.toFixed(3));
                                        var j = 0;
                                        for (const curr_items of item_details) {
                                            var item_top = wpdSetFixed(curr_items.Y + curr_items.H / 2);//.toFixed(3));
                                            var item_bottom = wpdSetFixed(curr_items.Y - curr_items.H / 2);//.toFixed(3));
                                            var item_start = wpdSetFixed(curr_items.X - curr_items.W / 2);//.toFixed(3));
                                            var item_end = wpdSetFixed(curr_items.X + curr_items.W / 2);//.toFixed(3));
                                            if (((div_start > item_start && div_start < item_end && div_end > item_end) || (div_end > item_start && div_end < item_end && div_start < item_start) || (div_start > item_start && div_start < item_end && div_end > item_start && div_end < item_end) || (div_start < item_start && div_end > item_end)) && div_bottom < item_top) {
                                                failed = "Y";
                                            }
                                            j++;
                                        }
                                    }
                                    i++;
                                }
                                index = failed == "Y" ? 0 : -1;
                            } else {
                                index = -1;
                            }
                        }
                    }
                }
                if (index == -1 && (min_distance_arr.length > 0 || low_distance_arr.length > 0)) {
                    l_max_merch = 0;
                    low_merch = 0;
                    var dual_check = "N";
                    var index_dual = -1;

                    if (min_distance_arr.length > 0) {
                        l_max_merch = Math.min.apply(Math, min_distance_arr);
                    }

                    if (low_distance_arr.length > 0) {
                        low_merch = Math.min.apply(Math, low_distance_arr);
                    }

                    if (min_distance_arr.length > 0 && low_distance_arr.length > 0) {
                        if (low_merch < l_max_merch) {
                            var index = low_distance_arr.findIndex(function (number) {
                                return number == low_merch;
                            });
                            shelf_index_arr = shelf_index_arr_dwn;
                        } else if (l_max_merch < low_merch) {
                            var index = min_distance_arr.findIndex(function (number) {
                                return number == l_max_merch;
                            });
                        } else if (l_max_merch == low_merch) {
                            dual_check = "Y";
                            var index = min_distance_arr.findIndex(function (number) {
                                return number == l_max_merch;
                            });
                            index_dual = low_distance_arr.findIndex(function (number) {
                                return number == low_merch;
                            });
                        }
                    } else {
                        if (min_distance_arr.length > 0) {
                            var index = min_distance_arr.findIndex(function (number) {
                                return number == l_max_merch;
                            });
                        } else {
                            var index = low_distance_arr.findIndex(function (number) {
                                return number == low_merch;
                            });
                            shelf_index_arr = shelf_index_arr_dwn;
                        }
                    }

                    var errored = "N";
                    //this means the distance between shelf below and above is same. then we need to check both sides. to make sure nothing is hit.
                    if (dual_check == "Y") {
                        if (g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].Rotation !== 0 || g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].Slope !== 0) {
                            var shelf_top_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].Y + g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].ShelfRotateHeight / 2);
                            var shelf_bottom_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].Y - g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].ShelfRotateHeight / 2);
                        } else {
                            var shelf_top_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].Y + g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].H / 2);
                            var shelf_bottom_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].Y - g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr_dwn[index_dual]].H / 2);
                        }
                        if ((shelf_top_div >= shelf_top && shelf_bottom_div <= shelf_top) || (shelf_top_div >= shelf_bottom && shelf_top_div <= shelf_top)) {
                            errored = "Y";
                        }
                    }

                    if (errored == "N") {
                        if (g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Rotation !== 0 || g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Slope !== 0) {
                            var shelf_top_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Y + g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].ShelfRotateHeight / 2);
                            var shelf_bottom_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Y - g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].ShelfRotateHeight / 2);
                        } else {
                            var shelf_top_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Y + g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].H / 2);
                            var shelf_bottom_div = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].Y - g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo[shelf_index_arr[index]].H / 2);
                        }

                        if ((shelf_top_div >= shelf_top && shelf_bottom_div <= shelf_top) || (shelf_top_div >= shelf_bottom && shelf_top_div <= shelf_top)) {
                            index = 0;
                            p_allow_crush = "N";
                        } else {
                            index = -1;
                        }
                    } else {
                        index = 0;
                        p_allow_crush = "N";
                    }
                }
                //ASA-1129
                if (index !== -1 && g_overhung_shelf_active == "Y" && (l_object_type == "SHELF" || l_object_type == "HANGINGBAR") && g_overhung_validation !== "Y") {
                    p_shelfs.Overhung = "Y";
                    validate_passed = "Y";
                }
                if ((p_allow_crush == "N" && index !== -1) || (p_allow_crush == "Y" && index !== -1 && item_crush_ind == "N")) {
                    if (p_alert_ind == "Y") {
                        g_validationAlert = "Y";
                        alert(get_message("LOST_FROM_SHELF_ERR_VERT", p_shelfs.Shelf));
                    }
                    validate_passed = "N";
                } else if (p_allow_crush == "Y" && index !== -1 && item_crush_ind == "Y") {
                    var new_height = 0;
                    var i = 0;
                    for (const items of p_items_arr) {
                        var crushVal = items.CrushVert > 0 ? items.CrushVert : items.CHPerc;
                        if (items.H > l_max_merch && crushVal > 0) {
                            // new_height = items.H - items.H * (crushVal / 100);
                            var crushSuccess = crushItem(p_pog_index, p_curr_module, p_shelf_index, i, "H", "Y", -1, -1);
                            if (crushSuccess == "Y") {
                                crush_index_arr.push(i);
                            }
                            // if (new_height < l_max_merch) {
                            //     crush_index_arr.push(i);
                            // }
                        }
                        i++;
                    }
                    if (item_height_arr.length > crush_index_arr.length) {
                        if (p_alert_ind == "Y") {
                            alert(get_message("LOST_FROM_SHELF_ERR_VERT", p_shelfs.Shelf));
                        }
                        validate_passed = "N";
                    } else {
                        var i = 0;
                        for (const items of p_items_arr) {
                            var crushVal = items.CrushVert > 0 ? items.CrushVert : items.CHPerc;
                            if (items.H > l_max_merch && crushVal > 0) {
                                var crushSuccess = crushItem(p_pog_index, p_curr_module, p_shelf_index, i, "H", "Y", -1, -1);
                                // new_height = items.H - items.H * (crushVal / 100);
                                // shelfs.ItemInfo[i].H = new_height;
                            }
                            i++;
                        }

                        validate_passed = "R";
                    }
                } else {
                    validate_passed = "Y";
                }
            }
            logDebug("function : validate_shelf_min_distance", "E");
        }
        return validate_passed;
    } catch (err) {
        error_handling(err);
    }
}

//This function is used to check if item is hitting any objects in the POG.
function item_height_validation(p_item_height, p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_final_x, p_allow_crush, p_crush_height, p_item_fixed, p_alert_ind, p_item_depth, p_facing_edit, p_pog_index, p_byPassMedicineOverhung = "N", p_decrement_value = "N") { // Regression 2 added p_byPassMedicineOverhung //ASA-1858 Added param p_decrement_value
    logDebug("function : item_height_validation; item_height : " + p_item_height + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; p_edit_ind : " + p_edit_ind + "; i_final_x : " + p_final_x + "; allow_crush : " + p_allow_crush + "; crush_height : " + p_crush_height + "; item_fixed : " + p_item_fixed + "; alert_ind : " + p_alert_ind + "; item_depth : " + p_item_depth + "; facing_edit : " + p_facing_edit, "S");
    try {
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var itemdtl = shelfdtl.ItemInfo[p_item_index];
        var modules = g_pog_json[p_pog_index].ModuleInfo[p_module_index];
        var orientation = itemdtl.Orientation;
        if (p_crush_height == 0) {
            p_crush_height = itemdtl.CHPerc;
        }
        //getting the max merch (distance between the current shelf and next shelf.)
        //	l_max_merch = get_max_merch(p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_final_x, p_pog_index);
        l_max_merch = get_cap_max_merch(p_module_index, p_shelf_index, modules, shelfdtl, p_pog_index, g_dft_max_merch, "N", p_byPassMedicineOverhung, p_item_index); // Regression 2 added p_byPassMedicineOverhung //20240415 - Regression Issue 8 //ASA-1892 Issue2 added p_item_index
        var setTopMerch = get_module_max_merch(p_module_index, p_shelf_index, p_pog_index, p_byPassMedicineOverhung, p_item_index); // Regression 2 added p_byPassMedicineOverhung //ASA-1729 #5 //ASA-1892 Issue2 added p_item_index
        if (shelfdtl.Topmerch !== "Y") { //ASA-1729 Issue #5 #7
            var l_ovrid_max_merch = get_cap_max_merch(p_module_index, p_shelf_index, modules, shelfdtl, p_pog_index, g_dft_max_merch, 'Y', p_byPassMedicineOverhung, p_item_index);   // Regression 2 added p_byPassMedicineOverhung   //ASA-1638 //ASA-1892 Issue2 added p_item_index
            l_max_merch = l_ovrid_max_merch < l_max_merch ? l_ovrid_max_merch : l_max_merch;    //ASA-1638 #3
        }
        //validate item height with adjustment of auto crush and crush % for that item.
        var new_height = 0;
        itemdtl.HChanged = "N";
        var items = itemdtl;
        var l_shelf_max_merch = shelfdtl.MaxMerch;
        var item_details = shelfdtl.ItemInfo;
        // if the current item is a part of top bottom items. then get the total height of all the items in the stack.
        if ((typeof items.TopObjID !== "undefined" && items.TopObjID !== "") || (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "")) {
            var item_top = p_item_height;
            var j = 0;
            for (const items_info of item_details) {
                if (wpdSetFixed(items.X) == wpdSetFixed(items_info.X) && j !== p_item_index) {
                    item_top += items_info.H;
                }
                j++;
            }
            p_item_height = item_top;
        }
        // ASA-1129, Start
        //ASA-1386 issue 6
        //if overhung is Y then pass the validation even though item is hit.
        if (g_overhung_shelf_active == "Y" && (shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR") && g_overhung_validation !== "Y") {
            if ((typeof items.TopObjID == "undefined" || items.TopObjID == "") && (typeof items.BottomObjID == "undefined" || items.BottomObjID == "")) { //ASA-1300 top bottom item no need to crush
                //ASA-1386 issue 6
                if (p_item_height > l_max_merch) {
                    shelfdtl["Overhung"] = "Y";
                }
                if (p_allow_crush == "Y") {//ASA-1496 TASK  
                    var k = 0;
                    for (var crush_v of shelfdtl.ItemInfo) {
                        var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, k, "H", "Y", -1, -1);
                        k++;
                    }
                }
                return "N"; //ASA-1212
            }

            // ASA-1540
            // else {
            //     return "Y";
            // }
        }
        // ASA-1129, End
        var manualHCrush = typeof items.MVertCrushed == "undefined" || items.MVertCrushed == "N" ? "N" : "Y";
        /*if (typeof orientation !== "undefined") {//Task-02_25977
        //var [item_owidth, item_oheight, item_odepth, actualHeight] = get_new_orientation_dim(orientation, 0, 0, 0);
        //if (actualHeight == "H") {
        manualHCrush = typeof items.MVertCrushed == "undefined" || items.MVertCrushed == "N" ? "N" : "Y";
        } else if (actualHeight == "W") {
        manualHCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == "N" ? "N" : "Y";
        } else if (actualHeight == "D") {
        manualHCrush = typeof items.MDepthCrushed == "undefined" || items.MDepthCrushed == "N" ? "N" : "Y";
        }
        }*/

        if ((p_item_height > l_max_merch || manualHCrush == "Y") && p_edit_ind == "Y" && p_allow_crush == "Y" && p_crush_height > 0 && p_item_fixed == "N") {
            //when validation fails or it has manual crush. then call crushitem to crush it.

            var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "H", "Y", -1, -1);
            //when crushing also failed then try to reduce the facing. make sure user has not done facing edit when edit item.
            if (crushSuccess == "N") {
                if (items.BVert > 1 && (p_facing_edit == "N" || (p_facing_edit == "Y" && p_decrement_value == "Y"))) { //ASA-1858 Issue 2
                    var vert_facing = 0;
                    vert_facing = Math.floor((l_max_merch * 100) / ((items.RH / items.BVert) * 100));
                    if (vert_facing == 0) {
                        vert_facing = 1;
                    }
                    var max_facing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings; //ASA-1408
                    vert_facing = max_facing < vert_facing && max_facing > -1 ? max_facing : vert_facing; //ASA-1408
                    //vert_facing = items.MVertFacings < vert_facing && items.MVertFacings > -1 ? items.MVertFacings : vert_facing; //ASA-874 ,ASA-1408

                    new_height = (items.RH / items.BVert) * vert_facing;
                    if (new_height > l_max_merch) {
                        if (p_alert_ind == "Y") {
                            alert(get_message("LOST_FROM_SHELF_ERR_VERT", shelfdtl.Shelf));
                        }
                        g_error_category = "H";
                        return "Y";
                    } else {
                        itemdtl.H = new_height;
                        var shelfs = shelfdtl;
                        var [itemx, itemy] = get_item_xy(shelfs, items, items.W, items.H, p_pog_index);
                        if (shelfdtl.ObjType == "BASKET" && items.Item == "DIVIDER") {
                            console.log("no validation");
                        } else {
                            itemdtl.Y = itemy;
                        }

                        itemdtl.BVert = vert_facing;
                        itemdtl.HChanged = "Y";
                        g_error_category = "";
                        logDebug("function : item_height_validation", "E");
                        return "N";
                    }
                } else {
                    if (p_alert_ind == "Y") {
                        alert(get_message("LOST_FROM_SHELF_ERR_VERT", shelfdtl.Shelf));
                    }
                    g_error_category = "H";
                    return "Y";
                }
            } else {
                logDebug("function : item_height_validation", "E");
                return "N";
            }
            //ASA-1301
        } else if (wpdSetFixed(p_item_height) > l_max_merch && l_shelf_max_merch == 0) {
            var l_final_y = shelfdtl.Y + shelfdtl.H / 2;
            var l_object_type = shelfdtl.ObjType;
            var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
            var min_distance_arr = [];
            var min_index_arr = [];
            var div_shelf_index = -1;
            var i = 0;
            for (const shelfs of shelf_arr) {
                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX" && i !== p_shelf_index) {
                    if (shelfs.Y > l_final_y && l_object_type !== "HANGINGBAR" && i !== p_shelf_index) {
                        min_distance_arr.push(shelfs.Y - parseFloat(l_final_y));
                        min_index_arr.push(i);
                    } else if (shelfs.Y < l_final_y && i !== p_shelf_index) {
                        min_distance_arr.push(parseFloat(l_final_y) - shelfs.Y);
                        min_index_arr.push(i);
                    }
                }
                i++;
            }

            if (min_distance_arr.length > 0) {
                var min_distance = Math.min.apply(Math, min_distance_arr);
                var index = min_distance_arr.findIndex(function (number) {
                    return number == min_distance;
                });
                div_shelf_index = min_index_arr[index];
            }
            var new_depth = -1;

            if (div_shelf_index !== -1) {
                new_depth = wpdSetFixed(shelfdtl.D - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_shelf_index].D);
                var p_item_depth = wpdSetFixed(p_item_depth);
            }
            if (p_item_height > l_max_merch) {
                if (p_alert_ind == "Y") {
                    alert(get_message("LOST_FROM_SHELF_ERR_VERT", shelfdtl.Shelf));
                }
                g_error_category = "H";
                return "Y";
            } else if (p_item_depth > new_depth) {
                if (p_alert_ind == "Y") {
                    alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                }
                g_error_category = "D";
                return "Y";
            } else {
                return "N";
            }
            //ASA-1301
        } else if (wpdSetFixed(p_item_height) > l_max_merch && l_shelf_max_merch > 0) {
            if (items.BVert > 1 && (p_facing_edit == "N" || (p_facing_edit == "Y" && p_decrement_value == "Y"))) { //ASA-1858 Issue 2
                var vert_facing = 0;
                vert_facing = Math.floor((l_max_merch * 100) / ((items.RH / items.BVert) * 100));
                if (vert_facing == 0) {
                    vert_facing = 1;
                }
                //var max_facing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MPogVertFacings; //ASA-1408 //ASA-1749, commented
                var max_facing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings; //ASA-1749
                vert_facing = max_facing < vert_facing && max_facing > -1 ? max_facing : vert_facing; //ASA-1408
                // vert_facing = items.MVertFacings < vert_facing && items.MVertFacings > -1 ? items.MVertFacings : vert_facing; //ASA-874,ASA-1408

                new_height = (items.RH / items.BVert) * vert_facing;
                if (new_height > l_max_merch) {
                    if (p_alert_ind == "Y") {
                        alert(get_message("LOST_FROM_SHELF_ERR_VERT", shelfdtl.Shelf));
                    }
                    g_error_category = "H";
                    return "Y";
                } else {
                    itemdtl.H = new_height;
                    var shelfs = shelfdtl;
                    var [itemx, itemy] = get_item_xy(shelfs, items, items.W, items.H, p_pog_index);
                    if (shelfdtl.ObjType == "BASKET" && items.Item == "DIVIDER") {
                        console.log("no validation");
                    } else {
                        itemdtl.Y = itemy;
                    }
                    itemdtl.BVert = vert_facing;
                    itemdtl.HChanged = "Y";
                    g_error_category = "";
                    logDebug("function : item_height_validation", "E");
                    return "N";
                }
            } else {
                if (p_alert_ind == "Y") {
                    alert(get_message("LOST_FROM_SHELF_ERR_VERT", shelfdtl.Shelf));
                }
                g_error_category = "H";
                return "Y";
            }
        } else {
            if ((p_edit_ind == "Y" && p_allow_crush == "Y" && p_crush_height > 0 && p_item_fixed == "N")
                && ((typeof items.TopObjID == "undefined" || items.TopObjID == "") && (typeof items.BottomObjID == "undefined" || items.BottomObjID == ""))) { //ASA- 1540 
                var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "H", "Y", -1, -1);
            }
            g_error_category = "";
            logDebug("function : item_height_validation", "E");
            return "N";
        }
    } catch (err) {
        error_handling(err);
    }
}
//This function handles all the type of validation for item except item height. that is done by item_height_validation function.
function validate_items(p_item_width_arr, p_item_height_arr, p_item_depth_arr, p_item_index_arr, p_shelf_obj_type, p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_crush_width, p_crush_height, p_crush_depth, p_final_x, p_item_fixed, p_valid_height, p_alert_ind, p_valid_bottom, p_facing_edit, p_drag_item_arr, p_crush_item, p_valid_width, p_valid_depth, p_pog_index, p_validate = "N", p_multi_edit = 'N', p_decrement_value = "N") { //ASA-1300 added new parameter //ASA-1858 Added new parameter p_decrement_value 
    logDebug("function : validate_items; shelf_obj_type : " + p_shelf_obj_type + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; p_edit_ind : " + p_edit_ind + "; crush_width : " + p_crush_width + "; crush_height : " + p_crush_height + "; crush_depth : " + p_crush_depth + "; i_final_x : " + p_final_x + "; item_fixed : " + p_item_fixed + "; valid_height : " + p_valid_height + "; alert_ind : " + p_alert_ind + "; valid_bottom : " + p_valid_bottom + "; facing_edit : " + p_facing_edit + "; crush_item : " + p_crush_item + "; valid_width : " + p_valid_width + "; valid_depth : " + p_valid_depth, "S");
    try {
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        if (shelfdtl.ItemInfo.length > 0) {
            var l_max_merch = 0;
            var spread_product = shelfdtl.SpreadItem;
            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
            //if the shelf in which item is there is a combine shelf. then take the spread product of first shelf.
            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                spread_product = g_combinedShelfs[currCombinationIndex].SpreadItem;
            }

            var allow_crush = shelfdtl.AllowAutoCrush;
            var peg_verti_arr = shelfdtl.peg_vert_values;
            var peg_horiz_arr = shelfdtl.peg_horiz_values;
            var spread_gap = 0;
            var available_space = 0;
            //Regression issue decimal problem
            var minx = wpdSetFixed(shelfdtl.X - (shelfdtl.W / 2));
            var maxx = wpdSetFixed(shelfdtl.X + (shelfdtl.W / 2));
            var miny = wpdSetFixed(shelfdtl.Y - (shelfdtl.H / 2));
            var maxy = wpdSetFixed(shelfdtl.Y + (shelfdtl.H / 2));
            for (i = 0; i < p_item_index_arr.length; i++) {
                shelfdtl.ItemInfo[p_item_index_arr[i]].WChanged = "N";
                shelfdtl.ItemInfo[p_item_index_arr[i]].DChanged = "N";
            }
            if (p_item_index !== -1) {
                shelfdtl.ItemInfo[p_item_index].WChanged = "N";
                shelfdtl.ItemInfo[p_item_index].DChanged = "N";
            }

            if (p_shelf_obj_type == "PEGBOARD") {
                var horiz_gap = shelfdtl.VertiSpacing;
            } else {
                var horiz_gap = shelfdtl.HorizGap;
            }
            var depth_gap = shelfdtl.DGap;
            var p_item_fixed = "N";

            if (horiz_gap > 0) {
                spread_gap = horiz_gap;
            } else {
                spread_gap = 0;
            }
            var sum_item_width = 0;

            valid_values = ["SHELF", "CHEST", "PALLET", "HANGINGBAR", "PEGBOARD", "ROD"];
            var getReturn = false; //ASA-1442 issue 1
            if (valid_values.indexOf(p_shelf_obj_type) !== -1) {
                shelfdtl["Overhung"] = "N"; //ASA-1138
                //This block only handles pegboard and chest as pegboard. both have similar functionality. so we use same validation function.
                if (p_shelf_obj_type == "PEGBOARD" || (g_chest_as_pegboard == "Y" && p_shelf_obj_type == "CHEST" && typeof peg_verti_arr !== "undefined")) {
                    validate_peg = "Y";
                    if (shelfdtl.ItemInfo.length > 0) {
                        if (!(g_chest_as_pegboard == "Y" && p_shelf_obj_type == "CHEST")) {
                            miny = wpdSetFixed(miny - shelfdtl.LoOverHang); //ASA-1739 
                            maxy = wpdSetFixed(maxy + shelfdtl.UOverHang); //ASA-1739
                            minx = wpdSetFixed(minx - shelfdtl.LOverhang); //ASA-1739
                            maxx = wpdSetFixed(maxx + shelfdtl.ROverhang); //ASA-1739 
                        }
                        //p_item_index_arr can have multiple items to validate also. when dragging items from product list
                        for (i = 0; i < p_item_index_arr.length; i++) {
                            var itemx = shelfdtl.ItemInfo[p_item_index_arr[i]].X;
                            var itemstart = wpdSetFixed(shelfdtl.ItemInfo[p_item_index_arr[i]].X - (shelfdtl.ItemInfo[p_item_index_arr[i]].W / 2));
                            var itemend = wpdSetFixed(shelfdtl.ItemInfo[p_item_index_arr[i]].X + (shelfdtl.ItemInfo[p_item_index_arr[i]].W / 2));
                            var itemtop = wpdSetFixed(shelfdtl.ItemInfo[p_item_index_arr[i]].Y + (shelfdtl.ItemInfo[p_item_index_arr[i]].H / 2));
                            var itembtm = wpdSetFixed(shelfdtl.ItemInfo[p_item_index_arr[i]].Y - (shelfdtl.ItemInfo[p_item_index_arr[i]].H / 2));
                            // var itemy = shelfdtl.ItemInfo[i].Y;
                            var itemy = shelfdtl.ItemInfo[p_item_index_arr[i]].Y;
                            //ASA-1405 Issue 1
                            //fail the validation when item is going out the PEGBOARD. Chest is omitted.
                            if (!(g_chest_as_pegboard == "Y" && p_shelf_obj_type == "CHEST")) {
                                if (parseFloat(itemstart) < parseFloat(minx) || parseFloat(itemend) > parseFloat(maxx) || parseFloat(itembtm) < parseFloat(miny) || parseFloat(itemtop) > parseFloat(maxy)) {
                                    validate_peg = 'H';
                                    break;
                                }
                            } else {      //ASA-1606
                                //this is a specific requirement when drag multi. for multi edit when items are out of the chest. then we start the items
                                //from the top left so that all the items are placed automatically. so we set AutoPlacing = 'Y'
                                // if ((p_multi_edit == 'Y' && (g_chest_as_pegboard == "Y" && p_shelf_obj_type == "CHEST")) && (parseFloat(itemstart) < parseFloat(minx) || parseFloat(itemend) > parseFloat(maxx) || parseFloat(itembtm) < parseFloat(miny) || parseFloat(itemtop) > parseFloat(maxy)) && shelfdtl.AutoPlacing == "Y") {       //ASA-1606
                                if (p_multi_edit == 'Y' && (parseFloat(itemstart) < parseFloat(minx) || parseFloat(itemend) > parseFloat(maxx) || parseFloat(itembtm) < parseFloat(miny) || parseFloat(itemtop) > parseFloat(maxy)) && shelfdtl.AutoPlacing == "Y") {          //ASA-1606
                                    //ASA-1405 Issue 1
                                    // if (p_multi_edit == 'Y' && (g_chest_as_pegboard == "Y" && p_shelf_obj_type == "CHEST")) { //ASA-1300

                                    //var old_auto_placing = shelfdtl.AutoPlacing;
                                    shelfdtl.AutoPlacing = 'Y';
                                    var return_val = find_pegboard_gap(p_item_width_arr[i], p_item_height_arr[i], itemx, itemy, horiz_gap, p_module_index, p_shelf_index, p_item_index_arr[i], p_item_index_arr[i], "Y", p_pog_index, "Y", g_auto_x_space, g_auto_y_space); //ASA-1300 added g_auto_x_space,g_auto_y_space
                                    // shelfdtl.AutoPlacing = old_auto_placing;
                                    if (return_val == 'N') {
                                        validate_peg = 'H';
                                        break;
                                    } else {
                                        validate_peg = 'Y';
                                    }
                                    //ASA-1405 Issue 1
                                    // } else {
                                    //     validate_peg = 'H';
                                    //     break;
                                    // }
                                } else {
                                    //This is for single item drag and drop into chest.
                                    console.log('validate item start ', p_item_index_arr[i], shelfdtl.ItemInfo[p_item_index_arr[i]].Item, shelfdtl.ItemInfo[p_item_index_arr[i]].X, shelfdtl.ItemInfo[p_item_index_arr[i]].Y)
                                    var return_val = find_pegboard_gap(p_item_width_arr[i], p_item_height_arr[i], itemx, itemy, horiz_gap, p_module_index, p_shelf_index, p_item_index_arr[i], p_item_index_arr[i], "Y", p_pog_index, "Y", g_auto_x_space, g_auto_y_space); //ASA-1300 added g_auto_x_space,g_auto_y_space
                                    console.log(' find pegboard return ', return_val, shelfdtl.ItemInfo[p_item_index_arr[i]].Item);
                                    //if find_pegboard_gap failes to get X axis. then try to crush item
                                    if (return_val == 'N' && (g_chest_as_pegboard == "Y" && p_shelf_obj_type == "CHEST" && typeof peg_verti_arr !== "undefined")) {
                                        console.log(' valid failure ', return_val, shelfdtl.ItemInfo[p_item_index_arr[i]].Item, shelfdtl.ItemInfo[p_item_index_arr[i]]);
                                        if (shelfdtl.AllowAutoCrush == 'Y') { //ASA-1300
                                            var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index_arr[i], "A", "Y", p_item_depth_arr, p_item_index_arr);
                                            if (crushSuccess == 'Y') {
                                                return_val = 'Y';
                                            }
                                        }
                                    }
                                    console.log('validate items after ', return_val);
                                    //if not possible to crush and there is depth error try to reduce the depth facings.
                                    if (shelfdtl.ItemInfo[p_item_index_arr[i]].D > shelfdtl.BsktWallH && p_shelf_obj_type == "CHEST" && p_valid_depth == 'Y') {
                                        var depth_facing = 1; //ASA-1327
                                        var items_info = shelfdtl.ItemInfo[p_item_index_arr[i]];

                                        depth_facing = Math.floor((shelfdtl.BsktWallH * 100) / ((items_info.RD / items_info.BaseD) * 100));
                                        var l_dfacing = nvl(items_info.MPogDepthFacings) > 0 ? items_info.MPogDepthFacings : items_info.MDepthFacings;
                                        depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874
                                        depth_facing = depth_facing == 0 ? 1 : depth_facing;

                                        var new_depth = 0;
                                        new_depth = (items_info.RD / items_info.BaseD) * depth_facing;

                                        if (shelfdtl.BsktWallH < new_depth) {
                                            // Regression 6 20240821, Incorrect codition - comparing old facing with new
                                            // || items_info.BaseD > depth_facing) { //Regression 15 checking the auto calculate depth facing  is less then  manual depth
                                            validate_peg = "D";
                                            break;
                                        } else {
                                            //Replace p_item_index with p_item_index_arr[i] ASA-1737
                                            shelfdtl.ItemInfo[p_item_index_arr[i]].D = new_depth;
                                            shelfdtl.ItemInfo[p_item_index_arr[i]].RD = new_depth;// Regression 6 20240821
                                            shelfdtl.ItemInfo[p_item_index_arr[i]].BaseD = depth_facing;
                                            shelfdtl.ItemInfo[p_item_index_arr[i]].DChanged = "Y";
                                        }
                                    }
                                    if (return_val == "N" && (p_valid_width == 'Y' || p_valid_height == 'Y')) {
                                        validate_peg = "N";
                                        break;
                                    } else if (return_val == "D") {
                                        validate_peg = "D";
                                        break;
                                    }

                                }
                            }
                        }
                    }
                    if (validate_peg == "N") {
                        if (p_alert_ind == "Y") {
                            if (g_chest_as_pegboard == "Y" && p_shelf_obj_type == "CHEST") {
                                alert(get_message("POGC_CHEST_SPACE_VALID", shelfdtl.Shelf));
                            } else {
                                alert(get_message("ITEM_POSITION_OVERLAP", shelfdtl.Shelf));
                            }
                        }
                        g_error_category = "D";
                        return false;
                    } else if (validate_peg == "H") {
                        if (p_alert_ind == "Y") {
                            alert(get_message("ITEM_OUTSIDE_PEGBOARD", shelfdtl.Shelf));
                        }
                        g_error_category = "D";
                        return false;
                    } else if (validate_peg == "D") {
                        if (p_alert_ind == "Y") {
                            alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                        }
                        g_error_category = "D";
                        return false;
                    } else if (validate_peg == "W") {
                        if (p_alert_ind == "Y") {

                            //Task_29818 - Start
                            // ax_message.set({
                            //     labels: {
                            //         ok: get_message("SHCT_YES"),
                            //         cancel: get_message("SHCT_NO"),
                            //     },
                            // });

                            // ax_message.set({
                            //     buttonReverse: true,
                            // });
                            // //ax_message.confirm("Reduced Depth facings will be reduced to 1. Do you wish to continue", function (e) {
                            // ax_message.confirm(get_message("POGCR_REDUCE_DEPTH_TO_ONE"), function (e) { //ASA-1442 Regression
                            //     if (e) {
                            //         g_error_category = "";
                            //         return true;
                            //     } else {
                            //         g_error_category = "D";
                            //         return false;
                            //     }
                            // });

                            confirm(
                                get_message("POGCR_REDUCE_DEPTH_TO_ONE"),
                                get_message("SHCT_YES"),
                                get_message("SHCT_NO"),
                                function () {
                                    g_error_category = "";
                                    return true;
                                },
                                function () {
                                    g_error_category = "D";
                                    return false;
                                }
                            );
                            //Task_29818 - End
                        }
                    } else if (validate_peg == "Y") {
                        for (i = 0; i < p_item_index_arr.length; i++) {
                            console.log(' valid success ', shelfdtl.ItemInfo[p_item_index_arr[i]].Item, shelfdtl.ItemInfo[p_item_index_arr[i]]);
                        }
                        //ASA-1125
                        g_error_category = "";
                        return true;
                    }
                    if (typeof shelfdtl.AutoFillPeg !== "undefined" && shelfdtl.AutoFillPeg == "Y" && p_final_x !== -1) {
                        // ASA-1109
                        if (p_item_index !== -1) {
                            if ((shelfdtl.MaxMerch < shelfdtl.ItemInfo[p_item_index].D && shelfdtl.MaxMerch > 0) || (shelfdtl.ItemInfo[p_item_index].D > g_pegboard_dft_item_depth && shelfdtl.MaxMerch == 0 && g_pegboard_dft_item_depth > 0)) {
                                if (p_alert_ind == "Y") {
                                    alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                }
                                g_error_category = "D";
                                return false;
                            }
                        } else {
                            var items_arr = shelfdtl.ItemInfo;
                            var errored = "N";
                            var i = 0;
                            for (const items of items_arr) {
                                if (p_item_index_arr.indexOf(i) !== -1) {
                                    if ((shelfdtl.MaxMerch > 0 && items.D > shelfdtl.MaxMerch) || (items.D > g_pegboard_dft_item_depth && shelfdtl.MaxMerch == 0 && g_pegboard_dft_item_depth > 0)) {
                                        errored = "Y";
                                    }
                                }
                                i++;
                            }
                            if (errored == "Y") {
                                if (p_alert_ind == "Y") {
                                    alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                }
                                g_error_category = "D";
                                return false;
                            }
                        }
                    }
                } else if (p_shelf_obj_type == "PALLET" && p_validate == "Y") {//this part is to check if item dragged to PALLET is inside the shelf.
                    var in_item_sum = 0;
                    var sum_width = 0;
                    var items_arr = shelfdtl.ItemInfo;
                    in_item_sum = p_item_width_arr.reduce((a, b) => a + b, 0);
                    in_item_sum = in_item_sum + spread_gap * (parseFloat(p_item_width_arr.length) - 1);
                    var i = 0;
                    for (const items of items_arr) {
                        if (p_item_index_arr.indexOf(i) == -1) {
                            if (horiz_gap > 0) {
                                sum_width += items.W + horiz_gap;
                            } else {
                                sum_width = wpdSetFixed(sum_width + items.W); //.toFixed(5)); //ASA-1087, toFixed(4)
                            }
                        }
                        i++;
                    }
                    available_space = (shelfdtl.W * 100 + shelfdtl.LOverhang * 100 + shelfdtl.ROverhang * 100 - sum_width * 100) / 100;

                    if (available_space < in_item_sum) {
                        if (p_alert_ind == "Y") {
                            g_validationFlag = "N";
                            alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                        }
                        g_error_category = "W";
                        return false;
                    }
                } else if (p_shelf_obj_type !== "ROD") {
                    if (p_valid_height == "Y") {// this below code is not used now as we use item_height_validation function to validate height. this 
                        //can be removed.
                        l_max_merch = get_max_merch(p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_final_x, p_pog_index);
                        var index = p_item_height_arr.findIndex(function (number) {
                            return number > l_max_merch;
                        });
                        //ASA-1138
                        if (index !== -1 && g_overhung_shelf_active == "Y" && (p_shelf_obj_type == "SHELF" || p_shelf_obj_type == "HANGINGBAR") && g_overhung_validation !== "Y") {
                            if (p_item_index == -1) {
                                var l_anyCrushFailed = false;
                                for (var i = 0; i < p_item_index_arr.length; i++) {
                                    var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index_arr[i], "H", "Y", -1, -1);
                                    if (crushSuccess == 'N') {
                                        shelfdtl["Overhung"] = "Y";
                                        l_anyCrushFailed = true;
                                    }
                                }

                                if (l_anyCrushFailed) {
                                    g_error_category = 'H'; //ASA-1412
                                    getReturn = true; //ASA-1442 issue 1
                                    // return true; //ASA-1442 issue 1
                                }
                            } else {
                                var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "H", "Y", -1, -1);
                                if (crushSuccess == 'N') {
                                    shelfdtl["Overhung"] = "Y";
                                    g_error_category = 'H'; //ASA-1412
                                    getReturn = true; //ASA-1442 issue 1
                                    //return true;//ASA-1442 issue 1
                                }
                            }
                        }
                        if (!getReturn) { //ASA-1442 issue 1
                            if (index !== -1 && p_edit_ind == "Y" && allow_crush == "Y" && p_crush_height > 0 && p_item_fixed == "N" && p_crush_item == "Y") {
                                p_item_height_arr[index] = p_item_height_arr[index] - p_item_height_arr[index] * (p_crush_height / 100);
                                var new_index = p_item_height_arr.findIndex(function (number) {
                                    return number > l_max_merch;
                                });
                                if (new_index !== -1) {
                                    if (p_alert_ind == "Y") {
                                        alert(get_message("LOST_FROM_SHELF_ERR_VERT", shelfdtl.Shelf));
                                    }
                                    g_error_category = 'H'; //ASA-1412
                                    return false;
                                } else {
                                    shelfdtl.ItemInfo[p_item_index_arr[index]].H = p_item_height_arr[index];
                                }
                            } else if (index !== -1) { //REGRESSION 15
                                var crushSuccess = "Y";
                                for (i = 0; i < p_item_index_arr.length; i++) {
                                    var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index_arr[i], "H", "Y", -1, -1);
                                    if (crushSuccess == 'N') {
                                        if (p_alert_ind == "Y") {
                                            alert(get_message("LOST_FROM_SHELF_ERR_VERT", shelfdtl.Shelf));
                                        }
                                        break;
                                    }
                                }
                                if (crushSuccess == "N") {
                                    g_error_category = 'H'; //ASA-1412
                                    return false;
                                }
                            }
                        } //ASA-1442 issue 1
                    }

                    //--------------------------------------------------------------------
                    if (p_valid_width == "Y") {
                        if (p_shelf_obj_type !== "PALLET") {
                            //validate sum width
                            var in_item_sum = 0;
                            var sum_width = 0;
                            var items_arr = shelfdtl.ItemInfo;
                            var bookend_exists = "N";
                            var bookend_ind = -1;
                            // var shelf_top = parseFloat((shelfdtl.Y + shelfdtl.H / 2).toFixed(2));
                            in_item_sum = p_item_width_arr.reduce((a, b) => a + b, 0);
                            in_item_sum = in_item_sum + spread_gap * (parseFloat(p_item_width_arr.length) - 1);
                            var fixedItemPresent = items_arr.some((items) => items.Fixed === "Y");//ASA-1765 Issue 3
                            var fixedItemShelfInvalid = false;//ASA-1765 Issue 3
                            //if the spread product of the shelf is Manual, then check if any item gets hit with dragging item.
                            if (shelfdtl.ItemInfo.length > 0) {
                                if (spread_product == "M") {
                                    if (p_item_index != -1) {
                                        var item_detail = shelfdtl.ItemInfo[p_item_index];
                                        var item_start = wpdSetFixed(item_detail.X - item_detail.W / 2); //.toFixed(4)); //item_detail.X - item_detail.W / 2;
                                        var item_end = wpdSetFixed(item_detail.X + item_detail.W / 2); //.toFixed(4)); //item_detail.X + item_detail.W / 2;
                                        var item_top = wpdSetFixed(item_detail.Y + item_detail.H / 2); //.toFixed(4));
                                        var item_bottom = wpdSetFixed(item_detail.Y - item_detail.H / 2); //.toFixed(4));
                                        var valid = "Y";
                                        if ((item_start < minx && item_end > maxx) && g_overhung_shelf_active == "N") {
                                            alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                            g_error_category = 'W'; //ASA-1412
                                            return false;
                                        }
                                        if (items_arr.length > 0) {
                                            //ASA-1129 --S
                                            var k = 0;
                                            for (const items of items_arr) {
                                                //$.each(items_list, function (k, items) {
                                                if (k !== p_item_index) {
                                                    div_start = wpdSetFixed(items.X - items.W / 2); //).toFixed(4));
                                                    div_end = wpdSetFixed(items.X + items.W / 2); //).toFixed(4));
                                                    div_top = wpdSetFixed(items.Y + items.H / 2); //.toFixed(4));
                                                    div_bottom = wpdSetFixed(items.Y - items.H / 2); //.toFixed(4));
                                                    if (
                                                        (((div_start < item_end && div_start >= item_start) || (div_end > item_start && div_end <= item_end)) && ((div_bottom < item_top && div_bottom >= item_bottom) || (div_top <= item_top && div_top > item_bottom))) ||
                                                        (((item_start < div_start && item_end > div_start) || (item_start < div_end && item_end >= div_end)) && item_top <= div_top && item_bottom >= div_bottom) ||
                                                        (((div_start <= item_start && div_end >= item_end) || (div_start >= item_start && div_end <= item_end)) && ((div_top >= item_top && item_bottom >= div_bottom) || (div_top >= item_top && div_bottom <= item_bottom) || (div_top > item_top && div_bottom <= item_top))) ||
                                                        (item_start < div_start && item_end >= div_end && item_top <= div_top && item_top > div_bottom && item_bottom <= div_bottom) ||
                                                        (item_start > div_start && item_end <= div_end && item_top >= div_top && item_bottom < div_top && item_bottom <= div_bottom) ||
                                                        (item_start < div_start && item_end >= div_end && item_top <= div_top && item_bottom >= div_bottom) ||
                                                        (item_start < div_start && item_end >= div_end && item_top < div_top && item_top > div_bottom) ||
                                                        (item_start >= div_start && item_start < div_end && item_bottom >= div_bottom && item_bottom < div_top)) {
                                                        valid = "N";
                                                        break; //return false;
                                                    }
                                                }

                                                // });
                                                k++;
                                            }
                                        }

                                        if (valid == "N") {
                                            if (p_item_index > -1 && allow_crush == "Y") {
                                                var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "W", "Y", -1, -1);
                                                if (crushSuccess == 'N') {
                                                    alert(get_message("ITEM_POSITION_OVERLAP_SHELF_HANG", shelfdtl.Shelf));
                                                    g_error_category = 'W'; //ASA-1412
                                                    return false;
                                                } else {
                                                    getReturn = true; //ASA-1442 issue 1
                                                    //return true;//ASA-1442 issue 1
                                                }
                                            } else {
                                                alert(get_message("ITEM_POSITION_OVERLAP_SHELF_HANG", shelfdtl.Shelf));
                                                g_error_category = 'W'; //ASA-1412
                                                return false;
                                            }
                                        }
                                    }
                                } //ASA-1129 -E

                                //ASA-1765 Issue 3
                                //This block is for handling width validation of shelf with fixed item/divider
                                if (!getReturn && spread_product !== "M" && fixedItemPresent && (p_shelf_obj_type == "HANGINGBAR" || p_shelf_obj_type == "SHELF")) {
                                    fixedItemShelfInvalid = validateShelfWithFixedItem(shelfdtl, spread_product, horiz_gap, items_arr);
                                }

                                if (!getReturn) { //ASA-1442 issue 1
                                    //below code will find out the space between bookend items. when a item is dragged inside a shelf and 
                                    // there is a bookend item. then the space between 2 bookend items is considered the total width available.
                                    //so we loop through all items and find out the space .
                                    if (p_edit_ind == "Y") {
                                        bookend_array = [];
                                        var i = 0;
                                        for (const items of items_arr) {
                                            if (!fixedItemPresent && i < p_item_index && items.Fixed == "B" && spread_product !== "R" && ((p_drag_item_arr.length > 0 && p_drag_item_arr.indexOf(items.ObjID) == -1) || p_drag_item_arr.length == 0)) {
                                                bookend_exists = "Y";
                                                bookend_array.push(i);
                                            } else if (!fixedItemPresent && i > p_item_index && items.Fixed == "B" && spread_product == "R" && ((p_drag_item_arr.length > 0 && p_drag_item_arr.indexOf(items.ObjID) == -1) || p_drag_item_arr.length == 0)) {
                                                bookend_exists = "Y";
                                                bookend_array.push(i);
                                            }
                                            i++;
                                        }

                                        if (spread_product !== "R") {
                                            var bookend_ind = Math.max.apply(Math, bookend_array);
                                        } else {
                                            var bookend_ind = Math.min.apply(Math, bookend_array);
                                        }
                                        if (bookend_exists == "N") {
                                            var i = 0;
                                            for (const items of items_arr) {
                                                if (p_shelf_obj_type == "SHELF") {
                                                    if (i !== p_item_index && (typeof items.BottomObjID == 'undefined' || items.BottomObjID == '')) { //parseFloat((items.Y - items.H / 2).toFixed(2)) == shelf_top
                                                        if (horiz_gap > 0) {
                                                            sum_width += wpdSetFixed(items.W + horiz_gap);
                                                        } else {
                                                            sum_width = wpdSetFixed(sum_width + items.W); //.toFixed(5)); //ASA-1087, toFixed(4)
                                                        }
                                                    }
                                                } else {
                                                    if (i !== p_item_index) {
                                                        if (horiz_gap > 0) {
                                                            sum_width += wpdSetFixed(items.W + horiz_gap);
                                                        } else {
                                                            sum_width = wpdSetFixed(sum_width + items.W); //.toFixed(5)); //ASA-1087, toFixed(4)
                                                        }
                                                    }
                                                }
                                                i++;
                                            }
                                        } else {
                                            var i = 0;
                                            for (const items of items_arr) {
                                                if (i > bookend_ind && i < p_item_index && spread_product !== "R" && i !== p_item_index_arr[0]) {
                                                    if (horiz_gap > 0) {
                                                        sum_width += wpdSetFixed(items.W + horiz_gap);
                                                    } else {
                                                        sum_width = wpdSetFixed(sum_width + items.W); //.toFixed(5)); //ASA-1087, toFixed(4)
                                                    }
                                                } else if (i < bookend_ind && i > p_item_index && spread_product == "R" && i !== p_item_index_arr[0]) {
                                                    if (horiz_gap > 0) {
                                                        sum_width += wpdSetFixed(items.W + horiz_gap);
                                                    } else {
                                                        sum_width = wpdSetFixed(sum_width + items.W); //.toFixed(5)); //ASA-1087, toFixed(4)
                                                    }
                                                }
                                                i++;
                                            }
                                        }
                                    } else {
                                        var min_ind = Math.min.apply(Math, p_item_index_arr);
                                        var max_ind = Math.max.apply(Math, p_item_index_arr);
                                        bookend_array = [];
                                        var i = 0;
                                        for (const items of items_arr) {
                                            if (spread_product !== "R") {
                                                if (i < min_ind && items.Fixed == "B") {
                                                    bookend_exists = "Y";
                                                    bookend_array.push(i);
                                                }
                                            } else if (spread_product == "R") {
                                                if (i > max_ind && items.Fixed == "B") {
                                                    bookend_exists = "Y";
                                                    bookend_array.push(i);
                                                }
                                            }
                                            i++;
                                        }
                                        if (spread_product !== "R") {
                                            var bookend_ind = Math.max.apply(Math, bookend_array);
                                        } else {
                                            var bookend_ind = Math.min.apply(Math, bookend_array);
                                        }
                                        if (bookend_exists == "N") {
                                            var i = 0;
                                            for (const items of items_arr) {
                                                if (p_shelf_obj_type == "SHELF") {
                                                    if (p_item_index_arr.indexOf(i) == -1 && (typeof items.BottomObjID == 'undefined' || items.BottomObjID == '')) {
                                                        if (horiz_gap > 0) {
                                                            sum_width += wpdSetFixed(items.W + horiz_gap);
                                                        } else {
                                                            sum_width = wpdSetFixed(sum_width + items.W);
                                                        }
                                                    }
                                                } else {
                                                    if (p_item_index_arr.indexOf(i) == -1) {
                                                        if (horiz_gap > 0) {
                                                            sum_width += wpdSetFixed(items.W + horiz_gap);
                                                        } else {
                                                            sum_width = wpdSetFixed(sum_width + items.W);
                                                        }
                                                    }
                                                }
                                                i++;
                                            }
                                        } else {
                                            var i = 0;
                                            for (const items of items_arr) {
                                                if (i > bookend_ind && spread_product !== "R" && i !== p_item_index_arr[0]) {
                                                    if (horiz_gap > 0) {
                                                        sum_width += wpdSetFixed(items.W + horiz_gap);
                                                    } else {
                                                        sum_width = wpdSetFixed(sum_width + items.W);
                                                    }
                                                } else if (i < bookend_ind && spread_product == "R" && i !== p_item_index_arr[0]) {
                                                    if (horiz_gap > 0) {
                                                        sum_width += wpdSetFixed(items.W + horiz_gap);
                                                    } else {
                                                        sum_width = wpdSetFixed(sum_width + items.W);
                                                    }
                                                }
                                                i++;
                                            }
                                        }
                                    }
                                    //sum_width will have the space between the bookend items.
                                    if (bookend_exists == "N") {
                                        available_space = wpdSetFixed((shelfdtl.W * 100 + shelfdtl.LOverhang * 100 + shelfdtl.ROverhang * 100 - sum_width * 100) / 100);
                                    } else {
                                        if (spread_product !== "R") {
                                            available_space = wpdSetFixed(maxx - (shelfdtl.ItemInfo[bookend_ind].X + shelfdtl.ItemInfo[bookend_ind].W / 2) - sum_width);
                                        } else {
                                            available_space = wpdSetFixed(shelfdtl.ItemInfo[bookend_ind].X - shelfdtl.ItemInfo[bookend_ind].W / 2 - minx - sum_width);
                                        }
                                    }
                                } //ASA-1442 issue 1
                            } else {
                                available_space = wpdSetFixed((shelfdtl.W * 100 + shelfdtl.LOverhang * 100 + shelfdtl.ROverhang * 100) / 100);
                            }

                            //below we are checking if the item dragged to combine shelf. then we need to add all the width of combine shelfs to check the 
                            //available space and also add width of all the items in a combine shelf.
                            if (!getReturn && !fixedItemPresent) { //ASA-1442 issue 1
                                if (g_combinedShelfs.length > 0) { // ASA-1307
                                    var [oldCombinationIndex, oldShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
                                    if (currShelfCombIndx !== -1 && typeof g_pog_json[p_pog_index].ModuleInfo[g_combinedShelfs[oldCombinationIndex][g_combinedShelfs[oldCombinationIndex].length - 1].MIndex] !== 'undefined') { //ASA-1812 Issue 1
                                        var l_items_arr = g_combinedShelfs[oldCombinationIndex].ItemInfo;
                                        allow_crush = g_combinedShelfs[oldCombinationIndex].AllowAutoCrush; // g_combinedShelfs[oldCombinationIndex][0].AllowAutoCrush; //Task_27720
                                        var l_total_shelf_width = 0;
                                        var l_total_item_width = 0;
                                        var i = 0;
                                        for (var combineshelf of g_combinedShelfs[oldCombinationIndex]) {
                                            l_total_shelf_width = l_total_shelf_width + combineshelf.W;
                                            i++;
                                        }
                                        var j = 0;
                                        for (var item of l_items_arr) {
                                            l_total_item_width = l_total_item_width + item.RW; //Task_27720
                                            j++;
                                        }
                                        l_total_item_width = l_total_item_width - in_item_sum; //ASA-1353 issue 3 regression issue 20240428 the item which is dragged is already added in the iteminfo. so available space will add same item with 2 times.
                                        //in_item_sum = l_total_item_width; //ASA-1310 KUSH FIX
                                        available_space = (l_total_shelf_width * 100 + g_pog_json[p_pog_index].ModuleInfo[g_combinedShelfs[oldCombinationIndex][0].MIndex].ShelfInfo[g_combinedShelfs[oldCombinationIndex][0].SIndex].LOverhang * 100 + g_pog_json[p_pog_index].ModuleInfo[g_combinedShelfs[oldCombinationIndex][g_combinedShelfs[oldCombinationIndex].length - 1].MIndex].ShelfInfo[g_combinedShelfs[oldCombinationIndex][g_combinedShelfs[oldCombinationIndex].length - 1].SIndex].ROverhang * 100 - l_total_item_width * 100) / 100;

                                    }
                                }
                            } //ASA-1442 issue 1
                            //ASA-1386 issue 6
                            //g_overhung_shelf_active = 'Y' and there is less available space. also we try to crushitems.we pass the validation even though 
                            //items are hanging out.
                            //_overhung_shelf_active = 'N' and there is less available space. we try to crush item. if cannot crush we throw error.
                            if (g_overhung_shelf_active == "Y" && (p_shelf_obj_type == "SHELF" || p_shelf_obj_type == "HANGINGBAR") && p_item_index !== -1) {
                                if (available_space < in_item_sum) {
                                    var crushSuccess = 'N';
                                    //  [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);//ASA-1496 TASK 5
                                    if (allow_crush == "Y") { //ASA-1236 //ASA-1386 Issue 6A, removed "currShelfCombIndx == -1"
                                        crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "W", "Y", -1, -1);
                                    }
                                    manualCrush = typeof shelfdtl.ItemInfo[p_item_index].MHorizCrushed == "undefined" || shelfdtl.ItemInfo[p_item_index].MHorizCrushed == "N" ? "N" : "Y";
                                    // if (crushSuccess == 'N' && manualCrush == 'N') { //ASA-1496 TASK 5 commneted if item is already crush and it not more to crush then ite return crusH N
                                    //     shelfdtl.ItemInfo[p_item_index].CrushHoriz = 0;
                                    // }
                                    shelfdtl["Overhung"] = "Y";
                                    g_error_category = 'W'; //ASA-1412    
                                    getReturn = true; //ASA-1442 issue 1
                                    //return true; //ASA-1442 issue 1
                                } else if (currShelfCombIndx !== -1 && available_space >= in_item_sum) {
                                    //ASA-1386 issue 6
                                    if (allow_crush == "Y") { //ASA-1236 //ASA-1386 Issue 6A, removed "currShelfCombIndx == -1"
                                        crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "W", "Y", -1, -1);
                                        if (crushSuccess == 'N') { //ASA-1412
                                            shelfdtl["Overhung"] = "Y";
                                            g_error_category = 'W';
                                        }
                                        getReturn = true; //ASA-1442 issue 1
                                        // return true; //ASA-1442 issue 1
                                    }
                                }
                            }
                            if (!getReturn) { //ASA-1442 issue 1
                                var manualCrush = "N";
                                if (p_item_index !== -1) {
                                    if (typeof shelfdtl.ItemInfo[p_item_index].Orientation !== "undefined") {
                                        var orientation = shelfdtl.ItemInfo[p_item_index].Orientation;
                                        var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0);

                                        if (wActualWidth == "H") {
                                            manualCrush = typeof shelfdtl.ItemInfo[p_item_index].MVertCrushed == "undefined" || shelfdtl.ItemInfo[p_item_index].MVertCrushed == "N" ? "N" : "Y";
                                        } else if (wActualWidth == "W") {
                                            manualCrush = typeof shelfdtl.ItemInfo[p_item_index].MHorizCrushed == "undefined" || shelfdtl.ItemInfo[p_item_index].MHorizCrushed == "N" ? "N" : "Y";
                                        } else if (wActualWidth == "D") {
                                            manualCrush = typeof shelfdtl.ItemInfo[p_item_index].MDepthCrushed == "undefined" || shelfdtl.ItemInfo[p_item_index].MDepthCrushed == "N" ? "N" : "Y";
                                        }
                                    }
                                }

                                if ((available_space < in_item_sum || fixedItemShelfInvalid || manualCrush == "Y") && allow_crush == "Y" && p_valid_bottom == "N" && p_crush_item == "Y") {
                                    if (p_item_index !== -1) {
                                        shelfdtl.ItemInfo[p_item_index].AvlSpace = available_space;
                                    }
                                    // if (p_item_index !== -1) { //ASA-1442 Issue 5
                                    var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "W", "Y", -1, -1);
                                    // }
                                    if (crushSuccess == "N" && (available_space < in_item_sum || fixedItemShelfInvalid)) { //ASA-1353 issue 3 regression issue 20240428 when there is no avail space error and done only manual crush. it should pass
                                        if (g_overhung_shelf_active == "Y" && (p_shelf_obj_type == "SHELF" || p_shelf_obj_type == "HANGINGBAR")) { //ASA-1830 Issue 2
                                            shelfdtl["Overhung"] = "Y";
                                            g_error_category = '';
                                            return true;
                                        }
                                        if (p_alert_ind == "Y") {
                                            g_validationFlag = "N";
                                            alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                        }
                                        if (p_decrement_value == "Y") { //ASA-1858 Issue 2
                                            g_error_category = '';
                                            return true;
                                        } else {
                                            g_error_category = 'W'; //ASA-1412
                                            return false;
                                        }
                                    }
                                    if (crushSuccess == "F") {
                                        if (p_item_index !== -1 && (p_facing_edit == "N" || (p_facing_edit == "Y" && p_decrement_value == "Y"))) { //ASA-1858 to avoid error when decrementing value
                                            var items = shelfdtl.ItemInfo[p_item_index];
                                            if (items.BHoriz > 1) {
                                                var horiz_facing = 1;
                                                horiz_facing = Math.floor((available_space * 100) / ((items.RW / items.BHoriz) * 100));
                                                horiz_facing = horiz_facing == 0 || horiz_facing < 0 ? 1 : horiz_facing;

                                                var new_width = 0;
                                                new_width = wpdSetFixed((items.RW / items.BHoriz) * horiz_facing + spread_gap * (p_item_width_arr.length - 1)); //.toFixed(3));
                                                if (available_space < new_width) {
                                                    if (p_alert_ind == "Y") {
                                                        g_validationFlag = "N";
                                                        alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                                    }
                                                    g_error_category = "W";
                                                    return false;
                                                } else {
                                                    //Start Task-02_25977
                                                    var l_fixed_item_validate = 'N';
                                                    if (wpdSetFixed(items.X + items.W / 2) > wpdSetFixed(shelfdtl.X + shelfdtl.W / 2) && g_overhung_shelf_active == 'N' && (shelfdtl.ObjType == 'SHELF' || shelfdtl.ObjType == 'HANGINGBAR')) { //
                                                        l_fixed_item_validate = "Y";
                                                    }
                                                    if (l_fixed_item_validate == 'N') {
                                                        items.W = new_width;
                                                        items.BHoriz = horiz_facing;
                                                        items.WChanged = "Y";
                                                    } else {
                                                        if (p_alert_ind == "Y") {
                                                            g_validationFlag = "N";
                                                            alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                                        }
                                                    }
                                                    //End Task-02_25977
                                                }
                                            } else if (p_decrement_value == "Y") { //ASA-1858 Issue 2
                                                g_error_category = "";
                                                return true;
                                            } else {
                                                if (p_alert_ind == "Y") {
                                                    g_validationFlag = "N";
                                                    alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                                }
                                                g_error_category = "W";
                                                return false;
                                            }
                                        } else {
                                            if (p_alert_ind == "Y") {
                                                g_validationFlag = "N";
                                                alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                            }
                                            g_error_category = "W";
                                            return false;
                                        }
                                    }
                                    // Production Issue fix 20240517
                                    /*else if (available_space < in_item_sum && g_overhung_shelf_active == 'N') {//20240415 Rregression issue 29 20240430
                                    if (p_alert_ind == "Y") { //ASA-1386 ISSUE 3
                                    g_validationFlag = "N";
                                    alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                    }
                                    g_error_category = "W";
                                    return false;
                                    }*/
                                    else { //ASA-1353 issue 3 regression issue 20240428 when there is no avail space error and done only manual crush. it should pass
                                        g_error_category = "";
                                        getReturn = true; //ASA-1442 issue 1
                                        // return true; //ASA-1442 issue 1
                                    }
                                    // }
                                } else if ((available_space < in_item_sum || fixedItemShelfInvalid) && p_valid_bottom == "N" && ((g_overhung_shelf_active == "N" && (p_shelf_obj_type == "SHELF" || p_shelf_obj_type == "HANGINGBAR")) || (p_shelf_obj_type !== "SHELF" && p_shelf_obj_type !== "HANGINGBAR"))) {
                                    if (p_item_index !== -1) {
                                        shelfdtl.ItemInfo[p_item_index].AvlSpace = available_space;
                                    }
                                    if (p_item_index !== -1 && (p_facing_edit == "N" || (p_facing_edit == "Y" && p_decrement_value == "Y"))) { //ASA-1858 to avoid error when decrementing value
                                        var items = shelfdtl.ItemInfo[p_item_index];
                                        if (items.BHoriz > 1) {
                                            var horiz_facing = 1;
                                            horiz_facing = Math.floor((available_space * 100) / ((items.RW / items.BHoriz) * 100));
                                            horiz_facing = horiz_facing == 0 ? 1 : horiz_facing;

                                            var new_width = 0;
                                            new_width = (items.RW / items.BHoriz) * horiz_facing + spread_gap * (parseFloat(p_item_width_arr.length) - 1);
                                            if (available_space < new_width || fixedItemShelfInvalid) {
                                                if (p_alert_ind == "Y") {
                                                    g_validationFlag = "N";
                                                    alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                                }
                                                g_error_category = "W";
                                                return false;
                                            } else {
                                                //Start Task-02_25977
                                                var l_fixed_item_validate = 'N';
                                                if ((items.X + items.W / 2) > shelfdtl.X + (shelfdtl.W / 2) && g_overhung_shelf_active == 'N' && (shelfdtl.ObjType == 'SHELF' || shelfdtl.ObjType == 'HANGINGBAR')) { //
                                                    l_fixed_item_validate = "Y";
                                                }
                                                if (l_fixed_item_validate == 'N') {
                                                    items.W = new_width;
                                                    items.BHoriz = horiz_facing;
                                                    items.WChanged = "Y";
                                                } else {
                                                    if (p_alert_ind == "Y") {
                                                        g_validationFlag = "N";
                                                        alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                                    }
                                                }
                                                //End Task-02_25977
                                            }
                                        } else if (p_decrement_value == "Y") { //ASA-1858 Issue 2
                                            g_error_category = "";
                                            return true;
                                        } else {
                                            if (p_alert_ind == "Y") {
                                                g_validationFlag = "N";
                                                alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                            }
                                            g_error_category = "W";
                                            return false;
                                        }
                                    } else {
                                        if (p_alert_ind == "Y") {
                                            g_validationFlag = "N";
                                            alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                                        }
                                        g_error_category = "W";
                                        return false;
                                    }
                                } else if (allow_crush == "Y" && p_valid_bottom == "N" && p_crush_item == "Y") { //ASA-1442 Issue 5
                                    var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "W", "Y", -1, -1);
                                }
                            } //ASA-1442 issue 1
                        }
                    }
                }
                //---------------------------------------------------------------------
                //Depth validation for items both edit and create. we try to find out any medicine shelf is present or any shelf that is hitting the 
                // items. so we try to get the top shelf depth and minus the current shelf depth. then we check if item depth is more than the calc depth.
                //if g_overhung_shelf_active = 'Y' we try to crush item, if fail also we pass the validation even though not enough depth. 
                //g_overhung_shelf_active = 'N' we try to crush item. if fail we throw error.
                if (p_shelf_obj_type !== "PEGBOARD" && p_shelf_obj_type !== "HANGINGBAR" && p_valid_depth == "Y") {
                    if (!(p_shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) { //ASA-1262 Prasanna
                        min_distance_arr = [];
                        min_index_arr = [];
                        var min_index = -1;
                        var top_shelf_depth = 0;
                        // ASA-1442 issue  5 S
                        //if (p_item_index !== -1) {
                        for (itemindex of p_item_index_arr) {
                            var items = shelfdtl.ItemInfo[itemindex];
                            var item_start = wpdSetFixed(items.X - items.W / 2);
                            var item_end = wpdSetFixed(items.X + items.W / 2);
                            var x = 0;  //ASA-1442 issue 5 S
                            var prevShelfDepth = null; //ASA-1294 ADDED because this logic is for medicine shelf not for normal shelf .medicine shelf are those that shelf   depth has been change in same module
                            for (shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                                var currentShelfDepth = shelfs.D;
                                if (shelfs.ObjType !== 'TEXTBOX' && shelfs.ObjType !== 'DIVIDER' && shelfs.ObjType !== 'NOTCH' && shelfs.ObjType !== 'BASE' && prevShelfDepth !== currentShelfDepth && shelfs.ObjType !== 'CHEST') { //ASA-1273 issue 3 //Regression issue 1 20242806 ,//ASA-1487 issue 12b
                                    var div_shelf_end = wpdSetFixed(shelfs.X + shelfs.W / 2);
                                    var div_shelf_start = wpdSetFixed(shelfs.X - shelfs.W / 2);
                                    if (wpdSetFixed(shelfs.Y) < wpdSetFixed(items.Y + items.H / 2) && x > p_shelf_index && ((item_start >= div_shelf_start && item_start < div_shelf_end) || (item_end <= div_shelf_end && item_end > div_shelf_start)) && shelfs.ObjType !== 'DIVIDER' && shelfs.ObjType !== 'NOTCH') {
                                        // min_distance_arr.push(items.Y + (items.H / 2) - shelfs.Y);
                                        min_distance_arr.push(Math.abs((items.Y - items.H / 2) - shelfs.Y));
                                        min_index_arr.push(x);
                                    }
                                }
                                prevShelfDepth = currentShelfDepth;
                                x++;
                            }
                        } // ASA-1442 issue  5 E
                        min_distance = Math.min.apply(Math, min_distance_arr);
                        var index = min_distance_arr.findIndex(function (number) {
                            return number == min_distance;
                        });

                        min_index = min_index_arr[index];

                        if (min_index !== -1 && typeof min_index !== 'undefined') {
                            top_shelf_depth = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[min_index].D;
                        }
                        //} //ASA-1442 issue 5 
                        var index = p_item_depth_arr.findIndex(function (number) {
                            return number > wpdSetFixed(shelfdtl.D - top_shelf_depth);
                        }); //End ASA-1262
                        //ASA-1442 issue 1 S
                        /*if (index !== -1 && g_overhung_shelf_active == "Y" && p_shelf_obj_type == "SHELF" && g_overhung_validation == "Y") {
                            var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "D", "Y", p_item_depth_arr, p_item_index_arr);
                            shelfdtl["Overhung"] = "Y";
                            if (crushSuccess == "Y") {
                               return true;
                            } else {
                                if (p_alert_ind == "Y") {
                                    alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                }
                                g_error_category = "D"; //Regression issue 9 error category not passed.
                                return false;
                            }

                        } else if (index !== -1 && g_overhung_shelf_active == "Y" && p_shelf_obj_type == "SHELF" && g_overhung_validation !== "Y") {
                            shelfdtl["Overhung"] = "Y";
                           return true;
                        }*/
                        //ASA-1442 issue 1
                        if (index !== -1 && g_overhung_shelf_active == "Y" && (p_shelf_obj_type == "SHELF" || p_shelf_obj_type == "HANGINGBAR") && g_overhung_validation !== "Y") {
                            //ASA-1442 issue 5 S
                            if (p_item_index == -1) {
                                var l_anyCrushFailed = false;
                                for (var i = 0; i < p_item_index_arr.length; i++) {
                                    var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index_arr[i], "D", "Y", p_item_depth_arr, p_item_index_arr);
                                    if (crushSuccess == 'N') {
                                        shelfdtl["Overhung"] = "Y";
                                        l_anyCrushFailed = true;
                                    }
                                }

                                if (l_anyCrushFailed) {
                                    g_error_category = 'D'; //ASA-1412
                                }
                            } else {
                                var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "D", "Y", p_item_depth_arr, p_item_index_arr);
                                if (crushSuccess == 'N') {
                                    shelfdtl["Overhung"] = "Y";
                                    g_error_category = 'D'; //ASA-1412
                                }
                            }
                            getReturn = true;
                            //ASA-1442 issue 5 S
                        }
                        if (!getReturn) { //ASA-1442 issue 1
                            var manualDCrush = "N";
                            if (p_item_index !== -1) {
                                if (typeof shelfdtl.ItemInfo[p_item_index].Orientation !== "undefined") {
                                    //Start Task_26899
                                    //var orientation = shelfdtl.ItemInfo[p_item_index].Orientation;
                                    //var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0);//Task_26899
                                    manualDCrush = shelfdtl.ItemInfo[p_item_index].MDepthCrushed;
                                    /*if (dActualHeight == "D") {
                                    manualDCrush = typeof shelfdtl.ItemInfo[p_item_index].MVertCrushed == "undefined" || shelfdtl.ItemInfo[p_item_index].MVertCrushed == "N" ? "N" : "Y";
                                    } else {
                                    manualDCrush = typeof shelfdtl.ItemInfo[p_item_index].MDepthCrushed == "undefined" || shelfdtl.ItemInfo[p_item_index].MDepthCrushed == "N" ? "N" : "Y";
                                    }*/
                                    //End Task_26899
                                }
                            }
                            if ((index !== -1 || manualDCrush == "Y") && allow_crush == "Y" && p_item_fixed == "N" && p_crush_item == "Y" && p_item_index !== -1) {
                                var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "D", "Y", p_item_depth_arr, p_item_index_arr);
                                if (crushSuccess == "N") {
                                    if (p_alert_ind == "Y") {
                                        alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                    }
                                    if (p_decrement_value == "Y") { //ASA-1858 Issue 2 Added if
                                        g_error_category = "";
                                        return true;
                                    } else {
                                        g_error_category = "D"; //Regression issue 9 error category not passed.
                                        return false;
                                    }

                                }
                                if (crushSuccess == "F") {
                                    if (p_item_index !== -1 && (p_facing_edit == "N" || (p_facing_edit == "Y" && p_decrement_value == "Y"))) { //ASA-1858 to avoid error when decrementing value
                                        var items = shelfdtl.ItemInfo[p_item_index];
                                        if (items.BaseD > 1) {
                                            var depth_facing = 1;
                                            depth_facing = Math.floor((shelfdtl.D * 100) / ((items.RD / items.BaseD) * 100));
                                            var l_dfacing = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings; //ASA 1408
                                            depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874 ,//ASA 1408
                                            depth_facing = depth_facing == 0 ? 1 : depth_facing;

                                            var new_depth = 0;
                                            new_depth = (items.RD / items.BaseD) * depth_facing;

                                            if (shelfdtl.D < new_depth) {
                                                if (p_alert_ind == "Y") {
                                                    alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                                }
                                                g_error_category = "D";
                                                return false;
                                            } else {
                                                shelfdtl.ItemInfo[p_item_index].D = new_depth;
                                                shelfdtl.ItemInfo[p_item_index].BaseD = depth_facing;
                                                shelfdtl.ItemInfo[p_item_index].DChanged = "Y";
                                            }
                                        } else if (p_decrement_value == "Y") { //ASA-1858 Issue 2
                                            g_error_category = "";
                                            return true;
                                        } else {
                                            if (p_alert_ind == "Y") {
                                                alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                            }
                                            g_error_category = "D";
                                            return false;
                                        }
                                    } else {
                                        if (p_alert_ind == "Y") {
                                            alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                        }
                                        g_error_category = "D";
                                        return false;
                                    }
                                }
                            } else if (index !== -1) {
                                if (p_item_index !== -1 && (p_facing_edit == "N" || (p_facing_edit == "Y" && p_decrement_value == "Y"))) { //ASA-1858 to avoid error when decrementing value
                                    //    if (p_item_index !== -1) {
                                    var items = shelfdtl.ItemInfo[p_item_index];
                                    if (items.BaseD > 1) {
                                        var depth_facing = 1;
                                        depth_facing = Math.floor((shelfdtl.D * 100) / ((items.RD / items.BaseD) * 100));
                                        var l_dfacing = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings; //ASA 1408
                                        depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874
                                        depth_facing = depth_facing == 0 ? 1 : depth_facing;

                                        var new_depth = 0;
                                        new_depth = (items.RD / items.BaseD) * depth_facing;

                                        if (shelfdtl.D < new_depth) {
                                            if (p_alert_ind == "Y") {
                                                alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                            }
                                            g_error_category = "D";
                                            return false;
                                        } else {
                                            shelfdtl.ItemInfo[p_item_index].D = new_depth;
                                            shelfdtl.ItemInfo[p_item_index].BaseD = depth_facing;
                                            shelfdtl.ItemInfo[p_item_index].DChanged = "Y";
                                        }
                                    } else if (p_decrement_value == "Y") { //ASA-1858 Issue 2
                                        g_error_category = "";
                                        return true;
                                    } else {
                                        if (p_alert_ind == "Y") {
                                            alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                        }
                                        g_error_category = "D";
                                        return false;
                                    }
                                } else {
                                    //ASA-1442 issue 5 S
                                    for (i = 0; i < p_item_index_arr.length; i++) {
                                        var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index_arr[i], "D", "Y", p_item_depth_arr, p_item_index_arr);
                                        if (crushSuccess == 'N') {
                                            if (p_alert_ind == "Y") {
                                                alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                            }
                                            break;
                                        }
                                    }
                                    if (p_decrement_value == "Y") { //ASA-1858 Issue 2
                                        g_error_category = "";
                                        return true;
                                    }
                                    if (crushSuccess == 'N') {
                                        g_error_category = "D";
                                        return false;
                                    }
                                    //ASA-1442 issue 5 E
                                }
                            } else {
                                //ASA-1442 Issue 1
                                // if(index == -1 && p_item_index !== -1){
                                //     for (i = 0; i < p_item_index_arr.length; i++) {
                                //         var orientation = shelfdtl.ItemInfo[p_item_index_arr[i]].Orientation;
                                //         var [item_owidth, item_oheight, item_odepth, dActualHeight, dActualWidth, dActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0); //Task_26899
                                //         if (manualDCrush == "N") {
                                //             if (dActualDepth == 'W') {
                                //                 shelfdtl.ItemInfo[p_item_index_arr[i]].CrushHoriz = 0;
                                //             } else if (dActualDepth == 'H') {
                                //                 shelfdtl.ItemInfo[p_item_index_arr[i]].CrushVert = 0;
                                //             } else if (dActualDepth == 'D') {
                                //                 shelfdtl.ItemInfo[p_item_index_arr[i]].CrushD = 0;
                                //             }
                                //         }
                                //     }
                                // }
                                if (p_item_index !== -1) {
                                    var crushSuccess = crushItem(p_pog_index, p_module_index, p_shelf_index, p_item_index, "D", "Y", p_item_depth_arr, p_item_index_arr);
                                }
                                if (p_shelf_obj_type == "SHELF" && p_valid_bottom == "Y") {
                                    for (j = 0; j < p_item_index_arr.length; j++) {
                                        var items = shelfdtl.ItemInfo[p_item_index_arr[j]];
                                        if (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "") {
                                            var bottom_index = get_shelf_item_ind(p_module_index, p_shelf_index, items.BottomObjID, p_pog_index);
                                            if (p_item_depth_arr[j] > shelfdtl.ItemInfo[bottom_index].D) {
                                                if (p_alert_ind == "Y") {
                                                    alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                                }
                                                g_error_category = "D";
                                                return false;
                                            }
                                        } else if (typeof items.TopObjID !== "undefined" && items.TopObjID !== "") {
                                            var top_index = get_shelf_item_ind(p_module_index, p_shelf_index, items.TopObjID, p_pog_index);
                                            if (p_item_depth_arr[j] < shelfdtl.ItemInfo[top_index].D) {
                                                if (p_alert_ind == "Y") {
                                                    alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                                                }
                                                g_error_category = "D";
                                                return false;
                                            }
                                        }
                                    }
                                }
                            }
                        } //ASA-1442 issue 1
                    }
                }
            }
        }
        if ((p_shelf_obj_type == "CHEST" || p_shelf_obj_type == "PALLET") && p_final_x !== -1) {
            if (p_shelf_obj_type == "PALLET" && p_valid_bottom == "Y") {
                for (j = 0; j < p_item_index_arr.length; j++) {
                    var items = shelfdtl.ItemInfo[p_item_index_arr[j]];
                    if (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "") {
                        var bottom_index = get_shelf_item_ind(p_module_index, p_shelf_index, items.BottomObjID, p_pog_index);
                        if (p_item_depth_arr[j] > shelfdtl.ItemInfo[bottom_index].D) {
                            if (p_alert_ind == "Y") {
                                alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                            }
                            g_error_category = "D";
                            return false; //ASA-1129
                        }
                    } else if (typeof items.TopObjID !== "undefined" && items.TopObjID !== "") {
                        var top_index = get_shelf_item_ind(p_module_index, p_shelf_index, items.TopObjID, p_pog_index);
                        if (p_item_depth_arr[j] < shelfdtl.ItemInfo[top_index].D) {
                            if (p_alert_ind == "Y") {
                                alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                            }
                            g_error_category = "D";
                            return false; //ASA-1129
                        }
                    }
                }
            } else {
                var items_arr = shelfdtl.ItemInfo;
                var errored = "N";
                var i = 0;
                for (const items of items_arr) {
                    if (p_item_index_arr.indexOf(i) !== -1) {
                        var item_start = wpdSetFixed(p_final_x - shelfdtl.ItemInfo[i].W / 2);
                        var item_end = wpdSetFixed(p_final_x + shelfdtl.ItemInfo[i].W / 2);
                        if (item_start < wpdSetFixed(shelfdtl.X - shelfdtl.W / 2 - shelfdtl.LOverhang) || item_end > wpdSetFixed(shelfdtl.X + shelfdtl.W / 2 + shelfdtl.ROverhang)) {
                            errored == "Y";
                        }
                    }
                    i++;
                }
                if (errored == "Y") {
                    if (p_alert_ind == "Y") {
                        alert(get_message("LOST_FROM_FIXTURE_AREA", shelfdtl.Shelf));
                    }
                    g_error_category = "W";
                    return false; //ASA-1129
                } else {
                    return true;
                }
            }
        } else if (p_shelf_obj_type == "HANGINGBAR" && p_final_x !== -1) {
            //for hanging bar we check the depth of item with max merch of the hangingabar, if no maxmerch we use dfault value set in BU param.
            if (p_item_index !== -1) {
                if ((shelfdtl.ItemInfo[p_item_index].D > shelfdtl.MaxMerch && shelfdtl.MaxMerch > 0) || (shelfdtl.ItemInfo[p_item_index].D > g_hangbar_dft_maxmerch && shelfdtl.MaxMerch == 0 && g_hangbar_dft_maxmerch > 0)) {
                    //ASA-1129
                    if (g_overhung_validation !== "Y") {  //ASA-1910 Issue 3 remove one condition g_overhung_shelf_active == "Y"
                        if (g_overhung_shelf_active == "Y") {   //ASA-1910 Issue 3 add condition
                            shelfdtl["Overhung"] = "Y";
                        }
                        return true;
                    }
                    if (p_alert_ind == "Y") {
                        alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                    }
                    g_error_category = "D";
                    return false;
                } else {
                    return true;
                }
            } else {
                var items_arr = shelfdtl.ItemInfo;
                var errored = "N";
                var i = 0;
                for (const items of items_arr) {
                    if (p_item_index_arr.indexOf(i) !== -1) {
                        if ((shelfdtl.MaxMerch > 0 && items.D > shelfdtl.MaxMerch) || (items.D > g_hangbar_dft_maxmerch && shelfdtl.MaxMerch == 0 && g_hangbar_dft_maxmerch > 0)) {
                            //ASA-1129
                            errored = "Y";
                        }
                    }
                    i++;
                }
                if (errored == "Y") {
                    if (p_alert_ind == "Y") {
                        alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                    }
                    g_error_category = "D";
                    return false;
                } else {
                    if (g_overhung_validation !== "Y") {  //ASA-1910 Issue 3 remove one condition g_overhung_shelf_active == "Y"
                        if (g_overhung_shelf_active == "Y") {   //ASA-1910 Issue 3 add condition
                            shelfdtl["Overhung"] = "Y";
                        }
                        // return true; ASA-1910 Issue 1, 2
                    }
                    return true; //ASA-1910 Issue 1, 2
                }
            }
        } else if (p_shelf_obj_type == "ROD") {//for rod we use the shelf D with all the items depth.
            var in_depth_sum = 0;
            if (shelfdtl.ItemInfo.length > 0) {
                $.each(shelfdtl.ItemInfo, function (i, items) {
                    in_depth_sum += items.D + depth_gap;
                });
            }

            if (in_depth_sum > shelfdtl.D) {
                if (p_alert_ind == "Y") {
                    alert(get_message("LOST_FROM_SHELF_ERR_DEPTH", shelfdtl.Shelf));
                }
                g_error_category = "D";
                return false;
            }

            g_error_category = "";
            logDebug("function : validate_items", "E");
            return true;
        } else {
            g_error_category = "";
            logDebug("function : validate_items", "E");
            return true;
        }
    } catch (err) {
        error_handling(err);
    }
}

function find_prev_ind(p_items_arr, p_item_index, p_item_bottom, p_spread_product) {
    logDebug("function : find_prev_ind; i_item_index : " + p_item_index + "; item_bottom : " + p_item_bottom + "; spread_product : " + p_spread_product, "S");
    var max_index = -1;
    if (p_item_index > 0) {
        if (p_spread_product !== "R") {
            $.each(p_items_arr, function (i, items) {
                if (i < p_item_index && p_item_bottom == wpdSetFixed(items.Y + items.H / 2)) {
                    max_index = Math.max(max_index, i);
                }
            });
        } else {
            $.each(p_items_arr, function (i, items) {
                if (i > p_item_index && p_item_bottom == wpdSetFixed(items.Y + items.H / 2)) {
                    if (max_index !== -1) {
                        max_index = Math.min(max_index, i);
                    } else {
                        max_index = i;
                    }
                }
            });
        }
    }

    if (max_index == -1) {
        if (p_spread_product !== "R") {
            $.each(p_items_arr, function (i, items) {
                if (i > p_item_index && p_item_bottom == wpdSetFixed(items.Y + items.H / 2)) {
                    if (max_index !== -1) {
                        max_index = Math.min(max_index, i);
                    } else {
                        max_index = i;
                    }
                }
            });
        } else {
            $.each(p_items_arr, function (i, items) {
                if (i < p_item_index && p_item_bottom == wpdSetFixed(items.Y + items.H / 2)) {
                    max_index = Math.max(max_index, i);
                }
            });
        }
    }
    logDebug("function : find_prev_ind", "E");
    return max_index;
}

function get_item_index(p_obj_id, p_check_type, p_pog_index) {
    logDebug("function : get_item_index; obj_id : " + p_obj_id + "; check_type : " + p_check_type, "S");
    var l_module_index = (g_shelf_index = l_item_index = -1);
    var module_details = g_pog_json[p_pog_index].ModuleInfo;
    var j = 0;
    for (const Modules of module_details) {
        if (l_item_index > -1) {
            break; //return false;
        }
        if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
            var k = 0;
            for (const Shelf of Modules.ShelfInfo) {
                if (l_item_index > -1) {
                    break; //return false;
                }
                if (typeof Shelf !== "undefined") {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                        if (Shelf.ItemInfo.length > 0) {
                            var l = 0;
                            for (const items of Shelf.ItemInfo) {
                                var check_id = p_check_type == "C" ? items.CompItemObjID : items.ObjID;
                                if (check_id == p_obj_id) {
                                    l_module_index = j;
                                    g_shelf_index = k;
                                    l_item_index = l;
                                    break; //return false;
                                }
                                l++;
                            }
                        }
                    }
                }
                k++;
            }
        }
        j++;
    }

    logDebug("function : get_item_index", "E");
    return [l_module_index, g_shelf_index, l_item_index];
}

function get_shelf_item_ind(p_module_index, p_shelf_index, p_obj_id, p_pog_index) {
    logDebug("function : get_shelf_item_ind; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; obj_id : " + p_obj_id, "S");
    var item_details = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
    var g_item_index = -1;
    var j = 0;
    for (const items of item_details) {
        if (items.ObjID == p_obj_id) {
            g_item_index = j;
            break; //return false;
        }
        j++;
    }
    logDebug("function : get_shelf_item_ind", "E");
    return g_item_index;
}

//This function is used to get the quantity column for basket edit. 
function get_basket_fill_count(p_module_index, p_shelf_index, p_basket_spread, p_basket_fill, p_shelf_width, p_max_merch, p_shelf_depth, p_pog_index) {
    logDebug("function : get_basket_fill_count; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; basket_spread : " + p_basket_spread + "; basket_fill : " + p_basket_fill + "; shelf_width : " + p_shelf_width + "; max_merch : " + p_max_merch + "; shelf_depth : " + p_shelf_depth, "S");
    var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
    var wall_thick = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].BsktWallThickness * 2;
    var fb_depth = wpdSetFixed(p_shelf_depth - wall_thick);//.toFixed(2));
    var total_depth = 0;
    var quantity = 0;
    for (const items of items_arr) {
        if (items.Item !== "DIVIDER") {
            total_depth = total_depth + items.D;
            console.log("items.D", items, items.D, total_depth);
        }
    }
    if (p_basket_fill == "F") {
        if (p_basket_spread == "LR") {
            for (i = 1; i < 1000; i++) {
                if (total_depth * i > p_shelf_width) {
                    quantity = i - 1;
                    break;
                }
            }
        } else if (p_basket_spread == "BT") {
            for (i = 1; i < 1000; i++) {
                if (total_depth * i > p_max_merch) {
                    quantity = i - 1;
                    break;
                }
            }
        } else if (p_basket_spread == "FB") {
            for (i = 1; i < 1000; i++) {
                if (total_depth * i > fb_depth) {
                    quantity = i - 1;
                    break;
                }
            }
        }
    }
    if (quantity == 0) {
        quantity = 1;
    }
    logDebug("function : get_basket_fill_count", "E");
    return quantity;
}

function get_min_shelf(p_module_index, p_final_y, p_pog_index) {
    logDebug("function : get_min_shelf; p_module_index : " + p_module_index + "; p_final_y : " + p_final_y, "S");
    var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
    var min_distance_arr = [];
    var min_index_arr = [];
    var i = 0;
    for (const shelfs of shelf_arr) {
        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
            if (shelfs.Y < p_final_y) {
                min_distance_arr.push(parseFloat(p_final_y) - shelfs.Y);
                min_index_arr.push(i);
            }
        }
        i++;
    }
    if (min_distance_arr.length > 0) {
        var min_distance = Math.min.apply(Math, min_distance_arr);
        var index = min_distance_arr.findIndex(function (number) {
            return number == min_distance;
        });
        div_shelf_index = min_index_arr[index];
        shelf_found = "Y";
    } else {
        div_shelf_index = 0;
        shelf_found = "N";
    }
    logDebug("function : get_min_shelf", "E");
    return div_shelf_index + "," + shelf_found;
}
//ASA-1386
//This function is used in mouse up and multi_drag_setup. this is used to reset the crush perc to newly dragged place and then do the 
//processing of each item. basically we are setting everything to 0 and then call the crushitem again from scratch to crush again based on 
//new values.
async function reset_auto_crush(p_module_index, p_shelf_index, p_edit_item_index, p_pog_index, p_div_mod_idex, p_div_shelf_index, p_div_pog_index) {
    //ASA-1343 issue 1
    logDebug("function : reset_auto_crush; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; edit_item_index : " + p_edit_item_index, "S");
    var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
    var div_shelfdtl = g_pog_json[p_div_pog_index].ModuleInfo[p_div_mod_idex].ShelfInfo[p_div_shelf_index]; //ASA-1343 issue 1 .. //ASA-1685
    var items_arr = shelfdtl.ItemInfo;
    var crush_index_arr = [];
    var new_item_sum = 0;
    var crush_item_ind = "N";
    var new_crush_perc = 0;
    var sum_width = 0;
    var i = 0;
    var j = 0;

    var horiz_gap = shelfdtl.HorizGap;
    var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
    if (currCombinationIndex == -1 && currShelfCombIndx == -1) {
        //shelfdtl.AllowAutoCrush == 'Y' && g_overhung_shelf_active == 'N'
        if (shelfdtl.ObjType !== "PEGBOARD" && !(g_chest_as_pegboard == "Y" && shelfdtl.ObjType == "CHEST" && typeof shelfdtl.peg_vert_values !== "undefined")) {
            if (g_overhung_shelf_active == "Y" && shelfdtl.AllowAutoCrush == "N") {
                var j = 0;
                for (const items of items_arr) {
                    /*var orientation = typeof items == "undefined" ? -1 : items.Orientation;//ASA-1398 issue 3
                    var [item_owidth, item_oheight, item_odepth, actualHeight, wActualWidth, actualdepth] = get_new_orientation_dim(orientation, 0, 0, 0);//ASA-1398 issue 3
                    shelfdtl.ItemInfo[j].W = items.RW;
                    //ASA-1398 issue 3 -S
                    if (wActualWidth == 'W') {
                    shelfdtl.ItemInfo[j].CrushHoriz = 0;
                    } else if (wActualWidth == 'H') {
                    shelfdtl.ItemInfo[j].CrushVert = 0;
                    } else if (wActualWidth == 'D') {
                    shelfdtl.ItemInfo[j].CrushD = 0;
                    } //ASA-1398 issue 3 -E
                     */
                    //ASA-1386 Issue 15

                    //ASA-1485
                    if ((shelfdtl.ItemInfo[j].CapFacing == "0" || shelfdtl.ItemInfo[j].CapFacing == "") && shelfdtl.ItemInfo[j].NVal == 0) {
                        shelfdtl.ItemInfo[j].W = items.RW;
                        shelfdtl.ItemInfo[j].H = items.RH;
                        shelfdtl.ItemInfo[j].D = items.RD;
                    }
                    shelfdtl.ItemInfo[j].CrushHoriz = 0;
                    shelfdtl.ItemInfo[j].CrushVert = 0;
                    shelfdtl.ItemInfo[j].CrushD = 0;
                    shelfdtl.ItemInfo[j].MHorizCrushed = "N";
                    shelfdtl.ItemInfo[j].MVertCrushed = "N";
                    shelfdtl.ItemInfo[j].MDepthCrushed = "N";
                    j++;
                }
            } else {
                var i = 0;
                for (const items of items_arr) {
                    if (items.Fixed == "N" && items.CWPerc > 0 && ((shelfdtl.AllowAutoCrush == "Y" && items.MHorizCrushed == "N") || shelfdtl.AllowAutoCrush == "N")) {
                        crush_item_ind = "Y";
                        crush_index_arr.push(i);
                    }
                    i++;
                }

                if (crush_item_ind == "Y") {
                    crush_item_ind = "N";
                    var j = 0;
                    for (const items of items_arr) {
                        if (p_edit_item_index !== j) {
                            if (shelfdtl.AllowAutoCrush == "Y" && items.MHorizCrushed == "Y") {
                                sum_width += items.W;
                            } else {
                                sum_width += items.RW;
                            }
                            if (horiz_gap > 0) {
                                sum_width += items.SpreadItem;
                            }
                        }
                        j++;
                    }

                    if (sum_width <= shelfdtl.W) {
                        var j = 0;
                        for (const items of items_arr) {
                            if (crush_index_arr.indexOf(j) !== -1 && j !== p_edit_item_index && ((shelfdtl.AllowAutoCrush == "Y" && items.MHorizCrushed == "N") || shelfdtl.AllowAutoCrush == "N")) {
                                var orientation = typeof items == "undefined" ? -1 : items.Orientation; //ASA-1398 issue 3
                                var [item_owidth, item_oheight, item_odepth, actualHeight, wActualWidth, actualdepth] = get_new_orientation_dim(orientation, 0, 0, 0); //ASA-1398 issue 3
                                shelfdtl.ItemInfo[j].W = items.RW;
                                if (wActualWidth == 'W') { //ASA-1398 issue 3 -S
                                    shelfdtl.ItemInfo[j].CrushHoriz = 0;
                                } else if (wActualWidth == 'H') {
                                    shelfdtl.ItemInfo[j].CrushVert = 0;
                                } else if (wActualWidth == 'D') {
                                    shelfdtl.ItemInfo[j].CrushD = 0;
                                } //ASA-1398 issue 3 -E
                                if (shelfdtl.AllowAutoCrush == "N") {
                                    shelfdtl.ItemInfo[j].MHorizCrushed = "N"; //ASA-1386 issue 7
                                }
                            }
                            j++;
                        }
                    } else if (shelfdtl.AllowAutoCrush == "Y") {
                        var j = 0;
                        for (const items of items_arr) {
                            if (p_edit_item_index !== j) {
                                await crushItem(p_pog_index, p_module_index, p_shelf_index, j, "W", "Y", -1, -1);
                            }
                            j++;
                        }
                        // for (i = 1; i <= 100; i++) {
                        //   new_item_sum = sum_width;
                        //   var j = 0;
                        //   for (const items of items_arr) {
                        //     if (p_edit_item_index !== j) {
                        //       if (crush_index_arr.indexOf(j) !== -1 && i <= items.CWPerc) {
                        //         var new_width = items.RW - items.RW * (i / 100);
                        //         if (new_width >= items.RW - items.RW * (items.CWPerc / 100)) {
                        //           new_item_sum -= items.RW * (i / 100);
                        //           shelfdtl.ItemInfo[j].W = new_width;
                        //           shelfdtl.ItemInfo[j].CrushHoriz = i;
                        //         }
                        //       }
                        //     }
                        //     j++;
                        //   }
                        //   if (new_item_sum <= shelfdtl.W && i !== 1) {
                        //     new_crush_perc = i;
                        //     crush_item_ind = "Y";
                        //     break;
                        //   }
                        // }
                    }
                    if (reorder_items(p_module_index, p_shelf_index, p_pog_index)) {
                        console.log("reorderedin crush");
                    }
                }
            }
            if (shelfdtl.ObjType == "SHELF") {
                var z = 0;
                for (const items of items_arr) {
                    if (z == p_edit_item_index && items.MVertCrushed == "N") {
                        var orientation = typeof items == "undefined" ? -1 : items.Orientation; //ASA-1398 issue 3
                        var [item_owidth, item_oheight, item_odepth, actualHeight, wActualWidth, actualdepth] = get_new_orientation_dim(orientation, 0, 0, 0); //ASA-1398 issue 3
                        if (items.CrushVert > 0 && (items.CapFacing == "0" || items.CapFacing == "") && items.NVal == 0) {
                            items.H = items.RH;
                            shelfdtl.ItemInfo[z].H = items.RH;
                            var [itemx, itemy] = get_item_xy(shelfdtl, items, items.W, items.H, p_pog_index);
                            shelfdtl.ItemInfo[z].Y = itemy;
                            if (items.MVertCrushed == "N") {
                                if (actualHeight == 'H') { //ASA-1438 Task 2
                                    shelfdtl.ItemInfo[z].CrushVert = 0;
                                } else if (actualHeight == 'W') {
                                    shelfdtl.ItemInfo[z].CrushHoriz = 0;
                                } else if (actualHeight == 'D') {
                                    shelfdtl.ItemInfo[z].CrushD = 0;
                                } //ASA-1438 Task 2 -E
                            }
                        }
                        if (items.CrushD > 0) {
                            items.D = items.RD;
                            shelfdtl.ItemInfo[z].D = items.RD;
                            if (items.MDepthCrushed == "N") {
                                if (actualdepth == 'H') { //ASA-1438 Task 2
                                    shelfdtl.ItemInfo[z].CrushVert = 0;
                                } else if (actualdepth == 'W') {
                                    shelfdtl.ItemInfo[z].CrushHoriz = 0;
                                } else if (actualdepth == 'D') {
                                    shelfdtl.ItemInfo[z].CrushD = 0;
                                } //ASA-1438 Task 2 -E
                            }
                        }
                    }
                    z++;
                }
            }
        } else if (g_chest_as_pegboard == "Y" && (shelfdtl.ObjType == "CHEST" || div_shelfdtl.ObjType == "CHEST")) {
            // && (typeof shelfdtl.peg_vert_values !== "undefined" || typeof div_shelf.peg_vert_values !== "undefined")) {//ASA-1343 issue 1
            if (typeof div_shelfdtl.ItemInfo[p_edit_item_index] !== "undefined") {
                //ASA-1343 issue 1
                var itemdtl = div_shelfdtl.ItemInfo[p_edit_item_index];
            } else {
                var itemdtl = shelfdtl.ItemInfo[p_edit_item_index];
            }

            if (p_edit_item_index !== -1 && typeof itemdtl !== "undefined") {
                var orientation = typeof itemdtl == "undefined" ? -1 : itemdtl.Orientation; //ASA-1398 issue 3
                var [item_owidth, item_oheight, item_odepth, actualHeight, wActualWidth, actualdepth] = get_new_orientation_dim(orientation, 0, 0, 0); //ASA-1398 issue 3
                if (itemdtl.MHorizCrushed == "N") {
                    //ASA-1343 issue 1 //20240415 Rregression issue 29 20240430 should be revert to original when manually crushed. this is commented wrongly.
                    itemdtl.W = itemdtl.RW;
                    if (wActualWidth == 'W') { //ASA-1398 ISSUE 3 -S
                        itemdtl.CrushHoriz = 0;
                    } else if (wActualWidth == 'H') {
                        itemdtl.CrushVert = 0;
                    } else if (wActualWidth == 'D') {
                        itemdtl.CrushD = 0;
                    } //ASA-1398 ISSUE 3 -E
                }
                if (itemdtl.MVertCrushed == "N") {
                    //ASA-1343 issue 1//20240415 Rregression issue 29 20240430 should be revert to original when manually crushed. this is commented wrongly.
                    itemdtl.H = itemdtl.RH;
                    if (actualHeight == 'H') { //ASA-1398 ISSUE 3 -S
                        itemdtl.CrushVert = 0;
                    } else if (actualHeight == 'W') {
                        itemdtl.CrushHoriz = 0;
                    } else if (actualHeight == 'D') {
                        itemdtl.CrushD = 0;
                    } //ASA-1398 ISSUE 3 -E
                }
                if (itemdtl.MDepthCrushed == "N") {
                    //ASA-1343 issue 1//20240415 Rregression issue 29 20240430 should be revert to original when manually crushed. this is commented wrongly.
                    itemdtl.D = itemdtl.RD;
                    if (actualdepth == 'W') { //ASA-1398 ISSUE 3
                        itemdtl.CrushHoriz = 0;
                    } else if (actualdepth == 'H') {
                        itemdtl.CrushVert = 0;
                    } else if (actualdepth == 'D') {
                        itemdtl.CrushD = 0;
                    } //ASA-1398 ISSUE 3 -E;
                }
            }
        }
    } else {
        //ASA-1386 issue 7
        l_allow_comb_crush = g_combinedShelfs[currCombinationIndex][0].AllowAutoCrush;
        var items_arr = g_combinedShelfs[currCombinationIndex].ItemInfo;
        if (l_allow_comb_crush == "N") { //ASA-1386 Issue 7
            for (const items of items_arr) {
                /*var orientation = typeof items == "undefined" ? -1 : items.Orientation;
                var [item_owidth, item_oheight, item_odepth, actualHeight, wActualWidth, actualdepth] = get_new_orientation_dim(orientation, 0, 0, 0);
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].W = items.RW;
                if (wActualWidth == 'W') {
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].CrushHoriz = 0;
                } else if (wActualWidth == 'H') {
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].CrushVert = 0;
                } else if (wActualWidth == 'D') {
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].CrushD = 0;
                }*/
                //ASA-1386 Issue 15
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].W = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].RW;
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].H = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].RH;
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].D = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].RD;
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].CrushHoriz = 0;
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].CrushVert = 0;
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].CrushD = 0;
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].MHorizCrushed = "N";
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].MVertCrushed = "N";
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].MDepthCrushed = "N";
            }
        } else if (l_allow_comb_crush == "Y") {
            //ASA-1386 Issue 13 20240528
            await crushItem(p_pog_index, g_combinedShelfs[currCombinationIndex][0].MIndex, g_combinedShelfs[currCombinationIndex][0].SIndex, -1, "W", "Y", -1, -1);
        }
    }
    logDebug("function : reset_auto_crush", "E");
    return "SUCCESS";
}

async function find_select_module(p_pog_index) {
    logDebug("function : get_multiselect_obj", "S");
    try {
        var mod_count = 0;
        for (const modules of g_pog_json[0].ModuleInfo) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                mod_count++;
            }
        }
        var mod_list = [];
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            var module_details = g_pog_json[p_pog_index].ModuleInfo;
            var j = 0;
            for (const modules of module_details) {
                if (modules.ParentModule == null || modules.ParentModule == "undefined") {
                    var details = get_actual_mod_xy(modules, modules.W, modules.H, modules.X - modules.W / 2);
                    detail_arr = details.split("###");

                    var mod_left = detail_arr[4];
                    var mod_right = detail_arr[6];
                    var mod_bottom = detail_arr[5];
                    var mod_top = detail_arr[7];

                    if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
                        if (mod_left >= g_DragMouseStart.x && mod_right >= g_DragMouseStart.x && mod_bottom <= g_DragMouseStart.y && mod_top <= g_DragMouseStart.y && mod_left <= g_DragMouseEnd.x && mod_right <= g_DragMouseEnd.x && mod_bottom >= g_DragMouseEnd.y && mod_top >= g_DragMouseEnd.y) {
                            mod_list.push(j);
                        }
                    } else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
                        if (mod_left >= g_DragMouseEnd.x && mod_right >= g_DragMouseEnd.x && mod_bottom >= g_DragMouseEnd.y && mod_top >= g_DragMouseEnd.y && mod_left <= g_DragMouseStart.x && mod_right <= g_DragMouseStart.x && mod_bottom <= g_DragMouseStart.y && mod_top <= g_DragMouseStart.y) {
                            mod_list.push(j);
                        }
                    } else if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
                        if (mod_left >= g_DragMouseStart.x && mod_right >= g_DragMouseStart.x && mod_bottom >= g_DragMouseStart.y && mod_top >= g_DragMouseStart.y && mod_left <= g_DragMouseEnd.x && mod_right <= g_DragMouseEnd.x && mod_bottom <= g_DragMouseEnd.y && mod_top <= g_DragMouseEnd.y) {
                            mod_list.push(j);
                        }
                    } else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
                        if (mod_left <= g_DragMouseStart.x && mod_right <= g_DragMouseStart.x && mod_bottom >= g_DragMouseStart.y && mod_top >= g_DragMouseStart.y && mod_left >= g_DragMouseEnd.x && mod_right >= g_DragMouseEnd.x && mod_bottom <= g_DragMouseEnd.y && mod_top <= g_DragMouseEnd.y) {
                            mod_list.push(j);
                        }
                    }
                }
                j++;
            }
        }
        console.log("mod_list", mod_list);
        return mod_list;
        logDebug("function : get_multiselect_obj", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is used to duplicate any object. if user hold ctrl and drag any object. we will copy and create another similar object.
//if shelf is copied only shelf will be crated. but when copy module all shelfs and items will be created again.
async function duplicate_drag_obj(p_final_x, p_final_y, p_ModIndex, p_ShelfIndex, p_shelf_edit_flag, p_module_edit_flag, p_camera, p_StartCanvas, p_pog_index, p_Item_copy = "Y") {
    logDebug("function : duplicate_drag_obj; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y + "; pModIndex : " + p_ModIndex + "; pShelfIndex : " + p_ShelfIndex + "; i_shelf_edit_flag : " + p_shelf_edit_flag + "; i_module_edit_flag : " + p_module_edit_flag, "S");
    try {
        var curr_module = -1;
        var shelfdtl = g_pog_json[p_StartCanvas].ModuleInfo[p_ModIndex].ShelfInfo[p_ShelfIndex];

        if (g_dup_mod_list.length > 0) {
            var i = 0;
            for (const modules of g_pog_json[0].ModuleInfo) {
                if ((typeof modules.ParentModule == "undefined" || modules.ParentModule == null) && typeof g_dup_mod_list.find((e) => e == i) !== "undefined") {
                    g_module_edit_flag = "Y";
                    g_module_index = i;
                    g_multiItemCopy = "N";
                    context_copy("S", p_StartCanvas);
                    g_cut_action_done = "N";
                    g_copy_action_done = "N";
                    g_dup_action_done = "Y";
                    g_delete_action_done = "N";
                    g_multi_delete_done = "N";
                    g_multi_copy_done = "N";

                    var returnval = await context_paste("COPY", p_camera, "Y", p_Item_copy, p_pog_index, p_StartCanvas);
                    var details = {};
                    details["MIndex"] = g_pog_json[p_pog_index].ModuleInfo.length - 1;
                    details["MObjID"] = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].MObjID;
                    details["SIndex"] = "";
                    details["SObjID"] = "";
                    details["ObjType"] = "";
                }
                i++;
            }
            g_dup_mod_list = [];
        } else {
            if (p_shelf_edit_flag == "Y") {
                var shelfs = JSON.parse(JSON.stringify(shelfdtl));
                shelfs.ItemInfo = [];
                var allow_crush = shelfdtl.AllowAutoCrush;
                var items_arr = [];
                g_cut_copy_arr[0].X = p_final_x;
                g_cut_copy_arr[0].Y = p_final_y;
                console.log("final x and y ", g_cut_copy_arr[0].X, g_cut_copy_arr[0].Y);
                var set_alert_ind = shelfs.ObjType == 'TEXTBOX' ? "N" : "Y"; //ASA-1804
                var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(p_final_x, p_final_y, p_shelf_edit_flag, p_ModIndex, p_ShelfIndex, shelfs, p_pog_index);
                var validate_passed = validate_shelf_min_distance(curr_module, p_ShelfIndex, p_final_y, items_arr, allow_crush, p_ModIndex, p_final_x, set_alert_ind, shelfs, p_pog_index); //ASA-1804 set_alert_ind used to handle alert box.
                if ((validate_passed == "Y" || validate_passed == "R") || (shelfs.ObjType == 'TEXTBOX' && validate_passed == "N")) { //ASA-1804 Added condition to copy textbox always.
                    g_cut_action_done = "N";
                    g_copy_action_done = "N";
                    g_dup_action_done = "Y";
                    g_delete_action_done = "N";
                    g_multi_delete_done = "N";
                    g_multi_copy_done = "N";
                    var i = 0;
                    for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                        if (parseFloat(p_final_x) > parseFloat(modules.X) - modules.W / 2 && parseFloat(p_final_x) < parseFloat(modules.X) + modules.W / 2 && parseFloat(p_final_y) > parseFloat(modules.Y) - modules.H / 2 && parseFloat(p_final_y) < parseFloat(modules.Y) + modules.H / 2 && (modules.ParentModule == null || typeof modules.ParentModule == "undefined")) {
                            curr_module = i;
                            break; //return false;
                        }
                        i++;
                    }
                    if (curr_module == -1) {
                        var i = 0;
                        for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                            if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                                curr_module = i;
                                break; //return false;
                            }
                            i++;
                        }
                    }

                    if (g_cut_loc_arr[0].ShelfObjType == "TEXTBOX" && g_cut_support_obj_arr.length > 0) {
                        g_pog_json[p_pog_index].ModuleInfo.push(g_cut_support_obj_arr[0]);
                    }
                    p_ModIndex = curr_module;
                    g_cut_copy_arr[0].Shelf = g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].Module + (g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.length + 1);
                    g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.push(g_cut_copy_arr[0]);
                    p_ShelfIndex = g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.length - 1;

                    g_cut_copy_arr[0].ItemInfo = [];
                    async function doSomething() {
                        var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(g_cut_copy_arr[0], -1, -1, p_ModIndex, p_ShelfIndex, "N", "Y", p_camera, "Y", "", "Y", p_pog_index);
                        var details = {};

                        details["MIndex"] = p_ModIndex;
                        details["MObjID"] = g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].MObjID;
                        details["SIndex"] = p_ShelfIndex;
                        details["SObjID"] = shelfdtl.SObjID;
                        details["ObjType"] = shelfdtl.ObjType;
                        var undoObjectsInfo = [];
                        var objectID = shelfID;
                        undoObjectsInfo.moduleIndex = p_ModIndex;
                        undoObjectsInfo.shelfIndex = p_ShelfIndex;
                        undoObjectsInfo.actionType = "DUPLICATE_SHELF";
                        undoObjectsInfo.startCanvas = p_pog_index;
                        undoObjectsInfo.g_present_canvas = g_start_canvas;
                        undoObjectsInfo.objectID = objectID;
                        undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].MObjID;
                        undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].Module;
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfdtl)));
                        var newItemInfo = JSON.parse(JSON.stringify(shelfdtl.ItemInfo));
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                        logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
                        g_allUndoObjectsInfo = [];
                        var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo;
                        l_shelf_details.sort((a, b) => (a.Y > b.Y && a.ObjType !== "NOTCH" && a.ObjType !== "BASE" ? 1 : -1));
                        l_shelf_details.sort((a, b) => (a.Y > b.Y && a.ObjType !== "NOTCH" && a.ObjType !== "BASE" ? 1 : -1));
                        var res = await calculateFixelAndSupplyDays("N", p_pog_index);
                    }
                    doSomething();

                    if (g_manual_zoom_ind == "N") {
                        var details = get_min_max_xy(p_pog_index);
                        var details_arr = details.split("###");
                        set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
                    }
                }
            } else if (p_module_edit_flag == "Y") {
                g_cut_action_done = "N";
                g_copy_action_done = "N";
                g_dup_action_done = "Y";
                g_delete_action_done = "N";
                g_multi_delete_done = "N";
                g_multi_copy_done = "N";

                async function doSomething() {
                    var returnval = await context_paste("COPY", p_camera, "Y", p_Item_copy, p_pog_index, p_StartCanvas);
                    var details = {};
                    details["MIndex"] = g_pog_json[p_pog_index].ModuleInfo.length - 1;
                    details["MObjID"] = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].MObjID;
                    details["SIndex"] = "";
                    details["SObjID"] = "";
                    details["ObjType"] = "";
                }
                res = await doSomething();
            } else if (g_item_edit_flag == "Y") {
                g_cut_action_done = "N";
                g_copy_action_done = "N";
                g_dup_action_done = "Y";
                g_delete_action_done = "N";
                g_multi_delete_done = "N";
                g_multi_copy_done = "N";
                console.log("g_multi_copy_done", g_multi_copy_done);

                async function doSomething() {
                    var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(p_final_x, p_final_y, p_shelf_edit_flag, p_ModIndex, p_ShelfIndex, shelfs, p_pog_index);
                    p_ModIndex = curr_module;
                    var returnval = await context_paste("COPY", p_camera, "Y", p_Item_copy, p_pog_index, p_StartCanvas);
                    var details = {};
                    details["MIndex"] = g_pog_json[p_pog_index].ModuleInfo.length - 1;
                    details["MObjID"] = g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].MObjID;
                    details["SIndex"] = "";
                    details["SObjID"] = "";
                    details["ObjType"] = "";
                }
                res = await doSomething();

                //recreate the orientation view if any present
                async function recreate_view() {
                    var returnval = await recreate_compare_views(g_compare_view, "N");
                }
                recreate_view();
                g_cut_copy_arr = [];
                g_cut_support_obj_arr = [];
                g_cut_loc_arr = [];
                loc_details = {};
                g_undo_details = [];
                g_duplicating = "N";
                g_drag_inprogress = "N";
            }
        }
        logDebug("function : duplicate_drag_obj", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is used after drop. we find out in which module the object is dropped.
function get_curr_module(p_final_x, p_final_y, p_shelf_edit_flag, p_module_index, p_shelf_index, p_shelfs, p_pog_index) {
    logDebug("function : get_curr_module; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y + "; i_shelf_edit_flag : " + p_shelf_edit_flag + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
    try {
        var item_inside_world = "N",
            curr_module = -1,
            mod_left = 0,
            mod_right = 0,
            mod_bottom = 0,
            shelf_rotate_hit = "N",
            check_chest = "N",
            rotate_hit_module_ind = -1;
        mod_top = 0;

        //Checking dragged object is in which module
        if (curr_module == -1) { //Regression 8
            // Regression 8
            var l_module = 0;
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (indexModule, module) {
                if (module.ParentModule == null || typeof module.ParentModule == "undefined") {
                    $.each(module.ShelfInfo, function (indexShelf, shelf) {
                        if (shelf.ObjType == "CHEST") {
                            if (parseFloat(p_final_x) > parseFloat(shelf.X) - shelf.W / 2 && parseFloat(p_final_x) < parseFloat(shelf.X) + shelf.W / 2 && parseFloat(p_final_y) > parseFloat(shelf.Y) - shelf.H / 2 && parseFloat(p_final_y) < parseFloat(shelf.Y) + shelf.H / 2) {
                                curr_module = indexModule;
                                item_inside_world = "N";
                                check_chest = "Y";
                                return false;
                            }
                        }
                    });
                }
            });
        }
        if (check_chest == "N") {

            for (let i = 0; i < g_pog_json[p_pog_index].ModuleInfo.length; i++) { //vivek
                let modules = g_pog_json[p_pog_index].ModuleInfo[i];

                if (
                    parseFloat(p_final_x) > parseFloat(modules.X) - modules.W / 2 &&
                    parseFloat(p_final_x) < parseFloat(modules.X) + modules.W / 2 &&
                    parseFloat(p_final_y) > parseFloat(modules.Y) - modules.H / 2 &&
                    parseFloat(p_final_y) < parseFloat(modules.Y) + modules.H / 2 &&
                    (modules.ParentModule == null || typeof modules.ParentModule == "undefined")
                ) {
                    item_inside_world = "Y";
                    curr_module = i;
                    break;
                } else {


                    //ASA-1951 find nearest module based on the location of textbox


                    let nearest_index = -1;
                    let max_distance = Number.MAX_VALUE;

                    for (let j = 0; j < g_pog_json[p_pog_index].ModuleInfo.length; j++) {
                        let nearModule = g_pog_json[p_pog_index].ModuleInfo[j];
                        if (nearModule.ParentModule == null || typeof nearModule.ParentModule == "undefined") {
                            // Distance between dropped point and module center
                            let dir_x = parseFloat(p_final_x) - parseFloat(nearModule.X);
                            let dir_y = parseFloat(p_final_y) - parseFloat(nearModule.Y);
                            let dist = Math.sqrt(dir_x * dir_x + dir_y * dir_y);

                            if (dist < max_distance) {
                                max_distance = dist;
                                nearest_index = j;
                            }

                        }

                        if (nearest_index !== -1) {
                            curr_module = nearest_index;
                            item_inside_world = "N";
                        }
                    }
                    //ASA-1951 -E
                    // for (let j = 0; j < g_pog_json[p_pog_index].ModuleInfo.length; j++) {
                    //     let nearModule = g_pog_json[p_pog_index].ModuleInfo[j];

                    //     if (
                    //         (nearModule.ParentModule == null || typeof nearModule.ParentModule == "undefined") &&
                    //         parseFloat(p_final_x) > parseFloat(nearModule.X) - nearModule.W / 2 &&
                    //         parseFloat(p_final_x) < parseFloat(nearModule.X) + nearModule.W / 2
                    //     ) {
                    //         curr_module = j;
                    //         item_inside_world = "N";
                    //         break;
                    //     }
                    // }

                    if (curr_module == -1) {
                        for (let k = 0; k < g_pog_json[p_pog_index].ModuleInfo.length; k++) {
                            let defaultModule = g_pog_json[p_pog_index].ModuleInfo[k];

                            if (defaultModule.ParentModule == null || typeof defaultModule.ParentModule == "undefined") {
                                curr_module = k;
                                item_inside_world = "N";
                                break;
                            }
                        }
                    }
                }
            }


            // $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
            //     if (parseFloat(p_final_x) > parseFloat(modules.X) - modules.W / 2 && parseFloat(p_final_x) < parseFloat(modules.X) + modules.W / 2 && parseFloat(p_final_y) > parseFloat(modules.Y) - modules.H / 2 && parseFloat(p_final_y) < parseFloat(modules.Y) + modules.H / 2 && (modules.ParentModule == null || typeof modules.ParentModule == "undefined")) {
            //         item_inside_world = "Y";
            //         curr_module = i;
            //         return false;
            //     } else {
            //         $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) { //ASA-1284 -S check the shelf to near module and set in that module
            //             if ((modules.ParentModule == null || typeof modules.ParentModule == "undefined") && parseFloat(p_final_x) > parseFloat(modules.X) - modules.W / 2 && parseFloat(p_final_x) < parseFloat(modules.X) + modules.W / 2) {
            //                 curr_module = i;
            //                 item_inside_world = "N";
            //                 return false;
            //             }
            //         });
            //         if (curr_module == -1) { // if fixel outside and out from module then it set to 0
            //             $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
            //                 if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
            //                     curr_module = i;
            //                     item_inside_world = "N";
            //                     return false;
            //                 }
            //             });
            //         }
            //     } //ASA-1284 -E
            // });

            if (p_shelf_edit_flag == "Y") { //ASA-1300 to avoid using p_shelfs as it will be passed [] from multi_drag_setup.
                if (p_shelfs.Rotation !== 0 || p_shelfs.Slope !== 0) {
                    $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
                        if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                            mod_left = Math.min(mod_left, parseFloat(modules.X) - modules.W / 2);
                            mod_right = Math.max(mod_right, parseFloat(modules.X) + modules.W / 2);
                            mod_top = Math.max(mod_top, parseFloat(modules.Y) + modules.H / 2);
                            mod_bottom = Math.min(mod_bottom, parseFloat(modules.Y) - modules.H / 2);
                        }
                    });

                    if (p_final_x + p_shelfs.ShelfRotateWidth / 2 > mod_left && p_final_x - p_shelfs.ShelfRotateWidth / 2 < mod_right && p_final_y - p_shelfs.ShelfRotateHeight / 2 < mod_top && p_final_y + p_shelfs.ShelfRotateHeight / 2 > mod_bottom && p_shelfs.ObjType !== "TEXTBOX" && p_shelfs.Rotation !== 0 && p_shelfs.Slope == 0) {
                        shelf_rotate_hit = "Y";
                    } else {
                        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) { //ASA-1292 -S check the  slop shelp to near module and set in that module
                            if ((modules.ParentModule == null || typeof modules.ParentModule == "undefined") && parseFloat(p_final_x) > parseFloat(modules.X) - modules.W / 2 && parseFloat(p_final_x) < parseFloat(modules.X) + modules.W / 2) {
                                curr_module = i;
                                item_inside_world = "N";
                                return false;
                            }
                        });
                        if (curr_module == -1) { // if fixel outside and out from module then it set to 0
                            $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
                                if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                                    curr_module = i;
                                    item_inside_world = "N";
                                    return false;
                                }
                            });
                        }
                    }
                }
            }
        }
        logDebug("function : get_curr_module", "E");
        console.log("values", curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind);

        return [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind];
    } catch (err) {
        error_handling(err);
    }
}

("use strict");

// class DisclosureNav {
//     constructor(domNode) {
//         this.rootNode = domNode;
//         this.controlledNodes = [];
//         this.openIndex = null;
//         this.useArrowKeys = true;
//         this.topLevelNodes = [...this.rootNode.querySelectorAll(".main-link, button[aria-expanded][aria-controls]")];

//         this.topLevelNodes.forEach((node) => {
//             // handle button + menu
//             if (node.tagName.toLowerCase() === "button" && node.hasAttribute("aria-controls")) {
//                 const menu = node.parentNode.querySelector("ul");
//                 if (menu) {
//                     // save ref controlled menu
//                     this.controlledNodes.push(menu);

//                     // collapse menus
//                     node.setAttribute("aria-expanded", "false");
//                     this.toggleMenu(menu, false);

//                     // attach event listeners
//                     menu.addEventListener("keydown", this.onMenuKeyDown.bind(this));
//                     node.addEventListener("click", this.onButtonClick.bind(this));
//                     node.addEventListener("keydown", this.onButtonKeyDown.bind(this));
//                 }
//             }
//             // handle links
//             else {
//                 this.controlledNodes.push(null);
//                 node.addEventListener("keydown", this.onLinkKeyDown.bind(this));
//             }
//         });

//         this.rootNode.addEventListener("focusout", this.onBlur.bind(this));
//     }

//     controlFocusByKey(keyboardEvent, nodeList, currentIndex) {
//         switch (keyboardEvent.key) {
//             case "ArrowUp":
//             case "ArrowLeft":
//                 keyboardEvent.preventDefault();
//                 if (currentIndex > -1) {
//                     var prevIndex = Math.max(0, currentIndex - 1);
//                     nodeList[prevIndex].focus();
//                 }
//                 break;
//             case "ArrowDown":
//             case "ArrowRight":
//                 keyboardEvent.preventDefault();
//                 if (currentIndex > -1) {
//                     var nextIndex = Math.min(nodeList.length - 1, currentIndex + 1);
//                     nodeList[nextIndex].focus();
//                 }
//                 break;
//             case "Home":
//                 keyboardEvent.preventDefault();
//                 nodeList[0].focus();
//                 break;
//             case "End":
//                 keyboardEvent.preventDefault();
//                 nodeList[nodeList.length - 1].focus();
//                 break;
//         }
//     }

//     // public function to close open menu
//     close() {
//         this.toggleExpand(this.openIndex, false);
//     }

//     onBlur(event) {
//         var menuContainsFocus = this.rootNode.contains(event.relatedTarget);
//         if (!menuContainsFocus && this.openIndex !== null) {
//             this.toggleExpand(this.openIndex, false);
//         }
//     }

//     onButtonClick(event) {
//         var button = event.target;
//         var buttonIndex = this.topLevelNodes.indexOf(button);
//         var buttonExpanded = button.getAttribute("aria-expanded") === "true";
//         this.toggleExpand(buttonIndex, !buttonExpanded);
//     }

//     onButtonKeyDown(event) {
//         var targetButtonIndex = this.topLevelNodes.indexOf(document.activeElement);

//         // close on escape
//         if (event.key === "Escape") {
//             this.toggleExpand(this.openIndex, false);
//         }

//         // move focus into the open menu if the current menu is open
//         else if (this.useArrowKeys && this.openIndex === targetButtonIndex && event.key === "ArrowDown") {
//             event.preventDefault();
//             this.controlledNodes[this.openIndex].querySelector("a").focus();
//         }

//         // handle arrow key navigation between top-level buttons, if set
//         else if (this.useArrowKeys) {
//             this.controlFocusByKey(event, this.topLevelNodes, targetButtonIndex);
//         }
//     }

//     onLinkKeyDown(event) {
//         var targetLinkIndex = this.topLevelNodes.indexOf(document.activeElement);

//         // handle arrow key navigation between top-level buttons, if set
//         if (this.useArrowKeys) {
//             this.controlFocusByKey(event, this.topLevelNodes, targetLinkIndex);
//         }
//     }

//     onMenuKeyDown(event) {
//         if (this.openIndex === null) {
//             return;
//         }

//         var menuLinks = Array.prototype.slice.call(this.controlledNodes[this.openIndex].querySelectorAll("a"));
//         var currentIndex = menuLinks.indexOf(document.activeElement);

//         // close on escape
//         if (event.key === "Escape") {
//             this.topLevelNodes[this.openIndex].focus();
//             this.toggleExpand(this.openIndex, false);
//         }

//         // handle arrow key navigation within menu links, if set
//         else if (this.useArrowKeys) {
//             this.controlFocusByKey(event, menuLinks, currentIndex);
//         }
//     }

//     toggleExpand(index, expanded) {
//         // close open menu, if applicable
//         if (this.openIndex !== index) {
//             this.toggleExpand(this.openIndex, false);
//         }

//         // handle menu at called index
//         if (this.topLevelNodes[index]) {
//             this.openIndex = expanded ? index : null;
//             this.topLevelNodes[index].setAttribute("aria-expanded", expanded);
//             this.toggleMenu(this.controlledNodes[index], expanded);
//         }
//     }

//     toggleMenu(domNode, show) {
//         if (domNode) {
//             domNode.style.display = show ? "block" : "none";
//         }
//     }

//     updateKeyControls(useArrowKeys) {
//         this.useArrowKeys = useArrowKeys;
//     }
// }

/* Initialize Disclosure Menus */

window.addEventListener(
    "load",
    function () {
        var menus = document.querySelectorAll(".disclosure-nav");
        var disclosureMenus = [];

        for (var i = 0; i < menus.length; i++) {
            disclosureMenus[i] = new DisclosureNav(menus[i]);
        }

        // listen to arrow key checkbox
        var arrowKeySwitch = document.getElementById("arrow-behavior-switch");
        if (arrowKeySwitch) {
            arrowKeySwitch.addEventListener("change", function () {
                var checked = arrowKeySwitch.checked;
                for (var i = 0; i < disclosureMenus.length; i++) {
                    disclosureMenus[i].updateKeyControls(checked);
                }
            });
        }

        // fake link behavior
        disclosureMenus.forEach((disclosureNav, i) => {
            var links = menus[i].querySelectorAll('[href="#mythical-page-content"]');
            var examplePageHeading = document.getElementById("mythical-page-heading");
            for (var k = 0; k < links.length; k++) {
                // The codepen export script updates the internal link href with a full URL
                // we're just manually fixing that behavior here
                links[k].href = "#mythical-page-content";

                links[k].addEventListener("click", (event) => {
                    // change the heading text to fake a page change
                    var pageTitle = event.target.innerText;
                    examplePageHeading.innerText = pageTitle;

                    // handle aria-current
                    for (var n = 0; n < links.length; n++) {
                        links[n].removeAttribute("aria-current");
                    }
                    event.target.setAttribute("aria-current", "page");
                });
            }
        });
    },
    false);

function replaceMenuKey(p_innerText, p_innerHTML, p_shortcut_key) {
    var MenuText = p_innerText.trim();
    var accKey = MenuText;
    var letterInd = accKey.toUpperCase().indexOf(p_shortcut_key.toUpperCase());
    if (letterInd != -1) {
        accKey = accKey.replace(accKey.charAt(letterInd), "<b><u>" + accKey.charAt(letterInd) + "</u></b>");
    } else {
        accKey = accKey + "(" + "<b><u>" + p_shortcut_key.toUpperCase() + "</u></b>" + ")";
    }
    var MenuHtml = p_innerHTML;
    MenuHtml = MenuHtml.replace(MenuText, accKey);
    return MenuHtml;
}



function swapSpecialFixel(pMainMod, pSwapMod, pShelf) {
    var pattern = new RegExp("[" + pMainMod + "]/");
    var new_shelf_id = pShelf.Shelf.replace(pattern, pSwapMod);
    pShelf.Shelf = new_shelf_id;
}

function validate_shelf_inside_pegboard(p_moduleindex, p_shelfindex, p_pog_index, p_shelf_x, p_shelf_y, p_DivShelf) {
    var itemdtl = g_pog_json[p_pog_index].ModuleInfo[p_moduleindex].ShelfInfo[p_shelfindex].ItemInfo;
    var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_moduleindex].ShelfInfo[p_shelfindex];
    var validate = "Y";
    var shelf_top = p_shelf_y + shelfdtl.H / 2;
    var shelf_bottom = p_shelf_y - shelfdtl.H / 2;
    var shelf_start = p_shelf_x - shelfdtl.W / 2;
    var shelf_end = p_shelf_x + shelfdtl.W / 2;

    if (itemdtl.length > 0) {
        var i = 0;
        for (const items of itemdtl) {
            item_start = wpdSetFixed(items.X - items.W / 2);//.toFixed(4));
            item_end = wpdSetFixed(items.X + items.W / 2);//.toFixed(4));
            item_top = wpdSetFixed(items.Y + items.H / 2);//.toFixed(4));
            item_bottom = wpdSetFixed(items.Y - items.H / 2);//.toFixed(4));

            if (p_DivShelf.ItemInfo.length > 0) {
                for (const item of p_DivShelf.ItemInfo) {
                    div_start = wpdSetFixed(item.X - item.W / 2);//.toFixed(4));
                    div_end = wpdSetFixed(item.X + item.W / 2);//.toFixed(4));
                    div_top = wpdSetFixed(item.Y + item.H / 2);//.toFixed(4));
                    div_bottom = wpdSetFixed(item.Y - item.H / 2);//.toFixed(4));
                    if (
                        (((div_start < item_end && div_start >= item_start) || (div_end > item_start && div_end <= item_end)) && ((div_bottom < item_top && div_bottom >= item_bottom) || (div_top <= item_top && div_top > item_bottom))) ||
                        (((item_start <= div_start && item_end > div_start) || (item_start < div_end && item_end >= div_end)) && item_top <= div_top && item_bottom >= div_bottom) ||
                        (((div_start <= item_start && div_end >= item_end) || (div_start >= item_start && div_end <= item_end)) && ((div_top >= item_top && item_bottom >= div_bottom) || (div_top >= item_top && div_bottom <= item_bottom) || (div_top > item_top && div_bottom <= item_top))) ||
                        (item_start < div_start && item_end >= div_end && item_top <= div_top && item_top > div_bottom && item_bottom <= div_bottom) ||
                        (item_start > div_start && item_end <= div_end && item_top >= div_top && item_bottom < div_top && item_bottom <= div_bottom) ||
                        (item_start < div_start && item_end >= div_end && item_top <= div_top && item_bottom >= div_bottom) ||
                        (item_start < div_start && item_end >= div_end && item_top < div_top && item_top > div_bottom) ||
                        (item_start >= div_start && item_start < div_end && item_bottom >= div_bottom && item_bottom < div_top)) {
                        validate = "N";
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleindex].ShelfInfo[p_shelfindex].InsidePegboard = "N";
                        break;
                    } else {
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleindex].ShelfInfo[p_shelfindex].InsidePegboard = "Y";
                    }
                }
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_moduleindex].ShelfInfo[p_shelfindex].InsidePegboard = "Y";
            }
            i++;
        }
    } else {
        var inside_shelf_top = shelf_top,
            inside_shelf_bottom = shelf_bottom,
            inside_shelf_start = shelf_start,
            inside_shelf_end = shelf_end;
        if (p_DivShelf.ItemInfo.length > 0) {
            for (const items of p_DivShelf.ItemInfo) {
                div_start = wpdSetFixed(items.X - items.W / 2);//.toFixed(4));
                div_end = wpdSetFixed(items.X + items.W / 2);//.toFixed(4));
                div_top = wpdSetFixed(items.Y + items.H / 2);//.toFixed(4));
                div_bottom = wpdSetFixed(items.Y - items.H / 2);//.toFixed(4));

                if (
                    (((div_start < inside_shelf_end && div_start >= inside_shelf_start) || (div_end > inside_shelf_start && div_end <= inside_shelf_end)) && ((div_bottom < inside_shelf_top && div_bottom >= inside_shelf_bottom) || (div_top <= inside_shelf_top && div_top > inside_shelf_bottom))) ||
                    (((inside_shelf_start < div_start && inside_shelf_end > div_start) || (inside_shelf_start < div_end && inside_shelf_end >= div_end)) && inside_shelf_top <= div_top && inside_shelf_bottom >= div_bottom) ||
                    (((div_start <= inside_shelf_start && div_end >= inside_shelf_end) || (div_start >= inside_shelf_start && div_end <= inside_shelf_end)) && ((div_top >= inside_shelf_top && inside_shelf_bottom >= div_bottom) || (div_top >= inside_shelf_top && div_bottom <= inside_shelf_bottom) || (div_top > inside_shelf_top && div_bottom <= inside_shelf_top))) ||
                    (inside_shelf_start < div_start && inside_shelf_end >= div_end && inside_shelf_top <= div_top && inside_shelf_top > div_bottom && inside_shelf_bottom <= div_bottom) ||
                    (inside_shelf_start > div_start && inside_shelf_end <= div_end && inside_shelf_top >= div_top && inside_shelf_bottom < div_top && inside_shelf_bottom <= div_bottom) ||
                    (inside_shelf_start < div_start && inside_shelf_end >= div_end && inside_shelf_top <= div_top && inside_shelf_bottom >= div_bottom) ||
                    (inside_shelf_start < div_start && inside_shelf_end >= div_end && inside_shelf_top < div_top && inside_shelf_top > div_bottom) ||
                    (inside_shelf_start >= div_start && inside_shelf_start < div_end && inside_shelf_bottom >= div_bottom && inside_shelf_bottom < div_top)) {
                    validate = "N";
                    g_pog_json[p_pog_index].ModuleInfo[p_moduleindex].ShelfInfo[p_shelfindex].InsidePegboard = "N";
                    break;
                } else {
                    g_pog_json[p_pog_index].ModuleInfo[p_moduleindex].ShelfInfo[p_shelfindex].InsidePegboard = "Y";
                }
            }
        } else {
            g_pog_json[p_pog_index].ModuleInfo[p_moduleindex].ShelfInfo[p_shelfindex].InsidePegboard = "Y";
        }
        //i++;
        //}
    }

    //ASA-1544 - Start
    for (const modInfo of g_pog_json[p_pog_index].ModuleInfo) {
        for (const shelfInfo of modInfo.ShelfInfo) {
            if (shelfInfo.InsidePegboard == 'Y' && shelfInfo.SObjID != shelfdtl.SObjID) {
                var pg_shelf_top = wpdSetFixed(shelfInfo.Y + shelfInfo.H / 2);
                var pg_shelf_bottom = wpdSetFixed(shelfInfo.Y - shelfInfo.H / 2);
                var pg_shelf_start = wpdSetFixed(shelfInfo.X - shelfInfo.W / 2);
                var pg_shelf_end = wpdSetFixed(shelfInfo.X + shelfInfo.W / 2);

                if (
                    (((pg_shelf_start < shelf_end && pg_shelf_start >= shelf_start) || (pg_shelf_end > shelf_start && pg_shelf_end <= shelf_end)) && ((pg_shelf_bottom < shelf_top && pg_shelf_bottom >= shelf_bottom) || (pg_shelf_top <= shelf_top && pg_shelf_top > shelf_bottom))) ||
                    (((shelf_start < pg_shelf_start && shelf_end > pg_shelf_start) || (shelf_start < pg_shelf_end && shelf_end >= pg_shelf_end)) && shelf_top <= pg_shelf_top && shelf_bottom >= pg_shelf_bottom) ||
                    (((pg_shelf_start <= shelf_start && pg_shelf_end >= shelf_end) || (pg_shelf_start >= shelf_start && pg_shelf_end <= shelf_end)) && ((pg_shelf_top >= shelf_top && shelf_bottom >= pg_shelf_bottom) || (pg_shelf_top >= shelf_top && pg_shelf_bottom <= shelf_bottom) || (pg_shelf_top > shelf_top && pg_shelf_bottom <= shelf_top))) ||
                    (shelf_start < pg_shelf_start && shelf_end >= pg_shelf_end && shelf_top <= pg_shelf_top && shelf_top > pg_shelf_bottom && shelf_bottom <= pg_shelf_bottom) ||
                    (shelf_start > pg_shelf_start && shelf_end <= pg_shelf_end && shelf_top >= pg_shelf_top && shelf_bottom < pg_shelf_top && shelf_bottom <= pg_shelf_bottom) ||
                    (shelf_start < pg_shelf_start && shelf_end >= pg_shelf_end && shelf_top <= pg_shelf_top && shelf_bottom >= pg_shelf_bottom) ||
                    (shelf_start < pg_shelf_start && shelf_end >= pg_shelf_end && shelf_top < pg_shelf_top && shelf_top > pg_shelf_bottom) ||
                    (shelf_start >= pg_shelf_start && shelf_start < pg_shelf_end && shelf_bottom >= pg_shelf_bottom && shelf_bottom < pg_shelf_top)) {
                    validate = "N";
                    break;
                }
                if (shelfInfo.ItemInfo.length > 0) {
                    for (const itemInfo of shelfInfo.ItemInfo) {
                        var pg_item_top = wpdSetFixed(itemInfo.Y + itemInfo.H / 2);
                        var pg_item_bottom = wpdSetFixed(itemInfo.Y - itemInfo.H / 2);
                        var pg_item_start = wpdSetFixed(itemInfo.X - itemInfo.W / 2);
                        var pg_item_end = wpdSetFixed(itemInfo.X + itemInfo.W / 2);
                        if (
                            (((pg_item_start < shelf_end && pg_item_start >= shelf_start) || (pg_item_end > shelf_start && pg_item_end <= shelf_end)) && ((pg_item_bottom < shelf_top && pg_item_bottom >= shelf_bottom) || (pg_item_top <= shelf_top && pg_item_top > shelf_bottom))) ||
                            (((shelf_start < pg_item_start && shelf_end > pg_item_start) || (shelf_start < pg_item_end && shelf_end >= pg_item_end)) && shelf_top <= pg_item_top && shelf_bottom >= pg_item_bottom) ||
                            (((pg_item_start <= shelf_start && pg_item_end >= shelf_end) || (pg_item_start >= shelf_start && pg_item_end <= shelf_end)) && ((pg_item_top >= shelf_top && shelf_bottom >= pg_item_bottom) || (pg_item_top >= shelf_top && pg_item_bottom <= shelf_bottom) || (pg_item_top > shelf_top && pg_item_bottom <= shelf_top))) ||
                            (shelf_start < pg_item_start && shelf_end >= pg_item_end && shelf_top <= pg_item_top && shelf_top > pg_item_bottom && shelf_bottom <= pg_item_bottom) ||
                            (shelf_start > pg_item_start && shelf_end <= pg_item_end && shelf_top >= pg_item_top && shelf_bottom < pg_item_top && shelf_bottom <= pg_item_bottom) ||
                            (shelf_start < pg_item_start && shelf_end >= pg_item_end && shelf_top <= pg_item_top && shelf_bottom >= pg_item_bottom) ||
                            (shelf_start < pg_item_start && shelf_end >= pg_item_end && shelf_top < pg_item_top && shelf_top > pg_item_bottom) ||
                            (shelf_start >= pg_item_start && shelf_start < pg_item_end && shelf_bottom >= pg_item_bottom && shelf_bottom < pg_item_top)) {
                            validate = "N";
                            break;
                        }
                    }
                }
                if (itemdtl.length > 0) {
                    for (const items of itemdtl) {
                        drag_shelf_item_start = wpdSetFixed(items.X - items.W / 2);
                        drag_shelf_item_end = wpdSetFixed(items.X + items.W / 2);
                        drag_shelf_item_top = wpdSetFixed(items.Y + items.H / 2);
                        drag_shelf_item_bottom = wpdSetFixed(items.Y - items.H / 2);

                        if (shelfInfo.ItemInfo.length > 0) {
                            for (const itemInfo of shelfInfo.ItemInfo) {
                                var pg_item_top = wpdSetFixed(itemInfo.Y + itemInfo.H / 2);
                                var pg_item_bottom = wpdSetFixed(itemInfo.Y - itemInfo.H / 2);
                                var pg_item_start = wpdSetFixed(itemInfo.X - itemInfo.W / 2);
                                var pg_item_end = wpdSetFixed(itemInfo.X + itemInfo.W / 2);
                                if (
                                    (((pg_item_start < drag_shelf_item_end && pg_item_start >= drag_shelf_item_start) || (pg_item_end > drag_shelf_item_start && pg_item_end <= drag_shelf_item_end)) && ((pg_item_bottom < drag_shelf_item_top && pg_item_bottom >= drag_shelf_item_bottom) || (pg_item_top <= drag_shelf_item_top && pg_item_top > drag_shelf_item_bottom))) ||
                                    (((drag_shelf_item_start < pg_item_start && drag_shelf_item_end > pg_item_start) || (drag_shelf_item_start < pg_item_end && drag_shelf_item_end >= pg_item_end)) && drag_shelf_item_top <= pg_item_top && drag_shelf_item_bottom >= pg_item_bottom) ||
                                    (((pg_item_start <= drag_shelf_item_start && pg_item_end >= drag_shelf_item_end) || (pg_item_start >= drag_shelf_item_start && pg_item_end <= drag_shelf_item_end)) && ((pg_item_top >= drag_shelf_item_top && drag_shelf_item_bottom >= pg_item_bottom) || (pg_item_top >= drag_shelf_item_top && pg_item_bottom <= drag_shelf_item_bottom) || (pg_item_top > drag_shelf_item_top && pg_item_bottom <= drag_shelf_item_top))) ||
                                    (drag_shelf_item_start < pg_item_start && drag_shelf_item_end >= pg_item_end && drag_shelf_item_top <= pg_item_top && drag_shelf_item_top > pg_item_bottom && drag_shelf_item_bottom <= pg_item_bottom) ||
                                    (drag_shelf_item_start > pg_item_start && drag_shelf_item_end <= pg_item_end && drag_shelf_item_top >= pg_item_top && drag_shelf_item_bottom < pg_item_top && drag_shelf_item_bottom <= pg_item_bottom) ||
                                    (drag_shelf_item_start < pg_item_start && drag_shelf_item_end >= pg_item_end && drag_shelf_item_top <= pg_item_top && drag_shelf_item_bottom >= pg_item_bottom) ||
                                    (drag_shelf_item_start < pg_item_start && drag_shelf_item_end >= pg_item_end && drag_shelf_item_top < pg_item_top && drag_shelf_item_top > pg_item_bottom) ||
                                    (drag_shelf_item_start >= pg_item_start && drag_shelf_item_start < pg_item_end && drag_shelf_item_bottom >= pg_item_bottom && drag_shelf_item_bottom < pg_item_top)) {
                                    validate = "N";
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    //ASA-1544 - End

    return validate;
}

function makeResizableRow() {
    const t_bodyNavW = $("#t_Body_nav").width();
    const t_topBarH = $("#top_bar").height();
    const t_apexHeader = $("#t_Header").height();
    const dragLine = $("#resizeLine");
    const mainContainer = $("#canvas-holder .container")[0];
    var rowElmCount = $("#canvas-holder .container .row").length;

    var tileView, //H(Horizontal) or V(Vertical)
        startX,
        startY,
        endX,
        endY,
        prevX,
        prevY,
        mainContainerRect,
        resizing = false,
        currRow = -1,
        adjRow = -1;

    if (rowElmCount > 1) {
        for (var i = 1; i < rowElmCount; i++) {
            var currentResizer = $("#canvas-holder .container .row")[i];
            currentResizer.addEventListener("mousedown", initiateRowResize);
        }
    } else {
        return;
    }

    function initiateRowResize(e) {
        if (g_dragging || resizing) {
            return;
        }
        console.log(e.target.className);
        if (e.target.className == "row") {
            e.preventDefault();
            window.addEventListener("mousemove", resizeRow);
            window.addEventListener("mouseup", stopResizeRow);
            resizing = true;
            tileView = $("#canvas-holder .container")[0].className.replace("container", "").replace("-view", "").toUpperCase().trim();
            currRow = parseInt($(e.srcElement).attr("data-row"));
            adjRow = currRow - 1;
            mainContainerRect = mainContainer.getBoundingClientRect();
            var containerRight = mainContainerRect.right;
            var containerBottom = mainContainerRect.bottom;
            var containerLeft = mainContainerRect.left;
            var containerTop = mainContainerRect.top;

            // 1 is for the border of drawing_region
            // 150 is to set a range for resizing so that POG is visible properly
            // If user wants to increase/decrease the size outside the range, user can minimize/maximize the POG
            startX = Math.round(containerLeft) - t_bodyNavW - 1 + 150;
            endX = Math.round(containerRight) - t_bodyNavW - 1 - 150;
            startY = Math.round(containerTop) - t_topBarH - t_apexHeader - 1 + 150;
            endY = Math.round(containerBottom) - t_topBarH - t_apexHeader - 1 - 150;
        } else {
            return;
        }
    }
    function resizeRow(p_event) {
        if (resizing) {
            // drag the line in this code
            var draggingPointX = p_event.clientX - t_bodyNavW;
            var draggingPointY = p_event.clientY - t_topBarH - t_apexHeader;
            if (tileView == "H") {
                dragLine.css("width", "1px");
                dragLine.css("height", mainContainerRect.height + "px");
                dragLine.css("top", mainContainerRect.top - t_topBarH - t_apexHeader - 1 + "px");
                if (draggingPointX > startX && draggingPointX < endX) {
                    prevX = p_event.clientX;
                    dragLine.css("left", draggingPointX + "px");
                }
            } else if (tileView == "V") {
                dragLine.css("width", mainContainerRect.width + "px");
                dragLine.css("height", "1px");
                dragLine.css("left", mainContainerRect.left - t_bodyNavW - 1 + "px");
                if (draggingPointY > startY && draggingPointY < endY) {
                    prevY = p_event.clientY;
                    dragLine.css("top", draggingPointY + "px");
                }
            } else {
                resizing = false;
                window.removeEventListener("mousemove", resizeRow);
                window.removeEventListener("mouseup", stopResizeRow);
                dragLine.css("width", "0px");
                dragLine.css("height", "0px");
                dragLine.css("left", "0px");
                dragLine.css("top", "0px");
                return;
            }
        }
    }

    function stopResizeRow(p_event) {
        if (resizing && typeof currRow !== -1 && adjRow !== -1) {
            var currRowW,
                currRowH,
                adjRowW,
                adjRowH,
                validX,
                validY;
            var currCanvasW,
                currCanvasH,
                currCanvasBtnH;
            var currRowCanvas = $("[data-row = " + currRow + "] .canvas-content");
            var adjRowCanvas = $("[data-row = " + adjRow + "] .canvas-content");
            var currRowRect = $("[data-row=" + currRow + "]")[0].getBoundingClientRect();
            var adjRowRect = $("[data-row=" + adjRow + "]")[0].getBoundingClientRect();

            window.removeEventListener("mousemove", resizeRow);
            dragLine.css("width", "0px");
            dragLine.css("height", "0px");
            dragLine.css("left", "0px");
            dragLine.css("top", "0px");
            if (tileView == "H") {
                if (p_event.clientX >= startX && p_event.clientX <= endX) {
                    validX = p_event.clientX;
                } else {
                    validX = prevX;
                }
                if (currRowRect.left > validX && adjRowRect.right > validX) {
                    currRowW = currRowRect.width + (currRowRect.left - validX);
                    adjRowW = adjRowRect.width - (adjRowRect.right - validX);
                } else if (currRowRect.left < validX && adjRowRect.right < validX) {
                    currRowW = currRowRect.width + (currRowRect.left - validX);
                    adjRowW = adjRowRect.width - (adjRowRect.right - validX);
                } else {
                    currRowW = currRowRect.width;
                    adjRowW = adjRowRect.width;
                }
                $("[data-row=" + currRow + "] .canvas-content").css("width", currRowW + "px");
                $("[data-row=" + adjRow + "] .canvas-content").css("width", adjRowW + "px");
                currRowH = currRowRect.height;
                adjRowH = adjRowRect.height;
            } else if (tileView == "V") {
                if (p_event.clientY >= startY && p_event.clientY <= endY) {
                    validY = p_event.clientY;
                } else {
                    validY = prevY;
                }

                if (currRowRect.top > validY && adjRowRect.bottom > validY) {
                    currRowH = currRowRect.height + (currRowRect.top - validY);
                    adjRowH = adjRowRect.height - (adjRowRect.bottom - validY);
                } else if (currRowRect.top < validY && adjRowRect.bottom < validY) {
                    currRowH = currRowRect.height + (currRowRect.top - validY);
                    adjRowH = adjRowRect.height - (adjRowRect.bottom - validY);
                } else {
                    currRowH = currRowRect.height;
                    adjRowH = adjRowRect.height;
                }
                $("[data-row=" + currRow + "] .canvas-content").css("height", currRowH + "px");
                $("[data-row=" + adjRow + "] .canvas-content").css("height", adjRowH + "px");

                currRowW = currRowRect.width;
                adjRowW = adjRowRect.width;
            } else {
                window.removeEventListener("mouseup", stopResizeRow);
                resizing = false;
                return;
            }

            g_renderer.setPixelRatio(window.devicePixelRatio);
            for (elm of currRowCanvas) {
                var elmId = $(elm).attr("id");
                var pogIndx = $("#" + elmId + " .canvasregion").attr("data-indx");
                var htmlIndx = $("#" + elmId + " .canvasregion").attr("id");
                currCanvasBtnH = $("#" + elmId + " .canvas-buttons").height();
                (currCanvasW = $(elm).width()),
                    (currCanvasH = $(elm).height() - currCanvasBtnH);
                setSceneAfterResize(pogIndx, htmlIndx, currCanvasW, currCanvasH);
            }

            for (elm of adjRowCanvas) {
                var elmId = $(elm).attr("id");
                var pogIndx = $("#" + elmId + " .canvasregion").attr("data-indx");
                var htmlIndx = $("#" + elmId + " .canvasregion").attr("id");
                currCanvasBtnH = $("#" + elmId + " .canvas-buttons").height();
                (currCanvasW = $(elm).width()),
                    (currCanvasH = $(elm).height() - currCanvasBtnH);
                setSceneAfterResize(pogIndx, htmlIndx, currCanvasW, currCanvasH);
            }
            $("#canvas-holder .container").css("display", "block !important");
            window.removeEventListener("mouseup", stopResizeRow);
            resizing = false;
        }
    }

    function setSceneAfterResize(p_pog_index, p_htmlId, p_width, p_height) {
        var currCamera = g_scene_objects[p_pog_index].scene.children[0];
        var details = get_min_max_xy(p_pog_index);
        var curr_details_arr = details.split("###");
        g_canvas_objects[p_pog_index] = document.getElementById(p_htmlId);
        g_canvas_objects[p_pog_index].width = p_width;
        g_canvas_objects[p_pog_index].height = p_height;

        $("#" + p_htmlId).width(p_width);
        $("#" + p_htmlId).height(p_height);
        currCamera.aspect = p_width / p_height;
        currCamera.updateProjectionMatrix();
        g_scene_objects[p_pog_index].scene.children[0] = currCamera;
        set_camera_z(currCamera, parseFloat(curr_details_arr[2]), parseFloat(curr_details_arr[3]), parseFloat(curr_details_arr[0]), parseFloat(curr_details_arr[1]), g_offset_z, parseFloat(curr_details_arr[4]), parseFloat(curr_details_arr[5]), true, p_pog_index);

        context = g_canvas_objects[p_pog_index].getContext("2d");
        g_renderer.setSize(p_width, p_height);
        currCamera.aspect = p_width / p_height;
        g_renderer.render(g_scene_objects[p_pog_index].scene, currCamera);
        context.drawImage(g_renderer.domElement, 0, 0, p_width, p_height);
        currCamera.updateProjectionMatrix();
        g_scene_objects[p_pog_index].scene.children[0] = currCamera;
        set_camera_z(currCamera, parseFloat(curr_details_arr[2]), parseFloat(curr_details_arr[3]), parseFloat(curr_details_arr[0]), parseFloat(curr_details_arr[1]), g_offset_z, parseFloat(curr_details_arr[4]), parseFloat(curr_details_arr[5]), true, p_pog_index);
    }
}

function openItemSubLabel(p_subLabelType) {
    try {
        var subLabelInd = "N";
        if (g_pog_json.length > 0) {
            var p = -1;
            if (g_all_pog_flag == "Y") {
                p = 0;
            } else {
                p = g_pog_index;
            }
            if (p_subLabelType !== "") {
                subLabelInd = "Y";
            }
            var originalCanvas = g_pog_index;
            g_delete_details['is_dragging'] = 'Y';      //ASA-1577
            $("#item_sublbl_sub .items").removeClass("item_sublabel_active");
            if (p_subLabelType == "") {
                $(".item_sublabel").removeClass("item_sublabel_active");
                $("#item_sublbl_sub .items").removeClass("item_sublabel_active");
            } else {
                $(".item_sublabel").addClass("item_sublabel_active");
                $("#item_sublbl_sub ." + p_subLabelType).addClass("item_sublabel_active");
            }
            for (const pogInfo of g_pog_json) {
                if ((p !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                    g_renderer = g_scene_objects[p].renderer;
                    g_scene = g_scene_objects[p].scene;
                    g_camera = g_scene_objects[p].scene.children[0];
                    showItemSubLabel(p_subLabelType, subLabelInd, $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), p);
                    set_indicator_objects(p);
                }
                if (g_all_pog_flag == "N") {
                    break;
                } else {
                    p++;
                }
            }
            if (g_scene_objects.length > 0) {
                g_renderer = g_scene_objects[originalCanvas].renderer;
                g_scene = g_scene_objects[originalCanvas].scene;
                g_camera = g_scene_objects[originalCanvas].scene.children[0];
            }
            g_delete_details['is_dragging'] = 'N';      //ASA-1577
        }
    } catch (err) {
        error_handling(err);
    }
}



//ASA-1405
//this function is used in crushing items in the chest. we find out if any of the items in the chest is getting hit by dragged item.
function checkChestCrushedItemHit(p_citem_x, p_citem_y, p_citem_w, p_citem_h, p_shelf, p_item_index) {
    try {
        var l_cnt = 0;
        var citem_start = wpdSetFixed(p_citem_x - p_citem_w / 2),
            citem_end = wpdSetFixed(p_citem_x + p_citem_w / 2),
            citem_top = wpdSetFixed(p_citem_y + p_citem_h / 2),
            citem_bottom = wpdSetFixed(p_citem_y - p_citem_h / 2);
        const shelf_start = wpdSetFixed(p_shelf.X - p_shelf.W / 2),
            shelf_end = wpdSetFixed(p_shelf.X + p_shelf.W / 2),
            shelf_bottom = wpdSetFixed(p_shelf.Y - p_shelf.H / 2),
            shelf_top = wpdSetFixed(p_shelf.Y + p_shelf.H / 2);
        for (const items of p_shelf.ItemInfo) {
            if (l_cnt !== p_item_index) {
                var ov_start = wpdSetFixed(items.X - items.W / 2),
                    ov_end = wpdSetFixed(items.X + items.W / 2),
                    ov_top = wpdSetFixed(items.Y + items.H / 2),
                    ov_bottom = wpdSetFixed(items.Y - items.H / 2);
                if (!(citem_top < ov_bottom || citem_bottom > ov_top) && !(citem_end < ov_start || citem_start > ov_end)) {
                    //ASA-1405 Issue 5
                    if (((((ov_start < citem_end && ov_start >= citem_start) || (ov_end > citem_start && ov_end <= citem_end)) && ((ov_bottom < citem_top && ov_bottom >= citem_bottom) || (ov_top <= citem_top && ov_top > citem_bottom))) || (((citem_start < ov_start && citem_end > ov_start) || (citem_start < ov_end && citem_end >= ov_end)) && citem_top <= ov_top && citem_bottom >= ov_bottom) || (((ov_start <= citem_start && ov_end >= citem_end) || (ov_start >= citem_start && ov_end <= citem_end)) && ((ov_top >= citem_top && citem_bottom >= ov_bottom) || (ov_top >= citem_top && ov_bottom <= citem_bottom) || (ov_top > citem_top && ov_bottom <= citem_top))) || (citem_start < ov_start && citem_end >= ov_end && citem_top <= ov_top && citem_top > ov_bottom && citem_bottom <= ov_bottom) || (citem_start > ov_start && citem_end <= ov_end && citem_top >= ov_top && citem_bottom < ov_top && citem_bottom <= ov_bottom) || (citem_start < ov_start && citem_end >= ov_end && citem_top <= ov_top && citem_bottom >= ov_bottom) || (citem_start < ov_start && citem_end >= ov_end && citem_top < ov_top && citem_top > ov_bottom) || (citem_start >= ov_start && citem_start < ov_end && citem_bottom >= ov_bottom && citem_bottom < ov_top))) {
                        // if ((citem_top > ov_bottom && ov_bottom > citem_bottom && !(citem_bottom < ov_top && ov_top < citem_top) && ((citem_start < ov_end && ov_end < citem_end) || (citem_end > ov_start && ov_start > citem_start)))
                        //     || (!(citem_top > ov_bottom && ov_bottom > citem_bottom) && citem_bottom < ov_top && ov_top < citem_top && ((citem_start < ov_end && ov_end < citem_end) || (citem_end > ov_start && ov_start > citem_start)))
                        //     || (((citem_top > ov_bottom && ov_bottom > citem_bottom) || (citem_bottom < ov_top && ov_top < citem_top)) && !(citem_start < ov_end && ov_end < citem_end) && citem_end > ov_start && ov_start > citem_start)
                        //     || (((citem_top > ov_bottom && ov_bottom > citem_bottom) || (citem_bottom < ov_top && ov_top < citem_top)) && citem_start < ov_end && ov_end < citem_end && !(citem_end > ov_start && ov_start > citem_start))) {
                        return "Y";
                    }
                } else if (citem_top > shelf_top || citem_bottom < shelf_bottom || citem_start < shelf_start || citem_end > shelf_end) {
                    return "Y";
                }
            }
            l_cnt++;
        }
        return "N";
    } catch (err) {
        error_handling(err);
    }
}
//This function will find out the percentage of item overlapping on dragging items.
//if the items is hit on the left side. the right side position of the will be maintained and left of the portion which is hit. will be reduced.
//same goes to all sides of the item.
function getChestOverlappedItemDimension(p_item_x, p_item_y, p_item_w, p_item_h, p_overlapped_item) {
    try {
        const item_start = wpdSetFixed(p_item_x - p_item_w / 2),
            item_end = wpdSetFixed(p_item_x + p_item_w / 2),
            item_top = wpdSetFixed(p_item_y + p_item_h / 2),
            item_bottom = wpdSetFixed(p_item_y - p_item_h / 2);
        var ov_top, ov_bottom, ov_start, ov_end;
        var crushedWidth = 0,
            crushedHeight = 0,
            leftOverlap = 0,
            rightOverlap = 0,
            topOverlap = 0,
            bottomOverlap = 0;
        var itemHit = "N", shelfHit = "N";

        //this is the item hanging outside the CHEST. we find out how much of the portion is out and in which side.
        if (nvl(p_overlapped_item.ObjType) == "CHEST") {
            ov_top = wpdSetFixed(p_overlapped_item.Y + p_overlapped_item.H / 2);
            ov_bottom = wpdSetFixed(p_overlapped_item.Y - p_overlapped_item.H / 2);
            ov_start = wpdSetFixed(p_overlapped_item.X - p_overlapped_item.W / 2);
            ov_end = wpdSetFixed(p_overlapped_item.X + p_overlapped_item.W / 2);

            if (item_top > ov_top) {
                topOverlap = item_top - ov_top;
                crushedHeight = topOverlap;
                shelfHit = "Y";
            }
            if (item_bottom < ov_bottom) {
                bottomOverlap = ov_bottom - item_bottom;
                crushedHeight += bottomOverlap;
                shelfHit = "Y";
            }
            if (item_start < ov_start) {
                leftOverlap = ov_start - item_start; //ASA-1405 Issue 1
                crushedWidth = leftOverlap;
                shelfHit = "Y";
            }
            if (item_end > ov_end) {
                rightOverlap = item_end - ov_end;
                crushedWidth += rightOverlap;
                shelfHit = "Y";
            }
        } else {//this will check with item is hitting and which side.
            ov_top = wpdSetFixed(p_overlapped_item.Y + p_overlapped_item.H / 2);
            ov_bottom = wpdSetFixed(p_overlapped_item.Y - p_overlapped_item.H / 2);
            ov_start = wpdSetFixed(p_overlapped_item.X - p_overlapped_item.W / 2);
            ov_end = wpdSetFixed(p_overlapped_item.X + p_overlapped_item.W / 2);
            //ASA-1405 Issue 3, added below if. Picked from find_pegboard_gap function
            //there will be 2 crush types height and width crush. so based on the hit position we decide how much of perc to crush and which side.
            if ((((ov_start < item_end && ov_start >= item_start) || (ov_end > item_start && ov_end <= item_end)) && ((ov_bottom < item_top && ov_bottom >= item_bottom) || (ov_top <= item_top && ov_top > item_bottom))) || (((item_start < ov_start && item_end > ov_start) || (item_start < ov_end && item_end >= ov_end)) && item_top <= ov_top && item_bottom >= ov_bottom) || (((ov_start <= item_start && ov_end >= item_end) || (ov_start >= item_start && ov_end <= item_end)) && ((ov_top >= item_top && item_bottom >= ov_bottom) || (ov_top >= item_top && ov_bottom <= item_bottom) || (ov_top > item_top && ov_bottom <= item_top))) || (item_start < ov_start && item_end >= ov_end && item_top <= ov_top && item_top > ov_bottom && item_bottom <= ov_bottom) || (item_start > ov_start && item_end <= ov_end && item_top >= ov_top && item_bottom < ov_top && item_bottom <= ov_bottom) || (item_start < ov_start && item_end >= ov_end && item_top <= ov_top && item_bottom >= ov_bottom) || (item_start < ov_start && item_end >= ov_end && item_top < ov_top && item_top > ov_bottom) || (item_start >= ov_start && item_start < ov_end && item_bottom >= ov_bottom && item_bottom < ov_top)) {
                if (item_top > ov_bottom && ov_bottom > item_bottom && !(item_bottom < ov_top && ov_top < item_top)) {
                    topOverlap = item_top - ov_bottom;
                    crushedHeight = topOverlap;
                    itemHit = "Y";
                }
                if (item_bottom < ov_top && ov_top < item_top && !(item_top > ov_bottom && ov_bottom > item_bottom)) {
                    bottomOverlap = ov_top - item_bottom;
                    crushedHeight += bottomOverlap;
                    itemHit = "Y";
                }
                if (item_start < ov_end && ov_end < item_end && !(item_end > ov_start && ov_start > item_start)) {
                    leftOverlap = ov_end - item_start;
                    crushedWidth = leftOverlap;
                    itemHit = "Y";
                }
                if (item_end > ov_start && ov_start > item_start && !(item_start < ov_end && ov_end < item_end)) {
                    rightOverlap = item_end - ov_start;
                    crushedWidth += rightOverlap;
                    itemHit = "Y";
                }
            }
        }
        //here based on the crush to be done. we calculate the Y and the X. so that if we are reducing left side of the item. we still maintaine the right
        //side of the item position. same goes to right, top and bottom.
        const crushWidthPerc = Math.ceil((crushedWidth / p_item_w) * 100);
        const crushHeightPerc = Math.ceil((crushedHeight / p_item_h) * 100);
        const newWidth = wpdSetFixed(p_item_w * (1 - crushWidthPerc / 100));
        const newHeight = wpdSetFixed(p_item_h * (1 - crushHeightPerc / 100));
        var newX = p_item_x,
            newY = p_item_y;
        if (crushWidthPerc !== 0) {
            if (rightOverlap > leftOverlap) {
                if (shelfHit == "Y") {
                    newX = ov_end - newWidth / 2;
                } else {
                    newX = ov_start - newWidth / 2;
                }
            } else {
                if (shelfHit == "Y") {
                    newX = ov_start + newWidth / 2;
                } else {
                    newX = ov_end + newWidth / 2;
                }
            }
        }
        if (crushHeightPerc !== 0) {
            if (topOverlap > bottomOverlap) {
                if (shelfHit == "Y") {
                    newY = ov_top - newHeight / 2;
                } else {
                    newY = ov_bottom - newHeight / 2;
                }
            } else {
                if (shelfHit == "Y") {
                    newY = ov_bottom + newHeight / 2;
                } else {
                    newY = ov_top + newHeight / 2;
                }
            }
        }

        if (itemHit == "Y" || shelfHit == "Y") {
            if (crushWidthPerc == 0 && crushHeightPerc !== 0) {
                return [p_item_x, newY, p_item_w, newHeight, 0, crushHeightPerc];
            } else if (crushWidthPerc !== 0 && crushHeightPerc == 0) {
                return [newX, p_item_y, newWidth, p_item_h, crushWidthPerc, 0];
            } else if (crushWidthPerc !== 0 && crushHeightPerc !== 0) {
                if (shelfHit == "Y") {
                    return [newX, newY, newWidth, newHeight, crushWidthPerc, crushHeightPerc];
                } else {
                    if (crushWidthPerc > crushHeightPerc) {
                        return [p_item_x, newY, p_item_w, newHeight, 0, crushHeightPerc];
                    }
                    else {
                        return [newX, p_item_y, newWidth, p_item_h, crushWidthPerc, 0];
                    }
                }
            } else {
                return [p_item_x, p_item_y, p_item_w, p_item_h, 0, 0];
            }
        } else {
            return [p_item_x, p_item_y, p_item_w, p_item_h, 0, 0];
        }
    } catch (err) {
        error_handling(err);
    }
}

//This function is called in crushitem function. where this will decide how much of the items to be crushed and how to set the X,Y so that 
//items position is not changed. for example crushing left side. it will maintaine the position all other sides.
//ASA-1936.2 Regression Fix - Updated Logic for mass updated and Added check for permutations
function crushChestItemHW(p_shelf, p_item, p_item_index, p_crush_height_perc, p_crush_width_perc, p_item_manual_wc_ind, p_item_manual_hc_ind, p_actualHeight, p_actualWidth, p_set_ind) {
    try {
        var l_cnt = 0;
        var item_height = p_item.RH + nvl(p_item.CapHeight),
            item_width = p_item.RW,
            item_X = p_item.X,
            item_Y = p_item.Y;
        var itemHitArr = [];
        var item_start = wpdSetFixed(item_X - item_width / 2),
            item_end = wpdSetFixed(item_X + item_width / 2),
            item_top = wpdSetFixed(item_Y + item_height / 2),
            item_bottom = wpdSetFixed(item_Y - item_height / 2);

        // find overlapping items
        for (const item of p_shelf.ItemInfo) {
            if (l_cnt !== p_item_index) {
                var div_start = wpdSetFixed(item.X - item.W / 2),
                    div_end = wpdSetFixed(item.X + item.W / 2),
                    div_top = wpdSetFixed(item.Y + item.H / 2),
                    div_bottom = wpdSetFixed(item.Y - item.H / 2);
                if (!(item_top < div_bottom || item_bottom > div_top) && !(item_end < div_start || item_start > div_end)) {
                    itemHitArr.push(item);
                }
            }
            l_cnt++; //ASA-1412 issue 12 20240708
        }

        // include shelf edges as overlap target
        var shelf_start = wpdSetFixed(p_shelf.X - p_shelf.W / 2),
            shelf_end = wpdSetFixed(p_shelf.X + p_shelf.W / 2),
            shelf_bottom = wpdSetFixed(p_shelf.Y - p_shelf.H / 2),
            shelf_top = wpdSetFixed(p_shelf.Y + p_shelf.H / 2);
        if (item_top > shelf_top || item_bottom < shelf_bottom || item_start < shelf_start || item_end > shelf_end) {
            itemHitArr.push(p_shelf);
        }

        // ✅ memory-safe permutation wrapper
        var itemHitArrPermute = [];
        const MAX_PERMUTATIONS = 5040; // limit to 7! to prevent OOM
        if (itemHitArr.length <= 7) {
            itemHitArrPermute = permuteArrayOfArrays(itemHitArr);
        } else {
            for (var s = 0; s < MAX_PERMUTATIONS; s++) {
                var shuffled = itemHitArr.slice().sort(() => Math.random() - 0.5);
                itemHitArrPermute.push(shuffled);
            }
        }

        var finalItemAreaResults = [];
        for (const ovpItemArr of itemHitArrPermute) {
            var [itemX, itemY, itemW, itemH] = [item_X, item_Y, item_width, item_height];
            var itemWidthCrush = 0, itemHeightCrush = 0;
            var finalWidthCrushPerc = 0, finalHeightCrush = 0;
            for (const ovpItem of ovpItemArr) {
                [itemX, itemY, itemW, itemH, itemWidthCrush, itemHeightCrush] = getChestOverlappedItemDimension(itemX, itemY, itemW, itemH, ovpItem);
                finalWidthCrushPerc += itemWidthCrush;
                finalHeightCrush += itemHeightCrush;
            }
            finalItemAreaResults.push({
                ItemW: itemW,
                ItemH: itemH,
                ItemX: itemX,
                ItemY: itemY,
                FinalWidthCrushPerc: finalWidthCrushPerc,
                FinalHeightCrush: finalHeightCrush,
                Area: itemW * itemH
            });
        }

        var finalCrushedItem = getObjectWithHighestValue(finalItemAreaResults, 'Area');
        itemX = finalCrushedItem.ItemX;
        itemY = finalCrushedItem.ItemY;
        itemW = finalCrushedItem.ItemW;
        itemH = finalCrushedItem.ItemH;
        var finalWidthCrushPerc = finalCrushedItem.FinalWidthCrushPerc;
        var finalHeightCrush = finalCrushedItem.FinalHeightCrush;

        if (p_set_ind == "Y") {
            //we set the crush perc, item H. etc. if manual crush is N.
            if (finalWidthCrushPerc <= p_crush_width_perc && finalHeightCrush <= p_crush_height_perc && p_item_manual_wc_ind == "N" && p_item_manual_hc_ind == "N") {
                p_item.W = itemW;
                p_item.X = itemX;
                p_item.WChanged = "Y";
                if (p_actualWidth == "W") p_item.CrushHoriz = finalWidthCrushPerc;
                else if (p_actualWidth == "H") p_item.CrushVert = finalWidthCrushPerc;
                else if (p_actualWidth == "D") p_item.CrushD = finalWidthCrushPerc;

                p_item.H = itemH;
                p_item.Y = itemY;
                p_item.HChanged = "Y";
                if (p_actualHeight == "H") p_item.CrushVert = finalHeightCrush;
                else if (p_actualHeight == "W") p_item.CrushHoriz = finalHeightCrush;
                else if (p_actualHeight == "D") p_item.CrushD = finalHeightCrush;

                g_error_category = "";
                return "Y";
            } else if (p_item_manual_wc_ind == "Y" || p_item_manual_hc_ind == "Y") {
                const manualWidth = wpdSetFixed(item_width - item_width * (p_crush_width_perc / 100));
                const manualHeight = wpdSetFixed(item_height - item_height * (p_crush_height_perc / 100));
                if (checkChestCrushedItemHit(p_item.X, p_item.Y, p_item_manual_wc_ind == "Y" ? manualWidth : item_width, p_item_manual_hc_ind == "Y" ? manualHeight : p_item.H, p_shelf, p_item_index) == "N") {
                    if (p_item_manual_wc_ind == "Y") {
                        p_item.W = manualWidth;
                        p_item.WChanged = "Y";
                        if (p_actualWidth == "W") p_item.CrushHoriz = p_crush_width_perc;
                        else if (p_actualWidth == "H") p_item.CrushVert = p_crush_width_perc;
                        else if (p_actualWidth == "D") p_item.CrushD = p_crush_width_perc;
                    }

                    if (p_item_manual_hc_ind == "Y") {
                        p_item.H = manualHeight;
                        p_item.HChanged = "Y";
                        if (p_actualHeight == "H") p_item.CrushVert = p_crush_height_perc;
                        else if (p_actualHeight == "W") p_item.CrushHoriz = p_crush_height_perc;
                        else if (p_actualHeight == "D") p_item.CrushD = p_crush_height_perc;
                    }
                    g_error_category = "";
                    return "Y";
                } else {
                    g_error_category = "W";
                    return "N";
                }
            } else {
                g_error_category = "W"; //ASA-1405 Issue 4
                return "N"; //ASA-1405 Issue 4
            }
        }
        g_error_category = "";
        return "Y";
    } catch (err) {
        error_handling(err);
    }
}

// ASA-1628, this is was need to handle a case when y,x,w,h are same of 2 shelf. They were getting overlapped.
// New validation added in validate_shelf_min_distance
function isShelfOverlapShelf(pShelfX, pShelfY, pShelfW, pShelfH, pCompareX, pCompareY, pCompareW, pCompareH) {
    try {
        const overlapX = Math.abs(wpdSetFixed(pShelfX - pCompareX)) < wpdSetFixed((pShelfW / 2 + pCompareW / 2));
        const overlapY = Math.abs(wpdSetFixed(pShelfY - pCompareY)) < wpdSetFixed((pShelfH / 2 + pCompareH / 2));

        return overlapX && overlapY;
    } catch (err) {
        error_handling(err);
    }
}


//ASA-1697 - Start
function getAutofillModShelf(p_dragMouseStart, p_dragMouseEnd, p_pog_json, p_pog_index, p_action_ind) {
    try {
        var dragStart = wpdSetFixed(Math.min(p_dragMouseStart.x, p_dragMouseEnd.x));
        var dragEnd = wpdSetFixed(Math.max(p_dragMouseStart.x, p_dragMouseEnd.x));
        var dragTop = wpdSetFixed(Math.max(p_dragMouseStart.y, p_dragMouseEnd.y));
        var dragBottom = wpdSetFixed(Math.min(p_dragMouseStart.y, p_dragMouseEnd.y));

        var selectedModule = [];
        var overlappingShelfs = [];
        var maxOverlapWidth = 0;
        var idx = 0;
        for (const module of p_pog_json[p_pog_index].ModuleInfo) {
            if (module.ParentModule == null) {
                const modStart = wpdSetFixed(module.X - module.W / 2);
                const modEnd = wpdSetFixed(module.X + module.W / 2);
                const modTop = wpdSetFixed(module.Y + module.H / 2);
                const modBottom = wpdSetFixed(module.Y - module.H / 2);

                const adjustedDragStart = Math.max(dragStart, modStart);
                const adjustedDragEnd = Math.min(dragEnd, modEnd);
                const adjustedDragTop = Math.min(dragTop, modTop);
                const adjustedDragBottom = Math.max(dragBottom, modBottom);

                if (adjustedDragStart < adjustedDragEnd && adjustedDragBottom < adjustedDragTop) {
                    const overlapWidth = adjustedDragEnd - adjustedDragStart;

                    if (overlapWidth > maxOverlapWidth) {
                        maxOverlapWidth = overlapWidth;
                        selectedModule[0] = {
                            moduleInfo: module,
                            dragStart: adjustedDragStart, dragEnd: adjustedDragEnd, dragTop: adjustedDragTop, dragBottom: adjustedDragBottom,
                            modStart: modStart, modEnd: modEnd, modTop: modTop, modBottom: modBottom,
                            modIdx: idx
                        };
                    }
                }
            }
            idx++;
        }
        idx = 0;
        if (selectedModule.length > 0) {
            for (const blkInfo of g_mod_block_list) {
                //ASA-1986 start
                if (
                    typeof blkInfo === "undefined" || blkInfo == null || typeof blkInfo.BlkModInfo === "undefined" || blkInfo.BlkModInfo == null || blkInfo.BlkModInfo.length == 0 || typeof blkInfo.BlkModInfo[0] === "undefined" || blkInfo.BlkModInfo[0] == null || typeof blkInfo.BlockDim === "undefined" || blkInfo.BlockDim == null || typeof blkInfo.BlockDim.FinalTop === "undefined" || typeof blkInfo.BlockDim.FinalBtm === "undefined"
                ) {
                    continue;
                } //ASA-1986  end 
                const prevBlk = blkInfo.BlkModInfo[0];
                if (typeof prevBlk.dragStart === "undefined" || typeof prevBlk.dragEnd === "undefined") { //ASA-1986 start
                    continue;
                }
                // if (prevBlk.dragStart < selectedModule[0].dragEnd && prevBlk.dragEnd > selectedModule[0].dragStart && prevBlk.dragTop > selectedModule[0].dragBottom && prevBlk.dragBottom < selectedModule[0].dragTop) {
                if (prevBlk.dragStart < selectedModule[0].dragEnd && prevBlk.dragEnd > selectedModule[0].dragStart && blkInfo.BlockDim.FinalTop > selectedModule[0].dragBottom && blkInfo.BlockDim.FinalBtm < selectedModule[0].dragTop) {  //ASA-1878

                    // if(selectedModule[0].dragTop <= blkInfo.BlockDim.FinalBtm && selectedModule[0].dragBottom >= blkInfo.BlockDim.FinalBtm){
                    //     selectedModule[0].dragTop = blkInfo.BlockDim.FinalBtm;
                    // } 

                    // if(selectedModule[0].dragBottom <= blkInfo.BlockDim.FinalTop && selectedModule[0].dragTop >= blkInfo.BlockDim.FinalTop){
                    //     selectedModule[0].dragBottom = blkInfo.BlockDim.FinalTop;
                    // }

                    if (prevBlk.dragEnd > selectedModule[0].dragStart && prevBlk.dragEnd < selectedModule[0].dragEnd) {
                        selectedModule[0].dragStart = prevBlk.dragEnd;
                    }
                    if (prevBlk.dragStart < selectedModule[0].dragEnd && selectedModule[0].dragStart < prevBlk.dragStart) {
                        selectedModule[0].dragEnd = prevBlk.dragStart;
                    }

                    if (selectedModule[0].dragStart >= prevBlk.dragStart && selectedModule[0].dragEnd <= prevBlk.dragEnd
                        // && selectedModule[0].dragTop <= blkInfo.BlockDim.FinalTop && selectedModule[0].dragBottom >= blkInfo.BlockDim.FinalBtm
                    ) {
                        selectedModule = [];
                        overlappingShelfs = [];
                        return [selectedModule, overlappingShelfs];
                    }
                    g_DragMouseStart.x = selectedModule[0].dragStart;
                    // g_DragMouseStart.y = selectedModule[0].dragTop;
                    g_DragMouseEnd.x = selectedModule[0].dragEnd;
                    // g_DragMouseEnd.y = selectedModule[0].dragBottom; 
                }
            }


            for (const shelf of selectedModule[0].moduleInfo.ShelfInfo) {
                if (shelf.ObjType != 'TEXTBOX' && shelf.ObjType != 'DIVIDER' && shelf.ObjType != 'BASE' && shelf.ObjType != 'DIVIDER') {
                    const shelfStart = wpdSetFixed(shelf.X - shelf.W / 2);
                    const shelfEnd = wpdSetFixed(shelf.X + shelf.W / 2);
                    const shelfTop = wpdSetFixed(shelf.Y + shelf.H / 2);
                    const shelfBottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                    if (dragStart < shelfEnd && dragEnd > shelfStart && dragTop > shelfBottom && dragBottom < shelfTop) {
                        const overlapWidth = Math.min(dragEnd, shelfEnd) - Math.max(dragStart, shelfStart);
                        overlappingShelfs.push({ ShelfInfo: shelf, OverlapWidth: overlapWidth, ShelfIdx: idx });
                    }
                }
                idx++;
            }
        } else {
            selectedModule = [];
            overlappingShelfs = [];
        }
        return [selectedModule, overlappingShelfs];
    } catch (err) {
        error_handling(err);
    }
}

async function setAutofillBlock(p_action_ind, p_old_blk_name, p_escape_ind = "N", p_new_ind = 'Y', p_color = '#ffffff') {
    try {
        var block_detail = {};
        var filters_arr = [];
        var attr_arr = [];
        var filter_val = [];
        var blk_name_arr = [];
        var upd_block_dtl = {};
        var blockName = p_old_blk_name; //$v("P193_BLK_NAME") + "_AFP";
        if (p_escape_ind == "Y") {
            var block_details_arr = [];
            for (const obj of g_mod_block_list) {
                var details = {};
                details["BlkColor"] = obj.BlkColor;
                details["BlkName"] = obj.BlkName;
                details["BlkRule"] = obj.BlkRule;
                details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                details["OldBlkName"] = obj.BlkName;
                obj["BlkFilters"] = details["BlkFilters"];  //ASA-1694;
                block_details_arr.push(details);
            }
            closeInlineDialog("block_details");
            var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
        }
        if (p_old_blk_name == blockName && p_action_ind == "U") {
            blk_name_arr = [];
        } else {
            blk_name_arr = [blockName];
        }

        block_detail["BlkName"] = blockName;
        if (p_new_ind == 'N') { //garit
            block_detail["BlkColor"] = p_color;
        } else {
            block_detail["BlkColor"] = $v("P193_BLK_COLOR");
        }
        block_detail["BlkRule"] = $v("P193_BLK_RULE");
        var shelf_arr = [];
        var mod_index = [];
        var final_shelf_arr = [];
        if (p_action_ind !== "U" && (!Array.isArray(g_autofillModInfo) || g_autofillModInfo.length == 0 || !Array.isArray(g_autofillShelfInfo) || g_autofillShelfInfo.length == 0)) { //ASA-1986 start
            return false;
        }
        if (p_action_ind !== "U") {
            block_detail["DragMouseStart"] = g_DragMouseStart;
            block_detail["DragMouseEnd"] = g_DragMouseEnd;
            block_detail["BlkModInfo"] = g_autofillModInfo;
            block_detail["BlkShelfInfo"] = g_autofillShelfInfo;
            for (const shelf of g_autofillShelfInfo) {
                shelf.ShelfInfo.BlkName = blockName;
                shelf.ShelfInfo.MIndex = g_autofillModInfo[0].modIdx;
                shelf.ShelfInfo.SIndex = shelf.ShelfIdx;
                shelf_arr.push(shelf.ShelfInfo);
            }
            mod_index.push(g_autofillModInfo[0].modIdx);
            mod_index.sort();
            // if (g_mod_block_list.length > 0) {
            //     for (const shelfs of shelf_arr) {
            //         valid = true;
            //         for (const obj of g_mod_block_list) {
            //             if (!valid) {
            //                 break;
            //             }
            //             for (const dtl of obj.g_delete_details) {
            //                 if (shelfs.MIndex == dtl.MIndex && shelfs.SIndex == dtl.SIndex) {
            //                     valid = false;
            //                     break;
            //                 }
            //             }
            //         }
            //         if (valid) {
            //             final_shelf_arr.push(shelfs);
            //         }
            //     }
            // } else {
            final_shelf_arr = shelf_arr;
            // }
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
        if (p_new_ind != 'N') //garit
        {
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
        }
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
            if (p_new_ind != 'N') //garit
            {
                apex.region("block_filters").widget().interactiveGrid("getActions").set("edit", false);
                apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                apex.region("block_filters").refresh();
                clear_blinking();
            }
            var sendColor =
                (p_new_ind == 'N')
                    ? p_color
                    : $v("P193_BLK_COLOR");
            var ret_dtl = await colorAutofillBlock(g_DragMouseStart, g_DragMouseEnd, mod_index, sendColor, blockName, p_action_ind, upd_block_dtl, g_pog_index);
            if (typeof ret_dtl === "undefined" || ret_dtl == null) {
                return false; // ASA-1986 start
            }
            block_detail["BlockDim"] = ret_dtl;
            g_mod_block_list.push(block_detail);

            closeInlineDialog("block_details");

            if (p_action_ind == "U") {
                var details = {};
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
                        details["BlkColor"] = $v("P193_BLK_COLOR");
                        details["BlkName"] = blockName;
                        details["BlkRule"] = $v("P193_BLK_RULE");
                        details["BlkFilters"] = filters_arr.join(" AND ");
                        details["OldBlkName"] = p_old_blk_name;
                        obj["BlkFilters"] = details["BlkFilters"];
                        block_details_arr.push(details);
                    }
                }
                var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
            } else if (p_action_ind == "Y") {
                var block_details_arr = [];

                for (const obj of g_mod_block_list) {
                    var details = {};
                    details["BlkColor"] = obj.BlkColor;
                    details["BlkName"] = obj.BlkName;
                    details["BlkRule"] = obj.BlkRule;
                    details["BlkFilters"] = obj.BlockFilters.join(" AND ");
                    obj["BlkFilters"] = details["BlkFilters"];  //ASA-1694;
                    // obj["BlkModInfo"] = g_autofillModInfo;
                    // obj["BlkShelfInfo"] =  g_autofillShelfInfo;
                    block_details_arr.push(details);
                }
                var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
            } else if (p_action_ind == "A" && p_new_ind != 'N') { //ASA-1965 Issue 4 
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
                return true //ASA-1986 start
            }
        }
    } catch (err) {
        error_handling(err);
        return false //ASA-1986 start
    }
}


async function colorAutofillBlock(p_dragMouseStart, p_dragMouseEnd, p_mod_index, p_color, p_text, p_update_flag, p_block_detail, p_pog_index, p_swapBlock) {
    try {
        var i = 0;
        // ASA-1986 start
        var calc_x = 0,
            calc_y = 0,
            calc_width = 0,
            calc_height = 0;
        var font_size = parseInt($v("P193_POGCR_BLK_TXT_SIZE"));
        if (!Array.isArray(g_autofillModInfo) || g_autofillModInfo.length == 0) {
            return null;
        }
        if (!Array.isArray(p_mod_index) || p_mod_index.length == 0) {
            return null;
        }
        if (
            typeof g_pog_json[p_pog_index] === "undefined" ||
            g_pog_json[p_pog_index] == null ||
            typeof g_pog_json[p_pog_index].ModuleInfo === "undefined" ||
            typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]] === "undefined"
        ) {
            return null;
        }
        // ASA-1986 end
        var font_size = parseInt($v("P193_POGCR_BLK_TXT_SIZE"));
        var btm_y = g_autofillModInfo[0].dragBottom,
            top_y = g_autofillModInfo[0].dragTop;

        var mod_top = g_autofillModInfo[0].modTop,
            mod_bottom = g_autofillModInfo[0].modBottom;

        var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].ShelfInfo;

        var final_btm = -1;
        var final_top = -1;

        if (p_update_flag !== "U") {
            final_btm = get_below_shelf(l_shelf_details, p_mod_index[0], btm_y, p_pog_index);
            final_top = get_above_shelf(l_shelf_details, p_mod_index[0], top_y, mod_top, p_pog_index);
            // ASA-1986 start
            var calc_height = final_top - final_btm;
            var calc_width = g_autofillModInfo[0].dragEnd - g_autofillModInfo[0].dragStart;
            var calc_x = g_autofillModInfo[0].dragStart + ((g_autofillModInfo[0].dragEnd - g_autofillModInfo[0].dragStart) / 2) - g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].X;
            // ASA-1986 End

            if (g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y < final_btm) {
                var diff = final_btm - g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y;
                calc_y = diff + calc_height / 2;
            } else {
                var diff = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y - final_btm;
                calc_y = 0 - diff + calc_height / 2;
            }
        } else {
            calc_x = p_block_detail.BlockDim.CalcX;
            calc_y = p_block_detail.BlockDim.CalcY;
            calc_width = p_block_detail.BlockDim.BlkWidth;
            calc_height = p_block_detail.BlockDim.BlkHeight;
            final_top = p_block_detail.BlockDim.FinalTop;
            final_btm = p_block_detail.BlockDim.FinalBtm;
        }

        if (!Number.isFinite(calc_width) || !Number.isFinite(calc_height) || calc_width <= 0 || calc_height <= 0) {  // ASA-1986 start
            return null;
        }
        if (!Number.isFinite(calc_x) || !Number.isFinite(calc_y)) {  // ASA-1986 start
            return null;
        }
        var colorValue = parseInt(p_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);

        if (typeof p_text !== "string") {  // ASA-1986 start
            p_text = "BLK";
        }
        if (p_text.endsWith("_AFP")) {  // ASA-1986 start
            p_text = p_text.slice(0, -4);
        }
        console.log("val", p_dragMouseStart, p_dragMouseEnd, p_mod_index[0], p_color, p_text);
        console.log("calc_height", calc_width, calc_height, calc_y, final_top, mod_top, final_btm, mod_bottom);

        let mesh = dcText(p_text, font_size, 0x000000, colorValue, calc_width, calc_height, "N", "N", "Arial", "", font_size, 0, -1, 4);
        if (!mesh) { // ASA-1986 start
            return null;
        }
        var mod_object = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].MObjID);
        if (!mod_object || typeof mod_object.add !== "function") { // ASA-1986 start
            return null;
        }
        mod_object.add(mesh);
        mesh.uuid = p_text + "_AFP";
        if (mesh.material) {  // ASA-1986 start
            mesh.material.opacity = 0.5;
        }
        if (mesh.position) { // ASA-1986 start
            mesh.position.x = calc_x;
            mesh.position.y = calc_y;
            mesh.position.z = 0.009;
        }
        render(p_pog_index);
        g_delete_details = [];
        g_mselect_drag = "N";
        var details = {};
        details["CalcX"] = calc_x;
        details["CalcY"] = calc_y;
        details["CalcZ"] = 0.009;
        details["BlkWidth"] = calc_width;
        details["BlkHeight"] = calc_height;
        details["ColorObj"] = mod_object;
        details["FinalTop"] = final_top;
        details["FinalBtm"] = final_btm;

        if (p_swapBlock == "Y") {
            g_DragMouseStart.x = p_dragMouseStart.x;
            g_DragMouseStart.y = p_dragMouseStart.y;
            g_DragMouseEnd.x = p_dragMouseEnd.x;
            g_DragMouseEnd.y = p_dragMouseEnd.y;
            await get_multiselect_obj(p_pog_index);
            p_block_detail.g_delete_details = [];
            for (shelfs of g_delete_details) {
                p_block_detail.g_delete_details.push(shelfs);
            }
            g_delete_details = [];
        }
        return details;
    } catch (err) {
        // error_handling(err);
        console.warn("colorAutofillBlock skipped due to invalid render state:", err); // ASA-1986 start
        return null;
    }

}

//ASA-1697 - End

//ASA-1765 Issue 3
function validateShelfWithFixedItem(pShelf, pSpreadProduct, pSpreadGap, pItems) {
    try {
        var shelfStart = wpdSetFixed(pShelf.X - pShelf.W / 2);
        var shelfEnd = wpdSetFixed(pShelf.X + pShelf.W / 2);
        var itemSplitObj = []; //This will hold array of items seperated by fixed items. Will include fixed items as well
        var currentItemFixed = "N";
        var itemSplitArr = [];
        var i = 0;
        for (const items of pItems) {
            items.IIndex = i;
            if (items.Fixed == "Y") {
                itemSplitArr.push(items);
                if (i !== 0) {
                    itemSplitObj.push(itemSplitArr);
                    itemSplitArr = [];
                    itemSplitArr.push(items);
                }
                currentItemFixed = "Y";
            } else {
                itemSplitArr.push(items);
                currentItemFixed = "N";
            }
            i++;
        }
        if (currentItemFixed == "N") {
            itemSplitObj.push(itemSplitArr);
        }
        for (splitShelfItems of itemSplitObj) {
            var j = 0;
            var splitStart = shelfStart;
            var splitEnd = shelfEnd;
            for (item of splitShelfItems) {
                if (item.Fixed == "Y") {
                    if (j == 0) {
                        splitStart = wpdSetFixed(item.X + item.W / 2);
                    }

                    if (j == splitShelfItems.length - 1) {
                        splitEnd = wpdSetFixed(item.X - item.W / 2);
                    }
                }
                j++;
            }
            var splitAvlSpace = splitEnd - splitStart;
            var k = 0;
            for (item of splitShelfItems) {
                if (item.Fixed == "N" && (typeof item.BottomObjID === "undefined" || item.BottomObjID === "")) {
                    if (item.BHoriz > 1 && pSpreadProduct == "F") {
                        splitAvlSpace = wpdSetFixed(splitAvlSpace - (item.W + pSpreadGap * (item.BHoriz - 1)));
                    } else {
                        splitAvlSpace = wpdSetFixed(splitAvlSpace - item.W);
                    }
                }
                k++;
            }
            if (splitAvlSpace < 0) {
                return true;
            }
        }
        return false;
    } catch (err) {
        error_handling(err);
    }
}

function open_draft() {
    g_color_arr = [];
    g_highlightArr = [];
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_pog_edited_ind == "Y") {
        confirm(get_message("POGCR_CHANGE_REVERT_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
            openCustomDialog("OPEN_DRAFT", $v("P193_OPEN_DRAFT_URL"), "P193_DRAFT_TRIGGER_ELEMENT");
        });
    } else {
        openCustomDialog("OPEN_DRAFT", $v("P193_OPEN_DRAFT_URL"), "P193_DRAFT_TRIGGER_ELEMENT");
    }
    g_dblclick_opened = "Y";



    //logDebug("function : open_draft", "E");
}

function openCustomDialog(p_ind, p_url, p_item) {
    try {
        $s(p_item, p_ind);
        apex.navigation.redirect(p_url);
        //logDebug("function : openCustomDialog; ", "E");
    } catch (err) {
        error_handling(err);
    }
}


function open_pog() {
    try {
        logDebug("function : open_pog", "S");
        $s("P193_OPEN_POG_CODE", "");
        $s("P193_DIVISION", "");
        $s("P193_EXISTING_POG_TYPE", "R");
        $s("P193_POG_STATUS", "");
        $s("P193_DRAFT_LIST", "");
        $s("P193_POG_DESCRIPTION", "");
        $s("P193_EXISTING_DRAFT_VER", "");
        $s("P193_MULTI_POG_CODE", "");
        sessionStorage.removeItem("g_color_arr");
        sessionStorage.removeItem("g_highlightArr");
        g_highlightArr = [];
        g_dblclick_opened = "Y";
        // if ($(".a-Splitter-thumb").attr("aria-label") == "Collapse") {
        //     $(".a-Splitter-thumb").click();
        // }
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_pog_edited_ind == "Y") {
            confirm(get_message("POGCR_CHANGE_REVERT_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
                openCustomDialog("OPEN_EXITPOG", $v("P193_EXIST_POG_URL"), "P193_EXISTPOG_TRIGGER_ELEMENT");
            });
            //Task_29818 - End
        } else {
            openCustomDialog("OPEN_EXITPOG", $v("P193_EXIST_POG_URL"), "P193_EXISTPOG_TRIGGER_ELEMENT");
        }
        logDebug("function : open_pog", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function open_draft_pog(p_imageLoadInd = "N", p_draft_pog_list, p_open_attribute) {
    if (p_draft_pog_list !== null) {
        var records = JSON.parse(p_draft_pog_list);
        var open_attr = p_open_attribute;
    }
    g_pog_json = [];
    g_mod_block_list = [];
    g_show_changes_block_snapshot = [];  //ASA-1986 
    //ASA-1129, Start
    sessionStorage.removeItem("g_combinedShelfs");
    sessionStorage.removeItem("combinedShlfDets");
    g_combinedShelfs = [];
    var rec_detail = [];
    g_scene_objects = [];
    g_canvas_objects = [];
    appendMultiCanvasRowCol(1, $v("P_POGCR_TILE_VIEW"));
    $("#canvas-list-holder").html("");
    for (const l_rec of records) {
        rec_detail.push(parseInt(l_rec.SequenceID));
    }

    if (records.length == 1) {
        var pog_sequence_id = records[0].SequenceID;
        var desc = records[0].DescriptionDetails;
        var pog_desc = records[0].Description;
        $s("P193_DRAFT_LIST", pog_sequence_id);
        $s("P193_POG_DESCRIPTION", pog_desc);
        $s("P193_OPEN_DRAFT", 'Y');
        var draftVer = records[0].DraftVersion;
        $s("P193_EXISTING_DRAFT_VER", draftVer);
        sessionStorage.setItem("P193_EXISTING_DRAFT_VER", draftVer);
        addLoadingIndicator(); //ASA-1500
        var p = apex.server.process(
            'GET_POG_JSON',
            {
                x01: pog_sequence_id
            },
            {
                dataType: "html",
            }
        );
        // When the process is done, set the value to the page item
        p.done(function (data) {
            var return_data = $.trim(data);
            if (return_data.match(/ERROR.*/)) {
                javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P193_OPEN_NEW_TAB,P193_PRODUCT_BTN_CLICK,P193_DRAFT_LIST,P193_POG_DESCRIPTION,P193_EXISTING_DRAFT_VER:Y,N," + p_draft_seq_id + "," + p_draft_desc + "," + p_draft_version);
                sessionStorage.removeItem("POGJSON");
                resolve("SUCESS");
            } else if (return_data !== "") {
                g_pog_json = JSON.parse($.trim(data));
            }
        });
        await get_json_data([$v("P193_DRAFT_LIST")], p_imageLoadInd, pog_desc)
        removeLoadingIndicator(regionloadWait); //ASA-1500
        upload_file_flag = "N";
        g_auto_fill_active = "N";
        await auto_fill_setup(0);
        if (!g_mod_block_list || g_mod_block_list.length === 0) { //Garit
            await createDynamicBlocks($v('P193_OPEN_POG_CODE'), $v('P193_OPEN_DRAFT'), $v('P193_OPEN_POG_VERSION'));
        } else {
            apex.region("mod_block_details").refresh();
            apex.region("added_attribute").refresh();
        }
            wpdCaptureShowChangesBlockSnapshot(g_mod_block_list, "Y");  //ASA-1986 
    }
}

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
        if ($v("P193_POGCR_VALIDATE_POG") == "Y" && p_pog_code.length == 1) {
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
                apex.event.trigger("#P193_ERROR_METHOD", "apexrefresh");
                g_dblclick_opened = "Y";
                openInlineDialog("errored_items", 60, 65);
            } else {
                g_dblclick_opened = "N";
                var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_camera, g_scene, g_pog_index, g_pog_index);
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
            appendMultiCanvasRowCol(p_pog_code.length, $v("P193_POGCR_TILE_VIEW"));
            //this will set the view. can be horizontal or vertical.
            switchCanvasView($v("P193_POGCR_TILE_VIEW")); // Task-22510

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
                var retval = await get_all_images(0, g_get_orient_images, "Y", $v("P193_POGCR_IMG_MAX_WIDTH"), $v("P193_POGCR_IMG_MAX_HEIGHT"), $v("P193_IMAGE_COMPRESS_RATIO"));
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
                        var return_val = await recreate_image_items("Y", $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P193_POGCR_ITEM_DETAIL_LIST')
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

function get_draft_ind(p_seq_id) {
    logDebug("function : get_draft_ind; seq_id : " + p_seq_id, "S");
    console.log("get_draft_ind", p_seq_id);
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "GET_DRAFT_IND",
            {
                x01: p_seq_id,
            },
            {
                dataType: "text",
                success: function (pData) {
                    console.log("get_draft_ind pData", pData);
                    if ($.trim(pData) != "") {
                        logDebug("function : get_draft_ind", "E");
                        resolve($.trim(pData));
                    }
                },
            }
        );
    });
}

function loadDraftVersion(p_seq_id) { //ASA-1912
    logDebug("function : loadDraftVersion; seq_id : " + p_seq_id, "S");
    console.log("loadDraftVersion", p_seq_id);
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "GET_DRAFT_VERSION",
            {
                x01: p_seq_id,
            },
            {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) !== "") {
                        resolve($.trim(pData)); // return the draft version here
                    } else {
                        resolve(null); // or reject if needed
                    }
                },
            }
        );
    });
}

function generateMultiPogDropdown() {
    var pogCode,
        pogVersion,
        appendHtml,
        versionHtml = "";
    $("[data-pog=true]").remove();
    for (var i = 0; i < g_pog_json.length; i++) {
        if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
            pogCode = g_pog_json[i].POGCode;
            pogVersion = g_pog_json[i].Version;
            versionHtml = typeof pogVersion !== "undefined" && pogVersion !== null ? " - " + pogVersion : "";
            appendHtml = "<a onclick=setPogActive(" + i + ") class='float_left top_icon print_rep' data-indx='" + i + "' data-pog=true>" + pogCode + versionHtml + "</a>";
            $("#multiPogDropdown").append(appendHtml);
            $("[data-pog]").removeClass("multiPogList_active");
            $("[data-indx=" + g_pog_index + "]").addClass("multiPogList_active");
        }
    }
}

async function get_existing_pog(pog_code, pog_version, canvasNo, pMultiple, pImageLoadInd = "N") {
    logDebug("function : get_existing_pog; pog_code : " + pog_code + "; pog_version : " + pog_version, "S");
    $(".item_label").removeClass("item_label_active");
    $(".item_desc").removeClass("item_label_active");
    $(".fixel_label").removeClass("fixel_label_active");
    $(".notch_label").removeClass("notch_label_active");
    $(".fixel_merch").removeClass("max_merch_active");
    $(".item_color").removeClass("item_color_active");
    $(".overhung_shelf").removeClass("overhung_shelf_active"); //ASA-1138
    $(".item_sublabel").removeClass("item_sublabel_active"); //ASA-1182
    $("#item_sublbl_sub .items").removeClass("item_sublabel_active"); //ASA-1182
    sessionStorage.removeItem("g_color_arr");
    sessionStorage.removeItem("g_highlightArr");
    g_color_arr = [];
    g_highlightArr = [];
    l_new_pog_ind = "N";

    try {
        //if validate = 'Y' then we create only the json and then try to call item height, width, depth validation also validate shelf.
        //if found errors we suggest methods to correct them.
        if ($v("P193_POGCR_VALIDATE_POG") == "Y" && pMultiple == "N") {
            init(canvasNo);
            console.log("init complete", {
                canvasNo: canvasNo,
                g_canvas_objects_len: g_canvas_objects ? g_canvas_objects.length : 0,
                g_scene_objects_len: g_scene_objects ? g_scene_objects.length : 0,
                dom_canvas_count: document.querySelectorAll('canvas[data-canvas=true]').length
            });
            objects = {};
            objects["scene"] = g_scene;
            objects["renderer"] = g_renderer;
            g_scene_objects.push(objects);
            try { console.log('get_existing_pog: pushed scene object index=', g_scene_objects.length - 1, 'renderer present=', objects.renderer && objects.renderer.domElement && objects.renderer.domElement.id); } catch (e) { }
            set_indicator_objects(g_scene_objects.length - 1);

            // addLoadingIndicator(); //Task_28125
            var returnval = await getJson("N", pog_code, pog_version, "N", "Y", g_camera, g_scene, canvasNo, pImageLoadInd);
            //this function will run validation on all the items and shelf and create a collection with error details. if errors exists
            //it will open a popup with IG of error details and its correction method.
            var failed = await validate_pog(canvasNo);
            if (failed == "Y") {
                removeLoadingIndicator(regionloadWait);
                var returnval = await save_validate_items_coll(g_errored_items);
                apex.region("ig_errored_item").refresh();
                apex.event.trigger("#P193_ERROR_METHOD", "apexrefresh");
                g_dblclick_opened = "Y";
                openInlineDialog("errored_items", 60, 65);
            } else {
                g_dblclick_opened = "N";
                var return_val = await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "N", "N", "Y", "N", "", "Y", g_camera, g_scene, g_pog_index, g_pog_index, pImageLoadInd);
                // removeLoadingIndicator(regionloadWait); //ASA-1500
            }
        } else {
            //else directly call the getjson to create skeleton.
            try {
                const canvases = document.querySelectorAll('canvas[data-canvas=true]');
                const seen = new Set();
                canvases.forEach(function (c) {
                    if (seen.has(c.id)) {
                        c.parentNode && c.parentNode.removeChild(c);
                    } else {
                        seen.add(c.id);
                    }
                });
            } catch (e) {
                console.warn('normalize canvases failed', e);
            }
            init(canvasNo);
            objects = {};
            objects["scene"] = g_scene;
            objects["renderer"] = g_renderer;
            g_scene_objects.push(objects);
            set_indicator_objects(g_scene_objects.length - 1);
            var returnval = await getJson("N", pog_code, pog_version, "Y", "Y", g_camera, g_scene, canvasNo, pImageLoadInd);
            console.log("after getJson", { g_pog_json_len: g_pog_json ? g_pog_json.length : 0, g_pog_index: g_pog_index });
        }

        logDebug("function : get_existing_pog", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function open_existing_pog(p_pog_list_arr, p_openAttr, p_imageLoadInd = "N") {
    try {
        logDebug("function : open_existing ; ", "S");
        addLoadingIndicator(); //ASA-1500
        $("#canvas-list-holder").html("");
        g_open_pog_flag = "Y";
        var pog_code_list = [],
            pog_version_list = [],
            real_pog_list = []; //ASA-1803 Issue 3
        g_scene_objects = [];
        g_scene_objects_backup = [];
        g_canvas_objects = [];
        g_pogjson_backup = [];
        g_pogjson_data_backup = [];
        g_seqArr = [];
        g_all_pog_flag = "N";
        g_ComBaseIndex = -1;
        g_ComViewIndex = -1;
        g_compare_pog_flag = "N";
        g_compare_view = "NONE";
        g_colorBackup = "N";
        g_mod_block_list = [];
        g_show_changes_block_snapshot = [];  //ASA-1986 
        // switchCanvasView($v("P193_POGCR_TILE_VIEW"));
        appendMultiCanvasRowCol(1, $v("P193_POGCR_TILE_VIEW"));
        try { console.log('open_existing_pog: after appendMultiCanvasRowCol, g_canvas_objects.length=', g_canvas_objects.length, 'DOM canvas count=', document.querySelectorAll('canvas').length); } catch (e) { }
        g_pog_json = [];
        g_pog_json = [];
        g_pog_json_data = [];
        //ASA-1129, Start
        sessionStorage.removeItem("g_combinedShelfs");
        sessionStorage.removeItem("combinedShlfDets");
        g_combinedShelfs = [];
        //ASA-1129, End
        for (const pog_details of p_pog_list_arr) {
            pog_code_list.push(pog_details.POGCode);
            pog_version_list.push(pog_details.POGVersion);
            real_pog_list.push(pog_details.IsRealPOG);
        }
        var is_real_pog = "Y";
        var selectedIds = "";
        if (g_show_live_image == "N") {
            g_show_live_image = $v("P193_POGCR_DFLT_LIVE_IMAGES");
            g_imagesShown = "N";
        }
        if (g_compare_pog_flag == "Y" && g_compare_view == "POG" && g_show_live_image == "N") {
            g_show_live_image = $v("P193_POGCR_DFLT_LIVE_IMAGES");
            g_imagesShownComp = "N";
        }
        g_combinedShelfs = []; //ASA-1443
        if (pog_code_list.length == 1) {
            $(".save_template").css("display", "block");

            selectedIds += pog_code_list[0] + ":";
            $s("P193_SELECTED_RECORDS", selectedIds);
            g_pog_index = 0;
            g_multi_pog_json = [];
            appendMultiCanvasRowCol(1);
            g_canvas_objects = [];
            await setDefaultState("N");
            $("#pog_list_btn").css("display", "none"); //ASA-1425
            $("#chng_view_btn").css("display", "none"); //ASA-1425
            $(".add_pog").css("display", "block");
            $(".open_par").css("display", "block"); //ASA-1587
            if (real_pog_list[0] == "N") {
                removeLoadingIndicator(regionloadWait); //ASA-1500
                confirm(get_message("VIRTUAL_POG_OPEN_ALERT"), get_global_ind_values("AI_CONFIRM_OK_TEXT"), get_global_ind_values("AI_CONFIRM_CANCEL_TEXT"), function () {
                    $s("P193_OPEN_POG", "Y");
                    $s("P193_OPEN_POG_CODE", pog_code_list[0]);
                    $s("P193_OPEN_POG_VERSION", pog_version_list[0]);

                    async function doSomething() {
                        g_seqArrDtl = {};
                        g_seqArrDtl["seqId"] = "";
                        g_seqArrDtl["index"] = 0;
                        g_seqArrDtl["pogCode"] = pog_code_list[0];
                        g_seqArrDtl["pogVersion"] = pog_version_list[0];
                        g_seqArrDtl["pogType"] = "E";
                        g_seqArr.push(g_seqArrDtl);
                        addLoadingIndicator(); //ASA-1500
                        await get_existing_pog(pog_code_list[0], pog_version_list[0], 0, "N", "N");
                        // //ASA-1803 Added for refresh sales.
                        // if ($v("P193_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[0].NewPOG != "Y") {
                        //     //ASA-1803 Issue 3, 9
                        //     await refresh_sales_data(13, "", $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", pog_code_list[0], "N", pog_code_list[0], "N", g_pog_index, "Y");
                        //     $s("P193_REFRESH_SALE_CALL", "Y");
                        // }
                        // if ($v("P193_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
                        //     //ASA-1812 Refresh Item Dimension. Issue 3
                        //     await itemDimUpdate(g_pog_index);
                        // }
                        removeLoadingIndicator(regionloadWait); //ASA-1500
                        render(0);
                        animate_all_pog();
                    }
                    doSomething();
                });
                //Task_29818 - End
            } else {
                $s("P193_OPEN_POG", "Y");
                $s("P193_OPEN_POG_CODE", pog_code_list[0]);
                $s("P193_OPEN_POG_VERSION", pog_version_list[0]);
                async function doSomething() {
                    g_pog_index = 0;
                    g_seqArrDtl = {};
                    g_seqArrDtl["seqId"] = "";
                    g_seqArrDtl["index"] = 0;
                    g_seqArrDtl["pogCode"] = pog_code_list[0];
                    g_seqArrDtl["pogVersion"] = pog_version_list[0];
                    g_seqArrDtl["pogType"] = "E";
                    g_seqArr.push(g_seqArrDtl);
                    var retval = await get_existing_pog(pog_code_list[0], pog_version_list[0], 0, "N", "N");
                    //ASA-1803 Added for refresh sales.
                    // await refresh_sales_data(13, "", $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", pog_code_list[0], pog_code_list[0], "N", g_pog_index, "Y");

                    // if ($v("P193_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
                    //     //ASA-1812 Refresh Item Dimension. Issue 3
                    //     await itemDimUpdate(g_pog_index);
                    // }
                    removeLoadingIndicator(regionloadWait); //ASA-1500    
                    g_auto_fill_active = "N";
                    $s("P193_OPEN_DRAFT", 'N'); //Garit
                    await auto_fill_setup(0);
                    if (!g_mod_block_list || g_mod_block_list.length === 0) { //Garit
                        await createDynamicBlocks($v('P193_OPEN_POG_CODE'), $v('P193_OPEN_DRAFT'), $v('P193_OPEN_POG_VERSION'));
                    } else {
                        apex.region("mod_block_details").refresh();
                    }
                    wpdCaptureShowChangesBlockSnapshot(g_mod_block_list, "Y"); // ASA-1986
                    add_pog_versions();
                    render(0);
                    animate_all_pog();
                }
                doSomething();
            }
        } else {
            $("#pog_list_btn").css("display", "block");
            $("#chng_view_btn").css("display", "block");
            $(".add_pog").css("display", "block");
            $(".open_par").css("display", "block"); //ASA-1587
            if (p_openAttr == "M") {
                if (pog_code_list.length > 0) {
                    apex.server.process(
                        "CHECK_MOD_COUNT", {
                        x01: "P",
                        x02: "",
                        f01: pog_code_list,
                        f02: pog_version_list,
                    }, {
                        dataType: "text",
                        success: async function (pData) {
                            if ($.trim(pData) != "") {
                                alert(get_message("POGCR_MAX_MOD_ERR", $v("P193_POGCR_MAX_MOD_OPEN")));
                            } else {
                                for (const r of real_pog_list) {
                                    if (r == "N") {
                                        is_real_pog == "N";
                                    }
                                }
                                sessionStorage.setItem("pog_code_list", JSON.stringify(pog_code_list));
                                $s("P193_OPEN_POG", "Y");
                                $s("P193_OPEN_POG_CODE", pog_code_list[0]);
                                $s("P193_OPEN_POG_VERSION", pog_version_list[0]);
                                i = 0;
                                var rec_detail = [];
                                for (const r of pog_code_list) {
                                    selectedIds += pog_code_list[i] + ":";
                                    i++;
                                }
                                $s("P193_SELECTED_RECORDS", selectedIds);
                                g_pog_index = 0;
                                g_multi_pog_json = [];
                                appendMultiCanvasRowCol(pog_code_list.length, $v("P193_POGCR_TILE_VIEW"));
                                // switchCanvasView($v("P193_POGCR_TILE_VIEW"), "Y"); // Task-22510
                                await setDefaultState("N");
                                g_canvas_objects = [];
                                var j = 0;
                                for (const r of pog_code_list) {
                                    g_pog_index = j;
                                    g_seqArrDtl = {};
                                    g_seqArrDtl["seqId"] = "";
                                    g_seqArrDtl["index"] = j;
                                    g_seqArrDtl["pogCode"] = r;
                                    g_seqArrDtl["pogVersion"] = pog_version_list[j];
                                    g_seqArrDtl["pogType"] = "E";
                                    g_seqArr.push(g_seqArrDtl);
                                    var return_val = await get_existing_pog(r, pog_version_list[j], j, "Y", p_imageLoadInd);
                                    //ASA-1803 Added for refresh sales.
                                    if ($v("P193_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[j].NewPOG != "Y") {
                                        //ASA-1803 Issue 3, 9
                                        await refresh_sales_data(13, "", $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", pog_code_list[j], pog_code_list[j], "N", g_pog_index, "Y"); //ASA-1803 Issue 11
                                        $s("P193_REFRESH_SALE_CALL", "Y");
                                    }
                                    if ($v("P193_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
                                        //ASA-1812 Refresh Item Dimension. Issue 3
                                        await itemDimUpdate(g_pog_index);
                                    }
                                    g_pog_index = j;
                                    render(j);
                                    var canvas_id = g_canvas_objects[j].getAttribute("id");
                                    $("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + r + "</span>"); //HOTFIX
                                    if (j == pog_code_list.length - 1) {
                                        removeLoadingIndicator(regionloadWait);
                                    }
                                    j++;
                                }
                                g_pog_json = g_multi_pog_json;
                                generateMultiPogDropdown();
                                reset_canvas_region();
                                if (p_imageLoadInd == "Y") {
                                    addLoadingIndicator(); //ASA-1500
                                    var retval = await get_all_images(0, g_get_orient_images, "Y", $v("P193_POGCR_IMG_MAX_WIDTH"), $v("P193_POGCR_IMG_MAX_HEIGHT"), $v("P193_IMAGE_COMPRESS_RATIO"));
                                    removeLoadingIndicator(regionloadWait);
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
                                            addLoadingIndicator(); //ASA-1500
                                            var return_val = await recreate_image_items("Y", $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P193_POGCR_ITEM_DETAIL_LIST')
                                            removeLoadingIndicator(regionloadWait);
                                        } catch (err) {
                                            error_handling(err);
                                        }
                                        pogIndx++;
                                    }
                                    g_imagesShown = "Y";
                                    animate_all_pog();
                                }

                                var j = 0;
                                for (const r of g_pog_json) {
                                    var res = await enableDisableFlags(j);
                                    j++;
                                }
                                var res = await save_update_json_items(g_multi_pog_json);
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
                        },
                        loadingIndicatorPosition: "page",
                    });
                }
            } else {
                if (pog_code_list.length > 15) {
                    alert(get_message("POGCR_MAX_TAB_MESS", "15"));
                } else {
                    for (const r of real_pog_list) {
                        if (r == "N") {
                            is_real_pog == "N";
                        }
                    }
                    sessionStorage.setItem("pog_code_list", JSON.stringify(pog_code_list));
                    i = 0;
                    var rec_detail = [];
                    for (const r of pog_code_list) {
                        selectedIds += pog_code_list[i] + ":";
                        i = i + 1;
                    }
                    $s("P193_SELECTED_RECORDS", selectedIds);
                    i = 0;
                    for (const r of pog_code_list) {
                        if (i == 0) {
                            rec_detail.push(r);
                        } else {
                            var return_val = await open_in_new_tab(r, pog_version_list[i], "", "", "", $v("P193_SELECTED_RECORDS"));
                        }
                        i = i + 1;
                    }
                    if (rec_detail.length > 0) {
                        g_pog_index = 0;
                        g_multi_pog_json = [];
                        appendMultiCanvasRowCol(1);
                        $s("P193_OPEN_POG", "Y");
                        $s("P193_OPEN_POG_CODE", rec_detail[0]);
                        $s("P193_OPEN_POG_VERSION", pog_version_list[0]);
                        addLoadingIndicator(); //ASA-1500
                        await get_existing_pog(rec_detail[0], pog_version_list[0], 0, p_imageLoadInd);
                        //ASA-1803 Added for refresh sales.
                        if ($v("P193_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[0].NewPOG != "Y") {
                            //ASA-1803 Issue 3, 9
                            await refresh_sales_data(13, "", $v("P193_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", pog_code_list[0], pog_code_list[0], "N", g_pog_index, "Y");
                            $s("P193_REFRESH_SALE_CALL", "Y");
                        }
                        if ($v("P193_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
                            //ASA-1812 Refresh Item Dimension. Issue 3
                            await itemDimUpdate(g_pog_index);
                        }
                        removeLoadingIndicator(regionloadWait); //ASA-1500
                    }
                }
            }
        }
        logDebug("function : open_existing ; ", "E");

    } catch (err) {
        error_handling(err);
    }
}

async function auto_fill_setup(p_pog_index, p_af_version = '') {

    console.log("pog json length", g_pog_json[p_pog_index], g_pog_json.length);

    return new Promise((resolve, reject) => {

        if (g_all_pog_flag == "N" || (g_all_pog_flag == "Y" && g_pog_json.length == 1)) {

            $s("P193_OPEN_POG_CODE", `${g_pog_json[p_pog_index].POGCode}`);
            $s("P193_OPEN_POG_VERSION", `${g_pog_json[p_pog_index].Version}`);

            if (g_auto_fill_active == "N" && typeof g_pog_json[p_pog_index] !== undefined && g_pog_json.length > 0) {

                apex.server.process(
                    "GET_AUTOFILL",
                    {
                        x01: $v("P193_OPEN_POG_CODE"),
                        x02: $v("P193_OPEN_POG_CODE"),
                        x03: $v("P193_OPEN_DRAFT") == "Y" ? $v("P193_DRAFT_LIST") : $v("P193_OPEN_POG_VERSION"),
                        x04: $v("P193_OPEN_DRAFT"),
                        x05: p_af_version,
                    },
                    {
                        dataType: "json",

                        success: async function (pData) {

                            try {

                                var return_data = $.trim(pData).split(",");

                                if (return_data[0] == "ERROR") {
                                    raise_error(pData);
                                    resolve();
                                    return;
                                }

                                var item_exists = false;
                                var i = 0;

                                for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
                                    if (item_exists) break;

                                    if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {

                                        for (const shelf_info of modules_info.ShelfInfo) {
                                            if (item_exists) break;

                                            if (
                                                shelf_info.ObjType !== "BASE" &&
                                                shelf_info.ObjType !== "NOTCH" &&
                                                shelf_info.ObjType !== "DIVIDER" &&
                                                shelf_info.ObjType !== "TEXTBOX"
                                            ) {
                                                const items = Array.isArray(shelf_info.ItemInfo)
                                                    ? shelf_info.ItemInfo
                                                    : (shelf_info.ItemInfo ? [shelf_info.ItemInfo] : []);

                                                for (const item_info of items) {
                                                    if (item_info.Item !== "DIVIDER") {
                                                        item_exists = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    i++;
                                }

                                if ((item_exists) || p_af_version != '') {

                                    async function doSomething() {

                                        g_auto_fill_active = "Y";
                                        $s("P193_BLOCK_SELECTION", "P");
                                        g_undo_final_obj_arr = [];
                                        g_redo_final_obj_arr = [];
                                        g_prev_undo_action = "";
                                        
                                        if (p_af_version == ''){
                                           await clear_item("N", "N", p_pog_index);
                                        }
                                        
                                        g_undo_final_obj_arr = [];
                                        g_redo_final_obj_arr = [];
                                        g_auto_fill_reg_open = "Y";

                                        if (typeof pData.AFVersion != "undefined" || typeof g_autofill_detail["AFVersion"] != "undefined") {

                                            if (typeof g_autofill_detail["AFVersion"] == "undefined") {
                                                g_autofill_detail["AFPOGCode"] = pData.AFPOGCode;
                                                g_autofill_detail["AFPOGVersion"] = pData.AFPOGVersion;
                                                g_autofill_detail["AFVersion"] = pData.AFVersion;
                                                g_autofill_detail["BlkSelType"] = pData.AFType;
                                                g_autofill_detail["AutofillRule"] = pData.AFRule;
                                                g_autofill_detail["BlkInfo"] = JSON.parse(pData.AFJSON).BlkInfo;
                                            }

                                            $s("P193_BLOCK_SELECTION", g_autofill_detail.BlkSelType);
                                            $s("P193_AF_VERSION", g_autofill_detail.AFVersion);
                                            $s("P193_AUTOFILL_RULE", g_autofill_detail.AutofillRule);

                                            if ($v("P193_BLOCK_SELECTION") == "M") {

                                                g_mod_block_list = g_autofill_detail["BlkInfo"];

                                                async function doSomething() {

                                                    for (const blkDet of g_mod_block_list) {

                                                        g_autofillModInfo = blkDet.BlkModInfo;
                                                        g_autofillShelfInfo = blkDet.BlkShelfInfo;

                                                        var retdtl = await colorAutofillBlock(
                                                            blkDet["DragMouseStart"],
                                                            blkDet["DragMouseEnd"],
                                                            blkDet["mod_index"],
                                                            blkDet["BlkColor"],
                                                            blkDet["BlkName"],
                                                            "U",
                                                            blkDet,
                                                            g_pog_index
                                                        );

                                                        blkDet["BlockDim"] = retdtl;
                                                    }

                                                    g_autofill_detail["BlkInfo"] = g_mod_block_list;
                                                    await save_blk_dtl_coll("Y", "", g_mod_block_list);
                                                    g_mod_block_list = g_autofill_detail["BlkInfo"];
                                                     wpdCaptureShowChangesBlockSnapshot(g_mod_block_list, p_af_version !== '' ? "Y" : "N");  //ASA-1986 
                                                }

                                                await doSomething();
                                            }
                                        }
                                    }

                                    await doSomething();
                                }

                                resolve();

                            } catch (err) {
                                reject(err);
                            }
                        },

                        error: function (err) {
                            reject(err);
                        }
                    }
                );

            } else {
                resolve();
            }

        } else {
            alert(get_message("POGCR_AUTOFILL_VALID"));
            resolve();
        }

    });
}


async function clear_item(p_info_called, p_clearInfoType, p_pog_index) {
    logDebug("function : clear_item; info_called : " + p_info_called + "; p_clearInfoType : " + p_clearInfoType, "S");
    try {
        //identify if any change in POG
        g_pog_edited_ind = "Y";

        if (p_info_called == "N") {
            $(".top_icon").removeClass("active");
            $(".left_icon").removeClass("active");
            $(".clear_item").addClass("active");
        }
        var prev_action = p_info_called == "N" ? "CLEAR_ITEM" : "CLEAR_POG_INFO";
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        g_undo_obj_arr = [];
        g_undo_details = [];
        g_undo_supp_obj_arr = [];
        var undoObjectsInfo = [];
        var g_deletedItems = [];
        if (prev_action == "CLEAR_POG_INFO") {
            var pogInfo = {};
            pogInfo["OldPOGCode"] = g_pog_json[p_pog_index].POGCode;
            pogInfo["OldPOGName"] = g_pog_json[p_pog_index].Name;
            pogInfo["OldPOGDivision"] = g_pog_json[p_pog_index].Division;
            pogInfo["OldPOGDept"] = g_pog_json[p_pog_index].Dept;
            pogInfo["OldPOGSubDept"] = g_pog_json[p_pog_index].SubDept;
            pogInfo["OldEffStartDate"] = g_pog_json[p_pog_index].EffStartDate;
        }
        $.each(module_details, function (i, modules_info) {
            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                //capture the module is edit or not to create changed text box
                g_pog_json[p_pog_index].ModuleInfo[i].EditFlag = "Y";

                $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                    if (shelf_info.ItemInfo.length > 0) {
                        $.each(shelf_info.ItemInfo, function (s, itemInfo) {
                            g_deletedItems.push(itemInfo.ItemID);
                        });
                        var objectID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].SObjID;
                        undoObjectsInfo.moduleIndex = i;
                        undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[i].Module;
                        undoObjectsInfo.shelfIndex = j;
                        undoObjectsInfo.pogInfo = pogInfo;
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_start_canvas;
                        undoObjectsInfo.objectID = objectID;
                        undoObjectsInfo.g_deletedItems = g_deletedItems;
                        undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[i].MObjID;
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j])));
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                        undoObjectsInfo = [];
                    }
                });
            }
        });

        await delete_items("Y", p_pog_index);
        logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
        g_allUndoObjectsInfo = [];
        showFixelAvailableSpace("N", "N", p_pog_index);
        render(p_pog_index);
        //recreate the orientation view if any present
        await recreate_compare_views(g_compare_view, "N");

        apex.message.showPageSuccess(g_pog_refresh_msg);
        logDebug("function : clear_item", "E");
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}

function save_blk_dtl_coll(p_action_ind, p_blk_name, p_block_details_arr) {
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "SAVE_BLOCK_LIST", {
            x01: p_action_ind,
            x02: p_blk_name,
            p_clob_01: JSON.stringify(p_block_details_arr),
        }, {
            dataType: "text",
            success: async function (pData) {
                console.log("pData", pData);
                //apex.region("mod_block_details").refresh();
                if (p_action_ind == "Y" || p_action_ind == "U") {
                    g_autofill_edit = "N";
                }

                resolve("success");
            },
            loadingIndicatorPosition: "page",
        });
    });
}

function delete_items(p_delete_obj, p_pog_index) {
    logDebug("function : delete_items; delete_obj : " + p_delete_obj, "S");
    //console.log('delete_items called');
    return new Promise(function (resolve, reject) {
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        if (p_delete_obj == "N") {
            g_pog_json[p_pog_index].POGCode = "";
            g_pog_json[p_pog_index].Name = "";
        }
        $.each(module_details, function (i, modules_info) {
            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                    var div_obj = {};
                    var add_div_item = "N";
                    if (p_delete_obj == "Y") {
                        $.each(shelf_info.ItemInfo, function (k, item_info) {
                            if (item_info.Item !== "DIVIDER") {
                                g_deletedItems.push(item_info.ItemID);
                                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item_info.ObjID);
                                g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                                if (typeof g_pog_json[p_pog_index].DeleteItems !== "undefined") {
                                    g_pog_json[p_pog_index].DeleteItems.push(item_info); ///ASA-1108
                                }
                            } else {
                                div_obj = item_info;
                                add_div_item = "Y";
                            }
                        });
                    } else {
                        $.each(shelf_info.ItemInfo, function (k, item_info) {
                            if (item_info.Item == "DIVIDER") {
                                div_obj = item_info;
                                add_div_item = "Y";
                            }
                        });
                    }
                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo = [];
                    if (add_div_item == "Y") {
                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.push(div_obj);
                    }
                });
            }
        });
        // let dellog = deleted_items_log(g_deletedItems, "D", p_pog_index);
        resolve("SUCCESS");
        logDebug("function : delete_items", "E");
    });
}

function get_below_shelf(p_shelf_details, p_mod_index, p_btm_y, p_pog_index) {
    var final_btm = -1,
        l_shelf_cnt = 0;
    var min_distance_arr = [];
    var min_index_arr = [];
    var l_shelf_cnt = 0;
    for (const shelfs of p_shelf_details) {
        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
            if (p_btm_y <= shelfs.Y + shelfs.H / 2) {
                min_distance_arr.push(shelfs.Y + shelfs.H / 2 - p_btm_y);
                min_index_arr.push(l_shelf_cnt);
            }
        }
        l_shelf_cnt++;
    }

    if (min_distance_arr.length > 0) {
        var min_distance = Math.min.apply(Math, min_distance_arr);
        var index = min_distance_arr.findIndex(function (number) {
            return number == min_distance;
        });
        //ASA-1085 added g_pog_index
        final_btm = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[min_index_arr[index]].Y - g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[min_index_arr[index]].H / 2;
    } else {
        final_btm = p_btm_y;
    }
    return final_btm;
}

function get_above_shelf(p_shelf_details, p_mod_index, p_top_y, p_mod_top, p_pog_index) {
    var final_top = -1,
        l_shelf_cnt = 0;
    var min_distance_arr = [];
    var min_index_arr = [];
    var l_shelf_cnt = 0;
    for (const shelfs of p_shelf_details) {
        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
            if (p_top_y <= shelfs.Y - shelfs.H / 2) {
                min_distance_arr.push(shelfs.Y - shelfs.H / 2 - p_top_y);
                min_index_arr.push(l_shelf_cnt);
            }
        }
        l_shelf_cnt++;
    }

    if (min_distance_arr.length > 0) {
        var min_distance = Math.min.apply(Math, min_distance_arr);
        var index = min_distance_arr.findIndex(function (number) {
            return number == min_distance;
        });
        //ASA-1085 added g_pog_index
        final_top = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[min_index_arr[index]].Y - g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[min_index_arr[index]].H / 2;
    } else {
        final_top = p_mod_top;
    }
    return final_top;
}


async function doMouseUp(p_x, p_y, p_event, p_prevX, p_prevY, p_canvas, p_camera, p_pog_index) {
    logDebug("function : doMouseUp; x : " + p_x + "; y : " + p_y + "; prevX : " + p_prevX + "; prevY : " + p_prevY, "S");
    /*This is a mouse up function
    this will handle
    1. object dragging
    2. fixel duplicate
    3. g_multiselect dragging
    4. remove g_multiselect box after complition of g_multiselect and highlight all objects
    5. multi canvas drag
    6. autofill block dragging inside modules
    7. edit pallet functionality.
     */
    try {
        var locationX, locationY, locationZ;
        var width = p_canvas.width; // / window.devicePixelRatio;
        var height = p_canvas.height; // / window.devicePixelRatio;
        var a = (2 * p_x) / width - 1;
        var b = 1 - (2 * p_y) / height;
        g_raycaster.setFromCamera(new THREE.Vector2(a, b), p_camera);
        g_intersects = g_raycaster.intersectObject(g_targetForDragging);
        if (g_intersects.length == 0) {
            return;
        }
        locationX = g_intersects[0].point.x;
        locationY = g_intersects[0].point.y;
        locationZ = g_intersects[0].point.z;
        var coords = new THREE.Vector3(locationX, locationY, locationZ);
        g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);
        var l_final_x = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
        var l_final_y = Math.min(19, Math.max(-19, coords.y));
        var z = g_drag_z;
        if (g_shelf_edit_flag == "Y") {
            //ASA-1769 issue 1
            if (g_shelf_object_type == "SHELF") {
                //ASA-1784 issue 2 added textboxHit
                var shlfStr = wpdSetFixed(g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X - g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W / 2);
                var shlfEnd = wpdSetFixed(g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X + g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W / 2);
                var shlfTop = wpdSetFixed(g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y + g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2);
                var shlfBtm = wpdSetFixed(g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y - g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2);
                var shelfOnTxtbox = textboxHit(g_start_canvas, g_module_index, g_shelf_index, shlfStr, shlfEnd, shlfTop, shlfBtm, "N");

                var shelfInsidePeg = isShelfOnPegboard(g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X, g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y, g_module_index, g_start_canvas, g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index], g_pog_json);
            }
            if ((g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].InsidePegboard == "Y" || shelfInsidePeg || shelfOnTxtbox) && g_shelf_object_type == "SHELF") {
                //ASA-issue 2 added condition ShelfOnTxtbox
                //ASA-1149 -S
                if (shelfOnTxtbox) {
                    //ASA-1804
                    g_dragItem.position.z = 0.00115;
                } else {
                    g_dragItem.position.z = 0.016;
                }
            } else {
                if (g_shelf_object_type == "PEGBOARD" || (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                    //ASA-1125
                    g_dragItem.position.z = 0.00115;
                } else if (g_shelf_object_type == "ROD") {
                    g_dragItem.position.z = 0.005;
                } else if (g_shelf_object_type !== "TEXTBOX") {
                    if (g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Slope != 0 || g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Rotation != 0) {
                        //Regression 14 task_26905
                        g_dragItem.position.z = g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].D / 2 + 0.0005;
                    } else {
                        //Regression 14 task_26905
                        g_dragItem.position.z = 0.0005;
                    }
                    g_drag_z = 0.0005;
                }
            }
        }

        if (g_delete_details.length > 0 && g_duplicating == "Y") {
            g_multiItemCopy = "Y";
        } else {
            g_multiItemCopy = "N";
        }
        //ASA-1422
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            //finish multi g_selection border and highlight all selected objects
            if (g_selecting && g_multiselect == "Y" && g_shift_mutli_item_select == "N") {
                g_duplicating = "N";
                await get_multiselect_obj(p_pog_index);
                if (g_area_zoom_ind == "Y") {
                    select_zoom(p_camera, p_pog_index);
                    g_area_zoom_ind = "N";
                    g_multiselect = "N";
                    g_ctrl_select = "N";
                } else {
                    set_multi_blink(g_pog_json, p_pog_index);
                }
                g_selecting = false;
                g_selection.style.visibility = "hidden";
            } else if (g_shift_mutli_item_select == "Y") {
                multiSelectItemsWithShift(p_pog_index, g_multi_select_offset_perc);
            }
        }

        $("#maincanvas").css("cursor", "auto");
        //after multi select and then drag multiple objects.
        //ASA-1507 #3 Start
        // if (g_start_canvas == g_ComViewIndex && g_compare_view == "PREV_VERSION" && g_duplicating == "N") {
        //     g_drag_inprogress = "N";
        //     g_duplicating = "N";
        //     g_canvas_drag = "N";
        //     g_mselect_drag = "N";
        //     if (typeof g_dragItem !== "undefined") {
        //         if (g_canvas_drag == "N" && g_drag_inprogress == "N" && g_dragItem.StartCanvas == g_present_canvas) {
        //             g_dragItem = [];
        //             g_drag_items_arr = [];
        //         }
        //     }
        //     // when your select blocks of autofill rules on modules. user can drag and replace those blocks where ever they want. this below
        //     //logic will find the new place location and reset the blocks.
        // } else if (g_auto_fill_active == "Y") {
        //ASA-1507 #3 End

        if (g_auto_fill_active == "Y") {
            //ASA-1697 - Start
            [g_autofillModInfo, g_autofillShelfInfo] = getAutofillModShelf(g_DragMouseStart, g_DragMouseEnd, g_pog_json, g_pog_index);
            // if (g_delete_details.length > 0) {
            if (g_autofillShelfInfo.length >= 1) { //ASA-1965- issue-1  Additional fix
                // var multi_mod = false;
                // var mod_ind = -1;
                // for (const objects of g_delete_details) {
                //     if (objects.ObjType !== "TEXTBOX") {
                //         if (mod_ind !== objects.MIndex && mod_ind !== -1) {
                //             multi_mod = true;
                //             break;
                //         }
                //         mod_ind = objects.MIndex;
                //     }
                // }
                // if (multi_mod) {
                //     g_delete_details = [];
                //     alert(get_message("POGCR_SINGLE_MOD"));
                //     return;
                // } else {
                apex.region("block_filters").widget().interactiveGrid("getActions").set("edit", false);
                apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                apex.region("block_filters").refresh();
                apex.event.trigger("#P193_BLK_RULE", "apexrefresh");
                $s("P193_BLK_NAME", "");
                $s("P193_BLK_COLOR", randomColor());
                $s("P193_BLK_FILTER", "");
                $("#ADD_BLK").css("display", "inline");
                $("#SAVE_BLK").css("display", "inline");
                $("#UPDATE_BLK").css("display", "none");
                openInlineDialog("block_details", 40, 65);
                // }
                //ASA-1697 - End
                // } else if (typeof g_dragItem !== "undefined" && g_dragItem.length > 0 && g_drag_inprogress == "Y") {
                //ASA-1965 task-3 start
            } else if (typeof g_dragItem !== "undefined" && g_dragItem != null && g_drag_inprogress == "Y" && ((g_dragItem.length && g_dragItem.length > 0) || (typeof g_dragItem.uuid !== 'undefined') || typeof g_dragItem === 'object')) {
                //ASA-1085 added autofill dragging block
                // try { console.log('AUTO_FILL_DROP: entering branch', {g_dragItem, dragItemType: typeof g_dragItem, hasLength: g_dragItem && g_dragItem.length, hasUuid: g_dragItem && g_dragItem.uuid, g_drag_inprogress}); } catch (e) {} //ASA -1965-task-3
                var curr_module = getAutoFillCurrModule(l_final_x, l_final_y, g_module_index, p_pog_index);
                if (typeof curr_module === "undefined" || curr_module === -1) {  // ASA-1965 Additional fix
                    try {
                        var dragUuid = null;
                        if (g_dragItem) {
                            if (typeof g_dragItem.uuid !== 'undefined') dragUuid = g_dragItem.uuid;
                            else if (g_dragItem.length && g_dragItem.length > 0 && g_dragItem[0] && typeof g_dragItem[0].uuid !== 'undefined') dragUuid = g_dragItem[0].uuid;
                        }
                        if (dragUuid) {
                            var dragBlock = g_mod_block_list.filter(function (f) { return f.BlkName == dragUuid; });
                            if (dragBlock && dragBlock.length > 0 && dragBlock[0].BlockDim) {
                                var orgX = dragBlock[0].BlockDim.CalcX,
                                    orgY = dragBlock[0].BlockDim.CalcY,
                                    orgZ = dragBlock[0].BlockDim.CalcZ;
                                if (g_dragItem && g_dragItem.position && typeof g_dragItem.updateMatrix === 'function') {
                                    g_dragItem.position.set(orgX, orgY, orgZ);
                                    g_dragItem.updateMatrix();
                                    render(p_pog_index);
                                    alert(get_message('VALIDATE_SWAP_BLOCK_MSG'));
                                }
                            }
                        }
                    } catch (e) { }
                    g_dragItem = undefined;
                    return false;
                } //ASA_1965 Additional fix END
                if (typeof curr_module !== "undefined" && curr_module !== -1) {
                    var blockStart = {},
                        blockEnd = {},
                        blockFound = false;
                    // var dragBlock = g_mod_block_list.filter((f) => {
                    //     if (f.BlkName == g_dragItem.uuid) {
                    //         return true;
                    //     }
                    var dragUuid = null; //ASA-1965 task-3
                    if (g_dragItem) {
                        if (typeof g_dragItem.uuid !== 'undefined') dragUuid = g_dragItem.uuid;
                        else if (g_dragItem.length && g_dragItem.length > 0 && g_dragItem[0] && typeof g_dragItem[0].uuid !== 'undefined') dragUuid = g_dragItem[0].uuid;
                    }
                    // try { console.log('AUTO_FILL_DROP: resolved dragUuid', dragUuid); } catch (e) {}
                    if (!dragUuid) {
                        // nothing we can do - revert selection and exit
                        // try { console.log('AUTO_FILL_DROP: no drag uuid, aborting drop-handling'); } catch (e) {}
                        g_dragItem = undefined;
                        return false;
                    }
                    var dragBlock = g_mod_block_list.filter((f) => {
                        return f.BlkName == dragUuid;
                        //ASA-1965 task-3
                    });
                    blockStart.x = g_pog_json[p_pog_index].ModuleInfo[curr_module].X - g_pog_json[p_pog_index].ModuleInfo[curr_module].W / 2;
                    blockStart.y = l_final_y + dragBlock[0].BlockDim.BlkHeight / 2;
                    blockEnd.x = g_pog_json[p_pog_index].ModuleInfo[curr_module].X + g_pog_json[p_pog_index].ModuleInfo[curr_module].W / 2;
                    blockEnd.y = l_final_y - dragBlock[0].BlockDim.BlkHeight / 2;
                    var currShelf = getAutoFillCurrShelf(blockStart, blockEnd, curr_module, p_pog_index); //ASA-1085
                    if (typeof curr_module !== "undefined" && curr_module !== -1) {
                        for (colorObj of g_mod_block_list) {
                            if (colorObj.BlkName !== g_dragItem.uuid) {
                                var fnTop = colorObj.BlockDim.FinalTop;
                                var fnBtm = colorObj.BlockDim.FinalBtm;
                                var fnTopX = g_pog_json[p_pog_index].ModuleInfo[colorObj.mod_index[0]].X - g_pog_json[p_pog_index].ModuleInfo[colorObj.mod_index[0]].W / 2;
                                var fnBtmX = g_pog_json[p_pog_index].ModuleInfo[colorObj.mod_index[0]].X + g_pog_json[p_pog_index].ModuleInfo[colorObj.mod_index[0]].W / 2;
                                if (fnTop > l_final_y && fnBtm < l_final_y && fnTopX < l_final_x && fnBtmX > l_final_x) {
                                    await swapColoredBlocks(colorObj, dragBlock[0], p_pog_index);
                                    // await save_blk_dtl_coll("Y", "", g_mod_block_list); //ASA-1965 task-3
                                    g_dragItem = undefined;
                                    blockFound = true;
                                    // open_blk_details(dragBlock[0].BlkName, "N");
                                    render(p_pog_index); //ASA-1965 task-3
                                    return true;
                                }
                            }
                        }
                        if (!blockFound) {
                            if (currShelf === -1) {
                                dragBlock[0].BlockDim.ColorObj.remove(g_dragItem);
                                dragBlock[0].mod_index = [curr_module];
                                var rtl = await add_module_autofill_color(blockStart, blockEnd, [curr_module], dragBlock[0].BlkColor, dragBlock[0].BlkName, "Y", dragBlock[0], p_pog_index, "Y");
                                dragBlock[0].BlockDim = rtl;
                                await save_blk_dtl_coll("Y", "", g_mod_block_list); //ASA-1965 task-3
                                // open_blk_details(dragBlock[0].BlkName, "N");
                                render(p_pog_index); //ASA-1965 task-3
                            } else {
                                var orgX = dragBlock[0].BlockDim.CalcX,
                                    orgY = dragBlock[0].BlockDim.CalcY,
                                    orgZ = dragBlock[0].BlockDim.CalcZ;
                                g_dragItem.position.set(orgX, orgY, orgZ);
                                g_dragItem.updateMatrix();
                                render(p_pog_index);
                                alert(get_message('VALIDATE_SWAP_BLOCK_MSG'));
                            }
                        }
                    } else {
                        var orgX = dragBlock[0].BlockDim.CalcX,
                            orgY = dragBlock[0].BlockDim.CalcY,
                            orgZ = dragBlock[0].BlockDim.CalcZ;
                        g_dragItem.position.set(orgX, orgY, orgZ);
                        g_dragItem.updateMatrix();
                        render(p_pog_index);
                    }
                }
            }
            // } else if (g_shift_mutli_item_select !== "Y" && ((g_mselect_drag == "Y" && g_start_canvas == g_present_canvas && g_duplicating == "N" && g_drag_inprogress == "N" && g_compare_view !== "PREV_VERSION") || (g_canvas_drag == "Y" && g_mselect_drag == "Y" && g_start_canvas !== g_present_canvas && g_duplicating == "N" && g_compare_view !== "PREV_VERSION"))) {   // ASA-1548
        } else if (g_shift_mutli_item_select !== "Y" && ((g_mselect_drag == "Y" && g_start_canvas == g_present_canvas && g_duplicating == "N" && g_drag_inprogress == "N") || (g_canvas_drag == "Y" && g_mselect_drag == "Y" && g_start_canvas !== g_present_canvas && g_duplicating == "N" && g_compare_view !== "PREV_VERSION"))) {
            // ASA-1548
            //ASA-1422
            g_duplicating = "N";
            //dragging multiple objects from one canvas to another or same canvas will call this function.
            g_delete_details["is_dragging"] = "Y"; //ASA-1577
            g_combineItemModf = []; //ASA-1519 Issue 2
            var return_val = await multi_drag_setup(l_final_x, l_final_y, p_camera, p_pog_index);
            g_delete_details["is_dragging"] = "N"; //ASA-1577
            render(p_pog_index);
        } else if (g_compare_view == "EDIT_PALLET" && g_item_edit_flag == "Y" && g_drag_inprogress == "Y" && g_canvas_drag == "N" && g_present_canvas == g_ComViewIndex && g_ComViewIndex == g_start_canvas) {
            update_item_edit_pallet(l_final_x, l_final_y, g_module_index, g_shelf_index, g_item_index, g_item_edit_flag, g_ComBaseIndex, g_ComViewIndex);
        } else if (g_duplicating == "Y" && g_drag_inprogress == "Y" && g_present_canvas !== g_ComViewIndex) {
            //ASA-1107
            /*g_duplicating fixel shortcut is - please cursor on any fixel --> hold ctrl --> drag to any position a duplicate fixel
            will be created.*/
            duplicate_drag_obj(l_final_x, l_final_y, g_module_index, g_shelf_index, g_shelf_edit_flag, g_module_edit_flag, p_camera, g_start_canvas, g_present_canvas, $v("P193_POGCR_MODULE_COPY_WITH_ITEM"));
        } else if (g_canvas_drag == "Y" && g_drag_inprogress == "Y" && g_dragItem.StartCanvas !== g_present_canvas && g_duplicating == "N" && ((g_compare_pog_flag == "Y" && parseInt(g_present_canvas) == g_ComViewIndex && g_compare_view == "POG") || g_compare_pog_flag == "N" || (g_compare_pog_flag == "Y" && parseInt(g_present_canvas) !== g_ComViewIndex))) {
            /*handling objects dragged from another canvas*/
            multi_canvas_drag(l_final_x, l_final_y, g_module_index, g_shelf_index, g_shelf_edit_flag, g_module_edit_flag, p_pog_index);
        } else if (g_dragItem != undefined && g_drag_inprogress == "Y" && g_duplicating == "N") {
            //this block is written to handle the dragging of a shelf or item into compare view which should not accept dragging.
            //multi canvas drag function wil already handle that cases of allow dragging in compare view (PREV_VERSION, etc)
            //so we revert back the object to old position.
            if (g_start_canvas !== g_present_canvas && g_drag_inprogress == "Y" && g_compare_view != "PREV_VERSION") {
                //ASA-1507 #3
                // if (g_start_canvas !== g_present_canvas && g_drag_inprogress == "Y") {  //ASA-1507 #3
                var new_shelfdtl = g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                g_world = g_scene_objects[g_start_canvas].scene.children[2];
                if (g_shelf_edit_flag == "Y") {
                    var [return_obj, obj_id] = await create_drag_objects(g_module_index, g_shelf_index, g_item_index, new_shelfdtl, new_shelfdtl.ItemInfo, g_show_live_image, "SHELF", g_dragItem, g_start_canvas, g_present_canvas);
                    new_shelfdtl.SObjID = obj_id;
                    var l_temp_arr = [];
                    if (g_drag_items_arr.length > 0) {
                        for (const objects of g_drag_items_arr) {
                            var [return_obj, obj_id] = await create_drag_objects(g_module_index, g_shelf_index, objects.IIndex, objects.ShelfInfo, objects.ItemInfo, g_show_live_image, "ITEM", objects, g_start_canvas, g_present_canvas);
                            new_shelfdtl.ItemInfo[g_item_index].ObjID = obj_id;
                            l_temp_arr.push(return_obj);
                        }

                        if (l_temp_arr.length > 0) {
                            g_drag_items_arr = [];
                            g_drag_items_arr = l_temp_arr;
                        }
                        await set_inter_canvas_items(org_shelf_x, org_shelf_y, g_dragItem, l_temp_arr, new_shelfdtl.W, new_shelfdtl.H, new_shelfdtl.ObjType, new_shelfdtl.BsktSpreadProduct, new_shelfdtl.Rotation, new_shelfdtl.Slope, g_shelf_index, g_module_index, g_start_canvas);
                    }
                    render(g_start_canvas);
                } else if (g_item_edit_flag == "Y") {
                    var [return_obj, obj_id] = await create_drag_objects(g_module_index, g_shelf_index, g_item_index, g_dragItem.ShelfInfo, g_dragItem.ItemInfo, g_show_live_image, "ITEM", g_dragItem, g_start_canvas, g_present_canvas);
                    if (g_carpark_item_flag == "Y") {
                        var l_old_itemX = g_pog_json[g_start_canvas].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].X;
                        var l_old_itemY = g_pog_json[g_start_canvas].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].Y;
                        var old_itemZ = g_pog_json[g_start_canvas].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].Z;
                    } else {
                        var l_old_itemX = new_shelfdtl.ItemInfo[g_item_index].X;
                        var l_old_itemY = new_shelfdtl.ItemInfo[g_item_index].Y;
                        var old_itemZ = new_shelfdtl.ItemInfo[g_item_index].Z;
                    }
                    if (g_carpark_item_flag == "Y") {
                        g_pog_json[g_start_canvas].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].ObjID = obj_id;
                    } else {
                        new_shelfdtl.ItemInfo[g_item_index].ObjID = obj_id;
                    }
                    return_obj.position.x = l_old_itemX;
                    return_obj.position.y = l_old_itemY;
                    return_obj.position.z = g_drag_z;
                }
                g_pog_index = g_start_canvas;
                animate_pog(p_pog_index);
                g_canvas_drag = "N";
                g_drag_inprogress = "N";
                g_intersected = [];
            } else if (g_duplicating == "Y") {
                g_cut_copy_arr = [];
                g_cut_support_obj_arr = [];
                g_cut_loc_arr = [];
                loc_details = {};
                g_undo_details = [];
                g_duplicating = "N";
                g_drag_inprogress = "N";
            } else {
                //single object drag process
                g_mousedown_locx = "";
                g_final_x = g_dragItem.position.x;
                g_finalY = g_dragItem.position.y;
                l_final_y = g_dragItem.position.y;
                g_final_z = g_dragItem.position.z;
                var min_module = 100;
                var mod_width_arr = [];
                var total_items = 0,
                    shelf_width = 0,
                    ModuleInfo = {},
                    shelf_height = 0,
                    org_shelf_x = 0,
                    org_shelf_y = 0,
                    org_shelf_z = 0,
                    validate_passed = "N",
                    old_ItemInfo = [];
                g_allUndoObjectsInfo = [];

                //find which module object is now.
                if (g_module_index !== -1 && g_module_index !== "" && g_shelf_index !== -1 && g_shelf_index !== "") {
                    var module = g_pog_json[p_pog_index].ModuleInfo[g_module_index];
                    var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                }
                var shelfs = shelfdtl;
                //wer find the curr module where the object is dropped.
                var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(g_final_x, l_final_y, g_shelf_edit_flag, g_module_index, g_shelf_index, shelfs, p_pog_index);
                var itemInsidePeg = "";
                if (g_item_edit_flag == "Y") {
                    //finding nearest shelf below the finalx in curr_module
                    var [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found, shelfInsidePeg] = get_div_shelf_index(g_final_x, l_final_y, curr_module, item_inside_world, p_pog_index, g_dragItem, true); //ASA-1592
                    //ASA-1769
                    if (shelfInsidePeg !== "Y") {
                        var [pegboard_valid, item_inside_world_peg, curr_module_peg, div_object_type_peg, shelfY_peg, shelfHeight_peg, div_shelf_index_peg, shelf_found_peg, itemInsidePeg] = itemInPegboardOverhang(g_final_x, l_final_y, p_pog_index, g_dragItem);
                        if (pegboard_valid) {
                            [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found] = [item_inside_world_peg, curr_module_peg, div_object_type_peg, shelfY_peg, shelfHeight_peg, div_shelf_index_peg, shelf_found_peg];
                        }
                    }
                }
                if (((nvl(g_pog_json) !== 0 && g_item_edit_flag == "Y") || g_shelf_edit_flag == "Y") && typeof div_shelf_index !== "undefined" && div_shelf_index !== -1) {
                    if (!checkDuplicate("", curr_module, div_shelf_index, "BACKUP")) {
                        backupPog("S", div_shelf_index, curr_module, p_pog_index);
                    }
                }
                //------------------------- START OF VALIDATE THE EDITED SHELF PLACE

                if (g_shelf_edit_flag == "Y") {
                    //ASA-1085 corrected this rollback code.
                    org_shelf_x = shelfdtl.X;
                    org_shelf_y = shelfdtl.Y;
                    org_shelf_z = shelfdtl.Z;
                    var undoObjectsInfo = [];
                    undoObjectsInfo.moduleIndex = g_module_index;
                    undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
                    undoObjectsInfo.shelfIndex = g_shelf_index;
                    undoObjectsInfo.objectID = shelfdtl.SObjID;
                    undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[curr_module].MObjID;
                    undoObjectsInfo.actionType = "SHELF_DRAG";
                    undoObjectsInfo.startCanvas = g_start_canvas;
                    undoObjectsInfo.g_present_canvas = g_present_canvas;
                    var shelfInfo = shelfdtl;
                    undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfdtl)));
                    g_allUndoObjectsInfo.push(undoObjectsInfo);
                    shelfdtl.Y = l_final_y;
                    shelfdtl.X = g_final_x;
                    old_iteminfo = JSON.parse(JSON.stringify(shelfdtl.ItemInfo));
                    var cnfrm = "Y";
                    var notchUpdated = false;
                    //ASA-1272
                    var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Shelf);
                    if (currCombinationIndex !== -1) {
                        comb_shelf_ind = "Y";
                    }
                    // ASA-1361 20240501
                    // if ($v("P193_POGCR_COMBINATION_SHELF") == "Y") {
                    cnfrm = await getconfirm_shelfmove(p_pog_index);
                    // }
                    if (g_pog_json[p_pog_index].ModuleInfo[curr_module].H > 0.1 && g_shelf_object_type !== "ROD" && g_shelf_object_type !== "TEXTBOX" && g_auto_position_ind == "Y") {
                        /*auto position button is on find the module behind the fixel drop position and find the corner of
                        module and place fixel there*/
                        //ASA-1628, added notchUpdated as return
                        notchUpdated = auto_position_shelf(g_module_index, curr_module, g_shelf_index, shelf_rotate_hit, g_final_x, l_final_y, "N", p_pog_index);
                    } else {
                        await set_all_items(g_module_index, g_shelf_index, g_final_x, l_final_y, g_shelf_edit_flag, "E", "Y", p_pog_index, p_pog_index);
                    }

                    if (g_module_index !== -1 && g_module_index !== "" && g_shelf_index !== -1 && g_shelf_index !== "") {
                        var items_arr = shelfdtl.ItemInfo;
                        var allow_crush = shelfdtl.AllowAutoCrush;
                        if (g_shelf_edit_flag == "Y" && cnfrm == "Y") {
                            if (g_max_facing_enabled == "Y") {
                                reset_auto_crush(g_module_index, g_shelf_index, g_item_index, p_pog_index, g_module_index, g_shelf_index, p_pog_index); //ASA-1343 issue 1
                            }
                            await set_auto_facings(g_module_index, g_shelf_index, -1, items_arr, "B", "S", "D", p_pog_index);
                        }
                    }

                    if (g_shelf_edit_flag == "Y" && g_shelf_object_type !== "ROD" && g_shelf_object_type !== "TEXTBOX" && shelf_rotate_hit == "N" && cnfrm == "Y") {
                        var mod_ind = curr_module == g_module_index ? g_module_index : curr_module;
                        //validate shelf with or without item if hit other objects if dragged in same module
                        var validate_passed = await validate_shelf_min_distance(mod_ind, g_shelf_index, shelfdtl.Y, items_arr, allow_crush, g_module_index, shelfdtl.X, "Y", shelfs, p_pog_index);
                    } else if (shelf_rotate_hit == "Y") {
                        validate_passed = "N";
                    } else {
                        validate_passed = "Y";
                    }
                    if (cnfrm == "N") {
                        validate_passed = "N";
                    }

                    if ((validate_passed == "Y" || validate_passed == "R") && g_shelf_edit_flag == "Y" && cnfrm == "Y") {
                        //ASA-1242
                        //identify if any change in POG
                        g_pog_edited_ind = "Y";
                        //set json to new location in array.
                        //ASA-1272
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Combine = "N";
                        //ASA-1507 Issue 3
                        if (g_shelf_object_type == "SHELF" || g_shelf_object_type == "HANGINGBAR") {
                            await generateCombinedShelfs(p_pog_index, g_module_index, g_shelf_index, $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters,ASA-1353
                        }
                        var [mod_ind, shelf_ind] = await set_shelf_after_drag((comb_shelf_ind = "Y" ? "R" : validate_passed), g_shelf_edit_flag, g_module_index, curr_module, g_shelf_index, g_final_x, shelfdtl.Y, "Y", "Y", g_module_index, g_shelf_index, p_pog_index, p_pog_index, currCombinationIndex); //ASA-1628 replace l_final_y with shelfdtl.Y

                        if (g_itemSubLabelInd == "Y") {
                            //ASA-1577
                            showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
                        }

                        var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind]; //ASA-1149-S
                        var i = 0;
                        //ASA-1149 -E
                        if (!notchUpdated && shelfdtl.X > g_pog_json[p_pog_index].ModuleInfo[mod_ind].X - g_pog_json[p_pog_index].ModuleInfo[mod_ind].W / 2 && shelfdtl.X < g_pog_json[p_pog_index].ModuleInfo[mod_ind].X + g_pog_json[p_pog_index].ModuleInfo[mod_ind].W / 2 && shelfdtl.Y + shelfdtl.H / 2 > g_pog_json[p_pog_index].ModuleInfo[mod_ind].Y - g_pog_json[p_pog_index].ModuleInfo[mod_ind].H / 2 && shelfdtl.Y < g_pog_json[p_pog_index].ModuleInfo[mod_ind].Y + g_pog_json[p_pog_index].ModuleInfo[mod_ind].H / 2 && g_pog_json[p_pog_index].ModuleInfo[mod_ind].NotchSpacing > 0 && g_shelf_object_type !== "CHEST" && g_shelf_object_type !== "ROD" && g_shelf_object_type !== "TEXTBOX") {
                            //ASA-1272
                            //ASA-1125
                            var [newy, newx] = find_top_notch(mod_ind, shelf_ind, shelfdtl.Y, g_final_x, g_drag_shelf_notch, p_pog_index); //ASA-S-1122 //ASA-1628 replace l_final_y with shelfdtl.Y
                            if (newy > -1 && newx > -1) {
                                //ASA-1122
                                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].SObjID);
                                g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].X = newx;
                                g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Y = newy;
                                //ASA-1678
                                selectedObject.X = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].X * 100 - (g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].W * 100) / 2);
                                selectedObject.Y = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Y * 100 - (g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].H * 100) / 2);

                                await set_all_items(mod_ind, shelf_ind, newx, newy, g_shelf_edit_flag, "N", "Y", p_pog_index, p_pog_index);
                                //20241125 - Regression Issue 4
                                selectedObject.position.set(newx, newy);
                            }
                        }

                        g_undo_details = [];
                        g_undo_obj_arr = [];
                        g_undo_supp_obj_arr = [];
                        //store details for undo process.
                        g_redo_final_obj_arr = []; //yrc empty redo log on new drag of shelf
                        g_redo_all_obj_arr = [];
                        logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y");
                        g_allUndoObjectsInfo = [];

                        if (g_show_max_merch == "Y") {
                            await add_merch("N", p_pog_index);
                            await add_merch("Y", p_pog_index);
                        }
                        if (g_show_notch_label == "Y") {
                            await update_single_notch_label("Y", mod_ind, shelf_ind, $v("P193_NOTCH_HEAD"), "", p_pog_index, "N");
                        }
                        if (g_fixel_label == "Y") {
                            await show_fixel_labels("Y", p_pog_index);
                        }

                        await recreate_compare_views(g_compare_view, "N");

                        if (items_arr.length > 0) {
                            //capture the module is edit or not to create changed text box
                            g_pog_json[p_pog_index].ModuleInfo[mod_ind].EditFlag = "Y";
                        }
                        if (shelfInfo.ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
                            //Bug-26122 - splitting the chest
                            shelfInfo.ChestEdit = "Y";
                        }

                        if (shelfInfo.InsidePegboard == "Y") {
                            //ASA-1149 -S
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].SObjID);
                            selectedObject.position.z = 0.016;
                            for (const items of shelfInfo.ItemInfo) {
                                var itemObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                itemObject.position.z = 0.016;
                                i++;
                            }
                        } //ASA-1149 -E
                    } else if (validate_passed == "N" && g_shelf_edit_flag == "Y") {
                        //if rotated shelf hit on any module
                        shelfdtl.X = org_shelf_x;
                        shelfdtl.Y = org_shelf_y;
                        shelfdtl.ItemInfo = old_iteminfo;

                        if (shelf_rotate_hit == "Y") {
                            alert(get_message("LOST_FROM_SHELF_ROTATION_ERR", shelfdtl.Shelf, g_pog_json[p_pog_index].POGCode + g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module));
                        }
                        if (g_max_facing_enabled == "Y") {
                            await set_all_items(g_module_index, g_shelf_index, org_shelf_x, org_shelf_y, g_shelf_edit_flag, "E", "Y", p_pog_index, p_pog_index);
                            var return_val = await recreate_all_items(g_module_index, g_shelf_index, g_shelf_object_type, "Y", g_final_x, -1, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), "Y", itemInsidePeg); //ASA-1350 issue 6 added parameters, ASA-1769 p_itemInsidePeg
                        } else if (shelfdtl.ItemInfo.length > 0 && shelf_rotate_hit == "N") {
                            await set_all_items(g_module_index, g_shelf_index, org_shelf_x, org_shelf_y, g_shelf_edit_flag, "E", "Y", p_pog_index, p_pog_index);
                        }

                        g_dragItem.position.set(org_shelf_x, org_shelf_y, g_drag_z);
                        if (g_shelf_edit_flag == "Y") {
                            if (g_shelf_object_type == "PEGBOARD" || (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                                g_dragItem.position.z = 0.00015;
                            } else if (g_shelf_object_type == "ROD") {
                                g_dragItem.position.z = 0.005;
                            } else if (g_shelf_object_type == "TEXTBOX") {
                                g_dragItem.position.z = 0.0005;
                                //ASA-1544 - Start
                                // } else if (g_shelf_object_type == "SHELF") {
                            } else {
                                g_dragItem.position.z = nvl(g_dragItem.position.z) == 0 ? 0.00015 : g_dragItem.position.z;
                                // g_dragItem.position.z = 0.00015;
                            }
                            //ASA-1544 - End
                        }
                    }
                }
                //----------------------  END SETTING SHELF X AND Y

                //------------------------- ITEM DRAG FUNCTIONALITIES   -------------------------------------------------------------------------------------------------------------
                if (g_item_edit_flag == "Y" && item_inside_world == "Y" && div_shelf_index !== -1) {
                    if (g_carpark_item_flag == "Y") {
                        l_old_itemX = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].X;
                        l_old_itemY = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].Y;
                        old_itemZ = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].Z;
                        var item_fixed = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].Fixed;
                        var items_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo;
                        var old_ItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index]));
                        var spread_product = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].SpreadItem;
                        var ItemInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index];
                    } else {
                        l_old_itemX = shelfdtl.ItemInfo[g_item_index].X;
                        l_old_itemY = shelfdtl.ItemInfo[g_item_index].Y;
                        old_itemZ = shelfdtl.ItemInfo[g_item_index].Z;
                        var item_fixed = shelfdtl.ItemInfo[g_item_index].Fixed;
                        var items_arr = shelfdtl.ItemInfo;
                        var old_ItemInfo = JSON.parse(JSON.stringify(shelfdtl.ItemInfo[g_item_index]));
                        var spread_product = shelfdtl.SpreadItem;
                        var ItemInfo = shelfdtl.ItemInfo[g_item_index];
                        g_temp_cut_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo)));
                        g_isBookend = shelfdtl.ItemInfo[g_item_index].Fixed;
                        g_movedObjID = shelfdtl.ItemInfo[g_item_index].ObjID;
                    }
                    var upd_item_index;
                    (item_width_arr = []), (item_height_arr = []), (item_depth_arr = []), (item_index_arr = []), (shelfInfoForUndo = []), (isTopItem = "N");
                    (new_module_index = -1), (new_shelf_index = -1), new_object_type, (g_edit_ind = "N"), (old_div_shelf = ""), (drag_direction = l_old_itemX < g_final_x ? "F" : "B");
                    var undoObjectsInfo = [];
                    var currCombinationIndex = "";
                    shelfInfoForUndo.push(movedShelfDetail);
                    //below is the logic for setting undo details for item which is dragged.
                    if (g_shelf_index !== div_shelf_index || g_module_index !== curr_module) {
                        undoObjectsInfo = [];
                        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].Shelf);
                        if (currCombinationIndex !== -1) {
                            undoObjectsInfo.CombineInd = "Y";
                            undoObjectsInfo.CombShelfIndex = currShelfCombIndx;
                            currCombination = g_combinedShelfs[currCombinationIndex];
                            if (currCombination.length > 1) {
                                for (obj of currCombination) {
                                    undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex])));
                                }
                            }
                        } else {
                            undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index])));
                        }

                        undoObjectsInfo.moduleIndex = curr_module;
                        undoObjectsInfo.shelfIndex = div_shelf_index;
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_start_canvas;
                        undoObjectsInfo.objectID = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].SObjID;
                        undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[curr_module].Module;
                        undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[curr_module].MObjID;
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                    }
                    //undo details for carpark items.
                    if (g_carpark_item_flag == "Y") {
                        var itemLength = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo.length;
                        if (itemLength > 1) {
                            undoObjectsInfo = [];
                            undoObjectsInfo.moduleIndex = g_module_index;
                            undoObjectsInfo.shelfIndex = g_shelf_index;
                            undoObjectsInfo.IsCarpark = "Y";
                            undoObjectsInfo.actionType = "ITEM_DELETE";
                            undoObjectsInfo.startCanvas = g_start_canvas;
                            undoObjectsInfo.objectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].SObjID;
                            undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
                            undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
                            undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0])));
                            g_allUndoObjectsInfo.push(undoObjectsInfo);
                        } else {
                            var newArray = [];
                            for (var i = 0, len = g_undo_final_obj_arr.length; i < len; i++) {
                                if (typeof g_undo_final_obj_arr[i].IsCarpark == "undefined" || g_undo_final_obj_arr[i][0][0].IsCarpark == "N") {
                                    newArray.push(g_undo_final_obj_arr[i]);
                                }
                            }
                            g_undo_final_obj_arr = newArray;
                            var newArray = [];
                            for (var i = 0, len = g_redo_final_obj_arr.length; i < len; i++) {
                                if (typeof g_redo_final_obj_arr[i].IsCarpark == "undefined" || g_undo_final_obj_arr[i][0][0].IsCarpark == "N") {
                                    newArray.push(g_redo_final_obj_arr[i]);
                                }
                            }
                            g_redo_final_obj_arr = newArray;
                        }
                    }
                    if (g_carpark_item_flag == "N") {
                        undoObjectsInfo = [];
                        var [oldCombinationIndex, oldShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
                        if (oldCombinationIndex !== -1) {
                            if (oldCombinationIndex !== currCombinationIndex || (g_shelf_index == div_shelf_index && g_module_index == curr_module)) {
                                undoObjectsInfo.CombineInd = "Y";
                                undoObjectsInfo.CombShelfIndex = oldShelfCombIndx;
                                currCombination = g_combinedShelfs[oldCombinationIndex];
                                if (currCombination.length > 1) {
                                    for (obj of currCombination) {
                                        undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex])));
                                    }
                                }
                                undoObjectsInfo.moduleIndex = g_module_index;
                                undoObjectsInfo.shelfIndex = g_shelf_index;
                                undoObjectsInfo.actionType = "ITEM_DELETE";
                                undoObjectsInfo.startCanvas = g_start_canvas;
                                undoObjectsInfo.objectID = shelfdtl.SObjID;
                                undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
                                undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;

                                g_allUndoObjectsInfo.push(undoObjectsInfo);
                            }
                        } else {
                            undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfdtl)));
                            undoObjectsInfo.moduleIndex = g_module_index;
                            undoObjectsInfo.shelfIndex = g_shelf_index;
                            undoObjectsInfo.actionType = "ITEM_DELETE";
                            undoObjectsInfo.startCanvas = g_start_canvas;
                            undoObjectsInfo.objectID = shelfdtl.SObjID;
                            undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
                            undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;

                            g_allUndoObjectsInfo.push(undoObjectsInfo);
                        }
                    }
                    //finding out the direction in which the dragging happened. to find out next to which item this dragged item to be placed.
                    if (curr_module == g_module_index && g_shelf_index == div_shelf_index) {
                        if (g_item_index > 0 && g_item_index < shelfdtl.ItemInfo.length - 1) {
                            if (g_final_x > shelfdtl.ItemInfo[g_item_index - 1].X && g_final_x < shelfdtl.ItemInfo[g_item_index + 1].X) {
                                drag_direction = "S";
                            }
                        } else if (g_item_index == 0 && shelfdtl.ItemInfo.length > 1) {
                            if (g_final_x < shelfdtl.ItemInfo[g_item_index + 1].X) {
                                drag_direction = "S";
                            }
                        } else if (g_item_index == shelfdtl.ItemInfo.length - 1 && shelfdtl.ItemInfo.length > 1) {
                            if (g_final_x > shelfdtl.ItemInfo[g_item_index - 1].X) {
                                drag_direction = "S";
                            }
                        }
                    }
                    old_item_ind = g_item_index;

                    if (g_carpark_item_flag == "N") {
                        if (shelfdtl.ItemInfo[g_item_index].CType == "BASKET") {
                            shelfdtl.ItemInfo[g_item_index].H = shelfdtl.ItemInfo[g_item_index].OH;
                            shelfdtl.ItemInfo[g_item_index].W = shelfdtl.ItemInfo[g_item_index].OW;
                            shelfdtl.ItemInfo[g_item_index].D = shelfdtl.ItemInfo[g_item_index].OD;
                            shelfdtl.ItemInfo[g_item_index].BaseD = 1;
                            shelfdtl.ItemInfo[g_item_index].BHoriz = 1;
                            shelfdtl.ItemInfo[g_item_index].BVert = 1;
                        }
                    }

                    //setting all items to 'E' which is further used to get X axis compared to item coming from product list.
                    $.each(items_arr, function (i, items) {
                        if (g_carpark_item_flag == "Y") {
                            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[i].Exists = "E";
                        } else {
                            shelfdtl.ItemInfo[i].Exists = "E";
                        }
                    });

                    //validate if divider not suitable return back to original position
                    if (ItemInfo["Item"] == "DIVIDER" && (div_object_type == "PEGBOARD" || div_object_type == "TEXTBOX" || div_object_type == "HANGINGBAR" || div_object_type == "ROD" || (div_object_type == "CHEST" && g_chest_as_pegboard == "Y"))) {
                        //ASA-1125
                        g_dragItem.position.set(l_old_itemX, l_old_itemY, g_drag_z);
                        alert(get_message("LOST_FROM_SHELF_ROTATION_ERR", ItemInfo["ItemID"], g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].Shelf));
                    } else {
                        //if the dragged item is a top item for another item. then reset the tags for bottom and top item identifier and assign new tags to identify below and top item.
                        if (g_carpark_item_flag == "N" && ((typeof ItemInfo["TopObjID"] !== "undefined" && ItemInfo["TopObjID"] !== "") || (typeof ItemInfo["BottomObjID"] !== "undefined" && ItemInfo["BottomObjID"] !== ""))) {
                            var returnval = reset_bottom_item(g_module_index, g_shelf_index, g_item_index, g_module_index, g_shelf_index, g_final_x, p_pog_index);
                        }
                        if (spread_product == "F" || (ItemInfo["CrushHoriz"] > 0 && ItemInfo["MHorizCrushed"] == "N")) {
                            ItemInfo["W"] = ItemInfo["RW"];
                            shelfdtl.ItemInfo[g_item_index].W = ItemInfo["RW"];
                        }
                        //await reset_auto_crush(g_module_index, g_shelf_index, g_item_index, p_pog_index, g_module_index, g_shelf_index); //ASA-1343 issue 1 //Task_27812

                        //set location of items finding the place its been dropped.
                        var [upd_item_index, new_shelf_index, new_module_index, new_object_type, g_edit_ind, ItemInfo, div_index, bottom_item_flag, bottom_item_ind] = await update_item_loc(curr_module, g_module_index, g_shelf_index, div_shelf_index, div_object_type, g_item_index, g_final_x, shelf_found, ItemInfo, shelfY, shelfHeight, l_final_y, g_pog_json, drag_direction, p_pog_index, p_pog_index); //Task_27812 issue 13
                        //get old obj for undo process
                        if (ItemInfo["Item"] == "DIVIDER") {
                            //ASA-1085
                            old_div_shelf = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[div_index]));
                        }

                        //set indicator that its not new item from product list.
                        if ((g_pegbrd_auto_placing == "Y" && new_object_type == "PEGBOARD") || (new_object_type !== "PEGBOARD" && new_object_type !== "CHEST") || (new_object_type == "CHEST" && g_chest_as_pegboard == "N")) {
                            ItemInfo["Edited"] = "Y";
                        } else {
                            ItemInfo["Edited"] = "N";
                        }

                        ItemInfo["SameShelf"] = "N";

                        //getting initial x and y
                        var shelfs = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index];

                        //Regression Issue2 20260119 Start
                        if (shelfs.AllowAutoCrush == "N" && shelfs.SObjID !== shelfdtl.SObjID) {
                            ItemInfo["CrushVert"] = 0;
                            ItemInfo["CrushD"] = 0;
                            ItemInfo["CrushHoriz"] = 0;
                        }
                        //Regression Issue2 20260119 End

                        if (g_carpark_item_flag == "Y") {
                            g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].Y = l_final_y;
                        } else {
                            shelfdtl.ItemInfo[g_item_index].Y = l_final_y;
                            if (new_object_type == "PALLET" && g_shelf_object_type !== "PALLET") {
                                ItemInfo["Z"] = 0 + ItemInfo["D"] / 2;
                                shelfdtl.ItemInfo[g_item_index].Z = 0 + ItemInfo["D"] / 2;
                            }
                        }
                        if (new_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                            //ASA-1125
                            yaxis = l_final_y;
                        } else if (new_object_type !== "PEGBOARD") {
                            var [xaxis, yaxis] = get_item_xy(shelfs, ItemInfo, ItemInfo.W, ItemInfo.H, p_pog_index);
                        } else {
                            yaxis = l_final_y;
                        }

                        var bottom_item_obj = -1;
                        if (bottom_item_flag == "Y") {
                            bottom_item_obj = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].ObjID;
                            shelfdtl.ItemInfo[g_item_index].BottomObjID = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].ObjID;
                            // for (var item of g_allUndoObjectsInfo[0][0].ItemInfo) {//use for
                            //     if (item.ObjID == shelfdtl.ItemInfo[g_item_index].ObjID) {
                            //         item.BottomObjID = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].ObjID;
                            //     }
                            // }
                            shelfdtl.ItemInfo[g_item_index].X = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].X;
                            g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].TopObjID = shelfdtl.ItemInfo[g_item_index].ObjID;
                            if (new_object_type == "PALLET") {
                                //ASA-1085
                                shelfdtl.ItemInfo[g_item_index].Z = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].Z;
                                ItemInfo["Z"] = shelfdtl.ItemInfo[g_item_index].Z;
                            }

                            upd_item_index = spread_product == "R" ? bottom_item_ind - 1 : bottom_item_ind + 1;
                            ItemInfo["BottomObjID"] = bottom_item_obj;
                            ItemInfo["TopItem"] = "Y";
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[bottom_item_ind].BelowItem = "Y";
                            yaxis = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[bottom_item_ind].Y + g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[bottom_item_ind].H / 2 + ItemInfo["H"] / 2;
                        } else {
                            ItemInfo["TopItem"] = "N";
                            ItemInfo["X"] = g_final_x;
                        }
                        if (ItemInfo["Item"] !== "DIVIDER") {
                            //ASA-1085
                            ItemInfo["Y"] = yaxis;
                        } else if (new_object_type == "BASKET" && ItemInfo["Item"] == "DIVIDER") {
                            ItemInfo["Y"] = l_final_y;
                        } else {
                            ItemInfo["Y"] = yaxis;
                        }
                        ItemInfo["YDistance"] = l_final_y - (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].H / 2);
                        ItemInfo["DropY"] = yaxis;

                        if (ItemInfo["Item"] == "DIVIDER" && new_object_type !== "CHEST" && new_object_type !== "PALLET") {
                            //ASA-1085
                            ItemInfo["Rotation"] = 0;
                        }

                        ItemInfo["SIndex"] = new_shelf_index;
                        ItemInfo["Dragged"] = "Y";
                        if (g_carpark_item_flag == "N") {
                            if ((new_object_type == "PEGBOARD" && shelfdtl.ObjType == "PEGBOARD") || (new_object_type == "CHEST" && shelfdtl.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                //ASA-1125
                                //ASA-1085
                                ItemInfo["SameShelf"] = "Y";
                            }
                        }

                        //delete item from previous location
                        if (g_carpark_item_flag == "Y") {
                            if (g_item_index == 0) {
                                g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo.splice(g_item_index, g_item_index + 1);
                            } else {
                                g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo.splice(g_item_index, 1);
                            }
                        } else {
                            if (g_item_index == 0) {
                                shelfdtl.ItemInfo.splice(g_item_index, g_item_index + 1);
                            } else {
                                shelfdtl.ItemInfo.splice(g_item_index, 1);
                            }
                        }

                        if (bottom_item_flag == "Y") {
                            var i = 0;
                            for (const fitems of g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo) {
                                if (fitems.ObjID == bottom_item_obj) {
                                    upd_item_index = spread_product == "R" ? i - 1 : i + 1;
                                    break;
                                }
                                i++;
                            }
                        } else {
                            await crushItem(p_pog_index, g_module_index, g_shelf_index, -1, "W", "Y", -1, -1); //Regression 4 TASK_29373 ASA-1540
                        }
                        ItemInfo["DfacingUpd"] = "Y"; //ASA-1150
                        //setting item to new location
                        var l_edited_item_index = await set_item_after_drag(new_object_type, spread_product, new_module_index, new_shelf_index, upd_item_index, ItemInfo, p_pog_index);

                        //// start Task_27812 issue 6 20240528
                        /*if ((new_object_type == "SHELF" || new_object_type == "HANGINGBAR") && g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].Combine !== "N") {
                            var l_detail_arr = []; //ASA 1329
                            var l_detail_obj = {}; //ASA 1329
                            l_detail_obj["MIndex"] = new_module_index; //ASA 1329
                            l_detail_obj["SIndex"] = new_shelf_index; //ASA 1329
                            l_detail_obj["IIndex"] = l_edited_item_index; //ASA 1329
                            l_detail_obj["Iobjid"] = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].ObjID; //ASA 1329
                            l_detail_arr.push(l_detail_obj); //ASA 1329
                            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].Shelf);
                            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, g_final_x, 'Y', 'N', -1, l_edited_item_index, l_detail_arr); //ASA-1329
                                new_module_index = l_detail_arr[0].MIndex; //ASA 1329
                                new_shelf_index = l_detail_arr[0].SIndex; //ASA 1329
                                l_edited_item_index = l_detail_arr[0].IIndex; //ASA 1329
                            }
                        }
                        if ((shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR") && g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Combine !== "N") {//Task_27812 issue 13 20240528
                            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Shelf);
                            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, g_final_x, 'Y', 'N', -1, g_item_index, []);
                                await reset_auto_crush(g_module_index, g_shelf_index, g_item_index, p_pog_index, g_module_index, g_shelf_index);
                            }
                        }*/
                        var i = 0; //Task_27812 issue 6 20240528 Regression Issue 11 05082024
                        for (const fitems of g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo) {
                            if (fitems.ObjID == ItemInfo["ObjID"]) {
                                l_edited_item_index = i;
                                break;
                            }
                            i++;
                        }

                        var [new_module_index, new_shelf_index, l_edited_item_index] = await set_combine_items_after_drag(new_module_index, new_shelf_index, p_pog_index, l_edited_item_index, g_module_index, g_shelf_index, g_item_index, p_pog_index, g_final_x, "N"); // End Task_27812 issue 6 20240528

                        if (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ObjType == "BASKET" && g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Item == "DIVIDER") {
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Y = g_finalY;
                        }

                        var items = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];

                        //ASA-1476 ISSUE 4
                        // if (bottom_item_flag == "N" && g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Item !== "DIVIDER") {
                        //     //ASA-1085
                        //     var res = await set_auto_facings(new_module_index, new_shelf_index, l_edited_item_index, items, "B", "I", "D", p_pog_index);
                        // }

                        if (reorder_items(new_module_index, new_shelf_index, p_pog_index)) {
                            const l_invalidPosition = g_invalidPosition;
                            var i = 0;
                            for (const fitems of g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo) {
                                if (fitems.ObjID == items.ObjID) {
                                    l_edited_item_index = i;
                                    break;
                                }
                                i++;
                            }
                            var itemindex = 0;
                            //var l_fixed_item_validate = "N";//ASA-1286 issue 2  KUSH//Task-02_25977 should not be fixed here for hanging bar fixed item.need to find other approach
                            // var shefl_end = parseFloat((g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].X + g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].W / 2).toFixed(4)); //ASA-1286 issue 2
                            for (const fitems of g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo) {
                                fitems.CType = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ObjType;
                                //ASA_1769, added itemInsidePeg param to not validate holes passing to find_pegboard_gap
                                var new_x = get_item_xaxis(fitems.W, fitems.H, fitems.D, fitems.CType, -1, g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].HorizGap, g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].SpreadItem, g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].HorizGap, new_module_index, new_shelf_index, itemindex, "Y", g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.length, "N", p_pog_index, itemInsidePeg);
                                fitems.X = new_x;
                                // var item_end = parseFloat((fitems.X + fitems.W / 2).toFixed(4)); //ASA-1286 issue 2  KUSH
                                /*if (item_end >shefl_end && g_overhung_shelf_active == 'N'){//ASA-1286 issue 2  KUSH//Task-02_25977
                                l_fixed_item_validate = "Y";
                                } */
                                itemindex++;
                            }
                            var return_val = "N";
                            //check if there is difference in any dimension in POG data to DB if change validate and update all same items
                            if (check_dim_difference(new_module_index, new_shelf_index, l_edited_item_index, p_pog_index)) {
                                return_val = await check_item_dim_valid(items, new_module_index, new_shelf_index, l_edited_item_index, p_pog_index); //ASA-1301
                            } else if (new_object_type !== "PEGBOARD") {
                                if ((new_object_type == "BASKET" && ItemInfo["Item"] == "DIVIDER") || (g_chest_as_pegboard == "Y" && new_object_type == "CHEST")) {
                                    //ASA-1125
                                    //ASA-1085
                                } else {
                                    //getting latest height and width and validate the item height in the present shelf.
                                    var return_val = update_validate_item_height(items, new_module_index, new_shelf_index, l_edited_item_index, g_final_x, new_object_type, -1, p_pog_index);
                                }
                            }
                            //ASA-1476 ISSUE 4
                            if (bottom_item_flag == "N" && g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Item !== "DIVIDER") {
                                var res = await set_auto_facings(new_module_index, new_shelf_index, l_edited_item_index, items, "B", "I", "D", p_pog_index);
                            }
                            /*if (l_fixed_item_validate !=="N"){ //ASA-1286 issue 2  KUSH//Task-02_25977
                            return_val = l_fixed_item_validate;
                            }*/
                            g_invalidPosition = l_invalidPosition;
                        }

                        if (new_object_type == "PEGBOARD" || (g_chest_as_pegboard == "Y" && new_object_type == "CHEST")) {
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Exists = "N";
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].X = g_final_x;
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Y = l_final_y;
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].DropY = l_final_y;
                        }
                        if (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].SpreadItem == "F") {
                            $.each(g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo, function (i, fitems) {
                                fitems.W = fitems.RW;
                            });
                        }
                        var drag_item_arr = [];

                        var items = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];
                        item_width_arr.push(wpdSetFixed(items.W));
                        item_height_arr.push(wpdSetFixed(items.H));
                        item_depth_arr.push(wpdSetFixed(items.D));
                        item_index_arr.push(l_edited_item_index);

                        var info = {}; //ASA-1327
                        g_combineItemModf = [];
                        info["NewMIndex"] = new_module_index;
                        info["NewSIndex"] = new_shelf_index;
                        info["OldMIndex"] = new_module_index;
                        info["OldSIndex"] = new_shelf_index;
                        info["OldIIndex"] = l_edited_item_index;
                        info["OldObjID"] = items.ObjID;
                        g_combineItemModf.push(info);
                        //validate item width and depth and do auto crush if applicable.
                        if ((return_val == "F" || return_val == "N") && (await validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, new_object_type, new_module_index, new_shelf_index, l_edited_item_index, g_edit_ind, ItemInfo["CrushHoriz"], ItemInfo["CrushVert"], ItemInfo["CrushD"], g_final_x, item_fixed, "N", "Y", bottom_item_flag, "N", drag_item_arr, "Y", "Y", "Y", p_pog_index))) {
                            //identify if any change in POG
                            g_pog_edited_ind = "Y";

                            var obj_id = 0;
                            g_undo_details = [];
                            g_undo_obj_arr = [];
                            g_undo_supp_obj_arr = [];
                            var movedShelfDetail = {};
                            var shelfInfoForUndo = [];
                            movedShelfDetail["MIndex"] = g_module_index;
                            movedShelfDetail["SIndex"] = g_shelf_index;
                            movedShelfDetail["NewModuleIndex"] = new_module_index;
                            movedShelfDetail["NewShelfIndex"] = new_shelf_index;
                            shelfInfoForUndo.push(movedShelfDetail);
                            if (g_shelf_index !== div_shelf_index || curr_module !== g_module_index) {
                                try {
                                    /*if (div_object_type == "SHELF" || div_object_type == "PALLET") {
                                    //ASA-1085
                                    var returnval = reset_top_bottom_objects(new_module_index, new_shelf_index, "N", p_pog_index);
                                    }*/
                                    if (reorder_items(new_module_index, new_shelf_index, p_pog_index)) {
                                        // ASA-1095, Start
                                        if (div_object_type == "SHELF" && (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].SpreadItem == "L" || g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].SpreadItem == "R")) {
                                            var new_index = mergeAdjacentItems(p_pog_index, new_module_index, new_shelf_index, l_edited_item_index);
                                            if (new_index > -1) {
                                                l_edited_item_index = new_index;
                                            }
                                        }
                                        // ASA-1095, End
                                        var return_val = await recreate_all_items(new_module_index, new_shelf_index, div_object_type, "Y", g_final_x, l_edited_item_index, g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), "Y", itemInsidePeg); //ASA-1350 issue 6 added parameters, ASA-1769 itemInsidePeg
                                        //ASA-1129, Start
                                        var modfIndx = -1;
                                        if (g_combineItemModf.length > 0) {
                                            for (var mf = 0; mf < g_combineItemModf.length; mf++) {
                                                if (g_combineItemModf[mf].OldMIndex == new_module_index && g_combineItemModf[mf].OldSIndex == new_shelf_index) {
                                                    new_module_index = g_combineItemModf[mf].OldMIndex;
                                                    new_shelf_index = g_combineItemModf[mf].OldSIndex;
                                                    modfIndx = mf;
                                                    break;
                                                }
                                            }
                                        }
                                        var item_details = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo;
                                        var sorto = {
                                            X: "asc",
                                            Y: "asc",
                                        };
                                        item_details.keySort(sorto);
                                        if (modfIndx !== -1) {
                                            var itemIndex = 0;
                                            for (item of item_details) {
                                                if (item.ObjID == g_combineItemModf[modfIndx].NewObjID) {
                                                    l_edited_item_index = itemIndex;
                                                }
                                                itemIndex++;
                                            }
                                        }
                                        g_combineItemModf = []; //asa-1327
                                        //ASA-1129, End
                                        //ASA-S-1107, Start
                                        var item_blink = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];
                                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item_blink.ObjID);
                                        g_intersected.push(selectedObject);
                                        render_animate_selected();
                                        //ASA-S-1107, End
                                    }
                                    update_item_distance(new_module_index, new_shelf_index, p_pog_index);
                                    render(p_pog_index);
                                } catch (err) {
                                    error_handling(err);
                                }
                                logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y", g_carpark_item_flag);
                                g_allUndoObjectsInfo = [];

                                //capture the module is edit or not to create changed text box
                                g_pog_json[p_pog_index].ModuleInfo[new_module_index].EditFlag = "Y";
                                if (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
                                    //Bug-26122 - splitting the chest
                                    g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ChestEdit = "Y";
                                }
                                // ASA-1095, Start
                                //ASA-1327 unused code.
                                /*if (typeof l_edited_item_index !== "undefined" && l_edited_item_index !== -1) {
                                ItemInfo = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];
                                (item_width_arr = []),
                                (item_height_arr = []),
                                (item_depth_arr = []),
                                (item_index_arr = []);
                                item_width_arr.push(parseFloat(ItemInfo.W.toFixed(3)));
                                item_height_arr.push(parseFloat(ItemInfo.H.toFixed(3)));
                                item_depth_arr.push(parseFloat(ItemInfo.D.toFixed(3)));
                                item_index_arr.push(l_edited_item_index);
                                }*/
                                // ASA-1095, End
                            }

                            try {
                                if (shelfdtl.SpreadItem == "F") {
                                    var i = 0;
                                    for (const fitems of shelfdtl.ItemInfo) {
                                        if (fitems["CrushHoriz"] == 0) {
                                            fitems.W = fitems.RW;
                                        }
                                        i++;
                                    }
                                }
                                // await auto_crush_items(item_width_arr, item_index_arr, shelfdtl.ObjType, g_module_index, g_shelf_index, l_edited_item_index, p_pog_index, "N", "Y"); //ASA-1079
                                var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].Shelf);
                                var [oldcurrCombinationIndex, oldShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Shelf);

                                if ((currCombinationIndex !== oldcurrCombinationIndex && currCombinationIndex > -1) || currCombinationIndex == -1 || (g_shelf_index == div_shelf_index && curr_module == g_module_index)) {
                                    if (reorder_items(g_module_index, g_shelf_index, p_pog_index)) {
                                        var return_val = await recreate_all_items(g_module_index, g_shelf_index, shelfdtl.ObjType, "Y", g_final_x, l_edited_item_index, shelfdtl.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P193_POGCR_DELIST_ITEM_DFT_COL"), $v("P193_MERCH_STYLE"), $v("P193_POGCR_LOAD_IMG_FROM"), $v("P193_BU_ID"), $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), $v("P193_POGCR_DISPLAY_ITEM_INFO"), "Y", itemInsidePeg); //ASA-1350 issue 6 added parameters, ASA-1769 itemInsidePeg
                                        //ASA-1129, Start
                                        var modfIndx = -1;
                                        if (g_combineItemModf.length > 0) {
                                            for (var mf = 0; mf < g_combineItemModf.length; mf++) {
                                                if (g_combineItemModf[mf].OldMIndex == new_module_index && g_combineItemModf[mf].OldSIndex == new_shelf_index) {
                                                    new_module_index = g_combineItemModf[mf].NewMIndex;
                                                    new_shelf_index = g_combineItemModf[mf].NewSIndex;
                                                    modfIndx = mf;
                                                    break;
                                                }
                                            }
                                        }
                                        var item_details = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo;
                                        var sorto = {
                                            X: "asc",
                                            Y: "asc",
                                        };
                                        item_details.keySort(sorto);
                                        if (modfIndx !== -1) {
                                            var itemIndex = 0;
                                            for (item of item_details) {
                                                if (item.ObjID == g_combineItemModf[modfIndx].NewObjID) {
                                                    l_edited_item_index = itemIndex;
                                                }
                                                itemIndex++;
                                            }
                                        }
                                        //ASA-1129, End
                                    }
                                }
                                update_item_distance(g_module_index, g_shelf_index, p_pog_index);
                                //capture the module is edit or not to create changed text box
                                g_pog_json[p_pog_index].ModuleInfo[g_module_index].EditFlag = "Y";
                                if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
                                    //Bug-26122 - splitting the chest
                                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ChestEdit = "Y";
                                }
                                render(p_pog_index);
                            } catch (err) {
                                error_handling(err);
                            }
                            if (g_shelf_index == div_shelf_index && curr_module == g_module_index) {
                                logFinalUndoObjectsInfo("SHELF_DRAG", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y", g_carpark_item_flag);
                                g_allUndoObjectsInfo = [];
                            }

                            if (g_carpark_item_flag == "Y" && $v("P193_POGCR_LOAD_IMG_FROM") == "DB") {
                                var items_arr = [];
                                var item_index_arr = [];
                                items_arr.push(ItemInfo);
                                item_index_arr.push(l_edited_item_index);
                                var return_val = await get_images(new_module_index, new_shelf_index, items_arr, item_index_arr, parseFloat($v("P193_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P193_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P193_IMAGE_COMPRESS_RATIO")));
                                if (items_arr.length > 0) {
                                    var return_val = await get_images(i, j, items_arr, item_index_arr, parseFloat($v("P193_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P193_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P193_IMAGE_COMPRESS_RATIO")));
                                }

                                //delete the carpark shelf if all items are moved.
                                if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo.length == 0) {
                                    var selectObjects = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].SObjID);
                                    g_scene_objects[p_pog_index].scene.children[2].remove(selectObjects);
                                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark.splice(0, 1);
                                }
                            }
                            recreate_compare_views(g_compare_view, "N");
                        } else {
                            old_ItemInfo.DimUpdate = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].DimUpdate;
                            if (g_carpark_item_flag == "N") {
                                var returnval = reset_bottom_item(new_module_index, new_shelf_index, l_edited_item_index, -1, -1, g_final_x, p_pog_index);
                            }
                            if (l_edited_item_index == 0) {
                                g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.splice(l_edited_item_index, l_edited_item_index + 1);
                            } else {
                                g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.splice(l_edited_item_index, 1);
                            }
                            if (g_carpark_item_flag == "Y") {
                                g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo.splice(g_item_index, 0, old_ItemInfo);
                                g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].X = l_old_itemX;
                                g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index].Y = l_old_itemY;
                            } else {
                                if (spread_product == "R") {
                                    shelfdtl.ItemInfo.splice(g_item_index, 0, old_ItemInfo);
                                } else {
                                    shelfdtl.ItemInfo.splice(g_item_index, 0, old_ItemInfo);
                                }
                                shelfdtl.ItemInfo[g_item_index].X = l_old_itemX;
                                shelfdtl.ItemInfo[g_item_index].Y = l_old_itemY;
                            }

                            if (shelfdtl.Rotation !== 0) {
                                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfdtl.SObjID);
                                var p_x = shelfdtl.ItemInfo[g_item_index].RotationX;
                                var p_y = shelfdtl.ItemInfo[g_item_index].RotationY;
                                var z = shelfdtl.ItemInfo[g_item_index].RotationZ;
                                var relativeMeshOffset = new THREE.Vector3(p_x, p_y, z);

                                var offsetPosition = relativeMeshOffset.applyMatrix4(selectedObject.matrixWorld);

                                g_dragItem.position.x = offsetPosition.x;
                                g_dragItem.position.y = offsetPosition.y;
                                g_dragItem.position.z = offsetPosition.z;
                                g_dragItem.quaternion.copy(selectedObject.quaternion);
                                g_dragItem.updateMatrix();
                            } else {
                                g_dragItem.position.set(l_old_itemX, l_old_itemY, g_itemDragZ);
                                g_dragItem.updateMatrix();
                            }
                        }
                        if (g_invalidPosition == "Y") {
                            var undoActionDup = g_undoRedoAction;
                            g_invalidPosition = "N";
                            g_validationFlag = "Y";

                            undo_actions_not_delete("UNDO", p_camera, p_pog_index);

                            alert(get_message("LOST_FROM_SHELF_ERR_HORIZ", shelfdtl.Shelf));
                            g_redo_final_obj_arr.pop();
                            g_undoRedoAction = undoActionDup;
                        }
                    }
                } else if (g_item_edit_flag == "Y") {
                    rollback_item(g_module_index, g_shelf_index, g_item_index, g_drag_z, p_pog_index);
                }
                //--------------------- END OF ITEM EDIT FUNCTIONALITY   ------------------------------------------------------------------------------------

                //---------------------CAMERA SETTING BASED ON NEW OVERALL HEIGHT AND WIDTH OF ALL MODULES   -----------------------------------------------

                if (g_shelf_edit_flag == "Y") {
                    if (g_manual_zoom_ind == "N") {
                        var details = get_min_max_xy(p_pog_index);
                        var details_arr = details.split("###");
                        set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), false, p_pog_index);
                    }
                    if (g_rotation !== 0 || g_slope !== 0) {
                        if (g_rotation !== 0) {
                            g_dragItem.quaternion.copy(p_camera.quaternion);
                            g_dragItem.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
                            if (shelfdtl.ObjType == "TEXTBOX") {
                                var slope = g_slope;
                                if (g_rotation == 0) {
                                    g_dragItem.rotateX(((slope / 2) * Math.PI) / 180);
                                } else {
                                    g_dragItem.rotateX((slope * Math.PI) / 180);
                                }
                            } else {
                                g_dragItem.rotateX((slope * Math.PI) / 180);
                            }
                            g_dragItem.rotateY((g_rotation * Math.PI) / 180);

                            g_dragItem.updateMatrix();
                        }

                        if (shelfdtl.ItemInfo.length > 0) {
                            g_scene_objects[p_pog_index].scene.updateMatrixWorld();
                            await set_all_items(g_module_index, g_shelf_index, org_shelf_x, org_shelf_y, g_shelf_edit_flag, "N", "Y", p_pog_index, p_pog_index);
                        }
                    }
                    update_rotate_shelfs(p_pog_index);
                }

                //------------------------------  END OF CAMERA SETTING  ---------------------------------------------------------------
                g_drag_inprogress = "N";
                g_rotation = 0;
                g_slope = 0;
            }
        }

        // if (g_itemSubLabelInd == "Y") { //ASA-1417   //ASA-1577
        //     showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P193_POGCR_ITEM_NUM_LBL_COLOR"), $v("P193_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        // }

        g_drag_inprogress = "N";
        g_duplicating = "N";
        g_canvas_drag = "N";
        g_mselect_drag = "N";
        if (typeof g_dragItem !== "undefined") {
            if (g_canvas_drag == "N" && g_drag_inprogress == "N" && g_dragItem.StartCanvas == g_present_canvas) {
                g_dragItem = [];
                g_drag_items_arr = [];
            }
        }
        render_animate_selected();
        render(p_pog_index);
        logDebug("function : doMouseUp", "E");
    } catch (err) {
        error_handling(err);
    }
}




// function doMouseMove(p_x, p_y, p_event, p_prevX, p_prevY, p_canvas, p_pogjson_opp, p_jselector, p_pog_index) {
//      if (Array.isArray(g_scene_objects) && g_scene_objects.length > 0) {
//     /* This is mouse move listner function
//     This function handles
//     1. dragging of any object set object current position
//     2. resetting size of multiselect box
//     3. grab and move scene which manually zoom is done
//     4. setting items position for multiselect object dragging
//     5. when not dragging show item info in bottom of screen.
//      */
//     try {
//         //get the intersect object and from that get the current x y position
//         var width = p_canvas.width / window.devicePixelRatio;
//         var height = p_canvas.height / window.devicePixelRatio;
//         var a = (2 * p_x) / width - 1;
//         var b = 1 - (2 * p_y) / height;
//         var yaxis = p_y;
//         // var padding = parseFloat($("#ig_mod_details").css("padding-left").replace("px", "")) * devicePixelRatio;
//         var mod_region = document.getElementById("ig_mod_details");
//         // var mod_detail_width = mod_region.offsetWidth + 40;
//          var padding = 0;
//         var mod_detail_width = 0;
//         if (mod_region) {
//             var pl = $("#ig_mod_details").css("padding-left");
//             padding = parseFloat((pl || "0px").replace("px", "")) * devicePixelRatio;
//             try {
//                 mod_detail_width = mod_region.offsetWidth + 40;
//             } catch (e) {
//                 mod_detail_width = 0;
//             }
//         }
//         var scroll_top = $(document).scrollTop();
//         var scroll_left = $(".t-Region-body").scrollLeft();


//             g_scene_objects[0].scene.children[0].updateProjectionMatrix();
//             g_raycaster.setFromCamera(
//                 new THREE.Vector2(a, b),
//                 g_scene_objects[0].scene.children[0]
//             );

//             if (typeof g_scene_objects[p_pog_index] !== 'undefined') {
//                 g_intersects = g_raycaster.intersectObjects(
//                     g_scene_objects[p_pog_index].scene.children[2].children
//                 );
//             } else {
//                 g_intersects = g_raycaster.intersectObjects(g_world.children);
//             }


//         // g_scene_objects[0].scene.children[0].updateProjectionMatrix();
//         // g_raycaster.setFromCamera(new THREE.Vector2(a, b), g_scene_objects[0].scene.children[0]);
//         // if (typeof g_scene_objects[p_pog_index] !== 'undefined') {
//         //     g_intersects = g_raycaster.intersectObjects(g_scene_objects[p_pog_index].scene.children[2].children); // no need for recusion since all objects are top-level
//         // } else {
//         //     g_intersects = g_raycaster.intersectObjects(g_world.children);
//         // }

//         /* if dragging is in progress set new positions
//         if ctrl key is pressed while mouse move it means user wants to
//         create a duplicate of a fixel so do not set new position.
//          */

//         //if intersected object is item then get details and show in bottom of screen.
//         var $doc = $(document),
//             $win = $(window),
//             $this = $("#object_info"),
//             offset = $this.offset(),
//             dTop = offset.top - $doc.scrollTop(),
//             dBottom = $win.height() - dTop - $this.height(),
//             dLeft = offset.left - $doc.scrollLeft(),
//             dRight = $win.width() - dLeft - $this.width();

//         g_mouse.x = p_event.clientX + scroll_left - mod_detail_width;
//         g_mouse.y = p_event.clientY + scroll_top;

//         var x1 = g_startMouse.x;
//         var x2 = g_mouse.x;
//         var y1 = g_startMouse.y;
//         var y2 = g_mouse.y;

//         if (x1 > x2) {
//             var tmp1 = x1;
//             x1 = x2;
//             x2 = tmp1;
//         }

//         if (y1 > y2) {
//             var tmp2 = y1;
//             y1 = y2;
//             y2 = tmp2;
//         }
//         if (g_dragging) {
//             g_raycaster.setFromCamera(new THREE.Vector2(a, b), g_scene_objects[0].scene.children[0]);
//             g_intersects = g_raycaster.intersectObject(g_targetForDragging);

//             var z = g_drag_z;
//             var locationX = g_intersects[0].point.x;
//             var locationY = g_intersects[0].point.y;
//             var locationZ = g_intersects[0].point.z;

//             var coords = new THREE.Vector3(locationX, locationY, locationZ);
//             g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);

//             a = Math.min(19, Math.max(-19, coords.x));
//             p_y = Math.min(19, Math.max(-19, coords.y));
//             //multi select box height width and location setting.
//             if (g_selecting) {
//                 g_multiselect = "Y";
//                 g_DragMouseEnd.x = a;
//                 g_DragMouseEnd.y = p_y;

//                 g_selection.style.left = x1 + "px";
//                 g_selection.style.top = y1 + "px";
//                 g_selection.style.width = x2 - x1 - 5 + "px";
//                 g_selection.style.height = y2 - y1 - 5 + "px";
//                 console.log('g_selection.style.left', g_selection.style.left, g_selection.style.top, g_selection.style.width);
//             }
//             g_DragMouseEnd.x = a;
//             g_DragMouseEnd.y = p_y;
//         } else {
//             if (g_selecting) {
//                 g_selecting = false;
//                 g_selection.style.visibility = "hidden";
//             }
//         }

//         var contextElement = document.getElementById("object_info");
//         $("#object_info")
//             .contents()
//             .filter(function () {
//                 return this.nodeType == 3;
//             })
//             .remove();
//         var append_detail = "";
//         var valid_width = 0;
//         var lines_arry = [];
//         var divider = " | ";
//         console.log("inside", g_intersects.length);
//         if (g_intersects.length > 0 && typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
//             var desc_list_arr = $v("P193_POGCR_ITEM_DESC_LIST").split(":");//ASA-1407 Task 1
//             for (i = 0; i < desc_list_arr.length; i++) {
//                 var line_width = 0;
//                 var divider = i > 0 ? " | " : "";
//                 if (desc_list_arr[i] == "ITEM") {
//                     append_detail = append_detail + divider + get_message("ITEM_ID_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.ItemID + "</span>";
//                     line_width = (" | " + get_message("ITEM_ID_LBL") + ": " + g_intersects[0].object.ItemID).visualLength("ruler");
//                      console.log("inside IF", g_intersects.length);
//                 }
//                 if (desc_list_arr[i] == "UPC") {
//                     append_detail = append_detail + divider + get_message("POGCR_REP_TEMP_HEAD_BARCODE") + ': <span style="color:yellow">' + g_intersects[0].object.Barcode + "</span>";
//                     line_width = (" | " + get_message("POGCR_REP_TEMP_HEAD_BARCODE") + ": " + g_intersects[0].object.Barcode).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "DESC") {
//                     append_detail = append_detail + divider + get_message("DESCRIPTION_DETAIL") + ': <span style="color:yellow">' + g_intersects[0].object.Description + "</span>";
//                     line_width = (" | " + get_message("DESCRIPTION_DETAIL") + ": " + g_intersects[0].object.Description).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "BRAND") {
//                     append_detail = append_detail + divider + get_message("POGCR_BRAND") + ': <span style="color:yellow">' + g_intersects[0].object.Brand + "</span>";
//                     line_width = (" | " + get_message("POGCR_BRAND") + ": " + g_intersects[0].object.Brand).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "GROUP") {
//                     append_detail = append_detail + divider + get_message("POGCR_GROUP_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Group + "</span>";
//                     line_width = (" | " + get_message("POGCR_GROUP_LBL") + ": " + g_intersects[0].object.Group).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "DEPT") {
//                     append_detail = append_detail + divider + get_message("POGCR_TEMP_HEAD_DEPARTMENT") + ': <span style="color:yellow">' + g_intersects[0].object.Dept + "</span>";
//                     line_width = (" | " + get_message("POGCR_TEMP_HEAD_DEPARTMENT") + ": " + g_intersects[0].object.Dept).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "CLASS") {
//                     append_detail = append_detail + divider + get_message("POGCR_CLASS_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Class + "</span>";
//                     line_width = (" | " + get_message("POGCR_CLASS_LBL") + ": " + g_intersects[0].object.Class).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "SUBCLASS") {
//                     append_detail = append_detail + divider + get_message("POGCR_SUBCLASS_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.SubClass + "</span>";
//                     line_width = (" | " + get_message("POGCR_SUBCLASS_LBL") + ": " + g_intersects[0].object.SubClass).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "ITEM_SIZE") {
//                     append_detail = append_detail + divider + get_message("POGCR_ITEMSIZE_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.SizeDesc + "</span>";
//                     line_width = (" | " + get_message("POGCR_ITEMSIZE_LBL") + ": " + g_intersects[0].object.SizeDesc).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "SUPPLIER") {
//                     append_detail = append_detail + divider + get_message("POGCR_REP_HEAD_SUPPLIERS") + ': <span style="color:yellow">' + g_intersects[0].object.Supplier + "</span>";
//                     line_width = (" | " + get_message("POGCR_REP_HEAD_SUPPLIERS") + ": " + g_intersects[0].object.Supplier).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "WIDTH") {
//                     append_detail = append_detail + divider + get_message("POGCR_WIDTH_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OW * 100).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("POGCR_WIDTH_LBL") + ": " + (g_intersects[0].object.OW * 100).toFixed(2)).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "HEIGHT") {
//                     append_detail = append_detail + divider + get_message("POGCR_HEIGHT_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OH * 100).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("POGCR_HEIGHT_LBL") + ": " + (g_intersects[0].object.OH * 100).toFixed(2)).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "DEPTH") {
//                     append_detail = append_detail + divider + get_message("POGCR_DEPTH_LBL") + ': <span style="color:yellow">' + (g_intersects[0].object.OD * 100).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("POGCR_DEPTH_LBL") + ": " + (g_intersects[0].object.OD * 100).toFixed(2)).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "STORE") {
//                     append_detail = append_detail + divider + get_message("POGCR_STORE_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.StoreCnt + "</span>";
//                     line_width = (" | " + get_message("POGCR_STORE_LBL") + ": " + g_intersects[0].object.StoreCnt).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "ITEM_DIM") {
//                     append_detail = append_detail + divider + get_message("POGCR_ITEM_DIM_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.ItemDim + "</span>";
//                     line_width = (" | " + get_message("POGCR_ITEM_DIM_LBL") + ": " + g_intersects[0].object.ItemDim).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "POSITION") {
//                     append_detail = append_detail + divider + get_message("POGCR_POSITION_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.LocID + "</span>";
//                     line_width = (" | " + get_message("POGCR_POSITION_LBL") + ": " + g_intersects[0].object.LocID).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "SHELF") {
//                     append_detail = append_detail + divider + get_message("POGCR_SHELF_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.Shelf + "</span>";
//                     line_width = (" | " + get_message("POGCR_SHELF_LBL") + ": " + g_intersects[0].object.Shelf).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "ORIENTATION") {
//                     append_detail = append_detail + divider + get_message("POGCR_ORIENTATION_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.OrientationDesc + "</span>";
//                     line_width = (" | " + get_message("POGCR_ORIENTATION_LBL") + ": " + g_intersects[0].object.OrientationDesc).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "DEPTH_FACING") {
//                     append_detail = append_detail + divider + get_message("POGCR_DEPTH_FACING_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.DFacing + "</span>";
//                     line_width = (" | " + get_message("POGCR_DEPTH_FACING_LBL") + ": " + g_intersects[0].object.DFacing).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "HORIZ_FACING") {
//                     append_detail = append_detail + divider + get_message("TEMP_HEAD_HORIZ_FACING") + ': <span style="color:yellow">' + g_intersects[0].object.HorizFacing + "</span>";
//                     line_width = (" | " + get_message("TEMP_HEAD_HORIZ_FACING") + ": " + g_intersects[0].object.HorizFacing).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "VERT_FACING") {
//                     append_detail = append_detail + divider + get_message("TEMP_HEAD_VERT_FACING") + ': <span style="color:yellow">' + g_intersects[0].object.VertFacing + "</span>";
//                     line_width = (" | " + get_message("TEMP_HEAD_VERT_FACING") + ": " + g_intersects[0].object.VertFacing).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "SELLING_PRICE") {
//                     append_detail = append_detail + divider + get_message("SELLING_PRICE_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.SellingPrice).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("SELLING_PRICE_LBL") + ": " + g_intersects[0].object.SellingPrice).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "SALES_UNIT") {
//                     append_detail = append_detail + divider + get_message("SALES_UNIT_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.SalesUnit).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("SALES_UNIT_LBL") + ": " + g_intersects[0].object.SalesUnit).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "NET_SALES") {
//                     append_detail = append_detail + divider + get_message("NET_SALES_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.NetSales).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("NET_SALES_LBL") + ": " + g_intersects[0].object.NetSales).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "PROFIT") {
//                     append_detail = append_detail + divider + get_message("PROFIT_LBL") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.Profit).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("PROFIT_LBL") + ": " + g_intersects[0].object.Profit).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "TOTAL_MARGIN") {
//                     append_detail = append_detail + divider + get_message("POGCR_TOTAL_MARGIN") + ': <span style="color:yellow">' + parseFloat(g_intersects[0].object.TotalMargin).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("POGCR_TOTAL_MARGIN") + ": " + g_intersects[0].object.TotalMargin).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "COGS_ADJ") {
//                     append_detail = append_detail + divider + get_message("COGS_ADJ") + ': <span style="color:yellow">' + parseFloat(nvl(g_intersects[0].object.CogsAdj)).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("COGS_ADJ") + ": " + nvl(g_intersects[0].object.CogsAdj)).visualLength("ruler");
//                 }

//                 if (desc_list_arr[i] == "GP") {
//                     append_detail = append_detail + divider + get_message("GROSS_PROFIT") + ': <span style="color:yellow">' + parseFloat(nvl(g_intersects[0].object.GrossProfit)).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("GROSS_PROFIT") + ": " + nvl(g_intersects[0].object.GrossProfit)).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "WK_COUNT") {
//                     append_detail = append_detail + divider + get_message("WEEKS_COUNT") + ': <span style="color:yellow">' + parseFloat(nvl(g_intersects[0].object.WeeksCount)).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("WEEKS_COUNT") + ": " + nvl(g_intersects[0].object.WeeksCount)).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "REG_MOV") {
//                     append_detail = append_detail + divider + get_message("REG_MOV") + ': <span style="color:yellow">' + parseFloat(nvl(g_intersects[0].object.RegMovement)).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("REG_MOV") + ": " + nvl(g_intersects[0].object.RegMovement)).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "AVG_SALES") {
//                     append_detail = append_detail + divider + get_message("AVG_SALES") + ': <span style="color:yellow">' + parseFloat(nvl(g_intersects[0].object.AvgSales)).toFixed(2) + "</span>";
//                     line_width = (" | " + get_message("AVG_SALES") + ": " + nvl(g_intersects[0].object.AvgSales)).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "DESC_SECOND") {
//                     append_detail = append_detail + divider + get_message("DESC_SECOND_LBL") + ': <span style="color:yellow">' + g_intersects[0].object.DescSecond + "</span>";
//                     line_width = (" | " + get_message("DESC_SECOND_LBL") + ": " + g_intersects[0].object.DescSecond).visualLength("ruler");
//                 }
//                 if (desc_list_arr[i] == "ITEM_STATUS") {
//                     append_detail = append_detail + divider + get_message("ITEM_STATUS") + ': <span style="color:yellow">' + g_intersects[0].object.ItemStatus + "</span>";
//                     line_width = (" | " + get_message("ITEM_STATUS") + ": " + total_unit).visualLength("ruler");
//                 }

//                 if (desc_list_arr[i] == "TOTAL_UNIT") {
//                     var total_unit = g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing;
//                     append_detail = append_detail + divider + get_message("TOTAL_UNIT") + ': <span style="color:yellow">' + total_unit + "</span>";
//                     line_width = (" | " + get_message("TOTAL_UNIT") + ": " + total_unit).visualLength("ruler");
//                 }
//                 valid_width = valid_width + line_width;
//                 if (valid_width > 1300) {
//                     append_detail = append_detail + "<br>";
//                     lines_arry.push(valid_width);
//                     valid_width = 0;
//                 }
//             }
//         } else if (g_intersects.length > 0 && typeof g_intersects[0].object.FixelID !== "undefined" && g_intersects[0].object.FixelID !== "" && typeof p_pogjson_opp[p_pog_index] !== "undefined") {
//             var pog_version = typeof p_pogjson_opp[p_pog_index].Version !== "undefined" && p_pogjson_opp[p_pog_index].Version !== null ? p_pogjson_opp[p_pog_index].Version : "";
//             if (sessionStorage.getItem("new_pog_ind") == "Y") {
//                 var draft_version = divider + get_message("POGCR_DRAFT_VERSION") + ': <span style="color:yellow">' + sessionStorage.getItem("P193_EXISTING_DRAFT_VER") + " </span> ";
//                 var pogversion = "";
//             } else {
//                 var draft_version = "";
//                 var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";
//             }
//             if (typeof g_intersects[0].object.AvlSpace !== "undefined") {
//                 append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pogjson_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version + divider + get_message("POGCR_POG_MOD") + ': <span style="color:yellow">' + g_intersects[p_pog_index].object.Module + " </span> " + divider + get_message("POGCR_FIXEL_ID") + ': <span style="color:yellow">' + g_intersects[p_pog_index].object.FixelID + " </span> " + divider + get_message("POGC_FIXEL_SPACE") + ': <span style="color:yellow">' + g_intersects[0].object.AvlSpace + "</span>";
//             } else {
//                 append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pogjson_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version + divider + get_message("POGCR_POG_MOD") + ': <span style="color:yellow">' + g_intersects[p_pog_index].object.Module + " </span> " + divider + get_message("POGCR_FIXEL_ID") + ': <span style="color:yellow">' + g_intersects[p_pog_index].object.FixelID + " </span> " + divider + "</span>";
//             }
//             contextElement.classList.add("active");
//         } else if (g_intersects.length > 0 && typeof g_intersects[0].object.Module !== "undefined" && g_intersects[0].object.Module !== "" && typeof p_pogjson_opp[p_pog_index] !== "undefined") {
//             var pog_version = typeof p_pogjson_opp[p_pog_index].Version !== "undefined" && p_pogjson_opp[p_pog_index].Version !== null ? p_pogjson_opp[p_pog_index].Version : "";
//             if (sessionStorage.getItem("new_pog_ind") == "Y") {
//                 var draft_version = divider + get_message("POGCR_DRAFT_VERSION") + ': <span style="color:yellow">' + sessionStorage.getItem("P193_EXISTING_DRAFT_VER") + " </span> ";
//                 var pogversion = "";
//             } else {
//                 var draft_version = "";
//                 var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";
//             }
//             append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pogjson_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version + divider + get_message("POGCR_POG_MOD") + ': <span style="color:yellow">' + g_intersects[0].object.Module + "</span>";
//             contextElement.classList.add("active");
//         } else if (typeof p_pogjson_opp !== "undefined" && p_pogjson_opp.length > 0 && typeof p_pogjson_opp[p_pog_index] !== "undefined") {
//             var pog_version = typeof p_pogjson_opp[p_pog_index].Version !== "undefined" && p_pogjson_opp[p_pog_index].Version !== null ? p_pogjson_opp[p_pog_index].Version : "";
//             if (sessionStorage.getItem("new_pog_ind") == "Y") {
//                 var draft_version = divider + get_message("POGCR_DRAFT_VERSION") + ': <span style="color:yellow">' + sessionStorage.getItem("P193_EXISTING_DRAFT_VER") + " </span> ";
//                 var pogversion = "";
//             } else {
//                 var draft_version = "";
//                 var pogversion = divider + get_message("POGCR_POG_VERSION") + ': <span style="color:yellow">' + pog_version + " </span> ";
//             }
//             append_detail = append_detail + get_message("POGCR_POG_CODE") + ': <span style="color:yellow">' + p_pogjson_opp[p_pog_index].POGCode + " </span> " + pogversion + draft_version;
//             contextElement.classList.add("active");
//         } else {
//             contextElement.classList.remove("active");
//         }

//         if (g_intersects.length > 0) {
//             if (typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
//                 var height = 36;
//                 var buffer_width = desc_list_arr.length > 7 ? 150 : 50;
//                 if (lines_arry.length > 0) {
//                     var width = Math.max.apply(Math, lines_arry) + buffer_width;
//                 } else {
//                     var width = append_detail.visualLength("ruler") + buffer_width;
//                 }
//             } else {
//                 var height = 31;
//                 var width = append_detail.visualLength("ruler") + 50;
//             }
//         } else {
//             var height = 31;
//             var width = append_detail.visualLength("ruler") + 50;
//         }

//         $("#object_info").html(append_detail);
//         contextElement.style.top = window.innerHeight - $this.height() + "px";
//         contextElement.style.width = width + "px";
//         contextElement.style.height = height + 5 + "px";
//         contextElement.style.fontSize = "large";
//         contextElement.style.fontFamily = "Tahoma";
//         contextElement.style.left = 0 + "px";
//     } catch (err) {
//         error_handling(err);
//     }
//  }  
// }
async function doMouseMove(p_x, p_y, p_event, p_prevX, p_prevY, p_canvas, p_camera, p_jselector, p_pog_index) {
    /* This is mouse move listner functio
    This function handles
    1. dragging of any object set object current position
    2. resetting size of g_multiselect box
    3. grab and move scene which manually zoom is done
    4. setting items position for g_multiselect object dragging
    5. when not dragging show item info in bottom of screen.
     */
    try {
        g_present_canvas = parseInt(p_pog_index); //canvas_drag.getAttribute("data-indx");
        g_taskItemInContext = true;
        if (p_event.target.nodeName == "CANVAS") {
            //get the intersect object and from that get the current x y position
            var canvas_drag = p_event.target;
            p_jselector = canvas_drag.getAttribute("id");
            var p_index = parseInt(canvas_drag.getAttribute("data-indx"));
            var width = canvas_drag.width; // / window.devicePixelRatio;
            var height = canvas_drag.height; // / window.devicePixelRatio;
            var a = (2 * p_x) / width - 1;
            var b = 1 - (2 * p_y) / height;
            var yaxis = p_y;
            if (p_index > -1 && typeof g_scene_objects[p_index] !== "undefined") {
                p_camera = g_scene_objects[p_index].scene.children[0];
                new_world = g_scene_objects[p_index].scene.children[2];
            } else {
                new_world = g_world;
            }

            p_camera.updateProjectionMatrix();
            g_raycaster.setFromCamera(new THREE.Vector2(a, b), p_camera);
            g_intersects = g_raycaster.intersectObjects(new_world.children); // no need for recusion since all objects are top-level
            /* if dragging is in progress set new positions
            if ctrl key is pressed while mouse move it means user wants to
            create a duplicate of a fixel so do not set new position.
             */
            console.log("MouseMove", g_dragging);
            if (g_dragging && g_duplicating == "N") {
                g_pog_index = p_pog_index;
                p_canvas = canvas_drag;

                g_raycaster.setFromCamera(new THREE.Vector2(a, b), p_camera);
                g_intersects = g_raycaster.intersectObject(g_targetForDragging);

                var z = g_drag_z;
                var locationX = g_intersects[0].point.x;
                var locationY = g_intersects[0].point.y;
                var locationZ = g_intersects[0].point.z;

                var coords = new THREE.Vector3(locationX, locationY, locationZ);
                new_world.worldToLocal(coords);

                a = Math.min(19, Math.max(-19, coords.x));
                p_y = Math.min(19, Math.max(-19, coords.y));

                //if there was active blinking of object remove blink
                if (g_intersected) {
                    for (var i = 0; i < g_intersected.length; i++) {
                        if (typeof g_intersected[i] !== "undefined") {
                            g_select_color = g_intersected[i].BorderColour;
                            if (typeof g_intersected[i].WireframeObj !== "undefined") {
                                g_intersected[i].WireframeObj.material.color.setHex(g_select_color);
                                if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                                    g_intersected[i].WireframeObj.material.transparent = true;
                                    g_intersected[i].WireframeObj.material.opacity = 0.0025;
                                }
                            }
                        }
                    }
                    clearInterval(g_myVar);
                    g_select_color = 0x000000;
                    render(p_pog_index);
                }
                var header = document.getElementById("t_Header");
                var breadcrumb = document.getElementById("t_Body_title");
                var top_bar = document.getElementById("top_bar");
                var side_nav = document.getElementById("t_Body_nav");
                var button_cont = document.getElementById("side_bar");
                var wtbar = document.querySelector(".wtbar");
                var devicePixelRatio = window.devicePixelRatio;
                var scroll_top = $(document).scrollTop();
                var scroll_left = $(".t-Region-body").scrollLeft();
                var padding = parseFloat($(".t-Body-contentInner").css("padding-left").replace("px", "")) * devicePixelRatio;

                var header_height = header.offsetHeight; // * devicePixelRatio;
                var breadcrumb_height = breadcrumb.offsetHeight; // * devicePixelRatio;
                var top_bar_height = top_bar.offsetHeight; //* devicePixelRatio;
                var side_nav_width = side_nav.offsetWidth; //* devicePixelRatio;
                var btn_cont_width = button_cont.offsetWidth; //* devicePixelRatio;
                var wtbar_height = wtbar.offsetHeight //* devicePixelRatio;

                g_mouse.x = p_event.clientX + scroll_left - (btn_cont_width + padding);
                g_mouse.y = p_event.clientY + scroll_top - (breadcrumb_height + padding + header_height + top_bar_height + wtbar_height);
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

                //multi select box height width and location setting.
                if (g_selecting) {
                    g_multiselect = "Y";
                    g_DragMouseEnd.x = a;
                    g_DragMouseEnd.y = p_y;

                    g_selection.style.left = x1 + "px";
                    g_selection.style.top = y1 + "px";

                    // ASA-1638
                    // g_selection.style.width = x2 - x1 - 5 + "px";
                    // g_selection.style.height = y2 - y1 - 5 + "px";
                    g_selection.style.width = x2 - x1 - 20 + "px";
                    g_selection.style.height = y2 - y1 + "px";
                }
                g_DragMouseEnd.x = a;
                g_DragMouseEnd.y = p_y;

                //if the POG is zoomed using ctrl + mouse wheel then grab the screen and move scene according to direction.
                if (p_event.shiftKey && g_manual_zoom_ind == "Y") {
                    g_grabbing_progress = "Y";
                    $(p_jselector).css("cursor", "grabbing");

                    g_prevMouse = g_nextMouse;
                    g_nextMouse.x = a;
                    g_nextMouse.y = p_y;

                    grab_interval = parseFloat($v("P193_POGCR_GRAB_INTERVAL"));

                    if (p_x > p_prevX) {
                        p_camera.position.set(p_camera.position.x - grab_interval, p_camera.position.y, p_camera.position.z);
                    }
                    if (p_x < p_prevX) {
                        p_camera.position.set(p_camera.position.x + grab_interval, p_camera.position.y, p_camera.position.z);
                    }
                    if (yaxis > p_prevY) {
                        p_camera.position.set(p_camera.position.x, p_camera.position.y + grab_interval, p_camera.position.z);
                    }
                    if (yaxis < p_prevY) {
                        p_camera.position.set(p_camera.position.x, p_camera.position.y - grab_interval, p_camera.position.z);
                    }
                    render(p_pog_index);

                    //if multi select is done and multi objects are moving set position. until the object are in the same canvas
                } else if (g_mselect_drag == "Y" && g_curr_canvas == g_present_canvas) {
                    //ASA-1507 #3
                    // } else if (g_mselect_drag == "Y" && g_curr_canvas == g_present_canvas && !(g_compare_pog_flag == "Y" && g_start_canvas == g_ComViewIndex && g_compare_view == "PREV_VERSION")) {        //ASA-1507 #3
                    var i = 0;
                    for (const objects of g_delete_details) {
                        var selectObjects = new_world.getObjectById(objects.ObjID);
                        if (typeof selectObjects !== "undefined") {
                            selectObjects.WireframeObj.material.color.setHex(0x000000);

                            if (objects.ObjType == "PEGBOARD" || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                //ASA-1125
                                selectObjects.position.set(a + objects.XDistance, p_y - objects.YDistance, g_drag_z);
                            } else {
                                selectObjects.position.set(a + objects.XDistance, p_y + objects.YDistance, g_drag_z);
                            }
                            selectObjects.updateMatrix();

                            if (objects.Object == "SHELF" && objects.IsDivider == "N") {
                                if (objects.Rotation !== 0) {
                                    g_scene.updateMatrixWorld();
                                    var slope = 0;
                                    if (objects.Slope > 0) {
                                        slope = 0 - objects.Slope;
                                    } else {
                                        slope = -objects.Slope;
                                    }
                                    selectObjects.quaternion.copy(p_camera.quaternion);
                                    selectObjects.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
                                    selectObjects.rotateY((objects.Rotation * Math.PI) / 180);
                                    if (objects.ObjType == "TEXTBOX") {
                                        if (objects.Rotation == 0) {
                                            selectObjects.rotateX(((slope / 2) * Math.PI) / 180);
                                        } else {
                                            selectObjects.rotateX((slope * Math.PI) / 180);
                                        }
                                    } else {
                                        selectObjects.rotateX((slope * Math.PI) / 180);
                                    }
                                    selectObjects.updateMatrix();
                                    g_scene.updateMatrixWorld();

                                    await set_all_items(objects.MIndex, objects.SIndex, a + objects.XDistance, p_y + objects.YDistance, "Y", "N", "N", p_pog_index, p_pog_index);
                                    await update_rotate_shelfs(p_pog_index);
                                }
                            }
                        }
                        i++;
                    }

                    render(p_pog_index);
                } else if (g_selecting == false && typeof g_dragItem !== "undefined") {
                    // drag
                    if (g_auto_fill_active == "N" && ((g_compare_pog_flag == "Y" && g_start_canvas == g_ComViewIndex && g_present_canvas == g_ComViewIndex && g_compare_view == "PREV_VERSION") || g_compare_view != "PREV_VERSION" || (g_start_canvas != g_ComViewIndex && g_present_canvas != g_ComViewIndex))) {
                        //ASA-1507 #3
                        // if (g_auto_fill_active == "N" && !(g_compare_pog_flag == "Y" && g_start_canvas == g_ComViewIndex && g_compare_view == "PREV_VERSION")) { //ASA-1507 #3
                        //ASA-1085 added autofill condition
                        //this whole block will fire when the mouse pointer croses the current canvas and moves to another.
                        //here we need to remove all the objects from old canvas and create new objects in new canvas and assign it to mouse even
                        //this is done on the pixel change and identitied by g_curr_canvas !== g_present_canvas
                        if (g_curr_canvas !== g_present_canvas && g_carpark_item_flag == "N" && ((g_compare_pog_flag == "Y" && parseInt(g_present_canvas) == g_ComViewIndex && g_compare_view == "POG") || g_compare_pog_flag == "N" || (g_compare_pog_flag == "Y" && parseInt(g_present_canvas) !== g_ComViewIndex))) {
                            g_canvas_drag = "Y";
                            var new_world = g_scene_objects[g_present_canvas].scene.children[2];
                            var remove_world = g_scene_objects[g_curr_canvas].scene.children[2];
                            var remove_renderer = g_scene_objects[g_curr_canvas].renderer,
                                remove_scene = g_scene_objects[g_curr_canvas].scene,
                                remove_camera = remove_scene.children[0];
                            var image_ind = g_show_live_image;
                            //if single object dragging set its position.
                            if (g_mselect_drag == "N") {
                                if (g_item_edit_flag == "Y") {
                                    async function create_item() {
                                        g_world = g_scene_objects[g_present_canvas].scene.children[2];
                                        var [return_obj, obj_id] = await create_drag_objects(g_module_index, g_shelf_index, g_item_index, g_dragItem.ShelfInfo, g_dragItem.ItemInfo, image_ind, "ITEM", g_dragItem, g_start_canvas, g_present_canvas);
                                        return_obj.position.x = a;
                                        return_obj.position.y = p_y;
                                        return_obj.position.z = z;
                                        remove_world.remove(g_dragItem);
                                        render(g_curr_canvas);
                                        g_dragItem = return_obj;
                                        g_curr_canvas = g_present_canvas;
                                        g_canvas_drag = "Y";
                                        g_drag_inprogress = "Y";
                                        g_dragItem.updateMatrix();
                                    }
                                    create_item();
                                } else if (g_shelf_edit_flag == "Y") {
                                    async function create_obj() {
                                        g_world = g_scene_objects[g_present_canvas].scene.children[2];
                                        var [return_obj, obj_id] = await create_drag_objects(g_module_index, g_shelf_index, g_item_index, g_dragItem.ShelfInfo, g_dragItem.ItemInfo, image_ind, "SHELF", g_dragItem, g_start_canvas, g_present_canvas);
                                        remove_world.remove(g_dragItem);

                                        g_dragItem = return_obj;
                                        var old_canvas = g_curr_canvas;
                                        g_curr_canvas = g_present_canvas;
                                        g_canvas_drag = "Y";
                                        g_drag_inprogress = "Y";
                                        g_dragItem.updateMatrix();
                                        var l_temp_arr = [];
                                        if (g_drag_items_arr.length > 0) {
                                            for (const objects of g_drag_items_arr) {
                                                remove_world.remove(objects);
                                                var [return_obj, obj_id] = await create_drag_objects(g_module_index, g_shelf_index, objects.IIndex, objects.ShelfInfo, objects.ItemInfo, image_ind, "ITEM", objects, g_start_canvas, g_present_canvas);
                                                l_temp_arr.push(return_obj);
                                            }

                                            if (l_temp_arr.length > 0) {
                                                g_drag_items_arr = [];
                                                g_drag_items_arr = l_temp_arr;
                                            }
                                            await set_inter_canvas_items(a, p_y, g_dragItem, l_temp_arr, g_dragItem.W, g_dragItem.H, g_shelf_object_type, g_shelf_basket_spread, g_dragItem.Rotation, g_dragItem.ItemSlope, g_shelf_index, g_module_index, g_start_canvas);
                                        }
                                        render(old_canvas);
                                    }
                                    await create_obj();
                                }
                            } else {
                                var j = -1;
                                var return_obj, newObjId;
                                var old_canvas = g_curr_canvas;
                                g_world = g_scene_objects[g_present_canvas].scene.children[2];
                                for (const objects of g_multi_drag_item_arr) {
                                    j++;
                                    async function create_item() {
                                        var shelfInfo = g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                                        var objectID = g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex].ObjID;
                                        var selectObjects = remove_world.getObjectById(objectID);
                                        [return_obj, newObjId] = await create_drag_objects(objects.MIndex, objects.SIndex, objects.IIndex, shelfInfo, shelfInfo.ItemInfo[objects.IIndex], image_ind, "ITEM", selectObjects, g_start_canvas, g_present_canvas);
                                        if (typeof selectObjects !== "undefined") {
                                            selectObjects.position.set(a + objects.XDistance, p_y + objects.YDistance, g_drag_z);
                                            selectObjects.updateMatrix();
                                        }
                                        return_obj.position.x = a;
                                        return_obj.position.y = p_y;
                                        return_obj.position.z = z;
                                        remove_world.remove(selectObjects);
                                        g_dragItem = return_obj;
                                        g_curr_canvas = g_present_canvas;
                                        g_canvas_drag = "Y";
                                        g_drag_inprogress = "Y";
                                        g_dragItem.updateMatrix();
                                    }
                                    await create_item();
                                    var item_Details = g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
                                    for (const items of item_Details) {
                                        if ((typeof items.TopObjID !== "undefined" && items.TopObjID !== "") || (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "")) {
                                            var tier_ind;
                                            if (items.TopObjID !== "" && typeof items.TopObjID !== "undefined") {
                                                tier_ind = "BOTTOM";
                                            } else {
                                                tier_ind = "TOP";
                                            }
                                            await reset_top_bottom_obj_id(tier_ind, items.OldObjID, items.ObjID, items.X, "N", g_start_canvas);
                                        }
                                    }
                                    k = 0;
                                    for (const del_obj of g_delete_details) {
                                        if (del_obj.ObjID == g_multi_drag_item_arr[j].ObjID) {
                                            g_delete_details[k].OldObjID = g_delete_details[j].ObjID;
                                            g_delete_details[k].ObjID = newObjId;
                                        }

                                        k++;
                                    }
                                    g_multi_drag_item_arr[j].OldObjID = g_multi_drag_item_arr[j].ObjID;
                                    g_multi_drag_item_arr[j].ObjID = newObjId;
                                    g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex].ObjID = newObjId;
                                }
                                var j = -1;
                                for (const objects of g_multi_drag_shelf_arr) {
                                    j++;
                                    async function create_obj() {
                                        var shelfInfo = g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                                        var selectObjects = remove_world.getObjectById(objects.ObjID);
                                        [return_obj, newObjId] = await create_drag_objects(objects.MIndex, objects.SIndex, objects.IIndex, shelfInfo, shelfInfo.ItemInfo, image_ind, "SHELF", selectObjects, g_start_canvas, g_present_canvas);
                                        remove_world.remove(selectObjects);
                                        selectObjects = return_obj;
                                        g_canvas_drag = "Y";
                                        g_drag_inprogress = "Y";
                                        selectObjects.updateMatrix();
                                        var k = j;
                                        g_drag_items_arr = [];
                                        $.each(objects.ItemInfo, function (l, items) {
                                            var selectedObject = remove_world.getObjectById(items.ObjID);
                                            if (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                                                //ASA-1125
                                                selectedObject.PegBoardX = items.PegBoardX;
                                                selectedObject.PegBoardY = items.PegBoardY;
                                            } else if (g_shelf_object_type !== "PEGBOARD") {
                                                selectedObject.Distance = items.Distance;
                                            } else {
                                                selectedObject.PegBoardX = items.PegBoardX;
                                                selectedObject.PegBoardY = items.PegBoardY;
                                            }
                                            selectedObject.ItemInfo = items;
                                            selectedObject.IIndex = l;
                                            selectedObject.StartCanvas = g_curr_canvas;
                                            selectedObject.MIndex = objects.MIndex;
                                            selectedObject.SIndex = objects.SIndex;
                                            g_drag_items_arr.push(selectedObject);
                                        });
                                        var l_temp_arr = [];
                                        if (g_drag_items_arr.length > 0) {
                                            var k = 0;
                                            for (const object of g_drag_items_arr) {
                                                k++;
                                                remove_world.remove(object);
                                                var [return_obj, newObjID1] = await create_drag_objects(objects.MIndex, objects.SIndex, object.IIndex, shelfInfo, object.ItemInfo, image_ind, "ITEM", object, g_start_canvas, g_present_canvas);
                                                l_temp_arr.push(return_obj);
                                                var m = 0;
                                                for (const del_obj of g_delete_details) {
                                                    if (del_obj.ObjID == object.id) {
                                                        g_delete_details[m].OldObjID = object.id;
                                                        g_delete_details[m].ObjID = newObjID1;
                                                    }
                                                    m++;
                                                }
                                                object.ItemInfo.ObjID = newObjID1;
                                                g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[object.IIndex].ObjID = newObjID1;
                                            }

                                            if (l_temp_arr.length > 0) {
                                                g_drag_items_arr = [];
                                                g_drag_items_arr = l_temp_arr;
                                            }
                                            await set_inter_canvas_items(a, p_y, selectObjects, l_temp_arr, selectObjects.W, selectObjects.H, g_shelf_object_type, g_shelf_basket_spread, selectObjects.Rotation, selectObjects.ItemSlope, objects.SIndex, objects.MIndex, g_start_canvas);
                                        }
                                    }
                                    await create_obj();
                                    l = 0;
                                    for (const del_obj of g_delete_details) {
                                        if (del_obj.ObjID == g_multi_drag_shelf_arr[j].ObjID) {
                                            g_delete_details[l].OldObjID = g_delete_details[j].ObjID;
                                            g_delete_details[l].ObjID = newObjId;
                                        }
                                        l++;
                                    }
                                    g_multi_drag_shelf_arr[j].OldObjID = g_multi_drag_shelf_arr[j].ObjID;
                                    g_multi_drag_shelf_arr[j].ObjID = newObjId;
                                    g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].SObjID = newObjId;
                                }
                                render(g_curr_canvas);
                                render(old_canvas);
                                g_curr_canvas = g_present_canvas;
                            }
                            render(p_pog_index);
                            //ASA-1085
                        } else if ((g_compare_pog_flag == "Y" && g_present_canvas == g_ComViewIndex && g_compare_view == "PREV_VERSION") || (g_compare_pog_flag == "Y" && g_start_canvas == g_ComViewIndex && g_compare_view == "EDIT_PALLET") || g_compare_pog_flag == "N" || (g_compare_pog_flag == "Y" && g_start_canvas !== g_ComViewIndex && g_carpark_item_flag == "N")) {
                            //ASA-1507 #3
                            // } else if ((g_compare_pog_flag == "Y" && g_start_canvas == g_ComViewIndex && g_compare_view == "EDIT_PALLET") || g_compare_pog_flag == "N" || (g_compare_pog_flag == "Y" && g_start_canvas !== g_ComViewIndex && g_carpark_item_flag == "N")) {  //ASA-1507 #3
                            g_drag_inprogress = "Y";
                            if (g_intersects.length == 0) {
                                return;
                            }
                            if ((g_shelf_object_type == "PEGBOARD" || (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y")) && g_shelf_edit_flag == "Y") {
                                //ASA-1125
                                g_drag_z = 0.00115;
                            }
                            if (g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET" && g_present_canvas == g_ComViewIndex) {
                                for (const obj of g_drag_items_arr) {
                                    obj.position.set(a, p_y, obj.position.z);
                                }
                                // } else if (g_shelf_object_type == "TEXTBOX" && g_shelf_edit_flag == "Y" && g_present_canvas !== g_ComViewIndex) {   //ASA-1507 #3
                            } else if (g_shelf_object_type == "TEXTBOX" && g_shelf_edit_flag == "Y") {
                                //ASA-1507 #3
                                // var z_axis = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z > 0.0021 ? 0.0021 : g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z == 0 ? 0.0006 : g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z;      //ASA-1652
                                // g_dragItem.position.set(a, p_y, z_axis);     //ASA-1652
                                g_dragItem.position.set(a, p_y);
                            } else if (g_present_canvas !== g_ComViewIndex || (g_present_canvas == g_ComViewIndex && g_compare_view == "PREV_VERSION")) {
                                //ASA-1507 #3
                                // else if (g_present_canvas !== g_ComViewIndex) {     //ASA-1507 #3
                                g_dragItem.position.set(a, p_y, g_drag_z);
                            } else {
                                return false;
                            }
                            g_dragItem.updateMatrix();
                            //if dragged object is shelf set its item position too
                            if ((g_shelf_edit_flag == "Y" || g_item_edit_flag == "Y") && g_canvas_drag == "N") {
                                await set_all_items(g_module_index, g_shelf_index, a, p_y, g_shelf_edit_flag, "N", "N", g_curr_canvas, g_curr_canvas);
                            } else if (g_shelf_edit_flag == "Y") {
                                var new_pogjson = g_pog_json;
                                await set_inter_canvas_items(a, p_y, g_dragItem, g_drag_items_arr, g_dragItem.W, g_dragItem.H, g_shelf_object_type, g_shelf_basket_spread, g_dragItem.Rotation, g_dragItem.ItemSlope, g_shelf_index, g_module_index, g_start_canvas);
                            }

                            // if shelf is rotated then make sure the shelf sees the camera always to maintain the angle.
                            if (g_shelf_edit_flag == "Y" && g_rotation !== 0) {
                                g_dragItem.quaternion.copy(p_camera.quaternion);
                                g_dragItem.lookAt(g_pog_json[g_curr_canvas].CameraX, g_pog_json[g_curr_canvas].CameraY, g_pog_json[g_curr_canvas].CameraZ);
                                g_dragItem.rotateY((g_rotation * Math.PI) / 180);
                                if (g_pog_json[g_curr_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "TEXTBOX") {
                                    if (g_rotation == 0) {
                                        g_dragItem.rotateX(((g_slope / 2) * Math.PI) / 180);
                                    } else {
                                        g_dragItem.rotateX((g_slope * Math.PI) / 180);
                                    }
                                } else {
                                    g_dragItem.rotateX((g_slope * Math.PI) / 180);
                                }
                                g_dragItem.updateMatrix();
                            }

                            render(p_pog_index);
                        } else {
                            g_scene_objects[g_curr_canvas].scene.children[2].remove(g_dragItem);
                            render(g_curr_canvas);
                        }
                    } else if (g_auto_fill_active == "Y") {
                        //this block is used to move autofill block of any module.
                        //ASA-1085 added autofill block
                        g_drag_inprogress = "Y";

                        if (g_intersects.length == 0) {
                            return;
                        }
                        var z = g_dragItem.position.z;
                        a = a - g_pog_json[g_start_canvas].ModuleInfo[g_module_index].X;
                        p_y = p_y - g_pog_json[g_start_canvas].ModuleInfo[g_module_index].Y;
                        g_dragItem.position.set(a, p_y, z);
                        g_dragItem.updateMatrix();

                        render(p_pog_index);
                    }
                }
            } else {
                //if there is no objecct dragging. then we need to show the status bar. this below code will create status bar
                //according to object the mouse is hovering on.
                if (g_selecting) {
                    g_selecting = false;
                    g_selection.style.visibility = "hidden";
                }
                if (g_duplicating == "Y") {
                    g_drag_inprogress = "Y";
                }
                //if g_intersected object is item then get details and show in bottom of screen.
                // var $doc = $(document),
                // $win = $(window),
                // $this = $("#object_info"),
                // offset = $this.offset(),
                // dTop = offset.top - $doc.scrollTop(),
                // dBottom = $win.height() - dTop - $this.height(),
                // dLeft = offset.left - $doc.scrollLeft(),
                // dRight = $win.width() - dLeft - $this.width(),
                // fieldValue; //ASA-1407 Task 1

                // var contextElement = document.getElementById("object_info");
                // $("#object_info")
                //     .contents()
                //     .filter(function () {
                //         return this.nodeType == 3;
                //     })
                //     .remove();
                // var append_detail = "";
                // var valid_width = 0;
                // var lines_arry = [];
                // var divider = " | ";

                // when label type = 'I'
                // if (g_intersects.length > 0 && typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
                //     var desc_list_arr = $v("P193_POGCR_ITEM_DESC_LIST").split(":");
                //     var i = 0;
                //     var sorto = {
                //         Seq: "asc",
                //     };
                //     g_status_bar.keySort(sorto);
                //     var SalesInfo = get_sales_info(p_pog_index, g_intersects[0].object.ItemID); //ASA-1360 task 1. this could be outside as mouse each time we get only one item
                //     var SalesInfoList = ["LeadTime", "SalesAmt", "VRM", "GP", "BEI", "MarkDown", "ShrinkageAmt", "SalesUnit", "SalesPerWeek", "SalesUnitPerWeek", "NonShrinkageAmt", "ASP", "VRMPer", "GPPer", "BEIPer", "MarkDownPer", "ShrinkageAmtPer", "DOS", "AvgSalesPerWeek", "AvgQtyPerWeek", "SalesPartPer", "QtyPartPer", "NoOfListing", "TotalShrinkageAmtPer","WeeklySales","WeeklyQty","NetMarginPercent","AUR"]; //ASA-1923 Issue 1//ASA-1360 task 1 //ASA-1407 Task 1
                //     var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; //ASA-1254 //ASA-1407 Issue 5
                //     for (const obj of g_status_bar) {
                //         var line_width = 0;
                //         var divider = i > 0 ? " | " : "";
                //         if (desc_list_arr.includes(obj.Param) && obj.label_type == "I") {
                //             if (SalesInfoList.includes(obj.Map)) {
                //                 if (obj.Map == "DOS") {
                //                     fieldValue = (g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing * parseInt(g_intersects[0].object.MerchStyle == 1 ? g_intersects[0].object.UnitperTray : g_intersects[0].object.MerchStyle == 2 ? g_intersects[0].object.UnitperCase : 1)) / (SalesInfo.SalesUnitPerWeek / 7); //ASA-1605 //ASA-1871 aading condition for case
                //                     // fieldValue = (g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing) / (SalesInfo.SalesUnitPerWeek / 7);
                //                     if (isNaN(fieldValue) || !isFinite(fieldValue)) {
                //                         fieldValue = 0;
                //                     } else {
                //                         fieldValue = parseFloat(fieldValue.toFixed(1));
                //                     }
                //                 } else if (obj.Map == "SalesUnitPerWeek") {
                //                     //ASA-1407 Task 1
                //                     fieldValue = SalesInfo.SalesUnitPerWeek + " " + g_msg_unit; //ASA-1407 issue 5
                //                 } else if (obj.Map == "SalesPerWeek") {
                //                     //ASA-1407 Task 1
                //                     fieldValue = g_msg_dollar + SalesInfo.SalesPerWeek; //ASA-1407 issue 5
                //                 } else if (obj.Map == "TotalShrinkageAmtPer") {
                //                     //ASA-1407 Task 1
                //                     fieldValue = SalesInfo.TotalShrinkageAmtPer; //ASA-1407 issue 5
                //                 } else if (obj.Map == "ASP") {
                //                     fieldValue = g_msg_dollar + SalesInfo.ASP; //ASA-1407 issue 5
                //                 } else {
                //                     fieldValue = eval("SalesInfo." + obj.Map);
                //                 }
                //             } else if (obj.Map == "COS") {
                //                 var item_capacity = g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing * parseInt(g_intersects[0].object.MerchStyle == 1 ? g_intersects[0].object.UnitperTray : g_intersects[0].object.MerchStyle == 2 ? g_intersects[0].object.UnitperCase : 1) + g_intersects[0].object.CapFacing * g_intersects[0].object.CapDepth * g_intersects[0].object.CapHorz * parseInt(g_intersects[0].object.CapMerch == 1 ? g_intersects[0].object.UnitperTray : 1); //ASA-1605 //ASA-1871 aading condition for case 
                //                 //var item_capacity = (g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing) + g_intersects[0].object.CapFacing * g_intersects[0].object.CapDepth * g_intersects[0].object.CapHorz; //ASA-1341 Issue-2 added Cap_capacity in COS Calculation. + cap_capacity ,//ASA-1398 issue 4
                //                 fieldValue = item_capacity / parseInt(g_intersects[0].object.SizeDesc.split("*")[1]); //ASA-1341 ,//ASA-1398 issue 4
                //                 if (isNaN(fieldValue) || !isFinite(fieldValue)) {
                //                     fieldValue = 0;
                //                 } else {
                //                     fieldValue = parseFloat(fieldValue.toFixed(1)) + " (" + item_capacity + " " + g_msg_unit + ")"; //ASA-1407 Task 1,//ASA-1398 issue 4,//ASA-1407 issue 5
                //                 }
                //             } else if (obj.Map == "TotalUnits") {
                //                 fieldValue = g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing * parseInt(g_intersects[0].object.MerchStyle == 1 ? g_intersects[0].object.UnitperTray : g_intersects[0].object.MerchStyle == 2 ? g_intersects[0].object.UnitperCase : 1) + g_intersects[0].object.CapFacing * g_intersects[0].object.CapDepth * g_intersects[0].object.CapHorz * parseInt(g_intersects[0].object.CapMerch == 1 ? g_intersects[0].object.UnitperTray : 1); //ASA-1871 aading condition for case
                //             } //ASA-1640
                //             else if (obj.Map == "OOSPerc" && g_intersects[0].object.OOSPerc !== "undefined" && g_intersects[0].object.OOSPerc !== "") {
                //                 //ASA-1688
                //                 fieldValue = g_intersects[0].object.OOSPerc + "%";
                //                 //asa-1923 added elseif 
                //             } else if ($v("P193_POGCR_REFRESH_SALES_WTCCN") == 'Y' && (obj.Map == 'NetMarginPercent' || obj.Map == 'WeeklySales' || obj.Map == 'WeeklyQty' || obj.Map == 'AUR')){
                //                 if (obj.Map == "NetMarginPercent" &&  SalesInfo.netmarginpercent !== "undefined" &&  SalesInfo.netmarginpercent !== "") {  //ASA-1923
                //                    fieldValue = SalesInfo.netmarginpercent  + "%";
                //                 } else if (obj.Map == "WeeklySales" &&  SalesInfo.weeklysales !== "undefined" &&  SalesInfo.weeklysales !== ""){
                //                    fieldValue = SalesInfo.weeklysales;
                //                 }else if (obj.Map == "WeeklyQty" &&  SalesInfo.weeklyqty !== "undefined" &&  SalesInfo.weeklyqty !== ""){
                //                    fieldValue = SalesInfo.weeklyqty;
                //                 }else if (obj.Map == "AUR" &&  SalesInfo.AUR !== "undefined" &&  SalesInfo.AUR !== ""){
                //                    fieldValue = SalesInfo.AUR;
                //                 }
                //             } else {
                //                 fieldValue = getFieldValue(g_intersects[0].object, obj.Map, "I"); //ASA-1361 20240501 passing the p_label_type = 'I'
                //             }
                //             if (typeof fieldValue !== "undefined") {
                //                 line_width = (" | : " + obj.label + ": <span>" + fieldValue + "</span>").visualLength("ruler"); //ASA 1407 issue 4
                //             }
                //             // Calculate the available browser width
                //             if (valid_width + line_width > browserWidth) {
                //                 //ASA-1254
                //                 // Add a line break if necessary
                //                 append_detail = append_detail + "<br>";
                //                 lines_arry.push(valid_width);
                //                 valid_width = 0;
                //                 // Check if there's still space available after the line break
                //                 //ASA 1407 issue 4 S
                //                 // if (line_width > browserWidth) {
                //                 //     // Handle long lines that won't fit in the available space
                //                 //     append_detail = append_detail + obj.label + ': <span style="color:yellow">' + fieldValue + "</span>";
                //                 // } //ASA 1407 issue 4 E
                //             }

                //             append_detail = append_detail + divider + obj.label + ': <span style="color:yellow">' + fieldValue + "</span>";
                //             // Update valid_width after adding the current item
                //             valid_width += line_width;
                //         }
                //         i++;
                //     }
                // } else {
                //     contextElement.classList.remove("active");
                // }

                // if (g_compare_pog_flag == "Y" && g_compare_view == "PREV_VERSION") {
                //     append_detail = append_detail + "<br>" + 'Version Compare color details : <span style="color:#80ff80">Added Product</span> ' + divider + ' <span style="color:#8080ff">Retain Product with position change</span> ' + divider + ' <span style="color:#FFFFFF">Retain with no change</span> ' + divider + ' <span style="color:#ff6666">Deleted Product</span> ' + divider + ' <span style="color:#808080">New Products</span>';
                // }

                // if (g_intersects.length > 0) {
                //     if (typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
                //         var height = append_detail.visualHeight("ruler") + 12;
                //         var buffer_width = desc_list_arr.length > 7 ? 150 : 50;
                //         if (lines_arry.length > 0) {
                //             var width = Math.max.apply(Math, lines_arry) + buffer_width;
                //         } else {
                //             var width = append_detail.visualLength("ruler") + buffer_width;
                //         }
                //     } else {
                //         var height = append_detail.visualHeight("ruler") + 7;
                //         var width = append_detail.visualLength("ruler") + 50;
                //     }
                // } else {
                //     var height = append_detail.visualHeight("ruler") + 7;
                //     var width = append_detail.visualLength("ruler") + 50;
                // }

                // $("#object_info").html(append_detail);
                // contextElement.style.top = window.innerHeight - $this.height() + "px";
                // contextElement.style.width = browserWidth + "px"; //ASA-1407 issue 5
                // contextElement.style.height = height + 5 + "px";
                // contextElement.style.fontSize = "larger"; //ASA-1254 "large"
                // contextElement.style.fontFamily = "Tahoma";
                // contextElement.style.left = 0 + "px";

                // var canvasHolderH = $("#canvas-list-holder").height();
                // var canvasHolderTop = window.innerHeight - $this.height() - canvasHolderH;
                // $("#canvas-list-holder").css("top", canvasHolderTop + "px");
            }
        } else {
            if (g_selecting) {
                g_selecting = false;
                g_selection.style.visibility = "hidden";
                g_dragging = false;
            }
        }
    } catch (err) {
        error_handling(err);
    }
}

function doMouseDoubleclick(p_x, p_y, p_startX, p_startY, p_event, p_canvas, p_camera, p_pog_index) {
    logDebug("function : doMouseDoubleclick; x : " + p_x + "; y : " + p_y + "; startX : " + p_startX + "; startY : " + p_startY, "S");
    g_taskItemInContext = clickInsideElement(p_event, "canvasregion");
    g_taskItemInContext1 = clickInsideElement(p_event, "canvasregion1");
    g_dblclick_opened = "N";
    // ASA-1085, x12 :: if (g_dblclick_opened == "N" && (g_taskItemInContext || (g_taskItemInContext1 && g_compare_view == "POG"))) {
    if (g_dblclick_opened == "N" && g_ComViewIndex !== p_pog_index) {
        //we use raycaster and find out the intersected objects. through which we find out what object was clicked.
        var l_width = (2 * p_x) / p_canvas.width - 1;
        var l_height = 1 - (2 * p_y) / p_canvas.height;
        g_raycaster.setFromCamera(new THREE.Vector2(l_width, l_height), p_camera);
        g_intersects = g_raycaster.intersectObjects(g_scene_objects[p_pog_index].scene.children[2].children); // no need for recusion since all objects are top-level
        if (g_intersects.length == 0) {
            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && p_startX !== undefined && p_x <= p_canvas.width) {
                open_pog_modal("edit_pog", p_pog_index, "N");
                g_dblclick_opened = "Y";
                $s("P193_MODULE_DISP", "");
            }
            return false;
        }
        var item = g_intersects[0];
        g_objectHit = item.object;
        g_object_hit_ind = "o";
        g_dblclick_objid = g_objectHit.id;
        g_objectHit_uuid = g_objectHit.uuid;

        g_carpark_edit_flag = "N";
        g_carpark_item_flag = "N";
        g_module_edit_flag = "N";
        g_shelf_edit_flag = "N";
        g_item_edit_flag = "N";
        g_module_index = "";
        g_shelf_index = "";
        g_module_cnt = "";
        g_item_index = "";
        g_module_width = "";
        g_module_X = "";
        g_shelf_max_merch = "";

        //checking which object has been clicked for drag or delete.
        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
            if (g_carpark_edit_flag == "Y") {
                return false;
            }
            if (modules.ParentModule == null && typeof modules.Carpark !== "undefined" && typeof modules.Carpark[0] !== "undefined") {
                if (modules.Carpark[0].ItemInfo.length > 0) {
                    $.each(modules.Carpark, function (j, carparks) {
                        if (carparks.SObjID == g_objectHit_id) {
                            g_module_index = i;
                            g_shelf_index = j;
                            g_carpark_edit_flag = "Y";
                            return false;
                        } else {
                            g_carpark_edit_flag = "N";
                        }
                    });
                }
            }
        });

        if (g_carpark_edit_flag == "N") {
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
                if (modules.MObjID == g_dblclick_objid && modules.ParentModule == null) {
                    g_module_index = i;
                    g_module_cnt = i;
                    g_module_width = modules.W;
                    g_module_X = modules.X;
                    g_module_edit_flag = "Y";
                    return false;
                } else {
                    g_module_edit_flag = "N";
                }
            });
        }
        if (g_module_edit_flag == "N" && g_carpark_edit_flag == "N") {
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (j, Modules) {
                if (g_shelf_edit_flag == "Y") {
                    return false;
                }
                if (Modules.ParentModule == null) {
                    $.each(Modules.ShelfInfo, function (i, Shelf) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                            if (Shelf.SObjID == g_dblclick_objid) {
                                g_module_index = j;
                                g_shelf_index = i;
                                g_shelf_max_merch = Shelf.MaxMerch;
                                g_shelf_edit_flag = "Y";
                                return false;
                            } else {
                                g_shelf_edit_flag = "N";
                            }
                        }
                    });
                }
            });
        }
        if (g_shelf_edit_flag == "N" && g_module_edit_flag == "N" && g_carpark_edit_flag == "N") {
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (k, Modules) {
                if (g_item_edit_flag == "Y") {
                    return false;
                }
                if (Modules.ParentModule == null) {
                    if (typeof Modules.Carpark !== "undefined" && typeof Modules.Carpark[0] !== "undefined") {
                        if (Modules.Carpark[0].ItemInfo.length > 0) {
                            $.each(Modules.Carpark[0].ItemInfo, function (j, items) {
                                if (items.ObjID == g_objectHit_id) {
                                    g_module_index = k;
                                    g_shelf_index = 0;
                                    g_item_index = j;
                                    g_item_edit_flag = "Y";
                                    g_shelf_object_type = Modules.Carpark[0].ObjType;
                                    g_wireframe_id = items.WFrameID;
                                    g_carpark_item_flag = "Y";
                                    return false;
                                } else {
                                    g_item_edit_flag = "N";
                                }
                            });
                        }
                    }
                    $.each(Modules.ShelfInfo, function (i, Shelf) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                            if (g_item_edit_flag == "Y") {
                                return false;
                            }
                            $.each(Shelf.ItemInfo, function (j, items) {
                                if (items.ObjID == g_dblclick_objid) {
                                    g_module_index = k;
                                    g_shelf_index = i;
                                    g_item_index = j;
                                    g_item_edit_flag = "Y";
                                    g_shelf_object_type = Shelf.ObjType;
                                    return false;
                                } else {
                                    g_item_edit_flag = "N";
                                }
                            });
                        }
                    });
                }
            });
        }
        //based on the object hit we open the edit popup.
        if (g_carpark_item_flag == "Y") {
            g_object_hit_ind = "I";
        } else if (g_module_edit_flag == "Y") {
            g_object_hit_ind = "M";
        } else if (g_shelf_edit_flag == "Y") {
            g_object_hit_ind = "S";
        } else if (g_item_edit_flag == "Y") {
            g_object_hit_ind = "I";
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Exists = "E";
        } else if (g_objectHit_uuid.match(/BASE.*/)) {
            g_object_hit_ind = "B";
        }
        g_dblclick_opened = "Y";
        try {
            open_edit_modal_popup(g_object_hit_ind, g_module_index, g_shelf_index, "N", p_pog_index);
        } catch (err) {
            error_handling(err);
        }
    }
    logDebug("function : doMouseDoubleclick", "E");
}

//Moved to Common JS
// function get_object_identity(p_pog_index, p_multiSelect, p_multiCopydone, p_a, p_y) {
//     logDebug("function : get_object_identity", "S");
//     try {
//         //checking which object has been clicked for drag or delete.
//         var i = 0;
//         for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
//             if (g_carpark_edit_flag == "Y") {
//                 break; //return false;
//             }
//             if (modules.ParentModule == null && typeof modules.Carpark !== "undefined" && modules.Carpark.length > 0) {
//                 if (modules.Carpark[0].ItemInfo.length > 0) {
//                     var j = 0;
//                     for (const carparks of modules.Carpark) {
//                         if (carparks.SObjID == g_objectHit_id) {
//                             g_module_index = i;
//                             g_shelf_index = j;
//                             g_carpark_edit_flag = "Y";
//                             break; //return false;
//                         } else {
//                             g_carpark_edit_flag = "N";
//                         }
//                         j++;
//                     }
//                 }
//             }
//             i++;
//         }
//         if (g_carpark_edit_flag == "N") {
//             var i = 0;
//             for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
//                 if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
//                     //ASA-1085
//                     if (modules.MObjID == g_objectHit_id && modules.ParentModule == null) {
//                         g_module_index = i;
//                         g_module_cnt = i;
//                         g_module_width = modules.W;
//                         g_module_X = modules.X;
//                         g_module_edit_flag = "Y";
//                         comp_obj_id = modules.CompMObjID;
//                         g_wireframe_id = modules.WFrameID;
//                         apex.item("P193_MODULE_DISP").setValue(modules.Module);
//                         break; //return false;
//                     } else {
//                         g_module_edit_flag = "N";
//                     }
//                 } else {
//                     if (modules.CompMObjID == g_objectHit_id && modules.ParentModule == null) {
//                         g_module_index = i;
//                         g_module_cnt = i;
//                         g_module_width = modules.W;
//                         g_module_X = modules.X;
//                         g_module_edit_flag = "Y";
//                         comp_obj_id = modules.MObjID;
//                         g_wireframe_id = modules.WFrameID;
//                         apex.item("P193_MODULE_DISP").setValue(modules.Module);
//                         break; //return false;
//                     } else {
//                         g_module_edit_flag = "N";
//                     }
//                 }
//                 i++;
//             }
//         }

//         if (g_module_edit_flag == "N" && g_carpark_edit_flag == "N") {
//             var j = 0;
//             for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
//                 if (g_shelf_edit_flag == "Y") {
//                     break; //return false;
//                 }
//                 if (Modules.ParentModule == null) {
//                     $.each(Modules.ShelfInfo, function (i, Shelf) {
//                         if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
//                             if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
//                                 //ASA-1085
//                                 if (Shelf.SObjID == g_objectHit_id) {
//                                     g_module_index = j;
//                                     g_shelf_index = i;
//                                     g_shelf_max_merch = Shelf.MaxMerch;
//                                     g_shelf_basket_spread = Shelf.BsktSpreadProduct;
//                                     g_shelf_edit_flag = "Y";
//                                     g_wireframe_id = Shelf.WFrameID;
//                                     g_shelf_object_type = Shelf.ObjType;
//                                     comp_obj_id = Shelf.CompShelfObjID;
//                                     g_rotation = Shelf.Rotation;
//                                     if (Shelf.Slope > 0) {
//                                         g_slope = 0 - Shelf.Slope;
//                                     } else if (Shelf.Slope < 0) {
//                                         g_slope = -Shelf.Slope;
//                                     } else {
//                                         g_slope = 0;
//                                     }
//                                     return false;
//                                 } else {
//                                     g_shelf_edit_flag = "N";
//                                 }
//                             } else {
//                                 if (Shelf.CompShelfObjID == g_objectHit_id) {
//                                     g_module_index = j;
//                                     g_shelf_index = i;
//                                     g_shelf_max_merch = Shelf.MaxMerch;
//                                     g_shelf_edit_flag = "Y";
//                                     g_wireframe_id = Shelf.WFrameID;
//                                     g_shelf_object_type = Shelf.ObjType;
//                                     g_shelf_basket_spread = Shelf.BsktSpreadProduct;
//                                     g_rotation = Shelf.Rotation;
//                                     comp_obj_id = Shelf.SObjID;
//                                     if (Shelf.Slope > 0) {
//                                         g_slope = 0 - Shelf.Slope;
//                                     } else if (Shelf.Slope < 0) {
//                                         g_slope = -Shelf.Slope;
//                                     } else {
//                                         g_slope = 0;
//                                     }
//                                     return false;
//                                 } else {
//                                     g_shelf_edit_flag = "N";
//                                 }
//                             }
//                         }
//                     });
//                 }
//                 j++;
//             }
//         }
//         if (g_shelf_edit_flag == "N" && g_module_edit_flag == "N" && g_carpark_edit_flag == "N") {
//             var k = 0;
//             for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
//                 if (g_item_edit_flag == "Y") {
//                     break; //return false;
//                 }
//                 if (Modules.ParentModule == null) {
//                     if (typeof Modules.Carpark !== "undefined" && typeof Modules.Carpark[0] !== "undefined" && Modules.Carpark.length > 0) {
//                         if (Modules.Carpark[0].ItemInfo.length > 0) {
//                             var j = 0;
//                             for (const items of Modules.Carpark[0].ItemInfo) {
//                                 if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET") {
//                                     //ASA-1085
//                                     if (items.ObjID == g_objectHit_id) {
//                                         g_module_index = k;
//                                         g_shelf_index = 0;
//                                         g_item_index = j;
//                                         g_item_edit_flag = "Y";
//                                         g_shelf_object_type = Modules.Carpark[0].ObjType;
//                                         g_wireframe_id = items.WFrameID;
//                                         comp_obj_id = items.CompItemObjID;
//                                         g_carpark_item_flag = "Y";
//                                         break; //return false;
//                                     } else {
//                                         g_item_edit_flag = "N";
//                                     }
//                                 } else {
//                                     if (items.ObjID == g_objectHit_id) {
//                                         g_module_index = k;
//                                         g_shelf_index = 0;
//                                         g_item_index = j;
//                                         g_item_edit_flag = "Y";
//                                         g_shelf_object_type = Modules.Carpark[0].ObjType;
//                                         g_wireframe_id = items.WFrameID;
//                                         comp_obj_id = items.ObjID;
//                                         g_carpark_item_flag = "Y";
//                                         break; //return false;
//                                     } else {
//                                         g_item_edit_flag = "N";
//                                     }
//                                 }
//                                 j++;
//                             }
//                         }
//                     }
//                     var i = 0;
//                     for (const Shelf of Modules.ShelfInfo) {
//                         if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
//                             if (g_item_edit_flag == "Y") {
//                                 break; //return false;
//                             }
//                             var j = 0;
//                             for (const items of Shelf.ItemInfo) {
//                                 if (g_taskItemInContext || g_compare_view == "POG" || g_compare_view == "EDIT_PALLET" || g_compare_view == "PREV_VERSION") {
//                                     //ASA-1085
//                                     if (items.ObjID == g_objectHit_id) {
//                                         g_module_index = k;
//                                         g_shelf_index = i;
//                                         g_item_index = j;
//                                         g_item_edit_flag = "Y";
//                                         g_shelf_object_type = Shelf.ObjType;
//                                         g_wireframe_id = items.WFrameID;
//                                         comp_obj_id = items.CompItemObjID;
//                                         break; //return false;
//                                     } else {
//                                         g_item_edit_flag = "N";
//                                     }
//                                 } else {
//                                     if (items.CompItemObjID == g_objectHit_id) {
//                                         g_module_index = k;
//                                         g_shelf_index = i;
//                                         g_item_index = j;
//                                         g_item_edit_flag = "Y";
//                                         comp_obj_id = items.ObjID;
//                                         g_shelf_object_type = Shelf.ObjType;
//                                         g_wireframe_id = items.WFrameID;
//                                         break; //return false;
//                                     } else {
//                                         g_item_edit_flag = "N";
//                                     }
//                                 }
//                                 j++;
//                             }
//                         }
//                         i++;
//                     }
//                 }
//                 k++;
//             }
//         }
//         //Note: we always populate g_delete_details with even single click to maintain the common behaviour.
//         if (p_multiSelect == "N" && p_multiCopydone == "N") {
//             // Task 21828
//             g_delete_details = [];
//             var Module = g_pog_json[p_pog_index].ModuleInfo[g_module_index];
//             if (g_shelf_index !== -1 && g_item_index == -1 && g_carpark_item_flag == "N") {
//                 var Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
//                 var details = {};
//                 details["ObjID"] = Shelf.SObjID;
//                 details["MIndex"] = g_module_index;
//                 details["SIndex"] = g_shelf_index;
//                 details["ObjWidth"] = Shelf.W;
//                 details["ObjHeight"] = Shelf.H;
//                 details["XAxis"] = Shelf.X;
//                 details["YAxis"] = Shelf.Y;
//                 details["ZAxis"] = Shelf.Z;
//                 details["IIndex"] = -1;
//                 details["ObjType"] = Shelf.ObjType;
//                 details["IsDivider"] = "N";
//                 details["Object"] = "SHELF";
//                 details["MObjID"] = Module.MObjID;
//                 details["SObjID"] = Shelf.SObjID;
//                 details["ItemID"] = Shelf.Shelf; //ASA-1471 issue 1
//                 details["Item"] = "";
//                 details["Exists"] = "N";
//                 details["Rotation"] = Shelf.Rotation;
//                 details["Slope"] = Shelf.Slope;
//                 details["Distance"] = 0;
//                 details["TopObjID"] = "";
//                 details["BottomObjID"] = "";
//                 details["StartCanvas"] = g_start_canvas;
//                 details["g_present_canvas"] = g_present_canvas;
//                 details["p_pog_index"] = p_pog_index;
//                 //ASA-1471 issue 1 S
//                 details["W"] = Shelf.W;
//                 details["H"] = Shelf.H;
//                 details["D"] = Shelf.D;
//                 details["AllowAutoCrush"] = Shelf.AllowAutoCrush;
//                 details["Rotation"] = Shelf.Rotation;
//                 details["Slope"] = Shelf.Slope;
//                 details["Color"] = Shelf.Color;
//                 details["Combine"] = Shelf.Combine;
//                 details["LOverhang"] = Shelf.LOverhang;
//                 details["ROverhang"] = Shelf.ROverhang;
//                 details["DivHeight"] = typeof Shelf.DivHeight == "undefined" ? 0 : Shelf.DivHeight;
//                 details["DivWidth"] = typeof Shelf.DivWidth == "undefined" ? 0 : Shelf.DivWidth;
//                 details["DivPst"] = typeof Shelf.DivPst == "undefined" ? "N" : Shelf.DivPst;
//                 details["DivPed"] = typeof Shelf.DivPed == "undefined" ? "N" : Shelf.DivPed;
//                 details["DivPbtwFace"] = typeof Shelf.DivPbtwFace == "undefined" ? "N" : Shelf.DivPbtwFace;
//                 details["NoDivIDShow"] = Shelf.NoDivIDShow;
//                 details["DivFillCol"] = typeof Shelf.DivFillCol == "undefined" ? "#3D393D" : Shelf.DivFillCol;
//                 details["SpreadItem"] = Shelf.SpreadItem;
//                 details["MaxMerch"] = Shelf.MaxMerch;
//                 //ASA-1471 issue 1 E
//                 //ASA-1669 Start
//                 details["FBold"] = Shelf.FBold;
//                 details["FSize"] = Shelf.FSize;
//                 details["FStyle"] = Shelf.FStyle;
//                 details["InputText"] = Shelf.InputText;
//                 details["TextImg"] = Shelf.TextImg;
//                 details["TextImgMime"] = Shelf.TextImgMime;
//                 details["TextImgName"] = Shelf.TextImgName;
//                 details["ReduceToFit"] = Shelf.ReduceToFit;
//                 details["TextDirection"] = Shelf.TextDirection;
//                 details["WrapText"] = Shelf.WrapText;
//                 //ASA-1669 End
//                 g_delete_details.multi_delete_shelf_ind = "";
//                 g_delete_details.push(details);
//             } else if (g_shelf_index !== -1 && g_item_index !== -1 && g_carpark_item_flag == "N") {
//                 var Shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
//                 var Item = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
//                 var details = {};
//                 var is_divider = "N";
//                 var object = "ITEM";
//                 if (Item.Item == "DIVIDER") {
//                     is_divider = "Y";
//                     object = "SHELF";
//                 }
//                 details["ObjID"] = Item.ObjID;
//                 details["MIndex"] = g_module_index;
//                 details["SIndex"] = g_shelf_index;
//                 details["ObjWidth"] = Item.W;
//                 details["ObjHeight"] = Item.H;
//                 details["XAxis"] = Item.X;
//                 details["YAxis"] = Item.Y;
//                 details["ZAxis"] = Item.Z;
//                 details["IIndex"] = g_item_index;
//                 details["ObjType"] = Shelf.ObjType;
//                 details["IsDivider"] = is_divider;
//                 details["Object"] = object;
//                 details["MObjID"] = Module.MObjID;
//                 details["SObjID"] = Shelf.SObjID;
//                 details["ItemID"] = Item.ItemID;
//                 details["Item"] = Item.Item;
//                 details["W"] = Item.W;
//                 details["H"] = Item.H;
//                 details["X"] = Item.X;
//                 details["Y"] = Item.Y;
//                 details["Exists"] = "N";
//                 details["Rotation"] = 0;
//                 details["Slope"] = 0;
//                 details["Distance"] = Item.Distance;
//                 details["TopObjID"] = Item.TopObjID;
//                 details["BottomObjID"] = Item.BottomObjID;
//                 details["StartCanvas"] = g_start_canvas;
//                 details["g_present_canvas"] = g_present_canvas;
//                 details["p_pog_index"] = p_pog_index;
//                 details["Color"] = Item.Color; //20240806
//                 //ASA-1471 issue 13 S
//                 if (Item.Item == "DIVIDER") {
//                     details["DivHeight"] = typeof Item.DivHeight == "undefined" ? 0 : Item.DivHeight;
//                     details["DivWidth"] = typeof Item.DivWidth == "undefined" ? 0 : Item.DivWidth;
//                     details["DivPst"] = typeof Item.DivPst == "undefined" ? "N" : Item.DivPst;
//                     details["DivPed"] = typeof Item.DivPed == "undefined" ? "N" : Item.DivPed;
//                     details["DivPbtwFace"] = typeof Item.DivPbtwFace == "undefined" ? "N" : Item.DivPbtwFace;
//                     details["NoDivIDShow"] = Item.NoDivIDShow;
//                     details["DivFillCol"] = typeof Item.DivFillCol == "undefined" ? "#3D393D" : Item.DivFillCol;
//                     details["LOverhang"] = 0;
//                     details["ROverhang"] = 0;
//                     details["MaxMerch"] = 0;
//                 }
//                 details["D"] = Item.D;
//                 //ASA-1471 issue 13 E
//                 g_delete_details.multi_delete_shelf_ind = "";
//                 g_delete_details.push(details);
//             } else if (g_shelf_index !== -1 && g_item_index !== -1 && g_carpark_item_flag == "Y") {
//                 var Carpark = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark;
//                 var Item = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark[0].ItemInfo[g_item_index];
//                 var details = {};
//                 details["ObjID"] = Item.ObjID;
//                 details["MIndex"] = g_module_index;
//                 details["SIndex"] = 0;
//                 details["ObjWidth"] = Item.W;
//                 details["ObjHeight"] = Item.H;
//                 details["XAxis"] = Item.X;
//                 details["YAxis"] = Item.Y;
//                 details["ZAxis"] = Item.Z;
//                 details["IIndex"] = g_item_index;
//                 details["ObjType"] = Carpark.ObjType;
//                 details["IsDivider"] = "N";
//                 details["Object"] = "CARPARK_ITEM";
//                 details["MObjID"] = Module.MObjID;
//                 details["SObjID"] = Carpark.SObjID;
//                 details["ItemID"] = Item.ItemID;
//                 details["Item"] = Item.Item;
//                 details["W"] = Item.W;
//                 details["H"] = Item.H;
//                 details["X"] = Item.X;
//                 details["Y"] = Item.Y;
//                 details["Exists"] = "N";
//                 details["Rotation"] = 0;
//                 details["Slope"] = 0;
//                 details["Distance"] = Item.Distance;
//                 details["TopObjID"] = Item.TopObjID;
//                 details["BottomObjID"] = Item.BottomObjID;
//                 details["IsCarpark"] = "Y";
//                 details["StartCanvas"] = g_start_canvas;
//                 details["g_present_canvas"] = g_present_canvas;
//                 details["p_pog_index"] = p_pog_index;
//                 details["Color"] = Item.Color; //20240806
//                 g_delete_details.multi_delete_shelf_ind = "";
//                 g_delete_details.multi_carpark_ind = "Y";
//                 g_delete_details.push(details);
//             }
//             g_delete_details.StartCanvas = g_start_canvas;
//             g_delete_details.g_present_canvas = g_present_canvas;
//             update_item_xy_distance("N", p_pog_index, p_a, p_y);
//         }

//         logDebug("function : get_object_identity", "E");
//     } catch (err) {
//         error_handling(err);
//     }
// }

async function setDefaultState(p_new_pog_ind) {
    g_module_obj_array = [];
    g_peg_holes_active = "Y";
    g_show_peg_tags = "N";
    g_draftPogInd = p_new_pog_ind == "Y" ? "D" : "E";
    var showItemLabel = $v("P193_POGCR_SHOW_DFLT_ITEM_LOC");
    var showItemDesc = $v("P193_POGCR_DFT_ITEM_DESC");
    var Showliveimage = $v("P193_POGCR_DFLT_LIVE_IMAGES");
    var Shownotchlabel = $v("P193_POGCR_DFT_NOTCH_LABEL");
    var Showfixellabel = $v("P193_POGCR_DFT_FIXEL_LABEL");
    var showDaysOfSupply = $v("P193_POGCR_DFT_DAYS_OF_SUPPLY");
    var fixel_avail_space = $v("P193_POGCR_DFLT_FIXEL_AVLSPACE_LBL");
    var auto_depth_class = $v("P193_POGCR_AUTO_DEPTH_CAL");
    g_auto_cal_depth_fac = auto_depth_class;
    //ASA-1138
    var overHungLabel = $v("P193_POGCR_DFT_OVERHUNG_LABEL");
    sessionStorage.setItem("g_show_item_desc", showItemDesc);
    g_show_fixel_label = Showfixellabel;
    g_show_item_label = showItemLabel;
    g_show_notch_label = Shownotchlabel;
    g_show_item_color = "N";
    g_show_item_desc = showItemDesc;
    g_show_live_image = Showliveimage;
    g_show_days_of_supply = showDaysOfSupply;
    g_show_fixel_space = fixel_avail_space;

    g_overhung_shelf_active = overHungLabel; //ASA-1138
    g_itemSubLabelInd = "N"; //ASA-1182
    g_itemSubLabel = ""; //ASA-1182
}


//Moved to Common JS - WPD page3.js
// async function switchCanvasView(p_view, p_product_list_check = "N") {
//     var containerH,
//         containerW,
//         renderFlag = "Y",
//         rowCount,
//         old_pogIndex = g_pog_index,
//         colCount;
//     rowCount = $("[data-row]").length;
//     colCount = $("[data-col]").length;
//     if ($(".a-Splitter-thumb").attr("title") == "Collapse") {
//         p_product_list_check = "Y";
//     }
//     // [Task_22091], Start
//     var drawRegW = $("#drawing_region").width();
//     var sidebarW = $("#side_bar").width();
//     containerW = drawRegW - sidebarW;
//     containerH = $("#canvas-holder .container").height();
//     $s("P193_POGCR_TILE_VIEW", p_view);
//     // [Task_22091], End
//     if (p_view == "H" && (($("#canvas-holder .container").hasClass("v-view") && p_product_list_check == "N") || p_product_list_check == "Y")) {
//         $("#canvas-holder .container").css("display", "flex").addClass("h-view").removeClass("v-view");
//         $(".viewH").addClass("view_active");
//         $(".viewV").removeClass("view_active");

//         for (var i = 1; i <= rowCount; i++) {
//             var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
//             $("[data-row=" + i + "] .canvas-content")
//                 .css("height", parseFloat((containerH / currColCOunt).toFixed(2)))
//                 .css("width", parseFloat((containerW / rowCount).toFixed(2)));
//         }
//     } else if (p_view == "V" && (($("#canvas-holder .container").hasClass("h-view") && p_product_list_check == "N") || p_product_list_check == "Y")) {
//         $("#canvas-holder .container").css("display", "grid").addClass("v-view").removeClass("h-view");
//         $(".viewV").addClass("view_active");
//         $(".viewH").removeClass("view_active");

//         for (var i = 1; i <= rowCount; i++) {
//             var currColCOunt = $("[data-row=" + i + "] [data-col]").length;
//             $("[data-row=" + i + "] .canvas-content")
//                 .css("height", parseFloat((containerH / rowCount).toFixed(2)))
//                 .css("width", parseFloat((containerW / currColCOunt).toFixed(2)));
//         }
//     } else {
//         renderFlag = "N";
//     }
//     if (renderFlag == "Y") {
//         if (g_pog_json.length > 0) {
//             //20240708 Regression issue 5
//             g_canvas_objects = [];
//             for (var i = 1; i <= g_pog_json.length; i++) {
//                 const pRenderer = g_renderer; //g_scene_objects[i - 1].renderer;
//                 const pScene = g_scene_objects[i - 1].scene;
//                 const pCamera = g_scene_objects[i - 1].scene.children.find((obj) => {
//                     return obj.type === "PerspectiveCamera";
//                 });
//                 var canvasName = "maincanvas" + (i == 1 ? "" : i);
//                 g_canvas = document.getElementById(canvasName);
//                 var canvasContainerH = $("#" + canvasName)
//                     .parent()
//                     .height();
//                 var canvasContainerW = $("#" + canvasName)
//                     .parent()
//                     .width();
//                 var canvasBtns = $("#" + canvasName + "-btns")[0];
//                 var canvasBtns_height = g_scene_objects.length > 1 ? canvasBtns.offsetHeight : 0;
//                 var canvasWidthOrg = canvasContainerW;
//                 var canvasHeightOrg = canvasContainerH - canvasBtns_height;

//                 $("#" + canvasName)
//                     .css("height", canvasHeightOrg + "px !important")
//                     .css("width", canvasWidthOrg + "px !important");
//                 $("#" + canvasName).height(canvasHeightOrg); //ASA-1107
//                 $("#" + canvasName).width(canvasWidthOrg); //ASA-1107

//                 g_canvas.width = canvasWidthOrg;
//                 g_canvas.height = canvasHeightOrg;
//                 g_canvas_objects.push($("#" + canvasName)[0]);

//                 var pTanFOV = Math.tan(((Math.PI / 180) * pCamera.fov) / 2);
//                 pCamera.aspect = canvasWidthOrg / canvasHeightOrg;
//                 pCamera.fov = (360 / Math.PI) * Math.atan(pTanFOV);
//                 pCamera.updateProjectionMatrix();
//                 pRenderer.setSize(canvasWidthOrg, canvasHeightOrg);
//                 var details = get_min_max_xy(i - 1);
//                 var details_arr = details.split("###");
//                 set_camera_z(pCamera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, i - 1);
//                 //pRenderer.render(pScene, pCamera);
//                 g_pog_index = i - 1;
//                 g_scene = pScene;
//                 g_camera = pCamera;
//                 render(i - 1);
//             }
//         } //20240708 Regression issue 5
//     }
//     g_pog_index = old_pogIndex;
// }


async function update_item_xy_distance(p_updateObj, p_pog_index, p_newx, p_newy) {
    new_details = JSON.parse(JSON.stringify(g_delete_details));

    for (const objects of new_details) {
        objects.ShelfInfo = "";
    }
    if (JsonContains(new_details, "Object", "SHELF")) {
        var i = 0;
        for (const objects of g_delete_details) {
            var retval = update_item_distance(objects.MIndex, objects.SIndex, g_pog_index);
            var xaxis = objects.XAxis;
            var yaxis = objects.YAxis;
            g_delete_details[i].XDistance = wpdSetFixed(xaxis - p_newx); //.toFixed(5)); //ASA-1343 issue 1 regression making consistent to make to_fixed only once or it will change the values when done 3 times.
            g_delete_details[i].YDistance = wpdSetFixed(yaxis - p_newy); //.toFixed(5)); //ASA-1343 issue 1 regression making consistent to make to_fixed only once or it will change the values when done 3 times.
            i = i + 1;
        }
    } else {
        var total_width = 0;
        var max_height = 0;
        for (const objects of g_delete_details) {
            total_width += objects.W;
            max_height = Math.max(max_height, objects.H);
        }
        i = 0;
        var next_end = 0;
        for (const objects of g_delete_details) {
            if (nvl(objects.BottomObjID) !== 0 || nvl(objects.TopObjID) !== 0) {
                var xaxis = objects.XAxis;
                var yaxis = objects.YAxis;
                g_delete_details[i].XDistance = wpdSetFixed(xaxis - p_newx); //.toFixed(5)); //ASA-1343 issue 1 regression making consistent to make to_fixed only once or it will change the values when done 3 times.
                g_delete_details[i].YDistance = wpdSetFixed(yaxis - p_newy); //.toFixed(5)); //ASA-1343 issue 1 regression making consistent to make to_fixed only once or it will change the values when done 3 times.
            } else {
                var xaxis,
                    yaxis,
                    add_no = 0;
                if (i == 0) {
                    xaxis = p_newx - total_width / 2;
                    next_end = xaxis + objects.W / 2;
                } else {
                    if (objects.ObjType == "PEGBOARD") {
                        // || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                        add_no = 0.01;
                    }
                    xaxis = next_end + objects.W / 2 + add_no;
                    next_end = xaxis + objects.W / 2;
                }
                //yaxis = y;
                var yaxis = objects.YAxis;
                g_delete_details[i].XDistance = wpdSetFixed(xaxis - p_newx); //.toFixed(5)); //ASA-1343 issue 1 regression making consistent to make to_fixed only once or it will change the values when done 3 times.
                g_delete_details[i].YDistance = objects.H / 2;
            }
            i = i + 1;
        }
    }
    //after setting the XDistance. find how many shelfs and how many individual items without shelf and separate them in 2 different array.
    if (p_updateObj == "Y") {
        for (const objects of g_delete_details) {
            if (typeof objects.IntoShelf == "undefined") {
                objects.IntoShelf = "N";
            }

            var l_present = false; //ASA-1361 20240501 -S
            for (const item of g_multi_drag_shelf_arr) {
                if (item.MIndex === objects.MIndex && item.SIndex === objects.SIndex) {
                    l_present = true;
                    break;
                }
            } //ASA-1361 20240501 -E
            if (objects.Object == "SHELF" && objects.IsDivider == "N" && !l_present) {
                //ASA-1361 20240501
                g_multi_drag_shelf_arr.push(objects);
                objects.IntoShelf = "Y";
                g_multi_drag_shelf_arr[g_multi_drag_shelf_arr.length - 1].ItemInfo = [];
                j = 0;
                for (const items of g_delete_details) {
                    if (objects.MIndex == items.MIndex && objects.SIndex == items.SIndex && items.Object !== "SHELF") {
                        items.IntoShelf = "Y";
                        var itemInfo = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex];
                        g_multi_drag_shelf_arr[g_multi_drag_shelf_arr.length - 1].ItemInfo.push(itemInfo);
                        //ASA-1410
                        if (g_delete_details.multi_carpark_ind == "Y") {
                            g_delete_details[j].ItemObj = [JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[items.MIndex].Carpark[items.SIndex].ItemInfo[items.IIndex]))];
                        } else {
                            g_delete_details[j].ItemObj = [JSON.parse(JSON.stringify(itemInfo))];
                        }
                    }
                    j = j + 1;
                }
            } else if (objects.IntoShelf == "N") {
                g_multi_drag_item_arr.push(objects);
                if (g_delete_details.multi_carpark_ind == "Y") {
                    g_multi_drag_item_arr[g_multi_drag_item_arr.length - 1].ItemObj = [JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[objects.SIndex].ItemInfo[objects.IIndex]))];
                } else {
                    g_multi_drag_item_arr[g_multi_drag_item_arr.length - 1].ItemObj = [JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex]))];
                }
            }
        }
    }
}


async function open_edit_modal_popup(p_object_ind, p_module_ind, p_shelf_ind, p_duplicate_fixel, p_pog_index, p_edit = "N") {
    logDebug("function : open_edit_modal_popup; object_ind : " + p_object_ind + "; module_ind : " + p_module_ind + "; shelf_ind : " + p_shelf_ind + "; duplicate_fixel : " + p_duplicate_fixel, "S");
    var is_divider = "N";
    if (g_carpark_item_flag == "Y") {
        is_divider = "N";
    } else if (p_object_ind == "I") {
        is_divider = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Item;
    }
    if (p_object_ind == "M") {
        if (typeof g_pog_json !== "undefined" && g_pog_json[p_pog_index].ModuleInfo.length > 0) {
            var mod_names = [];
            var i = 0;
            for (const Module of g_pog_json[p_pog_index].ModuleInfo) {
                if (g_module_index !== i) {
                    mod_names.push(Module.Module.toUpperCase());
                }
                i++;
            }
        }
        var edit_modulelist = [];
        var edit_moduledetails = {};

        edit_moduledetails["PogModule"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].Module;
        edit_moduledetails["ModuleName"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].POGModuleName;
        edit_moduledetails["Remarks"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].Remarks;
        edit_moduledetails["H"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].H * 100).toFixed(2);
        edit_moduledetails["W"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].W * 100).toFixed(2);
        edit_moduledetails["D"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].D * 100).toFixed(2);
        edit_moduledetails["Rotation"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].Rotation * 100).toFixed(2);
        edit_moduledetails["NotchW"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].NotchW * 100).toFixed(2);
        edit_moduledetails["NStart"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].NotchStart * 100).toFixed(2); //ASA-1268
        edit_moduledetails["Nspacing"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].NotchSpacing * 100).toFixed(2);
        edit_moduledetails["HorzStart"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].HorzStart * 100).toFixed(2);
        edit_moduledetails["HorzSpacing"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].HorzSpacing * 100).toFixed(2);
        edit_moduledetails["VertStart"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].VertStart * 100).toFixed(2);
        edit_moduledetails["VertSpacing"] = (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].VertSpacing * 100).toFixed(2);
        edit_moduledetails["AllowOvrelap"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].AllowOverlap;
        edit_moduledetails["LeftNotch"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].LNotch;
        edit_moduledetails["MBackBoard"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].Backboard;
        edit_moduledetails["RightNotch"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].RNotch;
        edit_moduledetails["LastCompCount"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].LastCount;
        edit_moduledetails["Division"] = g_pog_json[p_pog_index].Division;
        edit_moduledetails["Dept"] = g_pog_json[p_pog_index].Dept;
        edit_moduledetails["Subdept"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].SubDept;
        edit_moduledetails["Color"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].Color;
        edit_moduledetails["ModNames"] = mod_names;
        edit_moduledetails["Type"] = "E";
        edit_moduledetails["IsTemplate"] = g_is_pog_template_open; //ASA-1694 #17

        edit_modulelist.push(edit_moduledetails);
        sessionStorage.setItem("modulelist", JSON.stringify(edit_modulelist));
        $s("P193_MODULE_EDIT_IND", "Y");

        openCustomDialog("create_module", $v("P193_CREATE_MODAL_URL"), "P193_MODALPOG_TRIGGER");
        g_temp_POG_arr = JSON.stringify(g_pog_json);
        apex.item("P193_MODULE_NAME").setFocus();
        $("#DELETE_MODULE").css("display", "inline");
    } else if (p_object_ind == "S") {
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ObjType == "TEXTBOX") {
            $s("P193_OBJECT_TYPE", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ObjType);
            $s("P193_TEXT_NAME", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Desc);
            $s("P193_TEXT_HEIGHT", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].H * 100).toFixed(2));
            $s("P193_TEXT_WIDTH", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].W * 100).toFixed(2));
            $s("P193_TEXT_ROTATION", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Rotation);
            $s("P193_TEXT_SLOPE", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Slope);
            $s("P193_TEXT_COLOR", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Color);
            $s("P193_TEXT", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].InputText);
            $s("P193_WRAP_TEXT", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].WrapText);
            $s("P193_REDUCETOFIT", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ReduceToFit);
            $s("P193_FONT_STYLE", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].FStyle);
            $s("P193_FONT_SIZE", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].FSize);
            $s("P193_BOLD", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].FBold);

            apex.item("P193_TEXT_NAME").setFocus();
            if (p_duplicate_fixel == "N") {
                $s("P193_TEXT_ID", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Shelf);
                $s("P193_SHELF_EDIT_IND", "Y");
                $("#DELETE_TEXT").css("display", "inline");
            } else {
                $s("P193_TEXT_ID", "");
                $s("P193_SHELF_EDIT_IND", "N");
            }
            g_temp_image_arr = [];

            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].TextImg !== "") {
                var temp_image = {};
                temp_image["FileName"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].TextImgName; //ASA-1650 issue 10
                temp_image["MimeType"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].TextImgMime; //ASA-1650 issue 10
                temp_image["Image"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].TextImg;
                g_temp_image_arr.push(temp_image);
                if (g_temp_image_arr.length > 0) {
                    var image = new Image();
                    image.src = "data:image/png;base64," + g_temp_image_arr[0].Image;
                    image.onload = function () {
                        const canvas = document.createElement("canvas");
                        canvas.width = 500;
                        canvas.height = 100;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(image, 0, 0, 500, 100);
                        $("#VIEW_IMAGE canvas").remove();
                        document.getElementById("VIEW_IMAGE").append(canvas);
                    };
                }
            } else {
                $s("P193_IMG_FILENAME", "");
                $("#IMAGE_AREA canvas").remove();
                $("#VIEW_IMAGE canvas").remove();
            }
            //ASA-1669 Start
            const warPageItem = ["P193_TEXT_WIDTH", "P193_TEXT_HEIGHT", "P193_TEXT_COLOR", "P193_TEXT_SLOPE", "P193_TEXT_ROTATION", "P193_FONT_STYLE", "P193_FONT_SIZE", "P193_BOLD", "P193_TEXT", "P193_WRAP_TEXT", "P193_REDUCETOFIT", "P193_IMG_FILENAME"];
            for (const pageItem of warPageItem) {
                $("#" + pageItem + "_CONTAINER .inc_tag_icon").remove();
                $("#" + pageItem).removeClass("apex-item-has-icon");
                $("#" + pageItem + "_CONTAINER").removeClass("apex-item-wrapper--has-icon");
            }
            //ASA-1669 End
            //ASA-1726 Start
            if ($("#P193_TEXT_ID, #P193_TEXT_NAME").hasClass("apex_disabled")) {
                $("#P193_TEXT_ID, #P193_TEXT_NAME").removeClass("apex_disabled");
            }
            //ASA-1726 End
            openInlineDialog("add_textbox", 75, 85);
        } else {
            if (p_duplicate_fixel == "N") {
                $s("P193_SHELF_EDIT_IND", "Y");
            } else {
                $s("P193_SHELF_EDIT_IND", "N");
            }
            var shlf_names = [];
            if (typeof g_pog_json !== "undefined" && g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length > 0) {
                var i = 0;
                for (const Shelf of g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo) {
                    if (g_shelf_index !== i) {
                        shlf_names.push(Shelf.Shelf.toUpperCase().trim());
                    }
                    i++;
                }
            }
            var shelf_arr = [];
            var shelf_dtl = {};
            shelf_dtl["Allowcrush"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].AllowAutoCrush;
            shelf_dtl["Module"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
            shelf_dtl["ShelfLen"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length;
            shelf_dtl["ModW"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].W;
            shelf_dtl["ModH"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].H;
            shelf_dtl["ModD"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].D;
            shelf_dtl["ModX"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X;
            shelf_dtl["POGLen"] = g_pog_json.length;
            shelf_dtl["POGCode"] = g_pog_json[p_pog_index].POGCode;
            typeof g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ManualCrush == "undefined" || g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ManualCrush == "" ? $v("P193_POGCR_MANUAL_CRUSH_ITEM") : g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ManualCrush; //ASA-1300
            shelf_dtl["ShelfInfo"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
            shelf_dtl["module_index"] = p_module_ind;
            shelf_dtl["shelf_index"] = p_shelf_ind;
            shelf_dtl["duplicate_fixel"] = p_duplicate_fixel;
            shelf_dtl["mod_disp_ind"] = $v("P193_MODULE_DISP");
            shelf_dtl["edited_ind"] = $v("P193_SHELF_EDIT_IND");
            shelf_dtl["g_duplicating"] = g_duplicating;
            shelf_dtl["g_item_edit_flag"] = g_item_edit_flag;
            //ASA-1272
            shelf_dtl["delete_details"] = g_delete_details; //ASA-1272
            shelf_dtl["g_overhung_shelf_active"] = g_overhung_shelf_active;
            shelf_dtl["g_multiselect"] = g_multiselect;
            shelf_dtl["object_type"] = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ObjType;
            shelf_dtl["ShlfNames"] = shlf_names;
            shelf_dtl["dividerchecked"] = g_default_checkbox; //ASA-1265
            shelf_arr.push(shelf_dtl);
            sessionStorage.setItem("shelf_arr", JSON.stringify(shelf_arr));
            openCustomDialog("SHELF_EDIT", $v("P193_SHELF_URL"), "P193_SHELF_TRIGGER_ELEMENT");
        }
    } else if (p_object_ind == "I" && is_divider !== "DIVIDER") {
        var l_items_details = {};
        var l_max_merch = 0; //ASA-1418
        if (g_carpark_item_flag == "Y") {
            l_items_details = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].Carpark[0].ItemInfo[g_item_index]));
            l_max_merch = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].H; //ASA-1418
        } else {
            l_items_details = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index]));
            l_max_merch = get_max_merch(p_module_ind, p_shelf_ind, g_item_index, "N", -1, p_pog_index); //ASA-1418
        }

        var shelf_detail = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind]));
        shelf_detail.ItemInfo = "";
        l_items_details.ItemInfo = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo;
        l_items_details.MIndex = g_module_index;
        l_items_details.SIndex = g_shelf_index;
        l_items_details.IIndex = g_item_index;
        l_items_details.ShelfInfo = [shelf_detail];
        l_items_details.Maxmerch = l_max_merch;
        l_items_details.PIndex = p_pog_index; //ASA-1307
        l_items_details.ShelfAutoCrush = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].AllowAutoCrush;
        l_items_details.g_combinedShelfs = g_combinedShelfs; //ASA-1307
        l_items_details.g_multiselect = g_multiselect;
        l_items_details.g_ctrl_select = g_ctrl_select;
        l_items_details.g_carpark_item_flag = g_carpark_item_flag;
        var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(l_items_details.Orientation, l_items_details.OW, l_items_details.OH, l_items_details.OD);

        var Orientdetails = g_orientation_json[l_items_details.Orientation];
        l_items_details.item_width = item_width;
        l_items_details.item_height = item_height;
        l_items_details.item_depth = item_depth;
        l_items_details.actualHeight = actualHeight;
        l_items_details.actualWidth = actualWidth;
        l_items_details.actualDepth = actualDepth;
        l_items_details.Orientdetails = Orientdetails;
        l_items_details.Shelf = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Shelf;
        l_items_details.ObjType = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ObjType;
        l_items_details.BsktFill = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].BsktFill;
        l_items_details.Combine = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Combine;
        if (g_carpark_item_flag == "N") {
            //regression issue 13
            l_items_details.UnitperCase = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].UnitperCase;
            l_items_details.UnitperTray = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].UnitperTray;
            l_items_details.CapDepthChanged = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].CapDepthChanged; //ASA-1273
        }
        l_items_details.g_overhung_shelf_active = g_overhung_shelf_active; //ASA-1284
        l_items_details.g_auto_cal_depth_fac = g_auto_cal_depth_fac; //ASA-1284
        sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
        openCustomDialog("OPEN_", $v("P193_PRODUCT_DETAILS_URL"), "P193_PRODUCT_DETAILS_TRIGGER");

        logDebug("function : item region image loading", "E");
    } else if (p_object_ind == "I" && is_divider == "DIVIDER") {
        $s("P193_OBJECT_TYPE", "DIVIDER");
        $s("P193_DIVIDER_NAME", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Desc);
        $s("P193_DIV_HEIGHT", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].H * 100).toFixed(2));
        $s("P193_DIV_WIDTH", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].W * 100).toFixed(2));
        $s("P193_DIV_DEPTH", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].D * 100).toFixed(2));
        $s("P193_DIV_ROTATION", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Rotation);
        $s("P193_DIV_COLOR", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Color);
        $s("P193_DIVIDER_FIXED", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Fixed);
        $s("P193_SLOT_DIVIDER", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].SlotDivider);
        $s("P193_SLOT_ORIENTATION", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Orientation);

        if (p_duplicate_fixel == "N") {
            $s("P193_DIVIDER_ID", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].ItemID);
            $s("P193_ITEM_EDIT_IND", "Y");
            $("#DELETE_DIVIDER").css("display", "inline");
        } else {
            $s("P193_DIVIDER_ID", g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1));
            $s("P193_ITEM_EDIT_IND", "N");
        }
        apex.item("P193_DIVIDER_NAME").setFocus();

        openInlineDialog("add_divider", 75, 85);
    } else if (p_object_ind == "B") {
        open_pog_modal("edit_pog", p_pog_index, p_edit);
        $s("P193_MODULE_DISP", "");
    }
    logDebug("function : open_edit_modal_popup", "E");
}

async function onload_create_pog() {
    logDebug("function : onload_create_pog; ", "S");
    sessionStorage.setItem("P193_EXISTING_DRAFT_VER", sessionStorage.getItem("P193_EXISTING_DRAFT_VER"));
    sessionStorage.setItem("P193_DRAFT_LIST", sessionStorage.getItem("P193_DRAFT_LIST"));
    sessionStorage.setItem("P193_POG_DESCRIPTION", sessionStorage.getItem("P193_POG_DESCRIPTION"));
    var POG_DATA = LZString.decompress(sessionStorage.getItem("POGJSON"));
    g_ItemImages = sessionStorage.getItem("g_ItemImages") !== null ? JSON.parse(sessionStorage.getItem("g_ItemImages")) : [];
    g_scene_objects_backup = sessionStorage.getItem("scene_objects_backup") !== null ? JSON.parse(LZString.decompress(sessionStorage.getItem("scene_objects_backup"))) : [];
    g_pogjson_backup = sessionStorage.getItem("pogjson_backup") !== null ? JSON.parse(LZString.decompress(sessionStorage.getItem("pogjson_backup"))) : [];
    generateCanvasListHolder(g_pogjson_backup);

    if (POG_DATA !== "" && POG_DATA !== null) {
        try {
            g_pog_json = JSON.parse(POG_DATA);
        } catch (err) {
            console.log(err);
        }
    }
    sessionStorage.removeItem("POGJSON");
    sessionStorage.removeItem("g_ItemImages");
    var p = apex.server.process(
        "GET_JSON_FROM_COLL", {
        pageItems: ["P1_ID_COLUMN"],
    }, {
        dataType: "html",
        loadingIndicatorPosition: "page",
    });
    p.done(function (data) {
        if ($.trim(data) !== "" || (typeof g_pog_json !== "undefined" && g_pog_json.length > 0)) {
            g_show_fixel_label = sessionStorage.getItem("g_show_fixel_label");
            g_show_item_label = sessionStorage.getItem("g_show_item_label") == "" || sessionStorage.getItem("g_show_item_label") == null ? "Y" : sessionStorage.getItem("g_show_item_label");
            g_show_notch_label = sessionStorage.getItem("g_show_notch_label");
            g_show_live_image = sessionStorage.getItem("g_show_live_image");
            g_show_max_merch = sessionStorage.getItem("g_show_max_merch");
            g_show_item_desc = sessionStorage.getItem("g_show_item_desc") == "" || sessionStorage.getItem("g_show_item_desc") == null ? "N" : sessionStorage.getItem("g_show_item_desc");
            g_show_fixel_space = sessionStorage.getItem("g_show_fixel_space") == "" || sessionStorage.getItem("g_show_fixel_space") == null ? "N" : sessionStorage.getItem("g_show_fixel_space");
            g_max_facing_enabled = sessionStorage.getItem("g_max_facing_enabled");
            g_show_item_color = sessionStorage.getItem("g_show_item_color") == "" || sessionStorage.getItem("g_show_item_color") == null ? "N" : sessionStorage.getItem("g_show_item_color");
            g_show_days_of_supply = sessionStorage.getItem("g_show_days_of_supply");
            g_ComViewIndex = parseInt(sessionStorage.getItem("g_ComViewIndex"));
            g_ComBaseIndex = parseInt(sessionStorage.getItem("g_ComBaseIndex"));
            g_compare_view = sessionStorage.getItem("g_compare_view");
            g_compare_pog_flag = sessionStorage.getItem("g_compare_pog_flag");
            g_pog_index = sessionStorage.getItem("g_pog_index") !== null ? parseInt(sessionStorage.getItem("g_pog_index")) : 0;
            g_edit_pallet_mod_ind = sessionStorage.getItem("g_edit_pallet_mod_ind") !== null ? parseInt(sessionStorage.getItem("g_edit_pallet_mod_ind")) : -1;
            g_edit_pallet_shelf_ind = sessionStorage.getItem("g_edit_pallet_shelf_ind") !== null ? parseInt(sessionStorage.getItem("g_edit_pallet_shelf_ind")) : -1;
            g_overhung_shelf_active = sessionStorage.getItem("g_overhung_shelf_active") !== null ? sessionStorage.getItem("g_overhung_shelf_active") : "N"; //ASA-1138
            g_itemSubLabelInd = sessionStorage.getItem("g_itemSubLabelInd") !== null ? sessionStorage.getItem("g_itemSubLabelInd") : "N"; //ASA-1182
            g_itemSubLabel = sessionStorage.getItem("g_itemSubLabel") !== null ? sessionStorage.getItem("g_itemSubLabel") : ""; //ASA-1182

            //ASA-1129, Start
            g_combinedShelfs = sessionStorage.getItem("g_combinedShelfs") !== null ? JSON.parse(sessionStorage.getItem("g_combinedShelfs")) : [];
            sessionGetCombineDetails();
            //ASA-1129, End

            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                g_json = g_pog_json;
            }

            g_pog_json_data = JSON.parse(JSON.stringify(g_json));
            g_module_obj_array = [];
            $(".live_image").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
            $(".open_pdf").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
            async function doSomething() {
                if ($v("P193_ERROR_FLAG") == "") {
                    // raise_error("&IMP_FAILURE_ERROR_MSG.");
                    //identify if any change in POG
                    pog_edited_ind = "Y";
                    // var returnval = await save_pog_to_json(g_pog_json);
                    apex.navigation.redirect("f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=DOWNLOAD_ERROR_TMPL");

                    if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
                        g_pog_json_data.splice(g_ComViewIndex, 1);
                    }
                    g_pog_json = [];

                    addLoadingIndicator();
                    var retval = await create_all_pog_onload(g_pog_json_data);
                    removeLoadingIndicator(regionloadWait);

                    if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
                        await edit_pallet("Y", g_edit_pallet_mod_ind, g_edit_pallet_shelf_ind, g_ComBaseIndex, "Y");
                    }

                    g_pog_json_data = [];
                    removeParam("");
                    $s("P193_ERROR_FLAG", "");
                } else if ($v("P193_UPLD_ID") !== "") {
                    removeParam("");
                    var p = apex.server.process(
                        "GET_ITEM_JSON", {
                        pageItems: ["P1_ID_COLUMN"],
                    }, {
                        dataType: "html",
                    });
                    p.done(function (data) {
                        if ($.trim(data) !== "") {
                            try {
                                ItemJSON = JSON.parse($.trim(data));
                                g_pog_index = sessionStorage.getItem("export_index") !== null ? parseInt(sessionStorage.getItem("export_index")) : 0;

                                async function doSomething() {
                                    appendMultiCanvasRowCol(g_pog_json.length, $v("P193_POGCR_TILE_VIEW"));
                                    g_multi_pog_json = [];
                                    g_canvas_objects = [];
                                    for (var p = 0; p <= g_pog_json.length - 1; p++) {
                                        init(p);
                                        objects = {};
                                        objects["scene"] = g_scene;
                                        objects["renderer"] = g_renderer;
                                        g_scene_objects.push(objects);
                                        set_indicator_objects(p);
                                        var canvas_id = g_canvas_objects[p].getAttribute("id");
                                        $("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + g_pog_json[p].POGCode + "</span>");
                                        if (typeof g_scene_objects[p].Indicators !== "undefined") {
                                            g_show_fixel_label = g_scene_objects[p].Indicators.FixelLabel;
                                            g_show_item_label = g_scene_objects[p].Indicators.ItemLabel;
                                            g_show_notch_label = g_scene_objects[p].Indicators.NotchLabel;
                                            g_show_max_merch = g_scene_objects[p].Indicators.MaxMerch;
                                            g_show_item_color = g_scene_objects[p].Indicators.ItemColor;
                                            g_show_item_desc = g_scene_objects[p].Indicators.ItemDesc;
                                            g_show_live_image = g_scene_objects[p].Indicators.LiveImage;
                                            g_show_days_of_supply = g_scene_objects[p].Indicators.DaysOfSupply;
                                            g_overhung_shelf_active = g_scene_objects[p].Indicators.OverhungShelf; //ASA-1138
                                            g_itemSubLabelInd = g_scene_objects[p].Indicators.ItemSubLabelInd; //ASA-1182
                                            g_itemSubLabel = g_scene_objects[p].Indicators.ItemSubLabel; //ASA-1182
                                        }

                                        g_all_pog_flag = "N";
                                    }
                                    if (ItemJSON.length > 0) {
                                        var returnval = await item_upld_create(ItemJSON, g_pog_index);
                                        if (returnval == "FAIL") {
                                            apex.navigation.redirect("f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=DOWNLOAD_ERROR_TMPL");
                                        }
                                    }
                                    //identify if any change in POG
                                    pog_edited_ind = "Y";
                                    if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
                                        g_pog_json.splice(g_ComViewIndex, 1);
                                    }

                                    var returnval = await save_pog_to_json(g_pog_json);
                                    // addLoadingIndicator(); //ASA-1500
                                    var POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
                                    if (POG_JSON.length > 1) {
                                        $("#pog_list_btn").css("display", "block");
                                        $("#chng_view_btn").css("display", "block");
                                        $(".add_pog").css("display", "block");
                                        $(".open_par").css("display", "block"); //ASA-1587
                                    }
                                    g_pog_json = [];
                                    for (var p = 0; p <= POG_JSON.length - 1; p++) {
                                        if (typeof g_scene_objects[p].Indicators !== "undefined") {
                                            g_show_fixel_label = g_scene_objects[p].Indicators.FixelLabel;
                                            g_show_item_label = g_scene_objects[p].Indicators.ItemLabel;
                                            g_show_notch_label = g_scene_objects[p].Indicators.NotchLabel;
                                            g_show_max_merch = g_scene_objects[p].Indicators.MaxMerch;
                                            g_show_item_color = g_scene_objects[p].Indicators.ItemColor;
                                            g_show_item_desc = g_scene_objects[p].Indicators.ItemDesc;
                                            g_show_live_image = g_scene_objects[p].Indicators.LiveImage;
                                            g_show_days_of_supply = g_scene_objects[p].Indicators.DaysOfSupply;
                                            g_overhung_shelf_active = g_scene_objects[p].Indicators.OverhungShelf; //ASA-1138
                                            g_itemSubLabelInd = g_scene_objects[p].Indicators.ItemSubLabelInd; //ASA-1182
                                            g_itemSubLabel = g_scene_objects[p].Indicators.ItemSubLabel; //ASA-1182
                                        }
                                        g_pog_index = p;
                                        g_world = g_scene_objects[p].scene.children[2];
                                        g_camera = g_scene_objects[p].scene.children[0];
                                        g_scene = g_scene_objects[p].scene;
                                        set_indicator_objects(p);
                                        var return_val = await create_module_from_json(POG_JSON, "T", "F", $v("P193_PRODUCT_BTN_CLICK"), "N", "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
                                        render(p);
                                    }
                                    var retval = await render_all_pog();
                                    g_pog_json = g_multi_pog_json;
                                    for (var p = 0; p <= g_pog_json.length - 1; p++) {
                                        if (p > 0) {
                                            var res = await enableDisableFlags(p);
                                        }
                                    }
                                    if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
                                        await edit_pallet("Y", g_edit_pallet_mod_ind, g_edit_pallet_shelf_ind, g_ComBaseIndex, "Y");
                                    }
                                    // removeLoadingIndicator(regionloadWait); //ASA-1500
                                    $(".open_product").css("display", "block");
                                    $s("P193_UPLD_ID", "");
                                }
                                doSomething();
                                apex.message.showPageSuccess(get_message("SUCCESS_MSG"));
                            } catch {
                                raise_error($.trim(data));
                            }
                        } else {
                            raise_error(get_message("POGCR_NO_ITEM_ERR"));
                            var POG_JSON = [];

                            var create_json = "Y";
                            if (typeof g_pog_json[g_pog_index] !== "undefined" && g_pog_json.length > 0) {
                                POG_JSON = g_pog_json;
                                create_json = "N";
                            } else {
                                POG_JSON = g_pog_json_data;
                            }
                            g_pog_json = [];
                            if (typeof POG_JSON[g_pog_index] !== "undefined" && POG_JSON.length > 0) {
                                async function doSomething() {
                                    if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
                                        POG_JSON.splice(g_ComViewIndex, 1);
                                    }
                                    addLoadingIndicator();
                                    var retval = await create_all_pog_onload(POG_JSON);
                                    removeLoadingIndicator(regionloadWait);

                                    if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
                                        await edit_pallet("Y", g_edit_pallet_mod_ind, g_edit_pallet_shelf_ind, g_ComBaseIndex, "Y");
                                    }
                                }
                                doSomething();
                            }
                            g_pog_json_data = [];
                        }
                        if (apex.region("draggable_table") !== null) {
                            apex.region("draggable_table").refresh();
                        }
                    });
                } else {
                    if (sessionStorage.getItem("POGExists") == "Y" && $v("P193_NEW_SESSION") == "N") {
                        if (typeof g_pog_json[g_pog_index] !== "undefined" && g_pog_json.length > 0) {
                            POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
                            create_json = "N";
                        } else {
                            POG_JSON = JSON.parse(JSON.stringify(g_pog_json_data));
                        }
                        if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
                            POG_JSON.splice(g_ComViewIndex, 1);
                            g_pog_json.splice(g_ComViewIndex, 1);
                        }
                        g_pog_json = [];

                        addLoadingIndicator();
                        var retval = await create_all_pog_onload(POG_JSON);
                        removeLoadingIndicator(regionloadWait);

                        if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
                            await edit_pallet("Y", g_edit_pallet_mod_ind, g_edit_pallet_shelf_ind, g_ComBaseIndex, "Y");
                        }
                        if (g_pog_json.length > 1) {
                            animate_all_pog();
                        }
                    }
                }
                generateMultiPogDropdown();
                //ASA-1446
                /*if ($v("P193_ITEM_REGMOV_ERR") == "N") {
                await saveImportItems();
                }*/
                if (g_show_live_image == "Y") {
                    animate_all_pog();
                }
            }
            doSomething();
            g_dblclick_opened = "N";
        } else {
            if ($v("P193_OPEN_NEW_TAB") == "Y") {
                raise_error($v("P193_NEW_TAB_POG_CODE") + " - POG Details Not Found");
            }
        }
        logDebug("function : onload_create_pog; ", "E");
    });
}

function remove_param_on_load() {
    try {
        logDebug("function : remove_param_on_load ; ", "S");
        if ($v("P193_NEW_SESSION") == "Y") {
            g_pog_json = [];
            $s("P193_NEW_SESSION", "N");
            sessionStorage.removeItem("POGJSON");
            sessionStorage.removeItem("P193_EXISTING_DRAFT_VER");
            sessionStorage.removeItem("P193_DRAFT_LIST");
            sessionStorage.removeItem("P193_POG_DESCRIPTION");
        }
        sessionStorage.setItem("POGExists", "N");
        removeParam("P193_NEW_SESSION");
        logDebug("function : remove_param_on_load ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

// Moved to common -> WPD 3.js
// function generateCanvasListHolder(p_pog_json) {
// 	$("#canvas-list-holder").html("");
// 	if (p_pog_json.length > 0) {
// 		$("#canvas-list-holder").css({
// 			display: "flex",
// 			width: "auto",
// 		});
// 		$("#canvas-list-holder").append('<div class="canvas-holder-div"><span class="canvas-holder-code expand-tab" onclick="expandAllPog()">' + g_expand_all_pog + "</span></div>");

// 		for (i = 0; i < p_pog_json.length; i++) {
// 			console.log("generage", i);
// 			$("#canvas-list-holder").append('<div class="canvas-holder-div"><span class="canvas-holder-code">' + p_pog_json[i].POGCode + '</span><span class="fa fa-window-arrow-up canvas-expand" onClick=expandPog(' + i + ')></span><span class="fa fa-window-maximize canvas-max" onclick="maximizePog(' + i + ', 0)"></span><span class="fa fa-close canvas-close" onclick="closePog(' + i + ', 0)"></span></div>');
// 		}
// 		if ($("#canvas-list-holder").width() >= window.innerWidth) {
// 			$("#canvas-list-holder").css("width", "100%");
// 		}
// 	} else {
// 		$("#canvas-list-holder").css({
// 			display: "none",
// 			width: "auto",
// 		});
// 	}
// }

function sessionGetCombineDetails() {
    try {
        logDebug("function : sessionGetCombineDetails", "S");
        if (g_combinedShelfs.length > 0) {
            var sorto = {
                MIndex: "asc",
                X: "asc",
            };
            g_combinedShelfs.keySort(sorto);
            var combinedShlfDets = JSON.parse(sessionStorage.getItem("combinedShlfDets"));
            var i = 0;
            for (cd of combinedShlfDets) {
                g_combinedShelfs[cd.Index]["Start"] = cd.Start;
                g_combinedShelfs[cd.Index]["End"] = cd.End;
                g_combinedShelfs[cd.Index]["SpreadItem"] = cd.SpreadItem;
                g_combinedShelfs[cd.Index]["AllowAutoCrush"] = cd.AllowAutoCrush; //ASA-1307
                var item_dtl = [];
                for (obj of cd.ItemInfo) {
                    item_dtl.push(g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[obj.IIndex]); //was earlier was g_pog_index and there was 2 pog.//Regression 20240724
                }
                g_combinedShelfs[cd.Index]["ItemInfo"] = item_dtl;
            }
        }
    } catch (err) {
        logDebug("function : sessionGetCombineDetails", "E");
        error_handling(err);
    }
}


function sessionSetCombineDetails() {
    try {
        logDebug("function : sessionSetCombineDetails", "S");
        var combinedShlfDets = [];
        if (g_combinedShelfs.length > 0) {
            var sorto = {
                MIndex: "asc",
                X: "asc",
            };
            g_combinedShelfs.keySort(sorto);
            var i = 0;
            for (combines of g_combinedShelfs) {
                var dets = {};
                dets["Index"] = i;
                dets["Start"] = combines.Start;
                dets["End"] = combines.End;
                dets["SpreadItem"] = combines.SpreadItem;
                dets["AllowAutoCrush"] = combines.AllowAutoCrush; //ASA-1307
                var dtl_list = {};
                var item_list = [];
                for (obj of combines.ItemInfo) {
                    dtl_list["ObjID"] = obj.ObjID;
                    dtl_list["PIndex"] = typeof obj.PIndex !== "undefined" && obj.PIndex !== "" ? obj.PIndex : combines[0].PIndex; //Regression 20240724
                    dtl_list["MIndex"] = obj.MIndex;
                    dtl_list["SIndex"] = obj.SIndex;
                    dtl_list["IIndex"] = obj.IIndex;
                    item_list.push(dtl_list);
                }
                dets["ItemInfo"] = item_list;
                combinedShlfDets.push(dets);
                i++;
            }
        }
        sessionStorage.setItem("combinedShlfDets", JSON.stringify(combinedShlfDets));
    } catch (err) {
        logDebug("function : sessionSetCombineDetails", "E");
        error_handling(err);
    }
}

// Moved to common JS
// async function update_module_block_list(p_action_ind, p_old_blk_name, p_escape_ind = "N") {
//     var block_detail = {};
//     var filters_arr = [];
//     var attr_arr = [];
//     var filter_val = [];
//     var blk_name_arr = [];
//     var upd_block_dtl = {};
//     var blockName = $v("P193_BLK_NAME") + "_AFP";
//     if (p_escape_ind == "Y") {
//         var block_details_arr = [];
//         for (const obj of g_mod_block_list) {
//             var details = {};
//             details["BlkColor"] = obj.BlkColor;
//             details["BlkName"] = obj.BlkName;
//             details["BlkRule"] = obj.BlkRule;
//             details["BlkFilters"] = obj.BlockFilters.join(" AND ");
//             details["OldBlkName"] = obj.BlkName;
//             obj["BlkFilters"] = details["BlkFilters"];
//             block_details_arr.push(details);
//         }
//         closeInlineDialog("block_details");
//         var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
//     } else {
//         if (p_old_blk_name == blockName && p_action_ind == "U") {
//             blk_name_arr = [];
//         } else {
//             blk_name_arr = [blockName];
//         }

//         block_detail["BlkName"] = blockName;
//         block_detail["BlkColor"] = $v("P193_BLK_COLOR");
//         block_detail["BlkRule"] = $v("P193_BLK_RULE");
//         var shelf_arr = [];
//         var mod_index = [];
//         var final_shelf_arr = [];

//         if (p_action_ind !== "U") {
//             var mod_ind = -1;
//             for (const objects of g_delete_details) {
//                 if (objects.ObjType !== "TEXTBOX") {
//                     shelf_arr.push(objects);
//                     if (mod_ind !== objects.MIndex) {
//                         mod_index.push(objects.MIndex);
//                     }
//                     objects.BlkName = block_detail["BlkName"];
//                     mod_ind = objects.MIndex;
//                 }
//             }
//             mod_index.sort();
//             if (g_mod_block_list.length > 0) {
//                 for (const shelfs of shelf_arr) {
//                     var valid = true;
//                     for (const obj of g_mod_block_list) {
//                         if (!valid) break;
//                         for (const dtl of obj.g_delete_details) {
//                             if (shelfs.MIndex == dtl.MIndex && shelfs.SIndex == dtl.SIndex) {
//                                 valid = false;
//                                 break;
//                             }
//                         }
//                     }
//                     if (valid) final_shelf_arr.push(shelfs);
//                 }
//             } else {
//                 final_shelf_arr = shelf_arr;
//             }
//         } else {
//             for (const obj of g_mod_block_list) {
//                 if (obj.BlkName == p_old_blk_name) {
//                     final_shelf_arr = obj.g_delete_details;
//                     mod_index = obj.mod_index;
//                     block_detail["DragMouseStart"] = obj.DragMouseStart;
//                     block_detail["DragMouseEnd"] = obj.DragMouseEnd;
//                     break;
//                 }
//             }
//             for (const obj of final_shelf_arr) {
//                 obj.BlkName = block_detail["BlkName"];
//             }
//             g_DragMouseStart = block_detail["DragMouseStart"];
//             g_DragMouseEnd = block_detail["DragMouseEnd"];
//         }
//         block_detail["g_delete_details"] = final_shelf_arr;

//         var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;

//         model.forEach(function (record) {
//             var filters = typeof model.getValue(record, "FILTER") == "object" ? model.getValue(record, "FILTER").v : model.getValue(record, "FILTER");
//             var value = model.getValue(record, "VALUE");
//             filter_val.push(filters + "#" + value);
//             if (filters !== "") {
//                 var filter_list = filters.split("-");
//                 attr_arr.push(filter_list[0]);
//                 filters_arr.push(filter_list[0] + " = " + (filter_list[1] == "C" ? '"' : "") + value + (filter_list[1] == "C" ? '"' : ""));
//             }
//         });

//         for (const obj of g_mod_block_list) {
//             blk_name_arr.push(obj.BlkName);
//         }

//         var blk_dup = findDuplicates(blk_name_arr);
//         var dup_arr = findDuplicates(attr_arr);

//         if (blk_dup.length > 0) {
//             alert(get_message("POGCR_BLK_DUP"));
//         } else if (dup_arr.length > 0) {
//             alert(get_message("POGCR_DUP_REC_FOUND"));
//         } else if (attr_arr.includes("SUBCLASS") && (!attr_arr.includes("CLASS") || !attr_arr.includes("DEPT"))) {
//             alert(get_message("POGCR_DEPT_CLASS_MANDATE"));
//         } else if (attr_arr.includes("CLASS") && !attr_arr.includes("DEPT")) {
//             alert(get_message("POGCR_DEPT_MANDATE"));
//         } else {
//             block_detail["BlockFilters"] = filters_arr;
//             block_detail["FilterVal"] = filter_val;
//             block_detail["mod_index"] = mod_index;
//             if (p_action_ind == "U") {
//                 for (const obj of g_mod_block_list) {
//                     if (obj.BlkName == p_old_blk_name) {
//                         for (const child of obj.BlockDim.ColorObj.children) {
//                             if (child.uuid == p_old_blk_name) {
//                                 obj.BlockDim.ColorObj.remove(child);
//                                 break;
//                             }
//                         }
//                     }
//                 }
//                 var i = 0;
//                 for (const obj of g_mod_block_list) {
//                     if (obj.BlkName == p_old_blk_name) {
//                         upd_block_dtl = JSON.parse(JSON.stringify(obj));
//                         g_mod_block_list.splice(i, 1);
//                     }
//                     i++;
//                 }
//             }

//             apex.region("block_filters").widget().interactiveGrid("getActions").set("edit", false);
//             apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model.clearChanges();
//             apex.region("block_filters").refresh();

//             clear_blinking();
//             var ret_dtl = await colorAutofillBlock(g_DragMouseStart, g_DragMouseEnd, mod_index, $v("P193_BLK_COLOR"), blockName, p_action_ind, upd_block_dtl, g_pog_index, "N");
//             block_detail["BlockDim"] = ret_dtl;
//             g_mod_block_list.push(block_detail);

//             closeInlineDialog("block_details");

//             if (p_action_ind == "U") {
//                 var block_details_arr = [];
//                 for (const obj of g_mod_block_list) {
//                     if (obj.BlkName !== blockName && obj.BlkName !== p_old_blk_name) {
//                         var details = {};
//                         details["BlkColor"] = obj.BlkColor;
//                         details["BlkName"] = obj.BlkName;
//                         details["BlkRule"] = obj.BlkRule;
//                         details["BlkFilters"] = obj.BlockFilters.join(" AND ");
//                         details["OldBlkName"] = obj.BlkName;
//                         obj["BlkFilters"] = details["BlkFilters"];
//                         block_details_arr.push(details);
//                     } else if (obj.BlkName == p_old_blk_name || obj.BlkName == blockName) {
//                         var details = {};
//                         details["BlkColor"] = $v("P193_BLK_COLOR");
//                         details["BlkName"] = blockName;
//                         details["BlkRule"] = $v("P193_BLK_RULE");
//                         details["BlkFilters"] = filters_arr.join(" AND ");
//                         details["OldBlkName"] = p_old_blk_name;
//                         obj["BlkFilters"] = details["BlkFilters"];
//                         block_details_arr.push(details);
//                     }
//                 }
//                 var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
//             } else if (p_action_ind == "Y" || p_action_ind == "A") {
//                 var block_details_arr = [];
//                 for (const obj of g_mod_block_list) {
//                     var details = {};
//                     details["BlkColor"] = obj.BlkColor;
//                     details["BlkName"] = obj.BlkName;
//                     details["BlkRule"] = obj.BlkRule;
//                     details["BlkFilters"] = obj.BlockFilters.join(" AND ");
//                     obj["BlkFilters"] = details["BlkFilters"];
//                     block_details_arr.push(details);
//                 }
//                 var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
//             }
//         }
//     }
// }

function clear_auto_fill_coll() {
    g_auto_fill_active = "N";
    g_auto_fill_reg_open = "N";
    g_autofill_edit = "N";
    apex.server.process(
        "DELETE_AUTOFILL_COLL", {
        x01: "",
    }, {
        dataType: "text",
        success: async function (pData) {
            for (const obj of g_mod_block_list) {
                for (const child of obj.BlockDim.ColorObj.children) {
                    if (child.uuid == obj.BlkName) {
                        obj.BlockDim.ColorObj.remove(child);
                        break;
                    }
                }
            }
            render(g_pog_index);
            // apex.region("autofill_products").refresh();
            if (apex.region("mod_block_details") !== null) {
                apex.region("mod_block_details").refresh();
            }
            console.log("pData", pData);
            $s("P193_MULTI_PRODUCT", "");
            $(".dropdown").removeClass("disable_dropdown");
            $(".live_image").removeClass("disable_dropdown");
            $(".3d_popup").removeClass("disable_dropdown");
            $(".open_product").removeClass("disable_dropdown");
            $(".left_icon").removeClass("disable_dropdown");
            $(".autofill_btn").removeClass("item_label_active");
        },
        loadingIndicatorPosition: "page",
    });
}


function getAutoFillCurrModule(p_finalX, p_finalY, p_module_index, p_pog_index) {
    logDebug("function : getAutoFillCurrModule; pfinalX : " + p_finalX + "; pFinalY : " + p_finalY + "; p_module_index : " + p_module_index, "S");
    try {
        var curr_module = -1;
        var i = 0;
        var j = 0;
        //Checking dragged object is in which module
        var i = 0;
        for (modules of g_pog_json[p_pog_index].ModuleInfo) {
            //ASA-1085
            if (parseFloat(p_finalX) > parseFloat(modules.X) - modules.W / 2 && parseFloat(p_finalX) < parseFloat(modules.X) + modules.W / 2 && parseFloat(p_finalY) > parseFloat(modules.Y) - modules.H / 2 && parseFloat(p_finalY) < parseFloat(modules.Y) + modules.H / 2 && (modules.ParentModule == null || typeof modules.ParentModule == "undefined")) {
                curr_module = i;
                break;
            }
            i++;
        }

        logDebug("function : getAutoFillCurrModule", "E");
        return curr_module;
    } catch (err) {
        error_handling(err);
    }
}

function getAutoFillCurrShelf(p_blockStart, p_blockEnd, p_module_index, p_pog_index) {
    logDebug("function : getAutoFillCurrShelf; pBlockStart : " + p_blockStart + "; pBlockEnd : " + p_blockEnd + "; p_module_index : " + p_module_index, "S");
    try {
        var curr_shelf = -1;
        var i = 0;
        for (shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
            //ASA-1085
            if (parseFloat(p_blockStart.y) > parseFloat(shelfs.Y) - shelfs.H / 2 && parseFloat(p_blockEnd.y) < parseFloat(shelfs.Y) + shelfs.H / 2) {
                curr_shelf = i;
                break;
            }
            i++;
        }

        logDebug("function : getAutoFillCurrShelf", "E");
        return curr_shelf;
    } catch (err) {
        error_handling(err);
    }
}

async function swapColoredBlocks(p_swapBlock, p_dragBlock, p_pog_index) {
    logDebug("function : swapColoredBlocks; pSwapBlock : " + p_swapBlock, "S");

    var dragModule = p_dragBlock.BlockDim.ColorObj;
    var dragBlockCalcX = parseFloat(p_dragBlock.BlockDim.CalcX);
    var dragBlockCalcY = parseFloat(p_dragBlock.BlockDim.CalcY);
    var dragBlockFinalTop = parseFloat(p_dragBlock.BlockDim.FinalTop);
    var dragBlockFinalBtm = parseFloat(p_dragBlock.BlockDim.FinalBtm);
    var dragBlockW = parseFloat(p_dragBlock.BlockDim.BlkWidth);
    var dragBlockH = parseFloat(p_dragBlock.BlockDim.BlkHeight);
    var dragBlockDelDetails = JSON.parse(JSON.stringify(p_dragBlock.g_delete_details));
    var dragBlockMod = JSON.parse(JSON.stringify(p_dragBlock.mod_index));
    var dragBlockObj = dragModule.getObjectByProperty("uuid", g_dragItem.uuid); //ASA-1085

    var swapModule = p_swapBlock.BlockDim.ColorObj;
    var swapBlockCalcX = parseFloat(p_swapBlock.BlockDim.CalcX);
    var swapBlockCalcY = parseFloat(p_swapBlock.BlockDim.CalcY);
    var swapBlockFinalTop = parseFloat(p_swapBlock.BlockDim.FinalTop);
    var swapBlockFinalBtm = parseFloat(p_swapBlock.BlockDim.FinalBtm);
    var swapBlockW = parseFloat(p_swapBlock.BlockDim.BlkWidth);
    var swapBlockH = parseFloat(p_swapBlock.BlockDim.BlkHeight);
    var swapBlockDelDetails = JSON.parse(JSON.stringify(p_swapBlock.g_delete_details));
    var swapBlockMod = JSON.parse(JSON.stringify(p_swapBlock.mod_index));
    var swapBlockObj = swapModule.getObjectByProperty("uuid", p_swapBlock.BlkName);

    p_swapBlock.BlockDim.CalcX = dragBlockCalcX;
    p_swapBlock.BlockDim.CalcY = dragBlockCalcY;
    p_swapBlock.BlockDim.FinalTop = dragBlockFinalTop;
    p_swapBlock.BlockDim.FinalBtm = dragBlockFinalBtm;
    p_swapBlock.BlockDim.BlkWidth = dragBlockW;
    p_swapBlock.BlockDim.BlkHeight = dragBlockH;
    p_swapBlock.mod_index = dragBlockMod;
    p_swapBlock.g_delete_details = dragBlockDelDetails;
    for (g_shelf of p_swapBlock.g_delete_details) {
        g_shelf.BlkName = p_swapBlock.BlkName;
    }
    swapBlockObj.position.x = dragBlockCalcX;
    swapBlockObj.position.y = dragBlockCalcY;
    swapBlockObj.geometry.dispose();
    swapBlockObj.geometry = new THREE.BoxGeometry(dragBlockW, dragBlockH, 0.001);

    p_dragBlock.BlockDim.CalcX = swapBlockCalcX;
    p_dragBlock.BlockDim.CalcY = swapBlockCalcY;
    p_dragBlock.BlockDim.FinalTop = swapBlockFinalTop;
    p_dragBlock.BlockDim.FinalBtm = swapBlockFinalBtm;
    p_dragBlock.BlockDim.BlkWidth = swapBlockW;
    p_dragBlock.BlockDim.BlkHeight = swapBlockH;
    p_dragBlock.mod_index = swapBlockMod;
    p_dragBlock.g_delete_details = swapBlockDelDetails;
    for (g_shelf of p_dragBlock.g_delete_details) {
        g_shelf.BlkName = p_dragBlock.BlkName;
    }
    dragBlockObj.position.x = swapBlockCalcX;
    dragBlockObj.position.y = swapBlockCalcY;
    dragBlockObj.geometry.dispose();
    dragBlockObj.geometry = new THREE.BoxGeometry(swapBlockW, swapBlockH, 0.001);

    swapModule.remove(swapBlockObj);
    dragModule.remove(dragBlockObj);
    swapModule.add(dragBlockObj);
    dragModule.add(swapBlockObj);

    p_dragBlock.BlockDim.ColorObj = swapModule;
    p_swapBlock.BlockDim.ColorObj = dragModule;

    dragModule.updateMatrix();
    swapModule.updateMatrix();
    dragBlockObj.updateMatrix();
    swapBlockObj.updateMatrix();
    render(p_pog_index);

    logDebug("function : swapColoredBlocks", "E");
}


async function get_multiselect_obj(p_pog_index) {
    logDebug("function : get_multiselect_obj", "S");
    try {
        g_delete_details = [];
        g_multi_drag_shelf_arr = [];
        g_multi_drag_item_arr = [];
        var carpark_object = "CARPARK_ITEM";
        g_dup_mod_list = await find_select_module(p_pog_index);
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            var module_details = g_pog_json[p_pog_index].ModuleInfo;
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
                                //left to right and top to bottom
                                if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
                                    if (shelf_left >= g_DragMouseStart.x && shelf_right >= g_DragMouseStart.x && shelf_bottom <= g_DragMouseStart.y && shelf_top <= g_DragMouseStart.y && shelf_left <= g_DragMouseEnd.x && shelf_right <= g_DragMouseEnd.x && shelf_bottom >= g_DragMouseEnd.y && shelf_top >= g_DragMouseEnd.y) {
                                        var details = setDetailsArray(Shelf.SObjID, j, k, Shelf.W, Shelf.H, Shelf.X, Shelf.Y, Shelf.Z, -1, Shelf.ObjType, "N", "SHELF", Modules.MObjID, -1, "", "", "N", Shelf.Rotation, Shelf.Slope, 0, "", "", g_start_canvas, g_present_canvas, p_pog_index);
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                    //right to left and top to bottom
                                } else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
                                    if (shelf_left >= g_DragMouseEnd.x && shelf_right >= g_DragMouseEnd.x && shelf_bottom >= g_DragMouseEnd.y && shelf_top >= g_DragMouseEnd.y && shelf_left <= g_DragMouseStart.x && shelf_right <= g_DragMouseStart.x && shelf_bottom <= g_DragMouseStart.y && shelf_top <= g_DragMouseStart.y) {
                                        var details = setDetailsArray(Shelf.SObjID, j, k, Shelf.W, Shelf.H, Shelf.X, Shelf.Y, Shelf.Z, -1, Shelf.ObjType, "N", "SHELF", Modules.MObjID, -1, "", "", "N", Shelf.Rotation, Shelf.Slope, 0, "", "", g_start_canvas, g_present_canvas, p_pog_index);
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                    //left to right bottom to top
                                } else if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
                                    if (shelf_left >= g_DragMouseStart.x && shelf_right >= g_DragMouseStart.x && shelf_bottom >= g_DragMouseStart.y && shelf_top >= g_DragMouseStart.y && shelf_left <= g_DragMouseEnd.x && shelf_right <= g_DragMouseEnd.x && shelf_bottom <= g_DragMouseEnd.y && shelf_top <= g_DragMouseEnd.y) {
                                        var details = setDetailsArray(Shelf.SObjID, j, k, Shelf.W, Shelf.H, Shelf.X, Shelf.Y, Shelf.Z, -1, Shelf.ObjType, "N", "SHELF", Modules.MObjID, -1, "", "", "N", Shelf.Rotation, Shelf.Slope, 0, "", "", g_start_canvas, g_present_canvas, p_pog_index);
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                    //right to left bottom to top.
                                } else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
                                    if (shelf_left <= g_DragMouseStart.x && shelf_right <= g_DragMouseStart.x && shelf_bottom >= g_DragMouseStart.y && shelf_top >= g_DragMouseStart.y && shelf_left >= g_DragMouseEnd.x && shelf_right >= g_DragMouseEnd.x && shelf_bottom <= g_DragMouseEnd.y && shelf_top <= g_DragMouseEnd.y) {
                                        var details = setDetailsArray(Shelf.SObjID, j, k, Shelf.W, Shelf.H, Shelf.X, Shelf.Y, Shelf.Z, -1, Shelf.ObjType, "N", "SHELF", Modules.MObjID, -1, "", "", "N", Shelf.Rotation, Shelf.Slope, 0, "", "", g_start_canvas, g_present_canvas, p_pog_index);
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                }
                                var l = 0;
                                var itemsDetail = Shelf.ItemInfo;
                                var sorto = {
                                    X: "asc",
                                };
                                itemsDetail.keySort(sorto);
                                for (const items of itemsDetail) {
                                    var item_left = items.X - items.W / 2;
                                    var item_right = items.X + items.W / 2;
                                    var item_bottom = items.Y - items.H / 2;
                                    var item_top = items.Y + items.H / 2;
                                    if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
                                        if (item_left >= g_DragMouseStart.x && item_right >= g_DragMouseStart.x && item_bottom <= g_DragMouseStart.y && item_top <= g_DragMouseStart.y && item_left <= g_DragMouseEnd.x && item_right <= g_DragMouseEnd.x && item_bottom >= g_DragMouseEnd.y && item_top >= g_DragMouseEnd.y) {
                                            var is_divider = "N";
                                            var object = "ITEM";
                                            if (items.Item == "DIVIDER") {
                                                is_divider = "Y";
                                                object = "SHELF";
                                            }

                                            var details = setDetailsArray(items.ObjID, j, k, items.W, items.H, items.X, items.Y, items.Z, l, Shelf.ObjType, is_divider, object, Modules.MObjID, Shelf.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

                                            details["W"] = items.W;
                                            details["RW"] = items.RW;
                                            details["H"] = items.H;
                                            details["X"] = items.X;
                                            details["Y"] = items.Y;
                                            g_delete_details.multi_delete_shelf_ind = "";
                                            g_delete_details.push(details);
                                            if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
                                            }
                                        }
                                    } else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
                                        if (item_left >= g_DragMouseEnd.x && item_right >= g_DragMouseEnd.x && item_bottom >= g_DragMouseEnd.y && item_top >= g_DragMouseEnd.y && item_left <= g_DragMouseStart.x && item_right <= g_DragMouseStart.x && item_bottom <= g_DragMouseStart.y && item_top <= g_DragMouseStart.y) {
                                            var is_divider = "N";
                                            var object = "ITEM";
                                            if (items.Item == "DIVIDER") {
                                                is_divider = "Y";
                                                object = "SHELF";
                                            }

                                            var details = setDetailsArray(items.ObjID, j, k, items.W, items.H, items.X, items.Y, items.Z, l, Shelf.ObjType, is_divider, object, Modules.MObjID, Shelf.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

                                            details["W"] = items.W;
                                            details["RW"] = items.RW;
                                            details["H"] = items.H;
                                            details["X"] = items.X;
                                            details["Y"] = items.Y;

                                            g_delete_details.multi_delete_shelf_ind = "";
                                            g_delete_details.push(details);
                                            if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
                                            }
                                        }
                                    } else if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
                                        if (item_left >= g_DragMouseStart.x && item_right >= g_DragMouseStart.x && item_bottom >= g_DragMouseStart.y && item_top >= g_DragMouseStart.y && item_left <= g_DragMouseEnd.x && item_right <= g_DragMouseEnd.x && item_bottom <= g_DragMouseEnd.y && item_top <= g_DragMouseEnd.y) {
                                            var is_divider = "N";
                                            var object = "ITEM";
                                            if (items.Item == "DIVIDER") {
                                                is_divider = "Y";
                                                object = "SHELF";
                                            }
                                            var details = setDetailsArray(items.ObjID, j, k, items.W, items.H, items.X, items.Y, items.Z, l, Shelf.ObjType, is_divider, object, Modules.MObjID, Shelf.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

                                            details["W"] = items.W;
                                            details["RW"] = items.RW;
                                            details["H"] = items.H;
                                            details["X"] = items.X;
                                            details["Y"] = items.Y;

                                            g_delete_details.multi_delete_shelf_ind = "";
                                            g_delete_details.push(details);
                                            if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
                                            }
                                        }
                                    } else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
                                        if (item_left <= g_DragMouseStart.x && item_right <= g_DragMouseStart.x && item_bottom >= g_DragMouseStart.y && item_top >= g_DragMouseStart.y && item_left >= g_DragMouseEnd.x && item_right >= g_DragMouseEnd.x && item_bottom <= g_DragMouseEnd.y && item_top <= g_DragMouseEnd.y) {
                                            var is_divider = "N";
                                            var object = "ITEM";
                                            if (items.Item == "DIVIDER") {
                                                is_divider = "Y";
                                                object = "SHELF";
                                            }
                                            var details = setDetailsArray(items.ObjID, j, k, items.W, items.H, items.X, items.Y, items.Z, l, Shelf.ObjType, is_divider, object, Modules.MObjID, Shelf.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

                                            details["W"] = items.W;
                                            details["RW"] = items.RW;
                                            details["H"] = items.H;
                                            details["X"] = items.X;
                                            details["Y"] = items.Y;

                                            g_delete_details.multi_delete_shelf_ind = "";
                                            g_delete_details.push(details);
                                            if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k];
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
                    var Carpark = Modules.Carpark;
                    if (typeof Carpark !== "undefined" && Carpark.length > 0) {
                        var l = 0;
                        var itemsDetail = Modules.Carpark[0].ItemInfo;
                        var sorto = {
                            X: "asc",
                        };
                        itemsDetail.keySort(sorto);
                        var is_divider = "N";
                        for (const items of itemsDetail) {
                            var item_left = items.X - items.W / 2;
                            var item_right = items.X + items.W / 2;
                            var item_bottom = items.Y - items.H / 2;
                            var item_top = items.Y + items.H / 2;
                            if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
                                if (item_left >= g_DragMouseStart.x && item_right >= g_DragMouseStart.x && item_bottom <= g_DragMouseStart.y && item_top <= g_DragMouseStart.y && item_left <= g_DragMouseEnd.x && item_right <= g_DragMouseEnd.x && item_bottom >= g_DragMouseEnd.y && item_top >= g_DragMouseEnd.y) {
                                    var details = setDetailsArray(items.ObjID, j, 0, items.W, items.H, items.X, items.Y, items.Z, l, Carpark.ObjType, is_divider, carpark_object, Modules.MObjID, Carpark.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

                                    details["W"] = items.W;
                                    details["RW"] = items.RW;
                                    details["H"] = items.H;
                                    details["X"] = items.X;
                                    details["Y"] = items.Y;
                                    details["IsCarpark"] = "Y";
                                    g_delete_details.multi_delete_shelf_ind = "";
                                    g_delete_details.multi_carpark_ind = "Y";
                                    g_delete_details.push(details);
                                }
                            } else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y >= g_DragMouseEnd.y) {
                                if (item_left >= g_DragMouseEnd.x && item_right >= g_DragMouseEnd.x && item_bottom >= g_DragMouseEnd.y && item_top >= g_DragMouseEnd.y && item_left <= g_DragMouseStart.x && item_right <= g_DragMouseStart.x && item_bottom <= g_DragMouseStart.y && item_top <= g_DragMouseStart.y) {
                                    var details = setDetailsArray(items.ObjID, j, 0, items.W, items.H, items.X, items.Y, items.Z, l, Carpark.ObjType, is_divider, carpark_object, Modules.MObjID, Carpark.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

                                    details["W"] = items.W;
                                    details["RW"] = items.RW;
                                    details["H"] = items.H;
                                    details["X"] = items.X;
                                    details["Y"] = items.Y;
                                    details["IsCarpark"] = "Y";
                                    g_delete_details.multi_delete_shelf_ind = "";
                                    g_delete_details.multi_carpark_ind = "Y";
                                    g_delete_details.push(details);
                                }
                            } else if (g_DragMouseStart.x <= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
                                if (item_left >= g_DragMouseStart.x && item_right >= g_DragMouseStart.x && item_bottom >= g_DragMouseStart.y && item_top >= g_DragMouseStart.y && item_left <= g_DragMouseEnd.x && item_right <= g_DragMouseEnd.x && item_bottom <= g_DragMouseEnd.y && item_top <= g_DragMouseEnd.y) {
                                    var details = setDetailsArray(items.ObjID, j, 0, items.W, items.H, items.X, items.Y, items.Z, l, Carpark.ObjType, is_divider, carpark_object, Modules.MObjID, Carpark.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

                                    details["W"] = items.W;
                                    details["RW"] = items.RW;
                                    details["H"] = items.H;
                                    details["X"] = items.X;
                                    details["Y"] = items.Y;
                                    details["IsCarpark"] = "Y";
                                    g_delete_details.multi_delete_shelf_ind = "";
                                    g_delete_details.multi_carpark_ind = "Y";
                                    g_delete_details.push(details);
                                }
                            } else if (g_DragMouseStart.x >= g_DragMouseEnd.x && g_DragMouseStart.y <= g_DragMouseEnd.y) {
                                if (item_left <= g_DragMouseStart.x && item_right <= g_DragMouseStart.x && item_bottom >= g_DragMouseStart.y && item_top >= g_DragMouseStart.y && item_left >= g_DragMouseEnd.x && item_right >= g_DragMouseEnd.x && item_bottom <= g_DragMouseEnd.y && item_top <= g_DragMouseEnd.y) {
                                    var details = setDetailsArray(items.ObjID, j, 0, items.W, items.H, items.X, items.Y, items.Z, l, Carpark.ObjType, is_divider, carpark_object, Modules.MObjID, Carpark.SObjID, items.ItemID, items.Item, "N", 0, 0, items.Distance, items.TopObjID, items.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);

                                    details["W"] = items.W;
                                    details["RW"] = items.RW;
                                    details["H"] = items.H;
                                    details["X"] = items.X;
                                    details["Y"] = items.Y;
                                    details["IsCarpark"] = "Y";
                                    g_delete_details.multi_delete_shelf_ind = "";
                                    g_delete_details.multi_carpark_ind = "Y";
                                    g_delete_details.push(details);
                                }
                            }
                            l++;
                        }
                    }
                }
                j++;
            }
            g_delete_details.StartCanvas = g_start_canvas;
            g_delete_details.g_present_canvas = g_present_canvas;
        }
        if (g_delete_details.multi_carpark_ind == "Y") {
            if (g_delete_details.some((e) => e.Object !== carpark_object)) {
                //Task_29818 - Start
                // ax_message.set({
                //     labels: {
                //         ok: get_message("SHCT_YES"),
                //         cancel: get_message("SHCT_NO"),
                //     },
                // });

                // ax_message.set({
                //     buttonReverse: true,
                // });

                // ax_message.confirm(get_message("CARPARK_MULTI_SEL_CONF"), function (e) {
                //     if (e) {
                //         for (var i = g_delete_details.length - 1; i >= 0; --i) {
                //             if (g_delete_details[i].Object !== carpark_object) {
                //                 g_delete_details.splice(i, 1);
                //             }
                //         }
                //         set_multi_blink(g_pog_json, p_pog_index);
                //     } else {
                //         g_delete_details = [];
                //         set_multi_blink(g_pog_json, p_pog_index);
                //     }
                // });

                confirm(
                    get_message("CARPARK_MULTI_SEL_CONF"),
                    get_message("SHCT_YES"),
                    get_message("SHCT_NO"),
                    function () {
                        for (var i = g_delete_details.length - 1; i >= 0; --i) {
                            if (g_delete_details[i].Object !== carpark_object) {
                                g_delete_details.splice(i, 1);
                            }
                        }
                        set_multi_blink(g_pog_json, p_pog_index);
                    },
                    function () {
                        g_delete_details = [];
                        set_multi_blink(g_pog_json, p_pog_index);
                    }
                );
                //Task_29818 - End
            }
        }
        logDebug("function : get_multiselect_obj", "E");
    } catch (err) {
        error_handling(err);
    }
}

function setDetailsArray(p_objID, p_mIndex, p_sIndex, p_objWidth, p_objHeight, p_xAxis, p_yAxis, p_zAxis, p_iIndex, p_objType, p_isDivider, p_object, p_mObjID, p_sObjID, p_itemid, p_item, p_exists, p_rotation, p_slope, p_distance, p_topObjId, p_bottomObjId, p_startCanvas, p_present_canvas, p_pog_index) {
    var details = {};
    details["ObjID"] = p_objID;
    details["MIndex"] = p_mIndex;
    details["SIndex"] = p_sIndex;
    details["ObjWidth"] = p_objWidth;
    details["ObjHeight"] = p_objHeight;
    details["XAxis"] = p_xAxis;
    details["YAxis"] = p_yAxis;
    details["ZAxis"] = p_zAxis;
    details["IIndex"] = p_iIndex;
    details["ObjType"] = p_objType;
    details["IsDivider"] = p_isDivider;
    details["Object"] = p_object;
    details["MObjID"] = p_mObjID;
    details["SObjID"] = p_sObjID;
    details["ItemID"] = p_itemid;
    details["Item"] = p_item;
    details["Exists"] = p_exists;
    details["Rotation"] = p_rotation;
    details["Slope"] = p_slope;
    details["Distance"] = p_distance;
    details["TopObjID"] = p_topObjId;
    details["BottomObjID"] = p_bottomObjId;
    details["StartCanvas"] = p_startCanvas;
    details["g_present_canvas"] = p_present_canvas;
    details["p_pog_index"] = p_pog_index;

    if (p_object == "SHELF") {
        //ASA-1471 S
        details["AllowAutoCrush"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].AllowAutoCrush;
        details["Rotation"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].Rotation; //0
        details["Slope"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].Slope; //0
        details["Color"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].Color;
        details["Combine"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].Combine;
        details["LOverhang"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].LOverhang;
        details["ROverhang"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ROverhang;
        details["DivHeight"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivHeight == "undefined" ? 0 : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivHeight;
        details["DivWidth"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivWidth == "undefined" ? 0 : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivWidth;
        details["DivPst"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPst == "undefined" ? "N" : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPst;
        details["DivPed"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPed == "undefined" ? "N" : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPed;
        details["DivPbtwFace"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPbtwFace == "undefined" ? "N" : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivPbtwFace;
        details["NoDivIDShow"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].NoDivIDShow;
        details["DivFillCol"] = typeof g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivFillCol == "undefined" ? "#3D393D" : g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].DivFillCol;
        details["SpreadItem"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].SpreadItem;
        details["W"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].W;
        details["H"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].H;
        details["D"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].D;
        details["MaxMerch"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].MaxMerch;
    } //ASA-1471 S

    if (p_objType == "TEXTBOX") {
        details["FBold"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].FBold;
        details["FSize"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].FSize;
        details["FStyle"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].FStyle;
        details["InputText"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].InputText;
        details["TextImg"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].TextImg;
        details["TextImgMime"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].TextImgMime;
        details["TextImgName"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].TextImgName;
        details["ReduceToFit"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ReduceToFit;
        details["WrapText"] = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].WrapText;
    } //ASA-1669
    return details;
}

async function comparePOG(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog = 'N', p_show_change_blocks = []) { //ASA-1803 Issue 1 added p_compare_pog  //ASA-1986 
    logDebug("function : comparePOG", "S");
    await get_compare_pog(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog, p_show_change_blocks);  //ASA-1986 
    logDebug("function : comparePOG", "E");
}
// ASA-1986 start
async function render_compare_pog_blocks_from_snapshot(p_blocks_snapshot, p_compare_index) {
    var blocksToRender = Array.isArray(p_blocks_snapshot) ? wpdBuildShowChangesBlockSnapshot(p_blocks_snapshot) : [];
    if (blocksToRender.length === 0) {
        return;
    }
    g_mod_block_list = [];
    for (const blkDet of blocksToRender) {
        if (typeof blkDet === "undefined" || blkDet == null) {
            continue;
        }
        g_DragMouseStart = {
            x: Number(blkDet.DragMouseStart && typeof blkDet.DragMouseStart.x !== "undefined" ? blkDet.DragMouseStart.x : 0),
            y: Number(blkDet.DragMouseStart && typeof blkDet.DragMouseStart.y !== "undefined" ? blkDet.DragMouseStart.y : 0)
        };
        g_DragMouseEnd = {
            x: Number(blkDet.DragMouseEnd && typeof blkDet.DragMouseEnd.x !== "undefined" ? blkDet.DragMouseEnd.x : 0),
            y: Number(blkDet.DragMouseEnd && typeof blkDet.DragMouseEnd.y !== "undefined" ? blkDet.DragMouseEnd.y : 0)
        };
        if (Array.isArray(blkDet.BlkModInfo) && blkDet.BlkModInfo.length > 0 && Array.isArray(blkDet.BlkShelfInfo) && blkDet.BlkShelfInfo.length > 0) {
            g_autofillModInfo = JSON.parse(JSON.stringify(blkDet.BlkModInfo));
            g_autofillShelfInfo = JSON.parse(JSON.stringify(blkDet.BlkShelfInfo));
        } else {
            [g_autofillModInfo, g_autofillShelfInfo] = getAutofillModShelf(g_DragMouseStart, g_DragMouseEnd, g_pog_json, p_compare_index);
        }
        if (!Array.isArray(g_autofillModInfo) || g_autofillModInfo.length === 0 || !Array.isArray(g_autofillShelfInfo) || g_autofillShelfInfo.length === 0) {
            continue;
        }
        await setAutofillBlock("A", blkDet.BlkName, "N", "N", blkDet.BlkColor || "#FFFFFF");
    }
}

async function render_compare_pog_blocks(p_pog_code, p_pog_version, p_compare_index, p_show_change_blocks = []) {
    var oldPogIndex = g_pog_index;
    var oldModBlockList = g_mod_block_list;
    var oldAutoFillActive = g_auto_fill_active;
    var oldDragMouseStart = g_DragMouseStart;
    var oldDragMouseEnd = g_DragMouseEnd;
    var oldAutofillDetail = g_autofill_detail;
    try {
        g_pog_index = p_compare_index;
        g_auto_fill_active = "Y";
        g_mod_block_list = [];
        g_autofill_detail = {};
        var l_snapshot_blocks = Array.isArray(p_show_change_blocks) ? p_show_change_blocks : [];
        if (l_snapshot_blocks.length > 0) {
            await render_compare_pog_blocks_from_snapshot(l_snapshot_blocks, p_compare_index);
        } else {
            await auto_fill_setup(1);
            if (!g_mod_block_list || g_mod_block_list.length === 0) {
                await createDynamicBlocks(p_pog_code, "N", p_pog_version, "N");
            } else {
                apex.region("mod_block_details").refresh();
            }
        }
        render(p_compare_index);
    } catch (err) {
        error_handling(err);
    } finally {
        g_pog_index = oldPogIndex;
        g_auto_fill_active = oldAutoFillActive;
        g_mod_block_list = oldModBlockList;
        g_autofill_detail = oldAutofillDetail;
        g_DragMouseStart = oldDragMouseStart;
        g_DragMouseEnd = oldDragMouseEnd;
    }
}
// ASA-1986 end
async function get_compare_pog(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog = "N", p_show_change_blocks = []) {// ASA-1986 
    //ASA-1803 Issue 1 added p_compare_pog
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
                    if (p_compare_pog != "Y") {
                        //ASA-1803 Issue 2
                        new_pog_json.POGCode = new_pog_json.POGCode + "-" + "PREV_VERSION";
                    } else {
                        new_pog_json.POGCode = new_pog_json.POGCode;
                    }
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
                        appendMultiCanvasRowCol(g_pog_json.length, $v("P193_POGCR_TILE_VIEW"));
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

                    var return_val = await create_module_from_json(POG_JSON, new_pog_ind, "F", $v("P193_PRODUCT_BTN_CLICK"), pog_opened, "N", "N", "Y", "Y", "", "Y", g_scene_objects[g_ComViewIndex].scene.children[0], g_scene_objects[g_ComViewIndex].scene, g_pog_index, g_ComViewIndex);
                    removeLoadingIndicator(regionloadWait);
                    render(g_ComViewIndex);
                    if (p_compare_pog == "Y") { // ASA-1986 start
                        await render_compare_pog_blocks(new_pog_json.POGCode, new_pog_json.Version, g_ComViewIndex, p_show_change_blocks);
                    }

                    if (p_prev_version == "Y") {
                        if (g_show_item_color == "Y") {
                            var res = await showItemColor("OFF", g_ComViewIndex);
                        }
                        var res1 = await two_pog_diff_checker(g_ComBaseIndex, g_ComViewIndex, p_compare_pog); //ASA-1803 issue 1 Added p_compare_pog
                        var res = await calculateFixelAndSupplyDays("N", g_ComViewIndex);
                    }

                    render(g_pog_index);
                    g_pog_index = old_pog_index;
                    add_pog_code_header();
                }
                doSomething();

                $s("P193_OPEN_DRAFT", "Y");
                g_auto_position_ind = "N";
                g_dblclick_opened = "N";
            }
        });
    } catch (err) {
        error_handling(err);
        removeLoadingIndicator(regionloadWait);
    }
}

async function modifyWindowAfterMinMax(p_scene_objects) {
    g_scene_objects = [];
    console.log("modify");
    g_canvas_objects = [];
    var old_pogIndex = g_pog_index;
    for (var i = 0; i < p_scene_objects.length; i++) {
        init(i);
        var canvasName = "maincanvas";
        if (i > 0) {
            canvasName = "maincanvas" + (i + 1);
        }
        g_camera = p_scene_objects[i].scene.getObjectByProperty("type", "PerspectiveCamera");
        g_scene = p_scene_objects[i].scene;
        g_pog_index = i;
        console.log("scene", g_scene.uuid);
        var canvasContainerH = $("#" + canvasName).parent()[0].offsetHeight;
        var canvasContainerW = $("#" + canvasName).parent()[0].offsetWidth;
        var canvasBtns = $("#" + canvasName + "-btns")[0];
        var canvasBtns_height;
        if (typeof canvasBtns !== "undefined") {
            canvasBtns_height = canvasBtns.offsetHeight;
        } else {
            canvasBtns_height = 0;
        }
        var canvasWidthOrg = canvasContainerW;
        var canvasHeightOrg = canvasContainerH - canvasBtns_height;
        $("#" + canvasName)
            .css("height", canvasHeightOrg + "px !important")
            .css("width", canvasWidthOrg + "px !important");
        $("#" + canvasName).height(canvasHeightOrg); //ASA-1107
        $("#" + canvasName).width(canvasWidthOrg); //ASA-1107
        g_camera.aspect = canvasWidthOrg / canvasHeightOrg;
        g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV);
        g_camera.updateProjectionMatrix();

        var details = get_min_max_xy(i);
        var details_arr = details.split("###");
        set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, i);

        objects = {};
        objects["scene"] = g_scene;
        objects["renderer"] = g_renderer;
        console.log("objects", objects);
        g_scene_objects.push(objects);
        set_indicator_objects(i);
        render(i);
    }
    g_pog_index = old_pogIndex;
}

async function createDynamicBlocks(
    p_pog_code,
    p_draft_pog,
    p_pog_version,
    p_saveColl = "Y",
    p_attr_val = "",
) {

    return new Promise((resolve, reject) => {

        apex.server.process(
            "CREATE_DYNAMIC_BLOCK",
            {
                x01: p_pog_code,
                x02: p_pog_version,
                x03: p_attr_val,
                //p_clob_01: JSON.stringify(g_pog_json[g_pog_index])
            },
            {
                dataType: "json",

                success: async function (data) {

                    try {

                        console.log("Blocks:", data);
                        for (const row of data) {

                            // Create start/end coords
                            g_DragMouseStart = {
                                x: Number(row.x1),
                                y: Number(row.y1)
                            };

                            g_DragMouseEnd = {
                                x: Number(row.x2),
                                y: Number(row.y2)
                            };

                            console.log(
                                "Start:", g_DragMouseStart,
                                "End:", g_DragMouseEnd
                            );

                            // Get autofill info
                            [
                                g_autofillModInfo,
                                g_autofillShelfInfo
                            ] = getAutofillModShelf(
                                g_DragMouseStart,
                                g_DragMouseEnd,
                                g_pog_json,
                                g_pog_index
                            );

                            console.log("Mod Info:", g_autofillModInfo);
                            console.log("Shelf Info:", g_autofillShelfInfo);

                            // Create block
                            var isBlockCreated = await setAutofillBlock( // ASA-1986 start
                                'A',
                                row.block_name,
                                'N',
                                'N',
                                row.color,
                            );
                            if (isBlockCreated !== true) {  // ASA-1986 start
                                console.warn("Skipped block due to invalid block dimensions:", row.block_name);
                                continue;
                            }
                            console.log(
                                "Created Block:",
                                row.block_name,
                                row.color
                            );

                            // Small delay (render safety)
                            await new Promise(r => setTimeout(r, 50));
                        }
                        if (p_saveColl == "Y") {
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
                            var retval = await save_blk_dtl_coll('A', 'Blks', block_details_arr);
                            apex.region("mod_block_details").refresh();
                            apex.region("added_attribute").refresh();
                             wpdCaptureShowChangesBlockSnapshot(g_mod_block_list); // ASA-1986
                        }
                        console.log("All blocks created");

                        //Resolve when done
                        resolve(true);

                    } catch (e) {
                        reject(e);
                    }
                },

                error: function (err) {
                    console.error("AJAX Error:", err);
                    reject(err);
                }
            }
        );

    });
}

async function save_af_version() {

    logDebug("function : save_af_verion", "S");

    var l_pog_code = $v('P193_OPEN_POG_CODE');
    var l_pog_code_version = $v('P193_OPEN_POG_VERSION');
    var l_seq_no = $v('P193_DRAFT_LIST');

    var mod_tot = 0;

    if (apex.region("mod_block_details") !== null) {
        var mod_model = apex.region("mod_block_details")
            .widget()
            .interactiveGrid("getViews", "grid")
            .model;

        mod_tot = mod_model.getTotalRecords();
    }

    if (mod_tot == 0) {
        alert(get_message('POGCR_BLK_NULL'));
        return;
    }

    apex.server.process(
        "CHECK_AUTOFILL_EXISTS",
        {
            x01: l_pog_code,
            x02: l_pog_code_version
        },
        {
            dataType: "text",

            success: function (pText) {

                pText = $.trim(pText);
                console.log("Exists Check:", pText);

                if (pText == "YES") {

                    apex.message.confirm(
                        "Do you want to override the existing version?",
                        function (okPressed) {
                            if (okPressed) {
                                proceed_save('U');
                            } else {
                                proceed_save('N');
                            }
                        }
                    );

                }
                if (pText == "DELETE") {
                    apex.message.confirm(
                        "You already have existing blockings.Process to delete oldest version",
                        function (okPressed) {
                            if (okPressed) {
                                proceed_save('D');
                            } else {
                                console.log('NO ACTION');
                            }
                        }
                    );

                }
                if (pText == "OVERIDE") {
                    apex.message.confirm(
                        "You already have existing blockings.Do you want to overide?",
                        function (okPressed) {
                            if (okPressed) {
                                proceed_save('O');
                            } else {
                                console.log('NO ACTION');
                            }
                        }
                    );
                }
                if (pText == "NO") {
                    proceed_save('S');
                }
            }
        }
    );

    function proceed_save(p_action) {
        const l_af_version = getAfVersion();
        g_autofill_detail['AFPOGCode'] = l_pog_code;
        g_autofill_detail['AFPOGVersion'] = l_pog_code_version;
        g_autofill_detail['AFVersion'] = l_af_version, //$v('P193_AF_VERSION');
            g_autofill_detail['BlkSelType'] = 'M';
        g_autofill_detail['AutofillRule'] = $v('P193_AUTOFILL_RULE');
        g_autofill_detail['BlkInfo'] = g_mod_block_list;

        apex.server.process(
            "SAVE_AUTOFILL",
            {
                x01: g_autofill_detail["AFPOGCode"],
                x02: $v('P193_AF_VERSION'), //g_autofill_detail["AFVersion"],
                x03: g_autofill_detail["AutofillRule"],
                x04: g_autofill_detail["BlkSelType"],
                x05:
                    g_autofill_detail["AFPOGVersion"] == "" ||
                        typeof g_autofill_detail["AFPOGVersion"] == "undefined"
                        ? g_autofill_detail["AFVersion"]
                        : g_autofill_detail["AFPOGVersion"],

                p_clob_01: JSON.stringify(
                    filterAutoFillJsontag(g_autofill_detail)
                ),
                x06: p_action,
                x07: l_af_version
            },
            {
                dataType: "text",

                success: function (pData) {

                    var return_data = $.trim(pData).split(",");
                    if (return_data[0] == "ERROR") {
                        raise_error(pData);
                    }
                },
            }
        );
    }
}

function getAfVersion() {
    const now = new Date();

    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, "0");
    const DD = String(now.getDate()).padStart(2, "0");
    const HH = String(now.getHours()).padStart(2, "0");
    const MI = String(now.getMinutes()).padStart(2, "0");
    const SS = String(now.getSeconds()).padStart(2, "0");

    return Number(`${YYYY}${MM}${DD}${HH}${MI}${SS}`);
}



// Reorder Attributes
function wpdInitializeAttributeReorder() {
    const containers = document.querySelectorAll(
        ".u-tC"
    );
    containers.forEach(container => {
        let draggedChip = null;
        container.addEventListener("dragstart", function (e) {
            const chip = e.target.closest(".attr-chip");
            if (!chip) return;
            draggedChip = chip;
            chip.classList.add("dragging");
        });
        container.addEventListener("dragend", function (e) {
            const chip = e.target.closest(".attr-chip");
            if (!chip) return;
            chip.classList.remove("dragging");
            draggedChip = null;
        });
        container.addEventListener("dragover", function (e) {
            e.preventDefault();
            if (!draggedChip) return;
            const insertBeforeElement =
                wpdGetAttributeInsertPosition(container, e.clientY);
            if (insertBeforeElement == null) {
                container.appendChild(draggedChip);
            } else {
                container.insertBefore(draggedChip, insertBeforeElement);
            }
        });
    });
}
function wpdGetAttributeInsertPosition(container, mouseY) {
    const chips = [
        ...container.querySelectorAll(".attr-chip:not(.dragging)")
    ];
    return chips.reduce((closest, chip) => {
        const box = chip.getBoundingClientRect();
        const offset = mouseY - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return {
                offset: offset,
                element: chip
            };
        } else {
            return closest;
        }
    }, {
        offset: Number.NEGATIVE_INFINITY
    }).element;
}
function wpdCollectAttributeSequence(container) {
    const chips = container.querySelectorAll(".attr-chip");
    const sequence = [];
    chips.forEach((chip, index) => {
        sequence.push({
            seq_id: chip.dataset.seq,
            new_position: index + 1
        });
    });
    return sequence;
}
// Initialize
wpdInitializeAttributeReorder();

async function open_view_analysis() {
    logDebug("function : open_view_analysis", "S");
    try {
        let l_pog_code = g_pog_json[g_pog_index].POGCode;
        let l_pog_version = g_pog_json[g_pog_index].Version;
        await show_view_analysis(l_pog_code, l_pog_version);
    } catch (err) {
        error_handling(err);
    } finally {
        logDebug("function : open_view_analysis", "E");
    }
}



function add_pog_versions() {
    logDebug("function : add_pog_versions", "S");
    try {
        const select = document.getElementById("top_ver");
        if (!select) return;
        select.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select";
        select.appendChild(defaultOption);
        const versions = $v("P193_AF_VERSIONS");
        const defaultVersion = $v("P193_AF_VERSION");
        if (versions && versions.trim() !== "") {
            const versionArray = versions.split(":");
            versionArray.forEach(function (ver) {
                const trimmedVer = ver.trim();
                const option = document.createElement("option");
                option.value = trimmedVer;
                option.textContent = trimmedVer;
                if (trimmedVer === defaultVersion) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
        logDebug("function : add_pog_versions", "E");

    } catch (err) {
        logDebug("function : add_pog_versions", "E");
        error_handling(err);
    }
}


function apply_attribute_selection() {
    logDebug("function : apply_attribute_selection", "S");
    try {
        const select = document.getElementById("attr_select");
        if (!select) return;
        select.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.value = "Default";
        defaultOption.textContent = "Default";
        select.appendChild(defaultOption);
        const chips = document.querySelectorAll(".attr-chip");
        chips.forEach(chip => {
            const nameEl = chip.querySelector(".attr-name");
            const valueEl = chip.querySelector(".attr-value");
            if (nameEl && valueEl) {
                const option = document.createElement("option");
                option.textContent = nameEl.textContent.trim();
                option.value = valueEl.textContent.trim();
                select.appendChild(option);
            }
        });
        logDebug("function : apply_attribute_selection", "E");

    } catch (err) {
        logDebug("function : apply_attribute_selection", "E");
        error_handling(err);
    }
}

async function handle_attribute_change(selectElement) {
    logDebug("function : handle_attribute_change", "S");
    try {
        var selectedValue = selectElement.value;
        var selectedText = selectElement.options[selectElement.selectedIndex].text;
        for (const obj of g_mod_block_list) {
            for (const child of obj.BlockDim.ColorObj.children) {
                if (child.uuid == obj.BlkName) {
                    obj.BlockDim.ColorObj.remove(child);
                    break;
                }
            }
        }
        render(g_pog_index);
        g_mod_block_list = [];
        await createDynamicBlocks($v('P193_OPEN_POG_CODE'), $v('P193_OPEN_DRAFT'), $v('P193_OPEN_POG_VERSION'), "Y", (selectedValue === 'Default') ? '' : selectedValue);
        apex.region("mod_block_details").refresh();
        logDebug("function : handle_attribute_change", "E");

    } catch (err) {
        logDebug("function : handle_attribute_change", "E");
        error_handling(err);
    }
}

async function handle_version_change(selectElement) {
    logDebug("function : handle_version_change", "S");
    try {
        var selectedValue = selectElement.value;
        var selectedText = selectElement.options[selectElement.selectedIndex].text;
       for (const obj of g_mod_block_list) {
            for (const child of obj.BlockDim.ColorObj.children) {
                if (child.uuid == obj.BlkName) {
                    obj.BlockDim.ColorObj.remove(child);
                    break;
                }
            }
        }
        render(g_pog_index);
        g_mod_block_list = [];
        g_autofill_detail = [];
        g_auto_fill_active = "N";
        await auto_fill_setup(0, selectedValue);
        apex.region("mod_block_details").refresh();
        wpdCaptureShowChangesBlockSnapshot(g_mod_block_list, "Y"); //ASA-1986 
        logDebug("function : handle_version_change", "E");

    } catch (err) {
        logDebug("function : handle_version_change", "E");
        error_handling(err);
    }
}

// Enabble Context menu on right click
function onContextMenu(p_event) {
    logDebug("function : onContextMenu", "S");
    var valid = "N";
    if (p_event.target.nodeName == "CANVAS" && g_scene_objects.length > 0) {
        set_curr_canvas(p_event);
        g_canvas = p_event.target;
        g_pog_index = parseInt(g_canvas.getAttribute("data-indx"));
        g_context_opened = "Y";
        var is_divider = "N";
        var canvas_width = 0,
            border = 0,
            g_duplicate_fixel_flag = "N";
        if (g_compare_pog_flag == "Y") {
            border = 5;
        }
        console.log("event", p_event.target, g_pog_index);
        //getting the canvas bounding area and find out the client x and y where right click was done.
        var r = g_canvas.getBoundingClientRect();
        var start_x = r.left;
        var start_y = r.top;
        var x = p_event.clientX - r.left;
        var y = p_event.clientY - r.top;
        prevX = startX = x;
        prevY = startY = y;
        //Pass that to doMouseDown function to find out which object was hit.
        g_dragging = doMouseDown(x, y, start_x, start_y, p_event, g_canvas, "Y", g_pog_index);
        console.log("return from MouseDown", g_dragging);
        console.log("constext ", g_start_canvas, g_ComViewIndex, g_compare_view, g_compare_pog_flag);
        if (g_carpark_item_flag == "N" && g_carpark_edit_flag == "N" && ((g_start_canvas == g_ComViewIndex && g_compare_view == "POG" && g_compare_pog_flag == "Y") || (g_start_canvas !== g_ComViewIndex && g_compare_pog_flag == "Y") || g_compare_pog_flag == "N")) {
            p_event.preventDefault();
            new_details = JSON.parse(JSON.stringify(g_delete_details));
            for (const objects of new_details) {
                objects.ShelfInfo = "";
            }
            valid = "Y";
        }        
        //Below block will set the position of the context menu and the submenus for example Edit Facings. according to the mouse right click location.
        if (valid == "Y") {
            var header = document.getElementById("t_Header");
            var breadcrumb = document.getElementById("t_Body_title");
            var top_bar = document.getElementById("top_bar");
            var side_nav = document.getElementById("t_Body_nav");
            var button_cont = document.getElementById("side_bar");
            var canvas_btn = document.getElementById("maincanvas-btns");
            var canvas_btn_height = typeof canvas_btn !== "undefined" && canvas_btn !== null ? canvas_btn.offsetHeight : 0;
            var devicePixelRatio = window.devicePixelRatio;
            var padding = parseFloat($(".t-Body-contentInner").css("padding-left").replace("px", ""));

            var header_height = header.offsetHeight; // devicePixelRatio;
            var breadcrumb_height = breadcrumb.offsetHeight; // devicePixelRatio;
            var top_bar_height = top_bar.offsetHeight; // devicePixelRatio;
            var side_nav_width = side_nav.offsetWidth; // devicePixelRatio;
            var btn_cont_width = button_cont.offsetWidth; //devicePixelRatio;
            var contextElement = document.getElementById("context-menu");

            var inner_width_edit = parseInt(p_event.clientX - $(".t-Region-body").scrollLeft() + contextElement.offsetWidth);
            var window_width = parseInt($(window).width() - (side_nav_width + btn_cont_width));
            var inner_width_noedit = parseInt(p_event.clientX - $(".t-Region-body").scrollLeft() + contextElement.offsetWidth);

            //if (event.clientY + contextElement.offsetHeight > window.innerHeight) { beacuse when we click shelf or item from bottom second last shelf its show the context menu not properly in biottom
            if (p_event.clientY > (window.innerHeight / 2)) { //ASA-1236
                contextElement.style.top = p_event.clientY - $(document).scrollTop() - contextElement.offsetHeight + "px"; //+ (header_height + breadcrumb_height + top_bar_height + padding) - contextElement.offsetHeight + border + canvas_btn_height + "px";
            } else {
                contextElement.style.top = p_event.clientY - $(document).scrollTop() + "px"; //+ (header_height + breadcrumb_height + top_bar_height + padding) + border + canvas_btn_height + "px";
            }

            if (inner_width_edit > window_width && (g_shelf_edit_flag == "Y" || g_item_edit_flag == "Y")) {
                contextElement.style.left = p_event.clientX - $(".t-Region-body").scrollLeft() - contextElement.offsetWidth + "px"; // + (side_nav_width + btn_cont_width + padding)) + border - contextElement.offsetWidth + "px";
            } else if (inner_width_noedit > window_width) {
                contextElement.style.left = p_event.clientX - $(".t-Region-body").scrollLeft() - contextElement.offsetWidth + "px"; // + (side_nav_width + btn_cont_width + padding)) + border - contextElement.offsetWidth + "px";              
            } 
            else {
                contextElement.style.left = p_event.clientX - $(".t-Region-body").scrollLeft() + "px"; // + (side_nav_width + btn_cont_width + padding)) + border + "px";               
            }
            console.log("contextElement.style.top", contextElement.style.top, contextElement.style.left, p_event);

            contextElement.classList.add("active");
        }
    }
    logDebug("function : onContextMenu", "E");
}

async function context_func(p_action) {
	logDebug("function : context_func; action : " + p_action, "S");
	if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
		if (p_action != "copy_pogc_image" && p_action != "zoom_selected_pogc" && g_module_edit_flag == "N" && g_shelf_edit_flag == "N" && g_item_edit_flag == "N" && p_action !== "edit" && g_multiselect !== "Y" && p_action !== "muledit") {
			alert(get_message("NO_OBJECT_ERROR"));
		} else {
			if (p_action == "add") {
				context_add();
			} else if (p_action == "delete") {
				delete_blk_details('BLK_PREGNANCY TEST KIT_1_AFP');
			} else if (p_action == "edit") {
				open_blk_details('BLK_PREGNANCY TEST KIT_1_AFP', 'Y');
			}
		}
	}
	g_taskItemInContext = "";
	g_context_opened = "N";
	logDebug("function : context_func", "E");
}




