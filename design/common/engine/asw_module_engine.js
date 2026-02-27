async function create_module_from_json_lib(p_pog_json_arr, p_new_pog_ind, p_pog_type, p_product_open, p_pog_opened, p_recreate, p_create_json, p_vdate, p_PogDefaultColor, p_PogModuleDefaultColor, p_pog_version, p_CopyJsonInd, p_showSingleModule, p_org_mod_index, p_SpreadItem, p_HorizSpacing, p_VertiSpacing, p_BsktWallThickness, p_ChestWallThickness, p_AutoPlacing, p_WrapText, p_FSize, p_TextboxColor, p_ShelfColor, p_DivColor, p_SlotDivider, p_SlotOrientation, p_DividerFixed, p_ItemColor, p_ItemDelistColor, p_pegHolesActive, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_notchHead, p_updateObjInd = "N", p_pDftBskFill, p_pDftBaskSprd, p_camera, p_pog_index, p_orgPogIndex, p_DefaultNotchStart, p_m_crush, p_crush_item, p_calc_dayofsupply) {
    //ASA-1310 KUSH FIX
    //Regression 29(Portal Issue) added p_calc_dayofsupply to handle in Portal > POG View and Module View, as day of supply calculation not required
    try {
        var HeadInfo = {};
        var x, y, p_cameraY, baseY;
        var carparkShelfCreated = "Y";
        g_show_live_image = g_show_item_desc == "Y" ? "N" : g_show_live_image;
        //g_show_live_image_comp = g_show_item_desc == "Y" ? "N" : g_show_live_image_comp;
        // we have called this function for 2 purposes. one to create json and create pog objects. another only to create json.
        //p_recreate - this means the POG skeleton to be created.
        // /p_create_json - json should be created and assigned to g_pog_json.
        if (p_create_json == "Y") {
            p_showSingleModule == "N" ? (p_pog_type = p_pog_json_arr[p_pog_index].DesignType) : "";
            var subdept;
            var module_details = p_pog_json_arr[p_pog_index].ModuleInfo;
            if (module_details == null) {
                p_pog_json_arr[p_pog_index].ModuleInfo = [];
                module_details = [];
            }
            i = 0;
            //setting empty array because some time very old json which was created can have array as null.
            for (const modules of module_details) {
                if (modules.ShelfInfo == null || typeof modules.ShelfInfo == "undefined") {
                    modules.ShelfInfo = [];
                }
                if (modules.ChestInfo == null || typeof modules.ChestInfo == "undefined") {
                    //Bug-26122 - splitting the chest
                    modules.ChestInfo = [];
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
            HeadInfo["Action"] = "C";
            p_pog_json_arr[p_pog_index].GenrateCombineS = typeof p_pog_json_arr[p_pog_index].GenrateCombineS !== "undefined" && p_pog_json_arr[p_pog_index].GenrateCombineS !== null ? p_pog_json_arr[p_pog_index].GenrateCombineS : []; //ASA-1353 issue 3 --Task_27104 20240417
            p_pog_json_arr[p_pog_index].SubDept = typeof p_pog_json_arr[p_pog_index].SubDept == "undefined" || p_pog_json_arr[p_pog_index].SubDept == null ? subdept : p_pog_json_arr[p_pog_index].SubDept;

            HeadInfo["Version"] = p_pog_json_arr[p_pog_index].Version == "" && p_pog_version !== "" ? p_pog_version : p_pog_json_arr[p_pog_index].Version;
            //this below condition means the pog json is created from table data for first time. so need to set default values.
            if (p_new_pog_ind == "N" && p_pog_type == "F") {
                //Getting base height
                var module_hgt_arr = [];
                var module_details = p_pog_json_arr[p_pog_index].ModuleInfo;

                i = 0;
                for (const modules of module_details) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        module_hgt_arr.push(modules.H);
                    }
                }
                if (p_pog_json_arr[p_pog_index].BaseH == "undefined" || p_pog_json_arr[p_pog_index].BaseH == null || p_pog_json_arr[p_pog_index].BaseH == 0) {
                    //Start ASA-1310 prasanna ASA-1310_25890
                    var BaseHeight = parseFloat(Math.max.apply(Math, module_hgt_arr));
                    var final_height = parseFloat(p_pog_json_arr[p_pog_index].H - BaseHeight);
                    HeadInfo["BaseH"] = wpdSetFixed(final_height);
                } else {
                    HeadInfo["BaseH"] = wpdSetFixed(p_pog_json_arr[p_pog_index].BaseH);
                } //End ASA-1310 prasanna ASA-1310_25890

                HeadInfo["DesignType"] = "D";
                HeadInfo["DraftVersion"] = p_pog_json_arr[p_pog_index].draftVersion; //ASA-1912
                HeadInfo["BaseW"] = wpdSetFixed(p_pog_json_arr[p_pog_index].W);
                HeadInfo["BaseD"] = wpdSetFixed(p_pog_json_arr[p_pog_index].D);
                HeadInfo["BaseX"] = wpdSetFixed(HeadInfo["BaseW"] / 2);
                HeadInfo["BaseY"] = wpdSetFixed(HeadInfo["BaseH"] / 2);
                HeadInfo["NewPOG"] = p_pog_json_arr[p_pog_index].NewPOG;
                //---------------------------------------------------------------

                if (typeof p_pog_json_arr[p_pog_index].SubDept == "undefined") {
                    HeadInfo["SubDept"] = "";
                } else {
                    HeadInfo["SubDept"] = p_pog_json_arr[p_pog_index].SubDept;
                }
                HeadInfo["BackDepth"] = 0.01;
                HeadInfo["TrafficFlow"] = "LR";
                HeadInfo["HorzStart"] = 0;
                HeadInfo["HorzSpacing"] = 0;
                HeadInfo["VertStart"] = 0;
                HeadInfo["VertSpacing"] = 0;
                HeadInfo["AllowOverlap"] = "N";
                //var effdate = new Date(p_pog_json_arr[p_pog_index].EffStartDate).toLocaleDateString("en-ZA"); //ASA-1085 ISSUE 1
                //var effdate = new Date(p_pog_json_arr[p_pog_index].EffStartDate.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/,'$4:$5:$6 $2/$3/$1'));
                //	var effdate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
                // if (p_pog_json_arr[p_pog_index].EffStartDate < p_vdate) {  
                // 	HeadInfo["EffStartDate"] = p_vdate;
                // } else {
                // 	HeadInfo["EffStartDate"] = p_pog_json_arr[p_pog_index].EffStartDate;
                // }
                if ($v('P25_POG_EFFECTIVE_START_DATE_UPD') == 'Y') {    //ASA-1953
                    if (p_pog_json_arr[p_pog_index].EffStartDate < p_vdate) {
                        HeadInfo["EffStartDate"] = p_vdate;
                    } else {
                        HeadInfo["EffStartDate"] = p_pog_json_arr[p_pog_index].EffStartDate;
                    }
                }
                else if ($v('P25_POG_EFF_START_DATE_UPDATE') == 'Y') {      //ASA-1983 add else if
                    if (p_pog_json_arr[p_pog_index].EffStartDate > p_vdate + 1) {
                        HeadInfo["EffStartDate"] = p_pog_json_arr[p_pog_index].EffStartDate;
                    } else {
                        HeadInfo["EffStartDate"] = p_vdate + 1;
                    }
                } else {
                    //HeadInfo["EffStartDate"] = p_pog_json_arr[p_pog_index].EffStartDate;
                    HeadInfo["EffStartDate"] = moment(p_pog_json_arr[p_pog_index].EffStartDate, get_js_date_format()).format('YYYYMMDD');
                }
            } else {
                //This means the json is coming from sm_pog_design which was already saved to this table.
                HeadInfo["DesignType"] = "D";
                HeadInfo["DraftVersion"] = p_pog_json_arr[p_pog_index].draftVersion; //ASA-1912
                HeadInfo["SubDept"] = p_pog_json_arr[p_pog_index].SubDept;
                HeadInfo["BackDepth"] = p_pog_json_arr[p_pog_index].BackDepth;
                HeadInfo["TrafficFlow"] = p_pog_json_arr[p_pog_index].TrafficFlow;
                HeadInfo["HorzStart"] = p_pog_json_arr[p_pog_index].HorzStart;
                HeadInfo["HorzSpacing"] = p_pog_json_arr[p_pog_index].HorzSpacing;
                HeadInfo["VertStart"] = p_pog_json_arr[p_pog_index].VertStart;
                HeadInfo["VertSpacing"] = p_pog_json_arr[p_pog_index].VertSpacing;
                HeadInfo["AllowOverlap"] = p_pog_json_arr[p_pog_index].AllowOverlap;
                HeadInfo["BaseH"] = wpdSetFixed(p_pog_json_arr[p_pog_index].BaseH);
                HeadInfo["BaseW"] = wpdSetFixed(p_pog_json_arr[p_pog_index].BaseW);
                HeadInfo["BaseD"] = wpdSetFixed(p_pog_json_arr[p_pog_index].BaseD);
                HeadInfo["BaseX"] = wpdSetFixed(p_pog_json_arr[p_pog_index].BaseX);
                HeadInfo["BaseY"] = wpdSetFixed(p_pog_json_arr[p_pog_index].BaseY);
                //var effdate = new Date(p_pog_json_arr[p_pog_index].EffStartDate).toLocaleDateString("en-ZA"); // ASA-1085 ISSUE 1
                HeadInfo["NewPOG"] = p_pog_json_arr[p_pog_index].NewPOG;
                //	var effdate = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
                // if (p_pog_json_arr[p_pog_index].EffStartDate < p_vdate) {   
                // 	HeadInfo["EffStartDate"] = p_vdate;
                // } 
                // else {
                // 	HeadInfo["EffStartDate"] = p_pog_json_arr[p_pog_index].EffStartDate;
                // }
                if ($v('P25_POG_EFFECTIVE_START_DATE_UPD') == 'Y') {      //ASA-1953
                    if (p_pog_json_arr[p_pog_index].EffStartDate < p_vdate) {
                        HeadInfo["EffStartDate"] = p_vdate;
                    } else {
                        HeadInfo["EffStartDate"] = p_pog_json_arr[p_pog_index].EffStartDate;
                    }
                } else {
                    HeadInfo["EffStartDate"] = p_pog_json_arr[p_pog_index].EffStartDate;

                }

            }
            //HeadInfo["Version"] = p_pog_json_arr[p_pog_index].Version;
            HeadInfo["POGCode"] = p_pog_json_arr[p_pog_index].POGCode;
            HeadInfo["Opened"] = p_pog_opened;
            HeadInfo["Name"] = p_pog_json_arr[p_pog_index].Name;
            HeadInfo["Division"] = p_pog_json_arr[p_pog_index].Division;
            HeadInfo["Dept"] = p_pog_json_arr[p_pog_index].Dept;
            HeadInfo["Type"] = p_pog_json_arr[p_pog_index].Type;
            HeadInfo["H"] = wpdSetFixed(p_pog_json_arr[p_pog_index].H);
            HeadInfo["W"] = wpdSetFixed(p_pog_json_arr[p_pog_index].W);
            HeadInfo["D"] = wpdSetFixed(p_pog_json_arr[p_pog_index].D);
            HeadInfo["SegmentW"] = wpdSetFixed(p_pog_json_arr[p_pog_index].SegmentW);
            HeadInfo["NotchW"] = wpdSetFixed(p_pog_json_arr[p_pog_index].NotchW);
            var default_not_start = 0;
            if (p_DefaultNotchStart > -1 && p_pog_json_arr[p_pog_index].NotchStart == 0 && p_pog_json_arr[p_pog_index].NotchW > 0) {
                default_not_start = p_DefaultNotchStart / 100;
            } else {
                default_not_start = p_pog_json_arr[p_pog_index].NotchStart;
            }
            HeadInfo["NotchStart"] = default_not_start;
            HeadInfo["NotchSpacing"] = p_pog_json_arr[p_pog_index].NotchSpacing;
            HeadInfo["SpecialType"] = p_pog_json_arr[p_pog_index].SpecialType;
            HeadInfo["SpecialTypeDesc"] = p_pog_json_arr[p_pog_index].SpecialTypeDesc;
            HeadInfo["DisplayMeterage"] = p_pog_json_arr[p_pog_index].DisplayMeterage;
            HeadInfo["RPTMeterage"] = p_pog_json_arr[p_pog_index].RPTMeterage;
            HeadInfo["ModuleDIR"] = p_pog_json_arr[p_pog_index].ModuleDIR;
            HeadInfo["Direction"] = p_pog_json_arr[p_pog_index].Direction;
            HeadInfo["OrderType"] = p_pog_json_arr[p_pog_index].OrderType;
            HeadInfo["StartOneFixel"] = p_pog_json_arr[p_pog_index].StartOneFixel;
            HeadInfo["StartOneModuleLoc"] = p_pog_json_arr[p_pog_index].StartOneModuleLoc;
            HeadInfo["Ignore"] = p_pog_json_arr[p_pog_index].Ignore;
            HeadInfo["StartOneModuleFixel"] = p_pog_json_arr[p_pog_index].StartOneModuleFixel;
            HeadInfo["IncludeModName"] = p_pog_json_arr[p_pog_index].IncludeModName;
            HeadInfo["Separator"] = p_pog_json_arr[p_pog_index].Separator;
            HeadInfo["LeadingText"] = p_pog_json_arr[p_pog_index].LeadingText;
            HeadInfo["TrailingText"] = p_pog_json_arr[p_pog_index].TrailingText;
            //	HeadInfo["EffStartDate"] = p_pog_json_arr[p_pog_index].EffStartDate;
            HeadInfo["BrandGroupID"] = p_pog_json_arr[p_pog_index].BrandGroupID;
            HeadInfo["Remarks"] = p_pog_json_arr[p_pog_index].Remarks;
            HeadInfo["FixtureGeneration"] = p_pog_json_arr[p_pog_index].FixtureGeneration;
            HeadInfo["FixtureFamily"] = p_pog_json_arr[p_pog_index].FixtureFamily;
            HeadInfo["FixtureFamilyHidden"] = typeof p_pog_json_arr[p_pog_index].FixtureFamilyHidden == "undefined" ? p_pog_json_arr[p_pog_index].FixtureFamily : p_pog_json_arr[p_pog_index].FixtureFamilyHidden;
            HeadInfo["FixtureType"] = p_pog_json_arr[p_pog_index].FixtureType;
            HeadInfo["FixtureTypeDesc"] = typeof p_pog_json_arr[p_pog_index].FixtureTypeDesc == "undefined" ? p_pog_json_arr[p_pog_index].FixtureType : p_pog_json_arr[p_pog_index].FixtureTypeDesc;
            HeadInfo["FixtureCodes"] = typeof p_pog_json_arr[p_pog_index].FixtureCodes == "undefined" ? "" : p_pog_json_arr[p_pog_index].FixtureCodes; //ASA-1694
            HeadInfo["FixtureCount"] = typeof p_pog_json_arr[p_pog_index].FixtureCount == "undefined" ? "" : p_pog_json_arr[p_pog_index].FixtureCount; //ASA-1694
            HeadInfo["Flex_Text_1"] = p_pog_json_arr[p_pog_index].Flex_Text_1;
            HeadInfo["Flex_Text_2"] = p_pog_json_arr[p_pog_index].Flex_Text_2;
            HeadInfo["Flex_Text_3"] = p_pog_json_arr[p_pog_index].Flex_Text_3;
            HeadInfo["Flex_Text_4"] = p_pog_json_arr[p_pog_index].Flex_Text_4;
            HeadInfo["Flex_Text_11"] = p_pog_json_arr[p_pog_index].Flex_Text_11; //ASA-1531
            HeadInfo["Flex_Text_12"] = p_pog_json_arr[p_pog_index].Flex_Text_12; //ASA-1531
            HeadInfo["Flex_Text_13"] = p_pog_json_arr[p_pog_index].Flex_Text_13; //ASA-1531
            HeadInfo["Flex_Text_14"] = p_pog_json_arr[p_pog_index].Flex_Text_14; //ASA-1754
            HeadInfo["Flex_Text_15"] = (p_pog_json_arr[p_pog_index].Flex_Text_15 !== undefined &&
                p_pog_json_arr[p_pog_index].Flex_Text_15 !== null &&
                p_pog_json_arr[p_pog_index].Flex_Text_15 !== "")
                ? p_pog_json_arr[p_pog_index].Flex_Text_15
                : p_pog_json_arr[p_pog_index].FixtureGroup; //ASA-1754 // ASA-1990 Req 3
            HeadInfo["FixtureGroup"] = p_pog_json_arr[p_pog_index].FixtureGroup; //ASA-1754
            HeadInfo["Flex_Lov_1"] = p_pog_json_arr[p_pog_index].Flex_Lov_1;
            HeadInfo["Flex_Lov_2"] = p_pog_json_arr[p_pog_index].Flex_Lov_2;
            HeadInfo["Flex_Lov_3"] = p_pog_json_arr[p_pog_index].Flex_Lov_3;
            HeadInfo["Flex_Lov_4"] = p_pog_json_arr[p_pog_index].Flex_Lov_4;
            HeadInfo["Flex_Lov_5"] = p_pog_json_arr[p_pog_index].Flex_Lov_5;
            HeadInfo["Flex_Lov_6"] = p_pog_json_arr[p_pog_index].Flex_Lov_6;
            HeadInfo["StoreSegment"] = p_pog_json_arr[p_pog_index].StoreSegment;
            HeadInfo["Desc7"] = p_pog_json_arr[p_pog_index].Desc7;
            HeadInfo["Area"] = p_pog_json_arr[p_pog_index].Area;
            HeadInfo["PLNDept"] = p_pog_json_arr[p_pog_index].PLNDept;
            HeadInfo["CompBaseObjID"] = p_pog_json_arr[p_pog_index].CompBaseObjID;
            HeadInfo["CompCamX"] = p_pog_json_arr[p_pog_index].CompCamX;
            HeadInfo["CompCamY"] = p_pog_json_arr[p_pog_index].CompCamY;
            HeadInfo["CompCamWidth"] = p_pog_json_arr[p_pog_index].CompCamWidth;
            HeadInfo["CompCamHeight"] = p_pog_json_arr[p_pog_index].CompCamHeight;
            if (typeof p_pog_json_arr[p_pog_index].Color == "undefined") {
                HeadInfo["Color"] = p_PogDefaultColor;
            } else {
                HeadInfo["Color"] = p_pog_json_arr[p_pog_index].Color;
            }

            HeadInfo["BaseZ"] = wpdSetFixed(p_pog_json_arr[p_pog_index].BaseZ);
            HeadInfo["p_cameraX"] = p_pog_json_arr[p_pog_index].p_cameraX;
            HeadInfo["p_cameraY"] = p_pog_json_arr[p_pog_index].p_cameraY;
            HeadInfo["p_cameraZ"] = p_pog_json_arr[p_pog_index].p_cameraZ;
            HeadInfo["X"] = wpdSetFixed(p_pog_json_arr[p_pog_index].X);
            HeadInfo["Y"] = wpdSetFixed(p_pog_json_arr[p_pog_index].Y);
            HeadInfo["Category"] = p_pog_json_arr[p_pog_index].Category;
            HeadInfo["SubCategory"] = p_pog_json_arr[p_pog_index].SubCategory;
            HeadInfo["GenrateCombineS"] = p_pog_json_arr[p_pog_index].GenrateCombineS; //ASA-1353 issue 3 --Task_27104 20240417
            if (typeof p_pog_json_arr[p_pog_index].SalesInfo !== "undefined" && p_pog_json_arr[p_pog_index].SalesInfo.length > 0) {
                //ASA-1400-S
                HeadInfo["SalesInfo"] = p_pog_json_arr[p_pog_index].SalesInfo;
            } else {
                HeadInfo["SalesInfo"] = [];
            } //ASA-1400-E
            HeadInfo["MassUpdate"] = typeof p_pog_json_arr[p_pog_index].MassUpdate !== "undefined" && p_pog_json_arr[p_pog_index].MassUpdate !== null && p_pog_json_arr[p_pog_index].MassUpdate !== "" ? p_pog_json_arr[p_pog_index].MassUpdate : "N"; //TASK 25959 added due to mass update for pegboard loction Y not has been changed //--20240415 Rregression issue 12

            if (typeof p_pog_json_arr[p_pog_index].PromStartDt == "undefined") {
                HeadInfo["PromStartDt"] = "";
            } else {
                HeadInfo["PromStartDt"] = p_pog_json_arr[p_pog_index].PromStartDt; //ASA-1202
            }
            if (typeof p_pog_json_arr[p_pog_index].PromEndDt == "undefined") {
                HeadInfo["PromEndDt"] = "";
            } else {
                HeadInfo["PromEndDt"] = p_pog_json_arr[p_pog_index].PromEndDt; //ASA-1202
            }
            if (typeof p_pog_json_arr[p_pog_index].PromName == "undefined") {
                HeadInfo["PromName"] = "";
            } else {
                HeadInfo["PromName"] = p_pog_json_arr[p_pog_index].PromName; //ASA-1202
            }
            if (typeof p_pog_json_arr[p_pog_index].PDFTemplateName == "undefined") {
                HeadInfo["PDFTemplateName"] = "";
            } else {
                HeadInfo["PDFTemplateName"] = p_pog_json_arr[p_pog_index].PDFTemplateName; //ASA-1876
            }
            if (typeof p_pog_json_arr[p_pog_index].ComparePogVersion == "undefined") {
                HeadInfo["ComparePogVersion"] = "";
            } else {
                HeadInfo["ComparePogVersion"] = p_pog_json_arr[p_pog_index].ComparePogVersion; //ASA-2009
            }
            if (typeof p_pog_json_arr[p_pog_index].StoreFormat == "undefined") {
                HeadInfo["StoreFormat"] = "";
            } else {
                HeadInfo["StoreFormat"] = p_pog_json_arr[p_pog_index].StoreFormat; // ASA-1990 Req 3
            }
            HeadInfo["SalesRrshDtl"] = p_pog_json_arr[p_pog_index].SalesRrshDtl;

            if (typeof p_pog_json_arr[p_pog_index].PreVersion !== "undefined") {
                HeadInfo["PreVersion"] = p_pog_json_arr[p_pog_index].PreVersion;
            } else {
                HeadInfo["PreVersion"] = "N";
            }
            HeadInfo["ModuleInfo"] = [];
            if (p_pog_json_arr[p_pog_index].DeleteItems != null && typeof p_pog_json_arr[p_pog_index].DeleteItems !== "undefined") {
                HeadInfo["DeleteItems"] = p_pog_json_arr[p_pog_index].DeleteItems;
            } else {
                HeadInfo["DeleteItems"] = [];
            }
            if (p_pog_json_arr[p_pog_index].MassDelistedItem != null && typeof p_pog_json_arr[p_pog_index].MassDelistedItem !== "undefined") { //ASA-1999
                HeadInfo["MassDelistedItem"] = p_pog_json_arr[p_pog_index].MassDelistedItem;
            } else {
                HeadInfo["MassDelistedItem"] = [];
            }
            g_pog_json[p_pog_index] = HeadInfo;
            HeadInfo["X"] = wpdSetFixed(x);
            HeadInfo["Y"] = wpdSetFixed(y);
        } else {
            HeadInfo = g_pog_json[p_pog_index];
        }
        //this below function will create the g_combineShelfs array used for combined shelfs for creating combinations again and used for crush too.
        create_g_combine_shelfs(p_pog_json_arr, p_pog_index); //ASA-1353 issue 3 --Task_27104 20240417

        x = wpdSetFixed(HeadInfo["W"] / 2);
        y = wpdSetFixed(HeadInfo["H"] / 2 + HeadInfo["BaseH"]);

        p_cameraY = HeadInfo["H"] / 2;
        baseY = parseFloat(HeadInfo["BaseH"]) / 2;
        var colorValue = parseInt(HeadInfo["Color"].replace("#", "0x"), 16);
        var hex_decimal = new THREE.Color(colorValue);
        //set camera z before creating a POG is done because until now position of camera is not set.
        if (p_recreate == "Y") {
            var details = get_min_max_xy(p_pog_index);
            var details_arr = details.split("###");
            set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
        }

        //create base
        if (HeadInfo["BaseH"] > 0 && p_recreate == "Y") {
            var return_val = await add_base("BASE1", HeadInfo["BaseW"], HeadInfo["BaseH"], HeadInfo["BaseD"], hex_decimal, HeadInfo["BaseX"], HeadInfo["BaseY"], "N", p_pog_index);
        }
        var copyJson = [];
        if (p_CopyJsonInd) {
            copyJson = JSON.parse(JSON.stringify(p_pog_json_arr));
            //if (p_new_pog_ind == 'N' && p_pog_type == 'F') {
            var i = 0;
            var prev_index = -1;
            for (const modules of copyJson[p_pog_index].ModuleInfo) {
                if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                    if (prev_index == -1) {
                        x = wpdSetFixed(modules.W / 2);
                        y = wpdSetFixed(modules.H / 2 + HeadInfo["BaseH"]);
                    } else {
                        x = wpdSetFixed(copyJson[p_pog_index].ModuleInfo[prev_index].X + copyJson[p_pog_index].ModuleInfo[prev_index].W / 2 + modules.W / 2);
                        y = wpdSetFixed(modules.H / 2 + HeadInfo["BaseH"]);
                    }
                    copyJson[p_pog_index].ModuleInfo[i].X = x;
                    copyJson[p_pog_index].ModuleInfo[i].Y = y;
                    prev_index = i;
                    var j = 0;
                    var l_shelf_details = modules.ShelfInfo;
                    l_shelf_details.sort((a, b) => (a.Y > b.Y && a.ObjType !== "NOTCH" && a.ObjType !== "BASE" ? 1 : -1));
                    if (p_new_pog_ind == "N" && p_pog_type == "F") {
                        for (const shelfs of modules.ShelfInfo) {
                            copyJson[p_pog_index].ModuleInfo[i].ShelfInfo[j].X = wpdSetFixed(shelfs.X + parseFloat(shelfs.W) / 2);
                            copyJson[p_pog_index].ModuleInfo[i].ShelfInfo[j].Y = wpdSetFixed(shelfs.Y + parseFloat(shelfs.H) / 2);
                            j = j + 1;
                        }
                    }
                }
                i++;
                //  };
            }
        }
        if (typeof p_pog_json_arr[p_pog_index].ModuleInfo !== "undefined") {
            if (p_pog_json_arr[p_pog_index].ModuleInfo.length > 0) {
                var module_details = p_pog_json_arr[p_pog_index].ModuleInfo;
                //module_details.sort((a, b) => (a.SeqNo > b.SeqNo && typeof a.ParentModule !== 'undefined' && a.ParentModule !== null) ? 1 : -1);
                var sorto = {
                    SeqNo: "asc",
                };
                module_details.keySort(sorto);
                if (typeof g_json !== "undefined" && g_json.length > 0) {
                    //Start ASA-1418 //ASA-1420 Issue 2
                    var g_json_mod_dtl = g_json[0].ModuleInfo;
                    g_json_mod_dtl.keySort(sorto);

                    var i = 0;
                    for (const modules of g_json_mod_dtl) {
                        if (modules.ShelfInfo.length > 0) {
                            $.each(modules.ShelfInfo, function (k, shelfs) {
                                if (typeof shelfs !== "undefined") {
                                    if (shelfs.ObjType == "BASE") {
                                        g_json[0].ModuleInfo[i].ShelfInfo.splice(k, 1);
                                    }
                                }
                            });
                        }
                        i++;
                    }
                } //End ASA-1418
                var i = 0;
                var module_ind = -1;
                for (const modules of module_details) {
                    if (modules.ShelfInfo.length > 0) {
                        $.each(modules.ShelfInfo, function (k, shelfs) {
                            if (typeof shelfs !== "undefined") {
                                if (shelfs.ObjType == "BASE") {
                                    p_pog_json_arr[p_pog_index].ModuleInfo[i].ShelfInfo.splice(k, 1);
                                }
                            }
                        });
                    }

                    var ModuleInfo = {};
                    if (p_create_json == "Y") {
                        if (p_new_pog_ind == "N" && p_pog_type == "F") {
                            if (typeof modules.SubDept == "undefined") {
                                ModuleInfo["SubDept"] = "";
                            } else {
                                ModuleInfo["SubDept"] = modules.SubDept;
                            }
                            ModuleInfo["Rotation"] = 0;
                            ModuleInfo["HorzStart"] = 0;
                            ModuleInfo["HorzSpacing"] = 0;
                            ModuleInfo["VertStart"] = 0;
                            ModuleInfo["VertSpacing"] = 0;
                            ModuleInfo["AllowOverlap"] = "N";
                            ModuleInfo["LNotch"] = 0;
                            ModuleInfo["Backboard"] = 1;
                            ModuleInfo["RNotch"] = 0;
                            ModuleInfo["LastCount"] = 0;
                            ModuleInfo["EditFlag"] = "N";
                            if (typeof modules.Carpark !== "undefined" && modules.Carpark !== null && typeof modules.Carpark[0] !== "undefined") {
                                if (modules.Carpark[0].ItemInfo == null) {
                                    ModuleInfo["Carpark"] = [];
                                } else if (typeof modules.Carpark[0].ItemInfo !== "undefined") {
                                    if (modules.Carpark[0].ItemInfo.length > 0) {
                                        ModuleInfo["Carpark"] = modules.Carpark;
                                    } else {
                                        ModuleInfo["Carpark"] = [];
                                    }
                                } else if (modules.Carpark.length > 0) {
                                    ModuleInfo["Carpark"] = modules.Carpark;
                                } else {
                                    ModuleInfo["Carpark"] = [];
                                }
                            } else {
                                ModuleInfo["Carpark"] = [];
                            }
                            //ModuleInfo["Carpark"] = typeof modules.Carpark !== 'undefined' ? modules.Carpark : [];
                        } else {
                            ModuleInfo["SubDept"] = modules.SubDept;
                            ModuleInfo["Rotation"] = modules.Rotation;
                            ModuleInfo["HorzStart"] = modules.HorzStart;
                            ModuleInfo["HorzSpacing"] = modules.HorzSpacing;
                            ModuleInfo["VertStart"] = modules.VertStart;
                            ModuleInfo["VertSpacing"] = modules.VertSpacing;
                            ModuleInfo["AllowOverlap"] = modules.AllowOverlap;
                            ModuleInfo["LNotch"] = modules.LNotch;
                            ModuleInfo["Backboard"] = modules.Backboard;
                            ModuleInfo["RNotch"] = modules.RNotch;
                            ModuleInfo["LastCount"] = modules.LastCount;
                            ModuleInfo["EditFlag"] = typeof modules.EditFlag !== "undefined" ? modules.EditFlag : "N";
                            if (typeof modules.Carpark !== "undefined" && modules.Carpark !== null && typeof modules.Carpark[0] !== "undefined") {
                                if (modules.Carpark[0].ItemInfo == null) {
                                    ModuleInfo["Carpark"] = [];
                                } else if (typeof modules.Carpark[0].ItemInfo !== "undefined") {
                                    if (modules.Carpark[0].ItemInfo.length > 0) {
                                        ModuleInfo["Carpark"] = modules.Carpark;
                                    } else {
                                        ModuleInfo["Carpark"] = [];
                                    }
                                } else if (modules.Carpark.length > 0) {
                                    ModuleInfo["Carpark"] = modules.Carpark;
                                } else {
                                    ModuleInfo["Carpark"] = [];
                                }
                            } else {
                                ModuleInfo["Carpark"] = [];
                            }
                            //ModuleInfo["Carpark"] = typeof modules.Carpark !== 'undefined' ? modules.Carpark : [];
                        }
                        ModuleInfo["SeqNo"] = modules.SeqNo;
                        ModuleInfo["Module"] = modules.Module;
                        if (typeof modules.ParentModule == "undefined") {
                            ModuleInfo["ParentModule"] = null;
                        } else {
                            ModuleInfo["ParentModule"] = modules.ParentModule;
                        }
                        ModuleInfo["ParentModuleIndex"] = modules.ParentModuleIndex;
                        ModuleInfo["POGModuleName"] = modules.ModuleName;
                        ModuleInfo["Remarks"] = modules.Remarks;
                        ModuleInfo["H"] = wpdSetFixed(modules.H);
                        ModuleInfo["W"] = wpdSetFixed(modules.W);
                        ModuleInfo["D"] = wpdSetFixed(modules.D);
                        if (typeof modules.Color == "undefined") {
                            ModuleInfo["Color"] = p_PogModuleDefaultColor;
                        } else {
                            ModuleInfo["Color"] = modules.Color;
                        }

                        ModuleInfo["NotchW"] = modules.NotchW;
                        var default_not_start = 0;
                        if (p_DefaultNotchStart > -1 && modules.NotchStart == 0 && modules.NotchW > 0) {
                            default_not_start = p_DefaultNotchStart / 100;
                        } else {
                            default_not_start = modules.NotchStart;
                        }
                        ModuleInfo["NotchStart"] = default_not_start;
                        ModuleInfo["NotchSpacing"] = modules.NotchSpacing;
                        ModuleInfo["CompMObjID"] = modules.CompMObjID;
                        if (modules.NotchW > 0) {
                            g_pog_json[p_pog_index].NotchW = modules.NotchW;
                            g_pog_json[p_pog_index].NotchStart = modules.NotchStart;
                            g_pog_json[p_pog_index].NotchSpacing = modules.NotchSpacing;
                        }

                        if (i == 0) {
                            x = wpdSetFixed(ModuleInfo["W"] / 2);
                            y = wpdSetFixed(ModuleInfo["H"] / 2 + g_pog_json[p_pog_index].BaseH);
                        } else {
                            x = wpdSetFixed(g_pog_json[p_pog_index].ModuleInfo[g_pog_json[p_pog_index].ModuleInfo.length - 1].X + ModuleInfo["W"] / 2);
                            y = wpdSetFixed(ModuleInfo["H"] / 2 + g_pog_json[p_pog_index].BaseH);
                        }

                        ModuleInfo["X"] = x;
                        ModuleInfo["Y"] = y;
                        ModuleInfo["Z"] = 0;
                        ModuleInfo["ChestInfo"] = modules.ChestInfo !== null && typeof modules.ChestInfo !== "undefined" && modules.ChestInfo !== "" ? modules.ChestInfo : []; //Bug-26122 - splitting the chest
                        //ASA-1994
                        ModuleInfo["SvnCode"] = modules.SvnCode;
                        ModuleInfo["EgtCode"] = modules.EgtCode;
                        //ends
                        ModuleInfo["ShelfInfo"] = [];
                        g_pog_json[p_pog_index].ModuleInfo.push(ModuleInfo);
                        module_ind = g_pog_json[p_pog_index].ModuleInfo.length - 1;
                    } else {
                        ModuleInfo = modules;
                        x = wpdSetFixed(modules.X);
                        y = wpdSetFixed(modules.Y);
                        module_ind = i;
                    }

                    if ((typeof modules.ParentModule == "undefined" || modules.ParentModule == null) && p_recreate == "Y") {
                        g_pog_json[p_pog_index].SegmentW = modules.W;
                        var colorValue = parseInt(ModuleInfo["Color"].replace("#", "0x"), 16);
                        var hex_decimal = new THREE.Color(colorValue);
                        var return_val = await add_module_lib(modules.Module, modules.W, modules.H, modules.D, hex_decimal, x, y, "N", "Y", modules.VertStart, modules.VertSpacing, modules.HorzStart, modules.HorzSpacing, "Y", p_camera, module_ind, p_SpreadItem, p_HorizSpacing, p_VertiSpacing, p_BsktWallThickness, p_ChestWallThickness, p_AutoPlacing, p_WrapText, p_FSize, p_TextboxColor, p_ShelfColor, p_DivColor, p_SlotDivider, p_SlotOrientation, p_DividerFixed, p_ItemColor, p_ItemDelistColor, p_pegHolesActive, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_notchHead, p_updateObjInd, p_pog_index, p_pDftBskFill, p_pDftBaskSprd, p_m_crush);
                    }
                    if (typeof modules.Carpark !== "undefined" && modules.Carpark !== null) {
                        if (modules.Carpark.length > 0) {
                            carparkShelfCreated = "N";
                            var return_val = await create_shelf_edit_pog_lib(i, modules.Carpark, modules.W, "Y", p_new_pog_ind, p_pog_type, "Y", p_recreate, p_create_json, p_AutoPlacing, p_ShelfColor, p_DivColor, p_SlotDivider, p_SlotOrientation, p_DividerFixed, p_ItemColor, p_ItemDelistColor, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_notchHead, p_updateObjInd, p_camera, p_pog_index, p_orgPogIndex, p_m_crush);
                        }
                    }

                    if (p_pog_json_arr[p_pog_index].ModuleInfo[i].ShelfInfo.length > 0) {
                        var return_val = await create_shelf_from_json_lib(i, p_pog_json_arr, modules.W, "Y", p_new_pog_ind, p_pog_type, p_recreate, p_create_json, p_CopyJsonInd, copyJson, p_showSingleModule, p_org_mod_index, p_SpreadItem, p_HorizSpacing, p_VertiSpacing, p_BsktWallThickness, p_ChestWallThickness, p_AutoPlacing, p_WrapText, p_FSize, p_TextboxColor, p_ShelfColor, p_ItemColor, p_ItemDelistColor, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_updateObjInd, p_notchHead, p_pDftBskFill, p_pDftBaskSprd, p_camera, p_pog_index, p_orgPogIndex, p_m_crush, p_crush_item); //ASA-1310 KUSH FIX
                    }
                    //}
                    i = i + 1;
                }

                mod_details = g_pog_json[p_pog_index].ModuleInfo;
                temp_mod_details = g_pog_json[p_pog_index].ModuleInfo;

                var c = 0;
                //Start ASA-1349 issue 14
                for (const modules of mod_details) {
                    if (typeof modules.ParentModule == "undefined" || modules.ParentModule == null) {
                        var i = 0;
                        for (shelfs of modules.ShelfInfo) {
                            console.log(shelfs.AutoDepthCalc, shelfs.SMassUpdate, "values");
                            var j = 0;
                            var recreate_shelf = "N";
                            for (items of shelfs.ItemInfo) {
                                /*if (typeof shelfs.SMassUpdate !== 'undefined' && shelfs.SMassUpdate == 'Y') {//ASA-1350 issue 6 // 20240415 Rregression issue 12 20240430 commented because new crushitem can get max merch based on g_json and crush height
                                    var retval = crushItem(p_pog_index, c, i, j, "H", "Y", [items.D], [j], 'Y');//ASA-1383 issue 8
                                    if (retval == 'Y' && g_show_live_image == 'N') {
                                        recreate_shelf = 'Y';
                                    }
                                }*/
                                if (typeof shelfs.AutoDepthCalc !== "undefined" && shelfs.AutoDepthCalc == "Y") {
                                    //ASA-1351 //ASA-1350 issue 6
                                    var temp_cal_depth_fac = g_auto_cal_depth_fac;
                                    g_auto_cal_depth_fac = "Y";
                                    maximizeItemDepthFacings("D", c, i, j, p_pog_index); // ASA-1170
                                    g_auto_cal_depth_fac = temp_cal_depth_fac;
                                }
                                j++;
                            }
                            /*if (recreate_shelf == 'Y') {20240415 Rregression issue 12 20240430 commented because new crushitem can get max merch based on g_json and crush height
                                await recreate_all_items(c, i, shelfs.ObjType, "Y", -1, -1, shelfs.ItemInfo.length, "N", "N", -1, -1, p_pog_index, "", p_pog_index, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, 'Y');//ASA-1350 issue 6 adding params////ASA-1353 issue 3 regression issue 20240428
                            }*/
                            if (shelfs.ObjType == "TEXTBOX") {
                                var j = 0;
                                for (tmp_mod of temp_mod_details) {
                                    if (typeof tmp_mod.ParentModule !== "undefined" && tmp_mod.ParentModule !== null && tmp_mod.Module == shelfs.Shelf) {
                                        g_pog_json[p_pog_index].ModuleInfo[j].ObjID = shelfs.SObjID;
                                    }
                                    j++;
                                }
                            }
                            i++;
                        }
                    }
                    c = c + 1;
                }
                //End ASA-1349 issue 14
            }
        }
        if (p_recreate == "Y") {
            var details = get_min_max_xy(p_pog_index);
            var details_arr = details.split("###");
            set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, p_pog_index);
        }
        if (p_recreate == "Y") {
            update_rotate_shelfs(p_pog_index);
        }
        g_multi_pog_json[p_pog_index] = g_pog_json[p_pog_index];
        //ASA-1157
        if (typeof g_pog_json !== "undefined" && g_pog_json.length > 0 && p_recreate == "Y") {
            //ASA-1353 issue 3 --Task_27104 20240417
            var m = 0;
            // g_combinedShelfs = []; ASA-1443 //needed to reset as data from DB should be reset again.
            // Regression issue 9, 10, 11 20241007

            for (let i = 0; i < g_combinedShelfs.length; i++) {
                if (g_combinedShelfs[i][0]["PIndex"] == p_pog_index) {
                    g_combinedShelfs.splice(i, 1);
                    i--; // Adjust index after splice
                }
            }
            var moduleCombInfo = g_pog_json[p_pog_index].ModuleInfo;
            for (g_module of moduleCombInfo) {
                var s = 0;
                var shelfCombInfo = g_pog_json[p_pog_index].ModuleInfo[m].ShelfInfo;
                for (shelf_info of shelfCombInfo) {
                    //ASA-1350 issue 6 variable name change
                    if ((shelf_info.ObjType == "SHELF" || shelf_info.ObjType == "HANGINGBAR") && shelf_info.Combine !== "N") {
                        await generateCombinedShelfs(p_pog_index, m, s, p_pogcrDelistItemDftColor, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrItemNumLabelColor, p_pogcrItemNumLabelPosition, p_pogcrDisplayItemInfo, "Y", p_calc_dayofsupply, "Y"); //ASA-1350 issue 6 added parameters //Regression 29(Portal Issue) added p_calc_dayofsupply
                    }
                    s++;
                }
                m++;
            }
        }
        render(p_pog_index);
    } catch (err) {
        error_handling(err);
    }
    return "SUCCESS";
}


