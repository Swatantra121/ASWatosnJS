//This function is called from page 25 execute on page load.
function initiate_values_onload() {
    sessionStorage.setItem("g_dbuDebugEnabled", $v("P25_POGC_JS_DEBUG_ENABLE"));
    logDebug("onload code ; ", "S");
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
    var l_delete_ind = $v("P25_DELETE_IND");//pushed this variable inside as its used only in this function.
    back_clicked = "N";
    const input = document.getElementById("P25_UPLOAD_HIDDEN");

    //below event is assigned to image upload from textbox popup. to add a image to a textbox.
    input.onchange = function (event) {
        try {
            if ($v("P25_UPLOAD_HIDDEN") !== "") {
                const file = event.target.files[0]; // get the file
                var file_name,
                    mimetype;
                const blobURL = URL.createObjectURL(file);
                const img = new Image();
                img.src = blobURL;
                img.onerror = function () {
                    URL.revokeObjectURL(this.src);
                    // Handle the failure properly
                };
                img.onload = function () {
                    URL.revokeObjectURL(this.src);
                    var resolution = $v("P25_POGCR_IMG_RESOLUTION").split("x");
                    //resize image based on resolution setup.
                    const [newWidth, newHeight] = calculateSize(img, parseFloat(resolution[0]), parseFloat(resolution[1]));
                    const canvas = document.createElement("canvas");
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    file_name = file.name;
                    mimetype = file.type;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    canvas.toBlob(
                        (blob) => {
                            var dataURL = canvas.toDataURL(mimetype);
                            const [canvasWidth, canvasHeight] = get_visible_size(0.012, parseFloat($v("P25_TEXT_WIDTH")) / 100, parseFloat($v("P25_TEXT_HEIGHT")) / 100, canvas, g_camera);
                            var l_new_canvas = document.createElement("canvas");
                            l_new_canvas.width = canvasWidth;
                            l_new_canvas.height = canvasHeight;
                            const ctx = l_new_canvas.getContext("2d");
                            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                            var temp_image = {};
                            g_temp_image_arr = [];
                            temp_image["FileName"] = file_name;
                            temp_image["MimeType"] = mimetype;
                            temp_image["Image"] = dataURL.split(",")[1];
                            temp_image["ImageBlob"] = blob;
                            temp_image["MaxWidth"] = newWidth;
                            temp_image["MaxHeight"] = newHeight;
                            temp_image["CompressRatio"] = parseFloat($v("P25_COMPRESS_RATIO"));
                            g_temp_image_arr.push(temp_image);
                            // Handle the compressed image. es. upload or save in local state
                            $("#P25_IMG_FILENAME").removeClass("apex_disabled");
                            $s("P25_IMG_FILENAME", file_name);
                            $("#P25_IMG_FILENAME").addClass("apex_disabled");
                            $("#IMAGE_AREA canvas").remove();
                            document.getElementById("IMAGE_AREA").append(l_new_canvas);

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
                        },
                        mimetype,
                        parseFloat($v("P25_COMPRESS_RATIO")));

                    $("#P25_UPLOAD_HIDDEN")[0].value = "";
                };
            }
        } catch (err) {
            error_handling(err);
        }
    };

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
                        g_camera.position.set(g_camera.position.x, g_camera.position.y, g_camera.position.z - parseFloat($v("P25_POGCR_CAMERA_ZOOM_FACTOR")));
                        g_manual_zoom_ind = "Y";
                        render(g_pog_index);
                    } else if (e.keyCode == 40 && e.ctrlKey == true && typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                        //Ctrl + Arrow down = zoom out
                        $("#maincanvas").css("cursor", "zoom-out");
                        g_camera.position.set(g_camera.position.x, g_camera.position.y, g_camera.position.z + parseFloat($v("P25_POGCR_CAMERA_ZOOM_FACTOR")));
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
            sessionStorage.setItem("P25_EXISTING_DRAFT_VER", $v("P25_EXISTING_DRAFT_VER"));
            sessionStorage.setItem("P25_DRAFT_LIST", $v("P25_DRAFT_LIST"));
            sessionStorage.setItem("P25_POG_DESCRIPTION", $v("P25_POG_DESCRIPTION"));
            sessionStorage.setItem("P25_SELECT_COLOR_TYPE", $v("P25_SELECT_COLOR_TYPE"));
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
                    update_module_block_list("U", $v("P25_EDIT_BLK"), "Y");
                }
                apex.theme.openRegion("auto_fill_reg");
                g_auto_fill_reg_open = "Y";
            } else if (g_auto_fill_active == "Y" && g_auto_fill_reg_open == "Y") {
                clear_auto_fill_coll();
            }
            $s("P25_MODULE_EDIT_IND", "N");
            $s("P25_SHELF_EDIT_IND", "N");
            $s("P25_POG_EDIT_IND", "N");
            $s("P25_ITEM_EDIT_IND", "N");
            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_module_index !== "" && g_module_index !== -1 && g_shelf_index !== "" && g_shelf_index !== -1) {
                if (g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].TextImg == "") {
                    g_temp_image_arr = [];
                    $s("P25_IMG_FILENAME", "");
                    $("#IMAGE_AREA canvas").remove();
                    $("#VIEW_IMAGE canvas").remove();
                }
            } else {
                g_temp_image_arr = [];
                $s("P25_IMG_FILENAME", "");
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
    //hide all the buttons that is not needed to show when enter to page for first time. those button will be shown after POG skeleton is created.
    $("#drawing_region .t-Region-header, #DELETE_POG, #DELETE_SHELF, #DELETE_TEXT").css("display", "none");
    $(".create_module, .create_shelf, .create_pegboard, .create_text, .create_hangingbar, .create_basket, .create_chest, .create_rod, .create_pallet, .create_divider").css("visibility", "hidden");
    $(".open_pdf, .open_fixel, .clear_item, .clear_pog_att, .clear_pog_info, .item_color_legends").css("display", "block");
    if ("&AI_EDIT_IND." == "N") {
        $("#create_pog_btn").hide();
        $(".create_module, .create_shelf, .create_pegboard, .create_text, .create_hangingbar, .create_basket, .create_chest, .create_rod, .create_pallet, .create_divider").css("visibility", "hidden");
    }
    if ("&AI_EDIT_IND." == "N" && "&AI_DELETE_IND." == "N") {
        $(".save_draft, .save_pog, .save_template").hide();
    }
    $("#P25_DRAFT_LIST").removeClass("apex_disabled");

    if ($v("P25_SHOW_PRODUCT") == "N") {
        $(".open_product").css("display", "block");
        $(".close_product").css("display", "none");
    } else {
        $(".open_product").css("display", "none");
        $(".close_product").css("display", "block");
    }
    //This is the X button on right side corner of the popup. when user click that to close also we need to reset all variables and revert the action user performed.
    $("button.ui-dialog-titlebar-close").on("click", function (event) {
        g_dblclick_opened = "N";
        $s("P25_UPLOAD_HIDDEN", "");
        $s("P25_SHELF_EDIT_IND", "N");
        console.log('$s("P25_SHELF_EDIT_IND"', $v("P25_SHELF_EDIT_IND"));
        g_multiselect = "N"; //ASA-1244
        g_mselect_drag = "N"; //ASA-1244
        g_ctrl_select = "N";
        g_productselect = "N";
        if (g_module_index !== "" && g_module_index !== -1 && g_shelf_index !== "" && g_shelf_index !== -1) {
            if (typeof g_pog_json !== "undefined") {
                if (g_pog_json[g_pog_index].length > 0) {
                    if (new_pogjson[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].TextImg == "") {
                        g_temp_image_arr = [];
                        $s("P25_IMG_FILENAME", "");
                        $("#IMAGE_AREA canvas").remove();
                        $("#VIEW_IMAGE canvas").remove();
                    }
                }
            }
        } else {
            g_temp_image_arr = [];
            $s("P25_IMG_FILENAME", "");
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
    $s("P25_DRAFT_LIST", sessionStorage.getItem("P25_DRAFT_LIST"));
    g_color_arr = sessionStorage.getItem("g_color_arr") !== null ? JSON.parse(LZString.decompress(sessionStorage.getItem("g_color_arr"))) : [];
    g_highlightArr = sessionStorage.getItem("g_highlightArr") !== null ? JSON.parse(LZString.decompress(sessionStorage.getItem("g_highlightArr"))) : [];
    $s("P25_POG_DESCRIPTION", sessionStorage.getItem("P25_POG_DESCRIPTION"));
    $s("P25_EXISTING_DRAFT_VER", sessionStorage.getItem("P25_EXISTING_DRAFT_VER"));
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
    g_chest_as_pegboard = $v("P25_POGCR_CHEST_AS_PEGBOARD");
    g_nodataModuleName = $v("P25_POGCR_NO_DATA_MODULE_NAME");
    g_lr_overhung = $v("P25_POGCR_L_R_OVERHUNG");
    g_pogcr_pdf_chest_split = $v("P25_POGCR_PDF_CHEST_SPLIT");
    g_start_canvas = 0;
    g_show_fixel_space = $v("P25_POGCR_DFLT_FIXEL_AVLSPACE_LBL");
    g_show_days_of_supply = $v("P25_POGCR_DFT_DAYS_OF_SUPPLY");
    g_get_orient_images = $v("P25_POGCR_OTHER_ORIENTATION_IMG");
    g_drag_shelf_notch = $v("P25_POGCR_DRAG_SHELF_TO_NOTCH");
    g_hangbar_dft_maxmerch = parseFloat($v("P25_POGCR_HGNGBAR_DFLT_MAXMCH")) / 100;
    g_pegboard_dft_item_depth = parseFloat($v("P25_POGCR_DFT_PEGB_ITEM_DEPTH")) / 100; //ASA-1109
    g_pegbrd_auto_placing = $v("P25_POGCR_PEGBOARD_AUTO_PLACING");
    g_pog_index = 0;
    g_notch_label_position = $v("P25_POGCR_NOTCH_LABEL_POSITION").toUpperCase();
    g_overhung_validation = $v("P25_POGCR_OVERHUNG_VALIDTION");
    g_edit_ind = $v("P25_EDIT_IND");
    g_default_checkbox = $v("P25_POGCR_DIVIDER_PLACING_DFLT_CB");
    g_chest_move = "N", //ASA-1300
        g_auto_x_space = parseFloat($v("P25_POGCR_CHEST_ITEM_H_SPC")) / 100,
        g_auto_y_space = parseFloat($v("P25_POGCR_CHEST_ITEM_V_SPC")) / 100;
    g_multi_select_offset_perc = parseFloat($v('P25_POGCR_MULTI_SLCT_OFFSET_PERC')); //ASA-1422
    g_select_item_color_change = $v("P25_POGCR_BLINK_COLOR_CHANGE");
    g_textbox_threshold_value = parseFloat($v("P25_POGCR_THRESHOLD_TEXTBOX_VALUE")) / 100;//ASA-1487
    g_type_pog = sessionStorage.getItem("g_type_pog") !== null ? sessionStorage.getItem("g_type_pog") : "";//ASA-1507
    g_open_from = "";
    g_sublabel_type = $v("P25_POGCR_ITEM_ADDITIONAL_INFO");
    g_pogcr_live_new_item = $v('P25_POGCR_LIVE_NEW_ITEM');//ASA-1533 issue 1
    g_pogcr_dflt_fixel_num = $v('P25_POGCR_DFLT_FIXEL_NUM');
    g_default_max_merch = $v("P25_POGCR_DFT_MAX_MERCH");
    var renumb_field = g_pogcr_dflt_fixel_num.split(';');
    $s('P25_TEXTBOX_START_WITH', renumb_field[0]);
    $s('P25_DIVIDER_START_WITH', renumb_field[1]);
    document.documentElement.style.setProperty('--product_list_blink_color', g_select_item_color_change.replace('0x', '#'));     //ASA-1640
    g_product_list_blink = $v('P25_PRODUCT_LIST_BLINK');    //ASA-1640
    g_multi_cnvs_drag_conf = $v('P25_MULTI_CNVS_DRAG_CNFRM');    //ASA-1640
    g_item_stack_valid = $v("P25_POGCR_ITEM_STACK_VALID_YN");   //ASA-1652
    g_wf_pog_approval_enabled = $v('P25_WF_POG_APPROVAL_ENABLED');     //Regression 5 20250217
    g_pogcr_pog_approval_for_new_pog = $v('P25_POGCR_POG_APPROVAL_FOR_NEW_POG');  //Regression 5 20250217
    g_pogcr_enbl_oos_border = $v("P25_POGCR_ENBL_OOS_BORDER"); //ASA-1688
    g_pogcr_oos_border_color = $v("P25_POGCR_OOS_BORDER_COLOR"); //ASA-1688
    g_pogcr_enhance_textbox_fontsize = $v("P25_POGCR_ENHANCE_TEXTBOX_FONTSIZE"); // ASA-1787
    g_item_vertical_text_display = $v("P25_ITEM_CODE_VERT_ALN"); //ASA-1847 4.1
    g_item_text_center_align = $v("P25_ITEM_CODE_CTR_ALN"); //ASA-1847 4.1


    //this is a common function called from all the page where three asw_common_main is used. this will set global variables and can be used across all pages.
    setParams($v("P25_POGCR_LABEL_TEXT_SIZE"), $v("P25_POGCR_STATUS_ERR_COLOR"), $v("P25_CAMERA_Z"), $v("P25_POGCR_TEXBOX_MERGE_PDF"), $v("P25_POGCR_HNGBAR_DFCNG_MAXMCH"), $v("P25_POGCR_AUTO_APLY_DEPTH_FAC"), $v("P25_POGCR_AUTO_APLY_VERT_FAC"), null, $v("P25_POGCR_ITEM_DIM_ERR_COLOR"), $v("P25_AUTO_HLITE_NON_MV_ITEM"), $v("P25_POGCR_NOIMAGE_SHOW_DESC"), $v('P25_POGCR_NOTCH_LABEL_POSITION'), $v("P25_POGCR_FIXEL_ITEM_LABEL"), $v("P25_POGCR_ITEM_DESC_VERTI"), parseFloat($v("P25_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload

    //below are the list of short cut keys assigned to many of the buttons created in WPD screens.
    apex.actions.add({
        name: "create-pog",
        label: "Create POG",
        action: function (event, focusElement, data) {
            create_pog_modal("icon-bar", "create_pog", "add_pog");
        },
        shortcut: "Alt+C,N",
    });
    apex.actions.add({
        name: "open-template",
        label: "Open Template",
        action: function (event, focusElement, data) {
            open_template();
        },
        shortcut: "Alt+C,O",        //ASA-1694 Changed from 'T' to 'O'
    });
    //ASA-1694
    apex.actions.add({
        name: "create-template",
        label: "New Template",
        action: function (event, focusElement, data) {
            create_pog_modal("icon-bar", "create_template", "add_pog");
        },
        shortcut: "Alt+C,T",
    });
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
        name: "live-image",
        label: "Live Image",
        action: async function (event, focusElement, data) {
            //ASA-1761, modified below block earlier only this "live_image()" was being called
            event.preventDefault();
            const overlay = document.createElement("div");
            overlay.id = "cursorOverlay";
            overlay.style.position = "fixed";
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = "100vw";
            overlay.style.height = "100vh";
            overlay.style.cursor = "wait";
            overlay.style.zIndex = 9999;
            overlay.style.backgroundColor = "transparent";
            document.body.appendChild(overlay);

            await new Promise(requestAnimationFrame);
            await menuActions("LIVE_IMAGE", "-");

            document.body.removeChild(overlay);
        },
        shortcut: "Alt+L",
    });

    apex.actions.add({
        name: "3d-view",
        label: "3d View",
        action: function (event, focusElement, data) {
            menuActions("OPEN_3D", "-");
        },
        shortcut: "Alt+3",
    });

    //For Renumbering Shortcuts
    apex.actions.add({
        name: "Renumbering",
        label: "Renumbering",
        action: function (event, focusElement, data) {
            menuActions("RENUMBERING", "-");
        },
        shortcut: "Alt+B,R",
    });

    apex.actions.add({
        name: "Fixel-Label",
        label: "Fixel Label",
        action: function (event, focusElement, data) {
            menuActions("FIXEL_LABEL", "-");
        },
        shortcut: "Alt+B,F",
    });

    apex.actions.add({
        name: "Item-Label",
        label: "Item Label",
        action: function (event, focusElement, data) {
            menuActions("ITEM_LABEL", "-");
        },
        shortcut: "Alt+B,I",
    });

    apex.actions.add({
        name: "Notch-Label",
        label: "Notch Label",
        action: function (event, focusElement, data) {
            menuActions("NOTCH_LABEL", "-");
        },
        shortcut: "Alt+B,U",
    });

    apex.actions.add({
        name: "Recal-Compare",
        label: "Recal Compare",
        action: function (event, focusElement, data) {
            menuActions("Recal_Compare", "-");
        },
        shortcut: "Alt+B,C",
    });

    apex.actions.add({
        name: "Maxm-Label",
        label: "Max Merch Label",
        action: function (event, focusElement, data) {
            menuActions("FIXEL_MERCH", "-");
        },
        shortcut: "Alt+B,M",
    });

    apex.actions.add({
        name: "Highlight",
        label: "Highlight",
        action: function (event, focusElement, data) {
            menuActions("CONDITIONAL_HIGHLIGHT", "-");
        },
        shortcut: "Alt+B,H",
    });
    apex.actions.add({
        name: "Item-Group",
        label: "Item Group",
        action: function (event, focusElement, data) {
            // menuActions('OPEN_3D', '-');
        },
        shortcut: "Alt+B,G",
    });
    apex.actions.add({
        name: "ShowFixel-AvailSpace",
        label: "Show Fixel Available Space",
        action: function (event, focusElement, data) {
            menuActions("FIXEL_AVAILABLE_SPACE", "-");
        },
        shortcut: "Alt+B,A",
    });
    apex.actions.add({
        name: "ShowItem-Desc",
        label: "Show Item Description",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_DESCRIPTION", "-");
        },
        shortcut: "Alt+B,D",
    });
    apex.actions.add({
        name: "Daysof-Supply",
        label: "Days of Supply",
        action: function (event, focusElement, data) {
            menuActions("SHOW_DAYS_OF_SUPPLY", "-");
        },
        shortcut: "Alt+B,Q",
    });
    //Shortcut keys for Utilities
    apex.actions.add({
        name: "Clear-POGInfo",
        label: "Clear POG Info",
        action: function (event, focusElement, data) {
            menuActions("CLEAR_POG", "-");
        },
        shortcut: "Alt+U,C",
    });

    apex.actions.add({
        name: "Open-Fixel",
        label: "Open Fixel",
        action: function (event, focusElement, data) {
            menuActions("OPEN_FIXEL", "-");
        },
        shortcut: "Alt+U,X",
    });
    apex.actions.add({
        name: "Auto-AlignPeg",
        label: "Auto Align Pegboard Items",
        action: function (event, focusElement, data) {
            update_auto_position_peg();
        },
        shortcut: "Alt+U,P",
    });

    apex.actions.add({
        name: "Generate-PDF",
        label: "Generate PDF",
        action: function (event, focusElement, data) {
            open_pdf();
        },
        shortcut: "Alt+U,G",
    });

    apex.actions.add({
        name: "Generate-PDFOn",
        label: "Generate PDF Online",
        action: function (event, focusElement, data) {
            open_pdf_online();
        },
        shortcut: "Alt+U,O",
    });

    apex.actions.add({
        name: "Maximize-Facing",
        label: "Maximize Facing",
        action: function (event, focusElement, data) {
            menuActions("MAXIMIZE_FACINGS", "S");
        },
        shortcut: "Alt+U,M",
    });

    apex.actions.add({
        name: "Clear-Item",
        label: "Clear Item",
        action: function (event, focusElement, data) {
            menuActions("CLEAR_ITEM", "N");
        },
        shortcut: "Alt+U,I",
    });

    apex.actions.add({
        name: "Clear-Attribute",
        label: "Clear Attribute",
        action: function (event, focusElement, data) {
            clear_pog_att_init("N");
        },
        shortcut: "Alt+U,A",
    });

    apex.actions.add({
        name: "Maxm-FacAll",
        label: "Maximize Facing All",
        action: function (event, focusElement, data) {
            menuActions("MAXIMIZE_FACINGS", "A");
        },
        shortcut: "Alt+U,F",
    });

    apex.actions.add({
        name: "Peg-Holes",
        label: "Peg Holes",
        action: function (event, focusElement, data) {
            menuActions("PEG_HOLES", "-");
        },
        shortcut: "Alt+U,H",
    });

    apex.actions.add({
        name: "Peg-Tages",
        label: "Peg Tages",
        action: function (event, focusElement, data) {
            menuActions("PEG_TAGS", "-");
        },
        shortcut: "Alt+U,T",
    });

    apex.actions.add({
        name: "Reset-Zoom",
        label: "Reset Zoom",
        action: function (event, focusElement, data) {
            menuActions("RESET_ZOOM", "-");
        },
        shortcut: "Alt+Z,R",
    });

    apex.actions.add({
        name: "area-zoom",
        label: "Area Zoom",
        action: function (event, focusElement, data) {
            menuActions("AREA_ZOOM", "-");
        },
        shortcut: "Alt+Z,A",
    });

    apex.actions.add({
        name: "area-zoomarea",
        label: "Area Zoom Area",
        action: function (event, focusElement, data) {
            menuActions("AREA_ZOOM_AREA", "-");
        },
        shortcut: "Alt+Z,S",
    });

    //Auto Position

    apex.actions.add({
        name: "Auto-Position",
        label: "Auto Position",
        action: function (event, focusElement, data) {
            menuActions("AUTO_POSITION", "-");
        },
        shortcut: "Alt+A,A",//ASA-1694 Alt+A,N",
    });

    apex.actions.add({
        name: "Auto-PosiALL",
        label: "Auto Position ALL",
        action: function (event, focusElement, data) {
            menuActions("AUTO_POSITION_ALL", "-");
        },
        shortcut: "Alt+A,L",
    });

    apex.actions.add({
        name: "Auto-PosiPeg",
        label: "Auto Position Pegboard",
        action: function (event, focusElement, data) {
            menuActions("AUTO_POSITION_PEG", "-");
        },
        shortcut: "Alt+A,E",
    });

    //Open Product ShortcutKey
    apex.actions.add({
        name: "Open-Product",
        label: "Open Product",
        action: function (event, focusElement, data) {
            open_product("OPEN");
        },
        shortcut: "Alt+P",
    });

    // Compare View Shortcuts
    apex.actions.add({
        name: "Compare-POG",
        label: "Compare POG",
        action: function (event, focusElement, data) {
            menuActions("COMPARE_POG", "-");
        },
        shortcut: "Alt+V,C",
    });
    apex.actions.add({
        name: "Previous-Version",
        label: "Previous Version",
        action: function (event, focusElement, data) {
            menuActions("PREV_VERSION", "-");
        },
        shortcut: "Alt+V,P",
    });
    apex.actions.add({
        name: "Compare-Diff-Pog",
        label: "Compare POG",
        action: function (event, focusElement, data) {
            menuActions("PREV_VERSION", "DIFF");
        }
    });  //ASA-1803 Issue 1
    apex.actions.add({
        name: "Left",
        label: "Left",
        action: function (event, focusElement, data) {
            menuActions("CREATE_SIDE_VIEW", "LEFT");
        },
        shortcut: "Alt+V,L",
    });
    apex.actions.add({
        name: "Right",
        label: "Right",
        action: function (event, focusElement, data) {
            menuActions("CREATE_SIDE_VIEW", "RIGHT");
        },
        shortcut: "Alt+V,R",
    });
    apex.actions.add({
        name: "Top",
        label: "Top",
        action: function (event, focusElement, data) {
            menuActions("CREATE_SIDE_VIEW", "TOP");
        },
        shortcut: "Alt+V,T",
    });
    apex.actions.add({
        name: "Bottom",
        label: "Bottom",
        action: function (event, focusElement, data) {
            menuActions("CREATE_SIDE_VIEW", "BOTTOM");
        },
        shortcut: "Alt+V,B",
    });
    apex.actions.add({
        name: "Back",
        label: "Back",
        action: function (event, focusElement, data) {
            menuActions("CREATE_SIDE_VIEW", "BACK");
        },
        shortcut: "Alt+V,K",
    });
    apex.actions.add({
        name: "cutaway",
        label: "CutAway",
        action: function (event, focusElement, data) {
            menuActions("CREATE_SIDE_VIEW", "CUTAWAY");
        },
        shortcut: "Alt+V,A",
    });
    apex.actions.add({
        name: "edit-pallet",
        label: "Edit Pallet",
        action: function (event, focusElement, data) {
            menuActions("EDIT_PALLET", "-");
        },
        shortcut: "Alt+V,E",
    });
    apex.actions.add({
        name: "Close-Compare",
        label: "Close Compare",
        action: function (event, focusElement, data) {
            menuActions("CLOSE_COMPARE", "-");
        },
        shortcut: "Alt+V,X",
    });

    //Reports
    apex.actions.add({
        name: "Planogram-Itemdtls",
        label: "Planogram Item Details",
        action: function (event, focusElement, data) {
            open_pog_report("PLANOGRAM_ITEM_DETAIL");
        },
        shortcut: "Alt+R,P",
    });
    apex.actions.add({
        name: "Inout-Items",
        label: "In & Out Items",
        action: function (event, focusElement, data) {
            open_pog_report("IN_OUT_ITEMS_WPD_SCRN");
        },
        shortcut: "Alt+R,I",
    });

    //AutoFill setup
    apex.actions.add({
        name: "auto-fIll-pog",
        label: "Auto Fill POG",
        action: function (event, focusElement, data) {
            auto_fill_setup(g_pog_index); //ASA-1085
        },
        shortcut: "Alt+I",
    });

    //Side Nevigation Shortcuts
    apex.actions.add({
        name: "create-shelf",
        label: "create shelf",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_shelf", "add_shelf");
        },
        shortcut: "Space,S",
    });

    apex.actions.add({
        name: "Create-Module",
        label: "Create Module",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_module", "add_module");
        },
        shortcut: "Space,M",
    });

    apex.actions.add({
        name: "create-Pegboard",
        label: "Create Pegboard",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_pegboard", "add_shelf");
        },
        shortcut: "Space,G",
    });
    apex.actions.add({
        name: "create-Text",
        label: "Create Text",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_text", "add_textbox");
        },
        shortcut: "Space,T",
    });
    apex.actions.add({
        name: "create-hangingbar",
        label: "Create Hangingbar",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_hangingbar", "add_shelf");
        },
        shortcut: "Space,B",
    });
    apex.actions.add({
        name: "create-basket",
        label: "Create Basket",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_basket", "add_shelf");
        },
        shortcut: "Space,K",
    });
    apex.actions.add({
        name: "create-chest",
        label: "Create Chest",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_chest", "add_shelf");
        },
        shortcut: "Space,C",
    });
    apex.actions.add({
        name: "create-rod",
        label: "Create Rod",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_rod", "add_shelf");
        },
        shortcut: "Space,R",
    });
    apex.actions.add({
        name: "create-pallet",
        label: "Create Pallet",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_pallet", "add_shelf");
        },
        shortcut: "Space,P",
    });
    apex.actions.add({
        name: "create-divider",
        label: "Create Divider",
        action: function (event, focusElement, data) {
            open_modal("icon-bar", "create_divider", "add_divider");
        },
        shortcut: "Space,D",
    });

    //Download import and Save POG

    apex.actions.add({
        name: "download-Tem",
        label: "Download Temp",
        action: function (event, focusElement, data) {
            export_temp();
        },
        shortcut: "Alt+E,D",
    });

    apex.actions.add({
        name: "import-Tem",
        label: "Import Temp",
        action: function (event, focusElement, data) {
            import_temp();
        },
        shortcut: "Alt+E,I",
    });

    apex.actions.add({
        name: "save-pog",
        label: "Save POG",
        action: function (event, focusElement, data) {
            save_pog();
        },
        shortcut: "Alt+S",
    });
    apex.actions.add({
        name: "save-draft",
        label: "Save Draft",
        action: function (event, focusElement, data) {
            open_save_draft();
        },
        shortcut: "Alt+D",
    });
    apex.actions.add({
        name: "save-Template",
        label: "Save Template",
        action: function (event, focusElement, data) {
            save_template();
        },
        shortcut: "Alt+T",
    });

    apex.actions.add({ //ASA-1356
        name: "save-wpog",
        label: "Save WPOG",
        action: function (event, focusElement, data) {
            save_pog_final("Y");
        },
        shortcut: "Alt+W",
    });

    apex.actions.add({
        name: "Item-Gbrand",
        label: "Item Gbrand",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "IB");
        },
        shortcut: "Alt+G,B",
    });
    apex.actions.add({
        name: "Item-Gsupp",
        label: "Item Gsupp",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "IS");
        },
        shortcut: "Alt+G,S",
    });
    apex.actions.add({
        name: "Item-Glabel",
        label: "Item Glabel",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "IG");
        },
        shortcut: "Alt+G,L",
    });
    apex.actions.add({
        name: "Item-Gdept",
        label: "Item Gdept",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "ID");
        },
        shortcut: "Alt+G,D",
    });
    apex.actions.add({
        name: "Item-Gclasslabel",
        label: "Item Gclasslabel",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "IL");
        },
        shortcut: "Alt+G,C",
    });
    apex.actions.add({
        name: "Item-Gsubclasslabel",
        label: "Item Gsubclasslabel",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "IC");
        },
        shortcut: "Alt+G,A",
    });
    apex.actions.add({
        name: "Item-Gcdtlvl1",
        label: "Item Gcdtlvl1",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "ICDT1");
        },
        shortcut: "Alt+G,1",
    });
    apex.actions.add({
        name: "Item-Gcdtlvl2",
        label: "Item Gcdtlvl2",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "ICDT2");
        },
        shortcut: "Alt+G,2",
    });
    apex.actions.add({
        name: "Item-Gcdtlvl3",
        label: "Item Gcdtlvl3",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "ICDT3");
        },
        shortcut: "Alt+G,3",
    });
    apex.actions.add({
        name: "Item-Goff",
        label: "Item Goff",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_COLOR", "OFF");
        },
        shortcut: "Alt+G,O",
    });

    apex.actions.add({
        name: "shortcut",
        label: "shortcut",
        action: function (event, focusElement, data) {
            openInlineDialog("shortcut", 35, 45);
        },
        shortcut: "Alt+K",
    });
    //ASA-1138, Start
    apex.actions.add({
        name: "Overhung-Shelf",
        label: "Overhung Shelf",
        action: function (event, focusElement, data) {
            menuActions("ACTIVATE_OVERHUNG_SHELF", "-");
        },
        shortcut: "Alt+B,O",
    });

    apex.actions.add({
        name: "POG-Exception-Report",
        label: "POG-Exception-Report",
        action: function (event, focusElement, data) {
            open_pog_report("POG_EXCEPTION_WPD_SCRN");
        },
        shortcut: "Alt+R,X",
    });

    apex.actions.add({
        name: "Refresh-Sales",
        label: "Refresh Sales",
        action: function (event, focusElement, data) {
            menuActions("REFRESH_SALES", "-");
        },
        shortcut: "Alt+U,R",
    });
    //ASA-1138, End
    /* Start ASA-1412*/
    apex.actions.add({
        name: "Refresh-Items",
        label: "Refresh Items",
        action: function (event, focusElement, data) {
            menuActions("REFRESH_ITEMS", "-");
        },
        shortcut: "Alt+U,U",
    });
    /* End ASA-1412*/
    // ASA-1182, Start
    apex.actions.add({
        name: "Label-LOnOff",
        label: "Label LOnOff",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "");
        },
        shortcut: "Alt+H,L",
    });
    apex.actions.add({
        name: "Label-Product",
        label: "Label product",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "LPR");
        },
        shortcut: "Alt+H,I", //ASA-1407 Task 1
    });
    apex.actions.add({
        name: "Label-Qty",
        label: "Label Qty",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "LQT");
        },
        shortcut: "Alt+H,Q",
    });
    apex.actions.add({
        name: "Label-Sales",
        label: "Label Sales",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "LSL");
        },
        shortcut: "Alt+H,S",
    });
    apex.actions.add({
        name: "Label-Tstock",
        label: "Label Tstock",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "LST");
        },
        shortcut: "Alt+H,T",
    });
    apex.actions.add({
        name: "Label-Dpp",
        label: "Label Dpp",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "LDP");
        },
        shortcut: "Alt+H,P", //ASA-1407 Task 1
    });
    apex.actions.add({
        name: "Label-CountStore",
        label: "Label CountStore",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "LSC");
        },
        shortcut: "Alt+H,C",
    });
    apex.actions.add({
        name: "Label-Nproduct",
        label: "Label Nproduct",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "LNP");
        },
        shortcut: "Alt+H,N",
    });
    // ASA-1182, End
    //ASA-1407 Start
    apex.actions.add({
        name: "Label-Cos",
        label: "Label Cos",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "COS");
        },
        shortcut: "Alt+H,O",
    });
    apex.actions.add({
        name: "Label-Dos",
        label: "Label Dos",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "DOS");
        },
        shortcut: "Alt+H,D",
    });
    apex.actions.add({
        name: "Label-SalesUnit",
        label: "Label_SalesUnit",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "SU");
        },
        shortcut: "Alt+H,U",
    });
    apex.actions.add({
        name: "Label-SalesValue",
        label: "Label SalesValue",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "SV");
        },
        shortcut: "Alt+H,V",
    });
    //ASA-1407 Task 1
    apex.actions.add({
        name: "Label-VrmPer",
        label: "Label VrmPer",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "VRMPer");
        },
        shortcut: "Alt+H,R",
    });
    apex.actions.add({
        name: "Label-Edlp",
        label: "Label Edlp",
        action: function (event, focusElement, data) {
            menuActions("SHOW_ITEM_SUBLBL", "EDLP");
        },
        shortcut: "Alt+H,E",
    }); //ASA-1407 end

    //ASA-1406
    apex.actions.add({
        name: "Refresh-Auto-Div",
        label: "Refresh-Auto-Div",
        action: function (event, focusElement, data) {
            menuActions("REFRESH_AUTO_DIVIDER");
        },
        shortcut: "Alt+R,A",
    });
    //ASA-1507
    apex.actions.add({
        name: "Add-POG",
        label: "Add-POG",
        action: function (event, focusElement, data) {
            menuActions("Add_POG");
        },
        shortcut: "Alt+A,P",
    });
    //ASA-1587
    apex.actions.add({
        name: "Open-PAR",
        label: "Open-PAR",
        action: function (event, focusElement, data) {
            open_product("OPEN_PAR");
        },
        shortcut: "Alt+A,R",
    });

    //ASA-1628
    apex.actions.add({
        name: "Auto-PosiALLNoSbSh",
        label: "Auto-PosiALLNoSbSh",
        action: function (event, focusElement, data) {
            menuActions("AUTO_POSITION_NO_SUBSHLF", "-");
        },
        shortcut: "Alt+A,X",
    });
    //Below function will underline the character from the above shortcut in the button text on screen.
    underlineMenuKey();

    //setting canvas height when page load.
    var header = document.getElementById("t_Header");
    var breadcrumb = document.getElementById("t_Body_title");
    var top_bar = document.getElementById("top_bar");
    var side_nav = document.getElementById("t_Body_nav");
    var button_cont = document.getElementById("side_bar");
    var devicePixelRatio = window.devicePixelRatio;
    g_start_pixel_ratio = devicePixelRatio;
    var header_height = header.offsetHeight * devicePixelRatio;
    var breadcrumb_height = breadcrumb.offsetHeight * devicePixelRatio;
    var top_bar_height = top_bar.offsetHeight * devicePixelRatio;
    var side_nav_width = side_nav.offsetWidth * devicePixelRatio;
    var btn_cont_width = button_cont.offsetWidth * devicePixelRatio;

    g_windowHeight = window.innerHeight - (header_height + breadcrumb_height + top_bar_height);
    g_windowWidth = window.innerWidth - (side_nav_width + btn_cont_width);

    $("#canvas-holder").css("height", g_windowHeight); //.css('width',windowWidth);

    // Minimized Canvas Bar - Horizontal Scroll using mouse
    const slider = document.querySelector("#canvas-list-holder");
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("mouseleave", () => {
        isDown = false;
    });
    slider.addEventListener("mouseup", () => {
        isDown = false;
    });
    slider.addEventListener("mousemove", (e) => {
        if (!isDown)
            return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = x - startX;
        slider.scrollLeft = scrollLeft - walk;
    });
    set_status(); //ASA-1158

    //ASA-1507 #2 Start
    $('[aria-describedby="add_textbox"]').on('keydown', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            $('#CREATE_TEXT').click();
        }
    });

    $('[aria-describedby="add_divider"]').on('keydown', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            $('#CREATE_DIVIDER').click();
        }
    });
    //ASA-1507 #2 End

    //ASA-1640 Start
    apex._originalShowSpinner = apex._originalShowSpinner || apex.util.showSpinner;
    $('div.a-TreeView-content').click(function (e) {
        e.preventDefault();

        const anchor = $(this).find('a.a-TreeView-label');
        const anchorElement = anchor[0];
        const url = $(anchorElement).attr('href');

        apex.util.showSpinner = function () {
            $.unblockUI();
            $("#apex_wait_popup").css("visibility", "hidden");
            $("#apex_wait_overlay").css("visibility", "hidden");
            $('.u-Processing').css("visibility", "hidden");
        };

        apex.message.confirm(get_message('NAV_BAR_REDIR_CONF'), function (okPressed) {
            if (okPressed) {
                window.location.href = url;
            } else {
                apex.util.showSpinner = apex._originalShowSpinner;
            }
        });
    });
    //ASA-1640 End

    logDebug("onload code ; ", "E");
}

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
                    $s("P25_OPEN_POG_CODE", g_pog_json[g_pog_index].POGCode);
                    $s("P25_OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
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
            $s("P25_OPEN_POG_CODE", g_pog_json[p_pog_index].POGCode);
            $s("P25_OPEN_POG_VERSION", g_pog_json[p_pog_index].Version);
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

        //add canvas details into the canvas array
        g_canvas_objects.push(g_canvas);
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

    g_multiselect = "N";
    g_ctrl_select = "N";
    var header = document.getElementById("t_Header");
    var breadcrumb = document.getElementById("t_Body_title");
    var top_bar = document.getElementById("top_bar");
    var side_nav = document.getElementById("t_Body_nav");
    var button_cont = document.getElementById("side_bar");
    var devicePixelRatio = window.devicePixelRatio;
    g_start_pixel_ratio = devicePixelRatio;
    var header_height = header.offsetHeight * devicePixelRatio;
    var breadcrumb_height = breadcrumb.offsetHeight * devicePixelRatio;
    var top_bar_height = top_bar.offsetHeight * devicePixelRatio;
    var side_nav_width = side_nav.offsetWidth * devicePixelRatio;
    var btn_cont_width = button_cont.offsetWidth * devicePixelRatio;

    g_selection.style.visibility = "hidden";

    //set up mouse events and assign functions to be called on event firing.
    setUpMouseHander("maincanvas", doMouseDown, doMouseMove, doMouseUp, doMouseDoubleclick, g_canvas);
    //This function will create different div to keep different canvas in each boxes.
    if (p_canvasNo > 0) {
        makeResizableDiv(canvasName); //ASA-1107
    }

    g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);
    g_windowHeight = window.innerHeight - (header_height + breadcrumb_height + top_bar_height);
    windowWidth = window.innerWidth - (side_nav_width + btn_cont_width);

    g_initial_windowHeight = window.innerHeight - (header_height + breadcrumb_height + top_bar_height);

    var canvasContainerH = $("#" + canvasName).parent()[0].offsetHeight;
    var canvasContainerW = $("#" + canvasName).parent()[0].offsetWidth;
    console.log("canvasContainerH", canvasContainerH, "canvasContainerW", canvasContainerW);

    var canvasBtns = $("#" + canvasName + "-btns")[0];
    var canvasBtns_height = typeof canvasBtns !== "undefined" ? canvasBtns.offsetHeight : 0;
    var canvasWidthOrg = canvasContainerW;
    var canvasHeightOrg = canvasContainerH - canvasBtns_height;
    $("#" + canvasName)
        .css("height", canvasHeightOrg + "px !important")
        .css("width", canvasWidthOrg + "px !important");
    g_canvas.width = canvasWidthOrg;
    g_canvas.height = canvasHeightOrg;
    g_camera.aspect = canvasWidthOrg / canvasHeightOrg;

    // adjust the FOV
    g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV);
    g_camera.updateProjectionMatrix();
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
    if ($v("P25_DELETE_IND") == "Y" || $v("P25_EDIT_IND") == "Y") {
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
    // onWindowResize("F");

    logDebug("function : init", "E");
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
            var factor = parseFloat($v("P25_POGCR_CAMERA_ZOOM_FACTOR"));
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
                var scroll_interval = parseFloat($v("P25_POGCR_WHEEL_UP_DOWN_INTER"));

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

//This function is assigned to event contextmenu. this will check which object is hit and based on the object. 
//those list of menu options will be displayed for user to do actions.
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
        console.log("constext ", g_start_canvas, g_ComViewIndex, g_compare_view, g_compare_pog_flag);
        if (g_carpark_item_flag == "N" && g_carpark_edit_flag == "N" && ((g_start_canvas == g_ComViewIndex && g_compare_view == "POG" && g_compare_pog_flag == "Y") || (g_start_canvas !== g_ComViewIndex && g_compare_pog_flag == "Y") || g_compare_pog_flag == "N")) {
            p_event.preventDefault();
            new_details = JSON.parse(JSON.stringify(g_delete_details));
            for (const objects of new_details) {
                objects.ShelfInfo = "";
            }
            //there is a check on role based privileges for logged in user like AI_EDIT_IND, AI_DELETE_IND.
            //this below part considers only Multi select using mouse drag or ctrl select (which is also multi select)
            //basic menu that will show are as below
            //1. Copy, 2. Delete, 3. Edit facings, 4. Edit Color
            //5. Edit - Edit Product - When only items are selected, both Edit Product and Edit Fixture will show when both Fixel and Item are selected.
            //6. Spread Product - when any Fixel is selected.
            //7. Multi Edit -- this is opening when there are more than one POG on screen (Note: this is not working as expected. its opening details of a single item now.)
            //ASA-1681 issue 1, added !(g_shelf_index == -1 && g_item_index == -1). As it is only for shelf and item multi selection
            if ((g_multiselect == "Y" || g_ctrl_select == "Y") && new_details.length > 0 && g_compare_view !== "EDIT_PALLET" && !(g_shelf_index == -1 && g_item_index == -1)) {
                $("#context-menu a.cut, #context-menu a.edit, #context-menu a.edit_location, #context-menu a.duplicate, #context-menu a.edit_item_loc").css("display", "none");
                $("#context-menu a.copy, #context-menu a.paste").css("display", "block");
                if (g_pog_json.length > 1) { //ASA-1272
                    $("#context-menu a.multedit").css("display", "block");
                } else {
                    $("#context-menu a.multedit").css("display", "none");
                }
                if (g_cut_action_done == "Y" || g_copy_action_done == "Y" || g_multi_copy_done == "Y") {
                    $("#context-menu a.paste").css("color", "white").attr("onclick", 'context_func("paste","RESET_PASTE")').css("cursor", "pointer"); //1780 Added RESET_PASTE
                } else {
                    $("#context-menu a.paste").removeAttr("onclick").css("cursor", "auto").css("color", "grey");
                }
                if (JsonContains(new_details, "Object", "SHELF") && JsonContains(new_details, "ObjType", "SHELF") && JsonContains(new_details, "Object", "ITEM")) {
                    $(".edit_products, .edit_fixtures, #context-menu a.spread_product, #context-menu a.multi_edit").css("display", "block");
                    g_mselect_drag = 'Y';
                    $(".edit_submenu").css("top", "85%");
                    $(".submenu").css("top", "50%");
                    if (JsonContains(new_details, "Object", "ITEM")) {
                        $("#context-menu a.edit_facings").css("display", "block");
                        $('input[name="horizfacing"]').val("");
                        $('input[name="vertfacing"]').val("");
                        $('input[name="depthfacing"]').val("");
                        $(".facing_submenu").css("top", "57%");
                        $(".submenu").css("top", "43%");
                    } else {
                        $("#context-menu a.edit_facings").css("display", "none");
                    }
                } else if (JsonContains(new_details, "Object", "SHELF") && JsonContains(new_details, "ObjType", "SHELF")) { //ASA-1272
                    $(".edit_fixtures, #context-menu a.spread_product, #context-menu a.multi_edit").css("display", "block");
                    $(".edit_products").css("display", "none");
                    g_mselect_drag = 'Y';
                    $(".edit_submenu").css("top", "85%");
                    $(".submenu").css("top", "50%");
                    $("#context-menu a.edit_facings").css("display", "none");
                } else if (JsonContains(new_details, "Object", "ITEM")) {
                    $("#context-menu a.multi_edit").css("display", "block");
                    g_mselect_drag = 'Y';
                    $(".edit_products").css("display", "block");
                    $("#context-menu a.multedit").css("display", "none");
                    $(".edit_fixtures").css("display", "none");
                    $(".edit_submenu").css("top", "83%");
                    if (typeof g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index] !== "undefined") {
                        if ($v("P25_POGCR_DISPLAY_ITEM") == "Y" && g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].MerchStyle == 3) {
                            $("#context-menu a.edit_facings").css("display", "none"); //Kush
                        } else {
                            $("#context-menu a.edit_facings").css("display", "block");
                        }
                    } else {
                        $("#context-menu a.edit_facings").css("display", "block");
                    }

                    //	$("#context-menu a.edit_facings").css("display", "block");//kush
                    $('input[name="horizfacing"]').val("");
                    $('input[name="vertfacing"]').val("");
                    $('input[name="depthfacing"]').val("");
                    $("#context-menu a.spread_product").css("display", "none");
                    $(".facing_submenu").css("top", "50%");
                } else if (JsonContains(new_details, "Object", "SHELF") && JsonContains(new_details, "ObjType", "TEXTBOX")) {      //ASA-1669
                    $(".edit_fixtures, #context-menu a.multi_edit").css("display", "block");
                    $(".edit_products").css("display", "none");
                    g_mselect_drag = 'Y';
                    $(".edit_submenu").css("top", "85%");
                    $(".submenu").css("top", "50%");
                    $("#context-menu a.edit_facings").css("display", "none");
                } else {
                    $("#context-menu a.spread_product, #context-menu a.edit_facings").css("display", "none");
                }
                if (JsonContains(new_details, "Object", "SHELF") || JsonContains(new_details, "Object", "ITEM")) {
                    $("#context-menu a.edit_color").css("display", "block");
                } else {
                    console.log("new_details context 7", new_details);
                    $("#context-menu a.edit_color").css("display", "none");
                }

                if ($v("P25_DELETE_IND") == "Y") {
                    $("#context-menu a.delete").css("display", "block");
                } else {
                    $("#context-menu a.delete").css("display", "none");
                }
            } else {//This below block is used for single select of any object and right clicked.
                //menu list shown for each object is as below 
                //(Note: Paste will show only when g_cut_action_done, g_copy_action_done,g_multi_copy_done = 'Y')
                //Right click on item - 1. Copy, 2. Cut, 3. Delete, 4. Edit, 5. Edit Facings, 6. Edit Color, 7. Edit Location (active when fixel is CHEST)
                //Right click on any fixel(including DIVIDER) 1. Copy, 2. Cut, 3. Delete, 4. Edit, 5. Edit Location, 6. Spread Product (Only for SHELF and HANGINGBAR), 7. Duplicate Fixel
                //Right click on Module - 1. Copy, 2. Cut, 3. Delete, 4. Edit
                //Right click outside the POG in blank area(POG Edit) - 1. Copy, 2. Cut, 3. Delete, 4. Edit
                //Right click on item on the carpark - 1. Edit
                g_multiselect = "N";
                g_ctrl_select = "N";
                $("#context-menu a.edit_color").css("display", "none");
                $("#context-menu a.multi_edit").css("display", "none");
                g_mselect_drag = 'N';
                if (g_pog_json.length > 1) {
                    $("#context-menu a.multedit").css("display", "block");
                } else {
                    $("#context-menu a.multedit").css("display", "none");
                }
                if (g_cut_action_done == "Y" || g_copy_action_done == "Y" || g_multi_copy_done == "Y") {
                    $("#context-menu a.paste").css("color", "white").attr("onclick", 'context_func("paste","RESET_PASTE")').css("cursor", "pointer"); //1780 Added RESET_PASTE
                } else {
                    $("#context-menu a.paste").removeAttr("onclick").css("cursor", "auto").css("color", "grey");
                }
                if ($v("P25_DELETE_IND") == "Y") {
                    $("#context-menu a.delete").css("display", "block");
                } else {
                    $("#context-menu a.delete").css("display", "none");
                }
                if ($v("P25_EDIT_IND") == "Y") {
                    $("#context-menu a.cut, #context-menu a.copy, #context-menu a.paste, #context-menu a.edit").css("display", "block");

                    if (g_shelf_edit_flag == "Y" && g_compare_view !== "EDIT_PALLET") {
                        $("#context-menu a.edit_location, #context-menu a.duplicate").css("display", "block");
                        $("#context-menu a.edit_facings, #context-menu a.edit_color, #context-menu a.multedit, #context-menu a.edit_item_loc").css("display", "none");
                        if (g_shelf_object_type == "SHELF" || g_shelf_object_type == "HANGINGBAR") {
                            $("#context-menu a.spread_product").css("display", "block");
                            $(".submenu").css("top", "50%");
                        } else {
                            $("#context-menu a.spread_product").css("display", "none");
                        }
                    } else if (g_item_edit_flag == "Y" && g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item == "DIVIDER") {
                        if (g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item == "DIVIDER") {
                            $("#context-menu a.edit_location").css("display", "block");
                        } else {
                            $("#context-menu a.edit_location").css("display", "none");
                        }
                        $("#context-menu a.duplicate").css("display", "block");
                        $("#context-menu a.edit_facings, #context-menu a.spread_product, #context-menu a.edit_color, #context-menu a.multedit, #context-menu a.edit_item_loc").css("display", "none");
                    } else {
                        $("#context-menu a.edit_item_loc").css("display", "none");
                        $("#context-menu a.edit_location, #context-menu a.duplicate").css("display", "none");
                        if (g_item_edit_flag == "Y" && g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item !== "DIVIDER") {
                            if (g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == 'CHEST' && g_chest_as_pegboard == 'Y') { //ASA-1300
                                $("#context-menu a.edit_item_loc").css("display", "block");
                            }
                            if ((typeof g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BottomObjID !== "undefined" && g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BottomObjID !== "") || (typeof g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].TopObjID !== "undefined" && g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].TopObjID !== "")) {
                                $(".input-group").css("display", "none");
                            } else {
                                $(".input-group").css("display", "");
                                $("#context-menu a.multedit").css("display", "none");
                            }
                            // ASA-1109
                            $(".input-group2").css("display", "");
                            $('input[name="horizfacing"]').val(g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BHoriz);
                            $('input[name="vertfacing"]').val(g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BVert);
                            $('input[name="depthfacing"]').val(g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BaseD);

                            if (g_prev_undo_action !== "FACING_CHANGE" && (g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].OldItemBaseHoriz == "" || typeof g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].OldItemBaseHoriz == "undefined")) {
                                g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].OldItemBaseHoriz = g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BHoriz;
                                g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].OldItemBaseVert = g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BVert;
                                g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].OldItemBaseDepth = g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].BaseD;
                            }
                            g_incre_mod_index = g_module_index;
                            g_incre_shelf_index = g_shelf_index;
                            g_incre_item_index = g_item_index;

                            if ($v("P25_POGCR_DISPLAY_ITEM") == "Y" && g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].MerchStyle == 3) {
                                $("#context-menu a.edit_facings").css("display", "none"); //Kush
                            } else {
                                $("#context-menu a.edit_facings").css("display", "block");
                            }
                            $(".facing_submenu").css("top", "74%");
                            $("#context-menu a.edit_color").css("display", "block");
                            $("#context-menu a.duplicate").css("display", "none");
                        } else {
                            $("#context-menu a.edit_facings").css("display", "none");
                        }
                        if (g_module_edit_flag == "Y") {
                            $("#context-menu a.multedit").css("display", "none");
                        }
                        $("#context-menu a.spread_product").css("display", "none");
                    }
                } else {
                    $("#context-menu a.cut, #context-menu a.copy, #context-menu a.paste, #context-menu a.edit, #context-menu a.edit_location, #context-menu a.duplicate, #context-menu a.edit_facings, #context-menu a.spread_product").css("display", "none");
                }
            }
            valid = "Y";
        } else if (g_carpark_item_flag == "Y") {
            p_event.preventDefault();
            $("#context-menu a.cut, #context-menu a.copy, #context-menu a.paste, #context-menu a.edit_location, #context-menu a.duplicate, #context-menu a.edit_facings, #context-menu a.spread_product, #context-menu a.delete, #context-menu a.edit_color, #context-menu a.multi_edit, #context-menu a.multedit, #context-menu a.edit_item_loc").css("display", "none"); //ASA-1418
            g_mselect_drag = 'N';
            $("#context-menu a.edit").css("display", "block");
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
                if (g_shelf_edit_flag == "Y") {
                    $(".submenu").css("right", "100%"); //Regression 21 Kush
                } else {
                    $(".facing_submenu").css("right", "100%"); //Regression 21 Kush
                }
                $(".edit_submenu").css("right", "190px");
            } else if (inner_width_noedit > window_width) {
                contextElement.style.left = p_event.clientX - $(".t-Region-body").scrollLeft() - contextElement.offsetWidth + "px"; // + (side_nav_width + btn_cont_width + padding)) + border - contextElement.offsetWidth + "px";
                $(".submenu").css("right", "-200px");
                $(".edit_submenu").css("right", "-200px");
                $(".facing_submenu").css("right", "-190px");
            } else {
                contextElement.style.left = p_event.clientX - $(".t-Region-body").scrollLeft() + "px"; // + (side_nav_width + btn_cont_width + padding)) + border + "px";
                $(".submenu").css("right", "-200px");
                $(".edit_submenu").css("right", "-200px");
                if (p_event.clientX > (window_width / 2)) { // ASA-1236 Submenu option of facing in right side screen should be hide so i add this logic to check the user click x is greater than the window center
                    $(".facing_submenu").css("right", "100%"); //Regression 21 Kush
                } else {
                    $(".facing_submenu").css("right", "-190px");
                }
            }
            console.log("contextElement.style.top", contextElement.style.top, contextElement.style.left, p_event);

            contextElement.classList.add("active");
        }
    }
    logDebug("function : onContextMenu", "E");
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
            appendMultiCanvasRowCol(TEMP_POG.length, $v("P25_POGCR_TILE_VIEW"));

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
                var return_val = await create_module_from_json(TEMP_POG, sessionStorage.getItem("new_pog_ind"), "F", $v("P25_PRODUCT_BTN_CLICK"), sessionStorage.getItem("pog_opened"), "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
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

// This function will call create_module_from_json_lib from asw_common_main.js. This function will take the complete json of the POG and build json for g_pog_json
//and create the skeleton on the screen.
async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_stop_loading, p_create_pdf_ind, p_recreate, p_create_json, p_pog_version, p_save_pdf, p_camera, p_scene, p_pog_index, p_orgPogIndex, p_ImageLoadInd = "N", p_UpdateIndex = "N", p_old_POGJSON = []) {
    try {
        typeof p_save_pdf == "undefined" ? "Y" : p_save_pdf;

        console.log("value", p_pog_json_arr,
            p_new_pog_ind,
            p_pog_type,
            p_product_open,
            p_pog_opened,
            p_recreate,
            p_create_json,
            $v("P25_VDATE"),
            $v("P25_POG_POG_DEFAULT_COLOR"),
            $v("P25_POG_MODULE_DEFAULT_COLOR"),
            p_pog_version,
            true,
            "N",
            null,
            $v("P25_POGCR_DFT_SPREAD_PRODUCT"),
            parseFloat($v("P25_PEGB_DFT_HORIZ_SPACING")),
            parseFloat($v("P25_PEGBOARD_DFT_VERT_SPACING")),
            parseFloat($v("P25_BASKET_DFT_WALL_THICKNESS")),
            parseFloat($v("P25_CHEST_DFT_WALL_THICKNESS")),
            $v("P25_POGCR_PEGB_MAX_ARRANGE"),
            $v("P25_POGCR_DEFAULT_WRAP_TEXT"),
            parseInt($v("P25_POGCR_TEXT_DEFAULT_SIZE")),
            $v("P25_POG_TEXTBOX_DEFAULT_COLOR"),
            $v("P25_POG_SHELF_DEFAULT_COLOR"),
            $v("P25_DIV_COLOR"),
            $v("P25_SLOT_DIVIDER"),
            $v("P25_SLOT_ORIENTATION"),
            $v("P25_DIVIDER_FIXED"),
            $v("P25_POG_ITEM_DEFAULT_COLOR"),
            $v("P25_POGCR_DELIST_ITEM_DFT_COL"),
            g_peg_holes_active,
            $v("P25_POG_CP_SHELF_DFLT_COLOR"),
            3,
            $v("P25_MERCH_STYLE"),
            $v("P25_POGCR_LOAD_IMG_FROM"),
            $v("P25_BU_ID"),
            $v("P25_POGCR_DELIST_ITEM_DFT_COL"),
            $v("P25_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P25_POGCR_DISPLAY_ITEM_INFO"),
            $v("P25_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P25_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P25_NOTCH_HEAD"),
            "N",
            $v("P25_POGCR_DFT_BASKET_FILL"),
            $v("P25_POGCR_DFT_BASKET_SPREAD"),
            p_camera,
            p_pog_index,
            p_orgPogIndex,
            $v('P25_POGCR_NOTCH_START_VALUE'),
            $v('P25_POGCR_MANUAL_CRUSH_ITEM'),
            'Y', //ASA-1310 KUSH FIX
            "");
        await create_module_from_json_lib(
            p_pog_json_arr,
            p_new_pog_ind,
            p_pog_type,
            p_product_open,
            p_pog_opened,
            p_recreate,
            p_create_json,
            $v("P25_VDATE"),
            $v("P25_POG_POG_DEFAULT_COLOR"),
            $v("P25_POG_MODULE_DEFAULT_COLOR"),
            p_pog_version,
            true,
            "N",
            null,
            $v("P25_POGCR_DFT_SPREAD_PRODUCT"),
            parseFloat($v("P25_PEGB_DFT_HORIZ_SPACING")),
            parseFloat($v("P25_PEGBOARD_DFT_VERT_SPACING")),
            parseFloat($v("P25_BASKET_DFT_WALL_THICKNESS")),
            parseFloat($v("P25_CHEST_DFT_WALL_THICKNESS")),
            $v("P25_POGCR_PEGB_MAX_ARRANGE"),
            $v("P25_POGCR_DEFAULT_WRAP_TEXT"),
            parseInt($v("P25_POGCR_TEXT_DEFAULT_SIZE")),
            $v("P25_POG_TEXTBOX_DEFAULT_COLOR"),
            $v("P25_POG_SHELF_DEFAULT_COLOR"),
            $v("P25_DIV_COLOR"),
            $v("P25_SLOT_DIVIDER"),
            $v("P25_SLOT_ORIENTATION"),
            $v("P25_DIVIDER_FIXED"),
            $v("P25_POG_ITEM_DEFAULT_COLOR"),
            $v("P25_POGCR_DELIST_ITEM_DFT_COL"),
            g_peg_holes_active,
            $v("P25_POG_CP_SHELF_DFLT_COLOR"),
            3,
            $v("P25_MERCH_STYLE"),
            $v("P25_POGCR_LOAD_IMG_FROM"),
            $v("P25_BU_ID"),
            $v("P25_POGCR_DELIST_ITEM_DFT_COL"),
            $v("P25_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P25_POGCR_DISPLAY_ITEM_INFO"),
            $v("P25_POGCR_ITEM_NUM_LBL_COLOR"),
            $v("P25_POGCR_ITEM_NUM_LABEL_POS"),
            $v("P25_NOTCH_HEAD"),
            "N",
            $v("P25_POGCR_DFT_BASKET_FILL"),
            $v("P25_POGCR_DFT_BASKET_SPREAD"),
            p_camera,
            p_pog_index,
            p_orgPogIndex,
            $v('P25_POGCR_NOTCH_START_VALUE'),
            $v('P25_POGCR_MANUAL_CRUSH_ITEM'),
            'Y', //ASA-1310 KUSH FIX
            ""); //Regression 29(Portal Issue) added p_calc_dayofsupply

        g_pog_json[p_pog_index].MassUpdate = "N"; //ASA-1809, Set this to N, as for saving POG draft or existing the coordinates in JSON has been update with respect to WPD

        //This after refresh event is needed because Division/Dept/Subdept are cascading LOV and setting value is always removed by refresh
        //due to setting value to master page item.
        $("#P25_POG_SUBDEPT").on("apexafterrefresh", function () {
            if (typeof g_pog_json[p_pog_index] != "undefined")
                apex.item(this).setValue(g_pog_json[p_pog_index].SubDept);
        });
        $("#P25_POG_DEPT").on("apexafterrefresh", function () {
            if (typeof g_pog_json[p_pog_index] != "undefined")
                apex.item(this).setValue(g_pog_json[p_pog_index].Dept);
        });

        apex.item("P25_POG_DIVISION").setValue(g_pog_json[p_pog_index].Division);
        // ASA-1500
        // if (typeof regionloadWait !== "undefined" && regionloadWait !== null) {
        //     if (p_stop_loading == "Y") {
        //         removeLoadingIndicator(regionloadWait);
        //     }
        // }
        //based on the POG getting created. set all label, live image button on or off and setup global varaibles for labels.
        if (p_create_pdf_ind == "N" && p_recreate == "Y" && p_orgPogIndex == p_pog_index) {
            var res = await enableDisableFlags(p_pog_index);
        }
        if (p_recreate == "Y") {
            //this is the function will store the g_pog_json into a backup array for recreating the POG in any error.
            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                backupPog("F", -1, -1, p_pog_index);
            }
            //loading all the items for all items in g_ItemImages array to load images to item.
            if ($v("P25_POGCR_LOAD_IMG_FROM") == "DB" && p_product_open == "N" && p_create_pdf_ind == "N" && p_ImageLoadInd == "N") {
                var retval = await get_all_images(p_pog_index, g_get_orient_images, "N", $v("P25_POGCR_IMG_MAX_WIDTH"), $v("P25_POGCR_IMG_MAX_HEIGHT"), $v("P25_IMAGE_COMPRESS_RATIO"));
            }
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
                    'TemplateId': $v("P25_PDF_TEMPLATE").split('-')[0],
                    'TemplateDetails': $v("P25_PDF_TEMPLATE")
                };

                //ASA-1870 passed values from $v("P25_POGCR_ENHANCE_PDF_IMG") to $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE") to set_scene
                var return_val = await create_pdf(p_pog_details, p_save_pdf, "N", p_camera, draft_ind, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_NOTCH_HEAD"), "Y", p_pog_index, "Y", g_all_pog_flag, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), "", "", g_hide_show_dos_label, "Y", //Garit
                    $v("P25_POGCR_ENHANCE_PDF_IMG"), $v("P25_POGCR_PDF_IMG_ENHANCE_RATIO"), $v("P25_POGCR_PDF_CANVAS_SIZE"), $v("P25_VDATE"), $v("P25_POG_POG_DEFAULT_COLOR"), $v("P25_POG_MODULE_DEFAULT_COLOR"), $v("P25_POGCR_DFT_SPREAD_PRODUCT"), $v("P25_PEGB_DFT_HORIZ_SPACING"), $v("P25_PEGBOARD_DFT_VERT_SPACING"), $v("P25_BASKET_DFT_WALL_THICKNESS"), $v("P25_CHEST_DFT_WALL_THICKNESS"), $v("P25_POGCR_PEGB_MAX_ARRANGE"), $v("P25_POGCR_DEFAULT_WRAP_TEXT"), $v("P25_POGCR_TEXT_DEFAULT_SIZE"), $v("P25_POG_TEXTBOX_DEFAULT_COLOR"), $v("P25_POG_SHELF_DEFAULT_COLOR"), $v("P25_DIV_COLOR"), $v("P25_SLOT_DIVIDER"), $v("P25_SLOT_ORIENTATION"), $v("P25_DIVIDER_FIXED"), $v("P25_POG_ITEM_DEFAULT_COLOR"), $v("P25_POGCR_DFT_BASKET_FILL"), $v("P25_POGCR_DFT_BASKET_SPREAD"), $v("P25_POGCR_BAY_LIVE_IMAGE"), $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE"), "N"); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
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
                if (p_create_pdf_ind == "N" && p_product_open == "N" && $v("P25_POGCR_DFT_ITEM_DESC") == "N" && p_ImageLoadInd == "N") {
                    var return_val = await recreate_image_items("Y", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), p_pog_index, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
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
        await generateCombinedShelfs(p_pog_index, m, s, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y', "", "Y");//ASA-1350 issue 6 added parameters
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

async function create_shelf_edit_pog(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_new_pog_ind, p_pog_type, p_carpark_ind, p_recreate, p_create_json, p_pog_index) {
    logDebug("function : create_shelf_edit_pog; mod_index : " + p_mod_index + "; p_module_width : " + p_module_width + "; draft_ind : " + p_draft_ind + "; new_pog_ind : " + p_new_pog_ind + "; pog_type : " + p_pog_type + "; carpark_ind : " + p_carpark_ind + "; recreate : " + p_recreate, "S");
    try {
        var newObjectID = create_shelf_edit_pog_lib(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_new_pog_ind, p_pog_type, p_carpark_ind, p_recreate, p_create_json, $v("P25_POGCR_DFT_SPREAD_PRODUCT"), $v("P25_POG_SHELF_DEFAULT_COLOR"), $v("P25_DIV_COLOR"), $v("P25_SLOT_DIVIDER"), $v("P25_SLOT_ORIENTATION"), $v("P25_DIVIDER_FIXED"), $v("P25_POG_ITEM_DEFAULT_COLOR"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_POG_CP_SHELF_DFLT_COLOR"), 3, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_NOTCH_HEAD"), "Y", g_camera, p_pog_index, p_pog_index, $v('P25_POGCR_MANUAL_CRUSH_ITEM')); //ASA-1300

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

        if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {
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
                if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {
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

                var return_val = await add_module($v("P25_POG_MODULE"), p_width, ModuleInfo["H"], p_depth, p_color_hex, p_x, p_y, "N", "Y", ModuleInfo["VertStart"], ModuleInfo["VertSpacing"], ModuleInfo["HorzStart"], ModuleInfo["HorzSpacing"], "Y", p_camera, g_pog_json[p_pog_index].ModuleInfo.length - 1, p_pog_index);

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
                    if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {
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
        result = await add_module_lib(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_flag, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_recreate, p_camera, p_module_ind, $v("P25_POGCR_DFT_SPREAD_PRODUCT"), parseFloat($v("P25_PEGB_DFT_HORIZ_SPACING")), parseFloat($v("P25_PEGBOARD_DFT_VERT_SPACING")), parseFloat($v("P25_BASKET_DFT_WALL_THICKNESS")), parseFloat($v("P25_CHEST_DFT_WALL_THICKNESS")), $v("P25_POGCR_PEGB_MAX_ARRANGE"), $v("P25_POGCR_DEFAULT_WRAP_TEXT"), parseInt($v("P25_POGCR_TEXT_DEFAULT_SIZE")), $v("P25_POG_TEXTBOX_DEFAULT_COLOR"), $v("P25_POG_SHELF_DEFAULT_COLOR"), $v("P25_DIV_COLOR"), $v("P25_SLOT_DIVIDER"), $v("P25_SLOT_ORIENTATION"), $("P25_DIVIDER_FIXED"), $v("P25_POG_ITEM_DEFAULT_COLOR"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), g_peg_holes_active, $v("P25_POG_CP_SHELF_DFLT_COLOR"), 3, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_NOTCH_HEAD"), "Y", g_pog_index, $v("P25_POGCR_DFT_BASKET_FILL"), $v("P25_POGCR_DFT_BASKET_SPREAD"), $v('P25_POGCR_MANUAL_CRUSH_ITEM'));
        $s("P25_MODULE_EDIT_IND", "N");
        return result;
    } catch (err) {
        error_handling(err);
    }
}

//This function is called to context_delete function. when the user click on module and press delete.
async function delete_module(p_object_id, p_mod_index, p_camera, p_pog_index) {
    logDebug("function : delete_module; object_id : " + p_object_id + "; mod_index : " + p_mod_index, "S");
    try {
        return new Promise(function (resolve, reject) {
            async function doSomething() {
                if (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length > 0) {
                    for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo) {
                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
                        g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                        if (typeof shelfs.ItemInfo !== undefined) {
                            var i = 0;
                            for (const items of shelfs.ItemInfo) {
                                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                                i++;
                            }
                        }
                    }
                }
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].MObjID);
                g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                for (i = 0; i <= 20; i++) {
                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectByProperty("uuid", "BASE1");
                    g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                }

                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                console.log("details_arr", details_arr);
                set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
                render(p_pog_index);
                var i = 0;
                if (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length > 0) {
                    for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo) {
                        var ItemArr = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo;
                        for (const details of ItemArr) {
                            g_deletedItems.push(details.ItemID);
                        }
                        i = i + 1;
                    }
                }
                g_pog_json[p_pog_index].W = g_pog_json[p_pog_index].W - g_pog_json[p_pog_index].ModuleInfo[p_mod_index].W;
                if (p_mod_index == 0) {
                    g_pog_json[p_pog_index].ModuleInfo.splice(p_mod_index, p_mod_index + 1);
                } else {
                    g_pog_json[p_pog_index].ModuleInfo.splice(p_mod_index, 1);
                }
                var module_sum = g_pog_json[p_pog_index].W;
                var mod_cnt = 0;
                for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                        mod_cnt++;
                    }
                }

                var max_height = 0;
                var total_width = 0;
                for (const obj of g_pog_json[p_pog_index].ModuleInfo) {
                    max_height = Math.max(max_height, obj.H);
                    if (obj.ParentModule == null || typeof obj.ParentModule == "undefined") {
                        total_width = total_width + obj.W;
                    }
                }
                g_pog_json[p_pog_index].PrevH = g_pog_json[p_pog_index].H;
                g_pog_json[p_pog_index].PrevW = g_pog_json[p_pog_index].W;
                g_pog_json[p_pog_index].H = max_height + g_pog_json[p_pog_index].BaseH;
                g_pog_json[p_pog_index].W = total_width;

                //here we delete the selected module and create others in proper sequence below.
                if (mod_cnt > 0) {
                    //deleted_items_log function will log all the items which were delete and mark them in red in product list.
                    var res = await deleted_items_log(g_deletedItems, "D", p_pog_index);
                    var res = await context_create_module("", p_camera, "Y", p_pog_index, "N");
                    if (g_pog_json[p_pog_index].BaseH > 0) {
                        var colorValue = parseInt(g_pog_json[p_pog_index].Color.replace("#", "0x"), 16);
                        var hex_decimal = new THREE.Color(colorValue);
                        g_pog_json[p_pog_index].BaseW = module_sum;
                        g_pog_json[p_pog_index].BaseX = module_sum / 2;
                        var return_val = add_base("BASE1", module_sum, g_pog_json[p_pog_index].BaseH, g_pog_json[p_pog_index].BaseD, hex_decimal, module_sum / 2, g_pog_json[p_pog_index].BaseY, "Y", p_pog_index);
                    }
                    var details = get_min_max_xy(p_pog_index);
                    var details_arr = details.split("###");
                    set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
                    if (g_scene_objects[p_pog_index].Indicators.LiveImage == "Y") {
                        animate_pog(p_pog_index);
                    }
                }

                $s("P25_MODULE_DISP", "");
                resolve("SUCCESS");
                logDebug("function : delete_module", "E");
            }
            doSomething();
        });
    } catch (err) {
        error_handling(err);
    }
}

//This function is called from context_delete when user click on shelf and delete.
async function delete_shelf(p_object_id, p_module_index, p_shelf_index, p_item_index, p_object_type, p_is_divider, p_context_delete, p_pog_index) {
    logDebug("function : delete_shelf; object_id : " + p_object_id + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; p_object_type : " + p_object_type + "; is_divider : " + p_is_divider + "; context_delete : " + p_context_delete, "S");
    try {
        //shelf could be a divider also. so below check is if not divider then its other fixels.
        if (p_is_divider == "N") {
            g_deletedItems = [];
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length > 0) {
                var item_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
                for (const details of item_arr) {
                    var selectedObject = g_world.getObjectById(details.ObjID);
                    g_deletedItems.push(details.Item);
                    g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                }

                //capture the module is edit or not to create changed text box
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].EditFlag = "Y";
            }

            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(p_object_id);
            g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
            render(p_pog_index);
            if (p_shelf_index == 0) {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.splice(p_shelf_index, p_shelf_index + 1);
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.splice(p_shelf_index, 1);
            }
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].LastCount = g_pog_json[p_pog_index].ModuleInfo[p_module_index].LastCount - 1;
            //deleted_items_log function will log all the items which were delete and mark them in red in product list.
            let res = await deleted_items_log(g_deletedItems, "D", p_pog_index);

            if (p_object_type == "TEXTBOX") {
                var module_arr = g_pog_json[p_pog_index].ModuleInfo;
                var child_module_index = -1;
                var i = 0;
                for (const modules of module_arr) {
                    if (modules.ObjID == p_object_id) {
                        child_module_index = i;
                        break;
                    }
                    i++;
                }
                if (child_module_index !== -1) {
                    if (child_module_index == 0) {
                        g_pog_json[p_pog_index].ModuleInfo.splice(child_module_index, child_module_index + 1);
                    } else {
                        g_pog_json[p_pog_index].ModuleInfo.splice(child_module_index, 1);
                    }
                }
            }
        } else {//if its a divider we should delete the itemInfo of the divider and a ShelfInfo for that divider in same ModuleInfo.
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(p_object_id);
            g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
            render(p_pog_index);

            var shelf_length = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length;
            if (p_item_index == 0) {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.splice(p_item_index, p_item_index + 1);
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.splice(p_item_index, 1);
            }

            var upd_shelf_index = -1;
            var i = 0;
            for (const shelf of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                if (shelf.ShelfDivObjID == p_object_id) {
                    upd_shelf_index = i;
                    break;
                }
                i++;
            }
            var shelf_obj = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID;
            var i = 0;
            //deleting the shelfinfo
            if (upd_shelf_index == 0) {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.splice(upd_shelf_index, upd_shelf_index + 1);
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.splice(upd_shelf_index, 1);
            }
            var i = 0;
            for (const shelf of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                if (shelf.SObjID == shelf_obj) {
                    p_shelf_index = i;
                    break;
                }
                i++;
            }
            //recreate all items is needed because divider is considered as a item in the shelf.
            if (reorder_items(p_module_index, p_shelf_index, p_pog_index)) {
                console.log("inside recreate");
                var return_val = recreate_all_items(p_module_index, p_shelf_index, p_object_type, "N", -1, -1, shelf_length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y'); //ASA-1350 issue 6 added parameters
            }
        }
        logDebug("function : delete_shelf", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is called when item is selected and click delete.
async function delete_item(p_object_id, p_module_index, p_shelf_index, p_item_index, p_action, p_clearRedo, p_pog_index) {
    logDebug("function : delete_item; object_id : " + p_object_id + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; action : " + p_action + "; clearRedo : " + p_clearRedo, "S");
    if (p_action == "CUT") {
        var actionType = "CUT_ITEM";
    } else {
        actionType = "ITEM_DELETE";
    }
    try {
        var itemdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
        var finalAction;
        if (g_undoRedoAction !== "REDO" && typeof g_undoRedoAction !== "undefined") {
            finalAction = "R";
        } else {
            finalAction = "U";
        }
        var movedShelfDetail = {};
        movedShelfDetail["MIndex"] = p_module_index;
        movedShelfDetail["SIndex"] = p_shelf_index;
        var itemID = g_carpark_item_flag == "N" ? itemdtl[p_item_index].ItemID : g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[0].ItemInfo[p_item_index].ItemID;
        movedShelfDetail["ItemID"] = itemID;
        movedShelfDetail["MultiDelete"] = "N";
        if (p_action !== "CREATE_ITEM") {
            movedShelfDetail["CREATED"] = "N";
        } else {
            movedShelfDetail["CREATED"] = "Y";
        }

        var shelfInfoForUndo = [];
        shelfInfoForUndo.push(movedShelfDetail);
        g_temp_cut_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo)));
        var itemInfo = g_carpark_item_flag == "N" ? itemdtl[p_item_index] : g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[p_shelf_index].ItemInfo[p_item_index];
        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(itemInfo.ObjID);
        g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
        render(p_pog_index);
        if ((typeof itemInfo.TopObjID !== "undefined" && itemInfo.TopObjID !== "") || (typeof itemInfo.BottomObjID !== "undefined" && itemInfo.BottomObjID !== "")) {
            var returnval = reset_bottom_item(p_module_index, p_shelf_index, p_item_index, -1, -1, itemInfo.X, p_pog_index);
        }
        if (g_carpark_item_flag == "N") {
            if (p_item_index == 0) {
                itemdtl.splice(p_item_index, p_item_index + 1);
            } else {
                itemdtl.splice(p_item_index, 1);
            }
        } else {
            if (p_item_index == 0) {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[p_shelf_index].ItemInfo.splice(p_item_index, p_item_index + 1);
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[p_shelf_index].ItemInfo.splice(p_item_index, 1);
            }
        }
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "SHELF" || g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "PALLET") {
            var returnval = reset_top_bottom_objects(p_module_index, p_shelf_index, "N", p_pog_index);
        }
        //we should reset the crushing done in the shelf because one item is removed.
        if (g_carpark_item_flag == "N") {
            var i = 0;
            reset_auto_crush(p_module_index, p_shelf_index, -1, p_pog_index, p_module_index, p_shelf_index, p_pog_index); //ASA-1343 issue 1
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem == "F") {
                for (const fitems of itemdtl) {
                    fitems.W = fitems.RW;
                    i++;
                }
            } else {
                if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "PALLET") {
                    var i = 0;
                    for (const fitems of itemdtl) {
                        fitems.Exists = "E";
                        fitems.Dragged = "N";
                        i++;
                    }
                }
            }
            const shelfObjType = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType; //ASA-2010.4.1
            if (shelfObjType !== "PALLET" && reorder_items(p_module_index, p_shelf_index, p_pog_index)) {//ASA-2010.4.1
                var return_val = await recreate_all_items(p_module_index, p_shelf_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType, "N", -1, -1, itemdtl.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y'); //ASA-1350 issue 6 added parameters
                var item_details = itemdtl;
                var sorto = {
                    X: "asc",
                    Y: "asc",
                };
            }
        }

        //capture the module is edit or not to create changed text box
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].EditFlag = "Y";

        g_delete_details.multi_delete_shelf_ind = "N";
        g_delete_details = [];
        g_multi_drag_shelf_arr = [];
        g_multi_drag_item_arr = [];
        g_undo_details = [];

        //recreate the orientation view if any present
        var returnval = await recreate_compare_views(g_compare_view, "N");
        var res = await calculateFixelAndSupplyDays("N", p_pog_index);
        //deleted_items_log function will log all the items which were delete and mark them in red in product list.
        if (typeof selectedObject !== "undefined") {
            var res = await deleted_items_log([selectedObject.ItemID], "D", p_pog_index);
        }
        logDebug("function : delete_item", "E");
    } catch (err) {
        error_handling(err);
    }
}

