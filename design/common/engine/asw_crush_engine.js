

function crushItem(p_pog_index, p_moduleIndex, p_shelfIndex, p_itemIndex, p_crushType, p_setInd, p_itemDepthArr, p_itemDepthIndxArr, p_on_load = "N") {
    //ASA-1300 //ASA-1383 issue 8
    try {
        var crush_index_arr = [];
        var pogModule = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex];
        var pogShelf = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
        //we are using p_on_load to check if crushing has to be done when POG is getting created. At that time g_pog_json will only have the shelf which is currently
        // in the loop but cannot have other shelfs or items to judge how much crush to be done. so we use g_json which will have all the details of POG.
        if (p_on_load == "Y" && typeof g_json[0] !== "undefined" && g_json.length > 0) {
            //ASA-1383 issue 8 // 20240415 - Regression Issue 8
            if (typeof g_json[0].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex] !== "undefined") {
                // 20240415 - Regression Issue 8
                var open_shelf = g_json[0].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
            } else {
                var open_shelf = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
            }
        }
        var pogItem = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo[p_itemIndex];
        var orientation = typeof pogItem == "undefined" ? -1 : pogItem.Orientation;
        var [item_owidth, item_oheight, item_odepth, actualHeight, wActualWidth, actualdepth] = get_new_orientation_dim(orientation, 0, 0, 0); //ASA-1371_26842 Found out its called 2 times without use. ,ASA-1398 issue 4 added the actualdepth parameter checking the depth change to height ,width
        var height_manualCrush = "N";
        var width_manualCrush = "N";
        var crush_width = 0,
            crush_height = 0;
        /*var auto_h_crush = 'N',//ASA-1353 issue 3 regression issue 20240428
            auto_v_crush = 'N',
            auto_d_crush = 'N'; ////Start Task-02_25977 prasanna*/
        if (p_itemIndex !== -1 && typeof pogItem !== "undefined") {
            //if there is no capping then we reset the H and D to its actual value and then process crushing again.
            if (pogItem.CrushVert > 0 && pogItem.CapStyle == "0" && pogItem.NVal == 0 && (p_crushType == "H" || p_crushType == "A")) {
                pogItem.H = pogItem.RH;
            }
            if (pogItem.CrushD > 0 && (p_crushType == "D" || p_crushType == "A")) {
                pogItem.D = pogItem.RD;
            }

            //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST////ASA-1353 issue 3 regression issue 20240428
            /*if (pogItem.MassCrushV == "Y" && pogItem.MVertCrushed == "N" && pogItem.CHPerc > 0 && pogShelf.ObjType == 'CHEST') { //--Task_26821, Task_27323 regression 7 added check for the  chest       
                pogItem.MVertCrushed = 'Y';
                auto_v_crush = 'Y';
            }
            if (pogItem.MassCrushH == "Y" && pogItem.MHorizCrushed == "N" && pogItem.CWPerc > 0 && pogShelf.ObjType == 'CHEST') { //--Task_26821,Task_27323 regression 7 
                pogItem.MHorizCrushed = "Y";
                auto_h_crush = 'Y';
            }
            if (pogItem.MassCrushD == "Y" && pogItem.MDepthCrushed == "N" && pogItem.CDPerc > 0 && pogShelf.ObjType == 'CHEST') { //--Task_26821,Task_27323 regression 7 
                pogItem.MDepthCrushed = "Y";
                auto_d_crush = 'Y';
            }*/
            //ASA-2024.3 Start
            height_manualCrush = typeof pogItem.MVertCrushed == "undefined" || pogItem.MVertCrushed == null || pogItem.MVertCrushed == "N" ? "N" : "Y";
            if (actualHeight == "H") {
                crush_height = height_manualCrush == "N" ? pogItem.CHPerc : pogItem.CrushVert;
            } else if (actualHeight == "W") {
                crush_height = height_manualCrush == "N" ? pogItem.CWPerc : pogItem.CrushHoriz;
            } else if (actualHeight == "D") {
                crush_height = height_manualCrush == "N" ? pogItem.CDPerc : pogItem.CrushD;
            }
            width_manualCrush = typeof pogItem.MHorizCrushed == "undefined" || pogItem.MHorizCrushed == null || pogItem.MHorizCrushed == "N" ? "N" : "Y";
            if (wActualWidth == "H") {
                if (pogItem.MassCrushH == "Y") {
                    crush_width = pogItem.CrushHoriz;
                } else {
                    crush_width = width_manualCrush == "N" ? pogItem.CHPerc : pogItem.CrushVert;
                }
            } else if (wActualWidth == "W") {
                crush_width = width_manualCrush == "N" ? pogItem.CWPerc : pogItem.CrushHoriz;
            } else if (wActualWidth == "D") {
                crush_width = width_manualCrush == "N" ? pogItem.CDPerc : pogItem.CrushD;
            }
            //ASA-2024.3 End
        }
        //there is a possibility that there are multiple items to be crush in depth. so we set all to its RD. that is remove the crushing done before.
        if (p_itemDepthIndxArr.length > 0) {
            var r = 0;
            for (idx of p_itemDepthIndxArr) {
                var y = 0;
                for (obj of g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex].ItemInfo) {
                    if (obj.CrushD > 0 && (p_crushType == "D" || p_crushType == "A") && y == p_itemDepthIndxArr[r]) {
                        obj.D = obj.RD;
                    }
                    y++;
                }
                r++;
            }
        }

        var spread_gap = 0,
            horiz_gap = 0;
        if (pogShelf.ObjType == "PEGBOARD") {
            horiz_gap = pogShelf.VertiSpacing;
        } else {
            horiz_gap = pogShelf.HorizGap;
        }

        if (horiz_gap > 0) {
            spread_gap = horiz_gap;
        } else {
            spread_gap = 0;
        }
        //before condition enters for CHEST items. because the logic for crush in chest is different.
        if (typeof pogItem !== "undefined" && pogShelf.ObjType == "CHEST" && g_chest_as_pegboard == "Y" && (pogShelf.AllowAutoCrush == "Y" || pogShelf.ManualCrush == "Y")) {
            //ASA-1300 start
            var return_val = "Y";
            // var [l_valid_width, l_valid_height, l_valid_depth, l_hit, l_hit_cnt_all, l_hit_dirc_horz_all, l_hit_dirc_vert_all] = check_chest_area_item_hit('A', pogItem, pogShelf.ItemInfo, pogShelf, pogItem.H, pogItem.W, pogItem.D, p_itemIndex);//ASA-1405 Issue 2
            // pogItem.D = pogItem.RD; // ASA-1405 issue 2
            // ASA-1405 Issue 2
            if (p_crushType == "H" || p_crushType == "A" || p_crushType == "W") {
                //crushing only H and W in the below function.
                //This below function will find out all the overlapping items and find out totally how much of widht and height to be crushed and return Y if done or N if could not crush.
                return_val = crushChestItemHW(p_on_load == "Y" && typeof open_shelf !== "undefined" ? open_shelf : pogShelf, pogItem, p_itemIndex, crush_height, crush_width, width_manualCrush, height_manualCrush, actualHeight, wActualWidth, p_setInd); //20240708 Regression issue 4
            }
            //This code is from crushing depth
            if (actualHeight == "D") {
                var heightPerc = pogItem.CrushVert;
                var heightPercMax = pogItem.CHPerc;
                var manualCrush = pogItem.MVertCrushed;
                crushVal = (typeof pogItem.MVertCrushed == "undefined" || pogItem.MVertCrushed == "N") && heightPercMax > 0 ? heightPercMax : heightPerc;
            } else {
                var deptPerc = pogItem.CrushD;
                var deptPercMax = pogItem.CDPerc;
                var manualCrush = pogItem.MDepthCrushed;
                crushVal = (typeof pogItem.MDepthCrushed == "undefined" || pogItem.MDepthCrushed == "N") && deptPercMax > 0 ? deptPercMax : deptPerc;
            }
            // ASA-1405 Issue 2
            // if (((p_crushType == "D" || p_crushType == "A") && l_valid_depth == 'N') || manualCrush == 'Y') {
            //for chest if items D is more than basket wall heigth. then we try to crush.
            if (((p_crushType == "D" || p_crushType == "A") && pogItem.D > pogShelf.BsktWallH) || manualCrush == "Y") {
                pogItem.D = pogItem.RD; // ASA-1405 issue 2
                var new_crush_perc = 0;
                var real_depth = pogItem.RD;
                var l_success = "N";
                var new_depth = pogItem.D; //ASA-1327 the value was assigned inside. but when crushVal =0 then undefined.

                if (crushVal > 0) {
                    //this code is manual crush N. the loop will continue till crush perc. if new depth is less than basket wall height then crushing passes.
                    if (manualCrush == "N") {
                        for (j = 0; j <= crushVal; j++) {
                            new_depth = wpdSetFixed(real_depth - (real_depth * j) / 100); //.toFixed(4));//ASA-1405 Issue 2
                            // ASA-1405 Issue 2
                            // var [l_width_valid, l_height_valid, l_depth_valid, l_hit, l_hit_cnt, l_hit_dirc_horz, l_hit_dirc_vert] = check_chest_area_item_hit('C', pogItem, pogShelf.ItemInfo, pogShelf, pogItem.H, pogItem.W, new_depth, p_itemIndex);
                            // if (l_hit == 'N') {
                            //Regression Issue 2 20240725, change > to <=
                            if (new_depth <= pogShelf.BsktWallH) {
                                new_crush_perc = j;
                                l_success = "Y";
                                break;
                            }
                        }
                    } else {
                        //This part is manual crush. here we don't loop and try to find the crush perc. but completely crush until the crush perc mentioned by user.
                        new_depth = wpdSetFixed(real_depth - (real_depth * crushVal) / 100); //.toFixed(4));//ASA-1405 Issue 2
                        // ASA-1405 Issue 2
                        // var [l_width_valid, l_height_valid, l_depth_valid, l_hit, l_hit_cnt, l_hit_dirc_horz, l_hit_dirc_vert] = check_chest_area_item_hit('C', pogItem, pogShelf.ItemInfo, pogShelf, pogItem.H, pogItem.W, new_depth, p_itemIndex);
                        // if (l_hit == 'N') {
                        //Regression Issue 2 20240725, change > to <=
                        if (new_depth <= pogShelf.BsktWallH) {
                            new_crush_perc = crushVal;
                            l_success = "Y";
                        }
                    }
                }
                if (l_success == "Y" && p_setInd == "Y") {
                    pogItem.D = wpdSetFixed(new_depth); //.toFixed(4));//ASA-1405 Issue 2
                    if (actualdepth == "W") {
                        //ASA-1398 ISSUE 4
                        pogItem.CrushHoriz = new_crush_perc;
                    } else if (actualdepth == "H") {
                        pogItem.CrushVert = new_crush_perc;
                    } else if (actualdepth == "D") {
                        pogItem.CrushD = new_crush_perc;
                    } //ASA-1398 ISSUE 4 -E;
                    pogItem.DChanged = "Y";
                    g_error_category = "";
                    return_val = "Y";
                } else {
                    if (manualCrush == "Y") {
                        //SA-1398 ISSUE 4
                        pogItem.D = wpdSetFixed(new_depth); //.toFixed(4));//ASA-1405 Issue 2
                        if (actualdepth == "W") {
                            pogItem.CrushHoriz = new_crush_perc;
                        } else if (actualdepth == "H") {
                            pogItem.CrushVert = new_crush_perc;
                        } else if (actualdepth == "D") {
                            pogItem.CrushD = new_crush_perc;
                        } //ASA-1398 ISSUE 4 -E;;
                        pogItem.DChanged = "Y";
                    }
                    g_error_category = "D";
                    return_val = "N";
                }
            }
            //Start Task-02_25977 prasanna////ASA-1353 issue 3 regression issue 20240428
            /*if (pogItem.MassCrushH == "Y" && auto_h_crush == "Y") { //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
                pogItem.MHorizCrushed = "N";
                pogItem.MassCrushH = 'N';
            }
            if (pogItem.MassCrushV == "Y" && auto_v_crush == "Y") { //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
                pogItem.MVertCrushed = "N";
                pogItem.MassCrushV = 'N';
            }
            if (pogItem.MassCrushD == "Y" && auto_d_crush == "Y") { //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
                pogItem.MDepthCrushed = "N";
                pogItem.MassCrushD = 'N';
            }*/
            //End Task-02_25977 prasanna
            return return_val;
        } else if (!(pogShelf.ObjType == "CHEST" && g_chest_as_pegboard == "Y")) {
            //End ASA-1300
            var return_val = "Y"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
            //if Height crushing need to be done.
            if (p_crushType == "H" || p_crushType == "A") {
                var new_crush_perc = 0;
                var new_height = 0,
                    cap_height = 0,
                    item_height = pogItem.RH;
                // if we are calling crushitem function from create_shelf_from_json_lib. we need to use g_json and get the max merch
                //because the g_pog_json will not have all the shelfs above the current shelf and item at the moment this function is called. so we cannot get correct max merch.
                if (p_on_load == "Y" && typeof g_json[0] !== "undefined") {
                    //20240415 Rregression issue 12 20240430
                    var l_max_merch = get_onload_max_merch(p_moduleIndex, p_shelfIndex, pogModule, pogShelf, g_dft_max_merch, 0, g_json);
                } else {
                    var l_max_merch = get_cap_max_merch(p_moduleIndex, p_shelfIndex, pogModule, pogShelf, p_pog_index, g_dft_max_merch); //ASA-1353 issue 3 --Task_27104 20240419//20240415 - Regression Issue 8
                }

                //we capture the cap height because after crush to add it back to actual crushed H.
                if (pogItem.CapStyle == "1" || pogItem.CapStyle == "2" || pogItem.CapStyle == "3") {
                    cap_height = pogItem.H - pogItem.RH;
                    //l_max_merch = l_max_merch - nvl(cap_height);ASA-1410 issue 13
                    item_height = pogItem.RH + nvl(cap_height); //task 25959 Kush real height not included the cap height so we need to add the capheight
                }

                //if not manually crushed we run loop on crush perc and try to see if height is less than max merch.
                if (height_manualCrush == "N") {
                    for (i = 0; i <= crush_height; i++) {
                        new_height = item_height - (item_height * i) / 100;
                        if (l_max_merch >= new_height) {
                            new_crush_perc = i;
                            break;
                        }
                    }
                } else {
                    //if manually crushed by user. just crush the item till the value mentioned by user.
                    new_height = item_height - (item_height * crush_height) / 100;
                    new_crush_perc = crush_height;
                }
                //if there are items on top or bottom of the current item. we find the total height of all the items included.
                if ((typeof pogItem.TopObjID !== "undefined" && pogItem.TopObjID !== "") || (typeof pogItem.BottomObjID !== "undefined" && pogItem.BottomObjID !== "")) {
                    //TASK 25959 Kush -S
                    var item_top = pogItem.H;
                    var j = 0;
                    for (const items_info of pogShelf.ItemInfo) {
                        if (wpdSetFixed(pogItem.X) == wpdSetFixed(items_info.X) && j !== p_itemIndex) {
                            item_top += items_info.H;
                        }
                        j++;
                    }
                    new_height = item_top;
                } // Task 25959-E
                //if crushing did not pass. reset crush perc to 0.
                if (new_height > l_max_merch) {
                    g_error_category = "H";
                    return_val = "N"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                    if (height_manualCrush == "N") {
                        //Start ASA-1412 issue 8
                        if (actualHeight == "H") {
                            pogItem.CrushVert = 0;
                        } else if (actualHeight == "W") {
                            pogItem.CrushHoriz = 0;
                        } else if (actualHeight == "D") {
                            pogItem.CrushDepth = 0;
                        } //End ASA-1412 issue 8
                    }
                } else {
                    if (p_setInd == "Y") {
                        pogItem.H = new_height;
                        if (actualHeight == "H") {
                            //Task-02_25977
                            pogItem.CrushVert = new_crush_perc;
                        } else if (actualHeight == "W") {
                            pogItem.CrushHoriz = new_crush_perc;
                        } else if (actualHeight == "D") {
                            pogItem.CrushDepth = new_crush_perc;
                        }
                        var [itemx, itemy] = get_item_xy(pogShelf, pogItem, pogItem.W, pogItem.H, p_pog_index);
                        if (!(pogShelf.ObjType == "BASKET" && pogItem.Item == "DIVIDER")) {
                            pogItem.Y = itemy;
                        }
                        pogItem.HChanged = "Y";
                    }
                    g_error_category = "";
                    return_val = "Y"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                }
            }
            //width crush is done below.
            if (p_crushType == "W" || p_crushType == "A") {
                var l_shelf_found = "N";
                var shelf_width = 0;
                var crush_width_arr = [],
                    crush_horiz_arr = [];
                var new_item_sum = 0;
                var crush_item_ind = "N";
                var new_crush_perc = 0;
                var new_avilable_space = 0;
                var l_allow_comb_crush = "N";

                //Width crush has 2 different parts. one - crushing combine shelf items. here we should consider total width of all the shelfs which are combine in one set.
                //two - normal shelf item to be crushed based on width of that particular shelf.
                //Note: width crushing is always try to crush all the items in the shelf to fit into the shelf width. not only the current item sent to crush.could be all items in combine shelfs or single shelf.
                if (g_combinedShelfs.length > 0) {
                    ///ASA-1307
                    var [oldCombinationIndex, oldShelfCombIndx] = getCombinationShelf(p_pog_index, pogShelf.Shelf);
                    //check if the shelf in which the current item exists is combined with other shelfs are not. if yes
                    //then take the allow auto crush setup of the first shelf from the left. that is saved in the g_combineShelfs array.
                    if (oldCombinationIndex !== -1) {
                        l_shelf_found = "Y";
                        l_allow_comb_crush = g_combinedShelfs[oldCombinationIndex][0].AllowAutoCrush;
                    }
                    if (l_shelf_found == "Y") {
                        //g_combineShelfs array will have all the iteminfo of all the combine shelfs with the current items shelf.
                        var items_arr = g_combinedShelfs[oldCombinationIndex].ItemInfo;
                        /*if (typeof pogItem !== 'undefined') {
                        items_arr.push(pogItem);
                        }*/
                        //calculate the total width of all combine shelfs.
                        var i = 0;
                        for (var combineshelf of g_combinedShelfs[oldCombinationIndex]) {
                            shelf_width = shelf_width + combineshelf.W;
                            i++;
                        }
                    }
                }
                if (l_shelf_found == "Y") {
                    var i = 0;
                    var crush_item_ind = "N", //ASA-1677, was =-1 //start ASA-1353 issue 3 --Task_27104 20240417
                        crush_index_arr = [],
                        crush_id_arr = [], //ASA-1353 issue 3 20240424
                        crush_shelf_arr = [],
                        crush_mod_arr = [],
                        crush_width_arr = [],
                        crush_manual_arr = [], //ASA-1353 issue 3 Task_27104
                        crush_horiz_arr = []; //End ASA-1353 issue 3 --Task_27104 20240417
                    // if (width_manualCrush == 'N') {
                    //looping all the items from all shelfs that are combined with current item shelfs and get the list of items which have crush % and manual crush.
                    for (const items of items_arr) {
                        var items_crush_width = 0;
                        var orientation = items.Orientation;
                        var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0);
                        //Start Task_26899
                        // we are getting the manual crush setup and crush perc based on the orientation dim.
                        manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == null || items.MHorizCrushed == "N" ? "N" : "Y"; //ASA-1383 issue 8
                        if (wActualWidth == "W") {
                            //manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == "N" ? "N" : "Y";
                            items_crush_width = manualCrush == "N" && items.CWPerc > 0 ? items.CWPerc : items.CrushHoriz;
                        } else if (wActualWidth == "H") {
                            //manualCrush = typeof items.MVertCrushed == "undefined" || items.MVertCrushed == "N" ? "N" : "Y";
                            items_crush_width = manualCrush == "N" && items.CHPerc > 0 ? items.CHPerc : items.CrushVert;
                        } else if (wActualWidth == "D") {
                            //manualCrush = typeof items.MDepthCrushed == "undefined" || items.MDepthCrushed == "N" ? "N" : "Y";
                            items_crush_width = manualCrush == "N" && items.CDPerc > 0 ? items.CDPerc : items.CrushD;
                        }
                        //End Task_26899
                        if (items.Fixed == "N" && items_crush_width > 0 && ((manualCrush == "Y" && i !== p_itemIndex) || manualCrush == "N")) {
                            crush_item_ind = "Y";
                            crush_index_arr.push(items.IIndex);
                            crush_shelf_arr.push(items.SIndex);
                            crush_mod_arr.push(items.MIndex);
                            crush_id_arr.push(items.MIndex + "#" + items.SIndex + "#" + items.IIndex); //ASA-1353 issue 3 20240424
                            crush_width_arr.push(items.W);
                            crush_manual_arr.push(manualCrush); //ASA-1353 issue 3 Task_27104
                            crush_horiz_arr.push(items_crush_width);
                        }
                        i++;
                    }
                    //}
                    if (crush_item_ind == "Y") {
                        crush_item_ind = "N";
                        //this loop will run to 100% crush, but will be restricted to each items max crush perc inside the items_arr loop. it also considers each items
                        //manual crush setting too.
                        for (i = 0; i < 100; i++) {
                            new_item_sum = 0;
                            var new_width = 0;
                            var j = 0;
                            var mcrush_ind = "N"; //Task-01_27858 issue 14 20240530
                            for (const items of items_arr) {
                                var items_crush_width = 0;
                                //Start Task_26899
                                //getting manual crush setting and crush perc for each item in the loop.
                                var orientation = items.Orientation;
                                var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0);
                                manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == null || items.MHorizCrushed == "N" ? "N" : "Y"; //ASA-1383 issue 8

                                //As this is a combine shelf items. we need to get MIndex, SIndex and IIndex and the get the item details. or there can be possibility
                                //that we are getting same IIndex item from different shelf.
                                items_crush_width = crush_horiz_arr[crush_id_arr.indexOf(items.MIndex + "#" + items.SIndex + "#" + items.IIndex)]; //ASA-1353 issue 3 20240424
                                if (typeof items_crush_width == "undefined") {
                                    //ASA-1353 issue 3 20240424
                                    if (wActualWidth == "W") {
                                        items_crush_width = manualCrush == "N" && items.CWPerc > 0 ? items.CWPerc : items.CrushHoriz;
                                    } else if (wActualWidth == "H") {
                                        items_crush_width = manualCrush == "N" && items.CHPerc > 0 ? items.CHPerc : items.CrushVert;
                                    } else if (wActualWidth == "D") {
                                        items_crush_width = manualCrush == "N" && items.CDPerc > 0 ? items.CDPerc : items.CrushD;
                                    }
                                }
                                //End ASA-1353 issue 3 --Task_27104 20240417
                                //End Task_26899
                                //This condition will pass only when manual crush is 'N' and i is not reached the max crush perc of that item.
                                if (crush_id_arr.indexOf(items.MIndex + "#" + items.SIndex + "#" + items.IIndex) !== -1 && i <= items_crush_width && manualCrush == "N") {
                                    //ASA-1353 issue 3 20240424
                                    //we calculate new width after crush from crush perc loop.
                                    new_width = wpdSetFixed(items.RW - items.RW * (i / 100));
                                    //if the current item crushing has not reached the maximum of the crush perc then go in set the current crush perc.
                                    if (new_width >= wpdSetFixed(items.RW - items.RW * (items_crush_width / 100))) {
                                        new_item_sum += new_width;
                                        if (p_setInd == "Y") {
                                            //ASA-1307
                                            if (typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex] !== "undefined") {
                                                //ASA-1353 issue 3 20240424
                                                //Start Task_27812
                                                var item_info = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex];
                                                item_info.W = new_width;
                                                if (wActualWidth == "W") {
                                                    //ASA-1353 issue 3 20240424
                                                    item_info.CrushHoriz = i;
                                                } else if (wActualWidth == "H") {
                                                    item_info.CrushVert = i;
                                                } else if (wActualWidth == "D") {
                                                    item_info.CrushD = i;
                                                }
                                                //g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].CrushHoriz = i;
                                                //End Task_27812
                                            } else {
                                                items.W = new_width;
                                                if (wActualWidth == "W") {
                                                    //ASA-1353 issue 3 20240424
                                                    items.CrushHoriz = i;
                                                } else if (wActualWidth == "H") {
                                                    items.CrushVert = i;
                                                } else if (wActualWidth == "D") {
                                                    items.CrushD = i;
                                                }
                                                // items.CrushHoriz = i;//ASA-1353 issue 3 20240424
                                            } //End ASA-1353 issue 3 --Task_27104 20240417
                                        }
                                    } else {
                                        //else use the RW of the current item.
                                        new_item_sum += items.RW;
                                    }
                                } else if (manualCrush == "Y") {
                                    //manual crush will not be crush for suitable crush perc. but crushed completely.
                                    mcrush_ind = items_crush_width > 0 ? "Y" : "N"; //Task-01_27858 issue 14 20240530
                                    new_width = wpdSetFixed(items.RW - items.RW * (items_crush_width / 100));
                                    new_item_sum += new_width;
                                    if (p_setInd == "Y") {
                                        //ASA-1307
                                        if (typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex] !== "undefined") {
                                            //ASA-1353 issue 3 20240424
                                            //Start Task_27812
                                            var item_info = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex];
                                            item_info.W = new_width;
                                            if (wActualWidth == "W") {
                                                //ASA-1353 issue 3 20240424
                                                item_info.CrushHoriz = items_crush_width; //ASA-1386 Issue 14 20240528
                                            } else if (wActualWidth == "H") {
                                                item_info.CrushVert = items_crush_width; //ASA-1386 Issue 14 20240528
                                            } else if (wActualWidth == "D") {
                                                item_info.CrushD = items_crush_width; //ASA-1386 Issue 14 20240528
                                            }
                                            //End Task_27812
                                        } else {
                                            items.W = new_width;
                                            if (wActualWidth == "W") {
                                                //ASA-1353 issue 3 20240424
                                                items.CrushHoriz = items_crush_width;
                                            } else if (wActualWidth == "H") {
                                                items.CrushVert = items_crush_width;
                                            } else if (wActualWidth == "D") {
                                                items.CrushD = items_crush_width;
                                            }
                                            //items.CrushHoriz = items_crush_width;//ASA-1353 issue 3 20240424
                                        } //End ASA-1353 issue 3 --Task_27104 20240417
                                    }
                                } else {
                                    // this is needed to set the crush perc back to 0. if the crushperc was changed to 0 by user from dim master update.
                                    if (items_crush_width == 0) {
                                        //--Task_26821
                                        if (typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex] !== "undefined") {
                                            //ASA-1353 issue 3 20240424
                                            //Start Task_27812
                                            var item_info = g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex];
                                            if (wActualWidth == "W") {
                                                item_info.CrushHoriz = 0;
                                            } else if (wActualWidth == "H") {
                                                item_info.CrushVert = 0;
                                            } else if (wActualWidth == "D") {
                                                item_info.CrushD = 0;
                                            }
                                            //g_pog_json[p_pog_index].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].ItemInfo[items.IIndex].CrushHoriz = 0;
                                            //End Task_27812
                                        } else {
                                            if (wActualWidth == "W") {
                                                //ASA-1353 issue 3 20240424
                                                items.CrushHoriz = 0;
                                            } else if (wActualWidth == "H") {
                                                items.CrushVert = 0;
                                            } else if (wActualWidth == "D") {
                                                items.CrushD = 0;
                                            }
                                            //items.CrushHoriz = 0;//ASA-1353 issue 3 20240424
                                        } //END ASA-1353 issue 3 --Task_27104 20240417
                                    }
                                    new_item_sum += items.W;
                                }
                                if (horiz_gap > 0) {
                                    new_item_sum += items.SpreadItem;
                                }
                                j++;
                            }
                            /*(if (width_manualCrush == "Y") {
                                mcrush_width = pogItem.RW - pogItem.RW * (crush_width / 100);
                                if (p_setInd == "Y") {
                                    pogItem.W = mcrush_width;
                                    if (wActualWidth == 'W') {//ASA-1353 issue 3 20240424
                                        pogItem.CrushHoriz = crush_width;
                                    } else if (wActualWidth == 'H') {
                                        pogItem.CrushVert = crush_width;
                                    } else if (wActualWidth == 'D') {
                                        pogItem.CrushD = crush_width;
                                    }
                                    //pogItem.CrushHoriz = crush_width;//ASA-1353 issue 3 20240424
                                }
                            }*/
                            //check if the available space is > 0 then crush is successfull on all the items that are crushed.
                            new_avilable_space = shelf_width - new_item_sum; // + mcrush_width);
                            if (new_avilable_space >= 0) {
                                new_crush_perc = i;
                                if (i > 0 || mcrush_ind == "Y") {
                                    //ASA-1353 regression issue //Task-01_27858 issue 14 20240530
                                    crush_item_ind = "Y";
                                    if (p_itemIndex !== -1 && crush_index_arr.indexOf(p_itemIndex) !== -1 && p_setInd == "Y") {
                                        pogShelf.ItemInfo[p_itemIndex].WChanged = "Y";
                                    }
                                }
                                break;
                            }
                        }
                        //if items are not crushed or no need to crush then set the old crush perc back to all the items.
                        if (crush_item_ind == "N") {
                            if (new_crush_perc > 0) {
                                ////ASA-1353 issue 3 regression issue 20240428
                                var j = 0;
                                for (const items of crush_index_arr) {
                                    if (crush_manual_arr[j] == "N" && typeof g_pog_json[p_pog_index].ModuleInfo[crush_mod_arr[j]] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[crush_mod_arr[j]].ShelfInfo[crush_shelf_arr[j]] !== "undefined" && typeof g_pog_json[p_pog_index].ModuleInfo[crush_mod_arr[j]].ShelfInfo[crush_shelf_arr[j]].ItemInfo[crush_index_arr[j]] !== "undefined") {
                                        //ASA-1353 issue 3 Task_27104,//ASA 1387 issue 2 added to handle undefined shelfs and items in combination. As they are not pushed yet in the g_pog_json but are in combination
                                        g_pog_json[p_pog_index].ModuleInfo[crush_mod_arr[j]].ShelfInfo[crush_shelf_arr[j]].ItemInfo[crush_index_arr[j]].W = crush_width_arr[j];
                                        g_pog_json[p_pog_index].ModuleInfo[crush_mod_arr[j]].ShelfInfo[crush_shelf_arr[j]].ItemInfo[crush_index_arr[j]].CrushHoriz = crush_horiz_arr[j];
                                    }
                                    j++;
                                }
                            }
                            g_error_category = "W";
                            return_val = "N"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                        } else {
                            g_error_category = "";
                            return_val = "Y"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                        }
                    } else if (width_manualCrush == "Y" && crush_item_ind == "N" && typeof pogItem !== "undefined") {
                        //if manual crush for the current item in combine shelf is Y.
                        mcrush_width = wpdSetFixed(pogItem.RW - pogItem.RW * (crush_width / 100));
                        if (p_setInd == "Y") {
                            pogItem.W = mcrush_width;
                            pogItem.WChanged = "Y";
                            if (wActualWidth == "W") {
                                //ASA-1353 issue 3 20240424
                                pogItem.CrushHoriz = crush_width;
                            } else if (wActualWidth == "H") {
                                pogItem.CrushVert = crush_width;
                            } else if (wActualWidth == "D") {
                                pogItem.CrushD = crush_width;
                            }
                            //pogItem.CrushHoriz = crush_width;//ASA-1353 issue 3 20240424
                        }
                    } else {
                        return_val = "F"; //No items with crush > 0, run facing logic//UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                    }
                } else {
                    //Width crush of normal shelf item to be crushed based on width of that particular shelf.
                    //Note: width crushing is always try to crush all the items in the shelf to fit into the shelf width. not only the current item sent to crush.could be all items in combine shelfs or single shelf.
                    var items_arr = pogShelf.ItemInfo;
                    var i = 0;
                    var crush_item_ind = "N", //ASA-1677 was =-1,//Start ASA-1353 issue 3 --Task_27104 20240417
                        crush_index_arr = [],
                        crush_width_arr = [],
                        crush_manual_arr = [], //ASA-1353 issue 3 Task_27104
                        crush_horiz_arr = []; //End ASA-1353 issue 3 --Task_27104 20240417
                    var hasFixedDivider = false;
                    //if (width_manualCrush == 'N') { //Task-02_25977-- ASA-1349 issue 5
                    //list out all the items from the itemInfo that have crush perc or manual crush = 'Y'
                    for (const items of items_arr) {
                        var items_crush_width = 0;
                        var orientation = items.Orientation;
                        var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0);
                        //Start Task_26899
                        //get each items crush perc based on the dim change due to orientation of the item.
                        manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == null || items.MHorizCrushed == "N" ? "N" : "Y"; //ASA-1383 issue 8
                        if (wActualWidth == "W") {
                            //manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == "N" ? "N" : "Y";
                            items_crush_width = manualCrush == "N" && items.CWPerc > 0 ? items.CWPerc : items.CrushHoriz;
                        } else if (wActualWidth == "H") {
                            //manualCrush = typeof items.MVertCrushed == "undefined" || items.MVertCrushed == "N" ? "N" : "Y";
                            items_crush_width = manualCrush == "N" && items.CHPerc > 0 ? items.CHPerc : items.CrushVert;
                        } else if (wActualWidth == "D") {
                            //manualCrush = typeof items.MDepthCrushed == "undefined" || items.MDepthCrushed == "N" ? "N" : "Y";
                            items_crush_width = manualCrush == "N" && items.CDPerc > 0 ? items.CDPerc : items.CrushD;
                        }
                        //End Task_26899
                        if (items.Fixed == "N" && items_crush_width > 0) {
                            // && ((manualCrush == "Y" && i !== p_itemIndex) || manualCrush == "N")) {//ASA-1349 issue 5
                            crush_item_ind = "Y";
                            crush_index_arr.push(i);
                            crush_width_arr.push(items.W);
                            crush_manual_arr.push(manualCrush); //ASA-1353 issue 3 Task_27104
                            crush_horiz_arr.push(items_crush_width);
                        } else if (items.Fixed == "Y") {
                            //ASA-1765 Issue 6, && items.Item == "DIVIDER") {
                            hasFixedDivider = true;
                        }
                        i++;
                    }
                    //}
                    //This is needed when calling crushitem from create_shelf_from_json_lib. we need to use g_json. because it will have all the items in the shelf
                    //but g_pog_json will only have the items till the current item sent to crush because items are added one by one in loop in create_shelf_from_json_lib.
                    if (p_on_load == "Y") {
                        //ASA-1353 regression issue
                        var items_arr = open_shelf.ItemInfo;
                    } else {
                        var items_arr = pogShelf.ItemInfo;
                    }
                    if (crush_item_ind == "Y" && !hasFixedDivider) {
                        crush_item_ind = "N";
                        //this loop will run for all 100%. but each item will be tried to crush for each crush perc loop. if available space becomes > 0. then loop will break.
                        for (i = 0; i < 100; i++) {
                            new_item_sum = 0;
                            var new_width = 0;
                            //var mcrush_width = 0;
                            var j = 0;
                            var mcrush_ind = "N"; //Task-01_27858 issue 14 20240530
                            for (const items of items_arr) {
                                var items_crush_width = 0;
                                var orientation = items.Orientation; //Task_26899
                                var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0); //Task_26899
                                //Start Task_26899
                                //getting item crush perc based on dim change due to orientation.
                                manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == null || items.MHorizCrushed == "N" ? "N" : "Y"; //ASA-1383 issue 8
                                if (wActualWidth == "W") {
                                    //ASA-1383 issue 8
                                    //manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == "N" ? "N" : "Y";
                                    items_crush_width = manualCrush == "N" && items.CWPerc > 0 ? items.CWPerc : items.CrushHoriz;
                                } else if (wActualWidth == "H") {
                                    //manualCrush = typeof items.MVertCrushed == "undefined" || items.MVertCrushed == "N" ? "N" : "Y";
                                    items_crush_width = manualCrush == "N" && items.CHPerc > 0 ? items.CHPerc : items.CrushVert;
                                } else if (wActualWidth == "D") {
                                    //manualCrush = typeof items.MDepthCrushed == "undefined" || items.MDepthCrushed == "N" ? "N" : "Y";
                                    items_crush_width = manualCrush == "N" && items.CDPerc > 0 ? items.CDPerc : items.CrushD;
                                }
                                //items_crush_width = crush_horiz_arr[crush_index_arr.indexOf(items.IIndex)];//ASA-1383 issue 8
                                //End ASA-1353 issue 3 --Task_27104 20240417

                                //End Task_26899
                                //this condition will pass only when item in the loop has crush perc and i will be creater then max crush perc set for this item.
                                if (crush_index_arr.indexOf(j) !== -1 && i <= items_crush_width) {
                                    //ASA-1349 issue 5
                                    var real_width = typeof items.RW !== "undefined" && items.RW !== null ? items.RW : items.W; //ASA-1383 issue 8
                                    if (manualCrush == "N") {
                                        //we check if calculated width is still less than the total crushing width of that item. then set the new crush perc to that item tags.
                                        new_width = wpdSetFixed(real_width - real_width * (i / 100)); //ASA-1383 issue 8
                                        if (new_width >= wpdSetFixed(real_width - real_width * (items_crush_width / 100))) {
                                            //ASA-1383 issue 8
                                            new_item_sum += new_width;
                                            if (p_setInd == "Y") {
                                                pogShelf.ItemInfo[j].W = new_width;
                                                if (wActualWidth == "W") {
                                                    pogShelf.ItemInfo[j].CrushHoriz = i;
                                                } else if (wActualWidth == "H") {
                                                    pogShelf.ItemInfo[j].CrushVert = i;
                                                } else if (wActualWidth == "D") {
                                                    pogShelf.ItemInfo[j].CrushD = i;
                                                }
                                                //pogShelf.ItemInfo[j].CrushHoriz = i;
                                            }
                                        } else {
                                            //else take the RW of the item for calculate the sum of all items width.
                                            new_item_sum += real_width; //ASA-1383 issue 8
                                        }
                                    } else if (manualCrush == "Y") {
                                        //manual crush does not depend on crush perc loop. will be crushed till the crush perc defind by user.
                                        mcrush_ind = items_crush_width > 0 ? "Y" : "N"; //Task-01_27858 issue 14 20240530
                                        new_width = wpdSetFixed(real_width - real_width * (items_crush_width / 100)); //ASA-1383 issue 8
                                        new_item_sum += new_width;
                                        if (p_setInd == "Y") {
                                            //ASA-1307
                                            pogShelf.ItemInfo[j].W = new_width;
                                            if (wActualWidth == "W") {
                                                pogShelf.ItemInfo[j].CrushHoriz = items_crush_width;
                                            } else if (wActualWidth == "H") {
                                                pogShelf.ItemInfo[j].CrushVert = items_crush_width;
                                            } else if (wActualWidth == "D") {
                                                pogShelf.ItemInfo[j].CrushD = items_crush_width;
                                            }
                                        }
                                    }
                                } else {
                                    //add the width of other items which does not have crush perc.
                                    new_item_sum += wpdSetFixed(items.W);
                                }
                                if (horiz_gap > 0) {
                                    //if horiz gap is defined in product details. add that too.
                                    new_item_sum += items.SpreadItem;
                                }
                                j++;
                            }
                            /*if (width_manualCrush == "Y") {//ASA-1349 issue 5
                                mcrush_width = pogItem.RW - pogItem.RW * (crush_width / 100);
                                if (p_setInd == "Y") {
                                    pogItem.W = mcrush_width;
                                    pogItem.CrushHoriz = crush_width;
                                }
                            }*/
                            //check if available space is > 0. then pass the crusing and break loop.
                            new_avilable_space = pogShelf.W + pogShelf.ROverhang + pogShelf.LOverhang - new_item_sum; // + mcrush_width; //ASA-1791 Task 3 Added Overhang 
                            if (new_avilable_space >= 0) {
                                new_crush_perc = i;
                                if (i > 0 || mcrush_ind == "Y") {
                                    //ASA-1353 regression issue//Task-01_27858 issue 14 20240530
                                    crush_item_ind = "Y";
                                    if (p_itemIndex !== -1 && crush_index_arr.indexOf(p_itemIndex) !== -1 && p_setInd == "Y") {
                                        pogShelf.ItemInfo[p_itemIndex].WChanged = "Y";
                                    }
                                }
                                break;
                            }
                        }
                        //if crush was not success or not needed. then reset crush perc to old value.
                        if (crush_item_ind == "N") {
                            var j = 0;
                            if (new_crush_perc > 0) {
                                ////ASA-1353 issue 3 regression issue 20240428
                                for (const items of crush_index_arr) {
                                    if (crush_manual_arr[j] == "N") {
                                        //ASA-1353 issue 3 --Task_27104
                                        pogShelf.ItemInfo[crush_index_arr[j]].W = crush_width_arr[j];
                                        pogShelf.ItemInfo[crush_index_arr[j]].CrushHoriz = crush_horiz_arr[j];
                                    }
                                    j++;
                                }
                            }
                            g_error_category = "W";
                            return_val = "N"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                        } else {
                            g_error_category = "";
                            return_val = "Y"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                        }
                    } else if (crush_item_ind == "Y" && hasFixedDivider) {
                        return_val = widthCrushItemWithFixedDivider(p_pog_index, p_moduleIndex, p_shelfIndex, p_itemIndex, p_setInd); //ASA-1597
                    } else if (width_manualCrush == "Y" && crush_item_ind == "N") {
                        //if there was no crush perc for any item and current item has manual crush then manually crush.
                        var mcrush_width = pogItem.RW - pogItem.RW * (crush_width / 100);
                        if (p_setInd == "Y") {
                            pogItem.W = mcrush_width;
                            pogItem.WChanged = "Y";
                            pogItem.CrushHoriz = crush_width;
                        }
                    } else {
                        return_val = "F"; //No items with crush > 0, run facing logic//UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                    }
                }
            }
            //Depth crush is done here.
            if (p_crushType == "D" || p_crushType == "A") {
                var new_depth_arr = [],
                    new_index_arr = [],
                    new_manl_arr = [],
                    crush_item_ind = "N",
                    manualDCrush = "N";
                //we are using g_json if crushitem is called from create_shelf_from_json_lib. because g_pog_json will till current item and other shelfs and items
                //in that module will not yet populated because shelfs and items are populated one by one in loop in create_shelf_from_json_lib.
                //so we cannot find any shelf above the current shelf in g_pog_json. so use g_json.
                //Note: we are find the nearby shelf max depth because if any item hit on shelf on top. we need to crush that item till it will not hit the top shelf.
                if (p_on_load == "Y" && typeof g_json[0] !== "undefined") {
                    // ASA-1442 issue 7 S
                    var topdepth = onload_findNearByShelfMaxDepth(p_moduleIndex, p_shelfIndex, p_itemIndex, p_itemIndex, -1, 0, g_json); //ASA-1442 issue 5 added due to medicine shelf  if item current present in medicine shelf
                } else {
                    var topdepth = findNearByShelfMaxDepth(p_moduleIndex, p_shelfIndex, p_itemIndex, p_itemIndex, -1, p_pog_index); //ASA-1442 issue 5 added due to medicine shelf  if item current present in medicine shelf
                } // ASA-1442 issue 7 E
                //check all the items in the p_itemDepthArr and populate the array with item which have crush perc.
                for (i = 0; i < p_itemDepthArr.length; i++) {
                    /*if (actualHeight == "D") {//Task_26899
                        manualDCrush = typeof pogShelf.ItemInfo[p_itemDepthIndxArr[i]].MVertCrushed == "undefined" || pogShelf.ItemInfo[p_itemDepthIndxArr[i]].MVertCrushed == "N" ? "N" : "Y";
                    } else {*/
                    manualDCrush = typeof pogShelf.ItemInfo[p_itemDepthIndxArr[i]].MDepthCrushed == "undefined" || pogShelf.ItemInfo[p_itemDepthIndxArr[i]].MDepthCrushed == "N" ? "N" : "Y";
                    //}
                    if (p_itemDepthArr[i] > pogShelf.D - topdepth || manualDCrush == "Y") {
                        //ASA-1442 issue 5
                        new_depth_arr.push(p_itemDepthArr[i]);
                        new_index_arr.push(p_itemDepthIndxArr[i]);
                        new_manl_arr.push(manualDCrush);
                    }
                }
                var crush_value = 0,
                    crushVal = 0;
                //run the loop of all the items which have crush perc and try to crush.
                for (i = 0; i < new_depth_arr.length; i++) {
                    var orientation = pogShelf.ItemInfo[new_index_arr[i]].Orientation; //Task_26899
                    var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0); //Task_26899
                    //Start Task_26899
                    //get crush perc of each item based on changed dim due to orientation.
                    if (wActualDepth == "W") {
                        crushVal = manualDCrush == "N" && pogShelf.ItemInfo[new_index_arr[i]].CWPerc > 0 ? pogShelf.ItemInfo[new_index_arr[i]].CWPerc : pogShelf.ItemInfo[new_index_arr[i]].CrushHoriz;
                    } else if (wActualDepth == "H") {
                        crushVal = manualDCrush == "N" && pogShelf.ItemInfo[new_index_arr[i]].CHPerc > 0 ? pogShelf.ItemInfo[new_index_arr[i]].CHPerc : pogShelf.ItemInfo[new_index_arr[i]].CrushVert;
                    } else if (wActualDepth == "D") {
                        crushVal = manualDCrush == "N" && pogShelf.ItemInfo[new_index_arr[i]].CDPerc > 0 ? pogShelf.ItemInfo[new_index_arr[i]].CDPerc : pogShelf.ItemInfo[new_index_arr[i]].CrushD;
                    }

                    /*if (actualHeight == "D") {
                        var heightPerc = pogShelf.ItemInfo[new_index_arr[i]].CrushVert;
                        var heightPercMax = pogShelf.ItemInfo[new_index_arr[i]].CHPerc;
                        crushVal = manualDCrush == "N" && heightPercMax > 0 ? heightPercMax : heightPerc;//Task_26899
                    } else {
                        var deptPerc = pogShelf.ItemInfo[new_index_arr[i]].CrushD;
                        var deptPercMax = pogShelf.ItemInfo[new_index_arr[i]].CDPerc;
                        crushVal = manualDCrush == "N" && heightPercMax > 0 ? deptPercMax : deptPerc;//Task_26899
                    }*/
                    //End Task_26899
                    // we should minus topdepth from shelf D. to get the available shelf depth and then check with item D.
                    if (crushVal > 0 && (p_itemDepthArr[i] > pogShelf.D - topdepth || new_manl_arr[i] == "Y")) {
                        //ASA-1442 issue 5
                        var new_depth = 0; //Regression issue 14
                        var depth = pogShelf.ItemInfo[new_index_arr[i]].D;
                        var facing = pogShelf.ItemInfo[new_index_arr[i]].BaseD;
                        var real_depth = pogShelf.ItemInfo[new_index_arr[i]].RD; //depth * facing; VIVEKK
                        //if not manual crush then run the loop of crush perc and try to check the value is pass.
                        if (new_manl_arr[i] == "N") {
                            for (j = 0; j <= crushVal; j++) {
                                new_depth = real_depth - (real_depth * j) / 100;
                                if (pogShelf.D - topdepth >= new_depth) {
                                    //ASA-1442 issue 5
                                    crush_index_arr.push(new_index_arr[i]);
                                    crush_item_ind = "Y";
                                    crush_value = j;
                                    break;
                                }
                            }
                        } else {
                            //if manual crush. just crush the item with crush perc mentioned by user.
                            new_depth = real_depth - (real_depth * crushVal) / 100;
                            crush_index_arr.push(new_index_arr[i]);
                            crush_item_ind = "Y";
                            crush_value = crushVal;
                        }
                    }
                }
                //if crush was not successfull or not needed then set back to old values.
                if (crush_item_ind == "N") {
                    //ASA-1442 Issue 1
                    for (i = 0; i < p_itemDepthArr.length; i++) {
                        if (wpdSetFixed(pogShelf.ItemInfo[p_itemDepthIndxArr[i]].D) !== wpdSetFixed(pogShelf.ItemInfo[p_itemDepthIndxArr[i]].RD)) {
                            var orientation = pogShelf.ItemInfo[p_itemDepthIndxArr[i]].Orientation; //Task_26899
                            var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0); //Task_26899
                            if (manualDCrush == "N") {
                                if (wActualDepth == "W") {
                                    //ASA-1353 issue 3 20240424
                                    pogShelf.ItemInfo[p_itemDepthIndxArr[i]].CrushHoriz = 0;
                                } else if (wActualDepth == "H") {
                                    pogShelf.ItemInfo[p_itemDepthIndxArr[i]].CrushVert = 0;
                                } else if (wActualDepth == "D") {
                                    pogShelf.ItemInfo[p_itemDepthIndxArr[i]].CrushD = 0;
                                }
                            }
                        }
                    }
                }
                //if crush was successful then set the new crush value and D for each items.
                if (crush_item_ind == "Y" && p_itemDepthArr.length == crush_index_arr.length && p_setInd == "Y") {
                    for (i = 0; i < crush_index_arr.length; i++) {
                        var new_depth = pogShelf.ItemInfo[crush_index_arr[i]].RD - pogShelf.ItemInfo[crush_index_arr[i]].RD * (crush_value / 100);
                        pogShelf.ItemInfo[crush_index_arr[i]].D = new_depth;
                        pogShelf.ItemInfo[crush_index_arr[i]].CrushD = crush_value;
                    }
                    if (p_itemIndex !== -1) {
                        pogShelf.ItemInfo[p_itemIndex].DChanged = "Y";
                    }
                    g_error_category = "";
                    return_val = "Y"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                } else {
                    g_error_category = "D";
                    return_val = "N"; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
                }
            }
            /*if (pogItem.MassCrushH == "Y" && auto_h_crush == "Y") { //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST////ASA-1353 issue 3 regression issue 20240428
                pogItem.MHorizCrushed = "N";
                pogItem.MassCrushH = 'N';
            }
            if (pogItem.MassCrushV == "Y" && auto_v_crush == "Y") { //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
                pogItem.MVertCrushed = "N";
                pogItem.MassCrushV = 'N';
            }
            if (pogItem.MassCrushD == "Y" && auto_d_crush == "Y") { //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST
                pogItem.MDepthCrushed = "N";
                pogItem.MassCrushD = 'N';
            }*/
            return return_val; //UAT issue 9 Item Sizes are reverted for Crushed Items after Mass Update.
        }
    } catch (err) {
        error_handling(err);
        throw err;
    }
}


