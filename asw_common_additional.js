var svg,
    g_itemChanged = 'N', //ASA-1515
    g_enableItemLocHighlight = $v('P27_ENBL_ITEM_LOC_HIGH'), //ASA-1515
    g_locHighlightColor = $v('P27_ITEM_LOC_HIGH_COLOR'); //ASA-1515

async function create_module_from_json(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_stop_loading, p_create_pdf_ind, p_recreate, p_create_json, p_showSingleModule, p_org_mod_index, p_load_image = 'Y', p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index) {
    try {
        logDebug("function : create_module_from_json; POG_JSON_arr : " + p_pog_json_arr + 'new_pog_ind : ' + p_new_pog_ind + 'pog_type: ' + p_pog_type, "S");

        await create_module_from_json_lib(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_recreate, p_create_json, p_vdate, p_pogDftColor, p_modDftColor, null, false, p_showSingleModule, p_org_mod_index, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, "Y", null, 1, p_merchStyle, p_loadImgFrom, p_buid, p_delistDftColor, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblColor, p_itemNumLblPos, p_notchHead, "N", p_dftBskFill, p_dftBaskSprd, (typeof g_scene_objects[p_pog_index] !== 'undefined' ? g_scene_objects[p_pog_index].scene.children[0] : g_scene_objects[g_scene_objects.length - 1].scene.children[0]), p_pog_index, p_org_mod_index, $v("P27_POGCR_NOTCH_START_VALUE"), "N", "N");

        if (p_recreate == 'Y' && (p_dftItemDesc == "Y" || (g_ItemImages.length == 0 && p_dftLiveImage == "Y"))) {
            g_show_item_desc = 'Y';
            await showHideItemDescription("Y", p_itemNumLblColor, p_dispItemInfo, p_pog_index);
            p_dftItemDesc == "Y" ? g_show_live_image = "N" : "";

        } else {
            g_show_item_desc = 'N';
        }

        if (p_load_image == 'Y') {
            var retval = await get_all_images(p_pog_index, "N", "N", p_maxWidth, p_maxHeight, p_compRatio);
        }

        if (p_recreate == 'Y' && g_ItemImages.length > 0 && p_create_pdf_ind == "N" && p_dftLiveImage == "Y" && p_dftItemDesc == "N" && p_load_image == 'Y') {
            try {
                await recreate_image_items('Y', p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor, p_notchHead, p_pog_index, 'N', "N,0.018", []);
                animate_pog(p_pog_index);
            } catch (err) {
                //console.log("load images problem", err);
            }
        }
        if (p_recreate == 'Y') {
            if (p_dftNotchLbl == "Y") {
                g_show_notch_label = 'Y';
                show_notch_labels("Y", p_notchHead, "Y", p_pog_index);
            }
            if (p_dftFixelLbl == "Y") {
                g_show_fixel_label = 'Y';
                show_fixel_labels("Y", p_pog_index);
            }
            if (p_dftItemLbl == "Y") {
                g_show_item_label = 'Y';
                show_item_labels("Y", p_itemNumLblColor, p_itemNumLblPos, p_pog_index);
            }

            var details = get_min_max_xy(p_pog_index);
            var details_arr = details.split("###");
            set_camera_z(g_scene_objects[p_pog_index].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
            render();
        }

        if (typeof regionloadWait !== "undefined" && regionloadWait !== null) {
            if (p_stop_loading == "Y") {
                removeLoadingIndicator(regionloadWait);
            }
        }
        logDebug("function : create_module_from_json; ", "E");
    } catch (err) {
        error_handling(err);
    }
    return "SUCCESS";
}

async function add_status_bar(p_statusLblList, p_objInfoRegionID, p_hightlightProduct, p_showSOH, p_pog_index, p_CusPogCode, p_statusbarFontSize) {
    try {
        debugger;
        logDebug("function : add_status_bar; ", "S");
        var desc_list_arr = p_statusLblList.split(",");
        var append_detail = '';
        if (g_pog_json.length > 0) {

            var [item_exists, module, shelf, desc, item_info, horiz_facing, loc_id] = get_pog_info(p_pog_index, p_hightlightProduct); //ASA-1303

            if (p_objInfoRegionID !== '') {
                $(p_objInfoRegionID)
                    .contents()
                    .filter(function () {
                        return this.nodeType == 3;
                    })
                    .remove();
                var $doc = $(document),
                    $win = $(window),
                    $this = $(p_objInfoRegionID);
                var valid_width = 0;
                var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; //ASA-1254
                for (i = 0; i < desc_list_arr.length; i++) {
                    var line_width = 0;
                    var divider = i > 0 ? " | " : "";
                    if (desc_list_arr[i] == "POG_CODE") {
                        if (p_CusPogCode == 'Y') {
                            var cus_loc_id = (loc_id < 10 ? '00' : loc_id < 100 ? '0' : '') + loc_id;
                            var cus_horiz_facing = (horiz_facing < 10 ? '0' : '') + horiz_facing;
                            var cus_shelf = (shelf.length < 2 ? '0' : '') + shelf;
                            append_detail = append_detail + '<span style="color:#001fff">' + get_message('TEMP_HEAD_POG_CODE') + ': </span>' + g_pog_json[p_pog_index].POGCode + module + cus_shelf + cus_loc_id + cus_horiz_facing; //asa-1303
                            line_width = (get_message('TEMP_HEAD_POG_CODE') + ': ' + g_pog_json[p_pog_index].POGCode + module + cus_shelf + cus_loc_id + cus_horiz_facing).visualLength("ruler");

                            append_detail = append_detail + ' | ' + '<span style="color:#001fff">' + get_message('TEMP_HEAD_VERSION') + ': </span>' + g_pog_json[p_pog_index].Version;
                            line_width = (get_message('TEMP_HEAD_VERSION') + ': ' + g_pog_json[p_pog_index].Version).visualLength("ruler");
                        } else {
                            append_detail = append_detail + '<span style="color:#001fff">' + get_message('TEMP_HEAD_POG_CODE') + ': </span>' + g_pog_json[p_pog_index].POGCode + '-' + g_pog_json[p_pog_index].Version;
                            line_width = (get_message('TEMP_HEAD_POG_CODE') + ': ' + g_pog_json[p_pog_index].POGCode + '-' + g_pog_json[p_pog_index].Version).visualLength("ruler");
                        }
                    }
                    if (desc_list_arr[i] == "MODULE") {
                        append_detail = append_detail + '(' + module + ')';
                        line_width = ('(' + module + ')').visualLength("ruler");
                    }
                    if (desc_list_arr[i] == "ITEM") {
                        append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('ITEM') + ': </span>' + p_hightlightProduct;
                        line_width = (" | " + get_message('ITEM') + ': ' + p_hightlightProduct).visualLength("ruler");
                    }
                    if (desc_list_arr[i] == "LOCID") {
                        append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('LOCATION_ID') + ': </span>' + item_info.LocID;
                        line_width = ('-' + loc_id).visualLength("ruler");
                    }
                    if (desc_list_arr[i] == "DESC") {
                        append_detail = append_detail + '-' + item_info.Desc;
                        line_width = ('-' + desc).visualLength("ruler");
                    }
                    if (desc_list_arr[i] == "SHELF") {
                        append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('TEMP_HEAD_ITEM_SHELF') + ': </span>' + shelf;
                        line_width = (" | " + shelf).visualLength("ruler");
                    }
                    if (desc_list_arr[i] == "VERT_FACING") {
                        append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('TEMP_HEAD_VERT_FACING') + ': </span>' + item_info.BVert;
                        line_width = (" | " + shelf).visualLength("ruler");
                    }
                    if (desc_list_arr[i] == "HORIZ_FACING") {
                        append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('TEMP_HEAD_HORIZ_FACING') + ': </span>' + item_info.BHoriz;
                        line_width = (" | " + shelf).visualLength("ruler");
                    }
                    if (desc_list_arr[i] == "DEPTH_FACING") {
                        append_detail = append_detail + divider + '<span style="color:#001fff">' + get_message('TEMP_HEAD_DEPTH_FACING') + ': </span>' + item_info.BaseD;
                        line_width = (" | " + shelf).visualLength("ruler");
                    }
                    // valid_width += line_width;
                    // if (valid_width > browserWidth) {
                    //     append_detail = append_detail + "<br>";
                    //     valid_width = 0;
                    // }
                }
                if (p_showSOH == 'Y') {
                    append_detail = append_detail + ' | ' + '<span style="color:#001fff">' + get_message('POGCR_LS_LBL') + ': </span>' + g_pog_list[p_pog_index].SOH;
                    line_width = ('|' + g_pog_list[p_pog_index].SOH).visualLength("ruler");
                }
                valid_width += line_width;
                if (valid_width > browserWidth) {
                    append_detail = append_detail + "<br>";
                    valid_width = 0;
                }
                var ruler = document.getElementById("ruler");
                ruler.style.fontSize = p_statusbarFontSize + "px";
                ruler.innerHTML = append_detail;
                var height = ruler.offsetHeight + 7;
                var width = append_detail.visualLength("ruler");

                var contextElement = document.getElementById("object_info");
                contextElement.classList.add("active");
                $(p_objInfoRegionID).html(append_detail);
                contextElement.style.top = window.innerHeight - height + "px";
                contextElement.style.width = width + "px";
                contextElement.style.height = height + "px";
                contextElement.style.fontSize = p_statusbarFontSize + "px"; //asa-1303
                contextElement.style.fontFamily = "Tahoma";
                contextElement.style.left = 0 + "px";
            }

        }
        return item_exists;
        logDebug("function : add_status_bar; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function setDefaultState(p_showLiveImag, p_showItemDesc, p_showNotchLbl, p_showFixelLbl, p_showAvailQty, p_dftItemLbl) {
    try {
        logDebug("function : setDefaultState; pShowLiveImag: " + p_showLiveImag, "S");
        g_show_item_label = p_dftItemLbl;
        g_show_item_desc = p_showItemDesc;
        g_show_live_image = p_showItemDesc == 'Y' ? 'N' : p_showLiveImag;
        g_show_notch_label = p_showNotchLbl;
        g_show_fixel_label = p_showFixelLbl;
        g_show_avail_qty = p_showAvailQty;
        logDebug("function : setDefaultState; pShowLiveImag: " + p_showLiveImag, "E");
    } catch (err) {
        error_handling(err);
    }
}

async function remove_text_box(p_pog_index, p_showTextbox, p_pog_json) {
    try {
        logDebug("function : remove_text_box; p_pog_index: " + p_pog_index, "S");
        if (p_showTextbox == 'N') {
            text_list = [];
            if (p_pog_json[p_pog_index].DesignType == 'F') {
                var k = 0;
                for (const modules of p_pog_json[p_pog_index].ModuleInfo) {
                    var i = 0;
                    for (const shelfs of modules.ShelfInfo) {
                        if (shelfs.ObjType == "TEXTBOX") {
                            if (shelfs.Y >= modules.H + p_pog_json[p_pog_index].BaseH || shelfs.Y + shelfs.H <= 0) {
                                var details = {};
                                details['MIndex'] = k;
                                details['SIndex'] = i;
                                details['ObjID'] = shelfs.ObjID;
                                details['Shelf'] = shelfs.Shelf;
                                text_list.push(details);
                            }

                        }
                        i++;
                    }
                    k++;
                }
            } else {
                var k = 0;
                for (const modules of p_pog_json[p_pog_index].ModuleInfo) {
                    var i = 0;
                    for (const shelfs of modules.ShelfInfo) {
                        if (shelfs.ObjType == "TEXTBOX") {
                            if (shelfs.Y - (shelfs.H / 2) > modules.Y + (modules.H / 2) || shelfs.Y + (shelfs.H / 2) < modules.Y - (modules.H / 2)) {
                                var details = {};
                                details['MIndex'] = k;
                                details['SIndex'] = i;
                                details['ObjID'] = shelfs.ObjID;
                                details['Shelf'] = shelfs.Shelf;
                                text_list.push(details);
                            }

                        }
                        i++;
                    }
                    k++;
                }
            }

            for (const obj of text_list) {
                var k = 0;
                for (const modules of p_pog_json[p_pog_index].ModuleInfo) {
                    var i = 0;
                    for (const shelfs of modules.ShelfInfo) {
                        if (shelfs.ObjType == "TEXTBOX" && obj.Shelf == shelfs.Shelf) {
                            p_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo.splice(i, 1);
                        }
                        i++;
                    }
                    k++;
                }
            }
        }
        logDebug("function : remove_text_box; p_pog_index: " + p_pog_index, "E");
    } catch (err) {
        error_handling(err);
    }
}

async function showItemAvailQty(p_showAvailQty, p_itemBackLabelColor, p_itemCode, p_availQty, p_pog_index) {
    try {
        logDebug("function : showItemAvailQty; g_show_item_desc : " + g_show_item_desc, "S");
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var camera_z_pos = g_camera.position.z;
        var back_color = p_itemBackLabelColor;
        var colorValue = parseInt(back_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        if (p_showAvailQty == "N") {
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
                                    if (items.Item !== "DIVIDER" && items.Item == p_itemCode) {
                                        var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                        if (typeof items.QtyID !== "undefined" && items.QtyID !== -1 && typeof item_obj !== "undefined") {
                                            var label_obj = item_obj.getObjectById(items.QtyID);
                                            item_obj.remove(label_obj);
                                        }
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].QtyID = -1;
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
            g_camera.position.z = 5;
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
                                    if (items.Item !== "DIVIDER" && items.Item == p_itemCode) {
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

                                        var textToDisplay = 'AQ' + "\n " + p_availQty //get_message('POGCR_AVAIL_QTY_LBL') + "\n     " + pAvailQty;

                                        if (typeof items.QtyID !== "undefined" && items.QtyID !== -1) {
                                            var label_obj = item_obj.getObjectById(items.QtyID);
                                            item_obj.remove(label_obj);
                                        }
                                        var return_obj = addAvailQty(textToDisplay, 120, 0.09, text_color, "center", "#ffffff", 'N,0.07', items.W, items.H);
                                        item_obj.add(return_obj);
                                        return_obj.position.x = (items.W / 5);
                                        return_obj.position.y = - (items.H / 3);
                                        return_obj.position.z = 0.0006;
                                        item_obj.WireframeObj.material.color.setHex(0x000000);
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].QtyID = return_obj.id;
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
            g_camera.position.z = camera_z_pos;
        }
        render();
        logDebug("function : showItemAvailQty", "E");
    } catch (err) {
        error_handling(err);
    }
}

function addAvailQty(p_text, p_textHeight, p_actualFontSize, p_font_color, p_txt_align, p_back_color, p_daysofsuppFontSize, p_width, p_height) {
    try {
        logDebug("function : addlabelText; text : " + p_text + "; textHeight : " + p_textHeight + "; actualFontSize : " + p_actualFontSize + "; font_color : " + p_font_color + "; txt_align : " + p_txt_align + "; back_color : " + p_back_color, "S");
        // 2d duty
        var lines = p_text.split("\n");
        var new_width = p_width * 10;
        var new_height = p_height * 10;
        // 2d duty
        var text_canvas = document.createElement("canvas");
        var context = text_canvas.getContext("2d");
        context.fillStyle = "#000000";
        var metrics = context.measureText(p_text);
        var textWidth = metrics.width;
        if (p_daysofsuppFontSize.split(",")[0] == "N") {
            var p_actualFontSize = p_daysofsuppFontSize.split(",")[1];
        } else {
            p_actualFontSize = p_daysofsuppFontSize.split(",")[1];
        }
        var len_text = p_text;
        if (lines.length > 1) {
            var len = 0;
            for (obj of lines) {
                if (obj.length > len) {
                    len_text = obj;
                    len = obj.length;
                }
            }
        }
        if (lines.length > 1) {
            p_actualFontSize = (p_actualFontSize / 1.5) * lines.length;
        }

        var [canvasWidth, canvasHeight] = get_visible_size(0.012, new_width, new_height, g_canvas, g_camera);
        var [width, height] = get_visible_text_dim(p_text, p_textHeight);

        text_canvas.width = canvasWidth;
        text_canvas.height = canvasHeight;

        context.font = p_textHeight + "px Arial";
        context.textAlign = p_txt_align;
        context.textBaseline = "middle";
        context.fillStyle = p_font_color;
        if (lines.length > 1) {
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
        } else {
            context.fillText(p_text, p_width / 2, p_height / 2);
        }

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
        });

        material.map.minFilter = THREE.LinearFilter;
        var sprite = new THREE.Mesh(geometry, material);
        sprite.uuid = "addAvailQty";
        logDebug("function : addlabelText", "E");
        return sprite;
    } catch (err) {
        error_handling(err);
    }
}

async function ShowHideAvailQty(p_showAvailQty, p_itemNumLblColor, p_dispItemInfo, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblPos, p_delistDftColor, p_notchHead, p_itemCode, p_imgActive, p_descActive, p_oldActive, p_pog_index) {
    try {
        logDebug("function : showItemAvailQty p_pog_index:" + p_pog_index, "S");
        if (typeof g_pog_json !== 'undefined' && g_pog_json.length > 0) {
            addLoadingIndicator();
            g_intersected = [];
            if (p_showAvailQty == 'Y') {
                if (p_descActive == 'Y') {
                    await showHideItemDescription("N", p_itemNumLblColor, p_dispItemInfo, p_pog_index);
                } else if (p_imgActive == 'Y') {
                    await recreate_image_items('N', p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor, p_notchHead, p_pog_index, 'N', "N,0.018", []);
                }
                await showItemAvailQty(p_showAvailQty, p_itemNumLblColor, p_itemCode, g_pog_list[p_pog_index].SOH, p_pog_index);
            } else {
                await showItemAvailQty('N', p_itemNumLblColor, p_itemCode, g_pog_list[p_pog_index].SOH, p_pog_index);
                if (p_oldActive == 'LIVE') {
                    var return_val = await recreate_image_items('N', p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor, p_notchHead, p_pog_index, 'N', "N,0.018", []);
                } else {
                    await showHideItemDescription("Y", p_itemNumLblColor, p_dispItemInfo, p_pog_index);
                }
            }
            removeLoadingIndicator(regionloadWait);
        }
        logDebug("function : showItemAvailQty p_pog_index:" + p_pog_index, "E");
    } catch (err) {
        error_handling(err);
    }
}

function get_sqrt(p_touch) {
    return Math.sqrt(
        (p_touch[0].clientX - p_touch[1].clientX) *
        (p_touch[0].clientX - p_touch[1].clientX) +
        (p_touch[0].clientY - p_touch[1].clientY) *
        (p_touch[0].clientY - p_touch[1].clientY));
}

function SetupTouchCanvas(p_touchStartFunc, p_touchMoveFunc, p_touchEndFunc, p_grabInterval) {
    logDebug("function : SetupTouchCanvas", "S");
    var l_distance = 0;
    var l_lastDistance = 0;
    function handleStart(evt) {
        if (evt.type === "touchstart" && touch.length === 2) {
            evt.preventDefault();
            l_lastDistance = get_sqrt(touch);
        }
        p_touchStartFunc(evt, l_lastDistance);

    }

    function handleMove(p_event) {
        if (p_event.type === "touchmove" && touch.length === 2) {
            l_distance = get_sqrt(touch);
            p_touchMoveFunc(p_event, l_distance, l_lastDistance);
        }

    }

    function handleEnd(p_event) {
        p_touchEndFunc(p_event);
    }
    function scaleCanvasTouch(p_grabInterval, p_distance, p_lastDistance) {
        try {
            logDebug("function : scaleCanvasTouch ", "S");
            if (p_lastDistance > p_distance) {
                g_camera.position.set(g_camera.position.x, g_camera.position.y, g_camera.position.z + p_grabInterval);
            } else if (p_lastDistance < p_distance) {
                g_camera.position.set(g_camera.position.x, g_camera.position.y, g_camera.position.z - p_grabInterval);
            }
            render();
            l_lastDistance = p_distance;
            logDebug("function : scaleCanvasTouch ", "E");
        } catch (err) {
            error_handling(err);
        }
    }

    if (typeof window.ontouchstart !== "undefined") {
        const el = document.getElementById("maincanvas");
        window.addEventListener("touchstart", handleStart);
        window.addEventListener("touchmove", handleMove);
        window.myParam = p_grabInterval;
        window.addEventListener("touchend", handleEnd);
    }

    logDebug("function : SetupTouchCanvas", "E");
}

function handleStart(p_event, p_lastDistance) {
    try {
        logDebug("function : handleStart ", "S");
        touch = p_event.touches || p_event.changedTouches;
        if (p_event.type === "touchstart" && touch.length === 2) {
            p_event.preventDefault();
            g_lastDistance = get_sqrt(touch);
        }
        logDebug("function : handleStart ", "E");
    } catch (err) {
        error_handling(err);
    }
};

function handleMove(p_event) {
    try {
        logDebug("function : handleMove ", "S");
        var touch = p_event.touches || p_event.changedTouches;
        if (p_event.type === "touchmove" && touch.length === 2) {
            g_distance = get_sqrt(touch);

            scaleCanvasTouch(p_event.currentTarget.myParam);
        }
        logDebug("function : handleMove ", "E");
    } catch (err) {
        error_handling(err);
    }

};

function handleEnd(evt) {
    g_distance = 0;
};

async function navigate_button_action(p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_selectedItem, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index, p_action, p_autoCorrectInd, p_statusbarFontSize, p_CusPogCode) {
    logDebug("function : prev_action ", "S");
    if ((p_action == 'N' && p_pog_index < g_pog_json.length - 1) || (p_action == 'P' && p_pog_index > 0)) {
        if (p_action == 'P' && p_pog_index > 0) {
            var temp_pogIndex = p_pog_index - 1;
        } else {
            var temp_pogIndex = p_pog_index + 1;
        }
        var retval = await recreate_next_pog(temp_pogIndex, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_selectedItem, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index, p_autoCorrectInd, p_CusPogCode, p_statusbarFontSize);
        return retval;
    }

    logDebug("function : prev_action ", "E");
};

async function recreate_next_pog(pNextPog, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_selectedItem, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index, p_autoCorrectInd, p_CusPogCode, p_statusbarFontSize, p_pog_index) { //ASA-1303
    try {
        logDebug("function : recreate_next_pog pNextPog: " + pNextPog, "S");
        var temp_pog = JSON.parse(JSON.stringify(g_pog_json));
        var new_pog_ind = temp_pog[pNextPog].DesignType == 'D' ? 'Y' : "N";
        p_pog_index = pNextPog;
        g_offset_z = 0;
        g_intersected = [];
        init_lib('Y', 'N', 'Y', p_pog_index);
        objects = {};
        objects["scene"] = g_scene;
        objects["renderer"] = g_renderer;
        g_scene_objects[pNextPog] = objects;
        await setDefaultState(p_dftLiveImage, p_dftItemDesc, p_dftNotchLbl, p_dftFixelLbl, p_showAvailQty, p_dftItemLbl);
        addLoadingIndicator();
        sessionStorage.setItem("org_mod_index", g_pog_json.org_mod_index);
        var return_val = await create_module_from_json(temp_pog, new_pog_ind, "F", "N", "E", "Y", "N", "Y", "Y", "N", temp_pog[0].org_mod_index, $v('P27_IMG_ACTIVE'), p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index);
        if (p_autoCorrectInd == 'Y') {
            await auto_align_peg_items(p_pog_index, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor);
            await auto_position_all(g_camera, p_pog_index, p_pog_index);
        }
        $s('P27_CURRENT_POG_CODE', g_pog_json[p_pog_index].POGCode); //ASA-1456
        await add_status_bar(p_statusLblList, p_objInfoRegionID, p_selectedItem, 'N', p_pog_index, p_CusPogCode, p_statusbarFontSize);
        render_blink_effect();
        $(p_numTxtRegionID).text((pNextPog + 1) + ' of ' + g_pog_json.length);
        p_pog_index = pNextPog;
        return 'SUCCESS';
        logDebug("function : recreate_next_pog pNextPog: " + pNextPog, "E");
    } catch (err) {
        error_handling(err);
    }
}

async function create_pog_first(p_pog_list, p_floorPlanRegionID, p_liveImgRegionID, p_liveStockRegionID, p_show_my_path_id, p_prevBtn, p_nextBtn, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_showTextbox, p_selectedItem, p_showImgBtnID, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_autoCorrectInd, p_statusbarFontSize, p_CusPogCode, p_pog_index) {
    try {
        logDebug("function : create_pog_first ", "S");
        addLoadingIndicator();
        $('#LIVE_STOCK,#LIVE_IMAGE,#FLOOR_PLAN').addClass('apex_disabled');
        p_pog_index = 0;
        g_offset_z = 0;
        g_scene_objects = [];
        g_intersected = [];
        init_lib('Y', 'N', 'Y', p_pog_index);
        objects = {};
        objects["scene"] = g_scene;
        objects["renderer"] = g_renderer;
        g_scene_objects.push(objects);
        var temp_pog = [];
        g_pog_json = [];
        g_multi_pog_json = [];
        var lpogCnt = 0;
        if (p_pog_list !== '') {
            g_pog_list = JSON.parse(p_pog_list);
            $(p_numTxtRegionID).text(1 + ' of ' + g_pog_list.length);
            console.log('g_pog_list', g_pog_list);
            for (const pogs of g_pog_list) {
                await get_json_data_json(pogs.PogCode, pogs.PogVersion, "N", "");
                temp_pog.push(JSON.parse(JSON.stringify(g_pog_json_data[0])));
                console.log('temp_pog', temp_pog);
                var total_mod_width = 0;
                var new_pog_ind = temp_pog[lpogCnt].DesignType == 'D' ? 'Y' : "N";
                await setDefaultState(p_dftLiveImage, p_dftItemDesc, p_dftNotchLbl, p_dftFixelLbl, p_showAvailQty, p_dftItemLbl);
                p_pog_index = lpogCnt;
                g_module_obj_array = [];
                if (pogs.Exclude == 'Y') {
                    var mod_ind = -1,
                        shelf_ind = -1,
                        item_ind = -1;
                    var module_details = temp_pog[lpogCnt].ModuleInfo;
                    i = 0;
                    for (const Modules of module_details) {

                        if (item_ind !== -1) {
                            break;
                        }
                        if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                            var j = 0;
                            for (const Shelf of Modules.ShelfInfo) {
                                if (item_ind !== -1) {
                                    break;
                                }
                                if (typeof Shelf !== "undefined" && Shelf.ItemInfo !== null) {
                                    k = 0;
                                    for (const items of Shelf.ItemInfo) {
                                        if (items.Item == p_selectedItem) {
                                            mod_ind = i;
                                            shelf_ind = j;
                                            item_ind = k;
                                            break;
                                        }
                                        k++;
                                    }
                                }
                                j++;
                            }
                        }
                        i++;
                    }
                    var mod_details = JSON.parse(JSON.stringify(temp_pog[lpogCnt].ModuleInfo[mod_ind]));
                    var l_shelf_details = JSON.parse(JSON.stringify(mod_details.ShelfInfo[shelf_ind]));
                    var item_details = JSON.parse(JSON.stringify(mod_details.ShelfInfo[shelf_ind].ItemInfo[item_ind]));
                    temp_pog[lpogCnt].W = 1;
                    temp_pog[lpogCnt].H = 1;
                    mod_details.W = 1;
                    mod_details.H = 1;
                    l_shelf_details.W = 1;
                    l_shelf_details.H = 0.02;
                    l_shelf_details.X = l_shelf_details.W;
                    l_shelf_details.Y = 0.5;
                    item_details.X = 0;
                    item_details.Y = 0.5 + l_shelf_details.H;

                    mod_details.ShelfInfo = [];
                    l_shelf_details.ItemInfo = [];
                    mod_details.ShelfInfo[0] = l_shelf_details;
                    mod_details.ShelfInfo[0].ItemInfo = [];
                    mod_details.ShelfInfo[0].ItemInfo[0] = item_details;
                    temp_pog[lpogCnt].ModuleInfo = [];
                    temp_pog[lpogCnt].ModuleInfo[0] = mod_details;
                    temp_pog[lpogCnt].TotalModWidth = 1;
                } else {
                    var moduleName = "";
                    var moduleWidth = -1;
                    var moduleInfo = [],
                        mod_rec,
                        org_mod_index = -1;
                    var returnval = true;
                    var l_selected_mod = pogs.PogModule;
                    p_pog_index = lpogCnt;
                    if (l_selected_mod !== "") {
                        if (temp_pog.length > 0) {
                            $.each(temp_pog[lpogCnt].ModuleInfo, function (k, Modules) {
                                if (Modules.ParentModule == null) {
                                    if (Modules.Module == l_selected_mod) {
                                        org_mod_index = k;
                                        moduleInfo.push(Modules);
                                        moduleWidth = Modules.W;
                                    }
                                }
                            });
                            $.each(temp_pog[lpogCnt].ModuleInfo, function (k, Modules) {
                                if (Modules.ParentModule == null && k < org_mod_index) {
                                    total_mod_width += Modules.W;
                                }
                            });
                        }
                        temp_pog[lpogCnt].ModuleInfo = moduleInfo;
                        temp_pog[lpogCnt].W = moduleWidth;
                        temp_pog[lpogCnt].TotalModWidth = total_mod_width;
                    }

                    await remove_text_box(lpogCnt, p_showTextbox, temp_pog);
                }

                if (lpogCnt == 0) {
                    $(p_floorPlanRegionID).show();
                    $(p_liveImgRegionID).show();
                    $(p_liveStockRegionID).show();
                    $(p_show_my_path_id).show();

                    await create_module_from_json(temp_pog, new_pog_ind, "F", "N", "E", "Y", "N", "Y", "Y", "Y", org_mod_index, g_show_live_image /*"N"*/, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index); //ASA-1491 Issue 3
                    render();
                    g_pog_index = lpogCnt;
                    g_pog_json[0].org_mod_index = org_mod_index;
                    if (p_autoCorrectInd == 'Y') {
                        await auto_align_peg_items(p_pog_index, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor);
                        await auto_position_all(g_camera, p_pog_index, p_pog_index);
                    }
                    $s('P27_CURRENT_POG_CODE', g_pog_json[p_pog_index].POGCode); //ASA-1456
                    //await add_status_bar(p_statusLblList, p_objInfoRegionID, p_selectedItem, 'N', p_pog_index, p_CusPogCode, p_statusbarFontSize);
                    render_blink_effect();
                    $(p_showImgBtnID).addClass('apex_disabled');
                    // await get_all_images(p_pog_index, "N", "N"); //ASA-1515
                    $(p_showImgBtnID).removeClass('apex_disabled');
                } else {
                    if (g_scene_objects.length > 0) {
                        await create_module_from_json(temp_pog, new_pog_ind, "F", "N", "E", "N", "N", "N", "Y", "Y", org_mod_index, g_show_live_image /*"N"*/, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_pog_index);
                        // await get_all_images(p_pog_index, "N", "N"); //ASA-1515
                    }
                }
                lpogCnt++;
            }
            g_pog_json = g_multi_pog_json;

        }
        $('#prev_btn').css('display', 'block');
        $('#next_btn').css('display', 'block');
        $('#LIVE_STOCK').removeClass('apex_disabled');
        $('#LIVE_IMAGE').removeClass('apex_disabled');
        $('#FLOOR_PLAN').removeClass('apex_disabled');
        logDebug("function : create_pog_first ", "E");
        return p_pog_index;
    } catch (err) {
        error_handling(err);
    }
}

async function get_pog_search(p_ItemCode, p_scanningInd, p_ItemtoSet, p_defaultDays, p_pogTypeSeq, p_floorPlanRegionID, p_liveImgRegionID, p_liveStockRegionID, p_show_my_path_id, p_prevBtn, p_nextBtn, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_showTextbox, p_showImgBtnID, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_autoCorrectInd, p_statusbarFontSize, p_CusPogCode, p_pog_index) {
    try {
        logDebug("function : get_pog_search ", "S");
        g_auto_x_space = parseFloat($v("P27_POGCR_CHEST_ITEM_H_SPC")) / 100; //ASA-1491 Issue 2
        g_auto_y_space = parseFloat($v("P27_POGCR_CHEST_ITEM_V_SPC")) / 100; //ASA-1491 Issue 2
        var item_val = '';
        apex.server.process(
            "GET_ITEM", {
            x01: p_ItemCode,
            x02: p_scanningInd
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) != "") {
                    var details = ($.trim(pData)).split(',');
                    if (details[0] == 'ERROR') {
                        g_itemChanged = 'N'; //ASA-1515
                        removeLoadingIndicator(regionloadWait);
                        raise_error(details[1]);
                    } else {
                        g_ItemImages = [];
                        g_pog_json = [];
                        item_val = $.trim(pData);
                        $s(p_ItemtoSet, `${item_val}`);

                        apex.server.process(
                            "GET_POG_LIST", {
                            x01: item_val,
                            x02: 'N',
                            x03: p_defaultDays,
                            x04: p_pogTypeSeq,
                            pageItems: p_ItemtoSet
                        }, {
                            dataType: "text",
                            success: async function (pData) {
                                if ($.trim(pData) != "") {
                                    var details = ($.trim(pData)).split(',');
                                    if (details[0] == 'ERROR') {
                                        g_itemChanged = 'N'; //ASA-1515
                                        removeLoadingIndicator(regionloadWait); //ASA-1491 Issue 2
                                        raise_error(details[1]);
                                    } else {
                                        $('#prev_btn').css('display', 'none');
                                        $('#next_btn').css('display', 'none');
                                        //removeLoadingIndicator(regionloadWait);
                                        g_pog_json = [];
                                        var returnVal = await create_pog_first($.trim(pData), p_floorPlanRegionID, p_liveImgRegionID, p_liveStockRegionID, p_show_my_path_id, p_prevBtn, p_nextBtn, p_vdate, p_pogDftColor, p_modDftColor, p_dftSpreadProduct, p_dftHorizSpac, p_dftVertSpac, p_bskWallThick, p_chestWallThick, p_pegItemAutoPlace, p_dftWrapText, p_textDftSize, p_textDftColor, p_shelfDftColor, p_divColor, p_slotDivider, p_slotOrient, p_divFixed, p_itemDftColor, p_delistDftColor, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblPos, p_notchHead, p_dftItemDesc, p_dftLiveImage, p_dftNotchLbl, p_dftFixelLbl, p_dftItemLbl, p_showAvailQty, p_statusLblList, p_objInfoRegionID, p_numTxtRegionID, p_showTextbox, item_val, p_showImgBtnID, p_dftBskFill, p_dftBaskSprd, p_maxWidth, p_maxHeight, p_compRatio, p_autoCorrectInd, p_statusbarFontSize, p_CusPogCode, p_pog_index); //ASA-1303
                                        try {
                                            
                                            await add_status_bar(p_statusLblList, p_objInfoRegionID, item_val, 'N', p_pog_index, p_CusPogCode, p_statusbarFontSize);
                                        } catch (e) {
                                            console.warn('add_status_bar failed after create_pog_first', e);
                                        }
                                        g_itemChanged = 'N' //ASA-1515
                                        logDebug("function : get_pog_search ", "E");
                                    }
                                } else {
                                    g_itemChanged = 'N';//ASA-1515
                                    removeLoadingIndicator(regionloadWait);
                                }
                            },

                        });
                    }
                }
            },
        });
    } catch (err) {
        g_itemChanged = 'N';
        error_handling(err);
    }
}