//This function is called when the POG is selected and click delete.
function delete_pog() {
    logDebug("function : delete_pog", "S");
    for (var i = g_scene_objects[g_pog_index].scene.children[2].children.length - 1; i >= 0; i--) {
        obj = g_scene_objects[g_pog_index].scene.children[2].children[i];
        g_scene_objects[g_pog_index].scene.children[2].remove(obj);
    }
    sessionStorage.setItem("POGExists", "N");
    logDebug("function : delete_pog", "E");
}

function clear_search_fields() {
    logDebug("function : clear_search_fields", "S");
    $s("P25_ITEM", "");
    $s("P25_SUPP_NAME", "");
    $s("P25_SUPPLIER_CODE", "");
    $s("P25_MAIN_BRAND", "");
    $s("P25_ITEM_DESCRIPTION", "");
    $s("P25_DESCRIPTION_SEC", "");
    $s("P25_GROUP", "");
    $s("P25_DEPARTMENT", "");
    $s("P25_ITEM_BRAND", "");
    $s("P25_ITEM_WITHOUT_DIM", "N");
    $s("P25_USED_ITEM", "A");
    $s("P25_CLASS", "");        //ASA-1558 Task 1
    $s("P25_SUB_CLASS", "");    //ASA-1558 Task 1
    logDebug("function : clear_search_fields", "E");
}

