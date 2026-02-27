//asw_engine.js manages POG business rules and data structure updates in WPD.


function backupPog(p_backupType, p_shelfIndex, p_moduleIndex, p_pog_index) {
    /*take backup to revert in case of error*/
    if (g_curr_canvas == 1) {
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            g_pogBackup = [];
            backDetail = [];
            backDetail.backupType = p_backupType; //'F' full backup 'S' Shelf backup only
            if (p_backupType == "S") {
                backDetail.shelfIndex = p_shelfIndex;
                backDetail.moduleIndex = p_moduleIndex;
                backDetail.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex])));
            } else {
                backDetail.shelfIndex = -1;
                backDetail.moduleIndex = -1;
                backDetail.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index])));
            }
            g_pogBackup.push(backDetail);
        }
    }
}


function get_min_max_xy_module(p_mod_array, p_module_index, p_width, p_height, p_moduleX, p_pog_width, p_mod_count) {
    logDebug("function : get_min_max_xy_module; p_module_index : " + p_module_index + "; width : " + p_width + "; height : " + p_height + "; moduleX : " + p_moduleX, "S");
    try {
        var max_x = 0,
            min_x = 0,
            max_y = 0,
            min_y = 0,
            shelf_width = 0,
            shelf_height = 0,
            max_height_arr = [],
            max_height = 0,
            index_arr = [],
            mod_index = -1,
            shelf_ind = -1;

        if (p_height <= 0.2) {
            max_x = p_width;
            min_x = 0;
            max_y = p_height;
            min_y = 0;
            if (p_mod_array.ShelfInfo.length > 0) {
                var l_shelf_cnt = 0;
                for (const shelfs of p_mod_array.ShelfInfo) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && ((shelfs.ObjType == "TEXTBOX" && shelfs.W < p_pog_width) || p_mod_count == 1 || (shelfs.ObjType !== "TEXTBOX" && p_mod_count > 1)) && shelfs.SplitChest == "N") {
                        //Task_26627
                        if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                            shelf_width = shelfs.ShelfRotateWidth;
                            shelf_height = shelfs.ShelfRotateHeight;
                        } else {
                            shelf_width = shelfs.W;
                            shelf_height = shelfs.H;
                        }
                        if (shelfs.ObjType == "TEXTBOX" && max_height < shelfs.H) {
                            max_height = shelfs.H;
                            mod_index = p_module_index;
                            shelf_ind = l_shelf_cnt;
                        }
                    }
                    var shelfX = shelfs.X - (p_moduleX - p_width / 2);
                    max_x = Math.max(max_x, shelfX + shelf_width / 2);
                    min_x = Math.min(min_x, shelfX - shelf_width / 2);
                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                    l_shelf_cnt++;
                }
            }
            //Start Task_26627 chestinfo is not considered in finding max height
            //ASA-1506 issue 1, 2
            if (nvl(p_mod_array.ChestInfo) !== 0 && p_mod_array.ChestInfo.length > 0) {
                var l_shelf_cnt = 0;
                for (const shelfs of p_mod_array.ChestInfo) {
                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                        shelf_width = shelfs.ShelfRotateWidth;
                        shelf_height = shelfs.ShelfRotateHeight;
                    } else {
                        shelf_width = shelfs.W;
                        shelf_height = shelfs.H;
                    }
                    if (shelfs.ObjType == "TEXTBOX" && max_height < shelfs.H) {
                        max_height = shelfs.H;
                        mod_index = p_module_index;
                        shelf_ind = l_shelf_cnt;
                    }
                    var shelfX = shelfs.X - (p_moduleX - p_width / 2);
                    max_x = Math.max(max_x, shelfX + shelf_width / 2);
                    min_x = Math.min(min_x, shelfX - shelf_width / 2);
                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                    l_shelf_cnt++;
                }
            }
            //End Task_26627

            var new_width = parseFloat(max_x) - parseFloat(min_x);
            var new_height = parseFloat(max_y) - parseFloat(min_y);
            if (mod_index !== -1 && shelf_ind !== -1) {
                var new_x = p_mod_array.ShelfInfo[shelf_ind].X - (p_moduleX - p_width / 2);
                var new_y = p_mod_array.ShelfInfo[shelf_ind].Y;
            } else {
                var new_x = new_width / 2;
                var new_y = new_height / 2;
            }
        } else {
            max_x = p_width;
            min_x = 0;
            max_y = p_height;
            min_y = 0;
            if (p_mod_array.ShelfInfo.length > 0) {
                var l_shelf_cnt = 0;
                for (const shelfs of p_mod_array.ShelfInfo) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && ((shelfs.ObjType == "TEXTBOX" && shelfs.W < p_pog_width) || p_mod_count == 1 || (shelfs.ObjType !== "TEXTBOX" && p_mod_count > 1)) && shelfs.SplitChest == "N") {
                        //Task_26627
                        if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                            shelf_width = shelfs.ShelfRotateWidth;
                            shelf_height = shelfs.ShelfRotateHeight;
                        } else {
                            shelf_width = shelfs.W;
                            shelf_height = shelfs.H;
                        }
                        var shelfX = shelfs.X - (p_moduleX - p_width / 2);
                        max_x = Math.max(max_x, shelfX + shelf_width / 2);
                        min_x = Math.min(min_x, shelfX - shelf_width / 2);
                        max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                        min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);

                        var l_item_cnt = 0;
                        for (const items of shelfs.ItemInfo) {
                            var itemx = items.X - (p_moduleX - p_width / 2);
                            max_x = Math.max(max_x, itemx + items.W / 2);
                            min_x = Math.min(min_x, itemx - items.W / 2);
                            max_y = Math.max(max_y, items.Y + items.H / 2);
                            min_y = Math.min(min_y, items.Y - items.H / 2);
                            l_item_cnt++;
                        }
                    }
                    l_shelf_cnt++;
                }
            }
            //Start Task_26627 chestinfo is not considered in finding max height
            //ASA-1506 issue 1, 2
            if (nvl(p_mod_array.ChestInfo) !== 0 && p_mod_array.ChestInfo.length > 0) {
                var l_shelf_cnt = 0;
                for (const shelfs of p_mod_array.ChestInfo) {
                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                        shelf_width = shelfs.ShelfRotateWidth;
                        shelf_height = shelfs.ShelfRotateHeight;
                    } else {
                        shelf_width = shelfs.W;
                        shelf_height = shelfs.H;
                    }
                    var shelfX = shelfs.X - (p_moduleX - p_width / 2);
                    max_x = Math.max(max_x, shelfX + shelf_width / 2);
                    min_x = Math.min(min_x, shelfX - shelf_width / 2);
                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);

                    var l_item_cnt = 0;
                    for (const items of shelfs.ItemInfo) {
                        var itemx = items.X - (p_moduleX - p_width / 2);
                        max_x = Math.max(max_x, itemx + items.W / 2);
                        min_x = Math.min(min_x, itemx - items.W / 2);
                        max_y = Math.max(max_y, items.Y + items.H / 2);
                        min_y = Math.min(min_y, items.Y - items.H / 2);
                        l_item_cnt++;
                    }
                    l_shelf_cnt++;
                }
            }
            // ASA-1951  #Task-2 padding issue Start
            var padding = 1;
            min_x -= padding;
            max_x += padding;
            min_y -= padding;
            max_y += padding;

            //ASA-1951 end   

            //End Task_26627
            //var new_width = parseFloat(max_x) - parseFloat(min_x);
            //var new_height = parseFloat(max_y) - parseFloat(min_y);
            //var new_x = new_width / 2;
            //var new_y = new_height / 2;
            var new_width = parseFloat(max_x) - parseFloat(min_x);
            var new_height = parseFloat(max_y) - parseFloat(min_y);
            var new_x = parseFloat(min_x) + new_width / 2;
            var new_y = parseFloat(min_y) + new_height / 2;
        }
        logDebug("function : get_min_max_xy_module", "E");
        return new_width + "###" + new_height + "###" + new_x + "###" + new_y + "###" + min_x + "###" + min_y + "###" + max_x + "###" + max_y;
    } catch (err) {
        error_handling(err);
    }
}

//This function is used to find the modules x and y and used in duplicating module.
function get_actual_mod_xy(p_mod_array, p_width, p_height, p_mod_x) {
    logDebug("function : get_module_final_xy;   width : " + p_width + "; height : " + p_height + "S");
    try {
        console.log(p_mod_array, p_width, p_height, p_mod_x);
        var shelf_width = 0,
            shelf_height = 0,
            max_x = p_width,
            min_x = p_mod_x,
            max_y = p_height,
            min_y = 0;
        if (p_mod_array.ShelfInfo.length > 0) {
            var l_shelf_cnt = 0;
            for (const shelfs of p_mod_array.ShelfInfo) {
                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER") {
                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                        shelf_width = shelfs.ShelfRotateWidth;
                        shelf_height = shelfs.ShelfRotateHeight;
                    } else {
                        shelf_width = shelfs.W;
                        shelf_height = shelfs.H;
                    }
                    var shelfX = shelfs.X;
                    max_x = Math.max(max_x, shelfX + shelf_width / 2);
                    min_x = Math.min(min_x, shelfX - shelf_width / 2);
                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);

                    var l_item_cnt = 0;
                    for (const items of shelfs.ItemInfo) {
                        var itemx = items.X;
                        max_x = Math.max(max_x, itemx + items.W / 2);
                        min_x = Math.min(min_x, itemx - items.W / 2);
                        max_y = Math.max(max_y, items.Y + items.H / 2);
                        min_y = Math.min(min_y, items.Y - items.H / 2);
                        l_item_cnt++;
                    }
                }
                l_shelf_cnt++;
            }
        }
        var new_width = parseFloat(max_x) - parseFloat(min_x);
        var new_height = parseFloat(max_y) - parseFloat(min_y);
        var new_x = new_width / 2;
        var new_y = new_height / 2;

        logDebug("function : get_module_final_xy", "E");
        return new_width + "###" + new_height + "###" + new_x + "###" + new_y + "###" + min_x + "###" + min_y + "###" + max_x + "###" + max_y;
    } catch (err) {
        error_handling(err);
    }
}

//This function is used in combine POG images in PDF. it will give x and y for combined modules.
function get_min_max_xy_combine(p_pog_json, p_mod_sub) {
    logDebug("function : get_min_max_xy", "S");
    try {
        var max_x = 0,
            min_x = 0,
            max_y = 0,
            min_y = 0,
            shelf_width = 0,
            shelf_height = 0,
            max_height_arr = [],
            max_height = 0,
            index_arr = [],
            mod_index = -1,
            shelf_ind = -1;
        if (typeof p_pog_json !== "undefined" && p_pog_json.length > 0) {
            if (p_pog_json[0].H <= 0.2) {
                console.log("if", p_pog_json[0].H);
                max_x = p_pog_json[0].W;
                min_x = 0;
                max_y = p_pog_json[0].H;
                min_y = 0;
                var l_mod_cnt = 0;
                for (const modules of p_pog_json[0].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        if (typeof p_pog_json[0].ModuleInfo[l_mod_cnt].Carpark !== "undefined" && p_pog_json[0].ModuleInfo[l_mod_cnt].Carpark !== null) {
                            if (p_pog_json[0].ModuleInfo[l_mod_cnt].Carpark.length > 0) {
                                var l_car_cnt = 0;
                                for (const shelfs of modules.Carpark) {
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        shelf_width = typeof shelfs.ShelfRotateWidth == "undefined" ? shelfs.W : shelfs.ShelfRotateWidth;
                                        shelf_height = typeof shelfs.ShelfRotateHeight == "undefined" ? shelfs.W : shelfs.ShelfRotateHeight;
                                    } else {
                                        shelf_width = shelfs.W;
                                        shelf_height = shelfs.H;
                                    }
                                    if (shelfs.ObjType == "TEXTBOX" && max_height < shelfs.H) {
                                        max_height = shelfs.H;
                                        mod_index = l_mod_cnt;
                                        shelf_ind = l_car_cnt;
                                    }
                                    max_x = Math.max(max_x, shelfs.X + shelf_width / 2 - p_mod_sub);
                                    min_x = Math.min(min_x, shelfs.X - shelf_width / 2 - p_mod_sub);
                                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                                    var l_item_cnt = 0;
                                    for (const items of shelfs.ItemInfo) {
                                        max_x = Math.max(max_x, items.X + items.W / 2 - p_mod_sub);
                                        min_x = Math.min(min_x, items.X - items.W / 2 - p_mod_sub);
                                        max_y = Math.max(max_y, items.Y + items.H / 2);
                                        min_y = Math.min(min_y, items.Y - items.H / 2);
                                        l_item_cnt = l_item_cnt++;
                                    }
                                    l_car_cnt = l_car_cnt++;
                                }
                            }
                        }
                        console.log("0", 0, l_mod_cnt);
                        if (p_pog_json[0].ModuleInfo[l_mod_cnt].ShelfInfo.length > 0) {
                            var l_shelf_cnt = 0;
                            for (const shelfs of modules.ShelfInfo) {
                                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER") {
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        shelf_width = typeof shelfs.ShelfRotateWidth == "undefined" ? shelfs.W : shelfs.ShelfRotateWidth;
                                        shelf_height = typeof shelfs.ShelfRotateHeight == "undefined" ? shelfs.W : shelfs.ShelfRotateHeight;
                                    } else {
                                        shelf_width = shelfs.W;
                                        shelf_height = shelfs.H;
                                    }
                                    if (shelfs.ObjType == "TEXTBOX" && max_height < shelfs.H) {
                                        max_height = shelfs.H;
                                        mod_index = l_mod_cnt;
                                        shelf_ind = l_shelf_cnt;
                                    }
                                }
                                max_x = Math.max(max_x, shelfs.X + shelf_width / 2 - p_mod_sub);
                                min_x = Math.min(min_x, shelfs.X - shelf_width / 2 - p_mod_sub);
                                max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                                min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                                l_shelf_cnt++;
                            }
                        }
                    }
                    //});
                    l_mod_cnt++;
                }
                var new_width = parseFloat(max_x) - parseFloat(min_x);
                var new_height = parseFloat(max_y) - parseFloat(min_y);
                if (mod_index !== -1 && shelf_ind !== -1) {
                    var new_x = p_pog_json[0].ModuleInfo[mod_index].ShelfInfo[shelf_ind].X;
                    var new_y = p_pog_json[0].ModuleInfo[mod_index].ShelfInfo[shelf_ind].Y;
                } else {
                    var new_x = parseFloat(min_x) + new_width / 2;
                    var new_y = parseFloat(min_y) + new_height / 2;
                }
            } else {
                max_x = p_pog_json[0].W;
                min_x = 0;
                max_y = p_pog_json[0].H;
                min_y = 0;
                var l_mod_cnt = 0;
                for (const modules of p_pog_json[0].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        if (typeof p_pog_json[0].ModuleInfo[l_mod_cnt].Carpark !== "undefined" && p_pog_json[0].ModuleInfo[l_mod_cnt].Carpark !== null) {
                            if (p_pog_json[0].ModuleInfo[l_mod_cnt].Carpark.length > 0) {
                                var l_car_cnt = 0;
                                for (const shelfs of modules.Carpark) {
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        shelf_width = typeof shelfs.ShelfRotateWidth == "undefined" ? shelfs.W : shelfs.ShelfRotateWidth;
                                        shelf_height = typeof shelfs.ShelfRotateHeight == "undefined" ? shelfs.W : shelfs.ShelfRotateHeight;
                                    } else {
                                        shelf_width = shelfs.W;
                                        shelf_height = shelfs.H;
                                    }
                                    if (shelfs.ObjType == "TEXTBOX" && max_height < shelfs.H) {
                                        max_height = shelfs.H;
                                        mod_index = l_mod_cnt;
                                        shelf_ind = l_car_cnt;
                                    }
                                    max_x = Math.max(max_x, shelfs.X + shelf_width / 2 - p_mod_sub);
                                    min_x = Math.min(min_x, shelfs.X - shelf_width / 2 - p_mod_sub);
                                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                                    var l_item_cnt = 0;
                                    for (const items of shelfs.ItemInfo) {
                                        max_x = Math.max(max_x, items.X + items.W / 2 - p_mod_sub);
                                        min_x = Math.min(min_x, items.X - items.W / 2 - p_mod_sub);
                                        max_y = Math.max(max_y, items.Y + items.H / 2);
                                        min_y = Math.min(min_y, items.Y - items.H / 2);
                                        l_item_cnt++;
                                    }
                                    l_car_cnt++;
                                }
                            }
                        }
                        if (p_pog_json[0].ModuleInfo[l_mod_cnt].ShelfInfo.length > 0) {
                            var l_shelf_cnt = 0;
                            for (const shelfs of modules.ShelfInfo) {
                                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER") {
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        shelf_width = typeof shelfs.ShelfRotateWidth == "undefined" ? shelfs.W : shelfs.ShelfRotateWidth;
                                        shelf_height = typeof shelfs.ShelfRotateHeight == "undefined" ? shelfs.W : shelfs.ShelfRotateHeight;
                                    } else {
                                        shelf_width = shelfs.W;
                                        shelf_height = shelfs.H;
                                    }
                                    max_x = Math.max(max_x, shelfs.X + shelf_width / 2 - p_mod_sub);
                                    min_x = Math.min(min_x, shelfs.X - shelf_width / 2 - p_mod_sub);
                                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                                    var l_item_cnt = 0;
                                    if (shelfs.ObjType == "TEXTBOX") {
                                        shelfs.ItemInfo = [];
                                    }
                                    for (const items of shelfs.ItemInfo) {
                                        max_x = Math.max(max_x, items.X + items.W / 2 - p_mod_sub);
                                        min_x = Math.min(min_x, items.X - items.W / 2 - p_mod_sub);
                                        max_y = Math.max(max_y, items.Y + items.H / 2);
                                        min_y = Math.min(min_y, items.Y - items.H / 2);
                                        l_item_cnt++;
                                    }
                                }
                                l_shelf_cnt++;
                            }
                        }
                    }
                    l_mod_cnt++;
                }
                var new_width = parseFloat(max_x) - parseFloat(min_x);
                var new_height = parseFloat(max_y) - parseFloat(min_y);
                var new_x = parseFloat(min_x) + new_width / 2;
                var new_y = parseFloat(min_y) + new_height / 2;
            }
        }
        logDebug("function : get_min_max_xy", "E");
        return new_width + "###" + new_height + "###" + new_x + "###" + new_y + "###" + min_x + "###" + min_y;
    } catch (err) {
        error_handling(err);
    }
}