function add_base(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_index) {
    logDebug("function : add_base; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; p_edit_ind : " + p_edit_ind, "S");
    try {
        return new Promise(function (resolve, reject) {
            if (p_edit_ind == "Y") {
                var selectedObject = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].BaseObjID);
                g_scene_objects[p_pog_index].scene.children[2].remove(selectedObject);
            }

            var l_pog_base = new THREE.Mesh( //Fix to removed global variable
                new THREE.BoxGeometry(p_width, p_height, 0.001),
                new THREE.MeshStandardMaterial({
                    color: p_color,
                })
            );
            var l_wireframe_id = add_wireframe(l_pog_base, 2);
            l_pog_base.position.x = p_x;
            l_pog_base.position.y = p_y;
            l_pog_base.position.z = 0;
            l_pog_base.uuid = p_uuid;
            g_world.add(l_pog_base);
            g_pog_json[p_pog_index].BaseObjID = l_pog_base.id;
            g_pog_json[p_pog_index].BaseX = p_x;
            g_pog_json[p_pog_index].BaseY = p_y;
            g_pog_json[p_pog_index].BaseZ = 0;
            g_pog_json[p_pog_index].WFrameID = l_wireframe_id;
            resolve("SUCCESS");
            logDebug("function : add_base", "E");
        });
    } catch (err) {
        error_handling(err);
    }
}

