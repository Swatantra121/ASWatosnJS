
function get_new_orientation_dim(p_orientation, p_item_width, p_item_height, p_item_depth) {
    try {
        logDebug("function : get_new_orientation_dim; orientation : " + p_orientation + "; item_width : " + p_item_width + "; item_height : " + p_item_height + "; item_depth : " + p_item_depth, "S");
        width_final = height_final = depth_final = 0;
        if (p_orientation == "1" || p_orientation == "3" || p_orientation == "13" || p_orientation == "15") {
            var new_width = p_item_width;
            var new_height = p_item_height;
            height_final = new_width;
            width_final = new_height;
            depth_final = p_item_depth;
            var heightVar = "W";
            var widthVar = "H";
            var depthVar = "D";
        } else if (p_orientation == "4" || p_orientation == "6" || p_orientation == "16" || p_orientation == "18") {
            var new_depth = p_item_depth;
            var new_height = p_item_height;
            width_final = p_item_width;
            height_final = new_depth;
            depth_final = new_height;
            var heightVar = "D";
            var widthVar = "W";
            var depthVar = "H";
        } else if (p_orientation == "5" || p_orientation == "7" || p_orientation == "17" || p_orientation == "19") {
            var new_depth = p_item_depth;
            var new_height = p_item_height;
            var new_width = p_item_width;
            height_final = new_width;
            width_final = new_depth;
            depth_final = new_height;
            var heightVar = "W";
            var widthVar = "D";
            var depthVar = "H";
        } else if (p_orientation == "8" || p_orientation == "10" || p_orientation == "20" || p_orientation == "22") {
            var new_depth = p_item_depth;
            var new_width = p_item_width;
            width_final = new_depth;
            height_final = p_item_height;
            depth_final = new_width;
            var heightVar = "H";
            var widthVar = "D";
            var depthVar = "W";
        } else if (p_orientation == "9" || p_orientation == "11" || p_orientation == "21" || p_orientation == "23") {
            var new_depth = p_item_depth;
            var new_height = p_item_height;
            var new_width = p_item_width;
            width_final = new_height;
            height_final = new_depth;
            depth_final = new_width;
            var heightVar = "D";
            var widthVar = "H";
            var depthVar = "W";
        } else {
            width_final = p_item_width;
            height_final = p_item_height;
            depth_final = p_item_depth;
            var heightVar = "H";
            var widthVar = "W";
            var depthVar = "D";
        }
        logDebug("function : get_new_orientation_dim", "E");
        return [width_final, height_final, depth_final, heightVar, widthVar, depthVar];
    } catch (err) {
        error_handling(err);
    }
}


//This function is used when on off show live image or create PDF with item image.
async function recreate_image_items(p_show_live_ind, p_merchStyle, p_load_img_from, p_bu_id, p_item_num_lbl_color, p_item_num_lbl_pos, p_display_item_info, p_delist_item_dft_color, p_notch_head, p_pog_index, p_days_of_supply_show = "Y", p_daysofsuppFontSize = "N,0.018", p_itemDtlList) {
    logDebug("function : recreate_image_items; show_live_ind : " + p_show_live_ind, "S");
    try {
        console.log("live image called");
        g_world = g_scene_objects[p_pog_index].scene.children[2]; //ASA-1702
        var l = 0;
        var mod_arr = g_pog_json[p_pog_index].ModuleInfo;
        for (const modules of mod_arr) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                if (modules.ShelfInfo.length > 0) {
                    j = 0;
                    for (const shelfs of modules.ShelfInfo) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            x = 0;
                            for (const items of shelfs.ItemInfo) {
                                if (items.Item !== "DIVIDER") {
                                    //first remove the item object from world and then create it again.
                                    var selectedObject = g_world.getObjectById(items.ObjID);
                                    g_world.remove(selectedObject);
                                    if (p_show_live_ind == "Y" && items.MerchStyle != 3) {
                                        var details = g_orientation_json[items.Orientation];
                                        var details_arr = details.split("###");
                                        var objID = await add_items_with_image(items.ItemID, items.W, items.H, items.D, items.Color, items.X, items.Y, items.Z, l, j, x, items.BHoriz, items.BVert, items.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", "N", p_merchStyle, p_load_img_from, p_bu_id, p_item_num_lbl_color, p_item_num_lbl_pos, p_display_item_info, p_pog_index);
                                    } else {
                                        var objID = await add_items_prom(items.ItemID, items.W, items.H, items.D, items.Color, items.X, items.Y, items.Z, l, j, x, "N", "N", p_delist_item_dft_color, p_item_num_lbl_color, p_display_item_info, p_item_num_lbl_color, p_item_num_lbl_pos, p_pog_index);
                                    }
                                    g_pog_json[p_pog_index].ModuleInfo[l].ShelfInfo[j].ItemInfo[x].ObjID = objID;
                                    //below code is setting borders based on the condition. that means it will have different color.
                                    if (p_show_live_ind == "N") {
                                        var selectedObject = g_world.getObjectById(objID);
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
                                            if (nvl(items.OOSPerc) > 80 && g_pogcr_enbl_oos_border == "Y") {
                                                //ASA-1688
                                                selectedObject.BorderColour = g_pogcr_oos_border_color; //ASA-1688 Added to give blue border to item
                                                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                                            } else {
                                                selectedObject.BorderColour = 0x000000;
                                            }
                                        }
                                    } else {
                                        if (items.DimUpdate == "E") {
                                            selectedObject.BorderColour = g_dim_error_color;
                                        } else if (items.Status == "N" && typeof selectedObject !== "undefined") {
                                            selectedObject.BorderColour = g_status_error_color;
                                            selectedObject.Status = "N";
                                        } else if (nvl(items.MovingItem) == "No" && g_pogcr_auto_hlite_non_mv_item == "Y" && nvl(selectedObject) !== 0) {
                                            selectedObject.BorderColour = g_nonMovingItemColor;
                                            selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                                        } else {
                                            if (nvl(items.OOSPerc) > 80 && g_pogcr_enbl_oos_border == "Y") {
                                                selectedObject.BorderColour = g_pogcr_oos_border_color; //ASA-1688 Added to give blue border to item
                                                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                                            } else {
                                                selectedObject.BorderColour = 0x000000;
                                            }
                                            if (typeof selectedObject !== "undefined") {
                                                selectedObject.BorderColour = 0x000000;
                                            }
                                        }
                                    }
                                }
                                x++;
                            }
                            //the items which are stacked on top of another will have to be set the position y and x accordingly in this function.
                            if (shelfs.ObjType == "SHELF" || shelfs.ObjType == "PALLET") {
                                var returnval = reset_top_bottom_objects(l, j, "N", p_pog_index);
                            }
                        } else if (shelfs.TextImg !== "" && typeof shelfs.TextImg !== "undefined" && shelfs.ObjType == "TEXTBOX" && shelfs.TextImg !== null) {
                            //Text box also can have images saved in table. so expected is to show item in text box also when click live image.
                            var colorValue = parseInt(shelfs.Color.replace("#", "0x"), 16);
                            var hex_decimal = new THREE.Color(colorValue);
                            if (shelfs.Color.charAt(1) == "#" && shelfs.ObjType == "TEXTBOX") {
                                var bg_color = null;
                            } else {
                                var bg_color = colorValue;
                            }
                            if (p_show_live_ind == "Y" && shelfs.TextImg !== "" && typeof shelfs.TextImg !== "undefined" && shelfs.TextImg !== null) {
                                var return_val = await add_text_box_with_image(shelfs.Shelf, "TEXTBOX", shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfs.Z, "Y", l, shelfs.InputText, bg_color, shelfs.WrapText, shelfs.ReduceToFit, shelfs.Color, j, shelfs.Rotation, shelfs.Slope, "N", shelfs.FStyle, shelfs.FSize, shelfs.FBold, p_notch_head, p_pog_index);
                            } else {
                                g_dblclick_objid = shelfs.SObjID;
                                g_shelf_index = j;
                                var return_val = add_text_box(shelfs.Shelf, "TEXTBOX", shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfs.Z, "Y", l, shelfs.InputText, bg_color, shelfs.WrapText, shelfs.ReduceToFit, shelfs.Color, j, shelfs.Rotation, shelfs.Slope, "N", shelfs.FStyle, shelfs.FSize, shelfs.FBold, 2, p_pog_index, g_pogcr_enhance_textbox_fontsize, shelfs.TextDirection);
                            }
                            var child_module_index = -1;
                            var l_mod_cnt = 0;
                            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                                if (modules.ParentModule !== null) {
                                    if (modules.Module == shelfs.Shelf) {
                                        child_module_index = l_mod_cnt;
                                    }
                                }
                                l_mod_cnt++;
                            }

                            if (child_module_index !== -1) {
                                g_pog_json[p_pog_index].ModuleInfo[child_module_index].ObjID = return_val;
                            }
                        }
                        j = j + 1;
                    }
                }
                //Carpark items should also have item image on as per below.
                if (typeof modules.Carpark[0] !== "undefined") {
                    if (modules.Carpark[0].ItemInfo.length > 0) {
                        k = 0;
                        for (const items of modules.Carpark[0].ItemInfo) {
                            var selectedObject = g_world.getObjectById(items.ObjID);
                            g_world.remove(selectedObject);

                            var details = g_orientation_json[items.Orientation];
                            var details_arr = details.split("###");

                            var objID = await add_carpark_item(items.ItemID, items.W, items.H, items.D, items.Color, items.X, items.Y, items.Z, l, 0, k, "Y", "N", p_show_live_ind, parseInt(details_arr[1]), p_pog_index);
                            g_pog_json[p_pog_index].ModuleInfo[l].Carpark[0].ItemInfo[k].ObjID = objID;
                            k = k + 1;
                        }
                    }
                }
            }
            l = l + 1;
        }
        //if days of supply is On, we need to add that label again.
        if (p_days_of_supply_show == "Y") {
            await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", p_pog_index, "Y", "N", p_daysofsuppFontSize, p_itemDtlList);
        }
        // $(".supply_days").removeClass("item_label_active");
        // g_show_days_of_supply = "N";
        logDebug("function : recreate_image_items", "E");
    } catch (err) {
        error_handling(err);
    }
}

//Below function is used when items are stacked on one another, this function will set the x and y accordingly so that. items are placed on top and set new ID references.
function reset_top_bottom_objects(p_module_index, p_shelf_index, p_reset_obj, p_pog_index) {
    logDebug("function : reset_top_bottom_objects; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; reset_obj : " + p_reset_obj, "S");
    try {
        if (typeof g_pog_json[p_pog_index] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[p_module_index] !== "undefined") {
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
            return new Promise(function (resolve, reject) {
                if (typeof shelfdtl !== "undefined") {
                    var item_Details = shelfdtl.ItemInfo;
                    var l_item_x_arr = [];
                    p = 0;
                    var shelf_top = shelfdtl.Y + shelfdtl.H / 2;
                    //remove the old object ID's as items are recreated and ID would be changed.
                    for (const items of item_Details) {
                        shelfdtl.ItemInfo[p].BottomObjID = "";
                        shelfdtl.ItemInfo[p].TopObjID = "";
                        p = p + 1;
                    }
                    var m = 0;
                    for (const items of item_Details) {
                        var top_bottom = "N";
                        var item_start = wpdSetFixed(items.X - items.W / 2);
                        var item_end = wpdSetFixed(items.X + items.W / 2);
                        p = 0;
                        //find the current object is a item on top on another item.
                        for (const fitems of item_Details) {
                            if (wpdSetFixed(fitems.X) == wpdSetFixed(items.X) && l_item_x_arr.indexOf(wpdSetFixed(items.X)) == -1 && m !== p) {
                                l_item_x_arr.push(wpdSetFixed(items.X));
                                top_bottom = "Y";
                                break;
                            }
                            p = p + 1;
                        }
                        if (top_bottom == "Y") {
                            var index_arr = [];
                            p = 0;
                            //find the Y position of bottom item and list of items in the same Y.
                            for (const fitems of item_Details) {
                                //ASA-2010 Issue1 Start
                                // if (wpdSetFixed(fitems.X) == wpdSetFixed(items.X) || (wpdSetFixed(fitems.X) > item_start && wpdSetFixed(fitems.X) < item_end)) {
                                if (shelfdtl.ObjType !== "PALLET"
                                    ? (
                                        wpdSetFixed(fitems.X) == wpdSetFixed(items.X) ||
                                        (wpdSetFixed(fitems.X) > item_start && wpdSetFixed(fitems.X) < item_end)
                                    )
                                    : (
                                        (
                                            wpdSetFixed(fitems.X) == wpdSetFixed(items.X) ||
                                            (wpdSetFixed(fitems.X) > item_start && wpdSetFixed(fitems.X) < item_end)
                                        ) &&
                                        wpdSetFixed(fitems.Z) == wpdSetFixed(items.Z)
                                    )
                                ) {
                                    //ASA-2010 Issue1 End
                                    var details = {};
                                    details["Y"] = fitems.Y;
                                    details["Index"] = p;
                                    index_arr.push(details);
                                }
                                p = p + 1;
                            }
                            var sorto = {
                                Y: "asc",
                            };
                            index_arr.keySort(sorto);
                            p = 0;
                            //this loop will set the Y and objID of the bottom and top items, so that it can be used in further processing.
                            for (const index of index_arr) {
                                if (p == 0) {
                                    shelfdtl.ItemInfo[index_arr[p].Index].Y = shelf_top + shelfdtl.ItemInfo[index_arr[p].Index].H / 2;
                                }
                                if (typeof index_arr[p + 1] !== "undefined") {
                                    if (typeof shelfdtl.ItemInfo[index_arr[p + 1].Index] !== "undefined") {
                                        shelfdtl.ItemInfo[index_arr[p + 1].Index].Y = shelfdtl.ItemInfo[index_arr[p].Index].Y + shelfdtl.ItemInfo[index_arr[p].Index].H / 2 + shelfdtl.ItemInfo[index_arr[p + 1].Index].H / 2;
                                        shelfdtl.ItemInfo[index_arr[p + 1].Index].BottomObjID = shelfdtl.ItemInfo[index_arr[p].Index].ObjID;
                                        shelfdtl.ItemInfo[index_arr[p].Index].TopObjID = shelfdtl.ItemInfo[index_arr[p + 1].Index].ObjID;

                                        total_height = get_y_distance(p_module_index, p_shelf_index, index_arr[p + 1].Index, shelfdtl.ItemInfo[index_arr[p + 1].Index].X, shelfdtl.ItemInfo[index_arr[p + 1].Index].Y, p_pog_index);
                                        shelfdtl.ItemInfo[index_arr[p + 1].Index].TotalHeight = total_height;
                                        // var selectObjects = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfdtl.ItemInfo[index_arr[p + 1].Index].ObjID);
                                        // if (typeof selectObjects !== "undefined") {
                                        //     selectObjects.position.set(shelfdtl.ItemInfo[index_arr[p].Index].X, shelfdtl.ItemInfo[index_arr[p + 1].Index].Y, 0.001 + shelfdtl.D / 1000);
                                        // }
                                        if (p_reset_obj == "Y") {
                                            //setting the position of item object according to calculated value.
                                            var selectObjects = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfdtl.ItemInfo[index_arr[p + 1].Index].ObjID);
                                            if (typeof selectObjects !== "undefined") {
                                                selectObjects.position.set(shelfdtl.ItemInfo[index_arr[p].Index].X, shelfdtl.ItemInfo[index_arr[p + 1].Index].Y, 0.001 + shelfdtl.D / 1000);
                                                if (shelfdtl.ObjType == "PEGBOARD") {
                                                    selectObjects.position.z = 0.016;
                                                } else {
                                                    //ASA-2010 Issue1 Start
                                                    // if (shelfdtl.ObjType == "PALLET") {
                                                    //     selectObjects.position.z = 0.001 + shelfdtl.D / 1000 + shelfdtl.ItemInfo[index_arr[p + 1].Index].D / 2;
                                                    // } else {
                                                    //     selectObjects.position.z = 0.001 + shelfdtl.D / 1000;
                                                    // }
                                                    if (shelfdtl.ObjType !== "PALLET") {
                                                        selectObjects.position.z = 0.001 + shelfdtl.D / 1000;
                                                    }
                                                    //ASA-2010 Issue1 End
                                                }
                                            }
                                        }
                                    }
                                }
                                p = p + 1;
                            }
                        }
                        m = m + 1;
                    }
                }
                resolve("SUCCES");
                logDebug("function : reset_top_bottom_objects", "E");
            });
        }
    } catch (err) {
        error_handling(err);
    }
}