//This is used before calling set_camera_z. which will first find the min max xy of whole POG and send to set_camera_z.
function get_min_max_xy(p_pog_index) {
    logDebug("function : get_min_max_xy", "S");
    try {
        var max_x = 0,
            min_x = 0,
            max_y = 0,
            min_y = 0,
            shelf_width = 0,
            shelf_height = 0,
            max_height_arr = [],
            max_height = 0,
            index_arr = [],
            mod_index = -1,
            shelf_ind = -1;
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            //This is POG where module height will be very less like a thing board in the bottom.
            //POG which has slopped shelfs on both side on a single text box standing in the center. will have this type.
            if (g_pog_json[p_pog_index].H <= 0.2) {
                console.log("if", g_pog_json[p_pog_index].H);
                max_x = g_pog_json[p_pog_index].W;
                min_x = 0;
                max_y = g_pog_json[p_pog_index].H;
                min_y = 0;
                var l_mod_cnt = 0;
                for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        if (typeof g_pog_json[p_pog_index].ModuleInfo[l_mod_cnt].Carpark !== "undefined" && g_pog_json[p_pog_index].ModuleInfo[l_mod_cnt].Carpark !== null) {
                            if (g_pog_json[p_pog_index].ModuleInfo[l_mod_cnt].Carpark.length > 0) {
                                var l_car_cnt = 0;
                                for (const shelfs of modules.Carpark) {
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        shelf_width = typeof shelfs.ShelfRotateWidth == "undefined" ? shelfs.W : shelfs.ShelfRotateWidth;
                                        shelf_height = typeof shelfs.ShelfRotateHeight == "undefined" ? shelfs.W : shelfs.ShelfRotateHeight;
                                    } else {
                                        shelf_width = shelfs.W;
                                        shelf_height = shelfs.H;
                                    }
                                    if (shelfs.ObjType == "TEXTBOX" && max_height < shelfs.H) {
                                        max_height = shelfs.H;
                                        mod_index = l_mod_cnt;
                                        shelf_ind = l_car_cnt;
                                    }
                                    max_x = Math.max(max_x, shelfs.X + shelf_width / 2);
                                    min_x = Math.min(min_x, shelfs.X - shelf_width / 2);
                                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                                    var l_item_cnt = 0;
                                    for (const items of shelfs.ItemInfo) {
                                        max_x = Math.max(max_x, items.X + items.W / 2);
                                        min_x = Math.min(min_x, items.X - items.W / 2);
                                        max_y = Math.max(max_y, items.Y + items.H / 2);
                                        min_y = Math.min(min_y, items.Y - items.H / 2);
                                        l_item_cnt = l_item_cnt++;
                                    }
                                    l_car_cnt = l_car_cnt++;
                                }
                            }
                        }
                        console.log("p_pog_index", p_pog_index, l_mod_cnt);
                        if (g_pog_json[p_pog_index].ModuleInfo[l_mod_cnt].ShelfInfo.length > 0) {
                            var l_shelf_cnt = 0;
                            for (const shelfs of modules.ShelfInfo) {
                                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER") {
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        shelf_width = typeof shelfs.ShelfRotateWidth == "undefined" ? shelfs.W : shelfs.ShelfRotateWidth;
                                        shelf_height = typeof shelfs.ShelfRotateHeight == "undefined" ? shelfs.W : shelfs.ShelfRotateHeight;
                                    } else {
                                        shelf_width = shelfs.W;
                                        shelf_height = shelfs.H;
                                    }
                                    if (shelfs.ObjType == "TEXTBOX" && max_height < shelfs.H) {
                                        max_height = shelfs.H;
                                        mod_index = l_mod_cnt;
                                        shelf_ind = l_shelf_cnt;
                                    }
                                }
                                max_x = Math.max(max_x, shelfs.X + shelf_width / 2);
                                min_x = Math.min(min_x, shelfs.X - shelf_width / 2);
                                max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                                min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                                l_shelf_cnt++;
                            }
                        }
                    }
                    //});
                    l_mod_cnt++;
                }
                var new_width = parseFloat(max_x) - parseFloat(min_x);
                var new_height = parseFloat(max_y) - parseFloat(min_y);
                if (mod_index !== -1 && shelf_ind !== -1) {
                    var new_x = g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo[shelf_ind].X;
                    var new_y = g_pog_json[p_pog_index].ModuleInfo[mod_index].ShelfInfo[shelf_ind].Y;
                } else {
                    var new_x = parseFloat(min_x) + new_width / 2;
                    var new_y = parseFloat(min_y) + new_height / 2;
                }
            } else {
                //This block is for normal POG.
                max_x = g_pog_json[p_pog_index].W;
                min_x = 0;
                max_y = g_pog_json[p_pog_index].H;
                min_y = 0;
                var l_mod_cnt = 0;
                for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        if (typeof g_pog_json[p_pog_index].ModuleInfo[l_mod_cnt].Carpark !== "undefined" && g_pog_json[p_pog_index].ModuleInfo[l_mod_cnt].Carpark !== null) {
                            if (g_pog_json[p_pog_index].ModuleInfo[l_mod_cnt].Carpark.length > 0) {
                                var l_car_cnt = 0;
                                for (const shelfs of modules.Carpark) {
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        shelf_width = typeof shelfs.ShelfRotateWidth == "undefined" ? shelfs.W : shelfs.ShelfRotateWidth;
                                        shelf_height = typeof shelfs.ShelfRotateHeight == "undefined" ? shelfs.W : shelfs.ShelfRotateHeight;
                                    } else {
                                        shelf_width = shelfs.W;
                                        shelf_height = shelfs.H;
                                    }
                                    if (shelfs.ObjType == "TEXTBOX" && max_height < shelfs.H) {
                                        max_height = shelfs.H;
                                        mod_index = l_mod_cnt;
                                        shelf_ind = l_car_cnt;
                                    }
                                    max_x = Math.max(max_x, shelfs.X + shelf_width / 2);
                                    min_x = Math.min(min_x, shelfs.X - shelf_width / 2);
                                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                                    var l_item_cnt = 0;
                                    for (const items of shelfs.ItemInfo) {
                                        max_x = Math.max(max_x, items.X + items.W / 2);
                                        min_x = Math.min(min_x, items.X - items.W / 2);
                                        max_y = Math.max(max_y, items.Y + items.H / 2);
                                        min_y = Math.min(min_y, items.Y - items.H / 2);
                                        l_item_cnt++;
                                    }
                                    l_car_cnt++;
                                }
                            }
                        }
                        if (g_pog_json[p_pog_index].ModuleInfo[l_mod_cnt].ShelfInfo.length > 0) {
                            var l_shelf_cnt = 0;
                            for (const shelfs of modules.ShelfInfo) {
                                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER") {
                                    if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                        shelf_width = typeof shelfs.ShelfRotateWidth == "undefined" ? shelfs.W : shelfs.ShelfRotateWidth;
                                        shelf_height = typeof shelfs.ShelfRotateHeight == "undefined" ? shelfs.W : shelfs.ShelfRotateHeight;
                                    } else {
                                        shelf_width = shelfs.W;
                                        shelf_height = shelfs.H;
                                    }
                                    max_x = Math.max(max_x, shelfs.X + shelf_width / 2);
                                    min_x = Math.min(min_x, shelfs.X - shelf_width / 2);
                                    max_y = Math.max(max_y, shelfs.Y + shelf_height / 2);
                                    min_y = Math.min(min_y, shelfs.Y - shelf_height / 2);
                                    var l_item_cnt = 0;
                                    if (shelfs.ObjType == "TEXTBOX") {
                                        shelfs.ItemInfo = [];
                                    }
                                    for (const items of shelfs.ItemInfo) {
                                        max_x = Math.max(max_x, items.X + items.W / 2);
                                        min_x = Math.min(min_x, items.X - items.W / 2);
                                        max_y = Math.max(max_y, items.Y + items.H / 2);
                                        min_y = Math.min(min_y, items.Y - items.H / 2);
                                        l_item_cnt++;
                                    }
                                }
                                l_shelf_cnt++;
                            }
                        }
                    }
                    l_mod_cnt++;
                }
                var new_width = parseFloat(max_x) - parseFloat(min_x);
                var new_height = parseFloat(max_y) - parseFloat(min_y);
                var new_x = parseFloat(min_x) + new_width / 2;
                var new_y = parseFloat(min_y) + new_height / 2;
            }
        }
        logDebug("function : get_min_max_xy", "E");
        return new_width + "###" + new_height + "###" + new_x + "###" + new_y + "###" + min_x + "###" + min_y;
    } catch (err) {
        error_handling(err);
    }
}

function add_chest_dots_array(p_width, p_height, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_shelf_cnt, p_module_index, p_pog_index) {
    var dot_center = 0;
    var l_horz_start = 0 - p_width / 2 + dot_center;
    var l_vert_start = 0 + p_height / 2 - dot_center;
    var l_horz_end = 0 + p_width / 2 - dot_center;
    var l_vert_end = 0 - p_height / 2 + dot_center;

    var horiz_values = [],
        vert_values = [];
    var curr_vert_value = l_vert_start;
    var curr_horiz_value = l_horz_start;

    vert_values.push(curr_vert_value);
    for (var i = 0; i < 1000; i++) {
        curr_vert_value -= p_vert_spacing;
        if (curr_vert_value > l_vert_end) vert_values.push(curr_vert_value);
        else break;
    }

    horiz_values.push(curr_horiz_value);
    for (var i = 0; i < 1000; i++) {
        curr_horiz_value += parseFloat(p_horz_spacing);
        if (curr_horiz_value < l_horz_end) horiz_values.push(curr_horiz_value);
        else break;
    }

    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_cnt].peg_vert_values = vert_values;
    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_cnt].peg_horiz_values = horiz_values;
}

function add_dots_to_object(p_width, p_height, p_z, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_object, p_object_type, p_shelf_cnt, p_edit_module_index, p_pegHolesActive, p_ViewInd3D = "N", p_pog_index) {
    try {
        logDebug("function : add_dots_to_object", "S");
        var dot_center = 0.01;
        var l_horz_start = 0 - p_width / 2 + p_horz_start + dot_center;
        var l_vert_start = 0 + p_height / 2 - p_vert_start - dot_center;
        var l_horz_end = 0 + p_width / 2 - dot_center;
        var l_vert_end = 0 - p_height / 2 + dot_center;

        var horiz_values = [],
            vert_values = [];
        var curr_vert_value = l_vert_start;
        var curr_horiz_value = l_horz_start;

        vert_values.push(curr_vert_value);
        for (var i = 0; i < 1000; i++) {
            curr_vert_value -= p_vert_spacing;
            if (curr_vert_value > l_vert_end) vert_values.push(curr_vert_value);
            else break;
        }

        horiz_values.push(curr_horiz_value);
        for (var i = 0; i < 1000; i++) {
            curr_horiz_value += parseFloat(p_horz_spacing);
            if (curr_horiz_value < l_horz_end) horiz_values.push(curr_horiz_value);
            else break;
        }
        var points = [];

        for (i = 0; i < vert_values.length; i++) {
            for (j = 0; j < horiz_values.length; j++) {
                points.push(new THREE.Vector3(horiz_values[j], vert_values[i], -0.0001));
            }
        }
        let dotGeometry = new THREE.BufferGeometry().setFromPoints(points);

        var dotMaterial = new THREE.PointsMaterial({
            size: 0.03,
            color: 0x000000,
        });

        var dot = new THREE.Points(dotGeometry, dotMaterial);
        if (p_ViewInd3D == "N") {
            if (p_pegHolesActive == "N") {
                dot.position.z = 0.0006;
            } else {
                dot.position.z = p_z;
            }
        } else {
            dot.position.z = p_z / 2;
        }

        p_object.add(dot);
        if (p_ViewInd3D == "N") {
            dot.uuid = "pegdots";
            if (p_object_type == "PEGBOARD") {
                g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].ShelfInfo[p_shelf_cnt].peg_vert_values = vert_values;
                g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].ShelfInfo[p_shelf_cnt].peg_horiz_values = horiz_values;
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].peg_vert_values = vert_values;
                g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].peg_horiz_values = horiz_values;
            }
        }
        logDebug("function : add_dots_to_object", "E");
        return p_object;
    } catch (err) {
        logDebug("function : add_dots_to_object", "E");
        error_handling(err);
    }
}

function add_dots_to_object_3d(p_width, p_height, p_z, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_object, p_object_type, p_shelf_cnt, p_edit_module_index) {
    return add_dots_to_object(p_width, p_height, p_z, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_object, p_object_type, p_shelf_cnt, p_edit_module_index, null, null, "Y", g_pog_index);
}

