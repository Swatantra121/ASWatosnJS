
function getCombinationShelf(p_pog_index, p_ShelfName) {
    try {
        logDebug("function : getCombinationShelf; p_pog_index : " + p_pog_index + "; pShelfName : " + p_ShelfName, "S");
        var currCombinationIndex = -1,
            currShelfCombIndx = -1;
        if (typeof g_combinedShelfs !== "undefined" && g_combinedShelfs.length > 0) {
            if (g_combinedShelfs.length > 0) {
                var i = 0;
                for (combination of g_combinedShelfs) {
                    var j = 0;
                    for (shelf_info of combination) {
                        if (shelf_info.Shelf == p_ShelfName && shelf_info.PIndex == p_pog_index) {
                            currCombinationIndex = i;
                            currShelfCombIndx = j;
                            break;
                        }
                        j++;
                    }
                    if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                        break;
                    }
                    i++;
                }
            }
        }
        return [currCombinationIndex, currShelfCombIndx];
    } catch (err) {
        logDebug("function : getCombinationShelf", "E");
        error_handling(err);
    }
}


// ASA-1129, Start
//This function is used to find out from all the module which are the items which fall under the combine rules and can be combined to gether. this will set the
//g_combineShelfs array with each combine set of shelfs.
async function generateCombinedShelfs(p_pog_index, p_module_index, p_shelf_index, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_merge_items = "Y", p_calc_days_of_supply = "", p_get_combiedetails, p_depth_check = "N", p_check_Multi_Edit = "N") { // ASA-2041 issue 1 
    //ASA-1350 issue 6 add parameters
    try {
        logDebug("function : generateCombinedShelfs; p_pog_index : " + p_pog_index, "S");
        var activeCombines = [];
        var currShelf = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index];
        var currShelfStart = wpdSetFixed(currShelf.X - currShelf.W / 2);
        var currShelfEnd = wpdSetFixed(currShelf.X + currShelf.W / 2);
        var module_details = g_pog_json[p_pog_index].ModuleInfo;
        var CheckComb = [],
            currCombination = [],
            currCombArr = [];
        var sorto = {
            MIndex: "asc",
            X: "asc",
        };
        //This logic will only run for the shelf which is currently edit and Combine attr !== 'N'.
        if (currShelf.Combine !== "N" && (currShelf.ObjType == "SHELF" || currShelf.ObjType == "HANGINGBAR")) {
            var j = 0;
            var shelfFound = false;
            for (const Modules of module_details) {
                if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                    var k = 0;
                    for (const shelf_info of Modules.ShelfInfo) {
                        //Conditions to check for each shelf to combine are as follows
                        //1. Combine != 'N',
                        //2. all the shelfs should have same Object Type, same Y, H, Rotation, Slope, D.
                        //3. if checking from left the current shelf start should be same as previous shelf end.
                        //4. if checking from right. current shelf end shouldbe same as next shelf start.
                        let depthCheck = p_depth_check == "D" ? true : wpdSetFixed(currShelf.D) == wpdSetFixed(shelf_info.D);   // ASA-2041 issue 1 create condition
                        if (typeof shelf_info !== "undefined" && shelf_info.Combine !== "N" && shelf_info.ObjType == currShelf.ObjType && wpdSetFixed(currShelf.Y) == wpdSetFixed(shelf_info.Y) && wpdSetFixed(currShelf.H) == wpdSetFixed(shelf_info.H) && currShelf.Rotation == shelf_info.Rotation && currShelf.Slope == shelf_info.Slope && depthCheck) { // ASA-2041 issue 1 check condition
                            //ASA-1292
                            var compareShelf,
                                compShelfSt = -1,
                                compShelfEnd = -1;
                            //First take the start and end of the current shelf and previous shelf.
                            if (activeCombines.length > 0) {
                                compareShelf = activeCombines[activeCombines.length - 1];
                                compShelfSt = wpdSetFixed(activeCombines[activeCombines.length - 1].X - activeCombines[activeCombines.length - 1].W / 2);
                                compShelfEnd = wpdSetFixed(activeCombines[activeCombines.length - 1].X + activeCombines[activeCombines.length - 1].W / 2);
                            } else {
                                compareShelf = currShelf;
                                compShelfSt = currShelfStart;
                                compShelfEnd = currShelfEnd;
                            }
                            //take start and end of current shelf.
                            var shelfStart = wpdSetFixed(shelf_info.X - shelf_info.W / 2);
                            var shelfEnd = wpdSetFixed(shelf_info.X + shelf_info.W / 2);

                            // we consider the current shelf is combine only when it matches the shelf start and shelf end. based on Combine setting.
                            if (shelf_info.Combine == "R" && (compareShelf.Combine == "B" || compareShelf.Combine == "L") && shelfEnd == compShelfSt) {
                                shelfFound = true;
                            } else if (shelf_info.Combine == "L" && (compareShelf.Combine == "B" || compareShelf.Combine == "R") && shelfStart == compShelfEnd) {
                                shelfFound = true;
                            } else if (shelf_info.Combine == "B" && ((compareShelf.Combine == "R" && shelfStart == compShelfEnd) || (compareShelf.Combine == "L" && shelfEnd == compShelfSt) || (compareShelf.Combine == "B" && (shelfStart == compShelfEnd || shelfEnd == compShelfSt)))) {
                                shelfFound = true;
                            }
                            else if (shelf_info.Combine == "B" && compareShelf.Combine == "B" && p_check_Multi_Edit == "Y" && shelf_info.PIndex == compareShelf.PIndex) { shelfFound = true; } //ASA-2041 issue 6 

                            if (shelfFound) {
                                // || shelf_info.Shelf == currShelf.Shelf) {
                                var dtls = {};
                                dtls["PIndex"] = p_pog_index;
                                dtls["MIndex"] = j;
                                dtls["SIndex"] = k;
                                dtls["Shelf"] = shelf_info.Shelf;
                                dtls["ObjType"] = shelf_info.ObjType;
                                dtls["Combine"] = shelf_info.Combine;
                                dtls["SpreadItem"] = shelf_info.SpreadItem;
                                dtls["AllowAutoCrush"] = shelf_info.AllowAutoCrush; //ASA=1307
                                dtls["SObjID"] = shelf_info.SObjID;
                                dtls["MObjID"] = Modules.MObjID;
                                dtls["Module"] = Modules.Module;
                                dtls["X"] = shelf_info.X;
                                dtls["Y"] = shelf_info.Y;
                                dtls["W"] = shelf_info.W;
                                dtls["H"] = shelf_info.H;
                                dtls["Slope"] = shelf_info.Slope;
                                dtls["Rotation"] = shelf_info.Rotation;
                                activeCombines.push(dtls);
                                shelfFound = false;
                            }
                        }
                        k++;
                    }
                }
                j++;
            }
        }
        var curr_comb_index = -1;
        var deleteCombine = false;
        //if the current shelf was not set to Combine !== 'N' then we need to check the current combine if that shelf exists or not and reset the combination.
        //Because there could be case when the shelf dimension or Combine attr is changed and that shelf no more pass the conditions.
        if (activeCombines.length == 0) {
            var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, currShelf.Shelf);
            //if the current shelf exists in combination. then start the validations of combine shelf again for the combination set of shelfs.
            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                curr_comb_index = currCombinationIndex;
                currCombination = g_combinedShelfs[currCombinationIndex];
                //This is the
                CheckComb = JSON.parse(JSON.stringify(currCombination));
                var currShelfCombination = g_combinedShelfs[currCombinationIndex][currShelfCombIndx];
                var currCombShelf = g_pog_json[currShelfCombination.PIndex].ModuleInfo[currShelfCombination.MIndex].ShelfInfo[currShelfCombination.SIndex];

                currCombination.splice(currShelfCombIndx, 1);
                currCombination.keySort(sorto);
                //if removing the current shelf the currcombination is left with single shelf. then delete that from g_combineShelfs array.
                if (currCombination.length < 2) {
                    deleteCombine = true;
                } else if (currCombination.length > 2) {
                    //if there are more than one shelf then start checking.
                    g_combinedShelfs.splice(currCombinationIndex, 1);
                    var c = 0;
                    var spilceSorto = {
                        SubCombIndex: "desc",
                    };
                    for (obj of currCombination) {
                        var mainShelf = currCombination[c];
                        var compShelf = currCombination[c + 1];
                        if (typeof compShelf == "undefined") {
                            break;
                        }
                        var mainShelfEnd = wpdSetFixed(mainShelf.X + mainShelf.W / 2);
                        var compShelfStart = wpdSetFixed(compShelf.X - compShelf.W / 2);
                        var mainPogShelf = g_pog_json[mainShelf.PIndex].ModuleInfo[mainShelf.MIndex].ShelfInfo[mainShelf.SIndex];
                        var compPogShelf = g_pog_json[compShelf.PIndex].ModuleInfo[compShelf.MIndex].ShelfInfo[compShelf.SIndex];
                        //Conditions to check for each shelf to combine are as follows
                        //1. Combine != 'N',
                        //2. all the shelfs should have same Object Type, same Y, H, Rotation, Slope, D.
                        //3. if checking from left the current shelf start should be same as previous shelf end.
                        //4. if checking from right. current shelf end shouldbe same as next shelf start.
                        if (typeof currCombination[c].CanCombine == "undefined") {
                            currCombination[c].CanCombine = false;
                            currCombination[c + 1].CanCombine = false;
                        }
                        //we are checking current shelf with next shelf. we the condition fails. we set CanCombine = false for next shelf. b
                        //but still maintain value of CanCombine of current shelf. because its already set when previous shelf loop ran.
                        if (!(mainShelfEnd == compShelfStart && ((mainPogShelf.Combine == "R" && (compPogShelf.Combine == "B" || compPogShelf.Combine == "L")) || (mainPogShelf.Combine == "B" && (compPogShelf.Combine == "L" || compPogShelf.Combine == "B"))))) {
                            currCombination[c].CanCombine = currCombination[c].CanCombine ? currCombination[c].CanCombine : false;
                            currCombination[c].SubCombIndex = currCombination[c].CanCombine ? currCombination[c].SubCombIndex : -1;
                            currCombination[c + 1].CanCombine = false;
                            currCombination[c + 1].SubCombIndex = -1;
                        } else {
                            if (typeof currCombination[c].CanCombine !== "undefined" && currCombination[c].CanCombine) {
                                currCombination[c + 1].CanCombine = true;
                                currCombination[c + 1].SubCombIndex = currCombination[c].SubCombIndex;
                            } else {
                                currCombination[c].CanCombine = true;
                                currCombination[c].SubCombIndex = c;
                                currCombination[c + 1].CanCombine = true;
                                currCombination[c + 1].SubCombIndex = c;
                            }
                        }
                        c++;
                    }
                    currCombination.keySort(spilceSorto);
                    var x = 0;
                    var currIndex = -1,
                        prevIndex = -1,
                        afterSplicecomb = [],
                        finalCombArr = [];
                    //after check from CanCombine flag. now take all the array with CanCombine true and push into finalCombArr.
                    for (comb of currCombination) {
                        currIndex = currCombination[x].SubCombIndex;
                        if (prevIndex !== currIndex && afterSplicecomb.length !== 0) {
                            finalCombArr.push(afterSplicecomb);
                            afterSplicecomb = [];
                        }
                        //This shelf which is pushed into afterSplicecomb array means this shelf can be combined.
                        if (currCombination[x].CanCombine && currCombination[x].SubCombIndex !== -1) {
                            afterSplicecomb.push(comb);
                        }
                        prevIndex = currCombination[x].SubCombIndex;
                        x++;
                    }
                    if (afterSplicecomb.length !== 0) {
                        finalCombArr.push(afterSplicecomb);
                    }
                    //Now set all other attrbutes needed for that set of combine shelf as below.
                    for (currArr of finalCombArr) {
                        currArr.keySort(sorto);
                        currArr.SpreadItem = currArr[0].SpreadItem;
                        currArr.AllowAutoCrush = currArr[0].AllowAutoCrush;
                        var startArray = [],
                            endArray = [];
                        for (shelf_info of currArr) {
                            var shelfDtl = g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex];
                            var shelfStart = wpdSetFixed(shelfDtl.X - shelfDtl.W / 2);
                            var shelfEnd = wpdSetFixed(shelfDtl.X + shelfDtl.W / 2);
                            startArray.push(shelfStart);
                            endArray.push(shelfEnd);
                            for (item of shelfDtl.ItemInfo) {
                                item.Fixed = "N";
                            }
                        }
                        var combinedStart = Math.min(...startArray);
                        var combinedEnd = Math.max(...endArray);
                        currArr["Start"] = combinedStart;
                        currArr["End"] = combinedEnd;
                        var spliceCombinationIndex = g_combinedShelfs.length;
                        g_combinedShelfs.push(currArr);
                        //after added new set of combine shelf and its attributes. set all the items from all shelfs into one tag ItemInfo inside that set of combination..
                        await setCombinedShelfItems(p_pog_index, spliceCombinationIndex, -1, -1, "N", "N", -1, -1, []); //ASA-1329
                        //Note: we try to reorder combine items based on there spread product and recreate all the combine shelfs.
                        for (shelf_info of currArr) {
                            var shelf = g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex];
                            if (reorder_items(shelf.MIndex, shelf.SIndex, p_pog_index)) {
                                var return_val = await recreate_all_items(shelf.MIndex, shelf.SIndex, shelf.ObjType, "Y", -1, -1, shelf.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, p_calc_days_of_supply, p_pog_index, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_merge_items); //ASA-1350 issue 6 added parameters
                            }
                        }
                    }
                } else {
                    //This condition will come when currCombination length is exactly 2.
                    var mainShelf = currCombination[0];
                    var compShelf = currCombination[1];
                    var mainShelfEnd = wpdSetFixed(mainShelf.X + mainShelf.W / 2);
                    var compShelfStart = wpdSetFixed(compShelf.X - compShelf.W / 2);
                    var mainShelfCombine = mainShelf.Combine;
                    var compShelfCombine = compShelf.Combine;
                    //Now we check if all the combine rules pass or not. if not then delete the whole combine set from g_combineShelfs.
                    if (!(mainShelfEnd == compShelfStart && ((mainShelfCombine == "R" && (compShelfCombine == "B" || compShelfCombine == "L")) || (mainShelfCombine == "B" && (compShelfCombine == "L" || compShelfCombine == "B"))))) {
                        deleteCombine = true;
                    }
                }
                //if delete combine. we set Combine attr to N and reorder items and recreate_all_items which will reset the shelfs and place items based on each shelf.
                if (deleteCombine) {
                    for (shelfs of g_combinedShelfs[currCombinationIndex]) {
                        var shelf = g_pog_json[shelfs.PIndex].ModuleInfo[shelfs.MIndex].ShelfInfo[shelfs.SIndex];
                        if (reorder_items(shelf.MIndex, shelf.SIndex, p_pog_index)) {
                            shelf.Combine = "N";
                            var return_val = await recreate_all_items(shelf.MIndex, shelf.SIndex, shelf.ObjType, "Y", -1, -1, shelf.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, p_calc_days_of_supply, p_pog_index, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_merge_items); //ASA-1350 issue 6 added parameters
                        }
                    }
                    //remove the combine shelfs from combine array.
                    g_combinedShelfs.splice(currCombinationIndex, 1);
                }
            }
        }

        var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, currShelf.Shelf);
        //if activeCombines length > 0. that means the current shelf which is edited has satisfied the combine condition new set of combine shelfs list is created
        //together with combine shelf .
        if (activeCombines.length > 0 && currCombinationIndex == -1 && currShelfCombIndx == -1) {
            var activeCombinations = [],
                newCombinationIndex = -1;
            var dtls = {};
            //populate the details of the current shelf as it has passed the combine validation.
            dtls["PIndex"] = p_pog_index;
            dtls["MIndex"] = p_module_index;
            dtls["SIndex"] = p_shelf_index;
            dtls["Shelf"] = currShelf.Shelf;
            dtls["ObjType"] = currShelf.ObjType;
            dtls["Combine"] = currShelf.Combine;
            dtls["SpreadItem"] = currShelf.SpreadItem;
            dtls["AllowAutoCrush"] = currShelf.AllowAutoCrush;
            dtls["SObjID"] = currShelf.SObjID;
            dtls["MObjID"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].MObjID;
            dtls["Module"] = g_pog_json[p_pog_index].ModuleInfo[p_module_index].Module;
            dtls["X"] = currShelf.X;
            dtls["Y"] = currShelf.Y;
            dtls["W"] = currShelf.W;
            dtls["H"] = currShelf.H;
            dtls["Slope"] = currShelf.Slope;
            dtls["Rotation"] = currShelf.Rotation;
            //find if the shelfs in the activeCombines are already in the g_combineShelfs array. then find them and take them separately.
            for (shelf_info of activeCombines) {
                var [actCombIndx, actShelfCombIndx] = getCombinationShelf(p_pog_index, shelf_info.Shelf);
                if (actCombIndx !== -1 && actShelfCombIndx !== -1) {
                    activeCombinations.push(actCombIndx);
                }
            }
            //if there are shelfs already exists in the activeCombines list. then push all existing shelfs together with new shelf which has passed validation now.
            if (activeCombinations.length > 0) {
                var firstCombIndx = activeCombinations[0];
                g_combinedShelfs[firstCombIndx].push(dtls);
                if (activeCombinations.length > 1) {
                    for (combIndx of activeCombinations) {
                        if (combIndx !== firstCombIndx) {
                            for (actShelf of g_combinedShelfs[combIndx]) {
                                g_combinedShelfs[firstCombIndx].push(actShelf);
                                g_combinedShelfs.splice(actShelf, 1);
                            }
                        }
                    }
                }
                g_combinedShelfs[firstCombIndx].keySort(sorto);
                g_combinedShelfs[firstCombIndx].SpreadItem = g_combinedShelfs[firstCombIndx][0].SpreadItem;
                g_combinedShelfs[firstCombIndx].AllowAutoCrush = g_combinedShelfs[firstCombIndx][0].AllowAutoCrush;
                newCombinationIndex = firstCombIndx;
            } else {
                //This means the shelfs added in activeCombines are all new shels and does not exists in g_combineShelfs array already.
                activeCombines.push(dtls);
                activeCombines = activeCombines.filter((v, i, a) => a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i); // ASA-1157
                activeCombines.keySort(sorto);
                activeCombines.SpreadItem = activeCombines[0].SpreadItem;
                activeCombines.AllowAutoCrush = activeCombines[0].AllowAutoCrush;
                g_combinedShelfs.push(activeCombines);
                newCombinationIndex = g_combinedShelfs.length - 1;
            }
            var startArray = [],
                endArray = [];
            //after getting all active combinations and setting g_combinedShelfs. now set all the necessary attr.
            for (shelf_info of g_combinedShelfs[newCombinationIndex]) {
                // var shelfDtl = g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex]; //ASA_2023-task-2
                var shelfDtl = (g_pog_json && g_pog_json[shelf_info.PIndex] && g_pog_json[shelf_info.PIndex].ModuleInfo && g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex] && g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex].ShelfInfo) ? g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex] : undefined;
                if (typeof shelfDtl === "undefined") {
                    logDebug("Warning: missing shelfDtl in generateCombinedShelfs (newCombinationIndex loop) for shelf: " + JSON.stringify(shelf_info), "W");
                    continue;
                }
                //ASA_2023-task-2
                var shelfStart = wpdSetFixed(shelfDtl.X - shelfDtl.W / 2);
                var shelfEnd = wpdSetFixed(shelfDtl.X + shelfDtl.W / 2);
                startArray.push(shelfStart);
                endArray.push(shelfEnd);
                //ASA_2023-task-2
                // for (item of shelfDtl.ItemInfo) {
                //     item.Fixed = "N";

                if (Array.isArray(shelfDtl.ItemInfo)) {
                    for (item of shelfDtl.ItemInfo) {
                        item.Fixed = "N";
                    }
                }
                //ASA_2023-task-2
            }
            var combinedStart = Math.min(...startArray);
            var combinedEnd = Math.max(...endArray);
            g_combinedShelfs[newCombinationIndex]["Start"] = combinedStart;
            g_combinedShelfs[newCombinationIndex]["End"] = combinedEnd;
            //this will set an ItemInfo tag for each combination set with all the items in all the shelfs.
            await setCombinedShelfItems(p_pog_index, newCombinationIndex, -1, -1, "N", "N", -1, -1, []); //ASA-1329
        }
        //below currCombArr is set to make those combine shelfs to be recreated with new details.
        if (g_combinedShelfs.length > 0 && typeof newCombinationIndex !== "undefined" && newCombinationIndex !== -1) {
            //ASA-1157
            currCombArr = JSON.parse(JSON.stringify(g_combinedShelfs[newCombinationIndex]));
        } else if (currCombination.length > 0) {
            currCombArr = JSON.parse(JSON.stringify(currCombination));
            var newCombinationIndex = curr_comb_index;
            if (!deleteCombine) {
                g_combinedShelfs[curr_comb_index].Start = wpdSetFixed(g_combinedShelfs[curr_comb_index][0].X - g_combinedShelfs[curr_comb_index][0].W / 2);
                g_combinedShelfs[curr_comb_index].End = wpdSetFixed(g_combinedShelfs[curr_comb_index][g_combinedShelfs[curr_comb_index].length - 1].X + g_combinedShelfs[curr_comb_index][g_combinedShelfs[curr_comb_index].length - 1].W / 2);
            }
        }
        //This condition means the current shelf is available in some combination set in g_combinedShelfs and currCombArr is the array created above with new details
        // so we need to recreate the shelfs are removed from combine. to make items reset into there respective shelfs.
        if (CheckComb.length > 0 && currCombArr.length > 0) {
            if (!deleteCombine) {
                await setCombinedShelfItems(p_pog_index, newCombinationIndex, -1, -1, "N", "N", -1, -1, []); //ASA-1329
            }
            if (currCombArr.length > 1) {
                //looping the old combination of shelf before it was reset. CheckComb is actually array which was JSON.parse(JSON.stringify.)
                for (var i = 0; i < CheckComb.length; i++) {
                    //take the first shelf details and pass to reorder_items and recreate_all_items so that it will recreate all combine shelfs.
                    var mainShelf = CheckComb[i];
                    // if (currShelf.SObjID !== mainShelf.SObjID) {
                    var j = 0;
                    var recreate = true;
                    //check how many shelfs are removed from new set of combine comparing with old combine set of shelfs and recreate those.
                    for (shelf_info of currCombArr) {
                        if (shelf_info.SObjID == mainShelf.SObjID) {
                            recreate = false;
                        }
                        j++;
                    }
                    // the shelf which was removed from combine to be individually recreated as below.
                    if (recreate) {
                        [mod_ind, shelf_ind] = get_shelf_index(mainShelf.SObjID, mainShelf.PIndex);
                        if (mod_ind !== -1) {
                            var shelf_info = g_pog_json[mainShelf.PIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind];
                            if (shelf_info.ItemInfo.length > 0) {
                                shelf_info.Combine = "N";
                                if (reorder_items(mod_ind, shelf_ind, mainShelf.PIndex)) {
                                    var return_val = await recreate_all_items(mod_ind, shelf_ind, mainShelf.ObjType, "Y", -1, -1, shelf_info.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, p_calc_days_of_supply, mainShelf.PIndex, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_merge_items); //ASA-1350 issue 6 added parameters
                                }
                            }
                        }
                    }
                }
            } else {
                //if (recreate) {
                //currCombArr will have all active combination of shelf with the current shelf which was edited. so recreate all those newly created combination shelfs.
                [mod_ind, shelf_ind] = get_shelf_index(currCombArr[0].SObjID, currCombArr[0].PIndex);
                if (mod_ind !== -1) {
                    var shelf_info = g_pog_json[currCombArr[0].PIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind];
                    if (shelf_info.ItemInfo.length > 0) {
                        if (reorder_items(mod_ind, shelf_ind, currCombArr[0].PIndex)) {
                            shelf_info.Combine = "N";
                            var return_val = await recreate_all_items(mod_ind, shelf_ind, currCombArr[0].ObjType, "Y", -1, -1, shelf_info.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, p_calc_days_of_supply, currCombArr[0].PIndex, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_merge_items); //ASA-1350 issue 6 added parameters
                        }
                    }
                }
                //}
            }
        } else {
            //if there was not change in the combination of current shelfs. we loop all the Shelfs and update there basic attributes which are necessary.
            var [currCombinationIndex, currShelfCombIndx] = getCombinationShelf(p_pog_index, currShelf.Shelf);
            if (currCombinationIndex !== -1 && currShelfCombIndx !== -1) {
                var module_details = g_pog_json[g_combinedShelfs[currCombinationIndex][0].PIndex].ModuleInfo;
                var mod_ind = -1,
                    shelf_ind = -1;
                $.each(module_details, function (j, Modules) {
                    if (shelf_ind > -1) {
                        return false;
                    }
                    if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                        $.each(Modules.ShelfInfo, function (k, Shelf) {
                            if (shelf_ind > -1) {
                                return false;
                            }
                            if (typeof Shelf !== "undefined") {
                                if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                                    if (Shelf.SObjID == g_combinedShelfs[currCombinationIndex][0].SObjID) {
                                        mod_ind = j;
                                        shelf_ind = k;
                                        return false;
                                    }
                                }
                            }
                        });
                    }
                });
                if (mod_ind !== -1 && shelf_ind !== -1) {
                    var shelf_info = g_pog_json[g_combinedShelfs[currCombinationIndex][0].PIndex].ModuleInfo[mod_ind].ShelfInfo[shelf_ind];
                    g_combinedShelfs[currCombinationIndex].SpreadItem = shelf_info.SpreadItem;
                    g_combinedShelfs[currCombinationIndex].AllowAutoCrush = shelf_info.AllowAutoCrush;
                    g_combinedShelfs[currCombinationIndex][currShelfCombIndx].SpreadItem = shelf_info.SpreadItem; //ASA-1386 Issue 7A
                    g_combinedShelfs[currCombinationIndex][currShelfCombIndx].AllowAutoCrush = shelf_info.AllowAutoCrush; //ASA-1386 Issue 7A
                }
            }
            //recreate the current shelf in case nothing happned and need to reset all the items to keep them without combine.
            //Note: we can add a check from above code that if this shelf was combined before and now it was removed from combine then recreate. so we no need to recreate
            //all shelfs everytime we call this function.
            if (reorder_items(p_module_index, p_shelf_index, p_pog_index)) {
                var return_val = await recreate_all_items(p_module_index, p_shelf_index, currShelf.ObjType, "Y", -1, -1, currShelf.ItemInfo.length, "N", "N", -1, -1, g_start_canvas, p_calc_days_of_supply, p_pog_index, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_merge_items); //ASA-1350 issue 6 added parameters
            }
        }
        //This is a variable which will be stored in the DB as g_combineShelfs array format is not suitable to store in the json in table.
        //we use this GenrateCombineS and recreate g_combineShelfs array when getting json from table after mass update.
        if (p_get_combiedetails != "N") {
            g_pog_json[p_pog_index].GenrateCombineS = get_combine_arr(); //ASA-1353 issue 2;
        }
    } catch (err) {
        logDebug("function : generateCombinedShelfs", "E");
        error_handling(err);
    }
}

