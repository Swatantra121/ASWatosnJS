
async function create_shelf_from_json_lib(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_new_pog_ind, p_pog_type, p_recreate, p_create_json, p_CopyJsonInd, p_copyJson, p_showSingleModule, p_org_mod_index, p_SpreadItem, p_HorizSpacing, p_VertiSpacing, p_BsktWallThickness, p_ChestWallThickness, p_AutoPlacing, p_WrapText, p_FSize, p_TextboxColor, p_ShelfColor, p_ItemColor, p_ItemDelistColor, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_updateObjInd = "N", p_notchHead, p_pDftBskFill, p_pDftBaskSprd, p_camera, p_pog_index, p_orgPogIndex, p_m_crush = "N", p_crush_item = "N") {
    //ASA1310 KUSH FIX
    logDebug("function : create_shelf_from_json_lib; mod_index : " + p_mod_index + "; p_module_width : " + p_module_width + "; draft_ind : " + p_draft_ind + "; new_pog_ind : " + p_new_pog_ind + "; pog_type : " + p_pog_type + "; recreate : " + p_recreate, "S");
    try {
        var total_mod_width = 0;
        if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length > 0 && p_draft_ind == "N" && p_recreate == "Y") {
            g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.splice(0);
            var l_shelf_cnt = 0;
            for (const shelfs of p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo) {
                var selectedObject = g_world.getObjectById(shelfs.SObjID);
                g_world.remove(selectedObject);
                l_shelf_cnt++;
            }
        }

        if (p_showSingleModule == "Y") {
            total_mod_width = p_json_array[p_pog_index].TotalModWidth;
        }
        if (typeof p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo !== "undefined") {
            if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length > 0) {
                l_shelf_details = p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo;
                l_shelf_details.sort((a, b) => (a.Y > b.Y ? 1 : -1));
                if (p_CopyJsonInd == "Y") {
                    copy_shelf = p_copyJson[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo;
                    copy_shelf.sort((a, b) => (a.Y > b.Y ? 1 : -1));
                }
                if (g_json.length > 0) {
                    //ASA-1418
                    g_json_shelf = g_json[0].ModuleInfo[p_mod_index].ShelfInfo;
                    g_json_shelf.sort((a, b) => (a.Y > b.Y ? 1 : -1));
                }
                var i = 0;
                for (const shelfs of l_shelf_details) {
                    //p_new_pog_ind == "N" && p_pog_type == "F" -- means its json created from table data or coming from mass update.
                    //this code below will create a divider ItemInfo. this is needed because we treat divider as an item in the screen. so we will have
                    //one ItemInfo for each divider which will also have a ShelfInfo. Note: we will always update the details of ShelfInfo and ItemInfo
                    //if any divider is edited or moved.
                    if (((shelfs.ObjType == "DIVIDER" && p_new_pog_ind == "N" && p_pog_type == "F") || (shelfs.ObjType == "DIVIDER" && p_new_pog_ind == "T" && p_pog_type == "D")) && p_create_json == "Y") {
                        var shelf_arr = p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo;
                        var min_distance_arr = [];
                        var min_index_arr = [];
                        var l_shelf_cnt = 0;
                        //below code is checking the nearest shelf below the dividers Y axis. that means in which shelf it was placed.
                        for (const shelfs_detail of shelf_arr) {
                            if (shelfs_detail.ObjType !== "BASE" && shelfs_detail.ObjType !== "NOTCH" && shelfs_detail.ObjType !== "DIVIDER" && shelfs_detail.ObjType !== "TEXTBOX") {
                                if (p_new_pog_ind == "N" && p_pog_type == "F") {
                                    var shelf_x = wpdSetFixed(shelfs_detail.X + shelfs_detail.W / 2);
                                } else {
                                    var shelf_x = wpdSetFixed(shelfs_detail.X);
                                }
                                if (wpdSetFixed(shelfs_detail.Y) < wpdSetFixed(shelfs.Y) && wpdSetFixed(shelf_x - shelfs_detail.W) <= wpdSetFixed(shelfs.X - shelfs.W / 2) && wpdSetFixed(shelf_x + shelfs_detail.W) >= wpdSetFixed(shelfs.X + shelfs.W / 2)) {
                                    //ASA-1171
                                    min_distance_arr.push(wpdSetFixed(shelfs.Y - shelfs_detail.Y));
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
                            div_shelf_index = min_index_arr[index];
                        } else {
                            div_shelf_index = 0;
                        }
                        if (p_CopyJsonInd == "Y") {
                            var copy_index = -1;
                            var p = 0;
                            for (const copy_details of copy_shelf) {
                                if (copy_details.Shelf == p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].Shelf) {
                                    CopyShelf = shelfs;
                                    copy_index = p;
                                    break;
                                }
                                p++;
                            }
                        }
                        console.log("div_shelf_index,", div_shelf_index, min_distance_arr, min_index_arr);
                        //Item Info for that divider is added in the shelf found above.
                        var ItemInfo = {};
                        ItemInfo["ItemID"] = shelfs.Shelf;
                        ItemInfo["Item"] = shelfs.ObjType;
                        ItemInfo["W"] = wpdSetFixed(shelfs.W);
                        ItemInfo["H"] = wpdSetFixed(shelfs.H);
                        ItemInfo["D"] = wpdSetFixed(shelfs.D);
                        ItemInfo["Color"] = shelfs.Color;
                        ItemInfo["DimT"] = "";
                        ItemInfo["Desc"] = shelfs.Desc;
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
                        ItemInfo["CapHorz"] = ""; //ASA-1179
                        ItemInfo["CapDepth"] = ""; //ASA-1179
                        ItemInfo["CapTotalCount"] = ""; //ASA-1179
                        ItemInfo["Rotation"] = shelfs.Rotation;
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
                        ItemInfo["ActualDPP"] = ""; //ASA-1277-(3)
                        ItemInfo["StoreSOH"] = ""; //ASA-1277-(3)
                        ItemInfo["StoreNo"] = ""; //ASA-1277-(3)
                        ItemInfo["WeeksOfInventory"] = ""; //ASA-1277-(3)
                        ItemInfo["DPPLoc"] = ""; //ASA-1308 Task-3
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
                        ItemInfo["SIndex"] = div_shelf_index;
                        ItemInfo["Dragged"] = "N";
                        ItemInfo["Quantity"] = 1;
                        ItemInfo["X"] = wpdSetFixed(shelfs.X - p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].X); //shelfs.X;Task-02_25977 prasanna 20240215 divider iteminfo is now set with start point from shelf start.
                        ItemInfo["Y"] = wpdSetFixed(shelfs.Y);
                        ItemInfo["Z"] = 0.001;
                        ItemInfo["SlotDivider"] = "N";
                        ItemInfo["ImgExists"] = "N";
                        ItemInfo["CapCount"] = 0;
                        ItemInfo["Exists"] = "E";
                        ItemInfo["OW"] = wpdSetFixed(ItemInfo["W"]);
                        ItemInfo["OH"] = wpdSetFixed(ItemInfo["H"]);
                        ItemInfo["OD"] = wpdSetFixed(ItemInfo["D"]);
                        ItemInfo["Distance"] = wpdSetFixed(shelfs.X - p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].X);
                        ItemInfo["YDistance"] = wpdSetFixed(shelfs.Y - (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].Y + p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].H / 2));
                        ItemInfo["SpreadItem"] = 0;
                        ItemInfo["MHorizCrushed"] = "N";
                        ItemInfo["MVertCrushed"] = "N";
                        ItemInfo["MDepthCrushed"] = "N";
                        ItemInfo["MCapTopFacing"] = "N"; //ASA-1170
                        ItemInfo["RW"] = wpdSetFixed(ItemInfo["W"]);
                        ItemInfo["RH"] = wpdSetFixed(ItemInfo["H"]);
                        ItemInfo["RD"] = wpdSetFixed(ItemInfo["D"]);
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
                        ItemInfo["MPogDepthFacings"] = ""; //ASA-1408
                        ItemInfo["MPogHorizFacings"] = ""; //ASA-1408
                        ItemInfo["MPogVertFacings"] = ""; //ASA-1408
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
                        ItemInfo["AutoDiv"] = "N"; //ASA-1406
                        ItemInfo["UDA751"] = ""; //ASA-1407 Task 1 -S
                        ItemInfo["UDA755"] = ""; //ASA-1407 Task 1 -E
                        ItemInfo["DivHeight"] = wpdSetFixed(shelfs.DivHeight); //Start Task_27734
                        ItemInfo["DivWidth"] = wpdSetFixed(shelfs.DivWidth);
                        ItemInfo["DivPst"] = shelfs.DivPst;
                        ItemInfo["DivPed"] = shelfs.DivPed;
                        ItemInfo["DivPbtwFace"] = shelfs.DivPbtwFace;
                        ItemInfo["DivStX"] = isNaN(shelfs.DivStX) ? 0 : shelfs.DivStX; //Task_27734
                        ItemInfo["DivSpaceX"] = isNaN(shelfs.DivSpaceX) ? 0 : shelfs.DivSpaceX; //Task_27734
                        ItemInfo["DivFillCol"] = shelfs.DivFillCol;
                        ItemInfo["NoDivIDShow"] = shelfs.NoDivIDShow; // End Task_27734
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
                        ItemInfo["OOSPerc"] = ""; //ASA-1688 Added for OOS%
                        ItemInfo["InitialItemDesc"] = ""; //ASA-1734 Issue 1
                        ItemInfo["InitialBrand"] = ""; //ASA-1787 Request #6
                        ItemInfo["InitialBarcode"] = ""; //ASA-1787 Request #6

                        p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ItemInfo.push(ItemInfo);
                        if (p_CopyJsonInd == "Y") {
                            p_copyJson[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[copy_index].ItemInfo.splice(0, 0, ItemInfo);
                        }
                        if (g_json.length > 0) {
                            //ASA-1418 //20240722 - Regression Issue 6
                            if (g_json[0].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ObjType !== "BASE" && g_json[0].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ObjType !== "NOTCH" && g_json[0].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ObjType !== "TEXTBOX" && g_json[0].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ObjType !== "DIVIDER") {
                                //ASA-1418 Task 2 ,//Regression issue 2 20242507 change i to div_shelf_index in divider and textbox check
                                if (g_json[0].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ItemInfo == null || typeof g_json[0].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ItemInfo == 'undefined') {
                                    g_json[0].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ItemInfo = []; //ASA-1809
                                }
                                g_json[0].ModuleInfo[p_mod_index].ShelfInfo[div_shelf_index].ItemInfo.splice(0, 0, ItemInfo);
                            }
                        }
                    }
                }
            }
        }
        /*  //ASA-1530 S
          if (typeof p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo !== "undefined") {
              for (var i = 0; i < p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length; i++) {
                  var divider = p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i];
                  if (divider.ObjType == "DIVIDER") {
                      for (var shelf of p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo) {
                          if (shelf.ObjType !== "BASE" && shelf.ObjType !== "NOTCH" && shelf.ObjType !== "DIVIDER" && shelf.ObjType !== "TEXTBOX" &&
                              (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null)) {
                              var isItemFound = false;
  
                              for (var divitem of shelf.ItemInfo) {
                                  if (divitem.ItemID == divider.Shelf) {
                                      isItemFound = true;
                                      break;
                                  }
                              }
                              if (!isItemFound) {
                                  p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.splice(i, 1);
                                  i--;
                                  break;
                              }
                          }
                      }
                  }
              }
          }//ASA-1530 E
          */
        if (typeof p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo !== "undefined") {
            if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length > 0) {
                l_shelf_details = p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo;
                l_shelf_details.sort((a, b) => (a.Y > b.Y && a.ObjType !== "NOTCH" && a.ObjType !== "BASE" ? 1 : -1));

                if (g_json.length > 0) {
                    //ASA-1418 Task 2
                    l_json_shelf_details = g_json[0].ModuleInfo[p_mod_index].ShelfInfo; //Regression Issue 3
                    l_json_shelf_details.sort((a, b) => (a.Y > b.Y && a.ObjType !== "NOTCH" && a.ObjType !== "BASE" ? 1 : -1));
                }

                if (p_CopyJsonInd == "Y") {
                    copy_shelf = p_copyJson[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo;
                    copy_shelf.sort((a, b) => (a.Y > b.Y && a.ObjType !== "NOTCH" && a.ObjType !== "BASE" ? 1 : -1));
                }
                var i = 0;
                var shelf_ind = -1;
                var CopyShelf = {};
                for (const shelfs of l_shelf_details) {
                    if (p_CopyJsonInd == "Y") {
                        var copy_index = -1;
                        var p = 0;
                        for (const copy_details of copy_shelf) {
                            if (copy_details.Shelf == shelfs.Shelf) {
                                CopyShelf = shelfs;
                                copy_index = p;
                                break;
                            }
                            p++;
                        }
                    }
                    var ShelfInfo = {};
                    if (p_create_json == "Y") {
                        //this below if is true when json is created from tables or from mass update.
                        if (p_new_pog_ind == "N" && p_pog_type == "F") {
                            ShelfInfo["GrillH"] = 0;
                            ShelfInfo["LOverhang"] = shelfs.LOverhang !== null && shelfs.LOverhang !== "" && typeof shelfs.LOverhang !== "undefined" ? shelfs.LOverhang : 0; //ASA-1310
                            ShelfInfo["ROverhang"] = shelfs.ROverhang !== null && shelfs.ROverhang !== "" && typeof shelfs.ROverhang !== "undefined" ? shelfs.ROverhang : 0; //ASA-1310
                            ShelfInfo["SpacerThick"] = 0;
                            ShelfInfo["HorizGap"] = shelfs.HorizGap !== null && shelfs.HorizGap !== "" && typeof shelfs.HorizGap !== "undefined" ? shelfs.HorizGap : 0; //ASA-1902
                            ShelfInfo["SpreadItem"] = shelfs.SpreadItem !== null && shelfs.SpreadItem !== "" && typeof shelfs.SpreadItem !== "undefined" ? shelfs.SpreadItem : p_SpreadItem; //ASA-1310
                            ShelfInfo["Combine"] = shelfs.Combine !== null && shelfs.Combine !== "" && typeof shelfs.Combine !== "undefined" ? shelfs.Combine : "N"; //ASA-1310;
                            ShelfInfo["AllowAutoCrush"] = shelfs.AllowAutoCrush !== null && shelfs.AllowAutoCrush !== "" && typeof shelfs.AllowAutoCrush !== "undefined" ? shelfs.AllowAutoCrush : "N"; //ASA-1310;
                            ShelfInfo["AutoPlacing"] = shelfs.AutoPlacing !== null && shelfs.AutoPlacing !== "" && typeof shelfs.AutoPlacing !== "undefined" ? shelfs.AutoPlacing : p_AutoPlacing; //ASA-1310 prasanna ASA-1310_25890
                            ShelfInfo["AutoDepthCalc"] = shelfs.AutoDepthCalc !== null && shelfs.AutoDepthCalc !== "" && typeof shelfs.AutoDepthCalc !== "undefined" ? shelfs.AutoDepthCalc : "N"; // ASA-1351
                            ShelfInfo["MSpreadItem"] = shelfs.MSpreadItem !== null && shelfs.MSpreadItem !== "" && typeof shelfs.MSpreadItem !== "undefined" ? shelfs.MSpreadItem : "N"; // ASA-1350
                            ShelfInfo["SMassUpdate"] = shelfs.SMassUpdate !== null && shelfs.SMassUpdate !== "" && typeof shelfs.SMassUpdate !== "undefined" ? shelfs.SMassUpdate : "N"; // ASA-1349 issue 14
                            ShelfInfo["HorizSlotStart"] = 0;
                            if (shelfs.ObjType == "PEGBOARD") {
                                ShelfInfo["HorizSpacing"] = p_HorizSpacing;
                                ShelfInfo["VertiSpacing"] = p_VertiSpacing;
                            } else {
                                ShelfInfo["HorizSpacing"] = 0;
                                ShelfInfo["VertiSpacing"] = 0;
                            }
                            ShelfInfo["HorizSlotSpacing"] = 0;
                            ShelfInfo["HorizStart"] = 0;
                            ShelfInfo["UOverHang"] = 0;
                            ShelfInfo["LoOverHang"] = 0;
                            ShelfInfo["VertiStart"] = 0;
                            ShelfInfo["BsktFill"] = p_pDftBskFill;
                            ShelfInfo["BsktSpreadProduct"] = p_pDftBaskSprd;
                            ShelfInfo["SnapTo"] = "N";
                            if (shelfs.ObjType == "BASKET" || shelfs.ObjType == "CHEST") {
                                if (shelfs.BsktWallH !== 0 && typeof shelfs.BsktWallH !== "undefined") {
                                    //ASA-1310 KUSH FIX added because if value is 0 in crush height then set wall height else maxmerch
                                    ShelfInfo["BsktWallH"] = shelfs.BsktWallH;
                                } else {
                                    ShelfInfo["BsktWallH"] = shelfs.MaxMerch;
                                }
                                ShelfInfo["BsktBaseH"] = shelfs.H;
                                if (shelfs.ObjType == "BASKET") {
                                    ShelfInfo["BsktWallThickness"] = p_BsktWallThickness;
                                } else {
                                    ShelfInfo["BsktWallThickness"] = p_ChestWallThickness;
                                }
                            } else {
                                ShelfInfo["BsktWallH"] = 0;
                                ShelfInfo["BsktBaseH"] = 0;
                                ShelfInfo["BsktWallThickness"] = 0;
                            }
                            ShelfInfo["DSlotStart"] = 0;
                            ShelfInfo["DSlotSpacing"] = 0;
                            ShelfInfo["DGap"] = 0;
                            ShelfInfo["FrontOverHang"] = 0;
                            ShelfInfo["BackOverHang"] = 0;
                            ShelfInfo["SlotDivider"] = "N";
                            ShelfInfo["AllowOverLap"] = "N";
                            ShelfInfo["AutoFillPeg"] = shelfs.AutoFillPeg; //ASA-1109
                            ShelfInfo["SlotOrientation"] = "";
                            ShelfInfo["DividerFixed"] = "N";
                            ShelfInfo["AvlSpace"] = 0;
                            if (p_showSingleModule == "Y") {
                                ShelfInfo["X"] = wpdSetFixed(shelfs.X + parseFloat(shelfs.W) / 2 - total_mod_width);
                            } else {
                                ShelfInfo["X"] = wpdSetFixed(shelfs.X + parseFloat(shelfs.W) / 2);
                            }
                            ShelfInfo["Y"] = wpdSetFixed(shelfs.Y + parseFloat(shelfs.H) / 2);
                            ShelfInfo["Z"] = wpdSetFixed(shelfs.Z + parseFloat(shelfs.D) / 2 + g_pog_json[p_pog_index].BackDepth);
                            ShelfInfo["WrapText"] = shelfs.WrapText !== null && shelfs.WrapText !== "" ? shelfs.WrapText : p_WrapText;  //ASA-2030
                            ShelfInfo["ReduceToFit"] = shelfs.ReduceToFit !== null && shelfs.ReduceToFit !== "" ? shelfs.ReduceToFit : "Y";  //ASA-2030
                            ShelfInfo["TextDirection"] = shelfs.TextDirection !== null && shelfs.TextDirection !== "" ? shelfs.TextDirection : "H"; //1797 Issue 1
                            ShelfInfo["FStyle"] = "Arial";
                            ShelfInfo["FSize"] = shelfs.FSize !== null && shelfs.FSize !== "" && shelfs.FSize !== 0 ? shelfs.FSize : p_FSize; //ASA-1950 p_FSize;
                            ShelfInfo["FBold"] = shelfs.Fbold;    //ASA-2030
                            ShelfInfo["canvasW"] = null;
                            ShelfInfo["canvasH"] = null;
                            ShelfInfo["peg_vert_values"] = [];
                            ShelfInfo["peg_horiz_values"] = [];
                            ShelfInfo["DivHeight"] = shelfs.DivHeight; //ASA-1387 Issue 3
                            ShelfInfo["DivWidth"] = shelfs.DivWidth; //ASA-1387 Issue 3
                            ShelfInfo["DivPst"] = shelfs.DivPst; //ASA-1387 Issue 3
                            ShelfInfo["DivPed"] = shelfs.DivPed; //ASA-1387 Issue 3
                            ShelfInfo["DivPbtwFace"] = shelfs.DivPbtwFace; //ASA-1387 Issue 3
                            ShelfInfo["DivStX"] = isNaN(shelfs.DivStX) ? 0 : shelfs.DivStX; //Task_27734 shelfs.DivStX; //ASA-1387 Issue 3
                            ShelfInfo["DivSpaceX"] = isNaN(shelfs.DivSpaceX) ? 0 : shelfs.DivSpaceX; //Task_27734 shelfs.DivSpaceX; //ASA-1387 Issue 3
                            ShelfInfo["DivFillCol"] = shelfs.DivFillCol; //ASA-1387 Issue 3
                            ShelfInfo["NoDivIDShow"] = typeof shelfs.NoDivIDShow == "undefined" && shelfs.NoDivIDShow !== "" ? "N" : shelfs.NoDivIDShow; //ASA-1406 //Task_27734
                            ShelfInfo["Overhung"] = typeof shelfs.Overhung == "undefined" && shelfs.Overhung !== "" ? "N" : shelfs.Overhung; //ASA-1138
                        } else {
                            //p_showSingleModule == 'Y' when opening POG from module view.
                            if (p_showSingleModule == "Y") {
                                ShelfInfo["X"] = wpdSetFixed(shelfs.X - total_mod_width);
                            } else {
                                ShelfInfo["X"] = wpdSetFixed(shelfs.X);
                            }
                            ShelfInfo["Y"] = wpdSetFixed(shelfs.Y); //parseFloat((shelfs.Y).toFixed(4)); //task_26589
                            ShelfInfo["Z"] = wpdSetFixed(shelfs.Z);
                            ShelfInfo["GrillH"] = shelfs.GrillH;
                            ShelfInfo["LOverhang"] = shelfs.LOverhang;
                            ShelfInfo["ROverhang"] = shelfs.ROverhang;
                            ShelfInfo["SpacerThick"] = shelfs.SpacerThick;
                            ShelfInfo["HorizGap"] = shelfs.HorizGap !== null && shelfs.HorizGap !== "" && typeof shelfs.HorizGap !== "undefined" ? shelfs.HorizGap : 0; //ASA-1902
                            ShelfInfo["SpreadItem"] = shelfs.SpreadItem;
                            ShelfInfo["Combine"] = shelfs.Combine;
                            ShelfInfo["AllowAutoCrush"] = shelfs.AllowAutoCrush;
                            ShelfInfo["HorizSlotStart"] = shelfs.HorizSlotStart;
                            ShelfInfo["HorizSlotSpacing"] = shelfs.HorizSlotSpacing;
                            ShelfInfo["HorizStart"] = shelfs.HorizStart;
                            ShelfInfo["HorizSpacing"] = shelfs.HorizSpacing;
                            ShelfInfo["UOverHang"] = shelfs.UOverHang;
                            ShelfInfo["LoOverHang"] = typeof shelfs.LoOverHang == "undefined" ? 0 : shelfs.LoOverHang;
                            ShelfInfo["VertiStart"] = shelfs.VertiStart;
                            ShelfInfo["VertiSpacing"] = shelfs.VertiSpacing;
                            ShelfInfo["BsktFill"] = shelfs.BsktFill;
                            ShelfInfo["BsktSpreadProduct"] = shelfs.BsktSpreadProduct;
                            ShelfInfo["SnapTo"] = shelfs.SnapTo;
                            ShelfInfo["BsktWallH"] = shelfs.BsktWallH;
                            ShelfInfo["BsktBaseH"] = shelfs.BsktBaseH;
                            ShelfInfo["BsktWallThickness"] = shelfs.BsktWallThickness;
                            ShelfInfo["DSlotStart"] = shelfs.DSlotStart;
                            ShelfInfo["DSlotSpacing"] = shelfs.DSlotSpacing;
                            ShelfInfo["DGap"] = shelfs.DGap;
                            ShelfInfo["FrontOverHang"] = shelfs.FrontOverHang;
                            ShelfInfo["BackOverHang"] = shelfs.BackOverHang;
                            ShelfInfo["SlotDivider"] = shelfs.SlotDivider;
                            ShelfInfo["AllowOverLap"] = shelfs.AllowOverLap;
                            ShelfInfo["AutoPlacing"] = typeof shelfs.AutoPlacing !== "undefined" && shelfs.AutoPlacing !== "" ? shelfs.AutoPlacing : "";
                            ShelfInfo["AutoFillPeg"] = typeof shelfs.AutoFillPeg !== "undefined" && shelfs.AutoFillPeg !== "" ? shelfs.AutoFillPeg : ""; //ASA-1109
                            ShelfInfo["AvlSpace"] = shelfs.W + shelfs.LOverhang + shelfs.ROverhang;
                            ShelfInfo["WrapText"] = shelfs.WrapText;
                            ShelfInfo["ReduceToFit"] = shelfs.ReduceToFit;
                            ShelfInfo["TextDirection"] = shelfs.TextDirection;
                            ShelfInfo["SlotOrientation"] = shelfs.SlotOrientation;
                            ShelfInfo["DividerFixed"] = shelfs.DividerFixed;
                            ShelfInfo["FStyle"] = shelfs.FStyle;
                            ShelfInfo["FSize"] = shelfs.FSize;
                            ShelfInfo["FBold"] = shelfs.FBold;
                            ShelfInfo["canvasW"] = shelfs.canvasW;
                            ShelfInfo["canvasH"] = shelfs.canvasH;
                            ShelfInfo["peg_vert_values"] = shelfs.peg_vert_values;
                            ShelfInfo["peg_horiz_values"] = shelfs.peg_horiz_values;
                            ShelfInfo["DivHeight"] = shelfs.DivHeight; //ASA-1265
                            ShelfInfo["DivWidth"] = shelfs.DivWidth; //ASA-1265
                            ShelfInfo["DivPst"] = shelfs.DivPst; //ASA-1265
                            ShelfInfo["DivPed"] = shelfs.DivPed; //ASA-1265
                            ShelfInfo["DivPbtwFace"] = shelfs.DivPbtwFace; //ASA-1265
                            ShelfInfo["DivStX"] = isNaN(shelfs.DivStX) ? 0 : shelfs.DivStX; //Task_27734 shelfs.DivStX; //ASA-1265
                            ShelfInfo["DivSpaceX"] = isNaN(shelfs.DivSpaceX) ? 0 : shelfs.DivSpaceX; //Task_27734 shelfs.DivSpaceX; //ASA-1265
                            ShelfInfo["DivFillCol"] = shelfs.DivFillCol; //ASA-1265
                            ShelfInfo["NoDivIDShow"] = shelfs.NoDivIDShow; //ASA-1406
                            ShelfInfo["Overhung"] = typeof shelfs.Overhung !== "undefined" && shelfs.Overhung !== "" ? shelfs.Overhung : "N"; //ASA-1138
                        }
                        ShelfInfo["ShelfDivObjID"] = shelfs.ShelfDivObjID;
                        ShelfInfo["ManualCrush"] = typeof shelfs.ManualCrush !== "undefined" && shelfs.ManualCrush !== "" ? shelfs.ManualCrush : p_m_crush; //ASA-1300
                        ShelfInfo["SplitChest"] = typeof shelfs.SplitChest !== "undefined" && shelfs.SplitChest !== "" ? shelfs.SplitChest : "N"; //Task_26627
                        ShelfInfo["Shelf"] = shelfs.Shelf;
                        ShelfInfo["POGCode"] = g_pog_json[p_pog_index].POGCode; //ASA-1243
                        ShelfInfo["Version"] = g_pog_json[p_pog_index].Version; //ASA-1243

                        ShelfInfo["ObjType"] = shelfs.ObjType;
                        ShelfInfo["Desc"] = shelfs.Desc;
                        ShelfInfo["MaxMerch"] = shelfs.MaxMerch;
                        ShelfInfo["LObjID"] = shelfs.LObjID;
                        ShelfInfo["OldObjID"] = shelfs.SObjID;
                        ShelfInfo["NotchNo"] = shelfs.NotchNo;
                        if (shelfs.TextImg == "" || typeof shelfs.TextImg == "undefined" || shelfs.TextImg == null) {
                            ShelfInfo["TextImg"] = "";
                            ShelfInfo["TextImgName"] = "";
                            ShelfInfo["TextImgMime"] = "";
                        } else {
                            ShelfInfo["TextImg"] = shelfs.TextImg;
                            ShelfInfo["TextImgName"] = shelfs.TextImgName; //ASA-1650 issue 10
                            ShelfInfo["TextImgMime"] = shelfs.TextImgMime; //ASA-1650 issue 10
                        }
                        if (shelfs.ObjType == "BASE") {
                            ShelfInfo["H"] = g_pog_json[p_pog_index].BaseH;
                            ShelfInfo["W"] = g_pog_json[p_pog_index].BaseW;
                            ShelfInfo["D"] = g_pog_json[p_pog_index].BaseD;
                            ShelfInfo["Color"] = g_pog_json[p_pog_index].Color;
                        } else if (shelfs.ObjType == "NOTCH") {
                            ShelfInfo["H"] = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].H;
                            ShelfInfo["W"] = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].NotchW;
                            ShelfInfo["D"] = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].D;
                            ShelfInfo["Color"] = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Color;
                        } else {
                            ShelfInfo["H"] = wpdSetFixed(shelfs.H);
                            ShelfInfo["W"] = wpdSetFixed(shelfs.W);
                            ShelfInfo["D"] = wpdSetFixed(shelfs.D);
                            if (shelfs.Color !== null) {
                                if (typeof shelfs.Color == "undefined" || shelfs.Color == "#0" || shelfs.Color.charAt(1) == "#") {
                                    if (ShelfInfo["ObjType"] == "TEXTBOX") {
                                        ShelfInfo["Color"] = p_TextboxColor;
                                    } else {
                                        ShelfInfo["Color"] = p_ShelfColor;
                                    }
                                } else {
                                    ShelfInfo["Color"] = shelfs.Color == "#FFFF" ? "#FFFFFF" : shelfs.Color;
                                }
                            } else {
                                if (ShelfInfo["ObjType"] == "TEXTBOX") {
                                    ShelfInfo["Color"] = p_TextboxColor;
                                } else {
                                    ShelfInfo["Color"] = p_ShelfColor;
                                }
                            }
                        }
                        if (shelfs.Rotation == null || typeof shelfs.Rotation == "undefined") {
                            ShelfInfo["Rotation"] = 0;
                        } else {
                            ShelfInfo["Rotation"] = shelfs.Rotation;
                        }
                        if (shelfs.Slope == null || typeof shelfs.Slope == "undefined") {
                            ShelfInfo["Slope"] = 0;
                        } else {
                            ShelfInfo["Slope"] = shelfs.Slope;
                        }

                        ShelfInfo["LiveImage"] = shelfs.LiveImage;
                        ShelfInfo["CompShelfObjID"] = shelfs.CompShelfObjID;
                        ShelfInfo["ManualZupdate"] = shelfs.ManualZupdate;
                        ShelfInfo["InputText"] = typeof shelfs.InputText !== "undefined" && shelfs.InputText !== null ? shelfs.InputText : "";
                        ShelfInfo["ChestEdit"] = shelfs.ChestEdit !== null && shelfs.ChestEdit !== "" && typeof shelfs.ChestEdit !== "undefined" ? shelfs.ChestEdit : "N"; //Bug-26122 - splitting the chest
                        ShelfInfo["ItemInfo"] = [];
                        ShelfInfo["InsidePegboard"] = shelfs.InsidePegboard; //ASA - 1544 Issue 1
                        g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.push(ShelfInfo);
                        shelf_ind = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length - 1;
                    } else {
                        ShelfInfo = shelfs;
                        shelf_ind = i;
                    }

                    var final_height = 0;

                    if (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null && p_recreate == "Y")) {
                        var colorValue = parseInt(ShelfInfo["Color"].replace("#", "0x"), 16);
                        var hex_decimal = new THREE.Color(colorValue);
                        if (ShelfInfo["ObjType"] == "PEGBOARD") {
                            var return_val = add_pegboard(ShelfInfo["Shelf"], ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], 0.004, "N", ShelfInfo["VertiStart"], ShelfInfo["VertiSpacing"], ShelfInfo["HorizStart"], ShelfInfo["HorizSpacing"], p_mod_index, shelf_ind, ShelfInfo["Rotation"], ShelfInfo["Slope"], "N", p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index); //ASA-1350 issue 6 added parameters
                        } else if (ShelfInfo["ObjType"] == "TEXTBOX") {
                            //Start ASA-1371_26842 Prod issue text box image not printed in PDF when live image is on and generate PDF.
                            if (ShelfInfo["Color"].charAt(1) == "#" && ShelfInfo["ObjType"] == "TEXTBOX") {
                                var bg_color = null;
                            } else {
                                var bg_color = colorValue;
                            }
                            if (g_show_live_image == "Y" && ShelfInfo["TextImg"] !== "" && typeof ShelfInfo["TextImg"] !== "undefined" && ShelfInfo["TextImg"] !== null) {
                                var return_val = await add_text_box_with_image(ShelfInfo["Shelf"], "TEXTBOX", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"], "N", p_mod_index, ShelfInfo["InputText"], bg_color, ShelfInfo["WrapText"], ShelfInfo["ReduceToFit"], ShelfInfo["Color"], shelf_ind, ShelfInfo["Rotation"], ShelfInfo["Slope"], "N", ShelfInfo["FStyle"], ShelfInfo["FSize"], ShelfInfo["FBold"], p_notchHead, p_pog_index);
                            } else {
                                var return_val = add_text_box(ShelfInfo["Shelf"], "TEXTBOX", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"], "N", p_mod_index, ShelfInfo["InputText"], bg_color, ShelfInfo["WrapText"], ShelfInfo["ReduceToFit"], ShelfInfo["Color"], shelf_ind, ShelfInfo["Rotation"], ShelfInfo["Slope"], "N", ShelfInfo["FStyle"], ShelfInfo["FSize"], ShelfInfo["FBold"], p_enlargeNo, p_pog_index, g_pogcr_enhance_textbox_fontsize, ShelfInfo["TextDirection"]);
                            }
                            //End ASA-1371_26842
                        } else if (ShelfInfo["ObjType"] == "ROD") {
                            var colorValue = parseInt(ShelfInfo["Color"].replace("#", "0x"), 16);
                            var hex_decimal = new THREE.Color(colorValue);
                            var return_val = add_rod(ShelfInfo["Shelf"], "SHELF", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], 0.004, "N", p_mod_index, shelf_ind, p_pog_index);
                        } else if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null)) {
                            if (ShelfInfo["ObjType"] == "BASKET" || ShelfInfo["ObjType"] == "CHEST") {
                                if (g_chest_as_pegboard == "Y" && ShelfInfo["ObjType"] == "CHEST") {
                                    final_height = wpdSetFixed(ShelfInfo["D"]);
                                    ShelfInfo["H"] = wpdSetFixed(ShelfInfo["D"]);
                                } else {
                                    final_height = wpdSetFixed(ShelfInfo["BsktBaseH"]);
                                    ShelfInfo["H"] = wpdSetFixed(ShelfInfo["BsktBaseH"]);
                                }
                            } else {
                                final_height = wpdSetFixed(ShelfInfo["H"]);
                            }
                            var [return_val, shelf_cnt] = await add_shelf(ShelfInfo["Shelf"], "SHELF", ShelfInfo["W"], final_height, ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], 0.005, "N", p_mod_index, ShelfInfo["Rotation"], ShelfInfo["Slope"], shelf_ind, "N", "N", "Y", -1, p_pogCarparkShelfDftColor, p_notchHead, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index, p_json_array /*20241223 Reg 2*/); //ASA-1350 issue 6 added parameters
                            //this function will only be called from page 25. this will update the undo redo array
                            if (p_updateObjInd == "Y") {
                                var res = updateObjID(ShelfInfo["OldObjID"], return_val, "S");
                            }
                        }
                    }

                    if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX" && (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null)) {
                        /* //ASA-1418 Task 2
                        if (typeof p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo !== "undefined" && p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo !== null) {
                            if (p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo.length > 0) {
                                item_Details = p_json_array[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo;*/
                        if (typeof shelfs.ItemInfo !== "undefined" && shelfs.ItemInfo !== null) {
                            if (shelfs.ItemInfo.length > 0) {
                                item_Details = shelfs.ItemInfo;
                                var sorto = {
                                    X: "asc",
                                    Y: "asc",
                                };
                                item_Details.keySort(sorto);
                                if (p_CopyJsonInd == "Y") {
                                    copy_items = p_copyJson[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[copy_index].ItemInfo;
                                    copy_items.keySort(sorto);
                                }
                                if (g_json.length > 0) {
                                    //ASA-1418
                                    g_json_shelf = g_json[0].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo;
                                    g_json_shelf.keySort(sorto);
                                }

                                var shelf_start = ShelfInfo["X"] - ShelfInfo["W"] / 2;
                                var j = 0;
                                var l_item_crush = "N"; //ASA-1349 issue 2-3
                                for (const items of item_Details) {
                                    if (p_draft_ind == "N") {
                                        var selectedObject = g_world.getObjectById(items.ObjID);
                                        g_world.remove(selectedObject);
                                    }

                                    var ItemInfo = {};
                                    var item_ind = -1;
                                    var items_cnt = 0; // ASA-1273-3

                                    if (p_create_json == "Y") {
                                        //this below if is true when json is created from tables or from mass update.
                                        if (p_new_pog_ind == "N" && p_pog_type == "F") {
                                            ItemInfo["DimT"] = items.MerchStyle;
                                            ItemInfo["PegID"] = "";
                                            ItemInfo["PegSpread"] = "";
                                            ItemInfo["PegPerFacing"] = "";
                                            ItemInfo["Fixed"] = "N";
                                            ItemInfo["CapStyle"] = items.CapStyle !== null && items.CapStyle !== "" && typeof items.CapStyle !== "undefined" ? items.CapStyle : "0"; //ASA-1310;"0";
                                            /*ASA-1170, Start*/
                                            ItemInfo["CapFacing"] = items.CapFacing !== null && items.CapFacing !== "" && typeof items.CapFacing !== "undefined" ? items.CapFacing : ""; //ASA-1310;
                                            ItemInfo["CapMerch"] = items.CapMerch !== null && items.CapMerch !== "" && typeof items.CapMerch !== "undefined" ? items.CapMerch : ""; //ASA-1310;
                                            ItemInfo["CapOrientaion"] = items.CapOrientaion !== null && items.CapOrientaion !== "" && typeof items.CapOrientaion !== "undefined" ? items.CapOrientaion : ""; //ASA-1310
                                            /*ASA-1170, End*/
                                            /*Start ASA-1310 prasanna ASA-1310_25890*/
                                            ItemInfo["CapHeight"] = items.CapHeight !== null && items.CapHeight !== "" && typeof items.CapHeight !== "undefined" ? items.CapHeight : "";
                                            ItemInfo["CapHorz"] = items.CapHorz !== null && items.CapHorz !== "" && typeof items.CapHorz !== "undefined" ? items.CapHorz : "";
                                            ItemInfo["CapDepth"] = items.CapDepth !== null && items.CapDepth !== "" && typeof items.CapDepth !== "undefined" ? items.CapDepth : "";
                                            ItemInfo["CapTotalCount"] = items.CapTotalCount !== null && items.CapTotalCount !== "" && typeof items.CapTotalCount !== "undefined" ? items.CapTotalCount : "";
                                            ItemInfo["CapMaxH"] = items.CapMaxH !== null && items.CapMaxH !== "" && typeof items.CapMaxH !== "undefined" ? items.CapMaxH : "";
                                            ItemInfo["CapCount"] = items.CapCount !== null && items.CapCount !== "" && typeof items.CapCount !== "undefined" ? items.CapCount : "";
                                            ItemInfo["CapDepthChanged"] = items.CapDepthChanged !== null && items.CapDepthChanged !== "" && typeof items.CapDepthChanged !== "undefined" ? items.CapDepthChanged : "N";
                                            /*END ASA-1310 prasanna ASA-1310_25890*/
                                            ItemInfo["MaxHCapStyle"] = "3";
                                            ItemInfo["Rotation"] = 0;
                                            ItemInfo["CrushHoriz"] = items.CrushHoriz !== null && items.CrushHoriz !== "" && typeof items.CrushHoriz !== "undefined" ? items.CrushHoriz : 0; //ASA-1310;;
                                            ItemInfo["CrushVert"] = items.CrushVert !== null && items.CrushVert !== "" && typeof items.CrushVert !== "undefined" ? items.CrushVert : 0; //ASA-1310;
                                            ItemInfo["CrushD"] = items.CrushD !== null && items.CrushD !== "" && typeof items.CrushD !== "undefined" ? items.CrushD : 0; //ASA-1310;
                                            ItemInfo["Price"] = "";
                                            ItemInfo["Cost"] = "";
                                            ItemInfo["RegMovement"] = "";
                                            ItemInfo["RegMovementInd"] = "";
                                            ItemInfo["DaysOfSupplyInd"] = "";
                                            ItemInfo["AvgSales"] = "";
                                            ItemInfo["ItemStatus"] = "";
                                            ItemInfo["CDTLvl1"] = ""; //ASA-1130
                                            ItemInfo["CDTLvl2"] = ""; //ASA-1130
                                            ItemInfo["CDTLvl3"] = ""; //ASA-1130
                                            ItemInfo["ActualDPP"] = ""; //ASA-1277-(3)
                                            ItemInfo["StoreSOH"] = ""; //ASA-1277-(3)
                                            ItemInfo["StoreNo"] = ""; //ASA-1277-(3)
                                            ItemInfo["WeeksOfInventory"] = ""; //ASA-1277-(3)
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
                                            ItemInfo["DPPLoc"] = ""; //ASA-1308 Task-3
                                            ItemInfo["MoveBasis"] = "";
                                            ItemInfo["IsContainer"] = "N";
                                            ItemInfo["BsktFactor"] = 0;
                                            ItemInfo["OverHang"] = 0;
                                            ItemInfo["VertGap"] = 0;
                                            ItemInfo["BHoriz"] = items.BHoriz == null ? 1 : items.BHoriz;
                                            ItemInfo["BVert"] = items.BVert == null ? 1 : items.BVert;
                                            ItemInfo["BaseD"] = items.BaseD == null || items.BaseD == 0 ? 1 : items.BaseD; //ASA-1349 issue 6
                                            //getting dimension according to orientation.
                                            if (((g_json.length > 0 || typeof g_json[0] !== 'undefined') && g_json[0].DesignType == "D") && g_pog_json[p_pog_index].DesignType == "D" && g_pog_json[p_pog_index].MassUpdate == "Y") {
                                                var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim("0", items.W, items.H, items.D);
                                            } else {
                                                var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.W, items.H, items.D);
                                            }
                                            ItemInfo["W"] = item_width;
                                            if (items.CapCount !== null && items.CapCount !== "" && typeof items.CapCount !== "undefined" && items.CapStyle !== "0" && typeof items.CapStyle !== "undefined" && items.CapStyle !== null) {
                                                //TASK-25959 Kush added DUE TO AFTER MASS UPDATE WE NEED CAPHEIGHT TO BE ADDED
                                                ItemInfo["H"] = wpdSetFixed(item_height * items.BVert + items.CapHeight * items.CapCount);
                                            } else {
                                                ItemInfo["H"] = wpdSetFixed(item_height * items.BVert);
                                            }
                                            ItemInfo["D"] = item_depth;
                                            if (ShelfInfo["ObjType"] == "BASKET" && items.Item !== "DIVIDER") {
                                                ItemInfo["W"] = wpdSetFixed(ShelfInfo["W"]);
                                                ItemInfo["H"] = wpdSetFixed(items.D * items.Quantity);
                                                ItemInfo["D"] = wpdSetFixed(items.D * ItemInfo["BaseD"]);
                                                ItemInfo["RW"] = wpdSetFixed(items.W);
                                                ItemInfo["RH"] = wpdSetFixed(items.H);
                                                ItemInfo["RD"] = wpdSetFixed(items.D);
                                            } else {
                                                ItemInfo["W"] = ItemInfo["W"] * ItemInfo["BHoriz"];
                                                if (items.CapCount !== null && items.CapCount !== "" && typeof items.CapCount !== "undefined" && items.CapStyle !== "0" && typeof items.CapStyle !== "undefined" && items.CapStyle !== null) {
                                                    //TASK-25959 Kush added DUE TO AFTER MASS UPDATE WE NEED CAPHEIGHT TO BE ADDED
                                                    ItemInfo["H"] = wpdSetFixed(item_height * items.BVert + items.CapHeight * items.CapCount);
                                                } else {
                                                    ItemInfo["H"] = wpdSetFixed(item_height * items.BVert);
                                                } //END //TASK-25959
                                                ItemInfo["D"] = wpdSetFixed(ItemInfo["D"] * ItemInfo["BaseD"]);
                                                ItemInfo["RW"] = wpdSetFixed(ItemInfo["W"]);
                                                ItemInfo["RH"] = wpdSetFixed(item_height * items.BVert); //TASK-25959 kush FOR CAPPING
                                                ItemInfo["RD"] = wpdSetFixed(ItemInfo["D"]);
                                            }

                                            ItemInfo["OW"] = wpdSetFixed(items.W);
                                            ItemInfo["OH"] = wpdSetFixed(items.H);
                                            ItemInfo["OD"] = wpdSetFixed(items.D);
                                            ItemInfo["LObjID"] = items.LObjID;
                                            ItemInfo["SubLblObjID"] = items.SubLblObjID; //ASA-1182
                                            ItemInfo["Dragged"] = "N";
                                            ItemInfo["SpreadItem"] = typeof items.SpreadItem !== "undefined" && items.SpreadItem !== null && items.SpreadItem !== "" ? items.SpreadItem : 0; //--20240415 Rregression issue 12
                                            ItemInfo["MHorizCrushed"] = items.MHorizCrushed !== null && items.MHorizCrushed !== "" && typeof items.MHorizCrushed !== "undefined" ? items.MHorizCrushed : "N"; //ASA-1310 prasanna ASA-1310_25890
                                            ItemInfo["MVertCrushed"] = items.MVertCrushed !== null && items.MVertCrushed !== "" && typeof items.MVertCrushed !== "undefined" ? items.MVertCrushed : "N"; //ASA-1310 prasanna ASA-1310_25890
                                            ItemInfo["MDepthCrushed"] = items.MDepthCrushed !== null && items.MDepthCrushed !== "" && typeof items.MDepthCrushed !== "undefined" ? items.MDepthCrushed : "N"; //ASA-1310 prasanna ASA-1310_25890
                                            ItemInfo["MCapTopFacing"] = "N"; //ASA-1170
                                            /*if (items.Item == "DIVIDER") {Task-02_25977 prasanna 20240215 divider iteminfo is now set with start point from shelf start.
                                            ItemInfo["X"] = items.X + items.W / 2;
                                            } else {*/
                                            ItemInfo["X"] = ShelfInfo["X"] - ShelfInfo["W"] / 2 + items.X + ItemInfo["W"] / 2;
                                            //}
                                            if (ShelfInfo["ObjType"] == "PEGBOARD") {
                                                if (p_json_array[p_pog_index].MassUpdate == "Y") {
                                                    //ASA-25959 didnot minus the base height after mass update
                                                    ItemInfo["Y"] = wpdSetFixed(items.Y - ItemInfo["H"] / 2);
                                                } else {
                                                    ItemInfo["Y"] = wpdSetFixed(items.Y - ItemInfo["H"] / 2 - g_pog_json[p_pog_index].BaseH);
                                                }
                                            } else if (ShelfInfo["ObjType"] == "HANGINGBAR") {
                                                ItemInfo["Y"] = wpdSetFixed(ShelfInfo["Y"] - ItemInfo["H"] / 2);
                                            } else {
                                                if (g_pog_json[p_pog_index].DesignType == "D" && g_pog_json[p_pog_index].MassUpdate == "Y" && ShelfInfo["ObjType"] == "SHELF") {
                                                    ItemInfo["Y"] = wpdSetFixed(ShelfInfo["Y"] + ShelfInfo["H"] / 2 + ItemInfo["H"] / 2);
                                                } else {
                                                    ItemInfo["Y"] = wpdSetFixed(items.Y + ItemInfo["H"] / 2);
                                                }
                                            }
                                            ItemInfo["SlotDivider"] = "N";
                                            // ItemInfo["CapCount"] = 0; Task 25959 kush
                                            ItemInfo["Distance"] = wpdSetFixed(ItemInfo["X"] - ItemInfo["W"] / 2 - shelf_start);
                                            ItemInfo["YDistance"] = wpdSetFixed(ItemInfo["Y"] - ShelfInfo["Y"] + ShelfInfo["H"] / 2);
                                            if (ShelfInfo["ObjType"] == "PEGBOARD") {
                                                ItemInfo["PegBoardX"] = wpdSetFixed(ItemInfo["X"] - ItemInfo["W"] / 2 - shelf_start);
                                                ItemInfo["PegBoardY"] = wpdSetFixed(ItemInfo["Y"] - ItemInfo["H"] / 2 - (ShelfInfo["Y"] - ShelfInfo["H"] / 2));
                                            }
                                            ItemInfo["NewPegId"] = "";
                                            ItemInfo["AutoDiv"] = "N"; //ASA-1406
                                            ItemInfo["MassCrushH"] = typeof items.MassCrushH !== "undefined" && items.MassCrushH !== null ? items.MassCrushH : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST--20240415 Rregression issue 12
                                            ItemInfo["MassCrushV"] = typeof items.MassCrushV !== "undefined" && items.MassCrushV !== null ? items.MassCrushV : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST--20240415 Rregression issue 12
                                            ItemInfo["MassCrushD"] = typeof items.MassCrushD !== "undefined" && items.MassCrushD !== null ? items.MassCrushD : ""; //Task-02_25977 KUSH FOR MASS UPDATE FOR AUTO CRUSH IN CHEST--20240415 Rregression issue 12
                                            // ASA-2010.2                                        
                                            if (ShelfInfo["ObjType"] == "PALLET") {
                                                ItemInfo["Z"] = wpdSetFixed(items.Z + ItemInfo["D"] / 2);
                                            } else {
                                                ItemInfo["Z"] = items.Z == 0 ? wpdSetFixed(items.Z + items.D / 2) : wpdSetFixed(items.Z);
                                            }
                                        } else {
                                            ItemInfo["DimT"] = items.DimT;
                                            ItemInfo["PegID"] = items.PegID;
                                            ItemInfo["PegSpread"] = items.PegSpread;
                                            ItemInfo["PegPerFacing"] = items.PegPerFacing;
                                            ItemInfo["Fixed"] = items.Fixed;
                                            ItemInfo["CapStyle"] = items.CapStyle;
                                            /*ASA-1170, Start*/
                                            ItemInfo["CapFacing"] = items.CapFacing !== null && items.CapFacing !== "" && typeof items.CapFacing !== "undefined" ? items.CapFacing : 0;
                                            ItemInfo["CapMerch"] = items.CapMerch;
                                            ItemInfo["CapOrientaion"] = items.CapOrientaion;
                                            ItemInfo["CapHeight"] = items.CapHeight;
                                            /*ASA-1170, End*/
                                            ItemInfo["CapHorz"] = items.CapHorz !== null && items.CapHorz !== "" && typeof items.CapHorz !== "undefined" ? items.CapHorz : 0; //asa-1341
                                            ItemInfo["CapDepth"] = items.CapDepth !== null && items.CapDepth !== "" && typeof items.CapDepth !== "undefined" ? items.CapDepth : 0; //asa-1341
                                            ItemInfo["CapTotalCount"] = items.CapTotalCount; //ASA-1179
                                            ItemInfo["CapMaxH"] = typeof items.CapMaxH !== "undefined" && items.CapMaxH !== null ? items.CapMaxH : 0;
                                            ItemInfo["MaxHCapStyle"] = typeof items.MaxHCapStyle !== "undefined" && items.MaxHCapStyle !== null ? items.MaxHCapStyle : "3";
                                            ItemInfo["Rotation"] = items.Rotation;
                                            ItemInfo["CrushHoriz"] = items.CrushHoriz;
                                            ItemInfo["CrushVert"] = items.CrushVert;
                                            ItemInfo["CrushD"] = items.CrushD;
                                            ItemInfo["Price"] = items.Price;
                                            ItemInfo["Cost"] = items.Cost;
                                            ItemInfo["RegMovement"] = items.RegMovement;
                                            ItemInfo["RegMovementInd"] = typeof items.RegMovementInd !== "undefined" ? items.RegMovementInd : "";
                                            ItemInfo["DaysOfSupplyInd"] = typeof items.DaysOfSupplyInd !== "undefined" ? items.DaysOfSupplyInd : "";
                                            ItemInfo["AvgSales"] = typeof items.AvgSales !== "undefined" && items.AvgSales != null && items.AvgSales != "" ? Math.floor(items.AvgSales * 100) / 100 : ""; //ASA-1243
                                            ItemInfo["ItemStatus"] = typeof items.ItemStatus !== "undefined" ? items.ItemStatus : "";
                                            ItemInfo["CDTLvl1"] = typeof items.CDTLvl1 !== "undefined" ? items.CDTLvl1 : ""; //ASA-1130
                                            ItemInfo["CDTLvl2"] = typeof items.CDTLvl2 !== "undefined" ? items.CDTLvl2 : ""; //ASA-1130
                                            ItemInfo["CDTLvl3"] = typeof items.CDTLvl3 !== "undefined" ? items.CDTLvl3 : ""; //ASA-1130
                                            ItemInfo["ActualDPP"] = typeof items.ActualDPP !== "undefined" ? items.ActualDPP : ""; //ASA-1277-(3)
                                            ItemInfo["StoreSOH"] = typeof items.StoreSOH !== "undefined" ? items.StoreSOH : ""; //ASA-1277-(3)
                                            ItemInfo["StoreNo"] = typeof items.StoreNo !== "undefined" ? items.StoreNo : ""; //ASA-1277-(3)
                                            ItemInfo["DPPLoc"] = items.DPPLoc; //ASA-1308 Task-3
                                            ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : ""; //ASA-1277-(3)
                                            //ASA-2013 Start
                                            ItemInfo["ShelfPrice"] = typeof items.ShelfPrice !== "undefined" ? items.ShelfPrice : "";
                                            ItemInfo["PromoPrice"] = typeof items.PromoPrice !== "undefined" ? items.PromoPrice : "";
                                            ItemInfo["DiscountRate"] = typeof items.DiscountRate !== "undefined" ? items.DiscountRate : "";
                                            ItemInfo["PriceChangeDate"] = typeof items.PriceChangeDate !== "undefined" ? items.PriceChangeDate : "";
                                            ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : "";
                                            ItemInfo["Qty"] = typeof items.Qty !== "undefined" ? items.Qty : "";
                                            ItemInfo["WhStock"] = typeof items.WhStock !== "undefined" ? items.WhStock : "";
                                            ItemInfo["StoreStock"] = typeof items.StoreStock !== "undefined" ? items.StoreStock : "";
                                            ItemInfo["StockIntransit"] = typeof items.StockIntransit !== "undefined" ? items.StockIntransit : "";
                                            //ASA-2013 End
                                            ItemInfo["MoveBasis"] = items.MoveBasis;
                                            ItemInfo["IsContainer"] = items.IsContainer;
                                            ItemInfo["BsktFactor"] = items.BsktFactor;
                                            ItemInfo["OverHang"] = items.OverHang;
                                            ItemInfo["VertGap"] = items.VertGap;
                                            ItemInfo["OW"] = wpdSetFixed(items.OW);
                                            ItemInfo["OH"] = wpdSetFixed(items.OH);
                                            ItemInfo["OD"] = wpdSetFixed(items.OD);
                                            ItemInfo["Dragged"] = items.Dragged;
                                            ItemInfo["SpreadItem"] = items.SpreadItem;
                                            ItemInfo["MHorizCrushed"] = items.MHorizCrushed;
                                            ItemInfo["MVertCrushed"] = items.MVertCrushed;
                                            ItemInfo["MDepthCrushed"] = items.MDepthCrushed;
                                            ItemInfo["MCapTopFacing"] = items.MCapTopFacing; //ASA-1170
                                            //Start ASA-1369
                                            // ItemInfo["RW"] = items.RW;
                                            // ItemInfo["RH"] = items.RH;
                                            //Start Task_26826
                                            var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.OW, items.OH, items.OD);
                                            ItemInfo["RW"] = wpdSetFixed(item_width * items.BHoriz);
                                            ItemInfo["RH"] = wpdSetFixed(item_height * items.BVert);
                                            ItemInfo["RD"] = wpdSetFixed(item_depth * items.BaseD);
                                            //End Task_26826
                                            //ItemInfo["RD"] = items.RD;
                                            //End ASA-1369
                                            ItemInfo["LObjID"] = items.LObjID;
                                            ItemInfo["SubLblObjID"] = items.SubLblObjID; //ASA-1182
                                            ItemInfo["SlotDivider"] = items.SlotDivider;
                                            ItemInfo["CapCount"] = items.CapCount;
                                            if (p_showSingleModule == "Y") {
                                                ItemInfo["X"] = wpdSetFixed(items.X - total_mod_width);
                                            } else {
                                                ItemInfo["X"] = wpdSetFixed(items.X);
                                            }
                                            ItemInfo["Y"] = wpdSetFixed(items.Y);
                                            if (ShelfInfo["ObjType"] == "HANGINGBAR") {
                                                ItemInfo["Y"] = wpdSetFixed(ShelfInfo["Y"] - items.H / 2);
                                            } else {
                                                ItemInfo["Y"] = wpdSetFixed(items.Y);
                                            }
                                            ItemInfo["BHoriz"] = items.BHoriz;
                                            ItemInfo["BVert"] = items.BVert;
                                            ItemInfo["BaseD"] = items.BaseD;
                                            ItemInfo["W"] = wpdSetFixed(items.W);
                                            ItemInfo["H"] = wpdSetFixed(items.H);
                                            ItemInfo["D"] = wpdSetFixed(items.D);
                                            ItemInfo["Distance"] = items.Distance;
                                            ItemInfo["PegBoardX"] = items.PegBoardX;
                                            ItemInfo["PegBoardY"] = items.PegBoardY;
                                            ItemInfo["NewPegId"] = "";
                                            ItemInfo["YDistance"] = typeof items.YDistance !== "undefined" ? items.YDistance : ItemInfo["Y"] - ShelfInfo["Y"] + ShelfInfo["H"] / 2;
                                            ItemInfo["MassCrushH"] = "N"; //20240415 Rregression issue 12
                                            ItemInfo["MassCrushV"] = "N"; //20240415 Rregression issue 12
                                            ItemInfo["MassCrushD"] = "N"; //20240415 Rregression issue 12
                                            ItemInfo["AutoDiv"] = typeof items.AutoDiv !== "undefined" ? items.AutoDiv : "N"; //ASA-1406
                                            // ASA-2010.2     

                                            if (ShelfInfo["ObjType"] == "PALLET") {
                                                ItemInfo["Z"] = wpdSetFixed(items.Z);
                                            } else {
                                                ItemInfo["Z"] = items.Z == 0 ? wpdSetFixed(items.Z + items.D / 2) : wpdSetFixed(items.Z);
                                            }
                                        }
                                        // ASA-2010.2                                        
                                        // if (ShelfInfo["ObjType"] == "PALLET") {
                                        //     ItemInfo["Z"] = wpdSetFixed(items.Z + ItemInfo["D"] / 2);
                                        // } else {
                                        //     ItemInfo["Z"] = items.Z == 0 ? wpdSetFixed(items.Z + items.D / 2) : wpdSetFixed(items.Z);     
                                        // }   

                                        ItemInfo["Quantity"] = Math.round(items.Quantity * 100) / 100; //items.Quantity; ASA-1243
                                        ItemInfo["ItemID"] = items.ItemID;
                                        ItemInfo["Item"] = items.Item;
                                        if (typeof items.Color == "undefined" || items.Color == null) {
                                            //ASA-1310 prasanna ASA-1310_25890
                                            ItemInfo["Color"] = p_ItemColor;
                                        } else {
                                            ItemInfo["Color"] = items.Color;
                                        }
                                        ItemInfo["Desc"] = items.Desc;
                                        ItemInfo["Barcode"] = items.Barcode;
                                        ItemInfo["LocID"] = items.LocID;
                                        ItemInfo["Orientation"] = items.Orientation;
                                        ItemInfo["MerchStyle"] = items.MerchStyle == null || typeof items.MerchStyle == "undefined" || items.MerchStyle == "" ? "0" : items.MerchStyle;
                                        ItemInfo["Supplier"] = items.Supplier;
                                        if (typeof items.Supplier !== "undefined" && items.Supplier !== "" && items.Supplier !== null) {
                                            //ASA-1222-S //ASA-1350 issue 6 case 2 found a bug as its coming as null
                                            ItemInfo["SupplierName"] = items.Supplier.split("-")[1];
                                        } else {
                                            ItemInfo["SupplierName"] = "";
                                        } //ASA-1222-E
                                        ItemInfo["Brand"] = items.Brand;
                                        ItemInfo["BrandType"] = items.BrandType;
                                        ItemInfo["Group"] = items.Group;
                                        ItemInfo["Dept"] = items.Dept;
                                        ItemInfo["SubClass"] = items.SubClass;
                                        if (typeof items.Dept !== "undefined" && items.Dept !== "" && items.Dept !== null) {
                                            //Task_267933 QA error
                                            var itemdept = items.Dept.split("-"); //ASA-1222-S
                                        } else {
                                            var itemdept = "";
                                        }
                                        if (typeof items.Class !== "undefined" && items.Class !== "" && items.Class !== null) {
                                            //Task_267933 QA error
                                            var itemclass = items.Class.split("-");
                                        } else {
                                            var itemclass = "";
                                        }
                                        if (typeof items.SubClass !== "undefined" && items.SubClass !== "" && items.SubClass !== null) {
                                            //Task_26793 QA error
                                            var itemsubclass = items.SubClass.split("-");
                                        } else {
                                            var itemsubclass = "";
                                        } //ASA-1171 BS
                                        ItemInfo["Class"] = items.Class;
                                        ItemInfo["ClassName"] = itemdept[0] + "/" + itemclass[0] + "/" + itemsubclass[0]; //ASA-1222-E
                                        ItemInfo["StdUOM"] = items.StdUOM;
                                        ItemInfo["SizeDesc"] = typeof items.SizeDesc == "undefined" || items.SizeDesc == null ? "" : items.SizeDesc; //Task_26793 QA error //ASA-1327 noticed error as for some item it is null so from db tag not done.
                                        ItemInfo["HorizGap"] = items.HorizGap;
                                        ItemInfo["UW"] = wpdSetFixed(items.UW);
                                        ItemInfo["UH"] = wpdSetFixed(items.UH);
                                        ItemInfo["UD"] = wpdSetFixed(items.UD);
                                        ItemInfo["CW"] = wpdSetFixed(items.CW);
                                        ItemInfo["CH"] = wpdSetFixed(items.CH);
                                        ItemInfo["CD"] = wpdSetFixed(items.CD);
                                        ItemInfo["TW"] = wpdSetFixed(items.TW);
                                        ItemInfo["TH"] = wpdSetFixed(items.TH);
                                        ItemInfo["TD"] = wpdSetFixed(items.TD);
                                        ItemInfo["DW"] = wpdSetFixed(items.DW);
                                        ItemInfo["DH"] = wpdSetFixed(items.DH);
                                        ItemInfo["DD"] = wpdSetFixed(items.DD);
                                        ItemInfo["CWPerc"] = items.CWPerc;
                                        ItemInfo["CHPerc"] = items.CHPerc;
                                        ItemInfo["CDPerc"] = items.CDPerc;
                                        ItemInfo["TopObjID"] = items.TopObjID;
                                        ItemInfo["BottomObjID"] = items.BottomObjID;
                                        ItemInfo["SecondTier"] = items.SecondTier;
                                        ItemInfo["CompItemObjID"] = items.CompItemObjID;
                                        ItemInfo["SellingPrice"] = Math.round(items.SellingPrice * 100) / 100;
                                        // var salesunit = items.SalesUnit;
                                        // ItemInfo["SalesUnit"] = salesunit.toFixed(2);
                                        ItemInfo["NetSales"] = typeof items.NetSales !== "undefined" && items.NetSales !== "" ? Math.round(items.NetSales * 100) / 100 : 0; //Regression 1 task_26974// //--20240415 Regression Issue 1 – WTCHK 20240428 giving erro in get_sales_info when it is "" and doing tofixed.
                                        ItemInfo["CogsAdj"] = items.CogsAdj;
                                        ItemInfo["CogsAdjInd"] = typeof items.CogsAdjInd !== "undefined" ? items.CogsAdjInd : "";
                                        ItemInfo["RegMovement"] = items.RegMovement;
                                        ItemInfo["RegMovementInd"] = typeof items.RegMovementInd !== "undefined" ? items.RegMovementInd : "";
                                        ItemInfo["AvgSales"] = typeof items.AvgSales !== "undefined" && items.AvgSales != null && items.AvgSales != "" ? Math.floor(items.AvgSales * 100) / 100 : ""; //ASA-1243
                                        ItemInfo["AvgSalesInd"] = typeof items.AvgSalesInd !== "undefined" ? items.AvgSalesInd : "";
                                        ItemInfo["ItemStatus"] = typeof items.ItemStatus !== "undefined" ? items.ItemStatus : "";
                                        ItemInfo["CDTLvl1"] = typeof items.CDTLvl1 !== "undefined" ? items.CDTLvl1 : ""; //ASA-1130
                                        ItemInfo["CDTLvl2"] = typeof items.CDTLvl2 !== "undefined" ? items.CDTLvl2 : ""; //ASA-1130
                                        ItemInfo["CDTLvl3"] = typeof items.CDTLvl3 !== "undefined" ? items.CDTLvl3 : ""; //ASA-1130
                                        ItemInfo["MPogVertFacings"] = typeof items.MPogVertFacings !== "undefined" ? items.MPogVertFacings : ""; //ASA-1408
                                        ItemInfo["MPogHorizFacings"] = typeof items.MPogHorizFacings !== "undefined" ? items.MPogHorizFacings : ""; //ASA-1408
                                        ItemInfo["MPogDepthFacings"] = typeof items.MPogDepthFacings !== "undefined" ? items.MPogDepthFacings : ""; //ASA-1408
                                        ItemInfo["ActualDPP"] = typeof items.ActualDPP !== "undefined" && items.ActualDPP != null && items.ActualDPP != "" ? parseFloat(items.ActualDPP).toFixed(2) : ""; //ASA-1243//ASA-1182  //ASA-1243 ASA-1277-(3)
                                        ItemInfo["DPPLoc"] = items.DPPLoc; //ASA-1308 Task-3
                                        ItemInfo["StoreSOH"] = typeof items.StoreSOH !== "undefined" ? items.StoreSOH : ""; //ASA-1277-(3)
                                        ItemInfo["StoreNo"] = typeof items.StoreNo !== "undefined" ? items.StoreNo : ""; //ASA-1277-(3)
                                        ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : ""; //ASA-1277-(3)
                                        //ASA-2013 Start
                                        ItemInfo["ShelfPrice"] = typeof items.ShelfPrice !== "undefined" ? items.ShelfPrice : "";
                                        ItemInfo["PromoPrice"] = typeof items.PromoPrice !== "undefined" ? items.PromoPrice : "";
                                        ItemInfo["DiscountRate"] = typeof items.DiscountRate !== "undefined" ? items.DiscountRate : "";
                                        ItemInfo["PriceChangeDate"] = typeof items.PriceChangeDate !== "undefined" ? items.PriceChangeDate : "";
                                        ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : "";
                                        ItemInfo["Qty"] = typeof items.Qty !== "undefined" ? items.Qty : "";
                                        ItemInfo["WhStock"] = typeof items.WhStock !== "undefined" ? items.WhStock : "";
                                        ItemInfo["StoreStock"] = typeof items.StoreStock !== "undefined" ? items.StoreStock : "";
                                        ItemInfo["StockIntransit"] = typeof items.StockIntransit !== "undefined" ? items.StockIntransit : "";
                                        //ASA-2013 End
                                        ItemInfo["GrossProfit"] = typeof items.GrossProfit !== "undefined" ? items.GrossProfit : 0; //Regression 1 task_26974
                                        ItemInfo["GrossProfitInd"] = typeof items.GrossProfitInd !== "undefined" ? items.GrossProfitInd : "";
                                        ItemInfo["WeeksCount"] = items.WeeksCount;
                                        ItemInfo["WeeksCountInd"] = typeof items.WeeksCountInd !== "undefined" ? items.WeeksCountInd : "";
                                        ItemInfo["MovingItem"] = items.MovingItem;
                                        ItemInfo["Profit"] = Math.round(items.Profit * 100) / 100;
                                        ItemInfo["TotalMargin"] = items.TotalMargin;
                                        ItemInfo["Price"] = items.Price;
                                        ItemInfo["Cost"] = items.Cost;
                                        ItemInfo["MHorizFacings"] = typeof items.MHorizFacings == "undefined" ? -1 : items.MHorizFacings == null ? -1 : parseInt(items.MHorizFacings);
                                        ItemInfo["MVertFacings"] = typeof items.MVertFacings == "undefined" ? -1 : items.MVertFacings == null ? -1 : parseInt(items.MVertFacings);
                                        ItemInfo["MDepthFacings"] = typeof items.MDepthFacings == "undefined" ? -1 : items.MDepthFacings == null ? -1 : parseInt(items.MDepthFacings);
                                        ItemInfo["Status"] = items.Status;
                                        ItemInfo["DaysOfSupply"] = items.DaysOfSupply;
                                        ItemInfo["DaysOfSupplyInd"] = typeof items.DaysOfSupplyInd !== "undefined" ? items.DaysOfSupplyInd : "";
                                        ItemInfo["ShowColorBackup"] = items.ShowColorBackup;
                                        ItemInfo["OrientationDesc"] = items.OrientationDesc;
                                        ItemInfo["StoreCnt"] = items.StoreCnt;
                                        ItemInfo["NewYN"] = "";
                                        ItemInfo["DescSecond"] = items.DescSecond;
                                        ItemInfo["Delist"] = typeof items.Delist == "undefined" ? "N" : items.Delist;
                                        ItemInfo["OverhungItem"] = typeof items.OverhungItem == "undefined" ? "N" : items.OverhungItem; //ASA-1138

                                        if (ItemInfo["Delist"] == "Y") {
                                            ItemInfo["Color"] = p_ItemDelistColor;
                                        }

                                        if (typeof items.CnW == "undefined") {
                                            ItemInfo["CnW"] = 0;
                                        } else {
                                            ItemInfo["CnW"] = items.CnW;
                                        }
                                        if (typeof items.CnH == "undefined") {
                                            ItemInfo["CnH"] = 0;
                                        } else {
                                            ItemInfo["CnH"] = items.CnH;
                                        }
                                        if (typeof items.CnD == "undefined") {
                                            ItemInfo["CnD"] = 0;
                                        } else {
                                            ItemInfo["CnD"] = items.CnD;
                                        }
                                        if (typeof items.NW == "undefined") {
                                            ItemInfo["NW"] = 0;
                                        } else {
                                            ItemInfo["NW"] = items.NW;
                                        }
                                        if (typeof items.NH == "undefined") {
                                            ItemInfo["NH"] = 0;
                                        } else {
                                            ItemInfo["NH"] = items.NH;
                                        }
                                        if (typeof items.ND == "undefined") {
                                            ItemInfo["ND"] = 0;
                                        } else {
                                            ItemInfo["ND"] = items.ND;
                                        }
                                        ItemInfo["ItemNesting"] = items.ItemNesting;
                                        ItemInfo["NVal"] = ItemInfo["ItemNesting"] == "H" ? items.NH : ItemInfo["ItemNesting"] == "W" ? items.NW : ItemInfo["ItemNesting"] == "D" ? items.ND : 0;

                                        ItemInfo["ItemContain"] = items.ItemContain;
                                        ItemInfo["CnVal"] = ItemInfo["ItemContain"] == "H" ? items.CnH : ItemInfo["ItemContain"] == "W" ? items.CnW : ItemInfo["ItemContain"] == "D" ? items.CnD : 0;

                                        ItemInfo["OldCnW"] = ItemInfo["CnW"];
                                        ItemInfo["OldCnH"] = ItemInfo["CnH"];
                                        ItemInfo["OldCnD"] = ItemInfo["CnD"];
                                        ItemInfo["OldNW"] = ItemInfo["NW"];
                                        ItemInfo["OldNH"] = ItemInfo["NH"];
                                        ItemInfo["OldND"] = ItemInfo["ND"];

                                        ItemInfo["OrgUW"] = wpdSetFixed(items.OrgUW);
                                        ItemInfo["OrgUH"] = wpdSetFixed(items.OrgUH);
                                        ItemInfo["OrgUD"] = wpdSetFixed(items.OrgUD);
                                        ItemInfo["OrgCW"] = wpdSetFixed(items.OrgCW);
                                        ItemInfo["OrgCH"] = wpdSetFixed(items.OrgCH);
                                        ItemInfo["OrgCD"] = wpdSetFixed(items.OrgCD);
                                        ItemInfo["OrgTW"] = wpdSetFixed(items.OrgTW);
                                        ItemInfo["OrgTH"] = wpdSetFixed(items.OrgTH);
                                        ItemInfo["OrgTD"] = wpdSetFixed(items.OrgTD);
                                        ItemInfo["OrgDW"] = wpdSetFixed(items.OrgDW);
                                        ItemInfo["OrgDH"] = wpdSetFixed(items.OrgDH);
                                        ItemInfo["OrgDD"] = wpdSetFixed(items.OrgDD);
                                        ItemInfo["OrgCWPerc"] = items.OrgCWPerc;
                                        ItemInfo["OrgCHPerc"] = items.OrgCHPerc;
                                        ItemInfo["OrgCDPerc"] = items.OrgCDPerc;
                                        ItemInfo["OrgCnW"] = items.OrgCnW;
                                        ItemInfo["OrgCnH"] = items.OrgCnH;
                                        ItemInfo["OrgCnD"] = items.OrgCnD;
                                        ItemInfo["OrgNW"] = items.OrgNW;
                                        ItemInfo["OrgNH"] = items.OrgNH;
                                        ItemInfo["OrgND"] = items.OrgND;
                                        if (typeof items.SizeDesc !== "undefined" && items.SizeDesc !== "") {
                                            var det_arr = items.SizeDesc !== null ? items.SizeDesc.split("*") : [];
                                        } else {
                                            var det_arr = [];
                                        } //ASA-1171 BS
                                        var cap_capacity = items.CapFacing * items.CapDepth * items.CapHorz; //ASA-1273 Prasanna
                                        ItemInfo["Cpct"] = items.BHoriz * items.BVert * items.BaseD + (!isNaN(cap_capacity) ? cap_capacity : 0);
                                        ItemInfo["ImgExists"] = items.ImgExists;
                                        ItemInfo["Exists"] = "E";
                                        ItemInfo["DimUpdate"] = "N";
                                        ItemInfo["ItemImage"] = items.ItemImage;
                                        ItemInfo["Edited"] = "Y";
                                        ItemInfo["OldObjID"] = items.ObjID;
                                        ItemInfo["NewPegId"] = "";
                                        ItemInfo["DFacing"] = items.BaseD;
                                        ItemInfo["UnitperCase"] = items.UnitperCase;
                                        ItemInfo["UnitperTray"] = items.UnitperTray;
                                        ItemInfo["DfacingUpd"] = "N";
                                        ItemInfo["TotalUnitsCalc"] = items.BHoriz * items.BVert * items.BaseD;

                                        //added for new PKsiz-ASA-1273-3
                                        // ItemInfo["PkSiz"] = parseInt(det_arr[0]) / parseInt(det_arr[1]); //ASA-1273 Prasanna
                                        ItemInfo["PkSiz"] = parseInt(det_arr[1]); //ASA-1341 added to print the first numeric value of EngDesc

                                        ItemInfo["ItmDescChi"] = items.ItmDescChi; //ASA-1407 Task 1,//ASA-1407 issue 5
                                        if (det_arr.length > 1) {
                                            //ASA-1273 Prasanna
                                            //ItemInfo["ItmDescEng"] = items.Brand + " " + items.Desc + " " + ItemInfo["PkSiz"] + '*' + det_arr[1] + '*' + det_arr[2];
                                            ItemInfo["ItmDescEng"] = items.Brand + " " + items.Desc + " " + parseInt(det_arr[0]) / parseInt(det_arr[1]) + "*" + det_arr[1] + "*" + det_arr[2]; //ASA-1341 added to print the existing PkSiz value in EngDesc
                                        } else {
                                            ItemInfo["ItmDescEng"] = items.Brand + " " + items.Desc;
                                        }

                                        ItemInfo["Brand_Category"] = typeof items.Brand_Category !== "undefined" ? items.Brand_Category : "";
                                        ItemInfo["Uda_item_status"] = typeof items.Uda_item_status !== "undefined" ? items.Uda_item_status : "";
                                        ItemInfo["Gobecobrand"] = typeof items.Gobecobrand !== "undefined" ? items.Gobecobrand : "";
                                        ItemInfo["Internet"] = typeof items.Internet !== "undefined" ? items.Internet : ""; //ASA-1158-E
                                        ItemInfo["LiveNewItem"] = typeof items.LiveNewItem !== "undefined" ? items.LiveNewItem : ""; //ASA-1250
                                        ItemInfo["CapDepthChanged"] = "N"; // ASA-1273
                                        ItemInfo["Categ"] = typeof items.Categ !== "undefined" ? items.Categ : "";
                                        ItemInfo["COO"] = typeof items.COO !== "undefined" ? items.COO : "";
                                        ItemInfo["ItemSize"] = typeof items.ItemSize !== "undefined" ? items.ItemSize : "";
                                        ItemInfo["SplrLbl"] = typeof items.SplrLbl !== "undefined" ? items.SplrLbl : "";
                                        ItemInfo["EDLP"] = typeof items.EDLP !== "undefined" ? items.EDLP : "";
                                        ItemInfo["GoGreen"] = typeof items.GoGreen !== "undefined" ? items.GoGreen : "";
                                        ItemInfo["LoGrp"] = typeof items.LoGrp !== "undefined" ? items.LoGrp : "";
                                        ItemInfo["SqzPer"] = (typeof items.CrushHoriz !== "undefined" ? items.CrushHoriz : 0) + ":" + (typeof items.CrushVert !== "undefined" ? items.CrushVert : 0) + ":" + (typeof items.CrushD !== "undefined" ? items.CrushD : 0);
                                        ItemInfo["InternationalRng"] = typeof items.InternationalRng !== "undefined" ? items.InternationalRng : "";
                                        ItemInfo["StoreCnt"] = typeof items.StoreCnt !== "undefined" ? items.StoreCnt : ""; //ASA-1182
                                        ItemInfo["NewItem"] = typeof items.NewItem !== "undefined" ? items.NewItem : ""; //ASA-1182
                                        if (typeof items.SalesUnit !== "undefined" && items.SalesUnit !== null) {
                                            var salesunit = items.SalesUnit;
                                            ItemInfo["SalesUnit"] = Math.floor(salesunit * 100) / 100;
                                        } else {
                                            ItemInfo["SalesUnit"] = "";
                                        }

                                        if (typeof items.Remarks !== undefined) {
                                            ItemInfo["Remarks"] = items.Remarks;
                                        } else {
                                            ItemInfo["Remarks"] = "";
                                        }
                                        ItemInfo["UDA751"] = typeof items.UDA751 !== "undefined" ? items.UDA751 : ""; //ASA-1407 Task 1 -S
                                        ItemInfo["UDA755"] = typeof items.UDA755 !== "undefined" ? items.UDA755 : ""; //ASA-1407 Task 1 -E

                                        //ASA-1640 Start
                                        ItemInfo["ItemCondition"] = nvl(items.ItemCondition) != 0 ? items.ItemCondition : "";
                                        ItemInfo["AUR"] = nvl(items.AUR) != 0 ? items.AUR : "";
                                        ItemInfo["ItemRanking"] = nvl(items.ItemRanking) != 0 ? items.ItemRanking : "";
                                        ItemInfo["WeeklySales"] = nvl(items.WeeklySales) != 0 ? items.WeeklySales : "";
                                        ItemInfo["WeeklyNetMargin"] = nvl(items.WeeklyNetMargin) != 0 ? items.WeeklyNetMargin : "";
                                        ItemInfo["WeeklyQty"] = nvl(items.WeeklyQty) != 0 ? items.WeeklyQty : "";
                                        ItemInfo["NetMarginPercent"] = typeof items.NetMarginPercent !== "undefined" ? items.NetMarginPercent : typeof items.NetMarginPerc !== "undefined" ? items.NetMarginPerc : ""; //ASA-1735  issue 4
                                        ItemInfo["CumulativeNM"] = nvl(items.CumulativeNM) != 0 ? items.CumulativeNM : "";
                                        ItemInfo["TOP80B2"] = nvl(items.TOP80B2) != 0 ? items.TOP80B2 : "";
                                        ItemInfo["ItemBrandC"] = nvl(items.ItemBrandC) != 0 ? items.ItemBrandC : "";
                                        ItemInfo["ItemPOGDept"] = nvl(items.ItemPOGDept) != 0 ? items.ItemPOGDept : "";
                                        ItemInfo["ItemRemark"] = nvl(items.ItemRemark) != 0 ? items.ItemRemark : "";
                                        ItemInfo["RTVStatus"] = nvl(items.RTVStatus) != 0 ? items.RTVStatus : "";
                                        ItemInfo["Pusher"] = nvl(items.Pusher) != 0 ? items.Pusher : "";
                                        ItemInfo["Divider"] = nvl(items.Divider) != 0 ? items.Divider : "";
                                        ItemInfo["BackSupport"] = nvl(items.BackSupport) != 0 ? items.BackSupport : "";
                                        //ASA-1640 End
                                        ItemInfo["OOSPerc"] = nvl(items.OOSPerc); //ASA-1750 Issue 2 //nvl(items.OOSPerc) != 0 ? items.OOSPerc : ""; //ASA-1688 Added for OOS%
                                        ItemInfo["InitialItemDesc"] = typeof items.InitialItemDesc !== "undefined" ? items.InitialItemDesc : ""; //ASA-1734 Issue 1
                                        ItemInfo["InitialBrand"] = typeof items.InitialBrand !== "undefined" ? items.InitialBrand : ""; //ASA-1787 Request #6
                                        ItemInfo["InitialBarcode"] = typeof items.InitialBarcode !== "undefined" ? items.InitialBarcode : ""; //ASA-1787 Request #6

                                        //below condition will be Y only from page 25, to calculate auto vertical facings. this can only happen in all the
                                        //shelf details exists to calculate available max merch.
                                        if (p_CopyJsonInd == "Y") {
                                            if ((g_auto_apply_v_facings == "Y" || g_auto_apply_d_facings == "Y") && (ShelfInfo["ObjType"] == "SHELF" || ShelfInfo["ObjType"] == "HANGINGBAR") && items.Item !== "DIVIDER") {
                                                p_copyJson[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[copy_index].ItemInfo[j].ItemX = wpdSetFixed(ItemInfo["ItemX"]);
                                                p_copyJson[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[copy_index].ItemInfo[j].ItemY = wpdSetFixed(ItemInfo["ItemY"]);
                                                var [h, Bvert, rh, y, d, baseD, rd] = calcMaxFacings(p_copyJson, p_mod_index, copy_index, p_copyJson[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[copy_index], ItemInfo, j);
                                                if (g_auto_apply_v_facings == "Y" && nvl(h) !== 0 && (ShelfInfo["ObjType"] == "SHELF" || (ShelfInfo["ObjType"] == "HANGINGBAR" && g_auto_hangbar_facings == "Y"))) {
                                                    ItemInfo["H"] = wpdSetFixed(h);
                                                    ItemInfo["RH"] = wpdSetFixed(rh);
                                                    ItemInfo["BVert"] = Bvert;
                                                    ItemInfo["Y"] = wpdSetFixed(y);
                                                }
                                                if (g_auto_apply_d_facings == "Y" && nvl(d) !== 0 && (ShelfInfo["ObjType"] == "SHELF" || (ShelfInfo["ObjType"] == "HANGINGBAR" && g_auto_hangbar_facings == "Y"))) {
                                                    ItemInfo["BaseD"] = wpdSetFixed(baseD);
                                                    ItemInfo["D"] = wpdSetFixed(d);
                                                    ItemInfo["RD"] = wpdSetFixed(rd);
                                                }
                                            }
                                        }

                                        g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo.push(ItemInfo);
                                        item_ind = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo.length - 1;
                                    } else {
                                        ItemInfo = items;
                                        item_ind = j;
                                    }
                                    //apply reset_top_bottom
                                    if (p_recreate == "Y") {
                                        // Start ASA-1350 issue 6 case 2 corrected from object to use json directly.
                                        var itemdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[item_ind];
                                        //Start Task_26899

                                        itemdtl.MIndex = p_mod_index;
                                        itemdtl.SIndex = i;
                                        itemdtl.IIndex = item_ind;
                                        /*add static 0 because the g_json get data according to pog wise not containe the all pog_json and add if condition due to bacth pdf g_json null ASA-1374 issue 2 */
                                        if (g_json.length > 0) {
                                            //ASA-1374 //ASA-1418
                                            if (g_json[0].ModuleInfo[p_mod_index].ShelfInfo[i].ObjType !== "BASE" && g_json[0].ModuleInfo[p_mod_index].ShelfInfo[i].ObjType !== "NOTCH" && g_json[0].ModuleInfo[p_mod_index].ShelfInfo[i].ObjType !== "TEXTBOX" && g_json[0].ModuleInfo[p_mod_index].ShelfInfo[i].ObjType !== "DIVIDER") {
                                                //ASA-1418 Task 2
                                                g_json[0].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[item_ind].MIndex = p_mod_index; //ASA-1353 issue 3 20240424,p_pog_index
                                                g_json[0].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[item_ind].SIndex = i; // ASA-1374 p_pog_index
                                                g_json[0].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[item_ind].IIndex = item_ind; // ASA-1374 p_pog_index
                                            }
                                        }
                                        //End Task_26899
                                        if (itemdtl.Item == "DIVIDER") {
                                            var objID = add_items(itemdtl.ItemID, itemdtl.W, itemdtl.H, itemdtl.D, itemdtl.Color, itemdtl.X, itemdtl.Y, itemdtl.Z, p_mod_index, i, j, itemdtl.Rotation, p_pog_index);
                                        } else {
                                            //This below condition will be true only when
                                            if (p_crush_item == "Y" && g_pog_json[p_pog_index].MassUpdate == "Y") {
                                                //ASA-1310 KUSH FIX //--20240415 Rregression issue 12
                                                if ((itemdtl.CapStyle == "1" || itemdtl.CapStyle == "2" || itemdtl.CapStyle == "3") && itemdtl.CapCount == 0) {
                                                    await set_item_capping(p_pog_index, p_mod_index, i, j, "Y", "N"); //ASA-1410 issue 10 20240625 //ASA-1412 issue 1 20240628 //ASA-1936 Issue 1
                                                }
                                                //Start Task-02_25977
                                                //var [item_owidth, item_oheight, item_odepth, wActualHeight, wActualWidth, wActualDepth] = get_new_orientation_dim(itemdtl.Orientation, 0, 0, 0);//ASA-1353 issue 3 --Task_27104
                                                // if (wActualHeight == 'H' || wActualWidth == 'H' || wActualDepth == 'H') {//ASA-1353 issue 3 --Task_27104
                                                if (!(ShelfInfo["ObjType"] == "CHEST" && g_chest_as_pegboard == "Y")) {
                                                    //20240708 Regression issue 4
                                                    if (itemdtl.MVertCrushed == "Y" || itemdtl.MassCrushV == "Y" || ShelfInfo["AllowAutoCrush"] == "Y") { //ASA-2000 POINT 5 ADDING CONDITION
                                                        var retval = crushItem(p_pog_index, p_mod_index, i, j, "H", "Y", [itemdtl.D], [j], "Y"); //ASA-1383 issue 8//20240415 Rregression issue 12 20240430
                                                    }
                                                    // }
                                                    //if (wActualHeight == 'W' || wActualWidth == 'W' || wActualDepth == 'W') {//ASA-1353 issue 3 --Task_27104
                                                    if (itemdtl.MHorizCrushed == "Y" || itemdtl.MassCrushH == "Y" || ShelfInfo["AllowAutoCrush"] == "Y") {
                                                        //&& ShelfInfo["Combine"] =="N") { //crush issue regression 6 ,--asa-1353 issue 3-- && itemdtl.CWPerc !== 0 //ASA-1386  Issue 1
                                                        var retval = crushItem(p_pog_index, p_mod_index, i, j, "W", "Y", [itemdtl.D], [j], ShelfInfo["DivPed"] == "Y" && ShelfInfo["DivWidth"] > 0 ? "Y" : "N"); //ASA-1383 issue 8//ASA-1353 regression issue
                                                        l_item_crush = retval == "Y" ? "Y" : "N"; //ASA-1349 issue 2-3
                                                    }
                                                    //  }
                                                    //  if (wActualHeight == 'D' || wActualWidth == 'D' || wActualDepth == 'D') {//ASA-1353 issue 3 --Task_27104
                                                    if (itemdtl.MDepthCrushed == "Y" || itemdtl.MassCrushD == "Y" || ShelfInfo["AllowAutoCrush"] == "Y") {
                                                        // && ShelfInfo["Combine"] =="N") { //ASA-1351 issue 5 ,--asa-1353 issue 3   && itemdtl.CDPerc !== 0 //ASA-1386  Issue 1
                                                        var retval = crushItem(p_pog_index, p_mod_index, i, j, "D", "Y", [itemdtl.D], [j], "Y"); //ASA-1383 issue 8//ASA-1353 regression issue,//ASA-1442 issue 7
                                                    }
                                                } //20240708 Regression issue 4
                                                //  }
                                                //End Task-02_25977

                                                if (p_new_pog_ind == "N" && p_pog_type == "F") {
                                                    //ASA-25959 Kush added x and y set agin after crush  calculation
                                                    if (items.Item == "DIVIDER") {
                                                        itemdtl.X = wpdSetFixed(items.X + items.W / 2);
                                                    } else {
                                                        itemdtl.X = wpdSetFixed(ShelfInfo["X"] - ShelfInfo["W"] / 2 + items.X + itemdtl.W / 2);
                                                    }
                                                    if (ShelfInfo["ObjType"] == "PEGBOARD") {
                                                        if (p_json_array[p_pog_index].MassUpdate == "Y") {
                                                            //ASA-25959 didnot minus the base height after mass update
                                                            itemdtl.Y = wpdSetFixed(items.Y - itemdtl.H / 2);
                                                        } else {
                                                            itemdtl.Y = wpdSetFixed(items.Y - itemdtl.H / 2 - g_pog_json[p_pog_index].BaseH);
                                                        }
                                                    } else if (ShelfInfo["ObjType"] == "HANGINGBAR") {
                                                        itemdtl.Y = wpdSetFixed(ShelfInfo["Y"] - itemdtl.H / 2);
                                                    } else {
                                                        if (g_pog_json[p_pog_index].DesignType == "D" && g_pog_json[p_pog_index].MassUpdate == "Y" && ShelfInfo["ObjType"] == "SHELF") {
                                                            itemdtl.Y = wpdSetFixed(ShelfInfo["Y"] + ShelfInfo["H"] / 2 + itemdtl.H / 2);
                                                        } else {
                                                            itemdtl.Y = wpdSetFixed(items.Y + itemdtl.H / 2);
                                                        }
                                                    }
                                                    itemdtl.Distance = wpdSetFixed(itemdtl.X - itemdtl.W / 2 - shelf_start);
                                                    itemdtl.YDistance = wpdSetFixed(itemdtl.Y - ShelfInfo["Y"] + ShelfInfo["H"] / 2);
                                                    if (ShelfInfo["ObjType"] == "PEGBOARD") {
                                                        itemdtl.PegBoardX = wpdSetFixed(itemdtl.X - itemdtl.W / 2 - shelf_start);
                                                        itemdtl.PegBoardY = wpdSetFixed(itemdtl.Y - itemdtl.H / 2 - (ShelfInfo["Y"] - ShelfInfo["H"] / 2));
                                                    }
                                                }
                                            }
                                            var itemdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[item_ind];
                                            if (g_show_live_image == "N") {
                                                //  console.log(" g_orientation_jsoni", items.Orientation);
                                                // console.log("detail of g_orientation_jsoni", g_orientation_json[items.Orientation]);
                                                var details = g_orientation_json[items.Orientation];

                                                var details_arr = details.split("###");
                                                // var details = g_orientation_json[items.Orientation];
                                                //     var details_arr = (details || "0###0").toString().split("###");
                                                //     var orientX = parseInt(details_arr[0]) || 0;
                                                //     var orientY = parseInt(details_arr[1]) || 0;
                                                //  var objID = await add_items_with_image(itemdtl.ItemID, itemdtl.W, itemdtl.H, itemdtl.D, itemdtl.Color, itemdtl.X, itemdtl.Y, itemdtl.Z, p_mod_index, i, j, itemdtl.BHoriz, itemdtl.BVert, itemdtl.Item, orientX, orientY, "N", "Y", p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index);
                                                var objID = await add_items_with_image(itemdtl.ItemID, itemdtl.W, itemdtl.H, itemdtl.D, itemdtl.Color, itemdtl.X, itemdtl.Y, itemdtl.Z, p_mod_index, i, j, itemdtl.BHoriz, itemdtl.BVert, itemdtl.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", "Y", p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index);
                                            } else {
                                                var objID = await add_items_prom(itemdtl.ItemID, itemdtl.W, itemdtl.H, itemdtl.D, itemdtl.Color, itemdtl.X, itemdtl.Y, itemdtl.Z, p_mod_index, i, j, "N", "Y", p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index);
                                            }
                                        }
                                        var selectedObject = g_world.getObjectById(objID);
                                        if (typeof selectedObject !== "undefined" && g_show_live_image == "N") {
                                            if (itemdtl.Status == "N") {
                                                selectedObject.BorderColour = g_status_error_color;
                                                selectedObject.Status = "N";
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
                                        }
                                        // End ASA-1350 issue 6 case 2 corrected from object to use json directly.
                                        if (ShelfInfo["ObjType"] == "PALLET") {
                                            g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[j].Z = wpdSetFixed(itemdtl.Z); //ASA-1892 Issue 3
                                            //   g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[j].Z = wpdSetFixed(items.Z + items.D / 2)* itemdtl.DFacing; //ASA-1892 Issue 3
                                        } else {
                                            g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[j].Z = 0.016;
                                        }
                                        g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[j].ObjID = objID;
                                        g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[j].CType = ShelfInfo["ObjType"];
                                    }
                                    j = j + 1;
                                }
                                var shelfObj = g_world.getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].SObjID);
                                if (typeof shelfObj !== "undefined") {
                                    shelfObj.AvlSpace = wpdSetFixed(shelfObj.AvlSpace * 100); //parseFloat((shelfObj.AvlSpace * 100).toFixed(3));
                                }
                                //ASA-2010 Issue1 Start
                                // if (ShelfInfo["ObjType"] == "SHELF") {
                                //     var returnval = await reset_top_bottom_objects(p_mod_index, i, "Y", p_pog_index);
                                // }
                                if (ShelfInfo["ObjType"] == "SHELF" || ShelfInfo["ObjType"] == "PALLET") {
                                    var returnval = await reset_top_bottom_objects(p_mod_index, i, "Y", p_pog_index);
                                }
                                //ASA-2010 Issue1 End
                                var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i];
                                if (shelfdtl.Combine == "N" && l_item_crush == "Y" && !(shelfdtl.ObjType == "CHEST" && g_chest_as_pegboard == "Y") && shelfdtl.ObjType !== "PEGBOARD") {
                                    //--Task_26793 prod issue //ASA-1387 Issue 2, added "shelfdtl.Combine == "N",Found error when reorder for combined shelfs suggested by prasanna need to confirm tomorrow(commented on 20240422)

                                    var spread_gap = shelfdtl.HorizGap;
                                    var horiz_gap = spread_gap;
                                    var spread_product = shelfdtl.SpreadItem;
                                    var item_length = shelfdtl.ItemInfo.length;
                                    var allow_crush = shelfdtl.AllowAutoCrush;
                                    if (reorder_items(p_mod_index, i, p_pog_index)) {
                                        var k = 0;
                                        for (item_info of shelfdtl.ItemInfo) {
                                            var new_x = get_item_xaxis(item_info.W, item_info.H, item_info.D, item_info.CType, "", horiz_gap, spread_product, spread_gap, p_mod_index, i, k, "Y", item_length, "N", p_pog_index);
                                            item_info.X = wpdSetFixed(new_x);
                                            //Start ASA-1350 issue 6 case 2 -- after last item crush it needs to be created with new width.
                                            var selectedObject = g_world.getObjectById(item_info.ObjID);
                                            g_world.remove(selectedObject);
                                            if (item_info.Item == "DIVIDER") {
                                                //ASA-1402
                                                var objID = add_items(item_info.ItemID, item_info.W, item_info.H, item_info.D, item_info.Color, item_info.X, item_info.Y, item_info.Z, p_mod_index, i, k, item_info.Rotation, p_pog_index);
                                            } else {
                                                //ASA-1402
                                                if (g_show_live_image == "Y") {
                                                    var details = g_orientation_json[item_info.Orientation];
                                                    var details_arr = details.split("###");

                                                    var objID = await add_items_with_image(item_info.ItemID, item_info.W, item_info.H, item_info.D, item_info.Color, item_info.X, item_info.Y, item_info.Z, p_mod_index, i, k, item_info.BHoriz, item_info.BVert, item_info.Item, parseInt(details_arr[0]), parseInt(details_arr[1]), "N", "Y", p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index);
                                                } else {
                                                    var objID = await add_items_prom(item_info.ItemID, item_info.W, item_info.H, item_info.D, item_info.Color, item_info.X, item_info.Y, item_info.Z, p_mod_index, i, k, "N", "Y", p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index);
                                                }
                                            } //ASA-1402
                                            g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[i].ItemInfo[k].ObjID = objID;
                                            //End ASA-1350 issue 6 case 2
                                            k++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    i = i + 1;
                }
                var l_shelf_details = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo;
                var l_shelf_cnt = 0;
                for (const shelfs of l_shelf_details) {
                    var l_item_cnt = 0;
                    for (const items of shelfs.ItemInfo) {
                        if (items.Item == "DIVIDER") {
                            var l_dup_shelf = 0;
                            for (const shelfs_dtl of l_shelf_details) {
                                if (shelfs_dtl.ObjType == "DIVIDER" && shelfs_dtl.Shelf == items.ItemID) {
                                    g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[l_dup_shelf].ShelfDivObjID = items.ObjID;
                                }
                                l_dup_shelf++;
                            }
                        }
                        l_item_cnt++;
                    }
                    l_shelf_cnt++;
                }
            }
        }
        render(p_pog_index);
        logDebug("function : create_shelf_from_json_lib", "E");
    } catch (err) {
        error_handling(err);
    }
}


async function create_shelf_edit_pog_lib(p_mod_index, p_json_array, p_module_width, p_draft_ind, p_new_pog_ind, p_pog_type, p_carpark_ind, p_recreate, p_create_json, p_AutoPlacing, p_ShelfColor, p_DivColor, p_SlotDivider, p_SlotOrientation, p_DividerFixed, p_ItemColor, p_ItemDelistColor, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_notchHead, p_updateObjInd, p_camera, p_pog_index, p_orgPogIndex, p_m_crush = "N") {
    logDebug("function : create_shelf_edit_pog_lib; mod_index : " + p_mod_index + "; p_module_width : " + p_module_width + "; draft_ind : " + p_draft_ind + "; new_pog_ind : " + p_new_pog_ind + "; pog_type : " + p_pog_type + "; carpark_ind : " + p_carpark_ind + "; recreate : " + p_recreate, "S");
    try {
        var newObjectID = -1;
        if (typeof p_json_array !== "undefined") {
            if (p_json_array.length > 0) {
                var carparkItemInfo = [];
                var i = 0;
                for (const shelfs in p_json_array) {
                    var selectedObject = g_world.getObjectById(shelfs.SObjID);
                    g_world.remove(selectedObject);
                    i++;
                }

                var l_shelf_details = p_json_array;
                var i = 0;
                for (const shelfs of p_json_array) {
                    // $.each(json_array, function (i, shelfs) {
                    var selectedObject = g_world.getObjectById(shelfs.SObjID);
                    g_world.remove(selectedObject);
                    // });
                    i++;
                }
                if (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark.length > 0) {
                    if (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[0] !== "undefined") {
                        if (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[0].ItemInfo !== "undefined") {
                            if (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[0].ItemInfo.length > 0) {
                                carparkItemInfo = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[0].ItemInfo));
                                for (d of carparkItemInfo) {
                                    var selectedObject = g_world.getObjectById(d.ObjID);
                                    g_world.remove(selectedObject);
                                }
                            }
                        }
                    }
                }
                if (p_create_json == "Y") {
                    g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark = [];
                }
                var i = 0;
                for (const shelfs of l_shelf_details) {
                    var shelf_ind = -1;
                    if (shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "BASE") {
                        var ShelfInfo = {};
                        if (p_create_json == "Y") {
                            if (p_carpark_ind == "N") {
                                ShelfInfo["X"] = shelfs.X;
                                ShelfInfo["Y"] = shelfs.Y;
                                ShelfInfo["Z"] = shelfs.Z;
                                ShelfInfo["GrillH"] = shelfs.GrillH;
                                ShelfInfo["LOverhang"] = shelfs.LOverhang;
                                ShelfInfo["ROverhang"] = shelfs.ROverhang;
                                ShelfInfo["SpacerThick"] = shelfs.SpacerThick;
                                ShelfInfo["HorizGap"] = shelfs.HorizGap !== null && shelfs.HorizGap !== "" && typeof shelfs.HorizGap !== "undefined" ? shelfs.HorizGap : 0; //ASA-1902
                                ShelfInfo["SpreadItem"] = shelfs.SpreadItem;
                                ShelfInfo["Combine"] = shelfs.Combine;
                                ShelfInfo["AllowAutoCrush"] = shelfs.AllowAutoCrush;
                                ShelfInfo["HorizSlotStart"] = shelfs.HorizSlotStart;
                                ShelfInfo["HorizSlotSpacing"] = shelfs.HorizSlotSpacing;
                                ShelfInfo["HorizStart"] = shelfs.HorizStart;
                                ShelfInfo["HorizSpacing"] = shelfs.HorizSpacing;
                                ShelfInfo["UOverHang"] = shelfs.UOverHang;
                                ShelfInfo["LoOverHang"] = shelfs.LoOverHang;
                                ShelfInfo["VertiStart"] = shelfs.VertiStart;
                                ShelfInfo["VertiSpacing"] = shelfs.VertiSpacing;
                                ShelfInfo["BsktFill"] = shelfs.BsktFill;
                                ShelfInfo["BsktSpreadProduct"] = shelfs.BsktSpreadProduct;
                                ShelfInfo["SnapTo"] = shelfs.SnapTo;
                                ShelfInfo["BsktWallH"] = shelfs.BsktWallH;
                                ShelfInfo["BsktBaseH"] = shelfs.BsktBaseH;
                                ShelfInfo["BsktWallThickness"] = shelfs.BsktWallThickness;
                                ShelfInfo["DSlotStart"] = shelfs.DSlotStart;
                                ShelfInfo["DSlotSpacing"] = shelfs.DSlotSpacing;
                                ShelfInfo["DGap"] = shelfs.DGap;
                                ShelfInfo["FrontOverHang"] = shelfs.FrontOverHang;
                                ShelfInfo["BackOverHang"] = shelfs.BackOverHang;
                                ShelfInfo["SlotDivider"] = shelfs.SlotDivider;
                                ShelfInfo["AllowOverLap"] = shelfs.AllowOverLap;
                                ShelfInfo["AutoPlacing"] = typeof shelfs.AutoPlacing !== "undefined" && shelfs.AutoPlacing !== "" ? shelfs.AutoPlacing : "";
                                ShelfInfo["AutoFillPeg"] = typeof shelfs.AutoFillPeg !== "undefined" && shelfs.AutoFillPeg !== "" ? shelfs.AutoFillPeg : ""; //ASA-1109
                                ShelfInfo["AvlSpace"] = shelfs.W + shelfs.LOverhang + shelfs.ROverhang;
                                ShelfInfo["WrapText"] = shelfs.WrapText;
                                ShelfInfo["ReduceToFit"] = shelfs.ReduceToFit;
                                ShelfInfo["TextDirection"] = shelfs.TextDirection;
                                ShelfInfo["SlotOrientation"] = shelfs.SlotOrientation;
                                ShelfInfo["DividerFixed"] = shelfs.DividerFixed;
                                ShelfInfo["LObjID"] = shelfs.LObjID;
                                ShelfInfo["NotchLabelObjID"] = shelfs.NotchLabelObjID;
                                ShelfInfo["Shelf"] = shelfs.Shelf;
                                ShelfInfo["ObjType"] = shelfs.ObjType;
                                ShelfInfo["Desc"] = shelfs.Desc;
                                ShelfInfo["MaxMerch"] = shelfs.MaxMerch;
                                ShelfInfo["FStyle"] = shelfs.FStyle;
                                ShelfInfo["FSize"] = shelfs.FSize;
                                ShelfInfo["FBold"] = shelfs.FBold;
                                ShelfInfo["TextImg"] = shelfs.TextImg;
                                ShelfInfo["TextImgName"] = shelfs.TextImgName; //ASA-1650 issue 10
                                ShelfInfo["TextImgMime"] = shelfs.TextImgMime; //ASA-1650 issue 10
                                ShelfInfo["NotchNo"] = shelfs.NotchNo;
                                ShelfInfo["ManualCrush"] = typeof shelfs.ManualCrush !== "undefined" && shelfs.ManualCrush !== "" ? shelfs.ManualCrush : p_m_crush; //ASA-1300
                                ShelfInfo["Overhung"] = typeof shelfs.Overhung == "undefined" && shelfs.Overhung !== "" ? "N" : shelfs.Overhung; //ASA-1138
                                if (shelfs.ObjType == "BASE") {
                                    ShelfInfo["H"] = g_pog_json[p_pog_index].BaseH;
                                    ShelfInfo["W"] = g_pog_json[p_pog_index].BaseW;
                                    ShelfInfo["D"] = g_pog_json[p_pog_index].BaseD;
                                    ShelfInfo["Color"] = g_pog_json[p_pog_index].Color;
                                } else if (shelfs.ObjType == "NOTCH") {
                                    ShelfInfo["H"] = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].H;
                                    ShelfInfo["W"] = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].NotchW;
                                    ShelfInfo["D"] = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].D;
                                    ShelfInfo["Color"] = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Color;
                                } else {
                                    ShelfInfo["H"] = shelfs.H;
                                    ShelfInfo["W"] = shelfs.W;
                                    ShelfInfo["D"] = shelfs.D;
                                    if (typeof shelfs.Color == "undefined" || shelfs.Color == "#0") {
                                        ShelfInfo["Color"] = p_ShelfColor;
                                    } else {
                                        ShelfInfo["Color"] = shelfs.Color;
                                    }
                                }
                                ShelfInfo["Rotation"] = shelfs.Rotation;
                                ShelfInfo["Slope"] = shelfs.Slope;

                                ShelfInfo["LiveImage"] = shelfs.LiveImage;
                                ShelfInfo["InputText"] = shelfs.InputText;
                                ShelfInfo["CompShelfObjID"] = shelfs.CompShelfObjID;
                                ShelfInfo["ManualZupdate"] = shelfs.ManualZupdate;
                                ShelfInfo["OldObjID"] = shelfs.SObjID;
                                ShelfInfo["DivHeight"] = shelfs.DivHeight; //ASA-1265
                                ShelfInfo["DivWidth"] = shelfs.DivWidth; //ASA-1265
                                ShelfInfo["DivPst"] = shelfs.DivPst; //ASA-1265
                                ShelfInfo["DivPed"] = shelfs.DivPed; //ASA-1265
                                ShelfInfo["DivPbtwFace"] = shelfs.DivPbtwFace; //ASA-1265
                                ShelfInfo["DivStX"] = isNaN(shelfs.DivStX) ? 0 : shelfs.DivStX; //Task_27734 shelfs.DivStX; //ASA-1265
                                ShelfInfo["DivSpaceX"] = isNaN(shelfs.DivSpaceX) ? 0 : shelfs.DivSpaceX; //Task_27734 shelfs.DivSpaceX; //ASA-1265
                                ShelfInfo["DivFillCol"] = shelfs.DivFillCol; //ASA-1265
                                ShelfInfo["NoDivIDShow"] = shelfs.NoDivIDShow; //ASA-1406
                                ShelfInfo["ChestEdit"] = shelfs.ChestEdit !== null && shelfs.ChestEdit !== "" && typeof shelfs.ChestEdit !== "undefined" ? shelfs.ChestEdit : "N"; //Bug-26122 - splitting the chest
                                ShelfInfo["ItemInfo"] = [];
                            } else {
                                ShelfInfo["Shelf"] = shelfs.Shelf;
                                ShelfInfo["ObjType"] = "SHELF";
                                ShelfInfo["Desc"] = "CARPARK_SHELF";
                                ShelfInfo["MaxMerch"] = 0;
                                ShelfInfo["GrillH"] = 0;
                                ShelfInfo["LOverhang"] = 0;
                                ShelfInfo["ROverhang"] = 0;
                                ShelfInfo["SpacerThick"] = 0;
                                ShelfInfo["HorizGap"] = 0;
                                ShelfInfo["SpreadItem"] = "L";
                                ShelfInfo["Combine"] = "N";
                                ShelfInfo["AllowAutoCrush"] = "N";
                                ShelfInfo["H"] = shelfs.H;
                                ShelfInfo["W"] = shelfs.W;
                                ShelfInfo["D"] = shelfs.D;
                                ShelfInfo["Rotation"] = 0;
                                ShelfInfo["Slope"] = 0;
                                ShelfInfo["Color"] = p_DivColor;
                                ShelfInfo["LiveImage"] = "";
                                ShelfInfo["HorizSlotStart"] = 0;
                                ShelfInfo["HorizSlotSpacing"] = 0;
                                ShelfInfo["HorizStart"] = 0;
                                ShelfInfo["HorizSpacing"] = 0;
                                ShelfInfo["UOverHang"] = 0;
                                ShelfInfo["LoOverHang"] = 0;
                                ShelfInfo["VertiStart"] = 0;
                                ShelfInfo["VertiSpacing"] = 0;
                                ShelfInfo["X"] = shelfs.X;
                                ShelfInfo["Y"] = shelfs.Y;

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
                                ShelfInfo["SlotDivider"] = p_SlotDivider;
                                ShelfInfo["AllowOverLap"] = "N";
                                ShelfInfo["AutoPlacing"] = "N";
                                ShelfInfo["AutoFillPeg"] = "N"; //ASA-1109
                                ShelfInfo["SlotOrientation"] = p_SlotOrientation;
                                ShelfInfo["DividerFixed"] = p_DividerFixed;
                                ShelfInfo["LObjID"] = -1;
                                ShelfInfo["NotchLabelObjID"] = -1;
                                ShelfInfo["FStyle"] = "";
                                ShelfInfo["FSize"] = "";
                                ShelfInfo["FBold"] = "";
                                ShelfInfo["TextImg"] = "";
                                ShelfInfo["TextImgName"] = "";
                                ShelfInfo["TextImgMime"] = "";
                                ShelfInfo["TextImageBlob"] = "";
                                ShelfInfo["ItemInfo"] = [];
                                ShelfInfo["Overhung"] = "N"; //ASA-1138
                                ShelfInfo["DivHeight"] = 0; //ASA-1265
                                ShelfInfo["DivWidth"] = 0; //ASA-1265
                                ShelfInfo["DivPst"] = "N"; //ASA-1265
                                ShelfInfo["DivPed"] = "N"; //ASA-1265
                                ShelfInfo["DivPbtwFace"] = "N"; //ASA-1265
                                ShelfInfo["NoDivIDShow"] = "N"; //ASA-1406
                                ShelfInfo["DivStX"] = 0; //ASA-1265
                                ShelfInfo["DivSpaceX"] = 0; //ASA-1265
                                ShelfInfo["DivFillCol"] = p_DivColor; //ASA-1265
                            }

                            if (shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "BASE" && p_carpark_ind == "N") {
                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.push(ShelfInfo);
                                shelf_ind = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length - 1;
                            } else if (p_carpark_ind == "Y" && shelfs.ItemInfo !== null && shelfs.ItemInfo.length > 0) {
                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark.push(ShelfInfo);
                                shelf_ind = 0;
                            }
                        } else {
                            ShelfInfo = shelfs;
                            shelf_ind = i;
                        }
                        var shelf_start = ShelfInfo["X"] - ShelfInfo["W"] / 2;

                        var colorValue = parseInt(ShelfInfo["Color"].replace("#", "0x"), 16);
                        var hex_decimal = new THREE.Color(colorValue);
                        var final_height = 0;
                        if (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null && p_recreate == "Y")) {
                            if (ShelfInfo["ObjType"] == "PEGBOARD") {
                                var return_val = add_pegboard(ShelfInfo["Shelf"], ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], 0.004, "N", ShelfInfo["VertiStart"], ShelfInfo["VertiSpacing"], ShelfInfo["HorizStart"], ShelfInfo["HorizSpacing"], p_mod_index, g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length - 1, ShelfInfo["Rotation"], ShelfInfo["Slope"], "N", p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index); //ASA-1350 issue 6 added parameters
                            } else if (ShelfInfo["ObjType"] == "TEXTBOX") {
                                if (g_show_live_image == "Y" && ShelfInfo["TextImg"] !== "" && typeof ShelfInfo["TextImg"] !== "undefined" && ShelfInfo["TextImg"] !== null) {
                                    var return_val = await add_text_box_with_image(ShelfInfo["Shelf"], "TEXTBOX", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"], "N", p_mod_index, ShelfInfo["InputText"], colorValue, ShelfInfo["WrapText"], ShelfInfo["ReduceToFit"], ShelfInfo["Color"], g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length - 1, ShelfInfo["Rotation"], ShelfInfo["Slope"], "N", ShelfInfo["FStyle"], ShelfInfo["FSize"], ShelfInfo["FBold"], p_notchHead, p_pog_index);
                                } else {
                                    var return_val = add_text_box(ShelfInfo["Shelf"], "TEXTBOX", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], ShelfInfo["Z"], "N", p_mod_index, ShelfInfo["InputText"], colorValue, ShelfInfo["WrapText"], ShelfInfo["ReduceToFit"], ShelfInfo["Color"], g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length - 1, ShelfInfo["Rotation"], ShelfInfo["Slope"], "N", ShelfInfo["FStyle"], ShelfInfo["FSize"], ShelfInfo["FBold"], p_enlargeNo, p_pog_index, g_pogcr_enhance_textbox_fontsize, shelfs.TextDirection);
                                }

                                mod_details = g_pog_json[p_pog_index].ModuleInfo;
                                var c = 0;
                                for (const modules of mod_details) {
                                    if (typeof modules.ParentModule !== "undefined" && modules.ParentModule !== null && modules.Module == ShelfInfo["Shelf"]) {
                                        g_pog_json[p_pog_index].ModuleInfo[c].ObjID = return_val;
                                    }
                                    c = c + 1;
                                }
                            } else if (ShelfInfo["ObjType"] == "ROD") {
                                var return_val = add_rod(ShelfInfo["Shelf"], "SHELF", ShelfInfo["W"], ShelfInfo["H"], ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], 0.004, "N", p_mod_index, g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length - 1, p_pog_index);
                            } else if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null) && ((p_carpark_ind == "Y" && shelfs.ItemInfo !== null && shelfs.ItemInfo.length > 0) || p_carpark_ind == "N")) {
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
                                var [return_val, shelf_cnt] = await add_shelf(ShelfInfo["Shelf"], "SHELF", ShelfInfo["W"], final_height, ShelfInfo["D"], hex_decimal, ShelfInfo["X"], ShelfInfo["Y"], 0.004, "N", p_mod_index, ShelfInfo["Rotation"], ShelfInfo["Slope"], shelf_ind, "N", p_carpark_ind, "Y", -1, p_pogCarparkShelfDftColor, p_notchHead, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index, p_json_array /*20241223 Reg 2*/); //ASA-1350 issue 6 added parameters

                                newObjectID = return_val;
                                if (p_updateObjInd == "Y") {
                                    var res = updateObjID(ShelfInfo["OldObjID"], return_val, "S");
                                }
                            }
                        }
                        if (shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX" && (typeof g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == "undefined" || g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ParentModule == null)) {
                            if (typeof p_json_array[i].ItemInfo !== "undefined") {
                                if (p_json_array[i].ItemInfo !== null && p_json_array[i].ItemInfo.length > 0) {
                                    if (p_carpark_ind == "Y") {
                                        item_Details = carparkItemInfo;
                                    } else {
                                        var item_Details = shelfs.ItemInfo;
                                    }

                                    item_Details.sort((a, b) => (a.X > b.X ? 1 : -1));

                                    if (p_carpark_ind == "Y") {
                                        var newItems = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_ind].ItemInfo;
                                        for (d of newItems) {
                                            var selectedObject = g_world.getObjectById(d.ObjID);
                                            g_world.remove(selectedObject);
                                        }
                                    }
                                    var j = 0;
                                    for (items of item_Details) {
                                        var selectedObject = g_world.getObjectById(items.ObjID);
                                        g_world.remove(selectedObject);
                                        var ItemInfo = {};
                                        if (p_create_json == "Y") {
                                            if (p_carpark_ind !== "Y") {
                                                ItemInfo["DimT"] = items.DimT;
                                                ItemInfo["PegID"] = items.PegID;
                                                ItemInfo["PegSpread"] = items.PegSpread;
                                                ItemInfo["PegPerFacing"] = items.PegPerFacing;
                                                ItemInfo["Fixed"] = items.Fixed;
                                                ItemInfo["CapStyle"] = items.CapStyle;
                                                /*ASA-1170, Start*/
                                                ItemInfo["CapFacing"] = items.CapFacing;
                                                ItemInfo["CapMerch"] = items.CapMerch;
                                                ItemInfo["CapOrientaion"] = items.CapOrientaion;
                                                ItemInfo["CapHeight"] = items.CapHeight;
                                                /*ASA-1170, End*/
                                                ItemInfo["CapHorz"] = items.CapHorz; //ASA-1179
                                                ItemInfo["CapDepth"] = items.CapDepth; //ASA-1179
                                                ItemInfo["CapTotalCount"] = items.CapTotalCount; //ASA-1179
                                                ItemInfo["CapMaxH"] = items.CapMaxH;
                                                ItemInfo["MaxHCapStyle"] = items.MaxHCapStyle;
                                                ItemInfo["Rotation"] = items.Rotation;
                                                ItemInfo["BaseD"] = items.BaseD;
                                                ItemInfo["CrushHoriz"] = typeof items.CrushHoriz !== "undefined" ? items.CrushHoriz : "";
                                                ItemInfo["CrushVert"] = typeof items.CrushVert !== "undefined" ? items.CrushVert : "";
                                                ItemInfo["CrushD"] = typeof items.CrushD !== "undefined" ? items.CrushD : "";
                                                ItemInfo["Price"] = items.Price;
                                                ItemInfo["Cost"] = items.Cost;
                                                ItemInfo["RegMovement"] = items.RegMovement;
                                                ItemInfo["RegMovementInd"] = typeof items.RegMovementInd !== "undefined" ? items.RegMovementInd : "";
                                                ItemInfo["DaysOfSupplyInd"] = typeof items.DaysOfSupplyInd !== "undefined" ? items.DaysOfSupplyInd : "";
                                                ItemInfo["AvgSales"] = typeof items.AvgSales !== "undefined" ? Math.floor(items.AvgSales * 100) / 100 : "";
                                                ItemInfo["AvgSalesInd"] = typeof items.AvgSalesInd !== "undefined" ? items.AvgSalesInd : "";
                                                ItemInfo["ItemStatus"] = typeof items.ItemStatus !== "undefined" ? items.ItemStatus : "";
                                                ItemInfo["CDTLvl1"] = typeof items.CDTLvl1 !== "undefined" ? items.CDTLvl1 : ""; //ASA-1130
                                                ItemInfo["CDTLvl2"] = typeof items.CDTLvl2 !== "undefined" ? items.CDTLvl2 : ""; //ASA-1130
                                                ItemInfo["CDTLvl3"] = typeof items.CDTLvl3 !== "undefined" ? items.CDTLvl3 : ""; //ASA-1130
                                                ItemInfo["DPPLoc"] = items.DPPLoc; //ASA-1308 Task-3
                                                ItemInfo["ActualDPP"] = typeof items.ActualDPP !== "undefined" ? items.ActualDPP : ""; //ASA-1277-(3)
                                                ItemInfo["StoreSOH"] = typeof items.StoreSOH !== "undefined" ? items.StoreSOH : ""; //ASA-1277-(3)
                                                ItemInfo["StoreNo"] = typeof items.StoreNo !== "undefined" ? items.StoreNo : ""; //ASA-1277-(3)
                                                ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : ""; //ASA-1277-(3)
                                                //ASA-2013 Start
                                                ItemInfo["ShelfPrice"] = typeof items.ShelfPrice !== "undefined" ? items.ShelfPrice : "";
                                                ItemInfo["PromoPrice"] = typeof items.PromoPrice !== "undefined" ? items.PromoPrice : "";
                                                ItemInfo["DiscountRate"] = typeof items.DiscountRate !== "undefined" ? items.DiscountRate : "";
                                                ItemInfo["PriceChangeDate"] = typeof items.PriceChangeDate !== "undefined" ? items.PriceChangeDate : "";
                                                ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : "";
                                                ItemInfo["Qty"] = typeof items.Qty !== "undefined" ? items.Qty : "";
                                                ItemInfo["WhStock"] = typeof items.WhStock !== "undefined" ? items.WhStock : "";
                                                ItemInfo["StoreStock"] = typeof items.StoreStock !== "undefined" ? items.StoreStock : "";
                                                ItemInfo["StockIntransit"] = typeof items.StockIntransit !== "undefined" ? items.StockIntransit : "";
                                                //ASA-2013 End
                                                ItemInfo["MoveBasis"] = items.MoveBasis;
                                                ItemInfo["ItemNesting"] = items.ItemNesting;
                                                ItemInfo["NVal"] = items.NVal;
                                                ItemInfo["ItemContain"] = items.ItemContain;
                                                ItemInfo["CnVal"] = items.CnVal;
                                                ItemInfo["IsContainer"] = items.IsContainer;
                                                ItemInfo["BsktFactor"] = items.BsktFactor;
                                                ItemInfo["OverHang"] = items.OverHang;
                                                ItemInfo["VertGap"] = items.VertGap;
                                                ItemInfo["OW"] = items.OW;
                                                ItemInfo["OH"] = items.OH;
                                                ItemInfo["OD"] = items.OD;
                                                ItemInfo["Quantity"] = items.Quantity;
                                                ItemInfo["Dragged"] = items.Dragged;
                                                ItemInfo["SpreadItem"] = items.SpreadItem;
                                                ItemInfo["MHorizCrushed"] = items.MHorizCrushed;
                                                ItemInfo["MVertCrushed"] = items.MVertCrushed;
                                                ItemInfo["MDepthCrushed"] = items.MDepthCrushed;
                                                ItemInfo["MCapTopFacing"] = items.MCapTopFacing; //ASA-1170
                                                ItemInfo["RW"] = items.RW;
                                                ItemInfo["RH"] = items.RH;
                                                ItemInfo["RD"] = items.RD;
                                                ItemInfo["LObjID"] = items.LObjID;
                                                ItemInfo["SubLblObjID"] = items.SubLblObjID; //ASA-1182
                                                ItemInfo["DimUpdate"] = items.DimUpdate;
                                                ItemInfo["SlotDivider"] = items.SlotDivider;
                                                ItemInfo["CapCount"] = items.CapCount;
                                                ItemInfo["X"] = items.X;
                                                ItemInfo["Y"] = items.Y;
                                                ItemInfo["Z"] = items.Z;
                                                ItemInfo["BHoriz"] = items.BHoriz;
                                                ItemInfo["BVert"] = items.BVert;
                                                ItemInfo["W"] = items.W;
                                                ItemInfo["H"] = items.H;

                                                ItemInfo["ItemID"] = items.ItemID;
                                                ItemInfo["Item"] = items.Item;
                                                ItemInfo["D"] = items.D;
                                                if (typeof items.Color == "undefined" || items.Color == null) {
                                                    //--ASA-1310 prasanna ASA-1310_25890_new
                                                    ItemInfo["Color"] = p_ItemColor;
                                                } else {
                                                    ItemInfo["Color"] = items.Color;
                                                }
                                                ItemInfo["Desc"] = items.Desc;
                                                ItemInfo["Barcode"] = items.Barcode;
                                                ItemInfo["LocID"] = items.LocID;
                                                ItemInfo["Orientation"] = items.Orientation;
                                                ItemInfo["MerchStyle"] = items.MerchStyle;
                                                ItemInfo["Supplier"] = typeof items.Supplier == "undefined" || items.Supplier == null ? "" : items.Supplier.split("-")[1]; //ASA-1381 -- error found during testing. supplier was undefined and split gave error.
                                                ItemInfo["Brand"] = items.Brand;
                                                ItemInfo["BrandType"] = items.BrandType;
                                                ItemInfo["Group"] = items.Group;
                                                ItemInfo["Dept"] = items.Dept;
                                                ItemInfo["Class"] = items.Class;
                                                ItemInfo["SubClass"] = items.SubClass;
                                                ItemInfo["StdUOM"] = items.StdUOM;
                                                ItemInfo["SizeDesc"] = typeof items.SizeDesc == "undefined" || items.SizeDesc == null ? "" : items.SizeDesc; //Task_26793 QA error //ASA-1327 noticed error as for some item it is null so from db tag not done.
                                                ItemInfo["HorizGap"] = items.HorizGap;
                                                ItemInfo["UW"] = items.UW;
                                                ItemInfo["UH"] = items.UH;
                                                ItemInfo["UD"] = items.UD;
                                                ItemInfo["CW"] = items.CW;
                                                ItemInfo["CH"] = items.CH;
                                                ItemInfo["CD"] = items.CD;
                                                ItemInfo["TW"] = items.TW;
                                                ItemInfo["TH"] = items.TH;
                                                ItemInfo["TD"] = items.TD;
                                                ItemInfo["DW"] = items.DW;
                                                ItemInfo["DH"] = items.DH;
                                                ItemInfo["DD"] = items.DD;
                                                ItemInfo["CWPerc"] = items.CWPerc;
                                                ItemInfo["CHPerc"] = items.CHPerc;
                                                ItemInfo["CDPerc"] = items.CDPerc;
                                                ItemInfo["CnW"] = items.CnW;
                                                ItemInfo["CnH"] = items.CnH;
                                                ItemInfo["CnD"] = items.CnD;
                                                ItemInfo["NW"] = items.NW;
                                                ItemInfo["NH"] = items.NH;
                                                ItemInfo["ND"] = items.ND;
                                                ItemInfo["OldCnW"] = items.CnW;
                                                ItemInfo["OldCnH"] = items.CnH;
                                                ItemInfo["OldCnD"] = items.CnD;
                                                ItemInfo["OldNW"] = items.NW;
                                                ItemInfo["OldNH"] = items.NH;
                                                ItemInfo["OldND"] = items.ND;

                                                ItemInfo["OrgUW"] = items.OrgUW;
                                                ItemInfo["OrgUH"] = items.OrgUH;
                                                ItemInfo["OrgUD"] = items.OrgUD;
                                                ItemInfo["OrgCW"] = items.OrgCW;
                                                ItemInfo["OrgCH"] = items.OrgCH;
                                                ItemInfo["OrgCD"] = items.OrgCD;
                                                ItemInfo["OrgTW"] = items.OrgTW;
                                                ItemInfo["OrgTH"] = items.OrgTH;
                                                ItemInfo["OrgTD"] = items.OrgTD;
                                                ItemInfo["OrgDW"] = items.OrgDW;
                                                ItemInfo["OrgDH"] = items.OrgDH;
                                                ItemInfo["OrgDD"] = items.OrgDD;
                                                ItemInfo["OrgCWPerc"] = items.OrgCWPerc;
                                                ItemInfo["OrgCHPerc"] = items.OrgCHPerc;
                                                ItemInfo["OrgCDPerc"] = items.OrgCDPerc;
                                                ItemInfo["OrgCnW"] = items.OrgCnW;
                                                ItemInfo["OrgCnH"] = items.OrgCnH;
                                                ItemInfo["OrgCnD"] = items.OrgCnD;
                                                ItemInfo["OrgNW"] = items.OrgNW;
                                                ItemInfo["OrgNH"] = items.OrgNH;
                                                ItemInfo["OrgND"] = items.OrgND;
                                                ItemInfo["TopObjID"] = items.TopObjID;
                                                ItemInfo["BottomObjID"] = items.BottomObjID;
                                                ItemInfo["SecondTier"] = items.SecondTier;
                                                ItemInfo["CompItemObjID"] = items.CompItemObjID;
                                                ItemInfo["SellingPrice"] = parseFloat(nvl(items.SellingPrice)); //20240415 Regression issue 1 parseFloat and nvl
                                                if (items.SalesUnit !== "undefined") {
                                                    var salesunit = parseFloat(nvl(items.SalesUnit)); //20240415 Regression issue 1 parseFloat and nvl
                                                    ItemInfo["SalesUnit"] = Math.floor(salesunit * 100) / 100;
                                                } else {
                                                    ItemInfo["SalesUnit"] = "";
                                                }
                                                ItemInfo["NetSales"] = parseFloat(nvl(items.NetSales)); //20240415 Regression issue 1 parseFloat and nvl
                                                ItemInfo["CogsAdj"] = items.CogsAdj;
                                                ItemInfo["CogsAdjInd"] = typeof items.CogsAdjInd !== "undefined" ? items.CogsAdjInd : "";
                                                ItemInfo["GrossProfit"] = items.GrossProfit;
                                                ItemInfo["GrossProfitInd"] = typeof items.GrossProfitInd !== "undefined" ? items.GrossProfitInd : "";
                                                ItemInfo["MovingItem"] = items.MovingItem;
                                                ItemInfo["WeeksCount"] = items.WeeksCount;
                                                ItemInfo["WeeksCountInd"] = typeof items.WeeksCountInd !== "undefined" ? items.WeeksCountInd : "";
                                                ItemInfo["Profit"] = parseFloat(nvl(items.Profit)); //20240415 Regression issue 1 parseFloat and nvl
                                                ItemInfo["GoGreen"] = items.GoGreen;
                                                ItemInfo["TotalMargin"] = parseFloat(nvl(items.TotalMargin)); //20240415 Regression issue 1 parseFloat and nvl
                                                ItemInfo["MHorizFacings"] = typeof items.MHorizFacings == "undefined" ? -1 : items.MHorizFacings == null ? -1 : parseInt(items.MHorizFacings);
                                                ItemInfo["MVertFacings"] = typeof items.MVertFacings == "undefined" ? -1 : items.MVertFacings == null ? -1 : parseInt(items.MVertFacings);
                                                ItemInfo["MDepthFacings"] = typeof items.MDepthFacings == "undefined" ? -1 : items.MDepthFacings == null ? -1 : parseInt(items.MDepthFacings);
                                                ItemInfo["Status"] = items.Status;
                                                ItemInfo["OrientationDesc"] = items.OrientationDesc;
                                                ItemInfo["StoreCnt"] = items.StoreCnt;
                                                ItemInfo["NewYN"] = "";
                                                ItemInfo["Delist"] = items.Delist;
                                                ItemInfo["ImgExists"] = items.ImgExists;
                                                ItemInfo["Exists"] = "E";
                                                ItemInfo["OldObjID"] = items.ObjID;
                                                ItemInfo["DescSecond"] = items.DescSecond;
                                                ItemInfo["OverhungItem"] = typeof items.OverhungItem == "undefined" ? "N" : items.OverhungItem; //ASA-1138
                                                ItemInfo["CapDepthChanged"] = "N"; //ASA-1273
                                                ItemInfo["Brand"] = items.Brand; //ASA-1292 - Issue 5 Start
                                                ItemInfo["ItmDescChi"] = items.ItmDescChi; //ASA-1407 Task 1,//ASA-1407 issue 5
                                                var det_arr = items.SizeDesc.split("*");
                                                if (det_arr.length > 1) {
                                                    ItemInfo["ItmDescEng"] = items.Brand + " " + items.Desc + " " + parseInt(det_arr[0]) / parseInt(det_arr[1]) + "*" + det_arr[1] + "*" + det_arr[2];
                                                } else {
                                                    ItemInfo["ItmDescEng"] = items.Brand + " " + items.Desc;
                                                }
                                                ItemInfo["PkSiz"] = parseInt(det_arr[1]);
                                                ItemInfo["Brand_Category"] = typeof items.Brand_Category !== "undefined" ? items.Brand_Category : "";
                                                ItemInfo["ItemSize"] = typeof items.ItemSize !== "undefined" ? items.ItemSize : "";
                                                ItemInfo["Categ"] = typeof items.Categ !== "undefined" ? items.Categ : "";
                                                ItemInfo["Uda_item_status"] = typeof items.Uda_item_status !== "undefined" ? items.Uda_item_status : "";
                                                ItemInfo["Gobecobrand"] = typeof items.Gobecobrand !== "undefined" ? items.Gobecobrand : "";
                                                ItemInfo["InternationalRng"] = typeof items.InternationalRng !== "undefined" ? items.InternationalRng : "";
                                                ItemInfo["EDLP"] = typeof items.EDLP !== "undefined" ? items.EDLP : "";
                                                ItemInfo["LoGrp"] = typeof items.LoGrp !== "undefined" ? items.LoGrp : "";
                                                ItemInfo["COO"] = typeof items.COO !== "undefined" ? items.COO : ""; //ASA-1292 - Issue 5 End
                                                ItemInfo["UDA751"] = typeof items.UDA751 !== "undefined" ? items.UDA751 : ""; //ASA-1407 Task 1 -S
                                                ItemInfo["UDA755"] = typeof items.UDA755 !== "undefined" ? items.UDA755 : ""; //ASA-1407 Task 1 -E
                                                ItemInfo["MPogDepthFacings"] = typeof items.MPogDepthFacings !== "undefined" ? items.MPogDepthFacings : ""; //ASA-1408
                                                ItemInfo["MPogHorizFacings"] = typeof items.MPogHorizFacings !== "undefined" ? items.MPogHorizFacings : ""; //ASA-1408
                                                ItemInfo["MPogVertFacings"] = typeof items.MPogVertFacings !== "undefined" ? items.MPogVertFacings : ""; //ASA-1408
                                                //ASA-1640 Start
                                                ItemInfo["ItemCondition"] = nvl(items.ItemCondition) != 0 ? items.ItemCondition : "";
                                                ItemInfo["AUR"] = nvl(items.AUR) != 0 ? items.AUR : "";
                                                ItemInfo["ItemRanking"] = nvl(items.ItemRanking) != 0 ? items.ItemRanking : "";
                                                ItemInfo["WeeklySales"] = nvl(items.WeeklySales) != 0 ? items.WeeklySales : "";
                                                ItemInfo["WeeklyNetMargin"] = nvl(items.WeeklyNetMargin) != 0 ? items.WeeklyNetMargin : "";
                                                ItemInfo["WeeklyQty"] = nvl(items.WeeklyQty) != 0 ? items.WeeklyQty : "";
                                                ItemInfo["NetMarginPercent"] = typeof items.NetMarginPercent !== "undefined" ? items.NetMarginPercent : typeof items.NetMarginPerc !== "undefined" ? NetMarginPerc : ""; //ASA-1735  issue 4
                                                ItemInfo["CumulativeNM"] = nvl(items.CumulativeNM) != 0 ? items.CumulativeNM : "";
                                                ItemInfo["TOP80B2"] = nvl(items.TOP80B2) != 0 ? items.TOP80B2 : "";
                                                ItemInfo["ItemBrandC"] = nvl(items.ItemBrandC) != 0 ? items.ItemBrandC : "";
                                                ItemInfo["ItemPOGDept"] = nvl(items.ItemPOGDept) != 0 ? items.ItemPOGDept : "";
                                                ItemInfo["ItemRemark"] = nvl(items.ItemRemark) != 0 ? items.ItemRemark : "";
                                                ItemInfo["RTVStatus"] = nvl(items.RTVStatus) != 0 ? items.RTVStatus : "";
                                                ItemInfo["Pusher"] = nvl(items.Pusher) != 0 ? items.Pusher : "";
                                                ItemInfo["Divider"] = nvl(items.Divider) != 0 ? items.Divider : "";
                                                ItemInfo["BackSupport"] = nvl(items.BackSupport) != 0 ? items.BackSupport : "";
                                                ItemInfo["OOSPerc"] = nvl(items.OOSPerc); //ASA-1750 Issue 2 //nvl(items.OOSPerc) != 0 ? items.OOSPerc : ""; //ASA-1688 Added for OOS%
                                                ItemInfo["InitialItemDesc"] = typeof items.InitialItemDesc !== "undefined" ? items.InitialItemDesc : ""; //ASA-1734 Issue 1
                                                ItemInfo["InitialBrand"] = typeof items.InitialBrand !== "undefined" ? items.InitialBrand : ""; //ASA-1787 Request #6
                                                ItemInfo["InitialBarcode"] = typeof items.InitialBarcode !== "undefined" ? items.InitialBarcode : ""; //ASA-1787 Request #6
                                                //ASA-1640 End
                                                ItemInfo["Distance"] = wpdSetFixed(nvl(items.Distance)); //ASA-1738
                                            } else {
                                                if (p_new_pog_ind == "N" && p_pog_type == "F") {
                                                    ItemInfo["DimT"] = items.MerchStyle;
                                                    ItemInfo["PegID"] = "";
                                                    ItemInfo["PegSpread"] = "";
                                                    ItemInfo["PegPerFacing"] = "";
                                                    ItemInfo["Fixed"] = "N";
                                                    ItemInfo["CapStyle"] = "0";
                                                    /*ASA-1170, Start*/
                                                    ItemInfo["CapFacing"] = "";
                                                    ItemInfo["CapMerch"] = "";
                                                    ItemInfo["CapOrientaion"] = "";
                                                    ItemInfo["CapHeight"] = "";
                                                    /*ASA-1170, End*/
                                                    ItemInfo["CapHorz"] = ""; //ASA-1179
                                                    ItemInfo["CapDepth"] = ""; //ASA-1179
                                                    ItemInfo["CapTotalCount"] = ""; //ASA-1179
                                                    ItemInfo["CapMaxH"] = 0;
                                                    ItemInfo["MaxHCapStyle"] = "3";
                                                    ItemInfo["Rotation"] = 0;
                                                    ItemInfo["CrushHoriz"] = 0;
                                                    ItemInfo["CrushVert"] = 0;
                                                    ItemInfo["CrushD"] = 0;
                                                    ItemInfo["Price"] = "";
                                                    ItemInfo["Cost"] = "";
                                                    ItemInfo["RegMovement"] = "";
                                                    ItemInfo["RegMovementInd"] = typeof items.RegMovementInd !== "undefined" ? items.RegMovementInd : "";
                                                    ItemInfo["DaysOfSupplyInd"] = typeof items.DaysOfSupplyInd !== "undefined" ? items.DaysOfSupplyInd : "";
                                                    ItemInfo["AvgSales"] = typeof items.AvgSales !== "undefined" ? Math.floor(items.AvgSales * 100) / 100 : "";
                                                    ItemInfo["ItemStatus"] = typeof items.ItemStatus !== "undefined" ? items.ItemStatus : "";
                                                    ItemInfo["CDTLvl1"] = ""; //ASA-1130
                                                    ItemInfo["CDTLvl2"] = ""; //ASA-1130
                                                    ItemInfo["CDTLvl3"] = ""; //ASA-1130
                                                    ItemInfo["ActualDPP"] = ""; //ASA-1277-(3)
                                                    ItemInfo["DPPLoc"] = ""; //ASA-1308 Task-3
                                                    ItemInfo["StoreSOH"] = ""; //ASA-1277-(3)
                                                    ItemInfo["StoreNo"] = ""; //ASA-1277-(3)
                                                    ItemInfo["WeeksOfInventory"] = ""; //ASA-1277-(3)
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
                                                    ItemInfo["MoveBasis"] = "";
                                                    ItemInfo["IsContainer"] = "N";
                                                    ItemInfo["BsktFactor"] = 0;
                                                    ItemInfo["OverHang"] = 0;
                                                    ItemInfo["VertGap"] = 0;
                                                    ItemInfo["BHoriz"] = items.BHoriz == null ? 1 : items.BHoriz;
                                                    ItemInfo["BVert"] = items.BVert == null ? 1 : items.BVert;
                                                    ItemInfo["BaseD"] = items.BaseD == null ? 1 : items.BaseD;

                                                    //getting dimension according to orientation.
                                                    //var [item_width, item_height, item_depth, actualHeight, actualWidth, actualDepth] = get_new_orientation_dim(items.Orientation, items.W, items.H, items.D);
                                                    ItemInfo["W"] = items.W;
                                                    ItemInfo["H"] = items.H;
                                                    ItemInfo["D"] = items.D;
                                                    if (ShelfInfo["ObjType"] == "BASKET") {
                                                        ItemInfo["W"] = ShelfInfo["W"];
                                                        ItemInfo["H"] = items.D * items.Quantity;
                                                        ItemInfo["D"] = items.D * ItemInfo["BaseD"];
                                                        ItemInfo["RW"] = items.W;
                                                        ItemInfo["RH"] = items.H;
                                                        ItemInfo["RD"] = items.D;
                                                    } else {
                                                        ItemInfo["W"] = ItemInfo["W"] * ItemInfo["BHoriz"];
                                                        ItemInfo["H"] = ItemInfo["H"] * ItemInfo["BVert"];
                                                        ItemInfo["D"] = ItemInfo["D"] * ItemInfo["BaseD"];
                                                        ItemInfo["RW"] = ItemInfo["W"];
                                                        ItemInfo["RH"] = ItemInfo["H"];
                                                        ItemInfo["RD"] = ItemInfo["D"];
                                                    }

                                                    ItemInfo["OW"] = items.W;
                                                    ItemInfo["OH"] = items.H;
                                                    ItemInfo["OD"] = items.D;
                                                    ItemInfo["LObjID"] = items.LObjID;
                                                    ItemInfo["SubLblObjID"] = items.SubLblObjID; //ASA-1182
                                                    ItemInfo["Dragged"] = "N";
                                                    ItemInfo["SpreadItem"] = 0;
                                                    ItemInfo["MHorizCrushed"] = "N";
                                                    ItemInfo["MVertCrushed"] = "N";
                                                    ItemInfo["MDepthCrushed"] = "N";
                                                    ItemInfo["MCapTopFacing"] = "N"; //ASA-1170
                                                    ItemInfo["X"] = items.X;
                                                    ItemInfo["Y"] = ShelfInfo["Y"] + ShelfInfo["H"] / 2 + ItemInfo["H"] / 2;
                                                    //ItemInfo["Y"] = items.Y;
                                                    ItemInfo["Z"] = items.Z;
                                                    ItemInfo["SlotDivider"] = "N";
                                                    ItemInfo["CapCount"] = 0;
                                                    ItemInfo["Distance"] = ItemInfo["X"] - ItemInfo["W"] / 2 - shelf_start;
                                                    if (ShelfInfo["ObjType"] == "PEGBOARD") {
                                                        ItemInfo["PegBoardX"] = ItemInfo["X"] - ItemInfo["W"] / 2 - shelf_start;
                                                        ItemInfo["PegBoardY"] = ItemInfo["Y"] - ItemInfo["H"] / 2 - (ShelfInfo["Y"] - ShelfInfo["H"] / 2);
                                                    }
                                                } else {
                                                    ItemInfo["DimT"] = items.DimT;
                                                    ItemInfo["PegID"] = items.PegID;
                                                    ItemInfo["PegSpread"] = items.PegSpread;
                                                    ItemInfo["PegPerFacing"] = items.PegPerFacing;
                                                    ItemInfo["Fixed"] = items.Fixed;
                                                    ItemInfo["CapStyle"] = items.CapStyle;
                                                    /*ASA-1170, Start*/
                                                    ItemInfo["CapFacing"] = items.CapFacing;
                                                    ItemInfo["CapMerch"] = items.CapMerch;
                                                    ItemInfo["CapOrientaion"] = items.CapOrientaion;
                                                    ItemInfo["CapHeight"] = items.CapHeight;
                                                    /*ASA-1170, End*/
                                                    ItemInfo["CapHorz"] = items.CapHorz; //ASA-1179
                                                    ItemInfo["CapDepth"] = items.CapDepth; //ASA-1179
                                                    ItemInfo["CapTotalCount"] = items.CapTotalCount; //ASA-1179
                                                    ItemInfo["CapMaxH"] = typeof items.CapMaxH !== "undefined" ? items.CapMaxH : 0;
                                                    ItemInfo["MaxHCapStyle"] = typeof items.MaxHCapStyle !== "undefined" ? items.MaxHCapStyle : "3";
                                                    ItemInfo["Rotation"] = items.Rotation;
                                                    ItemInfo["CrushHoriz"] = items.CrushHoriz;
                                                    ItemInfo["CrushVert"] = items.CrushVert;
                                                    ItemInfo["CrushD"] = items.CrushD;
                                                    ItemInfo["Price"] = items.Price;
                                                    ItemInfo["Cost"] = items.Cost;
                                                    ItemInfo["RegMovement"] = items.RegMovement;
                                                    ItemInfo["RegMovementInd"] = typeof items.RegMovementInd !== "undefined" ? items.RegMovementInd : "";
                                                    ItemInfo["DaysOfSupplyInd"] = typeof items.DaysOfSupplyInd !== "undefined" ? items.DaysOfSupplyInd : "";
                                                    ItemInfo["AvgSales"] = typeof items.AvgSales !== "undefined" ? Math.floor(items.AvgSales * 100) / 100 : "";
                                                    ItemInfo["ItemStatus"] = typeof items.ItemStatus !== "undefined" ? items.ItemStatus : "";
                                                    ItemInfo["CDTLvl1"] = typeof items.CDTLvl1 !== "undefined" ? items.CDTLvl1 : ""; //ASA-1130
                                                    ItemInfo["CDTLvl2"] = typeof items.CDTLvl2 !== "undefined" ? items.CDTLvl2 : ""; //ASA-1130
                                                    ItemInfo["CDTLvl3"] = typeof items.CDTLvl3 !== "undefined" ? items.CDTLvl3 : ""; //ASA-1130
                                                    ItemInfo["ActualDPP"] = typeof items.ActualDPP !== "undefined" ? items.ActualDPP : ""; //ASA-1277-(3)
                                                    ItemInfo["DPPLoc"] = items.DPPLoc; //ASA-1308 Task-3
                                                    ItemInfo["StoreSOH"] = typeof items.StoreSOH !== "undefined" ? items.StoreSOH : ""; //ASA-1277-(3)
                                                    ItemInfo["StoreNo"] = typeof items.StoreNo !== "undefined" ? items.StoreNo : ""; //ASA-1277-(3)
                                                    ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : ""; //ASA-1277-(3)
                                                    //ASA-2013 Start
                                                    ItemInfo["ShelfPrice"] = typeof items.ShelfPrice !== "undefined" ? items.ShelfPrice : "";
                                                    ItemInfo["PromoPrice"] = typeof items.PromoPrice !== "undefined" ? items.PromoPrice : "";
                                                    ItemInfo["DiscountRate"] = typeof items.DiscountRate !== "undefined" ? items.DiscountRate : "";
                                                    ItemInfo["PriceChangeDate"] = typeof items.PriceChangeDate !== "undefined" ? items.PriceChangeDate : "";
                                                    ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : "";
                                                    ItemInfo["Qty"] = typeof items.Qty !== "undefined" ? items.Qty : "";
                                                    ItemInfo["WhStock"] = typeof items.WhStock !== "undefined" ? items.WhStock : "";
                                                    ItemInfo["StoreStock"] = typeof items.StoreStock !== "undefined" ? items.StoreStock : "";
                                                    ItemInfo["StockIntransit"] = typeof items.StockIntransit !== "undefined" ? items.StockIntransit : "";
                                                    //ASA-2013 End
                                                    ItemInfo["MoveBasis"] = items.MoveBasis;
                                                    ItemInfo["IsContainer"] = items.IsContainer;
                                                    ItemInfo["BsktFactor"] = items.BsktFactor;
                                                    ItemInfo["OverHang"] = items.OverHang;
                                                    ItemInfo["VertGap"] = items.VertGap;
                                                    ItemInfo["OW"] = items.OW;
                                                    ItemInfo["OH"] = items.OH;
                                                    ItemInfo["OD"] = items.OD;
                                                    ItemInfo["Dragged"] = items.Dragged;
                                                    ItemInfo["SpreadItem"] = items.SpreadItem;
                                                    ItemInfo["MHorizCrushed"] = items.MHorizCrushed;
                                                    ItemInfo["MVertCrushed"] = items.MVertCrushed;
                                                    ItemInfo["MDepthCrushed"] = items.MDepthCrushed;
                                                    ItemInfo["MCapTopFacing"] = items.MCapTopFacing; //ASA-1170
                                                    ItemInfo["RW"] = items.RW;
                                                    ItemInfo["RH"] = items.RH;
                                                    ItemInfo["RD"] = items.RD;
                                                    ItemInfo["LObjID"] = items.LObjID;
                                                    ItemInfo["SubLblObjID"] = items.SubLblObjID; //ASA-1182
                                                    ItemInfo["SlotDivider"] = items.SlotDivider;
                                                    ItemInfo["CapCount"] = items.CapCount;
                                                    ItemInfo["X"] = items.X;
                                                    ItemInfo["Y"] = items.Y;
                                                    if (ShelfInfo["ObjType"] == "HANGINGBAR") {
                                                        ItemInfo["Y"] = ShelfInfo["Y"] - items.H / 2;
                                                    } else {
                                                        ItemInfo["Y"] = items.Y;
                                                    }
                                                    ItemInfo["BHoriz"] = items.BHoriz;
                                                    ItemInfo["BVert"] = items.BVert;
                                                    ItemInfo["BaseD"] = items.BaseD;
                                                    ItemInfo["W"] = items.W;
                                                    ItemInfo["H"] = items.H;
                                                    ItemInfo["D"] = items.D;
                                                    ItemInfo["Distance"] = items.Distance;
                                                    ItemInfo["PegBoardX"] = items.PegBoardX;
                                                    ItemInfo["PegBoardY"] = items.PegBoardY;
                                                }
                                                ItemInfo["Z"] = items.Z == 0 ? items.Z + items.D / 2 : items.Z;
                                                ItemInfo["Quantity"] = items.Quantity;
                                                ItemInfo["ItemID"] = items.ItemID;
                                                ItemInfo["Item"] = items.Item;
                                                if (typeof items.Color == "undefined" || items.Color == null) {
                                                    //--ASA-1310 prasanna ASA-1310_25890_new
                                                    ItemInfo["Color"] = p_ItemColor;
                                                } else {
                                                    ItemInfo["Color"] = items.Color;
                                                }
                                                ItemInfo["Desc"] = items.Desc;
                                                ItemInfo["Barcode"] = items.Barcode;
                                                ItemInfo["LocID"] = items.LocID;
                                                ItemInfo["Orientation"] = items.Orientation;
                                                ItemInfo["MerchStyle"] = items.MerchStyle == null || typeof items.MerchStyle == "undefined" || items.MerchStyle == "" ? "0" : items.MerchStyle;
                                                ItemInfo["Supplier"] = items.Supplier;
                                                ItemInfo["Brand"] = items.Brand;
                                                ItemInfo["BrandType"] = items.BrandType;
                                                ItemInfo["Group"] = items.Group;
                                                ItemInfo["Dept"] = items.Dept;
                                                ItemInfo["Class"] = items.Class;
                                                ItemInfo["SubClass"] = items.SubClass;
                                                ItemInfo["StdUOM"] = items.StdUOM;
                                                ItemInfo["SizeDesc"] = typeof items.SizeDesc == "undefined" || items.SizeDesc == null ? "" : items.SizeDesc; //Task_26793 QA error //ASA-1327 noticed error as for some item it is null so from db tag not done.
                                                ItemInfo["HorizGap"] = items.HorizGap;
                                                ItemInfo["UW"] = items.UW;
                                                ItemInfo["UH"] = items.UH;
                                                ItemInfo["UD"] = items.UD;
                                                ItemInfo["CW"] = items.CW;
                                                ItemInfo["CH"] = items.CH;
                                                ItemInfo["CD"] = items.CD;
                                                ItemInfo["TW"] = items.TW;
                                                ItemInfo["TH"] = items.TH;
                                                ItemInfo["TD"] = items.TD;
                                                ItemInfo["DW"] = items.DW;
                                                ItemInfo["DH"] = items.DH;
                                                ItemInfo["DD"] = items.DD;
                                                ItemInfo["CWPerc"] = items.CWPerc;
                                                ItemInfo["CHPerc"] = items.CHPerc;
                                                ItemInfo["CDPerc"] = items.CDPerc;
                                                ItemInfo["TopObjID"] = items.TopObjID;
                                                ItemInfo["BottomObjID"] = items.BottomObjID;
                                                ItemInfo["SecondTier"] = items.SecondTier;
                                                ItemInfo["CompItemObjID"] = items.CompItemObjID;
                                                ItemInfo["SellingPrice"] = parseFloat(nvl(items.SellingPrice)); //20240415 Regression issue 1 parseFloat and nvl
                                                if (items.SalesUnit !== "undefined") {
                                                    var salesunit = parseFloat(nvl(items.SalesUnit)); //20240415 Regression issue 1 parseFloat and nvl
                                                    ItemInfo["SalesUnit"] = Math.floor(salesunit * 100) / 100;
                                                } else {
                                                    ItemInfo["SalesUnit"] = "";
                                                }
                                                ItemInfo["NetSales"] = parseFloat(nvl(items.NetSales)); //20240415 Regression issue 1 parseFloat and nvl
                                                ItemInfo["CogsAdj"] = items.CogsAdj;
                                                ItemInfo["CogsAdjInd"] = typeof items.CogsAdjInd !== "undefined" ? items.CogsAdjInd : "";
                                                ItemInfo["GrossProfit"] = items.GrossProfit;
                                                ItemInfo["GrossProfitInd"] = typeof items.GrossProfitInd !== "undefined" ? items.GrossProfitInd : "";
                                                ItemInfo["WeeksCount"] = items.WeeksCount;
                                                ItemInfo["WeeksCountInd"] = typeof items.WeeksCountInd !== "undefined" ? items.WeeksCountInd : "";
                                                ItemInfo["MovingItem"] = items.MovingItem;
                                                ItemInfo["RegMovement"] = items.RegMovement;
                                                ItemInfo["RegMovementInd"] = typeof items.RegMovementInd !== "undefined" ? items.RegMovementInd : "";
                                                ItemInfo["DaysOfSupplyInd"] = typeof items.DaysOfSupplyInd !== "undefined" ? items.DaysOfSupplyInd : "";
                                                ItemInfo["AvgSales"] = typeof items.AvgSales !== "undefined" ? Math.floor(items.AvgSales * 100) / 100 : "";
                                                ItemInfo["AvgSalesInd"] = typeof items.AvgSalesInd !== "undefined" ? items.AvgSalesInd : "";
                                                ItemInfo["ItemStatus"] = typeof items.ItemStatus !== "undefined" ? items.ItemStatus : "";
                                                ItemInfo["CDTLvl1"] = typeof items.CDTLvl1 !== "undefined" ? items.CDTLvl1 : ""; //ASA-1130
                                                ItemInfo["CDTLvl2"] = typeof items.CDTLvl2 !== "undefined" ? items.CDTLvl2 : ""; //ASA-1130
                                                ItemInfo["CDTLvl3"] = typeof items.CDTLvl3 !== "undefined" ? items.CDTLvl3 : ""; //ASA-1130
                                                ItemInfo["ActualDPP"] = typeof items.ActualDPP !== "undefined" ? items.ActualDPP : ""; //ASA-1277-(3)
                                                ItemInfo["DPPLoc"] = items.DPPLoc; //ASA-1308 Task-3
                                                ItemInfo["StoreSOH"] = typeof items.StoreSOH !== "undefined" ? items.StoreSOH : ""; //ASA-1277-(3)
                                                ItemInfo["StoreNo"] = typeof items.StoreNo !== "undefined" ? items.StoreNo : ""; //ASA-1277-(3)
                                                ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : ""; //ASA-1277-(3)
                                                //ASA-2013 Start
                                                ItemInfo["ShelfPrice"] = typeof items.ShelfPrice !== "undefined" ? items.ShelfPrice : "";
                                                ItemInfo["PromoPrice"] = typeof items.PromoPrice !== "undefined" ? items.PromoPrice : "";
                                                ItemInfo["DiscountRate"] = typeof items.DiscountRate !== "undefined" ? items.DiscountRate : "";
                                                ItemInfo["PriceChangeDate"] = typeof items.PriceChangeDate !== "undefined" ? items.PriceChangeDate : "";
                                                ItemInfo["WeeksOfInventory"] = typeof items.WeeksOfInventory !== "undefined" ? items.WeeksOfInventory : "";
                                                ItemInfo["Qty"] = typeof items.Qty !== "undefined" ? items.Qty : "";
                                                ItemInfo["WhStock"] = typeof items.WhStock !== "undefined" ? items.WhStock : "";
                                                ItemInfo["StoreStock"] = typeof items.StoreStock !== "undefined" ? items.StoreStock : "";
                                                ItemInfo["StockIntransit"] = typeof items.StockIntransit !== "undefined" ? items.StockIntransit : "";
                                                //ASA-2013 End
                                                ItemInfo["Profit"] = parseFloat(nvl(items.Profit)); //20240415 Regression issue 1 parseFloat and nvl
                                                ItemInfo["TotalMargin"] = parseFloat(nvl(items.TotalMargin)); //20240415 Regression issue 1 parseFloat and nvl
                                                ItemInfo["MHorizFacings"] = parseInt(items.MHorizFacings);
                                                ItemInfo["MVertFacings"] = parseInt(items.MVertFacings);
                                                ItemInfo["MDepthFacings"] = parseInt(items.MDepthFacings);
                                                ItemInfo["Status"] = items.Status;
                                                ItemInfo["Cost"] = items.Cost;
                                                ItemInfo["Price"] = items.Price;
                                                ItemInfo["DaysOfSupply"] = items.DaysOfSupply;
                                                ItemInfo["ShowColorBackup"] = items.ShowColorBackup;
                                                ItemInfo["OrientationDesc"] = items.OrientationDesc;
                                                ItemInfo["StoreCnt"] = items.StoreCnt;
                                                ItemInfo["NewYN"] = "";
                                                ItemInfo["DescSecond"] = items.DescSecond;
                                                ItemInfo["Delist"] = typeof items.Delist == "undefined" ? "N" : items.Delist;
                                                ItemInfo["OverhungItem"] = typeof items.OverhungItem == "undefined" ? "N" : items.OverhungItem; //ASA-1138

                                                if (ItemInfo["Delist"] == "Y") {
                                                    ItemInfo["Color"] = p_ItemDelistColor;
                                                }

                                                if (typeof items.CnW == "undefined") {
                                                    ItemInfo["CnW"] = 0;
                                                } else {
                                                    ItemInfo["CnW"] = items.CnW;
                                                }
                                                if (typeof items.CnH == "undefined") {
                                                    ItemInfo["CnH"] = 0;
                                                } else {
                                                    ItemInfo["CnH"] = items.CnH;
                                                }
                                                if (typeof items.CnD == "undefined") {
                                                    ItemInfo["CnD"] = 0;
                                                } else {
                                                    ItemInfo["CnD"] = items.CnD;
                                                }
                                                if (typeof items.NW == "undefined") {
                                                    ItemInfo["NW"] = 0;
                                                } else {
                                                    ItemInfo["NW"] = items.NW;
                                                }
                                                if (typeof items.NH == "undefined") {
                                                    ItemInfo["NH"] = 0;
                                                } else {
                                                    ItemInfo["NH"] = items.NH;
                                                }
                                                if (typeof items.ND == "undefined") {
                                                    ItemInfo["ND"] = 0;
                                                } else {
                                                    ItemInfo["ND"] = items.ND;
                                                }
                                                ItemInfo["ItemNesting"] = items.ItemNesting;
                                                ItemInfo["NVal"] = ItemInfo["ItemNesting"] == "H" ? items.NH : ItemInfo["ItemNesting"] == "W" ? items.NW : ItemInfo["ItemNesting"] == "D" ? items.ND : 0;

                                                ItemInfo["ItemContain"] = items.ItemContain;
                                                ItemInfo["CnVal"] = ItemInfo["ItemContain"] == "H" ? items.CnH : ItemInfo["ItemContain"] == "W" ? items.CnW : ItemInfo["ItemContain"] == "D" ? items.CnD : 0;

                                                ItemInfo["OldCnW"] = ItemInfo["CnW"];
                                                ItemInfo["OldCnH"] = ItemInfo["CnH"];
                                                ItemInfo["OldCnD"] = ItemInfo["CnD"];
                                                ItemInfo["OldNW"] = ItemInfo["NW"];
                                                ItemInfo["OldNH"] = ItemInfo["NH"];
                                                ItemInfo["OldND"] = ItemInfo["ND"];

                                                ItemInfo["OrgUW"] = items.OrgUW;
                                                ItemInfo["OrgUH"] = items.OrgUH;
                                                ItemInfo["OrgUD"] = items.OrgUD;
                                                ItemInfo["OrgCW"] = items.OrgCW;
                                                ItemInfo["OrgCH"] = items.OrgCH;
                                                ItemInfo["OrgCD"] = items.OrgCD;
                                                ItemInfo["OrgTW"] = items.OrgTW;
                                                ItemInfo["OrgTH"] = items.OrgTH;
                                                ItemInfo["OrgTD"] = items.OrgTD;
                                                ItemInfo["OrgDW"] = items.OrgDW;
                                                ItemInfo["OrgDH"] = items.OrgDH;
                                                ItemInfo["OrgDD"] = items.OrgDD;
                                                ItemInfo["OrgCWPerc"] = items.OrgCWPerc;
                                                ItemInfo["OrgCHPerc"] = items.OrgCHPerc;
                                                ItemInfo["OrgCDPerc"] = items.OrgCDPerc;
                                                ItemInfo["OrgCnW"] = items.OrgCnW;
                                                ItemInfo["OrgCnH"] = items.OrgCnH;
                                                ItemInfo["OrgCnD"] = items.OrgCnD;
                                                ItemInfo["OrgNW"] = items.OrgNW;
                                                ItemInfo["OrgNH"] = items.OrgNH;
                                                ItemInfo["OrgND"] = items.OrgND;

                                                ItemInfo["ImgExists"] = items.ImgExists;
                                                ItemInfo["Exists"] = "E";
                                                ItemInfo["DimUpdate"] = "N";
                                                ItemInfo["ItemImage"] = items.ItemImage;
                                                ItemInfo["Edited"] = "Y";
                                                ItemInfo["OldObjID"] = items.ObjID;
                                                ItemInfo["Brand"] = items.Brand; //ASA-1292 - Issue 5 Start
                                                ItemInfo["ItmDescChi"] = items.ItmDescChi; //ASA-1407 Task 1,//ASA-1407 issue 5
                                                var det_arr = items.SizeDesc.split("*");
                                                if (det_arr.length > 1) {
                                                    ItemInfo["ItmDescEng"] = items.Brand + " " + items.Desc + " " + parseInt(det_arr[0]) / parseInt(det_arr[1]) + "*" + det_arr[1] + "*" + det_arr[2];
                                                } else {
                                                    ItemInfo["ItmDescEng"] = items.Brand + " " + items.Desc;
                                                }
                                                ItemInfo["PkSiz"] = parseInt(det_arr[1]);
                                                ItemInfo["Brand_Category"] = typeof items.Brand_Category !== "undefined" ? items.Brand_Category : "";
                                                ItemInfo["ItemSize"] = typeof items.ItemSize !== "undefined" ? items.ItemSize : "";
                                                ItemInfo["Categ"] = typeof items.Categ !== "undefined" ? items.Categ : "";
                                                ItemInfo["Uda_item_status"] = typeof items.Uda_item_status !== "undefined" ? items.Uda_item_status : "";
                                                ItemInfo["Gobecobrand"] = typeof items.Gobecobrand !== "undefined" ? items.Gobecobrand : "";
                                                ItemInfo["InternationalRng"] = typeof items.InternationalRng !== "undefined" ? items.InternationalRng : "";
                                                ItemInfo["EDLP"] = typeof items.EDLP !== "undefined" ? items.EDLP : "";
                                                ItemInfo["LoGrp"] = typeof items.LoGrp !== "undefined" ? items.LoGrp : "";
                                                ItemInfo["COO"] = typeof items.COO !== "undefined" ? items.COO : ""; //ASA-1292 - Issue 5 End
                                                ItemInfo["UDA751"] = typeof items.UDA751 !== "undefined" ? items.UDA751 : ""; //ASA-1407 Task 1 -S
                                                ItemInfo["UDA755"] = typeof items.UDA755 !== "undefined" ? items.UDA755 : ""; //ASA-1407 Task 1 -E
                                                ItemInfo["MPogDepthFacings"] = typeof items.MPogDepthFacings !== "undefined" ? items.MPogDepthFacings : ""; //ASA-1408
                                                ItemInfo["MPogHorizFacings"] = typeof items.MPogHorizFacings !== "undefined" ? items.MPogHorizFacings : ""; //ASA-1408
                                                ItemInfo["MPogVertFacings"] = typeof items.MPogVertFacings !== "undefined" ? items.MPogVertFacings : ""; //ASA-1408
                                                ItemInfo["Internet"] = typeof items.Internet !== "undefined" ? items.Internet : ""; //ASA-1407 issue 9
                                                ItemInfo["SplrLbl"] = typeof items.SplrLbl !== "undefined" ? items.SplrLbl : ""; //ASA-1407 issue 9
                                                //ASA-1640 Start
                                                ItemInfo["ItemCondition"] = nvl(items.ItemCondition) != 0 ? items.ItemCondition : "";
                                                ItemInfo["AUR"] = nvl(items.AUR) != 0 ? items.AUR : "";
                                                ItemInfo["ItemRanking"] = nvl(items.ItemRanking) != 0 ? items.ItemRanking : "";
                                                ItemInfo["WeeklySales"] = nvl(items.WeeklySales) != 0 ? items.WeeklySales : "";
                                                ItemInfo["WeeklyNetMargin"] = nvl(items.WeeklyNetMargin) != 0 ? items.WeeklyNetMargin : "";
                                                ItemInfo["WeeklyQty"] = nvl(items.WeeklyQty) != 0 ? items.WeeklyQty : "";
                                                ItemInfo["NetMarginPercent"] = typeof items.NetMarginPercent !== "undefined" ? items.NetMarginPercent : typeof items.NetMarginPerc !== "undefined" ? items.NetMarginPerc : ""; //ASA-1735  issue 4
                                                ItemInfo["CumulativeNM"] = nvl(items.CumulativeNM) != 0 ? items.CumulativeNM : "";
                                                ItemInfo["TOP80B2"] = nvl(items.TOP80B2) != 0 ? items.TOP80B2 : "";
                                                ItemInfo["ItemBrandC"] = nvl(items.ItemBrandC) != 0 ? items.ItemBrandC : "";
                                                ItemInfo["ItemPOGDept"] = nvl(items.ItemPOGDept) != 0 ? items.ItemPOGDept : "";
                                                ItemInfo["ItemRemark"] = nvl(items.ItemRemark) != 0 ? items.ItemRemark : "";
                                                ItemInfo["RTVStatus"] = nvl(items.RTVStatus) != 0 ? items.RTVStatus : "";
                                                ItemInfo["Pusher"] = nvl(items.Pusher) != 0 ? items.Pusher : "";
                                                ItemInfo["Divider"] = nvl(items.Divider) != 0 ? items.Divider : "";
                                                ItemInfo["BackSupport"] = nvl(items.BackSupport) != 0 ? items.BackSupport : "";
                                                //ASA-1640 End
                                                ItemInfo["OOSPerc"] = nvl(items.OOSPerc); //ASA-1750 Issue 2 //nvl(items.OOSPerc) != 0 ? items.OOSPerc : ""; //ASA-1688 Added for OOS%
                                                ItemInfo["InitialItemDesc"] = typeof items.InitialItemDesc !== "undefined" ? items.InitialItemDesc : ""; //ASA-1734 Issue 1
                                                ItemInfo["InitialBrand"] = typeof items.InitialBrand !== "undefined" ? items.InitialBrand : ""; //ASA-1787 Request #6
                                                ItemInfo["InitialBarcode"] = typeof items.InitialBarcode !== "undefined" ? items.InitialBarcode : ""; //ASA-1787 Request #6
                                            }
                                            if (p_carpark_ind !== "Y") {
                                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_ind].ItemInfo.push(ItemInfo);
                                            } else {
                                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_ind].ItemInfo.push(ItemInfo);
                                            }
                                        } else {
                                            ItemInfo = items;
                                        }
                                        var is_divider = "N";
                                        if (ItemInfo["Item"] == "DIVIDER") {
                                            is_divider = "Y";
                                        }
                                        if (p_recreate == "Y") {
                                            if (p_carpark_ind == "Y") {
                                                var objID = await add_carpark_item(ItemInfo["ItemID"], ItemInfo["W"], ItemInfo["H"], ItemInfo["D"], ItemInfo["Color"], ItemInfo["X"], ItemInfo["Y"], ItemInfo["Z"], p_mod_index, shelf_ind, j, "Y", "N", g_show_live_image, "", p_pog_index);
                                            } else {
                                                if (g_show_live_image == "Y" && items.MerchStyle != 3) {
                                                    var details = g_orientation_json[items.Orientation];
                                                    var details_arr = details.split("###");

                                                    var objID = await add_items_with_image(ItemInfo["ItemID"], ItemInfo["W"], ItemInfo["H"], ItemInfo["D"], ItemInfo["Color"], ItemInfo["X"], ItemInfo["Y"], ItemInfo["Z"], p_mod_index, shelf_ind, j, ItemInfo["BHoriz"], ItemInfo["BVert"], ItemInfo["Item"], parseInt(details_arr[0]), parseInt(details_arr[1]), "N", "N", p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index);
                                                } else {
                                                    var objID = await add_items_prom(ItemInfo["ItemID"], ItemInfo["W"], ItemInfo["H"], ItemInfo["D"], ItemInfo["Color"], ItemInfo["X"], ItemInfo["Y"], ItemInfo["Z"], p_mod_index, shelf_ind, j, "N", "N", p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pog_index);
                                                }
                                            }
                                            if (ItemInfo["Status"] == "N") {
                                                var selectedObject = g_world.getObjectById(objID);
                                                selectedObject.BorderColour = g_status_error_color;
                                                selectedObject.Status = "N";
                                                selectedObject.WireframeObj.material.color.setHex(selectedObject.BorderColour);
                                            }
                                            if (p_carpark_ind == "N") {
                                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_ind].ItemInfo[j].Z = 0.025;
                                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_ind].ItemInfo[j].ObjID = objID;
                                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_ind].ItemInfo[j].CType = ShelfInfo["ObjType"];
                                            } else {
                                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_ind].ItemInfo[j].Z = 0.025;
                                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_ind].ItemInfo[j].ObjID = objID;
                                                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_ind].ItemInfo[j].CType = ShelfInfo["ObjType"];
                                            }
                                        }
                                        j = j + 1;
                                    }

                                    if (p_carpark_ind == "N") {
                                        var item_Details = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_ind].ItemInfo;
                                        for (const items of item_Details) {
                                            if ((typeof items.TopObjID !== "undefined" && items.TopObjID !== "") || (typeof items.BottomObjID !== "undefined" && items.BottomObjID !== "")) {
                                                var tier_ind;
                                                if (items.TopObjID !== "" && typeof items.TopObjID !== "undefined") {
                                                    tier_ind = "BOTTOM";
                                                } else {
                                                    tier_ind = "TOP";
                                                }
                                                var returnval = reset_top_bottom_obj_id(tier_ind, items.OldObjID, items.ObjID, items.X, "N", p_pog_index);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    i = i + 1;
                }
            }
            logDebug("function : create_shelf_edit_pog_lib", "E");
            return newObjectID;
        }
    } catch (err) {
        error_handling(err);
    }
}