function add_notches(p_uuid, p_width, p_height, p_start, p_spacing, p_color, p_edit_ind, p_module_width, p_module_count, p_module_object, p_pog_index) {
    try {
        logDebug("function : add_notches; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; start : " + p_start + "; spacing : " + p_spacing + "; color : " + p_color + "; p_edit_ind : " + p_edit_ind + "; p_module_width : " + p_module_width + "; module_count : " + p_module_count, "S");
        var z = 0.0002; //0.0001 //ASA-1950 Issue5

        var l_notches1 = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, 0.001),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );

        var l_notches2 = new THREE.Mesh(
            new THREE.BoxGeometry(p_width, p_height, 0.001),
            new THREE.MeshStandardMaterial({
                color: p_color,
            })
        );
        var wireframe_id1 = add_wireframe(l_notches1, 2);
        var wireframe_id2 = add_wireframe(l_notches2, 2);

        var l_notch_horz_start = 0 - parseFloat(p_width) / 2;
        var l_notch_vert_start = 0 - parseFloat(p_height) / 2 + parseFloat(p_start);
        var l_notch_horz_end = 0 + parseFloat(p_width) / 2;
        var l_notch_vert_end = 0 + parseFloat(p_height) / 2;

        var curr_vert_value = l_notch_vert_start;
        var verti_values = [];

        verti_values.push(curr_vert_value);
        for (var i = 0; i < 1000; i++) {
            curr_vert_value += parseFloat(p_spacing);
            if (curr_vert_value < l_notch_vert_end) verti_values.push(curr_vert_value);
            else break;
        }

        //var geometry = new THREE.Geometry();
        var points = [];

        for (i = 0; i < verti_values.length; i++) {
            points.push(new THREE.Vector3(l_notch_horz_start, verti_values[i], 0));
            points.push(new THREE.Vector3(l_notch_horz_end, verti_values[i], 0));
        }
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        var material = new THREE.LineBasicMaterial({
            color: 0x000000,
        });

        var line1 = new THREE.LineSegments(geometry, material);
        var line2 = new THREE.LineSegments(geometry, material);

        line1.position.z = 0.0005; // 0.0006 //ASA-1608 Issue 2
        line2.position.z = 0.0005; //0.0006 //ASA-1608 Issue 2
        l_notches1.add(line1);
        l_notches2.add(line2);
        var notch1_x = 0 - parseFloat(p_module_width) / 2 + parseFloat(p_width) / 2;
        var notch2_x = 0 - parseFloat(p_module_width) / 2 + (parseFloat(p_module_width) - parseFloat(p_width) / 2);
        l_notches1.position.x = notch1_x;
        l_notches1.position.y = 0;
        l_notches1.position.z = z;
        l_notches2.position.x = notch2_x;
        l_notches2.position.y = 0;
        l_notches2.position.z = z;
        p_module_object.add(l_notches1);
        p_module_object.add(l_notches2);

        l_notches1.uuid = p_uuid + 1;
        l_notches2.uuid = p_uuid + 2;
        g_pog_json[p_pog_index].ModuleInfo[p_module_count].Notch1X = notch1_x;
        g_pog_json[p_pog_index].ModuleInfo[p_module_count].Notch1Y = 0;
        g_pog_json[p_pog_index].ModuleInfo[p_module_count].Notch1Z = z;
        g_pog_json[p_pog_index].ModuleInfo[p_module_count].Notch1ObjID = l_notches1.id;
        g_pog_json[p_pog_index].ModuleInfo[p_module_count].Notch2X = notch2_x;
        g_pog_json[p_pog_index].ModuleInfo[p_module_count].Notch2Y = 0;
        g_pog_json[p_pog_index].ModuleInfo[p_module_count].Notch2Z = z;
        g_pog_json[p_pog_index].ModuleInfo[p_module_count].Notch2ObjID = l_notches2.id;
        logDebug("function : add_notches", "E");
    } catch (err) {
        error_handling(err);
    }
}