function add_rod(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_edit_ind, p_mod_index, p_shelf_ind, p_pog_index) {
    logDebug("function : add_rod; uuid : " + p_uuid + "; type : " + p_type + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_edit_ind : " + p_edit_ind + "; mod_index : " + p_mod_index + "; shelf_ind : " + p_shelf_ind, "S");
    try {
        p_depth = 0.001;
        var shelf_cnt;
        var lines_vertices_x = [];
        var lines_vertices_y = [];
        if (typeof g_module_width == "undefined" || g_module_width == "") g_module_width = parseFloat(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].W);

        if (p_edit_ind == "Y") {
            var selectedObject = g_world.getObjectById(g_dblclick_objid);
            g_world.remove(selectedObject);
            shelf_cnt = g_shelf_index;
        } else {
            if (p_shelf_ind !== -1) {
                shelf_cnt = p_shelf_ind;
            } else {
                shelf_cnt = parseFloat(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;
            }
        }
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_cnt];

        var shelf_obj_type = shelfdtl.SObjID;
        var l_shelf = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, p_depth),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );
        //var geometry = new THREE.Geometry();

        lines_vertices_x.push(0 - p_width / 2);
        lines_vertices_x.push(p_width / 2);
        lines_vertices_x.push(0 - p_width / 2);
        lines_vertices_x.push(p_width / 2);

        lines_vertices_y.push(0 - p_height / 2);
        lines_vertices_y.push(p_height / 2);
        lines_vertices_y.push(p_height / 2);
        lines_vertices_y.push(0 - p_height / 2);

        var points = [];

        points.push(new THREE.Vector3(lines_vertices_x[0], lines_vertices_y[0], 0));
        points.push(new THREE.Vector3(lines_vertices_x[1], lines_vertices_y[1], 0));
        points.push(new THREE.Vector3(lines_vertices_x[2], lines_vertices_y[2], 0));
        points.push(new THREE.Vector3(lines_vertices_x[3], lines_vertices_y[3], 0));

        let geometry = new THREE.BufferGeometry().setFromPoints(points);

        var material = new THREE.LineBasicMaterial({
            color: 0xda1b1b,
        });

        var line1 = new THREE.LineSegments(geometry, material);
        var line2 = new THREE.LineSegments(geometry, material);

        line1.position.z = 0.001;
        line2.position.z = 0.001;
        l_shelf.add(line1);
        l_shelf.add(line2);

        var l_wireframe_id = add_wireframe(l_shelf, 2);
        l_shelf.WFrameID = l_wireframe_id;
        l_shelf.position.x = p_x;
        l_shelf.position.y = p_y;
        l_shelf.position.z = 0.008;
        l_shelf.uuid = p_uuid;
        var shelf_info = shelfdtl;
        l_shelf.POGCode = g_pog_json[p_pog_index].POGCode; // ASA-1243
        l_shelf.Version = g_pog_json[p_pog_index].Version; // ASA-1243
        //Start ASA-1305
        l_shelf.X = wpdSetFixed(shelf_info.X * 100 - (shelf_info.W * 100) / 2); // (shelf_info.X * 100 - (shelf_info.W * 100) / 2).toFixed(2);
        if (shelf_info.EditNotch == "Y") {
            l_shelf.Y = wpdSetFixed(shelf_info.EditNotchY * 100); //.toFixed(2);
        } else {
            l_shelf.Y = wpdSetFixed(shelf_info.Y * 100 - (shelf_info.H * 100) / 2); //toFixed(roundNumber(shelf_info.Y * 100 - ((shelf_info.H * 100) / 2), 3));
        }
        l_shelf.Z = wpdSetFixed(shelf_info.Z * 100 - (shelf_info.D * 100) / 2); //.toFixed(2);
        //l_shelf.X = Math.round(shelf_info.X * 100); // ASA-1243 //ASA-1305
        //l_shelf.Y = Math.round(shelf_info.Y * 100); // ASA-1243 //ASA-1305
        //l_shelf.Z = Math.round(shelf_info.Z * 100); // ASA-1243 //ASA-1305
        //End ASA-1305
        l_shelf.AvlSpace = shelf_info.AvlSpace; // ASA-1243;
        l_shelf.FixelID = shelf_info.Shelf;
        l_shelf.Desc = shelf_info.Desc; //ASA-1243
        l_shelf.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
        l_shelf.W = shelf_info.W;
        l_shelf.H = shelf_info.H;
        l_shelf.D = shelf_info.D;
        l_shelf.Color = shelf_info.Color;
        l_shelf.Rotation = 0;
        l_shelf.ItemSlope = 0;
        l_shelf.Rotation = "N";
        l_shelf.ImageExists = "N";
        l_shelf.BorderColour = 0x000000;
        g_world.add(l_shelf);

        shelfdtl.LineVerticesX = lines_vertices_x;
        shelfdtl.LineVerticesY = lines_vertices_y;
        shelfdtl.SObjID = parseInt(l_shelf.id);
        shelfdtl.WFrameID = l_wireframe_id;
        if (g_show_fixel_label == "Y") {
            if (shelf_obj_type !== "BASE" && shelf_obj_type !== "NOTCH") {
                var hex_color = shelfdtl.Color;
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

                // if (red * 0.299 + green * 0.587 + blue * 0.114 > 186) {
                // 	text_color = "#000000";
                // } else {
                // 	text_color = "#ffffff";
                // }
                var return_obj = addlabelText(shelfdtl.Shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
                l_shelf.add(return_obj);
                return_obj.position.x = 0 - (shelfdtl.W / 2.4 + 0.01);
                return_obj.position.y = 0;
                return_obj.position.z = 0.005;
                shelfdtl.LObjID = return_obj.id;
            }
        }
        logDebug("function : add_rod", "E");
        return parseInt(l_shelf.id);
    } catch (err) {
        error_handling(err);
    }
}

function add_pegboard(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_edit_ind, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_mod_index, p_shelf_ind, p_rotation, p_slope, p_recreate, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index) {
    //ASA-1350 issue 6 added parameters
    logDebug("function : add_pegboard; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_edit_ind : " + p_edit_ind + "; vert_start : " + p_vert_start + "; vert_spacing : " + p_vert_spacing + "; horz_start : " + p_horz_start + "; horz_spacing : " + p_horz_spacing + "; mod_index : " + p_mod_index + "; shelf_ind : " + p_shelf_ind + "; rotation : " + p_rotation + "; slope : " + p_slope + "; recreate : " + p_recreate, "S");
    try {
        var shelf_cnt = 0;

        if (p_edit_ind == "Y") {
            var selectedObject = g_world.getObjectById(g_dblclick_objid);
            g_world.remove(selectedObject);
            shelf_cnt = g_shelf_index;
        } else {
            if (p_shelf_ind !== -1) {
                shelf_cnt = p_shelf_ind;
            } else {
                shelf_cnt = parseFloat(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;
            }
        }
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_cnt];

        var shelf_obj_type = shelfdtl.SObjID;

        if (p_rotation !== 0 || p_slope !== 0) {
            g_rotation = p_rotation;
            if (p_slope > 0) {
                p_slope = 0 - p_slope;
            } else {
                p_slope = -p_slope;
            }
            g_slope = p_slope;

            var l_pegboard = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, 0.01),
                new THREE.MeshStandardMaterial({
                    color: p_color,
                })
            );

            var dot_pegboard = add_dots_to_object(p_width, p_height, 0.0007, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, l_pegboard, "PEGBOARD", shelf_cnt, p_mod_index, g_peg_holes_active /*ASA-1640*/, "N", p_pog_index);

            var mod_right = 0;
            var i = 0;
            if (p_recreate == "Y" && p_edit_ind == "N") {
                for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (modules.ParentModule == null) {
                        mod_right = Math.max(mod_right, parseFloat(modules.X) + modules.W / 2);
                    }
                    i++;
                }
                p_x = mod_right + p_width / 2;
                p_y = g_pog_json[p_pog_index].CameraY;
            }

            dot_pegboard.position.x = g_pog_json[p_pog_index].CameraX;
            dot_pegboard.position.y = p_y;
            dot_pegboard.position.z = 0.00115;
            dot_pegboard.uuid = p_uuid;

            var shelf_info = shelfdtl;
            dot_pegboard.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            dot_pegboard.Version = g_pog_json[p_pog_index].Version; //ASA-1243
            dot_pegboard.FixelID = shelf_info.Shelf;
            dot_pegboard.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
            dot_pegboard.W = shelf_info.W;
            dot_pegboard.H = shelf_info.H;
            dot_pegboard.D = shelf_info.D;
            //Start ASA-1305
            dot_pegboard.X = wpdSetFixed(shelf_info.X * 100 - (shelf_info.W * 100) / 2); //.toFixed(2);
            if (shelf_info.EditNotch == "Y") {
                dot_pegboard.Y = wpdSetFixed(shelf_info.EditNotchY * 100); //.toFixed(2);
            } else {
                dot_pegboard.Y = wpdSetFixed(shelf_info.Y * 100 - (shelf_info.H * 100) / 2); //toFixed(roundNumber(shelf_info.Y * 100 - ((shelf_info.H * 100) / 2), 3));
            }
            dot_pegboard.Z = wpdSetFixed(shelf_info.Z * 100 - (shelf_info.D * 100) / 2); //.toFixed(2);
            //dot_pegboard.X = Math.round(shelf_info.X * 100); // ASA-1243 //ASA-1305
            //dot_pegboard.Y = Math.round(shelf_info.Y * 100); // ASA-1243 //ASA-1305
            //dot_pegboard.Z = Math.round(shelf_info.Z * 100); // ASA-1243 //ASA-1305
            //End ASA-1305
            dot_pegboard.Color = shelf_info.Color;
            dot_pegboard.Rotation = p_rotation;
            dot_pegboard.ItemSlope = p_slope;
            dot_pegboard.Rotation = p_rotation !== 0 || p_slope !== 0 ? "Y" : "N";
            dot_pegboard.ImageExists = "N";
            dot_pegboard.rotateY((p_rotation * Math.PI) / 180);
            dot_pegboard.rotateX((p_slope * Math.PI) / 180);
            var l_wireframe_id = add_wireframe(dot_pegboard, 2);
            dot_pegboard.WFrameID = l_wireframe_id;
            g_world.add(dot_pegboard);
            dot_pegboard.geometry.computeBoundingBox();
            var bounding_box = dot_pegboard.geometry.boundingBox;
            var box = new THREE.Box3().setFromObject(dot_pegboard);
            var box_dim = box.getSize(new THREE.Vector3());
            shelfdtl.WFrameID = l_wireframe_id;
            shelfdtl.ShelfRotateWidth = parseFloat(box_dim.x);
            shelfdtl.ShelfRotateHeight = parseFloat(box_dim.y);
            shelfdtl.ShelfRotateDepth = parseFloat(box_dim.z);
            if (g_manual_zoom_ind == "N") {
                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
            }
            if (p_recreate == "Y" && p_edit_ind == "N") {
                p_x = mod_right + p_width / 2;
                p_y = g_pog_json[p_pog_index].CameraY;
            }
            dot_pegboard.position.x = p_x; //0 - (depth / 2);
            if (p_slope < 0) {
                dot_pegboard.position.y = p_y + parseFloat(box_dim.y) / 2;
            } else {
                dot_pegboard.position.y = p_y - parseFloat(box_dim.y) / 2;
            }
            dot_pegboard.position.z = 0.00115;
            if (p_rotation !== 0) {
                dot_pegboard.quaternion.copy(g_camera.quaternion);
                dot_pegboard.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
            }
            dot_pegboard.rotateY((p_rotation * Math.PI) / 180);
            dot_pegboard.rotateX((p_slope * Math.PI) / 180);
            dot_pegboard.updateMatrix();
        } else {
            var l_pegboard = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, 0.001),
                new THREE.MeshStandardMaterial({
                    color: p_color,
                })
            );

            var dot_pegboard = add_dots_to_object(p_width, p_height, 0.0007, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, l_pegboard, "PEGBOARD", shelf_cnt, p_mod_index, g_peg_holes_active /*ASA-1640*/, "N", p_pog_index);

            dot_pegboard.position.x = p_x;
            dot_pegboard.position.y = p_y;
            dot_pegboard.position.z = 0.00115;
            dot_pegboard.uuid = p_uuid;

            dot_pegboard.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            dot_pegboard.Version = g_pog_json[p_pog_index].Version; //ASA-1243

            var shelf_info = shelfdtl;
            dot_pegboard.FixelID = shelf_info.Shelf;
            dot_pegboard.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
            dot_pegboard.W = shelf_info.W;
            dot_pegboard.H = shelf_info.H;
            dot_pegboard.D = shelf_info.D;
            //Start ASA-1305
            dot_pegboard.X = wpdSetFixed(shelf_info.X * 100 - (shelf_info.W * 100) / 2); //.toFixed(2);
            if (shelf_info.EditNotch == "Y") {
                dot_pegboard.Y = wpdSetFixed(shelf_info.EditNotchY * 100); //.toFixed(2);
            } else {
                dot_pegboard.Y = wpdSetFixed(shelf_info.Y * 100 - (shelf_info.H * 100) / 2); //toFixed(roundNumber(shelf_info.Y * 100 - ((shelf_info.H * 100) / 2), 3));
            }
            dot_pegboard.Z = wpdSetFixed(shelf_info.Z * 100 - (shelf_info.D * 100) / 2); //.toFixed(2);
            //dot_pegboard.X = Math.round(shelf_info.X * 100); // ASA-1243 //ASA-1305
            //dot_pegboard.Y = Math.round(shelf_info.Y * 100); // ASA-1243 //ASA-1305
            //dot_pegboard.Z = Math.round(shelf_info.Z * 100); // ASA-1243 //ASA-1305
            //End ASA-1305
            dot_pegboard.Color = shelf_info.Color;
            dot_pegboard.Rotation = p_rotation;
            dot_pegboard.ItemSlope = p_slope;
            dot_pegboard.Rotation = p_rotation !== 0 || p_slope !== 0 ? "Y" : "N";
            dot_pegboard.ImageExists = "N";

            var l_wireframe_id = add_wireframe(dot_pegboard, 2);
            dot_pegboard.WFrameID = l_wireframe_id;
            g_world.add(dot_pegboard);
        }
        shelfdtl.SObjID = parseInt(dot_pegboard.id);
        dot_pegboard.BorderColour = 0x000000;

        if (p_recreate == "Y") {
            if (shelfdtl.ItemInfo.length > 0) {
                var items_arr = shelfdtl.ItemInfo;
                var i = 0;
                for (const items of items_arr) {
                    shelfdtl.ItemInfo[i].Exists = "E";
                    i++;
                }
                return_val = recreate_all_items(p_mod_index, shelf_cnt, shelfdtl.ObjType, "Y", -1, -1, shelfdtl.ItemInfo.length, "N", "N", p_pog_index, [], g_start_canvas, "", p_pog_index, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, "Y"); //ASA-1350 issue 6 case 2 added parameters
            }
        }
        if (g_show_fixel_label == "Y") {
            var hex_color = shelfdtl.Color;
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
            var return_obj = addlabelText(shelfdtl.Shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
            dot_pegboard.add(return_obj);
            var x = ((return_obj.material.map.image.width / return_obj.material.map.image.height) * g_labelActualSize) / 2; //ASA-1677 #5 Added to calculate value for X
            return_obj.position.x = 0 - shelfdtl.W / 2 + x + 0.01; //ASA-1677 #5
            //return_obj.position.x = 0 - (shelfdtl.W / 2.4 + 0.01);
            return_obj.position.y = 0;
            if (shelfdtl.Rotation !== 0 || shelfdtl.Slope !== 0) {
                return_obj.position.z = shelfdtl.D / 2 + 0.005;
            } else {
                return_obj.position.z = 0.005;
            }
            shelfdtl.LObjID = return_obj.id;
        }
        shelfdtl.WFrameID = l_wireframe_id;
        g_dblclick_opened = "N";
        logDebug("function : add_pegboard", "E");
        return parseInt(dot_pegboard.id);
    } catch (err) {
        logDebug("function : add_pegboard", "E");
        error_handling(err);
    }
}

function get_y_distance(p_module_index, p_shelf_index, p_item_index, p_itemX, p_itemY, p_pog_index) {
    logDebug("function : get_y_distance; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; itemX : " + p_itemX + "; itemY : " + p_itemY, "S");
    try {
        var new_items_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
        var total_height = 0;
        var j = 0;
        for (const items of new_items_arr) {
            if (wpdSetFixed(p_itemX) == wpdSetFixed(items.X) && wpdSetFixed(items.Y) < wpdSetFixed(p_itemY)) {
                total_height += items.H;
            }
            j++;
        }

        logDebug("function : get_y_distance", "E");
        return total_height;
    } catch (err) {
        error_handling(err);
    }
}