async function add_shelf(p_uuid, p_type, p_width, p_height, p_depth, p_color, p_x, p_y, p_z, p_edit_ind, p_mod_index, p_rotation, p_slope, p_shelf_ind, p_recreate, p_carpark_ind, p_shelf_edit, p_create_canvas, p_pogCarparkShelfDftColor, p_notchHead, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, p_pog_index, p_pog_json = g_pog_json /*20241223 Reg 2*/) {
    //ASA-1350 issue 6 case 2 added parameters //ASA-1487
    logDebug("function : add_shelf; uuid : " + p_uuid + "; type : " + p_type + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; z : " + p_z + "; p_edit_ind : " + p_edit_ind + "; mod_index : " + p_mod_index + "; rotation : " + p_rotation + "; slope : " + p_slope + "; shelf_ind : " + p_shelf_ind + "; recreate : " + p_recreate + "; carpark_ind : " + p_carpark_ind + "; shelf_edit : " + p_shelf_edit, "S");
    try {
        if (p_carpark_ind == "Y") {
            p_color = p_pogCarparkShelfDftColor;
        }
        if (p_rotation !== 0 || p_slope !== 0) {
            p_depth = p_depth;
        } else {
            p_depth = 0.001;
        }
        var availableSpace = 0;
        p_create_canvas = typeof p_create_canvas == "undefined" ? -1 : p_create_canvas;
        var shelf_cnt;
        var shelf_obj_type;
        if (typeof g_module_width == "undefined" || g_module_width == "") g_module_width = parseFloat(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].W);

        if (p_edit_ind == "Y") {
            var selectedObject = g_world.getObjectById(g_dblclick_objid);
            g_world.remove(selectedObject);
            shelf_cnt = p_shelf_ind;
        } else {
            if (p_shelf_ind !== -1) {
                shelf_cnt = p_shelf_ind;
            } else {
                shelf_cnt = parseFloat(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo.length) - 1;
            }
        }
        var shelfdtl = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[shelf_cnt];

        if (p_carpark_ind == "N") {
            shelf_obj_type = shelfdtl.ObjType;
            availableSpace = shelfdtl.AvlSpace;
        } else {
            availableSpace = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[0].AvlSpace;
            shelf_obj_type = "SHELF";
        }

        if (p_rotation == 0 && p_slope == 0) {
            p_rotation = 0;
            p_slope = 0;
            var l_shelf = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, p_depth),
                new THREE.MeshStandardMaterial({
                    color: p_color,
                })
            );
            var l_wireframe_id = add_wireframe(l_shelf, 2);
            if (p_carpark_ind == "N") {
                var shelf_info = shelfdtl;
            } else {
                var shelf_info = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_cnt];
            }
            l_shelf.WFrameID = l_wireframe_id;
            l_shelf.position.x = p_x;
            l_shelf.position.y = p_y;
            //ASA-1710,1681 Added carpark condition
            if (p_carpark_ind == "N" && isShelfOnPegboard(p_x, p_y, p_mod_index, p_pog_index, shelf_info, p_pog_json)) {
                // ASA-1769 issue 1 Changed g_pog_json to p_pog_json  //ASA-1694 #18 Changed p_pog_json to g_pog_json
                l_shelf.position.z = 0.004;
            } else {
                l_shelf.position.z = 0.0009;
            } // ASA-1544 Issue - 1
            l_shelf.uuid = p_uuid;
            l_shelf.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            l_shelf.Version = g_pog_json[p_pog_index].Version; //ASA-1243
            //Start ASA-1305
            l_shelf.X = wpdSetFixed(shelf_info.X * 100 - (shelf_info.W * 100) / 2); //.toFixed(2);
            if (shelf_info.EditNotch == "Y") {
                l_shelf.Y = wpdSetFixed(shelf_info.EditNotchY * 100); //.toFixed(2);
            } else {
                l_shelf.Y = wpdSetFixed(shelf_info.Y * 100 - (shelf_info.H * 100) / 2); //.toFixed(2);
            }
            l_shelf.Z = wpdSetFixed(shelf_info.Z * 100 - (shelf_info.D * 100) / 2); //.toFixed(2);
            //l_shelf.X = Math.round(shelf_info.X * 100); // ASA-1243 //ASA-1305
            //l_shelf.Y = Math.round(shelf_info.Y * 100); // ASA-1243 //ASA-1305
            //l_shelf.Z = Math.round(shelf_info.Z * 100); // ASA-1243 //ASA-1305
            //End ASA-1305
            l_shelf.NotchNo = shelf_info.NotchNo;

            l_shelf.Desc = shelf_info.Desc;
            l_shelf.FixelID = shelf_info.Shelf;
            l_shelf.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
            //ASA-1361 20240501-S
            l_shelf.W = shelf_info.W; //ASA-1277 * 100   no need to multiply the value here beacuse we using the width get from the world and find the item pos x
            l_shelf.H = shelf_info.H; //ASA-1277* 100
            l_shelf.D = shelf_info.D; //ASA-1277* 100
            l_shelf.ROverhang = shelf_info.ROverhang; //ASA-1305 * 100
            l_shelf.LOverhang = shelf_info.LOverhang; //ASA-1305* 100
            // ASA-1361 20240501 -E
            l_shelf.Color = shelf_info.Color;
            l_shelf.Rotation = p_rotation;
            l_shelf.ItemSlope = p_slope;
            l_shelf.RotationFlag = p_rotation !== 0 || p_slope !== 0 ? "Y" : "N";
            l_shelf.ImageExists = "N";
            if (shelf_obj_type == "SHELF") {
                l_shelf.AvlSpace = wpdSetFixed(nvl(availableSpace)); // parseFloat(nvl(availableSpace).toFixed(3));
            }

            g_world.add(l_shelf);
            if (p_carpark_ind == "N") {
                shelfdtl.WFrameID = l_wireframe_id;
                if (g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET" && g_edit_pallet_shelfid == shelfdtl.SObjID) {
                    g_pog_json[p_pog_index].ModuleInfo[0].ShelfInfo[0] = JSON.parse(JSON.stringify(shelfdtl));
                    g_pog_json[p_pog_index].ModuleInfo[0].ShelfInfo[0].PrimeShelfObjID = parseInt(l_shelf.id);
                }
                shelfdtl.SObjID = parseInt(l_shelf.id);
            } else {
                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_cnt].WFrameID = l_wireframe_id;
                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_cnt].SObjID = parseInt(l_shelf.id);
            }
        } else {
            g_rotation = p_rotation;
            if (p_slope > 0) {
                p_slope = 0 - p_slope;
            } else {
                p_slope = -p_slope;
            }
            g_slope = p_slope;

            var l_shelf = new THREE.Mesh(
                new THREE.BoxGeometry(p_width, p_height, p_depth),
                new THREE.MeshBasicMaterial({
                    color: p_color,
                })
            );
            var l_wireframe_id = add_wireframe(l_shelf, 2);
            l_shelf.WFrameID = l_wireframe_id;
            var mod_right = 0;
            if (p_recreate == "Y" && p_edit_ind == "N") {
                var i = 0;
                for (const modules of g_pog_json[p_pog_index].ModuleInfo) {
                    if (modules.ParentModule == null) {
                        mod_right = Math.max(mod_right, parseFloat(modules.X) + modules.W / 2);
                    }
                    i++;
                }
                p_x = mod_right + p_width / 2;
                p_y = g_pog_json[p_pog_index].CameraY;
            }

            l_shelf.uuid = p_uuid;
            l_shelf.rotateY((p_rotation * Math.PI) / 180);
            l_shelf.rotateX((p_slope * Math.PI) / 180);
            g_world.add(l_shelf);
            l_shelf.geometry.computeBoundingBox();
            var bounding_box = l_shelf.geometry.boundingBox;
            var box = new THREE.Box3().setFromObject(l_shelf);
            var box_dim = box.getSize(new THREE.Vector3());

            l_shelf.position.x = p_x; //0 - (depth / 2);
            l_shelf.position.y = p_y;
            if (p_slope < 0) {
                l_shelf.position.y = p_y + parseFloat(box_dim.y) / 2;
            } else {
                l_shelf.position.y = p_y - parseFloat(box_dim.y) / 2;
            }
            l_shelf.position.z = p_depth / 2 + g_pog_json[p_pog_index].BackDepth;
            if (p_carpark_ind == "N") {
                var shelf_info = shelfdtl;
            } else {
                var shelf_info = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_cnt];
            }
            l_shelf.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1243
            l_shelf.Version = g_pog_json[p_pog_index].Version; //ASA-1243
            //Start ASA-1305
            l_shelf.X = wpdSetFixed(shelf_info.X * 100 - (shelf_info.W * 100) / 2); //.toFixed(2);
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
            l_shelf.Desc = shelf_info.Desc;
            l_shelf.FixelID = shelf_info.Shelf;
            l_shelf.Module = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Module;
            //ASA-1361 20240501-S
            l_shelf.W = shelf_info.W; //ASA-1277 * 100 no need to multiply the value here beacuse we using the width get from the world and find the item pos x
            l_shelf.H = shelf_info.H; //ASA-1277* 100
            l_shelf.D = shelf_info.D; //ASA-1277* 100
            l_shelf.ROverhang = shelf_info.ROverhang; //* 100
            l_shelf.LOverhang = shelf_info.LOverhang; //* 100
            //ASA-1361 20240501-E
            l_shelf.Color = shelf_info.Color;
            l_shelf.Rotation = p_rotation;
            l_shelf.ItemSlope = p_slope;
            l_shelf.NotchNo = shelf_info.NotchNo;
            l_shelf.Rotation = p_rotation !== 0 || p_slope !== 0 ? "Y" : "N";
            l_shelf.ImageExists = "N";
            if (shelf_obj_type == "SHELF") {
                l_shelf.AvlSpace = wpdSetFixed(nvl(availableSpace)); //parseFloat(nvl(availableSpace).toFixed(3));
            }

            if (p_carpark_ind == "N") {
                if (g_compare_pog_flag == "Y" && g_compare_view == "EDIT_PALLET" && g_edit_pallet_shelfid == shelfdtl.SObjID) {
                    g_pog_json[p_pog_index].ModuleInfo[0].ShelfInfo[0] = JSON.parse(JSON.stringify(g_pog_json[p_pog_index].ModuleInfo[g_module_index].ShelfInfo[g_shelf_index]));
                    g_pog_json[p_pog_index].ModuleInfo[0].ShelfInfo[0].PrimeShelfObjID = parseInt(l_shelf.id);
                }
                shelfdtl.X = p_x;
                shelfdtl.Y = p_y;
                shelfdtl.SObjID = parseInt(l_shelf.id);
                shelfdtl.Z = p_depth / 2 + g_pog_json[p_pog_index].BackDepth;

                shelfdtl.WFrameID = l_wireframe_id;
                shelfdtl.ShelfRotateWidth = parseFloat(box_dim.x);
                shelfdtl.ShelfRotateHeight = parseFloat(box_dim.y);
                shelfdtl.ShelfRotateDepth = parseFloat(box_dim.z);
            }
            if (g_manual_zoom_ind == "N") {
                var details = get_min_max_xy(p_pog_index);
                var details_arr = details.split("###");
                set_camera_z(g_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
            }
            if (p_recreate == "Y" && p_edit_ind == "N") {
                p_x = wpdSetFixed(mod_right + p_width / 2);
                p_y = g_pog_json[p_pog_index].CameraY;
            }
            l_shelf.position.x = p_x; //0 - (depth / 2);
            if (p_slope < 0) {
                l_shelf.position.y = wpdSetFixed(p_y + parseFloat(box_dim.y) / 2);
            } else {
                l_shelf.position.y = wpdSetFixed(p_y - parseFloat(box_dim.y) / 2);
            }
            if (p_rotation !== 0) {
                l_shelf.quaternion.copy(g_camera.quaternion);
                l_shelf.lookAt(g_pog_json[p_pog_index].CameraX, g_pog_json[p_pog_index].CameraY, g_pog_json[p_pog_index].CameraZ);
                l_shelf.rotateY((p_rotation * Math.PI) / 180);
                l_shelf.rotateX((p_slope * Math.PI) / 180);
            }
        }
        l_shelf.BorderColour = 0x000000;
        var shelf_id = parseInt(l_shelf.id);
        if (g_show_fixel_label == "Y" && p_carpark_ind == "N") {
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
                if (g_fixel_label == "Y") {
                    var notch_no = get_notch_no(g_pog_json[p_pog_index].ModuleInfo[p_mod_index], p_pog_index, shelfdtl.Y + shelfdtl.H / 2);
                    var shelf = shelfdtl.Shelf + " " + shelfdtl.Desc + " " + parseFloat(shelfdtl.Y * 100 - (shelfdtl.H / 2) * 100).toFixed(2) + get_message("POGCR_FIXEL_CM") + " " + notch_no;
                    var return_obj = addlabelText(shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
                    l_shelf.add(return_obj); //ASA-1638 #1
                    return_obj.position.y = -0.005; //ASA-1638 #1
                    var x = ((return_obj.material.map.image.width / return_obj.material.map.image.height) * g_labelActualSize) / 2; //ASA-1677 #5 Added to calculate value for X
                    return_obj.position.x = 0 - shelfdtl.W / 2 + x + 0.01; //ASA-1677 #5
                    //return_obj.position.x = 0 - (shelfdtl.W / 2.4 - 0.02);    //ASA-1638 #1
                } else {
                    var return_obj = addlabelText(shelfdtl.Shelf, g_labelFont, g_labelActualSize, text_color, "center", "");
                    l_shelf.add(return_obj); //ASA-1638 #1
                    var x = ((return_obj.material.map.image.width / return_obj.material.map.image.height) * g_labelActualSize) / 2; //ASA-1677 #5 Added to calculate value for X
                    return_obj.position.x = 0 - shelfdtl.W / 2 + x + 0.01; //ASA-1677 #5
                    //return_obj.position.x = 0 - (shelfdtl.W / 2.4 + 0.01);   //ASA-1638 #1
                    return_obj.position.y = 0; //ASA-1638 #1
                } //ASA-1638

                if (shelfdtl.Rotation !== 0 || shelfdtl.Slope !== 0) {
                    return_obj.position.z = shelfdtl.D / 2 + 0.005;
                } else {
                    return_obj.position.z = 0.001;
                }
                shelfdtl.LObjID = return_obj.id;
            }
        } else if (p_carpark_ind == "Y") {
            var text_color = "#ffffff";
            var return_obj = addlabelText(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_cnt].Shelf, 12, g_labelActualSize, text_color, "center", "");
            l_shelf.add(return_obj);
            return_obj.position.x = 0 - (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].Carpark[shelf_cnt].W / 3 + 0.01);
            return_obj.position.y = 0;
            return_obj.position.z = 0.005;
        }
        if (shelf_obj_type == "CHEST" && g_chest_as_pegboard == "Y") {
            //ASA-1125
            add_chest_dots_array(p_width, p_height, 0, 0.01, 0, 0.01, shelf_cnt, p_mod_index, p_pog_index);
        }

        if (p_carpark_ind == "N") {
            //&& g_show_notch_label == "Y") {//ASA-1254 Notch no to be updated always to show in status bar //Task_26627 found a bug the whole condition was commented, which will give error for carpark shelf.
            var returnval = update_single_notch_label("Y", p_mod_index, shelf_cnt, p_notchHead, l_shelf, p_pog_index, p_carpark_ind);
        }
        l_shelf.NotchNo = shelf_info.NotchNo;

        if (p_recreate == "Y") {
            if (reorder_items(p_mod_index, shelf_cnt, p_pog_index)) {
                //ASA-1446 issue 5
                var return_val = await recreate_all_items(p_mod_index, shelf_cnt, shelfdtl.ObjType, "Y", -1, -1, shelfdtl.ItemInfo.length, "Y", "N", -1, -1, p_create_canvas, "", p_pog_index, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, "Y"); //ASA-1350 issue 6 case 2 added parameters
            }
        }
        if (typeof g_pog_json !== "undefined" && g_compare_view == "EDIT_PALLET") {
            g_pog_json[p_pog_index].ModuleInfo[0].ShelfInfo[0].PrimeShelfObjID = l_shelf.id;
        }
        logDebug("function : add_shelf", "E");
        return [shelf_id, shelf_cnt];
    } catch (err) {
        error_handling(err);
    }
}