async function add_module_lib(p_uuid, p_width, p_height, p_depth, p_color, p_x, p_y, p_edit_ind, p_pog_flag, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_recreate, p_camera, p_module_ind, p_SpreadItem, p_HorizSpacing, p_VertiSpacing, p_BsktWallThickness, p_ChestWallThickness, p_AutoPlacing, p_WrapText, p_FSize, p_TextboxColor, p_ShelfColor, p_DivColor, p_SlotDivider, p_SlotOrientation, p_DividerFixed, p_ItemColor, p_ItemDelistColor, p_pegHolesActive, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_notchHead, p_updateObjInd = "N", p_pog_index, p_DftBskFill, p_DftBaskSprd, p_m_crush = "N") {
    logDebug("function : add_module_lib; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; x : " + p_x + "; y : " + p_y + "; p_edit_ind : " + p_edit_ind + "; pog_flag : " + p_pog_flag + "; vert_start : " + p_vert_start + "; vert_spacing : " + p_vert_spacing + "; horz_start : " + p_horz_start + "; horz_spacing : " + p_horz_spacing + "; recreate : " + p_recreate + "; module_ind : " + p_module_ind, "S");
    try {
        console.log("add_module_lib", g_pog_json, p_pog_index);
        var notchX;
        if (p_module_ind == -1 || typeof p_module_ind == "undefined") {
            var module_count = parseFloat(g_pog_json[p_pog_index].ModuleInfo.length) - 1;
        } else {
            var module_count = p_module_ind;
        }
        var mod_cnt_chk = module_count;
        var finalX;
        var finalY; //ASA-1694 issue 10
        var moduleX = 0;
        var POGJSON_arr = [];

        if (p_edit_ind == "Y") {
            POGJSON_arr = JSON.parse(g_temp_POG_arr);
            var selectedObject = g_world.getObjectById(g_dblclick_objid);
            g_world.remove(selectedObject);
            module_count = g_module_index;
            var edit_x = 0;
            var object_exists = "N";
            var module_x_arr = [];
            var module_y_arr = [];
            var edit_index_arr = [];
            $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, Modules) {
                if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                    if (i < g_module_index) {
                        edit_x += Modules.W;
                    } else if (i > g_module_index) object_exists = "Y";
                }
            });
            if (object_exists == "Y") {
                finalX = edit_x + p_width / 2;
                module_x_arr.push(finalX);
                module_y_arr.push(p_height / 2 + g_pog_json[p_pog_index].BaseH);
                edit_index_arr.push(module_count);
                edit_x = edit_x + p_width;
                $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, Modules) {
                    if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                        if (i > g_module_index) {
                            var selectedObject = g_world.getObjectById(Modules.MObjID);
                            g_world.remove(selectedObject);
                            finalX = edit_x + Modules.W / 2;
                            edit_index_arr.push(i);
                            module_x_arr.push(finalX);
                            module_y_arr.push(Modules.H / 2 + g_pog_json[p_pog_index].BaseH);
                            edit_x += Modules.W;
                        }
                    }
                });

                var index = 0;
                for (const mod_x of module_x_arr) {
                    const edited_index = edit_index_arr[index];
                    const moduleY = module_y_arr[index];
                    var colorValue = parseInt(g_pog_json[p_pog_index].ModuleInfo[edited_index].Color.replace("#", "0x"), 16);
                    var hex_decimal = new THREE.Color(colorValue);

                    var return_val = await create_final_module(g_pog_json[p_pog_index].ModuleInfo[edited_index].Module, g_pog_json[p_pog_index].ModuleInfo[edited_index].W, g_pog_json[p_pog_index].ModuleInfo[edited_index].H, g_pog_json[p_pog_index].ModuleInfo[edited_index].D, hex_decimal, moduleY, p_edit_ind, g_pog_json[p_pog_index].ModuleInfo[edited_index].VertStart, g_pog_json[p_pog_index].ModuleInfo[edited_index].VertSpacing, g_pog_json[p_pog_index].ModuleInfo[edited_index].HorzStart, g_pog_json[p_pog_index].ModuleInfo[edited_index].HorzSpacing, mod_x, edited_index, p_pegHolesActive, p_pog_index);

                    if (p_edit_ind == "Y" && typeof POGJSON_arr[p_pog_index].ModuleInfo[edited_index] !== "undefined" && typeof POGJSON_arr[p_pog_index].ModuleInfo[0].ShelfInfo !== "undefined") {
                        if (typeof POGJSON_arr[p_pog_index].ModuleInfo[edited_index].Carpark !== "undefined") {
                            if (POGJSON_arr[p_pog_index].ModuleInfo[edited_index].Carpark.length > 0) {
                                var return_val = await create_shelf_edit_pog_lib(edited_index, POGJSON_arr[p_pog_index].ModuleInfo[edited_index].Carpark, p_width, "Y", "Y", "D", "Y", "Y", "Y", p_AutoPlacing, p_ShelfColor, p_DivColor, p_SlotDivider, p_SlotOrientation, p_DividerFixed, p_ItemColor, p_ItemDelistColor, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_notchHead, p_updateObjInd, p_camera, p_pog_index, p_pog_index, p_m_crush);
                            }
                        }
                        if (POGJSON_arr[p_pog_index].ModuleInfo[0].ShelfInfo.length > 0) {
                            var return_val = await create_shelf_from_json_lib(edited_index, POGJSON_arr, g_pog_json[p_pog_index].ModuleInfo[edited_index].W, "N", "Y", "D", "Y", "Y", false, null, "N", null, p_SpreadItem, p_HorizSpacing, p_VertiSpacing, p_BsktWallThickness, p_ChestWallThickness, p_AutoPlacing, p_WrapText, p_FSize, p_TextboxColor, p_ShelfColor, p_ItemColor, p_ItemDelistColor, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_updateObjInd, p_notchHead, p_DftBskFill, p_DftBaskSprd, p_camera, p_pog_index, p_pog_index, p_m_crush); //ASA-1300
                        }
                    }
                    index = index + 1;
                }
            } else {
                finalX = edit_x + p_width / 2;
                var return_val = await create_final_module(g_pog_json[p_pog_index].ModuleInfo[module_count].Module, p_width, p_height, p_depth, p_color, p_y, p_edit_ind, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, finalX, module_count, p_pegHolesActive, p_pog_index);
                if (p_edit_ind == "Y" && typeof POGJSON_arr[p_pog_index].ModuleInfo[module_count] !== "undefined" && typeof POGJSON_arr[p_pog_index].ModuleInfo[0].ShelfInfo !== "undefined") {
                    if (typeof POGJSON_arr[p_pog_index].ModuleInfo[0].Carpark !== "undefined") {
                        if (POGJSON_arr[p_pog_index].ModuleInfo[0].Carpark.length > 0) {
                            var return_val = await create_shelf_edit_pog_lib(0, POGJSON_arr[p_pog_index].ModuleInfo[0].Carpark, p_width, "Y", "Y", "D", "N", "Y", "Y", p_AutoPlacing, p_ShelfColor, p_DivColor, p_SlotDivider, p_SlotOrientation, p_DividerFixed, p_ItemColor, p_ItemDelistColor, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_notchHead, p_updateObjInd, p_camera, p_pog_index, p_pog_index, p_m_crush); //ASA-1300
                        }
                    }
                    if (POGJSON_arr[p_pog_index].ModuleInfo[0].ShelfInfo.length > 0) {
                        var return_val = await create_shelf_from_json_lib(module_count, POGJSON_arr, p_width, "N", "Y", "D", "Y", "Y", false, [], "N", null, p_SpreadItem, p_HorizSpacing, p_VertiSpacing, p_BsktWallThickness, p_ChestWallThickness, p_AutoPlacing, p_WrapText, p_FSize, p_TextboxColor, p_ShelfColor, p_ItemColor, p_ItemDelistColor, p_pogCarparkShelfDftColor, p_enlargeNo, p_merchStyle, p_pogcrLoadImgFrom, p_buId, p_pogcrDelistItemDftColor, p_pogcrItemNumLabelColor, p_pogcrDisplayItemInfo, p_pogcrItemLabelColor, p_pogcrItemNumLabelPosition, p_updateObjInd, p_notchHead, p_DftBskFill, p_DftBaskSprd, p_camera, p_pog_index, p_pog_index, p_m_crush);
                    }
                }
            }
        } else {
            if (g_pog_json[p_pog_index].ModuleInfo.length > 0) {
                var i = 0;
                $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, Modules) {
                    if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                        if (i < module_count) moduleX += Modules.W;
                    }
                });
            }

            finalX = p_width / 2 + moduleX;
            finalY = wpdSetFixed(p_height / 2 + g_pog_json[p_pog_index].BaseH); //ASA-1694 issue 10
            var return_val = await create_final_module(p_uuid, p_width, p_height, p_depth, p_color, finalY, p_edit_ind, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, finalX, module_count, p_pegHolesActive, p_pog_index); //ASA-1694 changes p_y to finalY Issue 10
        }
        var module_sum = g_pog_json[p_pog_index].W;
        if (g_pog_json[p_pog_index].BaseH > 0) {
            var colorValue = parseInt(g_pog_json[p_pog_index].Color.replace("#", "0x"), 16);
            var hex_decimal = new THREE.Color(colorValue);
            g_pog_json[p_pog_index].BaseW = module_sum;
            g_pog_json[p_pog_index].BaseX = module_sum / 2;
            var return_val = add_base("BASE1", module_sum, g_pog_json[p_pog_index].BaseH, g_pog_json[p_pog_index].BaseD, hex_decimal, module_sum / 2, g_pog_json[p_pog_index].BaseY, "Y", p_pog_index);
        }
        if (p_recreate == "N") {
            var details = get_min_max_xy(p_pog_index);
            var details_arr = details.split("###");
            set_camera_z(p_camera, parseFloat(details_arr[2]), parseFloat(details_arr[3]), parseFloat(details_arr[0]), parseFloat(details_arr[1]), g_offset_z, parseFloat(details_arr[4]), parseFloat(details_arr[5]), true, g_pog_index);
        }
        if (p_updateObjInd == "Y") {
            var res = updateObjID(p_uuid, p_module_ind, "M");
        }
        logDebug("function : add_module_lib", "E");
        return "SUCCESS";
    } catch (err) {
        error_handling(err);
    }
}