//This function is called from drop event from draggable product list. That means when you drag a item from product list and drop in any place in canvas.
async function create_item_list(p_item_list, p_x, p_y, p_camera, p_canvas, p_pog_index) {
    logDebug("function : create_item_list ; x : " + p_x + "; y : " + p_y, "S");
    try {
        var product_model = apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model;
        render(p_pog_index);
        var width = p_canvas.width; // / window.devicePixelRatio;
        var height = p_canvas.height; // / window.devicePixelRatio;
        var a = (2 * p_x) / width - 1;
        var b = 1 - (2 * p_y) / height;
        var item_dim_arr = [],
            item_depth_arr = [],
            item_height_arr = [],
            item_width_arr = [],
            item_arr = [],
            item_desc_arr = [],
            item_index_arr = [];
        var org_width_arr = [],
            org_height_arr = [],
            org_depth_arr = [];
        //raycaster will help to find out what are the object available on the mouse point of drop using intersectobjects.
        g_raycaster.setFromCamera(new THREE.Vector2(a, b), p_camera);
        g_intersects = g_raycaster.intersectObjects(g_world.children); //Recursive = true is important to find only mouse down event when mouse comming from other region.
        //if there is no objects found. then add a transparant object into raycaster and find out the coordinates.
        if (g_intersects.length == 0 || g_intersects[0].object.uuid == "drag_object") {
            g_intersects = g_raycaster.intersectObject(g_targetForDragging);
            if (g_intersects.length !== 0) {
                var item = g_intersects[0];

                g_objectHit = item.object;
                g_objecthit_id = g_objectHit.id;
                locationX = item.point.x; // Gives the point of intersection in g_world coords
                locationY = item.point.y;
                var min_shelf = 100;
                var shelfY = 0,
                    module_drop = "N",
                    pog_depth;
                g_shelf_edit_flag = "N";
                g_shelf_index = "";
                g_item_index = "";
                shelf_obj_type = "";
                g_item_edit_flag = "N";
                g_module_index = -1;
                var j = 0;
                for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (g_shelf_edit_flag == "Y") {
                        break; //return false;
                    }
                    if (Modules.ParentModule == null) {
                        var i = 0;
                        for (const Shelf of Modules.ShelfInfo) {
                            if (Shelf.Rotation > 0 || Shelf.Rotation < 0) {
                                var div_shelf_end = Shelf.X + Shelf.ShelfRotateWidth / 2;
                                var div_shelf_start = Shelf.X - Shelf.ShelfRotateWidth / 2;
                            } else {
                                var div_shelf_end = Shelf.X + Shelf.W / 2;
                                var div_shelf_start = Shelf.X - Shelf.W / 2;
                            }
                            if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                                if (parseFloat(Shelf.Y) < parseFloat(locationY) && div_shelf_end > locationX && div_shelf_start < locationX) {
                                    if (min_shelf > parseFloat(locationY) - parseFloat(Shelf.Y)) {
                                        min_shelf = parseFloat(locationY) - parseFloat(Shelf.Y);
                                        shelf_id = Shelf.Shelf;
                                        shelf_obj_type = Shelf.ObjType;
                                        g_shelf_index = i;
                                        g_module_index = j;
                                    }
                                }
                            }
                            i++;
                        }
                    }
                    j++;
                }
            } else {
                return;
            }
        } else {//This block is that when we have found a object.
            var item = g_intersects[0];
            g_objectHit = item.object;
            var l_objecthit_id = g_objectHit.id;
            var shelfY = 0,
                module_drop = "N",
                pog_depth;
            var locationX = item.point.x; // Gives the point of intersection in g_world coords
            var locationY = item.point.y;
            g_shelf_edit_flag = "N";
            g_shelf_index = "";
            g_item_index = "";
            shelf_obj_type = "";
            g_item_edit_flag = "N";
            g_module_index = -1;
            var i = 0;
            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (modules.MObjID == l_objecthit_id && modules.ParentModule == null) {
                    g_module_index = i;
                    module_drop = "Y";
                    break; //return false;
                } else {
                    module_drop = "N";
                }
                i++;
            }
            if (module_drop == "N") {
                var j = 0;
                for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (g_shelf_edit_flag == "Y") {
                        break; //return false;
                    }

                    if (Modules.ParentModule == null) {
                        var i = 0;
                        for (const shelf of Modules.ShelfInfo) {
                            if (shelf.SObjID == l_objecthit_id) {
                                g_module_index = j;
                                g_shelf_index = i;
                                g_shelf_max_merch = shelf.MaxMerch;
                                g_shelf_edit_flag = "Y";
                                shelf_width = shelf.W;
                                shelf_height = shelf.H;
                                shelf_obj_type = shelf.ObjType;
                                break; //return false;
                            } else {
                                g_shelf_edit_flag = "N";
                            }
                            i++;
                        }
                    }
                    j++;
                }
            }

            if (g_shelf_edit_flag == "N") {
                var k = 0;
                for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (g_shelf_edit_flag == "Y") {
                        break; //return false;
                    }
                    if (Modules.ParentModule == null) {
                        var i = 0;
                        for (const Shelf of Modules.ShelfInfo) {
                            if (g_item_edit_flag == "Y") {
                                break; //return false;
                            }
                            var j = 0;
                            for (const items of Shelf.ItemInfo) {
                                if (items.ObjID == l_objecthit_id) {
                                    g_module_index = k;
                                    g_shelf_index = i;
                                    g_item_index = j;
                                    g_item_edit_flag = "Y";
                                    shelf_obj_type = Shelf.ObjType;
                                    break; //return false;
                                } else {
                                    g_item_edit_flag = "N";
                                }
                                j++;
                            }
                            i++;
                        }
                    }
                    k++;
                }
            }
            if (g_module_index !== -1) {
                var min_shelf = 100;
                var shelf_id;
                var total_items = 0;
                var i = 0;
                for (const Shelf of g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo) {
                    if (parseFloat(locationY) > parseFloat(Shelf.Y) - Shelf.H / 2 && parseFloat(locationY) < parseFloat(Shelf.Y) + Shelf.H / 2 && parseFloat(locationX) > parseFloat(Shelf.X) - Shelf.W / 2 && parseFloat(locationX) < parseFloat(Shelf.X) + Shelf.W / 2) {
                        shelf_id = Shelf.Shelf;
                        shelf_obj_type = Shelf.ObjType;
                        g_shelf_index = i;
                    } else {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            if (parseFloat(Shelf.Y) < parseFloat(locationY) && parseFloat(locationX) > parseFloat(Shelf.X) - Shelf.W / 2 && parseFloat(locationX) < parseFloat(Shelf.X) + Shelf.W / 2) {
                                if (min_shelf > parseFloat(locationY) - parseFloat(Shelf.Y)) {
                                    min_shelf = parseFloat(locationY) - parseFloat(Shelf.Y);
                                    shelf_id = Shelf.Shelf;
                                    shelf_obj_type = Shelf.ObjType;
                                    g_shelf_index = i;
                                }
                            }
                        }
                    }
                    i++;
                }
            }
        }

        if (typeof g_shelf_index !== undefined && g_shelf_index !== "") {
            g_pog_index = p_pog_index;
            set_select_canvas(p_pog_index);
            g_all_pog_flag = "N";
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
            var orient_arr = [];
            //There can be multiple items dragged at a time.
            for (var i = 0; i < p_item_list.length; i++) {
                var this_record = product_model.getRecord(p_item_list[i].innerText);
                var item_dim_type = product_model.getValue(this_record, "DIM_TYPE");
                var item_width = parseFloat(product_model.getValue(this_record, "ITEM_WIDTH")) / 100;
                var item_height = parseFloat(product_model.getValue(this_record, "ITEM_HEIGHT")) / 100;
                var item_depth = parseFloat(product_model.getValue(this_record, "ITEM_DEPTH")) / 100;
                var orientation = product_model.getValue(this_record, "ORIENTATION");
                var orient_desc = product_model.getValue(this_record, "ORIENTATION_DESC");

                if (item_dim_type == null || typeof item_dim_type == undefined) {
                    item_dim_type = "U";
                }
                if (isNaN(item_width) || item_width == 0) {
                    item_width = parseFloat($v("P25_POG_ITEM_DEFAULT_WIDTH")) / 100;
                }
                if (isNaN(item_height) || item_height == 0) {
                    item_height = parseFloat($v("P25_POG_ITEM_DEFAULT_HEIGHT")) / 100;
                }
                if (isNaN(item_depth) || item_depth == 0) {
                    item_depth = parseFloat($v("P25_POG_ITEM_DEFAULT_DEPTH")) / 100;
                }
                org_depth_arr.push(item_depth);
                org_height_arr.push(item_height);
                org_width_arr.push(item_width);
                //getting dimension according to orientation.
                var [new_orient, new_desc] = get_item_exists_orientation(p_item_list[i].innerText, 0);
                if (typeof new_orient !== "undefined" && orientation == "0") {
                    orientation = new_orient;
                    var details = {};
                    details["NewOrient"] = new_orient;
                    details["NewDesc"] = new_desc;
                    orient_arr.push(details);
                } else {
                    var details = {};
                    details["NewOrient"] = orientation == null ? "" : orientation;
                    details["NewDesc"] = orientation == null ? "" : orient_desc;
                    orient_arr.push(details);
                }
                var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(orientation, item_width, item_height, item_depth);

                item_arr.push(p_item_list[i].innerText);
                item_dim_arr.push(item_dim_type);
                item_depth_arr.push(parseFloat(item_depth));
                item_height_arr.push(parseFloat(item_height));
                item_width_arr.push(parseFloat(item_width));
            }
            var items_arr = shelfdtl.ItemInfo;
            var min_distance_arr = [];
            var min_index_arr = [];
            var obj_id_arr = [];
            var min_distance = 0;
            var spread_product = shelfdtl.SpreadItem;
            var shelfInfo = JSON.parse(JSON.stringify(shelfdtl));
            var objID = JSON.parse(JSON.stringify(shelfdtl.SObjID));
            undoObjectsInfo = [];
            undoObjectsInfo.push(shelfInfo);
            undoObjectsInfo.moduleIndex = g_module_index;
            undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
            undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
            undoObjectsInfo.shelfIndex = g_shelf_index;
            undoObjectsInfo.actionType = "ITEM_DELETE";
            undoObjectsInfo.startCanvas = p_pog_index;
            undoObjectsInfo.objectID = objID;
            undoObjectsInfo.itemColorFlag = "R";
            if (spread_product == "R") {
                var i = 0;
                for (const items of items_arr) {
                    shelfdtl.ItemInfo[i].Exists = "E";
                    if (items.X > locationX) {
                        min_distance_arr.push(items.X - parseFloat(locationX));
                        min_index_arr.push(i);
                    }
                    i++;
                }
            } else {
                var i = 0;
                for (const items of items_arr) {
                    shelfdtl.ItemInfo[i].Exists = "E";
                    if (items.X < locationX) {
                        min_distance_arr.push(parseFloat(locationX) - items.X);
                        min_index_arr.push(i);
                    }
                    i++;
                }
            }
            min_distance = Math.min.apply(Math, min_distance_arr);
            var index = min_distance_arr.findIndex(function (number) {
                return number == min_distance;
            });
            var min_index = min_index_arr[index];

            var new_index = 0;
            for (var i = 0; i < item_width_arr.length; i++) {
                if (i == 0) {
                    new_index = min_index;
                } else {
                    new_index = new_index + 1;
                }
                //using random objid from temporary purpose to process items before creating them.
                var random_id = Math.floor(Math.random() * 16777216);
                var return_val = set_item_values(item_arr[i], item_width_arr[i], item_height_arr[i], item_depth_arr[i], item_dim_arr[i], 0, "N", -1, "", new_index, {}, p_pog_index, orient_arr[i].NewOrient, orient_arr[i].NewDesc, random_id);
                item_index_arr.push(return_val);
                obj_id_arr.push(random_id);

                shelfdtl.ItemInfo[return_val].OW = org_width_arr[i];
                shelfdtl.ItemInfo[return_val].OH = org_height_arr[i];
                shelfdtl.ItemInfo[return_val].OD = org_depth_arr[i];
            }
            var spread_gap = shelfdtl.HorizGap;
            var horiz_gap = spread_gap;
            var spread_product = shelfdtl.SpreadItem;
            var item_length = shelfdtl.ItemInfo.length;
            var allow_crush = shelfdtl.AllowAutoCrush;
            var return_val = "N";

            for (var i = 0; i < item_index_arr.length; i++) {
                if (shelf_obj_type == "SHELF" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "N") || shelf_obj_type == "BASKET" || shelf_obj_type == "PALLET") {
                    //ASA-1125
                    shelfY = parseFloat(shelfdtl["Y"]) + parseFloat(shelfdtl["H"]) / 2 + shelfdtl.ItemInfo[item_index_arr[i]].H / 2;
                } else if (shelf_obj_type == "PEGBOARD" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                    //ASA-1125
                    var closest = get_closest_peg(item_height_arr[i], g_module_index, g_shelf_index, locationY, p_pog_index);
                    shelfY = closest - parseFloat(item_height_arr[i]) / 2;
                    shelfdtl.ItemInfo[item_index_arr[i]].FromProductList = "Y";
                    shelfdtl.ItemInfo[item_index_arr[i]].Exists = "N";
                    if (g_pegbrd_auto_placing == "Y") {
                        shelfdtl.ItemInfo[item_index_arr[i]].Edited = "Y";
                    }
                } else if (shelf_obj_type == "HANGINGBAR") {
                    shelfY = parseFloat(shelfdtl["Y"]) - shelfdtl.ItemInfo[item_index_arr[i]].H / 2;
                } else if (shelf_obj_type == "ROD") {
                    shelfY = parseFloat(shelfdtl["Y"]) - shelfdtl.H / 2 - shelfdtl.ItemInfo[item_index_arr[i]].H / 2;
                }
                shelfdtl.ItemInfo[item_index_arr[i]].Y = shelfY;
                shelfdtl.ItemInfo[item_index_arr[i]].Exists = "N";
                shelfdtl.ItemInfo[item_index_arr[i]].DropY = locationY;
            }
            //for pegboard or chest as pegboard, we need t ofind the first top position an then set other items next to it.
            if (item_index_arr.length > 1) {
                if (shelf_obj_type == "PEGBOARD" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                    //ASA-1125
                    var max_top = -9999;
                    for (var i = 0; i < item_index_arr.length; i++) {
                        max_top = Math.max(max_top, locationY + shelfdtl.ItemInfo[item_index_arr[i]].H / 2);
                    }
                    if (g_pegbrd_auto_placing == "Y") {
                        for (var i = 0; i < item_index_arr.length; i++) {
                            shelfdtl.ItemInfo[item_index_arr[i]].Y = max_top - shelfdtl.ItemInfo[item_index_arr[i]].H / 2;
                            shelfdtl.ItemInfo[item_index_arr[i]].DropY = shelfdtl.ItemInfo[item_index_arr[i]].Y;
                        }
                    } else {
                        var high_y = 0;
                        for (var i = 0; i < item_index_arr.length; i++) {
                            if (i == 0) {
                                high_y = shelfdtl.ItemInfo[item_index_arr[i]].Y + shelfdtl.ItemInfo[item_index_arr[i]].H / 2;
                            }
                            if (high_y < shelfdtl.ItemInfo[item_index_arr[i]].Y + shelfdtl.ItemInfo[item_index_arr[i]].H / 2) {
                                high_y = shelfdtl.ItemInfo[item_index_arr[i]].Y + shelfdtl.ItemInfo[item_index_arr[i]].H / 2;
                            }
                        }
                        for (var i = 0; i < item_index_arr.length; i++) {
                            shelfdtl.ItemInfo[item_index_arr[i]].Y = high_y - shelfdtl.ItemInfo[item_index_arr[i]].H / 2;
                        }
                    }
                }
                var sum_width = 0;
                var items_list = shelfdtl.ItemInfo;
                var i = 0;
                for (const items of items_list) {
                    if (item_index_arr.indexOf(i) !== -1) {
                        sum_width += items.W;
                        items.Exists = "N";
                    }
                    i++;
                }
                var loc_start = locationX - sum_width / 2;
                var i = 0;
                var l = 0;
                for (const items of items_list) {
                    if (item_index_arr.indexOf(i) !== -1) {
                        shelfdtl.ItemInfo[i].X = loc_start + items.W / 2;
                        loc_start += items.W;
                        l++;
                    }
                    i++;
                }
            } else {
                shelfdtl.ItemInfo[item_index_arr[0]].X = locationX;
                if (g_pegbrd_auto_placing == "Y" && shelf_obj_type == "PEGBOARD") {
                    shelfdtl.ItemInfo[item_index_arr[0]].Y = locationY;
                }
            }
            if (shelfdtl.SpreadItem == "F") {
                var i = 0;
                for (const fitems of shelfdtl.ItemInfo) {
                    if (item_index_arr.indexOf(i) == -1) {
                        fitems.W = fitems.RW;
                    }
                    i++;
                }
            }

            if (shelf_obj_type == "SHELF" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "N") || shelf_obj_type == "PALLET" || shelf_obj_type == "HANGINGBAR") {
                //ASA-1125
                var new_x = 0;
                var i = 0;
                var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf); //ASA--1329 KUSH
                if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) { //ASA--1329 KUSH
                    await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, locationX, 'Y', 'N', -1, new_index, []); //ASA--1329 KUSH
                }

                if (reorder_items(g_module_index, g_shelf_index, p_pog_index)) {
                    for (const items of shelfdtl.ItemInfo) {
                        new_x = get_item_xaxis(items.W, items.H, items.D, items.CType, locationX, horiz_gap, spread_product, spread_gap, g_module_index, g_shelf_index, i, "Y", item_length, "N", p_pog_index);
                        // Need to reset the index of new items after setting items for combined shelfs
                        if (obj_id_arr.indexOf(items.RandomID) !== -1) {
                            var itemIndx = obj_id_arr.indexOf(items.RandomID);
                            item_index_arr[itemIndx] = i
                        }
                        if (item_index_arr.indexOf(i) !== -1) {
                            //ASA-1410, added function call for capping
                            await set_auto_facings(g_module_index, g_shelf_index, i, items, "D", "I", "A", p_pog_index);
                            return_val = item_height_validation(items.H, g_module_index, g_shelf_index, i, "Y", new_x, allow_crush, items.CrushVert, items.Fixed, "Y", items.D, "N", p_pog_index, "Y"); //ASA-1830 Issue 1 Added Y for p_byPassMedicineOverhung
                            if (return_val == "N") {
                                shelfdtl.ItemInfo[i].X = new_x;
                                if (shelf_obj_type == "PALLET") {
                                    shelfdtl.ItemInfo[i].Z = 0;
                                } else {
                                    shelfdtl.ItemInfo[i].Exists = "E";
                                }
                            } else {
                                break; //return false;
                            }
                        }
                        i++;
                    }
                }
            }

            var l_index = 0; //ASA-1410 issue 1
            for (const items of shelfdtl.ItemInfo) {
                if (item_index_arr.indexOf(l_index) !== -1) {
                    //ASA-1410, added function call for capping
                    await set_item_capping(p_pog_index, g_module_index, g_shelf_index, l_index, 'N', 'Y');//ASA-1410 issue 10 20240625 //ASA-1412 issue 1 20240628
                }
                l_index++;
            }
            //ASA-1410 issue 1
            var drag_item_arr = [];
            if (return_val == "N" && validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, shelf_obj_type, g_module_index, g_shelf_index, -1, "N", 0, 0, 0, locationX, "N", "N", "Y", "N", "N", drag_item_arr, "Y", "Y", "Y", p_pog_index)) {
                //identify if any change in POG
                g_pog_edited_ind = "Y";

                var new_items_arr = [];
                var new_item_index_arr = [];
                var items_list = shelfdtl.ItemInfo;
                var modules = g_pog_json[p_pog_index].ModuleInfo[g_module_index];
                var shelfs = shelfdtl;
                var i = 0;
                for (const items of items_list) {
                    if (shelf_obj_type == "PEGBOARD" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                        //ASA-1125
                        items.Exists = "E";
                    }
                    if (item_index_arr.indexOf(i) !== -1) {
                        new_items_arr.push(items);
                        new_item_index_arr.push(i);
                        await set_auto_facings(g_module_index, g_shelf_index, i, items, "B", "I", "A", p_pog_index);
                    }
                    i++;
                }
                $(".live_image").css("color", "#c7c7c7").css("cursor", "auto");
                $(".open_pdf").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
                $(".open_pdf_online").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
                if ($v("P25_POGCR_LOAD_IMG_FROM") == "DB") {
                    var return_val = await get_images(g_module_index, g_shelf_index, new_items_arr, new_item_index_arr, parseFloat($v("P25_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P25_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P25_IMAGE_COMPRESS_RATIO")));
                }

                if (shelfdtl.SpreadItem == "F") {
                    var i = 0;
                    for (const fitems of shelfdtl.ItemInfo) {
                        if (item_index_arr.indexOf(i) == -1) {
                            fitems.W = fitems.RW;
                        }
                        i++;
                    }
                } //else {//20240415 - Regression Issue 2 -- we should always call recreate_all_items to create the added item
                if (reorder_items(g_module_index, g_shelf_index, p_pog_index)) {
                    // ASA-1095
                    if (shelf_obj_type == "SHELF" && (shelfdtl.SpreadItem == "L" || shelfdtl.SpreadItem == "R")) {
                        l_edited_item_index = mergeAdjacentItems(p_pog_index, g_module_index, g_shelf_index, new_item_index_arr[0]);
                    }
                    var return_val = await recreate_all_items(g_module_index, g_shelf_index, shelf_obj_type, "N", locationX, -1, item_width_arr.length, "Y", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y'); //ASA-1350 issue 6 added parameters
                }
                // }//20240415 - Regression Issue 2
                //capture the module is edit or not to create changed text box
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].EditFlag = "Y";

                if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == 'CHEST' && g_chest_as_pegboard == 'Y') { //Bug-26122 - splitting the chest
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ChestEdit = 'Y';
                }

                var items_list = shelfdtl.ItemInfo;
                g_undo_details = [];
                g_undo_obj_arr = [];
                g_undo_supp_obj_arr = [];
                var counter = 0;
                var i = 0;
                for (const items of items_list) {
                    if (obj_id_arr.indexOf(items.RandomID) !== -1) {
                        g_deletedItems.push(items.Item);
                        items.Exists = "E";
                        counter++;
                    }
                    i++;
                }

                g_keyCode = 0;
                undoObjectsInfo.g_deletedItems = g_deletedItems;
                g_allUndoObjectsInfo.push(undoObjectsInfo);
                logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y");
                g_allUndoObjectsInfo = [];
                //recreate the orientation view if any present
                async function recreate_view() {
                    var returnval = await recreate_compare_views(g_compare_view, "N");
                }
                recreate_view();

                $(".live_image").css("color", "white").css("cursor", "pointer");
                // $(".open_pdf").css("color", "black").attr("onclick", "open_pdf()").css("cursor", "pointer"); //Task_29818
                $(".open_pdf").css("color", "black").css("cursor", "pointer");                                  //Task_29818
                // $(".open_pdf_online").css("color", "black").attr("onclick", "open_pdf_online()").css("cursor", "pointer");  //Task_29818
                $(".open_pdf_online").css("color", "black").css("cursor", "pointer");                           //Task_29818
                var updateFixelDaysOfSupply = await calculateFixelAndSupplyDays("N", p_pog_index);
                let res = await deleted_items_log(g_deletedItems, "A", g_pog_index);
            } else {
                for (var i = item_index_arr.length - 1; i >= 0; i--) {
                    if (item_index_arr[i] == 0) {
                        shelfdtl.ItemInfo.splice(item_index_arr[i], item_index_arr[i] + 1);
                    } else {
                        shelfdtl.ItemInfo.splice(item_index_arr[i], 1);
                    }
                }
                var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf); //ASA--1329 KUSH
                if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) { //ASA--1329 KUSH
                    await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, locationX, 'Y', 'N', -1, new_index, []); //ASA--1329 KUSH
                }

                logDebug("function : create_item_list", "E");
            }
        }
        g_objecthit_id = "";
        render(p_pog_index);
        g_product_list_drag = "N";
    } catch (err) {
        error_handling(err);
    }
}