function findNearByShelfMaxDepth(p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_locationX, p_pog_index) {
    logDebug("function : findNearByShelfMaxDepth; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; p_edit_ind : " + p_edit_ind + "; locationX : " + p_locationX, "S");
    try {
        var item_start = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].X - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W / 2;
        var item_end = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].X + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W / 2;
        // var item_top = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H / 2;
        // var item_bottom = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H / 2;

        var item_top; //ASA-1410 Issue 13
        var item_bottom;

        if ((g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapStyle == "1" || g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapStyle == "2" || g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].CapStyle == "3") && g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType == "SHELF") {
            var item_top = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RH / 2;
            var item_bottom = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].RH / 2;
        } else {
            var item_top = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y + g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H / 2;
            var item_bottom = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y - g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H / 2;
        }

        var currentShelf = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Shelf;
        var l_object_type = g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType; //ASA-1262 3 PRASANNA
        var shelvesInRange = [];
        var l_max_depth = 0;
        //  if (g_overhung_shelf_active == "N") { //ASA-1262 3 Prasanna
        if (g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length > 1) {
            if (l_object_type == "SHELF") {
                $.each(g_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo, function (i, Shelf) {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                        if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                            var div_shelf_end = parseFloat((Shelf.X + Shelf.ShelfRotateWidth / 2).toFixed(3));
                            var div_shelf_start = parseFloat((Shelf.X - Shelf.ShelfRotateWidth / 2).toFixed(3));
                        } else {
                            var div_shelf_end = parseFloat((Shelf.X + Shelf.W / 2).toFixed(3));
                            var div_shelf_start = parseFloat((Shelf.X - Shelf.W / 2).toFixed(3));
                        }
                        var shelfY = Shelf.Y;
                        var shelf_top = Shelf.Y + Shelf.H / 2;
                        if (((item_start >= div_shelf_start && item_start < div_shelf_end) || (item_end <= div_shelf_end && item_end > div_shelf_start)) && item_top >= shelfY && currentShelf != Shelf.Shelf && item_bottom < shelf_top) {
                            shelvesInRange.push(parseFloat(Shelf.D.toFixed(4)));
                        }
                    }
                });
            }
        }
        if (shelvesInRange.length > 0) {
            l_max_depth = Math.max.apply(Math, shelvesInRange);
        }
        //  } else { //ASA-1262 3 PRASANNA
        //     l_max_depth = 0;
        //  }
        logDebug("function : findNearByShelfMaxDepth", "E");
        return l_max_depth;
    } catch (err) {
        error_handling(err);
    }
}