function create_final_module(p_uuid, p_width, p_height, p_depth, p_color, p_y, p_edit_ind, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, p_finalX, p_edit_module_index, p_pegHolesActive, p_pog_index) {
    try {
        logDebug("function : create_final_module; uuid : " + p_uuid + "; width : " + p_width + "; height : " + p_height + "; depth : " + p_depth + "; color : " + p_color + "; y : " + p_y + "; p_edit_ind : " + p_edit_ind + "; vert_start : " + p_vert_start + "; vert_spacing : " + p_vert_spacing + "; horz_start : " + p_horz_start + "; horz_spacing : " + p_horz_spacing + "; finalX : " + p_finalX + "; edit_module_index : " + p_edit_module_index, "S");
        return new Promise(function (resolve, reject) {
            var l_module = new THREE.Mesh( //remove global variable
                new THREE.BoxGeometry(p_width, p_height, 0.001),
                new THREE.MeshStandardMaterial({
                    color: p_color,
                })
            );

            if (p_vert_spacing > 0 || p_horz_spacing > 0) {
                var dot_module = add_dots_to_object(p_width - g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW * 2, p_height, 0.0007, p_vert_start, p_vert_spacing, p_horz_start, p_horz_spacing, l_module, "MODULE", "", p_edit_module_index, p_pegHolesActive, "N", p_pog_index);

                dot_module.position.x = p_finalX;
                dot_module.position.y = p_y;
                dot_module.position.z = 0;
                dot_module.uuid = p_uuid;
                if (g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW > 0) {
                    add_notches("MODULE" + p_edit_module_index + "_NOTCHES", g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW, p_height, g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchStart, g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchSpacing, p_color, p_edit_ind, p_width, p_edit_module_index, dot_module, p_pog_index);
                }
                var l_wireframe_id = add_wireframe(dot_module, 2);
                dot_module.WFrameID = l_wireframe_id;
                g_world.add(dot_module);
                if (p_edit_ind == "N") {
                    g_module_obj_array.push(dot_module);
                } else {
                    if (p_edit_module_index == 0) {
                        g_module_obj_array.splice(p_edit_module_index, p_edit_module_index + 1);
                    } else {
                        g_module_obj_array.splice(p_edit_module_index, 1);
                    }
                    g_module_obj_array.push(dot_module);
                }
                g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].MObjID = dot_module.id;
                g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].WFrameID = l_wireframe_id;
                dot_module.Module = g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].Module;
                dot_module.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1360 Task 2
                dot_module.Version = g_pog_json[p_pog_index].Version; //ASA-1360 Task 2
                dot_module.SvnCode = g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].SvnCode; //ASA-1994
                dot_module.EgtCode = g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].EgtCode; //ASA-1994
                dot_module.Remarks = g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].Remarks !== null ? g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].Remarks : ""; //ASA-1360 Task 2
            } else {
                l_module.position.x = p_finalX;
                l_module.position.y = p_y;
                l_module.position.z = 0;
                l_module.uuid = p_uuid;
                if (g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW > 0) {
                    add_notches("MODULE" + p_edit_module_index + "_NOTCHES", g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchW, p_height, g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchStart, g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].NotchSpacing, p_color, p_edit_ind, p_width, p_edit_module_index, l_module, p_pog_index);
                }
                var l_wireframe_id = add_wireframe(l_module, 2);
                l_module.WFrameID = l_wireframe_id;
                g_world.add(l_module);
                if (p_edit_ind == "N") {
                    g_module_obj_array.push(l_module);
                } else {
                    if (p_edit_module_index == 0) {
                        g_module_obj_array.splice(p_edit_module_index, p_edit_module_index + 1);
                    } else {
                        g_module_obj_array.splice(p_edit_module_index, 1);
                    }
                    g_module_obj_array.push(l_module);
                }
                g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].MObjID = l_module.id;
                g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].WFrameID = l_wireframe_id;
                l_module.Module = g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].Module;
                l_module.POGCode = g_pog_json[p_pog_index].POGCode; //ASA-1360 Task 2
                l_module.Version = g_pog_json[p_pog_index].Version; //ASA-1360 Task 2
                l_module.Remarks = g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].Remarks !== null ? g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].Remarks : ""; //ASA-1360 Task 2
                l_module.SvnCode = g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].SvnCode; //ASA-1994
                l_module.EgtCode = g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].EgtCode; //ASA-1994
            }
            g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].X = wpdSetFixed(p_finalX);
            g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].Y = wpdSetFixed(p_y);
            g_pog_json[p_pog_index].ModuleInfo[p_edit_module_index].Z = 0;
            resolve("SUCCESS");
            logDebug("function : create_final_module", "E");
        });
    } catch (err) {
        error_handling(err);
    }
}