//this function will compress the image according to the ratio given to it and return the image base64 back.
async function compress_image_data(p_image, p_width, p_height, p_compress_ratio) {
    logDebug("function : compress_image_data", "S");
    var canvas = document.createElement("canvas");
    canvas.width = p_width;
    canvas.height = p_height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(p_image, 0, 0, p_width, p_height);

    //preview.appendChild(canvas); // do the actual resized preview
    logDebug("function : compress_image_data", "E");
    return canvas.toDataURL("image/jpeg", p_compress_ratio);
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
                                    var return_val = await recreate_all_items(i, j, shelfs.ObjType, "Y", -1, -1, shelfs.ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y'); //ASA-1350 issue 6 added parameters
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
    var total_width = parseFloat($v("P25_ITEM_WIDTH")) / 100;
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
        $s("P25_ITEM_EDIT_IND", "N");
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
            var return_val = await call_ajax(p_ModuleIndex, p_ShelfIndex, p_ItemIndex, details_arr[0], img_index, item_code, p_Merchstyle, parseFloat($v("P25_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P25_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P25_IMAGE_COMPRESS_RATIO")));
        } else {
            ItemImageInfo["Item"] = p_items.Item;
            ItemImageInfo["MIndex"] = p_ModuleIndex;
            ItemImageInfo["SIndex"] = p_ShelfIndex;
            ItemImageInfo["IIndex"] = p_ItemIndex;
            ItemImageInfo["Orientation"] = details_arr[0];
            ItemImageInfo["MerchStyle"] = p_Merchstyle;
            ItemImageInfo["ItemImage"] = null;
            g_ItemImages.push(ItemImageInfo);
            var return_val = await call_ajax(p_ModuleIndex, p_ShelfIndex, p_ItemIndex, details_arr[0], g_ItemImages.length - 1, item_code, p_Merchstyle, parseFloat($v("P25_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P25_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P25_IMAGE_COMPRESS_RATIO")));
        }
    }
}