//ASA-1442 issue 7 S
function onload_findNearByShelfMaxDepth(p_module_index, p_shelf_index, p_item_index, p_edit_ind, p_locationX, p_pog_index, p_pog_json) {
    logDebug("function : findNearByShelfMaxDepth; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index + "; i_item_index : " + p_item_index + "; p_edit_ind : " + p_edit_ind + "; locationX : " + p_locationX, "S");
    try {
        var item_start = p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].X - p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W / 2;
        var item_end = p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].X + p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].W / 2;
        var item_top = p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y + p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H / 2;
        var item_bottom = p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].Y - p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ItemInfo[p_item_index].H / 2;
        var currentShelf = p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].Shelf;
        var l_object_type = p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo[p_shelf_index].ObjType; //ASA-1262 3 PRASANNA
        var shelvesInRange = [];
        var l_max_depth = 0;
        //  if (g_overhung_shelf_active == "N") { //ASA-1262 3 Prasanna
        if (p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo.length > 1) {
            if (l_object_type == "SHELF") {
                $.each(p_pog_json[p_pog_index].ModuleInfo[p_module_index].ShelfInfo, function (i, Shelf) {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                        if (Shelf.Rotation !== 0 || Shelf.Slope !== 0) {
                            var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.ShelfRotateWidth / 2); //.toFixed(3));
                            var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.ShelfRotateWidth / 2); //.toFixed(3));
                        } else {
                            var div_shelf_end = wpdSetFixed(Shelf.X + Shelf.W / 2); //.toFixed(3));
                            var div_shelf_start = wpdSetFixed(Shelf.X - Shelf.W / 2); //.toFixed(3));
                        }
                        var shelfY = Shelf.Y;
                        var shelf_top = Shelf.Y + Shelf.H / 2;
                        if (((item_start >= div_shelf_start && item_start < div_shelf_end) || (item_end <= div_shelf_end && item_end > div_shelf_start)) && item_top >= shelfY && currentShelf != Shelf.Shelf && item_bottom < shelf_top) {
                            shelvesInRange.push(wpdSetFixed(Shelf.D)); //.toFixed(4)));
                        }
                    }
                });
            }
        }
        if (shelvesInRange.length > 0) {
            l_max_depth = Math.max.apply(Math, shelvesInRange);
        }
        //  } else { //ASA-1262 3 PRASANNA
        //     l_max_depth = 0;
        //  }
        logDebug("function : findNearByShelfMaxDepth", "E");
        return l_max_depth;
    } catch (err) {
        //Start ASA1310_20240307 crush item onload
        error_handling(err);
        throw err;
    }
}//ASA-1442 issue 7 E