function set_store_info(p_objInfoRegionID, p_store, p_location_list, p_pog_code, p_shelf, p_module, p_pog_version, p_horiz_facing, p_CusPogCode, p_hightlightProduct, p_item_desc, p_statusbarFontSize, p_loc_id) {
    $(p_objInfoRegionID)
        .contents()
        .filter(function () {
            return this.nodeType == 3;
        })
        .remove();
    var append_detail = '';
    var valid_width = 0;
    var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; //ASA-1303

    append_detail = append_detail + '<span style="color:#001fff">' + get_message('STORE') + ':</span> ' + p_store + ' | ' + '<span style="color:#001fff">' + get_message('LOC_ID') + ':</span> ' + p_location_list.join(',');
    line_width = (get_message('STORE') + ': ' + p_store + get_message('LOC_ID') + ': ' + p_location_list).visualLength("ruler");

    if (p_CusPogCode == 'Y') {
        var cus_loc_id = (p_loc_id < 10 ? '00' : p_loc_id < 100 ? '0' : '') + p_loc_id;
        var cus_horiz_facing = (p_horiz_facing < 10 ? '0' : '') + p_horiz_facing;
        var cus_shelf = (p_shelf.length < 2 ? '0' : '') + p_shelf;
        append_detail = append_detail + ' | ' + '<span style="color:#001fff">' + get_message('TEMP_HEAD_POG_CODE') + ': </span>' + p_pog_code + p_module + cus_shelf + cus_loc_id + cus_horiz_facing; //asa-1303
        line_width = (get_message('TEMP_HEAD_POG_CODE') + ': ' + p_pog_code + p_module + cus_shelf + cus_loc_id + cus_horiz_facing).visualLength("ruler");

        append_detail = append_detail + ' | ' + '<span style="color:#001fff">' + get_message('TEMP_HEAD_VERSION') + ': </span>' + p_pog_version;
        line_width = (get_message('TEMP_HEAD_VERSION') + ': ' + p_pog_version).visualLength("ruler");

        append_detail = append_detail + '(' + p_module + ')';
        line_width = ('(' + p_module + ')').visualLength("ruler");

        append_detail = append_detail + ' | ' + '<span style="color:#001fff">' + get_message('ITEM') + ': </span>' + p_hightlightProduct;
        line_width = (" | " + get_message('ITEM') + ': ' + p_hightlightProduct).visualLength("ruler");

        append_detail = append_detail + '-' + p_item_desc;
        line_width = ('-' + p_item_desc).visualLength("ruler");

    }

    valid_width += line_width;
    if (valid_width > browserWidth) {
        append_detail = append_detail + "<br>";
        valid_width = 0;
    }
    var ruler = document.getElementById("ruler");
    ruler.style.fontSize = p_statusbarFontSize + "px";
    ruler.innerHTML = append_detail;
    var height = ruler.offsetHeight + 7;
    var width = append_detail.visualLength("ruler");

    var contextElement = document.getElementById("object_info");
    contextElement.classList.add("active");
    $(p_objInfoRegionID).html(append_detail);
    contextElement.style.top = window.innerHeight - height + "px";
    contextElement.style.width = width + "px";
    contextElement.style.height = height + "px";
    contextElement.style.fontSize = p_statusbarFontSize + "px"; //ASA-1303
    contextElement.style.fontFamily = "Tahoma";
    contextElement.style.left = 0 + "px";
}