//this function is called when user edit the item. the product details popup will open and when they click save. this function is called.
async function edit_items(p_item_index, p_camera, p_pog_index) {
    logDebug("function : edit_items; i_item_index : " + p_item_index, "S");
    try {
        var item_depth_arr = [],
            item_height_arr = [],
            item_width_arr = [],
            item_arr = [];
        var item_width = 0,
            item_index_arr = [],
            item_height = 0,
            item_depth = 0,
            horiz_facing = 0,
            vert_facing = 0,
            crush_width = 0,
            crush_height = 0,
            crush_depth = 0,
            real_width = 0,
            real_height = 0,
            real_depth = 0,
            dim_update_pass = "Y",
            passed = true;
        dim_not_match = "N";
        var facing_edit = "N";
        var chest_changex = 'N';
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
        var itemdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index];
        var pegHeadRoom = itemdtl.pegHeadRoom;
        var l_items_details = sessionStorage.getItem("items_details") !== null ? JSON.parse(sessionStorage.getItem("items_details")) : {};
        console.log("items inside", l_items_details, l_items_details.Item);
        if (typeof l_items_details.Item !== "undefined") {
            //set if the dimension is changed from dimension update in product details popup.
            if (typeof l_items_details.dim_details.U !== "undefined") {
                set_dim_change_values(l_items_details.dim_details, l_items_details.Item, p_pog_index);
            }
            var nesting_value = l_items_details.NestingVal;
            var items = l_items_details;
            var depth = items.D; //ASA-1273
            var depth_facing = items.BaseD; //ASA-1273
            var item_height = items.RH; //ASA-1273
            var CapDepthChanged = items.CapDepthChanged; //ASA-1273
            var l_ver_facing = items.BVert; //bug_26262
            var l_total_height = items.H;

            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CWPerc = items.CWPerc; // S ASA-1104
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CDPerc = items.CDPerc;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CHPerc = items.CHPerc; // E ASA-1104t
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CrushD = items.CrushD;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].SqzPer = (typeof items.CrushHoriz !== "undefined" ? items.CrushHoriz : 0) + ":" + (typeof items.CrushVert !== "undefined" ? items.CrushVert : 0) + ":" + (typeof items.CrushD !== "undefined" ? items.CrushD : 0);
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].UnitperTray = items.UnitperTray;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].UnitperCase = items.UnitperCase;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapDepthChanged = items.CapDepthChanged //ASA-1273
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].MPogVertFacings = items.MPogVertFacings; //ASA-1408
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].MPogHorizFacings = items.MPogHorizFacings; //ASA-1408
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].MPogDepthFacings = items.MPogDepthFacings //ASA-1408


            var undoObjectsInfo = [];
            var objectID = shelfdtl.SObjID;
            undoObjectsInfo.moduleIndex = g_module_index;
            undoObjectsInfo.shelfIndex = g_shelf_index;
            undoObjectsInfo.actionType = "ITEM_DELETE";
            undoObjectsInfo.startCanvas = g_start_canvas;
            undoObjectsInfo.objectID = objectID;
            undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
            undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
            undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfdtl)));
            var newItemInfo = JSON.parse(JSON.stringify(shelfdtl.ItemInfo));
            g_allUndoObjectsInfo.push(undoObjectsInfo);
            logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
            g_allUndoObjectsInfo = [];
            //get the item dim based on the merch style selected from master data in iteminfo
            if (items.MerchStyle == "0") {
                if (wpdSetFixed(items.UW) !== wpdSetFixed(items.OrgUW) || wpdSetFixed(items.UH) !== wpdSetFixed(items.OrgUH) || wpdSetFixed(items.UD) !== wpdSetFixed(items.OrgUD)) {
                    item_width = items.OrgUW;
                    item_height = items.OrgUH;
                    item_depth = items.OrgUD;
                    dim_not_match = "Y";
                } else {
                    item_width = items.UW;
                    item_height = items.UH;
                    item_depth = items.UD;
                }
            } else if (items.MerchStyle == "2") {
                if (wpdSetFixed(items.CW) !== wpdSetFixed(items.OrgCW) || wpdSetFixed(items.CH) !== wpdSetFixed(items.OrgCH) || wpdSetFixed(items.CD) !== wpdSetFixed(items.OrgCD)) {
                    item_width = items.OrgCW;
                    item_height = items.OrgCH;
                    item_depth = items.OrgCD;
                    dim_not_match = "Y";
                } else {
                    item_width = items.CW;
                    item_height = items.CH;
                    item_depth = items.CD;
                }
            } else if (items.MerchStyle == "1") {
                if (wpdSetFixed(items.TW) !== wpdSetFixed(items.OrgTW) || wpdSetFixed(items.TH) !== wpdSetFixed(items.OrgTH) || wpdSetFixed(items.TD) !== wpdSetFixed(items.OrgTD)) {
                    item_width = items.OrgTW;
                    item_height = items.OrgTH;
                    item_depth = items.OrgTD;
                    dim_not_match = "Y";
                } else {
                    item_width = items.TW;
                    item_height = items.TH;
                    item_depth = items.TD;
                }
            } else if (items.MerchStyle == "3") {
                if (wpdSetFixed(items.DW) !== wpdSetFixed(items.OrgDW) || wpdSetFixed(items.DH) !== wpdSetFixed(items.OrgDH) || wpdSetFixed(items.DD) !== wpdSetFixed(items.OrgDD)) {
                    item_width = items.OrgDW;
                    item_height = items.OrgDH;
                    item_depth = items.OrgDD;
                    dim_not_match = "Y";
                } else {
                    item_width = items.DW;
                    item_height = items.DH;
                    item_depth = items.DD;
                }
            }
            //check if any dim difference is there from old dim to new dim after edit item. and update it.
            if (check_dim_difference(g_module_index, g_shelf_index, p_item_index, p_pog_index)) {
                dim_not_match = "Y";
            }

            if (dim_not_match == "Y") {
                dim_update_pass = await org_dim_update_items(g_module_index, g_shelf_index, p_item_index, items.Item, "Y", p_pog_index);
            } else {
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].DimUpdate = "N";
                console.log("items edit", items);
                if (typeof items.OrgTW !== "undefined" && (wpdSetFixed(items.TW) !== wpdSetFixed(items.OrgTW) || wpdSetFixed(items.TH) !== wpdSetFixed(items.OrgTH) || wpdSetFixed(items.TD) !== wpdSetFixed(items.OrgTD))) {
                    items.TW = items.OrgTW;
                    items.TH = items.OrgTH;
                    items.TD = items.OrgTD;
                } else if (wpdSetFixed(items.CW) !== wpdSetFixed(items.OrgCW) || wpdSetFixed(items.CH) !== wpdSetFixed(items.OrgCH) || wpdSetFixed(items.CD) !== wpdSetFixed(items.OrgCD)) {
                    items.CW = items.OrgCW;
                    items.CH = items.OrgCH;
                    items.CD = items.OrgCD;
                } else if (wpdSetFixed(items.DW) !== wpdSetFixed(items.OrgDW) || wpdSetFixed(items.DH) !== wpdSetFixed(items.OrgDH) || wpdSetFixed(items.DD) !== wpdSetFixed(items.OrgDD)) {
                    items.DW = items.OrgDW;
                    items.DH = items.OrgDH;
                    items.DD = items.OrgDD;
                }
            }
            var ItemInfo = JSON.parse(JSON.stringify(itemdtl));
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].OW = item_width;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].OH = item_height;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].OD = item_depth;

            var shelf_obj_type = shelfdtl.ObjType;
            var spread_product = shelfdtl.SpreadItem;
            var ShelfhorizGap = shelfdtl.HorizGap;
            var ItemHorizGap = itemdtl.HorizGap;

            var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, item_width, item_height, item_depth);
            //ASA-1170
            //if there is any change in width or height of the item. then we need to get new x from get_item_xaxis from. so we set chest_chagex to Y.
            if ((ItemInfo.BHoriz !== items.BHoriz || ItemInfo.BVert !== items.BVert || ItemInfo.BaseD !== items.BaseD) && ItemInfo.W == items.W && ItemInfo.H == items.H && ItemInfo.D == items.D) { //ASA-1327
                if (shelf_obj_type == 'CHEST' && g_chest_as_pegboard == 'Y') {
                    chest_changex = 'Y';
                }
                facing_edit = 'Y';
            }
            if (ItemInfo.CrushHoriz !== items.CrushHoriz || ItemInfo.CrushVert !== items.CrushVert || ItemInfo.CrushD !== items.CrushD) { //ASA-1329 issue 18
                if (shelf_obj_type == 'CHEST' && g_chest_as_pegboard == 'Y') {
                    chest_changex = 'Y';
                }
            }

            real_width = item_width * items.BHoriz + (items.HorizGap / 100) * (items.BHoriz - 1);
            real_height = item_height * items.BVert + (items.VertGap / 100) * (items.BVert - 1);
            real_depth = item_depth * items.BaseD;
            //Note: capping and nesting cannot happen together. any one would have as per below. when nesting is given capping details will be 
            //reset to none in product details screen. 
            if (spread_product !== "F" && ShelfhorizGap == 0 && ItemHorizGap == 0 && nesting_value !== 0) {
                if (nesting_value < 0) {
                    nesting_value = nesting_value * -1;
                }
                if (items.ItemNesting == "H") {
                    var nest_value = (items.BVert - 1) * nesting_value;
                    item_height = item_height + nest_value;
                    item_width = item_width * items.BHoriz;
                    item_depth = item_depth * items.BaseD;
                } else if (items.ItemNesting == "W") {
                    var nest_value = (items.BHoriz - 1) * nesting_value;
                    item_width = item_width + nest_value;
                    item_height = item_height * items.BVert;
                    item_depth = item_depth * items.BaseD;
                } else if (items.ItemNesting == "D") {
                    item_depth = item_depth + (items.BaseD - 1) * nesting_value;
                    item_width = item_width * items.BHoriz;
                    item_height = item_height * items.BVert;
                }
                //ASA-1466 -S
                real_width = item_width + (items.HorizGap / 100) * (items.BHoriz - 1);
                real_height = item_height + (items.VertGap / 100) * (items.BVert - 1);
                real_depth = item_depth;
                //ASA-1466 -E
            } else {
                if (items.CapStyle == "1" || items.CapStyle == "2" || items.CapStyle == "3") {
                    var cap_merch = items.CapMerch;
                    var cap_orient = items.CapOrientaion;
                    if (itemdtl.CapOrientaion !== items.CapOrientaion || itemdtl.CapMerch !== items.CapMerch || items.ProdImgUpload == "Y") { //ASA-1500 Issue 3
                        await get_edit_item_img(g_module_index, g_shelf_index, p_item_index, items, items.CapOrientaion, items.CapMerch, p_pog_index);
                    }
                }
                //getting item image for capping orientation. this image will show only on the caps created.
                if (itemdtl.Orientation !== items.Orientation || itemdtl.MerchStyle !== items.MerchStyle || items.ProdImgUpload == "Y") { //ASA-1500 Issue 3
                    await get_edit_item_img(g_module_index, g_shelf_index, p_item_index, items, items.Orientation, items.MerchStyle, p_pog_index);
                }
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].MerchStyle = items.MerchStyle;

                if (items.CapStyle == "1" || items.CapStyle == "2" || items.CapStyle == "3") {
                    var modules = g_pog_json[p_pog_index].ModuleInfo[g_module_index];
                    var shelfs = shelfdtl;
                    var l_max_merch = get_cap_max_merch(g_module_index, g_shelf_index, modules, shelfs, p_pog_index, g_dft_max_merch); //ASA-1273 //20240415 - Regression Issue 8
                    var items_cnt = -1;
                    var orignal_height = item_height;
                    var cap_max_high = items.CapMaxH;
                    var new_height = item_height * items.BVert + (items.VertGap / 100) * (items.BVert - 1); //ASA-1170 : - crush_height;
                    var new_depth = item_depth * items.BaseD;
                    // ASA-1170, Start
                    var cap_width = 0,
                        cap_height = 0,
                        cap_depth = 0;
                    var cap_merch = items.CapMerch == "" ? "0" : items.CapMerch;
                    var cap_orientation = items.CapOrientaion == "" ? "4" : items.CapOrientaion;
                    if (cap_merch == "0") {
                        if (wpdSetFixed(items.UW) !== wpdSetFixed(items.OrgUW) || wpdSetFixed(items.UH) !== wpdSetFixed(items.OrgUH) || wpdSetFixed(items.UD) !== wpdSetFixed(items.OrgUD)) {
                            cap_width = items.OrgUW;
                            cap_height = items.OrgUH;
                            cap_depth = items.OrgUD;
                        } else {
                            cap_width = items.UW;
                            cap_height = items.UH;
                            cap_depth = items.UD;
                        }
                    } else if (cap_merch == "2") {
                        if (wpdSetFixed(items.CW) !== wpdSetFixed(items.OrgCW) || wpdSetFixed(items.CH) !== wpdSetFixed(items.OrgCH) || wpdSetFixed(items.CD) !== wpdSetFixed(items.OrgCD)) {
                            cap_width = items.OrgCW;
                            cap_height = items.OrgCH;
                            cap_depth = items.OrgCD;
                        } else {
                            cap_width = items.CW;
                            cap_height = items.CH;
                            cap_depth = items.CD;
                        }
                    } else if (cap_merch == "1") {
                        if (wpdSetFixed(items.TW) !== wpdSetFixed(items.OrgTW) || wpdSetFixed(items.TH) !== wpdSetFixed(items.OrgTH) || wpdSetFixed(items.TD) !== wpdSetFixed(items.OrgTD)) {
                            cap_width = items.OrgTW;
                            cap_height = items.OrgTH;
                            cap_depth = items.OrgTD;
                        } else {
                            cap_width = items.TW;
                            cap_height = items.TH;
                            cap_depth = items.TD;
                        }
                    } else if (cap_merch == "3") {
                        if (wpdSetFixed(items.DW) !== wpdSetFixed(items.OrgDW) || wpdSetFixed(items.DH) !== wpdSetFixed(items.OrgDH) || wpdSetFixed(items.DD) !== wpdSetFixed(items.OrgDD)) {
                            cap_width = items.OrgDW;
                            cap_height = items.OrgDH;
                            cap_depth = items.OrgDD;
                        } else {
                            cap_width = items.DW;
                            cap_height = items.DH;
                            cap_depth = items.DD;
                        }
                    }
                    var [cWidth, cHeight, cDepth, capActualHeight, capActualWidth, capActualDepth] = get_new_orientation_dim(cap_orientation, cap_width, cap_height, cap_depth);

                    //ASA-1179, Start
                    var orgCapDepth = cap_height;
                    var mCapDepthCount = items.CapDepth !== "" && items.CapDepth > 1 ? parseInt(items.CapDepth) : 1;
                    var mCapDepth = orgCapDepth * mCapDepthCount;
                    if (mCapDepth > new_depth) { //ASA-1273 Prasanna
                        items.CapDepth = Math.trunc(real_depth / cDepth);
                        //alert(get_message('CAP_FACING_ERR_DEPTH'));
                        //return;
                    }
                    //ASA-1179, End

                    if (capActualHeight == "W") {
                        cap_height = cap_width;
                    } else {
                        cap_height = cap_depth;
                    }
                    // ASA-1170, End
                    var mCapCount = items.CapFacing !== "" && items.CapFacing > 0 && items.CapFacing > cap_max_high && cap_max_high > 0 ? parseInt(cap_max_high) : parseInt(items.CapFacing);
                    //validation if RD is less then capping dimension depth then no capping allowed.
                    //validation if no of cappings exceeds items CapMaxH. then set back capping to CapMaxH.
                    //Logic for cap style = 1 (Min cap)
                    //always set 1 capping only and vertical facings does not change.
                    if (items.CapStyle == "1") {
                        // var new_depth = item_depth;
                        // items_cnt = 1;
                        // items_cnt = items.MCapTopFacing == "Y" && mCapCount > 0 ? mCapCount : items_cnt;
                        l_max_merch = l_max_merch - new_height;
                        // items_cnt = Math.trunc(l_max_merch / item_depth); //ASA-1170
                        items_cnt = Math.trunc(l_max_merch / cap_height); //ASA-1170
                        if (real_depth < cDepth) {
                            items_cnt = 0;
                        }
                        if (items_cnt > 0) { //ASA-1179 x31
                            items_cnt = 1;
                            item_height = new_height + cap_height * items_cnt; //ASA-1170, new_depth;
                        }
                        //Logic for cap style = 2 (Med Cap)
                        //keep the vertical facings intact and increase no of capping count till reach the max merch.
                    } else if (items.CapStyle == "2") {
                        l_max_merch = l_max_merch - new_height;
                        items_cnt = Math.trunc(l_max_merch / cap_height); //ASA-1170
                        if (items.MaxHCapStyle == "2" && items_cnt > cap_max_high && cap_max_high > 0) {
                            items_cnt = cap_max_high;
                        }
                        items_cnt = items.MCapTopFacing == "Y" && mCapCount > 0 ? mCapCount : items_cnt;
                        if (real_depth < cDepth) {
                            items_cnt = 0;
                        }
                        if (items_cnt > 0) { //ASA-1179 x31
                            item_height = new_height + cap_height * items_cnt; //ASA-1170
                        }
                        //logic for cap style = 3 (Max Cap)
                        //vertical facings will be changed to 1 and then calculate no of capping allowed till max merch.
                    } else if (items.CapStyle == "3") {
                        l_max_merch = l_max_merch - orignal_height;
                        items_cnt = Math.trunc(l_max_merch / cap_height); //ASA-1170
                        if (items.MaxHCapStyle == "3" && items_cnt > cap_max_high && cap_max_high > 0) {
                            items_cnt = cap_max_high;
                        }
                        items_cnt = items.MCapTopFacing == "Y" && mCapCount > 0 ? mCapCount : items_cnt;
                        if (real_depth < cDepth) {
                            items_cnt = 0;
                        }
                        if (items_cnt > 0) { //ASA-1179 x31
                            real_height = item_height; //task_26900 regression 5
                            item_height = item_height + cap_height * items_cnt;
                            $s("P25_ITEM_BASE_VERT", 1);
                            items.BVert = 1;
                        }
                    }
                    //if there is no items does not have dimensions. retain the cap settings as below.
                    if (items_cnt > 0) { //ASA-1179 x31
                        var capHorzCount = items.BHoriz;
                        var capCount = items_cnt * capHorzCount * mCapDepthCount;
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapFacing = items_cnt; //ASA-1170;
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapMerch = cap_merch; //ASA-1170
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapOrientaion = cap_orientation; //ASA-1170
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapHeight = cap_height; //ASA-1170
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].MCapTopFacing = items.MCapTopFacing; //ASA-1170
                        if (CapDepthChanged == "N" || typeof CapDepthChanged == 'undefined') { //ASA-1273 Prasanna
                            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapDepth = Math.trunc(real_depth / cDepth); //ASA-1179 ASA-1273
                        } else {
                            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapDepth = mCapDepthCount; //ASA-1179
                        }

                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapCount = items_cnt; //ASA-1170;

                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapHorz = capHorzCount; //ASA-1179

                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapTotalCount = capCount; //ASA-1179
                    } else {
                        //setting all the capping attributes to make the item show its cappings on screen after recreate.
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapFacing = 0; //ASA-1170;
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapHeight = 0; //ASA-1170
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].MCapTopFacing = "N"; //ASA-1170
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapCount = 0; //ASA-1170;
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapHorz = 0; //ASA-1179
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapDepth = 0; //ASA-1179
                        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapTotalCount = 0; //ASA-1179
                        // items.CapStyle = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapStyle;    //ASA-1476 #5
                        // $s("P25_CAP_STYLE", "0");        //ASA-1476 #5
                        item_height = item_height * items.BVert + (items.VertGap / 100) * (items.BVert - 1); //ASA-1170 : - crush_height;
                    }
                    items.CapCount = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapCount;
                    items.CapFacing = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapFacing;
                    items.CapMerch = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapMerch;
                    items.CapOrientaion = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapOrientaion;
                    items.CapHeight = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapHeight;
                    items.CapHorz = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapHorz; //ASA-1179
                    items.CapDepth = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapDepth; //ASA-1179
                    items.CapTotalCount = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].CapTotalCount; //ASA-1179

                    item_width = item_width * items.BHoriz + (items.HorizGap / 100) * (items.BHoriz - 1); //ASA-1170 : - crush_width;
                    item_depth = item_depth * items.BaseD; //ASA-1170 : - crush_depth;
                } else {
                    $s("P25_CAP_STYLE", "0");
                    item_width = item_width * items.BHoriz + (items.HorizGap / 100) * (items.BHoriz - 1); //ASA-1170 : - crush_width;
                    item_height = item_height * items.BVert + (items.VertGap / 100) * (items.BVert - 1); //ASA-1170 : - crush_height;
                    item_depth = item_depth * items.BaseD; //ASA-1170 : - crush_depth;
                }
            }
            var dim_type = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].DimT;
            var item_z = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].Z - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].D / 2;
            var return_val = set_item_values(items.Item, item_width, item_height, item_depth, dim_type, 0, "Y", p_item_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index].X, -1, items, p_pog_index, "");
            item_index_arr.push(return_val);

            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
            var itemdtl = shelfdtl.ItemInfo[p_item_index];
            itemdtl.RW = real_width;
            itemdtl.RH = real_height; //l_total_height / l_ver_facing; //bug_26262 //ASA-1343 --Depth facings wrong
            itemdtl.RD = real_depth;
            itemdtl.Z = item_z + item_depth / 2;

            //checking if the shelf where item is present is a combine shelf. then items need to be reset according to combine logic.
            var shelf_combine_crush = "N";
            if (g_combinedShelfs.length > 0) { //ASA-1307
                var [oldCombinationIndex, oldShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Shelf);
                if (oldCombinationIndex !== -1) {
                    shelf_combine_crush = "Y";
                    //ASA-1581, need to uses 'items' only as it is coming from popup screen, shall not use 'itemdtl' as we are not adding any tag 'ShelfAutoCrush' in the json
                    g_combinedShelfs[oldCombinationIndex][0].AllowAutoCrush = typeof items.ShelfAutoCrush == "undefined" ? "N" : items.ShelfAutoCrush;//ASA-1482 items.ShelfAutoCrush
                    g_pog_json[p_pog_index].ModuleInfo[g_combinedShelfs[oldCombinationIndex][0].MIndex].ShelfInfo[g_combinedShelfs[oldCombinationIndex][0].SIndex].AllowAutoCrush = items.ShelfAutoCrush; //ASA-1482 items.ShelfAutoCrush

                    var l_cnt = 0; //start Regression issue 20240510
                    for (const obj of g_combinedShelfs[oldCombinationIndex].ItemInfo) {
                        if (itemdtl.ObjID == obj.ObjID) { //ASA-1482 items.ObjID
                            console.log(obj);
                            g_combinedShelfs[oldCombinationIndex].ItemInfo[l_cnt] = itemdtl; //ASA-1482 items
                            break;
                        }
                        l_cnt++;
                    } //End Regression issue 20240510

                }
            }
            if (shelf_combine_crush == "N") { //ASA-1307
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].AllowAutoCrush = items.ShelfAutoCrush; //ASA-1104
            }
            //below crushitem is called only when user has enter the crush % manually. this means user intend to crush to the perc he entered.
            //if there is any change in width or height of the item. then we need to get new x from get_item_xaxis from. so we set chest_chagex to Y.
            if ((shelfdtl.ManualCrush == 'Y' && shelfdtl.ObjType == 'CHEST' && g_chest_as_pegboard == 'Y') || !(shelfdtl.ObjType == 'CHEST' && g_chest_as_pegboard == 'Y')) { //ASA-1300
                if (itemdtl.MVertCrushed == "Y") {
                    var retvheight = await crushItem(p_pog_index, g_module_index, g_shelf_index, return_val, "H", "Y", item_depth_arr, item_index_arr);
                    if (retvheight == "Y") { //ASA-1329 
                        chest_changex = "Y";
                    }
                }

                if (itemdtl.MHorizCrushed == "Y") {
                    var retvwidth = await crushItem(p_pog_index, g_module_index, g_shelf_index, return_val, "W", "Y", item_depth_arr, item_index_arr);
                    if (retvheight == "Y") { //ASA-1329
                        chest_changex = "Y";
                    }
                }

                if (itemdtl.MDepthCrushed == "Y") {
                    var retvdepth = await crushItem(p_pog_index, g_module_index, g_shelf_index, return_val, "D", "Y", item_depth_arr, item_index_arr);
                    if (retvheight == "Y") { //ASA-1329
                        chest_changex = "Y";
                    }
                }
            } else {
                if (itemdtl.MVertCrushed == "Y") {
                    itemdtl.CrushVert = 0;
                }
                if (itemdtl.MHorizCrushed == "Y") {
                    itemdtl.CrushHoriz = 0;
                }
                if (itemdtl.MDepthCrushed == "Y") {
                    itemdtl.CrushDepth = 0;
                }
            }

            var return_val = "N";
            var spread_gap = shelfdtl.HorizGap;
            var horiz_gap = spread_gap;
            var item_length = shelfdtl.ItemInfo.length;
            var allow_crush = shelfdtl.AllowAutoCrush;
            var CrushVert = itemdtl.MVertCrushed == "Y" ? itemdtl.CrushVert : itemdtl.CHPerc;
            var CrushHoriz = itemdtl.MHorizCrushed == "Y" ? itemdtl.CrushHoriz : itemdtl.CWPerc;
            var CrushDepth = itemdtl.MDepthCrushed == "Y" ? itemdtl.CrushD : itemdtl.CDPerc;
            var item_fixed = itemdtl.Fixed;
            var item_objid = itemdtl.ObjID;
            var top_id = itemdtl.TopObjID;
            var bottom_id = itemdtl.BottomObjID;
            var shelfY = -1;
            item_height = itemdtl.H;

            //getting Y axis based on the fixel type.
            if (shelf_obj_type == "SHELF" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "N") || shelf_obj_type == "BASKET" || shelf_obj_type == "PALLET") {
                //ASA-1125
                shelfY = wpdSetFixed(shelfdtl["Y"] + shelfdtl["H"] / 2 + item_height / 2);
            } else if (shelf_obj_type == "HANGINGBAR") {
                shelfY = wpdSetFixed(shelfdtl["Y"] - item_height / 2);
            } else if (shelf_obj_type == "ROD") {
                shelfY = wpdSetFixed(shelfdtl["Y"] - shelfdtl.H / 2 - item_height / 2);
            }
            var top_bottom_flag = "N";
            if ((typeof bottom_id !== "undefined" && bottom_id !== "") || (typeof top_id !== "undefined" && top_id !== "")) {
                var items_arr = itemdtl;
                itemdtl.Y = shelfY;
                update_top_bottom_xy(g_module_index, g_shelf_index, p_item_index, items_arr, p_pog_index);
                top_bottom_flag = "Y";
            } else if (!((shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y") || (shelf_obj_type == "PEGBOARD"))) { //ASA-1327       //ASA-1606
                itemdtl.Y = shelfY;
            }
            //if there is any dim mismatch. update all the similar items in whole POG.
            if (dim_not_match == "Y") {
                update_item_org_dim(g_module_index, g_shelf_index, item_index_arr[0], 0, 0, 0, 0, 0, 0, p_pog_index);
                shelfdtl.ItemInfo[item_index_arr[0]].DimUpdate = "Y";
            }

            if (reorder_items(g_module_index, g_shelf_index, p_pog_index)) {
                var i = 0;
                for (const fitems of shelfdtl.ItemInfo) {
                    if (fitems.ObjID == item_objid) {
                        p_item_index = i;
                        break; //return false;
                    }
                    i++;
                }
                var items = itemdtl;
                var shelfs = shelfdtl;
                //facing should be calculated for the item based on the shelf depth and max merch.
                if (facing_edit == "N") { //Regrssion issue 24
                    await set_auto_facings(g_module_index, g_shelf_index, p_item_index, items, "B", "I", "D", p_pog_index);
                }
                itemdtl.Exists = "N"; //ASA-1327

                if (shelf_obj_type == "PEGBOARD" || (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                    //ASA-1125
                    if (chest_changex == 'Y') { //ASA-1327
                        var [new_x, itemy] = get_item_xy(shelfs, items, items.W, items.H, p_pog_index);
                        itemdtl.X = new_x;
                        itemdtl.Y = itemy;
                    }
                } else if (chest_changex == 'N') { //ASA-1327
                    var new_x = get_item_xaxis(item_width, item_height, item_depth, shelf_obj_type, itemdtl.X, horiz_gap, spread_product, spread_gap, g_module_index, g_shelf_index, p_item_index, "Y", item_length, "N", p_pog_index);
                    return_val = await item_height_validation(item_height, g_module_index, g_shelf_index, p_item_index, "Y", new_x, allow_crush, CrushVert, item_fixed, "Y", item_depth, facing_edit, g_pog_index);
                    if (return_val == "N") {
                        itemdtl.X = new_x;
                    }
                    itemdtl.Exists = "N";
                }
            }
            item_width_arr.push(wpdSetFixed(itemdtl.W)); //ASA-1327 get lastest details after crush and auto facings
            item_height_arr.push(wpdSetFixed(itemdtl.H));
            item_depth_arr.push(wpdSetFixed(itemdtl.D));

            var drag_item_arr = [];
            $v("P25_AUTO_CALC_DEPTH_FACING_ON_SAVE") == "Y" && await maximizeItemDepthFacings("D", g_module_index, g_shelf_index, p_item_index, p_pog_index); //ASA-2007
            //validate_items will also do auto crushing when item is failing the validation. 
            if (return_val == "N" && validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, g_shelf_object_type, g_module_index, g_shelf_index, p_item_index, "Y", CrushHoriz, CrushVert, CrushDepth, itemdtl.X, $v("P25_ITEM_FIXED"), "N", "Y", top_bottom_flag, facing_edit, drag_item_arr, "Y", "Y", "Y", p_pog_index)) {
                //identify if any change in POG
                g_pog_edited_ind = "Y";
                itemdtl.pegHeadRoom = pegHeadRoom;
                if (dim_not_match == "Y") {
                    update_item_org_dim(g_module_index, g_shelf_index, item_index_arr[0], 0, 0, 0, 0, 0, 0, p_pog_index);
                    shelfdtl.ItemInfo[item_index_arr[0]].DimUpdate = "Y";
                }
                if (reorder_items(g_module_index, g_shelf_index, p_pog_index)) {
                    var return_txt = await recreate_all_items(g_module_index, g_shelf_index, g_shelf_object_type, "Y", -1, -1, shelfdtl.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y'); //ASA-1350 issue 6 added parameters
                }

                update_item_distance(g_module_index, g_shelf_index, p_pog_index);
                //recreate the orientation view if any present
                async function recreate_view() {
                    var returnval = await recreate_compare_views(g_compare_view, "N");
                }
                recreate_view();

                //capture the module is edit or not to create changed text box
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].EditFlag = "Y";
                if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == 'CHEST' && g_chest_as_pegboard == 'Y') { //Bug-26122 - splitting the chest
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ChestEdit = 'Y';
                }
                var res = await calculateFixelAndSupplyDays("N", p_pog_index);
            } else {
                var dim_update = shelfdtl.ItemInfo[item_index_arr[0]].DimUpdate;
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[p_item_index] = ItemInfo;
                itemdtl.DimUpdate = dim_update;
                if (dim_not_match == "Y") {
                    var selectedObject = g_world.getObjectById(shelfdtl.ItemInfo[item_index_arr[0]].ObjID);
                    selectedObject.WireframeObj.material.color.setHex(g_dim_error_color);
                    itemdtl.DimUpdate = "E";
                    selectedObject.DimUpdate = "E";
                    selectedObject.BorderColour = g_dim_error_color;
                    render(p_pog_index);
                }
            }
            //}
            g_dblclick_opened = "N";
            $s("P25_ITEM_EDIT_IND", "N");
            if (g_ItemImages.length > 0 && img_exists == "N") {
                var return_val = await save_image_to_coll(g_ItemImages, "1");
            }
            animate_all_pog(); //Regression isssue 22
            logDebug("function : edit_items", "E");
        }
        return "Yes";
    } catch (err) {
        error_handling(err);
    }
}