//Start ASA1310_20240307 crush item onload
function get_shelf_max_merch(p_modules, p_shelf, p_module_index, p_shelf_index, p_pog_index, p_default_max_merch) {
    logDebug("function : get_shelf_max_merch; p_module_index : " + p_module_index + "; p_shelf_index : " + p_shelf_index, "S");
    try {
        var max_merch = 0;
        if (p_shelf.X >= p_modules.X - p_modules.W / 2 && p_shelf.X < p_modules.X + p_modules.W / 2 && p_shelf.Y <= p_modules.H + g_pog_json[p_pog_index].BaseH && p_shelf.Y > 0) {
            var max_merch = get_module_max_merch(p_module_index, p_shelf_index, p_pog_index);
        } else if (p_shelf.Y < p_modules.H + g_pog_json[p_pog_index].BaseH && p_shelf.Y > 0) {
            var max_merch = p_modules.H + g_pog_json[p_pog_index].BaseH - p_shelf.Y;
        } else {
            var max_merch = p_default_max_merch;
        }
        if (max_merch > p_shelf.MaxMerch && p_shelf.MaxMerch > 0) {
            max_merch = p_shelf.MaxMerch;
        }
        logDebug("function : get_shelf_max_merch", "E");
        return max_merch;
    } catch (err) {
        error_handling(err);
        throw err;
    }
}