//ASA-1405
//This function is used to find out if the item sent in the param is hitting any of the items in the whole chest.
//its called in loop while crushing item for chest. this will pass N and then the crushing will stop and it will pass.
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
                    if ((citem_top > ov_bottom && ov_bottom > citem_bottom && !(citem_bottom < ov_top && ov_top < citem_top) && ((citem_start < ov_end && ov_end < citem_end) || (citem_end > ov_start && ov_start > citem_start))) || (!(citem_top > ov_bottom && ov_bottom > citem_bottom) && citem_bottom < ov_top && ov_top < citem_top && ((citem_start < ov_end && ov_end < citem_end) || (citem_end > ov_start && ov_start > citem_start))) || (((citem_top > ov_bottom && ov_bottom > citem_bottom) || (citem_bottom < ov_top && ov_top < citem_top)) && !(citem_start < ov_end && ov_end < citem_end) && citem_end > ov_start && ov_start > citem_start) || (((citem_top > ov_bottom && ov_bottom > citem_bottom) || (citem_bottom < ov_top && ov_top < citem_top)) && citem_start < ov_end && ov_end < citem_end && !(citem_end > ov_start && ov_start > citem_start))) {
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
        var itemHit = "N",
            shelfHit = "N";

        //Objtype CHEST means if the items is hanging outside the CHEST. so check which part of the item is hanging outside.
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
                leftOverlap = shelf_start - ov_start;
                crushedWidth = leftOverlap;
                shelfHit = "Y";
            }
            if (item_end > ov_end) {
                rightOverlap = item_end - ov_end;
                crushedWidth += rightOverlap;
                shelfHit = "Y";
            }
        } else {
            ov_top = wpdSetFixed(p_overlapped_item.Y + p_overlapped_item.H / 2);
            ov_bottom = wpdSetFixed(p_overlapped_item.Y - p_overlapped_item.H / 2);
            ov_start = wpdSetFixed(p_overlapped_item.X - p_overlapped_item.W / 2);
            ov_end = wpdSetFixed(p_overlapped_item.X + p_overlapped_item.W / 2);

            //This will check the overlapping item with hit item that which part of the item is overlapped. left,right, top or bottom.
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
        //Here we are find out if which part is overlapping and maintaining the position of the item.Example
        //if right side of the item is overlapping the right side of the item will be crushed and left side of the item will maintain same position.
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
        //setting the array with newly created details and pass it to calling place.
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
                    } else {
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
//This function is called from crushitem function. so find all the items that overlap on a specific item and try to find out how much to be crush so that the position
//of the item is not moved.
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
        //First find out all the items that hit the current item to be crushed.
        for (const item of p_shelf.ItemInfo) {
            if (l_cnt !== p_item_index) {
                var div_start = wpdSetFixed(item.X - item.W / 2),
                    div_end = wpdSetFixed(item.X + item.W / 2),
                    div_top = wpdSetFixed(item.Y + item.H / 2),
                    div_bottom = wpdSetFixed(item.Y - item.H / 2);
                if (!(item_top < div_bottom || item_bottom > div_top) && !(item_end < div_start || item_start > div_end)) {
                    itemHitArr.push(item);
                }
                l_cnt++;
            }
        }

        var shelf_start = wpdSetFixed(p_shelf.X - p_shelf.W / 2),
            shelf_end = wpdSetFixed(p_shelf.X + p_shelf.W / 2),
            shelf_bottom = wpdSetFixed(p_shelf.Y - p_shelf.H / 2),
            shelf_top = wpdSetFixed(p_shelf.Y + p_shelf.H / 2);
        //Check in current item is outside the chest in all sides.
        if (item_top > shelf_top || item_bottom < shelf_bottom || item_start <= shelf_start || item_end > shelf_end) {
            itemHitArr.push(p_shelf);
        }

        var [itemX, itemY, itemW, itemH] = [item_X, item_Y, item_width, item_height];
        var finalWidthCrushPerc = 0,
            finalHeightCrush = 0;
        for (ovpItem of itemHitArr) {
            // call the below function and find out what is the percentage of overlap and which side. so that only that much of item is crushed and item new XY will be set
            // so that item is maintaining same position.
            [itemX, itemY, itemW, itemH, itemWidthCrush, itemHeightCrush] = getChestOverlappedItemDimension(itemX, itemY, itemW, itemH, ovpItem);
            finalWidthCrushPerc += itemWidthCrush;
            finalHeightCrush += itemHeightCrush;
        }

        if (p_set_ind == "Y") {
            // check if total width and height crush perec is less than max crush perc. then set the items crush perc, H,W,X,Y
            if (finalWidthCrushPerc <= p_crush_width_perc && finalHeightCrush <= p_crush_height_perc && p_item_manual_wc_ind == "N" && p_item_manual_hc_ind == "N") {
                p_item.W = itemW;
                p_item.X = itemX;
                p_item.WChanged = "Y";
                if (p_actualWidth == "W") {
                    p_item.CrushHoriz = finalWidthCrushPerc;
                } else if (p_actualWidth == "H") {
                    p_item.CrushVert = finalWidthCrushPerc;
                } else if (p_actualWidth == "D") {
                    p_item.CrushD = finalWidthCrushPerc;
                }

                p_item.H = itemH;
                p_item.Y = itemY;
                p_item.HChanged = "Y";
                if (p_actualHeight == "H") {
                    p_item.CrushVert = finalHeightCrush;
                } else if (p_actualHeight == "W") {
                    p_item.CrushHoriz = finalHeightCrush;
                } else if (p_actualHeight == "D") {
                    p_item.CrushD = finalHeightCrush;
                }
                g_error_category = "";
                return "Y";
                //If manual crush is set to Y. the directly crush the item for the crush perc set by user.
            } else if (p_item_manual_wc_ind == "Y" || p_item_manual_hc_ind == "Y") {
                const manualWidth = wpdSetFixed(item_width - item_width * (p_crush_width_perc / 100));
                const manualHeight = wpdSetFixed(item_height - item_height * (p_crush_height_perc / 100));
                if (checkChestCrushedItemHit(p_item.X, p_item.Y, p_item_manual_wc_ind == "Y" ? manualWidth : item_width, p_item_manual_hc_ind == "Y" ? manualHeight : p_item.H, p_shelf, p_item_index) == "N") {
                    if (p_item_manual_wc_ind == "Y") {
                        p_item.W = manualWidth;
                        p_item.WChanged = "Y";
                        if (p_actualWidth == "W") {
                            p_item.CrushHoriz = p_crush_width_perc;
                        } else if (p_actualWidth == "H") {
                            p_item.CrushVert = p_crush_width_perc;
                        } else if (p_actualWidth == "D") {
                            p_item.CrushD = p_crush_width_perc;
                        }
                    }

                    if (p_item_manual_hc_ind == "Y") {
                        p_item.H = manualHeight;
                        p_item.HChanged = "Y";
                        if (p_actualHeight == "H") {
                            p_item.CrushVert = p_crush_height_perc;
                        } else if (p_actualHeight == "W") {
                            p_item.CrushHoriz = p_crush_height_perc;
                        } else if (p_actualHeight == "D") {
                            p_item.CrushD = p_crush_height_perc;
                        }
                    }
                    g_error_category = "";
                    return "Y";
                } else {
                    g_error_category = "W";
                    return "N";
                }
            } else {
                g_error_category = "";
                return "Y";
            }
        }
        g_error_category = "";
        return "Y";
    } catch (err) {
        error_handling(err);
    }
}