//This function is used to return the current position of item. that means after getting new x axis. which shelf should this be moved in the set of combine shelfs.
function updateCombinedItemInfo(p_pog_index, p_module_index, p_shelf_index, p_itemX, p_combo_index) {
    try {
        logDebug("function : updateCombinedItemInfo; p_pog_index : " + p_pog_index + "; pModuleIndex : " + p_module_index + "; pShelfIndex : " + p_shelf_index + "; pItemX : " + p_itemX + "; pCombIndx : " + p_combo_index, "S");
        var combinationShelfs = g_combinedShelfs[p_combo_index];
        var currModIndx, currShlfIndx, currShelf, currShelfStart, currShelfEnd;
        for (shelf_info of combinationShelfs) {
            currModIndx = shelf_info.MIndex;
            currShlfIndx = shelf_info.SIndex;
            currShelf = g_pog_json[p_pog_index].ModuleInfo[currModIndx].ShelfInfo[currShlfIndx];
            currShelfStart = currShelf.X - currShelf.W / 2;
            currShelfEnd = currShelf.X + currShelf.W / 2;
            if (p_itemX > currShelfStart && p_itemX <= currShelfEnd) {
                return [currModIndx, currShlfIndx];
            }
        }
        return [p_module_index, p_shelf_index];
    } catch (err) {
        logDebug("function : updateCombinedItemInfo", "E");
        error_handling(err);
    }
}