////Start 20240415 Rregression issue 12 20240430
function get_onload_max_merch(p_mod_index, p_shelf_index, p_modules, p_shelfs, p_default_max_merch, p_pog_index, p_pog_json) {
    var shelf_x = p_shelfs.X;
    var shelf_y = p_shelfs.Y;
    if (p_shelfs.MaxMerch > 0) {
        var max_merch = p_shelfs.MaxMerch;
    } else if (shelf_x >= p_modules.X - p_modules.W / 2 && shelf_x < p_modules.X + p_modules.W / 2 && shelf_y <= p_modules.H + p_pog_json[p_pog_index].BaseH && shelf_y > 0) {
        var max_merch = get_onload_shelf_max_merch(p_mod_index, p_shelf_index, p_pog_index, p_pog_json);
    } else if (shelf_y < p_modules.H + p_pog_json[p_pog_index].BaseH && shelf_y > 0) {
        var max_merch = p_modules.H + p_pog_json[p_pog_index].BaseH - shelf_y;
    } else {
        var max_merch = p_default_max_merch;
    }
    return max_merch;
}

function get_onload_shelf_max_merch(p_module_index, p_shelf_index, p_pog_index, p_pog_json) {
    try {
        var l_max_merch = 0;
        var basket_height = 0;
        var l_first_max = 0;
        var l_min_merch = 0;
        var index_arr = [];
        var moduledtl = p_pog_json[p_pog_index].ModuleInfo[p_module_index];
        var shelfdtl = moduledtl.ShelfInfo[p_shelf_index];
        var l_object_type = shelfdtl.ObjType;

        if (shelfdtl.MaxMerch !== 0) {
            l_first_max = shelfdtl.MaxMerch;
        }
        var shelf_y = shelfdtl.Y + shelfdtl.H;
        var shelf_start = wpdSetFixed(shelfdtl.X); //.toFixed(3));
        var shelf_end = wpdSetFixed(shelfdtl.X + shelfdtl.W); //.toFixed(3));

        var min_distance_arr = [];
        var l_max_merch = 0;
        if (l_object_type == "CHEST" || l_object_type == "BASKET") {
            basket_height = shelfdtl.BsktWallH;
        }
        if (moduledtl.ShelfInfo.length > 1) {
            if (l_object_type == "PEGBOARD") {
                min_distance_arr.push(shelfdtl.H + shelfdtl.LoOverHang);
                index_arr.push(p_shelf_index);
            } else {
                if (l_object_type == "HANGINGBAR") {
                    shelf_y = shelfdtl.Y;
                    var i = 0;
                    for (const Shelf of moduledtl.ShelfInfo) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            var div_start = wpdSetFixed(Shelf.X); //.toFixed(3));
                            var div_end = wpdSetFixed(Shelf.X + Shelf.W); //.toFixed(3));
                            if (p_shelf_index !== i && Shelf.Y + Shelf.H < shelf_y && ((shelf_start >= div_start && shelf_start <= div_end) || (shelf_end <= div_start && shelf_end >= div_end) || (shelf_start >= div_start && shelf_end <= div_end) || (div_start >= shelf_start && div_end <= shelf_end))) {
                                min_distance_arr.push(shelf_y - (Shelf.Y + Shelf.H));
                                index_arr.push(i);
                            }
                        }
                        i++;
                    }
                } else {
                    var i = 0;
                    for (const Shelf of moduledtl.ShelfInfo) {
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            var div_end = wpdSetFixed(Shelf.X + Shelf.W); //.toFixed(3));
                            var div_start = wpdSetFixed(Shelf.X); //.toFixed(3));
                            if (p_shelf_index !== i && Shelf.Y - Shelf.H > shelf_y && ((div_end > shelf_start && div_start <= shelf_start) || (div_start < shelf_end && div_start >= shelf_start)) && Shelf.Y <= moduledtl.H + g_pog_json[p_pog_index].BaseH) {
                                min_distance_arr.push(Shelf.Y - shelf_y);
                                index_arr.push(i);
                            }
                        }
                        i++;
                    }
                }
            }
            if (min_distance_arr.length == 0) {
                l_max_merch = moduledtl.H + p_pog_json[p_pog_index].BaseH - shelf_y;
            } else {
                l_max_merch = Math.min.apply(Math, min_distance_arr);
                var index = min_distance_arr.findIndex(function (number) {
                    return number == l_max_merch;
                });
                if (moduledtl.ShelfInfo[index_arr[index]].ObjType == "HANGINGBAR") {
                }
            }
        } else {
            l_max_merch = moduledtl.H + p_pog_json[p_pog_index].BaseH - shelf_y;
        }
        if (l_object_type == "CHEST" || l_object_type == "BASKET") {
            if ((l_max_merch < basket_height && basket_height > 0) || basket_height == 0) {
                l_min_merch = l_max_merch;
            } else {
                l_min_merch = basket_height;
            }
        } else {
            if ((l_max_merch < l_first_max && l_first_max > 0) || l_first_max == 0) {
                l_min_merch = l_max_merch;
            } else {
                l_min_merch = l_first_max;
            }
        }
        return wpdSetFixed(l_min_merch); //.toFixed(5));
    } catch (err) {
        error_handling(err);
        throw err;
    }
}
//End 20240415 Rregression issue 12 20240430