function update_module_coords(p_height, p_width, p_module_ind, p_pog_index) {
    logDebug("function : update_module_coords; height : " + p_height + "; width : " + p_width + "; module_ind : " + p_module_ind, "S");
    try {
        var module_count = parseFloat(g_pog_json[p_pog_index].ModuleInfo.length) - 1;
        var mod_cnt_chk = module_count;
        var finalX;
        var moduleX = 0;
        var edit_x = 0;
        var object_exists = "N";
        var module_x_arr = [];
        var module_y_arr = [];
        var edit_index_arr = [];

        $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, Modules) {
            if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                if (i < p_module_ind) {
                    edit_x += Modules.W;
                } else if (i > p_module_ind) object_exists = "Y";
            }
        });

        if (object_exists == "Y") {
            finalX = edit_x + p_width / 2;
            module_x_arr.push(finalX);
            module_y_arr.push(p_height / 2 + g_pog_json[p_pog_index].BaseH);
            edit_index_arr.push(module_count);
            edit_x = edit_x + p_width;

            $.each(g_pog_json[p_pog_index].ModuleInfo, function (i, Modules) {
                if (Modules.ParentModule == null || Modules.ParentModule == "undefined") {
                    if (i > p_module_ind) {
                        finalX = edit_x + Modules.W / 2;
                        edit_index_arr.push(i);
                        module_x_arr.push(finalX);
                        module_y_arr.push(Modules.H / 2 + g_pog_json[p_pog_index].BaseH);
                        edit_x += Modules.W;
                    }
                }
            });

            module_x_arr.forEach((mod_x, index) => {
                const edited_index = edit_index_arr[index];
                const moduleY = module_y_arr[index];
                g_pog_json[p_pog_index].ModuleInfo[edit_index_arr[index]].X = mod_x;
                g_pog_json[p_pog_index].ModuleInfo[edit_index_arr[index]].Y = module_y_arr[index];
            });
        } else {
            g_pog_json[p_pog_index].ModuleInfo[p_module_ind].X = edit_x + p_width / 2;
            g_pog_json[p_pog_index].ModuleInfo[p_module_ind].Y = p_height / 2 + g_pog_json[p_pog_index].BaseH;
        }
        logDebug("function : update_module_coords", "E");
    } catch (err) {
        error_handling(err);
        logDebug("function : update_module_coords", "E");
    }
}