//This function is used to shuffle all the items in the group of combine shelfs.
//it will find the new shelf and move the iteminfo to the new ShelfInfo based on the Xaxis and also set ItemInfo tag for that combination with all the items in all the shelfs.
async function setCombinedShelfItems(p_pog_index, p_combinationIndex, p_currShelfCombIndx, p_locationX, p_edit_ind, p_shelf_edit, p_redo_x, p_edit_item_index, p_drag_details, p_paste_multi_Item = "N") {////ASA-2029  Issue4 Case(c)
    try {
        logDebug("function : setCombinedShelfItems; p_pog_index : " + p_pog_index + "; pCombinationIndex : " + p_combinationIndex + "; pCurrShelfCombIndx : " + p_currShelfCombIndx + "; pLocationX : " + p_locationX, "S");
        //g_combineItemModf = []; //Task_27808
        const spread_product = g_combinedShelfs[p_combinationIndex].SpreadItem;
        var combinationShelfs = JSON.parse(JSON.stringify(g_combinedShelfs[p_combinationIndex]));
        combinationShelfs["SpreadItem"] = spread_product;

        var currModIndx,
            currShlfIndx,
            currShelf,
            items_arr = [],
            newModIndex,
            newShlfIndex;

        var sorto = {
            NewMIndex: "asc",
            NewSIndex: "asc",
            OldMIndex: "asc",
            OldSIndex: "asc",
            OldIIndex: "asc",
            X: "asc",
        };
        //we use TransferItem tag to mark which item to be moved. so we set it to N at the begining.
        for (obj of g_combineItemModf) {
            //Task_27808
            obj.TransferItem = "N";
        }
        var horiz_gap;

        //if spread product = 'R' then we have to loop reverse.
        if (spread_product == "R") {
            combinationShelfs = combinationShelfs.reverse();
        }
        await set_shelf_item_index(p_pog_index);
        var i = 0;

        //first take all the items in all the shelfs an populate ItemInfo tag for that combination.
        for (combination of g_combinedShelfs) {
            var item_details = [];
            for (shelf_info of combination) {
                if (p_pog_index == shelf_info.PIndex) {
                    //ASA-1443
                    var items_arr = g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo;
                    item_details = item_details.concat(items_arr);
                }
            }
            var sorto = {
                MIndex: "asc",
                SIndex: "asc",
                X: "asc",
            };
            p_paste_multi_Item == "N" && item_details.keySort(sorto); //ASA-2029  Issue4 Case(c)

            if (item_details.length > 0) {
                //ASA-1507 #3
                g_combinedShelfs[i].ItemInfo = item_details;
            }
            i++;
        }

        for (shelf_info of combinationShelfs) {
            currModIndx = shelf_info.MIndex;
            currShlfIndx = shelf_info.SIndex;
            currShelf = g_pog_json[p_pog_index].ModuleInfo[currModIndx].ShelfInfo[currShlfIndx];
            horiz_gap = currShelf.HorizGap;
            items_arr = g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo;
            var item_cnt = items_arr.length;
            var itemX = -1;
            if (spread_product == "R") {
                for (var i = items_arr.length - 1; i >= 0; i--) {
                    item_cnt = item_cnt - 1;
                    itemX = get_item_xaxis(items_arr[i].W, items_arr[i].H, items_arr[i].D, currShelf.ObjType, p_locationX, horiz_gap, spread_product, horiz_gap, currModIndx, currShlfIndx, item_cnt, p_edit_ind, g_pog_json[p_pog_index].ModuleInfo[currModIndx].ShelfInfo[currShlfIndx].ItemInfo.length, p_shelf_edit, p_pog_index);
                    //This below will find the new module and shelf index where this item should be moved and that will be stored in an array.
                    [newModIndex, newShlfIndex] = updateCombinedItemInfo(p_pog_index, currModIndx, currShlfIndx, itemX, p_combinationIndex);
                    items_arr[i].OldX = items_arr[i].X; //ASA-2041 issue 3 // ASA-2041: Shifted OldX & X update before transfer check to ensure correct position tracking for all items.
                    items_arr[i].X = itemX; //ASA-2041 issue 3
                    //we first get the new x axis based on its spread product setting for combination and then check if that item will be part of that shelf which it was
                    //before. then mark TransferItem = 'Y'
                    if (!(newModIndex == currModIndx && newShlfIndex == currShlfIndx)) {
                        // items_arr[i].OldX = items_arr[i].X; //ASA-1329   2041 issue 3  
                        // items_arr[i].X = itemX; //ASA-1329 2041 issue 3 
                        var info = {};
                        info["NewMIndex"] = newModIndex;
                        info["NewSIndex"] = newShlfIndex;
                        info["OldMIndex"] = currModIndx;
                        info["OldSIndex"] = currShlfIndx;
                        info["OldIIndex"] = i;
                        info["OldObjID"] = items_arr[i].ObjID;
                        info["TransferItem"] = "Y"; //Task_27808
                        g_combineItemModf.push(info);
                    }
                }
            } else {
                var i = 0;
                for (const items of items_arr) {
                    if (p_redo_x !== -1 && i == p_edit_item_index) {
                        itemX = p_redo_x;
                    } else {
                        itemX = get_item_xaxis(items.W, items.H, items.D, currShelf.ObjType, p_locationX, horiz_gap, spread_product, horiz_gap, currModIndx, currShlfIndx, i, p_edit_ind, g_pog_json[p_pog_index].ModuleInfo[currModIndx].ShelfInfo[currShlfIndx].ItemInfo.length, p_shelf_edit, p_pog_index);
                    }
                    items.OldX = items.X;
                    items.X = itemX;
                    //This below will find the new module and shelf index where this item should be moved and that will be stored in an array.
                    [newModIndex, newShlfIndex] = updateCombinedItemInfo(p_pog_index, currModIndx, currShlfIndx, itemX, p_combinationIndex);
                    //we first get the new x axis based on its spread product setting for combination and then check if that item will be part of that shelf which it was
                    //before. then mark TransferItem = 'Y'
                    if (!(newModIndex == currModIndx && newShlfIndex == currShlfIndx)) {
                        var info = {};
                        info["NewMIndex"] = newModIndex;
                        info["NewSIndex"] = newShlfIndex;
                        info["OldMIndex"] = currModIndx;
                        info["OldSIndex"] = currShlfIndx;
                        info["OldIIndex"] = i;
                        info["OldObjID"] = currShelf.ItemInfo[i].ObjID;
                        info["TransferItem"] = "Y"; //Task_27808
                        g_combineItemModf.push(info);
                    }
                    i++;
                }
            }
        }
        g_combineItemModf.keySort(sorto);
        //Now loop the array with all the details of items to be moved to other shelfs.
        for (modf of g_combineItemModf) {
            if (modf.TransferItem == "Y") {
                //Task_27808
                var min_distance_arr = [],
                    min_index_arr = [],
                    itemInfo = [];

                for (obj of g_pog_json[p_pog_index].ModuleInfo[modf.OldMIndex].ShelfInfo[modf.OldSIndex].ItemInfo) {
                    if (modf.OldObjID == obj.ObjID) {
                        itemInfo = obj;
                        break;
                    }
                }

                if (typeof itemInfo !== "undefined") {
                    var i = 0;
                    //finding the items to next the current item has to be placed.
                    for (const items of g_pog_json[p_pog_index].ModuleInfo[modf.NewMIndex].ShelfInfo[modf.NewSIndex].ItemInfo) {
                        if (spread_product !== "R") {
                            if (items.X < itemInfo.X) {
                                min_distance_arr.push(itemInfo.X - items.X);
                                min_index_arr.push(i);
                            }
                        } else {
                            if (items.X > itemInfo.X) {
                                min_distance_arr.push(items.X - itemInfo.X);
                                min_index_arr.push(i);
                            }
                        }

                        i++;
                    }
                    var min_distance = Math.min.apply(Math, min_distance_arr);
                    var index = min_distance_arr.findIndex(function (number) {
                        return number == min_distance;
                    });
                    if (min_distance_arr.length > 0) {
                        var upd_item_index = spread_product !== "R" ? min_index_arr[index] + 1 : min_index_arr[index] - 1;
                        if (spread_product == "R" && upd_item_index == -1) {
                            upd_item_index = 0;
                        }
                    } else {
                        var upd_item_index = 0;
                    }
                    itemInfo.MIndex = modf.NewMIndex;
                    itemInfo.SIndex = modf.NewSIndex;
                    itemInfo.IIndex = upd_item_index;
                    if (typeof p_drag_details !== "undefined" && p_drag_details !== null && p_drag_details.length > 0) {
                        //ASA-1329 added beacuse if the item added is splice to new postion by this function then we need to update the MIndex,SIndex, item index and use this value outside to update the new values
                        if (p_drag_details[0].MIndex == modf.OldMIndex && p_drag_details[0].SIndex == modf.OldSIndex && p_drag_details[0].IIndex == modf.OldIIndex && p_drag_details[0].Iobjid == modf.OldObjID) {
                            p_drag_details[0].MIndex = modf.NewMIndex;
                            p_drag_details[0].SIndex = modf.NewSIndex;
                            p_drag_details[0].IIndex = upd_item_index;
                        }
                    } //ASA1329
                    //move the itemInfo to new shelf as below.
                    g_pog_json[p_pog_index].ModuleInfo[modf.NewMIndex].ShelfInfo[modf.NewSIndex].ItemInfo.splice(upd_item_index, 0, itemInfo);
                }
            }
        }
        //loop those same setup array and remove the itemInfo from old shelfs.
        for (modf of g_combineItemModf) {
            var objId = modf.OldObjID;
            var itemInfo = g_pog_json[p_pog_index].ModuleInfo[modf.OldMIndex].ShelfInfo[modf.OldSIndex].ItemInfo; //ASA-1329 issue1
            if (typeof itemInfo !== "undefined" && modf.TransferItem == "Y") {
                //Task_27808
                for (var i = 0; i < itemInfo.length; i++) {
                    if (objId == itemInfo[i].ObjID) {
                        itemInfo.splice(i, 1);
                    }
                }
            }
        }
        await set_shelf_item_index(p_pog_index);
        var i = 0;
        //now reset the ItemInfo tag for the combination on the current shelf and populate all the items based on the new setup done.
        for (combination of g_combinedShelfs) {
            var item_details = [];
            for (shelf_info of combination) {
                if (p_pog_index == shelf_info.PIndex) {
                    //ASA-1443
                    var items_arr = g_pog_json[shelf_info.PIndex].ModuleInfo[shelf_info.MIndex].ShelfInfo[shelf_info.SIndex].ItemInfo;
                    item_details = item_details.concat(items_arr);
                    var l_item = 0; //ASA-1466 -S
                    for (const item of items_arr) {
                        if (typeof p_drag_details !== "undefined" && p_drag_details !== null && p_drag_details.length > 0) {
                            //ASA-1329 added beacuse if the item added is splice to new postion by this function then we need to update the MIndex,SIndex, item index and use this value outside to update the new values
                            if (p_drag_details[0].MIndex == item.MIndex && p_drag_details[0].SIndex == item.SIndex && p_drag_details[0].Iobjid == item.ObjID) {
                                p_drag_details[0].MIndex = item.MIndex;
                                p_drag_details[0].SIndex = item.SIndex;
                                p_drag_details[0].IIndex = l_item;
                            }
                        } //ASA1329
                        l_item++;
                    } //ASA-1466 -E
                }
            }
            var sorto = {
                MIndex: "asc",
                SIndex: "asc",
                X: "asc",
            };
            p_paste_multi_Item == "N" && item_details.keySort(sorto); //ASA-2029  Issue4 Case(c)
            if (item_details.length > 0) {
                //ASA-1507 #3
                g_combinedShelfs[i].ItemInfo = item_details;
            }
            i++;
        }
        render();
    } catch (err) {
        logDebug("function : setCombinedShelfItems", "E");
        error_handling(err);
    }
}