function get_shelf_index(p_obj_id, p_pog_index) {
    logDebug("function : get_shelf_index; obj_id : " + p_obj_id, "S");
    var l_module_index = (l_shelf_index = -1); //ASA-1353 issue 3 --Task_27104 20240417 regression -- before it was using g_shelf_index and setting default -1. due to which drag drop had problem
    var module_details = g_pog_json[p_pog_index].ModuleInfo;
    $.each(module_details, function (j, Modules) {
        if (l_shelf_index > -1) {
            return false;
        }
        if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
            $.each(Modules.ShelfInfo, function (k, Shelf) {
                if (l_shelf_index > -1) {
                    return false;
                }
                if (typeof Shelf !== "undefined") {
                    if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER") {
                        if (Shelf.SObjID == p_obj_id) {
                            l_module_index = j;
                            l_shelf_index = k;
                            return false;
                        }
                    }
                }
            });
        }
    });
    logDebug("function : l_shelf_index", "E");
    return [l_module_index, l_shelf_index];
}

//This function will set all the index of each info's.
async function set_shelf_item_index(p_pog_index) {
    logDebug("function : set_shelf_item_index", "S");
    return new Promise(function (resolve, reject) {
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0) {
            if (typeof g_pog_json[p_pog_index] !== "undefined") {
                var module_details = g_pog_json[p_pog_index].ModuleInfo;
                $.each(module_details, function (j, Modules) {
                    if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                        $.each(Modules.ShelfInfo, function (k, Shelf) {
                            if (typeof Shelf !== "undefined") {
                                if (Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "BASE") {
                                    g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].PIndex = p_pog_index; //Regression 20240724
                                    g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].SIndex = k;
                                    g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].MIndex = j;
                                }
                                if (Shelf.ItemInfo.length > 0) {
                                    $.each(Shelf.ItemInfo, function (l, items) {
                                        g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].PIndex = p_pog_index; //Regression 20240724
                                        g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].MIndex = j;
                                        g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].SIndex = k;
                                        g_pog_json[p_pog_index].ModuleInfo[j].ShelfInfo[k].ItemInfo[l].IIndex = l;
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
        resolve("SUCCESS");
        logDebug("function : set_shelf_item_index", "E");
    });
}

//ASA-1628
function autoPositionShelfVertically(pPogIndex, pModuleIndex, pShelfIndex, pShelfX, pShelfY, pShelfObjectType, pSubShelfPerc, pConsiderSubshelf = "N") {
    try {
        logDebug("function : autoPositionShelfVertically; pPogIndex:" + pPogIndex + "; pModuleIndex:" + pModuleIndex + "; pShelfIndex:" + pShelfIndex, "S");
        var sortByX = {
            X: "asc",
        };
        var currModule = g_pog_json[pPogIndex].ModuleInfo[pModuleIndex];
        var currShelf = g_pog_json[pPogIndex].ModuleInfo[pModuleIndex].ShelfInfo[pShelfIndex];
        var prevModuleIndex = -1;
        var prevRealModule = -1;
        var orderNo = 0;
        var posYchanged = true;
        var allPogModules = JSON.parse(JSON.stringify(g_pog_json[pPogIndex].ModuleInfo));
        allPogModules.keySort(sortByX);
        var i = 0;
        for (const pogModule of allPogModules) {
            if (typeof pogModule.ParentModule == "undefined" || pogModule.ParentModule == null) {
                if (orderNo == 0 && currModule.Module == pogModule.Module) {
                    return [pShelfY, notchUpdated];
                } else if (currModule.Module == pogModule.Module) {
                    prevModuleIndex = prevRealModule;
                }
                prevRealModule = i;
                orderNo++;
            }
            i++;
        }
        //ASA-1628 Issue 9
        if (prevModuleIndex == -1 && nvl(currShelf) == 0) {
            return [pShelfY, notchUpdated];
        }
        var prevModuleShelfs = allPogModules[prevModuleIndex].ShelfInfo;
        var prevModuleW = allPogModules[prevModuleIndex].W;
        var yArr = [];
        var s = 0;
        for (prevShelf of prevModuleShelfs) {
            if ((prevShelf.ObjType == "SHELF" || prevShelf.ObjType == "HANGINGBAR") && (currShelf.ObjType == "SHELF" || currShelf.ObjType == "HANGINGBAR")) {
                if (pConsiderSubshelf == "Y" || (pConsiderSubshelf == "N" && wpdSetFixed(prevShelf.W / prevModuleW.W) * 100 >= 100 - parseFloat(pSubShelfPerc))) {
                    var object = {};
                    object["Distance"] = Math.abs(wpdSetFixed(currShelf.Y - prevShelf.Y));
                    object["Indx"] = s;
                    yArr.push(object);
                }
            }
            s++;
        }
        var returnY = currShelf.Y;
        var prevShelf;
        if (yArr.length !== 0) {
            var closestShelfIndx = yArr.reduce((min, current) => (current.Distance < min.Distance ? current : min)).Indx;
            const minDistance = Math.min(...yArr.map((item) => item.Distance));
            var count = yArr.filter((item) => item.Distance === minDistance).length;
            posYchanged = count > 1 ? false : true;
            if (count == 1) {
                var closestShelfY = prevModuleShelfs[closestShelfIndx].Y + prevModuleShelfs[closestShelfIndx].H / 2;
                prevShelf = prevModuleShelfs[closestShelfIndx];
                returnY = wpdSetFixed(closestShelfY - currShelf.H / 2);
            }
        }

        var shelfHitTextbox = "N";
        //Check if shelf overlaps with any textbox
        var shlfStr = wpdSetFixed(pShelfX - currShelf.W / 2);
        var shlfEnd = wpdSetFixed(pShelfX + currShelf.W / 2);
        var shlfTop = wpdSetFixed(returnY + currShelf.H / 2);
        var shlfBtm = wpdSetFixed(returnY - currShelf.H / 2);
        if (textboxHit(pPogIndex, pModuleIndex, pShelfIndex, shlfStr, shlfEnd, shlfTop, shlfBtm, "N")) {
            returnY = pShelfY;
            posYchanged = false;
            shelfHitTextbox = "Y";
        }

        //Check if heighest item is above module top or any item overlaps with a textbox
        if (currShelf.ItemInfo.length > 0 && shelfHitTextbox == "N") {
            var itemHarr = [];
            var itemHit = "N";
            for (item of currShelf.ItemInfo) {
                itemHarr.push(wpdSetFixed(returnY + currShelf.H / 2 + item.H));
                var item_x, item_y;
                if (pShelfObjectType == "HANGINGBAR") {
                    item_x = wpdSetFixed(pShelfX - currShelf.W / 2 + item.Distance + item.W / 2);
                    item_y = wpdSetFixed(returnY - item.H / 2);
                } else {
                    item_x = wpdSetFixed(pShelfX - currShelf.W / 2 + item.Distance + item.W / 2);
                    item_y = wpdSetFixed(returnY + currShelf.H / 2 + item.H / 2);
                }
                var itemStr = wpdSetFixed(item_x - item.W / 2);
                var itemEnd = wpdSetFixed(item_x + item.W / 2);
                var itemTop = wpdSetFixed(item_y + item.H / 2);
                var itemBtm = wpdSetFixed(item_y - item.H / 2);
                if (textboxHit(pPogIndex, pModuleIndex, pShelfIndex, itemStr, itemEnd, itemTop, itemBtm)) {
                    returnY = pShelfY;
                    posYchanged = false;
                    itemHit = "Y";
                    break;
                }
            }
            if (itemHit == "N") {
                var maxItemH = Math.max(...itemHarr);
                var currModuleTop = wpdSetFixed(currModule.Y + currModule.H / 2);
                var currShelfTop = wpdSetFixed(returnY + currShelf.H / 2); //ASA-1659
                if ((maxItemH > currModuleTop && currShelf.ObjType == "SHELF") || (currShelfTop > currModuleTop && currShelf.ObjType == "HANGINGBAR")) {
                    returnY = pShelfY;
                    posYchanged = false;
                }
            }
        }

        var notchUpdated = false;
        var newNotch = -1;
        if (posYchanged) {
            if ((typeof prevShelf.NotchNo !== "undefined" || prevShelf.NotchNo !== "") && g_pog_json[pPogIndex].ModuleInfo[prevModuleIndex].NotchStart == currModule.NotchStart && g_pog_json[pPogIndex].ModuleInfo[prevModuleIndex].NotchSpacing == currModule.NotchSpacing) {
                var currShelfObject = g_scene_objects[pPogIndex].scene.children[2].getObjectById(currShelf.SObjID);
                var prevShelfObject = g_scene_objects[pPogIndex].scene.children[2].getObjectById(prevShelf.SObjID);
                if (typeof currShelfObject !== "undefined" && typeof prevShelfObject !== "undefined") {
                    currShelfObject.NotchNo = prevShelfObject.NotchNo;
                }
                newNotch = prevShelf.NotchNo;
                notchUpdated = true;
            }
        }

        logDebug("function : autoPositionShelfVertically", "E");
        return [returnY, notchUpdated, newNotch];
    } catch (err) {
        error_handling(err);
    }
}

/*ASA - 1544 #1*/
function isShelfOnPegboard(p_shelf_x, p_shelf_y, p_module_idx, p_pog_idx, p_shelf, p_pog_json) {
    try {
        var isShelfOnPegboard = false;
        var shelfStart = wpdSetFixed(p_shelf_x - p_shelf.W / 2);
        var shelfEnd = wpdSetFixed(p_shelf_x + p_shelf.W / 2);
        var shelfTop = wpdSetFixed(p_shelf_y + p_shelf.H / 2);
        var shelfBottom = wpdSetFixed(p_shelf_y - p_shelf.H / 2);

        if (p_pog_json[p_pog_idx].ModuleInfo) { //ASA-1945 Issue3 //to check whether ModuleInfo exists or not (if statement added)
            for (const shelf of p_pog_json[p_pog_idx].ModuleInfo[p_module_idx].ShelfInfo) {
                if (shelf.ObjType == "PEGBOARD") {
                    var pbStart = wpdSetFixed(shelf.X - shelf.W / 2);
                    var pbEnd = wpdSetFixed(shelf.X + shelf.W / 2);
                    var pbTop = wpdSetFixed(shelf.Y + shelf.H / 2);
                    var pbBottom = wpdSetFixed(shelf.Y - shelf.H / 2);
                    if (pbTop >= shelfTop && shelfBottom >= pbBottom && shelfStart >= pbStart && pbEnd >= shelfEnd) {
                        isShelfOnPegboard = true;
                        break;
                    }
                }
            }
        }
        return isShelfOnPegboard;
    } catch (err) {
        error_handling(err);
    }
}