async function add_items_with_image(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_horiz_facing, p_vert_facing, p_item_code, p_item_type, p_angle, p_recreate, p_fresh_item, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index) {
    logDebug("function : add_items_with_image; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; horiz_facing : " + p_horiz_facing + "; vert_facing : " + p_vert_facing + "; item_code : " + p_item_code + "; item_type : " + p_item_type + "; angle : " + p_angle + "; recreate : " + p_recreate, "S");
    try {
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var itemdepth = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].D;
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "SHELF" || g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "HANGINGBAR") {
            shelfdtl.AvlSpace = wpdSetFixed(shelfdtl.AvlSpace - p_width); //.toFixed(3));
        }
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "ROD") {
            shelfdtl.AvlSpace = wpdSetFixed(shelfdtl.D - itemdepth); //.toFixed(3));
        }
        var spread_product = shelfdtl.SpreadItem; //Prasanna get spread product if combine, because first shelf in combine would be different.
        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
        if (currCombinationIndex !== -1) {
            spread_product = g_combinedShelfs[currCombinationIndex].SpreadItem;
        }
        p_vert_facing = parseInt(p_vert_facing); //ASA-1273 -- temporary fix. need to remove once found out where string is being passed to this function.
        var item_info = shelfdtl.ItemInfo[p_item_index];
        var cap_merch = item_info.CapMerch;
        var cap_orient = item_info.CapOrientaion;
        var cap_detail_arr = []; //Regression issue 20240510
        var cap_details = g_orientation_json[cap_orient];
        if (typeof cap_details !== "undefined") {
            //TASK-25959 Kush added DUE TO AFTER MASS UPDATE WE NEED CAPHEIGHT TO BE ADDED
            cap_detail_arr = cap_details.split("###"); //Regression issue 20240510
            var object = g_world.getObjectById(item_info.ObjID);
            g_world.remove(object);
        }

        var item_orientation = item_info.Orientation;
        var details = g_orientation_json[item_orientation];
        var cap_style = item_info.CapStyle;
        //ASA-1970 Start
        var horiz_facing = item_info.BHoriz;
        if (item_info.CrushHoriz > 0 && horiz_facing > 1 && spread_product == "F" && item_info.Orientation == "0") { //ASA-2045 Issue6 & Issue7
            p_width = item_info.RW * (1 - item_info.CrushHoriz / 100) + item_info.SpreadItem * (horiz_facing - 1);
        }
        //ASA-1970 End
        var [org_width, org_height, org_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(item_info.Orientation, item_info.OW, item_info.OH, item_info.OD, org_width, org_height, org_depth, item_info.Item);
        if (item_info.CrushHoriz > 0  && item_info.Orientation == "0") { //ASA-2045 Issue6 & Issue7
            org_width = item_info.W / item_info.BHoriz;
        }
        if (item_info.CrushVert > 0  && item_info.Orientation == "0") { //ASA-2045 Issue6 & Issue7
            // org_height = item_info.RH / item_info.BVert; //ASA-1410 issue 13
            org_height = item_info.H / item_info.BVert; //ASA-1933 Issue1
        }
        //ASA-2045 Issue6 & Issue7 Start
        if (item_info.Orientation !== "0") {
            if (actualWidth == "H" && item_info.CrushVert > 0) {
                org_width = item_info.W / item_info.BHoriz;
            }
            if (actualHeight == "W" && item_info.CrushHoriz > 0) {
                org_height = item_info.H / item_info.BVert;
            }
        }
        //ASA-2045 Issue6 & Issue7 End
        var details_arr = details.split("###");
        var pegID = item_info.PegID;

        return new Promise(function (resolve, reject) {
            var item_info = shelfdtl.ItemInfo[p_item_index];
            var nesting_val = item_info.NVal;
            var rotation = shelfdtl.Rotation;
            var slope = shelfdtl.Slope;
            var merch_style = item_info.MerchStyle;
            if (p_merchStyle == "0") {
                merch_style = "U";
            } else if (p_merchStyle == "1") {
                merch_style = "T";
            } else if (p_merchStyle == "2") {
                merch_style = "C";
            } else if (p_merchStyle == "3") {
                merch_style = "D";
            }
            var img_exists = "N";
            var cap_index = -1;
            var img_index = -1;
            if (p_pogcrLoadImgFrom == "DB") {
                var j = 0;
                for (const images_arr of g_ItemImages) {
                    if (p_item_code == images_arr.Item && details_arr[0] == images_arr.Orientation && images_arr.ItemImage !== null && images_arr.MerchStyle == item_info.MerchStyle) {
                        img_exists = "Y";
                        img_index = j;
                        break; //return false;
                    }
                    j++;
                }
                var j = 0;
                for (const images_arr of g_ItemImages) {
                    if (p_item_code == images_arr.Item && cap_detail_arr[0] == images_arr.Orientation && images_arr.ItemImage !== null && images_arr.MerchStyle == cap_merch) {
                        cap_index = j;
                        break; //return false;
                    }
                    j++;
                }
            } else {
                img_exists = "Y";
            }

            if (img_exists == "Y") {
                // Set image source
                if (p_pogcrLoadImgFrom == "DB") {
                    // Create an image
                    var image = new Image(); // or document.createElement('img' );
                    // Create texture
                    var tex = new THREE.Texture(image);
                    tex.format = THREE.RGBAFormat;
                    // On image load, update texture
                    image.onload = () => {
                        tex.needsUpdate = true;
                    };
                    image.src = "data:image/jpeg;base64," + g_ItemImages[img_index].ItemImage;

                    if (cap_index !== -1) {
                        var image_cap = new Image(); // or document.createElement('img' );
                        // Create texture
                        var texture_cap = new THREE.Texture(image_cap);
                        texture_cap.format = THREE.RGBAFormat;
                        // On image load, update texture
                        image_cap.onload = () => {
                            texture_cap.needsUpdate = true;
                        };
                        image_cap.src = "data:image/jpeg;base64," + g_ItemImages[cap_index].ItemImage;
                        var material_cap = new THREE.MeshStandardMaterial({
                            map: texture_cap,
                        });
                    }
                } else {
                    console.log("Wrong Parameter value for pogcrLoadImgFrom", p_pogcrLoadImgFrom);
                }

                if (rotation !== 0 || slope !== 0) {
                    var geometry = new THREE.BoxBufferGeometry(p_width, p_height, p_depth);
                    var material = new THREE.MeshBasicMaterial({
                        map: tex,
                        transparent: true,
                    });
                    if (nesting_val == 0) {
                        tex.wrapS = THREE.RepeatWrapping;
                        tex.wrapT = THREE.RepeatWrapping;
                        if (p_angle == 90 || p_angle == 270) {
                            tex.repeat.set(p_vert_facing, p_horiz_facing);
                        } else {
                            tex.repeat.set(p_horiz_facing, p_vert_facing);
                        }
                        if (p_angle == 90) {
                            p_angle = 270;
                        } else if (p_angle == 270) {
                            p_angle = 90;
                        }
                        tex.rotation = (p_angle * Math.PI) / 180;
                    }
                    var items = new THREE.Mesh(geometry, material); //to make it standard

                    var selectedObject = g_world.getObjectById(shelfdtl.SObjID);
                    if (p_recreate == "N") {
                        p_x = wpdSetFixed(0 - (shelfdtl.W / 2 - p_width / 2 - item_info.Distance));
                        p_y = wpdSetFixed(shelfdtl.H / 2 + p_height / 2);
                        p_z = wpdSetFixed(shelfdtl.D / 2 - p_depth / 2);

                        item_info.RotationX = p_x;
                        item_info.RotationY = p_y;
                        item_info.RotationZ = p_z;
                    }

                    items.applyMatrix4(new THREE.Matrix4().makeTranslation(p_x, p_y, p_z));

                    g_scene.updateMatrixWorld();
                    items.matrixAutoUpdate = false;
                    if (typeof selectedObject !== "undefined") {
                        items.applyMatrix4(selectedObject.matrix);
                    }
                } else {
                    var geometry = new THREE.BoxGeometry(p_width, p_height, 0.001);
                    var material = new THREE.MeshStandardMaterial({
                        map: tex,
                    });
                    if (spread_product == "F") {
                        var colorValue = parseInt(p_color.replace("#", "0x"), 16);
                        var hex_decimal = new THREE.Color(colorValue);
                        var items = new THREE.Mesh( //added var to make it standard
                            new THREE.BoxGeometry(p_width, p_height, 0.001),
                            new THREE.MeshBasicMaterial({
                                color: hex_decimal,
                                transparent: true,
                                opacity: 0,
                            })
                        );
                        if (nesting_val == 0 && cap_style == "0") {
                            if (p_angle == 90 || p_angle == 270) {
                                tex.repeat.set(p_vert_facing, 1);
                            } else {
                                tex.repeat.set(1, p_vert_facing);
                            }
                        }
                        tex.wrapS = THREE.RepeatWrapping;
                        tex.wrapT = THREE.RepeatWrapping;
                        if (p_angle == 90) {
                            p_angle = 270;
                        } else if (p_angle == 270) {
                            p_angle = 90;
                        }
                        tex.rotation = (p_angle * Math.PI) / 180;
                        var img_item = [];
                        var next_start = 0;
                        var item_info = item_info;
                        var spread = item_info.SpreadItem;
                        if (cap_style == "0") {
                            for (k = 0; k < p_horiz_facing; k++) {
                                if (p_vert_facing > 1) {
                                    var geometry1 = new THREE.BoxGeometry(org_width, p_height, 0.001);
                                } else {
                                    var geometry1 = new THREE.BoxGeometry(org_width, org_height, 0.001);
                                }
                                img_item.push(new THREE.Mesh(geometry1, material));
                                items.add(img_item[img_item.length - 1]);
                                if (k == 0) {
                                    //ASA-1970 Issue2 Start
                                    // next_start = -(item_info.W / 2) + org_width + spread;
                                    // img_item[0].position.x = -(item_info.W / 2) + org_width / 2;
                                    next_start = -((item_info.CrushHoriz > 0 ? p_width : item_info.W) / 2) + org_width + spread;
                                    img_item[0].position.x = -((item_info.CrushHoriz > 0 ? p_width : item_info.W) / 2) + org_width / 2;
                                    //ASA-1970 Issue2 End
                                } else {
                                    img_item[k].position.x = next_start + org_width / 2;
                                    next_start = next_start + org_width + spread;
                                }
                            }
                        } else {
                            var vert_loop = p_vert_facing + item_info.CapCount;
                            var vert_start = 0;
                            var item_depth = item_info.OD;
                            var capHeight = item_info.CapHeight; //ASA-1170
                            console.log(item_info.CapHeight, capHeight);
                            var vert_facing_cnt = p_vert_facing;
                            var new_z = 0.001;
                            var child_uuid = "facings";
                            for (p = 0; p < vert_loop; p++) {
                                var next_start = 0;
                                var new_y = -1;
                                if (p == 0) {
                                    vert_start = -(item_info.H / 2) + org_height;
                                    new_y = -(item_info.H / 2) + org_height / 2;
                                    vert_facing_cnt = vert_facing_cnt - 1;
                                } else {
                                    if (vert_facing_cnt > 0) {
                                        new_y = vert_start + org_height / 2;
                                        vert_start = vert_start + org_height;
                                        vert_facing_cnt = vert_facing_cnt - 1;
                                        child_uuid = "facings";
                                    } else {
                                        var calc_height = vert_start + capHeight; //item_depth;
                                        new_y = calc_height - org_height / 2;
                                        vert_start = calc_height;
                                        new_z = new_z - 0.00001;
                                        child_uuid = "cap";
                                    }
                                }
                                for (k = 0; k < p_horiz_facing; k++) {
                                    var geometry1 = new THREE.BoxGeometry(org_width, org_height, 0.001);

                                    img_item.push(new THREE.Mesh(geometry1, material));
                                    img_item[img_item.length - 1].uuid = child_uuid;
                                    items.add(img_item[img_item.length - 1]);
                                    if (k == 0) {
                                        next_start = -(item_info.W / 2) + org_width + spread;
                                        img_item[img_item.length - 1].position.x = -(item_info.W / 2) + org_width / 2;
                                    } else {
                                        img_item[img_item.length - 1].position.x = next_start + org_width / 2;
                                        next_start = next_start + org_width + spread;
                                    }
                                    img_item[img_item.length - 1].position.y = new_y;
                                    //img_item[img_item.length - 1].position.z = new_z; //ASA-1766 Task 2
                                }
                            }
                        }
                    } else {
                        if (nesting_val == 0 && cap_style == "0") {
                            if (p_angle == 90 || p_angle == 270) {
                                tex.repeat.set(p_vert_facing, p_horiz_facing);
                            } else {
                                tex.repeat.set(p_horiz_facing, p_vert_facing);
                            }
                        }
                        tex.wrapS = THREE.RepeatWrapping;
                        tex.wrapT = THREE.RepeatWrapping;
                        if (p_angle == 90) {
                            p_angle = 270;
                        } else if (p_angle == 270) {
                            p_angle = 90;
                        }
                        tex.rotation = (p_angle * Math.PI) / 180;

                        if (cap_style == "0") {
                            items = new THREE.Mesh(geometry, material);
                        } else {
                            var colorValue = parseInt(p_color.replace("#", "0x"), 16);
                            var hex_decimal = new THREE.Color(colorValue);
                            items = new THREE.Mesh(
                                new THREE.BoxGeometry(p_width, p_height, 0.001),
                                new THREE.MeshBasicMaterial({
                                    color: hex_decimal,
                                    transparent: false, //true,
                                    opacity: 1, //0,
                                })
                            );
                            var img_item = [];
                            var next_start = 0;
                            var item_info = item_info;
                            var vert_loop = p_vert_facing + item_info.CapCount;
                            var vert_start = 0;
                            var item_depth = item_info.OD;
                            var capHeight = item_info.CapHeight; //ASA-1170
                            var vert_facing_cnt = p_vert_facing;
                            var new_z = 0.001;
                            var child_uuid = "facings";
                            for (p = 0; p < vert_loop; p++) {
                                var next_start = 0;
                                var new_y = -1;
                                if (p == 0) {
                                    vert_start = -(item_info.H / 2) + org_height;
                                    new_y = -(item_info.H / 2) + org_height / 2;
                                    vert_facing_cnt = vert_facing_cnt - 1;
                                } else {
                                    if (vert_facing_cnt > 0) {
                                        new_y = vert_start + org_height / 2;
                                        vert_start = vert_start + org_height;
                                        vert_facing_cnt = vert_facing_cnt - 1;
                                        child_uuid = "facings";
                                    } else {
                                        var calc_height = vert_start + capHeight; //item_depth;
                                        new_y = calc_height - capHeight / 2;
                                        vert_start = calc_height;
                                        new_z = new_z - 0.00001;
                                        child_uuid = "cap";
                                    }
                                }

                                for (k = 0; k < p_horiz_facing; k++) {
                                    var new_mat;
                                    if (p < p_vert_facing) {
                                        var geometry1 = new THREE.BoxGeometry(org_width, org_height, 0.001);
                                        new_mat = material;
                                    } else {
                                        var geometry1 = new THREE.BoxGeometry(org_width, capHeight, 0.001);
                                        if (cap_index !== -1) {
                                            texture_cap.wrapS = THREE.RepeatWrapping;
                                            texture_cap.wrapT = THREE.RepeatWrapping;
                                            p_angle = cap_detail_arr[1];
                                            if (cap_detail_arr[1] == 90) {
                                                p_angle = 270;
                                            } else if (cap_detail_arr[1] == 270) {
                                                p_angle = 90;
                                            }
                                            texture_cap.rotation = (p_angle * Math.PI) / 180;
                                        }
                                        new_mat = cap_index !== -1 ? material_cap : material;
                                    }
                                    img_item.push(new THREE.Mesh(geometry1, new_mat));
                                    img_item[img_item.length - 1].uuid = child_uuid;
                                    items.add(img_item[img_item.length - 1]);
                                    if (k == 0) {
                                        next_start = -(item_info.W / 2) + org_width;
                                        img_item[img_item.length - 1].position.x = -(item_info.W / 2) + org_width / 2;
                                    } else {
                                        img_item[img_item.length - 1].position.x = next_start + org_width / 2;
                                        next_start = next_start + org_width;
                                    }
                                    img_item[img_item.length - 1].position.y = new_y;
                                    //img_item[img_item.length - 1].position.z = new_z; //ASA-1766 Task 2
                                }
                            }
                        }
                    }

                    items.position.x = p_x;
                    if (shelfdtl.ObjType == "PEGBOARD" || isShelfOnPegboard(shelfdtl.X, shelfdtl.Y, p_module_index, p_pog_index, shelfdtl, g_pog_json)) {
                        //ASA-1769 Issue 3
                        items.position.z = 0.016;
                    } else if (shelfdtl.ObjType == "PALLET") {
                        items.position.z = 0.001 + shelfdtl.D / 1000 - item_info.Z / 1000;
                    } else {
                        items.position.z = 0.001 + shelfdtl.D / 1000; // ASA- 1573 Issue 1 (0.001) 0.005,ASA- 1608 Issue 1
                    }
                    items.position.y = p_y;
                }
                material.transparent = true;
                items.uuid = p_uuid;
                g_world.add(items);
                var l_wireframe_id = add_wireframe(items, 2);
                items.WFrameID = l_wireframe_id;
                items.WireframeObj.material.transparent = true;
                items.WireframeObj.material.opacity = 0.0025;
                var return_val = update_item_label(p_module_index, p_shelf_index, p_item_index, items, g_show_item_label, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, "N"); //Bug-26122 - splitting the chest
                //ASA 1847.4 Issue 2 Start
                if (g_item_vertical_text_display === "Y") {
                    var new_camera = get_canvas_camera("LABEL");
                    var retval = show_single_item_desc(p_module_index, p_shelf_index, p_item_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index], items, g_camera, p_pogcrItemLabelColor, p_pogcrDisplayItemInfo, p_pog_index);
                }
                //ASA 1847.4 Issue 2 End               
                items.ImageExists = "Y";
            } else {
                var colorValue = parseInt(p_color.replace("#", "0x"), 16);
                var hex_decimal = new THREE.Color(colorValue);
                if (rotation !== 0 || slope !== 0) {
                    var items = new THREE.Mesh( //added var to make it standard
                        new THREE.BoxGeometry(p_width, p_height, p_depth),
                        new THREE.MeshBasicMaterial({
                            color: hex_decimal,
                        })
                    );

                    var selectedObject = g_world.getObjectById(shelfdtl.SObjID);

                    if (p_recreate == "N") {
                        p_x = wpdSetFixed(0 - (shelfdtl.W / 2 - p_width / 2 - item_info.Distance));
                        p_y = wpdSetFixed(shelfdtl.H / 2 + p_height / 2);
                        p_z = wpdSetFixed(shelfdtl.D / 2 - p_depth / 2);

                        item_info.RotationX = p_x;
                        item_info.RotationY = p_y;
                        item_info.RotationZ = p_z;
                    }

                    items.applyMatrix4(new THREE.Matrix4().makeTranslation(p_x, p_y, p_z));
                    g_scene.updateMatrixWorld();
                    items.matrixAutoUpdate = false;
                    if (typeof selectedObject !== "undefined") {
                        items.applyMatrix4(selectedObject.matrix);
                    }
                } else {
                    if (spread_product == "F" && p_horiz_facing > 1) {
                        var items = new THREE.Mesh( //added var to make it standard
                            new THREE.BoxGeometry(p_width, p_height, 0.001),
                            new THREE.MeshBasicMaterial({
                                color: hex_decimal,
                                transparent: true,
                                opacity: 0,
                            })
                        );
                        var img_item = [];
                        var next_start = 0;
                        var material = new THREE.MeshStandardMaterial({
                            color: hex_decimal,
                        });
                        var item_info = item_info;
                        var spread = item_info.SpreadItem; // / (horiz_facing - 1) : item_info.SpreadItem;
                        for (k = 0; k < p_horiz_facing; k++) {
                            var final_width = (final_height = 0);
                            if (p_vert_facing > 1 || cap_style !== "0") {
                                var geometry1 = new THREE.BoxGeometry(org_width, p_height, 0.001);
                                final_width = org_width;
                                final_height = p_height;
                            } else {
                                var geometry1 = new THREE.BoxGeometry(org_width, org_height, 0.001);
                                final_width = org_width;
                                final_height = org_height;
                            }
                            img_item.push(new THREE.Mesh(geometry1, material));
                            var l_wireframe_id = add_wireframe(img_item[img_item.length - 1], 2);
                            add_item_borders(p_module_index, p_shelf_index, p_item_index, img_item[img_item.length - 1], final_width, final_height, 1, p_pog_index, "N"); //Bug-26122 - splitting the chest
                            items.add(img_item[img_item.length - 1]);
                            if (k == 0) {
                                //ASA-1970 Start
                                // next_start = -(item_info.W / 2) + org_width + spread;
                                // img_item[0].position.x = -(item_info.W / 2) + org_width / 2;
                                next_start = -((item_info.CrushHoriz > 0 ? p_width : item_info.W) / 2) + org_width + spread;
                                img_item[0].position.x = -((item_info.CrushHoriz > 0 ? p_width : item_info.W) / 2) + org_width / 2;
                                //ASA-1970 End
                            } else {
                                img_item[k].position.x = next_start + org_width / 2;
                                next_start = next_start + org_width + spread;
                            }
                        }
                    } else {
                        var items = new THREE.Mesh( //using local variable
                            new THREE.BoxGeometry(p_width, p_height, 0.001),
                            new THREE.MeshStandardMaterial({
                                color: hex_decimal,
                            })
                        );
                    }

                    items.position.x = p_x;
                    if (shelfdtl.ObjType == "PEGBOARD" || isShelfOnPegboard(shelfdtl.X, shelfdtl.Y, p_module_index, p_pog_index, shelfdtl, g_pog_json)) {
                        //ASA-1769 Issue 3
                        items.position.z = 0.016;
                    } else if (shelfdtl.ObjType == "PALLET") {
                        items.position.z = 0.001 + shelfdtl.D / 1000 - item_info.Z / 1000;
                    } else {
                        items.position.z = 0.001 + shelfdtl.D / 1000; // ASA- 1573 Issue 1 (0.001), ASA- 1608 Issue 1
                    }
                    items.position.y = p_y;
                }
                items.uuid = p_uuid;

                shelfdtl.AvlSpace = wpdSetFixed(shelfdtl.AvlSpace - p_width); //.toFixed(3));

                var l_wireframe_id = add_wireframe(items, 2);
                items.WFrameID = l_wireframe_id;
                g_world.add(items);
                if (spread_product !== "F" || (spread_product == "F" && p_horiz_facing == 1)) {
                    add_item_borders(p_module_index, p_shelf_index, p_item_index, items, p_width, p_height, -1, p_pog_index, "N"); //Bug-26122 - splitting the chest
                }
                var return_val = update_item_label(p_module_index, p_shelf_index, p_item_index, items, g_show_item_label, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, "N"); //Bug-26122 - splitting the chest
                var new_camera = get_canvas_camera("LABEL");
                var retval = show_single_item_desc(p_module_index, p_shelf_index, p_item_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index], items, g_camera, p_pogcrItemLabelColor, p_pogcrDisplayItemInfo, p_pog_index);
                items.ImageExists = "N";
            }
            var item_info = item_info;
            items.ItemID = item_info.Item;
            items.Description = item_info.Desc;
            items.HorizFacing = item_info.BHoriz;
            items.VertFacing = item_info.BVert;
            items.DFacing = item_info.BaseD;
            items.ClassName = item_info.ClassName;
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
            items.StoreSOH = item_info.StoreSOH; //ASA-1182 ASA-1277-(3)
            items.DPPLoc = item_info.DPPLoc; //ASA-1308 Task-3
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
            items.BrandType = item_info.BrandType; //ASA-1113
            items.Group = item_info.Group;
            items.Dept = item_info.Dept;
            items.Class = item_info.Class;
            items.SubClass = item_info.SubClass;
            items.StdUOM = item_info.StdUOM;
            items.SizeDesc = item_info.SizeDesc;
            items.Supplier = item_info.Supplier;
            items.SupplierName = item_info.SupplierName;
            items.LocID = item_info.LocID;
            items.Supplier = item_info.Supplier;
            items.ItemDim = g_msg_h + ": " + (item_info.OH * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushVert + ")" + " " + g_msg_w + ": " + (item_info.OW * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushHoriz + ")" + " " + g_msg_d + ": " + (item_info.OD * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushD + ")"; //ASA-1407 Task 1-E ,//ASA-1407 issue 5
            items.OrientationDesc = item_info.OrientationDesc;
            items.StoreCnt = item_info.StoreCnt;
            items.RotationDegree = rotation;
            items.OW = item_info.OW * 100;
            items.OH = item_info.OH * 100;
            items.OD = item_info.OD * 100;
            items.CrushW = item_info.CrushHoriz; //ASA-1758
            items.CrushH = item_info.CrushVert; //ASA-1758
            items.CrushD = item_info.CrushD; //ASA-1758
            items.Shelf = shelfdtl.Shelf;
            items.Rotation = 0;
            items.ItemSlope = 0;
            items.UnitperCase = item_info.UnitperCase;
            items.UnitperTray = item_info.UnitperTray;
            items.DescSecond = item_info.DescSecond;
            items.DfacingUpd = item_info.DfacingUpd;
            items.ItmDescChi = item_info.ItmDescChi; //ASA-1407 Task 1,//ASA-1407 issue 5
            items.ItmDescEng = item_info.ItmDescEng; //ASA-1273 Prasanna
            //items.ItmDescEng = items.Brand + " " + items.Desc + " " + items.SizeDesc;
            items.TotalUnitsCalc = item_info.BHoriz * item_info.BVert * item_info.BaseD;
            items.PkSiz = item_info.PkSiz;
            items.CapFacing = item_info.CapFacing; //ASA-1341
            items.CapDepth = item_info.CapDepth; //ASA-1341
            items.CapHorz = item_info.CapHorz; //ASA-1341
            var cap_capacity = item_info.CapFacing * item_info.CapDepth * item_info.CapHorz; //ASA-1273 Prasanna
            items.Cpct = item_info.BHoriz * item_info.BVert * item_info.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0);
            items.Brand_Category = item_info.Brand_Category; //ASA-1158-S
            items.Uda_item_status = item_info.Uda_item_status;
            items.Gobecobrand = item_info.Gobecobrand;
            items.Internet = item_info.Internet; //ASA-1158-E
            items.Categ = item_info.Categ;
            if (typeof item_info.SizeDesc !== "undefined" && item_info.SizeDesc !== "") {
                ////Regression issue 10
                var det_arr = item_info.SizeDesc.split("*");
            } else {
                var det_arr = "";
            }

            items.GoGreen = item_info.GoGreen;
            items.ItemSize = item_info.ItemSize;
            items.SplrLbl = item_info.SplrLbl;
            items.COO = item_info.COO;
            items.EDLP = item_info.EDLP;
            items.LoGrp = item_info.LoGrp;
            items.SqzPer = (typeof item_info.CrushHoriz !== "undefined" ? item_info.CrushHoriz : 0) + ":" + (typeof item_info.CrushVert !== "undefined" ? item_info.CrushVert : 0) + ":" + (typeof item_info.CrushD !== "undefined" ? item_info.CrushD : 0);
            items.InternationalRng = item_info.InternationalRng;
            items.NewItem = item_info.NewItem; //ASA-1182
            items.LiveNewItem = item_info.LiveNewItem; //ASA-1250
            items.DaysOfSupply = item_info.DaysOfSupply;
            items.CapDepthChanged = item_info.CapDepthChanged; //ASA-1273
            items.Orientation = item_info.Orientation; //ASA-1289
            items.MassCrushH = item_info.MassCrushH; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
            items.MassCrushV = item_info.MassCrushV; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
            items.MassCrushD = item_info.MassCrushD; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
            items.UDA751 = item_info.UDA751; //ASA-1407 Task 1 -S
            items.UDA755 = item_info.UDA755; //ASA-1407 Task 1 -E
            items.MPogDepthFacings = item_info.MPogDepthFacings; //ASA-1408
            items.MPogHorizFacings = item_info.MPogHorizFacings; //ASA-1408
            items.MPogVertFacings = item_info.MPogVertFacings; //ASA-1408
            items.Status = item_info.Status; //ASA-1407 issue 5
            items.MerchStyle = item_info.MerchStyle; //ASA-1605
            items.CapMerch = item_info.CapMerch; //ASA-1605
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
            items.RotationFlag = rotation !== 0 || slope !== 0 ? "Y" : "N";

            // 1902 Available space should be calculated
            if (shelfdtl.ObjType == "SHELF") {
                var k = 0;
                var sum_width = 0;
                for (const items of shelfdtl.ItemInfo) {
                    sum_width += items.W;
                    k++;
                }
                if (shelfdtl.SpreadItem !== "E") {
                    var horizGap = shelfdtl.HorizGap ? shelfdtl.HorizGap : 0;
                    var horizGapSpace = (k > 1) ? horizGap * (k - 1) : 0;
                    sum_width += horizGapSpace;
                }
                shelfdtl.AvlSpace = wpdSetFixed((shelfdtl.W - sum_width) * 100); //.toFixed(3));
                var shelfObj = g_world.getObjectById(shelfdtl.SObjID);
                if (typeof shelfObj !== "undefined" && shelfdtl.ObjType == "SHELF") {
                    shelfObj.AvlSpace = shelfdtl.AvlSpace;
                }
            }
            //ASA-1970 Start
            //ASA-1946
            // if (shelfdtl.SpreadItem == "F" && shelfdtl.ItemInfo?.length == 1 && (shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR")) {
            //     var itemWidth = shelfdtl.ItemInfo[0]?.CrushHoriz > 0 ? shelfdtl.ItemInfo[0]?.W : shelfdtl.ItemInfo[0]?.RW;  //ASA-1946 Issue1
            // 	shelfdtl.AvlSpace = wpdSetFixed((shelfdtl.W - itemWidth) * 100);
            // 	if (typeof shelfObj !== "undefined" && shelfdtl.ObjType == "SHELF") {
            // 		shelfObj.AvlSpace = shelfdtl.AvlSpace;
            // 	}
            // }
            if (shelfdtl.SpreadItem == "F" && (shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR")) {
                var itemWidth = 0;
                for (const item of shelfdtl.ItemInfo) {
                    // itemWidth += item?.RW;
                    itemWidth += item?.CrushHoriz > 0 ? item?.W : item?.RW;
                }
                shelfdtl.AvlSpace = wpdSetFixed((shelfdtl.W - itemWidth) * 100);
                if (typeof shelfObj !== "undefined" && shelfdtl.ObjType == "SHELF") {
                    shelfObj.AvlSpace = shelfdtl.AvlSpace;
                }
            }
            //ASA-1970 End
            var selectedObject = g_world.getObjectById(items.id);
            if (items.DimUpdate == "E" && typeof items.DimUpdate !== "undefined") {
                selectedObject.BorderColour = g_dim_error_color;
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else if (nvl(items.Status) == "N") {
                selectedObject.BorderColour = g_status_error_color;
                selectedObject.Status = "N";
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else if (nvl(items.MovingItem) == "No" && g_pogcr_auto_hlite_non_mv_item == "Y") {
                selectedObject.BorderColour = g_nonMovingItemColor;
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else {
                if (nvl(items.OOSPerc) > 80 && g_pogcr_enbl_oos_border == "Y") {
                    selectedObject.BorderColour = g_pogcr_oos_border_color; //ASA-1688 Added to give blue border to item
                    selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                } else {
                    selectedObject.BorderColour = 0x000000;
                }
            }

            var selectedObject = g_world.getObjectById(items.id);
            var objectType = shelfdtl.ObjType;
            if (typeof pegID !== "undefined" || pegID !== "") {
                if (g_show_peg_tags == "Y" && (objectType == "HANGINGBAR" || objectType == "PEGBOARD")) {
                    var res = show_pegTages("N", item_info, selectedObject, p_module_index, p_shelf_index, p_item_index, p_pog_index); //code adde by yograj to show pegtages
                }
            }
            render(p_pog_index);
            logDebug("function : add_items_with_image", "E");
            resolve(items.id);
        });
    } catch (err) {
        logDebug("function : add_items_with_image", "E");
        error_handling(err);
    }
}

async function add_items_prom(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_recreate, p_fresh_item, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index) {
    logDebug("function : add_items_prom; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; recreate : " + p_recreate);
    try {
        /*if (typeof p_pog_index == "undefined") {
        p_pog_index = 0;
        }*/
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var spread_product = shelfdtl.SpreadItem; //Prasanna get spread product if combine, because first shelf in combine would be different.
        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
        if (currCombinationIndex !== -1) {
            spread_product = g_combinedShelfs[currCombinationIndex].SpreadItem;
        }
        p_color = typeof p_color == "undefined" ? "#FFFFFF" : p_color; //ASA-1450
        objType = shelfdtl.ObjType;

        var items = shelfdtl.ItemInfo[p_item_index];
        var pegID = items.PegID;
        var pegHeadRoom = items.pegHeadRoom;
        var horiz_facing = items.BHoriz;
        var vert_facing = items.BVert;
        var cap_style = items.CapStyle;

        //ASA-1970 Start
        if (items.CrushHoriz > 0 && horiz_facing > 1 && spread_product == "F" && items.Orientation == "0") { //ASA-2045 Issue6 & Issue7
            p_width = items.RW * (1 - items.CrushHoriz / 100) + items.SpreadItem * (horiz_facing - 1);
        }
        //ASA-1970 End

        if (items.Delist == "Y") {
            //ASA-696
            p_color = p_pogcrDelistItemDftColor;
            items.Color = p_pogcrDelistItemDftColor;
        }
        var [org_width, org_height, org_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.OW, items.OH, items.OD);
        if (items.CrushHoriz > 0 && items.Orientation == "0") { //ASA-2045 Issue6 & Issue7
            org_width = items.W / items.BHoriz;
        }
        if (items.CrushVert > 0 && items.Orientation == "0") { //ASA-2045 Issue6 & Issue7
            org_height = items.H / items.BVert;
        }
        //ASA-2045 Issue6 & Issue7 Start
        if (items.Orientation !== "0") {
            if (actualWidth == "H" && items.CrushVert > 0) {
                org_width = items.W / items.BHoriz;
            }
            if (actualHeight == "W" && items.CrushHoriz > 0) {
                org_height = items.H / items.BVert;
            }
        }
        //ASA-2045 Issue6 & Issue7 End
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

        //var org_height = (height / vert_facing) - (spread * (vert_facing - 1));
        //var org_width = (width / horiz_facing) - (spread * (horiz_facing - 1));
        //var horiz_facing = shelfdtl.ItemInfo[i_item_index].BHoriz;
        if (pegID !== "" && typeof pegHeadRoom !== "undefined" && g_show_peg_tags == "Y") {
            if (objType == "HANGINGBAR" || objType == "PEGBOARD") {
                p_height = p_height + pegHeadRoom / 100;
                pegHeadRoom = pegHeadRoom / 2;
                p_y = p_y + pegHeadRoom / 100;
                // };
            }
        }
        return new Promise(function (resolve, reject) {
            var colorValue = parseInt(p_color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            var rotation = shelfdtl.Rotation;
            var slope = shelfdtl.Slope;
            if (rotation !== 0 || slope !== 0) {
                items = new THREE.Mesh(
                    new THREE.BoxGeometry(p_width, p_height, p_depth),
                    new THREE.MeshStandardMaterial({
                        color: hex_decimal,
                    })
                );

                if (shelfdtl.ItemInfo[p_item_index].Rotation !== 0 && shelfdtl.ItemInfo[p_item_index].Item == "DIVIDER") {
                    items.rotateY((shelfdtl.ItemInfo[p_item_index].Rotation * Math.PI) / 180);
                }
                //items.rotateX(slope * Math.PI / 180);
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfdtl.SObjID);
                if (p_recreate == "N") {
                    if (shelfdtl.ObjType == "PEGBOARD") {
                        p_x = 0 - shelfdtl.W / 2 + (shelfdtl.ItemInfo[p_item_index].PegBoardX + p_width / 2);
                        p_y = 0 - shelfdtl.H / 2 + (shelfdtl.ItemInfo[p_item_index].PegBoardY + p_height / 2);
                        p_z = 0.01 + p_depth / 2;
                    } else {
                        p_x = wpdSetFixed(0 - (shelfdtl.W / 2 - p_width / 2 - shelfdtl.ItemInfo[p_item_index].Distance));
                        p_y = wpdSetFixed(shelfdtl.H / 2 + p_height / 2);
                        p_z = wpdSetFixed(shelfdtl.D / 2 - p_depth / 2);
                    }
                    shelfdtl.ItemInfo[p_item_index].RotationX = p_x;
                    shelfdtl.ItemInfo[p_item_index].RotationY = p_y;
                    shelfdtl.ItemInfo[p_item_index].RotationZ = p_z;
                }

                items.applyMatrix4(new THREE.Matrix4().makeTranslation(p_x, p_y, p_z));
                // apply transforms of mesh on top
                g_scene.updateMatrixWorld();
                items.matrixAutoUpdate = false;
                items.applyMatrix4(selectedObject.matrix);
                //items.matrixWorldNeedsUpdate = true;
                g_scene_objects[p_pog_index].scene.children[2].add(items);
                //selectedObject.add(items);
                selectedObject.updateMatrix();
                var rotate_vector = new THREE.Vector3();
                rotate_vector.setFromMatrixPosition(items.matrixWorld);

                items.geometry.computeBoundingBox();
                var bounding_box = items.geometry.boundingBox;
                var box = new THREE.Box3().setFromObject(items);
                var box_dim = box.getSize(new THREE.Vector3());

                shelfdtl.ItemInfo[p_item_index].RotationWidth = parseFloat(box_dim.x);
                shelfdtl.ItemInfo[p_item_index].RotationHeight = parseFloat(box_dim.y);
                shelfdtl.ItemInfo[p_item_index].RotationDepth = parseFloat(box_dim.z);

                shelfdtl.ItemInfo[p_item_index].ItemRotateWorldX = rotate_vector.x;
                shelfdtl.ItemInfo[p_item_index].ItemRotateWorldY = rotate_vector.y;
                shelfdtl.ItemInfo[p_item_index].ItemRotateWorldZ = rotate_vector.z;
            } else {
                if (shelfdtl.ItemInfo[p_item_index].Rotation !== 0 && shelfdtl.ItemInfo[p_item_index].Item == "DIVIDER") {
                    items = new THREE.Mesh(
                        new THREE.BoxGeometry(p_width, p_height, p_depth),
                        new THREE.MeshStandardMaterial({
                            color: hex_decimal,
                        })
                    );
                    items.rotateY((shelfdtl.ItemInfo[p_item_index].Rotation * Math.PI) / 180);
                    items.position.z = p_z + shelfdtl.D / 1000;
                } else {
                    if (spread_product == "F" && horiz_facing > 1) {
                        items = new THREE.Mesh(
                            new THREE.BoxGeometry(p_width, p_height, 0.001),
                            new THREE.MeshBasicMaterial({
                                color: hex_decimal,
                                transparent: true,
                                opacity: 0,
                            })
                        );

                        var img_item = [];
                        var next_start = 0;
                        var material = new THREE.MeshStandardMaterial({
                            color: hex_decimal,
                        });
                        var item_info = shelfdtl.ItemInfo[p_item_index];
                        var spread = item_info.SpreadItem; // (horiz_facing - 1) : item_info.SpreadItem;
                        for (k = 0; k < horiz_facing; k++) {
                            var final_width = (final_height = 0);
                            if (vert_facing > 1 || cap_style !== "0") {
                                var geometry1 = new THREE.BoxGeometry(org_width, p_height, 0.001);
                                final_width = org_width;
                                final_height = p_height;
                            } else {
                                var geometry1 = new THREE.BoxGeometry(org_width, org_height, 0.001);
                                final_width = org_width;
                                final_height = org_height;
                            }
                            img_item.push(new THREE.Mesh(geometry1, material));
                            img_item[img_item.length - 1].uuid = "horiz_facing";

                            var l_wireframe_id = add_wireframe(img_item[img_item.length - 1], 2);
                            add_item_borders(p_module_index, p_shelf_index, p_item_index, img_item[img_item.length - 1], final_width, final_height, 1, p_pog_index, "N"); //Bug-26122 - splitting the chest
                            items.add(img_item[img_item.length - 1]);
                            if (k == 0) {
                                //ASA-1970 Start
                                // next_start = -(item_info.W / 2) + org_width + spread;
                                // img_item[0].position.x = -(item_info.W / 2) + org_width / 2;
                                next_start = -((item_info.CrushHoriz > 0 ? p_width : item_info.W) / 2) + org_width + spread;
                                img_item[0].position.x = -((item_info.CrushHoriz > 0 ? p_width : item_info.W) / 2) + org_width / 2;
                                //ASA-1970 End
                            } else {
                                img_item[k].position.x = next_start + org_width / 2;
                                next_start = next_start + org_width + spread;
                            }
                        }
                    } else {
                        items = new THREE.Mesh(
                            new THREE.BoxGeometry(p_width, p_height, 0.001),
                            new THREE.MeshStandardMaterial({
                                color: hex_decimal,
                            })
                        );
                    }
                    if (shelfdtl.ObjType == "PEGBOARD" || isShelfOnPegboard(shelfdtl.X, shelfdtl.Y, p_module_index, p_pog_index, shelfdtl, g_pog_json)) {
                        //ASA-1769 Issue 3
                        items.position.z = 0.016;
                    } else if (shelfdtl.ObjType == "PALLET") {
                        items.position.z = 0.001 + shelfdtl.D / 1000 - shelfdtl.ItemInfo[p_item_index].Z / 1000;
                    } else {
                        items.position.z = 0.001 + shelfdtl.D / 1000; // ASA- 1573 Issue 1 (0.001),ASA- 1608 Issue 1
                    }
                }
                items.position.x = p_x;
                items.position.y = p_y;
                g_world.add(items);
            }

            items.uuid = p_uuid;
            var item_info = shelfdtl.ItemInfo[p_item_index];
            items.ItemID = item_info.Item;
            items.Description = item_info.Desc;
            items.HorizFacing = item_info.BHoriz;
            items.VertFacing = item_info.BVert;
            items.DFacing = item_info.BaseD;
            items.ClassName = item_info.ClassName;
            items.DimUpdate = item_info.DimUpdate;
            items.SellingPrice = item_info.SellingPrice;
            items.SalesUnit = item_info.SalesUnit;
            items.NetSales = item_info.NetSales;
            items.CogsAdj = item_info.CogsAdj;
            items.GrossProfit = item_info.GrossProfit;
            items.WeeksCount = item_info.WeeksCount;
            items.MovingItem = item_info.MovingItem;
            items.RegMovement = item_info.RegMovement;
            items.AvgSales = item_info.AvgSales;
            items.ItemStatus = item_info.ItemStatus;
            items.CDTLvl1 = item_info.CDTLvl1; //ASA-1130
            items.CDTLvl2 = item_info.CDTLvl2; //ASA-1130
            items.CDTLvl3 = item_info.CDTLvl3; //ASA-1130
            items.ActualDPP = item_info.ActualDPP; //ASA-1182 ASA-1277-(3)
            items.StoreSOH = item_info.StoreSOH; //ASA-1182 ASA-1277-(3)
            items.DPPLoc = item_info.DPPLoc; //ASA-1308 Task-3
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
            items.Profit = item_info.Profit;
            items.TotalMargin = item_info.TotalMargin;
            items.W = item_info.W;
            items.H = item_info.H;
            items.D = item_info.D;
            items.Color = item_info.Color;
            items.Barcode = item_info.Barcode;
            items.Desc = item_info.Desc;
            items.Brand = item_info.Brand;
            items.BrandType = item_info.BrandType; //ASA-1113
            items.Group = item_info.Group;
            items.Dept = item_info.Dept;
            items.Class = item_info.Class;
            items.SubClass = item_info.SubClass;
            items.StdUOM = item_info.StdUOM;
            items.SizeDesc = item_info.SizeDesc;
            items.Supplier = item_info.Supplier;
            items.SupplierName = item_info.SupplierName;
            items.LocID = item_info.LocID;
            items.ClassName = item_info.ClassName;
            items.ItemDim = g_msg_h + ": " + (item_info.OH * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushVert + ")" + " " + g_msg_w + ": " + (item_info.OW * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushHoriz + ")" + " " + g_msg_d + ": " + (item_info.OD * 100).toFixed(2) + " (" + g_msg_Sq + " : " + item_info.CrushD + ")"; //ASA-1407 Task 1-E ,//ASA-1407 issue 5
            items.OrientationDesc = item_info.OrientationDesc;
            items.Orientation = item_info.Orientation; //ASA-1289
            items.StoreCnt = item_info.StoreCnt;
            items.RotationDegree = rotation;
            items.OW = item_info.OW * 100;
            items.OH = item_info.OH * 100;
            items.OD = item_info.OD * 100;
            items.CrushW = item_info.CrushHoriz; //ASA-1758
            items.CrushH = item_info.CrushVert; //ASA-1758
            items.CrushD = item_info.CrushD; //ASA-1758
            items.DescSecond = item_info.DescSecond;
            items.Shelf = shelfdtl.Shelf;
            items.Rotation = 0;
            items.ItemSlope = 0;
            items.RotationFlag = rotation !== 0 || slope !== 0 ? "Y" : "N";
            items.ImageExists = "N";
            items.UnitperCase = item_info.UnitperCase;
            items.UnitperTray = item_info.UnitperTray;
            items.DfacingUpd = item_info.DfacingUpd;
            items.ItmDescChi = item_info.ItmDescChi; //ASA-1407 Task 1,//ASA-1407 issue 5
            items.ItmDescEng = item_info.ItmDescEng; //ASA-1273 Prasanna
            //items.ItmDescEng = items.Brand + " " + items.Desc + " " + items.SizeDesc;
            items.TotalUnitsCalc = item_info.BHoriz * item_info.BVert * item_info.BaseD;
            items.PkSiz = item_info.PkSiz;
            items.CapFacing = item_info.CapFacing;
            items.CapDepth = item_info.CapDepth;
            items.CapHorz = item_info.CapHorz;
            var cap_capacity = item_info.CapFacing * item_info.CapDepth * item_info.CapHorz; //ASA-1273 Prasanna
            items.Cpct = item_info.BHoriz * item_info.BVert * item_info.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0);
            items.Brand_Category = item_info.Brand_Category; //ASA-1158-S
            items.Uda_item_status = item_info.Uda_item_status;
            items.Gobecobrand = item_info.Gobecobrand;
            items.Internet = item_info.Internet; //ASA-1158-E
            items.GoGreen = item_info.GoGreen;
            items.Categ = item_info.Categ;
            if (typeof item_info.SizeDesc !== "undefined" && item_info.SizeDesc !== "") {
                //Regression issue 10
                var det_arr = item_info.SizeDesc.split("*");
            } else {
                var det_arr = "";
            }

            items.ItemSize = item_info.ItemSize;
            items.SplrLbl = item_info.SplrLbl;
            items.COO = item_info.COO;
            items.EDLP = item_info.EDLP;
            items.LoGrp = item_info.LoGrp;
            items.SqzPer = (typeof item_info.CrushHoriz !== "undefined" ? item_info.CrushHoriz : 0) + ":" + (typeof item_info.CrushVert !== "undefined" ? item_info.CrushVert : 0) + ":" + (typeof item_info.CrushD !== "undefined" ? item_info.CrushD : 0);
            items.InternationalRng = item_info.InternationalRng;
            items.NewItem = item_info.NewItem; //ASA-1182
            items.LiveNewItem = item_info.LiveNewItem; //ASA-1250
            items.DaysOfSupply = item_info.DaysOfSupply;
            items.CapDepthChanged = item_info.CapDepthChanged; //ASA-1273
            items.MassCrushH = item_info.MassCrushH; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
            items.MassCrushV = item_info.MassCrushV; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
            items.MassCrushD = item_info.MassCrushD; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
            items.UDA751 = item_info.UDA751; //ASA-1407 Task 1 -S
            items.UDA755 = item_info.UDA755; //ASA-1407 Task 1 -E
            items.MPogDepthFacings = item_info.MPogDepthFacings; //ASA-1408
            items.MPogHorizFacings = item_info.MPogHorizFacings; //ASA-1408
            items.MPogVertFacings = item_info.MPogVertFacings; //ASA-1408
            items.Status = item_info.Status; //ASA-1407 issue 5
            items.MerchStyle = item_info.MerchStyle; //ASA-1605
            items.CapMerch = item_info.CapMerch; //ASA-1605
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

            // 1902 Available space should be calculated
            if (shelfdtl.ObjType == "SHELF" || (shelfdtl.ObjType == "HANGINGBAR" && p_fresh_item == "Y")) {
                var k = 0;
                var sum_width = 0;
                for (const items of shelfdtl.ItemInfo) {
                    sum_width += items.W;
                    k++;
                }
                if (shelfdtl.SpreadItem !== "E") {
                    var horizGap = shelfdtl.HorizGap ? shelfdtl.HorizGap : 0;
                    var horizGapSpace = (k > 1) ? horizGap * (k - 1) : 0;
                    sum_width += horizGapSpace;
                }
                shelfdtl.AvlSpace = wpdSetFixed((shelfdtl.W - sum_width) * 100); //.toFixed(3));
                var shelfObj = g_world.getObjectById(shelfdtl.SObjID);
                if (typeof shelfObj !== "undefined" && shelfdtl.ObjType == "SHELF") {
                    shelfObj.AvlSpace = shelfdtl.AvlSpace;
                }
            }
            //ASA-1970 Start
            //ASA-1946
            // if (shelfdtl.SpreadItem == "F" && shelfdtl.ItemInfo?.length == 1 && (shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR")) {
            //     var itemWidth = shelfdtl.ItemInfo[0]?.CrushHoriz > 0 ? shelfdtl.ItemInfo[0]?.W : shelfdtl.ItemInfo[0]?.RW;  //ASA-1946 Issue1
            // 	shelfdtl.AvlSpace = wpdSetFixed((shelfdtl.W - itemWidth) * 100);
            // 	if (typeof shelfObj !== "undefined" && shelfdtl.ObjType == "SHELF") {
            // 		shelfObj.AvlSpace = shelfdtl.AvlSpace;
            // 	}
            // }
            if (shelfdtl.SpreadItem == "F" && (shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR")) {
                var itemWidth = 0;
                for (const item of shelfdtl.ItemInfo) {
                    // itemWidth += item?.RW;
                    itemWidth += item?.CrushHoriz > 0 ? item?.W : item?.RW;
                }
                shelfdtl.AvlSpace = wpdSetFixed((shelfdtl.W - itemWidth) * 100);
                if (typeof shelfObj !== "undefined" && shelfdtl.ObjType == "SHELF") {
                    shelfObj.AvlSpace = shelfdtl.AvlSpace;
                }
            }
            //ASA-1970 End
            if (shelfdtl.ObjType == "ROD" && p_fresh_item == "Y") {
                shelfdtl.AvlSpace = wpdSetFixed(shelfdtl.D - item_info.D); //.toFixed(3));
                var shelfObj = g_world.getObjectById(shelfdtl.SObjID);
                if (typeof shelfObj !== "undefined" && shelfdtl.ObjType == "ROD") {
                    shelfObj.AvlSpace = shelfdtl.AvlSpace;
                }
            }

            var return_val = update_item_label(p_module_index, p_shelf_index, p_item_index, items, g_show_item_label, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index, "N"); //Bug-26122 - splitting the chest

            var l_wireframe_id = add_wireframe(items, 2);
            items.WFrameID = l_wireframe_id;
            var retval = show_single_item_desc(p_module_index, p_shelf_index, p_item_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index], items, g_camera, p_pogcrItemLabelColor, p_pogcrDisplayItemInfo, p_pog_index);

            if (spread_product !== "F" || (spread_product == "F" && horiz_facing == 1)) {
                add_item_borders(p_module_index, p_shelf_index, p_item_index, items, p_width, p_height, -1, p_pog_index, "N"); //Bug-26122 - splitting the chest
            }

            var selectedObject = g_world.getObjectById(items.id);
            if (items.DimUpdate == "E" && typeof items.DimUpdate !== "undefined") {
                selectedObject.BorderColour = g_dim_error_color;
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else if (nvl(items.Status) == "N") {
                selectedObject.BorderColour = g_status_error_color;
                selectedObject.Status = "N";
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else if (nvl(items.MovingItem) == "No" && g_pogcr_auto_hlite_non_mv_item == "Y") {
                selectedObject.BorderColour = g_nonMovingItemColor;
                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
            } else {
                if (nvl(items.OOSPerc) > 80 && g_pogcr_enbl_oos_border == "Y") {
                    selectedObject.BorderColour = g_pogcr_oos_border_color; //ASA-1688 Added to give blue border to item
                    selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                } else {
                    selectedObject.BorderColour = 0x000000;
                }
            }
            var objectType = shelfdtl.ObjType;
            if (typeof pegID !== "undefined" || pegID !== "") {
                if (g_show_peg_tags == "Y" && (objectType == "HANGINGBAR" || objectType == "PEGBOARD")) {
                    var res = show_pegTages("N", shelfdtl.ItemInfo[p_item_index], selectedObject, p_module_index, p_shelf_index, p_item_index, p_pog_index); //code adde by yograj to show pegtages
                }
            }
            resolve(items.id);
            logDebug("function : add_items_prom", "E");
        });
    } catch (err) {
        logDebug("function : add_items_prom", "E");
        error_handling(err);
    }
}

function add_items(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_module_index, p_shelf_index, p_item_index, p_rotation, p_pog_index) {
    try {
        logDebug("function : add_items; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; rotation : " + p_rotation, "S");
        var colorValue = parseInt(p_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);

        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var p_rotation = shelfdtl.Rotation;
        var slope = shelfdtl.Slope;
        if (p_rotation !== 0 || slope !== 0) {
            items = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, p_depth),
                new THREE.MeshStandardMaterial({
                    color: hex_decimal,
                })
            );

            if (shelfdtl.ItemInfo[p_item_index].Rotation !== 0 && shelfdtl.ItemInfo[p_item_index].Item == "DIVIDER") {
                items.rotateY((shelfdtl.ItemInfo[p_item_index].Rotation * Math.PI) / 180);
            }
            //items.rotateX(slope * Math.PI / 180);
            var selectedObject = g_world.getObjectById(shelfdtl.SObjID);

            if (shelfdtl.ObjType == "PEGBOARD") {
                p_x = 0 - shelfdtl.W / 2 + (shelfdtl.ItemInfo[p_item_index].PegBoardX + p_width / 2);
                p_y = 0 - shelfdtl.H / 2 + (shelfdtl.ItemInfo[p_item_index].PegBoardY + p_height / 2);
                p_z = 0.01 + p_depth / 2;
            } else {
                p_x = wpdSetFixed(0 - (shelfdtl.W / 2 - p_width / 2 - shelfdtl.ItemInfo[p_item_index].Distance));
                p_y = wpdSetFixed(shelfdtl.H / 2 + p_height / 2);
                p_z = wpdSetFixed(shelfdtl.D / 2 - p_depth / 2);
            }
            shelfdtl.ItemInfo[p_item_index].RotationX = p_x;
            shelfdtl.ItemInfo[p_item_index].RotationY = p_y;
            shelfdtl.ItemInfo[p_item_index].RotationZ = p_z;

            items.applyMatrix4(new THREE.Matrix4().makeTranslation(p_x, p_y, p_z));
            // apply transforms of mesh on top
            g_scene.updateMatrixWorld();
            items.matrixAutoUpdate = false;
            items.applyMatrix4(selectedObject.matrix);
            items.FixelID = shelfdtl.ItemInfo[p_item_index].ItemID;
            items.Module = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Module;

            items.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            items.Version = g_pog_json[p_pog_index].Version; //ASA-1243
            //Start ASA-1305
            items.X = wpdSetFixed(shelfdtl.ItemInfo[p_item_index].X * 100 - (shelfdtl.ItemInfo[p_item_index].W * 100) / 2); //.toFixed(2);
            items.Y = wpdSetFixed(shelfdtl.ItemInfo[p_item_index].Y * 100 - (shelfdtl.ItemInfo[p_item_index].H * 100) / 2); //toFixed(roundNumber(shelfdtl.ItemInfo[p_item_index].Y * 100 - ((shelfdtl.ItemInfo[p_item_index].H * 100) / 2), 3));
            items.Z = wpdSetFixed(shelfdtl.ItemInfo[p_item_index].Z * 100); //.toFixed(2);
            //items.X = Math.round(shelfdtl.ItemInfo[p_item_index].X * 100); // ASA-1243 //ASA-1305
            //items.Y = Math.round(shelfdtl.ItemInfo[p_item_index].Y * 100); // ASA-1243 //ASA-1305
            //items.Z = Math.round(shelfdtl.ItemInfo[p_item_index].Z * 100); // ASA-1243 //ASA-1305
            //End ASA-1305
            items.Desc = shelfdtl.Desc; //ASA-1243

            //items.matrixWorldNeedsUpdate = true;
            g_world.add(items);
            //selectedObject.add(items);
            selectedObject.updateMatrix();
            var rotate_vector = new THREE.Vector3();
            rotate_vector.setFromMatrixPosition(items.matrixWorld);
            shelfdtl.ItemInfo[p_item_index].ItemRotateWorldX = rotate_vector.x;
            shelfdtl.ItemInfo[p_item_index].ItemRotateWorldY = rotate_vector.y;
            shelfdtl.ItemInfo[p_item_index].ItemRotateWorldZ = rotate_vector.z;
        } else {
            items = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, 0.001),
                new THREE.MeshStandardMaterial({
                    color: hex_decimal,
                })
            );
            items.position.x = p_x;
            items.position.z = 0.001 + shelfdtl.D / 1000;
            items.position.y = p_y;
            items.uuid = p_uuid;
            var item_info = shelfdtl.ItemInfo[p_item_index];
            items.FixelID = item_info.ItemID;
            items.Module = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Module;
            items.W = item_info.W;
            items.H = item_info.H;
            items.D = item_info.D;
            items.Color = item_info.Color;
            items.Rotation = 0;
            items.ItemSlope = 0;
            items.Rotation = p_rotation !== 0 || slope !== 0 ? "Y" : "N";
            items.ImageExists = "N";
            items.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            items.Version = g_pog_json[p_pog_index].Version; //ASA-1243
            //Start ASA-1305
            items.X = wpdSetFixed(shelfdtl.ItemInfo[p_item_index].X * 100 - (shelfdtl.ItemInfo[p_item_index].W * 100) / 2); //.toFixed(2);
            items.Y = wpdSetFixed(shelfdtl.ItemInfo[p_item_index].Y * 100 - (shelfdtl.ItemInfo[p_item_index].H * 100) / 2); //toFixed(roundNumber(shelfdtl.ItemInfo[p_item_index].Y * 100 - ((shelfdtl.ItemInfo[p_item_index].H * 100) / 2), 3));
            items.Z = wpdSetFixed(shelfdtl.ItemInfo[p_item_index].Z * 100); //.toFixed(2);
            //items.X = Math.round(shelfdtl.ItemInfo[p_item_index].X * 100); // ASA-1243 //ASA-1305
            //items.Y = Math.round(shelfdtl.ItemInfo[p_item_index].Y * 100); // ASA-1243 //ASA-1305
            //items.Z = Math.round(shelfdtl.ItemInfo[p_item_index].Z * 100); // ASA-1243 //ASA-1305
            //End ASA-1305
            items.Desc = shelfdtl.Desc; //ASA-1243

            g_world.add(items);
        }

        var l_wireframe_id = add_wireframe(items, 2);

        add_item_borders(p_module_index, p_shelf_index, p_item_index, items, p_width, p_height, -1, p_pog_index, "N"); //Bug-26122 - splitting the chest
        var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
        var j = 0;
        var auto_divider_ind = "N"; //ASA-1406
        var val_found = false;
        for (const shelfs of shelf_arr) {
            if (shelfs.Shelf == shelfdtl.ItemInfo[p_item_index].ItemID) {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[j].ShelfDivObjID = items.id;
                if (shelfs.DivHeight > 0 && (shelfs.DivPbtwFace == "Y" || shelfs.DivPed == "Y" || shelfs.DivPst == "Y")) {
                    //ASA-1406 //Task_27734
                    auto_divider_ind = "Y";
                    val_found = true;
                }
                break; //return false;
            }
            j++;
        }
        if (!val_found) {
            //Task_27734
            if (shelfdtl.DivHeight > 0 && (shelfdtl.DivPbtwFace == "Y" || shelfdtl.DivPed == "Y" || shelfdtl.DivPst == "Y")) {
                // && shelfdtl.ItemInfo[p_item_index].AutoDiv == 'Y') {//ASA-1406 //Task_27734 //ASA-1406 issue 6
                auto_divider_ind = "Y";
            }
        }
        show_div_id = shelfdtl.NoDivIDShow !== "undefined" && auto_divider_ind == "Y" ? shelfdtl.NoDivIDShow : "N"; //ASA-1406
        if (g_show_fixel_label == "Y" && show_div_id == "N") {
            //ASA-1406
            var hex_color = shelfdtl.ItemInfo[p_item_index].Color;
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

            //if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
            text_color = "#ffffff";
            /*} else {
            text_color = "#ffffff";
            }*/
            var return_obj = addlabelText(shelfdtl.ItemInfo[p_item_index].ItemID, g_labelFont, g_labelActualSize, text_color, "center", "");
            items.add(return_obj);
            return_obj.position.x = 0;
            return_obj.position.y = 0;
            if (shelfdtl.Rotation !== 0 || shelfdtl.Slope !== 0) {
                return_obj.position.z = shelfdtl.ItemInfo[p_item_index].D / 2 + 0.005;
            } else {
                return_obj.position.z = 0.005;
            }
            shelfdtl.ItemInfo[p_item_index].LObjID = return_obj.id;
            var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
            $.each(shelf_arr, function (j, shelfs) {
                if (shelfs.Shelf == shelfdtl.ItemInfo[p_item_index].ItemID) {
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[j].LObjID = return_obj.id;
                    return false;
                }
            });
        }
        logDebug("function : add_items", "E");
        return items.id;
    } catch (err) {
        error_handling(err);
    }
}


//Start Bug-26122 - splitting the chest
async function update_item_distance(p_module_index, p_shelf_index, p_pog_index, p_chest_ind = "N") {
    logDebug("function : update_item_distance; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
    try {
        if (p_chest_ind == "Y") {
            var shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ChestInfo[p_shelf_index];
        } else {
            var shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        }

        var items_arr = shelf_dtl.ItemInfo;
        var l_shelf_object_type = shelf_dtl.ObjType;
        var shelf_start = shelf_dtl.X - shelf_dtl.W / 2;
        var shelf_start_Y = shelf_dtl.Y + shelf_dtl.H / 2;
        var shelf_begin_y = shelf_dtl.Y - shelf_dtl.H / 2;
        var basket_spread = shelf_dtl.BsktSpreadProduct;

        if (l_shelf_object_type == "BASKET" && basket_spread == "BT") {
            $.each(items_arr, function (i, items) {
                shelf_dtl.ItemInfo[i].Distance = items.Y - items.H / 2 - shelf_start_Y;
            });
        } else if (l_shelf_object_type == "PEGBOARD" || (l_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y")) {
            $.each(items_arr, function (i, items) {
                shelf_dtl.ItemInfo[i].PegBoardX = items.X - items.W / 2 - shelf_start;
                shelf_dtl.ItemInfo[i].PegBoardY = items.Y - items.H / 2 - shelf_begin_y;
                shelf_dtl.ItemInfo[i].Distance = items.X - items.W / 2 - shelf_start;
            });
        } else {
            $.each(items_arr, function (i, items) {
                shelf_dtl.ItemInfo[i].Distance = items.X - items.W / 2 - shelf_start;
                shelf_dtl.ItemInfo[i].YDistance = items.Y - shelf_start_Y;
            });
        }
        logDebug("function : update_item_distance", "E");
    } catch (err) {
        error_handling(err);
    }
}
//End Bug-26122 - splitting the chest

//ASA-1898 Divider is showing in the front of the textbox in AutoPosition added new Parameter p_isAutoPosition
async function set_all_items(p_module_index, p_shelf_index, p_a, p_y, p_shelf_edit_flag, p_resetType, p_set_axis, p_pog_index, p_sceneIndex, p_isAutoPosition) {
    logDebug("function : set_all_items; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; a : " + p_a + "; y : " + p_y + "; p_shelf_edit_flag : " + p_shelf_edit_flag + "; resetType : " + p_resetType + "; set_axis : " + p_set_axis, "S");
    try {
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        if (shelfdtl.ItemInfo.length > 0 && p_shelf_edit_flag == "Y") {
            var items_arr = shelfdtl.ItemInfo;
            var shelf_width = shelfdtl.W;
            var shelf_height = shelfdtl.H;
            var shelf_depth = shelfdtl.D;
            var l_object_type = shelfdtl.ObjType;
            var spread_product = shelfdtl.SpreadItem;
            var basket_spread = shelfdtl.BsktSpreadProduct;
            var rotation = shelfdtl.Rotation;
            var slope = shelfdtl.Slope;
            var item_x = 0,
                item_y = 0;

            if ((rotation !== 0 && rotation !== "N") || slope !== 0) {
                var i = 0;
                var selectedObject = g_scene_objects[p_sceneIndex].scene.children[2].getObjectById(shelfdtl.SObjID);
                for (const items of items_arr) {
                    var item_obj = g_scene_objects[p_sceneIndex].scene.children[2].getObjectById(items.ObjID);
                    var x = items.RotationX;
                    var p_y = items.RotationY;
                    var z = items.RotationZ;
                    var relativeMeshOffset = new THREE.Vector3(x, p_y, z);

                    var offsetPosition = relativeMeshOffset.applyMatrix4(selectedObject.matrixWorld);

                    item_obj.position.x = offsetPosition.x;
                    item_obj.position.y = offsetPosition.y;
                    item_obj.position.z = offsetPosition.z;
                    item_obj.quaternion.copy(selectedObject.quaternion);
                    item_obj.updateMatrix();
                    var rotate_vector = new THREE.Vector3();
                    rotate_vector.setFromMatrixPosition(item_obj.matrixWorld);
                    if (!isNaN(rotate_vector.x)) {
                        shelfdtl.ItemInfo[i].ItemRotateWorldX = rotate_vector.x;
                        shelfdtl.ItemInfo[i].ItemRotateWorldY = rotate_vector.y;
                        shelfdtl.ItemInfo[i].ItemRotateWorldZ = rotate_vector.z;
                    }
                    i = i + 1;
                }
                render(p_pog_index);
            } else {
                if (l_object_type == "BASKET" && basket_spread == "BT") {
                    var i = 0;
                    for (const items of items_arr) {
                        // $.each(items_arr, function (i, items) {
                        var selectedObject = g_scene_objects[p_sceneIndex].scene.children[2].getObjectById(items.ObjID);
                        if (typeof selectedObject !== "undefined") {
                            //Task_27734
                            item_x = p_a - shelf_width / 2 + items.W / 2;
                            item_y = p_y + shelf_height / 2 + items.Distance + items.H / 2;
                            selectedObject.position.set(item_x, item_y, selectedObject.position.z);
                            if (p_set_axis == "Y") {
                                shelfdtl.ItemInfo[i].X = item_x;
                                shelfdtl.ItemInfo[i].Y = item_y;
                            }
                        }
                        //});
                        i++;
                    }
                } else if (l_object_type == "HANGINGBAR") {
                    var i = 0;
                    for (const items of items_arr) {
                        // $.each(items_arr, function (i, items) {
                        var selectedObject = g_scene_objects[p_sceneIndex].scene.children[2].getObjectById(items.ObjID);
                        if (typeof selectedObject !== "undefined") {
                            //Task_27734
                            item_x = p_a - shelf_width / 2 + items.Distance + items.W / 2;
                            item_y = p_y - items.H / 2;
                            selectedObject.position.set(item_x, item_y, selectedObject.position.z);
                            if (p_set_axis == "Y") {
                                shelfdtl.ItemInfo[i].X = item_x;
                                shelfdtl.ItemInfo[i].Y = item_y;
                            }
                        }
                        // });
                        i++;
                    }
                } else if (g_shelf_object_type == "ROD") {
                    var i = 0;
                    for (const items of items_arr) {
                        // $.each(items_arr, function (i, items) {
                        var selectedObject = g_scene_objects[p_sceneIndex].scene.children[2].getObjectById(items.ObjID);
                        if (typeof selectedObject !== "undefined") {
                            //Task_27734
                            item_x = p_a;
                            item_y = p_y - shelf_height / 2 - items.H / 2;
                            selectedObject.position.set(item_x, item_y, selectedObject.position.z);
                            if (p_set_axis == "Y") {
                                shelfdtl.ItemInfo[i].X = item_x;
                                shelfdtl.ItemInfo[i].Y = item_y;
                            }
                        }
                        //});
                        i++;
                    }
                } else if (g_shelf_object_type == "PEGBOARD" || (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                    var i = 0;
                    for (const items of items_arr) {
                        var selectedObject = g_scene_objects[p_sceneIndex].scene.children[2].getObjectById(items.ObjID);
                        if (typeof selectedObject !== "undefined") {
                            //Task_27734
                            item_x = p_a - shelf_width / 2 + items.PegBoardX + items.W / 2;
                            item_y = p_y - shelf_height / 2 + items.PegBoardY + items.H / 2;
                            selectedObject.position.set(item_x, item_y, 0.016);
                            if (p_set_axis == "Y") {
                                shelfdtl.ItemInfo[i].X = item_x;
                                shelfdtl.ItemInfo[i].Y = item_y;
                            }
                        }
                        i++;
                    }
                } else {
                    var i = 0;
                    for (const items of items_arr) {
                        var oldItemHeight = items.OldItemHeight;
                        if (p_resetType == "E") {
                            if (typeof oldItemHeight == "undefined" || oldItemHeight === null) {
                                oldItemHeight = items.H;
                            }
                        } else {
                            oldItemHeight = items.H;
                        }
                        var selectedObject = g_scene_objects[p_sceneIndex].scene.children[2].getObjectById(items.ObjID);
                        if (typeof selectedObject !== "undefined") {
                            //Task_27734
                            if (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "") {
                                var oldItemHeight1;
                                var j = 0;
                                for (const items_info of items_arr) {
                                    oldItemHeight1 = items_info.OldItemHeight;
                                    if (p_resetType == "E") {
                                        if (typeof oldItemHeight1 == "undefined") {
                                            oldItemHeight1 = items_info.H;
                                        }
                                    } else {
                                        oldItemHeight1 = items_info.H;
                                    }
                                    if (items.BottomObjID == items_info.ObjID) {
                                        item_x = p_a - shelf_width / 2 + items_info.Distance + items_info.W / 2;
                                        item_y = p_y + shelf_height / 2 + items.TotalHeight + items.H / 2;
                                        break; //return false;
                                    }
                                    j++;
                                }
                            } else {
                                //ASA-1892 Issue Fix
                                // for (const items_info of items_arr) {
                                //     oldItemHeight1 = items_info.OldItemHeight;
                                //     if (p_resetType == "E") {
                                //         if (typeof oldItemHeight1 == "undefined") {
                                //             oldItemHeight1 = items_info.H;
                                //         }
                                //     } else {
                                //         oldItemHeight1 = items_info.H;
                                //     }
                                //     if (items.BottomObjID == items_info.ObjID) {
                                //         var shelf_item_gap = items_info.H;
                                //         break;
                                //     }
                                // }
                                item_x = p_a - shelf_width / 2 + items.Distance + items.W / 2;
                                item_y = p_y + shelf_height / 2 + oldItemHeight / 2;
                            }
                            if (l_object_type == "BASKET" && items.Item == "DIVIDER") {
                                item_y = p_y + shelf_height / 2 + items.YDistance + items.H / 2;
                                selectedObject.position.set(item_x, item_y, g_drag_z);
                            }
                            //ASA-2010.3 Start
                            if (l_object_type == "PALLET") {
                                selectedObject.position.x = item_x;
                                selectedObject.position.y = item_y;
                            }
                            //ASA-2010.3 End
                            /*else if (l_object_type == "SHELF") { //ASA-1573 Issue 2 ,ASA- 1608 Issue 1
                                selectedObject.position.set(item_x, item_y, 0.002); // 0.004
                            }*/ else {
                                p_isAutoPosition === "Y" ? selectedObject.position.set(item_x, item_y) : selectedObject.position.set(item_x, item_y, g_drag_z);	//ASA-1898 Divider is showing in the front of the textbox in AutoPosition
                            }

                            if (p_set_axis == "Y") {
                                shelfdtl.ItemInfo[i].X = item_x;
                                shelfdtl.ItemInfo[i].Y = item_y;
                            }
                            shelfdtl.ItemInfo[i].H = oldItemHeight;
                        }
                        // });
                        i++;
                    }
                }
            }
        }
        logDebug("function : set_all_items", "E");
    } catch (err) {
        error_handling(err);
    }
}

function get_similar_items(p_description, p_type, p_pog_index, p_UpdateItemInfo = "N") {
    try {
        logDebug("function : get_similar_items; desc : " + p_description + "; p_type : " + p_type, "S");
        var items_list = [];
        if (p_UpdateItemInfo == "N") {
            if (g_pog_json.length > 0) {
                var l = 0;
                for (const pogs of g_pog_json) {
                    var k = 0;
                    for (const Modules of g_pog_json[l].ModuleInfo) {
                        if (Modules.ParentModule == null) {
                            if (typeof Modules.Carpark !== "undefined" && typeof Modules.Carpark[0] !== "undefined") {
                                if (Modules.Carpark[0].ItemInfo.length > 0) {
                                    var j = 0;
                                    for (const items of Modules.Carpark[0].ItemInfo) {
                                        if ((p_type == "I" && items.Item == p_description) || (p_type == "D" && nvl(items.Desc) != 0 && items.Desc.search(p_description) !== -1)) {
                                            //ASA-1606
                                            var selectedObject = g_scene_objects[l].scene.children[2].getObjectById(items.ObjID);
                                            if (typeof selectedObject !== "undefined") {
                                                items_list.push(selectedObject);
                                            }
                                        }
                                        j++;
                                    }
                                }
                            }
                            var i = 0;
                            for (const Shelf of Modules.ShelfInfo) {
                                if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                                    var j = 0;
                                    for (const items of Shelf.ItemInfo) {
                                        if ((p_type == "I" && items.Item == p_description) || (p_type == "D" && nvl(items.Desc) != 0 && items.Desc.search(p_description) !== -1)) {
                                            //ASA-1606
                                            var selectedObject = g_scene_objects[l].scene.children[2].getObjectById(items.ObjID);
                                            if (typeof selectedObject !== "undefined") {
                                                items_list.push(selectedObject);
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
                    l++;
                }
            }
        } else {
            var k = 0; //asa-1258
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (Modules.ParentModule == null) {
                    if (typeof Modules.Carpark !== "undefined" && typeof Modules.Carpark[0] !== "undefined") {
                        if (Modules.Carpark[0].ItemInfo.length > 0) {
                            var j = 0;
                            for (const items of Modules.Carpark[0].ItemInfo) {
                                if ((p_type == "I" && items.Item == p_description) || (p_type == "D" && nvl(items.Desc) != 0 && items.Desc.search(p_description) !== -1)) {
                                    //ASA-1606
                                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                    if (typeof selectedObject !== "undefined") {
                                        items_list.push(selectedObject);
                                    }
                                }
                                j++;
                            }
                        }
                    }
                    var i = 0;
                    for (const Shelf of Modules.ShelfInfo) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            var j = 0;
                            for (const items of Shelf.ItemInfo) {
                                if ((p_type == "I" && items.Item == p_description) || (p_type == "D" && nvl(items.Desc) != 0 && items.Desc.search(p_description) !== -1)) {
                                    //ASA-1606
                                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                    if (typeof selectedObject !== "undefined") {
                                        items_list.push(selectedObject);
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
        logDebug("function : get_similar_items", "E");
        return items_list;
    } catch (err) {
        error_handling(err);
    }
}

function reorder_items(p_module_index, p_shelf_index, p_pog_index) {
    logDebug("function : reorder_items; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
    try {
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var shelf_obj_type = shelfdtl.ObjType;
        var [currCombinationIndex, currShelfCombIndx] = [-1, -1];

        items_arr = JSON.parse(JSON.stringify(shelfdtl.ItemInfo));
        items_arr.forEach(it => it.SpreadItem = 0);

        temp_item_arr = [];
        var spread_product = shelfdtl.SpreadItem;
        var spread_gap = shelfdtl.HorizGap;
        var shelf_top = wpdSetFixed(shelfdtl.Y + shelfdtl.H / 2); //.toFixed(3));
        var fixed_item_found = "N",
            item_found = "N",
            total_width = 0,
            item_cnt = 0,
            previous_fixed_item = -1;
        var shelf_width = shelfdtl.W;
        shelf_start = wpdSetFixed(shelfdtl.X - shelf_width / 2 - shelfdtl.LOverhang);
        shelf_end = wpdSetFixed(shelfdtl.X + shelf_width / 2 + shelfdtl.ROverhang);
        shelf_width = wpdSetFixed(shelfdtl.W + shelfdtl.LOverhang + shelfdtl.ROverhang);
        var fixed_gap = 0;
        var fixed_detail_arr = [];
        var normal_arr = [],
            x_arr = [],
            index_arr = [],
            be_exists = "N",
            prev_fixed = "N";
        var item_hit = "N";
        var hit_location,
            hit_shelf_ind = -1;

        //ASA-1129, Start
        var shelfCount = 0;

        if ((shelf_obj_type == "SHELF" || shelf_obj_type == "HANGINGBAR") && shelfdtl.Combine !== "N") {
            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
        }
        spread_product = currCombinationIndex !== -1 && currShelfCombIndx !== -1 ? g_combinedShelfs[currCombinationIndex].SpreadItem : spread_product;
        if (currCombinationIndex !== -1 && currShelfCombIndx !== -1 && (spread_product == "E" || spread_product == "F")) {
            var shelfCount = g_combinedShelfs[currCombinationIndex].length;
            var shelfIndx, modIndex;
            spread_gap = 0;
            shelf_width = 0;
            for (var s = 0; s < shelfCount; s++) {
                modIndex = g_combinedShelfs[currCombinationIndex][s].MIndex;
                shelfIndx = g_combinedShelfs[currCombinationIndex][s].SIndex;
                shelfdtl = g_pog_json[p_pog_index].ModuleInfo[modIndex].ShelfInfo[shelfIndx];
                shelf_width = shelf_width + shelfdtl.W + shelfdtl.LOverhang + shelfdtl.ROverhang;
                items_arr = shelfdtl.ItemInfo;

                for (const items of items_arr) {
                    if (typeof items.BottomObjID == "undefined" || items.BottomObjID == "") {
                        total_width = total_width + items.W;
                        if (spread_product == "E") {
                            item_cnt = item_cnt + 1;
                        } else {
                            item_cnt = item_cnt + items.BHoriz;
                        }
                    }
                }
            }
            var spread = 0;
            if (item_cnt > 1) {
                spread = (shelf_width - total_width) / (item_cnt - 1) <= 0 ? 0 : (shelf_width - total_width) / (item_cnt - 1);
            } else if (item_cnt !== 1) {
                spread = shelf_width - total_width < 0 ? 0 : shelf_width - total_width;
            }
            for (var s = 0; s < shelfCount; s++) {
                modIndex = g_combinedShelfs[currCombinationIndex][s].MIndex;
                shelfIndx = g_combinedShelfs[currCombinationIndex][s].SIndex;
                shelfdtl = g_pog_json[p_pog_index].ModuleInfo[modIndex].ShelfInfo[shelfIndx];
                items_arr = shelfdtl.ItemInfo;
                for (const items of items_arr) {
                    items.SpreadItem = spread;
                }
            }
            //ASA-1129, End
        } else {
            if (shelfdtl.ItemInfo.length > 0 && shelf_obj_type !== "ROD" && shelf_obj_type !== "PEGBOARD" && !(shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                //ASA-1327
                var i = 0;
                if (shelf_obj_type == "HANGINGBAR") {
                    var i = 0;
                    for (const items of shelfdtl.ItemInfo) {
                        if (item_hit == "Y") {
                            break;
                        }
                        var item_top = wpdSetFixed(items.Y + items.H / 2);
                        var item_bottom = wpdSetFixed(items.Y - items.H / 2);
                        var j = 0;
                        for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                            if (shelfs.ItemInfo.length > 0) {
                                if (shelfs.ObjType == "HANGINGBAR" && j !== p_shelf_index && shelfs.Y < item_top && shelfs.Y > item_bottom) {
                                    item_hit = "Y";
                                    hit_location = "B";
                                    hit_shelf_ind = j;
                                    break;
                                }
                            }
                            j++;
                        }
                        i++;
                    }
                    if (item_hit == "N") {
                        var shelf_info = shelfdtl;
                        var i = 0;
                        for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                            if (item_hit == "Y") {
                                break;
                            }
                            if (shelfs.ObjType == "HANGINGBAR" && i !== p_shelf_index) {
                                var j = 0;
                                for (const items of shelfs.ItemInfo) {
                                    var item_top = wpdSetFixed(items.Y + items.H / 2);
                                    var item_top = wpdSetFixed(items.Y + items.H / 2);
                                    var item_bottom = items.Y - items.H / 2;
                                    if (shelf_info.Y < item_top && shelf_info.Y > item_bottom) {
                                        item_hit = "Y";
                                        hit_location = "T";
                                        hit_shelf_ind = i;
                                        break;
                                    }
                                    j++;
                                }
                            }
                            i++;
                        }
                    }
                }
                if (item_hit == "N" || (item_hit == "Y" && hit_location == "B")) {
                    if (spread_product == "E" || spread_product == "F" || spread_product == "L") {
                        var fixedItemPresent = items_arr.some((items) => items.Fixed === "Y");
                        if (fixedItemPresent && (shelf_obj_type == "HANGINGBAR" || shelf_obj_type == "SHELF")) {
                            reorderShelfWithFixedItem(shelfdtl, shelf_start, shelf_end, spread_product, spread_gap, items_arr);
                            // var i = 0;
                            // for (const items of items_arr) {
                            // 	if (items.Fixed == "Y") {
                            // 		if (items.X - items.W / 2 < shelf_start) {
                            // 			items.X = shelf_start + items.W / 2;
                            // 		} else if (items.X + items.W / 2 > shelf_end) {
                            // 			items.X = shelf_end - items.W / 2;
                            // 		}
                            // 		var fixed_detail = items;
                            // 		var min_dis = 0;
                            // 		var index = -1;
                            // 		var total_width = 0;
                            // 		var item_cnt = 0;
                            // 		(x_arr = []), (index_arr = []);
                            // 		fixed_detail["IIndex"] = i;
                            // 		if (prev_fixed == "Y") {
                            // 			var j = 0;
                            // 			for (const fitems of items_arr) {
                            // 				if (fitems.X < items.X && fitems.Fixed == "Y") {
                            // 					x_arr.push(items.X - items.W / 2 - (fitems.X + fitems.W / 2));
                            // 					index_arr.push(j);
                            // 				}
                            // 				j++;
                            // 			}
                            // 			min_dis = Math.min.apply(Math, x_arr);

                            // 			if (min_dis !== 0) {
                            // 				var index = x_arr.findIndex(function (number) {
                            // 					return number == min_dis;
                            // 				});
                            // 				index = index_arr[index];
                            // 			}
                            // 		} else {
                            // 			min_dis = items.X - items.W / 2 - shelf_start;
                            // 		}
                            // 		fixed_detail["TotalGap"] = min_dis;
                            // 		fixed_detail_arr.push(fixed_detail);
                            // 		prev_fixed = "Y";
                            // 	} else {
                            // 		items.IIndex = i;
                            // 		items.NotFixed = "N";
                            // 		normal_arr.push(items);
                            // 	}
                            // 	i++;
                            // }

                            // var max_fixed = -1;
                            // if (fixed_detail_arr.length > 0) {
                            // 	shelfdtl.ItemInfo.splice(0);
                            // 	var item_end = 0;
                            // 	var i = 0;
                            // 	for (const fixed of fixed_detail_arr) {
                            // 		if (fixed.Fixed == "Y") {
                            // 			var next_fixed = "Y";
                            // 			var j = 0;
                            // 			for (const items of normal_arr) {
                            // 				if (fixed.TotalGap > 0 && fixed.TotalGap >= items.W && items.NotFixed == "N") {
                            // 					shelfdtl.ItemInfo.splice(fixed.IIndex, 0, items);
                            // 					if (typeof items.BottomObjID === "undefined" || items.BottomObjID === "") {
                            // 						//parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top ////ASA-1247
                            // 						fixed.TotalGap = fixed.TotalGap - items.W;
                            // 					} else if (shelf_obj_type == "HANGINGBAR") {
                            // 						//ASA-1237
                            // 						fixed.TotalGap = fixed.TotalGap - items.W;
                            // 					}
                            // 					items.FixedIndex = fixed.IIndex;
                            // 					normal_arr[j].NotFixed = "Y";
                            // 				}
                            // 				j++;
                            // 			}
                            // 			max_fixed = fixed.IIndex;
                            // 			shelfdtl.ItemInfo.push(fixed);
                            // 		}

                            // 		i++;
                            // 	}

                            // 	var i = 0;
                            // 	for (const items of normal_arr) {
                            // 		if (items.NotFixed == "N") {
                            // 			shelfdtl.ItemInfo.push(items);
                            // 		}
                            // 		i++;
                            // 	}

                            //     var sorto = {
                            //         IIndex: "asc",
                            //     };
                            //     shelfdtl.ItemInfo.keySort(sorto);   //ASA-1677 #3

                            // 	if (spread_product == "E" || spread_product == "F") {
                            // 		var item_cnt = 0;
                            // 		var item_gap = 0;
                            // 		items_arr = shelfdtl.ItemInfo;
                            // 		if (spread_product == "E" && spread_gap > 0) {
                            // 			spread_gap = spread_gap;
                            // 		}
                            // 		var i = 0;
                            // 		for (const fixed of fixed_detail_arr) {
                            // 			item_cnt = 0;
                            // 			var j = 0;
                            // 			for (const items of items_arr) {
                            // 				if ((fixed.IIndex == items.FixedIndex && (typeof items.BottomObjID === "undefined" || items.BottomObjID === "")) || shelf_obj_type == "HANGINGBAR") {
                            // 					//parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top ////ASA-1247
                            // 					if (spread_product == "E") {
                            // 						item_cnt = item_cnt + 1;
                            // 					} else {
                            // 						item_cnt = item_cnt + items.BHoriz;
                            // 					}
                            // 				}
                            // 				j++;
                            // 			}
                            // 			var spread = fixed.TotalGap / item_cnt; //(item_cnt - 1) < 0 ? 0 : fixed.TotalGap / (item_cnt - 1);
                            // 			var k = 0;
                            // 			for (const items of items_arr) {
                            // 				if (fixed.IIndex == items.FixedIndex) {
                            // 					items.SpreadItem = spread;
                            // 				}
                            // 				k++;
                            // 			}
                            // 			i++;
                            // 		}
                            // 		max_x = -1;
                            // 		max_index = -1;
                            // 		lastgap = -1;
                            // 		var i = 0;
                            // 		for (const items of items_arr) {
                            // 			if (items.Fixed == "Y") {
                            // 				if (max_x < items.X) {
                            // 					lastgap = shelf_end - (items.X + items.W / 2);
                            // 					max_x = items.X;
                            // 					max_index = i;
                            // 				}
                            // 			}
                            // 			i++;
                            // 		}
                            // 		item_cnt = 0;
                            // 		total_width = 0;
                            // 		var i = 0;
                            // 		for (const items of items_arr) {
                            // 			if (i > max_index && wpdSetFixed(items.Y - items.H / 2) == shelf_top) {
                            // 				if (spread_product == "E") {
                            // 					item_cnt = item_cnt + 1;
                            // 				} else {
                            // 					item_cnt = item_cnt + items.BHoriz;
                            // 				}
                            // 				total_width += items.W;
                            // 			}
                            // 			i++;
                            // 		}
                            // 		total_width = lastgap - total_width;

                            // 		item_cnt = item_cnt == 1 ? 2 : item_cnt;
                            // 		if (item_cnt > 0) {
                            // 			var spread = total_width / item_cnt < 0 ? 0 : total_width / item_cnt;
                            // 			var i = 0;
                            // 			for (const items of items_arr) {
                            // 				if (i > max_index) {
                            // 					items.SpreadItem = spread;
                            // 				}
                            // 				i++;
                            // 			}
                            // 		}
                            // 	}
                        } else if (spread_product == "E" || spread_product == "F") {
                            var item_cnt = 0;
                            items_arr = shelfdtl.ItemInfo;
                            if (spread_product == "E" && spread_gap > 0) {
                                spread_gap = spread_gap;
                            }
                            var j = 0;
                            for (const items of items_arr) {
                                //  if (parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top || shelf_obj_type == "HANGINGBAR") { commented beacuse due to parseFloat((items.Y - items.H / 2).toFixed(4)) =1.10165 but it chnages the value to 1.1017 so it not goes inside if block
                                if (typeof items.BottomObjID === "undefined" || items.BottomObjID === "" || shelf_obj_type === "HANGINGBAR") {
                                    if (items.BHoriz > 1 && spread_product == "F") {
                                        //ASA-1970 Start
                                        // total_width += items.W + spread_gap * (items.BHoriz - 1);
                                        total_width += items.CrushHoriz > 0 ? items.W : items.RW;
                                        // total_width += items.RW;
                                        //ASA-1970 End
                                    } else {
                                        total_width += items.W;
                                    }
                                    if (spread_product == "E") {
                                        item_cnt = item_cnt + 1;
                                    } else {
                                        item_cnt = item_cnt + items.BHoriz;
                                    }
                                }
                                j++;
                            }
                            if (item_cnt > 0) {
                                var spread = wpdSetFixed((shelf_width - total_width) / (item_cnt - 1)) < 0 ? 0 : wpdSetFixed((shelf_width - total_width) / (item_cnt - 1));
                            } else {
                                var spread = wpdSetFixed(shelf_width - total_width) < 0 ? 0 : wpdSetFixed(shelf_width - total_width);
                            }
                            $.each(items_arr, function (i, items) {
                                items.SpreadItem = wpdSetFixed(spread);
                            });
                        }
                    } else if (spread_product == "R") {
                        var fixedItemPresent = items_arr.some((items) => items.Fixed === "Y");
                        if (fixedItemPresent && (shelf_obj_type == "HANGINGBAR" || shelf_obj_type == "SHELF")) {
                            reorderShelfWithFixedItem(shelfdtl, shelf_start, shelf_end, spread_product, spread_gap, items_arr);
                        } else {
                            for (var i = items_arr.length - 1; i >= 0; i--) {
                                items_arr[i].IIndex = i;
                                items_arr[i].NotFixed = "N";
                                normal_arr.push(items_arr[i]);
                            }
                            shelfdtl.ItemInfo.splice(0);
                            var i = 0;
                            for (const items of normal_arr) {
                                if (items.NotFixed == "N") {
                                    shelfdtl.ItemInfo.splice(0, 0, items);
                                }
                                i++;
                            }
                        }
                        // else {
                        // for (var i = items_arr.length - 1; i >= 0; i--) {
                        // 	if (items_arr[i].Fixed == "Y") {
                        // 		if (items_arr[i].X - items_arr[i].W / 2 < shelf_start) {
                        // 			items_arr[i].X = wpdSetFixed(shelf_start + items_arr[i].W / 2);
                        // 		} else if (items_arr[i].X + items_arr[i].W / 2 > shelf_end) {
                        // 			items_arr[i].X = wpdSetFixed(shelf_end - items_arr[i].W / 2);
                        // 		}
                        // 		var fixed_detail = items_arr[i];
                        // 		var min_dis = 0;
                        // 		var index = -1;
                        // 		var total_width = 0;
                        // 		var item_cnt = 0;
                        // 		(x_arr = []), (index_arr = []);
                        // 		fixed_detail["IIndex"] = i;
                        // 		if (prev_fixed == "Y") {
                        // 			$.each(items_arr, function (j, fitems) {
                        // 				if (fitems.X > items_arr[i].X && fitems.Fixed == "Y") {
                        // 					x_arr.push(fitems.X - fitems.W / 2 - (items_arr[i].X + items_arr[i].W / 2));
                        // 					index_arr.push(j);
                        // 				}
                        // 			});

                        // 			min_dis = Math.min.apply(Math, x_arr);

                        // 			if (min_dis !== 0) {
                        // 				var index = x_arr.findIndex(function (number) {
                        // 					return number == min_dis;
                        // 				});
                        // 				index = index_arr[index];
                        // 			}
                        // 		} else {
                        // 			min_dis = shelf_end - (items_arr[i].X + items_arr[i].W / 2);
                        // 		}
                        // 		fixed_detail["TotalGap"] = min_dis;
                        // 		fixed_detail_arr.push(fixed_detail);
                        // 		prev_fixed = "Y";
                        // 	} else {
                        // 		items_arr[i].IIndex = i;
                        // 		items_arr[i].NotFixed = "N";
                        // 		normal_arr.push(items_arr[i]);
                        // 	}
                        // }
                        // shelfdtl.ItemInfo.splice(0);
                        // $.each(fixed_detail_arr, function (i, fixed) {
                        // 	if (fixed.Fixed == "Y") {
                        // 		var next_fixed = "Y";
                        // 		shelfdtl.ItemInfo.splice(0, 0, fixed);
                        // 		if (next_fixed == "B") {
                        // 			var j = 0;
                        // 			for (const items of normal_arr) {
                        // 				if (fixed.TotalGap > 0 && fixed.TotalGap >= items.W && items.NotFixed == "N" && items.X > fixed_detail_arr[i + 1].X) {
                        // 					shelfdtl.ItemInfo.splice(1, 0, items);
                        // 					if (typeof items.BottomObjID === "undefined" || items.BottomObjID === "") {
                        // 						//parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top ////ASA-1247
                        // 						fixed.TotalGap = fixed.TotalGap - items.W;
                        // 					} else if (shelf_obj_type == "HANGINGBAR") {
                        // 						//ASA-1237
                        // 						fixed.TotalGap = fixed.TotalGap - items.W;
                        // 					}
                        // 					items.FixedIndex = fixed.IIndex;
                        // 					items.NotFixed = "Y";
                        // 				}
                        // 				j++;
                        // 			}
                        // 		} else {
                        // 			var j = 0;
                        // 			for (const items of normal_arr) {
                        // 				if (fixed.TotalGap > 0 && fixed.TotalGap >= items.W && items.NotFixed == "N") {
                        // 					shelfdtl.ItemInfo.splice(1, 0, items);
                        // 					if (typeof items.BottomObjID === "undefined" || items.BottomObjID === "") {
                        // 						//parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top ////ASA-1247
                        // 						fixed.TotalGap = fixed.TotalGap - items.W;
                        // 					}
                        // 					items.FixedIndex = fixed.IIndex;
                        // 					items.NotFixed = "Y";
                        // 				}
                        // 				j++;
                        // 			}
                        // 		}
                        // 		max_fixed = fixed.IIndex;
                        // 		//shelfdtl.ItemInfo.push(fixed);
                        // 	}
                        // });
                        // var i = 0;
                        // for (const items of normal_arr) {
                        // 	if (items.NotFixed == "N") {
                        // 		shelfdtl.ItemInfo.splice(0, 0, items);
                        // 	}
                        // 	i++;
                        // }
                    }
                } else {
                    var shelfs = shelfdtl;
                    var shelf_start = shelfs.X - shelfs.W / 2;
                    var minx = 100;
                    var i = 0;
                    for (const items of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[hit_shelf_ind].ItemInfo) {
                        var item_top = wpdSetFixed(items.Y + items.H / 2);
                        var item_bottom = wpdSetFixed(items.Y - items.H / 2);
                        if (shelfs.Y < item_top && shelfs.Y > item_bottom) {
                            minx = Math.min(minx, items.X - items.W / 2);
                        }
                        i++;
                    }
                    var shelf_width = minx - shelf_start;

                    if (spread_product == "E" || spread_product == "F") {
                        var item_cnt = 0;
                        items_arr = shelfdtl.ItemInfo;
                        if (spread_product == "E" && spread_gap > 0) {
                            spread_gap = spread_gap;
                        }
                        var j = 0;
                        for (const items of items_arr) {
                            //  if (parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top || shelf_obj_type == "HANGINGBAR") { commented beacuse due to parseFloat((items.Y - items.H / 2).toFixed(4)) =1.10165 but it chnages the value to 1.1017 so it not goes inside if block
                            if (typeof items.BottomObjID === "undefined" || items.BottomObjID === "" || shelf_obj_type === "HANGINGBAR") {
                                if (items.BHoriz > 1 && spread_product == "F") {
                                    total_width += items.W + spread_gap * (items.BHoriz - 1);
                                } else {
                                    total_width += items.W;
                                }
                                if (spread_product == "E") {
                                    item_cnt = item_cnt + 1;
                                } else {
                                    item_cnt = item_cnt + items.BHoriz;
                                }
                            }
                            j++;
                        }
                        if (item_cnt > 0) {
                            var spread = wpdSetFixed((shelf_width - total_width) / (item_cnt - 1)) < 0 ? 0 : wpdSetFixed((shelf_width - total_width) / (item_cnt - 1));
                        } else {
                            var spread = wpdSetFixed(shelf_width - total_width) < 0 ? 0 : wpdSetFixed(shelf_width - total_width);
                        }
                        $.each(items_arr, function (i, items) {
                            items.SpreadItem = spread;
                        });
                    } else if (spread_product == "R") {
                        items_arr = shelfdtl.ItemInfo;
                        var i = 0;
                        for (const iten_arr of items_arr) {
                            items.ShelfEnd = minx;
                            i++;
                        }
                    }
                }
            }
        }
        logDebug("function : reorder_items", "E");
        return true;
    } catch (err) {
        error_handling(err);
    }
}

function get_item_xaxis(p_width, p_height, p_depth, p_shelf_obj_type, p_locationX, p_horiz_gap, p_spread_product, p_spread_gap, p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_item_length, p_shelf_edit, p_pog_index, p_itemInsidePeg = "Y", p_item_paste = "N") { //ASA-1927 Issue1
    logDebug("function : get_item_xaxis; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; shelf_obj_type : " + p_shelf_obj_type + "; locationX : " + p_locationX + "; horiz_gap : " + p_horiz_gap + "; spread_product : " + p_spread_product + "; spread_gap : " + p_spread_gap + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; p_edit_ind : " + p_edit_ind + "; item_length : " + p_item_length + "; shelf_edit : " + p_shelf_edit, "S");
    try {
        g_invalidPosition = "N";
        var finalX = 0;
        var spread_valid = ["SHELF", "HANGINGBAR"];
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var item_fixed = shelfdtl.ItemInfo[p_item_index].Fixed;
        var basket_spread = shelfdtl.BsktSpreadProduct;
        var basket_fill = shelfdtl.BsktFill;
        // var item_cnt = shelfdtl.ItemInfo.length;
        var shelf_width = shelfdtl.W;
        var shelf_height = shelfdtl.H;
        var shelf_depth = shelfdtl.D;
        var shelfY = shelfdtl.Y;
        // var item_bottom = parseFloat((shelfdtl.ItemInfo[p_item_index].Y - shelfdtl.ItemInfo[p_item_index].H / 2).toFixed(3));
        var bottom_objid = shelfdtl.ItemInfo[p_item_index].BottomObjID;
        // var shelf_top = parseFloat((shelfY + shelf_height / 2).toFixed(4));
        var items_arr = shelfdtl.ItemInfo;
        var shelf_start = shelfdtl.X - shelfdtl.W / 2;
        // var itemCnt = items_arr.length;
        var shelfCount = 1,
            [currCombinationIndex, currShelfCombIndx] = [-1, -1];
        var checkShelf = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var newObjID = shelfdtl.ItemInfo[p_item_index].BottomObjID; //ASA-1540 #2
        if ((checkShelf.ObjType == "SHELF" || checkShelf.ObjType == "HANGINGBAR") && checkShelf.Combine !== "N") {
            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, checkShelf.Shelf);
            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                shelfCount = g_combinedShelfs[currCombinationIndex].length;
            }
        }

        if (shelfCount > 1) {
            const combineStart = g_combinedShelfs[currCombinationIndex].Start;
            const combineEnd = g_combinedShelfs[currCombinationIndex].End;

            var prevItem,
                prevItemW = 0,
                prevItemX = 0,
                prevItemS = 0,
                prevItemE = 0;
            prevItem = getLastItemCombinedShelf(g_combinedShelfs[currCombinationIndex], p_spread_product, shelfdtl.ItemInfo[p_item_index].ObjID);
            if (!$.isEmptyObject(prevItem)) {
                prevItemX = prevItem.X;
                prevItemW = prevItem.W;
                prevItemS = prevItem.X - prevItem.W / 2;
                prevItemE = prevItem.X + prevItem.W / 2;
            }
            if (p_spread_product == "R") {
                if (prevItemS !== 0) {
                    finalX = prevItemS - shelfdtl.ItemInfo[p_item_index].W / 2;
                } else {
                    finalX = combineEnd - shelfdtl.ItemInfo[p_item_index].W / 2;
                }
            } else if (p_spread_product == "L") {
                if (prevItemE !== 0) {
                    finalX = prevItemE + shelfdtl.ItemInfo[p_item_index].W / 2;
                } else {
                    finalX = combineStart + shelfdtl.ItemInfo[p_item_index].W / 2;
                }
            } else if (p_spread_product == "E" || p_spread_product == "F") {
                if (p_spread_product == "F" && shelfdtl.ItemInfo[p_item_index].BHoriz > 1 && shelfdtl.ItemInfo[p_item_index].CrushHoriz == 0) {
                    shelfdtl.ItemInfo[p_item_index].W = shelfdtl.ItemInfo[p_item_index].RW /*(shelfdtl.ItemInfo[i_item_index].OW * shelfdtl.ItemInfo[i_item_index].BHoriz)*/ + shelfdtl.ItemInfo[p_item_index].SpreadItem * (shelfdtl.ItemInfo[p_item_index].BHoriz - 1);
                } else if (p_spread_product == "E" && shelfdtl.ItemInfo[p_item_index].BHoriz > 1 && p_horiz_gap > 0 && shelfdtl.ItemInfo[p_item_index].CrushHoriz == 0) {
                    shelfdtl.ItemInfo[p_item_index].W = shelfdtl.ItemInfo[p_item_index].RW /*(shelfdtl.ItemInfo[i_item_index].OW * shelfdtl.ItemInfo[i_item_index].BHoriz)*/ + p_horiz_gap * (shelfdtl.ItemInfo[p_item_index].BHoriz - 1);
                }
                if (prevItemE !== 0) {
                    finalX = prevItemE + shelfdtl.ItemInfo[p_item_index].W / 2 + shelfdtl.ItemInfo[p_item_index].SpreadItem;
                } else {
                    finalX = combineStart + shelfdtl.ItemInfo[p_item_index].W / 2;
                }
            } else if (p_spread_product == "M") {
                //ASA-1129
                finalX = shelfdtl.ItemInfo[p_item_index].X;
            }
        } else {
            if (p_shelf_edit == "Y") {
                finalX = shelfdtl.ItemInfo[p_item_index].X;
            } else {
                if (spread_valid.indexOf(p_shelf_obj_type) !== -1) {
                    if (p_spread_product == "R") {
                        var objID = shelfdtl.ItemInfo[p_item_index].ObjID;
                        var currX = shelfdtl.ItemInfo[p_item_index].X;
                        var itemFixed = shelfdtl.ItemInfo[p_item_index].Fixed;
                        if (p_item_index == shelfdtl.ItemInfo.length - 1) {
                            if (item_fixed == "N" || item_fixed == "B") {
                                var max_index = -1;
                                if (typeof bottom_objid !== "undefined" && bottom_objid !== "") {
                                    // var newObjID = shelfdtl.ItemInfo[p_item_index].ObjID; //ASA-1540 #2
                                    finalX = shelfdtl.ItemInfo[get_shelf_item_ind(p_module_index, p_shelf_index, bottom_objid, p_pog_index)].X;
                                } else {
                                    if (p_shelf_obj_type == "HANGINGBAR" && typeof shelfdtl.ItemInfo[p_item_index].ShelfEnd !== "undefined") {
                                        var shelf_end = shelfdtl.ItemInfo[p_item_index].ShelfEnd;
                                    } else {
                                        var shelf_end = shelfdtl.X + shelfdtl.W / 2;
                                    }
                                    finalX = shelf_end - p_width / 2 + shelfdtl.ROverhang;
                                }
                            } else {
                                finalX = shelfdtl.ItemInfo[p_item_index].X;
                            }
                        } else {
                            if (item_fixed == "N" || item_fixed == "B") {
                                var max_index = -1;
                                if (typeof bottom_objid !== "undefined" && bottom_objid !== "") {
                                    // var newObjID = shelfdtl.ItemInfo[p_item_index].ObjID; //ASA-1540 #2
                                    finalX = shelfdtl.ItemInfo[get_shelf_item_ind(p_module_index, p_shelf_index, bottom_objid, p_pog_index)].X;
                                } else {
                                    if (p_shelf_obj_type == "SHELF") {
                                        var i = 0;
                                        for (const items of items_arr) {
                                            if (i > p_item_index && (typeof items.BottomObjID == "undefined" || items.BottomObjID == "")) {
                                                //parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top) {
                                                if (max_index !== -1) {
                                                    max_index = Math.min(max_index, i);
                                                } else {
                                                    max_index = i;
                                                }
                                            }
                                            i++;
                                        }
                                    } else {
                                        max_index = p_item_index + 1;
                                    }
                                    if (max_index == -1) {
                                        if (p_shelf_obj_type == "HANGINGBAR" && typeof shelfdtl.ItemInfo[p_item_index].ShelfEnd !== "undefined") {
                                            var shelf_end = shelfdtl.ItemInfo[p_item_index].ShelfEnd;
                                        } else {
                                            var shelf_end = shelfdtl.X + shelfdtl.W / 2;
                                        }
                                        finalX = shelf_end - p_width / 2 + shelfdtl.ROverhang;
                                    } else {
                                        finalX = shelfdtl.ItemInfo[max_index].X - shelfdtl.ItemInfo[max_index].W / 2 - parseFloat(p_width) / 2 - p_spread_gap;
                                    }
                                }
                            } else {
                                finalX = shelfdtl.ItemInfo[p_item_index].X;
                            }
                        }
                        if (g_isBookend == "B" && objID == g_movedObjID) {
                            finalX = shelfdtl.ItemInfo[p_item_index].X;
                            var itemEnd = shelfdtl.ItemInfo[p_item_index].X + shelfdtl.ItemInfo[p_item_index].W / 2;
                            if (p_item_index < shelfdtl.ItemInfo.length - 1) {
                                var prevItemStart = shelfdtl.ItemInfo[p_item_index + 1].X - shelfdtl.ItemInfo[p_item_index + 1].W / 2;
                                if (itemEnd > prevItemStart) {
                                    finalX = prevItemStart - p_width / 2;
                                }
                            }
                        }
                        if (finalX > currX && itemFixed == "B") {
                            finalX = shelfdtl.ItemInfo[p_item_index].X;
                        }
                        if (finalX + p_width / 2 > shelfEnd && g_validationFlag == "Y" && g_overhung_shelf_active == "N") {
                            //ASA-1300 Regression issue 12
                            g_invalidPosition = "Y";
                        } else {
                            g_validationFlag = "Y";
                        }
                    } else if (p_spread_product == "L") {
                        var max_index = -1;
                        var shelfEnd = shelfdtl.X + shelfdtl.W / 2;
                        var objID = shelfdtl.ItemInfo[p_item_index].ObjID;
                        var itemFixed = shelfdtl.ItemInfo[p_item_index].Fixed;
                        var currX = shelfdtl.ItemInfo[p_item_index].X;
                        if (p_item_index > 0) {
                            if (item_fixed == "N" || item_fixed == "B") {
                                var max_index = -1;
                                if (typeof bottom_objid !== "undefined" && bottom_objid !== "") {
                                    // var newObjID = shelfdtl.ItemInfo[p_item_index].ObjID; //ASA-1540 #2
                                    finalX = shelfdtl.ItemInfo[get_shelf_item_ind(p_module_index, p_shelf_index, newObjID, p_pog_index)].X;
                                }
                                if (typeof bottom_objid == "undefined" || bottom_objid == "") {
                                    if (p_shelf_obj_type == "SHELF") {
                                        $.each(items_arr, function (i, items) {
                                            if (i < p_item_index && (typeof items.BottomObjID == "undefined" || items.BottomObjID == "")) {
                                                //parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top) {
                                                max_index = Math.max(max_index, i);
                                            }
                                        });
                                    } else {
                                        max_index = p_item_index - 1;
                                    }
                                    if (max_index == -1) {
                                        finalX = shelf_start + parseFloat(p_width) / 2 - shelfdtl.LOverhang;
                                    } else {
                                        finalX = shelfdtl.ItemInfo[max_index].X + shelfdtl.ItemInfo[max_index].W / 2 + parseFloat(p_width) / 2 + p_spread_gap;
                                    }
                                }
                            } else {
                                finalX = shelfdtl.ItemInfo[p_item_index].X;
                            }
                        } else {
                            if (item_fixed == "N" || item_fixed == "B") {
                                var max_index = -1;
                                if (typeof bottom_objid !== "undefined" && bottom_objid !== "") {
                                    // var newObjID = shelfdtl.ItemInfo[p_item_index].ObjID; //ASA-1540 #2
                                    finalX = shelfdtl.ItemInfo[get_shelf_item_ind(p_module_index, p_shelf_index, newObjID, p_pog_index)].X;
                                } else {
                                    finalX = shelf_start + parseFloat(p_width) / 2 - shelfdtl.LOverhang;
                                }
                            } else {
                                finalX = shelfdtl.ItemInfo[p_item_index].X;
                            }
                        }
                        if (g_isBookend == "B" && objID == g_movedObjID) {
                            finalX = shelfdtl.ItemInfo[p_item_index].X;
                            var itemStart = shelfdtl.ItemInfo[p_item_index].X - shelfdtl.ItemInfo[p_item_index].W / 2;
                            if (p_item_index > 0) {
                                var prevItemEnd = shelfdtl.ItemInfo[p_item_index - 1].X + shelfdtl.ItemInfo[p_item_index - 1].W / 2;
                                if (itemStart < prevItemEnd) {
                                    finalX = prevItemEnd + p_width / 2;
                                }
                            }
                        }
                        if (finalX < currX && itemFixed == "B") {
                            finalX = shelfdtl.ItemInfo[p_item_index].X;
                        }
                        if (finalX + p_width / 2 > shelfEnd && g_validationFlag == "Y" && g_overhung_shelf_active == "N") {
                            //ASA-1300 Regression issue 12
                            g_invalidPosition = "Y";
                        } else {
                            g_validationFlag = "Y";
                        }
                    } else if (p_spread_product == "E" || p_spread_product == "F") {
                        if (p_spread_product == "F" && shelfdtl.ItemInfo[p_item_index].BHoriz > 1 && shelfdtl.ItemInfo[p_item_index].CrushHoriz == 0) {
                            shelfdtl.ItemInfo[p_item_index].W = shelfdtl.ItemInfo[p_item_index].RW /*(shelfdtl.ItemInfo[i_item_index].OW * shelfdtl.ItemInfo[i_item_index].BHoriz)*/ + shelfdtl.ItemInfo[p_item_index].SpreadItem * (shelfdtl.ItemInfo[p_item_index].BHoriz - 1);
                        } else if (p_spread_product == "E" && shelfdtl.ItemInfo[p_item_index].BHoriz > 1 && p_horiz_gap > 0 && shelfdtl.ItemInfo[p_item_index].CrushHoriz == 0) {
                            shelfdtl.ItemInfo[p_item_index].W = shelfdtl.ItemInfo[p_item_index].RW /*(shelfdtl.ItemInfo[i_item_index].OW * shelfdtl.ItemInfo[i_item_index].BHoriz)*/ + p_horiz_gap * (shelfdtl.ItemInfo[p_item_index].BHoriz - 1);
                        //ASA-2045 Issue6 & Issue7 Start
                        } else if (p_spread_product == "F" && shelfdtl.ItemInfo[p_item_index].BHoriz > 1 && shelfdtl.ItemInfo[p_item_index].Orientation !== "0") {
                            var l_item = shelfdtl.ItemInfo[p_item_index];
                            var [org_width, org_height, org_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(l_item.Orientation, l_item.OW, l_item.OH, l_item.OD);
                            if ((actualWidth == "H" && l_item.CrushVert == 0) || (actualWidth == "D" && l_item.CrushD == 0)) {
                                shelfdtl.ItemInfo[p_item_index].W = shelfdtl.ItemInfo[p_item_index].RW + shelfdtl.ItemInfo[p_item_index].SpreadItem * (shelfdtl.ItemInfo[p_item_index].BHoriz - 1);
                            }
                        //ASA-2045 Issue6 & Issue7 End
                        }
                        if (p_item_index > 0) {
                            if (item_fixed == "N" || item_fixed == "B") {
                                var max_index = -1;
                                if (typeof bottom_objid !== "undefined" && bottom_objid !== "") {
                                    // var newObjID = shelfdtl.ItemInfo[p_item_index].ObjID; //ASA-1540 #2
                                    finalX = shelfdtl.ItemInfo[get_shelf_item_ind(p_module_index, p_shelf_index, newObjID, p_pog_index)].X;
                                } else {
                                    if (p_shelf_obj_type == "SHELF") {
                                        var i = 0;
                                        for (const items of items_arr) {
                                            if (i < p_item_index && (typeof items.BottomObjID == "undefined" || items.BottomObjID == "")) {
                                                //parseFloat((items.Y - items.H / 2).toFixed(4)) == shelf_top) {
                                                max_index = Math.max(max_index, i);
                                            }
                                            i++;
                                        }
                                    } else {
                                        max_index = p_item_index - 1;
                                    }
                                    if (max_index == -1) {
                                        finalX = shelf_start + shelfdtl.ItemInfo[p_item_index].W / 2 - shelfdtl.LOverhang;
                                    } else {
                                        //ASA-1970 Start
                                        var item = shelfdtl.ItemInfo[p_item_index];
                                        var max = shelfdtl.ItemInfo[max_index];
                                        //ASA-2045 Issue6 & Issue7 Start
                                        var [orgWidth, orgHeight, orgDepth, actHeight, actWidth, actDepth] = get_new_orientation_dim(item.Orientation, item.OW, item.OH, item.OD);
                                        var [orgWidthM, orgHeightM, orgDepthM, actHeightM, actWidthM, actDepthM] = get_new_orientation_dim(max.Orientation, max.OW, max.OH, max.OD);

                                        if (item.CrushHoriz > 0 && item.Orientation == "0") {
                                            var crushItem = item.RW * (1 - item.CrushHoriz / 100) + item.SpreadItem * (item.BHoriz - 1);
                                        } else if (item.Orientation !== "0" && (actWidth == "H" && item.CrushVert > 0)) {
                                            var crushItem = item.RW * (1 - item.CrushVert / 100) + item.SpreadItem * (item.BHoriz - 1);
                                        } else if (item.Orientation !== "0" && (actWidth == "D" && item.CrushD > 0)) {
                                            var crushItem = item.RW * (1 - item.CrushD / 100) + item.SpreadItem * (item.BHoriz - 1);
                                        } else {
                                            var crushItem = item.W;
                                        }

                                        if (max.CrushHoriz > 0 && max.Orientation == "0") {
                                            var crushMax = max.RW * (1 - max.CrushHoriz / 100) + max.SpreadItem * (max.BHoriz - 1);
                                        } else if (max.Orientation !== "0" && (actWidthM == "H" && max.CrushVert > 0)) {
                                            var crushMax = max.RW * (1 - max.CrushVert / 100) + max.SpreadItem * (max.BHoriz - 1);
                                        } else if (max.Orientation !== "0" && (actWidthM == "D" && max.CrushD > 0)) {
                                            var crushMax = max.RW * (1 - max.CrushD / 100) + max.SpreadItem * (max.BHoriz - 1);
                                        } else {
                                            var crushMax = max.W;
                                        }
                                        //ASA-2045 Issue6 & Issue7 End
                                        if (p_spread_product == "F") {
                                            finalX = wpdSetFixed(max.X + crushMax / 2 + crushItem / 2 + item.SpreadItem);
                                        } else {
                                            finalX = wpdSetFixed(max.X + max.W / 2 + item.W / 2 + item.SpreadItem);
                                        }
                                        
                                        // ASA-1659
                                        if (p_item_index == shelfdtl.ItemInfo.length - 1 && g_overhung_shelf_active == "N") {
                                            const shelfEnd = wpdSetFixed(shelfdtl.X + shelfdtl.W / 2 + shelfdtl.ROverhang);
                                            if (wpdSetFixed(finalX + crushItem / 2) > shelfEnd) {
                                                finalX = shelfEnd - crushItem / 2;
                                                if (!(p_item_paste === "Y" && p_shelf_obj_type === "HANGINGBAR")) { //ASA-1927 Issue1
                                                    item.SpreadItem = wpdSetFixed(finalX - crushItem / 2 - (max.X + crushMax / 2));
                                                }
                                            }
                                        }
                                        // finalX = shelfdtl.ItemInfo[max_index].X + shelfdtl.ItemInfo[max_index].W / 2 + shelfdtl.ItemInfo[p_item_index].W / 2 + shelfdtl.ItemInfo[p_item_index].SpreadItem;
                                        // //ASA-1659
                                        // if (p_item_index == shelfdtl.ItemInfo.length - 1 && g_overhung_shelf_active == "N") {
                                        //     var shelfEnd = wpdSetFixed(shelfdtl.X + shelfdtl.W / 2 + shelfdtl.ROverhang);
                                        //     if (wpdSetFixed(finalX + shelfdtl.ItemInfo[p_item_index].W / 2) > shelfEnd) {
                                        //         finalX = shelfEnd - shelfdtl.ItemInfo[p_item_index].W / 2;
                                        //         if (!(p_item_paste === "Y" && p_shelf_obj_type === "HANGINGBAR")) { //ASA-1927 Issue1
                                        //             shelfdtl.ItemInfo[p_item_index].SpreadItem = wpdSetFixed(finalX - shelfdtl.ItemInfo[p_item_index].W / 2 - (shelfdtl.ItemInfo[max_index].X + shelfdtl.ItemInfo[max_index].W / 2));
                                        //         }
                                        //     }
                                        // }
                                        //ASA-1970 End
                                    }
                                }
                            } else {
                                finalX = shelfdtl.ItemInfo[p_item_index].X;
                            }
                        } else {
                            //ASA-1138
                            var overhungW = 0,
                                overhung = false;
                            //  if (typeof shelfdtl.Overhung !== "undefined" && shelfdtl.Overhung == "Y") {
                            for (const item of shelfdtl.ItemInfo) {
                                overhungW = wpdSetFixed(overhungW + item.W);
                            }
                            if (overhungW > wpdSetFixed(shelfdtl.W + shelfdtl.ROverhang + shelfdtl.LOverhang)) {
                                overhung = true;
                            }
                            //  }
                            if (p_item_index == 0 && overhung) {
                                finalX = wpdSetFixed(shelfdtl.ItemInfo[p_item_index].W / 2 + (shelfdtl.X - overhungW / 2) - shelfdtl.LOverhang);//ASA-1791 added overhung handling
                            } else if (item_fixed == "N" || item_fixed == "B") {
                                var max_index = -1;
                                if (typeof bottom_objid !== "undefined" && bottom_objid !== "") {
                                    // var newObjID = shelfdtl.ItemInfo[p_item_index].ObjID; //ASA-1540 #2
                                    finalX = shelfdtl.ItemInfo[get_shelf_item_ind(p_module_index, p_shelf_index, bottom_objid, p_pog_index)].X;
                                } else {
                                    //ASA-1970 Start
                                    if (shelfdtl.ItemInfo[p_item_index].CrushHoriz > 0 && shelfdtl.ItemInfo[p_item_index].BHoriz > 1 && p_spread_product == "F" && shelfdtl.ItemInfo[p_item_index].Orientation == "0") { //ASA-2045 Issue6 & Issue7
                                        var fWidth = shelfdtl.ItemInfo[p_item_index].RW * (1 - shelfdtl.ItemInfo[p_item_index].CrushHoriz / 100) + shelfdtl.ItemInfo[p_item_index].SpreadItem * (shelfdtl.ItemInfo[p_item_index].BHoriz - 1);
                                    //ASA-2045 Issue6 & Issue7 Start
                                    } else if (shelfdtl.ItemInfo[p_item_index].BHoriz > 1 && p_spread_product == "F" && shelfdtl.ItemInfo[p_item_index].Orientation !== "0") {
                                        var l_item = shelfdtl.ItemInfo[p_item_index];
                                        var [org_width, org_height, org_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(l_item.Orientation, l_item.OW, l_item.OH, l_item.OD);
                                        var l_crush_val = actualWidth == "H" ? l_item.CrushVert : actualWidth == "D" ? l_item.CrushD : l_item.CrushHoriz;
                                        var fWidth = shelfdtl.ItemInfo[p_item_index].RW * (1 - l_crush_val / 100) + shelfdtl.ItemInfo[p_item_index].SpreadItem * (shelfdtl.ItemInfo[p_item_index].BHoriz - 1);
                                    //ASA-2045 Issue6 & Issue7 End
                                    } else {
                                        var fWidth = shelfdtl.ItemInfo[p_item_index].W
                                    }
                                    //ASA-1970 End
                                    finalX = wpdSetFixed(shelf_start + fWidth / 2 - shelfdtl.LOverhang);//ASA-1791 added overhung handling
                                }
                            } else {
                                finalX = shelfdtl.ItemInfo[p_item_index].X;
                            }
                        }
                    } else if (p_spread_product == "M") {
                        //ASA-1129
                        finalX = shelfdtl.ItemInfo[p_item_index].X;
                    }
                } else {
                    if (p_shelf_obj_type == "BASKET") {
                        var max_merch = get_max_merch(p_module_index, p_shelf_index, p_item_index, "N", p_locationX, p_pog_index);
                        var item_qty = shelfdtl.ItemInfo[p_item_index].Quantity;
                        if (shelfdtl.ItemInfo[p_item_index].Item !== "DIVIDER") {
                            //ASA-1085
                            if (basket_spread == "LR") {
                                if (basket_fill == "T" || basket_fill == "M") {
                                    shelfdtl.ItemInfo[p_item_index].W = shelfdtl.ItemInfo[p_item_index].D * item_qty;
                                    shelfdtl.ItemInfo[p_item_index].H = max_merch;
                                } else if (basket_fill == "F") {
                                    var quantity = get_basket_fill_count(p_module_index, p_shelf_index, basket_spread, basket_fill, shelf_width, max_merch, shelf_depth, p_pog_index);
                                    shelfdtl.ItemInfo[p_item_index].W = shelfdtl.ItemInfo[p_item_index].D * quantity;
                                    shelfdtl.ItemInfo[p_item_index].H = max_merch;
                                    shelfdtl.ItemInfo[p_item_index].Quantity = quantity;
                                }
                                if (p_item_index == 0) {
                                    finalX = shelf_start + parseFloat(shelfdtl.ItemInfo[p_item_index].W) / 2;
                                    shelfdtl.ItemInfo[p_item_index].Y = shelfY + shelf_height / 2 + shelfdtl.ItemInfo[p_item_index].H / 2;
                                } else {
                                    var prevItem = shelfdtl.ItemInfo[p_item_index - 1].Item;
                                    var newIndex = p_item_index - 1;
                                    var itemStart = shelf_start;
                                    if (prevItem == "DIVIDER") {
                                        //ASA-1085
                                        if (typeof shelfdtl.ItemInfo[p_item_index - 2] !== "undefined") {
                                            newIndex = p_item_index - 2;
                                            itemStart = shelfdtl.ItemInfo[newIndex].X + shelfdtl.ItemInfo[newIndex].W / 2;
                                        }
                                    } else {
                                        itemStart = shelfdtl.ItemInfo[newIndex].X + shelfdtl.ItemInfo[newIndex].W / 2;
                                    }

                                    finalX = itemStart + parseFloat(shelfdtl.ItemInfo[p_item_index].W) / 2;
                                    shelfdtl.ItemInfo[p_item_index].Y = shelfY + shelf_height / 2 + shelfdtl.ItemInfo[p_item_index].H / 2;
                                }
                            } else if (basket_spread == "BT") {
                                if (basket_fill == "T") {
                                    shelfdtl.ItemInfo[p_item_index].W = shelf_width;
                                    shelfdtl.ItemInfo[p_item_index].H = 0.02;
                                    shelfdtl.ItemInfo[p_item_index].Quantity = 1;
                                } else if (basket_fill == "F") {
                                    var quantity = get_basket_fill_count(p_module_index, p_shelf_index, basket_spread, basket_fill, shelf_width, max_merch, shelf_depth, p_pog_index);
                                    shelfdtl.ItemInfo[p_item_index].W = shelf_width;
                                    shelfdtl.ItemInfo[p_item_index].H = shelfdtl.ItemInfo[p_item_index].OD * quantity;
                                    shelfdtl.ItemInfo[p_item_index].Quantity = quantity;
                                } else if (basket_fill == "M") {
                                    shelfdtl.ItemInfo[p_item_index].W = shelf_width;
                                    shelfdtl.ItemInfo[p_item_index].H = shelfdtl.ItemInfo[p_item_index].OD * item_qty;
                                    shelfdtl.ItemInfo[p_item_index].Quantity = item_qty;
                                }
                                finalX = shelf_start + parseFloat(shelfdtl.ItemInfo[p_item_index].W) / 2;
                                if (p_item_index == 0) {
                                    shelfdtl.ItemInfo[p_item_index].Y = shelfY + shelf_height / 2 + shelfdtl.ItemInfo[p_item_index].H / 2;
                                    finalX = shelf_start + parseFloat(shelfdtl.ItemInfo[p_item_index].W) / 2;
                                } else {
                                    finalX = shelf_start + parseFloat(shelfdtl.ItemInfo[p_item_index].W) / 2;
                                    var prevItem = shelfdtl.ItemInfo[p_item_index - 1].Item;
                                    if (prevItem == "DIVIDER") {
                                        //ASA-1085
                                        if (typeof shelfdtl.ItemInfo[p_item_index - 2] !== "undefined") {
                                            newIndex = p_item_index - 2;
                                            shelfdtl.ItemInfo[p_item_index].Y = shelfdtl.ItemInfo[newIndex].Y + shelfdtl.ItemInfo[newIndex].H / 2 + parseFloat(shelfdtl.ItemInfo[p_item_index].H) / 2;
                                        } else {
                                            shelfdtl.ItemInfo[p_item_index].Y = shelfY + shelf_height / 2 + shelfdtl.ItemInfo[p_item_index].H / 2;
                                        }
                                    } else {
                                        shelfdtl.ItemInfo[p_item_index].Y = shelfdtl.ItemInfo[p_item_index - 1].Y + shelfdtl.ItemInfo[p_item_index - 1].H / 2 + parseFloat(shelfdtl.ItemInfo[p_item_index].H) / 2;
                                    }
                                }
                            } else if (basket_spread == "FB") {
                                //if (i_item_index == 0) {
                                shelfdtl.ItemInfo[p_item_index].W = shelf_width;
                                shelfdtl.ItemInfo[p_item_index].H = max_merch;
                                finalX = shelf_start + parseFloat(shelfdtl.ItemInfo[p_item_index].W) / 2;
                                shelfdtl.ItemInfo[p_item_index].Y = shelfY + shelf_height / 2 + shelfdtl.ItemInfo[p_item_index].H / 2;

                                if (basket_fill == "F") {
                                    var quantity = get_basket_fill_count(p_module_index, p_shelf_index, "FB", "F", shelf_width, max_merch, shelf_depth, p_pog_index);
                                } else if ((basket_fill = "M")) {
                                    var quantity = item_qty;
                                } else {
                                    var quantity = 1;
                                }
                                shelfdtl.ItemInfo[p_item_index].Quantity = quantity;
                                //}
                            }
                        } else {
                            if (shelfdtl.ItemInfo[p_item_index].Item == "DIVIDER") {
                                //ASA-1085
                                finalX = shelfdtl.ItemInfo[p_item_index].X;
                                //shelfdtl.ItemInfo[i_item_index].Y = g_finalY;
                            } else {
                                finalX = shelfdtl.ItemInfo[p_item_index].X;
                            }
                        }
                    } else if ((p_shelf_obj_type == "CHEST" && g_chest_as_pegboard == "N") || p_shelf_obj_type == "PALLET") {
                        //ASA-1085
                        var sum_depth = 0;
                        var item_exists = shelfdtl.ItemInfo[p_item_index].Exists;
                        var chest_dragged = shelfdtl.ItemInfo[p_item_index].Dragged;
                        // ASA-2010.4.2 Start
                        // if (p_shelf_obj_type == "PALLET" && typeof bottom_objid !== "undefined" && bottom_objid !== "") {
                        //     finalX = shelfdtl.ItemInfo[get_shelf_item_ind(p_module_index, p_shelf_index, bottom_objid, p_pog_index);].X;
                        let l_item_ind;
                        if (p_shelf_obj_type == "PALLET" && typeof bottom_objid !== "undefined" && bottom_objid !== "") {
                            l_item_ind = get_shelf_item_ind(p_module_index, p_shelf_index, bottom_objid, p_pog_index);
                        }
                        if (p_shelf_obj_type == "PALLET" && typeof bottom_objid !== "undefined" && bottom_objid !== "" && l_item_ind >= 0) {
                            finalX = shelfdtl.ItemInfo[l_item_ind].X;
                        // ASA-2010.4.2 End
                        } else {
                            if (chest_dragged == "Y") {
                                if (p_item_length == 1 && p_edit_ind == "N") {
                                    finalX = shelf_start + parseFloat(p_width) / 2 - shelfdtl.LOverhang;
                                } else if (p_item_length > 1 && p_edit_ind == "N") {
                                    if (p_item_index > 0) {
                                        finalX = shelfdtl.ItemInfo[p_item_index - 1].X + shelfdtl.ItemInfo[p_item_index - 1].W / 2 + parseFloat(p_width) / 2 + p_spread_gap;
                                    } else {
                                        finalX = shelf_start + parseFloat(p_width) / 2 - shelfdtl.LOverhang;
                                    }
                                } else if (p_locationX + p_width / 2 > shelfdtl.X + shelfdtl.W / 2) {
                                    if (p_item_index !== g_edited_item_index) {
                                        finalX = shelfdtl.ItemInfo[p_item_index].X;
                                    } else if (p_item_index > 0) {
                                        finalX = shelfdtl.ItemInfo[p_item_index - 1].X + shelfdtl.ItemInfo[p_item_index - 1].W / 2 + parseFloat(p_width) / 2 + p_spread_gap;
                                    } else {
                                        finalX = shelf_start + parseFloat(p_width) / 2 - shelfdtl.LOverhang;
                                    }
                                } else {
                                    finalX = shelfdtl.ItemInfo[p_item_index].X;
                                }
                            } else {
                                shelfdtl.ItemInfo[p_item_index].Dragged = "Y";
                                if (item_exists == "E") {
                                    finalX = shelfdtl.ItemInfo[p_item_index].X;
                                } else if (p_item_index > 0 && g_edited_item_index !== p_item_index) {
                                    finalX = shelfdtl.ItemInfo[p_item_index - 1].X + shelfdtl.ItemInfo[p_item_index - 1].W / 2 + parseFloat(p_width) / 2 + p_spread_gap;
                                } else if (g_edited_item_index !== p_item_index && p_item_index == 0) {
                                    finalX = shelf_start + parseFloat(p_width) / 2 + shelfdtl.LOverhang;
                                } else if (g_edited_item_index == p_item_index && p_edit_ind == "Y") {
                                    finalX = shelfdtl.ItemInfo[p_item_index].X;
                                } else {
                                    finalX = p_locationX;
                                }
                            }
                        }
                    } else if (p_shelf_obj_type == "ROD") {
                        finalX = shelfdtl.X;
                    } else if (p_shelf_obj_type == "PEGBOARD" || (p_shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                        finalX = find_pegboard_gap(p_width, p_height, shelfdtl.ItemInfo[p_item_index].X, shelfdtl.ItemInfo[p_item_index].Y, p_horiz_gap, p_module_index, p_shelf_index, p_item_index, g_edited_item_index, "N", p_pog_index, "Y", g_auto_x_space, g_auto_y_space, p_itemInsidePeg);
                    } else {
                        finalX = p_locationX;
                    }
                }
            }
        }
        logDebug("function : get_item_xaxis", "E");
        return wpdSetFixed(finalX);
    } catch (err) {
        error_handling(err);
    }
}

function get_item_xy(p_shelfs, p_items, p_item_width, p_item_height, p_pog_index) {
    logDebug("function : get_item_xy; item_width : " + p_item_width + "; item_height : " + p_item_height, "S");
    try {
        var itemx = 0,
            itemy = 0;

        if (p_shelfs.ObjType == "BASKET" && p_shelfs.BsktSpreadProduct == "BT") {
            itemx = p_shelfs.X - p_shelfs.W / 2 + p_item_width / 2;
            itemy = p_shelfs.Y + p_shelfs.H / 2 + p_items.Distance + p_item_height / 2;
        } else if (p_shelfs.ObjType == "HANGINGBAR") {
            itemx = p_shelfs.X - p_shelfs.W / 2 + p_items.Distance + p_item_width / 2;
            itemy = p_shelfs.Y - p_item_height / 2;
        } else if (p_shelfs.ObjType == "ROD") {
            itemx = p_shelfs.X;
            itemy = p_shelfs.Y - p_shelfs.H / 2 - p_item_height / 2;
        } else if (p_shelfs.ObjType == "PEGBOARD" || (p_shelfs.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
            var peg_verti_arr = p_shelfs.peg_vert_values;
            var peg_details = [];
            $.each(peg_verti_arr, function (i, details) {
                peg_details.push(p_shelfs.Y + peg_verti_arr[i]);
            });
            var item_start = p_items.Y + p_item_height / 2;
            if (peg_details.length > 0) {
                var closest = peg_details.reduce((a, b) => {
                    return Math.abs(b - item_start) < Math.abs(a - item_start) ? b : a;
                });
            }
            itemx = p_shelfs.X - p_shelfs.W / 2 + p_items.PegBoardX + p_item_width / 2;
            itemy = parseFloat(closest) - p_item_height / 2;
            if (typeof p_items.PegBoardY !== "undefined" && p_items.PegBoardY !== "") {
                itemy = p_shelfs.Y - p_shelfs.H / 2 + p_items.PegBoardY + p_item_height / 2;
            } else {
                itemy = parseFloat(closest) - p_item_height / 2;
            }
        } else {
            itemx = p_shelfs.X - p_shelfs.W / 2 + p_items.Distance + p_item_width / 2;
            itemy = p_shelfs.Y + p_shelfs.H / 2 + p_item_height / 2;
        }

        if (p_items.Item == "DIVIDER" && p_shelfs.ObjType == "BASKET") {
            itemy = g_finalY;
        }
        logDebug("function : get_item_xy", "E");
        return [wpdSetFixed(itemx), wpdSetFixed(itemy)]; //ASA-1471 issue 9
    } catch (err) {
        error_handling(err);
        throw err;
    }
}


//Start ASA-1350 issue 6
async function recreate_all_items(p_module_index, p_shelf_index, p_shelf_obj_type, p_edit_ind, p_locationX, p_edit_item_index, p_item_length, p_fresh_item, p_shelf_edit, p_redoX, p_items_list, p_create_canvas, p_calc_supply, p_pog_index, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_merge_items = "Y", p_itemInsidePeg = "Y") {
    logDebug("function : recreate_all_items; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; shelf_obj_type : " + p_shelf_obj_type + "; p_edit_ind : " + p_edit_ind + "; locationX : " + p_locationX + "; edit_item_index : " + p_edit_item_index + "; item_length : " + p_item_length + "; shelf_edit : " + p_shelf_edit + "; redoX : " + p_redoX + "; create_canvas : " + p_create_canvas, "S");
    try {
        //ASA-1129, start
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index]; //ASA-1350 issue 6 converted whole length declaration to variable.
        var spread_product = shelfdtl.SpreadItem;
        var shelfCount = 1,
            [currCombinationIndex, currShelfCombIndx] = [-1, -1];
        (currCombinationIndex = -1), (currShelfCombIndx = -1);
        //check if current shelf that is sent for recreate is a part of combined shelf or not.
        if ((shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR") && shelfdtl.Combine !== "N") {
            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
        }
        //if the shelf is a part of combine shelf then set all the items relative x and y and also populate them in the g_combineShelfs array.
        if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
            shelfCount = g_combinedShelfs[currCombinationIndex].length;
            await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, p_locationX, p_edit_ind, p_shelf_edit, p_redoX, p_edit_item_index, []); //ASA-1239
        }
        g_world = g_scene_objects[p_pog_index].scene.children[2];
        //if the shelf sent is a part of combined shelf then. run loop on all the shelfs in the combine set and recreate all of them.
        for (var s = 0; s < shelfCount; s++) {
            //get p_module_index and p_shelf_index for current shelf in combined shelfs set.
            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1 && shelfCount > 1) {
                p_module_index = g_combinedShelfs[currCombinationIndex][s].MIndex;
                p_shelf_index = g_combinedShelfs[currCombinationIndex][s].SIndex;
                spread_product = g_combinedShelfs[currCombinationIndex].SpreadItem;
            }
            console.log("recreate all items ", p_module_index, p_shelf_index, p_shelf_obj_type, p_edit_ind, p_locationX, p_edit_item_index, p_item_length, p_fresh_item, p_shelf_edit, p_redoX, p_items_list, p_create_canvas, p_calc_supply, p_pog_index);
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index]; //ASA-1350 issue 6 combine shelf will change items positions.
            var imageFlag = g_show_live_image; //create_canvas == "-1" ? g_show_live_image : create_canvas == 1 ? g_show_live_image : g_show_live_image_comp;
            var spread_gap = shelfdtl.HorizGap;
            var horiz_gap = spread_gap;
            var combine_ind = shelfdtl.Combine;
            var rotation = shelfdtl.Rotation;
            var shelf_start_X = shelfdtl.X - shelfdtl.W / 2;
            var shelf_start_Y = shelfdtl.Y - shelfdtl.H / 2;
            var total_item_width = 0,
                items_arr = [];
            var finalX = 0;

            if (p_items_list !== -1 && p_items_list !== "" && typeof p_items_list !== "undefined") {
                var items_arr = p_items_list;
            } else {
                var items_arr = shelfdtl.ItemInfo;
            }

            // ASA-1095, Start
            //This is a logic to merge same adjacent items by adding facings when they are place one after the other.
            //Note: in page 25 this parameter is passed as Y by default.
            if (shelfdtl.ObjType == "SHELF" && (shelfdtl.SpreadItem == "L" || shelfdtl.SpreadItem == "R") && p_merge_items == "Y") {
                //ASA-1350 issue 6 no need to merge when calling from other pages.
                var i = 0;
                for (item of shelfdtl.ItemInfo) {
                    var merged_item_index = mergeAdjacentItems(p_pog_index, p_module_index, p_shelf_index, i);
                    i++;
                }
            }
            var item_cnt = shelfdtl.ItemInfo.length;
            // ASA-1095, End
            //remove all the items from world for that shelf.
            var i = 0;
            for (const items of items_arr) {
                var selectedObject = g_world.getObjectById(items.ObjID);
                g_world.remove(selectedObject);
                total_item_width += items.W;
                i++;
            }

            shelfdtl.AvlSpace = shelfdtl.W + shelfdtl.LOverhang + shelfdtl.ROverhang;

            //This code will run the spread product = RIGHT. because loop has to run in reverse
            if (spread_product == "R") {
                var items_arr = shelfdtl.ItemInfo;
                if (shelfdtl.ObjType !== "PEGBOARD" && !(shelfdtl.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                    //ASA-1765
                    var fixedItemPresent = items_arr.some((items) => items.Fixed === "Y");
                    if (!(spread_product == "R" && fixedItemPresent && (shelfdtl.ObjType == "HANGINGBAR" || shelfdtl.ObjType == "SHELF"))) {
                        //ASA-1327
                        var sorto = {
                            X: "asc",
                        };
                        items_arr.keySort(sorto);
                    }
                }

                for (var i = items_arr.length - 1; i >= 0; i--) {
                    item_cnt = item_cnt - 1;
                    //getting x axis starting from the right corner item. will be at the end of the shelf.
                    finalX = get_item_xaxis(items_arr[i].W, items_arr[i].H, items_arr[i].D, p_shelf_obj_type, p_locationX, horiz_gap, spread_product, spread_gap, p_module_index, p_shelf_index, item_cnt, p_edit_ind, shelfdtl.ItemInfo.length, p_shelf_edit, p_pog_index, p_itemInsidePeg);
                    //We need to set the divider shelfinfo with the new details of X and hold the div_index to update the objID too.
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
                        if (div_index > -1) {
                            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].X = finalX;
                        }
                    }

                    shelfdtl.ItemInfo[item_cnt].Distance = finalX - items_arr[i].W / 2 - shelf_start_X;
                    if (shelfdtl.ObjType == "PEGBOARD" || (shelfdtl.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                        //ASA-1125
                        shelfdtl.ItemInfo[item_cnt].PegBoardX = finalX - items_arr[i].W / 2 - shelf_start_X;
                        shelfdtl.ItemInfo[item_cnt].PegBoardY = shelfdtl.ItemInfo[item_cnt].Y - items_arr[i].H / 2 - shelf_start_Y;
                        shelfdtl.ItemInfo[item_cnt].FromProductList = "N";
                    }
                    shelfdtl.ItemInfo[item_cnt].OldObjID = items_arr[i].ObjID;
                    var old_obj_id = items_arr[i].ObjID,
                        objID;

                    if (imageFlag == "Y" && items_arr[i].Item !== "DIVIDER" && items_arr[i].MerchStyle != 3) {
                        var details = g_orientation_json[shelfdtl.ItemInfo[item_cnt].Orientation];
                        var details_arr = details.split("###");
                        objID = await add_items_with_image(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, items_arr[i].BHoriz, items_arr[i].BVert, items_arr[i].Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", p_fresh_item, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index);
                    } else {
                        if (items_arr[i].Item == "DIVIDER") {
                            objID = add_items(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, items_arr[i].Rotation, p_pog_index);
                        } else {
                            objID = await add_items_prom(items_arr[i].ItemID, items_arr[i].W, items_arr[i].H, items_arr[i].D, items_arr[i].Color, finalX, items_arr[i].Y, "", p_module_index, p_shelf_index, i, "N", p_fresh_item, p_pogcrDelistItemDftColor, "", p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index);
                        }
                    }
                    //this array is used in set back MIndex, SIndex and of the item after recreate. because the item could have been moved to different shelf
                    //based on the spread product. so we need to get the new index of the item after recreate the shelfs.
                    for (var m = 0; m < g_combineItemModf.length; m++) {
                        if (g_combineItemModf[m].NewMIndex == p_module_index && g_combineItemModf[m].NewSIndex == p_shelf_index && g_combineItemModf[m].OldObjID == old_obj_id) {
                            g_combineItemModf[m]["NewObjID"] = objID;
                        }
                    }
                    //setting the border of each item based on the conditoin.
                    var selectedObject = g_world.getObjectById(objID);
                    if (items_arr[i].DimUpdate == "E") {
                        selectedObject.BorderColour = g_dim_error_color;
                        selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                    } else if (items_arr[i].Status == "N") {
                        selectedObject.BorderColour = g_status_error_color;
                        selectedObject.Status = "N";
                        selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                    } else if (nvl(items_arr[i].MovingItem) == "No" && g_pogcr_auto_hlite_non_mv_item == "Y") {
                        selectedObject.BorderColour = g_nonMovingItemColor;
                        selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                    } else {
                        if (nvl(items.OOSPerc) > 80 && g_pogcr_enbl_oos_border == "Y") {
                            //ASA-1688
                            selectedObject.BorderColour = g_pogcr_oos_border_color; //ASA-1688 Added to give blue border to item
                            selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                        } else {
                            selectedObject.BorderColour = 0x000000;
                        }
                    }
                    var l_final_z = 0;
                    if (shelfdtl.ObjType == "PEGBOARD") {
                        l_final_z = shelfdtl.Z + shelfdtl.D / 2 + items_arr[i].D / 2;
                    } else if (shelfdtl.ObjType == "PALLET") {
                        if (shelfdtl.ItemInfo[i].Edited == "N") {
                            l_final_z = +(items_arr[i].D / 2);
                        } else {
                            l_final_z = shelfdtl.ItemInfo[i].Z;
                        }
                    } else {
                        l_final_z = 0.001 + shelfdtl.D / 1000;
                    }
                    shelfdtl.ItemInfo[i].X = finalX;
                    shelfdtl.ItemInfo[i].Z = l_final_z;
                    shelfdtl.ItemInfo[i].ObjID = objID;
                    shelfdtl.ItemInfo[i].CType = shelfdtl.ObjType;

                    //if the item is a top or bottom item. then we need to reset the object ID set in each item to identify which item is on top and which is below.
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
                if (shelfdtl.ObjType !== "PEGBOARD" && !(shelfdtl.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                    //ASA-1765
                    var fixedItemPresent = items_arr.some((items) => items.Fixed === "Y");
                    if (!(spread_product == "L" && fixedItemPresent && (shelfdtl.ObjType == "HANGINGBAR" || shelfdtl.ObjType == "SHELF"))) {
                        //ASA-1327
                        var sorto = {
                            X: "asc",
                        };
                        //ASA-1970 Issue1 Start
                        if (g_allowItemSort == "Y") {
                            items_arr.keySort(sorto);
                        };
                        //ASA-1970 Issue1 End
                    }
                }
                for (const items of items_arr) {
                    if (p_redoX !== -1 && i == p_edit_item_index) {
                        finalX = p_redoX;
                    } else {
                        finalX = get_item_xaxis(items.W, items.H, items.D, p_shelf_obj_type, p_locationX, horiz_gap, spread_product, spread_gap, p_module_index, p_shelf_index, i, p_edit_ind, shelfdtl.ItemInfo.length, p_shelf_edit, p_pog_index, p_itemInsidePeg);
                    }
                    //We need to set the divider shelfinfo with the new details of X and hold the div_index to update the objID too.
                    if (items.Item == "DIVIDER") {
                        var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
                        var div_index = -1;
                        var ShelfInfo = {};
                        var j = 0;
                        for (const shelfs of shelf_arr) {
                            if (shelfs.Shelf == items.ItemID && shelfs.ObjType == "DIVIDER") {
                                div_index = j;
                            }
                            j++;
                        }
                        if (div_index > -1) {
                            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].X = finalX;
                        }
                    }
                    shelfdtl.ItemInfo[i].Distance = finalX - items.W / 2 - shelf_start_X;
                    if (shelfdtl.ObjType == "PEGBOARD" || (shelfdtl.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                        //ASA-1125
                        shelfdtl.ItemInfo[i].PegBoardX = finalX - items.W / 2 - shelf_start_X;
                        shelfdtl.ItemInfo[i].PegBoardY = shelfdtl.ItemInfo[i].Y - items.H / 2 - shelf_start_Y;
                        shelfdtl.ItemInfo[i].FromProductList = "N";
                    }
                    shelfdtl.ItemInfo[i].OldObjID = items.ObjID;
                    var old_obj_id = items.ObjID,
                        objID;
                    if (imageFlag == "Y" && items.Item !== "DIVIDER" && items_arr[i].MerchStyle != 3) {
                        var details = g_orientation_json[shelfdtl.ItemInfo[i].Orientation];
                        var details_arr = details.split("###");
                        objID = await add_items_with_image(items.ItemID, items.W, items.H, items.D, items.Color, finalX, shelfdtl.ItemInfo[i].Y, "", p_module_index, p_shelf_index, i, items.BHoriz, items.BVert, items.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", p_fresh_item, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index);
                    } else {
                        if (items.Item == "DIVIDER") {
                            objID = add_items(items.ItemID, items.W, items.H, items.D, items.Color, finalX, items.Y, "", p_module_index, p_shelf_index, i, items.Rotation, p_pog_index);
                        } else {
                            objID = await add_items_prom(items.ItemID, items.W, items.H, items.D, items.Color, finalX, shelfdtl.ItemInfo[i].Y, "", p_module_index, p_shelf_index, i, "N", p_fresh_item, p_pogcrDelistItemDftColor, "", p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index);
                        }
                    }
                    //this array is used in set back MIndex, SIndex and of the item after recreate. because the item could have been moved to different shelf
                    //based on the spread product. so we need to get the new index of the item after recreate the shelfs.
                    for (var m = 0; m < g_combineItemModf.length; m++) {
                        if (g_combineItemModf[m].NewMIndex == p_module_index && g_combineItemModf[m].NewSIndex == p_shelf_index && g_combineItemModf[m].OldObjID == old_obj_id) {
                            g_combineItemModf[m]["NewObjID"] = objID;
                        }
                    }
                    //setting the border of each item based on the conditoin.
                    var selectedObject = g_world.getObjectById(objID);
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
                        if (nvl(items.OOSPerc) > 80 && g_pogcr_enbl_oos_border == "Y") {
                            //ASA-1688
                            selectedObject.BorderColour = g_pogcr_oos_border_color; //ASA-1688 Added to give blue border to item
                            selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                        } else {
                            selectedObject.BorderColour = 0x000000;
                        }
                    }
                    if (shelfdtl.ObjType == "PEGBOARD") {
                        l_final_z = shelfdtl.Z + shelfdtl.D / 2 + items.D / 2;
                    } else if (shelfdtl.ObjType == "PALLET") {
                        if (items.Edited == "N" && (typeof items.TopObjID == "undefined" || items.TopObjID == "") && typeof items.BottomObjID == "undefined" && items.BottomObjID == "") {
                            l_final_z = +(items.D / 2);
                        } else {
                            l_final_z = shelfdtl.ItemInfo[i].Z;
                        }
                    } else {
                        l_final_z = 0.001 + shelfdtl.D / 1000;
                    }

                    shelfdtl.ItemInfo[i].X = finalX;
                    shelfdtl.ItemInfo[i].Z = l_final_z;
                    shelfdtl.ItemInfo[i].ObjID = objID;
                    shelfdtl.ItemInfo[i].CType = shelfdtl.ObjType;
                    //if the item is a top or bottom item. then we need to reset the object ID set in each item to identify which item is on top and which is below.
                    if ((typeof items.TopObjID !== "undefined" && items.TopObjID !== "") || (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "")) {
                        var tier_ind;
                        if (items.TopObjID !== "" && typeof items.TopObjID !== "undefined") {
                            tier_ind = "BOTTOM";
                        } else {
                            tier_ind = "TOP";
                        }
                        var returnval = reset_top_bottom_obj_id(tier_ind, old_obj_id, objID, finalX, "N", p_pog_index);
                    }

                    if (items.Item == "DIVIDER" && div_index > -1) {
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].ShelfDivObjID = objID;
                    }
                    i = i + 1;
                }
                console.log("finished loop ", p_module_index, p_shelf_index, shelfdtl.Shelf, getDateTime());
            }

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
            if (p_calc_supply == "") {
                var res = await calculateFixelAndSupplyDays("N", p_pog_index);
            }
            if (g_show_live_image == "Y" && g_canvas_objects.length > 0) {
                //Regression Issue 5
                animate_pog(p_pog_index);
            }
            g_item_edit_flag = "";
            g_item_index = "";
        }
        logDebug("function : recreate_all_items", "E");
        return finalX;
    } catch (err) {
        console.log("err", err);
        error_handling(err);
    }
}

//This function is used to reset TopObjID amd BottomObjID after recreate the items. this is necessary to identify which item is on top and which is below.
async function reset_top_bottom_obj_id(p_tier_ind, p_old_id, p_new_id, p_bottom_x, p_reset, p_pog_index) {
    logDebug("function : reset_top_bottom_obj_id; tier_ind : " + p_tier_ind + "; old_id : " + p_old_id + "; new_id : " + p_new_id + "; bottom_x : " + p_bottom_x + "; reset : " + p_reset, "S");
    var module_details = g_pog_json[p_pog_index].ModuleInfo;
    var j = 0;
    for (const Modules of module_details) {
        if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
            var k = 0;
            for (const Shelf of Modules.ShelfInfo) {
                if (typeof Shelf !== "undefined") {
                    if (Shelf.ObjType == "SHELF" || Shelf.ObjType == "PALLET") {
                        if (Shelf.ItemInfo.length > 0) {
                            var l = 0;
                            for (const items of Shelf.ItemInfo) {
                                if (p_reset == "Y" && p_tier_ind == "BOTTOM" && items.BottomObjID == p_new_id) {
                                    g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].X = p_bottom_x;
                                    selected_object = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].ObjID);
                                    selected_object.position.set(p_bottom_x, items.Y, 0.001 + g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].D / 1000);
                                }
                                if (p_tier_ind == "TOP" && items.TopObjID == p_old_id && p_reset == "N") {
                                    g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].TopObjID = p_new_id;
                                } else if (p_tier_ind == "BOTTOM" && items.BottomObjID == p_old_id) {
                                    g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].BottomObjID = p_new_id;
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
    logDebug("function : reset_top_bottom_obj_id", "E");
    return "SUCCESS";
}


/*START ASA-1410*/
//This function will check passed items cap style and set all the required attributes to recreate those items and show capping on screen.
//this function is also used in "check_crush_facing_correct" to auto correct items onload. if the validation fails. it will mark it as validation failed.
async function set_item_capping(p_pog_index, p_module_index, p_shelf_index, p_item_index, p_on_load, p_set_value) {
    logDebug("function : set_item_capping; i_item_index : " + p_item_index, "S");
    try {
        //This function is also called from create_shelf_from_json_lib. when a POG is done mass update. the capping attributes are copied from the previous
        // version json for same item and added in new version same item. Now when user opens that POG. we need to apply same capping.
        //for that we will not have the details of shelfs above the item currently passed in g_pog_json because items and shelfs are added in loop only.
        //so we use g_json and p_on_load will be Y.
        if (p_on_load == "Y" && typeof g_json[0] !== "undefined" && g_json.length > 0) {
            //ASA-1410 issue 10 20240625
            if (typeof g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index] !== "undefined") {
                var shelfdtl = g_json[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
                var itemdtl = shelfdtl.ItemInfo[p_item_index];
                var item_height = itemdtl.RH * itemdtl.BVert;
                var real_depth = itemdtl.RD * itemdtl.BaseD;
            } else {
                var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
                var itemdtl = shelfdtl.ItemInfo[p_item_index];
                var item_height = itemdtl.RH;
                var real_depth = itemdtl.RD;
            }
        } else {
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
            var itemdtl = shelfdtl.ItemInfo[p_item_index];
            var item_height = itemdtl.RH;
            var real_depth = itemdtl.RD;
        } //End ASA-1410 issue 10 20240625
        //var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];//ASA-1410 issue 10 20240625

        var itemdtl_cnt = -1;
        var modules = g_pog_json[p_pog_index].ModuleInfo[p_module_index];
        /*var item_height = itemdtl.RH,//itemdtl.H //ASA-1410//ASA-1410 issue 10 20240625
            // item_depth = itemdtl.D, //ASA-1410
            real_depth = itemdtl.RD,*/

        //var new_height = p_item_height * p_vert_facing + (items.VertGap / 100) * (p_vert_facing - 1); //ASA-1170 : - crush_height;
        var new_height = 0,
            cap_width = 0,
            cap_height = 0,
            valid_pass = "N", //ASA-1410 Issue 10 //ASA-1412 issue 1 20240628
            cap_depth = 0,
            cap_max_merch = 0; //ASA-1412 issue 1 20240628
        // capping is only allowed for SHELF.
        if ((itemdtl.CapStyle == "1" || itemdtl.CapStyle == "2" || itemdtl.CapStyle == "3") && shelfdtl.ObjType == "SHELF") {
            var cap_merch = itemdtl.CapMerch;
            //if called from create_shelf_from_json_lib then user g_json
            if (p_on_load == "Y" && typeof g_json[0] !== "undefined") {
                //ASA-1410 issue 10 20240625
                var l_max_merch = get_onload_max_merch(p_module_index, p_shelf_index, modules, shelfdtl, g_dft_max_merch, 0, g_json);
            } else {
                var l_max_merch = get_cap_max_merch(p_module_index, p_shelf_index, modules, shelfdtl, p_pog_index, g_dft_max_merch); //ASA-1353 issue 3 --Task_27104 20240419//20240415 - Regression Issue 8
            }
            cap_max_merch = l_max_merch; //ASA-1412 issue 1 20240628
            var cap_max_high = itemdtl.CapMaxH;
            //var new_depth = real_depth * itemdtl.BaseD;//ASA-1410 issue 10 20240625

            var cap_merch = itemdtl.CapMerch == "" ? "0" : itemdtl.CapMerch;
            var cap_orientation = itemdtl.CapOrientaion == "" ? "4" : itemdtl.CapOrientaion;
            //based on the merch style of the cap setting get the dimensions.
            if (cap_merch == "0") {
                if (wpdSetFixed(itemdtl.UW) !== wpdSetFixed(itemdtl.OrgUW) || wpdSetFixed(itemdtl.UH) !== wpdSetFixed(itemdtl.OrgUH) || wpdSetFixed(itemdtl.UD) !== wpdSetFixed(itemdtl.OrgUD)) {
                    cap_width = itemdtl.OrgUW;
                    cap_height = itemdtl.OrgUH;
                    cap_depth = itemdtl.OrgUD;
                } else {
                    cap_width = itemdtl.UW;
                    cap_height = itemdtl.UH;
                    cap_depth = itemdtl.UD;
                }
            } else if (cap_merch == "2") {
                if (wpdSetFixed(itemdtl.CW) !== wpdSetFixed(itemdtl.OrgCW) || wpdSetFixed(itemdtl.CH) !== wpdSetFixed(itemdtl.OrgCH) || wpdSetFixed(itemdtl.CD) !== wpdSetFixed(itemdtl.OrgCD)) {
                    cap_width = itemdtl.OrgCW;
                    cap_height = itemdtl.OrgCH;
                    cap_depth = itemdtl.OrgCD;
                } else {
                    cap_width = itemdtl.CW;
                    cap_height = itemdtl.CH;
                    cap_depth = itemdtl.CD;
                }
            } else if (cap_merch == "1") {
                if (wpdSetFixed(itemdtl.TW) !== wpdSetFixed(itemdtl.OrgTW) || wpdSetFixed(itemdtl.TH) !== wpdSetFixed(itemdtl.OrgTH) || wpdSetFixed(itemdtl.TD) !== wpdSetFixed(itemdtl.OrgTD)) {
                    cap_width = itemdtl.OrgTW;
                    cap_height = itemdtl.OrgTH;
                    cap_depth = itemdtl.OrgTD;
                } else {
                    cap_width = itemdtl.TW;
                    cap_height = itemdtl.TH;
                    cap_depth = itemdtl.TD;
                }
            } else if (cap_merch == "3") {
                if (wpdSetFixed(itemdtl.DW) !== wpdSetFixed(itemdtl.OrgDW) || wpdSetFixed(itemdtl.DH) !== wpdSetFixed(itemdtl.OrgDH) || wpdSetFixed(itemdtl.DD) !== wpdSetFixed(itemdtl.OrgDD)) {
                    cap_width = itemdtl.OrgDW;
                    cap_height = itemdtl.OrgDH;
                    cap_depth = itemdtl.OrgDD;
                } else {
                    cap_width = itemdtl.DW;
                    cap_height = itemdtl.DH;
                    cap_depth = itemdtl.DD;
                }
            }
            // if there is cap orientation set. get the dimensions based on orientation.
            var [cWidth, cHeight, cDepth, capActualHeight, capActualWidth, capActualDepth] = get_new_orientation_dim(cap_orientation, cap_width, cap_height, cap_depth);

            var orgCapDepth = cap_height;
            var mCapDepthCount = itemdtl.CapDepth !== "" && itemdtl.CapDepth > 1 ? parseInt(itemdtl.CapDepth) : 1;
            var mCapDepth = orgCapDepth * mCapDepthCount;
            if (mCapDepth > real_depth) {
                //ASA-1410 issue 10 20240625
                itemdtl.CapDepth = Math.trunc(real_depth / cDepth);
            }
            //if the actual cap height is W. then user cap_width else always use depth.
            if (capActualHeight == "W") {
                cap_height = cap_width;
            } else {
                cap_height = cap_depth;
            }
            var mCapCount = itemdtl.CapFacing !== "" && itemdtl.CapFacing > 0 && itemdtl.CapFacing > cap_max_high && cap_max_high > 0 ? parseInt(cap_max_high) : parseInt(itemdtl.CapFacing);
            //validation if RD is less then capping dimension depth then no capping allowed.
            //validation if no of cappings exceeds items CapMaxH. then set back capping to CapMaxH.
            //Logic for cap style = 1 (Min cap)
            //always set 1 capping only and vertical facings does not change.
            if (itemdtl.CapStyle == "1") {
                l_max_merch = l_max_merch - item_height;
                itemdtl_cnt = Math.trunc(l_max_merch / cap_height);
                if (real_depth < cDepth) {
                    itemdtl_cnt = 0;
                }
                if (itemdtl_cnt > 0) {
                    itemdtl_cnt = 1;
                    new_height = item_height + cap_height * itemdtl_cnt;
                }
                //Logic for cap style = 2 (Med Cap)
                //keep the vertical facings intact and increase no of capping count till reach the max merch.
            } else if (itemdtl.CapStyle == "2") {
                //  l_max_merch = l_max_merch - new_height; //vivek
                l_max_merch = l_max_merch - item_height;
                itemdtl_cnt = Math.trunc(l_max_merch / cap_height);
                if (itemdtl.MaxHCapStyle == "2" && itemdtl_cnt > cap_max_high && cap_max_high > 0) {
                    itemdtl_cnt = cap_max_high;
                }
                if (itemdtl_cnt > 0) {
                    //ASA-1412 issue 11 2240709
                    itemdtl_cnt = itemdtl.MCapTopFacing == "Y" && mCapCount > 0 ? mCapCount : itemdtl_cnt;
                } else {
                    itemdtl_cnt = 0;
                }
                if (real_depth < cDepth) {
                    itemdtl_cnt = 0;
                }
                if (itemdtl_cnt > 0) {
                    //  p_item_height = new_height + cap_height * items_cnt; //ASA-1170 //vivek
                    new_height = item_height + cap_height * itemdtl_cnt;
                }
                //logic for cap style = 3 (Max Cap)
                //vertical facings will be changed to 1 and then calculate no of capping allowed till max merch.
            } else if (itemdtl.CapStyle == "3") {
                l_max_merch = l_max_merch - item_height / itemdtl.BVert; //ASA-1410 issue 10 20240625
                itemdtl_cnt = Math.trunc(l_max_merch / cap_height);
                if (itemdtl.MaxHCapStyle == "3" && itemdtl_cnt > cap_max_high && cap_max_high > 0) {
                    itemdtl_cnt = cap_max_high;
                }
                // itemdtl_cnt = itemdtl.MCapTopFacing == "Y" && mCapCount > 0 ? mCapCount : itemdtl_cnt;

                if (itemdtl_cnt > 0) {
                    //ASA-1412 issue 11 2240709
                    itemdtl_cnt = itemdtl.MCapTopFacing == "Y" && mCapCount > 0 ? mCapCount : itemdtl_cnt;
                } else {
                    itemdtl_cnt = 0;
                }

                if (real_depth < cDepth) {
                    itemdtl_cnt = 0;
                }
                if (itemdtl_cnt > 0) {
                    new_height = item_height / itemdtl.BVert + cap_height * itemdtl_cnt; //ASA-1412 issue 1 20240708
                    itemdtl.BVert = 1;
                }
            }
        }
        //if there is no items does not have dimensions. retain the cap settings as below.
        if (cap_width == 0 && cap_height == 0 && cap_depth == 0 && p_set_value == "Y") {
            //ASA-1410 Issue 10 //ASA-1412 issue 1 20240628
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapMerch = cap_merch;
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapOrientaion = cap_orientation;
        } else {
            //ASA-1410 Issue 10
            if (itemdtl_cnt > 0) {
                //setting all the capping attributes to make the item show its cappings on screen after recreate.
                var capHorzCount = itemdtl.BHoriz;
                var capCount = itemdtl_cnt * capHorzCount * mCapDepthCount;
                if (p_set_value == "Y") {
                    //ASA-1410 Issue 10 //ASA-1412 issue 1 20240628
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapFacing = itemdtl_cnt;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapMerch = cap_merch;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapOrientaion = cap_orientation;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHeight = cap_height;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].MCapTopFacing = itemdtl.MCapTopFacing;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapDepth = Math.trunc(real_depth / cDepth);

                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount = itemdtl_cnt;

                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHorz = capHorzCount;

                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapTotalCount = capCount;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H = new_height;
                    var [new_x, itemy] = get_item_xy(shelfdtl, itemdtl, itemdtl.W, itemdtl.H, p_pog_index);
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y = itemy;
                }
            } else {
                //Setting all the settings back to default when capping fails.
                if (p_set_value == "Y") {
                    //ASA-1410 Issue 10 //ASA-1412 issue 1 20240628
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapFacing = 0;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHeight = 0;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].MCapTopFacing = "N";
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapCount = 0;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapHorz = 0;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapDepth = 0;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapTotalCount = 0;
                    // g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapStyle = '0';//ASA-1412 issue 11 2240709       //ASA-1476 #5
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapStyle = itemdtl.CapStyle; //ASA-1412 issue 11 2240709       //ASA-1476 #5
                    //itemdtl.CapStyle = '0';//ASA-1412 issue 11 2240709
                    //item_height = item_height;// * itemdtl.BVert + (nvl(itemdtl.VertGap) / 100) * (itemdtl.BVert - 1);//ASA-1410 issue 10 20240625 ASA-1476 Issue 3
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H = item_height; //ASA-1476 Issue 3
                    var [new_x, itemy] = get_item_xy(shelfdtl, itemdtl, itemdtl.W, itemdtl.H, p_pog_index);
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y = itemy;
                }
            }
        } //ASA-1410 Issue 10
        //This function is also used for validating
        if (cap_max_merch >= new_height) {
            //ASA-1410 Issue 10 //ASA-1412 issue 1 20240628
            valid_pass = "Y";
        }
        return valid_pass;
    } catch (err) {
        error_handling(err);
    }
}
/*END ASA-1410*/


//Start ASA-1351 -- calculate depth facings on load it is needed to do auto depth facing calc
function maximizeItemDepthFacings(p_facingType, p_moduleIndex, p_shelfIndex, p_itemIndex, p_pog_index) {
    try {
        var module = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex]; //ASA-1273 PrasANNA
        var shelf_info = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
        var item_info = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex];
        var max_depth = findNearByShelfMaxDepth(p_moduleIndex, p_shelfIndex, p_itemIndex, p_itemIndex, -1, p_pog_index);
        //var max_merch = get_max_merch(p_moduleIndex, p_shelfIndex, p_itemIndex, "Y", -1, p_pog_index); //ASA-1273
        var depth_facing = 1;

        var spread_product = shelf_info.SpreadItem;
        var ShelfhorizGap = shelf_info.HorizGap;
        var nesting_value = item_info.NVal;
        var nesting_type = typeof item_info.ItemNesting !== "undefined" && item_info.ItemNesting !== "" ? item_info.ItemNesting : "";
        var ItemHorizGap = item_info.HorizGap;
        if (shelf_info.ObjType == "SHELF" || (shelf_info.ObjType == "HANGINGBAR" && g_auto_hangbar_facings == "Y") || (shelf_info.ObjType == "PEGBOARD" && shelf_info.AutoFillPeg == "Y") || shelf_info.ObjType == "CHEST") {
            if (!(item_info.TopObjID !== "" && typeof item_info.TopObjID !== "undefined" && item_info.BottomObjID !== "" && typeof item_info.BottomObjID !== "undefined") && item_info.Item !== "DIVIDER") {
                // ASA-1265
                if (g_auto_cal_depth_fac == "Y") {
                    //ASA-1255
                    if (p_facingType == "D" || p_facingType == "B") {
                        var shelf_depth;
                        // var real_depth = item_info.RD.toFixed(4) / item_info.BaseD;
                        var real_depth = wpdSetFixed(item_info.RD / item_info.BaseD);
                        if (item_info.MDepthCrushed == "Y" && item_info.CrushD > 0) {
                            real_depth = real_depth - real_depth * (item_info.CrushD / 100);
                        }
                        if (shelf_info.ObjType == "HANGINGBAR") {
                            shelf_depth = shelf_info.MaxMerch == 0 || shelf_info.MaxMerch == "" ? g_hangbar_dft_maxmerch : shelf_info.MaxMerch;
                        } else if (shelf_info.ObjType == "PEGBOARD") {
                            shelf_depth = shelf_info.MaxMerch == 0 || shelf_info.MaxMerch == "" ? g_pegboard_dft_item_depth : shelf_info.MaxMerch;
                        } else if (shelf_info.ObjType == "CHEST") {
                            shelf_depth = shelf_info.BsktWallH; //ASA-1178
                        } else {
                            shelf_depth = shelf_info.D;
                        }
                        var maxDepthForNesting = shelf_depth - max_depth - real_depth;
                        var l_dfacing = nvl(item_info.MPogDepthFacings) > 0 ? item_info.MPogDepthFacings : item_info.MDepthFacings; //ASA-1408 Issue 11
                        if (spread_product !== "F" && ShelfhorizGap == 0 && ItemHorizGap == 0 && nesting_value !== 0 && nesting_type !== "" && item_info.ItemNesting == "D") {
                            depth_facing = Math.floor((maxDepthForNesting * 100) / (nesting_value * 100)) + 1; //ASA-1519 Issue 4, need to add 1 for default facing
                            // depth_facing = item_info.MDepthFacings < depth_facing && item_info.MDepthFacings > -1 ? item_info.MDepthFacings : depth_facing; //ASA-874 //ASA-1408 Issue 11
                            depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-1408 Issue 11
                            g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].D = real_depth + (depth_facing > 0 ? depth_facing : 1) * nesting_value;
                        } else {
                            depth_facing = Math.floor((wpdSetFixed(shelf_depth - max_depth) * 100) / (real_depth * 100)); //ASA-1301
                            // depth_facing = item_info.MDepthFacings < depth_facing && item_info.MDepthFacings > -1 ? item_info.MDepthFacings : depth_facing; //ASA-874 //ASA-1408 Issue 11
                            depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-1408 Issue 11
                            g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].D = real_depth * (depth_facing > 0 ? depth_facing : 1);
                        }
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].RD = wpdSetFixed((item_info.RD / item_info.BaseD) * (depth_facing > 0 ? depth_facing : 1));
                        if (shelf_info.ObjType == "CHEST") {
                            var chestItemDFacing = l_dfacing < Math.trunc(shelf_info.BsktWallH / real_depth) && l_dfacing > -1 ? l_dfacing : Math.trunc(shelf_info.BsktWallH / real_depth); //ASA-1272 ISSUE-7 //ASA-1408 Issue 11
                            g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].BaseD = chestItemDFacing; //ASA-1272 ISSUE-7 //ASA-1408 Issue 11
                        } else {
                            g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].BaseD = depth_facing > 0 ? depth_facing : 1;
                        }

                        //ASA-1273 Prasanna start
                        var items = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex];
                        var cap_orientation = items.CapOrientaion == "" ? "4" : items.CapOrientaion;
                        var [cap_width, cap_height, cap_depth] = get_cap_dim(items);

                        var [cWidth, cHeight, cDepth, capActualHeight, capActualWidth, capActualDepth] = get_new_orientation_dim(cap_orientation, cap_width, cap_height, cap_depth);
                        if (items.CapDepthChanged == "N" || typeof items.CapDepthChanged == "undefined") {
                            //ASA-1273
                            g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapDepth = Math.trunc(item_info.RD / cDepth);
                        } //ASA-1273 End
                    }
                }
            }
        }
    } catch (err) {
        //Start ASA1310_20240307 crush item onload
        error_handling(err);
        throw err;
    }
}

//ASA-1273 Start Prasanna
function get_cap_dim(p_items) {
    try {
        var cap_width = 0,
            cap_height = 0,
            cap_depth = 0;
        var cap_merch = p_items.CapMerch == "" ? "0" : p_items.CapMerch;
        if (cap_merch == "0") {
            if (wpdSetFixed(p_items.UW) !== wpdSetFixed(p_items.OrgUW) || wpdSetFixed(p_items.UH) !== wpdSetFixed(p_items.OrgUH) || wpdSetFixed(p_items.UD) !== wpdSetFixed(p_items.OrgUD)) {
                cap_width = p_items.OrgUW;
                cap_height = p_items.OrgUH;
                cap_depth = p_items.OrgUD;
            } else {
                cap_width = p_items.UW;
                cap_height = p_items.UH;
                cap_depth = p_items.UD;
            }
        } else if (cap_merch == "2") {
            if (wpdSetFixed(p_items.CW) !== wpdSetFixed(p_items.OrgCW) || wpdSetFixed(p_items.CH) !== wpdSetFixed(p_items.OrgCH) || wpdSetFixed(p_items.CD) !== wpdSetFixed(p_items.OrgCD)) {
                cap_width = p_items.OrgCW;
                cap_height = p_items.OrgCH;
                cap_depth = p_items.OrgCD;
            } else {
                cap_width = p_items.CW;
                cap_height = p_items.CH;
                cap_depth = p_items.CD;
            }
        } else if (cap_merch == "1") {
            if (wpdSetFixed(p_items.TW) !== wpdSetFixed(p_items.OrgTW) || wpdSetFixed(p_items.TH) !== wpdSetFixed(p_items.OrgTH) || wpdSetFixed(p_items.TD) !== wpdSetFixed(p_items.OrgTD)) {
                cap_width = p_items.OrgTW;
                cap_height = p_items.OrgTH;
                cap_depth = p_items.OrgTD;
            } else {
                cap_width = p_items.TW;
                cap_height = p_items.TH;
                cap_depth = p_items.TD;
            }
        } else if (cap_merch == "3") {
            if (wpdSetFixed(p_items.DW) !== wpdSetFixed(p_items.OrgDW) || wpdSetFixed(p_items.DH) !== wpdSetFixed(p_items.OrgDH) || wpdSetFixed(p_items.DD) !== wpdSetFixed(p_items.OrgDD)) {
                cap_width = wpdSetFixed(p_items.OrgDW);
                cap_height = wpdSetFixed(p_items.OrgDH);
                cap_depth = wpdSetFixed(p_items.OrgDD);
            } else {
                cap_width = wpdSetFixed(p_items.DW);
                cap_height = wpdSetFixed(p_items.DH);
                cap_depth = wpdSetFixed(p_items.DD);
            }
        }
        return [cap_width, cap_height, cap_depth];
    } catch (err) {
        //Start ASA1310_20240307 crush item onload
        error_handling(err);
        throw err;
    }
} //ASA-1273 End