//this function is used in get_item_xaxis to get the previous item details of a combination shelfs to find out the current shelfs x axis.
function getLastItemCombinedShelf(p_combineShelfs, p_spreadProduct, p_objID) {
    try {
        logDebug("function : getLastItemCombinedShelf", "S");
        var z = 0,
            comitemID = -1;
        for (const items of p_combineShelfs.ItemInfo) {
            if (items.ObjID == p_objID) {
                comitemID = z;
                break;
            }

            z++;
        }
        var dtls = {};
        if (p_spreadProduct == "R") {
            if (typeof p_combineShelfs.ItemInfo[comitemID + 1] !== "undefined") {
                dtls["IIndex"] = comitemID + 1;
                dtls["X"] = p_combineShelfs.ItemInfo[comitemID + 1].X;
                dtls["W"] = p_combineShelfs.ItemInfo[comitemID + 1].W;
                dtls["CurrIndex"] = comitemID;
            }
        } else {
            if (typeof p_combineShelfs.ItemInfo[comitemID - 1] !== "undefined") {
                dtls["IIndex"] = comitemID - 1;
                dtls["X"] = p_combineShelfs.ItemInfo[comitemID - 1].X;
                dtls["W"] = p_combineShelfs.ItemInfo[comitemID - 1].W;
                dtls["CurrIndex"] = comitemID;
            }
        }
        return dtls;
    } catch (err) {
        logDebug("function : getLastItemCombinedShelf", "E");
        error_handling(err);
    }
} // ASA-1129, End
//End ASA-1350 issue 6