function get_canvas_json(p_loc) {
    try {
        logDebug("function : get_canvas_json; loc : " + p_loc, "S");
        return g_pog_json;
    } catch (err) {
        error_handling(err);
    }
}

function get_canvas_world(p_loc) {
    try {
        logDebug("function : get_canvas_world; loc : " + p_loc, "S");
        return g_world;
    } catch (err) {
        error_handling(err);
    }
}

function get_curr_canvas() {
    try {
        logDebug("function : get_curr_canvas", "S");
        if (g_curr_canvas == 1) {
            logDebug("function : get_curr_canvas", "E");
            return document.getElementById("maincanvas");
        } else {
            logDebug("function : get_curr_canvas", "E");
            return document.getElementById("maincanvas1");
        }
    } catch (err) {
        error_handling(err);
    }
}

function get_curr_renderer() {
    try {
        logDebug("function : get_curr_renderer", "S");
        return g_renderer;
    } catch (err) {
        error_handling(err);
    }
}

function get_canvas_camera(p_loc) {
    try {
        logDebug("function : get_canvas_camera; loc : " + p_loc, "S");
        return g_camera;
    } catch (err) {
        error_handling(err);
    }
}

async function get_all_images(p_pog_index, p_orientation_flag, p_ImageLoadInd = "N", p_MaxWidth, p_MaxHgt, p_CompRatio) {
    try {
        logDebug("function : get_all_images; ", "S");
        var pogIndex;
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            if (p_ImageLoadInd == "Y") {
                pogIndex = 0;
            } else {
                pogIndex = p_pog_index;
            }
            var items_arr = [];
            for (pogs of g_pog_json) {
                var mod_arr = g_pog_json[pogIndex].ModuleInfo;
                var i = 0;
                if (mod_arr !== null) {
                    for (const modules of mod_arr) {
                        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                            if (typeof modules.ShelfInfo !== "undefined" && modules.ShelfInfo !== null) {
                                if (modules.ShelfInfo.length > 0) {
                                    j = 0;
                                    for (const shelfs of modules.ShelfInfo) {
                                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                                            if (typeof shelfs.ItemInfo !== "undefined" && shelfs.ItemInfo !== null) {
                                                if (shelfs.ItemInfo.length > 0) {
                                                    var k = 0;
                                                    for (const items of shelfs.ItemInfo) {
                                                        var details = g_orientation_json[items.Orientation];
                                                        var details_arr = details.split("###");
                                                        var detaillist = get_orientation_list(details_arr[0]);
                                                        var l = 0;
                                                        var img_exists = "N";
                                                        for (const images_arr of g_ItemImages) {
                                                            if (items.Item == images_arr.Item && details_arr[0] == images_arr.Orientation && items.MerchStyle == images_arr.MerchStyle) {
                                                                img_exists = "Y";
                                                                break; //return false;
                                                            }
                                                            l++;
                                                        }
                                                        if (items.CapStyle == "1" || items.CapStyle == "2" || items.CapStyle == "3") {
                                                            var cap_exists = "N";
                                                            var cap_merch = typeof items.CapMerch !== "undefined" && items.CapMerch !== "" ? items.CapMerch : "0";
                                                            var cap_orient = typeof items.CapOrientaion !== "undefined" && items.CapOrientaion !== "" ? items.CapOrientaion : "0";
                                                            var cap_details = g_orientation_json[cap_orient];
                                                            var cap_arr = cap_details.split("###");
                                                            for (const images_arr of g_ItemImages) {
                                                                if (items.Item == images_arr.Item && cap_arr[0] == images_arr.Orientation && cap_merch == images_arr.MerchStyle) {
                                                                    cap_exists = "Y";
                                                                    break; //return false;
                                                                }

                                                                l++;
                                                            }
                                                            if (cap_exists == "N") {
                                                                var new_merch_style;
                                                                if (cap_merch == "0") {
                                                                    new_merch_style = "U";
                                                                } else if (cap_merch == "1") {
                                                                    new_merch_style = "T";
                                                                } else if (cap_merch == "2") {
                                                                    new_merch_style = "C";
                                                                } else if (cap_merch == "3") {
                                                                    new_merch_style = "D";
                                                                }
                                                                ItemImageInfo = {};
                                                                ItemImageInfo["Item"] = items.Item;
                                                                ItemImageInfo["Orientation"] = cap_arr[0];
                                                                ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                items_arr.push(ItemImageInfo);
                                                            }
                                                        }
                                                        if (img_exists == "N") {
                                                            var new_merch_style;
                                                            if (items.MerchStyle == "0") {
                                                                new_merch_style = "U";
                                                            } else if (items.MerchStyle == "1") {
                                                                new_merch_style = "T";
                                                            } else if (items.MerchStyle == "2") {
                                                                new_merch_style = "C";
                                                            } else if (items.MerchStyle == "3") {
                                                                new_merch_style = "D";
                                                            }
                                                            ItemImageInfo = {};
                                                            ItemImageInfo["Item"] = items.Item;
                                                            ItemImageInfo["Orientation"] = details_arr[0];
                                                            ItemImageInfo["MerchStyle"] = new_merch_style;
                                                            items_arr.push(ItemImageInfo);
                                                            if (p_orientation_flag == "Y") {
                                                                if (details_arr[0] == 1) {
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[0];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[1];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[2];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                } else if (details_arr[0] == 2) {
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[0];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[1];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[2];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                } else if (details_arr[0] == 3) {
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[0];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[1];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[2];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                } else if (details_arr[0] == 8) {
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[0];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[1];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                    ItemImageInfo = {};
                                                                    ItemImageInfo["Item"] = items.Item;
                                                                    ItemImageInfo["Orientation"] = detaillist[2];
                                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                                    items_arr.push(ItemImageInfo);
                                                                }
                                                            }
                                                        }
                                                        k++;
                                                    }
                                                }
                                            }
                                        }
                                        j = j + 1;
                                    }
                                }
                            }
                            if (modules.Carpark !== null && typeof modules.Carpark !== "undefined") {
                                if (typeof modules.Carpark[0] !== "undefined") {
                                    if (modules.Carpark[0].ItemInfo !== null) {
                                        if (modules.Carpark[0].ItemInfo.length > 0) {
                                            var k = 0;
                                            for (const items of modules.Carpark[0].ItemInfo) {
                                                var details = g_orientation_json[items.Orientation];
                                                var details_arr = details.split("###");
                                                var l = 0;
                                                var img_exists = "N";
                                                for (const images_arr of g_ItemImages) {
                                                    if (items.Item == images_arr.Item && details_arr[0] == images_arr.Orientation && items.MerchStyle == images_arr.MerchStyle) {
                                                        img_exists = "Y";
                                                        break; //return false;
                                                    }
                                                    l++;
                                                }
                                                if (img_exists == "N") {
                                                    var new_merch_style;
                                                    if (items.MerchStyle == "0") {
                                                        new_merch_style = "U";
                                                    } else if (items.MerchStyle == "1") {
                                                        new_merch_style = "T";
                                                    } else if (items.MerchStyle == "2") {
                                                        new_merch_style = "C";
                                                    } else if (items.MerchStyle == "3") {
                                                        new_merch_style = "D";
                                                    }
                                                    ItemImageInfo = {};
                                                    ItemImageInfo["Item"] = items.Item;
                                                    ItemImageInfo["Orientation"] = details_arr[0];
                                                    ItemImageInfo["MerchStyle"] = new_merch_style;
                                                    items_arr.push(ItemImageInfo);
                                                }
                                                k++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        i = i + 1;
                    }
                }
                if (p_ImageLoadInd == "Y") {
                    pogIndex++;
                } else {
                    break;
                }
            }
            var retval = await get_all_image_ajax(items_arr);
            var i = 0;
            for (var details of g_ItemImages) {
                var image = new Image();
                var returnval = "";
                image.src = "data:image/jpeg;base64," + details.ItemImage;
                image.onload = function () {
                    async function imageLoad(image) {
                        var comp_details = await resizeImage(image, parseFloat(p_MaxWidth), parseFloat(p_MaxHgt), parseFloat(p_CompRatio));
                        var compress_image = comp_details.split(",");

                        return compress_image[1]; //$.trim(data);
                    }
                    const printAddress = async () => {
                        returnval = await imageLoad(image);
                        if (i <= g_ItemImages.length - 1) {
                            g_ItemImages[i].ItemImage = returnval;
                        }
                    };

                    printAddress();
                };
                i++;
            }
        }
        logDebug("function : get_all_images; ", "E");
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}

function get_all_image_ajax(p_items_arr) {
    return new Promise(function (resolve, reject) {
        try {
            var startDate = new Date();
            logDebug("function : get_all_image_ajax; ", "S");
            var p = apex.server.process(
                "GET_IMAGE_CLOB",
                {
                    p_clob_01: JSON.stringify(p_items_arr),
                },
                {
                    dataType: "html",
                }
            );
            // When the process is done, call functions
            p.done(function (data) {
                if ($.trim(data) !== "") {
                    g_ItemImages = g_ItemImages.concat(JSON.parse($.trim(data)));
                    logDebug("function : get_all_image_ajax; ", "E");
                    resolve("SUCESS");
                } else {
                    console.log("Image Not Found");
                    logDebug("function : get_all_image_ajax; ", "E");
                    resolve("SUCESS");
                }
                var endDate = new Date();
                var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
                console.log("Seconds Difference", seconds);
            });
            logDebug("function : get_all_image_ajax ; ", "E");
        } catch (err) {
            error_handling(err);
        }
    });
}

function setParams(p_LabelFont, p_StatusErrorColor, p_CameraZ, p_TextboxMergePdf, p_AutoHangbarFacing, p_AutoApplyDFacing, p_AutoApplyVFacing, p_ShowLiveImage, p_DimErrorColor, p_PogcrAutoHliteNonMvItem, p_ShowDescNoImage, p_NotchLblPos, p_fixel_label, p_vert_text_dis, p_dft_max_merch) {
    //ASA1310_20240307 crush item onload
    if (p_LabelFont) {
        g_labelFont = parseInt(p_LabelFont);
        g_labelActualSize = 0.0034375 * p_LabelFont;
    }
    if (p_StatusErrorColor) {
        g_status_error_color = parseInt(p_StatusErrorColor.replace("#", "0x"), 16);
    }
    if (p_CameraZ) {
        g_offset_z = parseFloat(p_CameraZ);
    }
    if (p_TextboxMergePdf) {
        g_textbox_merge_pdf = p_TextboxMergePdf;
    }
    if (p_AutoHangbarFacing) {
        g_auto_hangbar_facings = p_AutoHangbarFacing;
    }
    if (p_AutoApplyDFacing) {
        g_auto_apply_d_facings = p_AutoApplyDFacing;
    }
    if (p_AutoApplyVFacing) {
        g_auto_apply_v_facings = p_AutoApplyVFacing;
    }
    if (p_ShowLiveImage) {
        g_show_live_image = p_ShowLiveImage;
    }
    if (p_DimErrorColor) {
        g_dim_error_color = parseInt(p_DimErrorColor.replace("#", "0x"), 16);
    }
    if (p_PogcrAutoHliteNonMvItem) {
        g_pogcr_auto_hlite_non_mv_item = p_PogcrAutoHliteNonMvItem;
    }
    if (p_ShowDescNoImage) {
        g_show_desc_no_image = p_ShowDescNoImage;
    }
    if (p_NotchLblPos) {
        g_notch_label_position = p_NotchLblPos;
    }
    if (p_fixel_label) {
        g_fixel_label = p_fixel_label;
    }
    if (p_dft_max_merch) {
        //ASA1310_20240307 crush item onload
        g_dft_max_merch = p_dft_max_merch;
    }
}

async function updateDaysOfSupply(p_item, p_iIndex, p_sIndex, p_mIndex, p_carpark_ind, p_updatePogItemColl = "N", p_pog_index, p_pUpdateItemInfo = "N") {
    try {
        var daysOfSupply = 0;
        var i = 0;
        var RegMovement = nvl(p_item.RegMovement) == 0 ? 1 : nvl(p_item.RegMovement);
        var item_list = get_similar_items(p_item.ItemID, "I", p_pog_index, "Y");
        var itemInfo = [],
            itemInfoDets = [];
        for (items of item_list) {
            daysOfSupply = daysOfSupply + items.VertFacing * items.HorizFacing * items.DFacing;
        }
        var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(p_item.ObjID);
        if (nvl(selectedObject) !== 0 && nvl(p_item.RegMovement) !== 0 && p_item.RegMovement !== "0") {
            selectedObject.DaysOfSupply = parseFloat(daysOfSupply / RegMovement).toFixed(2);
            if (p_carpark_ind == "N") {
                g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ItemInfo[p_iIndex].DaysOfSupply = parseFloat(selectedObject.DaysOfSupply).toFixed(2);
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_mIndex].Carpark[0].ItemInfo[p_iIndex].DaysOfSupply = parseFloat(selectedObject.DaysOfSupply).toFixed(2);
            }
        } else if (nvl(selectedObject) !== 0) {
            selectedObject.DaysOfSupply = "";
            if (p_carpark_ind == "N") {
                selectedObject.DaysOfSupply = "0.00";
                g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ItemInfo[p_iIndex].DaysOfSupply = "0.00";
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_mIndex].Carpark[0].ItemInfo[p_iIndex].DaysOfSupply = "";
            }
        }
        if (p_carpark_ind == "N") {
            var iteminfo = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ItemInfo[p_iIndex];
            if (p_updatePogItemColl == "Y") {
                itemInfo.push(g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ItemInfo[p_iIndex].ItemID);
                itemInfoDets.push(g_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].ItemInfo[p_iIndex].DaysOfSupply);
                await updatePOGItemInfoColl(itemInfo, itemInfoDets, p_pog_index);
            }
        } else {
            var iteminfo = g_pog_json[p_pog_index].ModuleInfo[p_mIndex].Carpark[0].ItemInfo[p_iIndex];
        }
        return iteminfo;
    } catch (err) {
        error_handling(err);
    }
}

async function auto_position_all(p_camera, p_pog_index, p_orgPogIndex, p_AutoPostionText, p_considerSubshelf) {
    logDebug("function : auto_position_all", "");
    try {
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            //identify if any change in POG
            g_pog_edited_ind = "Y";

            var old_pogIndex = p_pog_index;
            var old_world = g_world;
            var old_camera = p_camera;

            if (g_all_pog_flag == "Y") {
                var z = 0;
            } else {
                var z = p_pog_index;
            }

            for (const pogJson of g_pog_json) {
                if ((z !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                    if (typeof p_orgPogIndex == "undefined" && g_all_pog_flag == "N") {
                        p_orgPogIndex = p_pog_index;
                    } else if (g_all_pog_flag == "Y") {
                        p_orgPogIndex = z;
                    }
                    g_world = g_scene_objects[z].scene.children[2];
                    p_camera = g_scene_objects[z].scene.children[0];

                    module_details = g_pog_json[z].ModuleInfo;
                    i = 0;
                    var mod_detail_arr = [];
                    var mod_index_arr = [];
                    for (const modules of module_details) {
                        if ((typeof modules.ParentModule == "undefined" || modules.ParentModule == null) && modules.H > 0.1) {
                            var mod_details = {};
                            mod_details["ModStart"] = wpdSetFixed(modules.X - modules.W / 2);
                            mod_details["ModEnd"] = wpdSetFixed(modules.X + modules.W / 2);
                            mod_details["ModBottom"] = wpdSetFixed(modules.Y - modules.H / 2);
                            mod_details["ModTop"] = wpdSetFixed(modules.Y + modules.H / 2);
                            mod_details["ModX"] = modules.X;
                            mod_details["ModIndex"] = i;
                            mod_details["Module"] = modules.Module;
                            mod_details["ModWidth"] = modules.W;
                            mod_details["MObjID"] = modules.MObjID; //ASA-1628 Issue 10
                            mod_index_arr.push(mod_details);
                        }
                        i = i + 1;
                    }

                    //Undo details of auto position
                    g_cut_copy_arr = [];
                    for (const modules of mod_index_arr) {
                        var l_shelf_details = g_pog_json[z].ModuleInfo[modules.ModIndex].ShelfInfo;
                        var i = 0;
                        for (shelfs of l_shelf_details) {
                            if (shelfs.ObjType !== "TEXTBOX" && shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "ROD") {
                                var undoObjectsInfo = [];
                                undoObjectsInfo.moduleIndex = modules.ModIndex;
                                undoObjectsInfo.shelfIndex = i;
                                undoObjectsInfo.actionType = "SHELF_DRAG";
                                undoObjectsInfo.objectID = shelfs.SObjID;
                                undoObjectsInfo.push(JSON.parse(JSON.stringify(shelfs)));
                                undoObjectsInfo.moduleObjectID = modules.MObjID;
                                undoObjectsInfo.startCanvas = g_present_canvas;
                                undoObjectsInfo.g_present_canvas = g_present_canvas;
                                g_allUndoObjectsInfo.push(undoObjectsInfo);
                            }
                        }
                        i++;
                    }
                    g_delete_details.multi_delete_shelf_ind = "N";
                    logFinalUndoObjectsInfo("SHELF_DRAG", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y");
                    g_allUndoObjectsInfo = [];

                    i = 0;
                    for (const modules of mod_index_arr) {
                        var l_shelf_details = g_pog_json[z].ModuleInfo[modules.ModIndex].ShelfInfo;
                        var j = 0;
                        for (const shelfs of l_shelf_details) {
                            if (shelfs.ItemInfo.length > 0) {
                                update_item_distance(modules.ModIndex, j, z, "N"); //Bug-26122 - splitting the chest
                            }
                            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "ROD" && (p_AutoPostionText == "N" || p_AutoPostionText == "Y")) {
                                var shelf_start = wpdSetFixed(shelfs.X - shelfs.W / 2);
                                var shelf_end = wpdSetFixed(shelfs.X + shelfs.W / 2);
                                var valid = "N";
                                if (((shelfs.X > modules.ModStart && shelfs.X <= modules.ModEnd) || (shelf_start >= modules.ModStart && shelf_start < modules.ModEnd) || (shelf_end > modules.ModStart && shelf_end < modules.ModEnd)) && shelfs.Y > modules.ModBottom && shelfs.Y < modules.ModTop) {
                                    valid = "Y";
                                } else if (shelfs.X > modules.ModStart && shelfs.X < modules.ModEnd && (shelfs.Y > modules.ModTop || shelfs.Y < modules.ModBottom)) {
                                    valid = "Y";
                                } else {
                                    g_pog_json[z].ModuleInfo[modules.ModIndex].ShelfInfo[j].ShelfChangeReq = "Y";
                                }
                                if (valid == "Y") {
                                    await set_item_xy(shelfs, modules.ModIndex, j, p_pog_index); //ASA-1659
                                    var [validity, new_shelfX, new_shelfY] = update_position_loc(shelfs, modules, j, modules.ModIndex, modules.ModIndex, p_camera, z, g_scene_objects[p_orgPogIndex].scene.children[2], p_considerSubshelf);
                                    g_pog_json[z].ModuleInfo[modules.ModIndex].ShelfInfo[j].ShelfChangeReq = "N";
                                }
                                //ASA-1628 Issue 3
                                if (shelfs.ObjType !== "TEXTBOX") {
                                    var [mod_ind, shelf_ind] = await set_shelf_after_drag(validity, "Y", modules.ModIndex, modules.ModIndex, j, g_pog_json[z].ModuleInfo[modules.ModIndex].ShelfInfo[j].X, g_pog_json[z].ModuleInfo[modules.ModIndex].ShelfInfo[j].Y, "N", "N", "", "", z, z, -1, "Y"); //ASA-1628 Issue 18, sending -1 as combine ind and Y for auto_position call. As we do not need to change or recalculate combination
                                }
                            }

                            j = j + 1;
                        }

                        i = i + 1;
                    }

                    i = 0;
                    for (const modules of mod_index_arr) {
                        var l = 0;
                        for (const modules_next of module_details) {
                            if ((typeof modules_next.ParentModule == "undefined" || modules_next.ParentModule == null) && modules_next.H > 0.1) {
                                var l_shelf_details = modules_next.ShelfInfo;
                                var j = 0;
                                for (const shelfs of l_shelf_details) {
                                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "ROD" && shelfs.ShelfChangeReq == "Y" && shelfs.ObjType !== "TEXTBOX") {
                                        var shelf_start = wpdSetFixed(shelfs.X - shelfs.W / 2);
                                        var shelf_end = wpdSetFixed(shelfs.X + shelfs.W / 2);
                                        var valid = "N";
                                        var m_ind = "",
                                            c_ind = "",
                                            s_ind = "";
                                        var mod_width = 0,
                                            mod_x = 0;

                                        if ((i !== l && shelf_start > modules.ModStart && shelf_start < modules.ModEnd) || (shelf_end > modules.ModStart && shelf_end < modules.ModEnd)) {
                                            valid = "Y";
                                            m_ind = l;
                                            c_ind = modules.ModIndex;
                                            s_ind = j;
                                            mod_width = modules.ModWidth;
                                            mod_x = modules.ModX;

                                            var [validity, new_shelfX, new_shelfY] = update_position_loc(shelfs, modules, j, modules.ModIndex, l, p_camera, z, g_scene_objects[p_orgPogIndex].scene.children[2], p_considerSubshelf);
                                            if (validity == "Y" || validity == "R") {
                                                mod_detail = {};
                                                mod_detail["MIndex"] = m_ind;
                                                mod_detail["CurrIndex"] = c_ind;
                                                mod_detail["SIndex"] = s_ind;
                                                mod_detail["X"] = new_shelfX;
                                                mod_detail["Y"] = new_shelfY; //ASA-1628 shelfs.Y;
                                                mod_detail["Shelf"] = shelfs.Shelf;
                                                mod_detail["ObjType"] = shelfs.ObjType;

                                                mod_detail_arr.push(mod_detail);
                                            }
                                        }
                                    }
                                    j = j + 1;
                                }
                            }
                            l = l + 1;
                        }
                        i = i + 1;
                    }
                    if (typeof mod_detail_arr == "undefined" && mod_detail_arr != null) {
                        i = 0;
                        for (const shelfs of mod_detail_arr) {
                            j = 0;
                            var new_m_ind = -1,
                                new_s_ind = -1;
                            var module_details = g_pog_json[z].ModuleInfo;
                            for (const modules_next of module_details) {
                                if ((typeof modules_next.ParentModule == "undefined" || modules_next.ParentModule == null) && modules_next.H > 0.1) {
                                    var l_shelf_details = modules_next.ShelfInfo;
                                    var k = 0;
                                    for (const shelf_d of l_shelf_details) {
                                        if (shelf_d.ObjType !== "BASE" && shelf_d.ObjType !== "NOTCH" && shelf_d.ObjType !== "DIVIDER" && shelf_d.ObjType !== "ROD") {
                                            if (shelf_d.Shelf == shelfs.Shelf) {
                                                new_m_ind = j;
                                                new_s_ind = k;
                                                break;
                                            }
                                        }
                                        k = k + 1;
                                    }
                                }
                                j = j + 1;
                            }
                            if (shelfs.ObjType !== "TEXTBOX") {
                                var [mod_ind, shelf_ind] = await set_shelf_after_drag("Y", "Y", new_m_ind, shelfs.CurrIndex, new_s_ind, shelfs.X, shelfs.Y, "Y", "N", "", "", z, z, -1, "Y"); //ASA-1628 issue 18
                            }
                            i = i + 1;
                        }
                    }
                    var details = get_min_max_xy(z);
                    var details_arr = details.split("###");
                    set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, z);
                    render(z);
                }
                if (g_all_pog_flag == "Y") {
                    z++;
                } else {
                    break;
                }
            }
            g_world = old_world;
            p_camera = old_camera;
            //   recreate the orientation view if any present
            async function recreate_view() {
                var returnval = await recreate_compare_views(g_compare_view, "N");
            }
            recreate_view();
        }
        logDebug("function : auto_position_all", "E");
    } catch (err) {
        error_handling(err);
    }
}

