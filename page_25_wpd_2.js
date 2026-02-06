//This function is called when item is dropped can be single drop or multi edit to find out the shelf where item or divider is dropped using
//the X and Y of the dropped location.
// Two new params has been added p_item(carries dragged item) , p_is_pb_shelf_overlap(true/false do we need to check of overlapping of item with shelf inside pegboard) under ASA-1592
function get_div_shelf_index(p_final_x, p_final_y, p_curr_module, p_item_inside_world, p_pog_index, p_item, p_is_pb_shelf_overlap) {
    logDebug("function : get_div_shelf_index; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y + "; curr_module : " + p_curr_module + "; item_inside_world : " + p_item_inside_world, "S");
    try {
        var min_shelf = 100;
        var div_object_type;
        var div_shelf_index = -1;
        var shelfY = 0,
            shelfHeight = 0;
        var shelf_found = "N";
        var l_shelf_cnt = 0;
        var shelfInsidePeg = "N";
        //This block is when get_curr_module is called and it will know that p_item_inside_world = 'Y means. the item is dropped inside module.
        // there can be a case where we dropped item on shelf outside the module.
        if (p_item_inside_world == "Y") {
            for (const Shelf of g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo) {
                if (Shelf.Rotation > 0 || Shelf.Rotation < 0) {
                    var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.ShelfRotateWidth / 2);
                    var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.ShelfRotateWidth / 2);
                } else {
                    if (Shelf.ObjType === "PEGBOARD") {
                        //ASA-1769 Issue 2
                        var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.W / 2 + Shelf.ROverhang);
                        var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.W / 2 - Shelf.LOverhang);
                        var div_shelf_top = wpdSetFixed(Shelf.Y + Shelf.H / 2 + Shelf.UOverHang);
                        var div_shelf_bottom = wpdSetFixed(Shelf.Y - Shelf.H / 2 - Shelf.LoOverHang);
                    } else {
                        var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.W / 2);
                        var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.W / 2);
                        var div_shelf_top = wpdSetFixed(Shelf.Y + Shelf.H / 2);
                        var div_shelf_bottom = wpdSetFixed(Shelf.Y - Shelf.H / 2);
                    }
                }
                if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                    if (parseFloat(p_final_y) > div_shelf_bottom && parseFloat(p_final_y) < div_shelf_top && parseFloat(p_final_x) > div_shelf_start && parseFloat(p_final_x) < div_shelf_end) {
                        div_object_type = Shelf.ObjType;
                        shelfY = Shelf.Y;
                        shelfHeight = Shelf.H;
                        div_shelf_index = l_shelf_cnt;
                        shelf_found = "Y";
                        break;
                    } else if (wpdSetFixed(Shelf.Y - Shelf.H / 2) < p_final_y && (div_shelf_end > p_final_x || div_shelf_start < p_final_x) && parseFloat(p_final_x) > div_shelf_start && parseFloat(p_final_x) < div_shelf_end) {
                        if (min_shelf > wpdSetFixed(parseFloat(p_final_y) - parseFloat(Shelf.Y))) {
                            min_shelf = wpdSetFixed(parseFloat(p_final_y) - parseFloat(Shelf.Y));
                            div_object_type = Shelf.ObjType;
                            shelfY = Shelf.Y;
                            shelfHeight = Shelf.H;
                            div_shelf_index = l_shelf_cnt;
                            shelf_found = "Y";
                        }
                    }
                }
                l_shelf_cnt++;
            }
        } else {
            //This block is called when shelf is outside of any module.
            var l_mod_cnt = 0;
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (Modules.ParentModule == null) {
                    var l_shelf_cnt = 0;
                    //ASA-1592 Start
                    var shelfInfo = Modules.ShelfInfo;
                    // ASA-1668, sorting getting change and causing old sorting saved in combination to cause error. Sorting is not required in this logic that to on object type
                    // var sorto = {
                    //     ObjType: "desc",
                    // };
                    // shelfInfo.keySort(sorto);
                    // for (const Shelf of Modules.ShelfInfo) {
                    for (const Shelf of shelfInfo) {
                        //ASA-1592 End
                        if (Shelf.Rotation > 0 || Shelf.Rotation < 0) {
                            var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.ShelfRotateWidth / 2);
                            var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.ShelfRotateWidth / 2);
                        } else {
                            var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.W / 2);
                            var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.W / 2);
                        }
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            if (parseFloat(p_final_y) > parseFloat(Shelf.Y) - Shelf.H / 2 && parseFloat(p_final_y) < wpdSetFixed(parseFloat(Shelf.Y) + Shelf.H / 2) && parseFloat(p_final_x) > wpdSetFixed(parseFloat(Shelf.X) - Shelf.W / 2) && parseFloat(p_final_x) < wpdSetFixed(parseFloat(Shelf.X) + Shelf.W / 2) && (Shelf.ObjType == "CHEST" || Shelf.ObjType == "PEGBOARD")) {
                                if (min_shelf > wpdSetFixed(parseFloat(p_final_y) - parseFloat(Shelf.Y))) {
                                    min_shelf = wpdSetFixed(parseFloat(p_final_y) - parseFloat(Shelf.Y));
                                    p_item_inside_world = "Y";
                                    p_curr_module = l_mod_cnt;
                                    div_object_type = Shelf.ObjType;
                                    shelfY = Shelf.Y;
                                    shelfHeight = Shelf.H;
                                    div_shelf_index = l_shelf_cnt;
                                    shelf_found = "Y";
                                }
                            } else if (Shelf.Y - Shelf.H / 2 < p_final_y && div_shelf_end > p_final_x && div_shelf_start < p_final_x && Shelf.ObjType !== "CHEST") {
                                if (min_shelf > wpdSetFixed(parseFloat(p_final_y) - parseFloat(Shelf.Y))) {
                                    min_shelf = wpdSetFixed(parseFloat(p_final_y) - parseFloat(Shelf.Y));
                                    p_item_inside_world = "Y";
                                    p_curr_module = l_mod_cnt;
                                    div_object_type = Shelf.ObjType;
                                    shelfY = Shelf.Y;
                                    shelfHeight = Shelf.H;
                                    div_shelf_index = l_shelf_cnt;
                                    shelf_found = "Y";
                                }
                            }
                        }
                        l_shelf_cnt++;
                    }
                }
                l_mod_cnt++;
            }
        }

        /*ASA-1592 Start*/
        if (p_is_pb_shelf_overlap && div_object_type == "PEGBOARD") {
            var [p_curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found, shelfInsidePeg] = itemOverShelfInsidePegboard(p_final_x, p_final_y, p_curr_module, div_shelf_index, p_pog_index, p_item);
        }
        /*ASA-1592 End*/
        logDebug("function : get_div_shelf_index", "E");
        return [p_item_inside_world, p_curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found, shelfInsidePeg];
    } catch (err) {
        error_handling(err);
    }
}

async function refresh_product_list(p_pog_index) {
    if (g_open_productlist == "Y" && apex.region("draggable_table") !== null) {
        if (g_all_pog_flag == "N") {
            $s("P25_OPEN_POG_CODE", `${g_pog_json[p_pog_index].POGCode}`);
            $s("P25_OPEN_POG_VERSION", `${g_pog_json[p_pog_index].Version}`);
        } else {
            $s("P25_OPEN_POG_CODE", `${""}`);
            $s("P25_OPEN_POG_VERSION", `${""}`);
        }
        apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
        apex.region("draggable_table").widget().interactiveGrid("getViews").grid.curInst._refreshGrid();
    }
}

//This function is used inside auto_position_shelf, this is because when user is placing shelf in between 2 modules.
//then we need to move to any one module where more than 50% then move to that module. so this will find out new module index.
function get_new_mod_ind(p_module_index, p_curr_module, p_shelf_rotate_hit, p_pog_index) {
    logDebug("function : get_new_mod_ind; p_module_index : " + p_module_index + "; curr_module : " + p_curr_module + "; shelf_rotate_hit : " + p_shelf_rotate_hit, "S");
    try {
        var new_mod_index = -1,
            max_height = 0;
        for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
            if (Modules.ParentModule == null || typeof Modules.ParentModule == "undefined") {
                max_height = Math.max(max_height, Modules.H);
            }
        }
        if (max_height < g_final_y || (g_final_y < 0 && max_height > 0.1)) {
            var j = 0;
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (Modules.ParentModule == null || typeof Modules.ParentModule == "undefined") {
                    if (g_final_x > Modules.X - Modules.W / 2 && g_final_x < Modules.X + Modules.W / 2) {
                        new_mod_index = j;
                        break;
                    }
                }
                j++;
            }
            if (new_mod_index == -1) {
                new_mod_index = 0;
            }
        } else {
            if (p_module_index !== p_curr_module && p_curr_module !== -1 && p_shelf_rotate_hit == "N") {
                new_mod_index = p_curr_module;
            } else {
                new_mod_index = p_module_index;
            }
        }
        logDebug("function : get_new_mod_ind", "E");
        return new_mod_index;
    } catch (err) {
        error_handling(err);
    }
}

//this function is used in mouseup function. this will check if any item is having dimension mismatch from masters.
//this this function will update the dim to new values and validate if new dimension can fit in the dropped shelf.
async function check_item_dim_valid(p_items, p_module_index, p_shelf_index, p_item_index, p_pog_index, p_raise_alert = "Y") {
    //ASA-1812 Added param p_raise_alert
    logDebug("function : check_item_dim_valid; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index, "S");
    try {
        var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var [select_width, select_height, select_depth] = get_select_dim(p_items);
        var return_val = "N";
        var nesting_val = 0;
        if (p_items.ItemNesting !== "") {
            if (p_items.ItemNesting == "W") {
                nesting_val = p_items.OrgNW;
            } else if (p_items.ItemNesting == "H") {
                nesting_val = p_items.OrgNH;
            } else if (p_items.ItemNesting == "D") {
                nesting_val = p_items.OrgND;
            }
        }
        //this function will set the new dim values to that item and call validation on height, width and depth. if passed it will pass back the dimensions
        //else error.
        var p_show_alert = p_raise_alert == "N" ? "N" : "Y"; //ASA-1812
        const [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(p_module_index, p_shelf_index, p_item_index, select_width, select_height, select_depth, p_items.ItemNesting, nesting_val, p_items.BHoriz, p_items.BVert, p_items.BaseD, p_items.Orientation, p_items.OrgCWPerc, p_items.OrgCHPerc, p_items.OrgCDPerc, p_show_alert, "Y", "N", p_pog_index); //ASA-1812 used p_show_alert

        //if no error update same items present in all POG.
        if (item_width !== "ERROR") {
            update_item_org_dim(p_module_index, p_shelf_index, p_item_index, item_width, item_height, item_depth, real_width, real_height, real_depth, p_pog_index);

            await org_dim_update_items(p_module_index, p_shelf_index, p_item_index, p_items.Item, "Y", p_pog_index);

            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].DimUpdate = "Y";
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OW = select_width;
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OH = select_height;
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].OD = select_depth;

            //ASA-1812
            const itemObj = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].ObjID;
            itemObj.OW = select_width * 100;
            itemObj.OH = select_height * 100;
            itemObj.OD = select_depth * 100;

            var [itemx, itemy] = get_item_xy(shelfs, p_items, item_width, item_height, p_pog_index);

            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].X = itemx; //ASA-1301
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "BASKET" && g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Item == "DIVIDER") {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y;
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y = itemy;
            }
            return_val = "F";
        } else {
            return_val = "E";
            g_dragItem.DimUpdate = "E";

            if (p_raise_alert != "N") {
                //ASA-1812 Issue 1
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].ObjID);
                selectedObject.WireframeObj.material.color.setHex(g_dim_error_color);
                selectedObject.BorderColour = g_dim_error_color;
                //g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].DimUpdate = "E";
            }
        }
        logDebug("function : check_item_dim_valid", "E");
        return return_val;
    } catch (err) {
        error_handling(err);
    }
}

//this function is used in mouseup function. which will be called for all fixel types except divider in basket and check as pegboard.
//this function will reset its dimensions and try to do cap, nesting or crushing (validate items.) if passed will send success indicator.
function update_validate_item_height(p_items, p_module_index, p_shelf_index, p_item_index, p_final_x, p_object_type, p_new_x, p_pog_index) {
    logDebug("function : update_validate_item_height; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; i_final_x : " + p_final_x + "; p_object_type : " + p_object_type + "; new_x : " + p_new_x, "S");
    try {
        var spread_gap = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].HorizGap;
        var horiz_gap = spread_gap;
        var spread_product = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem;
        var item_length = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.length;
        var allow_crush = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].AllowAutoCrush;
        var return_val = "N";
        var nesting_val = 0;
        if (p_items.ItemNesting !== "") {
            if (p_items.ItemNesting == "W") {
                nesting_val = p_items.OrgNW;
            } else if (p_items.ItemNesting == "H") {
                nesting_val = p_items.OrgNH;
            } else if (p_items.ItemNesting == "D") {
                nesting_val = p_items.OrgND;
            }
        }
        //ASA-1582
        if (g_combinedShelfs.length > 0) {
            var [currCombinationIndex, curShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Shelf);
            if (currCombinationIndex !== -1) {
                allow_crush = g_combinedShelfs[currCombinationIndex][0].AllowAutoCrush;
            }
        }
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Item !== "DIVIDER") {
            var [select_width, select_height, select_depth] = get_select_dim(p_items);
        } else {
            var [select_width, select_height, select_depth] = [p_items.W, p_items.H, p_items.D];
        }
        //this function will set the new dim values to that item and call validation on height, width and depth. if passed it will pass back the dimensions
        //else error.
        const [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(p_module_index, p_shelf_index, p_item_index, select_width, select_height, select_depth, p_items.ItemNesting, nesting_val, p_items.BHoriz, p_items.BVert, p_items.BaseD, p_items.Orientation, p_items.OrgCWPerc, p_items.OrgCHPerc, p_items.OrgCDPerc, "N", "N", "N", p_pog_index);
        if (item_width !== "ERROR") {
            update_item_org_dim(p_module_index, p_shelf_index, p_item_index, item_width, item_height, item_depth, real_width, real_height, real_depth, p_pog_index);
        }
        //set new x axis and do item height validation.
        if (p_object_type == "SHELF" || (p_object_type == "CHEST" && g_chest_as_pegboard == "N") || p_object_type == "PALLET") {
            //ASA-1125
            if (p_new_x == -1) {
                p_new_x = get_item_xaxis(p_items.W, p_items.H, p_items.D, p_object_type, p_final_x, horiz_gap, spread_product, spread_gap, p_module_index, p_shelf_index, p_item_index, "Y", item_length, "N", p_pog_index);
            }
            if (!(p_object_type == "BASKET" && p_items.Item == "DIVIDER")) {
                var return_val = item_height_validation(p_items.H, p_module_index, p_shelf_index, p_item_index, "Y", p_new_x, allow_crush, p_items.CrushVert, p_items.Fixed, "Y", p_items.D, "N", p_pog_index, "Y"); //ASA-1830 Added p_byPassMedicineOverhung = 'Y'
            }
        }
        logDebug("function : update_validate_item_height", "E");
        return return_val;
    } catch (err) {
        error_handling(err);
    }
}

//this will be called when g_auto_position_ind = 'Y'. this will be Y when auto position button is clicked and its green.
// it will find out if the shelf is dragged in between 2 module. it will find inside which module this has to be placed.
async function auto_position_shelf(p_module_index, p_curr_module, p_shelf_index, p_shelf_rotate_hit, p_final_x, p_final_y, p_canvas_drag, p_pog_index) {
    logDebug("function : auto_position_shelf; p_module_index : " + p_module_index + "; curr_module : " + p_curr_module + "; p_shelf_index : " + p_shelf_index + "; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y + "; g_canvas_drag : " + p_canvas_drag, "S");
    try {
        //this function will find out based on present x axis. which module will it be placed.
        if (p_canvas_drag == "N") {
            var new_mod_index = get_new_mod_ind(p_module_index, p_curr_module, p_shelf_rotate_hit, p_pog_index);
        } else {
            var new_mod_index = p_curr_module;
        }

        var mod_center = g_pog_json[p_pog_index].ModuleInfo[new_mod_index].X;
        var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
        var new_shelfX = -1;
        var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
        var item_x = -1,
            item_y = -1;
        var spread_product = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem;
        var shelf_width = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W;
        var shelf_height = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H;
        var notchUpdated = false;
        var newNotch = -1;
        var autoPositionXY = $v("P25_ALIGN_BOTH_XY_POSITION"); //ASA-1797
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "PEGBOARD" || (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
            //ASA-1125
            g_drag_z = 0.00115;
        }
        //below code will set shelf and items inside shelf to the new module.
        if ((p_final_x - shelf_width / 2 > mod_center - g_pog_json[p_pog_index].ModuleInfo[new_mod_index].W / 2 && p_final_x - shelf_width / 2 < mod_center + g_pog_json[p_pog_index].ModuleInfo[new_mod_index].W / 2) || (p_final_x + shelf_width / 2 > mod_center - g_pog_json[p_pog_index].ModuleInfo[new_mod_index].W / 2 && p_final_x + shelf_width / 2 < mod_center + g_pog_json[p_pog_index].ModuleInfo[new_mod_index].W / 2)) {
            if (p_final_x <= mod_center) {
                new_shelfX = mod_center - g_pog_json[p_pog_index].ModuleInfo[new_mod_index].W / 2 + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2;
            } else {
                new_shelfX = mod_center + g_pog_json[p_pog_index].ModuleInfo[new_mod_index].W / 2 - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2;
            }
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X = new_shelfX;
            p_final_x = new_shelfX;
            //ASA-1628
            if ((g_shelf_object_type == "HANGINGBAR" || g_shelf_object_type == "SHELF") && autoPositionXY == "Y") {
                //ASA-1797 add and condition.
                [p_final_y, notchUpdated, newNotch] = autoPositionShelfVertically(p_pog_index, p_module_index, p_shelf_index, new_shelfX, p_final_y, g_shelf_object_type, $v("P25_POGCR_SUBSHELF_W_PERC"));
                if (notchUpdated) {
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].NotchNo = newNotch;
                }
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y = p_final_y;
                g_dragItem.position.set(new_shelfX, p_final_y, g_drag_z);
            } else {
                g_dragItem.position.set(new_shelfX, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y, g_drag_z);
            }
            var i = 0;
            for (const items of items_arr) {
                if (g_shelf_object_type == "BASKET" && spread_product == "BT") {
                    item_x = p_final_x - shelf_width / 2 + items.W / 2;
                    item_y = p_final_y + shelf_height / 2 + items.Distance + items.H / 2;
                } else if (g_shelf_object_type == "HANGINGBAR") {
                    item_x = p_final_x - shelf_width / 2 + items.Distance + items.W / 2;
                    item_y = p_final_y - items.H / 2;
                } else if (g_shelf_object_type == "ROD") {
                    item_x = p_final_x;
                    item_y = p_final_y - shelf_height / 2 - items.H / 2;
                } else if (g_shelf_object_type == "PEGBOARD" || (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y")) {
                    item_x = p_final_x - shelf_width / 2 + items.PegBoardX + items.W / 2;
                    item_y = p_final_y - shelf_height / 2 + items.PegBoardY + items.H / 2;
                } else {
                    item_x = p_final_x - shelf_width / 2 + items.Distance + items.W / 2;
                    item_y = p_final_y + shelf_height / 2 + items.H / 2;
                }
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].X = item_x;
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].Y = item_y;
                if (g_auto_position_ind == "Y") {
                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                    selectedObject.position.set(item_x, item_y, 0.001 + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 1000);
                }
                i++;
            }

            var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
            var i = 0;
            for (const items of items_arr) {
                if (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "") {
                    var j = 0;
                    for (const item_list of items_arr) {
                        if (item_list.ObjID == items.BottomObjID) {
                            item_x = item_list.X;
                            item_y = item_list.Y + item_list.H / 2 + items.H / 2;

                            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].X = item_x;
                            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].Y = item_y;
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                            selectedObject.position.set(item_x, item_y, 0.001 + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].D / 1000);
                        }
                        j++;
                    }
                }
                i++;
            }
        } else {
            await set_all_items(p_module_index, p_shelf_index, p_final_x, p_final_y, "Y", "N", "Y", p_pog_index, p_pog_index, "Y"); //ASA-1898 Divider is showing in the front of the textbox
        }
        render(p_pog_index);
        logDebug("function : auto_position_shelf", "E");
        return notchUpdated;
    } catch (err) {
        error_handling(err);
    }
}

//this function is called on drop of item. single drag and multi drag. this will just set the ItemInfo in the mentioned new shelf and remove from old now.
function set_item_after_drag(p_new_object_type, p_spread_product, p_new_module_index, p_new_shelf_index, p_upd_item_index, p_itemInfo, p_pog_index) {
    logDebug("function : set_item_after_drag; new_object_type : " + p_new_object_type + "; new_module_index : " + p_new_module_index + "; new_shelf_index : " + p_new_shelf_index + "; upd_item_index : " + p_upd_item_index, "S");
    try {
        var l_edited_item_index = -1;
        if (p_new_object_type == "PEGBOARD" || (p_new_object_type == "CHEST" && g_chest_as_pegboard == "Y")) {
            g_pog_json[p_pog_index].ModuleInfo[p_new_module_index].ShelfInfo[p_new_shelf_index].ItemInfo.push(p_itemInfo);
            l_edited_item_index = g_pog_json[p_pog_index].ModuleInfo[p_new_module_index].ShelfInfo[p_new_shelf_index].ItemInfo.length - 1;
        } else {
            g_pog_json[p_pog_index].ModuleInfo[p_new_module_index].ShelfInfo[p_new_shelf_index].ItemInfo.splice(p_upd_item_index, 0, p_itemInfo);
            l_edited_item_index = p_upd_item_index;
        }
        logDebug("function : set_item_after_drag", "E");
        return l_edited_item_index;
    } catch (err) {
        error_handling(err);
    }
}

//this function is called when drop a shelf. both single drag or multi drag.
//ASA-1628 Issue 18, added p_auto_position param
async function set_shelf_after_drag(p_validate_passed, p_shelf_edit_flag, p_module_ind, p_curr_mod, p_shelf_ind, p_final_x, p_final_y, p_splice_shelf, p_text_z_update, p_oldModuleIndex, p_oldShelfIndex, p_oldPogIndex, p_pog_index, p_combine_index = -1, p_auto_position = "N") {
    logDebug("function : set_shelf_after_drag; validate_passed : " + p_validate_passed + "; i_shelf_edit_flag : " + p_shelf_edit_flag + "; module_ind : " + p_module_ind + "; curr_mod : " + p_curr_mod + "; shelf_ind : " + p_shelf_ind + "; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y + "; splice_shelf : " + p_splice_shelf + "; text_z_update : " + p_text_z_update + "; oldModuleIndex : " + p_oldModuleIndex + "; oldShelfIndex : " + p_oldShelfIndex, "S");
    try {
        var div_shelf_index = -1;
        var shelf_found = "N";
        p_oldModuleIndex = typeof p_oldModuleIndex == "undefined" || p_oldModuleIndex == "" ? p_module_ind : p_oldModuleIndex;
        p_oldShelfIndex = typeof p_oldShelfIndex == "undefined" || p_oldShelfIndex == "" ? p_shelf_ind : p_oldShelfIndex;
        //this block will work when shelf is dragged to different module.
        if (p_shelf_edit_flag == "Y" && p_module_ind !== p_curr_mod && p_curr_mod !== -1) {
            var child_module_index = -1;
            var module_arr = g_pog_json[p_pog_index].ModuleInfo;
            //this below logic is for text box as every text box shelfInfo there will be a Module Info. so we need to update the details of the
            //moduleInfo with new details of ShelfInfo.
            if (g_shelf_object_type == "TEXTBOX") {
                var i = 0;
                for (const modules of module_arr) {
                    if (modules.ObjID == g_objectHit_id) {
                        g_pog_json[p_pog_index].ModuleInfo[i].ParentModule = g_pog_json[p_pog_index].ModuleInfo[p_curr_mod].Module;
                        child_module_index = i;
                        break;
                    }
                    i++;
                }
            }
            if (p_splice_shelf == "Y") {
                var l_shelf_details = g_pog_json[p_oldPogIndex].ModuleInfo[p_oldModuleIndex].ShelfInfo[p_oldShelfIndex];
                g_pog_json[p_oldPogIndex].ModuleInfo[p_oldModuleIndex].ShelfInfo.splice(p_oldShelfIndex, 1);
                var min_shelf_detail = get_min_shelf(p_curr_mod, p_final_y, p_pog_index);
                var shelf_info = min_shelf_detail.split(",");
                div_shelf_index = parseFloat(shelf_info[0]);
                shelf_found = shelf_info[1];
                if (shelf_found == "Y") {
                    g_pog_json[p_pog_index].ModuleInfo[p_curr_mod].ShelfInfo.splice(div_shelf_index + 1, 0, l_shelf_details);
                    p_shelf_ind = div_shelf_index + 1;
                } else {
                    g_pog_json[p_pog_index].ModuleInfo[p_curr_mod].ShelfInfo.splice(div_shelf_index, 0, l_shelf_details);
                    p_shelf_ind = 0;
                }
                p_module_ind = p_curr_mod;
                g_module_index = p_module_ind;
                g_shelf_index = p_shelf_ind;
            } else {
                g_module_index = p_module_ind;
                g_shelf_index = p_shelf_ind;
            }
            if (g_shelf_object_type !== "PALLET" && (p_validate_passed == "R" || g_max_facing_enabled == "Y")) { //ASA-1892.1
                if (reorder_items(p_module_ind, g_shelf_index, p_pog_index)) {
                    await recreate_all_items(p_module_ind, g_shelf_index, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].ObjType, "N", p_final_x, -1, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                }
            }
            if (p_combine_index > -1 && typeof g_combinedShelfs[p_combine_index] !== "undefined") {
                //ASA-1292
                var mod_ind = g_combinedShelfs[p_combine_index][0].MIndex;
                var shelf_ind = g_combinedShelfs[p_combine_index][0].SIndex;
                if (reorder_items(mod_ind, shelf_ind, p_pog_index)) {
                    await recreate_all_items(mod_ind, shelf_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ObjType, "N", p_final_x, -1, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                }
            }
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].SObjID);
            var newY = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].Y * 100 - (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].H * 100) / 2); //ASA-1318 Task-2 to update the value of X, Y in the world for the status bar.
            selectedObject.X = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].X * 100 - (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].W * 100) / 2); //.toFixed(2); //ASA-1318 Task-2
            selectedObject.Y = wpdSetFixed(newY); //toFixed(newY, 2); //ASA-1318 Task-2
            if (g_shelf_object_type == "TEXTBOX") {
                selectedObject.Z = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].Z * 100); //.toFixed(2); //ASA-1318 Task-2 to update the value of Z in the status bar.
            } else {
                selectedObject.Z = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].Z * 100 - (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[g_shelf_index].D * 100) / 2); //.toFixed(2); //ASA-1318 Task-2 to update the value of Z in the status bar.
            } //ASA-1623 Issue 2
            selectedObject.Module = g_pog_json[p_pog_index].ModuleInfo[p_module_ind].Module;
        } else if (p_shelf_edit_flag == "Y" && p_module_ind == p_curr_mod) {
            //this block will work when shelf is dragged on same module different location.
            if (p_splice_shelf == "Y") {
                var l_shelf_details = g_pog_json[p_oldPogIndex].ModuleInfo[p_oldModuleIndex].ShelfInfo[p_oldShelfIndex];
                if (p_oldShelfIndex == 0) {
                    g_pog_json[p_oldPogIndex].ModuleInfo[p_oldModuleIndex].ShelfInfo.splice(p_oldShelfIndex, p_oldShelfIndex + 1);
                } else {
                    g_pog_json[p_oldPogIndex].ModuleInfo[p_oldModuleIndex].ShelfInfo.splice(p_oldShelfIndex, 1);
                }

                var min_shelf_detail = get_min_shelf(p_curr_mod, p_final_y, p_pog_index);
                var shelf_info = min_shelf_detail.split(",");
                div_shelf_index = parseFloat(shelf_info[0]);
                shelf_found = shelf_info[1];
                if (shelf_found == "Y") {
                    g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo.splice(div_shelf_index + 1, 0, l_shelf_details);
                    p_shelf_ind = div_shelf_index + 1;
                } else {
                    g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo.splice(div_shelf_index, 0, l_shelf_details);
                    p_shelf_ind = div_shelf_index;
                }
            } else {
                g_module_index = p_module_ind;
                g_shelf_index = p_shelf_ind;
            }
            if (g_shelf_object_type !== "PALLET" && (p_validate_passed == "R" || g_max_facing_enabled == "Y")) { //ASA-1892.1
                if (reorder_items(p_module_ind, g_shelf_index, p_pog_index)) {
                    await recreate_all_items(p_module_ind, p_shelf_ind, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ObjType, "N", p_final_x, -1, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                }
            }
            if (p_combine_index > -1 && typeof g_combinedShelfs[p_combine_index] !== "undefined") {
                //ASA-1292
                var mod_ind = g_combinedShelfs[p_combine_index][0].MIndex;
                var shelf_ind = g_combinedShelfs[p_combine_index][0].SIndex;
                if (reorder_items(mod_ind, shelf_ind, p_pog_index)) {
                    await recreate_all_items(mod_ind, shelf_ind, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ObjType, "N", p_final_x, -1, g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                }
            }
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].SObjID); //ASA-1318 Task-2
            var newY = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Y * 100 - (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].H * 100) / 2); //ASA-1318 Task-2 to update the value of X, Y in the world for the status bar.
            selectedObject.X = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].X * 100 - (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].W * 100) / 2); //.toFixed(2); //ASA-1318 Task-2
            selectedObject.Y = wpdSetFixed(newY); //toFixed(newY, 2); //ASA-1318 Task-2
            if (g_shelf_object_type == "TEXTBOX") {
                selectedObject.Z = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z * 100); //.toFixed(2); //ASA-1318 Task-2 to update the value of Z in the status bar.
            } else {
                selectedObject.Z = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z * 100 - (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].D * 100) / 2); //.toFixed(2); //ASA-1318 Task-2 to update the value of Z in the status bar
            } //ASA-1623 Issue 2
        }
        //this below block is needed for text box, when user do edit location and change the Z of the text box,
        //we need to maintain the Z position. so we reset it based on the value.
        //ASA-1652 Start
        // if (typeof g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ManualZupdate !== "undefined") {
        //     if (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ManualZupdate == "N") {
        //         if (g_shelf_object_type == "TEXTBOX" && p_text_z_update == "Y") {
        //             var shelfz = get_textbox_z(p_module_ind, p_shelf_ind, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].X, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Y, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].W, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].H, p_pog_index);
        //             g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z = shelfz;
        //             var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].SObjID);
        //             if (shelfz == g_pog_json[p_pog_index].BackDepth) {
        //                 //ASA-1652 Start
        //                 // var positionz = textboxPriorityPlacing(selectedObject.ShelfInfo.X, selectedObject.ShelfInfo.Y, selectedObject.ShelfInfo.H, selectedObject.ShelfInfo.W, p_pog_index); //ASA- 1608 Issue 1
        //                 // // selectedObject.position.z = positionz > 0.0021 ? 0.0021 : positionz == 0 ? 0.0006 : positionz; //ASA- 1608 Issue 1
        //                 // selectedObject.position.z = positionz == 0 ? 0.0006 : positionz; //ASA- 1608 Issue 1
        //                 // g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z = positionz; //ASA- 1608 Issue 1  //ASA-1623 Issue 2
        //                 textboxPriorityPlacing(selectedObject,p_pog_index);
        //                 //ASA-1652 End
        //             } else {
        //                 selectedObject.position.z = shelfz > 0.0021 ? 0.0021 : shelfz == 0 ? 0.0006 : shelfz;
        //                 g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z = shelfz; //ASA-1623 Issue 2
        //             }
        //             selectedObject.Z = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z * 100);
        //         }
        //     }
        // } else {//else reset the Z based on the UI so that text box will be shown on top of all the objects on screen.
        //     if (g_shelf_object_type == "TEXTBOX" && p_text_z_update == "Y") {
        // var shelfz = get_textbox_z(p_module_ind, p_shelf_ind, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].X, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Y, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].W, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].H, p_pog_index);
        // g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z = shelfz;
        //         var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].SObjID);
        //         if (shelfz == g_pog_json[p_pog_index].BackDepth) {
        //             //ASA-1652 Start
        //             // var positionz = textboxPriorityPlacing(selectedObject.ShelfInfo.X, selectedObject.ShelfInfo.Y, selectedObject.ShelfInfo.H, selectedObject.ShelfInfo.W, p_pog_index); //ASA- 1608 Issue 1
        //             // // selectedObject.position.z = positionz > 0.0021 ? 0.0021 : positionz == 0 ? 0.0006 : positionz; //ASA- 1608 Issue 1
        //             // selectedObject.position.z = positionz == 0 ? 0.0006 : positionz; //ASA- 1608 Issue 1
        //             // g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z = positionz;//ASA- 1608 Issue 1
        //             textboxPriorityPlacing(selectedObject,p_pog_index);
        //             //ASA-1652 End
        //         } else {
        //             selectedObject.position.z = shelfz > 0.0021 ? 0.0021 : shelfz == 0 ? 0.0006 : shelfz;
        //             g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z = shelfz;   //ASA-1623 Issue 2
        //         }
        //         selectedObject.Z = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z * 100);
        //     }
        // }
        if (g_shelf_object_type == "TEXTBOX" && p_text_z_update == "Y") {
            g_textbox_dragged = "Y"; //ASA-2000.15
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ManualZupdate != "Y") {

                var posZ = textboxPriorityPlacing(selectedObject, p_pog_index,);
                if (posZ == -1) {
                    var shelfz = get_textbox_z(p_module_ind, p_shelf_ind, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].X, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Y, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].W, g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].H, p_pog_index);
                    selectedObject.position.z = shelfz > 0.0021 ? 0.0021 : shelfz == 0 ? 0.0006 : shelfz;
                    g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z = shelfz;
                }
                selectedObject.Z = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Z * 100);
            } else {
                //ASA-1722
                textboxPriorityPlacing(selectedObject, p_pog_index, "", "Y");
            }
            g_textbox_dragged = "N"; //ASA-2000.15
        }
        //ASA-1652 End
        if (g_shelf_index !== -1 && p_auto_position == "N" && g_shelf_object_type !== "TEXTBOX") { //ASA-2023 Issue 2
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Combine = "N"; //ASA-1129
        }
        logDebug("function : set_shelf_after_drag", "E");
        return [p_module_ind, p_shelf_ind];
    } catch (err) {
        error_handling(err);
    }
}

//This function is called when user select a object or just double click on empty space. we will find out which object user click and we open those
//edit popup. if click on empty space. we open POG edit.
function doMouseDoubleclick(p_x, p_y, p_startX, p_startY, p_event, p_canvas, p_camera, p_pog_index) {
    logDebug("function : doMouseDoubleclick; x : " + p_x + "; y : " + p_y + "; startX : " + p_startX + "; startY : " + p_startY, "S");
    g_taskItemInContext = clickInsideElement(p_event, "canvasregion");
    g_taskItemInContext1 = clickInsideElement(p_event, "canvasregion1");
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
                $s("P25_MODULE_DISP", "");
            }
            return false;
        }
        var item = g_intersects[0];
        g_objectHit = item.object;
        g_object_hit_ind = "o";
        g_dblclick_objid = g_objectHit.id;
        g_objectHit_uuid = g_objectHit.uuid;

        //ASA-1965 start
        if (g_auto_fill_active === "Y" && Array.isArray(g_mod_block_list) && g_mod_block_list.length > 0) {

            var normx = p_x / p_canvas.width;
            var normy = 1 - (p_y / p_canvas.height);
            let clickedInsideBlock = false;
            let clickedBlock = null;

            for (let i = 0; i < g_mod_block_list.length; i++) {
                var blk = g_mod_block_list[i];
                var dim = blk.BlockDim;
                if (!dim) continue;

                var blkx = dim.CalcX;
                var blkxw = 1 - (dim.CalcX - dim.BlkWidth);
                var blky = dim.CalcY;
                var blkyh = 1 - (dim.CalcY - dim.BlkHeight);

                if (normx >= blkx && normx <= blkxw && normy >= blky && normy <= blkyh) {
                    clickedInsideBlock = true;
                    clickedBlock = blk;
                    break;
                }
            }

            if (clickedInsideBlock && clickedBlock) {
                try {
                    apex.theme.openRegion("auto_fill_reg");
                    return;
                } catch (err) {
                    error_handling(err);
                    return;
                }
            }
        }

        //  ASA -1965 End

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

//this function is called in mousemove exactly at the movement when a single or multi item is moving from one canvas to another.
//it will caled on the exact pixel change when g_curr_canvas !== g_present_canvas. after then the single or multi item will move to the next canvas
//and all the details including g_pog_index will change to next canvas.
async function set_inter_canvas_items(p_a, p_y, p_shelf_obj, p_items_arr, p_shelf_width, p_shelf_height, p_object_type, p_basket_spread, p_rotation, p_slope, p_shelf_index, p_module_index, p_pog_index, p_update_axis = "N") {
    logDebug("function : set_inter_canvas_items; a : " + p_a + "; y : " + p_y + "; shelf_width : " + p_shelf_width + "; shelf_height : " + p_shelf_height + "; p_object_type : " + p_object_type + "; basket_spread : " + p_basket_spread + "; rotation : " + p_rotation + "; slope : " + p_slope + "; p_shelf_index : " + p_shelf_index + "; p_module_index : " + p_module_index, "S");
    var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
    if (p_slope !== 0 || (p_rotation !== 0 && p_rotation !== "N")) {
        var i = 0;

        var selectedObject = p_shelf_obj;
        for (const items of p_items_arr) {
            var item_obj = items;
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
            i = i + 1;
        }
        render(p_pog_index);
    } else {
        if (p_object_type == "BASKET" && p_basket_spread == "BT") {
            var i = 0;
            for (const items of p_items_arr) {
                var selectedObject = items;
                item_y = p_y + p_shelf_height / 2 + items.Distance + items.H / 2;
                item_x = p_a - p_shelf_width / 2 + items.W / 2;
                selectedObject.position.set(item_x, item_y, 0.001);
                if (p_update_axis == "Y") {
                    shelfdtl.ItemInfo[i].X = item_x;
                    shelfdtl.ItemInfo[i].Y = item_y;
                }
                i++;
            }
        } else if (p_object_type == "HANGINGBAR") {
            var i = 0;
            for (const items of p_items_arr) {
                var selectedObject = items;
                item_x = p_a - p_shelf_width / 2 + items.Distance + items.W / 2;
                item_y = p_y - items.H / 2;
                selectedObject.position.set(item_x, item_y, 0.001);
                if (p_update_axis == "Y") {
                    shelfdtl.ItemInfo[i].X = item_x;
                    shelfdtl.ItemInfo[i].Y = item_y;
                }
                i++;
            }
        } else if (g_shelf_object_type == "ROD") {
            var i = 0;
            for (const items of p_items_arr) {
                var selectedObject = items;
                item_x = p_a;
                item_y = p_y - p_shelf_height / 2 - items.H / 2;
                selectedObject.position.set(item_x, item_y, 0.001);
                if (p_update_axis == "Y") {
                    shelfdtl.ItemInfo[i].X = item_x;
                    shelfdtl.ItemInfo[i].Y = item_y;
                }
                i++;
            }
        } else if (g_shelf_object_type == "PEGBOARD" || (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y")) {
            var i = 0;

            for (const items of p_items_arr) {
                var selectedObject = items;
                item_x = p_a - p_shelf_width / 2 + items.PegBoardX + items.W / 2;
                item_y = p_y - p_shelf_height / 2 + items.PegBoardY + items.H / 2;
                selectedObject.position.set(item_x, item_y, 0.016);
                if (p_update_axis == "Y") {
                    shelfdtl.ItemInfo[i].X = item_x;
                    shelfdtl.ItemInfo[i].Y = item_y;
                }
                i++;
            }
        } else {
            var i = 0;
            for (const items of p_items_arr) {
                var selectedObject = items;
                if (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "") {
                    item_x = p_a - p_shelf_width / 2 + items.Distance + items.W / 2;
                    item_y = p_y + p_shelf_height / 2 + items.TotalHeight + items.H / 2;
                } else {
                    item_x = p_a - p_shelf_width / 2 + items.Distance + items.W / 2;
                    item_y = p_y + p_shelf_height / 2 + items.H / 2;
                }
                if (g_shelf_object_type == "PALLET") {
                    selectedObject.position.set(item_x, item_y, 0.001 + shelfdtl.D / 1000) + items.D / 2;
                } else {
                    if (g_shelf_object_type == "BASKET" && shelfdtl.ItemInfo[i].Item == "DIVIDER") {
                        item_y = p_y + p_shelf_height / 2 + shelfdtl.ItemInfo[i].YDistance + shelfdtl.ItemInfo[i].H / 2;
                        selectedObject.position.set(item_x, item_y, 0.001 + shelfdtl.D / 1000);
                    } else {
                        selectedObject.position.set(item_x, item_y, 0.001 + shelfdtl.D / 1000);
                    }
                }
                if (p_update_axis == "Y") {
                    shelfdtl.ItemInfo[i].X = item_x;
                    shelfdtl.ItemInfo[i].Y = item_y;
                }
                i++;
            }
        }
    }
    logDebug("function : set_inter_canvas_items", "E");
}

//this function is used in page_change_set_drag_prod_list when user click and product row in product list. the similar items will be
//blinking in POG.
function set_item_blink(p_select_items) {
    logDebug("function : set_item_blink", "S");
    try {
        var m;
        g_multiselect = "Y";
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            if (g_intersected) {
                for (var i = 0; i < g_intersected.length; i++) {
                    g_select_color = g_intersected[i].BorderColour;
                    g_intersected[i].WireframeObj.material.color.setHex(g_intersected[i].BorderColour);
                    if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                        g_intersected[i].WireframeObj.material.transparent = true;
                        g_intersected[i].WireframeObj.material.opacity = 0.0025;
                    }
                }
            }
            g_intersected = [];
            g_delete_details = [];
            if (typeof p_select_items !== "undefined") {
                for (var i = 0; i < p_select_items.length; i++) {
                    if (g_all_pog_flag == "Y") {
                        m = 0;
                    } else {
                        m = g_pog_index;
                    }

                    for (const pogs of g_pog_json) {
                        if ((m !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                            var j = 0;
                            for (const Modules of g_pog_json[m].ModuleInfo) {
                                if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                                    var k = 0;
                                    for (const Shelf of Modules.ShelfInfo) {
                                        if (typeof Shelf !== "undefined") {
                                            if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                                                var l = 0;
                                                for (const items of Shelf.ItemInfo) {
                                                    if (items.Item == p_select_items[i].getAttribute("data-id")) {
                                                        var selectedObject = g_scene_objects[m].scene.children[2].getObjectById(items.ObjID);
                                                        g_intersected.push(selectedObject);

                                                        var details = {};
                                                        details["p_pog_index"] = m;
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
                                                        details["IsDivider"] = "N";
                                                        details["Object"] = "ITEM";
                                                        details["MObjID"] = Modules.MObjID;
                                                        details["SObjID"] = Shelf.SObjID;
                                                        details["ItemID"] = items.ItemID;
                                                        details["Item"] = items.Item;
                                                        details["W"] = items.W;
                                                        details["H"] = items.H;
                                                        details["X"] = items.X;
                                                        details["Y"] = items.Y;
                                                        details["RW"] = items.RW;
                                                        details["Exists"] = "N";
                                                        details["Rotation"] = 0;
                                                        details["Slope"] = 0;
                                                        details["Distance"] = items.Distance;
                                                        details["TopObjID"] = items.TopObjID;
                                                        details["BottomObjID"] = items.BottomObjID;
                                                        g_delete_details.multi_delete_shelf_ind = "";
                                                        g_delete_details.push(details);
                                                        if (typeof k !== "undefined" && typeof j !== "undefined" && g_delete_details.length > 0) {
                                                            var shelfInfo = g_pog_json[m].ModuleInfo[j].ShelfInfo[k];
                                                            g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                                                            g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
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
                        if (g_all_pog_flag == "Y") {
                            m++;
                        } else {
                            break;
                        }
                    }
                }
                render_animate_selected();
            }
        }
        logDebug("function : set_item_blink", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is used in mousedown. when user hold ctrl button and click on any item. they will be multi selected and placed in g_delete_details
function add_ctrl_select_items(p_object, p_items, p_shelf, p_module_index, p_shelf_index, p_item_index, p_module_obj_id, p_objectHit_id, p_pog_index) {
    //ASA-1272
    logDebug("function : add_ctrl_select_items; module_index : " + p_module_index + "; shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; module_obj_id : " + p_module_obj_id + "; i_objectHit_id : " + p_objectHit_id, "S");
    var unique_row = "Y";
    for (const objects of g_delete_details) {
        if (objects.ObjID == p_objectHit_id) {
            unique_row = "N";
        }
    }
    //unique_row is when user click same item again should not add.
    if (unique_row == "Y") {
        if (p_object == "S") {
            var details = {};
            var is_divider = "N";
            var object = "SHELF";
            details["ObjID"] = p_shelf.SObjID;
            details["ObjWidth"] = p_shelf.W;
            details["ObjHeight"] = p_shelf.H;
            details["XAxis"] = p_shelf.X;
            details["YAxis"] = p_shelf.Y;
            details["ZAxis"] = p_shelf.Z;
            details["IIndex"] = -1;
            details["W"] = p_shelf.W;
            details["H"] = p_shelf.H;
            details["D"] = p_shelf.D;
            details["X"] = p_shelf.X;
            details["Y"] = p_shelf.Y;
            details["ItemID"] = p_shelf.Shelf;
            details["Item"] = "";
            details["Distance"] = -1;
            details["TopObjID"] = -1;
            details["BottomObjID"] = -1;
            //ASA-1272
            details["p_pog_index"] = p_pog_index;
            details["MIndex"] = p_module_index;
            details["SIndex"] = p_shelf_index;
            details["ObjType"] = p_shelf.ObjType;
            details["IsDivider"] = is_divider;
            details["Object"] = object;
            details["MObjID"] = p_module_obj_id;
            details["SObjID"] = p_shelf.SObjID;
            details["Exists"] = "N";
            //ASA-1471 S
            details["AllowAutoCrush"] = p_shelf.AllowAutoCrush;
            details["Rotation"] = p_shelf.Rotation; //0
            details["Slope"] = p_shelf.Slope; //0
            details["Color"] = p_shelf.Color;
            details["Combine"] = p_shelf.Combine;
            details["LOverhang"] = p_shelf.LOverhang;
            details["ROverhang"] = p_shelf.ROverhang;
            details["DivHeight"] = typeof p_shelf.DivHeight == "undefined" ? 0 : p_shelf.DivHeight;
            details["DivWidth"] = typeof p_shelf.DivWidth == "undefined" ? 0 : p_shelf.DivWidth;
            details["DivPst"] = typeof p_shelf.DivPst == "undefined" ? "N" : p_shelf.DivPst;
            details["DivPed"] = typeof p_shelf.DivPed == "undefined" ? "N" : p_shelf.DivPed;
            details["DivPbtwFace"] = typeof p_shelf.DivPbtwFace == "undefined" ? "N" : p_shelf.DivPbtwFace;
            details["NoDivIDShow"] = p_shelf.NoDivIDShow;
            details["DivFillCol"] = typeof p_shelf.DivFillCol == "undefined" ? "#3D393D" : p_shelf.DivFillCol;
            details["SpreadItem"] = p_shelf.SpreadItem;
            details["MaxMerch"] = p_shelf.MaxMerch;

            //ASA-1471 E

            details["StartCanvas"] = p_pog_index;
            //ASA-1669 Start
            details["FBold"] = p_shelf.FBold;
            details["FSize"] = p_shelf.FSize;
            details["FStyle"] = p_shelf.FStyle;
            details["InputText"] = p_shelf.InputText;
            details["TextImg"] = p_shelf.TextImg;
            details["TextImgMime"] = p_shelf.TextImgMime;
            details["TextImgName"] = p_shelf.TextImgName;
            details["ReduceToFit"] = p_shelf.ReduceToFit;
            details["TextDirection"] = p_shelf.TextDirection;
            details["WrapText"] = p_shelf.WrapText;
            //ASA-1669 End
            g_delete_details.multi_delete_shelf_ind = "";
            g_delete_details.push(details);
            if (typeof p_shelf_index !== "undefined" && typeof p_module_index !== "undefined" && g_delete_details.length > 0) {
                var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
            }
            var z = 0;
            for (obj of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo) {
                var details = {};
                var is_divider = "N";
                var object = "ITEM";
                if (obj.Item == "DIVIDER") {
                    is_divider = "Y";
                    object = "SHELF";
                }
                details["ObjID"] = obj.ObjID;
                details["ObjWidth"] = obj.W;
                details["ObjHeight"] = obj.H;
                details["XAxis"] = obj.X;
                details["YAxis"] = obj.Y;
                details["ZAxis"] = obj.Z;
                details["IIndex"] = z;
                details["W"] = obj.W;
                details["RW"] = obj.RW;
                details["H"] = obj.H;
                details["X"] = obj.X;
                details["Y"] = obj.Y;
                details["ItemID"] = obj.ItemID;
                details["Item"] = obj.Item;
                details["Distance"] = obj.Distance;
                details["TopObjID"] = obj.TopObjID;
                details["BottomObjID"] = obj.BottomObjID;
                details["p_pog_index"] = p_pog_index;
                details["MIndex"] = p_module_index;
                details["SIndex"] = p_shelf_index;
                details["ObjType"] = p_shelf.ObjType;
                details["IsDivider"] = is_divider;
                details["Object"] = object;
                details["MObjID"] = p_module_obj_id;
                details["SObjID"] = p_shelf.SObjID;
                details["Exists"] = "N";
                details["Rotation"] = 0;
                details["Slope"] = 0;

                details["StartCanvas"] = p_pog_index;
                g_delete_details.multi_delete_shelf_ind = "";
                g_delete_details.push(details);

                z++;
            }
        } else {
            var details = {};
            var is_divider = "N";
            var object = "ITEM";
            if (p_items.Item == "DIVIDER") {
                is_divider = "Y";
                object = "SHELF";
            }
            details["ObjID"] = p_items.ObjID;
            details["ObjWidth"] = p_items.W;
            details["ObjHeight"] = p_items.H;
            details["XAxis"] = p_items.X;
            details["YAxis"] = p_items.Y;
            details["ZAxis"] = p_items.Z;
            details["IIndex"] = p_item_index;
            details["W"] = p_items.W;
            details["RW"] = p_items.RW;
            details["H"] = p_items.H;
            details["X"] = p_items.X;
            details["Y"] = p_items.Y;
            details["ItemID"] = p_items.ItemID;
            details["Item"] = p_items.Item;
            details["Distance"] = p_items.Distance;
            details["TopObjID"] = p_items.TopObjID;
            details["BottomObjID"] = p_items.BottomObjID;
            details["p_pog_index"] = p_pog_index;
            details["MIndex"] = p_module_index;
            details["SIndex"] = p_shelf_index;
            details["ObjType"] = p_shelf.ObjType;
            details["IsDivider"] = is_divider;
            details["Object"] = object;
            details["MObjID"] = p_module_obj_id;
            details["SObjID"] = p_shelf.SObjID;
            details["Exists"] = "N";
            details["Rotation"] = 0;
            details["Slope"] = 0;
            details["Color"] = p_shelf.Color; //20240806
            //ASA-1471 issue 13 S
            // if (obj.Item == "DIVIDER") { //Regression Issue 1 20240708
            if (is_divider == "Y") {
                details["DivHeight"] = typeof p_shelf.DivHeight == "undefined" ? 0 : p_shelf.DivHeight;
                details["DivWidth"] = typeof p_shelf.DivWidth == "undefined" ? 0 : p_shelf.DivWidth;
                details["DivPst"] = typeof p_shelf.DivPst == "undefined" ? "N" : p_shelf.DivPst;
                details["DivPed"] = typeof p_shelf.DivPed == "undefined" ? "N" : p_shelf.DivPed;
                details["DivPbtwFace"] = typeof p_shelf.DivPbtwFace == "undefined" ? "N" : p_shelf.DivPbtwFace;
                details["NoDivIDShow"] = p_shelf.NoDivIDShow;
                details["DivFillCol"] = typeof p_shelf.DivFillCol == "undefined" ? "#3D393D" : p_shelf.DivFillCol;
                details["LOverhang"] = 0;
                details["ROverhang"] = 0;
                details["MaxMerch"] = 0;
            }
            details["D"] = p_shelf.D;
            //ASA-1471 issue 13 E
            details["StartCanvas"] = p_pog_index;
            g_delete_details.multi_delete_shelf_ind = "";
            g_delete_details.push(details);
            if (typeof p_shelf_index !== "undefined" && typeof p_module_index !== "undefined" && g_delete_details.length > 0) {
                var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
                g_delete_details[g_delete_details.length - 1].ShelfInfo = [];
                g_delete_details[g_delete_details.length - 1].ShelfInfo.push(shelfInfo);
            }
        }
    }
    logDebug("function : add_ctrl_select_items", "E");
}

//this is the function used in context paste to update the distance of item from drop location X axis.
//if shelf is copied then all items inside shelf will be recalculate the distance from shelf start to item start. this distance is used to calculate XY details.
async function update_array_xy_distance(p_itemDetails, p_newx, p_newy) {
    new_details = JSON.parse(JSON.stringify(p_itemDetails));
    for (const objects of new_details) {
        objects.ShelfInfo = "";
    }
    //if shelf is copied then calculate distance of all shelfs
    if (JsonContains(new_details, "Object", "SHELF")) {
        var total_width = 0;
        for (const objects of p_itemDetails) {
            total_width += objects.W;
        }
        i = 0;
        var next_end = 0;
        for (const objects of p_itemDetails) {
            var retval = update_item_distance(objects.MIndex, objects.SIndex, objects.p_pog_index);
            var xaxis = 0;
            if (i == 0) {
                xaxis = p_newx;
                next_end = xaxis + objects.W / 2;
            } else {
                xaxis = next_end + objects.W / 2;
                next_end = xaxis + objects.W / 2;
            }
            var yaxis = objects.YAxis;
            p_itemDetails[i].XDistance = wpdSetFixed(xaxis - p_newx); //.toFixed(5)); //ASA-1343 issue 1 -- regression made consistent to 5 decimal with others
            p_itemDetails[i].YDistance = wpdSetFixed(yaxis - p_newy); //.toFixed(5)); //ASA-1343 issue 1 -- regression made consistent to 5 decimal with others
            i = i + 1;
        }
    } else {
        var total_width = 0;
        var max_height = 0;
        for (const objects of p_itemDetails) {
            total_width += objects.W;
            max_height = Math.max(max_height, objects.H);
        }
        i = 0;
        var next_end = 0;
        //first take all the items copied total width and then from p_newx - total_width/2 we get start of items. then add W of each item and set X.
        for (const objects of p_itemDetails) {
            if (nvl(objects.BottomObjID) !== 0 || nvl(objects.TopObjID) !== 0) {
                var xaxis = objects.XAxis;
                var yaxis = objects.YAxis;
                p_itemDetails[i].XDistance = wpdSetFixed(xaxis - p_newx); //.toFixed(5)); //ASA-1343 issue 1 -- regression made consistent to 5 decimal with others
                p_itemDetails[i].YDistance = wpdSetFixed(yaxis - p_newy); //.toFixed(5)); //ASA-1343 issue 1 -- regression made consistent to 5 decimal with others
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
                p_itemDetails[i].XDistance = wpdSetFixed(xaxis - p_newx); //.toFixed(5)); //ASA-1343 issue 1 -- regression made consistent to 5 decimal with others
                p_itemDetails[i].YDistance = objects.H / 2;
            }
            i = i + 1;
        }
    }
}
//This function will also update the x axis of the items from the click position. and create 2 different array
//g_multi_drag_shelf_arr and g_multi_drag_items_arr this will be used in mouse move to update the moving position.
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
            var button_cont = document.getElementById("side_bar");
            var devicePixelRatio = window.devicePixelRatio;
            var scroll_top = $(document).scrollTop();
            var scroll_left = $(".t-Region-body").scrollLeft();

            var header_height = header.offsetHeight; // * devicePixelRatio;
            var breadcrumb_height = breadcrumb.offsetHeight; // * devicePixelRatio;
            var top_bar_height = top_bar.offsetHeight; //* devicePixelRatio;
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
                $s("P25_SELECT_COLOR_TYPE", g_scene_objects[g_pog_index].Indicators.canvas_color_flag);
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

            $s("P25_SELECTED_CANVAS", `${g_curr_canvas}`);

            //if there is no objects behing cursor its the empty place outside POG. for that we use an invisible object to find the location.
            if (g_intersects.length == 0) {
                g_mselect_drag = "N"; //ASA-1692
                g_multiselect = "N"; //ASA-1681
                g_ctrl_select = "N"; //ASA-1681
                g_delete_details = []; //ASA-1681
                $("#draggable_table .product_list_blink").removeClass("product_list_blink"); //ASA-1681
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
                    //ASA-2017 start
                    l_highlightStatus = $v("P25_POGCR_HIGHLIGHT_SEARCHED_ITEM");
                    if (l_highlightStatus = "Y") {
                        find_highlight_frame()
                    }
                    //ASA-2017 end
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
                    g_startMouse.y = p_event.clientY + scroll_top - (breadcrumb_height + padding + header_height + top_bar_height);
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
                    //edit pallet will have facility to move the items inside the pallet. but only on the edit pallet view. so main view pallet items
                    //will also move according to it.
                    if (g_ComViewIndex == g_pog_index && g_compare_view == "EDIT_PALLET") {
                        //ASA-1085
                        if (g_intersects.length > 0) {
                            var select_obj = g_pog_json[g_ComViewIndex].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
                            if (typeof select_obj !== "undefined") {
                                if (select_obj.TopObjID == "" || typeof select_obj.TopObjID == "undefined") {
                                    for (const obj of g_intersects) {
                                        var k = 0;
                                        for (const Modules of g_pog_json[g_ComViewIndex].ModuleInfo) {
                                            var i = 0;
                                            for (const Shelf of Modules.ShelfInfo) {
                                                var j = 0;
                                                for (const items of Shelf.ItemInfo) {
                                                    if (items.ObjID == obj.object.id) {
                                                        var selectedObject = g_scene_objects[g_ComViewIndex].scene.children[2].getObjectById(items.ObjID);
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
                                                        selectedObject.old_position_x = selectedObject.position.x;
                                                        selectedObject.old_position_y = selectedObject.position.y;
                                                        selectedObject.old_position_z = selectedObject.position.z;
                                                        g_drag_items_arr.push(selectedObject);
                                                    }
                                                    j++;
                                                }
                                                i++;
                                            }
                                            k++;
                                        }
                                    }
                                }
                            }
                        }
                        if (g_drag_items_arr.length == 0) {
                            return false;
                        }
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
                        //ASA-2017 start
                        l_highlightStatus = $v("P25_POGCR_HIGHLIGHT_SEARCHED_ITEM");
                        if (l_highlightStatus = "Y") {
                            find_highlight_frame()
                        }
                        //ASA-2017 end
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
                                //ASA-1548 Issue 1 - Start
                                render_animate_selected();
                                // var old_renderer = g_renderer,
                                //     old_scene = g_scene,
                                //     old_cam = g_camera;
                                // for (obj of g_scene_objects) {
                                //     g_renderer = obj.renderer;
                                //     g_scene = obj.scene;
                                //     g_camera = obj.scene.children[0];
                                //     render_animate_selected();
                                // }
                                // g_renderer = old_renderer;
                                // g_scene = old_scene;
                                // g_camera = old_cam;
                                //ASA-1548 Issue 1 - End
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
                            //     for (colorObj of g_mod_block_list) {
                            //         if (colorObj.mod_index[0] == g_module_index) {
                            //             var fnTop = colorObj.BlockDim.FinalTop;
                            //             var fnBtm = colorObj.BlockDim.FinalBtm;
                            //             if (fnTop > p_y && fnBtm < p_y) {
                            //                 var objUuid = colorObj.BlkName;
                            //                 var coloredModule = colorObj.BlockDim.ColorObj;
                            //                 g_dragItem = coloredModule.getObjectByProperty("uuid", objUuid);
                            //                 return true;
                            //             }
                            //         }
                            //     }
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
                            g_startMouse.y = p_event.clientY + scroll_top - (breadcrumb_height + padding + header_height + top_bar_height);
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
                            g_startMouse.y = p_event.clientY + scroll_top - (breadcrumb_height + padding + header_height + top_bar_height);
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
                    // else if (g_auto_fill_active == "Y") {//after doing autofill setup. user can move the module block to place in another module.
                    //     //ASA-1085 added autofill block to drag
                    //     for (colorObj of g_mod_block_list) {
                    //         if (colorObj.mod_index[0] == g_module_index) {
                    //             var fnTop = colorObj.BlockDim.FinalTop;
                    //             var fnBtm = colorObj.BlockDim.FinalBtm;
                    //             if (fnTop > p_y && fnBtm < p_y) {
                    //                 var objUuid = colorObj.BlkName;
                    //                 var coloredModule = colorObj.BlockDim.ColorObj;
                    //                 g_dragItem = coloredModule.getObjectByProperty("uuid", objUuid);
                    //                 return true;
                    //             }
                    //         }
                    //     }
                    // }    //ASA-1697 commented else-if block
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
                var devicePixelRatio = window.devicePixelRatio;
                var scroll_top = $(document).scrollTop();
                var scroll_left = $(".t-Region-body").scrollLeft();
                var padding = parseFloat($(".t-Body-contentInner").css("padding-left").replace("px", "")) * devicePixelRatio;

                var header_height = header.offsetHeight; // * devicePixelRatio;
                var breadcrumb_height = breadcrumb.offsetHeight; // * devicePixelRatio;
                var top_bar_height = top_bar.offsetHeight; //* devicePixelRatio;
                var side_nav_width = side_nav.offsetWidth; //* devicePixelRatio;
                var btn_cont_width = button_cont.offsetWidth; //* devicePixelRatio;

                g_mouse.x = p_event.clientX + scroll_left - (btn_cont_width + padding);
                g_mouse.y = p_event.clientY + scroll_top - (breadcrumb_height + padding + header_height + top_bar_height);

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

                    grab_interval = parseFloat($v("P25_POGCR_GRAB_INTERVAL"));

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
                var $doc = $(document),
                    $win = $(window),
                    $this = $("#object_info"),
                    offset = $this.offset(),
                    dTop = offset.top - $doc.scrollTop(),
                    dBottom = $win.height() - dTop - $this.height(),
                    dLeft = offset.left - $doc.scrollLeft(),
                    dRight = $win.width() - dLeft - $this.width(),
                    fieldValue; //ASA-1407 Task 1

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

                // when label type = 'I'
                if (g_intersects.length > 0 && typeof g_intersects[0].object.ItemID !== "undefined" && g_intersects[0].object.ItemID !== "" && g_intersects[0].object.ItemID !== "DIVIDER") {
                    var desc_list_arr = $v("P25_POGCR_ITEM_DESC_LIST").split(":");
                    var i = 0;
                    var sorto = {
                        Seq: "asc",
                    };
                    g_status_bar.keySort(sorto);
                    var SalesInfo = get_sales_info(p_pog_index, g_intersects[0].object.ItemID); //ASA-1360 task 1. this could be outside as mouse each time we get only one item
                    var SalesInfoList = ["LeadTime", "SalesAmt", "VRM", "GP", "BEI", "MarkDown", "ShrinkageAmt", "SalesUnit", "SalesPerWeek", "SalesUnitPerWeek", "NonShrinkageAmt", "ASP", "VRMPer", "GPPer", "BEIPer", "MarkDownPer", "ShrinkageAmtPer", "DOS", "AvgSalesPerWeek", "AvgQtyPerWeek", "SalesPartPer", "QtyPartPer", "NoOfListing", "TotalShrinkageAmtPer", "WeeklySales", "WeeklyQty", "NetMarginPercent", "AUR"]; //ASA-1923 Issue 1//ASA-1360 task 1 //ASA-1407 Task 1
                    var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; //ASA-1254 //ASA-1407 Issue 5
                    for (const obj of g_status_bar) {
                        var line_width = 0;
                        var divider = i > 0 ? " | " : "";
                        if (desc_list_arr.includes(obj.Param) && obj.label_type == "I") {
                            if (SalesInfoList.includes(obj.Map)) {
                                if (obj.Map == "DOS") {
                                    fieldValue = (g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing * parseInt(g_intersects[0].object.MerchStyle == 1 ? g_intersects[0].object.UnitperTray : g_intersects[0].object.MerchStyle == 2 ? g_intersects[0].object.UnitperCase : 1)) / (SalesInfo.SalesUnitPerWeek / 7); //ASA-1605 //ASA-1871 aading condition for case
                                    // fieldValue = (g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing) / (SalesInfo.SalesUnitPerWeek / 7);
                                    if (isNaN(fieldValue) || !isFinite(fieldValue)) {
                                        fieldValue = 0;
                                    } else {
                                        fieldValue = parseFloat(fieldValue.toFixed(1));
                                    }
                                } else if (obj.Map == "SalesUnitPerWeek") {
                                    //ASA-1407 Task 1
                                    fieldValue = SalesInfo.SalesUnitPerWeek + " " + g_msg_unit; //ASA-1407 issue 5
                                } else if (obj.Map == "SalesPerWeek") {
                                    //ASA-1407 Task 1
                                    fieldValue = g_msg_dollar + SalesInfo.SalesPerWeek; //ASA-1407 issue 5
                                } else if (obj.Map == "TotalShrinkageAmtPer") {
                                    //ASA-1407 Task 1
                                    fieldValue = SalesInfo.TotalShrinkageAmtPer; //ASA-1407 issue 5
                                } else if (obj.Map == "ASP") {
                                    fieldValue = g_msg_dollar + SalesInfo.ASP; //ASA-1407 issue 5
                                } else {
                                    fieldValue = eval("SalesInfo." + obj.Map);
                                }
                            } else if (obj.Map == "COS") {
                                var item_capacity = g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing * parseInt(g_intersects[0].object.MerchStyle == 1 ? g_intersects[0].object.UnitperTray : g_intersects[0].object.MerchStyle == 2 ? g_intersects[0].object.UnitperCase : 1) + g_intersects[0].object.CapFacing * g_intersects[0].object.CapDepth * g_intersects[0].object.CapHorz * parseInt(g_intersects[0].object.CapMerch == 1 ? g_intersects[0].object.UnitperTray : 1); //ASA-1605 //ASA-1871 aading condition for case 
                                //var item_capacity = (g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing) + g_intersects[0].object.CapFacing * g_intersects[0].object.CapDepth * g_intersects[0].object.CapHorz; //ASA-1341 Issue-2 added Cap_capacity in COS Calculation. + cap_capacity ,//ASA-1398 issue 4
                                fieldValue = item_capacity / parseInt(g_intersects[0].object.SizeDesc.split("*")[1]); //ASA-1341 ,//ASA-1398 issue 4
                                if (isNaN(fieldValue) || !isFinite(fieldValue)) {
                                    fieldValue = 0;
                                } else {
                                    fieldValue = parseFloat(fieldValue.toFixed(1)) + " (" + item_capacity + " " + g_msg_unit + ")"; //ASA-1407 Task 1,//ASA-1398 issue 4,//ASA-1407 issue 5
                                }
                            } else if (obj.Map == "TotalUnits") {
                                fieldValue = g_intersects[0].object.HorizFacing * g_intersects[0].object.VertFacing * g_intersects[0].object.DFacing * parseInt(g_intersects[0].object.MerchStyle == 1 ? g_intersects[0].object.UnitperTray : g_intersects[0].object.MerchStyle == 2 ? g_intersects[0].object.UnitperCase : 1) + g_intersects[0].object.CapFacing * g_intersects[0].object.CapDepth * g_intersects[0].object.CapHorz * parseInt(g_intersects[0].object.CapMerch == 1 ? g_intersects[0].object.UnitperTray : 1); //ASA-1871 aading condition for case
                            } //ASA-1640
                            else if (obj.Map == "OOSPerc" && g_intersects[0].object.OOSPerc !== "undefined" && g_intersects[0].object.OOSPerc !== "") {
                                //ASA-1688
                                fieldValue = g_intersects[0].object.OOSPerc + "%";
                                //asa-1923 added elseif 
                            } else if ($v("P25_POGCR_REFRESH_SALES_WTCCN") == 'Y' && (obj.Map == 'NetMarginPercent' || obj.Map == 'WeeklySales' || obj.Map == 'WeeklyQty' || obj.Map == 'AUR')) {
                                if (obj.Map == "NetMarginPercent" && SalesInfo.netmarginpercent !== "undefined" && SalesInfo.netmarginpercent !== "") {  //ASA-1923
                                    fieldValue = SalesInfo.netmarginpercent + "%";
                                } else if (obj.Map == "WeeklySales" && SalesInfo.weeklysales !== "undefined" && SalesInfo.weeklysales !== "") {
                                    fieldValue = SalesInfo.weeklysales;
                                } else if (obj.Map == "WeeklyQty" && SalesInfo.weeklyqty !== "undefined" && SalesInfo.weeklyqty !== "") {
                                    fieldValue = SalesInfo.weeklyqty;
                                } else if (obj.Map == "AUR" && SalesInfo.AUR !== "undefined" && SalesInfo.AUR !== "") {
                                    fieldValue = SalesInfo.AUR;
                                }
                            } else {
                                fieldValue = getFieldValue(g_intersects[0].object, obj.Map, "I"); //ASA-1361 20240501 passing the p_label_type = 'I'
                            }
                            if (typeof fieldValue !== "undefined") {
                                line_width = (" | : " + obj.label + ": <span>" + fieldValue + "</span>").visualLength("ruler"); //ASA 1407 issue 4
                            }
                            // Calculate the available browser width
                            if (valid_width + line_width > browserWidth) {
                                //ASA-1254
                                // Add a line break if necessary
                                append_detail = append_detail + "<br>";
                                lines_arry.push(valid_width);
                                valid_width = 0;
                                // Check if there's still space available after the line break
                                //ASA 1407 issue 4 S
                                // if (line_width > browserWidth) {
                                //     // Handle long lines that won't fit in the available space
                                //     append_detail = append_detail + obj.label + ': <span style="color:yellow">' + fieldValue + "</span>";
                                // } //ASA 1407 issue 4 E
                            }

                            append_detail = append_detail + divider + obj.label + ': <span style="color:yellow">' + fieldValue + "</span>";
                            // Update valid_width after adding the current item
                            valid_width += line_width;
                        }
                        i++;
                    }
                } else if (g_intersects.length > 0 && typeof g_intersects[0].object.FixelID !== "undefined" && g_intersects[0].object.FixelID !== "" && typeof g_pog_json[p_pog_index] !== "undefined") {
                    var [lines_arry, append_detail] = get_status_bar_lines($v("P25_POGCR_FIXEL_DESC_LIST"), "F", contextElement, g_intersects[0].object, p_pog_index); //ASA-1360 Task 2 End
                } else if (g_intersects.length > 0 && typeof g_intersects[0].object.Module !== "undefined" && g_intersects[0].object.Module !== "" && typeof g_pog_json[p_pog_index] !== "undefined") {
                    var [lines_arry, append_detail] = get_status_bar_lines($v("P25_POGCR_MODULE_DESC_LIST"), "M", contextElement, g_intersects[0].object, p_pog_index); //ASA-1360 Task 2 end
                } else if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && (g_taskItemInContext || g_taskItemInContext1) && typeof g_pog_json[p_pog_index] !== "undefined") {
                    var [lines_arry, append_detail] = get_status_bar_lines($v("P25_POGCR_POG_DESC_LIST"), "P", contextElement, "", p_pog_index); //ASA-1360 Task 2 End
                } else {
                    contextElement.classList.remove("active");
                }

                if (g_compare_pog_flag == "Y" && g_compare_view == "PREV_VERSION") {
                    append_detail = append_detail + "<br>" + 'Version Compare color details : <span style="color:#80ff80">Added Product</span> ' + divider + ' <span style="color:#8080ff">Retain Product with position change</span> ' + divider + ' <span style="color:#FFFFFF">Retain with no change</span> ' + divider + ' <span style="color:#ff6666">Deleted Product</span> ' + divider + ' <span style="color:#808080">New Products</span>';
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
                contextElement.style.top = window.innerHeight - $this.height() + "px";
                contextElement.style.width = browserWidth + "px"; //ASA-1407 issue 5
                contextElement.style.height = height + 5 + "px";
                contextElement.style.fontSize = "larger"; //ASA-1254 "large"
                contextElement.style.fontFamily = "Tahoma";
                contextElement.style.left = 0 + "px";

                var canvasHolderH = $("#canvas-list-holder").height();
                var canvasHolderTop = window.innerHeight - $this.height() - canvasHolderH;
                $("#canvas-list-holder").css("top", canvasHolderTop + "px");
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
//ASA-1360 Task 2 Start
function get_status_bar_lines(p_desc_list, p_label_type, p_context_element, p_object, p_pog_index) {
    var desc_list_arr = p_desc_list.split(":"); //ASA-1360 Task 2 //ASA-1407 Task 1
    var i = 0;
    var append_detail = "";
    var lines_arry = [];
    var valid_width = 0;
    var sorto = {
        Seq: "asc",
    };
    g_status_bar.keySort(sorto);
    for (const obj of g_status_bar) {
        var line_width = 0;
        var divider = i > 0 ? " | " : "";

        let l_label = obj.label; //ASA-1912
        let new_pog_ind = sessionStorage.getItem("new_pog_ind"); //ASA-1912

        if (desc_list_arr.includes(obj.Param) && obj.label_type == p_label_type) {

            //ASA-1912 Added new logic to handle pog version and pog draft version together
            // --- Case 1: Draft Version ---
            if (new_pog_ind === "Y" && obj.Param === "POG_DRAFT_VERSION") {
                l_label = get_message("POGCR_DRAFT_VERSION");
                let fieldValue = g_pog_json[p_pog_index][obj.Map];
                if (fieldValue !== undefined) {
                    append_detail += divider + l_label + ': <span style="color:yellow">' + fieldValue + "</span>";
                    line_width = (" | : " + l_label + ":" + fieldValue).visualLength("ruler");
                }

                // --- Case 2: POG Version ---
            } else if (new_pog_ind === "N" && obj.Param === "POG_VERSION") {
                l_label = get_message("POGCR_POG_VERSION");
                let fieldValue = g_pog_json[p_pog_index][obj.Map];
                if (fieldValue !== undefined) {
                    append_detail += divider + l_label + ': <span style="color:yellow">' + fieldValue + "</span>";
                    line_width = (" | : " + l_label + ":" + fieldValue).visualLength("ruler");
                }

                // --- Case 3: All other fields ---
            } else if (obj.Param !== "POG_VERSION" && obj.Param !== "POG_DRAFT_VERSION") {
                let fieldValue;
                if (typeof p_object !== "undefined" && p_object !== "") {
                    fieldValue = getFieldValue(p_object, obj.Map, p_label_type);
                } else {
                    fieldValue = g_pog_json[p_pog_index][obj.Map];
                }
                if (fieldValue !== undefined) {
                    append_detail += divider + l_label + ': <span style="color:yellow">' + fieldValue + "</span>";
                    line_width = (" | : " + l_label + ":" + fieldValue).visualLength("ruler");
                }
            }
        }
        //commented for ASA 1912
        /*if (desc_list_arr.includes(obj.Param) && obj.label_type == p_label_type) {
            var l_label = obj.label;
            if (sessionStorage.getItem("new_pog_ind") == "Y" && obj.Param == "POG_VERSION") {
                l_label = get_message("POGCR_DRAFT_VERSION");
                fieldValue = sessionStorage.getItem("P25_EXISTING_DRAFT_VER");
            } else if (typeof p_object !== "undefined" && p_object !== "") {
                var fieldValue = getFieldValue(p_object, obj.Map, p_label_type); //ASA-1361 20240501 added the p_label_type param
            } else {
                var fieldValue = eval("g_pog_json[" + p_pog_index + "]." + obj.Map);
            }
            if (fieldValue !== undefined) {
                append_detail = append_detail + divider + l_label + ': <span style="color:yellow">' + fieldValue + "</span>";
                line_width = (" | : " + l_label + ":" + fieldValue).visualLength("ruler");
            }
        }*/
        var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; //ASA-1254
        if (valid_width + line_width > browserWidth) {
            append_detail = append_detail + "<br>";
            lines_arry.push(valid_width);
            valid_width = 0;
        }
        // Update valid_width after adding the current item
        valid_width += line_width;
        i++;
    }
    p_context_element.classList.add("active");
    return [lines_arry, append_detail];
}
//ASA-1360 Task 2 End
//this function is used in mouse move on the pixel move when the mouse pointer travels from one canvas to another. at that movement.
//we need to remove all the items in one canvas and create new objects in new canvas and assign to mouse event.
async function create_drag_objects(p_moduleIndex, p_shelfIndex, p_item_index, p_shelfInfo, p_itemInfo, p_show_live_image, p_object_type, p_object, p_oldPogIndex, p_pog_index) {
    logDebug("function : create_drag_objects; p_module_index : " + p_moduleIndex + "; p_shelf_index : " + p_shelfIndex + "; i_item_index : " + p_item_index + "; i_show_live_image : " + p_show_live_image + "; p_object_type : " + p_object_type, "S");
    g_module_index = p_moduleIndex;
    g_shelf_index = p_shelfIndex;
    if (p_object_type == "SHELF") {
        var colorValue = parseInt(p_shelfInfo.Color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        if (p_shelfInfo.ObjType == "PEGBOARD") {
            var return_val = add_pegboard(p_shelfInfo.Shelf, p_shelfInfo.W, p_shelfInfo.H, p_shelfInfo.D, hex_decimal, p_shelfInfo.X, p_shelfInfo.Y, 0.004, "Y", p_shelfInfo.VertiStart, p_shelfInfo.VertiSpacing, p_shelfInfo.HorizStart, p_shelfInfo.HorizSpacing, p_moduleIndex, p_shelfIndex, p_shelfInfo.Rotation, p_shelfInfo.Slope, "N", $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_oldPogIndex); //ASA-1350 issue 6 added parameters
        } else if (p_shelfInfo.ObjType == "TEXTBOX") {
            var bg_color = colorValue;

            if (p_show_live_image == "Y" && p_shelfInfo.TextImg !== "" && typeof p_shelfInfo.TextImg !== "undefined" && p_shelfInfo.TextImg !== null) {
                var return_val = await add_text_box_with_image(p_shelfInfo.Shelf, "TEXTBOX", p_shelfInfo.W, p_shelfInfo.H, p_shelfInfo.D, hex_decimal, p_shelfInfo.X, p_shelfInfo.Y, 0.004, "Y", p_moduleIndex, p_shelfInfo.InputText, bg_color, p_shelfInfo.WrapText, p_shelfInfo.ReduceToFit, p_shelfInfo.Color, p_shelfIndex, p_shelfInfo.Rotation, p_shelfInfo.Slope, "N", p_shelfInfo.FStyle, p_shelfInfo.FSize, p_shelfInfo.FBold, $v("P25_NOTCH_HEAD"), p_oldPogIndex);
            } else {
                var return_val = add_text_box(p_shelfInfo.Shelf, "TEXTBOX", p_shelfInfo.W, p_shelfInfo.H, p_shelfInfo.D, hex_decimal, p_shelfInfo.X, p_shelfInfo.Y, 0.004, "Y", p_moduleIndex, p_shelfInfo.InputText, bg_color, p_shelfInfo.WrapText, p_shelfInfo.ReduceToFit, p_shelfInfo.Color, p_shelfIndex, p_shelfInfo.Rotation, p_shelfInfo.Slope, "N", p_shelfInfo.FStyle, p_shelfInfo.FSize, p_shelfInfo.FBold, 2, p_oldPogIndex, g_pogcr_enhance_textbox_fontsize, p_shelfInfo.TextDirection); //ASA-1797.1
            }
        } else if (p_shelfInfo.ObjType == "ROD") {
            var return_val = add_rod(p_shelfInfo.Shelf, "SHELF", p_shelfInfo.W, p_shelfInfo.H, p_shelfInfo.D, hex_decimal, p_shelfInfo.X, p_shelfInfo.Y, 0.004, "Y", p_moduleIndex, p_shelfIndex, p_oldPogIndex);
        } else {
            var [return_val, shelf_cnt] = await add_shelf(p_shelfInfo.Shelf, "SHELF", p_shelfInfo.W, p_shelfInfo.H, p_shelfInfo.D, hex_decimal, p_shelfInfo.X, p_shelfInfo.Y, 0.004, "Y", p_moduleIndex, p_shelfInfo.Rotation, p_shelfInfo.Slope, p_shelfIndex, "N", "N", "Y", -1, $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_oldPogIndex); ////ASA-1350 issue 6 added parameters,//ASA-1487
            var res = updateObjID(p_object.id, return_val, "S");
        }
        g_pog_json[p_oldPogIndex].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].SObjID = return_val;
    } else {
        if (p_itemInfo.Item == "DIVIDER") {
            var return_val = add_items(p_itemInfo.ItemID, p_itemInfo.W, p_itemInfo.H, p_itemInfo.D, p_itemInfo.Color, p_itemInfo.X, p_itemInfo.Y, p_itemInfo.Z, p_moduleIndex, p_shelfIndex, p_item_index, p_itemInfo.Rotation, p_oldPogIndex);
            var shelf_arr = g_pog_json[p_oldPogIndex].ModuleInfo[p_moduleIndex].ShelfInfo;
            var div_index = -1;
            var j = 0;
            for (const shelfs of shelf_arr) {
                if (shelfs.Shelf == p_itemInfo.ItemID && shelfs.ObjType == "DIVIDER") {
                    div_index = j;
                }
                j++;
            }
            if (div_index > -1) {
                g_pog_json[p_oldPogIndex].ModuleInfo[p_moduleIndex].ShelfInfo[div_index].ShelfDivObjID = return_val;
            }
        } else {
            if (p_show_live_image == "Y") {
                var details = g_orientation_json[items.Orientation];
                var details_arr = details.split("###");

                // if (ItemInfo['ImgExists'] == 'Y') {
                var return_val = await add_items_with_image(p_itemInfo.ItemID, p_itemInfo.W, p_itemInfo.H, p_itemInfo.D, p_itemInfo.Color, p_itemInfo.X, p_itemInfo.Y, p_itemInfo.Z, p_moduleIndex, p_shelfIndex, p_item_index, p_itemInfo.BHoriz, p_itemInfo.BVert, p_itemInfo.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", "Y", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_oldPogIndex);
            } else {
                var return_val = await add_items_prom(p_itemInfo.ItemID, p_itemInfo.W, p_itemInfo.H, p_itemInfo.D, p_itemInfo.Color, p_itemInfo.X, p_itemInfo.Y, p_itemInfo.Z, p_moduleIndex, p_shelfIndex, p_item_index, "N", "Y", $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_oldPogIndex);
            }
        }
        g_pog_json[p_oldPogIndex].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_item_index].OldObjID = g_pog_json[p_oldPogIndex].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_item_index].ObjID;
        g_pog_json[p_oldPogIndex].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_item_index].ObjID = return_val;
    }
    var selectObjects = g_world.getObjectById(return_val);
    selectObjects.W = p_object.W;
    selectObjects.H = p_object.H;
    selectObjects.D = p_object.D;
    selectObjects.Color = p_object.Color;
    selectObjects.Rotation = p_object.Rotation;
    selectObjects.ItemSlope = p_object.ItemSlope;
    selectObjects.Rotation = p_object.Rotation;
    selectObjects.Distance = p_object.Distance;
    selectObjects.PegBoardX = p_object.PegBoardX;
    selectObjects.PegBoardY = p_object.PegBoardY;
    selectObjects.ShelfInfo = p_object.ShelfInfo;
    selectObjects.ItemInfo = p_object.ItemInfo;
    selectObjects.IIndex = p_object.IIndex;
    selectObjects.StartCanvas = p_object.StartCanvas;
    selectObjects.MIndex = p_object.MIndex;
    selectObjects.SIndex = p_object.SIndex;
    render(p_pog_index);
    logDebug("function : create_drag_objects", "E");
    return [selectObjects, return_val];
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
                        apex.item("P25_MODULE_DISP").setValue(modules.Module);
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
                        apex.item("P25_MODULE_DISP").setValue(modules.Module);
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
//this function is called in mouseup when single object are dragged from one canvas to another. for multiple objects drag to different canvas
//or same canvas multi drag setup function is called.
async function multi_canvas_drag(p_final_x, p_final_y, p_module_index, p_shelf_index, p_shelf_edit_flag, p_module_edit_flag, p_pog_index) {
    try {
        logDebug("function : multi_canvas_drag; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_shelf_edit_flag : " + p_shelf_edit_flag + "; i_module_edit_flag : " + p_module_edit_flag, "S");
        var new_pogjson = [];
        var remove_pogjson = [];
        var new_world,
            remove_world,
            remove_renderer = g_scene_objects[g_start_canvas].renderer,
            remove_scene = g_scene_objects[g_start_canvas].scene,
            remove_camera = remove_scene.children[0],
            shelf_ind;

        var startDragCanvas = g_start_canvas;
        var dropDragCanvas = g_present_canvas;
        new_pogjson.push(g_pog_json[g_present_canvas]);
        new_world = g_scene_objects[g_present_canvas].scene.children[2];
        remove_pogjson.push(g_pog_json[g_start_canvas]);
        remove_world = g_scene_objects[g_start_canvas].scene.children[2];
        var shelfdtl = remove_pogjson[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var itemdtl = shelfdtl.ItemInfo[g_item_index];
        var confirm = "Y"; //ASA-1640
        var draggedItems = []; //ASA-1640
        //when shelf is dragged to another canvas.
        if (p_shelf_edit_flag == "Y") {
            var l_shelf_details = shelfdtl;
            var old_shelfX = l_shelf_details.X,
                old_shelfY = l_shelf_details.Y;
            var undoObjectsInfo = [];
            undoObjectsInfo.moduleIndex = p_module_index;
            undoObjectsInfo.module = remove_pogjson[0].ModuleInfo[p_module_index].Module;
            undoObjectsInfo.shelfIndex = p_shelf_index;
            undoObjectsInfo.objectID = shelfdtl.SObjID;
            undoObjectsInfo.actionType = "SHELF_DRAG";
            undoObjectsInfo.startCanvas = startDragCanvas;
            undoObjectsInfo.g_present_canvas = dropDragCanvas;
            var shelfInfo = JSON.parse(JSON.stringify(shelfdtl));
            undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfdtl)));

            l_shelf_details.X = p_final_x;
            l_shelf_details.Y = p_final_y;
            //this function will get the module_index on which the shelf was dropped.
            var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(p_final_x, p_final_y, "Y", p_module_index, p_shelf_index, l_shelf_details, p_pog_index);
            undoObjectsInfo.moduleObjectID = new_pogjson[0].ModuleInfo[curr_module].MObjID;
            var items_arr = shelfdtl.ItemInfo;
            var allow_crush = shelfdtl.AllowAutoCrush;
            //this function will set the new position of the items in the shelf based on the shelf drop location.
            await set_all_items(p_module_index, p_shelf_index, p_final_x, p_final_y, "Y", "E", "Y", startDragCanvas, dropDragCanvas);

            if (g_shelf_object_type !== "ROD" && g_shelf_object_type !== "TEXTBOX" && shelf_rotate_hit == "N") {
                //validate shelf with or without item if hit other objects if dragged in same module
                var validate_passed = validate_shelf_min_distance(curr_module, p_shelf_index, p_final_y, items_arr, allow_crush, p_module_index, p_final_x, "Y", l_shelf_details, p_pog_index);
            } else if (shelf_rotate_hit == "Y") {
                validate_passed = "N";
            } else {
                validate_passed = "Y";
            }

            if (g_multi_cnvs_drag_conf == "Y" && (validate_passed == "Y" || validate_passed == "R")) {
                for (const items of g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo) {
                    draggedItems.push(items.ItemID);
                }
                confirm = await doItemMoveConf(draggedItems, g_pog_json, g_present_canvas);
            } //ASA-1640
            if ((validate_passed == "Y" || validate_passed == "R") && confirm == "Y" /*ASA-1640*/) {
                g_allUndoObjectsInfo.push(undoObjectsInfo);
                logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y", g_carpark_item_flag);
                g_allUndoObjectsInfo = [];
                var div_shelf_index = -1;
                var shelf_found = "N";

                var child_module_index = -1;
                var module_arr = new_pogjson[0].ModuleInfo;
                var objects = {};
                //if the dragged object is text box then we need to create a moduleinfo for that shelfinfo.
                if (g_shelf_object_type == "TEXTBOX") {
                    var i = 0;
                    for (const modules of module_arr) {
                        if (modules.ObjID == g_objectHit_id) {
                            new_pogjson[0].ModuleInfo[i].ParentModule = new_pogjson[0].ModuleInfo[curr_module].Module;
                            child_module_index = i;

                            return;
                        }
                        i++;
                    }
                    objects = remove_pogjson[0].ModuleInfo[child_module_index];
                    if (child_module_index == 0) {
                        console.log("before", remove_pogjson[0].ModuleInfo[p_module_index]);
                        remove_pogjson[0].ModuleInfo.splice(child_module_index, child_module_index + 1);
                        console.log("after", remove_pogjson[0].ModuleInfo[p_module_index]);
                    } else {
                        // remove_pogjson[0].ModuleInfo.splice(child_module_index, 1); 
                    }
                    //ASA-2023 task-2 End

                    new_pogjson[0].ModuleInfo.push(objects);
                }

                if (p_shelf_index == 0) {
                    remove_pogjson[0].ModuleInfo[p_module_index].ShelfInfo.splice(p_shelf_index, p_shelf_index + 1);
                } else {
                    console.log("before", remove_pogjson[0].ModuleInfo[p_module_index]);
                    remove_pogjson[0].ModuleInfo[p_module_index].ShelfInfo.splice(p_shelf_index, 1);
                }

                var min_shelf_detail = get_min_shelf(curr_module, p_final_y, p_pog_index);
                var shelf_info = min_shelf_detail.split(",");
                div_shelf_index = parseFloat(shelf_info[0]);
                shelf_found = shelf_info[1];
                l_shelf_details.Shelf = new_pogjson[0].ModuleInfo[curr_module].Module + new_pogjson[0].ModuleInfo[curr_module].ShelfInfo.length;
                g_dragItem.Module = new_pogjson[0].ModuleInfo[curr_module].Module;

                if (shelf_found == "Y") {
                    new_pogjson[0].ModuleInfo[curr_module].ShelfInfo.splice(div_shelf_index + 1, 0, l_shelf_details);
                    shelf_ind = div_shelf_index + 1;
                } else {
                    new_pogjson[0].ModuleInfo[curr_module].ShelfInfo.splice(div_shelf_index, 0, l_shelf_details);
                    shelf_ind = 0;
                }

                if (new_pogjson[0].ModuleInfo[curr_module].H > 0.1 && g_shelf_object_type !== "ROD" && g_shelf_object_type !== "TEXTBOX" && g_auto_position_ind == "Y") {
                    /*auto position button is on find the module behind the fixel drop position and find the corner of
                    module and please fixel there*/
                    auto_position_shelf(curr_module, curr_module, shelf_ind, shelf_rotate_hit, p_final_x, p_final_y, "Y", p_pog_index);
                }

                if (validate_passed == "R") {
                    var return_val = recreate_all_items(curr_module, shelf_ind, new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[shelf_ind].ObjType, "N", p_final_x, -1, new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[shelf_ind].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                    if (g_combineItemModf.length > 0) {
                        for (var mf = 0; mf < g_combineItemModf.length; mf++) {
                            if (g_combineItemModf[mf].OldMIndex == curr_module && g_combineItemModf[mf].OldSIndex == shelf_ind) {
                                curr_module = g_combineItemModf[mf].NewMIndex;
                                shelf_ind = g_combineItemModf[mf].NewSIndex;
                                break;
                            }
                        }
                    }
                }
                var shelfdtl = new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[shelf_ind]; //ASA-1107 Start
                var selectobj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfdtl.SObjID);
                g_intersected.push(selectobj);
                render_animate_selected(); //ASA-1107 END
                if (g_shelf_object_type == "TEXTBOX") {
                    var shelfz = get_textbox_z(curr_module, shelf_ind, new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[shelf_ind].X, new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[shelf_ind].Y, new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[shelf_ind].W, new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[shelf_ind].H, startDragCanvas, p_pog_index);
                    new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[shelf_ind].Z = shelfz;
                }
            } else {
                //if validation fails we need to remove the object created in new canvas and create same shelf in same position in old canvas.
                g_world = remove_world;
                //creating shelf in old canvas - remove_world
                var [shelf_obj, obj_id] = await create_drag_objects(p_module_index, p_shelf_index, g_item_index, g_dragItem.ShelfInfo, g_dragItem.ItemInfo, g_show_live_image, "SHELF", g_dragItem, g_start_canvas, p_pog_index);

                new_world.remove(g_dragItem);
                shelf_obj.position.x = old_shelfX;
                shelf_obj.position.y = old_shelfY;
                shelfdtl.SObjID = shelf_obj.id;
                shelfdtl.X = old_shelfX;
                shelfdtl.Y = old_shelfY;
                var l_temp_arr = [];
                g_intersected = [];
                var shelfblink = g_pog_json[g_start_canvas].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID; //ASA-1640
                //create all items on the shelf.
                if (shelfInfo.ItemInfo.length > 0) {
                    var i = 0;
                    for (const objects of shelfInfo.ItemInfo) {
                        var selectedObject = new_world.getObjectById(objects.ObjID);
                        var [return_obj, obj_id] = await create_drag_objects(p_module_index, p_shelf_index, i, shelfInfo, objects, g_show_live_image, "ITEM", selectedObject, startDragCanvas, p_pog_index);
                        new_world.remove(selectedObject);
                        return_obj.position.x = objects.X;
                        return_obj.position.y = objects.Y;
                        shelfdtl.ItemInfo[i].X = objects.X;
                        shelfdtl.ItemInfo[i].Y = objects.Y;
                        shelfdtl.ItemInfo[i].ObjID = return_obj.id;
                        l_temp_arr.push(return_obj);
                        var selectedObject = g_scene_objects[g_start_canvas].scene.children[2].getObjectById(return_obj.id); //ASA 1107     //ASA-1640
                        g_intersected.push(selectedObject);
                        render_animate_selected();
                        i++;
                    }
                    g_intersected.push(g_scene_objects[g_start_canvas].scene.children[2].getObjectById(shelfblink)); //ASA-1640
                    render_animate_selected();
                    set_inter_canvas_items(old_shelfX, old_shelfY, shelf_obj, l_temp_arr, l_shelf_details.W, l_shelf_details.H, g_shelf_object_type, g_shelf_basket_spread, l_shelf_details.Rotation, l_shelf_details.Slope, p_shelf_index, p_module_index, g_start_canvas);
                } else {
                    var selectedObject = g_scene_objects[g_start_canvas].scene.children[2].getObjectById(shelfblink); //ASA 1107    //ASA-1640
                    g_intersected.push(selectedObject);
                    render_animate_selected();
                }
                //remove_renderer.render(remove_scene,remove_camera);
                render(g_start_canvas);
                g_world = new_world;
            }
            //for start canvas
            await calculateFixelAndSupplyDays("N", g_present_canvas);
            //for end canvas
            await calculateFixelAndSupplyDays("N", g_start_canvas);
            g_canvas_drag = "N";
            g_drag_inprogress = "N";
            g_drag_items_arr = [];
            g_dragItem = [];
            render(p_pog_index);
        } else if (g_item_edit_flag == "Y") {
            //when item is dragged to new canvas.
            var shelfs = shelfdtl;
            //getting module_index where the item was dropped.
            var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(p_final_x, p_final_y, "Y", p_module_index, p_shelf_index, shelfs, p_pog_index);
            //getting the shelf from the point where item was dropped.
            var [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found] = get_div_shelf_index(p_final_x, p_final_y, curr_module, item_inside_world, p_pog_index, "", false); //ASA-1592
            var old_ItemInfo = JSON.parse(JSON.stringify(remove_pogjson[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[g_item_index]));
            var old_objid = old_ItemInfo.ObjID;
            var ItemInfo = remove_pogjson[0].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[g_item_index];
            var l_old_itemX = ItemInfo.X;
            var l_old_itemY = ItemInfo.Y;
            if (g_multi_cnvs_drag_conf == "Y" && div_shelf_index !== -1) {
                draggedItems = [g_pog_json[g_start_canvas].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].ItemID];
                confirm = await doItemMoveConf(draggedItems, g_pog_json, g_present_canvas);
            } //ASA-1640
            if (div_shelf_index !== -1 && confirm != "N" /*ASA-1640*/) {
                //log info for undo purpose
                undoObjectsInfo = [];
                undoObjectsInfo.moduleIndex = curr_module;
                undoObjectsInfo.shelfIndex = div_shelf_index;
                undoObjectsInfo.actionType = "ITEM_DELETE";
                undoObjectsInfo.startCanvas = dropDragCanvas;
                undoObjectsInfo.g_present_canvas = startDragCanvas;
                undoObjectsInfo.objectID = new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].SObjID;
                undoObjectsInfo.module = new_pogjson[0].ModuleInfo[curr_module].Module;
                undoObjectsInfo.moduleObjectID = new_pogjson[0].ModuleInfo[curr_module].MObjID;
                undoObjectsInfo.push(JSON.parse(JSON.stringify(new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[div_shelf_index])));
                g_allUndoObjectsInfo.push(undoObjectsInfo);
                undoObjectsInfo = [];
                undoObjectsInfo.moduleIndex = p_module_index;
                undoObjectsInfo.shelfIndex = p_shelf_index;
                undoObjectsInfo.actionType = "ITEM_DELETE";
                undoObjectsInfo.startCanvas = startDragCanvas;
                undoObjectsInfo.g_present_canvas = dropDragCanvas;
                undoObjectsInfo.objectID = shelfdtl.SObjID;
                undoObjectsInfo.module = remove_pogjson[0].ModuleInfo[p_module_index].Module;
                undoObjectsInfo.moduleObjectID = remove_pogjson[0].ModuleInfo[p_module_index].MObjID;
                undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfdtl)));
                g_allUndoObjectsInfo.push(undoObjectsInfo);
                var item_fixed = g_dragItem.ItemInfo.Fixed;
                var spread_product = new_pogjson[0].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].SpreadItem;
                var item_width_arr = [],
                    item_height_arr = [],
                    item_depth_arr = [],
                    item_index_arr = [];

                ItemInfo["Fixed"] = "N";
                itemdtl.X = p_final_x;
                itemdtl.Y = p_final_y;

                var [upd_item_index, new_shelf_index, new_module_index, new_object_type, g_edit_ind, ItemInfo, div_index, bottom_item_flag, bottom_item_ind] = await update_item_loc(curr_module, p_module_index, p_shelf_index, div_shelf_index, div_object_type, g_dragItem.IIndex, p_final_x, shelf_found, ItemInfo, shelfY, shelfHeight, p_final_y, new_pogjson, "B", g_present_canvas, startDragCanvas); //Task_27812 issue 13
                if ((typeof old_ItemInfo.TopObjID !== "undefined" && old_ItemInfo.TopObjID !== "") || (typeof old_ItemInfo.BottomObjID !== "undefined" && old_ItemInfo.BottomObjID !== "")) {
                    var returnval = reset_bottom_item(p_module_index, p_shelf_index, g_item_index, curr_module, new_shelf_index, p_final_x, g_start_canvas);
                }
                if (new_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                    //ASA-1125
                    yaxis = p_final_y;
                } else if (new_object_type !== "PEGBOARD") {
                    var [xaxis, yaxis] = get_item_xy(new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index], ItemInfo, ItemInfo.W, ItemInfo.H, g_present_canvas);
                } else {
                    yaxis = p_final_y;
                }
                if (new_object_type == "BASKET" && ItemInfo["Item"] == "DIVIDER") {
                    ItemInfo["Y"] = p_final_y;
                } else {
                    ItemInfo["Y"] = yaxis;
                }

                //splice from removed shelf
                shelfdtl.ItemInfo.splice(g_dragItem.IIndex, 1);

                var l_edited_item_index = set_item_after_drag(new_object_type, spread_product, new_module_index, new_shelf_index, upd_item_index, ItemInfo, g_present_canvas);
                if ((g_pegbrd_auto_placing == "Y" && new_object_type == "PEGBOARD") || new_object_type !== "PEGBOARD") {
                    ItemInfo["Edited"] = "Y";
                } else {
                    ItemInfo["Edited"] = "N";
                }

                var j = 0;
                for (const items of new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo) {
                    if (items.ObjID == ItemInfo.ObjID) {
                        l_edited_item_index = j;
                        break; //return false;
                    }
                    j++;
                }

                var return_val = "N";

                var items = new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];
                var spread_gap = new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].HorizGap;

                var new_x = get_item_xaxis(items.W, items.H, items.D, new_object_type, p_final_x, spread_gap, spread_product, spread_gap, new_module_index, new_shelf_index, l_edited_item_index, new_object_type == "PALLET" ? "N" : "Y", new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.length, "N", g_present_canvas);
                new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].X = new_x;
                var item_info = new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];
                //getting latest height and width and validate the item height in the present shelf.
                return_val = update_validate_item_height(items, new_module_index, new_shelf_index, l_edited_item_index, p_final_x, new_object_type, new_x, g_present_canvas);
                if (new_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                    //ASA-1125
                    yaxis = p_final_y;
                } else if (new_object_type !== "PEGBOARD") {
                    var [xaxis, yaxis] = get_item_xy(new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index], item_info, item_info.W, item_info.H, g_present_canvas);
                } else {
                    yaxis = p_final_y;
                }
                if (new_object_type == "BASKET" && ItemInfo["Item"] == "DIVIDER") {
                    item_info.Y = p_final_y;
                } else {
                    item_info.Y = yaxis;
                }
                if (g_max_facing_enabled == "Y") {
                    reset_auto_crush(new_module_index, new_shelf_index, l_edited_item_index, g_present_canvas, new_module_index, new_shelf_index, dropDragCanvas); //ASA-1343 issue 1
                }

                await set_auto_facings(new_module_index, new_shelf_index, l_edited_item_index, items, "B", "I", "D", g_present_canvas);
                var drag_item_arr = [];
                item_width_arr.push(wpdSetFixed(ItemInfo["W"]));
                item_height_arr.push(wpdSetFixed(ItemInfo["H"]));
                item_depth_arr.push(wpdSetFixed(ItemInfo["D"]));
                item_index_arr.push(l_edited_item_index);
                if (return_val == "F" || return_val == "N") {
                    logFinalUndoObjectsInfo("SHELF_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y", g_carpark_item_flag);
                    g_allUndoObjectsInfo = [];
                    if (reorder_items(new_module_index, new_shelf_index, g_present_canvas)) {
                        var return_val = await recreate_all_items(new_module_index, new_shelf_index, new_object_type, "Y", p_final_x, -1, new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.length, "N", "N", -1, -1, dropDragCanvas, "", g_present_canvas, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                        if (g_combineItemModf.length > 0) {
                            for (var mf = 0; mf < g_combineItemModf.length; mf++) {
                                if (g_combineItemModf[mf].OldMIndex == new_module_index && g_combineItemModf[mf].OldSIndex == new_shelf_index) {
                                    new_module_index = g_combineItemModf[mf].NewMIndex;
                                    new_shelf_index = g_combineItemModf[mf].NewSIndex;
                                    break;
                                }
                            }
                        }
                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID); //ASA 1107
                        g_intersected.push(selectedObject);
                        render_animate_selected();
                    }
                    if (reorder_items(p_module_index, p_shelf_index, g_start_canvas)) {
                        var return_val = await recreate_all_items(p_module_index, p_shelf_index, g_shelf_object_type, "Y", p_final_x, -1, shelfdtl.ItemInfo.length, "N", "N", -1, -1, startDragCanvas, "", g_start_canvas, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                        if (g_combineItemModf.length > 0) {
                            for (var mf = 0; mf < g_combineItemModf.length; mf++) {
                                if (g_combineItemModf[mf].OldMIndex == p_module_index && g_combineItemModf[mf].OldSIndex == p_shelf_index) {
                                    p_module_index = g_combineItemModf[mf].NewMIndex;
                                    p_shelf_index = g_combineItemModf[mf].NewSIndex;
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    g_allUndoObjectsInfo = [];
                    old_ItemInfo.DimUpdate = new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].DimUpdate;
                    if (g_carpark_item_flag == "N") {
                        //     var returnval = reset_bottom_item(new_module_index, new_shelf_index, l_edited_item_index, -1, -1, i_final_x, g_start_canvas);--temp commented
                    }
                    if (l_edited_item_index == 0) {
                        new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.splice(l_edited_item_index, l_edited_item_index + 1);
                    } else {
                        new_pogjson[0].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.splice(l_edited_item_index, 1);
                    }
                    if (g_carpark_item_flag == "Y") {
                        remove_pogjson[0].ModuleInfo[p_module_index].Carpark[0].ItemInfo.splice(g_item_index, 0, old_ItemInfo);
                        remove_pogjson[0].ModuleInfo[p_module_index].Carpark[0].ItemInfo[g_item_index].X = l_old_itemX;
                        remove_pogjson[0].ModuleInfo[p_module_index].Carpark[0].ItemInfo[g_item_index].Y = l_old_itemY;
                    } else {
                        if (spread_product == "R") {
                            shelfdtl.ItemInfo.splice(g_item_index, 0, old_ItemInfo);
                        } else {
                            shelfdtl.ItemInfo.splice(g_item_index, 0, old_ItemInfo);
                        }
                        itemdtl.X = l_old_itemX;
                        itemdtl.Y = l_old_itemY;
                    }
                    g_world = remove_world;
                    var [return_obj, obj_id] = await create_drag_objects(p_module_index, p_shelf_index, g_item_index, shelfs, old_ItemInfo, g_show_live_image, "ITEM", g_dragItem, g_start_canvas, g_present_canvas);
                    return_obj.position.x = l_old_itemX;
                    return_obj.position.y = l_old_itemY;
                    itemdtl.ObjID = return_obj.id;
                    g_world = new_world;
                    var selectedobject = new_world.getObjectById(old_objid);
                    new_world.remove(selectedobject);
                    return_obj.updateMatrix();
                }
            } else {
                //if no shelf found on drop location then revert back the item to old position and old canvas.
                if (g_carpark_item_flag == "Y") {
                    remove_pogjson[0].ModuleInfo[p_module_index].Carpark[0].ItemInfo[g_item_index].X = l_old_itemX;
                    remove_pogjson[0].ModuleInfo[p_module_index].Carpark[0].ItemInfo[g_item_index].Y = l_old_itemY;
                } else {
                    itemdtl.X = l_old_itemX;
                    itemdtl.Y = l_old_itemY;
                }
                g_world = remove_world;
                var [return_obj, obj_id] = await create_drag_objects(p_module_index, p_shelf_index, g_item_index, shelfs, itemdtl, g_show_live_image, "ITEM", g_dragItem, g_start_canvas, g_present_canvas);

                return_obj.position.x = l_old_itemX;
                return_obj.position.y = l_old_itemY;
                itemdtl.ObjID = return_obj.id;
                //remove_renderer.render(remove_scene,remove_camera);
                render(g_start_canvas);
                g_world = new_world;
                var selectedobject = new_world.getObjectById(old_objid);
                new_world.remove(selectedobject);
                return_obj.updateMatrix();
            }
            //for start canvas
            await calculateFixelAndSupplyDays("N", g_present_canvas);
            //for end canvas
            await calculateFixelAndSupplyDays("N", g_start_canvas);
            g_canvas_drag = "N";
            g_drag_inprogress = "N";
            g_drag_items_arr = [];
            g_dragItem = [];
            render(p_pog_index);
            render(g_start_canvas);
            render_all_pog();
            animate_all_pog();
            render_animate_selected();

            await recreate_compare_views(g_compare_view, "Y");
        }
        logDebug("function : multi_canvas_drag", "E");
    } catch (err) {
        error_handling(err);
    }
}
//this function is used in context_paste. this will separate multi selected object checking. shelfs and individual items that dragged individually together
//with shelfs. or there could be only shelf or only items. so it will send back 2 different array with list of objects for doing processing separately.
function get_multi_item_shelf(p_delete_details, p_pog_index) {
    try {
        logDebug("function : get_multi_item_shelf", "S");
        var l_shelf_details = [];
        var item_details = [];
        var i = 0;
        for (const objects of p_delete_details) {
            if (typeof objects.IntoShelf == "undefined") {
                objects.IntoShelf = "N";
            }
            if (objects.Object == "SHELF" && objects.IsDivider == "N") {
                l_shelf_details.push(objects);
                objects.IntoShelf = "Y";
                objects.ShelfInfo = [JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex]))];
                if (objects.ObjType !== "TEXTBOX") {
                    l_shelf_details[l_shelf_details.length - 1].ShelfItems = [];
                    j = 0;
                    for (const items of p_delete_details) {
                        if (objects.MIndex == items.MIndex && objects.SIndex == items.SIndex && items.Object !== "SHELF") {
                            items.IntoShelf = "Y";
                            l_shelf_details[l_shelf_details.length - 1].ShelfItems.push(items);
                        }
                        j = j + 1;
                    }
                }
                if (objects.ObjType == "TEXTBOX") {
                    var child_module_index = -1;
                    var module_arr = g_pog_json[p_pog_index].ModuleInfo;
                    var i = 0;
                    for (const modules of module_arr) {
                        if (modules.ObjID == objects.ObjID) {
                            child_module_index = i;
                            break;
                        }
                        i++;
                    }
                    if (child_module_index !== -1) {
                        objects.support_obj = [JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[child_module_index]))];
                    }
                }
            } else if (objects.IntoShelf == "N") {
                item_details.push(objects);
                if (p_delete_details.multi_carpark_ind == "Y") {
                    item_details[item_details.length - 1].ItemObj = [JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Carpark[objects.SIndex].ItemInfo[objects.IIndex]))];
                } else {
                    item_details[item_details.length - 1].ItemObj = [JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex]))];
                }
                if (objects.IsDivider == "Y") {
                    shelf_arr = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo;
                    var div_index = -1;
                    $.each(shelf_arr, function (i, shelfs) {
                        if (shelfs.Shelf == objects.ItemID) {
                            div_index = i;
                        }
                    });
                    if (div_index !== -1) {
                        objects.support_obj = [JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[div_index]))];
                    }
                } else {
                    objects.support_obj = [];
                }
            }
            i = i + 1;
        }
        logDebug("function : get_multi_item_shelf", "E");
        return [l_shelf_details, item_details];
    } catch (err) {
        error_handling(err);
    }
}

// this function is used for all multi select drag scenarios. this could be same canvas drop or drop objects in different canvas.
//this will process all the shelfs and individual items separately.
async function multi_drag_setup(p_final_x, p_final_y, p_camera, p_pog_index) {
    logDebug("function : multi_drag_setup; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y, "S");
    try {
        var l_shelf_details = [];
        var item_details = [];

        var item_width_arr = [],
            item_height_arr = [],
            item_depth_arr = [],
            item_index_arr = [],
            new_shelf = [],
            new_shelf_combine_undo = [], //ASA-1443
            shelf_list = [],
            olf_shelf = [],
            old_shelf_combine_undo = [],
            new_combination = -1,
            old_combination = -1; //ASA-1443

        var startDragCanvas = g_start_canvas;
        var dropDragCanvas = g_present_canvas;
        g_canvas_drag = "N";
        var valid = "Y";
        var cnfrm = "Y";
        var reset = "Y";
        var get_update_index = "Y";
        var drag_direction = "B";
        var drag_item_arr = [];
        var temp_cut_arr_1 = [];
        //ASA=1300
        var l_chest_ind = "N",
            l_chest_mod_ind = -1,
            l_chest_shelf_ind = -1;
        g_temp_cut_arr = [];
        startCanvas = "R";
        var undoAction;
        var remove_pogjson = [];
        var remove_renderer = g_scene_objects[g_start_canvas].renderer,
            remove_scene = g_scene_objects[g_start_canvas].scene,
            remove_camera = remove_scene.children[0];
        remove_world = remove_scene.children[2];
        remove_pogjson.push(g_pog_json[startDragCanvas]);
        g_temp_cut_arr.push(JSON.parse(JSON.stringify(g_pog_json[startDragCanvas].ModuleInfo)));
        temp_cut_arr_1.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo)));
        var undo_new_mod_index = -1,
            undo_new_fixel_index = -1,
            undo_old_mod_index = -1,
            undo_old_fixel_index = -1; //ASA-1443 issue 1
        var valid_shelf_index = -1; //ASA-1496 TASK 6
        var [currCombinationIndex, currShelfCombIndx] = [-1, -1]; //ASA-1496 TASK 6
        var confirm = "Y"; //ASA-1640
        var draggedItems = []; //ASA-1640

        //first part is separating shelfs and individual items into separately array. because both should be process in different methods.
        var i = 0;
        for (const objects of g_delete_details) {
            if (typeof objects.IntoShelf == "undefined") {
                objects.IntoShelf = "N";
            }
            if (objects.Object == "SHELF" && objects.IsDivider == "N") {
                l_shelf_details.push(objects);
                objects.IntoShelf = "Y";
                l_shelf_details[l_shelf_details.length - 1].ItemInfo = [];
                var j = 0;
                for (const items of g_delete_details) {
                    if (objects.MIndex == items.MIndex && objects.SIndex == items.SIndex && items.Object !== "SHELF") {
                        items.IntoShelf = "Y";
                        var itemInfo = g_pog_json[startDragCanvas].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex];
                        l_shelf_details[l_shelf_details.length - 1].ItemInfo.push(itemInfo);
                    }
                    j = j + 1;
                }
            } else if (objects.IntoShelf == "N") {
                item_details.push(objects);
                if (g_delete_details.multi_carpark_ind == "Y") {
                    item_details[item_details.length - 1].ItemObj = [JSON.parse(JSON.stringify(g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[objects.IIndex]))];
                } else {
                    item_details[item_details.length - 1].ItemObj = [JSON.parse(JSON.stringify(g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex]))];
                }
            }
            objects.OldItemX = objects.XAxis;
            objects.OldItemY = objects.YAxis;
            i = i + 1;
        }
        //loop through all the shelfs and get the dropped location module_index and validate if shelf can be placed or not.
        if (l_shelf_details.length > 0) {
            i = 0;
            for (const objects of l_shelf_details) {
                var validate_passed = "Y";
                var act_x = p_final_x + objects.XDistance;
                var act_y = p_final_y + objects.YDistance;
                g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].X = act_x;
                g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Y = act_y;
            }
            // ASA-1361 20240501
            // if ($v("P25_POGCR_COMBINATION_SHELF") == "Y") {
            //if your moving any shelf that is in combine setup. give warning to break the combination or not.
            cnfrm = await getconfirm_shelfmove(startDragCanvas);
            // }
            var i = 0;
            for (const objects of l_shelf_details) {
                var validate_passed = "Y";
                if (objects.ObjType == "PEGBOARD" || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                    //ASA-1125
                    /**ASA-1592 Start
                     * Code changed because while selecting multiple items in pegboard cursor position is at top center of the item(dragged item)
                     * to calculate y we need to subtract objects.YDistance because it is the center of the item
                     **/
                    // var act_y = p_final_y < 0 ? p_final_y + objects.YDistance : p_final_y - objects.YDistance;
                    var act_y = p_final_y - objects.YDistance;
                    // ASA-1592 End
                } else {
                    var act_y = p_final_y + objects.YDistance;
                }
                var act_x = p_final_x + objects.XDistance;

                var shelfs = g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(act_x, act_y, "Y", objects.MIndex, objects.SIndex, shelfs, p_pog_index);

                var items_arr = g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
                var allow_crush = g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].AllowAutoCrush;
                if (g_pog_json[p_pog_index].ModuleInfo[curr_module].H > 0.1 && g_shelf_object_type !== "ROD" && g_shelf_object_type !== "TEXTBOX" && g_auto_position_ind == "Y") {
                    /*auto position button is on find the module behind the fixel drop position and find the corner of
                    module and please fixel there*/
                    auto_position_shelf(objects.MIndex, curr_module, objects.SIndex, shelf_rotate_hit, act_x, act_y, "N", p_pog_index);
                } else {
                    await set_all_items(objects.MIndex, objects.SIndex, act_x, act_y, "Y", "E", "Y", startDragCanvas, dropDragCanvas);
                }
                var mod_ind = curr_module == objects.MIndex ? objects.MIndex : curr_module;

                if (objects.ObjType !== "ROD" && objects.ObjType !== "TEXTBOX" && shelf_rotate_hit == "N" && cnfrm == "Y") {
                    //validate shelf with or without item if hit other objects if dragged in same module
                    var validate_passed = validate_shelf_min_distance(mod_ind, objects.SIndex, act_y, items_arr, allow_crush, objects.MIndex, act_x, "Y", shelfs, p_pog_index);
                } else if (shelf_rotate_hit == "Y") {
                    validate_passed = "N";
                } else {
                    validate_passed = "Y";
                }

                if (cnfrm == "N") {
                    validate_passed = "N";
                }
                // if ((g_pog_json[p_pog_index]?.ModuleInfo[objects.MIndex]?.ShelfInfo[objects.SIndex]?.Combine = "B" && cnfrm == "Y")) {
                if (cnfrm === "Y" && g_pog_json[p_pog_index]?.ModuleInfo?.[objects.MIndex]?.ShelfInfo?.[objects.SIndex]?.Combine === "B") {
                    //ASA-1361 20240501
                    g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Combine = "N";
                }
                if (validate_passed == "Y" || validate_passed == "R") {
                    l_shelf_details[i].Valid = validate_passed;
                    l_shelf_details[i].CurrModIndex = curr_module;
                    if (shelfs.ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
                        //Bug-26122 - splitting the chest
                        shelfs.ChestEdit = "Y";
                    }
                } else {
                    for (const del_objects of g_delete_details) {
                        if (del_objects.Object == "ITEM") {
                            g_pog_json[startDragCanvas].ModuleInfo[del_objects.MIndex].ShelfInfo[del_objects.SIndex].ItemInfo[del_objects.IIndex].X = del_objects.XAxis;
                            g_pog_json[startDragCanvas].ModuleInfo[del_objects.MIndex].ShelfInfo[del_objects.SIndex].ItemInfo[del_objects.IIndex].Y = del_objects.YAxis;
                        } else {
                            g_pog_json[startDragCanvas].ModuleInfo[del_objects.MIndex].ShelfInfo[del_objects.SIndex].X = del_objects.XAxis;
                            g_pog_json[startDragCanvas].ModuleInfo[del_objects.MIndex].ShelfInfo[del_objects.SIndex].Y = del_objects.YAxis;
                        }
                    }
                    l_shelf_details[i].Valid = "N";
                    valid = "N";
                    g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].X = objects.XAxis;
                    g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Y = objects.YAxis;
                    break;
                }

                i = i + 1;
            }
        }
        //if above all the shelfs have passed validation. then proceed with item details check.
        if (valid == "Y") {
            //ASA-1244
            var valid = "Y";
            var single_drop = "N";
            if (item_details.length > 0) {
                //ASA-1094 -- Logic changed to check first its single shelf and then check total width to shelf width, if less then pass the validation.
                var i = 0;
                var total_width = 0;
                for (const objects of item_details) {
                    total_width = total_width + objects.W;
                    i++;
                }
                var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(p_final_x, p_final_y, "N", -1, -1, [], p_pog_index);
                var [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found_same] = get_div_shelf_index(p_final_x, p_final_y, curr_module, item_inside_world, p_pog_index, g_dragItem, false); //ASA-1592
                if (!(div_object_type == "CHEST" && g_chest_as_pegboard == "Y") && div_shelf_index !== -1) {
                    [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].Shelf); //Regression Issue 2 20240628
                }

                //ASA-1300 to restrict checking as we have to put all item in single shelf only
                if (!(div_object_type == "CHEST" && g_chest_as_pegboard == "Y") && currCombinationIndex == -1 && div_shelf_index !== -1) {
                    //Task_27812 issue 6 20240528
                    //ASA-1405 Issue 1
                    //here we are checking if item which are dragged are placed in same module or they span to different modules.
                    var new_curr_mod = -1,
                        new_shelf_index = -1,
                        multi_shelf = "N";
                    var no_shelf_cnt = 0;
                    var combine_ind = "N";
                    for (const objects of item_details) {
                        var act_x = p_final_x + objects.XDistance;
                        if (objects.ObjType == "PEGBOARD") {
                            //ASA-1300 || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                            //ASA-1125
                            var act_y = p_final_y - objects.YDistance; //p_final_y < 0 ? p_final_y + objects.YDistance : p_final_y - objects.YDistance;     //ASA-1592
                        } else {
                            var act_y = p_final_y + objects.YDistance;
                        }
                        var shelfs = g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                        var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(act_x, act_y, "Y", objects.MIndex, objects.SIndex, shelfs, p_pog_index);
                        var [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found_same] = get_div_shelf_index(act_x, act_y, curr_module, item_inside_world, p_pog_index, objects, true); //ASA-1592
                        if (typeof g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index] !== "undefined") {
                            valid_shelf_index = div_shelf_index;
                            if (curr_module !== new_curr_mod && new_curr_mod > -1) {
                                multi_shelf = "Y";
                            } else {
                                new_curr_mod = curr_module;
                            }
                            if (div_shelf_index !== new_shelf_index && new_shelf_index > -1) {
                                multi_shelf = "Y";
                            } else {
                                new_shelf_index = div_shelf_index;
                            }
                        } else {
                            no_shelf_cnt++;
                        }
                    }
                    if (no_shelf_cnt == item_details.length) {
                        multi_shelf = "Y";
                    }
                    if (multi_shelf == "N") {
                        if (div_object_type !== "PEGBOARD") {
                            /*ASA-1300 if (div_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                            //ASA-1125
                            valid = "Y";
                            single_drop = "Y";
                            } else {*/
                            var exist_items = 0;
                            for (const items of g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[valid_shelf_index].ItemInfo) {
                                var exists = "N";
                                for (const objects of item_details) {
                                    if (objects.ObjID == items.ObjID) {
                                        exists = "Y";
                                        break;
                                    }
                                }
                                if (exists == "N") {
                                    exist_items = exist_items + items.W;
                                }
                                i++;
                            }
                            if (total_width > g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[valid_shelf_index].W - exist_items && !(g_overhung_shelf_active == "Y" && (div_object_type == "SHELF" || div_object_type == "HANGINGBAR"))) {
                                valid = "N";
                            } else if (total_width <= g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[valid_shelf_index].W - exist_items) {
                                single_drop = "Y";
                            }
                            //}
                        } else {
                            valid = "Y";
                            single_drop = "Y";
                        }
                    } else {
                        var i = 0;
                        for (const objects of item_details) {
                            var act_x = p_final_x + objects.XDistance;
                            var act_y = p_final_y + objects.YDistance;
                            var shelfs = g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                            var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(act_x, act_y, "Y", objects.MIndex, objects.SIndex, shelfs, p_pog_index);
                            var [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found_same] = get_div_shelf_index(act_x, act_y, curr_module, item_inside_world, p_pog_index, objects, true); //ASA-1592
                            if (typeof g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index] !== "undefined") {
                                if ((act_x + objects.W / 2 > g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].X + g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].W / 2 || act_x - objects.W / 2 < g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].W / 2) && !(g_overhung_shelf_active == "Y" && (div_object_type == "SHELF" || div_object_type == "HANGINGBAR"))) {
                                    valid = "N";
                                    break;
                                }
                            } else {
                                valid = "N";
                                break;
                            }
                            i = i + 1;
                        }
                    }
                } else if (nvl(div_object_type) !== 0 && div_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                    //AS-1300
                    //ASA-1405 Issue 1
                    valid = "Y";
                    single_drop = "Y";
                    l_chest_ind = "Y";
                    l_chest_mod_ind = curr_module;
                    l_chest_shelf_ind = div_shelf_index;
                } else if (currCombinationIndex !== -1) {
                    //Regression Issue 2 20240628
                    valid = "Y";
                    single_drop = "Y";
                    l_chest_ind = "N";
                } else {
                    valid = "N"; //ASA-1405 Issue 1
                }
            }
        }

        if (g_present_canvas != g_start_canvas && g_multi_cnvs_drag_conf == "Y" && valid != "N") {
            for (const selObj of g_delete_details) {
                if (selObj.Object == "SHELF") {
                    for (const shelfItm of g_pog_json[g_start_canvas].ModuleInfo[selObj.MIndex].ShelfInfo[selObj.SIndex].ItemInfo) {
                        draggedItems.push(shelfItm.ItemID);
                    }
                } else if (selObj.Object == "ITEM") {
                    draggedItems.push(selObj.ItemID);
                }
            }
            draggedItems = [...new Set(draggedItems)];
            confirm = await doItemMoveConf(draggedItems, g_pog_json, g_present_canvas);
        } //ASA-1640

        //if shelf or item validations fails then revert all the objects back to its positions.
        if (valid == "N" || confirm == "N" /*ASA-1640*/) {
            if (valid == "N") {
                alert(get_message("POGCR_OUT_OF_FIXEL_ERR"));
            } //ASA-1640 #4
            // ASA-1548 - Start
            // if (g_compare_pog_flag == "Y") {
            //     var j = 0;
            //     g_world = remove_world;

            //     for (const objects of g_multi_drag_shelf_arr) {
            //         j++;
            //         var shelfInfo = g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
            //         var selectObjects = remove_world.getObjectById(objects.ObjID);
            //         [return_obj, newObjId] = await create_drag_objects(objects.MIndex, objects.SIndex, objects.IIndex, shelfInfo, shelfInfo.ItemInfo, g_show_live_image, "SHELF", selectObjects, g_start_canvas, g_present_canvas);
            //         remove_world.remove(selectObjects);
            //     }
            //     for (const objects of g_multi_drag_item_arr) {
            //         $.each(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo, function (m, items) {
            //             if (items.ObjID == objects.ObjID) {
            //                 edit_item_index = m;
            //                 return false;
            //             }
            //         });

            //         g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].X = objects.XAxis;
            //         g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].Y = objects.YAxis;
            //         var object = remove_world.getObjectById(objects.ObjID);

            //         if (g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.length > 0) {
            //             var [return_obj, objID] = await create_drag_objects(objects.MIndex, objects.SIndex, edit_item_index, shelfs, new_pogjson[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index], g_show_live_image, "ITEM", object, g_start_canvas, g_present_canvas);
            //             return_obj.position.x = objects.XAxis;
            //             return_obj.position.y = objects.YAxis;
            //            g_pog_json[p_pog_index].ModuleInfo[objcts.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].ObjID = return_obj.id;

            //             remove_world.remove(object);
            //             return_obj.updateMatrix();
            //         }
            //         j++;
            //     }
            //     //remove_renderer.render(remove_scene,remove_camera);
            //     render(g_start_canvas);
            //     render(g_present_canvas);
            //     g_world = new_world;
            // } else {
            // ASA-1548 - End
            var new_world, remove_world;
            new_world = g_scene_objects[g_present_canvas].scene.children[2];
            remove_world = g_scene_objects[g_start_canvas].scene.children[2];

            var j = 0;
            g_world = remove_world;

            for (const objects of g_multi_drag_item_arr) {
                $.each(g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo, function (m, items) {
                    if (items.ObjID == objects.ObjID) {
                        edit_item_index = m;
                        return false;
                    }
                });

                g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].X = objects.XAxis;
                g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].Y = objects.YAxis;
                var object = new_world.getObjectById(objects.ObjID);
                if (g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.length > 0) {
                    //ASA-1361 20240501 && typeof object !== "undefined"
                    var [return_obj, objID] = await create_drag_objects(objects.MIndex, objects.SIndex, edit_item_index, shelfs, g_pog_json[g_start_canvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index], g_show_live_image, "ITEM", object, g_start_canvas, g_present_canvas);
                    return_obj.position.x = objects.XAxis;
                    return_obj.position.y = objects.YAxis;
                    new_world.remove(object);
                    return_obj.updateMatrix();
                }
                j++;
            }

            var j = -1;
            for (const objects of g_multi_drag_shelf_arr) {
                j++;
                async function create_obj() {
                    var shelfInfo = g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                    shelfInfo.X = objects.XAxis;
                    shelfInfo.Y = objects.YAxis;
                    var selectObjects = new_world.getObjectById(objects.ObjID);
                    //    if (typeof selectObjects !== "undefined") {  //ASA-1361 20240501
                    [return_obj, newObjId] = await create_drag_objects(objects.MIndex, objects.SIndex, objects.IIndex, shelfInfo, shelfInfo.ItemInfo, g_show_live_image, "SHELF", selectObjects, g_start_canvas, g_present_canvas);
                    new_world.remove(selectObjects);
                    selectObjects = return_obj;
                    selectObjects.updateMatrix();
                    var k = j;
                    g_drag_items_arr = [];
                    var l = 0;
                    for (const items of shelfInfo.ItemInfo) {
                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);

                        if (typeof selectedObject !== "undefined") {
                            if (g_shelf_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
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
                            selectedObject.StartCanvas = g_start_canvas;
                            selectedObject.MIndex = objects.MIndex;
                            selectedObject.SIndex = objects.SIndex;
                            g_drag_items_arr.push(selectedObject);
                        }
                        l++;
                    }
                    var l_temp_arr = [];
                    if (g_drag_items_arr.length > 0) {
                        var k = 0;
                        for (const objects of g_drag_items_arr) {
                            k++;
                            new_world.remove(objects);
                            var [return_obj, newObjID1] = await create_drag_objects(objects.MIndex, objects.SIndex, objects.IIndex, objects.ShelfInfo, objects.ItemInfo, g_show_live_image, "ITEM", objects, g_start_canvas, g_present_canvas);
                            l_temp_arr.push(return_obj);
                        }
                        if (l_temp_arr.length > 0) {
                            g_drag_items_arr = [];
                            g_drag_items_arr = l_temp_arr;
                        }
                        set_inter_canvas_items(objects.XAxis, objects.YAxis, selectObjects, l_temp_arr, selectObjects.W, selectObjects.H, g_shelf_object_type, g_shelf_basket_spread, selectObjects.Rotation, selectObjects.ItemSlope, objects.SIndex, objects.MIndex, g_start_canvas, "Y");
                    }
                    //   }  //ASA-1361 20240501
                }
                await create_obj();
            }
            render(g_start_canvas);
            g_world = new_world;
            // } // ASA-1548
            if (l_shelf_details.length > 0) {
                for (const objects of l_shelf_details) {
                    g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].X = objects.XAxis;
                    g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Y = objects.YAxis;
                }
            }
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            cut_copy_arr1 = [];
            g_undo_details = [];
            g_mselect_drag = "N";
            g_multiselect = "N";
            g_ctrl_select = "N";
            g_undo_all_obj_arr = [];
            g_temp_cut_arr = [];
            g_intersected = [];
            g_select_zoom_arr = [];
            render(p_pog_index);
            render_animate_selected();
        } else {
            //if all the validation were successful then start process of placing items in new position.
            //here we find out if all the items go into single shelf or not. we dont check chest, when items are dragged to chest.
            //items may be outside chest but we need to auto place them.

            /*  if (item_details.length > 0 && l_shelf_details.length == 0) { //ASA-1496 issue 2 S
                   drag_direction = g_DragMouseEnd.x > g_DragMouseStart.x ? "F" : "B";
                   var i = 0;
                   var single_shelf = "Y";
   
                   if (l_chest_ind == 'N') { //ASA-1300
                       if (g_start_canvas == g_present_canvas) {
                           for (const objects of item_details) {
                               if (i == 0 && div_object_type == "PEGBOARD") {
                                   //ASA-1125
                                   var act_x = p_final_x + objects.XDistance + 0.01;
                               } else {
                                   var act_x = p_final_x + objects.XDistance;
                               }
                               if ((objects.ObjType == "PEGBOARD") || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                   //ASA-1125
                                   var act_y = p_final_y < 0 ? p_final_y + objects.YDistance : p_final_y - objects.YDistance;
                               } else {
                                   var act_y = p_final_y + objects.YDistance;
                               }
                               var shelfs = g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0] : g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                               var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(act_x, act_y, "Y", objects.MIndex, objects.SIndex, shelfs, p_pog_index);
                               var [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found_same] = get_div_shelf_index(act_x, act_y, curr_module, item_inside_world, p_pog_index);
                               if (curr_module !== objects.MIndex || objects.SIndex !== div_shelf_index) {
                                   single_shelf = "N";
                                   break;
                               }
                               i = i + 1;
                           }
                       } else {
                           single_shelf = "N";
                       }
                   }
                   var spread_product = g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[item_details[0].MIndex].Carpark[0].SpreadItem : g_pog_json[startDragCanvas].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].SpreadItem;
                   //if new object type is CHEST then just pass validation.
                   if (l_chest_ind == "Y" && div_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                       //ASA-1125
                       var new_object_type = div_object_type;
                   } else if (single_shelf == "Y" && div_object_type !== "PEGBOARD") {
                       var new_items = g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[item_details[0].MIndex].Carpark[0].ItemInfo : g_pog_json[startDragCanvas].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].ItemInfo;
                       for (const objects of item_details) {
                           $.each(new_items, function (j, items) {
                               if (items.ObjID == objects.ObjID) {
                                   g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[item_details[0].MIndex].Carpark[0].ItemInfo.splice(j, 1) : g_pog_json[startDragCanvas].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].ItemInfo.splice(j, 1);
                                   return false;
                               }
                           });
                       }
                       if (spread_product == "R") {
                           var act_x = p_final_x + item_details[item_details.length - 1].XDistance;
                       } else {
                           var act_x = p_final_x + item_details[0].XDistance;
                       }
                       var new_index = -1;
                       var min_val = spread_product == "R" ? 1000 : -1000;
                       $.each(new_items, function (j, items) {
                           if (spread_product == "R") {
                               if (items.X > act_x) {
                                   if (items.X < min_val) {
                                       new_index = j > 0 ? j - 1 : 0;
                                       min_val = items.X;
                                   }
                               }
                           } else {
                               if (items.X < act_x) {
                                   if (items.X > min_val) {
                                       new_index = j;
                                       min_val = items.X;
                                   }
                               }
                           }
                       });
   
                       if (new_index !== -1) {
                           for (const objects of item_details) {
                               var act_x = p_final_x + objects.XDistance;
                               if ((objects.ObjType == "PEGBOARD") || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                   //ASA-1125
                                   var act_y = p_final_y < 0 ? p_final_y + objects.YDistance : p_final_y - objects.YDistance;
                               } else {
                                   var act_y = p_final_y + objects.YDistance;
                               }
                               objects.ItemObj[0].X = act_x;
                               objects.ItemObj[0].Y = act_y;
                               g_pog_json[p_pog_index].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].ItemInfo.push(objects.ItemObj[0]);
                           }
                           var upd_item_index = -1;
                           if (spread_product == "R") {
                               if (drag_direction == "F") {
                                   upd_item_index = new_index - 1;
                               } else {
                                   upd_item_index = new_index;
                               }
                           } else {
                               if (drag_direction == "B") {
                                   upd_item_index = new_index + 1;
                               } else {
                                   upd_item_index = new_index + 1;
                               }
                           }
                           get_update_index = "N";
                           var new_shelf_index = item_details[0].SIndex;
                           var new_module_index = item_details[0].MIndex;
                           var new_object_type = g_pog_json[p_pog_index].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].ObjType;
                           var l_edit_ind = "N";
                           var bottom_item_flag = "N";
                           var bottom_item_ind = -1;
                       } 
                       else {
                           for (const objects of item_details) {
                               g_pog_json[startDragCanvas].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].ItemInfo.push(objects.ItemObj[0]);
                           }
                           get_update_index = "N";
                           var upd_item_index = 0;
                           var new_shelf_index = item_details[0].SIndex;
                           var new_module_index = item_details[0].MIndex;
                           var new_object_type = g_pog_json[p_pog_index].ModuleInfo[item_details[0].MIndex].ShelfInfo[item_details[0].SIndex].ObjType;
                           var l_edit_ind = "N";
                           var bottom_item_flag = "N";
                           var bottom_item_ind = -1;
                      }
                   } else {
                       var new_object_type = div_object_type;
                   }
               }
               var sorto = {
                   X: "asc",
                   Y: "asc",
               };
               item_details.keySort(sorto); */ //ASA-1496 issue 2 E

            if (item_details.length > 0) {
                drag_direction = g_DragMouseEnd.x > g_DragMouseStart.x ? "F" : "B";
                var i = 0;
                var itemOnSameCombine = "Y"; //ASA-1519 Issue 2
                var prevItemCombIndex = -1; //ASA-1519 Issue 2
                for (const objects of item_details) {
                    drag_item_arr.push(objects.ObjID);
                    //ASA-1569 issue 1
                    //for old combine undo
                    if (div_shelf_index !== -1) {
                        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(startDragCanvas, g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf); //ASA-1685 Issue 1
                        if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                            currCombination = g_combinedShelfs[currCombinationIndex];
                            if (currCombination.length > 1 && old_combination != currCombinationIndex) {
                                old_combination = currCombinationIndex;
                                for (obj of currCombination) {
                                    old_shelf_combine_undo.push(JSON.parse(JSON.stringify(g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex])));
                                }
                            }
                            //ASA-1519 Issue 2
                            if (prevItemCombIndex == -1) {
                                prevItemCombIndex = currCombinationIndex;
                            } else if (prevItemCombIndex !== currCombinationIndex) {
                                itemOnSameCombine = "N";
                            }
                        } else {
                            if (undo_old_mod_index != objects.MIndex && undo_old_fixel_index != objects.SIndex) {
                                undo_old_mod_index = objects.MIndex;
                                undo_old_fixel_index = objects.SIndex;
                                old_shelf_combine_undo.push(JSON.parse(JSON.stringify(g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex]))); //ASA-1685 Issue 1
                            }
                        }
                    }
                    if (get_update_index == "Y") {
                        if (i == 0 && (new_object_type == "PEGBOARD" || (new_object_type == "CHEST" && objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y"))) {
                            //ASA-1125
                            var act_x = p_final_x + objects.XDistance + 0.01;
                        } else {
                            var act_x = p_final_x + objects.XDistance;
                        }
                        // if ((new_object_type == "PEGBOARD" && (objects.ObjType == "PEGBOARD" || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y"))) || (new_object_type == "CHEST" && objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {          //ASA-1592
                        if (objects.ObjType == "PEGBOARD" || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y") || (new_object_type == "CHEST" && objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                            //ASA-1592
                            //ASA-1125
                            var act_y = p_final_y - objects.YDistance; //p_final_y < 0 ? p_final_y + objects.YDistance : p_final_y - objects.YDistance;    //ASA-1592
                        } else {
                            var act_y = p_final_y + objects.YDistance;
                        }

                        if (g_delete_details.multi_carpark_ind == "Y") {
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[objects.IIndex].X = act_x;
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[objects.IIndex].Y = act_y;
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo[objects.IIndex].DropY = act_y;
                        } else {
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex].X = act_x;
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex].Y = act_y;
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex].DropY = act_y;
                        }
                    }
                }
                var i = 0;
                var l_chest_outside = "N";
                var l_prev_x = -1;
                for (const objects of item_details) {
                    var item_width_arr = [],
                        item_height_arr = [],
                        item_depth_arr = [],
                        item_index_arr = [];
                    //here we will get the x axis of the items based on its X and Y Distance from the mouse pointer
                    if (i == 0 && new_object_type == "PEGBOARD") {
                        var act_x = p_final_x + objects.XDistance + 0.01;
                    } else {
                        var act_x = p_final_x + objects.XDistance;
                    }
                    // if ((new_object_type == "PEGBOARD" && (objects.ObjType == "PEGBOARD" || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y"))) || (new_object_type == "CHEST" && objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y") || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {        //ASA-1592
                    if (objects.ObjType == "PEGBOARD" || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y") || (new_object_type == "CHEST" && objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y") || (objects.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                        //ASA-1592
                        //ASA-1125
                        var act_y = p_final_y - objects.YDistance; //p_final_y < 0 ? p_final_y + objects.YDistance : p_final_y - objects.YDistance;
                    } else {
                        var act_y = p_final_y + objects.YDistance;
                    }
                    var shelfs = g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0] : g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                    if (l_chest_ind == "N") {
                        var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(act_x, act_y, "Y", objects.MIndex, objects.SIndex, shelfs, p_pog_index);
                        var [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found_same] = get_div_shelf_index(act_x, act_y, curr_module, item_inside_world, p_pog_index, objects, true); //ASA-1592
                    } else {
                        var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(p_final_x, p_final_y, "N", -1, -1, [], p_pog_index);
                        var [item_inside_world, curr_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found_same] = get_div_shelf_index(p_final_x, p_final_y, curr_module, item_inside_world, p_pog_index);
                    }

                    if (div_shelf_index == -1 && single_drop == "Y" && valid_shelf_index !== -1) {
                        //ASA-1496 TASK 6
                        div_shelf_index = valid_shelf_index;
                        div_object_type = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ObjType;
                        shelfY = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].Y;
                        shelfHeight = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].H;
                        shelf_found_same = "Y";
                    }

                    if (div_shelf_index !== -1) {
                        var ItemInfo = objects.ItemObj[0];
                        var old_ItemInfo = JSON.parse(JSON.stringify(objects.ItemObj[0]));
                        var item_fixed = objects.ItemObj[0].Fixed;
                        var spread_product = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].SpreadItem;
                        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index];

                        if (div_object_type == "PEGBOARD" || spread_product == "M") {
                            //ASA-1125
                            ItemInfo.X = act_x;
                            ItemInfo.Y = act_y;
                            ItemInfo.DropY = act_y;
                        }

                        //this is the logic for chest where if starting items is out if the chest. then we update the shelf start + width / 2 as the start
                        //position of the item so that it can be autoplaced in available space.
                        if (div_object_type == "CHEST" && g_chest_as_pegboard == "Y" && i == 0 && shelfdtl.AutoPlacing == "Y") {
                            //ASA-1300
                            if (act_x - ItemInfo.W / 2 < shelfdtl.X - shelfdtl.W / 2) {
                                l_chest_outside = "Y";
                                ItemInfo.X = shelfdtl.X - shelfdtl.W / 2 + ItemInfo.W / 2;
                                ItemInfo.Y = act_y;
                                ItemInfo.DropY = act_y;
                                l_prev_x = ItemInfo.X + ItemInfo.W / 2;
                            } else {
                                ItemInfo.X = act_x;
                                ItemInfo.Y = act_y;
                                ItemInfo.DropY = act_y;
                                if (ItemInfo.MHorizCrushed == "N") {
                                    //Start ASA-1343 issue 1
                                    ItemInfo.W = ItemInfo.RW;
                                    ItemInfo.CrushHoriz = 0;
                                }
                                if (ItemInfo.MVertCrushed == "N") {
                                    ItemInfo.H = ItemInfo.RH;
                                    ItemInfo.CrushVert = 0;
                                }
                                if (ItemInfo.MDepthCrushed == "N") {
                                    ItemInfo.D = ItemInfo.RD;
                                    ItemInfo.CrushD = 0;
                                } //End ASA-1343 issue 1
                            }
                        } else if (l_chest_outside == "Y") {
                            ItemInfo.X = l_prev_x + ItemInfo.W / 2;
                            ItemInfo.Y = act_y;
                            ItemInfo.DropY = act_y;
                            l_prev_x = ItemInfo.X + ItemInfo.W / 2;
                        } else {
                            ItemInfo.X = act_x;
                            ItemInfo.Y = act_y;
                            ItemInfo.DropY = act_y;
                            if (ItemInfo.MHorizCrushed == "N") {
                                //Start ASA-1343 issue 1
                                ItemInfo.W = ItemInfo.RW;
                                ItemInfo.CrushHoriz = 0;
                            }
                            if (ItemInfo.MVertCrushed == "N") {
                                ItemInfo.H = ItemInfo.RH;
                                ItemInfo.CrushVert = 0;
                            }
                            if (ItemInfo.MDepthCrushed == "N") {
                                ItemInfo.D = ItemInfo.RD;
                                ItemInfo.CrushD = 0;
                            } //End ASA-1343 issue 1
                        }
                        var old_shelf = g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                        var reinsert = "Y";
                        //if the dragged item is a top item for another item. then reset the tags for bottom and top item identifier and assign new tags to identify below and top item.
                        var edit_item_index = -1;
                        $.each(g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo, function (j, items) {
                            if (items.ObjID == objects.ObjID) {
                                edit_item_index = j;
                                return false;
                            }
                        });
                        //we set W back to RW because when item has more than one horiz facing. there will be a gap between items facing. so width will be increased.
                        // but this is the gap between each item after place items. so we no need this when validating.
                        if (g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].SpreadItem == "F") {
                            ItemInfo.W = ItemInfo.RW;
                        }
                        if (i == 0) {
                            //ASA-1258  get_update_index == "Y"
                            //ASA-1496 issue 2 S
                            var sorto = {
                                X: "asc",
                                Y: "asc",
                            };
                            g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo.keySort(sorto);
                            //ASA-1496 issue 2 E
                            var [upd_item_index, new_shelf_index, new_module_index, new_object_type, l_edit_ind, ItemInfo, div_index, bottom_item_flag, bottom_item_ind] = await update_item_loc(curr_module, objects.MIndex, objects.SIndex, div_shelf_index, div_object_type, edit_item_index, act_x, shelf_found_same, ItemInfo, shelfY, shelfHeight, act_y, g_pog_json, drag_direction, p_pog_index, startDragCanvas); //Task_27812 issue 13
                        }
                        if (typeof upd_item_index == "undefined") {
                            for (const objects of item_details) {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex].X = objects.X;
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex].Y = objects.Y;
                            }
                            valid = "N";
                            reset = "N";
                            item_details[i].Valid = "N";
                            break;
                        }

                        if (new_object_type !== "PEGBOARD" && ((new_object_type == "CHEST" && g_chest_as_pegboard == "N") || new_object_type !== "CHEST")) {
                            //ASA-1125
                            var [xaxis, yaxis] = get_item_xy(g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index], ItemInfo, ItemInfo.W, ItemInfo.H, g_pog_json);
                        } else {
                            // for pegboard we consider this items as fresh item and try to place in available location.
                            yaxis = act_y;
                            if ((g_pegbrd_auto_placing == "Y" && new_object_type == "PEGBOARD") || (new_object_type !== "PEGBOARD" && new_object_type !== "CHEST")) {
                                //ASA-1125
                                ItemInfo["Edited"] = "Y";
                            } else {
                                ItemInfo["Edited"] = "N";
                            }
                            ItemInfo["FromProductList"] = "Y";
                            //for chest we still try to place on the location where it is dropped.
                            if (new_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                                ItemInfo["FromProductList"] = "N";
                            }
                            ItemInfo["Exists"] = "N";
                        }
                        var shelf_top = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].H / 2;
                        if (new_object_type == "SHELF" || new_object_type == "PALLET") {
                            //if item was not already a top bottom object and we are trying to place on top of a existing item. then we set its values.
                            if (typeof ItemInfo["BottomObjID"] == "undefined" || ItemInfo["BottomObjID"] == "") {
                                if (bottom_item_flag == "Y") {
                                    g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].BottomObjID = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].ObjID;
                                    g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].TopObjID = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].ObjID;

                                    ItemInfo["TopItem"] = "Y";
                                    ItemInfo["Edited"] = "Y";
                                    ItemInfo["BottomObjID"] = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[div_shelf_index].ItemInfo[bottom_item_ind].ObjID;
                                    g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[bottom_item_ind].BelowItem = "Y";
                                    yaxis = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[bottom_item_ind].Y + g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[bottom_item_ind].H / 2 + ItemInfo["H"] / 2;
                                } else {
                                    ItemInfo["TopItem"] = "N";
                                }
                                ItemInfo.Y = yaxis;
                            } else {
                                if (typeof ItemInfo["BottomObjID"] !== "undefined" && ItemInfo["BottomObjID"] !== "") {
                                    var top_found = "N";

                                    var item_info = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo;
                                    for (const items of item_info) {
                                        if (items.ObjID == ItemInfo.BottomObjID) {
                                            ItemInfo.Y = items.Y + items.H / 2 + ItemInfo["H"] / 2;
                                            top_found = "Y";
                                            break;
                                        }
                                    }
                                    if (top_found == "N") {
                                        ItemInfo["BottomObjID"] = "";
                                        ItemInfo["Y"] = yaxis;
                                        var returnval = reset_bottom_item(objects.MIndex, objects.SIndex, edit_item_index, curr_module, div_shelf_index, -1, startDragCanvas);
                                    }
                                }
                            }
                        } else if (g_delete_details.multi_carpark_ind == "N") {
                            var returnval = reset_bottom_item(objects.MIndex, objects.SIndex, edit_item_index, curr_module, div_shelf_index, -1, startDragCanvas);
                        }
                        //for new combine undo //ASA -1443 -S
                        //we check if the dropping shelf is a combine shelf or not.
                        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].Shelf);
                        if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                            currCombination = g_combinedShelfs[currCombinationIndex];
                            if (currCombination.length > 1 && new_combination != currCombinationIndex) {
                                new_combination = currCombinationIndex;
                                for (obj of currCombination) {
                                    new_shelf_combine_undo.push(JSON.parse(JSON.stringify(g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex])));
                                }
                            }
                        }
                        //ASA-1443 issue 1 S
                        else {
                            if (undo_new_mod_index != new_module_index && undo_new_fixel_index != new_shelf_index) {
                                undo_new_mod_index = new_module_index;
                                undo_new_fixel_index = new_shelf_index;
                                new_shelf_combine_undo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index])));
                            }
                        }
                        //ASA-1443 issue 1 E

                        //ASA-1569 issue 1, commented because undo was getting items with new updated X
                        /*
                        //for old combine undo
                        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf);
                        if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                            currCombination = g_combinedShelfs[currCombinationIndex];
                            if (currCombination.length > 1 && old_combination != currCombinationIndex) {
                                old_combination = currCombinationIndex;
                                for (obj of currCombination) {
                                    old_shelf_combine_undo.push(JSON.parse(JSON.stringify(g_pog_json[obj.PIndex].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex])));
                                }
                            }

                        }//ASA-1443 issue 1 S
                        else {
                            if (undo_old_mod_index != objects.MIndex && undo_old_fixel_index != objects.SIndex) {
                                undo_old_mod_index = objects.MIndex;
                                undo_old_fixel_index = objects.SIndex;
                                old_shelf_combine_undo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex])));
                            }

                        }
                        //ASA-1443 issue 1 E
                        */
                        var edit_item_index = -1;
                        if (g_delete_details.multi_carpark_ind == "Y") {
                            $.each(g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo, function (j, items) {
                                if (items.ObjID == objects.ObjID) {
                                    edit_item_index = j;
                                    return false;
                                }
                            });
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo.splice(edit_item_index, 1);
                        } else {
                            $.each(g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo, function (j, items) {
                                if (items.ObjID == objects.ObjID) {
                                    edit_item_index = j;
                                    return false;
                                }
                            });
                            if (reinsert == "Y") {
                                if (edit_item_index == -1) {
                                    //ASA-1569 added beacuse in combination if first shelf all items gone then 2 combination item comes to first shelf and its not found in current so we need to find in all combination to remove the item info from json
                                    var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf);
                                    if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                        for (var old_Comb of g_combinedShelfs[currCombinationIndex]) {
                                            $.each(g_pog_json[startDragCanvas].ModuleInfo[old_Comb.MIndex].ShelfInfo[old_Comb.SIndex].ItemInfo, function (k, combineitems) {
                                                if (combineitems.ObjID == objects.ObjID) {
                                                    edit_item_index = j;
                                                    g_pog_json[startDragCanvas].ModuleInfo[old_Comb.MIndex].ShelfInfo[old_Comb.SIndex].ItemInfo.splice(k, 1);
                                                    return false;
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.splice(edit_item_index, 1);
                                }
                            }
                        }
                        //}
                        //only first item is found the start location. then we keep on adding the next location.
                        if (reinsert == "Y") {
                            if (i > 0) {
                                /*if (spread_product == "R") {
                                if (upd_item_index > 0) {
                                upd_item_index = upd_item_index - 1;
                                } else {
                                upd_item_index = 0;
                                }
                                } else {
                                upd_item_index = upd_item_index + 1;
                                }*/
                                upd_item_index = upd_item_index + 1;
                            }
                            var l_edited_item_index = set_item_after_drag(new_object_type, spread_product, new_module_index, new_shelf_index, upd_item_index, ItemInfo, p_pog_index);
                        } else {
                            if (((new_object_type == "CHEST" && g_chest_as_pegboard == "Y") || new_object_type == "PEGBOARD") && i == 0) {
                                var item_dtl = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo;
                                for (obj of item_dtl) {
                                    obj.ItemTop = obj.Y + obj.H / 2;
                                }
                                var sorto = {
                                    ItemTop: "desc",
                                    X: "asc",
                                };
                                item_dtl.keySort(sorto);
                            }

                            $.each(g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo, function (j, items) {
                                if (items.ObjID == objects.ObjID) {
                                    l_edited_item_index = j;
                                    return false;
                                }
                            });
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index] = ItemInfo;
                        }
                        //var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];// Start Task_27812 issue 13 20240528
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
                                await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, act_x, 'Y', 'N', -1, l_edited_item_index, l_detail_arr); //ASA-1329
                                new_module_index = l_detail_arr[0].MIndex; //ASA 1329
                                new_shelf_index = l_detail_arr[0].SIndex; //ASA 1329
                                l_edited_item_index = l_detail_arr[0].IIndex; //ASA 1329
                            }
                        }
                        if ((shelfdtl.ObjType == "SHELF" || shelfdtl.ObjType == "HANGINGBAR") && shelfdtl.Combine !== "N") {//Task_27812 issue 13 20240528
                            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfdtl.Shelf);
                            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, act_x, 'Y', 'N', -1, objects.IIndex, []);
                                await reset_auto_crush(objects.MIndex, objects.SIndex, objects.IIndex, p_pog_index, objects.MIndex, objects.SIndex);
                            }
                        }*/
                        //if items are going to be placed in combine shelf. then the items could be reshuffled based on the spread product.
                        //so the items could be changed to other shelf. so we do that and get new module and shelf index.
                        //ASA-1519 Issue 2, this variable is created to handle the case if multiple dragged items are from same combination
                        // Example : If we drag 2 items from same combination, then in the below function when we recreate the old combination the 2nd item dragged has not been removed
                        // resulting in incorrect X for old combination for the next loop
                        var resetOldShelf = (itemOnSameCombine = "Y" && i == item_details.length - 1 ? "Y" : "N");
                        var [new_module_index, new_shelf_index, l_edited_item_index] = await set_combine_items_after_drag(new_module_index, new_shelf_index, p_pog_index, l_edited_item_index, objects.MIndex, objects.SIndex, objects.IIndex, startDragCanvas, act_x, resetOldShelf); // End Task_27812 issue 6 20240528

                        g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Exists = "N";
                        g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Dragged = "N";
                        if (!(new_object_type == "CHEST" && g_chest_as_pegboard == "Y") || new_object_type !== "PEGBOARD") {
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Edited = "N";
                        }
                        if (spread_product == "F" || (ItemInfo["CrushHoriz"] > 0 && !(new_object_type == "CHEST" && g_chest_as_pegboard == "Y"))) {
                            //ASA-1300 should not reset width when manual crush applied.
                            $.each(g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo, function (j, items) {
                                items.W = items.RW;
                            });
                        }
                        var return_val = "N";
                        item_width_arr.push(wpdSetFixed(ItemInfo["W"])); //ASA-1087, toFixed(4)
                        item_height_arr.push(wpdSetFixed(ItemInfo["H"])); //ASA-1087, toFixed(4)
                        item_depth_arr.push(wpdSetFixed(ItemInfo["D"])); //ASA-1087, toFixed(4)
                        item_index_arr.push(l_edited_item_index);
                        var items = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];
                        var spread_gap = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].HorizGap;

                        if (typeof ItemInfo["BottomObjID"] == "undefined" || ItemInfo["BottomObjID"] == "") {
                            if (spread_product !== "R") {
                                //Regression issue 11
                                // var new_x = get_item_xaxis(items.W, items.H, items.D, new_object_type, act_x, spread_gap, spread_product == "M" ? "L" : spread_product, spread_gap, new_module_index, new_shelf_index, l_edited_item_index, "Y", g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.length, "N", p_pog_index); //ASA-1989
                                var new_x = get_item_xaxis(items.W, items.H, items.D, new_object_type, act_x, spread_gap, spread_product, spread_gap, new_module_index, new_shelf_index, l_edited_item_index, "Y", g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.length, "N", p_pog_index); //ASA-1989 Spread product condition fixed
                                /*if (new_object_type == "CHEST" && g_chest_as_pegboard == "Y" && i > 0 && !(new_object_type == "CHEST" && objects.ObjType == "CHEST")) {
                                new_x = new_x - 0.02;
                                }*/
                                g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].X = new_x;
                            }
                            var items = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];

                            if ((typeof ItemInfo["BottomObjID"] == "undefined" || ItemInfo["BottomObjID"] == "") && (typeof ItemInfo["TopObjID"] == "undefined" || ItemInfo["TopObjID"] == "")) {
                                if (g_max_facing_enabled == "Y") {
                                    reset_auto_crush(new_module_index, new_shelf_index, l_edited_item_index, p_pog_index, new_module_index, new_shelf_index, p_pog_index); //ASA-1343 issue 1
                                }
                                // await set_auto_facings(new_module_index, new_shelf_index, l_edited_item_index, items, "B", "I", "D", p_pog_index); //ASA-1476 ISSUE 4
                            }
                            if (!((new_object_type == "CHEST" && g_chest_as_pegboard == "Y") || new_object_type == "PEGBOARD")) {
                                //getting latest height and width and validate the item height in the present shelf.
                                return_val = update_validate_item_height(items, new_module_index, new_shelf_index, l_edited_item_index, act_x, new_object_type, new_x, p_pog_index);
                            }
                            //ASA-1476 ISSUE 4
                            if ((typeof ItemInfo["BottomObjID"] == "undefined" || ItemInfo["BottomObjID"] == "") && (typeof ItemInfo["TopObjID"] == "undefined" || ItemInfo["TopObjID"] == "")) {
                                await set_auto_facings(new_module_index, new_shelf_index, l_edited_item_index, items, "B", "I", "D", p_pog_index);
                            }
                        }
                        if (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ObjType == "PEGBOARD") {
                            // || (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                            items.Exists = "N";
                            items.X = act_x;
                            items.Y = act_y;
                            //items.FromProductList = "Y";
                        } else if (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ObjType == "PALLET") {
                            items.Exists = "N";
                            items.Dragged = "N";
                        } else if (items.Fixed !== "N") {
                            items.X = act_x;
                        }
                        if ((typeof ItemInfo["BottomObjID"] == "undefined" || ItemInfo["BottomObjID"] == "") && (typeof ItemInfo["TopObjID"] == "undefined" || ItemInfo["TopObjID"] == "") && g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ObjType !== "PEGBOARD") {
                            if (!(g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                var items = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];
                                var [xaxis, yaxis] = get_item_xy(g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index], items, items.W, items.H, p_pog_index);
                                g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Y = yaxis;
                            }
                        }
                        //validate the items for the calculated position. if pass then mark it for further processing.
                        if ((return_val == "F" || return_val == "N") && validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, new_object_type, new_module_index, new_shelf_index, l_edited_item_index, l_edit_ind, ItemInfo["CrushHoriz"], ItemInfo["CrushVert"], ItemInfo["CrushD"], act_x, item_fixed, "N", "Y", bottom_item_flag, "N", drag_item_arr, "Y", "Y", "Y", p_pog_index, "N", "Y")) {
                            /*if (new_object_type == "CHEST" && g_chest_as_pegboard == "Y") {
                            var shelfs = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index];
                            var items = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index];
                            var min_x_arr = [];
                            var min_idx_arr = [];
                            var n = 0;
                            for (obj of shelfs.ItemInfo) {
                            if (obj.X < items.X && obj.Y + obj.H / 2 == items.Y + items.H / 2) {
                            min_x_arr.push(items.X - (items.W / 2) - obj.X + (obj.W / 2));
                            min_idx_arr.push(n);
                            }
                            n++;
                            }
                            min_dis = Math.min.apply(Math, min_x_arr);
                            var index = -1;

                            if (min_dis !== 0) {
                            var index = min_x_arr.findIndex(function (number) {
                            return number == min_dis;
                            });
                            index = min_idx_arr[index];
                            if (index > -1) {
                            items.X = g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[index].X + (g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[index].W / 2) + (items.W / 2);
                            }
                            } else {
                            if (shelfs.X - (shelfs.W / 2) < items.X - (items.W / 2)) {
                            items.X = items.X - 0.02;
                            }
                            }

                            }*/
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Exists = "E";
                            item_details[i].Valid = "Y";
                            item_details[i].newItemIndex = l_edited_item_index; //yrc
                            item_details[i].newModIndex = new_module_index;
                            item_details[i].newShelfIndex = new_shelf_index;
                            shelf_info = {};
                            shelf_info["OldModuleIndex"] = objects.MIndex;
                            shelf_info["OldShelfIndex"] = objects.SIndex;
                            shelf_info["OldItemIndex"] = objects.IIndex;
                            shelf_info["OldObjectType"] = objects.ObjType;
                            shelf_info["SIndex"] = new_shelf_index;
                            shelf_info["MIndex"] = new_module_index;
                            shelf_info["ObjType"] = new_object_type;
                            shelf_info["IIndex"] = l_edited_item_index;
                            shelf_info["ObjID"] = objects.ObjID;
                            shelf_info["OldInfo"] = old_ItemInfo;
                            shelf_info["IsDivider"] = objects.IsDivider;
                            shelf_info["XAxis"] = objects.XAxis;
                            shelf_info["YAxis"] = objects.YAxis;
                            shelf_info["ZAxis"] = objects.ZAxis;
                            shelf_info["OldItemX"] = objects.OldItemX;
                            shelf_info["OldItemY"] = objects.OldItemY;
                            shelf_list.push(shelf_info);
                        } else {
                            //if even one item fails the validation. mark this item failed and break the loop to revert them to old location.
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].X = objects.OldItemX;
                            g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo[l_edited_item_index].Y = objects.OldItemY;
                            old_ItemInfo.X = objects.OldItemX;
                            old_ItemInfo.Y = objects.OldItemY;
                            if (l_edited_item_index == 0) {
                                g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.splice(l_edited_item_index, l_edited_item_index + 1);
                            } else {
                                g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.splice(l_edited_item_index, 1);
                            }

                            if (spread_product == "R") {
                                g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo.splice(objects.IIndex, 0, old_ItemInfo) : g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.splice(objects.IIndex, 0, old_ItemInfo);
                            } else {
                                g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo.splice(objects.IIndex, 0, old_ItemInfo) : g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.splice(objects.IIndex, 0, old_ItemInfo);
                            }
                            k = 0;
                            for (const new_objects of item_details) {
                                if (k > i) {
                                    if (g_delete_details.multi_carpark_ind == "Y") {
                                        $.each(g_pog_json[startDragCanvas].ModuleInfo[new_objects.MIndex].Carpark[0].ItemInfo, function (j, items) {
                                            if (items.ObjID == new_objects.ObjID) {
                                                l_edited_item_index = j;
                                                return false;
                                            }
                                        });

                                        g_pog_json[startDragCanvas].ModuleInfo[new_objects.MIndex].Carpark[0].ItemInfo[l_edited_item_index].X = new_objects.XAxis;
                                        g_pog_json[startDragCanvas].ModuleInfo[new_objects.MIndex].Carpark[0].ItemInfo[l_edited_item_index].Y = new_objects.YAxis;
                                    } else {
                                        $.each(g_pog_json[startDragCanvas].ModuleInfo[new_objects.MIndex].ShelfInfo[new_objects.SIndex].ItemInfo, function (j, items) {
                                            if (items.ObjID == new_objects.ObjID) {
                                                l_edited_item_index = j;
                                                return false;
                                            }
                                        });
                                        g_pog_json[startDragCanvas].ModuleInfo[new_objects.MIndex].ShelfInfo[new_objects.SIndex].ItemInfo[l_edited_item_index].X = new_objects.XAxis;
                                        g_pog_json[startDragCanvas].ModuleInfo[new_objects.MIndex].ShelfInfo[new_objects.SIndex].ItemInfo[l_edited_item_index].Y = new_objects.YAxis;
                                    }
                                }
                                k = k + 1;
                            }
                            var item_arr = g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].Carpark[0].ItemInfo : g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
                            var sorto = {
                                X: "asc",
                            };

                            item_arr.keySort(sorto);

                            valid = "N";
                            item_details[i].Valid = "N";
                            break;
                        }
                    }
                    i = i + 1;
                }
            }
            if (shelf_list.length > 0) {
                new_shelf = shelf_list.filter(function (a) {
                    var key = a.SIndex + "|" + a.MIndex;
                    if (!this[key]) {
                        this[key] = true;
                        return true;
                    }
                }, Object.create(null));
                olf_shelf = shelf_list.filter(function (a) {
                    var key = a.OldShelfIndex + "|" + a.OldModuleIndex;
                    if (!this[key]) {
                        this[key] = true;
                        return true;
                    }
                }, Object.create(null));
            }
            //if all the items validation is passed. then proceed recreating all the new shelfs.
            if (valid == "Y" && (item_details.length > 0 || l_shelf_details.length > 0) && cnfrm == "Y") {
                i = 0;
                g_undo_details = [];
                g_undo_obj_arr = [];
                g_undo_supp_obj_arr = [];

                //identify if any change in POG
                g_pog_edited_ind = "Y";
                var i = 0;
                for (const objects of l_shelf_details) {
                    var act_x = p_final_x + objects.XDistance;
                    var act_y = p_final_y + objects.YDistance;
                    var edit_shelf_index = -1;
                    var j = 0;
                    for (const shelfs of g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo) {
                        if (shelfs.SObjID == objects.ObjID) {
                            edit_shelf_index = j;
                            break; //return false;
                        }
                        j++;
                    }
                    var comb_shelf_ind = "N";
                    //ASA-2023 task -2 
                    if (g_shelf_object_type !== "TEXTBOX") {
                        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf);
                    }
                    var currCombinationIndex = -1, currShelfCombIndx = -1;
                    try {
                        if (g_pog_json && g_pog_json[p_pog_index] && g_pog_json[p_pog_index].ModuleInfo && g_pog_json[p_pog_index].ModuleInfo[objects.MIndex] && g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo && typeof g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex] !== "undefined") {
                            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf);
                        } else {
                            logDebug("Warning: missing ShelfInfo for getCombinationShelf (multi_drag_setup)", "W");
                        }
                    } catch (err) {
                        logDebug("Error calling getCombinationShelf: " + err, "E");
                    }
                    if (currCombinationIndex !== -1) {
                        comb_shelf_ind = "Y";
                    }

                    // g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Combine = "N";

                    if (g_pog_json && g_pog_json[p_pog_index] &&
                        g_pog_json[p_pog_index].ModuleInfo &&
                        g_pog_json[p_pog_index].ModuleInfo[objects.MIndex] &&
                        g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo &&
                        typeof g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex] !== "undefined") {
                        g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Combine = "N";
                    }


                    if (g_shelf_object_type !== "TEXTBOX") {
                        await generateCombinedShelfs(p_pog_index, objects.MIndex, objects.SIndex, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters,ASA-1353
                    }

                    // await generateCombinedShelfs(p_pog_index, objects.MIndex, objects.SIndex, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters,ASA-1353
                    //ASA-2023 task-2
                    var [mod_ind, shelf_ind] = await set_shelf_after_drag(comb_shelf_ind == "Y" ? "R" : objects.Valid, "Y", objects.MIndex, objects.CurrModIndex, edit_shelf_index, act_x, act_y, "Y", "Y", g_start_canvas !== g_present_canvas ? objects.MIndex : "", g_start_canvas !== g_present_canvas ? edit_shelf_index : "", g_start_canvas, p_pog_index, currCombinationIndex);

                    var edit_shelf_index_e = -1;
                    var j = 0;
                    for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo) {
                        if (shelfs.SObjID == objects.ObjID) {
                            edit_shelf_index_e = j;
                            break; //return false;
                        }
                        j++;
                    }
                    await set_all_items(mod_ind, edit_shelf_index_e, act_x, act_y, "Y", "N", "Y", p_pog_index, p_pog_index);
                    l_shelf_details[i].newItemIndex = -1;
                    l_shelf_details[i].newModIndex = mod_ind;
                    l_shelf_details[i].newShelfIndex = edit_shelf_index_e;
                    if (g_show_notch_label == "Y") {
                        var returnval = update_single_notch_label("Y", mod_ind, shelf_ind, $v("P25_NOTCH_HEAD"), "", p_pog_index, "N");
                    }

                    g_intersected = []; //ASA-S-1107
                    var shelfblink = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind];
                    var shelfSelected = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfblink.SObjID);
                    g_intersected.push(shelfSelected);
                    for (const item of shelfblink.ItemInfo) {
                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item.ObjID);
                        g_intersected.push(selectedObject);
                    }

                    i++;
                }
                render_animate_selected();

                for (const objects of shelf_list) {
                    if (objects.IsDivider == "Y") {
                        shelf_arr = g_pog_json[p_pog_index].ModuleInfo[objects.OldModuleIndex].ShelfInfo;
                        var div_index = -1;
                        var support_obj = {};
                        var i = 0;
                        for (const shelfs of shelf_arr) {
                            if (shelfs.Shelf == objects.ItemID) {
                                support_obj = shelfs;
                                break; //return false;
                            }
                            i++;
                        }
                    }
                }

                var movedShelfDetail = {};
                // this is the list of all the shelf including shelf to where item is placed. we have set the items to
                //new shelf so we recreate all the shelfs.
                for (const index of new_shelf) {
                    var spread_type = g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].SpreadItem;
                    var item_arr = g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ItemInfo; //ASA-1258 issue 1 -S
                    var spread_gap = g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].HorizGap;
                    var spread_product = g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].SpreadItem;
                    if (g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ItemInfo.length > 0) {
                        var i = 0;
                        for (const items of item_arr) {
                            // var new_x = get_item_xaxis(items.W, items.H, items.D, g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ObjType, -1, spread_gap, spread_product == "M" ? "L" : spread_product, spread_gap, index.MIndex, index.SIndex, i, "Y", g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ItemInfo.length, "N", p_pog_index); //ASA-1989
                            var new_x = get_item_xaxis(items.W, items.H, items.D, g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ObjType, -1, spread_gap, spread_product, spread_gap, index.MIndex, index.SIndex, i, "Y", g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ItemInfo.length, "N", p_pog_index); //ASA-1989 Spread product condition fixed
                            g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ItemInfo[i].X = new_x;
                            i++;
                        }
                    } //ASA-1258 issue 1 -E
                    if (spread_type == "F") {
                        var i = 0;
                        for (const fitems of g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ItemInfo) {
                            fitems.W = fitems.RW;
                            if (g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ObjType == "PEGBOARD" || (g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                //ASA-1125
                                fitems.Exists = "E";
                            }

                            i++;
                        }
                    }
                    if (reorder_items(index.MIndex, index.SIndex, p_pog_index)) {
                        await recreate_all_items(index.MIndex, index.SIndex, index.ObjType, "Y", p_final_x, -1, g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ItemInfo.length, "N", "N", -1, -1, g_present_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                        movedShelfDetail["NewModuleIndex"] = index.MIndex;
                        movedShelfDetail["NewShelfIndex"] = index.SIndex;
                        undoObjectsInfo = [];
                        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].Shelf);
                        if (currCombinationIndex !== -1) {
                            undoObjectsInfo.CombineInd = "Y";
                            undoObjectsInfo.CombShelfIndex = currShelfCombIndx;
                            currCombination = g_combinedShelfs[currCombinationIndex];
                            if (currCombination.length > 1) {
                                for (obj of new_shelf_combine_undo) {
                                    undoObjectsInfo.push(obj);
                                }
                            }
                        } else {
                            undoObjectsInfo.push(JSON.parse(JSON.stringify(temp_cut_arr_1[0][index.MIndex].ShelfInfo[index.SIndex])));

                            // for (obj of new_shelf_combine_undo) {  //ASA-1443 issue 1
                            //     undoObjectsInfo.push(obj);
                            // };
                        }
                        movedShelfDetail["NewModuleIndex"] = index.MIndex;
                        movedShelfDetail["NewShelfIndex"] = index.SIndex;
                        undoObjectsInfo.moduleIndex = index.MIndex;
                        undoObjectsInfo.module = temp_cut_arr_1[0][index.MIndex].Module;
                        undoObjectsInfo.moduleObjectID = temp_cut_arr_1[0][index.MIndex].MObjID;
                        undoObjectsInfo.shelfIndex = index.SIndex;
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_present_canvas;
                        undoObjectsInfo.objectID = temp_cut_arr_1[0][index.MIndex].ShelfInfo[index.SIndex].SObjID;
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                        undoObjectsInfo = [];
                        undoAction = "ITEM_DELETE";
                        var items_detail = g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ItemInfo;
                        if (g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
                            //Bug-26122 - splitting the chest
                            g_pog_json[p_pog_index].ModuleInfo[index.MIndex].ShelfInfo[index.SIndex].ChestEdit = "Y";
                        }
                        var sorto = {
                            X: "asc",
                            Y: "asc",
                        };
                        items_detail.keySort(sorto);

                        for (const fitems of items_detail) {
                            fitems.Edited = "Y";
                            fitems.FromProductList = "N";
                            fitems.Exists = "E";
                        }
                    }
                    g_intersected = []; //ASA-S-1107
                    if (typeof item_details !== "undefined") {
                        for (const fitems of item_details) {
                            for (const items of items_detail) {
                                if (fitems.ObjID == items.OldObjID) {
                                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                    g_intersected.push(selectedObject);
                                }
                            }
                        }
                        render_animate_selected(); //ASA-E-1107
                    }
                }
                // this is the list of all the shelf including shelf from where items are dragged. we have set the items to
                //new shelf so old shelf to be recreate all the shelfs.
                for (const index of olf_shelf) {
                    if (g_delete_details.multi_carpark_ind == "Y") {
                        movedShelfDetail["MIndex"] = index.OldModuleIndex;
                        movedShelfDetail["SIndex"] = index.OldShelfIndex;
                        undoObjectsInfo = [];
                        undoObjectsInfo.moduleIndex = index.OldModuleIndex;
                        undoObjectsInfo.module = g_temp_cut_arr[0][index.OldModuleIndex].Module;
                        undoObjectsInfo.moduleObjectID = g_temp_cut_arr[0][index.OldModuleIndex].MObjID;
                        undoObjectsInfo.shelfIndex = index.OldShelfIndex;
                        undoObjectsInfo.IsCarpark = "Y";
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_start_canvas;
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(g_temp_cut_arr[0][index.OldModuleIndex].Carpark[0])));
                        undoObjectsInfo.objectID = g_temp_cut_arr[0][index.OldModuleIndex].Carpark[0].SObjID;
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                        undoAction = "ITEM_DELETE";

                        //delete the carpark shelf if all items are moved.
                        if (typeof g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].Carpark[0] !== "undefined") {
                            if (g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].Carpark[0].ItemInfo.length == 0 && g_delete_details.multi_carpark_ind == "Y") {
                                var selectObjects = g_world.getObjectById(g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].Carpark[0].SObjID);
                                g_world.remove(selectObjects);
                                g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].Carpark.splice(0, 1);
                            }
                        }
                    } else {
                        var spread_type = g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].ShelfInfo[index.OldShelfIndex].SpreadItem;
                        if (spread_type == "F") {
                            var i = 0;
                            for (const fitems of g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].ShelfInfo[index.OldShelfIndex].ItemInfo) {
                                fitems.W = fitems.RW;
                                //});
                                i++;
                            }
                        }
                        if (reorder_items(index.OldModuleIndex, index.OldShelfIndex, startDragCanvas)) {
                            await recreate_all_items(index.OldModuleIndex, index.OldShelfIndex, index.OldObjectType, "Y", p_final_x, -1, g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].ShelfInfo[index.OldShelfIndex].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", startDragCanvas, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                            movedShelfDetail["MIndex"] = index.OldModuleIndex;
                            movedShelfDetail["SIndex"] = index.OldShelfIndex;
                            undoObjectsInfo = [];
                            var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(startDragCanvas, g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].ShelfInfo[index.OldShelfIndex].Shelf); //ASA-1685 Issue 1
                            if (currCombinationIndex !== -1) {
                                undoObjectsInfo.CombineInd = "Y";
                                undoObjectsInfo.CombShelfIndex = currShelfCombIndx;
                                currCombination = g_combinedShelfs[currCombinationIndex];
                                if (currCombination.length > 1) {
                                    for (obj of old_shelf_combine_undo) {
                                        undoObjectsInfo.push(obj);
                                    }
                                }
                            } else {
                                undoObjectsInfo.push(JSON.parse(JSON.stringify(g_temp_cut_arr[0][index.OldModuleIndex].ShelfInfo[index.OldShelfIndex])));
                            }
                            //ASA-1525 #2 Start
                            // else {
                            //     for (obj of old_shelf_combine_undo) {  //ASA-1443 issue 1
                            //         undoObjectsInfo.push(obj);
                            //     };
                            // }
                            //ASA-1525 #2 End
                            undoObjectsInfo.moduleIndex = index.OldModuleIndex;
                            undoObjectsInfo.module = g_temp_cut_arr[0][index.OldModuleIndex].Module;
                            undoObjectsInfo.moduleObjectID = g_temp_cut_arr[0][index.OldModuleIndex].MObjID;
                            undoObjectsInfo.shelfIndex = index.OldShelfIndex;
                            undoObjectsInfo.IsCarpark = "N";
                            undoObjectsInfo.actionType = "ITEM_DELETE";
                            undoObjectsInfo.startCanvas = g_start_canvas;
                            undoObjectsInfo.objectID = g_temp_cut_arr[0][index.OldModuleIndex].ShelfInfo[index.OldShelfIndex].SObjID;
                            g_allUndoObjectsInfo.push(undoObjectsInfo);
                            undoAction = "ITEM_DELETE";
                            if (g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].ShelfInfo[index.OldShelfIndex].ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
                                //Bug-26122 - splitting the chest
                                g_pog_json[startDragCanvas].ModuleInfo[index.OldModuleIndex].ShelfInfo[index.OldShelfIndex].ChestEdit = "Y"; //ASA-1685 Issue 1
                            }
                        }
                    }
                }
                render(startDragCanvas);
                var prevModuleIndex = -1;
                var preShelfIndex = -1;
                var preCurrCanvas = -1;
                for (i of g_allUndoObjectsInfo) {
                    if (prevModuleIndex !== i.moduleIndex || preShelfIndex !== i.shelfIndex || preCurrCanvas !== i.startCanvas) {
                        prevModuleIndex = i.moduleIndex;
                        preShelfIndex = i.shelfIndex;
                        preCurrCanvas = i.startCanvas;
                    } else {
                        g_allUndoObjectsInfo.splice(i, 1);
                    }
                }
                var shelfInfoForUndo = [];
                shelfInfoForUndo.push(movedShelfDetail);
                await recreate_compare_views(g_compare_view, "N");
                //if validation of item or shelfs failed. then we need to reset them to old locations.
            } else if ((valid == "N" && (item_details.length > 0 || l_shelf_details.length > 0)) || cnfrm == "N") {
                var i = 0;
                if (reset == "Y") {
                    for (const objects of shelf_list) {
                        var edit_item_index = -1;
                        var j = 0;
                        for (const items of g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo) {
                            //ASA-1685 Issue 1
                            if (items.ObjID == objects.ObjID) {
                                edit_item_index = j;
                                break; //return false;
                            }
                            j++;
                        }
                        if (edit_item_index == 0) {
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.splice(edit_item_index, edit_item_index + 1); //ASA-1685 Issue 1
                        } else {
                            g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.splice(edit_item_index, 1); //ASA-1685 Issue 1
                        }
                        objects.OldInfo.X = objects.OldItemX;
                        objects.OldInfo.Y = objects.OldItemY;

                        if (g_delete_details.multi_carpark_ind == "Y") {
                            if (g_pog_json[startDragCanvas].ModuleInfo[objects.OldModuleIndex].Carpark[0].SpreadItem == "R") {
                                g_pog_json[startDragCanvas].ModuleInfo[objects.OldModuleIndex].Carpark[0].ItemInfo.splice(objects.IIndex, 0, objects.OldInfo);
                            } else {
                                g_pog_json[startDragCanvas].ModuleInfo[objects.OldModuleIndex].Carpark[0].ItemInfo.splice(objects.IIndex, 0, objects.OldInfo);
                            }
                        } else {
                            if (g_pog_json[startDragCanvas].ModuleInfo[objects.OldModuleIndex].ShelfInfo[objects.OldShelfIndex].SpreadItem == "R") {
                                g_pog_json[startDragCanvas].ModuleInfo[objects.OldModuleIndex].ShelfInfo[objects.OldShelfIndex].ItemInfo.splice(objects.IIndex, 0, objects.OldInfo);
                            } else {
                                g_pog_json[startDragCanvas].ModuleInfo[objects.OldModuleIndex].ShelfInfo[objects.OldShelfIndex].ItemInfo.splice(objects.IIndex, 0, objects.OldInfo);
                            }
                        }
                        i = i + 1;
                        var item_arr = g_delete_details.multi_carpark_ind == "Y" ? g_pog_json[startDragCanvas].ModuleInfo[objects.OldModuleIndex].Carpark[0].ItemInfo : g_pog_json[startDragCanvas].ModuleInfo[objects.OldModuleIndex].ShelfInfo[objects.OldShelfIndex].ItemInfo;
                        var sorto = {
                            X: "asc",
                            Y: "asc",
                        };
                        item_arr.keySort(sorto);
                    }
                }
                var new_world, remove_world;
                new_world = g_scene_objects[g_present_canvas].scene.children[2];
                remove_world = g_scene_objects[g_start_canvas].scene.children[2];

                var j = 0;
                g_world = remove_world;
                for (const objects of g_multi_drag_item_arr) {
                    $.each(g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo, function (m, items) {
                        if (items.ObjID == objects.ObjID) {
                            edit_item_index = m;
                            return false;
                        }
                    });

                    g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].X = objects.XAxis;
                    g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index].Y = objects.YAxis;
                    var object = new_world.getObjectById(objects.ObjID);
                    if (g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.length > 0) {
                        var [return_obj, objID] = await create_drag_objects(objects.MIndex, objects.SIndex, edit_item_index, shelfs, g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[edit_item_index], g_show_live_image, "ITEM", object, g_start_canvas, g_present_canvas);
                        return_obj.position.x = objects.XAxis;
                        return_obj.position.y = objects.YAxis;
                        new_world.remove(object);
                        return_obj.updateMatrix();
                    }
                    j++;
                }

                var j = -1;
                for (const objects of g_multi_drag_shelf_arr) {
                    j++;
                    async function create_obj() {
                        var shelfInfo = g_pog_json[startDragCanvas].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                        var selectObjects = new_world.getObjectById(objects.ObjID);
                        [return_obj, newObjId] = await create_drag_objects(objects.MIndex, objects.SIndex, objects.IIndex, shelfInfo, shelfInfo.ItemInfo, g_show_live_image, "SHELF", selectObjects, g_start_canvas, g_present_canvas);

                        new_world.remove(selectObjects);
                        selectObjects = return_obj;
                        selectObjects.updateMatrix();
                        var k = j;
                        g_drag_items_arr = [];
                        var l = 0;
                        for (const items of shelfInfo.ItemInfo) {
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                            if (typeof selectedObject !== "undefined") {
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
                                selectedObject.StartCanvas = g_start_canvas;
                                selectedObject.MIndex = objects.MIndex;
                                selectedObject.SIndex = objects.SIndex;
                                selectedObject.XAxis = shelfInfo.X;
                                selectedObject.YAxis = shelfInfo.Y;
                                g_drag_items_arr.push(selectedObject);
                            }
                            l++;
                        }
                        var l_temp_arr = [];
                        if (g_drag_items_arr.length > 0) {
                            var k = 0;
                            for (const objects of g_drag_items_arr) {
                                k++;
                                new_world.remove(objects);
                                var [return_obj, newObjID1] = await create_drag_objects(objects.MIndex, objects.SIndex, objects.IIndex, objects.ShelfInfo, objects.ItemInfo, g_show_live_image, "ITEM", objects, g_start_canvas, g_present_canvas);
                                l_temp_arr.push(return_obj);
                            }
                            if (l_temp_arr.length > 0) {
                                g_drag_items_arr = [];
                                g_drag_items_arr = l_temp_arr;
                            }
                            set_inter_canvas_items(objects.XAxis, objects.YAxis, selectObjects, l_temp_arr, selectObjects.W, selectObjects.H, g_shelf_object_type, g_shelf_basket_spread, selectObjects.Rotation, selectObjects.ItemSlope, objects.SIndex, objects.MIndex, p_pog_index);
                        }
                    }
                    await create_obj();
                }
                render(g_start_canvas);
                g_world = new_world;
                render(p_pog_index);

                g_delete_details = [];
                g_multi_drag_shelf_arr = [];
                g_multi_drag_item_arr = [];
                g_cut_copy_arr = [];
                cut_copy_arr1 = [];
                g_undo_details = [];
                g_mselect_drag = "N";
                g_multiselect = "N";
                g_ctrl_select = "N";
                g_undo_all_obj_arr = [];
                g_temp_cut_arr = [];
                g_select_zoom_arr = [];
            }
            //if everything was successful we set the undo details.
            if (valid == "Y" && cnfrm == "Y") {
                g_cut_copy_arr = [];
                var i = 0; //ASA-1724 Issue 4
                for (det of l_shelf_details) {
                    undoObjectsInfo = [];
                    undoObjectsInfo.moduleIndex = det.MIndex;
                    undoObjectsInfo.shelfIndex = det.SIndex;
                    undoObjectsInfo.actionType = "SHELF_DRAG";
                    undoObjectsInfo.objectID = det.ObjID;
                    undoAction = "SHELF_DRAG";
                    if (typeof det.ShelfInfo !== "undefined" && typeof det.ShelfInfo[i] !== "undefined") {
                        //ASA-1724 Issue 4, added  typeof det.ShelfInfo[i] !== "undefined" to handle textbox case
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(det.ShelfInfo[i])));
                        undoObjectsInfo.moduleObjectID = temp_cut_arr_1[0][det.newModIndex].MObjID;
                        undoObjectsInfo.startCanvas = startDragCanvas;
                        undoObjectsInfo.g_present_canvas = dropDragCanvas;
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                    } else {
                        undoObjectsInfo.module = g_temp_cut_arr[0][det.MIndex].Module;
                        undoObjectsInfo.startCanvas = startDragCanvas;
                        undoObjectsInfo.g_present_canvas = dropDragCanvas;
                        undoObjectsInfo.moduleObjectID = temp_cut_arr_1[0][det.newModIndex].MObjID;
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(g_temp_cut_arr[0][det.MIndex].ShelfInfo[det.SIndex])));
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                    }

                    i++;
                }
                if (item_details.length > 0) {
                    var dragObjType = "DRAG_ITEM";
                    oldworld = g_scene_objects[p_pog_index].scene.children[2];
                } else {
                    var dragObjType = "MULTI_DRAG_SHELF";
                }
                var i = 0;
                for (c of g_cut_copy_arr) {
                    for (u of g_undo_details) {
                        if (c.OldObjID == u.ObjID) {
                            g_undo_details[i].ObjID = c.ObjID;
                        }
                    }
                    i++;
                }

                g_delete_details.multi_delete_shelf_ind = "N";
                logFinalUndoObjectsInfo(undoAction, "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y");
                g_allUndoObjectsInfo = [];
            }
            await calculateFixelAndSupplyDays("N", g_start_canvas);
            await calculateFixelAndSupplyDays("N", g_present_canvas);
            g_select_zoom_arr = [];
            g_mselect_drag = "N";
            if (g_manual_zoom_ind == "N") {
                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), false, p_pog_index);
            }
            render(p_pog_index);
            render(g_start_canvas);
            if (startDragCanvas !== dropDragCanvas) {
                animate_all_pog();
            } else {
                animate_pog(p_pog_index);
            }
        }
        logDebug("function : multi_drag_setup", "E");
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}


//after drag setting the top bottom objID to those items because after recreate of item. those objid will change.
function reset_bottom_item(p_module_index, p_shelf_index, p_item_index, p_curr_module, p_div_shelf_index, p_final_x, p_pog_index) {
    try {
        logDebug("function : reset_bottom_item; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; curr_module : " + p_curr_module + "; div_shelf_index : " + p_div_shelf_index + "; i_final_x : " + p_final_x, "S");
        var bottom_obj_id = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].BottomObjID;
        var top_obj_id = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].TopObjID;
        if (p_curr_module !== p_module_index || p_shelf_index !== p_div_shelf_index) {
            if (bottom_obj_id !== "" && typeof bottom_obj_id !== "undefined") {
                var k = 0;
                for (const items of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo) {
                    if (bottom_obj_id == items.ObjID) {
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].TopObjID = "";
                        break; //return false;
                    }
                    k++;
                }
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].BottomObjID = "";
            } else if (typeof top_obj_id !== "undefined" && top_obj_id !== "") {
                var k = 0;
                for (const items of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo) {
                    if (top_obj_id == items.ObjID) {
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].BottomObjID = "";
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].Y = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + items.H / 2;
                        break; //return false;
                    }
                    k++;
                }
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].TopObjID = "";
            }
        } else {
            if (top_obj_id !== "" && typeof top_obj_id !== "undefined" && bottom_obj_id !== "" && typeof bottom_obj_id !== "undefined") {
                var k = 0;
                for (const items of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo) {
                    if (top_obj_id == items.ObjID) {
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].BottomObjID = bottom_obj_id;
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].Y = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[get_shelf_item_ind(p_module_index, p_shelf_index, bottom_obj_id, p_pog_index)].H + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + items.H / 2;
                        break; //return false;
                    }
                    k++;
                }
            } else {
                var k = 0;
                for (const items of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo) {
                    if (top_obj_id == items.ObjID) {
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].BottomObjID = "";
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[k].Y = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2 + items.H / 2;
                        break; //return false;
                    }
                    k++;
                }
            }

            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].X = p_final_x;
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "SHELF" || g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "PALLET") {
                var returnval = reset_top_bottom_objects(p_module_index, p_shelf_index, "N", p_pog_index);
            }
        }
        logDebug("function : reset_bottom_item", "E");
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
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
                apex.event.trigger("#P25_BLK_RULE", "apexrefresh");
                $s("P25_BLK_NAME", "");
                $s("P25_BLK_COLOR", randomColor());
                $s("P25_BLK_FILTER", "");
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
            //ASA- 2023 Regression Issue 3 start
            if (Array.isArray(g_delete_details) && g_delete_details.length > 1) {
                g_cut_copy_arr = [];
                g_cut_loc_arr = [];

                for (const det of g_delete_details) {
                    g_cut_support_obj_arr = [];
                    // g_cut_loc_arr = [];
                    loc_details = {};
                    var itm = JSON.parse(JSON.stringify(g_pog_json[g_start_canvas].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex]));
                    g_cut_copy_arr.push(itm);
                    g_cut_copy_arr[0].OldObjID = g_cut_copy_arr[0].ObjID;
                    g_cut_copy_arr[0].ObjID = "";
                    loc_details["MIndex"] = det.MIndex;
                    loc_details["SIndex"] = det.SIndex;
                    loc_details["IIndex"] = det.IIndex;
                    loc_details["ShelfObjType"] = itm.CType || "";
                    loc_details["Item"] = itm.Item || "";
                    loc_details["ModuleEdit"] = "N";
                    loc_details["ShelfEdit"] = "N";
                    loc_details["ItemEdit"] = "Y";
                    loc_details["gPogIndex"] = g_start_canvas;
                    g_cut_loc_arr.push(loc_details);
                    g_cut_copy_arr[0].loc_details = g_cut_loc_arr;
                }

                duplicate_drag_obj(
                    l_final_x,
                    l_final_y,
                    g_module_index,
                    g_shelf_index,
                    g_shelf_edit_flag,
                    g_module_edit_flag,
                    p_camera,
                    g_start_canvas,
                    g_present_canvas,
                    $v("P25_POGCR_MODULE_COPY_WITH_ITEM")
                );

                g_delete_details = [];

            } else {

                duplicate_drag_obj(
                    l_final_x,
                    l_final_y,
                    g_module_index,
                    g_shelf_index,
                    g_shelf_edit_flag,
                    g_module_edit_flag,
                    p_camera,
                    g_start_canvas,
                    g_present_canvas,
                    $v("P25_POGCR_MODULE_COPY_WITH_ITEM")
                );

            }
            //ASA- 2023 Regression Issue 3 end
            // duplicate_drag_obj(l_final_x, l_final_y, g_module_index, g_shelf_index, g_shelf_edit_flag, g_module_edit_flag, p_camera, g_start_canvas, g_present_canvas, $v("P25_POGCR_MODULE_COPY_WITH_ITEM"));
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
                    // if ($v("P25_POGCR_COMBINATION_SHELF") == "Y") {
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
                            await generateCombinedShelfs(p_pog_index, g_module_index, g_shelf_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters,ASA-1353
                        }
                        var [mod_ind, shelf_ind] = await set_shelf_after_drag((comb_shelf_ind = "Y" ? "R" : validate_passed), g_shelf_edit_flag, g_module_index, curr_module, g_shelf_index, g_final_x, shelfdtl.Y, "Y", "Y", g_module_index, g_shelf_index, p_pog_index, p_pog_index, currCombinationIndex); //ASA-1628 replace l_final_y with shelfdtl.Y

                        if (g_itemSubLabelInd == "Y") {
                            //ASA-1577
                            showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
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
                            await update_single_notch_label("Y", mod_ind, shelf_ind, $v("P25_NOTCH_HEAD"), "", p_pog_index, "N");
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
                            var return_val = await recreate_all_items(g_module_index, g_shelf_index, g_shelf_object_type, "Y", g_final_x, -1, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", itemInsidePeg); //ASA-1350 issue 6 added parameters, ASA-1769 p_itemInsidePeg
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
                                        var return_val = await recreate_all_items(new_module_index, new_shelf_index, div_object_type, "Y", g_final_x, l_edited_item_index, g_pog_json[p_pog_index].ModuleInfo[new_module_index].ShelfInfo[new_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", itemInsidePeg); //ASA-1350 issue 6 added parameters, ASA-1769 itemInsidePeg
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
                                        var return_val = await recreate_all_items(g_module_index, g_shelf_index, shelfdtl.ObjType, "Y", g_final_x, l_edited_item_index, shelfdtl.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", itemInsidePeg); //ASA-1350 issue 6 added parameters, ASA-1769 itemInsidePeg
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

                            if (g_carpark_item_flag == "Y" && $v("P25_POGCR_LOAD_IMG_FROM") == "DB") {
                                var items_arr = [];
                                var item_index_arr = [];
                                items_arr.push(ItemInfo);
                                item_index_arr.push(l_edited_item_index);
                                var return_val = await get_images(new_module_index, new_shelf_index, items_arr, item_index_arr, parseFloat($v("P25_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P25_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P25_IMAGE_COMPRESS_RATIO")));
                                if (items_arr.length > 0) {
                                    var return_val = await get_images(i, j, items_arr, item_index_arr, parseFloat($v("P25_POGCR_IMG_MAX_WIDTH")), parseFloat($v("P25_POGCR_IMG_MAX_HEIGHT")), parseFloat($v("P25_IMAGE_COMPRESS_RATIO")));
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
        //     showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
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
//Start Task_27812 issue 6 20240528
async function set_combine_items_after_drag(p_new_mod_index, p_new_shelf_index, p_new_pog_index, p_new_item_index, p_old_mod_index, p_old_shelf_index, p_old_item_index, p_old_pog_index, p_final_x, p_reset_old_shelf) {
    var new_shelf_dtl = g_pog_json[p_new_pog_index].ModuleInfo[p_new_mod_index].ShelfInfo[p_new_shelf_index];
    var old_shelf_dtl = g_pog_json[p_old_pog_index].ModuleInfo[p_old_mod_index].ShelfInfo[p_old_shelf_index];
    var new_module_index = p_new_mod_index,
        new_shelf_index = p_new_shelf_index,
        l_edited_item_index = p_new_item_index;
    if ((new_shelf_dtl.ObjType == "SHELF" || new_shelf_dtl.ObjType == "HANGINGBAR") && new_shelf_dtl.Combine !== "N") {
        var l_detail_arr = [];
        var l_detail_obj = {};
        l_detail_obj["MIndex"] = p_new_mod_index;
        l_detail_obj["SIndex"] = p_new_shelf_index;
        // ASA-2000.6 Start
        // l_detail_obj["IIndex"] = p_new_item_index;
        // l_detail_obj["Iobjid"] = new_shelf_dtl.ItemInfo[p_new_item_index].ObjID;
        if (new_shelf_dtl.ItemInfo && new_shelf_dtl.ItemInfo.length > 0) {
            l_detail_obj["IIndex"] = new_shelf_dtl.ItemInfo.length - 1;
            l_detail_obj["Iobjid"] = new_shelf_dtl.ItemInfo[l_detail_obj["IIndex"]].ObjID;
        } else {
            l_detail_obj["IIndex"] = 0;
            l_detail_obj["Iobjid"] = "";
        }
        // ASA-2000.6 End
        l_detail_arr.push(l_detail_obj);
        [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_new_pog_index, new_shelf_dtl.Shelf);
        if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
            //await setCombinedShelfItems(p_new_pog_index, currCombinationIndex, currShelfCombIndx, p_final_x, "Y", "N", -1, p_new_item_index, l_detail_arr); //ASA-1329
            await setCombinedShelfItems(p_new_pog_index, currCombinationIndex, currShelfCombIndx, p_final_x, "Y", "N", -1, l_detail_obj["IIndex"], l_detail_arr);  //ASA-2000.6
            new_module_index = l_detail_arr[0].MIndex;
            new_shelf_index = l_detail_arr[0].SIndex;
            l_edited_item_index = l_detail_arr[0].IIndex;
        }
    }
    //ASA-1519 Issue 2, added p_reset_old_shelf
    if (p_reset_old_shelf == "Y" && (old_shelf_dtl.ObjType == "SHELF" || old_shelf_dtl.ObjType == "HANGINGBAR") && old_shelf_dtl.Combine !== "N") {
        //Task_27812 issue 13 20240528
        [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_old_pog_index, old_shelf_dtl.Shelf);
        if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
            await setCombinedShelfItems(p_old_pog_index, currCombinationIndex, currShelfCombIndx, p_final_x, "Y", "N", -1, p_old_item_index, []);
            await reset_auto_crush(p_old_mod_index, p_old_shelf_index, p_old_item_index, p_old_pog_index, p_old_mod_index, p_old_shelf_index, p_old_pog_index);
        }
    }
    return [new_module_index, new_shelf_index, l_edited_item_index];
}
//End Task_27812 issue 6 20240528
//this function is used in mouseup function. this function will revert back the items to old position when validation fails.
function rollback_item(p_module_index, p_shelf_index, p_item_index, p_drag_z, p_pog_index) {
    logDebug("function : rollback_item; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; g_drag_z : " + p_drag_z);
    if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Rotation !== 0) {
        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID);
        var x = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationX;
        var y = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationY;
        var z = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RotationZ;
        var relativeMeshOffset = new THREE.Vector3(x, y, z);

        var offsetPosition = relativeMeshOffset.applyMatrix4(selectedObject.matrixWorld);

        g_dragItem.position.x = offsetPosition.x;
        g_dragItem.position.y = offsetPosition.y;
        g_dragItem.position.z = offsetPosition.z;
        g_dragItem.quaternion.copy(selectedObject.quaternion);
        g_dragItem.updateMatrix();
    } else {
        if (g_carpark_item_flag == "N") {
            g_dragItem.position.set(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].X, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y, p_drag_z);
        } else {
            g_dragItem.position.set(g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[p_shelf_index].ItemInfo[p_item_index].X, g_pog_json[p_pog_index].ModuleInfo[p_module_index].Carpark[p_shelf_index].ItemInfo[p_item_index].Y, p_drag_z);
        }
    }
    logDebug("function : rollback_item", "E");
}
//added async to make the function wait.//Task_27812 issue 13
//this function will return the item index next to it the dragged item to be placed.
//Note this function uses get_nearest_item function to get the nearest item. this uses direction to decide the nearest one.
async function update_item_loc(p_curr_module, p_module_index, p_shelf_index, p_div_shelf_index, p_div_object_type, p_item_index, p_final_x, p_shelf_found, p_itemInfo, p_shelfY, p_shelfHeight, p_final_y, p_div_pogjson, p_drag_direction, p_pog_index, p_curr_pogIndex) {
    logDebug("function : update_item_loc; curr_module : " + p_curr_module + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; div_shelf_index : " + p_div_shelf_index + "; div_object_type : " + p_div_object_type + "; i_item_index : " + p_item_index + "; i_final_x : " + p_final_x + "; shelf_found : " + p_shelf_found + "; shelfY : " + p_shelfY + "; shelfHeight : " + p_shelfHeight + "; p_final_y : " + p_final_y + "; drag_direction : " + p_drag_direction, "S");
    try {
        typeof p_curr_pogIndex == "undefined" ? p_pog_index : p_curr_pogIndex;
        var new_pog_index = -1,
            new_module_index = -1,
            new_shelf_index = -1,
            new_object_type,
            g_edit_ind = "N";
        var item_width = wpdSetFixed(p_itemInfo.W);
        var item_fixed = p_itemInfo.Fixed;
        var item_depth = p_itemInfo.D;
        var cap_style = p_itemInfo.CapStyle;
        var item_height = p_itemInfo.H;

        if ((typeof p_curr_module !== "undefined" && p_pog_index !== p_curr_pogIndex) || (typeof p_curr_module !== "undefined" && p_curr_module !== p_module_index && p_curr_module != -1)) {
            if (p_shelf_found == "Y") {
                var [upd_item_index, bottom_item_ind, bottom_item_flag] = get_nearest_item(p_curr_module, p_div_shelf_index, p_final_x, p_item_index, "N", p_final_y, item_width, item_depth, item_fixed, cap_style, item_height, p_drag_direction, p_module_index, p_shelf_index, p_itemInfo, p_div_pogjson, p_pog_index, p_curr_pogIndex);
                //p_itemInfo["SIndex"] = p_div_shelf_index; //Task_27812 issue 13
                new_pog_index = p_pog_index; //ASA-1685
                new_module_index = p_curr_module;
                new_shelf_index = p_div_shelf_index;
                new_object_type = p_div_object_type;
                g_edit_ind = "N";
                p_itemInfo["Exists"] = "N";
                var return_val = await reset_auto_crush(p_module_index, p_shelf_index, p_item_index, p_curr_pogIndex, new_module_index, new_shelf_index, new_pog_index); //ASA-1343 issue 1 //Task_27812 issue 13 //ASA-1685
                if (p_itemInfo["Item"] == "DIVIDER") {
                    shelf_arr = g_pog_json[p_curr_pogIndex].ModuleInfo[p_module_index].ShelfInfo;
                    var div_index = -1;
                    var ShelfInfo = {};
                    var i = 0;
                    for (const shelfs of shelf_arr) {
                        if (shelfs.Shelf == p_itemInfo["ItemID"]) {
                            div_index = i;
                            ShelfInfo = shelfs;
                        }
                        i++;
                    }
                    if (div_index == 0) {
                        g_pog_json[p_curr_pogIndex].ModuleInfo[p_module_index].ShelfInfo.splice(div_index, div_index + 1);
                    } else {
                        g_pog_json[p_curr_pogIndex].ModuleInfo[p_module_index].ShelfInfo.splice(div_index, 1);
                    }
                    ShelfInfo["Y"] = p_shelfY + p_shelfHeight / 2 + p_itemInfo["H"] / 2;
                    g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo.push(ShelfInfo);
                    div_index = g_pog_json[p_pog_index].ModuleInfo[p_curr_module].ShelfInfo.length - 1;
                }
            }
        } else if (p_shelf_index !== p_div_shelf_index && p_curr_module == p_module_index && p_curr_module != -1) {
            if (p_shelf_found == "Y") {
                var [upd_item_index, bottom_item_ind, bottom_item_flag] = get_nearest_item(p_module_index, p_div_shelf_index, p_final_x, p_item_index, "N", p_final_y, item_width, item_depth, item_fixed, cap_style, item_height, p_drag_direction, p_module_index, p_shelf_index, p_itemInfo, p_div_pogjson, p_pog_index, p_curr_pogIndex);
                //p_itemInfo["SIndex"] = p_div_shelf_index; //Task_27812 issue 13
                new_pog_index = p_curr_pogIndex; //ASA-1685
                new_module_index = p_module_index;
                new_shelf_index = p_div_shelf_index;
                new_object_type = p_div_object_type;
                g_edit_ind = "N";
                p_itemInfo["Exists"] = "N";
                var return_val = await reset_auto_crush(p_module_index, p_shelf_index, p_item_index, p_pog_index, new_module_index, new_shelf_index, new_pog_index); //ASA-1343 issue 1 //Task_27812 issue 13 //ASA-1685
                if (p_itemInfo["Item"] == "DIVIDER") {
                    shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
                    var div_index = -1;
                    var i = 0;
                    for (const shelfs of shelf_arr) {
                        if (shelfs.Shelf == p_itemInfo["ItemID"]) {
                            div_index = i;
                        }
                        i++;
                    }
                    if (div_index > -1) {
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].Y = p_shelfY + p_shelfHeight / 2 + p_itemInfo["H"] / 2;
                    }
                }
            }
        } else {
            var [upd_item_index, bottom_item_ind, bottom_item_flag] = get_nearest_item(p_module_index, p_shelf_index, p_final_x, p_item_index, "Y", p_final_y, item_width, item_depth, item_fixed, cap_style, item_height, p_drag_direction, p_module_index, p_shelf_index, p_itemInfo, p_div_pogjson, p_pog_index, p_curr_pogIndex);
            new_pog_index = p_curr_pogIndex; //ASA-1685
            new_shelf_index = p_shelf_index;
            new_module_index = p_module_index;
            new_object_type = g_shelf_object_type;
            g_edit_ind = "Y";
            p_itemInfo["Exists"] = "E";
            var return_val = await reset_auto_crush(p_module_index, p_shelf_index, p_item_index, p_curr_pogIndex, new_module_index, new_shelf_index, new_pog_index); //ASA-1343 issue 1 //Task_27812 issue 13 --ASA-1685
            if (p_itemInfo["Item"] == "DIVIDER") {
                shelf_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
                var div_index = -1;
                var i = 0;
                for (const shelfs of shelf_arr) {
                    if (shelfs.Shelf == p_itemInfo["ItemID"]) {
                        div_index = i;
                    }
                    i++;
                }
                if (div_index > -1) {
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[div_index].Y = p_shelfY + p_shelfHeight / 2 + p_itemInfo["H"] / 2;
                }
            }
        }
        logDebug("function : update_item_loc", "E");
        return [upd_item_index, new_shelf_index, new_module_index, new_object_type, g_edit_ind, p_itemInfo, div_index, bottom_item_flag, bottom_item_ind];
    } catch (err) {
        error_handling(err);
    }
}

//this function is used after drop of item we need to find out item index to which next it should place an items.
function get_nearest_item(p_module_index, p_shelf_index, p_final_x, p_item_index, p_edit_ind, p_final_y, p_item_width, p_item_depth, p_item_fixed, p_cap_style, p_item_height, p_drag_direction, p_curr_mod_ind, p_curr_shelf_ind, p_item_info, p_div_pogjson, p_pog_index, p_curr_pogIndex) {
    logDebug("function : get_nearest_item; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_final_x : " + p_final_x + "; i_item_index : " + p_item_index + "; p_edit_ind : " + p_edit_ind + "; p_final_y : " + p_final_y + "; item_width : " + p_item_width + "; item_depth : " + p_item_depth + "; item_fixed : " + p_item_fixed + "; cap_style : " + p_cap_style + "; item_height : " + p_item_height + "; drag_direction : " + p_drag_direction + "; curr_mod_ind : " + p_curr_mod_ind + "; curr_shelf_ind : " + p_curr_shelf_ind, "S");
    try {
        var items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
        var spread_product = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem;
        var obect_type = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType;
        var shelf_start = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2;
        var l_object_type = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType;
        //ASA-1129
        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Shelf);
        var upd_item_index = -1;
        var min_distance_arr = [],
            min_index_arr = [];
        var bottom_item_flag = "N",
            same_location = "N",
            bottom_item_ind = -1;
        (bottom_y_arr = []), (bottom_index_arr = []);
        var shelf_top = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2); //.toFixed(3));

        if (spread_product == "R") {
            var i = 0;
            for (const items of items_arr) {
                items_arr[i].Exists = "E";
                if ((p_edit_ind == "Y" && p_item_index !== i) || p_edit_ind == "N") {
                    var item_start = items.X - items.W / 2;
                    var item_end = items.X + items.W / 2;
                    //here we check if user is trying to place an item on top of another. we check few conditions
                    //dragged item should be between below item, width/depth should be same or less, no capping, no combine, no fixed
                    if (p_final_x > item_start && p_final_x < item_end && (p_item_width <= items.W || g_item_stack_valid == "N") /*ASA-1652*/ && items.Fixed == "N" && p_item_fixed == "N" && (items.CapStyle == "0" || items.CapStyle == null) && (p_cap_style == "0" || p_cap_style == null) && p_final_y - p_item_height / 2 < items.Y + items.H / 2 && p_final_y - p_item_height / 2 > items.Y && items.Item !== "DIVIDER" && items.BHoriz == 1 && p_final_y !== -1 && p_item_fixed == "N" && (l_object_type == "SHELF" || l_object_type == "PALLET") && (typeof items.TopObjID == "undefined" || items.TopObjID == "") && currCombinationIndex == -1) {
                        bottom_y_arr.push(items.Y);
                        bottom_index_arr.push(i);
                    }
                    if (p_final_x > items.X - items.W / 2 && p_final_x < items.X + items.W / 2 && (typeof items.BottomObjID == "undefined" || items.BottomObjID == "")) {
                        same_location = "Y";
                        upd_item_index = i;
                    }
                    if (obect_type == "SHELF" || obect_type == "PALLET") {
                        //ASA-1085
                        if (wpdSetFixed(items.X + items.W / 2) > p_final_x && wpdSetFixed(items.Y - items.H / 2) == shelf_top) {
                            min_distance_arr.push(items.X - parseFloat(p_final_x));
                            min_index_arr.push(i);
                        }
                    } else {
                        if (items.X + items.W / 2 > p_final_x) {
                            min_distance_arr.push(items.X - parseFloat(p_final_x));
                            min_index_arr.push(i);
                        }
                    }
                }
                i++;
            }
        } else {
            var i = 0;
            for (const items of items_arr) {
                items_arr[i].Exists = "E";
                if ((p_edit_ind == "Y" && p_item_index !== i) || p_edit_ind == "N") {
                    var item_start = items.X - items.W / 2;
                    var item_end = items.X + items.W / 2;
                    //here we check if user is trying to place an item on top of another. we check few conditions
                    //dragged item should be between below item, width should be same or less, no capping, no combine, no fixed
                    if (p_final_x >= item_start && p_final_x < item_end && (p_item_width <= items.W || g_item_stack_valid == "N") /*ASA-1652*/ && items.Fixed == "N" && p_item_fixed == "N" && (items.CapStyle == "0" || items.CapStyle == null) && (p_cap_style == "0" || p_cap_style == null) && p_final_y - p_item_height / 2 < items.Y + items.H / 2 && p_final_y - p_item_height / 2 > items.Y && items.Item !== "DIVIDER" && items.BHoriz == 1 && p_final_y !== -1 && p_item_fixed == "N" && (l_object_type == "SHELF" || obect_type == "PALLET") && (typeof items.TopObjID == "undefined" || items.TopObjID == "") && currCombinationIndex == -1) {
                        bottom_y_arr.push(p_final_y - items.Y + items.H / 2);
                        bottom_index_arr.push(i);
                    }
                    if (p_final_x > items.X - items.W / 2 && p_final_x < items.X + items.W / 2 && (typeof items.BottomObjID == "undefined" || items.BottomObjID == "")) {
                        same_location = "Y";
                        upd_item_index = i;
                    }
                    if (obect_type == "SHELF" || obect_type == "PALLET") {
                        //ASA-1085
                        if (wpdSetFixed(items.X - items.W / 2) < p_final_x && wpdSetFixed(items.Y - items.H / 2) == shelf_top) {
                            min_distance_arr.push(parseFloat(p_final_x) - items.X);
                            min_index_arr.push(i);
                        }
                    } else {
                        if (items.X - items.W / 2 < p_final_x) {
                            min_distance_arr.push(parseFloat(p_final_x) - items.X);
                            min_index_arr.push(i);
                        }
                    }
                }
                i++;
            }
        }
        //if user trying to place drag item on top of another then we check the depth if its high. we try to reduce depth facings.
        //even then it fails then we don't allow.
        if (bottom_y_arr.length > 0 && p_item_info.BVert == 1 && p_item_info.BHoriz == 1) {
            var min_distance = Math.min.apply(Math, bottom_y_arr);
            var index = bottom_y_arr.findIndex(function (number) {
                return number == min_distance;
            });
            bottom_item_ind = bottom_index_arr[index];
            bottom_item_flag = "Y";
            if ((p_item_depth > items_arr[bottom_item_ind].D || g_item_stack_valid == "N") /*ASA-1652*/ && g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].BaseD > 1) {
                new_depth = g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].RD / g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].BaseD;
                var depth_facing = Math.floor((items_arr[bottom_item_ind].D * 100) / (new_depth * 100));
                var l_dfacing = nvl(g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].MPogDepthFacings) > 0 ? g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].MPogDepthFacings : items.MDepthFacings; //ASA-1408
                depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874,//ASA-1408
                g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].D = new_depth * (depth_facing > 0 ? depth_facing : 1);
                g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].BaseD = depth_facing > 0 ? depth_facing : 1;
                g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].RD = g_pog_json[p_pog_index].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].D;
            } else if (p_item_depth > items_arr[bottom_item_ind].D && g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].BaseD == 1) {
                bottom_item_ind = -1;
                bottom_item_flag = "N";
            } else if (p_item_depth <= items_arr[bottom_item_ind].D || g_item_stack_valid == "N") {
                //ASA-1652
                if (g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo.length > 0) {
                    new_depth = g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].RD / g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].BaseD;
                    //Regression issue 26 Drag the product back to Shelf 2/6, top and between 2 items, it shows error
                    var depth_facing = Math.floor((items_arr[bottom_item_ind].D * 100) / (new_depth * 100));
                    var l_dfacing = nvl(items_arr[bottom_item_ind].MPogDepthFacings) > 0 ? items_arr[bottom_item_ind].MPogDepthFacings : items_arr[bottom_item_ind].MDepthFacings; //ASA-1408
                    depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874, //ASA-1408

                    g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].D = new_depth * (depth_facing > 0 ? depth_facing : 1);
                    g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].BaseD = depth_facing > 0 ? depth_facing : 1;
                    g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].RD = g_pog_json[p_curr_pogIndex].ModuleInfo[p_curr_mod_ind].ShelfInfo[p_curr_shelf_ind].ItemInfo[p_item_index].D;
                }
            }
        }

        if (same_location == "N") {
            if (min_distance_arr.length > 0) {
                var indices = [];
                var min_distance = Math.min.apply(Math, min_distance_arr);
                min_distance_arr.filter(function (yourArray, index) {
                    if (yourArray == min_distance) {
                        indices.push(index);
                    }
                });
                var index = indices[indices.length - 1];

                if (spread_product == "R") {
                    if (min_index_arr[index] > 0) {
                        if (p_drag_direction == "B") {
                            upd_item_index = min_index_arr[index];
                        } else {
                            upd_item_index = min_index_arr[index] - 1;
                        }
                    } else {
                        upd_item_index = 0;
                    }
                } else {
                    if (p_module_index == p_curr_mod_ind && p_shelf_index == p_curr_shelf_ind) {
                        if (p_drag_direction == "S") {
                            upd_item_index = min_index_arr[index] + 1;
                        } else if (p_drag_direction == "B") {
                            upd_item_index = min_index_arr[index] + 1;
                        } else if (p_drag_direction == "F") {
                            upd_item_index = min_index_arr[index] + 1; //ASA-1258
                        } else {
                            upd_item_index = min_index_arr[index];
                        }
                    } else {
                        upd_item_index = min_index_arr[index] + 1;
                    }
                }
            } else {
                upd_item_index = 0;
            }
        }
        logDebug("function : get_nearest_item", "E");
        return [upd_item_index, bottom_item_ind, bottom_item_flag];
    } catch (err) {
        error_handling(err);
    }
}

//this function will open edit popup for POG by setting all the details in an array and pass that array from sessionstorage to
//opening page.
function open_pog_modal(p_openType, p_pog_index, p_edit = "N") {
    try {
        logDebug("function : open_pog_modal", "S");
        var pogModalJson = [];
        var pogModalFields = {};
        var j = 0; //ASA-1250 START
        var prev_notch_w = "",
            prev_notch_start = "",
            prev_notch_space = "";
        var invalid = "N";
        if (g_pog_json[p_pog_index].ModuleInfo.length > 1) {
            for (modobj of g_pog_json[p_pog_index].ModuleInfo) {
                if (modobj.ParentModule == null || modobj.ParentModule == "undefined") {
                    var modobjNotchW = parseFloat(modobj.NotchW);
                    var modobjNotchStart = parseFloat(modobj.NotchStart);
                    var modobjNotchSpacing = parseFloat(modobj.NotchSpacing);
                    if (prev_notch_w !== "" && (prev_notch_w !== modobjNotchW || prev_notch_start !== modobjNotchStart || prev_notch_space !== modobjNotchSpacing)) {
                        invalid = "Y";
                        break;
                    }
                    prev_notch_w = modobjNotchW;
                    prev_notch_start = modobjNotchStart;
                    prev_notch_space = modobjNotchSpacing;
                }
                j++;
            }
        }
        pogModalFields["NotchCheck"] = invalid; //ASA-1250 END
        pogModalFields["POGCode"] = g_pog_json[p_pog_index].POGCode;
        pogModalFields["Version"] = g_pog_json[p_pog_index].Version;
        pogModalFields["W"] = (g_pog_json[p_pog_index].W * 100).toFixed(2);
        pogModalFields["H"] = (g_pog_json[p_pog_index].H * 100).toFixed(2);
        pogModalFields["D"] = (g_pog_json[p_pog_index].D * 100).toFixed(2);
        pogModalFields["Name"] = g_pog_json[p_pog_index].Name;
        pogModalFields["Type"] = g_pog_json[p_pog_index].Type;
        pogModalFields["PogHeight"] = (g_pog_json[p_pog_index].H * 100).toFixed(2);
        pogModalFields["PogSegmentWidth"] = (g_pog_json[p_pog_index].SegmentW * 100).toFixed(2);
        pogModalFields["PogWidth"] = (g_pog_json[p_pog_index].W * 100).toFixed(2);
        pogModalFields["BackDepth"] = (g_pog_json[p_pog_index].BackDepth * 100).toFixed(2);
        pogModalFields["TrafficFlow"] = g_pog_json[p_pog_index].TrafficFlow;
        pogModalFields["BaseH"] = (g_pog_json[p_pog_index].BaseH * 100).toFixed(2);
        pogModalFields["BaseW"] = (g_pog_json[p_pog_index].BaseW * 100).toFixed(2);
        pogModalFields["BaseD"] = (g_pog_json[p_pog_index].BaseD * 100).toFixed(2);
        pogModalFields["NotchW"] = (g_pog_json[p_pog_index].NotchW * 100).toFixed(2);
        pogModalFields["NotchStart"] = (g_pog_json[p_pog_index].NotchStart * 100).toFixed(2);
        pogModalFields["NotchSpacing"] = (g_pog_json[p_pog_index].NotchSpacing * 100).toFixed(2);
        pogModalFields["Color"] = g_pog_json[p_pog_index].Color;
        pogModalFields["HorzStart"] = (g_pog_json[p_pog_index].HorzStart * 100).toFixed(2);
        pogModalFields["HorzSpacing"] = (g_pog_json[p_pog_index].HorzSpacing * 100).toFixed(2);
        pogModalFields["VertStart"] = (g_pog_json[p_pog_index].VertStart * 100).toFixed(2);
        pogModalFields["VertSpacing"] = (g_pog_json[p_pog_index].VertSpacing * 100).toFixed(2);
        pogModalFields["AllowOverlap"] = g_pog_json[p_pog_index].AllowOverlap;
        pogModalFields["SpecialType"] = g_pog_json[p_pog_index].SpecialType;
        pogModalFields["SpecialTypeDesc"] = g_pog_json[p_pog_index].SpecialTypeDesc;
        pogModalFields["DisplayMeterage"] = g_pog_json[p_pog_index].DisplayMeterage; //Task_25074
        pogModalFields["Category"] = g_pog_json[p_pog_index].Category; // Regression issue 10
        pogModalFields["SubCategory"] = g_pog_json[p_pog_index].SubCategory; // Regression issue 10
        pogModalFields["RPTMeterage"] = nvl(g_pog_json[p_pog_index].RPTMeterage);
        pogModalFields["EffStartDate"] = g_pog_json[p_pog_index].EffStartDate;
        pogModalFields["BrandGroupID"] = g_pog_json[p_pog_index].BrandGroupID;
        pogModalFields["Remarks"] = g_pog_json[p_pog_index].Remarks;
        pogModalFields["StoreSegment"] = g_pog_json[p_pog_index].StoreSegment;
        pogModalFields["Desc7"] = g_pog_json[p_pog_index].Desc7;
        pogModalFields["Area"] = g_pog_json[p_pog_index].Area;
        pogModalFields["PLNDept"] = g_pog_json[p_pog_index].PLNDept;
        pogModalFields["SubDept"] = g_pog_json[p_pog_index].SubDept;
        pogModalFields["Dept"] = g_pog_json[p_pog_index].Dept;
        pogModalFields["Division"] = g_pog_json[p_pog_index].Division;
        pogModalFields["FixtureGeneration"] = g_pog_json[p_pog_index].FixtureGeneration;
        pogModalFields["FixtureFamily"] = g_pog_json[p_pog_index].FixtureFamily;
        pogModalFields["FixtureType"] = g_pog_json[p_pog_index].FixtureType;
        pogModalFields["FixtureTypeDesc"] = g_pog_json[p_pog_index].FixtureTypeDesc;
        pogModalFields["FixtureCodes"] = g_pog_json[p_pog_index].FixtureCodes; //ASA-1694
        pogModalFields["FixtureCount"] = g_pog_json[p_pog_index].FixtureCount; //ASA-1694
        pogModalFields["Flex_Text_1"] = g_pog_json[p_pog_index].Flex_Text_1;
        pogModalFields["Flex_Text_2"] = g_pog_json[p_pog_index].Flex_Text_2;
        pogModalFields["Flex_Text_3"] = g_pog_json[p_pog_index].Flex_Text_3;
        pogModalFields["Flex_Text_4"] = g_pog_json[p_pog_index].Flex_Text_4;
        pogModalFields["Flex_Lov_1"] = g_pog_json[p_pog_index].Flex_Lov_1;
        pogModalFields["Flex_Lov_2"] = g_pog_json[p_pog_index].Flex_Lov_2;
        pogModalFields["Flex_Lov_3"] = g_pog_json[p_pog_index].Flex_Lov_3;
        pogModalFields["Flex_Lov_4"] = g_pog_json[p_pog_index].Flex_Lov_4;
        pogModalFields["Flex_Lov_5"] = g_pog_json[p_pog_index].Flex_Lov_5;
        pogModalFields["Flex_Lov_6"] = g_pog_json[p_pog_index].Flex_Lov_6;
        pogModalFields["PogDepth"] = (g_pog_json[p_pog_index].D * 100).toFixed(2);
        pogModalFields["SegmentW"] = (g_pog_json[p_pog_index].SegmentW * 100).toFixed(2);
        pogModalFields["PromStartDt"] = g_pog_json[p_pog_index].PromStartDt; // ASA-1202
        pogModalFields["PromEndDt"] = g_pog_json[p_pog_index].PromEndDt; // ASA-1202
        pogModalFields["PromName"] = g_pog_json[p_pog_index].PromName; // ASA-1202
        pogModalFields["PDFTemplateName"] = g_pog_json[p_pog_index].PDFTemplateName; // ASA-1876
        pogModalFields["ComparePogVersion"] = g_pog_json[p_pog_index].ComparePogVersion; // ASA-2009
        pogModalFields["Flex_Text_15"] = g_pog_json[p_pog_index].Flex_Text_15;  // ASA-1990 Req 3
        pogModalFields["StoreFormat"] = g_pog_json[p_pog_index].StoreFormat;  // ASA-1990 Req 3
        pogModalFields["pog_recreate"] = ""; //ASA-1250
        var pogCodes = "";
        if (g_pog_json.length > 1 && p_edit == "M") {
            pogModalFields["MultiEdit"] = "Y";
            var i = 0;
            for (pogs of g_pog_json) {
                if (i > 0) {
                    pogCodes = pogCodes + ",";
                }
                pogCodes += pogs.POGCode + "$$" + pogs.Version; //ASA-1531 issue 26
                i++;
            }
        } else {
            pogModalFields["MultiEdit"] = "N";
            pogModalFields["Flex_Text_11"] = g_pog_json[p_pog_index].Flex_Text_11;
            pogModalFields["Flex_Text_12"] = g_pog_json[p_pog_index].Flex_Text_12;
            pogModalFields["Flex_Text_13"] = g_pog_json[p_pog_index].Flex_Text_13;
            pogCodes = g_pog_json[p_pog_index].POGCode + "$$" + g_pog_json[p_pog_index].Version;
        }
        pogModalFields["pog_codes"] = pogCodes; //ASA-1531 Issue 9

        pogModalJson.push(pogModalFields);
        g_is_pog_template_open;
        sessionStorage.setItem("openpogjson", JSON.stringify(pogModalJson));
        if (g_is_pog_template_open == "Y") {
            //ASA-1694
            openCustomDialog(p_openType, $v("P25_POG_TEMPLATE_URL"), "P25_POG_TRIGGER_ELEMENT");
        } else {
            openCustomDialog(p_openType, $v("P25_POG_URL"), "P25_POG_TRIGGER_ELEMENT");
        }
        logDebug("function : open_pog_modal", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this will open edit popup for Module, shelf, items by setting its details in array and pass to sessionstorage.
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
        $s("P25_MODULE_EDIT_IND", "Y");

        openCustomDialog("create_module", $v("P25_CREATE_MODAL_URL"), "P25_MODALPOG_TRIGGER");
        g_temp_POG_arr = JSON.stringify(g_pog_json);
        apex.item("P25_MODULE_NAME").setFocus();
        $("#DELETE_MODULE").css("display", "inline");
    } else if (p_object_ind == "S") {
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ObjType == "TEXTBOX") {
            $s("P25_OBJECT_TYPE", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ObjType);
            $s("P25_TEXT_NAME", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Desc);
            $s("P25_TEXT_HEIGHT", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].H * 100).toFixed(2));
            $s("P25_TEXT_WIDTH", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].W * 100).toFixed(2));
            $s("P25_TEXT_ROTATION", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Rotation);
            $s("P25_TEXT_SLOPE", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Slope);
            $s("P25_TEXT_COLOR", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Color);
            $s("P25_TEXT", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].InputText);
            $s("P25_WRAP_TEXT", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].WrapText);
            $s("P25_REDUCETOFIT", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ReduceToFit);
            $s("P25_TEXT_DIRECTION", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].TextDirection);
            $s("P25_FONT_STYLE", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].FStyle);
            $s("P25_FONT_SIZE", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].FSize);
            $s("P25_BOLD", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].FBold);

            apex.item("P25_TEXT_NAME").setFocus();
            if (p_duplicate_fixel == "N") {
                $s("P25_TEXT_ID", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].Shelf);
                $s("P25_SHELF_EDIT_IND", "Y");
                $("#DELETE_TEXT").css("display", "inline");
            } else {
                $s("P25_TEXT_ID", "");
                $s("P25_SHELF_EDIT_IND", "N");
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
                if ($v("P25_UPDATE_TXTFLD_ON_IMG_UPD") === "N") {     //ASA-1976 ISSUE 1
                    $s("P25_IMG_FILENAME", "");
                    $("#IMAGE_AREA canvas").remove();
                    $("#VIEW_IMAGE canvas").remove();
                }
            }
            //ASA-1669 Start
            const warPageItem = ["P25_TEXT_WIDTH", "P25_TEXT_HEIGHT", "P25_TEXT_COLOR", "P25_TEXT_SLOPE", "P25_TEXT_ROTATION", "P25_FONT_STYLE", "P25_FONT_SIZE", "P25_BOLD", "P25_TEXT", "P25_WRAP_TEXT", "P25_REDUCETOFIT", "P25_IMG_FILENAME"];
            for (const pageItem of warPageItem) {
                $("#" + pageItem + "_CONTAINER .inc_tag_icon").remove();
                $("#" + pageItem).removeClass("apex-item-has-icon");
                $("#" + pageItem + "_CONTAINER").removeClass("apex-item-wrapper--has-icon");
            }
            //ASA-1669 End
            //ASA-1726 Start
            if ($("#P25_TEXT_ID, #P25_TEXT_NAME").hasClass("apex_disabled")) {
                $("#P25_TEXT_ID, #P25_TEXT_NAME").removeClass("apex_disabled");
            }
            //ASA-1726 End
            openInlineDialog("add_textbox", 75, 85);
        } else {
            if (p_duplicate_fixel == "N") {
                $s("P25_SHELF_EDIT_IND", "Y");
            } else {
                $s("P25_SHELF_EDIT_IND", "N");
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
            typeof g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ManualCrush == "undefined" || g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ManualCrush == "" ? $v("P25_POGCR_MANUAL_CRUSH_ITEM") : g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ManualCrush; //ASA-1300
            shelf_dtl["ShelfInfo"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
            shelf_dtl["module_index"] = p_module_ind;
            shelf_dtl["shelf_index"] = p_shelf_ind;
            shelf_dtl["duplicate_fixel"] = p_duplicate_fixel;
            shelf_dtl["mod_disp_ind"] = $v("P25_MODULE_DISP");
            shelf_dtl["edited_ind"] = $v("P25_SHELF_EDIT_IND");
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
            sessionStorage.setItem("pog_json", JSON.stringify(g_pog_json[p_pog_index])); //ASA-1964.2
            sessionStorage.setItem("current_shelf_index", g_shelf_index); //ASA-1964.2
            sessionStorage.setItem("current_module_index", g_module_index); //ASA-1964.2
            openCustomDialog("SHELF_EDIT", $v("P25_SHELF_URL"), "P25_SHELF_TRIGGER_ELEMENT");
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
        openCustomDialog("OPEN_", $v("P25_PRODUCT_DETAILS_URL"), "P25_PRODUCT_DETAILS_TRIGGER");

        logDebug("function : item region image loading", "E");
    } else if (p_object_ind == "I" && is_divider == "DIVIDER") {
        $s("P25_OBJECT_TYPE", "DIVIDER");
        $s("P25_DIVIDER_NAME", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Desc);
        $s("P25_DIV_HEIGHT", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].H * 100).toFixed(2));
        $s("P25_DIV_WIDTH", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].W * 100).toFixed(2));
        $s("P25_DIV_DEPTH", (g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].D * 100).toFixed(2));
        $s("P25_DIV_ROTATION", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Rotation);
        $s("P25_DIV_COLOR", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Color);
        $s("P25_DIVIDER_FIXED", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Fixed);
        $s("P25_SLOT_DIVIDER", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].SlotDivider);
        $s("P25_SLOT_ORIENTATION", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].Orientation);

        if (p_duplicate_fixel == "N") {
            $s("P25_DIVIDER_ID", g_pog_json[p_pog_index].ModuleInfo[p_module_ind].ShelfInfo[p_shelf_ind].ItemInfo[g_item_index].ItemID);
            $s("P25_ITEM_EDIT_IND", "Y");
            $("#DELETE_DIVIDER").css("display", "inline");
        } else {
            $s("P25_DIVIDER_ID", g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1));
            $s("P25_ITEM_EDIT_IND", "N");
        }
        apex.item("P25_DIVIDER_NAME").setFocus();

        openInlineDialog("add_divider", 75, 85);
    } else if (p_object_ind == "B") {
        open_pog_modal("edit_pog", p_pog_index, p_edit);
        $s("P25_MODULE_DISP", "");
    }
    logDebug("function : open_edit_modal_popup", "E");
}

function hide_show_page_items(p_object_type) {
    logDebug("function : hide_show_page_items; p_object_type : " + p_object_type, "S");
    try {
        if (p_object_type == "SHELF") {
            $("#P25_HEIGHT_CONTAINER").show();
            $("#P25_BASE_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_THICKNESS_CONTAINER").hide();
            $("#P25_UPPER_OVERHANG_CONTAINER").hide();
            $("#P25_WALL_HEIGHT_CONTAINER").hide();
            $("#P25_SNAP_TO_SHELF_CONTAINER").hide();
            $("#P25_BASKET_FILL_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCT_BASKET_CONTAINER").hide();
            $("#P25_LOWER_OVERHANG_CONTAINER").hide();
            $("#P25_LEFT_OVERHANG_CONTAINER").show();
            $("#P25_RIGHT_OVERHANG_CONTAINER").show();
            $("#P25_HORIZ_SPACING_CONTAINER").show();
            $("#P25_HORIZ_START_CONTAINER").hide();
            $("#P25_VERT_START_CONTAINER").hide();
            $("#P25_VERT_SPACING_CONTAINER").hide();
            $("#P25_GRILL_HEIGHT_CONTAINER").show();
            $("#P25_SPACER_THICKNESS_CONTAINER").show();
            $("#P25_HORIZ_GAP_CONTAINER").show();
            $("#P25_SPREAD_PRODUCTS_CONTAINER").show();
            $("#P25_COMBINE_CONTAINER").show();
            $("#P25_ALLOW_AUTO_CRUSH_CONTAINER").show();
            $("#P25_DEPTH_SLOT_START_CONTAINER").hide();
            $("#P25_DEPTH_SLOT_SPACING_CONTAINER").hide();
            $("#P25_CHEST_HORZ_GAP_CONTAINER").hide();
            $("#P25_DEPTH_GAP_CONTAINER").hide();
            $("#P25_ROD_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_MAX_MERCH_CONTAINER").show();
            $("#P25_FRONT_OVERHANG_CONTAINER").hide();
            $("#P25_BACK_OVERHANG_CONTAINER").hide();
            $("#P25_SHELF_OVERLAP_CONTAINER").hide();
            $("#P25_SHELF_SLOPE_CONTAINER").show();
            $("#P25_ROTATION_CONTAINER").show();
            $("#P25_AUTO_PLACING_CONTAINER").hide();
            $("#divider").show();
            $("#shelf_image").show();
            $("#pegboard_image").hide();
            $("#basket_image").hide();
            $("#rod_image").hide();
            $("#hanging_bar_image").hide();
            $("#chest_image").hide();
            $("#pallet_image").hide();
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message("SHELF_LABEL"));
        } else if (p_object_type == "PEGBOARD") {
            $("#P25_HEIGHT_CONTAINER").show();
            $("#P25_SNAP_TO_SHELF_CONTAINER").hide();
            $("#P25_BASKET_FILL_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCT_BASKET_CONTAINER").hide();
            $("#P25_GRILL_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_HEIGHT_CONTAINER").hide();
            $("#P25_BASE_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_THICKNESS_CONTAINER").hide();
            $("#P25_SPACER_THICKNESS_CONTAINER").hide();
            $("#P25_HORIZ_GAP_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_COMBINE_CONTAINER").hide();
            $("#P25_UPPER_OVERHANG_CONTAINER").show();
            $("#P25_LOWER_OVERHANG_CONTAINER").show();
            $("#P25_HORIZ_START_CONTAINER").show();
            $("#P25_VERT_START_CONTAINER").show();
            $("#P25_VERT_SPACING_CONTAINER").show();
            $("#P25_HORIZ_SPACING_CONTAINER").show();
            $("#P25_LEFT_OVERHANG_CONTAINER").show();
            $("#P25_RIGHT_OVERHANG_CONTAINER").show();
            $("#P25_ALLOW_AUTO_CRUSH_CONTAINER").hide();
            $("#P25_CHEST_HORZ_GAP_CONTAINER").hide();
            $("#P25_DEPTH_GAP_CONTAINER").hide();
            $("#P25_ROD_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_MAX_MERCH_CONTAINER").show();
            $("#P25_FRONT_OVERHANG_CONTAINER").hide();
            $("#P25_BACK_OVERHANG_CONTAINER").hide();
            $("#P25_SHELF_OVERLAP_CONTAINER").show();
            $("#P25_SHELF_SLOPE_CONTAINER").show();
            $("#P25_ROTATION_CONTAINER").show();
            $("#P25_AUTO_PLACING_CONTAINER").show();
            $("#divider").hide();
            $("#shelf_image").hide();
            $("#basket_image").hide();
            $("#pegboard_image").show();
            $("#hanging_bar_image").hide();
            $("#chest_image").hide();
            $("#rod_image").hide();
            $("#pallet_image").hide();
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message("PEGBOARD_LABEL"));
        } else if (p_object_type == "HANGINGBAR") {
            $("#P25_HEIGHT_CONTAINER").show();
            $("#P25_SNAP_TO_SHELF_CONTAINER").hide();
            $("#P25_BASKET_FILL_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCT_BASKET_CONTAINER").hide();
            $("#P25_GRILL_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_HEIGHT_CONTAINER").hide();
            $("#P25_BASE_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_THICKNESS_CONTAINER").hide();
            $("#P25_SPACER_THICKNESS_CONTAINER").hide();
            $("#P25_HORIZ_GAP_CONTAINER").show();
            $("#P25_SPREAD_PRODUCTS_CONTAINER").show();
            $("#P25_COMBINE_CONTAINER").show();
            $("#P25_UPPER_OVERHANG_CONTAINER").hide();
            $("#P25_LOWER_OVERHANG_CONTAINER").hide();
            $("#P25_LEFT_OVERHANG_CONTAINER").show();
            $("#P25_RIGHT_OVERHANG_CONTAINER").show();
            $("#P25_ALLOW_AUTO_CRUSH_CONTAINER").hide();
            $("#P25_HORIZ_START_CONTAINER").hide();
            $("#P25_HORIZ_SPACING_CONTAINER").hide();
            $("#P25_VERT_START_CONTAINER").hide();
            $("#P25_VERT_SPACING_CONTAINER").hide();
            $("#P25_CHEST_HORZ_GAP_CONTAINER").hide();
            $("#P25_DEPTH_GAP_CONTAINER").hide();
            $("#P25_ROD_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_MAX_MERCH_CONTAINER").show();
            $("#P25_FRONT_OVERHANG_CONTAINER").hide();
            $("#P25_BACK_OVERHANG_CONTAINER").hide();
            $("#P25_SHELF_OVERLAP_CONTAINER").hide();
            $("#P25_SHELF_SLOPE_CONTAINER").hide();
            $("#P25_ROTATION_CONTAINER").hide();
            $("#P25_AUTO_PLACING_CONTAINER").hide();
            $("#divider").hide();
            $("#shelf_image").hide();
            $("#pegboard_image").hide();
            $("#basket_image").hide();
            $("#hanging_bar_image").show();
            $("#chest_image").hide();
            $("#rod_image").hide();
            $("#pallet_image").hide();
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message("HANGINGBAR_LABEL"));
        } else if (p_object_type == "BASKET") {
            $("#P25_GRILL_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_HEIGHT_CONTAINER").show();
            $("#P25_SNAP_TO_SHELF_CONTAINER").show();
            $("#P25_BASKET_FILL_CONTAINER").show();
            $("#P25_SPREAD_PRODUCT_BASKET_CONTAINER").show();
            $("#P25_HEIGHT_CONTAINER").hide();
            $("#P25_BASE_HEIGHT_CONTAINER").show();
            $("#P25_WALL_THICKNESS_CONTAINER").show();
            $("#P25_SPACER_THICKNESS_CONTAINER").hide();
            $("#P25_HORIZ_GAP_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_COMBINE_CONTAINER").hide();
            $("#P25_LEFT_OVERHANG_CONTAINER").hide();
            $("#P25_RIGHT_OVERHANG_CONTAINER").hide();
            $("#P25_UPPER_OVERHANG_CONTAINER").hide();
            $("#P25_LOWER_OVERHANG_CONTAINER").hide();
            $("#P25_ALLOW_AUTO_CRUSH_CONTAINER").hide();
            $("#P25_HORIZ_START_CONTAINER").hide();
            $("#P25_HORIZ_SPACING_CONTAINER").hide();
            $("#P25_VERT_START_CONTAINER").hide();
            $("#P25_VERT_SPACING_CONTAINER").hide();
            $("#P25_CHEST_HORZ_GAP_CONTAINER").hide();
            $("#P25_DEPTH_GAP_CONTAINER").hide();
            $("#P25_ROD_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_MAX_MERCH_CONTAINER").show();
            $("#P25_FRONT_OVERHANG_CONTAINER").hide();
            $("#P25_BACK_OVERHANG_CONTAINER").hide();
            $("#P25_SHELF_OVERLAP_CONTAINER").hide();
            $("#P25_SHELF_SLOPE_CONTAINER").hide();
            $("#P25_ROTATION_CONTAINER").hide();
            $("#P25_AUTO_PLACING_CONTAINER").hide();
            $("#P25_SNAP_TO_SHELF").addClass("apex_disabled");
            $("#divider").hide();
            $("#shelf_image").hide();
            $("#pegboard_image").hide();
            $("#hanging_bar_image").hide();
            $("#basket_image").show();
            $("#chest_image").hide();
            $("#rod_image").hide();
            $("#pallet_image").hide();
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message("BASKET_LABEL"));
        } else if (p_object_type == "CHEST") {
            $("#P25_GRILL_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_HEIGHT_CONTAINER").show();
            $("#P25_SNAP_TO_SHELF_CONTAINER").hide();
            $("#P25_BASKET_FILL_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCT_BASKET_CONTAINER").hide();
            $("#P25_HEIGHT_CONTAINER").hide();
            $("#P25_BASE_HEIGHT_CONTAINER").show();
            $("#P25_WALL_THICKNESS_CONTAINER").show();
            $("#P25_SPACER_THICKNESS_CONTAINER").hide();
            $("#P25_HORIZ_GAP_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_COMBINE_CONTAINER").hide();
            $("#P25_LEFT_OVERHANG_CONTAINER").hide();
            $("#P25_RIGHT_OVERHANG_CONTAINER").hide();
            $("#P25_UPPER_OVERHANG_CONTAINER").hide();
            $("#P25_LOWER_OVERHANG_CONTAINER").hide();
            $("#P25_ALLOW_AUTO_CRUSH_CONTAINER").hide();
            $("#P25_HORIZ_START_CONTAINER").hide();
            $("#P25_HORIZ_SPACING_CONTAINER").hide();
            $("#P25_VERT_START_CONTAINER").hide();
            $("#P25_VERT_SPACING_CONTAINER").hide();
            $("#P25_DEPTH_SLOT_START_CONTAINER").show();
            $("#P25_DEPTH_SLOT_SPACING_CONTAINER").show();
            $("#P25_CHEST_HORZ_GAP_CONTAINER").show();
            $("#P25_DEPTH_GAP_CONTAINER").hide();
            $("#P25_ROD_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_MAX_MERCH_CONTAINER").show();
            $("#P25_FRONT_OVERHANG_CONTAINER").hide();
            $("#P25_BACK_OVERHANG_CONTAINER").hide();
            $("#P25_SHELF_OVERLAP_CONTAINER").hide();
            $("#P25_SHELF_SLOPE_CONTAINER").hide();
            $("#P25_ROTATION_CONTAINER").hide();
            $("#P25_AUTO_PLACING_CONTAINER").hide();
            $("#divider").show();
            $("#shelf_image").hide();
            $("#pegboard_image").hide();
            $("#hanging_bar_image").hide();
            $("#basket_image").hide();
            $("#rod_image").hide();
            $("#chest_image").show();
            $("#pallet_image").hide();
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message("CHEST_LABEL"));
        } else if (p_object_type == "ROD") {
            $("#P25_GRILL_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_HEIGHT_CONTAINER").hide();
            $("#P25_SNAP_TO_SHELF_CONTAINER").hide();
            $("#P25_BASKET_FILL_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCT_BASKET_CONTAINER").hide();
            $("#P25_HEIGHT_CONTAINER").show();
            $("#P25_BASE_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_THICKNESS_CONTAINER").hide();
            $("#P25_SPACER_THICKNESS_CONTAINER").hide();
            $("#P25_HORIZ_GAP_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_COMBINE_CONTAINER").hide();
            $("#P25_LEFT_OVERHANG_CONTAINER").hide();
            $("#P25_RIGHT_OVERHANG_CONTAINER").hide();
            $("#P25_UPPER_OVERHANG_CONTAINER").hide();
            $("#P25_LOWER_OVERHANG_CONTAINER").hide();
            $("#P25_ALLOW_AUTO_CRUSH_CONTAINER").hide();
            $("#P25_HORIZ_START_CONTAINER").hide();
            $("#P25_HORIZ_SPACING_CONTAINER").hide();
            $("#P25_VERT_START_CONTAINER").hide();
            $("#P25_VERT_SPACING_CONTAINER").hide();
            $("#P25_CHEST_HORZ_GAP_CONTAINER").hide();
            $("#P25_DEPTH_GAP_CONTAINER").show();
            $("#P25_ROD_SPREAD_PRODUCTS_CONTAINER").show();
            $("#P25_MAX_MERCH_CONTAINER").hide();
            $("#P25_FRONT_OVERHANG_CONTAINER").hide();
            $("#P25_BACK_OVERHANG_CONTAINER").hide();
            $("#P25_SHELF_OVERLAP_CONTAINER").hide();
            $("#P25_SHELF_SLOPE_CONTAINER").hide();
            $("#P25_ROTATION_CONTAINER").hide();
            $("#P25_AUTO_PLACING_CONTAINER").hide();
            $("#divider").hide();
            $("#shelf_image").hide();
            $("#pegboard_image").hide();
            $("#hanging_bar_image").hide();
            $("#basket_image").hide();
            $("#rod_image").show();
            $("#chest_image").hide();
            $("#pallet_image").hide();
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message("ROD_LABEL"));
        } else if (p_object_type == "PALLET") {
            $("#P25_GRILL_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_HEIGHT_CONTAINER").hide();
            $("#P25_SNAP_TO_SHELF_CONTAINER").hide();
            $("#P25_BASKET_FILL_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCT_BASKET_CONTAINER").hide();
            $("#P25_HEIGHT_CONTAINER").show();
            $("#P25_BASE_HEIGHT_CONTAINER").hide();
            $("#P25_WALL_THICKNESS_CONTAINER").hide();
            $("#P25_SPACER_THICKNESS_CONTAINER").hide();
            $("#P25_HORIZ_GAP_CONTAINER").hide();
            $("#P25_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_COMBINE_CONTAINER").hide();
            $("#P25_LEFT_OVERHANG_CONTAINER").show();
            $("#P25_RIGHT_OVERHANG_CONTAINER").show();
            $("#P25_UPPER_OVERHANG_CONTAINER").hide();
            $("#P25_LOWER_OVERHANG_CONTAINER").hide();
            $("#P25_ALLOW_AUTO_CRUSH_CONTAINER").hide();
            $("#P25_HORIZ_START_CONTAINER").hide();
            $("#P25_HORIZ_SPACING_CONTAINER").hide();
            $("#P25_VERT_START_CONTAINER").hide();
            $("#P25_VERT_SPACING_CONTAINER").hide();
            $("#P25_CHEST_HORZ_GAP_CONTAINER").show();
            $("#P25_DEPTH_GAP_CONTAINER").hide();
            $("#P25_ROD_SPREAD_PRODUCTS_CONTAINER").hide();
            $("#P25_MAX_MERCH_CONTAINER").show();
            $("#P25_FRONT_OVERHANG_CONTAINER").show();
            $("#P25_BACK_OVERHANG_CONTAINER").show();
            $("#P25_DEPTH_SLOT_START_CONTAINER").show();
            $("#P25_DEPTH_SLOT_SPACING_CONTAINER").show();
            $("#P25_SHELF_OVERLAP_CONTAINER").hide();
            $("#P25_SHELF_SLOPE_CONTAINER").hide();
            $("#P25_ROTATION_CONTAINER").hide();
            $("#P25_AUTO_PLACING_CONTAINER").hide();
            $("#divider").show();
            $("#shelf_image").hide();
            $("#pegboard_image").hide();
            $("#hanging_bar_image").hide();
            $("#basket_image").hide();
            $("#chest_image").hide();
            $("#rod_image").hide();
            $("#pallet_image").show();
            $('[aria-describedby="add_shelf"] span.ui-dialog-title').text(get_message("PALLET_LABEL"));
        }
        logDebug("function : hide_show_page_items", "E");
    } catch (err) {
        error_handling(err);
    }
}

function create_pog_modal(p_bar_class, p_icon_class, p_modal_id) {
    logDebug("function : create_pog_modal; bar_class : " + p_bar_class + "; icon_class : " + p_icon_class + "; modal_id : " + p_modal_id, "S");
    try {
        $s("P25_DRAFT_LIST", "");
        $s("P25_POG_DESCRIPTION", "");
        $s("P25_EXISTING_DRAFT_VER", "");

        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_pog_edited_ind == "Y") {
            apex.event.trigger("#P25_COL_FLEX_LOV_1", "apexrefresh");
            apex.event.trigger("#P25_COL_FLEX_LOV_2", "apexrefresh");
            apex.event.trigger("#P25_COL_FLEX_LOV_3", "apexrefresh");
            apex.event.trigger("#P25_COL_FLEX_LOV_4", "apexrefresh");
            apex.event.trigger("#P25_COL_FLEX_LOV_5", "apexrefresh");
            apex.event.trigger("#P25_COL_FLEX_LOV_6", "apexrefresh");

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

            // ax_message.confirm(get_message("POGCR_CHANGE_REVERT_WARN"), function (e) {
            //     if (e) {
            //         $("#chng_view_btn").css("display", "none");
            //         $("#pog_list_btn").css("display", "none");

            //         g_scene_objects = [];
            //         g_canvas_objects = [];
            //         g_pog_index = 0;
            //         g_multi_pog_json = [];
            //         appendMultiCanvasRowCol(1);
            //         g_pog_json = [];
            //         g_module_obj_array = [];
            //         init(0);
            //         objects = {};
            //         objects["scene"] = g_scene;
            //         objects["renderer"] = g_renderer;
            //         g_scene_objects.push(objects);
            //         try {
            //             open_modal(p_bar_class, p_icon_class, p_modal_id);
            //         } catch (err) {
            //             error_handling(err);
            //         }
            //         if (apex.region("draggable_table") !== null) {
            //             save_pog_to_json(g_pog_json);
            //             apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
            //             apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
            //         }
            //     }
            // });

            confirm(get_message("POGCR_CHANGE_REVERT_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
                $("#chng_view_btn").css("display", "none");
                $("#pog_list_btn").css("display", "none");

                g_scene_objects = [];
                g_canvas_objects = [];
                g_pog_index = 0;
                g_multi_pog_json = [];
                appendMultiCanvasRowCol(1);
                g_pog_json = [];
                g_module_obj_array = [];
                init(0);
                objects = {};
                objects["scene"] = g_scene;
                objects["renderer"] = g_renderer;
                g_scene_objects.push(objects);
                try {
                    open_modal(p_bar_class, p_icon_class, p_modal_id);
                } catch (err) {
                    error_handling(err);
                }
                if (apex.region("draggable_table") !== null) {
                    save_pog_to_json(g_pog_json);
                    apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
                    apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                }
            });

            //Task_29818 - End
        } else {
            $("#chng_view_btn").css("display", "none");
            $("#pog_list_btn").css("display", "none");
            g_scene_objects = [];
            g_canvas_objects = [];
            g_pog_index = 0;
            g_multi_pog_json = [];
            appendMultiCanvasRowCol(1);
            g_pog_json = [];
            g_module_obj_array = [];
            init(0);
            objects = {};
            objects["scene"] = g_scene;
            objects["renderer"] = g_renderer;
            g_scene_objects.push(objects);
            try {
                open_modal(p_bar_class, p_icon_class, p_modal_id);
            } catch (err) {
                error_handling(err);
            }
            if (apex.region("draggable_table") !== null) {
                save_pog_to_json(g_pog_json);
                apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
                apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                apex.region("draggable_table").refresh();
            }
        }
        logDebug("function : create_pog_modal", "E");
    } catch (err) {
        error_handling(err);
    }
}

function set_shelf_values(p_module_index, p_shelf_index, p_dup_fixel, p_mod_disp, p_shelf_edit, p_duplicating, p_item_edit_flag, p_object_type, p_shelf_id, p_pog_index) {
    var shelf_arr = [];
    var shelf_dtl = {};
    var shlf_names = [];
    if (typeof g_pog_json !== "undefined" && g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length > 0) {
        var i = 0;
        for (const Shelf of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
            if (p_shelf_index !== i && p_shelf_index !== -1) {
                shlf_names.push(Shelf.Shelf.toUpperCase());
            }
            i++;
        }
    }
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
        shelf_dtl["POGLen"] = g_pog_json.length;
        shelf_dtl["POGCode"] = g_pog_json[p_pog_index].POGCode;
        shelf_dtl["Module"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Module;
        shelf_dtl["ShelfLen"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length;
        shelf_dtl["ModW"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].W;
        shelf_dtl["ModH"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].W;
        shelf_dtl["ModD"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].D;
        shelf_dtl["ModX"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].X;
        shelf_dtl["ShelfInfo"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
    } else {
        shelf_dtl["POGLen"] = 0;
        shelf_dtl["POGCode"] = "";
        shelf_dtl["Module"] = "A";
        shelf_dtl["ShelfLen"] = 0;
        shelf_dtl["ModW"] = 0;
        shelf_dtl["ModH"] = 0;
        shelf_dtl["ModD"] = 0;
        shelf_dtl["ModX"] = 0;
        shelf_dtl["ShelfInfo"] = [];
    }
    shelf_dtl["Shelf"] = p_shelf_id;
    shelf_dtl["module_index"] = p_module_index;
    shelf_dtl["shelf_index"] = p_shelf_index;
    shelf_dtl["duplicate_fixel"] = p_dup_fixel;
    shelf_dtl["mod_disp_ind"] = p_mod_disp;
    shelf_dtl["edited_ind"] = p_shelf_edit;
    shelf_dtl["g_duplicating"] = p_duplicating;
    shelf_dtl["i_item_edit_flag"] = p_item_edit_flag;
    shelf_dtl["object_type"] = p_object_type;
    shelf_dtl["ShlfNames"] = shlf_names;
    shelf_dtl["ManualCrush"] = $v("P25_POGCR_MANUAL_CRUSH_ITEM");
    shelf_arr.push(shelf_dtl);
    sessionStorage.setItem("shelf_arr", JSON.stringify(shelf_arr));
}

function open_modal(p_bar_class, p_icon_class, p_modal_id) {
    logDebug("function : open_modal; bar_class : " + p_bar_class + "; icon_class : " + p_icon_class + "; modal_id : " + p_modal_id, "S");

    $(".top_icon").removeClass("active");
    $(".left_icon").removeClass("active");
    $(" ." + p_icon_class).addClass("active");
    $s("P25_SHELF_EDIT_IND", "N");

    g_dblclick_opened = "Y";
    g_shelf_edit_flag = "N";
    g_module_edit_flag = "N";

    //ASA-1694, added p_icon_class !== "create_template"
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && p_icon_class !== "create_pog" && p_icon_class !== "create_module" && p_icon_class !== "create_template") {
        if (g_module_index == -1) {
            //&& p_icon_class !== "create_module" && p_icon_class !== "create_pog" //ASA-1694
            if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                var i = 0;
                for (const modules of g_pog_json[g_pog_index].ModuleInfo) {
                    if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                        g_module_index = i;
                        break; //return false;
                    }
                    i++;
                }
            }
        }
        var open_popup = "N";
        var shelf_id = g_pog_json[g_pog_index].ModuleInfo[g_module_index].Module + (g_pog_json[g_pog_index].ModuleInfo[g_module_index].ShelfInfo.length + 1);
        $s("P25_ID", shelf_id);
        if (p_icon_class !== "create_rod") $s("P25_WIDTH", (g_pog_json[g_pog_index].ModuleInfo[g_module_index].W * 100).toFixed(2));

        if (p_icon_class == "create_pegboard" && p_icon_class !== "create_divider") $s("P25_DEPTH", 1);
        else $s("P25_DEPTH", (g_pog_json[g_pog_index].ModuleInfo[g_module_index].D * 100).toFixed(2));
    }
    if (p_icon_class == "create_shelf") {
        set_shelf_values(g_module_index, -1, "N", $v("P25_MODULE_DISP"), $v("P25_SHELF_EDIT_IND"), g_duplicating, g_item_edit_flag, "SHELF", shelf_id, g_pog_index);
        open_popup = "Y";
        g_dblclick_opened = "N";
    } else if (p_icon_class == "create_pegboard") {
        $s("P25_OBJ_NAME", `${get_message("PEGBOARD_LABEL")}`);
        set_shelf_values(g_module_index, -1, "N", $v("P25_MODULE_DISP"), $v("P25_SHELF_EDIT_IND"), g_duplicating, g_item_edit_flag, "PEGBOARD", shelf_id, g_pog_index);
        open_popup = "Y";
        g_dblclick_opened = "N";
    } else if (p_icon_class == "create_hangingbar") {
        set_shelf_values(g_module_index, -1, "N", $v("P25_MODULE_DISP"), $v("P25_SHELF_EDIT_IND"), g_duplicating, g_item_edit_flag, "HANGINGBAR", shelf_id, g_pog_index);
        open_popup = "Y";
        g_dblclick_opened = "N";
    } else if (p_icon_class == "create_text") {
        //ASA-1669 Start
        const warPageItem = ["P25_TEXT_WIDTH", "P25_TEXT_HEIGHT", "P25_TEXT_COLOR", "P25_TEXT_SLOPE", "P25_TEXT_ROTATION", "P25_FONT_STYLE", "P25_FONT_SIZE", "P25_BOLD", "P25_TEXT", "P25_WRAP_TEXT", "P25_REDUCETOFIT", "P25_IMG_FILENAME"];
        for (const pageItem of warPageItem) {
            $("#" + pageItem + "_CONTAINER .inc_tag_icon").remove();
            $("#" + pageItem).removeClass("apex-item-has-icon");
            $("#" + pageItem + "_CONTAINER").removeClass("apex-item-wrapper--has-icon");
        }
        $s("P25_IMG_FILENAME", "");
        $("#IMAGE_AREA canvas").remove();
        $("#VIEW_IMAGE canvas").remove();
        //ASA-1669 End
        g_dblclick_opened = "Y";
        $s("P25_OBJECT_TYPE", "TEXTBOX");
        $s("P25_TEXT_ID", "");
        $("#DELETE_TEXT").css("display", "none");
        $("#REMOVE_IMAGE").css("display", "none");
        g_temp_image_arr = [];
        $("#IMAGE_AREA canvas").remove();
        $s("P25_IMG_FILENAME", "");
        $("#VIEW_IMAGE canvas").remove();
        $s("P25_TEXT", "");
        $s("P25_TEXT_HEIGHT", 0);
        $s("P25_TEXT_NAME", "");
        $s("P25_TEXT_COLOR", "#EBE6EB");
        $s("P25_WRAP_TEXT", "Y");
        $s("P25_REDUCETOFIT", "Y");
        $s("P25_TEXT_DIRECTION", "H");
        $s("P25_TEXT_ROTATION", 0);
        $s("P25_TEXT_SLOPE", 0);
        $s("P25_TEXT_WIDTH", (g_pog_json[g_pog_index].ModuleInfo[g_module_index].W * 100).toFixed(2));
    } else if (p_icon_class == "create_basket") {
        set_shelf_values(g_module_index, -1, "N", $v("P25_MODULE_DISP"), $v("P25_SHELF_EDIT_IND"), g_duplicating, g_item_edit_flag, "BASKET", shelf_id, g_pog_index);
        open_popup = "Y";
        g_dblclick_opened = "N";
    } else if (p_icon_class == "create_chest") {
        set_shelf_values(g_module_index, -1, "N", $v("P25_MODULE_DISP"), $v("P25_SHELF_EDIT_IND"), g_duplicating, g_item_edit_flag, "CHEST", shelf_id, g_pog_index);
        open_popup = "Y";
        g_dblclick_opened = "N";
    } else if (p_icon_class == "create_rod") {
        set_shelf_values(g_module_index, -1, "N", $v("P25_MODULE_DISP"), $v("P25_SHELF_EDIT_IND"), g_duplicating, g_item_edit_flag, "ROD", shelf_id, g_pog_index);
        open_popup = "Y";
        g_dblclick_opened = "N";
    } else if (p_icon_class == "create_pallet") {
        set_shelf_values(g_module_index, -1, "N", $v("P25_MODULE_DISP"), $v("P25_SHELF_EDIT_IND"), g_duplicating, g_item_edit_flag, "PALLET", shelf_id, g_pog_index);
        open_popup = "Y";
        g_dblclick_opened = "N";
    } else if (p_icon_class == "create_divider") {
        g_dblclick_opened = "Y";
        $s("P25_OBJECT_TYPE", "DIVIDER");
        $s("P25_DIVIDER_NAME", "");
        $s("P25_DIV_HEIGHT", 0);
        $s("P25_DIV_WIDTH", 0);
        $s("P25_DIV_DEPTH", 0);
        $s("P25_DIV_ROTATION", 0);
        $s("P25_DIV_COLOR", "#3D393D");
        $s("P25_DIVIDER_ID", shelf_id);
        $("#DELETE_DIVIDER").css("display", "none");
        $s("P25_ITEM_EDIT_IND", "N");
    } else if (p_icon_class == "create_module") {
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            var last_module = -1;
            var i = 0;
            for (const modules of g_pog_json[g_pog_index].ModuleInfo) {
                if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                    last_module = i;
                }
                i++;
            }
            if (last_module !== -1) {
                if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {
                    var next_name = nextLetter(g_pog_json[g_pog_index].ModuleInfo[last_module].Module);
                } else {
                    var next_name = last_module + 1;
                }
            } else {
                if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {
                    var next_name = "a";
                } else {
                    var next_name = 1;
                }
            }
        } else {
            if ($v("P25_POG_MODULE_NAME_TYPE") == "A") {
                var next_name = "A";
            } else {
                var next_name = 1;
            }
        }

        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            var mod_names = [];
            for (const Module of g_pog_json[g_pog_index].ModuleInfo) {
                mod_names.push(Module.Module.toUpperCase());
            }
            var module_list = [];
            var module_detail = {};
            module_detail["TextHeight"] = "0";
            module_detail["PogModule"] = next_name;
            module_detail["NotchW"] = $v("P25_POG_NOTCH_WIDTH");
            module_detail["Nstart"] = $v("P25_POG_NOTCH_START"); //ASA-1268
            module_detail["Nspacing"] = $v("P25_POG_NOTCH_SPACING");
            module_detail["HorzStart"] = $v("P25_HORZ_START");
            module_detail["HorzSpacing"] = $v("P25_HORZ_SPACING");
            module_detail["VertStart"] = $v("P25_POG_VERT_START");
            module_detail["VertSpacing"] = $v("P25_POG_VERT_SPACING");
            module_detail["H"] = ((g_pog_json[g_pog_index].H - g_pog_json[g_pog_index].BaseH) * 100).toFixed(2);
            module_detail["Color"] = $v("P25_POG_MODULE_DEFAULT_COLOR");
            module_detail["D"] = (g_pog_json[g_pog_index].D * 100).toFixed(2);
            module_detail["W"] = (g_pog_json[g_pog_index].SegmentW * 100).toFixed(2);
            module_detail["ModNames"] = mod_names;
            module_detail["Division"] = g_pog_json[g_pog_index].Division;
            module_detail["Dept"] = g_pog_json[g_pog_index].Dept;
            module_detail["Subdept"] = g_pog_json[g_pog_index].SubDept;
            module_detail["Type"] = "N";
            module_list.push(module_detail);
            sessionStorage.setItem("modulelist", JSON.stringify(module_list));
            $s("P25_MODULE_EDIT_IND", "N");
            g_dblclick_opened = "N";
            open_popup = "Y";
            openCustomDialog("create_module", $v("P25_CREATE_MODAL_URL"), "P25_MODALPOG_TRIGGER");
        }
    } else if (p_icon_class == "create_pog" || p_icon_class == "create_template") {
        open_popup = "Y";
        g_dblclick_opened = "N";
        sessionStorage.removeItem("openpogjson");
        sessionStorage.removeItem("fixtureDimension"); //ASA-1694
        var pUrl = p_icon_class == "create_pog" ? $v("P25_POG_URL") : $v("P25_POG_TEMPLATE_URL"); //ASA-1694
        apex.server.process(
            "DELETE_ITEMS_COLL",
            {
                x01: "",
            },
            {
                dataType: "text",
                success: async function (pData) {
                    openCustomDialog("CREATE_POG", pUrl, "P25_POG_TRIGGER_ELEMENT");
                },
                loadingIndicatorPosition: "page",
            }
        );
    }
    if (open_popup == "N") {
        openInlineDialog(p_modal_id, 75, 85);
    } else {
        if (p_icon_class !== "create_pog" && p_icon_class !== "create_module" && typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            openCustomDialog("SHELF_EDIT", $v("P25_SHELF_URL"), "P25_SHELF_TRIGGER_ELEMENT");
        }
    }

    logDebug("function : open_modal", "E");
}

async function update_multi_pog_edit(p_pog_info) {
    for (const pogs of g_pog_json) {
        pogs.Flex_Text_1 = p_pog_info[0].Flex_Text_1; //ASA-1374 variable is wrong declare pogInfo[0]---> p_pog_info -S
        pogs.Flex_Text_2 = p_pog_info[0].Flex_Text_2;
        pogs.Flex_Text_3 = p_pog_info[0].Flex_Text_3;
        pogs.Flex_Text_4 = p_pog_info[0].Flex_Text_4;
        pogs.Flex_Text_11 = p_pog_info[0].Flex_Text_11; //ASA-1531
        pogs.Flex_Text_12 = p_pog_info[0].Flex_Text_12; //ASA-1531
        pogs.Flex_Text_13 = p_pog_info[0].Flex_Text_13; //ASA-1531
        pogs.Flex_Lov_1 = p_pog_info[0].Flex_Lov_1;
        pogs.Flex_Lov_2 = p_pog_info[0].Flex_Lov_2;
        pogs.Flex_Lov_3 = p_pog_info[0].Flex_Lov_3;
        pogs.Flex_Lov_4 = p_pog_info[0].Flex_Lov_4;
        pogs.Flex_Lov_5 = p_pog_info[0].Flex_Lov_5;
        pogs.Flex_Lov_6 = p_pog_info[0].Flex_Lov_6; //ASA-1374 -E
    }
    g_dblclick_opened = "N";
    apex.message.showPageSuccess(g_pog_refresh_msg);
}

//this fucntion is called when edit a POG or create new POG.
async function create_pog() {
    logDebug("function : create_pog", "S");
    try {
        var HeadInfo = {};
        var pogInfo = [];
        pogInfo = sessionStorage.getItem("openpogjson") !== null ? JSON.parse(sessionStorage.getItem("openpogjson")) : [];
        g_upload_file_flag = pogInfo[0].fileUPloadedFlag;
        var uuid = apex.item("P25_POG_CODE").getValue();
        var edited = $v("P25_POG_EDIT_IND");
        var colorValue = parseInt(pogInfo[0].Color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        g_temp_POG_arr = JSON.stringify(g_pog_json);
        var baseY,
            edit_base = "N",
            pog_recreate = "N",
            edited_pogcode,
            edit_hier = "N",
            x,
            y;
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            HeadInfo = g_pog_json[g_pog_index];
            edited_pogcode = g_pog_json[g_pog_index].POGCode;
            edited = "Y";
            if (g_pog_json[g_pog_index].BaseW !== parseFloat($v("P25_POG_BASE_WIDTH")) / 100 || g_pog_json[g_pog_index].BaseH !== parseFloat($v("P25_POG_BASE_HEIGHT")) / 100) {
                edit_base = "Y";
            }
        } else {
            g_pog_json = [];
            edited = "N";
            sessionStorage.setItem("pog_opened", "N");
        }

        if (edited == "Y") {
            pog_recreate = pogInfo[0].pog_recreate;
            var i = 0;
            for (const Module of g_pog_json[g_pog_index].ModuleInfo) {
                if (Module.ParentModule == null || Module.ParentModule == "undefined") {
                    g_pog_json[g_pog_index].ModuleInfo[i].SubDept = pogInfo[0].SubDept;
                }
                i++;
            }
            if (g_pog_json[g_pog_index].Division !== pogInfo[0].Division || g_pog_json[g_pog_index].Dept !== pogInfo[0].Dept || g_pog_json[g_pog_index].SubDept !== pogInfo[0].SubDept) {
                edit_hier = "Y";
            }
        } else {
            pog_recreate = "Y";
        }

        if (edited == "Y") {
            var retval = await get_pog_exist_flag(pogInfo[0].POGCode, g_pog_json[g_pog_index].POGCode);
        } else {
            retval = "N"; //ASA-1390 TASK 2 //'Y' set the N for the created New POG. //ASA-1360 issue 4
        }

        $s("P25_OPEN_POG_CODE", pogInfo[0].POGCode);
        if (g_autofill_detail["AFVersion"] != "undefined") {
            g_autofill_detail["AFPOGCode"] = $v("P25_OPEN_POG_CODE");
        } //ASA-1694

        //ASA-1945 Issue3 Start
        var modulesList = (g_pog_json && g_pog_json[g_pog_index] && g_pog_json[g_pog_index]?.ModuleInfo) ? g_pog_json[g_pog_index]?.ModuleInfo : [];
        var topLevelModuleCount = 0;
        for (var i = 0; i < modulesList?.length; i++) {
            var mod = modulesList[i];
            if (!mod) continue;
            if (mod.ParentModule == null) {
                topLevelModuleCount++;
            }
        }
        if (parseFloat(pogInfo[0]?.PogSegmentWidth) * topLevelModuleCount > parseFloat(pogInfo[0]?.PogWidth)) { //(Regression Issue Fix)
            HeadInfo["W"] = (parseFloat(pogInfo[0]?.PogSegmentWidth) * topLevelModuleCount) / 100;
        } else {
            HeadInfo["W"] = parseFloat(pogInfo[0]?.PogWidth) / 100;
        }
        //ASA-1945 Issue3 End

        HeadInfo["NewPOG"] = retval;
        HeadInfo["DesignType"] = "D";
        HeadInfo["Action"] = "C";
        HeadInfo["POGCode"] = pogInfo[0].POGCode;
        HeadInfo["Version"] = HeadInfo["Version"];
        HeadInfo["Opened"] = "N";
        HeadInfo["Name"] = pogInfo[0].Name;
        HeadInfo["Division"] = pogInfo[0].Division;
        HeadInfo["Dept"] = pogInfo[0].Dept;
        HeadInfo["SubDept"] = pogInfo[0].SubDept;
        HeadInfo["Type"] = pogInfo[0].Type;
        HeadInfo["H"] = parseFloat(pogInfo[0].PogHeight) / 100;
        // HeadInfo["W"] = parseFloat(pogInfo[0].PogWidth) / 100;
        HeadInfo["D"] = parseFloat(pogInfo[0].PogDepth) / 100;
        HeadInfo["BackDepth"] = parseFloat(pogInfo[0].BackDepth) / 100;
        HeadInfo["SegmentW"] = parseFloat(pogInfo[0].PogSegmentWidth) / 100;
        HeadInfo["TrafficFlow"] = pogInfo[0].TrafficFlow;
        HeadInfo["BaseH"] = parseFloat(pogInfo[0].BaseH) / 100;
        HeadInfo["BaseW"] = parseFloat(pogInfo[0].BaseW) / 100;
        HeadInfo["BaseD"] = parseFloat(pogInfo[0].BaseD) / 100;
        HeadInfo["NotchW"] = parseFloat(pogInfo[0].NotchW) / 100;
        HeadInfo["NotchStart"] = parseFloat(pogInfo[0].NotchStart) / 100; //ASA-1268
        HeadInfo["NotchSpacing"] = parseFloat(pogInfo[0].NotchSpacing) / 100;
        HeadInfo["Color"] = pogInfo[0].Color;
        HeadInfo["HorzStart"] = parseFloat(pogInfo[0].HorzStart) / 100;
        HeadInfo["HorzSpacing"] = parseFloat(pogInfo[0].HorzSpacing) / 100;
        HeadInfo["VertStart"] = parseFloat(pogInfo[0].VertStart) / 100;
        HeadInfo["VertSpacing"] = parseFloat(pogInfo[0].VertSpacing) / 100;
        HeadInfo["AllowOverlap"] = pogInfo[0].AllowOverlap;
        HeadInfo["SpecialType"] = pogInfo[0].SpecialType;
        HeadInfo["SpecialTypeDesc"] = pogInfo[0].SpecialTypeDesc;
        HeadInfo["DisplayMeterage"] = pogInfo[0].DisplayMeterage;
        HeadInfo["RPTMeterage"] = pogInfo[0].RPTMeterage;
        HeadInfo["EffStartDate"] = pogInfo[0].EffStartDate;
        HeadInfo["BrandGroupID"] = pogInfo[0].BrandGroupID;
        HeadInfo["Remarks"] = pogInfo[0].Remarks;
        HeadInfo["FixtureGeneration"] = pogInfo[0].FixtureGeneration;
        HeadInfo["FixtureFamily"] = pogInfo[0].FixtureFamily;
        HeadInfo["FixtureFamilyHidden"] = pogInfo[0].FixtureFamilyHidden;
        HeadInfo["FixtureType"] = pogInfo[0].FixtureType.toString().split("-")[0].trim();
        HeadInfo["FixtureTypeDesc"] = pogInfo[0].FixtureTypeDesc; //ASA-1694
        HeadInfo["FixtureCodes"] = pogInfo[0].FixtureCodes; //ASA-1694
        HeadInfo["FixtureCount"] = pogInfo[0].FixtureCount; //ASA-1694
        HeadInfo["Flex_Text_1"] = pogInfo[0].Flex_Text_1;
        HeadInfo["Flex_Text_2"] = pogInfo[0].Flex_Text_2;
        HeadInfo["Flex_Text_3"] = pogInfo[0].Flex_Text_3;
        HeadInfo["Flex_Text_4"] = pogInfo[0].Flex_Text_4;
        HeadInfo["Flex_Text_11"] = pogInfo[0].Flex_Text_11;
        HeadInfo["Flex_Text_12"] = pogInfo[0].Flex_Text_12;
        HeadInfo["Flex_Text_13"] = pogInfo[0].Flex_Text_13;
        HeadInfo["Flex_Text_15"] = pogInfo[0].Flex_Text_15;    // ASA-1990 Req 3
        HeadInfo["StoreFormat"] = pogInfo[0].StoreFormat;    // ASA-1990 Req 3
        HeadInfo["Flex_Lov_1"] = pogInfo[0].Flex_Lov_1;
        HeadInfo["Flex_Lov_2"] = pogInfo[0].Flex_Lov_2;
        HeadInfo["Flex_Lov_3"] = pogInfo[0].Flex_Lov_3;
        HeadInfo["Flex_Lov_4"] = pogInfo[0].Flex_Lov_4;
        HeadInfo["Flex_Lov_5"] = pogInfo[0].Flex_Lov_5;
        HeadInfo["Flex_Lov_6"] = pogInfo[0].Flex_Lov_6;
        HeadInfo["StoreSegment"] = pogInfo[0].StoreSegment;
        HeadInfo["Desc7"] = pogInfo[0].Desc7;
        HeadInfo["Area"] = pogInfo[0].Area;
        HeadInfo["PLNDept"] = pogInfo[0].PLNDept;
        HeadInfo["ModuleDIR"] = pogInfo[0].ModuleDIR;
        HeadInfo["Direction"] = pogInfo[0].Direction;
        HeadInfo["OrderType"] = pogInfo[0].OrderType;
        HeadInfo["StartOneFixel"] = pogInfo[0].StartOneFixel;
        HeadInfo["StartOneModuleLoc"] = pogInfo[0].StartOneModuleLoc;
        HeadInfo["Ignore"] = pogInfo[0].IGNORE; //
        HeadInfo["IncludeModName"] = pogInfo[0].IncludeModName;
        HeadInfo["PromStartDt"] = pogInfo[0].PromStartDt; // ASA-1202
        HeadInfo["PromEndDt"] = pogInfo[0].PromEndDt; // ASA-1202
        HeadInfo["PromName"] = pogInfo[0].PromName; // ASA-1202
        HeadInfo["PDFTemplateName"] = pogInfo[0].PDFTemplateName; // ASA-1876
        HeadInfo["ComparePogVersion"] = pogInfo[0].ComparePogVersion; // ASA-2009
        HeadInfo["Separator"] = pogInfo[0].SEPARATOR; //
        HeadInfo["LeadingText"] = pogInfo[0].LeadingText;
        HeadInfo["TrailingText"] = pogInfo[0].TrailingText;
        HeadInfo["Category"] = pogInfo[0].Category;
        HeadInfo["SubCategory"] = pogInfo[0].SubCategory;
        HeadInfo["SalesRrshDtl"] = pogInfo[0].SalesRrshDtl;
        HeadInfo["Cal_Width"] = 0;
        HeadInfo["Cal_height"] = 0;

        if (edited == "N") {
            HeadInfo["ModuleInfo"] = [];
            g_pog_json.push(HeadInfo);
            g_module_index = 0;
        } else {
            g_pog_json[g_pog_index] = HeadInfo;
        }

        x = HeadInfo["W"] / 2;
        y = HeadInfo["H"] / 2 - HeadInfo["BaseH"] / 2 + HeadInfo["BaseH"];
        HeadInfo["X"] = x;
        HeadInfo["Y"] = y;
        baseY = parseFloat(HeadInfo["BaseH"]) / 2;
        $s("25_OPEN_POG_CODE", pogInfo[0].POGCode);

        //create base
        if (HeadInfo["BaseH"] > 0) {
            var return_val = add_pog_base("BASE1", HeadInfo["BaseW"], HeadInfo["BaseH"], HeadInfo["BaseD"], hex_decimal, x, baseY, edited, g_pog_index);
        }
        if (pog_recreate == "Y") {
            async function doSomething() {
                //identify if any change in POG
                g_pog_edited_ind = "Y";
                let result = await add_pog(HeadInfo["POGCode"], HeadInfo["W"], HeadInfo["H"], HeadInfo["D"], HeadInfo["Color"], hex_decimal, HeadInfo["X"], HeadInfo["Y"], edited, g_camera, g_pog_index);
                render(g_pog_index);
                if ((g_show_live_image = "Y")) {
                    animate_pog(g_pog_index);
                }
                logDebug("function : create_pog", "E");
            }
            doSomething();
        }
        if (edit_hier == "Y") {
            save_pog_to_json(g_pog_json);
        }

        $(".create_module").css("visibility", "visible");
        $(".create_shelf").css("visibility", "visible");
        $(".create_pegboard").css("visibility", "visible");
        $(".create_text").css("visibility", "visible");
        $(".create_hangingbar").css("visibility", "visible");
        $(".create_basket").css("visibility", "visible");
        $(".create_chest").css("visibility", "visible");
        $(".create_rod").css("visibility", "visible");
        $(".create_pallet").css("visibility", "visible");
        $(".create_divider").css("visibility", "visible");
        $(".fixel_label").css("visibility", "visible");
        $(".item_label").css("visibility", "visible");
        $(".item_desc").css("visibility", "visible");
        $(".open_fixel").css("visibility", "visible");
        $(".clear_item").css("visibility", "visible");
        $(".clear_pog_att").css("visibility", "visible");
        $(".clear_pog_info").css("visibility", "visible");
        $(".icon-bar ul").css("margin", "2%");
        g_dblclick_opened = "N";
        add_pog_code_header();
        generateMultiPogDropdown();
        set_indicator_objects(g_pog_index);
        apex.message.showPageSuccess(g_pog_refresh_msg);
    } catch (err) {
        error_handling(err);
    }
}

//when module edit or new module is created. this function is called.
async function create_pog_module(p_camera, p_pog_index) {
    logDebug("function : create_pog_module", "S");
    var mod_details = [];
    mod_details = sessionStorage.getItem("mod_details") !== null ? JSON.parse(sessionStorage.getItem("mod_details")) : [];
    var ModuleInfo = {};
    var ShelfInfo = {};
    var POGModule = mod_details[0].Module; //mod_details[0].Module;
    var edited_ind = $v("P25_MODULE_EDIT_IND");
    var duplicate_ind = "N";
    var colorValue = parseInt(mod_details[0].Color.replace("#", "0x"), 16);
    var hex_decimal = new THREE.Color(colorValue);
    var moduleX = 0,
        moduleXSet = "N",
        total_mod_width = 0,
        module_recreate = "N",
        mod_height_arr = [],
        mod_index = -1;
    try {
        if (typeof g_pog_json !== "undefined" && g_pog_json[p_pog_index].ModuleInfo.length > 0) {
            var i = 0;
            for (const Module of g_pog_json[p_pog_index].ModuleInfo) {
                if (Module.Module.toUpperCase() == POGModule.toUpperCase()) {
                    ModuleInfo = Module;
                    if (edited_ind == "Y" && g_module_index !== i) {
                        duplicate_ind = "Y";
                        break; //return false; // Loop will stop running after this
                    } else if (edited_ind == "N") {
                        duplicate_ind = "Y";
                        break; //return false; // Loop will stop running after this
                    }
                }
                i++;
            }
        }
        if (edited_ind == "Y") {
            ModuleInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index];
            var module_arr = g_pog_json[p_pog_index].ModuleInfo;
            var i = 0;

            for (const modules of module_arr) {
                if (modules.ParentModule == g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module) {
                    g_pog_json[p_pog_index].ModuleInfo[i].ParentModule = mod_details[0].Module; //mod_details[0].Module;
                    g_pog_json[p_pog_index].ModuleInfo[i].SubDept = mod_details[0].Subdept; //mod_details[0].Subdept;
                    g_pog_json[p_pog_index].ModuleInfo[i].SeqNo = i + 1;
                }
                i++;
            }
        }
        if (g_pog_json[p_pog_index].ModuleInfo.length > 0) {
            var i = 0;
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                    //Modified for ASA-1747 #issue 1
                    if (i !== g_module_index) {
                        total_mod_width += parseFloat(Modules.W);
                    }
                    if (i !== g_module_index && moduleXSet == "N") {
                        moduleX += parseFloat(Modules.W);
                    } else if (i == g_module_index) {
                        total_mod_width = wpdSetFixed(total_mod_width + parseFloat(mod_details[0].W) / 100);
                        moduleXSet = "Y";
                    }
                    //  else { //ASA-1609 Issue 2 Commented for ASA-1747 #issue 1
                    //     break;
                    // }
                    mod_height_arr.push(Modules.H);
                }
                i++;
            }

            if (edited_ind == "Y") {
                if (g_module_index == 0) {
                    mod_height_arr.splice(g_module_index, g_module_index + 1);
                } else {
                    mod_height_arr.splice(g_module_index, 1);
                }
            }
        }

        mod_height_arr.push(parseFloat(mod_details[0].H) / 100);

        /*if (edited_ind == "Y") {
            g_pog_json[p_pog_index].W = moduleX + parseFloat(mod_details[0].W) / 100;
            } else {
                g_pog_json[p_pog_index].W = total_mod_width + parseFloat(mod_details[0].W) / 100;
        }*/ //Commented for ASA-1711 #issue 1 // ASA-1747
        g_pog_json[p_pog_index].W = total_mod_width; //Added for ASA-1747 #issue 1

        g_pog_json[p_pog_index].H = Math.max.apply(Math, mod_height_arr) + g_pog_json[p_pog_index].BaseH;
        g_pog_json[p_pog_index].X = parseFloat(mod_details[0].W) / 2;
        g_pog_json[p_pog_index].Y = parseFloat(mod_details[0].H) / 2;
        if (edited_ind == "Y") {
            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].H !== parseFloat(mod_details[0].H) / 100 || g_pog_json[p_pog_index].ModuleInfo[g_module_index].W !== parseFloat(mod_details[0].W) / 100 || g_pog_json[p_pog_index].ModuleInfo[g_module_index].Color !== mod_details[0].Color || g_pog_json[p_pog_index].ModuleInfo[g_module_index].Rotation !== parseFloat(mod_details[0].Rotation) || g_pog_json[p_pog_index].ModuleInfo[g_module_index].NotchW !== parseFloat(mod_details[0].ModuleNwidth) / 100 || g_pog_json[p_pog_index].ModuleInfo[g_module_index].NotchStart !== parseFloat(mod_details[0].ModuleNstart) / 100 || g_pog_json[p_pog_index].ModuleInfo[g_module_index].NotchSpacing !== parseFloat(mod_details[0].ModuleNspacing) / 100 || g_pog_json[p_pog_index].ModuleInfo[g_module_index].HorzStart !== parseFloat(mod_details[0].HorzStart) / 100 || g_pog_json[p_pog_index].ModuleInfo[g_module_index].HorzSpacing !== parseFloat(mod_details[0].HorzSpacing) / 100 || g_pog_json[p_pog_index].ModuleInfo[g_module_index].VertStart !== parseFloat(mod_details[0].VertStart) / 100 || g_pog_json[p_pog_index].ModuleInfo[g_module_index].VertSpacing !== parseFloat(mod_details[0].VertSpacing) / 100) {
                module_recreate = "Y";
            }
        } else {
            module_recreate = "Y";
        }

        // ASA-1577 - Start
        // if (mod_details[0].Remarks !== g_pog_json[p_pog_index].ModuleInfo[g_module_index].Remarks && edited_ind == "Y" && module_recreate == 'N') { //ASA-1360 Task 2
        // var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID);
        // selectedObject.Remarks = mod_details[0].Remarks;
        // }

        if (edited_ind == "Y" && module_recreate == "N") {
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID);
            if (mod_details[0].Remarks !== g_pog_json[p_pog_index].ModuleInfo[g_module_index].Remarks) {
                //ASA-1360 Task 2
                selectedObject.Remarks = mod_details[0].Remarks;
            }
            if (mod_details[0].Module !== g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module) {
                selectedObject.Module = mod_details[0].Module;
            }
        }
        // ASA-1577 - End

        ModuleInfo["SeqNo"] = g_module_index + 1; //g_pog_json[p_pog_index].ModuleInfo.length + 1;//ASA-1292
        ModuleInfo["Module"] = mod_details[0].Module;
        ModuleInfo["ParentModule"] = null;
        ModuleInfo["POGModuleName"] = mod_details[0].ModuleName;
        ModuleInfo["SubDept"] = mod_details[0].Subdept;
        ModuleInfo["Remarks"] = mod_details[0].Remarks;
        ModuleInfo["H"] = parseFloat(mod_details[0].H) / 100;
        ModuleInfo["W"] = parseFloat(mod_details[0].W) / 100;
        ModuleInfo["D"] = parseFloat(mod_details[0].D) / 100;
        ModuleInfo["Color"] = mod_details[0].Color;
        ModuleInfo["Rotation"] = parseFloat(mod_details[0].Rotation);
        ModuleInfo["NotchW"] = parseFloat(mod_details[0].ModuleNwidth) / 100;
        ModuleInfo["NotchStart"] = parseFloat(mod_details[0].ModuleNstart) / 100; //ASA-1268
        ModuleInfo["NotchSpacing"] = parseFloat(mod_details[0].ModuleNspacing) / 100;
        ModuleInfo["HorzStart"] = parseFloat(mod_details[0].HorzStart) / 100;
        ModuleInfo["HorzSpacing"] = parseFloat(mod_details[0].HorzSpacing) / 100;
        ModuleInfo["VertStart"] = parseFloat(mod_details[0].VertStart) / 100;
        ModuleInfo["VertSpacing"] = parseFloat(mod_details[0].VertSpacing) / 100;
        ModuleInfo["AllowOverlap"] = mod_details[0].ModuleAllowOverlap;
        ModuleInfo["LNotch"] = ""; //$v('P25_MODULE_LEFT_NOTCH');
        ModuleInfo["Backboard"] = ""; //$v('P25_MODULE_BACKBOARD');
        ModuleInfo["RNotch"] = ""; //$v('P25_MODULE_RIGHT_NOTCH');
        ModuleInfo["X"] = moduleX + ModuleInfo["W"] / 2;
        ModuleInfo["Y"] = parseFloat(mod_details[0].H) / 100 / 2 + g_pog_json[p_pog_index].BaseH;
        ModuleInfo["Z"] = 0;
        ModuleInfo["LastCount"] = 0;
        ModuleInfo["Carpark"] = [];
        //if notch is present then its needed to create 2 shelfinfo for those notches.
        if (edited_ind == "N") {
            ModuleInfo["ShelfInfo"] = [];
            ModuleInfo["EditFlag"] = "N";
            g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);
            mod_index = g_pog_json[p_pog_index].ModuleInfo.length - 1;
            if (ModuleInfo["NotchW"] > 0) {
                ShelfInfo = {};
                ShelfInfo["Shelf"] = get_message("LEFT_NOTCH", mod_details[0].Module);
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
                ShelfInfo["W"] = ModuleInfo["NotchW"];
                ShelfInfo["D"] = ModuleInfo["D"];
                ShelfInfo["Rotation"] = 0;
                ShelfInfo["Slope"] = 0;
                ShelfInfo["Color"] = ModuleInfo["Color"];
                ShelfInfo["LiveImage"] = "";
                ShelfInfo["HorizSlotStart"] = 0;
                ShelfInfo["HorizSlotSpacing"] = 0;
                ShelfInfo["HorizStart"] = 0;
                ShelfInfo["HorizSpacing"] = 0;
                ShelfInfo["UOverHang"] = 0;
                ShelfInfo["LoOverHang"] = 0;
                ShelfInfo["VertiStart"] = 0;
                ShelfInfo["VertiSpacing"] = 0;
                ShelfInfo["X"] = ModuleInfo["X"] - ModuleInfo["W"] / 2;
                ShelfInfo["Y"] = ModuleInfo["Y"];
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
                ShelfInfo["Shelf"] = get_message("RIGHT_NOTCH", mod_details[0].Module);
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
                ShelfInfo["W"] = ModuleInfo["NotchW"];
                ShelfInfo["D"] = ModuleInfo["D"];
                ShelfInfo["Rotation"] = 0;
                ShelfInfo["Slope"] = 0;
                ShelfInfo["Color"] = ModuleInfo["Color"];
                ShelfInfo["LiveImage"] = "";
                ShelfInfo["HorizSlotStart"] = 0;
                ShelfInfo["HorizSlotSpacing"] = 0;
                ShelfInfo["HorizStart"] = 0;
                ShelfInfo["HorizSpacing"] = 0;
                ShelfInfo["UOverHang"] = 0;
                ShelfInfo["LoOverHang"] = 0;
                ShelfInfo["VertiStart"] = 0;
                ShelfInfo["VertiSpacing"] = 0;
                ShelfInfo["X"] = ModuleInfo["X"] + ModuleInfo["W"] / 2 - ModuleInfo["NotchW"];
                ShelfInfo["Y"] = ModuleInfo["Y"];
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
        } else {
            ModuleInfo["EditFlag"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].EditFlag;
            ModuleInfo["Carpark"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Carpark;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index] = ModuleInfo;
            mod_index = g_module_index;
        }
        if (module_recreate == "Y") {
            //identify if any change in POG
            g_pog_edited_ind = "Y";

            if (edited_ind == "Y") {
                update_module_coords(ModuleInfo["H"], ModuleInfo["W"], g_module_index, p_pog_index);
            }
            var return_val = await add_module(ModuleInfo["Module"], ModuleInfo["W"], ModuleInfo["H"], ModuleInfo["D"], hex_decimal, ModuleInfo["X"], ModuleInfo["Y"], edited_ind, "N", ModuleInfo["VertStart"], ModuleInfo["VertSpacing"], ModuleInfo["HorzStart"], ModuleInfo["HorzSpacing"], "N", p_camera, mod_index, p_pog_index);
            render(p_pog_index);
            if ((g_show_live_image = "Y")) {
                animate_pog(p_pog_index);
            }
            if (edited_ind == "N" && ModuleInfo["NotchW"] > 0) {
                g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo.length - 2].X = g_pog_json[p_pog_index].ModuleInfo[mod_index].X - ModuleInfo["W"] / 2;
                g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo.length - 2].Y = g_pog_json[p_pog_index].ModuleInfo[mod_index].Y;
                g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo.length - 1].X = g_pog_json[p_pog_index].ModuleInfo[mod_index].X + ModuleInfo["W"] / 2 - ModuleInfo["NotchW"];
                g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo[g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo.length - 1].Y = g_pog_json[p_pog_index].ModuleInfo[mod_index].Y;
            }
            //recreate the orientation view if any present
            async function recreate_view() {
                var returnval = await recreate_compare_views(g_compare_view, "N");
            }
            recreate_view();
        }
        apex.item("P25_MODULE_EDIT_IND").setValue("N");
        g_dblclick_opened = "N";
        apex.message.showPageSuccess(g_pog_refresh_msg);
        render(p_pog_index);
        //}
        logDebug("function : create_pog_module", "E");
    } catch (err) {
        error_handling(err);
    }
}

//function called for edit shelf or create new shelf.
async function create_shelf(p_pog_index) {
    logDebug("function : create_shelf", "S");
    var ShelfInfo = {};
    var ShelfID = g_shelf_details[0].Shelf;
    var colorValue = parseInt(g_shelf_details[0].Color.replace("#", "0x"), 16);
    var hex_decimal = new THREE.Color(colorValue);
    var edited = $v("P25_SHELF_EDIT_IND");
    var shelfY = 0;
    var l_shelf_max_merch;
    var added_value,
        rotation_check = "N",
        validate_passed = "N",
        old_shelfInfo,
        item_depth = 0,
        wall_height_check = "N",
        total_items_width = 0,
        index = -1,
        shelf_ind = -1,
        max_items_depth = [],
        item_height_arr = [],
        duplicate_ind = "N";
    var OldObjID = -1;
    var newShelfIndex = -1;

    try {
        if ($v("P25_MODULE_DISP") == "" && edited == "N") {
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
                if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                    g_module_index = i;
                    return false;
                }
            });
        }
        if (g_shelf_details[0].ObjType == "BASKET" || g_shelf_details[0].ObjType == "CHEST") {
            wall_height_check = "Y";
        }

        if (g_shelf_details[0].MaxMerch != null) {
            l_shelf_max_merch = parseFloat(g_shelf_details[0].MaxMerch) / 100;
        } else {
            l_shelf_max_merch = 0;
        }

        if (edited == "Y") {
            ShelfInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
            old_shelfInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index]));
            OldObjID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID;
            var shelf_top = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2); //.toFixed(3));

            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length > 0 && g_shelf_details[0].ObjType !== "ROD") {
                $.each(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo, function (i, items) {
                    if (wpdSetFixed(items.Y - items.H / 2) == shelf_top) {
                        total_items_width += items.W;
                    }
                    max_items_depth.push(items.D);
                    item_height_arr.push(items.H);
                });
                index = max_items_depth.findIndex(function (number) {
                    return number > parseFloat(g_shelf_details[0].D) / 100;
                });

                var height_index = item_height_arr.findIndex(function (number) {
                    return number > l_shelf_max_merch;
                });

                if (g_shelf_details[0].ObjType == "CHEST" || g_shelf_details[0].ObjType == "PALLET") {
                    var horiz_gap = parseFloat(g_shelf_details[0].ChestHorz) / 100;
                } else {
                    var horiz_gap = parseFloat(g_shelf_details[0].HorizGap) / 100;
                }
                total_items_width = total_items_width + horiz_gap * (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1);
            } else if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length > 0 && g_shelf_details[0].ObjType == "ROD") {
                $.each(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo, function (i, items) {
                    item_depth += items.D;
                });
                item_depth = item_depth + (parseFloat(g_shelf_details[0].DGap) / 100) * (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1);
            }
            if (parseFloat(g_shelf_details[0].Rotation) !== 0) {
                var shelf_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X - parseFloat(g_shelf_details[0].W) / 2;
                var module_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X - g_pog_json[p_pog_index].ModuleInfo[g_module_index].W / 2;
                var shelf_end = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X + parseFloat(g_shelf_details[0].W) / 2;
                var module_end = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X + g_pog_json[p_pog_index].ModuleInfo[g_module_index].W / 2;
                var shelf_top = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y + parseFloat(g_shelf_details[0].H) / 2;
                var shelf_bottom = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y - parseFloat(g_shelf_details[0].H) / 2;

                if ((shelf_start >= module_start || shelf_end <= module_end || (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X > module_start && g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X < module_end)) && shelf_top < g_pog_json[p_pog_index].ModuleInfo[g_module_index].H && shelf_bottom > 0) {
                    rotation_check = "Y";
                }
            }
        }
        if (g_duplicating == "Y" && g_item_edit_flag == "Y") {
            g_shelf_details[0].Shelf = "C" + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length;
            g_shelf_details[0].H = 2;
            g_shelf_details[0].W = g_pog_json[p_pog_index].ModuleInfo[g_module_index].W * 100;
            g_shelf_details[0].D = 100;
            ShelfInfo["creationType"] = "A";
        }
        var shelf_edit = "Y";
        var spread_change = "N";
        if (edited == "Y" && (ShelfInfo["SpreadItem"] !== g_shelf_details[0].SpreadItem || ShelfInfo["LOverhang"] !== parseFloat(g_shelf_details[0].LOverhang) / 100 || ShelfInfo["ROverhang"] !== parseFloat(g_shelf_details[0].ROverhang) / 100)) {
            shelf_edit = "N";
            if (ShelfInfo["SpreadItem"] !== g_shelf_details[0].SpreadItem) {
                spread_change = "Y";
            }
        }
        if (edited == "Y" && ShelfInfo["Shelf"] !== g_shelf_details[0].Shelf) {
            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, ShelfInfo["Shelf"]);
            if (currShelfCombIndx !== -1) {
                updateObjID(g_shelf_details[0].OldObjID, g_shelf_details[0].OldObjID, "S", ShelfInfo["Shelf"], g_shelf_details[0].Shelf);
            }
        }

        const current_z_loc = (ShelfInfo["Z"] * 100) - (ShelfInfo["D"] * 100 / 2); // ASA-1945.1 
        ShelfInfo["Shelf"] = g_shelf_details[0].Shelf;
        ShelfInfo["ObjType"] = g_shelf_details[0].ObjType;
        ShelfInfo["Desc"] = g_shelf_details[0].Desc;
        //ASA-1471 issue 12 S adding the wpdSetFixed
        ShelfInfo["MaxMerch"] = wpdSetFixed(g_shelf_details[0].MaxMerch / 100);
        ShelfInfo["GrillH"] = wpdSetFixed(g_shelf_details[0].GrillH / 100);
        ShelfInfo["LOverhang"] = wpdSetFixed(g_shelf_details[0].LOverhang / 100);
        ShelfInfo["ROverhang"] = wpdSetFixed(g_shelf_details[0].ROverhang / 100);
        ShelfInfo["SpacerThick"] = wpdSetFixed(g_shelf_details[0].SpacerThick / 100);
        ShelfInfo["BsktWallH"] = wpdSetFixed(g_shelf_details[0].BsktWallH / 100);
        ShelfInfo["BsktBaseH"] = wpdSetFixed(g_shelf_details[0].BsktBaseH / 100);
        ShelfInfo["H"] = wpdSetFixed(g_shelf_details[0].H / 100);
        ShelfInfo["D"] = wpdSetFixed(g_shelf_details[0].D / 100);
        ShelfInfo["NotchNo"] = g_shelf_details[0].NotchNo;
        ShelfInfo["ManualCrush"] = g_shelf_details[0].ManualCrush; //ASA-1300

        if (g_shelf_details[0].ObjType == "CHEST" || g_shelf_details[0].ObjType == "PALLET") ShelfInfo["HorizGap"] = wpdSetFixed(g_shelf_details[0].ChestHorz / 100);
        else ShelfInfo["HorizGap"] = wpdSetFixed(g_shelf_details[0].HorizGap / 100);
        //ASA-1471 issue 12 E

        ShelfInfo["SpreadItem"] = g_shelf_details[0].SpreadItem;
        ShelfInfo["Combine"] = g_shelf_details[0].Combine;
        ShelfInfo["AllowAutoCrush"] = g_shelf_details[0].AllowAutoCrush == "" ? "N" : g_shelf_details[0].AllowAutoCrush; //ASA-1471 issue 7
        var final_height = 0;
        if (ShelfInfo["ObjType"] == "BASKET" || ShelfInfo["ObjType"] == "CHEST") {
            if (g_chest_as_pegboard == "Y" && ShelfInfo["ObjType"] == "CHEST") {
                final_height = ShelfInfo["D"];
                ShelfInfo["H"] = ShelfInfo["D"];
            } else {
                final_height = ShelfInfo["BsktBaseH"];
                ShelfInfo["H"] = ShelfInfo["BsktBaseH"];
            }
        } else {
            final_height = ShelfInfo["H"];
        }
        ShelfInfo["H"] = final_height;
        ShelfInfo["W"] = wpdSetFixed(g_shelf_details[0].W / 100); //ASA-1471 issue 9 a

        ShelfInfo["Slope"] = wpdSetFixed(g_shelf_details[0].Slope); //ASA-1471 issue 9 a
        ShelfInfo["Rotation"] = wpdSetFixed(g_shelf_details[0].Rotation); //ASA-1471 issue 9 a
        ShelfInfo["Color"] = g_shelf_details[0].Color;
        ShelfInfo["LiveImage"] = g_shelf_details[0].LiveImage;
        //ASA-1471 issue 12 S
        ShelfInfo["HorizSlotStart"] = wpdSetFixed(g_shelf_details[0].HorizSlotStart / 100);
        ShelfInfo["HorizSlotSpacing"] = wpdSetFixed(g_shelf_details[0].HorizSlotSpacing / 100);
        ShelfInfo["HorizStart"] = wpdSetFixed(g_shelf_details[0].HorizStart / 100);
        ShelfInfo["HorizSpacing"] = wpdSetFixed(g_shelf_details[0].HorizSpacing / 100);
        ShelfInfo["UOverHang"] = wpdSetFixed(g_shelf_details[0].UOverHang / 100);
        ShelfInfo["LoOverHang"] = wpdSetFixed(g_shelf_details[0].LoOverHang / 100);
        ShelfInfo["VertiStart"] = wpdSetFixed(g_shelf_details[0].VertiStart / 100);
        ShelfInfo["VertiSpacing"] = wpdSetFixed(g_shelf_details[0].VertiSpacing / 100);
        //ASA-1471 issue 12 E
        ShelfInfo["InputText"] = g_shelf_details[0].InputText;
        ShelfInfo["WrapText"] = g_shelf_details[0].WrapText;
        ShelfInfo["ReduceToFit"] = g_shelf_details[0].ReduceToFit;
        ShelfInfo["TextDirection"] = g_shelf_details[0].TextDirection;
        ShelfInfo["BsktFill"] = g_shelf_details[0].BsktFill;
        ShelfInfo["BsktSpreadProduct"] = g_shelf_details[0].BsktSpreadProduct;
        ShelfInfo["SnapTo"] = g_shelf_details[0].SnapTo;
        //ASA-1471 issue 12 S
        ShelfInfo["BsktWallThickness"] = wpdSetFixed(g_shelf_details[0].BsktWallThickness / 100);
        ShelfInfo["DSlotStart"] = wpdSetFixed(g_shelf_details[0].DSlotStart / 100);
        ShelfInfo["DSlotSpacing"] = wpdSetFixed(g_shelf_details[0].DSlotSpacing / 100);
        ShelfInfo["DGap"] = wpdSetFixed(g_shelf_details[0].DGap / 100);
        ShelfInfo["FrontOverHang"] = wpdSetFixed(g_shelf_details[0].FrontOverHang / 100);
        ShelfInfo["BackOverHang"] = wpdSetFixed(g_shelf_details[0].BackOverHang / 100);
        //ASA-1471 issue 12 E
        ShelfInfo["SlotDivider"] = g_shelf_details[0].SlotDivider;
        ShelfInfo["AllowOverLap"] = g_shelf_details[0].AllowOverLap;
        ShelfInfo["AutoPlacing"] = g_shelf_details[0].AutoPlacing;
        ShelfInfo["AutoFillPeg"] = g_shelf_details[0].AutoFillPeg; //ASA-1109
        ShelfInfo["SlotOrientation"] = g_shelf_details[0].SlotOrientation;
        ShelfInfo["DividerFixed"] = g_shelf_details[0].DividerFixed;
        ShelfInfo["LObjID"] = g_shelf_details[0].LObjID;
        ShelfInfo["NotchLabelObjID"] = g_shelf_details[0].NotchLabelObjID;
        ShelfInfo["FStyle"] = g_shelf_details[0].FStyle;
        ShelfInfo["FSize"] = $v("P25_POGCR_TEXT_DEFAULT_SIZE");
        ShelfInfo["FBold"] = g_shelf_details[0].FBold;
        ShelfInfo["TextImg"] = g_shelf_details[0].TextImg;
        ShelfInfo["TextImgName"] = g_shelf_details[0].TextImgName;
        ShelfInfo["TextImgMime"] = g_shelf_details[0].TextImgMime;
        ShelfInfo["OldObjID"] = g_shelf_details[0].SObjID;
        ShelfInfo["Overhung"] = g_shelf_details[0].Overhung; //ASA-1138
        //ASA-1471 issue 12 S
        ShelfInfo["DivHeight"] = wpdSetFixed(g_shelf_details[0].DivHeight / 100); //ASA-1265
        ShelfInfo["DivWidth"] = wpdSetFixed(g_shelf_details[0].DivWidth / 100); //ASA-1265
        ShelfInfo["DivPst"] = g_shelf_details[0].DivPst; //ASA-1265
        ShelfInfo["DivPed"] = g_shelf_details[0].DivPed; //ASA-1265
        ShelfInfo["DivCreated"] = g_shelf_details[0].DivCreated; //ASA-1265
        ShelfInfo["DivPbtwFace"] = g_shelf_details[0].DivPbtwFace; //ASA-1265
        ShelfInfo["DivStX"] = wpdSetFixed(g_shelf_details[0].DivStX / 100); //ASA-1265
        ShelfInfo["DivSpaceX"] = wpdSetFixed(g_shelf_details[0].DivSpaceX / 100); //ASA-1265
        //ASA-1471 issue 12 E
        ShelfInfo["DivFillCol"] = g_shelf_details[0].DivFillCol; //ASA-1265
        ShelfInfo["NoDivIDShow"] = g_shelf_details[0].NoDivIDShow; //ASA-1406
        ShelfInfo["InsidePegboard"] = g_shelf_details[0].InsidePegboard; //ASA - 1544 Issue 1
        if (g_shelf_details[0].ObjType == "SHELF") {
            ShelfInfo["AvlSpace"] = ShelfInfo["W"] + ShelfInfo["LOverhang"] + ShelfInfo["ROverhang"];
        }
        var z = 0.003;
        if (edited == "Y") {
            shelf_ind = g_shelf_index;
            var x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X;
            var y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y;
        } else {
            shelf_ind = -1;
            var max_shelfy_arr = [];
            var max_index_arr = [];
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].LastCount = g_pog_json[p_pog_index].ModuleInfo[g_module_index].LastCount + 1;

            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length == 0) {
                shelfY = ShelfInfo["H"] / 2 + g_pog_json[p_pog_index].BaseH;
            } else {
                $.each(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo, function (i, Shelf) {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                        max_shelfy_arr.push(Shelf.Y);
                        max_index_arr.push(i);
                    }
                });
                if (max_shelfy_arr.length > 0) {
                    shelfY = Math.max.apply(Math, max_shelfy_arr);

                    index = max_shelfy_arr.findIndex(function (number) {
                        return number == shelfY;
                    });
                    if (shelfY > 0) {
                        shelfY = shelfY + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[max_index_arr[index]].H / 2 + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[max_index_arr[index]].MaxMerch + ShelfInfo["H"] / 2;
                    } else {
                        shelfY = ShelfInfo["H"] / 2 + g_pog_json[p_pog_index].BaseH;
                    }
                } else {
                    shelfY = ShelfInfo["H"] / 2 + g_pog_json[p_pog_index].BaseH;
                }
            }
            if (shelfY > g_pog_json[p_pog_index].H) {
                shelfY = g_pog_json[p_pog_index].H + 0.02;
            }
            var x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X;
            if (g_duplicate_fixel_flag == "N") {
                var y = shelfY;
            } else {
                var y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].H + ShelfInfo["H"] / 2 + g_pog_json[p_pog_index].BaseH;
            }
        }
        if (g_duplicating == "Y" && g_item_edit_flag == "Y") {
            var locationX = g_intersects[0].point.x;
            var locationY = g_intersects[0].point.y;
            var locationZ = g_intersects[0].point.z;
            var coords = new THREE.Vector3(locationX, locationY, locationZ);
            g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);
            x = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
            y = Math.min(19, Math.max(-19, coords.y));
        }
        ShelfInfo["X"] = x;
        ShelfInfo["Y"] = y;

        //ShelfInfo["Z"] = typeof ShelfInfo["Z"] == "undefined" || ShelfInfo["Z"] == "" ? g_pog_json[p_pog_index].BackDepth / 2 + ShelfInfo["D"] / 2 : ShelfInfo["Z"]  //ASA-1638
        ShelfInfo["Z"] = typeof ShelfInfo["Z"] == "undefined" || ShelfInfo["Z"] == "" ? g_pog_json[p_pog_index].BackDepth / 2 + ShelfInfo["D"] / 2 : (current_z_loc / 100) + (ShelfInfo["D"] / 2); // ASA-1945.1

        //ASA-1638
        if (edited == "N") {
            ShelfInfo["ItemInfo"] = [];
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(ShelfInfo);
            g_shelf_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1;
        } else {
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index] = ShelfInfo;
        }

        var item_arr = [],
            item_width_arr = [],
            item_height_arr = [],
            item_depth_arr = [],
            item_index_arr = [];
        var item_x = -1,
            item_y = -1;
        var old_itemsInfo = [];

        if (edited == "Y") {
            //we try to generate new combination when combine is !== 'N' or even remove this shelf from combination when previously it was combined.
            var [currCombinationIndex, currShelfCombIndx] = [-1, -1];
            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Combine !== "N" || old_shelfInfo.Combine !== "N") {
                await generateCombinedShelfs(p_pog_index, g_module_index, g_shelf_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters,//ASA-1353
                //ASA-1272
                if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Combine !== "N") {
                    [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, ShelfInfo["Shelf"]);
                    if (currCombinationIndex == -1) {
                        alert(get_message("COMBINE_NOT_ACTIVE", ShelfInfo["Shelf"]));
                    }
                }
            }
            old_shelfInfo.ItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo)); //Task-02_25977 prasanna
            if (!(ShelfInfo["ObjType"] == "CHEST" && g_chest_as_pegboard == "Y")) {
                await set_all_items(g_module_index, g_shelf_index, ShelfInfo["X"], ShelfInfo["Y"], "Y", "N", "Y", p_pog_index, p_pog_index); //Regression issue 24 Prasanna
            }
            //this is a logic where when edit shelf they can set to place dividers in between items.
            //option are start, end and in between and they set dimension of the dividers. we use it and add divider details inside shelf
            //before recreate.
            if (g_shelf_details[0].DivPbtwFace !== " " && g_shelf_details[0].DivHeight > 0 && g_shelf_details[0].DivWidth > 0 && g_shelf_details[0].DivCreated == "Y") {
                //ASA-1265 Issue-1
                await create_shelf_dividers(p_pog_index, g_module_index, g_shelf_index);
            }

            var update_crush = "N"; //ASA=1307
            //ASA-1386 AllowAutoCrush condition added
            if (old_shelfInfo.AllowAutoCrush !== ShelfInfo.AllowAutoCrush || old_shelfInfo.H !== ShelfInfo.H || old_shelfInfo.W !== ShelfInfo.W || old_shelfInfo.D !== ShelfInfo.D) {
                update_crush = "Y";
            }
            if (ShelfInfo["ObjType"] !== "PEGBOARD" && update_crush == "Y") {
                //ASA-1307
                reset_auto_crush(g_module_index, g_shelf_index, -1, p_pog_index, g_module_index, g_shelf_index, p_pog_index); //ASA-1343 issue 1 //ASA-1685
            }

            var items_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo;
            var res = await set_auto_facings(g_module_index, g_shelf_index, -1, items_arr, "B", "S", "D", p_pog_index, p_pog_index);

            var items_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo;
            $.each(items_arr, function (i, items) {
                //ASA-1265
                if (typeof items.BottomObjID == "undefined" || items.BottomObjID == "") {
                    item_width_arr.push(wpdSetFixed(items.W)); //.toFixed(4)));
                    item_height_arr.push(wpdSetFixed(items.H)); //.toFixed(4)));
                    item_depth_arr.push(wpdSetFixed(items.D)); //.toFixed(4)));
                    item_index_arr.push(i);
                }
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[i].Exists = "E";
            });
            //we have to validate the shelf which is edit with new details.
            if (ShelfInfo["ObjType"] !== "ROD" && ShelfInfo["ObjType"] !== "PEGBOARD" && !(ShelfInfo["ObjType"] == "CHEST" && g_chest_as_pegboard == "Y")) {
                if (reorder_items(g_module_index, g_shelf_index, p_pog_index)) {
                    var shelfs = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                    var validate_passed = validate_shelf_min_distance(g_module_index, g_shelf_index, y, items_arr, ShelfInfo["AllowAutoCrush"], g_module_index, x, "Y", shelfs, p_pog_index);
                }
            } else {
                validate_passed = "Y";
            }

            //We need to validate item height and reset crush basis on allow auto crush or manual crush
            var return_val = "N";
            if (!((ShelfInfo["ObjType"] == "CHEST" && g_chest_as_pegboard == "Y") || ShelfInfo["ObjType"] == "PEGBOARD")) {
                if (currCombinationIndex !== -1) {
                    for (shelf_info of g_combinedShelfs[currCombinationIndex]) {
                        var currModIndx = shelf_info.MIndex,
                            currShlfIndx = shelf_info.SIndex,
                            currShelf = g_pog_json[p_pog_index].ModuleInfo[currModIndx].ShelfInfo[currShlfIndx],
                            items = currShelf.ItemInfo;
                        var i = 0;
                        for (item of items) {
                            if ((typeof item.BottomObjID == "undefined" || item.BottomObjID == "") && (typeof item.TopObjID == "undefined" || item.TopObjID == "")) {
                                var return_val = update_validate_item_height(item, currModIndx, currShlfIndx, i, item.X, ShelfInfo["ObjType"], -1, p_pog_index);
                            }
                            i++;
                        }
                    }
                } else {
                    var i = 0;
                    for (item of items_arr) {
                        if ((typeof item.BottomObjID == "undefined" || item.BottomObjID == "") && (typeof item.TopObjID == "undefined" || item.TopObjID == "")) {
                            var return_val = update_validate_item_height(item, g_module_index, g_shelf_index, i, item.X, ShelfInfo["ObjType"], -1, p_pog_index);
                        }
                        i++;
                    }
                }
            }

            //we need to validate the items on the shelf. if the new details and item would hit any other object.
            var drag_item_arr = [];
            //ASA-1582 Issue 1, added return_val condition and now sending p_validate_height as N in place of Y as we do not validate or crush height in validate_items. The vertical crush logic written needs to be removed from validate_items
            if ((validate_passed == "Y" || validate_passed == "R") && (return_val == "F" || return_val == "N") && validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, g_shelf_details[0].ObjType, g_module_index, g_shelf_index, -1, "N", 0, 0, 0, -1, "N", /*"Y"*/ "N", "Y", "N", "N", drag_item_arr, "Y", "Y", "Y", p_pog_index)) {
                //identify if any change in POG
                g_pog_edited_ind = "Y";

                if (ShelfInfo["ObjType"] == "PEGBOARD") {
                    var return_val = await add_pegboard(ShelfID, ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, edited, ShelfInfo["VertiStart"], ShelfInfo["VertiSpacing"], ShelfInfo["HorizStart"], ShelfInfo["HorizSpacing"], g_module_index, shelf_ind, ShelfInfo["Rotation"], ShelfInfo["Slope"], "Y", $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
                } else if (ShelfInfo["ObjType"] == "ROD") {
                    var return_val = await add_rod(ShelfID, ShelfInfo["ObjType"], ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, edited, g_module_index, shelf_ind, p_pog_index);
                } else {
                    var [return_val, shelf_cnt] = await add_shelf(ShelfID, ShelfInfo["ObjType"], ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, edited, g_module_index, ShelfInfo["Rotation"], ShelfInfo["Slope"], shelf_ind, "Y", "N", shelf_edit, -1, $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
                    var res = updateObjID(ShelfInfo["OldObjID"], return_val, "S");
                    newShelfIndex = shelf_cnt;
                }
                apex.item("P25_SHELF_EDIT_IND").setValue("N");
                g_dblclick_opened = "N";
                g_duplicate_fixel_flag = "N";
                if (g_duplicating !== "Y" && g_item_edit_flag !== "Y") {
                    apex.message.showPageSuccess(g_pog_refresh_msg);
                }

                if (g_show_max_merch == "Y") {
                    async function doSomething() {
                        let result = await add_merch("N", p_pog_index);
                        let result1 = await add_merch("Y", p_pog_index);
                    }
                    doSomething();
                }
            } else {
                if (g_shelf_details[0].DivPbtwFace !== " " && g_shelf_details[0].DivHeight > 0 && g_shelf_details[0].DivWidth > 0 && g_shelf_details[0].DivCreated == "Y") {
                    //Task_27734
                    remove_shelf_dividers(p_pog_index, g_module_index, ShelfInfo["Shelf"]);
                }
                if (shelf_ind == 0) {
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.splice(shelf_ind, shelf_ind + 1);
                } else {
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.splice(shelf_ind, 1);
                }
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.splice(shelf_ind, 0, old_shelfInfo);
            }
        } else {
            //ASA-1129
            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Combine !== "N") {
                await generateCombinedShelfs(p_pog_index, g_module_index, g_shelf_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters
                //ASA-1272
                var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, ShelfInfo["Shelf"]);
                if (currCombinationIndex == -1) {
                    alert(get_message("COMBINE_NOT_ACTIVE", ShelfInfo["Shelf"]));
                }
            }
            if (ShelfInfo["ObjType"] == "PEGBOARD") {
                var return_val = await add_pegboard(ShelfID, ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, edited, ShelfInfo["VertiStart"], ShelfInfo["VertiSpacing"], ShelfInfo["HorizStart"], ShelfInfo["HorizSpacing"], g_module_index, shelf_ind, ShelfInfo["Rotation"], ShelfInfo["Slope"], "Y", $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
            } else if (ShelfInfo["ObjType"] == "ROD") {
                var return_val = await add_rod(ShelfID, ShelfInfo["ObjType"], ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, edited, g_module_index, shelf_ind, p_pog_index);
            } else {
                var [return_val, shelf_cnt] = await add_shelf(ShelfID, ShelfInfo["ObjType"], ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, edited, g_module_index, ShelfInfo["Rotation"], ShelfInfo["Slope"], shelf_ind, "Y", "N", "Y", -1, $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters//ASA-1487
                var res = updateObjID(ShelfInfo["OldObjID"], return_val, "S");
                newShelfIndex = shelf_cnt;
            }
            if (g_show_max_merch == "Y") {
                add_merch("Y", p_pog_index);
            }
            apex.item("P25_SHELF_EDIT_IND").setValue("N");
            g_dblclick_opened = "N";
            g_duplicate_fixel_flag = "N";
            if (g_duplicating !== "Y" && g_item_edit_flag !== "Y") {
                apex.message.showPageSuccess(g_pog_refresh_msg);
            }
        }
        //recreate the orientation view if any present
        async function recreate_view() {
            var returnval = await recreate_compare_views(g_compare_view, "N");
        }
        recreate_view();

        //capture the module is edit or not to create changed text box
        g_pog_json[p_pog_index].ModuleInfo[g_module_index].EditFlag = "Y";
        if (ShelfInfo["ObjType"] == "CHEST" && g_chest_as_pegboard == "Y") {
            //Bug-26122 - splitting the chest
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ChestEdit = "Y";
        }
        g_shelf_index;

        g_dragItem = {};
        render(p_pog_index);
        if (g_show_live_image == "Y") {
            animate_all_pog();
        }
        logDebug("function : create_shelf", "E");
        return newShelfIndex;
    } catch (err) {
        error_handling(err);
    }
}

//this function is called when create or edit text box.
async function create_textbox(p_camera, p_pog_index) {
    logDebug("function : create_textbox", "S");
    var ShelfInfo = {};
    var ModuleInfo = {};
    var child_module_index = -1;
    var ShelfID = $v("P25_TEXT_ID");
    var edited = apex.item("P25_SHELF_EDIT_IND").getValue();
    var colorValue;
    var hex_decimal;
    var shelfY = 0,
        rotation_check = "N",
        shelf_ind = -1;
    // var l_shelf_max_merch;
    var added_value,
        duplicate_ind = "N";
    var prevWorldZ, prevZ; //ASA-1652
    try {
        if (g_multiselect == "Y") {
            //ASA-1669
            var module = [],
                shelf = [];
            if (parseFloat($v("P25_TEXT_ROTATION")) > 0 || parseFloat($v("P25_TEXT_ROTATION")) < 0) {
                for (const txtbox of g_delete_details) {
                    module = g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex];
                    shelf = g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].ShelfInfo[txtbox.SIndex];
                    const shelf_start = shelf.X - parseFloat($v("P25_TEXT_WIDTH")) / 2;
                    const module_start = module.X - module.W / 2;
                    const shelf_end = shelf.X + parseFloat($v("P25_TEXT_WIDTH")) / 2;
                    const module_end = module.X + module.W / 2;
                    const shelf_top = shelf.Y + parseFloat($v("P25_TEXT_HEIGHT")) / 2;
                    const shelf_bottom = shelf.Y - parseFloat($v("P25_TEXT_HEIGHT")) / 2;

                    if (!(shelf_start >= module_start || shelf_end <= module_end || (shelf.X > module_start && shelf.X < module_end)) && shelf_top < module.H && shelf_bottom > 0) {
                        rotation_check = "N";
                        break;
                    } else {
                        rotation_check = "Y";
                    }
                }
            }
            if ($v("P25_TEXT_ROTATION") !== "" && (parseFloat($v("P25_TEXT_ROTATION")) > 359 || parseFloat($v("P25_TEXT_ROTATION")) < 0)) {
                alert(get_message("ROTATION_BTW_RANGE"));
            } else if (rotation_check == "Y") {
                alert(get_message("LOST_FROM_SHELF_ROTATION_ERR", shelf.Shelf, g_pog_json[p_pog_index].POGCode + module.Module));
            } else {
                // if (apex.item("P25_MAX_MERCH").getValue() != null) {
                //     l_shelf_max_merch = parseFloat(apex.item("P25_MAX_MERCH").getValue()) / 100;
                // } else {
                //     l_shelf_max_merch = 0;
                // }
                for (const txtbox of g_delete_details) {
                    if (txtbox.ObjType == "TEXTBOX") {
                        var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].ShelfInfo[txtbox.SIndex];
                        prevZ = shelfInfo.Z;
                        prevWorldZ = g_world.getObjectById(shelfInfo.SObjID).position.z;
                        child_module_index = -1;
                        var i = 0;
                        ModuleInfo = {}; //ASA-1669 #2
                        for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                            if (modules.ObjID == shelfInfo.SObjID) {
                                ModuleInfo = g_pog_json[p_pog_index].ModuleInfo[i];
                                child_module_index = i;
                                break;
                            }
                            i++;
                        }
                        var x = shelfInfo.X;
                        var y = shelfInfo.Y;
                        var z = 0.0021;
                        var shelfId = shelfInfo.Shelf;
                        shelf_ind = txtbox.SIndex;

                        shelfInfo.W = nvl($v("P25_TEXT_WIDTH")) <= 0 ? shelfInfo.W : parseFloat($v("P25_TEXT_WIDTH")) / 100;
                        shelfInfo.H = nvl($v("P25_TEXT_HEIGHT")) <= 0 ? shelfInfo.H : parseFloat($v("P25_TEXT_HEIGHT")) / 100;
                        shelfInfo.Color = nvl($v("P25_TEXT_COLOR")) == 0 ? shelfInfo.Color : $v("P25_TEXT_COLOR");
                        shelfInfo.Slope = nvl($v("P25_TEXT_SLOPE")) <= 0 ? shelfInfo.Slope : parseFloat($v("P25_TEXT_SLOPE"));
                        shelfInfo.Rotation = nvl($v("P25_TEXT_ROTATION")) <= 0 ? shelfInfo.Rotation : parseFloat($v("P25_TEXT_ROTATION"));
                        shelfInfo.FStyle = nvl($v("P25_FONT_STYLE")) == 0 ? shelfInfo.FStyle : $v("P25_FONT_STYLE");
                        shelfInfo.FSize = nvl($v("P25_FONT_SIZE")) == 0 ? shelfInfo.FSize : $v("P25_FONT_SIZE");
                        shelfInfo.FBold = $v("P25_BOLD");
                        shelfInfo.InputText = nvl($v("P25_TEXT")) == 0 ? shelfInfo.InputText : $v("P25_TEXT");
                        shelfInfo.WrapText = nvl($v("P25_WRAP_TEXT")) == 0 ? shelfInfo.InputText : $v("P25_WRAP_TEXT");
                        shelfInfo.ReduceToFit = nvl($v("P25_REDUCETOFIT")) == 0 ? shelfInfo.InputText : $v("P25_REDUCETOFIT");
                        shelfInfo.TextDirection = nvl($v("P25_TEXT_DIRECTION")) == 0 ? shelfInfo.InputText : $v("P25_TEXT_DIRECTION");
                        if (g_temp_image_arr.length > 0) {
                            shelfInfo.TextImg = g_temp_image_arr[0].Image;
                            shelfInfo.TextImgName = g_temp_image_arr[0].FileName;
                            shelfInfo.TextImgMime = g_temp_image_arr[0].MimeType;
                        }
                        //ASA-2030.2
                        // else {
                        //     //ASA-1669 #7
                        //     shelfInfo.TextImg = "";
                        //     shelfInfo.TextImgName = "";
                        //     shelfInfo.TextImgMime = "";
                        // }

                        colorValue = parseInt(shelfInfo.Color.replace("#", "0x"), 16);
                        hex_decimal = new THREE.Color(colorValue);
                        // $s('P25_TEXT_COLOR',colorValue);

                        ModuleInfo["H"] = shelfInfo.H;
                        ModuleInfo["W"] = shelfInfo.W;
                        ModuleInfo["Color"] = shelfInfo.Color;

                        ShelfInfo["Z"] = g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].ShelfInfo[shelf_ind].Z;
                        // shelf_ind = g_shelf_index;
                        // g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].ShelfInfo[g_shelf_index] = ShelfInfo;
                        // g_pog_json[p_pog_index].ModuleInfo[child_module_index] = ModuleInfo;
                        // g_pog_json[p_pog_index].ModuleInfo[child_module_index].ShelfInfo[0] = ShelfInfo;

                        g_pog_edited_ind = "Y";
                        if (g_show_live_image == "Y" && shelfInfo["TextImg"] !== "" && typeof shelfInfo["TextImg"] !== "undefined" && shelfInfo["TextImg"] !== null) {
                            var return_val = await add_text_box_with_image(shelfId, "SHELF", shelfInfo["W"], shelfInfo["H"], shelfInfo["D"], hex_decimal, x, y, z, edited, txtbox.MIndex, shelfInfo["InputText"], colorValue, shelfInfo["WrapText"], shelfInfo["ReduceToFit"], shelfInfo["Color"], shelf_ind, shelfInfo["Rotation"], shelfInfo["Slope"], "Y", shelfInfo["FStyle"], shelfInfo["FSize"], shelfInfo["FBold"], $v("P25_NOTCH_HEAD"), p_pog_index);
                        } else {
                            var return_val = add_text_box(shelfId, "SHELF", shelfInfo["W"], shelfInfo["H"], shelfInfo["D"], hex_decimal, x, y, z, edited, txtbox.MIndex, shelfInfo["InputText"], colorValue, shelfInfo["WrapText"], shelfInfo["ReduceToFit"], shelfInfo["Color"], shelf_ind, shelfInfo["Rotation"], shelfInfo["Slope"], "Y", shelfInfo["FStyle"], shelfInfo["FSize"], shelfInfo["FBold"], 2, p_pog_index, g_pogcr_enhance_textbox_fontsize, shelfInfo["TextDirection"]); //ASA-1797.1
                        }
                        var shelfz = get_textbox_z(txtbox.MIndex, shelf_ind, x, y, shelfInfo["W"], shelfInfo["H"], p_pog_index);
                        g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].ShelfInfo[shelf_ind].Z = shelfz;

                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(return_val);
                        if (shelfz == g_pog_json[p_pog_index].BackDepth) {
                            selectedObject.position.z = 0.001;
                        } else {
                            selectedObject.position.z = shelfz > 0.0021 ? 0.0021 : shelfz == 0 ? 0.0006 : shelfz;
                        }

                        if (child_module_index == -1) {
                            ModuleInfo["SeqNo"] = g_pog_json[p_pog_index].ModuleInfo.length + 1;
                            ModuleInfo["Module"] = shelfId;
                            ModuleInfo["ParentModule"] = g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].Module;
                            ModuleInfo["POGModuleName"] = shelfInfo.Desc;
                            ModuleInfo["SubDept"] = g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].SubDept;
                            ModuleInfo["Remarks"] = g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].Remarks;
                            ModuleInfo["D"] = 0;
                            ModuleInfo["Rotation"] = 0;
                            ModuleInfo["NotchW"] = 0;
                            ModuleInfo["NotchStart"] = 0;
                            ModuleInfo["NotchSpacing"] = 0;
                            ModuleInfo["HorzStart"] = 0;
                            ModuleInfo["HorzSpacing"] = 0;
                            ModuleInfo["VertStart"] = 0;
                            ModuleInfo["VertSpacing"] = 0;
                            ModuleInfo["AllowOverlap"] = 0;
                            ModuleInfo["LNotch"] = 0;
                            ModuleInfo["Backboard"] = 0;
                            ModuleInfo["RNotch"] = 0;
                            ModuleInfo["X"] = 0;
                            ModuleInfo["Y"] = 0;
                            ModuleInfo["Z"] = 0;
                            ModuleInfo["LastCount"] = 0;
                            ModuleInfo["EditFlag"] = "N";
                            ModuleInfo["Carpark"] = [];
                            ModuleInfo["ShelfInfo"] = [];
                            g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);
                            child_module_index = g_pog_json[p_pog_index].ModuleInfo.length - 1;
                        } //ASA-1669 #2

                        g_pog_json[p_pog_index].ModuleInfo[child_module_index].ObjID = return_val;
                        selectedObject.position.z = prevWorldZ;
                        g_pog_json[p_pog_index].ModuleInfo[txtbox.MIndex].ShelfInfo[shelf_ind].Z = prevZ;
                    }
                }
                //recreate the orientation view if any present
                async function recreate_view() {
                    var returnval = await recreate_compare_views(g_compare_view, "N");
                }
                recreate_view();

                $s("P25_SHELF_EDIT_IND", "N");
                closeInlineDialog("add_textbox");
                g_dblclick_opened = "N";
                g_duplicate_fixel_flag = "N";
                apex.message.showPageSuccess(g_pog_refresh_msg);
                render(p_pog_index);
                g_multiselect = "N";
                g_mselect_drag = "N"; //ASA-1669 #4
                g_temp_image_arr = []; //ASA-2030.2
                $s("P25_SHELF_EDIT_IND", "N");
            }
        } else {
            colorValue = parseInt(apex.item("P25_TEXT_COLOR").getValue().replace("#", "0x"), 16);
            hex_decimal = new THREE.Color(colorValue);
            if ($v("P25_MODULE_DISP") == "" && edited == "N") {
                var i = 0;
                for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                        g_module_index = i;
                        break; //return false;
                    }
                    i++;
                }
            }

            if (typeof g_pog_json !== "undefined") {
                var i = 0;
                for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                        if (modules.ShelfInfo.length > 0) {
                            var j = 0;
                            for (const shelf of modules.ShelfInfo) {
                                if (shelf.Shelf.toUpperCase() == ShelfID.toUpperCase()) {
                                    ShelfInfo = shelf;
                                    if (edited == "Y") {
                                        if (g_module_index == i && g_shelf_index !== j) {
                                            duplicate_ind = "Y";
                                            break; //return false; // Loop will stop running after this
                                        } else if (g_module_index !== i) {
                                            duplicate_ind = "Y";
                                            break; //return false; // Loop will stop running after this
                                        }
                                    } else if (edited == "N") {
                                        duplicate_ind = "Y";
                                        break; //return false; // Loop will stop running after this
                                    }
                                }
                                j++;
                            }
                        }
                    }
                    i++;
                }
            }

            if (edited == "Y") {
                ShelfInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                prevZ = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z; //ASA-1652
                prevWorldZ = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID).position.z; //ASA-1652
                var module_arr = g_pog_json[p_pog_index].ModuleInfo;
                var i = 0;
                for (const modules of module_arr) {
                    if (modules.ObjID == g_dblclick_objid) {
                        ModuleInfo = g_pog_json[p_pog_index].ModuleInfo[i];
                        child_module_index = i;
                        break;
                    }
                    i++;
                }
                if (parseFloat($v("P25_TEXT_ROTATION")) > 0 || parseFloat($v("P25_TEXT_ROTATION")) < 0) {
                    var shelf_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X - parseFloat($v("P25_TEXT_WIDTH")) / 2;
                    var module_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X - g_pog_json[p_pog_index].ModuleInfo[g_module_index].W / 2;
                    var shelf_end = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X + parseFloat($v("P25_TEXT_WIDTH")) / 2;
                    var module_end = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X + g_pog_json[p_pog_index].ModuleInfo[g_module_index].W / 2;
                    var shelf_top = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y + parseFloat($v("P25_TEXT_HEIGHT")) / 2;
                    var shelf_bottom = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y - parseFloat($v("P25_TEXT_HEIGHT")) / 2;

                    if ((shelf_start >= module_start || shelf_end <= module_end || (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X > module_start && g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X < module_end)) && shelf_top < g_pog_json[p_pog_index].ModuleInfo[g_module_index].H && shelf_bottom > 0) {
                        rotation_check = "Y";
                    }
                }
            }

            if (apex.item("P25_MAX_MERCH").getValue() != null) {
                l_shelf_max_merch = parseFloat(apex.item("P25_MAX_MERCH").getValue()) / 100;
            } else {
                l_shelf_max_merch = 0;
            }
            if (duplicate_ind == "Y") {
                alert(get_message("COMPONENT_UNIQUE_ID"));
            } else if ($v("P25_TEXT_HEIGHT") == "" || $v("P25_TEXT_WIDTH") == "" || $v("P25_TEXT_ID") == "" || $v("P25_TEXT_COLOR") == "") {
                alert(get_message("ENTER_MANDATORY_FIELDS"));
            } else if ($v("P25_TEXT_HEIGHT") == 0) {
                alert(get_message("HEIGHT_GRT_THAN_ZERO"));
            } else if ($v("P25_TEXT_WIDTH") == 0) {
                alert(get_message("WIDTH_GRT_THAN_ZERO"));
            } else if ($v("P25_TEXT_ROTATION") !== "" && (parseFloat($v("P25_TEXT_ROTATION")) > 359 || parseFloat($v("P25_TEXT_ROTATION")) < 0)) {
                alert(get_message("ROTATION_BTW_RANGE"));
            } else if (rotation_check == "Y") {
                alert(get_message("LOST_FROM_SHELF_ROTATION_ERR", g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Shelf, g_pog_json[p_pog_index].POGCode + g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module));
            } else {
                var z = 0.0021;
                if ($v("P25_TEXT") == "") {
                    $s("P25_TEXT", " ");
                }
                if (edited == "Y") {
                    var x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X;
                    var y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y;
                } else {
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].LastCount = g_pog_json[p_pog_index].ModuleInfo[g_module_index].LastCount + 1;

                    if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length == 0) {
                        shelfY = parseFloat($v("P25_TEXT_HEIGHT")) / 100 / 2 + g_pog_json[p_pog_index].BaseH;
                    } else {
                        var i = 0;
                        for (const Shelf of g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo) {
                            if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                                var added_value = Shelf.MaxMerch + Shelf.H;
                                shelfY += added_value;
                            }
                            i++;
                        }
                        shelfY = shelfY + parseFloat($v("P25_TEXT_HEIGHT")) / 100 / 2;
                        if (g_pog_json[p_pog_index].BaseH > 0) {
                            shelfY = shelfY + g_pog_json[p_pog_index].BaseH;
                        }
                    }
                    if (shelfY > g_pog_json[p_pog_index].H) {
                        shelfY = g_pog_json[p_pog_index].H + 0.02;
                    }
                    var x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X;
                    if (g_duplicate_fixel_flag == "N") {
                        var y = shelfY;
                    } else {
                        var y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].H + parseFloat($v("P25_TEXT_HEIGHT")) / 100 / 2 + g_pog_json[p_pog_index].BaseH;
                    }
                }

                ShelfInfo["Shelf"] = $v("P25_TEXT_ID");
                ShelfInfo["ObjType"] = $v("P25_OBJECT_TYPE");
                ShelfInfo["Desc"] = $v("P25_TEXT_NAME");
                ShelfInfo["MaxMerch"] = 0;
                ShelfInfo["GrillH"] = 0;
                ShelfInfo["LOverhang"] = 0;
                ShelfInfo["ROverhang"] = 0;
                ShelfInfo["SpacerThick"] = 0;
                ShelfInfo["HorizGap"] = 0;
                ShelfInfo["SpreadItem"] = "L";
                ShelfInfo["Combine"] = "N";
                ShelfInfo["AllowAutoCrush"] = "N";
                ShelfInfo["H"] = parseFloat($v("P25_TEXT_HEIGHT")) / 100;
                ShelfInfo["W"] = parseFloat($v("P25_TEXT_WIDTH")) / 100;
                ShelfInfo["D"] = 0.005;
                ShelfInfo["Rotation"] = parseFloat($v("P25_TEXT_ROTATION"));
                ShelfInfo["Slope"] = parseFloat($v("P25_TEXT_SLOPE"));
                ShelfInfo["Color"] = $v("P25_TEXT_COLOR");
                ShelfInfo["LiveImage"] = "";
                ShelfInfo["HorizSlotStart"] = 0;
                ShelfInfo["HorizSlotSpacing"] = 0;
                ShelfInfo["HorizStart"] = 0;
                ShelfInfo["HorizSpacing"] = 0;
                ShelfInfo["UOverHang"] = 0;
                ShelfInfo["LoOverHang"] = 0;
                ShelfInfo["VertiStart"] = 0;
                ShelfInfo["VertiSpacing"] = 0;
                ShelfInfo["X"] = x;
                ShelfInfo["Y"] = y;
                ShelfInfo["InputText"] = $v("P25_TEXT");
                ShelfInfo["WrapText"] = $v("P25_WRAP_TEXT");
                ShelfInfo["ReduceToFit"] = $v("P25_REDUCETOFIT");
                ShelfInfo["TextDirection"] = $v("P25_TEXT_DIRECTION");
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
                ShelfInfo["SlotOrientation"] = "";
                ShelfInfo["DividerFixed"] = "N";
                ShelfInfo["LObjID"] = -1;
                ShelfInfo["NotchLabelObjID"] = -1;
                ShelfInfo["ChestEdit"] = "N"; //Bug-26122 - splitting the chest
                ShelfInfo["FStyle"] = $v("P25_FONT_STYLE");
                ShelfInfo["FSize"] = $v("P25_FONT_SIZE");
                ShelfInfo["FBold"] = $v("P25_BOLD");
                if (g_temp_image_arr.length > 0) {
                    ShelfInfo["TextImg"] = g_temp_image_arr[0].Image;
                    ShelfInfo["TextImgName"] = g_temp_image_arr[0].FileName;
                    ShelfInfo["TextImgMime"] = g_temp_image_arr[0].MimeType;
                } else {
                    ShelfInfo["TextImg"] = "";
                    ShelfInfo["TextImgName"] = "";
                    ShelfInfo["TextImgMime"] = "";
                }
                //always a textbox will have a Moduleinfo inside the POG for every textbox shelfinfo. this is because
                //with match fixture label this textbox would be considered as the child module for the parent (parent means in which module this textbox is placed)
                ModuleInfo["SeqNo"] = g_pog_json[p_pog_index].ModuleInfo.length + 1;
                ModuleInfo["Module"] = $v("P25_TEXT_ID");
                ModuleInfo["ParentModule"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
                ModuleInfo["POGModuleName"] = $v("P25_TEXT_NAME");
                ModuleInfo["SubDept"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].SubDept;
                ModuleInfo["Remarks"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Remarks;
                ModuleInfo["H"] = parseFloat($v("P25_TEXT_HEIGHT")) / 100;
                ModuleInfo["W"] = parseFloat($v("P25_TEXT_WIDTH")) / 100;
                ModuleInfo["D"] = 0;
                ModuleInfo["Color"] = $v("P25_TEXT_COLOR");
                ModuleInfo["Rotation"] = 0;
                ModuleInfo["NotchW"] = 0;
                ModuleInfo["NotchStart"] = 0;
                ModuleInfo["NotchSpacing"] = 0;
                ModuleInfo["HorzStart"] = 0;
                ModuleInfo["HorzSpacing"] = 0;
                ModuleInfo["VertStart"] = 0;
                ModuleInfo["VertSpacing"] = 0;
                ModuleInfo["AllowOverlap"] = 0;
                ModuleInfo["LNotch"] = 0;
                ModuleInfo["Backboard"] = 0;
                ModuleInfo["RNotch"] = 0;
                ModuleInfo["X"] = 0;
                ModuleInfo["Y"] = 0;
                ModuleInfo["Z"] = 0;
                ModuleInfo["LastCount"] = 0;
                ModuleInfo["EditFlag"] = "N";
                ModuleInfo["Carpark"] = [];
                ModuleInfo["ShelfInfo"] = [];

                if (edited == "N") {
                    ShelfInfo["Z"] = g_pog_json[p_pog_index].BackDepth + ShelfInfo["D"] / 2;
                    //shelf_ind = -1;
                    ShelfInfo["ItemInfo"] = [];
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(ShelfInfo);
                    ShelfInfo["SIndex"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1;
                    g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.push(ShelfInfo);
                } else {
                    ShelfInfo["Z"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Z;
                    shelf_ind = g_shelf_index;
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index] = ShelfInfo;
                    if (child_module_index == -1) {
                        //ASA-1368 Start
                        g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);
                        g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ShelfInfo.push(ShelfInfo);
                        child_module_index = g_pog_json[p_pog_index].ModuleInfo.length - 1;
                    } else {
                        g_pog_json[p_pog_index].ModuleInfo[child_module_index] = ModuleInfo;
                        g_pog_json[p_pog_index].ModuleInfo[child_module_index].ShelfInfo[0] = ShelfInfo;
                    } //ASA-1368 End
                }
                //identify if any change in POG
                g_pog_edited_ind = "Y";

                if (g_show_live_image == "Y" && ShelfInfo["TextImg"] !== "" && typeof ShelfInfo["TextImg"] !== "undefined" && ShelfInfo["TextImg"] !== null) {
                    var return_val = await add_text_box_with_image(ShelfID, "SHELF", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, edited, g_module_index, ShelfInfo["InputText"], colorValue, ShelfInfo["WrapText"], ShelfInfo["ReduceToFit"], ShelfInfo["Color"], shelf_ind, ShelfInfo["Rotation"], ShelfInfo["Slope"], "Y", ShelfInfo["FStyle"], ShelfInfo["FSize"], ShelfInfo["FBold"], $v("P25_NOTCH_HEAD"), p_pog_index);
                } else {
                    var return_val = add_text_box(ShelfID, "SHELF", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, edited, g_module_index, ShelfInfo["InputText"], colorValue, ShelfInfo["WrapText"], ShelfInfo["ReduceToFit"], ShelfInfo["Color"], shelf_ind, ShelfInfo["Rotation"], ShelfInfo["Slope"], "Y", ShelfInfo["FStyle"], ShelfInfo["FSize"], ShelfInfo["FBold"], 2, p_pog_index, g_pogcr_enhance_textbox_fontsize, ShelfInfo["TextDirection"]); //ASA-1797.1
                }
                if (edited == "N") {
                    shelf_ind = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1;
                }
                var shelfz = get_textbox_z(g_module_index, shelf_ind, x, y, ShelfInfo["W"], ShelfInfo["H"], p_pog_index);
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[shelf_ind].Z = shelfz;

                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(return_val);
                if (shelfz == g_pog_json[p_pog_index].BackDepth) {
                    selectedObject.position.z = 0.001;
                } else {
                    selectedObject.position.z = shelfz > 0.0021 ? 0.0021 : shelfz == 0 ? 0.0006 : shelfz;
                }

                if (edited == "N") {
                    g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].ObjID = return_val;
                } else {
                    g_pog_json[p_pog_index].ModuleInfo[child_module_index].ObjID = return_val;
                    selectedObject.position.z = prevWorldZ; //ASA-1652
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[shelf_ind].Z = prevZ; //ASA-1652
                }

                //recreate the orientation view if any present
                async function recreate_view() {
                    var returnval = await recreate_compare_views(g_compare_view, "N");
                }
                recreate_view();

                $s("P25_SHELF_EDIT_IND", "N");
                closeInlineDialog("add_textbox");
                g_dblclick_opened = "N";
                g_duplicate_fixel_flag = "N";
                g_temp_image_arr = []; //ASA-2030.2
                apex.message.showPageSuccess(g_pog_refresh_msg);
                render(p_pog_index);
            }
        }
        logDebug("function : create_textbox", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is called when create or edit divider.
function create_divider(p_pog_index) {
    logDebug("function : create_divider", "S");
    var ShelfInfo = {};
    var ShelfID = $v("P25_DIVIDER_ID");
    var edited = apex.item("P25_ITEM_EDIT_IND").getValue();
    var colorValue = parseInt(apex.item("P25_DIV_COLOR").getValue().replace("#", "0x"), 16);
    var hex_decimal = new THREE.Color(colorValue);
    var item_cnt = -1;
    var div_valid = "Y"; //Task_26627
    var shelfY = 0;
    var added_value,
        upd_shelf_index = -1,
        rotation_check = "N",
        duplicate_ind = "N";
    var ItemInfo = {};
    var duplicate_ind = "N";
    try {
        if ($v("P25_MODULE_DISP") == "" && edited == "N") {
            var i = 0;
            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                    g_module_index = i;
                    break; //return false;
                }
                i++;
            }
        }

        //ASA-1862 Issue 1 & 2 Start        
        const shelfID_upper = ShelfID.toUpperCase().trim();
        //ASA-2049 Issue 5
        duplicate_ind = g_pog_json[p_pog_index].ModuleInfo.some(module =>
            module.ShelfInfo.some(shelf => {
                if (edited === "Y" && shelf.ShelfDivObjID === g_dblclick_objid) {
                    return false;
                }
                if (
                    shelf.Shelf &&
                    shelf.Shelf.toUpperCase().trim() === shelfID_upper
                ) {
                    return true;
                }
                if (Array.isArray(shelf.ItemInfo)) {
                    return shelf.ItemInfo.some(item => {
                        if (edited === "Y" && item.ObjID === g_dblclick_objid) {
                            return false;
                        }
                        return (
                            item.ItemID &&
                            item.ItemID.toUpperCase().trim() === shelfID_upper
                        );
                    });
                }
                return false;
            })
        ) ? "Y" : "N";
        //ASA-2049 Issue 5

        if (edited == "Y") {
            var i = 0;
            for (const shelf of g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo) {
                if (shelf.ShelfDivObjID == g_dblclick_objid) {
                    ShelfInfo = shelf;
                    upd_shelf_index = i;
                    //duplicate_ind = 'Y';
                    break; //return false; // Loop will stop running after this
                }
                i++;
            }

            if (parseFloat($v("P25_DIV_ROTATION")) !== 0) {
                // Task_26627 found bug when create new divider and rotation is > 0
                var shelf_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X - parseFloat($v("P25_DIV_WIDTH")) / 2;
                var module_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X - g_pog_json[p_pog_index].ModuleInfo[g_module_index].W / 2;
                var shelf_end = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X + parseFloat($v("P25_DIV_WIDTH")) / 2;
                var module_end = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X + g_pog_json[p_pog_index].ModuleInfo[g_module_index].W / 2;
                var shelf_top = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y + parseFloat($v("P25_DIV_HEIGHT")) / 2;
                var shelf_bottom = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y - parseFloat($v("P25_DIV_HEIGHT")) / 2;

                if ((shelf_start >= module_start || shelf_end <= module_end || (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X > module_start && g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X < module_end)) && shelf_top < g_pog_json[p_pog_index].ModuleInfo[g_module_index].H && shelf_bottom > 0) {
                    rotation_check = "Y";
                }
            }
            //Start Task_26627
            ItemInfo = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType !== "PALLET" && g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType !== "CHEST") {
                div_valid = "N";
            }
            //End Task_26627
        }

        if (duplicate_ind == "Y") {
            alert(get_message("COMPONENT_UNIQUE_ID"));
        } else if ($v("P25_DIV_HEIGHT") == "" || $v("P25_DIV_WIDTH") == "" || $v("P25_DIV_DEPTH") == "" || $v("P25_DIV_COLOR") == "" || $v("P25_DIVIDER_ID") == "") {
            alert(get_message("ENTER_MANDATORY_FIELDS"));
        } else if ($v("P25_DIV_ROTATION") !== "" && (parseFloat($v("P25_DIV_ROTATION")) > 359 || parseFloat($v("P25_DIV_ROTATION")) < 0)) {
            alert(get_message("ROTATION_BTW_RANGE"));
        } else if ($v("P25_DIV_HEIGHT") == 0) {
            alert(get_message("HEIGHT_GRT_THAN_ZERO"));
        } else if ($v("P25_DIV_WIDTH") == 0) {
            alert(get_message("WIDTH_GRT_THAN_ZERO"));
        } else if ($v("P25_DIV_DEPTH") == 0) {
            alert(get_message("DEPTH_GRT_THAN_ZERO"));
        } else if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length == 0) {
            alert(get_message("DIVIDER_WTOT_SHELF"));
        } else if (parseFloat($v("P25_DIV_ROTATION")) > 0 && div_valid == "N") {
            //Task_26627
            alert(get_message("DIV_NOT_ROTATE"));
        } else {
            var z = 0.004;
            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length > 0 && edited == "N") {
                var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo;
                var max_distance_arr = [];
                var min_index_arr = [];
                var i = 0;
                for (const shelfs of shelf_arr) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                        max_distance_arr.push(shelfs.Y);
                        min_index_arr.push(i);
                    }
                    i++;
                }

                var max_distance = Math.max.apply(Math, max_distance_arr);
                var index = max_distance_arr.findIndex(function (number) {
                    return number == max_distance;
                });
                g_shelf_index = min_index_arr[index];
            }
            if (edited == "Y") {
                var x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X;
                var y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y;
            } else {
                x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].X - g_pog_json[p_pog_index].ModuleInfo[g_module_index].W / 2 + parseFloat($v("P25_DIV_WIDTH")) / 100 / 2;
                y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Y + g_pog_json[p_pog_index].ModuleInfo[g_module_index].H / 2 + parseFloat($v("P25_DIV_HEIGHT")) / 100 / 2;
            }
            //as divider is a fixel but it is consider as a item inside the shelf, which is dragged and placed according to shelf spread setting.
            //so we keep one shelfinfo for data to be saved in sm_pog_fixel and a iteminfo for use to use it for all actions on screen. both data
            //should be in sync always.
            ShelfInfo["Shelf"] = ShelfID;
            ShelfInfo["ObjType"] = $v("P25_OBJECT_TYPE");
            ShelfInfo["Desc"] = $v("P25_DIVIDER_NAME");
            ShelfInfo["MaxMerch"] = 0;
            ShelfInfo["GrillH"] = 0;
            ShelfInfo["LOverhang"] = 0;
            ShelfInfo["ROverhang"] = 0;
            ShelfInfo["SpacerThick"] = 0;
            ShelfInfo["HorizGap"] = 0;
            ShelfInfo["SpreadItem"] = "L";
            ShelfInfo["Combine"] = "N";
            ShelfInfo["AllowAutoCrush"] = "N";
            ShelfInfo["H"] = parseFloat($v("P25_DIV_HEIGHT")) / 100;
            ShelfInfo["W"] = parseFloat($v("P25_DIV_WIDTH")) / 100;
            ShelfInfo["D"] = parseFloat($v("P25_DIV_DEPTH")) / 100;
            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "PALLET" || g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "CHEST") {
                ShelfInfo["Rotation"] = parseFloat($v("P25_DIV_ROTATION"));
            } else {
                ShelfInfo["Rotation"] = 0;
            }
            ShelfInfo["Slope"] = 0;
            ShelfInfo["Color"] = $v("P25_DIV_COLOR");
            ShelfInfo["LiveImage"] = "";
            ShelfInfo["HorizSlotStart"] = 0;
            ShelfInfo["HorizSlotSpacing"] = 0;
            ShelfInfo["HorizStart"] = 0;
            ShelfInfo["HorizSpacing"] = 0;
            ShelfInfo["UOverHang"] = 0;
            ShelfInfo["LoOverHang"] = 0;
            ShelfInfo["VertiStart"] = 0;
            ShelfInfo["VertiSpacing"] = 0;
            ShelfInfo["X"] = x;
            ShelfInfo["Y"] = y;

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
            ShelfInfo["SlotDivider"] = $v("P25_SLOT_DIVIDER");
            ShelfInfo["AllowOverLap"] = "N";
            ShelfInfo["AutoPlacing"] = "N";
            ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
            ShelfInfo["SlotOrientation"] = $v("P25_SLOT_ORIENTATION");
            ShelfInfo["DividerFixed"] = $v("P25_DIVIDER_FIXED");
            ShelfInfo["LObjID"] = -1;
            ShelfInfo["NotchLabelObjID"] = -1;
            ShelfInfo["FStyle"] = "";
            ShelfInfo["FSize"] = "";
            ShelfInfo["FBold"] = "";
            ShelfInfo["TextImg"] = "";
            ShelfInfo["TextImgName"] = "";
            ShelfInfo["TextImgMime"] = "";
            ShelfInfo["TextImageBlob"] = "";
            ShelfInfo["Overhung"] = "N"; //ASA-1109

            ItemInfo["ItemID"] = ShelfID;
            ItemInfo["Item"] = $v("P25_OBJECT_TYPE");
            ItemInfo["W"] = parseFloat($v("P25_DIV_WIDTH")) / 100;
            ItemInfo["H"] = parseFloat($v("P25_DIV_HEIGHT")) / 100;
            ItemInfo["D"] = parseFloat($v("P25_DIV_DEPTH")) / 100;
            ItemInfo["Color"] = $v("P25_DIV_COLOR");
            ItemInfo["DimT"] = "";
            ItemInfo["Desc"] = $v("P25_DIVIDER_NAME");
            ItemInfo["Barcode"] = "";
            ItemInfo["LocID"] = "";
            ItemInfo["PegID"] = "";
            ItemInfo["PegSpread"] = "";
            ItemInfo["PegPerFacing"] = "";
            ItemInfo["Fixed"] = $v("P25_DIVIDER_FIXED");
            ItemInfo["CapStyle"] = "";

            if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "PALLET" || g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType == "CHEST") {
                ItemInfo["Rotation"] = parseFloat($v("P25_DIV_ROTATION"));
            } else {
                ItemInfo["Rotation"] = 0;
            }
            ItemInfo["BHoriz"] = 1;
            ItemInfo["BVert"] = 1;
            ItemInfo["BaseD"] = 1;
            ItemInfo["CrushHoriz"] = 0;
            ItemInfo["CrushVert"] = 0;
            ItemInfo["CrushD"] = 0;
            ItemInfo["Orientation"] = $v("P25_SLOT_ORIENTATION");
            ItemInfo["MerchStyle"] = "0";
            ItemInfo["Supplier"] = "";
            ItemInfo["Brand"] = "";
            ItemInfo["Group"] = "";
            ItemInfo["Dept"] = "";
            ItemInfo["Class"] = "";
            ItemInfo["SubClass"] = "";
            ItemInfo["StdUOM"] = "";
            ItemInfo["SizeDesc"] = "";
            ItemInfo["Price"] = "";
            ItemInfo["Cost"] = "";
            ItemInfo["RegMovement"] = "";
            ItemInfo["AvgSales"] = "";
            ItemInfo["ItemStatus"] = "";
            ItemInfo["MoveBasis"] = "";

            ItemInfo["CHPerc"] = 0;
            ItemInfo["CWPerc"] = 0;
            ItemInfo["CDPerc"] = 0;
            ItemInfo["ItemNesting"] = 0;
            ItemInfo["NVal"] = 0;
            ItemInfo["ItemContain"] = 0;
            ItemInfo["CnVal"] = 0;
            ItemInfo["IsContainer"] = $v("P25_PRODUCT_IS_CONT");
            ItemInfo["BsktFactor"] = 0;
            ItemInfo["OverHang"] = 0;
            ItemInfo["HorizGap"] = 0;
            ItemInfo["VertGap"] = 0;
            ItemInfo["UW"] = 0;
            ItemInfo["UH"] = 0;
            ItemInfo["UD"] = 0;
            ItemInfo["CW"] = 0;
            ItemInfo["CH"] = 0;
            ItemInfo["CD"] = 0;
            ItemInfo["TW"] = 0;
            ItemInfo["TH"] = 0;
            ItemInfo["TD"] = 0;
            ItemInfo["DW"] = 0;
            ItemInfo["DH"] = 0;
            ItemInfo["DD"] = 0;
            ItemInfo["CWPerc"] = 0;
            ItemInfo["CHPerc"] = 0;
            ItemInfo["CDPerc"] = 0;
            ItemInfo["CnW"] = 0;
            ItemInfo["CnH"] = 0;
            ItemInfo["CnD"] = 0;
            ItemInfo["NW"] = 0;
            ItemInfo["NH"] = 0;
            ItemInfo["ND"] = 0;
            ItemInfo["OrgUW"] = 0;
            ItemInfo["OrgUH"] = 0;
            ItemInfo["OrgUD"] = 0;
            ItemInfo["OrgCW"] = 0;
            ItemInfo["OrgCH"] = 0;
            ItemInfo["OrgCD"] = 0;
            ItemInfo["OrgTW"] = 0;
            ItemInfo["OrgTH"] = 0;
            ItemInfo["OrgTD"] = 0;
            ItemInfo["OrgDW"] = 0;
            ItemInfo["OrgDH"] = 0;
            ItemInfo["OrgDD"] = 0;
            ItemInfo["OrgCHPerc"] = 0;
            ItemInfo["OrgCWPerc"] = 0;
            ItemInfo["OrgCDPerc"] = 0;
            ItemInfo["OrgCnW"] = 0;
            ItemInfo["OrgCnH"] = 0;
            ItemInfo["OrgCnD"] = 0;
            ItemInfo["OrgNW"] = 0;
            ItemInfo["OrgNH"] = 0;
            ItemInfo["OrgND"] = 0;
            ItemInfo["SIndex"] = g_shelf_index;
            ItemInfo["Dragged"] = "N";
            ItemInfo["Quantity"] = 0;
            ItemInfo["X"] = x;
            ItemInfo["Y"] = y;
            ItemInfo["Z"] = g_pog_json[p_pog_index].BackDepth + ShelfInfo["D"] / 2;
            ItemInfo["SlotDivider"] = $v("P25_SLOT_DIVIDER");
            ItemInfo["ImgExists"] = "N";
            ItemInfo["CapCount"] = 0;
            ItemInfo["Exists"] = "E";
            ItemInfo["DimUpdate"] = "N";
            ItemInfo["TopObjID"] = "";
            ItemInfo["BottomObjID"] = "";
            ItemInfo["SecondTier"] = "N";
            ItemInfo["SellingPrice"] = "";
            ItemInfo["SalesUnit"] = "";
            ItemInfo["NetSales"] = "";
            ItemInfo["CogsAdj"] = "";
            ItemInfo["GrossProfit"] = "";
            ItemInfo["WeeksCount"] = "";
            ItemInfo["MovingItem"] = "";
            ItemInfo["Profit"] = "";
            ItemInfo["TotalMargin"] = "";
            ItemInfo["MHorizFacings"] = -1;
            ItemInfo["MVertFacings"] = -1;
            ItemInfo["MDepthFacings"] = -1;
            ItemInfo["Status"] = "";
            ItemInfo["DaysOfSupply"] = "";
            ItemInfo["OrientationDesc"] = "";
            ItemInfo["StoreCnt"] = "";
            ItemInfo["CapMaxH"] = "";
            ItemInfo["MaxHCapStyle"] = "";
            ItemInfo["NewYN"] = "";
            ItemInfo["Delist"] = "N";
            ItemInfo["DescSecond"] = "";
            //ASA-1640 Start
            ItemInfo["ItemCondition"] = "";
            ItemInfo["AUR"] = "";
            ItemInfo["ItemRanking"] = "";
            ItemInfo["WeeklySales"] = "";
            ItemInfo["WeeklyNetMargin"] = "";
            ItemInfo["WeeklyQty"] = "";
            ItemInfo["NetMarginPercent"] = "";
            ItemInfo["CumulativeNM"] = "";
            ItemInfo["TOP80B2"] = "";
            ItemInfo["ItemBrandC"] = "";
            ItemInfo["ItemPOGDept"] = "";
            ItemInfo["ItemRemark"] = "";
            ItemInfo["RTVStatus"] = "";
            ItemInfo["Pusher"] = "";
            ItemInfo["Divider"] = "";
            ItemInfo["BackSupport"] = "";
            //ASA-1640 End
            //ASA-2013 Start
            ItemInfo["ShelfPrice"] = "";
            ItemInfo["PromoPrice"] = "";
            ItemInfo["DiscountRate"] = "";
            ItemInfo["PriceChangeDate"] = "";
            ItemInfo["WeeksOfInventory"] = "";
            ItemInfo["Qty"] = "";
            ItemInfo["WhStock"] = "";
            ItemInfo["StoreStock"] = "";
            ItemInfo["StockIntransit"] = "";
            //ASA-2013 End
            ItemInfo["OOSPerc"] = ""; //ASA-1688 Added for oos%
            ItemInfo["InitialItemDesc"] = ""; //ASA-1734 Issue 1
            ItemInfo["InitialBrand"] = ""; //ASA-1787 Request #6
            ItemInfo["InitialBarcode"] = ""; //ASA-1787 Request #6

            if (edited == "N") {
                ShelfInfo["Z"] = g_pog_json[p_pog_index].BackDepth + ShelfInfo["D"] / 2;
                ShelfInfo["ItemInfo"] = [];
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(ShelfInfo);
                upd_shelf_index = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length - 1;
                ItemInfo["OW"] = parseFloat($v("P25_DIV_WIDTH")) / 100;
                ItemInfo["OH"] = parseFloat($v("P25_DIV_HEIGHT")) / 100;
                ItemInfo["OD"] = parseFloat($v("P25_DIV_DEPTH")) / 100;
                ItemInfo["SpreadItem"] = 0;
                ItemInfo["MHorizCrushed"] = "N";
                ItemInfo["MVertCrushed"] = "N";
                ItemInfo["MDepthCrushed"] = "N";
                ItemInfo["RW"] = ItemInfo["OW"];
                ItemInfo["RH"] = ItemInfo["OH"];
                ItemInfo["RD"] = ItemInfo["OD"];
                ItemInfo["LObjID"] = -1;
                ItemInfo["SubLblObjID"] = -1; //ASA-1182
                if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length > 0) {
                    ItemInfo["SIndex"] = g_shelf_index;
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.push(ItemInfo);
                } else {
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ItemInfo = [];
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ItemInfo.push(ItemInfo);
                }
                item_cnt = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1;
            } else {
                ShelfInfo["Z"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Z;
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[upd_shelf_index] = ShelfInfo;
                ItemInfo["OW"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].OW;
                ItemInfo["OH"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].OH;
                ItemInfo["OD"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].OD;
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index] = ItemInfo;
                item_cnt = g_item_index;
            }

            if (edited == "Y") {
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_dblclick_objid);
                g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                render(p_pog_index);
            }

            //identify if any change in POG
            g_pog_edited_ind = "Y";

            var oBjID = add_items(ShelfID, ItemInfo["W"], ItemInfo["H"], ItemInfo["D"], ItemInfo["Color"], x, y, z, g_module_index, g_shelf_index, item_cnt, ItemInfo["Rotation"], p_pog_index);
            if (edited == "N") {
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1].ObjID = oBjID;
            } else {
                g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].ObjID = oBjID;
            }
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[upd_shelf_index].ShelfDivObjID = oBjID;

            //recreate the orientation view if any present
            async function recreate_view() {
                var returnval = await recreate_compare_views(g_compare_view, "N");
            }
            recreate_view();

            $s("P25_ITEM_EDIT_IND", "N");
            closeInlineDialog("add_divider");
            g_dblclick_opened = "N";
            g_duplicate_fixel_flag = "N";
            apex.message.showPageSuccess(g_pog_refresh_msg);
            render(p_pog_index);
        }
        logDebug("function : create_divider", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is used in renumbering. we do fixel renumbering based on the setup on renumbering screen.
/*p_order_dir - Left to Right then Top to Bottom	LRTB
                Left to Right then Bottom to Top	LRBT
                Top to Bottom then Left to Right	TBLR
                Bottom to Top then Left to Right	BTLR
p_module_dir -  Left to Right	LR
                Right to Left	RL
p_ignore     -  Ignore Dividers	    D
                Ignore Text boxes	T
p_start_one_mod - Start at 1 for each Module - 2
p_include_mod_num - Include Module Number	3
p_separator - /.
*/
async function fixture_numbering(p_module_dir, p_order_dir, p_ignore, p_order_type, p_start_one_mod, p_include_mod_num, p_separator, p_leading_text, p_trailing_text, p_pog_index) {
    logDebug("function : fixture_numbering; module_dir : " + p_module_dir + "; order_dir : " + p_order_dir + "; ignore : " + p_ignore + "; order_type : " + p_order_type + "; start_one_mod : " + p_start_one_mod + "; include_mod_num : " + p_include_mod_num + "; separator : " + p_separator + "; leading_text : " + p_leading_text + "; trailing_text : " + p_trailing_text, "S");
    var l_self_id = 0,
        mod_num = 0,
        shelf_name = "";
    var l_module;
    var module_details = g_pog_json[p_pog_index].ModuleInfo;
    var shelf_arr = [];
    var loc_details = {};
    g_delete_details = [];
    g_multi_drag_shelf_arr = [];
    g_multi_drag_item_arr = [];
    g_cut_copy_arr = [];
    g_undo_details = [];
    if (g_keyCode == 89 || g_keyCode == 90) {
    } else {
        g_redo_all_obj_arr = [];
        g_redo_final_obj_arr = [];
        undoType = "U";
        g_undoRedoAction = "REDO";
    }
    var finalAction;
    if (g_undoRedoAction == "REDO") {
        finalAction = "U";
    } else {
        finalAction = "R";
    }
    g_pog_json[p_pog_index].ShelfIgnore = p_ignore;
    g_prev_undo_action = "FIXTURE_NUMBERING";

    if (g_l_module_dir !== "" || typeof g_l_module_dir !== "undefined") {
        loc_details["MODULE_DIR"] = g_l_module_dir;
        loc_details["DIRECTION"] = g_l_direction;
        loc_details["IGNORE"] = g_l_ignore;
        loc_details["ORDER_TYPE"] = g_l_order_type;
        loc_details["START_ONE_MOD"] = g_l_start_one_mod;
        loc_details["INCLUDE_MOD_NAME"] = g_l_include_mod_name;
        loc_details["SEPARATOR"] = g_l_separator;
        loc_details["LEADING_TEXT"] = g_l_leading_text;
        loc_details["TRAILING_TEXT"] = g_l_trailing_text;
        g_cut_copy_arr.push(loc_details);
        loc_details = {};
        if (finalAction == "U") {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_undo_all_obj_arr = [];

            g_undo_all_obj_arr.push(g_cut_copy_arr);
            g_undo_all_obj_arr.push(g_cut_copy_arr);
            g_undo_all_obj_arr.previousAction = "FIXTURE_NUMBERING";
            if (g_cut_support_obj_arr.length > 0) {
                //yrc
                g_undo_all_obj_arr.hasSupportArr = "Y";
            } else {
                g_undo_all_obj_arr.hasSupportArr = "N";
            }
            g_undo_all_obj_arr.g_MultiObjects = "N";
            g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
            g_undo_final_obj_arr.push(g_undo_all_obj_arr);
            g_undo_all_obj_arr = [];
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            g_undo_details = [];
        } else {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_redo_all_obj_arr = [];
            g_redo_all_obj_arr.push(g_cut_copy_arr);
            g_redo_all_obj_arr.push(g_cut_copy_arr);
            g_redo_all_obj_arr.previousAction = "FIXTURE_NUMBERING";
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
            g_redo_all_obj_arr = [];
        }
    }
    try {
        var l_pog_shelf_count = 0; // ASA-1823 S Issue 1 ,2 ,3
        var p = 0;
        if ($v("P25_POG_FIXEL_ID_PAD_SHELF_NO") === "Y") {
            for (const modules of module_details) {
                if (typeof modules.ParentModule === "undefined" || modules.ParentModule === null) {
                    var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[p].ShelfInfo || [];
                    for (const shelf of l_shelf_details) {
                        if (shelf.ObjType !== "TEXTBOX" && shelf.ObjType !== "DIVIDER") {
                            l_pog_shelf_count++;
                        }
                    }
                }
            }
            p++;
        } // ASA-1823 E Issue 1

        if (p_module_dir == "LR") {
            //if renumbering to be done from left to right of the module.
            var i = 0;
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    mod_num = mod_num + 1;
                    var ModStart = modules.X - modules.W / 2;
                    var ModEnd = modules.X + modules.W / 2;
                    var ModTop = modules.Y + modules.H / 2;
                    var ModBottom = modules.Y - modules.H / 2;

                    if (g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo.length > 0) {
                        // p_order_dir can be BTLR, LRBT,LRTB,TBLR
                        if (p_order_dir == "BTLR" || (p_order_dir == "LRBT" && p_order_type == 2)) {
                            var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                            l_shelf_details.forEach(function (d) {
                                d.CalcX = d.X - d.W / 2;
                            });
                            if (p_order_dir == "BTLR") {
                                var sorto = {
                                    CalcX: "asc",
                                    Y: "asc",
                                };

                                l_shelf_details.keySort(sorto);
                            } else {
                                var sorto = {
                                    Y: "asc",
                                };

                                l_shelf_details.keySort(sorto);
                            }

                            var j = 0;
                            var l_valid_shelf_count = 0; // ASA-1823 S Issue 2 ,3
                            if ($v("P25_POG_FIXEL_ID_PAD_SHELF_NO") === "Y") {
                                for (const shelf of l_shelf_details) {
                                    if (shelf.ObjType !== "TEXTBOX" && shelf.ObjType !== "DIVIDER") {
                                        l_valid_shelf_count++;
                                    }
                                }
                            }
                            for (const shelfs of l_shelf_details) {
                                var valid = "N";
                                var shelf_start = shelfs.X - shelfs.W / 2;
                                var shelf_end = shelfs.X + shelfs.W / 2;
                                if (((shelfs.X > ModStart && shelfs.X <= ModEnd) || (shelf_start >= ModStart && shelf_start < ModEnd) || (shelf_end > ModStart && shelf_end < ModEnd)) && shelfs.Y > ModBottom && shelfs.Y < ModTop) {
                                    valid = "Y";
                                }
                                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && valid == "Y") {
                                    if ((p_ignore == "T:D" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") || (p_ignore == "T" && shelfs.ObjType !== "TEXTBOX") || (p_ignore == "D" && shelfs.ObjType !== "DIVIDER") || p_ignore == "") {
                                        if (p_order_type == "1") {
                                            l_self_id = l_self_id + 1;
                                            if (l_pog_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                //ASA-1823 Add condition Issue 1
                                                shelf_name = "0" + l_self_id;
                                            } else {
                                                shelf_name = l_self_id;
                                            }
                                        } else {
                                            if ((modules.Module != l_module || l_module == "") && p_start_one_mod == "2") {
                                                l_self_id = 0;
                                            }
                                            l_self_id = l_self_id + 1;
                                            l_module = modules.Module;
                                            if (p_include_mod_num == "3") {
                                                if (l_valid_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                    //ASA-1823 Add condition Issue 1
                                                    shelf_name = "0" + l_self_id;
                                                } else {
                                                    shelf_name = l_self_id;
                                                }
                                                shelf_name = mod_num + p_separator + shelf_name;
                                            } else {
                                                if (l_valid_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                    //ASA-1823 Add condition Issue 1
                                                    shelf_name = "0" + l_self_id;
                                                } else {
                                                    shelf_name = l_self_id;
                                                }
                                            }
                                        }
                                        var new_self_id = p_leading_text + " " + shelf_name + " " + p_trailing_text;
                                        new_self_id = new_self_id.trim();
                                        if (shelfs.ObjType == "DIVIDER") {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (shelfs.ShelfDivObjID == items.ObjID) {
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_self_id;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (shelfs.ObjType == "TEXTBOX") {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            $.each(module_details, function (k, modules_info) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    if (shelfs.SObjID == modules_info.ObjID) {
                                                        g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                        g_pog_json[p_pog_index].ModuleInfo[k].Module = new_self_id;
                                                        $.each(modules_info.ShelfInfo, function (l, shelf_info) {
                                                            g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_self_id;
                                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "";
                                                        });
                                                    }
                                                }
                                            });
                                        }

                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf = new_self_id;
                                    } else {
                                        //ASA-1530 S
                                        var new_text = "";
                                        var textbox_found = "N";
                                        if (shelfs.ObjType == "DIVIDER" && (typeof shelfs.Namechange == "undefined" || shelfs.Namechange == "")) {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (shelfs.ShelfDivObjID == items.ObjID) {
                                                                new_text = $v("P25_DIVIDER_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_text;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (shelfs.ObjType == "TEXTBOX" && (typeof shelfs.Namechange == "undefined" || shelfs.Namechange == "")) {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            $.each(module_details, function (k, modules_info) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    var labl_type = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                    var prefix = labl_type.split("_")[0];
                                                    if (shelfs.SObjID == modules_info.ObjID) {
                                                        if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                            textbox_found = "Y";
                                                            new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].Module = new_text;
                                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                            $.each(modules_info.ShelfInfo, function (l, shelf_info) {
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_text;
                                                            });
                                                        }
                                                    }
                                                }
                                            });
                                            if (textbox_found == "N") {
                                                var labl_type = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                                var prefix = labl_type.split("_")[0];
                                                if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                    new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                }
                                            }
                                        }
                                        if (new_text !== "") {
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf = new_text;
                                        }
                                    } //ASA-1530 E
                                }
                                j = j + 1;
                            }
                        } else if (p_order_dir == "TBLR" || (p_order_dir == "LRTB" && p_order_type == 2)) {
                            var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;

                            if (p_order_dir == "TBLR") {
                                l_shelf_details.forEach(function (d) {
                                    d.CalcX = wpdSetFixed(d.X - d.W / 2); //.toFixed(3));
                                });
                                var sorto = {
                                    CalcX: "desc",
                                    Y: "asc",
                                };

                                l_shelf_details.keySort(sorto);
                            } else {
                                var sorto = {
                                    Y: "asc",
                                };

                                l_shelf_details.keySort(sorto);
                            }
                            var l_valid_shelf_count = 0; // ASA-1823 S Issue 2 ,3
                            if ($v("P25_POG_FIXEL_ID_PAD_SHELF_NO") === "Y") {
                                for (const shelf of l_shelf_details) {
                                    if (shelf.ObjType !== "TEXTBOX" && shelf.ObjType !== "DIVIDER") {
                                        l_valid_shelf_count++;
                                    }
                                }
                            }
                            var shelf_cnt = l_shelf_details.length;
                            for (var j = l_shelf_details.length - 1; j >= 0; j--) {
                                shelf_cnt = shelf_cnt - 1;
                                var valid = "N";
                                var shelf_start = l_shelf_details[j].X - l_shelf_details[j].W / 2;
                                var shelf_end = l_shelf_details[j].X + l_shelf_details[j].W / 2;
                                if (((l_shelf_details[j].X > ModStart && l_shelf_details[j].X <= ModEnd) || (shelf_start >= ModStart && shelf_start < ModEnd) || (shelf_end > ModStart && shelf_end < ModEnd)) && l_shelf_details[j].Y > ModBottom && l_shelf_details[j].Y < ModTop) {
                                    valid = "Y";
                                }
                                if (l_shelf_details[j].ObjType !== "BASE" && l_shelf_details[j].ObjType !== "NOTCH" && valid == "Y") {
                                    if ((p_ignore == "T:D" && l_shelf_details[j].ObjType !== "DIVIDER" && l_shelf_details[j].ObjType !== "TEXTBOX") || (p_ignore == "T" && l_shelf_details[j].ObjType !== "TEXTBOX") || (p_ignore == "D" && l_shelf_details[j].ObjType !== "DIVIDER") || p_ignore == "") {
                                        if (p_order_type == "1") {
                                            l_self_id = l_self_id + 1;
                                            if (l_pog_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                //ASA-1823 Add condition Issue 1
                                                shelf_name = "0" + l_self_id;
                                            } else {
                                                shelf_name = l_self_id;
                                            }
                                        } else {
                                            if ((modules.Module != l_module || l_module == "") && p_start_one_mod == "2") {
                                                l_self_id = 0;
                                            }
                                            l_self_id = l_self_id + 1;
                                            l_module = modules.Module;
                                            if (p_include_mod_num == "3") {
                                                if (l_valid_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                    //ASA-1823 Add condition Issue 1
                                                    shelf_name = "0" + l_self_id;
                                                } else {
                                                    shelf_name = l_self_id;
                                                }
                                                shelf_name = mod_num + p_separator + shelf_name;
                                            } else {
                                                if (l_valid_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                    //ASA-1823 Add condition Issue 1
                                                    shelf_name = "0" + l_self_id;
                                                } else {
                                                    shelf_name = l_self_id;
                                                }
                                            }
                                        }
                                        var new_self_id = p_leading_text + " " + shelf_name + " " + p_trailing_text;
                                        new_self_id = new_self_id.trim();

                                        if (l_shelf_details[j].ObjType == "DIVIDER") {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (l_shelf_details[j].ShelfDivObjID == items.ObjID) {
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_self_id;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (l_shelf_details[j].ObjType == "TEXTBOX") {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            var k = 0;
                                            for (const modules_info of module_details) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    if (l_shelf_details[j].SObjID == modules_info.ObjID) {
                                                        g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                        g_pog_json[p_pog_index].ModuleInfo[k].Module = new_self_id;
                                                        var l = 0;
                                                        for (const shelf_info of modules_info.ShelfInfo) {
                                                            g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_self_id;
                                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "";
                                                            l++;
                                                        }
                                                    }
                                                }
                                                k++;
                                            }
                                        }
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf = new_self_id;
                                    } else {
                                        //ASA-1530 S
                                        var new_text = "";
                                        var textbox_found = "N";
                                        if (l_shelf_details[j].ObjType == "DIVIDER" && (typeof l_shelf_details[j].Namechange == "undefined" || l_shelf_details[j].Namechange == "")) {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (l_shelf_details[j].ShelfDivObjID == items.ObjID) {
                                                                new_text = $v("P25_DIVIDER_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_text;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "Y";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (l_shelf_details[j].ObjType == "TEXTBOX" && (typeof l_shelf_details[j].Namechange == "undefined" || l_shelf_details[j].Namechange == "")) {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            var k = 0;
                                            for (const modules_info of module_details) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    var labl_type = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                    var prefix = labl_type.split("_")[0];
                                                    if (l_shelf_details[j].SObjID == modules_info.ObjID) {
                                                        if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                            textbox_found = "Y";
                                                            new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].Module = new_text;
                                                            var l = 0;
                                                            for (const shelf_info of modules_info.ShelfInfo) {
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_text;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "Y";
                                                                l++;
                                                            }
                                                        }
                                                    }
                                                }
                                                k++;
                                            }
                                            if (textbox_found == "N") {
                                                var labl_type = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf;
                                                var prefix = labl_type.split("_")[0];
                                                if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                    new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf;
                                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "Y";
                                                }
                                            }
                                        }
                                        if (new_text !== "") {
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf;
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf = new_text;
                                        }
                                    } //ASA-1530 E
                                }
                            }
                        } else if ((p_order_dir == "LRBT" || p_order_dir == "LRTB") && p_order_type == 1) {
                            var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                            var j = 0;
                            for (const shelfs of l_shelf_details) {
                                var valid = "N";
                                var shelf_start = shelfs.X - shelfs.W / 2;
                                var shelf_end = shelfs.X + shelfs.W / 2;
                                if (((shelfs.X > ModStart && shelfs.X <= ModEnd) || (shelf_start >= ModStart && shelf_start < ModEnd) || (shelf_end > ModStart && shelf_end < ModEnd)) && shelfs.Y > ModBottom && shelfs.Y < ModTop) {
                                    valid = "Y";
                                }
                                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && valid == "Y") {
                                    if ((p_ignore == "T:D" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") || (p_ignore == "T" && shelfs.ObjType !== "TEXTBOX") || (p_ignore == "D" && shelfs.ObjType !== "DIVIDER") || p_ignore == "") {
                                        var shelfInfo = {};
                                        shelfInfo["Y"] = shelfs.Y - shelfs.H / 2;
                                        shelfInfo["SIndex"] = j;
                                        shelfInfo["MIndex"] = i;
                                        shelfInfo["ObjType"] = shelfs.ObjType;
                                        shelfInfo["Shelf"] = shelfs.Shelf;
                                        shelfInfo["ShelfDivObjID"] = shelfs.ShelfDivObjID;
                                        shelfInfo["SObjID"] = shelfs.SObjID;
                                        shelfs.Namechange = "";
                                        shelf_arr.push(shelfInfo);
                                    } else {
                                        //ASA-1530 s
                                        var new_text = "";
                                        var textbox_found = "N";
                                        if (shelfs.ObjType == "DIVIDER" && (typeof shelfs.Namechange == "undefined" || shelfs.Namechange == "")) {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (shelfs.ShelfDivObjID == items.ObjID) {
                                                                new_text = $v("P25_DIVIDER_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_text;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (shelfs.ObjType == "TEXTBOX" && (typeof shelfs.Namechange == "undefined" || shelfs.Namechange == "")) {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            var k = 0;
                                            for (const modules_info of module_details) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    var labl_type = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                    var prefix = labl_type.split("_")[0];
                                                    if (shelfs.SObjID == modules_info.ObjID) {
                                                        if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                            textbox_found = "Y";
                                                            new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].Module = new_text;
                                                            var l = 0;
                                                            for (const shelf_info of modules_info.ShelfInfo) {
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_text;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                                l++;
                                                            }
                                                        }
                                                    }
                                                }
                                                k++;
                                            }
                                            if (textbox_found == "N") {
                                                var labl_type = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                                var prefix = labl_type.split("_")[0];
                                                if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                    new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                }
                                            }
                                        }
                                        if (new_text !== "") {
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf = new_text;
                                        }
                                    } //ASA-1530 E
                                }
                                j = j + 1;
                            }
                            if (p_order_dir == "LRBT") {
                                shelf_arr.sort((a, b) => (a.Y > b.Y || (a.Y == b.Y && a.MIndex > b.MIndex) ? 1 : -1));
                            } else {
                                shelf_arr.sort((a, b) => (a.Y < b.Y || (a.Y == b.Y && a.MIndex > b.MIndex) ? 1 : -1));
                            }
                        }
                    }
                }
                i = i + 1;
            }
        } else if (p_module_dir == "RL") {
            var module_details = g_pog_json[p_pog_index].ModuleInfo;
            var mod_cnt = module_details.length;
            var mod_num = 0;
            for (var i = module_details.length - 1; i >= 0; i--) {
                mod_cnt = mod_cnt - 1;
                if (typeof module_details[i].ParentModule == "undefined" || module_details[i].ParentModule == null) {
                    mod_num = mod_num + 1;
                    var ModStart = module_details[i].X - module_details[i].W / 2;
                    var ModEnd = module_details[i].X + module_details[i].W / 2;
                    var ModTop = module_details[i].Y + module_details[i].H / 2;
                    var ModBottom = module_details[i].Y - module_details[i].H / 2;
                    if (module_details[i].ShelfInfo.length > 0) {
                        if (p_order_dir == "BTLR" || (p_order_dir == "LRBT" && p_order_type == 2)) {
                            var l_shelf_details = module_details[i].ShelfInfo;
                            if (p_order_dir == "BTLR") {
                                l_shelf_details.forEach(function (d) {
                                    d.CalcX = d.X - d.W / 2;
                                });
                                var sorto = {
                                    CalcX: "asc",
                                    Y: "asc",
                                };

                                l_shelf_details.keySort(sorto);
                            } else {
                                var sorto = {
                                    Y: "asc",
                                };

                                l_shelf_details.keySort(sorto);
                            }
                            var j = 0;
                            var l_valid_shelf_count = 0; // ASA-1823 S Issue 2 ,3
                            if ($v("P25_POG_FIXEL_ID_PAD_SHELF_NO") === "Y") {
                                for (const shelf of l_shelf_details) {
                                    if (shelf.ObjType !== "TEXTBOX" && shelf.ObjType !== "DIVIDER") {
                                        l_valid_shelf_count++;
                                    }
                                }
                            }
                            for (const shelfs of l_shelf_details) {
                                var valid = "N";
                                var shelf_start = l_shelf_details[j].X - l_shelf_details[j].W / 2;
                                var shelf_end = l_shelf_details[j].X + l_shelf_details[j].W / 2;
                                if (((l_shelf_details[j].X > ModStart && l_shelf_details[j].X <= ModEnd) || (shelf_start >= ModStart && shelf_start < ModEnd) || (shelf_end > ModStart && shelf_end < ModEnd)) && l_shelf_details[j].Y > ModBottom && l_shelf_details[j].Y < ModTop) {
                                    valid = "Y";
                                }
                                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && valid == "Y") {
                                    if ((p_ignore == "T:D" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") || (p_ignore == "T" && shelfs.ObjType !== "TEXTBOX") || (p_ignore == "D" && shelfs.ObjType !== "DIVIDER") || p_ignore == "") {
                                        if (p_order_type == "1") {
                                            l_self_id = l_self_id + 1;
                                            if (l_pog_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                //ASA-1823 Add condition Issue 1
                                                shelf_name = "0" + l_self_id;
                                            } else {
                                                shelf_name = l_self_id;
                                            }
                                        } else {
                                            if ((module_details[i].Module != l_module || l_module == "") && p_start_one_mod == "2") {
                                                l_self_id = 0;
                                            }
                                            l_self_id = l_self_id + 1;
                                            l_module = module_details[i].Module;
                                            if (p_include_mod_num == "3") {
                                                if (l_valid_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                    //ASA-1823 Add condition Issue 1
                                                    shelf_name = "0" + l_self_id;
                                                } else {
                                                    shelf_name = l_self_id;
                                                }
                                                shelf_name = mod_num + p_separator + shelf_name;
                                            } else {
                                                if (l_valid_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                    //ASA-1823 Add condition Issue 1
                                                    shelf_name = "0" + l_self_id;
                                                } else {
                                                    shelf_name = l_self_id;
                                                }
                                            }
                                        }
                                        var new_self_id = p_leading_text + " " + shelf_name + " " + p_trailing_text;
                                        new_self_id = new_self_id.trim();
                                        if (shelfs.ObjType == "DIVIDER") {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (shelfs.ShelfDivObjID == items.ObjID) {
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_self_id;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (shelfs.ObjType == "TEXTBOX") {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            var k = 0;
                                            for (const modules_info of module_details) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    if (l_shelf_details[j].SObjID == modules_info.ObjID) {
                                                        g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                        g_pog_json[p_pog_index].ModuleInfo[k].Module = new_self_id;
                                                        var l = 0;
                                                        for (const shelf_info of modules_info.ShelfInfo) {
                                                            g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_self_id;
                                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "";
                                                            l++;
                                                        }
                                                    }
                                                }
                                                k++;
                                            }
                                        }
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf = new_self_id;
                                    } else {
                                        //ASA-1530 S
                                        var new_text = "";
                                        var textbox_found = "N";
                                        if (shelfs.ObjType == "DIVIDER" && (typeof shelfs.Namechange == "undefined" || shelfs.Namechange == "")) {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (shelfs.ShelfDivObjID == items.ObjID) {
                                                                new_text = $v("P25_DIVIDER_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_self_id;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (shelfs.ObjType == "TEXTBOX" && (typeof shelfs.Namechange == "undefined" || shelfs.Namechange == "")) {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            var k = 0;
                                            for (const modules_info of module_details) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    var labl_type = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                    var prefix = labl_type.split("_")[0];
                                                    if (l_shelf_details[j].SObjID == modules_info.ObjID) {
                                                        textbox_found = "Y";
                                                        if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                            new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].Module = new_text;
                                                            var l = 0;
                                                            for (const shelf_info of modules_info.ShelfInfo) {
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_text;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                                l++;
                                                            }
                                                        }
                                                    }
                                                }
                                                k++;
                                            }
                                            if (textbox_found == "N") {
                                                var labl_type = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                                var prefix = labl_type.split("_")[0];
                                                if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                    new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Namechange = "Y";
                                                }
                                            }
                                        }
                                        if (new_text !== "") {
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf;
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Shelf = new_text;
                                        }
                                    }
                                }
                                j = j + 1;
                            }
                        } else if (p_order_dir == "TBLR" || (p_order_dir == "LRTB" && p_order_type == 2)) {
                            var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                            if (p_order_dir == "TBLR") {
                                l_shelf_details.forEach(function (d) {
                                    d.CalcX = wpdSetFixed(d.X - d.W / 2); //.toFixed(3));
                                });
                                var sorto = {
                                    CalcX: "desc",
                                    Y: "asc",
                                };

                                l_shelf_details.keySort(sorto);
                            } else {
                                var sorto = {
                                    Y: "asc",
                                };

                                l_shelf_details.keySort(sorto);
                            }
                            var l_valid_shelf_count = 0; // ASA-1823 S Issue 2 ,3
                            if ($v("P25_POG_FIXEL_ID_PAD_SHELF_NO") === "Y") {
                                for (const shelf of l_shelf_details) {
                                    if (shelf.ObjType !== "TEXTBOX" && shelf.ObjType !== "DIVIDER") {
                                        l_valid_shelf_count++;
                                    }
                                }
                            }
                            var shelf_cnt = l_shelf_details.length;
                            for (var j = l_shelf_details.length - 1; j >= 0; j--) {
                                shelf_cnt = shelf_cnt - 1;
                                var valid = "N";
                                var shelf_start = l_shelf_details[j].X - l_shelf_details[j].W / 2;
                                var shelf_end = l_shelf_details[j].X + l_shelf_details[j].W / 2;
                                if (((l_shelf_details[j].X > ModStart && l_shelf_details[j].X <= ModEnd) || (shelf_start >= ModStart && shelf_start < ModEnd) || (shelf_end > ModStart && shelf_end < ModEnd)) && l_shelf_details[j].Y > ModBottom && l_shelf_details[j].Y < ModTop) {
                                    valid = "Y";
                                }
                                if (l_shelf_details[j].ObjType !== "BASE" && l_shelf_details[j].ObjType !== "NOTCH" && valid == "Y") {
                                    if ((p_ignore == "T:D" && l_shelf_details[j].ObjType !== "DIVIDER" && l_shelf_details[j].ObjType !== "TEXTBOX") || (p_ignore == "T" && l_shelf_details[j].ObjType !== "TEXTBOX") || (p_ignore == "D" && l_shelf_details[j].ObjType !== "DIVIDER") || p_ignore == "") {
                                        if (p_order_type == "1") {
                                            l_self_id = l_self_id + 1;
                                            if (l_pog_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                //ASA-1823 Add condition  Issue 1
                                                shelf_name = "0" + l_self_id;
                                            } else {
                                                shelf_name = l_self_id;
                                            }
                                        } else {
                                            if ((module_details[i].Module != l_module || l_module == "") && p_start_one_mod == "2") {
                                                l_self_id = 0;
                                            }
                                            l_self_id = l_self_id + 1;
                                            l_module = module_details[i].Module;
                                            if (p_include_mod_num == "3") {
                                                if (l_valid_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                    //ASA-1823 Add condition Issue 1
                                                    shelf_name = "0" + l_self_id;
                                                } else {
                                                    shelf_name = l_self_id;
                                                }
                                                shelf_name = mod_num + p_separator + shelf_name;
                                            } else {
                                                if (l_valid_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                                                    //ASA-1823 Add condition Issue 1
                                                    shelf_name = "0" + l_self_id;
                                                } else {
                                                    shelf_name = l_self_id;
                                                }
                                            }
                                        }
                                        var new_self_id = p_leading_text + " " + shelf_name + " " + p_trailing_text;
                                        new_self_id = new_self_id.trim();
                                        if (l_shelf_details[j].ObjType == "DIVIDER") {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (l_shelf_details[j].ShelfDivObjID == items.ObjID) {
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_self_id;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (l_shelf_details[j].ObjType == "TEXTBOX") {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            var k = 0;
                                            for (const modules_info of module_details) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    if (l_shelf_details[j].SObjID == modules_info.ObjID) {
                                                        g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                        g_pog_json[p_pog_index].ModuleInfo[k].Module = new_self_id;
                                                        var l = 0;
                                                        for (const shelf_info of modules_info.ShelfInfo) {
                                                            g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_self_id;
                                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "";
                                                            l++;
                                                        }
                                                    }
                                                }
                                                k++;
                                            }
                                        }
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf = new_self_id;
                                    } else {
                                        //ASA-1530 S
                                        var new_text = "";
                                        var textbox_found = "";
                                        if (l_shelf_details[j].ObjType == "DIVIDER" && (typeof l_shelf_details[j].Namechange == "undefined" || l_shelf_details[j].Namechange == "")) {
                                            var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                                            var k = 0;
                                            for (const shelfs_detail of new_shelf_detail) {
                                                if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                                                    var l = 0;
                                                    for (const items of shelfs_detail.ItemInfo) {
                                                        if (items.Item == "DIVIDER") {
                                                            if (l_shelf_details[j].ShelfDivObjID == items.ObjID) {
                                                                new_text = $v("P25_DIVIDER_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[l].ItemID = new_text;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "Y";
                                                            }
                                                        }
                                                        l++;
                                                    }
                                                }
                                                k++;
                                            }
                                        } else if (l_shelf_details[j].ObjType == "TEXTBOX" && (typeof l_shelf_details[j].Namechange == "undefined" || l_shelf_details[j].Namechange == "")) {
                                            var module_details = g_pog_json[p_pog_index].ModuleInfo;
                                            var k = 0;
                                            for (const modules_info of module_details) {
                                                if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                                                    var labl_type = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                    var prefix = labl_type.split("_")[0];
                                                    if (l_shelf_details[j].SObjID == modules_info.ObjID) {
                                                        if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                            textbox_found = "Y";
                                                            new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                            g_pog_json[p_pog_index].ModuleInfo[k].Module = new_text;
                                                            var l = 0;
                                                            for (const shelf_info of modules_info.ShelfInfo) {
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = g_pog_json[p_pog_index].ModuleInfo[k].Module;
                                                                g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_text;
                                                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "Y";

                                                                l++;
                                                            }
                                                        }
                                                    }
                                                }
                                                k++;
                                            }
                                            if (textbox_found == "N") {
                                                var labl_type = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf;
                                                var prefix = labl_type.split("_")[0];
                                                if (!$v("P25_FIXTURE_LABEL_TYPES").includes(prefix)) {
                                                    new_text = $v("P25_TEXTBOX_START_WITH") + "" + g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf;
                                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Namechange = "Y";
                                                }
                                            }
                                        }
                                        if (new_text !== "") {
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].OldShelf = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf;
                                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_cnt].Shelf = new_text;
                                        }
                                    } //ASA-1530 E
                                }
                            }
                        }
                    }
                }
            }
        }

        if ((p_order_dir == "LRBT" || p_order_dir == "LRTB") && p_order_type == 1) {
            var j = 0;
            l_self_id = 0;
            for (const shelfs of shelf_arr) {
                l_self_id = l_self_id + 1;

                if (l_pog_shelf_count > 9 && l_self_id < 10 && $v("P25_POG_FIXEL_ID_PAD_SHELF_NO") == "Y") {
                    //ASA-1823 Add condition
                    shelf_name = "0" + l_self_id;
                } else {
                    shelf_name = l_self_id;
                }

                var new_self_id = p_leading_text + " " + shelf_name + " " + p_trailing_text;
                new_self_id = new_self_id.trim();

                if (shelfs.ObjType == "DIVIDER") {
                    var new_shelf_detail = g_pog_json[p_pog_index].ModuleInfo[shelfs.MIndex].ShelfInfo;
                    var k = 0;
                    for (const shelfs_detail of new_shelf_detail) {
                        if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER") {
                            var l = 0;
                            for (const items of shelfs_detail.ItemInfo) {
                                if (items.Item == "DIVIDER") {
                                    if (shelfs.ShelfDivObjID == items.ObjID) {
                                        g_pog_json[p_pog_index].ModuleInfo[shelfs.MIndex].ShelfInfo[k].ItemInfo[l].OldItemID = g_pog_json[p_pog_index].ModuleInfo[shelfs.MIndex].ShelfInfo[k].ItemInfo[l].ItemID;
                                        g_pog_json[p_pog_index].ModuleInfo[shelfs.MIndex].ShelfInfo[k].ItemInfo[l].ItemID = new_self_id;
                                    }
                                }
                                l++;
                            }
                        }
                        k++;
                    }
                } else if (shelfs.ObjType == "TEXTBOX") {
                    var module_details = g_pog_json[p_pog_index].ModuleInfo;
                    var k = 0;
                    for (const modules_info of module_details) {
                        if (typeof modules_info.ParentModule !== "undefined" && modules_info.ParentModule !== null) {
                            if (shelfs.SObjID == modules_info.ObjID) {
                                g_pog_json[p_pog_index].ModuleInfo[k].OldPOGModule = shelfs.Shelf;
                                g_pog_json[p_pog_index].ModuleInfo[k].Module = new_self_id;
                                var l = 0;
                                for (const shelf_info of modules_info.ShelfInfo) {
                                    g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].OldShelf = shelfs.Shelf;
                                    g_pog_json[p_pog_index].ModuleInfo[k].ShelfInfo[l].Shelf = new_self_id;
                                    l++;
                                }
                            }
                        }
                        k++;
                    }
                }
                g_pog_json[p_pog_index].ModuleInfo[shelfs.MIndex].ShelfInfo[shelfs.SIndex].OldShelf = shelfs.Shelf;
                g_pog_json[p_pog_index].ModuleInfo[shelfs.MIndex].ShelfInfo[shelfs.SIndex].Shelf = new_self_id;

                j = j + 1;
            }
        }
        var i = 0;
        for (const modules of module_details) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var j = 0;
                for (const shelfs of modules.ShelfInfo) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH") {
                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
                        if (typeof selectedObject !== "undefined") {
                            selectedObject.FixelID = shelfs.Shelf; //ASA-1125
                        }
                        if (shelfs.ObjType !== "TEXTBOX") {
                            for (const items of shelfs.ItemInfo) {
                                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                                if (typeof selectedObject !== "undefined") {
                                    selectedObject.Shelf = shelfs.Shelf;
                                    if (items.Item == "DIVIDER") {
                                        selectedObject.FixelID = shelfs.Shelf;
                                    }
                                    selectedObject.LocID;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (g_show_fixel_label == "Y") {
            show_fixel_labels(g_show_fixel_label, p_pog_index, p_pog_index);
        }
        g_dblclick_opened = "N";
        closeInlineDialog("renumbering");
        (g_l_module_dir = ""), (g_l_direction = ""), (g_l_ignore = ""), (g_l_order_type = ""), (g_l_start_one_mod = ""), (g_l_include_mod_name = ""), (g_l_separator = ""), (g_l_leading_text = ""), (g_l_trailing_text = ""), (g_l_start_one_mod_loc = ""), (g_l_start_one_fixel = "");
        logDebug("function : fixture_numbering", "E");
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1892 Issue5 Start
function get_shelf_pallet_items(p_module, p_shelf_index, p_module_index) {
    logDebug("function : get_shelf_pallet_items; p_module: " + p_module + "; p_shelf_index: " + p_shelf_index + "; p_module_index: " + p_module_index, "S");
    try {
        let l_itemsArr = [];
        let l_palletFound = false;
        let l_baseShelf = p_module.ShelfInfo[p_shelf_index];
        if (!l_baseShelf) return l_itemsArr;

        // Push base shelf items
        l_baseShelf.ItemInfo.forEach((l_item, l_idx) => {
            l_itemsArr.push({
                CType: l_baseShelf.ObjType,
                MIndex: p_module_index,
                SIndex: p_shelf_index,
                IIndex: l_idx,
                X: l_item.X,
                Y: l_item.Y,
                Z: l_item.Z,
                D: l_item.D,
                W: l_item.W,
                H: l_item.H,
                ItemID: l_item.ItemID,
                Item: l_item.Item,
                LocID: l_item.LocID,
            });
        });

        // Function to determine if a pallet belongs to this base shelf
        function isPartOfShelf(p_fix) {
            let l_currentFix = p_fix;

            while (true) {
                // Get all fixels below current pallet (lower Y)
                let l_belowList = [];
                p_module.ShelfInfo.forEach((sh, idx) => {
                    if (sh.Y < l_currentFix.Y) {
                        l_belowList.push({
                            idx,
                            ObjType: sh.ObjType,
                            Y: sh.Y,
                            W: sh.W
                        });
                    }
                });

                if (l_belowList.length === 0) return false;

                // Find the closest one below (highest Y among those lower)
                l_belowList.sort((a, b) => b.Y - a.Y);
                let l_belowFix = l_belowList[0];
                let l_fixObj = p_module.ShelfInfo[l_belowFix.idx];

                // FULL WIDTH shelf → success!
                let l_isFullWidthShelf =
                    (l_fixObj.ObjType === "SHELF" &&
                        wpdSetFixed(l_fixObj.W) === wpdSetFixed(p_module.W));

                if (l_isFullWidthShelf) return true;

                // SUBSHELF (pallet OR shelf with smaller width)
                let l_isSubShelf =
                    (l_fixObj.ObjType === "PALLET") ||
                    (l_fixObj.ObjType === "SHELF" &&
                        wpdSetFixed(l_fixObj.W) < wpdSetFixed(p_module.W));

                // If not subshelf → invalid chain
                if (!l_isSubShelf) return false;

                // Continue traversal downward
                l_currentFix = l_fixObj;
            }
        }

        var l_YTolerance = $v("P25_POGCR_SUBSHELF_THRESHOLD") / 100; //Threshold Value for distance between Shelf and Sub Pallet

        p_module.ShelfInfo.forEach((l_fix, l_fixIndex) => {

            if (l_fix.ObjType !== "PALLET" && l_fix.ObjType !== "SHELF") return;

            // Only pallets smaller than module width
            if (wpdSetFixed(l_fix.W) >= wpdSetFixed(p_module.W)) return;

            // Check X overlap
            let l_xOverlap =
                Math.abs(l_fix.X - l_baseShelf.X) <=
                ((l_fix.W / 2) + (l_baseShelf.W / 2));

            if (!l_xOverlap) return;

            // Pure positional check (top / inside)
            let l_palletBottom = l_fix.Y - l_fix.H / 2;
            let l_shelfTop = l_baseShelf.Y + l_baseShelf.H / 2;
            // let l_palletTop = l_fix.Y + l_fix.H / 2;
            // let l_shelfBottom = l_baseShelf.Y - l_baseShelf.H / 2;

            let l_isOnTop = Math.abs(l_palletBottom - l_shelfTop) <= Number(l_YTolerance);
            let l_isInsideShelf = l_palletBottom >= l_shelfTop;

            // NEW: let subshelf logic decide
            let l_belongsToShelf = l_isOnTop && l_isInsideShelf && isPartOfShelf(l_fix);

            if (!l_belongsToShelf) return;

            l_palletFound = true;

            // Add pallet items
            l_fix.ItemInfo.forEach((l_item, l_idx) => {
                l_itemsArr.push({
                    CType: l_fix.ObjType,
                    MIndex: p_module_index,
                    SIndex: l_fixIndex,
                    IIndex: l_idx,
                    X: l_item.X,
                    Y: l_item.Y,
                    Z: l_item.Z,
                    D: l_item.D,
                    W: l_item.W,
                    H: l_item.H,
                    ItemID: l_item.ItemID,
                    Item: l_item.Item,
                    LocID: l_item.LocID,
                });
            });
        });

        if (!l_palletFound) return [];
        l_itemsArr.sort((a, b) => a.X - b.X);
        logDebug("function : get_shelf_pallet_items", "E");
        return l_itemsArr;
    } catch (err) {
        error_handling(err);
    }
}
//ASA-1892 Issue5 End

//ASA-1892 Issue4 Changed Start with X
function sortPalletItems(p_pallet_dir = "") {
    logDebug("function : sortPalletItems; p_pallet_dir: " + p_pallet_dir, "S");
    try {
        let sorto;
        //ASA-1892 Issue4 Start
        if (p_pallet_dir == "FELR") {
            sorto = {
                Start: "asc",
                Front: "asc"
            };
        } else if (p_pallet_dir == "EFLR") {
            sorto = {
                Start: "asc",
                Back: "desc"
            };
        } else if (p_pallet_dir == "FERL") {
            sorto = {
                End: "desc",
                Front: "asc"
            };
        } else {
            sorto = {
                End: "desc",
                Back: "desc"
            };
        }
        //ASA-1892 Issue4 End
        logDebug("function : sortPalletItems", "E");
        return sorto;
    } catch (err) {
        error_handling(err);
    };
}

async function location_numbering(p_module_dir, p_order_dir, p_order_type, p_start_one_fixel, p_start_one_mod, p_pog_index, p_pallet_dir) {
    logDebug("function : location_numbering; module_dir : " + p_module_dir + "; order_dir : " + p_order_dir + "; order_type : " + p_order_type + "; start_one_fixel : " + p_start_one_fixel + "; start_one_mod : " + p_start_one_mod, "S");
    var l_item_id = 0,
        shelf_name = "";
    var l_module;
    var items_arr = [];
    var loc_details = {};
    g_delete_details = [];
    g_multi_drag_shelf_arr = [];
    g_multi_drag_item_arr = [];
    g_cut_copy_arr = [];
    g_undo_details = [];
    if (g_keyCode == 89 || g_keyCode == 90) {
    } else {
        g_redo_all_obj_arr = [];
        g_redo_final_obj_arr = [];
        undoType = "U";
        g_undoRedoAction = "REDO";
    }
    var finalAction;
    if (g_undoRedoAction == "REDO") {
        finalAction = "U";
    } else {
        finalAction = "R";
    }
    g_prev_undo_action = "LOCATION_NUMBERING";

    if (g_l_module_dir !== "") {
        loc_details["MODULE_DIR"] = g_l_module_dir;
        loc_details["DIRECTION"] = g_l_direction;
        loc_details["ORDER_TYPE"] = g_l_order_type;
        loc_details["START_ONE_FIXEL"] = g_l_start_one_fixel;
        loc_details["START_ONE_MOD_LOC"] = g_l_start_one_mod_loc;

        g_cut_copy_arr.push(loc_details);
        loc_details = {};
    }
    var module_details = g_pog_json[p_pog_index].ModuleInfo;
    try {
        if (p_start_one_fixel == 1) {
            var i = 0;
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            l_item_id = 0;
                            //ASA-1892.2 Start
                            var is_pallet_on_shelf = false; // variable for checking any subshelf or subpallet consists
                            //ASA-1892 Issue5 Start
                            if (shelfs.ObjType == "SHELF" && shelfs.W >= modules.W) {
                                var pallet_shelf_combine_items = get_shelf_pallet_items(modules, j, i);
                                is_pallet_on_shelf = pallet_shelf_combine_items?.length > 0;
                            }
                            if (shelfs.ObjType == "PALLET" || (shelfs.ObjType == "SHELF" && shelfs.W < modules.W)) {
                                var pallet_merged_to_shelf = false;
                                modules.ShelfInfo.forEach((checkShelf, checkIndex) => {
                                    if (checkShelf.ObjType === "SHELF") {
                                        var mergedForShelf = get_shelf_pallet_items(modules, checkIndex, i);
                                        if (mergedForShelf.some(it => it.SIndex === j && (it.CType === "PALLET" || it.CType === "SHELF"))) {
                                            pallet_merged_to_shelf = true;
                                        }
                                    }
                                });
                                if (pallet_merged_to_shelf) {
                                    j++;
                                    continue;
                                }
                            }
                            //ASA-1892 Issue5 End
                            //ASA-1892.2 End
                            if (shelfs.ItemInfo.length > 0) {
                                if (is_pallet_on_shelf) {
                                    var item_Details = pallet_shelf_combine_items;
                                } else {
                                    var item_Details = shelfs.ItemInfo;
                                }
                                z = 0;
                                for (it of item_Details) {
                                    var ItemInfo = {};
                                    ItemInfo["ItemID"] = it.ItemID;
                                    ItemInfo["Item"] = it.Item;
                                    ItemInfo["IIndex"] = is_pallet_on_shelf ? it.IIndex : z; //ASA-1892.2
                                    ItemInfo["MIndex"] = i;
                                    ItemInfo["SIndex"] = is_pallet_on_shelf ? it.SIndex : j; //ASA-1892.2
                                    ItemInfo["X"] = item_Details[z].X;
                                    ItemInfo["D"] = item_Details[z].D; //ASA-1892.2 Start
                                    ItemInfo["Start"] = wpdSetFixed(item_Details[z].X - item_Details[z].W / 2); //.toFixed(4)); //ASA-1892 Issue4
                                    ItemInfo["Front"] = wpdSetFixed(item_Details[z].Z - item_Details[z].D / 2); //ASA-1892 Issue4
                                    ItemInfo["End"] = wpdSetFixed(item_Details[z].X + item_Details[z].W / 2); //ASA-1892 Issue4
                                    ItemInfo["Back"] = wpdSetFixed(item_Details[z].Z + item_Details[z].D / 2); //ASA-1892 Issue4
                                    ItemInfo["Top"] = wpdSetFixed(item_Details[z].Y + item_Details[z].H / 2); //.toFixed(4));
                                    ItemInfo["CType"] = is_pallet_on_shelf ? it.CType : shelfs.ObjType; //ASA-1892.2
                                    if (shelfs.ObjType == "HANGINGBAR" || shelfs.ObjType == "PEGBOARD") {
                                        ItemInfo["Y"] = wpdSetFixed(item_Details[z].Y + item_Details[z].H / 2); //.toFixed(4));
                                    } else {
                                        ItemInfo["Y"] = wpdSetFixed(item_Details[z].Y - item_Details[z].H / 2); //.toFixed(4));
                                    }
                                    z++;
                                    items_arr.push(ItemInfo);
                                }
                                var k = 0;
                                if (shelfs.ObjType == "PALLET") {
                                    //ASA-1892.2 Start
                                    var sorto = sortPalletItems(p_pallet_dir);
                                    //ASA-1892.2 End
                                } else if (shelfs.ObjType == "PEGBOARD") {
                                    if (p_order_dir == "LRTB") {
                                        var sorto = {
                                            Y: "desc",
                                            X: "asc",
                                        };
                                    } else if (p_order_dir == "LRBT") {
                                        var sorto = {
                                            Y: "asc",
                                            X: "asc",
                                        };
                                    } else {
                                        if (p_order_dir == "TBLR") {
                                            var sorto = {
                                                SIndex: "desc",
                                                X: "asc",
                                                Y: "desc",
                                            };
                                        } else {
                                            var sorto = {
                                                SIndex: "asc",
                                                X: "asc",
                                                Y: "asc",
                                            };
                                        }
                                    }
                                } else if (shelfs.ObjType == "CHEST") {
                                    //ASA-1300
                                    if (p_order_dir == "LRTB") {
                                        var sorto = {
                                            Top: "desc",
                                            Start: "asc",
                                        };
                                    } else if (p_order_dir == "LRBT") {
                                        var sorto = {
                                            Top: "asc",
                                            Start: "asc",
                                        };
                                    } else {
                                        if (p_order_dir == "TBLR") {
                                            var sorto = {
                                                SIndex: "desc",
                                                Start: "asc",
                                                Top: "desc",
                                            };
                                        } else {
                                            var sorto = {
                                                SIndex: "asc",
                                                Start: "asc",
                                                Top: "asc",
                                            };
                                        }
                                    }
                                } else {
                                    //ASA-1892 Issue8 Start
                                    if (is_pallet_on_shelf) {
                                        if (p_order_dir == "LRTB" || p_order_dir == "TBLR") {
                                            var sorto = {
                                                X: "asc",
                                                Y: "desc",
                                            };
                                        } else {
                                            var sorto = {
                                                X: "asc",
                                                Y: "asc",
                                            };
                                        }
                                    } else if (p_order_dir == "LRTB" || p_order_dir == "TBLR") {
                                        var sorto = {
                                            SIndex: "desc",
                                            X: "asc",
                                            Y: "desc",
                                        };
                                    } else {
                                        var sorto = {
                                            SIndex: "asc",
                                            X: "asc",
                                            Y: "asc",
                                        };
                                    }
                                    //ASA-1892 Issue8 End
                                }
                                items_arr.keySort(sorto);
                                // ASA-1892.2 Start
                                if (is_pallet_on_shelf) {
                                    var palletItems = items_arr.filter(x => x.CType === "PALLET");
                                    let sorto_p = sortPalletItems(p_pallet_dir);
                                    palletItems.keySort(sorto_p);
                                    var merged = [];
                                    for (let item of items_arr) {
                                        if (item.CType === "PALLET") {
                                            merged.push(palletItems.shift());
                                        } else {
                                            merged.push(item);
                                        }
                                    }
                                    items_arr = merged;
                                }
                                // ASA-1892.2 End
                                var k = 0;
                                for (const items of items_arr) {
                                    var shelf_index = is_pallet_on_shelf ? items.SIndex : j; // ASA-1892.2
                                    if (items.Item !== "DIVIDER") {
                                        l_item_id = l_item_id + 1;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_index].ItemInfo[items.IIndex].OldLocationID = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_index].ItemInfo[items.IIndex].LocID;
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[shelf_index].ItemInfo[items.IIndex].LocID = l_item_id;
                                    }
                                    k = k + 1;
                                }
                                items_arr = [];
                            }
                        }
                        j = j + 1;
                    }
                }
                i = i + 1;
            }
        } else {
            i = 0;
            for (const modules of module_details) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var l_shelf_details = modules.ShelfInfo;
                    var j = 0;
                    for (const shelfs of l_shelf_details) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            //ASA-1892 Issue9 Start
                            var pallet_merged_to_shelf = false;
                            if (shelfs.ObjType == "PALLET" || (shelfs.ObjType == "SHELF" && shelfs.W < modules.W)) {
                                modules.ShelfInfo.forEach((checkShelf, checkIndex) => {
                                    if (checkShelf.ObjType === "SHELF") {
                                        var mergedForShelf = get_shelf_pallet_items(modules, checkIndex, i);
                                        if (mergedForShelf.some(it => it.SIndex === j && (it.CType === "PALLET" || it.CType === "SHELF"))) {
                                            pallet_merged_to_shelf = true;
                                        }
                                    }
                                });
                            }
                            //ASA-1892 Issue9 End
                            if (shelfs.ItemInfo.length > 0) {
                                var shelf_top = wpdSetFixed(shelfs.Y + shelfs.H / 2); //.toFixed(4));
                                var item_Details = shelfs.ItemInfo;
                                item_Details.sort((a, b) => (a.X > b.X || (a.X == b.X && a.Y > b.Y) ? 1 : -1));
                                var k = 0;
                                var top_cnt = 0;
                                var prev_x = 0;
                                var check_x = 0;
                                for (const items of item_Details) {
                                    if (items.Item !== "DIVIDER") {
                                        var ItemInfo = {};
                                        ItemInfo["ItemID"] = items.ItemID;
                                        if ((typeof items.TopObjID !== "undefined" && items.TopObjID !== "") || (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "")) {
                                            if (items.TopObjID !== "" && items.BottomObjID == "") {
                                                check_x = wpdSetFixed(items.X - items.W / 2); //.toFixed(4));
                                                prev_x = items.X;
                                            }
                                            if (prev_x == items.X) {
                                                top_cnt = top_cnt + 1;
                                            } else {
                                                check_x = 0;
                                                top_cnt = 0;
                                            }
                                            if (items.TopObjID == "" && items.BottomObjID !== "") {
                                                prev_x = 0;
                                            }
                                        } else {
                                            top_cnt = 0;
                                            prev_x = 0;
                                            check_x = 0;
                                        }

                                        if (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "") {
                                            if (p_order_dir == "LRTB") {
                                                ItemInfo["X"] = check_x - 0.001 * top_cnt;
                                            } else {
                                                if (p_order_dir !== "TBLR" && p_order_dir !== "BTLR") {
                                                    ItemInfo["X"] = check_x + 0.001 * top_cnt;
                                                } else {
                                                    ItemInfo["X"] = items.X;
                                                }
                                            }
                                        } else if (typeof items.TopObjID !== "undefined" && items.TopObjID !== "" && (p_order_dir == "TBLR" || p_order_dir == "BTLR")) {
                                            ItemInfo["X"] = items.X;
                                        } else {
                                            ItemInfo["X"] = wpdSetFixed(items.X - items.W / 2); //.toFixed(4));
                                        }
                                        if (shelfs.ObjType == "HANGINGBAR" || shelfs.ObjType == "PEGBOARD" || shelfs.ObjType == "CHEST") {
                                            //ASA-1300
                                            ItemInfo["Y"] = wpdSetFixed(items.Y + items.H / 2); //.toFixed(4));
                                        } else {
                                            //ASA-1892 Issue9 Start
                                            if (pallet_merged_to_shelf) {
                                                var l_parentshelfY = wpdSetFixed(l_shelf_details[j - 1]?.Y + l_shelf_details[j - 1]?.H / 2);
                                                ItemInfo["Y"] = l_parentshelfY;
                                            } else if (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "") {
                                                if (p_order_dir !== "TBLR") {
                                                    ItemInfo["Y"] = shelf_top;
                                                } else {
                                                    ItemInfo["Y"] = wpdSetFixed(items.Y - items.H / 2); //.toFixed(4));
                                                }
                                            } else {
                                                ItemInfo["Y"] = wpdSetFixed(items.Y - items.H / 2); //.toFixed(4));
                                            }
                                            //ASA-1892 Issue9 End
                                        }
                                        ItemInfo["ObjID"] = items.ObjID;
                                        ItemInfo["CType"] = items.CType;
                                        ItemInfo["H"] = items.H;
                                        ItemInfo["W"] = items.W;
                                        ItemInfo["LObjID"] = items.LObjID;
                                        ItemInfo["SubLblObjID"] = items.SubLblObjID; //ASA-1182
                                        if (shelfs.ObjType == "PALLET") {
                                            ItemInfo["D"] = items.D;
                                        } else {
                                            ItemInfo["D"] = 0;
                                        }

                                        ItemInfo["MIndex"] = i;
                                        ItemInfo["SIndex"] = j;
                                        ItemInfo["Shelf"] = shelfs.Shelf;
                                        ItemInfo["IIndex"] = k;
                                        ItemInfo["ObjID"] = items.ObjID;

                                        items_arr.push(ItemInfo);
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
            if (p_module_dir == "LR") {
                var mod_order = "asc";
            } else {
                var mod_order = "desc";
            }
            if (p_order_type == 1) {
                if (p_order_dir == "LRBT") {
                    var sorto = {
                        Y: "asc",
                        X: "asc",
                        MIndex: mod_order,
                    };

                    items_arr.keySort(sorto);
                } else if (p_order_dir == "LRTB") {
                    var sorto = {
                        Y: "desc",
                        X: "asc",
                        MIndex: mod_order,
                    };
                    items_arr.keySort(sorto);
                }
            } else {
                if (p_order_dir == "LRBT") {
                    var sorto = {
                        MIndex: mod_order,
                        Y: "asc",
                        X: "asc",
                    };

                    items_arr.keySort(sorto);
                } else if (p_order_dir == "LRTB") {
                    var sorto = {
                        MIndex: mod_order,
                        Y: "desc",
                        X: "asc",
                    };

                    items_arr.keySort(sorto);
                }
            }
            if (p_order_dir == "BTLR") {
                var sorto = {
                    MIndex: mod_order,
                    X: "asc",
                    Y: "asc",
                };

                items_arr.keySort(sorto);
            } else if (p_order_dir == "TBLR") {
                var sorto = {
                    MIndex: mod_order,
                    X: "asc",
                    Y: "desc",
                };

                items_arr.keySort(sorto);
            }
            // ASA-1892.2 Start
            var palletItems = items_arr.filter(x => x.CType === "PALLET");
            var sorto_p = sortPalletItems(p_pallet_dir);
            palletItems.keySort(sorto_p);
            var merged = [];
            for (let item of items_arr) {
                if (item.CType === "PALLET") {
                    merged.push(palletItems.shift());
                } else {
                    merged.push(item);
                }
            }
            items_arr = merged;
            // if (p_order_dir == "LRBT" || p_order_dir == "BTLR") {
            //     items_arr.sort(function (a, b) {
            //         if (a.CType == "PALLET" && b.CType == "PALLET" && a.D > b.D) {
            //             return 1;
            //         } else if (a.CType == "PALLET" && b.CType == "PALLET" && a.D < b.D) {
            //             return -1;
            //         } else {
            //             return 0;
            //         }
            //     });
            // } else {
            //     items_arr.sort(function (a, b) {
            //         if (a.CType == "PALLET" && b.CType == "PALLET" && a.D < b.D) {
            //             return 1;
            //         } else if (a.CType == "PALLET" && b.CType == "PALLET" && a.D > b.D) {
            //             return -1;
            //         } else {
            //             return 0;
            //         }
            //     });
            // }
            // ASA-1892.2 End
            var k = 0;
            var mod_index = -1;
            for (const items of items_arr) {
                l_item_id = l_item_id + 1;

                if (mod_index !== items.MIndex && p_start_one_mod == 2) {
                    l_item_id = 1;
                }
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].OldLocationID = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].LocID;
                g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].LocID = l_item_id;
                mod_index = items.MIndex;
                k = k + 1;
            }

            g_undo_details = [];
            if (g_l_module_dir !== "") {
                if (finalAction == "U") {
                    g_delete_details.multi_delete_shelf_ind = "N";
                    g_undo_all_obj_arr = [];

                    g_undo_all_obj_arr.push(g_cut_copy_arr);
                    g_undo_all_obj_arr.push(g_cut_copy_arr);
                    g_undo_all_obj_arr.previousAction = "LOCATION_NUMBERING";
                    g_undo_all_obj_arr.hasSupportArr = "N";
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
                    g_redo_all_obj_arr.push(g_cut_copy_arr);
                    g_redo_all_obj_arr.push(g_cut_copy_arr);
                    g_redo_all_obj_arr.previousAction = "LOCATION_NUMBERING";
                    g_redo_all_obj_arr.hasSupportArr = "N";
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
        }
        var i = 0;
        for (const modules of module_details) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var j = 0;
                for (const shelfs of modules.ShelfInfo) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "TEXTBOX" && shelfs.ObjType !== "DIVIDER") {
                        for (const items of shelfs.ItemInfo) {
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                            if (typeof selectedObject !== "undefined") {
                                selectedObject.LocID = items.LocID;
                            }
                        }
                    }
                }
            }
        }

        if (g_show_item_label == "Y") {
            show_item_labels(g_show_item_label, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        }
        //ASA-1182
        if (g_itemSubLabelInd == "Y") {
            showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        }
        g_dblclick_opened = "N";
        closeInlineDialog("renumbering");
        (g_l_module_dir = ""), (g_l_direction = ""), (g_l_ignore = ""), (g_l_order_type = ""), (g_l_start_one_mod = ""), (g_l_include_mod_name = ""), (g_l_separator = ""), (g_l_leading_text = ""), (g_l_trailing_text = ""), (g_l_start_one_mod_loc = ""), (g_l_start_one_fixel = "");
        logDebug("function : location_numbering", "E");
    } catch (err) {
        error_handling(err);
    }
}

// Task 21828
//this function is used when a objects are selected by single click or multi select and right click delete or press delete key or press CUT action.
async function context_delete(p_action, p_moduleIndex, p_shelfIndex, p_itemIndex, p_item_edit_flag, p_module_edit_flag, p_shelf_edit_flag, p_objectHitID, p_shelfObjType, p_delete_details_arr, p_camera, p_pog_index, p_productselect) {
    logDebug("function : context_delete; action : " + p_action + "; moduleIndex : " + p_moduleIndex + "; shelfIndex : " + p_shelfIndex + "; itemIndex : " + p_itemIndex + "; i_item_edit_flag : " + p_item_edit_flag + "; i_module_edit_flag : " + p_module_edit_flag + "; i_shelf_edit_flag : " + p_shelf_edit_flag + "; objectHitID : " + p_objectHitID + "; shelfObjType : " + p_shelfObjType, "S");
    try {
        var is_divider = "N";
        var deleteModule = p_module_edit_flag;
        //when delete is clicked.
        if (p_action == "DELETE") {
            //we get list of objects to be deleted.
            if (p_delete_details_arr.multi_carpark_ind !== "Y") {
                await get_delist_item(p_pog_index, g_multiselect, p_shelfIndex, p_moduleIndex, p_itemIndex, p_shelf_edit_flag, p_module_edit_flag, p_item_edit_flag, p_delete_details_arr);
            }
            if (typeof p_delete_details_arr !== "undefined" && p_delete_details_arr.length > 0) {
                deleteModule = "N";
            }
            //delete those objects.
            await deleteObject(p_pog_index, p_delete_details_arr, p_productselect, deleteModule, p_moduleIndex, "U");
            if (p_module_edit_flag == "Y" && g_manual_zoom_ind == "N") {
                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
                render(p_pog_index);
            }
        } else {
            // Action = "CUT"
            var isDivider = "N";
            var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
            if (g_carpark_item_flag == "N" && p_itemIndex !== -1) {
                isDivider = shelfdtl.ItemInfo[p_itemIndex].Item;
            }
            if (p_module_edit_flag == "Y") {
                delete_module(p_objectHitID, p_moduleIndex, p_camera, p_pog_index);
            } else if (p_shelf_edit_flag == "Y" || (p_item_edit_flag == "Y" && isDivider == "DIVIDER")) {
                if (p_item_edit_flag == "Y" && isDivider == "DIVIDER") {
                    is_divider = "Y";
                }
                p_shelfObjType = shelfdtl.ObjType;
                delete_shelf(p_objectHitID, p_moduleIndex, p_shelfIndex, p_itemIndex, p_shelfObjType, is_divider, "N", p_pog_index);
            } else if (p_item_edit_flag == "Y" && isDivider !== "DIVIDER") {
                delete_item(p_objectHitID, p_moduleIndex, p_shelfIndex, p_itemIndex, p_action, "Y", p_pog_index);
            }
        }
        if (g_show_live_image == "Y") {
            animate_pog(p_pog_index);
        }
        //recreate the orientation view if any present
        var returnval = await recreate_compare_views(g_compare_view, "N");
        logDebug("function : context_delete", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is used in mousedown when a module rule block is dragged to another module. we find the module_index where it is dropped.
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

//this function is used in mousedown where we find the module rule block is moved to another module we shift it.
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
    //ASA-2005.2 Start
    swapBlockIndex(p_dragBlock, p_swapBlock);

    // var block_details_arr = [];
    // for (const obj of g_mod_block_list) {
    //     var details = {};
    //     details["BlkColor"] = obj.BlkColor;
    //     details["BlkName"] = obj.BlkName;
    //     details["BlkRule"] = obj.BlkRule;
    //     details["BlkFilters"] = obj.BlockFilters.join(" AND ");
    //     obj["BlkFilters"] = details["BlkFilters"];
    //     block_details_arr.push(details);
    // }
    // var retval = await save_blk_dtl_coll("A","", block_details_arr);
    //ASA-2005.2 End
    render(p_pog_index);
    logDebug("function : swapColoredBlocks", "E");
}

//ASA-2005.2 After swapping, update the g_mod_block_list as per the swap
function swapBlockIndex(p_dragBlock, p_swapBlock) {
    if (!Array.isArray(g_mod_block_list)) return;
    const list = g_mod_block_list;
    const dragIdx = list.findIndex(b => b.BlkName === p_dragBlock.BlkName);
    const swapIdx = list.findIndex(b => b.BlkName === p_swapBlock.BlkName);
    if (dragIdx === -1 || swapIdx === -1) return;
    [list[dragIdx], list[swapIdx]] = [list[swapIdx], list[dragIdx]];
}



function clickInsideElementMulti(p_event) {
    var el = p_event.srcElement || p_event.target;
    var isCanvas = p_event.target.getAttribute("data-canvas") !== null ? p_event.target.getAttribute("data-canvas") : false;
    if (isCanvas) {
        return el;
    } else {
        while ((el = el.parentNode)) {
            isCanvas = p_event.target.getAttribute("data-canvas") !== null ? p_event.target.getAttribute("data-canvas") : false;
            if (isCanvas) {
                return el;
            }
        }
    }
    return false;
}

// Task 21828, Start
async function deleteWorldObject(p_deleteShelf, p_deleteDetails) {
    logDebug("function : deleteWorldObject; pDeleteShelf : " + p_deleteShelf, "S");
    g_cut_copy_arr = [];
    delete_details_temp = p_deleteDetails;
    g_undo_details = [];
    var carparkItemFlag = typeof p_deleteDetails.multi_carpark_ind !== "undefined" && p_deleteDetails.multi_carpark_ind !== "" ? p_deleteDetails.multi_carpark_ind : "N";
    try {
        var j = 0;
        for (const details of p_deleteDetails) {
            if (details.Object == "SHELF" && p_deleteShelf == "Y") {
                if (details.IsDivider == "N" && g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.length > 0) {
                    var item_arr = g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo;
                    var i = 0;
                    for (const items of item_arr) {
                        g_deletedItems.push(items.ItemID); //ASA-1108
                        var selectedObject = g_scene_objects[details.p_pog_index].scene.children[2].getObjectById(items.ObjID);
                        g_scene_objects[details.p_pog_index].scene.children[2].remove(selectedObject);
                        i++;
                    }
                    //capture the module is edit or not to create changed text box
                    g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].EditFlag = "Y";
                }

                var selectedObject = g_scene_objects[details.p_pog_index].scene.children[2].getObjectById(details.ObjID);
                g_scene_objects[details.p_pog_index].scene.children[2].remove(selectedObject);

                if (details.IsDivider == "Y") {
                    shelf_arr = g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo;
                    var div_index = -1;
                    var itemid = g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex].ItemID;
                    var i = 0;
                    for (const shelfs of shelf_arr) {
                        if (shelfs.Shelf == itemid) {
                            div_index = i;
                        }
                        i++;
                    }
                    if (div_index !== -1) {
                        g_cut_support_obj_arr.push(g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[div_index]);
                    }
                    g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex])));
                } else {
                    if (details.ObjType == "TEXTBOX") {
                        var objectid = g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].SObjID;
                        var child_module_index = -1;
                        var module_arr = g_pog_json[details.p_pog_index].ModuleInfo;
                        $.each(module_arr, function (i, modules) {
                            if (modules.ObjID == objectid) {
                                child_module_index = i;
                                return;
                            }
                        });
                        if (child_module_index !== -1) {
                            g_cut_support_obj_arr.push(g_pog_json[details.p_pog_index].ModuleInfo[child_module_index]);
                        }
                    }
                    g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex])));
                }
            } else if (p_deleteShelf == "N" && (details.Object == "ITEM" || (details.Object == "CARPARK_ITEM" && carparkItemFlag == "Y"))) {
                var i = 0;
                var IIndex = -1;
                var itemInfo = carparkItemFlag == "N" ? g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo : g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].Carpark[0].ItemInfo;
                for (let item of itemInfo) {
                    if (item.ObjID == details.ObjID) {
                        IIndex = i;
                        break;
                    }
                    i++;
                }
                var item = carparkItemFlag == "N" ? g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[IIndex] : g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].Carpark[0].ItemInfo[IIndex];
                var objectid = item.ObjID;
                var selectedObject = g_scene_objects[details.p_pog_index].scene.children[2].getObjectById(objectid);
                g_scene_objects[details.p_pog_index].scene.children[2].remove(selectedObject);
                details.ObjID = objectid.ObjID;

                if ((typeof item.TopObjID !== "undefined" && item.TopObjID !== "") || (typeof item.BottomObjID !== "undefined" && item.BottomObjID !== "")) {
                    var returnval = reset_bottom_item(details.MIndex, details.SIndex, IIndex, details.MIndex, details.SIndex, -1, details.p_pog_index);
                }

                g_cut_copy_arr.push(JSON.parse(JSON.stringify(item)));
                g_deletedItems.push(item.ItemID); //ASA-1108
                if (carparkItemFlag == "N") {
                    g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.splice(IIndex, 1);

                    if (multi_pog_index !== details.p_pog_index || (multi_pog_index == details.p_pog_index && details.SIndex !== g_multi_shelf_index) || g_multi_shelf_index == -1) {
                        g_multi_shelf_ind = "Y";
                        var details_list = {};
                        details_list["p_pog_index"] = details.p_pog_index;
                        details_list["MIndex"] = details.MIndex;
                        details_list["SIndex"] = details.SIndex;
                        details_list["ObjType"] = details.ObjType;
                        g_multi_shelf_arr.push(details_list);
                    }
                    multi_pog_index = details.p_pog_index;
                    g_multi_shelf_index = details.SIndex;
                    g_multi_mod_index = details.MIndex;
                    g_multi_shelf_obj_type = details.ObjType;
                } else {
                    g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].Carpark[0].ItemInfo.splice(IIndex, 1);

                    // ASA-1907 delete the carpark shelf if all items are moved.
                    if (g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].Carpark[0].ItemInfo.length == 0) {
                        var selectObjects = g_scene_objects[details.p_pog_index].scene.children[2].getObjectById(g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].Carpark[0].SObjID);
                        g_scene_objects[details.p_pog_index].scene.children[2].remove(selectObjects);
                        g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].Carpark.splice(0, 1);
                    }
                }

                //capture the module is edit or not to create changed text box
                g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].EditFlag = "Y";
            }
            j++;
        }
        logDebug("function : deleteWorldObject", "E");
    } catch (err) {
        error_handling(err);
    }
}
async function deleteObjectLib(p_pog_index, p_deleteShelf, p_deleteDetails, p_productListOpen, p_deleteModule, p_moduleIndex, p_undoType) {
    logDebug("function : deleteObjectLib; pDeleteShelf : " + p_deleteShelf, "S");
    try {
        if (p_deleteModule == "Y") {
            await update_undo_details("", "", p_moduleIndex, "", "", "", "ITEM", "", "", "N", "", "", "", "", "", "MODULE_DELETE", "", "", "", "", "", p_undoType, "", "", "", "", p_pog_index);
            var l_camera = g_scene_objects[p_pog_index].scene.children[0];
            if (g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo.length > 0) {
                for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo) {
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
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].MObjID);
            g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
            for (const obj of g_scene_objects[p_pog_index].scene.children[2].children) {
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectByProperty("uuid", "BASE1");
                g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
            }

            var details = get_min_max_xy(p_pog_index);
            var details_arr = details.split("###");
            set_camera_z(l_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
            render(p_pog_index);
            var i = 0;
            if (g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo.length > 0) {
                for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo) {
                    var ItemArr = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[i].ItemInfo;
                    for (const details of ItemArr) {
                        g_deletedItems.push(details.ItemID);
                    }
                    i = i + 1;
                }
            }
            g_pog_json[p_pog_index].W = g_pog_json[p_pog_index].W - g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].W;

            g_pog_json[p_pog_index].ModuleInfo = g_pog_json[p_pog_index].ModuleInfo.filter((module) => module.ParentModule != g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].Module); //ASA-1656
            if (p_moduleIndex == 0) {
                g_pog_json[p_pog_index].ModuleInfo.splice(p_moduleIndex, p_moduleIndex + 1);
            } else {
                g_pog_json[p_pog_index].ModuleInfo.splice(p_moduleIndex, 1);
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

            if (mod_cnt > 0) {
                var res = await deleted_items_log(g_deletedItems, "D", p_pog_index);
                var res = await context_create_module("", l_camera, "Y", p_pog_index, "N");
                if (g_pog_json[p_pog_index].BaseH > 0) {
                    var colorValue = parseInt(g_pog_json[p_pog_index].Color.replace("#", "0x"), 16);
                    var hex_decimal = new THREE.Color(colorValue);
                    g_pog_json[p_pog_index].BaseW = module_sum;
                    g_pog_json[p_pog_index].BaseX = module_sum / 2;
                    var return_val = add_base("BASE1", module_sum, g_pog_json[p_pog_index].BaseH, g_pog_json[p_pog_index].BaseD, hex_decimal, module_sum / 2, g_pog_json[p_pog_index].BaseY, "Y", p_pog_index);
                }
                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                set_camera_z(l_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
                if (g_scene_objects[p_pog_index].Indicators.LiveImage == "Y") {
                    animate_pog(p_pog_index);
                }
            }
            $s("P25_MODULE_DISP", "");
        } else {
            var pogList = [];
            var action = p_deleteShelf == "Y" ? "SHELF_DELETE" : "ITEM_DELETE";
            multi_pog_index = -1;
            multi_pog_ind = "N";
            g_multi_shelf_index = -1;
            g_multi_shelf_ind = "N";
            g_multi_mod_index = "";
            g_multi_shelf_obj_type = "";
            g_multi_shelf_arr = [];
            g_multi_delete_shelf_ind = p_deleteShelf;
            g_multi_delete_done = "Y";
            var undoObjectsInfo = [];
            if (g_keyCode !== 89 || g_keyCode !== 90) {
                g_redo_all_obj_arr = [];
                g_redo_final_obj_arr = [];
                g_undoRedoAction = "REDO";
            }

            p_deleteDetails.sort((a, b) => ((a.Object == "ITEM" && b.Object == "ITEM") || (a.IsDivider == "Y" && b.IsDivider == "Y") ? 1 : -1));
            //ASA-1679
            /*var sorto = {
                p_pog_index: "asc",
                ModuleIndex: "asc",
                ShelfIndex: "desc",
                ItemIndex: "desc",
            };*/
            //ASA-1679
            var sorto = {
                p_pog_index: "asc",
                MIndex: "desc",
                SIndex: "desc",
                IIndex: "desc",
            };
            p_deleteDetails.keySort(sorto);
            if (p_deleteDetails.multi_carpark_ind !== "Y") {
                var lookup = {};
                var items = p_deleteDetails;
                var UniqueID = [];
                g_allUndoObjectsInfo = [];
                for (var item, i = 0; (item = items[i++]);) {
                    var name = item.SIndex + "-" + item.MIndex;
                    if (!(name in lookup)) {
                        lookup[name] = 1;
                        UniqueID.push(name);
                        var undoObjectsInfo = [];
                        var objID = g_pog_json[item.p_pog_index].ModuleInfo[item.MIndex].ShelfInfo[item.SIndex].SObjID;
                        undoObjectsInfo.moduleIndex = item.MIndex;
                        undoObjectsInfo.module = g_pog_json[item.p_pog_index].ModuleInfo[item.MIndex].Module;
                        undoObjectsInfo.moduleObjectID = g_pog_json[item.p_pog_index].ModuleInfo[item.MIndex].MObjID;
                        undoObjectsInfo.shelfIndex = item.SIndex;
                        undoObjectsInfo.actionType = action;
                        undoObjectsInfo.startCanvas = item.p_pog_index;
                        undoObjectsInfo.objectID = objID;
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[item.p_pog_index].ModuleInfo[item.MIndex].ShelfInfo[item.SIndex])));
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                    }
                }
                for (const details of p_deleteDetails) {
                    pogList.push(details.p_pog_index);
                    if (details.Object == "ITEM") {
                        g_deletedItems.push(details.ItemID);
                    }
                }
                undoObjectsInfo.g_deletedItems = g_deletedItems;
                pogList = [...new Set(pogList)];
                for (const index of pogList) {
                    var res = await calculateFixelAndSupplyDays("N", index);
                    var res = await deleted_items_log(g_deletedItems, "D", index);
                    render(index);
                }
                if (p_deleteDetails.length > 0) {
                    if (p_deleteDetails.multi_delete_shelf_ind !== "") {
                        p_deleteShelf = p_deleteDetails.multi_delete_shelf_ind;
                    } else if (p_deleteDetails.multi_delete_shelf_ind !== "undefined") {
                        p_deleteShelf = p_deleteShelf;
                    }
                    await deleteWorldObject(p_deleteShelf, p_deleteDetails);
                    var l_non_combination = "N";
                    if (p_deleteShelf == "Y") {
                        var p = 0;
                        for (const details of p_deleteDetails) {
                            var currModuleInfo = g_pog_json[details.p_pog_index].ModuleInfo;
                            var currShelfInfo = g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo;
                            if (details.Object == "SHELF") {
                                // if (details.Object == "SHELF" && details.IsDivider == "N") //ASA-1446
                                if (details.ObjType == "SHELF" && details.IsDivider == "N") {
                                    //ASA-1446
                                    var shelf_ind = -1;
                                    var i = 0;
                                    for (obj of currShelfInfo) {
                                        if (obj.SObjID == details.ObjID) {
                                            shelf_ind = i;
                                            break;
                                        }
                                        i++;
                                    }
                                    //ASA-1530 S
                                    var shelfItemInfo = g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo;
                                    if (shelfItemInfo.length > 0) {
                                        for (var items of shelfItemInfo) {
                                            if (items.Item == "DIVIDER") {
                                                for (var i = 0; i < currShelfInfo.length; i++) {
                                                    var divitem = currShelfInfo[i];
                                                    if (divitem.ItemID == items.Shelf) {
                                                        currShelfInfo.splice(i, 1);
                                                        i--;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    //ASA-1530 E

                                    if (shelf_ind !== -1 && g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].Combine !== "N") {
                                        g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo = []; //Regression Issue-37 -- it is added because only shelfInfo was removed from the world but we needed to remove itemInfo as well.
                                        g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].Combine = "N"; // reset the combined shelf after deleting the shelf.
                                        await generateCombinedShelfs(details.p_pog_index, details.MIndex, shelf_ind, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters,ASA-1353
                                    } else {
                                        l_non_combination = "Y";
                                    }
                                    currShelfInfo.splice(details.SIndex, 1);
                                } else if (details.ObjType == "TEXTBOX") {
                                    var child_module_index = -1;
                                    $.each(currModuleInfo, function (m, modules) {
                                        if (modules.ObjID == details.ObjID) {
                                            child_module_index = m;
                                            return;
                                        }
                                    });
                                    if (child_module_index !== -1) {
                                        currModuleInfo.splice(child_module_index, 1);
                                    }
                                    currShelfInfo.splice(details.SIndex, 1);
                                } else if (details.IsDivider == "Y") {
                                    var div_index = -1;
                                    $.each(currShelfInfo, function (s, shelfs) {
                                        if (shelfs.ObjType == "DIVIDER" && shelfs.ShelfDivObjID == details.ObjID) {
                                            div_index = s;
                                        }
                                    });
                                    if (div_index !== -1) {
                                        currShelfInfo.splice(div_index, 1);
                                    }
                                    //ASA-1579 Start
                                    var idx = 0;
                                    for (const shelf of currShelfInfo) {
                                        var idx1 = 0; //ASA-1579 #1
                                        for (const item of shelf.ItemInfo) {
                                            if (item.ObjID == details.ObjID) {
                                                details.SIndex = idx;
                                                details.IIndex = idx1; //ASA-1579 #1
                                            }
                                            idx1++; //ASA-1579 #1
                                        }
                                        idx++;
                                    }
                                    //ASA-1579 End
                                    var currItemInfo = g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo;
                                    currItemInfo.splice(details.IIndex, 1);
                                } else {
                                    currShelfInfo.splice(details.SIndex, 1);
                                }
                            }
                            p++;
                        }
                        //ASA-1519 added beacuse after delet the non combne shelf from the pog the combination shelf index is not changes
                        if (g_combinedShelfs.length > 0 && l_non_combination == "Y") {
                            var i = 0;
                            for (var comb of g_combinedShelfs) {
                                var j = 0;
                                for (var detl of comb) {
                                    if (detl.PIndex == p_pog_index) {
                                        var shelf = g_pog_json[detl.PIndex].ModuleInfo[detl.MIndex].ShelfInfo;
                                        var k = 0;
                                        for (var l_shelf of shelf) {
                                            if ((l_shelf.ObjType == "SHELF" || l_shelf.ObjType == "HANGINGBAR") && detl.SObjID == l_shelf.SObjID) {
                                                detl.SIndex = k;
                                            }
                                            k++;
                                        }
                                    }
                                    j++;
                                }
                                i++;
                            }
                        }
                    }
                    if (g_multi_shelf_ind == "Y") {
                        var j = 0;
                        for (const details of g_multi_shelf_arr) {
                            //ASA-1482 S
                            var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(details.p_pog_index, g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].Shelf); //ASA--1329 KUSH
                            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                await setCombinedShelfItems(details.p_pog_index, currCombinationIndex, currShelfCombIndx, -1, "N", "N", -1, -1, []);
                            }
                            //ASA-1482 E
                            if (p_deleteShelf == "N" && g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.length > 0) {
                                if (details.ObjType == "SHELF" || details.ObjType == "PALLET") {
                                    var returnval = reset_top_bottom_objects(details.MIndex, details.SIndex, "N", details.p_pog_index);
                                }
                                if (details.ObjType !== "PEGBOARD") {
                                    await reset_auto_crush(details.MIndex, details.SIndex, -1, details.p_pog_index, details.MIndex, details.SIndex, p_pog_index); //ASA-1343 issue 1 ASA-1685
                                }
                                if (g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].SpreadItem == "F") {
                                    $.each(g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo, function (i, fitems) {
                                        fitems.W = fitems.RW;
                                    });
                                }
                                if (details.ObjType !== "PALLET" && reorder_items(details.MIndex, details.SIndex, details.p_pog_index)) {// ASA-2010.4.3
                                    var return_val = await recreate_all_items(details.MIndex, details.SIndex, details.ObjType, "N", -1, -1, g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", details.p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                                }
                            }
                            j++;
                        }
                    } else {
                        if (p_deleteShelf == "N" && g_pog_json[p_pog_index].ModuleInfo[g_multi_mod_index].ShelfInfo[g_multi_shelf_index].ItemInfo.length > 0) {
                            //ASA-1482 S
                            var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[g_multi_mod_index].ShelfInfo[g_multi_shelf_index].Shelf); //ASA--1329 KUSH
                            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                await setCombinedShelfItems(p_pog_index, currCombinationIndex, currShelfCombIndx, -1, "N", "N", -1, -1, []);
                            }
                            //ASA-1482 E
                            if (g_multi_shelf_obj_type == "SHELF" || g_multi_shelf_obj_type == "PALLET") {
                                var returnval = reset_top_bottom_objects(g_multi_mod_index, g_multi_shelf_index, "N", p_pog_index);
                            }
                            if (g_pog_json[p_pog_index].ModuleInfo[g_multi_mod_index].ShelfInfo[g_multi_shelf_index].ObjType !== "PEGBOARD") {
                                await reset_auto_crush(g_multi_mod_index, g_multi_shelf_index, -1, p_pog_index, g_multi_mod_index, g_multi_shelf_index, p_pog_index); //ASA-1343 issue 1 ASA-1685
                            }
                            if (g_pog_json[p_pog_index].ModuleInfo[g_multi_mod_index].ShelfInfo[g_multi_shelf_index].SpreadItem == "F") {
                                $.each(g_pog_json[p_pog_index].ModuleInfo[g_multi_mod_index].ShelfInfo[g_multi_shelf_index].ItemInfo, function (i, fitems) {
                                    fitems.W = fitems.RW;
                                });
                            }
                            if (details.ObjType !== "PALLET" && reorder_items(g_multi_mod_index, g_multi_shelf_index, p_pog_index)) {// ASA-2010.4.3
                                var returnval = await recreate_all_items(g_multi_mod_index, g_multi_shelf_index, g_multi_shelf_obj_type, "N", -1, -1, g_pog_json[p_pog_index].ModuleInfo[g_multi_mod_index].ShelfInfo[g_multi_shelf_index].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                            }
                        }
                    }
                }
                for (const details of p_deleteDetails) {
                    pogList.push(details.p_pog_index);
                    if (details.Object == "ITEM") {
                        g_deletedItems.push(details.ItemID);
                    }
                }
                undoObjectsInfo.g_deletedItems = g_deletedItems;
                pogList = [...new Set(pogList)];
                for (const index of pogList) {
                    var res = await calculateFixelAndSupplyDays("N", index);
                    var res = await deleted_items_log(g_deletedItems, "D", index);
                    render(index);
                }
                logFinalUndoObjectsInfo(action, "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y");
                g_allUndoObjectsInfo = [];
            } else {
                await deleteWorldObject(p_deleteShelf, p_deleteDetails);
            }

            if (p_productListOpen == "Y" && apex.region("draggable_table") !== null) {
                if (g_all_pog_flag == "N") {
                    $s("P25_OPEN_POG_CODE", `${g_pog_json[p_pog_index].POGCode}`);
                    $s("P25_OPEN_POG_VERSION", `${g_pog_json[p_pog_index].Version}`);
                } else {
                    $s("P25_OPEN_POG_CODE", "");
                    $s("P25_OPEN_POG_VERSION", "");
                }
            }
            if (g_all_pog_flag == "Y") {
                await render_all_pog();
            }

            g_multiselect = "N";
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
        }

        logDebug("function : deleteObjectLib", "E");
    } catch (err) {
        error_handling(err);
    }
}

//this function is used inside context_delete. it will check if need warning and then call deleteObjectLib which will delete the objects
//from the world and from pog_json
async function deleteObject(p_pog_index, p_deleteDetailsArr, p_productListOpen, p_deleteModule = "N", p_moduleIndex = -1, p_undoType) {
    logDebug("function : deleteObject; p_pog_index : " + p_pog_index + "; pProductListOpen : " + p_productListOpen + "; pDeleteModule : " + p_deleteModule + "; pModuleIndex : " + p_moduleIndex, "S");
    try {
        g_mselect_drag = "N";
        var deleteShelf = "N";
        if (p_deleteModule !== "Y") {
            var deleteItem = "N";
            var objecttype = "";

            for (const objects of p_deleteDetailsArr) {
                if (objects.Object !== objecttype && objecttype !== "") {
                    deleteItem = "Y";
                }
                objecttype = objects.Object;
                if (objects.Object == "SHELF") {
                    deleteShelf = "Y";
                }
            }
            if (deleteItem == "Y" && deleteShelf == "Y") {
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
                // ax_message.confirm(get_message("ITEM_FIXEL_DELETE"), async function (e) {
                //     if (e) {
                //         await deleteObjectLib(p_pog_index, deleteShelf, p_deleteDetailsArr, p_productListOpen, "N", -1, "");
                //     } else {
                //         deleteShelf = "N";
                //         await deleteObjectLib(p_pog_index, deleteShelf, p_deleteDetailsArr, p_productListOpen, "N", -1, "");
                //     }
                // });

                confirm(
                    get_message("ITEM_FIXEL_DELETE"),
                    get_message("SHCT_YES"),
                    get_message("SHCT_NO"),
                    async function () {
                        await deleteObjectLib(p_pog_index, deleteShelf, p_deleteDetailsArr, p_productListOpen, "N", -1, "");
                    },
                    async function () {
                        deleteShelf = "N";
                        await deleteObjectLib(p_pog_index, deleteShelf, p_deleteDetailsArr, p_productListOpen, "N", -1, "");
                    }
                );
                //Task_29818 - End
            } else {
                await deleteObjectLib(p_pog_index, deleteShelf, p_deleteDetailsArr, p_productListOpen, "N", -1, "");
            }
        } else {
            await deleteObjectLib(p_pog_index, deleteShelf, p_deleteDetailsArr, p_productListOpen, "Y", p_moduleIndex, p_undoType);
        }

        g_delete_details = [];
        g_multi_drag_shelf_arr = [];
        g_multi_drag_item_arr = [];
        logDebug("function : deleteObject", "E");
    } catch (err) {
        error_handling(err);
    }
}
// Task 21828, End

function getFieldValue(p_object, p_fieldPath, p_label_type) {
    //ASA-1361 20240501 -added the p_lable_type param to check the status bar of shelf  to update the width in html tag not in the world beacuse some function  we use the shelf world object width for item x calculation

    var fields = p_fieldPath.split(".");
    var value = p_object;
    for (const field of fields) {
        if (value && typeof value === "object" && field in value) {
            if ((typeof value[field] !== "undefined" && value[field] !== null && value[field] !== "") || (typeof value[field] == "number" && !isNaN(value[field]))) {
                //ASA-1407 task 1,//ASA-1407 20240521
                if (p_label_type == "F" && (field == "W" || field == "H" || field == "D" || field == "ROverhang" || field == "LOverhang")) {
                    //ASA-1361 -S
                    value = parseFloat(parseFloat(value[field] * 100).toFixed(2)); //ASA-1623 Issue 4
                } else if (p_fieldPath == "ASP" || p_fieldPath == "EDLP") {
                    //ASA-1407 Task 1
                    value = g_msg_dollar + value[field];
                } else if (field == "W" || field == "H" || field == "D" || field == "ROverhang" || field == "LOverhang" || field == "X" || field == "Y" || field == "Z") {
                    value = parseFloat(parseFloat(value[field]).toFixed(2));
                } //ASA-1623 Issue 4
                else {
                    value = value[field];
                } //ASA-1361 20240501 -E
            } else {
                value = g_msg_na; //ASA-1407 task 1
            }
        } else {
            return "";
        }
    }
    if (p_fieldPath == "OW" || p_fieldPath == "OH" || p_fieldPath == "OD") {
        value = parseFloat(parseFloat(value).toFixed(2)); //ASA-1623 Issue 4
    }
    if (p_fieldPath == "ItemDim" && $v("P25_ITEM_DIMENSION_FORMAT_SWITCH") == "Y") {
        //ASA-1758 START
        var g_msg_h = get_message("POGCR_MSG_H"),
            g_msg_w = get_message("POGCR_MSG_W"),
            g_msg_d = get_message("POGCR_MSG_D");

        var ow = Math.round(p_object.OW * 10) / 10,
            // ow_crushed = parseFloat(p_object.OW * (1 - p_object.CrushW / 100)).toFixed(1),
            ow_crushed = Math.round(p_object.OW * (1 - p_object.CrushW / 100) * 10) / 10,
            crush_w = p_object.CrushW,
            oh = Math.round(p_object.OH * 10) / 10,
            // oh_crushed = parseFloat(p_object.OH * (1 - p_object.CrushH / 100)).toFixed(1),
            oh_crushed = Math.round(p_object.OH * (1 - p_object.CrushH / 100) * 10) / 10,
            crush_h = p_object.CrushH,
            od = Math.round(p_object.OD * 10) / 10,
            // od_crushed = parseFloat(p_object.OD * (1 - p_object.CrushD / 100)).toFixed(1),
            od_crushed = Math.round(p_object.OD * (1 - p_object.CrushD / 100) * 10) / 10,
            crush_d = p_object.CrushD;

        value = g_msg_w + ":" + ow + " (" + ow_crushed + "/" + crush_w + ") " + g_msg_h + ":" + oh + " (" + oh_crushed + "/" + crush_h + ") " + g_msg_d + ":" + od + " (" + od_crushed + "/" + crush_d + ")";
    } //ASA-1758 END

    return value;
}

//this function calls from screen when click sales refresh.
async function call_sales_refresh(p_pog_index) {   //ASA-1923 changes in this function for mutiple store
    var storeVal = $v("P25_STORE");
    if (!storeVal) {
        storeVal = $v("P25_MULTIPLE_STORE");
        storeVal = storeVal.replace(/,/g, ":"); //ASA-1923 Issue 4
    }
    var weeksel;        //ASA-1991 S
    if ($v("P25_SHOW_HIDE_WEEK_SELECTION") == "Y") {
        weeksel = $v("P25_WEEK_SELECTION");
    }        //ASA-1991 E
    $s("P25_REFRESH_SALE_CALL", "Y");
    if (g_all_pog_flag == "N") {
        var z = p_pog_index;
    } else {
        var z = 0;
    }
    addLoadingIndicator();
    for (const pogInfo of g_pog_json) {
        //ASA-1360 task 1 Start
        //if (((g_pog_json[z].NewPOG == "N" || typeof g_pog_json[z].NewPOG == 'undefined') && $v("P25_STORE") == "" && $v('P25_POGCR_SALES_REFRESH_HIDE_STORE') == 'N') || ((g_pog_json[z].NewPOG == "N" || typeof g_pog_json[z].NewPOG == 'undefined') && $v("P25_SALES_POG_CODE") == "" && $v('P25_POGCR_SALES_REFRESH_HIDE_STORE') == 'Y')) { //ASA - 1475 Issue 1
        if (((g_pog_json[z].NewPOG == "Y" || typeof g_pog_json[z].NewPOG == "undefined") && storeVal == "" && $v("P25_POGCR_SALES_REFRESH_HIDE_STORE") == "N") || ((g_pog_json[z].NewPOG == "Y" || typeof g_pog_json[z].NewPOG == "undefined") && $v("P25_SALES_POG_CODE") == "" && $v("P25_POGCR_SALES_REFRESH_HIDE_STORE") == "Y")) {
            //ASA - 1475 Issue 1
            raise_error($v("P25_POGCR_SALES_REFRESH_HIDE_STORE") == "N" ? get_message("POGCR_STORE_VALIDATE") : get_message("POGCR_SALES_POG_CODE_VALID"));
            //ASA-1360 task 1 End
        } else {
            $s("P25_OPEN_POG_CODE", g_pog_json[z].POGCode);
            //var l_pog_code = (g_pog_json[z].NewPOG == "N" || typeof g_pog_json[z].NewPOG == 'undefined') && $v('P25_POGCR_SALES_REFRESH_HIDE_STORE') == 'Y' ? $v("P25_SALES_POG_CODE") : g_pog_json[z].POGCode; //ASA-1360 task 1 //ASA - 1475 Issue 1
            var l_pog_code = (g_pog_json[z].NewPOG == "Y" || typeof g_pog_json[z].NewPOG == "undefined") && $v("P25_POGCR_SALES_REFRESH_HIDE_STORE") == "Y" ? $v("P25_SALES_POG_CODE") : g_pog_json[z].POGCode; //ASA - 1475 Issue 1
            //start Task-02_25977
            //await refresh_sales_data("#P25_OPEN_POG_CODE,#P25_WEEK_SELECTION,#P25_STORE", $v("P25_WEEK_SELECTION"), $v("P25_STORE"), $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), $v("P25_POGCR_ITEM_DETAIL_LIST"), g_show_days_of_supply, "Y", "N", 'Y', g_pog_json[z].POGCode, 'N', z);
            await refresh_sales_data(weeksel, storeVal, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "Y", "N", "Y", g_pog_json[z].POGCode, l_pog_code, "N", z); //ASA-1360 task 1 //ASA-1360 issue 3 ,//ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')  //ASA-1991 
            //end Task-02_25977
            if (g_all_pog_flag == "Y") {
                z++;
            } else {
                break;
            }
        }
    }
    removeLoadingIndicator(regionloadWait);
}

//ASA-1422
//this function is used when click shelf and select any 2 product and we find out the area between and multi select objects in between them
//after this it will work similarly like drag multi select.
function multiSelectItemsWithShift(p_pog_index, p_offset_perc) {
    try {
        logDebug("function : multiSelectItemsWithShift; p_pog_index : " + p_pog_index + "; p_offset_perc : " + p_offset_perc, "S");
        var startX,
            startY,
            endX,
            endY,
            carpark_object = "CARPARK_ITEM",
            carparkIntersect = "N",
            fLeft,
            fRight,
            fBottom,
            fTop,
            lLeft,
            lRight,
            lBottom,
            lTop;
        if (!$.isEmptyObject(g_shift_multi_item_last)) {
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            carparkIntersect = g_shift_multi_item_first.isCarpark == "Y" || g_shift_multi_item_last.isCarpark == "Y" ? "Y" : "N";

            fTop = g_shift_multi_item_first.Y + g_shift_multi_item_first.H / 2;
            fRight = g_shift_multi_item_first.X + g_shift_multi_item_first.W / 2;
            fBottom = g_shift_multi_item_first.Y - g_shift_multi_item_first.H / 2;
            fLeft = g_shift_multi_item_first.X - g_shift_multi_item_first.W / 2;

            lTop = g_shift_multi_item_last.Y + g_shift_multi_item_last.H / 2;
            lRight = g_shift_multi_item_last.X + g_shift_multi_item_last.W / 2;
            lBottom = g_shift_multi_item_last.Y - g_shift_multi_item_last.H / 2;
            lLeft = g_shift_multi_item_last.X - g_shift_multi_item_last.W / 2;

            startX = Math.min(fLeft, lLeft);
            startY = Math.max(fTop, lTop);
            endX = Math.max(fRight, lRight);
            endY = Math.min(fBottom, lBottom);

            var j = 0;
            for (const module of g_pog_json[p_pog_index].ModuleInfo) {
                if (module.ParentModule == null || module.ParentModule == "undefined") {
                    var k = 0;
                    for (const shelf of module.ShelfInfo) {
                        if (typeof shelf !== "undefined") {
                            if (shelf.ObjType !== "NOTCH" && shelf.ObjType !== "BASE" && shelf.ObjType !== "DIVIDER" && shelf.ObjType !== "TEXTBOX") {
                                var l = 0;
                                for (const item of shelf.ItemInfo) {
                                    var itemTop = item.Y + item.H / 2,
                                        itemLeft = item.X - item.W / 2,
                                        itemBottom = item.Y - item.H / 2,
                                        itemRight = item.X + item.W / 2;
                                    if (
                                        (itemTop <= startY && itemRight <= endX && itemBottom >= endY && itemLeft >= startX) ||
                                        (p_offset_perc > 0 && ((itemTop > startY && itemRight <= endX && itemBottom >= endY && itemLeft >= startX && startY > itemBottom && (startY - itemBottom) / item.H >= p_offset_perc / 100) || (itemTop <= startY && itemRight > endX && itemBottom >= endY && itemLeft >= startX && endX > itemLeft && (endX - itemLeft) / item.W >= p_offset_perc / 100) || (itemTop <= startY && itemRight <= endX && itemBottom < endY && itemLeft >= startX && endY < itemTop && (itemTop - endY) / item.H >= p_offset_perc / 100) || (itemTop <= startY && itemRight <= endX && itemBottom >= endY && itemLeft < startX && startX < itemRight && (itemRight - startX) / item.W >= p_offset_perc / 100) || (itemTop > startY && itemRight <= endX && itemBottom < endY && itemLeft >= startX && (startY - endY) / item.H >= p_offset_perc / 100) || (itemTop <= startY && itemRight > endX && itemBottom >= endY && itemLeft < startX && (endX - startX) / item.W >= p_offset_perc / 100) || (itemTop > startY && startY > itemBottom && itemRight > endX && endX > itemLeft && itemBottom >= endY && itemLeft >= startX && (endX - itemLeft) / item.W >= p_offset_perc / 100 && (startY - itemBottom) / item.H >= p_offset_perc / 100) || (itemTop <= startY && itemRight <= endX && itemLeft < startX && startX < itemRight && itemBottom < endY && endY < itemTop && (itemTop - endY) / item.H >= p_offset_perc / 100 && (itemRight - startX) / item.W >= p_offset_perc / 100) || (itemTop <= startY && itemBottom < endY && endY < itemTop && itemRight > endX && endX > itemLeft && itemLeft >= startX && (itemTop - endY) / item.H >= p_offset_perc / 100 && (endX - itemLeft) / item.W >= p_offset_perc / 100) || (itemTop > startY && startY > itemBottom && itemBottom >= endY && itemRight <= endX && startX < itemRight && itemLeft < startX && (itemRight - startX) / item.W >= p_offset_perc / 100 && (startY - itemBottom) / item.H >= p_offset_perc / 100)))
                                    ) {
                                        //ASA-1422 issue 2
                                        var is_divider = "N";
                                        var object = "ITEM";
                                        if (item.Item == "DIVIDER") {
                                            is_divider = "Y";
                                            object = "SHELF";
                                        }
                                        var details = setDetailsArray(item.ObjID, j, k, item.W, item.H, item.X, item.Y, item.Z, l, shelf.ObjType, is_divider, object, module.MObjID, shelf.SObjID, item.ItemID, item.Item, "N", 0, 0, item.Distance, item.TopObjID, item.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);
                                        details["W"] = item.W;
                                        details["RW"] = item.RW;
                                        details["H"] = item.H;
                                        details["X"] = item.X;
                                        details["Y"] = item.Y;
                                        g_delete_details.multi_delete_shelf_ind = "";
                                        g_delete_details.push(details);
                                    }
                                    l++;
                                }
                            }
                        }
                        k++;
                    }
                    if (carparkIntersect == "Y") {
                        var Carpark = module.Carpark;
                        if (typeof Carpark !== "undefined" && Carpark.length > 0) {
                            var l = 0;
                            for (const item of module.Carpark[0].ItemInfo) {
                                var itemTop = item.Y + item.H / 2,
                                    itemLeft = item.X + item.W / 2,
                                    itemBottom = item.Y - item.H / 2,
                                    itemRight = item.X - item.W / 2;
                                if (
                                    (itemTop <= startY && itemRight <= endX && itemBottom >= endY && itemLeft >= startX) ||
                                    (p_offset_perc > 0 && ((itemTop > startY && itemRight <= endX && itemBottom >= endY && itemLeft >= startX && startY > itemBottom && (startY - itemBottom) / item.H >= p_offset_perc / 100) || (itemTop <= startY && itemRight > endX && itemBottom >= endY && itemLeft >= startX && endX > itemLeft && (endX - itemLeft) / item.W >= p_offset_perc / 100) || (itemTop <= startY && itemRight <= endX && itemBottom < endY && itemLeft >= startX && endY < itemTop && (itemTop - endY) / item.H >= p_offset_perc / 100) || (itemTop <= startY && itemRight <= endX && itemBottom >= endY && itemLeft < startX && startX < itemRight && (itemRight - startX) / item.W >= p_offset_perc / 100) || (itemTop > startY && itemRight <= endX && itemBottom < endY && itemLeft >= startX && (startY - endY) / item.H >= p_offset_perc / 100) || (itemTop <= startY && itemRight > endX && itemBottom >= endY && itemLeft < startX && (endX - startX) / item.W >= p_offset_perc / 100) || (itemTop > startY && startY > itemBottom && itemRight > endX && endX > itemLeft && itemBottom >= endY && itemLeft >= startX && (endX - itemLeft) / item.W >= p_offset_perc / 100 && (startY - itemBottom) / item.H >= p_offset_perc / 100) || (itemTop <= startY && itemRight <= endX && itemLeft < startX && startX < itemRight && itemBottom < endY && endY < itemTop && (itemTop - endY) / item.H >= p_offset_perc / 100 && (itemRight - startX) / item.W >= p_offset_perc / 100) || (itemTop <= startY && itemBottom < endY && endY < itemTop && itemRight > endX && endX > itemLeft && itemLeft >= startX && (itemTop - endY) / item.H >= p_offset_perc / 100 && (endX - itemLeft) / item.W >= p_offset_perc / 100) || (itemTop > startY && startY > itemBottom && itemBottom >= endY && itemRight <= endX && startX < itemRight && itemLeft < startX && (itemRight - startX) / item.W >= p_offset_perc / 100 && (startY - itemBottom) / item.H >= p_offset_perc / 100)))
                                ) {
                                    //ASA-1422 issue 2
                                    var details = setDetailsArray(item.ObjID, j, 0, item.W, item.H, item.X, item.Y, item.Z, l, Carpark.ObjType, "N", carpark_object, module.MObjID, Carpark.SObjID, item.ItemID, item.Item, "N", 0, 0, item.Distance, item.TopObjID, item.BottomObjID, g_start_canvas, g_present_canvas, p_pog_index);
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
                                l++;
                            }
                        }
                    }
                }
                j++;
            }
            g_delete_details.StartCanvas = g_start_canvas;
            g_delete_details.g_present_canvas = g_present_canvas;
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
            if (g_delete_details.length > 0) {
                g_multiselect = "Y";
                g_mselect_drag = "Y";
                g_intersected = [];
                if (typeof g_delete_details !== "undefined") {
                    $.each(g_delete_details, function (j, details) {
                        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(details.ObjID);
                        g_intersected.push(selectedObject);
                    });
                    render_animate_selected();
                }
            }
        }
        logDebug("function : multiSelectItemsWithShift", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function set_btn_attr_onload() {
    if ("&AI_EDIT_IND." == "Y") {
        $(".create_module").css("visibility", "visible");
        $(".create_shelf").css("visibility", "visible");
        $(".create_pegboard").css("visibility", "visible");
        $(".create_text").css("visibility", "visible");
        $(".create_hangingbar").css("visibility", "visible");
        $(".create_basket").css("visibility", "visible");
        $(".create_chest").css("visibility", "visible");
        $(".create_rod").css("visibility", "visible");
        $(".create_pallet").css("visibility", "visible");
        $(".create_divider").css("visibility", "visible");
        $(".fixel_label").css("visibility", "visible");
        $(".item_label").css("visibility", "visible");
        $(".item_desc").css("visibility", "visible");
        $(".open_fixel").css("visibility", "visible");
        $(".clear_item").css("visibility", "visible");
        $(".clear_pog_att").css("visibility", "visible");
        $(".clear_pog_info").css("visibility", "visible");
        $(".open_pdf").css("display", "block");
        $s("P25_OPEN_DRAFT", "Y");
        auto_position_ind = "N";
        reset_indicators();
        $(".auto_position").removeClass("auto_position_active");
        if (apex.region("draggable_table") !== null) {
            apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
            apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
            apex.region("draggable_table").refresh();
        }
    }
}

//ASA-1446
//this function is called on page load when we navigate from item recommendation. when select autofill POG for any selected POG. new tab will open
//and we setup autofill with the recommended items from item recommendation screen.
async function upld_recom_autofill_items(p_pog_json, p_pog_index) {
    logDebug("function : upld_recom_autofill_items");
    return new Promise(function (resolve, reject) {
        var i = 0;
        for (const modules_info of p_pog_json[p_pog_index].ModuleInfo) {
            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                if (modules_info.ShelfInfo.length > 0) {
                    var j = 0;
                    for (const shelfs of modules_info.ShelfInfo) {
                        p_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo = [];
                        j++;
                    }
                }
            }
            i++;
        }
        apex.server.process(
            "UPLD_RECOM_AUTOFILL_ITEMS",
            {},
            {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) == "") {
                        $s("P25_CASE_ID", "");
                        $s("P25_SCENARIO_ID", "");
                        resolve("SUCCESS");
                    } else {
                        raise_error(pData);
                        resolve("ERROR");
                    }
                },
            }
        );
    });
}
//End ASA-1451

//ASA - 1592 #Start
function itemOverShelfInsidePegboard(p_item_x, p_item_y, p_pb_module, p_pb_idx, p_pog_index, p_item) {
    logDebug("function : itemOverShelfInsidePegboard; Start");
    try {
        var div_object_type;
        var div_shelf_index = -1;
        var shelfY = 0,
            shelfHeight = 0;
        var shelf_found = "N";
        var shelfInsidePeg = "N";

        var shelfCount = 0;
        var itemStart = wpdSetFixed(p_item_x - p_item.W / 2);
        var itemEnd = wpdSetFixed(p_item_x + p_item.W / 2);
        var itemTop = wpdSetFixed(p_item_y + p_item.H / 2);
        var itemBottom = wpdSetFixed(p_item_y - p_item.H / 2);

        var pbStart = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].X - g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].W / 2);
        var pbEnd = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].X + g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].W / 2);
        var pbTop = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].Y + g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].H / 2);
        var pbBottom = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].Y - g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].H / 2);
        var shelfInfo = g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo;
        for (const shelf of shelfInfo) {
            if (shelf.ObjType == "SHELF") {
                var shelfStart = wpdSetFixed(shelf.X - shelf.W / 2);
                var shelfEnd = wpdSetFixed(shelf.X + shelf.W / 2);
                var shelfTop = wpdSetFixed(shelf.Y + shelf.H / 2);
                var shelfBottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                if (pbStart < shelfStart && pbEnd > shelfEnd && pbTop > shelfTop && pbBottom < shelfBottom) {
                    if (itemStart < shelfEnd && itemEnd > shelfStart && itemTop > shelfBottom && itemBottom < shelfTop) {
                        div_object_type = shelf.ObjType;
                        shelfY = shelf.Y;
                        shelfHeight = shelf.H;
                        div_shelf_index = shelfCount;
                        shelf_found = "Y";
                        shelfInsidePeg = "Y";
                        break;
                    }
                }
            }
            shelfCount++;
        }

        if (shelf_found == "N") {
            div_object_type = "PEGBOARD";
            shelfY = g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].Y;
            shelfHeight = g_pog_json[p_pog_index].ModuleInfo[p_pb_module].ShelfInfo[p_pb_idx].H;
            div_shelf_index = p_pb_idx;
            shelf_found = "Y";
        }
        logDebug("function : itemOverShelfInsidePegboard; End");
        return [p_pb_module, div_object_type, shelfY, shelfHeight, div_shelf_index, shelf_found, shelfInsidePeg];
    } catch (err) {
        error_handling(err);
        throw err;
    }
}
//ASA - 1592 #End

//ASA-1640 Start
async function doItemMoveConf(p_drag_item_arr, p_pog_json, p_pog_idx, copyItemArr = -1, copyModIdx = -1) {
    try {
        var isItemExist = false;
        var modIdx = 0,
            shelfIdx = 0,
            itmIdx = 0;
        for (const dragItem of p_drag_item_arr) {
            modIdx = 0;
            for (const module of p_pog_json[p_pog_idx].ModuleInfo) {
                shelfIdx = 0;
                for (const shelf of module.ShelfInfo) {
                    itmIdx = 0;
                    for (const item of shelf.ItemInfo) {
                        if (item.ItemID == dragItem) {
                            if (copyItemArr == -1 && copyModIdx == -1) {
                                isItemExist = true;
                                break;
                            } else {
                                if (copyItemArr != -1) {
                                    for (const copyItem of copyItemArr) {
                                        if (dragItem == copyItem.ItemID && (copyItem.MIndex != modIdx || copyItem.SIndex != shelfIdx || copyItem.IIndex != itmIdx)) {
                                            isItemExist = true;
                                            break;
                                        }
                                    }
                                    if (isItemExist) {
                                        break;
                                    }
                                } else {
                                    if (modIdx != copyModIdx) {
                                        isItemExist = true;
                                        break;
                                    }
                                }
                            }
                        }
                        itmIdx++;
                    }
                    if (isItemExist) {
                        break;
                    }
                    shelfIdx++;
                }
                if (isItemExist) {
                    break;
                }
                modIdx++;
            }
            if (isItemExist) {
                break;
            }
        }
        if (isItemExist) {
            return new Promise((resolve, reject) => {
                confirm(
                    get_message("POG_MULTI_CANVAS_DRAG_CONFIRM"),
                    get_message("SHCT_YES"),
                    get_message("SHCT_NO"),
                    function () {
                        resolve("Y");
                    },
                    function () {
                        resolve("N");
                    }
                );
            });
        } else {
            return -1;
        }
    } catch (err) {
        error_handling(err);
        throw err;
    }
}
//ASA-1640 End

//ASA-1769
function itemInPegboardOverhang(p_final_x, p_final_y, p_pog_index, p_item) {
    try {
        var itemStart = wpdSetFixed(p_final_x - p_item.W / 2);
        var itemEnd = wpdSetFixed(p_final_x + p_item.W / 2);
        var itemTop = wpdSetFixed(p_final_y + p_item.H / 2);
        var itemBottom = wpdSetFixed(p_final_y - p_item.H / 2);
        var modCnt = 0;
        for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var shelfCnt = 0;
                for (const Shelf of modules.ShelfInfo) {
                    if (Shelf.ObjType === "PEGBOARD") {
                        var shelfStart = wpdSetFixed(Shelf.X - Shelf.W / 2);
                        var shelfEnd = wpdSetFixed(Shelf.X + Shelf.W / 2);
                        var shelfTop = wpdSetFixed(Shelf.Y + Shelf.H / 2);
                        var shelfBottom = wpdSetFixed(Shelf.Y - Shelf.H / 2);
                        //This will pass if item overlaps with visible pegboard
                        if (!(itemTop < shelfBottom || itemBottom > shelfTop) && !(itemEnd < shelfStart || itemStart > shelfEnd)) {
                            var shelfStartOver = wpdSetFixed(Shelf.X - Shelf.W / 2 - Shelf.LOverhang);
                            var shelfEndOver = wpdSetFixed(Shelf.X + Shelf.W / 2 + Shelf.ROverhang);
                            var shelfTopOver = wpdSetFixed(Shelf.Y + Shelf.H / 2 + Shelf.UOverHang);
                            var shelfBottomOver = wpdSetFixed(Shelf.Y - Shelf.H / 2 - Shelf.LoOverHang);
                            //This will pass if item is inside pegboard with overhang
                            if (itemTop <= shelfTopOver && itemBottom >= shelfBottomOver && itemStart >= shelfStartOver && itemEnd <= shelfEndOver) {
                                var itemInsidePeg = "Y";
                                if (itemTop > shelfTop || itemBottom < shelfBottom || itemStart < shelfStart || itemEnd > shelfEnd) {
                                    itemInsidePeg = "N";
                                }
                                return [true, "Y", modCnt, "PEGBOARD", Shelf.Y, Shelf.H, shelfCnt, "Y", itemInsidePeg];
                            }
                        }
                    }
                    shelfCnt++;
                }
            }
            modCnt++;
        }
        return [false, "", -1, "", -1, -1, -1, "", ""];
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1812 Added new function to refresh the items dimension when we open the POG. Which depends on BU param - POGCR_ITEM_DIM_AUTO_REFRESH
async function itemDimUpdate(p_pog_index) {
    logDebug("function : itemDimUpdate;");
    try {
        var isDimUpd;
        var i = 0;
        for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var j = 0;
                var recreate = "N";
                for (const shelfs of modules.ShelfInfo) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                        if (shelfs.ItemInfo.length > 0) {
                            var k = 0;
                            for (const items of shelfs.ItemInfo) {
                                if (items.Item !== "DIVIDER") {
                                    if (check_dim_difference(i, j, k, p_pog_index)) {
                                        g_dragItem = items;
                                        return_val = await check_item_dim_valid(items, i, j, k, p_pog_index, "N");
                                        if (return_val == "F") {
                                            isDimUpd = return_val;
                                        }
                                    }
                                }
                                k++;
                            }
                            if (isDimUpd == "F") {
                                //ASA 1812 Issue 2,3
                                if (reorder_items(i, j, p_pog_index)) {
                                    var return_val = await recreate_all_items(i, j, shelfs.ObjType, "Y", -1, -1, shelfs.ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y");
                                }
                            }
                        }
                    }
                    j++;
                }
            }
            i++;
        }
    } catch (err) {
        error_handling(err);
    }
}