//Start ASA-1371_26842
function get_notch_no(p_modules, p_pog_index, p_shelf_top) {
    var cap_count = 100;
    var notch_no = 0;
    for (k = 0; k < cap_count; k++) {
        if (p_shelf_top < g_pog_json[p_pog_index].BaseH + p_modules.NotchStart / 2 && p_modules.NotchStart > 0) {
            notch_no = 0;
            break;
        } else if (p_shelf_top <= g_pog_json[p_pog_index].BaseH + p_modules.NotchStart && p_modules.NotchStart > 0) {
            notch_no = 1;
            break;
        } else if (p_shelf_top <= g_pog_json[p_pog_index].BaseH && p_modules.NotchStart == 0) {
            notch_no = 0;
            break;
        } else if (wpdSetFixed(p_shelf_top) < wpdSetFixed(g_pog_json[p_pog_index].BaseH + p_modules.NotchStart + p_modules.NotchSpacing * k)) {
            notch_no = k;
            break;
        }
    }
    return notch_no;
}
//End ASA-1371_26842

async function update_single_notch_label(p_label_ind, p_mod_index, p_shelf_cnt, p_notchHead, p_shelf_obj, p_pog_index, p_carpark_ind) {
    //ASA-1254 Notch no to be updated always to show in status bar
    var shelfs = g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_cnt];
    var modules = g_pog_json[p_pog_index].ModuleInfo[p_mod_index];
    var notch_label = g_notch_label_position.toUpperCase();
    if (g_pog_json[p_pog_index].ModuleInfo[p_mod_index].NotchW > 0 && shelfs.ObjType !== "BASE" && shelfs.ObjType !== "NOTCH" && shelfs.ObjType !== "DIVIDER" && shelfs.ObjType !== "TEXTBOX") {
        if (p_shelf_obj == "") {
            try {
                p_shelf_obj = g_scene_objects[p_pog_index].scene.children[2].getObjectById(g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_cnt].SObjID);
            } catch {
                return "FAIL";
            }
        }

        var notch_no = get_notch_no(modules, p_pog_index, shelfs.Y + shelfs.H / 2); //ASA-1371_26842

        shelfs.NotchNo = notch_no;
        p_shelf_obj.NotchNo = notch_no;

        if (p_carpark_ind == "N" && g_show_notch_label == "Y") {
            if (p_label_ind == "Y") {
                //ASA-1234 -- Update notch details even if notch label not called
                if (typeof shelfs.NotchLabelObjID !== "undefined" && shelfs.NotchLabelObjID !== -1) {
                    var label_obj = p_shelf_obj.getObjectById(shelfs.NotchLabelObjID);
                    p_shelf_obj.remove(label_obj);
                }

                var hex_color = shelfs.Color;
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
                // ASA-1095
                if (notch_label == "CENTER") {
                    text_color = getTextColor(red, green, blue);
                } else {
                    text_color = "#000000";
                }

                var return_obj = addlabelText(p_notchHead + " " + notch_no, g_labelFont, g_labelActualSize, text_color, "center", "");
                p_shelf_obj.add(return_obj);
                // return_obj.position.y = -0.005;
                if (shelfs.Rotation !== 0 || shelfs.Slope !== 0) {
                    return_obj.position.z = shelfs.D / 2 + 0.005;
                } else {
                    return_obj.position.z = 0.005; // 0.0005 --ASA-1095
                }

                // return_obj.position.x = 0 - (shelfs.W / 4 + 0.01);
                [posX, posY] = getLabelPosition(shelfs, "S", notch_label); // ASA-1095
                return_obj.position.x = posX;
                return_obj.position.y = posY;
                g_pog_json[p_pog_index].ModuleInfo[p_mod_index].ShelfInfo[p_shelf_cnt].NotchLabelObjID = return_obj.id;
            } else {
                if (typeof shelfs.NotchLabelObjID !== "undefined" && shelfs.NotchLabelObjID !== -1) {
                    var label_obj = p_shelf_obj.getObjectById(shelfs.NotchLabelObjID);
                    p_shelf_obj.remove(label_obj);
                }
            }
        }
    }
    return "SUCCESS";
}