function get_closest_peg(p_item_height, p_module_index, p_shelf_index, p_final_y, p_pog_index) {
    logDebug("function : get_closest_peg; item_height : " + p_item_height + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; p_final_y : " + p_final_y);
    var peg_verti_arr = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].peg_vert_values;
    var shelfyaxis = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y;
    var peg_details = [];
    $.each(peg_verti_arr, function (i, details) {
        peg_details.push(shelfyaxis + peg_verti_arr[i]);
    });
    var item_start = p_final_y + p_item_height / 2;
    if (peg_details.length > 0) {
        var closest = peg_details.reduce((a, b) => {
            return Math.abs(b - item_start) < Math.abs(a - item_start) ? b : a;
        });
    }
    logDebug("function : get_closest_peg", "E");
    return closest;
}

//ASA-1300
function get_top_y(p_item_top, p_items_list, p_top_threshold, p_item_index, p_height, p_item) {
    var l_minrange = p_item_top - p_top_threshold;
    var l_maxrange = p_item_top + p_top_threshold;
    var l_final_y = -1;
    var l_cnt = 0;
    var l_final_top = -1;
    var top_idx = -1;
    for (var item_info of p_items_list) {
        //ASA-1089
        if (l_cnt < p_item_index) {
            var new_top = item_info.Y + item_info.H / 2;
            if (new_top <= l_maxrange && new_top >= l_minrange && p_item.X + p_item.W / 2 > item_info.X + item_info.W / 2) {
                l_final_top = new_top;
                top_idx = l_cnt;
            }
        }
        l_cnt++;
    }
    if (l_final_top > -1) {
        l_final_top = l_final_top - p_height / 2;
    } else {
        l_final_top = p_item_top - p_height / 2;
    }
    return [l_final_top, top_idx];
} //ASA-1300

