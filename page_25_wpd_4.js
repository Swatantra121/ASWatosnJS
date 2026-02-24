var l_show_max_merch_comp = "N";
//this is a common function used to set details in g_delete_details when multi select or single select.
function get_detail_array(p_mIndex, p_sIndex, p_iIndex, p_shelf_obj_type, p_shelf_info, p_shelf, p_new_shelf_recreated, p_item_info, p_item, p_corrected, p_error_category, p_pog_code, p_version, p_description, p_module, p_cap_facing, p_cap_depth, p_cap_horz, p_bhoriz, p_bvert, p_based) {
    //ASA-1758 added parameter for total cap
    var details = {};
    details["MIndex"] = p_mIndex;
    details["SIndex"] = p_sIndex;
    details["IIndex"] = p_iIndex;
    details["ShelfObjType"] = p_shelf_obj_type;
    details["ShelfInfo"] = p_shelf_info;
    details["Shelf"] = p_shelf;
    details["NewShelfRecreated"] = p_new_shelf_recreated;
    details["ItemInfo"] = p_item_info;
    details["Item"] = p_item;
    details["Corrected"] = p_corrected;
    details["ErrorCategory"] = p_error_category;
    details["POGCode"] = p_pog_code;
    details["Version"] = p_version;
    details["Desc"] = p_description;
    details["Module"] = p_module;
    details["CapFacing"] = p_cap_facing; //ASA-1758
    details["CapDepth"] = p_cap_depth; //ASA-1758
    details["CapHorz"] = p_cap_horz; //ASA-1758
    details["BHoriz"] = p_bhoriz; //ASA-1758
    details["BVert"] = p_bvert; //ASA-1758
    details["BaseD"] = p_based; //ASA-1758
    return details;
}

//this function is used to validate all the items in the shelf and try to correct it with crushing or reducing facing or move item to other shelf.
async function validate_pog(p_pog_index, p_multiple = "N", p_byPassMedicineOverhung = "N") {
    // Regression 2 added p_byPassMedicineOverhung
    logDebug("function : validate_pog", "S");
    try {
        g_errored_items = [];
        var i = 0;
        var failed = "N";
        let result = await set_shelf_item_index(p_pog_index);
        for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
            if (modules.ParentModule == null || modules.ParentModule == "undefined") {
                var j = 0;
                for (const shelfs of modules.ShelfInfo) {
                    if (typeof shelfs !== "undefined") {
                        if (shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "BASE" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX" && shelfs.ObjType !== "CHEST") {
                            //ASA-1412 issue 12 20240708
                            if (shelfs.ObjType == "HANGINGBAR") {
                                //validating shelf if it hits other objects.
                                var validate_passed = validate_shelf_min_distance(i, j, shelfs.Y, shelfs.ItemInfo, shelfs.AllowAutoCrush, i, shelfs.X, "N", shelfs, p_pog_index);
                                if (validate_passed == "N") {
                                    var details = get_detail_array(i, j, k, shelfs.ObjType, JSON.parse(JSON.stringify(shelfs)), shelfs.Shelf, "N", {}, "", "Y", g_error_category, g_pog_json[p_pog_index].POGCode, g_pog_json[p_pog_index].Version, "", g_pog_json[p_pog_index].ModuleInfo[i].Module, "", "", "", "", "", ""); //ASA-1758
                                }
                            } else {
                                if (shelfs.ItemInfo.length > 0) {
                                    var l_items_details = JSON.parse(JSON.stringify(shelfs.ItemInfo));
                                    /*for (const items of l_items_details) {//Task_27812 issue 16 20240529
                                    if ((items.CWPerc > 0 || items.CrushHoriz > 0 || items.CHPerc > 0 || items.CrushVert > 0 || items.CDPerc > 0 || items.CrushD > 0) && shelfs.ObjType == "SHELF") {
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].OldShelfAllowAutoCrush = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].AllowAutoCrush;
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].AllowAutoCrush = "Y";
                                    break;
                                    }
                                    }*/
                                    shelfs.ItemInfo = [];
                                    var k = 0;
                                    if (shelfs.SpreadItem == "R") {
                                        for (var m = l_items_details.length - 1; m >= 0; m--) {
                                            shelfs.ItemInfo.splice(0, 0, l_items_details[m]);
                                            var item_depth_arr = [],
                                                item_height_arr = [],
                                                item_width_arr = [],
                                                item_index_arr = [];

                                            item_depth_arr.push(wpdSetFixed(l_items_details[m].D)); //.toFixed(5))); //ASA-1087, toFixed(4)
                                            item_height_arr.push(wpdSetFixed(l_items_details[m].H)); //.toFixed(5))); //ASA-1087, toFixed(4)
                                            item_width_arr.push(wpdSetFixed(l_items_details[m].W)); //.toFixed(5))); //ASA-1087, toFixed(4)
                                            item_index_arr.push(k); //Regression 7 Prasanna;
                                            var allow_crush = shelfs.AllowAutoCrush;
                                            var drag_item_arr = [];
                                            var details = get_detail_array(i, j, k, shelfs.ObjType, JSON.parse(JSON.stringify(shelfs)), shelfs.Shelf, "N", JSON.parse(JSON.stringify(l_items_details[m])), l_items_details[m].Item, "N", "", g_pog_json[p_pog_index].POGCode, g_pog_json[p_pog_index].Version, l_items_details[m].Desc, g_pog_json[p_pog_index].ModuleInfo[i].Module, l_items_details[m].CapFacing, l_items_details[m].CapDepth, l_items_details[m].CapHorz, l_items_details[m].BHoriz, l_items_details[m].BVert, l_items_details[m].BaseD); //ASA-1758

                                            details["NewShelfInd"] = "";
                                            details["W"] = l_items_details[m].W;
                                            details["H"] = l_items_details[m].H;
                                            details["D"] = l_items_details[m].D;

                                            //ASA-1262
                                            //Height validation
                                            if (shelfs.ObjType == "SHELF" || (shelfs.ObjType == "CHEST" && g_chest_as_pegboard == "N") || shelfs.ObjType == "PALLET" || shelfs.ObjType == "HANGINGBAR") {
                                                var return_val = item_height_validation(l_items_details[m].H, i, j, k, "N", l_items_details[m].X, allow_crush, l_items_details[m].CrushVert, l_items_details[m].Fixed, "N", l_items_details[m].D, "Y", p_pog_index, p_byPassMedicineOverhung); // Regression 2 added p_byPassMedicineOverhung regression 7 Prasanna
                                                if (return_val == "Y") {
                                                    details["ErrorCategory"] = g_error_category;
                                                    details["Errored"] = "Y";
                                                    g_errored_items.push(details);
                                                    failed = "Y";
                                                }
                                            }
                                            //Width validation
                                            if (!validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, shelfs.ObjType, i, j, k, "N", 0, 0, 0, l_items_details[m].X, "N", "N", "N", "N", "Y", drag_item_arr, "N", "Y", "N", p_pog_index)) {
                                                //regression 7 Prasanna
                                                details["ErrorCategory"] = g_error_category;
                                                details["Errored"] = "Y";
                                                var exists = "N";
                                                for (obj of g_errored_items) {
                                                    if (obj.MIndex == i && obj.SIndex == j && obj.IIndex == m) {
                                                        exists = "Y";
                                                        break;
                                                    }
                                                }

                                                if (p_multiple == "Y") {
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                } else if (exists == "N") {
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                }
                                                failed = "Y"; //regression 7 End
                                            }
                                            //Depth validation
                                            if (!validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, shelfs.ObjType, i, j, k, "N", 0, 0, 0, l_items_details[m].X, "N", "N", "N", "N", "Y", drag_item_arr, "N", "N", "Y", p_pog_index)) {
                                                //regression 7 Prasanna
                                                details["ErrorCategory"] = g_error_category;
                                                details["Errored"] = "Y";
                                                var exists = "N";
                                                for (obj of g_errored_items) {
                                                    if (obj.MIndex == i && obj.SIndex == j && obj.IIndex == m) {
                                                        exists = "Y";
                                                        break;
                                                    }
                                                }

                                                if (p_multiple == "Y") {
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                } else if (exists == "N") {
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                }
                                                failed = "Y"; //regression 7 End
                                            }
                                        }
                                    } else {
                                        for (const items of l_items_details) {
                                            shelfs.ItemInfo.push(items);
                                            var item_depth_arr = [],
                                                item_height_arr = [],
                                                item_width_arr = [],
                                                item_index_arr = [];

                                            item_depth_arr.push(wpdSetFixed(items.D)); //.toFixed(5))); //ASA-1087, toFixed(4)
                                            item_height_arr.push(wpdSetFixed(items.H)); //.toFixed(5))); //ASA-1087, toFixed(4)
                                            item_width_arr.push(wpdSetFixed(items.W)); //.toFixed(5))); //ASA-1087, toFixed(4)
                                            item_index_arr.push(k);
                                            var allow_crush = shelfs.AllowAutoCrush;
                                            var drag_item_arr = [];
                                            var details = get_detail_array(i, j, k, shelfs.ObjType, JSON.parse(JSON.stringify(shelfs)), shelfs.Shelf, "N", JSON.parse(JSON.stringify(items)), items.Item, "N", "", g_pog_json[p_pog_index].POGCode, g_pog_json[p_pog_index].Version, items.Desc, g_pog_json[p_pog_index].ModuleInfo[i].Module, items.CapFacing, items.CapDepth, items.CapHorz, items.BHoriz, items.BVert, items.BaseD);

                                            details["NewShelfInd"] = "";
                                            details["W"] = items.W;
                                            details["H"] = items.H;
                                            details["D"] = items.D;

                                            //ASA-1262
                                            //Height Validation
                                            if (shelfs.ObjType == "SHELF" || (shelfs.ObjType == "CHEST" && g_chest_as_pegboard == "N") || shelfs.ObjType == "PALLET" || shelfs.ObjType == "HANGINGBAR") {
                                                var return_val = item_height_validation(items.H, i, j, k, "N", items.X, allow_crush, items.CrushVert, items.Fixed, "N", items.D, "Y", p_pog_index, p_byPassMedicineOverhung); // Regression 2 added p_byPassMedicineOverhung
                                                if (return_val == "Y") {
                                                    details["ErrorCategory"] = g_error_category;
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                    failed = "Y";
                                                }
                                            }
                                            //Width Validation
                                            if (!validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, shelfs.ObjType, i, j, k, "N", 0, 0, 0, items.X, "N", "N", "N", "N", "Y", drag_item_arr, "N", "Y", "N", p_pog_index)) {
                                                details["ErrorCategory"] = g_error_category;
                                                var exists = "N"; //regression 7 Prasanna
                                                for (obj of g_errored_items) {
                                                    if (obj.MIndex == i && obj.SIndex == j && obj.IIndex == k) {
                                                        exists = "Y";
                                                        break;
                                                    }
                                                }

                                                if (p_multiple == "Y") {
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                } else if (exists == "N") {
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                } //regression 7 end

                                                failed = "Y";
                                            }
                                            //Depth Validation
                                            if (!validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, shelfs.ObjType, i, j, k, "N", 0, 0, 0, items.X, "N", "N", "N", "N", "Y", drag_item_arr, "N", "N", "Y", p_pog_index)) {
                                                details["ErrorCategory"] = g_error_category;
                                                var exists = "N"; //regression 7 prasanna
                                                for (obj of g_errored_items) {
                                                    if (obj.MIndex == i && obj.SIndex == j && obj.IIndex == k) {
                                                        exists = "Y";
                                                        break;
                                                    }
                                                }

                                                if (p_multiple == "Y") {
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                } else if (exists == "N") {
                                                    g_errored_items.push(JSON.parse(JSON.stringify(details)));
                                                } //regression 7 end
                                                failed = "Y";
                                            }
                                            k++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    j++;
                }
            }
            i++;
        }
        //if there are errors, find out which of the correction will correct the error and mark in array and open a popup to user to solve the error.
        if (g_errored_items.length > 0) {
            for (const objects of g_errored_items) {
                var shelfs = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                var items = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex];
                var returnval = await check_crush_facing_correct(objects.MIndex, objects.SIndex, objects.IIndex, "Y", items.X, items, shelfs, "Y", "C", objects.ErrorCategory, p_pog_index);
                if (returnval == "N") {
                    var returnval = await check_crush_facing_correct(objects.MIndex, objects.SIndex, objects.IIndex, "Y", items.X, items, shelfs, "Y", "F", objects.ErrorCategory, p_pog_index);
                    if (returnval == "Y") {
                        objects.CorrectionMethod = "F";
                    } else {
                        var check_dim = objects.ErrorCategory == "H" ? objects.ItemInfo.H : objects.ErrorCategory == "W" ? objects.ItemInfo.W : objects.ErrorCategory == "D" ? objects.ItemInfo.D : -1;
                        var [returnval, new_shelf_ind] = await check_fixel_avail_space(objects.MIndex, objects.SIndex, objects.IIndex, objects.ErrorCategory, check_dim, "Y", -1, items, p_pog_index);

                        if (returnval == "Y") {
                            objects.CorrectionMethod = "NF";
                            objects.NewShelfInd = new_shelf_ind;
                            objects.FixelChange = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[new_shelf_ind].Shelf;
                        } else {
                            objects.CorrectionMethod = "FAIL";
                        }
                    }
                } else {
                    objects.CorrectionMethod = "C";
                }
            }
        }
        logDebug("function : validate_pog", "E");
        return failed;
    } catch (err) {
        error_handling(err);
    }
}

async function check_fixel_avail_space(p_module_index, p_shelf_index, p_item_index, p_category, p_check_dim, p_check_ind, p_new_shelf_ind, p_items, p_pog_index) {
    logDebug("function : check_fixel_avail_space; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; category : " + p_category + "; check_dim : " + p_check_dim + "; check_ind : " + p_check_ind + "; new_shelf_ind : " + p_new_shelf_ind, "S");
    try {
        var j = 0;
        var exit = "N";
        if (p_check_ind == "Y") {
            p_new_shelf_ind = -1;
            for (const shelfs of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                if (typeof shelfs !== "undefined") {
                    if (shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "BASE" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX" && j !== p_shelf_index) {
                        var shelf_top = wpdSetFixed(shelfs.Y + shelfs.H / 2); //.toFixed(4));
                        if (shelfs.ObjType == "PEGBOARD") {
                            var horiz_gap = shelfs.VertiSpacing;
                        } else {
                            var horiz_gap = shelfs.HorizGap;
                        }
                        var k = 0;
                        var width_valid = (height_valid = depth_valid = "N");
                        var sum_width = 0;
                        for (const items of shelfs.ItemInfo) {
                            if (shelfs.ObjType == "SHELF") {
                                if (wpdSetFixed(items.Y - items.H / 2) == shelf_top) {
                                    if (horiz_gap > 0) {
                                        sum_width += wpdSetFixed(items.W + horiz_gap);
                                    } else {
                                        sum_width = wpdSetFixed(sum_width + items.W); //.toFixed(5)); //ASA-1087, toFixed(4)
                                    }
                                }
                            } else {
                                if (horiz_gap > 0) {
                                    sum_width += wpdSetFixed(items.W + horiz_gap);
                                } else {
                                    sum_width = wpdSetFixed(sum_width + items.W); //.toFixed(5)); //ASA-1087, toFixed(4)
                                }
                            }
                            k++;
                        }
                        if (g_errored_items.length > 0) {
                            for (const objects of g_errored_items) {
                                if (objects.CorrectionMethod == "NF" && objects.NewShelfInd == j) {
                                    if (horiz_gap > 0) {
                                        sum_width += wpdSetFixed(objects.W + horiz_gap);
                                    } else {
                                        sum_width = wpdSetFixed(sum_width + objects.W); //.toFixed(5)); //ASA-1087, toFixed(4)
                                    }
                                }
                            }
                        }
                        var available_space = wpdSetFixed(shelfs.W - sum_width);
                        if (available_space >= p_check_dim) {
                            exit = "Y";
                            width_valid = "Y";
                        }
                        var l_max_merch = get_max_merch(p_module_index, j, -1, "Y", shelfs.X, p_pog_index);
                        if (p_check_dim <= l_max_merch) {
                            exit = "Y";
                            height_valid = "Y";
                        }
                        if (p_check_dim <= shelfs.D) {
                            exit = "Y";
                            depth_valid = "Y";
                        }
                        //checking if the item can be placed in any other shelf.
                        if (width_valid == "Y" && height_valid == "Y" && depth_valid == "Y") {
                            p_new_shelf_ind = j;
                            break;
                        }
                    }
                }
                j++;
            }
        }
        //if correction is ok. then move the item to other shelf.
        if (p_new_shelf_ind !== -1 && p_check_ind == "N") {
            var edit_item_index = -1;
            var n = 0;
            for (item_details of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo) {
                if (item_details.IIndex == p_items.IIndex) {
                    edit_item_index = n;
                    break;
                }
                n++;
            }
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.splice(edit_item_index, 1);
            if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem == "R") {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_new_shelf_ind].ItemInfo.splice(0, 0, p_items);
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_new_shelf_ind].ItemInfo.push(p_items);
                var new_index = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_new_shelf_ind].ItemInfo.length - 1;
                var item_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_new_shelf_ind].ItemInfo[new_index];
                var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_new_shelf_ind];
                var p_items = item_dtl;
                if (shelfs.ObjType == "PEGBOARD") {
                    var horiz_gap = shelfs.VertiSpacing;
                } else {
                    var horiz_gap = shelfs.HorizGap;
                }
                var [itemx, itemy] = get_item_xy(shelfs, p_items, p_items.W, p_items.H, p_pog_index);
                item_dtl.Y = wpdSetFixed(itemy);
                item_dtl.X = get_item_xaxis(p_items.W, p_items.H, p_items.D, shelfs.ObjType, -1, horiz_gap, shelfs.SpreadItem, horiz_gap, p_module_index, p_new_shelf_ind, new_index, "Y", shelfs.ItemInfo.length, "N", p_pog_index);
                var depth_facing = 1;
                var real_depth = p_items.RD / p_items.BaseD;
                depth_facing = Math.floor((shelfs.D * 100) / (real_depth * 100));
                var l_dfacing = nvl(p_items.MPogDepthFacings) > 0 ? p_items.MPogDepthFacings : p_items.MDepthFacings; //ASA-1408
                depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874 ,//ASA-1408
                item_dtl.D = real_depth * (depth_facing > 0 ? depth_facing : 1);
                item_dtl.BaseD = depth_facing > 0 ? depth_facing : 1;
            }
            logDebug("function : check_fixel_avail_space", "E");
            return ["Y", p_new_shelf_ind];
        } else if (p_new_shelf_ind !== -1 && p_check_ind == "Y") {
            logDebug("function : check_fixel_avail_space", "E");
            return ["Y", p_new_shelf_ind];
        } else if (p_check_ind == "Y") {
            logDebug("function : check_fixel_avail_space", "E");
            return ["N", p_new_shelf_ind];
        }
    } catch (err) {
        error_handling(err);
    }
}

//used in validat_pog. checking if can crush the item or reduce facings to solve the error.
async function check_crush_facing_correct(p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_final_x, p_items, p_shelfs, p_check_ind, p_check_type, p_category, p_pog_index) {
    logDebug("function : check_crush_facing_correct; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; p_edit_ind : " + p_edit_ind + "; i_final_x : " + p_final_x + "; check_ind : " + p_check_ind + "; check_type : " + p_check_type + "; category : " + p_category, "S");
    try {
        l_max_merch = get_max_merch(p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_final_x, p_pog_index);
        var item_depth_arr = [],
            item_height_arr = [],
            item_width_arr = [],
            item_index_arr = [];
        var drag_item_arr = [];
        item_depth_arr.push(wpdSetFixed(p_items.D)); //.toFixed(5))); //ASA-1087, toFixed(4)
        item_height_arr.push(wpdSetFixed(p_items.H)); //.toFixed(5))); //ASA-1087, toFixed(4)
        item_width_arr.push(wpdSetFixed(p_items.W)); //.toFixed(5))); //ASA-1087, toFixed(4)
        item_index_arr.push(p_item_index);
        var item_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
        var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var modules = g_pog_json[p_pog_index].ModuleInfo[p_module_index];
        if (p_check_type == "C") {
            /*if (p_items.CWPerc > 0 || p_items.CHPerc > 0 || p_items.CDPerc > 0) {//ASA-1412
            p_shelfs.AllowAutoCrush = "Y";
            }*/
            if (p_category == "H") {
                //ASA-1412 start
                //Start ASA-1412 issue 1 20240628
                var return_val = "N";
                var l_cap_max_merch = get_cap_max_merch(p_module_index, p_shelf_index, modules, shelfs, p_pog_index, g_dft_max_merch);
                if ((item_dtl.CapStyle == "1" || item_dtl.CapStyle == "2" || item_dtl.CapStyle == "3") && l_cap_max_merch < item_dtl.H) {
                    var return_val = await set_item_capping(p_pog_index, p_module_index, p_shelf_index, p_item_index, "N", p_check_ind == "Y" ? "N" : "Y"); //ASA-1410 issue 10 20240625//ASA-1412 issue 1 20240628
                }
                //ASA-1412 End
                if (return_val == "N") {
                    var crush_height = p_items.CrushVert > 0 ? p_items.CrushVert : p_items.CHPerc;
                    var new_crush_perc = 0;
                    var new_height = 0;
                    for (i = 1; i < crush_height; i++) {
                        new_height = p_items.H - (p_items.H * i) / 100;
                        if (l_max_merch >= new_height) {
                            new_crush_perc = i;
                            break;
                        }
                    }

                    if (new_crush_perc > 0) {
                        if (p_check_ind == "Y") {
                            return_val = "Y";
                        } else {
                            item_dtl.H = new_height;
                            item_dtl.RH = new_height;
                            var [itemx, itemy] = get_item_xy(p_shelfs, p_items, p_items.W, p_items.H, p_pog_index);
                            item_dtl.Y = itemy;
                            item_dtl.HChanged = "Y";
                        }
                    } else {
                        if (p_check_ind == "Y") {
                            return_val = "N";
                        }
                    }
                }
                return return_val;
                //END ASA-1412 issue 1 20240628
            } else if (p_category == "W") {
                if (validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, p_shelfs.ObjType, p_module_index, p_shelf_index, p_item_index, "N", 0, 0, 0, p_items.X, "N", "N", "N", "N", "Y", drag_item_arr, "Y", "Y", "N", p_pog_index)) {
                    if (p_check_ind == "Y") {
                        $.each(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo, function (i, fitems) {
                            fitems.W = fitems.RW;
                        });
                        return "Y";
                    } else { }
                } else {
                    if (p_check_ind == "Y") {
                        return "N";
                    }
                }
            } else if (p_category == "D") {
                if (validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, p_shelfs.ObjType, p_module_index, p_shelf_index, p_item_index, "N", 0, 0, 0, p_items.X, "N", "N", "N", "N", "Y", drag_item_arr, "Y", "N", "Y", p_pog_index)) {
                    if (p_check_ind == "Y") {
                        $.each(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo, function (i, fitems) {
                            fitems.D = fitems.RD;
                        });
                        return "Y";
                    } else { }
                } else {
                    if (p_check_ind == "Y") {
                        return "N";
                    }
                }
            }
        } else if (p_check_type == "F") {
            if (p_category == "H") {
                if (p_items.BVert > 1) {
                    var vert_facing = 0;
                    vert_facing = Math.floor((l_max_merch * 100) / ((p_items.RH / p_items.BVert) * 100));
                    if (vert_facing == 0 || vert_facing < 0) {
                        vert_facing = 1;
                    }
                    var l_max_facing = nvl(p_items.MPogVertFacings) > 0 ? p_items.MPogVertFacings : p_items.MVertFacings; //ASA-1408
                    vert_facing = l_max_facing < vert_facing && l_max_facing > -1 ? l_max_facing : vert_facing; //ASA-874, //ASA-1408

                    new_height = (p_items.RH / p_items.BVert) * vert_facing;
                    if (new_height > l_max_merch) {
                        if (p_check_ind == "Y") {
                            return "N";
                        }
                    } else {
                        if (p_check_ind == "Y") {
                            return "Y";
                        } else {
                            item_dtl.H = new_height;
                            item_dtl.RH = new_height;
                            item_dtl.BVert = vert_facing;
                            item_dtl.Y = p_shelfs.Y + p_shelfs.H / 2 + new_height / 2;
                        }
                    }
                } else {
                    if (p_check_ind == "Y") {
                        return "N";
                    }
                }
            } else if (p_category == "W") {
                if (p_items.BVert > 1) {
                    var available_space = p_items.AvlSpace;
                    var horiz_facing = 1;
                    if (p_shelfs.ObjType == "PEGBOARD") {
                        var horiz_gap = p_shelfs.VertiSpacing;
                    } else {
                        var horiz_gap = p_shelfs.HorizGap;
                    }
                    horiz_facing = Math.floor((available_space * 100) / ((p_items.RW / p_items.BHoriz) * 100));
                    horiz_facing = horiz_facing == 0 || horiz_facing < 0 ? 1 : horiz_facing;

                    var new_width = 0;
                    // new_width = parseFloat(((p_items.RW / p_items.BHoriz) * horiz_facing + horiz_gap * (parseFloat(item_width_arr.length) - 1)).toFixed(3));
                    new_width = wpdSetFixed((p_items.RW / p_items.BHoriz) * horiz_facing + horiz_gap * (item_width_arr.length - 1));

                    if (available_space < new_width) {
                        if (p_check_ind == "Y") {
                            return "N";
                        }
                    } else {
                        if (p_check_ind == "Y") {
                            return "Y";
                        } else {
                            item_dtl.W = new_width;
                            item_dtl.RW = new_width;
                            item_dtl.BHoriz = horiz_facing;
                            item_dtl.X = get_item_xaxis(new_width, p_items.H, p_items.D, p_shelfs.ObjType, -1, horiz_gap, p_shelfs.SpreadItem, horiz_gap, p_module_index, p_shelf_index, p_item_index, "Y", p_shelfs.ItemInfo.length, "N", p_pog_index);
                        }
                    }
                }
            } else if (p_category == "D") {
                await maximizeItemDepthFacings("D", p_module_index, p_shelf_index, p_item_index, p_pog_index); //ASA-1412 issue 14 20240709
                /*var depth_facing = 1;
                depth_facing = Math.floor((p_shelfs.D * 100) / ((p_items.RD / p_items.BaseD) * 100));
                depth_facing = depth_facing == 0 || depth_facing < 0 ? 1 : depth_facing;
                var l_dfacing = nvl(p_items.MPogDepthFacings) > 0 ? p_items.MPogDepthFacings : p_items.MDepthFacings;//ASA-1408
                depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874,//ASA-1408

                var new_depth = 0;
                new_depth = (p_items.RD / p_items.BaseD) * depth_facing;

                if (p_shelfs.D < new_depth) {
                if (p_check_ind == "Y") {
                return "N";
                }
                } else {
                if (p_check_ind == "Y") {
                return "Y";
                } else {
                item_dtl.D = new_depth;
                item_dtl.RD = new_depth;
                item_dtl.BaseD = depth_facing;
                }
                }*/
            }
        }
        logDebug("function : check_crush_facing_correct", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function fixel_merch() {
    logDebug("function : fixel_merch", "S");
    var show_merch = "N";
    var originalCanvas = g_pog_index;
    if (g_show_max_merch == "N") {
        g_show_max_merch = "Y";
        $(".fixel_merch").addClass("max_merch_active");
    } else {
        g_show_max_merch = "N";
        $(".fixel_merch").removeClass("max_merch_active");
    }
    if (g_all_pog_flag == "N") {
        await add_merch(g_show_max_merch, g_pog_index);
    } else {
        var i = 0;
        for (pogJson of g_pog_json) {
            if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                g_renderer = g_scene_objects[i].renderer;
                g_scene = g_scene_objects[i].scene;
                g_camera = g_scene_objects[i].scene.children[0];
                await add_merch(g_show_max_merch, i);
                set_indicator_objects(i);
            }
            i++;
        }
        g_renderer = g_scene_objects[originalCanvas].renderer;
        g_scene = g_scene_objects[originalCanvas].scene;
        g_camera = g_scene_objects[originalCanvas].scene.children[0];
    }
    logDebug("function : fixel_merch", "E");
}

//this function is called when compare view, where we can see different sides of the same POG. LEFT, RIGHT, TOP, BOTTOM, BACK,
async function create_side(p_view_ind, p_pog_index, p_com_view_index) {
    logDebug("function : create_side; view_ind : " + p_view_ind, "S");
    try {
        return new Promise(function (resolve, reject) {
            g_pog_json[p_com_view_index] = JSON.parse(JSON.stringify(g_pog_json[p_pog_index]));
            g_pog_json[p_com_view_index].POGCode = g_pog_json[p_com_view_index].POGCode + "-" + p_view_ind;
            if (p_view_ind == "BACK") {
                var returnval = back_side("Y", p_pog_index, p_com_view_index);
            } else {
                var width = (height = depth = baseheight = x = y = z = 0);
                var mod_created = "N";
                var l_pogjson_arr = g_pog_json;
                g_compare_pog_flag = "Y";
                min_x = max_x = min_y = max_y = 0;
                var module_details = l_pogjson_arr[p_pog_index].ModuleInfo;
                if (l_pogjson_arr[p_pog_index].BaseH > 0) {
                    if (p_view_ind == "LEFT" || p_view_ind == "RIGHT") {
                        width = l_pogjson_arr[p_pog_index].BaseD;
                        height = l_pogjson_arr[p_pog_index].BaseH;
                        max_y = height;
                        depth = 0.001;
                    } else if (p_view_ind == "TOP") {
                        width = l_pogjson_arr[p_pog_index].BaseW;
                        height = l_pogjson_arr[p_pog_index].BaseD;
                        max_y = height;
                        depth = 0.001;
                    }

                    if (p_view_ind == "LEFT") {
                        x = l_pogjson_arr[p_pog_index].BaseD / 2;
                    } else if (p_view_ind == "RIGHT") {
                        x = - (l_pogjson_arr[p_pog_index].BaseD / 2) + l_pogjson_arr[p_pog_index].BackDepth;
                    } else if (p_view_ind == "TOP") {
                        x = l_pogjson_arr[p_pog_index].BaseX;
                    }
                    if (p_view_ind == "LEFT" || p_view_ind == "RIGHT") {
                        y = l_pogjson_arr[p_pog_index].BaseH / 2;
                    } else if (p_view_ind == "TOP" || p_view_ind == "BOTTOM") {
                        y = - (height / 2);
                    }
                    z = 0;
                    var colorValue = parseInt(l_pogjson_arr[p_pog_index].Color.replace("#", "0x"), 16);
                    var hex_decimal = new THREE.Color(colorValue);
                    var returnval = add_objects("pog_base", width, height, depth, hex_decimal, x, y, z, g_scene_objects[p_com_view_index].scene.children[2], 0, 0, "N", "", "", "", p_pog_index);
                    console.log("returnval", returnval, "pog_base", width, height, depth, hex_decimal, x, y, z, g_scene_objects[p_com_view_index].scene.children[2], 0, 0, "N", "", "", "", p_pog_index);
                    g_pog_json[p_pog_index].CompBaseObjID = returnval.id;
                    g_pog_json[p_com_view_index].BaseObjID = returnval.id;
                    g_pog_json[p_com_view_index].CompBaseObjID = g_pog_json[p_pog_index].BaseObjID;
                    max_x = width;
                }
                var view_det = -1;
                var temp_z = 0.05;
                var temp_min = 0.05;
                var outsideShelfZ = 0.6;
                $.each(module_details, function (j, Modules) {
                    var max_z = 0;
                    if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                        if (view_det == -1) {
                            view_det = 0;
                        } else {
                            view_det = 1;
                        }
                        if (mod_created == "N") {
                            if (p_view_ind == "LEFT" || p_view_ind == "RIGHT") {
                                width = l_pogjson_arr[p_pog_index].BackDepth;
                                height = Modules.H;
                                depth = 0.001;
                                x = width / 2;
                                y = height / 2 + l_pogjson_arr[p_pog_index].BaseH;
                                mod_created = "Y";
                            } else if (p_view_ind == "TOP" || p_view_ind == "BOTTOM") {
                                width = Modules.W;
                                height = l_pogjson_arr[p_pog_index].BackDepth;
                                depth = 0.001;
                                x = Modules.X;
                                y = 0;
                                mod_created = "N";
                            }
                            z = 0;
                            var colorValue = parseInt(Modules.Color.replace("#", "0x"), 16);
                            var hex_decimal = new THREE.Color(colorValue);
                            min_x = Math.min(min_x, x - width / 2);
                            max_x = Math.max(max_x, x + width / 2);
                            min_y = Math.min(min_y, y - height / 2);
                            max_y = Math.max(max_y, y + height / 2);

                            var returnval = add_objects(Modules.Module, width, height, depth, hex_decimal, x, y, z, g_scene_objects[p_com_view_index].scene.children[2], 0, 0, "N", "", "", "", p_pog_index);
                            g_pog_json[p_pog_index].ModuleInfo[j].CompMObjID = returnval.id;
                            g_pog_json[p_com_view_index].ModuleInfo[j].MObjID = returnval.id;
                            g_pog_json[p_com_view_index].ModuleInfo[j].CompMObjID = g_pog_json[p_pog_index].ModuleInfo[j].MObjID;
                        }
                        $.each(Modules.ShelfInfo, function (k, Shelf) {
                            if (typeof Shelf !== "undefined") {
                                if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE") {
                                    if (p_view_ind == "LEFT" || p_view_ind == "RIGHT") {
                                        width = Shelf.D;
                                        height = Shelf.H;
                                        y = Shelf.Y;
                                        if (p_view_ind == "LEFT") {
                                            if (Shelf.X < 0) {
                                                z = outsideShelfZ - 0.0001;
                                                outsideShelfZ -= 0.0001;
                                            } else {
                                                z = temp_z - 0.0001;
                                                temp_z -= 0.0001;
                                            }
                                        } else {
                                            z = temp_min + 0.0001;
                                            temp_min += 0.0001;
                                        }
                                    } else if (p_view_ind == "TOP" || p_view_ind == "BOTTOM") {
                                        width = Shelf.W;
                                        height = Shelf.D;
                                        y = - (Shelf.Z + l_pogjson_arr[p_pog_index].BackDepth / 2);
                                        if (p_view_ind == "BOTTOM") {
                                            z = temp_min;
                                            temp_min -= 0.0001;
                                        } else {
                                            z = temp_min + 0.0001;
                                            temp_min += 0.0001;
                                        }
                                    }
                                    depth = 0.001;
                                    var colorValue = parseInt(Shelf.Color.replace("#", "0x"), 16);
                                    var hex_decimal = new THREE.Color(colorValue);

                                    if (p_view_ind == "LEFT") {
                                        x = Shelf.Z;
                                        var shelf_end = x + width / 2;
                                        var shelf_start = x - width / 2;
                                    } else if (p_view_ind == "RIGHT") {
                                        x = -Shelf.Z + l_pogjson_arr[p_pog_index].BackDepth;
                                        var shelf_end = x - width / 2;
                                        var shelf_start = x + width / 2;
                                    } else if (p_view_ind == "TOP" || p_view_ind == "BOTTOM") {
                                        x = Shelf.X;
                                        var shelf_end = y - height / 2;
                                        var shelf_start = y + height / 2;
                                    }
                                    var returnval = add_objects(Shelf.Shelf, width, height, depth, hex_decimal, x, y, z, g_scene_objects[p_com_view_index].scene.children[2], Shelf.Rotation, Shelf.Slope, Shelf.Rotation !== 0 || Shelf.Slope !== 0 ? "Y" : "N", "", "", "", p_pog_index);
                                    g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].CompShelfObjID = returnval.id;
                                    g_pog_json[p_com_view_index].ModuleInfo[j].ShelfInfo[k].SObjID = returnval.id;
                                    g_pog_json[p_com_view_index].ModuleInfo[j].ShelfInfo[k].CompShelfObjID = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].SObjID;

                                    min_x = Math.min(min_x, x - width / 2);
                                    max_x = Math.max(max_x, x + width / 2);
                                    min_y = Math.min(min_y, y - height / 2);
                                    max_y = Math.max(max_y, y + height / 2);
                                }
                                if (Shelf.ItemInfo.length > 0) {
                                    var prev_x = (prev_width = prev_y = prev_height = -1),
                                        new_depth = 0,
                                        l_cal_item_cnt = 0,
                                        l_originaldepth = 0,
                                        l_total_item_dept = 0;

                                    if (Shelf.ObjType == "ROD") {
                                        $.each(Shelf.ItemInfo, function (l, items) {
                                            if (Shelf.DGap == 0 && Shelf.SpreadItem == "E") {
                                                if (items.BaseD > 1) {
                                                    new_depth = items.OD * items.BaseD;
                                                }
                                            } else if (Shelf.DGap > 0 && Shelf.SpreadItem == "E") {
                                                if (items.BaseD > 1) {
                                                    new_depth = items.D + Shelf.DGap * (items.BaseD - 1);
                                                }
                                            }
                                            l_total_item_dept = l_total_item_dept + new_depth;
                                            if (Shelf.SpreadItem == "F") {
                                                l_originaldepth = l_originaldepth + items.OD * items.BaseD;
                                                l_cal_item_cnt = l_cal_item_cnt + items.BaseD;
                                            }
                                        });
                                    }

                                    $.each(Shelf.ItemInfo, function (l, items) {
                                        var l_item_count = Shelf.ItemInfo.length;
                                        var shelf_depthgap = 0;

                                        if (Shelf.ObjType == "ROD") {
                                            if (Shelf.DGap == 0 && Shelf.SpreadItem == "E") {
                                                new_depth = items.OD * items.BaseD;
                                            } else if (Shelf.DGap > 0 && Shelf.SpreadItem == "E") {
                                                new_depth = items.D + Shelf.DGap * (items.BaseD - 1);
                                            } else {
                                                new_depth = items.D;
                                            }

                                            if (Shelf.SpreadItem == "E") {
                                                shelf_depthgap = (Shelf.D - l_total_item_dept) / (l_item_count - 1);
                                            } else if (Shelf.SpreadItem == "F") {
                                                shelf_depthgap = (Shelf.D - l_originaldepth) / (l_cal_item_cnt - 1);
                                                new_depth = items.D + shelf_depthgap * (items.BaseD - 1);
                                            }
                                        } else {
                                            new_depth = items.D;
                                        }
                                        if (p_view_ind == "LEFT" || p_view_ind == "RIGHT") {
                                            width = new_depth;
                                            height = items.H;
                                            y = items.Y;
                                            // z = items.Z;

                                            if (p_view_ind == "LEFT") {
                                                if (Shelf.X < 0) {
                                                    z = outsideShelfZ - 0.0001;
                                                    outsideShelfZ -= 0.0001;
                                                } else {
                                                    z = temp_z - 0.0001;
                                                    temp_z -= 0.0001;
                                                }
                                            } else {
                                                z = temp_min + 0.0001;
                                                temp_min += 0.0001;
                                            }
                                        } else if (p_view_ind == "TOP" || p_view_ind == "BOTTOM") {
                                            width = items.W;
                                            height = new_depth;
                                            x = items.X;
                                            if (p_view_ind == "BOTTOM") {
                                                z = temp_min - 0.0001;
                                                temp_min -= 0.0001;
                                            } else {
                                                z = temp_min + 0.0001;
                                                temp_min += 0.0001;
                                            }
                                        }
                                        depth = 0.001;
                                        var colorValue = parseInt(items.Color.replace("#", "0x"), 16);
                                        var hex_decimal = new THREE.Color(colorValue);
                                        if (p_view_ind == "LEFT") {
                                            if (Shelf.ObjType == "PEGBOARD" || Shelf.ObjType == "HANGINGBAR" || (Shelf.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                                x = shelf_end + width / 2;
                                            } else if (Shelf.ObjType == "ROD") {
                                                if (Shelf.SpreadItem != "FR") {
                                                    if (l == 0) {
                                                        x = l_pogjson_arr[p_pog_index].BackDepth + new_depth / 2;
                                                    } else {
                                                        x = prev_x + prev_width / 2 + new_depth / 2 + shelf_depthgap;
                                                    }
                                                } else {
                                                    if (l == 0) {
                                                        x = l_pogjson_arr[p_pog_index].BackDepth + Shelf.D - new_depth / 2;
                                                    } else {
                                                        x = prev_x - prev_width / 2 - new_depth / 2 + shelf_depthgap;
                                                    }
                                                }
                                                prev_x = x;
                                                prev_width = width;
                                            } else {
                                                x = shelf_end - width / 2;
                                            }
                                        } else if (p_view_ind == "RIGHT") {
                                            if (Shelf.ObjType == "PEGBOARD" || Shelf.ObjType == "HANGINGBAR" || (Shelf.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                                x = shelf_end - width / 2;
                                            } else if (Shelf.ObjType == "ROD") {
                                                if (Shelf.SpreadItem != "FR") {
                                                    if (l == 0) {
                                                        x = shelf_start - width / 2;
                                                    } else {
                                                        x = prev_x - prev_width / 2 - width / 2 - shelf_depthgap;
                                                    }
                                                } else {
                                                    if (l == 0) {
                                                        x = shelf_end + width / 2;
                                                    } else {
                                                        x = prev_x + prev_width / 2 + width / 2 + shelf_depthgap;
                                                    }
                                                }
                                                prev_x = x;
                                                prev_width = width;
                                            } else {
                                                x = shelf_end + width / 2;
                                            }
                                        } else if (p_view_ind == "TOP" || p_view_ind == "BOTTOM") {
                                            if (Shelf.ObjType == "PEGBOARD" || Shelf.ObjType == "HANGINGBAR" || (Shelf.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                                y = shelf_end - height / 2;
                                            } else if (Shelf.ObjType == "ROD") {
                                                if (Shelf.SpreadItem != "FR") {
                                                    if (l == 0) {
                                                        y = - (l_pogjson_arr[p_pog_index].BackDepth + height / 2);
                                                    } else {
                                                        y = prev_y - prev_height / 2 - height / 2 - shelf_depthgap;
                                                    }
                                                } else {
                                                    if (l == 0) {
                                                        y = - (l_pogjson_arr[p_pog_index].BackDepth + Shelf.D - height / 2);
                                                    } else {
                                                        y = prev_y + prev_height / 2 + height / 2 - shelf_depthgap;
                                                    }
                                                }
                                                prev_x = x;
                                                prev_y = y;
                                                prev_width = width;
                                                prev_height = height;
                                            } else {
                                                if (Shelf.ObjType == "PALLET") {
                                                    y = - (l_pogjson_arr[p_pog_index].BackDepth + Shelf.D - items.Z);
                                                } else {
                                                    y = shelf_end + height / 2;
                                                }
                                            }
                                        }
                                        var returnval = add_objects(items.Item, width, height, depth, hex_decimal, x, y, z, g_scene_objects[p_com_view_index].scene.children[2], 0, 0, Shelf.Rotation !== 0 || Shelf.Slope !== 0 ? "Y" : "N", "", "", "", p_pog_index);
                                        returnval.ItemID = items.Item;
                                        returnval.Description = items.Desc;
                                        returnval.HorizFacing = items.BHoriz;
                                        returnval.VertFacing = items.BVert;
                                        returnval.DimUpdate = items.DimUpdate;
                                        returnval.SellingPrice = items.SellingPrice;
                                        returnval.SalesUnit = items.SalesUnit;
                                        returnval.NetSales = items.NetSales;
                                        returnval.GrossProfit = items.GrossProfit;
                                        returnval.CogsAdj = items.CogsAdj;
                                        returnval.RegMovement = items.RegMovement;
                                        returnval.AvgSales = items.AvgSales;
                                        returnval.ItemStatus = items.ItemStatus;
                                        returnval.CDTLvl1 = items.CDTLvl1; //ASA-1130
                                        returnval.CDTLvl2 = items.CDTLvl2; //ASA-1130
                                        returnval.CDTLvl3 = items.CDTLvl3; //ASA-1130
                                        returnval.StoreCnt = items.StoreCnt;
                                        returnval.WeeksOfInventory = items.WeeksOfInventory;
                                        returnval.WeeksCount = items.WeeksCount;
                                        returnval.MovingItem = items.MovingItem;
                                        returnval.Profit = items.Profit;
                                        returnval.TotalMargin = items.TotalMargin;
                                        returnval.Status = items.Status;
                                        returnval.DescSecond = items.DescSecond;
                                        //Start Task_26605
                                        returnval.DFacing = items.BaseD;
                                        returnval.ActualDPP = items.ActualDPP;
                                        returnval.StoreSOH = items.StoreSOH;
                                        returnval.DPPLoc = items.DPPLoc;
                                        returnval.StoreNo = items.StoreNo;
                                        returnval.W = items.W;
                                        returnval.H = items.H;
                                        returnval.D = items.D;
                                        returnval.Color = items.Color;
                                        returnval.Barcode = items.Barcode;
                                        returnval.Desc = items.Desc;
                                        returnval.Brand = items.Brand;
                                        returnval.BrandType = items.BrandType;
                                        returnval.Group = items.Group;
                                        returnval.Dept = items.Dept;
                                        returnval.Class = items.Class;
                                        returnval.SubClass = items.SubClass;
                                        returnval.StdUOM = items.StdUOM;
                                        returnval.SizeDesc = items.SizeDesc;
                                        returnval.Supplier = items.Supplier;
                                        returnval.SupplierName = items.SupplierName;
                                        returnval.LocID = items.LocID;
                                        returnval.ItemDim = (items.OW * 100).toFixed(2) + " : " + (items.OH * 100).toFixed(2) + " : " + (items.OD * 100).toFixed(2);
                                        returnval.OrientationDesc = items.OrientationDesc;
                                        returnval.Orientation = items.Orientation;
                                        returnval.StoreCnt = items.StoreCnt;
                                        returnval.OW = items.OW * 100;
                                        returnval.OH = items.OH * 100;
                                        returnval.OD = items.OD * 100;
                                        returnval.Shelf = Shelf.Shelf;
                                        returnval.Rotation = 0;
                                        returnval.ItemSlope = 0;
                                        returnval.ImageExists = "N";
                                        returnval.UnitperCase = items.UnitperCase;
                                        returnval.UnitperTray = items.UnitperTray;
                                        returnval.DfacingUpd = items.DfacingUpd;
                                        returnval.ItmDescChi = items.ItmDescChi;
                                        returnval.ItmDescEng = items.ItmDescEng;
                                        returnval.TotalUnitsCalc = items.BHoriz * items.BVert * items.BaseD;
                                        returnval.PkSiz = items.PkSiz;
                                        returnval.CapFacing = items.CapFacing;
                                        returnval.CapDepth = items.CapDepth;
                                        returnval.CapHorz = items.CapHorz;
                                        var cap_capacity = items.CapFacing * items.CapDepth * items.CapHorz;
                                        returnval.Cpct = items.BHoriz * items.BVert * items.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0);
                                        returnval.Brand_Category = items.Brand_Category;
                                        returnval.Uda_item_status = items.Uda_item_status;
                                        returnval.Gobecobrand = items.Gobecobrand;
                                        returnval.Internet = items.Internet;
                                        returnval.GoGreen = items.GoGreen;
                                        returnval.Categ = items.Categ;
                                        returnval.ItemSize = items.ItemSize;
                                        returnval.SplrLbl = items.SplrLbl;
                                        returnval.COO = items.COO;
                                        returnval.EDLP = items.EDLP;
                                        returnval.LoGrp = items.LoGrp;
                                        returnval.SqzPer = (typeof items.CrushHoriz !== "undefined" ? items.CrushHoriz : 0) + ":" + (typeof items.CrushVert !== "undefined" ? items.CrushVert : 0) + ":" + (typeof items.CrushD !== "undefined" ? items.CrushD : 0);
                                        returnval.InternationalRng = items.InternationalRng;
                                        returnval.NewItem = items.NewItem;
                                        returnval.LiveNewItem = items.LiveNewItem;
                                        returnval.DaysOfSupply = items.DaysOfSupply;
                                        returnval.CapDepthChanged = items.CapDepthChanged;
                                        returnval.MassCrushH = items.MassCrushH;
                                        returnval.MassCrushV = items.MassCrushV;
                                        returnval.MassCrushD = items.MassCrushD;
                                        //ASA-2013 Start
                                        returnval.ShelfPrice = items.ShelfPrice;
                                        returnval.PromoPrice = items.PromoPrice;
                                        returnval.DiscountRate = items.DiscountRate;
                                        returnval.PriceChangeDate = items.PriceChangeDate;
                                        returnval.WeeksOfInventory = items.WeeksOfInventory;
                                        returnval.Qty = items.Qty;
                                        returnval.WhStock = items.WhStock;
                                        returnval.StoreStock = items.StoreStock;
                                        returnval.StockIntransit = items.StockIntransit;
                                        //ASA-2013 End
                                        //ASA-1640 Start
                                        returnval.ItemCondition = items.ItemCondition;
                                        returnval.AUR = items.AUR;
                                        returnval.ItemRanking = items.ItemRanking;
                                        returnval.WeeklySales = items.WeeklySales;
                                        returnval.WeeklyNetMargin = items.WeeklyNetMargin;
                                        returnval.WeeklyQty = items.WeeklyQty;
                                        returnval.NetMarginPercent = items.NetMarginPercent;
                                        returnval.CumulativeNM = items.CumulativeNM;
                                        returnval.TOP80B2 = items.TOP80B2;
                                        returnval.ItemBrandC = items.ItemBrandC;
                                        returnval.ItemPOGDept = items.ItemPOGDept;
                                        returnval.ItemRemark = items.ItemRemark;
                                        returnval.RTVStatus = items.RTVStatus;
                                        returnval.Pusher = items.Pusher;
                                        returnval.Divider = items.Divider;
                                        returnval.BackSupport = items.BackSupport;
                                        //ASA-1640 End
                                        returnval.CWPerc = items.CWPerc; //ASA-1640 #5
                                        returnval.CHPerc = items.CHPerc; //ASA-1640 #5
                                        returnval.CDPerc = items.CDPerc; //ASA-1640 #5
                                        //End Task_26605
                                        returnval.OOSPerc = items.OOSPerc; //ASA-1688 Added for oos%
                                        returnval.InitialItemDesc = items.InitialItemDesc; //ASA-1734 Issue 1
                                        returnval.InitialBrand = items.InitialBrand; //ASA-1787 Request #6
                                        returnval.InitialBarcode = items.InitialBarcode; //ASA-1787 Request #6

                                        min_x = Math.min(min_x, x - width / 2);
                                        max_x = Math.max(max_x, x + width / 2);
                                        min_y = Math.min(min_y, y - height / 2);
                                        max_y = Math.max(max_y, y + height / 2);

                                        g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].CompItemObjID = returnval.id;
                                        g_pog_json[p_com_view_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].ObjID = returnval.id;
                                        g_pog_json[p_com_view_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].CompItemObjID = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].ObjID;
                                        if (items.Item == "DIVIDER") {
                                            var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo;
                                            var div_index = -1;
                                            $.each(shelf_arr, function (m, shelfs) {
                                                if (shelfs.Shelf == items.ItemID && shelfs.ObjType == "DIVIDER") {
                                                    div_index = m;
                                                }
                                            });
                                            g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[div_index].X = x;
                                            g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[div_index].CompShelfDivObjID = returnval.id;
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
                var width = max_x - min_x;
                var height = max_y - min_y;
                var x = min_x + width / 2;
                var y = min_y + height / 2;

                if (p_view_ind == "BOTTOM") {
                    g_scene_objects[p_com_view_index].scene.children[0].position.y = 0;
                    var details = get_min_max_xy(g_pog_index);
                    var details_arr = details.split("###");
                    set_camera_z(g_scene_objects[p_com_view_index].scene.children[0], parseFloat(details_arr[2]), max_y / 2, parseFloat(details_arr[0]), max_y, g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
                    g_pog_json[p_com_view_index].CompCamX = parseFloat(details_arr[2]);
                    g_pog_json[p_com_view_index].CompCamY = max_y / 2;
                    g_pog_json[p_com_view_index].CompCamWidth = parseFloat(details_arr[0]);
                    g_pog_json[p_com_view_index].CompCamHeight = max_y;
                } else {
                    set_camera_z(g_scene_objects[p_com_view_index].scene.children[0], x, y, width, height, g_offset_z, width / 2, height / 2, true, g_pog_index);
                    g_pog_json[p_com_view_index].CompCamX = x;
                    g_pog_json[p_com_view_index].CompCamY = y;
                    g_pog_json[p_com_view_index].CompCamWidth = width;
                    g_pog_json[p_com_view_index].CompCamHeight = height;
                }
            }
            render(p_com_view_index);
            logDebug("function : create_side", "E");
            resolve("SUCESS");
        });
    } catch (err) {
        error_handling(err);
    }
}

//we only use this function to create PREV_VERSION. when same POG other version is opened. this function will compare all the items from
//current and previous version and highlight the different items based on its location change, new item, deleted item
//g_ComViewIndex will be populated with index of g_pog_json where this previous version is created.
async function get_compare_pog(p_compare_ind, p_pog_code, p_pog_version, p_draft_id, p_prev_version, p_compare_pog = "N") {
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

                    //Regression 1 Start 20260119
                    g_scene_objects[g_pog_index].Indicators.LiveImage = "N";
                    var return_val = await recreate_image_items("N", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), g_pog_index, "N", "Y", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                    g_show_live_image = "N";
                    //Regression 1 End 20260119

                    removeLoadingIndicator(regionloadWait);
                    render(g_ComViewIndex);

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
//this function is called from compare_view / close compare. this will remove the compared POG canvas.
async function close_compare() {
    logDebug("function : close_compare", "S");
    if (g_compare_pog_flag == "Y") {
        addLoadingIndicator();
        if (g_compare_view == "PREV_VERSION") {
            var res = await ShowColorBackup(g_pog_index); //ASA-1464 Issue 3

            // var res = await reset_colors("N", g_pog_index);
        }

        if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y") {
            g_pog_json.splice(g_ComViewIndex, 1);
            g_scene_objects.splice(g_ComViewIndex, 1);
            g_canvas_objects.splice(g_ComViewIndex, 1);
        }
        var POG_JSON = JSON.parse(JSON.stringify(g_pog_json));

        appendMultiCanvasRowCol(POG_JSON.length, $v("P25_POGCR_TILE_VIEW"));
        modifyWindowAfterMinMax(g_scene_objects);
        g_pog_index = 0;
        add_pog_code_header();

        removeLoadingIndicator(regionloadWait);
        g_pog_json = POG_JSON;
        g_compare_view = "NONE";
        g_compare_pog_flag = "N";
        g_curr_canvas = 1;
        g_edit_pallet_mod_ind = -1;
        g_edit_pallet_shelf_ind = -1;
        g_ComViewIndex = -1;
        g_ComBaseIndex = -1;
        g_comp_view_code = "";
        g_comp_base_code = "";

        /* ASA-1085, x13 Start*/
        g_canvas = $(".canvas-content [data-indx=" + g_pog_index + "]")[0];
        set_select_canvas(g_pog_index);
        /* ASA-1085, x13 End*/
    }
    logDebug("function : close_compare", "E");
}

//this function is called from create_side, it will generate a new canvas an create a POG as per view (LEFT,RIGHT,TOP,BOTTOM,BACK,CUTAWAY)
async function create_side_view(p_view_ind) {
    logDebug("function : create_side_view; view_ind : " + p_view_ind, "S");
    g_compare_view = p_view_ind;
    if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y") {
        g_pog_json.splice(g_ComViewIndex, 1);
        g_scene_objects.splice(g_ComViewIndex, 1);
        g_canvas_objects.splice(g_ComViewIndex, 1);
    }
    var old_pog_index = g_pog_index;
    console.log("view_ind", p_view_ind, g_multiselect);
    var p_pog_index = g_pog_index;

    if (p_view_ind !== "CUTAWAY") {
        var new_pog_json = JSON.parse(JSON.stringify(g_pog_json[g_pog_index]));
        new_pog_json.POGCode = new_pog_json.POGCode + "-" + p_view_ind;

        g_comp_view_code = new_pog_json.POGCode;
        g_comp_base_code = g_pog_json[g_pog_index].POGCode;

        g_pog_json.push(new_pog_json);
        g_ComViewIndex = g_pog_json.length - 1;
        g_ComBaseIndex = old_pog_index;

        var POG_JSON = JSON.parse(JSON.stringify(g_pog_json));

        appendMultiCanvasRowCol(g_pog_json.length, $v("P25_POGCR_TILE_VIEW"));
        init(g_pog_json.length - 1);
        var objects = {};
        objects["scene"] = g_scene;
        objects["renderer"] = g_renderer;
        g_scene_objects.push(objects);
        modifyWindowAfterMinMax(g_scene_objects);
        g_pog_index = old_pog_index;
    }

    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
        $(".top_icon").removeClass("active");
        $(".left_icon").removeClass("active");
        if (p_view_ind == "LEFT") {
            $(".left_view").addClass("active");
        } else if (p_view_ind == "RIGHT") {
            $(".right_view").addClass("active");
        } else if (p_view_ind == "TOP") {
            $(".top_view").addClass("active");
        } else if (p_view_ind == "BOTTOM") {
            $(".bottom_view").addClass("active");
        } else if (p_view_ind == "BACK") {
            $(".back_view").addClass("active");
        } else if (p_view_ind == "CUTAWAY") {
            $(".cutaway_view").addClass("active");
        }

        console.log("view_ind", p_view_ind, g_multiselect);
        //cutaway is the part of the POG which user use multi select box by dragging and select and then click CUTAWAY from compare view. the selected part will be
        //shown in a new canvas.
        if (p_view_ind == "CUTAWAY") {
            if (g_multiselect == "Y") {
                addLoadingIndicator();
                g_compare_pog_flag = "Y";
                var temp_pog = JSON.parse(JSON.stringify(g_pog_json[g_pog_index]));
                temp_pog.POGCode = "CUTAWAY-" + g_pog_json[g_pog_index].POGCode;
                g_pog_json.push(temp_pog);
                var l_pog_json_data = JSON.parse(JSON.stringify(g_pog_json));
                l_pog_json_data.POGCode = l_pog_json_data.POGCode + "-" + p_view_ind;
                g_ComViewIndex = g_pog_json.length - 1;
                g_ComBaseIndex = g_pog_index;
                appendMultiCanvasRowCol(g_pog_json.length, $v("P25_POGCR_TILE_VIEW"));
                init(g_pog_json.length - 1);
                var objects = {};
                objects["scene"] = g_scene;
                objects["renderer"] = g_renderer;
                g_scene_objects.push(objects);
                set_indicator_objects(g_ComViewIndex);
                modifyWindowAfterMinMax(g_scene_objects);

                var POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
                POG_JSON.POGCode = POG_JSON.POGCode + "-" + p_view_ind;
                g_world = g_scene_objects[g_ComViewIndex].scene.children[2];
                g_camera = g_scene_objects[g_ComViewIndex].scene.children[0];
                var return_val = await create_module_from_json(POG_JSON, "Y", "F", $v("P25_PRODUCT_BTN_CLICK"), "N", "N", "N", "Y", "Y", "", "N", g_scene_objects[g_ComViewIndex].scene.children[0], g_scene_objects[g_ComViewIndex].scene, g_ComViewIndex, g_ComViewIndex);
                g_multiselect = "Y";
                render(g_ComViewIndex);
                select_zoom(g_scene_objects[g_ComViewIndex].scene.children[0], g_ComViewIndex);

                g_pog_index = old_pog_index;
                var retval = await render_all_pog();
                removeLoadingIndicator(regionloadWait);
                //ASA-1085, x14 End
            }
        } else {
            addLoadingIndicator();
            g_compare_pog_flag = "Y";
            console.log("height", g_pog_json[p_pog_index].H);
            if (g_pog_json[p_pog_index].H < 0.2) {
                var returnval = await create_compare_pog(p_view_ind);
            } else {
                var returnval = await create_side(p_view_ind, p_pog_index, g_ComViewIndex);
                g_scene_objects[g_ComViewIndex].scene.children[0].updateProjectionMatrix();
            }
            var retval = await render_all_pog();
            removeLoadingIndicator(regionloadWait);
        }
        add_pog_code_header();

        /* ASA-1085, x13 Start*/
        g_canvas = $(".canvas-content [data-indx=" + g_pog_index + "]")[0];
        set_select_canvas(g_pog_index);
        /* ASA-1085, x13 End*/

        $(".fixel_merch").removeClass("max_merch_active");
        $(".fixel_label").removeClass("fixel_label_active");
        $(".item_label").removeClass("item_label_active");
        $(".notch_label").removeClass("notch_label_active");
        $(".item_color").removeClass("item_label_active");
        $(".overhung_shelf").removeClass("overhung_shelf_active");
        g_overhung_shelf_active = "N";
        g_show_fixel_label = "N";
        g_show_item_label = "N";
        g_show_notch_label = "N";
        g_show_max_merch = "N";
    }
    logDebug("function : create_side_view", "E");
}

//this function is used in compare view to add objects in new canvas.
function add_objects(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_world, p_rotation, p_slope, p_shelf_rotate, p_shelf_distance, p_pegx, p_pegy, p_pog_index) {
    logDebug("function : add_objects; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; rotation : " + p_rotation + "; slope : " + p_slope + "; shelf_rotate : " + p_shelf_rotate + "; pegx : " + p_pegx + "; pegy : " + p_pegy, "S");
    object = new THREE.Mesh(
        new THREE.BoxGeometry(p_width, p_height, 0.001),
        new THREE.MeshStandardMaterial({
            color: p_color,
        }));
    var l_wireframe_id = add_wireframe(object, 2);
    object.position.x = p_x;
    object.position.y = p_y;
    object.position.z = p_z;
    object.uuid = p_uuid;
    p_world.add(object);
    object.W = p_width;
    object.H = p_height;
    object.D = p_depth;
    object.Color = p_color;
    object.Rotation = p_rotation;
    object.ItemSlope = p_slope;
    object.Rotation = p_shelf_rotate;
    object.Distance = p_shelf_distance;
    object.PegBoardX = p_pegx;
    object.PegBoardY = p_pegy;
    logDebug("function : add_objects", "E");
    return object;
}

//this function is called from create_side. which will create a new canvas which shows back side of the POG.
async function back_side(p_rotate, p_pog_index, p_comViewIndex) {
    logDebug("function : back_side; rotate : " + p_rotate, "S");
    var l_world_comp = g_scene_objects[p_comViewIndex].scene.children[2];
    var l_camera_comp = g_scene_objects[p_comViewIndex].scene.children[0];
    if (g_pog_json[p_pog_index].BaseH > 0) {
        width = g_pog_json[p_pog_index].BaseW;
        height = g_pog_json[p_pog_index].BaseH;
        max_y = height;
        depth = 0.001;
        x = g_pog_json[p_pog_index].BaseX;
        y = g_pog_json[p_pog_index].BaseY;
        var colorValue = parseInt(g_pog_json[p_pog_index].Color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        var returnval = add_objects("pog_base", width, height, depth, hex_decimal, x, y, 0, l_world_comp, 0, 0, "N", "", "", "", p_pog_index);
        g_pog_json[p_pog_index].CompBaseObjID = returnval.id;
        returnval.position.z = 0;
        returnval.rotateY((180 * Math.PI) / 180);
    }

    $.each(g_pog_json[p_pog_index].ModuleInfo, function (j, Modules) {
        if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
            var colorValue = parseInt(Modules.Color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            var returnval = add_objects(Modules.Module, Modules.W, Modules.H, Modules.D, hex_decimal, Modules.X, Modules.Y, 0, l_world_comp, 0, 0, "N", "", "", "", p_pog_index);
            g_pog_json[p_pog_index].ModuleInfo[j].CompMObjID = returnval.id;
            returnval.position.z = Modules.Z;

            $.each(Modules.ShelfInfo, function (k, Shelf) {
                if (typeof Shelf !== "undefined") {
                    if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE" && Shelf.ObjType !== "DIVIDER") {
                        var colorValue = parseInt(Shelf.Color.replace("#", "0x"), 16);
                        var hex_decimal = new THREE.Color(colorValue);
                        var returnval = add_objects(Shelf.Shelf, Shelf.W, Shelf.H, Shelf.D, hex_decimal, Shelf.X, Shelf.Y, 0, l_world_comp, Shelf.Rotation, Shelf.Slope, Shelf.Rotation !== 0 || Shelf.Slope !== 0 ? "Y" : "N", "", "", "", p_pog_index);
                        g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].CompShelfObjID = returnval.id;
                        returnval.position.z = Shelf.Z;
                    }
                    if (Shelf.ItemInfo.length > 0) {
                        $.each(Shelf.ItemInfo, function (l, items) {
                            var colorValue = parseInt(items.Color.replace("#", "0x"), 16);
                            var hex_decimal = new THREE.Color(colorValue);
                            var returnval = add_objects(items.Item, items.W, items.H, items.Dept, hex_decimal, items.X, items.Y, 0, l_world_comp, 0, 0, Shelf.Rotation !== 0 || Shelf.Slope !== 0 ? "Y" : "N", "", "", "", p_pog_index);
                            g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].CompItemObjID = returnval.id;
                            returnval.ItemID = items.Item;
                            returnval.Description = items.Desc;
                            returnval.HorizFacing = items.BHoriz;
                            returnval.VertFacing = items.BVert;
                            returnval.DimUpdate = items.DimUpdate;
                            returnval.SellingPrice = items.SellingPrice;
                            //ASA-2013 Start
                            returnval.ShelfPrice = items.ShelfPrice;
                            returnval.PromoPrice = items.PromoPrice;
                            returnval.DiscountRate = items.DiscountRate;
                            returnval.PriceChangeDate = items.PriceChangeDate;
                            returnval.WeeksOfInventory = items.WeeksOfInventory;
                            returnval.Qty = items.Qty;
                            returnval.WhStock = items.WhStock;
                            returnval.StoreStock = items.StoreStock;
                            returnval.StockIntransit = items.StockIntransit;
                            //ASA-2013 End
                            returnval.SalesUnit = items.SalesUnit;
                            returnval.NetSales = items.NetSales;
                            returnval.GrossProfit = items.GrossProfit;
                            returnval.CogsAdj = items.CogsAdj;
                            returnval.RegMovement = items.RegMovement;
                            returnval.AvgSales = items.AvgSales;
                            returnval.ItemStatus = items.ItemStatus;
                            returnval.CDTLvl1 = items.CDTLvl1; //ASA-1130
                            returnval.CDTLvl2 = items.CDTLvl2; //ASA-1130
                            returnval.CDTLvl3 = items.CDTLvl3; //ASA-1130
                            returnval.StoreCnt = items.StoreCnt;
                            returnval.WeeksOfInventory = items.WeeksOfInventory;
                            returnval.WeeksCount = items.WeeksCount;
                            returnval.MovingItem = items.MovingItem;
                            returnval.Profit = items.Profit;
                            returnval.TotalMargin = items.TotalMargin;
                            returnval.Status = items.Status;
                            returnval.DescSecond = items.DescSecond;
                            //Start Task_26605
                            returnval.DFacing = items.BaseD;
                            returnval.ActualDPP = items.ActualDPP;
                            returnval.StoreSOH = items.StoreSOH;
                            returnval.DPPLoc = items.DPPLoc;
                            returnval.StoreNo = items.StoreNo;
                            returnval.W = items.W;
                            returnval.H = items.H;
                            returnval.D = items.D;
                            returnval.Color = items.Color;
                            returnval.Barcode = items.Barcode;
                            returnval.Desc = items.Desc;
                            returnval.Brand = items.Brand;
                            returnval.BrandType = items.BrandType;
                            returnval.Group = items.Group;
                            returnval.Dept = items.Dept;
                            returnval.Class = items.Class;
                            returnval.SubClass = items.SubClass;
                            returnval.StdUOM = items.StdUOM;
                            returnval.SizeDesc = items.SizeDesc;
                            returnval.Supplier = items.Supplier;
                            returnval.SupplierName = items.SupplierName;
                            returnval.LocID = items.LocID;
                            returnval.ItemDim = (items.OW * 100).toFixed(2) + " : " + (items.OH * 100).toFixed(2) + " : " + (items.OD * 100).toFixed(2);
                            returnval.OrientationDesc = items.OrientationDesc;
                            returnval.Orientation = items.Orientation;
                            returnval.StoreCnt = items.StoreCnt;
                            returnval.RotationDegree = rotation;
                            returnval.OW = items.OW * 100;
                            returnval.OH = items.OH * 100;
                            returnval.OD = items.OD * 100;
                            returnval.Shelf = shelfdtl.Shelf;
                            returnval.Rotation = 0;
                            returnval.ItemSlope = 0;
                            returnval.RotationFlag = rotation !== 0 || slope !== 0 ? "Y" : "N";
                            returnval.ImageExists = "N";
                            returnval.UnitperCase = items.UnitperCase;
                            returnval.UnitperTray = items.UnitperTray;
                            returnval.DfacingUpd = items.DfacingUpd;
                            returnval.ItmDescChi = items.ItmDescChi;
                            returnval.ItmDescEng = items.ItmDescEng;
                            returnval.TotalUnitsCalc = items.BHoriz * items.BVert * items.BaseD;
                            returnval.PkSiz = items.PkSiz;
                            returnval.CapFacing = items.CapFacing;
                            returnval.CapDepth = items.CapDepth;
                            returnval.CapHorz = items.CapHorz;
                            var cap_capacity = items.CapFacing * items.CapDepth * items.CapHorz;
                            returnval.Cpct = items.BHoriz * items.BVert * items.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0);
                            returnval.Brand_Category = items.Brand_Category;
                            returnval.Uda_item_status = items.Uda_item_status;
                            returnval.Gobecobrand = items.Gobecobrand;
                            returnval.Internet = items.Internet;
                            returnval.GoGreen = items.GoGreen;
                            returnval.Categ = items.Categ;
                            returnval.ItemSize = items.ItemSize;
                            returnval.SplrLbl = items.SplrLbl;
                            returnval.COO = items.COO;
                            returnval.EDLP = items.EDLP;
                            returnval.LoGrp = items.LoGrp;
                            returnval.SqzPer = (typeof items.CrushHoriz !== "undefined" ? items.CrushHoriz : 0) + ":" + (typeof items.CrushVert !== "undefined" ? items.CrushVert : 0) + ":" + (typeof items.CrushD !== "undefined" ? items.CrushD : 0);
                            returnval.InternationalRng = items.InternationalRng;
                            returnval.NewItem = items.NewItem;
                            returnval.LiveNewItem = items.LiveNewItem;
                            returnval.DaysOfSupply = items.DaysOfSupply;
                            returnval.CapDepthChanged = items.CapDepthChanged;
                            returnval.MassCrushH = items.MassCrushH;
                            returnval.MassCrushV = items.MassCrushV;
                            returnval.MassCrushD = items.MassCrushD;
                            //End Task_26605

                            returnval.position.z = items.Z;
                            //ASA-1640 Start
                            returnval.ItemCondition = items.ItemCondition;
                            returnval.AUR = items.AUR;
                            returnval.ItemRanking = items.ItemRanking;
                            returnval.WeeklySales = items.WeeklySales;
                            returnval.WeeklyNetMargin = items.WeeklyNetMargin;
                            returnval.WeeklyQty = items.WeeklyQty;
                            returnval.NetMarginPercent = items.NetMarginPercent;
                            returnval.CumulativeNM = items.CumulativeNM;
                            returnval.TOP80B2 = items.TOP80B2;
                            returnval.ItemBrandC = items.ItemBrandC;
                            returnval.ItemPOGDept = items.ItemPOGDept;
                            returnval.ItemRemark = items.ItemRemark;
                            returnval.RTVStatus = items.RTVStatus;
                            returnval.Pusher = items.Pusher;
                            returnval.Divider = items.Divider;
                            returnval.BackSupport = items.BackSupport;
                            //ASA-1640 End
                            returnval.CWPerc = items.CWPerc; //ASA-1640 #5
                            returnval.CHPerc = items.CHPerc; //ASA-1640 #5
                            returnval.CDPerc = items.CDPerc; //ASA-1640 #5
                            returnval.OOSPerc = items.OOSPerc; //ASA-1688 Added for oos%
                            returnval.InitialItemDesc = items.InitialItemDesc; //ASA-1734 Issue 1
                            returnval.InitialBrand = items.InitialBrand; //ASA-1787 Request #6
                            returnval.InitialBarcode = items.InitialBarcode; //ASA-1787 Request #6

                            if (items.Item == "DIVIDER") {
                                var shelf_arr = g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo;
                                var div_index = -1;
                                $.each(shelf_arr, function (m, shelfs) {
                                    if (shelfs.Shelf == items.ItemID && shelfs.ObjType == "DIVIDER") {
                                        div_index = m;
                                    }
                                });
                                g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[div_index].X = items.X;
                                g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[div_index].CompShelfDivObjID = returnval.id;
                            }
                        });
                    }
                }
            });
        }
    });
    var details = get_min_max_xy(g_pog_index);
    var details_arr = details.split("###");
    if (p_rotate == "Y") {
        l_world_comp.rotateY(Math.PI);
        var new_x = -parseFloat(details_arr[2]);
    } else {
        var new_x = parseFloat(details_arr[2]);
    }

    set_camera_z(l_camera_comp, new_x, parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), false, g_pog_index);

    g_pog_json[p_pog_index].CompCamX = new_x;
    g_pog_json[p_pog_index].CompCamY = parseFloat(details_arr[3]);
    g_pog_json[p_pog_index].CompCamWidth = parseFloat(details_arr[0]);
    g_pog_json[p_pog_index].CompCamHeight = parseFloat(details_arr[1]);
    logDebug("function : back_side", "E");
}

async function create_compare_pog(p_view_ind) {
    logDebug("function : create_compare_pog; view_ind : " + p_view_ind, "S");
    var i = 0;
    var mod_arr = g_pog_json[p_pog_index].ModuleInfo;
    if (g_pog_json[p_pog_index].BaseH > 0) {
        var colorValue = parseInt(g_pog_json[p_pog_index].Color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        var POGBase = new THREE.Mesh(
            new THREE.BoxGeometry(g_pog_json[p_pog_index].BaseW, g_pog_json[p_pog_index].BaseH, 0.001),
            new THREE.MeshStandardMaterial({
                color: hex_decimal,
            }));
        var l_wireframe_id = add_wireframe(POGBase, 2);
        POGBase.position.x = g_pog_json[p_pog_index].BaseX;
        POGBase.position.y = g_pog_json[p_pog_index].BaseY;
        POGBase.position.z = g_pog_json[p_pog_index].BaseZ;
        g_scene_objects[PComViewIndex].scene.children[2].add(POGBase);
    }

    for (const modules of mod_arr) {
        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
            var colorValue = parseInt(modules.Color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            g_module = new THREE.Mesh(
                new THREE.BoxGeometry(modules.W, modules.H, 0.001),
                new THREE.MeshStandardMaterial({
                    color: hex_decimal,
                }));
            if (modules.VertSpacing > 0 || modules.HorzSpacing > 0) {
                var dot_module = add_dots_to_object(width - modules.NotchW * 2, height, 0.0007, modules.VertStart, modules.VertSpacing, modules.HorzStart, modules.HorzSpacing, g_module, "MODULE", "", i, g_peg_holes_active, p_pog_index);

                if (modules.NotchW > 0) {
                    add_notches("MODULE" + edit_module_index + "_NOTCHES", modules.NotchW, modules.H, modules.NotchStart, modules.NotchSpacing, hex_decimal, "N", modules.W, i, dot_module);
                }
                dot_module.position.x = modules.X;
                dot_module.position.y = modules.Y;
                dot_module.position.z = 0;
                dot_module.uuid = modules.Module;
                var l_wireframe_id = add_wireframe(dot_module, 2);
                g_module.WFrameID = l_wireframe_id;
                g_scene_objects[PComViewIndex].scene.children[2].add(dot_module);
            } else {
                if (modules.NotchW > 0) {
                    add_notches("MODULE" + edit_module_index + "_NOTCHES", modules.NotchW, modules.H, modules.NotchStart, modules.NotchSpacing, hex_decimal, "N", modules.W, i, g_module);
                }
                g_module.position.x = modules.X;
                g_module.position.y = modules.Y;
                g_module.position.z = 0;
                g_module.uuid = modules.Module;
                var l_wireframe_id = add_wireframe(g_module, 2);
                g_module.WFrameID = l_wireframe_id;
                g_scene_objects[PComViewIndex].scene.children[2].add(g_module);
            }
            //new_module.position.set(modules.X, modules.Y, 0);
            if (modules.ShelfInfo.length > 0) {
                j = 0;
                for (const shelfs of modules.ShelfInfo) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER") {
                        var colorValue = parseInt(shelfs.Color.replace("#", "0x"), 16);
                        var hex_decimal = new THREE.Color(colorValue);
                        if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                            new_shelf = new THREE.Mesh(
                                new THREE.BoxGeometry(shelfs.W, shelfs.H, shelfs.D),
                                new THREE.MeshStandardMaterial({
                                    color: hex_decimal,
                                }));
                            if (shelfs.Slope > 0) {
                                slope = 0 - shelfs.Slope;
                            } else {
                                slope = -shelfs.Slope;
                            }

                            new_shelf.rotateY((shelfs.Rotation * Math.PI) / 180);
                            if (shelfs.Rotation == 0) {
                                new_shelf.rotateX(((slope / 2) * Math.PI) / 180);
                            } else {
                                new_shelf.rotateX((slope * Math.PI) / 180);
                            }
                            new_shelf.position.set(shelfs.X, shelfs.Y, shelfs.Z);
                        } else {
                            new_shelf = new THREE.Mesh(
                                new THREE.BoxGeometry(shelfs.W, shelfs.H, shelfs.D),
                                new THREE.MeshStandardMaterial({
                                    color: hex_decimal,
                                }));
                            var shelfZ = 0;

                            if (shelfs.ObjType == "TEXTBOX") {
                                shelfZ = 0.0021;
                            } else if (shelfs.ObjType == "PEGBOARD") {
                                shelfZ = 0.003;
                            } else {
                                shelfZ = 0.0005;
                            }
                            new_shelf.position.set(shelfs.X, shelfs.Y, shelfs.Z);
                        }
                        var l_wireframe_id = add_wireframe(new_shelf, 2);
                        new_shelf.WFrameID = l_wireframe_id;

                        g_scene_objects[PComViewIndex].scene.children[2].add(new_shelf);

                        var k = 0;
                        for (const items of shelfs.ItemInfo) {
                            var colorValue = parseInt(items.Color.replace("#", "0x"), 16);
                            var hex_decimal = new THREE.Color(colorValue);
                            if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                                new_item = new THREE.Mesh(
                                    new THREE.BoxGeometry(items.W, items.H, items.D),
                                    new THREE.MeshStandardMaterial({
                                        color: hex_decimal,
                                    }));
                                g_scene_objects[PComViewIndex].scene.updateMatrixWorld();
                                new_item.updateMatrixWorld();
                                var x = items.RotationX;
                                var y = items.RotationY;
                                var z = items.RotationZ;
                                var relativeMeshOffset = new THREE.Vector3(x, y, z);

                                var offsetPosition = relativeMeshOffset.applyMatrix4(new_shelf.matrixWorld);

                                new_item.position.x = offsetPosition.x;
                                new_item.position.y = offsetPosition.y;
                                new_item.position.z = offsetPosition.z;
                                new_item.quaternion.copy(new_shelf.quaternion);
                                new_item.updateMatrix();
                            } else {
                                new_item = new THREE.Mesh(
                                    new THREE.BoxGeometry(items.W, items.H, items.D),
                                    new THREE.MeshStandardMaterial({
                                        color: hex_decimal,
                                    }));
                                new_item.position.set(items.X, items.Y, items.Z);
                            }
                            g_scene_objects[PComViewIndex].scene.children[2].add(new_item);
                            var l_wireframe_id = add_wireframe(new_item, 4);
                            add_item_borders(i, j, k, new_item, items.W, items.H, -1, p_pog_index);
                            k = k + 1;
                        }
                    }
                    j = j + 1;
                }
            }
        }

        i = i + 1;
    }
    //We create the POG and rotate it according to which side user has selected.
    var details = get_min_max_xy(g_pog_index);
    var details_arr = details.split("###");
    set_camera_z(g_scene_objects[PComViewIndex].scene.children[0], parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
    if (p_view_ind == "LEFT") {
        g_scene_objects[PComViewIndex].scene.children[2].rotateY((95 * Math.PI) / 180);
    } else if (p_view_ind == "RIGHT") {
        g_scene_objects[PComViewIndex].scene.children[2].rotateY((275 * Math.PI) / 180);
    } else if (p_view_ind == "TOP") {
        g_scene_objects[PComViewIndex].scene.children[2].rotateX((90 * Math.PI) / 180);
        g_scene_objects[PComViewIndex].scene.children[0].position.y = 0;
    } else if (p_view_ind == "BOTTOM") {
        g_scene_objects[PComViewIndex].scene.children[2].rotateX((270 * Math.PI) / 180);
        g_scene_objects[PComViewIndex].scene.children[0].position.y = 0;
    } else if (p_view_ind == "BACK") {
        g_scene_objects[PComViewIndex].scene.children[2].rotateY((180 * Math.PI) / 180);
        g_scene_objects[PComViewIndex].scene.children[0].position.x = -g_scene_objects[PComViewIndex].scene.children[0].position.x;
    }

    render(g_pog_index);
    logDebug("function : create_compare_pog", "E");
    return "success";
}

function select_zoom_init() {
    logDebug("function : select_zoom_init", "S");
    select_zoom(g_scene_objects[g_pog_index].scene.children[0], g_pog_index);
    g_ctrl_select = "N";
    logDebug("function : select_zoom_init", "E");
}

function select_zoom(p_camera, p_pog_index) {
    logDebug("function : select_zoom", "S");
    var width = (height = x = y = 0);
    try {
        g_cutaway_cam_detail = [];
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

            set_camera_z(p_camera, x, y, width, height, 0, x, y, true, g_pog_index);
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
                    if (g_intersected[i].ImageExists == "Y" && g_show_live_image == "Y") {
                        g_intersected[i].WireframeObj.material.transparent = true;
                        g_intersected[i].WireframeObj.material.opacity = 0.0025;
                    }
                }
                clearInterval(g_myVar);
                g_select_color = 0x000000;
                render(p_pog_index);
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
                                        // if (g_shelf.SObjID == g_select_zoom_arr[i].id) {         //ASA-1538 #1
                                        if (Shelf.SObjID == g_select_zoom_arr[i].id) {
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
                        render(p_pog_index);
                    }
                    var width = maxx - minx;
                    var height = maxy - miny;
                    var x = minx + width / 2;
                    var y = miny + height / 2;
                    set_camera_z(p_camera, x, y, width, height, 0.5, x, y, true, g_pog_index);
                    var details = {};
                    details["x"] = x;
                    details["y"] = y;
                    details["width"] = width;
                    details["height"] = height;
                    details["offset"] = 0.5;
                    g_cutaway_cam_detail.push(details);
                    g_manual_zoom_ind = "Y";
                    g_select_zoom_arr = [];
                    render(p_pog_index);
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
                    set_camera_z(p_camera, x, y, width, height, offset, x, y, true, g_pog_index);
                    var details = {};
                    details["x"] = x;
                    details["y"] = y;
                    details["width"] = width;
                    details["height"] = height;
                    details["offset"] = offset;
                    g_cutaway_cam_detail.push(details);
                    g_manual_zoom_ind = "Y";
                    render(p_pog_index);
                }
            }
        }
    } catch (err) {
        error_handling(err);
    }
    logDebug("function : select_zoom", "E");
}

async function last_action() {
    //ASA-721
    logDebug("function : last_action", "S");
    try {
        if (g_undo_final_obj_arr.length - 1 >= 0) {
            g_undo_details = [];
            g_cut_copy_arr = [];
            g_cut_support_obj_arr = [];
            var l_MultiObjects;

            var lastAction = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1].previousAction;
            l_MultiObjects = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1].g_MultiObjects;
            var hasSupportArr = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1].hasSupportArr;
            g_clearInfoType = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1].clearInfoType;
            if (l_MultiObjects == "Y") {
                g_delete_details = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1][0];
                g_cut_copy_arr = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1][1];
                g_delete_details.multi_delete_shelf_ind = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1].multi_delete_shelf_ind;
                if (hasSupportArr == "Y") {
                    g_cut_support_obj_arr = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1][2][0];
                }
            } else {
                g_undo_details = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1][0];
                g_cut_copy_arr = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1][1];
                if (hasSupportArr == "Y") {
                    g_cut_support_obj_arr = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1][2][0];
                }
            }
            g_undo_final_obj_arr.pop();
        }
        logDebug("function : last_action", "E");
        return lastAction;
    } catch (err) {
        error_handling(err);
    }
}

function redo_drag_log() {
    logDebug("function : redo_drag_log", "S");
    g_redo_all_obj_arr.actionType = g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1].previousAction;
    g_redo_all_obj_arr.push(g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1][0]);
    g_redo_all_obj_arr.push(g_undo_final_obj_arr[g_undo_final_obj_arr.length - 1][1]);
    g_redo_final_obj_arr.push(g_redo_all_obj_arr);
    g_undo_final_obj_arr.pop();
    g_redo_all_obj_arr = [];
    logDebug("function : redo_drag_log", "E");
}

function last_redo_action(p_actionType) {
    //ASA-721
    logDebug("function : last_redo_action; actionType : " + p_actionType, "S");
    try {
        var l_MultiObjects;
        if (g_redo_final_obj_arr.length - 1 >= 0) {
            g_undo_details = [];
            g_cut_copy_arr = [];
            g_cut_support_obj_arr = [];
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];

            var lastAction = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1].previousAction;
            l_MultiObjects = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1].g_MultiObjects;
            hasSupportArr = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1].hasSupportArr;
            g_clearInfoType = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1].clearInfoType;
            if (l_MultiObjects == "Y") {
                g_delete_details = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1][0];
                if (hasSupportArr == "Y" && typeof hasSupportArr !== "undefined") {
                    g_cut_support_obj_arr = g_redo_final_obj_arr[g_undo_final_obj_arr.length - 1][2][0];
                }
                g_delete_details.multi_delete_shelf_ind = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1].multi_delete_shelf_ind;
                g_cut_copy_arr = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1][1];
                g_undo_details = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1][0];
            } else {
                g_cut_copy_arr = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1][1];
                g_undo_details = g_redo_final_obj_arr[g_redo_final_obj_arr.length - 1][0];
                if (hasSupportArr == "Y") {
                    g_cut_support_obj_arr = g_redo_final_obj_arr[g_undo_final_obj_arr.length - 1][2][0];
                }
                g_delete_details.multi_delete_shelf_ind = "N";
            }
            g_redo_final_obj_arr.pop();
        }
        logDebug("function : last_redo_action", "E");
        return lastAction;
    } catch (err) {
        error_handling(err);
    }
}

async function update_undo_redo_objID(p_pog_json) {
    logDebug("function : update_undo_redo_objID", "S");
    try {
        if (g_redo_final_obj_arr.length > 0) {
            for (var r = g_redo_final_obj_arr.length - 1; r >= 0; r--) {
                for (var s = g_redo_final_obj_arr[r][0].length - 1; s >= 0; s--) {
                    $.each(p_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
                        if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                            $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                                if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                                    $.each(shelf_info.ItemInfo, function (k, item_info) {
                                        if (g_redo_final_obj_arr[r][0][s].ObjID == item_info.OldObjID) {
                                            g_redo_final_obj_arr[r][0][s].ObjID = item_info.ObjID;
                                        }
                                        // };
                                    });
                                }
                            });
                        }
                    });
                }
            }

            //for shelf info
            for (var r = g_redo_final_obj_arr.length - 1; r >= 0; r--) {
                for (var s = g_redo_final_obj_arr[r][1].length - 1; s >= 0; s--) {
                    var itemArr = g_redo_final_obj_arr[r][1][s].ItemInfo;

                    $.each(itemArr, function (it, Item) {
                        $.each(p_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
                            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                                $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                                    if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                                        $.each(shelf_info.ItemInfo, function (k, item_info) {
                                            if (Item.ObjID == item_info.OldObjID) {
                                                if (g_redo_final_obj_arr[r][1].length > 0) {
                                                    g_redo_final_obj_arr[r][1][s].ObjID = item_info.ObjID;
                                                }
                                            }

                                            // };
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            }
        }
        if (g_undo_final_obj_arr.length > 0) {
            var undoArr = g_undo_final_obj_arr;
            var undoDetArr = g_undo_final_obj_arr;
            for (u = 0; u <= undoArr.length - 1; u++) {
                $.each(p_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
                    if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                        $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                            if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                                $.each(shelf_info.ItemInfo, function (k, item_info) {
                                    if (undoArr[u][1].length > 0) {
                                        $.each(undoArr[u][1], function (ud, undoDet) {
                                            if (undoArr[u][1][ud].ObjID == item_info.OldObjID) {
                                                if (typeof g_undo_final_obj_arr[u][1][ud] !== "undefined") {
                                                    g_undo_final_obj_arr[u][1][ud].ObjID = item_info.ObjID;
                                                }
                                                if (typeof g_undo_final_obj_arr[u][0][ud] !== "undefined") {
                                                    g_undo_final_obj_arr[u][0][ud].ObjID = item_info.ObjID;
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
        if (g_redo_final_obj_arr.length > 0) {
            var redoArr = g_redo_final_obj_arr;
            var redoDetArr = g_redo_final_obj_arr;
            for (u = 0; u <= redoArr.length - 1; u++) {
                $.each(p_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
                    if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                        $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                            if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                                $.each(shelf_info.ItemInfo, function (k, item_info) {
                                    if (redoArr[u][1].length > 0) {
                                        if (redoArr[u][1][0].ObjID == item_info.OldObjID) {
                                            g_redo_final_obj_arr[u][1][0].ObjID = item_info.ObjID;
                                            g_redo_final_obj_arr[u][0][0].ObjID = item_info.ObjID;
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    } catch (err) {
        error_handling(err);
    }
    logDebug("function : update_undo_redo_objID", "E");
}

function area_zoom() {
    logDebug("function : area_zoom", "S");
    if (g_area_zoom_ind == "N") {
        $(".top_icon").removeClass("active");
        $(".left_icon").removeClass("active");
        $(".area_zoom").addClass("active");
        g_area_zoom_ind = "Y";
        g_select_zoom_arr = [];
        g_mselect_drag = "N"; //ASA-1244 Issue 3 - Because of this being set to "Y" all zoomed in modules were copied
        g_delete_details = []; //ASA-1244 Issue 3
    } else {
        $(".area_zoom").removeClass("active");
        g_area_zoom_ind = "N";
    }
    logDebug("function : area_zoom", "E");
}

//this function will log the item detail if added or removed. to highlight the product list
//added item green color and removed item red color.
async function deleted_items_log(p_deleted_item, p_actionType, p_pog_index) {
    logDebug("function : deleted_items_log; deleted_item : " + p_deleted_item + "; actionType : " + p_actionType, "S");
    try {
        var itemFound,
            avail_arr = [],
            itemInfoDets = [],
            sim_items,
            pogcode = g_pog_json[p_pog_index].POGCode; //ASA-1108

        var i = 0;
        for (const item of p_deleted_item) {
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (Modules.ParentModule == null) {
                    for (const Shelf of Modules.ShelfInfo) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            for (const items of Shelf.ItemInfo) {
                                if (items.ItemID == item) {
                                    itemFound = true;
                                    itemInfoDets.push(nvl(items.DaysOfSupply));
                                }
                                if (itemFound) {
                                    break;
                                }
                            }
                        }
                        if (itemFound) {
                            break;
                        }
                    }
                }
                if (itemFound) {
                    break;
                }
            }
            i++;
            itemFound = false;
        }
        var product_model = apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model;
        for (const details of p_deleted_item) {
            if (typeof details !== "undefined" && details !== "") {
                var this_record = null;
                if (typeof product_model !== "undefined") {
                    this_record = product_model.getRecord(details);
                }
                if (p_actionType == "D") {
                    var sim_items = get_similar_items(details, "I", p_pog_index, g_all_pog_flag == "Y" ? "N" : "Y"); // Task_21773
                    sim_items.length > 0 ? avail_arr.push("N") : avail_arr.push("Y");
                    if (p_actionType == "R" || p_actionType == "D") {
                        if (this_record !== null && typeof this_record !== "undefined") {
                            if (sim_items.length == 0) {
                                $("#draggable_table [data-id=" + details + "] td").css("color", "red");
                                product_model.setValue(this_record, "EXISTING", "R");
                            } else {
                                $("#draggable_table [data-id=" + details + "] td").css("color", "green");
                                product_model.setValue(this_record, "EXISTING", "Y");
                            }
                        }
                    }
                } else {
                    // if (g_open_productlist == "D") { //  asa-1258
                    //     avail_arr.push("N");

                    // } else {
                    // 	avail_arr.push("N");
                    // }
                    avail_arr.push("N");
                    if (this_record !== null && typeof this_record !== "undefined") {
                        product_model.setValue(this_record, "EXISTING", "Y");
                    }
                    $("#draggable_table [data-id=" + details + "] td").css("color", "green");
                }
            }
        }

        var max_depth_facing_arr = [];
        for (const item of p_deleted_item) {
            var max_facings = 0;
            for (const Modules of g_pog_json[p_pog_index].ModuleInfo) {
                if (Modules.ParentModule == null) {
                    for (const Shelf of Modules.ShelfInfo) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            for (const items of Shelf.ItemInfo) {
                                if (items.ItemID == item) {
                                    max_facings = Math.max(max_facings, items.BaseD);
                                }
                            }
                        }
                    }
                }
            }
            i++;
            max_depth_facing_arr.push(max_facings);
        }
        if (g_all_pog_flag == "Y") {
            pogcode = ""; //ASA-1108
        } else {
            pogcode = g_pog_json[p_pog_index].POGCode;
        }
        var i = 0;
        pogJson = JSON.stringify([g_pog_json[p_pog_index]]);
        for (var i = 0; i < p_deleted_item.length; i++) {
            //ASA --1148-S
        } //ASA --1148-E
        if (p_deleted_item.length > 0) {
            return new Promise(function (resolve, reject) {
                var p = apex.server.process(
                    "UPDATE_ITEM_LIST", {
                    f01: p_deleted_item,
                    f02: avail_arr, //ASA-1108
                    f03: max_depth_facing_arr,
                    x02: p_actionType,
                    x03: pogcode,
                    p_clob_01: pogJson, //ASA-1999-3 Issue 25
                }, {
                    dataType: "text",
                    success: function (pData) {
                        console.log($.trim(pData));
                        if ($.trim(pData) != "") {
                            resolve($.trim(pData));
                        }
                    },
                });
                p.done(function (data) {
                    g_deletedItems = [];
                    logDebug("function : deleted_items_log", "E");
                    resolve("success");
                });
            });
        }
    } catch (err) {
        error_handling(err);
    }
}

function open_draft() {

    logDebug("function : open_draft", "S");
    $(".top_icon").removeClass("active");
    $(".left_icon").removeClass("active");
    $(".open_draft").addClass("active");
    sessionStorage.removeItem("g_color_arr");
    sessionStorage.removeItem("g_highlightArr");
    if ($(".a-Splitter-thumb").attr("aria-label") == "Collapse") {
        $(".a-Splitter-thumb").click();
    }
    g_color_arr = [];
    g_highlightArr = [];
    apex.event.trigger("#P25_POG_TEMPLATE", "apexrefresh");
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_pog_edited_ind == "Y") {
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
        //         openCustomDialog("OPEN_DRAFT", $v("P25_OPEN_DRAFT_URL"), "P25_DRAFT_TRIGGER_ELEMENT");
        //     }
        // });

        confirm(get_message("POGCR_CHANGE_REVERT_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
            openCustomDialog("OPEN_DRAFT", $v("P25_OPEN_DRAFT_URL"), "P25_DRAFT_TRIGGER_ELEMENT");
        });
        //Task_29818 - End
    } else {
        openCustomDialog("OPEN_DRAFT", $v("P25_OPEN_DRAFT_URL"), "P25_DRAFT_TRIGGER_ELEMENT");
    }
    g_dblclick_opened = "Y";
    logDebug("function : open_draft", "E");
}

function open_save_draft() {
    logDebug("function : open_save_draft", "S");
    if (g_pog_json.length > 0) {
        console.log("templete opened");

        if (g_all_pog_flag == "Y") {
           // $s("P25_DRAFT_SAVE_TYPE", "M");  asa2045
           $s("P25_SAVE_OPTION", "SAVE");  
            $s("P25_POG_DESCRIPTION", "");
            $s("P25_POG_DESCRIPTION", g_pog_json[g_pog_index].Desc7 !== "" ? g_pog_json[g_pog_index].Desc7 : g_pog_json[g_pog_index].POGCode); //ASA-1765 #issue 5
            $("#P25_POG_DESCRIPTION_CONTAINER").hide();
            $("#P25_SAVE_OPTION_CONTAINER").addClass("apex_disabled");
        } else {
            //ASA-1924 Start
            var desc = g_pog_json[g_pog_index]?.Desc7;
            var description = (desc !== undefined && desc !== "") ? desc : g_pog_json[g_pog_index]?.POGCode;
            if (description == "undefined" || description == "") {
                for (var seq of g_seqArr) {
                    if (seq.index == g_pog_index) {
                        get_draft_Desc(seq.seqId, seq.pogCode, seq.pogVersion);
                        break;
                    }
                    g_draftPogInd = "D";
                }
            } else {
                g_draftPogInd = "D";
            }
            //ASA-1924 End
            $s("P25_POG_DESCRIPTION", (g_pog_json[g_pog_index]?.Desc7 !== undefined && g_pog_json[g_pog_index].Desc7 !== "") ? g_pog_json[g_pog_index].Desc7 : g_pog_json[g_pog_index]?.POGCode); //ASA-1765 #issue 5
            $("#P25_SAVE_OPTION_CONTAINER").removeClass("apex_disabled");
            $("#P25_POG_DESCRIPTION_CONTAINER").show();
            $s("P25_DRAFT_SAVE_TYPE", "S");
        }
        openInlineDialog("open_save_draft", 30, 35);
    }
    logDebug("function : open_save_draft", "E");
}

function open_template() {
    logDebug("function : open_template", "S");
    $s("P25_DRAFT_LIST", "");
    $s("P25_POG_DESCRIPTION", "");
    $s("P25_EXISTING_DRAFT_VER", "");
    $(".top_icon").removeClass("active");
    $(".left_icon").removeClass("active");
    $(".open_template").addClass("active");
    //ASA-1694 - Start
    $s("P25_PT_DIVISION", "");
    $s("P25_PT_DEPT", "");
    $s("P25_PT_TEMPLATE", "");
    $s("P25_PT_SUBDEPT", "");
    $s("P25_PT_FIXTURE_GENERATION", "");
    $s("P25_PT_FIXTURE_FAMILY", "");
    $s("P25_PT_FIXTURE_TYPE", "");
    $s("P25_PT_FIXTURE_CODE", "");
    //ASA-1694 - End
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_pog_edited_ind == "Y") {
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
        //         g_module_obj_array = [];
        //         apex.event.trigger("#P25_POG_TEMPLATE", "apexrefresh");
        //         openInlineDialog("pog_template_list", 20, 20);
        //         g_dblclick_opened = "Y";
        //     }
        // });

        confirm(get_message("POGCR_CHANGE_REVERT_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
            g_module_obj_array = [];
            apex.event.trigger("#P25_POG_TEMPLATE", "apexrefresh");
            openInlineDialog("pog_template_list", 61, 61); //ASA-1694
            g_dblclick_opened = "Y";
        });
        //Task_29818 - End
    } else {
        g_module_obj_array = [];
        apex.event.trigger("#P25_POG_TEMPLATE", "apexrefresh");
        openInlineDialog("pog_template_list", 61, 61); //ASA-1694
        g_dblclick_opened = "Y";
    }
    logDebug("function : open_template", "E");
}

function open_pdf() {
    logDebug("function : open_pdf", "S");
    if (g_upload_file_flag == "N") {
        apex.server.process(
            "POG_PDF_CHECK", {
            x01: g_pog_json[g_pog_index].POGCode,
            x02: g_pog_json[g_pog_index].Version,
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) == "Y") {
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

                    // ax_message.confirm(get_message("PDF_OVERRIDE_WARN"), function (e) {
                    //     if (e) {
                    //         g_dblclick_opened = "Y";
                    //         $("#P25_SAVE_WITH_PDF_CONTAINER").hide(); //ASA-1417 issue 3
                    //         $("#SAVE_POG").hide();
                    //         $("#SAVE_PDF").show();
                    //         $s("P25_SAVE_WITH_PDF", "Y");
                    //         $("#P25_POG_PDF_REMINDER_MSG_CONTAINER").show(); //ASA-1417 issue 1
                    //         $("#P25_PDF_TEMPLATE_CONTAINER").show(); //ASA-1417 issue 1
                    //         $("#ui-id-14").text("Generate PDF");
                    //         var template_id = check_cookie_name("PDF_TEMPLATE", $v("P25_BU_ID"));
                    //         if (template_id !== "") {
                    //             $s("P25_PDF_TEMPLATE", template_id);
                    //         }
                    //         openInlineDialog("open_pdf_modal", 25, 25);
                    //     }
                    // });

                    confirm(get_message("PDF_OVERRIDE_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
                        g_dblclick_opened = "Y";
                        $("#P25_SAVE_WITH_PDF_CONTAINER").hide(); //ASA-1417 issue 3
                        $("#SAVE_POG").hide();
                        $("#SAVE_PDF").show();
                        $s("P25_SAVE_WITH_PDF", "Y");
                        //ASA-1677 Issue 1 added If/else
                        let pdfValue = $v("P25_PDF_TEMPLATE");
                        let extractedValue = pdfValue.split("-")[10]; //pdfValue.split("/").pop(); ASA 1706 issue #1
                        if (!pdfValue) {
                            $s("P25_DEFAULT_LIVE_VERSION", "Y");
                            $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
                        } else if (extractedValue == "Y") {
                            $s("P25_DEFAULT_LIVE_VERSION", "Y");
                            $s("P25_PREV_POG_CODE", g_pog_json[g_pog_index].POGCode); //ASA-1677 #4
                            $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").show();
                        } else {
                            $s("P25_DEFAULT_LIVE_VERSION", "Y");
                            $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
                        }
                        // ASA-1677 ENDS
                        $("#P25_POG_PDF_REMINDER_MSG_CONTAINER").show(); //ASA-1417 issue 1
                        $("#P25_PDF_TEMPLATE_CONTAINER").show(); //ASA-1417 issue 1
                        $("#ui-id-14").text("Generate PDF");
                        var template_id = check_cookie_name("PDF_TEMPLATE", $v("P25_BU_ID"));
                        if (template_id !== "") {
                            $s("P25_PDF_TEMPLATE", template_id);
                        }
                        openInlineDialog("open_pdf_modal", 25, 25);
                    });
                    //Task_29818 - End
                } else {
                    g_dblclick_opened = "Y";
                    $("#P25_SAVE_WITH_PDF_CONTAINER").hide(); //ASA-1417 issue 3
                    $("#SAVE_POG").hide();
                    $("#SAVE_PDF").show();
                    $s("P25_SAVE_WITH_PDF", "Y");
                    //ASA-1677 Issue 1 added If/else
                    let pdfValue = $v("P25_PDF_TEMPLATE");
                    let extractedValue = pdfValue.split("-")[10]; //pdfValue.split("/").pop(); ASA 1706 issue #1
                    if (!pdfValue) {
                        $s("P25_DEFAULT_LIVE_VERSION", "Y");
                        $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
                    } else if (extractedValue == "Y") {
                        $s("P25_DEFAULT_LIVE_VERSION", "Y");
                        $s("P25_PREV_POG_CODE", g_pog_json[g_pog_index].POGCode); //ASA-1677 #4
                        $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").show();
                    } else {
                        $s("P25_DEFAULT_LIVE_VERSION", "Y");
                        $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
                    }
                    // ASA-1677 ENDS
                    $("#P25_POG_PDF_REMINDER_MSG_CONTAINER").show(); //ASA-1417 issue 1
                    $("#P25_PDF_TEMPLATE_CONTAINER").show(); //ASA-1417 issue 1
                    $("#ui-id-14").text("Generate PDF");
                    var template_id = check_cookie_name("PDF_TEMPLATE", $v("P25_BU_ID"));
                    if (template_id !== "") {
                        $s("P25_PDF_TEMPLATE", template_id);
                    }
                    openInlineDialog("open_pdf_modal", 25, 25);
                }
                logDebug("function : open_pdf", "E");
            },
            loadingIndicatorPosition: "page",
        });
    }
}

function open_product(p_type) {
    logDebug("function : open_product; type : " + p_type, "S");
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) { // Applied check for when No pog is selected
        if (g_all_pog_flag == "N") {
            $s("P25_PAR_POG_CODE", `${g_pog_json[g_pog_index].POGCode}`); //ASA-1587 #15A
            $s("P25_OPEN_POG_CODE", `${g_pog_json[g_pog_index].POGCode}`);
            $s("P25_OPEN_POG_VERSION", `${g_pog_json[g_pog_index].Version}`);
        } else {
            $s("P25_OPEN_POG_CODE", "");
            $s("P25_OPEN_POG_VERSION", "");
        }
    }
    var item_val = "R";
    $s("P25_USED_ITEM", `${item_val}`);

    if ($(".a-Splitter-thumb").attr("aria-label") == "Collapse") {
        if (p_type !== "OPEN_PAR") {
            if (g_open_productlist == "Y") {
                g_open_productlist = "N";
                g_show_plano_rate = "N";
                $(".a-Splitter-thumb").click();
            } else {
                $("#par_region").hide();
                $("#draggable_table").show();
                g_open_productlist = "Y"; //ASA-1587 #7
                g_show_plano_rate = "N"; //ASA-1587 #7
                $("#wpdSplitter_splitter_second").css("overflow", "hidden");

                //ASA-1706
                if ($v("P25_POGCR_ENBL_PRODUCT_SEQ") == "Y") {
                    let region = apex.region("draggable_table");
                    region.widget().interactiveGrid("getActions").set("edit", true);
                    let grid = region.widget();
                    let view = grid.interactiveGrid("getViews", "grid");
                    let model = view.model;

                    // Assign SEQ_NUMBER Values Dynamically
                    $(".is-readonly").prop("disabled", true);
                    let seq = 1;
                    model.forEach(function (record) {
                        model.setValue(record, "SEQ_NUMBER", seq++);
                    });
                    $(".is-readonly").prop("disabled", false);

                    // ASA 1706 #3 Added to remove Triangle icon from seq_no column
                    $("#draggable_table tr").each(function () {
                        let dataId = $(this).attr("data-id");
                        if (dataId) {
                            $(`tr[data-id='${dataId}'] td.is-changed`).removeClass("is-changed");
                        }
                    });
                }
                region.widget().interactiveGrid("getActions").set("edit", false);
                apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                apex.region("draggable_table").widget().interactiveGrid("getViews").grid.curInst._refreshGrid();
            }
        } else {
            if (g_show_plano_rate == "Y") {
                g_open_productlist = "N";
                g_show_plano_rate = "N";
                $(".a-Splitter-thumb").click();
            } else {
                g_open_productlist = "N"; //ASA-1587 #7
                g_show_plano_rate = "Y"; //ASA-1587 #7
                $("#draggable_table").hide();
                $("#par_region").show();
                $("#wpdSplitter_splitter_second").css("scrollbar-width", "thin").css("overflow", "auto");
            }
        }
    } else {
        if (p_type !== "OPEN_PAR") {
            g_open_productlist = "Y"; //ASA-1108
            g_show_plano_rate = "N";
            //ASA-1706
            if ($v("P25_POGCR_ENBL_PRODUCT_SEQ") == "Y") {
                let region = apex.region("draggable_table");
                let grid = region.widget();
                let view = grid.interactiveGrid("getViews", "grid");
                let model = view.model;
                // Assign SEQ_NUMBER Values Dynamically
                $(".is-readonly").prop("disabled", true);
                let seq = 1;
                model.forEach(function (record) {
                    if (model.allowEdit(record)) { //ASA-1923 Issue 7 add condition
                        try {
                            model.setValue(record, "SEQ_NUMBER", seq++);
                        } catch (e) {
                            console.warn("Cannot set value for this record:", record, e);
                        }
                    }
                });
                $(".is-readonly").prop("disabled", false);

                // ASA 1706 #3 Added to remove Triangle icon from seq_no column
                $("#draggable_table tr").each(function () {
                    let dataId = $(this).attr("data-id");
                    if (dataId) {
                        $(`tr[data-id='${dataId}'] td.is-changed`).removeClass("is-changed");
                    }
                });
            }
        } else {
            g_show_plano_rate = "Y"; //ASA-1587
            g_open_productlist = "N";
            //ASA-1657
            apex.region("asp_curr_chart").refresh();
            apex.region("asp_prev_chart").refresh();
            apex.region("csp_curr_chart").refresh();
            apex.region("csp_prev_chart").refresh();
            apex.region("pas_curr_chart").refresh();
        }
        $(".a-Splitter-thumb").click();
    }
    if (p_type !== "OPEN_PAR") {
        set_grid_background_color();
    }
}

async function save_pog() {
    logDebug("function : save_pog", "S");
    if (g_upload_file_flag == "Y") {
        $s("P25_SAVE_WITH_PDF", "Y");
        $("#P25_SAVE_WITH_PDF").addClass("apex_disabled");
    } else {
        $s("P25_SAVE_WITH_PDF", "N");
        $("#P25_SAVE_WITH_PDF").removeClass("apex_disabled");
    }
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
        var carpark_exists = "N";
        var overhung_exists = "N";
        var overhung_failed = "N";
        var width = 0;
        var l_carpark_shelfs = "";
        var l_outworld_shelfs = "";
        for (const jsonData of g_pog_json) {
            $.each(jsonData.ModuleInfo, function (i, modules_info) {
                if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                    if (modules_info.Carpark.length > 0 && i == g_pog_index) { //ASA-1912 Issue 1
                        carpark_exists = "Y";
                        //return false;
                        for (obj of modules_info.Carpark) {
                            l_carpark_shelfs = l_carpark_shelfs + (l_carpark_shelfs !== "" ? ", " : "") + obj.Shelf;
                        }
                    }
                }
            });
        }
        //if (g_overhung_shelf_active == "Y") { //ASA-1247 to be commented as we should even check depth and height validation not only overhung.
        //}
        if (carpark_exists == "N") {
            //ASA-1292
            l_outworld_shelfs = await check_caprpark_inpog();
        }
        //ASA-1412 -S
        // if ($v('P25_POGCR_VALIDATE_OVERHUNG') == 'Y') { //ASA-1310 prasanna ASA-1310_25890
        //     [overhung_exists, overhung_failed] = await identifyOverhungItems(g_pog_index, "Y", "N");
        // }
        // if (overhung_failed == "Y" || overhung_exists == "Y") { //ASA-1247
        //     alert(get_message("POGCR_OVERHUNG_SHELF_DENY"));
        //     return;
        // }
        //ASA-1412 -E
        if (l_outworld_shelfs !== "" || l_carpark_shelfs !== "") {
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

            // ax_message.confirm(get_message("POGCR_CARPARK_ITEM_WARN", (l_outworld_shelfs + (l_outworld_shelfs !== '' ? ', ' : '') + l_carpark_shelfs)), function (e) {
            //     if (e) {
            //         if (overhung_failed !== "Y" || overhung_exists !== "Y") { //ASA-1292
            //             $("#SAVE_POG").show();
            //             $("#SAVE_PDF").hide();
            //             $("#P25_SAVE_WITH_PDF_CONTAINER").show(); //ASA-1417 issue 3
            //             $s("P25_SAVE_WITH_PDF", $v("P25_POG_SAVE_WITH_WTOT_PDF"));
            //             $("#ui-id-11").text("Save POG");
            //             $("#P25_PDF_TEMPLATE_CONTAINER").hide(); //ASA-1417 issue 1
            //             $("#P25_POG_PDF_REMINDER_MSG_CONTAINER").hide(); //ASA-1417 issue 1
            //             var template_id = check_cookie_name("PDF_TEMPLATE", $v("P25_BU_ID"));
            //             if (template_id !== "") {
            //                 $s("P25_PDF_TEMPLATE", template_id);
            //             }
            //             openInlineDialog("open_pdf_modal", 25, 25);
            //         }
            //     }
            // });

            confirm(get_message("POGCR_CARPARK_ITEM_WARN", l_outworld_shelfs + (l_outworld_shelfs !== "" ? ", " : "") + l_carpark_shelfs), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
                if (overhung_failed !== "Y" || overhung_exists !== "Y") {
                    //ASA-1292
                    $("#SAVE_POG").show();
                    $("#SAVE_PDF").hide();
                    $("#P25_SAVE_WITH_PDF_CONTAINER").show(); //ASA-1417 issue 3
                    $s("P25_PREV_POG_CODE", g_pog_json[g_pog_index].POGCode); //ASA-1677 #4
                    $s("P25_SAVE_WITH_PDF", $v("P25_POG_SAVE_WITH_WTOT_PDF"));
                    $("#ui-id-11").text("Save POG");
                    $("#P25_PDF_TEMPLATE_CONTAINER").hide(); //ASA-1417 issue 1
                    $("#P25_POG_PDF_REMINDER_MSG_CONTAINER").hide(); //ASA-1417 issue 1
                    var template_id = check_cookie_name("PDF_TEMPLATE", $v("P25_BU_ID"));
                    if (template_id !== "") {
                        $s("P25_PDF_TEMPLATE", template_id);
                    }
                    //ASA-1677 Added if/else
                    let pdfValue = $v("P25_PDF_TEMPLATE");
                    let extractedValue = pdfValue.split("-")[10]; //pdfValue.split("/").pop(); ASA 1706 issue #1
                    if (!pdfValue) {
                        $s("P25_DEFAULT_LIVE_VERSION", "Y");
                        $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
                        $("#P25_PREV_PDF_POG_VERSION_CONTAINER").hide();
                    } else if (extractedValue == "Y" && $v("P25_SAVE_WITH_PDF") == "Y") {
                        $s("P25_DEFAULT_LIVE_VERSION", "Y");
                        $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").show();
                    } else {
                        $s("P25_DEFAULT_LIVE_VERSION", "Y");
                        $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
                        $("#P25_PREV_PDF_POG_VERSION_CONTAINER").hide();
                    }
                    // ASA-1677 ENDS
                    openInlineDialog("open_pdf_modal", 25, 25);
                }
            });
            //Task_29818 - End
        } else {
            if (overhung_failed !== "Y" || overhung_exists !== "Y") {
                $("#SAVE_POG").show();
                $("#SAVE_PDF").hide();
                $("#P25_SAVE_WITH_PDF_CONTAINER").show(); //ASA-1417 issue 3
                $s("P25_PREV_POG_CODE", g_pog_json[g_pog_index].POGCode); //ASA-1677 #4
                $s("P25_SAVE_WITH_PDF", $v("P25_POG_SAVE_WITH_WTOT_PDF"));
                $("#P25_PDF_TEMPLATE_CONTAINER").hide(); //ASA-1417 issue 1
                $("#P25_POG_PDF_REMINDER_MSG_CONTAINER").hide(); //ASA-1417 issue 1
                var template_id = check_cookie_name("PDF_TEMPLATE", $v("P25_BU_ID"));
                if (template_id !== "") {
                    $s("P25_PDF_TEMPLATE", template_id);
                }
                //ASA-1677 Added if/else
                let pdfValue = $v("P25_PDF_TEMPLATE");
                let extractedValue = pdfValue.split("-")[10]; //pdfValue.split("/").pop(); ASA 1706 issue #1
                if (!pdfValue) {
                    $s("P25_DEFAULT_LIVE_VERSION", "Y");
                    $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
                    $("#P25_PREV_PDF_POG_VERSION_CONTAINER").hide();
                } else if (extractedValue == "Y" && $v("P25_SAVE_WITH_PDF") == "Y") {
                    $s("P25_DEFAULT_LIVE_VERSION", "Y");
                    $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").show();
                } else {
                    $s("P25_DEFAULT_LIVE_VERSION", "Y");
                    $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
                    $("#P25_PREV_PDF_POG_VERSION_CONTAINER").hide();
                }
                // ASA-1677 ENDS
                openInlineDialog("open_pdf_modal", 25, 25);
            }
        }
    }
    logDebug("function : save_pog", "E");
}

function open_3d_popup() {
    logDebug("function : open_3d_popup", "S");
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_pog_index !== "") {
        POG_json = JSON.stringify([g_pog_json[g_pog_index]]);
        apex.server.process(
            "3DVIEW_JSON_COLLECTION", {
            x01: g_pog_json[g_pog_index].POGCode,
            x02: g_show_live_image,
            p_clob_01: POG_json,
        }, {
            dataType: "text",
            async: true,
            success: function (pData) {
                if ($.trim(pData) != "") {
                    raise_error(pData);
                } else {
                    try {
                        sessionStorage.setItem("g_ItemImages", JSON.stringify(g_ItemImages));
                        sessionStorage.setItem("IndexedDB_ind", "N");
                    } catch {
                        add_img_indexeddb(g_ItemImages);
                        sessionStorage.setItem("IndexedDB_ind", "Y");
                    }
                    sessionStorage.setItem("g_chest_as_pegboard", g_chest_as_pegboard);
                    sessionStorage.setItem("g_show_live_image", g_show_live_image);
                    apex.server.process(
                        "PREPARE_MODAL_URL", {
                        x01: 34,
                        x04: "P25_3D_VIEW_TRIGGER_ELEMENT",
                    }, {
                        dataType: "text",
                        async: true,
                        success: function (pData) {
                            if ($.trim(pData) != "") {
                                logDebug("function : open_3d_popup", "E");
                                apex.navigation.redirect($.trim(pData));
                            }
                        },
                        loadingIndicatorPosition: "page",
                    });
                }
            },
            loadingIndicatorPosition: "page",
        });
    }
    logDebug("function : open_3d_popup", "E");
}

async function fill_undo_detail_arr(p_objId, p_moduleIndex, p_shelfIndex, p_itemIndex, p_objType, p_ItemCode, p_ModuleObjID, p_ShelfObjID, p_ItemID, p_XAxis, p_YAxis, p_ZAxis, p_shelf_object_type, p_NewModIndex, p_NewShelfIndex, p_NewItemIndex, p_XAxis, p_YAxis, p_ZAxis) {
    logDebug("function : fill_undo_detail_arr; objId : " + p_objId + "; moduleIndex : " + p_moduleIndex + "; shelfIndex : " + p_shelfIndex + "; itemIndex : " + p_itemIndex + "; objType : " + p_objType + "; ItemCode : " + p_ItemCode + "; ModuleObjID : " + p_ModuleObjID + "; ShelfObjID : " + p_ShelfObjID + "; ItemID : " + p_ItemID + "; XAxis : " + p_XAxis + "; YAxis : " + p_YAxis + "; ZAxis : " + p_ZAxis + "; i_shelf_object_type : " + p_shelf_object_type + "; NewModIndex : " + p_NewModIndex + "; NewShelfIndex : " + p_NewShelfIndex + "; NewItemIndex : " + p_NewItemIndex + "; XAxis : " + p_XAxis + "; YAxis : " + p_YAxis + "; ZAxis : " + p_ZAxis, "S");
    try {
        var details = {};
        var is_divider;
        if (p_ItemCode == "DIVIDER") {
            is_divider = "Y";
        } else {
            is_divider = "N";
        }
        details["ObjID"] = p_objId;
        details["MIndex"] = p_moduleIndex;
        details["SIndex"] = p_shelfIndex;
        details["IIndex"] = p_itemIndex;
        details["ObjType"] = p_objType;
        details["IsDivider"] = is_divider;
        details["Object"] = "ITEM";
        details["MObjID"] = p_ModuleObjID;
        details["SObjID"] = p_ShelfObjID;
        details["ItemID"] = p_ItemID;
        details["XAxis"] = p_XAxis;
        details["YAxis"] = p_YAxis;
        details["ZAxis"] = p_ZAxis;
        details["NewModIndex"] = p_NewModIndex;
        details["NewShelfIndex"] = p_NewShelfIndex;
        details["NewItemIndex"] = p_NewItemIndex;
        details["Item"] = p_ItemCode;
        details["ShelfObjType"] = p_shelf_object_type;
        g_undo_details.push(details);
    } catch (err) {
        error_handling(err);
    }
    logDebug("function : fill_undo_detail_arr", "E");
}

function undo_clear_pog_info(p_pog_index) {
    //02092021
    logDebug("function : undo_clear_pog_info", "S");
    try {
        var details = {};
        var is_driver = "N";
        var finalAction;
        if (g_undoRedoAction == "REDO") {
            finalAction = "U";
        } else {
            finalAction = "R";
        }
        if (g_undo_details[0].OldPOGCode !== "" && typeof g_undo_details[0].OldPOGCode !== "undefined") {
            //fixes -01

            details["OldPOGCode"] = g_pog_json[p_pog_index].POGCode;
            details["OldPOGName"] = g_pog_json[p_pog_index].Name;
            details["OldPOGDivision"] = g_pog_json[p_pog_index].Division;
            details["OldPOGDept"] = g_pog_json[p_pog_index].Dept;
            details["OldPOGSubDept"] = g_pog_json[p_pog_index].SubDept;
            details["OldEffStartDate"] = g_pog_json[p_pog_index].EffStartDate;

            g_pog_json[p_pog_index].POGCode = g_undo_details[0].OldPOGCode;
            g_pog_json[p_pog_index].Name = g_undo_details[0].OldPOGName;
            g_pog_json[p_pog_index].Division = g_undo_details[0].OldPOGDivision;
            g_pog_json[p_pog_index].Dept = g_undo_details[0].OldPOGDept;
            g_pog_json[p_pog_index].SubDept = g_undo_details[0].OldPOGSubDept;
            g_pog_json[p_pog_index].EffStartDate = g_undo_details[0].OldEffStartDate;

            $s("P25_POG_DIVISION", "");
            var module_details = g_pog_json[p_pog_index].ModuleInfo;
            $.each(module_details, function (i, modules_info) {
                if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                    g_pog_json[p_pog_index].ModuleInfo[i].SubDept = g_pog_json[p_pog_index].ModuleInfo[i].OldPOGModuleSubDept;
                    g_pog_json[p_pog_index].ModuleInfo[i].OldPOGModuleSubDept = "";
                }
            });

            g_undo_details = [];
            g_undo_details.push(details);
            if (finalAction == "U") {
                g_delete_details.multi_delete_shelf_ind = "N";
                g_undo_all_obj_arr = [];

                g_undo_all_obj_arr.push(g_undo_details);
                g_undo_all_obj_arr.push(g_cut_copy_arr);
                g_undo_all_obj_arr.previousAction = "CLEAR_POG_ATT"; //02092021
                g_undo_all_obj_arr.clearInfoType = "Y";
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
                g_redo_all_obj_arr.previousAction = "CLEAR_POG_ATT"; //02092021
                g_redo_all_obj_arr.clearInfoType = "Y";
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
            if (action == "REDO") {
                g_prev_undo_action = last_redo_action();
            } else {
                var g_prev_undo_action = last_action();
            }
            var clear_final = [];
            var counter = 0;
            clear_final.push(g_undo_details); //Y0GRAJ

            for (const details of g_delete_details) {
                if (details.Object == "ITEM") {
                    $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
                        if (modules.MObjID == details.MObjID) {
                            g_module_index = i;
                        }
                    });
                    $.each(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo, function (i, shelfs) {
                        if (shelfs.SObjID == details.SObjID) {
                            g_shelf_index = i;
                        }
                    });
                    var item_details;
                    for (const undo of g_cut_copy_arr) {
                        if (details.ObjID == undo.ObjID) {
                            item_details = undo;
                        }
                    }
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.push(item_details);
                    var shelf_start = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W / 2;
                    var shelfY = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Y;
                    async function doCreateItems() {
                        var return_val = await context_create_items(item_details, g_module_index, g_shelf_index, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo.length - 1, shelf_start, "N", shelfY, g_camera, "Y", p_pog_index);
                    }
                    doCreateItems();
                    g_cut_copy_arr.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[details.IIndex])));
                    var newObjId = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[details.IIndex].ObjID;
                    async function doSomething() {
                        var res = await fill_undo_detail_arr(newObjId, g_module_index, g_shelf_index, details.IIndex, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType, details.Item, g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID, g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID, details.Item, "", "", "", "SHELF");
                    }
                    doSomething();
                }
                counter++;
            }
            g_delete_details.multi_delete_shelf_ind = "N";
            g_redo_all_obj_arr = [];
            g_redo_all_obj_arr.push(g_undo_details);
            g_redo_all_obj_arr.push(g_cut_copy_arr);
            g_redo_all_obj_arr.hasSupportArr = "N";
            g_redo_all_obj_arr.previousAction = "CREATE_ITEM";
            g_redo_all_obj_arr.clearPog = "Y";
            if (counter > 1) {
                g_redo_all_obj_arr.g_MultiObjects = "Y";
            } else {
                g_redo_all_obj_arr.g_MultiObjects = "N";
            }
            g_redo_all_obj_arr.multi_delete_shelf_ind = "N";
            g_redo_final_obj_arr.push(g_redo_all_obj_arr);
            g_delete_details = [];
            g_multi_drag_shelf_arr = [];
            g_multi_drag_item_arr = [];
            g_cut_copy_arr = [];
            g_undo_details = [];
        }
    } catch {
        error_handling(err);
    }
    logDebug("function : undo_clear_pog_info", "E");
}

function save_common_color(p_new_color, p_pog_index) {
    logDebug("function : save_common_color; new_color : " + p_new_color, "S");
    try {
        var colorValue = parseInt(p_new_color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        undoObjectsInfo = [];
        g_allUndoObjectsInfo = [];
        if (g_delete_details.length > 0) {
            var prevModuleIndex = -1;
            var preShelfIndex = -1;
            var validYN = "Y";
            for (const details of g_delete_details) {
                prevModuleIndex = details.MIndex;
                preShelfIndex = details.SIndex;
                for (i of g_allUndoObjectsInfo) {
                    if (i.moduleIndex == details.MIndex && i.shelfIndex == details.SIndex) {
                        validYN = "N";
                    } else {
                        validYN = "Y";
                    }
                }
                if (validYN == "Y") {
                    if (details.Object == "SHELF") {
                        var objID = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].SObjID));
                        var shelfInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex]));
                        undoObjectsInfo = [];
                        undoObjectsInfo.push(shelfInfo);
                        undoObjectsInfo.moduleIndex = details.MIndex;
                        undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[details.MIndex].Module;
                        undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[details.MIndex].MObjID;
                        undoObjectsInfo.shelfIndex = details.SIndex;
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_start_canvas;
                        undoObjectsInfo.objectID = objID;
                        undoObjectsInfo.g_deletedItems = g_deletedItems;
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                    } else if (details.Object == "ITEM") {
                        undoObjectsInfo = [];
                        var objID = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].SObjID));
                        var shelfInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex]));
                        undoObjectsInfo.push(shelfInfo);
                        undoObjectsInfo.moduleIndex = details.MIndex;
                        undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[details.MIndex].Module;
                        undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[details.MIndex].MObjID;
                        undoObjectsInfo.shelfIndex = details.SIndex;
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_start_canvas;
                        undoObjectsInfo.objectID = objID;
                        undoObjectsInfo.g_deletedItems = g_deletedItems;
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                    }
                }
            }
        }
        if (g_delete_details.length > 0) {
            for (const details of g_delete_details) {
                if (details.Object == "SHELF") {
                    g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].Color = p_new_color;
                    selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].SObjID);
                    if (typeof selectedObject !== "undefined") {
                        selectedObject.material.color = hex_decimal;
                    }
                } else if (details.Object == "ITEM") {
                    g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex].Color = p_new_color;
                    g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex].ShowColorBackup = p_new_color; //ASA-1481
                    selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex].ObjID);
                    if (typeof selectedObject !== "undefined" && selectedObject.ImageExists == "N") {
                        selectedObject.material.color = hex_decimal;
                    }
                }
            }
        } else {
            undoObjectsInfo = [];
            var objID = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].SObjID));
            var shelfInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index]));
            undoObjectsInfo.push(shelfInfo);
            undoObjectsInfo.moduleIndex = g_module_index;
            undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[g_module_index].Module;
            undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[g_module_index].MObjID;
            undoObjectsInfo.shelfIndex = g_shelf_index;
            undoObjectsInfo.actionType = "ITEM_DELETE";
            undoObjectsInfo.startCanvas = g_start_canvas;
            undoObjectsInfo.objectID = objID;
            undoObjectsInfo.g_deletedItems = g_deletedItems;
            g_allUndoObjectsInfo.push(undoObjectsInfo);
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Color = p_new_color;
            g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].ShowColorBackup = p_new_color; //ASA-1481
            selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].ObjID);
            if (typeof selectedObject !== "undefined" && selectedObject.ImageExists == "N") {
                selectedObject.material.color = hex_decimal;
            }
        }
        logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y");
        g_allUndoObjectsInfo = [];
    } catch (err) {
        error_handling(err);
    }
    g_delete_details = [];
    g_multi_drag_shelf_arr = [];
    g_multi_drag_item_arr = [];
    render(p_pog_index);
    g_dblclick_opened = "N";
    g_mselect_drag = "N";
    closeInlineDialog("EDIT_COLOR");
    logDebug("function : save_common_color", "E");
}

//this function is used in previous version. from compare view. it will check the changes in items from previous version to current version and
//highlight items.
async function two_pog_diff_checker(p_pog_index, p_comViewIndex, p_compare_pog = "N") {
    //ASA-1803 Issue 1 added p_compare_pog
    logDebug("function : two_pog_diff_checker", "S");
    var res = await reset_colors("O", p_pog_index); //ASA-1464 Issue 3
    var res = await ShowColorBackup(p_pog_index); //ASA-1464 Issue 3
    var deletedModules = [];
    var deletedShelves = [];
    var g_deletedItems = [];
    var addedItems = [];
    // var posigtionChangeItems = [];           //ASA-1525 Issue 1 & 2
    var positionChangeItemInfo = []; //ASA-1525 Issue 1 & 2
    var positionChangeItemInfoCount = 0; //ASA-1525 Issue 1 & 2
    var valid_values = ["SHELF", "PALLET", "HANGINGBAR", "PEGBOARD", "CHEST"]; //ASA-1520
    g_world = g_scene_objects[p_pog_index].scene.children[2];
    await recreate_image_items("N", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), p_pog_index, "N", "", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && typeof g_pog_json[p_comViewIndex].ModuleInfo !== "undefined") {
        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_right) {
            var moduleFound = "N";
            //check shelf missing and module missing
            $.each(g_pog_json[p_comViewIndex].ModuleInfo, function (h, modules_left) {
                if (modules_left.Module == modules_right.Module) {
                    moduleFound = "Y";
                    modules_left["ModuleFound"] = "Y";
                    var shelfs_right = modules_right.ShelfInfo;
                    var shelfs_left = modules_left.ShelfInfo;
                    $.each(shelfs_right, function (j, shelfs_r) {
                        if (valid_values.indexOf(shelfs_r.ObjType) !== -1) {
                            var shelfFound = "N";
                            $.each(shelfs_left, function (k, shelfs_l) {
                                if (valid_values.indexOf(shelfs_l.ObjType) !== -1) {
                                    if (shelfs_r.Shelf == shelfs_l.Shelf) {
                                        shelfFound = "Y";
                                    }
                                }
                            });
                            if (shelfFound == "N") {
                                deletedShelves.push(shelfs_r.Shelf);
                            }
                        }
                    });
                }
            });
            if (moduleFound == "N") {
                deletedModules.push(modules_right.Module);
            }
        });
        //check deleted items
        $.each(g_pog_json[p_comViewIndex].ModuleInfo, function (i, modules_info) {
            $.each(modules_info.ShelfInfo, function (k, shelf) {
                if (valid_values.indexOf(shelf.ObjType) !== -1) {
                    $.each(shelf.ItemInfo, function (m, it) {
                        var itemFound = "N";
                        $.each(g_pog_json[p_pog_index].ModuleInfo, function (n, modules_info_comp) {
                            $.each(modules_info_comp.ShelfInfo, function (o, shelf_comp) {
                                if (valid_values.indexOf(shelf_comp.ObjType) !== -1) {
                                    $.each(shelf_comp.ItemInfo, function (p, it_comp) {
                                        if (it.ItemID == it_comp.ItemID) {
                                            itemFound = "Y";
                                        }
                                    });
                                }
                            });
                        });
                        if (itemFound == "N") {
                            g_deletedItems.push(it.ItemID);
                        }
                    });
                }
            });
        });
        //items added
        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
            $.each(modules_info.ShelfInfo, function (k, shelf) {
                if (valid_values.indexOf(shelf.ObjType) !== -1) {
                    $.each(shelf.ItemInfo, function (m, it) {
                        var itemFound = "N";
                        $.each(g_pog_json[p_comViewIndex].ModuleInfo, function (n, modules_info_comp) {
                            $.each(modules_info_comp.ShelfInfo, function (o, shelf_comp) {
                                if (valid_values.indexOf(shelf_comp.ObjType) !== -1) {
                                    $.each(shelf_comp.ItemInfo, function (p, it_comp) {
                                        if (it.ItemID == it_comp.ItemID) {
                                            itemFound = "Y";
                                        }
                                    });
                                }
                            });
                        });
                        if (itemFound == "N") {
                            addedItems.push(it.ItemID);
                        }
                    });
                }
            });
        });

        if (p_compare_pog == "N") {
            //ASA-1803 added if to avoid logic when compare POG btn is hit.
            //check position changed items
            $.each(g_pog_json[p_comViewIndex].ModuleInfo, function (i, modules_info) {
                $.each(modules_info.ShelfInfo, function (k, shelf) {
                    if (valid_values.indexOf(shelf.ObjType) !== -1) {
                        $.each(shelf.ItemInfo, function (m, it) {
                            var positionChanged = "N";
                            $.each(g_pog_json[p_pog_index].ModuleInfo, function (n, modules) {
                                $.each(modules.ShelfInfo, function (o, shelfs) {
                                    $.each(shelfs.ItemInfo, function (p, items) {
                                        if (modules_info.Module == modules.Module && shelf.Shelf == shelfs.Shelf) {
                                            if (typeof shelfs.ItemInfo[m] !== "undefined") {
                                                if (shelf.ItemInfo[m].ItemID == shelfs.ItemInfo[m].ItemID) {
                                                    positionChanged = "Y";
                                                } else {
                                                    //ASA-1525 Issue 1 & 2 Start
                                                    // posigtionChangeItems.push(shelfs.ItemInfo[m].ItemID);
                                                    positionChangeItemInfo[positionChangeItemInfoCount] = {};
                                                    positionChangeItemInfo[positionChangeItemInfoCount].Module = modules.Module;
                                                    positionChangeItemInfo[positionChangeItemInfoCount].Shelf = shelfs.Shelf;
                                                    positionChangeItemInfo[positionChangeItemInfoCount].ItemID = shelfs.ItemInfo[m].ItemID;
                                                    positionChangeItemInfoCount++;
                                                    //ASA-1525 Issue 1 & 2 End
                                                }
                                            } else {
                                                //ASA-1525 Issue 1 & 2 Start
                                                positionChangeItemInfo[positionChangeItemInfoCount] = {};
                                                positionChangeItemInfo[positionChangeItemInfoCount].Module = modules_info.Module;
                                                positionChangeItemInfo[positionChangeItemInfoCount].Shelf = shelf.Shelf;
                                                positionChangeItemInfo[positionChangeItemInfoCount].ItemID = shelf.ItemInfo[m].ItemID;
                                                positionChangeItemInfoCount++;
                                            } //ASA-1525 Issue 1 & 2 End
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            });

            //ASA-1525 #1 Start
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
                $.each(modules_info.ShelfInfo, function (k, shelf) {
                    if (valid_values.indexOf(shelf.ObjType) !== -1) {
                        $.each(shelf.ItemInfo, function (m, it) {
                            var positionChanged = "N";
                            $.each(g_pog_json[p_comViewIndex].ModuleInfo, function (n, modules) {
                                $.each(modules.ShelfInfo, function (o, shelfs) {
                                    $.each(shelfs.ItemInfo, function (p, items) {
                                        if (modules_info.Module == modules.Module && shelf.Shelf == shelfs.Shelf) {
                                            if (typeof shelfs.ItemInfo[m] !== "undefined") {
                                                if (shelf.ItemInfo[m].ItemID == shelfs.ItemInfo[m].ItemID) {
                                                    positionChanged = "Y";
                                                } else {
                                                    //ASA-1525 Issue 1 & 2 Start
                                                    // posigtionChangeItems.push(shelfs.ItemInfo[m].ItemID);
                                                    positionChangeItemInfo[positionChangeItemInfoCount] = {};
                                                    positionChangeItemInfo[positionChangeItemInfoCount].Module = modules.Module;
                                                    positionChangeItemInfo[positionChangeItemInfoCount].Shelf = shelfs.Shelf;
                                                    positionChangeItemInfo[positionChangeItemInfoCount].ItemID = shelfs.ItemInfo[m].ItemID;
                                                    positionChangeItemInfoCount++;
                                                    //ASA-1525 Issue 1 & 2 End
                                                }
                                            } else {
                                                //ASA-1525 Issue 1 & 2 Start
                                                positionChangeItemInfo[positionChangeItemInfoCount] = {};
                                                positionChangeItemInfo[positionChangeItemInfoCount].Module = modules_info.Module;
                                                positionChangeItemInfo[positionChangeItemInfoCount].Shelf = shelf.Shelf;
                                                positionChangeItemInfo[positionChangeItemInfoCount].ItemID = shelf.ItemInfo[m].ItemID;
                                                positionChangeItemInfoCount++;
                                            } //ASA-1525 Issue 1 & 2 End
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            });
        } //ASA-1803 ended
        //ASA-1525 #1 End

        //SET REMOVED ITEMS
        $.each(g_pog_json[p_comViewIndex].ModuleInfo, function (i, modules_info) {
            //ASA-1464 Issue 1
            $.each(modules_info.ShelfInfo, function (k, shelf) {
                if (valid_values.indexOf(shelf.ObjType) !== -1) {
                    $.each(shelf.ItemInfo, function (m, it) {
                        var selectedObject = g_scene_objects[p_comViewIndex].scene.children[2].getObjectById(it.ObjID);
                        if (g_deletedItems.indexOf(it.ItemID) !== -1) {
                            if (g_show_live_image == "N") {
                                selectedObject.material.color.setHex(0xff6666);
                            }
                            g_pog_json[p_comViewIndex].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0xff6666";
                        } else {
                            //ASA-1464 Issue 1
                            if (g_show_live_image == "N") {
                                selectedObject.material.color.setHex(0xffffff);
                            }
                            g_pog_json[p_comViewIndex].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0xFFFFFF";
                        }
                    });
                }
            });
        });
        render(p_comViewIndex);

        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
            $.each(modules_info.ShelfInfo, function (k, shelf) {
                if (valid_values.indexOf(shelf.ObjType) !== -1) {
                    $.each(shelf.ItemInfo, function (m, it) {
                        //ASA-1525 Issue 1 & 2 Start
                        var isItemPoisitionChanged = false;
                        for (let itemInfo of positionChangeItemInfo) {
                            if (itemInfo.ItemID == it.ItemID && itemInfo.Shelf == shelf.Shelf && itemInfo.Module == modules_info.Module) {
                                isItemPoisitionChanged = true;
                                break;
                            }
                        }
                        //ASA-1525 Issue 1 & 2 End
                        if ((isItemPoisitionChanged || deletedShelves.indexOf(shelf.Shelf) !== -1) && p_compare_pog == "N") {
                            //ASA-1803 Issue 3
                            //ASA-1525 Issue 1 & 2
                            // if (posigtionChangeItems.indexOf(it.ItemID) !== -1 || deletedShelves.indexOf(shelf.Shelf) !== -1) {      //ASA-1525 Issue 1 & 2
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                            if (g_show_live_image == "N") {
                                selectedObject.material.color.setHex(0x8080ff);
                            }

                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0x8080ff";
                        } else {
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                            if (g_show_live_image == "N") {
                                selectedObject.material.color.setHex(0xffffff);
                            }

                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0xFFFFFF";
                        }
                        if (addedItems.indexOf(it.ItemID) !== -1) {
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                            if (g_show_live_image == "N") {
                                selectedObject.material.color.setHex(0x80ff80);
                            }

                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0x80ff80";
                        }
                        if (it.NewYN == "Y") {
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                            if (g_show_live_image == "N") {
                                selectedObject.material.color.setHex(0x808080);
                            }
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = "0x808080";
                        }
                    });
                }
            });
        });
        render(p_pog_index);
    }
    logDebug("function : two_pog_diff_checker", "E");
}
async function reset_colors(p_resetType, p_pog_index) {
    logDebug("function : reset_colors; resetType : " + p_resetType, "S");
    if (p_resetType == "O" && g_colorBackup == "N" && typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                var shelfs = modules_info.ShelfInfo;
                var shelfs_comp = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                $.each(shelfs, function (j, shelfs) {
                    $.each(shelfs.ItemInfo, function (l, it) {
                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l].OldItemColor = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l].Color;
                    });
                });
            }
        });
        g_colorBackup = "Y";
    } else if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                var shelfs = modules_info.ShelfInfo;
                var shelfs_comp = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                $.each(shelfs, function (j, shelfs) {
                    $.each(shelfs.ItemInfo, function (l, it) {
                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l].Color = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l].OldItemColor;
                    });
                });
            }
        });
        g_colorBackup = "N";
    }
    render(p_pog_index);
    logDebug("function : reset_colors", "E");
}

function blockUIForDownload(p_reportName, p_pog_index, p_allPogFlag) {
    logDebug("function : blockUIForDownload; reportName : " + p_reportName, "S");
    var new_pog_code = "";
    if (p_allPogFlag == "Y") {
        var i = 0;
        for (const jsonData of g_pog_json) {
            if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                new_pog_code = new_pog_code + "$" + jsonData.POGCode;
            }
            i++;
        }
        new_pog_code.replace(/(^\$)/, "");
    } else {
        new_pog_code = g_pog_json[p_pog_index].POGCode;
    }
    var argumentNameArray = [];
    var argumentValueArray = [];
    argumentNameArray[0] = "AI_PROCESSING_IND";
    argumentValueArray[0] = "N";
    apex.server.process(
        "dummy", {
        p_arg_names: argumentNameArray,
        p_arg_values: argumentValueArray,
    }, {
        dataType: "text",
        success: function (pData) {
            wait_icon_display = apex.widget.waitPopup();
            $.blockUI({
                message: null,
            });
            var l_url = "f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=DOWNLOAD_POG_ITEM_DTL:NO::AI_RANDOM_STRING,AI_POG_CODE,AI_POG_VERSION,AI_REPORT_NAME:" + new Date().getTime() + "," + new_pog_code + "," + g_pog_json[p_pog_index].Version + "," + p_reportName;
            apex.navigation.redirect(l_url);
            g_fileDownloadCheckTimer = window.setInterval(function () {
                apex.server.process(
                    "GET_REPORT_RUNNING_STATE", {
                    x01: apex.item("AI_PROCESSING_IND").getValue(),
                }, {
                    dataType: "text",
                    success: function (pData) {
                        if ($.trim(pData) == "Y") {
                            if (typeof wait_icon_display !== "undefined") {
                                wait_icon_display.remove();
                            }
                            $.unblockUI();
                            finishDownload();
                            logDebug("function : blockUIForDownload", "E");
                        }
                    },
                });
            }, 1000);
        },
    });
    logDebug("function : blockUIForDownload", "E");
}

function finishDownload() {
    logDebug("function : finishDownload", "S");
    window.clearInterval(g_fileDownloadCheckTimer);
    logDebug("function : finishDownload", "E");
}

async function download_pog_report(p_reportName, p_pog_index, p_allPogFlag) {
    logDebug("function : download_pog_report; reportName : " + p_reportName, "S");
    try {
        //ASA-1138
        if (p_reportName == "POG_EXCEPTION_WPD_SCRN") {
            await identifyOverhungItems(p_pog_index, "N", "Y"); //ASA-1412,//Regression issue 1 20242806
        }
        var new_pogjson = p_allPogFlag == "N" ? [g_pog_json[p_pog_index]] : g_pog_json;
        await set_shelf_item_index(p_pog_index);
        await save_pog_to_json(new_pogjson);
        blockUIForDownload(p_reportName, p_pog_index, p_allPogFlag);
    } catch (err) {
        error_handling(err);
        removeLoadingIndicator(regionloadWait);
    }
    logDebug("function : download_pog_report", "E");
}

async function enable_maximize_facings(p_optionType, p_pog_index) {
    logDebug("function : enable_maximize_facings; optionType : " + p_optionType, "S");
    addLoadingIndicator();
    var originalCanvas = p_pog_index;
    if (p_optionType == "S") {
        if (g_max_facing_enabled == "N") {
            g_max_facing_enabled = "Y";
            $(".max_facing").addClass("item_label_active");
        } else {
            g_max_facing_enabled = "N";
            $(".max_facing").removeClass("item_label_active");
        }
        if (g_all_pog_flag == "Y") {
            var z = 0;
        } else {
            var z = p_pog_index;
        }
    } else if (p_optionType == "A") {
        if (g_all_pog_flag == "Y") {
            var z = 0;
        } else {
            var z = p_pog_index;
        }

        for (const pogJson of g_pog_json) {
            if ((z !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                g_camera = g_scene_objects[z].scene.children[0];
                g_world = g_scene_objects[z].scene.children[2];

                g_temp_cut_arr.push(JSON.parse(JSON.stringify(g_pog_json[z].ModuleInfo)));
                g_max_facing_enabled_all = "N";
                var i = 0;
                for (const modules_info of g_pog_json[z].ModuleInfo) {
                    if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                        var j = 0;
                        for (const shelfs of modules_info.ShelfInfo) {
                            if (shelfs.ObjType == "SHELF") {
                                //ASA-1284 to check if crush is apply to fixel then not set to reset auto crush
                                var itemList = shelfs.ItemInfo;
                                await set_auto_facings(i, j, -1, itemList, "B", "S", "D", z, "Y"); // ASA-1170
                                if (reorder_items(i, j, z)) {
                                    var return_val = await recreate_all_items(i, j, "SHELF", "N", -1, -1, shelfs.ItemInfo.length, "N", "N", -1, -1, z, "", z, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                                }
                            }
                            j++;
                        }
                    }
                    i++;
                }

                g_delete_details.multi_delete_shelf_ind = "N";
                g_undo_all_obj_arr = [];
                g_redo_final_obj_arr = [];
                g_redo_all_obj_arr = [];
                g_undo_all_obj_arr.push(g_temp_cut_arr);
                g_undo_all_obj_arr.push(g_undo_details);
                g_undo_all_obj_arr.previousAction = "MAX_ALL_FACINGS";
                g_undo_all_obj_arr.g_MultiObjects = "Y";
                g_undo_all_obj_arr.multi_delete_shelf_ind = "N";
                g_undo_final_obj_arr.push(g_undo_all_obj_arr);
                g_delete_details = [];
                g_multi_drag_shelf_arr = [];
                g_multi_drag_item_arr = [];
                g_cut_copy_arr = [];
                cut_copy_arr1 = [];
                g_undo_details = [];
                g_mselect_drag = "N";
                g_multiselect = "N";
                g_undo_all_obj_arr = [];
                g_temp_cut_arr = [];
            }
            if (g_all_pog_flag == "Y") {
                z++;
            } else {
                break;
            }
        }
        animate_all_pog();
        $(".max_facing_all").removeClass("enable_maximize_facings_All");
        g_scene = g_scene_objects[originalCanvas].scene;
        g_camera = g_scene_objects[originalCanvas].scene.children[0];
    }
    removeLoadingIndicator(regionloadWait);
    logDebug("function : enable_maximize_facings", "E");
}
//this function is used when drop a item in any place. it will find out the depth facing and set it to item according to dropped shelf.
//g_max_facing_enabled = 'Y' it will calculate vertical facings according to max merch.
async function set_auto_facings(p_moduleIndex, p_shelfIndex, p_itemIndex, p_itemList, p_facingType, p_facingsOf, p_itemType, p_pog_index, p_maximizeAll = "N") {
    logDebug("function : set_auto_facings; moduleIndex : " + p_moduleIndex + "; ShelfIndex : " + p_shelfIndex + "; itemIndex : " + p_itemIndex + "; facingType : " + p_facingType + "; facingsOf : " + p_facingsOf + "; itemType : " + p_itemType, "S");
    max_facings_allowed = $v("P25_POGCR_AUTO_MAX_VFACING");
    var vertFacingDefault = $v("P25_POGCR_DFLT_VERT_FACING");
    var max_depth = 0;

    var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];

    if (p_facingsOf == "S") {
        if (p_facingType == "D" || p_facingType == "B") {
            if (shelfs.ObjType == "SHELF" || shelfs.ObjType == "CHEST" || (shelfs.ObjType == "HANGINGBAR" && g_auto_hangbar_facings == "Y") || (shelfs.ObjType == "PEGBOARD" && shelfs.AutoFillPeg == "Y")) {
                //ASA-1109
                var z = 0;
                for (const items of p_itemList) {
                    if (items.CrushD == 0 && items.CrushHoriz == 0 && items.CrushVert == 0) {
                        // ASA-1272
                        maximizeItemFacings("D", p_moduleIndex, p_shelfIndex, z, max_facings_allowed, vertFacingDefault, p_itemType, p_pog_index, p_maximizeAll); // ASA-1170
                    }
                    z++;
                }
            }
        }

        if ((g_max_facing_enabled == "Y" || p_maximizeAll == "Y") && g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ObjType == "SHELF") {
            if (p_facingType == "H" || p_facingType == "B") {
                var modules = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex];
                var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
                max_merch = get_shelf_max_merch(modules, shelfs, p_moduleIndex, p_shelfIndex, p_pog_index, parseFloat($v("P25_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload
                var z = 0;
                for (const items of p_itemList) {
                    if (items.Item !== "DIVIDER") {
                        maximizeItemFacings("H", p_moduleIndex, p_shelfIndex, z, max_facings_allowed, vertFacingDefault, p_itemType, p_pog_index, p_maximizeAll); // ASA-1170
                        if (items.CrushVert !== 0) {
                            // ASA-1272
                            crushItem(p_pog_index, p_moduleIndex, p_shelfIndex, z, "H", "Y", [items.D], [z]);
                        }
                    }
                    z++;
                }
            }
        }
    } else if (p_facingsOf == "I") {
        maximizeItemFacings("B", p_moduleIndex, p_shelfIndex, p_itemIndex, max_facings_allowed, vertFacingDefault, p_itemType, p_pog_index, p_maximizeAll); // ASA-1170
    }

    logDebug("function : set_auto_facings", "E");
}

//this function is used to move the shelf from arrow keys.
async function drag_fixel(p_moduleIndex, p_shelfIndex, p_itemIndex, p_dragDirection, p_pog_index) {
    //ASA-1085
    logDebug("function : drag_fixel; moduleIndex : " + p_moduleIndex + "; shelfIndex : " + p_shelfIndex + "; dragDirection : " + p_dragDirection, "S");
    if (g_prevKeyPressed == p_dragDirection && g_validationAlert == "Y") { }
    else {
        g_validationAlert = "N";
        if (p_itemIndex === "" || typeof p_itemIndex == "undefined") {
            p_itemIndex = g_current_div_index;
        }
        if (typeof p_itemIndex != "undefined" && p_itemIndex != -1 && p_itemIndex !== "") {
            g_item_index = p_itemIndex;
            var item_type = g_pog_json[0].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[g_item_index].Item;
        }

        //ASA-1711 issue 2, added g_multiselect == 'Y"
        if (g_shelf_edit_flag == "Y" || item_type == "DIVIDER" || g_multiselect == "Y") {
            var filteredObjects = g_delete_details.filter((item) => item.IIndex === -1); //ASA-1711
            if ((g_shelf_edit_flag == "Y" || g_multiselect == "Y") && filteredObjects.length > 0) {
                g_shelf_edit_flag = "Y"; //ASA-1711 Issue 1, added when multi select with mouse drag
                let old_delete_details = g_delete_details; //ASA-1711 Issue 1
                g_delete_details["is_dragging"] = "Y"; //ASA-1711
                for (let i = 0; i < filteredObjects.length; i++) {
                    var isShelfInsidePOG = await shelfInsidePOG(p_pog_index, filteredObjects[i].MIndex, filteredObjects[i].SIndex); //ASA-1758
                    await drag_shelf(p_dragDirection, p_pog_index, filteredObjects[i].MIndex, filteredObjects[i].SIndex, isShelfInsidePOG);
                }
                g_delete_details = old_delete_details; //ASA-1711 Issue 1
            } else {
                var isShelfInsidePOG = await shelfInsidePOG(p_pog_index, g_module_index, g_shelf_index); //ASA-1758
                drag_shelf(p_dragDirection, p_pog_index, -1, -1, isShelfInsidePOG);
            }
        }
    }

    g_prevKeyPressed = p_dragDirection;
    logDebug("function : drag_fixel", "E");
}

async function shelfInsidePOG(p_pog_index, p_module_index, p_shelf_index) {
    try {
        var pogModules = g_pog_json[p_pog_index].ModuleInfo;
        var shelfStart = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2);
        var shelfEnd = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].X + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].W / 2);
        var shelfTop = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2);
        var shelfBottom = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H / 2);

        for (module of pogModules) {
            if (typeof module.ParentModule == "undefined" || module.ParentModule == null) {
                var moduleTop = wpdSetFixed(module.Y + module.H / 2);
                var moduleBottom = wpdSetFixed(module.Y - module.H / 2);
                var moduleStart = wpdSetFixed(module.X - module.W / 2);
                var moduleEnd = wpdSetFixed(module.X + module.W / 2);
                if (!(shelfTop < moduleBottom || shelfBottom > moduleTop) && !(shelfEnd < moduleStart || shelfStart > moduleEnd)) {
                    return "Y";
                }
            }
        }
        return "N";
    } catch (err) {
        error_handling(err);
    }
}
////this function is used to move the shelf from arrow keys.
//system will check next notch and move the shelf.
//p_shelfInsidePOG new paramter added ASA-1758
async function drag_shelf(p_dragDirection, p_pog_index, p_module_index = -1, p_shelf_index = -1, p_shelfInsidePOG = "Y") {
    logDebug("function : drag_shelf; dragDirection : " + p_dragDirection, "S");
    var l_module_index = p_module_index == -1 ? g_module_index : p_module_index; //ASA-1711
    var l_shelf_index = p_shelf_index == -1 ? g_shelf_index : p_shelf_index; //ASA-1711
    var dragShelfPix = parseInt($v("P25_POGCR_SHELF_DRAG_PIXEL"));
    var notchIncrement = parseInt($v("P25_POGCR_DFT_NOTCH_VAL"));
    var shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index];
    var modules = g_pog_json[p_pog_index].ModuleInfo[l_module_index];
    var addX = "Y";
    if (typeof dragShelfPix !== "undefined" && dragShelfPix <= 0) {
        dragShelfPix = 1 / 100;
    } else {
        dragShelfPix = dragShelfPix / 100;
    }
    //STart ASA-1101
    if (p_shelfInsidePOG == "Y" && shelf_dtl.X > modules.X - modules.Y / 2 && shelf_dtl.X < modules.X + modules.Y / 2 && modules.NotchSpacing > 0 && (typeof g_item_index == "undefined" || g_item_index == -1)) {
        var notchStart = g_pog_json[p_pog_index].BaseH + modules.NotchStart + modules.NotchSpacing - modules.NotchSpacing / 2;

        if (p_dragDirection == "U" && shelf_dtl.Y + shelf_dtl.H / 2 <= g_pog_json[p_pog_index].BaseH) {
            var add_value = notchStart - shelf_dtl.Y + shelf_dtl.H / 2;
            dragShelfPix = shelf_dtl.Y + shelf_dtl.H / 2 + add_value;
            addX = "N";
        } else if (p_dragDirection == "U" && shelf_dtl.Y + shelf_dtl.H / 2 >= g_pog_json[p_pog_index].BaseH) {
            dragShelfPix = shelf_dtl.Y + modules.NotchSpacing * notchIncrement;
            addX = "N";
        } else if (p_dragDirection == "D" && shelf_dtl.Y + shelf_dtl.H / 2 >= g_pog_json[p_pog_index].BaseH) {
            dragShelfPix = shelf_dtl.Y - modules.NotchSpacing * notchIncrement;
            addX = "N";
        }
    }
    //End 1101
    var prevX = shelf_dtl.X;
    var prevY = shelf_dtl.Y;
    var oldModuleIndex = l_module_index;
    var oldShelfIndex = l_shelf_index;
    console.log("g_item_index drag shelf", g_item_index, l_module_index, l_shelf_index, shelf_dtl);
    if (typeof g_item_index !== "undefined" && g_item_index != -1 && g_item_index !== "") {
        var item_dtl = shelf_dtl.ItemInfo;
        var i = 0;
        var item_type = g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index].ItemInfo[g_item_index];
        var divbtm = shelf_dtl.ItemInfo[g_item_index].Y - shelf_dtl.ItemInfo[g_item_index].H / 2;
        var shelftop = shelf_dtl.Y + shelf_dtl.H / 2;
        var obj = item_type.Item;
        if (p_dragDirection == "U") {
            var prevx = item_type.X;
            var prevy = item_type.Y;
        } else if (p_dragDirection == "D") {
            var prevx = item_type.X;
            var prevy = item_type.Y;
        }
        g_current_div_index = g_item_index;
    }

    if (typeof obj !== "undefined" && obj == "DIVIDER" && g_shelf_object_type == "BASKET") {
        //ASA-1085
        if (p_dragDirection == "U") {
            var itemX = item_type.X;
            var itemY = item_type.Y + dragShelfPix;
        } else if (p_dragDirection == "D") {
            var itemX = item_type.X;
            var itemY = item_type.Y - dragShelfPix;
        } else if (p_dragDirection == "L") {
            var itemX = item_type.X - dragShelfPix;
            var itemY = item_type.Y;
        } else if (p_dragDirection == "R") {
            var itemX = item_type.X + dragShelfPix;
            var itemY = item_type.Y;
        }
        var val = validate_divider(p_dragDirection, itemX, itemY, shelf_dtl);
        if (val == "Y") {
            var undoObjectsInfo = [];
            var items = [];
            items.push(g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index]);
            undoObjectsInfo.moduleIndex = l_module_index;
            undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[l_module_index].Module;
            undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[l_module_index].MObjID;
            undoObjectsInfo.shelfIndex = l_shelf_index;
            undoObjectsInfo.actionType = "ITEM_DELETE";
            undoObjectsInfo.startCanvas = g_start_canvas;
            undoObjectsInfo.objectID = g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index].SObjID;
            undoObjectsInfo.g_deletedItems = items;
            undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index])));
            g_allUndoObjectsInfo.push(undoObjectsInfo);
            logFinalUndoObjectsInfo("ITEM_DELETE", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
            var i = 0;
            g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index].ItemInfo[g_item_index].X = itemX;
            g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index].ItemInfo[g_item_index].Y = itemY;
            g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index].ItemInfo[g_item_index].YDistance = itemY - shelftop;
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index].ItemInfo[g_item_index].ObjID);
            selectedObject.position.set(itemX, itemY);
            if (p_dragDirection == "U" || p_dragDirection == "D") {
                g_intersected = [];
                var return_val = await recreate_all_items(l_module_index, l_shelf_index, shelf_dtl.ObjType, "N", -1, -1, shelf_dtl.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                var item_dtl = g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[l_shelf_index].ItemInfo;
                for (var item of item_dtl) {
                    if (item.Item == "DIVIDER" && g_current_div_index == i) {
                        var selectObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item.ObjID);
                        g_intersected.push(selectObject);
                        console.log("selectObject", g_intersected);
                        break;
                    }
                    i++;
                }
                render_animate_selected();
            }
        } else {
            alert(get_message("POGCR_VALIDATE_DIVIDER"));
            g_validationAlert = "Y";
            if (p_dragDirection == "U" || p_dragDirection == "D") {
                var return_val = await recreate_all_items(l_module_index, l_shelf_index, shelf_dtl.ObjType, "N", -1, -1, shelf_dtl.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
            }
        }
    } else {
        var cap_count = 100;
        var notch_no = 0; //change in 1254 to start value from 0
        var shelf_y = wpdSetFixed(shelf_dtl.Y + shelf_dtl.H / 2); //).toFixed(4)); //p_dragDirection == 'U' ? shelf_dtl.Y + (shelf_dtl.H / 2) + dragShelfPix : shelf_dtl.Y + (shelf_dtl.H / 2) - dragShelfPix;
        for (k = 0; k < cap_count; k++) {
            if (shelf_y < wpdSetFixed(g_pog_json[p_pog_index].BaseH + modules.NotchStart / 2) && modules.NotchStart > 0) {
                //ASA-1292
                notch_no = -1;
                break;
            } else if (shelf_y <= wpdSetFixed(g_pog_json[p_pog_index].BaseH + modules.NotchStart / 2) && modules.NotchStart > 0) {
                notch_no = 0;
                break;
            } else if (shelf_y <= wpdSetFixed(g_pog_json[p_pog_index].BaseH) && modules.NotchStart == 0) {
                //ASA-1268 Added else
                notch_no = 0;
                break;
            } else if (shelf_y <= wpdSetFixed(g_pog_json[p_pog_index].BaseH + modules.NotchStart + modules.NotchSpacing * k)) {
                notch_no = k;
                break;
            }
        }

        /*for (k = 1; k < cap_count; k++) {
        if (shelf_dtl.Y - (shelf_dtl.H / 2) < g_pog_json[p_pog_index].BaseH + (modules.NotchStart / 2) && modules.NotchStart > 0) {
        notch_no = -1;
        break;
        } else if (shelf_dtl.Y + (shelf_dtl.H / 2) <= g_pog_json[p_pog_index].BaseH + modules.NotchStart && modules.NotchStart > 0) {
        notch_no = 0;
        break;
        } else if (shelf_dtl.Y + (shelf_dtl.H / 2) <= g_pog_json[p_pog_index].BaseH) { //ASA-1268 Added else
        notch_no = 0;
        break;
        } else if (shelf_dtl.Y + (shelf_dtl.H / 2) <= ((g_pog_json[p_pog_index].BaseH + modules.NotchStart)) + modules.NotchSpacing * k) {
        notch_no = k;
        break;
        }
        }*/

        if (p_dragDirection == "U") {
            //ASA-1282 -S
            //Start 1101
            var shelfX = shelf_dtl.X;
            //   if (addX == "Y") {
            if (g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchSpacing > 0 && p_shelfInsidePOG == "Y") {
                if (notch_no == -1) {
                    var shelfY = g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2;
                    shelf_dtl.NotchNo = 0;
                    notch_no = 0;
                    if (notch_no == 0) {
                        notch_no += 1; // Increase notch_no by 1
                        if (g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart > 0) {
                            var shelfY = g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart - shelf_dtl.H / 2;
                        } else {
                            var shelfY = g_pog_json[p_pog_index].BaseH;
                        }
                    }
                } else if (notch_no >= 0) {
                    // if ((parseFloat((shelf_dtl.Y - (shelf_dtl.H / 2)).toFixed(4)) == parseFloat((g_pog_json[p_pog_index].BaseH).toFixed(4)) && g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart > 0) || ((g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart) + (g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchSpacing * notch_no) !== parseFloat((shelf_dtl.Y + (shelf_dtl.H / 2)).toFixed(4)) && (parseFloat((shelf_dtl.Y - (shelf_dtl.H / 2)).toFixed(4)) <= parseFloat((g_pog_json[p_pog_index].BaseH).toFixed(4)) && g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart == 0))) {
                    //     console.log('nothing');
                    // } else {
                    //     notch_no += 1; // Increase notch_no by 1
                    // }

                    if (!((wpdSetFixed(shelf_dtl.Y - shelf_dtl.H / 2) == wpdSetFixed(g_pog_json[p_pog_index].BaseH) && g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart > 0) || (wpdSetFixed(g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchSpacing * notch_no) !== wpdSetFixed(shelf_dtl.Y + shelf_dtl.H / 2) && wpdSetFixed(shelf_dtl.Y - shelf_dtl.H / 2) <= wpdSetFixed(g_pog_json[p_pog_index].BaseH) && g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart == 0))) {
                        notch_no += 1; // Increase notch_no by 1
                    }
                    // var notch_center = (g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart) + (g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchSpacing * notch_no) + (g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchSpacing / 2);

                    if (wpdSetFixed(shelf_dtl.Y - shelf_dtl.H / 2) >= wpdSetFixed(g_pog_json[p_pog_index].BaseH)) {
                        var shelfY = wpdSetFixed(g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchSpacing * notch_no - shelf_dtl.H / 2);
                    } else {
                        var shelfY = wpdSetFixed(g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2);
                    }
                }
                shelf_dtl.NotchNo = notch_no; //ASA-1268 Prasanna
            } else {
                var shelfY = shelf_dtl.Y + dragShelfPix;
                if (p_shelfInsidePOG == "N") {
                    shelf_dtl.NotchNo = 0;
                }
            }
        } else if (p_dragDirection == "D") {
            var shelfX = shelf_dtl.X;
            if (wpdSetFixed(shelf_dtl.Y + shelf_dtl.H / 2) < wpdSetFixed(g_pog_json[p_pog_index].BaseH + modules.NotchStart / 2) && p_shelfInsidePOG == "Y") {
                var shelfY = wpdSetFixed(g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2);
            } else {
                if (g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchSpacing > 0 && p_shelfInsidePOG == "Y") {
                    if ((notch_no) => 0) {
                        //ASA-1258if (notch_no == 0){
                        if (notch_no == 0) {
                            var shelfY = wpdSetFixed(g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2); //ASA-1258
                        } else if (notch_no == -1) {
                            notch_no = 0;
                            alert(get_message("POGCR_NO_NOTCH_AVAILABLE"));
                            var shelfY = wpdSetFixed(g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2); //ASA-1258
                        } else {
                            var shelfY = wpdSetFixed(g_pog_json[p_pog_index].BaseH + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchStart + g_pog_json[p_pog_index].ModuleInfo[l_module_index].NotchSpacing * (notch_no - 1) - shelf_dtl.H / 2); //ASA-1258
                        }
                    }
                    shelf_dtl.NotchNo = notch_no; //ASA-1268 Prasanna
                } else {
                    var shelfY = shelf_dtl.Y - dragShelfPix;
                    if (p_shelfInsidePOG == "N") {
                        shelf_dtl.NotchNo = 0;
                    }
                }
            }
            if (wpdSetFixed(shelfY - shelf_dtl.H / 2) < wpdSetFixed(g_pog_json[p_pog_index].BaseH) && p_shelfInsidePOG == "Y") {
                shelfY = wpdSetFixed(g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2);
            }
            //End 1101
        } else if (p_dragDirection == "L") {
            //ASA-1282-E
            var shelfX = shelf_dtl.X - dragShelfPix;
            var shelfY = shelf_dtl.Y;
        } else if (p_dragDirection == "R") {
            var shelfX = shelf_dtl.X + dragShelfPix;
            var shelfY = shelf_dtl.Y;
        }
        var shelfs = shelf_dtl;
        var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(shelfX, shelfY, g_shelf_edit_flag, l_module_index, l_shelf_index, shelfs, p_pog_index);
        var cnfrm = "Y"; //ASA-1242 -S
        //ASA-1361 20240501
        // if ($v("P25_POGCR_COMBINATION_SHELF") == "Y") {
        cnfrm = await getconfirm_shelfmove(p_pog_index);
        // }
        if (g_shelf_edit_flag == "Y") {
            org_shelf_x = shelf_dtl.X;
            org_shelf_y = shelf_dtl.Y;
            org_shelf_z = shelf_dtl.Z;
            shelf_dtl.X = shelfX;
            shelf_dtl.Y = shelfY;

            if (g_pog_json[p_pog_index].ModuleInfo[curr_module].H > 0.1 && g_shelf_object_type !== "ROD" && g_shelf_object_type !== "TEXTBOX" && g_auto_position_ind == "Y" && cnfrm == "Y") {
                /*auto position button is on find the module behind the fixel drop position and find the corner of
                module and please fixel there*/
                await auto_position_shelf(l_module_index, curr_module, l_shelf_index, shelf_rotate_hit, shelfX, shelfY, "N", p_pog_index);
            }
        }
        //ASA-1129
        var items_arr = g_pog_json[p_pog_index].ModuleInfo[curr_module].ShelfInfo[l_shelf_index].ItemInfo;
        var allow_crush = shelf_dtl.AllowAutoCrush;
        if (g_shelf_edit_flag == "Y" && cnfrm == "Y") {
            if (g_max_facing_enabled == "Y") {
                reset_auto_crush(l_module_index, l_shelf_index, -1, p_pog_index, l_module_index, l_shelf_index, p_pog_index); //ASA-1343 issue 1 //ASA-1685
            }
            var res = await set_auto_facings(curr_module, l_shelf_index, -1, items_arr, "B", "S", "D", p_pog_index);
        }
        if (g_shelf_edit_flag == "Y" && g_shelf_object_type !== "ROD" && g_shelf_object_type !== "TEXTBOX" && shelf_rotate_hit == "N" && cnfrm == "Y") {
            var mod_ind = curr_module == l_module_index ? l_module_index : curr_module;

            let result = await set_all_items(mod_ind, l_shelf_index, shelfX, shelfY, g_shelf_edit_flag, "N", "Y", p_pog_index, p_pog_index);
            var validate_passed = await validate_shelf_min_distance(mod_ind, l_shelf_index, shelfY, items_arr, allow_crush, l_module_index, shelfX, "Y", shelfs, p_pog_index);
        } else if (shelf_rotate_hit == "Y") {
            validate_passed = "N";
        } else {
            validate_passed = "Y";
        }
        if (cnfrm == "N") {
            validate_passed = "N";
        }

        if ((validate_passed == "Y" || validate_passed == "R") && g_shelf_edit_flag == "Y") {
            //identify if any change in POG
            g_pog_edited_ind = "Y";
            var shelfInfo = shelf_dtl;
            var shelfObjId = shelf_dtl.SObjID;
            var objType = shelf_dtl.ObjType;
            var moduleObjId = g_pog_json[p_pog_index].ModuleInfo[l_module_index].MObjID;
            //set json to new location in array.
            //ASA-1722, changed 8th param p_splice_shelf to "N" was "Y"
            var [mod_ind, shelf_ind] = await set_shelf_after_drag(validate_passed, g_shelf_edit_flag, l_module_index, curr_module, l_shelf_index, shelfX, shelfY, "N", "Y", "", "", p_pog_index, p_pog_index);
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].SObjID);
            // var shelfz = g_pog_json[p_pog_index].ModuleInfo[l_module_index].ShelfInfo[shelf_ind].ObjType == "TEXTBOX" ? 0.0021 : 0.008;  //Reg 4 20241223
            selectedObject.position.set(shelfX, shelfY, selectedObject.position.z); //Reg 4 20241223
            g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].Combine = "N";
            //ASA-1892 Issue10 Start
            objType !== "PALLET" && await generateCombinedShelfs(p_pog_index, mod_ind, shelf_ind, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters
            //ASA-1892 Issue10 End
            g_undo_details = [];
            g_undo_obj_arr = [];
            g_undo_supp_obj_arr = [];
            //store details for undo process.
            g_redo_final_obj_arr = []; //empty redo log on new drag of shelf
            g_redo_all_obj_arr = [];

            var spreadProduct = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].SpreadItem;
            var undoObjectsInfo = [];
            var itemsDel = [];
            var objectID = shelf_dtl.SObjID;
            undoObjectsInfo.moduleIndex = l_module_index;
            undoObjectsInfo.shelfIndex = l_shelf_index;
            undoObjectsInfo.actionType = "SHELF_DRAG";
            undoObjectsInfo.startCanvas = g_start_canvas;
            undoObjectsInfo.objectID = objectID;
            undoObjectsInfo.g_deletedItems = itemsDel;
            undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[l_module_index].MObjID;
            undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[l_module_index].Module;
            undoObjectsInfo.push(JSON.parse(JSON.stringify(shelf_dtl)));
            // var newItemInfo = JSON.parse(JSON.stringify(shelf_dtl.ItemInfo));
            g_allUndoObjectsInfo.push(undoObjectsInfo);
            logFinalUndoObjectsInfo("SHELF_DRAG", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
            g_allUndoObjectsInfo = [];
            if (g_show_max_merch == "Y" || l_show_max_merch_comp == "Y") {
                async function doSomething() {
                    let result = await add_merch("N", p_pog_index);
                    let result1 = await add_merch("Y", p_pog_index);
                }
                doSomething();
            }
            //recreate the orientation view if any present
            async function recreate_view() {
                var returnval = await recreate_compare_views(g_compare_view, "N");
            }
            recreate_view();
            // if (g_show_notch_label == "Y") { ASA-1318 Task-2 to update the value of notch no in the status bar even if the notch label is not enabled from the renumbering.
            var returnval = await update_single_notch_label("Y", mod_ind, shelf_ind, $v("P25_NOTCH_HEAD"), "", p_pog_index, "N");
            // }
            if (g_fixel_label == "Y") {
                var returnval = await show_fixel_labels("Y", p_pog_index);
            }

            if (items_arr.length > 0) {
                //capture the module is edit or not to create changed text box
                g_pog_json[p_pog_index].ModuleInfo[mod_ind].EditFlag = "Y";
            }
            if (g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo.length > 0) {
                g_scene.updateMatrixWorld();
            }
            render(p_pog_index);
            g_module_index = mod_ind;
            g_shelf_index = shelf_ind;
        } else if (validate_passed == "N" && g_shelf_edit_flag == "Y") {
            //if rotated shelf hit on any module
            if (shelf_rotate_hit == "Y") {
                alert(get_message("LOST_FROM_SHELF_ROTATION_ERR", shelf_dtl.Shelf, g_pog_json[p_pog_index].POGCode + g_pog_json[p_pog_index].ModuleInfo[l_module_index].Module));
            }
            g_validationAlert = "Y";
            if (shelf_dtl.ItemInfo.length > 0 && shelf_rotate_hit == "N") {
                async function doSomething() {
                    let result = await set_all_items(l_module_index, l_shelf_index, prevX, prevY, g_shelf_edit_flag, "E", "Y", p_pog_index, p_pog_index);
                }
                doSomething();
            }
            shelf_dtl.X = prevX;
            shelf_dtl.Y = prevY;
            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelf_dtl.SObjID);
            // var shelfz = shelf_dtl.ObjType == "TEXTBOX" ? 0.0021 : 0.008;        //Reg 4 20241223
            selectedObject.position.set(prevX, prevY, selectedObject.position.z); //Reg 4 20241223
            g_module_index = oldModuleIndex;
            g_shelf_index = oldShelfIndex;
            render(p_pog_index);
        }
    }
    logDebug("function : drag_shelf", "E");
}

function delete_pog_list() {
    logDebug("function : delete_pog_list", "S");
    var gridView = apex.region("ig_pog_list").widget().interactiveGrid("getViews").grid;
    var selector = gridView.getSelectedRecords();
    var l_arr_seq_id = [];
    $.each(selector, function (i, r) {
        seq_id = gridView.model.getValue(r, "SEQUENCE_ID");
        l_arr_seq_id.push(seq_id);
    });
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
    //Task_29818 - End
    if (l_arr_seq_id.length > 0) {
        //Task_29818 - Start
        // ax_message.confirm(get_message("DELETE_CONFIRM_MSG"), function (e) {
        //     if (e) {
        //         apex.server.process(
        //             "DELETE_POG_LIST", {
        //             f01: l_arr_seq_id,
        //         }, {
        //             dataType: "text",
        //             success: function (pData) {
        //                 if ($.trim(pData) != "") {
        //                     raise_error(pData);
        //                 } else {
        //                     apex.region("ig_pog_list").widget().interactiveGrid("getViews", "grid").model.clearChanges();
        //                     apex.region("ig_pog_list").refresh();
        //                     apex.message.showPageSuccess(apex.lang.getMessage("APEX.IG.CHANGES_SAVED"));
        //                     logDebug("function : delete_pog_list", "E");
        //                 }
        //             },
        //             loadingIndicatorPosition: "page",
        //         });
        //     }
        // });
        confirm(get_message("DELETE_CONFIRM_MSG"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
            apex.server.process(
                "DELETE_POG_LIST", {
                f01: l_arr_seq_id,
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        raise_error(pData);
                    } else {
                        apex.region("ig_pog_list").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                        apex.region("ig_pog_list").refresh();
                        apex.message.showPageSuccess(apex.lang.getMessage("APEX.IG.CHANGES_SAVED"));
                        logDebug("function : delete_pog_list", "E");
                    }
                },
                loadingIndicatorPosition: "page",
            });
        });
        //Task_29818 - End
    } else
        alert(get_message("SELECT_ATLEAST_ONE_REC"));

    logDebug("function : delete_pog_list", "E");
}

function peg_holes(p_pog_index) {
    logDebug("function : peg_holes", "S");
    var l_pog_json = get_canvas_json("LABEL");
    if (g_all_pog_flag == "Y") {
        var z = 0;
    } else {
        var z = g_pog_index;
    }
    if (typeof l_pog_json !== "undefined" && l_pog_json.length > 0) {
        if (g_peg_holes_active == "N") {
            g_peg_holes_active = "Y";
            $(".peg_holes").addClass("peg_hole_acive");
        } else {
            g_peg_holes_active = "N";
            $(".peg_holes").removeClass("peg_hole_acive");
        }
        var errorMessage = "";
        for (const jsonData of l_pog_json) {
            if (g_peg_holes_active == "N") {
                var module_details = l_pog_json[z].ModuleInfo;
                $.each(module_details, function (j, Modules) {
                    if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                        $.each(Modules.ShelfInfo, function (k, Shelf) {
                            if (typeof Shelf !== "undefined") {
                                if (Shelf.ObjType == "PEGBOARD") {
                                    var colorValue = parseInt(Shelf.Color.replace("#", "0x"), 16);
                                    var hex_decimal = new THREE.Color(colorValue);
                                    var selectedObject = g_scene_objects[z].scene.children[2].getObjectById(Shelf.SObjID);
                                    for (const objects of selectedObject.children) {
                                        if (objects.uuid == "pegdots") {
                                            objects.material.color = hex_decimal;
                                            objects.position.z = 0.0005;
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            } else {
                var module_details = l_pog_json[z].ModuleInfo;
                $.each(module_details, function (j, Modules) {
                    if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                        $.each(Modules.ShelfInfo, function (k, Shelf) {
                            if (typeof Shelf !== "undefined") {
                                if (Shelf.ObjType == "PEGBOARD") {
                                    var selectedObject = g_scene_objects[z].scene.children[2].getObjectById(Shelf.SObjID);
                                    for (const objects of selectedObject.children) {
                                        if (objects.uuid == "pegdots") {
                                            var hex_decimal = new THREE.Color(0x000000);
                                            objects.material.color = hex_decimal;
                                            objects.position.z = 0.0007;
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
            render(z);
            if (g_all_pog_flag == "Y") {
                z++;
            } else {
                break;
            }
        }
    }
    logDebug("function : peg_holes", "E");
}

async function show_pegTages(p_showAll, p_itemInfo, p_object, p_moduleIndex, p_shelfIndex, p_itemIndex, p_pog_index) {
    logDebug("function : show_pegTages; showAll : " + p_showAll + "; itemInfo : " + p_itemInfo + "; object : " + p_object + "; moduleIndex : " + p_moduleIndex + "; shelfIndex : " + p_shelfIndex + "; itemIndex : " + p_itemIndex, "S");

    if (typeof p_showAll == "undefined") {
        p_showAll = "Y";
        p_pog_index = g_pog_index;
    }
    if (p_showAll == "Y") {
        if (g_show_peg_tags == "Y") {
            g_show_peg_tags = "N";
            $(".peg_tag").removeClass("fixel_label_active");
        } else {
            g_show_peg_tags = "Y";
            $(".peg_tag").addClass("fixel_label_active");
        }
    }
    if (g_show_peg_tags == "Y") {
        if (p_showAll == "Y") {
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (p, modules_info) {
                if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                    $.each(modules_info.ShelfInfo, function (k, shelf) {
                        if (shelf.ObjType == "HANGINGBAR" || shelf.ObjType == "PEGBOARD") {
                            var pegExists = -1;
                            var itemLength = shelf.ItemInfo.length;
                            $.each(shelf.ItemInfo, function (m, mt) {
                                return new Promise(function (resolve, reject) {
                                    apex.server.process(
                                        "GET_PEG_DETAIL", {
                                        x01: mt.PegID,
                                    }, {
                                        dataType: "text",
                                        success: function (pData) {
                                            var peg_det = $.trim(pData).split("-");
                                            var peg_width,
                                                peg_height,
                                                peg_length,
                                                peg_right,
                                                peg_down,
                                                peg_headroom;
                                            peg_width = peg_det[0];
                                            peg_height = peg_det[1];
                                            peg_length = peg_det[2];
                                            peg_right = peg_det[3];
                                            peg_down = peg_det[4];
                                            peg_headroom = peg_det[5];

                                            if (typeof peg_width !== "undefined" && peg_width > 0) {
                                                g_pog_json[p_pog_index].ModuleInfo[p].ShelfInfo[k].ItemInfo[m].pegHeadRoom = peg_headroom;
                                                var selected_object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(mt.ObjID);
                                                var totalHeight = mt.H;
                                                var oneHeight = mt.H / mt.BVert;
                                                var itemVStart = 0 - totalHeight / 2;
                                                for (j = 1; j <= mt.BVert; j++) {
                                                    var totalWidth = mt.W;
                                                    var oneWidth = mt.W / mt.BHoriz;
                                                    var itemStart = 0 - totalWidth / 2;
                                                    for (i = 1; i <= mt.BHoriz; i++) {
                                                        itemStart = oneWidth + itemStart;
                                                    }
                                                    itemVStart = itemVStart + oneHeight;
                                                }
                                            }
                                            if (pegExists == 1 && m == itemLength - 1) {
                                                async function recreateItems() {
                                                    var return_val = recreate_all_items(p, k, "SHELF", "N", -1, -1, shelf.ItemInfo.length, "N", "Y", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                                                }

                                                var res = recreateItems();
                                            }
                                            logDebug("function : show_pegTages", "E");
                                            resolve("SUCCESS");
                                        },
                                        loadingIndicatorPosition: "page",
                                    });
                                });
                            });
                            pegExists = 1;
                        }
                    });
                }
            });
        } else {
            var selected_object = p_object;
            return new Promise(function (resolve, reject) {
                apex.server.process(
                    "GET_PEG_DETAIL", {
                    x01: p_itemInfo.PegID,
                }, {
                    dataType: "text",
                    success: function (pData) {
                        var peg_det = $.trim(pData).split("-");
                        var peg_width,
                            peg_height,
                            peg_length,
                            peg_right,
                            peg_down,
                            peg_headroom;
                        peg_width = peg_det[0];
                        peg_height = peg_det[1];
                        peg_length = peg_det[2];
                        peg_right = peg_det[3];
                        peg_down = peg_det[4];
                        peg_headroom = peg_det[5]; //

                        if (typeof peg_width !== "undefined" && peg_width > 0) {
                            g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].pegHeadRoom = peg_headroom;

                            var totalHeight = p_itemInfo.H;
                            var oneHeight = p_itemInfo.H / p_itemInfo.BVert;
                            var itemVStart = 0 - totalHeight / 2;
                            for (j = 1; j <= p_itemInfo.BVert; j++) {
                                var totalWidth = p_itemInfo.W;
                                var oneWidth = p_itemInfo.W / p_itemInfo.BHoriz;
                                var itemStart = 0 - totalWidth / 2;
                                for (i = 1; i <= p_itemInfo.BHoriz; i++) {
                                    addPegTags(selected_object, peg_width, peg_height, oneHeight + itemVStart, "ITEM", peg_right, peg_down, peg_headroom, oneWidth / 2 + itemStart, p_itemInfo.W);
                                    itemStart = oneWidth + itemStart;
                                }
                                itemVStart = itemVStart + oneHeight;
                            }
                        }
                        logDebug("function : show_pegTages", "E");
                        resolve("SUCCESS");
                    },
                    loadingIndicatorPosition: "page",
                });
            });
        }
    } else {
        var res = await hide_pegTags(p_pog_index);
    }
    logDebug("function : show_pegTages", "E");
}

async function addPegTags(p_object, p_width, p_height, p_itemHeight, p_obj_type, p_peg_right, p_peg_down, p_peg_headroom, p_itemWidth, p_totalWidth) {
    logDebug("function : addPegTags; width : " + p_width + "; height : " + p_height + "; itemHeight : " + p_itemHeight + "; obj_type : " + p_obj_type + "; peg_right : " + p_peg_right + "; peg_down : " + p_peg_down + "; peg_headroom : " + p_peg_headroom + "; peg_headroom : " + p_peg_headroom + "; itemWidth : " + p_itemWidth + "; totalWidth : " + p_totalWidth, "S");
    p_width = p_width / 100;
    p_height = p_height / 100;
    p_peg_right = p_peg_right / 100;
    p_peg_down = p_peg_down / 100;
    p_itemWidth = p_itemWidth;
    p_peg_headroom = p_peg_headroom / 100;

    var geometry = new THREE.BoxGeometry(p_width, p_height, 0);
    var geo = new THREE.EdgesGeometry(geometry);
    var mat = new THREE.LineBasicMaterial({
        color: 0xff0000,
        linewidth: 2,
    });
    var wireframe = new THREE.LineSegments(geo, mat);

    p_object.add(wireframe);
    wireframe.uuid = "peg_tag";
    p_object.merchid = wireframe.id;
    wireframe.position.x = p_itemWidth + p_width / 2 - p_peg_right / 2;
    if (g_show_live_image == "Y") {
        wireframe.position.y = p_itemHeight + p_peg_headroom + p_peg_down - p_height / 2;
    } else {
        wireframe.position.y = p_itemHeight + p_peg_headroom / 2 + p_peg_down - p_height / 2;
    }
    wireframe.position.z = 0.001;
    render(g_pog_index);
    logDebug("function : addPegTags", "E");
}

async function hide_pegTags(p_pog_index) {
    logDebug("function : hide_pegTags", "S");
    // $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
    var i = 0;
    for (modules_info of g_pog_json[p_pog_index].ModuleInfo) {
        // $.each(modules_info.ShelfInfo, function (k, shelf) {
        var k = 0;
        for (shelf of modules_info.ShelfInfo) {
            var pegExists = -1;
            // $.each(shelf.ItemInfo, function (m, mt) {
            var m = 0;
            for (mt of shelf.ItemInfo) {
                if (typeof mt.PegID !== "undefined" || mt.PegID !== "") {
                    pegExists = 1;
                    var item_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(mt.ObjID);
                    var children = item_obj.children;
                    if (typeof item_obj !== "undefined") {
                        for (var child of children) {
                            if (child.uuid == "peg_tag") {
                                var child_obj = item_obj.getObjectById(child.id);
                                item_obj.remove(child_obj);
                                // render(p_pog_index); //ASA-1668
                            }
                        }
                    }
                }
                m++;
            }
            // });
            if (pegExists == 1) {
                reset_auto_crush(i, k, -1, p_pog_index, i, k, p_pog_index); //ASA-1343 issue 1 //ASA-1685
                if (reorder_items(i, k, p_pog_index)) {
                    var return_val = await recreate_all_items(i, k, shelf.ObjType, "Y", -1, -1, shelf.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                }
                // ASA-1668
                // if (reorder_items(i, k, p_pog_index)) {
                //     var return_val = recreateItems(i, k, shelf.ItemInfo.length, p_pog_index);
                // }
            }
            k++;
        }
        // });
        i++;
    }
    render(p_pog_index);
    // });
    // ASA-1668
    // async function recreateItems(modIndex, shelfIndex, itemLength, p_pog_index) {
    //     var return_val = await recreate_all_items(modIndex, shelfIndex, "SHELF", "N", -1, -1, itemLength, "N", "Y", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y'); //ASA-1350 issue 6 added parameters
    // }
    logDebug("function : hide_pegTags", "E");
}

function setItemHeadRoom(p_moduleIndex, p_shelfIndex, p_itemIndex) {
    try {
        logDebug("function : setItemHeadRoom; moduleIndex : " + p_moduleIndex + "; shelfIndex : " + p_shelfIndex + "; itemIndex : " + p_itemIndex, "S");
        var peg_width,
            peg_height,
            peg_length,
            peg_right,
            peg_down,
            peg_headroom;
        var pegID = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].PegID;
        var itemHeight = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H;
        var items = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex];
        var selected_object = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
        return new Promise(function (resolve, reject) {
            apex.server.process(
                "GET_PEG_DETAIL", {
                x01: pegID,
            }, {
                dataType: "text",
                success: function (pData) {
                    var peg_det = $.trim(pData).split("-");
                    var pegHead = 0;
                    peg_width = peg_det[0];
                    peg_height = peg_det[1];
                    peg_length = peg_det[2];
                    peg_right = peg_det[3];
                    peg_down = peg_det[4];
                    pegHead = peg_det[5];
                    peg_head_t = pegHead;
                    logDebug("function : setItemHeadRoom", "E");
                    resolve("SUCCESS");
                    loadingIndicatorPosition: "page";
                    return peg_head_t;
                },
            });
            logDebug("function : setItemHeadRoom", "E");
        });
    } catch (err) {
        error_handling(err);
    }
}

async function auto_set_items(p_module_index, p_shelf_index, p_newItemArr, p_finalX, p_ItemHeight, p_itemID, p_itemWidth, p_pog_index) {
    try {
        logDebug("function : auto_set_items; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; finalX : " + p_finalX + "; ItemHeight : " + p_ItemHeight + "; itemID : " + p_itemID + "; itemWidth : " + p_itemWidth, "S");
        var horiz_gap = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].HorizGap;
        var spread_product = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SpreadItem;
        var spread_gap = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].HorizGap;
        var itemArr = p_newItemArr;
        var currentShelfY = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Y;
        var currentShelfHeight = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].H;
        var nearestShelf;
        shelfInfo = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo;
        var unfitItemArr = [];

        var distance = 0;
        var sorto = {
            Y: "desc",
        };
        shelfInfo.keySort(sorto);
        for (const shelf of shelfInfo) {
            if (shelf.Y < currentShelfY) {
                distance = currentShelfY - shelf.Y - (shelf.H / 2 + currentShelfHeight / 2);
                nearestShelf = shelf;
                break;
            }
        }
        var maxHeight = 0;
        for (const item of nearestShelf.ItemInfo) {
            if (maxHeight < item.H) {
                maxHeight = item.H;
            }
        }
        availableSpace = distance - maxHeight;
        for (const currItem of itemArr) {
            if (currItem.H > availableSpace) {
                unfitItemArr.push(currItem.ItemID);
            }
        }

        for (const ni of nearestShelf.ItemInfo) {
            var item_start1 = ni.X - ni.W / 2;
            var item_end1 = ni.X + ni.W / 2;
            var item_start2 = p_finalX - p_itemWidth / 2;
            var item_end2 = p_finalX + p_itemWidth / 2;

            if ((item_start2 >= item_start1 && item_start2 <= item_end1) || (item_end2 >= item_start1 && item_end2 <= item_end1)) {
                if (p_ItemHeight > distance - ni.H) {
                    // return 'N';
                }
            }
        }
        logDebug("function : auto_set_items", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function manage_multi_edit(p_edit_type, p_pog_index) {
    logDebug("function : manage_multi_edit; edit_type : " + p_edit_type, "S");
    debugger
    try {
        if (p_edit_type == "F") {
            var max_merch = parseFloat(g_shelf_details[0].MaxMerch) / 100;
            var left_hang = parseFloat(g_shelf_details[0].LOverhang) / 100;
            var right_hang = parseFloat(g_shelf_details[0].ROverhang) / 100;
            //var allow_crush = g_shelf_details[0].AllowAutoCrush == "" ? "N" : g_shelf_details[0].AllowAutoCrush; //ASA-1471 issue 7 ////ASA-1595 Issue 1
            var allow_crush = g_shelf_details[0].AllowAutoCrush; //ASA-1595 Issue 1
            var spread_product = g_shelf_details[0].SpreadItem;
            var color = g_shelf_details[0].Color;
            var colorValue = ""; //parseInt(color.replace("#", "0x"), 16);//ASA-1471 issue 16
            var hex_decimal = ""; //new THREE.Color(colorValue);//ASA-1471 issue 16
            var l_combine = g_shelf_details[0].Combine; //ASA-1272
            var l_height = g_shelf_details[0].H / 100; //ASA-1272
            var l_width = g_shelf_details[0].W / 100; //ASA-1272
            var l_depth = g_shelf_details[0].D / 100; //ASA-1272
            var l_slope = g_shelf_details[0].Slope; //ASA-1272
            var l_rotation = g_shelf_details[0].Rotation; //ASA-1272
            var l_manual_crush = g_shelf_details[0].ManualCrush; //ASA-1300
            /* Start ASA-1422*/
            var l_div_created = g_shelf_details[0].DivCreated;
            var l_div_height = parseFloat(g_shelf_details[0].DivHeight) / 100;
            var l_div_width = parseFloat(g_shelf_details[0].DivWidth) / 100;
            var l_div_pst = g_shelf_details[0].DivPst;
            var l_div_ped = g_shelf_details[0].DivPed;
            var l_div_pbtw_face = g_shelf_details[0].DivPbtwFace;
            var l_div_stx = parseFloat(g_shelf_details[0].DivStX) / 100;
            var l_div_spacex = parseFloat(g_shelf_details[0].DivSpaceX) / 100;
            var l_div_fill_col = g_shelf_details[0].DivFillCol;
            var l_div_no_div_id_show = g_shelf_details[0].NoDivIDShow;
            var l_fsize = g_shelf_details[0].FSize; //ASA-1669
            var l_fstyle = g_shelf_details[0].FStyle; //ASA-1669
            var l_fbold = g_shelf_details[0].FBold; //ASA-1669
            //ASA-1471 issue 15 S
            var l_color_chng = nvl(g_shelf_details[0].ColorChng) == 0 ? "N" : g_shelf_details[0].ColorChng;
            var l_height_chng = nvl(g_shelf_details[0].Height) == 0 ? "N" : g_shelf_details[0].Height;
            var l_width_chng = nvl(g_shelf_details[0].Width) == 0 ? "N" : g_shelf_details[0].Width;
            var l_depth_chng = nvl(g_shelf_details[0].Depth) == 0 ? "N" : g_shelf_details[0].Depth;
            var l_rot_chng = nvl(g_shelf_details[0].Rotation) == 0 ? "N" : g_shelf_details[0].Rotation;
            var l_slope_chng = nvl(g_shelf_details[0].Slope) == 0 ? "N" : g_shelf_details[0].Slope;
            var l_divh_chng = nvl(g_shelf_details[0].DivHChng) == 0 ? "N" : g_shelf_details[0].DivHChng;
            var l_divw_chng = nvl(g_shelf_details[0].DivWChng) == 0 ? "N" : g_shelf_details[0].DivWChng;
            var l_divps_chng = nvl(g_shelf_details[0].DivPSChng) == 0 ? "N" : g_shelf_details[0].DivPSChng;
            var l_dive_chng = nvl(g_shelf_details[0].DivPEChng) == 0 ? "N" : g_shelf_details[0].DivPEChng;
            var l_divpdbf_chng = nvl(g_shelf_details[0].DivPDBFChng) == 0 ? "N" : g_shelf_details[0].DivPDBFChng;
            var l_divid_chng = nvl(g_shelf_details[0].DivIDChng) == 0 ? "N" : g_shelf_details[0].DivIDChng;
            var l_divfcc_chng = nvl(g_shelf_details[0].DivFCChng) == 0 ? "N" : g_shelf_details[0].DivFCChng;
            var l_lohng_chng = nvl(g_shelf_details[0].LoverhungChng) == 0 ? "N" : g_shelf_details[0].LoverhungChng;
            var l_rohng_chng = nvl(g_shelf_details[0].RoverhungChng) == 0 ? "N" : g_shelf_details[0].RoverhungChng;
            var l_sprdprdct_chng = nvl(g_shelf_details[0].SpreadPrdct) == 0 ? "N" : g_shelf_details[0].SpreadPrdct;
            //ASA-1471 issue 15 E

            var l_fsize_chng = nvl(g_shelf_details[0].FSizeChng) == 0 ? "N" : g_shelf_details[0].FSizeChng; //ASA-1669
            var l_fstyle_chng = nvl(g_shelf_details[0].FStyleChng) == 0 ? "N" : g_shelf_details[0].FStyleChng; //ASA-1669
            var l_fbold_chng = nvl(g_shelf_details[0].FBoldChng) == 0 ? "N" : g_shelf_details[0].FBoldChng; //ASA-1669
            /* End ASA-1422*/
            var ItemsDel = [];
            var i = 0;
            var prevSObjID = -1; //ASA-1669
            if (g_delete_details.length > 0) {
                for (const det of g_delete_details) {
                    // if (i == 0) {
                    var objectID = g_pog_json[p_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex].SObjID;
                    //ASA-1669, If condiiton added
                    if (objectID !== prevSObjID) {
                        prevSObjID = g_pog_json[p_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex].SObjID;
                        var undoObjectsInfo = [];
                        undoObjectsInfo.moduleIndex = det.MIndex;
                        undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[det.MIndex].Module;
                        undoObjectsInfo.shelfIndex = det.SIndex;
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_start_canvas;
                        undoObjectsInfo.objectID = objectID;
                        undoObjectsInfo.g_deletedItems = ItemsDel;
                        undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[det.MIndex].MObjID;
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex])));
                        // var newItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex].ItemInfo));
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                    }
                    // }

                    i++;
                }
            }
            if (g_delete_details.length > 0) {
                var l_del_cnt = 0;
                var combine_ind = "N"; //Regression issue 15 20240607
                for (const objects of g_delete_details) {
                    if (objects.Object == "SHELF" && objects.IsDivider == "N") {
                        // Start Task_27734
                        var recreate = "N";
                        // var combine_ind = "N";//Regression issue 15 20240607
                        var shelfs = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                        var old_shelf_info = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex])); //ASA-1595 Issue 2
                        // var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf);//ASA-1386 Issue 7//Regression issue 15 20240607
                        //shelfs.Combine = l_combine; //Regression issue 15 20240607 //ASA-1595 Issue 2
                        var [currCombinationIndex, currShelfCombIndx] = [-1, -1]; //ASA-1668 #1
                        shelfs.Combine = l_combine == "S" ? old_shelf_info.Combine : l_combine; //ASA-1595 Issue 2
                         // Apply spread before combine-generation logic so combined shelves use latest spread.
                           if (spread_product !== "" && l_sprdprdct_chng == "Y") { //ASA-2041 Issue 1 spread items start
                            shelfs.SpreadItem = spread_product;
                            recreate = "Y";
                            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf);
                            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                                g_combinedShelfs[currCombinationIndex].SpreadItem = spread_product;
                                g_combinedShelfs[currCombinationIndex][currShelfCombIndx].SpreadItem = spread_product;
                            }
                        } // ASA-2041  End
                        if (l_combine == "S" && old_shelf_info.Combine !== "N") {
                            //ASA-1668 #1
                            if (combine_ind == "Y" && l_combine !== "N") {
                                // shelfs.Combine = l_combine;//Regression issue 15 20240607
                                await generateCombinedShelfs(p_pog_index, objects.MIndex, objects.SIndex, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters
                                //ASA-1272
                                [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf); //Regression issue 15 20240607  //ASA-1668 #1
                                if (currCombinationIndex == -1 && l_del_cnt > 0) {
                                    alert(get_message("MULTI_COMB_ERR_MSG", shelfs.Shelf));
                                } else {
                                    // shelfs.Combine = l_combine;//Regression issue 15 20240607
                                    recreate = "Y";
                                }
                            } else if (l_combine == "N") {
                                //ASA-1270
                                // shelfs.Combine = l_combine;//Regression issue 15 20240607
                                await generateCombinedShelfs(p_pog_index, objects.MIndex, objects.SIndex, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y"); //ASA-1350 issue 6 added parameters
                                [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf); //Regression issue 15 20240607  //ASA-1668 #1
                                recreate = "Y";
                            } //End Task_27734
                        }
                        else if (l_combine !== "S" && old_shelf_info.Combine !== "N") { //ASA-2041.1
                            await generateCombinedShelfs(p_pog_index, objects.MIndex, objects.SIndex, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y","Y"); //ASA-1350 issue 6 added parameters ASA-2041 issue 6 
                            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf); //Regression issue 15 20240607  //ASA-1668 #1
                            recreate = "Y";
                        }
                        //ASA-2041  Issue 1
                        else if (l_combine !== "S" && l_combine !== "N" && old_shelf_info.Combine == "N") { //ASA-2041.1 - NEW combination
                            await generateCombinedShelfs(p_pog_index, objects.MIndex, objects.SIndex, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y","D","Y"); //ASA-1350 issue 6 added parameters ASA-2041 issue 1 one  parameter pass 
                            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf); //Regression issue 15 20240607  //ASA-1668 #1
                            recreate = "Y";
                        }
                        //2041 issue 1 END here 

                        //var old_shelf_info = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex])); //ASA-1595 Issue 2
                        items_arr = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
                        if (max_merch !== "" && max_merch !== 0 && g_shelf_details[0].ShelfEdit !== "Y") {
                            //ASA-1471 issue 6
                            //ASA-1398 issue 2
                            shelfs.MaxMerch = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].MaxMerch; //ASA-1398 issue 2
                        } else if (max_merch !== "" && max_merch == 0 && g_shelf_details[0].ShelfEdit !== "Y") {
                            //ASA-1595
                            shelfs.MaxMerch = old_shelf_info.MaxMerch; //ASA-1595
                        } else {
                            //ASA-1398 issue 2
                            shelfs.MaxMerch = max_merch;
                        }
                        if (l_manual_crush !== "" && shelfs.ObjType == "CHEST") {
                            //ASA-1300
                            shelfs.ManualCrush = l_manual_crush;
                        }
                        //ASA-1471 issue 15 S
                        if (left_hang !== "" && l_lohng_chng == "Y") {
                            shelfs.LOverhang = left_hang;
                            recreate = "Y";
                        }
                        if (right_hang !== "" && l_rohng_chng == "Y") {
                            shelfs.ROverhang = right_hang;
                            recreate = "Y";
                        }
                        if (allow_crush !== "") {
                            shelfs.AllowAutoCrush = allow_crush;
                            [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf); //Regression 15 20240607    //ASA-1668 #1
                            //ASA-1386 Issue 7
                            if (currCombinationIndex !== -1) {
                                if (currShelfCombIndx == 0) {
                                    g_combinedShelfs[currCombinationIndex].AllowAutoCrush = allow_crush;
                                }
                                g_combinedShelfs[currCombinationIndex][currShelfCombIndx].AllowAutoCrush = allow_crush;
                            }
                        } else {
                            //ASA-1595 Issue 1
                            shelfs.AllowAutoCrush = old_shelf_info.AllowAutoCrush;
                        }
                        //ASA-1471 issue 16 S
                        if (color !== "" && l_color_chng == "Y") {
                            colorValue = parseInt(color.replace("#", "0x"), 16);
                            hex_decimal = new THREE.Color(colorValue);
                            shelfs.Color = color;
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(objects.ObjID);
                            selectedObject.material.color = hex_decimal;
                        } else {
                            colorValue = parseInt(shelfs.Color.replace("#", "0x"), 16);
                            hex_decimal = new THREE.Color(colorValue);
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(objects.ObjID);
                            selectedObject.material.color = hex_decimal;
                        } //ASA-1471 issue 16 E

                        if (spread_product !== "" && l_sprdprdct_chng == "Y") {
                            shelfs.SpreadItem = spread_product;
                            recreate = "Y";
                        }
                        if (l_combine !== "N") {
                            // Start ASA-1272
                            combine_ind = "Y";
                        }
                        if (l_height !== "" && l_height_chng == "Y") {
                            if (l_height > 0) {
                                shelfs.H = l_height;
                                recreate = "Y";
                                combine_ind = "Y";
                            }
                        }
                        if (l_width !== "" && l_width_chng == "Y") {
                            if (l_width > 0) {
                                shelfs.W = l_width;
                                recreate = "Y";
                                combine_ind = "Y";
                            }
                        }
                        if (l_depth !== "" && l_depth_chng == "Y") {
                            if (l_depth > 0) {
                                shelfs.D = l_depth;
                                recreate = "Y";
                            }
                        }
                        if (l_slope_chng == "Y") {
                            //   if (l_slope > 0)
                            shelfs.Slope = l_slope == "" ? 0 : l_slope;
                            recreate = "Y";
                            combine_ind = "Y";
                        }
                        if (l_rot_chng == "Y") {
                            //if (l_rotation > 0) {
                            shelfs.Rotation = l_rotation == "" ? 0 : l_rotation;
                            recreate = "Y";
                            combine_ind = "Y";
                            //}
                        }

                        //ASA-1669 Start
                        if (shelfs.ObjType == "TEXTBOX") {
                            if (l_fsize !== "" && l_fsize_chng == "Y") {
                                if (l_fsize != "") {
                                    shelfs.FSize = l_fsize;
                                    recreate = "Y";
                                    combine_ind = "Y";
                                }
                            }

                            if (l_fstyle !== "" && l_fstyle_chng == "Y") {
                                if (l_fstyle != "") {
                                    shelfs.FStyle = l_fstyle;
                                    recreate = "Y";
                                    combine_ind = "Y";
                                }
                            }

                            if (l_fbold !== "" && l_fbold_chng == "Y") {
                                if (l_fbold != "") {
                                    shelfs.FBold = l_fbold;
                                    recreate = "Y";
                                    combine_ind = "Y";
                                }
                            }
                        }
                        //ASA-1669 End

                        //ASA-1471 issue 15 E
                        //Task_27734
                        /*if (combine_ind == 'Y' && l_combine !== 'N') {
                        shelfs.Combine = l_combine;
                        await generateCombinedShelfs(p_pog_index, objects.MIndex, objects.SIndex, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y', "", "Y");//ASA-1350 issue 6 added parameters
                        //ASA-1272
                        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, shelfs.Shelf);
                        if (currCombinationIndex == -1 && l_del_cnt > 0) {
                        alert(get_message('MULTI_COMB_ERR_MSG', shelfs.Shelf));

                        } else {
                        shelfs.Combine = l_combine;
                        recreate = "Y";
                        }
                        } else if (l_combine == 'N') {//ASA-1270
                        shelfs.Combine = l_combine;
                        await generateCombinedShelfs(p_pog_index, objects.MIndex, objects.SIndex, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), 'Y', "", "Y");//ASA-1350 issue 6 added parameters
                        recreate = 'Y';
                        }*/

                        //Start ASA-1422
                        if (l_div_pbtw_face !== " " && l_div_height > 0 && l_div_width > 0 && l_div_created == "Y" && shelfs.ObjType == "SHELF") {
                            //ASA-1422 Issue 1
                            g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivCreated = l_div_created;
                            //ASA-1471 issue 15 S
                            if (l_divh_chng == "Y") {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivHeight = l_div_height;
                            }
                            if (l_divw_chng == "Y") {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivWidth = l_div_width;
                            }
                            if (l_divps_chng == "Y") {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivPst = l_div_pst;
                            }
                            if (l_dive_chng == "Y") {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivPed = l_div_ped;
                            }
                            if (l_divpdbf_chng == "Y") {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivPbtwFace = l_div_pbtw_face;
                            }
                            g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivStX = l_div_stx;
                            g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivSpaceX = l_div_spacex;

                            if (l_divfcc_chng == "Y") {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivFillCol = l_div_fill_col;
                            } else {
                                if (typeof g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivFillCol == "undefined") {
                                    g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].DivFillCol = l_div_fill_col;
                                }
                            }
                            if (l_divid_chng == "Y") {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].NoDivIDShow = l_div_no_div_id_show;
                            }
                            //ASA-1471 issue 15 E
                            await create_shelf_dividers(p_pog_index, objects.MIndex, objects.SIndex); //ASA-1422
                            recreate = "Y";
                            combine_ind = "Y"; //Task_27734
                        }
                        //End ASA-1422

                        if (combine_ind == "Y") {
                            //ASA-1272
                            if (shelfs.ObjType !== "ROD" && shelfs.ObjType !== "PEGBOARD" && !(shelfs.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
                                if (reorder_items(objects.MIndex, objects.SIndex, p_pog_index)) {
                                    var shelfs = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                                    var validate_passed = validate_shelf_min_distance(objects.MIndex, objects.SIndex, shelfs.Y, items_arr, shelfs.AllowAutoCrush, objects.MIndex, shelfs.X, "Y", shelfs, p_pog_index);
                                }
                            } else {
                                validate_passed = "Y";
                            }
                            shelfs.OldObjID = shelfs.SObjID;

                            //ASA-1582 #3 Start
                            var return_val = "N";
                            if (!((shelfs["ObjType"] == "CHEST" && g_chest_as_pegboard == "Y") || shelfs["ObjType"] == "PEGBOARD")) {
                                if (currCombinationIndex !== -1) {
                                    for (shelf_info of g_combinedShelfs[currCombinationIndex]) {
                                        console.log(shelf_info.Shelf);
                                        var currModIndx = shelf_info.MIndex,
                                            currShlfIndx = shelf_info.SIndex,
                                            currShelf = g_pog_json[p_pog_index].ModuleInfo[currModIndx].ShelfInfo[currShlfIndx],
                                            items = currShelf.ItemInfo;
                                        var i = 0;
                                        for (item of items) {
                                            if ((typeof item.BottomObjID == "undefined" || item.BottomObjID == "") && (typeof item.TopObjID == "undefined" || item.TopObjID == "")) {
                                                var return_val = update_validate_item_height(item, currModIndx, currShlfIndx, i, item.X, shelfs["ObjType"], -1, p_pog_index);
                                            }
                                            i++;
                                        }
                                    }
                                } else {
                                    var i = 0;
                                    for (item of items_arr) {
                                        if ((typeof item.BottomObjID == "undefined" || item.BottomObjID == "") && (typeof item.TopObjID == "undefined" || item.TopObjID == "")) {
                                            var return_val = update_validate_item_height(item, objects.MIndex, objects.SIndex, i, item.X, shelfs["ObjType"], -1, p_pog_index); //ASA-1668 Replace g_module_index, g_shelf_index with objects.MIndex, objects.SIndex
                                        }
                                        i++;
                                    }
                                }
                            }
                            //ASA-1582 #3 End
                            var shelfZ;
                            if (shelfs.ObjType == "TEXTBOX") {
                                shelfZ = 0.0021;
                            } else if (shelfs.ObjType == "PEGBOARD") {
                                shelfZ = 0.003;
                            } else if (shelfs.ObjType == "DIVIDER") {
                                shelfZ = 0.001;
                            } else {
                                shelfZ = 0.0005;
                            }
                            await set_all_items(objects.MIndex, objects.SIndex, shelfs.X, shelfs.Y, "Y", "N", "Y", p_pog_index, p_pog_index); //Regression issue 24 Prasanna

                            var items_arr = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
                            var res = await set_auto_facings(objects.MIndex, objects.SIndex, -1, items_arr, "B", "S", "D", p_pog_index, p_pog_index);

                            var item_width_arr = [],
                                item_height_arr = [],
                                item_depth_arr = [],
                                item_index_arr = [];
                            $.each(items_arr, function (i, items) {
                                item_width_arr.push(wpdSetFixed(items.W)); //.toFixed(3)));
                                item_height_arr.push(wpdSetFixed(items.H)); //.toFixed(3)));
                                item_depth_arr.push(wpdSetFixed(items.D)); //.toFixed(3)));
                                item_index_arr.push(i);
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[i].Exists = "E";
                            });

                            var drag_item_arr = [];
                            if ((validate_passed == "Y" || validate_passed == "R") && validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, shelfs.ObjType, objects.MIndex, objects.SIndex, -1, "N", 0, 0, 0, -1, "N", "N", "Y", "N", "N", drag_item_arr, "Y", "Y", "Y", p_pog_index)) {
                                //identify if any change in POG
                                g_pog_edited_ind = "Y";
                                g_dblclick_objid = shelfs.SObjID;
                                if (shelfs.ObjType == "PEGBOARD") {
                                    var return_val = await add_pegboard(shelfs.Shelf, shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfZ, "Y", shelfs.VertiStart, shelfs.VertiSpacing, shelfs.HorizStart, shelfs.HorizSpacing, objects.MIndex, objects.SIndex, shelfs.Rotation, shelfs.Slope, "Y", $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters
                                } else if (shelfs.ObjType == "ROD") {
                                    var return_val = await add_rod(shelfs.Shelf, shelfs.ObjType, shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfZ, edited, objects.MIndex, objects.SIndex, p_pog_index);
                                } else if (shelfs.ObjType == "TEXTBOX") {
                                    //ASA-1669
                                    var colorValue = parseInt(shelfs.Color.replace("#", "0x"), 16);
                                    var hex_decimal = new THREE.Color(colorValue);
                                    var prevZ = shelfs.Z;
                                    var prevWorldZ = g_world.getObjectById(shelfs.SObjID).position.z;
                                    var child_module_index = -1;
                                    var i = 0;
                                    var ModuleInfo = {}; //ASA-1669 #3
                                    for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                                        if (modules.ObjID == shelfs.SObjID) {
                                            ModuleInfo = g_pog_json[p_pog_index].ModuleInfo[i];
                                            child_module_index = i;
                                            break;
                                        }
                                        i++;
                                    }
                                    if (g_show_live_image == "Y" && shelfs["TextImg"] !== "" && typeof shelfs["TextImg"] !== "undefined" && shelfs["TextImg"] !== null) {
                                        var return_val = await add_text_box_with_image(shelfs.Shelf, "SHELF", shelfs["W"], shelfs["H"], shelfs["D"], hex_decimal, shelfs.X, shelfs.Y, 0.0021, "Y", objects.MIndex, shelfs["InputText"], colorValue, shelfs["WrapText"], shelfs["ReduceToFit"], shelfs["Color"], objects.SIndex, shelfs["Rotation"], shelfs["Slope"], "Y", shelfs["FStyle"], shelfs["FSize"], shelfs["FBold"], $v("P25_NOTCH_HEAD"), p_pog_index);
                                    } else {
                                        var return_val = add_text_box(shelfs.Shelf, "SHELF", shelfs["W"], shelfs["H"], shelfs["D"], hex_decimal, shelfs.X, shelfs.Y, 0.0021, "Y", objects.MIndex, shelfs["InputText"], colorValue, shelfs["WrapText"], shelfs["ReduceToFit"], shelfs["Color"], objects.SIndex, shelfs["Rotation"], shelfs["Slope"], "Y", shelfs["FStyle"], shelfs["FSize"], shelfs["FBold"], 2, p_pog_index, g_pogcr_enhance_textbox_fontsize, shelfs["TextDirection"]); //ASA-1797.1
                                    }
                                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(return_val);
                                    if (child_module_index == -1) {
                                        //ASA-1669 #3
                                        ModuleInfo["SeqNo"] = g_pog_json[p_pog_index].ModuleInfo.length + 1;
                                        ModuleInfo["Module"] = shelfs.Shelf;
                                        ModuleInfo["ParentModule"] = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Module;
                                        ModuleInfo["POGModuleName"] = shelfs.Desc;
                                        ModuleInfo["SubDept"] = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].SubDept;
                                        ModuleInfo["Remarks"] = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].Remarks;
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
                                        ModuleInfo["H"] = shelfs.H;
                                        ModuleInfo["W"] = shelfs.W;
                                        ModuleInfo["Color"] = shelfs.Color;
                                        g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);
                                        child_module_index = g_pog_json[p_pog_index].ModuleInfo.length - 1;
                                    }
                                    g_pog_json[p_pog_index].ModuleInfo[child_module_index].ObjID = return_val;
                                    selectedObject.position.z = prevWorldZ;
                                    g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Z = prevZ;
                                } else {
                                    var [return_val, shelf_cnt] = await add_shelf(shelfs.Shelf, shelfs.ObjType, shelfs.W, shelfs.H, shelfs.D, hex_decimal, shelfs.X, shelfs.Y, shelfZ, "Y", objects.MIndex, shelfs.Rotation, shelfs.Slope, objects.SIndex, "Y", "N", "Y", -1, $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters,//ASA-1487
                                    var res = updateObjID(shelfs.OldObjID, return_val, "S");
                                }
                                shelfs.SObjID = return_val;
                            } else {
                                if (l_div_pbtw_face !== " " && l_div_height > 0 && l_div_width > 0 && l_div_created == "Y") {
                                    //Task_27734
                                    remove_shelf_dividers(p_pog_index, objects.MIndex, shelfs.Shelf);
                                }
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo.splice(objects.SIndex, 1);
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo.splice(objects.SIndex, 0, old_shelf_info);
                                await set_all_items(objects.MIndex, objects.SIndex, shelfs.X, shelfs.Y, "Y", "N", "Y", p_pog_index, p_pog_index); //Task_27734
                            }
                        } //End ASA-1272

                        await reset_auto_crush(objects.MIndex, objects.SIndex, -1, p_pog_index, objects.MIndex, objects.SIndex, p_pog_index); //ASA-1386 Issue 7,//ASA-1471 issue 11 //ASA-1685

                        if (recreate == "Y" && combine_ind == "N") {
                            items_arr = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
                            $.each(items_arr, function (i, items) {
                                g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[i].W = items.RW;
                            });
                            if (reorder_items(objects.MIndex, objects.SIndex, p_pog_index)) {
                                await recreate_all_items(objects.MIndex, objects.SIndex, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo.length, "Y", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                            }
                        }
                        l_del_cnt++;
                    }
                }
                $s("P25_MULTI_EDIT", "N");
                if (g_show_max_merch == "N") {
                    let result = await add_merch("N", g_pog_index);
                } else {
                    let result1 = await add_merch("Y", g_pog_index);
                }
            }
            var res = await calculateFixelAndSupplyDays("N", p_pog_index);
            render(p_pog_index);
            if (g_show_live_image == "Y") {
                animate_all_pog();
            }
            g_mselect_drag = "N";
            g_multiselect = "N";
            g_delete_details = [];
            g_ctrl_select = "N";
            g_dblclick_opened = "N";
        } else {
            addLoadingIndicator(); //ASA-1669
            var l_items_details = sessionStorage.getItem("items_details") !== null ? JSON.parse(sessionStorage.getItem("items_details")) : {};

            var peg_id = l_items_details.PegID;
            var peg_spread = l_items_details.PegSpread;
            var fixed = l_items_details.Fixed;
            var orientation = l_items_details.Orientation;
            var merch_style = l_items_details.MerchStyle;
            var color = l_items_details.Color;
            var colorValue = parseInt(color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            //ASA-1410, Start
            var nestingVal = l_items_details.NestingVal;
            var itemNesting = l_items_details.ItemNesting;
            var nestingWidth = l_items_details.NW;
            var nestingHeight = l_items_details.NH;
            var nestingDepth = l_items_details.ND;

            var capStyle = l_items_details.CapStyle;
            var capFacing = l_items_details.CapFacing;
            var capMerch = l_items_details.CapMerch;
            var capOrientaion = l_items_details.CapOrientaion;
            var capDepth = l_items_details.CapDepth;
            var capHorz = l_items_details.CapHorz;
            var capMaxH = l_items_details.CapMaxH;
            var maxHCapStyle = l_items_details.MaxHCapStyle;
            var mCapTopFacing = l_items_details.MCapTopFacing;

            var orientChng = nvl(l_items_details.OrientationChng) == 0 ? "N" : l_items_details.OrientationChng;
            var merchChng = nvl(l_items_details.MerchChng) == 0 ? "N" : l_items_details.MerchChng;
            var fixedChng = nvl(l_items_details.FixedChng) == 0 ? "N" : l_items_details.FixedChng;
            var pegIdChng = nvl(l_items_details.PegIdChng) == 0 ? "N" : l_items_details.PegIdChng;
            var pegSpreadChng = nvl(l_items_details.PegSpreadChng) == 0 ? "N" : l_items_details.PegSpreadChng;
            var colorChng = nvl(l_items_details.ColorChng) == 0 ? "N" : typeof l_items_details.OldColor !== "undefined" && l_items_details.Color == l_items_details.OldColor ? "N" : l_items_details.ColorChng;
            var pogVFacingChng = nvl(l_items_details.POGMaxVFacingChng) == 0 ? "N" : l_items_details.POGMaxVFacingChng;
            var pogHFacingChng = nvl(l_items_details.POGMaxHFacingChng) == 0 ? "N" : l_items_details.POGMaxHFacingChng;
            var pogDFacingChng = nvl(l_items_details.POGMaxDFacingChng) == 0 ? "N" : l_items_details.POGMaxDFacingChng;
            var capStyleChng = nvl(l_items_details.CapStyleChng) == 0 ? "N" : l_items_details.CapStyleChng;
            var capMaxHChng = nvl(l_items_details.CapMaxHChng) == 0 ? "N" : l_items_details.CapMaxHChng;
            var maxHCapStyleChng = nvl(l_items_details.MaxHCapStyleChng) == 0 ? "N" : l_items_details.MaxHCapStyleChng;
            var capDepthChanged = nvl(l_items_details.CapDepthChanged) == 0 ? "N" : l_items_details.CapDepthChanged;
            var capMerchChng = nvl(l_items_details.CapMerchChng) == 0 ? "N" : l_items_details.CapMerchChng;
            var capOrientaionChng = nvl(l_items_details.CapOrientaionChng) == 0 ? "N" : l_items_details.CapOrientaionChng;
            var capFacingChng = nvl(l_items_details.CapFacingChng) == 0 ? "N" : l_items_details.CapFacingChng;
            var itemNestingChng = nvl(l_items_details.ItemNestingChng) == 0 ? "N" : l_items_details.ItemNestingChng;
            //var masterchng = l_items_details.MultiCheck; //ASA-1496 issue 6

            //ASA-1410, End
            var old_items = [];
            var errored = "N";
            var ItemsDel = [];
            var i = 0;
            var prevSObjID = -1; //ASA-1669
            if (g_delete_details.length > 0) {
                for (const det of g_delete_details) {
                    // if (i == 0) {
                    var objectID = g_pog_json[p_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex].SObjID;
                    //ASA-1669, If condiiton added
                    if (objectID !== prevSObjID) {
                        prevSObjID = g_pog_json[p_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex].SObjID;
                        var undoObjectsInfo = [];
                        undoObjectsInfo.moduleIndex = det.MIndex;
                        undoObjectsInfo.module = g_pog_json[p_pog_index].ModuleInfo[det.MIndex].Module;
                        undoObjectsInfo.shelfIndex = det.SIndex;
                        undoObjectsInfo.actionType = "ITEM_DELETE";
                        undoObjectsInfo.startCanvas = g_start_canvas;
                        undoObjectsInfo.objectID = objectID;
                        undoObjectsInfo.g_deletedItems = ItemsDel;
                        undoObjectsInfo.moduleObjectID = g_pog_json[p_pog_index].ModuleInfo[det.MIndex].MObjID;
                        undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex])));
                        // var newItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[det.MIndex].ShelfInfo[det.SIndex].ItemInfo));
                        g_allUndoObjectsInfo.push(undoObjectsInfo);
                    }
                    // }
                    i++;
                }
            }
            if (g_delete_details.length > 0) {
                for (const objects of g_delete_details) {
                    if (objects.Object == "ITEM") {
                        objects.ItemInfo = [];
                        objects.ItemInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex])));
                    }
                }
                for (const objects of g_delete_details) {
                    if (objects.Object == "ITEM") {
                        var recreate = "N";
                        var check_nesting = "N"; //ASA-1466
                        valid = "N";
                        var peg_change = "N";
                        //ASA-1410
                        if (peg_id !== "" && pegIdChng == "Y") {
                            g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex].PegID = peg_id;
                            peg_change = "Y";
                            if (typeof peg_id !== "undefined" || peg_id !== "") {
                                if (g_show_peg_tags == "Y" && (g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType == "HANGINGBAR" || g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType == "PEGBOARD")) {
                                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(objects.ObjID);
                                    var children = selectedObject.children;
                                    var ids = [];
                                    if (typeof selectedObject !== "undefined") {
                                        for (var child of children) {
                                            if (child.uuid == "peg_tag") {
                                                ids.push(child.id);
                                            }
                                        }
                                        for (var index of ids) {
                                            var child_obj = selectedObject.getObjectById(index);
                                            selectedObject.remove(child_obj);
                                        }

                                        render(p_pog_index);
                                        var res = show_pegTages("N", g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.ShelfIndex].ItemInfo[objects.IIndex], selectedObject, objects.MIndex, objects.SIndex, objects.IIndex, p_pog_index); //code adde by yograj to show pegtages
                                    }
                                }
                            }
                        }
                        var items = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex];
                        //ASA-1540 S
                        if (typeof l_items_details.OrgUW !== "undefined" && l_items_details.OrgUW !== "" && l_items_details.UWchgInd == "Y") {
                            //ASA l_items_details.OrgUW !== 0
                            //ASA-1150 -S
                            items.OrgUW = l_items_details.OrgUW;
                            items.UW = l_items_details.OrgUW;

                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgUH !== "undefined" && l_items_details.OrgUH !== "" && l_items_details.UHchgInd == "Y") {
                            //l_items_details.OrgUH !== 0
                            items.OrgUH = l_items_details.OrgUH;
                            items.UH = l_items_details.OrgUH;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgUD !== "undefined" && l_items_details.OrgUD !== "" && l_items_details.UDchgInd == "Y") {
                            //l_items_details.OrgUD !== 0
                            items.OrgUD = l_items_details.OrgUD;
                            items.UD = l_items_details.OrgUD;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgTW !== "undefined" && l_items_details.OrgTW !== "" && l_items_details.TWchgInd == "Y") {
                            //l_items_details.OrgTW !== 0
                            items.OrgTW = l_items_details.OrgTW;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgTH !== "undefined" && l_items_details.OrgTH !== "" && l_items_details.THchgInd == "Y") {
                            //l_items_details.OrgTH !== 0
                            items.OrgTH = l_items_details.OrgTH;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgTD !== "undefined" && l_items_details.OrgTD !== "" && l_items_details.TDchgInd == "Y") {
                            //l_items_details.OrgTD !== 0
                            items.OrgTD = l_items_details.OrgTD;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgDW !== "undefined" && l_items_details.OrgDW !== "" && l_items_details.DWchgInd == "Y") {
                            //l_items_details.OrgDW !== 0
                            items.OrgDW = l_items_details.OrgDW;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgDH !== "undefined" && l_items_details.OrgDH !== "" && l_items_details.DHchgInd == "Y") {
                            //l_items_details.OrgDW !== 0
                            items.OrgDH = l_items_details.OrgDH;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgDD !== "undefined" && l_items_details.OrgDD !== "" && l_items_details.DDchgInd == "Y") {
                            //l_items_details.OrgDD !== 0
                            items.OrgDD = l_items_details.OrgDD;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgCW !== "undefined" && l_items_details.OrgCW !== "" && l_items_details.CWchgInd == "Y") {
                            //l_items_details.OrgCW !== 0
                            items.OrgCW = l_items_details.OrgCW;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgCH !== "undefined" && l_items_details.OrgCH !== "" && l_items_details.CHchgInd == "Y") {
                            //l_items_details.OrgCH !== 0
                            items.OrgCH = l_items_details.OrgCH;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgCD !== "undefined" && l_items_details.OrgCD !== "" && l_items_details.CDchgInd == "Y") {
                            //l_items_details.OrgCD !== 0
                            items.OrgCD = l_items_details.OrgCD;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgCWPerc !== "undefined" && l_items_details.OrgCWPerc !== "" && l_items_details.RWchgInd == "Y") {
                            //l_items_details.OrgCWPerc !== 0
                            items.OrgCWPerc = l_items_details.OrgCWPerc;
                            items.CWPerc = l_items_details.OrgCWPerc;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgCHPerc !== "undefined" && l_items_details.OrgCHPerc !== "" && l_items_details.RHchgInd == "Y") {
                            //l_items_details.OrgCHPerc !== 0
                            items.OrgCHPerc = l_items_details.OrgCHPerc;
                            items.CHPerc = l_items_details.OrgCHPerc;
                            valid = "Y";
                        }
                        if (typeof l_items_details.OrgCDPerc !== "undefined" && l_items_details.OrgCDPerc !== "" && l_items_details.RDchgInd == "Y") {
                            //l_items_details.OrgCDPerc !== 0
                            items.OrgCDPerc = l_items_details.OrgCDPerc;
                            items.CDPerc = l_items_details.OrgCDPerc;
                            valid = "Y";
                        }
                        if (typeof l_items_details.CnW !== "undefined" && l_items_details.CnW !== "" && l_items_details.OWchgInd == "Y") {
                            //l_items_details.CnW !== 0
                            items.CnW = l_items_details.CnW;
                            valid = "Y";
                        }
                        if (typeof l_items_details.CnH !== "undefined" && l_items_details.CnH !== "" && l_items_details.OHchgInd == "Y") {
                            //l_items_details.CnH !== 0
                            items.CnH = l_items_details.CnH;
                            valid = "Y";
                        }
                        if (typeof l_items_details.CnD !== "undefined" && l_items_details.CnD !== "" && l_items_details.ODchgInd == "Y") {
                            //l_items_details.CnD !== 0
                            items.CnD = l_items_details.CnD;
                            valid = "Y";
                        }
                        //ASA-1540 E

                        var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation); //ASA-1711

                        if (typeof l_items_details.CWPerc !== "undefined" && l_items_details.CWPerc !== "" && l_items_details.CWPerc !== 0) {
                            items.CWPerc = l_items_details.CWPerc;

                            //ASA-1711
                            // items.MHorizCrushed = typeof l_items_details.MHorizCrushed !== "undefined" ? l_items_details.MHorizCrushed : "N";
                            var manualHCrushed = "N"; //ASA-1711 issue 2
                            if (typeof l_items_details.MHorizCrushed !== "undefined" && l_items_details.MHorizCrushed == "Y") {
                                manualHCrushed = "Y";
                                if (actualWidth == "W") {
                                    items.MHorizCrushed = "Y";
                                } else if (actualHeight == "W") {
                                    items.MVertCrushed = "Y";
                                } else if (actualDepth == "W") {
                                    items.MDepthCrushed = "Y";
                                }
                            } else {
                                items.MHorizCrushed = "N";
                            }

                            valid = "Y";
                            // if (items.MHorizCrushed == "Y") {
                            if (manualHCrushed == "Y") {
                                items.CrushHoriz = l_items_details.CrushHoriz;
                            }
                            await crushItem(p_pog_index, objects.MIndex, objects.SIndex, objects.IIndex, "W", "Y", -1, -1);
                        }
                        if (typeof l_items_details.CHPerc !== "undefined" && l_items_details.CHPerc !== "" && l_items_details.CHPerc !== 0) {
                            items.CHPerc = l_items_details.CHPerc;
                            //ASA-1711
                            var manualVCrushed = "N"; //ASA-1711 issue 2
                            // items.MVertCrushed = typeof l_items_details.MVertCrushed !== "undefined" ? l_items_details.MVertCrushed : "N";
                            if (typeof l_items_details.MVertCrushed !== "undefined" && l_items_details.MVertCrushed == "Y") {
                                manualVCrushed = "Y";
                                if (actualWidth == "H") {
                                    items.MHorizCrushed = "Y";
                                } else if (actualHeight == "H") {
                                    items.MVertCrushed = "Y";
                                } else if (actualDepth == "H") {
                                    items.MDepthCrushed = "Y";
                                }
                            } else {
                                items.MVertCrushed = "N";
                            }

                            // if (items.MVertCrushed == "Y") {
                            if (manualVCrushed == "Y") {
                                items.CrushVert = l_items_details.CrushVert;
                            }
                            valid = "Y";
                            await crushItem(p_pog_index, objects.MIndex, objects.SIndex, objects.IIndex, "H", "Y", -1, -1);
                        }
                        if (typeof l_items_details.CDPerc !== "undefined" && l_items_details.CDPerc !== "" && l_items_details.CDPerc !== 0) {
                            items.CDPerc = l_items_details.CDPerc;
                            //ASA-1711
                            var manualDCrush = "N"; //ASA-1711 issue 2
                            // items.MDepthCrushed = typeof l_items_details.MDepthCrushed !== "undefined" ? l_items_details.MDepthCrushed : "N";
                            if (typeof l_items_details.MDepthCrushed !== "undefined" && l_items_details.MDepthCrushed == "Y") {
                                manualDCrush = "Y";
                                if (actualWidth == "D") {
                                    items.MHorizCrushed = "Y";
                                } else if (actualHeight == "D") {
                                    items.MVertCrushed = "Y";
                                } else if (actualDepth == "D") {
                                    items.MDepthCrushed = "Y";
                                }
                            } else {
                                items.MDepthCrushed = "N";
                            }

                            // if (items.MDepthCrushed == "Y") {
                            if (manualDCrush == "Y") {
                                items.CrushD = l_items_details.CrushD;
                            }
                            valid = "Y";
                            await crushItem(p_pog_index, objects.MIndex, objects.SIndex, objects.IIndex, "D", "Y", [items.D], [objects.IIndex]);
                        }
                        //ASA-1150 -E
                        //ASA-1408 S
                        //ASA-1410, Start
                        if (pogVFacingChng == "Y" && typeof l_items_details.MPogVertFacings !== "undefined" && l_items_details.MPogVertFacings !== "" && l_items_details.MPogVertFacings !== 0) {
                            items.MPogVertFacings = l_items_details.MPogVertFacings;
                            valid = "Y";
                        }
                        if (pogHFacingChng == "Y" && typeof l_items_details.MPogHorizFacings !== "undefined" && l_items_details.MPogHorizFacings !== "" && l_items_details.MPogHorizFacings !== 0) {
                            items.MPogHorizFacings = l_items_details.MPogHorizFacings;
                            valid = "Y";
                        }
                        if (pogDFacingChng == "Y" && typeof l_items_details.MPogDepthFacings !== "undefined" && l_items_details.MPogDepthFacings !== "" && l_items_details.MPogDepthFacings !== 0) {
                            items.MPogDepthFacings = l_items_details.MPogDepthFacings;
                            valid = "Y";
                        }
                        //ASA-1408 E
                        if (pegSpreadChng == "Y" && peg_spread !== "") {
                            items.PegSpread = peg_spread;
                            valid = "Y";
                        }
                        // if (color !== "#FFFFFF") {
                        if (colorChng == "Y" && color !== "") {
                            items.Color = color;
                            items.ShowColorBackup = color; //ASA-1481
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(objects.ObjID);
                            selectedObject.material.color = hex_decimal;
                            valid = "Y";
                        }
                        if (fixedChng == "Y" && fixed !== "") {
                            items.Fixed = fixed;
                            valid = "Y";
                        }
                        if (orientChng == "Y" && orientation !== "") {
                            items.Orientation = orientation;
                            items.OrientationDesc = $("#P25_ITEM_ORIENTATION :selected").text();
                            await get_edit_item_img(objects.MIndex, objects.SIndex, objects.IIndex, items, orientation, items.MerchStyle, p_pog_index); //ASA-1466
                            valid = "Y";
                        }
                        if (merchChng == "Y" && merch_style !== "") {
                            items.MerchStyle = merch_style;
                            valid = "Y";
                        }

                        if (typeof nestingWidth !== "undefined" && l_items_details.NWchgInd == "Y") {
                            // && nestingWidth !== 0) {//ASA-1476 issue 5,nestingWidth !== ""
                            items.NW = nestingWidth;
                            items.OrgNW = nestingWidth; //ASA-1496 issue 3
                        }
                        if (typeof nestingHeight !== "undefined" && l_items_details.NHchgInd == "Y") {
                            // && nestingHeight !== 0) {//ASA-1476 issue 5// nestingHeight !== ""
                            items.NH = nestingHeight;
                            items.OrgNH = nestingHeight; //ASA-1496 issue 3
                        }
                        if (typeof nestingDepth !== "undefined" && l_items_details.NDchgInd == "Y") {
                            // && nestingDepth !== 0) {//ASA-1476 issue 5 //nestingDepth; !==""
                            items.ND = nestingDepth;
                            items.OrgND = nestingDepth; //ASA-1496 issue 3
                        }
                        if (itemNestingChng !== "Y" || itemNesting == "") {
                            //ASA 1476 issue 5 //ASA-1476 Issue 7
                            items.ItemNesting = itemNesting;
                            if (itemNesting == "W") {
                                items.NVal = items.NW;
                            } else if (itemNesting == "H") {
                                items.NVal = items.NH;
                            } else if (itemNesting == "D") {
                                items.NVal = items.ND;
                            } else {
                                //ASA-1476
                                items.NVal = 0;
                            }
                            valid = "Y";
                        }
                        if (itemNestingChng == "Y" && nestingVal !== "" && (itemNesting == "H" || itemNesting == "W" || itemNesting == "D")) {
                            //ASA 1476 issue 5
                            if (l_items_details.NWchgInd == "Y" || l_items_details.NHchgInd == "Y" || l_items_details.NDchgInd == "Y") {
                                //ASA-1496 issue 6 S //ASA-1540 masterchng == "Y"
                                if (nestingVal == 0) {
                                    items.NVal = nestingVal;
                                    items.ItemNesting = "";
                                } else {
                                    items.NVal = nestingVal;
                                    items.ItemNesting = itemNesting;
                                }
                            } else {
                                if (nestingVal == 0) {
                                    if (itemNesting == "W") {
                                        items.NVal = items.NW;
                                    } else if (itemNesting == "H") {
                                        items.NVal = items.NH;
                                    } else if (itemNesting == "D") {
                                        items.NVal = items.ND;
                                    }
                                }
                                items.ItemNesting = itemNesting;
                            }
                            //ASA-1496 issue 6 E

                            valid = "Y";
                            if (check_nesting == "Y") {
                                //ASA-1466
                                nestingVal = 0;
                            }
                        }
                        if (capMaxHChng == "Y") {
                            items.CapMaxH = capMaxH;
                            valid = "Y";
                        }
                        if (maxHCapStyleChng == "Y") {
                            items.MaxHCapStyle = maxHCapStyle;
                            valid = "Y";
                        }
                        if (capStyleChng == "Y" || capStyle == "1" || capStyle == "2" || capStyle == "3") {
                            items.CapStyle = capStyle;
                            if (capFacingChng == "Y") {
                                items.CapFacing = capFacing;
                            }
                            if (capMerchChng == "Y") {
                                items.CapMerch = capMerch;
                            }
                            if (capOrientaionChng == "Y") {
                                items.CapOrientaion = capOrientaion;
                            }
                            if (capDepthChanged == "Y") {
                                items.CapDepth = capDepth;
                            }
                            await get_edit_item_img(objects.MIndex, objects.SIndex, objects.IIndex, items, items.CapOrientaion, items.CapMerch, p_pog_index); //ASA-1466
                            items.CapHorz = capHorz;
                            items.MCapTopFacing = mCapTopFacing;
                            items.CapDepthChanged = capDepthChanged;
                            valid = "Y";
                        }
                        //ASA-1410, End
                        if (valid == "Y") {
                            var items = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex];
                            var shelfs = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex];
                            if (shelfs.ObjType == "SHELF" && l_items_details.ShelfAutoCrush == "Y") {
                                shelfs.AllowAutoCrush = "Y";
                            }
                            var [select_width, select_height, select_depth] = get_select_dim(items);
                            if (g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].SpreadItem == "F") {
                                items_arr = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo;
                                $.each(items_arr, function (i, item_info) {
                                    item_info.W = item_info.RW;
                                });
                            }
                            if (select_width == 0 || select_height == 0 || select_depth == 0) {
                                alert(get_message("DIM_NOT_NULL"));
                                objects.Recreate = "N";
                                errored = "Y";
                                objects.Valid = "N";
                                break;
                            }
                            const [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(objects.MIndex, objects.SIndex, objects.IIndex, select_width, select_height, select_depth, items.ItemNesting, items.NVal, items.BHoriz, items.BVert, items.BaseD, items.Orientation, items.OrgCWPerc, items.OrgCHPerc, items.OrgCDPerc, "Y", "Y", "N", p_pog_index);

                            if (item_width !== "ERROR") {
                                var [itemx, itemy] = get_item_xy(shelfs, items, item_width, item_height, p_pog_index);
                                var item_dtl = g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex];
                                item_dtl.X = itemx;
                                item_dtl.Y = itemy;
                                item_dtl.Exists = "E";
                                item_dtl.W = item_width;
                                item_dtl.H = item_height;
                                item_dtl.D = item_depth;
                                item_dtl.RW = real_width;
                                item_dtl.RH = real_height;
                                item_dtl.RD = real_depth;
                                item_dtl.OW = select_width;
                                item_dtl.OH = select_height;
                                item_dtl.OD = select_depth;
                                var items = item_dtl;
                                update_top_bottom_xy(objects.MIndex, objects.SIndex, objects.IIndex, items, p_pog_index);
                                objects.Recreate = "Y";
                                objects.Valid = "Y";
                            } else {
                                objects.Recreate = "N";
                                errored = "Y";
                                objects.Valid = "N";
                                break;
                            }
                        } else {
                            objects.Recreate = "N";
                        }
                    }
                }
                if (errored == "N") {
                    var lookup = {};
                    var items = g_delete_details;
                    var UniqueID = [];
                    var details_arr = [];

                    for (var item, i = 0; (item = items[i++]);) {
                        if (item.Object == "ITEM" && item.Recreate == "Y") {
                            var name = "abc";
                            name = item.SIndex + "-" + item.MIndex;
                            if (!(name in lookup)) {
                                lookup[name] = 1;
                                //UniqueID.push(name);
                                var details = {};
                                details["SIndex"] = item.SIndex;
                                details["MIndex"] = item.MIndex;
                                details["ObjType"] = item.ObjType;
                                details_arr.push(details);
                            }
                        }
                    }
                    for (const details of details_arr) {
                        if (reorder_items(details.MIndex, details.SIndex, p_pog_index)) {
                            if (details.ObjType == "SHELF") {
                                var returnval = reset_top_bottom_objects(details.MIndex, details.SIndex, "N", p_pog_index);
                            }
                            return_val = await recreate_all_items(details.MIndex, details.SIndex, details.ObjType, "Y", -1, -1, g_pog_json[p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                        }
                    }
                    removeLoadingIndicator(regionloadWait); //ASA-1669
                    apex.message.showPageSuccess(g_item_shelf_updated_msg); //ASA-1669
                    render(p_pog_index);
                    //recreate the orientation view if any present
                    async function recreate_view() {
                        var returnval = await recreate_compare_views(g_compare_view, "N");
                    }
                    recreate_view();
                } else {
                    for (const objects of g_delete_details) {
                        if (objects.Object == "ITEM" && typeof objects.ItemInfo !== "undefined") {
                            g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ItemInfo[objects.IIndex] = objects.ItemInfo[0];
                        }
                    }
                    removeLoadingIndicator(regionloadWait);
                }
            }
            logFinalUndoObjectsInfo("SHELF_DRAG", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "N");
            g_allUndoObjectsInfo = [];
            g_mselect_drag = "N";
            g_multiselect = "N";
            g_delete_details = []; //spelling mistake was there
            g_ctrl_select = "N";
            g_dblclick_opened = "N";
            logDebug("function : manage_multi_edit", "E");
        }
    } catch (err) {
        error_handling(err);
    }
}

function context_multi_edit(p_edit_type) {
    logDebug("function : context_multi_edit; edit_type : " + p_edit_type, "S");
    try {
        new_details = JSON.parse(JSON.stringify(g_delete_details));

        for (const objects of new_details) {
            objects.ShelfInfo = "";
        }

        if ((g_multiselect == "Y" || g_ctrl_select == "Y") && new_details.length > 0) {
            if (p_edit_type == "P") {
                var l_items_details = {};
                l_items_details.g_multiselect = g_multiselect;
                l_items_details.g_ctrl_select = g_ctrl_select;
                l_items_details.delete_details = new_details;
                l_items_details.g_carpark_item_flag = g_carpark_item_flag;
                sessionStorage.setItem("items_details", JSON.stringify(l_items_details));
                openCustomDialog("OPEN_PRODUCT", $v("P25_PRODUCT_DETAILS_URL"), "P25_PRODUCT_DETAILS_TRIGGER");
            } else {
                var shelf_arr = [];
                var shelf_dtl = {};
                //ASA-1669
                if (((JsonContainsAll(new_details, {
                    Object: "SHELF",
                    ObjType: "TEXTBOX"
                }) && JsonContainsAll(new_details, {
                    Object: "ITEM",
                    ObjType: "SHELF"
                })) || JsonContainsAll(new_details, {
                    Object: "SHELF",
                    ObjType: "TEXTBOX"
                })) && !JsonContainsAll(new_details, {
                    Object: "SHELF",
                    ObjType: "SHELF"
                })) {
                    const warPageItem = ["P25_TEXT_WIDTH", "P25_TEXT_HEIGHT", "P25_TEXT_COLOR", "P25_TEXT_SLOPE", "P25_TEXT_ROTATION", "P25_FONT_STYLE", "P25_FONT_SIZE", "P25_BOLD", "P25_TEXT", "P25_WRAP_TEXT", "P25_REDUCETOFIT", "P25_IMG_FILENAME"];
                    for (const pageItem of warPageItem) {
                        $("#" + pageItem + "_CONTAINER .inc_tag_icon").remove();
                        $("#" + pageItem).removeClass("apex-item-has-icon");
                        $("#" + pageItem + "_CONTAINER").removeClass("apex-item-wrapper--has-icon");
                    }
                    $s("P25_IMG_FILENAME", "");
                    $("#IMAGE_AREA canvas").remove();
                    $("#VIEW_IMAGE canvas").remove();

                    shelf_dtl["g_multiselect"] = g_multiselect;
                    shelf_dtl["g_ctrl_select"] = g_ctrl_select;
                    shelf_dtl["delete_details"] = new_details;
                    shelf_dtl["g_carpark_item_flag"] = g_carpark_item_flag;
                    shelf_arr.push(shelf_dtl);
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "W", "P25_TEXT_WIDTH", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "H", "P25_TEXT_HEIGHT", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "Color", "P25_TEXT_COLOR", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "Slope", "P25_TEXT_SLOPE", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "Rotation", "P25_TEXT_ROTATION", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "FStyle", "P25_FONT_STYLE", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "FSize", "P25_FONT_SIZE", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "FBold", "P25_BOLD", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "InputText", "P25_TEXT", "S");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "WrapText", "P25_WRAP_TEXT", "S", "Y");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "ReduceToFit", "P25_REDUCETOFIT", "S", "Y");
                    setIconForInconsistentTag(shelf_arr[0].delete_details, "TextDirection", "P25_TEXT_DIRECTION", "S");

                    if (checkValueConsistency(shelf_arr[0].delete_details, "TextImg", "", "S")) {
                        var temp_image = {};
                        temp_image["FileName"] = shelf_arr[0].delete_details[0].TextImgFilename;
                        temp_image["MimeType"] = shelf_arr[0].delete_details[0].TextImgMimeType;
                        temp_image["Image"] = shelf_arr[0].delete_details[0].TextImg;
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
                        $s("P25_IMG_FILENAME", "");
                        $("#IMAGE_AREA canvas").remove();
                        $("#VIEW_IMAGE canvas").remove();
                        $("#P25_IMG_FILENAME_CONTAINER").addClass("apex-item-wrapper--has-icon");
                        $("#P25_IMG_FILENAME").addClass("apex-item-has-icon");
                        $("#P25_IMG_FILENAME").after('<span class="inc_tag_icon apex-item-icon fa fa-exclamation-triangle-o" aria-hidden="true"></span>');
                    }

                    $s("P25_TEXT_ID", "Mixed");
                    $s("P25_TEXT_NAME", "Mixed");
                    $("#P25_TEXT_ID, #P25_TEXT_NAME").addClass("apex_disabled");
                    $s("P25_SHELF_EDIT_IND", "Y");
                    openInlineDialog("add_textbox", 75, 85);
                } else {
                    // var shelf_arr = [];
                    // var shelf_dtl = {};
                    shelf_dtl["g_multiselect"] = g_multiselect;
                    shelf_dtl["g_ctrl_select"] = g_ctrl_select;
                    shelf_dtl["delete_details"] = new_details;
                    shelf_dtl["g_carpark_item_flag"] = g_carpark_item_flag;
                    shelf_arr.push(shelf_dtl);
                    sessionStorage.setItem("shelf_arr", JSON.stringify(shelf_arr));
                    openCustomDialog("SHELF_EDIT", $v("P25_SHELF_URL"), "P25_SHELF_TRIGGER_ELEMENT");
                }
            }
        }
        logDebug("function : context_multi_edit", "E");
    } catch (err) {
        error_handling(err);
    }
}

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

async function edit_pallet_init() {
    try {
        logDebug("function : edit_pallet_init", "S");
        if (g_shelf_edit_flag == "Y" && g_shelf_object_type == "PALLET") {
            if (g_ComViewIndex > -1 && g_compare_pog_flag == "Y") {
                g_pog_json.splice(g_ComViewIndex, 1);
            }
            if (g_pog_index !== g_ComViewIndex) {
                addLoadingIndicator();
                await edit_pallet("Y", g_module_index, g_shelf_index, g_pog_index, "Y");
                removeLoadingIndicator(regionloadWait);
            }
        } else {
            alert(get_message("POGCR_EDIT_PALLET_ERR"));
        }
        logDebug("function : edit_pallet_init", "E");
    } catch (err) {
        error_handling(err);
    }
}

function add_pallet_objects(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_module_index, p_shelf_index, p_items, p_shelf_info, p_first_create, p_pog_index, p_comViewIndex) {
    try {
        logDebug("function : add_pallet_objects; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
        g_shelf = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, 0.001),
            new THREE.MeshStandardMaterial({
                color: p_color,
            }));
        var l_wireframe_id = add_wireframe(g_shelf, 2);
        g_shelf.WFrameID = l_wireframe_id;
        g_shelf.position.x = p_x;
        g_shelf.position.y = p_y;
        g_shelf.position.z = 0.0005;
        g_shelf.uuid = p_uuid;
        g_shelf.FixelID = p_shelf_info.Shelf;
        g_shelf.Module = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Module;
        g_shelf.W = p_shelf_info.W;
        g_shelf.H = p_shelf_info.H;
        g_shelf.D = p_shelf_info.D;
        g_shelf.Color = p_shelf_info.Color;
        g_shelf.Rotation = 0;
        g_shelf.ItemSlope = 0;
        g_shelf.Rotation = "N";
        g_shelf.ImageExists = "N";
        g_scene_objects[p_comViewIndex].scene.children[2].add(g_shelf);
        g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].SObjID = g_shelf.id;
        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].CompShelfObjID = g_shelf.id;
        var m = 0;
        for (const objects of p_items) {
            var colorValue = parseInt(objects.Color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            p_items = new THREE.Mesh(
                new THREE.BoxGeometry(objects.W, objects.D, 0.001),
                new THREE.MeshStandardMaterial({
                    color: hex_decimal,
                }));
            var itemx = objects.Distance + objects.W / 2;
            var itemy = objects.Z;
            p_items.position.x = itemx;
            p_items.position.y = itemy;
            var new_z = 0.001;
            if (objects.BottomObjID !== "" && typeof objects.BottomObjID !== "undefined") {
                //ASA-1085
                new_z = new_z + new_z * (m / 100);
            }
            p_items.position.z = new_z;
            p_items.uuid = objects.Item;
            var l_wireframe_id = add_wireframe(p_items, 2);
            g_scene_objects[p_comViewIndex].scene.children[2].add(p_items);
            var i = 0;
            for (const new_objects of g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo) {
                if (objects.ObjID == new_objects.ObjID) {
                    if (typeof g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i] !== "undefined") {
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[i].CompItemObjID = p_items.id;
                    }
                    g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].BaseItemOldX = g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].X;
                    g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].BaseItemOldZ = g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].Z;
                    g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].ObjID = p_items.id;
                    g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].ObjID = p_items.id;
                    g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].X = itemx;
                    g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].Y = itemy;
                    g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo[i].Z = new_z;
                    break;
                }
                i = i + 1;
            }
            m++;
        }
        logDebug("function : add_pallet_objects", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function edit_pallet(p_create_main, p_module_index, p_shelf_index, p_pog_index, p_rerender) {
    logDebug("function : edit_pallet; create_main : " + p_create_main, "S");
    try {
        console.log("edit pallet called", p_create_main, p_module_index, p_shelf_index, p_pog_index);

        if (g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET") {
            g_scene_objects.splice(g_ComViewIndex, 1);
        }

        var details = {};
        details["POGCode"] = "PALLET_" + g_pog_json[p_pog_index].POGCode;
        details["BaseH"] = g_pog_json[p_pog_index].BaseH;
        details["ModuleInfo"] = [];
        g_pog_json.push(details);
        var l_shelf_details = {};
        l_shelf_details["Module"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Module;
        l_shelf_details["H"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].H;
        l_shelf_details["ShelfInfo"] = [];
        g_pog_json[g_pog_json.length - 1].ModuleInfo.push(l_shelf_details);
        g_pog_json[g_pog_json.length - 1].ModuleInfo[0].ShelfInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index])));
        g_pog_json[g_pog_json.length - 1].ModuleInfo[0].ShelfInfo[0].PrimeShelfObjID = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID;

        g_comp_view_code = details["POGCode"];
        g_comp_base_code = g_pog_json[p_pog_index].POGCode;

        g_ComViewIndex = g_pog_json.length - 1;
        g_ComBaseIndex = p_pog_index;
        g_edit_pallet_mod_ind = p_module_index;
        g_edit_pallet_shelf_ind = p_shelf_index;
        var prim_objid = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID;
        g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0].PrimeShelfObjID = prim_objid;

        g_compare_pog_flag = "Y";
        g_compare_view = "EDIT_PALLET";
        var POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
        if (p_rerender == "Y") {
            appendMultiCanvasRowCol(g_pog_json.length, $v("P25_POGCR_TILE_VIEW"));
        }
        init(g_ComViewIndex);
        var objects = {};
        objects["scene"] = g_scene;
        objects["renderer"] = g_renderer;
        g_scene_objects.push(objects);
        set_indicator_objects(g_ComViewIndex);
        if (p_rerender == "Y") {
            modifyWindowAfterMinMax(g_scene_objects);
        }

        var shelfs = g_pog_json[g_ComViewIndex].ModuleInfo[0].ShelfInfo[0];
        var [mod_ind, shelf_ind] = get_shelf_index(prim_objid, p_pog_index);
        console.log("mod_ind, shelf_ind", mod_ind, shelf_ind, prim_objid, p_pog_index);
        var colorValue = parseInt(shelfs.Color.replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        add_pallet_objects(shelfs.Shelf, shelfs.W, shelfs.D, shelfs.H, hex_decimal, shelfs.W / 2, shelfs.D / 2, mod_ind, shelf_ind, shelfs.ItemInfo, shelfs, p_create_main, p_pog_index, g_ComViewIndex);
        set_camera_z(g_scene_objects[g_ComViewIndex].scene.children[0], shelfs.W / 2, shelfs.D / 2, shelfs.W, shelfs.D, g_offset_z, shelfs.W, shelfs.D, true, g_ComViewIndex);

        render(g_ComViewIndex);
        console.log("scene_objects 4", g_scene_objects[0].scene.uuid);
        if (p_rerender == "Y") {
            add_pog_code_header();
        }
        g_pog_index = g_ComBaseIndex;
        var canvas_id = g_canvas_objects[g_ComBaseIndex].getAttribute("id");

        $("[data-pog]").removeClass("multiPogList_active");
        $(".canvas_highlight").removeClass("canvas_highlight");
        $("#" + canvas_id + "-btns").addClass("canvas_highlight");
        $("[data-indx=" + g_pog_index + "]").addClass("multiPogList_active");
        g_edit_pallet_shelfid = prim_objid;
        logDebug("function : edit_pallet", "E");
    } catch (err) {
        error_handling(err);
    }
}

function check_item_hit(p_items_list, p_item_detail, p_final_x, p_final_y, p_multi_ids) {
    try {
        logDebug("function : check_item_hit; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y, "S");
        item_start = wpdSetFixed(p_final_x - p_item_detail.W / 2); //.toFixed(3));
        item_end = wpdSetFixed(p_final_x + p_item_detail.W / 2); //.toFixed(3));
        item_top = wpdSetFixed(p_final_y + p_item_detail.D / 2); //.toFixed(3));
        item_bottom = wpdSetFixed(p_final_y - p_item_detail.D / 2); //.toFixed(3));
        var valid = "Y";
        $.each(p_items_list, function (k, items) {
            if (items.ObjID !== p_item_detail.ObjID && p_multi_ids.indexOf(items.ObjID) == -1) {
                div_start = wpdSetFixed(items.X - items.W / 2); //.toFixed(3));
                div_end = wpdSetFixed(items.X + items.W / 2); //.toFixed(3));
                div_top = wpdSetFixed(items.Y + items.D / 2); //.toFixed(3));
                div_bottom = wpdSetFixed(items.Y - items.D / 2); //.toFixed(3));
                if ((((div_start < item_end && div_start >= item_start) || (div_end > item_start && div_end <= item_end)) && ((div_bottom < item_top && div_bottom >= item_bottom) || (div_top <= item_top && div_top > item_bottom))) || (((item_start < div_start && item_end > div_start) || (item_start < div_end && item_end >= div_end)) && item_top <= div_top && item_bottom >= div_bottom) || (((div_start <= item_start && div_end >= item_end) || (div_start >= item_start && div_end <= item_end)) && ((div_top >= item_top && item_bottom >= div_bottom) || (div_top >= item_top && div_bottom <= item_bottom) || (div_top > item_top && div_bottom <= item_top))) || (item_start < div_start && item_end >= div_end && item_top <= div_top && item_top > div_bottom && item_bottom <= div_bottom) || (item_start > div_start && item_end <= div_end && item_top >= div_top && item_bottom < div_top && item_bottom <= div_bottom) || (item_start < div_start && item_end >= div_end && item_top <= div_top && item_bottom >= div_bottom) || (item_start < div_start && item_end >= div_end && item_top < div_top && item_top > div_bottom) || (item_start >= div_start && item_start < div_end && item_bottom >= div_bottom && item_bottom < div_top)) {
                    valid = "N";
                    return false;
                }
            }
        });
        logDebug("function : check_item_hit", "E");
        return valid;
    } catch (err) {
        error_handling(err);
    }
}

function update_item_edit_pallet(p_final_x, p_final_y, p_module_index, p_shelf_index, p_item_index, p_item_edit_flag, p_pog_index, p_comViewIndex) {
    try {
        console.log(" edit pallet", p_final_x, p_final_y, p_module_index, p_shelf_index, p_item_index, p_item_edit_flag, p_pog_index);
        logDebug("function : update_item_edit_pallet; i_final_x : " + p_final_x + "; p_final_y : " + p_final_y + "; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; i_item_edit_flag : " + p_item_edit_flag, "S");
        var items_list = g_pog_json[p_comViewIndex].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo;
        var item_detail = g_pog_json[p_comViewIndex].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
        g_temp_cut_arr = [];
        var multi_ids = [];
        if (g_drag_items_arr.length > 0) {
            for (const obj of g_drag_items_arr) {
                multi_ids.push(obj.id);
            }
        }

        if (p_final_x < 0 || p_final_x + item_detail.W / 2 > g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].W || p_final_y < 0 || p_final_y + item_detail.D / 2 > g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].D) {
            alert(get_message("ITEM_OUTSIDE_PEGBOARD", g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].Shelf));
            if (g_drag_items_arr.length > 0) {
                for (const obj of g_drag_items_arr) {
                    obj.position.set(obj.old_position_x, obj.old_position_y, obj.old_position_z);
                }
            } else {
                var selectedObject = g_scene_objects[p_comViewIndex].scene.children[2].getObjectById(item_detail.ObjID);
                if (typeof selectedObject !== "undefined") {
                    selectedObject.position.x = item_detail.X;
                    selectedObject.position.y = item_detail.Y;
                }
            }
        } else if (check_item_hit(items_list, item_detail, p_final_x, p_final_y, multi_ids) == "N") {
            alert(get_message("POGCR_ITEM_OVERLAP"));
            if (g_drag_items_arr.length > 0) {
                for (const obj of g_drag_items_arr) {
                    obj.position.set(obj.old_position_x, obj.old_position_y, obj.old_position_z);
                }
            } else {
                var selectedObject = g_scene_objects[p_comViewIndex].scene.children[2].getObjectById(item_detail.ObjID);
                if (typeof selectedObject !== "undefined") {
                    selectedObject.position.x = item_detail.X;
                    selectedObject.position.y = item_detail.Y;
                }
            }
        } else {
            if (g_drag_items_arr.length > 0) {
                for (const obj of g_drag_items_arr) {
                    var item_detail;
                    var i = 0;
                    var edit_item_ind = -1;
                    for (const items of g_pog_json[p_comViewIndex].ModuleInfo[0].ShelfInfo[0].ItemInfo) {
                        if (items.ObjID == obj.id) {
                            item_detail = items;
                            edit_item_ind = i;
                            break;
                        }
                        i++;
                    }
                    item_detail.old_position_x = item_detail.X;
                    item_detail.old_position_y = item_detail.Y;
                    obj.old_position_x = item_detail.X;
                    obj.old_position_y = item_detail.Y;

                    g_temp_cut_arr.push(JSON.parse(JSON.stringify(item_detail)));
                    item_detail.X = p_final_x;
                    item_detail.Y = p_final_y;
                    item_detail.X = p_final_x;
                    item_detail.Y = p_final_y;
                    item_detail.Distance = p_final_x - item_detail.W / 2;
                    var [mod_ind, shelf_ind, item_ind] = get_item_index(item_detail.ObjID, "C", p_pog_index);
                    var BaseItemOldX = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].X;

                    g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].Z = p_final_y;

                    var shelfs = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind];
                    var items = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind];

                    var new_x = shelfs.X - shelfs.W / 2 + p_final_x;
                    g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].X = new_x;
                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                    var BaseItemOldZ = selectedObject.position.z;
                    g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].BaseItemOldX = BaseItemOldX;
                    g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].BaseItemOldZ = BaseItemOldZ;

                    selectedObject.position.x = new_x;
                    selectedObject.position.z = 0.001 + g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].D / 1000 - g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].Z / 1000;
                }
            } else {
                item_detail.old_position_x = item_detail.X;
                item_detail.old_position_y = item_detail.Y;
                g_temp_cut_arr.push(JSON.parse(JSON.stringify(item_detail)));
                item_detail.X = p_final_x;
                item_detail.Y = p_final_y;
                item_detail.Distance = p_final_x - item_detail.W / 2;
                var [mod_ind, shelf_ind, item_ind] = get_item_index(item_detail.ObjID, "C", p_pog_index);
                var BaseItemOldX = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].X;

                g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].Z = p_final_y;

                var shelfs = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind];
                var items = g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind];

                var new_x = shelfs.X - shelfs.W / 2 + p_final_x;
                g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].X = new_x;
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(items.ObjID);
                var BaseItemOldZ = selectedObject.position.z;

                selectedObject.position.x = new_x;
                selectedObject.position.z = 0.001 + g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].D / 1000 - g_pog_json[p_pog_index].ModuleInfo[mod_ind].ShelfInfo[shelf_ind].ItemInfo[item_ind].Z / 1000;
                update_item_distance(mod_ind, shelf_ind, p_pog_index);
            }
            undoObjectsInfo = [];
            undoObjectsInfo.moduleIndex = p_module_index;
            undoObjectsInfo.shelfIndex = p_shelf_index;
            undoObjectsInfo.actionType = "DRAG_ITEM";
            undoObjectsInfo.startCanvas = p_comViewIndex;
            undoObjectsInfo.BaseItemOldZ = BaseItemOldZ;
            undoObjectsInfo.g_drag_items_arr = g_temp_cut_arr;
            undoObjectsInfo.objectID = g_pog_json[p_comViewIndex].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].SObjID;
            undoObjectsInfo.module = g_pog_json[p_comViewIndex].ModuleInfo[p_module_index].Module;
            undoObjectsInfo.moduleObjectID = g_pog_json[p_comViewIndex].ModuleInfo[p_module_index].MObjID;
            undoObjectsInfo.push(JSON.parse(JSON.stringify(g_pog_json[p_comViewIndex].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index])));
            g_allUndoObjectsInfo.push(undoObjectsInfo);
            logFinalUndoObjectsInfo("DRAG_ITEM", "U", g_allUndoObjectsInfo, "", "Y", "N", "N", "N", "N", "Y", g_carpark_item_flag);
            g_delete_details = [];
            g_temp_cut_arr = [];
            undoObjectsInfo = [];
            g_allUndoObjectsInfo = [];
        }
        var res = calculateFixelAndSupplyDays("N", p_pog_index);
        render(p_pog_index);
        logDebug("function : update_item_edit_pallet", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function uploadFile(p_fileIndex) {
    try {
        logDebug("function : uploadFile; pFileIndex : " + p_fileIndex, "S");
        var fileInputElem = document.getElementById("P25_UPLOAD_PDF");
        var filename = document.getElementById("P25_UPLOAD_PDF").innerHTML;
        var fileIndex = 0;
        var file = fileInputElem.files[fileIndex];
        if (!file) return; // Regression Issue 2 - 20251124
        var res = validate_file_type(file.name);
        var reader = new FileReader();
        if (validate_file_type(file.name)) {
            reader.onload = (function (pFile) {
                return function (e) {
                    if (pFile) {
                        var base64 = binaryArray2base64(e.target.result);
                        var f01Array = [];
                        f01Array = clob2Array(base64, 30000, f01Array);

                        apex.server.process(
                            "UPLOAD_FILE", {
                            x01: file.name,
                            x02: file.type,
                            f01: f01Array,
                        }, {
                            dataType: "json",
                            success: function (data) {
                                if (data.result == "success") {
                                    fileIndex++;

                                    if (fileIndex < fileInputElem.files.length) {
                                        uploadFile(fileIndex);
                                    } else {
                                        fileInputElem.value = "";
                                        $s("P25_FILE_NAME", file.name);
                                        g_pog_json[p_pog_index].UploadedPDF = "Y";
                                        g_upload_file_flag = "Y";
                                        logDebug("function : uploadFile", "E");
                                    }
                                } else {
                                    alert(get_message("INTERNAL_ERROR"));
                                }
                            },
                            loadingIndicatorPosition: "page",
                        });
                    }
                };
            })(file);
            reader.readAsArrayBuffer(file);
        }
    } catch (err) {
        error_handling(err);
    }
}

function get_pog_file(p_pog_code, p_pog_draft) {
    try {
        logDebug("function : get_pog_file; pog_code : " + p_pog_code + "; pog_draft : " + p_pog_draft, "S");
        return new Promise(function (resolve, reject) {
            var POG_json = JSON.stringify(g_pog_json);
            apex.server.process(
                "GET_POG_FILE", {
                x01: p_pog_code,
                x02: p_pog_draft,
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        $s("P25_FILE_NAME", $.trim(pData));
                        logDebug("function : get_pog_file", "E");
                        resolve($.trim(pData));
                    }
                },
                loadingIndicatorPosition: "page",
            });
        });
    } catch (err) {
        error_handling(err);
    }
}

function validate_bookend(p_itemsArr, p_shelfIndex, p_moduleIndex, p_itemIndex, p_finalX, p_movedItemWidth, p_objID) {
    try {
        logDebug("function : validate_bookend; shelfIndex : " + p_shelfIndex + "; moduleIndex : " + p_moduleIndex + "; itemIndex : " + p_itemIndex + "; finalX : " + p_finalX + "; movedItemWidth : " + p_movedItemWidth + "; objID : " + p_objID, "S");
        var beforeItems = [];
        var afterItems = [];
        var p_movedItemWidth = p_movedItemWidth;
        var itemsBetween = {};
        var shelfStart = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].X - g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].W / 2;
        var shelfEnd = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].X + g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].W / 2;
        var itemEnd = p_finalX + p_movedItemWidth / 2;
        var itemStart = p_finalX - p_movedItemWidth / 2;
        var i = 0;
        var itemX = -1;
        var bookEnd = "N";
        var minX = 0;
        var maxX = 0;
        var l_isBookend = "N";
        var betweenItemsArr = [];
        var moveWithinRange = "N";
        var isValid = "Y";
        var beforeInvalid = "N";
        for (items of p_itemsArr) {
            if (items.ObjID == p_objID && items.Fixed == "B") {
                l_isBookend = "Y";
            }
            if (i == 0) {
                beforeItems.push(shelfStart);
            }
            itemX = items.X + items.W / 2;
            if (items.Fixed == "B" && itemX < p_finalX && items.ObjID !== p_objID) {
                beforeItems.push(items.X + items.W / 2);
                bookEnd = "Y";
                //  break;
            }
            i++;
        }
        var k = 0;
        minX = Math.max.apply(Math, beforeItems);
        for (items1 of p_itemsArr) {
            if (k == p_itemsArr.length - 1) {
                afterItems.push(shelfEnd);
            }
            itemX = items1.X - items1.W / 2;
            if (items1.Fixed == "B" && itemX > p_finalX && itemX > minX && items1.ObjID !== p_objID) {
                afterItems.push(items1.X - items1.W / 2);
                bookEnd = "Y";
                //  break;
            }
            k++;
        }
        maxX = Math.min.apply(Math, afterItems);
        var itemsWidth = 0;
        var availableSpace = 0;
        var blankSpace = 0;
        var l = 0;
        for (items2 of p_itemsArr) {
            if (items2.X > minX && items2.X < maxX) {
                itemsBetween["ItemID"] = items2.ItemID;
                itemsBetween["IIndex"] = l;
                itemsBetween["W"] = items2.W;
                itemsBetween["ItemStart"] = items2.X - items2.W / 2;
                itemsBetween["ItemEnd"] = items2.X + items2.W / 2;
                itemsBetween["X"] = items2.X;
                itemsBetween["ObjID"] = items2.ObjID;
                betweenItemsArr.push(itemsBetween);
                itemsWidth += items2.W;
                itemsBetween = {};
            }
            l++;
        }
        if ((g_itemDragX > minX && g_itemDragX < maxX) || (g_itemDragX < minX && g_itemDragX > maxX)) {
            availableSpace = maxX - minX;
            moveWithinRange = "Y";
        } else {
            moveWithinRange = "N";
            itemsBetween["ItemID"] = "";
            itemsBetween["IIndex"] = "";
            itemsBetween["W"] = p_movedItemWidth;
            availableSpace = maxX - minX - itemsWidth;
        }
        var totalWidth = 0;
        var startX = minX;
        if (l_isBookend == "Y" && moveWithinRange == "N") {
            for (s of betweenItemsArr) {
                if (s.W < itemStart - startX && beforeInvalid == "N") {
                    startX += s.W;
                } else if (s.W < maxX - itemEnd) {
                    itemEnd += s.W;
                    beforeInvalid = "Y";
                } else {
                    isValid = "N";
                    beforeInvalid = "Y";
                }
            }
        } else {
            for (s of betweenItemsArr) {
                if (s.ObjID !== p_objID) {
                    if (s.W < itemStart - startX && beforeInvalid == "N") {
                        startX += s.W;
                    } else if (s.W < maxX - itemEnd) {
                        itemEnd += s.W;
                        beforeInvalid = "Y";
                    } else {
                        isValid = "N";
                        beforeInvalid = "Y";
                        break;
                    }
                }
            }
        }
        logDebug("function : validate_bookend", "E");
        if (bookEnd == "Y") {
            if (availableSpace < p_movedItemWidth || isValid == "N") {
                return "N";
            } else {
                return "Y";
            }
        } else {
            return "Y";
        }
    } catch (err) {
        error_handling(err);
    }
}

async function updateObjID(p_oldObjID, p_newObjID, p_updType, p_old_shelf, p_new_shelf) {
    try {
        logDebug("function : updateObjID; oldObjID : " + p_oldObjID + "; newObjID : " + p_newObjID + "; updType : " + p_updType, "S");
        var i = 0;
        var newModuleIndex = -1;
        if (p_updType == "M") {
            for (undo of g_undo_final_obj_arr) {
                var k = 0;
                for (undoDet of undo[0]) {
                    if (typeof undoDet.module !== "undefined" && p_oldObjID !== "undefined") {
                        if (undoDet.module.toLowerCase() == p_oldObjID.toLowerCase()) {
                            g_undo_final_obj_arr[i][0][k].moduleIndex = p_newObjID;
                        }
                    }
                    k++;
                }
                i++;
            }
            var i = 0;
            for (redo of g_redo_final_obj_arr) {
                var k = 0;
                for (redoDet of redo[0]) {
                    if (typeof redoDet.module !== "undefined" && typeof p_oldObjID !== "undefined") {
                        if (redoDet.module.toLowerCase() == p_oldObjID.toLowerCase()) {
                            g_redo_final_obj_arr[i][0][k].moduleIndex = p_newObjID;
                        }
                    }
                    k++;
                }
                i++;
            }
            if (g_combinedShelfs.length > 0) {
                var i = 0;
                for (combination of g_combinedShelfs) {
                    var j = 0;
                    for (shelf of combination) {
                        if (shelf.MObjID == p_oldObjID) {
                            shelf.MObjID = p_newObjID;
                        }
                        j++;
                    }
                    i++;
                }
            }
        } else {
            for (undo of g_undo_final_obj_arr) {
                var k = 0;
                for (undoDet of undo[0]) {
                    if (undoDet.objectID == p_oldObjID) {
                        g_undo_final_obj_arr[i][0][k].objectID = p_newObjID;
                    }
                    k++;
                }
                i++;
            }
            var i = 0;
            for (redo of g_redo_final_obj_arr) {
                var k = 0;
                for (redoDet of redo[0]) {
                    if (redoDet.objectID == p_oldObjID) {
                        g_redo_final_obj_arr[i][0][k].objectID = p_newObjID;
                    }
                    k++;
                }
                i++;
            }
            if (g_combinedShelfs.length > 0) {
                var i = 0;
                for (combination of g_combinedShelfs) {
                    var j = 0;
                    for (shelf_info of combination) {
                        if (shelf_info.SObjID == p_oldObjID) {
                            shelf_info.SObjID = p_newObjID;
                            break;
                        }
                        j++;
                    }
                    i++;
                }
                if (typeof p_old_shelf !== "undefined") {
                    var i = 0;
                    for (combination of g_combinedShelfs) {
                        var j = 0;
                        for (shelf_info of combination) {
                            if (shelf_info.Shelf == p_old_shelf) {
                                shelf_info.Shelf = p_new_shelf;
                            }
                            j++;
                        }
                        i++;
                    }
                }
            }
        }
        logDebug("function : updateObjID", "E");
    } catch (err) {
        error_handling(err);
    }
}

function set_pog_page_items(p_pog_index) {
    try {
        logDebug("function : set_pog_page_items", "S");
        apex.item("P25_POG_WIDTH").setValue((g_pog_json[p_pog_index].W * 100).toFixed(2));
        apex.item("P25_POG_DEPTH").setValue((g_pog_json[p_pog_index].D * 100).toFixed(2));
        apex.item("P25_BACK_DEPTH").setValue((g_pog_json[p_pog_index].BackDepth * 100).toFixed(2));
        if ((g_pog_json[p_pog_index].SegmentW * 100).toFixed(2) !== "NaN") {
            apex.item("P25_POG_SEGMENT_WIDTH").setValue((g_pog_json[p_pog_index].SegmentW * 100).toFixed(2));
        }
        apex.item("P25_TRAFFIC_FLOW").setValue(g_pog_json[p_pog_index].TrafficFlow);
        apex.item("P25_POG_BASE_HEIGHT").setValue((g_pog_json[p_pog_index].BaseH * 100).toFixed(2));
        apex.item("P25_POG_BASE_WIDTH").setValue((g_pog_json[p_pog_index].BaseW * 100).toFixed(2));
        apex.item("P25_POG_BASE_DEPTH").setValue((g_pog_json[p_pog_index].BaseD * 100).toFixed(2));
        apex.item("P25_POG_NOTCH_WIDTH").setValue((g_pog_json[p_pog_index].NotchW * 100).toFixed(2));
        apex.item("P25_POG_NOTCH_START").setValue((g_pog_json[p_pog_index].NotchStart * 100).toFixed(2));
        apex.item("P25_POG_NOTCH_SPACING").setValue((g_pog_json[p_pog_index].NotchSpacing * 100).toFixed(2));
        apex.item("P25_POG_COLOR").setValue(g_pog_json[p_pog_index].Color);
        apex.item("P25_HORZ_START").setValue((g_pog_json[p_pog_index].HorzStart * 100).toFixed(2));
        apex.item("P25_HORZ_SPACING").setValue((g_pog_json[p_pog_index].HorzSpacing * 100).toFixed(2));
        apex.item("P25_POG_VERT_START").setValue((g_pog_json[p_pog_index].VertStart * 100).toFixed(2));
        apex.item("P25_POG_VERT_SPACING").setValue((g_pog_json[p_pog_index].VertSpacing * 100).toFixed(2));
        apex.item("P25_ALLOW_OVERLAP").setValue(g_pog_json[p_pog_index].AllowOverlap);
        apex.item("P25_SPECIAL_TYPE").setValue(g_pog_json[p_pog_index].SpecialType);
        apex.item("P25_SPECIAL_TYPE_DESC").setValue(g_pog_json[p_pog_index].SpecialTypeDesc);
        apex.item("P25_DISPLAY_METERAGE").setValue(g_pog_json[p_pog_index].DisplayMeterage);
        apex.item("P25_RPT_METERAGE").setValue(g_pog_json[p_pog_index].RPTMeterage);
        apex.item("P25_EFF_START_DATE").setValue(g_pog_json[p_pog_index].EffStartDate);
        apex.item("P25_BRAND_GROUP_ID").setValue(g_pog_json[p_pog_index].BrandGroupID);
        apex.item("P25_REMARKS").setValue(g_pog_json[p_pog_index].Remarks);
        apex.item("P25_STORE_SEGMENT").setValue(g_pog_json[p_pog_index].StoreSegment);
        apex.item("P25_DESC_7").setValue(g_pog_json[p_pog_index].Desc7);
        apex.item("P25_AREA").setValue(g_pog_json[p_pog_index].Area);
        apex.item("P25_PLN_DEPT").setValue(g_pog_json[p_pog_index].PLNDept);
        g_isPogItemsSet = "Y";
        logDebug("function : set_pog_page_items", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function showItemDescription() {
    try {
        logDebug("function : showItemDescription", "S");
        var originalCanvas = g_pog_index;
        var desc_flag;

        if (g_show_item_desc == "N") {
            g_show_item_desc = "Y";
            $(".item_desc").addClass("item_label_active");
        } else {
            g_show_item_desc = "N";
            $(".item_desc").removeClass("item_label_active");
        }
        if (g_all_pog_flag == "Y") {
            var z = 0;
        } else {
            var z = g_pog_index;
        }
        if (g_show_days_of_supply == "Y" && g_show_item_desc == "Y") {
            g_show_days_of_supply = "N";
            $(".supply_days").removeClass("item_label_active");
        }
        for (const pogJson of g_pog_json) {
            if ((z !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                g_renderer = g_scene_objects[z].renderer;
                g_scene = g_scene_objects[z].scene;
                g_camera = g_scene_objects[z].scene.children[0];
                g_world = g_scene_objects[z].scene.children[2];

                desc_flag = g_show_item_desc;
                if (g_scene_objects[z].Indicators.LiveImage == "Y") {
                    g_scene_objects[z].Indicators.LiveImage = "N";
                    var return_val = await recreate_image_items("N", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), z, "N", "Y", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                    g_show_live_image = "N";
                }
                g_scene_objects[z].Indicators.ItemDesc = desc_flag;
                var res = await showHideItemDescription(desc_flag, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), z);
                var res = await showHideDaysOfSupplyLabel("N", "N", z, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                set_indicator_objects(z);
            }
            if (g_all_pog_flag == "Y") {
                z++;
            } else {
                break;
            }
        }
        if (g_show_live_image == "Y") {
            g_show_live_image = "N";

            $(".live_image").removeClass("live_image_active");
        }
        g_renderer = g_scene_objects[originalCanvas].renderer;
        g_scene = g_scene_objects[originalCanvas].scene;
        g_camera = g_scene_objects[originalCanvas].scene.children[0];
        g_world = g_scene_objects[originalCanvas].scene.children[2];
        g_prev_undo_action = "ITEM_DESC";
        logDebug("function : showItemDescription", "E");
    } catch (err) {
        error_handling(err);
    }
}

function checkSelected(p_ig_static_id) {
    try {
        logDebug("function : checkSelected; ig_static_id : " + p_ig_static_id, "S");
        var model = apex.region(p_ig_static_id).widget().interactiveGrid("getViews", "grid").model;
        var selectedRecords = $v("P25_SELECTED_RECORDS").split(":");
        if (selectedRecords.length == 0 && sessionStorage.getItem("pog_list") !== "") {
            var selectedRecords = sessionStorage.getItem("pog_list").split(":");
        }
        var salKey = model.getFieldKey("POG_CODE"),
            total = 0;
        var chk = [];
        model.forEach(function (record, index, id) {
            var sal = record[salKey]; // record[salKey] should be a little faster than using model.getValue in a loop
            var meta = model.getRecordMetadata(id);
            for (i = 0; i < selectedRecords.length; i++) {
                if (sal == selectedRecords[i]) {
                    chk.push(record);
                }
            }
        });
        if (selectedRecords.length > 1) {
            apex.region(p_ig_static_id).widget().interactiveGrid("setSelectedRecords", chk);
        }

        logDebug("function : checkSelected", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function showItemColor(p_type, p_pog_index) {
    try {
        logDebug("function : showItemColor; p_type : " + p_type, "S");
        console.log("item color", p_type, p_pog_index);
        if (g_show_live_image == "Y") {
            $(".live_image").removeClass("live_image_active");
            g_show_live_image = "N";
        }
        g_color_arr = [];
        $s("P25_SELECT_COLOR_TYPE", p_type);
        old_pogIndex = p_pog_index;

        if (g_all_pog_flag == "Y") {
            var z = 0;
        } else {
            var z = p_pog_index;
        }
        for (const pogJson of g_pog_json) {
            if (g_ComViewIndex > -1 || g_ComViewIndex == -1) {
                g_world = g_scene_objects[z].scene.children[2];
                g_camera = g_scene_objects[z].scene.children[0];
                if (p_type !== "OFF") {
                    g_show_item_color = "Y";
                    g_scene_objects[z].Indicators.LiveImage = "N";
                    g_scene_objects[z].Indicators.canvas_color_flag = p_type;
                    var return_val = await recreate_image_items("N", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), z, "N", "", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                    $("#item_group_sub a").removeClass("item_color_active");
                    $("." + p_type).addClass("item_color_active");
                    var return_val = await generateItemColors(p_type, z);
                } else {
                    g_show_item_color = "N";
                    g_scene_objects[z].Indicators.canvas_color_flag = "";
                    $s("P25_SELECT_COLOR_TYPE", null);
                    $("#item_group_sub a").removeClass("item_color_active");
                    $(".item_color_legends").css("display", "none");
                    ShowColorBackup(z);
                }
                g_scene_objects[z].Indicators.ItemColor = g_show_item_color;
            }
            if (g_all_pog_flag == "Y") {
                z++;
            } else {
                break;
            }
        }
        g_world = g_scene_objects[old_pogIndex].scene.children[2];
        g_camera = g_scene_objects[old_pogIndex].scene.children[0];
        return new Promise(function (resolve, reject) {
            console.log("g_color_arr", g_color_arr);
            apex.server.process(
                "CREATE_ITEMS_COLOR_COLL", {
                x01: p_type,
                p_clob_01: JSON.stringify(g_color_arr),
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        g_color_arr = [];
                    }
                    logDebug("function : generateItemColors", "E");
                },
            });
        });
    } catch (err) {
        error_handling(err);
    }
}

async function item_grouping(p_pog_index, p_type) {
    try {
        logDebug("function : item_grouping; p_type : " + p_type, "S");
        var prev_desc = "";
        var prev_supplier = -1;
        var prev_subclass = -1;
        var color_detail = {};
        var desc;
        if (g_all_pog_flag == "N") {
            $s("P25_SELECTED_CANVAS", `${p_pog_index}`);
        }

        switch (p_type) {
            case "IB":
                desc = "it.Brand";
                break;
            case "IS":
                desc = "it.Supplier";
                break;
            case "IC":
                desc = "it.SubClass";
                break;
            case "IL":
                desc = "it.Class";
                break;
            case "IG":
                desc = "it.Group";
                break;
            case "ID":
                desc = "it.Dept";
                break;
            case "ICDT1":
                desc = "it.CDTLvl1";
                break;
            case "ICDT2":
                desc = "it.CDTLvl2";
                break;
            case "ICDT3":
                desc = "it.CDTLvl3";
                break;
        }
        var i = 0;
        for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
            var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
            var k = 0;
            for (const shelf of modules_info.ShelfInfo) {
                var ItemInfo = shelf.ItemInfo;
                var m = 0;
                for (const it of ItemInfo) {
                    const randColor = () => {
                        return (
                            "0x" +
                            Math.floor(Math.random() * 16777216)
                                .toString(16)
                                .padStart(6, "0")
                                .toUpperCase());
                    };
                    color_detail = {};
                    color_detail["DESCRIPTION"] = eval(desc);
                    color_detail["COLOR_CODE"] = randColor();
                    color_detail["TYPE"] = p_type;
                    color_detail["CANVAS"] = p_pog_index;
                    color_detail["POG_CODE"] = g_pog_json[p_pog_index].POGCode;

                    if (g_all_pog_flag == "Y") {
                        for (const obj of g_color_arr) {
                            if (obj.DESCRIPTION == color_detail["DESCRIPTION"] && obj.CANVAS !== p_pog_index) {
                                color_detail["COLOR_CODE"] = obj.COLOR_CODE;
                                break;
                            }
                        }
                    }
                    var exists = checkDuplicate(eval(desc), i, k, "g_color_arr", p_pog_index);
                    if (exists == false) {
                        g_color_arr.push(color_detail);
                    }
                    m++;
                }
                k++;
            }
            if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
                var m = 0;
                for (const it of carparkInfo[0].ItemInfo) {
                    const randColor = () => {
                        return (
                            "0x" +
                            Math.floor(Math.random() * 16777216)
                                .toString(16)
                                .padStart(6, "0")
                                .toUpperCase());
                    };
                    color_detail = {};
                    color_detail["DESCRIPTION"] = eval(desc);
                    color_detail["COLOR_CODE"] = randColor();
                    color_detail["TYPE"] = p_type;
                    color_detail["CANVAS"] = p_pog_index;
                    color_detail["POG_CODE"] = g_pog_json[p_pog_index].POGCode;
                    if (g_all_pog_flag == "Y") {
                        for (const obj of g_color_arr) {
                            if (obj.DESCRIPTION == color_detail["DESCRIPTION"] && obj.CANVAS !== p_pog_index) {
                                color_detail["COLOR_CODE"] = obj.COLOR_CODE;
                                break;
                            }
                        }
                    }
                    var exists = checkDuplicate(eval(desc), i, k, "g_color_arr");
                    if (exists == false) {
                        g_color_arr.push(color_detail);
                    }
                    m++;
                }
            }
            i++;
        }
        logDebug("function : item_grouping", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function set_items_color(p_pog_index, p_type) {
    try {
        logDebug("function : set_items_color; p_type : " + p_type, "S");
        var color_code;
        var desc;
        switch (p_type) {
            case "IB":
                desc = "it.Brand";
                break;
            case "IS":
                desc = "it.Supplier";
                break;
            case "IC":
                desc = "it.SubClass";
                break;
            case "IL":
                desc = "it.Class";
                break;
            case "IG":
                desc = "it.Group";
                break;
            case "ID":
                desc = "it.Dept";
                break;
            case "ICDT1":
                desc = "it.CDTLvl1";
                break;
            case "ICDT2":
                desc = "it.CDTLvl2";
                break;
            case "ICDT3":
                desc = "it.CDTLvl3";
                break;
        }
        var checkCondition = "b.DESCRIPTION == " + desc + "&& b.CANVAS == " + p_pog_index;
        var i = 0;
        for (var modules_info of g_pog_json[p_pog_index].ModuleInfo) {
            var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
            var k = 0;
            for (var shelf of modules_info.ShelfInfo) {
                var m = 0;
                for (var it of shelf.ItemInfo) {
                    for (b of g_color_arr) {
                        if (eval(checkCondition)) {
                            color_code = b.COLOR_CODE;
                            break;
                        }
                    }
                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                    selectedObject.material.color.setHex(color_code);
                    var child = selectedObject.children;
                    for (n = 0; n < child.length; n++) {
                        if (child[n].uuid == "horiz_facing") {
                            child[n].material.color.setHex(color_code);
                        }
                    }
                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[k].ItemInfo[m].Color = color_code;
                    m++;
                }
                k++;
            }
            if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
                var m = 0;
                for (var it of carparkInfo[0].ItemInfo) {
                    for (b of g_color_arr) {
                        if (eval(checkCondition)) {
                            color_code = b.COLOR_CODE;
                            break;
                        }
                    }
                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                    selectedObject.material.color.setHex(color_code);
                    var child = selectedObject.children;
                    for (n = 0; n < child.length; n++) {
                        if (child[n].uuid == "horiz_facing") {
                            child[n].material.color.setHex(color_code);
                        }
                    }
                    g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[m].Color = color_code;
                    m++;
                }
            }
            render(p_pog_index);
            i++;
        }
        logDebug("function : set_items_color", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function generateItemColors(p_type, p_pog_index) {
    try {
        logDebug("function : generateItemColors; p_type : " + p_type, "S");
        if (p_type == "OFF") {
            g_show_item_color = "N";
        } else {
            g_show_item_color = "Y";
        }
        var color_list = [];
        if (g_show_item_color == "Y") {
            $(".item_color_legends").css("display", "block");
        } else {
            $(".item_color_legends").css("display", "none");
        }
        if (g_show_item_color == "Y") {
            addLoadingIndicator();
            var res = await ShowColorBackup(p_pog_index);
            var res = await item_grouping(p_pog_index, p_type);
            var res = await set_items_color(p_pog_index, p_type);
            removeLoadingIndicator(regionloadWait);
        } else {
            var res = ShowColorBackup(g_pog_index);
        }

        logDebug("function : generateItemColors", "E");
    } catch (err) {
        error_handling(err);
    }
}

function showItemLegends() {
    logDebug("function : showItemLegends", "S");
    apex.region("item_color_details").refresh();
    openInlineDialog("show_item_color_legends", 35, 45);
    logDebug("function : showItemLegends", "E");
}

async function ShowColorBackup(p_pog_index) {
    try {
        logDebug("function : ShowColorBackup", "S");
        // console.log("backup", g_pog_json[p_pog_index].ColorBackup);
        if (typeof g_pog_json[p_pog_index].ColorBackup == "undefined") {
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
                if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                    var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
                    var shelfs_info = modules_info.ShelfInfo;
                    var j = 0;
                    for (const shelfs of shelfs_info) {
                        var l = 0;
                        for (const it of shelfs.ItemInfo) {
                            var item_dtl = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l];
                            item_dtl.ShowColorBackup = item_dtl.Color;
                            g_pog_json[p_pog_index].ColorBackup = "Y";
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                            selectedObject.ShowColorBackup = selectedObject.material.color.getHex;
                            l++;
                        }
                        j++;
                    }
                    if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
                        var l = 0;
                        for (const it of carparkInfo[0].ItemInfo) {
                            g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].ShowColorBackup = g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].Color;
                            g_pog_json[p_pog_index].ColorBackup = "Y";
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                            selectedObject.ShowColorBackup = selectedObject.material.color.getHex;
                            l++;
                        }
                    }
                }
                render(p_pog_index);
            });
        } else {
            var i = 0;
            for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
                if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                    var carparkInfo = g_pog_json[p_pog_index].ModuleInfo[i].Carpark;
                    var shelfs_info = modules_info.ShelfInfo;
                    var j = 0;
                    for (const shelfs of shelfs_info) {
                        var l = 0;
                        for (const it of shelfs.ItemInfo) {
                            var item_dtl = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[l];
                            item_dtl.Color = item_dtl.ShowColorBackup;
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                            var newColor = item_dtl.Color.replace(/#/g, "0x");
                            selectedObject.material.color.setHex(newColor);
                            var child = selectedObject.children;
                            for (m = 0; m < child.length; m++) {
                                if (child[m].uuid == "horiz_facing") {
                                    child[m].material.color.setHex(newColor);
                                }
                            }
                            g_pog_json[p_pog_index].ColorBackup = "Y";
                            l++;
                        }
                        j++;
                    }
                    if (typeof carparkInfo !== "undefined" && carparkInfo.length > 0) {
                        l = 0;
                        for (const it of carparkInfo[0].ItemInfo) {
                            g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].Color = g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].ShowColorBackup;
                            var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(it.ObjID);
                            var newColor = g_pog_json[p_pog_index].ModuleInfo[i].Carpark[0].ItemInfo[l].Color.replace(/#/g, "0x");
                            selectedObject.material.color.setHex(newColor);
                            var child = selectedObject.children;
                            for (m = 0; m < child.length; m++) {
                                if (child[m].uuid == "horiz_facing") {
                                    child[m].material.color.setHex(newColor);
                                }
                            }
                            g_pog_json[p_pog_index].ColorBackup = "Y";
                            l++;
                        }
                    }
                }
                i++;
            }
            render(p_pog_index);
        }
        logDebug("function : ShowColorBackup", "E");
    } catch (err) {
        error_handling(err);
    }
}

function checkDuplicate(p_description, p_moduleIndex, p_shelfIndex, p_checkValuesIn, p_pog_index) {
    try {
        logDebug("function : checkDuplicate; description : " + p_description, "S");
        if (p_checkValuesIn == "g_color_arr") {
            return g_color_arr.some(function (el) {
                logDebug("function : checkDuplicate", "E");
                return el.DESCRIPTION === p_description && el.CANVAS === p_pog_index;
            });
        } else if (p_checkValuesIn == "BACKUP") {
            return g_pogBackup.some(function (el) {
                logDebug("function : checkDuplicate", "E");
                return el.moduleIndex === p_moduleIndex && el.shelfIndex === p_shelfIndex;
            });
        }
    } catch (err) {
        error_handling(err);
    }
}


// ASA-2017 Start
function findItemInfoByObjID(p_objID, p_pog_index) {
    for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
        if (modules.ParentModule != null) continue;
        //ASA-2017 Issue 6 Start
        if (modules.Carpark) {
            for (const carpark of modules.Carpark) {
                if (!carpark.ItemInfo) continue;
                for (const item of carpark.ItemInfo) {
                    if (item.ObjID === p_objID) {
                        return item;
                    }
                }
            }
        }
         //ASA-2017 Issue 6 End
        for (const shelf of modules.ShelfInfo) {
            if (
                shelf.ObjType === "BASE" ||
                shelf.ObjType === "NOTCH" ||
                shelf.ObjType === "DIVIDER" ||
                shelf.ObjType === "TEXTBOX"
            ) continue;

            for (const items of shelf.ItemInfo) {
                if (items.ObjID === p_objID) {
                    return items;
                }
            }
        }
    }
    return null;
}

//ASA-2017 issue-5 start
async function find_highlight_frame() {
    try {
        if (!Array.isArray(g_scene_objects) || g_scene_objects.length === 0) return [];
        const removed = [];

        g_scene_objects.forEach(sceneObj => {
            const scene = sceneObj.scene;
            if (!scene) return;

            // collect highlight frames by name or uuid
            const toRemove = [];
            scene.traverse(obj => {
                try {
                    if (!obj) return;
                    if (obj.uuid === "highlight_frame" || obj.name === "highlight_frame") {
                        toRemove.push(obj);
                    }
                } catch (e) { }
            });

            toRemove.forEach(obj => {
                try {
                    obj.traverse(child => {
                        try {
                            if (child.geometry) child.geometry.dispose();

                        } catch (e) { }
                        try {
                            if (child.material) {
                                const mats = Array.isArray(child.material) ? child.material : [child.material];
                                mats.forEach(m => {
                                    try {
                                        if (m.map) m.map.dispose();
                                        if (m.lightMap?.dispose) m.lightMap.dispose();
                                        if (m.envMap?.dispose) m.envMap.dispose();
                                        m.dispose?.();
                                    } catch (e) { }
                                });
                            }
                        } catch (e) { }
                    });
                } catch (e) { }

                try {
                    if (obj.parent) obj.parent.remove(obj);
                    else scene.remove(obj);
                } catch (e) { }

                removed.push(obj);
            });
        });

        render_all_pog();
        if (g_scene_objects[0].Indicators.LiveImage !== "Y") { //ASA-2017 issue 8 
            for (let pogIdx = 0; pogIdx < g_pog_json.length; pogIdx++) {
                clearFrame(pogIdx);
            }
        }
        return removed;
    } catch (err) {
        error_handling(err);
    }
    
}
//ASA-2017 issue 8 
async function clearFrame(p_pog_index) {
    try {
        const l_world   = g_scene_objects[p_pog_index].scene.children[2];
        const l_modules = g_pog_json[p_pog_index].ModuleInfo;

        for (let i = 0; i < l_modules.length; i++) {
            const l_shelves = l_modules[i].ShelfInfo || [];

            for (let j = 0; j < l_shelves.length; j++) {
                const l_items = l_shelves[j].ItemInfo || [];

                for (let k = 0; k < l_items.length; k++) {
                    const l_item = l_items[k];
                    const l_mesh = l_world.getObjectById(l_item.ObjID);

                    if (l_mesh && l_mesh.material && l_item.Color) {
                        const l_baseColor = l_item.Color.replace(/#/g, "0x");
                        l_mesh.material.color.setHex(l_baseColor);
                        if (l_mesh.children && l_mesh.children.length) {
                            for (let m = 0; m < l_mesh.children.length; m++) {
                                if (l_mesh.children[m].uuid === "horiz_facing") {
                                    l_mesh.children[m].material.color.setHex(l_baseColor);
                                }
                            }
                        }
                    }
                }
            }
        }
        render(p_pog_index);
    } catch (err) {
        error_handling(err);
    }
}



// ASA-2017 issue- 5 End
function findData(p_findValues, p_searchType, p_searchIn, p_pog_index) {
    try {
        console.log("find item", p_findValues, p_searchType, p_searchIn, p_pog_index);
        logDebug("function : findData; findValues : " + p_findValues + "; searchType : " + p_searchType + "; searchIn : " + p_searchIn, "S");
        l_highlightStatus = $v("P25_POGCR_HIGHLIGHT_SEARCHED_ITEM");
       
        if (l_highlightStatus == "Y") {
            find_highlight_frame(); //ASA-2017 Clear previous border
        }  
        if (p_searchType == "P") {
            var item_list = get_similar_items(p_findValues, p_searchIn, p_pog_index);
            console.log("item_list", item_list);
            g_intersected = [];    
            
            if (item_list.length > 0) {
                for (var i = 0; i < item_list.length; i++) {
                    var selectedObj = item_list[i];
                    // ASA-2017 Start
                    // if (l_highlightStatus == "Y") {                       
                    //     var itemInfo = findItemInfoByObjID(selectedObj.id, p_pog_index);
                    //     selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(itemInfo.ObjID);
                    //     highlightProduct(
                    //         selectedObject,
                    //         4,
                    //         itemInfo.W,
                    //         itemInfo.H,
                    //         itemInfo.D,
                    //         itemInfo.Z
                    //     );
                    // }
                    //ASA-2017 Start Issue 5
                    if (l_highlightStatus == "Y") {
                        for (let pogIdx = 0; pogIdx < g_pog_json.length; pogIdx++) {
                            var itemInfo = findItemInfoByObjID(selectedObj.id, pogIdx);
                            if (!itemInfo) continue;
                            var sceneObj = g_scene_objects[pogIdx]?.scene?.children?.[2]?.getObjectById(itemInfo.ObjID);
                            if (!sceneObj) continue;
                            highlightProduct(sceneObj,4,itemInfo.W,itemInfo.H,itemInfo.D,itemInfo.Z);
                        }
                    }
                    // ASA-2017 End
                    g_intersected.push(item_list[i]);
                }
                //ASA-1606 Start
                // clearInterval(g_myVar);
                // g_select_color = 0x000000;
                // render_animate_selected();
                //ASA-1606 End
            }
        } else {
            g_intersected = [];
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules_info) {
                if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                    var shelfs = modules_info.ShelfInfo;
                    var shelfs_comp = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo;
                    $.each(shelfs, function (j, shelfs) {
                        if (shelfs.Shelf == p_findValues) {
                            var obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelfs.SObjID);
                            g_intersected.push(obj);
                            false;
                        }
                    });
                }
            });
            //ASA-1606 Start
            // clearInterval(g_myVar);
            // g_select_color = 0x000000;
            // render_animate_selected();
            //ASA-1606 End
        }

        //ASA-1606 Start
        if (g_intersected.length == 0) {
            alert(get_message("ITEM_SEARCH_NO_DATA_FOUND"));
        } else {
            clearInterval(g_myVar);
            g_select_color = 0x000000;
            render_animate_selected();
            if (l_highlightStatus == "Y") {
                render_blink_effect(); // ASA-2017
            }
            closeInlineDialog("find");
        }
        //ASA-1606 End
        logDebug("function : findData", "E");
    } catch (err) {
        error_handling(err);
    }
}





function incrementFacingsFromKey(p_facingskey, p_noOfFacings) {
    try {
        console.log("p_facingskey, p_noOfFacings", p_facingskey, p_noOfFacings);
        logDebug("function : incrementFacingsFromKey; facingskey : " + p_facingskey + "; noOfFacings : " + p_noOfFacings, "S");
        if (p_noOfFacings > 0) {
            //Task-02_25977 prasanna 20240215
            var e;
            if (typeof g_incre_item_index !== "undefined" && g_item_index == "") {
                g_item_index = g_incre_item_index;
            }
            incrementValue(e, p_facingskey, parseInt(p_noOfFacings));
        }
        logDebug("function : incrementFacingsFromKey", "E");
    } catch (err) {
        error_handling(err);
    }
}
async function recal_compare() {
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
        //ASA-1525 Issue 3 Start
        // if (g_recal_compare == "N") {
        //     g_recal_compare = "Y";
        //     $(".recal_compare").addClass("recal_compare_active");
        //     await two_pog_diff_checker(g_ComBaseIndex, g_ComViewIndex);
        //     await calculateFixelAndSupplyDays("N", g_ComViewIndex);
        // } else {
        //     g_recal_compare = "N";
        //     $(".recal_compare").removeClass("recal_compare_active");
        //     await showItemColor("OFF", g_ComViewIndex);
        // }
        $(".recal_compare").addClass("recal_compare_active");
        await two_pog_diff_checker(g_ComBaseIndex, g_ComViewIndex);
        await calculateFixelAndSupplyDays("N", g_ComViewIndex);
        //ASA-1525 Issue 3 End
    }
}

async function live_image() {
    try {
        logDebug("function : live_image", "S");
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            var old_pogIndex = g_pog_index;

            if (g_all_pog_flag == "Y") {
                var z = 0;
            } else {
                var z = g_pog_index;
            }
            if (g_show_live_image == "N") {
                g_show_live_image = "Y";
                $(".live_image").addClass("live_image_active");
            } else {
                g_show_item_color = "N";
                g_show_live_image = "N";
                $(".live_image").removeClass("live_image_active");
            }
            for (const pogJson of g_pog_json) {
                if (g_ComViewIndex > -1 || g_ComViewIndex == -1) {
                    //ASA-1170 z !== g_ComViewIndex
                    g_world = g_scene_objects[z].scene.children[2];
                    g_camera = g_scene_objects[z].scene.children[0];
                    if (g_scene_objects[z].Indicators.ItemColor == "Y" && g_compare_view !== "PREV_VERSION") {
                        //ASA-1784 issue.4 add condition
                        g_scene_objects[z].Indicators.ItemColor = "N";
                        $s("P25_SELECT_COLOR_TYPE", null);
                        $("#item_group_sub a").removeClass("item_color_active");
                        var ret = await ShowColorBackup(z);
                    }

                    if (g_scene_objects[z].Indicators.ItemDesc == "Y" && g_show_live_image == "Y") {
                        g_scene_objects[z].Indicators.ItemDesc = "N";
                        g_show_item_desc = "N";
                        $(".item_desc").removeClass("live_image_active");
                        var retval = await showHideItemDescription("N", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), z);
                    }
                    if (g_show_live_image == "Y") {
                        g_scene_objects[z].Indicators.LiveImage = "Y";
                    }
                    if (g_compare_view !== "PREV_VERSION") {
                        //ASA-1784 issue.4 add condition
                        await ShowColorBackup(z); //ASA-1416 Task 2  ,//ASA-1416 issue 1
                    }
                    var return_val = await recreate_image_items(g_show_live_image, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), z, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                    render(z);
                }
                if (g_all_pog_flag == "Y") {
                    z++;
                } else {
                    break;
                }
            }
            var color_ind = "N";
            for (const obj of g_scene_objects) {
                if (obj.Indicators.ItemColor == "Y") {
                    color_ind = "Y";
                }
            }
            if (color_ind == "N") {
                $(".item_color_legends").css("display", "none");
            }

            g_world = g_scene_objects[old_pogIndex].scene.children[2];
            g_camera = g_scene_objects[old_pogIndex].scene.children[0];
            if (g_show_live_image == "Y") {
                animate_all_pog();
            }
            set_indicator_objects(g_pog_index);
        }
        logDebug("function : live_image", "E");
    } catch (err) {
        error_handling(err);
    }
}

function save_template() {
    try {
        logDebug("function : save_template", "S");
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            $(".top_icon").removeClass("active");
            $(".left_icon").removeClass("active");
            $(".save_template").addClass("active");
            $s("P25_TEMPLATE_NAME", g_pog_json[g_pog_index].POGCode !== "" ? g_pog_json[g_pog_index].POGCode : $v("P25_POG_TEMPLATE")); //ASA-1694
            openInlineDialog("save_as_template", 20, 20);
            g_dblclick_opened = "Y";
        }
        logDebug("function : save_template", "E");
    } catch (err) {
        error_handling(err);
    }
}

function open_fixel() {
    try {
        logDebug("function : open_fixel", "S");
        if ((typeof g_pog_json !== "undefined" && g_pog_json.length > 0) || (typeof g_pog_json_comp !== "undefined" && g_pog_json_comp.length > 0)) {
            async function doSomething() {
                let result = await set_shelf_item_index(g_pog_index);
            }

            doSomething();

            POG_json = JSON.stringify([g_pog_json[g_pog_index]]);

            apex.server.process(
                "ADD_JSON_TO_COLL", {
                x01: "I",
                p_clob_01: POG_json,
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        raise_error(pData);
                    } else {
                        $(".top_icon").removeClass("active");
                        $(".left_icon").removeClass("active");
                        apex.region("fixel_details").refresh();
                        apex.region("fixel_details").widget().interactiveGrid("getCurrentView").view$.grid("setSelectedRecords", [], true);
                        openInlineDialog("open_fixel_modal", 50, 60);
                        g_dblclick_opened = "Y";
                        logDebug("function : open_fixel", "E");
                    }
                },
                loadingIndicatorPosition: "page",
            });
        }
    } catch (err) {
        error_handling(err);
    }
}

function open_fixel_label() {
    try {
        logDebug("function : open_fixel_label", "S");
        //ASA-1966  Start
        // if ($v('P25_POG_FIXEL_ID_PAD_SHELF_NO') === 'Y') { //ASA-1823 issue-3
        //      renumber();
        // }
        //ASA-1966  Start End
        var originalCanvas = g_pog_index;
        if (g_show_fixel_label == "N") {
            g_show_fixel_label = "Y";
            $(".fixel_label").addClass("fixel_label_active");
        } else {
            g_show_fixel_label = "N";
            $(".fixel_label").removeClass("fixel_label_active");
        }
        if (g_all_pog_flag == "N") {
            var i = g_pog_index;
        } else {
            var i = 0;
        }
        for (const pog of g_pog_json) {
            if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                g_renderer = g_scene_objects[i].renderer;
                g_scene = g_scene_objects[i].scene;
                g_camera = g_scene_objects[i].scene.children[0];
                show_fixel_labels(g_show_fixel_label, i);
                set_indicator_objects(i);
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

        g_prev_undo_action = "FIXEL_LABEL";
        logDebug("function : open_fixel_label", "E");
    } catch (err) {
        error_handling(err);
    }
}

function open_item_label() {
    try {
        logDebug("function : open_item_label", "S");
        if (g_all_pog_flag == "N") {
            var i = g_pog_index;
        } else {
            var i = 0;
        }
        var originalCanvas = g_pog_index;
        if (g_show_item_label == "N") {
            g_show_item_label = "Y";
            $(".item_label").addClass("item_label_active");
        } else {
            g_show_item_label = "N";
            $(".item_label").removeClass("item_label_active");
        }

        for (const pogInfo of g_pog_json) {
            if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                g_renderer = g_scene_objects[i].renderer;
                g_scene = g_scene_objects[i].scene;
                g_camera = g_scene_objects[i].scene.children[0];
                show_fixel_labels(g_show_fixel_label, i);
                show_item_labels(g_show_item_label, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), i);
                set_indicator_objects(i);
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

        g_prev_undo_action = "ITEM_LABEL";
        logDebug("function : open_item_label", "E");
    } catch (err) {
        error_handling(err);
    }
}

function open_notch_label(p_pog_index) {
    try {
        logDebug("function : open_notch_label", "S");
        var notch_exists = "N";
        var originalCanvas = g_pog_index;
        if (g_show_notch_label == "N") {
            g_show_notch_label = "Y";
            $(".notch_label").addClass("notch_label_active");
        } else {
            g_show_notch_label = "N";
            $(".notch_label").removeClass("notch_label_active");
        }
        var originalCanvas = g_pog_index;
        if (g_all_pog_flag == "N") {
            var i = g_pog_index;
        } else {
            i = 0;
        }
        for (const pogjson of g_pog_json) {
            if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                g_renderer = g_scene_objects[i].renderer;
                g_scene = g_scene_objects[i].scene;
                g_camera = g_scene_objects[i].scene.children[0];
                show_notch_labels(g_show_notch_label, $v("P25_NOTCH_HEAD"), "Y", i);
                set_indicator_objects(i);
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

        g_prev_undo_action = "NOTCH_LABEL";
        //}
        logDebug("function : open_notch_label", "E");
    } catch (err) {
        error_handling(err);
    }
}

function open_pog() {
    try {
        logDebug("function : open_pog", "S");
        $s("P25_OPEN_POG_CODE", "");
        $s("P25_DIVISION", "");
        $s("P25_EXISTING_POG_TYPE", "R");
        $s("P25_POG_STATUS", "");
        $s("P25_DRAFT_LIST", "");
        $s("P25_POG_DESCRIPTION", "");
        $s("P25_EXISTING_DRAFT_VER", "");
        $s("P25_MULTI_POG_CODE", "");
        sessionStorage.removeItem("g_color_arr");
        sessionStorage.removeItem("g_highlightArr");
        g_highlightArr = [];
        g_dblclick_opened = "Y";
        if ($(".a-Splitter-thumb").attr("aria-label") == "Collapse") {
            $(".a-Splitter-thumb").click();
        }

        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && g_pog_edited_ind == "Y") {
            //Task_29818 - Start
            // ax_message.set({
            //     labels: {
            //         ok: get_message("SHCT_YES"),
            //         cancel: get_message("SHCT_NO"),
            //         to_do_list: "to do",
            //     },
            // });

            // ax_message.set({
            //     buttonReverse: true,
            // });

            // ax_message.confirm(get_message("POGCR_CHANGE_REVERT_WARN"), function (e) {
            //     if (e) {
            //         openCustomDialog("OPEN_EXITPOG", $v("P25_EXIST_POG_URL"), "P25_EXISTPOG_TRIGGER_ELEMENT");
            //     }
            // });
            confirm(get_message("POGCR_CHANGE_REVERT_WARN"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
                openCustomDialog("OPEN_EXITPOG", $v("P25_EXIST_POG_URL"), "P25_EXISTPOG_TRIGGER_ELEMENT");
            });
            //Task_29818 - End
        } else {
            openCustomDialog("OPEN_EXITPOG", $v("P25_EXIST_POG_URL"), "P25_EXISTPOG_TRIGGER_ELEMENT");
        }
        logDebug("function : open_pog", "E");
    } catch (err) {
        error_handling(err);
    }
}

function compare_pog() {
    try {
        logDebug("function : compare_pog", "S");
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            apex.event.trigger("#P25_DRAFT_LIST", "apexrefresh");
            $x("P25_COMPARE_WITH_0").checked = true;
            apex.event.trigger("#P25_COMPARE_WITH", "apexrefresh");
            openInlineDialog("open_comp_pog", 33, 33);
        }
        logDebug("function : compare_pog", "E");
    } catch (err) {
        error_handling(err);
    }
}

function get_pog_exist_flag(p_pog_code, p_old_pog_code) {
    try {
        return new Promise(function (resolve, reject) {
            apex.server.process(
                "CHECK_EXIST_POG", {
                x01: p_pog_code,
                x02: p_old_pog_code,
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        resolve($.trim(pData));
                    } else {
                        resolve("N");
                    }
                },
                loadingIndicatorPosition: "page",
            });
        });
    } catch (err) {
        console.log("error 3", p_pog_code);
    }
}

async function sales_refresh() {
    //ASA-1160 -S
    try {
        logDebug("function : sales_refresh", "S");
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            $s("P25_SALES_INFO", "");
            var show_store = "N";

            if (g_all_pog_flag == "Y") {
                $s("P25_OPEN_POG_CODE", "");
                var z = 0;
                var detls = "";

                for (const pogJson of g_pog_json) {
                    if (typeof g_pog_json[z].SalesRrshDtl !== "undefined" && g_pog_json[z].SalesRrshDtl !== "") {
                        detls = detls + "\n" + g_pog_json[z].SalesRrshDtl;
                    }
                    // if (g_pog_json[z].NewPOG == "N" || typeof g_pog_json[z].NewPOG == "undefined") { //ASA-1360 task 1
                    if (g_pog_json[z].NewPOG == "Y" || typeof g_pog_json[z].NewPOG == "undefined") {
                        //ASA - 1475 Issue 1
                        show_store = "Y";
                    }
                    z++;
                }
                $s("P25_SALES_INFO", detls);
            } else {
                if (typeof g_pog_json[g_pog_index].SalesRrshDtl !== "undefined" && g_pog_json[g_pog_index].SalesRrshDtl !== "") {
                    $s("P25_SALES_INFO", g_pog_json[g_pog_index].SalesRrshDtl);
                }
                // if (g_pog_json[g_pog_index].NewPOG == "N" || typeof g_pog_json[g_pog_index].NewPOG == "undefined") { //ASA-1360 task 1
                if ((g_pog_json[g_pog_index].NewPOG == "Y" || typeof g_pog_json[g_pog_index].NewPOG == "undefined") || $v("P25_POGCR_REFRESH_SALES_WTCCN") == 'Y') { //ASA-1923 Issue 2
                    //ASA - 1475 Issue 1
                    show_store = "Y";
                }
            }
            //ASA-1360 task 1 Start
            if (show_store == "N") {
                $s("P25_STORE", "");
                $s("P25_SALES_POG_CODE", "");
                $("#P25_STORE_CONTAINER").css("display", "none");
                $("#P25_SALES_POG_CODE_CONTAINER").css("display", "none");
                $s("P25_MULTIPLE_STORE", ""); //ASA-1923 Issue 7
                $("#P25_STORE_MULTIPLE_CONTAINER").css("display", "none"); //ASA-1923 Issue 7
                if ($v("P25_POGCR_SALES_REFRESH_HIDE_STORE") == "Y" && $v("P25_SHOW_HIDE_WEEK_SELECTION") == "Y") {
                    $s("P25_WEEK_SELECTION", "");
                    $("#P25_WEEK_SELECTION_CONTAINER").css("display", "none");
                }
            } else {
                if ($v("P25_POGCR_SALES_REFRESH_HIDE_STORE") == "N") {
                    $("#P25_STORE_CONTAINER").css("display", "block");
                    $("#P25_STORE_MULTIPLE_CONTAINER").css("display", "block"); //ASA-1923 Issue 7
                    $("#P25_SALES_POG_CODE_CONTAINER").css("display", "none");

                    //ASA-1991 S
                    apex.server.process(
                        "GET_POG_LIVE_STORE",
                        {
                            x01: g_pog_json[g_pog_index].POGCode,
                            x02: g_pog_json[g_pog_index].Version
                        },
                        {
                            dataType: "text",
                            success: function (pData) {
                                if ($.trim(pData) != "") {
                                    $s("P25_MULTIPLE_STORE", $.trim(pData));
                                } else {
                                    $s("P25_MULTIPLE_STORE", ''); //ASA-1991 Issue 3
                                }
                            },
                        }
                    );
                    //ASA-1991 E
                } else {
                    if ($v("P25_SHOW_HIDE_WEEK_SELECTION") == "Y") { //ASA-1991
                        $s("P25_WEEK_SELECTION", "");
                        $("#P25_WEEK_SELECTION_CONTAINER").css("display", "none");
                    }
                    $("#P25_SALES_POG_CODE_CONTAINER").css("display", "block");
                    $("#P25_STORE_CONTAINER").css("display", "none");
                    $("#P25_STORE_MULTIPLE_CONTAINER").css("display", "none"); //ASA-1923 Issue 7
                }
            }
            //ASA-1360 task 1 End
            openInlineDialog("open_refresh_sales", 33, 33);
            // apex.item("P25_WEEK_SELECTION").setFocus();  //ASA-1991
        }
        logDebug("function : sales_refresh", "E");
    } catch (err) {
        error_handling(err);
    }
} //ASA-1170 -E

function prev_ver(p_prev_ver) {
    //ASA-1803 Issue 1
    try {
        logDebug("function : prev_ver", "S");
        //ASA-1803 Issue 1 added variables
        var title;
        var dialog$ = $("#open_prev_ver");
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && $v("P25_OPEN_POG_CODE") !== "") {
            if (p_prev_ver == "DIFF") {
                //ASA-1803 Issue 1
                $s("P25_PREV_POG_CODE", "");
                $s("P25_PREV_POG_VERSION", "");
                $("#P25_PREV_POG_CODE_CONTAINER").hide();
                $("#P25_PREV_POG_VERSION_CONTAINER").hide();
                $("#COMP_PREV_POG").hide();
                $("#P25_SEL_PREV_POG_CODE_CONTAINER").show();
                $("#P25_SEL_POG_VERSION_CONTAINER").show();
                $("#COMPARE_POG").show();
                $s("P25_SEL_PREV_POG_CODE", g_pog_json[g_pog_index].POGCode);
                apex.event.trigger("#P25_SEL_POG_VERSION", "apexrefresh");
                title = get_message("COMPARE_POG_TT"); //ASA-1803 Issue 1
            } else {
                $s("P25_SEL_PREV_POG_CODE", "");
                $s("P25_SEL_POG_VERSION", "");
                $("#P25_SEL_PREV_POG_CODE_CONTAINER").hide();
                $("#P25_SEL_POG_VERSION_CONTAINER").hide();
                $("#COMPARE_POG").hide();
                $("#P25_PREV_POG_CODE_CONTAINER").show();
                $("#P25_PREV_POG_VERSION_CONTAINER").show();
                $("#COMP_PREV_POG").show();
                $s("P25_PREV_POG_CODE", g_pog_json[g_pog_index].POGCode);
                apex.event.trigger("#P25_PREV_POG_VERSION", "apexrefresh");
                title = get_message("POGCR_PREVIOUS_VERSION_TT"); //ASA-1803 Issue 1
            }
            dialog$.dialog("option", "title", title); //ASA-1803 Issue 1
            apex.event.trigger("#P25_DRAFT_LIST", "apexrefresh");
            $x("P25_COMPARE_WITH_0").checked = true;
            apex.event.trigger("#P25_COMPARE_WITH", "apexrefresh");
            openInlineDialog("open_prev_ver", 33, 33);
        }
        logDebug("function : prev_ver", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function open_renumbering() {
    try {
        logDebug("function : open_renumbering", "S");
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            g_dblclick_opened = "Y";
            if (g_renum_json.length > 0) {
                $s("P25_LOC_FIXT", g_renum_json[0].Id);
                $s("P25_DIRECTION", g_renum_json[0].NumberingDirection);
                $s("P25_ORDER_TYPE", g_renum_json[0].OrderType);
                $s("P25_START_ONE_FIXEL", g_renum_json[0].StartForfixel);
                $s("P25_MODULE_DIR", g_renum_json[0].OrderDirection);
                $s("P25_START_ONE_MOD_LOC", g_renum_json[0].StartForOrder);
                $s("P25_START_ONE_MOD", g_renum_json[0].StartForOrderFixel);
                $s("P25_INCLUDE_MOD_NAME", g_renum_json[0].IncludeModuledetails);
                $s("P25_SEPARATOR", g_renum_json[0].Seprator);
                if (g_renum_json[0].Id == "L") {
                    $s("P25_LEADING_TEXT", "");
                    $s("P25_TRAILING_TEXT", "");
                } else {
                    $s("P25_LEADING_TEXT", g_renum_json[0].LeadingText);
                    $s("P25_TRAILING_TEXT", g_renum_json[0].TrailingText);
                }
                console.log("detailsrenum", g_renum_json[0].Id, g_renum_json[0].NumberingDirection);
            } else {
                $s("P25_LOC_FIXT", "L");
                $s("P25_START_ONE_FIXEL", $v("P25_POGCR_DEFAULT_START_FIXEL"));
                $s("P25_DIRECTION", $v("P25_POGCR_DEFAULT_DIRECTION"));
                if ($v("P25_UNQ_POG_MODULE_ITEM_LOC") == "Y" && $v("P25_POGCR_DEFAULT_START_FIXEL") !== "1") {
                    $s("P25_ORDER_TYPE", "2");
                    $s("P25_START_ONE_MOD_LOC", "2");
                } else {
                    $s("P25_ORDER_TYPE", "1");
                    $s("P25_START_ONE_MOD_LOC", "1");
                }
                if ($v("P25_LOC_FIXT") == "L") {
                    $s("P25_LEADING_TEXT", " ");
                    $s("P25_TRAILING_TEXT", " ");
                    $s("P25_START_ONE_MOD", " ");
                    $s("P25_POGCR_DEFAULT_START_FIXEL", $v("P25_START_ONE_FIXEL"));
                    $s("P25_POGCR_DEFAULT_DIRECTION", $v("P25_DIRECTION"));
                    if ($v("P25_UNQ_POG_MODULE_ITEM_LOC") == "Y" && $v("P25_POGCR_DEFAULT_START_FIXEL") !== "1") {
                        $s("P25_ORDER_TYPE", "2");
                        $s("P25_START_ONE_MOD_LOC", "2");
                    } else {
                        $s("P25_ORDER_TYPE", "1");
                        $s("P25_START_ONE_MOD_LOC", "1");
                    }
                } else {
                    $s("P25_START_ONE_FIXEL", "");
                    $s("P25_START_ONE_MOD", "");
                    $s("P25_ORDER_TYPE", "2");
                    $s("P25_IGNORE", "T:D");
                    $s("P25_DIRECTION", "LRTB");
                }
            }
            openInlineDialog("renumbering", 55, 75);
            (g_l_module_dir = $v("P25_MODULE_DIR")),
                (g_l_direction = $v("P25_DIRECTION")),
                (g_l_ignore = $v("P25_IGNORE")),
                (g_l_order_type = $v("P25_ORDER_TYPE")),
                (g_l_start_one_mod = $v("P25_START_ONE_MOD")),
                (g_l_include_mod_name = $v("P25_INCLUDE_MOD_NAME")),
                (g_l_separator = $v("P25_SEPARATOR")),
                (g_l_leading_text = $v("P25_LEADING_TEXT")),
                (g_l_trailing_text = $v("P25_TRAILING_TEXT")),
                (g_l_start_one_fixel = $v("P25_START_ONE_FIXEL"));
        }
        logDebug("function : open_renumbering", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function renumber() {
    try {
        logDebug("function : renumber", "S");
        //identify if any change in POG
        g_pog_edited_ind = "Y";
        if (g_all_pog_flag == "Y") {
            var z = 0;
        } else {
            var z = g_pog_index;
        }
        for (const pogJson of g_pog_json) {
            if ((z !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                var module_details = g_pog_json[z].ModuleInfo;
                var i = 0;
                var max_shelf = 0;
                var mod_cnt = 0;
                for (const modules of module_details) {
                    mod_cnt = mod_cnt + 1;
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        if ($v("P25_START_ONE_MOD") == 2) {
                            max_shelf = 1;
                        }
                        if (modules.ShelfInfo.length > 0) {
                            $.each(modules.ShelfInfo, function (k, shelfs) {
                                if (typeof shelfs !== "undefined") {
                                    if (shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "BASE") {
                                        if (($v("P25_IGNORE") == "T:D" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") || ($v("P25_IGNORE") == "T" && shelfs.ObjType !== "TEXTBOX") || ($v("P25_IGNORE") == "D" && shelfs.ObjType !== "DIVIDER") || $v("P25_IGNORE") == "") {
                                            max_shelf = max_shelf + 1;
                                        }
                                    }
                                }
                            });
                        }
                    }
                    i = i + 1;
                }
                var shelf_id = "";
                items_arr = [];
                if ($v("P25_LEADING_TEXT") !== "") {
                    var leading_text = $v("P25_LEADING_TEXT") + " ";
                } else {
                    var leading_text = "";
                }
                if ($v("P25_TRAILING_TEXT") !== "") {
                    var trailing_text = " " + $v("P25_TRAILING_TEXT");
                } else {
                    var trailing_text = "";
                }
                if ($v("P25_INCLUDE_MOD_NAME") == 3) {
                    shelf_id = leading_text + max_shelf + $v("P25_SEPARATOR") + mod_cnt + trailing_text;
                } else {
                    shelf_id = leading_text + max_shelf + trailing_text;
                }
                if (shelf_id.length > 15) {
                    alert(get_message("FIXEL_ID_LEN_ERR"));
                } else {
                    if ($v("P25_LOC_FIXT") == "L") {
                        await location_numbering($v("P25_MODULE_DIR"), $v("P25_DIRECTION"), $v("P25_ORDER_TYPE"), $v("P25_START_ONE_FIXEL"), $v("P25_START_ONE_MOD_LOC"), z, $v("P25_PALLET_DIRECTION"));
                    } else {
                        await fixture_numbering($v("P25_MODULE_DIR"), $v("P25_DIRECTION"), $v("P25_IGNORE"), $v("P25_ORDER_TYPE"), $v("P25_START_ONE_MOD"), $v("P25_INCLUDE_MOD_NAME"), $v("P25_SEPARATOR"), $v("P25_LEADING_TEXT"), $v("P25_TRAILING_TEXT"), z);
                    }
                }
            }
            if (g_all_pog_flag == "Y") {
                z++;
            } else {
                break;
            }
        }
        logDebug("function : renumber", "E");
    } catch (err) {
        error_handling(err);
    }
}

function updateHighlightArr(pConditionName, pCheck = "N") {
    try {
        logDebug("function : updateHighlightArr", "S");
        apex.server.process(
            "GET_HIGHLIGHT_DETAILS", {
            x01: pConditionName,
        }, {
            dataType: "json",
            success: function (pData) {
                var return_data = $.trim(pData).split(",");
                if (return_data[0] == "ERROR") {
                    raise_error(pData);
                } else {
                    g_highlightArr = g_highlightArr.filter((item) => item["CONDITION_NAME"] !== pConditionName);
                    const obj = {
                        CONDITION_NAME: pConditionName,
                        BACKGROUND_COLOR: pData.color,
                        FORMULA: pData.formula,
                        PRIORITY: pData.priority,
                        CHECK: pCheck,
                    };
                    g_highlightArr.push(obj);
                }
            },
        });
        logDebug("function : updateHighlightArr", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function clearHighlight(p_pog_index) {
    if (g_all_pog_flag == "Y") {
        var z = 0;
    } else {
        var z = g_pog_index;
    }
    var originalCanvas = g_pog_index;
    for (const pogjson of g_pog_json) {
        if ((z !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
            g_renderer = g_scene_objects[z].renderer;
            g_scene = g_scene_objects[z].scene;
            g_camera = g_scene_objects[z].scene.children[0];

            var res = await ShowColorBackup(z);
            render(z);
        }
        if (g_all_pog_flag == "Y") {
            z++;
        } else {
            break;
        }
    }
    g_renderer = g_scene_objects[originalCanvas].renderer;
    g_scene = g_scene_objects[originalCanvas].scene;
    g_camera = g_scene_objects[originalCanvas].scene.children[0];
    g_world = g_scene_objects[originalCanvas].scene.children[2];
}

//ASA-1644
function setHighlightColorInItem(pPogIndex, pItem) {
    try {
        var ItemSales = get_sales_info(pPogIndex, pItem.ItemID);
        var l_color = "#FFFFFF";
        for (const condition of g_highlightArr) {
            var new_condition = condition.FORMULA;
            var fields = new_condition.match(/\$\$(.*?)\$\$/g).map((match) => match.slice(2, -2));
            for (fieldName of fields) {
                var jsonValue = "";
                if (fieldName == "COS") {
                    jsonValue = eval("((pItem.BHoriz * pItem.BVert * pItem.BaseD * parseInt(pItem.MerchStyle == 1 ? pItem.UnitperTray : pItem.MerchStyle == 2 ? pItem.UnitperCase : 1))  + pItem.CapFacing * pItem.CapDepth * pItem.CapHorz * parseInt(pItem.CapMerch == 1 ? pItem.UnitperTray : 1) ) / parseInt(pItem.SizeDesc.split('*')[1])"); //ASA-1605 //ASA-1871 adding condition for case
                    if (isNaN(jsonValue) || !isFinite(jsonValue)) {
                        jsonValue = 0;
                    } else if (jsonValue === null || jsonValue === "") {
                        jsonValue = "''";
                    }
                } else if (fieldName == "SalesUnit") {
                    jsonValue = eval("parseFloat(ItemSales.SalesUnitPerWeek)");
                    if (isNaN(jsonValue) || !isFinite(jsonValue)) {
                        jsonValue = 0;
                    } else if (jsonValue === null || jsonValue === "") {
                        jsonValue = "''";
                    }
                } else if (fieldName == "TotalShrinkageAmtPer") {
                    jsonValue = eval("parseFloat((((ItemSales.ShrinkageAmt + ItemSales.NonShrinkageAmt) / ItemSales.SalesAmt) * 100).toFixed(1))");
                    if (isNaN(jsonValue) || !isFinite(jsonValue)) {
                        jsonValue = 0;
                    } else if (jsonValue === null || jsonValue === "") {
                        jsonValue = "''";
                    }
                } else if (fieldName == "SalesPerWeek") {
                    jsonValue = eval("parseFloat(ItemSales.SalesPerWeek.toFixed(1))");
                    if (isNaN(jsonValue) || !isFinite(jsonValue)) {
                        jsonValue = 0;
                    } else if (jsonValue === null || jsonValue === "") {
                        jsonValue = "''";
                    }
                } else if (fieldName == "DOS") {
                    jsonValue = eval("parseFloat(pItem.BHoriz * pItem.BVert * pItem.BaseD * parseInt(pItem.MerchStyle == 1 ? pItem.UnitperTray : pItem.MerchStyle == 2 ? pItem.UnitperCase : 1)) / (ItemSales.SalesUnitPerWeek / 7)"); //ASA-1605
                    if (isNaN(jsonValue) || !isFinite(jsonValue)) {
                        jsonValue = 0;
                    } else if (jsonValue === null || jsonValue === "") {
                        jsonValue = "''";
                    }
                } else if (fieldName == "DFacing") {
                    jsonValue = eval("pItem.BaseD");
                } else {
                    jsonValue = eval("pItem." + fieldName);
                }

                if (fieldName == "Brand_Category" || fieldName == "ItemStatus" || fieldName == "Gobecobrand" || fieldName == "Internet") {
                    if (jsonValue !== null) {
                        jsonValue = "'" + jsonValue + "'";
                    } else {
                        jsonValue = "''";
                    }
                } else {
                    if (isNaN(jsonValue) || !isFinite(jsonValue)) {
                        jsonValue = 0;
                    } else if (jsonValue === null || jsonValue === "") {
                        jsonValue = "''";
                    }
                }
                var regex = new RegExp("\\b" + fieldName + "\\b", "g");
                new_condition = new_condition.replaceAll(regex, jsonValue);
            }
            new_condition = new_condition.replaceAll("$$", "");
            var selectedObject = g_scene_objects[pPogIndex].scene.children[2].getObjectById(pItem.ObjID);
            if (eval(new_condition)) {
                l_color = condition.BACKGROUND_COLOR;
                var fillColor = parseInt(l_color.replace("#", "0x"), 16);
                selectedObject.material.color.setHex(fillColor);
                pItem.Color = l_color;
                return l_color;
            } else {
                l_color = "#FFFFFF";
                var fillColor = parseInt(l_color.replace("#", "0x"), 16);
                selectedObject.material.color.setHex(fillColor);
                pItem.Color = l_color;
            }
        }
        return l_color;
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1644
async function highlightProducts(p_pog_index) {
    try {
        logDebug("function : highlightProducts", "S");
        if (g_highlightArr.length > 0) {
            var sortByPriority = {
                PRIORITY: "asc",
            };
            g_highlightArr.keySort(sortByPriority);
            var live_image = g_show_live_image;
            if (g_all_pog_flag == "Y") {
                var z = 0;
            } else {
                var z = p_pog_index;
            }
            var originalCanvas = p_pog_index;
            for (const pogjson of g_pog_json) {
                if ((z !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                    g_renderer = g_scene_objects[z].renderer;
                    g_scene = g_scene_objects[z].scene;
                    g_camera = g_scene_objects[z].scene.children[0];
                    g_world = g_scene_objects[z].scene.children[2];
                    if (live_image == "Y") {
                        $(".live_image").removeClass("live_image_active");
                        g_show_live_image = "N";
                        g_scene_objects[g_pog_index].Indicators.LiveImage = "N"; //ASA-1416 Task 2
                        var return_val = await recreate_image_items("N", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), z, "N", "", g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                    }
                    var res = await ShowColorBackup(z);
                    var m = 0;
                    for (modules of g_pog_json[z].ModuleInfo) {
                        if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                            if (modules.ShelfInfo.length > 0) {
                                var s = 0;
                                for (shelfs of modules.ShelfInfo) {
                                    if (shelfs.ItemInfo.length > 0) {
                                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                                            var k = 0;
                                            for (const items of shelfs.ItemInfo) {
                                                if (items.Item !== "DIVIDER") {
                                                    var finalColor = setHighlightColorInItem(z, items);
                                                    // g_pog_json[z].ModuleInfo[m].ShelfInfo[s].ItemInfo[k].Color = finalColor;
                                                }
                                                k++;
                                            }
                                        }
                                    }
                                    s++;
                                }
                            }
                            if (modules.Carpark !== "undefined" && modules.Carpark.length > 0) {
                                var c = 0;
                                for (items of modules.Carpark[0].ItemInfo) {
                                    var finalColor = setHighlightColorInItem(z, items);
                                    // g_pog_json[z].ModuleInfo[m].Carpark[0].ItemInfo[c].Color = finalColor;
                                    c++;
                                }
                            }
                        }
                        m++;
                    }
                    render(z);
                }
                if (g_all_pog_flag == "Y") {
                    z++;
                } else {
                    break;
                }
            }
            g_renderer = g_scene_objects[originalCanvas].renderer;
            g_scene = g_scene_objects[originalCanvas].scene;
            g_camera = g_scene_objects[originalCanvas].scene.children[0];
            g_world = g_scene_objects[originalCanvas].scene.children[2];
        }
        closeInlineDialog("condition_highlight");
        logDebug("function : highlightProducts", "E");
    } catch (err) {
        error_handling(err);
    }
}

function open_pog_report(p_reportName) {
    try {
        logDebug("function : open_pog_report; reportName : " + p_reportName, "S");
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            if ($v("P25_OPEN_DRAFT") !== "") {
                download_pog_report(p_reportName, g_pog_index, g_all_pog_flag);
            }
        }
        logDebug("function : open_pog_report", "E");
    } catch (err) {
        error_handling(err);
    }
}

function selectRowsBetweenIndexes(p_indexes) {
    try {
        logDebug("function : open_pog_report", "S");
        p_indexes.sort(function (a, b) {
            return a - b;
        });

        for (var i = p_indexes[0]; i <= p_indexes[1]; i++) {
            g_trs[i + 2].className = "droppableItem ui-draggable ui-draggable-handle selected";
        }
        logDebug("function : open_pog_report", "E");
        return "yes";
    } catch (err) {
        error_handling(err);
    }
}

function create_action(p_a, p_b) {
    try {
        logDebug("function : create_action", "S");
        if (apex.region("draggable_table") !== null && g_product_list_drag == "Y") {
            set_curr_canvas(p_b);
            var r = g_canvas.getBoundingClientRect();
            g_productselect = "N";

            if ($v("P25_MODULE_DISP") == "") {
                g_module_index = 0;
            }
            if (g_dblclick_opened == "N") {
                if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
                    if (typeof g_pog_json[g_pog_index].ModuleInfo !== "undefined") {
                        if (g_pog_json[g_pog_index].ModuleInfo.length > 0) {
                            create_item_list(p_a, p_b.clientX - r.left, p_b.clientY - r.top, g_camera, g_canvas, g_pog_index);
                        }
                    }
                }
            }
        }
        logDebug("function : create_action", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function onload_create_pog() {
    logDebug("function : onload_create_pog; ", "S");
    sessionStorage.setItem("P25_EXISTING_DRAFT_VER", sessionStorage.getItem("P25_EXISTING_DRAFT_VER"));
    sessionStorage.setItem("P25_DRAFT_LIST", sessionStorage.getItem("P25_DRAFT_LIST"));
    sessionStorage.setItem("P25_POG_DESCRIPTION", sessionStorage.getItem("P25_POG_DESCRIPTION"));
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
                if ($v("P25_ERROR_FLAG") == "Y") {
                    raise_error("&IMP_FAILURE_ERROR_MSG.");
                    //identify if any change in POG
                    pog_edited_ind = "Y";
                    var returnval = await save_pog_to_json(g_pog_json);
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
                    $s("P25_ERROR_FLAG", "");
                } else if ($v("P25_UPLD_ID") !== "") {
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
                                    appendMultiCanvasRowCol(g_pog_json.length, $v("P25_POGCR_TILE_VIEW"));
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
                                        var return_val = await create_module_from_json(POG_JSON, "T", "F", $v("P25_PRODUCT_BTN_CLICK"), "N", "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
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
                                    $s("P25_UPLD_ID", "");
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
                    if (sessionStorage.getItem("POGExists") == "Y" && $v("P25_NEW_SESSION") == "N") {
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
                /*if ($v("P25_ITEM_REGMOV_ERR") == "N") {
                await saveImportItems();
                }*/
                if (g_show_live_image == "Y") {
                    animate_all_pog();
                }
            }
            doSomething();
            g_dblclick_opened = "N";
        } else {
            if ($v("P25_OPEN_NEW_TAB") == "Y") {
                raise_error($v("P25_NEW_TAB_POG_CODE") + " - POG Details Not Found");
            }
        }
        logDebug("function : onload_create_pog; ", "E");
    });
}

async function create_all_pog_onload(p_pog_json) {
    g_pog_index = 0;
    g_multi_pog_json = [];
    // addLoadingIndicator(); //ASA-1500
    g_canvas_objects = [];
    if (p_pog_json.length > 1) {
        $("#pog_list_btn").css("display", "block");
        $("#chng_view_btn").css("display", "block");
        $(".add_pog").css("display", "block");
        $(".open_par").css("display", "block"); //ASA-1587
    }
    g_multi_pog_json = [];
    appendMultiCanvasRowCol(p_pog_json.length, $v("P25_POGCR_TILE_VIEW"));
    switchCanvasView($v("P25_POGCR_TILE_VIEW"), "Y"); // Task-22510

    for (var p = 0; p <= p_pog_json.length - 1; p++) {
        g_pog_index = p;
        init(p);
        objects = {};
        objects["scene"] = g_scene;
        objects["renderer"] = g_renderer;
        g_json = [p_pog_json[p]]; //vivek
        g_scene_objects.push(objects);
        set_indicator_objects(p);
        var return_val = await create_module_from_json(p_pog_json, sessionStorage.getItem("new_pog_ind"), "F", $v("P25_PRODUCT_BTN_CLICK"), sessionStorage.getItem("pog_opened"), "N", "N", "Y", "Y", "", "N", g_scene_objects[p].scene.children[0], g_scene_objects[p].scene, g_pog_index, p);
        var canvas_id = g_canvas_objects[p].getAttribute("id");
        $("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + g_pog_json[p].POGCode + "</span>"); //HOTFIX
    }
    var retval = await render_all_pog();
    setPogActive(g_pog_index);
    // removeLoadingIndicator(regionloadWait);//ASA-1500
    g_pog_json = g_multi_pog_json;
}

async function update_json_object_id(p_pog_index, p_temp_id_arr, p_scene_objects, p_pog_json) {
    console.log("update json", p_pog_index, p_temp_id_arr, p_scene_objects);
    if (typeof p_pog_json !== "undefined" && p_pog_json.length > 0) {
        if (typeof p_pog_json[p_pog_index] !== "undefined") {
            for (const obj of p_scene_objects[p_pog_index].scene.children[2].children) {
                var l_wireframe_id = add_wireframe(obj, 2);
                obj.WFrameID = l_wireframe_id;
            }
            if (typeof p_pog_json[p_pog_index].BaseObjID !== "undefined") {
                var i = 0,
                    index = -1;
                for (const obj of p_temp_id_arr[p_pog_index]) {
                    if (p_pog_json[p_pog_index].BaseObjID == obj) {
                        index = i;
                        break;
                    }
                    i++;
                }
                p_pog_json[p_pog_index].BaseObjID = p_scene_objects[p_pog_index].scene.children[2].children[index].id;
            }

            var module_details = p_pog_json[p_pog_index].ModuleInfo;
            var j = 0;
            for (const modules of module_details) {
                if (modules.ParentModule == null || modules.ParentModule == "undefined") {
                    if (typeof modules.MObjID !== "undefined") {
                        var i = 0,
                            index = -1;
                        for (const obj of p_temp_id_arr[p_pog_index]) {
                            if (modules.MObjID == obj) {
                                index = i;
                                break;
                            }
                            i++;
                        }
                        modules.MObjID = p_scene_objects[p_pog_index].scene.children[2].children[index].id;
                        p_scene_objects[p_pog_index].scene.children[2].children[index].Module = modules.Module;
                    }

                    var k = 0;
                    for (const shelfs of modules.ShelfInfo) {
                        if (typeof shelfs !== "undefined") {
                            if (shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "BASE") {
                                if (typeof shelfs.SObjID !== "undefined") {
                                    var i = 0,
                                        index = -1;
                                    for (const obj of p_temp_id_arr[p_pog_index]) {
                                        if (shelfs.SObjID == obj) {
                                            index = i;
                                            break;
                                        }
                                        i++;
                                    }
                                    shelfs.SObjID = p_scene_objects[p_pog_index].scene.children[2].children[index].id;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].FixelID = shelfs.Shelf;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].Module = modules.Module;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].W = shelfs.W;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].H = shelfs.H;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].D = shelfs.D;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].Color = shelfs.Color;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].Rotation = shelfs.Rotation;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].ItemSlope = shelfs.Slope;
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].Rotation = shelfs.Rotation !== 0 || shelfs.Slope !== 0 ? "Y" : "N";
                                    p_scene_objects[p_pog_index].scene.children[2].children[index].ImageExists = "N";
                                    if (shelfs.ObjType == "SHELF") {
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].AvlSpace = wpdSetFixed(nvl(shelfs.AvlSpace)); //.toFixed(3));
                                    }
                                }

                                p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].SIndex = k;
                                p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].MIndex = j;
                            }
                            if (shelfs.ItemInfo.length > 0) {
                                var l = 0;
                                for (const items of shelfs.ItemInfo) {
                                    if (typeof items.ObjID !== "undefined") {
                                        var i = 0,
                                            index = -1;
                                        for (const obj of p_temp_id_arr[p_pog_index]) {
                                            if (items.ObjID == obj) {
                                                index = i;
                                                break;
                                            }
                                            i++;
                                        }
                                        items.ObjID = p_scene_objects[p_pog_index].scene.children[2].children[index].id;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemID = items.Item;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Description = items.Desc;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].HorizFacing = items.BHoriz;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].VertFacing = items.BVert;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].DFacing = items.BaseD;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].DimUpdate = items.DimUpdate;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].SellingPrice = items.SellingPrice;
                                        //ASA-2013 Start
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ShelfPrice = items.ShelfPrice;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].PromoPrice = items.PromoPrice;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].DiscountRate = items.DiscountRate;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].PriceChangeDate = items.PriceChangeDate;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].WeeksOfInventory = items.WeeksOfInventory;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Qty = items.Qty;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].WhStock = items.WhStock;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].StoreStock = items.StoreStock;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].StockIntransit = items.StockIntransit;
                                        //ASA-2013 End
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].SalesUnit = items.SalesUnit;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].NetSales = items.NetSales;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].CogsAdj = items.CogsAdj;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].GrossProfit = items.GrossProfit;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].WeeksCount = items.WeeksCount;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].MovingItem = items.MovingItem;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].RegMovement = items.RegMovement;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].AvgSales = items.AvgSales;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemStatus = items.ItemStatus;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].CDTLvl1 = items.CDTLvl1; //ASA-1130
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].CDTLvl2 = items.CDTLvl2; //ASA-1130
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].CDTLvl3 = items.CDTLvl3; //ASA-1130
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].StoreCnt = items.StoreCnt;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].WeeksOfInventory = items.WeeksOfInventory;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Profit = items.Profit;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].TotalMargin = items.TotalMargin;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].W = items.W;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].H = items.H;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].D = items.D;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Color = items.Color;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Barcode = items.Barcode;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Desc = items.Desc;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Brand = items.Brand;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Group = items.Group;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Dept = items.Dept;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Class = items.Class;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].SubClass = items.SubClass;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].StdUOM = items.StdUOM;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].SizeDesc = items.SizeDesc;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Supplier = items.Supplier;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].LocID = items.LocID;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Supplier = items.Supplier;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemDim = (items.OW * 100).toFixed(2) + " : " + (items.OH * 100).toFixed(2) + " : " + (items.OD * 100).toFixed(2);
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].OrientationDesc = items.OrientationDesc;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].StoreCnt = items.StoreCnt;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].RotationDegree = items.Rotation;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].OW = items.OW;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].OH = items.OH;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].OD = items.OD;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].DescSecond = items.DescSecond;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Shelf = shelfs.Shelf;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Rotation = 0;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemSlope = 0;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Rotation = items.Rotation !== 0 || items.Slope !== 0 ? "Y" : "N";
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ImageExists = "N";
                                        //ASA-1640 Start
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemCondition = items.ItemCondition;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].AUR = items.AUR;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemRanking = items.ItemRanking;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].WeeklySales = items.WeeklySales;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].WeeklyNetMargin = items.WeeklyNetMargin;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].WeeklyQty = items.WeeklyQty;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].NetMarginPercent = items.NetMarginPercent;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].CumulativeNM = items.CumulativeNM;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].TOP80B2 = items.TOP80B2;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemBrandC = items.ItemBrandC;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemPOGDept = items.ItemPOGDept;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].ItemRemark = items.ItemRemark;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].RTVStatus = items.RTVStatus;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Pusher = items.Pusher;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].Divider = items.Divider;
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].BackSupport = items.BackSupport;
                                        //ASA-1640 End
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].CWPerc = items.CWPerc; //ASA-1640 #5
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].CHPerc = items.CHPerc; //ASA-1640 #5
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].CDPerc = items.CDPerc; //ASA-1640 #5
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].OOSPerc = items.OOSPerc; //ASA-1688 Added for oos%
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].InitialItemDesc = items.InitialItemDesc; //ASA-1734 Issue 1
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].InitialBrand = items.InitialBrand; //ASA-1787 Request #6
                                        p_scene_objects[p_pog_index].scene.children[2].children[index].InitialBarcode = items.InitialBarcode; //ASA-1787 Request #6
                                    }

                                    p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].MIndex = j;
                                    p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].SIndex = k;
                                    p_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].IIndex = l;
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
    }
}

function create_pdf_func() {
    try {
        logDebug("function : create_pdf_func", "S");
        addLoadingIndicator();
        var p_pog_details = {
            SeqNo: "",
            POGCode: g_pog_json[g_pog_index].POGCode,
            POGVersion: p_pogInfoArr[0].Version,
            POGModule: "",
            Selection_Type: workflow_draft == "Y" ? "D" : "E",
            Print_Type: "P",
            SequenceId: p_pogInfoArr[0].seqId,
            TemplateId: $v("P25_PDF_TEMPLATE").split("-")[0],
            TemplateDetails: $v("P25_PDF_TEMPLATE"),
        };

        //ASA-1870 passed values from $v("P25_POGCR_ENHANCE_PDF_IMG") to $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE") to set_scene
        create_pdf(p_pog_details, "N", "N", g_camera, "E", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_NOTCH_HEAD"), "Y", g_pog_index, "Y", g_all_pog_flag, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), "", "", g_hide_show_dos_label, '',
            $v("P25_POGCR_ENHANCE_PDF_IMG"), $v("P25_POGCR_PDF_IMG_ENHANCE_RATIO"), $v("P25_POGCR_PDF_CANVAS_SIZE"), $v("P25_VDATE"), $v("P25_POG_POG_DEFAULT_COLOR"), $v("P25_POG_MODULE_DEFAULT_COLOR"), $v("P25_POGCR_DFT_SPREAD_PRODUCT"), $v("P25_PEGB_DFT_HORIZ_SPACING"), $v("P25_PEGBOARD_DFT_VERT_SPACING"), $v("P25_BASKET_DFT_WALL_THICKNESS"), $v("P25_CHEST_DFT_WALL_THICKNESS"), $v("P25_POGCR_PEGB_MAX_ARRANGE"), $v("P25_POGCR_DEFAULT_WRAP_TEXT"), $v("P25_POGCR_TEXT_DEFAULT_SIZE"), $v("P25_POG_TEXTBOX_DEFAULT_COLOR"), $v("P25_POG_SHELF_DEFAULT_COLOR"), $v("P25_DIV_COLOR"), $v("P25_SLOT_DIVIDER"), $v("P25_SLOT_ORIENTATION"), $v("P25_DIVIDER_FIXED"), $v("P25_POG_ITEM_DEFAULT_COLOR"), $v("P25_POGCR_DFT_BASKET_FILL"), $v("P25_POGCR_DFT_BASKET_SPREAD"), $v("P25_POGCR_BAY_LIVE_IMAGE"), $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE"), "N"); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
        logDebug("function : create_pdf_func", "E");
    } catch (err) {
        error_handling(err);
    }
}

function update_selected(p_pog_code, p_action) {
    try {
        logDebug("function : update_selected; p_pog_code : " + p_pog_code + "; action : " + p_action, "S");
        apex.server.process(
            "UPDATE_EXIST_POG_COLL", {
            f01: p_pog_code,
            x01: p_action,
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) !== "") {
                    var details = $.trim(pData).split("-");
                    if (details[0] == "error") {
                        alert(details[1]);
                    }
                } else {
                    logDebug("function : update_selected", "E");
                }
            },
        });
    } catch (err) {
        error_handling(err);
    }
}

function ig_checking(p_checked, p_paramClass, p_calledFrom) {
    try {
        logDebug("function : ig_checking; pChecked : " + p_checked + "; pParamClass : " + p_paramClass + "; pCalledFrom : " + p_calledFrom, "S");
        var model = apex.region("existing_pog_details").widget().interactiveGrid("getViews", "grid").model;
        var pog_list = [];
        model.forEach(function (record) {
            var pog_code = model.getValue(record, "POG_CODE");
            pog_list.push(pog_code);
            var selector = '#existing_pog_details [data-param="' + pog_code + '"].' + p_paramClass;
            if ($(selector).hasClass("fa-square-o") && p_checked == "Y") {
                $(selector).removeClass("fa-square-o");
                $(selector).addClass("fa-check-square-o");
            } else if ($(selector).hasClass("fa-check-square-o") && p_checked == "N") {
                $(selector).removeClass("fa-check-square-o");
                $(selector).addClass("fa-square-o");
            }
        });
        var check_ind = p_checked == "N" ? "UNCHECK" : "CHECK";
        update_selected(pog_list, check_ind);
        $("#existing_pog_details_ig_grid_vc_status").html(apex.lang.formatMessage("APEX.GV.SELECTION_COUNT", $("#existing_pog_details_ig_grid_vc .a-GV-bdy table tbody").find("tr span.fa-check-square-o").length));
        logDebug("function : ig_checking", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function conditional_highlight() {
    logDebug("function : update_pog_json", "S");
    return new Promise(function (resolve, reject) {
        //ASA-1416 issue 8 S
        //update json with latest dim details and get back.
        updPog = [];
        if (g_pog_json.length > 1) {
            var i = 0;
            for (const pogjson of g_pog_json) {
                updPog.push(g_pog_json[i]);
                i++;
            }
        } else {
            updPog.push(g_pog_json[g_pog_index]);
        }
        var p = apex.server.process(
            "UPDATE_HIGHLIGHT_JSON", {
            p_clob_01: JSON.stringify(updPog),
        }, {
            dataType: "html",
        });
        // When the process is done, set the value to the page item
        p.done(function (data) {
            openInlineDialog("condition_highlight", 55, 67);
            apex.region("condition_rgn").refresh();
            logDebug("function : update_pog_json", "E");
            resolve($.trim(data));
        });
    }); //--ASA-1416 issue 8 E
}

async function conditional_module_swap() {
    //ASA-1085
    try {
        logDebug("function : conditional_module_swap", "S");
        var res = await save_pog_to_json(g_pog_json[g_pog_index]);

        apex.server.process(
            "DELETE_SWAP_MODULE_COLL", {
            x01: "",
        }, {
            dataType: "text",
            success: function (pData) {
                apex.region("swap_grid").widget().interactiveGrid("getActions").set("edit", false);
                apex.region("swap_grid").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                apex.region("swap_grid").refresh();
                $s("P25_SWAP_MODULES", "");
                openInlineDialog("module_Swap", 45, 50);
            },
        });
        logDebug("function : conditional_module_swap", "E");
    } catch (err) {
        error_handling(err);
    }
}

function refreshItemGroupingArr(p_itemInfo) {
    try {
        logDebug("function : refreshItemGroupingArr ; itemInfo" + p_itemInfo, "S");
        var new_color_arr = g_color_arr.filter(function (el) {
            return el.DESCRIPTION !== p_itemInfo.Brand && el.DESCRIPTION !== p_itemInfo.Supplier && el.DESCRIPTION !== p_itemInfo.SubClass && el.DESCRIPTION !== p_itemInfo.Class && el.DESCRIPTION !== p_itemInfo.Group && el.DESCRIPTION !== p_itemInfo.Dept;
        });
        removeLoadingIndicator(regionloadWait);

        var p_type = $v("P25_SELECT_COLOR_TYPE");
        return new Promise(function (resolve, reject) {
            apex.server.process(
                "CREATE_ITEMS_COLOR_COLL", {
                x01: p_type,
                p_clob_01: JSON.stringify(new_color_arr),
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        logDebug("function : refreshItemGroupingArr", "E");
                    }
                },
                loadingIndicatorPosition: "none",
            });
        });
        return new_color_arr;
    } catch (err) {
        error_handling(err);
    }
}

function open_pdf_online() {
    try {
        logDebug("function : open_pdf_online", "S");
        g_pdf_online_clck = "Y";
        g_dblclick_opened = "Y";
        $("#P25_SAVE_WITH_PDF_CONTAINER").hide(); //ASA-1417 issue 3
        $("#P25_POG_PDF_REMINDER_MSG_CONTAINER").hide(); //ASA-1417 issue 1
        $("#P25_PDF_TEMPLATE_CONTAINER").show(); //ASA-1417 issue 1
        $("#SAVE_POG").hide();
        $("#SAVE_PDF").show();
        $s("P25_SAVE_WITH_PDF", "Y");
        //ASA-1677 Issue 1 added If/else
        let pdfValue = $v("P25_PDF_TEMPLATE");
        let extractedValue = pdfValue.split("-")[10]; //pdfValue.split("/").pop(); ASA 1706 issue #1
        if (!pdfValue) {
            $s("P25_DEFAULT_LIVE_VERSION", "Y");
            $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
        } else if (extractedValue == "Y") {
            $s("P25_DEFAULT_LIVE_VERSION", "Y");
            $s("P25_PREV_POG_CODE", g_pog_json[g_pog_index].POGCode); //ASA-1677 #4
            $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").show();
        } else {
            $s("P25_DEFAULT_LIVE_VERSION", "Y");
            $("#P25_DEFAULT_LIVE_VERSION_CONTAINER").hide();
        }
        // ASA-1677 ENDS
        $("#ui-id-14").text("Generate PDF");
        var template_id = check_cookie_name("PDF_TEMPLATE", $v("P25_BU_ID"));
        if (template_id !== "") {
            $s("P25_PDF_TEMPLATE", template_id);
        }
        openInlineDialog("open_pdf_modal", 25, 25);
        logDebug("function : open_pdf_online", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function generate_draft_pdf() {
    try {
        logDebug("function : generate_draft_pdf", "S");

        var res = await save_pog_to_json([g_pog_json[g_pog_index]]);
        logDebug("function : generate_draft_pdf after save", "S");
        apex.server.process(
            "TRUNC_MOD_IMG_COLL", {
            x01: "",
        }, {
            dataType: "text",
            success: function (pData) {
                async function doSomething() {
                    var p_pog_details = {
                        SeqNo: "",
                        POGCode: g_pog_json[g_pog_index].POGCode,
                        POGVersion: g_pog_json[g_pog_index].Version,
                        POGModule: "",
                        Selection_Type: draftPogInd, //"D",  ASA-1876 replace D to draftPogInd
                        Print_Type: "P",
                        SequenceId: "",
                        TemplateId: $v("P25_PDF_TEMPLATE").split("-")[0],
                        TemplateDetails: $v("P25_PDF_TEMPLATE"),
                    };

                    //ASA-1870 passed values from $v("P25_POGCR_ENHANCE_PDF_IMG") to $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE") to set_scene
                    var res = await create_pdf(p_pog_details, "N", "N", g_camera, "D", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_NOTCH_HEAD"), "Y", g_pog_index, "Y", g_all_pog_flag, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), '', '', g_hide_show_dos_label, 'Y', // //Regression 4 ASA-1975.2
                        $v("P25_POGCR_ENHANCE_PDF_IMG"), $v("P25_POGCR_PDF_IMG_ENHANCE_RATIO"), $v("P25_POGCR_PDF_CANVAS_SIZE"), $v("P25_VDATE"), $v("P25_POG_POG_DEFAULT_COLOR"), $v("P25_POG_MODULE_DEFAULT_COLOR"), $v("P25_POGCR_DFT_SPREAD_PRODUCT"), $v("P25_PEGB_DFT_HORIZ_SPACING"), $v("P25_PEGBOARD_DFT_VERT_SPACING"), $v("P25_BASKET_DFT_WALL_THICKNESS"), $v("P25_CHEST_DFT_WALL_THICKNESS"), $v("P25_POGCR_PEGB_MAX_ARRANGE"), $v("P25_POGCR_DEFAULT_WRAP_TEXT"), $v("P25_POGCR_TEXT_DEFAULT_SIZE"), $v("P25_POG_TEXTBOX_DEFAULT_COLOR"), $v("P25_POG_SHELF_DEFAULT_COLOR"), $v("P25_DIV_COLOR"), $v("P25_SLOT_DIVIDER"), $v("P25_SLOT_ORIENTATION"), $v("P25_DIVIDER_FIXED"), $v("P25_POG_ITEM_DEFAULT_COLOR"), $v("P25_POGCR_DFT_BASKET_FILL"), $v("P25_POGCR_DFT_BASKET_SPREAD"), $v("P25_POGCR_BAY_LIVE_IMAGE"), $v("P25_POGCR_BAY_WITHOUT_LIVE_IMAGE"), "N");
                    g_pdf_online_clck = "N"; //ASA-1531 issue 16
                    logDebug("function : generate_draft_pdf", "E");
                }
                doSomething();
            },
            loadingIndicatorPosition: "none",
        });
    } catch (err) {
        error_handling(err);
    }
}

function openCustomDialog(p_ind, p_url, p_item) {
    try {
        logDebug("function : openCustomDialog; p_ind : " + p_ind + "; p_url : " + p_url + "; p_item :" + p_item + "E");
        if (g_intersected) {
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
        $s(p_item, p_ind);
        apex.navigation.redirect(p_url);
        logDebug("function : openCustomDialog; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function showDaysOfSupply() {
    logDebug("function : showDaysOfSupply; ", "S");
    var originalCanvas = g_pog_index;
    if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
        if (g_all_pog_flag == "Y") {
            var i = 0;
        } else {
            var i = g_pog_index;
        }
        if (g_show_days_of_supply == "N") {
            g_show_days_of_supply = "Y";
            $(".supply_days").addClass("item_label_active");
        } else {
            g_show_days_of_supply = "N";
            $(".supply_days").removeClass("item_label_active");
        }
        for (const pogInfo of g_pog_json) {
            if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                g_renderer = g_scene_objects[i].renderer;
                g_scene = g_scene_objects[i].scene;
                g_camera = g_scene_objects[i].scene.children[0];
                g_world = g_scene_objects[i].scene.children[2];

                if (g_show_item_desc == "Y" && g_show_days_of_supply == "Y") {
                    g_show_item_desc = "N";
                    $(".item_desc").removeClass("item_label_active");
                    await showHideItemDescription("N", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), i);
                }
                await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", i, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')

                render(i);
                set_indicator_objects(i);
            }
            if (g_all_pog_flag == "Y") {
                i++;
            } else {
                break;
            }
        }

        g_renderer = g_scene_objects[originalCanvas].renderer;
        g_scene = g_scene_objects[originalCanvas].scene;
        g_camera = g_scene_objects[originalCanvas].scene.children[0];
        g_world = g_scene_objects[originalCanvas].scene.children[2];

        g_prev_undo_action = "supply_days";
    }
    logDebug("function : open_item_label; ", "E");
}

async function enableDisableFlags(p_pog_index, p_plano_rate_call = "N") {
    try {
        if (g_show_notch_label == "Y") {
            $(".notch_label").addClass("notch_label_active");
            show_notch_labels("Y", $v("P25_NOTCH_HEAD"), "Y", p_pog_index);
        } else if (p_plano_rate_call == "Y" && g_show_notch_label == "N") {
            //ASA-1655
            show_notch_labels("N", $v("P25_NOTCH_HEAD"), "N", p_pog_index);
        }
        if (g_show_fixel_label == "Y") {
            $(".fixel_label").addClass("fixel_label_active");
            show_fixel_labels("Y", p_pog_index);
        }
        if (g_show_item_label == "Y") {
            $(".item_label").addClass("item_label_active");
            show_item_labels("Y", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        } else if (p_plano_rate_call == "Y" && g_show_item_label == "N") {
            //ASA-1655
            show_item_labels("N", $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        }
        //ASA-1182
        if (g_itemSubLabelInd == "Y") {
            $(".item_sublabel").addClass("item_sublabel_active");
            $("#item_sublbl_sub ." + g_itemSubLabel).addClass("item_sublabel_active");
            showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index);
        }
        if (g_show_max_merch == "Y") {
            let result = await add_merch("Y", p_pog_index);
        } else if (p_plano_rate_call == "Y" && g_show_max_merch == "N") {
            //ASA-1655
            let result = await add_merch("N", p_pog_index);
        }

        if (g_show_item_color == "Y") {
            var res = await ShowColorBackup(p_pog_index);

            var res = await item_grouping(p_pog_index, $v("P25_SELECT_COLOR_TYPE"));
            var res = await set_items_color(p_pog_index, $v("P25_SELECT_COLOR_TYPE"));
        }

        if (g_show_days_of_supply == "Y") {
            var res = await showHideDaysOfSupplyLabel("Y", "N", p_pog_index, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
        } else {
            var res = await showHideDaysOfSupplyLabel("N", "N", p_pog_index, "Y", "N", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
        }

        if (g_show_fixel_space == "Y" || (p_plano_rate_call == "Y" && g_show_fixel_space == "N")) {
            showFixelAvailableSpace("N", "N", p_pog_index);
        } else {
            showFixelAvailableSpace("N", "Y", p_pog_index);
        }
        reset_indicators();
    } catch (err) {
        error_handling(err);
    }
}

async function calculateFixelAndSupplyDays(p_updatePogItemColl = "N", p_pog_index) {
    try {
        logDebug("function : calculateFixelAndSupplyDays", "S");
        if (g_show_fixel_space == "Y" && (p_pog_index !== g_ComViewIndex || (p_pog_index == g_ComViewIndex && g_compare_view == "PREV_VERSION"))) {
            showFixelAvailableSpace("N", "N", p_pog_index);
        } else if (p_pog_index !== g_ComViewIndex) {
            showFixelAvailableSpace("N", "Y", p_pog_index);
        }
        console.log("g_show_days_of_supply", g_show_days_of_supply, p_pog_index, g_ComViewIndex);
        if (g_show_days_of_supply == "Y" && (p_pog_index !== g_ComViewIndex || (p_pog_index == g_ComViewIndex && g_compare_view == "PREV_VERSION"))) {
            var retval = await showHideDaysOfSupplyLabel("Y", p_updatePogItemColl, p_pog_index, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
        }
        if (g_itemSubLabelInd == "Y") {
            //ASA-1417 Issue 4
            showItemSubLabel(g_itemSubLabel, g_itemSubLabelInd, $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), p_pog_index); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
        }
        reset_indicators();
        logDebug("function : calculateFixelAndSupplyDays", "E");
    } catch (err) {
        error_handling(err);
    }
}

function menuActions(p_actionType, p_subActionType) {
    try {
        logDebug("function : menuActions", "S");
        //ASA-1898 Live image prompt error when maximize one of the POG from multiple POG mode.
        if (g_is_pog_maximize === "Y" && ["LIVE_IMAGE", "RESET_ZOOM", "AREA_ZOOM", "AREA_ZOOM_AREA"].includes(p_actionType)) //ASA-1910 Area zoom issue while opening multiple POG
        {
            g_pog_index = 0;
        }
        backupPog("F", -1, -1, g_pog_index);
        switch (p_actionType) {
            case "RENUMBERING":
                open_renumbering();
                break;
            case "FIXEL_LABEL":
                open_fixel_label();
                break;
            case "ITEM_LABEL":
                open_item_label();
                break;
            case "NOTCH_LABEL":
                open_notch_label(g_pog_index);
                break;
            case "FIXEL_MERCH":
                fixel_merch();
                break;
            case "CONDITIONAL_HIGHLIGHT":
                conditional_highlight(g_pog_index);
                break;
            case "SHOW_ITEM_COLOR":
                showItemColor(p_subActionType, g_pog_index);
                break;
            case "FIXEL_AVAILABLE_SPACE":
                showFixelAvailableSpace("Y", "N", g_pog_index);
                break;
            case "SHOW_ITEM_DESCRIPTION":
                showItemDescription(g_pog_index);
                break;
            case "SHOW_DAYS_OF_SUPPLY":
                showDaysOfSupply(g_pog_index);
                break;
            case "LIVE_IMAGE":
                live_image();
                break;
            case "Recal_Compare":
                recal_compare();
                break;
            case "REFRESH_SALES":
                sales_refresh();
                break;
            case "REFRESH_ITEMS": //ASA-1412
                refresh_items();
                break;
            case "OPEN_3D":
                open_3d_popup();
                break;
            case "CLEAR_POG":
                clear_pog_info();
                break;
            case "CLEAR_ITEM":
                clear_item_init(p_subActionType);
                break;
            case "OPEN_FIXEL":
                open_fixel();
                break;
            case "OPEN_PDF_ONLINE":
                open_pdf_online();
                break;
            case "MODULE_SWAP":
                conditional_module_swap(); //ASA-1085
                break;
            case "MAXIMIZE_FACINGS":
                enable_maximize_facings(p_subActionType, g_pog_index);
                break;
            case "PEG_HOLES":
                peg_holes(g_pog_index);
                break;
            case "PEG_TAGS":
                show_pegTages();
                break;
            case "AUTO_POSITION":
                auto_position();
                break;
            case "AUTO_POSITION_ALL":
                auto_position_all_init("Y");
                break;
            case "RESET_ZOOM":
                reset_zoom();
                break;
            case "AREA_ZOOM":
                area_zoom();
                break;
            case "AREA_ZOOM_AREA":
                select_zoom_init();
                break;
            case "COMPARE_POG":
                compare_pog();
                break;
            case "PREV_VERSION":
                prev_ver(p_subActionType); //ASA-1803 Issue 1
                break;
            case "CREATE_SIDE_VIEW":
                create_side_view(p_subActionType);
                break;
            case "EDIT_PALLET":
                edit_pallet_init();
                break;
            case "CLOSE_COMPARE":
                close_compare();
                break;
            case "UPDATE_ITEM_INFO":
                open_update_item_info();
                break;
            case "AUTO_POSITION_PEG":
                auto_position_pegboard();
                break;
            case "DELIST_ITEM":
                item_delist();
                break;
            case "ACTIVATE_OVERHUNG_SHELF":
                activateOverhungShelf(g_pog_index);
                break;
            case "DEPTH_FACING_REMARKS":
                open_depth_facing_rmks();
                break;
            case "SHOW_ITEM_SUBLBL":
                openItemSubLabel(p_subActionType);
                break;
            case "AUTO_DEPTH_FACING":
                auto_depth_facing(); //ASA-1255
                break;
            case "REFRESH_AUTO_DIVIDER":
                refresh_auto_divider(g_pog_index); //ASA-1406
                break;
            case "Add_POG":
                open_aditional_pog();
                break;
            case "AUTO_POSITION_NO_SUBSHLF":
                auto_position_all_init("N"); //ASA-1628
                break;
        }
        logDebug("function : menuActions", "E");
    } catch (err) {
        error_handling(err);
    }
}
//Start ASA-1406
async function refresh_auto_divider(p_pog_index) {
    logDebug("function : refresh_auto_divider", "S");
    try {
        if (g_all_pog_flag == "Y") {
            var z = 0;
        } else {
            var z = p_pog_index;
        }
        if (g_pog_json.length > 0) {
            addLoadingIndicator();
            for (const pogJson of g_pog_json) {
                if ((z !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                    g_renderer = g_scene_objects[z].renderer;
                    g_scene = g_scene_objects[z].scene;
                    g_camera = g_scene_objects[z].scene.children[0];
                    g_world = g_scene_objects[z].scene.children[2];
                    var l = 0;
                    for (const Modules of g_pog_json[z].ModuleInfo) {
                        if (Modules.ParentModule == null) {
                            var j = 0;
                            for (const Shelf of Modules.ShelfInfo) {
                                if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.DivHeight > 0 && Shelf.DivWidth > 0) {
                                    var old_item_info = JSON.parse(JSON.stringify(g_pog_json[z].ModuleInfo[l].ShelfInfo[j].ItemInfo));
                                    await create_shelf_dividers(z, l, j);
                                    var item_arr = [],
                                        item_width_arr = [],
                                        item_height_arr = [],
                                        item_depth_arr = [],
                                        item_index_arr = [];
                                    var items_arr = g_pog_json[z].ModuleInfo[l].ShelfInfo[j].ItemInfo;
                                    $.each(items_arr, function (k, items) {
                                        //ASA-1265
                                        if (typeof items.BottomObjID == "undefined" || items.BottomObjID == "") {
                                            item_width_arr.push(wpdSetFixed(items.W)); //.toFixed(4)));
                                            item_height_arr.push(wpdSetFixed(items.H)); //.toFixed(4)));
                                            item_depth_arr.push(wpdSetFixed(items.D)); //.toFixed(4)));
                                            item_index_arr.push(k);
                                        }
                                        g_pog_json[z].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].Exists = "E";
                                    });
                                    if (validate_items(item_width_arr, item_height_arr, item_depth_arr, item_index_arr, Shelf.ObjType, l, j, -1, "N", 0, 0, 0, -1, "N", "Y", "Y", "N", "N", [], "Y", "Y", "Y", z)) {
                                        if (reorder_items(l, j, z)) {
                                            console.log("inside recreate");
                                            await recreate_all_items(l, j, Shelf.ObjType, "N", -1, -1, Shelf.ItemInfo.length, "Y", "N", -1, -1, z, "", z, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y");
                                        }
                                    } else {
                                        remove_shelf_dividers(p_pog_index, l, Shelf.Shelf); //Task_27734
                                        g_pog_json[z].ModuleInfo[l].ShelfInfo[j].ItemInfo = old_item_info;
                                        if (reorder_items(l, j, z)) {
                                            await recreate_all_items(l, j, Shelf.ObjType, "N", -1, -1, old_item_info.length, "Y", "N", -1, -1, z, "", z, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y");
                                        }
                                    }
                                }
                                j++;
                            }
                        }
                        l++;
                    }
                    render(z);
                }
                if (g_all_pog_flag == "Y") {
                    z++;
                } else {
                    break;
                }
            }
            apex.message.showPageSuccess(g_pog_refresh_msg);
            removeLoadingIndicator(regionloadWait);
        }
        logDebug("function : refresh_auto_divider", "E");
    } catch (err) {
        error_handling(err);
    }
}
//End ASA-1406

function auto_depth_facing() {
    //ASA-1255
    logDebug("function : peg_holes", "S");
    var l_pog_json = get_canvas_json("LABEL");
    if (typeof l_pog_json !== "undefined" && l_pog_json.length > 0) {
        if (g_auto_cal_depth_fac == "N") {
            g_auto_cal_depth_fac = "Y";
            $(".auto_depth").addClass("auto_depth_active");
        } else {
            g_auto_cal_depth_fac = "N";
            $(".auto_depth").removeClass("auto_depth_active");
        }
        var errorMessage = "";
    }
    logDebug("function : peg_holes", "E");
}

function calcMaxFacings(p_pog_json, p_mIndex, p_sIndex, p_shelf, p_itemDet, p_item_index, p_pog_index) {
    var items = p_itemDet;
    if (nvl(items) !== 0) {
        var max_facings_allowed = $v("P25_POGCR_AUTO_MAX_VFACING");
        var max_merch = get_shelf_max_merch(p_pog_json, p_pog_json[p_pog_index].ModuleInfo[p_mIndex], p_shelf, p_mIndex, p_sIndex, parseFloat($v("P25_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload
        var real_height = p_itemDet.RH / p_itemDet.BVert;
        var vert_facing = Math.floor((max_merch * 100) / (real_height * 100));
        var OldItemHeight,
            h,
            Bvert,
            y,
            rh,
            d,
            baseD,
            rd;
        var depth_facing = 1;
        var shelf_depth;

        var max_depth = p_shelf.ObjType == "HANGINGBAR" ? 0 : findNearByShelfMaxDepth(p_mIndex, p_sIndex, p_item_index, p_item_index, -1, p_pog_json);
        if (p_shelf.ObjType == "HANGINGBAR") {
            shelf_depth = p_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].MaxMerch == 0 || p_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].MaxMerch == "" ? g_hangbar_dft_maxmerch : p_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].MaxMerch;
        } else {
            shelf_depth = p_pog_json[p_pog_index].ModuleInfo[p_mIndex].ShelfInfo[p_sIndex].D;
        }
        var real_depth = items.RD / items.BaseD;
        if (items.MDepthCrushed == "Y" && items.CrushD > 0) {
            real_depth = real_depth - (real_depth * items.CrushD) / 100;
        }
        depth_facing = Math.floor(((shelf_depth - max_depth) * 100) / (real_depth * 100));
        var l_dfacing = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings; //ASA-1408
        depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-1408
        d = real_depth * (depth_facing > 0 ? depth_facing : 1);
        baseD = depth_facing > 0 ? depth_facing : 1;
        rd = items.D;
        if (p_shelf.ObjType == "SHELF") {
            var l_max_vfacing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings; //ASA-1408
            var new_facings = l_max_vfacing > -1 ? l_max_vfacing : max_facings_allowed; //ASA-1408
            if (vert_facing > new_facings) {
                vert_facing = new_facings;
            }
            h = real_height * (vert_facing > 0 ? vert_facing : 1);
            Bvert = vert_facing > 0 ? vert_facing : 1;
            var [new_x, y] = get_item_xy(p_shelf, items, items.W, h, p_pog_json);
            rh = h;
        }
    }
    return [h, Bvert, rh, y, d, baseD, rd];
}

async function duplicateShelf(p_camera, p_pog_index) {
    logDebug("function : duplicateShelf", "S");
    var ShelfInfo = {};
    var colorValue = $v("P25_POG_SHELF_DEFAULT_COLOR");
    var hex_decimal = new THREE.Color(colorValue);
    var shelfY = 0;
    var index = -1,
        shelf_ind = -1;
    var newShelfIndex = -1;

    try {
        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, modules) {
            if (modules.ParentModule == null || typeof modules.ParentModule == "undefined") {
                g_module_index = i;
                return false;
            }
        });
        var locationX = g_intersects[0].point.x;
        var locationY = g_intersects[0].point.y;
        var locationZ = g_intersects[0].point.z;
        var coords = new THREE.Vector3(locationX, locationY, locationZ);
        g_scene_objects[p_pog_index].scene.children[2].worldToLocal(coords);
        x = Math.min(19, Math.max(-19, coords.x)); // clamp coords to the range -19 to 19, so object stays on ground
        y = Math.min(19, Math.max(-19, coords.y));
        ShelfInfo["Shelf"] = "C" + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length;
        ShelfInfo["ObjType"] = "SHELF";
        ShelfInfo["Desc"] = "";
        ShelfInfo["MaxMerch"] = 0;
        ShelfInfo["GrillH"] = 0;
        ShelfInfo["LoOverHang"] = 0;
        ShelfInfo["ROverhang"] = 0;
        ShelfInfo["SpacerThick"] = 0;
        ShelfInfo["HorizGap"] = 0;
        ShelfInfo["SpreadItem"] = "L";
        ShelfInfo["Combine"] = "N";
        ShelfInfo["AllowAutoCrush"] = "N";

        ShelfInfo["H"] = 0.02;
        ShelfInfo["W"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].W;
        //ShelfInfo["D"] = g_dupShelfDepth; //ASA-1927 Issue-2
        ShelfInfo["D"] = g_pog_json[p_pog_index].ModuleInfo[g_module_index].D; //ASA-1927 Issue-2
        ShelfInfo["Rotation"] = 0;
        ShelfInfo["Slope"] = 0;
        ShelfInfo["Color"] = $v("P25_POG_SHELF_DEFAULT_COLOR");
        ShelfInfo["LiveImage"] = "";
        ShelfInfo["HorizSlotStart"] = 0;
        ShelfInfo["HorizSlotSpacing"] = 0;
        ShelfInfo["HorizStart"] = 0;
        ShelfInfo["HorizSpacing"] = 0;
        ShelfInfo["UOverHang"] = 0;
        ShelfInfo["LOverhang"] = 0;
        ShelfInfo["VertiStart"] = 0;
        ShelfInfo["VertiSpacing"] = 0;
        ShelfInfo["X"] = x;
        ShelfInfo["Y"] = y;
        ShelfInfo["Z"] = 0;
        ShelfInfo["InputText"] = "";
        ShelfInfo["WrapText"] = "";
        ShelfInfo["ReduceToFit"] = "";
        ShelfInfo["TextDirection"] = "";
        ShelfInfo["BsktFill"] = "";
        ShelfInfo["BsktSpreadProduct"] = "";
        ShelfInfo["SnapTo"] = "N";
        ShelfInfo["BsktWallH"] = 0;
        ShelfInfo["BsktBaseH"] = 0;
        ShelfInfo["BsktWallThickness"] = 0;
        ShelfInfo["DSlotStart"] = 0;
        ShelfInfo["DSlotSpacing"] = 0;
        ShelfInfo["DGap"] = 0;
        ShelfInfo["FrontOverHang"] = 0;
        ShelfInfo["BackOverHang"] = 0;
        ShelfInfo["SlotDivider"] = "";
        ShelfInfo["AutoPlacing"] = $v("P25_POGCR_PEGB_MAX_ARRANGE");
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
        ShelfInfo["creationType"] = "A";
        ShelfInfo["Overhung"] = "N"; //ASA-1138
        ShelfInfo["AvlSpace"] = ShelfInfo["W"] + ShelfInfo["LOverhang"] + ShelfInfo["ROverhang"];
        var z = 0.003;
        shelf_ind = -1;
        var max_shelfy_arr = [];
        var max_index_arr = [];
        g_pog_json[p_pog_index].ModuleInfo[g_module_index].LastCount = g_pog_json[p_pog_index].ModuleInfo[g_module_index].LastCount + 1;

        if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.length == 0) {
            shelfY = ShelfInfo["H"] / 2 + g_pog_json[p_pog_index].BaseH;
        } else {
            $.each(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo, function (i, Shelf) {
                if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                    max_shelfy_arr.push(Shelf.ShelfY);
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
        ShelfInfo["X"] = x;
        ShelfInfo["Y"] = y;
        ShelfInfo["Z"] = g_pog_json[p_pog_index].BackDepth / 2 + ShelfInfo["D"] / 2;
        ShelfInfo["ItemInfo"] = [];
        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo.push(ShelfInfo);

        var [return_val, shelf_cnt] = await add_shelf(ShelfInfo["Shelf"], ShelfInfo["ObjType"], ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, x, y, z, "N", g_module_index, ShelfInfo["Rotation"], ShelfInfo["Slope"], shelf_ind, "Y", "N", "Y", -1, $v("P25_POG_CP_SHELF_DFLT_COLOR"), $v("P25_NOTCH_HEAD"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), p_pog_index); //ASA-1350 issue 6 added parameters,//ASA-1438 task 1
        var res = updateObjID(ShelfInfo["OldObjID"], return_val, "S");
        newShelfIndex = shelf_cnt;
        if (g_show_max_merch == "Y") {
            add_merch("Y", g_pog_index);
        }
        apex.item("P25_SHELF_EDIT_IND").setValue("N");
        g_dblclick_opened = "N";
        duplicate_fixel_flag = "N";
        //recreate the orientation view if any present
        await recreate_compare_views(g_compare_view, "N");

        //capture the module is edit or not to create changed text box
        g_pog_json[p_pog_index].ModuleInfo[g_module_index].ModuleEditFlag = "Y";
        g_dragItem = {}; //ASA-1272
        render(p_pog_index);
        logDebug("function : duplicateShelf", "E");
        return [newShelfIndex, return_val];
    } catch (err) {
        error_handling(err);
    }
}

function remove_param_on_load() {
    try {
        logDebug("function : remove_param_on_load ; ", "S");
        if ($v("P25_NEW_SESSION") == "Y") {
            g_pog_json = [];
            $s("P25_NEW_SESSION", "N");
            sessionStorage.removeItem("POGJSON");
            sessionStorage.removeItem("P25_EXISTING_DRAFT_VER");
            sessionStorage.removeItem("P25_DRAFT_LIST");
            sessionStorage.removeItem("P25_POG_DESCRIPTION");
        }
        sessionStorage.setItem("POGExists", "N");
        removeParam("P25_NEW_SESSION");
        logDebug("function : remove_param_on_load ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function create_modal_open(p_param) {
    try {
        logDebug("function : create_modal_open ; p_param" + p_param, "S");
        g_json = [g_pog_json[g_pog_index]]; //ASA-1496 #1
        if (p_param == "POG") {
            sessionStorage.setItem("POGExists", "Y");
            create_pog(g_pog_index);
        } else if (p_param == "MOD") {
            create_pog_module(g_camera, g_pog_index);
        } else if (p_param == "FIXEL") {
            if (g_multiselect == "Y" && g_mselect_drag == "Y") {
                manage_multi_edit("F", g_pog_index);
            } else {
                g_delete_details = []; //ASA-1244
                g_multiselect = "N"; //ASA-1244
                g_mselect_drag = "N"; //ASA-1244
                await create_shelf(g_pog_index);
                render(g_pog_index);
            }
        } else if (p_param == "DIV") {
            create_divider(g_pog_index);
        } else if (p_param == "ITEM") {
            if (g_carpark_item_flag == "Y") {
                var return_val = edit_carpark_items(g_item_index, g_pog_index);
            } else if ((g_multiselect == "Y" && g_mselect_drag == "Y") || g_ctrl_select == "Y") {
                manage_multi_edit("P", g_pog_index);
                render(g_pog_index);
            } else {
                g_delete_details = [];
                g_multiselect = "N"; //ASA-1244
                g_mselect_drag = "N"; //ASA-1244
                g_allowItemSort = "N"; //ASA-1970 Issue1
                var return_val = await edit_items(g_item_index, g_camera, g_pog_index);
                render(g_pog_index);
            }
            dim_edit_done = "N";
            g_allowItemSort = "Y"; //ASA-1970 Issue1
        }
        logDebug("function : create_modal_open ; p_param" + p_param, "E");
    } catch (err) {
        error_handling(err);
    }
}

async function delete_pog_call(p_param) {
    try {
        logDebug("function : delete_pog_call ; ", "S");
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
        //Task_29818 - End
        if (p_param == "FIXEL") {
            await deleteObject(g_pog_index, g_delete_details, "N", "N", -1, "U"); // Task 21828,
            $s("P25_SHELF_EDIT_IND", "N");
        } else {
            if (p_param == "POG") {
                apex.server.process(
                    "DELETE_DRAFT", {
                    x01: g_pog_json[p_pog_index].POGCode,
                }, {
                    dataType: "text",
                    success: function (pData) {
                        if ($.trim(pData) != "") {
                            raise_error(pData);
                        } else {
                            init();
                            g_pog_json.splice(0);
                            closeInlineDialog("add_pog");
                            g_dblclick_opened = "N";
                            $("#create_pog_btn").css("display", "block");
                            $(".create_module").css("visibility", "hidden");
                            $(".create_shelf").css("visibility", "hidden");
                            $(".create_pegboard").css("visibility", "hidden");
                            $(".create_text").css("visibility", "hidden");
                            $(".create_hangingbar").css("visibility", "hidden");
                            $(".create_basket").css("visibility", "hidden");
                            $(".create_chest").css("visibility", "hidden");
                            $(".create_rod").css("visibility", "hidden");
                            $(".create_pallet").css("visibility", "hidden");
                            $(".create_divider").css("visibility", "hidden");
                            $(".fixel_label").css("display", "none");
                            $(".item_label").css("display", "none");
                            $(".open_fixel").css("display", "none");
                            $(".clear_item").css("display", "none");
                            $(".clear_pog_att").css("display", "none");
                            $(".clear_pog_info").css("display", "none");
                            $s("P25_POG_EDIT_IND", "N");
                            $s("P25_POG_DELETE_IND", "Y");
                            apex.event.trigger("#P25_DRAFT_LIST", "apexrefresh");
                            logDebug("function : delete_pog_call ; ", "E");
                        }
                    },
                    loadingIndicatorPosition: "page",
                });
                $s("P25_POG_CODE", "");
                $s("P25_POG_NAME", "");
                $s("P25_POG_TYPE", "");
                $s("P25_POG_HEIGHT", 0);
                $s("P25_POG_SEGMENT_WIDTH", 0);
                $s("P25_POG_WIDTH", 0);
                $s("P25_POG_DEPTH", 0);
                $s("P25_BACK_DEPTH", 1);
                $s("P25_TRAFFIC_FLOW", "LR");
                $s("P25_POG_BASE_HEIGHT", 0);
                $s("P25_POG_BASE_WIDTH", 0);
                $s("P25_POG_BASE_DEPTH", 0);
                $s("P25_POG_NOTCH_WIDTH", 0);
                $s("P25_POG_NOTCH_START", 0);
                $s("P25_POG_NOTCH_SPACING", 0);
                $s("P25_POG_COLOR", "#A69FA6");
                $s("P25_HORZ_START", 0);
                $s("P25_HORZ_SPACING", 0);
                $s("P25_POG_VERT_START", 0);
                $s("P25_POG_VERT_SPACING", 0);
                $s("P25_ALLOW_OVERLAP", "N");
                $s("P25_SPECIAL_TYPE", "");
                $s("P25_SPECIAL_TYPE_DESC", "");
                $s("P25_DISPLAY_METERAGE", "");
                $s("P25_RPT_METERAGE", "");
                $s("P25_EFF_START_DATE", "");
                $s("P25_BRAND_GROUP_ID", "");
                $s("P25_REMARKS", "");
                $s("P25_STORE_SEGMENT", "");
                $s("P25_DESC_7", "");
                $s("P25_POG_DIVISION", "");
                $s("P25_FIXTURE_GENERATION", "");
            } else if (p_param == "MOD") {
                await deleteObject(g_pog_index, "", "N", "Y", g_module_index, "U"); // Task 21828,
                $s("P25_MODULE_EDIT_IND", "N");
            } else if (p_param == "DIV") {
                //Task_29818 - Start
                // ax_message.confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), async function (e) {
                //     if (e) {
                //         await deleteObject(g_pog_index, g_delete_details, "N", "N", -1, "U"); // Task 21828,
                //         closeInlineDialog("add_divider");
                //         $s("P25_ITEM_EDIT_IND", "N");
                //     }
                // });
                confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), get_message("SHCT_YES"), get_message("SHCT_NO"), async function () {
                    await deleteObject(g_pog_index, g_delete_details, "N", "N", -1, "U"); // Task 21828,
                    closeInlineDialog("add_divider");
                    $s("P25_ITEM_EDIT_IND", "N");
                });
                //Task_29818 - End
            } else if (p_param == "ITEM") {
                await deleteObject(g_pog_index, g_delete_details, "N", "N", -1, "U"); // Task 21828,
                g_multiselect = "N";
                g_mselect_drag = "N";
                g_ctrl_select = "N";
                $s("P25_ITEM_EDIT_IND", "N");
                g_scene_objects[g_pog_index].scene.children[2].remove(g_targetForDragging);
                dim_edit_done = "N";
            } else if (p_param == "TEXT") {
                //Task_29818 - Start
                // ax_message.confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), async function (e) {
                //     if (e) {
                //         await deleteObject(g_pog_index, g_delete_details, "N", "N", -1, "U"); // Task 21828,
                //         closeInlineDialog("add_textbox");
                //         $s("P25_SHELF_EDIT_IND", "N");
                //     }
                // });
                confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), get_message("SHCT_YES"), get_message("SHCT_NO"), async function () {
                    await deleteObject(g_pog_index, g_delete_details, "N", "N", -1, "U"); // Task 21828,
                    closeInlineDialog("add_textbox");
                    $s("P25_SHELF_EDIT_IND", "N");
                });
                //Task_29818 - End
            }
            g_dblclick_opened = "N";
            apex.message.showPageSuccess(g_delete_success_msg);
            render(g_pog_index);
        }
        logDebug("function : delete_pog_call ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

function refresh_prod_list_close() {
    try {
        logDebug("function : refresh_prod_list_close ; ", "S");
        if ($v("P25_USED_ITEM") == "A" && $v("P25_ITEM") == "" && $v("P25_SUPP_NAME") == "" && $v("P25_SUPPLIER_CODE") == "" && $v("P25_MAIN_BRAND") == "" && $v("P25_ITEM_DESCRIPTION") == "" && $v("P25_DESCRIPTION_SEC") == "" && $v("P25_GROUP") == "" && $v("P25_DEPARTMENT") == "" && $v("P25_ITEM_BRAND") == "" && $v("P25_GROUP") == "" && $v("P25_CLASS") == "" && $v("P25_SUB_CLASS") == "") {
            //ASA-1558 Task 1
            alert(get_message("SEARCH_ATLEAST_CRITERIA"));
        } else {
            if ($v("P25_PRODUCT_FILTER") == "Y") {
                if (apex.region("draggable_table") !== null) {
                    apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
                    apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                    apex.region("draggable_table").refresh();
                }

                $s("P25_PRODUCT_FILTER", "N");
            } else {
                POG_json = JSON.stringify(g_pog_json);
                apex.server.process(
                    "ADD_JSON_TO_COLL", {
                    x01: "I",
                    p_clob_01: POG_json,
                }, {
                    dataType: "text",
                    success: function (pData) {
                        if ($.trim(pData) != "") {
                            raise_error(pData);
                        } else {
                            if (apex.region("draggable_table") !== null) {
                                apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
                                apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                                apex.region("draggable_table").refresh();
                            }

                            closeInlineDialog("search_product");
                            g_dblclick_opened = "N";
                            logDebug("function : refresh_prod_list_close ; ", "E");
                        }
                    },
                    loadingIndicatorPosition: "page",
                });
            }
        }
        logDebug("function : refresh_prod_list_close ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function open_existing(p_pog_list_arr, p_openAttr, p_imageLoadInd = "N") {
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
        switchCanvasView($v("P25_POGCR_TILE_VIEW")); // Task-22510
        appendMultiCanvasRowCol(1, $v("P25_POGCR_TILE_VIEW"));
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
            g_show_live_image = $v("P25_POGCR_DFLT_LIVE_IMAGES");
            g_imagesShown = "N";
        }
        if (g_compare_pog_flag == "Y" && g_compare_view == "POG" && g_show_live_image == "N") {
            g_show_live_image = $v("P25_POGCR_DFLT_LIVE_IMAGES");
            g_imagesShownComp = "N";
        }
        g_combinedShelfs = []; //ASA-1443
        if (pog_code_list.length == 1) {
            $(".save_template").css("display", "block");

            selectedIds += pog_code_list[0] + ":";
            $s("P25_SELECTED_RECORDS", selectedIds);
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
                //Task_29818 - Start
                // ax_message.confirm(get_message("VIRTUAL_POG_OPEN_ALERT"), function (e) {
                //     if (e) {
                //         $s("P25_OPEN_POG", "Y");
                //         $s("P25_OPEN_POG_CODE", pog_code_list[0]);
                //         $s("P25_OPEN_POG_VERSION", pog_version_list[0]);

                //         async function doSomething() {
                //             g_seqArrDtl = {};
                //             g_seqArrDtl["seqId"] = "";
                //             g_seqArrDtl["index"] = 0;
                //             g_seqArrDtl["pogCode"] = pog_code_list[0];
                //             g_seqArrDtl["pogVersion"] = pog_version_list[0];
                //             g_seqArrDtl["pogType"] = "E";
                //             g_seqArr.push(g_seqArrDtl);
                //             addLoadingIndicator(); //ASA-1500
                //             await get_existing_pog(pog_code_list[0], pog_version_list[0], 0, "N", "N");
                //             removeLoadingIndicator(regionloadWait); //ASA-1500
                //             render(0);
                //             animate_all_pog();
                //         }
                //         doSomething();
                //     }
                // });
                confirm(get_message("VIRTUAL_POG_OPEN_ALERT"), get_global_ind_values("AI_CONFIRM_OK_TEXT"), get_global_ind_values("AI_CONFIRM_CANCEL_TEXT"), function () {
                    $s("P25_OPEN_POG", "Y");
                    $s("P25_OPEN_POG_CODE", pog_code_list[0]);
                    $s("P25_OPEN_POG_VERSION", pog_version_list[0]);

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
                        //ASA-1803 Added for refresh sales.
                        if ($v("P25_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[0].NewPOG != "Y") {
                            //ASA-1803 Issue 3, 9
                            await refresh_sales_data(13, "", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", pog_code_list[0], "N", pog_code_list[0], "N", g_pog_index, "Y");
                            $s("P25_REFRESH_SALE_CALL", "Y");
                        }
                        if ($v("P25_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
                            //ASA-1812 Refresh Item Dimension. Issue 3
                            await itemDimUpdate(g_pog_index);
                        }
                        removeLoadingIndicator(regionloadWait); //ASA-1500
                        render(0);
                        animate_all_pog();
                    }
                    doSomething();
                });
                //Task_29818 - End
            } else {
                $s("P25_OPEN_POG", "Y");
                $s("P25_OPEN_POG_CODE", pog_code_list[0]);
                $s("P25_OPEN_POG_VERSION", pog_version_list[0]);
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
                    if ($v("P25_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[0].NewPOG != "Y") {
                        //ASA-1803 Issue 3, 9
                        await refresh_sales_data(13, "", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", pog_code_list[0], pog_code_list[0], "N", g_pog_index, "Y");
                        $s("P25_REFRESH_SALE_CALL", "Y");
                    }
                    if ($v("P25_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
                        //ASA-1812 Refresh Item Dimension. Issue 3
                        await itemDimUpdate(g_pog_index);
                    }
                    removeLoadingIndicator(regionloadWait); //ASA-1500
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
                                alert(get_message("POGCR_MAX_MOD_ERR", $v("P25_POGCR_MAX_MOD_OPEN")));
                            } else {
                                for (const r of real_pog_list) {
                                    if (r == "N") {
                                        is_real_pog == "N";
                                    }
                                }
                                sessionStorage.setItem("pog_code_list", JSON.stringify(pog_code_list));
                                $s("P25_OPEN_POG", "Y");
                                $s("P25_OPEN_POG_CODE", pog_code_list[0]);
                                $s("P25_OPEN_POG_VERSION", pog_version_list[0]);
                                i = 0;
                                var rec_detail = [];
                                for (const r of pog_code_list) {
                                    selectedIds += pog_code_list[i] + ":";
                                    i++;
                                }
                                $s("P25_SELECTED_RECORDS", selectedIds);
                                g_pog_index = 0;
                                g_multi_pog_json = [];
                                appendMultiCanvasRowCol(pog_code_list.length, $v("P25_POGCR_TILE_VIEW"));
                                switchCanvasView($v("P25_POGCR_TILE_VIEW"), "Y"); // Task-22510
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
                                    if ($v("P25_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[j].NewPOG != "Y") {
                                        //ASA-1803 Issue 3, 9
                                        await refresh_sales_data(13, "", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", pog_code_list[j], pog_code_list[j], "N", g_pog_index, "Y"); //ASA-1803 Issue 11
                                        $s("P25_REFRESH_SALE_CALL", "Y");
                                    }
                                    if ($v("P25_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
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
                                    var retval = await get_all_images(0, g_get_orient_images, "Y", $v("P25_POGCR_IMG_MAX_WIDTH"), $v("P25_POGCR_IMG_MAX_HEIGHT"), $v("P25_IMAGE_COMPRESS_RATIO"));
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
                                            var return_val = await recreate_image_items("Y", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
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
                    $s("P25_SELECTED_RECORDS", selectedIds);
                    i = 0;
                    for (const r of pog_code_list) {
                        if (i == 0) {
                            rec_detail.push(r);
                        } else {
                            var return_val = await open_in_new_tab(r, pog_version_list[i], "", "", "", $v("P25_SELECTED_RECORDS"));
                        }
                        i = i + 1;
                    }
                    if (rec_detail.length > 0) {
                        g_pog_index = 0;
                        g_multi_pog_json = [];
                        appendMultiCanvasRowCol(1);
                        $s("P25_OPEN_POG", "Y");
                        $s("P25_OPEN_POG_CODE", rec_detail[0]);
                        $s("P25_OPEN_POG_VERSION", pog_version_list[0]);
                        addLoadingIndicator(); //ASA-1500
                        await get_existing_pog(rec_detail[0], pog_version_list[0], 0, p_imageLoadInd);
                        //ASA-1803 Added for refresh sales.
                        if ($v("P25_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[0].NewPOG != "Y") {
                            //ASA-1803 Issue 3, 9
                            await refresh_sales_data(13, "", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", pog_code_list[0], pog_code_list[0], "N", g_pog_index, "Y");
                            $s("P25_REFRESH_SALE_CALL", "Y");
                        }
                        if ($v("P25_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
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

async function open_draft_pog(p_imageLoadInd = "N", p_draft_pog_list, p_open_attribute) {
    if (p_draft_pog_list !== null) {
        var records = JSON.parse(p_draft_pog_list);
        var open_attr = p_open_attribute;
    }
    g_pog_json = [];
    //ASA-1129, Start
    sessionStorage.removeItem("g_combinedShelfs");
    sessionStorage.removeItem("combinedShlfDets");
    g_combinedShelfs = [];
    //ASA-1129, End
    $s("P25_EXISTING_DRAFT_VER", "");
    $s("P25_DRAFT_VERSION", "");
    draftPogInd = "D";
    if (g_show_live_image == "N") {
        g_show_live_image = $v("P25_POGCR_DFLT_LIVE_IMAGES");
        g_show_live_image = $v("P25_POGCR_DFLT_LIVE_IMAGES");
        g_imagesShown = "N";
    }
    if (g_compare_pog_flag == "Y" && g_compare_view == "POG" && g_show_live_image == "N") {
        g_show_live_image = $v("P25_POGCR_DFLT_LIVE_IMAGES");
        g_imagesShownComp = "N";
    }
    var rec_detail = [];
    g_scene_objects = [];
    g_canvas_objects = [];
    appendMultiCanvasRowCol(1, $v("P25_POGCR_TILE_VIEW"));
    (g_pog_json = []),
        (g_scene_objects_backup = []),
        (g_pogjson_backup = []),
        (g_pogjson_data_backup = []);
    $("#canvas-list-holder").html("");
    for (const l_rec of records) {
        rec_detail.push(parseInt(l_rec.SequenceID));
    }

    if (records.length == 1) {
        $(".save_template").css("display", "block");
        $("#pog_list_btn").css("display", "none");
        $("#chng_view_btn").css("display", "none");
        $(".add_pog").css("display", "block");
        $(".open_par").css("display", "block"); //ASA-1587

        var pog_sequence_id = records[0].SequenceID;
        var desc = records[0].DescriptionDetails;
        var pog_desc = records[0].Description; //ASA-1765

        $s("P25_DRAFT_LIST", pog_sequence_id);
        $s("P25_POG_DESCRIPTION", pog_desc);
        var draftVer = records[0].DraftVersion;
        $s("P25_EXISTING_DRAFT_VER", draftVer);
        sessionStorage.setItem("P25_EXISTING_DRAFT_VER", draftVer);
        addLoadingIndicator(); //ASA-1500
        await get_json_data([$v("P25_DRAFT_LIST")], "N", pog_desc); //ASA-1765
        //ASA-1803 Added for refresh sales.
        if ($v("P25_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[0].NewPOG != "Y") {
            //ASA-1803 Issue 9
            await refresh_sales_data(13, "", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", desc, desc, "N", g_pog_index, "Y");
            $s("P25_REFRESH_SALE_CALL", "Y");
        }
        if ($v("P25_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
            //ASA-1812 Refresh Item Dimension. Issue 4
            await itemDimUpdate(g_pog_index);
        }
        removeLoadingIndicator(regionloadWait); //ASA-1500
        upload_file_flag = "N";
    } else {
        $("#pog_list_btn").css("display", "block");
        $("#chng_view_btn").css("display", "block");
        $(".add_pog").css("display", "block");
        $(".open_par").css("display", "block"); //ASA-1587
        var result = records.map(function (a) {
            return Object.values(a)[0];
        });
        var seq_list = result.join(":");

        if (open_attr == "M") {
            if (rec_detail.length > 1) {
                apex.server.process(
                    "CHECK_MOD_COUNT", {
                    x01: "D",
                    x02: seq_list,
                }, {
                    dataType: "text",
                    success: async function (pData) {
                        if ($.trim(pData) != "") {
                            alert(get_message("POGCR_MAX_MOD_ERR", $v("P25_POGCR_MAX_MOD_OPEN")));
                        } else {
                            var pog_sequence_id = records[0].SequenceID;
                            var desc = records[0].DescriptionDetails;
                            $s("P25_DRAFT_LIST", pog_sequence_id);
                            $s("P25_POG_DESCRIPTION", pog_desc);
                            var draftVer = records[0].DraftVersion;
                            $s("P25_EXISTING_DRAFT_VER", draftVer);
                            sessionStorage.setItem("P25_EXISTING_DRAFT_VER", draftVer);
                            addLoadingIndicator(); //ASA-1500
                            await get_json_data(rec_detail, p_imageLoadInd, pog_desc); //ASA-1765
                            //ASA-1803 Added for refresh sales.
                            if ($v("P25_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[0].NewPOG != "Y") {
                                //ASA-1803 Issue 9
                                await refresh_sales_data(13, "", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", desc, desc, "N", g_pog_index, "Y");
                                $s("P25_REFRESH_SALE_CALL", "Y");
                            }
                            if ($v("P25_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
                                //ASA-1812 Refresh Item Dimension. Issue 4
                                await itemDimUpdate(g_pog_index);
                            }
                            removeLoadingIndicator(regionloadWait); //ASA-1500
                            upload_file_flag = "N";
                        }
                    },
                    loadingIndicatorPosition: "page",
                });
            }
        } else {
            if (records.length > 15) {
                alert(get_message("POGCR_MAX_TAB_MESS", "15"));
            } else {
                i = 0;
                var rec_detail = [];
                for (const l_rec of records) {
                    if (i == 0) {
                        rec_detail.push(l_rec);
                    } else {
                        var pog_sequence_id = l_rec.SequenceID;
                        var desc = l_rec.DescriptionDetails;
                        var draftVer = l_rec.DraftVersion;
                        $s("P25_DRAFT_LIST", pog_sequence_id);
                        $s("P25_POG_DESCRIPTION", pog_desc);
                        $s("P25_EXISTING_DRAFT_VER", draftVer);
                        var return_val = await open_in_new_tab("", "", pog_sequence_id, desc, draftVer);
                    }
                    i = i + 1;
                }
                if (rec_detail.length > 0) {
                    var pog_sequence_id = rec_detail[0].SequenceID;
                    var desc = rec_detail[0].DescriptionDetails;
                    var draftVer = rec_detail[0].DraftVersion;
                    $s("P25_DRAFT_LIST", pog_sequence_id);
                    $s("P25_POG_DESCRIPTION", pog_desc);
                    $s("P25_EXISTING_DRAFT_VER", draftVer);
                    sessionStorage.setItem("P25_EXISTING_DRAFT_VER", draftVer);
                    addLoadingIndicator(); //ASA-1500
                    await get_json_data([$v("P25_DRAFT_LIST")], p_imageLoadInd, pog_desc); //ASA-1765
                    //ASA-1803 Added for refresh sales.
                    if ($v("P25_AUTO_REFRESH_SALES_FOR_POG") == "Y" && g_pog_json[0].NewPOG != "Y") {
                        //ASA-1803 Issue 9
                        await refresh_sales_data(13, "", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label, g_show_days_of_supply, "N", "N", "N", desc, desc, "N", g_pog_index, "Y");
                        $s("P25_REFRESH_SALE_CALL", "Y");
                    }
                    if ($v("P25_POGCR_ITEM_DIM_AUTO_REFRESH") == "Y") {
                        //ASA-1812 Refresh Item Dimension. Issue 4
                        await itemDimUpdate(g_pog_index);
                    }
                    removeLoadingIndicator(regionloadWait); //ASA-1500
                    upload_file_flag = "N";
                }
            }
        }
    }
}

function render_scene(p_time) {
    p_time *= 0.001;
    g_scene_objects[0].camera.aspect = 600 / 600;
    g_scene_objects[0].camera.updateProjectionMatrix();
    g_renderer.setScissorTest(true);
    g_renderer.setScissor(0, 0, 600, 600);
    g_renderer.setViewport(0, 0, 600, 600);
    g_renderer.render(g_scene_objects[0].scene, g_scene_objects[0].camera);
    g_scene_objects[2].camera.aspect = 600 / 600;
    g_scene_objects[2].camera.updateProjectionMatrix();
    g_renderer.setScissor(500, 0, 600, 600);
    g_renderer.setViewport(500, 0, 600, 600);
    g_renderer.render(g_scene_objects[2].scene, g_scene_objects[2].camera);
    requestAnimationFrame(render);
}

function get_existing_data(p_pog_code, p_pog_version) {
    return new Promise(function (resolve, reject) {
        var p = apex.server.process(
            "GET_EXISTING_POG", {
            x01: p_pog_code,
            x02: p_pog_version,
        }, {
            dataType: "html",
        });
        // When the process is done, set the value to the page item
        p.done(function (data) {
            var processed = "Y";
            var return_data = $.trim(data);
            try {
                var p_json = JSON.parse($.trim(data));
            } catch {
                processed = "N";
            }
            if (processed == "N") {
                raise_error(return_data);
                resolve("");
            } else if (return_data !== "") {
                resolve(p_json);
            }
        });
    });
}

function init_first() {
    try {
        g_canvas_region = document.getElementById("drawing_region");
        g_selection = document.getElementById("selection");
        renderer = new THREE.WebGLRenderer({
            canvas: g_canvas,
            alpha: true,
        });
    } catch (e) {
        document.getElementById("canvas-holder").innerHTML = "<p><b>Sorry, an error occurred:<br>" + e + "</b></p>";
        return;
    }

    g_raycaster = new THREE.Raycaster();
    g_renderer.setClearColor(0xffffff);
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
    var product_region = document.getElementById("draggable_table");
    if (devicePixelRatio > 2.5) {
        g_windowHeight = window.innerHeight - (header_height + breadcrumb_height + padding + top_bar_height / 2);
        windowWidth = window.innerWidth - (side_nav_width + btn_cont_width + padding);
    } else {
        g_windowHeight = window.innerHeight; // + (top_bar_height / 2);
        windowWidth = window.innerWidth;
    }
    g_selection.style.visibility = "hidden";
    setUpMouseHander("maincanvas", doMouseDown, doMouseMove, doMouseUp, doMouseDoubleclick, renderer);
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

    if ($v("P25_DELETE_IND") == "Y" || $v("P25_EDIT_IND") == "Y") {
        g_renderer.domElement.addEventListener("contextmenu", onContextMenu, false);
    }
    g_renderer.domElement.addEventListener("mousewheel", onDocumentMouseWheel, false);
    window.addEventListener("click", function (event) {
        if ($(event.target).attr("class") !== "button-plus" && $(event.target).attr("class") !== "button-minus" && $(event.target).attr("class") !== "quantity-field") {
            document.getElementById("context-menu").classList.remove("active");
            g_context_opened = "N";
        }
        if (typeof $(event.path) !== "undefined") {
            if ($(event.path[1]).attr("class") == "t-Header-logo-link") {
                //console.log('yes');
                logo_clicked = "Y";
            } else {
                logo_clicked = "N";
            }
        }
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
}

function open_comp_pog() {
    try {
        logDebug("function : open_comp_pog ; ", "S");
        if (($v("P25_COMPARE_WITH") == 1 && $v("P25_COMP_OPEN_POG_CODE") == "") || ($v("P25_COMPARE_WITH") == 2 && $v("P25_COMP_DRAFT_LIST") == "")) {
            alert(g_atleast_one_pog);
        } else {
            if ($v("P25_COMP_OPEN_POG_CODE") !== null) {
                $s("P25_OPEN_POG", "Y");
            } else {
                $s("P25_OPEN_DRAFT", "Y");
            }
            curr_canvas = 2;
            g_compare_pog_flag = "Y";
            if (g_compare_pog_flag == "Y" && g_compare_view == "POG" && g_show_live_image == "N") {
                g_show_live_image = $v("P25_POGCR_DFLT_LIVE_IMAGES");
                g_show_live_image = "N";
            }
            get_compare_pog($v("P25_COMPARE_WITH"), $v("P25_COMP_OPEN_POG_CODE"), $v("P25_COMP_OPEN_POG_VERSION"), $v("P25_COMP_DRAFT_LIST"));
            closeInlineDialog("open_comp_pog");
        }
        logDebug("function : open_comp_pog ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function load_pog() {
    try {
        logDebug("function : load_pog ; ", "S");
        var process_name;
        var pog_opened;
        process_name = "GET_EXISTING_POG";
        pog_opened = "E";
        var old_pog_index = g_pog_index;
        var pog_code = g_pog_json[g_pog_index].POGCode;
        var pog_version = g_pog_json[g_pog_index].Version;
        $s("P25_OPEN_POG_VERSION", g_pog_json[g_pog_index].Version);
        var p = apex.server.process(
            process_name, {
            x01: g_pog_json[g_pog_index].POGCode,
            x02: g_pog_json[g_pog_index].Version,
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
                g_pog_json_data = g_json;
                g_module_obj_array = [];
                $(".live_image").css("color", "#c7c7c7").removeAttr("onclick").css("cursor", "auto");
                var temp_json = JSON.parse(JSON.stringify(g_pog_json));
                temp_json[g_pog_index] = g_json[0];

                async function doSomething() {
                    init(g_pog_index);
                    g_scene_objects[g_pog_index].scene = g_scene;
                    g_scene_objects[g_pog_index].renderer = g_renderer;
                    g_camera = g_scene_objects[g_pog_index].scene.children[0];
                    g_world = g_scene_objects[g_pog_index].scene.children[2];
                    console.log("pog json", g_pog_json_data, g_scene_objects, g_scene, g_renderer);
                    //  await refresh_sales_data($v("P25_WEEK_SELECTION"), $v("P25_STORE"), $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"),$v('P25_POGCR_ITEM_DETAIL_LIST'), g_show_days_of_supply, "N", "N", "N",g_pog_json[g_pog_index].POGCode, g_pog_json[g_pog_index].POGCode, g_pog_index); //ASA-1400
                    temp_json[g_pog_index].SalesInfo = JSON.parse(JSON.stringify(g_pog_json[g_pog_index].SalesInfo)); //ASA-1400
                    var return_val = await create_module_from_json(temp_json, "N", "F", "N", pog_opened, "N", "Y", "Y", "Y", pog_version, "Y", g_scene_objects[g_pog_index].scene.children[0], g_scene_objects[g_pog_index].scene, g_pog_index, g_pog_index, "N", "N", []);
                    g_pog_index = old_pog_index;
                    //g_scene = g_scene_objects[g_pog_index].scene;
                    //g_camera = g_scene_objects[g_pog_index].scene.children[0];
                    //g_renderer = g_scene_objects[g_pog_index].renderer;
                    //g_world = g_scene_objects[g_pog_index].scene.children[2];
                    console.log("pog json after loop ", g_pog_json, g_pog_index, g_scene_objects[g_pog_index].scene.children[2]);
                }
                doSomething();
                g_pog_json_data = [];
                g_dblclick_opened = "N";
                if ($v("P25_PDF_TEMPLATE") !== "") {
                    document.cookie = "PDF_TEMPLATE=" + $v("P25_BU_ID") + "$$$" + $v("P25_PDF_TEMPLATE") + "; max-age=31536000;";
                }
            }
        });
        logDebug("function : load_pog ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function save_edit_location(p_pog_index) {
    try {
        logDebug("function : save_edit_location ; ", "S");
        var newx = 0,
            newy = 0,
            newz = 0,
            fixel_notch = 0;

        var g_shelf_object_type = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ObjType;
        var l_shelf_ManualZ = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ManualZupdate; //ASA-2029.1.4
        newx = parseFloat($v("P25_X_LOCATION")) / 100 + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].W / 2;
        newy = parseFloat($v("P25_Y_LOCATION")) / 100 + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].H / 2; //ASA-1290 should take bottom of shelf+ g_pog_json[p_pog_index].BaseH;
        if (g_item_index === "" || typeof g_item_index === "undefined" || g_item_index == -1) {
            if (g_shelf_object_type !== "TEXTBOX") {
                newz = parseFloat($v("P25_Z_LOCATION")) / 100 + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].D / 2;
            } else {
                newz = parseFloat($v("P25_Z_LOCATION")) / 100;
            }
            if ($v("P25_LOCATION_CNG") == "N") {
                fixel_notch = parseFloat($v("P25_FIXEL_NOTCH"));
            } 
            if (g_edit_textboxZ == newz && l_shelf_ManualZ !=="Y") { //ASA-2029.1.4
                var returnval = update_edit_location(newx, newy, newz, g_module_index, g_shelf_index, fixel_notch, "Y", g_camera, p_pog_index,"N");
            }
            else{
                var returnval = update_edit_location(newx, newy, newz, g_module_index, g_shelf_index, fixel_notch, "Y", g_camera, p_pog_index,"Y");
            }          
        } else {
            //ASA-1085
            var shelf_detail = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
            var item_detail = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Item;
            var old_x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X;
            var old_y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y;
            var validate = "Y";
            if (item_detail == "DIVIDER") {
                newx = $v("P25_X_LOCATION") / 100 + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].W / 2;
                newy = $v("P25_Y_LOCATION") / 100 + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].H / 2 + g_pog_json[p_pog_index].BaseH;
                var shelfstart = shelf_detail.X - shelf_detail.W / 2;
                var shelfend = shelf_detail.X + shelf_detail.W / 2;
                var shelftop = shelf_detail.Y + shelf_detail.H / 2;
                var shelfbtm = shelf_detail.Y - shelf_detail.H / 2;
                var divtop = newy + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].H / 2;
                var divbtm = newy - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].H / 2;
                if (newx < old_x) {
                    if (newx < shelfstart) {
                        validate = "N";
                    } else {
                        validate = "Y";
                    }
                }
                if (newx > old_x && validate == "Y") {
                    if (newx > shelfend) {
                        validate = "N";
                    } else {
                        validate = "Y";
                    }
                }
                if (old_y < newy && validate == "Y") {
                    var min_distance_arr = [];
                    var min_index_arr = [];
                    var min_module_index = [];
                    var item_btm_arr = [];
                    var l_mod_cnt = 0;
                    var mod_details = g_pog_json[p_pog_index].ModuleInfo;
                    for (const mod of mod_details) {
                        var l_shelf_cnt = 0;
                        for (const shelfs of mod.ShelfInfo) {
                            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                                var div_shelf_start = shelfs.X - shelfs.W / 2;
                                var div_shelf_end = shelfs.X + shelfs.W / 2;
                                if (shelf_detail.Y < shelfs.Y && ((div_shelf_end > shelfstart && div_shelf_start <= shelfstart) || (div_shelf_start < shelfend && div_shelf_start >= shelfstart))) {
                                    min_distance_arr.push(shelfs.Y - shelfs.H / 2 - (shelf_detail.Y + shelf_detail.H / 2));
                                    min_index_arr.push(l_shelf_cnt);
                                }
                            }
                            l_shelf_cnt++;
                        }
                        l_mod_cnt++;
                    }
                    var min_distance = Math.min.apply(Math, min_distance_arr);
                    var index = min_distance_arr.findIndex(function (number) {
                        return number == min_distance;
                    });
                    if (min_distance_arr.length != 0) {
                        if (g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].ObjType == "HANGINGBAR" || g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].ObjType == "ROD") {
                            var itemdtls = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].ItemInfo;
                            var i = 0;
                            for (const item of itemdtls) {
                                item_btm_arr.push(wpdSetFixe(item.Y - item.H / 2)); //.toFixed(3)));
                                min_index_arr.push(i);
                                i++;
                            }
                            var max_bottom = Math.min.apply(Math, item_btm_arr);
                            var index = item_btm_arr.findIndex(function (number) {
                                return number == max_bottom;
                            });
                            if (max_bottom > divtop) {
                                validate = "Y";
                            } else {
                                validate = "N";
                            }
                        } else {
                            var near_shelf = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].Y - g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].H / 2;
                            if (near_shelf > divtop) {
                                validate = "Y";
                            } else {
                                validate = "N";
                            }
                        }
                    } else {
                        validate = "Y";
                    }
                }
                if (old_y > newy && validate == "Y") {
                    if (divbtm < shelftop) {
                        validate = "N";
                    } else {
                        validate = "Y";
                    }
                }
                var cnfrm = "Y";
                //ASA-1361 20240501
                // if ($v("P25_POGCR_COMBINATION_SHELF") == "Y") {
                cnfrm = await getconfirm_shelfmove(p_pog_index);
                // }
                if (validate == "Y" && cnfrm == "Y") {
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].Combine = "N"; //ASA-1129
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X = newx;
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y = newy;
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].YDistance = newy - shelftop;
                    var selectedObject = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].ObjID);
                    selectedObject.position.set(newx, newy);
                    var return_val = await recreate_all_items(g_module_index, g_shelf_index, shelf_detail.ObjType, "N", -1, -1, shelf_detail.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, "N", p_pog_index, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters
                    render(p_pog_index);
                } else {
                    alert(get_message("POGCR_VALIDATE_DIVIDER"));
                }
                closeInlineDialog("edit_location_modal");
            } else {
                //ASA-1300
                var shelf_detail = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index];
                var item_detail = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index];
                var old_item_info = JSON.parse(JSON.stringify(item_detail));
                var old_x = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].X;
                var old_y = g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].Y;
                var validate = "Y";
                newx = $v("P25_X_LOCATION") / 100 + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].W / 2;
                newy = $v("P25_Y_LOCATION") / 100 + g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index].H / 2;
                var horiz_gap = shelf_detail.HorizGap;
                var old_auto_placing = shelf_detail.AutoPlacing;
                shelf_detail.AutoPlacing = "N";
                item_detail.Edited = "Y";
                item_detail.Y = newy;
                item_detail.Exists = "N";
                item_detail.X = newx;
                item_detail.DropY = newx;
                item_detail.FromProductList = "N";

                var return_val = find_pegboard_gap(item_detail.W, item_detail.H, newx, newy, horiz_gap, g_module_index, g_shelf_index, g_item_index, g_item_index, "Y", p_pog_index, "Y", g_auto_x_space, g_auto_y_space); //ASA-1300 added g_auto_x_space,g_auto_y_space
                shelf_detail.AutoPlacing = old_auto_placing;
                if (return_val !== "N") {
                    shelf_detail.ItemInfo[g_item_index].X = newx;
                    shelf_detail.ItemInfo[g_item_index].Y = newy;
                    shelf_detail.ItemInfo[g_item_index].YDistance = newy - (shelf_detail.Y + shelf_detail.H / 2);
                    var selectedObject = g_world.getObjectById(shelf_detail.ItemInfo[g_item_index].ObjID);
                    selectedObject.position.set(newx, newy);
                    render(p_pog_index);
                    if (shelf_detail.ObjType == "CHEST" && g_chest_as_pegboard == "Y") {
                        //Bug-26122 - splitting the chest
                        shelf_detail.ChestEdit = "Y";
                    }
                } else {
                    g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index].ItemInfo[g_item_index] = old_item_info;
                    alert(get_message("POGC_CHEST_SPACE_VALID", shelf_detail.Shelf));
                }
                closeInlineDialog("edit_location_modal");
            }
        }
        g_dblclick_opened = "N";
        logDebug("function : save_edit_location ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function save_fixel_detail() {
    try {
        logDebug("function : save_fixel_detail ; ", "S");
        apex.region("fixel_details").widget().interactiveGrid("getActions").set("edit", false);
        var model = apex.region("fixel_details").widget().interactiveGrid("getViews", "grid").model;
        var fixel_info_arr = [];
        model.forEach(function (record) {
            fixel_info_arr.push({
                moduleIndex: model.getValue(record, "MODULE_NAME"),
                shelfId: model.getValue(record, "SHELF_ID").toUpperCase(),
            });
        });

        var countMap = {};
        fixel_info_arr.forEach(function (fixel) {
            //code modified to check the validation of unique component within the module
            const key = `${fixel.moduleIndex}-${fixel.shelfId}`;
            countMap[key] = (countMap[key] || 0) + 1;
        });

        var duplicates = fixel_info_arr.filter(function (fixel) {
            const key = `${fixel.moduleIndex}-${fixel.shelfId}`;
            return countMap[key] > 1;
        });

        if (duplicates.length > 0) {
            alert(get_message("COMPONENT_UNIQUE_ID"));
        } else {
            g_scene = g_scene_objects[g_pog_index].scene;
            g_camera = g_scene_objects[g_pog_index].scene.children[0];
            g_renderer = g_scene_objects[g_pog_index].renderer;
            g_world = g_scene_objects[g_pog_index].scene.children[2];
            await fixel_update(model, g_camera, g_pog_index);
            await set_shelf_item_index(g_pog_index);
            POG_json = JSON.stringify([g_pog_json[g_pog_index]]);

            apex.server.process(
                "ADD_JSON_TO_COLL", {
                x01: "I",
                p_clob_01: POG_json,
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        raise_error(pData);
                    } else {
                        apex.region("fixel_details").widget().interactiveGrid("getActions").set("edit", false);
                        apex.region("fixel_details").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                        apex.region("fixel_details").refresh();
                        if (g_show_max_merch == "Y") {
                            async function doSomething() {
                                let result1 = await add_merch("Y", g_pog_index);
                            }
                            doSomething();
                        }
                    }
                },
                loadingIndicatorPosition: "page",
            });
        }
        logDebug("function : save_fixel_detail ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

function open_image_upld_popup() {
    try {
        logDebug("function : open_image_upld_popup ; ", "S");
        //ASA-1669 Start
        var width = $v("P25_TEXT_WIDTH"),
            height = $v("P25_TEXT_HEIGHT");
        if (g_multiselect == "Y" && (nvl(width) == 0 || nvl(height) == 0)) {
            for (const txtBox of g_delete_details) {
                if (txtBox.ObjType == "TEXTBOX") {
                    if (nvl(width) == 0) {
                        width = txtBox.W * 100;
                    }
                    if (nvl(height) == 0) {
                        height = txtBox.H * 100;
                    }
                    break;
                }
            }
        }
        //ASA-1669 End

        if (($v("P25_TEXT_HEIGHT") == "" || $v("P25_TEXT_WIDTH") == "" || $v("P25_TEXT_HEIGHT") == 0 || $v("P25_TEXT_WIDTH") == 0) && g_multiselect != "Y" /*ASA-1669*/) {
            alert(get_message("POGCR_TEXT_IMG_VALIDATE"));
        } else {
            $("#IMAGE_AREA canvas").remove();
            openInlineDialog("IMG_UPLOAD", 40, 45);
            if (g_temp_image_arr.length > 0) {
                $("#REMOVE_IMAGE").css("display", "inline");
                var image = new Image();
                image.src = "data:image/png;base64," + g_temp_image_arr[0].Image;
                image.onload = function () {
                    const l_canvas = document.createElement("canvas");
                    var l_new_canvas = get_curr_canvas();
                    var new_camera = get_canvas_camera("LABEL");
                    // const [newWidth, newHeight] = get_visible_size(0.012, parseFloat($v("P25_TEXT_WIDTH")) / 100, parseFloat($v("P25_TEXT_HEIGHT")) / 100, g_canvas_objects[g_pog_index], g_scene_objects[g_pog_index].scene.children[0]);   //ASA-1669
                    const [newWidth, newHeight] = get_visible_size(0.012, parseFloat(width) / 100, parseFloat(height) / 100, g_canvas_objects[g_pog_index], g_scene_objects[g_pog_index].scene.children[0]); //ASA-1669
                    l_canvas.width = newWidth;
                    l_canvas.height = newHeight;
                    const ctx = l_canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0, newWidth, newHeight);
                    $("#P25_IMG_FILENAME").removeClass("apex_disabled");
                    $s("P25_IMG_FILENAME", g_temp_image_arr[0].FileName);
                    $("#P25_IMG_FILENAME").addClass("apex_disabled");
                    $("#IMAGE_AREA canvas").remove();
                    document.getElementById("IMAGE_AREA").append(l_canvas);
                };
            } else {
                $("#REMOVE_IMAGE").css("display", "none");
            }
        }
        logDebug("function : open_image_upld_popup ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

function set_selected_val() {
    try {
        logDebug("function : set_selected_val ; ", "S");
        var gridView = apex.region("ig_pog_list").widget().interactiveGrid("getViews").grid;

        var records = gridView.getSelectedRecords();
        var seq_id;
        var desc;
        var draftVer;
        $.each(records, function (i, r) {
            seq_id = gridView.model.getValue(r, "SEQUENCE_ID");
            desc = gridView.model.getValue(r, "DESCRIPTION");
            draftVer = gridView.model.getValue(r, "DRAFT_VERSION");
            $s("P25_DRAFT_LIST", seq_id);
            $s("P25_POG_DESCRIPTION", desc);
            $s("P25_EXISTING_DRAFT_VER", draftVer);
        });
        logDebug("function : set_selected_val ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function errored_item_cancel(p_pog_index) {
    try {
        logDebug("function : errored_item_cancel ; ", "S");
        g_dblclick_opened = "N";
        g_mselect_drag = "N";
        var i = 0;
        for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
            if (modules.ParentModule == null || modules.ParentModule == "undefined") {
                var j = 0;
                for (const shelfs of modules.ShelfInfo) {
                    if (typeof shelfs !== "undefined") {
                        if (shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "BASE" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].AllowAutoCrush = "N";
                        }
                    }
                    j = j + 1;
                }
            }
            i = i + 1;
        }

        await create_module_from_json(g_pog_json, sessionStorage.getItem("new_pog_ind"), "F", "N", sessionStorage.getItem("pog_opened"), "Y", "N", "Y", "N", "", "Y", g_scene_objects[p_pog_index].scene.children[0], g_scene_objects[p_pog_index].scene, g_pog_index, g_pog_index, "N");
        if (g_show_live_image == "Y") {
            animate_pog(p_pog_index);
        }

        logDebug("function : errored_item_cancel ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

function page_change_set_drag_prod_list() {
    try {
        logDebug("function : page_change_set_drag_prod_list ; ", "S");
        $("#draggable_table .a-GV-w-scroll tbody tr").attr("draggable", "true");
        $("#draggable_table .a-GV-w-scroll tbody tr").addClass("DraggableThings");

        $(".DraggableThings").draggable({
            containment: "window",
            opacity: 0.7,
            zIndex: 10000,
            appendTo: "body",
            cursor: "all-scroll",
            start: function (e, ui) {
                offsetX = e.clientX - ui.offset.left + $(".t-Region-body").scrollLeft();
                offsetY = e.clientY - ui.offset.top + $(document).scrollTop();
            },
            drag: function (e, ui) {
                ui.position.left += e.clientX - ui.offset.left - Math.floor(ui.helper.outerWidth() / 2); //ASA-1766 Task 3
                ui.position.top += offsetY - Math.floor(ui.helper.outerHeight() / 2);
            },
            helper: function () {
                if (g_open_productlist == "D") {
                    //ASA-1108
                    g_open_productlist = "Y";
                }
                var selected = $(".DraggableThings .a-GV-w-scroll tr.selected").find("td:first");
                if (selected.length === 0) {
                    selected = $(this).addClass("selected");
                    $(this).addClass("selected");
                }
                var selected = $("#draggable_table .a-GV-w-scroll tr.selected").find("td:first");
                var container = $('<div id="draggingContainer"></div>');

                //ASA-1766 Issue 1
                var productColIndex = $("#draggable_table thead th")
                    .filter(function () {
                        return $(this).text().trim().toLowerCase() === "product";
                    })
                    .index();
                var new_selected = selected.closest("tr").find("td:eq(" + productColIndex + ")");

                var model = apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model;

                for (var i = 0; i < new_selected.length; i++) {
                    myNewRecord = model.getRecord(new_selected[i].innerHTML);
                    var width = parseFloat(model.getValue(myNewRecord, "ITEM_WIDTH")) / 100;
                    var height = parseFloat(model.getValue(myNewRecord, "ITEM_HEIGHT")) / 100;
                    var depth = parseFloat(model.getValue(myNewRecord, "ITEM_DEPTH")) / 100;
                    var orientation = model.getValue(myNewRecord, "ORIENTATION");
                    var [width, height, depth] = get_new_orientation_dim(orientation, width, height, depth);

                    const [visible_width, visible_height] = get_visible_size(0.012, width, height, g_canvas, g_camera);
                    var new_container = $('<div id="draggingContainer' + i + '"></div>');
                    new_container
                        .css("border", "1px solid #101010")
                        .css("width", visible_width + "px")
                        .css("height", visible_height + "px")
                        .css("background-color", "transparent");
                    new_container.text(new_selected[i].innerHTML);
                    container.append(new_container);
                    g_product_list_drag = "Y";
                }

                return container;
            },
        });

        $(".DraggableThings").click(function () {
            var currenttr = $(this);
            var select_object = [];
            if (window.event.shiftKey) {
                var return_val = selectRowsBetweenIndexes([g_lastSelectedRow.index(), currenttr.index()]);
            } else if (window.event.ctrlKey) {
                g_lastSelectedRow = currenttr;
                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                } else {
                    $(this).addClass("selected");
                }
            } else {
                g_lastSelectedRow = currenttr;
                $("#draggable_table .a-GV-w-scroll tr.selected").removeClass("selected");
                $(this).addClass("selected");
            }
            var select_object = $("#draggable_table .a-GV-w-scroll tr.selected");
            if (typeof select_object !== "undefined") {
                set_item_blink(select_object);
                g_productselect = "Y";
            }
            setTimeout(function () {
                $("#draggable_table_ig_grid_vc_status").html(apex.lang.formatMessage("APEX.GV.SELECTION_COUNT", $(".DraggableThings.selected").length));
            }, 200);
        });
        apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", true);
        if (apex.region("draggable_table") !== null) {
            if (apex.region("draggable_table").call("getActions").get("change-rows-per-page") !== 500) {
                apex.region("draggable_table").call("getActions").set("change-rows-per-page", 500);
            }
        }
        logDebug("function : page_change_set_drag_prod_list ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

function highlight_fixel(p_this) {
    try {
        logDebug("function : highlight_fixel ; ", "S");
        if (p_this.data !== null) {
            if (typeof p_this.data.selectedRecords !== "undefined" && p_this.data.selectedRecords !== null) {
                var model = p_this.data.model;
                if (g_intersected) {
                    for (var i = 0; i < g_intersected.length; i++) {
                        if (typeof g_intersected[i] !== "undefined") {
                            g_intersected[i].WireframeObj.material.color.setHex(0x000000);
                        }
                    }
                    clearInterval(g_myVar);
                    render(g_pog_index);
                }
                g_intersected = [];

                for (i = 0; i < p_this.data.selectedRecords.length; i++) {
                    var selectedObject = g_scene_objects[g_pog_index].scene.children[2].getObjectById(parseInt(model.getValue(p_this.data.selectedRecords[i], "SHELF_OBJID")));
                    g_intersected.push(selectedObject);
                }
                render_animate_selected();
            }
        }
        logDebug("function : highlight_fixel ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function set_auto_facings_all(p_moduleIndex, p_shelfIndex, p_itemIndex, p_itemList, p_facingType, p_facingsOf, p_itemType, p_pog_index) {
    logDebug("function : set_auto_facings_all; moduleIndex : " + p_moduleIndex + "; ShelfIndex : " + p_shelfIndex + "; itemIndex : " + p_itemIndex + "; facingType : " + p_facingType + "; facingsOf : " + p_facingsOf + "; itemType : " + p_itemType, "S");
    max_facings_allowed = $v("P25_POGCR_AUTO_MAX_VFACING");
    var vertFacingDefault = $v("P25_POGCR_DFLT_VERT_FACING");

    if (g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ObjType == "SHELF") {
        if (p_facingsOf == "S") {
            if (p_facingType == "D" || p_facingType == "B") {
                $.each(p_itemList, function (i, items) {
                    if (items.TopObjID !== "" && typeof items.TopObjID !== "undefined" && items.BottomObjID !== "" && typeof items.BottomObjID !== "undefined") { }
                    else {
                        var depth_facing = 1;
                        var real_depth = items.RD / items.BaseD;
                        depth_facing = Math.floor((g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].D * 100) / (real_depth * 100));
                        var l_dfacing = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings; //ASA-1408
                        depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874,//ASA-1407
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[i].D = real_depth * (depth_facing > 0 ? depth_facing : 1);
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[i].BaseD = depth_facing > 0 ? depth_facing : 1;
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[i].RD = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[i].D;
                    }
                });
            }
            if (p_facingType == "H" || p_facingType == "B") {
                var modules = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex];
                var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
                var max_merch = get_shelf_max_merch(modules, shelfs, p_moduleIndex, p_shelfIndex, p_pog_index, parseFloat($v("P25_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload
                $.each(p_itemList, function (j, items) {
                    if (items.TopObjID !== "" && typeof items.TopObjID !== "undefined" && items.BottomObjID !== "" && typeof items.BottomObjID !== "undefined") { }
                    else {
                        var real_height = items.RH / items.BVert;
                        var vert_facing = Math.floor((max_merch * 100) / (real_height * 100));
                        var l_max_vfacing = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings; //ASA-1408
                        var new_facings = l_max_vfacing < max_facings_allowed && l_max_vfacing > -1 ? l_max_vfacing : max_facings_allowed; //ASA-874 ,//ASA-1408
                        if (vert_facing > new_facings) {
                            vert_facing = new_facings;
                        }
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[j].H = real_height * (vert_facing > 0 ? vert_facing : 1);
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[j].BVert = vert_facing > 0 ? vert_facing : 1;
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[j].Y = shelfs.Y + shelfs.H / 2 + g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[j].H / 2;
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[j].RH = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[j].H;
                    }
                });
            }
            // };
        }
    }
    logDebug("function : set_auto_facings_all", "E");
}

async function open_update_item_info() {
    if (g_all_pog_flag == "Y" && g_pog_json.length > 1) {
        $s("P25_OPEN_POG_CODE", "");
        $s("P25_OPEN_POG_VERSION", "");
    }
    l_version = g_pog_json[g_pog_index].DraftVersion;
    $s('P25_DRAFT_VERSION', l_version); //ASA-1999-3 Issue 22
    var pogcr_item_info_cols = "," + $v("P25_POGCR_ITEM_INFO_COLS") + ",";
    var updateColor = pogcr_item_info_cols.indexOf(",ITEM_COLOR,");
    if (updateColor !== -1) {
        await updateItemColorCollection();
    }
    openInlineDialog("upd_reg_mov", 65, 60);
    // loadAllRecords('item_pog_info', true);
    apex.region("item_pog_info").widget().interactiveGrid("getActions").set("edit", false);
    apex.region("item_pog_info").widget().interactiveGrid("getViews", "grid").model.clearChanges();
    apex.region("item_pog_info").refresh();
}

async function updateItemColorCollection() {
    var colorArr = [];
    var p = 0;
    for (pog of g_pog_json) {
        var module_details = pog.ModuleInfo;
        var m = 0;
        for (const modules of module_details) {
            if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                var l_shelf_details = modules.ShelfInfo;
                var s = 0;
                for (const shelfs of l_shelf_details) {
                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                        if (shelfs.ItemInfo.length > 0) {
                            var item_Details = shelfs.ItemInfo;
                            var i = 0;
                            for (const items of item_Details) {
                                const itemKey = g_pog_json[p].ModuleInfo[m].ShelfInfo[s].ItemInfo[i].Item;
                                if (items.Item !== "DIVIDER") {
                                    if (!colorArr.some((item) => item.Item === itemKey)) {
                                        //ASA 1444 S
                                        var dtls = {};
                                        dtls["Item"] = itemKey;
                                        dtls["Color"] = g_pog_json[p].ModuleInfo[m].ShelfInfo[s].ItemInfo[i].Color;
                                        dtls["POGCode"] = g_pog_json[p].POGCode;
                                        colorArr.push(dtls);
                                    } //ASA 1444 E
                                }
                                i++;
                            }
                        }
                    }
                    s++;
                }
            }
            m++;
        }
        p++;
    }
    apex.server.process(
        "UPDATE_ITEM_COLOR_COLL", {
        p_clob_01: JSON.stringify(colorArr),
    }, {
        dataType: "text",
        success: async function (pData) {
            console.log("pData", pData);
        },
        loadingIndicatorPosition: "page",
    });
}

function itemInfoUpdate(p_model, p_showDaysOfSupply, p_itemInfoCols, p_item_seq, p_item_regmov, p_item_days_of_supply, p_item_wk_count, p_item_cogs_adj, p_item_gp, p_item_avg_sales, p_itemImported, p_items, p_pog_index, p_pogCodeList, p_pogVersList, p_itemColor, p_item_back_support, p_item_condition, p_item_divider, p_item_pusher, p_imported = 'N') { //ASA-1889 Added new 3 param ASA-1999
    //ASA-1385, remove p_itemdepth, p_itemremark
    logDebug("function : itemInfoUpdate; pModel : " + p_model + "; pShowDaysOfSupply : " + p_showDaysOfSupply + "; pItemInfoCols : " + p_itemInfoCols + "; item_seq : " + p_item_seq + "; item_regmov : " + p_item_regmov + "; item_days_of_supply : " + p_item_days_of_supply + "; item_wk_count : " + p_item_wk_count + "; item_cogs_adj : " + p_item_cogs_adj + "; item_gp : " + p_item_gp + "; item_avg_sales : " + p_item_avg_sales + "; pItemImported : " + p_itemImported + "; p_pog_index : " + p_pog_index, "S");
    try {
        var regMovPresent = p_itemInfoCols.indexOf(",REG_MOV,"),
            wkCountPresent = p_itemInfoCols.indexOf(",WK_COUNT,"),
            cogsAdjPresent = p_itemInfoCols.indexOf(",COGS_ADJ,"),
            grossProfitPresent = p_itemInfoCols.indexOf(",GROSS_PROFIT,"),
            avgSalesPresent = p_itemInfoCols.indexOf(",AVG_SALES,"),
            //depth = p_itemInfoCols.indexOf(",ITEM_DEPTH,"),//ASA-1385
            //remarks = p_itemInfoCols.indexOf(",ITEM_REMARKS,"),//ASA-1385
            itemColorPresent = p_itemInfoCols.indexOf(",ITEM_COLOR,"),
            itemBackSupportPresent = p_itemInfoCols.indexOf(",BACK_SUPPORT,"), //ASA-1889
            itemConditionPresent = p_itemInfoCols.indexOf(",ITEM_CONDITION,"), //ASA-1889
            itemDividerPresent = p_itemInfoCols.indexOf(",DIVIDER,"), //ASA-1889
            itemPusherPresent = p_itemInfoCols.indexOf(",PUSHER,"), //ASA-1999
            pog_items = [],
            item_exists = false,
            obj;
        let massDelistedItems = [];
        if (regMovPresent !== -1 || wkCountPresent !== -1 || cogsAdjPresent !== -1 || grossProfitPresent !== -1 || avgSalesPresent !== -1 || itemColorPresent !== -1 || itemBackSupportPresent !== -1 || itemConditionPresent !== -1 || itemDividerPresent !== -1 || itemPusherPresent !== -1) { //ASA-1889 1999
            return new Promise(async function (resolve, reject) {
                //identify if any change in POG
                g_pog_edited_ind = "Y";
                p_model.forEach(async function (record) {
                    var pog_code = $v('P25_OPEN_POG_CODE'); //p_model.getValue(record, "POG_CODE"); ASA-1931
                    var pog_version = p_model.getValue(record, "POG_VERSION");
                    var item = p_model.getValue(record, "ITEM");
                    var regMov = parseFloat(p_model.getValue(record, "REG_MOV"));
                    var wkCount = parseFloat(p_model.getValue(record, "WEEKS_COUNT"));
                    var cogsAdj = parseFloat(p_model.getValue(record, "COGS_ADJ"));
                    var grossProfit = parseFloat(p_model.getValue(record, "GROSS_PROFIT"));
                    var avgSales = parseFloat(p_model.getValue(record, "AVG_SALES"));
                    var chngRegmov = p_model.getValue(record, "CHNG_REGMOV");
                    var chngWkCount = p_model.getValue(record, "CHNG_WEEKS_COUNT");
                    var chngCogsAdj = p_model.getValue(record, "CHNG_COGS_ADJ");
                    var chngGrossProfit = p_model.getValue(record, "CHNG_GROSS_PROFIT");
                    var chagAvgSales = p_model.getValue(record, "CHNG_AVG_SALES");
                    //var chagitemdepth = p_model.getValue(record, "CHNG_ITEMDEPTH");//ASA-1385
                    //var chagitemremark = p_model.getValue(record, "CHNG_ITEMREMARKS");//ASA-1385
                    //var itemdepth = p_model.getValue(record, "ITEM_DEPTH_FACING");//ASA-1385
                    //var itemremark = p_model.getValue(record, "ITEM_REMARKS");//ASA-1385
                    var color = p_model.getValue(record, "ITEM_COLOR");
                    var chagItemColor = p_model.getValue(record, "CHNG_ITEMCOLOR");

                    var backSupport = (p_model.getValue(record, "BACK_SUPPORT") === undefined) ? null : p_model.getValue(record, "BACK_SUPPORT"); //ASA-1889 //Regression 2
                    var itemCondition = (p_model.getValue(record, "ITEM_CONDITION") === undefined) ? null : p_model.getValue(record, "ITEM_CONDITION"); //ASA-1889 //Regression 2
                    if (itemDividerPresent !== -1) { //Regression 2
                        var divider = p_model.getValue(record, "DIVIDER").v; //ASA-1889
                    } else {
                        var divider = null;
                    }
                    var pusher = (p_model.getValue(record, "PUSHER") === undefined) ? null : p_model.getValue(record, "PUSHER");
                    var delist = (p_model.getValue(record, "DELISTED") === undefined) ? null : p_model.getValue(record, "DELISTED"); //ASA-1999-3 Issue 22                    

                    regMov = isNaN(regMov) ? 0 : nvl(regMov);
                    wkCount = isNaN(wkCount) ? 0 : nvl(wkCount);
                    cogsAdj = isNaN(cogsAdj) ? 0 : nvl(cogsAdj);
                    grossProfit = isNaN(grossProfit) ? 0 : nvl(grossProfit);
                    avgSales = isNaN(avgSales) ? 0 : nvl(avgSales);
                    color = nvl(color) == 0 ? $v("P25_POG_ITEM_DEFAULT_COLOR") : color;

                    if (delist == "Yes" && p_imported == 'N') { //ASA-1999-3 Issue 22
                        massDelistedItems.push({
                            ItemID: item,
                            Item: item,
                            Desc: p_model.getValue(record, "DESCRIPTION"),
                            RegMovement: regMov,
                            Color: color,
                            BackSupport: backSupport || "",
                            Divider: divider || "",
                            ItemCondition: p_model.getValue(record, "ITEM_CONDITION") || "",
                            Pusher: pusher || ""
                        });
                    }

                    if (p_itemImported == "Y") {
                        chngRegmov = "Y";
                        chngWkCount = "Y";
                        chngCogsAdj = "Y";
                        chngGrossProfit = "Y";
                        chagAvgSales = "Y";
                        chagItemColor = "Y";
                    }

                    if (g_all_pog_flag == "Y") {
                        var i = 0;
                    } else {
                        var i = p_pog_index;
                    }

                    for (const pogJson of g_pog_json) {
                        if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                            g_renderer = g_scene_objects[i].renderer;
                            g_scene = g_scene_objects[i].scene;
                            g_camera = g_scene_objects[i].scene.children[0];
                            g_world = g_scene_objects[i].scene.children[2];
                            var l = 0;
                            for (const Modules of g_pog_json[i].ModuleInfo) {
                                if (Modules.ParentModule == null) {
                                    var j = 0;
                                    for (const Shelf of Modules.ShelfInfo) {
                                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                                            var k = 0;
                                            for (const items of Shelf.ItemInfo) {
                                                if (items.ItemID == item && delist != 'Yes') { //ASA-1999 Issue 29
                                                    //ASA-1385, Removed from below "if" chagitemdepth == "Y" || chagitemremark == "Y"
                                                    if (chngRegmov == "Y" || chngWkCount == "Y" || chngCogsAdj == "Y" || chngGrossProfit == "Y" || chagAvgSales == "Y" || chagItemColor == "Y" || itemBackSupportPresent !== -1 || itemConditionPresent !== -1 || itemDividerPresent !== -1 || itemPusherPresent !== -1) { //ASA-1889 1999
                                                        obj = g_scene_objects[i].scene.children[2].getObjectById(items.ObjID);
                                                        if (pog_items.length > 0 && pog_items.includes(item)) {
                                                            item_exists = true;
                                                        } else {
                                                            pog_items.push(item);
                                                            item_exists = false;
                                                        }
                                                        if (!item_exists) {
                                                            p_items.push(item);
                                                            //if (g_all_pog_flag !== "Y") { //ASA1931
                                                            p_pogCodeList.push(pog_code);
                                                            p_pogVersList.push(pog_version);
                                                            //}
                                                        }
                                                        if (wkCountPresent !== -1) {
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].WeeksCount = wkCount;
                                                            if (chngWkCount == "Y") {
                                                                g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].WeeksCountInd = "Y";
                                                                if (typeof obj !== "undefined") {
                                                                    obj.WeeksCount = wkCount;
                                                                }
                                                            }
                                                            if (!item_exists) {
                                                                p_item_wk_count.push(wkCount);
                                                            }
                                                        }
                                                        if (cogsAdjPresent !== -1) {
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].CogsAdj = cogsAdj;
                                                            if (chngCogsAdj == "Y") {
                                                                g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].CogsAdjInd = "Y";
                                                                if (typeof obj !== "undefined") {
                                                                    obj.CogsAdj = cogsAdj;
                                                                }
                                                            }
                                                            if (!item_exists) {
                                                                p_item_cogs_adj.push(cogsAdj);
                                                            }
                                                        }
                                                        if (grossProfitPresent !== -1) {
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].GrossProfit = grossProfit;
                                                            if (chngGrossProfit == "Y") {
                                                                g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].GrossProfitInd = "Y";
                                                                if (typeof obj !== "undefined") {
                                                                    obj.GrossProfit = grossProfit;
                                                                }
                                                            }
                                                            if (!item_exists) {
                                                                p_item_gp.push(grossProfit);
                                                            }
                                                        }
                                                        if (avgSalesPresent !== -1) {
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].AvgSales = avgSales;
                                                            if (chagAvgSales == "Y") {
                                                                g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].AvgSalesInd = "Y";
                                                                if (typeof obj !== "undefined") {
                                                                    obj.AvgSales = avgSales;
                                                                }
                                                            }
                                                            if (!item_exists) {
                                                                p_item_avg_sales.push(avgSales);
                                                            }
                                                        }
                                                        if (itemColorPresent !== -1) {
                                                            var itemColor = nvl(color) == 0 ? g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].Color : color;
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].Color = itemColor;
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].ShowColorBackup = itemColor; //ASA-1481
                                                            if (chagItemColor == "Y" && (g_show_live_image !== "Y" || nvl(obj.material.map) == 0)) {
                                                                if (typeof obj !== "undefined") {
                                                                    var worldColor = parseInt(itemColor.replace("#", "0x"), 16);
                                                                    obj.material.color.setHex(worldColor);
                                                                    var child = obj.children;
                                                                    for (n = 0; n < child.length; n++) {
                                                                        if (child[n].uuid == "horiz_facing") {
                                                                            child[n].material.color.setHex(worldColor);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            if (!item_exists) {
                                                                p_itemColor.push(itemColor);
                                                            }
                                                        }
                                                        if (itemBackSupportPresent !== -1) { //ASA-1889
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].BackSupport = backSupport;
                                                            if (typeof obj !== "undefined") {
                                                                obj.BackSupport = backSupport;
                                                            }
                                                            if (!item_exists) {
                                                                p_item_back_support.push(backSupport);
                                                            }
                                                        }
                                                        if (itemConditionPresent !== -1) { //ASA-1889
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].ItemCondition = itemCondition;
                                                            if (typeof obj !== "undefined") {
                                                                obj.ItemCondition = itemCondition;
                                                            }
                                                            if (!item_exists) {
                                                                p_item_condition.push(itemCondition);
                                                            }
                                                        }
                                                        if (itemDividerPresent !== -1) { //ASA-1889
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].Divider = divider;
                                                            if (typeof obj !== "undefined") {
                                                                obj.Divider = divider;
                                                            }
                                                            if (!item_exists) {
                                                                p_item_divider.push(divider);
                                                            }
                                                        }
                                                        if (itemPusherPresent !== -1) { //ASA-1999
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].Pusher = pusher;
                                                            if (typeof obj !== "undefined") {
                                                                obj.Pusher = pusher;
                                                            }
                                                            if (!item_exists) {
                                                                p_item_pusher.push(pusher);
                                                            }
                                                        }
                                                        //ASA-1446, shifted at last
                                                        if (regMovPresent !== -1) {
                                                            g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].RegMovement = regMov;
                                                            if (chngRegmov == "Y") {
                                                                g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].RegMovementInd = "Y";
                                                                g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].DaysOfSupplyInd = "Y";
                                                                if (typeof obj !== "undefined") {
                                                                    obj.RegMovement = regMov;
                                                                }
                                                            }
                                                            if (!item_exists) {
                                                                p_item_regmov.push(regMov);
                                                                var item1 = await updateDaysOfSupply(items, k, j, l, "N", "N", i, "Y");
                                                                p_item_days_of_supply.push(g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].DaysOfSupply);
                                                            }
                                                        }

                                                        //ASA-1385
                                                        /*if (depth !== -1) {
                                                        //ASA--1105-S
                                                        g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].BaseD = itemdepth;
                                                        if (chagitemdepth == "Y") {
                                                        if (typeof obj !== "undefined") {
                                                        obj.BaseD = itemdepth;
                                                        }
                                                        }
                                                        if (!item_exists) {
                                                        p_itemdepth.push(itemdepth);
                                                        }
                                                        }
                                                        if (remarks !== -1) {
                                                        g_pog_json[i].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].Remark = itemremark;
                                                        if (chagitemremark == "Y") {
                                                        if (typeof obj !== "undefined") {
                                                        obj.Remark = itemremark;
                                                        }
                                                        }
                                                        if (!item_exists) {
                                                        p_itemremark.push(itemremark);
                                                        }
                                                        } //ASA--1105 -E*/
                                                        item_exists = false;
                                                    }
                                                }
                                                k++;
                                            }
                                        }
                                        j++;
                                    }
                                }
                                l++;
                            }
                            render(i);
                        }
                        if (g_all_pog_flag == "Y") {
                            i++;
                        } else {
                            break;
                        }
                    }
                });
                if (g_all_pog_flag == "Y") {
                    var i = 0;
                } else {
                    var i = p_pog_index;
                }
                for (const pogJson of g_pog_json) {
                    if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                        if (g_show_days_of_supply == "Y" && p_showDaysOfSupply == "Y") {
                            await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", i, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v("P25_POGCR_ITEM_DETAIL_LIST")
                            if (g_compare_view == "POG" && g_compare_pog_flag == "Y") {
                                await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", g_ComViewIndex, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v("P25_POGCR_ITEM_DETAIL_LIST")
                            }
                        }
                    }
                    if (g_all_pog_flag == "Y") {
                        i++;
                    } else {
                        break;
                    }
                }
                if (massDelistedItems.length > 0 && p_imported == 'N') { //ASA-1999-3 Issue 22
                    let pogJsonObj = g_pog_json[p_pog_index];
                    // Always reset
                    pogJsonObj.MassDelistedItem = [];

                    // Add current grid delisted rows
                    massDelistedItems.forEach(function (item) {
                        pogJsonObj.MassDelistedItem.push(item);
                    });

                    apex.server.process(
                        "SAVE_MASS_DELISTED_ITEMS",
                        {
                            x01: JSON.stringify(pogJsonObj.MassDelistedItem)
                        },
                        {
                            dataType: "text"
                        }
                    );
                }
                resolve("SUCCESS");
                logDebug("function : itemInfoUpdate", "E");
            });
        }
    } catch (err) {
        error_handling(err);
    }
}

async function saveItemInfo(p_pog_index, p_showDaysOfSupply = "Y", p_itemImported = "N") {
    try {
        logDebug("function : saveItemInfo ; ", "S");
        var pogcr_item_info_cols = "," + $v("P25_POGCR_ITEM_INFO_COLS") + ",";
        apex.region("item_pog_info").widget().interactiveGrid("getActions").set("edit", false);
        var model = apex.region("item_pog_info").widget().interactiveGrid("getViews", "grid").model;
        var item_arr = [],
            item_seq = [],
            item_regmov = [],
            item_days_of_supply = [],
            item_wk_count = [],
            item_cogs_adj = [],
            item_gp = [],
            item_avg_sales = [],
            item_list = [],
            pog_code_list = [],
            pog_vers_list = [],
            //item_depth = [],//ASA-1385
            //item_remark = [],//ASA-1385
            item_color = []; //ASA-1130
        item_back_support = []; //ASA-1889
        item_condition = []; //ASA-1889
        item_divider = []; //ASA-1889
        item_pusher = []; //ASA-1889

        if (g_all_pog_flag !== "Y") {
            model.forEach(function (record) {
                item_arr.push(model.getValue(record, "ITEM").toUpperCase());
            });
        } else {
            model.forEach(function (record) {
                item_arr.push(model.getValue(record, "ITEM").toUpperCase() + ":" + model.getValue(record, "POG_CODE").toUpperCase() + ":" + model.getValue(record, "POG_VERSION").toUpperCase());
            });
        }

        var uniq = item_arr
            .map((name) => {
                return {
                    count: 1,
                    name: name,
                };
            })
            .reduce((a, b) => {
                a[b.name] = (a[b.name] || 0) + b.count;
                return a;
            }, {});

        var duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1);

        if (duplicates.length > 0) {
            alert(get_message("COMPONENT_UNIQUE_ID"));
        } else {
            let result = await itemInfoUpdate(model, p_showDaysOfSupply, pogcr_item_info_cols, item_seq, item_regmov, item_days_of_supply, item_wk_count, item_cogs_adj, item_gp, item_avg_sales, p_itemImported, item_list, p_pog_index, pog_code_list, pog_vers_list, item_color, item_back_support, item_condition, item_divider, item_pusher, p_itemImported); //ASA-1999 ASA-1889 Added 3 new param //ASA-1385 Issue 1 removed for calling "item_depth, item_remark" //ASA-1385, Removed from passing "item_depth, item_remark"
            if (p_itemImported == "N") {
                apex.server.process(
                    "UPDATE_POG_ITEM_INFO", {
                    x01: g_pog_json[p_pog_index],
                    f01: item_seq,
                    f02: item_regmov,
                    f03: item_days_of_supply,
                    f04: item_wk_count,
                    f05: item_cogs_adj,
                    f06: item_gp,
                    f07: item_avg_sales,
                    f08: item_list,
                    f09: pog_code_list,
                    f10: pog_vers_list,
                    //f11: item_depth,//ASA-1385
                    //f12: item_remark,//ASA-1385
                    f13: item_color,
                    f14: item_back_support,
                    f15: item_condition,
                    f16: item_divider,
                    f17: item_pusher //ASA-1999
                }, {
                    dataType: "text",
                    success: function (pData) {
                        if ($.trim(pData) != "") {
                            raise_error(pData);
                        } else {
                            apex.region("item_pog_info").widget().interactiveGrid("getActions").set("edit", false);
                            apex.region("item_pog_info").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                            apex.region("item_pog_info").refresh();
                            apex.region("draggable_table").refresh();
                            closeInlineDialog("upd_reg_mov");
                        }
                    },
                    loadingIndicatorPosition: "page",
                });
            }
        }
        logDebug("function : saveItemInfo ; ", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function updatePOGItemInfoColl(p_item, p_daysOfSupply, p_pog_index) {
    return new Promise(function (resolve, reject) {
        try {
            logDebug("function : updatePOGItemInfoColl ; pItem : " + p_item + "; pDaysOfSupply : " + p_daysOfSupply, "S");
            if (p_item.length > 0) {
                apex.server.process(
                    "UPDATE_POG_ITEM_COLL", {
                    f01: p_item,
                    f02: p_daysOfSupply,
                    x01: g_pog_json[p_pog_index].POGCode,
                }, {
                    dataType: "text",
                    success: function (pData) {
                        if ($.trim(pData) != "") {
                            raise_error(pData);
                        } else {
                            resolve("SUCCESS");
                        }
                    },
                    loadingIndicatorPosition: "page",
                });
            }
            logDebug("function : updatePOGItemInfoColl ; ", "E");
        } catch (err) {
            logDebug("function : updatePOGItemInfoColl ; ", "E");
            error_handling(err);
        }
    });
}

async function auto_position_pegboard() {
    await auto_position_pegboard_init(g_pog_index);
}

async function auto_position_pegboard_init(p_pog_index) {
    var valid = "Y";
    if (g_all_pog_flag == "Y") {
        var z = 0;
    } else {
        var z = p_pog_index;
    }

    for (const pogJson of g_pog_json) {
        var i = 0;
        for (const Modules of g_pog_json[z].ModuleInfo) {
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

                            var items_list = g_pog_json[z].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                            g_pog_json[z].ModuleInfo[i].ShelfInfo[j].AutoPlacing = "N";

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
                                    var closest = get_closest_peg(items.H, i, j, shelf_top - items.H / 2, z);
                                    var shelfY = closest - items.H / 2;
                                    items.FromProductList = "Y";
                                    items.Y = shelfY;
                                    items.Exists = "N";
                                    items.Edited = "N";
                                    k++;
                                }

                                var high_y = 0;
                                k = 0;
                                var items_list = g_pog_json[z].ModuleInfo[i].ShelfInfo[j].ItemInfo;
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
                                var items_list = g_pog_json[z].ModuleInfo[i].ShelfInfo[j].ItemInfo;
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
                                if (reorder_items(i, j, z)) {
                                    k = 0;
                                    var spread_gap = Shelf.HorizGap;
                                    var horiz_gap = spread_gap;
                                    var spread_product = Shelf.SpreadItem;
                                    var items_list = g_pog_json[z].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                                    var sorto = {
                                        LocID: "asc",
                                    };
                                    items_list.keySort(sorto);
                                    for (const items of items_list) {
                                        new_x = get_item_xaxis(items.W, items.H, items.D, items.CType, -1, horiz_gap, spread_product, spread_gap, i, j, k, "Y", items_list.length, "N", z);
                                        g_pog_json[z].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].X = new_x;
                                        k++;
                                    }
                                }
                                if (valid == "Y") {
                                    for (const items of Shelf.ItemInfo) {
                                        g_world.remove(g_world.getObjectById(items.ObjID));
                                        items.LocID = items.LocID !== "" ? parseInt(items.LocID) : "";
                                    }
                                    if (reorder_items(i, j, z)) {
                                        var return_val = await recreate_all_items(i, j, Shelf.ObjType, "N", -1, -1, items_list.length, "Y", "N", -1, -1, 1, "", z, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y"); //ASA-1350 issue 6 added parameters

                                        for (const items of g_pog_json[z].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                            items.FromProductList = "N";
                                            items.Exists = "E";
                                            items.Edited = "N";
                                            k++;
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
        render(z);
        if (g_all_pog_flag == "Y") {
            z++;
        } else {
            break;
        }
    }
    if (g_show_live_image == "Y") {
        animate_all_pog();
    }
}

async function auto_fill_setup(p_pog_index) {
    console.log("pog json length", g_pog_json[p_pog_index], g_pog_json.length);
    if (g_all_pog_flag == "N" || (g_all_pog_flag == "Y" && g_pog_json.length == 1)) {
        $(".autofill_btn").addClass("item_label_active");
        $s("P25_OPEN_POG_CODE", `${g_pog_json[p_pog_index].POGCode}`);
        $s("P25_OPEN_POG_VERSION", `${g_pog_json[p_pog_index].Version}`);

        if (g_auto_fill_active == "N" && typeof g_pog_json[p_pog_index] !== undefined && g_pog_json.length > 0) {
            //ASA-1085added g_pog_index
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
            //Task_29818 - End

            if ($v("P25_OPEN_POG_CODE") != "") {
                $("#SAVE_AF_BTN").hide();
                $("#APPLY_AF_BTN").show();
            } else {
                $("#SAVE_AF_BTN").show();
                $("#APPLY_AF_BTN").hide();
            } //ASA-1694 #6

            //ASA-1694 Start
            apex.server.process(
                "GET_AUTOFILL", {
                x01: $v("P25_POG_TEMPLATE"),
                x02: $v("P25_OPEN_POG_CODE"),
                x03: $v("P25_OPEN_DRAFT") == "Y" ? "" : $v("P25_OPEN_POG_VERSION"),
            }, {
                dataType: "json",
                success: function (pData) {
                    var return_data = $.trim(pData).split(",");
                    if (return_data[0] == "ERROR") {
                        raise_error(pData);
                    } else {
                        var item_exists = false;
                        for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
                            if (item_exists) {
                                break;
                            }
                            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                                var j = 0;
                                var mod_top = modules_info.Y + modules_info.H / 2;
                                var mod_bottom = modules_info.Y - modules_info.H / 2;
                                for (const shelf_info of modules_info.ShelfInfo) {
                                    if (item_exists) {
                                        break;
                                    }
                                    if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                                        for (const item_info of shelf_info.ItemInfo) {
                                            if (item_info.Item !== "DIVIDER") {
                                                item_exists = true;
                                                break;
                                            }
                                        }
                                    }
                                    j++;
                                }
                                if (modules_info.Carpark.length > 0) {
                                    if (modules_info.Carpark[0].ItemInfo.length > 0) {
                                        item_exists = true;
                                    }
                                }
                            }
                            i++;
                        }
                        if (item_exists) {
                            //Task_29818 - Start
                            // ax_message.confirm(get_message("POGCR_AUTOFILL_ITEM_DEL"), function (e) {
                            //     if (e) {
                            //         async function doSomething() {
                            //             g_auto_fill_active = "Y";
                            //             $s("P25_BLOCK_SELECTION", "P");
                            //             g_undo_final_obj_arr = [];
                            //             g_redo_final_obj_arr = [];
                            //             g_prev_undo_action = "";
                            //             apex.event.trigger("#P25_POG_RULE", "apexrefresh");
                            //             var i = 0;
                            //             for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
                            //                 if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                            //                     if (modules_info.Carpark.length > 0) {
                            //                         for (const item_info of modules_info.Carpark[0].ItemInfo) {
                            //                             g_deletedItems.push(item_info.ItemID);
                            //                             var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item_info.ObjID);
                            //                             g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                            //                         }
                            //                         var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(modules_info.Carpark[0].SObjID);
                            //                         g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                            //                         g_pog_json[p_pog_index].ModuleInfo[i].Carpark = [];
                            //                     }
                            //                 }
                            //                 i++;
                            //             }
                            //             reset_zoom();
                            //             await clear_item("N", "N", g_pog_index);
                            //             g_ItemImages = [];
                            //             g_undo_final_obj_arr = [];
                            //             g_redo_final_obj_arr = [];
                            //             apex.theme.openRegion("auto_fill_reg");
                            //             g_auto_fill_reg_open = "Y";
                            //         }
                            //         doSomething();
                            //     }
                            // });

                            confirm(get_message("POGCR_AUTOFILL_ITEM_DEL"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
                                async function doSomething() {
                                    g_auto_fill_active = "Y";
                                    $s("P25_BLOCK_SELECTION", "P");
                                    g_undo_final_obj_arr = [];
                                    g_redo_final_obj_arr = [];
                                    g_prev_undo_action = "";
                                    // apex.event.trigger("#P25_POG_RULE", "apexrefresh");  //ASA-1694
                                    var i = 0;
                                    for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
                                        if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                                            if (modules_info.Carpark.length > 0) {
                                                for (const item_info of modules_info.Carpark[0].ItemInfo) {
                                                    g_deletedItems.push(item_info.ItemID);
                                                    var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(item_info.ObjID);
                                                    g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                                                }
                                                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(modules_info.Carpark[0].SObjID);
                                                g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
                                                g_pog_json[p_pog_index].ModuleInfo[i].Carpark = [];
                                            }
                                        }
                                        i++;
                                    }
                                    reset_zoom();
                                    await clear_item("N", "N", g_pog_index);
                                    g_ItemImages = [];
                                    g_undo_final_obj_arr = [];
                                    g_redo_final_obj_arr = [];
                                    // apex.theme.openRegion("auto_fill_reg");      //ASA-1694
                                    g_auto_fill_reg_open = "Y";

                                    if (typeof pData.AFVersion != "undefined" || typeof g_autofill_detail["AFVersion"] != "undefined") {
                                        //ASA-1694
                                        if (typeof g_autofill_detail["AFVersion"] == "undefined") {
                                            g_autofill_detail["AFPOGCode"] = pData.AFPOGCode;
                                            g_autofill_detail["AFPOGVersion"] = pData.AFPOGVersion;
                                            g_autofill_detail["AFVersion"] = pData.AFVersion;
                                            g_autofill_detail["BlkSelType"] = pData.AFType;
                                            g_autofill_detail["AutofillRule"] = pData.AFRule;
                                            g_autofill_detail["BlkInfo"] = JSON.parse(pData.AFJSON).BlkInfo;
                                        }

                                        $s("P25_BLOCK_SELECTION", g_autofill_detail.BlkSelType);
                                        $s("P25_AF_VERSION", g_autofill_detail.AFVersion);
                                        $s("P25_POG_RULE", g_autofill_detail.AutofillRule);
                                        if ($v("P25_BLOCK_SELECTION") == "M") {
                                            g_mod_block_list = g_autofill_detail["BlkInfo"];
                                            async function doSomething() {
                                                for (const blkDet of g_mod_block_list) {
                                                    g_autofillModInfo = blkDet.BlkModInfo; //ASA-1697
                                                    g_autofillShelfInfo = blkDet.BlkShelfInfo; //ASA-1697
                                                    // var retdtl = await add_module_autofill_color(blkDet['DragMouseStart'], blkDet['DragMouseEnd'], blkDet['mod_index'], blkDet["BlkColor"], blkDet["BlkName"], 'U', blkDet, g_pog_index);    //ASA-1697
                                                    var retdtl = await colorAutofillBlock(blkDet["DragMouseStart"], blkDet["DragMouseEnd"], blkDet["mod_index"], blkDet["BlkColor"], blkDet["BlkName"], "U", blkDet, g_pog_index); //ASA-1697
                                                    blkDet["BlockDim"] = retdtl;
                                                }
                                                g_autofill_detail["BlkInfo"] = g_mod_block_list;
                                                await save_blk_dtl_coll("Y", "", g_mod_block_list);
                                                g_mod_block_list = g_autofill_detail["BlkInfo"];
                                                apex.event.trigger("#P25_POG_RULE", "apexrefresh"); //Regression Issue 6 20250225
                                                apex.theme.openRegion("auto_fill_reg");
                                            }
                                            doSomething();
                                        } else {
                                            apex.event.trigger("#P25_POG_RULE", "apexrefresh"); //Regression Issue 6 20250225
                                            apex.theme.openRegion("auto_fill_reg");
                                        }
                                    } else {
                                        //ASA-1694
                                        apex.event.trigger("#P25_POG_RULE", "apexrefresh");
                                        apex.theme.openRegion("auto_fill_reg");
                                    }
                                }
                                doSomething();
                            });
                            //Task_29818 - End
                        } else {
                            g_auto_fill_active = "Y";
                            $s("P25_BLOCK_SELECTION", "P");
                            // apex.event.trigger("#P25_POG_RULE", "apexrefresh"); //ASA-1694
                            g_ItemImages = [];
                            g_undo_final_obj_arr = [];
                            g_redo_final_obj_arr = [];
                            // apex.theme.openRegion("auto_fill_reg");  //ASA-1694
                            g_auto_fill_reg_open = "Y";

                            if (typeof pData.AFVersion != "undefined" || typeof g_autofill_detail["AFVersion"] != "undefined") {
                                //ASA-1694

                                if (typeof g_autofill_detail["AFVersion"] == "undefined") {
                                    g_autofill_detail["AFPOGCode"] = pData.AFPOGCode;
                                    g_autofill_detail["AFPOGVersion"] = pData.AFPOGVersion;
                                    g_autofill_detail["AFVersion"] = pData.AFVersion;
                                    g_autofill_detail["BlkSelType"] = pData.AFType;
                                    g_autofill_detail["AutofillRule"] = pData.AFRule;
                                    g_autofill_detail["BlkInfo"] = JSON.parse(pData.AFJSON).BlkInfo;
                                }

                                $s("P25_BLOCK_SELECTION", g_autofill_detail.BlkSelType);
                                $s("P25_AF_VERSION", g_autofill_detail.AFVersion);
                                $s("P25_POG_RULE", g_autofill_detail.AutofillRule);
                                if ($v("P25_BLOCK_SELECTION") == "M") {
                                    g_mod_block_list = g_autofill_detail["BlkInfo"];
                                    async function doSomething() {
                                        for (const blkDet of g_mod_block_list) {
                                            g_autofillModInfo = blkDet.BlkModInfo; //ASA-1697
                                            g_autofillShelfInfo = blkDet.BlkShelfInfo; //ASA-1697
                                            // var retdtl = await add_module_autofill_color(blkDet['DragMouseStart'], blkDet['DragMouseEnd'], blkDet['mod_index'], blkDet["BlkColor"], blkDet["BlkName"], 'U', blkDet, g_pog_index);    //ASA-1697
                                            var retdtl = await colorAutofillBlock(blkDet["DragMouseStart"], blkDet["DragMouseEnd"], blkDet["mod_index"], blkDet["BlkColor"], blkDet["BlkName"], "U", blkDet, g_pog_index); //ASA-1697
                                            blkDet["BlockDim"] = retdtl;
                                        }
                                        g_autofill_detail["BlkInfo"] = g_mod_block_list;
                                        await save_blk_dtl_coll("Y", "", g_mod_block_list);
                                        g_mod_block_list = g_autofill_detail["BlkInfo"];
                                        apex.event.trigger("#P25_POG_RULE", "apexrefresh"); //Regression Issue 6 20250225
                                        apex.theme.openRegion("auto_fill_reg");
                                    }
                                    doSomething();
                                    // update_module_block_list('Y','');
                                } else {
                                    apex.event.trigger("#P25_POG_RULE", "apexrefresh"); //Regression Issue 6 20250225
                                    apex.theme.openRegion("auto_fill_reg");
                                }
                            } else {
                                //ASA-1694
                                apex.event.trigger("#P25_POG_RULE", "apexrefresh");
                                apex.theme.openRegion("auto_fill_reg");
                            }
                        }
                    }
                },
            });
            //ASA-1694 End
        } else {
            clear_auto_fill_coll();
            g_auto_fill_active = "N";
            g_auto_fill_reg_open = "N";
            apex.theme.closeRegion("auto_fill_reg");
        }
    } else {
        alert(get_message("POGCR_AUTOFILL_VALID"));
    }
}

var ItemInputElem = document.getElementById("P25_AUTOFILL_PROD_UPLD");
var fileIndex = 0;

function upload_items_file(p_fileIndex) {
    var fileInputElem = document.getElementById("P25_ITEM_INFO_UPLD");
    var file = ItemInputElem.files[p_fileIndex];
    var reader = new FileReader();

    reader.onload = (function (pFile) {
        return function (e) {
            if (pFile) {
                if ((file.name + ".").includes("xlsx.")) {
                    var base64 = binaryArray2base64(e.target.result);
                    var f01Array = [];
                    f01Array = clob2Array(base64, 30000, f01Array);

                    apex.server.process(
                        "UPLOAD_ITEMS", {
                        x01: file.name,
                        x02: file.type,
                        f01: f01Array,
                    }, {
                        dataType: "html",
                        success: function (pData) {
                            if (pData !== "") {
                                var return_val = pData.split("-");
                                if (return_val[0] == "ERRORED") {
                                    alert(get_message("POGCR_INVALID_ITEMS") + " - " + return_val[1]);
                                }
                                console.log("pData", pData);
                                apex.region("autofill_products").refresh();
                                console.log(" End timing", getDateTime());
                                $("#P25_AUTOFILL_PROD_UPLD").val("");
                            }
                        },
                    });
                } else {
                    alert(get_message("POGCR_INVALID_FILE"));
                }
            }
        };
    })(file);
    reader.readAsArrayBuffer(file);
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

async function update_module_block_list(p_action_ind, p_old_blk_name, p_escape_ind = "N") {
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
            obj["BlkFilters"] = details["BlkFilters"]; //ASA-1694;
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
        block_detail["BlkColor"] = $v("P25_BLK_COLOR");
        block_detail["BlkRule"] = $v("P25_BLK_RULE");
        var shelf_arr = [];
        var mod_index = [];
        var final_shelf_arr = [];

        if (p_action_ind !== "U") {
            //ASA-1085 added blkname
            block_detail["DragMouseStart"] = g_DragMouseStart;
            block_detail["DragMouseEnd"] = g_DragMouseEnd;
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
                    valid = true;
                    for (const obj of g_mod_block_list) {
                        if (!valid) {
                            break;
                        }
                        for (const dtl of obj.g_delete_details) {
                            if (shelfs.MIndex == dtl.MIndex && shelfs.SIndex == dtl.SIndex) {
                                valid = false;
                                break;
                            }
                        }
                    }
                    if (valid) {
                        final_shelf_arr.push(shelfs);
                    }
                }
            } else {
                final_shelf_arr = shelf_arr;
            }

            console.log("final_shelf_arr", final_shelf_arr);
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
            console.log("filters", filters, filter_list, filters_arr, value);
        });

        console.log("filters_arr", filters_arr, attr_arr);

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
                    console.log("obj.BlkName", obj.BlkName, p_old_blk_name, obj.BlkColor.toUpperCase(), $v("P25_BLK_COLOR").toUpperCase);
                    if (obj.BlkName == p_old_blk_name) {
                        for (const child of obj.BlockDim.ColorObj.children) {
                            console.log("child.uuid ", child.uuid, p_old_blk_name);
                            if (child.uuid == p_old_blk_name) {
                                obj.BlockDim.ColorObj.remove(child);
                                console.log("inside");
                                break;
                            }
                        }
                    }
                }
                var i = 0;
                for (const obj of g_mod_block_list) {
                    if (obj.BlkName == p_old_blk_name) {
                        console.log("inside", obj.BlkName, p_old_blk_name);
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
            var ret_dtl = await add_module_autofill_color(g_DragMouseStart, g_DragMouseEnd, mod_index, $v("P25_BLK_COLOR"), blockName, p_action_ind, upd_block_dtl, g_pog_index);
            console.log("ret_dtl", ret_dtl);
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
                        obj["BlkFilters"] = details["BlkFilters"]; //ASA-1694;
                        block_details_arr.push(details);
                    } else if (obj.BlkName == p_old_blk_name || obj.BlkName == blockName) {
                        var details = {};
                        details["BlkColor"] = $v("P25_BLK_COLOR");
                        details["BlkName"] = blockName;
                        details["BlkRule"] = $v("P25_BLK_RULE");
                        details["BlkFilters"] = filters_arr.join(" AND ");
                        details["OldBlkName"] = p_old_blk_name;
                        obj["BlkFilters"] = details["BlkFilters"]; //ASA-1694;
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
                    obj["BlkFilters"] = details["BlkFilters"]; //ASA-1694;
                    block_details_arr.push(details);
                }
                var retval = await save_blk_dtl_coll(p_action_ind, p_old_blk_name, block_details_arr);
            }
        }
    }
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

async function add_module_autofill_color(p_dragMouseStart, p_dragMouseEnd, p_mod_index, p_color, p_text, p_update_flag, p_block_detail, p_pog_index, p_swapBlock) {
    //ASA-1085 added
    console.log("add fill", p_dragMouseStart, p_dragMouseEnd, p_mod_index, p_color, p_text, p_update_flag, p_block_detail);
    var i = 0;
    var font_size = parseInt($v("P25_POGCR_BLK_TXT_SIZE"));
    var left_x = Math.min(p_dragMouseStart.x, p_dragMouseEnd.x),
        right_x = Math.max(p_dragMouseStart.x, p_dragMouseEnd.x),
        btm_y = Math.min(p_dragMouseStart.y, p_dragMouseEnd.y),
        top_y = Math.max(p_dragMouseStart.y, p_dragMouseEnd.y);
    var mod_start = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].X - g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].W / 2,
        mod_end = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].X + g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].W / 2,
        mod_top = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y + g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].H / 2,
        mod_bottom = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y - g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].H / 2;

    var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].ShelfInfo;

    var final_btm = -1;
    var final_top = -1;
    top_y = top_y > mod_top ? mod_top : top_y;
    btm_y = btm_y < mod_bottom ? mod_bottom : btm_y;

    if (p_update_flag !== "U") {
        if (g_mod_block_list.length > 0) {
            var btm_exist = false,
                top_exits = false;
            for (const obj of g_mod_block_list) {
                if (p_mod_index[0] == obj.mod_index[0] && obj.BlockDim.FinalTop > btm_y && btm_y > obj.BlockDim.FinalBtm) {
                    final_btm = obj.BlockDim.FinalTop;
                    btm_exist = true;
                    break;
                }
            }
            for (const obj of g_mod_block_list) {
                console.log("top ", top_y, obj.BlockDim.FinalBtm, btm_y, obj.BlockDim.FinalTop);
                if (p_mod_index[0] == obj.mod_index[0] && ((top_y > obj.BlockDim.FinalBtm && top_y <= obj.BlockDim.FinalTop) || (top_y > obj.BlockDim.FinalBtm && obj.BlockDim.FinalBtm >= btm_y && obj.BlockDim.FinalTop <= top_y))) {
                    final_top = obj.BlockDim.FinalBtm;
                    top_exits = true;
                    console.log("exists");
                    break;
                }
            }
            if (!btm_exist || p_swapBlock == "Y") {
                final_btm = get_below_shelf(l_shelf_details, p_mod_index[0], btm_y, p_pog_index);
            }
            if (!top_exits || p_swapBlock == "Y") {
                final_top = get_above_shelf(l_shelf_details, p_mod_index[0], top_y, mod_top, p_pog_index);
            }
        } else {
            final_btm = get_below_shelf(l_shelf_details, p_mod_index[0], btm_y, p_pog_index);
            final_top = get_above_shelf(l_shelf_details, p_mod_index[0], top_y, mod_top, p_pog_index);
        }

        var calc_height = final_top - final_btm;
        var calc_width = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].W;
        var calc_x = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].X;

        if (g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y < final_btm) {
            var diff = final_btm - g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y;
            calc_y = diff + calc_height / 2;
        } else {
            var diff = g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].Y - final_btm;
            calc_y = 0 - diff + calc_height / 2;
        }
    } else {
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

    var mesh = dcText(p_text, font_size, 0x000000, colorValue, calc_width, calc_height, "N", "N", "Arial", "", font_size, 0, -1, 4); //
    //return [calc_height, calc_width, calc_x, calc_y];MObjID
    var mod_object = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index[0]].MObjID);
    mod_object.add(mesh);
    mesh.uuid = p_text + "_AFP";
    mesh.material.opacity = 0.5;
    mesh.position.x = 0;
    mesh.position.y = calc_y;
    mesh.position.z = 0.009;
    render(p_pog_index);
    g_delete_details = [];
    g_mselect_drag = "N";
    var details = {};
    details["CalcX"] = 0;
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
}

function delete_blk_details(p_old_blk_name) {
    //Task_29818 - Start
    // ax_message.confirm(get_message("SHCT_DELETE_CONFIRM_MSG"), function (e) {
    //     if (e) {
    //         async function doSomething() {
    //             var i = 0;
    //             for (const obj of g_mod_block_list) {
    //                 if (obj.BlkName == p_old_blk_name) {
    //                     for (const child of obj.BlockDim.ColorObj.children) {
    //                         if (child.uuid == p_old_blk_name) {
    //                             obj.BlockDim.ColorObj.remove(child);
    //                             break;
    //                         }
    //                     }
    //                     g_mod_block_list.splice(i, 1);
    //                     break;
    //                 }
    //                 i++;
    //             }
    //             render(g_pog_index);
    //             var retval = await save_blk_dtl_coll("D", p_old_blk_name, []);
    //             closeInlineDialog("block_details");
    //             g_autofill_edit = "N";
    //             apex.theme.openRegion("auto_fill_reg");
    //             g_auto_fill_reg_open = "Y";
    //             return "SUCCESS";
    //         }
    //         doSomething();
    //     }
    // });
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
            apex.event.trigger("#P25_POG_RULE", "apexrefresh"); //Regression Issue 6 20250225
            apex.theme.openRegion("auto_fill_reg");
            g_auto_fill_reg_open = "Y";
            return "SUCCESS";
        }
        doSomething();
    });
    //Task_29818 - End
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
                apex.region("mod_block_details").refresh();
                if (p_action_ind == "Y" || p_action_ind == "U") {
                    apex.theme.openRegion("auto_fill_reg");
                    g_auto_fill_reg_open = "Y";
                    g_autofill_edit = "N";
                }

                resolve("success");
            },
            loadingIndicatorPosition: "page",
        });
    });
}

function open_blk_details(p_blk_name, p_edit_ind) {
    console.log(p_blk_name);
    $s("P25_EDIT_BLK", p_blk_name);
    g_autofill_edit = p_edit_ind == "Y" ? "Y" : "N";
    var model = apex.region("block_filters").widget().interactiveGrid("getViews", "grid").model;
    //model.clearChanges(); //ASA-1727 ISSUE-1
    //apex.region("block_filters").refresh(); //ASA-1727 ISSUE-1

    for (const obj of g_mod_block_list) {
        if (obj.BlkName == p_blk_name) {
            $s("P25_BLK_NAME", obj.BlkName.slice(0, -4));
            $s("P25_BLK_COLOR", obj.BlkColor);
            $s("P25_BLK_RULE", obj.BlkRule);
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
            apex.region("autofill_products").refresh();
            if (apex.region("mod_block_details") !== null) {
                apex.region("mod_block_details").refresh();
            }
            console.log("pData", pData);
            $s("P25_MULTI_PRODUCT", "");
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

function send_autofill_item_coll(p_items_list) {
    logDebug("function : send_to_db; items_list : " + p_items_list, "S");
    return new Promise(function (resolve, reject) {
        console.log("items_list 1", p_items_list);
        var p = apex.server.process(
            "AUTOFILL_ITEM_COLL", {
            p_clob_01: p_items_list,
        }, {
            dataType: "html",
        });
        // When the process is done, call functions
        p.done(function (data) {
            logDebug("function : send_to_db", "E");
            console.log("successful autofill items");
            resolve("success");
        });
    });
}

const randomColor = () => {
    return (
        "#" +
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")
            .toUpperCase());
};

function get_shelf_list(p_rule_dtl, p_blk_selection, p_pog_index) {
    var module = "";
    var shelf = "";
    var old_mod_index = -1;
    var old_shelf_index = -1;
    var max_height = 0.02;
    var max_depth = 0.4;
    var k = 0;
    var i = 0;
    var l_shelf_details = [];
    var mod_list = [];
    var total_shelf = [];
    var mod_bal_shelf = [];
    var label_list = $v("P25_POGCR_FIXEL_TYPES").split(",");
    var textbox_list = [];
    var final_list = [];

    /*
     *Getting all the shelfs from all module and order based on placing.
     *
     */
    for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
        if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
            var j = 0;
            var mod_top = modules_info.Y + modules_info.H / 2;
            var mod_bottom = modules_info.Y - modules_info.H / 2;
            for (const shelf_info of modules_info.ShelfInfo) {
                if (label_list.some((v) => shelf_info.Shelf.includes(v)) && shelf_info.ObjType == "TEXTBOX" && shelf_info.Y < mod_top && shelf_info.Y > mod_bottom) {
                    textbox_list.push(shelf_info);
                    shelf_info.SIndex = j;
                    shelf_info.MIndex = i;
                }
                if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                    total_shelf.push(shelf_info);
                    shelf_info.SIndex = j;
                    shelf_info.MIndex = i;
                    shelf_info.NoItem = "N";
                }
                j++;
            }
        }
        i++;
    }

    if (textbox_list.length > 0) {
        for (const obj of textbox_list) {
            var y_value = -121;
            var i = 0,
                index = -1;
            for (const shelf_info of total_shelf) {
                if (obj.Y > shelf_info.Y && shelf_info.Y > y_value && obj.X > shelf_info.X - shelf_info.W / 2 && obj.X < shelf_info.X + shelf_info.W / 2) {
                    console.log("i", i);
                    y_value = shelf_info.Y;
                    index = i;
                }
                i++;
            }
            if (typeof index !== "undefined") {
                total_shelf[index].NoItem = "Y";
            }
        }
    }
    if (p_blk_selection == "P") {
        l_shelf_details = total_shelf;
    } else {
        for (const objects of g_mod_block_list) {
            mod_list = mod_list.concat(objects.g_delete_details);
        }
        for (const objects of mod_list) {
            objects.NoItem = "N";
        }
        for (const tot of total_shelf) {
            for (const objects of mod_list) {
                if (tot.MIndex == objects.MIndex && tot.SIndex == objects.SIndex) {
                    l_shelf_details.push(tot);
                }
            }
        }

        mod_bal_shelf = total_shelf.filter((f) => !l_shelf_details.some((d) => d.MIndex + "-" + d.SIndex == f.MIndex + "-" + f.SIndex));
    }
    for (const objects of l_shelf_details) {
        var max_merch = get_shelf_max_merch(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex], g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex], objects.MIndex, objects.SIndex, p_pog_index, parseFloat($v("P25_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload
        objects.MaxMerch = max_merch;
        if (objects.ObjType == "PEGBOARD") {
            var peg_verti_arr = objects.peg_vert_values;
            var peg_horiz_arr = objects.peg_horiz_values;
            var peg_horiz_details = [],
                peg_vert_details = [];

            if (peg_verti_arr.length > 0) {
                $.each(peg_verti_arr, function (j, details) {
                    peg_vert_details.push(objects.Y + peg_verti_arr[j]);
                });
                objects.peg_vert_details = peg_vert_details;
            }
            if (peg_horiz_arr.length > 0) {
                $.each(peg_horiz_arr, function (k, details) {
                    peg_horiz_details.push(objects.X + peg_horiz_arr[k]);
                });
                objects.peg_horiz_details = peg_horiz_details;
            }
        }
    }
    for (const objects of mod_bal_shelf) {
        var max_merch = get_shelf_max_merch(g_pog_json[p_pog_index].ModuleInfo[objects.MIndex], g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex], objects.MIndex, objects.SIndex, p_pog_index, parseFloat($v("P25_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload
        objects.MaxMerch = max_merch;
    }

    console.log("rule_dtl", p_rule_dtl, l_shelf_details);
    if (p_rule_dtl[4] == "P") {
        if (p_rule_dtl[1] == "LRTB" || p_rule_dtl[1] == "TBLR") {
            var sorto = {
                Y: "desc",
            };
        } else {
            var sorto = {
                Y: "asc",
            };
        }
    } else {
        if (p_rule_dtl[1] == "LRTB" || p_rule_dtl[1] == "TBLR") {
            var sorto = {
                MIndex: "asc",
                X: "asc",
                Y: "desc",
            };
        } else {
            var sorto = {
                MIndex: "asc",
                X: "asc",
                Y: "asc",
            };
        }
    }
    l_shelf_details.keySort(sorto);
    details = {};
    details["ShelfDetails"] = l_shelf_details;
    details["ModBalance"] = mod_bal_shelf;
    final_list.push(details);
    return final_list;
}

async function load_autofill_items(p_pog_index, p_rule_id) {
    //ASA-1451
    var rule_dtl = p_rule_id.split(","); //$v("P25_POG_RULE").split(",");//ASA-1451
    apex.theme.closeRegion("auto_fill_reg");
    addLoadingIndicator();
    var final_list = get_shelf_list(rule_dtl, $v("P25_BLOCK_SELECTION"), p_pog_index);
    var p = apex.server.process(
        "GET_AUTOFILL_ITEMS", {
        x01: rule_dtl[0],
        x02: $v("P25_BLOCK_SELECTION"),
        p_clob_01: JSON.stringify(final_list),
    }, {
        dataType: "html",
    });
    p.done(async function (pdata) {
        var return_data = $.trim(pdata);
        console.log("return_data", return_data);
        if (return_data.match(/ERROR.*/)) {
            raise_error(return_data);
            removeLoadingIndicator(regionloadWait);
        } else if (return_data !== "") {
            try {
                var return_arr = JSON.parse(return_data);
                var items_list = [];
                var old_pogIndex = p_pog_index;
                console.log("return_arr", return_arr);
                if ($v("P25_BLOCK_SELECTION") == "M") {
                    for (const obj of return_arr) {
                        items_list = items_list.concat(JSON.parse(obj));
                    }
                    console.log("items_list", items_list);
                } else {
                    items_list = return_arr;
                }
                var retval = await add_autofill_item_to_shelf(items_list, rule_dtl, $v("P25_BLOCK_SELECTION"), p_pog_index);
                g_json = [g_pog_json[p_pog_index]]; //ASA-1552
                init(p_pog_index);
                objects = {};
                objects["scene"] = g_scene;
                objects["renderer"] = g_renderer;
                g_scene_objects[p_pog_index] = objects;
                set_indicator_objects(p_pog_index);
                modifyWindowAfterMinMax(g_scene_objects);
                var POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
                g_world = g_scene_objects[p_pog_index].scene.children[2];
                g_camera = g_scene_objects[p_pog_index].scene.children[0];
                var returnval = await save_update_json_items(g_pog_json);
                var return_val = await create_module_from_json(POG_JSON, "Y", "F", $v("P25_PRODUCT_BTN_CLICK"), "N", "Y", "N", "Y", "Y", "", "N", g_scene_objects[p_pog_index].scene.children[0], g_scene_objects[p_pog_index].scene, p_pog_index, p_pog_index, "N", []);
                g_pog_index = p_pog_index;
                g_pog_json[p_pog_index].AFBlk = g_mod_block_list; //ASA-1694 move after function call create_module_from_json
                clear_auto_fill_coll();
                g_auto_fill_reg_open = "N";
                g_auto_fill_active = "N";
                g_autofill_edit = "N";
                var res = await calculateFixelAndSupplyDays("N", p_pog_index);
                render(p_pog_index);
                removeLoadingIndicator(regionloadWait); //ASA-1552
            } catch (err) {
                console.log("err", err);
                raise_error(err);
                // removeLoadingIndicator(regionloadWait);  //ASA-1552
            }

            console.log("items_list", items_list);
        } else {
            raise_error("Something went wrong");
            removeLoadingIndicator(regionloadWait);
        }
    });
}

async function update_shelf_max_items(p_items_list, p_rule_dtl, p_blk_selection, p_pog_index, p_shelf_details) {
    var item_tot_width = 0,
        rod_tot_depth = 0,
        item_cnt = 0;

    var lookup = {};
    var items = g_mod_block_list;
    var unique_blk = [];

    for (var item, i = 0; (item = items[i++]);) {
        var name = "abc";
        name = item.BlkName;
        if (!(name in lookup)) {
            lookup[name] = 1;
            unique_blk.push(name);
        }
    }

    if (unique_blk.length > 0) {
        for (const blk_name of unique_blk) {
            for (const items of p_items_list) {
                if (items.RemovedItem == "N" && items.BlkName == blk_name) {
                    item_tot_width += items.W;
                    item_cnt++;
                }
            }
            var tot_shelf_width = 0;
            for (const shelf_info of p_shelf_details) {
                if (shelf_info.ObjType !== "ROD" && shelf_info.ObjType !== "PEGBOARD" && shelf_info.NoItem == "N") {
                    tot_shelf_width += shelf_info.CalcWidth;
                }
                if (shelf_info.ObjType == "PEGBOARD" && shelf_info.BlkName == blk_name) {
                    var i = 0;
                    var tot_width = 0,
                        tot_no = 1;
                    for (const items of p_items_list) {
                        if (items.RemovedItem == "N" && items.BlkName == blk_name) {
                            var g_item_index = set_item_details(items, shelf_info.MIndex, shelf_info.SIndex, -1, "", "");
                            g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo[g_item_index].FromProductList = "Y";
                            var shelfs = g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex];
                            if (g_item_index == 0) {
                                var shelf_start = shelfs.X - shelfs.W / 2 - shelfs.LOverhang + shelfs.HorizSpacing;
                                g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo[g_item_index].X = shelf_start + items.W / 2;
                            } else {
                                g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo[g_item_index].X = shelfs.ItemInfo[g_item_index - 1].X + shelfs.ItemInfo[g_item_index - 1].W / 2 + items.W / 2 + shelfs.HorizSpacing;
                            }
                            var [itemx, itemy] = get_item_xy(shelfs, items, items.W, items.H, g_pog_json);
                            g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo[g_item_index].Y = itemy;

                            var return_val = await find_pegboard_gap(items.W, items.H, items.X, items.Y, shelf_info.VertiSpacing, shelf_info.MIndex, shelf_info.SIndex, g_item_index, g_item_index, "Y", p_pog_index, "Y", g_auto_x_space, g_auto_y_space); //ASA-1300 added g_auto_x_space,g_auto_y_space
                            if (return_val == "N") {
                                break;
                            } else {
                                tot_width += items.W;
                                tot_no = tot_no + 1;
                            }
                        }
                        i++;
                    }
                    shelf_info.ItemInfo = [];
                    g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo = [];
                    shelf_info.TotalItemW = tot_width;
                    shelf_info.TotItems = tot_no;
                    tot_shelf_width += tot_width;
                } else if (shelf_info.ObjType == "ROD" && shelf_info.BlkName == blk_name) {
                    rod_tot_depth += shelf_info.D;
                }
            }

            var tot_depth = 0,
                tot_no = 0,
                prev_W = -1,
                rod_item_width = 0;
            if (rod_tot_depth > 0) {
                for (const items of p_items_list) {
                    if (items.RemovedItem == "N" && items.BlkName == blk_name) {
                        if (rod_tot_depth < tot_depth) {
                            tot_no = tot_no - 1;
                            rod_item_width = rod_item_width - prev_W;
                            break;
                        }
                        tot_depth += items.D;
                        rod_item_width += items.W;
                        tot_no = tot_no + i;
                        prev_W = items.W;
                    }
                    i++;
                }
            }
            var shelf_cnt = 0,
                tot_shelf = 0;
            for (const shelf_info of p_shelf_details) {
                if (shelf_info.NoItem == "N" && shelf_info.BlkName == blk_name) {
                    tot_shelf++;
                    shelf_info.CalcSize = -1;
                    if (shelf_info.ObjType !== "ROD") {
                        shelf_cnt++;
                    }
                }
            }
            console.log("tot_shelf", tot_shelf, tot_shelf_width, item_tot_width, item_cnt);
            if (tot_shelf_width > item_tot_width - rod_item_width && item_cnt > tot_shelf) {
                var reminder = item_cnt % tot_shelf;
                console.log("reminder", reminder);
                for (const shelf_info of p_shelf_details) {
                    if (shelf_info.BlkName == blk_name) {
                        shelf_info.CalcSize = -1;
                        if (reminder > 0) {
                            shelf_info.ItemsCnt = Math.floor(item_cnt / tot_shelf) + 1;
                            reminder--;
                        } else {
                            shelf_info.ItemsCnt = Math.floor(item_cnt / tot_shelf);
                        }
                    }
                }
            } else {
                if (item_cnt <= tot_shelf) {
                    for (const shelf_info of p_shelf_details) {
                        if (shelf_info.BlkName == blk_name) {
                            shelf_info.CalcSize = 0;
                        }
                    }
                } else if (tot_shelf_width < item_tot_width) {
                    for (const shelf_info of p_shelf_details) {
                        if (shelf_info.ObjType !== "ROD" && shelf_info.BlkName == blk_name) {
                            shelf_info.CalcSize = -1;
                        }
                    }
                }
            }
        }
    } else {
        var item_tot_width = 0,
            rod_tot_depth = 0,
            item_cnt = 0;
        for (const items of p_items_list) {
            if (items.RemovedItem == "N" && ((p_blk_selection == "P" && (items.BlkName == null || typeof items.BlkName == "undefined")) || (p_blk_selection == "M" && items.BlkName !== null))) {
                item_tot_width += items.W;
                item_cnt++;
            }
        }
        var tot_shelf_width = 0;
        for (const shelf_info of p_shelf_details) {
            if (shelf_info.ObjType !== "ROD" && shelf_info.ObjType !== "PEGBOARD" && shelf_info.NoItem == "N") {
                tot_shelf_width += shelf_info.W;
            }
            if (shelf_info.ObjType == "PEGBOARD") {
                var i = 0;
                var tot_width = 0,
                    tot_no = 1;
                for (const items of p_items_list) {
                    if (items.RemovedItem == "N" && ((p_blk_selection == "P" && (items.BlkName == null || typeof items.BlkName == "undefined")) || (p_blk_selection == "M" && items.BlkName !== null))) {
                        var g_item_index = set_item_details(items, shelf_info.MIndex, shelf_info.SIndex, -1, "", "");
                        g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo[g_item_index].FromProductList = "Y";
                        var shelfs = g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex];
                        if (g_item_index == 0) {
                            var shelf_start = shelfs.X - shelfs.W / 2 - shelfs.LOverhang + shelfs.HorizSpacing;
                            g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo[g_item_index].X = shelf_start + items.W / 2;
                        } else {
                            g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo[g_item_index].X = shelfs.ItemInfo[g_item_index - 1].X + shelfs.ItemInfo[g_item_index - 1].W / 2 + items.W / 2 + shelfs.HorizSpacing;
                        }
                        var [itemx, itemy] = get_item_xy(shelfs, items, items.W, items.H, g_pog_json);
                        g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo[g_item_index].Y = itemy;

                        var return_val = await find_pegboard_gap(items.W, items.H, items.X, items.Y, shelf_info.VertiSpacing, shelf_info.MIndex, shelf_info.SIndex, g_item_index, g_item_index, "Y", p_pog_index, "Y", g_auto_x_space, g_auto_y_space); //ASA-1300 added g_auto_x_space,g_auto_y_space
                        if (return_val == "N") {
                            break;
                        } else {
                            tot_width += items.W;
                            tot_no = tot_no + 1;
                        }
                    }
                    i++;
                }
                shelf_info.ItemInfo = [];
                g_pog_json[p_pog_index].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo = [];
                shelf_info.TotalItemW = tot_width;
                shelf_info.TotItems = tot_no;
                tot_shelf_width += tot_width;
            } else if (shelf_info.ObjType == "ROD") {
                rod_tot_depth += shelf_info.D;
            }
        }
        var tot_depth = 0,
            tot_no = 0,
            prev_W = -1,
            rod_item_width = 0;
        if (rod_tot_depth > 0) {
            for (const items of p_items_list) {
                if (items.RemovedItem == "N" && ((p_blk_selection == "P" && (items.BlkName == null || typeof items.BlkName == "undefined")) || (p_blk_selection == "M" && items.BlkName !== null))) {
                    if (rod_tot_depth < tot_depth) {
                        tot_no = tot_no - 1;
                        rod_item_width = rod_item_width - prev_W;
                        break;
                    }
                    tot_depth += items.D;
                    rod_item_width += items.W;
                    tot_no = tot_no + i;
                    prev_W = items.W;
                }
                i++;
            }
        }
        var shelf_cnt = 0,
            tot_shelf = 0;
        for (const shelf_info of p_shelf_details) {
            if (shelf_info.NoItem == "N") {
                tot_shelf++;
                shelf_info.CalcSize = -1;
                if (shelf_info.ObjType !== "ROD") {
                    shelf_cnt++;
                }
            }
        }
        console.log("tot_shelf", tot_shelf, tot_shelf_width, item_tot_width, item_cnt);
        if (tot_shelf_width > item_tot_width - rod_item_width && item_cnt > tot_shelf) {
            var reminder = item_cnt % tot_shelf;
            for (const shelf_info of p_shelf_details) {
                shelf_info.CalcSize = -1;
                if (reminder > 0) {
                    shelf_info.ItemsCnt = Math.floor(item_cnt / tot_shelf) + 1;
                    reminder--;
                } else {
                    shelf_info.ItemsCnt = Math.floor(item_cnt / tot_shelf);
                }
            }
        } else {
            if (item_cnt <= tot_shelf) {
                for (const shelf_info of p_shelf_details) {
                    //if (shelf_info.ObjType !== 'ROD') {
                    shelf_info.CalcSize = 0;
                    //}
                }
            } else if (tot_shelf_width < item_tot_width) {
                //ASA-1520 #3 Start
                var reminder = item_cnt % tot_shelf;
                for (const shelf_info of p_shelf_details) {
                    if (shelf_info.ObjType !== "ROD") {
                        shelf_info.CalcSize = -1;
                    }
                    if (reminder > 0) {
                        shelf_info.ItemsCnt = Math.floor(item_cnt / tot_shelf) + 1;
                        reminder--;
                    } else {
                        shelf_info.ItemsCnt = Math.floor(item_cnt / tot_shelf);
                    }
                }
                //ASA-1520 #3 End
            }
        }
    }
    console.log("reminder", p_items_list, p_shelf_details);
    return [p_items_list, p_shelf_details];
}

async function add_shelf_items(p_items_list, p_rule_dtl, p_blk_selection, p_pog_index, p_shelf_details) {
    console.log("add_shelf_items", p_items_list, p_rule_dtl, p_blk_selection, p_pog_index, p_shelf_details);
    var module = "";
    var shelf = "";
    var old_mod_index = -1;
    var old_shelf_index = -1;
    var max_height = 0.02;
    var max_depth = 0.4;
    var k = 0;
    var i = 0;

    if (p_rule_dtl[4] == "P") {
        if (p_rule_dtl[1] == "LRTB") {
            var sorto = {
                Y: "desc",
            };
        } else if (p_rule_dtl[1] == "LRBT") {
            var sorto = {
                Y: "asc",
            };
        } else if (p_rule_dtl[1] == "BTLR") {
            var sorto = {
                MIndex: "asc",
                Y: "asc",
            };
        } else if (p_rule_dtl[1] == "TBLR") {
            var sorto = {
                MIndex: "asc",
                Y: "desc",
            };
        }
    } else {
        if (p_rule_dtl[1] == "LRTB") {
            var sorto = {
                MIndex: "asc",
                Y: "desc",
            };
        } else if (p_rule_dtl[1] == "LRBT") {
            var sorto = {
                MIndex: "asc",
                Y: "asc",
            };
        } else if (p_rule_dtl[1] == "BTLR") {
            var sorto = {
                MIndex: "asc",
                Y: "asc",
            };
        } else if (p_rule_dtl[1] == "TBLR") {
            var sorto = {
                MIndex: "asc",
                Y: "desc",
            };
        }
    }
    p_shelf_details.keySort(sorto);

    var [p_items_list, p_shelf_details] = await update_shelf_max_items(p_items_list, p_rule_dtl, p_blk_selection, p_pog_index, p_shelf_details);

    console.log("reminder 1", p_items_list, p_shelf_details);
    if (p_rule_dtl[1] == "LRTB" || p_rule_dtl[1] == "LRBT") {
        var i = 0;
        var j = 0;
        var invalid_items = [];
        for (const shelf_info of p_shelf_details) {
            if (shelf_info.NoItem == "N") {
                i = shelf_info.MIndex;
                j = shelf_info.SIndex;
                var div_array = [];
                var k = 0;
                var item_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                for (const item_arr of item_details) {
                    if (item_arr.Item == "DIVIDER") {
                        item_arr.Added = "N";
                        item_arr.BottomObjID = "";
                        item_arr.TopObjID = "";
                    }
                    k++;
                }
                k = 0;
                for (const item_arr of item_details) {
                    if (item_arr.Item == "DIVIDER") {
                        item_arr.Added = "N";
                        item_arr.BottomObjID = "";
                        item_arr.TopObjID = "";
                        div_array.push(JSON.parse(JSON.stringify(item_arr)));
                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.splice(k, 1);
                    }
                    k++;
                }
                if (shelf !== shelf_info && shelf !== "") {
                    update_item_distance(old_mod_index, old_shelf_index, p_pog_index);
                    var returnval = reorder_items(old_mod_index, old_shelf_index, p_pog_index);
                }
                shelf = shelf_info;
                var k = 0;
                for (const items of p_items_list) {
                    if (items.RemovedItem == "N" && ((p_blk_selection == "P" && (items.BlkName == null || typeof items.BlkName == "undefined")) || (p_blk_selection == "M" && items.BlkName == shelf_info.BlkName && items.BlkName !== null))) {
                        var shelf_obj_type = shelf_info.ObjType;
                        var item_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                        var shelf_obj_type = shelf_info.ObjType;
                        if (shelf_info.CalcSize > 0 && shelf_obj_type !== "ROD") {
                            var itemsSpace = 0;
                            var availableSpace = 0;
                            for (const obj of item_details) {
                                itemsSpace += obj.W;
                            }
                            availableSpace = shelf_info.CalcSize - itemsSpace;
                            if (availableSpace <= 0) {
                                break;
                            }
                        } else if (shelf_info.CalcSize == 0) {
                            if (item_details.length == 1) {
                                break;
                            }
                        } else {
                            if (shelf_obj_type == "PALLET" || shelf_obj_type == "CHEST") {
                                var itemsSpace = 0;
                                var availableSpace = 0;
                                for (const obj of item_details) {
                                    itemsSpace += obj.W;
                                }
                                availableSpace = shelf_info.CalcWidth - itemsSpace;
                                if (availableSpace <= 0) {
                                    break;
                                }
                            }
                        }

                        //getting dimension according to orientation.
                        var [width, height, depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.W, items.H, items.D);
                        items.W = width;
                        items.H = height;
                        items.D = depth;
                        var horiz_facing = 1;

                        var g_item_index = set_item_details(items, i, j, -1, "", "");

                        var item_arr = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index];
                        var spread_gap = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].HorizGap;
                        var spread_product = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].SpreadItem;
                        var horiz_gap = spread_gap;
                        var item_length = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.length;
                        var itemy = -1;

                        if (shelf_obj_type == "PEGBOARD") {
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Exists = "N";
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].FromProductList = "Y";
                            var shelfs = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j];
                            if (g_item_index == 0) {
                                var shelf_start = shelfs.X - shelfs.W / 2 - shelfs.LOverhang + shelfs.HorizSpacing;
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].X = shelf_start + item_arr.W / 2;
                            } else {
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].X = shelfs.ItemInfo[g_item_index - 1].X + shelfs.ItemInfo[g_item_index - 1].W / 2 + item_arr.W / 2 + shelfs.HorizSpacing;
                            }
                            var [itemx, itemy] = get_item_xy(shelfs, item_arr, item_arr.W, item_arr.H, p_pog_index);
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Y = itemy;
                        } else {
                            var shelfs = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j];
                            var [itemx, itemy] = get_item_xy(shelfs, item_arr, item_arr.W, item_arr.H, p_pog_index);
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Y = itemy;
                            if (shelf_obj_type == "PALLET") {
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Z = 0;
                            }

                            var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, i, j, g_item_index, "Y", item_length, "N", p_pog_index);
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].X = new_x;
                            for (const div_arr of div_array) {
                                if (new_x >= div_arr.X && div_arr.Added == "N") {
                                    div_arr.Added = "Y";
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.splice(g_item_index, 0, div_arr);
                                    g_item_index = g_item_index + 1;
                                    var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, i, j, g_item_index, "Y", item_length, "N", p_pog_index);
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].X = new_x;
                                    break;
                                }
                            }
                        }
                        var nesting_val = 0;
                        if (item_arr.ItemNesting !== "") {
                            if (item_arr.ItemNesting == "W") {
                                nesting_val = item_arr.OrgNW;
                            } else if (item_arr.ItemNesting == "H") {
                                nesting_val = item_arr.OrgNH;
                            } else if (item_arr.ItemNesting == "D") {
                                nesting_val = item_arr.OrgND;
                            }
                        }

                        //ASA-1697 Start
                        const shelfActWidth = shelf_info.W;
                        const calcWidth = shelf_info.CalcWidth;
                        var blkWidth = shelfActWidth;
                        for (const blkInfo of g_mod_block_list) {
                            if (p_blk_selection == "M" && blkInfo.BlkName == items.BlkName && blkInfo.BlkName == shelf_info.BlkName) {
                                blkWidth = blkInfo.BlockDim.BlkWidth;
                                break;
                            }
                        }
                        // shelf_info.CalcWidth = blkWidth; //ASA-1727 issue 12
                        // shelf_info.W = blkWidth; //ASA-1727 issue 12
                        //ASA-1697 End
                        var [select_width, select_height, select_depth] = get_select_dim(item_arr);
                        const [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(i, j, g_item_index, select_width, select_height, select_depth, item_arr.ItemNesting, nesting_val, item_arr.BHoriz, item_arr.BVert, item_arr.BaseD, item_arr.Orientation, item_arr.OrgCWPerc, item_arr.OrgCHPerc, item_arr.OrgCDPerc, "N", "Y", "N", p_pog_index);
                        shelf_info.W = shelfActWidth; //ASA-1697
                        var exceeded_width = "N";
                        var item_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                        if (typeof shelf_info.ItemsCnt !== "undefined" && shelf_info.ItemsCnt > 0 && shelf_obj_type !== "ROD") {
                            var itemsSpace = 0;
                            var availableSpace = 0;
                            for (const obj of item_details) {
                                itemsSpace += obj.W;
                            }
                            availableSpace = shelf_info.CalcWidth - itemsSpace;
                            if (shelf_info.CalcWidth > 0 && availableSpace <= 0) {
                                exceeded_width = "Y";
                            }
                            else if (shelf_info.ItemsCnt < item_details.length) {
                                exceeded_width = "Y";
                            }
                        }
                        console.log("item_arr", item_arr.Item, exceeded_width);
                        if (item_width !== "ERROR" && exceeded_width == "N") {
                            update_item_org_dim(i, j, g_item_index, item_width, item_height, item_depth, real_width, real_height, real_depth, p_pog_index);
                            var shelfs = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j];
                            var l_items_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index];
                            var [itemx, itemy] = get_item_xy(shelfs, l_items_details, l_items_details.W, l_items_details.H, p_pog_index);
                            if ((typeof l_items_details.BottomObjID == "undefined" || l_items_details.BottomObjID == "") && (typeof l_items_details.TopObjID == "undefined" || l_items_details.TopObjID == "")) {
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Y = itemy;
                            }
                            items.RemovedItem = "Y";
                        } else {
                            items.W = items.OrgUW;
                            items.H = items.OrgUH;
                            items.D = items.OrgUD;
                            items.RW = items.W;
                            items.RH = items.H;
                            items.RD = items.D;
                            items.OW = items.OrgUW;
                            items.OH = items.OrgUH;
                            items.OD = items.OrgUD;
                            g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.splice(g_item_index, 1);
                            items.RemovedItem = "N";
                            var itemsSpace = 0;
                            var availableSpace = 0;
                            var max_item_width = 0;
                            if (shelf_obj_type !== "ROD") {
                                for (const obj of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                    itemsSpace += obj.W;
                                }
                                for (const obj of p_items_list) {
                                    if (obj.RemovedItem == "N") {
                                        max_item_width = Math.min(max_item_width, obj.W);
                                    }
                                }
                            } else {
                                for (const obj of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                    itemsSpace += obj.D + shelf_info.DGap;
                                }
                                for (const obj of p_items_list) {
                                    if (obj.RemovedItem == "N") {
                                        max_item_width = Math.min(max_item_width, obj.D);
                                    }
                                }
                            }
                            if (shelf_info.CalcSize > 0 && shelf_obj_type !== "ROD") {
                                availableSpace = shelf_info.CalcSize - itemsSpace;
                            } else {
                                if (shelf_obj_type !== "ROD") {
                                    availableSpace = shelf_info.CalcWidth - itemsSpace;
                                } else {
                                    availableSpace = shelf_info.D - itemsSpace;
                                }
                            }
                            shelf_info.CalcWidth = calcWidth; //ASA-1697

                            if (availableSpace < max_item_width || availableSpace <= 0) {
                                break;
                            } else {
                                continue;
                            }
                        }
                    }
                    k++;
                }

                old_mod_index = i;
                old_shelf_index = j;
            }
        }
    } else {
        var shelf_cnt = -1;
        for (const shelf_info of p_shelf_details) {
            if (shelf_info.NoItem == "N") {
                shelf_cnt++;
            }
        }

        var k = 0;
        var prev_shelf = -1;
        for (const items of p_items_list) {
            if (items.RemovedItem == "N") {
                var i = 0;
                var j = 0;
                var invalid_items = [];
                var l = 0;
                for (const shelf_info of p_shelf_details) {
                    if (l > prev_shelf) {
                        if (shelf_info.NoItem == "N" && items.RemovedItem == "N" && ((p_blk_selection == "P" && (items.BlkName == null || (typeof items.BlkName == null) == "undefined")) || (p_blk_selection == "M" && items.BlkName == shelf_info.BlkName && items.BlkName !== null))) {
                            i = shelf_info.MIndex;
                            j = shelf_info.SIndex;
                            var div_array = [];
                            var k = 0;
                            var item_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                            for (const item_arr of item_details) {
                                if (item_arr.Item == "DIVIDER") {
                                    item_arr.Added = "N";
                                    item_arr.BottomObjID = "";
                                    item_arr.TopObjID = "";
                                    div_array.push(JSON.parse(JSON.stringify(item_arr)));
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.splice(k, 1);
                                }
                                k++;
                            }

                            if (shelf !== shelf_info && shelf !== "") {
                                update_item_distance(old_mod_index, old_shelf_index, p_pog_index);
                            }
                            if (shelf_cnt == l) {
                                prev_shelf = -1;
                            } else {
                                prev_shelf = l;
                            }
                            shelf = shelf_info;
                            var shelf_obj_type = shelf_info.ObjType;
                            var item_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                            var shelf_obj_type = shelf_info.ObjType;
                            if (shelf_info.CalcSize > 0 && shelf_obj_type !== "ROD") {
                                var itemsSpace = 0;
                                var availableSpace = 0;
                                for (const obj of item_details) {
                                    itemsSpace += obj.W;
                                }
                                availableSpace = shelf_info.CalcSize - itemsSpace;
                                if (availableSpace <= 0) {
                                    break;
                                }
                            } else if (shelf_info.CalcSize == 0) {
                                if (item_details.length == 1) {
                                    break;
                                }
                            } else {
                                if (shelf_obj_type == "PALLET" || shelf_obj_type == "CHEST") {
                                    var itemsSpace = 0;
                                    var availableSpace = 0;
                                    for (const obj of item_details) {
                                        itemsSpace += obj.W;
                                    }
                                    availableSpace = shelf_info.CalcWidth - itemsSpace;
                                    if (availableSpace <= 0) {
                                        break;
                                    }
                                }
                            }

                            //getting dimension according to orientation.
                            var [width, height, depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.W, items.H, items.D);
                            items.W = width;
                            items.H = height;
                            items.D = depth;
                            var horiz_facing = 1;

                            var g_item_index = set_item_details(items, i, j, -1, "", "");

                            var item_arr = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index];
                            var spread_gap = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].HorizGap;
                            var spread_product = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].SpreadItem;
                            var horiz_gap = spread_gap;
                            var item_length = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.length;
                            var itemy = -1;

                            if (shelf_obj_type == "PEGBOARD") {
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Exists = "N";
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].FromProductList = "Y";
                                var shelfs = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j];
                                if (g_item_index == 0) {
                                    var shelf_start = shelfs.X - shelfs.W / 2 - shelfs.LOverhang + shelfs.HorizSpacing;
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].X = shelf_start + item_arr.W / 2;
                                } else {
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].X = shelfs.ItemInfo[g_item_index - 1].X + shelfs.ItemInfo[g_item_index - 1].W / 2 + item_arr.W / 2 + shelfs.HorizSpacing;
                                }
                                var [itemx, itemy] = get_item_xy(shelfs, item_arr, item_arr.W, item_arr.H, p_pog_index);
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Y = itemy;
                            } else {
                                var shelfs = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j];
                                var [itemx, itemy] = get_item_xy(shelfs, item_arr, item_arr.W, item_arr.H, p_pog_index);
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Y = itemy;
                                if (shelf_obj_type == "PALLET") {
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Z = 0;
                                }

                                var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, i, j, g_item_index, "Y", item_length, "N", p_pog_index);

                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].X = new_x;
                                for (const div_arr of div_array) {
                                    if (new_x >= div_arr.X && div_arr.Added == "N") {
                                        div_arr.Added = "Y";
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.splice(g_item_index, 0, div_arr);
                                        g_item_index = g_item_index + 1;
                                        var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, i, j, g_item_index, "Y", item_length, "N", p_pog_index);
                                        g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].X = new_x;
                                        break;
                                    }
                                }
                            }

                            var nesting_val = 0;
                            if (item_arr.ItemNesting !== "") {
                                if (item_arr.ItemNesting == "W") {
                                    nesting_val = item_arr.OrgNW;
                                } else if (item_arr.ItemNesting == "H") {
                                    nesting_val = item_arr.OrgNH;
                                } else if (item_arr.ItemNesting == "D") {
                                    nesting_val = item_arr.OrgND;
                                }
                            }
                            //ASA-1697 Start
                            const shelfActWidth = shelf_info.W;
                            const calcWidth = shelf_info.CalcWidth;
                            var blkWidth = shelfActWidth;
                            for (const blkInfo of g_mod_block_list) {
                                if (p_blk_selection == "M" && blkInfo.BlkName == items.BlkName && blkInfo.BlkName == shelf_info.BlkName) {
                                    blkWidth = blkInfo.BlockDim.BlkWidth;
                                    break;
                                }
                            }
                            shelf_info.CalcWidth = blkWidth;
                            shelf_info.W = blkWidth;
                            //ASA-1697 End
                            var [select_width, select_height, select_depth] = get_select_dim(item_arr);
                            const [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(i, j, g_item_index, select_width, select_height, select_depth, item_arr.ItemNesting, nesting_val, item_arr.BHoriz, item_arr.BVert, item_arr.BaseD, item_arr.Orientation, item_arr.OrgCWPerc, item_arr.OrgCHPerc, item_arr.OrgCDPerc, "N", "Y", "N", p_pog_index);
                            shelf_info.W = shelfActWidth; //ASA-1697
                            var exceeded_width = "N";
                            var item_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
                            if (typeof shelf_info.ItemsCnt !== "undefined" && shelf_info.ItemsCnt > 0 && shelf_obj_type !== "ROD") {
                                var itemsSpace = 0;
                                var availableSpace = 0;
                                for (const obj of item_details) {
                                    itemsSpace += obj.W;
                                }
                                availableSpace = shelf_info.CalcWidth - itemsSpace;
                                if (shelf_info.CalcWidth > 0 && availableSpace <= 0) {
                                    exceeded_width = "Y";
                                } else if (shelf_info.ItemsCnt < item_details.length) {
                                    exceeded_width = "Y";
                                }
                            }
                            console.log("item_arr", item_arr.Item, exceeded_width);
                            if (item_width !== "ERROR" && exceeded_width == "N") {
                                update_item_org_dim(i, j, g_item_index, item_width, item_height, item_depth, real_width, real_height, real_depth, p_pog_index);
                                var shelfs = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j];
                                var l_items_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index];
                                var [itemx, itemy] = get_item_xy(shelfs, l_items_details, l_items_details.W, l_items_details.H, p_pog_index);
                                console.log("l_items_details", l_items_details.W, l_items_details.Item);
                                if ((typeof l_items_details.BottomObjID == "undefined" || l_items_details.BottomObjID == "") && (typeof l_items_details.TopObjID == "undefined" || l_items_details.TopObjID == "")) {
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[g_item_index].Y = itemy;
                                }
                                items.RemovedItem = "Y";
                            } else {
                                items.W = items.OrgUW;
                                items.H = items.OrgUH;
                                items.D = items.OrgUD;
                                items.RW = items.W;
                                items.RH = items.H;
                                items.RD = items.D;
                                items.OW = items.OrgUW;
                                items.OH = items.OrgUH;
                                items.OD = items.OrgUD;
                                console.log("in error", items.Item, items.OrgUW, items.OrgUH, items.W);
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo.splice(g_item_index, 1);
                                items.RemovedItem = "N";
                                var itemsSpace = 0;
                                var availableSpace = 0;
                                var max_item_width = 0;
                                if (shelf_obj_type !== "ROD") {
                                    for (const obj of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                        itemsSpace += obj.W;
                                    }
                                    for (const obj of p_items_list) {
                                        if (obj.RemovedItem == "N") {
                                            max_item_width = Math.min(max_item_width, obj.W);
                                        }
                                    }
                                } else {
                                    for (const obj of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                        itemsSpace += obj.D + shelf_info.DGap;
                                    }
                                    for (const obj of p_items_list) {
                                        if (obj.RemovedItem == "N") {
                                            max_item_width = Math.min(max_item_width, obj.D);
                                        }
                                    }
                                }
                                if (shelf_info.CalcSize > 0 && shelf_obj_type !== "ROD") {
                                    availableSpace = shelf_info.CalcSize - itemsSpace;
                                } else {
                                    if (shelf_obj_type !== "ROD") {
                                        availableSpace = shelf_info.CalcWidth - itemsSpace;
                                    } else {
                                        availableSpace = shelf_info.D - itemsSpace;
                                    }
                                }
                                l++;
                                shelf_info.CalcWidth = calcWidth; //ASA-1697
                                if (availableSpace < max_item_width || availableSpace <= 0) {
                                    break;
                                } else {
                                    continue;
                                }
                            }
                        }
                    }
                    old_mod_index = i;
                    old_shelf_index = j;
                    l++;
                }
            }
        }
        var i = 0,
            j = 0;
        for (const shelf_info of p_shelf_details) {
            i = shelf_info.MIndex;
            j = shelf_info.SIndex;
            update_item_distance(i, j, p_pog_index);
            var returnval = reorder_items(i, j, p_pog_index);
        }
    }
}

async function add_autofill_item_to_shelf(p_items_list, p_rule_dtl, p_blk_selection, p_pog_index) {
    var l_temp_overhang = g_overhung_shelf_active;  //ASA-1727- issue - 2 start 
    if (g_overhung_shelf_active == "Y") {
        g_overhung_shelf_active = "N"
    }
    //ASA-1727- issue - 2 end 
    var max_depth = 0.4;
    var i = 0;
    var l_shelf_details = [];
    var total_shelf = [];
    var mod_bal_shelf = [];
    var label_list = $v("P25_POGCR_FIXEL_TYPES").split(",");
    var textbox_list = [];

    /*
     *Getting all the shelfs from all module and order based on placing.
     *
     */
    for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
        if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
            var j = 0;
            var mod_top = modules_info.Y + modules_info.H / 2;
            var mod_bottom = modules_info.Y - modules_info.H / 2;
            for (const shelf_info of modules_info.ShelfInfo) {
                if (label_list.some((v) => shelf_info.Shelf.includes(v)) && shelf_info.ObjType == "TEXTBOX" && shelf_info.Y < mod_top && shelf_info.Y > mod_bottom) {
                    textbox_list.push(shelf_info);
                    shelf_info.SIndex = j;
                    shelf_info.MIndex = i;
                    shelf_info.CalcWidth = shelf_info.W;
                }
                if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                    total_shelf.push(shelf_info);
                    shelf_info.SIndex = j;
                    shelf_info.MIndex = i;
                    shelf_info.NoItem = "N";
                    shelf_info.CalcWidth = shelf_info.W;
                }
                j++;
            }
        }
        i++;
    }

    if (textbox_list.length > 0) {
        for (const obj of textbox_list) {
            var y_value = -121;
            var i = 0,
                index = -1;
            for (const shelf_info of total_shelf) {
                if (obj.Y > shelf_info.Y && shelf_info.Y > y_value && obj.X > shelf_info.X - shelf_info.W / 2 && obj.X < shelf_info.X + shelf_info.W / 2) {
                    y_value = shelf_info.Y;
                    index = i;
                }
                i++;
            }
            if (index !== -1) {
                if (total_shelf[index].W <= obj.W) {
                    total_shelf[index].NoItem = "Y";
                } else {
                    total_shelf[index].CalcWidth = total_shelf[index].W - obj.W;
                    total_shelf[index].NoItem = "N";
                }
                console.log("index 1", total_shelf[index].NoItem, total_shelf[index].Shelf);
            }
        }
    }
    if (p_blk_selection == "P") {
        l_shelf_details = total_shelf;
    } else {
        for (const objects of g_mod_block_list) {
            l_shelf_details = l_shelf_details.concat(objects.g_delete_details);
        }
        for (const objects of l_shelf_details) {
            objects.NoItem = "N";
        }
        for (const objects of l_shelf_details) {
            for (const tot of total_shelf) {
                if (tot.NoItem == "Y" && tot.MIndex == objects.MIndex && tot.SIndex == objects.SIndex) {
                    objects.NoItem = "Y";
                }
                if (tot.MIndex == objects.MIndex && tot.SIndex == objects.SIndex) {
                    objects.CalcWidth = tot.CalcWidth;
                }
            }
        }
        mod_bal_shelf = total_shelf.filter((f) => !l_shelf_details.some((d) => d.MIndex + "-" + d.SIndex == f.MIndex + "-" + f.SIndex));
    }

    var l_temp_arr = [];
    for (const objects of l_shelf_details) {
        if (objects.NoItem == "N") {
            l_temp_arr.push(objects);
        }
    }
    l_shelf_details = l_temp_arr;

    var l_temp_arr = [];
    for (const objects of mod_bal_shelf) {
        if (objects.NoItem == "N") {
            l_temp_arr.push(objects);
        }
    }
    mod_bal_shelf = l_temp_arr;

    await add_shelf_items(p_items_list, p_rule_dtl, p_blk_selection, p_pog_index, l_shelf_details);

    // if (p_blk_selection == "M" && mod_bal_shelf.length > 0) {
    //     await add_shelf_items(p_items_list, p_rule_dtl, "P", p_pog_index, mod_bal_shelf);
    // }


    let l_itemsRemain = p_items_list.some(i => i.RemovedItem == "N"); //ASA-1727 issue-12 start 

    if (p_blk_selection == "M" && l_itemsRemain && mod_bal_shelf.length > 0) {
        await add_shelf_items(p_items_list, p_rule_dtl, "P", p_pog_index, mod_bal_shelf);
    }


    let l_shelvesfull =
        l_shelf_details.every(s => s.NoItem == "Y" || s.CalcWidth <= 0) &&
        mod_bal_shelf.every(s => s.NoItem == "Y" || s.CalcWidth <= 0);
    //ASA-1727 issue-12 End

    /*
     *Cheking any balance items and place them in carpark
     *
     */
    var balance_item = "N";
    // balance_item = p_items_list.some(i => i.RemovedItem == "N");//ASA-1727 issue-3 fix start
    for (const items of p_items_list) {
        if (items.RemovedItem == "N") {
            balance_item = "Y";
            break;
        }
    }   //ASA-1727 issue-3 fix End

    if (balance_item == "Y") {
        var details = get_min_max_xy(p_pog_index);
        var details_arr = details.split("###");
        var mod_index = -1;
        var i = 0;
        for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
            if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
                mod_index = i;
                break;
            }
            i++;
        }
        var carpark_items = [];
        var total_width = 0;
        for (const items of p_items_list) {
            if (items.RemovedItem == "N") {
                total_width += items.W;
                if (total_width > g_pog_json[p_pog_index].W) {
                    break;
                } else {
                    carpark_items.push(items);
                }
            }
        }
        var max_depth = 0;
        for (const parkitems of carpark_items) {
            max_depth = Math.max(max_depth, parkitems.D);
            parkitems.MIndex = mod_index;
        }
        carpark_shelf(mod_index + 1, g_pog_json[p_pog_index].W, 0.04, max_depth + 0.1, g_pog_json[p_pog_index].W / 2, parseFloat(details_arr[1]) + 0.03, mod_index);
        var j = 0;
        for (const parkitems of carpark_items) {
            parkitems.MIndex = typeof parkitems.MIndex == "undefined" ? 0 : parkitems.MIndex;
            if (mod_index == parkitems.MIndex) {
                var item_obj = get_item_object(parkitems, mod_index, 0, -1, "", "");
                g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo.push(item_obj);
                var item_len = g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo.length - 1;
                var newx = (newy = -1);
                newy = g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].Y + g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].H / 2 + parkitems.H / 2;
                if (item_len == 0) {
                    newx = g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].X - g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].W / 2 + parkitems.W / 2;
                } else {
                    newx = g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo[g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo.length - 2].X + g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo[g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo.length - 2].W / 2 + parkitems.W / 2;
                }
                g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo[item_len].X = newx;
                g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo[item_len].Y = newy;
                g_pog_json[p_pog_index].ModuleInfo[mod_index].Carpark[0].ItemInfo[item_len].Z = 0.05;
            }
            j = j + 1;
        }
    }
    /*
     *Auto vertical and depth facing calculation for all item.
     *
     */
    var retval = await update_horiz_facings(total_shelf, p_pog_index);
    var i = 0;
    for (const modules_info of g_pog_json[p_pog_index].ModuleInfo) {
        if (typeof modules_info.ParentModule == "undefined" || modules_info.ParentModule == null) {
            $.each(modules_info.ShelfInfo, function (j, shelf_info) {
                if (shelf_info.ObjType !== "BASE" && shelf_info.ObjType !== "NOTCH" && shelf_info.ObjType !== "DIVIDER" && shelf_info.ObjType !== "TEXTBOX") {
                    update_item_distance(i, j, p_pog_index);
                    if (reorder_items(i, j, p_pog_index) && shelf_info.ObjType !== "PEGBOARD") {
                        var update_div = "N";
                        $.each(shelf_info.ItemInfo, function (k, item_arr) {
                            if (item_arr.Item !== "DIVIDER") {
                                update_div = "Y";
                            }
                        });
                        if (shelf_info.SpreadItem !== "R") {
                            $.each(shelf_info.ItemInfo, function (k, item_arr) {
                                if ((item_arr.Item !== "DIVIDER" && update_div == "N") || update_div == "Y") {
                                    if (shelf_info.ObjType == "PALLET") {
                                        item_arr.Exists = "N";
                                        item_arr.Dragged = "N";
                                        g_edited_item_index = -1;
                                    }
                                    var new_x = get_item_xaxis(item_arr.W, item_arr.H, item_arr.D, shelf_info.ObjType, -1, shelf_info.HorizGap, shelf_info.SpreadItem, shelf_info.HorizGap, i, j, k, "Y", shelf_info.ItemInfo.length, "N", p_pog_index);
                                    var [itemx, itemy] = get_item_xy(shelf_info, item_arr, item_arr.W, item_arr.H, p_pog_index);

                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].X = new_x;
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Y = itemy;
                                }
                            });
                        } else {
                            var item_arr = shelf_info.ItemInfo;
                            for (var k = item_arr.length - 1; k >= 0; k--) {
                                if ((item_arr[k].Item !== "DIVIDER" && update_div == "N") || update_div == "Y") {
                                    if (shelf_info.ObjType == "PALLET") {
                                        item_arr[k].Exists = "N";
                                        item_arr[k].Dragged = "N";
                                        g_edited_item_index = -1;
                                    }
                                    var new_x = get_item_xaxis(item_arr[k].W, item_arr[k].H, item_arr[k].D, shelf_info.ObjType, -1, shelf_info.HorizGap, shelf_info.SpreadItem, shelf_info.HorizGap, i, j, k, "Y", shelf_info.ItemInfo.length, "N", p_pog_index);
                                    var [itemx, itemy] = get_item_xy(shelf_info, item_arr[k], item_arr[k].W, item_arr[k].H, p_pog_index);

                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Y = itemy;
                                    g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].X = new_x;
                                }
                            }
                        }

                        if (shelf_info.ObjType !== "PEGBOARD" && shelf_info.ObjType !== "HANGINGBAR" && shelf_info.ObjType !== "ROD") {
                            $.each(shelf_info.ItemInfo, function (k, items_arr) {
                                if (items_arr.Item !== "DIVIDER") {
                                    var max_merch = get_shelf_max_merch(modules_info, shelf_info, i, j, p_pog_index, parseFloat($v("P25_POGCR_DFT_MAX_MERCH"))); //ASA1310_20240307 crush item onload
                                    var item_height = 0;
                                    if (items_arr.NewItem == "Y") {
                                        item_height = items_arr.H;
                                    } else {
                                        item_height = items_arr.RH / items_arr.BVert;
                                    }
                                    if ((typeof items_arr.TopObjID == "undefined" || items_arr.TopObjID == "") && (typeof items_arr.BottomObjID == "undefined" || items_arr.BottomObjID == "")) {
                                        if (g_max_facing_enabled == "Y") {
                                            var vert_facing = Math.floor((max_merch * 100) / (item_height * 100));
                                            var l_max_vfacing = nvl(items_arr.MPogVertFacings) > 0 ? items_arr.MPogVertFacings : items_arr.MVertFacings; //ASA-1408
                                            var new_facings = l_max_vfacing > -1 ? l_max_vfacing : $v("P25_POGCR_AUTO_MAX_VFACING");
                                            if (vert_facing > new_facings) {
                                                vert_facing = parseInt(new_facings);
                                            }
                                            items_arr.H = (items_arr.RH / items_arr.BVert) * (vert_facing > 0 ? vert_facing : 1);
                                            items_arr.BVert = vert_facing > 0 ? vert_facing : 1;
                                            items_arr.Y = shelf_info.Y + shelf_info.H / 2 + items_arr.H / 2;
                                            items_arr.RH = items_arr.H;
                                        } else if ($v("P25_POGCR_AUTO_VERT_FACING") == "Y" && g_max_facing_enabled == "N") {
                                            var vertFacingDefault = parseInt($v("P25_POGCR_DFLT_VERT_FACING"));
                                            if (vertFacingDefault > 0) {
                                                var l_max_vfacing = nvl(items_arr.MPogVertFacings) > 0 ? items_arr.MPogVertFacings : items_arr.MVertFacings; //ASA-1408
                                                var new_facings = l_max_vfacing < vertFacingDefault && l_max_vfacing > -1 ? parseInt(l_max_vfacing) : vertFacingDefault; //ASA-874 ,//ASA-1408

                                                var new_height = (items_arr.RH / items_arr.BVert) * new_facings;
                                                if (new_height <= max_merch) {
                                                    items_arr.H = new_height;
                                                    items_arr.BVert = new_facings;
                                                    items_arr.Y = shelf_info.Y + shelf_info.H / 2 + items_arr.H / 2;
                                                    items_arr.RH = items_arr.H;
                                                }
                                            }
                                        }
                                        var depth_facing = Math.floor((shelf_info.D * 100) / (items_arr.D * 100));
                                        var l_dfacing = nvl(items_arr.MPogDepthFacings) > 0 ? items_arr.MPogDepthFacings : items_arr.MDepthFacings; //ASA-1408
                                        depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874,//ASA-1408

                                        items_arr.D = (items_arr.RD / items_arr.BaseD) * (depth_facing > 0 ? depth_facing : 1);
                                        items_arr.BaseD = depth_facing > 0 ? depth_facing : 1;
                                        items_arr.RD = items_arr.D;
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
        i++;
    }
    /*
    Renumbering logic
     */

    var start_one_fixel = p_rule_dtl[7] == "Y" ? "1" : "",
        start_one_mod = p_rule_dtl[8] == "Y" ? "2" : "";

    // console.log("before renumbering", p_rule_dtl);
    location_numbering(p_rule_dtl[5], p_rule_dtl[9], p_rule_dtl[6], start_one_fixel, start_one_mod, p_pog_index);
    // console.log("after renumbering");
    g_overhung_shelf_active = l_temp_overhang; //ASA-1727- issue - 2
}

//This function is used in auto fill to find out available space and increase the horizontal facing.
async function update_horiz_facings(p_total_shelf, p_pog_index) {
    var prev_obj_type,
        prev_mod_index = -1,
        prev_shelf_index = -1;

    for (const shelf_info of p_total_shelf) {
        if (prev_obj_type == "PEGBOARD") {
            var item_details = g_pog_json[p_pog_index].ModuleInfo[prev_mod_index].ShelfInfo[prev_shelf_index].ItemInfo;
            var spread_gap = g_pog_json[p_pog_index].ModuleInfo[prev_mod_index].ShelfInfo[prev_shelf_index].HorizGap;
            var spread_product = g_pog_json[p_pog_index].ModuleInfo[prev_mod_index].ShelfInfo[prev_shelf_index].SpreadItem;
            var horiz_gap = spread_gap;
            var item_length = item_details.length;
            var k = 0;
            for (const obj of g_pog_json[p_pog_index].ModuleInfo[prev_mod_index].ShelfInfo[prev_shelf_index].ItemInfo) {
                var new_x = get_item_xaxis(obj.W, obj.H, obj.D, shelf_obj_type, -1, horiz_gap, spread_product, spread_gap, prev_mod_index, prev_shelf_index, k, "Y", item_length, "N", p_pog_index);
                g_pog_json[p_pog_index].ModuleInfo[prev_mod_index].ShelfInfo[prev_shelf_index].ItemInfo[k].X = new_x;
                k++;
            }
        }
        if (shelf_info.ObjType !== "ROD") {
            var shelf_obj_type = shelf_info.ObjType;
            var i = shelf_info.MIndex;
            var j = shelf_info.SIndex;
            var item_details = g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo;
            if (item_details.length > 0) {
                var first_space = 0;
                for (const obj of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                    first_space += obj.W;
                }
                availableSpace = shelf_info.CalcWidth - first_space;
                if (availableSpace > 0) {
                    for (const items of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                        items.CalcMinH = 1;
                        items.CalcMaxH = 0;
                        items.OldHFacing = items.BHoriz;
                        //autofill will have facing increasing formula. which is used to have min and max facing to increase.
                        if (typeof items.FacingFormula !== "undefined" && items.FacingFormula !== null) {
                            var facing_list = items.FacingFormula.split(",");
                            if (facing_list.length > 0) {
                                var facing_final = [];
                                for (const face_dtl of facing_list) {
                                    var details = face_dtl.split("#");
                                    var facing_dtl = {};
                                    facing_dtl["MinFacing"] = parseInt(details[0]);
                                    facing_dtl["MaxFacing"] = parseInt(details[1]);
                                    facing_dtl["SortOrder"] = parseInt(details[2]);
                                    facing_dtl["Condition"] = details[3];
                                    facing_final.push(facing_dtl);
                                }
                                var sorto = {
                                    SortOrder: "asc",
                                };
                                facing_final.keySort(sorto);
                                var max_facings = items.MHorizFacings < facing_final[0].MaxFacing && items.MHorizFacings !== -1 ? items.MHorizFacings : facing_final[0].MaxFacing;
                                items.CalcMinH = facing_final[0].MinFacing;
                                items.CalcMaxH = max_facings;
                            }
                        }
                    }
                    var max_no = 0;
                    for (const items of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                        max_no = Math.max(items.CalcMaxH, max_no);
                    }
                    //we try to increase 1 facing at a time for all items and then check the available space and continue.
                    if (max_no > 0) {
                        var valid = true;
                        for (m = 1; m < max_no; m++) {
                            if (!valid) {
                                break;
                            }
                            if (shelf_obj_type !== "PEGBOARD") {
                                for (const items of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                    if (items.CalcMaxH > 0) {
                                        if (items.BHoriz < items.CalcMaxH) {
                                            var itemsSpace = 0;
                                            for (const obj of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                                itemsSpace += obj.W;
                                            }
                                            availableSpace = shelf_info.W - (itemsSpace + items.OW);
                                            if (availableSpace > 0) {
                                                items.BHoriz = items.OldHFacing + m;
                                                items.W = items.PW * items.BHoriz;
                                                items.RW = items.W;
                                            } else {
                                                valid = false;
                                                break;
                                            }
                                        } else {
                                            continue;
                                        }
                                    } else {
                                        continue;
                                    }
                                    var itemsSpace = 0;
                                    for (const obj of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                        itemsSpace += obj.W;
                                    }
                                    availableSpace = shelf_info.W - itemsSpace;
                                    if (availableSpace > 0) {
                                        continue;
                                    } else {
                                        valid = false;
                                        break;
                                    }
                                }
                            } else {
                                for (const items of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                    if (!valid) {
                                        break;
                                    }
                                    if (items.CalcMaxH > 0) {
                                        if (items.BHoriz < items.CalcMaxH) {
                                            var old_width = items.W,
                                                old_bhoriz = items.BHoriz;
                                            items.BHoriz = items.OldHFacing + m;
                                            items.W = items.PW * items.BHoriz;
                                            items.RW = items.W;
                                            var k = 0;
                                            for (const info of g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].ItemInfo) {
                                                var return_val = await find_pegboard_gap(info.W, info.H, info.X, info.Y, shelf_info.VertiSpacing, shelf_info.MIndex, shelf_info.SIndex, k, k, "Y", p_pog_index, "Y", g_auto_x_space, g_auto_y_space); //ASA-1300 added g_auto_x_space,g_auto_y_space
                                                if (return_val == "N") {
                                                    items.BHoriz = old_bhoriz;
                                                    items.W = old_width;
                                                    items.RW = items.W;
                                                    valid = false;
                                                    break;
                                                }
                                                k++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        prev_obj_type = shelf_obj_type;
        prev_mod_index = i;
        prev_shelf_index = j;
    }
}

function save_update_json_items(p_pog_json) {
    logDebug("function : save_pog_to_json", "S");
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "SAVE_UPDATE_JSON_ITEMS", {
            x01: p_pog_json[g_pog_index],
            p_clob_01: JSON.stringify(p_pog_json),
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) != "") {
                    raise_error(pData);
                } else {
                    logDebug("function : save_pog_to_json", "E");
                    resolve("SUCESS");
                }
            },
            // loadingIndicatorPosition: "page", //Task_28125
        });
    });
}

async function saveImportItems() {
    var wObj,
        itemJson,
        item_days_of_supply = [],
        pogindexs = [],
        item_arr = [];
    console.log("saveImportItems");
    var p = apex.server.process("GET_ITEM_JSON_FROM_COLL", {
        dataType: "html",
    });
    p.done(async function (data) {
        if ($.trim(data) !== "") {
            itemJson = data;
        }
        async function doSomething() {
            var m = 0;
            for (const itemObj of itemJson) {
                var item = parseInt(itemJson[m].Item);
                var regMov = parseFloat(itemJson[m].RegMovment);
                var wkCount = parseFloat(itemJson[m].WeeksCount);
                var cogsAdj = parseFloat(itemJson[m].CogsAdj);
                var grossProfit = parseFloat(itemJson[m].GrossProfit);
                var avgSales = parseFloat(itemJson[m].AvgSales);
                //var Remarks = parseFloat(itemJson[m].Remarks);//ASA-1385
                //var Depth = parseFloat(itemJson[m].Depth !== null && typeof itemJson[m].Depth !== 'undefined' ? itemJson[m].Depth : 1);//regression issue 10//ASA-1385
                var color = itemJson[m].Color;

                regMov = isNaN(regMov) ? 0 : nvl(regMov);
                wkCount = isNaN(wkCount) ? 0 : nvl(wkCount);
                cogsAdj = isNaN(cogsAdj) ? 0 : nvl(cogsAdj);
                grossProfit = isNaN(grossProfit) ? 0 : nvl(grossProfit);
                avgSales = isNaN(avgSales) ? 0 : nvl(avgSales);

                var pogIndex = 0;
                for (const pogJson of g_pog_json) {
                    var i = 0;
                    for (const Modules of pogJson.ModuleInfo) {
                        if (Modules.ParentModule == null) {
                            var j = 0;
                            for (const Shelf of Modules.ShelfInfo) {
                                if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                                    var k = 0;
                                    for (const items of Shelf.ItemInfo) {
                                        if (items.ItemID == item) {
                                            var itemColor = nvl(color) == 0 ? g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Color : color; //  ASA-1289 --== "#" ? "#FFFFFF" : color //ASA-1441
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].RegMovement = regMov;
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].WeeksCount = wkCount;
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].CogsAdj = cogsAdj;
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].GrossProfit = grossProfit;
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].AvgSales = avgSales;
                                            //g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Remarks = Remarks;//ASA-1385
                                            //g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].BaseD = Depth;//ASA-1385
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].CogsAdjInd = "Y";
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].AvgSalesInd = "Y";
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].GrossProfitInd = "Y";
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].WeeksCountInd = "Y";
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].RegMovementInd = "Y"; //ASA -1116
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DaysOfSupplyInd = "Y"; //ASA -1116
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Color = itemColor; //ASA-1130
                                            var item1 = await updateDaysOfSupply(items, k, j, i, "N", "N", pogIndex, "Y");
                                            item_arr.push(items.ItemID);
                                            item_days_of_supply.push(g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].DaysOfSupply);
                                            wObj = g_scene_objects[pogIndex].scene.children[2].getObjectById(items.ObjID);
                                            if (typeof wObj !== "undefined") {
                                                wObj.RegMovement = regMov;
                                                wObj.WeeksCount = wkCount;
                                                wObj.CogsAdj = cogsAdj;
                                                wObj.GrossProfit = grossProfit;
                                                wObj.AvgSales = avgSales;
                                                if (g_show_live_image !== "Y" || nvl(wObj.material.map) == 0) {
                                                    wObj.material.color.setHex(parseInt(itemColor.replace("#", "0x"), 16));
                                                    var child = wObj.children;
                                                    for (n = 0; n < child.length; n++) {
                                                        if (child[n].uuid == "horiz_facing") {
                                                            child[n].material.color.setHex(parseInt(itemColor.replace("#", "0x"), 16));
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
                        }
                        i++;
                    }
                    render(pogIndex);
                    pogIndex++;
                }
                m++;
            }
        }

        await doSomething();
        apex.server.process(
            "UPDATE_POG_ITEM_COLL", {
            f01: item_arr,
            f02: item_days_of_supply,
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) != "") {
                    raise_error(pData);
                }
            },
        });
        if (g_all_pog_flag == "Y") {
            var i = 0;
        } else {
            var i = g_pog_index;
        }
        for (const pogJson of g_pog_json) {
            if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                if (g_show_days_of_supply == "Y") {
                    await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", i, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v("P25_POGCR_ITEM_DETAIL_LIST")
                    if (g_compare_view == "POG" && g_compare_pog_flag == "Y") {
                        await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", g_ComViewIndex, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v("P25_POGCR_ITEM_DETAIL_LIST")
                    }
                }
            }
            if (g_all_pog_flag == "Y") {
                i++;
            } else {
                break;
            }
        }
    });
}

//this will create a list of all the POG opened. when click on any POG code in the list. it will active the canvas.
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
function setPogActive(p_pog_index) {
    $("[data-pog]").removeClass("multiPogList_active");
    $(".canvas-buttons").removeClass("canvas_highlight");
    $("[data-indx=" + p_pog_index + "]").addClass("multiPogList_active");
    var canvas_id = $('#canvas-holder [data-indx="' + p_pog_index + '"]').attr("id");
    $("#" + canvas_id + "-btns").addClass("canvas_highlight");
    if (p_pog_index !== "ALL_POG") {
        g_all_pog_flag = "N";
        g_pog_index = p_pog_index;
        $s("P25_OPEN_POG_CODE", g_pog_json[p_pog_index].POGCode);
        $s("P25_OPEN_POG_VERSION", g_pog_json[p_pog_index].Version);
    } else {
        $s("P25_SELECTED_CANVAS", "ALL_POG");
        g_all_pog_flag = "Y";
        g_pog_index = 0;
        $s("P25_OPEN_POG_CODE", "");
        $s("P25_OPEN_POG_VERSION", "");
    }
}
//this function is used in drag shelf, when a divider is moved in a basket. we validate divider is still inside the basket only.
function validate_divider(p_direction, p_divx, p_divY, p_shelfdtl) {
    //ASA-1085
    var shelfstart = p_shelfdtl.X - p_shelfdtl.W / 2;
    var shelfend = p_shelfdtl.X + p_shelfdtl.W / 2;
    var shelftop = p_shelfdtl.Y + p_shelfdtl.H / 2;
    var shelfbtm = p_shelfdtl.Y - p_shelfdtl.H / 2;
    var divtop = p_divY + p_shelfdtl.ItemInfo[g_item_index].H / 2;
    var divbtm = p_divY - p_shelfdtl.ItemInfo[g_item_index].H / 2;
    var validate = "N";
    if (p_direction == "L") {
        if (p_divx < shelfstart) {
            validate = "N";
        } else {
            validate = "Y";
        }
    } else if (p_direction == "R") {
        if (p_divx > shelfend) {
            validate = "N";
        } else {
            validate = "Y";
        }
    } else if (p_direction == "U") {
        var min_distance_arr = [];
        var min_index_arr = [];
        var min_module_index = [];
        var item_btm_arr = [];
        var l_mod_cnt = 0;
        var mod_details = g_pog_json[0].ModuleInfo;
        for (const mod of mod_details) {
            var l_shelf_cnt = 0;
            for (const shelfs of mod.ShelfInfo) {
                if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                    var div_shelf_start = shelfs.X - shelfs.W / 2;
                    var div_shelf_end = shelfs.X + shelfs.W / 2;
                    if (p_shelfdtl.Y < shelfs.Y && ((div_shelf_end > shelfstart && div_shelf_start <= shelfstart) || (div_shelf_start < shelfend && div_shelf_start >= shelfstart))) {
                        min_distance_arr.push(shelfs.Y - shelfs.H / 2 - (p_shelfdtl.Y + p_shelfdtl.H / 2));
                        min_index_arr.push(l_shelf_cnt);
                    }
                }
                l_shelf_cnt++;
            }
            l_mod_cnt++;
        }
        var min_distance = Math.min.apply(Math, min_distance_arr);
        var index = min_distance_arr.findIndex(function (number) {
            return number == min_distance;
        });
        if (min_distance_arr.length != 0) {
            if (g_pog_json[0].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].ObjType == "HANGINGBAR" || g_pog_json[0].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].ObjType == "ROD") {
                var itemdtls = g_pog_json[0].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].ItemInfo;
                var i = 0;
                for (const item of itemdtls) {
                    item_btm_arr.push(wpdSetFixed(item.Y - item.H / 2)); //.toFixed(3)));
                    min_index_arr.push(i);
                    i++;
                }
                var max_bottom = Math.min.apply(Math, item_btm_arr);
                var index = item_btm_arr.findIndex(function (number) {
                    return number == max_bottom;
                });
                if (max_bottom > divtop) {
                    validate = "Y";
                } else {
                    validate = "N";
                }
            } else {
                var near_shelf = g_pog_json[0].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].Y - g_pog_json[0].ModuleInfo[g_module_index].ShelfInfo[min_index_arr[index]].H / 2;
                if (near_shelf > divtop) {
                    validate = "Y";
                } else {
                    validate = "N";
                }
            }
        } else {
            validate = "Y";
        }
    } else if (p_direction == "D") {
        if (divbtm < shelftop) {
            validate = "N";
        } else {
            validate = "Y";
        }
    }
    return validate;
}

async function item_delist() {
    if (g_all_pog_flag == "Y" && g_pog_json.length > 1) {
        $s("P25_OPEN_POG_CODE", "");
        $s("P25_OPEN_POG_VERSION", "");
    }
    $("#RESET").click();
    var item_val = "D";
    if (g_pog_json.length > 0) {
        $s("P25_USED_ITEM", `${item_val}`);
        g_open_productlist = item_val; //ASA-1108

        if ($(".a-Splitter-thumb").attr("aria-label") == "Restore") {
            $(".a-Splitter-thumb").click();
        }
        apex.region("draggable_table").refresh();
    }
}

async function save_delist_item(p_pog_index) {
    var total_item = [];
    var model = apex.region("Item_list").widget().interactiveGrid("getViews").grid.model;
    var records = apex.region("Item_list").widget().interactiveGrid("getViews").grid.getSelectedRecords();
    $.each(records, function (key, value) {
        var item = {};
        item["ItemName"] = model.getValue(records[key], "ITEM");

        if (model.getValue(records[key], "SHELF").v !== "") {
            item["ShelfName"] = model.getValue(records[key], "SHELF").v;
        } else {
            item["ShelfName"] = $v("P25_SELECT_FIXEL");
        }
        total_item.push(item);
    });
    var i = 0;
    for (const det of total_item) {
        await create_delist_item_shelf(det.ItemName, det.ShelfName, p_pog_index);
    }
    i++;
}

async function get_delist_item(p_pog_index, p_multi_delete, p_shelfIndex, p_moduleIndex, p_itemIndex, p_shelf_editFlag, p_module_editFlag, p_item_editFlag, p_delete_details_arr) {
    //ASA-1108
    if (typeof g_pog_json[p_pog_index].DeleteItems == "undefined") {
        g_pog_json[p_pog_index].DeleteItems = [];
    }
    if (p_multi_delete == "N") {
        var i = 0;
        if (p_module_editFlag == "Y") {
            var moduleinfo = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex];
            var shelfinfo = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo;
            if (moduleinfo.ParentModule == null || (typeof moduleinfo.ParentModule == "undefined" && j == p_moduleIndex)) {
                if (moduleinfo.ShelfInfo.length > 0) {
                    var k = 0;
                    for (const shelf of shelfinfo) {
                        if (shelf.ObjType !== "BASE" && shelf.ObjType !== "NOTCH" && shelf.ObjType !== "DIVIDER" && shelf.ObjType !== "TEXTBOX") {
                            var l = 0;
                            for (const item of shelf.ItemInfo) {
                                g_delete_item_json.push(item);
                                g_pog_json[p_pog_index].DeleteItems.push(item); //ASA-1108
                            }
                        }
                        k++;
                    }
                }
            }
        } else if (p_shelf_editFlag == "Y") {
            var shelfinfo = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
            var l = 0;
            for (const item of shelfinfo.ItemInfo) {
                g_pog_json[p_pog_index].DeleteItems.push(item); //ASA-1108
                g_delete_item_json.push(item);
                l++;
            }
        } else {
            var itemInfo = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex];
            var l = 0;
            g_pog_json[p_pog_index].DeleteItems.push(itemInfo); //ASA-1108
            g_delete_item_json.push(itemInfo);
        }
    } else {
        var i = 0;
        for (const details of p_delete_details_arr) {
            if (details.Object == "ITEM") {
                g_delete_item_json.push(g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex]);
                g_pog_json[details.p_pog_index].DeleteItems.push(g_pog_json[details.p_pog_index].ModuleInfo[details.MIndex].ShelfInfo[details.SIndex].ItemInfo[details.IIndex]);
            }
            i++;
        }
    }
    const unique = g_delete_item_json.filter((obj, index) => g_delete_item_json.findIndex((item) => item.ItemID === obj.ItemID) === index);
    g_delete_item_json = unique;
}

async function create_delist_item_shelf(p_itemlist, p_shelflist, p_pog_index) {
    var moduleinfo = g_pog_json[p_pog_index].ModuleInfo;
    if (p_itemlist.length > 0) {
        g_cut_copy_arr = [];
        g_cut_support_obj_arr = [];
        g_cut_loc_arr = [];
        loc_details = {};
        g_cut_action_done = "N";
        g_copy_action_done = "Y";
        g_dup_action_done = "N";
        g_delete_action_done = "N";
        g_multi_delete_done = "N";
        var multi_del = "N";
        var index;
        var i = 0;
        for (const item of g_delete_item_json) {
            if (item.Item == p_itemlist) {
                if (typeof item.ShelfInfo == "undefined") {
                    multi_del = "N";
                    g_cut_copy_arr.push(item);
                } else {
                    multi_del = "Y";
                    g_delete_details.push(item);
                }
                index = i;
                break;
            }
            i++;
        }
        if (multi_del == "Y") {
            g_multi_copy_done = "Y";
            g_mselect_drag = "N";
            g_multiselect = "N";
            g_delete_details.StartCanvas = p_pog_index;
            g_delete_details.g_present_canvas = p_pog_index;
            g_delete_details.multi_delete_shelf_ind = "";
        } else {
            loc_details["MIndex"] = -1;
            loc_details["SIndex"] = -1;
            loc_details["IIndex"] = -1;
            loc_details["ModuleEdit"] = "N";
            loc_details["ShelfEdit"] = "N";
            loc_details["ItemEdit"] = "Y";
            g_cut_loc_arr.push(loc_details);
            g_cut_copy_arr[0].loc_details = g_cut_loc_arr;
            g_cut_copy_arr[0].OldObjID = g_cut_copy_arr[0].ObjID;
            g_cut_copy_arr[0].ObjID = "";
        }

        var i = 0;
        for (const module of moduleinfo) {
            if (module.ParentModule == null || typeof module.ParentModule == "undefined") {
                var j = 0;
                for (const shelf of module.ShelfInfo) {
                    if (shelf.ObjType !== "BASE" && shelf.ObjType !== "NOTCH" && shelf.ObjType !== "DIVIDER" && shelf.ObjType !== "TEXTBOX") {
                        if (shelf.Shelf == p_shelflist) {
                            g_module_index = i;
                            g_shelf_index = j;
                        }
                    }
                    j++;
                }
            }
            i++;
        }
        var valid = await context_paste("COPY", g_camera, "N", "Y", p_pog_index);
        if (valid == "Y") {
            let res = await deleted_items_log(p_itemlist, "A", p_pog_index);
            g_delete_item_json.splice(index, 1);
        }
    }
}

async function reset_canvas_region() {
    if (g_show_plano_rate == "N" || g_open_productlist == "Y") {
        $("#par_region").hide();
        $("#draggable_table").show();
        $("#wpdSplitter_splitter_second").css("overflow", "hidden");
        if ($(".a-Splitter-thumb").attr("aria-label") == "Collapse" && apex.region("draggable_table").widget() !== null) {
            apex.region("draggable_table").widget().interactiveGrid("getActions").set("edit", false);
            apex.region("draggable_table").widget().interactiveGrid("getViews", "grid").model.clearChanges();
            apex.region("draggable_table").widget().interactiveGrid("getViews").grid.curInst._refreshGrid();
        }
    } else {
        $("#draggable_table").hide();
        $("#par_region").show();
        $("#wpdSplitter_splitter_second").css("scrollbar-width", "thin").css("overflow", "auto");
    }
    if ($(".a-Splitter-thumb").attr("aria-label") !== "Collapse") {
        g_show_plano_rate = "N";
        g_open_productlist = "Y";
    }
    switchCanvasView($v("P25_POGCR_TILE_VIEW"), "Y"); // Task-22510
}

// this is a common function used to find out the notch no at which the shelf is present in a module,
//we create a notch label which will show the no. we also use this to move the shelf to next notch.
function find_top_notch(p_module_index, p_shelf_index, p_final_y, p_final_x, p_setIndicator, p_pog_index) {
    var modules = g_pog_json[p_pog_index].ModuleInfo[p_module_index];
    var shelf_dtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
    if (shelf_dtl.W == modules.W) {
        if (shelf_dtl.X > modules.X - modules.Y / 2 && shelf_dtl.X < modules.X + modules.Y / 2 && modules.NotchSpacing > 0) {
            if (p_setIndicator == "Y") {
                /* Start ASA-1371_26842
                var cap_count = 100;
                var notch_no = -1; //ASA-1344
                for (k = 1; k < cap_count; k++) {
                if (p_final_y + (shelf_dtl.H / 2) < g_pog_json[p_pog_index].BaseH + (modules.NotchStart / 2) && modules.NotchStart > 0) {
                notch_no = 0; //ASA-1344
                break;
                } else if (p_final_y + (shelf_dtl.H / 2) <= g_pog_json[p_pog_index].BaseH + modules.NotchStart && modules.NotchStart > 0) {
                notch_no = 0;
                break;
                } else if (p_final_y + (shelf_dtl.H / 2) <= g_pog_json[p_pog_index].BaseH) { //ASA-1268 Added else
                notch_no = 0;
                break;
                } else if (p_final_y + (shelf_dtl.H / 2) <= ((g_pog_json[p_pog_index].BaseH + modules.NotchStart)) + modules.NotchSpacing * k) {
                notch_no = k;
                break;
                }
                }*/
                var notch_no = get_notch_no(modules, p_pog_index, shelf_dtl.Y + shelf_dtl.H / 2); //ASA-1371_26842
                //End ASA-1371_26842

                shelf_dtl.NotchNo = notch_no;
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(shelf_dtl.SObjID); //ASA-1318 Task-2 this is added to update the notch no in the object, it was only updated in json.
                if (typeof selectedObject !== "undefined") {
                    selectedObject.NotchNo = notch_no;
                }

                if (notch_no == -1) {
                    var notch_center = g_pog_json[p_pog_index].BaseH + modules.NotchStart / 2;

                    if (p_final_y - shelf_dtl.H / 2 < g_pog_json[p_pog_index].BaseH) {
                        var new_y = g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2;
                    } else if (p_final_y + shelf_dtl.H / 2 > notch_center) {
                        var new_y = g_pog_json[p_pog_index].BaseH + modules.NotchStart - shelf_dtl.H / 2;
                    } else {
                        var new_y = g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2;
                    }
                    shelf_dtl.NotchNo = 0;
                } else if (notch_no > 0) {
                    //ASA-1446 issue 2 S
                    if (notch_no == 1 && modules.NotchStart > 0 && p_final_y + shelf_dtl.H / 2 < g_pog_json[p_pog_index].BaseH + modules.NotchStart && p_final_y + shelf_dtl.H / 2 > g_pog_json[p_pog_index].BaseH) {
                        var notch_center = g_pog_json[p_pog_index].BaseH + modules.NotchStart / 2;
                    } else {
                        var notch_center = g_pog_json[p_pog_index].BaseH + modules.NotchStart + modules.NotchSpacing * notch_no - modules.NotchSpacing / 2;
                    } //ASA-1446 issue 2 E
                    if (p_final_y + shelf_dtl.H / 2 < g_pog_json[p_pog_index].BaseH + modules.NotchStart / 2) {
                        var new_y = g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2;
                    } else if (p_final_y + shelf_dtl.H / 2 < notch_center) {
                        //ASA-1914 Issue1
                        if (shelf_dtl.ObjType == "PEGBOARD") {
                            var new_y = g_pog_json[p_pog_index].BaseH + modules.NotchStart + modules.NotchSpacing * (notch_no - 1) - shelf_dtl.H / 2;
                        } else {
                            var new_y = g_pog_json[p_pog_index].BaseH + modules.NotchStart + modules.NotchSpacing * (notch_no - 1) + shelf_dtl.H / 2;
                        }
                    } else {
                        //ASA-1446 issue 2 S
                        if (notch_no == 1 && modules.NotchStart > 0 && p_final_y + shelf_dtl.H / 2 < g_pog_json[p_pog_index].BaseH + modules.NotchStart && p_final_y + shelf_dtl.H / 2 > g_pog_json[p_pog_index].BaseH) {
                            var new_y = g_pog_json[p_pog_index].BaseH + modules.NotchStart - shelf_dtl.H / 2;
                        } else {
                            var new_y = g_pog_json[p_pog_index].BaseH + modules.NotchStart + modules.NotchSpacing * notch_no - shelf_dtl.H / 2;
                        }
                        //ASA-1446 issue 2 E
                    }
                } else if (notch_no == 0) {
                    var notch_center = g_pog_json[p_pog_index].BaseH + modules.NotchStart / 2;
                    if (modules.NotchStart > 0 && p_final_y + shelf_dtl.H / 2 > notch_center) {
                        //ASA-1466
                        var new_y = g_pog_json[p_pog_index].BaseH + modules.NotchStart - shelf_dtl.H / 2;
                        shelf_dtl.NotchNo = 1;
                    } else {
                        var new_y = g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2; //ASA-1446 issue 1
                        shelf_dtl.NotchNo = 0;
                    }
                }
                if (notch_no == -1 || notch_no > 0 || notch_no == 0) {
                    var new_x = modules.X - modules.W / 2 + shelf_dtl.W / 2;
                }

                /*if (notch_no == -1) {
                var new_y = g_pog_json[p_pog_index].BaseH + shelf_dtl.H / 2;
                shelf_dtl.NotchNo = 0;
                } else if (notch_no > 0) {
                var notch_center = (g_pog_json[p_pog_index].BaseH + modules.NotchStart) + modules.NotchSpacing * notch_no - (modules.NotchSpacing / 2);
                if (notch_no > 0 && p_final_y + (shelf_dtl.H / 2) < notch_center) {
                var new_y = (g_pog_json[p_pog_index].BaseH + modules.NotchStart) + modules.NotchSpacing * (notch_no - 1) + shelf_dtl.H / 2;
                } else {
                var new_y = (g_pog_json[p_pog_index].BaseH + modules.NotchStart) + modules.NotchSpacing * notch_no - shelf_dtl.H / 2;
                }
                } else if (notch_no == 0) {
                if (modules.NotchStart > 0) {
                var new_y = (g_pog_json[p_pog_index].BaseH + modules.NotchStart) - shelf_dtl.H / 2;
                } else {
                var new_y = g_pog_json[p_pog_index].BaseH;
                }
                }
                if (notch_no == -1 || notch_no > 0 || notch_no == 0) {
                var new_x = modules.X - modules.W / 2 + shelf_dtl.W / 2;
                }*/
            }
        }
    } else {
        var new_y = -1;
        var new_x = -1;
    }
    return [new_y, new_x];
}

async function set_remarks() {
    var itemJson;
    var wObj;
    var p = apex.server.process("GET_ITEM_JSON_FROM_COLL", {
        dataType: "html",
    });
    p.done(async function (data) {
        if ($.trim(data) !== "") {
            itemJson = data;
        }
        async function doSomething() {
            var m = 0;
            for (const itemObj of itemJson) {
                var Remarks = itemJson[m].Remarks;
                var pogIndex = 0;
                for (const pogJson of g_pog_json) {
                    var i = 0;
                    for (const Modules of pogJson.ModuleInfo) {
                        if (Modules.ParentModule == null) {
                            var j = 0;
                            for (const Shelf of Modules.ShelfInfo) {
                                if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                                    var k = 0;
                                    for (const items of Shelf.ItemInfo) {
                                        if (items.ItemID == itemObj.Item) {
                                            g_pog_json[pogIndex].ModuleInfo[i].ShelfInfo[j].ItemInfo[k].Remarks = Remarks;
                                            wObj = g_scene_objects[pogIndex].scene.children[2].getObjectById(items.ObjID);
                                            if (typeof wObj !== "undefined") {
                                                wObj.Remarks = Remarks;
                                            }
                                        }
                                        k++;
                                    }
                                }
                                j++;
                            }
                        }
                        i++;
                    }
                    pogIndex++;
                }
                m++;
            }
        }
        await doSomething();
    });
}

//this is a common function used to calculate facings for depth and vertical.
function maximizeItemFacings(p_facingType, p_moduleIndex, p_shelfIndex, p_itemIndex, p_maxFacingsAllowed, p_vertFacingDefault, p_itemType, p_pog_index, p_maximizeAll = "N") {
    var module = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex]; //ASA-1273 PrasANNA
    var shelf_info = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
    var item_info = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex];
    //here we get the depth of any shelf that is hitting the item. we will minus this depth with the actual shelf depth and then
    //calculate the depth facing for the item.
    var max_depth = findNearByShelfMaxDepth(p_moduleIndex, p_shelfIndex, p_itemIndex, p_itemIndex, -1, p_pog_index);
    //var max_merch = get_max_merch(p_moduleIndex, p_shelfIndex, p_itemIndex, "Y", -1, p_pog_index); //ASA-1273
    var max_merch = get_cap_max_merch(p_moduleIndex, p_shelfIndex, module, shelf_info, p_pog_index, g_dft_max_merch); //20240415 - Regression Issue 8 //ASA-1273 PrasANNA
    var depth_facing = 1;
    var vert_facing = 1;
    var new_facings = 1;

    var spread_product = shelf_info.SpreadItem;
    var ShelfhorizGap = shelf_info.HorizGap;
    var nesting_value = item_info.NVal;
    var nesting_type = typeof item_info.ItemNesting !== "undefined" && item_info.ItemNesting !== "" ? item_info.ItemNesting : "";
    var ItemHorizGap = item_info.HorizGap;

    var heightLeft = 0,
        depthLeft = 0;
    var capHeight = typeof item_info.CapHeight == "undefined" || item_info.CapHeight == "" ? -1 : item_info.CapHeight;
    var capStyle = item_info.CapStyle;
    var capMaxH = item_info.CapMaxH;
    var capCount = 0;

    if (shelf_info.ObjType == "SHELF" || (shelf_info.ObjType == "HANGINGBAR" && g_auto_hangbar_facings == "Y") || (shelf_info.ObjType == "PEGBOARD" && shelf_info.AutoFillPeg == "Y") || shelf_info.ObjType == "CHEST") {
        if (!(item_info.TopObjID !== "" && typeof item_info.TopObjID !== "undefined" && item_info.BottomObjID !== "" && typeof item_info.BottomObjID !== "undefined") && item_info.Item !== "DIVIDER") {
            // ASA-1265
            if (g_auto_cal_depth_fac == "Y") {
                //ASA-1255
                if (p_facingType == "D" || p_facingType == "B") {
                    var shelf_depth,
                        real_depth;
                    //Regression 1 20241111
                    if (nesting_value !== 0 && nesting_type !== "" && item_info.ItemNesting == "D") {
                        real_depth = wpdSetFixed(item_info.RD - (item_info.BaseD - 1) * nesting_value);
                    } else {
                        real_depth = wpdSetFixed(item_info.RD / item_info.BaseD);
                    }
                    var l_dfacing = nvl(item_info.MPogDepthFacings) > 0 ? item_info.MPogDepthFacings : item_info.MDepthFacings; //ASA-1408 //ASA-1408 Issue 11
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
                    if (max_depth < shelf_depth) {
                        //ASA-1369
                        var maxDepthForNesting = shelf_depth - max_depth - real_depth;
                    }
                    if (spread_product !== "F" && ShelfhorizGap == 0 && ItemHorizGap == 0 && nesting_value !== 0 && nesting_type !== "" && item_info.ItemNesting == "D") {
                        depth_facing = Math.floor((maxDepthForNesting * 100) / (nesting_value * 100)) + 1; //ASA-1519 Issue 4, need to add 1 for default facing
                        depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874,//ASA-1408
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].D = real_depth + (depth_facing > 0 ? depth_facing : 1) * nesting_value;
                    } else {
                        // depth_facing = Math.floor(((parseFloat((shelf_depth - (max_depth < shelf_depth ? max_depth : 0)).toFixed(4))) * 100) / (real_depth * 100)); //ASA-1369
                        depth_facing = Math.floor(wpdSetFixed((shelf_depth - (max_depth < shelf_depth ? max_depth : 0)) / real_depth)); //ASA-1369
                        depth_facing = l_dfacing < depth_facing && l_dfacing > -1 ? l_dfacing : depth_facing; //ASA-874
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].D = wpdSetFixed(real_depth * (depth_facing > 0 ? depth_facing : 1));
                    }
                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].RD = wpdSetFixed((item_info.RD / item_info.BaseD) * (depth_facing > 0 ? depth_facing : 1));
                    if (shelf_info.ObjType == "CHEST") {
                        var chestItemDFacing = l_dfacing < Math.trunc(shelf_info.BsktWallH / real_depth) && l_dfacing > -1 ? l_dfacing : Math.trunc(shelf_info.BsktWallH / real_depth); //ASA-1272 ISSUE-7 //ASA-1408 issue 11
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].BaseD = chestItemDFacing; //ASA-1408 Issue 11
                    } else {
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].BaseD = depth_facing > 0 ? depth_facing : 1;
                    }

                    //ASA-1410 issue 6
                    if (capStyle == "1" || capStyle == "2" || capStyle == "3") {
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
            if ((g_max_facing_enabled == "Y" || p_maximizeAll == "Y") && shelf_info.ObjType == "SHELF") {
                //ASA-1273 for .copy and cut for the items its also working// ASA-1265
                if (p_facingType == "H" || p_facingType == "B") {
                    var real_height;
                    var l_max_vfacings = nvl(item_info.MPogVertFacings) > 0 ? item_info.MPogVertFacings : item_info.MVertFacings; //ASA-1408
                    new_facings = l_max_vfacings > -1 ? l_max_vfacings : parseInt(p_maxFacingsAllowed); //ASA-1408
                    if (p_itemType == "A") {
                        new_facings = l_max_vfacings > -1 && l_max_vfacings < parseInt(p_vertFacingDefault) ? l_max_vfacings : parseInt(p_vertFacingDefault); //ASA-1408
                    }
                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].OldItemHeight = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H);

                    if (spread_product !== "F" && ShelfhorizGap == 0 && ItemHorizGap == 0 && nesting_value !== 0 && nesting_type !== "" && item_info.ItemNesting == "H") {
                        real_height = wpdSetFixed(item_info.RH - (item_info.BVert - 1) * nesting_value);
                        var maxHeightForNesting = max_merch - real_height;
                        vert_facing = Math.floor((maxHeightForNesting * 100) / (nesting_value * 100));
                        if (vert_facing > new_facings) {
                            vert_facing = new_facings;
                        }
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H = wpdSetFixed(real_height + (vert_facing > 0 ? vert_facing : 1) * nesting_value);
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].BVert = vert_facing > 0 ? vert_facing + 1 : 1;
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].Y = wpdSetFixed(shelf_info.Y + shelf_info.H / 2 + g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H / 2);
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].RH = wpdSetFixed(real_height + (vert_facing > 0 ? vert_facing : 1) * nesting_value);
                    } else {
                        real_height = wpdSetFixed(item_info.RH / item_info.BVert);
                        vert_facing = Math.floor((max_merch * 100) / (real_height * 100));
                        if (vert_facing > new_facings) {
                            vert_facing = new_facings;
                        }
                        //g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].BVert = vert_facing; //task_26900 regression 5 seting  in the end
                        heightLeft = wpdSetFixed(max_merch - real_height * (vert_facing > 0 ? vert_facing : 1));
                        depthLeft = wpdSetFixed(shelf_info.D - max_depth - item_info.RD / item_info.BaseD); //ASA-1179
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H = wpdSetFixed(real_height * (vert_facing > 0 ? vert_facing : 1));

                        //we first increase the facings and then find out any place let and then we set the capping again.
                        if (capStyle !== "0") {
                            if (heightLeft < 0 || depthLeft < 0) {
                                g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapCount = 0;
                                g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapFacing = 0;
                                g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapHorz = 0; //ASA-1179
                                g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapDepth = 0; //ASA-1179
                                g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapHeight = 0; //ASA-1179
                                g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapTotalCount = 0; //ASA-1179
                                g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H = wpdSetFixed(real_height * (vert_facing > 0 ? vert_facing : 1));
                            } else {
                                if (heightLeft >= capHeight && capStyle == "1") {
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapCount = 1;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapFacing = 1;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H = wpdSetFixed(real_height * (vert_facing > 0 ? vert_facing : 1) + capHeight);
                                } else if (heightLeft >= capHeight && capStyle == "2") {
                                    capCount = Math.floor((heightLeft * 100) / (capHeight * 100));
                                    capCount = capCount > capMaxH && capMaxH > 0 ? capMaxH : capCount;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapCount = capCount > 0 ? capCount : 0;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapFacing = capCount > 0 ? capCount : 0;
                                    if (capCount > 0) {
                                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H = wpdSetFixed(real_height * (vert_facing > 0 ? vert_facing : 1) + capCount * capHeight);
                                    }
                                } else if (capStyle == "3") {
                                    //max cap always vertical facings will be 1.
                                    vert_facing = 1;
                                    heightLeft = wpdSetFixed(max_merch - g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].RH);
                                    capCount = Math.floor((heightLeft * 100) / (capHeight * 100));
                                    capCount = capCount > capMaxH && capMaxH > 0 ? capMaxH : capCount;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapCount = capCount > 0 ? capCount : 0;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapFacing = capCount > 0 ? capCount : 0;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H = wpdSetFixed(real_height * (vert_facing > 0 ? vert_facing : 1) + capCount * capHeight);
                                } else {
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapCount = 0;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapFacing = 0;
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapHorz = 0; //ASA-1179
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapDepth = 0; //ASA-1179
                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapHeight = 0;

                                    g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapTotalCount = 0; //ASA-1179
                                }
                                //ASA-1410 issue 6
                                if (capStyle == "1" || capStyle == "2" || capStyle == "3") {
                                    //ASA-1273 Prasanna start
                                    var items = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex];
                                    var cap_orientation = items.CapOrientaion == "" ? "4" : items.CapOrientaion;
                                    var [cap_width, cap_height, cap_depth] = get_cap_dim(items);

                                    var [cWidth, cHeight, cDepth, capActualHeight, capActualWidth, capActualDepth] = get_new_orientation_dim(cap_orientation, cap_width, cap_height, cap_depth);
                                    if (items.CapDepthChanged == "N" || typeof items.CapDepthChanged == "undefined") {
                                        //ASA-1273
                                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].CapDepth = Math.trunc(item_info.RD / cDepth);
                                    } //ASA-1273 end
                                }
                            }
                        } else {
                            g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H = wpdSetFixed(real_height * (vert_facing > 0 ? vert_facing : 1));
                        }
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].BVert = vert_facing > 0 ? vert_facing : 1;
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].Y = wpdSetFixed(shelf_info.Y + shelf_info.H / 2 + g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].H / 2);
                        g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex].RH = wpdSetFixed(real_height * (vert_facing > 0 ? vert_facing : 1));
                    }
                }
            }
        }
    }
}

async function saveitem_depthremarks(p_item_dtl) {
    var wObj;
    var item_arr = [];
    var model = apex.region("item_depth_rem").widget().interactiveGrid("getViews", "grid").model;

    if (p_item_dtl != "") {
        item_arr = p_item_dtl.split("$,$");
    } else {
        model.forEach(function (record) {
            if (model.getValue(record, "DEPTHCHNAGE") == "Y" || model.getValue(record, "REMARKSCHANGE") == "Y") {
                item_arr.push(model.getValue(record, "ITEM").toUpperCase() + "$##$" + model.getValue(record, "FIXEL").toUpperCase() + "$##$" + model.getValue(record, "ITEM_DEPTH") + "$##$" + model.getValue(record, "ITEM_REMARKS") + "$##$" + model.getValue(record, "ITEM_X"));
            }
        });
    }

    var itemid = [],
        fixeldtl = [],
        depthdtl = [],
        remarks = [];
    var validate = "Y";
    var i = 0;
    for (var itemdtl of item_arr) {
        var details_arr = itemdtl.split("$##$");
        if (g_all_pog_flag == "Y") {
            var pogIndex = 0;
        } else {
            pogIndex = g_pog_index;
        }
        for (const pogJson of g_pog_json) {
            var l = 0;
            for (const Modules of pogJson.ModuleInfo) {
                if (Modules.ParentModule == null) {
                    var j = 0;
                    for (const Shelf of Modules.ShelfInfo) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            var k = 0;
                            for (const items of Shelf.ItemInfo) {
                                var x = items.X.toFixed(2);
                                if (items.ItemID == details_arr[0] && Shelf.Shelf == details_arr[1] && parseFloat(x) == parseFloat(details_arr[4].trim())) {
                                    //ASA-1645 Issue 1
                                    var retval = await update_item_facings(l, j, k, items.BHoriz, items.BVert, parseInt(details_arr[2]), "depthfacing", false, "N", pogIndex);
                                    if (!retval) {
                                        validate = "N";
                                    } else {
                                        g_pog_json[pogIndex].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].BaseD = parseInt(details_arr[2]);
                                        g_pog_json[pogIndex].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].Remarks = details_arr[3];
                                        g_pog_json[pogIndex].ModuleInfo[l].ShelfInfo[j].ItemInfo[k].DFacing = parseInt(details_arr[2]);
                                        wObj = g_scene_objects[pogIndex].scene.children[2].getObjectById(items.ObjID);
                                        if (typeof wObj !== "undefined") {
                                            wObj.Remarks = parseInt(details_arr[3]);
                                            wObj.BaseD = details_arr[2];
                                            wObj.DFacing = details_arr[2];
                                        }
                                    }
                                }
                                k++;
                            }
                        }
                        j++;
                    }
                }
                l++;
            }
            if (g_all_pog_flag == "Y") {
                pogIndex++;
            } else {
                break;
            }
        }
        i++;
    }
    const uniqueData = [];
    const maxValuesMap = new Map();
    item_arr.forEach((item) => {
        const parts = item.split("$##$");
        if (parts.length >= 4) {
            const identifier = parts[0];
            const value = parseInt(parts[2]);
            const remarks = parts[3];

            if (maxValuesMap.has(identifier)) {
                if (value > maxValuesMap.get(identifier).value) {
                    maxValuesMap.set(identifier, {
                        value,
                        remarks,
                        string: item,
                    });
                }
            } else {
                maxValuesMap.set(identifier, {
                    value,
                    remarks,
                    string: item,
                });
            }
        }
    });

    maxValuesMap.forEach((item) => {
        uniqueData.push(item.string);
    });

    for (var itm_dtl of uniqueData) {
        var dtl = itm_dtl.split("$##$");
        itemid.push(dtl[0]);
        fixeldtl.push(dtl[1]);
        depthdtl.push(dtl[2]);
        remarks.push(dtl[3]);
    }

    async function doSomething() {
        var POG_json = JSON.stringify([g_pog_json]);
        apex.server.process(
            "UPDATE_DEPTHF_REMARKS", {
            f01: itemid,
            f03: depthdtl,
            f04: remarks,
            p_clob_01: POG_json,
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) != "") {
                    raise_error(pData);
                } else {
                    apex.region("item_depth_rem").widget().interactiveGrid("getActions").set("edit", false);
                    apex.region("item_depth_rem").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                    apex.region("item_depth_rem").refresh();
                }
            },
            loadingIndicatorPosition: "none",
        });
    }
    if (validate == "Y") {
        doSomething();
    } else {
        alert(get_message("INCREMENT_ERROR", "Depth"));
    }
}

function open_depth_facing_rmks() {
    try {
        logDebug("function : open_fixel", "S");
        if ((typeof g_pog_json !== "undefined" && g_pog_json.length > 0) || (typeof g_pog_json_comp !== "undefined" && g_pog_json_comp.length > 0)) {
            var POG_json = JSON.stringify([g_pog_json[g_pog_index]]);

            apex.server.process(
                "ADD_JSON_TO_COLL", {
                x01: "I",
                p_clob_01: POG_json,
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        raise_error(pData);
                    } else {
                        apex.region("item_depth_rem").widget().interactiveGrid("getActions").set("edit", false);
                        apex.region("item_depth_rem").widget().interactiveGrid("getViews", "grid").model.clearChanges();
                        apex.region("item_depth_rem").refresh();
                        if (g_all_pog_flag == "Y" && g_pog_json.length > 1) {
                            $s("P25_OPEN_POG_CODE", "");
                            $s("P25_OPEN_POG_VERSION", "");
                        }
                        openInlineDialog("item_depth_rem_dtl", 75, 70);
                    }
                },
                loadingIndicatorPosition: "page",
            });
        }
    } catch (err) {
        error_handling(err);
    }
}

function update_depthfacing() {
    var itemarr = [];
    var fixelarr = [];
    var deptharr = [];
    var remarksarr = [];
    var pog_Code = [];
    if (g_all_pog_flag == "Y") {
        var pogIndex = 0;
    } else {
        pogIndex = g_pog_index;
    }
    for (const pogJson of g_pog_json) {
        var l = 0;
        for (const Modules of pogJson.ModuleInfo) {
            if (Modules.ParentModule == null) {
                var j = 0;
                for (const Shelf of Modules.ShelfInfo) {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                        var k = 0;
                        for (const items of Shelf.ItemInfo) {
                            if (items.DfacingUpd == "Y") {
                                itemarr.push(items.Item);
                                fixelarr.push(Shelf.Shelf);
                                deptharr.push(items.BaseD);
                                remarksarr.push(items.Remarks);
                                items.DfacingUpd = "N";
                            }
                            k++;
                        }
                    }
                    j++;
                }
            }
            l++;
        }

        if (g_all_pog_flag == "Y") {
            pogIndex++;
        } else {
            break;
        }
    }
    if (itemarr.length > 0 && g_open_productlist !== "D") {
        //ASA-1258 ADDED THE CONDITION of g_open_product becuse this function not call when open from delist item and no  data get from grid record beacuse grid is empty
        deleted_items_log(itemarr, "A", g_pog_index);
    }
}

// async function create_item_compare() {
// 	var pog_Code = $v("P25_OPEN_POG_CODE");
// 	var pog_version = $v("P25_OPEN_POG_VERSION");
// 	var p = apex.server.process(
// 		"CREATE_COMPARE_ITEM_COLL",
// 		{
// 			x01: pog_Code,
// 			x02: pog_version,
// 			x03: g_pdf_online_clck, //ASA-1531 ISSUE 16
// 		},
// 		{
// 			dataType: "html",
// 		}
// 	);
// }
async function uploadImage(p_fileIndex) {
    try {
        var upload_type;
        var fileInputElem = document.getElementById("P25_UPLOAD_IMG");
        var fileIndex = 0;
        var pog_Code = $v("P25_OPEN_POG_CODE");
        if (fileInputElem.files.length !== 0) {
            var file = fileInputElem.files[fileIndex];
            var reader = new FileReader();
            if (validate_image_type(file.name)) {
                reader.onload = (function (pFile) {
                    return function (e) {
                        if (pFile) {
                            var base64 = binaryArray2base64(e.target.result);
                            console.log(base64, "base64");
                            var type = pFile.type;
                            console.log(type);
                            upload_type = type;
                            var f01Array = [];
                            f01Array = clob2Array(base64, 30000, f01Array);
                            apex.server.process(
                                "UPLOAD_IMAGE", {
                                x01: file.name,
                                x02: file.type,
                                x03: pog_Code,
                                f01: f01Array,
                            }, {
                                dataType: "json",
                                success: function (data) {
                                    console.log("data", data);
                                    if (data.result == "success") {
                                        fileInputElem.value = "";
                                        logDebug("function : uploadFile", "E");
                                    } else {
                                        alert(get_message("INTERNAL_ERROR"));
                                    }
                                },
                                loadingIndicatorPosition: "page",
                            });
                        }
                    };
                })(file);
                reader.readAsArrayBuffer(file);
            }
        }
    } catch (err) {
        error_handling(err);
    }
}

function validate_image_type(p_fileName) {
    try {
        var fname = p_fileName;
        var re = /(\.jpeg|\.jpg|\.png)$/i;
        if (!re.exec(fname)) {
            alert(get_message("INVALID_FILE_TYPE", p_fileName));
            return false;
        } else {
            return true;
        }
    } catch (err) {
        error_handling(err);
    }
}

async function set_status() {
    var p = apex.server.process(
        "SET_STATUS_BAR", {
        pageItems: "#P25_POGCR_ITEM_DESC_LIST,#P25_POGCR_FIXEL_DESC_LIST,#P25_POGCR_MODULE_DESC_LIST,#P25_POGCR_POG_DESC_LIST", //ASA-1360 task 2
    }, {
        dataType: "html",
    });
    p.done(async function (data) {
        if ($.trim(data) !== "") {
            g_status_bar = JSON.parse(data);
            var sorto = {
                label_type: "asc",
                Seq: "asc",
            }; //ASA-1427 Issue 1
            g_status_bar.keySort(sorto); //ASA-1427 Issue 1
            g_hide_show_dos_label = g_status_bar //ASA-1427 S
                .filter((item) => item.label_type === "D")
                .map((item) => item.Param + ":" + item.label)
                .join(",");
            if (g_all_pog_flag == "Y") {
                var i = 0;
            } else {
                var i = g_pog_index;
            }
            for (const pogJson of g_pog_json) {
                if ((i !== g_ComViewIndex && g_ComViewIndex > -1) || g_ComViewIndex == -1) {
                    if (g_show_days_of_supply == "Y") {
                        await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", i, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
                        if (g_compare_view == "POG" && g_compare_pog_flag == "Y") {
                            await showHideDaysOfSupplyLabel(g_show_days_of_supply, "N", g_ComViewIndex, "Y", "Y", $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), $v("P25_POGCR_ITEM_DETAIL_LIST"));
                        }
                    }
                }
                if (g_all_pog_flag == "Y") {
                    i++;
                } else {
                    break;
                }
            } //ASA-1427 S
        }
    });
}

//this function is used to give a warning when trying to move the combine shelf. it will remove the combination after sending warning.
async function getconfirm_shelfmove(p_pog_index) {
    // ASA-1361-S 20240501
    var l_confirm = "N";
    if ($v("P25_POGCR_COMBINATION_SHELF") == "Y") {
        if (g_delete_details.length > 0) {
            for (const objects of g_delete_details) {
                if (g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType == "SHELF" || g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].ObjType == "HANGINGBAR") {
                    var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, g_pog_json[p_pog_index].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].Shelf);
                    if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                        l_confirm = "Y";
                        break;
                    }
                }
            }
        }
    }
    if (l_confirm == "Y") {
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
        //Task_29818 - End
        return new Promise((resolve, reject) => {
            //Task_29818 - Start
            // ax_message.confirm(get_message("POGCR_SHELF_MOVE_COMBINATION"), function (e) {
            //     if (e) {
            //         resolve("Y");
            //     } else {
            //         resolve("N");
            //     }
            // });
            confirm(
                get_message("POGCR_SHELF_MOVE_COMBINATION"),
                get_message("SHCT_YES"),
                get_message("SHCT_NO"),
                function () {
                    resolve("Y");
                },
                function () {
                    resolve("N");
                });
            //Task_29818 - End
        });
    } else {
        return "Y";
    }
    // ASA-1361-E 20240501
}

async function check_caprpark_inpog() {
    //ASA-1292 checking the item and shelf outside the module
    return new Promise((resolve) => {
        var l_carpark = "N";
        if (g_all_pog_flag == "Y") {
            var z = 0;
        } else {
            var z = g_pog_index;
        }
        var l_carpark_shelfs = "";
        for (const l_pogJson of g_pog_json) {
            var l_module_count = 0;
            for (const l_module of g_pog_json[z].ModuleInfo) {
                //ASA 1443
                var l_count_shelf = 0;
                for (const l_shelf of l_module.ShelfInfo) {
                    // ASA-1446
                    if (l_shelf.ObjType !== "DIVIDER" && l_shelf.ObjType !== "TEXTBOX" && l_shelf.ObjType !== "NOTCH" && l_shelf.ObjType !== "CHEST" && l_shelf.ObjType !== "BASE") {
                        // if (l_shelf.ObjType !== "DIVIDER" && l_shelf.ObjType !== "TEXTBOX" && l_shelf.ObjType !== "NOTCH") {
                        var [curr_module, item_inside_world, shelf_rotate_hit, rotate_hit_module_ind] = get_curr_module(l_shelf.X, l_shelf.Y, "N", l_module, l_shelf, l_shelf, z);
                        if (item_inside_world == "N") {
                            l_carpark = "Y";
                            // break;
                            l_carpark_shelfs = l_carpark_shelfs + (l_carpark_shelfs !== "" ? ", " : "") + l_shelf.Shelf; //need to show multiple shelf details in error.
                        }
                    }
                    l_count_shelf++;
                }
                /*if (l_carpark == "Y") {
                break;
                }*/
                l_module_count++;
            }
            if (g_all_pog_flag == "Y") {
                z++;
            } else {
                resolve(l_carpark_shelfs);
                return; // exit the function after resolving the promise
            }
        }
        resolve(l_carpark_shelfs);
    });
}

function create_divider_iteminfo(p_pog_index, p_module_index, p_iteminfo) {
    var ItemInfo = {};
    ItemInfo["ItemID"] = p_iteminfo.Shelf;
    ItemInfo["Item"] = "DIVIDER";
    ItemInfo["W"] = p_iteminfo.DivWidth;
    ItemInfo["H"] = p_iteminfo.DivHeight;
    ItemInfo["D"] = p_iteminfo.D;
    ItemInfo["Color"] = p_iteminfo.DivFillCol;
    ItemInfo["DimT"] = "";
    ItemInfo["Desc"] = p_iteminfo.Desc;
    ItemInfo["CType"] = "SHELF";
    ItemInfo["Shelf"] = p_iteminfo.Shelf;
    ItemInfo["Barcode"] = "";
    ItemInfo["LocID"] = "";
    ItemInfo["PegID"] = "";
    ItemInfo["PegSpread"] = "";
    ItemInfo["PegPerFacing"] = "";
    ItemInfo["Fixed"] = "N";
    ItemInfo["CapStyle"] = "";
    /*ASA-1170, Start*/
    ItemInfo["CapFacing"] = "";
    ItemInfo["CapMerch"] = "";
    ItemInfo["CapOrientaion"] = "";
    ItemInfo["CapHeight"] = "";
    /*ASA-1170, End*/
    ItemInfo["Rotation"] = p_iteminfo.Rotation;
    ItemInfo["BHoriz"] = 1;
    ItemInfo["BVert"] = 1;
    ItemInfo["BaseD"] = 1;
    ItemInfo["CrushHoriz"] = 0;
    ItemInfo["CrushVert"] = 0;
    ItemInfo["CrushD"] = 0;
    ItemInfo["Orientation"] = "0";
    ItemInfo["MerchStyle"] = "0";
    ItemInfo["Supplier"] = "";
    ItemInfo["Brand"] = "";
    ItemInfo["BrandType"] = "";
    ItemInfo["Group"] = "";
    ItemInfo["Dept"] = "";
    ItemInfo["ObjID"] = "";
    ItemInfo["Class"] = "";
    ItemInfo["SubClass"] = "";
    ItemInfo["StdUOM"] = "";
    ItemInfo["SizeDesc"] = "";
    ItemInfo["Price"] = "";
    ItemInfo["Cost"] = "";
    ItemInfo["RegMovement"] = "";
    ItemInfo["RegMovementInd"] = "";
    ItemInfo["DaysOfSupplyInd"] = "";
    ItemInfo["MoveBasis"] = "";
    ItemInfo["AvgSales"] = "";
    ItemInfo["AvgSalesInd"] = "";
    ItemInfo["ItemStatus"] = "";
    ItemInfo["CDTLvl1"] = ""; //ASA-1130
    ItemInfo["CDTLvl2"] = ""; //ASA-1130
    ItemInfo["CDTLvl3"] = ""; //ASA-1130
    ItemInfo["OldItemHeight"] = p_iteminfo.DivHeight;
    ItemInfo["CHPerc"] = 0;
    ItemInfo["CWPerc"] = 0;
    ItemInfo["CDPerc"] = 0;
    ItemInfo["ItemNesting"] = 0;
    ItemInfo["NVal"] = 0;
    ItemInfo["ItemContain"] = 0;
    ItemInfo["CnVal"] = 0;
    ItemInfo["IsContainer"] = "N";
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
    ItemInfo["SIndex"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length + 1;
    ItemInfo["Dragged"] = "N";
    ItemInfo["Quantity"] = 1;
    ItemInfo["X"] = "";
    ItemInfo["Y"] = "";
    ItemInfo["Z"] = 0.001;
    ItemInfo["SlotDivider"] = "N";
    ItemInfo["ImgExists"] = "N";
    ItemInfo["CapCount"] = 0;
    ItemInfo["Exists"] = "E";
    ItemInfo["OW"] = p_iteminfo.DivWidth;
    ItemInfo["OH"] = p_iteminfo.DivHeight;
    ItemInfo["OD"] = p_iteminfo.D;
    ItemInfo["DivStX"] = p_iteminfo.DivStX;
    ItemInfo["Distance"] = "";
    ItemInfo["YDistance"] = "";
    ItemInfo["SpreadItem"] = 0;
    ItemInfo["MHorizCrushed"] = "N";
    ItemInfo["MVertCrushed"] = "N";
    ItemInfo["MDepthCrushed"] = "N";
    ItemInfo["MCapTopFacing"] = "N"; //ASA-1170
    ItemInfo["RW"] = p_iteminfo.DivWidth;
    ItemInfo["RH"] = p_iteminfo.DivHeight;
    ItemInfo["RD"] = p_iteminfo.D;
    ItemInfo["LObjID"] = -1;
    ItemInfo["SubLblObjID"] = -1; //ASA-1182
    ItemInfo["DimUpdate"] = "N";
    ItemInfo["TopObjID"] = "";
    ItemInfo["BottomObjID"] = "";
    ItemInfo["SecondTier"] = "";
    ItemInfo["CompItemObjID"] = "";
    ItemInfo["SellingPrice"] = "";
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
    ItemInfo["SalesUnit"] = "";
    ItemInfo["NetSales"] = "";
    ItemInfo["CogsAdj"] = "";
    ItemInfo["CogsAdjInd"] = "";
    ItemInfo["GrossProfit"] = "";
    ItemInfo["GrossProfitInd"] = "";
    ItemInfo["WeeksCount"] = "";
    ItemInfo["WeeksCountInd"] = "";
    ItemInfo["MovingItem"] = "";
    ItemInfo["Profit"] = "";
    ItemInfo["TotalMargin"] = "";
    ItemInfo["MHorizFacings"] = -1;
    ItemInfo["MVertFacings"] = -1;
    ItemInfo["MDepthFacings"] = -1;
    ItemInfo["OrientationDesc"] = "Front 0";
    ItemInfo["StoreCnt"] = "";
    ItemInfo["CapMaxH"] = "";
    ItemInfo["MaxHCapStyle"] = "";
    ItemInfo["NewYN"] = "";
    ItemInfo["Delist"] = "N";
    ItemInfo["DescSecond"] = "";
    ItemInfo["NewPegId"] = "";
    ItemInfo["OverhungItem"] = "N"; //ASA-1138
    ItemInfo["AutoDiv"] = "Y"; //ASA-1265
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
    ItemInfo["OOSPerc"] = ""; //ASA-1688 Added for oos%
    ItemInfo["InitialItemDesc"] = ""; //ASA-1734 Issue 1
    ItemInfo["InitialBrand"] = ""; //ASA-1787 Request #6
    ItemInfo["InitialBarcode"] = ""; //ASA-1787 Request #6
    return ItemInfo;
}
function create_div_shelfinfo(p_pog_index, p_module_index, p_shelf_info) {
    var ShelfInfo = {};
    ShelfInfo["Shelf"] = p_shelf_info.Shelf;
    ShelfInfo["ObjType"] = "DIVIDER";
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
    ShelfInfo["H"] = p_shelf_info.DivHeight;
    ShelfInfo["W"] = p_shelf_info.DivWidth;
    ShelfInfo["D"] = p_shelf_info.D;
    ShelfInfo["Rotation"] = 0;
    ShelfInfo["Slope"] = 0;
    ShelfInfo["Color"] = p_shelf_info.DivFillCol;
    ShelfInfo["LiveImage"] = "";
    ShelfInfo["HorizSlotStart"] = 0;
    ShelfInfo["HorizSlotSpacing"] = 0;
    ShelfInfo["HorizStart"] = 0;
    ShelfInfo["HorizSpacing"] = 0;
    ShelfInfo["UOverHang"] = 0;
    ShelfInfo["LoOverHang"] = 0;
    ShelfInfo["VertiStart"] = 0;
    ShelfInfo["VertiSpacing"] = 0;
    ShelfInfo["X"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].W / 2 + parseFloat($v("P25_DIV_WIDTH")) / 100 / 2;
    ShelfInfo["Y"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].H / 2 + parseFloat($v("P25_DIV_HEIGHT")) / 100 / 2;
    ShelfInfo["Z"] = p_shelf_info.Z;
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
    ShelfInfo["AutoPlacing"] = "";
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
    ShelfInfo["DivHeight"] = p_shelf_info.DivHeight;
    ShelfInfo["DivWidth"] = p_shelf_info.DivWidth; //ASA-1387 Issue 3
    ShelfInfo["DivPst"] = p_shelf_info.DivPst;
    ShelfInfo["DivPed"] = p_shelf_info.DivPed;
    ShelfInfo["DivPbtwFace"] = p_shelf_info.DivPbtwFace;
    ShelfInfo["DivStX"] = p_shelf_info.DivStX;
    ShelfInfo["DivSpaceX"] = p_shelf_info.DivSpaceX;
    ShelfInfo["DivFillCol"] = p_shelf_info.DivFillCol;
    ShelfInfo["DivCount"] = p_shelf_info.DivCount;
    ShelfInfo["DivCheck"] = p_shelf_info.DivCheck;
    ShelfInfo["NoDivIDShow"] = p_shelf_info.NoDivIDShow; //ASA-1406
    return ShelfInfo;
}

//this function is called from create_shelf. we will have a setup in shelf edit, user can add divider settings
//shelf start, shelf end, inbetween items. also use will set dimensions for divider. this will create dividers when click save.
async function create_shelf_dividers(p_pog_index, p_module_index, p_shelf_index) {
    var i = 0;
    //var index_arr = [];//ASA-1402 not used this variable
    var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
    var spread_gap = shelfdtl.HorizGap;
    var horiz_gap = spread_gap;
    var spread_product = shelfdtl.SpreadItem;
    var itemdtl = shelfdtl.ItemInfo;
    var i = 0;

    /*for (obj of itemdtl) {//ASA-1402 not used this variable
    if (obj.Item !== 'DIVIDER') {
    index_arr.push(i);
    }
    i++;
    }*/

    var next_item_index = 0;
    //we create divider iteminfo and shelfinfo inside the same module and recreate the shelf. so divider will be added.
    if (shelfdtl.DivPbtwFace == "Y" && shelfdtl.DivHeight > 0 && shelfdtl.DivWidth > 0) {
        //20240513 - Regression Issue 5
        //if ((shelfdtl.DivPbtwFace == "Y" || shelfdtl.DivPst == "Y" || shelfdtl.DivPed == "Y") && shelfdtl.DivHeight > 0 && shelfdtl.DivWidth > 0) {//20240513 - Regression Issue 5
        var indicesToRemove = [];
        //var divider_name = [];//ASA-1402
        var divider_obj_id = []; //ASA-1402

        for (var obj_ind = 0; obj_ind < itemdtl.length; obj_ind++) {
            var obj = itemdtl[obj_ind];

            if (obj.Item === "DIVIDER") {
                //&& obj.AutoDiv == 'Y'
                indicesToRemove.push(obj_ind);
                //divider_name.push(obj.ItemID);//ASA-1402
                divider_obj_id.push(obj.ObjID); //ASA-1402
                var selectedObject = g_world.getObjectById(obj.ObjID);
                g_world.remove(selectedObject);
            }
        }
        // Remove 'DIVIDER' objects using splice
        for (var i = indicesToRemove.length - 1; i >= 0; i--) {
            var indexToRemove = indicesToRemove[i];
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.splice(indexToRemove, 1);
        }

        // Reset obj_ind after removal
        obj_ind = 0;
        var l_div_index = 0;
        for (var l_div_objid of divider_obj_id) {
            //ASA-1402
            var l_shelf = 0;
            for (var shelf of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                if (shelf.ObjType === "DIVIDER" && l_div_objid == shelf.ShelfDivObjID) {
                    //ASA-1402
                    //if (l_divdername == shelf.Shelf) {//ASA-1402
                    g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.splice(l_shelf, 1);
                    //}
                }
                l_shelf++;
            }

            l_div_index++;
        }
        var l_itemlength = shelfdtl.ItemInfo.length;

        var l_max_value = ""; //Start ASA-1402
        //Task_27734
        for (obj of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
            console.log(obj.Shelf, obj.ObjType, i);
            if (obj.Shelf.indexOf("/") !== -1) {
                // && obj.ObjType == 'DIVIDER') {//Task_27734
                console.log("after if", obj.Shelf.substring(obj.Shelf.indexOf("/") + 1));
                if (l_max_value == "") {
                    l_max_value = parseInt(obj.Shelf.substring(obj.Shelf.indexOf("/") + 1));
                } else {
                    l_max_value = Math.max(l_max_value, parseInt(obj.Shelf.substring(obj.Shelf.indexOf("/") + 1)));
                    console.log("inside ", Math.max(l_max_value, parseInt(obj.Shelf.substring(obj.Shelf.indexOf("/") + 1))));
                }
            }
            i++;
        }
        l_max_value = l_max_value == "" ? 1 : l_max_value + 1; //End ASA-1402

        if (shelfdtl.DivPst == "Y") {
            var itemInfo = create_divider_iteminfo(p_pog_index, p_module_index, shelfdtl);
            var rand_value = Math.floor(Math.random() * 999999);
            itemInfo.ItemID = p_module_index + 1 + "/" + l_max_value; //(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length + 1);// ASA-1402
            //  if (itemInfo.DivStX !== 0) {
            //   itemInfo.Fixed = "Y";
            //  } else {
            itemInfo.Fixed = "N";
            //  }
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.splice(next_item_index, 0, itemInfo);
            var shelfinfo = create_div_shelfinfo(p_pog_index, p_module_index, shelfdtl);
            shelfinfo.Shelf = p_module_index + 1 + "/" + l_max_value; //(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length + 1);// ASA-1402
            shelfinfo.DivShelf = shelfdtl.Shelf; //Task_27734
            l_max_value = l_max_value + 1; // ASA-1402
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.push(shelfinfo);
            next_item_index = 1;
        }

        if (shelfdtl.DivPbtwFace == "Y") {
            for (i = 0; i < l_itemlength - 1; i++) {
                var obj_ind = 0;
                for (obj of itemdtl) {
                    if ((obj.Item !== "DIVIDER" && obj_ind > next_item_index && obj_ind < shelfdtl.ItemInfo.length - 1) || obj_ind == shelfdtl.ItemInfo.length - 1) {
                        next_item_index = (shelfdtl.DivPst == "Y" && next_item_index == 1) || next_item_index == 0 ? obj_ind : obj_ind + 1;
                        var itemInfo = create_divider_iteminfo(p_pog_index, p_module_index, shelfdtl);
                        itemInfo.ItemID = p_module_index + 1 + "/" + l_max_value; //(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length + 1);// ASA-1402
                        itemInfo.Fixed = "N";
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.splice(next_item_index, 0, itemInfo);
                        var shelfinfo = create_div_shelfinfo(p_pog_index, p_module_index, shelfdtl);
                        shelfinfo.Shelf = p_module_index + 1 + "/" + l_max_value; //(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length + 1);// ASA-1402
                        shelfinfo.DivShelf = shelfdtl.Shelf; //Task_27734
                        l_max_value = l_max_value + 1; // ASA-1402
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.push(shelfinfo);
                        break;
                    }
                    obj_ind++;
                }
            }
        }
        if (shelfdtl.DivPed == "Y") {
            var itemInfo = create_divider_iteminfo(p_pog_index, p_module_index, shelfdtl);
            var rand_value = Math.floor(Math.random() * 999999);
            itemInfo.ItemID = p_module_index + 1 + "/" + l_max_value; //(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length + 1);// ASA-1402
            itemInfo.Fixed = "N";
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.splice(shelfdtl.ItemInfo.length + 1, 0, itemInfo);
            var shelfinfo = create_div_shelfinfo(p_pog_index, p_module_index, shelfdtl);
            shelfinfo.Shelf = p_module_index + 1 + "/" + l_max_value; //(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length + 1);// ASA-1402
            shelfinfo.DivShelf = shelfdtl.Shelf; //Task_27734
            l_max_value = l_max_value + 1; // ASA-1402
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.push(shelfinfo);
        }
    } else {
        if (shelfdtl.DivPbtwFace == "N") {
            var indicesToRemove = [];
            //var divider_name = [];//ASA-1402
            var divider_obj_id = []; //ASA-1402

            for (var obj_ind = 0; obj_ind < itemdtl.length; obj_ind++) {
                var obj = itemdtl[obj_ind];

                if (obj.Item === "DIVIDER") {
                    indicesToRemove.push(obj_ind);
                    //divider_name.push(obj.ItemID);//ASA-1402
                    divider_obj_id.push(obj.ObjID); //ASA-1402
                    var selectedObject = g_world.getObjectById(obj.ObjID);
                    g_world.remove(selectedObject);
                }
            }
            // Remove 'DIVIDER' objects using splice
            for (var i = indicesToRemove.length - 1; i >= 0; i--) {
                var indexToRemove = indicesToRemove[i];
                g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo.splice(indexToRemove, 1);
            }

            // Reset obj_ind after removal
            obj_ind = 0;
            var l_div_index = 0;
            for (var l_div_objid of divider_obj_id) {
                // ASA-1402
                var l_shelf = 0;
                for (var shelf of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                    if (shelf.ObjType === "DIVIDER" && l_div_objid == shelf.ShelfDivObjID) {
                        //ASA-1402
                        //if (l_divdername == shelf.Shelf) {//ASA-1402
                        g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.splice(l_shelf, 1);
                        //}
                    }
                    l_shelf++;
                }

                l_div_index++;
            }
        }
    }
    var total_item_width = 0;
    var item_cnt = 0;
    var j = 0;
    for (const items of itemdtl) {
        total_item_width = total_item_width + items.W;
        j++;
        item_cnt = item_cnt + 1;
    }
    if (shelfdtl.ItemInfo.length > 0) {
        if (total_item_width > shelfdtl.W) {
            var spread = 0;
        } else {
            var spread = (shelfdtl.W - total_item_width) / (item_cnt - 1);
        }
    } else {
        var spread = (shelfdtl.W - total_item_width) / item_cnt;
    }
    for (const items of itemdtl) {
        items.SpreadItem = spread;
    }

    // if (reorder_items(p_module_index, p_shelf_index, p_pog_index)) {
    spread_product = "E";
    var i = 0;
    for (const items of itemdtl) {
        var prev_check;
        var j = 0;
        //Task_27734
        /*if (shelfdtl.DivPst == "Y" && shelfdtl.DivStX !== 0 && items.Item == "DIVIDER" && j == 0) {
        prev_check = "D";
        j = 1;
        }
        if (prev_check == "D") {
        items.X = (shelfdtl.X - shelfdtl.W / 2) + shelfdtl.DivStX;
        prev_check = "I"
        } else {*/
        var new_x = get_item_xaxis(items.W, items.H, items.D, items.CType, -1, horiz_gap, spread_product, spread_gap, p_module_index, p_shelf_index, i, "Y", itemdtl.length, "N", p_pog_index);
        items.X = new_x;
        //}
        var [itemx, itemy] = get_item_xy(shelfdtl, items, items.W, items.H, p_pog_index);
        items.Y = itemy;
        i++;
    }
    // }
    await update_item_distance(p_module_index, p_shelf_index, p_pog_index);
    if (reorder_items(p_module_index, p_shelf_index, p_pog_index)) {
        var i = 0;
        for (const items of itemdtl) {
            var new_x = get_item_xaxis(items.W, items.H, items.D, items.CType, -1, horiz_gap, spread_product, spread_gap, p_module_index, p_shelf_index, i, "Y", itemdtl.length, "N", p_pog_index);
            // var [itemx, itemy] = get_item_xy(shelfdtl, items, items.W, items.H, p_pog_index);
            items.X = new_x;
            // items.Y = itemy;
            for (shelf_info of g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo) {
                //ASA-1350
                if (shelf_info.Shelf == items.ItemID && items.Item == "DIVIDER") {
                    shelf_info.X = new_x;
                    shelf_info.Y = items.Y;
                }
            }
            i++;
        }
    }
}

function remove_shelf_dividers(p_pog_index, p_module_index, p_shelf) {
    //Task_27734
    for (var i = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length - 1; i >= 0; i--) {
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[i].DivShelf == p_shelf) {
            g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.splice(i, 1);
        }
    }
}
function bulk_edit_color() {
    logDebug("function : bulk_edit_color", "S");

    // Check if there are items to edit or if the item edit flag is set
    if (g_delete_details.length > 0 || g_item_edit_flag == "Y") {
        // Separate arrays for "ITEM" and "SHELF"
        const itemArray = g_delete_details.filter((item) => item.Object === "ITEM");
        const shelfArray = g_delete_details.filter((item) => item.Object === "SHELF");
        if (shelfArray.length > 0) {
            setIconForInconsistentTag(shelfArray, "Color", "P25_COMMON_COLOR", "S"); // Call with shelfArray
        } else if (itemArray.length > 0) {
            setIconForInconsistentTag(itemArray, "Color", "P25_COMMON_COLOR", "I"); // Call with itemArray
        }

        // Open the color editing dialog
        openInlineDialog("EDIT_COLOR", 30, 25);
        g_dblclick_opened = "Y";
    }

    logDebug("function : bulk_edit_color", "E");
}

function highlight_validation(pCheckFormula = "N") {
    //ASA -1416 task 5 S
    if ($v("P25_CONDITION_NAME") == "") {
        $s("P25_VALIDATION_CHECK", "N");
        alert(get_message("POGCR_HIGHLIGHT_CONDITION_NAME"));
        return false;
    } else if (pCheckFormula == "N" && (($v("P25_HG_LOV_VALUES") === "" && ($v("P25_FIELD") == "Brand_Category" || $v("P25_FIELD") == "ItemStatus" || $v("P25_FIELD") == "Gobecobrand" || $v("P25_FIELD") == "Internet")) || ($v("P25_VALUE") === "" && ($v("P25_FIELD") !== "Brand_Category" || $v("P25_FIELD") !== "ItemStatus" || $v("P25_FIELD") !== "Gobecobrand" || $v("P25_FIELD") !== "Internet"))) && $v("P25_OPERATOR") !== "!==''" && $v("P25_OPERATOR") !== "==''") {
        $s("P25_VALIDATION_CHECK", "N");
        alert(get_message("POGCR_HIGHLIGHT_VALUE_CHECK"));
        return false;
    } else if ($v("P25_FORMULA") == "" && pCheckFormula == "Y") {
        $s("P25_VALIDATION_CHECK", "N"); //ASA-1644 Issue 10
        alert(get_message("POGCR_HIGHLIGHT_FORMULA_CHECK")); //ASA-1644 Issue 4
        return false;
    } else {
        $s("P25_VALIDATION_CHECK", "Y");
        return true;
    }
} //ASA -1416 task 5 E

async function add_highlight_prefrence() {
    //ASA 1416
    logDebug("function : add_highlight_prefrence");
    return new Promise(function (resolve, reject) {
        apex.server.process(
            "SET_HIGHLIGHTS", {
            x08: $v("P25_HIGHLIGHT_NAME"),
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) != "") {
                    alert(pData);
                } else {
                    apex.region("condition_rgn").refresh(); //ASA-1416 issue 1 S
                    apex.event.trigger("#P25_HIGHLIGHT_PREFERENCE", "apexrefresh");
                    closeInlineDialog("higlight_name"); //ASA-1416 issue 1 E
                    for (n = 0; n < g_highlightArr.length; n++) {
                        if (g_highlightArr[n].CHECK === "N") {
                            g_highlightArr[n].CHECK = "Y";
                        }
                    }
                    resolve("success");
                    logDebug("function : add_highlight_prefrence", "E");
                }
            },
        });
    });
}

// async function open_in_new_clone_tab(p_pog_list_arr, p_imageLoadInd, p_pog_draft_ind) { //ASA-1425
//     try {
//         console.log("open", p_pog_list_arr);
//         return new Promise(function (resolve, reject) {
//             if (p_pog_draft_ind == 'D') {
//                 var seq_id = [],
//                     DraftVersion = [],
//                     DescriptionDetails = [];

//                 var rec_detail = [];

//                 if (sessionStorage.getItem("draft_pog_list") !== null) {
//                     var records = JSON.parse(sessionStorage.getItem("draft_pog_list"));
//                     // sessionStorage.removeItem("open_attribute");
//                     // sessionStorage.removeItem("draft_pog_list");
//                 }

//                 for (const pog_draft_details of records) {
//                     seq_id.push(pog_draft_details.SequenceID);
//                     DescriptionDetails.push(pog_draft_details.DescriptionDetails);
//                     DraftVersion.push(pog_draft_details.DraftVersion);
//                 }
//                 i = 0;
//                 for (const r of seq_id) {
//                     if (i == 0) {
//                         rec_detail.push(r);
//                     } else {
//                         javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_DRAFT_LIST,P25_POG_DESCRIPTION,P25_EXISTING_DRAFT_VER,P25_POG_IND:Y,N," + seq_id[i] + ",'\'" + DescriptionDetails[i] + "'\'," + DraftVersion[i] + ",D");
//                     }
//                     i = i + 1;
//                 }

//                 if (rec_detail.length > 0) {
//                     g_pog_index = 0;
//                     g_multi_pog_json = [];
//                     addLoadingIndicator();
//                     appendMultiCanvasRowCol(1);
//                     var draft_pog_list = [];
//                     var pog_details_obj = {};

//                     pog_details_obj['SequenceID'] = seq_id[0];
//                     pog_details_obj['DescriptionDetails'] = DescriptionDetails[0];
//                     pog_details_obj['DraftVersion'] = DraftVersion[0];
//                     draft_pog_list.push(pog_details_obj);
//                     open_draft_pog(p_imageLoadInd, JSON.stringify(draft_pog_list), 'M');

//                     // removeLoadingIndicator(regionloadWait);
//                 }
//
//                 // if (sessionStorage.getItem("draft_pog_list") !== null) {
//                 //     sessionStorage.removeItem("open_attribute");
//                 //     sessionStorage.removeItem("draft_pog_list");
//                 // }

//             } else {
//                 var pog_code_list = [],
//                     pog_version_list = [],
//                     real_pog_list = [];

//                 var rec_detail = [];

//                 for (const pog_details of p_pog_list_arr) {
//                     pog_code_list.push(pog_details.POGCode);
//                     pog_version_list.push(pog_details.POGVersion);
//                     real_pog_list.push(pog_details.IsRealPOG);
//                 }
//                 i = 0;
//                 for (const r of pog_code_list) {
//                     if (i == 0) {
//                         rec_detail.push(r);
//                     } else {
//                         javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_NEW_TAB_POG_CODE,P25_NEW_TAB_POG_VERSION,P25_POG_IND:Y,N," + pog_code_list[i] + "," + pog_version_list[i] + ",D");
//                     }
//                     i = i + 1;
//                 }

//                 if (rec_detail.length > 0) {
//                     g_pog_index = 0;
//                     g_multi_pog_json = [];
//                     addLoadingIndicator();
//                     appendMultiCanvasRowCol(1);
//                     $s("P25_OPEN_POG", "Y");
//                     $s("P25_OPEN_POG_CODE", rec_detail[0]);
//                     $s("P25_OPEN_POG_VERSION", pog_version_list[0]);
//                     get_existing_pog(rec_detail[0], pog_version_list[0], 0, p_imageLoadInd);
//                     removeLoadingIndicator(regionloadWait);
//                 }
//             }
//         });

//     } catch (err) {
//         error_handling(err);
//     }
// }
function delete_prefrence() {
    //ASA-1416 issue 4 S
    //Task_29818 - Start
    // ax_message.confirm(get_message("DELETE_CONFIRM_MSG"), function (e) {
    //     if (e) {
    //         apex.server.process(
    //             "DELETE_PREFRENCE", {
    //             x01: $v("P25_HIGHLIGHT_PREFERENCE")
    //         }, {
    //             dataType: "text",
    //             success: function (pData) {
    //                 if ($.trim(pData) != "") {
    //                     raise_error(pData);
    //                 } else {
    //                     apex.event.trigger("#P25_HIGHLIGHT_PREFERENCE", "apexrefresh");
    //                     apex.region("condition_rgn").refresh();
    //                     logDebug("function : delete_pog_list", "E");
    //                 }
    //             },
    //             loadingIndicatorPosition: "page",
    //         });
    //     }
    // });
    confirm(get_message("DELETE_CONFIRM_MSG"), get_global_ind_values("AI_CONFIRM_OK_TEXT"), get_global_ind_values("AI_CONFIRM_CANCEL_TEXT"), function () {
        apex.server.process(
            "DELETE_PREFRENCE", {
            x01: $v("P25_HIGHLIGHT_PREFERENCE"),
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) != "") {
                    raise_error(pData);
                } else {
                    apex.event.trigger("#P25_HIGHLIGHT_PREFERENCE", "apexrefresh");
                    apex.region("condition_rgn").refresh();
                    logDebug("function : delete_pog_list", "E");
                }
            },
            loadingIndicatorPosition: "page",
        });
    });
    //Task_29818 - End
} //ASA-1416 issue 4 E

//this function is used when select POG and click open in new tab. this will loop through the POG list and
//create a clone on new tab and send the POG code. on page load the ajax call will fetch json and create POG.
async function open_in_new_clone_tab(p_pog_list_arr, p_imageLoadInd, p_pog_draft_ind) {
    //ASA-1425
    try {
        console.log("open", p_pog_list_arr);
        return new Promise(function (resolve, reject) {
            if (p_pog_draft_ind == "D") {
                var seq_id = [],
                    DraftVersion = [],
                    DescriptionDetails = [];
                g_canvas_objects = []; //20240708 Regression issue 5
                g_scene_objects = []; //ASA-1520 Regression Issue 5
                g_pog_json_data = []; //ASA-1520 Regression Issue 5

                var rec_detail = [];

                if (sessionStorage.getItem("draft_pog_list") !== null) {
                    var records = JSON.parse(sessionStorage.getItem("draft_pog_list"));
                }

                for (const pog_draft_details of records) {
                    seq_id.push(pog_draft_details.SequenceID);
                    DescriptionDetails.push(pog_draft_details.DescriptionDetails);
                    DraftVersion.push(pog_draft_details.DraftVersion);
                }
                i = 0;
                //first POG in the list will be created in the same page.
                for (const r of seq_id) {
                    if (i == 0) {
                        rec_detail.push(r);
                    } else {
                        javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_DRAFT_LIST,P25_POG_DESCRIPTION,P25_EXISTING_DRAFT_VER,P25_POG_IND:Y,N," + seq_id[i] + "," + DescriptionDetails[i] + "," + DraftVersion[i] + ",D");
                    }
                    i = i + 1;
                }

                if (rec_detail.length > 0) {
                    g_pog_index = 0;
                    g_multi_pog_json = [];
                    appendMultiCanvasRowCol(1);
                    var draft_pog_list = [];
                    var pog_details_obj = {};

                    pog_details_obj["SequenceID"] = seq_id[0];
                    pog_details_obj["DescriptionDetails"] = DescriptionDetails[0];
                    pog_details_obj["DraftVersion"] = DraftVersion[0];
                    draft_pog_list.push(pog_details_obj);
                    open_draft_pog(p_imageLoadInd, JSON.stringify(draft_pog_list), "M");
                }
            } else {
                var pog_code_list = [],
                    pog_version_list = [],
                    real_pog_list = [];
                g_canvas_objects = []; //20240708 Regression issue 5
                g_scene_objects = []; //ASA-1520 Regression Issue 5
                g_pog_json_data = []; //ASA-1520 Regression Issue 5

                var rec_detail = [];

                for (const pog_details of p_pog_list_arr) {
                    pog_code_list.push(pog_details.POGCode);
                    pog_version_list.push(pog_details.POGVersion);
                    real_pog_list.push(pog_details.IsRealPOG);
                }
                i = 0;
                for (const r of pog_code_list) {
                    if (i == 0) {
                        rec_detail.push(r);
                    } else {
                        javascript: window.open("f?p=" + $v("pFlowId") + ":25:" + $v("pInstance") + ":APEX_CLONE_SESSION:NO::P25_OPEN_NEW_TAB,P25_PRODUCT_BTN_CLICK,P25_NEW_TAB_POG_CODE,P25_NEW_TAB_POG_VERSION,P25_POG_IND:Y,N," + pog_code_list[i] + "," + pog_version_list[i] + ",E");
                    }
                    i = i + 1;
                }

                if (rec_detail.length > 0) {
                    g_pog_index = 0;
                    g_multi_pog_json = [];
                    addLoadingIndicator();
                    appendMultiCanvasRowCol(1);
                    $s("P25_OPEN_POG", "Y");
                    $s("P25_OPEN_POG_CODE", rec_detail[0]);
                    $s("P25_OPEN_POG_VERSION", pog_version_list[0]);
                    get_existing_pog(rec_detail[0], pog_version_list[0], 0, p_imageLoadInd);
                    removeLoadingIndicator(regionloadWait);
                }
            }
        });
    } catch (err) {
        error_handling(err);
    }
}

/*Start ASA-1412*/
//this function will loop through all the items and validate all first. which ever items have problem. will try to crush or reduce facing
//and solve the errors.
async function refresh_items() {
    logDebug("function : refresh_items;");
    try {
        if (g_pog_json.length > 0) {
            addLoadingIndicator();
            if (g_all_pog_flag == "Y") {
                var z = 0;
            } else {
                var z = g_pog_index;
            }
            var error_details = [];
            for (const pogJson of g_pog_json) {
                var i = 0;
                var ret_json = await update_pog_json(z); //update new values from DB first.
                g_pog_json[z] = JSON.parse(ret_json)[0]; //ASA-1412 issue 16 20240708
                //setting overhung to Y so that evern when validation failes dimensions to be updated.
                g_overhung_shelf_active = "Y"; //ASA-1412 issues 20240704
                for (const modules of g_pog_json[z].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var j = 0;
                        var recreate = "N";
                        for (const shelfs of modules.ShelfInfo) {
                            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
                                if (shelfs.ItemInfo.length > 0) {
                                    shelfs.RefreshItem = "N";
                                    //updating Distance, PegboardX, PegboardY variables to find out the distance from shelf start.
                                    await update_item_distance(i, j, z, "N");
                                    var k = 0;
                                    for (const items of shelfs.ItemInfo) {
                                        if (items.Item !== "DIVIDER") {
                                            items.NetSales = typeof items.NetSales !== "undefined" && items.NetSales !== "" ? parseFloat(items.NetSales) : 0; //ASA-1412 issue 16 20240708
                                            items.NVal = typeof items.NVal !== "undefined" && items.NVal !== "" && items.NVal !== null ? items.NVal : 0; //ASA-1412 issue 12 20240709
                                            //Logic to check and update facings value from POG max facing and Max facing UDA.
                                            var valid_pass = await update_item_max_facings(i, j, k, z);
                                            var cap_nest_check = "N"; //ASA-1412 issue 16 20240708
                                            if (((items.CapStyle == "1" || items.CapStyle == "2" || items.CapStyle == "3") && shelfs.ObjType == "SHELF") || items.ItemNesting == "W" || items.ItemNesting == "H" || items.ItemNesting == "D") {
                                                //ASA-1412 issue 1 20240708 //ASA-1412 issue 16 20240708
                                                cap_nest_check = "Y";
                                            }
                                            //Start ASA-1412 issues 20240704
                                            var [failed, dim_type, update_val, manual_crush] = await check_crush_perc(items);
                                            if (failed == "Y") {
                                                if (manual_crush == "Y") {
                                                    if (dim_type == "H") {
                                                        items.CrushVert = update_val;
                                                    } else if (dim_type == "W") {
                                                        items.CrushHoriz = update_val;
                                                    } else if (dim_type == "D") {
                                                        items.CrushD = update_val;
                                                    }
                                                }
                                                valid_pass = "N";
                                            }
                                            //End ASA-1412 issues 20240704

                                            //This is to check whether there is a mismatch in any of the dim(Unit, Case, Display, Tray, crush, nesting, container value )
                                            if (check_dim_difference(i, j, k, z) || valid_pass == "N" || cap_nest_check == "Y") {
                                                //ASA-1412 issue 1 20240708 //ASA-1412 issue 16 20240708
                                                items.CWPerc = items.OrgCWPerc;
                                                items.CHPerc = items.OrgCHPerc;
                                                items.CDPerc = items.OrgCDPerc;
                                                items.Exists = "N"; //ASA-1412 issue 12 20240708
                                                if (items.MHorizCrushed == "N") {
                                                    //ASA-1412 issue 13 20240708 Start
                                                    items.CrushHoriz = 0;
                                                }
                                                if (items.MVertCrushed == "N") {
                                                    items.CrushVert = 0;
                                                }
                                                if (items.MDepthCrushed == "N") {
                                                    items.CrushD = 0;
                                                } //ASA-1412 issue 13 20240708 End
                                                //This will update the JSON with new values updated by above functions.
                                                dim_update_pass = await item_dimension_update(i, j, k, z);
                                                //recreate fixel only when there is any change in any item
                                                recreate = "Y"; //dim_update_pass;//ASA-1412 issue 12 20240709
                                                //added a error_details json just in case future any requirement of logging erros.
                                                if (dim_update_pass == "N") {
                                                    var details = {};
                                                    details["ErrorCode"] = "DIM";
                                                    details["Item"] = items.Item;
                                                    details["PIndex"] = z;
                                                    details["MIndex"] = i;
                                                    details["SIndex"] = j;
                                                    details["IIndex"] = k;
                                                    error_details.push(details);
                                                }
                                                if (valid_pass == "N") {
                                                    recreate = "Y";
                                                    var details = {};
                                                    details["ErrorCode"] = "FACING";
                                                    details["Item"] = items.Item;
                                                    details["PIndex"] = z;
                                                    details["MIndex"] = i;
                                                    details["SIndex"] = j;
                                                    details["IIndex"] = k;
                                                    error_details.push(details);
                                                }
                                            }
                                        }
                                        k++;
                                    }
                                    if (recreate == "Y") {
                                        shelfs.RefreshItem = "Y";
                                    }
                                }
                            }
                            j++;
                        }
                    }
                    i++;
                }

                var old_overhung_active = (g_overhung_shelf_active = g_scene_objects[z].Indicators.OverhungShelf); //ASA-1412 issues 20240704
                var old_all_pog_flag = g_all_pog_flag;
                //Setting overhung active to N to find out what are the item ouside shelf.
                g_overhung_shelf_active = "N";
                g_all_pog_flag = "N";
                //This will identify errors and also solution for solving error and populate g_errored_items array with details.
                await identifyOverhungItems(z, "N", "N"); //Regression issue 1 20242806
                g_overhung_shelf_active = old_overhung_active;
                g_all_pog_flag = old_all_pog_flag;
                console.log("g_errored_items", g_errored_items);
                //error correction don here.
                if (g_errored_items.length > 0) {
                    await correct_pog_errors("A", "N", z, "Y"); //ASA-1412
                    for (const objects of g_errored_items) {
                        g_pog_json[z].ModuleInfo[objects.MIndex].ShelfInfo[objects.SIndex].RefreshItem = "Y";
                    }
                }

                //Now we recreate all shelfs which are marked as RefreshItem = 'Y'
                var i = 0;
                for (const modules of g_pog_json[z].ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var j = 0;
                        var recreate = "N";
                        var j = 0;
                        for (const shelfs of modules.ShelfInfo) {
                            if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX" && shelfs.RefreshItem == "Y") {
                                if (reorder_items(i, j, z)) {
                                    var return_val = await recreate_all_items(i, j, shelfs.ObjType, "Y", -1, -1, shelfs.ItemInfo.length, "Y", "N", -1, -1, z, "N", z, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y");
                                }
                            }
                            j++;
                        }
                    }
                    i++;
                }
                var res = await calculateFixelAndSupplyDays("N", z); //ASA-1412 issue 3 20240628
                g_errored_items = [];
                render(z);
                if (g_all_pog_flag == "Y") {
                    z++;
                } else {
                    break;
                }
            }
            removeLoadingIndicator(regionloadWait);
            apex.message.showPageSuccess(g_pog_refresh_msg);
        }
    } catch (err) {
        error_handling(err);
    }
}

async function item_dimension_update(p_module_index, p_shelf_index, p_item_index, p_pog_index) {
    logDebug("function : item_dimension_update; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index, "S");
    try {
        var items = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
        var valid_pass = "Y";
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
        //Get actual dimension based on merch style
        var [select_width, select_height, select_depth] = get_select_dim(items);
        items.WChanged = "N";
        items.HChanged = "N";
        items.DChanged = "N";
        if (select_width > 0) {
            //Calling set dim function to update cap, nesting, crush and validate the item if ok. then proceed.
            var [item_width, item_height, item_depth, real_width, real_height, real_depth] = set_dim_validate_item(p_module_index, p_shelf_index, p_item_index, select_width, select_height, select_depth, items.ItemNesting, nesting_val, items.BHoriz, items.BVert, items.BaseD, items.Orientation, items.OrgCWPerc, items.OrgCHPerc, items.OrgCDPerc, "N", "Y", "N", p_pog_index, "Y"); ////ASA-1412 issue 12 20240708
        } else {
            valid_pass = "N";
        }
        //ASA-1412 issue 12 20240709 Start
        //if (item_width !== "ERROR") {

        if (item_width !== "ERROR") {
            items.DimUpdate = "Y";
        } else {
            valid_pass = "N";
            items.W = select_width * items.BHoriz + (items.HorizGap / 100) * (items.BHoriz - 1);
            items.H = select_height * items.BVert + (items.VertGap / 100) * (items.BVert - 1);
            items.D = select_depth * items.BaseD;
            items.RW = items.W;
            items.RH = items.H;
            items.RD = items.D;
            item_width = real_width = items.W;
            item_height = real_height = items.H;
            item_depth = real_depth = items.D;
        }
        items.OW = select_width;
        items.OH = select_height;
        items.OD = select_depth;
        //If validation passed then update the new dim details in json.
        update_item_org_dim(p_module_index, p_shelf_index, p_item_index, item_width, item_height, item_depth, real_width, real_height, real_depth, p_pog_index);
        await maximizeItemDepthFacings("D", p_module_index, p_shelf_index, p_item_index, p_pog_index); //ASA-1412 issue 11 20240709
        var [itemx, itemy] = get_item_xy(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index], items, item_width, item_height, p_pog_index);
        items.Y = itemy;

        /*} else {
        // items.DimUpdate = "E";
        valid_pass = "N";
        }*/
        //ASA-1412 issue 12 20240709 End
        logDebug("function : item_dimension_update", "E");
        return valid_pass;
    } catch (err) {
        error_handling(err);
    }
}
//Start ASA-1412 issues 20240704
async function check_crush_perc(items) {
    var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.W, items.H, items.D);
    var failed = "N";
    var update_val = "";
    var dim_type = "";
    var manual_crush = "N";
    if (actualHeight == "H" && items.CHPerc < items.CrushVert && items.CrushVert > 0) {
        failed = "Y";
        dim_type = "H";
        update_val = items.CHPerc;
        manual_crush = items.MVertCrushed == "Y" ? "Y" : "N";
    } else if (actualHeight == "W" && items.CWPerc < items.CrushVert && items.CrushVert > 0) {
        failed = "Y";
        dim_type = "H";
        update_val = items.CWPerc;
        manual_crush = items.MHorizCrushed == "Y" ? "Y" : "N";
    } else if (actualHeight == "D" && items.CDPerc < items.CrushVert && items.CrushVert > 0) {
        failed = "Y";
        dim_type = "H";
        update_val = items.CDPerc;
        manual_crush = items.MDepthCrushed == "Y" ? "Y" : "N";
    }
    if (actualWidth == "W" && items.CWPerc < items.CrushHoriz && items.CrushHoriz > 0) {
        failed = "Y";
        dim_type = "W";
        update_val = items.CWPerc;
        manual_crush = items.MHorizCrushed == "Y" ? "Y" : "N";
    } else if (actualWidth == "H" && items.CHPerc < items.CrushHoriz && items.CrushHoriz > 0) {
        failed = "Y";
        dim_type = "W";
        update_val = items.CHPerc;
        manual_crush = items.MVertCrushed == "Y" ? "Y" : "N";
    } else if (actualWidth == "D" && items.CDPerc < items.CrushHoriz && items.CrushHoriz > 0) {
        failed = "Y";
        dim_type = "W";
        update_val = items.CDPerc;
        manual_crush = items.MDepthCrushed == "Y" ? "Y" : "N";
    }
    if (actualDepth == "D" && items.CDPerc < items.CrushD && items.CrushD > 0) {
        failed = "Y";
        dim_type = "D";
        update_val = items.CDPerc;
        manual_crush = items.MDepthCrushed == "Y" ? "Y" : "N";
    } else if (actualDepth == "H" && items.CHPerc < items.CrushD && items.CrushD > 0) {
        failed = "Y";
        dim_type = "D";
        update_val = items.CHPerc;
        manual_crush = items.MVertCrushed == "Y" ? "Y" : "N";
    } else if (actualDepth == "W" && items.CWPerc < items.CrushD && items.CrushD > 0) {
        failed = "Y";
        dim_type = "D";
        update_val = items.CWPerc;
        manual_crush = items.MHorizCrushed == "Y" ? "Y" : "N";
    }
    return [failed, dim_type, update_val, manual_crush];
}
//End ASA-1412 issues 20240704

async function update_item_max_facings(p_module_index, p_shelf_index, p_item_index, p_pog_index) {
    logDebug("function : update_item_max_facings; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index, "S");
    try {
        var items = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index];
        var valid_pass = "Y";
        var horiz_facings = nvl(items.MPogHorizFacings) > 0 ? items.MPogHorizFacings : items.MHorizFacings;
        var vertical_facings = nvl(items.MPogVertFacings) > 0 ? items.MPogVertFacings : items.MVertFacings;
        var depth_facings = nvl(items.MPogDepthFacings) > 0 ? items.MPogDepthFacings : items.MDepthFacings;
        //according to jira if max facings are less than current facings then decrease all facings.
        if (horiz_facings < items.BHoriz && horiz_facings > -1) {
            items.BHoriz = horiz_facings;
            valid_pass = "N";
        }
        if (vertical_facings < items.BVert && vertical_facings > -1) {
            items.BVert = vertical_facings;
            valid_pass = "N";
        }
        if (depth_facings < items.BaseD && depth_facings > -1) {
            items.BaseD = depth_facings;
            valid_pass = "N";
        }
        //if max facings are higher then only depth facing to be recalculated with new value.
        if (depth_facings > items.BaseD) {
            maximizeItemDepthFacings("D", p_module_index, p_shelf_index, p_item_index, p_pog_index);
            valid_pass = "N";
        }
        logDebug("function : update_item_max_facings", "E");
        return valid_pass;
    } catch (err) {
        error_handling(err);
    }
}
/*End ASA-1412*/

function add_highlight_condition() {
    try {
        var valid = highlight_validation("Y");
        if (valid) {
            if (parseInt($v("P25_DUPLICATE_COUNT")) == 1) {
                alert(get_message("POGC_DUPLICATE_CONDITION"));
            } else {
                if ($v("P25_HIGHLIGHT_PREFERENCE") !== "") {
                    confirm(
                        get_message("POGCR_ADD_SEL_HGLT_PREF"),
                        get_message("SHCT_YES"),
                        get_message("SHCT_NO"),
                        function () {
                            apex.server.process(
                                "MODIFY_HIGHLIGHT_PREFERENCE", {
                                x01: $v("P25_HIGHLIGHT_PREFERENCE"),
                                x02: $v("P25_CONDITION_NAME"),
                                x03: $v("P25_FIELD"),
                                x04: $v("P25_VALUE"),
                                x05: $v("P25_BACKGROUND_COLOR"),
                                x06: $v("P25_OPERATOR"),
                                x07: $v("P25_CONDITION"),
                                x08: "Y",
                                x09: "A",
                                x10: $v("P25_VALIDATION_CHECK"),
                            }, {
                                dataType: "text",
                                success: function (pData) {
                                    var values = pData.split(",");
                                    $s("P25_HIG_SE_ID", values[1].trim());
                                    updateHighlightArr($v("P25_CONDITION_NAME"), "Y");
                                    apex.region("condition_rgn").refresh();
                                },
                            });
                        },
                        function () {
                            apex.server.process(
                                "MODIFY_HIGHLIGHT_PREFERENCE", {
                                x01: $v("P25_HIGHLIGHT_PREFERENCE"),
                                x02: $v("P25_CONDITION_NAME"),
                                x03: $v("P25_FIELD"),
                                x04: $v("P25_VALUE"),
                                x05: $v("P25_BACKGROUND_COLOR"),
                                x06: $v("P25_OPERATOR"),
                                x07: $v("P25_CONDITION"),
                                x08: "N",
                                x09: "A",
                                x10: $v("P25_VALIDATION_CHECK"),
                            }, {
                                dataType: "text",
                                success: function (pData) {
                                    var values = pData.split(",");
                                    $s("P25_HIG_SE_ID", values[1].trim());
                                    updateHighlightArr($v("P25_CONDITION_NAME"), "N");
                                    apex.region("condition_rgn").refresh();
                                },
                            });
                        });
                } else {
                    apex.server.process(
                        "MODIFY_HIGHLIGHT_PREFERENCE", {
                        x01: "",
                        x02: $v("P25_CONDITION_NAME"),
                        x03: $v("P25_FIELD"),
                        x04: $v("P25_VALUE"),
                        x05: $v("P25_BACKGROUND_COLOR"),
                        x06: $v("P25_OPERATOR"),
                        x07: $v("P25_CONDITION"),
                        x08: "N",
                        x09: "A",
                        x10: $v("P25_VALIDATION_CHECK"),
                    }, {
                        dataType: "text",
                        success: function (pData) {
                            var values = pData.split(",");
                            $s("P25_HIG_SE_ID", values[1].trim());
                            updateHighlightArr($v("P25_CONDITION_NAME"), "N");
                            apex.region("condition_rgn").refresh();
                        },
                    });
                }
            }
        }
    } catch (err) {
        error_handling(err);
    }
}
function addConditionToHighPref() {
    try {
        $s("P25_STATUS", "Y");
        var checkConditions = false;
        for (n = 0; n < g_highlightArr.length; n++) {
            if (g_highlightArr[n].CHECK == "N") {
                checkConditions = true;
                break;
            }
        }
        if (checkConditions && $v("P25_HIGHLIGHT_PREFERENCE") !== "") {
            confirm(
                get_message("POGCR_ADD_SELECT_HIGHLIGHT_PREFERENCE"),
                get_message("SHCT_YES"),
                get_message("SHCT_NO"),
                function () {
                    apex.server.process(
                        "MODIFY_HIGHLIGHT_PREFERENCE", {
                        x01: $v("P25_HIGHLIGHT_PREFERENCE"),
                        x02: "Y",
                        x09: "S",
                    }, {
                        dataType: "text",
                        success: function (pData) {
                            if ($.trim(pData) != "") {
                                alert(get_message("POGC_DUPLICATE_CONDITION"));
                                $s("P25_HIGHLIGHT_PREFERENCE", "");
                            } else {
                                apex.region("condition_rgn").refresh();
                                if ($v("P25_HIGHLIGHT_PREFERENCE") == "") {
                                    $s("P25_CONDITION_NAME", "");
                                    $s("P25_VALUE", "");
                                    $s("P25_BACKGROUND_COLOR", "");
                                    $s("P25_PRIORITY", "");
                                    $s("P25_FORMULA", "");
                                    $s("P25_FORMULA_CODE", "");
                                }
                            }
                        },
                    });
                },
                function () {
                    apex.server.process(
                        "MODIFY_HIGHLIGHT_PREFERENCE", {
                        x01: $v("P25_HIGHLIGHT_PREFERENCE"),
                        x02: "N",
                        x09: "S",
                    }, {
                        dataType: "text",
                        success: function (pData) {
                            if ($.trim(pData) != "") {
                                alert(get_message("POGC_DUPLICATE_CONDITION"));
                            } else {
                                apex.region("condition_rgn").refresh();
                                if ($v("P25_HIGHLIGHT_PREFERENCE") == "") {
                                    $s("P25_STATUS", "N");
                                    $s("P25_CONDITION_NAME", "");
                                    $s("P25_VALUE", "");
                                    $s("P25_BACKGROUND_COLOR", "");
                                    $s("P25_PRIORITY", "");
                                    $s("P25_FORMULA", "");
                                    $s("P25_FORMULA_CODE", "");
                                }
                            }
                        },
                    });
                });
        } else {
            apex.server.process(
                "MODIFY_HIGHLIGHT_PREFERENCE", {
                x01: $v("P25_HIGHLIGHT_PREFERENCE"),
                x02: "N",
                x09: "S",
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        alert(get_message("POGC_DUPLICATE_CONDITION"));
                    } else {
                        apex.region("condition_rgn").refresh();
                        if ($v("P25_HIGHLIGHT_PREFERENCE") == "") {
                            $s("P25_STATUS", "N");
                            $s("P25_CONDITION_NAME", "");
                            $s("P25_VALUE", "");
                            $s("P25_BACKGROUND_COLOR", "");
                            $s("P25_PRIORITY", "");
                            $s("P25_FORMULA", "");
                            $s("P25_FORMULA_CODE", "");
                        }
                    }
                },
            });
        }
        g_highlightArr = [];
    } catch (err) {
        error_handling(err);
    }
}
function delete_preference_select() {
    try {
        // var valid = highlight_validation();
        // if (valid) {
        if ($v("P25_HIGHLIGHT_PREFERENCE") != "") {
            confirm(
                get_message("POGCR_DEL_SEL_HGLT_PREF"),
                get_message("SHCT_YES"),
                get_message("SHCT_NO"),
                function () {
                    apex.server.process(
                        "MODIFY_HIGHLIGHT_PREFERENCE", {
                        x01: parseInt($v("P25_SEQ_ID")),
                        x02: $v("P25_HIGHLIGHT_PREFERENCE"),
                        x03: $v("P25_CONDITION_NAME"),
                        x08: "F",
                        x09: "D",
                    }, {
                        dataType: "text",
                        success: function (pData) {
                            if ($.trim(pData) != "") {
                                raise_error(pData);
                            } else {
                                g_highlightArr = g_highlightArr.filter(function (el) {
                                    return el.CONDITION_NAME !== $v("P25_CONDITION_NAME");
                                });
                                apex.region("condition_rgn").refresh();
                            }
                        },
                    });
                },
                function () {
                    apex.server.process(
                        "MODIFY_HIGHLIGHT_PREFERENCE", {
                        x01: parseInt($v("P25_SEQ_ID")),
                        x02: $v("P25_HIGHLIGHT_PREFERENCE"),
                        x03: $v("P25_CONDITION_NAME"),
                        x08: "",
                        x09: "D",
                    }, {
                        dataType: "text",
                        success: function (pData) {
                            if ($.trim(pData) != "") {
                                raise_error(pData);
                            } else {
                                g_highlightArr = g_highlightArr.filter(function (el) {
                                    return el.CONDITION_NAME !== $v("P25_CONDITION_NAME");
                                });
                                apex.region("condition_rgn").refresh();
                            }
                        },
                    });
                });
        } else {
            g_highlightArr = g_highlightArr.filter(function (el) {
                return el.CONDITION_NAME !== $v("P25_CONDITION_NAME");
            });
            apex.server.process(
                "MODIFY_HIGHLIGHT_PREFERENCE", {
                x01: parseInt($v("P25_SEQ_ID")),
                x02: $v("P25_HIGHLIGHT_PREFERENCE"),
                x03: $v("P25_CONDITION_NAME"),
                x09: "D",
            }, {
                dataType: "text",
                success: function (pData) {
                    if ($.trim(pData) != "") {
                        raise_error(pData);
                    } else {
                        g_highlightArr = g_highlightArr.filter(function (el) {
                            return el.CONDITION_NAME !== $v("P25_CONDITION_NAME");
                        });
                        apex.region("condition_rgn").refresh();
                    }
                },
            });
        }
        // }
    } catch (err) {
        error_handling(err);
    }
}
function update_highlight_preference() {
    try {
        var valid = highlight_validation("Y");
        if (valid) {
            if ($v("P25_STATUS") === "Y") {
                confirm(
                    get_message("POGCR_UPD_SEL_HGLT_PREF"),
                    get_message("SHCT_YES"),
                    get_message("SHCT_NO"),
                    function () {
                        apex.server.process(
                            "MODIFY_HIGHLIGHT_PREFERENCE", {
                            x01: $v("P25_HIGHLIGHT_PREFERENCE"),
                            x02: $v("P25_CONDITION_NAME"),
                            x03: $v("P25_PRIORITY"),
                            x04: $v("P25_VALUE"),
                            x05: $v("P25_BACKGROUND_COLOR"),
                            x06: $v("P25_OPERATOR"),
                            x07: $v("P25_CONDITION"),
                            x08: "H",
                            x09: "G",
                            x10: parseInt($v("P25_SEQ_ID")),
                        }, {
                            dataType: "text",
                            success: function (pData) {
                                $s("P25_HIDDEN_OPERATOR", "");
                                updateHighlightArr($v("P25_CONDITION_NAME"), "N");
                                if ($v("P25_VALIDATION_CHECK") != "N") {
                                    apex.region("condition_rgn").refresh();
                                }
                            },
                        });
                    },
                    function () {
                        apex.server.process(
                            "MODIFY_HIGHLIGHT_PREFERENCE", {
                            x01: $v("P25_HIGHLIGHT_PREFERENCE"),
                            x02: $v("P25_CONDITION_NAME"),
                            x03: $v("P25_PRIORITY"),
                            x04: $v("P25_VALUE"),
                            x05: $v("P25_BACKGROUND_COLOR"),
                            x06: $v("P25_OPERATOR"),
                            x07: $v("P25_CONDITION"),
                            x08: "",
                            x09: "G",
                            x10: parseInt($v("P25_SEQ_ID")),
                        }, {
                            dataType: "text",
                            success: function (pData) {
                                $s("P25_HIDDEN_OPERATOR", "");
                                updateHighlightArr($v("P25_CONDITION_NAME"), "N");
                                if ($v("P25_VALIDATION_CHECK") != "N") {
                                    apex.region("condition_rgn").refresh();
                                }
                            },
                        });
                    });
            } else {
                apex.server.process(
                    "MODIFY_HIGHLIGHT_PREFERENCE", {
                    x01: $v("P25_HIGHLIGHT_PREFERENCE"),
                    x02: $v("P25_CONDITION_NAME"),
                    x03: $v("P25_PRIORITY"),
                    x04: $v("P25_VALUE"),
                    x05: $v("P25_BACKGROUND_COLOR"),
                    x06: $v("P25_OPERATOR"),
                    x07: $v("P25_CONDITION"),
                    x08: "",
                    x09: "G",
                    x10: parseInt($v("P25_SEQ_ID")),
                }, {
                    dataType: "text",
                    success: function (pData) {
                        $s("P25_HIDDEN_OPERATOR", "");
                        updateHighlightArr($v("P25_CONDITION_NAME"), "N");
                        if ($v("P25_VALIDATION_CHECK") != "N") {
                            apex.region("condition_rgn").refresh();
                        }
                    },
                });
            }
        }
    } catch (err) {
        error_handling(err);
    }
}

async function get_swap_rec(p_swap_action) {
    var gridView = apex.region("swap_grid").widget().interactiveGrid("getViews", "grid").model;
    var records = gridView.getSelectedRecords();
    var swap_module_arr = [];
    var module_nam_arr = [];
    var combine_module = [];
    var specialSwapMod = $v("P25_POGCR_SPECIAL_SWAP_MOD");
    var check_duplicate = "";
    if (records.length > 0) {
        if (p_swap_action == "C") {
            //ASA-1487 S
            check_duplicate = check_dup_seq_swap();
            if (check_duplicate !== "Y") {
                gridView.forEach(function (igrow) {
                    if (igrow[gridView.getFieldKey("SEQ_NO")] != "") {
                        var details = {};
                        details["MainMod"] = igrow[gridView.getFieldKey("MODULE_NAME")];
                        details["ChngSeq"] = igrow[gridView.getFieldKey("SEQ_NO")];
                        swap_module_arr.push(igrow[gridView.getFieldKey("SEQ_NO")]);
                        module_nam_arr.push(igrow[gridView.getFieldKey("MODULE_NAME")]);
                        combine_module.push(details);
                    }
                });
                if (g_pog_json[g_pog_index].GenrateCombineS.length > 0) {
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
                    // ax_message.confirm(get_message("POGCR_CHNG_SEQ_COMBINE_MSG"), function (e) {
                    //     if (e) {
                    //         addLoadingIndicator();
                    //         changeModuleSeq(combine_module, g_pog_index);
                    //         removeLoadingIndicator(regionloadWait);

                    //     }
                    // });
                    confirm(get_message("POGCR_CHNG_SEQ_COMBINE_MSG"), get_message("SHCT_YES"), get_message("SHCT_NO"), function () {
                        addLoadingIndicator();
                        changeModuleSeq(combine_module, g_pog_index);
                        removeLoadingIndicator(regionloadWait);
                    });
                    //Task_29818 - End
                } else {
                    addLoadingIndicator();
                    changeModuleSeq(combine_module, g_pog_index);
                    removeLoadingIndicator(regionloadWait);
                }
                closeInlineDialog("module_Swap");
            }
        } else {
            gridView.forEach(function (igrow) {
                if (igrow[gridView.getFieldKey("SWAP_MODULE")].v != "") {
                    var details = {};
                    details["MainMod"] = igrow[gridView.getFieldKey("MODULE_NAME")];
                    details["SwapMod"] = igrow[gridView.getFieldKey("SWAP_MODULE")].v;
                    swap_module_arr.push(igrow[gridView.getFieldKey("SWAP_MODULE")].v);
                    module_nam_arr.push(igrow[gridView.getFieldKey("MODULE_NAME")]);
                    combine_module.push(details);
                }
            });
            await Show_swap_module(module_nam_arr, swap_module_arr, combine_module, specialSwapMod, g_pog_index);
        } //ASA-1487 E
    }
}
function check_dup_seq_swap() {
    //ASA-1487
    var gridView = apex.region("swap_grid").widget().interactiveGrid("getViews", "grid").model;
    var records = gridView.getSelectedRecords();
    // Objects to track seen SEQ_NO values and duplicates
    var seenSeqNos = new Set();
    var check_duplicate = "N";

    gridView.forEach(function (igrow, index, id) {
        var seqNo = igrow[gridView.getFieldKey("SEQ_NO")];
        var moduleName = igrow[gridView.getFieldKey("MODULE_NAME")];
        // Check for null SEQ_NO
        if (seqNo == "") {
            add_error(gridView, "swap_grid", moduleName, moduleName, "SEQ_NO", "SEQ_NO", get_message("POGCR_DUPLICATE_SEQ_NO"), []);
            //gridView.setValidity('error', moduleName, 'SEQ_NO', get_message('POGCR_DUPLICATE_SEQ_NO'));
            check_duplicate = "Y";
        } else if (seenSeqNos.has(seqNo)) {
            //ASA 1487 issue 6a & 6b
            add_error(gridView, "swap_grid", moduleName, moduleName, "SEQ_NO", "SEQ_NO", get_message("POGCR_DUPLICATE_SEQ_NO"), []);
            // gridView.setValidity('error', moduleName, 'SEQ_NO', get_message('POGCR_DUPLICATE_SEQ_NO'));
            check_duplicate = "Y";
        } else {
            gridView.setValidity("valid", moduleName, "SEQ_NO");
            seenSeqNos.add(seqNo);
        }
    });
    return check_duplicate;
} //ASA-1487

//ASA-1471 issue 14 S
function checkValueConsistency(pArray, pKey, pValue, p_obj_type) {
    //20240806
    try {
        if (pArray.length === 0)
            return false;

        if (p_obj_type === "S") {
            const shelfArray = pArray.filter((item) => item.Object === "SHELF");

            const firstValue = nvl(shelfArray[0][pKey]);
            const standardizedFirstValue = isNaN(firstValue) ? firstValue.toUpperCase() : firstValue;

            for (const item of shelfArray) {
                if (item.Item !== "DIVIDER" && item.Object === "SHELF") {
                    const itemValue = nvl(item[pKey]);
                    const standardizedItemValue = isNaN(itemValue) ? itemValue.toUpperCase() : itemValue;
                    if (!(standardizedFirstValue === standardizedItemValue && ((standardizedItemValue === pValue && nvl(pValue) !== 0) || nvl(pValue) === 0))) {
                        return false;
                    }
                }
            }
        } else if (p_obj_type === "I") {
            const itemArray = pArray.filter((item) => item.Object === "ITEM");

            var firstValue;
            if (itemArray.length > 1) {
                firstValue = nvl(itemArray[0].ItemObj[0][pKey]);
            } else {
                firstValue = nvl(itemArray[0][pKey]);
                firstValue = nvl(g_pog_json[g_pog_index].ModuleInfo[itemArray[0].MIndex].ShelfInfo[itemArray[0].SIndex].ItemInfo[itemArray[0].IIndex][pKey]);
            }
            const standardizedFirstValue = isNaN(firstValue) ? firstValue.toUpperCase() : firstValue;

            for (const item of itemArray) {
                if (item.Item !== "DIVIDER" && item.Object === "ITEM") {
                    var itemValue;
                    if (itemArray.length > 1) {
                        itemValue = nvl(item.ItemObj[0][pKey]);
                    } else {
                        itemValue = nvl(g_pog_json[g_pog_index].ModuleInfo[item.MIndex].ShelfInfo[item.SIndex].ItemInfo[item.IIndex][pKey]);
                    }
                    const standardizedItemValue = isNaN(itemValue) ? itemValue.toUpperCase() : itemValue;
                    if (!(standardizedFirstValue === standardizedItemValue && ((standardizedItemValue === pValue && nvl(pValue) !== 0) || nvl(pValue) === 0))) {
                        return false;
                    }
                }
            }
        }

        return true;
    } catch (err) {
        error_handling(err);
        return false; // Ensure the function always returns a boolean value
    }
}

function setIconForInconsistentTag(pArray, p_json_tag, p_page_item, p_obj_type, p_null_value = "") {
    try {
        if (!checkValueConsistency(pArray, p_json_tag, p_null_value, p_obj_type)) {
            if (p_page_item != "P25_BOLD" && p_page_item != "P25_TEXT") {
                //ASA-1669
                $("#" + p_page_item + "_CONTAINER").addClass("apex-item-wrapper--has-icon");
                $("#" + p_page_item).addClass("apex-item-has-icon");
            }
            $("#" + p_page_item).after('<span class="inc_tag_icon apex-item-icon fa fa-exclamation-triangle-o" aria-hidden="true"></span>'); //ASA-1669
            // $('.apex-item-color-picker-preview').hide();//ASA-1471 issue 14
            $s(p_page_item, p_null_value);
        } else {
            let firstValue = p_null_value;

            if (p_obj_type === "S") {
                const shelfArray = pArray.filter((item) => item.Object === "SHELF");
                if (shelfArray.length > 0) {
                    firstValue = shelfArray[0][p_json_tag];
                }
            } else if (p_obj_type === "I") {
                const itemArray = pArray.filter((item) => item.Object === "ITEM");
                if (itemArray.length > 1) {
                    firstValue = itemArray[0].ItemObj[0][p_json_tag];
                } else {
                    firstValue = g_pog_json[g_pog_index].ModuleInfo[itemArray[0].MIndex].ShelfInfo[itemArray[0].SIndex].ItemInfo[itemArray[0].IIndex][p_json_tag];
                }
            }

            $("#" + p_page_item + "_CONTAINER .inc_tag_icon").remove(); //ASA-1669
            $("#" + p_page_item).removeClass("apex-item-has-icon");
            $("#" + p_page_item + "_CONTAINER").removeClass("apex-item-wrapper--has-icon");
            if (typeof firstValue !== "undefined") {
                if (p_page_item == "P25_TEXT_WIDTH" || p_page_item == "P25_TEXT_HEIGHT") {
                    firstValue = (firstValue * 100).toFixed(2);
                } //ASA-1669
                $s(p_page_item, firstValue);
            } else {
                $s(p_page_item, p_null_value);
            }
        }
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1471 issue 14 E

//ASA-1487
async function changeModuleSeq(p_combine_module, p_pog_index) {
    try {
        var outside_obj = [];
        if (p_combine_module.length > 0) {
            p_combine_module.sort(function (a, b) {
                return parseInt(a.ChngSeq) - parseInt(b.ChngSeq);
            });

            p_combine_module.forEach((item, index) => {
                item.ChngSeq = (index + 1).toString();
            });
            var new_json = JSON.parse(JSON.stringify(g_pog_json[p_pog_index]));
            var i = 0;
            for (var obj of p_combine_module) {
                for (var modules of new_json.ModuleInfo) {
                    //ASA-1487 issue 7 S
                    //     if (typeof modules.ParentModule == "undefined" || modules.ParentModule == "" || modules.ParentModule == null) {
                    if (modules.Module == obj.MainMod || modules.ParentModule == obj.MainMod) {
                        modules.Oldseq = parseInt(modules.SeqNo);
                        modules.SeqNo = parseInt(obj.ChngSeq);
                    }
                    j++;
                    // }
                    //ASA-1487 issue 7 E
                }
                i++;
            }

            // Removing Combination
            if (g_pog_json[p_pog_index].GenrateCombineS.length > 0) {
                var i = 0;
                for (var modules of new_json.ModuleInfo) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var j = 0;
                        for (var shelf of modules.ShelfInfo) {
                            if ((shelf.ObjType == "SHELF" || shelf.ObjType == "HANGINGBAR") && shelf.Combine !== "N") {
                                shelf.Combine = "N";
                                g_pog_json[p_pog_index].ModuleInfo[i].ShelfInfo[j].Combine = "N";
                                await generateCombinedShelfs(p_pog_index, i, j, $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), "Y", "", "Y");
                            }
                            j++;
                        }
                    }
                    i++;
                }
            }
            new_json.GenrateCombineS = [];

            new_json.ModuleInfo.sort(function (a, b) {
                return parseInt(a.SeqNo) - parseInt(b.SeqNo);
            });

            var l_module = 0;
            for (var modules of new_json.ModuleInfo) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    var module_top = wpdSetFixed(modules.Y + modules.H / 2);
                    var module_bottom = wpdSetFixed(modules.Y - modules.H / 2);
                    var l_shelf = 0;
                    for (var shelf of modules.ShelfInfo) {
                        if (shelf.ObjType !== "BASE" && shelf.ObjType !== "NOTCH" && shelf.ObjType !== "DIVIDER") {
                            var shelf_top = wpdSetFixed(shelf.Y + shelf.H / 2);
                            var shelf_bottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                            var shelf_start = wpdSetFixed(shelf.X - shelf.W / 2);
                            var shelf_end = wpdSetFixed(shelf.X + shelf.W / 2);
                            if (shelf.ObjType == "TEXTBOX") {
                                var module_start = wpdSetFixed(modules.X - modules.W / 2 - g_textbox_threshold_value);
                                var module_end = wpdSetFixed(modules.X + modules.W / 2 + g_textbox_threshold_value);
                            } else if (shelf.ObjType == "CHEST") {
                                var module_start = wpdSetFixed(modules.X - modules.W / 2);
                                var module_end = wpdSetFixed(modules.X + modules.W / 2);
                            }
                            if ((shelf_top > module_top || shelf_bottom < module_bottom) && (shelf_end > module_end || shelf_start < module_start)) {
                                shelf.MIndex = l_module;
                                shelf.SIndex = l_shelf;
                                shelf.SeqChange = "Y";
                                modules.ShelfInfo.splice(l_shelf, 1);
                                outside_obj.push(shelf);
                            }
                        }
                        l_shelf++;
                    }
                }
                l_module++;
            }
        }

        // var l_obj = 0;
        // for (var obj of outside_obj) {
        //     var l_mdl = 0;
        //     var obj_start = wpdSetFixed(obj.X - obj.W / 2);
        //     var obj_end = wpdSetFixed(obj.X + obj.W / 2);
        //     for (var modules of new_json.ModuleInfo) {
        //         if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
        //             if (obj.ObjType !== "TEXTBOX") {
        //                 var module_start = wpdSetFixed(modules.X - modules.W / 2);
        //                 var module_end = wpdSetFixed(modules.X + modules.W / 2);
        //             } else {
        //                 var module_start = wpdSetFixed(modules.X - modules.W / 2 - g_textbox_threshold_value);
        //                 var module_end = wpdSetFixed(modules.X + modules.W / 2 + g_textbox_threshold_value);
        //             }

        //             if (((obj_start <= module_start && obj_end > module_end) || (obj_start < module_start && obj_end < module_start) || (obj_start < module_start && obj_end < module_end) || (obj_start > module_start && obj_end > module_end)) && l_mdl == obj.MIndex) {
        //                 modules.ShelfInfo.splice(obj.SIndex, 1);
        //                 //g_pog_json[p_pog_index].ModuleInfo[obj.MIndex].ShelfInfo.splice(obj.SIndex, 1);
        //                 obj.Remove = "Y";
        //                 break;

        //             }
        //         }

        //         l_mdl++;
        //     }
        //     l_obj++;

        // }

        var m = 0;
        var currentEndX = 0; // Initialize the starting position
        for (var obj of outside_obj) {
            var n = 0;
            var obj_start = wpdSetFixed(obj.X - obj.W / 2);
            var inserted = false;
            for (var modules of new_json.ModuleInfo) {
                var moduleStartX = currentEndX;
                var moduleEndX = moduleStartX + modules.W;
                if (typeof modules.ParentModule === "undefined" || modules.ParentModule === null) {
                    if (obj.X > moduleStartX && obj.X < moduleEndX && obj.ObjType !== "CHEST") {
                        new_json.ModuleInfo[n].ShelfInfo.push(obj); //ASA-1487 issue 9
                        inserted = true;
                        for (var textmodules of new_json.ModuleInfo) {
                            //ASA 1487 issue 9 S
                            if (typeof textmodules.ParentModule !== "undefined" || textmodules.ParentModule !== null) {
                                if (textmodules.ShelfInfo[0].SObjID == obj.SObjID) {
                                    textmodules.ParentModule = modules.Module;
                                    break;
                                }
                            }
                        } //ASA 1487 issue 9 E
                        break;
                    } else if (obj_start >= moduleStartX && moduleEndX > obj_start && obj.ObjType == "CHEST") {
                        new_json.ModuleInfo[n].ShelfInfo.push(obj); //ASA-1487 issue 9
                        inserted = true;
                        break;
                    }
                }
                currentEndX = moduleEndX;

                n++;
            }
            if (!inserted) {
                var minSeqnoModule = new_json.ModuleInfo.filter((module) => (module.SeqNo == 1 && typeof module.ParentModule == "undefined") || module.ParentModule == null);
                minSeqnoModule[0].ShelfInfo.push(obj);
            }
            m++;
        }
        //ASA-1487 issue 11
        var l_mdl = 0;
        for (var modules of new_json.ModuleInfo) {
            if (typeof modules.ParentModule === "undefined" || modules.ParentModule === null) {
                var l_shelf = 0;
                var div_obj = [];
                for (var shelfs of modules.ShelfInfo) {
                    var pattern = new RegExp("[" + modules.Oldseq + "]/"); //ASA  1487 issue 13
                    var new_shelf = "";
                    var new_shelf = shelfs.Shelf.replace(pattern, modules.SeqNo + "/"); // //ASA  1487 issue 13
                    if (shelfs.ObjType == "DIVIDER") {
                        shelfs.OldDividerid = shelfs.Shelf;
                    }
                    shelfs.Shelf = new_shelf;
                    var i = 0;
                    for (var items of shelfs.ItemInfo) {
                        if (items.Item == "DIVIDER") {
                            items.MIndex = l_mdl;
                            items.SIndex = l_shelf;
                            items.IIndex = i;
                            div_obj.push(items);
                        }
                        i++;
                    }

                    l_shelf++;
                }
                if (div_obj.length > 0) {
                    for (var div of div_obj) {
                        for (var shelf of modules.ShelfInfo) {
                            if (shelf.ObjType == "DIVIDER" && div.ItemID == shelf.OldDividerid) {
                                new_json.ModuleInfo[div.MIndex].ShelfInfo[div.SIndex].ItemInfo[div.IIndex].ItemID = shelf.Shelf;
                            }
                        }
                    }
                }
            }
            l_mdl++;
        }
        //ASA-1487 issue 11 E
        g_pog_json[p_pog_index] = JSON.parse(JSON.stringify(new_json));
        g_json = [g_pog_json[p_pog_index]]; //ASA-1487 issue 1
        var res = await context_create_module("", g_camera, "Y", p_pog_index, "Y");
        var res = await enableDisableFlags(p_pog_index);
        await update_pog_json(p_pog_index);
        // Shobhit : For future reference if need to keep combinations after changing module seq
        /*
        for (let k = 0; k < g_combinedShelfs.length; k++) {
        if (g_combinedShelfs[k][0]['PIndex'] == p_pog_index) {
        g_combinedShelfs.splice(k, 1);
        k--; // Adjust index after splice
        }
        }

        var l = 0;
        for (var modules of g_pog_json[p_pog_index].ModuleInfo) {
        var j = 0;
        for (var shelf of modules.ShelfInfo) {
        if ((shelf.ObjType == "SHELF" || shelf.ObjType == "HANGINGBAR") && shelf.Combine !== "N") {

        await generateCombinedShelfs(
        p_pog_index,
        l,
        j,
        $v("P25_POGCR_DELIST_ITEM_DFT_COL"),
        $v("P25_MERCH_STYLE"),
        $v("P25_POGCR_LOAD_IMG_FROM"),
        $v("P25_BU_ID"),
        $v("P25_POGCR_ITEM_NUM_LBL_COLOR"),
        $v("P25_POGCR_ITEM_NUM_LABEL_POS"),
        $v("P25_POGCR_DISPLAY_ITEM_INFO"),
        'Y', "", "Y"
        ); // Call function for combined shelves
        }
        j++
        }
        l++;
        }*/
        // }
    } catch (err) {
        error_handling(err);
    }
}

function open_aditional_pog() {
    try {
        g_open_from = "A";
        apex.item("P25_POG_OPEN_LIST").setValue(g_pog_json.map((pog) => pog.POGCode).join("$$$"));
        var url = "";
        apex.server.process(
            "GET_POG_URL", {
            pageItems: "#P25_POG_OPEN_LIST",
            x01: g_type_pog,
        }, {
            dataType: "text",
            success: function (pData) {
                if ($.trim(pData) != "") {
                    url = pData;
                    if (g_type_pog == "D") {
                        openCustomDialog("OPEN_DRAFT", url, "P25_DRAFT_TRIGGER_ELEMENT");
                    } else {
                        openCustomDialog("OPEN_EXITPOG", url, "P25_EXISTPOG_TRIGGER_ELEMENT");
                    }
                }
            },
        });
    } catch (err) {
        error_handling(err);
    }
}

// ASA-1587, pAddAndRemovePogs this variable will control the feature to generate a hidden POG
async function add_addition_pog(p_pog_list_arr, p_imageLoadInd, pAddAndRemovePogs = false, pResetParam = "Y") {
    // ASA-1655 Added new param pResetParam to not reset flags when called from PLANO GRAPH
    try {
        return new Promise((resolve) => {
            if (!pAddAndRemovePogs) {
                addLoadingIndicator();
            }

            g_open_pog_flag = "Y";
            var pog_code_list = [],
                pog_version_list = [],
                real_pog_list = [];
            var is_real_pog = "Y";
            var selectedIds = "";
            var maxSceneObj,
                maxPogjson;
            var k = 0;
            if (p_pog_list_arr.length > 15) {
                alert(get_message("POGCR_MAX_TAB_MESS", "15"));
            } else {
                if (!pAddAndRemovePogs) {
                    $("#pog_list_btn").css("display", "block");
                    $("#chng_view_btn").css("display", "block");
                    switchCanvasView($v("P25_POGCR_TILE_VIEW"));
                    appendMultiCanvasRowCol(1, $v("P25_POGCR_TILE_VIEW"));
                }
                if (g_type_pog == "E") {
                    var k = 0;
                    for (const pog of g_pog_json) {
                        selectedIds += pog.POGCode + ":";
                        k++;
                    }

                    for (const pog_details of p_pog_list_arr) {
                        pog_code_list.push(pog_details.POGCode);
                        pog_version_list.push(pog_details.POGVersion);
                        real_pog_list.push(pog_details.IsRealPOG);
                    }

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
                                    alert(get_message("POGCR_MAX_MOD_ERR", $v("P25_POGCR_MAX_MOD_OPEN")));
                                } else {
                                    if (!pAddAndRemovePogs) {
                                        for (const r of real_pog_list) {
                                            if (r == "N") {
                                                is_real_pog == "N";
                                            }
                                        }
                                        sessionStorage.setItem("pog_code_list", JSON.stringify(pog_code_list));
                                        $s("P25_OPEN_POG", "Y");
                                        i = 0;
                                        var rec_detail = [];
                                        for (const r of pog_code_list) {
                                            selectedIds += pog_code_list[i] + ":";
                                            i++;
                                        }
                                        $s("P25_SELECTED_RECORDS", selectedIds);
                                        appendMultiCanvasRowCol(g_pog_json.length + pog_code_list.length, $v("P25_POGCR_TILE_VIEW"));
                                        switchCanvasView($v("P25_POGCR_TILE_VIEW"), "Y");
                                        modifyWindowAfterMinMax(g_scene_objects);
                                        add_pog_code_header();

                                        var j = 0;
                                        for (const r of pog_code_list) {
                                            g_pog_index = g_pog_json.length;
                                            g_seqArrDtl = {};
                                            g_seqArrDtl["seqId"] = "";
                                            g_seqArrDtl["index"] = g_pog_index;
                                            g_seqArrDtl["pogCode"] = r;
                                            g_seqArrDtl["pogVersion"] = pog_version_list[j];
                                            g_seqArrDtl["pogType"] = "E";
                                            g_seqArr.push(g_seqArrDtl);
                                            var return_val = await get_existing_pog(r, pog_version_list[j], g_pog_index, "Y", p_imageLoadInd);
                                            render(g_pog_index);
                                            var canvas_id = g_canvas_objects[g_pog_index].getAttribute("id");
                                            $("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + r + "</span>");
                                            if (j == pog_code_list.length - 1) {
                                                removeLoadingIndicator(regionloadWait);
                                            }
                                            j++;
                                        }
                                        g_pog_json = g_multi_pog_json;
                                        generateMultiPogDropdown();
                                        reset_canvas_region();
                                        if (p_imageLoadInd == "Y") {
                                            addLoadingIndicator();
                                            var retval = await get_all_images(0, g_get_orient_images, "Y", $v("P25_POGCR_IMG_MAX_WIDTH"), $v("P25_POGCR_IMG_MAX_HEIGHT"), $v("P25_IMAGE_COMPRESS_RATIO"));
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
                                                    addLoadingIndicator();
                                                    var return_val = await recreate_image_items("Y", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
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
                                    } else {
                                        var canvasName = "maincanvas2";
                                        g_canvas = document.getElementById(canvasName);
                                        g_canvas_objects.push(g_canvas);
                                        createWorld();
                                        g_tanFOV = Math.tan(((Math.PI / 180) * g_camera.fov) / 2);
                                        var canvasContainerH = $("#" + canvasName).parent()[0].offsetHeight;
                                        var canvasContainerW = $("#" + canvasName).parent()[0].offsetWidth;

                                        $("#" + canvasName)
                                            .css("height", canvasContainerH + "px !important")
                                            .css("width", canvasContainerW + "px !important");

                                        g_canvas.width = canvasContainerW;
                                        g_canvas.height = canvasContainerH;
                                        g_camera.aspect = canvasContainerW / canvasContainerH;

                                        g_camera.fov = (360 / Math.PI) * Math.atan(g_tanFOV);
                                        g_camera.updateProjectionMatrix();
                                        g_renderer.setSize(canvasContainerW, canvasContainerH);
                                        objects = {};
                                        objects["scene"] = g_scene;
                                        objects["renderer"] = g_renderer;
                                        g_scene_objects.push(objects);
                                        set_indicator_objects(g_scene_objects.length - 1);

                                        g_pog_index = g_pog_json.length;
                                        var returnval = await getJson("N", p_pog_list_arr[0].POGCode, p_pog_list_arr[0].POGVersion, "Y", "Y", g_camera, g_scene, 2, p_imageLoadInd, pResetParam); // ASA-1655 Added new param p_resetParam to not reset flags when called from PLANO GRAPH
                                        render(g_pog_index);

                                        g_pog_json = g_multi_pog_json;
                                        // if (p_imageLoadInd == "Y") {
                                        //     var retval = await get_all_images(g_pog_json.length - 1, g_get_orient_images, "Y", $v("P25_POGCR_IMG_MAX_WIDTH"), $v("P25_POGCR_IMG_MAX_HEIGHT"), $v("P25_IMAGE_COMPRESS_RATIO"));
                                        // }
                                        // if (g_ItemImages.length > 0 && g_show_live_image == "Y" && p_imageLoadInd == "Y") {
                                        //     var pogIndx = 0;
                                        //     for (const pogs of g_pog_json) {
                                        //         try {
                                        //             g_renderer = g_scene_objects[g_pog_json.length - 1].renderer;
                                        //             g_scene = g_scene_objects[g_pog_json.length - 1].scene;
                                        //             g_camera = g_scene_objects[g_pog_json.length - 1].scene.children[0];
                                        //             g_world = g_scene_objects[g_pog_json.length - 1].scene.children[2];
                                        //             var return_val = await recreate_image_items("Y", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), g_pog_json.length - 1, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label);
                                        //             render(pogIndx);
                                        //         } catch (err) {
                                        //             error_handling(err);
                                        //         }
                                        //         pogIndx++;
                                        //     }
                                        //     g_imagesShown = "Y";
                                        //     animate_all_pog();
                                        // }
                                        resolve("SUCCESS");
                                    }
                                }
                            },
                            loadingIndicatorPosition: "page",
                        });
                    }
                } else {
                    var rec_detail = [];
                    var records = p_pog_list_arr;
                    for (const l_rec of records) {
                        rec_detail.push(parseInt(l_rec.SequenceID));
                    }
                    var result = records.map(function (a) {
                        return Object.values(a)[0];
                    });
                    var seq_list = result.join(":");

                    apex.server.process(
                        "CHECK_MOD_COUNT", {
                        x01: "D",
                        x02: seq_list,
                    }, {
                        dataType: "text",
                        success: async function (pData) {
                            if ($.trim(pData) != "") {
                                alert(get_message("POGCR_MAX_MOD_ERR", $v("P25_POGCR_MAX_MOD_OPEN")));
                            } else {
                                if (rec_detail.length > 1) {
                                    var pog_sequence_id = records[0].SequenceID;
                                    var desc = records[0].DescriptionDetails;
                                    $s("P25_DRAFT_LIST", pog_sequence_id);
                                    $s("P25_POG_DESCRIPTION", desc);
                                    var draftVer = records[0].DraftVersion;
                                    $s("P25_EXISTING_DRAFT_VER", draftVer);
                                    sessionStorage.setItem("P25_EXISTING_DRAFT_VER", draftVer);
                                }
                                appendMultiCanvasRowCol(g_pog_json.length + p_pog_list_arr.length, $v("P25_POGCR_TILE_VIEW"));
                                switchCanvasView($v("P25_POGCR_TILE_VIEW"), "Y");
                                modifyWindowAfterMinMax(g_scene_objects);
                                add_pog_code_header();
                                for (var i = 0; i <= records.length - 1; i++) {
                                    g_pog_index = g_pog_json.length;
                                    init(g_pog_index);
                                    objects = {};
                                    objects["scene"] = g_scene;
                                    objects["renderer"] = g_renderer;
                                    g_scene_objects.push(objects);
                                    g_seqArrDtl = {};
                                    g_seqArrDtl["seqId"] = records[i];
                                    g_seqArrDtl["index"] = g_pog_index;
                                    g_seqArrDtl["pogCode"] = "";
                                    g_seqArrDtl["pogVersion"] = "";
                                    g_seqArrDtl["pogType"] = "D";
                                    g_seqArr.push(g_seqArrDtl);
                                    set_indicator_objects(g_scene_objects.length - 1);
                                    var returnval = await getJson("Y", "", records[i].SequenceID, "Y", "Y", g_camera, g_scene, g_pog_index, p_imageLoadInd);
                                    render(g_pog_index);
                                    var canvas_id = g_canvas_objects[g_pog_index].getAttribute("id");
                                    $("#" + canvas_id + "-btns").append('<span id="block_title" style="float:left">' + g_pog_json[g_pog_index].POGCode + "</span>");
                                    if (i == records.length - 1) {
                                        removeLoadingIndicator(regionloadWait);
                                    }
                                }
                                generateMultiPogDropdown();
                                reset_canvas_region();
                                if (p_imageLoadInd == "Y") {
                                    addLoadingIndicator();
                                    var retval = await get_all_images(0, g_get_orient_images, "Y", $v("P25_POGCR_IMG_MAX_WIDTH"), $v("P25_POGCR_IMG_MAX_HEIGHT"), $v("P25_IMAGE_COMPRESS_RATIO"));
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
                                            addLoadingIndicator();
                                            var return_val = await recreate_image_items("Y", $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), pogIndx, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
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
                            }
                        },
                        loadingIndicatorPosition: "page",
                    });
                }
            }
        });
    } catch (err) {
        error_handling(err);
    }
}
function openPdfTempInfoManagement() {
    //ASA-1531
    try {
        openInlineDialog("pdf_temp_info_management", 60, 82);
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1587
async function callPlanoRate() {
    try {
        apex.message.clearErrors();
        const salInd = apex.item("P25_SALE_INDE").getValue(),
            qtyInd = apex.item("P25_QUANTITY_INDE").getValue(),
            marInd = apex.item("P25_MARGIN_INDEX").getValue();

        const prevPogVersion = $v("P25_PAR_POG_VERSION"); //ASA-1587 #15A
        var currPogCode = g_pog_json[g_pog_index].POGCode,
            currPogVer = g_pog_json[g_pog_index].Version;
        const weekEnd = $v("P25_DATES_FROM_WEEK").slice(10, 16),
            weekStart = $v("P25_DATES_FROM_WEEK").slice(0, 6),
            assortRef = $v("P25_ASSMT_REF"),
            sal_perc = $v("P25_SALES_INDEX") / 100,
            qty_perc = $v("P25_QUANTITY_INDEX") / 100,
            mar_perc = $v("P25_MARGIN_INDEX") / 100;
        var segmentName = assortRef !== "C" ? $v("P25_PAR_SEGMENT") : $v("P25_PAR_COMPANY_STORE_SEGMENT");
        if (assortRef !== "C" && $v("P25_PAR_SEGMENT") == "") {
            var segmentIsNull = get_message("SEGMENT_NOT_NULL");
            apex.message.showErrors([{
                type: "error",
                location: "inline",
                pageItem: "P25_PAR_SEGMENT",
                message: segmentIsNull,
            },
            ]);
        } else if ((salInd == "N" && qtyInd == "N" && marInd == "N") || (salInd == "Y" && qtyInd == "N" && marInd == "N") || (salInd == "N" && qtyInd == "Y" && marInd == "N") || (salInd == "N" && qtyInd == "N" && marInd == "Y")) {
            alert(get_message("ATLEST_TWO_INDEX_SELECT"));
        } else if (parseFloat($v("P25_SALES_INDEX")) + parseFloat($v("P25_QUANTITY_INDEX")) + parseFloat($v("P25_MARGIN_INDEX")) !== 100) {
            alert(get_message("SAR_WEIGHT_SUM_GRT_1"));
        } else {
            addLoadingIndicator();
            async function callPlanoApi() {
                var planoApi = apex.server.process(
                    "CALL_PLANO_RATE", {
                    x01: currPogCode,
                    x02: prevPogVersion,
                    x03: weekStart,
                    x04: weekEnd,
                    x05: segmentName,
                    x06: sal_perc,
                    x07: qty_perc,
                    x08: mar_perc,
                    x09: curr_file_name,
                    x10: prev_file_name,
                    p_clob_01: JSON.stringify(g_pog_json[0]),
                }, {
                    dataType: "json",
                });
                planoApi.done(function (data) {
                    const asthStatus = data.ASTH_STATUS,
                        compStatus = data.COMP_STATUS,
                        prodStatus = data.PROD_STATUS;
                    apex.region("asp_curr_chart").refresh();
                    apex.region("asp_prev_chart").refresh();
                    apex.region("csp_curr_chart").refresh();
                    apex.region("csp_prev_chart").refresh();
                    apex.region("pas_curr_chart").refresh();
                    apex.item("P25_ASP_COMPARISON").setValue(data.ASTH_RESULT);
                    apex.item("P25_CSP_COMPARISON").setValue(data.COMP_RESULT);
                    if (asthStatus == "ERROR") {
                        raise_error(data.ASTH_MSG);
                    } else if (compStatus == "ERROR") {
                        raise_error(data.COMP_MSG);
                    } else if (prodStatus == "ERROR") {
                        raise_error(data.PROD_MSG);
                    } else {
                        removeLoadingIndicator(regionloadWait);
                        apex.message.showPageSuccess(get_message("PAR_SUCCESS"));
                    }
                });
            }

            const timestamp = Date.now();
            render(g_pog_index);
            reset_zoom();
            var prev_file_name = "";

            // ASA-1655 starts
            const pog_flagstr = $v("P25_PAR_POG_FLAGS");
            const flags_values = pog_flagstr.split(";");
            const pog_flags = {};
            pog_flags["g_show_notch_label_old"] = nvl(g_show_notch_label) == 0 ? "N" : g_show_notch_label;
            pog_flags["g_show_fixel_space_old"] = nvl(g_show_fixel_space) == 0 ? "N" : g_show_fixel_space;
            pog_flags["g_show_item_label_old"] = nvl(g_show_item_label) == 0 ? "N" : g_show_item_label;
            pog_flags["g_show_max_merch_old"] = nvl(g_show_max_merch) == 0 ? "N" : g_show_max_merch;
            pog_flags["g_show_days_of_supply_old"] = nvl(g_show_days_of_supply) == 0 ? "N" : g_show_days_of_supply;
            pog_flags["g_show_live_image_old"] = nvl(g_show_live_image) == 0 ? "N" : g_show_live_image;
            // Loop through each pair, split by ':', and add them to the object
            flags_values.forEach((pair) => {
                const [key, value] = pair.split(":");
                pog_flags[key] = value;
            });

            //set global varibales as per BU parameter.
            g_show_item_label = pog_flags.I;
            g_show_live_image = pog_flags.L;
            g_show_notch_label = pog_flags.N;
            g_show_fixel_space = pog_flags.A;
            g_show_days_of_supply = pog_flags.D;
            g_show_max_merch = pog_flags.M;

            await enableDisableFlags(g_pog_index, "Y");
            if (g_show_live_image !== pog_flags.g_show_live_image_old) {
                var return_val = await recreate_image_items(g_show_live_image, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), g_pog_index, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                if (g_show_live_image == "Y") {
                    animate_all_pog();
                }
            }
            await timeout(200); //ASA-1655 Issue 1
            var curr_file_name = currPogCode + "_" + currPogVer + "_" + timestamp + ".jpeg";
            main_canvas = await get_full_canvas(g_pog_index, 3);
            var dataURL = main_canvas.toDataURL("image/jpeg");
            const webglImage = dataURL;
            const img = new Image();
            img.src = webglImage;
            img.onload = function () {
                const canvas2D = document.createElement("canvas");
                canvas2D.width = img.width * $v("P25_PAR_IMAGE_SCALE");
                canvas2D.height = img.height * $v("P25_PAR_IMAGE_SCALE");
                const ctx2D = canvas2D.getContext("2d");
                ctx2D.drawImage(img, 0, 0, canvas2D.width, canvas2D.height);

                var [croppedCanvas, scaleToFit] = cropCanvasToContent(canvas2D);
                const croppedDataURL = croppedCanvas.toDataURL("image/jpeg", $v("PAR_IMAGE_COMPRESS_RATIO"));
                var base64Image = croppedDataURL.match(/,(.*)$/)[1];

                var imgProcess = apex.server.process(
                    "UPLOAD_IMAGE_TO_AZURE", {
                    x01: curr_file_name,
                    p_clob_01: base64Image,
                }, {
                    dataType: "text",
                });
                imgProcess.done(async function (data) {
                    if (nvl(prevPogVersion) !== 0) {
                        const timestampPrev = Date.now();
                        prev_file_name = currPogCode + "_" + prevPogVersion + "_" + timestampPrev + ".jpeg";
                        await generatePOGImage(currPogCode, prevPogVersion, prev_file_name);
                    }

                    await callPlanoApi();

                    // ASA-1655 set back the original values
                    g_show_notch_label = pog_flags.g_show_notch_label_old;
                    g_show_fixel_space = pog_flags.g_show_fixel_space_old;
                    g_show_item_label = pog_flags.g_show_item_label_old;
                    g_show_max_merch = pog_flags.g_show_max_merch_old;
                    g_show_days_of_supply = pog_flags.g_show_days_of_supply_old;
                    g_show_live_image = pog_flags.g_show_live_image_old;
                    var res = await enableDisableFlags(g_pog_index, "Y");
                    if (pog_flags.L !== pog_flags.g_show_live_image_old) {
                        var return_val = await recreate_image_items(g_show_live_image, $v("P25_MERCH_STYLE"), $v("P25_POGCR_LOAD_IMG_FROM"), $v("P25_BU_ID"), $v("P25_POGCR_ITEM_NUM_LBL_COLOR"), $v("P25_POGCR_ITEM_NUM_LABEL_POS"), $v("P25_POGCR_DISPLAY_ITEM_INFO"), $v("P25_POGCR_DELIST_ITEM_DFT_COL"), $v("P25_NOTCH_HEAD"), g_pog_index, g_show_days_of_supply, $v("P25_POGCR_FONTSIZE_DAYSOFSUPP"), g_hide_show_dos_label); //ASA-1427 $v('P25_POGCR_ITEM_DETAIL_LIST')
                    }
                });
            };
            // ASA-1655 ends
        }
    } catch (err) {
        error_handling(err);
    }
}

async function generatePOGImage(p_pog_code, p_pog_version, p_file_name) {
    try {
        open_product("OPEN_PAR"); //ASA-1701 Issue 1
        var pAllImgLoad = $v("P25_POGCR_ALL_IMAGE_LOAD");
        var pog_details_obj = {};
        var pog_list = [];
        pog_details_obj["POGCode"] = p_pog_code;
        pog_details_obj["POGVersion"] = p_pog_version;
        pog_list.push(pog_details_obj);
        g_type_pog = "E";
        sessionStorage.setItem("g_type_pog", g_type_pog);
        var containerH = $("#canvas-holder .container").height();
        var containerW = $("#canvas-holder .container").width();
        var pogNo = 2;
        var canvasName = "maincanvas" + pogNo;

        $("[data-row=" + 1 + "]").append('<div id="tempCanvas" style="height:' + parseFloat(containerH.toFixed(2)) + "px;width:" + parseFloat(containerW.toFixed(2)) + 'px">' + '<canvas class="canvasregion" data-canvas=true id="' + canvasName + '" ></canvas></div>');

        async function doSomething() {
            // ASA-1655
            main_canvas = await get_full_canvas(g_pog_index, 3);
            var dataURL = main_canvas.toDataURL("image/jpeg");
            const webglImage = dataURL;
            const img = new Image();
            img.src = webglImage;
            await new Promise((resolve) => (img.onload = resolve));
            const canvas2D = document.createElement("canvas");
            canvas2D.width = img.width * $v("P25_PAR_IMAGE_SCALE");
            canvas2D.height = img.height * $v("P25_PAR_IMAGE_SCALE");
            const ctx2D = canvas2D.getContext("2d");
            ctx2D.drawImage(img, 0, 0, canvas2D.width, canvas2D.height);
            var [croppedCanvas, scaleToFit] = cropCanvasToContent(canvas2D);
            const croppedDataURL = croppedCanvas.toDataURL("image/jpeg", $v("PAR_IMAGE_COMPRESS_RATIO"));
            var base64Image = croppedDataURL.match(/,(.*)$/)[1];

            apex.server.process(
                "UPLOAD_IMAGE_TO_AZURE", {
                x01: p_file_name,
                p_clob_01: base64Image,
            }, {
                dataType: "text",
            });
            $("#tempCanvas").remove();
            var splice_index = g_pog_json.length - 1;
            g_scene_objects.splice(splice_index, 1);
            g_pog_json.splice(splice_index, 1);
            g_pog_index = 0;
            set_select_canvas(g_pog_index);
            open_product("OPEN_PAR"); //ASA-1701 Issue 1
            // ASA-1655 ends
        }

        // Wait for add_addition_pog to complete
        await add_addition_pog(pog_list, pAllImgLoad, true, "N");
        animate_all_pog(); //ASA-1655 Issue 1
        await timeout(200); //ASA-1655 Issue 1addLoadingIndicator$0
        // After add_addition_pog completes, run doSomething
        await doSomething();

        // ASA-1657 Added await to let process complete and move futher to upload image.
        // add_addition_pog(pog_list, pAllImgLoad, true, 'N').then( function () {
        //     setTimeout(function () {
        //         doSomething();
        //     }, 1500);
        // });
    } catch (err) {
        error_handling(err);
    }
}

function saveItemInfoBatch() {
    try {
        deferredObj = $.Deferred();
        addLoadingIndicator();
        apex.region("item_pog_info").widget().interactiveGrid("getActions").set("edit", false);
        apex.region("item_pog_info").widget().interactiveGrid("getViews", "grid").model.clearChanges();
        apex.region("item_pog_info").refresh();
        apex.region("draggable_table").refresh();
        //closeInlineDialog("upd_reg_mov"); ASA-1999
        apex.message.showPageSuccess(get_message("IMPORT_SUCCESS_TEXT")); //ASA-1999 Issue 16
        apex.region("item_pog_info").widget().interactiveGrid("getViews", "grid").view$.grid("firstPage");
        function ModelLoaded(timerId) {
            if (apex.region("item_pog_info").widget().interactiveGrid("getViews").grid.model._haveAllData) {
                clearInterval(timerId);
                removeLoadingIndicator(regionloadWait);
                deferredObj.resolve();
                saveItemInfo(g_pog_index, "Y", "Y");
                return deferredObj.promise();
            }
        }
        if (apex.region("item_pog_info").widget().interactiveGrid("getViews").grid) {
            // If model is not loaded with full data, load model completely
            if (!apex.region("item_pog_info").widget().interactiveGrid("getViews").grid.model._haveAllData) {
                apex.region("item_pog_info")
                    .widget()
                    .interactiveGrid("getViews")
                    .grid.model.fetchAll(function () { });
            }
            let timerId = setInterval(() => ModelLoaded(timerId), 10);
        }
        setTimeout(function () { saveItemInfo(g_pog_index, 'Y', 'Y') }, 500); //ASA-1999 Issue 20
    } catch (err) {
        error_handling(err);
    }
}

function uploadPogItemInfoFile(pFileIndex) {
    try {
        var fileInputElem = document.getElementById("P25_ITEM_INFO_UPLD");
        var file = fileInputElem.files[pFileIndex];
        var reader = new FileReader();

        reader.onload = (function (pFile) {
            return function (e) {
                if (pFile) {
                    var base64 = binaryArray2base64(e.target.result);
                    var f01Array = [];
                    f01Array = clob2Array(base64, 30000, f01Array);

                    apex.server.process(
                        "UPLOAD_ITEMS_COLOR", {
                        x01: file.name,
                        x02: file.type,
                        f01: f01Array,
                    }, {
                        dataType: "json",
                        success: function (data) {
                            if (data.result == "success") {
                                if (data.MassDelistedItem) { //ASA-1999-3
                                    updateMassDelistedTag(data.MassDelistedItem, 'Y');
                                }
                                g_itemInfoFileIndex++;

                                if (g_itemInfoFileIndex < fileInputElem.files.length) {
                                    // start uploading the next file
                                    uploadPogItemInfoFile(g_itemInfoFileIndex);
                                } else {
                                    g_itemInfoFileIndex = 0;
                                    fileInputElem.value = "";
                                    if (data.error_flag == "Y") {
                                        closeInlineDialog("upd_reg_mov");                                        
                                        apex.navigation.redirect("f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=EXPORT_ITEM_REGMOV_ON_ERROR:&DEBUG."); //ASA-1999 Issue 24
                                        //apex.navigation.redirect("f?p=&APP_ID.:&APP_PAGE_ID.:&APP_SESSION.:APPLICATION_PROCESS=EXPORT_ITEM_REGMOV_ON_ERROR:&DEBUG.");
                                        raise_error(get_message("IMPORT_RECORD_FAILURE"));
                                    } else {
                                        saveItemInfoBatch();
                                    }
                                }
                            } else {
                                apex.message.clearErrors();

                                apex.message.showErrors([{
                                    type: "error",
                                    location: ["page"],
                                    message: data.error,
                                    unsafe: false,
                                },
                                ]);
                            }
                        },
                        loadingIndicatorPosition: "page",
                    });
                }
            };
        })(file);
        reader.readAsArrayBuffer(file);
    } catch (err) {
        error_handling(err);
    }
}

function importUpdateItemInfo(pFileIndex) {
    try {
        var fileInputElem = document.getElementById("P25_UPDATE_ITEM_INFO");
        var file = fileInputElem.files[pFileIndex];
        var reader = new FileReader();

        reader.onload = (function (pFile) {
            return function (e) {
                if (pFile) {
                    var base64 = binaryArray2base64(e.target.result);
                    var f01Array = [];
                    f01Array = clob2Array(base64, 30000, f01Array);

                    apex.server.process(
                        "IMPORT_UPDATE_ITEM_INFO", {
                        x01: file.name,
                        x02: file.type,
                        f01: f01Array,
                    }, {
                        dataType: "json",
                        success: function (data) {
                            if (data.result == "success") {
                                g_itemInfoFileIndex++;

                                if (g_itemInfoFileIndex < fileInputElem.files.length) {
                                    // start uploading the next file
                                    importUpdateItemInfo(g_itemInfoFileIndex);
                                } else {
                                    g_itemInfoFileIndex = 0;
                                    fileInputElem.value = "";
                                    if (data.error_flag == "Y") {
                                        closeInlineDialog("upd_reg_mov");

                                        apex.navigation.redirect("f?p=" + $v("pFlowId") + ":" + $v("pFlowStepId") + ":" + $v("pInstance") + ":APPLICATION_PROCESS=EXPORT_UPDATE_ITEM_INFO_ON_ERROR");

                                        raise_error(get_message("IMPORT_RECORD_FAILURE"));
                                    } else {
                                        saveitem_depthremarks(data.item_dtl);
                                    }
                                }
                            } else {
                                apex.message.clearErrors();

                                apex.message.showErrors([{
                                    type: "error",
                                    location: ["page"],
                                    message: data.error,
                                    unsafe: false,
                                },
                                ]);
                            }
                        },
                        loadingIndicatorPosition: "page",
                    });
                }
            };
        })(file);
        reader.readAsArrayBuffer(file);
    } catch (err) {
        error_handling(err);
    }
}

//mOVED TO MAIN FILE
// ASA-1965 TASK 1 S Create new function for cleanup extra json tag from autofill json
// function filterAutoFillJsontag(p_autoFillData) {
//     const keepKeys = ["ItemID", "Item", "Desc"];
//     if (!p_autoFillData || typeof p_autoFillData !== "object")
//         return {};

//     const cleanData = JSON.parse(JSON.stringify(p_autoFillData));

//     const cleanItemKeys = (itemArray) => {
//         if (!Array.isArray(itemArray))
//             return;
//         itemArray.forEach((item) => {
//             Object.keys(item).forEach((key) => {
//                 if (!keepKeys.includes(key))
//                     delete item[key];
//             });
//         });
//     };

//     if (Array.isArray(cleanData.BlkInfo)) {
//         cleanData.BlkInfo.forEach((block) => {
//             //  Remove unwanted data and keep object data only from colorObj: BlockDim > ColorObj 
//             if (block.BlockDim && block.BlockDim.ColorObj) {
//                 const obj = block.BlockDim.ColorObj.object; // ASA-1965 Issue 5
//                 block.BlockDim.ColorObj = { object: obj };
//             }
//             // Path 1: BlkModInfo > moduleInfo > ShelfInfo > ItemInfo
//             if (Array.isArray(block.BlkModInfo)) {
//                 block.BlkModInfo.forEach((modInfo) => {
//                     const shelves = modInfo?.moduleInfo?.ShelfInfo;
//                     if (Array.isArray(shelves)) {
//                         shelves.forEach((shelf) => cleanItemKeys(shelf.ItemInfo));
//                     } else if (shelves && typeof shelves === "object") {
//                         cleanItemKeys(shelves.ItemInfo);
//                     }
//                 });
//             }

//             // Path 2: BlkShelfInfo > ShelfInfo > ItemInfo
//             if (Array.isArray(block.BlkShelfInfo)) {
//                 block.BlkShelfInfo.forEach((shelfBlock) => {
//                     const shelfInfo = shelfBlock?.ShelfInfo;
//                     if (Array.isArray(shelfInfo)) {
//                         shelfInfo.forEach((shelf) => cleanItemKeys(shelf.ItemInfo));
//                     } else if (shelfInfo && typeof shelfInfo === "object") {
//                         cleanItemKeys(shelfInfo.ItemInfo);
//                     }
//                 });
//             }
//         });
//     }

//     return cleanData;
// }
//ASA-1965 TASK 1 E

//ASA-1979 function to mirror the POG as per requirement
async function mirror_pog(p_src_pog_index = 0) {
    logDebug("function : mirror_pog", "S");
    try {
        closeInlineDialog("module_Swap");
        apex.message.clearErrors();
        if (typeof g_pog_json[p_src_pog_index] == "undefined") {
            apex.message.showErrors([{
                type: "error",
                location: "page",
                message: get_message("NO_POG_FOUND")
            }]);
            return;
        }

        const l_src = g_pog_json[p_src_pog_index];

        for (const mod of l_src.ModuleInfo) {
            for (const sh of mod.ShelfInfo) {
                if (sh.ObjType == "PEGBOARD") {
                    apex.message.showErrors([{
                        type: "error",
                        location: "page",
                        message: get_message("PEGBD_CHST_MIRROR_NOT_ALLOW")
                    }]);
                    return;
                }
                if (sh.ObjType == "CHEST" && typeof g_chest_as_pegboard !== "undefined" && g_chest_as_pegboard == "Y") {
                    apex.message.showErrors([{
                        type: "error",
                        location: "page",
                        message: get_message("PEGBD_CHST_MIRROR_NOT_ALLOW")
                    }]);
                    return;
                }
            }
        }

        addLoadingIndicator();
        let l_clone = JSON.parse(JSON.stringify(l_src));

        let l_pogCenterX;
        let l_minX = Number.POSITIVE_INFINITY, l_maxX = Number.NEGATIVE_INFINITY;
        for (const m of l_src.ModuleInfo) {
            if (typeof m.X !== "undefined") {
                l_minX = Math.min(l_minX, m.X - (m.W / 2));
                l_maxX = Math.max(l_maxX, m.X + (m.W / 2));
            }
        }
        l_pogCenterX = (l_minX == Number.POSITIVE_INFINITY) ? 0 : (l_minX + l_maxX) / 2;

        var l_baseCode = typeof l_clone.POGCode !== "undefined" && l_clone.POGCode !== null && l_clone.POGCode !== "" ? l_clone.POGCode : "POG_" + new Date().getTime();
        var l_mirrorCode = l_baseCode + "_MIRROR";
        var l_uniqueCode = l_mirrorCode;
        var l_sfx = 1;
        while (g_pog_json.some(function (p) {
            return typeof p.POGCode !== "undefined" && p.POGCode == l_uniqueCode;
        })) {
            l_uniqueCode = l_mirrorCode + "_" + l_sfx;
            l_sfx++;
        }
        l_clone.POGCode = l_uniqueCode;

        //ASA-1979 Issue1 Start
        let l_moduleIds = l_clone?.ModuleInfo?.map((m) => { return m?.Module }) || [];

        l_clone.ModuleInfo.reverse();
        if (Array.isArray(l_clone.ModuleInfo)) {
            let seqNo = 1;
            l_clone.ModuleInfo.forEach(module => {
                module.X = (2 * l_pogCenterX) - module.X;
                module.Module = l_moduleIds[seqNo - 1];
                module.SeqNo = seqNo;
                seqNo++;
            });
        }
        //ASA-1979 Issue1 End

        let l_slope_shelfs = [];    //ASA-1979 Issue8
        for (let mi = 0; mi < l_clone.ModuleInfo.length; mi++) {
            const mod = l_clone.ModuleInfo[mi];
            for (let si = 0; si < mod.ShelfInfo.length; si++) {
                const shelfs = mod.ShelfInfo[si];
                const isChest = shelfs.ObjType == "CHEST";
                if (!isChest) {
                    if (typeof shelfs.X !== "undefined") {
                        shelfs.X = 2 * l_pogCenterX - shelfs.X;
                    }
                }
                if (shelfs.SpreadItem == "R") {
                    shelfs.SpreadItem = "L";
                } else if (shelfs.SpreadItem == "L") {
                    shelfs.SpreadItem = "R";
                }
                if (shelfs.Combine == "R") {
                    shelfs.Combine = "L";
                } else if (shelfs.Combine == "L") {
                    shelfs.Combine = "R";
                }
                //ASA-1979 Issue8 Start
                if (shelfs?.Slope !== 0) {
                    l_slope_shelfs.push({ SPREAD: shelfs.SpreadItem, MIndex: mi, SIndex: si });
                }
                //ASA-1979 Issue8 End
                if (Array.isArray(shelfs.ItemInfo) && shelfs.ItemInfo.length > 0) {
                    shelfs.ItemInfo.reverse();
                    for (let k = 0; k < shelfs.ItemInfo.length; k++) {
                        const item = shelfs.ItemInfo[k];
                        if (isChest) continue;
                        delete item.Distance;
                        delete item.XDistanceArr;
                        delete item.ManualX;
                        delete item.ManualGap;
                        item.IIndex = k;
                        item.MIndex = mi;
                        let new_x = 2 * l_pogCenterX - item.X;
                        item.X = new_x;
                    }
                }
            }
        }
        g_pog_json.push(l_clone);
        g_json = [l_clone];
        appendMultiCanvasRowCol(g_pog_json.length, $v("P25_POGCR_TILE_VIEW"));
        init(1);
        var l_objects = {};
        l_objects["scene"] = g_scene;
        l_objects["renderer"] = g_renderer;
        g_scene_objects.push(l_objects);
        set_indicator_objects(1);
        modifyWindowAfterMinMax(g_scene_objects);
        add_pog_code_header();
        var l_POG_JSON = JSON.parse(JSON.stringify(g_pog_json));
        g_world = g_scene_objects[1].scene.children[2];
        g_camera = g_scene_objects[1].scene.children[0];
        await create_module_from_json(l_POG_JSON, "Y", "F", "N", "N", "N", "N", "Y", "Y", "", "N", g_scene_objects[1].scene.children[0], g_scene_objects[1].scene, 1, 1);
        //ASA-1979 Issue8 Start
        if (l_slope_shelfs?.length > 0) {
            l_slope_shelfs?.forEach((lss) => {
                update_spread_product_final(lss.SPREAD, lss.MIndex, lss.SIndex, 1);
            });
        }
        //ASA-1979 Issue8 End
        await location_numbering($v("P25_MODULE_DIR"), $v("P25_DIRECTION"), $v("P25_ORDER_TYPE"), $v("P25_START_ONE_FIXEL"), $v("P25_START_ONE_MOD_LOC"), 1, $v("P25_PALLET_DIRECTION"));
        await fixture_numbering($v("P25_MODULE_DIR"), $v("P25_DIRECTION"), $v("P25_IGNORE"), $v("P25_ORDER_TYPE"), $v("P25_START_ONE_MOD"), $v("P25_INCLUDE_MOD_NAME"), $v("P25_SEPARATOR"), $v("P25_LEADING_TEXT"), $v("P25_TRAILING_TEXT"), 1);
        render(1);
        g_ComViewIndex = -1;
        apex.message.showPageSuccess(get_message("MIRROR_SUCCESS"));
        logDebug("function : mirror_pog", "E");
    } catch (err) {
        error_handling(err);
        logDebug("function : mirror_pog; error : " + err.message, "E");
    } finally {
        if (typeof regionloadWait !== "undefined" && typeof regionloadWait.remove == "function") {
            removeLoadingIndicator(regionloadWait);
        }
    }
}
function updateMassDelistedTag(pReturnedJson, p_import = 'Y') { //ASA-1999-3

    if (!g_pog_json || g_pog_index === undefined) {
        console.error("g_pog_json not initialized");
        return;
    }

    let newItems = [];

    try {
        newItems = JSON.parse(pReturnedJson);
    } catch (e) {
        console.error("Invalid JSON returned from server");
        return;
    }

    if (!g_pog_json[g_pog_index].hasOwnProperty("MassDelistedItem")) {
        g_pog_json[g_pog_index].MassDelistedItem = [];
    }

    g_pog_json[g_pog_index].MassDelistedItem.length = 0;

    if (Array.isArray(newItems) && newItems.length > 0) {
        newItems.forEach(function (item) {
            g_pog_json[g_pog_index].MassDelistedItem.push(item);
        });
    }
    apex.server.process( //ASA-1999-3 Issue 22
        "SAVE_MASS_DELISTED_ITEMS",
        {
            x01: JSON.stringify(g_pog_json[g_pog_index].MassDelistedItem)
        },
        {
            dataType: "text"
        }
    );

}