// When we have fixed divider in a shelf, hypothetically it means that the shelf is divided into multiple shelfs with. As we would have different available space
// for item on the left/right side of fixed divider or between fixed dividers. The below function will divide the shelf into parts and crush according to available space between
// fixed divider start/end points and shelf start/end points
function widthCrushItemWithFixedDivider(p_pog_index, p_moduleIndex, p_shelfIndex, p_itemIndex, p_setInd) {
    try {
        var returnValue = "Y";
        var pogShelf = g_pog_json[p_pog_index].ModuleInfo[p_moduleIndex].ShelfInfo[p_shelfIndex];
        var pogShelfItems = pogShelf.ItemInfo;
        var shelfStart = wpdSetFixed(pogShelf.X - pogShelf.W / 2);
        var shelfEnd = wpdSetFixed(pogShelf.X + pogShelf.W / 2);

        var partionedShelf = []; //This will hold the parts of the shelf
        var partShelfArr = [];
        var partItemArr = [];
        var prevDividerIndx = -1,
            shelfPartStart = -1,
            shelfPartEnd = -1;
        var i = 0,
            partIndx = 0;
        var itemCrushed = "N"; //ASA-1765 Issue 6

        for (item of pogShelfItems) {
            if (item.Fixed == "Y") {
                //item.Item == "DIVIDER" &&
                if (i == 0) {
                    shelfPartStart = wpdSetFixed(item.X + item.W / 2);
                    shelfPartEnd = shelfEnd;
                    partShelfArr.AvlSpace = shelfPartEnd - shelfPartStart;
                } else {
                    partShelfArr.ItemInfo = partItemArr;
                    partItemArr = [];
                    if (partIndx == 0 && partionedShelf.length == 0) {
                        shelfPartStart = shelfStart;
                        shelfPartEnd = wpdSetFixed(item.X - item.W / 2);
                        partShelfArr.AvlSpace = shelfPartEnd - shelfPartStart;
                        partionedShelf.push(partShelfArr);
                        partShelfArr = [];
                        partIndx++;
                    } else if (partIndx > 0) {
                        shelfPartStart = pogShelfItems[prevDividerIndx].X + pogShelfItems[prevDividerIndx].W / 2;
                        shelfPartEnd = wpdSetFixed(item.X - item.W / 2);
                        partShelfArr.AvlSpace = shelfPartEnd - shelfPartStart;
                        partionedShelf.push(partShelfArr);
                        partShelfArr = [];
                        partIndx++;
                    } else {
                        console.log(pogShelfItems, partionedShelf, partShelfArr, partItemArr);
                    }
                }
                prevDividerIndx = i;
            } else {
                item.IIndex = i;
                partItemArr.push(item);
            }
            //ASA-1765 Issue 3, added nvl(partShelfArr) !== 0
            if (i == pogShelfItems.length - 1) {
                //&& nvl(partShelfArr) !== 0) {
                if (!(item.Fixed == "Y")) {
                    //item.Item == "DIVIDER" &&
                    partShelfArr.ItemInfo = partItemArr;
                    shelfPartStart = wpdSetFixed(pogShelfItems[prevDividerIndx].X + pogShelfItems[prevDividerIndx].W / 2);
                    shelfPartEnd = shelfEnd;
                    partShelfArr.AvlSpace = shelfPartEnd - shelfPartStart;
                    partionedShelf.push(partShelfArr);
                    partShelfArr = [];
                    partItemArr = [];
                } else {
                    if (nvl(partShelfArr) !== 0) {
                        //ASA-1765 Issue 6
                        shelfPartEnd = wpdSetFixed(item.X - item.W / 2);
                        partShelfArr.AvlSpace = shelfPartEnd - shelfPartStart;
                        partionedShelf.push(partShelfArr);
                    }
                }
            }
            i++;
        }
        var j = 0;
        for (partShelf of partionedShelf) {
            var crush_item_ind = "N",
                crush_index_arr = [],
                crush_width_arr = [],
                crush_manual_arr = [];
            var new_crush_perc = 0;

            var new_avilable_space = 0;

            //if (returnValue !== "N") { //ASA-1765 Issue 6
            for (items of partShelf.ItemInfo) {
                var items_crush_width = 0;
                var orientation = items.Orientation;
                var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0);
                var manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == null || items.MHorizCrushed == "N" ? "N" : "Y";
                if (wActualWidth == "W") {
                    items_crush_width = manualCrush == "N" && items.CWPerc > 0 ? items.CWPerc : items.CrushHoriz;
                } else if (wActualWidth == "H") {
                    items_crush_width = manualCrush == "N" && items.CHPerc > 0 ? items.CHPerc : items.CrushVert;
                } else if (wActualWidth == "D") {
                    items_crush_width = manualCrush == "N" && items.CDPerc > 0 ? items.CDPerc : items.CrushD;
                }
                if (items.Fixed == "N" && items_crush_width > 0) {
                    crush_item_ind = "Y";
                    crush_index_arr.push(items.IIndex);
                    crush_width_arr.push(items.W);
                    crush_manual_arr.push(manualCrush);
                }
            }
            if (crush_item_ind == "Y") {
                crush_item_ind = "N";
                for (var c = 0; c < 100; c++) {
                    var new_item_sum = 0;
                    var new_width = 0;
                    var mcrush_ind = "N";
                    for (items of partShelf.ItemInfo) {
                        var items_crush_width = 0;
                        var orientation = items.Orientation;
                        var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(orientation, 0, 0, 0);
                        manualCrush = typeof items.MHorizCrushed == "undefined" || items.MHorizCrushed == null || items.MHorizCrushed == "N" ? "N" : "Y";
                        if (wActualWidth == "W") {
                            items_crush_width = manualCrush == "N" && items.CWPerc > 0 ? items.CWPerc : items.CrushHoriz;
                        } else if (wActualWidth == "H") {
                            items_crush_width = manualCrush == "N" && items.CHPerc > 0 ? items.CHPerc : items.CrushVert;
                        } else if (wActualWidth == "D") {
                            items_crush_width = manualCrush == "N" && items.CDPerc > 0 ? items.CDPerc : items.CrushD;
                        }

                        //ASA-1765 Issue 3, changed to c <= items_crush_width, was i <= items_crush_width
                        if (crush_index_arr.indexOf(items.IIndex) !== -1 && c <= items_crush_width) {
                            var real_width = typeof items.RW !== "undefined" && items.RW !== null ? items.RW : items.W;
                            if (manualCrush == "N") {
                                new_width = wpdSetFixed(real_width - real_width * (c / 100));
                                if (new_width >= wpdSetFixed(real_width - real_width * (items_crush_width / 100))) {
                                    new_item_sum += new_width;
                                    if (p_setInd == "Y") {
                                        pogShelf.ItemInfo[items.IIndex].W = new_width;
                                        if (wActualWidth == "W") {
                                            pogShelf.ItemInfo[items.IIndex].CrushHoriz = c;
                                        } else if (wActualWidth == "H") {
                                            pogShelf.ItemInfo[items.IIndex].CrushVert = c;
                                        } else if (wActualWidth == "D") {
                                            pogShelf.ItemInfo[items.IIndex].CrushD = c;
                                        }
                                    }
                                } else {
                                    new_item_sum += real_width;
                                }
                            } else if (manualCrush == "Y") {
                                mcrush_ind = items_crush_width > 0 ? "Y" : "N";
                                new_width = wpdSetFixed(real_width - real_width * (items_crush_width / 100));
                                new_item_sum += new_width;
                                if (p_setInd == "Y") {
                                    pogShelf.ItemInfo[items.IIndex].W = new_width;
                                    if (wActualWidth == "W") {
                                        pogShelf.ItemInfo[items.IIndex].CrushHoriz = items_crush_width;
                                    } else if (wActualWidth == "H") {
                                        pogShelf.ItemInfo[items.IIndex].CrushVert = items_crush_width;
                                    } else if (wActualWidth == "D") {
                                        pogShelf.ItemInfo[items.IIndex].CrushD = items_crush_width;
                                    }
                                }
                            }
                        } else {
                            new_item_sum += wpdSetFixed(items.W);
                        }
                        if (pogShelf.HorizGap > 0) {
                            new_item_sum += items.SpreadItem;
                        }
                    }
                    new_avilable_space = partShelf.AvlSpace - new_item_sum; //ASA-1765 Issue 3, was partionedShelf.AvlSpace
                    if (new_avilable_space >= 0) {
                        new_crush_perc = c;
                        if (c > 0 || mcrush_ind == "Y") {
                            crush_item_ind = "Y";
                            if (p_itemIndex !== -1 && crush_index_arr.indexOf(p_itemIndex) !== -1 && p_setInd == "Y") {
                                pogShelf.ItemInfo[p_itemIndex].WChanged = "Y";
                            }
                        }
                        break;
                    }
                }
                if (crush_item_ind == "N") {
                    var k = 0;
                    if (new_crush_perc > 0) {
                        for (const items of crush_index_arr) {
                            if (crush_manual_arr[k] == "N") {
                                pogShelf.ItemInfo[crush_index_arr[k]].W = crush_width_arr[k];
                                pogShelf.ItemInfo[crush_index_arr[k]].CrushHoriz = crush_horiz_arr[k];
                            }
                            k++;
                        }
                    }
                    if (itemCrushed !== "Y") {
                        //ASA-1765 Issue 6
                        g_error_category = "W";
                        returnValue = "N";
                    }
                } else {
                    g_error_category = "";
                    returnValue = "Y";
                    itemCrushed = "Y"; //ASA-1765 Issue 6
                }
            }
            //}
            j++;
        }
        return returnValue;
    } catch (err) {
        error_handling(err);
    }
}