function find_pegboard_gap(p_width, p_height, p_locationX, p_locationY, p_horiz_gap, p_module_index, p_shelf_index, p_item_index, p_edited_item_index, p_validate, p_pog_index, p_calcY = "Y", p_dfl_x, p_dfl_y, p_itemInsidePeg) {
    logDebug("function : find_pegboard_gap; width : " + p_width + "; height : " + p_height + "; locationX : " + p_locationX + "; locationY : " + p_locationY + "; horiz_gap : " + p_horiz_gap + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; i_edited_item_index : " + p_edited_item_index + "; validate : " + p_validate, "S");
    try {
        var finalX = -1;
        var itemdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
        var shelfDtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var item_code = itemdtl[p_item_index].Item;
        var item_length = itemdtl.length;
        var item_exists = itemdtl[p_item_index].Exists;
        var currX = itemdtl[p_item_index].X;
        var from_productlist = itemdtl[p_item_index].FromProductList;
        var same_shelf = itemdtl[p_item_index].SameShelf;
        var edited_item = itemdtl[p_item_index].Edited;
        var allow_overlap = shelfDtl.AllowOverLap;
        var drop_y = itemdtl[p_item_index].DropY;
        var item_horiz_space = shelfDtl.HorizSpacing;
        var item_vert_space = shelfDtl.VertiSpacing;
        var shelf_horz_start = shelfDtl.HorizStart;
        var ItemAutoPlacing = shelfDtl.AutoPlacing;
        var shelf_top = shelfDtl.Y + shelfDtl.H / 2 + shelfDtl.UOverHang;
        var shelf_bottom = shelfDtl.Y - shelfDtl.H / 2 - shelfDtl.LoOverHang;
        var shelf_start = shelfDtl.X - shelfDtl.W / 2 - shelfDtl.LOverhang;
        var shelf_end = shelfDtl.X + shelfDtl.W / 2 + shelfDtl.ROverhang;
        var peg_verti_arr = shelfDtl.peg_vert_values;
        var peg_horiz_arr = shelfDtl.peg_horiz_values;
        var shelfyaxis = shelfDtl.Y;
        var item_drag_top = drop_y !== -1 ? drop_y + p_height / 2 + 0.003 : "";
        var peg_vert_details = [];
        var peg_horiz_details = [];
        var items_list = itemdtl;
        var overlap_valid = "Y";
        var j = 0;
        var k = 0;
        var yFound = "N";
        if (typeof ItemAutoPlacing == "undefined") {
            ItemAutoPlacing = "N";
        }
        if (peg_verti_arr.length > 0) {
            $.each(peg_verti_arr, function (j, details) {
                peg_vert_details.push(shelfyaxis + peg_verti_arr[j]);
            });
        }
        if (peg_horiz_arr.length > 0) {
            $.each(peg_horiz_arr, function (k, details) {
                peg_horiz_details.push(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X + peg_horiz_arr[k]);
            });
        }

        var item_start = p_locationY + itemdtl[p_item_index].H / 2;
        if (peg_vert_details.length > 0) {
            var closest = peg_vert_details.reduce((a, b) => {
                return Math.abs(b - item_start) < Math.abs(a - item_start) ? b : a;
            });
        }

        var obj_hit = "N";
        if (item_exists == "E") {
            finalX = itemdtl[p_item_index].X;
        } else if (ItemAutoPlacing == "Y" && g_chest_as_pegboard == "Y" && shelfDtl.ObjType == "CHEST") {
            var [finalX, finalY] = get_auto_placing_item_loc(p_module_index, p_shelf_index, p_pog_index, p_item_index, p_width, p_height, p_dfl_x, p_dfl_y);
            if (finalX !== -1) {
                itemdtl[p_item_index].X = finalX;
                itemdtl[p_item_index].Y = finalY;
                valid = "Y";
            }
        } else if ((typeof from_productlist !== "undefined" && from_productlist == "Y") || (g_pegbrd_auto_placing == "Y" && edited_item == "Y")) {
            //ASA-1085
            if (p_item_index == 0) {
                finalX = shelf_start + p_width / 2 + item_horiz_space; //ASA-1769, removed - shelfDtl.LOverhang

                if (g_pegbrd_auto_placing == "Y" && edited_item == "Y") {
                    finalX = p_locationX;
                    //ASA-1769
                    if (p_itemInsidePeg == "N") {
                        finalY = p_locationY;
                    } else {
                        finalY = closest - p_height / 2;
                    }
                } else {
                    /* ASA-1178
                    if (shelfDtl.ObjType !== "CHEST") {
                    finalX = finalX - 0.01;
                    }*/
                    finalX = finalX;
                    finalY = peg_vert_details[0] - p_height / 2;
                }
                itemdtl[p_item_index].Y = finalY;
                itemdtl[p_item_index].SecondTier = "N";
                itemdtl[p_item_index].X = finalX;
            } else if (item_length > 1 && p_item_index > 0) {
                var t = 0;
                var h = 0;
                for (l = h; l < peg_vert_details.length; l++) {
                    if (finalX > -1) {
                        break;
                    }
                    if (peg_vert_details[l] - p_height > shelf_bottom) {
                        console.log("peg_vert_details[l]", peg_vert_details[l], item_drag_top, edited_item);
                        if ((item_drag_top !== "" && peg_vert_details[l] <= item_drag_top && edited_item == "Y") || edited_item == "N" || item_drag_top == "") {
                            for (j = t; j < peg_horiz_details.length; j++) {
                                if (peg_horiz_details[j] + p_width < shelf_end) {
                                    if (g_pegbrd_auto_placing == "Y" && edited_item == "Y") {
                                        //ASA-1178
                                        if (shelfDtl.ObjType !== "CHEST") {
                                            item_start = wpdSetFixed(p_locationX - p_width / 2 + 0.01); //.toFixed(4));
                                            item_end = wpdSetFixed(p_locationX + p_width / 2 + 0.01); //.toFixed(4));
                                        } else {
                                            item_start = wpdSetFixed(p_locationX - p_width / 2); //.toFixed(4));
                                            item_end = wpdSetFixed(p_locationX + p_width / 2); //.toFixed(4));
                                        }
                                        item_top = wpdSetFixed(peg_vert_details[l]); //.toFixed(4));
                                        item_bottom = wpdSetFixed(peg_vert_details[l] - p_height); //.toFixed(4));
                                    } else {
                                        if (shelfDtl.ObjType !== "CHEST") {
                                            item_start = wpdSetFixed(peg_horiz_details[j] + 0.01); //.toFixed(4));
                                            item_end = wpdSetFixed(peg_horiz_details[j] + p_width + 0.01); //.toFixed(4));
                                        } else {
                                            item_start = wpdSetFixed(peg_horiz_details[j]); //.toFixed(4));
                                            item_end = wpdSetFixed(peg_horiz_details[j] + p_width); //.toFixed(4));
                                        }
                                        item_top = wpdSetFixed(peg_vert_details[l]); //.toFixed(4));
                                        item_bottom = wpdSetFixed(peg_vert_details[l] - p_height); //.toFixed(4));
                                    }

                                    var k = 0;
                                    var valid = "Y";
                                    var hit_index = -1;
                                    for (const items of items_list) {
                                        if (k < p_item_index) {
                                            div_start = wpdSetFixed(items.X - items.W / 2); //.toFixed(4));
                                            div_end = wpdSetFixed(items.X + items.W / 2); //.toFixed(4));
                                            div_top = wpdSetFixed(items.Y + items.H / 2); //.toFixed(4));
                                            div_bottom = wpdSetFixed(items.Y - items.H / 2); //.toFixed(4));

                                            if (((item_top > div_bottom && div_top > item_top) || item_end > shelf_end) && ItemAutoPlacing == "N") {
                                                valid = "N";
                                                g_prevX = j;
                                                g_prevY = l;
                                                hit_index = k;
                                                break; //return false;
                                            } else {
                                                if ((((div_start < item_end && div_start >= item_start) || (div_end > item_start && div_end <= item_end)) && ((div_bottom < item_top && div_bottom >= item_bottom) || (div_top <= item_top && div_top > item_bottom))) || (((item_start < div_start && item_end > div_start) || (item_start < div_end && item_end >= div_end)) && item_top <= div_top && item_bottom >= div_bottom) || (((div_start <= item_start && div_end >= item_end) || (div_start >= item_start && div_end <= item_end)) && ((div_top >= item_top && item_bottom >= div_bottom) || (div_top >= item_top && div_bottom <= item_bottom) || (div_top > item_top && div_bottom <= item_top))) || (item_start < div_start && item_end >= div_end && item_top <= div_top && item_top > div_bottom && item_bottom <= div_bottom) || (item_start > div_start && item_end <= div_end && item_top >= div_top && item_bottom < div_top && item_bottom <= div_bottom) || (item_start < div_start && item_end >= div_end && item_top <= div_top && item_bottom >= div_bottom) || (item_start < div_start && item_end >= div_end && item_top < div_top && item_top > div_bottom) || (item_start >= div_start && item_start < div_end && item_bottom >= div_bottom && item_bottom < div_top)) {
                                                    valid = "N";
                                                    g_prevX = j;
                                                    g_prevY = l;
                                                    hit_index = k;
                                                    break; //return false;
                                                }
                                            }
                                        }
                                        k++;
                                    }
                                    if (valid == "Y") {
                                        g_prevX++;
                                        g_prevY++;
                                        finalX = item_start + p_width / 2;

                                        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType !== "CHEST") {
                                            if (shelf_start == item_start - 0.02) {
                                                finalX = finalX - 0.01;
                                            }
                                        }
                                        itemdtl[p_item_index].X = finalX;
                                        //ASA-1300
                                        if (shelfDtl.ObjType == "CHEST" && ItemAutoPlacing == "Y") {
                                            var [finalY, top_idx] = get_top_y(item_top, items_list, 0.001, p_item_index, p_height, itemdtl[p_item_index]);
                                            itemdtl[p_item_index].Y = finalY - p_dfl_y;
                                        } else {
                                            if (p_itemInsidePeg == "N") {
                                                itemdtl[p_item_index].Y = p_locationY;
                                            } else {
                                                itemdtl[p_item_index].Y = item_top - p_height / 2;
                                            }
                                        }

                                        itemdtl[p_item_index].SecondTier = "Y";
                                        yFound = "Y";
                                        break;
                                    } else if (allow_overlap == "Y") {
                                        var div_top = itemdtl[hit_index].Y + itemdtl[hit_index].H / 2;
                                        var div_bottom = itemdtl[hit_index].Y - itemdtl[hit_index].H / 2;
                                        item_top = p_locationY + itemdtl[p_item_index].H / 2;
                                        item_bottom = p_locationY - itemdtl[p_item_index].H / 2;
                                        if ((item_bottom < itemdtl[hit_index].Y && div_top < item_bottom) || (item_top > itemdtl[hit_index].Y && item_top < div_top) || (div_top > p_locationY && div_top < item_top) || (div_bottom < p_locationY && div_top > item_top)) {
                                            var total_depth = itemdtl[hit_index].D * itemdtl[hit_index].BaseD + itemdtl[p_item_index].D * itemdtl[p_item_index].BaseD;
                                            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].MaxMerch > 0) {
                                                if (total_depth > g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].MaxMerch) {
                                                    overlap_valid = "D";
                                                    break;
                                                } else {
                                                    overlap_valid = "Y";
                                                    itemdtl[p_item_index].X = p_locationX;
                                                    //ASA-1769
                                                    if (p_itemInsidePeg == "N") {
                                                        itemdtl[p_item_index].Y = p_locationY;
                                                    } else {
                                                        itemdtl[p_item_index].Y = closest - p_height / 2;
                                                    }
                                                    break;
                                                }
                                            } else {
                                                overlap_valid = "Y";
                                                itemdtl[p_item_index].X = p_locationX;
                                                //ASA-1769
                                                if (p_itemInsidePeg == "N") {
                                                    itemdtl[p_item_index].Y = p_locationY;
                                                } else {
                                                    itemdtl[p_item_index].Y = closest - p_height / 2;
                                                }
                                                break;
                                            }
                                        } else {
                                            overlap_valid = "Y";
                                            itemdtl[p_item_index].X = p_locationX;
                                            //ASA-1769
                                            if (p_itemInsidePeg == "N") {
                                                itemdtl[p_item_index].Y = p_locationY;
                                            } else {
                                                itemdtl[p_item_index].Y = closest - p_height / 2;
                                            }
                                            break;
                                        }
                                    }
                                } else {
                                    break;
                                }
                            }
                        } else {
                            continue;
                        }
                    } else {
                        break;
                    }
                    if (yFound == "Y") {
                        break;
                    }
                }
            }
        } else if (item_exists == "N" && (from_productlist == "N" || typeof from_productlist == "undefined")) {
            var item_top = wpdSetFixed(itemdtl[p_item_index].Y + p_height / 2); //.toFixed(4));
            var item_bottom = wpdSetFixed(itemdtl[p_item_index].Y - p_height / 2); //.toFixed(4));
            var x = itemdtl[p_item_index].X;
            if (isNaN(x)) {
                x = g_final_x;
            }
            var item_start = wpdSetFixed(x - p_width / 2); //.toFixed(4));
            var item_end = wpdSetFixed(x + p_width / 2); //.toFixed(4));
            var itemID = itemdtl[p_item_index].ItemID;
            var valid = "Y";
            var k = 0;
            for (const items of items_list) {
                if (k !== p_item_index) {
                    div_start = wpdSetFixed(items.X - items.W / 2); //.toFixed(4));
                    div_end = wpdSetFixed(items.X + items.W / 2); //.toFixed(4));
                    div_top = wpdSetFixed(items.Y + items.H / 2); //.toFixed(4));
                    div_bottom = wpdSetFixed(items.Y - items.H / 2); //.toFixed(4));
                    if ((((div_start < item_end && div_start >= item_start) || (div_end > item_start && div_end <= item_end)) && ((div_bottom < item_top && div_bottom >= item_bottom) || (div_top <= item_top && div_top > item_bottom))) || (((item_start < div_start && item_end > div_start) || (item_start < div_end && item_end >= div_end)) && item_top <= div_top && item_bottom >= div_bottom) || (((div_start <= item_start && div_end >= item_end) || (div_start >= item_start && div_end <= item_end)) && ((div_top >= item_top && item_bottom >= div_bottom) || (div_top >= item_top && div_bottom <= item_bottom) || (div_top > item_top && div_bottom <= item_top))) || (item_start < div_start && item_end >= div_end && item_top <= div_top && item_top > div_bottom && item_bottom <= div_bottom) || (item_start > div_start && item_end <= div_end && item_top >= div_top && item_bottom < div_top && item_bottom <= div_bottom) || (item_start < div_start && item_end >= div_end && item_top <= div_top && item_bottom >= div_bottom) || (item_start < div_start && item_end >= div_end && item_top < div_top && item_top > div_bottom) || (item_start >= div_start && item_start < div_end && item_bottom >= div_bottom && item_bottom < div_top)) {
                        valid = "N";
                        hit_index = k;
                        console.log("items", items.Item, items.X, items.W);
                        console.log("div_start ", div_start, " div end ", div_end, " div top ", div_top, "div bottom ", div_bottom);
                        console.log("item_start ", item_start, " item end ", item_end, " item top ", item_top, " item bottom ", item_bottom);
                        break; //return false;
                    }
                }

                // });
                k++;
            }
            if (valid == "Y") {
                //ASA-1178
                if (shelfDtl.ObjType !== "CHEST") {
                    finalX = item_start + itemdtl[p_item_index].W / 2 + 0.002;
                } else {
                    finalX = x; //item_start + itemdtl[p_item_index].W / 2;ASA-1343 Issue 1
                }
                prevX = finalX;
                if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType !== "CHEST") {
                    if (g_mselect_drag == "N" && p_calcY == "Y") {
                        //ASA-1769
                        if (p_itemInsidePeg == "N") {
                            finalY = p_locationY;
                        } else {
                            for (l = 0; l < peg_vert_details.length; l++) {
                                if (peg_vert_details[l] < g_finalY + p_height / 2) {
                                    //ASA-1739 Issue 1
                                    var shelfTop = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2); // Regression Issue 1 30042025
                                    if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].UOverHang > 0 && shelfTop < g_finalY + p_height / 2 && shelfTop > g_finalY - p_height / 2) {
                                        itemdtl[p_item_index].Y = wpdSetFixed(peg_vert_details[l]);
                                    } else {
                                        itemdtl[p_item_index].Y = wpdSetFixed(peg_vert_details[l]) - p_height / 2;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    if (shelfDtl.ObjType !== "CHEST") {
                        if (shelf_start == item_start - 0.02) {
                            finalX = finalX - 0.01;
                        }
                    } else {
                        /*if (shelf_start == item_start) {
                        finalX = finalX;
                        } else {
                        finalX = finalX + p_dfl_x;
                        }*/
                        finalX = finalX;
                    }
                    itemdtl[p_item_index].X = finalX;
                    /*if (shelfDtl.ObjType == "CHEST") {
                    var [finalY, top_idx] = get_top_y(item_top, items_list, 0.001, p_item_index, p_height, itemdtl[p_item_index]);
                    itemdtl[p_item_index].Y = finalY;
                    } else {*/
                    //ASA-1769
                    if (p_itemInsidePeg == "N" && shelfDtl.ObjType !== "CHEST") {
                        itemdtl[p_item_index].Y = p_locationY;
                    } else {
                        itemdtl[p_item_index].Y = item_top - p_height / 2;
                    }
                    //}
                }

                itemdtl[p_item_index].SecondTier = "Y";
            } else if (allow_overlap == "Y") {
                var div_top = itemdtl[hit_index].Y + itemdtl[hit_index].H / 2;
                var div_bottom = itemdtl[hit_index].Y - itemdtl[hit_index].H / 2;
                item_top = p_locationY + itemdtl[p_item_index].H / 2;
                item_bottom = p_locationY - itemdtl[p_item_index].H / 2;
                if ((item_bottom < itemdtl[hit_index].Y && div_top < item_bottom) || (item_top > itemdtl[hit_index].Y && item_top < div_top) || (div_top > p_locationY && div_top < item_top) || (div_bottom < p_locationY && div_top > item_top)) {
                    var total_depth = itemdtl[hit_index].D * itemdtl[hit_index].BaseD + itemdtl[p_item_index].D * itemdtl[p_item_index].BaseD;
                    if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].MaxMerch > 0) {
                        if (total_depth > g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].MaxMerch) {
                            overlap_valid = "D";
                        } else {
                            overlap_valid = "Y";
                            itemdtl[p_item_index].X = p_locationX;
                            //ASA-1769
                            if (p_itemInsidePeg == "N") {
                                itemdtl[p_item_index].Y = p_locationY;
                            } else {
                                itemdtl[p_item_index].Y = closest - p_height / 2;
                            }
                        }
                    } else {
                        overlap_valid = "Y";
                        itemdtl[p_item_index].X = p_locationX;
                        //ASA-1769
                        if (p_itemInsidePeg == "N") {
                            itemdtl[p_item_index].Y = p_locationY;
                        } else {
                            itemdtl[p_item_index].Y = closest - p_height / 2;
                        }
                    }
                } else {
                    overlap_valid = "Y";
                    itemdtl[p_item_index].X = p_locationX;
                    //ASA-1769
                    if (p_itemInsidePeg == "N") {
                        itemdtl[p_item_index].Y = p_locationY;
                    } else {
                        itemdtl[p_item_index].Y = closest - p_height / 2;
                    }
                }
            }
            //ASA-1178
            if (valid == "Y") {
                var item_top = wpdSetFixed(itemdtl[p_item_index].Y + p_height / 2); //.toFixed(4));
                var item_bottom = wpdSetFixed(itemdtl[p_item_index].Y - p_height / 2); //.toFixed(4));
                var x = itemdtl[p_item_index].X;
                if (isNaN(x)) {
                    x = g_final_x;
                }
                var item_start = wpdSetFixed(x - p_width / 2); //.toFixed(4));
                var item_end = wpdSetFixed(x + p_width / 2); //.toFixed(4));
                if (item_start < shelf_start || item_end < shelf_start || item_end > shelf_end || item_top > shelf_top || item_bottom < shelf_bottom) {
                    //ASA-1519
                    finalX = -1;
                    valid = "N";
                }
            }
        }
        logDebug("function : find_pegboard_gap", "E");
        if (p_validate == "Y" && overlap_valid == "D" && allow_overlap == "Y") {
            return "D";
        } else if (p_validate == "Y" && overlap_valid == "N" && allow_overlap == "Y") {
            return "N";
        } else if (p_validate == "Y" && overlap_valid == "Y" && allow_overlap == "Y") {
            return p_locationX;
        } else if (p_validate == "Y" && finalX == -1) {
            return "N";
        } else if (finalX == -1 && p_validate == "N") {
            return itemdtl[p_item_index].X;
        } else {
            return finalX;
        }
    } catch (err) {
        error_handling(err);
    }
}