//Start ASA-1353 issue 3 --Task_27104 20240417
//This function is used inside create_module_from_json_lib. when the json is coming from table data or from mass update.
//need for this function is to create g_combineShelfs array. because the g_combineShelfs array is a local variable used only on screen.
//So need to save what are combination already present in POG. so we regenerate g_combinedShelfs for use when POG is opened.
function create_g_combine_shelfs(p_pog_json, p_pog_index) {
    if (p_pog_json[p_pog_index].GenrateCombineS.length > 0) {
        var Sorto = {
            SComIndex: "asc",
            ShelfCombIndx: "asc",
        };
        p_pog_json[p_pog_index].GenrateCombineS.keySort(Sorto);
        for (main_obj of p_pog_json[p_pog_index].GenrateCombineS) {
            var main_arr = [],
                item_arr = [];
            var l_callowcrush,
                //  l_start , Regression issue 5
                // l_end ,Regression issue 5
                l_spread;
            var min_x_arr = [],
                max_x_Arr = []; //Regression issue 5
            for (obj of main_obj) {
                if (obj.ObjType == "SHELF" || obj.ObjType == "HANGINGBAR") {
                    var details = {};
                    details["AllowAutoCrush"] = obj.AllowAutoCrush;
                    details["Combine"] = obj.Combine;
                    details["H"] = wpdSetFixed(obj.H);
                    details["MIndex"] = obj.MIndex;
                    details["Module"] = obj.Module;
                    details["ObjType"] = obj.ObjType;
                    details["PIndex"] = p_pog_index; //Regression 9, 10, 11 20241007
                    details["Rotation"] = obj.Rotation;
                    details["SIndex"] = obj.SIndex;
                    details["Shelf"] = obj.Shelf;
                    details["Slope"] = obj.Slope;
                    details["SpreadItem"] = obj.SpreadItem;
                    details["W"] = wpdSetFixed(obj.SW);
                    details["X"] = wpdSetFixed(obj.X);
                    details["Y"] = wpdSetFixed(obj.Y);
                    main_arr.push(details);
                    l_callowcrush = obj.CombAllowCrush;
                    // l_start = obj.CombStart;//Regression issue 5
                    // l_end = obj.CombEnd;//Regression issue 5
                    min_x_arr.push(wpdSetFixed(obj.X - obj.SW / 2)); //Regression issue 5
                    max_x_Arr.push(wpdSetFixed(obj.X + obj.SW / 2)); //Regression issue 5
                    l_spread = obj.CombSpreadItem;
                }
                if (obj.OBJECT == "ITEM") {
                    var item_details = {};
                    // var item_details = p_pog_json[p_pog_index].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].ItemInfo[obj.IIndex];

                    // item_details.W = item_width * item_details.BHoriz;
                    // item_details.H = item_height * item_details.BVert;
                    //item_details.D = item_depth * item_details.BaseD;
                    //item_details.X = p_pog_json[p_pog_index].ModuleInfo[obj.MIndex].ShelfInfo[obj.SIndex].X + item_details.X + (item_details.W / 2);
                    //item_details.Y = item_details.Y + (item_details.H / 2);
                    item_details["W"] = wpdSetFixed(obj.W);
                    item_details["Item"] = obj.Item;
                    item_details["MIndex"] = obj.MIndex;
                    item_details["SIndex"] = obj.SIndex;
                    item_details["IIndex"] = obj.IIndex;
                    item_details["Orientation"] = obj.Orientation;
                    item_details["CrushHoriz"] = obj.CrushHoriz;
                    item_details["CrushVert"] = obj.CrushVert;
                    item_details["CrushD"] = obj.CrushD;
                    item_details["MHorizCrushed"] = obj.MHorizCrushed;
                    item_details["MVertCrushed"] = obj.MVertCrushed;
                    item_details["MDepthCrushed"] = obj.MDepthCrushed;
                    item_details["CWPerc"] = obj.CWPerc;
                    item_details["CHPerc"] = obj.CHPerc;
                    item_details["CDPerc"] = obj.CDPerc;
                    item_details["H"] = wpdSetFixed(obj.H);
                    item_details["D"] = wpdSetFixed(obj.D);
                    item_details["X"] = wpdSetFixed(obj.X);
                    item_details["Y"] = wpdSetFixed(obj.Y);
                    item_details["Z"] = wpdSetFixed(obj.Z);
                    item_details["RW"] = obj.RW;
                    item_details["RH"] = obj.RH;
                    item_details["RD"] = obj.RD;
                    item_details["BHoriz"] = obj.BHoriz; //ASA-1353 issue 3 regression issue 20240428
                    item_details["BVert"] = obj.BVert; //ASA-1353 issue 3 regression issue 20240428
                    item_details["BaseD"] = obj.BaseD; //ASA-1353 issue 3 regression issue 20240428
                    item_details["Fixed"] = obj.Fixed; //ASA-1353 issue 3 --Task_27104 20240419
                    item_details["SpreadItem"] = obj.SpreadItem;
                    item_arr.push(item_details);
                }
            }
            main_arr.AllowAutoCrush = l_callowcrush;
            // main_arr.End = l_end;//Regression issue 5
            // main_arr.Start = l_start;//Regression issue 5
            main_arr.Start = Math.min.apply(Math, min_x_arr); //Regression issue 5
            main_arr.End = Math.max.apply(Math, max_x_Arr); //Regression issue 5
            main_arr.SpreadItem = l_spread;
            main_arr.ItemInfo = item_arr;
            g_combinedShelfs.push(main_arr);
        }
    }
}
//End ASA-1353 issue 3 --Task_27104 20240417 //Start 20240415 - Regression Issue 8 remove from page_4.js to main as its used in common_main