//this function is called in both create_item_list and edit_items to set the details in ItemInfo.
function set_item_values(p_item_code, p_item_width, p_item_height, p_item_depth, p_item_dim_type, p_item_Y, p_edited_ind, p_item_index, p_item_x, p_min_index, p_itemdtl, p_pog_index, p_orientation, p_orientation_desc, p_NewObjID) {
    logDebug("function : set_item_values; item_code : " + p_item_code + "; item_width : " + p_item_width + "; item_height : " + p_item_height + "; item_depth : " + p_item_depth + "; item_dim_type : " + p_item_dim_type + "; item_Y : " + p_item_Y + "; edited_ind : " + p_edited_ind + "; i_item_index : " + p_item_index + "; item_x : " + p_item_x + "; min_index : " + p_min_index, "S");
    var ItemInfo = {};
    var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
    var items = shelfdtl.ItemInfo[p_item_index];
    var item_return_index = -1;
    if (p_edited_ind == "N") {
        var product_model = apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model;
        var this_record = product_model.getRecord(p_item_code);
        item_description = product_model.getValue(this_record, "DESCRIPTION");
        barcode = product_model.getValue(this_record, "PRIM_BARCODE");
        supplier_name = product_model.getValue(this_record, "SUPPLIER_NAME");
        brand_name = product_model.getValue(this_record, "BRAND_SHOW"); //Task_26627
        group_no = product_model.getValue(this_record, "GROUP_NO");
        dept = product_model.getValue(this_record, "DEPARTMENT");
        item_class = product_model.getValue(this_record, "CLASS");
        subclass = product_model.getValue(this_record, "SUBCLASS");
        std_uom = product_model.getValue(this_record, "STANDARD_UOM");
        item_size_desc = product_model.getValue(this_record, "ITEM_SIZE_DESC");
        img_exists = product_model.getValue(this_record, "IMG_EXISTS");
        GoGreen = product_model.getValue(this_record, "GO_GREEN");
        LiveNewItem = product_model.getValue(this_record, "LIVE_NEW_ITEM"); //ASA-1250
        ItmDescChi = product_model.getValue(this_record, "BRAND_CN"); //Task_26627

        org_u_width = u_width = parseFloat(product_model.getValue(this_record, "ITEM_WIDTH")) / 100;
        org_u_height = u_height = parseFloat(product_model.getValue(this_record, "ITEM_HEIGHT")) / 100;
        org_u_depth = u_depth = parseFloat(product_model.getValue(this_record, "ITEM_DEPTH")) / 100;
        org_c_width = c_width = parseFloat(product_model.getValue(this_record, "C_WIDTH")) / 100;
        org_c_height = c_height = parseFloat(product_model.getValue(this_record, "C_HEIGHT")) / 100;
        org_c_depth = c_depth = parseFloat(product_model.getValue(this_record, "C_DEPTH")) / 100;
        org_t_width = t_width = parseFloat(product_model.getValue(this_record, "T_WIDTH")) / 100;
        org_t_height = t_height = parseFloat(product_model.getValue(this_record, "T_HEIGHT")) / 100;
        org_t_depth = t_depth = parseFloat(product_model.getValue(this_record, "T_DEPTH")) / 100;
        org_d_width = d_width = parseFloat(product_model.getValue(this_record, "D_WIDTH")) / 100;
        org_d_height = d_height = parseFloat(product_model.getValue(this_record, "D_HEIGHT")) / 100;
        org_d_depth = d_depth = parseFloat(product_model.getValue(this_record, "D_DEPTH")) / 100;
        org_crush_width_perc = crush_width_perc = parseFloat(product_model.getValue(this_record, "R_WIDTH"));
        org_crush_height_perc = crush_height_perc = parseFloat(product_model.getValue(this_record, "R_HEIGHT"));
        org_crush_depth_perc = crush_depth_perc = parseFloat(product_model.getValue(this_record, "R_DEPTH"));
        org_o_width = o_width = parseFloat(product_model.getValue(this_record, "O_WIDTH")) / 100;
        org_o_height = o_height = parseFloat(product_model.getValue(this_record, "O_HEIGHT")) / 100;
        org_o_depth = o_depth = parseFloat(product_model.getValue(this_record, "O_DEPTH")) / 100;
        org_n_width = n_width = parseFloat(product_model.getValue(this_record, "N_WIDTH")) / 100;
        org_n_height = n_height = parseFloat(product_model.getValue(this_record, "N_HEIGHT")) / 100;
        org_n_depth = n_depth = parseFloat(product_model.getValue(this_record, "N_DEPTH")) / 100;
        selling_price = parseFloat(nvl(product_model.getValue(this_record, "SELLING_PRICE"))); //20240415 Regression issue 1 parseFloat and nvl
        DaysOfSupply = product_model.getValue(this_record, "DAYS_OF_SUPPLY");
        sales_unit = parseFloat(nvl(product_model.getValue(this_record, "SALES_UNIT"))); //20240415 Regression issue 1 parseFloat and nvl
        net_sales = parseFloat(nvl(product_model.getValue(this_record, "NET_SALES"))); //20240415 Regression issue 1 parseFloat and nvl
        profit = parseFloat(nvl(product_model.getValue(this_record, "PROFIT"))); //20240415 Regression issue 1 parseFloat and nvl
        total_margin = parseFloat(nvl(product_model.getValue(this_record, "TOTAL_MARGIN"))); //20240415 Regression issue 1 parseFloat and nvl
        newItemYN = product_model.getValue(this_record, "NEW_ITEMYN");
        item_status = product_model.getValue(this_record, "ITEM_STATUS");
        item_price = product_model.getValue(this_record, "ITEM_PRICE");
        item_cost = product_model.getValue(this_record, "ITEM_COST");
        max_h_facings = parseInt(product_model.getValue(this_record, "MAX_H_FACINGS"));
        max_v_facings = parseInt(product_model.getValue(this_record, "MAX_V_FACINGS"));
        max_d_facings = parseInt(product_model.getValue(this_record, "MAX_D_FACINGS"));
        CogsAdj = parseInt(product_model.getValue(this_record, "COGS_ADJ"));
        GrossProfit = parseInt(product_model.getValue(this_record, "GROSS_PROFIT"));
        reg_mov = parseFloat(product_model.getValue(this_record, "REG_MOV"));
        avg_sales = parseFloat(product_model.getValue(this_record, "AVG_SALES"));
        item_status_desc = product_model.getValue(this_record, "ITEM_STATUS_DESC");
        WeeksCount = parseInt(product_model.getValue(this_record, "WEEKS_COUNT"));
        MovingItem = product_model.getValue(this_record, "MOVING_ITEM");
        max_v_facings = parseInt(product_model.getValue(this_record, "MAX_V_FACINGS"));
        max_d_facings = parseInt(product_model.getValue(this_record, "MAX_D_FACINGS"));
        //orientation_desc = product_model.getValue(this_record, "ORIENTATION_DESC");
        store_count = product_model.getValue(this_record, "STORE_COUNT");
        DescSecond = product_model.getValue(this_record, "DESC_SECOND");
        cdt_lvl1 = product_model.getValue(this_record, "CDT_LVL1"); //ASA-1130,ASA-1407 issue 6 parseFloat
        cdt_lvl2 = product_model.getValue(this_record, "CDT_LVL2"); //ASA-1130,ASA-1407 issue 6 parseFloat
        cdt_lvl3 = product_model.getValue(this_record, "CDT_LVL3"); //ASA-1130,ASA-1407 issue 6 parseFloat
        brad_category = product_model.getValue(this_record, "BRAND_CATEGORY");
        uda_item_status = product_model.getValue(this_record, "UDA_ITEM_STATUS"); //ASA-1407 issue 6
        gobe_co_brand = product_model.getValue(this_record, "GOBE_CO_BRAND");
        internet = product_model.getValue(this_record, "INTERNET");
        COO = product_model.getValue(this_record, "COO");
        SplrLbl = product_model.getValue(this_record, "SUPP_LABEL");
        LoGrp = product_model.getValue(this_record, "LAYOUT_GROUP");
        InternationalRng = product_model.getValue(this_record, "INTERNATIONAL_RANGE");
        ActualDPP = product_model.getValue(this_record, "ACTUAL_DPP"); //ASA-1182 ASA-1277-(3)
        DPPLoc = product_model.getValue(this_record, "DPP_PER_LOC"); //ASA-1308 Task-3
        StoreSOH = product_model.getValue(this_record, "STORE_SOH"); //ASA-1182 ASA-1277-(3)
        StoreNo = product_model.getValue(this_record, "STORE_NUMBER"); //ASA-1277-(3) Prasanna
        WeeksOfInventory = product_model.getValue(this_record, "WEEK_OF_INVENTORY"); //ASA-1277-(3) Sunaina
        NewItem = product_model.getValue(this_record, "NEW_ITEM"); //ASA-1182
        ItemSize = product_model.getValue(this_record, "ITEM_SIZE"); //Regression issue-21 -"Item_Size"
        //Item_chnbrand = product_model.getValue(this_record, "BRAND_CN");//Task_26627
        EDLP = product_model.getValue(this_record, "EDLP");
        unitpercase = product_model.getValue(this_record, "UNIT_PER_CASE");
        unitpertray = product_model.getValue(this_record, "UNIT_PER_TRAY");
        Categ = product_model.getValue(this_record, "CAT"); //Task_26627
        uda751 = product_model.getValue(this_record, "UDA751"); //ASA-1407 Task 1 -S
        uda755 = product_model.getValue(this_record, "UDA755"); //ASA-1407 Task 1 -E
        cap_style = product_model.getValue(this_record, "CAPSTYLE"); //ASA-1410
        cap_merch_style = product_model.getValue(this_record, "CAP_MERCH_STYLE"); //ASA-1410
        cap_orientation = product_model.getValue(this_record, "CAP_ORIENTATION"); //ASA-1410
        base_horiz = 1;
        base_vert = 1;
        base_depth = 1;
        color = $v("P25_POG_ITEM_DEFAULT_COLOR");
        crush_horiz = 0;
        crush_vert = 0;
        crush_depth = 0;
        itemobjid = "";
        random_id = p_NewObjID;
        item_fixed = "N";
        location_id = "";
        //item_size_desc = '';
        item_orientation = p_orientation;
        var det_arr = item_size_desc.split("*");
        //item_orientation = product_model.getValue(this_record, "ORIENTATION");
        merch_style = "0";
        rotation = 0;
        // cap_style = cap_style;
        Cap_max_high = 0;
        max_high_cap_style = "3";
        nesting = "";
        contain = "";
        contain_val = 0;
        nesting_val = 0;
        peg_id = "";
        item_overhang = 0;
        item_gap = 0;
        vert_gap = 0;
        item_qty = 1;
        cap_count = 0;
        //ASA-1170, Start
        cap_facing = 0;
        cap_merch = "";
        // cap_orientation = ""; //ASA-1410 Issue 1
        cap_height = 0;
        //ASA-1170, End
        cap_horz = 0; //ASA-1179
        cap_depth = 0; //ASA-1179
        item_y = p_item_Y;
        bottom_id = "";
        top_id = "";
        second_tier = "";
        pegboard_x = "";
        pegboard_y = "";
        delist_ind = "N";
        daysOfSupplyID = -1;
        cap_total_count = "";
        CDTLvl1 = "N";
        CDTLvl2 = "N";
        CDTLvl3 = "N";
        brandtype = product_model.getValue(this_record, "LABEL_TYPE"); //ASA-1751 issue 2
        //  PkSiz = det_arr[0] / det_arr[1]; // ""; Regression issue-21
        PkSiz = det_arr[1]; //ASA-1341 added to print the first numeric value of EngDesc
        //  ItmDescEng = brand_name + " " + item_description + " " + PkSiz + '*' + det_arr[1] + '*' + det_arr[2]; // ""; Regression issue-21
        ItmDescEng = brand_name + " " + item_description + " " + (det_arr[0] / det_arr[1]) + '*' + det_arr[1] + '*' + det_arr[2]; // ""; Regression issue-21
        MPogVertFacings = ""; //ASA-1408 Issue 3
        MPogHorizFacings = ""; //ASA-1408 Issue 3
        MPogDepthFacings = ""; //ASA-1408 Issue 3
        //ASA-1640 Start 
        item_condition = product_model.getValue(this_record, "ITEM_CONDITION");
        aur = product_model.getValue(this_record, "AUR");
        item_ranking = product_model.getValue(this_record, "ITEM_RANKING");
        weekly_sales = product_model.getValue(this_record, "WEEKLY_SALES");
        weekly_net_margin = product_model.getValue(this_record, "WEEKLY_NET_MARGIN");
        weekly_qty = product_model.getValue(this_record, "WEEKLY_QTY");
        net_margin_percent = product_model.getValue(this_record, "NET_MARGIN_PERCENT") !== "" ? Math.round(product_model.getValue(this_record, "NET_MARGIN_PERCENT") * 100) / 100 : ""; //ASA-1735 
        cumulative_nm = product_model.getValue(this_record, "CUMULATIVE_NM");
        top80_b2 = product_model.getValue(this_record, "TOP80_B2");
        item_brand_c = "";
        item_pog_dept = product_model.getValue(this_record, "ITEM_POG_DEPT");
        item_remark = product_model.getValue(this_record, "ITEM_REMARK");
        //ASA-2013 Start
        shelf_price = product_model.getValue(this_record, "SHELF_PRICE");
        promo_price = product_model.getValue(this_record, "PROMO_PRICE");
        discount_rate = product_model.getValue(this_record, "DISCOUNT_RATE");
        price_change_date = product_model.getValue(this_record, "PRICE_CHANGE_DATE");
        Weeks_In_Rotation = product_model.getValue(this_record, "WEEKS_IN_ROTATION");
        qty = product_model.getValue(this_record, "QTY");
        wh_stock = product_model.getValue(this_record, "WH_STOCK");
        store_stock = product_model.getValue(this_record, "STORE_STOCK");
        stock_intransit = product_model.getValue(this_record, "STOCK_INTRANSIT");
        //ASA-2013 End
        rtv_status = product_model.getValue(this_record, "RTV_STATUS");
        pusher = product_model.getValue(this_record, "PUSHER");
        divider = product_model.getValue(this_record, "DIVIDER");
        back_support = product_model.getValue(this_record, "BACK_SUPPORT");
        oos_perc = parseInt(product_model.getValue(this_record, "STORE_NUMBER") || 0) > 0
            ? ((parseInt(product_model.getValue(this_record, "STORE_NO_STOCK")) / parseInt(product_model.getValue(this_record, "STORE_NUMBER") || 1)) * 100).toFixed(2)
            : ""; //ASA-1688 Issue 2
        //g_pog_json[p_pog_index].LiveStoreCount != 0 ? ((parseInt(product_model.getValue(this_record, "STORE_NO_STOCK"))/g_pog_json[p_pog_index].LiveStoreCount)*100).toFixed(2) : ""; //ASA-1688 Added for oos%
        initial_item_desc = product_model.getValue(this_record, "INITIAL_ITEM_DESC"); //ASA-1734 Issue 1
        initial_brand = product_model.getValue(this_record, "INITIAL_BRAND"); //ASA-1787 Request #6
        initial_barcode = product_model.getValue(this_record, "INITIAL_BARCODE"); //ASA-1787 Request #6
        //ASA-1640 End

    } else {
        item_description = p_itemdtl.Desc;
        barcode = p_itemdtl.Barcode;
        supplier_name = p_itemdtl.Supplier;
        brand_name = p_itemdtl.Brand;
        group_no = p_itemdtl.Group;
        dept = p_itemdtl.Dept;
        item_class = p_itemdtl.Class;
        subclass = p_itemdtl.SubClass;
        std_uom = p_itemdtl.StdUOM;
        var det_arr = p_itemdtl.SizeDesc.split("*");
        item_size_desc = p_itemdtl.SizeDesc;
        u_width = p_itemdtl.UW;
        u_height = p_itemdtl.UH;
        u_depth = p_itemdtl.UD;
        c_width = p_itemdtl.CW;
        c_height = p_itemdtl.CH;
        c_depth = p_itemdtl.CD;
        t_width = p_itemdtl.TW;
        t_height = p_itemdtl.TH;
        t_depth = p_itemdtl.TD;
        d_width = p_itemdtl.DW;
        d_height = p_itemdtl.DH;
        d_depth = p_itemdtl.DD;
        nesting = p_itemdtl.ItemNesting;
        p_orientation_desc = p_itemdtl.OrientationDesc;
        store_count = p_itemdtl.StoreCnt;
        nesting_val = p_itemdtl.NestingVal;
        contain = p_itemdtl.ItemContain;
        contain_val = p_itemdtl.ContainVal;
        org_n_width = n_width = p_itemdtl.NW;
        org_n_height = n_height = p_itemdtl.NH;
        org_n_depth = n_depth = p_itemdtl.ND;
        org_o_width = o_width = p_itemdtl.CnW;
        org_o_height = o_height = p_itemdtl.CnH;
        org_o_depth = o_depth = p_itemdtl.CnD;

        org_u_width = p_itemdtl.OrgUW;
        org_u_height = p_itemdtl.OrgUH;
        org_u_depth = p_itemdtl.OrgUD;
        org_c_width = p_itemdtl.OrgCW;
        org_c_height = p_itemdtl.OrgCH;
        org_c_depth = p_itemdtl.OrgCD;
        org_t_width = p_itemdtl.OrgTW;
        org_t_height = p_itemdtl.OrgTH;
        org_t_depth = p_itemdtl.OrgTD;
        org_d_width = p_itemdtl.OrgDW;
        org_d_height = p_itemdtl.OrgDH;
        org_d_depth = p_itemdtl.OrgDD;
        org_crush_width_perc = p_itemdtl.OrgCWPerc;
        org_crush_height_perc = p_itemdtl.OrgCHPerc;
        org_crush_depth_perc = p_itemdtl.OrgCDPerc;
        selling_price = p_itemdtl.SellingPrice;
        sales_unit = p_itemdtl.SalesUnit;
        net_sales = p_itemdtl.NetSales;
        CogsAdj = p_itemdtl.CogsAdj;
        GrossProfit = p_itemdtl.GrossProfit;
        WeeksCount = p_itemdtl.WeeksCount;
        MovingItem = p_itemdtl.MovingItem;
        reg_mov = p_itemdtl.RegMovement;
        avg_sales = p_itemdtl.AvgSales;
        item_status_desc = p_itemdtl.ItemStatus;
        cdt_lvl1 = p_itemdtl.CDTLvl1; //ASA-1130
        cdt_lvl2 = p_itemdtl.CDTLvl2; //ASA-1130
        cdt_lvl3 = p_itemdtl.CDTLvl3; //ASA-1130
        profit = p_itemdtl.Profit;
        total_margin = p_itemdtl.TotalMargin;
        newItemYN = p_itemdtl.NewYN;
        item_status = p_itemdtl.Status;
        item_price = p_itemdtl.Price;
        item_cost = p_itemdtl.Cost;
        DaysOfSupply = p_itemdtl.DaysOfSupply;
        delist_ind = p_itemdtl.Delist;
        max_h_facings = p_itemdtl.MHorizFacings;
        max_v_facings = p_itemdtl.MVertFacings;
        max_d_facings = p_itemdtl.MDepthFacings;
        DescSecond = p_itemdtl.DescSecond;
        weeks_of_inventory = p_itemdtl.WeeksOfInventory;
        random_id = "";
        base_horiz = p_itemdtl.BHoriz;
        base_vert = p_itemdtl.BVert;
        if (items.CType == "BASKET") {
            base_depth = p_itemdtl.Quantity;
        } else {
            base_depth = p_itemdtl.BaseD;
        }
        color = p_itemdtl.Color;
        crush_horiz = p_itemdtl.CrushHoriz;
        crush_vert = p_itemdtl.CrushVert;
        crush_depth = p_itemdtl.CrushD;
        crush_height_perc = p_itemdtl.CHPerc;
        crush_width_perc = p_itemdtl.CWPerc;
        crush_depth_perc = p_itemdtl.CDPerc;
        item_fixed = p_itemdtl.Fixed;
        location_id = p_itemdtl.LocID;
        item_orientation = p_itemdtl.Orientation;
        merch_style = p_itemdtl.MerchStyle;
        rotation = p_itemdtl.Rotation;
        cap_style = p_itemdtl.CapStyle;
        cap_merch_style = p_itemdtl.CapMerch;
        cap_orientation = p_itemdtl.CapOrientaion;
        Cap_max_high = p_itemdtl.CapMaxH;
        max_high_cap_style = p_itemdtl.MaxHCapStyle;
        peg_id = p_itemdtl.PegID;
        item_overhang = p_itemdtl.OverHang;
        item_gap = p_itemdtl.HorizGap;
        vert_gap = p_itemdtl.VertGap;
        item_qty = p_itemdtl.Quantity;
        ItemInfo["MHorizCrushed"] = p_itemdtl.MHorizCrushed;
        ItemInfo["MVertCrushed"] = p_itemdtl.MVertCrushed;
        ItemInfo["MDepthCrushed"] = p_itemdtl.MDepthCrushed;
        ItemInfo["MCapTopFacing"] = typeof items.MCapTopFacing !== "undefined" ? items.MCapTopFacing : "N"; //ASA-1170
        img_exists = items.ImgExists;
        itemobjid = p_itemdtl.ObjID;
        cap_count = p_itemdtl.CapCount;
        //ASA-1170, Start
        cap_facing = p_itemdtl.CapFacing;
        // cap_merch = p_itemdtl.CapMerch; //ASA-1410 Issue 2
        // cap_orientation = p_itemdtl.CapOrientaion;//ASA-1410 Issue 2
        cap_height = p_itemdtl.CapHeight;
        //ASA-1170, End
        cap_horz = p_itemdtl.CapHorz; //ASA-1179
        cap_depth = p_itemdtl.CapDepth; //ASA-1179
        cap_total_count = p_itemdtl.CapTotalCount; //ASA-1179
        item_exists = p_itemdtl.Exists;
        item_y = p_itemdtl.Y;
        bottom_id = items.BottomObjID;
        top_id = items.TopObjID;
        second_tier = items.SecondTier;
        pegboard_x = items.PegBoardX;
        pegboard_y = items.PegBoardY;
        daysOfSupplyID = items.daysOfSupplyID;
        brad_category = typeof items.Brand_Category !== "undefined" ? items.Brand_Category : "";
        uda_item_status = typeof items.Uda_item_status !== "undefined" ? items.Uda_item_status : "";
        gobe_co_brand = typeof items.Gobecobrand !== "undefined" ? items.Gobecobrand : "";
        internet = typeof items.Internet !== "undefined" ? items.Internet : "";
        Categ = typeof items.Categ !== "undefined" ? items.Categ : "";
        COO = typeof items.COO !== "undefined" ? items.COO : "";
        ItmeSize = typeof items.ItmeSize !== "undefined" ? items.ItmeSize : "";
        SplrLbl = typeof items.SplrLbl !== "undefined" ? items.SplrLbl : "";
        EDLP = typeof items.EDLP !== "undefined" ? items.EDLP : "";
        LoGrp = typeof items.LoGrp !== "undefined" ? items.LoGrp : "";
        InternationalRng = typeof items.InternationalRng !== "undefined" ? items.InternationalRng : "";
        ActualDPP = typeof items.ActualDPP !== "undefined" ? items.ActualDPP : ""; //ASA-1182 ASA-1277-(3)
        DPPLoc = items.DPPLoc; //ASA-1308 Task-3
        StoreSOH = typeof items.StoreSOH !== "undefined" ? items.StoreSOH : ""; //ASA-1182 ASA-1277-(3)
        StoreNo = typeof items.StoreNo !== "undefined" ? items.StoreNo : ""; //ASA-1277-(3)
        WeeksOfInventory = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : ""; //ASA-1277-(3)
        NewItem = typeof items.NewItem !== "undefined" ? items.NewItem : ""; //ASA-1182
        LiveNewItem = typeof items.LiveNewItem !== "undefined" ? items.LiveNewItem : ""; //ASA-1250
        GoGreen = typeof items.GoGreen !== "undefined" ? items.GoGreen : "";
        unitpercase = typeof items.UnitperCase !== "undefined" ? items.UnitperCase : 1;
        unitpertray = typeof items.UnitperTray !== "undefined" ? items.UnitperTray : 1;
        brandtype = items.BrandType;
        PkSiz = items.PkSiz; //Regression 12 Kush
        ItemSize = items.ItemSize; //ASA-1273 Prasanna
        ItmDescChi = items.ItmDescChi; //ASA-1273 Prasanna
        ItmDescEng = items.ItmDescEng; //ASA-1273 Prasanna
        MPogVertFacings = typeof items.MPogVertFacings !== "undefined" ? items.MPogVertFacings : ""; //ASA-1408
        MPogHorizFacings = typeof items.MPogHorizFacings !== "undefined" ? items.MPogHorizFacings : ""; //ASA-1408
        MPogDepthFacings = typeof items.MPogDepthFacings !== "undefined" ? items.MPogDepthFacings : ""; //ASA-1408
        uda751 = typeof items.UDA751 !== "undefined" ? items.UDA751 : "";
        uda755 = typeof items.UDA755 !== "undefined" ? items.UDA755 : ""; //ASA-1407 Task 1 -E
        //ASA-1640 Start   
        item_condition = p_itemdtl.ItemCondition;
        aur = p_itemdtl.AUR;
        item_ranking = p_itemdtl.ItemRanking;
        weekly_sales = p_itemdtl.WeeklySales;
        weekly_net_margin = p_itemdtl.WeeklyNetMargin;
        weekly_qty = p_itemdtl.WeeklyQty;
        net_margin_percent = p_itemdtl.NetMarginPercent;
        cumulative_nm = p_itemdtl.CumulativeNM;
        top80_b2 = p_itemdtl.TOP80B2;
        item_brand_c = p_itemdtl.ItemBrandC;
        item_pog_dept = p_itemdtl.ItemPOGDept;
        item_remark = p_itemdtl.ItemRemark;
        rtv_status = p_itemdtl.RTVStatus;
        pusher = p_itemdtl.Pusher;
        divider = p_itemdtl.Divider;
        back_support = p_itemdtl.BackSupport;
        oos_perc = p_itemdtl.OOSPerc; //ASA-1688 Added for oos%
        initial_item_desc = p_itemdtl.InitialItemDesc; //ASA-1734 Issue 1
        initial_brand = p_itemdtl.InitialBrand; //ASA-1787 Request #6
        initial_barcode = p_itemdtl.InitialBarcode; //ASA-1787 Request #6
        //ASA-1640 End
        //ASA-2013 Start
        shelf_price = p_itemdtl.ShelfPrice;
        promo_price = p_itemdtl.PromoPrice;
        discount_rate = p_itemdtl.DiscountRate;
        price_change_date = p_itemdtl.PriceChangeDate;
        Weeks_In_Rotation = p_itemdtl.WeeksOfInventory;
        qty = p_itemdtl.Qty;
        wh_stock = p_itemdtl.WhStock;
        store_stock = p_itemdtl.StoreStock;
        stock_intransit = p_itemdtl.StockIntransit;
        //ASA-2013 End


    }
    if (typeof dept !== "undefined" && dept !== "" && dept !== null) { //ASA-1407 issue 8 -S
        var itemdept = dept.split('-');
    } else {
        var itemdept = "";
    }
    if (typeof item_class !== "undefined" && item_class !== "" && item_class !== null) {
        var itemclass = item_class.split('-');
    } else {
        var itemclass = "";
    }
    if (typeof subclass !== "undefined" && subclass !== "" && subclass !== null) {
        var itemsubclass = subclass.split('-');
    } else {
        var itemsubclass = "";
    } //ASA-1171 BS
    ItemInfo["ClassName"] = itemdept[0] + '/' + itemclass[0] + '/' + itemsubclass[0]; //ASA-1407 issue 8 -E
    ItemInfo["Edited"] = p_edited_ind;
    ItemInfo["ItemID"] = p_item_code;
    ItemInfo["Item"] = p_item_code;
    ItemInfo["W"] = p_item_width;
    ItemInfo["H"] = p_item_height;
    ItemInfo["D"] = p_item_depth;
    ItemInfo["Color"] = color;
    ItemInfo["ShowColorBackup"] = color;    //ASA-1481
    ItemInfo["DimT"] = p_item_dim_type;
    ItemInfo["Desc"] = item_description;
    ItemInfo["Barcode"] = barcode;
    ItemInfo["LocID"] = location_id;
    ItemInfo["PegID"] = peg_id;
    ItemInfo["PegSpread"] = p_edited_ind == "Y" ? p_itemdtl.PegSpread : "";
    ItemInfo["PegPerFacing"] = p_edited_ind == "Y" ? p_itemdtl.PegPerFacing : "";
    ItemInfo["BrandType"] = brandtype;
    ItemInfo["Fixed"] = item_fixed;
    ItemInfo["CapStyle"] = cap_style;
    ItemInfo["CapMerch"] = cap_merch_style;
    ItemInfo["CapOrientaion"] = cap_orientation;

    ItemInfo["CapMaxH"] = Cap_max_high;
    ItemInfo["MaxHCapStyle"] = max_high_cap_style;
    ItemInfo["Rotation"] = rotation;
    ItemInfo["BHoriz"] = base_horiz;
    ItemInfo["BVert"] = base_vert;
    ItemInfo["BaseD"] = base_depth;
    ItemInfo["CrushHoriz"] = crush_horiz;
    ItemInfo["CrushVert"] = crush_vert;
    ItemInfo["CrushD"] = crush_depth;
    ItemInfo["Orientation"] = item_orientation;
    ItemInfo["MerchStyle"] = merch_style;
    ItemInfo["Supplier"] = supplier_name;
    if (typeof supplier_name != "undefined" && supplier_name !== "" && supplier_name !== null) { //ASA-1222-S
        var supp = supplier_name.split('-');
        if (typeof supp[1] !== "undefined") {
            ItemInfo["SupplierName"] = supp[1];
        } else {
            ItemInfo["SupplierName"] = supp[0]; //Regression issue-21
        }
    } else {
        ItemInfo["SupplierName"] = "";
    } //ASA-1222-E
    ItemInfo["Brand"] = brand_name;
    ItemInfo["Group"] = group_no;
    ItemInfo["Dept"] = dept;
    ItemInfo["Class"] = item_class;
    ItemInfo["SubClass"] = subclass;
    ItemInfo["StdUOM"] = std_uom;
    ItemInfo["SizeDesc"] = item_size_desc;
    ItemInfo["Price"] = $v("P25_PRICE");
    ItemInfo["Cost"] = $v("P25_COST");
    ItemInfo["DaysOfSupply"] = p_edited_ind == "Y" ? p_itemdtl.DaysOfSupply : DaysOfSupply;
    ItemInfo["RegMovement"] = p_edited_ind == "Y" ? p_itemdtl.RegMovement : "";
    ItemInfo["AvgSales"] = p_edited_ind == "Y" ? p_itemdtl.AvgSales : "";
    ItemInfo["ItemStatus"] = p_edited_ind == "Y" ? p_itemdtl.ItemStatus : "";
    ItemInfo["MoveBasis"] = p_edited_ind == "Y" ? p_itemdtl.MoveBasis : "";
    ItemInfo["PegBoardX"] = pegboard_x;
    ItemInfo["PegBoardY"] = pegboard_y;
    ItemInfo["CHPerc"] = crush_height_perc;
    ItemInfo["CWPerc"] = crush_width_perc;
    ItemInfo["CDPerc"] = crush_depth_perc;
    ItemInfo["CnW"] = o_width;
    ItemInfo["CnH"] = o_height;
    ItemInfo["CnD"] = o_depth;
    ItemInfo["NW"] = n_width;
    ItemInfo["NH"] = n_height;
    ItemInfo["ND"] = n_depth;
    ItemInfo["OldCnW"] = o_width;
    ItemInfo["OldCnH"] = o_height;
    ItemInfo["OldCnD"] = o_depth;
    ItemInfo["OldNW"] = n_width;
    ItemInfo["OldNH"] = n_height;
    ItemInfo["OldND"] = n_depth;

    ItemInfo["OrgUW"] = org_u_width;
    ItemInfo["OrgUH"] = org_u_height;
    ItemInfo["OrgUD"] = org_u_depth;
    ItemInfo["OrgCW"] = org_c_width;
    ItemInfo["OrgCH"] = org_c_height;
    ItemInfo["OrgCD"] = org_c_depth;
    ItemInfo["OrgTW"] = org_t_width;
    ItemInfo["OrgTH"] = org_t_height;
    ItemInfo["OrgTD"] = org_t_depth;
    ItemInfo["OrgDW"] = org_d_width;
    ItemInfo["OrgDH"] = org_d_height;
    ItemInfo["OrgDD"] = org_d_depth;
    ItemInfo["OrgCHPerc"] = org_crush_height_perc;
    ItemInfo["OrgCWPerc"] = org_crush_width_perc;
    ItemInfo["OrgCDPerc"] = crush_depth_perc;
    ItemInfo["OrgCnW"] = org_o_width;
    ItemInfo["OrgCnH"] = org_o_height;
    ItemInfo["OrgCnD"] = org_o_depth;
    ItemInfo["OrgNW"] = org_n_width;
    ItemInfo["OrgNH"] = org_n_height;
    ItemInfo["OrgND"] = org_n_depth;

    ItemInfo["ItemNesting"] = nesting;
    ItemInfo["NVal"] = nesting_val;
    ItemInfo["ItemContain"] = contain;
    ItemInfo["CnVal"] = contain_val;
    ItemInfo["IsContainer"] = p_edited_ind == "Y" ? p_itemdtl.IsContainer : "N";
    ItemInfo["BsktFactor"] = p_edited_ind == "Y" ? p_itemdtl.BsktFactor : 0;
    ItemInfo["OverHang"] = item_overhang;
    ItemInfo["HorizGap"] = item_gap;
    ItemInfo["VertGap"] = vert_gap;
    ItemInfo["UW"] = u_width;
    ItemInfo["UH"] = u_height;
    ItemInfo["UD"] = u_depth;
    ItemInfo["CW"] = c_width;
    ItemInfo["CH"] = c_height;
    ItemInfo["CD"] = c_depth;
    ItemInfo["TW"] = t_width;
    ItemInfo["TH"] = t_height;
    ItemInfo["TD"] = t_depth;
    ItemInfo["DW"] = d_width;
    ItemInfo["DH"] = d_height;
    ItemInfo["DD"] = d_depth;
    ItemInfo["SIndex"] = g_shelf_index;
    ItemInfo["Dragged"] = "N";
    ItemInfo["Quantity"] = item_qty;
    ItemInfo["Y"] = item_y;
    ItemInfo["X"] = p_item_x;
    ItemInfo["SlotDivider"] = "";
    ItemInfo["WChanged"] = "";              //Regression Issue 3, 20241111
    ItemInfo["ObjID"] = itemobjid;
    ItemInfo["ImgExists"] = img_exists;
    ItemInfo["CapCount"] = cap_count;
    //ASA-1170, Start
    ItemInfo["CapFacing"] = cap_facing;
    // ItemInfo["CapMerch"] = cap_merch_style;  ASA-1410 Issue 3
    // ItemInfo["CapOrientaion"] = cap_orientation;
    ItemInfo["CapHeight"] = cap_height;
    //ASA-1170, End
    ItemInfo["CapHorz"] = cap_horz; //ASA-1179
    ItemInfo["CapDepth"] = cap_depth; //ASA-1179
    ItemInfo["CapTotalCount"] = cap_total_count; //ASA-1179
    ItemInfo["TopObjID"] = top_id;
    ItemInfo["BottomObjID"] = bottom_id;
    ItemInfo["SecondTier"] = second_tier;
    ItemInfo["SellingPrice"] = selling_price;
    ItemInfo["SalesUnit"] = sales_unit;
    ItemInfo["NetSales"] = typeof net_sales !== "undefined" ? net_sales : 0; //Regression 1 task_26974
    ItemInfo["CogsAdj"] = CogsAdj;
    ItemInfo["GrossProfit"] = typeof GrossProfit !== "undefined" ? GrossProfit : 0; //Regression 1 task_26974
    ItemInfo["WeeksCount"] = WeeksCount;
    ItemInfo["MovingItem"] = MovingItem;
    ItemInfo["Profit"] = profit;
    ItemInfo["RegMovement"] = isNaN(reg_mov) ? 0 : reg_mov;
    ItemInfo["AvgSales"] = isNaN(avg_sales) ? 0 : avg_sales;
    ItemInfo["ItemStatus"] = item_status_desc; //Task_26627
    ItemInfo["TotalMargin"] = total_margin;
    ItemInfo["Status"] = item_status;
    ItemInfo["CDTLvl1"] = cdt_lvl1; //ASA-1130
    ItemInfo["CDTLvl2"] = cdt_lvl2; //ASA-1130
    ItemInfo["CDTLvl3"] = cdt_lvl3; //ASA-1130
    ItemInfo["Price"] = item_price;
    ItemInfo["Cost"] = item_cost;
    ItemInfo["DaysOfSupply"] = DaysOfSupply;
    ItemInfo["OrientationDesc"] = p_orientation_desc;
    ItemInfo["StoreCnt"] = store_count;
    ItemInfo["NewYN"] = newItemYN;
    ItemInfo["Delist"] = delist_ind;
    ItemInfo["MHorizFacings"] = max_h_facings;
    ItemInfo["MVertFacings"] = max_v_facings;
    ItemInfo["MDepthFacings"] = max_d_facings;
    ItemInfo["daysOfSupplyID"] = daysOfSupplyID;
    ItemInfo["DescSecond"] = DescSecond;
    ItemInfo["UnitperCase"] = unitpercase;
    ItemInfo["UnitperTray"] = unitpertray;
    ItemInfo["Brand_Category"] = typeof brad_category !== "undefined" ? brad_category : "";
    ItemInfo["Uda_item_status"] = typeof uda_item_status !== "undefined" ? uda_item_status : ""; //ASA-1407 issue 6
    ItemInfo["Gobecobrand"] = typeof gobe_co_brand !== "undefined" ? gobe_co_brand : "";
    ItemInfo["Internet"] = typeof internet !== "undefined" ? internet : "";
    ItemInfo["Categ"] = typeof Categ !== "undefined" ? Categ : "";
    ItemInfo["COO"] = typeof COO !== "undefined" ? COO : "";
    ItemInfo["ItemSize"] = typeof ItemSize !== "undefined" ? ItemSize : "";
    // ItemInfo["ItmeSize"] = typeof ItmeSize !== "undefined" ? ItmeSize : ""; //Regression issue-21
    ItemInfo["SplrLbl"] = typeof SplrLbl !== "undefined" ? SplrLbl : "";
    ItemInfo["EDLP"] = typeof EDLP !== "undefined" ? EDLP : "";
    ItemInfo["GoGreen"] = typeof GoGreen !== "undefined" ? GoGreen : "";
    ItemInfo["LoGrp"] = typeof LoGrp !== "undefined" ? LoGrp : "";
    ItemInfo["InternationalRng"] = typeof InternationalRng !== "undefined" ? InternationalRng : "";
    ItemInfo["ActualDPP"] = typeof ActualDPP !== "undefined" ? ActualDPP : ""; //ASA-1182 ASA-1277-(3)
    ItemInfo["DPPLoc"] = DPPLoc; //ASA-1308 Task-3
    ItemInfo["StoreCnt"] = typeof StoreCnt !== "undefined" ? StoreCnt : ""; //ASA-1182
    ItemInfo["StoreNo"] = typeof StoreNo !== "undefined" ? StoreNo : ""; //ASA-1277-(3)
    ItemInfo["WeeksOfInventory"] = typeof WeeksOfInventory !== "undefined" ? WeeksOfInventory : ""; //ASA-1182 ASA-1277-(3)
    ItemInfo["StoreSOH"] = typeof StoreSOH !== "undefined" ? StoreSOH : ""; //ASA-1182 ASA-1277-(3)
    ItemInfo["NewItem"] = typeof NewItem !== "undefined" ? NewItem : ""; //ASA-1182
    ItemInfo["LiveNewItem"] = LiveNewItem; //ASA-1250
    ItemInfo["ItemSize"] = ItemSize; //ASA-1273 Prasanna
    ItemInfo["ItmDescChi"] = ItmDescChi; //ASA-1273 Prasanna
    ItemInfo["ItmDescEng"] = ItmDescEng; //ASA-1273 Prasanna
    ItemInfo["PkSiz"] = PkSiz; //Regression 12 Kush
    ItemInfo["SIndex"] = g_shelf_index;
    ItemInfo["MIndex"] = g_module_index;
    ItemInfo["MPogVertFacings"] = typeof MPogVertFacings !== "undefined" ? MPogVertFacings : ""; //ASA-1408
    ItemInfo["MPogHorizFacings"] = typeof MPogHorizFacings !== "undefined" ? MPogHorizFacings : ""; //ASA-1408
    ItemInfo["MPogDepthFacings"] = typeof MPogDepthFacings !== "undefined" ? MPogDepthFacings : ""; //ASA-1408
    ItemInfo["UDA751"] = uda751;
    ItemInfo["UDA755"] = uda755; //ASA-1407 Task 1 -E
    //ASA-1640 Start  
    ItemInfo["ItemCondition"] = item_condition;
    ItemInfo["AUR"] = aur;
    ItemInfo["ItemRanking"] = item_ranking;
    ItemInfo["WeeklySales"] = weekly_sales;
    ItemInfo["WeeklyNetMargin"] = weekly_net_margin;
    ItemInfo["WeeklyQty"] = weekly_qty;
    ItemInfo["NetMarginPercent"] = net_margin_percent;
    ItemInfo["CumulativeNM"] = cumulative_nm;
    ItemInfo["TOP80B2"] = top80_b2;
    ItemInfo["ItemBrandC"] = item_brand_c;
    ItemInfo["ItemPOGDept"] = item_pog_dept;
    ItemInfo["ItemRemark"] = item_remark;
    ItemInfo["RTVStatus"] = rtv_status;
    ItemInfo["Pusher"] = pusher;
    ItemInfo["Divider"] = divider;
    ItemInfo["BackSupport"] = back_support;
    ItemInfo["OOSPerc"] = oos_perc; //ASA-1688 Added for oos%
    ItemInfo["InitialItemDesc"] = initial_item_desc; //ASA-1734 Issue 1
    ItemInfo["InitialBrand"] = initial_brand; //ASA-1734 Issue 1
    ItemInfo["InitialBarcode"] = initial_barcode; //ASA-1734 Issue 1
    //ASA-1640 End
    //ASA-2013 Start
    ItemInfo["ShelfPrice"] = shelf_price;
    ItemInfo["PromoPrice"] = promo_price;
    ItemInfo["DiscountRate"] = discount_rate;
    ItemInfo["PriceChangeDate"] = price_change_date;
    ItemInfo["WeeksOfInventory"] = Weeks_In_Rotation;
    ItemInfo["Qty"] = qty;
    ItemInfo["WhStock"] = wh_stock;
    ItemInfo["StoreStock"] = store_stock;
    ItemInfo["StockIntransit"] = stock_intransit;
    //ASA-2013 End

    if (p_edited_ind == "N") {
        ItemInfo["OW"] = p_item_width;
        ItemInfo["OH"] = p_item_height;
        ItemInfo["OD"] = p_item_depth;
        ItemInfo["SpreadItem"] = 0;
        ItemInfo["MHorizCrushed"] = "N";
        ItemInfo["MVertCrushed"] = "N";
        ItemInfo["MDepthCrushed"] = "N";
        ItemInfo["MCapTopFacing"] = "N"; //ASA-1170
        ItemInfo["RW"] = p_item_width;
        ItemInfo["RH"] = p_item_height;
        ItemInfo["RD"] = p_item_depth;
        ItemInfo["LObjID"] = -1;
        ItemInfo["SubLblObjID"] = -1; //ASA-1182
        ItemInfo["DimUpdate"] = "N";
        ItemInfo["RandomID"] = random_id;

        if (shelfdtl.ObjType == "PEGBOARD" || (shelfdtl.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
            shelfdtl.ItemInfo.push(ItemInfo);
            item_return_index = shelfdtl.ItemInfo.length - 1;
        } else {
            if (p_min_index > -1) {
                if (shelfdtl.SpreadItem == "R") {
                    shelfdtl.ItemInfo.splice(p_min_index, 0, ItemInfo);
                    item_return_index = p_min_index;
                } else {
                    shelfdtl.ItemInfo.splice(p_min_index + 1, 0, ItemInfo);
                    if (shelfdtl.ItemInfo.length - 1 == p_min_index) {
                        item_return_index = p_min_index;
                    } else {
                        item_return_index = p_min_index + 1;
                    }
                }
            } else if (p_item_index > -1) {
                shelfdtl.ItemInfo.splice(p_item_index, 0, ItemInfo);
                item_return_index = p_item_index;
            } else {
                shelfdtl.ItemInfo.push(ItemInfo);
                item_return_index = shelfdtl.ItemInfo.length - 1;
            }

        }
    } else {
        ItemInfo["OW"] = items.OW;
        ItemInfo["OH"] = items.OH;
        ItemInfo["OD"] = items.OD;
        ItemInfo["Exists"] = item_exists;
        ItemInfo["DimUpdate"] = items.DimUpdate;
        shelfdtl.ItemInfo[p_item_index] = ItemInfo;
        item_return_index = p_item_index;
    }
    if (typeof g_pog_json[g_pog_index].DeleteItems !== "undefined") {
        //ASA- S-1108
        if (g_pog_json[g_pog_index].DeleteItems.length > 0) {
            var i = 0;
            for (var items of g_pog_json[g_pog_index].DeleteItems) {
                if (items.Item == p_item_code) {
                    g_pog_json[g_pog_index].DeleteItems.splice(i, 1);
                }
                i++;
            }
        } else {
            g_pog_json[g_pog_index].DeleteItems.splice(g_pog_json[g_pog_index].DeleteItems.length - 1, 1);
        }
    }
    logDebug("function : set_item_values", "S");
    return item_return_index;
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
                    var objID = await add_items_with_image(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, items_arr[i].BHoriz, items_arr[i].BVert, items_arr[i].Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", p_fresh_item, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
                } else {
                    if (items_arr[i].Item == "DIVIDER") {
                        var objID = add_items(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, items_arr[i].Rotation, p_pog_index);
                    } else {
                        var objID = await add_items_prom(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, "N", p_fresh_item, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
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
                    var objID = await add_items_with_image(items.ItemID, items.W, items.H, items.D, items.Color, finalX, shelfdtl.ItemInfo[i].Y, "", p_module_index, p_shelf_index, i, items.BHoriz, items.BVert, items.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", p_fresh_item, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index);
                } else {
                    if (items.Item == "DIVIDER") {
                        var objID = add_items(items.ItemID, items.W, items.H, items.D, items.Color, finalX, items.Y, "", p_module_index, p_shelf_index, i, items.Rotation, p_pog_index);
                    } else {
                        var objID = await add_items_prom(items.ItemID, items.W, items.H, items.D, items.Color, finalX, shelfdtl.ItemInfo[i].Y, "", p_module_index, p_shelf_index, i, "N", p_fresh_item, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
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
        if ($v("P25_POGCR_DRAG_SHELF_IN_PEGBOARD") == "Y" && p_shelfs.ObjType == "SHELF") {
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
        } else if ($v("P25_POGCR_DRAG_SHELF_IN_PEGBOARD") == "Y" && p_shelfs.ObjType == 'PEGBOARD') { //ASA-1262 Prasanna
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
                //ASA- 2023 issue 5 start
               
                 //ASA- 2023 Regression Issue 3 start

                if (shelfs.ObjType == 'TEXTBOX') {
                    var baseX = g_cut_copy_arr[0].X;
                    var baseY = g_cut_copy_arr[0].Y;
                    for (let i = 0; i < g_cut_copy_arr.length; i++) {

                        var dx = g_cut_copy_arr[i].X - baseX;
                        var dy = g_cut_copy_arr[i].Y - baseY;

                        g_cut_copy_arr[i].X = p_final_x + dx;
                        g_cut_copy_arr[i].Y = p_final_y + dy;

                    }
                } else {
                    g_cut_copy_arr[0].X = p_final_x;
                    g_cut_copy_arr[0].Y = p_final_y;
                }
                //ASA- 2023 issue 5 end
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
                    // g_cut_copy_arr[0].Shelf = g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].Module + (g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.length + 1);
                    // g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.push(g_cut_copy_arr[0]);
                    // p_ShelfIndex = g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.length - 1;

                    // g_cut_copy_arr[0].ItemInfo = [];
                    for (let i = 0; i < g_cut_copy_arr.length; i++) {

                        let obj = g_cut_copy_arr[i];

                        obj.Shelf =
                            g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].Module +
                            (g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.length + 1);

                        g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.push(obj);

                        p_ShelfIndex =
                            g_pog_json[p_pog_index].ModuleInfo[p_ModIndex].ShelfInfo.length - 1;

                        obj.ItemInfo = [];
                        var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(obj, -1, -1, p_ModIndex, p_ShelfIndex, "N", "Y", p_camera, "Y", "", "Y", p_pog_index);
                    }
                    async function doSomething() {
                        // var [return_val, shelfID, nShelfIndex] = await context_create_shelfs(g_cut_copy_arr[0], -1, -1, p_ModIndex, p_ShelfIndex, "N", "Y", p_camera, "Y", "", "Y", p_pog_index);
                         //ASA- 2023 Regression Issue 3 end
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

class DisclosureNav {
    constructor(domNode) {
        this.rootNode = domNode;
        this.controlledNodes = [];
        this.openIndex = null;
        this.useArrowKeys = true;
        this.topLevelNodes = [...this.rootNode.querySelectorAll(".main-link, button[aria-expanded][aria-controls]")];

        this.topLevelNodes.forEach((node) => {
            // handle button + menu
            if (node.tagName.toLowerCase() === "button" && node.hasAttribute("aria-controls")) {
                const menu = node.parentNode.querySelector("ul");
                if (menu) {
                    // save ref controlled menu
                    this.controlledNodes.push(menu);

                    // collapse menus
                    node.setAttribute("aria-expanded", "false");
                    this.toggleMenu(menu, false);

                    // attach event listeners
                    menu.addEventListener("keydown", this.onMenuKeyDown.bind(this));
                    node.addEventListener("click", this.onButtonClick.bind(this));
                    node.addEventListener("keydown", this.onButtonKeyDown.bind(this));
                }
            }
            // handle links
            else {
                this.controlledNodes.push(null);
                node.addEventListener("keydown", this.onLinkKeyDown.bind(this));
            }
        });

        this.rootNode.addEventListener("focusout", this.onBlur.bind(this));
    }

    controlFocusByKey(keyboardEvent, nodeList, currentIndex) {
        switch (keyboardEvent.key) {
            case "ArrowUp":
            case "ArrowLeft":
                keyboardEvent.preventDefault();
                if (currentIndex > -1) {
                    var prevIndex = Math.max(0, currentIndex - 1);
                    nodeList[prevIndex].focus();
                }
                break;
            case "ArrowDown":
            case "ArrowRight":
                keyboardEvent.preventDefault();
                if (currentIndex > -1) {
                    var nextIndex = Math.min(nodeList.length - 1, currentIndex + 1);
                    nodeList[nextIndex].focus();
                }
                break;
            case "Home":
                keyboardEvent.preventDefault();
                nodeList[0].focus();
                break;
            case "End":
                keyboardEvent.preventDefault();
                nodeList[nodeList.length - 1].focus();
                break;
        }
    }

    // public function to close open menu
    close() {
        this.toggleExpand(this.openIndex, false);
    }

    onBlur(event) {
        var menuContainsFocus = this.rootNode.contains(event.relatedTarget);
        if (!menuContainsFocus && this.openIndex !== null) {
            this.toggleExpand(this.openIndex, false);
        }
    }

    onButtonClick(event) {
        var button = event.target;
        var buttonIndex = this.topLevelNodes.indexOf(button);
        var buttonExpanded = button.getAttribute("aria-expanded") === "true";
        this.toggleExpand(buttonIndex, !buttonExpanded);
    }

    onButtonKeyDown(event) {
        var targetButtonIndex = this.topLevelNodes.indexOf(document.activeElement);

        // close on escape
        if (event.key === "Escape") {
            this.toggleExpand(this.openIndex, false);
        }

        // move focus into the open menu if the current menu is open
        else if (this.useArrowKeys && this.openIndex === targetButtonIndex && event.key === "ArrowDown") {
            event.preventDefault();
            this.controlledNodes[this.openIndex].querySelector("a").focus();
        }

        // handle arrow key navigation between top-level buttons, if set
        else if (this.useArrowKeys) {
            this.controlFocusByKey(event, this.topLevelNodes, targetButtonIndex);
        }
    }

    onLinkKeyDown(event) {
        var targetLinkIndex = this.topLevelNodes.indexOf(document.activeElement);

        // handle arrow key navigation between top-level buttons, if set
        if (this.useArrowKeys) {
            this.controlFocusByKey(event, this.topLevelNodes, targetLinkIndex);
        }
    }

    onMenuKeyDown(event) {
        if (this.openIndex === null) {
            return;
        }

        var menuLinks = Array.prototype.slice.call(this.controlledNodes[this.openIndex].querySelectorAll("a"));
        var currentIndex = menuLinks.indexOf(document.activeElement);

        // close on escape
        if (event.key === "Escape") {
            this.topLevelNodes[this.openIndex].focus();
            this.toggleExpand(this.openIndex, false);
        }

        // handle arrow key navigation within menu links, if set
        else if (this.useArrowKeys) {
            this.controlFocusByKey(event, menuLinks, currentIndex);
        }
    }

    toggleExpand(index, expanded) {
        // close open menu, if applicable
        if (this.openIndex !== index) {
            this.toggleExpand(this.openIndex, false);
        }

        // handle menu at called index
        if (this.topLevelNodes[index]) {
            this.openIndex = expanded ? index : null;
            this.topLevelNodes[index].setAttribute("aria-expanded", expanded);
            this.toggleMenu(this.controlledNodes[index], expanded);
        }
    }

    toggleMenu(domNode, show) {
        if (domNode) {
            domNode.style.display = show ? "block" : "none";
        }
    }

    updateKeyControls(useArrowKeys) {
        this.useArrowKeys = useArrowKeys;
    }
}

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

function underlineMenuKey() {
    var accessKeyList = $('[accesskey][accesskey!=""]');
    var i = 0;

    for (const accessKey of accessKeyList) {
        var $parentElm = $("[accesskey=" + accessKeyList[i].accessKey + "]").parent();
        if ($parentElm.length > 0) {
            $parentElm[0].innerHTML = replaceMenuKey($parentElm[0].innerText, $parentElm[0].innerHTML, accessKeyList[i].accessKey);
        }
        i++;
    }

    var shortcuts = apex.actions.listShortcuts();
    var shortcut_key;
    for (i = 0; i < shortcuts.length; i++) {
        // for each shortcut
        shortcut_key = shortcuts[i].shortcut;
        if (shortcut_key.substr(0, 3) == "Alt") {
            if ($('a[href$="#action$' + shortcuts[i].actionName + '"]:first').length > 0) {
                var MenuText = $('a[href$="#action$' + shortcuts[i].actionName + '"]:first')[0].innerText.trim();
                var accKey = MenuText;
                var letterInd = accKey.toUpperCase().indexOf(shortcut_key.substr(-1).toUpperCase());
                if (letterInd != -1) {
                    accKey = accKey.replace(accKey.charAt(letterInd), "<b><u>" + accKey.charAt(letterInd) + "</u></b>");
                } else {
                    accKey = accKey + "(" + "<b><u>" + shortcut_key.substr(-1).toUpperCase() + "</u></b>" + ")";
                }
                var MenuHtml = $('a[href$="#action$' + shortcuts[i].actionName + '"]:first')[0].innerHTML;
                MenuHtml = MenuHtml.replace(MenuText, accKey);
                $('a[href$="#action$' + shortcuts[i].actionName + '"]:first')[0].innerHTML = replaceMenuKey($('a[href$="#action$' + shortcuts[i].actionName + '"]:first')[0].innerText, $('a[href$="#action$' + shortcuts[i].actionName + '"]:first')[0].innerHTML, shortcut_key.substr(-1));
            }
        }
    }
}

//This function is used in swap module. when user select other module name to be swapped. 
//we change all the shelf, textbox names to the new swapping module.
async function Show_swap_module(p_module_name, p_swap_module, p_combine_module, p_specialSwapMod, p_pog_index) {
    //ASA-1085 added p_pog_index
    logDebug("function : Show_swap_module", "S");
    var x = JSON.parse(JSON.stringify(g_pog_json[p_pog_index]));
    var case_sens_combine_module = [],
        pattern;
    if (p_combine_module.length > 0) {
        var m = 0;
        for (var obj of p_combine_module) {
            var i = 0;
            for (var modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (modules.Module == obj.MainMod) {
                    obj.MainIndex = i;
                }
                if (modules.Module == obj.SwapMod) {
                    obj.SwapIndex = i;
                }
                i++;
            }

            if (p_specialSwapMod == "Y") {
                var j = 1;
                for (var modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == "" || modules.ParentModule == null) {
                        if (modules.Module == obj.MainMod) {
                            obj.MainModSeq = j;
                        }
                        if (modules.Module == obj.SwapMod) {
                            obj.SwapModSeq = j;
                        }
                        j++;
                    }
                }
            }
        }

        case_sens_combine_module = JSON.parse(JSON.stringify(p_combine_module));
        var m = 0;
        for (obj of p_combine_module) {
            if (case_sens_combine_module[m].MainMod !== p_combine_module[m].MainMod.toUpperCase()) {
                case_sens_combine_module[m].MainMod = case_sens_combine_module[m].MainMod.toUpperCase();
            } else {
                case_sens_combine_module[m].MainMod = case_sens_combine_module[m].MainMod.toLowerCase();
            }
            if (case_sens_combine_module[m].SwapMod !== p_combine_module[m].SwapMod.toUpperCase()) {
                case_sens_combine_module[m].SwapMod = case_sens_combine_module[m].SwapMod.toUpperCase();
            } else {
                case_sens_combine_module[m].SwapMod = case_sens_combine_module[m].SwapMod.toLowerCase();
            }

            m++;
        }

        // Handle case sensitive data
        var i = 0;
        for (var obj of case_sens_combine_module) {
            for (var shelfs of g_pog_json[p_pog_index].ModuleInfo[obj.MainIndex].ShelfInfo) {
                var pattern = new RegExp("^[" + obj.MainMod + "]");
                var new_shelf = "",
                    new_shelf_id = "";
                if (shelfs.ObjType == "TEXTBOX") {
                    pattern = new RegExp(" [" + obj.MainMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, " " + obj.SwapMod);
                    shelfs.Shelf = new_shelf_id;

                    pattern = new RegExp("_[" + obj.MainMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, "_" + obj.SwapMod);
                    shelfs.Shelf = new_shelf_id;

                    pattern = new RegExp("[" + obj.MainMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, obj.SwapMod);
                    shelfs.Shelf = new_shelf_id;
                } else {
                    var new_shelf = shelfs.Shelf.replace(pattern, obj.SwapMod);
                    shelfs.Shelf = new_shelf;
                    new_shelf = shelfs.Desc.replace(pattern, obj.SwapMod);
                    shelfs.Desc = new_shelf;

                    if (p_specialSwapMod == "Y") {
                        pattern = new RegExp("[" + obj.MainModSeq + "]/");
                        new_shelf = shelfs.Desc.replace(pattern, obj.SwapModSeq + "/");
                        new_shelf_id = shelfs.Shelf.replace(pattern, obj.SwapModSeq + "/");
                        shelfs.Desc = new_shelf;
                        shelfs.Shelf = new_shelf_id;
                    }
                }
            }
            for (var shelfs of g_pog_json[p_pog_index].ModuleInfo[obj.SwapIndex].ShelfInfo) {
                var pattern = new RegExp("^[" + obj.SwapMod + "]");
                var new_shelf = "";

                if (shelfs.ObjType == "TEXTBOX") {
                    pattern = new RegExp(" [" + obj.SwapMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, " " + obj.MainMod);
                    shelfs.Shelf = new_shelf_id;

                    pattern = new RegExp("_[" + obj.SwapMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, "_" + obj.MainMod);
                    shelfs.Shelf = new_shelf_id;

                    pattern = new RegExp("[" + obj.SwapMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, obj.MainMod);
                    shelfs.Shelf = new_shelf_id;
                } else {
                    var new_shelf = shelfs.Shelf.replace(pattern, obj.MainMod);
                    shelfs.Shelf = new_shelf;
                    new_shelf = shelfs.Desc.replace(pattern, obj.MainMod);
                    shelfs.Desc = new_shelf;

                    if (p_specialSwapMod == "Y") {
                        pattern = new RegExp("[" + obj.SwapModSeq + "]/");
                        new_shelf = shelfs.Desc.replace(pattern, obj.MainModSeq + "/");
                        new_shelf_id = shelfs.Shelf.replace(pattern, obj.MainModSeq + "/");
                        shelfs.Desc = new_shelf;
                        shelfs.Shelf = new_shelf_id;
                    }
                }
            }

            var j = 0;
            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (typeof modules.ParentModule !== "undefined" && modules.ParentModule !== "" && modules.ParentModule !== null) {
                    if (j == obj.MainIndex) {
                        modules.SwapToIndex = obj.SwapIndex;
                    }
                    if (j == obj.SwapIndex) {
                        modules.SwapToIndex = obj.MainIndex;
                    }
                    if (j !== obj.MainIndex && j !== obj.SwapIndex) {
                        const currModule = modules.Module;
                        var pattern = new RegExp(" [" + obj.MainMod + "]$");
                        var new_mod = modules.Module.replace(pattern, " " + obj.SwapMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        var pattern = new RegExp("_[" + obj.MainMod + "]$");
                        var new_mod = modules.Module.replace(pattern, "_" + obj.SwapMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        var pattern = new RegExp("[" + obj.MainMod + "]$");
                        var new_mod = modules.Module.replace(pattern, obj.SwapMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;

                        var pattern = new RegExp(" [" + obj.SwapMod + "]$");
                        var new_mod = modules.Module.replace(pattern, " " + obj.MainMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        var pattern = new RegExp("_[" + obj.SwapMod + "]$");
                        var new_mod = modules.Module.replace(pattern, "_" + obj.MainMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        var pattern = new RegExp("[" + obj.SwapMod + "]$");
                        var new_mod = modules.Module.replace(pattern, obj.MainMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        for (var shelfs of modules.ShelfInfo) {
                            if (typeof shelfs.EditInd == "undefined" || shelfs.EditInd !== "Y") {
                                var pattern = new RegExp("^[" + obj.SwapMod + "]");
                                var new_shelf = "";
                                var currShelf = shelfs.Shelf;

                                if (shelfs.ObjType == "TEXTBOX") {
                                    pattern = new RegExp(" [" + obj.SwapMod + "]$");
                                    new_shelf_id = shelfs.Shelf.replace(pattern, " " + obj.MainMod);
                                    shelfs.Shelf = currShelf !== new_shelf_id ? new_shelf_id : shelfs.Shelf;

                                    pattern = new RegExp("_[" + obj.SwapMod + "]$");
                                    new_shelf_id = shelfs.Shelf.replace(pattern, "_" + obj.MainMod);
                                    shelfs.Shelf = currShelf !== new_shelf_id ? new_shelf_id : shelfs.Shelf;

                                    pattern = new RegExp("[" + obj.SwapMod + "]$");
                                    new_shelf_id = shelfs.Shelf.replace(pattern, obj.MainMod);
                                    shelfs.Shelf = currShelf !== new_shelf_id ? new_shelf_id : shelfs.Shelf;
                                } else {
                                    var new_shelf_id = shelfs.Shelf.replace(pattern, obj.MainMod);
                                    shelfs.Shelf = new_shelf_id;
                                }
                                if (shelfs.Shelf == currShelf) {
                                    var pattern = new RegExp("^[" + obj.MainMod + "]");
                                    var new_shelf = "";
                                    if (shelfs.ObjType == "TEXTBOX") {
                                        pattern = new RegExp(" [" + obj.MainMod + "]$");
                                        new_shelf_id = shelfs.Shelf.replace(pattern, " " + obj.SwapMod);
                                        shelfs.Shelf = new_shelf_id;

                                        pattern = new RegExp("_[" + obj.MainMod + "]$");
                                        new_shelf_id = shelfs.Shelf.replace(pattern, "_" + obj.SwapMod);
                                        shelfs.Shelf = new_shelf_id;

                                        pattern = new RegExp("[" + obj.MainMod + "]$");
                                        new_shelf_id = shelfs.Shelf.replace(pattern, obj.SwapMod);
                                        shelfs.Shelf = new_shelf_id;
                                    } else {
                                        var new_shelf_id = shelfs.Shelf.replace(pattern, obj.SwapMod);
                                        shelfs.Shelf = new_shelf_id;
                                    }
                                }
                            }
                        }

                        if (modules.ParentModule == obj.SwapMod) {
                            modules.ParentModule = obj.MainMod;
                        } else if (modules.ParentModule == obj.MainMod) {
                            modules.ParentModule = obj.SwapMod;
                        }
                    }
                }

                j++;
            }
            i++;
        }

        // Original modules
        var i = 0;
        for (var obj of p_combine_module) {
            for (var shelfs of g_pog_json[p_pog_index].ModuleInfo[obj.MainIndex].ShelfInfo) {
                var pattern = new RegExp("^[" + obj.MainMod + "]");
                var new_shelf = "",
                    new_shelf_id = "";
                if (shelfs.ObjType == "TEXTBOX") {
                    pattern = new RegExp(" [" + obj.MainMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, " " + obj.SwapMod);
                    shelfs.Shelf = new_shelf_id;

                    pattern = new RegExp("_[" + obj.MainMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, "_" + obj.SwapMod);
                    shelfs.Shelf = new_shelf_id;

                    pattern = new RegExp("[" + obj.MainMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, obj.SwapMod);
                    shelfs.Shelf = new_shelf_id;
                } else {
                    var new_shelf = shelfs.Shelf.replace(pattern, obj.SwapMod);
                    shelfs.Shelf = new_shelf;
                    new_shelf = shelfs.Desc.replace(pattern, obj.SwapMod);
                    shelfs.Desc = new_shelf;

                    if (p_specialSwapMod == "Y") {
                        pattern = new RegExp("[" + obj.MainModSeq + "]/");
                        new_shelf = shelfs.Desc.replace(pattern, obj.SwapModSeq + "/");
                        new_shelf_id = shelfs.Shelf.replace(pattern, obj.SwapModSeq + "/");
                        shelfs.Desc = new_shelf;
                        shelfs.Shelf = new_shelf_id;
                    }
                }
            }
            for (var shelfs of g_pog_json[p_pog_index].ModuleInfo[obj.SwapIndex].ShelfInfo) {
                var pattern = new RegExp("^[" + obj.SwapMod + "]");
                var new_shelf = "";
                if (shelfs.ObjType == "TEXTBOX") {
                    pattern = new RegExp(" [" + obj.SwapMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, " " + obj.MainMod);
                    shelfs.Shelf = new_shelf_id;

                    pattern = new RegExp("_[" + obj.SwapMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, "_" + obj.MainMod);
                    shelfs.Shelf = new_shelf_id;

                    pattern = new RegExp("[" + obj.SwapMod + "]$");
                    new_shelf_id = shelfs.Shelf.replace(pattern, obj.MainMod);
                    shelfs.Shelf = new_shelf_id;
                } else {
                    var new_shelf = shelfs.Shelf.replace(pattern, obj.MainMod);
                    shelfs.Shelf = new_shelf;
                    new_shelf = shelfs.Desc.replace(pattern, obj.MainMod);
                    shelfs.Desc = new_shelf;

                    if (p_specialSwapMod == "Y") {
                        pattern = new RegExp("[" + obj.SwapModSeq + "]/");
                        new_shelf = shelfs.Desc.replace(pattern, obj.MainModSeq + "/");
                        new_shelf_id = shelfs.Shelf.replace(pattern, obj.MainModSeq + "/");
                        shelfs.Desc = new_shelf;
                        shelfs.Shelf = new_shelf_id;
                    }
                }
            }
            var j = 0;
            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (typeof modules.ParentModule !== "undefined" && modules.ParentModule !== "" && modules.ParentModule !== null) {
                    if (j == obj.MainIndex) {
                        modules.SwapToIndex = obj.SwapIndex;
                    }
                    if (j == obj.SwapIndex) {
                        modules.SwapToIndex = obj.MainIndex;
                    }
                    if (j !== obj.MainIndex && j !== obj.SwapIndex) {
                        const currModule = modules.Module;
                        var pattern = new RegExp(" [" + obj.MainMod + "]$");
                        var new_mod = modules.Module.replace(pattern, " " + obj.SwapMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        var pattern = new RegExp("_[" + obj.MainMod + "]$");
                        var new_mod = modules.Module.replace(pattern, "_" + obj.SwapMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        var pattern = new RegExp("[" + obj.MainMod + "]$");
                        var new_mod = modules.Module.replace(pattern, obj.SwapMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;

                        var pattern = new RegExp(" [" + obj.SwapMod + "]$");
                        var new_mod = modules.Module.replace(pattern, " " + obj.MainMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        var pattern = new RegExp("_[" + obj.SwapMod + "]$");
                        var new_mod = modules.Module.replace(pattern, "_" + obj.MainMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;
                        var pattern = new RegExp("[" + obj.SwapMod + "]$");
                        var new_mod = modules.Module.replace(pattern, obj.MainMod);
                        modules.Module = new_mod !== currModule ? new_mod : modules.Module;

                        var s = 0;
                        for (var shelfs of modules.ShelfInfo) {
                            var pattern = new RegExp("^[" + obj.SwapMod + "]");
                            var new_shelf = "";
                            var currShelf = shelfs.Shelf;
                            if (typeof shelfs.EditInd == "undefined" || shelfs.EditInd !== "Y") {
                                if (shelfs.ObjType == "TEXTBOX") {
                                    pattern = new RegExp(" [" + obj.SwapMod + "]$");
                                    new_shelf_id = shelfs.Shelf.replace(pattern, " " + obj.MainMod);
                                    shelfs.Shelf = currShelf !== new_shelf_id ? new_shelf_id : shelfs.Shelf;

                                    pattern = new RegExp("_[" + obj.SwapMod + "]$");
                                    new_shelf_id = shelfs.Shelf.replace(pattern, "_" + obj.MainMod);
                                    shelfs.Shelf = currShelf !== new_shelf_id ? new_shelf_id : shelfs.Shelf;

                                    pattern = new RegExp("[" + obj.SwapMod + "]$");
                                    new_shelf_id = shelfs.Shelf.replace(pattern, obj.MainMod);
                                    shelfs.Shelf = currShelf !== new_shelf_id ? new_shelf_id : shelfs.Shelf;
                                } else {
                                    var new_shelf_id = shelfs.Shelf.replace(pattern, obj.MainMod);
                                    shelfs.Shelf = new_shelf_id;
                                }
                                if (shelfs.Shelf == currShelf) {
                                    var pattern = new RegExp("^[" + obj.MainMod + "]");
                                    var new_shelf = "";
                                    if (shelfs.ObjType == "TEXTBOX") {
                                        pattern = new RegExp(" [" + obj.MainMod + "]$");
                                        new_shelf_id = shelfs.Shelf.replace(pattern, " " + obj.SwapMod);
                                        shelfs.Shelf = new_shelf_id;

                                        pattern = new RegExp("_[" + obj.MainMod + "]$");
                                        new_shelf_id = shelfs.Shelf.replace(pattern, "_" + obj.SwapMod);
                                        shelfs.Shelf = new_shelf_id;

                                        pattern = new RegExp("[" + obj.MainMod + "]$");
                                        new_shelf_id = shelfs.Shelf.replace(pattern, obj.SwapMod);
                                        shelfs.Shelf = new_shelf_id;
                                    } else {
                                        var new_shelf_id = shelfs.Shelf.replace(pattern, obj.SwapMod);
                                        shelfs.Shelf = new_shelf_id;
                                    }
                                }
                            }
                        }
                        if (modules.ParentModule == obj.SwapMod) {
                            modules.ParentModule = obj.MainMod;
                        } else if (modules.ParentModule == obj.MainMod) {
                            modules.ParentModule = obj.SwapMod;
                        }
                    }
                }

                j++;
            }
            i++;

            var mainModule = g_pog_json[p_pog_index].ModuleInfo[obj.MainIndex];
            var swapModule = g_pog_json[p_pog_index].ModuleInfo[obj.SwapIndex];

            //ASA-1668
            const mainSeq = mainModule.SeqNo;
            const swapSeq = swapModule.SeqNo;
            mainModule.SeqNo = swapSeq;
            swapModule.SeqNo = mainSeq;

            g_pog_json[p_pog_index].ModuleInfo[obj.SwapIndex] = mainModule;
            g_pog_json[p_pog_index].ModuleInfo[obj.MainIndex] = swapModule;

            g_pog_json[p_pog_index].ModuleInfo[obj.SwapIndex].Module = obj.SwapMod;
            g_pog_json[p_pog_index].ModuleInfo[obj.MainIndex].Module = obj.MainMod;
        }
        var res = await context_create_module("", g_camera, "Y", p_pog_index, "Y");
        var res = await enableDisableFlags(p_pog_index);
        apex.message.showPageSuccess(g_pog_refresh_msg);
    }

    logDebug("function : Show_swap_module", "E");
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
                    showItemSubLabel(p_subLabelType, subLabelInd, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p);
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

//ASA-1538 - Start
function downloadImage(base64Data, fileName) {
    logDebug("function : downloadImage; Start");
    try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);
        logDebug("function : downloadImage; End");
    } catch (err) {
        console.log('error', err);
        error_handling(err);
        throw err;
    }
}


async function downloadPOGCombineImage(p_selectedModArr, p_pog_index, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_enhance) {
    try {
        logDebug("function : downloadPOGCombineImage; Start");
        var mod_array = [];
        var base_width = 0;
        var img_arr = [];
        var total_width = 0;
        var total_height = 0;
        var total_depth = 0;

        g_world = g_scene_objects[p_pog_index].scene.children[2];
        animate_pog(p_pog_index);
        var updatePogjson = JSON.parse(JSON.stringify(g_pog_json));
        var old_pogjson = JSON.parse(JSON.stringify(g_pog_json));
        var new_pogjson = JSON.parse(JSON.stringify([g_pog_json[p_pog_index]]));

        var pogChests = [];
        var mIndex = 0;

        for (const modules of old_pogjson[p_pog_index].ModuleInfo) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                total_height = Math.max(total_height, modules.H);
                total_depth = Math.max(total_depth, modules.D);

                if (g_pogcr_pdf_chest_split == "Y") {
                    var sIndex = 0;
                    var moduleStart = wpdSetFixed(modules.X - modules.W / 2);
                    var moduleEnd = wpdSetFixed(modules.X + modules.W / 2);
                    for (const shelf of modules.ShelfInfo) {
                        if (shelf.ObjType == "CHEST") {
                            var shelfStart = wpdSetFixed(shelf.X - shelf.W / 2);
                            var shelfEnd = wpdSetFixed(shelf.X + shelf.W / 2);
                            if ((moduleStart > shelfStart && moduleEnd < shelfEnd) || (moduleStart >= shelfStart && moduleEnd < shelfEnd) || (moduleStart < shelfStart && moduleEnd < shelfEnd && moduleEnd > shelfStart) || (moduleStart > shelfStart && moduleEnd > shelfEnd && moduleStart < shelfEnd)) { //Regression-10 issue for chest pdf, added =
                                shelf.MIndex = mIndex;
                                shelf.SIndex = sIndex;
                                pogChests.push(shelf);
                                new_pogjson[0].ModuleInfo[mIndex].ShelfInfo.splice(sIndex, 1);
                                g_pog_json[p_pog_index].ModuleInfo[mIndex].ShelfInfo.splice(sIndex, 1);
                            }
                        }
                        sIndex++;
                    }
                }
            }
            mIndex++;
        }

        if (g_pogcr_pdf_chest_split == "Y") {
            var ci = 0;
            for (chest of pogChests) {
                var chest_insert = "N";
                // update old_pogjson modules with individual chest and updated item info
                var chestStart = wpdSetFixed(chest.X - chest.W / 2);
                var chestEnd = wpdSetFixed(chest.X + chest.W / 2);
                var chestItems = chest.ItemInfo;
                var mi = 0;
                for (const modules of new_pogjson[0].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var mStart = wpdSetFixed(modules.X - modules.W / 2);
                        var mEnd = wpdSetFixed(modules.X + modules.W / 2);
                        var newChest = JSON.parse(JSON.stringify(chest));

                        if (mStart >= chestStart && mEnd <= chestEnd) {
                            chest_insert = "Y";
                            newChest.W = modules.W;
                            newChest.X = modules.X;
                        } else if (mStart <= chestStart && mEnd <= chestEnd && mEnd > chestStart) {
                            chest_insert = "Y";
                            newChest.W = wpdSetFixed(mEnd - chestStart);
                            newChest.X = wpdSetFixed(chestStart + newChest.W / 2);
                        } else if (mStart >= chestStart && mEnd >= chestEnd && mStart < chestEnd) {
                            chest_insert = "Y";
                            newChest.W = wpdSetFixed(chestEnd - mStart);
                            newChest.X = wpdSetFixed(mStart + newChest.W / 2);
                        }
                        var newChestItems = [];
                        var newChestStart = wpdSetFixed(newChest.X - newChest.W / 2);
                        var newChestEnd = wpdSetFixed(newChest.X + newChest.W / 2);
                        module_no = chest.MIndex + 1;
                        for (items of chestItems) {
                            if (items.X >= newChestStart && items.X <= newChestEnd) {
                                items.ModuleNo = module_no;
                                newChestItems.push(items);
                            }
                        }
                        if (chest_insert == "Y") {
                            newChest.ItemInfo = newChestItems;
                            new_pogjson[0].ModuleInfo[mi].ShelfInfo.push(newChest);
                            g_pog_json[p_pog_index].ModuleInfo[mi].ShelfInfo.push(newChest);
                            chest_insert = "N";
                        }
                    }
                    mi++;
                }
                ci++;
            }
        }
        for (const modIdx of p_selectedModArr) {
            var module = new_pogjson[0].ModuleInfo[modIdx];
            module.MIndex = modIdx;
            mod_array.push(JSON.parse(JSON.stringify(module)));
            base_width = base_width + module.W;
        }

        var mod_ind = 0
        var mod_end = 0;
        await init_pdf(window.innerWidth, window.innerHeight, 2, "Y", "N");
        for (obj_mod of mod_array) {
            try {
                console.log('combine loop', g_world);
                var returnval = await clone_combine_pog(obj_mod.MIndex, mod_ind, g_show_item_label, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, mod_end, base_width);
                console.log('returnval', returnval, g_renderer_pdf);
            } catch (err) {
                console.log('error', err);
                throw err;
            }
            mod_end = mod_end + obj_mod.W;
            mod_ind++;
        }

        await timeout(200);

        var temp_json = [];
        var details = {};
        details.W = base_width;
        details.H = g_pog_json[p_pog_index].H;
        temp_json.push(details);
        temp_json[0].ModuleInfo = mod_array;
        base_width = 0;
        var details = get_min_max_xy_combine(temp_json, total_width);
        var details_arr = details.split("###");
        set_camera_z(g_camera_pdf, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, 0);
        console.log('combine g_renderer_pdf', g_renderer_pdf, g_scene_pdf, g_camera_pdf);
        if (g_renderer_pdf !== null) {
            g_renderer_pdf.render(g_scene_pdf, g_camera_pdf);
        }
        animate_pog_pdf();
        console.log("inside", new_pogjson, mod_array, g_camera_pdf, g_scene_pdf.children.length, g_scene_pdf);

        var dataURL = g_new_canvas.toDataURL("image/jpeg", p_enhance);
        console.log(" after  base64 ", getDateTime());
        var img_details = {};
        img_details["Module"] = "COMBINE";
        img_details["ImgData"] = dataURL;       //ASA-1538 #2
        img_arr.push(img_details);
        g_temp_desc = "N";
        g_pog_json = updatePogjson;
        render(p_pog_index);

        return img_arr;     //ASA-1538 #2

    }
    catch (err) {
        console.log('error', err);
        error_handling(err);
        throw err;
    }
}

async function downloadPOGImage() {
    try {
        logDebug("function : downloadPOGImage; Start");
        var img_arr = [];
        render(g_pog_index);
        var noDataModuleWIdth = 0;
        var nodataModule = false;
        var enhance = 0.5;
        var moduleName;
        if ($v('P25_POGCR_ENHANCE_PDF_IMG') == 'Y') {
            enhance = parseFloat($v('P25_POGCR_PDF_IMG_ENHANCE_RATIO'));
        }
        reset_zoom();
        var new_pogjson = [];
        set_pegid(g_pog_index);

        var updateOrgPOGJSON = JSON.parse(JSON.stringify(g_pog_json));
        await get_chest_split_details(g_pogcr_pdf_chest_split, g_pog_index);
        new_pogjson = JSON.parse(JSON.stringify(g_pog_json));

        if (g_textbox_merge_pdf == "Y") {
            var new_pogjson = await merge_textboxes_pdf(new_pogjson, g_pog_index); //0
        }
        var i = 0;
        var mod_count = 1;
        var selectedModArr = [...new Set(g_delete_details.map(obj => obj.MIndex))].sort();  //ASA-1538 #4

        if (selectedModArr.length > 1 && g_multiselect == "Y") {
            //ASA-1538 #3 Start
            for (const mod of selectedModArr) {
                if (typeof moduleName == 'undefined') {
                    moduleName = g_pog_json[g_pog_index].ModuleInfo[mod].Module;
                } else {
                    moduleName = moduleName + ',' + g_pog_json[g_pog_index].ModuleInfo[mod].Module;
                }
            }
            //ASA-1538 #3 End
            img_arr = await downloadPOGCombineImage(selectedModArr, g_pog_index, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), enhance);  //ASA-1538 #2
            g_mselect_drag = "N";
            g_multiselect = "N";
            g_delete_details.StartCanvas = g_pog_index;
        } else if (typeof g_module_index != 'undefined' && g_module_index != -1) {
            var modules = new_pogjson[g_pog_index].ModuleInfo[g_module_index];
            moduleName = g_pog_json[g_pog_index].ModuleInfo[g_module_index].Module;         //ASA-1538 #3
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var can_dim_arr = ($v('P25_POGCR_PDF_CANVAS_SIZE')).split(':'); //start ASA-1310 prasanna ASA-1310_25890
                await init_pdf(parseInt(can_dim_arr[0]), parseInt(can_dim_arr[1]), 3 + (enhance == 0.5 ? 0 : 3 * enhance), "N", "Y"); //added clearthree function in init_pdf so aded await
                try {
                    nodataModule = false;
                    var k = 0;
                    noDataModuleWIdth = 0;

                    if (!modules.Module.includes(g_nodataModuleName)) {
                        var return_val = await create_scene(g_module_index, 'Y', 'Y', mod_count, 'Y', $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), noDataModuleWIdth, g_pog_index);
                    }
                }
                catch (err) {
                    error_handling(err);
                }
                var details = get_min_max_xy_module(modules, i, modules.W + noDataModuleWIdth, modules.H, modules.X + noDataModuleWIdth, new_pogjson[g_pog_index].W, mod_count);
                var details_arr = details.split("###");
                var [cameraz, new_y] = set_camera_z_offside(g_camera_pdf, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, 0, parseFloat(details_arr[5]), true, g_pog_index);
                g_camera_pdf.position.x = parseFloat(details_arr[2]);
                g_camera_pdf.position.y = parseFloat(details_arr[3]);
                g_camera_pdf.position.z = cameraz; //ASA-1370  isssue 2 + g_offset_z
                if (g_renderer_pdf !== null) {
                    animate_pog_pdf();
                    g_renderer_pdf.render(g_scene_pdf, g_camera_pdf);
                }

                if (!modules.Module.includes(g_nodataModuleName)) {
                    var dataURL = await g_new_canvas.toDataURL("image/jpeg", enhance);
                    var img_details = {};
                    img_details["Module"] = modules.Module;
                    img_details["ImgData"] = dataURL;       //ASA-1538 #2
                    img_arr.push(img_details);
                }
            }
            g_pog_json = updateOrgPOGJSON;
        } else if (g_module_index == -1) {
            var main_canvas;
            main_canvas = await get_full_canvas(g_pog_index, 3);
            var dataURL = main_canvas.toDataURL("image/jpeg", 0.9);
            var img_details = {};
            img_details["Module"] = "POG";
            img_details["ImgData"] = dataURL;       //ASA-1538 #2
            img_arr.push(img_details);
        }

        //ASA-1538 #2 Start
        const webglImage = img_arr[0].ImgData;
        const img = new Image();
        img.src = webglImage;

        img.onload = function () {
            //ASA-1538 #3 Start
            var pog_name = $v('P25_OPEN_POG_CODE');
            if (typeof moduleName != 'undefined') {
                pog_name = pog_name + '_' + moduleName;
            }
            //ASA-1538 #3 End
            const canvas2D = document.createElement("canvas");


            canvas2D.width = img.width;
            canvas2D.height = img.height;
            const ctx2D = canvas2D.getContext("2d");
            ctx2D.drawImage(img, 0, 0);

            const [croppedCanvas, scaleToFit] = cropCanvasToContent(canvas2D);//ASA-1820
            const croppedDataURL = croppedCanvas.toDataURL("image/jpeg", enhance);
            downloadImage(croppedDataURL.match(/,(.*)$/)[1], pog_name + '.jpeg');     //ASA-1538 #3

            //ASA-1538 #5 Start
            function resizeCanvas(canvas, scaleFactor) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width * scaleFactor;
                tempCanvas.height = canvas.height * scaleFactor;
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
                return tempCanvas;
            }

            async function doSomething() {
                const blob = await new Promise((resolve) => resizeCanvas(croppedCanvas, 0.5).toBlob(resolve));
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
            }
            doSomething();
            //ASA-1538 #5 End
        };

        //ASA-1538 #2 End
        logDebug("function : downloadPOGImage; End");
    } catch (err) {
        error_handling(err);
    }
}
//ASA-1538 - End

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
                const prevBlk = blkInfo.BlkModInfo[0];
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

async function setAutofillBlock(p_action_ind, p_old_blk_name, p_escape_ind = "N") {
    try {
        var block_detail = {};
        var filters_arr = [];
        var attr_arr = [];
        var filter_val = [];
        var blk_name_arr = [];
        var upd_block_dtl = {};
        var blockName = $v("P25_BLK_NAME") + "_AFP";
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
        block_detail["BlkColor"] = $v("P25_BLK_COLOR");
        block_detail["BlkRule"] = $v("P25_BLK_RULE");
        var shelf_arr = [];
        var mod_index = [];
        var final_shelf_arr = [];

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
                    block_detail["BlkModInfo"] = obj.BlkModInfo;
                    block_detail["BlkShelfInfo"] = obj.BlkShelfInfo;
                    break;
                }
            }
            for (const obj of final_shelf_arr) {
                obj.BlkName = block_detail["BlkName"];
            }
            g_DragMouseStart = block_detail["DragMouseStart"];
            g_DragMouseEnd = block_detail["DragMouseEnd"];
            g_autofillModInfo = block_detail["BlkModInfo"];
            g_autofillShelfInfo = block_detail["BlkShelfInfo"]
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
            // if (p_action_ind == "U") {
            //     for (const obj of g_mod_block_list) {
            //         if (obj.BlkName == p_old_blk_name) {
            //             for (const child of obj.BlockDim.ColorObj.children) {
            //                 if (child.uuid == p_old_blk_name) {
            //                     obj.BlockDim.ColorObj.remove(child);
            //                     break;
            //                 }
            //             }

            //         }
            //     }
            //     var i = 0;
            //     for (const obj of g_mod_block_list) {
            //         if (obj.BlkName == p_old_blk_name) {
            //             upd_block_dtl = JSON.parse(JSON.stringify(obj));
            //             g_mod_block_list.splice(i, 1);
            //         }
            //         i++;
            //     }
            // }
            let updIndex = -1;

            if (p_action_ind == "U") {
                var i = 0;
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName == p_old_blk_name) {
                        upd_block_dtl = JSON.parse(JSON.stringify(obj));
                        updIndex = i;              //store index
                        break;
                    }
                    i++;
                }
            }
            apex.region("block_filters").widget().interactiveGrid("getActions").set("edit", false);
            apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model.clearChanges();
            apex.region("block_filters").refresh();
            clear_blinking();
            var ret_dtl = await colorAutofillBlock(g_DragMouseStart, g_DragMouseEnd, mod_index, $v("P25_BLK_COLOR"), blockName, p_action_ind, upd_block_dtl, g_pog_index);
            block_detail["BlockDim"] = ret_dtl;

            if (p_action_ind == "U" && updIndex > -1) {
                g_mod_block_list[updIndex] = block_detail;   // SAME INDEX
            } else {
                g_mod_block_list.push(block_detail);
            }
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
                        details["BlkColor"] = $v("P25_BLK_COLOR");
                        details["BlkName"] = blockName;
                        details["BlkRule"] = $v("P25_BLK_RULE");
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
            } else if (p_action_ind == "A") { //ASA-1965 Issue 4
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
    } catch (err) {
        error_handling(err);
    }
}


async function colorAutofillBlock(p_dragMouseStart, p_dragMouseEnd, p_mod_index, p_color, p_text, p_update_flag, p_block_detail, p_pog_index, p_swapBlock) {
    try {
        var i = 0;
        var font_size = parseInt($v("P25_POGCR_BLK_TXT_SIZE"));
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

            var calc_height = final_top - final_btm;
            var calc_width = g_autofillModInfo[0].dragEnd - g_autofillModInfo[0].dragStart;
            var calc_x = g_autofillModInfo[0].dragStart + ((g_autofillModInfo[0].dragEnd - g_autofillModInfo[0].dragStart) / 2) - g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].X;

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

        var colorValue = parseInt(p_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);

        p_text = p_text.slice(0, -4);
        console.log("val", p_dragMouseStart, p_dragMouseEnd, p_mod_index[0], p_color, p_text);
        console.log("calc_height", calc_width, calc_height, calc_y, final_top, mod_top, final_btm, mod_bottom);

        let mesh = dcText(p_text, font_size, 0x000000, colorValue, calc_width, calc_height, "N", "N", "Arial", "", font_size, 0, -1, 4);
        var mod_object = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].MObjID);
        mod_object.add(mesh);
        mesh.uuid = p_text + "_AFP";
        mesh.material.opacity = 0.5;
        mesh.position.x = calc_x;
        mesh.position.y = calc_y;
        mesh.position.z = 0.009;
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
        error_handling(err);
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