async function recreate_compare_views(p_view_ind, p_reload) {
    logDebug("function : recreate_compare_views; view_ind : " + p_view_ind + "; reload : " + p_reload, "S");
    if (g_compare_pog_flag == "Y" && g_compare_view !== "PREV_VERSION" && g_compare_view !== "POG") {
        if (p_view_ind == "POG" && p_reload == "Y") {
            var TEMP_POG = JSON.parse(JSON.stringify(g_pog_json));
            let result1 = await create_module_from_json([g_pog_json[g_ComViewIndex]], "N", "F", "N", "E", "N", "N", "Y", "Y", "", "Y", g_scene_objects[g_ComViewIndex].scene.children[2], g_scene_objects[g_ComViewIndex].scene, g_ComViewIndex, g_ComViewIndex);
            var new_json = JSON.parse(JSON.stringify(g_multi_pog_json));

            g_multi_pog_json = JSON.parse(JSON.stringify(TEMP_POG));
            g_multi_pog_json.push(new_json[0]);
            g_pog_json = g_multi_pog_json;

            var details = get_min_max_xy(g_ComViewIndex);
            var details_arr = details.split("###");
            set_camera_z(g_scene_objects[g_ComViewIndex].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), g_ComViewIndex);
        } else if (p_view_ind == "CUTAWAY") {
            var new_world = g_scene_objects[g_pog_index].scene.children[2].clone(true);
            g_scene_objects[g_ComViewIndex].scene.children[2] = new_world;
            set_camera_z(g_scene_objects[g_ComViewIndex].scene.children[0], g_cutaway_cam_detail[0].x, g_cutaway_cam_detail[0].y, g_cutaway_cam_detail[0].width, g_cutaway_cam_detail[0].height, g_cutaway_cam_detail[0].offset, g_cutaway_cam_detail[0].x, g_cutaway_cam_detail[0].y, true, g_ComViewIndex);
        } else if (p_view_ind !== "POG" && p_reload == "N" && p_view_ind !== "EDIT_PALLET") {
            console.log("g_ComViewIndex", g_ComViewIndex, p_view_ind);
            g_scene_objects.splice(g_ComViewIndex, 1);
            g_canvas_objects.splice(g_ComViewIndex, 1);
            init(g_ComViewIndex);
            var objects = {};
            objects["scene"] = g_scene;
            objects["renderer"] = g_renderer;
            g_scene_objects.push(objects);

            if (g_pog_json[g_ComViewIndex].H < 0.2) {
                var returnval = await create_compare_pog(p_view_ind);
            } else {
                var returnval = await create_side(p_view_ind, g_ComBaseIndex, g_ComViewIndex);
                g_scene_objects[g_ComViewIndex].scene.children[0].updateProjectionMatrix();
            }
        } else if (p_view_ind == "EDIT_PALLET") {
            //ASA-1085
            old_pog_index = g_pog_index;
            console.log("g_ComBaseIndex", g_ComBaseIndex, g_ComViewIndex);
            var [mod_ind, shelf_ind] = get_shelf_index(g_edit_pallet_shelfid, g_ComBaseIndex);
            if (mod_ind !== -1 && shelf_ind !== -1) {
                update_item_distance(mod_ind, shelf_ind, g_ComBaseIndex, "N"); //Bug-26122 - splitting the chest
                g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0] = JSON.parse(JSON.stringify(g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind]));
                g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].PrimeShelfObjID = g_pog_json[g_ComBaseIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].SObjID;
            }
            g_pog_json.splice(g_ComViewIndex, 1);
            g_scene_objects.splice(g_ComViewIndex, 1);
            g_canvas_objects.splice(g_ComViewIndex, 1);
            await edit_pallet("N", mod_ind, shelf_ind, g_ComBaseIndex, "N");
        }
    }
    logDebug("function : recreate_compare_views", "E");
}

//Start Sprint 20240122 - Regression Issue 10
async function get_chest_split_details(p_pogcr_pdf_chest_split, p_pog_index) {
    try {
        var pogChests = [];
        var mIndex = 0;
        if (p_pogcr_pdf_chest_split == "Y") {
            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    modules.ChestInfo = []; //Bug-26122 - splitting the chest
                    var sIndex = 0;
                    var moduleStart = wpdSetFixed(modules.X - modules.W / 2); //.toFixed(4));
                    var moduleEnd = wpdSetFixed(modules.X + modules.W / 2); //.toFixed(4));
                    for (const shelf of modules.ShelfInfo) {
                        g_pog_json[p_pog_index].ModuleInfo[mIndex].ShelfInfo[sIndex].SplitChest = "N"; //Bug-26122 - splitting the chest
                        if (shelf.ObjType == "CHEST") {
                            var shelfStart = wpdSetFixed(shelf.X - shelf.W / 2); //.toFixed(4));
                            var shelfEnd = wpdSetFixed(shelf.X + shelf.W / 2); //.toFixed(4));
                            if ((moduleStart >= shelfStart && moduleEnd < shelfEnd) || (moduleStart >= shelfStart && moduleEnd < shelfEnd) || (moduleStart <= shelfStart && moduleEnd < shelfEnd && moduleEnd > shelfStart) || (moduleStart >= shelfStart && moduleEnd > shelfEnd && moduleStart < shelfEnd)) {
                                //Regression-10 issue for chest pdf, added =
                                shelf.MIndex = mIndex;
                                shelf.SIndex = sIndex;
                                pogChests.push(shelf);
                                g_pog_json[p_pog_index].ModuleInfo[mIndex].ShelfInfo[sIndex].SplitChest = "Y";
                                //g_pog_json[p_pog_index].ModuleInfo[mIndex].ShelfInfo.splice(sIndex, 1);//Bug-26122 - splitting the chest
                            }
                        }
                        sIndex++;
                    }
                }
                mIndex++;
            }

            var ci = 0; //ASA-1314
            for (chest of pogChests) {
                // update g_pog_json modules with individual chest and updated item info
                var chestStart = wpdSetFixed(chest.X - chest.W / 2); //.toFixed(4));
                var chestEnd = wpdSetFixed(chest.X + chest.W / 2); //.toFixed(4));
                var chestItems = chest.ItemInfo;
                var mi = 0;
                var module_no = 0;
                for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var chest_insert = "N"; //ASA-1306
                        var mStart = wpdSetFixed(modules.X - modules.W / 2); //.toFixed(4));
                        var mEnd = wpdSetFixed(modules.X + modules.W / 2); //.toFixed(4));
                        var newChest = JSON.parse(JSON.stringify(chest));

                        if (mStart >= chestStart && mEnd <= chestEnd) {
                            //Regression-10 issue for chest pdf, added =//ASA-1351 issue 5
                            chest_insert = "Y"; //ASA-1306
                            newChest.W = modules.W;
                            newChest.X = modules.X;
                        } else if (mStart <= chestStart && mEnd <= chestEnd && mEnd > chestStart) {
                            //ASA-1351 issue 5
                            chest_insert = "Y";
                            newChest.W = wpdSetFixed(mEnd - chestStart); //.toFixed(4));
                            newChest.X = wpdSetFixed(chestStart + newChest.W / 2); //.toFixed(4));
                        } else if (mStart >= chestStart && mEnd >= chestEnd && mStart < chestEnd) {
                            //ASA-1351 issue 5
                            chest_insert = "Y"; //ASA-1306
                            newChest.W = wpdSetFixed(chestEnd - mStart); //.toFixed(4));
                            newChest.X = wpdSetFixed(mStart + newChest.W / 2); //.toFixed(4));
                        }
                        var newChestItems = [];
                        var newChestStart = wpdSetFixed(newChest.X - newChest.W / 2); //.toFixed(4));
                        var newChestEnd = wpdSetFixed(newChest.X + newChest.W / 2); //.toFixed(4));
                        module_no = chest.MIndex + 1; //ASA-1314 it was using mi before
                        for (items of chestItems) {
                            if (items.X >= newChestStart && items.X <= newChestEnd) {
                                items.ModuleNo = module_no; //ASA-1314
                                newChestItems.push(items);
                            }
                        }
                        if (chest_insert == "Y") {
                            //ASA-1306
                            newChestItems.sort(function (a, b) {
                                var aNum = parseInt(a.LocID);
                                var bNum = parseInt(b.LocID);
                                return aNum - bNum;
                            });
                            newChest.ItemInfo = newChestItems;
                            newChest.SplitChest = "Y";
                            g_pog_json[p_pog_index].ModuleInfo[mi].ChestInfo.push(newChest); //Bug-26122 - splitting the chest
                        }
                    }
                    mi++;
                }
                ci++;
            }
        }
        return "SUCCESS";
    } catch (err) {
        //Start ASA1310_20240307 crush item onload
        error_handling(err);
        throw err;
    }
}
//End Sprint 20240122 - Regression Issue 10