function get_module_max_merch(p_module_index, p_shelf_index, p_pog_index, p_byPassMedicineOverhung = "N", p_item_index = 0 /*ASA-1892 Issue2 added p_item_index*/) {
    // Regression 2 added p_byPassMedicineOverhung
    try {
        var l_max_merch = 0;
        var basket_height = 0;
        var l_first_max = 0;
        var l_min_merch = 0;
        var index_arr = [];
        var moduledtl = g_pog_json[p_pog_index].ModuleInfo[p_module_index];
        var shelfdtl = moduledtl.ShelfInfo[p_shelf_index];
        var itemdtl = shelfdtl.ItemInfo[p_item_index]; //ASA-1892 Issue2
        var item_start = wpdSetFixed(itemdtl?.X - itemdtl?.W / 2); //ASA-1892 Issue2
        var item_end = wpdSetFixed(itemdtl?.X + itemdtl?.W / 2); //ASA-1892 Issue2

        var l_object_type = shelfdtl.ObjType;

        if (shelfdtl.MaxMerch !== 0) {
            l_first_max = shelfdtl.MaxMerch;
        }
        var shelf_y = shelfdtl.Y + shelfdtl.H / 2;
        var shelf_start = wpdSetFixed(shelfdtl.X - shelfdtl.W / 2); //.toFixed(3));
        var shelf_end = wpdSetFixed(shelfdtl.X + shelfdtl.W / 2); //.toFixed(3));
        var shelf_z = wpdSetFixed(shelfdtl.Z + shelfdtl.D / 2); //ASA-1776

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
                            var div_start = wpdSetFixed(Shelf.X - Shelf.W / 2); //.toFixed(3));
                            var div_end = wpdSetFixed(Shelf.X + Shelf.W / 2); //.toFixed(3));
                            if (p_shelf_index !== i && Shelf.Y + Shelf.H / 2 < shelf_y && ((shelf_start >= div_start && shelf_start <= div_end) || (shelf_end <= div_start && shelf_end >= div_end) || (shelf_start >= div_start && shelf_end <= div_end) || (div_start >= shelf_start && div_end <= shelf_end))) {
                                min_distance_arr.push(shelf_y - (Shelf.Y + Shelf.H / 2));
                                index_arr.push(i);
                            }
                        }
                        i++;
                    }
                } else {
                    //ASA-1892 Issue2 Start
                    for (var i = 0; i < moduledtl.ShelfInfo.length; i++) {
                        const Shelf = moduledtl.ShelfInfo[i];
                        //ASA-1892 Issue1 Start
                        if (Shelf.ObjType !== "BASE" && Shelf.ObjType !== "NOTCH" && Shelf.ObjType !== "DIVIDER" && Shelf.ObjType !== "TEXTBOX") {
                            var div_end = wpdSetFixed(Shelf.X + Shelf.W / 2); //.toFixed(3));
                            var div_start = wpdSetFixed(Shelf.X - Shelf.W / 2); //.toFixed(3));
                            if (Shelf.W < moduledtl.W && (item_start > div_end || item_end < div_start)) {
                                continue;
                            }
                            //ASA-1776 -- Add one condition shelf_z <= wpdSetFixed(Shelf.Z + Shelf.D / 2)  // Regression 2 added p_byPassMedicineOverhung Condition
                            if (((shelf_z <= wpdSetFixed(Shelf.Z + Shelf.D / 2) && p_byPassMedicineOverhung == "Y") || p_byPassMedicineOverhung == "N") && p_shelf_index !== i && Shelf.Y - Shelf.H / 2 > shelf_y && Shelf.Y <= moduledtl.H + g_pog_json[p_pog_index].BaseH) {
                                min_distance_arr.push(Shelf.Y - Shelf.H / 2 - shelf_y);
                                index_arr.push(i);
                            }
                        }
                        //ASA-1892 Issue1 End
                    }
                    //ASA-1892 Issue2 End
                }
            }
            if (min_distance_arr.length == 0) {
                shelfdtl.Topmerch = "Y";
                l_max_merch = moduledtl.H + g_pog_json[p_pog_index].BaseH - shelf_y;
            } else {
                shelfdtl.Topmerch = "N"; //ASA-1729
                l_max_merch = Math.min.apply(Math, min_distance_arr);
                var index = min_distance_arr.findIndex(function (number) {
                    return number == l_max_merch;
                });
                if (moduledtl.ShelfInfo[index_arr[index]].ObjType == "HANGINGBAR") {
                }
            }
        } else {
            shelfdtl.Topmerch = "Y"; //ASA-1729
            l_max_merch = moduledtl.H + g_pog_json[p_pog_index].BaseH - shelf_y;
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
        return wpdSetFixed(l_min_merch); //.toFixed(5)); //Task_27323 regression 7 toFixed(3) added beacuse at backend value come 0.1601 and in js 0.16 due to tofixed(3)
    } catch (err) {
        error_handling(err);
        throw err;
    }
}