//Start ASA-1353 issue 3 --Task_27104 20240417

function get_combine_arr() {
    //asa-1353 mass update to add details for combination
    var shelf_arr = [];
    var combine_arr = [];
    var shelf_object = {};
    var i = 0;
    for (combination of g_combinedShelfs) {
        var item_details = {};
        shelf_arr = [];
        var j = 0;
        for (shelf_info of combination) {
            shelf_object = {};
            shelf_object["SW"] = shelf_info.W;
            shelf_object["Shelf"] = shelf_info.Shelf;
            shelf_object["H"] = shelf_info.H;
            shelf_object["OBJECT"] = "SHELF";
            shelf_object["SComIndex"] = i;
            shelf_object["ShelfCombIndx"] = j;
            //Start ASA-1353 issue 3 --Task_27104
            shelf_object["AllowAutoCrush"] = shelf_info.AllowAutoCrush;
            shelf_object["Combine"] = shelf_info.Combine;
            shelf_object["Module"] = shelf_info.Module;
            shelf_object["ObjType"] = shelf_info.ObjType;
            shelf_object["PIndex"] = shelf_info.PIndex;
            shelf_object["MIndex"] = shelf_info.MIndex;
            shelf_object["SIndex"] = shelf_info.SIndex;
            shelf_object["Rotation"] = shelf_info.Rotation;
            shelf_object["Slope"] = shelf_info.Slope;
            shelf_object["SpreadItem"] = shelf_info.SpreadItem;
            shelf_object["W"] = shelf_info.W;
            shelf_object["X"] = shelf_info.X;
            shelf_object["Y"] = shelf_info.Y;
            shelf_object["CombSpreadItem"] = g_combinedShelfs[0].SpreadItem;
            shelf_object["CombAllowCrush"] = g_combinedShelfs[0].AllowAutoCrush;
            shelf_object["CombStart"] = g_combinedShelfs[0].Start;
            shelf_object["CombEnd"] = g_combinedShelfs[0].End;
            //End ASA-1353 issue 3 --Task_27104
            shelf_arr.push(shelf_object);
            j++;
        }

        for (items of combination.ItemInfo) {
            item_details = {};
            item_details["SW"] = items.RW;
            item_details["Item"] = items.Item;
            //Start ASA-1353 issue 3 --Task_27104
            item_details["MIndex"] = items.MIndex;
            item_details["SIndex"] = items.SIndex;
            item_details["IIndex"] = items.IIndex;
            item_details["Shelf"] = g_pog_json[items.PIndex].ModuleInfo[items.MIndex].ShelfInfo[items.SIndex].Shelf; //ASA-1843 Change g_pog_index to items.PIndex
            item_details["Orientation"] = items.Orientation;
            item_details["CrushHoriz"] = items.CrushHoriz;
            item_details["CrushVert"] = items.CrushVert;
            item_details["CrushD"] = items.CrushD;
            item_details["MHorizCrushed"] = items.MHorizCrushed;
            item_details["MVertCrushed"] = items.MVertCrushed;
            item_details["MDepthCrushed"] = items.MDepthCrushed;
            item_details["CWPerc"] = items.CWPerc;
            item_details["CHPerc"] = items.CHPerc;
            item_details["CDPerc"] = items.CDPerc;
            item_details["H"] = items.H;
            item_details["D"] = items.D;
            item_details["X"] = items.X;
            item_details["Y"] = items.Y;
            item_details["Z"] = items.Z;
            item_details["RW"] = items.RW;
            item_details["RH"] = items.RH;
            item_details["RD"] = items.RD;
            item_details["W"] = items.W;
            item_details["SpreadItem"] = items.SpreadItem;
            item_details["Fixed"] = items.Fixed; //ASA-1353 issue 3 --Task_27104 20240419'
            item_details["BHoriz"] = items.BHoriz; //Task_27624
            item_details["BVert"] = items.BVert; //Task_27624
            item_details["BaseD"] = items.BaseD; //Task_27624
            //End ASA-1353 issue 3 --Task_27104
            item_details["OBJECT"] = "ITEM";
            item_details["IComIndex"] = i;
            shelf_arr.push(item_details);
        }
        combine_arr.push(shelf_arr);
        i++;
    }
    return combine_arr;
}
//End ASA-1353 issue 3 --Task_27104 20240417