function get_sales_info(p_pog_index, p_item) {
    try {
        var SalesObj = {
            LeadTime: 0,
            SalesAmt: 0,
            VRM: 0,
            GP: 0,
            BEI: 0,
            MarkDown: 0,
            ShrinkageAmt: 0,
            SalesUnit: 0,
            SalesPerWeek: 0,
            SalesUnitPerWeek: 0,
            NonShrinkageAmt: 0,
            ASP: 0,
            VRMPer: "0%",
            GPPer: "0%",
            BEIPer: "0%",
            MarkDownPer: "0%",
            ShrinkageAmtPer: "0%",
            //ASA-1360 task 1 start
            AvgSalesPerWeek: 0,
            AvgQtyPerWeek: 0,
            SalesPartPer: "0%",
            QtyPartPer: "0%",
            NoOfListing: 0,
            //ASA-1360 task 1 end
            TotalShrinkageAmtPer: "0%", //ASA-1407 Task 1
            //ASA1923 Added tag
            AUR: 0,
            WeeklySales: 0,
            WeeklyQty: 0,
            NetMarginPercent: "0%",
            WeeklyNetMargin: "0%", //ASA 2049 issue 1
        };
        var SalesFound = false;
        if (typeof g_pog_json[p_pog_index].SalesInfo !== "undefined" && g_pog_json[p_pog_index].SalesInfo.length > 0) {
            for (ItemSales of g_pog_json[p_pog_index].SalesInfo) {
                if (ItemSales.Item == p_item) {
                    SalesObj = {
                        LeadTime: ItemSales.LeadTime,
                        SalesAmt: parseFloat(nvl(ItemSales.SalesAmt).toFixed(1)), //ASA-1775  nvl handling because of toFixed getting error
                        VRM: parseFloat(nvl(ItemSales.VRM).toFixed(1)),
                        GP: parseFloat(nvl(ItemSales.GP).toFixed(2)), //ASA-1360 task 1
                        BEI: ItemSales.BEI,
                        MarkDown: ItemSales.MarkDown,
                        ShrinkageAmt: parseFloat(nvl(ItemSales.ShrinkageAmt).toFixed(1)),
                        SalesUnit: ItemSales.SalesUnit,
                        SalesPerWeek: parseFloat(nvl(ItemSales.SalesPerWeek).toFixed(1)),
                        SalesUnitPerWeek: parseFloat(nvl(ItemSales.SalesUnitPerWeek).toFixed(1)),
                        NonShrinkageAmt: parseFloat(nvl(ItemSales.NonShrinkageAmt).toFixed(1)),
                        //ASA-1360 task 1
                        ASP: typeof ItemSales.ASP !== "undefined" && ItemSales.ASP !== "" && ItemSales.ASP !== null && ItemSales.ASP !== 0 ? parseFloat(nvl(ItemSales.ASP).toFixed(2)) : ItemSales.SalesUnit == 0 ? 0 : parseFloat((nvl(ItemSales.SalesAmt) / nvl(ItemSales.SalesUnit)).toFixed(1)), //ASA-1360 task 1 start,//ASA-1407 issue 5
                        VRMPer: (nvl(ItemSales.SalesAmt) == 0 ? 0 : parseFloat(((nvl(ItemSales.VRM) / nvl(ItemSales.SalesAmt)) * 100).toFixed(1))) + "%",
                        GPPer: (nvl(ItemSales.SalesAmt) == 0 ? 0 : parseFloat(((nvl(ItemSales.GP) / nvl(ItemSales.SalesAmt)) * 100).toFixed(1))) + "%",
                        BEIPer: (nvl(ItemSales.SalesAmt) == 0 ? 0 : parseFloat(((nvl(ItemSales.BEI) / nvl(ItemSales.SalesAmt)) * 100).toFixed(1))) + "%",
                        MarkDownPer: (nvl(ItemSales.SalesAmt) == 0 ? 0 : parseFloat(((nvl(ItemSales.MarkDown) / nvl(ItemSales.SalesAmt)) * 100).toFixed(1))) + "%",
                        ShrinkageAmtPer: (nvl(ItemSales.SalesAmt) == 0 ? 0 : parseFloat(((nvl(ItemSales.ShrinkageAmt) / nvl(ItemSales.SalesAmt)) * 100).toFixed(1))) + "%",
                        //ASA-1360 task 1 start
                        // ASA-1452
                        AvgSalesPerWeek: parseFloat(nvl(ItemSales.AvgSalesPerWeek).toFixed(1)),
                        AvgQtyPerWeek: parseFloat(nvl(ItemSales.AvgQtyPerWeek).toFixed(1)),
                        SalesPartPer: parseFloat(nvl(ItemSales.SalesPartPer).toFixed(1)) + "%",
                        QtyPartPer: parseFloat(nvl(ItemSales.QtyPartPer).toFixed(1)) + "%",
                        NoOfListing: parseFloat(nvl(ItemSales.NoOfListing).toFixed(1)),
                        //ASA-1360 task 1 end
                        TotalShrinkageAmtPer: (nvl(ItemSales.SalesAmt) == 0 ? 0 : parseFloat((((nvl(ItemSales.ShrinkageAmt) + nvl(ItemSales.NonShrinkageAmt)) / nvl(ItemSales.SalesAmt)) * 100).toFixed(1))) + "%", //ASA-1407 Task 1
                        //ASA1923 Added tag
                        AUR: parseFloat(nvl(ItemSales.AUR).toFixed(1)),
                        WeeklySales: parseFloat(nvl(ItemSales.weeklysales).toFixed(1)),
                        WeeklyQty: parseFloat(nvl(ItemSales.weeklyqty).toFixed(1)),
                        // NetMarginPercent: parseFloat(nvl(ItemSales.netmarginpercent).toFixed(1)) + "%",//ASA 2049 issue 1
                        NetMarginPercent: parseFloat(nvl(ItemSales.nmper).toFixed(1)) + "%",    //ASA 2049 issue 1
                        WeeklyNetMargin: parseFloat(nvl(ItemSales.netmarginpercent).toFixed(1)) + "%", //ASA 2049 issue 1
                    };
                    SalesFound = true;
                    break;
                }
            }
        }
        if (!SalesFound) {
            for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    for (const shelfs of modules.ShelfInfo) {
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            if (shelfs.ItemInfo.length > 0) {
                                for (const items of shelfs.ItemInfo) {
                                    if (items.Item !== "DIVIDER" && items.Desc !== "" && typeof items.Desc !== "undefined") {
                                        if (items.Item == p_item) {
                                            SalesObj = {
                                                LeadTime: 0,
                                                SalesAmt: parseFloat(items.NetSales.toFixed(1)),
                                                VRM: 0,
                                                GP: items.GrossProfit,
                                                BEI: 0,
                                                MarkDown: 0,
                                                ShrinkageAmt: 0,
                                                SalesUnit: items.SalesUnit,
                                                SalesPerWeek: 0,
                                                SalesUnitPerWeek: 0,
                                                NonShrinkageAmt: 0,
                                                ASP: items.SalesUnit == 0 ? 0 : parseFloat((items.NetSales / items.SalesUnit).toFixed(1)), //ASA-1360 need to check on this.
                                                VRMPer: "0%",
                                                GPPer: (items.NetSales == 0 ? 0 : parseFloat(((items.GrossProfit / items.NetSales) * 100).toFixed(1))) + "%",
                                                BEIPer: "0%",
                                                MarkDownPer: "0%",
                                                ShrinkageAmtPer: "0%",
                                                //ASA-1360 task 1 start
                                                AvgSalesPerWeek: 0,
                                                AvgQtyPerWeek: 0,
                                                SalesPartPer: "0%",
                                                QtyPartPer: "0%",
                                                NoOfListing: 0,
                                                //ASA-1360 task 1 end
                                                TotalShrinkageAmtPer: "0%", //ASA-1407 Task 1
                                                //ASA1923 Added tag
                                                AUR: 0,
                                                WeeklySales: 0,
                                                WeeklyQty: 0,
                                                NetMarginPercent: "0%",
                                                WeeklyNetMargin: "0%", //ASA 2049 issue 1
                                            };
                                            SalesFound = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return SalesObj;
    } catch (err) {
        error_handling(err);
        throw err;
    }
}



//This is a global function to get the max merch of the item. (Max merch: the distance between the shelf on which item is present and shelf on top of it for shelf
//for hanging bar -- the distance between hanging bar and shelf below it.)
function get_cap_max_merch(p_mod_index, p_shelf_index, p_modules, p_shelfs, p_pog_index, p_default_max_merch, p_override = "N", p_byPassMedicineOverhung = "N" /*ASA-1638*/, p_item_index = 0 /*ASA-1892 Issue2 added p_item_index*/) {
    // Regression 2 added p_byPassMedicineOverhung
    if (p_shelfs.MaxMerch > 0 && p_override == "N") {
        var max_merch = p_shelfs.MaxMerch;
    } else if (p_shelfs.X >= p_modules.X - p_modules.W / 2 && p_shelfs.X < p_modules.X + p_modules.W / 2 && p_shelfs.Y <= p_modules.H + g_pog_json[p_pog_index].BaseH && p_shelfs.Y > 0) {
        var max_merch = get_module_max_merch(p_mod_index, p_shelf_index, p_pog_index, p_byPassMedicineOverhung, p_item_index); /*ASA-1892 Issue2 added p_item_index*/
    } else if (p_shelfs.Y < p_modules.H + g_pog_json[p_pog_index].BaseH && p_shelfs.Y > 0) {
        var max_merch = p_modules.H + g_pog_json[p_pog_index].BaseH - p_shelfs.Y;
    } else {
        var max_merch = p_default_max_merch;
    }
    return max_merch;
}
//End ASA-1369 revert // End 20240415 - Regression Issue 8

//Start 20240415 Rregression issue 29 20240430
// ASA-1095
//This function is used in recreate_all_items. to find out in a specific shelf if there are same items adjacently. so they can be combined together by increate horizontal
//facings.
function mergeAdjacentItems(p_pog_index, p_moduleIndex, p_shelfIndex, p_itemIndex) {
    try {
        var editIndex = -1,
            merged = false;
        var dropIndex = -1,
            nextIndex = -1;
        var lastitemIndex = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo.length - 1;
        var itemInfo = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex];
        var currItemID = itemInfo.ItemID,
            nextItem = -1,
            dropItem = -1;
        var objId = itemInfo.ObjID;
        //ASA-1765 Issue 3, added itemInfo.Item !== "DIVIDER"
        if (typeof lastitemIndex !== "undefined" && lastitemIndex !== 0 && itemInfo.Item !== "DIVIDER") {
            if (p_itemIndex == 0) {
                nextIndex = p_itemIndex + 1;
            } else if (p_itemIndex == lastitemIndex) {
                dropIndex = p_itemIndex - 1;
            } else {
                nextIndex = p_itemIndex + 1;
                dropIndex = p_itemIndex - 1;
            }

            nextItem = nextIndex !== -1 ? g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[nextIndex] : -1;
            dropItem = dropIndex !== -1 ? g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[dropIndex] : -1;
            //checking is as below
            // 1. it should be same item, 2. vertical facings should be same, 3. depth facings to be same.
            if (nextItem !== -1 && currItemID == nextItem.ItemID && itemInfo.BVert == nextItem.BVert && itemInfo.BaseD == nextItem.BaseD) {
                nextItem.BHoriz = nextItem.BHoriz + itemInfo.BHoriz;
                editIndex = p_itemIndex + 1;
                merged = true;
            } else if (dropItem !== -1 && currItemID == dropItem.ItemID && itemInfo.BVert == dropItem.BVert && itemInfo.BaseD == dropItem.BaseD) {
                dropItem.BHoriz = dropItem.BHoriz + itemInfo.BHoriz;
                editIndex = dropIndex;
                merged = true;
            }
            //if can be merged. then that item will be removed from world and current item horiz facings will be increased.
            if (merged) {
                var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
                var items = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[editIndex];
                var i = 0;

                g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo.splice(p_itemIndex, 1);
                var object = g_world.getObjectById(objId);
                if (typeof object !== "undefined") {
                    g_world.remove(object);
                }

                for (const fitems of g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo) {
                    if (fitems.ObjID == items["ObjID"]) {
                        editIndex = i;
                        break;
                    }
                    i++;
                }
                var [select_width, select_height, select_depth] = get_select_dim(items);
                items.Exists = "N";
                //after increasing horiz facings. that item is sent for validation. if validation is passed we pass those results to calling place.
                const [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(p_moduleIndex, p_shelfIndex, editIndex, select_width, select_height, select_depth, items.ItemNesting, items.NVal, items.BHoriz, items.BVert, items.BaseD, items.Orientation, items.OrgCWPerc, items.OrgCHPerc, items.OrgCDPerc, "Y", "Y", "Y", p_pog_index);
                if (item_width !== "ERROR") {
                    var [itemx, itemy] = get_item_xy(shelfs, items, item_width, item_height, p_pog_index);
                    items.X = itemx;
                    items.Y = itemy;
                    items.Exists = "E";
                    items.W = item_width;
                    items.H = item_height;
                    items.D = item_depth;
                    items.RW = real_width;
                    items.RH = real_height;
                    items.RD = real_depth;
                }
            }
        }
        return editIndex;
    } catch (err) {
        error_handling(err);
    }
}
//End 20240415 Rregression issue 29 20240430


function getSafeRandomizedLayout(itemHitArr, item_X, item_Y, item_width, item_height, iterations = 5000) { //ASA-1936 Issue 2
    let bestLayout = null;
    let bestTotalArea = -Infinity;

    for (let iter = 0; iter < iterations; iter++) {
        const shuffledItems = itemHitArr.slice().sort(() => Math.random() - 0.5);

        const layoutResult = [];
        let currentX = item_X;
        let currentY = item_Y;
        let maxRowHeight = 0;
        let totalArea = 0;

        for (const ovpItem of shuffledItems) {
            let [itemX, itemY, itemW, itemH, itemWidthCrush, itemHeightCrush] =
                getChestOverlappedItemDimension(currentX, currentY, item_width, item_height, ovpItem);
            const minW = item_width * 0.5;
            const minH = item_height * 0.5;
            if (itemW < minW) itemW = minW;
            if (itemH < minH) itemH = minH;

            layoutResult.push({
                item: ovpItem,
                ItemX: currentX,
                ItemY: currentY,
                ItemW: itemW,
                ItemH: itemH,
                ItemWidthCrush: itemWidthCrush,
                ItemHeightCrush: itemHeightCrush,
                Area: itemW * itemH
            });

            totalArea += itemW * itemH;
            currentX += itemW;
            maxRowHeight = Math.max(maxRowHeight, itemH);
        }
        if (totalArea > bestTotalArea) {
            bestTotalArea = totalArea;
            bestLayout = layoutResult;
        }
    }

    return bestLayout;
}

//this function is called for add merch. which will add red color box for each shelf showing its max merch.
async function add_merch(p_add_ind, p_pog_index) {
    //ASA-1519 issue 21
    try {
        logDebug("function : add_merch; add_ind : " + p_add_ind, "S");
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
        if (p_add_ind == "Y") {
            var module_details = g_pog_json[p_pog_index].ModuleInfo;
            $.each(module_details, function (j, Modules) {
                if (Modules.ParentModule == null || typeof Modules.ParentModule == "undefined") {
                    $.each(Modules.ShelfInfo, function (k, Shelf) {
                        if (typeof Shelf !== "undefined") {
                            if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "TEXTBOX" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "ROD" && Shelf.ObjType !== "PEGBOARD") {
                                if (Shelf.MaxMerch > 0) {
                                    var max_merch = Shelf.MaxMerch;
                                } else if (Shelf.X >= Modules.X - Modules.W / 2 && Shelf.X < Modules.X + Modules.W / 2 && Shelf.Y <= Modules.H + g_pog_json[p_pog_index].BaseH && Shelf.Y > 0) {
                                    var max_merch = get_module_max_merch(j, k, p_pog_index);
                                    Shelf.TOP = "Y";
                                } else if (Shelf.Y < Modules.H + g_pog_json[p_pog_index].BaseH && Shelf.Y > 0) {
                                    var max_merch = Modules.H + g_pog_json[p_pog_index].BaseH - Shelf.Y;
                                } else {
                                    var max_merch = g_default_max_merch;
                                }
                                var selected_object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(Shelf.SObjID);
                                var shelf_width = 0;
                                shelf_width = Shelf.Rotation !== 0 || Shelf.Slope !== 0 ? Shelf.ShelfRotateWidth : Shelf.W;
                                var selected_object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(Shelf.SObjID);
                                if (typeof selected_object.merchid !== "undefined") {
                                    var merchobj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(selected_object.merchid);
                                    if (typeof merchobj !== "undefined") {
                                        selected_object.remove(merchobj);
                                    }
                                }
                                add_merch_border(selected_object, shelf_width, max_merch, Shelf.H, Shelf.ObjType, Shelf.Rotation, Shelf.Slope, Shelf); //ASA-1531 issue 21
                            }
                        }
                    });
                }
            });
        } else {
            var module_details = g_pog_json[p_pog_index].ModuleInfo;
            $.each(module_details, function (j, Modules) {
                if (Modules.ParentModule == null || typeof Modules.ParentModule == "undefined") {
                    $.each(Modules.ShelfInfo, function (k, Shelf) {
                        if (typeof Shelf !== "undefined") {
                            if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "TEXTBOX" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "ROD" && Shelf.ObjType !== "PEGBOARD") {
                                var selected_object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(Shelf.SObjID);
                                var merchobj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(selected_object.merchid);
                                selected_object.remove(merchobj);
                            }
                        }
                    });
                }
            });
        }
        var oldStatus;
        if (p_add_ind == "Y") {
            oldStatus = "N";
        } else {
            oldStatus = "Y";
        }

        details["g_show_max_merch"] = oldStatus;
        if (typeof g_scene_objects[p_pog_index].Indicators !== "undefined") {
            g_scene_objects[p_pog_index].Indicators.MaxMerch = p_add_ind;
        }
        g_undo_details = [];
        g_undo_details.push(details);
        if (finalAction == "U") {
            g_delete_details.multi_delete_shelf_ind = "N";
            g_undo_all_obj_arr = [];

            g_undo_all_obj_arr.push(g_undo_details);
            g_undo_all_obj_arr.push(g_cut_copy_arr);
            g_undo_all_obj_arr.previousAction = "MAX_MERCH";
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
            g_redo_all_obj_arr.previousAction = "MAX_MERCH";
            if (g_cut_support_obj_arr.length > 0) {
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
        render(p_pog_index);
        logDebug("function : add_merch", "E");
    } catch (err) {
        error_handling(err);
    }
}

function logFinalUndoObjectsInfo(p_actionType, p_undoType, p_masterInfo, p_detailInfo, p_multiObjects, p_multiDelShelfInd, p_multiSelectDrag, p_multiselect, p_ctrlSelect, p_clearRedoLog, p_isCarpark) {
    logDebug("function : logFinalUndoObjectsInfo; actionType : " + p_actionType + "; undoType : " + p_undoType + "; p_MultiObjects : " + p_multiObjects + "; multiDelShelfInd : " + p_multiDelShelfInd + "; multiSelectDrag : " + p_multiSelectDrag + "; g_multiselect : " + p_multiselect + "; ctrlSelect : " + p_ctrlSelect + "; clearRedoLog : " + p_clearRedoLog + "; isCarpark : " + p_isCarpark, "S");
    if (p_undoType == "U") {
        g_undo_all_obj_arr = [];
        if (p_clearRedoLog == "Y") {
            g_redo_final_obj_arr = [];
        }
        g_redo_all_obj_arr = [];
        g_undo_all_obj_arr.push(p_masterInfo);
        g_undo_all_obj_arr.push(p_detailInfo);
        g_undo_all_obj_arr.previousAction = p_actionType;
        g_undo_all_obj_arr.g_MultiObjects = p_multiObjects;
        g_undo_all_obj_arr.multi_delete_shelf_ind = p_multiDelShelfInd;
        g_undo_all_obj_arr.CurrCanvas = g_curr_canvas;
        g_undo_all_obj_arr.IsCarpark = p_isCarpark;
        g_undo_final_obj_arr.push(g_undo_all_obj_arr);
        if (g_context_opened !== "Y") {
            if (g_delete_details["is_dragging"] != "Y") {
                //ASA-1577
                g_delete_details = [];
            }
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
        }
        g_cut_copy_arr = [];
        cut_copy_arr1 = [];
        g_undo_details = [];
        g_mselect_drag = p_multiSelectDrag;
        p_multiselect = p_multiselect;
        g_ctrl_select = p_ctrlSelect;
        g_undo_all_obj_arr = [];
        g_temp_cut_arr = [];
    } else {
        g_redo_all_obj_arr = [];
        g_redo_all_obj_arr = [];
        g_redo_all_obj_arr.push(p_masterInfo);
        g_redo_all_obj_arr.push(p_detailInfo);
        g_redo_all_obj_arr.previousAction = p_actionType;
        g_redo_all_obj_arr.g_MultiObjects = p_multiObjects;
        g_redo_all_obj_arr.CurrCanvas = g_curr_canvas;
        g_redo_all_obj_arr.IsCarpark = p_isCarpark;
        g_redo_all_obj_arr.multi_delete_shelf_ind = p_multiDelShelfInd;
        g_redo_final_obj_arr.push(g_redo_all_obj_arr);
        if (g_context_opened !== "Y") {
            if (g_delete_details["is_dragging"] != "Y") {
                //ASA-1577
                g_delete_details = [];
            }
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
        }
        g_cut_copy_arr = [];
        cut_copy_arr1 = [];
        g_undo_details = [];
        g_mselect_drag = p_multiSelectDrag;
        p_multiselect = p_multiselect;
        g_ctrl_select = p_ctrlSelect;
        g_undo_all_obj_arr = [];
        g_temp_cut_arr = [];
    }
    logDebug("function : logFinalUndoObjectsInfo", "E");
}

//ASA-1652 - End



// ASA-1965 TASK 1 S Create new function for cleanup extra json tag from autofill json
function filterAutoFillJsontag(p_autoFillData) {
    const keepKeys = ["ItemID", "Item", "Desc"];
    if (!p_autoFillData || typeof p_autoFillData !== "object")
        return {};

    const cleanData = JSON.parse(JSON.stringify(p_autoFillData));

    const cleanItemKeys = (itemArray) => {
        if (!Array.isArray(itemArray))
            return;
        itemArray.forEach((item) => {
            Object.keys(item).forEach((key) => {
                if (!keepKeys.includes(key))
                    delete item[key];
            });
        });
    };

    if (Array.isArray(cleanData.BlkInfo)) {
        cleanData.BlkInfo.forEach((block) => {
            //  Remove unwanted data and keep object data only from colorObj: BlockDim > ColorObj 
            if (block.BlockDim && block.BlockDim.ColorObj) {
                const obj = block.BlockDim.ColorObj.object; // ASA-1965 Issue 5
                block.BlockDim.ColorObj = { object: obj };
            }
            // Path 1: BlkModInfo > moduleInfo > ShelfInfo > ItemInfo
            if (Array.isArray(block.BlkModInfo)) {
                block.BlkModInfo.forEach((modInfo) => {
                    const shelves = modInfo?.moduleInfo?.ShelfInfo;
                    if (Array.isArray(shelves)) {
                        shelves.forEach((shelf) => cleanItemKeys(shelf.ItemInfo));
                    } else if (shelves && typeof shelves === "object") {
                        cleanItemKeys(shelves.ItemInfo);
                    }
                });
            }

            // Path 2: BlkShelfInfo > ShelfInfo > ItemInfo
            if (Array.isArray(block.BlkShelfInfo)) {
                block.BlkShelfInfo.forEach((shelfBlock) => {
                    const shelfInfo = shelfBlock?.ShelfInfo;
                    if (Array.isArray(shelfInfo)) {
                        shelfInfo.forEach((shelf) => cleanItemKeys(shelf.ItemInfo));
                    } else if (shelfInfo && typeof shelfInfo === "object") {
                        cleanItemKeys(shelfInfo.ItemInfo);
                    }
                });
            }
        });
    }

    return cleanData;
}
//ASA-1965 TASK 1 E