function get_pog_info(p_pog_index, p_hightlightProduct) {
    var k = 0;
    var item_exists = 'N';
    var module,
        shelf,
        desc,
        item_info,
        horiz_facing,
        loc_id;
    for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
        var i = 0;
        for (const shelfs of modules.ShelfInfo) {
            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                var j = 0;
                for (const items of shelfs.ItemInfo) {
                    if (p_hightlightProduct == items.Item) {
                        selectedObj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                        var highlightItem = highlightProduct(selectedObj, 4, items.W, items.H, items.D, items.Z);
                        g_intersected.push(selectedObj);
                        module = modules.Module;
                        shelf = shelfs.Shelf;
                        item_info = items;
                        desc = items.Desc;
                        horiz_facing = items.BHoriz;
                        loc_id = items.LocID;

                        item_exists = 'Y';
                    }
                    j++;
                }
            }
            i++;
        }
        k++;
    }
    return [item_exists, module, shelf, desc, item_info, horiz_facing, loc_id];
} //ASA-1303

function getImageClob(p_objInfoRegionID, p_floorPlanRegioinID, p_openFloorRegionID, p_store, p_pog_index, p_hightlightProduct, p_CusPogCode, p_statusbarFontSize) {
    try {
        logDebug("function : getImageClob ", "S");
        var location_list = (g_pog_list[p_pog_index].LocationID).split(',');
        var pog_code = (g_pog_json[p_pog_index].POGCode);
        var pog_version = (g_pog_json[p_pog_index].Version);
        apex.server.process(
            "GET_SVG_CLOB", {
            x01: p_store,
            x02: g_pog_list[p_pog_index].FPVersion
        }, {
            dataType: "json",
            success: function (data) {
                if (data.result == "success") {
                    openInlineDialog(p_openFloorRegionID, 150, 150);
                    //VIVEK
                    var [item_exists, module, shelf, desc, item_info, horiz_facing, loc_id] = get_pog_info(p_pog_index, p_hightlightProduct); //ASA-1303

                    set_store_info(p_objInfoRegionID, p_store, location_list, pog_code, shelf, module, pog_version, horiz_facing, p_CusPogCode, p_hightlightProduct, desc, p_statusbarFontSize, loc_id);
                    var xmlDoc = $.parseXML(data.response),
                        $xml = $(xmlDoc),
                        $svg = $xml.find("svg");
                    $(p_floorPlanRegioinID + " svg").remove();
                    $(p_floorPlanRegioinID)
                        .append($svg)
                        .ready(function () {
                            activateZoomInOut(p_floorPlanRegioinID);
                            $('svg title').text('');
                            Hide_paths() //ASA-1456
                            document.querySelectorAll('path').forEach(path => {

                                if (path.getAttribute('Location_ID') !== null) {
                                    h = 0;
                                    for (const obj of location_list) {
                                        if ((path.getAttribute('Location_ID')).toUpperCase() == location_list[h]) {
                                            console.log(path.getAttribute('Location_ID'));
                                            console.log(location_list[h]);
                                            add_highlight(path.getAttribute('Location_ID'), pog_code, module, p_CusPogCode); //ASA-1303
                                        }
                                        h++;
                                    }

                                    if ((location_list[0]).includes((path.getAttribute('Location_ID')).toUpperCase())) {
                                        path.setAttribute('style', 'fill: red');
                                    }
                                }
                            });
                            $('path').click(function () {
                                var locId = $(this).attr('Location_ID');
                                var h = 0;
                                for (const obj of location_list) {
                                    if ((location_list[h]).includes(locId)) {
                                        add_highlight(path.getAttribute('Location_ID'), pog_code, module, p_CusPogCode); //ASA-1303
                                    }
                                    h++;
                                }

                            })
                            if (g_enableItemLocHighlight == "Y") {
                                markItemLocation();//ASA-1515
                            }
                            logDebug("function : getImageClob ", "E");
                        });
                } else {
                    raise_error(get_message('SVG_NOT_FOUND', p_store));
                }
            },
            loadingIndicatorPosition: "page",
        });
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1515
function markItemLocation() {
    try {
        var locationIds = g_pog_list
            .map(function (item) {
                return item.LocationID.split(',');
            })
            .flat();

        for (locId of locationIds) {
            drawItemLoaction(locId);
        }
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1515
function drawItemLoaction(p_location_id) {
    try {
        logDebug("function : drawItemLoaction location_id: " + p_location_id, "S");
        document.querySelectorAll('svg').forEach(svgpath => {
            svgpath.querySelectorAll('g').forEach(gpath => {
                var newpathR;
                gpath.querySelectorAll('path').forEach(path => {
                    if (path.getAttribute('Location_ID') !== null) {
                        if (path.getAttribute('Location_ID') == (p_location_id).toUpperCase()) {
                            var pathbox = path.getBBox();
                            newpathR = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                            newpathR.setAttributeNS(null, "id", "Hrect_" + p_location_id);
                            newpathR.setAttributeNS(null, "x", pathbox.x - 4);
                            newpathR.setAttributeNS(null, "y", pathbox.y - 4);
                            newpathR.setAttributeNS(null, "width", pathbox.width + 8);
                            newpathR.setAttributeNS(null, "height", pathbox.height + 8);
                            newpathR.setAttributeNS(null, "fill", "none");
                            newpathR.setAttributeNS(null, "stroke", g_locHighlightColor);
                            newpathR.setAttributeNS(null, "stroke-width", 2);
                            gpath.prepend(newpathR);
                        }
                    }
                })
            });
        });
        logDebug("function : drawItemLoaction location_id: " + p_location_id, "E");
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1620 START
// function activateZoomInOut(p_floorPlanRegioinID) {
//     try {
//         logDebug("function : activateZoomInOut ", "S");
//         var svgImage = $(p_floorPlanRegioinID + " svg")[0];
//         var svgContainer = $(p_floorPlanRegioinID)[0];

//         var vWidth = svgImage.viewBox.baseVal.width;
//         var vHeight = svgImage.viewBox.baseVal.height;
//         var svgSize = {
//             w: svgImage.clientWidth,
//             h: svgImage.clientHeight
//         };
//         var hscale = vHeight / svgSize.h;
//         var wscale = vWidth / svgSize.w;
//         var isPanning = false;
//         var startPoint = {
//             x: 0,
//             y: 0
//         };
//         var endPoint = {
//             x: 0,
//             y: 0
//         };
//         var scale = vWidth / svgSize.w;
//         var viewWidth = svgImage.clientWidth * wscale;
//         var viewHeight = svgImage.clientHeight * hscale;
//         var viewBox = {
//             x: 0,
//             y: 0,
//             w: viewWidth,
//             h: viewHeight
//         };

//         svgContainer.onmousewheel = function (e) {
//             e.preventDefault();
//             var w = viewBox.w;
//             var h = viewBox.h;
//             var mx = e.offsetX;
//             var my = e.offsetY;
//             var dw = w * Math.sign(e.deltaY) * 0.05;
//             var dh = h * Math.sign(e.deltaY) * 0.05;
//             var dx = (dw * mx) / svgSize.w;
//             var dy = (dh * my) / svgSize.h;
//             viewBox = {
//                 x: viewBox.x - dx,
//                 y: viewBox.y - dy,
//                 w: viewBox.w + dw,
//                 h: viewBox.h + dh
//             };
//             scale = svgSize.w / viewBox.w;
//             svgImage.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
//         };

//         svgContainer.mousedown = function (e) {
//             isPanning = true;
//             startPoint = {
//                 x: e.x,
//                 y: e.y
//             };
//         };

//         svgContainer.mousemove = function (e) {
//             if ((e.target).getAttribute('Location_ID')) {
//                 $(p_floorPlanRegioinID).css('cursor', 'pointer');
//             } else {
//                 $(p_floorPlanRegioinID).css('cursor', 'auto');
//             }
//             if (isPanning) {
//                 endPoint = {
//                     x: e.x,
//                     y: e.y
//                 };
//                 var dx = (startPoint.x - endPoint.x) / scale;
//                 var dy = (startPoint.y - endPoint.y) / scale;
//                 var movedviewBox = {
//                     x: viewBox.x + dx,
//                     y: viewBox.y + dy,
//                     w: viewBox.w,
//                     h: viewBox.h
//                 };
//                 svgImage.setAttribute("viewBox", `${movedviewBox.x} ${movedviewBox.y} ${movedviewBox.w} ${movedviewBox.h}`);
//             }
//         };

//         svgContainer.mouseup = function (e) {
//             if (isPanning) {
//                 endPoint = {
//                     x: e.x,
//                     y: e.y
//                 };
//                 var dx = (startPoint.x - endPoint.x) / scale;
//                 var dy = (startPoint.y - endPoint.y) / scale;
//                 viewBox = {
//                     x: viewBox.x + dx,
//                     y: viewBox.y + dy,
//                     w: viewBox.w,
//                     h: viewBox.h
//                 };
//                 svgImage.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
//                 isPanning = false;
//             }
//         };

//         svgContainer.onmouseleave = function (e) {
//             isPanning = false;
//         };
//         logDebug("function : activateZoomInOut ", "E");
//     } catch (err) {
//         error_handling(err);
//     }
// }

function activateZoomInOut(p_floorPlanRegionID) {
    try {
        logDebug("function : activateZoomInOut", "S");
        const container = document.querySelector(p_floorPlanRegionID);
        const svgElements = container.querySelectorAll('svg');
        const svgStates = new Map();

        // Initialize SVG states
        svgElements.forEach((svg) => {
            const originalViewBox = {
                x: svg.viewBox.baseVal.x,
                y: svg.viewBox.baseVal.y,
                w: svg.viewBox.baseVal.width,
                h: svg.viewBox.baseVal.height
            };

            svgStates.set(svg, {
                viewBox: { ...originalViewBox },
                originalViewBox, // Save the original state for reset
                isPanning: false,
                startPoint: { x: 0, y: 0 },
                scale: 1
            });
        });

        const updateViewBox = (svg, viewBox) => {
            svg.setAttribute(
                'viewBox',
                `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`
            );
        };

        // Zoom functionality
        container.addEventListener('wheel', (e) => {
            const svg = e.target.closest('svg');
            if (!svg || !svgStates.has(svg)) return;

            e.preventDefault();

            const state = svgStates.get(svg);
            const svgSize = { w: svg.clientWidth, h: svg.clientHeight };
            const viewBox = state.viewBox;
            const originalViewBox = state.originalViewBox;

            const zoomFactor = 0.05;
            const zoomDirection = -Math.sign(e.deltaY);      //ASA-1620 #1
            const dw = viewBox.w * zoomFactor * zoomDirection;
            const dh = viewBox.h * zoomFactor * zoomDirection;

            const mx = e.offsetX / svgSize.w * viewBox.w + viewBox.x;
            const my = e.offsetY / svgSize.h * viewBox.h + viewBox.y;

            const newViewBox = {
                x: Math.max(originalViewBox.x, Math.min(viewBox.x + (dw * mx) / viewBox.w, originalViewBox.x + originalViewBox.w - viewBox.w - dw)),
                y: Math.max(originalViewBox.y, Math.min(viewBox.y + (dh * my) / viewBox.h, originalViewBox.y + originalViewBox.h - viewBox.h - dh)),
                w: Math.max(10, viewBox.w - dw),
                h: Math.max(10, viewBox.h - dh)
            };

            state.viewBox = newViewBox;
            state.scale = svgSize.w / newViewBox.w;

            updateViewBox(svg, newViewBox);
        });

        // Pan functionality
        container.addEventListener('mousedown', (e) => {
            const svg = e.target.closest('svg');
            if (!svg || !svgStates.has(svg)) return;

            const state = svgStates.get(svg);
            state.isPanning = true;
            state.startPoint = { x: e.clientX, y: e.clientY };
        });

        container.addEventListener('mousemove', (e) => {
            const svg = e.target.closest('svg');
            if (!svg || !svgStates.has(svg)) return;

            const state = svgStates.get(svg);
            if (!state.isPanning) return;

            const dx = (state.startPoint.x - e.clientX) / state.scale;
            const dy = (state.startPoint.y - e.clientY) / state.scale;

            const viewBox = state.viewBox;
            const originalViewBox = state.originalViewBox;

            viewBox.x = Math.max(originalViewBox.x, Math.min(originalViewBox.x + originalViewBox.w - viewBox.w, viewBox.x + dx));
            viewBox.y = Math.max(originalViewBox.y, Math.min(originalViewBox.y + originalViewBox.h - viewBox.h, viewBox.y + dy));

            updateViewBox(svg, viewBox);
            state.startPoint = { x: e.clientX, y: e.clientY };
        });

        container.addEventListener('mouseup', () => {
            svgStates.forEach((state) => {
                state.isPanning = false;
            });
        });

        container.addEventListener('mouseleave', () => {
            svgStates.forEach((state) => {
                state.isPanning = false;
            });
        });

        // Reset functionality
        container.addEventListener('dblclick', (e) => {
            const svg = e.target.closest('svg');
            if (!svg || !svgStates.has(svg)) return;

            const state = svgStates.get(svg);
            state.viewBox = { ...state.originalViewBox };
            state.scale = 1;

            updateViewBox(svg, state.viewBox);
        });

        logDebug("function : activateZoomInOut", "E");
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1620 END

function add_highlight(p_location_id, p_pog_code, p_pog_module, p_CusPogCode) { //ASA-1303////ASA-1348 changed parameter names p_
    try {
        logDebug("function : add_highlight location_id: " + p_location_id, "S");
        var final_pog_code = p_pog_code.substring(0, 4); //ASA-1303
        document.querySelectorAll('svg').forEach(svgpath => { //ASA-1348
            svgpath.querySelectorAll('g').forEach(gpath => { //ASA-1348
                // var j = 0;
                var newpath,
                    newpathC,
                    newpathT;
                gpath.querySelectorAll('path').forEach(path => {
                    if (path.getAttribute('Location_ID') !== null) {
                        if (path.getAttribute('Location_ID') == (p_location_id).toUpperCase()) {
                            path.setAttribute('style', 'fill: red');
                            var pathbox = path.getBBox();
                            var Bwidth = pathbox.width > pathbox.height ? pathbox.width : pathbox.height;
                            newpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                            newpath.setAttributeNS(null, "id", "Harrow");
                            newpath.setAttributeNS(null, "d", "M100 20 L80 100 L103 80 L125 100 Z");
                            newpath.setAttributeNS(null, "stroke", "black");
                            newpath.setAttributeNS(null, "stroke-width", 1);
                            //newpath.setAttributeNS(null, "transform", 'translate(' + (pathbox.x - Bwidth - 15) + ',' + (pathbox.y + (pathbox.width > pathbox.height ? 0 : Bwidth)) + ')');
                            newpath.setAttributeNS(null, "transform", 'translate(' + (pathbox.x + (Bwidth / 2) - 105) + ',' + (pathbox.y + (pathbox.width > pathbox.height ? 0 : Bwidth) - 10) + ')'); //ASA-1303

                            newpathC = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                            newpathC.setAttributeNS(null, "id", "Hcircle");
                            newpathC.setAttributeNS(null, "cx", (pathbox.x + (Bwidth / 2)));
                            newpathC.setAttributeNS(null, "cy", pathbox.y + (pathbox.width > pathbox.height ? 0 : Bwidth) + 150);
                            newpathC.setAttributeNS(null, "r", 50);
                            newpathC.setAttributeNS(null, "fill", "red");

                            newpathT = document.createElementNS("http://www.w3.org/2000/svg", "text");
                            if (p_CusPogCode == 'Y') {
                                newpathT.textContent = final_pog_code + p_pog_module; //ASA-1303
                            } else {
                                newpathT.textContent = (p_location_id).toUpperCase();
                            }
                            newpathT.setAttributeNS(null, "id", "Htext");
                            newpathT.setAttributeNS(null, "x", (pathbox.x + (Bwidth / 2)));
                            newpathT.setAttributeNS(null, "y", pathbox.y + (pathbox.width > pathbox.height ? 0 : Bwidth) + 150);
                            newpathT.setAttributeNS(null, "text-anchor", "middle");
                            newpathT.setAttributeNS(null, "font-size", "2vh");
                            newpathT.setAttributeNS(null, "font-family", "Arial");
                            newpathT.setAttributeNS(null, "font-weight", "bold");
                            newpathT.setAttributeNS(null, "fill", "yellow");
                            newpathT.setAttributeNS(null, "dy", ".5em");
                            //Start ASA-1348
                            gpath.prepend(newpath);
                            gpath.prepend(newpathT);
                            gpath.prepend(newpathC);
                            /*$('svg g#' + g_id).prepend(newpath);
                            ins++;
                            $('svg g#' + g_id).prepend(newpathT);
                            ins++;
                            $('svg g#' + g_id).prepend(newpathC);*/
                            // End ASA-1348
                        }
                    }
                    // j++;
                })
                // i++;
            });
        });
        logDebug("function : add_highlight location_id: " + p_location_id, "E");
    } catch (err) {
        error_handling(err);
    }
}

async function auto_align_peg_items(p_pog_index, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor) {
    var valid = "Y";
    var i = 0;
    for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
        if (valid == "N") {
            break;
        }
        if (Modules.ParentModule == null) {
            var j = 0;
            for (const Shelf of Modules.ShelfInfo) {
                if (valid == "N") {
                    break;
                }
                var shelf_top = Shelf.Y + Shelf.H / 2;
                var shelf_bottom = Shelf.Y - Shelf.H / 2;
                var shelf_start = Shelf.X - Shelf.W / 2;
                var shelf_end = Shelf.X + Shelf.W / 2;
                if (Shelf.ObjType == "PEGBOARD") {
                    var k = 0;
                    var need_correct = "Y";
                    for (const items of Shelf.ItemInfo) {
                        if (items.Y + items.H / 2 > shelf_top || items.Y + items.H / 2 < shelf_bottom || items.X - items.W / 2 > shelf_end) {
                            need_correct = "Y";
                            break;
                        }
                    }
                    if (need_correct == "Y") {
                        var k = 0;
                        var old_item_info = JSON.parse(JSON.stringify(Shelf.ItemInfo));

                        var items_list = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].AutoPlacing = "N";

                        for (const items of items_list) {
                            items.LocID = items.LocID !== "" ? parseInt(items.LocID) : "";
                        }

                        var sorto = {
                            LocID: "asc",
                        };
                        items_list.keySort(sorto);

                        if (items_list.length > 1) {
                            k = 0;
                            for (const items of items_list) {
                                var closest = get_closest_peg(items.H, i, j, shelf_top - items.H / 2, p_pog_index);
                                var shelfY = closest - items.H / 2;
                                items.FromProductList = "Y";
                                items.Y = shelfY;
                                items.Exists = "N";
                                items.Edited = "N";
                                k++;
                            }

                            var high_y = 0;
                            k = 0;
                            var items_list = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                            for (const items of items_list) {
                                if (k == 0) {
                                    high_y = items.Y + items.H / 2;
                                }
                                if (high_y < items.Y + items.H / 2) {
                                    high_y = items.Y + items.H / 2;
                                }
                                k++;
                            }
                            k = 0;
                            var items_list = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                            var sorto = {
                                LocID: "asc",
                            };
                            items_list.keySort(sorto);

                            for (const items of items_list) {
                                items.Y = high_y - items.H / 2;
                            }
                            var sum_width = 0;
                            var items_list = Shelf.ItemInfo;
                            var k = 0;
                            for (const items of items_list) {
                                sum_width += items.W;
                                k++;
                            }
                            var loc_start = Shelf.X - Shelf.W / 2 - sum_width / 2;
                            var k = 0;
                            for (const items of items_list) {
                                items.X = loc_start + items.W / 2 + Shelf.HorizSpacing;
                                loc_start += items.W + Shelf.HorizSpacing;
                                k++;
                            }
                            if (reorder_items(i, j, p_pog_index)) {
                                k = 0;
                                var spread_gap = Shelf.HorizGap;
                                var horiz_gap = spread_gap;
                                var spread_product = Shelf.SpreadItem;
                                var items_list = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                                var sorto = {
                                    LocID: "asc",
                                };
                                items_list.keySort(sorto);
                                console.log("items_list", items_list);
                                for (const items of items_list) {
                                    console.log("items before", items.Item, items.LocID, items.X, items.Y);
                                    new_x = get_item_xaxis(items.W, items.H, items.D, items.CType, -1, horiz_gap, spread_product, spread_gap, i, j, k, "Y", items_list.length, "N", p_pog_index);
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].X = new_x;
                                    k++;
                                }
                            }
                            if (valid == "Y") {
                                for (const items of Shelf.ItemInfo) {
                                    g_world.remove(g_world.getObjectById(items.ObjID));
                                    items.LocID = items.LocID !== "" ? parseInt(items.LocID) : "";
                                }
                                if (reorder_items(i, j, p_pog_index)) {
                                    var return_val = await recreate_pegboard_items(i, j, Shelf.ObjType, "N", -1, -1, items_list.length, "Y", "N", -1, -1, 1, "", p_pog_index, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor);

                                    for (const items of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                        items.FromProductList = "N";
                                        items.Exists = "E";
                                        items.Edited = "N";
                                        k++;
                                    }
                                    if (g_show_live_image == "Y") {
                                        //animate_all_pog();
                                        animate_pog(p_pog_index);//ASA-1491 issue 2
                                    }
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
                j++;
            }
        }
        i++;
    }
    render(p_pog_index);
}

async function recreate_pegboard_items(p_module_index, p_shelf_index, p_shelf_obj_type, p_edit_ind, p_locationX, p_edit_item_index, p_item_length, p_fresh_item, p_shelf_edit, p_redoX, p_items_list, p_create_canvas, p_calc_supply, p_pog_index, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_delistDftColor) {
    logDebug("function : recreate_all_items; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; shelf_obj_type : " + p_shelf_obj_type + "; p_edit_ind : " + p_edit_ind + "; locationX : " + p_locationX + "; edit_item_index : " + p_edit_item_index + "; item_length : " + p_item_length + "; shelf_edit : " + p_shelf_edit + "; redoX : " + p_redoX + "; create_canvas : " + p_create_canvas, "S");
    try {
        g_world = g_scene_objects[p_pog_index].scene.children[2];
        var imageFlag = g_show_live_image;
        var spread_gap = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].HorizGap;
        var horiz_gap = spread_gap;
        var spread_product = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem;
        var shelf_start_X = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2;
        var shelf_start_Y = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2;
        var total_item_width = 0,
            items_arr = [];
        var finalX = 0;

        var i = 0;
        for (const items of items_arr) {
            var selectedObject = g_world.getObjectById(items.ObjID);
            g_world.remove(selectedObject);
            total_item_width += items.W;
            i++;
        }

        var i = 0;
        var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
        for (const items of items_arr) {
            finalX = get_item_xaxis(items.W, items.H, items.D, p_shelf_obj_type, p_locationX, horiz_gap, spread_product, spread_gap, p_module_index, p_shelf_index, i, p_edit_ind, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length, p_shelf_edit, p_pog_index);

            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].Distance = finalX - items.W / 2 - shelf_start_X;
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "PEGBOARD") {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].PegBoardX = finalX - items.W / 2 - shelf_start_X;
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].PegBoardY = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].Y - items.H / 2 - shelf_start_Y;
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].FromProductList = "N";
            }
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].OldObjID = items.ObjID;
            var old_obj_id = items.ObjID;
            if (imageFlag == "Y" && items.Item !== "DIVIDER" && items_arr[i].MerchStyle != 3) {
                var details = g_orientation_json[g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].Orientation];
                var details_arr = details.split("###");
                var objID = await add_items_with_image(items.ItemID, items.W, items.H, items.D, items.Color, finalX, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].Y, "", p_module_index, p_shelf_index, i, items.BHoriz, items.BVert, items.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", p_fresh_item, p_merchStyle, p_loadImgFrom, p_buid, p_itemNumLblColor, p_itemNumLblPos, p_dispItemInfo, p_pog_index);
            } else {
                var objID = await add_items_prom(items.ItemID, items.W, items.H, items.D, items.Color, finalX, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].Y, "", p_module_index, p_shelf_index, i, "N", p_fresh_item, p_delistDftColor, p_itemNumLblColor, p_dispItemInfo, p_itemNumLblColor, p_itemNumLblPos, p_pog_index);
            }
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "PEGBOARD") {
                g_final_z = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Z + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 2 + items.D / 2;
            }

            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].X = finalX;
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].Z = g_final_z;
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].ObjID = objID;
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].CType = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType;

            i = i + 1;
        }

        if (g_show_live_image == "Y") {
            animate_pog(p_pog_index);
        }
        logDebug("function : recreate_all_items", "E");
        return finalX;
    } catch (err) {
        console.log("err", err);
        error_handling(err);
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