//ASA-1668
function calcCombineShelfAvlSpace(pPogIndex, pCombinationIndx) {
    try {
        logDebug("function : calcCombineShelfAvlSpace;", "S");
        var combineSpace = 0;
        var itemsSpace = 0;
        var c = 0;
        for (combineShelf of g_combinedShelfs[pCombinationIndx]) {
            var shelf = g_pog_json[pPogIndex].ModuleInfo[combineShelf.MIndex].ShelfInfo[combineShelf.SIndex];
            combineSpace += shelf.W;
            if (g_lr_overhung == "Y") {
                if (c == 0) {
                    combineSpace += nvl(shelf.LOverhang);
                }
                if (c == g_combinedShelfs[pCombinationIndx].length - 1) {
                    combineSpace += nvl(shelf.ROverhang);
                }
            }
            for (const items of shelf.ItemInfo) {
                if (typeof items.BottomObjID == "undefined" || items.BottomObjID == "") {
                    itemsSpace += items.W;
                }
            }
            c++;
        }

        var availableSpace = wpdSetFixed((combineSpace - itemsSpace) * 100);
        availableSpace = availableSpace < 0 ? 0 : availableSpace;

        var c = 0;
        for (combineShelf of g_combinedShelfs[pCombinationIndx]) {
            var shelf = g_pog_json[pPogIndex].ModuleInfo[combineShelf.MIndex].ShelfInfo[combineShelf.SIndex];
            var shelf_obj = g_scene_objects[pPogIndex].scene.children[2].getObjectById(shelf.SObjID);
            if (typeof shelf.availableSpaceObjID !== "undefined" && shelf.availableSpaceObjID !== -1) {
                //If obj is undefined in case of undo need to update
                var obj = shelf_obj.getObjectById(shelf.availableSpaceObjID);
                shelf_obj.remove(obj);
            }
            var hex_color = shelf.Color;
            if (hexToRgb(hex_color) == null) {
                var red = parseInt("FF", 16);
                var green = parseInt("FF", 16);
                var blue = parseInt("FF", 16);
            } else {
                var red = hexToRgb(hex_color).r;
                var green = hexToRgb(hex_color).r;
                var blue = hexToRgb(hex_color).g;
            }
            var text_color = getTextColor(red, green, blue);
            var return_obj = addlabelText("Space " + (c == 0 ? availableSpace : 0), g_labelFont, g_labelActualSize, text_color, "center", "");
            shelf_obj.add(return_obj);
            var shelfObj = g_scene_objects[pPogIndex].scene.children[2].getObjectById(shelf.SObjID);
            shelfObj.AvlSpace = availableSpace;
            return_obj.position.y = -0.005;
            return_obj.uuid = "fixel_space";
            if (shelf.Rotation !== 0 || shelf.Slope !== 0) {
                return_obj.position.z = shelf.D / 2 + 0.005;
            } else {
                return_obj.position.z = 0.005;
            }
            return_obj.position.x = 0 + (shelf.W / 2.4 - 0.08);
            shelf.availableSpaceObjID = return_obj.id;
            c++;
        }
        logDebug("function : calcCombineShelfAvlSpace;", "E");
    } catch (err) {
        error_handling(err);
    }
}

function reorderShelfWithFixedItem(pShelf, pShelfStart, pShelfEnd, pSpreadProduct, pSpreadGap, pItems) {
    try {
        var itemSplitObj = []; //This will hold array of items seperated by fixed items. Will include fixed items as well
        var currentItemFixed = "N";
        var itemSplitArr = [];
        var fixedItemArr = [];
        var splitCnt = 0;
        var i = 0;
        for (const items of pItems) {
            items.IIndex = i;
            items.ShelfSplit = pSpreadProduct == "E" || pSpreadProduct == "F" ? splitCnt : -1;
            if (items.Fixed == "Y") {
                if (items.X - items.W / 2 < pShelfStart) {
                    items.X = wpdSetFixed(pShelfStart + items.W / 2);
                } else if (items.X + items.W / 2 > pShelfEnd) {
                    items.X = wpdSetFixed(pShelfEnd - items.W / 2);
                }
                if (pSpreadProduct == "E" || pSpreadProduct == "F") {
                    itemSplitArr.push(items);
                    if (i !== 0) {
                        itemSplitObj.push(itemSplitArr);
                        splitCnt++;
                        itemSplitArr = [];
                        itemSplitArr.push(items);
                    }
                } else {
                    fixedItemArr.push(items);
                }
                currentItemFixed = "Y";
            } else {
                itemSplitArr.push(items);
                currentItemFixed = "N";
            }
            i++;
        }
        if (currentItemFixed == "N" && (pSpreadProduct == "E" || pSpreadProduct == "F")) {
            itemSplitObj.push(itemSplitArr);
        }
        const totalItemCount = pShelf.ItemInfo.length - 1;
        pShelf.ItemInfo.splice(0);
        if (pSpreadProduct == "E" || pSpreadProduct == "F") {
            var prevFixedPresent = "N";
            var s = 0;
            for (splitShelfItems of itemSplitObj) {
                var j = 0;
                var splitStart = pShelfStart;
                var splitEnd = pShelfEnd;
                for (item of splitShelfItems) {
                    if (item.Fixed == "Y") {
                        if (j == 0) {
                            splitStart = wpdSetFixed(item.X - item.W / 2);
                            firstItemFixed = "Y";
                        }

                        if (j == splitShelfItems.length - 1) {
                            splitEnd = wpdSetFixed(item.X + item.W / 2);
                        }
                    }
                    j++;
                }
                var splitAvlSpace = splitEnd - splitStart;
                var k = 0;
                for (item of splitShelfItems) {
                    if (typeof item.BottomObjID === "undefined" || item.BottomObjID === "") {
                        if (item.BHoriz > 1 && pSpreadProduct == "F") {
                            splitAvlSpace = wpdSetFixed(splitAvlSpace - (item.W + pSpreadGap * (item.BHoriz - 1)));
                        } else {
                            splitAvlSpace = wpdSetFixed(splitAvlSpace - item.W);
                        }
                        if (!(prevFixedPresent == "Y" && k == 0 && item.Fixed == "Y")) {
                            pShelf.ItemInfo.push(item);
                        }
                    }
                    k++;
                }
                var spreadItem = splitAvlSpace >= 0 ? wpdSetFixed(splitAvlSpace / (splitShelfItems.length - 1)) : 0;
                splitShelfItems.forEach((item) => {
                    if (item.ShelfSplit == s) {
                        item.SpreadItem = spreadItem;
                    }
                });
                prevFixedPresent = "Y";
                s++;
            }
        } else if (pSpreadProduct == "L") {
            var avlSpace = 0;
            var prevItemEnd = 0;
            var x = 0;
            for (var f = 0; f <= fixedItemArr.length; f++) {
                var fItem = f !== fixedItemArr.length ? fixedItemArr[f] : -1;
                if (f == 0) {
                    avlSpace = wpdSetFixed(fItem.X - fItem.W / 2 - pShelfStart);
                } else if (f < fixedItemArr.length) {
                    avlSpace = wpdSetFixed(fItem.X - fItem.W / 2 - prevItemEnd);
                } else {
                    avlSpace = wpdSetFixed(pShelfEnd - prevItemEnd);
                }
                for (item of itemSplitArr) {
                    if (item.ShelfSplit == -1) {
                        avlSpace = wpdSetFixed(avlSpace - item.W);
                        if (avlSpace > 0 || fItem == -1) {
                            item.ShelfSplit = 0;
                            item.IIndex = x;
                            pShelf.ItemInfo.push(item);
                            x++;
                        }
                    }
                }
                if (fItem !== -1) {
                    prevItemEnd = wpdSetFixed(fItem.X + fItem.W / 2);
                    fItem.IIndex = x;
                    pShelf.ItemInfo.push(fItem);
                    x++;
                }
            }
        } else if (pSpreadProduct == "R") {
            var avlSpace = 0;
            var prevItemStart = 0;
            var prevItemEnd = 0;
            var x = 0;
            for (var f = fixedItemArr.length - 1; f >= -1; f--) {
                var fItem = f !== -1 ? fixedItemArr[f] : -1;
                if (f == fixedItemArr.length - 1) {
                    avlSpace = wpdSetFixed(pShelfEnd - (fItem.X + fItem.W / 2));
                } else if (f == -1) {
                    avlSpace = wpdSetFixed(prevItemStart - pShelfStart);
                } else {
                    avlSpace = wpdSetFixed(prevItemStart - (fItem.X + fItem.W / 2));
                }

                for (var i = itemSplitArr.length - 1; i >= 0; i--) {
                    if (itemSplitArr[i].ShelfSplit == -1) {
                        avlSpace = wpdSetFixed(avlSpace - itemSplitArr[i].W);
                        if (avlSpace > 0 || fItem == -1) {
                            itemSplitArr[i].ShelfSplit = 0;
                            itemSplitArr[i].IIndex = totalItemCount - x;
                            pShelf.ItemInfo.splice(0, 0, itemSplitArr[i]);
                            x++;
                        }
                    }
                }
                if (fItem !== -1) {
                    prevItemEnd = wpdSetFixed(fItem.X + fItem.W / 2);
                    prevItemStart = wpdSetFixed(fItem.X - fItem.W / 2);
                    fItem.IIndex = totalItemCount - x;
                    pShelf.ItemInfo.splice(0, 0, fItem);
                    x++;
                }
            }
        }
        var sorto = {
            IIndex: "asc",
        };
        pShelf.ItemInfo.keySort(sorto); //ASA-1677 #3
    } catch (err) {
        error_handling(err);
    }
}